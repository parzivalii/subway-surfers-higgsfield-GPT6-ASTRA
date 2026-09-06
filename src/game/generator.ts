import { type District, type GeneratedChunk, type Lane, type ObjectKind, type RouteNode, type WorldObject, ROOF_HEIGHT } from './types';
import { CITY } from './city';

export const CHUNK_LENGTH = 200;
export const ROW_OFFSETS = [34, 78, 122, 166] as const;
export const DISTRICTS: District[] = CITY.districts.map(d=>d.id);
export function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => { s += 0x6d2b79f5; let t = Math.imul(s ^ s >>> 15, 1 | s); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function districtAt(z: number): District { return DISTRICTS[Math.floor(Math.max(z, 0) / CITY.districtLength) % DISTRICTS.length]!; }
export function makeObject(id: number, kind: ObjectKind, lane: Lane, z: number, chunk = 0, y = 0): WorldObject {
  const dimensions: Record<ObjectKind, [number, number, number]> = {
    coin: [.44, .44, .44], train: [2.32, ROOF_HEIGHT, 14], movingTrain: [2.32, ROOF_HEIGHT, 14],
    hurdle: [2.35, .82, 1.1], barrier: [2.4, 1.4, 1.2], obstacle: [1.65, 1.7, 1.65],
    ramp: [2.32, ROOF_HEIGHT, 12], magnet: [.72, .72, .72], jetpack: [.75, .8, .75], shoes: [.8, .6, .7],
    multiplier: [.75, .75, .75], letter: [.65, .9, .5], token: [.65, .65, .65],
  };
  const [width, height, depth] = dimensions[kind];
  return { id, kind, lane, x: lane * 3, y: kind === 'barrier' ? .95 + y : y, z, width, height, depth,
    active: true, speed: 0, chunk, ...(kind === 'movingTrain' ? {originZ: z, phaseOffset: (id % 7) * .6} : {}) };
}

/** Each row leaves one full lane clear. Switching starts after the preceding
 * envelope, with at least 12m of clear travel (0.46s at cap vs 0.28s for two lanes).
 * Moving trains stay within their certified +/-5m longitudinal envelope.
 * Roof routes are optional. Their entry ramp joins the train without a gap.
 */
export class WorldGenerator {
  readonly seed: number;
  constructor(seed: number) { this.seed = seed >>> 0; }
  generate(index: number, tutorial = false): GeneratedChunk {
    const random = seededRandom(this.seed ^ Math.imul(index + 1, 0x9e3779b1));
    const start = index * CHUNK_LENGTH;
    const objects: WorldObject[] = [];
    const route: RouteNode[] = [];
    let serial = 0;
    const put = (kind: ObjectKind, lane: Lane, z: number, y = 0) => {
      const obj = makeObject(index * 1000 + serial++, kind, lane, z, index, y); objects.push(obj); return obj;
    };
    let lastLane: Lane = 0;
    for (let row = 0; row < ROW_OFFSETS.length; row++) {
      const z = start + ROW_OFFSETS[row]!;
      const safeLane = Math.floor(random() * 3) - 1 as Lane;
      route.push({ z: z - 30, lane: safeLane, action: 'none', elevation: 0 });
      // First 24m of a fresh run is intentionally clear. Tutorial obstacles remain avoidable.
      for (const lane of [-1, 0, 1] as Lane[]) {
        if (lane === safeLane) continue;
        const choice = Math.floor(random() * 8);
        const kind: ObjectKind = choice < 2 ? 'train' : choice === 2 ? 'movingTrain' : choice < 5 ? 'hurdle' : choice < 7 ? 'barrier' : 'obstacle';
        if (kind === 'train' && random() < .66) {
          // Ramp ends exactly where the train begins. Roof starts at z-7.
          put('ramp', lane, z - 13);
          put('train', lane, z);
          for (let c = -5; c <= 5; c += 2.5) put('coin', lane, z + c, ROOF_HEIGHT + .85);
        } else {
          put(kind, lane, z);
          if (kind === 'hurdle') for (let c = -4; c <= 4; c += 2) put('coin', lane, z + c, 1.3 + Math.cos(c / 4 * Math.PI / 2) * 1.1);
        }
      }
      // Coin line begins after the lane-change window, teaching the certified safe path.
      for (let c = -10; c <= 12; c += 3) put('coin', safeLane, z + c, .85);
      const pickups = ['magnet', 'shoes', 'multiplier', 'jetpack'] as const;
      if ((index * 4 + row) % 3 === 1) put(pickups[(index + row) % 4]!, safeLane, z + 5, 1);
      if ((index * 4 + row) % 4 === 2) {
        const letter = put('letter', safeLane, z + 9, 1.05); letter.letter = 'SPRINT'[(index + Math.floor(row / 2)) % 6];
      }
      if (row === 3 && index % 3 === 1) put('token', safeLane, z + 15, 1.1);
      // Aerial coin paths remain available for jetpack flight in every lane.
      for (const lane of [-1, 0, 1] as Lane[]) for (let c = -8; c <= 10; c += 6) put('coin', lane, z + c, 7.2);
      lastLane = safeLane;
    }
    if (tutorial && index === 0) {
      // Wide, individually introduced actions; normal safe route still exists.
      objects.splice(0, objects.length);
      for (let z = 16; z < 190; z += 4) put('coin', z < 44 ? -1 : z < 88 ? 1 : 0, z, .9);
      put('hurdle', 0, 114); put('barrier', 0, 154); put('magnet', 0, 176, 1);
      route.splice(0, route.length, { z: 1, lane: -1, action: 'none', elevation: 0 }, { z: 48, lane: 1, action: 'none', elevation: 0 }, { z: 94, lane: 0, action: 'none', elevation: 0 });
    }
    return {index, start, end: start + CHUNK_LENGTH, objects, route, district: districtAt(start), safeLane: lastLane};
  }
}
