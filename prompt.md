Build a complete, playable desktop browser game using TypeScript, Three.js, and React.

You are responsible for implementation, game design, original art direction, asset integration, and verification. Work through the milestones below until the specified demo is complete. Make sensible decisions for routine details and document significant assumptions.

PROJECT VISION

Create an original 3D endless runner inspired by the gameplay depth, responsiveness, and accessible appeal of classic Subway Surfers.

Working title: Switchyard Sprint.

The player races through a colorful fictional railway city, switching between three lanes, jumping over obstacles, sliding under barriers, running across train roofs, collecting coins, and activating power-ups and hoverboards.

Aim for premium commercial presentation at a compact demo scale. Quality means responsive movement, coherent artwork, polished character animation, readable obstacles, satisfying sound, complete progression, and stable performance.

Use original names, characters, music, UI artwork, logos, and environments. Design a distinct identity while preserving familiar endless-runner mechanics.

The feature list in this prompt defines completion. Implement every listed system with functional behavior.

PLATFORM AND TECHNICAL FOUNDATION

Required:
- TypeScript with strict type checking.
- Three.js for real-time 3D rendering.
- React for the application shell, menus, HUD, and settings.
- Vite for development and production builds.
- Desktop keyboard and mouse interaction.
- A static production build that can be served locally or on a static website.

Use current compatible stable dependencies and commit a lockfile.

Keep the real-time simulation outside React component state. React must not rerender the application every animation frame.

Separate input, simulation, collision detection, world generation, rendering, audio, progression, persistence, and UI. Prefer a straightforward architecture with clear ownership over unnecessary frameworks.

Use a fixed simulation timestep with bounded catch-up and render interpolation. Handle long frame gaps safely.

NO ONLINE PLAYER SYSTEMS

All player-facing game systems must work locally:
- No accounts or authentication.
- No multiplayer.
- No global leaderboards.
- No cloud saves or remote databases.
- No ads, real-money purchases, subscriptions, or payment SDKs.
- No analytics or telemetry.
- No runtime AI generation or external asset dependencies.

Use locally earned currency for the in-game shop.

Development may access documentation, download dependencies, and generate assets through Higgsfield. The delivered game must use bundled assets.

After a complete initial load and successful asset caching, support offline reload and play on a compatible HTTPS or localhost origin. Show when offline preparation is complete. Include all required assets, fonts, audio, and decoding files in the offline cache.

Also provide instructions for running the production build through a local static server.

DEMO CONTENT

Deliver:
- Five distinct playable characters.
- One default appearance per character.
- Five alternate outfits total: one additional outfit per character.
- Two visually distinct hoverboards.
- One complete fictional city with three visually distinct districts.
- A brief interactive tutorial.
- An endless main mode.
- A local challenge mode.
- Local progression, unlocks, statistics, and high scores.

The city should contain:
1. A sunny station district with platforms, awnings, and colorful trains.
2. A mural district with brick buildings, rooftop details, and market scenery.
3. An industrial waterfront with gantries, warehouses, and distant harbor silhouettes.

Connect districts through coherent track segments. Use modular variety so long runs do not feel like the same short strip repeating.

Keep decorative detail outside the readable gameplay corridor.

Build the environment configuration so another city can be added later. This demo requires one finished city; do not add an empty city selector.

CORE GAMEPLAY

Implement:
- Automatic forward running with gradual acceleration and a defined maximum speed.
- Smooth, responsive movement between three lanes.
- Jumping, sliding, airborne lane changes, and a downward input that shortens a jump.
- Reliable traversal of ramps and train roofs.
- Stationary trains, moving trains, low hurdles, overhead barriers, and track obstacles.
- Coin paths that teach movement and reward more demanding routes.
- Increasing difficulty through obstacle combinations and timing.
- Distance, score, score multiplier, and collected currency.
- A clear collision, recovery, defeat, results, and restart flow.

Use a consistent ruleset for minor side bumps and fatal frontal collisions. Include an original pursuing security drone that reacts to stumbles and catches the player on defeat.

Collision shapes must match the visible gameplay silhouettes and account for jumping, sliding, elevated surfaces, and moving obstacles.

Prevent tunneling through obstacles at maximum speed or during slower frames.

Procedural generation must preserve at least one reachable route with a reasonable reaction window. A route is only valid when the player can actually execute its required actions in time.

Validate transitions between generated chunks as well as individual chunks. Include moving obstacle timing and current player elevation. Never require an optional power-up to survive.

CONTROLS

Default controls:
- A / Left Arrow: move one lane left.
- D / Right Arrow: move one lane right.
- W / Up Arrow: jump.
- S / Down Arrow: slide or shorten an airborne jump.
- Space: activate a hoverboard.
- Escape / P: pause.
- Enter: start or confirm when appropriate.

One key press should produce one lane change; handle operating-system key repeat deliberately.

Support configurable bindings, visible keyboard focus in menus, and a readable controls screen.

Capture gameplay keys only when appropriate. Prevent page scrolling during active play without interfering with menu input.

Pause on browser focus loss or when the page becomes hidden. Require a deliberate resume with a short countdown.

POWER-UPS AND HOVERBOARDS

Implement:
- Coin magnet.
- Jetpack flight with airborne coin paths and a safe landing.
- Super-jump shoes.
- Temporary score multiplier.
- An optional earned head-start consumable.

Every power-up needs a recognizable pickup, sound, visual effect, duration indicator, and clear expiry behavior.

Define and test stacking, repeat pickup, pause, collision, and expiry rules. Landing or power-up expiry must not create an unavoidable collision.

Both hoverboards provide temporary crash protection. Give them distinct handling benefits, such as a small jump advantage or controlled descent.

Display activation, remaining duration, shield consumption, and availability clearly. Board destruction should provide a short safe recovery window.

Characters share the same core gameplay capability. Character selection is primarily cosmetic.

LOCAL PROGRESSION

Implement:
- Coins earned during play.
- Rare locally earned revive tokens.
- Revives with a documented cost curve and a safe restart position.
- Character, outfit, and board unlocks.
- Power-up duration upgrades.
- A shop that spends earned currency only.
- Three active missions at a time.
- Mission-set completion that increases the permanent score multiplier up to a cap.
- At least 15 mission definitions.
- At least 10 achievements.
- A local high-score table and lifetime statistics.
- A repeatable collectible letter hunt.
- Earned reward boxes containing only in-game rewards.
- Local seeded challenges with objective and best-score tracking.

Challenge mode must be available without server time, accounts, or scheduled online events.

Balance the demo so a short session demonstrates meaningful progress. All content must be obtainable through play.

Provide a clearly separated developer preview mode for quickly inspecting every character, outfit, board, and power-up. Preview mode must not modify normal saves or high scores.

Persist currency, unlocks, equipped items, upgrades, missions, achievements, statistics, and settings using versioned browser storage.

Validate loaded data. Handle unavailable storage, corrupted saves, and schema upgrades gracefully. Ensure rewards and purchases are applied exactly once.

Include save export/import and a confirmed reset option. Explain in the README that saves belong to the local browser profile.

VISUAL DIRECTION AND GAME FEEL

Create an expressive, cohesive cartoon world with:
- Strong silhouettes and appealing proportions.
- Warm sunlit architecture, teal trains, and orange or coral accents.
- Controlled material detail and consistent texture density.
- Soft shadows, restrained atmospheric depth, and selective bloom.
- Clear separation between hazards, collectibles, and decoration.
- A readable chase camera that shows upcoming decisions early.
- Restrained camera banking and impact feedback.
- Smooth animation blending and convincing foot contact.
- Polished particles for pickups, power-ups, board trails, and collisions.

Use a stable gameplay camera. Cinematic framing must preserve obstacle visibility.

Provide reduced-motion and camera-shake settings.

Include original or appropriately licensed local music and sound effects for movement, pickups, impacts, UI, power-ups, and results. Support separate music and effects volume. Start audio following a user interaction.

Temporary blockout geometry is acceptable during development. Final characters, trains, and prominent scenery must have finished artwork. Do not present a blockout as the completed visual result.

HIGGSFIELD ASSET PRODUCTION AND CREDIT LIMIT

Use Higgsfield AI to create character and environment source assets.

Use free Blender functionality for cleanup, retopology where needed, UV work, rigging adjustments, animation, modular assembly, optimization, and export.

Use only free additional tools and dependencies. Do not purchase software, paid add-ons, assets, subscriptions, or more credits.

Before the first paid Higgsfield operation:
1. Verify the available credit balance through an accessible account interface.
2. Record that initial balance as B.
3. Set the fixed project spending ceiling to 0.5 × B.
4. Round down if the service requires whole credits.
5. Record the balance, timestamp, ceiling, and intended asset allocation.

This ceiling is a maximum, not a spending target. It must not increase because the balance later changes.

Before each paid job:
- Verify its quoted cost or an enforceable maximum charge.
- Count committed spending and reserved costs for pending jobs.
- Submit only if the new total remains within the ceiling.
- Count previews, variations, texture generation, rigging, animations, retries, and other billed steps.
- Count failed-job charges unless a refund is confirmed.
- Reconcile actual charges before further spending.

Keep one shared budget ledger and a single owner for paid submissions, including when using parallel agents.

Prioritize the base character workflow and modular environment kit. Reuse compatible rigs, animations, materials, and geometry. Derive alternate outfits efficiently through supported edits and Blender work.

Never spend credits merely to use the allowance.

If account access, the balance, or job pricing cannot be verified, pause paid generation and request only the missing information. Continue independent coding, asset planning, and free Blender work.

If Higgsfield tools are unavailable, provide the exact generation prompts and expected output specifications. Do not invent tool access, generation results, downloaded files, or costs. Clearly identify any assets still awaiting Higgsfield production.

ASSET WORKFLOW

First establish a compact art specification covering palette, proportions, materials, scale, and character identity.

Validate one complete character and one environment module through generation, Blender cleanup, export, and in-game rendering before generating the remaining collection.

For each asset, record:
- Asset ID and intended use.
- Generation prompt and reference inputs.
- Provider, model, and settings actually used.
- Source files and final exported file.
- Geometry and texture statistics.
- Rig and animation information where applicable.
- Credit cost and completion status.

Export real 3D assets in glTF/GLB with textures and materials compatible with the chosen Three.js renderer.

Normalize scale, forward direction, origins, and transforms. Use simple collision proxies separate from render geometry.

Characters should share a compatible skeleton where practical. Include idle, running, jumping, falling, landing, sliding, stumble, defeat, celebration, and board-riding animation states.

Avoid baked forward translation in looping run animations when the simulation owns movement.

Optimize textures, geometry, materials, and draw calls based on measured performance. Bundle any required compression decoders locally.

HIGGSFIELD CREATIVE BRIEFS

Adapt these briefs to the generation tools and parameters actually available.

Shared character style:
“Original stylized 3D character for a premium cartoon railway runner.
Expressive face, strong silhouette, appealing athletic proportions,
clean material separation, simplified production-friendly clothing,
readable from a rear chase camera. Full body, neutral A-pose,
unobstructed hands and feet, neutral lighting and plain background.
Consistent proportions across references. No logos or written text.”

Create five distinct characters:
1. An energetic courier with a cropped teal jacket and compact backpack.
2. A roller artist with orange overalls and rounded protective accessories.
3. An inventive mechanic with a plum vest and practical gloves.
4. A street dancer with a cobalt tracksuit and distinctive hair silhouette.
5. An adventurous photographer with a cream windbreaker and green accents.

Create one alternate outfit for each while preserving facial identity,
body proportions, and rig compatibility. Give each alternate meaningful
clothing changes beyond a simple color swap.

Shared environment style:
“Modular stylized railway city asset for a premium cartoon 3D runner.
Warm coastal urban architecture, painted metal, clean readable forms,
soft bevels, controlled texture detail, consistent human scale.
Functional modular connections and clean geometry suitable for a
real-time game. Separate playable surfaces from decorative objects.
No baked camera perspective, foreground characters, or written logos.”

Produce a reusable kit covering:
- Track and ground modules.
- Platforms and ramps.
- Train body, roof, and front modules.
- Low and overhead barriers.
- Tunnel entrances.
- Station, mural district, and waterfront building pieces.
- Small decorative props and distant skyline elements.

Hoverboard brief:
“Original stylized hoverboard for a premium cartoon runner.
Readable from behind and above, clean silhouette, clear foot placement,
compact underside propulsion, restrained emissive accents, no logos.
Consistent scale and material language with the character collection.”

Make one rounded teal board and one angular coral board.

Treat these as asset specifications. Verify that requested 3D outputs
are actual meshes suitable for further processing.

UI AND PRESENTATION

Deliver:
- A polished title screen using the game’s world and identity.
- A visible loading state with genuine progress where available.
- Character, outfit, and board selection with accurate previews.
- A compact gameplay HUD.
- Missions, upgrades, achievements, and local records screens.
- Pause, settings, controls, results, and credits screens.
- Clear currency costs, reward feedback, and equipped states.

Every visible button must work. Provide intentional empty, locked,
loading, and error states.

Scale the desktop layout from 1280×720 through ultrawide displays.
Keep the playfield readable and avoid stretching UI elements.

Support keyboard navigation, sufficient text contrast, readable type,
and cues that do not rely only on color.

PERFORMANCE TARGETS

Target smooth 60 FPS at 1920×1080 on a documented mainstream desktop
or laptop configuration.

At the beginning of performance work, record the actual test machine,
GPU, browser, resolution, and quality setting. If representative
hardware is unavailable, identify that verification gap.

Provide low, medium, and high graphics settings with sensible defaults.

Use:
- Object pooling and bounded world streaming.
- Instancing for repeated props and collectibles.
- Frustum culling and appropriate levels of detail.
- Shared materials and texture atlases where useful.
- Controlled shadows, particles, and post-processing.
- Correct resource disposal.

Generate and prepare chunks ahead of the player to prevent visible
spawning and gameplay stalls.

Set and measure download and memory budgets. As initial targets,
keep the first playable download near or below 25 MB and the complete
demo near or below 80 MB. Document justified deviations.

Profile sustained play after warm-up. Report frame-time percentiles,
loading performance, and memory behavior. Do not claim performance
from screenshots or estimates.

Handle resizing, fullscreen changes, asset-load failure, and graphics
context loss with a useful recovery path.

IMPLEMENTATION MILESTONES

1. Inspect the workspace and available tools. Record the scope, art
   direction, asset requirements, fixed budget policy, and test plan.

2. Build and verify the complete running loop using temporary geometry:
   input, movement, camera, obstacles, generation, pickups, defeat,
   results, pause, and restart.

3. Validate the Higgsfield-to-Blender-to-Three.js asset workflow, then
   produce and integrate the roster, outfits, boards, and city.

4. Complete power-ups, progression, local saves, shop, missions,
   challenges, achievements, and every menu.

5. Refine animation, camera behavior, sound, particles, lighting,
   tutorial, accessibility, and loading.

6. Test the production build, offline behavior, long-run stability,
   performance, and all completion criteria. Fix discovered defects.

Use parallel agents for independent implementation or review tasks
when supported. Assign clear file ownership and centralize paid
generation decisions.

Make routine reversible decisions without repeatedly asking for
approval. Ask focused questions only for missing access, unverifiable
spending, or a material scope conflict.

Maintain concise progress notes and a feature checklist. Do not stop
after creating a plan or completing only the first playable milestone.

VERIFICATION AND COMPLETION

Before declaring completion, verify:

- A fresh player can finish the tutorial and complete the full
  start → run → defeat/revive → results → restart flow.
- All five characters, five alternate outfits, and both boards
  render correctly and are obtainable and usable.
- Every power-up works through pickup, activation, pause, expiry,
  collision, and overlapping effects.
- Procedural generation remains solvable across the speed range.
  Run automated checks across at least 1,000 seeds, including chunk
  boundaries, moving obstacles, and elevated routes.
- Simulation behavior remains consistent across different rendering
  frame rates and bounded frame stalls.
- Coins, rewards, purchases, unlocks, and equipped items persist
  correctly after reload.
- Corrupted or unavailable storage produces a recoverable state.
- Save export/import and reset behave correctly.
- Offline reload and play succeed after confirmed caching.
- Runtime network inspection shows no external service dependencies.
- Every visible control performs its intended action.
- The production build passes type checking and relevant automated tests.
- Manual browser playtesting covers the intended keyboard interactions,
  presentation, difficulty, and game feel.
- At least 20 minutes of continuous play and repeated restarts show no
  accumulating objects, unbounded memory growth, or progressive slowdown.
- There are no unresolved critical gameplay bugs, missing required
  assets, or unhandled runtime errors.

Test Chromium and Firefox desktop browsers. Test Safari when a suitable
environment is available; report any untested browser accurately.

Use screenshots captured from the actual running game to review the
title screen, gameplay, selection screens, and results. Inspect the
rendered output and fix presentation issues.

Automated tests support manual playtesting; both are required.

FINAL HANDOFF

Provide:
- Complete source code and a reproducible production build.
- A local playable preview when the environment supports it.
- Exact development, build, test, and local-serving instructions.
- Controls and gameplay documentation.
- The asset inventory, generation prompts, and credit ledger.
- A feature checklist showing implemented and verified behavior.
- Measured performance results with the test environment.
- Screenshots of the actual game.
- Any remaining limitations or externally blocked work.

Prepare the game for static hosting. Do not create hosting accounts,
purchase services, or publish publicly without a separate instruction.

Report completion honestly. Distinguish working functionality from
planned functionality, and measured results from targets.

Begin implementation and continue through the milestones.