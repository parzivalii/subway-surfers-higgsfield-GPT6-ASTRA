import * as THREE from 'three';
import {ShapeBuilder,palette as P,hash} from './geometry';

export type District='station'|'mural'|'waterfront';
const pale=['#efc18f','#f3d6a5','#e8ab83','#edbd9f'];

function window(b:ShapeBuilder,x:number,y:number,z:number,side:number,c=P.darkTeal):void {
  b.round(.065,.87,.67,.025,P.cream,x,y,z).box(.07,.64,.48,c,x-side*.015,y+.02,z);
  b.box(.12,.06,.83,P.cream,x-side*.03,y-.49,z).box(.085,.69,.03,P.sand,x-side*.022,y+.02,z);
}
function palm(b:ShapeBuilder,x:number,z:number,height:number):void {
  b.cylinder(.12,.21,height,'#b78a66',x,height/2,z,0,0,-.05);
  for(let k=0;k<6;k++){const a=k*Math.PI/3;b.sphere(.8,k%2?P.leaf:'#72b087',x+Math.cos(a)*.62,height+Math.sin(k)*.11,z+Math.sin(a)*.62,1.4,.20,.50);}
  b.sphere(.28,P.leaf,x,height+.05,z);
}
function awning(b:ShapeBuilder,x:number,y:number,z:number,w:number,d:number,color:string):void {
  b.box(w,.13,d,P.cream,x,y,z,0,0,0);
  for(let j=0;j<Math.floor(d/.45);j++)b.box(w+.03,.15,.24,color,x,y+.018,z-d/2+j*.45+.18);
  b.box(.1,.3,d,color,x-Math.sign(x)*w/2,y-.12,z);
}

export function makeEnvironment(district:District,variant:number):THREE.Mesh {
  const b=new ShapeBuilder(),L=32;
  b.box(11,.3,L,'#b5b3a2',0,-.35,L/2).box(9.1,.035,L,'#809492',0,-.18,L/2);
  // Each baked module contains all rail beds, fasteners and sleepers in one draw call.
  for(const x of [-3,0,3]){
    b.box(2.7,.04,L,'#6f8b8a',x,-.15,L/2);
    for(let i=0;i<24;i++)b.box(2.23,.065,.17,'#566f6e',x,-.105,i*L/24+.35);
    for(const s of [-1,1]){b.box(.11,.11,L,'#cad8cc',x+s*.76,-.065,L/2);b.box(.20,.035,L,P.dark,x+s*.76,-.135,L/2);}
  }
  for(const side of [-1,1]){
    const sx=side*6.5;
    b.box(3.1,.38,L,district==='waterfront'?'#acae9e':P.sand,sx,-.12,L/2);
    b.box(.17,.075,L,P.cream,side*4.91,.11,L/2);
    for(let n=0;n<20;n++)b.box(.30,.018,.52,P.yellow,side*5.21,.083,n*1.6+.55);
    if(district==='station'){
      const stationColor=pale[(variant+(side===1?1:0))%pale.length];
      b.round(4.6,5.5,19,.14,stationColor,side*10,2.5,12);
      b.box(4.8,.26,20,P.cream,side*10,5.21,12);
      b.box(4.65,.13,20,P.coral,side*10,5.40,12);
      b.box(.17,1.0,19,P.cream,side*7.65,.64,12);
      for(let row=0;row<2;row++)for(let col=0;col<6;col++)window(b,side*7.67,1.8+row*1.65,4.2+col*2.9,side);
      for(let n=0;n<4;n++){
        const z=4+n*6.3;
        b.cylinder(.09,.11,3.8,P.darkTeal,side*5.8,1.9,z);
        b.box(2.4,.13,.12,P.darkTeal,side*6.6,3.53,z);
        b.box(.11,1.13,.12,P.darkTeal,side*6.0,3.15,z,0,0,side*.75);
        b.box(1.48,.13,.46,P.coral,side*6.5,.59,z+1.65).box(.14,.53,.44,P.darkTeal,side*6.9,.26,z+1.65).box(.14,.53,.44,P.darkTeal,side*6.0,.26,z+1.65);
      }
      awning(b,side*6.62,3.8,13.3,2.6,23.9,variant%2?P.teal:P.coral);
      palm(b,side*6.5,29,4.2);
      // Station clock is readable without any text or dependency on fonts.
      b.cylinder(.43,.43,.13,P.cream,side*6.3,3.04,2.05,0,0,Math.PI/2);
      b.box(.15,.038,.31,P.ink,side*6.2,3.04,2.16).box(.15,.24,.038,P.ink,side*6.2,3.16,2.05);
      b.round(.55,.86,.55,.05,P.teal,side*5.8,.53,25.7).box(.43,.1,.55,P.ink,side*5.8,.89,25.7);
    }else if(district==='mural'){
      for(let n=0;n<3;n++){
        const h=5.3+hash(variant*19+n*4+(side+1))*3,z=5+n*10,c=n===1?'#de9576':pale[(n+variant)%4];
        b.round(5.2,h,9,.08,c,side*10,h/2-.1,z);
        b.box(5.5,.23,9.2,P.cream,side*10,h,z).box(5.1,.18,8.8,P.brick,side*10,h+.2,z);
        for(let row=0;row<Math.floor(h/1.7);row++)for(let col=0;col<3;col++)window(b,side*7.37,1.3+row*1.7,z-2.9+col*2.9,side);
        for(let r=0;r<9;r++)for(let c0=0;c0<4;c0++)if((r+c0+n)%3===0)b.box(.017,.025,.48,'#ba765f',side*7.389,.3+r*.52,z-3.6+c0*2+(r%2)*.4);
        b.box(1.1,.68,1.3,P.metal,side*10,h+.43,z).box(.45,1.2,.5,P.brick,side*11,h+.6,z-2.6);
        b.cylinder(.04,.04,1.6,P.dark,side*8.7,h+.9,z+2).box(.1,.09,1.2,P.dark,side*8.7,h+1.5,z+2);
      }
      // Original abstract mural: a coastal sun, petals and a wave on a side wall.
      b.box(.04,3.1,6.1,P.teal,side*7.34,2.2,15);
      b.cylinder(.92,.92,.05,P.yellow,side*7.30,2.68,15.8,0,0,Math.PI/2,20);
      for(let k=0;k<7;k++)b.sphere(.75,[P.coral,P.cream,'#61bab0'][k%3],side*7.26,1.35+(k%2)*.6,12.7+k*.70,.05,.65,1);
      for(let n=0;n<2;n++){
        const z=5+n*20;
        b.box(1.45,.8,2.8,P.teal,side*6.1,.47,z);
        for(const dz of [-1.2,1.2])b.cylinder(.05,.05,2.7,P.cream,side*6.5,1.42,z+dz);
        awning(b,side*6.12,2.78,z,2.0,3.2,n?P.coral:P.yellow);
        for(let c=0;c<10;c++)b.sphere(.12,c%2?'#f7b055':'#e98157',side*(5.7+(c%2)*.5),.95,z-1+(c%5)*.4);
      }
      b.box(.4,.48,1.8,P.sand,side*6.5,.32,10.4);
      for(let k=0;k<3;k++)b.sphere(.4,P.leaf,side*6.5,.8,9.8+k*.6,1,1.3,1);
      // Bunting remains outside gameplay corridor.
      for(let k=0;k<12;k++)b.cylinder(.14,0,.32,[P.coral,P.yellow,P.teal][k%3],side*5.7,4.1-Math.sin(k/11*Math.PI)*.5,k*2.65,0,0,Math.PI,3);
    }else{
      b.box(4.6,.35,L,'#b0b49c',side*10,-.15,16);
      for(let n=0;n<2;n++){
        const z=8+n*17,wall=n%2?P.teal:'#829e9a';
        b.box(6,5.1,13,wall,side*11,2.40,z);
        b.box(6.3,.28,13.4,P.cream,side*11,5.02,z);
        for(let c=0;c<12;c++)b.box(.07,4.8,.095,'#73948e',side*7.96,2.5,z-5.8+c*1.06);
        b.box(.09,2.7,3.2,P.dark,side*7.90,1.40,z).box(.1,.1,3.5,P.yellow,side*7.83,2.9,z);
        for(let d=0;d<4;d++)b.box(.1,.05,3.0,P.metal,side*7.84,.50+d*.55,z);
      }
      b.box(1.8,1.6,4.8,P.coral,side*6.4,.90,18.5);
      for(let c=0;c<10;c++)b.box(.035,1.40,.07,'#ce614d',side*5.49,.91,16.5+c*.44);
      b.box(1.95,.09,4.95,P.cream,side*6.4,1.75,18.5);
      for(let n=0;n<3;n++){
        const z=3+n*12;b.cylinder(.23,.27,.80,P.darkTeal,side*5.8,.45,z);
        b.cylinder(.3,.3,.09,P.yellow,side*5.8,.75,z);
      }
      const gx=side*15,gz=21;
      b.box(.60,15,.65,P.coral,gx,7.3,gz).box(10.0,.65,.70,P.coral,gx-side*2.9,14.6,gz);
      b.box(.22,10,.20,P.yellow,gx-side*6.8,9.4,gz);
      b.box(.30,5.8,.3,P.coral,gx-side*2.5,12.1,gz,0,0,side*.9);
      b.box(1.8,1.35,1.7,P.cream,gx-side*1.0,13.6,gz).box(.06,.75,1.3,P.teal,gx-side*1.94,13.7,gz);
      b.box(.27,.6,.6,P.ink,gx-side*6.8,4.3,gz);
    }
    // Signal mast, bollards, cable cabinet and lamp give every module consistent scale.
    b.cylinder(.055,.09,4.4,P.dark,side*5.3,2.2,29.5);
    b.box(.22,.85,.33,P.ink,side*5.3,3.5,29.5);
    b.sphere(.087,P.leaf,side*5.3,3.68,29.29,1,1,.4).sphere(.085,P.yellow,side*5.3,3.37,29.29,1,1,.4);
  }
  const mesh=b.mesh();mesh.name=`city-${district}-${variant}`;return mesh;
}

export function makeSkyline():THREE.Mesh {
  const b=new ShapeBuilder();
  for(const side of [-1,1])for(let i=0;i<18;i++){
    const z=12+i*12,x=side*(24+hash(i*14+side)*35),h=7+hash(i*17)*23;
    b.box(5+hash(i*25)*8,h,7,'#9ebbb2',x,h/2-1,z);
    b.box(3,.4,5,'#afc5b8',x,h-.7,z);
    if(i%4===0)b.cylinder(.4,.8,4,'#9ebbb2',x,h+1,z);
  }
  // Curved distant harbor waterline and low coastal hills.
  for(let i=0;i<8;i++)b.sphere(14,'#b6cab5',-95+i*28,-7,210,2,1,1);
  return b.mesh();
}

/** A tall portal keeps even jetpack routes clear; all piers sit outside the lanes. */
export function makeTunnelEntrance():THREE.Mesh {
  const b=new ShapeBuilder();
  for(const side of [-1,1]){
    b.round(1.25,12.0,2.6,.12,P.sand,side*5.55,5.8,0);
    b.box(1.4,.34,2.85,P.cream,side*5.55,10.2,0);
    b.box(.12,7.5,.14,P.teal,side*5.0,4.0,-1.4);
    b.sphere(.23,P.yellow,side*4.95,9.1,-1.45);
  }
  b.round(12.35,1.25,2.6,.17,P.sand,0,12.35,0);
  b.box(12.6,.30,2.8,P.cream,0,13.05,0);
  b.box(5.2,.22,.15,P.teal,0,12.43,-1.34);
  const m=b.mesh();m.name='sunline-tunnel-portal';return m;
}

export function makeHarbor():THREE.Mesh {
  const b=new ShapeBuilder();
  for(const side of [-1,1]){
    const x=side*34,z=55;
    b.round(9,1.5,26,.55,'#648e90',x,.35,z);
    b.box(8,.32,22,P.cream,x,1.25,z);
    for(let row=0;row<3;row++)for(let col=0;col<2;col++)b.box(3.3,1.45,4.6,[P.teal,P.coral,P.sand][row],x-1.85+col*3.7,2.14,z-6+row*5.1);
    b.box(6.4,3.2,4.0,P.cream,x,3.0,z+8.0);
    b.box(6.6,.65,1.2,P.teal,x,4.0,z+5.95);
    b.cylinder(.09,.09,6,P.dark,x,6,z+8);
  }
  const m=b.mesh();m.name='copper-quay-harbor';return m;
}

function wedgeGeometry(width:number,height:number,length:number):THREE.BufferGeometry {
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute([-width/2,0,-length/2,width/2,0,-length/2,-width/2,0,length/2,width/2,0,length/2,-width/2,height,length/2,width/2,height,length/2],3));
  g.setIndex([0,4,1,1,4,5,2,3,4,3,5,4,0,2,4,1,5,3,0,1,2,1,3,2]);g.computeVertexNormals();return g;
}
export function makeWorldObject(kind:string):THREE.Mesh {
  const b=new ShapeBuilder();
  if(kind==='train'||kind==='movingTrain'){
    const color=kind==='movingTrain'?P.coral:P.teal;
    b.round(2.35,2.43,13.85,.18,color,0,1.405,0).round(2.25,.22,13.70,.085,P.cream,0,2.58,0);
    b.box(2.32,.09,13.75,P.cream,0,.78,0).round(2.16,.31,13.95,.09,P.dark,0,.38,0);
    for(const side of [-1,1]){
      for(let j=0;j<7;j++){
        const z=-5.8+j*1.9;
        b.round(.035,.88,1.37,.07,P.ink,side*1.181,1.79,z).round(.04,.67,1.14,.045,'#91d4cd',side*1.207,1.84,z);
        b.box(.045,.03,.76,'#d4eee0',side*1.235,2.07,z-.10);
      }
      for(const z of [-4.8,4.8]){
        b.cylinder(.30,.30,.17,P.dark,side*.99,.27,z,0,0,Math.PI/2).cylinder(.16,.16,.18,P.metal,side*1.0,.27,z,0,0,Math.PI/2);
      }
      b.box(1.93,.86,.055,P.ink,0,1.77,side*6.945).round(1.69,.65,.06,.10,'#a3ddd4',0,1.82,side*6.980);
      b.box(.055,.82,.07,color,0,1.80,side*7.021);
      for(const x of [-.81,.81])b.round(.28,.15,.08,.045,P.yellow,x,.93,side*7.025);
      b.round(1.25,.12,.12,.025,P.cream,0,.56,side*7.0);
      b.box(.42,.22,.18,P.dark,0,.30,side*7.07);
    }
    for(let j=0;j<3;j++)b.round(.8,.075,1.8,.035,'#bfd5c7',0,2.725,-4+j*4);
  }else if(kind==='ramp'){
    b.add(wedgeGeometry(2.35,2.7,9),P.teal).box(.16,.07,9.4,P.yellow,-1.03,1.40,0,-Math.atan2(2.7,9)).box(.16,.07,9.4,P.yellow,1.03,1.40,0,-Math.atan2(2.7,9));
    for(let j=0;j<9;j++)b.box(1.72,.04,.14,P.cream,0,.14+j*.289,-4.1+j*.96);
  }else if(kind==='hurdle'){
    for(const x of [-.92,.92])b.round(.15,.8,.24,.025,P.darkTeal,x,.4,0).box(.36,.06,.65,P.dark,x,.03,0);
    b.round(2.17,.51,.22,.045,P.coral,0,.67,0);
    for(const x of [-.75,0,.75])b.box(.27,.40,.24,P.cream,x,.67,0,0,0,-.22);
    b.box(2.20,.08,.25,P.yellow,0,.96,0);
  }else if(kind==='barrier'){
    for(const x of [-1.04,1.04])b.round(.16,2.75,.21,.025,P.darkTeal,x,1.375,0).box(.38,.09,.76,P.dark,x,.045,0);
    b.round(2.4,1.4,1.2,.045,P.coral,0,1.65,0).box(2.4,.10,1.2,P.yellow,0,1.0,0);
    for(const x of [-.75,0,.75])b.box(.24,1.14,1.21,P.cream,x,1.65,0,0,0,-.18);
    // Downward arrow: the opening is the only traversable part.
    b.box(.14,.34,.03,P.ink,0,1.75,-.62).box(.14,.30,.03,P.ink,-.07,1.54,-.62,0,0,-.7).box(.14,.30,.03,P.ink,.07,1.54,-.62,0,0,.7);
  }else if(kind==='obstacle'){
    b.round(1.7,1.62,1.50,.08,P.coral,0,.81,0).box(1.75,.12,1.55,P.yellow,0,1.60,0);
    for(const s of [-1,1]){b.box(.16,1.5,1.53,P.cream,s*.48,.78,0);b.box(1.72,.13,.07,P.dark,0,.4,s*.77);}
    b.box(.20,.70,.05,P.ink,0,.90,-.785,0,0,.70).box(.20,.70,.05,P.ink,0,.90,-.795,0,0,-.70);
  }else if(kind==='coin'){
    b.cylinder(.25,.25,.065,P.yellow,0,0,0,Math.PI/2,0,0,16).torus(.208,.018,'#fff2b3',0,0,-.039);
    b.box(.048,.20,.018,'#ba8326',0,0,-.043).box(.12,.037,.018,'#ba8326',0,.083,-.045).box(.12,.037,.018,'#ba8326',0,-.082,-.045);
  }else if(kind==='magnet'){
    b.torus(.30,.09,P.coral,0,.04,0).box(.25,.20,.20,P.coral,-.23,-.25,0).box(.25,.20,.20,P.coral,.23,-.25,0);
    b.box(.25,.13,.21,P.cream,-.23,-.34,0).box(.25,.13,.21,P.cream,.23,-.34,0).box(.22,.45,.3,'#ffd36b',0,-.24,0);
  }else if(kind==='jetpack'){
    for(const x of [-.22,.22]){b.cylinder(.12,.14,.65,P.teal,x,0,0).sphere(.13,P.yellow,x,.33,0,1,.8,1);b.cylinder(.16,.10,.19,P.coral,x,-.4,0);b.cylinder(.08,0,.28,P.yellow,x,-.61,0);}
    b.round(.23,.34,.28,.055,P.cream,0,.05,0).box(.64,.10,.34,P.ink,0,-.2,0);
  }else if(kind==='shoes'){
    for(const x of [-.2,.2]){b.round(.28,.25,.48,.065,P.yellow,x,-.05,0).round(.27,.30,.24,.055,P.coral,x,.14,-.10);b.round(.30,.07,.51,.025,P.cream,x,-.19,0);b.box(.33,.13,.10,P.teal,x,.13,.21,0,0,-.3);}
  }else if(kind==='multiplier'){
    b.sphere(.31,P.plum,0,0,0,1,1,.5).torus(.40,.033,P.yellow);
    for(const s of [-1,1])b.box(.085,.39,.08,P.cream,-.04,0,-.18,0,0,s*.68);
    b.box(.10,.27,.08,P.yellow,.23,0,-.16);
    for(let k=0;k<8;k++){const a=k*Math.PI/4;b.sphere(.053,P.yellow,Math.sin(a)*.47,Math.cos(a)*.47,0);}
  }else if(kind==='token'){
    b.cylinder(.29,.29,.12,P.plum,0,0,0,Math.PI/2,0,0,6).torus(.23,.022,'#f3b8e1',0,0,-.08);
    b.box(.075,.30,.045,P.cream,0,0,-.09).box(.30,.075,.045,P.cream,0,0,-.09);
  }else if(kind==='letter'){
    b.round(.46,.52,.1,.07,P.cream);b.box(.22,.067,.025,P.teal,0,.16,-.06).box(.07,.17,.025,P.teal,-.09,.09,-.06).box(.22,.067,.025,P.teal,0,0,-.06).box(.07,.17,.025,P.teal,.09,-.08,-.06).box(.22,.067,.025,P.teal,0,-.16,-.06);
  }else b.sphere(.3,P.yellow);
  const m=b.mesh();m.name=`item-${kind}`;return m;
}

export function makeLetter(letter:string):THREE.Mesh {
  const glyphs:Record<string,string[]>={S:['111','100','111','001','111'],P:['110','101','110','100','100'],R:['110','101','110','101','101'],I:['111','010','010','010','111'],N:['101','111','111','111','101'],T:['111','010','010','010','010']};
  const b=new ShapeBuilder();b.round(.46,.52,.10,.05,P.cream);
  (glyphs[letter]??glyphs.S)!.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')for(const side of [-1,1])b.box(.073,.073,.015,P.teal,(x-1)*.078,(2-y)*.078,side*.06);}));
  return b.mesh();
}

export function makeDrone():THREE.Mesh {
  const b=new ShapeBuilder();
  b.sphere(.34,P.cream,0,0,0,1.1,.65,1.15).round(.38,.21,.12,.07,P.darkTeal,0,0,-.32);
  b.sphere(.084,P.yellow,0,.015,-.397,1,1,.25).sphere(.065,P.coral,.18,.03,-.30);
  for(const side of [-1,1]){b.box(.65,.055,.085,P.darkTeal,side*.40,.03,0);b.torus(.22,.045,P.coral,side*.67,.035,0,Math.PI/2);b.cylinder(.04,.06,.1,P.dark,side*.67,.04,0);b.box(.34,.022,.05,P.cream,side*.67,.08,0);}
  b.cylinder(.035,.035,.24,P.dark,0,.3,.04).sphere(.055,P.coral,0,.44,.04);
  return b.mesh();
}
