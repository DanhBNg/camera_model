import * as T from 'three';
import {vocabulary} from '../../product/object-learning.js';
import {createAssemblyGame} from './assembly-game.js';

const ipa={body:'/ˈbɑːdi/',top:'/tɑːp pleɪt/',base:'/beɪs pleɪt/',mount:'/lenz maʊnt/',lens:'/lenz/',glass:'/ɡlæs ˈelɪmənts/',finder:'/ˈvjuːfaɪndər/',shutter:'/ˈʃʌtər ˌbʌtən/',back:'/bæk ˈkʌvər/'};
export function createCameraLearning({model,camera,stage,controls,actions,reset,select}){
 const runtime=model.userData.sculptRuntime,game=createAssemblyGame(Object.keys(model.userData.sculptRuntime.assemblies)),bind=new Map(Object.entries(runtime.assemblies).map(([id,a])=>[id,a.node.position.clone()]));
 let chosen=null,mode='text',drag=null;
 const displayed=new Map();
 const centers=new Map();model.updateMatrixWorld(true);for(const [id,a]of Object.entries(runtime.assemblies)){centers.set(id,model.worldToLocal(new T.Box3().setFromObject(a.node).getCenter(new T.Vector3())).sub(bind.get(id)));}
 const loosePositions={body:[-5,0,0],back:[5,0,0],top:[0,4,0],base:[0,-4,0],lens:[-4,3.2,0],glass:[4,3.2,0],mount:[-4,-3.2,0],finder:[4,-3.2,0],shutter:[0,2.6,0]};
 function trayPosition(id){return new T.Vector3(...loosePositions[id]).sub(centers.get(id));}
 const defaultMaxDistance=controls.maxDistance;
 function fitAssembly(){
   if(!game.state.active)return;
   const aspect=stage.clientWidth/Math.max(1,stage.clientHeight),halfFov=Math.tan(T.MathUtils.degToRad(camera.fov/2));
   const distance=Math.max(5.6/halfFov,7.6/(halfFov*aspect))+2;
   controls.maxDistance=Math.max(defaultMaxDistance,distance*1.6);
   controls.target.set(0,0,0);camera.position.set(0,.6,distance);controls.update();
 }
 new ResizeObserver(()=>fitAssembly()).observe(stage);
 // Reuse geometry; the guide has its own material and never receives picking.
 const guide=new T.Group();guide.name='assembly-guide';guide.visible=false;
 const ghostMaterial=new T.MeshBasicMaterial({color:0xb5d8cf,transparent:true,opacity:.16,depthWrite:false});
 const ghosts=new Map();
 for(const [id,a]of Object.entries(runtime.assemblies)){
   const ghost=a.node.clone(true);ghost.position.copy(bind.get(id));
   ghost.traverse(o=>{o.userData={pickThrough:true};o.raycast=()=>{};if(o.isMesh){o.material=ghostMaterial;o.castShadow=false;o.receiveShadow=false;}});
   guide.add(ghost);ghosts.set(id,ghost);
 }
 model.add(guide);
 const ui=document.createElement('section');ui.className='camera-learning';ui.innerHTML=`<p class="eyebrow">HỌC BẰNG CÁCH KHÁM PHÁ</p><div id="learn-card"><p>Chọn một bộ phận trên mô hình hoặc danh sách để học từ.</p></div><hr><h3>Lắp ráp & nhận diện</h3><label>Cách nhận yêu cầu<select id="assembly-mode"><option value="text">Đọc tên tiếng Anh</option><option value="audio">Chỉ nghe tên</option></select></label><button id="assembly-start">Bắt đầu lắp ráp</button><div id="assembly-panel" hidden><p id="assembly-question"></p><div class="learn-buttons"><button id="assembly-hear">Nghe yêu cầu</button><button id="assembly-hint">Gợi ý</button><button id="assembly-exit">Thoát bài</button></div><p id="assembly-feedback" role="status"></p><div id="assembly-tray"></div><p class="slot-help">Chọn bộ phận, rồi chạm vòng tròn trên khung máy. Có thể xoay để nhìn vị trí phía sau.</p></div>`;
 document.querySelector('.panel-content').append(ui);
 const shortcut=document.createElement('button');shortcut.textContent='Học & lắp ráp';shortcut.onclick=()=>ui.scrollIntoView({block:'start',behavior:'smooth'});document.querySelector('.tabs').append(shortcut);
 const $=s=>ui.querySelector(s),card=$('#learn-card');
 $('.slot-help').textContent='Khung máy mờ là hình mẫu. Kéo mảnh vào gần vị trí tương ứng rồi thả để tự gắn. Kéo nền để xoay máy.';
 const anchor=document.createElement('div');anchor.className='spatial-word';anchor.hidden=true;stage.append(anchor);
 const speak=text=>{if(!window.speechSynthesis)return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.8;window.speechSynthesis.speak(u);};
 function learned(id){chosen=id;if(!id){card.innerHTML='<p>Chọn một bộ phận để học từ.</p>';return;}const v=vocabulary[id];card.innerHTML=`<h3>${v[0]}</h3><span>${ipa[id]}</span><p>${v[1]}</p><p>${v[2]}<small>${v[3]}</small></p><div class="learn-buttons"><button id="learn-word">Nghe từ</button><button id="learn-sentence">Nghe câu</button></div>`;$('#learn-word').onclick=()=>speak(v[0]);$('#learn-sentence').onclick=()=>speak(v[2]);anchor.textContent=`${v[0]} · ${v[1]}`;}
 const canvas=stage.querySelector('canvas'),ray=new T.Raycaster(),pointer=new T.Vector2();
 function setRay(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(pointer,camera);}
 function cancelDrag(){if(!drag)return;const d=drag;drag=null;controls.enabled=d.controlsEnabled;canvas.style.cursor='';if(canvas.hasPointerCapture(d.pointerId))canvas.releasePointerCapture(d.pointerId);}
 canvas.addEventListener('pointerdown',e=>{
   if(!game.state.active||e.button!==0)return;
   if(drag){e.preventDefault();e.stopImmediatePropagation();return;}
   setRay(e);model.updateMatrixWorld(true);
   let hit=ray.intersectObject(model,true).find(h=>{let n=h.object;if(n.userData.pickThrough)return false;while(n){if(!n.visible)return false;n=n.parent;}return true;});
   // A small forgiving volume also catches hollow rings and tiny touch targets.
   if(!hit){const candidates=[];for(const id of game.state.queue){if(game.state.placed.includes(id))continue;const object=runtime.assemblies[id].node;const point=ray.ray.intersectBox(new T.Box3().setFromObject(object).expandByScalar(.10),new T.Vector3());if(point)candidates.push({object,point,distance:point.distanceTo(ray.ray.origin)});}hit=candidates.sort((a,b)=>a.distance-b.distance)[0];}
   let node=hit?.object;while(node&&!node.userData.partId)node=node.parent;
   const id=node?.userData.partId;if(!id)return;
   e.preventDefault();e.stopImmediatePropagation();
   if(!game.state.queue.includes(id)||game.state.placed.includes(id)){return;}
   if(!pick(id))return;
   const plane=new T.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new T.Vector3()),hit.point);
   const origin=runtime.assemblies[id].node.getWorldPosition(new T.Vector3());
   drag={id,plane,offset:origin.sub(hit.point),position:runtime.assemblies[id].node.position.clone(),pointerId:e.pointerId,controlsEnabled:controls.enabled,near:null};
   controls.enabled=false;canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';
 },true);
 canvas.addEventListener('pointermove',e=>{
   if(!drag||e.pointerId!==drag.pointerId)return;e.preventDefault();e.stopImmediatePropagation();setRay(e);
   const point=ray.ray.intersectPlane(drag.plane,new T.Vector3());if(!point)return;
   drag.position.copy(model.worldToLocal(point.add(drag.offset)));
   const r=stage.getBoundingClientRect();let nearest=null,distance=Infinity;const tolerance=Math.min(56,Math.max(32,stage.clientWidth*.09));
   for(const [id,ghost]of ghosts){if(game.state.placed.includes(id))continue;
     const p=new T.Box3().setFromObject(ghost).getCenter(new T.Vector3()).project(camera);
     if(p.z<-1||p.z>1)continue;
     const x=r.left+(p.x*.5+.5)*r.width,y=r.top+(-p.y*.5+.5)*r.height,d=Math.hypot(e.clientX-x,e.clientY-y);
     if(id===drag.id&&d<tolerance){nearest=id;distance=d;break;}
     if(d<distance){distance=d;nearest=id;}}
   drag.near=distance<tolerance?nearest:null;
 },true);
 canvas.addEventListener('pointerup',e=>{
   if(!drag||e.pointerId!==drag.pointerId)return;e.preventDefault();e.stopImmediatePropagation();
   const target=drag.near;cancelDrag();if(target)place(target);else{game.state.feedback='Thả gần vòng tròn vị trí lắp để tự gắn. Bạn có thể kéo lại.';draw();}
 },true);
 canvas.addEventListener('pointercancel',cancelDrag,true);canvas.addEventListener('lostpointercapture',cancelDrag);window.addEventListener('blur',cancelDrag);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')cancelDrag();});
 function end(){controls.maxDistance=defaultMaxDistance;guide.visible=false;cancelDrag();game.stop();displayed.clear();window.speechSynthesis?.cancel();$('#assembly-panel').hidden=true;$('#assembly-start').textContent='Bắt đầu lắp ráp';document.body.classList.remove('assembly-playing');actions.reset();for(const a of Object.values(runtime.assemblies)){a.node.visible=true;a.node.scale.setScalar(1);}chosen=null;}
 function draw(){const s=game.state,done=s.index>=s.queue.length;$('#assembly-question').textContent=done?`Hoàn thành ${s.placed.length}/${s.queue.length} · ${s.errors} lần cần thử lại`: `${s.index+1}/${s.queue.length} · ${mode==='text'?`Hãy lắp: ${vocabulary[s.queue[s.index]][0]}`:'Nghe rồi chọn đúng bộ phận'}`;$('#assembly-feedback').textContent=s.feedback;$('#assembly-hear').disabled=done;$('#assembly-hint').disabled=done;
 $('#assembly-tray').innerHTML=trayOrder.map((id,i)=>`<button data-assembly-piece="${id}" ${s.placed.includes(id)?'disabled':''} aria-pressed="${s.selected===id}">${mode==='text'?vocabulary[id][0]:`Bộ phận ${i+1}`}${s.placed.includes(id)?' ✓':''}</button>`).join('');$('#assembly-tray').querySelectorAll('button').forEach(b=>b.onclick=()=>pick(b.dataset.assemblyPiece));
 }
 let trayOrder=[];const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 function pick(id){const ok=game.pick(id);draw();return ok;}
 function place(id){const ok=game.place(id);draw();if(ok&&mode==='audio'&&game.state.index<game.state.queue.length)speak(vocabulary[game.state.queue[game.state.index]][0]);}
 $('#assembly-start').onclick=()=>{end();reset();select(null);mode=$('#assembly-mode').value;const ids=Object.keys(runtime.assemblies);game.start(shuffle(ids));trayOrder=shuffle(ids);controls.autoRotate=false;document.querySelector('#rotate').checked=false;document.body.classList.add('assembly-playing');$('#assembly-panel').hidden=false;$('#assembly-start').textContent='Chơi lại';draw();if(mode==='audio')speak(vocabulary[game.state.queue[0]][0]);};
 $('#assembly-start').addEventListener('click',()=>{fitAssembly();$('#assembly-panel').scrollIntoView({block:'start'});});
 $('#assembly-exit').onclick=()=>{end();reset();};$('#assembly-hear').onclick=()=>{const id=game.state.queue[game.state.index];if(id)speak(vocabulary[id][0]);};$('#assembly-hint').onclick=()=>{const id=game.state.queue[game.state.index];if(id)$('#assembly-feedback').textContent=`Gợi ý: ${vocabulary[id][0]} — ${vocabulary[id][1]}. Bộ phận ${trayOrder.indexOf(id)+1}, vị trí ${slotOrder.indexOf(id)+1}.`;};

 function project(point,el){const p=point.clone().project(camera),w=stage.clientWidth,h=stage.clientHeight;el.hidden=p.z<-1||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1;const edge=el.offsetWidth/2+8;el.style.left=`${Math.max(edge,Math.min(w-edge,(p.x*.5+.5)*w))}px`;el.style.top=`${Math.max(el.offsetHeight+8,Math.min(h-30,(-p.y*.5+.5)*h))}px`;}
 function update(dt){
 if(game.state.active){guide.visible=true;const s=game.state;const done=s.placed.length===s.queue.length;for(const [id,g]of ghosts)g.visible=!s.placed.includes(id)&&!done;for(const [id,a]of Object.entries(runtime.assemblies)){a.node.visible=done||s.queue.includes(id);const loose=s.queue.includes(id)&&!s.placed.includes(id);const target=drag?.id===id?drag.position:loose?trayPosition(id):bind.get(id);if(!displayed.has(id))displayed.set(id,{position:target.clone(),scale:1});const shown=displayed.get(id);if(drag?.id===id)shown.position.copy(target);else shown.position.lerp(target,1-Math.exp(-9*dt));shown.scale=T.MathUtils.lerp(shown.scale,1,1-Math.exp(-9*dt));a.node.position.copy(shown.position);a.node.scale.setScalar(shown.scale);a.node.rotation.set(0,0,0);}model.updateMatrixWorld(true);}

 anchor.hidden=true;if(chosen&&!game.state.active){const node=runtime.nodes[chosen];model.updateMatrixWorld(true);const point=new T.Box3().setFromObject(node).getCenter(new T.Vector3());point.y+=.45;project(point,anchor);}
 }
 return {game,learned,pick,end,update,get active(){return game.state.active;}};
}
