# seam-tail — hand-over note

Package: the two tails `seam-cover.md` left in `## Rest of the bite` item 4 —
`repaint-queue.test.ts` failing 4 of 8, and a sunk thing's last sliver reading
as a speck at the seam. Paths under `src/pages/mushrooms/ui/scene/`.

## Done

1. The repaint-queue test (this commit; see `git log -- repaint-queue.test.ts`).
   **The test was wrong, not the haze code.** It passed at 25a1928e; it broke
   at 86503fbf (the finger pad's removal), after which tablet, phone, phone
   sideways and small phone forests grow no mushroom past the clump (every
   one at 7.8–9.8 ahead, haze 0), so "something cleared" had nothing hazy to
   clear. The haze rule (`hazeAhead`, `repaintsDue`) is untouched: the
   opening check stays over the grown forest, and the clearing check now
   stands a mushroom on the frame's back row (`FRAME_DEPTH.far`, across −1,
   0, 1; haze ≥ 0.3 as laid out) and asserts that three steps in its haze
   drops by `HAZE_DRIFT` or more and the queue takes it.

## Left

2. The sunk sliver at the seam (`view.ts` `sunk`/`buried`).

## Decided

- Which screens grow a back-row mushroom is the forest's rule
  (`mushroom-room.ts`, p1d-taps), so the haze test no longer leans on it.
  That phones' forests stop at the clump is the known cost named in
  86503fbf and measured in `p1d-taps.md`, not this package's.
