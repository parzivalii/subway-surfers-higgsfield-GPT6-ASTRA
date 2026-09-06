export type CharacterId = 'pip' | 'rumi' | 'tavi' | 'jett' | 'nori';
export type BoardId = 'tide' | 'ember';
export type UpgradeId = 'magnet' | 'jetpack' | 'shoes' | 'multiplier';
export type BindingAction = 'left' | 'right' | 'jump' | 'down' | 'board' | 'pause';

export const CHARACTERS = [
  { id: 'pip', name: 'Pip', role: 'Express courier', description: 'A fearless courier with a teal jacket and a backpack full of shortcuts.', color: '#169c9e', cost: 0 },
  { id: 'rumi', name: 'Rumi', role: 'Roller artist', description: 'Orange overalls, rounded pads, and a new mural around every corner.', color: '#f47754', cost: 150 },
  { id: 'tavi', name: 'Tavi', role: 'Inventive mechanic', description: 'Plum workwear, practical gloves, and an ingenious answer to everything.', color: '#765078', cost: 200 },
  { id: 'jett', name: 'Jett', role: 'Street dancer', description: 'Cobalt tracks, a sculpted hair silhouette, and an unstoppable rhythm.', color: '#477bc6', cost: 250 },
  { id: 'nori', name: 'Nori', role: 'Adventure photographer', description: 'Cream and green travel gear with a camera always at the ready.', color: '#5c9671', cost: 300 },
] as const;

export const OUTFITS = [
  { id: 'pip-default', character: 'pip', name: 'Express', description: 'Cropped teal courier jacket and compact backpack.', cost: 0 },
  { id: 'pip-alt', character: 'pip', name: 'Rain Runner', description: 'A bright rain cape, cargo shorts, and waterproof boots.', cost: 80 },
  { id: 'rumi-default', character: 'rumi', name: 'Fresh Paint', description: 'Orange overalls with rounded protective accessories.', cost: 0 },
  { id: 'rumi-alt', character: 'rumi', name: 'Mural Maker', description: 'A loose painter smock, striped sleeves, and generous knee pads.', cost: 90 },
  { id: 'tavi-default', character: 'tavi', name: 'Workshop', description: 'Plum vest with sturdy practical gloves.', cost: 0 },
  { id: 'tavi-alt', character: 'tavi', name: 'Night Shift', description: 'A utility coverall, rolled cuffs, and a full tool belt.', cost: 100 },
  { id: 'jett-default', character: 'jett', name: 'Flow State', description: 'Cobalt tracksuit and high-top sneakers.', cost: 0 },
  { id: 'jett-alt', character: 'jett', name: 'Freestyle', description: 'A cropped hoodie, wide joggers, and chunky dance shoes.', cost: 110 },
  { id: 'nori-default', character: 'nori', name: 'Day Trip', description: 'Cream windbreaker with green accents.', cost: 0 },
  { id: 'nori-alt', character: 'nori', name: 'Field Notes', description: 'A safari vest, camera satchel, and explorer shorts.', cost: 120 },
] as const;

export const BOARDS = [
  { id: 'tide', name: 'Tide', description: 'Rounded teal board. A small jump boost and one-hit crash protection.', benefit: 'Higher jumps', color: '#169c9e', cost: 0 },
  { id: 'ember', name: 'Ember', description: 'Angular coral board. Controlled descent and one-hit crash protection.', benefit: 'Controlled descent', color: '#f47754', cost: 180 },
] as const;

export const UPGRADES = [
  { id: 'magnet', name: 'Coin magnet', description: 'Pulls nearby coins into your pocket.', baseDuration: 10 },
  { id: 'jetpack', name: 'Jetpack', description: 'Fly above traffic along an airborne coin path.', baseDuration: 8 },
  { id: 'shoes', name: 'Super-jump shoes', description: 'Clear tall obstacles with boosted jumps.', baseDuration: 10 },
  { id: 'multiplier', name: 'Score boost', description: 'Temporarily doubles your score multiplier.', baseDuration: 12 },
] as const;

export const UPGRADE_CAP = 3;
export const MULTIPLIER_CAP = 10;
export const LETTER_WORD = 'SPRINT';
export const UPGRADE_PRICES = [60, 120, 200] as const;
export const DEFAULT_BINDINGS: Record<BindingAction, string[]> = {
  left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'], jump: ['KeyW', 'ArrowUp'],
  down: ['KeyS', 'ArrowDown'], board: ['Space'], pause: ['Escape', 'KeyP'],
};

export type MissionMetric = 'distance' | 'coins' | 'jumps' | 'slides' | 'laneChanges' | 'nearMisses' | 'roofs' | 'boardsUsed' | 'powerups' | 'runs' | 'score' | 'letters' | 'districts' | 'challenges';
export interface MissionDefinition { id: string; title: string; metric: MissionMetric; target: number; }
export const MISSIONS: readonly MissionDefinition[] = [
  { id: 'first-stretch', title: 'Cover 150 metres', metric: 'distance', target: 150 },
  { id: 'pocket-change', title: 'Collect 20 coins', metric: 'coins', target: 20 },
  { id: 'air-time', title: 'Jump 3 times', metric: 'jumps', target: 3 },
  { id: 'low-profile', title: 'Slide under the skyline 5 times', metric: 'slides', target: 5 },
  { id: 'switch-it', title: 'Change lanes 12 times', metric: 'laneChanges', target: 12 },
  { id: 'going-places', title: 'Cover 600 metres', metric: 'distance', target: 600 },
  { id: 'roof-hopper', title: 'Land on 2 train roofs', metric: 'roofs', target: 2 },
  { id: 'bright-ideas', title: 'Collect 3 power-ups', metric: 'powerups', target: 3 },
  { id: 'coin-trail', title: 'Collect 80 coins', metric: 'coins', target: 80 },
  { id: 'board-meeting', title: 'Activate 2 hoverboards', metric: 'boardsUsed', target: 2 },
  { id: 'close-call', title: 'Make 3 close passes', metric: 'nearMisses', target: 3 },
  { id: 'city-tour', title: 'Visit districts 6 times', metric: 'districts', target: 6 },
  { id: 'letter-carrier', title: 'Collect 4 hunt letters', metric: 'letters', target: 4 },
  { id: 'score-runner', title: 'Earn 8,000 score', metric: 'score', target: 8000 },
  { id: 'keep-running', title: 'Finish 3 runs', metric: 'runs', target: 3 },
  { id: 'long-route', title: 'Cover 1,500 metres', metric: 'distance', target: 1500 },
  { id: 'challenge-accepted', title: 'Complete a local challenge', metric: 'challenges', target: 1 },
  { id: 'jump-jam', title: 'Jump 20 times', metric: 'jumps', target: 20 },
] as const;

export interface AchievementDefinition { id: string; title: string; description: string; metric: string; target: number; coins: number; tokens: number; }
export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  { id: 'welcome', title: 'First departure', description: 'Finish your first run.', metric: 'runs', target: 1, coins: 30, tokens: 0 },
  { id: 'kilometre', title: 'City feet', description: 'Cover a lifetime kilometre.', metric: 'distance', target: 1000, coins: 50, tokens: 0 },
  { id: 'marathon', title: 'Long way home', description: 'Cover 10 lifetime kilometres.', metric: 'distance', target: 10000, coins: 150, tokens: 1 },
  { id: 'saver', title: 'Jingle all the way', description: 'Collect 250 coins in runs.', metric: 'coins', target: 250, coins: 70, tokens: 0 },
  { id: 'collector', title: 'Full pockets', description: 'Collect 2,000 coins in runs.', metric: 'coins', target: 2000, coins: 160, tokens: 1 },
  { id: 'airborne', title: 'Sky steps', description: 'Jump 50 times.', metric: 'jumps', target: 50, coins: 70, tokens: 0 },
  { id: 'slider', title: 'Under and over', description: 'Slide 30 times.', metric: 'slides', target: 30, coins: 70, tokens: 0 },
  { id: 'rooftops', title: 'Roof garden', description: 'Land on 10 train roofs.', metric: 'roofs', target: 10, coins: 100, tokens: 1 },
  { id: 'powered', title: 'Bright spark', description: 'Collect 20 power-ups.', metric: 'powerups', target: 20, coins: 90, tokens: 0 },
  { id: 'surfer', title: 'Rail surfer', description: 'Activate 10 hoverboards.', metric: 'boardsUsed', target: 10, coins: 90, tokens: 1 },
  { id: 'alphabet', title: 'Word on the tracks', description: 'Finish the SPRINT hunt.', metric: 'letterHunts', target: 1, coins: 100, tokens: 1 },
  { id: 'challenger', title: 'Set the pace', description: 'Complete 3 local challenges.', metric: 'challenges', target: 3, coins: 120, tokens: 1 },
  { id: 'friends', title: 'The whole crew', description: 'Unlock all 5 characters.', metric: 'characters', target: 5, coins: 200, tokens: 1 },
  { id: 'mission-star', title: 'Mission control', description: 'Complete 5 mission sets.', metric: 'missionSets', target: 5, coins: 120, tokens: 1 },
] as const;

export const CHALLENGES = [
  { id: 'sunline-dash', name: 'Sunline Dash', seed: 17329, description: 'Reach 750 metres on the Sunline route.', metric: 'distance', target: 750, reward: 65 },
  { id: 'market-money', name: 'Market Money', seed: 89271, description: 'Collect 75 coins on the market route.', metric: 'coins', target: 75, reward: 65 },
  { id: 'quay-high', name: 'Quay High', seed: 424242, description: 'Earn 10,000 score along Copper Quay.', metric: 'score', target: 10000, reward: 85 },
] as const;

export interface ShopItem { id: string; kind: 'character' | 'outfit' | 'board' | 'upgrade' | 'consumable'; target: string; name: string; description: string; cost: number; }
export const SHOP_ITEMS: readonly ShopItem[] = [
  ...CHARACTERS.filter(x => x.cost > 0).map(x => ({ id: `character:${x.id}`, kind: 'character' as const, target: x.id, name: x.name, description: x.description, cost: x.cost })),
  ...OUTFITS.filter(x => x.cost > 0).map(x => ({ id: `outfit:${x.id}`, kind: 'outfit' as const, target: x.id, name: x.name, description: x.description, cost: x.cost })),
  ...BOARDS.filter(x => x.cost > 0).map(x => ({ id: `board:${x.id}`, kind: 'board' as const, target: x.id, name: x.name, description: x.description, cost: x.cost })),
  ...UPGRADES.map(x => ({ id: `upgrade:${x.id}`, kind: 'upgrade' as const, target: x.id, name: `${x.name} duration`, description: 'Add 3 seconds per level. Maximum 3 levels.', cost: UPGRADE_PRICES[0] })),
  { id: 'consumable:board', kind: 'consumable', target: 'board', name: '3 board charges', description: 'Three activations for either equipped board.', cost: 30 },
  { id: 'consumable:headstart', kind: 'consumable', target: 'headstart', name: 'Head start', description: 'Launch safely with a short jetpack flight.', cost: 40 },
];
