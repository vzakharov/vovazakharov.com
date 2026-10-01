# Bite 12 — the decision log

Bite 12's settled history, moved out of the plan's `## Rest of the bite`
verbatim: what was decided, built and beaten, and where each relay left it.
The plan keeps only what is still to build; the bite's agents read this when
a package needs the why behind something already built. The hand-over notes
under `docs/remove-before-merging/bite-12/` that cite "`## Rest of the bite`
item N" mean the numbered list under § "The Left list as it stood" below.

## Decided, built and beaten

**Built so far** (each package's hand-over note under
`docs/remove-before-merging/bite-12/` names its API and departures; the
departures were taken):

- Step 0: the eye and pinhole view (`model/ground.ts` `Eye`, `viewOf`;
  `ui/scene/view.ts`), `model/cruise.ts`, the heading pan, `model/stride.ts`
  (`step0-eye.md`, `step0-cruise.md`).
- P1: the grass is a lawn again, every tuft a planting spot (81ffe900); the
  beds `follow(view)`, the retap restart, the haze queue (`p1b-beds.md`);
  the grass through the view (21d9fc8f, `p1c-grass-taps.md`).
- P2: clouds in lanes so no view is empty, the sun, glow and wash by
  azimuth, the live hills (measured: ~0.5 ms a frame against a baked
  strip's ~100 ms rebakes), the land in screen rows without mottles
  (`p2-panorama.md`).
- P3: `model/walk.ts` and `eye-input.ts`, ↑/↓, footsteps, keys only
  through flowers in view (`p3a-input.md`); the scene wired, the bob,
  things past the seam behind the hills (0dfbc9e7, `p3b-wiring.md`); the
  insects through the view (579c7312, `p3c-insects.md`).

**Where the relay at depth 8 left it** (each line's note under
`docs/remove-before-merging/bite-12/`): `pnpm type-overlap`'s groups fixed
(5c7a7b43, `type-overlap.md`); `decisions.md` rewritten (b2fb9fd1); the
fold done — `bite-12.md`, the summary, row 12, the elephant reworded
(181167e8, 34354853); item 4b built (d4028a5a, `key-plants.md`); the
opening, approach and seat plays (4fa8349a); a perched insect drawn where
its cap or flower draws the seat, 0.00 px through a turn on tabL and
phoneP (c8c32263, `seat-fix.md`); the keys play and the probe's seat read
(9ac52e0f, b0a652bb) — tabL passes every play at b0a652bb but the frame
budget. **The frame budget fails on an idle machine** (33.5 ms median
walking into the forest and turning at the closest approach, against 26;
21.4 ms over the whole screen). **Decided: spec §5's mitigation, raise
`V_NEAR` first**, measured until the forest walk holds 26 ms, then judged
on frames that a near mushroom does not vanish too early for a child;
beaten: relaxing the budget, which is the measure the game keeps. Left:
the released-insect fix (below), the `V_NEAR` fix, then the five-screen
run at the final HEAD with its frames (`play-final.md`: split each screen
by `--plays`, the full set takes ~9 min on tabL), the phoneL edge flower
judged; then the review subagent (§ "How this elephant
is eaten" step 2) and its fixes; delete this section; `/polish`, vet, the
Artifact, `/pr`. **Also, by a subagent:** the context-budget hook gives a
subagent its own notice at ~170k from its own transcript — commit what
passes, note current, report — instead of exiting on `agent_id`
(operator: «сделай, подагентом в следующей сессии»; see
`.claude/skills/megabeast/notes/subagents.md`). **Every build agent works
in its own `git worktree`** in the scratchpad (outside the repo, `pnpm
install --offline` there), committing and pushing to the branch from
there with `git pull --no-rebase` first, so the shared checkout stays
clean, the Stop hook's git check stays quiet, and no agent's half-done
edit reaches another's typecheck (operator, after a first «не надо»:
«пусть делают в worktree, мы же от этого ничего не потеряем?»). The
common brief's shared-tree rules change with it.
**From the operator's play at the relay: «пару раз нажал на бабочку --
кажется, она каждый раз появляется за пределами экрана».** The operator
had not moved: «никуда не ходил, просто нажимаю бабочку, и она
медленно-медленно вылетает из-за кадра к цветку. остальные тоже из-за
кадра, но разумеется быстрее». So it is the fly-in itself: a release
starts off screen and the butterfly's cruise (two thirds of bite 5's) is
slow over that distance. **Decided: a release is seen at once and lands
soon** — it enters at the nearer screen edge of the current view (not past
it), its arrival leg flies faster than its cruise so it reaches its first
perch, on screen, within ~1.5 s, at every heading, as "every tap answers
within a frame" asks. Measure the start point and the leg's length first.
Beaten: a faster butterfly overall (the slow cruise is what lets a finger
catch one).
**Also from the operator: «кажется насекомые не изменяют размера при
движении вперёд-назад».** Walking toward a perched butterfly, the cap
grows and the butterfly does not. **Decided: an insect is drawn at its
depth's scale** — perched, at its host's drawn scale (the seat fix's
`Host`); in flight, at the scale of the view's depth at its ground point.
If flight scale needs 12b's plane, build the perched half here, stop, and
report the rest as 12b's.
Built, both halves (69d7c5f, 8cd4f07, `insect-arrive.md`): a release enters
with its middle on the nearer edge and its first leg to a perch in view is
cut to at most `ARRIVAL` 1500 ms (measured before: butterflies 4.3–8.8 s
median, up to 15.3); in flight an insect's zoom blends between its two
hosts' by the seat fix's weights, so nothing jumps at take-off or landing.
Taken: a far insect's tap circle never shrinks under `TAP_RADIUS` (catching
them is the child's game; caps and flowers do shrink theirs). Facing past
the strip, a release still flies in unseen — 12b's accepted case below.
**Re-decided, the operator's idea: a release drops in from above** («может у
нас насекомые будут вылетать не сбоку а где-то сверху? тогда даже если она
потом полетит "за тебя", направление будет видно»). It enters at the top
edge of the screen, at an x between the screen's middle and its first
perch's, and comes down to that perch within `ARRIVAL`. With no open perch
in view it drops in at the middle and flies out by the side nearer its
perch in the world, at its arrival pace, so the child sees which way it
went. **Refined with the operator, told a screen row is a depth: it rises
from behind the brow in front** («ну тогда пусть вылезает "из-за холма"
спереди»). The release starts just past `D_SEE` along the heading, at an x
between the screen's middle and its first perch's, so it comes up over the
round brow as anything nearing it does, and flies in to the perch within
`ARRIVAL`, growing by the depth scale as it nears. With no open perch in
view it comes over the brow at the middle and flies out by the side nearer
its perch in the world. No height is needed: the depth model draws it.
Beaten: the side edge (half off screen, and an unseen leg's way lost), and
the top edge (a sky row is no depth, so it needed a height of its own
before 12b).
**From the operator, after the relay at depth 8: «субъективно кажется что
мухи и пчёлы стали перелетать слишком быстро».** Traced: 3ddb960 let
insects perch anywhere in a world twice a sideways tablet's screen, and
gave butterflies' `slowest` 2 → 4 for it but not flies' or bees'. A fly or
a bee past its `slowest` keeps the leg's time and dashes the rest
(`paced` in `flight.ts`), so its dash speeds up with the leg's length:
across the world it dashes ~2.3× (fly) and ~2.5× (bee) as fast as across
that tablet's screen (≈6 world units). **Decided: a dash is never faster
than the kind's dash across ≈6 units was**; a longer leg takes longer
instead, its last strides still at the kind's pace. Beaten: doubling
`slowest` as for butterflies (the dash still speeds up without bound with
distance, and mid legs slow too), and a slower pace overall (the dart is
what a fly and a bee are). Short and mid legs keep today's timing; the
catch tests and the arrivals' ~1.5 s first perch must hold.
Built (f736ec2, `dash-cap.md`) as one cap for every screen, `TABLET_ACROSS`
= 1180 / 60 ≈ 19.7 butterfly sizes (`paced` reads places in butterfly
sizes; "≈6 units" was ground units, and the ×2.3/×2.5 were computed in the
wrong unit — the real world-crossing gain is ×2.0–2.4). **Re-decided: the
cap is this screen's own width** in butterfly sizes, the longest leg each
screen allowed before 3ddb960. One tablet-wide cap left a portrait phone
(6.5 sizes across) dashing up to ~9 screen widths a second against ~2.6
before, and slowed a desktop (28.5 across) below what it ever had. Beaten:
the tablet's cap everywhere (above), and the cap in screen px (places are
already in each screen's butterfly size, which is what the eye reads).
Built (da93055, `dash-cap.md`): `Sight.across` set by `perchSight`; every
screen's fastest dash back to 2.5–3.1 screens a second. Left for the
review: `across` is optional and an absent one means no cap, which only
test fixtures rely on; `flight.ts` stands at 454 lines.

**Where the relay at 13:00 on 1 Oct left it.** Done: the subagent notice
(8bf5044, `subagent-notice.md`), the arrival and depth scale, the dash cap.
Running when it relayed, in that session's container, pushing here: `v-near`
(the frame budget, `v-near.md`) and `drop-in` (the rise from behind the
brow, `drop-in.md`) — read their notes and `git log` before briefing
anything on their files. **Open with the operator: a full turn takes 16.5 s
of a held key** (`TURN_CRUISE` 0.38 rad/s; the heading wraps, checked), and
behind the meadow is bare grass, so the operator turned and saw «бесконечная
поляна», never the circle closing. Their answer decides between a faster
turn (an acceleration while held, or a higher cruise) and something to
see behind. Left after that: the five-screen run with frames, the phoneL
edge flower, the review subagent and its fixes, delete this section,
`/polish`, vet, the Artifact, `/pr`.

**Decided, from the operator's turn: the meadow is half as deep, so a full
turn is half as many screens.** The operator's complaint is the length of the
circle, not the slide («претензии не к тому с какой скоростью движутся
цветы-грибы, это как раз ок, а к тому какой длины ощущается "полный
поворот"»), and the opening stays as it is («выглядит как будто ты прямо
посреди грибочков… и это хорошо»). Measured (`tmp/fov.ts`): a circle is
`2π · focal` px, and `focal = unit · CLUMP_DISTANCE`, so it is 7.9 screens
on tabL, 5.2 on phoneL and 18–19 on every portrait screen (a 19° view).
The row form fixes only `EYE_HEIGHT` (a row's scale is `(row − horizon) /
EYE_HEIGHT` whatever the focal length); `CLUMP_DISTANCE` is free. So
`CLUMP_DISTANCE` halves (8.64 → 4.32), `EYE_HEIGHT` stays 4.15 by its own
derivation from the row form, and `focal` halves with it: `viewOf` at
`OPENING_EYE` is still `project`, every screen's opening frame identical to
the pixel, and only depth along the plane halves — the clump stands nearer
and what is beside it comes round sooner. A circle becomes 3.9 screens on
tabL (77° across), 2.6 on phoneL, 9–9.5 on portrait. `TURN_CRUISE` comes out
of the slide in px, which stays (`0.38 · old focal` → 0.76 rad/s, 8.3 s a
circle). Everything else measured along the plane follows `CLUMP_DISTANCE`
rather than being retuned by hand: `GLADE`, `STRIDE_CRUISE` (so the clump
nears at the same pace on screen), `V_NEAR`, the brow, the repaint queue.
Beaten: a faster `TURN_CRUISE` alone (the circle still 7.9 screens, the
complaint stands); a cylindrical lens over a world spread sideways (the
spread would have to differ per screen, and the world is one); a narrower
crop (the clump shrinks, which the operator ruled out).
**On hold, measured (`half-depth.md`, `half-depth.patch`): the opening does
not stay identical.** `viewOf` = `project` holds, so everything placed
through `project` stays put, but the brow is the `D_SEE` circle, and with
the view twice as wide its sides bend much lower (×1.07 → ×1.28 at tabL's
edges) and far side flowers sink at the opening (11 shown against 15); 10–36%
of the opening's pixels differ (`frames/bite-12/half-depth-opening-*`).
That is a wider view itself, not the patch: at a wider angle the circle of
equal distance dips harder at the sides. Put to the operator with the
frames: accept the rounder brow, a smaller cut (`DEPTH_SHARE` 0.7–0.8), or
a straight brow (beaten before, see "the brow is round").
The operator: «не, это конечно выглядит не айс».

**Re-decided: a panoramic lens with a bent screen, as games with a round
horizon do (Animal Crossing's rolling world).** A wide pinhole dips a near
circle at its sides; the brow's roundness has to stop coming from the field
of view. So across, a screen is linear in azimuth (`x = c · azimuth`, a
cylinder), rows go by distance rather than depth along the heading, so the
circle `D_SEE` is a straight row and every row is turn-invariant, and the
whole ground is then bent down toward the screen's sides by a fixed
screen-space curve, today's brow curve (`hypot(1, dx / focal)` at today's
focal), so the opening's roundness is today's. **A full turn is 4 screens
on tabL** («каждый "экран" направо это поворот: восток-юг-запад-опять
север»): the meadow's angles widen by one factor everywhere (the world is
one), which gives the other screens their own count (portrait ≈ 9.5, phoneL
≈ 2.7), and the turn's slide in px stays. The clump and the middle stay;
things at the opening's sides draw inward (≈ 15% at tabL's edge, more on
phoneL) — **a probe first**: the opening on tabL, phoneL and phoneP beside
HEAD's, and tabL after a quarter turn, before anything is built (the
operator: «про пробу — ок»). Beaten: the half-depth pinhole (above), a
brow drawn at the old focal over a wider pinhole (what sinks would ride up
and down as the child turns).
Probed (147a6c6, `lens-probe.md`, `lens-probe.patch`,
`frames/bite-12/lens-probe-*`): 4.00 screens a turn on tabL (tabP 9.76,
phoneP 9.43, phoneL 2.66, phoneS 9.30), 8.4 s; the clump 0 px off; side
flowers in by 4–5% on tabL, 9–10% on phoneL, under 1% on portrait; nothing
HEAD shows sinks (phoneL gains a cut-off flower whole); 0.9–2.8% of the
opening's pixels differ. The probe spreads angles inside `viewOf` round the
eye (`SPREAD` 1.9617), exact only for the opening eye and turning in place;
**the build spreads the ground itself** (`planeOf`, `ofLayout`), then the
inverse projections (taps), the insects, the tests. The operator
looked: «мне ок» — so that build is the next package (`lens-build.md`),
and then the half-depth package's other carried items (the fliers'
ground-point sink, `PAST_BROW`, the no-perch leg, the world's-end release,
the insect cull by drawn extent, `V_NEAR`'s ceiling re-measured).
Built (88c9357 → 0f4c63c5; `lens-land.md`, `lens-carry.md`): the lens with
its tests, plays and frames (the opening the probe's to the pixel), the
sink, `PAST_BROW`, the no-perch leg, the cull, `V_NEAR` kept (ceiling
0.614). **Decided, from `lens-carry.md` round 2: a release whose brow start
has no usable row sets off just past the screen's edge** (`offScreen` with
the view), as before the first fit. The nearest column with any row sits at
the no-row wedge's edge, where the row is near-infinite and the zoom near 0,
so the butterfly never shows. Beaten: searching for a row within a bound
(the bound is a guess at the layout's range), keeping the start in plane
units (a larger change for a 0.76% case).

**Decided, from `drop-in.md`'s Left: a flier goes under the brow by its
ground point, not its middle.** What sinks is keyed on distance along the
ground (the round brow's rule), and a flier's middle stands above that ground
point, so keying the flier on its middle hid ~1% of releases for 0.15–1.0 s
while the insect still flew in front of the brow. Beaten: leaving it (the
child taps and sees nothing). The half-depth package carries it with the
rest of that note: `PAST_BROW` becomes a share of `D_SEE`, a no-perch first
leg is lengthened so its unseen part keeps cruise, a release never sets off
past the world's end (before the first fit, or looking back past the
opening row), then `fliers.test.ts` and the tabL / phoneP release frames.

**Decided, from `v-near.md`'s Left: an insect is culled by its own drawn
extent against the screen, not by `V_NEAR`.** `V_NEAR` is now `0.58 ·
CLUMP_DISTANCE` (2c1ed70), safe for a mushroom because one that near is
already below the screen's foot; an insect flies higher than a cap, so the
shared cull could drop a butterfly still on screen. Beaten: a separate,
smaller insect `V_NEAR` (still a guess at where an insect leaves the
screen). The half-depth package carries it, and re-measures `V_NEAR`'s
ceiling (0.613 today, where the fly agaric's cap leaves the screen) once
the focal length halves.

## The Left list as it stood

**Left, in order:**

1. P1 step 2 is built (86503fb, 9d637ea; `p1d-taps.md`): taps only where
   drawn, `+` judged in the current view, `pan-input.ts` gone. Left: the
   phone growth it broke, `mushroom-patch`/`meadow-rules`/`layout`
   re-run, `fliers.test.ts` once, `openingCrop` → `openingView`.
   **Decided: a grown mushroom's own patch scales with the drawn size.**
   With the pad gone, `GROWN_PATCH` 16 px of drawn body stops phones
   growing past the clump (41/20/20 of 120 to six). The patch is 16 px at
   a tablet's camera unit and shrinks in proportion to the screen's unit,
   floored at 8 px. Beaten: 8 everywhere (restores phones, but lets
   tablet forests crowd for no gain) and no growth on phones (breaks "the
   meadow only gets fuller"). If the scaled floor leaves a phone short of
   the old 120, the floor goes to 8 on that screen, measured.
   Built (d396ca72, `p1e-patch.md`): 120 to six on every screen. The
   clump's own patch follows the same rule — `CLUMP_PATCH` 12 at a
   tablet's unit, scaled, floored at 8 (the sideways phone's back cap
   kept a crescent too thin for 12; 0 failures at ≤9). Left, red since
   86503fb: `layout.test.ts` "grows 12 over the world" on the sideways
   phone (3 of 200 stop at 5–8, not for the patch), and
   `clump-layout.test.ts` "wider cap farther in" (tablet 318 → 589 of
   2250 pairs) — each traced to its cause and judged against the rule it
   stands for before anything is tuned.
   Traced (2758d677, 5d6f8d88, `p1f-reds.md`): the lost back rows were
   the patch, not the view's `+` — a back-row mushroom is drawn at 0.65
   of a front one and could not hold the screen's one patch size. The
   patch now also shrinks with depth (`× min(1, scaleAt(z))`): tablet,
   phone and small phone grow behind the clump again (70/67/59 → 131/
   129/120 of the first 20 visits), clump-layout's tablet pairs 589 → 303. **Set (45d9cce4): `LEAST_PATCH` 8 → 6.** The sideways phone's scaled
   patch is 7.6–4.9 px, so the 8 floor kept its back rows shut and both
   reds red; at 6, `layout` "grows 12" 200/200, clump-layout 358/2250,
   57% behind the clump (pads: 66%). Beaten: 5 (66%, but the farthest
   cap's patch gets hard for a finger) and relaxing the tests (they
   state the rule the meadow keeps). Left: set it, re-run
   `mushroom-patch`, `layout`, `clump-layout` and `fliers`.
2. Done (fff4e84, e9a6f995, `split.md`): `insect-view.ts` 349,
   `meadow-scene.ts` 408. `pnpm type-overlap` fails on 5 groups that
   predate the split (`Shown.bob` / `Stepped.bob` among them) — the
   bite's end fixes them before vet.
3. P4: the long press, the flower picker with the cross, the ring
   (below). Built (6ce6e395, 13f5a80a, 7a3a3d53; `p4.md`), with the
   `hold` play. **Decided for the fix round:** a pulled seeded flower
   leaves a tuft where it stood, since every planting spot is a tuft and
   the plan's "its tuft coming back" is about the spot, not the record
   (beaten: bare grass, which hides where the child can plant again); a
   press on the flower the picker is already open on keeps it open
   (beaten: shut then reopen, a flicker); a press through a resting
   insect is a long press too; the sun keeps off the cross as it does
   off the colour row. Then flowers' paling (`brow-flower-pale.patch`).
   Built (560e0db2–422c373b, `p4-fix.md`). **Re-decided: the cross
   yields to the sun, not the sun to the cross.** Moving the sun for the
   cross moved it on every screen at all times (tablet lower, small phone
   r 24 → 16) for a button shown only while picking, and broke
   `mushroom-light`'s small-phone case; so `placeSun` goes back to
   reading the button rows only, and the cross takes the first of its
   spots that keeps off the sun's disc and rays (on tabL, before the
   colour row's first button). Also: startling an insect does not shut a
   picker open on a flower, so a press through a resting insect does not
   flicker.
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
   traced with the two reds in item 1.
   4b. **A key plants (operator, playing the round brow).** While the picker
   is open on a tuft, a note or drum key plants the flower that sounds it
   there at once — its colour and shape are the key's, by `soundOf`'s law
   (`seedSounding`) — sounding as a planting does, in view of a matching
   flower or not, and the picker shuts («нажатие на "клавишу" этого цветка
   будет сразу его сажать, без необходимости выбирать цвет-форму… сто лет
   буду запоминать где там например фа диез»). Either stage of the picker
   takes it. The same holds for the picker open on a flower: the key
   replaces it, the picker being one picker. Beaten: keys planting only at
   the colour stage (the child would still have to find the colour).
   Octave keys still only shift the octave.
5. The bite's end: `decisions.md` rewritten where the spec names, the
   fold into `## Eaten so far`, `/polish`, vet, the Artifact, `/pr`.

6. **Walking.** The player really walks the meadow: turns on the spot
   through 360° and steps forward and back along the heading — a camera
   with a heading on the flat ground, not the strip's sideways slide, nor
   a ring of the strip joined at its ends, where the player could only
   lean toward what is in front («ходить мы хотим. иначе как он "карту"
   засеивать будет?»). The sun, its wash and the clouds belong to a
   heading, so the sun is the compass and no compass is drawn (the
   operator: a compass was the first thought, then the sun, «солнце у нас
   всегда на месте, что makes no sense»).

   **The contract is `docs/remove-before-merging/bite-12/step-spec.md`
   (2ace9d5), its recommendation taken on every open call** — read it
   whole before briefing. What it settles, in a line each: today's
   projection is already a pinhole written per row (`model/ground.ts`), so
   the true pinhole derived from its constants reproduces the opening
   frame exactly (a unit test and a play check); the walk's state lives in
   the scene as pure state like `pan.ts`, not in `Meadow`; bite 12's
   bounds are a glade disc, centre (0, 8), radius 12, sliding along its
   rim; no collisions — nearer than 2 units is hidden, farther than 13.33
   fades in at the hills' foot; keys turn 0.38 rad/s on every screen, a
   finger turns 1:1 with the glide, a walk is 1.6 units/s eased over
   0.25 s, the pan's cruise maths shared through `model/cruise.ts`; a drag
   locks its axis at the 24 px slop's crossing (within 45° of horizontal
   turns, else steps), a vertical drag chasing the finger no faster than a
   step, with no glide; hills drawn live from a 360° crest, redrawn only
   while turning; the sun its own small bake placed by heading, the wash
   on the sky only, one dip in the hills under the sun, clouds at
   headings; ground bands and grain fixed to the screen, mottles back as
   objects in 12b; haze by distance through a repaint queue capped at two
   a frame; a mushroom answers only where drawn (`fingerPad` goes, by the
   operator's idea-1 ruling); insects keep flying in the opening view's
   frame, drawn through a conversion, the sight rule down to the world
   edge; `+` grows only inside the wedge and on screen; a 3 px bob by
   distance walked and one soft step per 0.8 units, alternating sides.
   Packages: step 0 (pure model and types) alone, then P1 the ground on
   the plane, P2 the panorama, P3 walking in, disjoint by files, P3's
   wiring step after P1's and P2's first. **Bite 12 ends** with a child
   turning all the way round and walking anywhere in the glade, the sun as
   compass, the current meadow standing and tapping as before inside the
   wedge, bare ground behind.

   **Past the seam a thing goes behind the hills, not into a fade.** The
   spec's alpha fade from 12.3 would mist back-row mushrooms at the
   opening (the frame reaches D = 13.24; tablet seed 42 has one at alpha
   0.57), and a fade squeezed into 13.24–13.33 pops. A thing whose foot
   lies beyond `D_SEE` is drawn under the near hills instead, so they
   cover it from the foot up as it recedes, as a crest does; `fade`
   retires.

   **Two fixes from the operator's play, folded into the packages that
   own the files.**
   - **The planting spots are grass again (P1).** Bite 10 drew each bare
     tuft as a sprout round a closed pink bud, and capped them at
     `TUFTS_PER_1000PX` 6, so the ground's grass thinned and the meadow
     went noisy («заменил травинки "недоцветками"… выглядит так себе…
     слишком noisy… травинки были ок, и ок когда их было больше»). A bare
     tuft is drawn as a plain grass tuft, the seam's blades, and the
     ground carries plain tufts again at the density it had before bite
     10, **every one of them a planting spot** («ребёнок должен мочь
     посадить цветок где хочет… сделать каждую травинку потенциальным
     местом для цветка»): a tap nothing else takes lands on the nearest
     tuft in reach, which opens the picker. No tuft stands where no flower
     fits by bite 10's rules — beside a flower, under a cap — and one goes
     when something grows beside it («лучше просто убрать травинки где
     нельзя»), so no tuft ever refuses. The tuft the picker is open on keeps its cream glow;
     a planted flower takes its tuft's place. No bud anywhere.
   - **The keyboard plays only the flowers in front of you (P3).** A note
     or drum key sounds only through a flower in the current view with
     that pitch class or drum, and that flower answers as to a tap; with
     none in view the key is silent («"пианино" с клавиатуры не должно
     играть, если перед тобой нет подходящего цветка»). The note keeps
     the keyboard's octave, and the octave keys stay («передо мной 12
     цветков, по ноту на каждому, я хочу играть и переключать октавы»).
   - **A retap restarts a flower's answer (P1b).** A tap on a flower
     whose bounce is still playing starts it again from the top, as the
     sound already does («если второе нажатие до завершения анимации,
     анимация начинается заново»).
   - **A flower can be changed or removed (P4, after P1b and P3).** A
     tap on a flower only plays it; a long press — held ~0.45 s without
     moving past the slop, the note sounding at the press as a tap's does
     — selects it and opens the picker on it («да, давай так»: a picker
     on every tap would jump from flower to flower through a melody).
     The selected flower is marked by a small ring on the ground where
     its stem enters it, plainer than the mushroom's selection («попроще,
     чем гриб — например кружочком под цветком»). The picker: the colour row
     plus one button with a cross, then the shape row once a colour is
     picked; the pick replaces the flower in place, the cross removes it,
     its tuft coming back («при нажатии на цветок возникают снова кнопки
     цвета… плюс к кнопкам цвета одна кнопка с крестиком»). Seeded
     flowers too, so the model remembers the replaced and removed ones.
     The picker shuts, and the ring with it, on a tap on the meadow, as
     on a tuft; a long press on another flower moves it there.

   The decisions this rewrites — the one-drag pan, "every mushroom is a
   finger's target", the sight rule, bite 11's fixed sun, hill parallax,
   wash rule and hard ends — are rewritten in `decisions.md` at the
   bite's end, as the spec names them.
