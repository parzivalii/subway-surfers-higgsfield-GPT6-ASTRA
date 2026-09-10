# Run difficulty

The **Difficulty · Select difficulty** button sits directly below **Let's Run**. Starting a new endless run, local challenge or developer preview opens the same four-choice dialog. Select a level, then choose **Start run**. Nothing starts and no consumable is spent until confirmation. Escape/Back cancels; keyboard focus stays in the dialog.

Revives, pause/resume and **Run again** keep the run's difficulty without another prompt. Challenge retries also preserve the challenge seed and objective. Returning to the station and starting a new run asks again. Training stays at Easy; starting an endless run after training opens the selector. This is a per-run choice, not a permanent account setting.

| Level | Starting → maximum speed | Acceleration | Certified route requiring jump/slide | Power-up cadence |
| --- | --- | --- | --- | --- |
| Easy | 12 → 26 m/s | 0.075 m/s² | None; original clear lane | Every 3 obstacle groups |
| Normal | 16 → 29 m/s | 0.18 m/s² | 25% of groups | Every 5 groups |
| Hard | 20 → 32 m/s | 0.4 m/s² | 65% of groups | Every 8 groups |
| Impossible | 26 → 36 m/s | 0.8 m/s² | Every group | Every 12 groups |

Easy preserves the original seeded layouts and balance. Hard and Impossible alternate their certified route between a side lane and the centre, requiring frequent lane changes. Impossible reaches its speed cap in 12.5 seconds and combines every route change with a jump or slide. Obstacle groups remain 44 metres apart within chunks (68 metres across chunk boundaries), approximately 1.22 seconds between groups at Impossible's cap. Optional ramps are less common at higher levels. All four power-ups still occur. Board shielding, safe revives and safe power-up landing rules remain intact; no optional power-up is required for survival.

HUD, results and high-score rows identify difficulty. Existing saved records receive the Easy label on validation. The existing economy and score formula are unchanged; challenge best scores cover all difficulties and are labeled accordingly. Saves remain compatible with version 2 and preserve player progress.

## Verification for this change

- 68 domain tests passed, including 1,000 seeds for each of Normal, Hard and Impossible at starting, midpoint and maximum speeds. They execute actual jump/slide motion through four chunks, moving trains and elevated entries. The original 1,000-seed Easy suite also passes.
- Additional checks use the real accelerating simulation without pickups, verify maximum-speed collision, power expiry, head-start caps, frame-rate consistency and score difficulty persistence/legacy fallback.
- Focused Chromium and Firefox suites cover all four choices, required selection, keyboard cancellation/focus wrapping, actual starting speeds, keyboard movement, restart retention, challenge identity, saved records, and actual offline reload/play. Screenshots are in `reports/screenshots/difficulty-chromium/` and `difficulty-firefox/`.
- Actual in-app browser interaction checked the selector, Impossible preview movement/pause/countdown/collision/results, and returned to the title. The user's normal save was not modified by this preview.
- The full production suites and asset-load failure regression were rerun. Read their report status for the delivered checkpoint.

The earlier twenty-minute physical-GPU performance measurements predate difficulty support. They remain baseline evidence; this update does not claim a new twenty-minute human playtest or a new hardware benchmark. Subjective difficulty may warrant further tuning after player feedback.
