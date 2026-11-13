// Run against the built site. PLAYWRIGHT_MODULE may point to an existing installation.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {isDeepStrictEqual} from 'node:util';
import {generateRoof} from '../architect/roof.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.env.SITE_URL||'http://127.0.0.1:4377';
const dir=path.resolve(process.env.QA_DIR||'../../output/architect-roof');
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:1360,height:900}});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto(root+'/?build=telhado-oriental');
  await page.waitForFunction(()=>window.buildsMine?.ready,null,{timeout:90000});
  assert.deepEqual(await page.evaluate(()=>buildsMine.assets.failures),[]);
  const info=()=>page.evaluate(()=>{
    const {scene,model,visible}=buildsMine;
    let n=0;
    for(const {mesh} of scene.batches){
      const m=mesh.matrix.clone();
      for(let i=0;i<mesh.count;i++){
        mesh.getMatrixAt(i,m);const b=mesh.userData.active[i];
        if(!visible.has(b)||m.elements[12]!==b.x||m.elements[13]!==b.y||m.elements[14]!==b.z||
           mesh.geometry!==buildsMine.assets.geometry(b)) throw Error('Instância divergente');
        n++;
      }
    }
    return {variant:buildsMine.variant,total:model.blocks.length,visible:visible.size,instances:n,
      calls:scene.renderer.info.render.calls,triangles:scene.renderer.info.render.triangles,groups:scene.batches.length};
  });
  const summary={variants:[],views:[],errors};
  const compare=async()=>{
    const fromPage=await page.evaluate(()=>buildsMine.model);
    assert.ok(isDeepStrictEqual(fromPage,generateRoof(fromPage.params)));
    const counts=await info();assert.equal(counts.visible,counts.instances);return counts;
  };
  const capture=async name=>{
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    await page.locator('#canvas').screenshot({path:path.join(dir,name+'.png'),
      style:'.view-tools,.hint,#selection{visibility:hidden!important}'});
  };
  for(const view of ['front','back','left','right','top','bottom','perspective']){
    await page.selectOption('#view',view);await capture('classica-'+view);summary.views.push(view);
  }
  for(const [pitch,lift,finish] of [['suave','reto','slate'],['classica','curvo','slate'],['ingreme','elevado','basalt']]){
    for(const [control,value] of Object.entries({pitch,lift,finish})) await page.selectOption('#'+control,value);
    const variant=[pitch,lift,finish].join('-');
    await page.waitForFunction(v=>buildsMine.variant===v,variant);
    await page.click('#fit');await capture(variant);summary.variants.push(await compare());
  }
  for(const module of await page.locator('#part option').evaluateAll(opts=>opts.slice(1).map(o=>o.value))){
    await page.selectOption('#part',module);
    assert.ok(await page.evaluate(m=>[...buildsMine.visible].every(b=>b.module===m),module));
    if(['brackets','gables'].includes(module)) await capture(module);
    assert.equal((await info()).instances,(await info()).visible);
  }
  await page.selectOption('#part','all');
  for(const [mode,n] of [['block',17],['layer',5],['stage',2]]){
    await page.selectOption('#mode',mode);await page.locator('#step').fill(String(n));
    const checked=await page.evaluate(({mode,n})=>{
      const {model,visible}=buildsMine;
      const expected=model.blocks.filter((b,i)=>mode==='block'?i<n:mode==='layer'?b.y<=n:model.modules.find(m=>m.id===b.module).stage<=n);
      return expected.length===visible.size&&expected.every(b=>visible.has(b));
    },{mode,n});
    assert.ok(checked); assert.equal((await info()).instances,(await info()).visible);
    await page.click('#materials');assert.equal(await page.locator('.material-row strong').evaluateAll(es=>es.reduce((sum,e)=>sum+Number(e.textContent),0)),(await info()).visible);
    await page.keyboard.press('Escape');
  }
  await page.selectOption('#mode','all');await page.click('#theme');await capture('noite');
  assert.ok(await page.locator('body').evaluate(e=>e.classList.contains('dark')));
  await page.click('#theme');await page.click('#grid');assert.ok(await page.evaluate(()=>buildsMine.scene.grid.visible));
  await page.selectOption('#view','top');
  const box=await page.locator('#canvas').boundingBox();
  await page.mouse.click(box.x+box.width*.5,box.y+box.height*.5);
  assert.ok(await page.locator('#selection').isVisible());assert.ok(await page.evaluate(()=>buildsMine.visible.has(buildsMine.scene.selected)));
  await page.keyboard.press('Escape');await page.click('#fit');
  const distance=()=>page.evaluate(()=>buildsMine.scene.camera.position.distanceTo(buildsMine.scene.controls.target));
  await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);
  const before=await distance();await page.mouse.wheel(0,-350);await page.waitForFunction(d=>buildsMine.scene.camera.position.distanceTo(buildsMine.scene.controls.target)<d,before);
  const angle=await page.evaluate(()=>buildsMine.scene.controls.getAzimuthalAngle());
  await page.mouse.down();await page.mouse.move(box.x+box.width*.65,box.y+box.height*.56,{steps:8});await page.mouse.up();
  assert.notEqual(await page.evaluate(()=>buildsMine.scene.controls.getAzimuthalAngle()),angle);
  await page.setViewportSize({width:390,height:844});await page.click('#fit');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(dir,'mobile.png')});await page.close();
  assert.deepEqual(errors,[]);await fs.writeFile(path.join(dir,'browser.json'),JSON.stringify(summary,null,2));console.log(summary);
} finally {await browser.close();}

