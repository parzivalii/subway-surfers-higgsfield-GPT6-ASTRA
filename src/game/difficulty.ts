import type { Difficulty } from './types';

export interface DifficultySettings {
  label: string;
  description: string;
  startSpeed: number;
  maxSpeed: number;
  acceleration: number;
  requiredActionChance: number;
  powerupEvery: number;
  rampChance: number;
}

/** Speeds use metres/second. Easy preserves the original game's balance. */
export const DIFFICULTIES: Record<Difficulty, DifficultySettings> = {
  easy: {label:'Easy',description:'The original relaxed run. Clear routes and frequent power-ups.',startSpeed:12,maxSpeed:26,acceleration:.075,requiredActionChance:0,powerupEvery:3,rampChance:.66},
  normal: {label:'Normal',description:'Faster starts, occasional jump or slide routes, fewer power-ups.',startSpeed:16,maxSpeed:29,acceleration:.18,requiredActionChance:.25,powerupEvery:5,rampChance:.4},
  hard: {label:'Hard',description:'Rapid acceleration, constant lane decisions and demanding combinations.',startSpeed:20,maxSpeed:32,acceleration:.4,requiredActionChance:.65,powerupEvery:8,rampChance:.2},
  impossible: {label:'Impossible',description:'Expert reflexes: blistering speed, a lane change and jump or slide at every row.',startSpeed:26,maxSpeed:36,acceleration:.8,requiredActionChance:1,powerupEvery:12,rampChance:.1},
};
