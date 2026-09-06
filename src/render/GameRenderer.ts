import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import type {GameState,ObjectKind} from '../game/types';
import {CITY} from '../game/city';
import {RunnerCharacter,makeBoard} from './Character';
import {GltfCharacter} from './GltfCharacter';
import {SelectiveBloom} from './SelectiveBloom';
import {makeEnvironment,makeSkyline,makeWorldObject,makeDrone,makeLetter,makeTunnelEntrance,makeHarbor,type District} from './WorldArt';
import {palette as P,worldMaterial,disposeTree} from './geometry';

type Quality='low'|'medium'|'high';
interface RenderSettings {quality:Quality;reducedMotion:boolean;cameraShake:boolean}
interface RendererOptions {onContextLost?:()=>void;onContextRestored?:()=>void}
interface Particle {x:number;y:number;z:number;vx:number;vy:number;vz:number;life:number;max:number;color:THREE.Color}
const kinds:ObjectKind[]=['train','movingTrain','hurdle','barrier','obstacle','ramp','magnet','jetpack','shoes','multiplier','letter','token'];
const pickupKinds=new Set(['magnet','jetpack','shoes','multiplier','letter','token']);
const districts:District[]=CITY.districts.map(d=>d.id);

/** Rendering owns visual objects only. No simulation values are mutated here. */
export class GameRenderer {
  readonly renderer:THREE.WebGLRenderer;
  readonly scene=new THREE.Scene();
  readonly camera=new THREE.PerspectiveCamera(55,1,.08,350);
  private sun=new THREE.DirectionalLight('#fff0d3',3.0);
  private mode:'game'|'menu'|'preview'='menu';
  private settings:RenderSettings={quality:'medium',reducedMotion:false,cameraShake:true};
  private character:RunnerCharacter|GltfCharacter=new RunnerCharacter();private board=makeBoard();private boardId='tide';
  private characterAssets=new Map<string,{scene:THREE.Group;animations:THREE.AnimationClip[]}>();
  assetLoad={complete:0,total:35,error:''};
  private boardAssets=new Map<string,THREE.BufferGeometry>();
  private letterAssets=new Map([... 'SPRINT'].map(letter=>[letter,makeLetter(letter).geometry]));
  private appearance='pip:default';private previewBoard=false;
  private environment=new THREE.Group();private environmentGeometries=new Map<string,THREE.BufferGeometry>();
  private tiles:THREE.Mesh[]=[];private skyline=makeSkyline();
  private tunnel=makeTunnelEntrance();private harbor=makeHarbor();
  private library=new Map<ObjectKind,THREE.Mesh>();private pools=new Map<ObjectKind,THREE.Mesh[]>();
  private coins:THREE.InstancedMesh;private pickupHalos:THREE.InstancedMesh;
  private drone=makeDrone();private jetpack=makeWorldObject('jetpack');
  private shield:THREE.Mesh;private shoeGlow:THREE.Mesh;
  private titleObjects=new THREE.Group();private particles:Particle[]=[];
  private particleMesh:THREE.InstancedMesh;private matrixDummy=new THREE.Object3D();
  private resizeObserver:ResizeObserver;private lastTime=0;private time=0;
  private lastCoins=0;private lastPowerups=0;private lastStumbles=0;private lastEffects=0;
  private shake=0;private disposed=false;private playerPos=new THREE.Vector3();
  private lookAt=new THREE.Vector3();private cameraPos=new THREE.Vector3();private loadedResources:THREE.Object3D[]=[];
  private options:RendererOptions;
  private bloom:SelectiveBloom|undefined;
  constructor(private container:HTMLElement,options:RendererOptions={}){
    this.options=options;
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.08;
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFShadowMap;
    this.renderer.domElement.setAttribute('aria-label','Switchyard Sprint 3D game world');this.renderer.domElement.style.cssText='display:block;width:100%;height:100%;outline:none';
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.addEventListener('webglcontextlost',this.contextLost,false);this.renderer.domElement.addEventListener('webglcontextrestored',this.contextRestored,false);
    this.scene.background=new THREE.Color('#c6e4d6');this.scene.fog=new THREE.Fog('#c6dfcd',65,205);
    this.scene.add(new THREE.HemisphereLight('#def6ef','#927951',2.2));
    this.sun.position.set(-24,35,-18);this.sun.castShadow=true;this.sun.shadow.mapSize.set(1024,1024);
    this.sun.shadow.camera.left=-25;this.sun.shadow.camera.right=25;this.sun.shadow.camera.top=35;this.sun.shadow.camera.bottom=-28;
    this.sun.shadow.camera.far=120;this.sun.shadow.normalBias=.06;this.sun.shadow.bias=-.0002;this.sun.target.position.set(0,0,20);this.scene.add(this.sun,this.sun.target);
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(1100,1100),new THREE.MeshStandardMaterial({color:'#d7c6a0',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.57;ground.receiveShadow=true;this.scene.add(ground);
    const sea=new THREE.Mesh(new THREE.PlaneGeometry(500,220),new THREE.MeshStandardMaterial({color:'#89c6bf',roughness:.7}));sea.rotation.x=-Math.PI/2;sea.position.set(0,-.55,220);this.scene.add(sea);
    const sunDisc=new THREE.Mesh(new THREE.SphereGeometry(8,20,12),new THREE.MeshBasicMaterial({color:'#fff0b7'}));sunDisc.position.set(-66,69,190);this.scene.add(sunDisc);
    this.scene.add(this.environment,this.skyline,this.character.root,this.board,this.drone,this.jetpack,this.titleObjects,this.tunnel,this.harbor);
    for(const district of districts)for(let v=0;v<3;v++){const m=makeEnvironment(district,v);this.environmentGeometries.set(`${district}:${v}`,m.geometry);}
    for(let i=0;i<8;i++){const tile=new THREE.Mesh(this.environmentGeometries.get('station:0'),worldMaterial);tile.receiveShadow=true;tile.castShadow=true;tile.userData.key='';this.environment.add(tile);this.tiles.push(tile);}
    for(const kind of kinds){const mesh=makeWorldObject(kind);mesh.userData.selectiveBloom=pickupKinds.has(kind);this.library.set(kind,mesh);this.pools.set(kind,[]);}
    const coin=makeWorldObject('coin');this.library.set('coin',coin);this.coins=new THREE.InstancedMesh(coin.geometry,worldMaterial,900);this.coins.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.coins.frustumCulled=false;this.scene.add(this.coins);
    const haloGeometry=new THREE.TorusGeometry(.55,.025,4,20);const haloMaterial=new THREE.MeshBasicMaterial({color:'#fff0bb',transparent:true,opacity:.6,depthWrite:false});
    this.pickupHalos=new THREE.InstancedMesh(haloGeometry,haloMaterial,80);this.pickupHalos.frustumCulled=false;this.scene.add(this.pickupHalos);
    this.shield=new THREE.Mesh(new THREE.SphereGeometry(1.10,18,12),new THREE.MeshBasicMaterial({color:'#8bf3db',wireframe:true,transparent:true,opacity:.13,depthWrite:false}));this.scene.add(this.shield);
    this.shoeGlow=new THREE.Mesh(new THREE.TorusGeometry(.6,.037,5,24),new THREE.MeshBasicMaterial({color:P.yellow}));this.shoeGlow.rotation.x=Math.PI/2;this.scene.add(this.shoeGlow);
    this.particleMesh=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.06,0),new THREE.MeshBasicMaterial({color:'#ffffff'}),220);this.particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.particleMesh.frustumCulled=false;this.scene.add(this.particleMesh);
    for(const mesh of [coin,this.coins,this.pickupHalos,this.shield,this.shoeGlow,this.particleMesh])mesh.userData.selectiveBloom=true;
    const titleTrain=this.library.get('train')!.clone();titleTrain.position.set(-3,0,14);this.titleObjects.add(titleTrain);
    const secondTrain=this.library.get('movingTrain')!.clone();secondTrain.position.set(3,0,46);this.titleObjects.add(secondTrain);
    const titleRamp=this.library.get('ramp')!.clone();titleRamp.position.set(3,0,34);this.titleObjects.add(titleRamp);
    for(let i=0;i<11;i++){const c=coin.clone();c.position.set(0,.85,4+i*2.1);this.titleObjects.add(c);}
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.setSettings(this.settings);this.resize();
    void this.loadAssets();
  }
  private contextLost=(event:Event):void=>{event.preventDefault();this.options.onContextLost?.();};
  private contextRestored=():void=>{this.options.onContextRestored?.();};
  setSettings(settings:RenderSettings):void {
    const quality=settings.quality??'medium';this.settings={quality,reducedMotion:settings.reducedMotion??false,cameraShake:settings.cameraShake??true};
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,quality==='low'?1:quality==='medium'?1.35:1.75));
    this.renderer.shadowMap.enabled=quality!=='low';const size=quality==='high'?2048:1024;
    if(this.sun.shadow.mapSize.x!==size){this.sun.shadow.mapSize.set(size,size);this.sun.shadow.map?.dispose();this.sun.shadow.map=null;}
    if(quality==='high'){this.bloom??=new SelectiveBloom(this.renderer,this.scene,this.camera);}else{this.bloom?.dispose();this.bloom=undefined;}
    this.resize();
  }
  setAppearance(characterId:string,outfitId:string,boardId:string):void {
    const next=`${characterId}:${outfitId}`;
    if(next!==this.appearance){this.scene.remove(this.character.root);this.character.dispose();const asset=this.characterAssets.get(outfitId);this.character=asset?new GltfCharacter(asset.scene,asset.animations):new RunnerCharacter(characterId,outfitId);this.scene.add(this.character.root);this.appearance=next;}
    if(boardId!==this.boardId){this.scene.remove(this.board);if(![...this.boardAssets.values()].includes(this.board.geometry))this.board.geometry.dispose();const geometry=this.boardAssets.get(boardId);this.board=geometry?new THREE.Mesh(geometry,worldMaterial):makeBoard(boardId);this.board.castShadow=true;this.scene.add(this.board);this.boardId=boardId;}
  }
  setMode(mode:'game'|'menu'|'preview'):void{this.mode=mode;this.previewBoard=false;if(mode==='game'){this.lastCoins=0;this.lastPowerups=0;this.lastStumbles=0;}}
  setPreview(options:{character:string;outfit:string;board:string;showBoard?:boolean}):void{this.setAppearance(options.character,options.outfit,options.board);this.previewBoard=!!options.showBoard;}
  resize():void{const w=Math.max(1,this.container.clientWidth),h=Math.max(1,this.container.clientHeight);this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.bloom?.resize();}
  get stats():{calls:number;triangles:number;geometries:number;textures:number;objects:number;particles:number}{return{calls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,geometries:this.renderer.info.memory.geometries,textures:this.renderer.info.memory.textures,objects:[...this.pools.values()].reduce((n,p)=>n+p.length,0),particles:this.particles.length};}
  /** Optional, local-only Blender-exported mesh integration; preserves a usable authored fallback. */
  async loadEnvironmentModule(url:string,key='station:0'):Promise<void>{const gltf=await new GLTFLoader().loadAsync(url);if(this.disposed){disposeTree(gltf.scene);return;}this.loadedResources.push(gltf.scene);gltf.scene.updateMatrixWorld(true);let found:THREE.Mesh|undefined;gltf.scene.traverse(o=>{if(!found&&o instanceof THREE.Mesh)found=o;});if(found){const geometry=found.geometry.clone().applyMatrix4(found.matrixWorld);const old=this.environmentGeometries.get(key);this.environmentGeometries.set(key,geometry);this.tiles.forEach(t=>{if(t.userData.key===key)t.geometry=geometry;});old?.dispose();}}
  private async loadAssets():Promise<void>{
    const loader=new GLTFLoader(),url=(id:string)=>`${import.meta.env.BASE_URL}models/${id}.glb`;
    const staticGeometry=async(id:string)=>{const gltf=await loader.loadAsync(url(id));this.loadedResources.push(gltf.scene);gltf.scene.updateMatrixWorld(true);let mesh:THREE.Mesh|undefined;gltf.scene.traverse(o=>{if(!mesh&&o instanceof THREE.Mesh)mesh=o;});if(!mesh)throw Error(`No mesh in ${id}`);return mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);};
    const jobs:Array<()=>Promise<void>>=[];
    for(const id of ['pip','rumi','tavi','jett','nori'])for(const outfit of ['default','alt'])jobs.push(async()=>{const key=`${id}-${outfit}`,gltf=await loader.loadAsync(url(key));this.loadedResources.push(gltf.scene);if(this.disposed)return;this.characterAssets.set(key,{scene:gltf.scene,animations:gltf.animations});if(this.appearance===`${id}:${key}`||this.appearance===`${id}:${outfit}`){this.appearance='';this.setAppearance(id,key,this.boardId);}});
    for(const district of districts)for(let v=0;v<3;v++)jobs.push(()=>this.loadEnvironmentModule(url(`${district}-${v}`),`${district}:${v}`));
    for(const id of ['tide','ember'])jobs.push(async()=>{const geometry=await staticGeometry(`board-${id}`);this.boardAssets.set(id,geometry);if(this.boardId===id){this.board.geometry.dispose();this.board.geometry=geometry;}});
    for(const kind of kinds)jobs.push(async()=>{const geometry=await staticGeometry(kind),old=this.library.get(kind)!.geometry;this.library.get(kind)!.geometry=geometry;this.scene.traverse(o=>{if(o instanceof THREE.Mesh&&o.geometry===old)o.geometry=geometry;});old.dispose();});
    for(const [id,mesh] of [['tunnel-entrance',this.tunnel],['harbor',this.harbor]] as const)jobs.push(async()=>{const geometry=await staticGeometry(id);mesh.geometry.dispose();mesh.geometry=geometry;});
    try{let next=0;await Promise.all(Array.from({length:3},async()=>{while(next<jobs.length&&!this.disposed){const job=jobs[next++]!;await job();this.assetLoad.complete++;}}));}catch(error){this.assetLoad.error=error instanceof Error?error.message:'Local model load failed';}
  }
  render(state:GameState,alpha:number):void {
    if(this.disposed)return;
    const now=performance.now()/1000,dt=this.lastTime?Math.min(.05,now-this.lastTime):1/60;this.lastTime=now;
    const game=this.mode==='game',active=!game||state.phase==='running';if(active)this.time+=dt;
    const t=this.time;const p=state.player,prev=state.previousPlayer;
    const z=game?THREE.MathUtils.lerp(prev.z,p.z,alpha):0;
    const x=game?-THREE.MathUtils.lerp(prev.x,p.x,alpha):this.mode==='preview'?-2.4:-2.8;
    const y=game?THREE.MathUtils.lerp(prev.y,p.y,alpha):0;
    this.playerPos.set(x,y,0);
    this.titleObjects.visible=!game;this.skyline.position.z=game?-(z%100)*.12:0;
    const boundary=Math.max(1,Math.floor((z-20)/CITY.districtLength)+1)*CITY.districtLength;
    this.tunnel.position.z=boundary-z;this.tunnel.visible=game&&this.tunnel.position.z>=-20&&this.tunnel.position.z<=195;
    this.harbor.visible=game&&districts[Math.floor(z/CITY.districtLength)%districts.length]==='waterfront';
    const first=Math.floor(z/32)-1;
    for(let i=0;i<this.tiles.length;i++){
      const index=first+i,dist=districts[Math.floor(Math.max(0,index*32)/CITY.districtLength)%districts.length]!,key=`${dist}:${((index%3)+3)%3}`,tile=this.tiles[i]!;
      if(tile.userData.key!==key){tile.geometry=this.environmentGeometries.get(key)!;tile.userData.key=key;}
      tile.position.z=index*32-z;tile.visible=i<(this.settings.quality==='low'?6:8);
    }
    this.renderObjects(state,z,game,t);
    const onBoard=game?state.effects.board>0:this.previewBoard;
    this.character.root.position.set(x,y+(onBoard?.14:0),0);
    this.character.root.scale.setScalar(game?1:1.65);
    this.character.root.rotation.y=game?(p.targetLane*3-p.x)*-.065:Math.PI-.23+(this.settings.reducedMotion?0:Math.sin(t*.35)*.16);
    this.character.animate(game?state.elapsed:t,state.speed,game?p.animation:'idle',active?dt:0,onBoard,this.settings.reducedMotion);
    this.board.visible=onBoard;this.board.position.set(x,y+.085,0);this.board.rotation.y=this.character.root.rotation.y+(game?.12:0);this.board.scale.setScalar(game?1:1.65);
    this.board.rotation.z=game&&!this.settings.reducedMotion?(p.targetLane*3-p.x)*-.06:0;
    this.jetpack.visible=game&&state.effects.jetpack>0;this.jetpack.position.set(x,y+.92,-.30);this.jetpack.scale.setScalar(.80);
    this.drone.visible=game;this.drone.position.set(x+Math.min(1.3,state.droneDistance*.14)+Math.sin(t*1.1)*.15,y+1.85+Math.sin(t*3)*.1,-Math.min(3.8,state.droneDistance*.27));this.drone.rotation.z=Math.sin(t*3)*.09;
    this.shield.visible=game&&(state.effects.invincible>0||onBoard);this.shield.position.set(x,y+.93,0);this.shield.rotation.y=t*.6;
    this.shoeGlow.visible=game&&state.effects.shoes>0;this.shoeGlow.position.set(x,y+.05,0);this.shoeGlow.scale.setScalar(1+Math.sin(t*6)*.08);
    if(game&&active){
      if(state.coins>this.lastCoins)this.burst(x,y+.8,.1,Math.min(16,(state.coins-this.lastCoins)*4),P.yellow);
      if(state.counters.powerups>this.lastPowerups)this.burst(x,y+1,0,25,P.teal);
      if(state.counters.stumbles>this.lastStumbles){this.burst(x,y+1,0,20,P.coral);this.shake=.18;}
      if(onBoard&&Math.random()<.70)this.burst(x,y+.05,-.7,1,this.boardId==='ember'?P.coral:'#73dfc9');
      if(state.effects.jetpack>0)this.burst(x+(Math.random()-.5)*.4,y+.4,-.3,1,P.yellow);
      if(state.effects.magnet>0&&Math.random()<.14)this.burst(x,y+.8,0,1,P.coral);
    }
    this.lastCoins=state.coins;this.lastPowerups=state.counters.powerups;this.lastStumbles=state.counters.stumbles;this.lastEffects=state.effects.board;
    this.renderParticles(active?dt:0,game?state.speed:0);
    const flight=game?Math.min(4.8,y*.63):0;
    if(game){this.cameraPos.set(x*.14,5.30+flight,-9.0);this.lookAt.set(x*.10,1.25+flight,14);}
    else if(this.mode==='preview'){this.cameraPos.set(.4,3.3,-7.3);this.lookAt.set(.5,1.8,1.7);}
    else {this.cameraPos.set(.3,4.2,-8.5);this.lookAt.set(.1,1.8,11);}
    this.shake=Math.max(0,this.shake-dt);
    if(this.settings.cameraShake&&!this.settings.reducedMotion&&this.shake>0){this.cameraPos.x+=Math.sin(t*70)*this.shake*.34;this.cameraPos.y+=Math.cos(t*53)*this.shake*.25;}
    this.camera.position.lerp(this.cameraPos,game?.12:.08);this.camera.lookAt(this.lookAt);
    if(this.bloom)this.bloom.render();else this.renderer.render(this.scene,this.camera);
  }
  private renderObjects(state:GameState,z:number,game:boolean,t:number):void{
    const counts=new Map<ObjectKind,number>();let coinCount=0,haloCount=0;
    if(game)for(const obj of state.objects){
      const rz=obj.z-z;if(!obj.active||rz< -15||rz>195)continue;
      const pickup=obj.kind==='coin'||pickupKinds.has(obj.kind);
      if(obj.kind==='coin'){
        if(coinCount>=900)continue;
        this.matrixDummy.position.set(-obj.x,obj.y+obj.height/2,rz);this.matrixDummy.rotation.set(0,t*2.5+obj.id*.2,0);this.matrixDummy.scale.setScalar(1);this.matrixDummy.updateMatrix();this.coins.setMatrixAt(coinCount++,this.matrixDummy.matrix);continue;
      }
      const pool=this.pools.get(obj.kind)!;const n=counts.get(obj.kind)||0;
      if(n>=60)continue;
      let mesh=pool[n];if(!mesh){mesh=this.library.get(obj.kind)!.clone();pool.push(mesh);this.scene.add(mesh);}
      counts.set(obj.kind,n+1);mesh.visible=true;
      if(obj.kind==='letter')mesh.geometry=this.letterAssets.get(obj.letter??'S')!;
      mesh.position.set(-obj.x,pickup?obj.y+obj.height/2:obj.kind==='barrier'?obj.y-.95:obj.y,rz);
      mesh.rotation.set(0,pickup?t*1.35:0,0);mesh.scale.set(1,1,1);
      if(obj.kind==='ramp')mesh.scale.z=obj.depth/9;
      if(obj.kind==='hurdle')mesh.scale.set(obj.width/2.2,obj.height/.99,obj.depth/.65);
      if(obj.kind==='train'||obj.kind==='movingTrain')mesh.scale.set(obj.width/2.42,obj.height/2.762,obj.depth/14.32);
      if(pickup){mesh.position.y+=this.settings.reducedMotion?0:Math.sin(t*3+obj.id)*.065;
        if(haloCount<80){this.matrixDummy.position.set(-obj.x,obj.y+obj.height/2,rz);this.matrixDummy.rotation.set(0,0,t*.5);this.matrixDummy.scale.setScalar(1);this.matrixDummy.updateMatrix();this.pickupHalos.setMatrixAt(haloCount++,this.matrixDummy.matrix);}
      }
    }
    this.pools.forEach((pool,kind)=>{for(let n=counts.get(kind)||0;n<pool.length;n++)pool[n]!.visible=false;});
    this.coins.count=coinCount;this.coins.instanceMatrix.needsUpdate=true;this.pickupHalos.count=haloCount;this.pickupHalos.instanceMatrix.needsUpdate=true;
  }
  private burst(x:number,y:number,z:number,count:number,color:string):void{
    const limit=this.settings.quality==='low'?80:220;
    for(let i=0;i<count&&this.particles.length<limit;i++){const life=.3+Math.random()*.35;this.particles.push({x,y,z,vx:(Math.random()-.5)*3.8,vy:1+Math.random()*3,vz:(Math.random()-.5)*3,life,max:life,color:new THREE.Color(color)});}
  }
  private renderParticles(dt:number,speed:number):void{
    let n=0;for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i]!;p.life-=dt;
      if(p.life<=0){this.particles[i]=this.particles[this.particles.length-1]!;this.particles.pop();continue;}
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=(p.vz-speed*.22)*dt;p.vy-=dt*7;
      this.matrixDummy.position.set(p.x,p.y,p.z);this.matrixDummy.rotation.set(p.life*6,p.life*4,0);this.matrixDummy.scale.setScalar(p.life/p.max);this.matrixDummy.updateMatrix();this.particleMesh.setMatrixAt(n,this.matrixDummy.matrix);this.particleMesh.setColorAt(n,p.color);n++;
    }
    this.particleMesh.count=n;this.particleMesh.instanceMatrix.needsUpdate=true;if(this.particleMesh.instanceColor)this.particleMesh.instanceColor.needsUpdate=true;
  }
  dispose():void{
    this.bloom?.dispose();this.bloom=undefined;
    this.disposed=true;this.resizeObserver.disconnect();this.renderer.domElement.removeEventListener('webglcontextlost',this.contextLost);this.renderer.domElement.removeEventListener('webglcontextrestored',this.contextRestored);
    disposeTree(this.scene);this.environmentGeometries.forEach(g=>g.dispose());this.library.forEach(m=>m.geometry.dispose());
    const materials=new Set<THREE.Material>();this.scene.traverse(o=>{if(o instanceof THREE.Mesh){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>materials.add(m));}});materials.forEach(m=>{if(m!==worldMaterial)m.dispose();});
    this.loadedResources.forEach(root=>{disposeTree(root);root.traverse(o=>{if(o instanceof THREE.Mesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m!==worldMaterial)m.dispose();});});});this.boardAssets.forEach(g=>g.dispose());this.letterAssets.forEach(g=>g.dispose());this.character.dispose();this.renderer.dispose();this.renderer.domElement.remove();
  }
}
