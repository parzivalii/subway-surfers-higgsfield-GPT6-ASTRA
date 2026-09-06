import { type PlayerState, type WorldObject, PLAYER_HEIGHT, PLAYER_RADIUS, SLIDE_HEIGHT } from './types';

export const isHazard = (object: WorldObject): boolean => ['train', 'movingTrain', 'hurdle', 'barrier', 'obstacle', 'ramp'].includes(object.kind);
export const isPickup = (object: WorldObject): boolean => ['coin', 'magnet', 'jetpack', 'shoes', 'multiplier', 'letter', 'token'].includes(object.kind);
export function standingHeight(player: PlayerState): number { return player.sliding ? SLIDE_HEIGHT : PLAYER_HEIGHT; }
export function roofAt(objects: WorldObject[], x: number, z: number, currentY: number): number {
  let height = 0;
  for (const object of objects) {
    if (!object.active || Math.abs(x - object.x) > object.width / 2 - PLAYER_RADIUS * .5) continue;
    const front = object.z - object.depth / 2, rear = object.z + object.depth / 2;
    if (z < front - .08 || z > rear + .08) continue;
    if (object.kind === 'ramp') {
      const surface = Math.max(0, Math.min(1, (z - front) / object.depth)) * object.height;
      // Feet may follow the shallow slope, but never teleport onto a tall side wall.
      if (surface <= currentY + .22) height = Math.max(height, surface);
    }
    if ((object.kind === 'train' || object.kind === 'movingTrain') && currentY >= object.y + object.height - .22) height = Math.max(height, object.y + object.height);
  }
  return height;
}

/** Continuous slab test of player foot trajectory against expanded obstacle AABB.
 * The obstacle's movement is included in relative Z, avoiding high-speed tunnelling.
 */
export function sweptCollision(previous: PlayerState, current: PlayerState, object: WorldObject, dt: number): {hit: boolean; side: boolean; t: number} {
  if (!object.active || !isHazard(object)) return {hit: false, side: false, t: 1};
  if (object.kind === 'ramp') {
    const front = object.z - object.depth / 2;
    const localHeight = Math.max(0, Math.min(1, (current.z - front) / object.depth)) * object.height;
    // Walk-up contact is a support surface; only the wedge's solid side blocks.
    if (Math.abs(current.x-object.x) <= object.width/2+PLAYER_RADIUS && current.z>=front && current.z<=front+object.depth && current.y<localHeight-.2) {
      return {hit:true,side:Math.abs(current.x-previous.x)>.01,t:1};
    }
    return {hit:false,side:false,t:1};
  }
  const h = Math.min(standingHeight(previous), standingHeight(current));
  const bounds: [number, number, number, number][] = [
    [previous.x - object.x, current.x - object.x, -object.width / 2 - PLAYER_RADIUS, object.width / 2 + PLAYER_RADIUS],
    [previous.y - object.y, current.y - object.y, -h + .06, object.height - .08],
    [previous.z - (object.z - object.speed * dt), current.z - object.z, -object.depth / 2 - PLAYER_RADIUS, object.depth / 2 + PLAYER_RADIUS],
  ];
  let entry = 0, leave = 1, entryAxis = -1;
  for (let axis = 0; axis < 3; axis++) {
    const [a, b, low, high] = bounds[axis]!;
    const delta = b - a;
    if (Math.abs(delta) < 1e-9) { if (a < low || a > high) return {hit: false, side: false, t: 1}; continue; }
    let t0 = (low - a) / delta, t1 = (high - a) / delta;
    if (t0 > t1) [t0, t1] = [t1, t0];
    if (t0 > entry) { entry = t0; entryAxis = axis; }
    leave = Math.min(leave, t1);
    if (entry > leave) return {hit: false, side: false, t: 1};
  }
  return {hit: entry <= 1 && leave >= 0, side: entryAxis === 0, t: entry};
}

export function pickupOverlap(previous: PlayerState, player: PlayerState, object: WorldObject, magnet: boolean, jetpack: boolean): boolean {
  const dx = Math.abs(player.x - object.x), dy = Math.abs(player.y + .85 - (object.y + object.height / 2));
  if (magnet && object.kind === 'coin' && !jetpack && dx < 5.9 && dy < 4.2 && object.z - player.z < 10 && object.z - player.z > -2) return true;
  const zReach = object.kind === 'coin' ? .7 : .85;
  return dx < object.width / 2 + .48 && dy < (jetpack ? 1.3 : 1.1) && object.z >= previous.z - zReach && object.z <= player.z + zReach;
}
