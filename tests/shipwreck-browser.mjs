import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import frozen from './fixtures/release-022.json' with {type:'json'};
import {makeStudy} from '../architect/v2/laboratory.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.env.SITE_URL||'http://127.0.0.1:4385',dir=path.resolve(process.env.QA_DIR||'../../output/ship-03');await mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--enable-unsafe-swiftshader','--force-color-profile=srgb']});
const result={root,captures:[],models:[],errors:[]};
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});page.on('pageerror',e=>result.errors.push(e.message));
 await page.goto(root+'/?build=naufragio-03');await page.waitForFunction(()=>window.BuildsMineInspector?.snapshot().ready,{timeout:60000});
 const act=(id,value)=>page.evaluate(({id,value})=>BuildsMineInspector.execute('buildsmine_view',{id,value}),{id,value});
 const capture=async(name,view='perspective',frame=null)=>{
  const state=await page.evaluate(async({view,frame})=>{buildsMine.scene.select(null);document.querySelector('#view').value=view;buildsMine.scene.fit(view,frame||buildsMine.model.blocks);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return {snapshot:BuildsMineInspector.snapshot(),projection:buildsMine.scene.camera.projectionMatrix.toArray(),world:buildsMine.scene.camera.matrixWorld.toArray()};},{view,frame});
  await page.locator('.lab-pane:not([hidden]) canvas').screenshot({path:path.join(dir,name+'.png')});result.captures.push({name,view,...state});
 };
 for(const composition of ['haven','rift','drift'])for(const condition of ['weathered','repaired']){
  await act('lab-composition',composition);await act('lab-condition',condition);
  const m=await page.evaluate(()=>buildsMine.model);assert.deepEqual(m,makeStudy({study:'shipwreck',composition,condition}));assert.deepEqual(await page.evaluate(()=>buildsMine.assets.failures),[]);
  result.models.push({id:m.studyId,blocks:m.blocks.length,materials:m.materials,bounds:m.bounds});
 }
 const frame=[{x:-39,y:0,z:-38},{x:33,y:24,z:51}];
 for(const composition of ['haven','rift','drift']){
  await act('lab-composition',composition);await act('lab-condition','weathered');
  for(const view of ['perspective','front','back','left','right','top','bottom'])await capture(composition+'-'+view,view,frame);
 }
 await act('lab-composition','haven');await act('lab-environment','naval');
 assert.ok(await page.evaluate(()=>[...buildsMine.visible].every(b=>b.module!=='context')));await capture('haven-sem-gelo','perspective',frame);
 await act('lab-environment','context');assert.ok(await page.evaluate(()=>[...buildsMine.visible].every(b=>b.module==='context')));
 await act('lab-environment','all');
 for(const [name,min,max]of [['popa',[-19,1,-36],[11,24,-5]],['ruptura',[-18,1,-18],[12,17,3]],['cabine',[-11,8,-32],[4,17,-19]],['acessorios',[-5,9,-20],[3,14,-12]],['costado',[9,0,-2],[29,13,19]]])await capture(name,'perspective',[{x:min[0],y:min[1],z:min[2]},{x:max[0],y:max[1],z:max[2]}]);
 for(const y of [3,9,12,15]){await act('mode','layer');await act('step',String(y));await capture('corte-Y'+y,'perspective',frame);}
 await act('mode','layer');await act('step','14');await capture('interior-Y14','top',[{x:-12,y:8,z:-33},{x:4,y:16,z:-19}]);
 await act('mode','all');
 await page.evaluate(()=>buildsMine.scene.filter(new Set(buildsMine.model.blocks.filter(b=>b.x===-4))));await capture('secao-longitudinal-X-4','right',[{x:-19,y:0,z:-39},{x:10,y:23,z:5}]);await act('mode','all');
 await capture('proposta-principal','perspective');
 for(const module of ['hull','frames','cabin','quarterdeck','masts','rigging','accessories','side-fragment']){
  await act('part',module);assert.ok(await page.evaluate(()=>buildsMine.visible.size>0));const b=await page.evaluate(()=>[...buildsMine.visible][0]);await page.evaluate(b=>BuildsMineInspector.execute('buildsmine_select',{x:b.x,y:b.y,z:b.z}),b);
 }
 await act('part','all');await act('lab-compare','shipwreck-rift-weathered');await page.waitForFunction(()=>buildsMine.lab.reference);await page.locator('#canvas').screenshot({path:path.join(dir,'comparacao.png')});
 await act('lab-compare','off');await page.click('#theme');await capture('noite','perspective',frame);
 await page.click('#materials');assert.ok(await page.locator('#material-list .material-row').count()>10);await page.click('#close-materials');
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(dir,'mobile.png')});
 for(const[id,hash]of Object.entries(frozen.models)){const r=await page.request.get(root+'/modelos/atelier/'+id+'.json');assert.ok(r.ok());assert.equal(createHash('sha256').update(await r.body()).digest('hex'),hash);}
 result.preserved=Object.keys(frozen.models).length;assert.deepEqual(result.errors,[]);await writeFile(path.join(dir,'browser.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({models:result.models.length,captures:result.captures.length,preserved:result.preserved,errors:result.errors}));
}finally{await browser.close();}
