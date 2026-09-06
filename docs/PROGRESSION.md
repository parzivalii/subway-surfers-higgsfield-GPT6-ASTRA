# Local progression and save contract

All progression is computed locally. There is no account, server clock, remote leaderboard, real currency, or paid reward. Saves belong to the current browser profile and origin. Changing browser, clearing site data, or opening the game under another port produces a separate save. Export a backup before clearing browser data; import validates the file before replacing the current save.

## Implementation ownership

`src/progression/catalog.ts` defines the roster, outfits, boards, upgrades, missions, achievements, seeded challenges, and shop. `src/progression/store.ts` owns all saved mutations. React observes the store with `useSyncExternalStore`; the simulation remains independent. The controller banks a completed run through `finishRun(summary)` and consumes board charges, head starts, or revive tokens when an activation succeeds. Preview run summaries are rejected by the normal store. The shell must also keep preview consumable and equipment operations separate from the normal store.

## Economy

New players receive Pip, Pip's Express outfit, the Tide board, 3 board charges, and 1 revive token. They start with 0 coins. All characters have identical simulation capabilities. Equipment differences are cosmetic except for the two explicitly described board benefits.

| Unlock | Cost in earned coins |
| --- | ---: |
| Rumi / Tavi / Jett / Nori | 150 / 200 / 250 / 300 |
| Pip / Rumi / Tavi / Jett / Nori alternate outfit | 80 / 90 / 100 / 110 / 120 |
| Ember board | 180 |
| Three shared board charges | 30 |
| One head start | 40 |
| Power-up duration levels 1 / 2 / 3 | 60 / 120 / 200 |

Each character unlock includes their default outfit. An alternate outfit requires its character. The five alternates change the clothing silhouette: Pip's rain cape and shorts; Rumi's smock and pads; Tavi's utility coverall and belt; Jett's cropped hoodie and wide joggers; Nori's safari vest and camera satchel. Both boards spend the same charge inventory. Tide adds a small jump advantage; Ember controls descent. Simulation owns their duration, collision absorption, and recovery.

Power-up upgrades add 3 seconds per level, capped at 3 levels. Base durations are magnet 10 seconds, jetpack 8 seconds, shoes 10 seconds, score boost 12 seconds. A maximum upgrade therefore adds 9 seconds. A head start is a consumable safe launch, not an unlock prerequisite.

Revives cost `min(3, reviveCount + 1)` tokens: 1 token for the first revive in a run, 2 for the second, and 3 for every later revive. Tokens also come from rare track pickups, one token per 2,000 lifetime metres, completed letter hunts, selected achievements, and reward boxes. Currency picked up in a run is banked on results. Existing banked tokens fund revives; board charges and head starts are debited on use. A restart resets the per-run revive cost curve.

## Missions, achievements, and rewards

Exactly three missions are active. The 18 definitions cover distance, coins, jumps, slides, lane changes, roof landings, close passes, power-ups, boards, district visits, letters, total score, completed runs, and local challenges. Progress is accumulated when a run is banked. The next group starts after all three complete; the completing run is never counted again toward the next group. Definitions repeat after six sets, so the system never exhausts its content.

A completed set grants 75 coins and one box and raises the permanent score multiplier by one, from ×1 to a cap of ×10. Mission rewards continue after the cap. A short first run of 150 metres, 20 coins, and 3 jumps completes the opening set. The first-run achievement grants another 30 coins, so a 20-coin opening run can bank 125 coins including these rewards.

Fourteen achievements award coins and sometimes a token. They are checked after run settlement and purchases and recorded before the save commits, so a repeated settlement does not award them again. The catalog exposes the exact requirements and rewards for the UI.

The repeatable letter hunt spells **SPRINT**. Duplicate letters do not advance an incomplete word. Completing the word grants 50 coins, 1 token, and one earned box, clears the letters, and immediately allows another word. Letters carry across runs. The first completed word separately earns the alphabet achievement.

One additional box is earned every three completed non-tutorial runs. Boxes are earned only; there is no box purchase, paid opening, or paid reroll. A box contains one of: 45–90 coins, 3 board charges, 1 token, or 1 head start. A deterministic integer hash of its saved serial chooses the reward. Opening removes the box and credits its reward in one transaction. Its ID cannot be opened a second time. These are in-game rewards with no cash value.

## Local challenges and records

Challenges are always available and do not use calendar dates:

| Challenge | Seed | Objective | Completion reward |
| --- | ---: | --- | ---: |
| Sunline Dash | 17329 | Reach 750 metres | 65 coins |
| Market Money | 89271 | Collect 75 coins | 65 coins |
| Quay High | 424242 | Earn 10,000 score | 85 coins |

Each completed challenge run grants its reward once. Challenges store best score, best objective progress, and completion count. A repeatable route supports practice, and later successful attempts still earn rewards. Challenges use the player's earned upgrades and multiplier; records are personal, not competitive. Objective completion is independently evaluated during settlement instead of trusting the presentation flag.

The 20 highest scores are stored locally, including distance, run coins, character, mode, and local completion date. Lifetime statistics separately accumulate completed runs, distance, score, run coins, jumps, slides, lane changes, close passes, roofs, boards, power-ups, revives, duration, stumbles, challenges, and personal bests. Tutorial and preview runs do not enter these records. The tutorial-complete flag is set only when the simulation explicitly certifies all six steps and its final distance; ending a tutorial early leaves it incomplete.

## Persistence and validation

Storage key: `switchyard-sprint-save`. Current schema: **2**. A version-1 save migrates by preserving compatible known fields and providing defaults for missing data. Future/unsupported versions are rejected so they are not silently reinterpreted. Import accepts JSON up to 8 MB in the domain layer; the UI can choose a lower file-input limit.

Validation reconstructs known fields, bounds numeric values, strips unknown properties, rejects unknown catalog IDs, repairs locked or mismatched equipment, restores default controls when necessary, derives mission identity from the set, caps upgrades and multiplier, deduplicates receipts and box IDs, and bounds the high-score list. Invalid imports leave the active save unchanged. Malformed stored JSON starts a fresh recoverable session with a visible message. Storage denial or quota failure keeps the game playable in memory and tells the player to export a save.

Every state mutation creates a new snapshot and writes one complete JSON payload. Run IDs are retained as settlement receipts; the same run cannot award coins, missions, achievements, boxes, or records twice, even after reload. A completed box is absent from the queue before its reward is committed. Owned unlocks and capped upgrades reject repeated purchases without spending. Consumable purchases are deliberate separate transactions. This is local integrity against accidental replay, not an anti-cheat or cloud reconciliation system. Browser profiles and tabs are not synchronized live; use one game tab per profile.

Export emits the validated schema. Import replaces the local profile only after successful validation. Reset requires an explicit `true` confirmation flag and returns to the documented new-player state. The UI supplies a confirmation dialog. Clearing or replacing saves is user-controlled; no remote backup exists.

Settings persist independently of frame-by-frame simulation: low/medium/high quality, music and effects levels, reduced motion, camera shake, and keyboard-code bindings. Each action needs at least one key and accepts up to three; duplicate keys are rejected. Tab and Enter remain reserved for menus, and F5/F11/F12 remain reserved for the browser. Defaults are A/Left, D/Right, W/Up, S/Down, Space, and Escape/P. The input adapter maps the progression action `down` to the simulation action `slide`.

## Verified domain checks

`npx vitest run tests/progression.test.ts` exercises catalog completeness, first-run rewards, run settlement idempotency across reload, preview/tutorial exclusion, all unlocks and equipment, atomic purchase rejection, upgrade prices/caps/durations, revive and consumable costs, accumulating/cycling missions, multiplier cap, repeat letters, exactly-once varied box rewards, seed challenge objectives, bounded records, complete save round trips, malformed JSON, future versions, unavailable/quota-full storage, migration, unknown and prototype-like properties, failed import preservation, confirmed reset, and binding conflicts. Browser UI integration and simulation power-up safety are separate verification work.
