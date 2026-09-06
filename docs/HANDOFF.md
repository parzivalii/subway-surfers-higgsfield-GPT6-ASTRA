# Local demo handoff

The playable source, assets, lockfile, tests and reports live in this repository. The static game is `dist/`; the packaged copy is `release/switchyard-sprint-demo.zip`. Nothing was publicly hosted. Use the README for complete commands, controls, save behavior, credits and verification.

The release archive contains `dist/`, `serve.mjs` and `START.txt`. Extract it, open a terminal in the extracted folder, run `node serve.mjs`, then visit `http://127.0.0.1:4173`. It requires no npm install. A compatible current Node runtime is needed for this included server; any conventional static HTTP server can also serve `dist/`. Offline reload is available after the game reports **Offline ready**.

## Completed milestones

1. Workspace/tool inspection, original art specification, source requirements, fixed credit ledger and test plan recorded.
2. Full running loop implemented with fixed-step simulation, collision, reachable generation, tutorial, defeat/revive/results and restarts.
3. Local geometry → Blender → GLB → Three.js pilot and collection completed. **The requested Higgsfield-generated mesh path remains externally blocked.** Two verified paid raster references informed the local art; no mesh-generation result is claimed.
4. Effects, boards, economy, missions, achievements, challenges, save validation and menus implemented and tested.
5. Articulation/animation, camera, effects, local audio, keyboard interaction, loading and recovery refined. Premium production character deformation and audio listening validation remain open.
6. Production build, Chromium/Firefox offline suites, 47 domain tests, 1,000 seeds at each of three speeds, real browser keyboard play, screenshots and twenty-minute physical-GPU rendering soak completed. Build hashes reproduced exactly.

## Evidence

- [Feature checklist](FEATURE-CHECKLIST.md): individual implementation and verification status.
- [Performance](PERFORMANCE.md): exact machine, measured frame intervals, heap/resource behavior, loading and limitations.
- [Asset inventory](ASSET-INVENTORY.md), [generation prompts](GENERATION-PROMPTS.md), [credit ledger](CREDIT-LEDGER.json): real provenance and unsubmitted specifications. Four credits spent against the fixed 116-credit ceiling.
- [Build manifest](../reports/build-manifest.json): 56 files, 23,135,572 bytes, SHA-256 hashes.
- [Screenshots](../reports/screenshots/chromium-production/): actual title, gameplay, ten character appearances, both boards, settings, missions and results. Firefox captures are in the adjacent directory.

## Remaining requirements

The demo is usable and tested, but the original brief is not fully fulfilled: provider-generated 3D meshes, a shared skinned production character workflow, premium commercial art/foot-contact quality, representative mainstream hardware testing and Safari verification remain open. The soak used automated isolated flight with lane changes and ten restarts; manual browser play was shorter. Audio listening, a full accessibility audit, total process memory and VRAM measurements were not established. No known critical gameplay error remained in the completed checks.
