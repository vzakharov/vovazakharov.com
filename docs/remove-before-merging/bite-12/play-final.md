# play-final — hand-over note

Package: spec §4's remaining checks, then the full five-screen run. Files:
`scripts/play-mushrooms.ts`, `scripts/lib/*`, `scripts/sweep-mushrooms.ts`,
frames under `docs/remove-before-merging/frames/bite-12/`. Probe built in a
scratch worktree at origin 63df3268.

## Done (step 1, played on tabL only)

- `play-opening.ts` (`--plays opening`):
  - **Opening identity:** every mushroom and flower in front of the brow is
    drawn where bite 11's crop drew it (the layout's place less
    `(world − width) / 2`), within 0.5 px. tabL passes: 15 things, 0.000 px.
  - A thing past the brow at the opening is measured, not checked: how far it
    sinks and how much of it shows over `browRow`. tabL: `flower-1`, off the
    screen at x −323, sunk 4.1 px, 46.8 of its 48.9 px showing.
  - **Insect:** a butterfly released facing the clump perches in view
    (passes). A 180° turn on `→` raises no page error (passes). On every
    frame of the turn where its perch is on the screen, the butterfly's
    unfidgeted flight point is read in the perch's own drawn frame; how far
    it drifts from the first such frame is taken back into screen px.
    **Fails, a game fault:** see below.
- `play-approach.ts` (`--plays approach`): the forest grown from `+` (12
  mushrooms on tabL); the eye turned onto the haziest back-row mushroom on
  the screen; `↑` until it is drawn ≥ 1.5× its opening size; its painted
  haze must drop by `HAZE_DRIFT`; a tap 4 px outside its outline (cap, gills
  or stem, pushed out from the cap's middle, highest first, on the screen,
  off the controls, reaching nothing else) must not select it; a tap on its
  drawn cap must select it; then `→` 2 s and `←` 2 s at the closest
  approach. Every frame of the walk and the turn is drawn and timed, and
  their median is held to the 26 ms budget.
  - tabL: `mushroom-6`, drawn 1.00 → 1.54×, 13.13 → 8.54 ahead, haze
    0.376 → 0.039 (passes). Outside tap and cap tap pass.
  - **Frame budget fails on tabL:** a 36.1 ms median over 659 frames (slowest
    2858 ms); the whole screen's median is 35.7 ms. The load average was 4.0
    on 4 cores (other agents building). Not yet known whether this is the
    machine or the fill rate. Settle it by rerunning on an idle machine; if it
    still fails, spec §5's mitigation is to raise `V_NEAR` first.
- Frames: `tabL-final-{opening,perched,seat-turning,near,tap,close-turn}.png`.

## Game fault found

**A perched insect slides off its seat as the eye turns.** On tabL the
butterfly on `mushroom-1`'s cap drifts off its seat, measured in the cap's
drawn frame: 1.35 px at 0.085 rad, 3.6 px at 0.21 rad, 6.8 px at 0.345 rad,
and 7.7 px most while the clump is still on the screen. The spec allows 1 px.
`tabL-final-seat-turning.png` shows it: the butterfly sits near the crown in
`tabL-final-perched.png`, and by that frame it has slid to the cap's left
rim. The likely cause: `insect-view.ts` maps the seat, a layout point, through
`ofLayout` over the perch's foot row as a point in 3D, at its own depth, while
the mushroom is a flat sprite at its foot scaled by `zoom`. The two agree at
heading 0 and come apart as the turn takes the perch off the middle. This is
not fixed here (`src/` is off limits).

## Left

- Step 2: the full five-screen run (tabL tabP phoneP phoneL phoneS) at one
  commit, one screen per call, with its frames. Not started.
- The phoneL edge-flower judgement: the opening play's note prints how much
  of each sunk thing shows. Run `--screens phoneL --plays opening` and look at
  `phoneL-final-opening.png`. Not yet run.
- The frame budget rerun, on an idle machine.
- A play check for d4028a5a (a note or drum key plants through an open
  picker): no play covers it yet.
