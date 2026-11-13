import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {makeStudy} from '../architect/v2/laboratory.mjs';
import {defaults,studyKey} from '../architect/v2/studies.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const dir=path.resolve(process.env.QA_DIR||'../../output/architect-02');
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:1440,height:960}});
  const errors=[],results=[];
  page.on('pageerror',e=>errors.push(e.message));
  const root=process.env.SITE_URL||'http://127.0.0.1:4382';
  await page.goto(root+'/?build=atelier-02&compare=baseline');
  await page.waitForFunction(()=>window.buildsMine?.ready,null,{timeout:90000});
  const pause=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const cap=async name=>{await pause();await page.locator('#canvas').screenshot({path:path.join(dir,name+'.png'),style:'.view-tools,.hint,#selection{visibility:hidden!important}'});};
  const check=async state=>{
    await page.waitForFunction(id=>window.buildsMine.variant===id,studyKey(state),{timeout:60000});
    const data=await page.evaluate(()=>{
      const {model,scene,visible,assets}=buildsMine;
      let drawn=0;
      for(const {mesh} of scene.batches) for(let i=0;i<mesh.count;i++){
        const matrix=mesh.matrix.clone();mesh.getMatrixAt(i,matrix);const b=mesh.userData.active[i];
        if(!visible.has(b)||b.x!==matrix.elements[12]||b.y!==matrix.elements[13]||b.z!==matrix.elements[14]||mesh.geometry!==assets.geometry(b))throw Error('Instância incoerente');
        drawn++;
      }
      return {model,drawn,visible:visible.size,missing:assets.failures};
    });
    assert.deepEqual(data.model,makeStudy(state));assert.deepEqual(data.missing,[]);assert.equal(data.drawn,data.visible);
    results.push({id:studyKey(state),blocks:data.drawn,materials:Object.keys(data.model.materials).length});
  };
  const cameras=()=>page.evaluate(()=>{
    const {scene,lab}=buildsMine,other=lab.referenceScene;
    if(!other) return false;
    const close=(a,b)=>Math.abs(a-b)<1e-6;
    return scene.camera.position.distanceTo(other.camera.position)<1e-5 &&
      scene.controls.target.distanceTo(other.controls.target)<1e-6 && close(scene.camera.zoom,other.camera.zoom) &&
      scene.camera.projectionMatrix.elements.every((n,i)=>Math.abs(n-other.camera.projectionMatrix.elements[i])<.007);
  });
  let state={...defaults};await check(state);assert.ok(await cameras());await cap('01-versoes');
  for(const view of ['front','back','left','right','top','bottom','perspective']){
    await page.selectOption('#view',view);await pause();assert.ok(await cameras(),'câmeras '+view);await cap('vista-'+view);
  }
  await page.click('#theme');await cap('02-noite');await page.click('#theme');
  await page.selectOption('#lab-compare','off');await page.waitForFunction(()=>!buildsMine.lab.reference);
  for(const family of ['gable','hip','tiered','irimoya']){
    state={...state,family};await page.selectOption('#lab-family',family);await check(state);
    await page.click('#fit');await cap('tipo-'+family);
  }
  await page.click('#lab-pin');await page.waitForFunction(()=>buildsMine.lab.reference?.studyId===buildsMine.variant);
  const pinned=studyKey(state);await page.selectOption('#lab-finish','tidal');state.finish='tidal';await check(state);
  assert.equal(await page.evaluate(()=>buildsMine.lab.reference.studyId),pinned);assert.ok(await cameras());await cap('03-acabamentos');
  await page.selectOption('#part','brackets');assert.ok(await page.evaluate(()=>[...buildsMine.visible].every(b=>b.module==='brackets')));
  await cap('04-consolos');await page.selectOption('#part','gables');await cap('05-frontoes');await page.selectOption('#part','all');
  for(const [mode,n] of [['stage',1],['layer',4],['block',13]]){
    await page.selectOption('#mode',mode);await page.locator('#step').fill(String(n));
    assert.ok(await page.evaluate(({mode,n})=>{
      const {model,visible}=buildsMine,m=new Map(model.modules.map(t=>[t.id,t.stage]));
      return mode==='block'?visible.size===n:[...visible].every(b=>mode==='layer'?b.y<=n:m.get(b.module)<=n);
    },{mode,n}));
    await page.click('#materials');
    assert.equal(await page.locator('.material-row strong').evaluateAll(es=>es.reduce((s,e)=>s+Number(e.textContent),0)),await page.evaluate(()=>buildsMine.visible.size));
    await page.keyboard.press('Escape');
  }
  await page.selectOption('#mode','all');await page.selectOption('#view','top');
  for(const side of [0,1]){
    const rect=await page.locator('.lab-pane').nth(side).boundingBox();
    await page.mouse.click(rect.x+rect.width/2,rect.y+rect.height/2);
    assert.ok(await page.locator('#selection').isVisible());
    assert.ok(await page.evaluate(i=>(i===0?buildsMine.lab.referenceScene:buildsMine.scene).selected!==null,side));await page.keyboard.press('Escape');
  }
  await page.click('#materials');await page.locator('.lab-discovery summary').click();await page.waitForSelector('.lab-discovery li');
  assert.ok(await page.locator('.lab-discovery li').count()>=1);await page.selectOption('#material-role','ornament');await pause();
  assert.ok((await page.locator('.lab-discovery').textContent()).includes('Acento'));await page.keyboard.press('Escape');
  await page.selectOption('#lab-compare','off');await page.selectOption('#lab-study','palette');
  state.study='palette';state.finish='tidal';state.pattern='density';await check(state);
  await page.selectOption('#view','front');await page.click('#lab-pin');await page.waitForFunction(()=>buildsMine.lab.reference?.studyId===buildsMine.variant);
  for(const [pattern,finish] of [['linear','ember'],['steps','mineral'],['mosaic','blossom'],['clusters','tidal']]){
    await page.selectOption('#lab-pattern',pattern);await page.selectOption('#lab-finish',finish);Object.assign(state,{pattern,finish});
    await check(state);await cap('palette-'+pattern);
  }
  await page.selectOption('#lab-compare','off');await page.selectOption('#lab-study','kit');
  state.study='kit';await page.selectOption('#view','perspective');
  for(const component of ['colonnade','lantern','crest','finial']){
    await page.selectOption('#lab-component',component);state.component=component;await check(state);
    await page.click('#fit');await cap('kit-'+component);
  }
  const rect=await page.locator('.lab-pane').last().boundingBox();
  await page.mouse.move(rect.x+rect.width*.5,rect.y+rect.height*.5);
  const dist=await page.evaluate(()=>buildsMine.scene.camera.position.distanceTo(buildsMine.scene.controls.target));
  await page.mouse.wheel(0,-300);await page.waitForFunction(d=>buildsMine.scene.camera.position.distanceTo(buildsMine.scene.controls.target)<d,dist);
  await cap('kit-detail');await page.setViewportSize({width:390,height:844});await page.click('#fit');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(dir,'mobile.png')});
  assert.deepEqual(errors,[]);await writeFile(path.join(dir,'browser.json'),JSON.stringify({results,errors},null,2));console.log('Modelos confrontados:',results.length);
}finally{await browser.close();}

