import test from 'node:test';
import assert from 'node:assert/strict';
import {Group, Vector3} from 'three';
import {createCameraActions} from '../src/demos/atelier-camera/actions.js';

function fixture() {
  const root = new Group();
  const lens = new Group(), shutter = new Group(), focus = new Group(), back = new Group();
  lens.position.set(0, 0, 1); back.position.set(-1.79,0,-.61); root.add(lens, shutter, back); lens.add(focus);
  root.userData.sculptRuntime = {nodes:{lens,shutter,back}, pivots:{focus,shutter,back}, assemblies:{
    lens:{node:lens,offset:new Vector3(0,0,2)},
    shutter:{node:shutter,offset:new Vector3(0,1,0)},
    back:{node:back,offset:new Vector3(0,0,-1)},
  }};
  return {lens,shutter,focus,back,actions:createCameraActions(root)};
}
test('explosion does not accumulate and reset restores every transform', () => {
  const f=fixture();
  f.actions.setExplosion(1); f.actions.update(1);
  const before=f.lens.position.clone();
  f.actions.update(1); assert.ok(f.lens.position.distanceTo(before)<0.001);
  f.actions.setFocus(1); f.actions.toggleLens(); f.actions.toggleBack(); f.actions.update(1);
  f.actions.reset(); f.actions.update(1);
  assert.ok(f.lens.position.distanceTo(new Vector3(0,0,1))<0.001);
  assert.ok(Math.abs(f.focus.rotation.z)<1e-9); assert.ok(Math.abs(f.back.rotation.y)<1e-9);
});
test('disassembled camera cannot shoot, and a held shutter cannot retrigger', () => {
  const f=fixture();
  f.actions.setExplosion(.5); assert.equal(f.actions.shoot(),false);
  f.actions.reset(); f.actions.toggleLens(); assert.equal(f.actions.shoot(),false);
  f.actions.reset(); f.actions.toggleBack(); assert.equal(f.actions.shoot(),false);
  f.actions.reset(); assert.equal(f.actions.shoot(),true); assert.equal(f.actions.shoot(),false);
  f.actions.update(1); assert.equal(f.actions.shoot(),true);
});
test('back door swings out behind the body and closes on the same hinge', () => {
  const f=fixture();
  const hinge=f.back.position.clone();
  f.actions.toggleBack();
  for(let i=0;i<60;i++){
    f.actions.update(1/60);f.back.updateMatrixWorld(true);
    const edge=f.back.localToWorld(new Vector3(3.58,0,0));
    assert.ok(f.back.position.distanceTo(hinge)<1e-9);
    assert.ok(edge.z<-.61,'free edge must swing behind the camera, not through it');
  }
  f.actions.toggleBack();f.actions.update(2);
  assert.ok(Math.abs(f.back.rotation.y)<1e-6);
});
test('opening the door and exploding assemblies are mutually exclusive', () => {
  const f=fixture();f.actions.setExplosion(.5);f.actions.update(.1);
  assert.equal(f.actions.toggleBack(),false);assert.equal(f.actions.state.backOpen,false);
  f.actions.reset();f.actions.toggleBack();f.actions.update(.1);
  assert.equal(f.actions.setExplosion(.5),false);assert.equal(f.actions.state.explosion,0);
  f.actions.toggleBack();assert.equal(f.actions.setExplosion(.5),false);
  assert.equal(f.actions.canShoot,false);
  f.actions.update(2);assert.equal(f.actions.canShoot,true);
  assert.equal(f.actions.setExplosion(.5),true);
});
