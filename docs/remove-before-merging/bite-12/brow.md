# brow — hand-over note

Package: `## Rest of the bite` item 4, "the seam is a horizon you can see" —
the cover row (`groundTop + seamReach`) drawn as the brow of a small round
planet's horizon. Paths under `src/pages/mushrooms/ui/scene/`.

## Done

1. 99f2007d, 1f0fd68e — step 1, the brow.
   - `brow.ts` (new): `browBlades(camera)` — blades round the whole
     panorama, one to each even share of the circle, from the brow's own
     seed (`BROW_SEED`), so the backdrop's `random` stream is untouched;
     `browShown(view, blades)` places them by azimuth (`screenAt`), so a
     turn slides them as it does the hills; `drawBrow` draws the crest (four
     rows from the cover row, `BROW.crest` fading into the ground over 0.45
     of the seam's reach) and the blades (dark, a third lit).
   - Sizes are shares of the seam's reach: gap 0.3 (≥ 2.5 px), height
     0.3–0.7, so no tip reaches `groundTop`, where a thing crossing `D_SEE`
     has its foot — nothing goes behind the blades at once.
   - `paint-backdrop.ts`: `Backdrop.brow`, depth −2.5 (over the ground at
     −3 and what sinks at −3.5, under the wash and grain), drawn live with
     the hills only when the heading changes (no rebake, no per-frame cost
     while still).
   - `view.ts` `coverRow`, which `sunkAway` and the brow share.
   - Palette: `BACKDROP.browLit`; tones `BROW` in `backdrop-tones.ts`.
   - `brow.test.ts`: tips below `groundTop`, roots at or under the cover
     row, one density at every heading, a turn slides them, same camera
     same blades.

2. Frames (scratch worktree at f28b892e, walk play): `frames/bite-12/`
   `tabL-brow-rim.png` and `-rim-close.png` (walked back to the rim: the
   blue flower right of the clump is going down behind the fringe, its
   stem's foot hidden by the blades), `tabL-brow-quarter.png` (bare
   ground a quarter turn round: the crest and blades across the screen),
   `phoneL-brow-rim.png`. Walk play green on both (tabL: 5 under the cover
   on ↓, at most 8.4 px over it; phoneL: 5, 4.0 px); frame JS median 11.3
   and 9.6 ms.

3. ca991f66, 651e48f2 — the fringe in clumps (the orchestrator
   read step 1's fringe as a comb). `browBlades` walks the circle from due
   behind, clump by clump: 3–18 blades a clump (most small), spaced
   0.07–0.16 of the reach (≥ 1.4 px), bare brow of 0.1–1.7 reach between
   clumps (most short); a clump's crown 0.28–0.6 of the reach, its edges at
   0.45 of the crown, each blade ±30 % off that shape; one clump in five
   holds a two-blade tuft at 0.82–0.95; lean = the clump's own (±0.12) +
   the edges splayed outward (0.16) + each blade's (±0.1), bounded at 0.3.
   Tallest is 0.95 of the reach, tip still under `groundTop` (root sits
   0.1 under the cover row). Blades a little wider (half 0.09 of the
   reach). Tests: the even-density test became "every heading shows blades,
   no bare stretch over 3 reaches in the screen's middle half, ≥ 75 % of
   neighbours within max(0.3 reach, 2.1 px), > 1 in 40 over a reach
   apart", plus "heights range < 0.2 to > 0.85, tufts (> 0.8) under 10 %".
   Frames replaced (`tabL-brow-rim`, `-rim-close`, `-quarter`,
   `phoneL-brow-rim`); walk green on tabL (5 under the cover, ≤ 8.4 px) and
   phoneL (5, ≤ 4.0 px), frame JS median 10.7 / 11.7 ms.

4. db4e08e3 — step 2, paling into the haze. `repaint-queue.ts`:
   `browPale(ahead)` — 0 up to `D_SEE` (13.33), easing (smoothstep) up to
   `BROW_PALE` 0.2 at `D_SEE + 1.2`, about where a back-row mushroom has
   sunk away (tabL: 1.2 past is ~100 px sunk). `hazeAhead` adds it and is
   now capped at 1 — the ground's haze already ran on past `MAX_HAZE`
   beyond the top row (0.93 at 20 ahead, over 1 from ~22), and `mix`
   toward the air does not clamp. The opening's back row (≤ 13.24) is
   untouched: the repaint-queue test that the opening repaints nothing
   still passes on every screen and seed. New test: across the 1.2 past
   `D_SEE` the haze rises > 0.15 more than across the 1.2 before it, and
   never falls. Mushrooms pick it up through the repaint queue as they
   already did (≤ 2 repaints a frame).
   - Flowers: `brow-flower-pale.patch` beside this note, against HEAD's
     `flower-bed.ts` (`git apply --check --cached` passes; it does **not**
     apply over P4's uncommitted working copy, which rewrites the same
     imports and `stand`). A flower is painted with no haze, so it pales
     by alpha: `stand` sets the container's alpha to
     `1 - 1.5 × browPale(ahead)` once a view places it behind the hills
     (0.7 at the fullest), no repaint. Applied in the scratch worktree:
     walk green on tabL and phoneL (5 under the cover, 8.4 / 4.0 px;
     frame JS 9.7 / 11.5 ms); `frames/bite-12/tabL-brow-pale-close.png`
     is the rim with it (the blue flower at the brow a shade paler).
   - The walk play shows no mushroom sinking (the forest grows nothing
     behind the clump on tabL, plan item 4's "Found on the way"), so no
     frame shows a mushroom paling.

## Left

- Apply `brow-flower-pale.patch` once P4's `flower-bed.ts` lands: the
  change is the import, `BROW_FADE`, and the two lines at the end of
  `stand` — re-place them by hand if P4's `stand` moved.
- The crest is soft; on tabL it reads as a light line under the blades. If
  it should read stronger, `BROW.crest`'s mix (0.5) and `CREST_DEPTH` are
  the knobs.

## Decided

- The brow's blades do not sway: they are drawn with the hills, only when
  the heading changes, so a still frame costs nothing.
