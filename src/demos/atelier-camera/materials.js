import * as THREE from 'three';

function grainTexture() {
  const c=document.createElement('canvas');c.width=c.height=256;
  const ctx=c.getContext('2d');const data=ctx.createImageData(256,256);
  let seed=317;
  for(let i=0;i<data.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const v=95+(seed%100);data.data.set([v,v,v,255],i);}
  ctx.putImageData(data,0,0);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,2);return t;
}
export function createCameraMaterials(){
  return {
    silver:new THREE.MeshStandardMaterial({color:0xc9cfce,metalness:.88,roughness:.29}),
    edge:new THREE.MeshStandardMaterial({color:0x919da0,metalness:.95,roughness:.2}),
    dark:new THREE.MeshStandardMaterial({color:0x171e21,metalness:.65,roughness:.3}),
    leather:new THREE.MeshStandardMaterial({color:0x173839,roughness:.85,bumpMap:grainTexture(),bumpScale:.023}),
    black:new THREE.MeshStandardMaterial({color:0x070b0d,roughness:.79}),
    brass:new THREE.MeshStandardMaterial({color:0xb99453,metalness:.8,roughness:.3}),
    orange:new THREE.MeshStandardMaterial({color:0xf16c3f,roughness:.35,metalness:.2}),
    glass:new THREE.MeshPhysicalMaterial({color:0x103c43,metalness:.55,roughness:.065,clearcoat:1,transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}),
    optic:new THREE.MeshPhysicalMaterial({color:0x080e1b,metalness:.72,roughness:.12,clearcoat:1}),
  };
}

export function labelTexture(text,{width=1024,height=128,color='#d5d5c8',background=null,size=65}={}){
  const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');
  if(background){ctx.fillStyle=background;ctx.fillRect(0,0,width,height);}
  ctx.fillStyle=color;ctx.font=`500 ${size}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,width/2,height/2);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
