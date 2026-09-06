import { mkdirSync, writeFileSync } from 'node:fs';
// Original deterministic composition, "Sunline Shuffle". No sampled recordings.
const rate=22050, bpm=116, beat=60/bpm, seconds=beat*64;
const out=new Float64Array(Math.ceil(seconds*rate));
let rng=42017; const noise=()=>{rng=(1664525*rng+1013904223)>>>0;return rng/2147483648-1};
const note=(n)=>440*2**((n-69)/12);
function tone(at,dur,freq,volume,type='pluck') {for(let i=0;i<dur*rate;i++){const t=i/rate,k=Math.floor(at*rate)+i;if(k>=out.length)break;let s=0;const envelope=Math.min(t*180,1)*Math.exp(-t*(type==='bass'?6:9));if(type==='hat')s=noise()*Math.exp(-t*90);else if(type==='kick')s=Math.sin(2*Math.PI*(55*t+5*(1-Math.exp(-t*28))))*Math.exp(-t*17);else if(type==='snare')s=(noise()*.7+Math.sin(2*Math.PI*180*t)*.3)*Math.exp(-t*25);else s=(Math.sin(2*Math.PI*freq*t)+.25*Math.sin(2*Math.PI*freq*2*t)+.1*Math.sin(2*Math.PI*freq*3*t))*envelope;out[k]+=s*volume;}}
const chords=[[60,64,67,71],[57,60,64,67],[53,57,60,64],[55,59,62,67]];
const melody=[76,79,81,79,76,74,72,74,76,0,79,76,74,72,71,0,72,76,79,81,79,76,74,76,74,0,71,74,79,76,74,0];
for(let b=0;b<64;b++){const c=chords[Math.floor(b/4)%4],time=b*beat;tone(time,.3,0,.3,'kick');if(b%2===1)tone(time,.2,0,.13,'snare');tone(time,.08,0,.07,'hat');tone(time+beat*.52,.08,0,.045,'hat');tone(time,beat*.85,note(c[0]-24),.18,'bass');for(const n of c)tone(time+beat*.5,.3,note(n),.065);const n=melody[b%32];if(n)tone(time+beat*.06,.38,note(n),.115);}
const data=Buffer.alloc(44+out.length*2);data.write('RIFF',0);data.writeUInt32LE(data.length-8,4);data.write('WAVEfmt ',8);data.writeUInt32LE(16,16);data.writeUInt16LE(1,20);data.writeUInt16LE(1,22);data.writeUInt32LE(rate,24);data.writeUInt32LE(rate*2,28);data.writeUInt16LE(2,32);data.writeUInt16LE(16,34);data.write('data',36);data.writeUInt32LE(out.length*2,40);for(let i=0;i<out.length;i++)data.writeInt16LE(Math.round(Math.tanh(out[i])*28000),44+i*2);mkdirSync('public/audio',{recursive:true});writeFileSync('public/audio/sunline-shuffle.wav',data);console.log(`Original music: ${(data.length/1048576).toFixed(2)} MiB, ${seconds.toFixed(2)} seconds`);
