import * as THREE from 'three';
import {worldMaterial} from './geometry';
export class GltfCharacter{
 readonly root:THREE.Group;
 private mixer:THREE.AnimationMixer;
 private actions=new Map<string,THREE.AnimationAction>();
 private current='';
 constructor(scene:THREE.Group,clips:THREE.AnimationClip[]){this.root=scene.clone(true);this.root.traverse(o=>{if(o instanceof THREE.Mesh){o.material=worldMaterial;o.castShadow=true;o.receiveShadow=true;}});this.mixer=new THREE.AnimationMixer(this.root);clips.forEach(c=>this.actions.set(c.name,this.mixer.clipAction(c)));}
 animate(_time:number,speed:number,state:string,dt:number,board=false,_reducedMotion=false):void{const next=board?'board':state;const action=this.actions.get(next)??this.actions.get('idle');if(!action)return;if(this.current!==next){const prior=this.actions.get(this.current);action.reset().setEffectiveWeight(1).fadeIn(.12).play();prior?.fadeOut(.12);this.current=next;}action.setEffectiveTimeScale(next==='run'?Math.max(.7,speed/16):1);this.mixer.update(dt);}
 dispose():void{this.mixer.stopAllAction();this.mixer.uncacheRoot(this.root);}
}
