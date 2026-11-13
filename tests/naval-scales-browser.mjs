import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {unpackModel} from '../architect/v2/transport.mjs';

// Usage: SITE_URL, QA_DIR, PLAYWRIGHT_MODULE and CHROMIUM_PATH follow the other
// browser suites. The frozen manifest MUST be copied before rebuilding dist.
// This suite does not modify generators, source data, worlds or installations.
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=(process.env.SITE_URL||'http://127.0.0.1:4384').replace(/\/$/,''),
  dir=path.resolve(process.env.QA_DIR||'../../output/estudos-navais'),
  baselinePath=path.resolve(process.env.BASELINE_RELEASE||'tests/fixtures/release-030.json');
const specimens=['hull','breach','deck'],resolutions=['compact','middle','large'];
const views=(process.env.NAVAL_VIEWS||'perspective,front,back,left,right,top,bottom').split(',');
assert.ok(views.length&&views.every(v=>['perspective','front','back','left','right','top','bottom'].includes(v)),'NAVAL_VIEWS inválido');
const renderSamples=Number(process.env.NAVAL_RENDER_SAMPLES||30);
assert.ok(Number.isInteger(renderSamples)&&renderSamples>=5&&renderSamples<=120,'Número de amostras inválido');
await mkdir(dir,{recursive:true});await mkdir(path.join(dir,'models'),{recursive:true});
const frozen=JSON.parse(await readFile(baselinePath,'utf8'));
assert.equal(Object.keys(frozen.models).length,208,'O manifesto congelado deve conter os 208 modelos anteriores, não o dist reconstruído');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,
  args:['--enable-unsafe-swiftshader','--force-color-profile=srgb']});
const report={schema:'buildsmine.naval-scale-browser/1',startedAt:new Date().toISOString(),root,
  browserVersion:browser.version(),viewport:{width:1280,height:1040,deviceScaleFactor:1},
  conditions:{theme:'day',colorProfile:'sRGB',canvasHeight:760,
    camera:'Same world-space envelope for all three resolutions of each specimen; exact projection and camera-world matrices checked.',
    lighting:'The same hemisphere/directional day rig is checked. Model-local lamps, if any, remain part of each specimen and their positions/intensities are recorded separately.',
    additionalCloseups:'The perspective-fitted capture fits each individual model and is NOT an equal-scale comparison.',
    loadTiming:'Host wall time from page navigation to inspector/model ready. One shared browser context; HTTP and GPU/shader caches are not reset, so this is not a cold-cache benchmark.',
    renderTiming:'Warm explicit renderer.render followed by WebGL finish, in a foreground headless browser. CPU submission plus synchronized GPU completion; NOT a GPU-only timer or Minecraft FPS.',
    rafTiming:'Observed requestAnimationFrame interval while explicitly rendering. Browser/headless cadence, not a guarantee of interactive FPS or mobile performance.'},
  frozen:{path:baselinePath,release:frozen.release,sourceCommit:frozen.sourceCommit,expected:208},
  variants:[],captures:[],checks:[],pageErrors:[],consoleErrors:[],failedRequests:[],httpFailures:[]};
const frames={},cameraMasters=new Map(),models=new Map();
let page;
const close=(a,b)=>a.length===b.length&&a.every((n,i)=>Math.abs(n-b[i])<1e-8);
function envelope(items){
  const min=[0,1,2].map(i=>Math.min(...items.map(m=>m.bounds.min[i]))),max=[0,1,2].map(i=>Math.max(...items.map(m=>m.bounds.max[i])));
  return [{x:min[0],y:min[1],z:min[2]},{x:max[0],y:max[1],z:max[2]}];
}
async function act(id,value){
  return page.evaluate(({id,value})=>window.BuildsMineInspector.execute('buildsmine_view',{id,value:String(value)}),{id,value});
}
async function ready(id){
  await page.waitForFunction(id=>window.BuildsMineInspector?.snapshot().ready&&window.buildsMine?.ready&&window.buildsMine?.model?.studyId===id,id,{timeout:90000});
}
async function stableCanvas(){
  const canvas=page.locator('.lab-pane:not([hidden]) canvas');assert.equal(await canvas.count(),1,'A prévia primária deve ter um canvas');
  for(let i=0;i<3;i++){
    const b=await canvas.boundingBox();if(Math.abs(b.height-760)<.1)break;
    await page.setViewportSize({width:1280,height:Math.round(page.viewportSize().height+760-b.height)});
  }
  const b=await canvas.boundingBox();assert.ok(b.width>=1000);assert.ok(Math.abs(b.height-760)<.1);
  report.viewport.height=page.viewportSize().height;return canvas;
}
async function capture({name,specimen,resolution,view='perspective',frame=frames[specimen],kind='common-frame',compareMatrices=true}){
  const actual=await page.evaluate(async({frame,view})=>{
    const s=window.buildsMine.scene;s.select(null);document.querySelector('#view').value=view;s.fit(view,frame);
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const lights=[];s.scene.traverse(o=>{if(o.isLight)lights.push({type:o.type,intensity:o.intensity,color:o.color.getHex(),position:o.position.toArray(),visible:o.visible});});
    return {projection:s.camera.projectionMatrix.toArray(),world:s.camera.matrixWorld.toArray(),
      camera:window.BuildsMineInspector.snapshot().camera,lights,theme:window.BuildsMineInspector.snapshot().theme,
      visible:window.buildsMine.visible.size,rendering:window.BuildsMineInspector.snapshot().rendering};
  },{frame,view});
  assert.equal(actual.theme,'day');
  if(compareMatrices){
    const key=specimen+'/'+view,master=cameraMasters.get(key);
    const staticLights=actual.lights.filter(l=>['HemisphereLight','DirectionalLight'].includes(l.type));
    if(master){assert.ok(close(actual.projection,master.projection),name+' projection');assert.ok(close(actual.world,master.world),name+' world');assert.deepEqual(staticLights,master.staticLights,name+' static light rig');}
    else cameraMasters.set(key,{...actual,staticLights});
  }
  const canvas=await stableCanvas(),box=await canvas.boundingBox();
  await canvas.screenshot({path:path.join(dir,name+'.png')});
  report.captures.push({file:name+'.png',specimen,resolution,view,kind,width:box.width,height:box.height,...actual});
}
async function performanceSample(){
  return page.evaluate(async count=>{
    const s=window.buildsMine.scene,r=s.renderer,gl=r.getContext();
    if(gl.isContextLost())throw Error('WebGL context lost');
    // Warm shaders and buffers before sampling. finish deliberately serializes work.
    for(let i=0;i<8;i++){r.render(s.scene,s.camera);gl.finish();}
    const samples=[];
    for(let i=0;i<count;i++){
      const start=performance.now();r.render(s.scene,s.camera);gl.finish();samples.push(performance.now()-start);
    }
    const sorted=[...samples].sort((a,b)=>a-b),stats=values=>{
      const a=[...values].sort((a,b)=>a-b),round=n=>Math.round(n*1000)/1000;
      return {samples:values.length,min:round(a[0]),median:round(a[Math.floor(a.length/2)]),mean:round(a.reduce((x,y)=>x+y,0)/a.length),p95:round(a[Math.min(a.length-1,Math.ceil(a.length*.95)-1)]),max:round(a.at(-1))};
    };
    const rafIntervals=[];let previous;
    await new Promise(resolve=>{
      let remaining=25;
      function tick(now){if(previous!==undefined)rafIntervals.push(now-previous);previous=now;r.render(s.scene,s.camera);if(--remaining)requestAnimationFrame(tick);else resolve();}
      requestAnimationFrame(tick);
    });
    gl.finish();
    const ext=gl.getExtension('WEBGL_debug_renderer_info');
    const detail={renderAndFinishMs:stats(sorted),rafIntervalMs:stats(rafIntervals),
      gpuTimerAvailable:!!gl.getExtension('EXT_disjoint_timer_query_webgl2'),
      webgl:{version:gl.getParameter(gl.VERSION),shadingLanguage:gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),
        vendor:ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR)},
      drawCalls:r.info.render.calls,triangles:r.info.render.triangles,geometries:r.info.memory.geometries,textures:r.info.memory.textures,
      instancedMeshes:s.batches.length,visibleInstances:s.batches.reduce((n,b)=>n+b.mesh.count,0)};
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const frame=r.info.render.frame;await new Promise(resolve=>setTimeout(resolve,250));detail.idleFrames250ms=r.info.render.frame-frame;
    return detail;
  },renderSamples);
}
try{
  const context=await browser.newContext({viewport:{width:1280,height:1040},deviceScaleFactor:1});page=await context.newPage();
  page.on('pageerror',e=>report.pageErrors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});
  page.on('requestfailed',r=>report.failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
  page.on('response',r=>{if(r.status()>=400)report.httpFailures.push({url:r.url(),status:r.status()});});
  const releaseResponse=await page.request.get(root+'/modelos/release.json');assert.ok(releaseResponse.ok());
  const current=await releaseResponse.json();report.release={version:current.release,sourceCommit:current.sourceCommit,models:Object.keys(current.models).length};
  for(const specimen of specimens)for(const resolution of resolutions){
    const id='sections-'+specimen+'-'+resolution,response=await page.request.get(root+'/modelos/atelier/'+id+'.json');
    assert.equal(response.status(),200,'Modelo ausente '+id);const bytes=await response.body(),digest=hash(bytes),model=unpackModel(JSON.parse(bytes));
    assert.equal(current.models[id],digest,'Manifesto divergente '+id);assert.equal(model.studyId,id);assert.ok(model.blocks.length);
    models.set(id,model);await writeFile(path.join(dir,'models',id+'.json'),bytes);
  }
  for(const specimen of specimens)frames[specimen]=envelope(resolutions.map(resolution=>models.get('sections-'+specimen+'-'+resolution)));
  report.commonFrames=frames;
  for(const specimen of specimens)for(const resolution of resolutions){
    const id='sections-'+specimen+'-'+resolution,model=models.get(id),navigationStart=performance.now();
    const url=root+'/?build=estudos-navais&study=sections&specimen='+specimen+'&resolution='+resolution+'&theme=day';
    const navigation=await page.goto(url);assert.equal(navigation.status(),200);await ready(id);
    const loadToReadyMs=performance.now()-navigationStart;
    assert.deepEqual(await page.evaluate(()=>window.buildsMine.model),model,'Dados da UI diferentes do JSON canônico');
    assert.deepEqual(await page.evaluate(()=>window.buildsMine.assets.failures),[],'Textura indisponível');
    assert.equal(await page.locator('#build').inputValue(),'estudos-navais');
    assert.equal(await page.locator('#lab-study').inputValue(),'sections');
    assert.equal(await page.locator('#lab-specimen').inputValue(),specimen);assert.equal(await page.locator('#lab-resolution').inputValue(),resolution);
    await stableCanvas();await act('part','all');await act('mode','all');
    for(const view of views)await capture({name:id+'-'+view,specimen,resolution,view});
    await capture({name:id+'-perspective-fitted',specimen,resolution,frame:envelope([model]),kind:'individual-fit-not-equal-scale',compareMatrices:false});
    // Restore the controlled common perspective for measurements.
    await page.evaluate(frame=>{const s=window.buildsMine.scene;document.querySelector('#view').value='perspective';s.fit('perspective',frame);},frames[specimen]);
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const perf=await performanceSample(),moduleCounts={};for(const b of model.blocks)moduleCounts[b.module]=(moduleCounts[b.module]??0)+1;
    const variant={id,specimen,resolution,blocks:model.blocks.length,bounds:model.bounds,materials:model.materials,modules:moduleCounts,
      parameters:model.params,validation:model.validation,loadToReadyMs:Math.round(loadToReadyMs*1000)/1000,performance:perf};
    report.variants.push(variant);assert.equal(perf.visibleInstances,model.blocks.length);
    await page.click('#materials');assert.ok(await page.locator('#material-dialog').isVisible());
    const rows=await page.locator('.material-row').evaluateAll(rows=>Object.fromEntries(rows.map(row=>[row.title,Number(row.querySelector('strong').textContent)])));
    assert.deepEqual(rows,model.materials,'Inventário visual divergente');await page.screenshot({path:path.join(dir,id+'-materials.png')});
    report.captures.push({file:id+'-materials.png',specimen,resolution,kind:'materials-dialog'});await page.click('#close-materials');
    const distinctY=[...new Set(model.blocks.map(b=>b.y))].sort((a,b)=>a-b),cutY=distinctY[Math.floor((distinctY.length-1)/2)];
    await act('mode','layer');await act('step',cutY);
    const expectedCut=model.blocks.filter(b=>b.y<=cutY).length;assert.equal(await page.evaluate(()=>window.buildsMine.visible.size),expectedCut);
    variant.cut={height:cutY,visible:expectedCut,nontrivial:expectedCut<model.blocks.length,distinctCellLayers:distinctY.length};
    await capture({name:id+'-cut-Y'+cutY,specimen,resolution,kind:'horizontal-cell-layer-cut'});await act('mode','all');
    const isolate=Object.entries(moduleCounts).filter(([id])=>id!=='context').sort((a,b)=>b[1]-a[1])[0];assert.ok(isolate,'Módulo naval ausente');
    await act('part',isolate[0]);assert.equal(await page.evaluate(()=>window.buildsMine.visible.size),isolate[1]);
    await capture({name:id+'-module-'+isolate[0],specimen,resolution,kind:'isolated-module'});
    const block=await page.evaluate(()=>[...window.buildsMine.visible][0]);
    const selection=await page.evaluate(({x,y,z})=>window.BuildsMineInspector.execute('buildsmine_select',{x,y,z}),block);
    assert.deepEqual([selection.x,selection.y,selection.z],[block.x,block.y,block.z]);assert.deepEqual(selection.states,block.states);
    variant.isolation={module:isolate[0],blocks:isolate[1],selection};await act('part','all');
    const stages=[...new Set(model.modules.map(m=>m.stage))].sort((a,b)=>a-b);await act('mode','stage');await act('step',stages[0]);
    assert.equal(await page.evaluate(()=>window.buildsMine.visible.size),model.blocks.filter(b=>model.modules.find(m=>m.id===b.module).stage<=stages[0]).length);
    await act('step',stages.at(-1));assert.equal(await page.evaluate(()=>window.buildsMine.visible.size),model.blocks.length);await act('mode','all');
    report.checks.push(id+' · dados, vistas, materiais, corte, isolamento, seleção e etapas');
    console.log(JSON.stringify({variant:id,blocks:variant.blocks,drawCalls:perf.drawCalls,triangles:perf.triangles,loadToReadyMs:variant.loadToReadyMs}));
  }
  let cursor=0;const legacy=Object.entries(frozen.models),failures=[];
  await Promise.all(Array.from({length:6},async()=>{
    while(cursor<legacy.length){const [id,expected]=legacy[cursor++];
      try{const response=await page.request.get(root+'/modelos/atelier/'+id+'.json');assert.equal(response.status(),200);const actual=hash(await response.body());assert.equal(actual,expected);assert.equal(current.models[id],expected);}
      catch(error){failures.push({id,error:String(error)});}
    }
  }));
  report.frozen.checked=legacy.length;report.frozen.failures=failures;assert.deepEqual(failures,[],'Regressão de dados dos208 estudos anteriores');
  assert.deepEqual(report.pageErrors,[]);report.checks.push('208 JSONs anteriores preservados por SHA-256');report.success=true;
}catch(error){report.success=false;report.failure={message:error.message,stack:error.stack};throw error;
}finally{
  report.finishedAt=new Date().toISOString();await writeFile(path.join(dir,'browser.json'),JSON.stringify(report,null,2));
  const lines=['# Estudos navais — ensaio de navegador','',`Resultado: ${report.success?'PASSOU':'FALHOU'}. Fonte: ${root}.`,
    '',`Navegador: ${report.browserVersion}. Este ensaio usa o Chromium headless e pode usar renderização por software. Consulte renderer/vendor no JSON.`,
    '',report.conditions.loadTiming,'',report.conditions.renderTiming,'',report.conditions.rafTiming,'',report.conditions.lighting,
    '', 'As vistas principais têm câmera e escala física iguais dentro de cada componente. As perspectivas com sufixo fitted usam enquadramento individual e não têm escala comparativa igual.',
    '', '| Componente | Resolução | Blocos | Draw calls | Triângulos | Navegação até pronto ms | Render + finish mediana ms | Render + finish p95 ms | rAF mediana ms |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...report.variants.map(v=>`| ${v.specimen} | ${v.resolution} | ${v.blocks} | ${v.performance.drawCalls} | ${v.performance.triangles} | ${v.loadToReadyMs} | ${v.performance.renderAndFinishMs.median} | ${v.performance.renderAndFinishMs.p95} | ${v.performance.rafIntervalMs.median} |`),
    '',`Preservação: ${report.frozen.checked??0} de 208 JSONs conferidos contra o manifesto congelado ${frozen.sourceCommit}.`,
    '', 'O arquivo browser.json contém câmera, projeção, luzes, módulos, inventário, perfil WebGL, tempos, requisições e falhas. A galeria PNG não valida estados, colisão ou comportamento dentro do Bedrock.',
    ...(report.failure?['','Falha: '+report.failure.message]:[])];
  await writeFile(path.join(dir,'ensaio.md'),lines.join('\n'));await browser.close();
}
console.log(JSON.stringify({success:report.success,variants:report.variants.length,captures:report.captures.length,frozen:report.frozen.checked,pageErrors:report.pageErrors}));
