import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import cameraBytes from '../../assets/models/camera.glb';
import {CAMERA_PARTS} from './geo.js';

export async function loadCameraModel(){
  const gltf=await new GLTFLoader().parseAsync(cameraBytes.buffer.slice(cameraBytes.byteOffset,cameraBytes.byteOffset+cameraBytes.byteLength),'');
  const root=gltf.scene;root.name='atelier-35';
  const nodes={},assemblies={},scaled=new Set();
  // Asset is authored in metres; the established viewer/controller uses 35 mm units.
  root.traverse(o=>{
    o.position.multiplyScalar(1/.035);
    if(o.isMesh){
      if(!scaled.has(o.geometry)){o.geometry.scale(1/.035,1/.035,1/.035);scaled.add(o.geometry);}
      o.castShadow=true;o.receiveShadow=true;o.userData.explodeWithParent=true;
      if(o.material.transparent){o.material.depthWrite=false;o.material.side=THREE.DoubleSide;}
    }
    nodes[o.name]=o;
  });
  for(const [id,part] of Object.entries(CAMERA_PARTS)){
    const node=nodes[id];if(!node)throw new Error(`Missing Blender assembly: ${id}`);
    node.userData.partId=id;
    assemblies[id]={node,offset:new THREE.Vector3(...part.offset)};
  }
  if(!nodes['focus-pivot'])throw new Error('Missing lens focus pivot');
  root.updateMatrixWorld(true);
  root.userData.sculptRuntime={nodes,assemblies,pivots:{focus:nodes['focus-pivot'],shutter:nodes.shutter,back:nodes.back},
    sockets:{lensMount:new THREE.Vector3(.23,-.08,.64),tripod:new THREE.Vector3(.15,-1.14,0)},
    bounds:new THREE.Box3().setFromObject(root),
    provenance:{route:'imported-glb-static',source:'src/assets/models/camera.glb',pipeline:'design-os-3d-blender',inferred:['original ATELIER design','illustrative internal mechanisms and optics']}};
  return root;
}
