import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {CAMERA_PARTS} from './geo.js';
import {createCameraMaterials,labelTexture} from './materials.js';

// Factory contract follows the showcase's named nodes/pivots/sockets pattern.
// Geometry and finish are original. No imported model, reference projection or AI image assets.
export function createAtelierCameraModel({shadows=true}={}){
  const root=new THREE.Group();root.name='atelier-35';
  const m=createCameraMaterials(),nodes={},assemblies={};
  function assembly(id,x=0,y=0,z=0){const g=new THREE.Group();g.name=id;g.position.set(x,y,z);g.userData.partId=id;root.add(g);nodes[id]=g;assemblies[id]={node:g,offset:new THREE.Vector3(...CAMERA_PARTS[id].offset)};return g;}
  function mesh(parent,name,geo,mat,x=0,y=0,z=0){const o=new THREE.Mesh(geo,mat);o.name=name;o.position.set(x,y,z);o.castShadow=shadows;o.receiveShadow=shadows;o.userData.explodeWithParent=true;o.userData.pickThrough=!!(mat.isMeshBasicMaterial&&mat.transparent);parent.add(o);nodes[name]=o;return o;}
  const box=(p,n,w,h,d,x,y,z,mat=m.silver,r=.04)=>mesh(p,n,new RoundedBoxGeometry(w,h,d,3,r),mat,x,y,z);
  const cylinder=(p,n,r,h,x,y,z,mat=m.dark)=>mesh(p,n,new THREE.CylinderGeometry(r,r,h,64),mat,x,y,z);
  function ring(p,n,outer,inner,depth,x,y,z,mat=m.dark){
    const profile=[[inner,-depth/2],[outer-.015,-depth/2],[outer,-depth/2+.015],[outer,depth/2-.015],[outer-.015,depth/2],[inner,depth/2],[inner,-depth/2]];
    const geo=new THREE.LatheGeometry(profile.map(v=>new THREE.Vector2(...v)),80);geo.rotateX(Math.PI/2);return mesh(p,n,geo,mat,x,y,z);
  }
  function label(p,n,text,w,h,x,y,z,options){const mat=new THREE.MeshBasicMaterial({map:labelTexture(text,options),transparent:true,depthWrite:false,side:THREE.DoubleSide});return mesh(p,n,new THREE.PlaneGeometry(w,h),mat,x,y,z);}
  function ribs(p,n,r,z,length,count=80){const gs=[];for(let i=0;i<count;i++){const a=i/count*Math.PI*2;const g=new RoundedBoxGeometry(.023,.045,length,1,.007);g.rotateZ(a);g.translate(Math.sin(a)*r,Math.cos(a)*r,z);gs.push(g);}const merged=mergeGeometries(gs);gs.forEach(g=>g.dispose());return mesh(p,n,merged,m.edge);}
  function screw(p,x,y,z){const s=cylinder(p,`screw-${Object.keys(nodes).length}`,.042,.013,x,y,z,m.edge);s.rotation.x=Math.PI/2;box(p,`slot-${Object.keys(nodes).length}`,.048,.008,.004,x,y,z+.009,m.black,.001);}
  const body=assembly('body');
  // Chassis walls leave the back open for the film compartment.
  const outline=new THREE.Shape();
  outline.moveTo(-1.77,-.95);outline.lineTo(1.77,-.95);outline.quadraticCurveTo(1.9,-.95,1.9,-.82);outline.lineTo(1.9,.74);outline.quadraticCurveTo(1.9,.87,1.77,.87);outline.lineTo(-1.77,.87);outline.quadraticCurveTo(-1.9,.87,-1.9,.74);outline.lineTo(-1.9,-.82);outline.quadraticCurveTo(-1.9,-.95,-1.77,-.95);
  const opening=new THREE.Path();opening.absarc(.23,-.08,.635,0,Math.PI*2,true);outline.holes.push(opening);
  mesh(body,'front-shell',new THREE.ExtrudeGeometry(outline,{depth:.11,bevelEnabled:true,bevelThickness:.04,bevelSize:.035,bevelSegments:3,steps:1,curveSegments:40}),m.dark,0,0,.405);
  box(body,'left-shell',.19,1.82,1.05,-1.8,-.04,0,m.dark,.08);
  box(body,'right-shell',.19,1.82,1.05,1.8,-.04,0,m.dark,.08);
  box(body,'inner-deck',3.45,.16,1.05,0,-.86,0,m.dark);
  box(body,'leather-front-left',1.05,1.6,.08,-1.3,-.06,.585,m.leather,.09);
  box(body,'leather-front-right',.53,1.6,.08,1.57,-.06,.585,m.leather,.09);
  box(body,'leather-side-left',.075,1.6,.84,-1.909,-.06,-.005,m.leather);
  box(body,'leather-side-right',.075,1.6,.84,1.909,-.06,-.005,m.leather);
  const badge=cylinder(body,'orange-badge',.117,.03,-1.3,.39,.648,m.orange);badge.rotation.x=Math.PI/2;
  label(body,'badge-a','A',.16,.13,-1.3,.39,.67,{size:87,color:'#111a1a'});
  label(body,'model-mark','35',.25,.16,1.53,-.5,.639,{size:86});
  for(const x of [-1.65,1.65]){const lug=ring(body,`strap-lug-${x}`,.14,.078,.075,x,.6,0,m.edge);lug.rotation.y=Math.PI/2;}
  // A simplified film path is visible only when the back door is open.
  box(body,'film-gate',1.5,1.02,.05,.1,-.05,.28,m.black);
  box(body,'film-window',1.28,.78,.03,.1,-.05,.245,m.optic);
  for(const x of [-1.22,1.32]){cylinder(body,`film-spool-${x}`,.22,1.24,x,-.02,-.04,m.dark);cylinder(body,`spool-cap-${x}`,.26,.07,x,.62,-.04,m.edge);}
  const top=assembly('top',0,1.015,0);
  box(top,'top-plate',3.84,.37,1.2,0,0,0,m.silver,.11);
  label(top,'brand','A T E L I E R',1.02,.16,-.19,.025,.611,{color:'#243334',size:61});
  for(const [x,r] of [[-1.3,.32],[.76,.3]]){
    cylinder(top,`dial-${x}`,r,.16,x,.24,-.03,m.dark);
    cylinder(top,`dial-face-${x}`,r-.025,.018,x,.328,-.03,m.silver);
    const dial=new THREE.Group();dial.position.set(x,.25,-.03);dial.rotation.x=Math.PI/2;top.add(dial);ribs(dial,`dial-knurl-${x}`,r,0,.1,40);
    const print=label(top,`dial-label-${x}`,x<0?'ISO  200':'125  250',r*1.5,.13,x,.34,-.03,{color:'#172625',size:62});print.rotation.x=-Math.PI/2;
  }
  box(top,'film-lever',.57,.065,.13,1.24,.22,-.22,m.dark,.035);
  const base=assembly('base',0,-1.035,0);
  box(base,'bottom-plate',3.84,.18,1.2,0,0,0,m.silver,.065);
  cylinder(base,'tripod-insert',.12,.02,.15,-.1,0,m.brass);
  const mount=assembly('mount',.23,-.08,.64);
  ring(mount,'bayonet',.875,.653,.12,0,0,0,m.edge);
  ring(mount,'mount-inner',.71,.625,.15,0,0,.04,m.black);
  for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;screw(mount,Math.cos(a)*.79,Math.sin(a)*.79,.075);}
  const marker=cylinder(mount,'mount-index',.036,.02,0,.8,.085,m.orange);marker.rotation.x=Math.PI/2;
  const lens=assembly('lens',.23,-.08,.87);
  ring(lens,'lens-barrel',.695,.56,.53,0,0,.13,m.dark);
  ring(lens,'aperture-ring',.735,.58,.15,0,0,.03,m.edge);
  const focus=new THREE.Group();focus.name='focus-pivot';lens.add(focus);
  ring(focus,'focus-ring',.775,.58,.37,0,0,.4,m.dark);ribs(focus,'focus-grip',.775,.4,.29,88);
  ring(lens,'front-barrel',.736,.582,.24,0,0,.68,m.dark);
  ring(lens,'front-rim',.768,.612,.07,0,0,.82,m.edge);
  ring(lens,'name-ring',.716,.563,.035,0,0,.852,m.black);
  // Lettering follows the rim rather than a flat label across the lens.
  const rimCanvas=document.createElement('canvas');rimCanvas.width=rimCanvas.height=512;const c=rimCanvas.getContext('2d');
  c.translate(256,256);c.fillStyle='#c8c8bb';c.font='19px Arial';c.textAlign='center';
  const letters='A T E L I E R   •   1 : 1.8 / 50   •   M U L T I C O A T E D   •   ';
  [...letters].forEach((ch,i)=>{c.save();c.rotate(-Math.PI/2+i/letters.length*Math.PI*2);c.translate(212,0);c.rotate(Math.PI/2);c.fillText(ch,0,6);c.restore();});
  const rimTex=new THREE.CanvasTexture(rimCanvas);rimTex.colorSpace=THREE.SRGBColorSpace;
  mesh(lens,'lens-engraving',new THREE.PlaneGeometry(1.5,1.5),new THREE.MeshBasicMaterial({map:rimTex,transparent:true,depthWrite:false}),0,0,.875);
  const glass=assembly('glass',.23,-.08,1.6);
  const surface=new THREE.SphereGeometry(.565,64,24,0,Math.PI*2,0,Math.PI/2);surface.rotateX(Math.PI/2);surface.scale(1,1,.1);
  mesh(glass,'front-element',surface,m.glass,0,0,.05);
  const rearElement=cylinder(glass,'rear-element',.53,.015,0,0,-.19,m.optic);rearElement.rotation.x=Math.PI/2;
  // Iris shape with a real central aperture; not intended as an optical simulation.
  ring(glass,'iris',.53,.18,.025,0,0,-.08,m.dark);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const blade=box(glass,`iris-blade-${i}`,.24,.018,.006,Math.cos(a)*.34,Math.sin(a)*.34,-.06,m.edge,.003);blade.rotation.z=a+.4;}
  const back=assembly('back',-1.79,0,-.61);
  box(back,'back-door',3.58,1.78,.115,1.79,-.05,0,m.dark,.08);
  box(back,'back-leather',3.31,1.52,.035,1.79,-.05,-.079,m.leather,.075);
  const rearLabel=label(back,'rear-lettering','ATELIER  /  35 MM',1.6,.16,1.79,.2,-.103,{size:59});rearLabel.rotation.y=Math.PI;
  box(back,'film-reminder',.68,.48,.02,1.79,-.26,-.112,m.edge,.02);
  const rem=label(back,'film-label','COLOR 200',.59,.24,1.79,-.26,-.129,{color:'#ded8bd',background:'#263730',size:55});rem.rotation.y=Math.PI;
  const finder=assembly('finder',-.78,1.045,0);
  box(finder,'finder-surround',.5,.245,.045,0,0,.62,m.dark,.035);
  box(finder,'finder-front',.36,.15,.013,0,0,.651,m.glass,.025);
  box(finder,'rear-eyecup',.54,.28,.15,0,0,-.65,m.black,.055);
  box(finder,'rear-glass',.35,.15,.02,0,0,-.733,m.optic,.025);
  const shutter=assembly('shutter',1.46,1.34,.23);
  cylinder(shutter,'shutter-seat',.17,.065,0,-.04,0,m.dark);
  cylinder(shutter,'release-button',.135,.08,0,.025,0,m.silver);
  cylinder(shutter,'release-inlay',.095,.013,0,.071,0,m.orange);
  const bounds=new THREE.Box3().setFromObject(root);
  root.userData.sculptRuntime={nodes,assemblies,pivots:{focus,shutter,back},sockets:{lensMount:new THREE.Vector3(.23,-.08,.64),tripod:new THREE.Vector3(.15,-1.14,0)},bounds,provenance:{route:'original-procedural-design',reference:null,inferred:['all design dimensions','simplified film compartment','illustrative optics']}};
  return root;
}

export function createAtelierCameraLookDevLights(){
  const g=new THREE.Group();
  for(const [color,intensity,pos] of [[0xffe1b5,3.1,[2,5,4]],[0x91c8ea,2.2,[-4,2,1]],[0xffffff,3,[1,3,-4]]]){const l=new THREE.DirectionalLight(color,intensity);l.position.set(...pos);g.add(l);}
  g.add(new THREE.HemisphereLight(0xa3bec6,0x202823,1));return g;
}
