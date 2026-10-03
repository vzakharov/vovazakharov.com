# Bite 14 — spec: insects shelter under the caps while it rains

Research for the orchestrator. Paths are under `src/pages/mushrooms/`.
Line numbers are as of `claude/mushroom-game-syama-lbirv7` at this spec's commit.

## 1. The map

**Choosing a leg (model).**

- `model/flight.ts` — `Perch` (l.64–82): `flower | cap | air` by id,
  `away` by side. `Sight` (l.116–134) is what the scene hands in;
  `Perches = Sight & { caps, spotted }` (l.140). `nextPerch` (l.230–271)
  picks a perch: a flower `flowerShare` of the time, otherwise a cap,
  weighted by `spottedPull`; a fussy kind may roam instead; with nothing open
  it settles where it sat or roams (`roamFrom`, l.188, which weights air
  spots by `apartIn(places, from, perch)` and the kind's `stride`). Every
  leg draws from a stream of its own, seeded by `legRandom(seed, legs)`
  (l.168), so **a new branch must draw nothing while it is not raining**:
  if it did, every flight and the expectations of `fliers.test.ts` would
  shift. `firstFlight` (l.286) is a release; it narrows the perches to what
  is on screen through `shownOf`. `onward` (l.329) is the next leg;
  `nextFlight` (l.348) and `flightAway` (l.364) are its two callers.
  `isOffered` (l.382) is an exhaustive switch over perch kinds.
- `model/flight-habits.ts` — `Habits` (l.21–52) and `FLIGHT_HABITS`
  (l.74–117). A bee has `resting: undefined`, so today it never sits on a
  cap.
- `model/flight-timing.ts` — `legTo` (l.171) times a flight by distance at
  `cruising`, never shorter than its `flying` draw, with `dashing`. `stayAt`
  (l.124) is exhaustive, and **throws on a cap for a kind with no
  `resting`**.
- `model/perch-room.ts` — "never two to a perch": `blockedFor` (l.41)
  blocks a taken perch and any perch crowded by one (`Crowding`), and
  `keptForBees` (l.88) keeps flowers for bees. `isSamePerch` (l.14) and
  `perchName` (l.24) key on kind and id. `isSeat` (l.134) is true for flower
  and cap only.
- `model/insects.ts` — `released` (l.122), `startled` (l.160) and `ticked`
  (l.214), all called from `game.ts` with **the whole `meadow` as the swarm
  argument** (game.ts l.401, 408, 430). `isDue` (l.193) decides when a flier
  takes its next leg: when its stay is over, or **at once, even mid-flight,
  when its perch is no longer offered** (l.200, before the `now < arrives`
  guard). That is the existing path for re-targeting a flier in the air.
- `model/game.ts` — `perchesOf` (l.214) builds `Perches` from the meadow and
  the `Sight`. The `rain` case (l.419) keeps `startedAt` while it rains and
  pushes `stopsAt` on. The `tick` case is l.428.

**The clock.** `now` is the scene's `time` in ms (meadow-scene.ts l.195–199,
which dispatches `tick` every frame along with `sightNow()`). A flier's
decisions see `now` only in `isDue`, and through `legTo` as `departs`.
`model/weather.ts`'s `raining(rain, now)` (l.24) works on that same clock,
so the model can decide shelter without asking the scene for anything.

**The scene's perches.**

- `ui/scene/perch-sight.ts` — `perchSight` (l.183) builds the `Sight`, on
  every fresh anchor (`Perches.see`, perches.ts l.64). It offers a cap
  within `PERCH_REACH` of the snapped anchor (l.204) — that is how a perch
  stays clear of the world's edge. `seaterOn` (l.106) gives a seat point per
  perch kind; a cap's seat is `capSeat(genes, spot)` placed by `placedAt`
  (l.125–132). `trackOf` / `seatsWith` / `crowdings` turn seats into
  `Crowding` pairs, with `MOST_OVERLAP` 0.25 (l.55). `places` holds each
  perch's `x, y` in butterfly sizes plus `fromEye` (l.231–240).
- `model/mushroom-pose.ts` — `capFrame` (l.73) maps the cap's own frame
  (origin at the middle of its underside, y up) into the mushroom's.
  `capSeat` (l.88) is the seat on top. For a dome, `capBase` (from
  mushroom-profile.ts l.183) is 0: **the underside is the line y = 0 in the
  cap frame.** A chanterelle has a front rim and a funnel, and nothing to
  sit under.
- `ui/scene/mushroom-bed.ts` — `capTop(id, across)` (l.268–279) is the
  seat as drawn this frame. It follows the cap's breathing, wobble, swell
  and sinking through `graphics.scaleX/Y/rotation`, and returns a `Seat`
  (`perch-hosts.ts` l.17: `Point & { on: Host; drawn; nectar? }`). A `Host`
  (bed-place.ts l.117) is a placed thing with `stands`, `foot`, `opening`
  and `laidFoot`. **The file is 427 lines.**
- `ui/scene/perch-hosts.ts` — `perchedOn` (l.47) and `tapThrough` (l.84) are
  exhaustive switches. `perches.ts`'s `Perches.at` / `tapThrough` call them.
- `ui/scene/insect-view.ts` — `fly` (l.184): `perched = isSeat(leg.to)`
  (l.217) decides landing, bob, fidget and the sitter's draw.
  `insect-seat.ts`'s `drawnSitter` draws a sitter at the host's seat, at
  `seatedZoom`. **Every insect on this side of the brow is drawn at one
  depth above the whole meadow** (`above`, insect-sink.ts l.46). A sitter is
  therefore drawn over its own cap and over any nearer mushroom.
- `ui/scene/air-spots.ts` — the lattice of hover spots round the eye. It has
  at least as many spots as all the kinds' limits together.
- `model/flight-in.ts` — `shownOf` (l.148) filters perches by kind to those
  on screen. It names `flower`, `cap` and `air` explicitly, so a new kind
  needs its own line.
- Exhaustive `Perch` switches that a new kind breaks at compile time:
  `flight.ts isOffered`, `flight-timing.ts stayAt`, `perch-hosts.ts`
  (twice), `perch-sight.ts seaterOn`, and **`scripts/lib/mushroom-probe.ts`'s
  `PERCHES` zod schema (l.491–498, `satisfies` per `PerchKind`)**.
  `scripts/lib/flier-watch.ts` l.236 lists seat kinds by hand.

**Sizes on a phone.** Bite-13 frame `phoneP-rain-3s.png` (390 CSS px wide):
each opening cap is about 77 CSS px wide, the stem about 15 px wide and
about 100 px from gills to grass. A butterfly is painted at least 60 px
(`INSECT_LEAST`), and its open wings span at least 52 px (`LEAST_SPANS`). A
fly is about 0.55 of that and a bee about 0.65. Under the rim beside the
stem there is about 30 px a side. On a tablet a butterfly is 0.3 of the
clump's unit against caps of 0.72–1 unit, so there is room to spare.

## 2. What "under a cap" is here

Three readings:

- **(A) A seat beneath the rim, beside the stem, chosen.** The insect's
  middle sits just below the underside, at `x = ±s · capWidth/2` in the cap
  frame (s ≈ 0.55, clear of the stem), and drops by about half the insect's
  painted height so its top meets the gills. It faces up the screen, as every
  sitter does (`restTurn`). Because the insect is drawn above the meadow, it
  is drawn over the stem and under the rim's line. On screen that reads as
  tucked under the mushroom, and it does not cover the cap.
  - Cost: one new pure function `capUnder(genes, side)` beside `capSeat`.
    The drop is in the insect's own size, so the seat needs the host zoom and
    the insect zoom separately, as `flower-seat.ts`'s `flowerLiftAt` /
    `SeatZooms` already does.
  - Keep it off the stem's front, so the door and the mouse's peek stay
    clear.
- **(B) Hanging upside down under the gills.** Best for the eye, but it needs
  a flipped rest pose in `insect-look` and `insect-motion`, and it fights
  `REST_LEAN` and the flier watch's `worstRest`. That is too much for this
  bite.
- **(C) Hovering under it**, as cap-bound air spots. The air spots are a
  lattice round the eye, so cap-bound spots would be a new kind of air spot.
  A hover is drawn still (an open issue), and a hover does not read as
  shelter.

**Seats per cap: two, left and right of the stem.** On a phone the two
butterflies' spans sit about 42 px apart; with spans of 52 px or more they
overlap by roughly 20%, which is under `MOST_OVERLAP`. The existing
crowding check decides from the geometry which seats can be filled
together, so nothing is hand-tuned. On a tablet both seats always fit. The
two inner seats of the opening clump, where the stems cross, will often
crowd each other, so expect 3–4 shelter seats at the opening.

**Chanterelles offer no shelter.** The funnel has no roof (`HEAD_KIND`
trumpet). Syama's spec, as the plan quotes it, says only "sends the insects
under the caps" (decisions.md l.59–60), so nothing more is drawn from it.

## 3. The calls

1. **How the perch is typed.**
   - (a) A new perch kind `shelter: WithId & { seat: 0 | 1 }`, whose id is
     the cap's id. `perchName` becomes `shelter <id> <seat>` and
     `isSamePerch` compares names. **Recommended.**
     - The compiler then finds every switch (six in `src`, plus the probe's
       schema).
     - It keeps "never two to a perch" per seat, so a butterfly can sit on
       top while two shelter underneath.
     - The cost is about 10 small edits.
   - (b) Reuse the `cap` kind with a flag on the leg.
     - That allows one insect per cap in total.
     - Places and crowding would mix up the top seat and the seat underneath.
   - (c) Air spots under caps (§2 C).
2. **How the model learns of the rain.**
   - (a) **Recommended.** Widen the swarm argument of `released`,
     `startled` and `ticked` to `Swarm & { rain?: Rain }`.
     - `game.ts` already passes the whole meadow, so **`game.ts` is not
       edited at all**.
     - Inside, `shelteredPerches(perches, rain, now)` works as follows:
       - while `raining`, it offers no flowers, no cap tops and the
         `shelters` the scene sights;
       - otherwise it offers no shelters.
   - (b) Add `rain` to `perchesOf` in `game.ts`. That collides with the
     sprouting package.
3. **Which cap is "nearest", and nearest to what.**
   - (a) **Recommended.** Nearest to the insect: the open shelter seat with
     the least `apartIn(places, from, seat)`, with no draw from the stream.
     The child sees each insect dart to the mushroom beside it.
     - Build detail: in `onward`, apply `placesSetOff` **before** choosing,
       so a flier caught mid-flight measures from where it is drawn, not
       from its destination.
   - (b) Nearest to the eye. Everything would mob the front clump in long
     flights.
   - (c) Weighted by `stride`, as `roamFrom` does. That is softer, and less
     legible as cause and effect.
4. **How many insects per cap.**
   - (a) **Recommended.** Two seats per cap; the crowding check decides which
     can hold insects together, and "never two to a perch" holds.
   - (b) A huddle: three seats, with shelter pairs allowed to overlap 0.5.
     More of the ten fit, but it breaks the standing "fliers kept apart where
     they sit".
   - (c) One seat per cap.
5. **No shelter open, or none in sight.**
   - (a) **Recommended.** Roam the air as today (`roamFrom`), looking again
     at the end of each hover. Planting more mushrooms buys more shelter,
     which fits "the meadow only gets fuller".
   - (b) As (a), but in rain weight the air spots toward the nearest
     shelter, so the left-out insects wait beside a cap. That is one extra
     distance per spot per leg, and is the fallback if the frames read as
     "they ignore the rain".
   - (c) Leave over the brow and come back when it stops. Rejected: it loses
     insects for the length of the shower, and the limit bookkeeping would
     have to remember them.
6. **A bug button pressed while it rains.**
   - (a) **Recommended.** It flies in over the brow straight to an open
     shelter on screen; `shownOf` gains a `shelters` line. With none open,
     it roams.
   - (b) Refuse it with a head shake. That contradicts the rule that no tap
     is shrugged off.
7. **A tap on a sheltering insect.**
   - (a) **Recommended.** The insect startles out to the nearest *other*
     open shelter. With none, it hops into the air and comes back when that
     hover ends, because the seat it left is free. The tap goes through to
     the cap, which wobbles and is selected (`tapThrough`'s `shelter` case
     calls `bed.tap(id)`).
   - (b) It settles back at once (`settles`). That reads as a twitch.
8. **Insects already on flowers, caps or in flight when the rain starts.**
   - **Recommended:** `isDue` gets one more rule. While
     `raining(rain, now)`, any leg that departed before `rain.startedAt` and
     is not a shelter leg is due **now**, even mid-flight, through the path
     `isDue` already has for a perch that is no longer offered.
     - Legs chosen during the rain keep their normal stays, so the rule
       cannot fire over and over and thrash.
     - Restarting a running shower keeps `startedAt` (game.ts l.422), so it
       sends no second dash.
     - A new shower after a stop dashes everyone again.
   - A bee leaving a pollinated flower at the dash plants its flower as
     usual (`tookOff`). That is accepted.
9. **How fast they head for shelter.**
   - (a) **Recommended.** A per-kind `sheltering` pace in `Habits` for the
     leg to a shelter only. The butterfly roughly doubles its cruise (about
     2 sizes a second) and gets a dash of `{ time: 0.3, way: 0.6 }`; the fly
     and the bee keep their own pace, which is already quick.
     - A butterfly across a phone gets under cover in about 1.5–2.5 s, so
       the drops starting and the dash read as one event.
     - Cost: three numbers per kind, and `legTo` reads them when
       `to.kind === 'shelter'`. Catching an insect in a shower matters less
       than its usual tap-catch bound.
   - (b) Normal habits. A butterfly then takes 3–6 s, and the cause is lost.
   - (c) An instant dash for every kind. That risks the flier watch.
10. **Leaving when the rain stops.**
    - (a) **Recommended.** Staggered.
      - A shelter leg's `leaves` is `rain.stopsAt + linger(seed)`, where
        linger is about 300–2500 ms taken from the insect's phase. They come
        out one by one as the rainbow rises.
      - While it rains, `ticked` re-times a shelter leg whose `leaves`
        falls before the current `stopsAt + linger`. The leg count stays the
        same, so the scene sees no new leg.
      - When `leaves` passes, the next leg is the ordinary `nextPerch`:
        back to their habits.
      - Bees need a `stayAt` case for `shelter` that does not read
        `resting`.
    - (b) All at once at `stopsAt`. It reads as mechanical, and puts ten
      legs on one frame.
11. **Small and growing caps (the sprouts).**
    - **Recommended:** a cap offers shelter only when it is wide enough for
      a butterfly, `capWidth · size ≥` the widest butterfly span on that
      layout. In the frames, a butterfly under a cap smaller than itself
      reads as silly.
    - A cap still growing offers neither a top seat nor a shelter seat. The
      sprouting package should exclude unfinished sprouts from `perchSight`'s
      caps, and shelter inherits that.
12. **Draw order (carried, not fixed).**
    - (a) **Recommended.** Keep the one depth above the meadow: a shelterer
      on a far mushroom draws over a nearer one, as cap sitters do today.
      Add it to to-check.md.
    - (b) Draw a shelterer at its host's depth plus a little. Then it pops
      behind a nearer cap at the moment it lands.

## 4. Risks to standing invariants

- **The flier watch** (`flier-watch.ts`).
  - A mid-flight re-target at the dash is the existing "perch withdrawn"
    path. A faster butterfly reversing course could still break
    `MOST_HEADING_OFF` 150 ms into a leg, or `MOST_SPIN`.
  - Run `pnpm play:mushrooms --plays rain` with fliers released before the
    tap. If it goes red, lower the butterfly's hurry before touching the
    watch.
  - l.236's seat list gains `shelter`, so `worstRest` judges shelterers too.
- **`fliers.test.ts`.** No existing case rains, and the stream rule (§1)
  keeps every case's flights identical. Extend it:
  - `visit-play.ts` gets `rains?: readonly number[]`, dispatching
    `{ kind: 'rain', now }` at those times.
  - A new `describe('a shower')`, on tabL and phoneP over the first three
    seeds, a 40 s visit with rain at 10 s:
    - no two sitters crowd, and nobody leaves;
    - after `startedAt` plus the dash bound, no flier sits on a flower or a
      cap top, and every flier is in a shelter or in the air;
    - more than half are sheltering where the seats allow;
    - after `stopsAt + LINGER_MAX` plus a flight, no flier is in a shelter.
  - That keeps the cost far below the 5-minute visits.
- **Leg timing in the drawn frame** (`flight-frame.ts`).
  - Shelter places come from `perchSight` exactly as cap places do (`x, y,
    fromEye`), so `pairFramed` / `placesSetOff` treat them the same.
  - The seat drawn under the cap sits about one cap height lower than the
    place used to time the leg, if the place is taken from `capSeat`. Take
    it from `capUnder`'s own seater.
- **`PERCH_REACH`.** Shelters are offered only for caps already passing
  `inReach(foot, anchor)` (perch-sight.ts l.204), so they are clear of the
  world's edge by construction. `perch-sight.test.ts` should assert it.
- **The 26 ms frame budget.**
  - Two single-point tracks per cap in reach (about 12–20 caps) add about
    25–40 seats to `crowdings`' O(n²) pairs. That is paid at `see`, on a
    fresh anchor, not every frame.
  - The walk's re-sight is already about 18 ms median, mostly in `airOf`.
    Measure with `__probe.costs()` on the approach play.
  - The dash frame takes ten `nextFlight` calls once.
- **The probe schema** (`mushroom-probe.ts` `PERCHES`) fails to type-check
  until `shelter` is added. Do it in the same step as the kind.
- **Taps:** `tapThrough` on a shelterer reaches the cap, not its door. The
  side seats keep the door uncovered.
- **Tests to add:**
  - `model/shelter.test.ts`: `shelteredPerches`, nearest seat, linger,
    re-timing.
  - `mushroom-pose.test.ts`: `capUnder` is below the underside and outside
    the stem.
  - `perch-sight.test.ts`: two seats per dome cap, none for a chanterelle or
    a cap too narrow, places and crowdings present.
  - `insects.test.ts` / `swarm.test.ts`:
    - the rain start makes legs due mid-flight;
    - a release in rain goes to a shelter;
    - a startle goes to another shelter;
    - nothing changes without rain.

## 5. The cut, for one build agent

**Step 1 — the model.** It type-checks and tests on its own; the scene
offers no shelters yet, so nothing changes on screen.

- `model/flight.ts`: the `shelter` kind, `isOffered`, the rain branch in
  `nextPerch` that calls `nearestShelter`, and the `placesSetOff` reorder in
  `onward`. flight.ts is 413 lines, so the logic itself goes in the new file.
- `model/perch-room.ts`: `perchName`, `isSamePerch`, `isSeat`.
- `model/flight-timing.ts`: `stayAt` and the shelter pace.
- `model/flight-habits.ts`: `sheltering`.
- `model/flight-in.ts`: `shownOf`.
- `model/insects.ts`: `rain?` on the swarm, the dash rule in `isDue`, and
  re-timing.
- New `model/shelter.ts` and `model/shelter.test.ts`.
- `Sight` gains `shelters?: readonly ShelterSeat[]`.
- `scripts/lib/mushroom-probe.ts` `PERCHES`.
- The switches in `ui/scene/perch-hosts.ts` and `perch-sight.ts`, returning
  `undefined` for `shelter` so it compiles.

**Step 2 — the scene and its checks.**

- `model/mushroom-pose.ts`: `capUnder` and its tests.
- `ui/scene/perch-sight.ts`:
  - shelter seaters, single-point tracks;
  - `shelters` in `Sight`, only for domes wide enough;
  - places.
- `ui/scene/perch-hosts.ts`: `perchedOn` and `tapThrough`.
- `ui/scene/mushroom-bed.ts`: generalise `capTop` into one seat method
  taking a local point, **only within l.261–279, net ≤ +8 lines**.
- `scripts/lib/flier-watch.ts` l.236.
- `ui/scene/visit-play.ts` `rains`, and the `fliers.test.ts` shower case.
- `scripts/lib/play-rain.ts`: a frame mid-shower with fliers released
  before the tap, and a probe count of sheltering fliers.
- Hand checks in `to-check.md` (draw order, §3.12).

**Not to collide with sprouting.** Sprouting owns `model/game.ts` (the
`tick` case and `Meadow`), `model/placement.ts`, and the growth drawing in
`mushroom-bed.ts`.

- Shelter edits **nothing in `game.ts`** (§3.2 a).
- In `mushroom-bed.ts`, shelter touches only `capTop`'s block. The two
  packages together must keep that 427-line file under 450, so whoever lands
  second moves code out rather than past the cap.
- If sprouting adds a "still growing" flag, `perchSight` reads it to
  withhold seats (§3.11). Agree on that one predicate before step 2.
