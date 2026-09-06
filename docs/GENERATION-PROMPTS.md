# Generation prompts and output contract

Only the two image requests in the first section were submitted. All 3D briefs below are **unsubmitted production specifications**, with no verified model settings or price. The account connector exposed image generation and balance information but no callable 3D submission plus price quote. No preview, retry, rig or animation charge for 3D has been incurred. The 35 integrated GLBs, including the tunnel entrance and harbor, were locally authored and processed with free Blender; their presence does not mean these provider requests were submitted. Do not submit a paid job until its quote and the remaining fixed 116-credit ceiling are verified against [CREDIT-LEDGER.json](CREDIT-LEDGER.json).

## Exact submitted image requests

Both requests used provider Higgsfield, requested model `nano_banana_pro`, aspect ratio `1:1`, resolution `2k`, count `1`, and `use_unlim: false`. The completed job response identified `nano_banana_2`; this difference is preserved rather than silently normalized. No image reference input was supplied. Each quote was 2 credits and each final image was 2048 × 2048. The structured request record is [generation-requests.json](../assets/source/generation-requests.json).

### Pip reference — completed

Asset ID `pip-source-reference`; source `assets/source/pip-reference.png`; job `13dff8f6-f1e1-4101-b4cd-cf9a0a14a0f2`.

> Original stylized full-body cartoon railway courier Pip, youthful adult, cropped teal jacket, cream undershirt, navy cargo trousers, coral high-top sneakers, compact orange backpack. Warm medium-brown skin, expressive large eyes, short sculpted dark curly hair. Appealing athletic 5-head proportions with oversized hands and shoes, clean readable silhouette, production-friendly separated clothing. Neutral A-pose, unobstructed hands and feet, no props in hands, no logos, no text. Matte materials and soft bevelled shapes. Single character. Orthographic front three-quarter view, plain light grey background, neutral studio illumination. Full body with generous margins. Production character reference for 3D reconstruction, no floor props.

### Station reference — completed

Asset ID `station-source-reference`; source `assets/source/station-reference.png`; job `493ff54e-0a02-44f8-8030-d7ec130dc14f`.

> One modular station platform and awning kit for an original premium cartoon 3D railway runner Switchyard Sprint. Warm coastal city, cream stucco, sandstone platform with teal trim, coral scalloped awning, teal rounded train carriage beside it, chunky structural columns, round station clock without lettering, potted palms. Clean readable bevelled shapes, soft matte painted metal, controlled detail. Human scale, unobstructed modules, plain warm-grey background, orthographic three-quarter asset-reference view with no dramatic camera perspective. Separate playable platform top from decorative objects. No people, no written logos or text. Sunny palette cream #fff1cd teal #169c9e coral #f47754. Production-friendly reference for modular mesh modelling.

## Unsubmitted character mesh requests

Use the following shared text plus exactly one identity paragraph for a base character. Select actual supported 3D parameters only after inspecting the provider's available interface. Proposed triangle/material targets below are acceptance targets, not claims that a provider offers those settings.

> Original stylized 3D character for a premium cartoon railway runner set in Solara Bay. Expressive face, strong silhouette, appealing athletic five-head proportions, oversized readable hands and shoes, clean material separation, simplified production-friendly clothing, readable from a rear chase camera. Full body, neutral A-pose, unobstructed hands and feet, neutral lighting and plain background. Consistent proportions across references. No logos or written text. Create actual mesh geometry, not a rendered picture or billboard. Character height approximately 1.8 metres, feet at the origin, Y up. Matte painted cartoon material language, warm sunlit palette, teal and coral accents. Separate accessories cleanly while preserving a riggable body.

| Asset | Append this identity paragraph | Reference input if supported |
| --- | --- | --- |
| `pip-default` | Pip, energetic courier with warm medium-brown skin, large expressive eyes, short sculpted dark curls, cropped teal jacket over a cream shirt, navy cargo trousers, coral high-top shoes and a compact orange backpack. Preserve facial identity and rear-readable backpack. | `pip-reference.png` |
| `rumi-default` | Rumi, roller artist with orange overalls, cream sleeves, rounded wrist and knee protection, sturdy sneakers and an expressive rounded hair silhouette. Athletic friendly proportions, no skates attached to the feet. | Approved Pip style only; no Rumi reference generated yet |
| `tavi-default` | Tavi, inventive mechanic with a plum vest over practical work clothes, large work gloves, durable boots and compact belt tools. Distinctive face and short practical hair silhouette. Keep tools outside moving joint clearances. | Approved style; no Tavi reference generated yet |
| `jett-default` | Jett, street dancer with a cobalt tracksuit, high-top sneakers and a distinctive sculpted hair silhouette. Energetic posture expressed through proportions while retaining the neutral A-pose. | Approved style; no Jett reference generated yet |
| `nori-default` | Nori, adventurous photographer with a cream windbreaker, green accents, comfortable travel trousers, chunky shoes and a compact camera accessory on a strap. Keep the hands unobstructed and accessories clear of joints. | Approved style; no Nori reference generated yet |

For each alternate, use the approved base mesh/reference as an input only if the eventual tool supports it, and append:

> Preserve this character's facial identity, body proportions, joint positions and compatible rig. Create an alternate outfit with meaningful garment and silhouette changes, not just recoloring. Keep clothing practical for running, jumping and sliding. No logos, text or new handheld props. Retain the shared matte cartoon material language.

| Alternate | Garment edit |
| --- | --- |
| `pip-alt` — Rain Runner | Replace cropped jacket and long cargo trousers with a short rain cape, cargo shorts and waterproof boots; preserve a compact backpack. |
| `rumi-alt` — Mural Maker | Replace overalls with a loose painter's smock, striped sleeves and larger rounded knee pads. |
| `tavi-alt` — Night Shift | Replace vest with a utility coverall, rolled cuffs and a readable tool belt. |
| `jett-alt` — Freestyle | Replace tracksuit jacket with a cropped hoodie, wide joggers and chunky dance shoes. |
| `nori-alt` — Field Notes | Replace windbreaker with a safari vest, explorer shorts and a camera satchel. |

Acceptance targets: approximately 5,000–12,000 triangles per character after cleanup, one shared-compatible rig, at most two material slots, 1K texture maps only if needed, no baked lighting or forward translation in looping motion. Verify topology, UVs, normal orientation, scale, origins and joint deformation in Blender. These targets can be revised from measurements before further paid work; budget ceilings cannot be revised upward.

## Unsubmitted environment mesh requests

Shared text:

> Modular stylized railway city asset for a premium cartoon 3D runner. Warm coastal urban architecture, painted metal, clean readable forms, soft bevels, controlled texture detail, consistent human scale. Functional modular connections and clean geometry suitable for a real-time game. Separate playable surfaces from decorative objects. No baked camera perspective, foreground characters, or written logos. Create actual mesh geometry. Y up, one unit equals one metre. Warm cream and sand architecture, teal trains, coral accents, matte materials. Decoration remains outside a nine-metre-wide three-lane gameplay corridor.

Append the appropriate module request:

| Asset family | Exact module specification |
| --- | --- |
| Track and ground | A repeatable 32-metre rail-bed segment with three lane centres at X=-3, 0 and 3 metres; separated metal rails and low sleepers; level running surface; flush end connections. |
| Platforms and ramps | Sandstone side platform with teal edge trim and a separate 12-metre ramp rising from track level to a 2.7-metre train roof. Keep the ramp top planar and ends flush; provide clean separate collision-ready surfaces. |
| Train body, roof and front | Original rounded teal carriage, approximately 14 metres long, clear flat playable roof at 2.7 metres, readable windows and wheels, coral front accents and original light cluster. Separate roof and front modules; no real railway branding. |
| Low hurdle | Waist-low coral track hurdle with cream stripe, strong readable silhouette and compact supports outside the jump passage. |
| Overhead barrier | Painted metal overhead barrier with clear low sliding passage, visible warning stripe and distinct upper blocking beam; avoid thin invisible collision features. |
| Tunnel entrance | Warm stucco and painted metal portal framing a three-lane railway corridor, flush modular connection and unobstructed camera sightline; decorative lights and no written signage. |
| Station kit | Sunny cream station walls, coral awnings, sandstone platforms, chunky columns, clock without lettering, benches and potted palms. Use the approved station reference for material and proportion continuity. |
| Mural district kit | Warm brick walls with original abstract geometric mural panels, roof water tanks, vents, balconies and market canopies. No copyrighted graffiti, logos or written text. |
| Waterfront kit | Coastal warehouses, gantries, stacked painted containers, pipe details and distant harbor crane/boat silhouettes; readable modular shapes, restrained complexity. |
| Small props and skyline | Benches, planters, bollards, rooftop vents, market crates, distant coastal buildings and harbor silhouettes in the same matte palette. Consolidate distant detail and keep playable surfaces separate. |

Acceptance targets: reusable 32-metre connections, modular origins at a known grid corner, one or two shared material slots per module, modest 1K atlas only where needed, simple gameplay proxies separate from render geometry. Distant variants should reduce detail rather than carry full foreground geometry. Use the station pilot first; inspect the actual output before expanding the kit.

## Unsubmitted hoverboard mesh requests

Shared text:

> Original stylized hoverboard for a premium cartoon runner. Readable from behind and above, clean silhouette, clear foot placement, compact underside propulsion, restrained emissive accents, no logos. Consistent scale and material language with the character collection. Actual mesh geometry, Y up, metre scale, centred origin. Matte painted metal and soft controlled bevels. Sized for the approved 1.8-metre character's stance.

Append `Tide: rounded teal board, cream foot pads, softly curved nose and compact twin propulsion units.` or `Ember: angular coral board, dark foot pads, faceted nose and compact controlled-descent fins.`

Acceptance targets: under 3,000 triangles after cleanup, one material where practical, no rig required, clean top foot-contact surface. Benefits and crash protection belong to simulation rather than baked mesh behavior.

## Animation contract for any future generated base

Use a compatible skeleton where practical. The required states are idle, running, jumping, falling, landing, sliding, stumble, defeat, celebration and board riding. Keep run and idle loops in place, ensure feet contact the ground, and validate transitions and sliding clearance in the chase camera. Verify each animation's price or use free Blender-authored motion; do not assume rigging or animation is included in a mesh quote. The present demo's articulated-node clips are documented separately in the asset inventory and must not be represented as this completed skinned-animation workflow.
