import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createAtelierCameraLookDevLights} from './createAtelierCameraModel.js';
import {loadCameraModel} from './loadCameraModel.js';
import {createCameraActions} from './actions.js';
import {CAMERA_PARTS,CAMERA_VIEW} from './geo.js';

const $=s=>document.querySelector(s);
const stage=$('#stage');
async function boot(){
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  stage.append(renderer.domElement);renderer.domElement.tabIndex=0;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(CAMERA_VIEW.fov,1,.05,100);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
  const env=pmrem.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.6;room.dispose();pmrem.dispose();
  const model=await loadCameraModel();scene.add(model,createAtelierCameraLookDevLights());
  const originalMaterials=new Set();model.traverse(o=>{if(o.isMesh){originalMaterials.add(o.material);o.material=o.material.clone();}});originalMaterials.forEach(m=>m.dispose());
  const actions=createCameraActions(model),runtime=model.userData.sculptRuntime;
  let learning;
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.075;controls.minDistance=4;controls.maxDistance=40;controls.maxPolarAngle=Math.PI*.94;controls.autoRotateSpeed=.65;
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  let selected=null,isolate=false,highlighted=[],viewName='hero',last=performance.now(),frameCount=0,statsAt=last;
  const views={hero:[5.7,3.1,7.8],front:[0,.2,9.5],back:[-.4,2.1,-9.2],top:[0,9,.65]};
  function setView(name='hero'){
    controls.enableDamping=false;controls.update();
    viewName=name;controls.target.set(...CAMERA_VIEW.target);camera.position.set(...views[name]);
    controls.update();
    if(stage.clientWidth<600 || actions.state.explosion>0){
      model.updateMatrixWorld(true);
      const b=new THREE.Box3().setFromObject(model),tan=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
      const inverse=camera.quaternion.clone().invert();let distance=0;
      for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){
        const v=new THREE.Vector3(x,y,z).sub(controls.target).applyQuaternion(inverse);
        distance=Math.max(distance,Math.abs(v.x)/(tan*camera.aspect)+v.z,Math.abs(v.y)/tan+v.z);
      }
      const offset=camera.position.clone().sub(controls.target);
      camera.position.copy(offset.setLength(Math.max(offset.length(),distance*1.18))).add(controls.target);
      controls.update();
    }
    controls.enableDamping=true;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  }
  function resize(){renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/Math.max(1,stage.clientHeight);camera.updateProjectionMatrix();if(stage.clientWidth<600)setView(viewName);}
  new ResizeObserver(resize).observe(stage);resize();setView();
  function toast(text){$('#toast').textContent=text;}
  function restoreHighlight(){for(const [o,material,copy] of highlighted){o.material=material;copy.dispose();}highlighted=[];}
  function select(id){
    if(learning?.active){if(id)learning.pick(id);return;}
    restoreHighlight();selected=id;
    for(const [key,a] of Object.entries(runtime.assemblies))a.node.visible=!isolate || key===selected;
    if(id){runtime.nodes[id].traverse(o=>{if(o.isMesh&&o.material.emissive){const old=o.material,copy=old.clone();copy.emissive.set(0x688445);copy.emissiveIntensity=.25;o.material=copy;highlighted.push([o,old,copy]);}});}
    $('#selection-index').textContent=id?`BỘ PHẬN ${String(Object.keys(CAMERA_PARTS).indexOf(id)+1).padStart(2,'0')} / ${Object.keys(CAMERA_PARTS).length}`:'THIẾT KẾ NGUYÊN BẢN';
    $('#selection-title').textContent=id?CAMERA_PARTS[id].label:'Chạm để khám phá';
    $('#selection-note').textContent=id?CAMERA_PARTS[id].note:'Chọn một bộ phận trên mô hình để xem chi tiết và cấu tạo của nó.';
    $('#isolate').hidden=!id;$('#isolate').textContent=isolate?'Hiện toàn bộ máy':'Chỉ xem bộ phận này';
    document.querySelectorAll('[data-part]').forEach(b=>{b.classList.toggle('active',b.dataset.part===id);b.setAttribute('aria-pressed',String(b.dataset.part===id));});
    if(id)toast(CAMERA_PARTS[id].label);
    learning?.learned(id);
  }
  function sync(){
    const s=actions.state;$('#explode').value=Math.round(s.explosion*100);$('#explode-value').textContent=`${Math.round(s.explosion*100)}%`;
    $('#focus').value=s.focus*100;$('#focus-value').textContent=`${Math.round(s.focus*117)}°`;
    $('#detach span').textContent=s.lensDetached?'Lắp ống kính':'Tháo ống kính';$('#detach').setAttribute('aria-pressed',String(s.lensDetached));
    $('#open-back span').textContent=s.backOpen?'Đóng nắp lưng':'Mở nắp lưng';$('#open-back').setAttribute('aria-pressed',String(s.backOpen));
    syncAvailability();
  }
  function syncAvailability(){
    $('#shoot').disabled=!actions.canShoot;
    $('#open-back').disabled=!actions.canToggleBack;
    $('#open-back').title=actions.canToggleBack?'':'Ráp các bộ phận về 0% trước khi mở nắp lưng.';
    $('#explode').disabled=!actions.canExplode;
    $('#explode').title=actions.canExplode?'':'Đóng nắp lưng trước khi tách bộ phận.';
    if(learning?.active)for(const id of ['shoot','open-back','explode','detach','focus','isolate','wire','rotate'])$('#'+id).disabled=true;
    else for(const id of ['detach','focus','isolate','wire','rotate'])$('#'+id).disabled=false;
  }
  $('#explode').addEventListener('input',e=>{
    const before=actions.state.explosion;
    if(actions.setExplosion(e.target.value/100)){
      const ratio=(1+.48*actions.state.explosion)/(1+.48*before);
      camera.position.sub(controls.target).multiplyScalar(ratio).add(controls.target);controls.update();
    }
    sync();
  });
  $('#focus').addEventListener('input',e=>{actions.setFocus(e.target.value/100);sync();});
  $('#detach').onclick=()=>{actions.toggleLens();sync();};$('#open-back').onclick=()=>{if(actions.toggleBack())toast(actions.state.backOpen?'Đang mở nắp lưng ra ngoài.':'Đang đóng nắp lưng.');sync();};
  $('#shoot').onclick=()=>{if(!actions.shoot()){toast('Đợi máy ráp lại hoàn chỉnh để chụp.');return;}const f=$('#flash');f.classList.remove('firing');void f.offsetWidth;f.classList.add('firing');toast(`Đã chụp thử · Khung hình ${String(actions.state.shot).padStart(2,'0')}`);};
  function reset(){learning?.end();actions.reset();isolate=false;select(null);$('#rotate').checked=false;controls.autoRotate=false;$('#wire').checked=false;setWire(false);setView();sync();toast('Đã trở về trạng thái ban đầu.');}
  $('#reset').onclick=reset;$('.wordmark').onclick=e=>{e.preventDefault();reset();};
  $('#isolate').onclick=()=>{isolate=!isolate;select(selected);};
  function setWire(value){model.traverse(o=>{if(o.isMesh)o.material.wireframe=value;});for(const [,m] of highlighted)m.wireframe=value;}
  $('#wire').onchange=e=>setWire(e.target.checked);$('#rotate').onchange=e=>{controls.autoRotate=e.target.checked;};
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
  function zoom(factor){const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update();}
  $('#zoom-in').onclick=()=>zoom(.85);$('#zoom-out').onclick=()=>zoom(1.18);
  for(const [id,part] of Object.entries(CAMERA_PARTS)){const b=document.createElement('button');b.dataset.part=id;b.innerHTML=`<small>${String(Object.keys(CAMERA_PARTS).indexOf(id)+1).padStart(2,'0')}</small>${part.label}`;b.onclick=()=>select(id);$('#part-list').append(b);}
  for(const tab of ['actions','parts'])$(`#tab-${tab}`).onclick=()=>{for(const key of ['actions','parts']){$(`#${key}-panel`).hidden=key!==tab;$(`#tab-${key}`).classList.toggle('active',key===tab);$(`#tab-${key}`).setAttribute('aria-pressed',String(key===tab));}};
  $('#collapse').onclick=()=>{const collapsed=$('#inspector').classList.toggle('collapsed');document.body.classList.toggle('panel-collapsed',collapsed);$('#collapse').textContent=collapsed?'⌃':'⌄';$('#collapse').setAttribute('aria-expanded',String(!collapsed));$('#collapse').setAttribute('aria-label',collapsed?'Mở bảng điều khiển':'Thu gọn bảng điều khiển');};
  let down=null,multi=false;const pointers=new Set();
  renderer.domElement.addEventListener('pointerdown',e=>{pointers.add(e.pointerId);if(pointers.size>1)multi=true;else {multi=false;down=[e.clientX,e.clientY,e.button];}});
  renderer.domElement.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);down=null;});
  renderer.domElement.addEventListener('pointerup',e=>{
    pointers.delete(e.pointerId);
    if(!down||multi||down[2]!==0||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6){down=null;return;}
    down=null;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
    const hits=raycaster.intersectObject(model,true).filter(h=>{if(h.object.userData.pickThrough)return false;let n=h.object;while(n&&n!==model){if(!n.visible)return false;n=n.parent;}return true;});
    if(hits[0]){let n=hits[0].object;while(n&&!n.userData.partId)n=n.parent;if(n)select(n.userData.partId);}else if(!isolate)select(null);
  });
  renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){isolate=false;select(null);}});
  // Learning/assembly gameplay is deferred at the owner's request.
  $('#loading').remove();sync();
  renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000,.05);last=now;actions.update(dt);syncAvailability();controls.update();learning?.update(dt);renderer.render(scene,camera);frameCount++;
    if(now-statsAt>1000){$('#stats').textContent=`${renderer.info.render.triangles.toLocaleString('vi-VN')} tam giác · ${renderer.info.render.calls} lượt vẽ · ${Math.round(frameCount*1000/(now-statsAt))} FPS`;statsAt=now;frameCount=0;}
  });
  window.cameraShowcase={model,actions,select,setView,reset,renderer,camera,controls,learning,stats:()=>({...renderer.info.render}),ready:true};
}
boot().catch(error=>{console.error(error);$('#loading').textContent='Không khởi tạo được 3D. Hãy mở bằng Chrome hoặc Edge có bật tăng tốc đồ họa.';});
