# Group A ("bake") — T60 and T71's hud.ts half: where it stands

Paused on the orchestrator's word. Everything below is committed and pushed;
no patch is outstanding.

## Done

- **505160c** — backdrop baked per paint (`paint-backdrop.ts`, new
  `baking.ts` + test). Sky/halo/sun → `far` RenderTexture under the live
  clouds; ranges/ground → `near` over them; wash → `wash` RT with `SCREEN`;
  grain strips stay live TileSprites over the wash (they were already a
  texture, and baking them under the wash would change the stacking). Source
  graphics sit off the display list and are repainted in place on resize.
  Bakes tile by tile (1024² final texels) at 2× device resolution and shrink by
  half, because a framebuffer has no MSAA (baked at 1× the sun rays and ridges
  came out stepped).
- **8c9c15f** — each button a RenderTexture face, supersampled the same way,
  rebaked only when look/place/size/ratio change (`button.ts`, `hud.ts`,
  `controls.ts`, `picker.ts`). T71's hud half: pictogram lighting takes
  `hairline = 1/ratio`.
- **9455cc6** — play-run budget: `scripts/lib/frame-budget.ts` (24 ms median
  rendered-frame JS per screen) + test; `play-mushrooms.ts` times every drawn
  frame and notes the median.
- **9a4c220** — orchestrator's add: `checkWatch` fails `worstTurn.rate >
MOST_TURN_RATE[kind]` and `worstLight.off > LIGHT_STEP + 1e-3`.
- **b2bc1f8** — look.md (d) cost lines corrected, plus a Phaser bullet on
  why a still Graphics costs every frame.
- Frames: `docs/remove-before-merging/frames/bite-7/handle/` (this commit).

## Measurements

Pixel diff, same seed, backdrop-only / HUD-only, before (3088b19) vs baked,
harness `tmp/bake/shoot.ts` + `tmp/bake/diff.mjs` (gitignored; worktrees
`tmp/bake/base`, `tmp/bake/after`): backdrop max 39–67 levels, mean 0.3–0.9,
pixels off by >8 levels 0.08–0.19%, all on shape edges (MSAA vs 2×2 SSAA); a
flat ±2–3 level drift inside the halo/wash (8-bit accumulation order). HUD,
with the old hairline forced: edge-only, visually identical. A rotation
tabL→tabP repaints to exactly a fresh tabP (0 diff outside the drifting
clouds).

Rendered frame (harness, opening meadow, median of 40): before 16–35 ms,
baked 6–9 ms on all six screens. Play run (probe build, one screen a call,
all exit 0 with the new checks): tabL 129 s (review 294), tabP 119 (262),
phoneP 99 (189), phoneS 44 (69); rendered-frame median 16–20 ms.

## Left

1. **phoneL play run** not yet run with the new checks and budget (the
   other four passed).
2. **The budget's headroom is thin under contention**: tabL measured 16.9 then
   20.2 ms with other agents building. Decide 24 ms vs ~26; 31.5 (bite 7
   unbaked) must still fail.
3. `git worktree remove tmp/bake/base tmp/bake/after` when done with the
   comparison.
4. The report (draft replies to T60, T71's hud half).
