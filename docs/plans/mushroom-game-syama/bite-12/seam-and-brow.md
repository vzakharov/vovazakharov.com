# Bite 12 — the play run, the seam and the brow

Bite 12's play run and its settled decisions on what lies past `D_SEE`, built. Moved verbatim from the plan's `## Rest of the bite`; a hand-over note's "item N" means the plan's old `**Left, in order:**` list, its items kept here with their numbers.

4. The rest of the play run. The probe reads the eye, and the walk play
   with its `walk-*.png` frames is in (002b560, d14e506, e8e4e79;
   `play-walk.md`). The species, tufts and insect plays read the view now
   (b3254511, 608fbcfc, adfe6fc6, 3c07c7b9; `play-rest.md`): every screen
   passed all five plays, though not in one run at one commit. Left: one
   full five-screen run at the final HEAD, one screen per call, its
   frames committed; spec §4's opening identity, the walk to a back-row
   mushroom and a tap on its drawn cap, an insect after 180°, the frame
   budget walking into the forest. The footstep level (`STEP_PEAK`,
   ~10 dB under a C5) for the operator's ear. Build the probe in a
   scratchpad worktree when another agent's edits sit uncommitted in the
   tree.
   **Fixed (c3acaa50, `seam-cover.md`): past the seam a thing sinks under
   the ground, never onto a far hill.** The walk frames showed a back-row
   flower past `D_SEE` standing whole on the far hill wherever the near
   crest dipped below its foot. Covering it "from the crest down" cannot
   hold: the crest never comes lower than 0.4 of the near band (32 px on
   tabL), about a flower's height at `D_SEE`, so the plan's cover hid
   whole flowers at the seam at once — a pop. Instead, past `D_SEE` a
   thing is drawn below the ground's top row by as much as its foot would
   stand above it (`view.ts` `sunk`/`buried`), between the near hills and
   the ground, which covers it from the foot up; walking away, it slides
   over the meadow's brow. Left from it: a sunk thing's last sliver reads
   as a speck at the seam (`tabL-walk-rim.png` ≈(240, 850)) — hide it
   once less than a recognisable head shows; a buried flower must count
   neither for the keys' `inView` nor for taps (`flower-bed.ts`, with P4).
   The haze test is green again (0613c525: it now plants its own
   back-row mushroom). The sliver rule is in (fe149c59, `seam-tail.md`):
   past the seam a thing is hidden once under 0.2 of its drawn height
   shows above `groundTop + seamReach`; tufts follow it. Left: flowers
   (`seam-tail-flowers.patch`, one line in `flower-bed.ts`), mushrooms
   and the house (`mushroom-bed.ts` passes no height), and the walk
   play's `checkPops`, which must not count a vanish under the ground's
   cover as a pop — all three in one package once the play agent is out
   of `scripts/`.
   Built (d5bbaf85, 1efc4d07, `seam-end.md`): flowers, mushrooms and the
   house hide their last sliver; `checkPops` reads the cover, its
   allowance `SHOWN_LEAST` of the drawn height plus 2 px.
   **Decided, from the operator's play: the seam is a horizon you can
   see.** Sinking under a ground with no edge drawn reads as burying
   («выглядит как будто они просто прячутся в землю»). The world reads as
   a small round planet — on a sphere the horizon is a brow in every
   direction, and a far thing goes under it foot first, as a ship does —
   so the cover row gets a visible brow: a lighter crest line with a
   fringe of blades along it, standing in front of what sinks, and what
   nears the brow pales a little into the haze before it goes under. The
   operator: «ок, давай попробуем». Beaten: shrinking into fog alone (the
   spec's fade mists the opening's back rows, and pushed farther it
   pops), and leaving it as a style.
   **Decided, from the operator's second play: the brow is round.** A
   far flower stood with its foot above the straight brow, higher at the
   middle of the screen than at its side, and rode up and down as the
   child turned (screenshots in `bite-12/brow-round.md`): what sinks is
   keyed on the distance along the ground (turn-invariant, kept), but a
   screen row is the depth along the heading, so the line where things
   go under is the projection of the circle `D_SEE` round the eye, not a
   row. The brow is drawn along that curve — highest at the screen's
   middle, lower toward its edges — and each thing sinks relative to the
   brow at its own x, so a far flower slides along the curve as you turn.
   The operator: «закруглить горизонт?». Beaten: keying the sink on the
   depth along the heading (a straight brow, but a far flower would
   vanish as the child turns toward it). Also found: a flat pale band
   across the hills at some headings — traced and fixed in the same
   package.
   Built (3157cfb7–06a7c0b8 and the patches' landing; `brow-round.md`):
   HEAD sank by depth along the heading, the beaten option, and from
   `groundTop` rather than the drawn brow; now things sink by distance,
   the brow is the `D_SEE` circle's row at each x (`browRow`), flowers
   pale by distance. The band was Phaser's 1 px path skip dropping a hill
   band's corner (`PATH_SKIP` in `skyline.ts`, a test through Phaser's own
   skip). Left: at the opening on phoneL one edge flower starts partly
   sunk (desktop: one thing 28 px) — the world frame reaches past the
   circle near the sides; judge it in the five-screen run.
   Built (99f2007d, ca991f66, 651e48f2, db4e08e3; `brow.md`): the brow in
   `brow.ts`, a crest with clumped blades at compass headings, redrawn
   only on a turn; past `D_SEE` mushrooms pale up to 0.2 more haze
   (`browPale` in `repaint-queue.ts`). Left: flowers' paling,
   `brow-flower-pale.patch`, applied once P4's `flower-bed.ts` lands.
   **Found on the way: since 86503fb the forest on four screens grows
   nothing behind the opening clump** (every grown mushroom 7.8–9.8
   ahead, haze 0). The forest must still grow into the misty back rows;
   traced with the two reds in item 1 (`taps-and-flowers.md`).
