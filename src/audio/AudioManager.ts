import type { GameEvent } from '../game/types';
export class AudioManager {
  private context?: AudioContext;
  private music?: HTMLAudioElement;
  private musicVolume=.35;
  private effectsVolume=.65;
  private lastCoin=0;
  private quiet=false;
  unlock(): void {
    try {this.context ??= new AudioContext();void this.context.resume();if(!this.music){this.music=new Audio(`${import.meta.env.BASE_URL}audio/sunline-shuffle.wav`);this.music.loop=true;this.music.volume=this.musicVolume;}void this.music.play().catch(()=>{});}catch{/* Sound failure never prevents play. */}
  }
  settings(music:number,effects:number):void{this.musicVolume=music;this.effectsVolume=effects;if(this.music)this.music.volume=this.quiet?music*.25:music;}
  pause(value:boolean):void{this.quiet=value;if(this.music)this.music.volume=this.musicVolume*(value?.25:1);}
  private tone(frequency:number,duration=.12,wave:OscillatorType='sine',gain=.13,delay=0,end?:number):void {
    const c=this.context;if(!c||c.state!=='running'||!this.effectsVolume)return;
    const oscillator=c.createOscillator(),volume=c.createGain(),at=c.currentTime+delay;
    oscillator.type=wave;oscillator.frequency.setValueAtTime(frequency,at);if(end)oscillator.frequency.exponentialRampToValueAtTime(end,at+duration);
    volume.gain.setValueAtTime(.001,at);volume.gain.exponentialRampToValueAtTime(gain*this.effectsVolume,at+.008);volume.gain.exponentialRampToValueAtTime(.001,at+duration);oscillator.connect(volume);volume.connect(c.destination);oscillator.start(at);oscillator.stop(at+duration+.01);oscillator.onended=()=>{oscillator.disconnect();volume.disconnect();};
  }
  ui():void{this.tone(650,.08,'sine',.08);}
  event(event:GameEvent):void {
    switch(event.kind){
      case 'pickup':if(performance.now()-this.lastCoin>40){this.tone(1100,.085,'sine',.11,0,1650);this.lastCoin=performance.now();}break;
      case 'jump':this.tone(280,.16,'sine',.08,0,540);break;
      case 'slide':this.tone(220,.13,'triangle',.08,0,100);break;
      case 'lane':this.tone(160,.06,'sine',.035);break;
      case 'land':this.tone(95,.07,'triangle',.075);break;
      case 'impact':case 'shield':this.tone(115,.3,'sawtooth',.09,0,35);break;
      case 'powerup':case 'board':case 'letter':case 'token':case 'revive':[523,659,784,1047].forEach((n,i)=>this.tone(n,.2,'triangle',.09,i*.055));break;
      case 'expiry':this.tone(560,.18,'sine',.05,0,280);break;
      case 'defeat':[330,294,220].forEach((n,i)=>this.tone(n,.3,'triangle',.09,i*.13));break;
      case 'results':case 'challenge':[523,659,784,1047,1319].forEach((n,i)=>this.tone(n,.24,'triangle',.1,i*.08));break;
      default:break;
    }
  }
  dispose():void{this.music?.pause();if(this.music)this.music.src='';void this.context?.close();}
}
