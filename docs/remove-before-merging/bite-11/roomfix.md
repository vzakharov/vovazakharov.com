# Bite 11 — package "room", fix round

Scratch scripts, in the worktree `tmp/wt-roomfix` (at 6dc645c; the shots script ran in a build worktree at c2a0f07):
`tmp/roomfix/finger.ts` (problem 1), `tmp/roomfix/wash.ts` and
`tmp/roomfix/wash-options.ts` (problem 2). No source changed in this round.

## 1. The fingertip bounds: the rule holds, the bound measures head depth

**The red bounds do not mean a mushroom is hard to tap.** Every mushroom they
count is a full-size finger target by the plan's own measure, and a tap on it
lands. What they count is heads *shallower than a fingertip is round*: a disc
44 px across (`FINGERTIP` 22) does not fit inside a dome 33–48 px tall, however
wide. Twelve mushrooms put more of the forest's flat, wide caps into the count
than six did, because the opening clump (almost never counted) is a smaller
share of twelve.

Measured over the test's own sample (every tenth visit, 200 per screen,
twelve grown, with flowers), the mushrooms the bound counts:

| screen | counted / all | padded | head width p10/50/90 | head depth p10/50/90 |
| --- | --- | --- | --- | --- |
| tablet | 648 / 2400 (27.0%) | 0 | 71 / 88 / 109 | 35 / 40 / 47 |
| tablet portrait | 78 / 2400 | 0 | 106 / 116 / 134 | 42 / 46 / 51 |
| phone | 575 / 2400 | 0 | 63 / 74 / 88 | 33 / 37 / 41 |
| desktop | 340 / 2400 | 0 | 86 / 97 / 118 | 37 / 43 / 48 |
| small phone | 318 / 2400 | 5 | 62 / 68 / 75 | 33 / 36 / 39 |
| phone held sideways | 78 / 2400 | 76 | 31 / 36 / 49 | 13 / 17 / 25 |

- **Against the plan's rule** ("the narrowest cap is `2 × TAP_RADIUS` wide"):
  on the three red screens not one counted mushroom is padded, which means
  each head is drawn at least `FINGER_ACROSS` (60.8 px) wide and `TAP_RADIUS`
  (32 px) deep, the size `fingerPad` treats as a whole finger target. Heads
  narrower or shallower than that get a 32 px pad (`fingerPad`) and are the
  sideways phone's 76. So the floor as the back rows apply it is not broken,
  and moving feet or the floor would not change what the bound counts.
- **A child's tap on every grown mushroom lands.** Of 2000 grown mushrooms per
  screen (12 000 in all): a tap at the head's middle goes to that mushroom
  every time on every screen. Of the taps on each head's drawn cap and gills
  (a 3 px grid), the share that goes to it is 100% at the median and at p1 on
  every screen; the worst single mushroom keeps 83% (tablet), 85% (desktop,
  small phone), 90–91% (the others) — the rest is a nearer mushroom drawn in
  front, which takes the tap by design. Every grown mushroom keeps a patch of
  at least 16 px radius (`GROWN_PATCH`), as the patch tests assert.
- **The bound as written is a size-mix statistic.** Per grown mushroom the
  share hardly moved from six to twelve (tablet 36% → 32%); at six it passed
  only because the near opening clump was a third of the forest.

**Left for the orchestrator:** the test is not changed. What it could assert
instead, from these numbers: every grown mushroom takes the tap at its head's
middle (0 misses today), and each keeps at least 80% of its drawn head's taps
(worst today 83%). Or keep the fingertip share and measure it over the grown
mushrooms only with bounds re-read at twelve — a loosening in effect, so not
taken here.

## 2. The sun's wash: it never washes a cap; what shrinks it is the foot rule

**The wash cannot wash out a cap on any crop, and never could:** it is baked
at depth −2 (`paint-backdrop.ts` `DEPTHS`), under the grain and under every
creature, so a cap is always painted over it. What shrinks it is bite 7's
"the wash stops short of every slot's foot" (plan § "Eaten so far" item 7,
from `atmosphere/look.md` A2: "never lifts the ground where caps stand"). The
sun is fixed on the screen and the back row of feet spans the whole world, so
some crop always brings a back-row foot straight under the sun; the round
wash then can reach no lower than that foot's clearance line. That line lies
*above* the ground's top on every screen (tablet 456 vs ground top 492; phone
held sideways 217 vs 234), so today's wash reaches the hills only, on every
screen. On the phone held sideways the line is 82 px below the sun.

Measured, visit 1 (outer ring in px, change against before bite 11):

| screen | before | now | A: ellipse below, round at the ground's third | B: round, feet kept off on the opening crop only | C: round at the ground's third, cut at the foot line |
| --- | --- | --- | --- | --- | --- |
| tablet | 308 | 296 | 441 wide (+43%), 296 below | 441 (+43%), 0.10 on a foot | edge 0.10 |
| tablet portrait | 343 | 343 | 589 (+72%), 343 below | 413 (+21%), 0.06 | edge 0.12 |
| phone | 329 | 329 | 410 (+24%), 329 below | 348 (+6%), 0.02 | edge 0.06 |
| phone held sideways | 151 | 82 | 151 (0%), 82 below | 151 (0%), 0.12 | edge 0.12 |
| small phone | 115 | 110 | 202 (+75%), 110 below | 115 (0%), 0.02 | edge 0.12 |
| desktop | 426 | 390 | 581 (+36%), 390 below | 581 (+36%), 0.10 | edge 0.10 |

Alphas are the wash's stacked `SCREEN` alpha of `sunGlow` (0.02 a ring) on the
worst foot a pan brings under the sun (B), or across the cut (C).

- **A — squash the wash's lower half into a half-ellipse** reaching the foot
  line, the upper half round. Keeps every rule; no hard edge (the two halves
  meet with vertical tangents). But the round size is then free of the feet,
  and bounded by nothing but the ground's third and 14 sun radii, so every
  screen but the phone held sideways grows 24–75% wide — a new look on the
  primary layout nobody asked for. Needs `paint-sky.ts` `paintWash` (not this
  package's) and `MeadowLayout.wash` to carry the lower reach.
- **B — keep feet out of the round wash on the opening crop only**, as the
  pre-bite rule kept them out of the one screen, and accept that a pan slides
  the wash over a back foot (as the plan accepts a cap slid under a button).
  Breaks bite 7's foot rule on other crops: up to 0.12 on a foot. Tablet and
  desktop grow, since the opening crop's feet stand far from the sun there.
- **C — cut the wash along the foot line.** A straight edge 0.06–0.12 bright
  across the near hills, which scroll under it: the line the rings are shrunk
  as a whole to avoid.

None meets the target (sideways back to 151, the rest near before) without
either breaking the foot rule or growing the other screens, so no option was
picked.

Frames, phone held sideways (844×390, ×3), the opening crop, production
build of c2a0f07 in a throwaway worktree (`look/`): `sideways-wash-now.png`
(82 px) and `sideways-wash-round-151.png` (B's round 151 px, the foot bound
disabled for the shot only; on the sideways phone A matches it above the
sun's middle). Each page load opens its own visit, so the two differ in
flowers and hills too. The difference is faint either way: at 82 px the glow
round the sun is mostly the sky's halo; at 151 px the near hills under the
sun come out a little warmer. Script: `tmp/roomfix/shoot.ts`.

## The tap-lands test (d5d0715)

Replaces the fingertip bounds: zero misses at the head's middle, every grown
mushroom keeping at least 80% of its head's taps (3 px grid). Green in a
clean worktree (worst 83.0% tablet, 84.7% small phone). **Re-run it at the
current head:** run while flowers' step 3 (the 14-flower bed, a675f2e) was
still uncommitted in the tree, the tablet failed — visit 4988973,
mushroom-10 kept 77.7% — and small phone's worst fell to 83.5%, probably a
seeded flower standing in front of a grown head (unconfirmed). If it fails
there, root-cause it; the 80% floor is not loosened.
