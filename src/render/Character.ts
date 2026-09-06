import * as THREE from 'three';
import { ShapeBuilder, palette as P, disposeTree } from './geometry';

export type CharacterAnimation='idle'|'run'|'jump'|'fall'|'land'|'slide'|'stumble'|'defeat'|'celebrate'|'board'|string;
interface Palette {skin:string;top:string;pants:string;hair:string;accent:string;}
const looks:Record<string,Palette>={
  pip:{skin:'#ba7855',top:P.teal,pants:'#38596b',hair:'#473a32',accent:P.yellow},
  rumi:{skin:'#d2976c',top:P.coral,pants:'#ed9652',hair:'#382f44',accent:P.plum},
  tavi:{skin:'#a77450',top:P.plum,pants:'#4f7070',hair:'#362f3a',accent:P.coral},
  jett:{skin:'#875c45',top:P.blue,pants:'#3865a9',hair:'#242c35',accent:P.yellow},
  nori:{skin:'#e8b594',top:P.cream,pants:'#4b7964',hair:'#935844',accent:P.leaf},
};

/** Original hand-authored articulated art; root position always belongs to simulation. */
export class RunnerCharacter {
  readonly root=new THREE.Group();
  private body=new THREE.Group();private head=new THREE.Group();
  private arms=[new THREE.Group(),new THREE.Group()];
  private legs=[new THREE.Group(),new THREE.Group()];
  private knees=[new THREE.Group(),new THREE.Group()];
  private feet=[new THREE.Group(),new THREE.Group()];
  private lean=0;private bend=0;
  readonly identity:string;readonly alternate:boolean;
  constructor(id='pip',outfit='default'){
    this.identity=id in looks?id:'pip';this.alternate=outfit!=='default'&&!outfit.endsWith('-default')&&outfit!=='base';
    const p=looks[this.identity],alt=this.alternate,k=this.identity;
    this.root.name=`runner-${k}-${alt?'alternate':'default'}`;this.root.add(this.body);
    this.body.position.y=.79;
    const torso=new ShapeBuilder();
    torso.round(.57,.64,.36,.11,p.top,0,.28,0).round(.52,.19,.35,.07,p.pants,0,-.07,0);
    torso.box(.032,.53,.025,p.accent,0,.29,.195).round(.13,.09,.03,.02,P.cream,.15,.35,.195);
    torso.cylinder(.11,.12,.16,p.skin,0,.65,0);
    if(k==='pip'){
      if(alt){torso.cylinder(.27,.41,.58,P.yellow,0,.23,-.02,0,0,0,7).box(.025,.53,.025,P.dark,0,.28,.39);torso.round(.37,.15,.32,.06,p.top,0,.57,-.06);}
      torso.round(.42,.50,.23,.08,alt?P.teal:P.yellow,0,.29,-.28).round(.32,.20,.08,.04,alt?P.cream:P.coral,0,.16,-.43);
      for(const s of [-1,1])torso.box(.06,.52,.055,P.cream,s*.20,.31,.17);
    }
    if(k==='rumi'){
      torso.round(.34,.33,.045,.03,alt?P.cream:P.yellow,0,.18,.2);
      for(const s of [-1,1]){torso.box(.07,.36,.045,alt?P.blue:P.coral,s*.18,.46,.19);torso.sphere(.035,P.ink,s*.18,.31,.228);}
      if(alt){torso.cylinder(.26,.36,.60,P.cream,0,.17,0,0,0,0,8);for(let n=0;n<8;n++)torso.sphere(.035,[P.coral,P.teal,P.plum][n%3],Math.sin(n*3)*.2,.10+n*.045,.335,1,.65,.2);}
      torso.cylinder(.055,.055,.26,P.blue,.34,.12,-.16,0,0,-.2).cylinder(.055,.055,.27,P.yellow,-.32,.13,-.17,0,0,.2);
    }
    if(k==='tavi'){
      torso.round(.17,.23,.05,.025,P.dark,-.16,.18,.20).round(.17,.23,.05,.025,P.dark,.16,.18,.20);
      torso.box(.57,.09,.40,alt?P.coral:P.sand,0,-.015,0).box(.10,.10,.025,P.yellow,0,-.015,.22);
      for(const s of [-1,1])torso.box(.07,.26,.06,P.metal,s*.2,.38,.23);
      if(alt){torso.round(.16,.5,.06,.025,P.teal,0,.25,.21).round(.18,.23,.18,.035,P.yellow,.34,-.02,0).round(.17,.27,.12,.04,P.dark,-.32,0,0);}
    }
    if(k==='jett'){
      for(const s of [-1,1])torso.box(.055,.53,.045,P.cream,s*.20,.25,.19);
      if(alt){torso.round(.62,.35,.42,.11,P.coral,0,.43,0).torus(.20,.06,P.yellow,0,.67,0,Math.PI/2);torso.round(.30,.13,.045,.025,P.ink,0,.05,.205);}
      torso.torus(.105,.018,P.yellow,0,.42,.23,0,0,0);
    }
    if(k==='nori'){
      torso.box(.075,.6,.055,P.dark,.03,.24,.21,0,0,-.56).round(.24,.16,.12,.025,P.ink,.14,.08,.26).cylinder(.065,.065,.06,P.metal,.14,.08,.35,Math.PI/2);
      torso.round(.28,.33,.16,.06,alt?P.sand:P.leaf,-.28,.08,-.13);
      if(alt){for(const s of [-1,1])torso.round(.19,.24,.05,.02,P.sand,s*.17,.27,.20);torso.round(.38,.37,.18,.05,P.coral,0,.2,-.26);}
    }
    this.body.add(torso.mesh());
    this.head.position.set(0,.91,0);this.body.add(this.head);
    const face=new ShapeBuilder();
    face.round(.47,.51,.43,.14,p.skin,0,0,0).sphere(.07,p.skin,0,-.04,.249,.72,.76,1);
    for(const s of [-1,1]){
      face.sphere(.079,p.skin,s*.245,-.025,0,.7,1,.7).sphere(.063,P.white,s*.12,.025,.214,1,1,.4).sphere(.029,P.ink,s*.12,.024,.24,1,1,.5);
      face.round(.12,.03,.03,.012,p.hair,s*.12,.105,.218,0,0,s*.10);
    }
    face.round(.14,.028,.027,.014,'#7d4034',0,-.133,.213).round(.12,.02,.025,.007,P.white,0,-.126,.23);
    if(k==='pip'){
      for(let i=0;i<7;i++)face.sphere(.115,p.hair,Math.sin(i*1.8)*.17,.22+Math.cos(i)*.025,Math.cos(i*1.8)*.16);
      face.round(.50,.095,.41,.045,P.teal,0,.18,0).round(.46,.025,.20,.025,P.coral,0,.175,.255,0,-.12,0);
      if(alt)face.round(.49,.12,.44,.055,P.yellow,0,.25,-.02);
    }
    if(k==='rumi'){
      face.round(.51,.21,.45,.1,p.hair,0,.22,-.035).round(.13,.40,.30,.06,p.hair,-.24,.025,-.065).round(.13,.40,.30,.06,p.hair,.24,.025,-.065);
      for(const s of [-1,1])face.sphere(.10,P.plum,s*.30,.005,0,.5,1,1);
      if(alt)face.round(.55,.15,.46,.075,P.blue,0,.32,-.01);
    }
    if(k==='tavi'){
      face.round(.47,.12,.40,.055,p.hair,0,.23,-.02).round(.18,.15,.38,.06,p.hair,-.12,.31,-.01);
      for(const s of [-1,1]){face.torus(.077,.025,P.yellow,s*.105,.22,.20);face.sphere(.06,P.teal,s*.105,.22,.208,1,1,.3);}
      if(alt)face.round(.54,.10,.48,.04,P.sand,0,.30,0);
    }
    if(k==='jett'){
      for(let i=0;i<10;i++)face.sphere(.13,p.hair,Math.sin(i*2.4)*.19,.24+(i%3)*.055,Math.cos(i*2.4)*.13);
      face.round(.50,.065,.44,.03,alt?P.coral:P.yellow,0,.15,-.01);
    }
    if(k==='nori'){
      face.round(.50,.18,.44,.075,p.hair,0,.20,-.045);
      for(const s of [-1,1])face.sphere(.12,p.hair,s*.20,.25,-.20);
      if(alt){face.cylinder(.28,.28,.08,P.sand,0,.27,0).cylinder(.20,.23,.18,P.sand,0,.38,0);}
      else face.round(.46,.025,.19,.025,P.leaf,0,.17,.26);
    }
    this.head.add(face.mesh());
    for(let i=0;i<2;i++){
      const s=i?1:-1,arm=this.arms[i],leg=this.legs[i],knee=this.knees[i],foot=this.feet[i];
      arm.position.set(s*.36,.52,0);this.body.add(arm);
      const a=new ShapeBuilder();a.round(.19,.32,.23,.07,alt&&k==='jett'?P.coral:p.top,0,-.13,0).round(.15,.27,.16,.06,k==='tavi'?P.sand:p.skin,0,-.36,.035).round(.18,.16,.17,.065,k==='tavi'?P.dark:p.skin,0,-.50,.04);
      if(k==='rumi')a.round(.21,.14,.23,.055,P.plum,0,-.28,.015);arm.add(a.mesh());
      leg.position.set(s*.16,-.13,0);this.body.add(leg);
      leg.add(new ShapeBuilder().round(alt&&k==='jett'?.25:.23,.32,.25,.07,p.pants,0,-.135,0).mesh());
      knee.position.y=-.27;leg.add(knee);
      const lower=new ShapeBuilder().round(.18,.29,.19,.055,alt&&k==='pip'?p.skin:p.pants,0,-.11,0);
      if(k==='rumi')lower.round(.21,.17,.055,.025,P.plum,0,.035,.12);
      if(k==='jett')lower.box(.03,.28,.20,P.cream,s*.093,-.1,0);
      knee.add(lower.mesh());foot.position.y=-.235;knee.add(foot);
      foot.add(new ShapeBuilder().round(.24,.17,.39,.06,p.accent,0,-.015,.08).round(.25,.055,.40,.025,P.white,0,-.084,.08).box(.13,.022,.12,P.cream,0,.07,.10).mesh());
    }
  }
  animate(time:number,speed:number,state:CharacterAnimation,dt:number,board=false,reducedMotion=false):void {
    const run=state==='run', phase=time*Math.max(9,speed*.78), mix=Math.min(1,dt*14);
    let bodyY=.79,pitch=0,legSwing=0,armSwing=0,lean=0,bend=0;
    if(run){bodyY+=Math.abs(Math.sin(phase))*.035;legSwing=.68;armSwing=.62;pitch=.10;}
    if(state==='idle'){bodyY+=Math.sin(time*2)*.009;armSwing=.055;}
    if(state==='jump'){pitch=-.09;lean=-.20;bend=.68;}
    if(state==='fall'){pitch=.08;lean=.25;bend=.20;}
    if(state==='land'){bodyY=.72;bend=.30;}
    if(state==='slide'){bodyY=.33;pitch=-.80;lean=-1.12;bend=.10;}
    if(state==='stumble'){pitch=.50;lean=.20;armSwing=.9;}
    if(state==='defeat'){bodyY=.39;pitch=-1.1;lean=-.75;bend=.10;}
    if(state==='celebrate'){bodyY+=Math.max(0,Math.sin(time*6))*.12;legSwing=.1;armSwing=.1;}
    if(board){bodyY=.79;pitch=.05;lean=.18;bend=.25;armSwing=.12;}
    this.body.position.y=THREE.MathUtils.lerp(this.body.position.y,bodyY,mix);this.body.rotation.x=THREE.MathUtils.lerp(this.body.rotation.x,pitch,mix);
    this.lean=THREE.MathUtils.lerp(this.lean,lean,mix);this.bend=THREE.MathUtils.lerp(this.bend,bend,mix);
    this.head.rotation.y=state==='idle'?Math.sin(time*.6)*.10:0;
    this.head.rotation.x=state==='slide'?.6:-pitch*.4;
    for(let i=0;i<2;i++){
      const s=i?1:-1,t=phase+i*Math.PI;
      const targetLeg=Math.sin(t)*legSwing+this.lean;
      this.legs[i].rotation.x=THREE.MathUtils.lerp(this.legs[i].rotation.x,targetLeg,mix);
      this.knees[i].rotation.x=THREE.MathUtils.lerp(this.knees[i].rotation.x,(run?Math.max(0,-Math.sin(t))*.83:0)+this.bend,mix);
      this.feet[i].rotation.x=-this.knees[i].rotation.x*.55-this.legs[i].rotation.x*.36;
      const arm=state==='celebrate'?-2.7:Math.sin(t+Math.PI)*armSwing+(state==='jump'?-1.0:state==='slide'?.5:0);
      this.arms[i].rotation.x=THREE.MathUtils.lerp(this.arms[i].rotation.x,arm,mix);
      this.arms[i].rotation.z=THREE.MathUtils.lerp(this.arms[i].rotation.z,s*(board?.50:state==='fall'?.6:.10),mix);
    }
    this.body.rotation.z=run&&!reducedMotion?Math.sin(phase)*.028:0;
  }
  dispose():void{disposeTree(this.root);}
}

export function makeBoard(id='tide'):THREE.Mesh {
  const b=new ShapeBuilder(),ember=id==='ember';
  if(ember){b.box(.70,.12,1.12,P.coral,0,0,0).box(.50,.12,.43,P.coral,0,0,.61,0,0,0).box(.50,.12,.43,P.coral,0,0,-.61);b.box(.15,.05,1.40,P.cream,0,.09,0);}
  else {b.round(.70,.14,1.62,.16,P.teal).round(.53,.045,1.23,.10,P.ink,0,.09,0);}
  for(const s of [-1,1]){b.round(.44,.045,.28,.04,ember?P.ink:P.coral,0,.105,s*.36).round(.20,.17,1.02,.06,P.dark,s*.23,-.10,0);b.round(.09,.045,1.12,.02,ember?P.yellow:'#73f0d6',s*.315,-.07,0);}
  return b.mesh();
}
