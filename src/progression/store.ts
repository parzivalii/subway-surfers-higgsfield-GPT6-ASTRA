import type { RunSummary } from '../game/types';
import { ACHIEVEMENTS, BOARDS, CHARACTERS, CHALLENGES, DEFAULT_BINDINGS, LETTER_WORD, MISSIONS, MULTIPLIER_CAP, OUTFITS, SHOP_ITEMS, UPGRADES, UPGRADE_CAP, UPGRADE_PRICES, type BindingAction, type BoardId, type CharacterId, type UpgradeId } from './catalog';

export const SAVE_KEY = 'switchyard-sprint-save';
export const SAVE_VERSION = 2;
export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void; }
export interface Settings {
  quality: 'low' | 'medium' | 'high'; music: number; effects: number;
  reducedMotion: boolean; cameraShake: boolean;
  bindings: Record<BindingAction, string[]>;
}
export interface Statistics {
  runs: number; distance: number; score: number; coins: number; jumps: number; slides: number;
  laneChanges: number; nearMisses: number; roofs: number; boardsUsed: number; powerups: number;
  revives: number; duration: number; stumbles: number; challenges: number; maxDistance: number; maxScore: number;
}
export interface HighScore { runId: string; score: number; distance: number; coins: number; character: CharacterId; mode: 'endless' | 'challenge'; date: string; }
export interface ChallengeRecord { bestScore: number; bestProgress: number; completions: number; }
export interface RewardBox { id: string; source: string; }
export interface SaveData {
  version: 2; coins: number; tokens: number; boardCharges: number; headstarts: number;
  unlocked: { characters: string[]; outfits: string[]; boards: string[] };
  equipped: { character: CharacterId; outfit: string; board: BoardId };
  upgrades: Record<UpgradeId, number>;
  missions: { set: number; active: { id: string; progress: number }[]; completedSets: number };
  permanentMultiplier: number; achievements: string[];
  statistics: Statistics; highScores: HighScore[]; challenges: Record<string, ChallengeRecord>;
  hunt: { letters: string[]; completed: number }; boxes: RewardBox[]; rewardSerial: number;
  processedRuns: string[]; tutorialComplete: boolean; settings: Settings;
}
export interface ActionResult { ok: boolean; message: string; }
export interface RewardReport {
  coins: number; tokens: number; boxes: number; achievements: string[];
  missionSetCompleted: boolean; huntsCompleted: number; challengeCompleted: boolean;
}
export interface BoxReward { id: string; kind: 'coins' | 'tokens' | 'boards' | 'headstart'; amount: number; label: string; }
type UnknownObject = Record<string, unknown>;
const object = (v: unknown): UnknownObject => v !== null && typeof v === 'object' && !Array.isArray(v) ? v as UnknownObject : {};
const number = (v: unknown, fallback = 0, max = 1e12): number => typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : fallback;
const decimal = (v: unknown, fallback: number): number => typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : fallback;
const strings = (v: unknown): string[] => Array.isArray(v) ? [...new Set(v.filter((s): s is string => typeof s === 'string' && s.length <= 128))] : [];
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const list = (v: unknown): unknown[] => Array.isArray(v) ? v : [];
const accepted = (v: unknown, choices: readonly string[], fallback: string): string => typeof v === 'string' && choices.includes(v) ? v : fallback;
const statsKeys = ['runs', 'distance', 'score', 'coins', 'jumps', 'slides', 'laneChanges', 'nearMisses', 'roofs', 'boardsUsed', 'powerups', 'revives', 'duration', 'stumbles', 'challenges', 'maxDistance', 'maxScore'] as const;
const upgradeKeys = ['magnet', 'jetpack', 'shoes', 'multiplier'] as const;
const bindingKeys = ['left', 'right', 'jump', 'down', 'board', 'pause'] as const;
const validBinding = (code: string): boolean => /^[A-Za-z][A-Za-z0-9]{0,31}$/.test(code) && !['Tab', 'Enter', 'F5', 'F11', 'F12'].includes(code);
const defaultMissions = (set: number) => Array.from({ length: 3 }, (_, index) => ({ id: MISSIONS[(set * 3 + index) % MISSIONS.length].id, progress: 0 }));

export function freshSave(): SaveData {
  return {
    version: SAVE_VERSION, coins: 0, tokens: 1, boardCharges: 3, headstarts: 0,
    unlocked: { characters: ['pip'], outfits: ['pip-default'], boards: ['tide'] },
    equipped: { character: 'pip', outfit: 'pip-default', board: 'tide' },
    upgrades: { magnet: 0, jetpack: 0, shoes: 0, multiplier: 0 },
    missions: { set: 0, active: defaultMissions(0), completedSets: 0 }, permanentMultiplier: 1,
    achievements: [], statistics: Object.fromEntries(statsKeys.map(k => [k, 0])) as unknown as Statistics,
    highScores: [], challenges: {}, hunt: { letters: [], completed: 0 }, boxes: [], rewardSerial: 0,
    processedRuns: [], tutorialComplete: false,
    settings: { quality: 'medium', music: 0.35, effects: 0.7, reducedMotion: false, cameraShake: true, bindings: clone(DEFAULT_BINDINGS) },
  };
}

/** Reconstruct known fields only; no imported object or prototype is adopted. */
export function validateSave(value: unknown): SaveData {
  const src = object(value);
  if (src.version !== 1 && src.version !== SAVE_VERSION) throw new Error('Unsupported save version. Keep a copy of the file and use a compatible game version.');
  const dest = freshSave();
  for (const key of ['coins', 'tokens', 'boardCharges', 'headstarts', 'rewardSerial'] as const) dest[key] = number(src[key], dest[key]);
  const unlocked = object(src.unlocked);
  dest.unlocked.characters = [...new Set(['pip', ...strings(unlocked.characters).filter(s => CHARACTERS.some(c => c.id === s))])];
  dest.unlocked.outfits = [...new Set([...dest.unlocked.characters.map(c => `${c}-default`), ...strings(unlocked.outfits).filter(s => OUTFITS.some(o => o.id === s && dest.unlocked.characters.includes(o.character)))])];
  dest.unlocked.boards = [...new Set(['tide', ...strings(unlocked.boards).filter(s => BOARDS.some(b => b.id === s))])];
  const equipped = object(src.equipped);
  dest.equipped.character = accepted(equipped.character, dest.unlocked.characters, 'pip') as CharacterId;
  dest.equipped.outfit = accepted(equipped.outfit, dest.unlocked.outfits.filter(s => s.startsWith(`${dest.equipped.character}-`)), `${dest.equipped.character}-default`);
  dest.equipped.board = accepted(equipped.board, dest.unlocked.boards, 'tide') as BoardId;
  const upgrades = object(src.upgrades);
  for (const key of upgradeKeys) dest.upgrades[key] = number(upgrades[key], 0, UPGRADE_CAP);
  const missions = object(src.missions);
  dest.missions.set = number(missions.set, 0, 1e6);
  dest.missions.completedSets = number(missions.completedSets, dest.missions.set, 1e6);
  // Mission identity is derived from the set; imports cannot substitute a completed easy mission.
  dest.missions.active = defaultMissions(dest.missions.set).map(mission => {
    const prior = list(missions.active).map(object).find(m => m.id === mission.id);
    const definition = MISSIONS.find(m => m.id === mission.id)!;
    return { id: mission.id, progress: number(prior?.progress, 0, definition.target) };
  });
  dest.permanentMultiplier = Math.min(MULTIPLIER_CAP, 1 + dest.missions.completedSets);
  dest.achievements = strings(src.achievements).filter(s => ACHIEVEMENTS.some(a => a.id === s));
  const statistics = object(src.statistics);
  for (const key of statsKeys) dest.statistics[key] = number(statistics[key]);
  dest.highScores = list(src.highScores).slice(0, 100).map(object).filter(h => typeof h.runId === 'string').map(h => ({
    runId: String(h.runId).slice(0, 128), score: number(h.score), distance: number(h.distance), coins: number(h.coins),
    character: accepted(h.character, CHARACTERS.map(c => c.id), 'pip') as CharacterId,
    mode: (h.mode === 'challenge' ? 'challenge' : 'endless') as HighScore['mode'],
    date: typeof h.date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(h.date) ? h.date.slice(0, 10) : '—',
  })).sort((a, b) => b.score - a.score).slice(0, 20);
  const challenges = object(src.challenges);
  for (const definition of CHALLENGES) {
    if (!Object.hasOwn(challenges, definition.id)) continue;
    const challenge = object(challenges[definition.id]);
    dest.challenges[definition.id] = { bestScore: number(challenge.bestScore), bestProgress: number(challenge.bestProgress), completions: number(challenge.completions) };
  }
  const hunt = object(src.hunt);
  dest.hunt.letters = strings(hunt.letters).filter(s => LETTER_WORD.includes(s) && s.length === 1);
  dest.hunt.completed = number(hunt.completed);
  const boxIds = new Set<string>();
  dest.boxes = list(src.boxes).slice(0, 10000).map(object).filter(b => typeof b.id === 'string' && /^box-\d+$/.test(b.id) && !boxIds.has(b.id) && !!boxIds.add(b.id)).map(b => ({ id: String(b.id), source: typeof b.source === 'string' ? b.source.slice(0, 80) : 'Reward' }));
  dest.rewardSerial = Math.max(dest.rewardSerial, ...dest.boxes.map(b => number(Number(b.id.slice(4)))));
  dest.processedRuns = strings(src.processedRuns);
  dest.tutorialComplete = src.tutorialComplete === true;
  const settings = object(src.settings);
  dest.settings.quality = accepted(settings.quality, ['low', 'medium', 'high'], 'medium') as Settings['quality'];
  dest.settings.music = decimal(settings.music, 0.35); dest.settings.effects = decimal(settings.effects, 0.7);
  dest.settings.reducedMotion = settings.reducedMotion === true; dest.settings.cameraShake = settings.cameraShake !== false;
  const bindings = object(settings.bindings);
  const used = new Set<string>();
  for (const key of bindingKeys) {
    const values = strings(bindings[key]).filter(code => validBinding(code) && !used.has(code)).slice(0, 3);
    dest.settings.bindings[key] = values.length ? values : DEFAULT_BINDINGS[key].filter(code => !used.has(code));
    // A conflicting imported binding must never disable an action.
    if (!dest.settings.bindings[key].length) {
      dest.settings.bindings = clone(DEFAULT_BINDINGS);
      break;
    }
    for (const code of dest.settings.bindings[key]) used.add(code);
  }
  return dest;
}

export function reviveCost(reviveCount: number): number { return Math.min(3, Math.max(1, Math.floor(reviveCount) + 1)); }
export function powerupDuration(id: UpgradeId, save: SaveData): number { return UPGRADES.find(u => u.id === id)!.baseDuration + save.upgrades[id] * 3; }
export function itemCost(id: string, save: SaveData): number | null {
  const item = SHOP_ITEMS.find(item => item.id === id);
  if (!item) return null;
  if (item.kind === 'upgrade') return UPGRADE_PRICES[save.upgrades[item.target as UpgradeId]] ?? null;
  return item.cost;
}
export function itemOwned(id: string, save: SaveData): boolean {
  const item = SHOP_ITEMS.find(item => item.id === id);
  if (!item) return false;
  if (item.kind === 'character') return save.unlocked.characters.includes(item.target);
  if (item.kind === 'outfit') return save.unlocked.outfits.includes(item.target);
  if (item.kind === 'board') return save.unlocked.boards.includes(item.target);
  if (item.kind === 'upgrade') return save.upgrades[item.target as UpgradeId] >= UPGRADE_CAP;
  return false;
}

export class ProgressionStore {
  private save: SaveData;
  private storage?: StorageLike;
  private listeners = new Set<() => void>();
  private status = 'Progress saves automatically in this browser.';
  constructor(storage?: StorageLike | null) {
    this.save = freshSave();
    try {
      this.storage = storage === null ? undefined : storage ?? (typeof window === 'undefined' ? undefined : window.localStorage);
      if (!this.storage) { this.status = 'Browser storage is unavailable. Progress lasts for this session; export a save to keep it.'; return; }
      const stored = this.storage.getItem(SAVE_KEY);
      if (stored) {
        this.save = validateSave(JSON.parse(stored));
        if (object(JSON.parse(stored)).version === 1) this.persist();
      }
    } catch (error) {
      this.status = error instanceof SyntaxError || (error instanceof Error && error.message.startsWith('Unsupported'))
        ? 'The saved data could not be read. A fresh session is ready; import a backup to recover.'
        : 'Browser storage is unavailable. Progress lasts for this session; export a save to keep it.';
    }
  }
  getSnapshot = (): SaveData => this.save;
  getStatus = (): string => this.status;
  subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener); };
  private persist(): void {
    if (!this.storage) return;
    try { this.storage.setItem(SAVE_KEY, JSON.stringify(this.save)); this.status = 'Progress saves automatically in this browser.'; }
    catch { this.status = 'Storage is full or unavailable. This session continues; export a save to keep your progress.'; }
  }
  private commit(next: SaveData): void { this.save = next; this.persist(); this.listeners.forEach(listener => listener()); }
  private addBox(next: SaveData, source: string): void { next.rewardSerial++; next.boxes.push({ id: `box-${next.rewardSerial}`, source }); }
  private awardAchievements(next: SaveData): string[] {
    const newlyEarned: string[] = [];
    const metrics: Record<string, number> = { ...next.statistics, letterHunts: next.hunt.completed, characters: next.unlocked.characters.length, missionSets: next.missions.completedSets };
    for (const definition of ACHIEVEMENTS) {
      if (!next.achievements.includes(definition.id) && metrics[definition.metric] >= definition.target) {
        next.achievements.push(definition.id); next.coins += definition.coins; next.tokens += definition.tokens; newlyEarned.push(definition.id);
      }
    }
    return newlyEarned;
  }
  purchase(id: string): ActionResult {
    const item = SHOP_ITEMS.find(item => item.id === id);
    if (!item) return { ok: false, message: 'That item is not available.' };
    if (itemOwned(id, this.save)) return { ok: false, message: 'Already owned or fully upgraded.' };
    if (item.kind === 'outfit') {
      const outfit = OUTFITS.find(o => o.id === item.target)!;
      if (!this.save.unlocked.characters.includes(outfit.character)) return { ok: false, message: `Unlock ${CHARACTERS.find(c => c.id === outfit.character)!.name} first.` };
    }
    const cost = itemCost(id, this.save);
    if (cost === null || this.save.coins < cost) return { ok: false, message: `You need ${Math.max(0, (cost ?? 0) - this.save.coins)} more coins.` };
    const next = clone(this.save); next.coins -= cost;
    switch (item.kind) {
      case 'character': next.unlocked.characters.push(item.target); next.unlocked.outfits.push(`${item.target}-default`); break;
      case 'outfit': next.unlocked.outfits.push(item.target); break;
      case 'board': next.unlocked.boards.push(item.target); break;
      case 'upgrade': next.upgrades[item.target as UpgradeId]++; break;
      case 'consumable': if (item.target === 'board') next.boardCharges += 3; else next.headstarts++; break;
    }
    this.awardAchievements(next); this.commit(next);
    return { ok: true, message: `${item.name} unlocked${item.kind === 'consumable' ? ' and ready' : ''}.` };
  }
  equip(type: 'character' | 'outfit' | 'board', id: string): ActionResult {
    const owned = type === 'character' ? this.save.unlocked.characters : type === 'outfit' ? this.save.unlocked.outfits : this.save.unlocked.boards;
    if (!owned.includes(id)) return { ok: false, message: 'Unlock this item in the shop first.' };
    const next = clone(this.save);
    if (type === 'character') { next.equipped.character = id as CharacterId; next.equipped.outfit = `${id}-default`; }
    else if (type === 'outfit') {
      const outfit = OUTFITS.find(o => o.id === id);
      if (!outfit || outfit.character !== next.equipped.character) return { ok: false, message: 'Choose the matching character first.' };
      next.equipped.outfit = id;
    } else next.equipped.board = id as BoardId;
    this.commit(next); return { ok: true, message: 'Equipped.' };
  }
  updateSettings(patch: Partial<Settings>): ActionResult {
    if (patch.bindings) {
      const used = new Set<string>();
      for (const key of bindingKeys) {
        const codes = patch.bindings[key];
        if (!Array.isArray(codes) || codes.length < 1 || codes.length > 3) return { ok: false, message: 'Every action needs one to three keys.' };
        for (const code of codes) {
          if (!validBinding(code) || used.has(code)) return { ok: false, message: 'Choose a unique gameplay key; Enter, Tab and browser function keys are reserved.' };
          used.add(code);
        }
      }
    }
    const next = clone(this.save); next.settings = validateSave({ ...next, settings: { ...next.settings, ...patch } }).settings;
    this.commit(next); return { ok: true, message: 'Settings saved.' };
  }
  completeTutorial(): void { if (!this.save.tutorialComplete) { const next = clone(this.save); next.tutorialComplete = true; this.commit(next); } }
  useConsumable(kind: 'board' | 'headstart'): boolean {
    const key = kind === 'board' ? 'boardCharges' : 'headstarts';
    if (this.save[key] < 1) return false;
    const next = clone(this.save); next[key]--; this.commit(next); return true;
  }
  spendRevive(reviveCount: number): boolean {
    const cost = reviveCost(reviveCount);
    if (!Number.isFinite(cost) || this.save.tokens < cost) return false;
    const next = clone(this.save); next.tokens -= cost; this.commit(next); return true;
  }
  finishRun(summary: RunSummary): RewardReport | null {
    if (summary.mode === 'preview' || typeof summary.id !== 'string' || !summary.id || summary.id.length > 128 || this.save.processedRuns.includes(summary.id)) return null;
    const next = clone(this.save); next.processedRuns.push(summary.id);
    if (summary.mode === 'tutorial') { if (summary.tutorialCompleted) next.tutorialComplete = true; this.commit(next); return { coins: 0, tokens: 0, boxes: 0, achievements: [], missionSetCompleted: false, huntsCompleted: 0, challengeCompleted: false }; }
    const report: RewardReport = { coins: 0, tokens: 0, boxes: 0, achievements: [], missionSetCompleted: false, huntsCompleted: 0, challengeCompleted: false };
    const oldCoins = next.coins, oldTokens = next.tokens, oldBoxes = next.boxes.length;
    const distance = number(summary.distance), score = number(summary.score), coins = number(summary.coins);
    next.coins += coins; next.tokens += number(summary.tokens);
    next.statistics.runs++; next.statistics.distance += distance; next.statistics.score += score; next.statistics.coins += coins;
    for (const key of ['jumps', 'slides', 'laneChanges', 'nearMisses', 'roofs', 'boardsUsed', 'powerups', 'duration', 'stumbles'] as const) next.statistics[key] += number(summary[key]);
    next.statistics.revives += number(summary.reviveCount);
    next.statistics.maxDistance = Math.max(next.statistics.maxDistance, distance); next.statistics.maxScore = Math.max(next.statistics.maxScore, score);
    // Rare tokens are earned at 2km lifetime milestones as well as pickups and selected achievements.
    next.tokens += Math.floor(next.statistics.distance / 2000) - Math.floor((next.statistics.distance - distance) / 2000);
    // A box every three completed runs keeps the entire demo economy attainable without purchases.
    if (next.statistics.runs % 3 === 0) this.addBox(next, 'Three completed runs');
    const letters = Array.isArray(summary.letters) ? summary.letters.filter(l => typeof l === 'string' && l.length === 1 && LETTER_WORD.includes(l)) : [];
    for (const letter of letters) {
      if (!next.hunt.letters.includes(letter)) next.hunt.letters.push(letter);
      if ([...LETTER_WORD].every(l => next.hunt.letters.includes(l))) {
        next.hunt.letters = []; next.hunt.completed++; report.huntsCompleted++; next.coins += 50; next.tokens++; this.addBox(next, 'SPRINT letter hunt');
      }
    }
    const challenge = summary.mode === 'challenge' ? CHALLENGES.find(c => c.id === summary.challengeId) : undefined;
    if (challenge) {
      const progress = challenge.metric === 'distance' ? distance : challenge.metric === 'coins' ? coins : score;
      const previous = next.challenges[challenge.id] ?? { bestScore: 0, bestProgress: 0, completions: 0 };
      const completed = progress >= challenge.target;
      next.challenges[challenge.id] = { bestScore: Math.max(previous.bestScore, score), bestProgress: Math.max(previous.bestProgress, progress), completions: previous.completions + Number(completed) };
      if (completed) { next.statistics.challenges++; next.coins += challenge.reward; report.challengeCompleted = true; }
    }
    const missionMetrics: Record<string, number> = {
      ...summary, distance, score, coins, runs: 1, letters: letters.length,
      districts: Array.isArray(summary.districtVisits) ? new Set(summary.districtVisits).size : 0,
      challenges: Number(report.challengeCompleted),
    } as unknown as Record<string, number>;
    for (const active of next.missions.active) {
      const definition = MISSIONS.find(m => m.id === active.id)!;
      active.progress = Math.min(definition.target, active.progress + number(missionMetrics[definition.metric]));
    }
    if (next.missions.active.every(m => m.progress >= MISSIONS.find(d => d.id === m.id)!.target)) {
      report.missionSetCompleted = true; next.missions.completedSets++; next.missions.set++;
      next.permanentMultiplier = Math.min(MULTIPLIER_CAP, 1 + next.missions.completedSets);
      next.missions.active = defaultMissions(next.missions.set); next.coins += 75; this.addBox(next, 'Mission set complete');
    }
    report.achievements = this.awardAchievements(next);
    next.highScores.push({ runId: summary.id, score, distance, coins, character: next.equipped.character, mode: summary.mode === 'challenge' ? 'challenge' : 'endless', date: new Date().toISOString().slice(0, 10) });
    next.highScores.sort((a, b) => b.score - a.score); next.highScores = next.highScores.slice(0, 20);
    report.coins = next.coins - oldCoins; report.tokens = next.tokens - oldTokens; report.boxes = next.boxes.length - oldBoxes;
    this.commit(next); return report;
  }
  openBox(id = this.save.boxes[0]?.id): BoxReward | null {
    const index = this.save.boxes.findIndex(box => box.id === id);
    if (index < 0 || !id) return null;
    // Outcomes are local and reproducible. No money, timers, remote calls, or reroll payments.
    const serial = Number(id.slice(4));
    let roll = serial + 0x9e3779b9;
    roll = Math.imul(roll ^ (roll >>> 16), 0x21f0aaad);
    roll = Math.imul(roll ^ (roll >>> 15), 0x735a2d97);
    roll = (roll ^ (roll >>> 15)) >>> 0;
    const kind = (['coins', 'boards', 'coins', 'tokens', 'headstart'] as const)[roll % 5];
    const amount = kind === 'coins' ? 45 + (roll % 4) * 15 : kind === 'boards' ? 3 : 1;
    const reward: BoxReward = { id, kind, amount, label: `${amount} ${kind === 'headstart' ? 'head start' : kind === 'boards' ? 'board charges' : kind === 'tokens' ? 'revive token' : 'coins'}` };
    const next = clone(this.save); next.boxes.splice(index, 1);
    if (kind === 'coins') next.coins += amount; else if (kind === 'boards') next.boardCharges += amount; else if (kind === 'tokens') next.tokens += amount; else next.headstarts += amount;
    this.commit(next); return reward;
  }
  exportSave(): string { return JSON.stringify(this.save, null, 2); }
  importSave(text: string): ActionResult {
    if (text.length > 8_000_000) return { ok: false, message: 'This file is too large to be a Switchyard Sprint save.' };
    try { const next = validateSave(JSON.parse(text)); this.commit(next); return { ok: true, message: 'Save imported. Your local progress has been replaced.' }; }
    catch (error) { return { ok: false, message: error instanceof SyntaxError ? 'That file is not valid JSON. Your current save is unchanged.' : error instanceof Error ? error.message : 'The save could not be imported. Your current save is unchanged.' }; }
  }
  reset(confirmed: boolean): ActionResult {
    if (!confirmed) return { ok: false, message: 'Confirm reset to erase local progress.' };
    this.commit(freshSave()); return { ok: true, message: 'Local progress reset. A fresh departure awaits.' };
  }
}
