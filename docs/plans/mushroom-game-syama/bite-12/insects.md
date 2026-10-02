# Bite 12 — insects: release, size, pace, sink and cull

Bite 12's settled decisions on the insects, built, with what they beat. Moved verbatim from the plan's `## Rest of the bite`; a hand-over note's "item N" means the plan's old `**Left, in order:**` list, its items kept here with their numbers.

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
the strip, a release still flies in unseen — 12b's accepted case (the plan's 12b).
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

**Decided, from `lens-carry.md` round 2: a release whose brow start
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

## The veer play's bounds, and where the chase stopped

Moved from the plan's `## Rest of the bite`.

**Decided, from C's tabL play (`ip-jump.md`): a fly's one-frame step is
held to its own size**, and so is a bee's: `step / zoom` ≤ 1.1 × the dash
curve's own peak, derived from `insect-motion.ts` (a fly peaks ~65 butterfly
px a frame on tabL, a bee ~48), so a dash near the eye flicks up to ~100 px
drawn by perspective alone; only the butterfly, which never dashes, keeps
the width/20 drawn bound. The bound catches a discontinuity, not the design.
Beaten: a lower dash (every fly leg slower, against the catch test's
tuning); a drawn dash slowed by the zoom (the view re-timing legs the model
sets). Whether the dash reads too fast is the operator's play to judge.
**Corrected, from `ip-Cplay4.md`:** the ~65 / ~48 were the play's measured
peaks; the curve's own (`scripts/lib/veer-dash.ts`, sampling `flightPoint`)
is 41.6 / 23.5, and measured steps reach ~90 / ~58 on `away` legs and walking
frames. **Decided: the bound stays the curve's**, and a step the curve does
not explain is a defect to trace (`ip-Cplay5.md`: an `away` leg drawn toward
a side point recomputed each frame; walking frames counted as steps), not a
number to loosen. Beaten: binding to the measured peaks (writes the defect
into the check).
**Traced (`ip-Cplay5.md`, `scripts/veer-away.ts`): an `away` leg is
timed between one pair of points and drawn between another** — leaving, timed
to `places`' away point past the world strip but drawn to just past the
screen's edge (`offAloft`); a release's flight out of view, `outWay` with no
depth factor where `apartIn` has one; its next leg timed from `shownOf`'s
away point but drawn from the out point — so drawn/timed runs 0.4–2.1× and a
fly dashes ~90 px. **Decided: an away leg is timed between the plane points
it is drawn between** (the view's away points into `places`; `flight-in.ts`,
`flight-timing.ts`, `perch-sight.ts`, `insect-away.ts`), the rule a leg's
points are plane points already states. Beaten: leaving it (the cruise is
then a lie on every away leg). The play counts a late frame at a 60 fps
frame's share and leaves walked frames out. **Built** (007a1ec,
`ip-away.md`): leaving 0.95–1.12, out of view 0.91. **Decided: the release's
leg on from the out point to a far air spot (0.5–2.6, `apartIn`'s straight
layout measure) is accepted**, perch-to-perch legs in sight measuring
0.99–1.00. Beaten: timing every leg on its drawn path (a rework of `places`
for legs a child sees only as a speck going off). **The veer play's chase
stops here** — the checks had begun finding the checks — and these stay
known, for the review and the operator's play, not for another round: the
tabL bee's 57.7 px step; phoneP's fly never perching in view; phoneP's frame
median ~27.3 ms against 26; a release toward a shown perch timed from the
screen's edge (`shownOf`) but drawn from over the brow.
**Looking back the glade is bare by design** (12b makes the field endless),
so nothing grows at π; the veer play lands its looking-back releases at the
farthest heading with room (~1.8 rad on tabL, ~1.6 on phoneP).

## The insect plane's decisions

Moved from the plan's `## Rest of the bite`, where they were made.

**Re-decided, from `lens-carry.md` round 3: insects fly and are sized on the
plane, not in the layout.** The past-the-edge start did not hold: every leg
is flown in the layout (the opening eye's screen), and looking back the
screen shows only the layout's two far ends with the no-row wedge between,
so a leg across the screen runs through the meadow in front of the opening
eye and is drawn on 0 of 201 samples; and an insect is sized by its row's
distance from the opening eye, which falls to 0 looking back, so every
insect, a perched one too, shrinks toward the screen's middle (zoom 0.05–0.6
at π) while its cap keeps its size. Both are the layout standing in for the
world, which the lens and walking made wrong away from the opening; the
0.76% release was the symptom. So a leg's points are plane points, and an
insect's drawn size is its own size over its distance from the eye.
Beaten: sizing by distance alone (fixes the size, not the legs through the
meadow); a zoom floor (a tenth-size insect, the bound beaten in the
round-2 decision above); the
past-the-edge patch alone (`lens-carry-round3.patch`, never seen with no
perch shown). A spec first (`insect-plane.md`), then build packages.
**Decided, with the operator: an insect's size at the opening goes by its
distance too** («ну да, а звучит хорошо»), so the opening's equal sizes go:
a release over the brow at 0.65× today's, perched insects 0.65× on the back
caps to 1.1–1.5× near the front, each in scale with its cap and the brow.
Beaten: sizing by distance from the plane's origin (today's sizes at the
opening, but a perched and a flying insect at one distance differ, and
sizes drift as the child turns).
**Decided, with the operator: a leg veers round the eye** («да, 1 — ок»)
at the distance where an insect's zoom reaches today's `V_NEAR` value
(~1.7×), so a fly passes the child's ear rather than through his head and
never fills the screen. Beaten: a zoom cap on a straight leg (a flat sticker
sliding across the screen).
**Open with the operator's play: flies and bees still fly «неприлично
быстро» on a long leg.** `dash-cap.md` caps a dash at the kind's dash
across the screen it flies on, which is still ~3 screens a second for a
fly and ~1.8 for a bee on the tablet, and a long leg always reaches the
cap. The cause is `paced` (`flight-timing.ts`): a leg's time is the kind's
`flying` time stretched with its strides only up to `slowest`, so past that
every longer leg takes the same time and flies faster. The operator: «а
почему они вообще должны летать тем быстрее, чем больше путь? вроде в жизни
муха летит себе и летит». **Decided: a leg's time is its length at the
kind's own cruise**, a speed per kind set by play — to start, today's
median-leg speed on the tablet (fly ≈ 7, bee ≈ 4.6 butterfly sizes a
second; the butterfly as today) — with no ceiling, so a long leg simply
takes longer; a fly's darting stays a fixed burst shape within that time,
never a speed-up for distance. Timed by the leg's length as drawn
(`Places` carry each perch's depth), so the seen speed holds at 1.0–1.1×
the cruise at any depth (`insect-plane.md` R2.4). Beaten: a `stride` per
`flying` time (≈ 1 size a second for every kind, a fly 20 s across the
tablet); halving the dash cap (still faster the longer the way); leaving
it (the complaint stands). **Decided, with the operator: `ARRIVAL` goes**
(«убрать»): a tapped release's first leg to a perch on screen flies at the
kind's cruise like any other, so a far flower may take 3–4 s, calmly.
Beaten: keeping the 1.5 s cap (a release to a far flower races).
**The veer play is closed** (§ "The veer play's bounds" above): the dash bound is the curve's own peak, away legs are timed
between the points they are drawn between (007a1ec), and four reds stay
known for the review and the operator's play, not for another round.
