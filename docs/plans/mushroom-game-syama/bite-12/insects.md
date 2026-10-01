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
