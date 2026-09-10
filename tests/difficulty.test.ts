import { describe, expect, test } from 'vitest';
import { isHazard, roofAt, sweptCollision } from '../src/game/collision';
import { DIFFICULTIES } from '../src/game/difficulty';
import { FixedStep } from '../src/game/fixedStep';
import { CHUNK_LENGTH, makeObject, WorldGenerator } from '../src/game/generator';
import { GameSimulation } from '../src/game/simulation';
import { FIXED_DT, type Lane, type PlayerState } from '../src/game/types';

const levels = ['easy','normal','hard','impossible'] as const;
const harder = ['normal','hard','impossible'] as const;
const player = (y=0): PlayerState => ({x:0,y,z:0,lane:0,targetLane:0,vy:0,grounded:y===0,sliding:false,animation:'run',animationTime:0});
const advance = (sim: GameSimulation, seconds:number) => { for(let i=0;i<Math.round(seconds*60);i++) sim.update(FIXED_DT); };

describe('difficulty balance',()=>{
  test('Easy remains the default and preserves the original speed and seeded route',()=>{
    const oldDefault=new WorldGenerator(729),explicit=new WorldGenerator(729,'easy');
    for(let chunk=0;chunk<8;chunk++) {
      expect(explicit.generate(chunk)).toEqual(oldDefault.generate(chunk));
      expect(explicit.generate(chunk).route.every(n=>n.action==='none')).toBe(true);
    }
    const sim=new GameSimulation({seed:729});
    expect(sim.state.difficulty).toBe('easy');expect(sim.state.speed).toBe(12);
    sim.start();sim.state.objects=[];advance(sim,10);expect(sim.state.speed).toBeCloseTo(12.75);
    expect(DIFFICULTIES.easy).toMatchObject({maxSpeed:26,acceleration:.075,powerupEvery:3,rampChance:.66});
  });
  test.each(levels)('%s starts faster, accelerates to its cap, and reports its difficulty',difficulty=>{
    const config=DIFFICULTIES[difficulty],sim=new GameSimulation({seed:1,difficulty});
    expect(sim.state.speed).toBe(config.startSpeed);sim.start();sim.state.objects=[];
    advance(sim,1);expect(sim.state.speed).toBeCloseTo(config.startSpeed+config.acceleration);
    sim.state.elapsed=10000;sim.update(FIXED_DT);expect(sim.state.speed).toBe(config.maxSpeed);
    expect(sim.summary().difficulty).toBe(difficulty);expect(sim.summary().maxSpeed).toBe(config.maxSpeed);
  });
  test('increasing difficulty raises action density, cuts power-up frequency, and forces alternating routes at Hard+',()=>{
    const actions:number[]=[],powers:number[]=[];
    for(const difficulty of levels) {
      const chunks=Array.from({length:100},(_,i)=>new WorldGenerator(35,difficulty).generate(i));
      const route=chunks.flatMap(c=>c.route);
      actions.push(route.filter(n=>n.action!=='none').length);
      powers.push(chunks.flatMap(c=>c.objects).filter(o=>['jetpack','magnet','multiplier','shoes'].includes(o.kind)).length);
      expect(new Set(chunks.flatMap(c=>c.objects).filter(o=>['jetpack','magnet','multiplier','shoes'].includes(o.kind)).map(o=>o.kind)).size).toBe(4);
      if(difficulty==='hard'||difficulty==='impossible') for(let n=1;n<route.length;n++) expect(Math.abs(route[n]!.lane-route[n-1]!.lane)).toBe(1);
      if(difficulty==='impossible') expect(route.every(n=>n.action!=='none'&&n.actionZ!==undefined)).toBe(true);
    }
    for(let i=1;i<4;i++){expect(actions[i]!).toBeGreaterThan(actions[i-1]!);expect(powers[i]!).toBeLessThan(powers[i-1]!);}
  });
  test('tutorial remains forgiving Easy even when another difficulty is supplied',()=>{
    const sim=new GameSimulation({mode:'tutorial',difficulty:'impossible',seed:8});
    expect(sim.state.difficulty).toBe('easy');expect(sim.generator.generate(0,true)).toEqual(new WorldGenerator(8).generate(0,true));
    sim.start();sim.state.objects=[];advance(sim,4);expect(sim.state.speed).toBe(12);
  });
});

describe('action-aware route certificates',()=>{
  test.each(harder)('%s: 1,000 seeds × start/mid/max speeds execute jumps/slides across four chunks, moving timing and elevated entries',difficulty=>{
    const balance=DIFFICULTIES[difficulty];let jumps=0,slides=0,movers=0,ramps=0;
    for(let seed=0;seed<1000;seed++) {
      const generator=new WorldGenerator(seed,difficulty);
      const chunks=Array.from({length:4},(_,i)=>generator.generate(i));
      const route=chunks.flatMap(c=>c.route),actions=route.filter(n=>n.action!=='none');
      const hazards=chunks.flatMap(c=>c.objects).filter(isHazard);
      movers+=hazards.filter(o=>o.kind==='movingTrain').length;ramps+=hazards.filter(o=>o.kind==='ramp').length;
      for(const speed of [balance.startSpeed,(balance.startSpeed+balance.maxSpeed)/2,balance.maxSpeed]) {
        const actor=player([0,2.7,4.2][seed%3]!);let routeIndex=0,actionIndex=0,time=seed*.117,slideTime=0,nextLane:Lane=0;
        while(actor.z<CHUNK_LENGTH*4-20) {
          while(routeIndex<route.length&&actor.z>=route[routeIndex]!.z) nextLane=route[routeIndex++]!.lane;
          const node=actions[actionIndex];
          if(node&&actor.z>=node.actionZ!-speed*.25) {
            if(!actor.grounded) throw new Error(`${difficulty} seed ${seed}: unavailable ${node.action} at ${actor.z}`);
            if(node.action==='jump'){actor.vy=10;actor.grounded=false;actor.sliding=false;slideTime=0;jumps++;}
            else {slideTime=.85;actor.sliding=true;slides++;}
            actionIndex++;
          }
          const previous={...actor};
          actor.x+=Math.sign(nextLane*3-actor.x)*Math.min(Math.abs(nextLane*3-actor.x),22*FIXED_DT);
          actor.z+=speed*FIXED_DT;slideTime=Math.max(0,slideTime-FIXED_DT);actor.sliding=slideTime>0;
          const floor=roofAt(hazards,actor.x,actor.z,Math.max(actor.y,previous.y));
          if(actor.grounded&&actor.y<=floor+.25){actor.y=floor;actor.vy=0;}
          else {actor.grounded=false;actor.vy-=25*FIXED_DT;actor.y+=actor.vy*FIXED_DT;if(actor.y<=floor&&actor.vy<=0){actor.y=floor;actor.vy=0;actor.grounded=true;}}
          time+=FIXED_DT;
          for(const object of hazards) {
            if(object.kind==='movingTrain') {
              object.z=object.originZ!+Math.sin(time*.65+(object.phaseOffset??0))*5;
              const before=object.originZ!+Math.sin((time-FIXED_DT)*.65+(object.phaseOffset??0))*5;
              object.speed=(object.z-before)/FIXED_DT;
            }
            if(Math.abs(object.z-actor.z)<24&&sweptCollision(previous,actor,object,FIXED_DT).hit)
              throw new Error(`${difficulty} seed ${seed} speed ${speed}: ${object.kind}, lane ${nextLane}, z ${actor.z}, y ${actor.y}`);
          }
        }
        if(actionIndex!==actions.length) throw new Error('Not all certified actions executed');
      }
    }
    expect(jumps).toBeGreaterThan(1000);expect(slides).toBeGreaterThan(1000);expect(movers).toBeGreaterThan(1000);expect(ramps).toBeGreaterThan(100);
  },120000);

  test.each(harder)('%s certificates also survive the real accelerating simulation without power-ups',difficulty=>{
    for(let seed=0;seed<30;seed++) {
      const sim=new GameSimulation({seed,difficulty});sim.start();
      const route=Array.from({length:4},(_,i)=>sim.generator.generate(i)).flatMap(c=>c.route);
      const actions=route.filter(n=>n.action!=='none');let routeIndex=0,actionIndex=0;
      while(sim.state.distance<780&&sim.state.phase==='running') {
        while(routeIndex<route.length&&sim.state.distance>=route[routeIndex]!.z) {
          const target=route[routeIndex++]!.lane;
          while(sim.state.player.targetLane!==target) sim.action(sim.state.player.targetLane<target?'right':'left');
        }
        const node=actions[actionIndex];
        if(node&&sim.state.distance>=node.actionZ!-sim.state.speed*.25){sim.action(node.action as 'jump'|'slide');actionIndex++;}
        for(const o of sim.state.objects) if(!isHazard(o))o.active=false;
        sim.update(FIXED_DT);
      }
      expect(sim.state.phase,`${difficulty} seed ${seed} at ${sim.state.distance}`).toBe('running');
      expect(sim.state.counters.stumbles).toBe(0);expect(sim.state.counters.powerups).toBe(0);
    }
  });
});

describe('maximum difficulty safety',()=>{
  test('36m/s frontal collision cannot tunnel through a thin hurdle',()=>{
    const sim=new GameSimulation({difficulty:'impossible'});sim.start();sim.state.elapsed=10000;
    sim.state.objects=[makeObject(1,'hurdle',0,.9)];sim.update(1/30);expect(sim.state.phase).toBe('caught');
  });
  test.each(harder)('%s earned head-start respects speed cap and expiry clears a landing corridor',difficulty=>{
    const sim=new GameSimulation({difficulty,headstart:true});sim.start();sim.state.objects=[];advance(sim,1);
    expect(sim.state.speed).toBeLessThanOrEqual(DIFFICULTIES[difficulty].maxSpeed);
    sim.state.elapsed=1000;sim.state.effects.jetpack=.01;
    sim.state.objects=[makeObject(1,'train',0,sim.state.player.z+15)];advance(sim,1.5);
    expect(sim.state.phase).toBe('running');expect(sim.state.player.grounded).toBe(true);
  });
  test.each(harder)('%s fixed simulation agrees at 30/60/144Hz and safely bounds a long stall',difficulty=>{
    const run=(fps:number)=>{const sim=new GameSimulation({difficulty,seed:7}),clock=new FixedStep();sim.start();sim.state.objects=[];sim.state.effects.invincible=100;
      for(let n=0;n<fps*8;n++)clock.advance(1/fps,dt=>sim.update(dt));return sim.state;};
    const [slow,normal,fast]=[30,60,144].map(run);
    expect(slow!.player).toEqual(normal!.player);expect(fast!.player).toEqual(normal!.player);expect(slow!.score).toBe(fast!.score);
    const clock=new FixedStep();let steps=0;clock.advance(4,()=>steps++);expect(steps).toBe(8);expect(clock.droppedSeconds).toBeGreaterThan(3.8);
  });
});
