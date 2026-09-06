import { GameSimulation } from './game/simulation';
import { GameInput } from './game/input';
import { FixedStep } from './game/fixedStep';
import type { Action, GameState, Powerup, SimulationConfig } from './game/types';
import { GameRenderer } from './render/GameRenderer';
import { AudioManager } from './audio/AudioManager';
import { ProgressionStore, type RewardReport, type Settings } from './progression';

export class GameController {
  sim = new GameSimulation({seed:17329});
  readonly renderer: GameRenderer;
  readonly audio = new AudioManager();
  private input: GameInput;
  private clock = new FixedStep();
  private raf=0;
  private last=0;
  private lastPublish=0;
  private listeners=new Set<()=>void>();
  private snapshot:GameState;
  private detached=false;
  private unsubscribe:()=>void;
  reward:RewardReport|null=null;
  error='';
  inGame=false;
  inputEnabled=true;
  readonly samples:number[]=[];
  constructor(container:HTMLElement, readonly store:ProgressionStore){
    this.snapshot=this.copy();
    this.renderer=new GameRenderer(container,{onContextLost:()=>{this.sim.pause();this.error='Graphics paused. Restore the graphics context or reload to recover.';this.publish();},onContextRestored:()=>{this.error='';this.publish();}});
    this.input=new GameInput(a=>this.action(a),()=>this.inputEnabled?this.sim.state.phase:'ready',()=>this.pause());
    this.applySettings(store.getSnapshot().settings);
    this.unsubscribe=store.subscribe(()=>this.applySettings(store.getSnapshot().settings));
    this.renderer.setAppearance(store.getSnapshot().equipped.character,store.getSnapshot().equipped.outfit,store.getSnapshot().equipped.board);
    this.renderer.setMode('menu');
    this.raf=requestAnimationFrame(this.frame);
  }
  private copy():GameState{return {...this.sim.state,player:{...this.sim.state.player},effects:{...this.sim.state.effects},counters:{...this.sim.state.counters},letters:[...this.sim.state.letters]};}
  subscribe=(fn:()=>void):(()=>void)=>{this.listeners.add(fn);return()=>this.listeners.delete(fn);};
  getSnapshot=():GameState=>this.snapshot;
  private publish():void{this.snapshot=this.copy();this.listeners.forEach(fn=>fn());}
  private frame=(time:number):void=>{
    if(this.detached)return;
    const delta=this.last?Math.max(0,(time-this.last)/1000):0;this.last=time;
    const alpha=this.clock.advance(delta,dt=>this.sim.update(dt));
    this.processEvents();
    this.renderer.render(this.sim.state,alpha);
    if(this.inGame&&this.sim.state.phase==='running'&&delta>0){this.samples.push(delta*1000);if(this.samples.length>7200)this.samples.splice(0,3600);}
    if(time-this.lastPublish>100||this.snapshot.phase!==this.sim.state.phase){this.lastPublish=time;this.publish();}
    this.raf=requestAnimationFrame(this.frame);
  };
  private processEvents():void{
    for(const event of this.sim.drainEvents()){
      this.audio.event(event);
      if(event.kind==='board'&&!this.sim.state.preview&&this.sim.state.mode!=='tutorial')this.store.useConsumable('board');
      if(event.kind==='results'){const reward=this.store.finishRun(this.sim.summary());if(reward)this.reward=reward;this.audio.pause(true);}
      if(event.kind==='pause'||event.kind==='defeat')this.audio.pause(true);
      if(event.kind==='resume'||event.kind==='start')this.audio.pause(false);
    }
  }
  applySettings(settings:Settings):void{
    this.renderer.setSettings(settings);this.audio.settings(settings.music,settings.effects);
    this.input.setBindings({left:settings.bindings.left,right:settings.bindings.right,jump:settings.bindings.jump,board:settings.bindings.board,pause:settings.bindings.pause,slide:settings.bindings.down,confirm:['Enter']});
  }
  start(config:SimulationConfig={}):void{
    this.processEvents();const save=this.store.getSnapshot();this.audio.unlock();this.reward=null;this.inGame=true;this.inputEnabled=true;
    const headstart=config.headstart&&!config.preview?this.store.useConsumable('headstart'):config.headstart;
    this.sim=new GameSimulation({board:save.equipped.board,upgrades:save.upgrades,multiplier:save.permanentMultiplier,boardCharges:config.mode==='tutorial'?3:save.boardCharges,...config,headstart});
    this.clock.reset();this.renderer.setAppearance(save.equipped.character,save.equipped.outfit,save.equipped.board);this.renderer.setMode('game');this.sim.start();this.publish();
  }
  action(action:Action):void{this.sim.action(action);this.processEvents();this.publish();}
  pause():void{this.sim.pause();this.publish();}
  resume():void{this.audio.unlock();this.sim.resume();this.publish();}
  finish():void{this.sim.finish();this.processEvents();this.publish();}
  revive():boolean{
    if(this.sim.state.phase!=='caught')return false;
    if(this.sim.state.preview||this.sim.state.mode==='tutorial'||this.store.spendRevive(this.sim.state.revives)){this.sim.revive();this.publish();return true;}return false;
  }
  menu():void{this.processEvents();this.inGame=false;this.sim=new GameSimulation({seed:17329});this.clock.reset();this.renderer.setMode('menu');const e=this.store.getSnapshot().equipped;this.renderer.setAppearance(e.character,e.outfit,e.board);this.publish();}
  preview(character:string,outfit:string,board:string,showBoard=false):void{this.renderer.setMode('preview');this.renderer.setPreview({character,outfit,board,showBoard});}
  previewPowerup(kind:Powerup):void{this.sim.previewPowerup(kind);this.publish();}
  dispose():void{this.detached=true;cancelAnimationFrame(this.raf);this.input.dispose();this.unsubscribe();this.renderer.dispose();this.audio.dispose();this.listeners.clear();}
}
