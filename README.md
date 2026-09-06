# Switchyard Sprint

An original, local-only, three-lane railway runner built with strict TypeScript, Three.js, React and Vite. Run through Solara Bay's Sunline Station, Painted Quarter and Copper Quay, earn coins, complete missions, and unlock a five-person crew.

This is a playable development demo, with substantial gameplay and progression implemented. It is **not a claim of complete fulfillment of the production brief**. Higgsfield supplied two raster source references; the available connector did not expose a usable 3D submission endpoint or verified 3D pricing. The meshes are locally authored, with a free Blender import/export workflow. The requested generated-mesh production workflow and commercial-quality character production remain gaps. See [feature status](docs/FEATURE-CHECKLIST.md) and [asset provenance](docs/ASSET-INVENTORY.md).

## Run locally

Use Node.js 22.12+ or a newer compatible release and npm. Development was performed with Node 26.3.0 and npm 11.16.0. The dependency contract is `package-lock.json`; use `npm ci` to reproduce its versions.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://127.0.0.1:5173`. WebGL 2 is required. Keyboard and mouse are the supported input devices; this demo is designed for desktop displays from 1280 × 720 upward.

```sh
npm run typecheck
npm test
npm run build
npm run preview -- --port 4173
```

The production build is the complete `dist/` directory. Preview serves it at `http://127.0.0.1:4173`. The included standalone Node server serves the same build using only Node's built-in libraries:

```sh
npm run serve -- --port 4173
```

For a subdirectory, use `npm run serve -- --port 4174 --base sprint` and open `http://127.0.0.1:4174/sprint/`. This route passed an actual offline reload/play smoke check in [static-subpath.json](reports/static-subpath.json). Alternatively, with Python installed:

```sh
python -m http.server 4173 --directory dist --bind 127.0.0.1
```

Serve the directory over HTTP; opening `index.html` as a `file:` URL is unsupported. For static hosting, copy all of `dist/`, including `sw.js`, fonts, audio and models, to one directory on an HTTPS origin. The build uses relative asset URLs and does not require a backend, account, secret or external asset CDN. No publishing or hosting account setup is included.

## Play

| Action | Default keys |
| --- | --- |
| Move one lane left / right | A or Left / D or Right |
| Jump | W or Up |
| Slide; shorten an airborne jump | S or Down |
| Activate equipped hoverboard | Space |
| Pause | Escape or P |
| Start / confirm a focused menu action | Enter |
| Navigate menu controls | Tab / Shift+Tab |

One press changes one lane; operating-system repeats are ignored. Lane changes work in the air. Follow ramps onto train roofs, jump low hurdles, and slide under overhead barriers. A frontal collision defeats; a side bump gives recovery and brings the security drone closer. Another collision while it is close is fatal. Focus loss or a hidden page pauses the run. Resume deliberately starts a three-second countdown.

The training run teaches six actions and completes after those tasks and 170 metres. Endless mode accelerates from 12 to 26 m/s. Three named, repeatable seeded challenges have local objectives and personal records; they never depend on server time or a calendar.

Magnet, jetpack, super-jump shoes and score boost activate on pickup. Repeated pickups refresh duration; different effects coexist. Pause freezes timers. Jetpack and shield recovery clear a safe corridor. Tide gives a small jump advantage; Ember controls descent. Each board lasts 18 seconds or absorbs one crash. Full timing, collision and expiry rules are in [GAMEPLAY.md](docs/GAMEPLAY.md).

## Earn and save

All shop currency is earned in play. Pip, the Tide board, three board charges and one revive token are available initially. Characters cost 150–300 coins, alternate outfits 80–120, Ember 180, three board charges 30, and a head start 40. Power-up upgrades cost 60/120/200 and add three seconds per level. Revives cost one token, then two, then three for every later revive in that run. Tokens can be earned from rare pickups, distance milestones and rewards.

Three missions are active at once, drawn from 18 definitions. Completing a set grants coins, a box and a permanent multiplier increase up to ×10. Fourteen achievements, a repeatable **SPRINT** letter hunt, earned reward boxes, twenty local high scores and lifetime statistics provide further progression. Boxes only contain in-game rewards; there are no purchases with real money, ads or paid randomness. See [PROGRESSION.md](docs/PROGRESSION.md) for exact rules.

Saves belong to the **local browser profile and origin**, including its port. Another browser or port has a separate save. Settings offers JSON export, validated import and a confirmed reset. Export before clearing site data. Corrupted, unsupported or unavailable browser storage produces a visible recovery message; an in-memory session remains playable and exportable. Use one game tab per profile; concurrent tabs are not synchronized. There is no cloud backup or authentication.

Settings also provides remappable keys, independent music/effects volume, low/medium/high graphics, reduced motion and camera shake. Audio starts only after interaction. Settings → Developer preview allows character, outfit, board and power-up inspection, and isolated test runs. Preview does not award normal currency, consume normal supplies or record normal high scores.

## Offline play

Offline preparation runs in the **production build** on a compatible HTTPS or localhost origin. Wait for the visible **Offline ready** indicator before disconnecting or reloading offline. It confirms a complete cache of the build files, including bundled fonts, music and GLBs. Development mode does not prepare an offline cache. No compression decoders are needed by the current uncompressed meshes.

The browser may remove cached site data under storage pressure. If offline preparation is unavailable, keep the static server accessible and try a browser that permits service workers and Cache Storage. A fresh device needs its first successful load before offline use. Save data and the asset cache are separate; deleting site data can remove both.

## Verification

All 47 domain tests passed. They exercise each of 1,000 procedural seeds at all three test speeds (12/19/26 m/s), chunk boundaries, moving obstacles, elevated entry, roof traversal, swept collision, board handling, head starts, overlapping effects and recovery, 30/60/144 Hz consistency, bounded stalls/streaming and local persistence. Chromium 153 and Firefox 155 production suites each passed all thirteen steps, including offline reload/play, focus loss, fullscreen, graphics-context loss/reload recovery, save validation and network inspection with no uncaught runtime errors or external requests. Actual browser keyboard play and screenshots of all ten outfits and both boards were reviewed. These checks do not establish commercial artwork quality, a full accessibility audit or audio listening quality.

Install the test browsers once. The scripts default to the project-local `.tools/browsers` directory:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD/.tools/browsers"
npx playwright install chromium firefox
```

Keep the production preview running in a separate terminal, then run:

```powershell
$env:BASE_URL = 'http://127.0.0.1:4173'
$env:OFFLINE = '1'
$env:BROWSER = 'chromium'
npm run test:browser
$env:BROWSER = 'firefox'
npm run test:browser
node scripts/performance.mjs
node scripts/performance.mjs --high
```

On macOS/Linux, set the same variables using `export NAME=value`. `performance.mjs` defaults to 30 seconds of warm-up followed by 1,200 seconds of real wall-clock preview play and ten restarts. It refreshes jetpack through the UI to keep the run alive; it is a rendering/streaming soak, not twenty minutes of human obstacle play. `DURATION` and `WARMUP` can change its duration for diagnostics. Browser reports are written to `reports/browser-*-production.json`; screenshots are actual captures under `reports/screenshots/`. Reports contain `status`, individual steps, failures, browser/GPU details and unexpected network requests. Check the report's status and build context before treating a run as passed.

The completed [medium-quality physical-GPU run](reports/performance-medium.json) measured 1,200.03 seconds after warm-up at 1920 × 1080 on an i9-12900K / RTX 3080 Ti / approximately 32 GB RAM. Its p50/p95/p99 frame intervals were 4.2/4.3/4.3 ms, with ten restarts, no uncaught runtime errors and unchanged normal save data. This run predates the two added decorative GLBs and high-only bloom. The completed final [high-quality run](reports/performance.json) measured 1,200.222 seconds, p50/p95/p99 4.2/4.3/4.3 ms, ten restarts and zero uncaught errors, with stable warmed renderer resources. It includes all 35 GLBs and the final high-quality effects; the later loading-menu guard passed a separate regression test. See [PERFORMANCE.md](docs/PERFORMANCE.md) and the report timestamps for final results. The earlier [SwiftShader baseline](reports/performance-baseline.json) was software-rendered and missed the 60 FPS target; it must not be confused with the physical-GPU measurements. Safari and a representative mainstream hardware configuration remain untested.

The initial download targets are ≤25 MB first playable and ≤80 MB complete. The delivered directory totals 23,135,572 uncompressed bytes (about 23.14 MB / 22.06 MiB), including the service worker and 35 GLBs. `npm run build` prints the cached payload size; `node scripts/build-manifest.mjs` records every delivered file's bytes and SHA-256. Rebuilding with the installed locked dependencies produced identical hashes for all 56 files. This full-file total is more conservative than first-playable transfer size; browser reports separately record actual transferred bytes. Source PNGs and `.blend` working files are not delivered in `dist/`.

## Source and art workflow

| Directory | Responsibility |
| --- | --- |
| `src/game/` | Input, fixed timestep, simulation, collision and chunk generation |
| `src/game/city.ts` | Shared city/district configuration used by generation and rendering |
| `src/render/` | Three.js scene, models, animation, materials, pooling and effects |
| `src/audio/` | Interaction-gated local music and synthesized effects |
| `src/progression/` | Catalog, economy, missions, statistics and validated persistence |
| `src/ui/` | React menus, HUD, dialogs and settings |
| `src/GameController.ts` | Real-time ownership and low-frequency UI snapshots |
| `scripts/` | Build cache, asset export, Blender processing and browser verification |
| `assets/` | Source references, authored GLBs, Blender files and measured inventory |
| `public/` | Bundled runtime audio and models |

The simulation is outside React state. The controller updates it at 60 Hz with eight-tick bounded catch-up and interpolates rendering. UI snapshots publish at 10 Hz. World geometry and collectibles are pooled or instanced, with bounded streaming and shared materials. High graphics adds selectively applied bloom and multisample antialiasing; medium and low avoid that post-processing cost. Another city can use the shared city configuration with matching render assets, while the demo ships only finished Solara Bay content.

To reproduce locally authored GLBs after installing dependencies and free Blender:

```sh
node scripts/export-art.mjs --pilot
blender -b --python scripts/blender-cleanup.py -- assets/authored public/models --pilot
```

Review the Pip and station pilot in the running game before expanding the pack. For the collection, repeat both commands without `--pilot`. Blender must be on `PATH`, or invoke its executable by absolute path. Blender 4.5.13 was used. The scripts retain `.blend` sources and inventory JSON. `node scripts/audio.mjs` reproduces the original local music file. These scripts do not submit or bill Higgsfield jobs.

See [art specification](docs/PROJECT.md), [asset inventory](docs/ASSET-INVENTORY.md), [generation prompts](docs/GENERATION-PROMPTS.md) and the [fixed credit ledger](docs/CREDIT-LEDGER.json). Initial credits were 232.16, the fixed ceiling is 116, actual reconciled spending is four credits, and no paid 3D job was submitted.

## Credits and limitations

Switchyard Sprint, Solara Bay, its crew and UI identity are original to this project. “Sunline Shuffle” and the sound effects are synthesized locally from project code, without third-party music samples. Outfit and DM Sans fonts are bundled through Fontsource under the SIL Open Font License. React, Three.js and Vite are MIT-licensed dependencies; TypeScript is Apache-2.0. Dependency packages retain their respective licenses. Blender is a free GPL tool; it is not needed by players.

The available artwork uses assembled, vertex-colored cartoon meshes and articulated node animation. It is not a professionally retopologized, UV-textured, shared-skinned character production pack. The exact missing asset workflow, remaining browser/manual checks and measured performance limitations are kept visible in [FEATURE-CHECKLIST.md](docs/FEATURE-CHECKLIST.md). There are no accounts, multiplayer, global leaderboards, cloud saves, telemetry, analytics, payment SDKs or runtime AI services.
