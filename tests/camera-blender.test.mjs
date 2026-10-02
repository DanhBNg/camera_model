import test from 'node:test';
import assert from 'node:assert/strict';
import {Group,Vector3} from 'three';
import {CAMERA_PARTS} from '../src/demos/atelier-camera/geo.js';
import {createCameraActions} from '../src/demos/atelier-camera/actions.js';

test('expanded camera parts all have labels and finite explosion offsets',()=>{
  assert.equal(Object.keys(CAMERA_PARTS).length,17);
  for(const [id,part] of Object.entries(CAMERA_PARTS)){
    assert.ok(part.label && part.note);
    assert.ok(part.offset.length===3 && part.offset.every(Number.isFinite));
  }
});
test('detaching optics carries iris and reset restores every assembly',()=>{
  const root=new Group(),nodes={},assemblies={};
  for(const id of ['lens','glass','iris','back','shutter']){
    const node=new Group();root.add(node);node.position.z=1;
    nodes[id]=node;assemblies[id]={node,offset:new Vector3(0,0,1)};
  }
  const focus=new Group();nodes.lens.add(focus);
  root.userData.sculptRuntime={nodes,assemblies,pivots:{focus,back:nodes.back,shutter:nodes.shutter}};
  const actions=createCameraActions(root);actions.toggleLens();actions.update(2);
  assert.ok(Math.abs(nodes.iris.position.z-nodes.glass.position.z)<1e-6);
  assert.ok(nodes.iris.position.z>2);
  actions.reset();actions.update(2);
  for(const a of Object.values(assemblies))assert.equal(a.node.position.z,1);
});
