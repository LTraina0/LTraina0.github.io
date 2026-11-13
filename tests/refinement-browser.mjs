import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {makeStudy} from '../architect/v2/laboratory.mjs';
import frozen from './fixtures/release-021.json' with {type:'json'};
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.env.SITE_URL||'http://127.0.0.1:4384',dir=path.resolve(process.env.QA_DIR||'../../output/architect-022');
await mkdir(dir,{recursive:true});
const master=makeStudy({study:'facade',edition:'B',distribution:'contextual'});
const historical=process.env.AUDIT_CAPTURE_FILE?JSON.parse(await readFile(process.env.AUDIT_CAPTURE_FILE,'utf8')):null;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--enable-unsafe-swiftshader','--force-color-profile=srgb']});
const errors=[],results={root,variants:[],captures:[],errors};
try{
 const page=await browser.newPage({viewport:{width:1280,height:1040},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(root+'/?build=fachada-022');
 await page.waitForFunction(()=>window.BuildsMineInspector?.snapshot().ready,{timeout:60000});
 const act=(id,value)=>page.evaluate(({id,value})=>BuildsMineInspector.execute('buildsmine_view',{id,value}),{id,value});
 const close=(a,b)=>a.every((v,i)=>Math.abs(v-b[i])<1e-8);
 for(let i=0;i<2;i++){
   const box=await page.locator('.lab-pane:not([hidden]) canvas').boundingBox();
   if(box.height!==760)await page.setViewportSize({width:1280,height:page.viewportSize().height+760-box.height});
 }
 const capture=async(name,view='perspective',frame=master.blocks,filter=null)=>{
  const actual=await page.evaluate(async({view,frame,filter})=>{
   const s=buildsMine.scene;s.select(null);document.querySelector('#view').value=view;s.fit(view,frame);
   if(filter)s.filter(new Set(buildsMine.model.blocks.filter(b=>b.x===filter.x)));
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   const lights=[];s.scene.traverse(o=>{if(o.isLight)lights.push({type:o.type,intensity:o.intensity,color:o.color.getHex(),position:o.position.toArray()});});
   return {projection:s.camera.projectionMatrix.toArray(),world:s.camera.matrixWorld.toArray(),camera:BuildsMineInspector.snapshot().camera,
     lights,theme:BuildsMineInspector.snapshot().theme,datums:buildsMine.model.datums??null};
  },{view,frame,filter});
  const canvas=page.locator('.lab-pane:not([hidden]) canvas'),box=await canvas.boundingBox();
  assert.equal(box.width,1250);assert.equal(box.height,760);
  if(historical&&!filter&&frame===master.blocks){
    const label={front:'frontal',back:'posterior',left:'lateral-esquerda',right:'lateral-direita',top:'superior',bottom:'inferior',perspective:'perspectiva'}[view];
    const old=historical.records.find(r=>r.edition==='B'&&r.name===label);
    assert.ok(close(actual.projection,old.projection));assert.ok(close(actual.world,old.world));
    assert.deepEqual(actual.lights,old.lights);assert.equal(actual.theme,old.theme);
  }
  await canvas.screenshot({path:path.join(dir,name+'.png')});results.captures.push({name,view,width:box.width,height:box.height,...actual});
 };
 const variants=[
  ['R1',{console:'balanced',capital:'timber',surface:'mineral'}],
  ['R2',{console:'fan',capital:'timber',surface:'mineral'}],
  ['R3',{console:'balanced',capital:'anvil',surface:'mineral'}],
  ['R4',{console:'balanced',capital:'timber',surface:'patina'}]
 ];
 for(const console of ['balanced','fan'])for(const capital of ['timber','anvil'])for(const surface of ['mineral','patina']){
  for(const [field,value] of Object.entries({console,capital,surface}))await act('lab-'+field,value);
  const m=await page.evaluate(()=>buildsMine.model);
  assert.deepEqual(m,makeStudy({study:'refined',console,capital,surface}));
  assert.deepEqual(await page.evaluate(()=>buildsMine.assets.failures),[]);
  results.variants.push({id:m.studyId,blocks:m.blocks.length,materials:Object.keys(m.materials).length,datums:m.datums});
 }
 for(const [label,configuration] of [['B021',null],...variants]){
  if(configuration){
   await act('lab-study','refined');for(const [k,v] of Object.entries(configuration))await act('lab-'+k,v);
  }else{
   await act('lab-study','facade');await act('lab-edition','B');await act('lab-distribution','contextual');
  }
  await act('part','all');await act('mode','all');
  for(const view of ['front','back','left','right','top','bottom','perspective'])await capture(label+'-'+view,view);
  if(label==='B021'||label==='R1'){
    for(const [name,min,max] of [
      ['frontao',[-5,16,2],[5,25,8]],['consolos',[6,7,2],[13,21,8]],
      ['faixa-superior',[-9,9,1],[9,21,6]],['acesso',[-4,1,-6],[4,11,7]]
    ])await capture(label+'-detalhe-'+name,'perspective',[{x:min[0],y:min[1],z:min[2]},{x:max[0]-1,y:max[1]-1,z:max[2]-1}]);
    for(const y of [12,17]){await act('mode','layer');await act('step',String(y));await capture(label+'-corte-Y'+y);}
    await act('mode','all');await capture(label+'-secao-X1','right',master.blocks,{x:1});await act('mode','all');
  }
 }
 await act('lab-study','refined');for(const [k,v]of Object.entries(variants[0][1]))await act('lab-'+k,v);
 await act('lab-compare','facade-B-contextual');await page.waitForFunction(()=>buildsMine.lab.reference);
 assert.ok(await page.evaluate(()=>buildsMine.scene.camera.position.distanceTo(buildsMine.lab.referenceScene.camera.position)<1e-8));
 await page.locator('#canvas').screenshot({path:path.join(dir,'antes-depois.png')});
 for(const module of ['capital','upperEnvelope','brackets','gables','opening','balustrade']){
  await act('part',module);assert.ok(await page.evaluate(()=>BuildsMineInspector.snapshot().visible>0));
  const b=await page.evaluate(()=>[...buildsMine.visible][0]);
  await page.evaluate(b=>BuildsMineInspector.execute('buildsmine_select',{x:b.x,y:b.y,z:b.z}),b);
 }
 await act('part','all');await act('lab-compare','off');await page.click('#theme');
 await page.locator('#canvas').screenshot({path:path.join(dir,'noite.png')});
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:path.join(dir,'mobile.png')});
 for(const [id,hash] of Object.entries(frozen.models)){
   const response=await page.request.get(root+'/modelos/atelier/'+id+'.json');assert.ok(response.ok());
   assert.equal(createHash('sha256').update(await response.body()).digest('hex'),hash);
 }
 results.frozenModels=Object.keys(frozen.models).length;
 assert.deepEqual(errors,[]);await writeFile(path.join(dir,'browser.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify({variants:results.variants.length,captures:results.captures.length,frozen:results.frozenModels,errors}));
}finally{await browser.close();}
