# Switchyard Sprint production record

Original desktop three-lane runner, one city named Solara Bay, three districts: Sunline Station, Painted Quarter, Copper Quay. All local systems, static deployment; no player service calls. Root agent owns paid generation. Independent agents own simulation, progression, and rendering. React shell runs on a low-frequency snapshot; fixed simulation owns all real-time state.

## Art specification
Palette: deep ink #123c43, cream #fff1cd, warm sand #eac69a, rail teal #169c9e, coral #f47754, sun yellow #ffce59, plum #765078, cobalt #477bc6. Stylized bevelled forms, matte painted metal, no photoreal grunge. 1 unit = 1 metre; character 1.7–1.9m, lanes spaced 3m. Render corridor x=-4.5…4.5; decoration outside. Y up, player forward along +Z in simulation (render world translated/rotated as appropriate). Strong rear-readable accessories, large hands/shoes and expressive faces. Soft sun, haze toward horizon; stable chase framing. Original typography-based logo and locally generated music.

Characters: Pip (courier, cropped teal jacket/backpack; alternate rain cape + cargo shorts), Rumi (roller artist, orange overalls; alternate painter smock + knee pads), Tavi (mechanic, plum vest/gloves; alternate utility coverall + belt), Jett (dancer, cobalt tracksuit; alternate cropped hoodie + wide joggers), Nori (photographer, cream/green windbreaker; alternate safari vest + camera satchel). Boards: Tide (rounded teal, jump advantage) and Ember (angular coral, controlled descent).

## Assumptions
Demo economy intentionally brisk. Characters have identical collision capabilities. Local challenges use fixed named seeds, no date/time dependency. Preview saves and scores isolated. Procedural reachability uses a conservative safe-route certificate plus simulation tests. All generated meshes are source assets requiring Blender validation before final integration. Locally authored art used during development is identified as such.

## Verification plan
Strict TS and production build; deterministic simulation at 30/60/144Hz plus bounded stalls; 1,000 seed transition reachability checks including moving trains/roof routes; persistence corruption, idempotency, purchases, migration; browser input/menu/offline/restart tests; actual screenshots; sustained 20-minute rendering measurements after warm-up. Chromium and Firefox required; Safari only if available. Record hardware and actual limits without estimating results. Budgets: first playable <=25MB, all <=80MB. All assets local and cache enumerated at build.
