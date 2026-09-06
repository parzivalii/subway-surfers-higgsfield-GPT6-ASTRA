# Feature checklist and release gates

**Implemented** means code and a usable route exist. **Domain-tested** means automated simulation/progression checks passed. **Browser-tested** means the named report explicitly passed the relevant interaction. These statuses do not imply unperformed visual, audio, accessibility or hardware validation.

The functional demo passed 47 domain tests and all thirteen production browser steps in both Chromium 153 and Firefox 155. Each of 1,000 generation seeds was exercised at 12, 19 and 26 m/s. The final high renderer completed 1,200.222 measured seconds and ten restarts on the physical RTX 3080 Ti. Loading/failure recovery received a separate regression check after the final menu guard. See [PERFORMANCE.md](PERFORMANCE.md) for exact build coverage and limits. The requested production-art workflow remains incomplete.

## Foundation and gameplay

| Requirement | Status | Evidence / limits |
| --- | --- | --- |
| Strict TypeScript, React, Three.js, Vite, lockfile, static production | Implemented; build checked | `npm run build` type-checks and creates the complete offline manifest |
| Simulation outside React; separate input, simulation, collision, renderer, audio and progression | Implemented | Controller owns real-time state; React snapshots publish at 10 Hz |
| Fixed 60 Hz timestep, bounded eight-tick catch-up, interpolation, safe long gaps | Domain-tested | 30/60/144 Hz equivalence and frame-stall checks |
| Auto-run, 12–26 m/s acceleration, one-press lanes, jump, slide, airborne changes and downward input | Domain- and Chromium/Firefox browser-tested | OS repeats ignored; keyboard events exercise tutorial flow |
| Ramps, roofs and elevated traversal | Domain-tested | Roof/ramp traversal at both speed limits and elevated entry |
| Stationary/moving trains, hurdles, overhead barriers and track obstacles | Implemented; collision domain-tested | Moving trains use bounded shunting; barrier silhouette corrected to its collision beam and visually reviewed |
| Coin paths, optional demanding routes and increasing combinations | Implemented | Reserved route and optional jump/slide/roof paths; extended human difficulty tuning remains limited |
| Reachable routes across chunk transitions, moving timing and elevation without mandatory powers | Domain-tested | 1,000 seeds, three chunk boundaries, 12/19/26 m/s and actual swept actor movement |
| Collision respects jump/slide/height and prevents tunneling | Domain-tested | Relative-motion swept AABB and ramp-side checks |
| Side stumble, drone recovery, fatal frontal impact, caught/revive/results/restart | Domain- and Chromium/Firefox browser-tested | Distinct impact rules and full normal flow |
| Tutorial, endless and local seeded challenges | Domain- and Chromium/Firefox browser-tested | Six tutorial goals, early-abort handling and three named challenge seeds |
| Score, distance, currency and multiplier HUD | Implemented; Chromium/Firefox browser-tested | Actual gameplay captures and settlement checks |
| Focus-loss/hidden-page pause and deliberate countdown resume | Implemented; domain-tested | Browser blur pause and deliberate countdown tested; manual pause/resume checked |
| Remappable controls, visible keyboard focus and appropriate key capture | Implemented; binding/domain and Chromium/Firefox UI-tested | No full accessibility audit claimed |

## Effects and local progression

| Requirement | Status | Evidence / limits |
| --- | --- | --- |
| Magnet, jetpack/high coins/safe landing, super-jump shoes, score boost | Domain- and Chromium/Firefox browser-tested | Pickup, refresh, pause, coexistence, expiry and safe landing rules |
| Optional earned head start | Implemented; consumption domain-tested | Eight-second protected launch; no optional consumable is required for survival |
| Power pickup shapes, sounds, particles, duration and expiry cues | Implemented | Audio and subjective effect quality need listening/manual review |
| Two boards, timed one-hit protection, distinct handling and destruction recovery | Domain- and Chromium/Firefox browser-tested | Tide jump advantage, Ember controlled descent; shared charge inventory |
| Five characters and five meaningful alternate outfits, obtainable/equippable | Domain- and Chromium/Firefox browser-tested | Ten locally authored GLB appearances; all ten menu previews captured and visually reviewed |
| One city with station, mural/market and waterfront scenery | Implemented | Nine local modular GLB variants; district rotation every 600 m; no empty city selector |
| Reusable city configuration | Partial | District catalog and renderer can be extended; no complete independent interchangeable city package schema claimed |
| Coins, rare tokens and revives with documented safe restart/cost | Domain- and Chromium/Firefox browser-tested | 1/2/3-token curve; clear restart corridor and countdown |
| Earned-currency shop, unlocks, outfits, boards and duration upgrades | Domain- and Chromium/Firefox browser-tested | All catalog purchases, caps, equipment and persistence |
| Three active missions, at least 15 definitions and permanent multiplier cap | Domain-tested; Chromium/Firefox menus tested | 18 definitions, repeatable sets, ×10 cap |
| At least ten achievements, high scores and lifetime statistics | Domain-tested; Chromium/Firefox menus tested | 14 achievements and bounded local top-20 table |
| Repeatable letter hunt | Domain-tested | SPRINT, duplicates, completion reward and reset |
| Earned boxes with only local rewards | Domain- and Chromium/Firefox browser-tested | Atomic removal/reward and replay rejection |
| Seeded challenges with objective and personal-best tracking | Domain- and Chromium/Firefox browser-tested | No calendar, server or account; independently checked settlement objective |
| Developer preview isolated from normal currency, supplies and scores | Domain- and Chromium/Firefox browser-tested | Every effect inspectable; preview save isolation checked |
| Versioned saves, validation, migration, corruption/storage-denial recovery | Domain- and Chromium/Firefox browser-tested | Schema 2, compatible v1 migration and recoverable in-memory session |
| Exactly-once rewards/purchases and reload persistence | Domain- and Chromium/Firefox browser-tested | Run receipts, box IDs and owned/capped purchase guards |
| Export/import and confirmed reset | Domain- and Chromium/Firefox browser-tested | Invalid imports preserve current save; reset cancellation and confirmation |

## Presentation and asset production

| Requirement | Status | Evidence / limits |
| --- | --- | --- |
| Original palette, identities, scale, source inventory and prompts | Documented | PROJECT, ASSET-INVENTORY, GENERATION-PROMPTS and measured mesh JSON |
| Verified starting balance, fixed 50% ceiling and centralized accounting | Verified for submitted jobs | B=232.16; ceiling 116; spent 4; reserved 0; reconciled balance 228.16 |
| Higgsfield source assets | Partially complete | Two completed 2K raster references; no provider-generated mesh |
| Higgsfield mesh → Blender → GLB pilot before collection | **Externally blocked** | No verified-cost callable 3D submission; local geometry → Blender → browser pilot instead validated and clearly identified |
| Real GLBs, editable Blender sources, normalized scale and measured statistics | Implemented | 35 locally authored assets exported through Blender and integrated; receipts in `assets/blender-report.json` |
| Shared skinned skeleton, UV/retopology and production character deformation | **Not fulfilled** | Current characters use articulated node hierarchies and vertex colors; no shared skinned rig/UV-textured pack |
| Ten required animation states and blending | Implemented | Authored node-animation clips; in-place run, simulation-owned translation |
| Premium commercial-quality final art and convincing foot contact | **Not established** | Original local cartoon assembly is usable demo art; professional asset/animation quality requirement remains open |
| Stable chase camera, restrained shake/bank, reduced motion | Implemented | Title/pilot visual review; extended human game-feel evaluation remains necessary |
| Soft shadows, atmospheric depth and selective bloom | Implemented and reviewed | High-only selective bloom with MSAA; high quality included in sustained run |
| Pickup/power/board/impact particles | Implemented | Bounded pools; subjective polish not certified |
| Original local music/effects, separate volume, interaction-gated start | Implemented | Local PCM and WebAudio synthesis; listening verification remains separate |
| Complete title/loading/selection/HUD/mission/shop/record/pause/result/settings/control/credits UI | Implemented; Chromium/Firefox browser-tested | Genuine asset counts; loading/error/empty/locked states and menu flows |
| Every visible control, focus/contrast and responsive desktop layout | Partly verified | Chromium/Firefox interaction sweeps and 1280/1920/2560 captures; actual keyboard play reviewed; full accessibility audit remains open |

## Delivery verification

| Requirement | Current evidence | Limits |
| --- | --- | --- |
| Offline indicator, complete cache, reload and play | Chromium and Firefox passed actual offline reload/play | Requires successful initial caching; browser eviction is possible |
| No external runtime dependencies | Both browser request inspections passed with zero external requests | No accounts, telemetry, payment SDK or runtime generation |
| Low/medium/high, pooling, instancing, culling and disposal | Implemented; stable high renderer counters through ten restarts | Full process/VRAM profiling unavailable |
| Download targets | Complete directory approximately 23.14 MB; exact hashes/sizes in build-manifest.json | Includes all runtime files; source working files excluded |
| Smooth 60 FPS at 1080p | High physical-GPU p50/p95/p99 4.2/4.3/4.3 ms | Mainstream desktop/laptop target remains unverified |
| Twenty minutes plus restarts | 1,200.222 measured seconds after warm-up, ten restarts, zero errors | Automated real-time preview flight; not twenty minutes of human obstacle play |
| Bounded objects and memory behavior | High: 49 geometries, 17 textures after warm-up; pooled objects stabilized at 47 | Sampled late JS heap 49–76 MB; no total process/VRAM measurement or indefinite-session claim |
| Frame/load/memory environment | PERFORMANCE.md and raw medium/high/software reports | Keep separate build/hardware contexts |
| Chromium desktop | All thirteen production suite steps passed | Full suite predates only the separately tested asset-loading menu guard |
| Firefox desktop | All thirteen production suite steps passed | Same build coverage; masked GPU string does not identify physical hardware |
| Safari desktop | Suitable environment unavailable | Untested |
| Actual screenshots and manual play | Title, gameplay, all crew/outfit and board previews, results reviewed; keyboard training and pause/resume played in browser | Extended human difficulty tuning, listening and accessibility audit remain limited |
| Runtime/critical gameplay errors | Zero uncaught errors in both browser suites and completed high soak; 47 domain tests passed | Test coverage is not universal proof; no known unresolved critical gameplay defect |
| Source, lockfile, static build and serving | Source plus reproducible build/hash manifest, local server and release archive | Nothing publicly hosted |

The earlier pre-GLB SwiftShader baseline missed 60 FPS and measured only 1,198.394 seconds. It is preserved as diagnostic evidence, not substituted for the completed physical-GPU soak.

Missing provider-generated 3D assets, the incomplete shared-skinned production animation workflow and unverified representative-hardware performance prevent an honest “all completion criteria satisfied” claim. The locally authored cartoon GLBs are usable demo assets; premium commercial artwork and convincing production foot contact remain open.
