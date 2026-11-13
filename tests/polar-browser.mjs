import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.SITE_URL||'http://127.0.0.1:4399';
const output=path.resolve(process.env.QA_DIR||'../../output/andorinha-polar');
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--enable-unsafe-swiftshader','--force-color-profile=srgb']});
const report={origin,checks:[],screenshots:[],errors:[],http:{}};
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
try{
  const page=await browser.newPage({viewport:{width:1500,height:960}});
  page.on('pageerror',error=>report.errors.push(error.message));
  const response=await page.goto(origin+'/?build=andorinha-polar');
  assert.equal(response.status(),200);
  await page.waitForFunction(()=>window.BuildsMineInspector?.snapshot().ready&&window.buildsMine?.variant==='polar-main',null,{timeout:120000});
  const initial=await page.evaluate(()=>BuildsMineInspector.snapshot());
  report.initial=initial;
  report.culling=await page.evaluate(()=>({
    sourceInstances:buildsMine.model.blocks.length,
    drawnInstances:buildsMine.scene.batches.reduce((sum,batch)=>sum+batch.mesh.count,0),
    fullTriangles:buildsMine.scene.batches.reduce((sum,batch)=>sum+(batch.mesh.geometry.index.count/3)*batch.blocks.length,0),
    drawnTriangles:buildsMine.scene.batches.reduce((sum,batch)=>sum+(batch.mesh.geometry.index.count/3)*batch.mesh.count,0)
  }));
  assert.ok(report.culling.drawnInstances<report.culling.sourceInstances);
  assert.deepEqual(initial.rendering.textureFailures,[]);
  assert.equal(initial.project,'andorinha-polar');
  const size=initial.blocks;
  assert.ok(size>4321);
  const save=async name=>{const file=name+'.png';await page.screenshot({path:path.join(output,file)});report.screenshots.push(file);};
  const frame=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await save('conjunto');
  const camera=await page.evaluate(()=>JSON.stringify(BuildsMineInspector.snapshot().camera));
  for(const [value,expected] of [['naval',4321],['context',size-4321],['all',size]]){
    await page.selectOption('#lab-environment',value);await frame();
    const snapshot=await page.evaluate(()=>BuildsMineInspector.snapshot());
    assert.equal(snapshot.visible,expected,value);
    assert.equal(JSON.stringify(snapshot.camera),camera,'A câmera mudou ao ocultar um grupo');
    await save('contexto-'+value);
  }
  report.checks.push('Conjunto, ambiente e navio isolados conservam a câmera');
  const modules=await page.locator('#part option').evaluateAll(options=>options.map(o=>o.value));
  for(const module of ['env-rock','env-channel','env-floes','env-glacier','env-snow','env-ruins','env-access','env-light']){
    assert.ok(modules.includes(module),module);
    await page.selectOption('#part',module);await frame();
    assert.ok((await page.evaluate(()=>BuildsMineInspector.snapshot())).visible>0,module);
  }
  await page.selectOption('#part','all');
  report.checks.push('Oito módulos ambientais isoláveis');
  for(const view of ['front','back','left','right','top','bottom','perspective']){
    await page.selectOption('#view',view);await frame();
    await save('vista-'+view);
  }
  report.checks.push('Seis vistas ortográficas e perspectiva');
  const interior=await page.evaluate(()=>{
    const {model,assets,scene}=buildsMine;
    const cubes=model.blocks.filter(b=>assets.isOpaqueCube(b));
    const cells=new Map(cubes.map(b=>[[b.x,b.y,b.z].join(','),b]));
    const drawn=new Set(scene.batches.flatMap(b=>b.mesh.userData.active));
    const b=cubes.find(b=>b.environment&&!drawn.has(b)&&b.y<0&&[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].every(([dx,dy,dz])=>cells.has([b.x+dx,b.y+dy,b.z+dz].join(','))));
    return b?{x:b.x,y:b.y,z:b.z}:null;
  });
  assert.ok(interior,'Nenhum bloco interior disponível para provar restauração do corte');
  await page.selectOption('#mode','layer');
  await page.evaluate(y=>{const el=document.querySelector('#step');el.value=String(y);el.dispatchEvent(new Event('input',{bubbles:true}));},interior.y);
  await frame();
  assert.ok(await page.evaluate(({x,y,z})=>buildsMine.scene.batches.some(batch=>batch.mesh.userData.active.some(b=>b.x===x&&b.y===y&&b.z===z)),interior),'Corte deixou um buraco ao ocultar vizinho superior');
  report.checks.push('O corte revela os cubos internos antes ocultos pelo desempenho');
  await page.selectOption('#mode','all');
  await page.selectOption('#mode','layer');await page.click('#prev');await frame();
  assert.ok((await page.evaluate(()=>BuildsMineInspector.snapshot())).visible<size);
  await save('corte-altura');
  await page.selectOption('#mode','stage');await page.click('#prev');await frame();
  assert.ok((await page.evaluate(()=>BuildsMineInspector.snapshot())).visible<size);
  await page.selectOption('#mode','all');
  report.checks.push('Cortes por altura e etapas construtivas');
  await page.click('#materials');await page.locator('#material-list .material-row').first().waitFor();await save('materiais');await page.click('#close-materials');
  await page.click('#theme');await frame();assert.equal((await page.evaluate(()=>BuildsMineInspector.snapshot())).theme,'night');await save('noite');
  await page.setViewportSize({width:390,height:844});await save('mobile');
  for(const url of ['/andorinha-polar/model.json','/inspecao/dados/polar-main.json','/andorinha-carpintaria/displaced.json','/modelos/release.json']){
    const res=await page.request.get(origin+url);assert.equal(res.status(),200,url);
    const bytes=await res.body();report.http[url]={status:res.status(),sha256:hash(bytes),bytes:bytes.length};
    if(url==='/andorinha-polar/model.json')assert.equal(hash(bytes),hash(await readFile(process.env.EXPECTED_MODEL||new URL('../dist/andorinha-polar/model.json',import.meta.url))));
  }
  assert.deepEqual(report.errors,[]);
  report.final=await page.evaluate(()=>BuildsMineInspector.snapshot());
  await writeFile(path.join(output,'validacao-browser.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({origin,cells:size,checks:report.checks,culling:report.culling,http:report.http,errors:report.errors}));
}finally{await browser.close();}
