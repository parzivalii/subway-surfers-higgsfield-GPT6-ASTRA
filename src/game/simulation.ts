import { isPickup, pickupOverlap, roofAt, sweptCollision } from './collision';
import { CHUNK_LENGTH, districtAt, WorldGenerator } from './generator';
import { type Action, type AnimationState, type GameEvent, type GameState, type Lane, type Powerup, type RunSummary, type SimulationConfig, MAX_SPEED, MIN_SPEED } from './types';

const EFFECT_DURATION: Record<Powerup, number> = {magnet: 10, jetpack: 8, shoes: 10, multiplier: 12};
const GRAVITY = 25;
const JUMP_SPEED = 10;
const LANE_SPEED = 22;
let runSerial = 0;
const approach = (value: number, target: number, delta: number) => value < target ? Math.min(value + delta, target) : Math.max(value - delta, target);

export class GameSimulation {
  readonly state: GameState;
  readonly config: SimulationConfig;
  readonly generator: WorldGenerator;
  readonly id: string;
  private events: GameEvent[] = [];
  private nextChunk = 0;
  private slideTime = 0;
  private animationLock = 0;
  private caughtTime = 0;
  private airFast = false;
  private landingProtection = 0;
  private readonly visited = new Set<number>([0]);
  private touchedRoofs = new Set<number>();
  private maxSpeed = MIN_SPEED;
  private stumbleCooldown = 0;
  private tutorialActions = new Set<Action>();
  private resumePhase: 'running' = 'running';

  constructor(config: SimulationConfig = {}) {
    this.config = config;
    const seed = config.seed ?? (Math.random() * 0x7fffffff | 0);
    this.generator = new WorldGenerator(seed);
    this.id = `run-${Date.now().toString(36)}-${++runSerial}-${seed}`;
    const player = { x: 0, y: 0, z: 0, lane: 0 as Lane, targetLane: 0 as Lane, vy: 0, grounded: true, sliding: false, animation: 'idle' as AnimationState, animationTime: 0 };
    this.state = {
      phase: 'ready', player, previousPlayer: {...player}, objects: [],
      effects: {magnet: 0, jetpack: 0, shoes: 0, multiplier: 0, board: 0, invincible: 0},
      distance: 0, score: 0, coins: 0, speed: MIN_SPEED, elapsed: 0,
      district: 'station', districtIndex: 0, droneDistance: 9, revives: 0,
      boardCharges: config.boardCharges ?? 3, tutorialStep: 0, message: '', countdown: 0,
      letters: [], tokens: 0, counters: {jumps: 0, slides: 0, laneChanges: 0, nearMisses: 0, roofs: 0, boardsUsed: 0, powerups: 0, stumbles: 0},
      multiplier: Math.max(1, config.multiplier ?? 1), board: config.board ?? 'tide', mode: config.mode ?? 'endless',
      preview: config.preview ?? false, challengeCompleted: false, seed,
    };
    this.streamWorld();
  }
  start(): void {
    if (this.state.phase !== 'ready') return;
    this.state.phase = 'running'; this.animate('run'); this.emit({kind: 'start'});
    if (this.config.headstart) { this.state.effects.jetpack = 8; this.state.effects.magnet = 8; this.state.message = 'HEAD START · safe flight'; this.emit({kind:'powerup',item:'jetpack'}); }
    if (this.state.mode === 'tutorial') this.updateTutorial();
  }
  action(action: Action): void {
    const s = this.state, p = s.player;
    if (action === 'confirm') { if (s.phase === 'ready') this.start(); else if (s.phase === 'paused') this.resume(); return; }
    if (action === 'pause') { if (s.phase === 'running' || s.phase === 'countdown') this.pause(); else if (s.phase === 'paused') this.resume(); return; }
    if (s.phase !== 'running') return;
    this.tutorialActions.add(action);
    if (action === 'left' || action === 'right') {
      const lane = Math.max(-1, Math.min(1, p.targetLane + (action === 'left' ? -1 : 1))) as Lane;
      if (lane !== p.targetLane) { p.targetLane = lane; s.counters.laneChanges++; this.emit({kind:'lane',value:lane}); }
    }
    if (action === 'jump' && p.grounded && s.effects.jetpack <= 0) {
      p.vy = JUMP_SPEED * (s.effects.shoes > 0 ? 1.42 : 1) * (s.effects.board > 0 && s.board === 'tide' ? 1.09 : 1);
      p.grounded = false; this.slideTime = 0; p.sliding = false; this.airFast = false;
      s.counters.jumps++; this.animate('jump', .16); this.emit({kind:'jump'});
    }
    if (action === 'slide' && s.effects.jetpack <= 0) {
      if (!p.grounded) { p.vy = Math.min(p.vy, -12); this.airFast = true; }
      else { this.slideTime = .85; p.sliding = true; s.counters.slides++; this.animate('slide'); this.emit({kind:'slide'}); }
    }
    if (action === 'board' && s.effects.board <= 0 && s.effects.jetpack <= 0 && s.boardCharges > 0) {
      s.boardCharges--; s.effects.board = 18; s.counters.boardsUsed++; this.emit({kind:'board',item:s.board});
    }
    if (s.mode === 'tutorial') this.updateTutorial();
  }
  pause(): void {
    if (this.state.phase !== 'running' && this.state.phase !== 'countdown') return;
    this.resumePhase = 'running'; this.state.phase = 'paused'; this.emit({kind:'pause'});
  }
  resume(): void { if (this.state.phase !== 'paused') return; this.state.phase = 'countdown'; this.state.countdown = 3; this.emit({kind:'resume'}); }
  revive(): boolean {
    const s = this.state;
    if (s.phase !== 'caught') return false;
    s.revives++; this.caughtTime = 0; s.player.y = 0; s.player.vy = 0; s.player.grounded = true;
    s.player.x = s.player.targetLane * 3; s.player.lane = s.player.targetLane;
    s.effects.invincible = 3; s.effects.jetpack = 0; this.slideTime = 0; s.player.sliding = false;
    this.clearRecoveryCorridor(80); s.droneDistance = 11; this.animate('run');
    s.previousPlayer = {...s.player}; s.phase = 'countdown'; s.countdown = 3;
    this.emit({kind:'revive',value:s.revives}); return true;
  }
  finish(): void {
    if (this.state.phase === 'results') return;
    this.state.phase = 'results'; this.emit({kind:'results'});
  }
  /** Developer previews can activate effects without touching currency or normal saves. */
  previewPowerup(kind: Powerup): void { if (this.state.preview) this.activatePowerup(kind); }
  drainEvents(): GameEvent[] { const events = this.events; this.events = []; return events; }
  summary(): RunSummary {
    const s = this.state;
    return { id: this.id, mode: s.preview ? 'preview' : s.mode, ...(this.config.challengeId ? {challengeId:this.config.challengeId} : {}),
      distance: Math.floor(s.distance), score: Math.floor(s.score), coins: s.coins, ...s.counters,
      letters: [...s.letters], tokens:s.tokens, reviveCount:s.revives, duration:s.elapsed,
      districtVisits: [...this.visited], maxSpeed:this.maxSpeed, challengeCompleted:s.challengeCompleted, tutorialCompleted:s.mode === 'tutorial' && s.tutorialStep >= 6 && s.distance > 170 };
  }
  update(dt: number): void {
    if (!Number.isFinite(dt) || dt <= 0) return;
    // External callers may only advance one small step; use FixedStep for wall-clock frames.
    dt = Math.min(dt, 1 / 30);
    const s = this.state, p = s.player;
    s.previousPlayer = {...p};
    if (s.phase === 'countdown') { s.countdown = Math.max(0, s.countdown - dt); if (s.countdown <= 0) s.phase = this.resumePhase; return; }
    if (s.phase === 'caught') { this.caughtTime += dt; s.droneDistance = approach(s.droneDistance, .9, dt * 9); p.animationTime += dt; return; }
    if (s.phase !== 'running') return;
    s.elapsed += dt; p.animationTime += dt;
    s.speed = s.mode === 'tutorial' ? 12 : Math.min(MAX_SPEED, MIN_SPEED + s.elapsed * .075);
    if (s.effects.jetpack > 0 && this.config.headstart && s.elapsed < 8) s.speed = Math.min(MAX_SPEED, s.speed + 9);
    this.maxSpeed = Math.max(this.maxSpeed, s.speed);
    this.animationLock = Math.max(0, this.animationLock - dt); this.stumbleCooldown = Math.max(0, this.stumbleCooldown - dt);
    this.landingProtection = Math.max(0, this.landingProtection - dt);
    for (const key of Object.keys(s.effects) as (keyof typeof s.effects)[]) {
      const before = s.effects[key]; s.effects[key] = Math.max(0, before - dt);
      if (before > 0 && s.effects[key] === 0) {
        if (key === 'jetpack') { this.landingProtection = 2.5; s.effects.invincible = Math.max(s.effects.invincible, 2.5); this.clearRecoveryCorridor(s.speed * 2.6); }
        if (key === 'shoes' && !p.grounded) this.landingProtection = 1.2;
        if (key === 'board') { s.effects.invincible = Math.max(s.effects.invincible, .75); this.emit({kind:'expiry',text:'Board expired'}); }
        else if (key !== 'invincible') this.emit({kind:'expiry',item:key});
      }
    }
    p.x = approach(p.x, p.targetLane * 3, LANE_SPEED * dt);
    p.lane = Math.round(p.x / 3) as Lane;
    p.z += s.speed * dt; s.distance = p.z;
    s.score += s.speed * dt * s.multiplier * (s.effects.multiplier > 0 ? 2 : 1);
    for (const object of s.objects) {
      if (object.kind === 'movingTrain') {
        const old = object.z;
        object.z = object.originZ! + Math.sin(s.elapsed * .65 + (object.phaseOffset ?? 0)) * 5;
        object.speed = (object.z - old) / dt;
      }
    }
    this.slideTime = Math.max(0, this.slideTime - dt); p.sliding = this.slideTime > 0;
    const wasGrounded = p.grounded;
    const floor = roofAt(s.objects, p.x, p.z, Math.max(p.y, s.previousPlayer.y));
    if (s.effects.jetpack > 0) { p.grounded = false; p.sliding = false; p.y = approach(p.y, 6.5, dt * 11); p.vy = 0; this.animate('jump'); }
    else if (p.grounded && p.y <= floor + .25) { p.y = floor; p.vy = 0; }
    else {
      p.grounded = false;
      const controlled = s.effects.board > 0 && s.board === 'ember' && p.vy < 0 && !this.airFast;
      p.vy -= GRAVITY * (controlled ? .6 : 1) * dt;
      if (controlled) p.vy = Math.max(p.vy, -5);
      p.y += p.vy * dt;
      if (p.y <= floor && p.vy <= 0) {
        p.y = floor; p.vy = 0; p.grounded = true; this.airFast = false;
        if (!wasGrounded) { this.animate('land', .12); this.emit({kind:'land',value:floor}); }
      }
    }
    if (p.grounded && p.y > 2.5) {
      const roof = s.objects.find(o => (o.kind === 'train' || o.kind === 'movingTrain') && Math.abs(o.x - p.x) < 1 && Math.abs(o.z-p.z) < o.depth/2+.2);
      if (roof && !this.touchedRoofs.has(roof.id)) { this.touchedRoofs.add(roof.id); s.counters.roofs++; }
    }
    for (const object of s.objects) {
      if (!object.active) continue;
      if (isPickup(object)) {
        if (pickupOverlap(s.previousPlayer, p, object, s.effects.magnet > 0, s.effects.jetpack > 0)) {
          object.active = false;
          if (object.kind === 'coin') { s.coins++; s.score += 10 * s.multiplier * (s.effects.multiplier > 0 ? 2 : 1); this.emit({kind:'pickup',value:1,item:'coin'}); }
          else if (object.kind === 'letter') { s.letters.push(object.letter ?? 'S'); this.emit({kind:'letter',text:object.letter ?? 'S'}); }
          else if (object.kind === 'token') { s.tokens++; this.emit({kind:'token',value:1}); }
          else this.activatePowerup(object.kind as Powerup);
        }
      } else if (s.effects.jetpack <= 0 && s.effects.invincible <= 0) {
        const collision = sweptCollision(s.previousPlayer, p, object, dt);
        if (collision.hit) {
          if (s.mode === 'tutorial') { s.effects.invincible = 1.5; object.active = false; s.message = 'Keep going! Try the controls shown below.'; this.emit({kind:'impact',text:'Tutorial recovery'}); }
          else if (s.effects.board > 0) {
            s.effects.board = 0; s.effects.invincible = 2.3; this.clearRecoveryCorridor(s.speed * 2.5);
            s.droneDistance = 7; this.animate('stumble', .25); this.emit({kind:'shield',item:s.board});
          } else if (collision.side && this.stumbleCooldown <= 0 && s.droneDistance > 4) {
            s.counters.stumbles++; s.counters.nearMisses++; s.droneDistance = 3.2;
            s.effects.invincible = 1.1; this.stumbleCooldown = 1.2; this.animate('stumble', .35);
            const retreat = Math.round(s.previousPlayer.x / 3) as Lane;
            p.targetLane = retreat; p.x = retreat * 3; this.emit({kind:'impact',text:'Side bump'});
          } else if (this.landingProtection > 0) { object.active = false; s.effects.invincible = .35; }
          else { this.defeat(); break; }
        }
      }
    }
    s.droneDistance = Math.min(12, s.droneDistance + dt * .55);
    if (this.animationLock <= 0 && s.phase === 'running') this.animate(p.sliding ? 'slide' : !p.grounded ? p.vy >= 0 ? 'jump' : 'fall' : s.effects.board > 0 ? 'board' : 'run');
    const district = districtAt(p.z);
    if (district !== s.district) { s.district = district; s.districtIndex = Math.floor(p.z/600)%3; this.visited.add(s.districtIndex); this.emit({kind:'district',text:district}); }
    if (s.mode === 'challenge' && !s.challengeCompleted && this.challengeObjective()) { s.challengeCompleted = true; this.emit({kind:'challenge',text:'Challenge complete — keep running for a record!'}); }
    if (s.mode === 'tutorial') this.updateTutorial();
    this.streamWorld();
  }
  private challengeObjective(): boolean {
    if (this.config.challengeId === 'market-money') return this.state.coins >= 75;
    if (this.config.challengeId === 'quay-high') return this.state.score >= 10000;
    return this.state.distance >= 750;
  }
  private activatePowerup(kind: Powerup): void {
    const s = this.state;
    const duration = EFFECT_DURATION[kind] + Math.max(0, Math.min(3, this.config.upgrades?.[kind] ?? 0)) * 3;
    // Repeat pickup refreshes to a full duration, never grows an unbounded stack.
    s.effects[kind] = duration; s.counters.powerups++; this.emit({kind:'powerup',item:kind,value:duration});
    if (kind === 'jetpack') { this.slideTime = 0; s.player.sliding = false; s.player.grounded = false; s.effects.invincible = Math.max(s.effects.invincible,.7); }
  }
  private defeat(): void { this.state.phase = 'caught'; this.state.player.sliding = false; this.animate('defeat'); this.emit({kind:'defeat'}); }
  private animate(animation: AnimationState, lock = 0): void {
    if (this.state.player.animation !== animation) { this.state.player.animation = animation; this.state.player.animationTime = 0; }
    this.animationLock = Math.max(this.animationLock, lock);
  }
  private emit(event: GameEvent): void { this.events.push(event); if (this.events.length > 128) this.events.shift(); }
  private streamWorld(): void {
    const s = this.state;
    while (this.nextChunk * CHUNK_LENGTH < s.player.z + 420) { const chunk = this.generator.generate(this.nextChunk++, s.mode === 'tutorial'); s.objects.push(...chunk.objects); }
    const cutoff = s.player.z - 45;
    // Recycle the backing array only once per retired chunk; pooled renderer follows IDs.
    if (s.objects.length && s.objects[0]!.z < cutoff - CHUNK_LENGTH) {
      s.objects = s.objects.filter(o => o.z + o.depth / 2 > cutoff);
      this.touchedRoofs = new Set([...this.touchedRoofs].filter(id => Math.floor(id / 1000) >= Math.floor(cutoff / CHUNK_LENGTH)));
    }
  }
  private clearRecoveryCorridor(metres: number): void {
    for (const object of this.state.objects) if (!isPickup(object) && object.z + object.depth / 2 >= this.state.player.z - 5 && object.z - object.depth / 2 <= this.state.player.z + metres) object.active = false;
  }
  private updateTutorial(): void {
    const s = this.state;
    const steps: { complete: boolean; message: string }[] = [
      {complete:this.tutorialActions.has('left'),message:'A / ← · Move left into the coin trail'},
      {complete:this.tutorialActions.has('right'),message:'D / → · Move right. Each press changes one lane'},
      {complete:this.tutorialActions.has('jump'),message:'W / ↑ · Jump over a low hurdle'},
      {complete:this.tutorialActions.has('slide'),message:'S / ↓ · Slide under bars; press in air to drop'},
      {complete:this.tutorialActions.has('board'),message:'SPACE · Activate a board for one-crash protection'},
      {complete:s.coins>=12,message:'Collect 12 coins. Power-ups activate on contact'},
    ];
    const next = steps.findIndex(step => !step.complete);
    const value = next < 0 ? steps.length : next;
    if (s.tutorialStep !== value) { s.tutorialStep=value; this.emit({kind:'tutorial',value}); }
    s.message = next < 0 ? 'Training complete! Finish the run to collect your reward.' : steps[next]!.message;
    if (next < 0 && s.distance > 170 && s.phase === 'running') { this.animate('celebrate'); this.finish(); }
  }
}
