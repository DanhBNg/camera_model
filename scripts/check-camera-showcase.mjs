import {chromium} from 'playwright';
import {pathToFileURL} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='artifacts/camera-showcase';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL || undefined});
const results=[];
try{
 for(const viewport of [{width:1440,height:960},{width:390,height:844}]){
  const page=await browser.newPage({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
  const errors=[],external=[];page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url());});
  await page.goto(pathToFileURL(process.cwd()+'/index.html').href);
  await page.waitForFunction(()=>window.cameraShowcase?.ready && cameraShowcase.stats().frame>=3);await page.waitForTimeout(400);
  assert.equal(await page.locator('[data-part]').count(),17);
  assert.equal(await page.locator('#assembly-start').count(),0,'assembly game is deferred');
  assert.equal(await page.locator('h1').count(),0);
  const tag=viewport.width<500?'mobile':'desktop';
  await page.screenshot({path:`${out}/${tag}.png`});
  // Pick the optical centre: decorative lettering must not intercept this hit.
  const glassPoint=await page.evaluate(()=>{const s=cameraShowcase;const v=s.model.userData.sculptRuntime.nodes.glass.position.clone();v.z+=.1;v.project(s.camera);const r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x+(v.x+1)*r.width/2,y:r.y+(1-v.y)*r.height/2};});
  await page.mouse.click(glassPoint.x,glassPoint.y);
  assert.equal(await page.locator('#selection-title').textContent(),'Cụm kính quang học');
  await page.locator('#reset').click();
  await page.locator('#zoom-in').click();
  const dist=await page.evaluate(()=>cameraShowcase.camera.position.distanceTo(cameraShowcase.controls.target));
  await page.locator('#zoom-out').click();
  assert.ok(await page.evaluate(d=>cameraShowcase.camera.position.distanceTo(cameraShowcase.controls.target)>d,dist));
  await page.locator('#explode').evaluate(el=>{el.value=100;el.dispatchEvent(new Event('input',{bubbles:true}));});await page.waitForTimeout(800);
  assert.equal(await page.locator('#shoot').isDisabled(),true);
  if(tag==='desktop')await page.screenshot({path:`${out}/exploded.png`});
  await page.locator('#reset').click();await page.waitForTimeout(150);
  await page.locator('#tab-parts').click();await page.locator('[data-part="lens"]').click();
  await page.locator('#isolate').click();
  assert.equal(await page.evaluate(()=>Object.values(cameraShowcase.model.userData.sculptRuntime.assemblies).filter(a=>a.node.visible).length),1);
  for(const id of ['iris','speed_dial','rewind','advance','film_cartridge','takeup','film_gate','curtain']){
   await page.locator(`[data-part="${id}"]`).click();
   assert.equal(await page.evaluate(id=>Object.entries(cameraShowcase.model.userData.sculptRuntime.assemblies).filter(([,a])=>a.node.visible).map(([key])=>key).join(','),id),id);
  }
  await page.locator('#reset').click();await page.locator('#tab-actions').click();
  await page.locator('#detach').click();await page.waitForTimeout(500);
  assert.equal(await page.evaluate(()=>cameraShowcase.actions.state.lensDetached),true);
  await page.locator('#reset').click();await page.locator('[data-view="back"]').click();
  const backView=await page.evaluate(()=>cameraShowcase.camera.position.toArray());
  await page.locator('#open-back').click();await page.waitForTimeout(800);
  const afterBackView=await page.evaluate(()=>cameraShowcase.camera.position.toArray());
  assert.ok(afterBackView.every((v,i)=>Math.abs(v-backView[i])<1e-8),'opening back must not change the view');
  assert.equal(await page.locator('#explode').isDisabled(),true);
  assert.equal(await page.locator('#open-back span').textContent(),'Đóng nắp lưng');
  assert.ok(await page.evaluate(()=>cameraShowcase.model.userData.sculptRuntime.pivots.back.rotation.y>0));
  if(tag==='desktop')await page.screenshot({path:`${out}/back-open.png`});
  await page.locator('#open-back').click();await page.waitForTimeout(800);
  assert.equal(await page.locator('#explode').isDisabled(),false);
  assert.equal(await page.locator('#open-back span').textContent(),'Mở nắp lưng');
  assert.equal(await page.evaluate(()=>cameraShowcase.model.userData.sculptRuntime.pivots.back.rotation.y),0);
  await page.locator('#reset').click();await page.waitForTimeout(200);
  await page.locator('#shoot').click();assert.equal(await page.evaluate(()=>cameraShowcase.actions.state.shot),1);
  await page.locator('#focus').evaluate(el=>{el.value=100;el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.waitForTimeout(100);assert.ok(await page.evaluate(()=>cameraShowcase.model.userData.sculptRuntime.pivots.focus.rotation.z>2));
  await page.locator('#reset').click();
  const rect=await page.locator('canvas').boundingBox();
  const before=await page.evaluate(()=>cameraShowcase.camera.position.toArray());
  await page.mouse.move(rect.x+rect.width*.5,rect.y+rect.height*.55);await page.mouse.down();await page.mouse.move(rect.x+rect.width*.65,rect.y+rect.height*.57,{steps:12});await page.mouse.up();
  assert.notDeepEqual(await page.evaluate(()=>cameraShowcase.camera.position.toArray()),before);
  for(const angle of ['front','back','top']){await page.evaluate(a=>cameraShowcase.setView(a),angle);await page.waitForTimeout(150);if(tag==='desktop')await page.screenshot({path:`${out}/${angle}.png`});}
  if(tag==='mobile'){
   const cdp=await page.context().newCDPSession(page);
   const r=await page.locator('canvas').boundingBox();
   const x=r.x+r.width/2,y=r.y+r.height*.6;
   const distance=await page.evaluate(()=>cameraShowcase.camera.position.distanceTo(cameraShowcase.controls.target));
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-30,y,id:0},{x:x+30,y,id:1}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-60,y,id:0},{x:x+60,y,id:1}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert.ok(await page.evaluate(d=>cameraShowcase.camera.position.distanceTo(cameraShowcase.controls.target)<d,distance));
   assert.equal(await page.locator('#selection-title').textContent(),'Chạm để khám phá');
   await cdp.detach();
   await page.locator('#collapse').click();await page.waitForTimeout(200);await page.evaluate(()=>cameraShowcase.setView('hero'));await page.screenshot({path:`${out}/mobile-expanded.png`});
   assert.ok(await page.locator('#stage').evaluate(el=>el.clientHeight>500));
   assert.ok(await page.evaluate(()=>{
    const s=cameraShowcase,b=s.model.userData.sculptRuntime.bounds;
    for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){
     const v=s.camera.position.clone().set(x,y,z).project(s.camera);
     if(Math.abs(v.x)>1||Math.abs(v.y)>1)return false;
    }return true;
   }),'assembled camera fits the expanded mobile viewport');
   await page.locator('#collapse').click();
   await page.locator('#explode').evaluate(el=>{el.value=100;el.dispatchEvent(new Event('input',{bubbles:true}));});
   await page.waitForTimeout(800);
   await page.locator('#collapse').click();
   for(const angle of ['hero','front','back','top']){
    await page.locator(`[data-view="${angle}"]`).click();
    assert.ok(await page.evaluate(()=>{
     const s=cameraShowcase,b=s.model.userData.sculptRuntime.bounds.clone().setFromObject(s.model);
     for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){
      const v=s.camera.position.clone().set(x,y,z).project(s.camera);
      if(Math.abs(v.x)>1||Math.abs(v.y)>1)return false;
     }return true;
    }),`exploded camera fits mobile ${angle}`);
   }
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  results.push({viewport,stats:await page.evaluate(()=>cameraShowcase.stats()),errors,externalRequests:external.length});
  await page.close();
 }
 await writeFile(`${out}/verification.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}
