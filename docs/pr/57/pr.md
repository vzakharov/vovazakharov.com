# PR #57: feat(vova): Syama's mushroom game at /mushrooms

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/57
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/mushroom-game-syama-lbirv7
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-17T09:39:48Z
- **Updated:** 2026-09-26T08:51:39Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- Syama's mushroom game at `/mushrooms`, the whole of it, spec in #65: a meadow of fly agarics with mouse houses, where `+` grows another mushroom (a four-cap picker first), `−` takes one away, and three bug buttons fly in a butterfly, a fly or a bee. No goal, no text, no failing — made for a six-year-old's hands on a tablet or phone.
- Everything is drawn and voiced by code: each mushroom, flower and insect is grown from its own seed by a pure, tested generator and painted with Phaser 4 vector primitives; sound is synthesized with Web Audio. Phaser loads on this route alone, and the canvas renders at the device pixel ratio so a retina tablet stays sharp.
- Four people's loves go into it: Syama's idea, procedural generation, Zoltan's ecology, and Leysan's mandalas. The ecology: bees pollinate flowers into new ones, a tapped cloud rains and the meadow answers, spores sprout after rain, dusk brings out the mice and fireflies. It is all shown in plain sight and never taught. The mandalas: the ornament is radial and ringed (the sun's rosette, the flowers' petal rings), without any mandala drawn as such.
- Built as an elephant (`docs/plans/mushroom-game-syama.*.md`), a bite per session, each bite reviewed by a fresh session and the review handled by the next, until finalize. The finished game is also published as an Artifact, linked here. **Bite 1 of 10 has landed:** the meadow, still.

Closes #65

## QA Checklist

Grows with each bite. Bite 1:

- [ ] `route` — `/mushrooms` opens full-screen with no page chrome around the canvas, and `sitemap.xml` lists it.
- [ ] `meadow` — sky, rosette sun, clouds, two hill ranges, ground with tufts, and two spotted fly agarics standing on the ground.
- [ ] `seeded` — a reload grows a different pair of mushrooms and a different skyline; resizing or rotating the device repaints the same meadow rather than a new one.
- [ ] `sharp` — on a retina tablet or phone the outlines are crisp, not soft.
- [ ] `fit` — tablet landscape and phone portrait both fill the screen with no strip or scroll, and a swipe neither scrolls nor zooms the page.

| Item     | Automatable | Covered?                          | Notes                                                        |
| -------- | ----------- | --------------------------------- | ------------------------------------------------------------ |
| `route`  | yes         | partly — `pnpm build` renders it  | the sitemap entry comes from `PAGE_ROUTES`                    |
| `meadow` | no          | no                                | looked at in frames at 1180×820@2 and 390×844@3              |
| `seeded` | partly      | the generator's determinism is tested | the scene's reuse of the visit seed is not                |
| `sharp`  | partly      | no                                | canvas buffer = CSS size × DPR, checked in Playwright        |
| `fit`    | partly      | no                                | checked in Playwright at both sizes                          |

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01MpLJGEigosCVuf9kvADaiS

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-17T09:40:14Z — "Proposed squash title/body: ``` feat(vova): a meadow with tw…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-17T09:40:14Z

[https://github.com/vzakharov/vovazakharov.com/pull/57#issuecomment-5712237909](https://github.com/vzakharov/vovazakharov.com/pull/57#issuecomment-5712237909)

Proposed squash title/body:

```
feat(vova): a meadow with two mushrooms at /mushrooms — stage one of #65
```

```
A child drew a game on squared paper and explained it in two voice
notes: fly agarics with a mouse house in each, buttons that send a
butterfly, a fly or a bee to land on them, a plus and a minus for the
mushrooms, and a choice of four caps whenever one is added. There is
no goal — the point is to watch the insects. Issue #65 holds the spec
and the list of what follows; this is the first piece.

The piece is a full-screen meadow with two motionless fly agarics,
drawn by Phaser 4 into a canvas that React mounts and lays out from
the screen size, so a phone held upright and a tablet held sideways
both fill. No sprites: each mushroom is grown by a pure, seeded
generator — proportions, lean, spots, a hue nudge — and painted from
those genes with vector primitives, so no two are alike and a forest
costs nothing per tree. The generator is the one thing under test.
The palette is the one file on the site with colour literals — a
canvas is out of the CSS tokens' reach, and the styling rule says so.

The game has no text anywhere, so a child of any age can play; with
that, no locales — one route, metadata in English like the rest.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

### Review by @vzakharov (agent) — COMMENTED

_2026-09-26T08:50:20Z_

Review of bite 1 (`b5d0974..bc7fb16`), played in the built export at tablet 1180×820@2 (landscape and turned to portrait) and phone 390×844@3, touch on. The page loads clean: no console errors, the buffer is sharp at device pixels, and a resize repaints the same meadow.

Where it falls short is the look, and mostly the mushrooms themselves. They are the picture's subject, and they read as a vector clip-art pair rather than Syama's drawing:
- faceted rims;
- a shade wedge with a straight cut through its crest;
- two separate straight columns where the drawing has one clump of long, bent stems leaning apart.

On a phone, one visit in eighteen puts a cap at or past the screen edge; that figure is measured, not estimated. Inline comments below, most important first. None of them block starting bite 2, but 1–4 should land before the meadow starts moving, because motion makes each of them more visible, not less.

- **T01** `src/pages/mushrooms/model/mushroom-genes.ts`:122 — unresolved — last: @vzakharov (agent) 2026-09-26T08:50:20Z — "**This docstring says "as in the drawing", and the frames do…" → [↓](#t01)
- **T02** `src/pages/mushrooms/ui/scene/draw-mushroom.ts`:64 — unresolved — last: @vzakharov (agent) 2026-09-26T08:50:20Z — "**The rims are faceted, and the cause is here.** The arc is…" → [↓](#t02)
- **T03** `src/pages/mushrooms/ui/scene/draw-mushroom.ts`:85 — unresolved — last: @vzakharov (agent) 2026-09-26T08:50:20Z — "**The shade reads as a pasted-on wedge, not as the cap turni…" → [↓](#t03)
- **T04** `src/pages/mushrooms/ui/scene/layout.ts`:58 — unresolved — last: @vzakharov (agent) 2026-09-26T08:50:20Z — "**On a phone, 5.5% of visits put a cap within 4 px of the sc…" → [↓](#t04)
- **T05** `src/pages/mushrooms/ui/scene/paint-backdrop.ts`:234 — unresolved — last: @vzakharov (agent) 2026-09-26T08:50:20Z — "**The ground starts at a ruler-straight line across the whol…" → [↓](#t05)
- **T06** `src/pages/mushrooms/ui/scene/start-game.ts`:19 — unresolved — last: @vzakharov (agent) 2026-09-26T08:50:20Z — "`'#000000'` is a colour literal outside `palette.ts`. This b…" → [↓](#t06)
- **T07** `src/pages/mushrooms/ui/scene/meadow-scene.ts`:46 — unresolved — last: @vzakharov (agent) 2026-09-26T08:50:20Z — "**This is fine for a still meadow, and it is the wrong shape…" → [↓](#t07)
- **T08** `src/pages/mushrooms/ui/scene/layout.ts`:42 — unresolved — last: @vzakharov (agent) 2026-09-26T08:50:20Z — "On a phone the sun is pinned to the edge. At `x = 0.84w` wit…" → [↓](#t08)
- **T09** `docs/plans/mushroom-game-syama.paused.md`:76 — unresolved — last: @vzakharov (agent) 2026-09-26T08:50:20Z — "This decision still says `Scale.RESIZE`. Bite 1 found that `…" → [↓](#t09)

<a id="t01"></a>

### `src/pages/mushrooms/model/mushroom-genes.ts`:122 — unresolved

```diff
@@ -0,0 +1,129 @@
… 118 lines elided …
+  return { cap, ...shape, spots };
+}
+
+/** The two fly agarics the meadow opens with, as in the drawing. */
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

**This docstring says "as in the drawing", and the frames don't show the drawing.** In `syama-drawing.webp` the two fly agarics grow from one clump. Their stems are long and bent, and they cross, and the caps lean apart like a V, touching at the rim, with the butterfly on top. Here they are two separate mushrooms on separate feet, each a straight rod tilted as a whole by `lean`.

A curved stem is the one gene that would carry the drawing's character, and it is missing: the gesture of the stem is what made his sketch his. Proposal:
- a `stemBend` gene: the stem's centreline a quadratic curve, the cap following its end tangent;
- the opening pair placed as one clump, near feet, leaning outward (a sign per placement, on top of the genes' `lean`).

Later mushrooms can stand apart. The opening scene is the one Syama will compare to his drawing.

---

<a id="t02"></a>

### `src/pages/mushrooms/ui/scene/draw-mushroom.ts`:64 — unresolved

```diff
@@ -0,0 +1,169 @@
… 57 lines elided …
+  const half =
+    (genes.capWidth / 2) *
+    Math.sqrt(1 - (fromLevel === 0 ? 0 : fromLevel ** (2 / genes.domePower)));
+  const arc = sample(half, -half, CURVE_STEPS, (x) => ({
+    x,
+    y: domeHeight(genes, x),
+  }));
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

**The rims are faceted, and the cause is here.** The arc is sampled evenly in `x`, but `domeHeight` has an infinite slope at `|x| = half` for every `domePower`. So the last one or two segments span most of the rim's height, and they draw as a straight edge ending in a corner. In the tablet frame, the back cap's left side is a single straight stroke from the rim up to the shoulder, and the shoulders show visible facets. The corner where it meets the sagging underside turns it into a point.

Sample by angle instead: `x = half * sin(φ)` for `φ` across `[-π/2, π/2]` puts the samples where the curve bends. Then round the rim with a short lip, a few samples blending the arc into the underside, rather than meeting it at a vertex. Raising `CURVE_STEPS` won't fix it, because the facets come from where the samples fall, not from how many there are.

---

<a id="t03"></a>

### `src/pages/mushrooms/ui/scene/draw-mushroom.ts`:85 — unresolved

```diff
@@ -0,0 +1,169 @@
… 71 lines elided …
+}
+
+/** A crescent along the dome's lower right, where the light does not reach. */
+function capShade(genes: MushroomGenes): Point[] {
+  const half = genes.capWidth / 2;
+  const outer = sample(half, -half * 0.1, CURVE_STEPS, (x) => ({
+    x,
+    y: domeHeight(genes, x),
+  }));
+  const inner = sample(-half * 0.1, half * 0.97, CURVE_STEPS, (x) => ({
+    x: x * 0.86 - half * 0.08,
+    y: domeHeight(genes, x) * 0.72,
+  }));
+  return [...outer, ...inner];
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

**The shade reads as a pasted-on wedge, not as the cap turning away from the light.**
- The outer arc stops at `-0.1·half` and the inner curve starts at `-0.166·half`, 72% down. The closing edge between them is a near-vertical straight cut through the crest: visible on both caps in every frame, and the "hard notch" bite 1 already noted.
- The crescent covers the dome's crown, where the shine's light should be strongest.
- It is laid over the spots, so every spot inside it goes a dirty grey (the one at the left cap's crown, the one at its right shoulder). That reads as a stain, not as a shaded spot.

Proposal: a crescent that tapers to zero width at both ends, e.g. the dome's arc and the same arc pulled inward along its normal by `w(t) = k·sin(πt)`, over the right-hand ~60% of the arc only. Then nothing gets closed by a straight edge. Painting the spots after it, with their own smaller shade, keeps them white.

---

<a id="t04"></a>

### `src/pages/mushrooms/ui/scene/layout.ts`:58 — unresolved

```diff
@@ -0,0 +1,61 @@
… 44 lines elided …
+      { x: width * 0.5, y: height * 0.08, r: short * 0.045 },
+      { x: width * 0.68, y: height * 0.24, r: short * 0.05 },
+    ],
+    mushrooms: [
+      {
+        x: width * (portrait ? 0.32 : 0.38),
+        y: groundTop + ground * 0.4,
+        size: size * 0.92,
+      },
+      {
+        x: width * (portrait ? 0.68 : 0.6),
+        y: groundTop + ground * 0.72,
+        size,
+      },
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

**On a phone, 5.5% of visits put a cap within 4 px of the screen edge or past it** (2000 visit seeds through `firstMushrooms` → `mushroomGenes` → this layout, with the cap's rim rotated by `capTilt` and `lean` about the foot). Tablet portrait: 0.4%, landscape: 0.0%. Bite 1 saw this as "the front cap nearly touches the right edge" and left it. It is a rule this layout has to hold, not a seed's bad luck. It only gets likelier as bite 3 adds mushrooms.

The layout can't see a mushroom's genes, but it can see their bounds: size each placement so `x ± size·(max capWidth/2 + sin(max lean)·(max stemHeight + max capHeight))` stays inside a margin, reading the maxima from `GENE_RANGES`. Otherwise the scene clamps `x` from the actual genes. The first keeps layout a pure function of the viewport, which is what its docstring promises.

---

<a id="t05"></a>

### `src/pages/mushrooms/ui/scene/paint-backdrop.ts`:234 — unresolved

```diff
@@ -0,0 +1,238 @@
… 230 lines elided …
+      nearHills + (groundTop - nearHills) * 0.6,
+      (groundTop - nearHills) * 1.1,
+    ),
+    groundTop + 2,
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

**The ground starts at a ruler-straight line across the whole screen.** The near hills close at `groundTop + 2`, and the ground's first band is a different green, so where they meet is one horizontal edge, full width. It shows in every frame (tablet ~y 490 CSS px, phone ~y 520). In a cartoon meadow it reads as a table edge, and it flattens the depth the two hill ranges build up.

Either let the ground's top follow a gentle wave of its own (a third `hillLine` with a small amplitude, filled down to the bottom), or start the ground gradient at the near hills' shade colour, so the seam has no step in colour to show. Bunching a row of tufts along it would hide the rest.

---

<a id="t06"></a>

### `src/pages/mushrooms/ui/scene/start-game.ts`:19 — unresolved

```diff
@@ -0,0 +1,39 @@
… 15 lines elided …
+    type: Phaser.AUTO,
+    parent,
+    transparent: false,
+    backgroundColor: '#000000',
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

`'#000000'` is a colour literal outside `palette.ts`. This bite made two statements that forbid that: `palette.ts`'s docstring and the sentence it added to `.claude/rules/styling.md` ("every colour it paints is a literal there and nowhere else"). It is also the colour anything would show before the first paint, or through a band gap. `PALETTE.skyTop`, formatted as the config expects, keeps both promises and makes the fallback the sky rather than black.

---

<a id="t07"></a>

### `src/pages/mushrooms/ui/scene/meadow-scene.ts`:46 — unresolved

```diff
@@ -0,0 +1,67 @@
… 42 lines elided …
+  private readonly paint = (): void => {
+    const ratio = Number(this.registry.get(PIXEL_RATIO_KEY) ?? 1);
+    this.cameras.main.setOrigin(0, 0).setZoom(ratio);
+    this.children.removeAll(true);
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

**This is fine for a still meadow, and it is the wrong shape for bite 2.** Every `ResizeObserver` tick destroys every object and repaints. From bite 2 on, those objects carry idle tweens and a tap's wobble. On a phone, a resize fires on every rotation, and it can also fire when the toolbar collapses under the `100dvh` host. Each one would kill every animation mid-motion and snap the meadow still.

The plan already says the scene reconciles by id. Resize should go through that reconciliation too: keep each object, and on resize move and rescale it to its new placement (repainting its `Graphics` at the new size where it has to), leaving its tweens alone. Worth writing into bite 2's `## This bite` before the first tween is written, not discovered after.

---

<a id="t08"></a>

### `src/pages/mushrooms/ui/scene/layout.ts`:42 — unresolved

```diff
@@ -0,0 +1,61 @@
… 38 lines elided …
+    horizon,
+    nearHills: horizon + (groundTop - horizon) * 0.45,
+    groundTop,
+    sun: { x: width * 0.84, y: height * 0.15, r: short * 0.075 },
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

On a phone the sun is pinned to the edge. At `x = 0.84w` with rays out to `1.8r`, the rays end about 10 CSS px from the right edge, and both glow discs are cut off by it. The two glow discs are flat, hard-edged circles at 8% and 14% alpha, so they read as a pale lens laid over the sky rather than as light, and on a phone you see them clipped. Pulling the sun in on portrait (so rays + glow fit) and giving the glow more rings at smaller alpha steps would make it a sun again. It is the mandala's first appearance in the game, so it's worth the care.

---

<a id="t09"></a>

### `docs/plans/mushroom-game-syama.paused.md`:76 — unresolved

```diff
@@ -0,0 +1,232 @@
… 72 lines elided …
+  Sound is synthesized with Web Audio, no files.
+- **Phaser 4**, loaded on this route alone: dynamic import inside a
+  `'use client'` component's `useEffect`, the game destroyed on unmount.
+  `Scale.RESIZE`, a full-bleed canvas at `100dvh`, `touch-action: none`. No
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

This decision still says `Scale.RESIZE`. Bite 1 found that `RESIZE` blurs a retina tablet, and it settled on `Scale.NONE` with the host sizing the buffer in device pixels (`## Eaten so far`, `start-game.ts`). A decision the whole game carries is the first place a later bite reads, so it should say what the code does now. Otherwise the next session reading it "fixes" `start-game.ts` back.

---

## Timeline (status, references, and other events)

- **2026-09-17T09:40:16Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/757c0449105015fc6d3cd38418fc4d4a70b96ad5.
- **2026-09-17T09:44:03Z** @vzakharov renamed from «feat(vova): a mushroom toy from Syama's drawing» to «feat(vova): a mushroom game from Syama's drawing».
- **2026-09-17T16:32:27Z** @vzakharov cross-referenced this pull request from [#65 Syama's mushroom game](https://github.com/vzakharov/vovazakharov.com/issues/65).
- **2026-09-17T16:33:58Z** @vzakharov renamed from «feat(vova): a mushroom game from Syama's drawing» to «feat(vova): a meadow with two mushrooms at /mushrooms — stage one of Syama's game».
- **2026-09-26T08:20:28Z** @vzakharov — _head_ref_force_pushed_
- **2026-09-26T08:20:39Z** @vzakharov renamed from «feat(vova): a meadow with two mushrooms at /mushrooms — stage one of Syama's game» to «feat(vova): Syama's mushroom game at /mushrooms».
- **2026-09-26T08:50:20Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5325225829.
