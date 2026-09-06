import { describe, expect, test } from 'vitest';
import { sweptCollision, roofAt, isHazard } from '../src/game/collision';
import { FixedStep } from '../src/game/fixedStep';
import { CHUNK_LENGTH, makeObject, WorldGenerator } from '../src/game/generator';
import { GameSimulation } from '../src/game/simulation';
import { type PlayerState, type Lane, type Powerup, MAX_SPEED, FIXED_DT } from '../src/game/types';

const advance = (sim: GameSimulation, seconds: number) => { for (let i=0; i<Math.round(seconds*60); i++) sim.update(FIXED_DT); };
const isolated = () => { const sim=new GameSimulation({seed:42}); sim.start(); sim.state.objects=[]; sim.drainEvents(); return sim; };
const player = (changes: Partial<PlayerState> = {}): PlayerState => ({x:0,y:0,z:0,lane:0,targetLane:0,vy:0,grounded:true,sliding:false,animation:'run',animationTime:0,...changes});

describe('reachable world generation', () => {
  test('1,000 seeds: actual swept actor traversal across three chunk boundaries, all speeds, moving timing and elevated entries', () => {
    let movingCount=0, ramps=0;
    for (let seed=0;seed<1000;seed++) {
      const gen=new WorldGenerator(seed);
      const chunks=[0,1,2,3].map(index=>gen.generate(index));
      const route=chunks.flatMap(c=>c.route);
      const obstacles=chunks.flatMap(c=>c.objects).filter(isHazard);
      movingCount+=obstacles.filter(o=>o.kind==='movingTrain').length;
      ramps+=chunks.flatMap(c=>c.objects).filter(o=>o.kind==='ramp').length;
      for(const speed of [12,19,MAX_SPEED]) {
      let actor=player({y:[0,2.7,4.2][seed%3]!,grounded:seed%3===0});
      let routeIndex=0, time=seed*.117;
      let nextLane:Lane=0;
      while (actor.z<CHUNK_LENGTH*4-20) {
        while(routeIndex<route.length && actor.z>=route[routeIndex]!.z) nextLane=route[routeIndex++]!.lane;
        const previous={...actor};
        actor.x+=Math.sign(nextLane*3-actor.x)*Math.min(Math.abs(nextLane*3-actor.x),22*FIXED_DT);
        actor.z+=speed*FIXED_DT;
        if(actor.y>0 || actor.vy>0) {actor.vy-=25*FIXED_DT;actor.y=Math.max(0,actor.y+actor.vy*FIXED_DT);}
        for (const object of obstacles) {
          if(object.kind==='movingTrain') {
            object.z=object.originZ!+Math.sin(time*.65+(object.phaseOffset??0))*5;
            const before=object.originZ!+Math.sin((time-FIXED_DT)*.65+(object.phaseOffset??0))*5;
            object.speed=(object.z-before)/FIXED_DT;
          }
          if(Math.abs(object.z-actor.z)<24) expect(sweptCollision(previous,actor,object,FIXED_DT).hit,`seed ${seed} z ${actor.z} kind ${object.kind} lane ${nextLane}`).toBe(false);
        }
        time+=FIXED_DT;
      }
      }
    }
    expect(movingCount).toBeGreaterThan(1000); expect(ramps).toBeGreaterThan(1000);
  }, 120000);
  test('optional ramp and roof is traversable at minimum and maximum speed', () => {
    for(const speed of [12,26]) {
      const ramp=makeObject(1,'ramp',0,20),train=makeObject(2,'train',0,33);
      let p=player({z:10}); let roofSteps=0;
      while(p.z<44) {
        const prev={...p};p.z+=speed*FIXED_DT;
        const floor=roofAt([ramp,train],p.x,p.z,p.y);
        if(p.grounded&&p.y<=floor+.25)p.y=floor;
        else {p.vy-=25*FIXED_DT;p.y+=p.vy*FIXED_DT;p.grounded=false;if(p.y<floor){p.y=floor;p.vy=0;p.grounded=true;}}
        if(p.y===2.7)roofSteps++;
        expect(sweptCollision(prev,p,train,FIXED_DT).hit,`speed ${speed}, z ${p.z} y ${p.y}`).toBe(false);
      }
      expect(roofSteps).toBeGreaterThan(15);
    }
  });
  test('stream stays bounded through 20 simulated minutes',()=>{
    const sim=isolated(); sim.state.effects.invincible=5000;
    let maximum=0;
    for(let i=0;i<20*60*60;i++) {sim.update(FIXED_DT);maximum=Math.max(maximum,sim.state.objects.length);}
    expect(sim.state.elapsed).toBeCloseTo(1200,3);expect(maximum).toBeLessThan(1300);expect(sim.state.objects.length).toBeLessThan(1300);
    expect(sim.state.speed).toBe(MAX_SPEED);expect(sim.state.phase).toBe('running');
  },30000);
});

describe('movement and collision rules',()=>{
  test('lane inputs are bounded, smooth and usable while airborne',()=>{
    const sim=isolated();sim.action('left');sim.update(FIXED_DT);expect(sim.state.player.x).toBeLessThan(0);expect(sim.state.player.x).toBeGreaterThan(-3);
    sim.action('jump');sim.action('right');sim.action('right');sim.action('right');advance(sim,.35);
    expect(sim.state.player.targetLane).toBe(1);expect(sim.state.player.x).toBe(3);expect(sim.state.player.y).toBeGreaterThan(1);
    sim.action('slide');advance(sim,.3);expect(sim.state.player.grounded).toBe(true);
  });
  test('standing hits an overhead barrier, sliding clears, jumping clears hurdle',()=>{
    const standing=isolated();standing.state.objects=[makeObject(1,'barrier',0,5)];advance(standing,.5);expect(standing.state.phase).toBe('caught');
    const sliding=isolated();sliding.state.objects=[makeObject(1,'barrier',0,5)];sliding.action('slide');advance(sliding,.5);expect(sliding.state.phase).toBe('running');
    const jumping=isolated();jumping.state.objects=[makeObject(1,'hurdle',0,5)];jumping.action('jump');advance(jumping,.5);expect(jumping.state.phase).toBe('running');
  });
  test('continuous collision catches an obstacle crossed within one tick',()=>{
    const obstacle=makeObject(1,'obstacle',0,5);expect(sweptCollision(player(),player({z:12}),obstacle,.1).hit).toBe(true);
    expect(sweptCollision(player({y:4}),player({z:12,y:4}),obstacle,.1).hit).toBe(false);
  });
  test('ramp sides block low entrants without teleporting feet onto the top',()=>{
    const ramp=makeObject(1,'ramp',0,10);
    expect(roofAt([ramp],0,14,0)).toBe(0);
    expect(sweptCollision(player({x:2,z:14}),player({x:1.3,z:14.2}),ramp,FIXED_DT)).toMatchObject({hit:true,side:true});
    expect(roofAt([ramp],0,4.4,0)).toBeCloseTo(.09);
  });
  test('side bump recovers; a second near-drone collision is fatal',()=>{
    const sim=isolated();sim.state.objects=[makeObject(1,'train',1,0)];sim.action('right');advance(sim,.1);
    expect(sim.state.phase).toBe('running');expect(sim.state.counters.stumbles).toBe(1);expect(sim.state.droneDistance).toBeLessThan(4);
    sim.state.objects=[];advance(sim,1.2);sim.state.objects=[makeObject(2,'obstacle',0,sim.state.player.z+2)];advance(sim,.2);expect(sim.state.phase).toBe('caught');
  });
  test('board shield is consumed once and yields safe recovery; revive is deliberate and safe',()=>{
    const sim=isolated();sim.action('board');sim.state.objects=[makeObject(1,'train',0,8)];advance(sim,.2);
    expect(sim.state.effects.board).toBe(0);expect(sim.state.effects.invincible).toBeGreaterThan(0);expect(sim.state.phase).toBe('running');
    expect(sim.drainEvents().filter(e=>e.kind==='shield')).toHaveLength(1);
    sim.state.effects.invincible=0;sim.state.objects=[makeObject(2,'train',0,sim.state.player.z+8)];advance(sim,.2);expect(sim.state.phase).toBe('caught');
    expect(sim.revive()).toBe(true);expect(sim.state.phase).toBe('countdown');const z=sim.state.player.z;advance(sim,2);expect(sim.state.player.z).toBe(z);advance(sim,2);expect(sim.state.phase).toBe('running');expect(sim.state.effects.invincible).toBeGreaterThan(0);
  });
});

describe('powerups, pause and time',()=>{
  test('both boards protect once, expire safely, and have distinct handling',()=>{
    const tide=new GameSimulation({board:'tide'}),ember=new GameSimulation({board:'ember'});
    for(const sim of [tide,ember]){sim.start();sim.state.objects=[];sim.action('board');sim.action('jump');}
    expect(tide.state.player.vy).toBeGreaterThan(ember.state.player.vy);
    for(const sim of [tide,ember]){sim.state.player.y=5;sim.state.player.vy=-8;sim.update(FIXED_DT);}
    expect(ember.state.player.vy).toBe(-5);expect(tide.state.player.vy).toBeLessThan(-8);
    ember.action('slide');ember.update(FIXED_DT);expect(ember.state.player.vy).toBeLessThan(-12);
    for(const board of ['tide','ember'] as const){const sim=new GameSimulation({board});sim.start();sim.state.objects=[];sim.action('board');sim.pause();advance(sim,4);expect(sim.state.effects.board).toBe(18);sim.resume();advance(sim,3.1);sim.state.effects.board=.01;sim.state.objects=[makeObject(1,'train',0,8)];advance(sim,.15);expect(sim.state.phase).toBe('running');expect(sim.state.effects.invincible).toBeGreaterThan(0);expect(sim.state.effects.board).toBe(0);}
  });
  test.each(['magnet','shoes','multiplier'] as Powerup[])('%s does not grant an undocumented crash shield',kind=>{
    const sim=new GameSimulation({preview:true});sim.start();sim.state.objects=[];sim.previewPowerup(kind);sim.state.objects=[makeObject(1,'train',0,8)];advance(sim,.3);expect(sim.state.phase).toBe('caught');const remaining=sim.state.effects[kind];advance(sim,2);expect(sim.state.effects[kind]).toBe(remaining);
  });
  test('earned head start accelerates safely, and expiry preserves a survivable landing',()=>{
    const sim=new GameSimulation({headstart:true});sim.start();sim.state.objects=[];advance(sim,1);expect(sim.state.speed).toBeGreaterThan(20);expect(sim.state.player.y).toBe(6.5);expect(sim.state.effects.magnet).toBeGreaterThan(0);sim.state.effects.jetpack=.01;sim.state.objects=[makeObject(1,'train',0,sim.state.player.z+10)];advance(sim,1.5);expect(sim.state.phase).toBe('running');expect(sim.state.player.grounded).toBe(true);
  });
  test.each(['magnet','jetpack','shoes','multiplier'] as Powerup[])('%s pickup, repeat, pause and expiry',kind=>{
    const sim=isolated();sim.state.objects=[makeObject(1,kind,0,1,0,1)];advance(sim,.15);expect(sim.state.effects[kind]).toBeGreaterThan(0);
    const duration=sim.state.effects[kind];sim.pause();advance(sim,5);expect(sim.state.effects[kind]).toBe(duration);sim.resume();advance(sim,3.1);expect(sim.state.effects[kind]).toBeLessThan(duration);
    sim.state.objects=[makeObject(2,kind,0,sim.state.player.z+.8,0,sim.state.player.y+.85)];advance(sim,.05);expect(sim.state.effects[kind]).toBeGreaterThan(duration-.1);
    sim.state.effects[kind]=.03;advance(sim,.1);expect(sim.state.effects[kind]).toBe(0);expect(sim.drainEvents().some(e=>e.kind==='expiry'&&e.item===kind)).toBe(true);
  });
  test('magnet collects across lanes, different effects coexist, jetpack lands safely',()=>{
    const sim=new GameSimulation({seed:1,preview:true});sim.start();sim.state.objects=[];sim.previewPowerup('magnet');sim.previewPowerup('multiplier');
    sim.state.objects=[makeObject(1,'coin',1,6,0,.85)];advance(sim,.05);expect(sim.state.coins).toBe(1);expect(sim.state.effects.multiplier).toBeGreaterThan(0);
    sim.previewPowerup('jetpack');advance(sim,1);expect(sim.state.player.y).toBe(6.5);
    sim.state.effects.jetpack=.02;sim.state.objects=[makeObject(4,'train',0,sim.state.player.z+9)];advance(sim,1.5);expect(sim.state.player.y).toBe(0);expect(sim.state.phase).toBe('running');
  });
  test('fixed simulation matches at 30, 60 and 144Hz, and bounds frame stalls',()=>{
    const run=(fps:number)=>{const sim=isolated(),clock=new FixedStep();let jumped=false;for(let f=0;f<fps*8;f++)clock.advance(1/fps,dt=>{if(sim.state.elapsed>=2&&!jumped){sim.action('jump');jumped=true;}sim.update(dt);});return sim.state;};
    const states=[30,60,144].map(run);expect(states[0]!.player).toEqual(states[1]!.player);expect(states[2]!.player).toEqual(states[1]!.player);expect(states[0]!.score).toBe(states[2]!.score);
    const clock=new FixedStep();let ticks=0;clock.advance(8,()=>ticks++);expect(ticks).toBe(8);expect(clock.droppedSeconds).toBeGreaterThan(7.8);expect(clock.advance(Number.NaN,()=>ticks++)).toBeLessThan(1);
  });
  test('all six tutorial objectives lead to results and stable summary identity',()=>{
    const sim=new GameSimulation({mode:'tutorial',seed:2});sim.start();sim.action('left');sim.action('right');sim.action('jump');advance(sim,1);sim.action('slide');sim.action('board');sim.state.coins=12;advance(sim,15);
    expect(sim.state.phase).toBe('results');expect(sim.state.tutorialStep).toBe(6);expect(sim.summary().id).toBe(sim.summary().id);expect(sim.summary().tutorialCompleted).toBe(true);
    const abandoned=new GameSimulation({mode:'tutorial'});abandoned.start();abandoned.finish();expect(abandoned.summary().tutorialCompleted).toBe(false);
  });
  test('all six SPRINT hunt letters occur naturally in generated chunks',()=>{
    const generator=new WorldGenerator(30);const letters=new Set(Array.from({length:12},(_,i)=>generator.generate(i)).flatMap(c=>c.objects).filter(o=>o.kind==='letter').map(o=>o.letter));
    expect([...letters].sort().join('')).toBe('INPRST');
  });
});
