import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.env.SITE_URL||'http://127.0.0.1:4388',dir=path.resolve(process.env.QA_DIR||'../../../output/casa-bambu-final-2026-11-12/browser-qa');
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--enable-unsafe-swiftshader','--force-color-profile=srgb']});
const report={root,checks:[],views:[],modules:[],errors:[]},ok=(name,value)=>{assert.ok(value,name);report.checks.push(name);};
try{
 const page=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(root+'/?build=bamboo&theme=day');
 await page.waitForFunction(()=>window.BuildsMineInspector?.snapshot().ready,{timeout:90000});
 const snapshot=()=>page.evaluate(()=>BuildsMineInspector.snapshot());
 let s=await snapshot();ok('final model loaded',s.modelVersion==='bamboo-final-2026-11-12'&&s.blocks===921);
 ok('all textures loaded',!s.rendering.textureFailures.length);ok('all five modules visible',s.visible===921&&s.modules.length===5);
 const source=await page.evaluate(()=>({composition:studio.model.composition,anchors:studio.model.anchors}));
 ok('36-block bridge and preserved source cells',source.composition.longBridge.length===36&&source.composition.sourceCells===667&&source.composition.bambooPositionPreserved===true);
 for(const view of ['perspective','front','back','left','right','top','bottom']){
  await page.selectOption('#view',view);await page.waitForTimeout(200);
  const fit=await page.evaluate(()=>{
   const s=studio,c=s.camera;c.updateMatrixWorld(true);let worst=0;const failures=[];
   const p=c.position.clone();for(const b of s.blocks)for(const dx of [0,1])for(const dy of [0,1])for(const dz of [0,1]){
    p.set(b.x+dx,b.y+dy,b.z+dz).project(c);worst=Math.max(worst,Math.abs(p.x),Math.abs(p.y));if(Math.abs(p.x)>1.001||Math.abs(p.y)>1.001||p.z>1||p.z< -1)failures.push([b.x,b.y,b.z]);
   }return {worst,failed:failures.length};
  });ok('whole model fits '+view,fit.failed===0);report.views.push({view,...fit,camera:(await snapshot()).camera});
  await page.screenshot({path:path.join(dir,'all-'+view+'.png'),animations:'disabled'});
 }
 await page.selectOption('#view','front');s=await snapshot();ok('front faces the marked short bridge',s.camera.position[2]>s.camera.target[2]);
 for(const module of s.modules){
  await page.selectOption('#part',module.id);s=await snapshot();ok('module count '+module.id,s.visible===module.count);
  await page.selectOption('#mode','block');await page.locator('#step').fill('1');await page.locator('#step').dispatchEvent('input');s=await snapshot();ok('one-block timeline '+module.id,s.visible===1);
  await page.selectOption('#mode','layer');await page.locator('#step').fill('0');await page.locator('#step').dispatchEvent('input');s=await snapshot();
  const expected=await page.evaluate(id=>studio.blocks.filter(b=>b.module===id&&b.y===0).length,module.id);ok('base-layer cut '+module.id,s.visible===expected);
  await page.selectOption('#mode','all');report.modules.push({id:module.id,count:module.count});
 }
 await page.selectOption('#part','all');await page.selectOption('#mode','layer');await page.locator('#step').fill('15');await page.locator('#step').dispatchEvent('input');s=await snapshot();ok('all 16 layers reachable',s.visible===921);
 await page.selectOption('#mode','all');await page.selectOption('#view','perspective');
 await page.getByRole('button',{name:'Grade',exact:true}).click();ok('grid toggles',await page.evaluate(()=>studio.grid.visible));
 await page.getByRole('button',{name:'Materiais',exact:true}).click();ok('24 inventory entries',await page.locator('#material-list .material-row').count()===24);
 await page.getByRole('button',{name:'Fechar',exact:true}).click();
 const b=await page.evaluate(()=>studio.blocks.find(b=>b.name==='minecraft:bamboo_fence_gate'));
 await page.evaluate(b=>BuildsMineInspector.execute('buildsmine_select',b),{x:b.x,y:b.y,z:b.z});await page.locator('#selection summary').click();ok('block selection exposes real gate ID',await page.locator('#selection').innerText().then(t=>t.includes('minecraft:bamboo_fence_gate')));
 await page.keyboard.press('Escape');
 await page.locator('#theme').click();s=await snapshot();ok('night mode',s.theme==='night'&&!s.rendering.textureFailures.length);
 await page.screenshot({path:path.join(dir,'all-night.png'),animations:'disabled'});
 await page.setViewportSize({width:390,height:844});await page.locator('#fit').click();
 ok('mobile has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.selectOption('#part','house');await page.selectOption('#view','front');await page.screenshot({path:path.join(dir,'mobile-house.png'),animations:'disabled'});
 await page.setViewportSize({width:1440,height:960});
 for(const v of ['1.0.3','2.3.0','2.4.0']){
  await page.goto(root+'/?build=portal-'+v+'&theme=day');await page.waitForFunction(()=>window.BuildsMineInspector?.snapshot().ready,{timeout:90000});s=await snapshot();ok('portal still loads '+v,s.project==='portal-'+v&&s.blocks>0&&!s.failures.length);
 }
 ok('no page errors',report.errors.length===0);
}finally{await writeFile(path.join(dir,'report.json'),JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify({checks:report.checks.length,views:report.views.length,modules:report.modules.length,errors:report.errors,report:path.join(dir,'report.json')}));
