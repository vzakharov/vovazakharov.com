# seam-tail — hand-over note

Package: the two tails `seam-cover.md` left in `## Rest of the bite` item 4 —
`repaint-queue.test.ts` failing 4 of 8, and a sunk thing's last sliver reading
as a speck at the seam. Paths under `src/pages/mushrooms/ui/scene/`.

## Done

1. 0613c525 — the repaint-queue test. **The test was wrong, not the haze
   code.** It passed at 25a1928e and broke at 86503fbf (the finger pad's
   removal), after which tablet, phone, phone sideways and small phone
   forests grow no mushroom past the clump (every one 7.8–9.8 ahead, haze 0),
   so "something cleared" had nothing hazy to clear. `hazeAhead` and
   `repaintsDue` are untouched: the opening check stays over the grown
   forest, and the clearing check stands a mushroom on the frame's back row
   (`FRAME_DEPTH.far`, across −1, 0, 1; haze ≥ 0.3 as laid out) and asserts
   three steps in clear its haze by `HAZE_DRIFT` or more and queue it.
2. fe149c59 — the sunk sliver. `view.ts` `sunkAway(view, placed, height)`:
   a thing past `D_SEE` whose part showing over the ground's cover row
   (`groundTop + seamReach`, where the ground picture starts; above it the
   near hills' foot, which a sunk thing stands over) is less than
   `SHOWN_LEAST` = 0.2 of its drawn height is not drawn. `bedPlace` takes an
   optional laid-out height and hides by it; `shownSprouts` hides tufts by
   it (a tuft stands 2× its size, its middle blade). `skyline.ts`
   `seamReach` takes `Pick<MeadowLayout, 'height' | 'groundTop'>` so a View
   serves. Tests in `view.test.ts` and `bed-place.test.ts`.

## Left — for the owners of the files named

- **Flowers (the speck itself): `seam-tail-flowers.patch`**, one line in
  `flower-bed.ts` (off limits here): `bedPlace(this.view, laid.foot,
shown.headR - shown.headY)`. Played in a scratch worktree on tabL and
  phoneL: the tabL speck at ≈(240, 850) and two on phoneL go, and nothing
  else in the rim frames changes (diffs 25×6 and 379×6 device px, the
  specks only). The committed rim frames are not replaced, since the tree
  does not draw that yet.
- **The play's `checkPops` (`scripts/lib/play-walk.ts`) then fails ArrowDown**
  on both screens ("flower-N vanished reaching 1–3 px"): it reads a
  flower's top from `container.getBounds()` and counts any vanish on screen
  as a pop, with no notion of the ground covering a sunk thing. It needs to
  count a vanish only where the visible part over the cover row
  (`groundTop + seamReach`) is more than a few px. Without that change the
  patch makes the walk play red.
- **Mushrooms and houses**: `mushroom-bed.ts` `stand` passes no height, so a
  sunk mushroom's cap rim can still sliver; it wants
  `bedPlace(view, foot, <the mushroom's drawn height at layout size>)` —
  the house rides on the same place.

## Decided

- Which screens grow a back-row mushroom is the forest's rule
  (`mushroom-room.ts`, p1d-taps), so the haze test no longer leans on it.
- `SHOWN_LEAST` = 0.2: under a fifth of a flower is petal tips, less than a
  head; at the seam a flower is ~30 CSS px on tabL, so the hide takes ~5 px
  and less on phones. `bedPlace` with no height keeps drawing as before, so
  no bed changes until its owner passes one.
