import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {makeStudy} from '../architect/v2/laboratory.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.env.SITE_URL||'http://127.0.0.1:4383',dir=path.resolve(process.env.QA_DIR||'../../output/architect-021');
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--enable-unsafe-swiftshader','--enable-blink-features=WebMCP']});
const errors=[],results={root,checks:[],errors},check=name=>results.checks.push(name);
try{
  const page=await browser.newPage({viewport:{width:1440,height:960}});
  page.on('pageerror',e=>errors.push(e.message));
  const ready=()=>page.waitForFunction(()=>window.BuildsMineInspector?.snapshot().ready,{timeout:60000});
  const act=(id,value)=>page.evaluate(({id,value})=>BuildsMineInspector.execute('buildsmine_view',{id,value}),{id,value});
  const capture=name=>page.screenshot({path:path.join(dir,name+'.png')});
  await page.goto(root+'/?build=fachada-021&compare=facade-A-contextual');await ready();
  const original=await page.evaluate(()=>BuildsMineInspector.snapshot());
  assert.equal(original.variant,'facade-B-contextual');assert.deepEqual(original.rendering.textureFailures,[]);check('Fachada B e referência A carregadas');
  const registry=await page.evaluate(async()=>{
    const r=document.modelContext??navigator.modelContext;
    if(!r?.getTools)return {available:false};
    const tools=await r.getTools(),tool=tools.find(t=>t.name==='buildsmine_inspect');
    const value=await r.executeTool(tool,document.modelContext?{}:'{}');
    return {available:true,tools:tools.map(t=>t.name),value};
  });
  results.webmcp=registry;
  assert.equal(registry.available,true);
  assert.equal(registry.tools.filter(t=>t.startsWith('buildsmine_')).length,5);
  assert.ok(JSON.stringify(registry.value).includes('facade-B-contextual'));check('WebMCP nativo descobriu cinco ferramentas e executou inspeção');
  const native=await page.evaluate(async()=>{
    const r=document.modelContext??navigator.modelContext,tools=await r.getTools();
    const args={id:'lab-edition',value:'C'};
    return r.executeTool(tools.find(t=>t.name==='buildsmine_view'),document.modelContext?args:JSON.stringify(args));
  });
  assert.ok(JSON.stringify(native).includes('facade-C-contextual'));check('WebMCP nativo alterou a variante e devolveu o estado concluído');
  for(const edition of ['A','B','C']){
    await act('lab-edition',edition);
    const actual=await page.evaluate(()=>window.buildsMine.model),expected=makeStudy({study:'facade',edition,distribution:'contextual'});
    assert.deepEqual(actual,expected);
    assert.ok(await page.evaluate(()=>{
      const {scene,lab}=buildsMine;return scene.camera.position.distanceTo(lab.referenceScene.camera.position)<1e-9&&scene.camera.zoom===lab.referenceScene.camera.zoom;
    }));check('Variante '+edition+' corresponde ao motor e à câmera da referência');
    await capture('fachada-'+edition);
  }
  for(const view of ['front','back','left','right','top','bottom','perspective']){
    await act('view',view);await capture('vista-'+view);
  }
  check('Seis vistas ortográficas e perspectiva');
  for(const module of ['opening','capital','cornice','brackets','gables','walls']){
    await act('part',module);
    const selected=await page.evaluate(()=>BuildsMineInspector.blocks({module:document.querySelector('#part').value,limit:1}).items[0]);
    const result=await page.evaluate(b=>BuildsMineInspector.execute('buildsmine_select',{x:b.x,y:b.y,z:b.z}),selected);
    assert.equal(result.module,module);await capture('componente-'+module);
  }
  check('Seis componentes isolados e blocos selecionados');
  await assert.rejects(()=>page.evaluate(()=>BuildsMineInspector.execute('buildsmine_view',{id:'lab-edition',value:'ADMIN'})));
  await assert.rejects(()=>page.evaluate(()=>BuildsMineInspector.execute('buildsmine_blocks',{limit:100000})));
  await assert.rejects(()=>page.evaluate(()=>BuildsMineInspector.execute('buildsmine_inspect',{url:'https://invalid.test'})));
  await assert.rejects(()=>page.evaluate(()=>BuildsMineInspector.execute('buildsmine_select',{x:0,y:1.5,z:0})));
  check('Argumentos inválidos rejeitados sem alterar o modelo');
  await act('part','all');
  for(const [mode,n] of [['stage',5],['layer',12],['block',30]]){
    await act('mode',mode);await act('step',String(n));const s=await page.evaluate(()=>BuildsMineInspector.snapshot());assert.ok(s.visible>0&&s.visible<s.blocks);
  }
  await act('mode','all');await act('lab-distribution','illustrative');await capture('distribuicao-ilustrativa');await act('lab-distribution','contextual');
  await page.click('#theme');await capture('noite');await page.click('#theme');
  check('Etapas, cortes, progresso, comparação material e iluminação');
  await page.setViewportSize({width:390,height:844});await capture('mobile');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));check('Viewport móvel sem transbordamento');
  await page.setViewportSize({width:1440,height:960});
  for(const build of ['bamboo','portal-1.0.3','portal-2.3.0','portal-2.4.0','telhado-oriental','atelier-02']){
    await page.goto(root+'/?build='+build);await ready();
    const snap=await page.evaluate(()=>BuildsMineInspector.snapshot());
    assert.equal(snap.project,build);assert.ok(snap.blocks>0);
    const first=await page.evaluate(()=>BuildsMineInspector.blocks({limit:1}).items[0]);
    await page.evaluate(b=>BuildsMineInspector.execute('buildsmine_select',{x:b.x,y:b.y,z:b.z}),first);
    await act('view','front');check('Inspeção e vista do legado '+build);
  }
  const response=await page.request.get(root+'/modelos/release.json'),release=await response.json();
  const local=JSON.parse(await readFile(new URL('../dist/modelos/release.json',import.meta.url),'utf8'));
  assert.equal(release.sourceCommit,local.sourceCommit);assert.deepEqual(release.models,local.models);results.sourceCommit=release.sourceCommit;
  // Verify every deployed study packet, rather than trusting the release header alone.
  const entries=Object.entries(release.models);
  for(let i=0;i<entries.length;i+=8)await Promise.all(entries.slice(i,i+8).map(async([id,hash])=>{
    const response=await page.request.get(root+'/modelos/atelier/'+id+'.json');assert.ok(response.ok(),id);
    assert.equal(createHash('sha256').update(await response.body()).digest('hex'),hash,id);
  }));
  check(entries.length+' modelos conferidos por SHA-256 entre motor, build e URL servida');
  const failed=await browser.newPage();
  await failed.route('**/modelos/atelier/facade-*.json',route=>route.fulfill({status:503,body:'unavailable'}));
  await failed.goto(root+'/?build=fachada-021');
  await failed.waitForFunction(()=>window.BuildsMineInspector);
  const diagnostic=await failed.evaluate(()=>BuildsMineInspector.snapshot());
  assert.equal(diagnostic.ready,false);assert.ok(diagnostic.failures.some(e=>e.kind==='loading'));
  await failed.close();check('Falha de carregamento mantém diagnóstico e recuperação visíveis');
  assert.deepEqual(errors,[]);
  await writeFile(path.join(dir,'inspection.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({checks:results.checks.length,models:entries.length,webmcp:true,errors,sourceCommit:release.sourceCommit}));
}finally{await browser.close();}
