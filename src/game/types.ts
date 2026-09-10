export type Lane = -1 | 0 | 1;
export type District = 'station' | 'mural' | 'waterfront';
export type Powerup = 'magnet' | 'jetpack' | 'shoes' | 'multiplier';
export type Board = 'tide' | 'ember';
export type Action = 'left' | 'right' | 'jump' | 'slide' | 'board' | 'pause' | 'confirm';
export type AnimationState = 'idle' | 'run' | 'jump' | 'fall' | 'land' | 'slide' | 'stumble' | 'defeat' | 'celebrate' | 'board';
export type ObjectKind = 'coin' | 'train' | 'movingTrain' | 'hurdle' | 'barrier' | 'obstacle' | 'ramp' | Powerup | 'letter' | 'token';
export type RunMode = 'endless' | 'tutorial' | 'challenge';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'impossible';
export type Phase = 'ready' | 'running' | 'paused' | 'countdown' | 'caught' | 'results';
export interface PlayerState {
  x: number; y: number; z: number; lane: Lane; targetLane: Lane; vy: number;
  grounded: boolean; sliding: boolean; animation: AnimationState; animationTime: number;
}
export interface WorldObject {
  id: number; kind: ObjectKind; lane: Lane; x: number; y: number; z: number;
  width: number; height: number; depth: number; active: boolean;
  speed: number; chunk: number; letter?: string; originZ?: number; phaseOffset?: number;
}
export interface Effects { magnet: number; jetpack: number; shoes: number; multiplier: number; board: number; invincible: number }
export interface RunCounters {
  jumps: number; slides: number; laneChanges: number; nearMisses: number;
  roofs: number; boardsUsed: number; powerups: number; stumbles: number;
}
export interface GameState {
  phase: Phase; player: PlayerState; previousPlayer: PlayerState; objects: WorldObject[];
  effects: Effects; distance: number; score: number; coins: number; speed: number;
  elapsed: number; district: District; districtIndex: number; droneDistance: number;
  revives: number; boardCharges: number; tutorialStep: number; message: string;
  countdown: number; letters: string[]; tokens: number; counters: RunCounters;
  multiplier: number; board: Board; mode: RunMode; preview: boolean;
  challengeCompleted: boolean; seed: number; difficulty: Difficulty;
}
export interface RunSummary extends RunCounters {
  id: string; mode: RunMode | 'preview'; difficulty?: Difficulty; challengeId?: string; distance: number;
  score: number; coins: number; letters: string[]; tokens: number; reviveCount: number;
  duration: number; districtVisits: number[]; maxSpeed: number; challengeCompleted: boolean; tutorialCompleted?: boolean;
}
export interface SimulationConfig {
  mode?: RunMode; seed?: number; board?: Board; difficulty?: Difficulty;
  upgrades?: Partial<Record<Powerup, number>>; multiplier?: number;
  headstart?: boolean; preview?: boolean; boardCharges?: number; challengeId?: string;
}
export type GameEventKind = 'start' | 'pickup' | 'powerup' | 'expiry' | 'board' | 'shield' | 'impact' | 'defeat' | 'revive' | 'results' | 'land' | 'jump' | 'slide' | 'lane' | 'letter' | 'token' | 'district' | 'tutorial' | 'pause' | 'resume' | 'challenge';
export interface GameEvent { kind: GameEventKind; value?: number; item?: ObjectKind | Board; text?: string }
export interface RouteNode { z: number; lane: Lane; action: 'none' | 'jump' | 'slide'; elevation: number; actionZ?: number }
export interface GeneratedChunk { index: number; start: number; end: number; objects: WorldObject[]; route: RouteNode[]; district: District; safeLane: Lane }
export const LANE_WIDTH = 3;
export const PLAYER_RADIUS = 0.32;
export const PLAYER_HEIGHT = 1.65;
export const SLIDE_HEIGHT = 0.6;
export const FIXED_DT = 1 / 60;
export const MIN_SPEED = 12;
export const MAX_SPEED = 26;
export const ROOF_HEIGHT = 2.7;
