import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
await mkdir('artifacts/camera-learning',{recursive:true});
const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL || undefined});
const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
async function piecePoint(id){return page.evaluate(id=>{
 const {model,camera,renderer}=window.cameraShowcase;
 const node=model.userData.sculptRuntime.assemblies[id].node;
 let mesh;node.traverse(o=>{if(!mesh&&o.isMesh&&!o.userData.pickThrough)mesh=o;});
 mesh.geometry.computeBoundingBox();const p=mesh.geometry.boundingBox.getCenter(node.position.clone());mesh.localToWorld(p);p.project(camera);
 const r=renderer.domElement.getBoundingClientRect();return{x:r.left+(p.x*.5+.5)*r.width,y:r.top+(-p.y*.5+.5)*r.height};
},id);}
async function dragNext(touch=false){
 const id=await page.evaluate(()=>{const s=window.cameraShowcase.learning.game.state;return s.queue[s.index];});
 const from=await piecePoint(id);
 const to=await page.evaluate(id=>{
 const {model,camera,renderer}=window.cameraShowcase;
 const ids=Object.keys(model.userData.sculptRuntime.assemblies),g=model.getObjectByName('assembly-guide').children[ids.indexOf(id)];
 const min=g.position.clone().setScalar(Infinity),max=g.position.clone().setScalar(-Infinity);
 g.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const v=g.position.clone().set(x,y,z).applyMatrix4(o.matrixWorld);min.min(v);max.max(v);}});
 const p=min.add(max).multiplyScalar(.5).project(camera),r=renderer.domElement.getBoundingClientRect();return {x:r.left+(p.x*.5+.5)*r.width+7,y:r.top+(-p.y*.5+.5)*r.height+5};
 },id);
 if(touch){const cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[from]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[to]});await page.waitForTimeout(100);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}
 else{await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:14});await page.waitForTimeout(100);await page.mouse.up();}
 await page.waitForTimeout(350);
 assert.equal(await page.evaluate(id=>window.cameraShowcase.learning.game.state.placed.includes(id),id),true,`Drag ${id} (${touch?'touch':'mouse'})`);
 assert.equal(await page.evaluate(()=>window.cameraShowcase.controls.enabled),true);assert.equal(await page.locator('.spatial-word').isVisible(),false);
}
try{
 await page.goto(pathToFileURL(path.resolve('index.html')).href);await page.waitForFunction(()=>window.cameraShowcase?.ready);
 assert.equal(await page.locator('#learn-xray').count(),0);assert.equal(await page.locator('.assembly-marker, #assembly-slots').count(),0);
 await page.evaluate(()=>window.cameraShowcase.select('lens'));await page.waitForTimeout(150);
 assert.match(await page.locator('.spatial-word').textContent(),/lens/);await page.locator('.spatial-word').waitFor({state:'visible'});
 await page.locator('#assembly-start').click();await page.waitForTimeout(700);
 assert.equal(await page.evaluate(()=>{const g=window.cameraShowcase.model.getObjectByName('assembly-guide');return g.visible&&g.children.every(n=>n.visible);}),true);
 await page.screenshot({path:'artifacts/camera-learning/ghost-frame.png'});
 for(let i=0;i<9;i++)await dragNext();
 assert.equal(await page.evaluate(()=>window.cameraShowcase.model.getObjectByName('assembly-guide').children.every(n=>!n.visible)),true);
 assert.match(await page.locator('#assembly-question').textContent(),/Hoàn thành/);
 await page.screenshot({path:'artifacts/camera-learning/drag-complete.png'});
 await page.locator('#assembly-exit').click();
 await page.setViewportSize({width:390,height:844});await page.locator('#assembly-mode').selectOption('audio');await page.locator('#assembly-start').click();await page.waitForTimeout(600);
 await dragNext(true);
 for(let i=1;i<9;i++)await dragNext(true);
 await page.screenshot({path:'artifacts/camera-learning/mobile.png'});
 await page.locator('#reset').click();assert.equal(await page.evaluate(()=>window.cameraShowcase.learning.active),false);assert.equal(await page.evaluate(()=>window.cameraShowcase.model.getObjectByName('assembly-guide').visible),false);assert.deepEqual(errors,[]);
 console.log('Camera learning: no X-ray, spatial label, all nine mouse drags, all nine touch drags, completion and reset passed.');
}finally{await browser.close();}
