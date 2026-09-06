import {createServer} from 'vite';
import {mkdir,writeFile} from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
globalThis.FileReader=class{result=null;onloadend=null;onerror=null;readAsArrayBuffer(blob){blob.arrayBuffer().then(b=>{this.result=b;this.onloadend?.();}).catch(e=>this.onerror?.(e));}readAsDataURL(blob){blob.arrayBuffer().then(b=>{this.result=`data:${blob.type};base64,${Buffer.from(b).toString('base64')}`;this.onloadend?.();});}};
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
const {RunnerCharacter,makeBoard}=await server.ssrLoadModule('/src/render/Character.ts');
const {makeEnvironment,makeWorldObject,makeTunnelEntrance,makeHarbor}=await server.ssrLoadModule('/src/render/WorldArt.ts');
await mkdir('assets/authored',{recursive:true});await mkdir('public/models',{recursive:true});
const inventory=[];const exporter=new GLTFExporter();
async function output(id,root,clips=[]){let vertices=0,triangles=0,meshes=0;root.traverse(o=>{if(o.isMesh){meshes++;vertices+=o.geometry.attributes.position.count;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});const result=await exporter.parseAsync(root,{binary:true,animations:clips,onlyVisible:false});await writeFile(`assets/authored/${id}.glb`,Buffer.from(result));inventory.push({id,source:`assets/authored/${id}.glb`,final:`public/models/${id}.glb`,provider:'Locally authored Three.js geometry; Blender cleanup/export',vertices,triangles,meshes,textures:0,materials:1,bytes:result.byteLength,animations:clips.map(c=>c.name)});console.log(id,triangles,'triangles',result.byteLength,'bytes');}
async function character(id,outfit){const c=new RunnerCharacter(id,outfit);let serial=0;const groups=[];c.root.traverse(o=>{o.name=`${id}_node_${serial++}`;if(o.isGroup)groups.push(o);});const clips=[];for(const [state,duration]of [['idle',2],['run',.8],['jump',.6],['fall',.6],['land',.25],['slide',.85],['stumble',.6],['defeat',1],['celebrate',1.6],['board',1.2]]){const tracks=[],times=[],data=groups.map(()=>({position:[],quaternion:[]}));for(let warm=0;warm<20;warm++)c.animate(0,16,state,1/60,state==='board',false);for(let f=0;f<=Math.ceil(duration*30);f++){const t=f/30;times.push(t);c.animate(t,16,state,1/30,state==='board',false);groups.forEach((o,n)=>{data[n].position.push(o.position.x,o.position.y,o.position.z);data[n].quaternion.push(o.quaternion.x,o.quaternion.y,o.quaternion.z,o.quaternion.w);});}groups.forEach((o,n)=>{tracks.push(new THREE.VectorKeyframeTrack(`${o.name}.position`,times,data[n].position));tracks.push(new THREE.QuaternionKeyframeTrack(`${o.name}.quaternion`,times,data[n].quaternion));});clips.push(new THREE.AnimationClip(state,duration,tracks));}await output(`${id}-${outfit}`,c.root,clips);c.dispose();}
try{
const pilot=process.argv.includes('--pilot');
if(process.argv.includes('--extras')){await output('tunnel-entrance',makeTunnelEntrance());await output('harbor',makeHarbor());await writeFile('assets/extras-inventory.json',JSON.stringify(inventory,null,2));}else{
for(const id of pilot?['pip']:['pip','rumi','tavi','jett','nori'])for(const outfit of pilot?['default']:['default','alt'])await character(id,outfit);
for(const district of pilot?['station']:['station','mural','waterfront'])for(let variant=0;variant<(pilot?1:3);variant++)await output(`${district}-${variant}`,makeEnvironment(district,variant));
if(!pilot){for(const board of ['tide','ember'])await output(`board-${board}`,makeBoard(board));for(const kind of ['train','movingTrain','ramp','hurdle','barrier','obstacle','magnet','jetpack','shoes','multiplier','token','letter'])await output(kind,makeWorldObject(kind));await output('tunnel-entrance',makeTunnelEntrance());await output('harbor',makeHarbor());}
await writeFile(`assets/${pilot?'pilot-':'authored-'}inventory.json`,JSON.stringify(inventory,null,2));
}
}finally{await server.close();}
