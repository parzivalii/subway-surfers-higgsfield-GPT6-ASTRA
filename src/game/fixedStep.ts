import { FIXED_DT } from './types';

/** Clamps long gaps and caps catch-up to eight updates; background gaps never fast-forward. */
export class FixedStep {
  private accumulator = 0;
  droppedSeconds = 0;
  readonly step = FIXED_DT;
  advance(frameSeconds: number, update: (dt: number) => void): number {
    if (!Number.isFinite(frameSeconds) || frameSeconds <= 0) return this.accumulator / this.step;
    const bounded = Math.min(frameSeconds, this.step * 8);
    this.droppedSeconds += frameSeconds - bounded;
    this.accumulator += bounded;
    let ticks = 0;
    while (this.accumulator + 1e-10 >= this.step && ticks < 8) { update(this.step); this.accumulator -= this.step; ticks++; }
    this.accumulator = Math.max(0, this.accumulator);
    return Math.min(this.accumulator / this.step, 1);
  }
  reset(): void { this.accumulator = 0; }
}
