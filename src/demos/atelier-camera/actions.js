import {MathUtils} from 'three';

// All transforms derive from bind poses; repeated updates cannot accumulate drift.
export function createCameraActions(root) {
  const runtime=root.userData.sculptRuntime;
  const bind=new Map(Object.values(runtime.assemblies).map(a=>[a.node,a.node.position.clone()]));
  const state={explosion:0,lensDetached:false,backOpen:false,focus:0,shot:0};
  let visibleExplosion=0, detach=0, back=0, shotTime=1;
  const api={
    state,
    get canExplode(){return !state.backOpen && back===0;},
    get canToggleBack(){return state.explosion===0 && visibleExplosion<.001;},
    get canShoot(){return state.explosion===0 && visibleExplosion<.001 && !state.lensDetached && detach<.001 && !state.backOpen && back===0 && shotTime>=.42;},
    setExplosion(value){if(!api.canExplode)return false;state.explosion=MathUtils.clamp(Number(value)||0,0,1);return true;},
    setFocus(value){state.focus=MathUtils.clamp(Number(value)||0,0,1);},
    toggleLens(){state.lensDetached=!state.lensDetached;},
    toggleBack(){if(!api.canToggleBack)return false;state.backOpen=!state.backOpen;return true;},
    shoot(){
      if(!api.canShoot) return false;
      shotTime=0; state.shot++; return true;
    },
    reset(){Object.assign(state,{explosion:0,lensDetached:false,backOpen:false,focus:0});visibleExplosion=detach=back=0;shotTime=1;},
    update(dt){
      const t=1-Math.exp(-12*Math.max(0,dt));
      visibleExplosion=MathUtils.lerp(visibleExplosion,state.explosion,t);
      detach=MathUtils.lerp(detach,state.lensDetached?1:0,t);
      back=MathUtils.lerp(back,state.backOpen?1:0,t);
      if(Math.abs(back-(state.backOpen?1:0))<.001)back=state.backOpen?1:0;
      for(const a of Object.values(runtime.assemblies)) a.node.position.copy(bind.get(a.node)).addScaledVector(a.offset,visibleExplosion);
      runtime.nodes.lens.position.z+=detach*1.1;
      if(runtime.nodes.glass) runtime.nodes.glass.position.z+=detach*1.1;
      if(runtime.nodes.iris) runtime.nodes.iris.position.z+=detach*1.1;
      runtime.nodes.lens.rotation.z=-detach*.28;
      runtime.pivots.focus.rotation.z=state.focus*Math.PI*.65;
      // +Y rotation moves the free edge (+X from the hinge) toward the rear (-Z).
      runtime.pivots.back.rotation.y=back*Math.PI*.7;
      shotTime+=dt;
      runtime.pivots.shutter.position.y-=shotTime<.28?Math.sin(Math.min(1,shotTime/.28)*Math.PI)*.065:0;
    },
  };
  return api;
}
