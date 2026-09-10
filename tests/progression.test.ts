import { describe, expect, test } from 'vitest';
import { ACHIEVEMENTS, BOARDS, CHARACTERS, CHALLENGES, DEFAULT_BINDINGS, LETTER_WORD, MISSIONS, OUTFITS, ProgressionStore, SAVE_KEY, freshSave, itemCost, itemOwned, powerupDuration, reviveCost, validateSave, type StorageLike } from '../src/progression';
import type { RunSummary } from '../src/game/types';

class MemoryStorage implements StorageLike {
  data = new Map<string, string>(); writes = 0;
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.writes++; this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}
const run = (patch: Partial<RunSummary> = {}): RunSummary => ({ id: 'run-1', mode: 'endless', distance: 200, score: 1000, coins: 20, jumps: 3, slides: 1, laneChanges: 4, nearMisses: 0, roofs: 0, boardsUsed: 0, powerups: 0, letters: [], tokens: 0, reviveCount: 0, duration: 15, districtVisits: [0], stumbles: 0, maxSpeed: 15, challengeCompleted: false, ...patch });
const funded = (coins = 10000) => { const store = new ProgressionStore(new MemoryStorage()); const save = freshSave(); save.coins = coins; store.importSave(JSON.stringify(save)); return store; };

describe('catalog and local economy', () => {
  test('difficulty survives settlement, reload and export; old records default to Easy', () => {
    const storage = new MemoryStorage(), store = new ProgressionStore(storage);
    store.finishRun(run({difficulty:'impossible'}));
    expect(new ProgressionStore(storage).getSnapshot().highScores[0].difficulty).toBe('impossible');
    const exported=JSON.parse(store.exportSave());
    expect(validateSave(exported).highScores[0].difficulty).toBe('impossible');
    delete exported.highScores[0].difficulty;
    expect(validateSave(exported).highScores[0].difficulty).toBe('easy');
    exported.highScores[0].difficulty='invalid';
    expect(validateSave(exported).highScores[0].difficulty).toBe('easy');
  });
  test('complete original roster, outfits, boards, mission and achievement variety', () => {
    expect(CHARACTERS).toHaveLength(5); expect(OUTFITS).toHaveLength(10); expect(BOARDS).toHaveLength(2);
    for (const character of CHARACTERS) expect(OUTFITS.filter(o => o.character === character.id)).toHaveLength(2);
    expect(MISSIONS.length).toBeGreaterThanOrEqual(15); expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(10);
    expect(new Set(MISSIONS.map(m => m.id)).size).toBe(MISSIONS.length);
  });
  test('a short first run earns tangible rewards and increases permanent multiplier', () => {
    const store = new ProgressionStore(new MemoryStorage()); const result = store.finishRun(run())!;
    expect(result.coins).toBe(125); expect(result.missionSetCompleted).toBe(true); expect(result.boxes).toBe(1);
    expect(store.getSnapshot().permanentMultiplier).toBe(2); expect(store.getSnapshot().missions.active).toHaveLength(3);
  });
  test('repeated results settle once, including after reload', () => {
    const storage = new MemoryStorage(); const store = new ProgressionStore(storage);
    store.finishRun(run()); const after = store.exportSave(), writes = storage.writes;
    expect(store.finishRun(run())).toBeNull(); expect(store.exportSave()).toBe(after); expect(storage.writes).toBe(writes);
    const reloaded = new ProgressionStore(storage); expect(reloaded.finishRun(run())).toBeNull(); expect(reloaded.getSnapshot().statistics.runs).toBe(1);
  });
  test('preview and tutorial never contaminate normal economy or high scores', () => {
    const store = new ProgressionStore(new MemoryStorage()); const before = store.exportSave();
    expect(store.finishRun(run({ mode: 'preview' }))).toBeNull(); expect(store.exportSave()).toBe(before);
    store.finishRun(run({ mode: 'tutorial', tutorialCompleted: true })); expect(store.getSnapshot().tutorialComplete).toBe(true);
    expect(store.getSnapshot().coins).toBe(0); expect(store.getSnapshot().highScores).toHaveLength(0);
  });
  test('ending a tutorial early preserves the incomplete tutorial state', () => {
    const store = new ProgressionStore(new MemoryStorage());
    store.finishRun(run({ mode: 'tutorial', tutorialCompleted: false }));
    expect(store.getSnapshot().tutorialComplete).toBe(false); expect(store.getSnapshot().statistics.runs).toBe(0);
  });
  test('locked outfit purchase fails atomically; all roster and boards can be earned', () => {
    const store = funded(); const before = store.exportSave();
    expect(store.purchase('outfit:rumi-alt').ok).toBe(false); expect(store.exportSave()).toBe(before);
    for (const character of CHARACTERS) {
      if (character.cost) expect(store.purchase(`character:${character.id}`).ok).toBe(true);
      expect(store.equip('character', character.id).ok).toBe(true);
      expect(store.purchase(`outfit:${character.id}-alt`).ok).toBe(true);
      expect(store.equip('outfit', `${character.id}-alt`).ok).toBe(true);
    }
    expect(store.purchase('board:ember').ok).toBe(true); expect(store.equip('board', 'ember').ok).toBe(true);
    expect(store.getSnapshot().unlocked.characters).toHaveLength(5); expect(store.getSnapshot().unlocked.outfits).toHaveLength(10);
    expect(store.getSnapshot().achievements).toContain('friends');
    const after = store.exportSave(); expect(store.purchase('character:rumi').ok).toBe(false); expect(store.exportSave()).toBe(after);
  });
  test('invalid and unaffordable transactions do not change currency', () => {
    const store = new ProgressionStore(new MemoryStorage());
    expect(store.purchase('missing').ok).toBe(false); expect(store.purchase('character:rumi').ok).toBe(false);
    expect(store.equip('board', 'ember').ok).toBe(false); expect(store.getSnapshot().coins).toBe(0);
  });
  test('upgrades have escalating prices, deterministic durations, and a cap', () => {
    const store = funded(); const start = store.getSnapshot().coins;
    expect(itemCost('upgrade:magnet', store.getSnapshot())).toBe(60);
    for (let i = 0; i < 3; i++) expect(store.purchase('upgrade:magnet').ok).toBe(true);
    expect(store.getSnapshot().coins).toBe(start - 380); expect(powerupDuration('magnet', store.getSnapshot())).toBe(19);
    expect(itemCost('upgrade:magnet', store.getSnapshot())).toBeNull(); expect(itemOwned('upgrade:magnet', store.getSnapshot())).toBe(true);
    expect(store.purchase('upgrade:magnet').ok).toBe(false);
  });
  test('revive cost curve and consumables debit only on success', () => {
    const store = funded(); expect([0, 1, 2, 3, 20].map(reviveCost)).toEqual([1, 2, 3, 3, 3]);
    expect(store.spendRevive(0)).toBe(true); expect(store.spendRevive(1)).toBe(false); expect(store.getSnapshot().tokens).toBe(0);
    expect(store.useConsumable('headstart')).toBe(false); store.purchase('consumable:headstart'); expect(store.useConsumable('headstart')).toBe(true);
    for (let i = 0; i < 3; i++) expect(store.useConsumable('board')).toBe(true);
    expect(store.useConsumable('board')).toBe(false); store.purchase('consumable:board'); expect(store.getSnapshot().boardCharges).toBe(3);
  });
});

describe('missions, letter hunt, boxes and challenges', () => {
  test('mission progress accumulates across runs; set rollover does not double count one run', () => {
    const store = new ProgressionStore(new MemoryStorage());
    store.finishRun(run({ id: 'a', distance: 75, coins: 10, jumps: 1 })); expect(store.getSnapshot().missions.set).toBe(0);
    store.finishRun(run({ id: 'b', distance: 75, coins: 10, jumps: 2 })); expect(store.getSnapshot().missions.set).toBe(1);
    expect(store.getSnapshot().missions.active.every(m => m.progress === 0)).toBe(true);
  });
  test('all mission sets remain repeatable and permanent multiplier caps at 10', () => {
    const store = new ProgressionStore(new MemoryStorage());
    for (let i = 0; i < 18; i++) store.finishRun(run({ id: `all-${i}`, mode: 'challenge', challengeId: 'sunline-dash', distance: 20000, coins: 10000, jumps: 100, slides: 100, laneChanges: 100, nearMisses: 100, roofs: 100, boardsUsed: 100, powerups: 100, letters: [...LETTER_WORD], districtVisits: [0, 1, 2], score: 100000 }));
    expect(store.getSnapshot().missions.completedSets).toBeGreaterThan(9); expect(store.getSnapshot().permanentMultiplier).toBe(10);
    expect(store.getSnapshot().missions.active).toHaveLength(3);
  });
  test('letter duplicates are ignored and completed hunts restart', () => {
    const store = new ProgressionStore(new MemoryStorage());
    store.finishRun(run({ id: 'a', letters: ['S', 'S', 'X', 'P'] })); expect(store.getSnapshot().hunt.letters).toEqual(['S', 'P']);
    const result = store.finishRun(run({ id: 'b', letters: ['R', 'I', 'N', 'T', ...LETTER_WORD] }))!;
    expect(result.huntsCompleted).toBe(2); expect(store.getSnapshot().hunt.completed).toBe(2); expect(store.getSnapshot().hunt.letters).toEqual([]);
    expect(result.tokens).toBe(3); // Two hunts plus the one-time first-hunt achievement.
    expect(store.getSnapshot().achievements).toContain('alphabet');
  });
  test('a box is removed and rewarded atomically, never twice, with varied deterministic rewards', () => {
    const store = funded(); const save = store.getSnapshot();
    store.importSave(JSON.stringify({ ...save, boxes: Array.from({ length: 20 }, (_, i) => ({ id: `box-${i + 1}`, source: 'test' })), rewardSerial: 20 }));
    const outcomes = new Set<string>();
    for (let i = 1; i <= 20; i++) {
      const reward = store.openBox(`box-${i}`)!; outcomes.add(reward.kind); const after = store.exportSave();
      expect(store.openBox(`box-${i}`)).toBeNull(); expect(store.exportSave()).toBe(after);
    }
    expect(outcomes.size).toBe(4); expect(store.getSnapshot().boxes).toHaveLength(0);
  });
  test('named seed challenge progress is evaluated locally and rewards once per run', () => {
    const store = new ProgressionStore(new MemoryStorage()); const challenge = CHALLENGES[0];
    expect(Number.isFinite(challenge.seed)).toBe(true);
    store.finishRun(run({ id: 'a', mode: 'challenge', challengeId: challenge.id, distance: 749, challengeCompleted: true }));
    expect(store.getSnapshot().challenges[challenge.id].completions).toBe(0);
    const report = store.finishRun(run({ id: 'b', mode: 'challenge', challengeId: challenge.id, distance: 750, score: 5000 }))!;
    expect(report.challengeCompleted).toBe(true); expect(store.getSnapshot().challenges[challenge.id].bestScore).toBe(5000);
    expect(store.getSnapshot().challenges[challenge.id].completions).toBe(1); expect(store.finishRun(run({ id: 'b' }))).toBeNull();
  });
  test('records stay sorted and bounded while lifetime stats remain cumulative', () => {
    const store = new ProgressionStore(new MemoryStorage());
    for (let i = 0; i < 50; i++) store.finishRun(run({ id: `record-${i}`, score: i * 10 }));
    expect(store.getSnapshot().highScores).toHaveLength(20); expect(store.getSnapshot().highScores[0].score).toBe(490);
    expect(store.getSnapshot().statistics.runs).toBe(50); expect(store.getSnapshot().statistics.distance).toBe(10000);
  });
});

describe('versioned, validated browser persistence', () => {
  test('purchase, equipment, settings, rewards and receipts survive reload', () => {
    const storage = new MemoryStorage(); const store = new ProgressionStore(storage);
    const save = freshSave(); save.coins = 1000; store.importSave(JSON.stringify(save));
    store.purchase('character:rumi'); store.equip('character', 'rumi'); store.purchase('outfit:rumi-alt'); store.equip('outfit', 'rumi-alt');
    store.purchase('upgrade:jetpack'); store.updateSettings({ quality: 'low', music: 0.2, cameraShake: false }); store.finishRun(run());
    expect(new ProgressionStore(storage).getSnapshot()).toEqual(store.getSnapshot());
  });
  test('malformed JSON and unsupported schemas recover visibly', () => {
    for (const value of ['{broken', '{"version":999}', 'null', '[]']) {
      const storage = new MemoryStorage(); storage.setItem(SAVE_KEY, value); const store = new ProgressionStore(storage);
      expect(store.getSnapshot()).toEqual(freshSave()); expect(store.getStatus()).toMatch(/fresh session/);
      expect(store.finishRun(run())).not.toBeNull();
    }
  });
  test('unavailable and quota-failed storage keeps an exportable, playable session', () => {
    const broken: StorageLike = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('quota'); }, removeItem: () => {} };
    const store = new ProgressionStore(broken); expect(store.getStatus()).toMatch(/unavailable/);
    store.finishRun(run()); expect(store.getSnapshot().coins).toBe(125); expect(store.getStatus()).toMatch(/export/);
    expect(JSON.parse(store.exportSave()).coins).toBe(125);
    const memoryOnly = new ProgressionStore(null); memoryOnly.finishRun(run()); expect(memoryOnly.getSnapshot().statistics.runs).toBe(1);
  });
  test('migration preserves compatible v1 fields and supplies added defaults', () => {
    const migrated = validateSave({ version: 1, coins: 77, settings: { music: 0.5 }, unlocked: { characters: ['tavi'] } });
    expect(migrated.version).toBe(2); expect(migrated.coins).toBe(77); expect(migrated.unlocked.characters).toEqual(['pip', 'tavi']);
    expect(migrated.unlocked.outfits).toContain('tavi-default'); expect(migrated.settings.effects).toBe(0.7);
  });
  test('unknown fields, invalid numeric values and locked equipment are discarded', () => {
    const result = validateSave({ version: 2, coins: -10, tokens: '100', boardCharges: Infinity, upgrades: { magnet: 999 },
      unlocked: { characters: ['ghost'], outfits: ['rumi-alt'], boards: ['fake'] },
      equipped: { character: 'rumi', outfit: 'rumi-alt', board: 'ember' },
      missions: { set: 0, active: [{ id: 'air-time', progress: 999 }] }, evil: 'payload', settings: { music: -5, effects: NaN } });
    expect(result.coins).toBe(0); expect(result.tokens).toBe(1); expect(result.boardCharges).toBe(3);
    expect(result.upgrades.magnet).toBe(3); expect(result.equipped).toEqual({ character: 'pip', outfit: 'pip-default', board: 'tide' });
    expect(result).not.toHaveProperty('evil'); expect(result.settings.music).toBe(0); expect(result.settings.effects).toBe(0.7);
    expect(result.missions.active[2].progress).toBe(3);
  });
  test('hostile prototype-like names cannot become catalog items or records', () => {
    const value = JSON.parse('{"version":2,"__proto__":{"polluted":true},"challenges":{"__proto__":{"bestScore":123}},"unlocked":{"characters":["__proto__"]}}');
    const result = validateSave(value); expect(result.unlocked.characters).toEqual(['pip']); expect(result.challenges).toEqual({});
    expect({}).not.toHaveProperty('polluted');
  });
  test('invalid import never overwrites current save; roundtrip and confirmed reset work', () => {
    const store = funded(123); const before = store.exportSave();
    expect(store.importSave('{').ok).toBe(false); expect(store.exportSave()).toBe(before);
    expect(store.importSave('{"version":999}').ok).toBe(false); expect(store.exportSave()).toBe(before);
    expect(store.reset(false).ok).toBe(false); expect(store.exportSave()).toBe(before);
    expect(store.reset(true).ok).toBe(true); expect(store.getSnapshot().coins).toBe(0);
    expect(store.importSave(before).ok).toBe(true); expect(store.getSnapshot().coins).toBe(123);
  });
  test('bindings reject conflicting or reserved keys and notify once per valid change', () => {
    const store = new ProgressionStore(new MemoryStorage()); let notifications = 0; const unsubscribe = store.subscribe(() => notifications++);
    expect(store.updateSettings({ bindings: { ...DEFAULT_BINDINGS, left: ['Space'] } }).ok).toBe(false);
    expect(store.updateSettings({ bindings: { ...DEFAULT_BINDINGS, left: ['Tab'] } }).ok).toBe(false);
    expect(notifications).toBe(0);
    expect(store.updateSettings({ bindings: { ...DEFAULT_BINDINGS, left: ['KeyJ'], right: ['KeyL'] } }).ok).toBe(true);
    expect(notifications).toBe(1); unsubscribe(); store.updateSettings({ quality: 'high' }); expect(notifications).toBe(1);
  });
  test('imported bindings fall back together when an action has no unique key', () => {
    const save = freshSave();
    save.settings.bindings.left = ['KeyD', 'ArrowRight'];
    save.settings.bindings.jump = ['KeyA'];
    const store = new ProgressionStore(new MemoryStorage());
    expect(store.importSave(JSON.stringify(save)).ok).toBe(true);
    const bindings = store.getSnapshot().settings.bindings;
    expect(bindings).toEqual(DEFAULT_BINDINGS);
    const codes = Object.values(bindings).flat();
    expect(new Set(codes).size).toBe(codes.length);
    expect(Object.values(bindings).every(keys => keys.length > 0)).toBe(true);
  });
});
