# Bite 11 — package "perch" hand-over

Package 3's last items: the `fliers.test.ts` run against the 14-flower
seeded bed, and step 5, a released insect's first perch in view.

## Step 1 — `fliers.test.ts` against the 14-flower bed: passes

- Run alone, `node --import tsx --test src/pages/mushrooms/ui/scene/fliers.test.ts`,
  590 s timeout: **48/48 pass in 354 s** (wall clock 354 s), with nothing
  changed. So it exceeds the old 290 s cap but not the 590 s one; no fix was
  needed and nothing was made faster.
- Where the time goes: "the flies in a full forest" 232 s (20 visits × 6
  screens × 5 minutes of ten fliers, 34–42 s a screen), "all ten fliers"
  80 s, "the bees among the butterflies" 32 s, the catch sweep 5 s. Any
  future run must keep the 590 s timeout.

## Left

- Step 2: plan item 11, package 3 step 5.
