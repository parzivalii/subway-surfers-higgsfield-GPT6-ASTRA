# Asset inventory and provenance

The game uses original, locally authored vertex-colored 3D geometry. Two Higgsfield-generated **raster references** informed the courier and station art. No Higgsfield-generated mesh, automated rig or generated animation was delivered. The connector could read the account balance and quote/submit images, but exposed no usable 3D submission and cost-quote pair. Paid 3D production remains blocked; it was not silently replaced with a claimed generated mesh.

The locally authored pilot was exported from Three.js, imported and validated in free Blender 4.5.13, saved as `.blend`, exported as GLB, loaded by Three.js and visually inspected in the running browser. All 35 collection meshes were then processed and integrated, including the added tunnel entrance and harbor. This verifies the **local geometry → Blender → GLB → browser** path only. It does not complete the requested Higgsfield mesh-generation workflow or establish premium commercial artwork quality.

## Paid source references

| Asset ID | Purpose and actual file | Provider/requested model | Completion model | Output and cost |
| --- | --- | --- | --- | --- |
| `pip-source-reference` | Courier appearance reference; `assets/source/pip-reference.png` | Higgsfield / `nano_banana_pro` | Job response reported `nano_banana_2` | 2048 × 2048 PNG; 2 credits; completed |
| `station-source-reference` | Station kit appearance reference; `assets/source/station-reference.png` | Higgsfield / `nano_banana_pro` | Job response reported `nano_banana_2` | 2048 × 2048 PNG; 2 credits; completed |

Both submissions requested `aspect_ratio: "1:1"`, `resolution: "2k"`, `count: 1`, `use_unlim: false`. Neither used an uploaded reference image. Exact requests are preserved in [generation-requests.json](../assets/source/generation-requests.json), with readable copies and unsubmitted production specifications in [GENERATION-PROMPTS.md](GENERATION-PROMPTS.md).

Job IDs are `13dff8f6-f1e1-4101-b4cd-cf9a0a14a0f2` and `493ff54e-0a02-44f8-8030-d7ec130dc14f`. The initial verified balance was 232.16; the fixed project ceiling is 116 whole credits. Actual reconciled spending is 4, pending reservation 0, and last reconciled balance 228.16. The ceiling does not rise if the account balance later changes. Root is the only paid submission owner. The [credit ledger](CREDIT-LEDGER.json) is authoritative; no cost is assigned to an unsubmitted 3D job.

## Mesh inventory

For each asset ID below, the authored input path is `assets/authored/<id>.glb`, the editable Blender source is `assets/blender/<id>.blend`, and the export path is `public/models/<id>.glb`. Export scripts record actual source and final statistics in JSON rather than estimating them here:

- [Pilot authored inventory](../assets/pilot-inventory.json) and [Blender pilot report](../assets/blender-pilot-report.json).
- [Authored inventory](../assets/authored-inventory.json) records every exported source mesh, triangles, vertices, mesh/material/texture counts, source bytes and clip names.
- [Blender collection report](../assets/blender-report.json) records all 35 processed collection files, their actual final byte sizes, Blender actions and geometry statistics. The recorded pack totals 20,516,712 bytes and 172,612 triangles across the complete collection, not a simultaneous per-frame draw count. Its entries are the completion receipts for collection processing.

| Asset IDs | Use / authored identity | Reference inputs | Animation |
| --- | --- | --- | --- |
| `pip-default`, `pip-alt` | Pip courier: Express jacket/backpack; Rain Runner cape, shorts and boots | Pip source reference plus original outfit design | Ten articulated clips each |
| `rumi-default`, `rumi-alt` | Rumi roller artist: Fresh Paint overalls; Mural Maker smock and pads | Shared style and original authored geometry | Ten articulated clips each |
| `tavi-default`, `tavi-alt` | Tavi mechanic: Workshop plum vest; Night Shift coverall and tool belt | Shared style and original authored geometry | Ten articulated clips each |
| `jett-default`, `jett-alt` | Jett dancer: Flow State tracksuit; Freestyle hoodie and wide joggers | Shared style and original authored geometry | Ten articulated clips each |
| `nori-default`, `nori-alt` | Nori photographer: Day Trip windbreaker; Field Notes vest and satchel | Shared style and original authored geometry | Ten articulated clips each |
| `station-0`, `station-1`, `station-2` | Three 32 m Sunline Station modules: track, platforms, architecture, awnings, clocks, palms and furniture | Station source reference plus original modular layout | Static |
| `mural-0`, `mural-1`, `mural-2` | Three 32 m Painted Quarter modules: brick, murals, market scenery and roof details | Shared style and original authored geometry | Static |
| `waterfront-0`, `waterfront-1`, `waterfront-2` | Three 32 m Copper Quay modules: warehouses, containers and gantries | Shared style and original authored geometry | Static |
| `board-tide`, `board-ember` | Rounded teal and angular coral boards with foot placement and propulsion forms | Original authored geometry | Board motion owned by renderer |
| `train`, `movingTrain` | Teal carriage and contrasting shunting hazard | Station source reference and original detailing | Motion owned by simulation |
| `ramp`, `hurdle`, `barrier`, `obstacle` | Readable gameplay surfaces and hazards | Original authored geometry | Static render geometry |
| `magnet`, `jetpack`, `shoes`, `multiplier` | Recognizable power-up pickups | Original authored geometry | Pickup motion owned by renderer |
| `token`, `letter` | Rare token and hunt pickup source meshes | Original authored geometry | Pickup motion owned by renderer |
| `tunnel-entrance` | Corridor-framing modular tunnel portal; 636 triangles, 73,684 GLB bytes | Original authored geometry | Static decoration |
| `harbor` | Distant harbor silhouettes; 512 triangles, 59,468 GLB bytes | Original authored geometry | Static decoration |

The renderer loads all 35 exported assets. It additionally uses equivalent code-authored geometry for instanced coins, letter glyph variants and some effects. The cached production manifest includes every file delivered under `public/`. `src/game/city.ts` supplies the shared city/district configuration to generation and rendering. High quality uses selective bloom for effect objects; this does not change mesh provenance or introduce remotely supplied assets.

The security drone, distant skyline, instanced coins, pickup halos and pooled particles are code-authored renderer assets rather than separately paid generations. Relevant constructors are in `src/render/WorldArt.ts`, `Character.ts` and `geometry.ts`. They have no external files, textures or runtime service calls. The logo and UI icons are original CSS/SVG components; no raster UI generation was billed.

## Pilot measurements and conventions

| Blender-processed pilot | Vertices | Triangles | Meshes | Materials | Textures | Final GLB bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `pip-default` | 13,764 | 4,588 | 10 | 1 | 0 | 590,696 |
| `station-0` | 30,516 | 10,172 | 1 | 1 | 0 | 1,160,744 |

These are the recorded initial pilot measurements; later regenerated collection files can differ. Use the collection report for the final build.

One world unit is one metre. GLB uses Y-up; simulation forward is +Z. Characters are about 1.8 m tall, rooted at their feet. The render adapter maps lateral world orientation to the chase camera. Collision proxies are independent simulation shapes; they are not inferred from decorative mesh bounds.

The shared material is a matte `MeshStandardMaterial` with vertex colors, roughness 0.82 and metalness 0.02. Geometry contains deliberately simplified bevels and low-segment curved forms. There are no model texture maps, UV atlases or compressed geometry, so texture density and decoder files are not applicable to these meshes. This is a deliberate local-art implementation, not a claim that a textured production asset pack was completed.

Character clips are `idle`, `run`, `jump`, `fall`, `land`, `slide`, `stumble`, `defeat`, `celebrate` and `board`, sampled from authored poses at 30 Hz. They animate a compatible articulated group hierarchy with position/quaternion tracks and runtime crossfades. **They do not use a shared skinned skeleton or weight-painted deforming mesh.** Looping running has no baked forward travel; simulation owns movement. Blender processing validates mesh data, retains articulation and animations, sets metre units and saves/exports. It does not perform a separately verified retopology, UV unwrap or weight-painting pass.

## Bundled audio and fonts

| Asset | Source / reproduction | Runtime file | License / provenance |
| --- | --- | --- | --- |
| “Sunline Shuffle” | Deterministic original composition and PCM synthesis in `scripts/audio.mjs` | `public/audio/sunline-shuffle.wav` | Created for this project; no borrowed samples |
| Movement, pickup, impact, UI, power and results effects | Oscillator/noise synthesis in `src/audio/AudioManager.ts` | Synthesized locally after user interaction | Created for this project; no runtime download |
| Outfit 400/600/800 Latin | Installed `@fontsource/outfit` package | Vite-bundled `.woff2` | SIL Open Font License |
| DM Sans 400/600 Latin | Installed `@fontsource/dm-sans` package | Vite-bundled `.woff2` | SIL Open Font License |

## Outstanding production work

The five-character and full environment **Higgsfield 3D** collection is not generated. Before any further paid action, a real mesh submission endpoint and its price or enforceable maximum must be verified within the existing fixed budget. A generated character and module then need inspection, free Blender cleanup, appropriate UV/rig work, GLB export and in-game validation before more paid collection work. The exact production prompts and mesh acceptance criteria are supplied separately. Source references and locally authored exports must never be relabeled as completed provider-generated meshes.
