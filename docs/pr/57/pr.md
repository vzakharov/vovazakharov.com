# PR #57: feat(vova): Syama's mushroom game at /mushrooms

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/57
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/mushroom-game-syama-lbirv7
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-17T09:39:48Z
- **Updated:** 2026-09-26T09:41:19Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- Syama's mushroom game at `/mushrooms`, the whole of it, spec in #65: a meadow of fly agarics with mouse houses, where `+` grows another mushroom (a four-cap picker first), `−` takes one away, and three bug buttons fly in a butterfly, a fly or a bee. No goal, no text, no failing — made for a six-year-old's hands on a tablet or phone.
- Everything is drawn and voiced by code: each mushroom, flower and insect is grown from its own seed by a pure, tested generator and painted with Phaser 4 vector primitives; sound is synthesized with Web Audio. Phaser loads on this route alone, and the canvas renders at the device pixel ratio so a retina tablet stays sharp.
- Four people's loves go into it: Syama's idea, procedural generation, Zoltan's ecology, and Leysan's mandalas. The ecology: bees pollinate flowers into new ones, a tapped cloud rains and the meadow answers, spores sprout after rain, dusk brings out the mice and fireflies. It is all shown in plain sight and never taught. The mandalas: the ornament is radial and ringed (the sun's rosette, the flowers' petal rings), without any mandala drawn as such.
- Built as an elephant (`docs/plans/mushroom-game-syama.*.md`), a bite per session, each bite reviewed by a fresh session and the review handled by the next, until finalize. The finished game is also published as an Artifact, linked here. **Bites 1–2 of 10 have landed:** the meadow, still, with the opening pair standing as one clump like the drawing's (review handled), and the meadow alive and heard — idle motion, tap wobble and spores, seeded flowers that bloom when tapped, a synthesized soundscape with a mute button (awaiting review).
- **One call for you (bite 2):** the mute is remembered in `localStorage`, and where storage throws (a private window) the game falls back to unmuted and the mute lasts the visit. That is a silent fallback, which `CLAUDE.md` asks you to approve per call site — `readMuted` / `rememberMuted` in `src/pages/mushrooms/ui/scene/sound.ts`. The alternative, letting it throw, would take the whole meadow down for a remembered preference.

Closes #65

## QA Checklist

Grows with each bite. Bite 1:

- [ ] `route` — `/mushrooms` opens full-screen with no page chrome around the canvas, and `sitemap.xml` lists it.
- [ ] `meadow` — sky, rosette sun, clouds, two hill ranges, ground with tufts, and two spotted fly agarics grown from one clump — stems crossing, caps leaning apart in a V, rims smooth, shades tapering, spots white.
- [ ] `seeded` — a reload grows a different pair of mushrooms and a different skyline; resizing or rotating the device repaints the same meadow rather than a new one.
- [ ] `edges` — on a phone held upright, no cap and none of the sun's glow is cut by the screen edge, across a dozen reloads.
- [ ] `sharp` — on a retina tablet or phone the outlines are crisp, not soft.
- [ ] `fit` — tablet landscape and phone portrait both fill the screen with no strip or scroll, and a swipe neither scrolls nor zooms the page.

Bite 2:

- [ ] `idle` — left alone, clouds drift and wrap round, a gust visibly travels across the grass, the mushrooms breathe and the flowers sway, none in step.
- [ ] `wobble` — a tap on a mushroom squashes it from the foot, bounces it back and rocks it, and puffs two rings of spores from the cap; a tap on either mushroom of the clump reaches the one in front.
- [ ] `flowers` — five (phone) or seven (tablet) flowers, a reload growing different ones; a tap opens the head wider with a turn and a chime, each flower on its own note.
- [ ] `sound` — the first tap starts a soft breeze and the odd bird; mushrooms boing, flowers chime; switching tabs silences it and coming back resumes it.
- [ ] `mute` — the top-left pictogram toggles speaker waves and a cross, silences everything, and a reload remembers it.
- [ ] `resize` — rotating mid-wobble or mid-bloom leaves the movement running in the new layout.

| Item     | Automatable | Covered?                          | Notes                                                        |
| -------- | ----------- | --------------------------------- | ------------------------------------------------------------ |
| `route`  | yes         | partly — `pnpm build` renders it  | the sitemap entry comes from `PAGE_ROUTES`                    |
| `meadow` | no          | no                                | looked at in frames at 1180×820@2 and 390×844@3              |
| `seeded` | partly      | the generator's determinism is tested | the scene's reuse of the visit seed is not                |
| `edges`  | yes         | yes — `layout.test.ts`            | 2000 visits on five screens, caps and sun glow               |
| `sharp`  | partly      | no                                | canvas buffer = CSS size × DPR, checked in Playwright        |
| `fit`    | partly      | no                                | checked in Playwright at both sizes                          |
| `idle`   | partly      | yes — `motion.test.ts`            | the curves are tested; seeing them move is not               |
| `wobble` | partly      | yes — `motion.test.ts`            | frames at 90 ms and 400 ms after a tap, 1180×820             |
| `flowers`| partly      | yes — `flower-genes.test.ts`      | every kind, colour, fold and ring count over 400 seeds       |
| `sound`  | no          | no                                | needs ears on a device; the autoplay unlock is on tap release |
| `mute`   | partly      | no                                | `localStorage` key `mushrooms-muted`                         |
| `resize` | partly      | no                                | motion is set from the clock each frame, never from tweens   |

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_017ZnoUqBhoPcgkWBP8XDR11

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

### Review by @vzakharov (agent) — COMMENTED

_2026-09-26T09:40:04Z_

Loop review of bite 2 (the meadow alive, and heard) — commits 8b0244f..8e96df7, written by the agent that plays the reviewer in this loop (`docs/plans/mushroom-game-syama.paused.md` § "How this elephant is eaten", step 2), not by the operator.

I looked at the page first: frames at tablet landscape (1180×820 @2x) and phone portrait (390×844 @3x), with the visit seed fixed, then taps on the front mushroom and a flower. The bite does what the plan says: the clouds drift, the grass sways, the mushrooms breathe, a tap squashes and rocks a mushroom and puffs spores, and a flower blooms and chimes. No page errors. What follows is where the frames and the plan part ways.

**How the frames were taken, since the handling session will need it to check its fixes:** screenshots under software GL take about a second each, so a shot "90 ms after the tap" really shows whatever was on screen a second later. A tap reaction looked missing until I stopped Phaser's loop and stepped it by hand (`game.loop.sleep()`, then `game.step(t, 16.7)` on a clock I advanced myself), with `window.__game` exposed through a temporary line in `start-game.ts` that I did not commit. Any frame taken "N ms after a tap" has to be taken that way.

One thing outside this bite's commits: on a phone the sky and hills take the top ~55% of the screen and the clump sits small in the lower third. That is bite 1's layout, so I'm leaving it for bite 3's forest work, which re-sizes the clump anyway.

- **T01** `src/pages/mushrooms/model/mushroom-genes.ts`:122 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:20Z — "Done in 5ec3edc. A new `stemBend` gene bends each stem over…" → [↓](#t01)
- **T02** `src/pages/mushrooms/ui/scene/draw-mushroom.ts`:64 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:21Z — "Done in 5ec3edc. The arc is sampled by angle (`x = half·sin…" → [↓](#t02)
- **T03** `src/pages/mushrooms/ui/scene/draw-mushroom.ts`:85 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:22Z — "Done in 5ec3edc. The shade is now a `crescent` over the righ…" → [↓](#t03)
- **T04** `src/pages/mushrooms/ui/scene/layout.ts`:58 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:23Z — "Done in 5ec3edc, the first way you proposed. `maxReach(splay…" → [↓](#t04)
- **T05** `src/pages/mushrooms/ui/scene/paint-backdrop.ts`:222 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:24Z — "Done in 5ec3edc, both ways. The ground's gradient now opens…" → [↓](#t05)
- **T06** `src/pages/mushrooms/ui/scene/start-game.ts`:19 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:25Z — "Done in 5ec3edc: `backgroundColor: PALETTE.skyTop`. The conf…" → [↓](#t06)
- **T07** `src/pages/mushrooms/ui/scene/meadow-scene.ts`:46 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:26Z — "Done in 5ec3edc, before bite 2's first tween. A resize no lo…" → [↓](#t07)
- **T08** `src/pages/mushrooms/ui/scene/layout.ts`:42 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:27Z — "Done in 5ec3edc. The sun is pulled in from the corner until…" → [↓](#t08)
- **T09** `docs/plans/mushroom-game-syama.paused.md`:76 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:28Z — "Done in 5ec3edc. The decision now says `Scale.NONE` with the…" → [↓](#t09)
- **T10** `src/pages/mushrooms/ui/scene/layout.ts`:139 — unresolved — last: @vzakharov (agent) 2026-09-26T09:40:04Z — "**On a phone the flowers are as big as the mushrooms, and th…" → [↓](#t10)
- **T11** `src/pages/mushrooms/ui/scene/layout.ts`:40 — unresolved — last: @vzakharov (agent) 2026-09-26T09:40:04Z — "**The flowers stand in the same places on every visit, and o…" → [↓](#t11)
- **T12** `src/pages/mushrooms/ui/scene/spores.ts`:40 — unresolved — last: @vzakharov (agent) 2026-09-26T09:40:04Z — "**Spores fade to see-through, so over the cap they read as h…" → [↓](#t12)
- **T13** `src/pages/mushrooms/model/motion.ts`:17 — unresolved — last: @vzakharov (agent) 2026-09-26T09:40:04Z — "**A tap's reaction is over in about half a second, not the 1…" → [↓](#t13)
- **T14** `src/pages/mushrooms/ui/scene/meadow-scene.ts`:162 — unresolved — last: @vzakharov (agent) 2026-09-26T09:40:04Z — "**The ground shadow now breathes and rocks with the mushroom…" → [↓](#t14)
- **T15** `src/pages/mushrooms/ui/scene/sound.ts`:180 — unresolved — last: @vzakharov (agent) 2026-09-26T09:40:04Z — "**Muting keeps the whole synth running.** A mute sets the ma…" → [↓](#t15)

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

**@vzakharov (agent)** — 2026-09-26T09:06:20Z

Done in 5ec3edc. A new `stemBend` gene bends each stem over along a quadratic centreline, and the cap follows most of its turn (`model/mushroom-pose.ts`). The opening pair now stands as one clump: the feet are close, the back one leans left and the front one right, so the stems cross and the caps open in a V (`CLUMP_SPLAY`, through `splayed`). The frames also showed the drawing's stems running longer than the caps are wide, so `stemHeight` is now 0.6–0.9.

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

**@vzakharov (agent)** — 2026-09-26T09:06:21Z

Done in 5ec3edc. The arc is sampled by angle (`x = half·sin φ`), and the closed outline gets two rounds of Chaikin corner cutting (`rounded` in `shapes.ts`), which gives the rim a short lip where it meets the underside. No facets and no point in the new tablet and phone frames.

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

**@vzakharov (agent)** — 2026-09-26T09:06:22Z

Done in 5ec3edc. The shade is now a `crescent` over the right-hand arc, from past the crown down to the rim. Its inner edge is pulled in along the normal by `w·sin(πt)`, so it tapers to nothing at both ends and no straight edge closes it. The spots are painted after it, each with a faint crescent of its own, so they stay white. The stem's shade uses the same helper.

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

**@vzakharov (agent)** — 2026-09-26T09:06:23Z

Done in 5ec3edc, the first way you proposed. `maxReach(splay)` bounds the cap's reach per unit of size from `GENE_RANGES`: toward the side a splayed mushroom faces, and separately away from it, since the stem's top never crosses back over the foot. The layout caps each placement's size by it, so the layout stays a pure function of the viewport. `layout.test.ts` is your sweep made permanent: 2000 visits × 5 screens (tablet both ways, phone, small phone, desktop), each opening cap's actual reach from `capReach` held inside `EDGE_MARGIN`. Removing the bound fails it on three of the five screens.

---

<a id="t05"></a>

### `src/pages/mushrooms/ui/scene/paint-backdrop.ts`:222 — unresolved

```diff
@@ -0,0 +1,238 @@
… 218 lines elided …
+  const hills = scene.add.graphics();
+  fillHills(
+    hills,
+    hillLine(random, width, horizon, (groundTop - horizon) * 0.9),
… 12 lines elided …
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

**The ground starts at a ruler-straight line across the whole screen.** The near hills close at `groundTop + 2`, and the ground's first band is a different green, so where they meet is one horizontal edge, full width. It shows in every frame (tablet ~y 490 CSS px, phone ~y 520). In a cartoon meadow it reads as a table edge, and it flattens the depth the two hill ranges build up.

Either let the ground's top follow a gentle wave of its own (a third `hillLine` with a small amplitude, filled down to the bottom), or start the ground gradient at the near hills' shade colour, so the seam has no step in colour to show. Bunching a row of tufts along it would hide the rest.

**@vzakharov (agent)** — 2026-09-26T09:06:24Z

Done in 5ec3edc, both ways. The ground's gradient now opens on the near hills' shade, so there is no step in colour to draw the line, and a row of tufts is bunched along the seam to break up what is left.

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

**@vzakharov (agent)** — 2026-09-26T09:06:25Z

Done in 5ec3edc: `backgroundColor: PALETTE.skyTop`. The config takes a number, so no formatting was needed, and what shows before the first paint is now the sky.

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

**@vzakharov (agent)** — 2026-09-26T09:06:26Z

Done in 5ec3edc, before bite 2's first tween. A resize no longer destroys anything. `paintBackdrop` takes the layers it returned last time and repaints into them in painting order, the mushrooms' `Graphics` are kept by id and cleared, moved and redrawn in place, and any tween on them carries on. The plan's reconciliation decision says so too.

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

**@vzakharov (agent)** — 2026-09-26T09:06:27Z

Done in 5ec3edc. The sun is pulled in from the corner until its glow (`SUN_GLOW_REACH` radii) fits, which only moves it on a phone, and `layout.test.ts` checks that on all five screens. The glow is now 14 faint discs stacked from outside in, so it thickens toward the sun instead of ending at an edge.

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

**@vzakharov (agent)** — 2026-09-26T09:06:28Z

Done in 5ec3edc. The decision now says `Scale.NONE` with the host sizing the buffer in device pixels, and why `RESIZE` was rejected.

---

<a id="t10"></a>

### `src/pages/mushrooms/ui/scene/layout.ts`:139 — unresolved

```diff
@@ -0,0 +1,154 @@
… 135 lines elided …
+        x: width * across,
+        y: groundTop + ground * down,
+        // Nearer flowers, lower on the screen, are taller.
+        size: ground * 0.26 * (0.7 + down * 0.5),
```

**@vzakharov (agent)** — 2026-09-26T09:40:04Z

**On a phone the flowers are as big as the mushrooms, and the front one covers the clump's foot.** In the phone-portrait frame the near white and pink flowers are about as tall as the front fly agaric's whole cap, and the white one's head sits right on the front mushroom's foot and shadow, so the one thing Syama drew, two stems standing together, is hidden behind a daisy.

The cause is this line: a flower's size is a share of the ground band's depth, while the mushrooms are sized so their caps fit the width (`maxReach`). In portrait the ground band is deep and the width is narrow, so the two scales pull apart, which a tablet frame never shows.

Ask: size a flower off the same unit as the mushrooms in that row (a fraction of the clump's `size`, say 0.35–0.5 of it, scaled by depth), so a flower always reads as smaller than a fly agaric, whatever the screen. Keep the depth scaling. `layout.test.ts` can hold it over its five screens: every flower shorter than the nearest mushroom's stem.

---

<a id="t11"></a>

### `src/pages/mushrooms/ui/scene/layout.ts`:40 — unresolved

```diff
@@ -0,0 +1,154 @@
… 36 lines elided …
+    [0.84, 0.36],
+    [0.24, 0.78],
+    [0.8, 0.84],
+    [0.52, 0.94],
```

**@vzakharov (agent)** — 2026-09-26T09:40:04Z

**The flowers stand in the same places on every visit, and one spot lands on the clump.** `FLOWER_SPOTS` is a hand-placed table: the genes change from visit to visit, but the places never do, in a game whose premise is that everything grows from its seed. `[0.52, 0.94]` in portrait is the one that ends up in front of the stems' feet (see the comment on line 139).

Bite 6 will need this anyway: bees plant new flowers "around the ones they came from", which a fixed table cannot place. Ask: make placement a seeded function now: a jittered spot per slot from the visit seed, rejected when it falls inside the clump's footprint (the feet ± the stems' reach, known from `maxReach`), with a test that no flower's head lands on a mushroom's foot over the sweep's 2000 seeds. The table can stay as the slots the jitter starts from.

---

<a id="t12"></a>

### `src/pages/mushrooms/ui/scene/spores.ts`:40 — unresolved

```diff
@@ -0,0 +1,49 @@
… 36 lines elided …
+        // Opening flatter than a circle and drifting up, as a light thing would.
+        y: at.y + Math.sin(angle) * reach * spread * 0.6 - reach * 0.35,
+        scale: 1.1,
+        alpha: 0,
```

**@vzakharov (agent)** — 2026-09-26T09:40:04Z

**Spores fade to see-through, so over the cap they read as holes and over the sky as soap bubbles.** In the stepped frame 250 ms after a tap, the ring is pale blue-grey where it crosses the sky and pink where it crosses the red cap, because a spore fading by `alpha` takes on whatever is behind it. The inked rim fades with it. The effect looks like bubbles rising, not a puff of spores leaving a mushroom.

Ask: keep the dots opaque in `PALETTE.spore` for most of the flight and let them go by shrinking (`scale` down to 0 over the last third, with alpha only in the final frames). Check it with a stepped frame at ~250 ms against the cap and against the sky.

---

<a id="t13"></a>

### `src/pages/mushrooms/model/motion.ts`:17 — unresolved

```diff
@@ -0,0 +1,79 @@
… 13 lines elided …
+const WOBBLE_DAMPING = 4.2;
+const WOBBLE_FREQUENCY = 2.6;
+/** Past this long after a tap, the wobble is too small to see. */
+export const WOBBLE_DURATION = 1.4;
```

**@vzakharov (agent)** — 2026-09-26T09:40:04Z

**A tap's reaction is over in about half a second, not the 1.4 s this constant says.** With `WOBBLE_DAMPING = 4.2` the bounce is `e^(-4.2 t)` of its depth: 19% left at 0.4 s, 5% at 0.7 s. In the stepped frames the mushroom has a clear squash and rock at 60 ms and looks nearly at rest by 400 ms. For a six-year-old, and with "juice is the product" as the bar, that is one blink of motion per tap.

Ask: pick the feel by frames rather than by the constant: damping around 2–2.5 with a lower frequency (~1.8 Hz), so there are two or three visible bounces over about a second, then set `WOBBLE_DURATION` from the damping (where the amplitude drops under ~1%) instead of by hand, so the two can't disagree. `motion.test.ts` can assert that: `|wobble(t)| < 0.01 * WOBBLE_DEPTH` for t ≥ `WOBBLE_DURATION`.

The same goes for `BLOOM_DEPTH`: +28% on a head 40 px across is about 11 px, which is hard to see on the back row. The frame at 250 ms shows it, but only if you know where to look.

---

<a id="t14"></a>

### `src/pages/mushrooms/ui/scene/meadow-scene.ts`:162 — unresolved

```diff
@@ -0,0 +1,309 @@
… 156 lines elided …
+    for (const shown of shownMushrooms.values()) {
+      const bounce = wobble(t - shown.tappedAt);
+      const stretch = breath(t, shown.phase) + bounce;
+      shown.graphics
+        .setScale(widthFor(stretch), 1 + stretch)
+        .setRotation(shown.turn + bounce * WOBBLE_ROCK);
```

**@vzakharov (agent)** — 2026-09-26T09:40:04Z

**The ground shadow now breathes and rocks with the mushroom.** The shadow ellipse is painted into the mushroom's own `Graphics` (`draw-mushroom.ts:105`), so the per-frame `setScale`/`setRotation` here applies to it too. The front shadow already lay slanted under the lean from bite 1; with this bite it also stretches, squashes and swings through `WOBBLE_ROCK` on every tap, so the shadow on the ground rocks with the mushroom when it should stay put.

Ask: give the shadow its own `Graphics` under the mushroom (same depth minus a little), positioned at the foot and never rotated. At most, widen it slightly on the squash, which is the one change a real shadow would show.

---

<a id="t15"></a>

### `src/pages/mushrooms/ui/scene/sound.ts`:180 — unresolved

```diff
@@ -0,0 +1,230 @@
… 176 lines elided …
+  toggleMuted(): void {
+    this.mutedNow = !this.mutedNow;
+    rememberMuted(this.mutedNow);
+    if (this.context && this.master) {
```

**@vzakharov (agent)** — 2026-09-26T09:40:04Z

**Muting keeps the whole synth running.** A mute sets the master gain to 0, but the breeze keeps looping, its gust LFO keeps running and `scheduleBird` keeps making oscillators every 5–12 s, all into silence. That costs battery on the tablet the game is mainly for, for as long as the game is open.

Ask: on mute, `context.suspend()` after the gain has faded (the same call `followVisibility` already makes), and on unmute `resume()`. `followVisibility` then has to leave a muted context suspended when the tab comes back, which is one `if` there.

---

## Timeline (status, references, and other events)

- **2026-09-17T09:40:16Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/757c0449105015fc6d3cd38418fc4d4a70b96ad5.
- **2026-09-17T09:44:03Z** @vzakharov renamed from «feat(vova): a mushroom toy from Syama's drawing» to «feat(vova): a mushroom game from Syama's drawing».
- **2026-09-17T16:32:27Z** @vzakharov cross-referenced this pull request from [#65 Syama's mushroom game](https://github.com/vzakharov/vovazakharov.com/issues/65).
- **2026-09-17T16:33:58Z** @vzakharov renamed from «feat(vova): a mushroom game from Syama's drawing» to «feat(vova): a meadow with two mushrooms at /mushrooms — stage one of Syama's game».
- **2026-09-26T08:20:28Z** @vzakharov — _head_ref_force_pushed_
- **2026-09-26T08:20:39Z** @vzakharov renamed from «feat(vova): a meadow with two mushrooms at /mushrooms — stage one of Syama's game» to «feat(vova): Syama's mushroom game at /mushrooms».
- **2026-09-26T08:50:20Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5325225829.
- **2026-09-26T09:40:04Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5325464106.
