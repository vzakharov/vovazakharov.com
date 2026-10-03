# Bite 15 — spec: the window worms (package `worms`)

The operator's ask 3 (`mushroom-game-syama/bite-14.md` § "From the operator's
play — for item 15"): «есть ли какая-то интерактивность с окошками? если нет,
предлагаю червячков -- бегут из одного окошка в (если есть) другое на том же
грибе. если нет -- как и мышка выглядывают и прячутся обратно». A tap on a
window brings a worm out of it; it crawls over the cap into another window of
the same house, or, with none, peeks out and hides again as the mouse does.
Paths are under `src/pages/mushrooms/`.

## What stands today

- `model/house.ts`'s `windowSlots(genes)`: up to five middles in the cap's
  frame (`capFrame`, y up), ordered middle, then left/right pairs, a pitch of
  `2 × PANE` (`PANE` 0.1 of the mushroom's size). A dome's row stands at
  `slotLevel` (0.3 of the cap's height); a chanterelle's just under its front
  rim, dipping with `frontSag`. Windows only ever go in; none comes out.
- `ui/scene/house-view.ts`'s `HouseView`: one Graphics per mushroom, standing
  just in front of it and taking its pose (scale, rotation) every frame, so
  it wobbles, swells in rain and sinks with it. Its hit area is the door
  alone (`doorHitArea`, ≥ `TAP_RADIUS`, the nearest door of all houses
  winning through `tappedDoor`); a tap there sets `mouse.tappedAt` and
  squeaks, and nothing else — no wobble, no spore, no select, a picker left
  open. A tap on a window falls through to the mushroom (`MushroomBed.tap`:
  wobble, puff, boing, `select` with a spore).
- The mouse's peek is pure clock (`model/motion.ts`: `outAndBack`, `peek`,
  `peekAfterTap`, `mouseOut`, `lookAbout`); its tap time lives in the scene.

## Calls

1. **A window tap answers with the worm alone.** It replaces the mushroom's
   tap — no wobble, no puff, no spore, no select, an open picker left open —
   exactly as the door's does. _Beats_ "worm plus wobble": the cap the worm
   rides would rock under it, the spore puff covers the window it comes out
   of, and a dropped spore would read to a six-year-old as what windows give.
   One tap, one answer, in the place the finger was. The mushroom keeps its
   tap everywhere off the windows' reach (call 2).
2. **A window takes a tap on its pane and a little round it: a circle of
   `max(the painted pane's half-diagonal + ink, WINDOW_REACH)`, with
   `WINDOW_REACH = TAP_RADIUS / 2` (16 px), clipped to the cap as drawn**
   (`shown.hit.cap`); within one house, of the door and the windows holding
   the finger the nearest middle takes it (`tappedDoor`'s rule, reused as it
   stands — `DoorTarget` is any `Point & holds`). _Beats_ a full
   `TAP_RADIUS` floor: five 32 px circles cover a small cap's whole face, and
   with the door's circle on the stem a housed small mushroom could no longer
   be selected, which the house button and `−` need. A finger that misses a
   window by a hair still gets the mushroom's wobble — no dead tap. **This
   departs from `decisions.md`'s "every target at least ~64 CSS px"**; the
   window is a detail of a target (the cap) that stays ≥ 64 px. Measured on
   the probe (§ Play and probe); if the frames show windows missed, the
   alternative is `TAP_RADIUS` with the reach clipped to the row's band.
3. **The worm goes to the window farthest along the row from the one tapped;
   a tie (the middle one tapped) goes left on even trips, right on odd.**
   The house counts its trips. _Beats_ nearest: a neighbour is one pane's
   width of cap away (~20–40 px on a tablet), a twitch, not a crawl. _Beats_
   random by seed: random picks the neighbour as often, and the farthest
   window is the one that carries the worm over the cap the operator asked
   for. _Beats_ "next in the row": the slots are ordered from the middle out,
   so "next" is an arbitrary jump. With one window: the peek (call 5).
4. **The path, in the cap's frame, sampled once per trip as a polyline.**
   - **A dome: an arch on the cap's face** from slot to slot, its height at
     each `x` lifted from the row level toward `capSurface(x) − girth −
MUSHROOM_INK` by `sin(π s) × lift`, `lift` growing with the span
     (`|Δx| / capWidth`, capped at `WORM_LIFT` ≈ 0.8) — end to end it climbs
     near the crown, to a neighbour it humps. _Beats_ the silhouette
     (`capSurface` itself): half the worm against the sky and the haze, its
     ink against two grounds; and _beats_ the flat row, which slides rather
     than climbs.
   - **A chanterelle: along the row**, at `slotLevel(x)` — so it rounds the
     funnel's face under the rim and dips at the middle with it — humped by
     half a pane and kept under `capBase(x) − girth`. The face is too narrow
     to arch; over the rim is the funnel's inside.
   - `slotLevel` becomes exported from `model/house.ts` (one keyword).
5. **The clock: a pure function of the time since the tap and the path's
   length**, in `model/worm.ts`, seconds, mushroom-size units. A trip:
   _out_ `WORM_OUT` 0.25 s (the head grows out of the pane's middle to a
   body's length), _crawl_ `length / WORM_PACE` (`WORM_PACE` ≈ 0.35 units/s,
   the duration clamped to 1.2–3 s), _in_ `WORM_IN` 0.3 s (the body slides
   into the far pane), then nothing. The crawl **inches**: per
   `INCH_PERIOD` 0.45 s the head goes forward while the tail holds, then the
   tail catches up — the body's length breathing between 1 and ~0.65.
   The peek (one window): straight up out of the pane by a body's length,
   `outAndBack(elapsed, 0.18, 1.0, 0.3)`, its head turning by `lookAbout` —
   the mouse's own pieces, reused, not copied.
6. **Drawn as five round segments along the path**, from `wormBody(path,
pose)` (circles in the cap's frame, head largest, tail tapering), the
   head with one eye (`mouseEye`); a segment still behind the pane's middle
   is not drawn, so the worm grows out of the window and sinks into the
   other. **Its girth is sized to its window** (as ask 2 sizes the mouse to
   its door): `0.3 × PANE` of the mushroom's size, floored at
   `WORM_GIRTH_LEAST` 5 px so an eye reads it. Painted by a new
   `ui/scene/draw-worm.ts` after the windows, before the door, through the
   house's brush (haze, lighting, `inkFor`). Inks: `CREATURES.worm` (a pale
   earthworm pink, standing off the fly agaric's red and the chanterelle's
   apricot by its ink) and `wormBand` (the deeper saddle band), each with a
   row in `palette-creatures.test.ts`.
7. **A second tap mid-trip wriggles the worm and leaves its course.** One
   worm per house: a tap on any of its windows while it is out shakes its
   body for 0.3 s (a sideways wave in `wormBody`) and plays the sound at
   half level; once it is in, the next tap starts a new trip from the window
   tapped. _Beats_ restarting (the worm would jump back — a pop, the one
   thing the clock functions exist to prevent) and a second worm (two bodies
   tangled on a five-window row, and twice the state).
8. **A window put in mid-trip changes nothing**: the trip's two windows and
   its path are fixed at the tap, and windows only go in, so its target never
   goes. The new window pops in under the path, the worm painted over it.
9. **The cap sinking (`−`) takes the worm with it**: it is painted in the
   house's Graphics, which sinks with the mushroom and is `disable`d at once,
   so no window takes a tap. Wobble and the rain's swell carry it the same
   way. Nothing to add.
10. **Rain brings the worms out** — the meadow's ecology shown, never taught,
    and the real thing: while the scene's wetness is at least `WORM_WET`
    (0.5), each house with windows makes a trip on its own every
    `WORM_RAIN_PERIOD` (5–9 s, its phase picking where in the range), from
    the window after its last trip's start, silently. In dry weather a worm
    comes only to a tap. _Beats_ worms on their own always (five windows
    peeking on every cap fight the mouse and the insects for the eye, and a
    worm the child did not call teaches nothing about the tap) and rain
    changing nothing (the one moment a worm would come out of its own
    accord). Last and droppable (step W5).
11. **Sound: `MeadowSound.wriggle(level = 1)`**, a soft "pip-pip" — two short
    sine blips rising (≈ 700→1000 Hz, 0.06 s each, gain ≈ 0.1) through
    `sound.ts`'s `tone` — at the tap only; the dive into the far window is
    silent. Distinct from the mouse's squeak and the cap's boing, so the
    child hears which she touched.
12. **Scene-only, like the mouse.** The worm's trip (`tappedAt`, `from`,
    `to`, `path`, `trips`, `wriggledAt`) lives on `HouseView`; nothing goes
    into `Meadow` or `reduce`. _Beats_ model state: no rule reads it, it is
    gone in three seconds, and a dispatch per window tap would send every bed
    through a reconcile for an animation. What can be pure is: `model/worm.ts`
    holds the path, the target, the clock, the body and the rain's timing,
    Phaser-free and under `node:test`.

## Steps

Each step lands its tests and `pnpm typecheck`, then commits and pushes.

- **W1 — the worm's model.** New `model/worm.ts` + `model/worm.test.ts`;
  `model/house.ts` exports `slotLevel` (one keyword). Exports
  `wormTarget(slots, count, from, trips)` (index or `undefined` → peek),
  `wormPath(genes, from, to)`, `wormTrip(elapsed, length)` / `wormPeek(elapsed)`
  (head and tail arc positions, or the peek's rise; `undefined` once in),
  `wormBody(path, pose, wriggle)` (circles), the constants. Tests: the target
  for 1–5 windows from each slot, ties alternating; the path starts and ends
  on the slots, stays on the face for every species over the sweep's seeds
  (`capSurface`, `capBase`); the clock continuous across its phases, ending
  at `undefined`, its duration within 1.2–3 s plus out and in; the body's
  head never behind its tail. Imports only `outAndBack`, `smooth`,
  `lookAbout` from `motion.ts`.
- **W2 — a window tap, drawn and heard.** New `ui/scene/window-reach.ts` (+
  test: the area holds the pane, floors at `WINDOW_REACH`, clips to the cap,
  the nearer of door and window takes an overlap); new `ui/scene/draw-worm.ts`;
  `HouseView` takes window taps (call 2), holds the trip, repaints while the
  worm is out; `draw-house.ts`'s `paintHouse` gains a trailing optional
  `worm`; `palette-creatures.ts` (+ its test) the two inks; `sound.ts`
  `wriggle`. Owns those files' named parts (§ Collision list).
- **W3 — probe and play.** `scripts/lib/mushroom-probe.ts` (§ Play and
  probe); new `scripts/lib/play-worms.ts`, called from the end of
  `play-house.ts`'s `playHouse` (one line). Runs
  `flock … pnpm play:mushrooms --plays meadow --screens tabL` and `phoneP`.
- **W4 — look at the frames.** A separate agent reads W3's frames on tabL and
  phoneP against calls 1–7 and the six-year-old's eye — the worm read at
  the floor girth, the arch on the face, the inching visible, the window it
  goes to plain — and tunes constants only in `model/worm.ts` and the inks;
  anything more is reported, not built.
- **W5 — rain's worms (droppable).** `model/worm.ts` gains
  `rainTripDue(t, phase, lastAt)` (+ test); `HouseView.update` takes the
  wetness; `mushroom-bed.ts` passes it (≤ +3 lines, its `update` only); the
  probe's `worm()` reports a rain trip; `play-rain.ts` asserts one worm out
  during the shower and keeps a frame.

## Collision list (with `runs`)

| File                                         | `worms` touches                                                                                                                                                                                                                                                                                                                                               | `runs` keeps                                                                                             | Net-line grant                                                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `ui/scene/house-view.ts` (243)               | the constructor's `setInteractive` and pointer-down handler, rewritten to `takes(x, y)` / `answer(pointer)`, which dispatch to `tapDoor()` — the door's present body moved verbatim — or `tapWindow(index)`; new fields and methods for windows and the trip; `update`'s early-return gaining the worm; `paint`'s `paintHouse` call gaining its last argument | `tapDoor()`'s body, `doorMiddle`, `holdsTap`, `out`, `paint`'s `door` block and `shownHead`, `drawnHead` | worms ≤ +55 (W2) and +6 (W5). Whichever lands second and would pass 445 moves code out first (the trip into a `house-worm.ts`) |
| `ui/scene/draw-house.ts` (303)               | `paintHouse`'s signature (a trailing optional `worm`) and one call after the window loop                                                                                                                                                                                                                                                                      | everything from `if (!door …` on, `paintDoor`, `doorFrame`                                               | worms ≤ +6                                                                                                                     |
| `model/house.ts` (322)                       | `slotLevel`'s `export`                                                                                                                                                                                                                                                                                                                                        | the door's stations and sizes                                                                            | worms +0                                                                                                                       |
| `model/motion.ts` (338)                      | nothing — imports only                                                                                                                                                                                                                                                                                                                                        | its own run clock                                                                                        | —                                                                                                                              |
| `ui/scene/mushroom-bed.ts` (429)             | W5 only: the house's `update` call in `update`                                                                                                                                                                                                                                                                                                                | `nearestDoor`, the bed's door-to-door lookups, the rest                                                  | worms ≤ +3; runs ≤ +12                                                                                                         |
| `ui/scene/meadow-scene.ts` (450)             | nothing                                                                                                                                                                                                                                                                                                                                                       | as it needs, net 0                                                                                       | worms 0                                                                                                                        |
| `ui/scene/sound.ts` (354)                    | `wriggle` after `knock`, its tone after the knock's                                                                                                                                                                                                                                                                                                           | anything after `squeak`                                                                                  | worms ≤ +12                                                                                                                    |
| `ui/scene/palette-creatures.ts` (150) + test | two keys after `mouseEye`, two test rows                                                                                                                                                                                                                                                                                                                      | —                                                                                                        | worms ≤ +6                                                                                                                     |
| `ui/scene/door-reach.ts`, `draw-mouse.ts`    | nothing                                                                                                                                                                                                                                                                                                                                                       | all                                                                                                      | —                                                                                                                              |
| `scripts/lib/mushroom-probe.ts` (881)        | `topAt`'s house line, readers after `mouse`, schemas after `Mouse`                                                                                                                                                                                                                                                                                            | `mouse`'s reader and schema                                                                              | worms ≤ +45 (already a data-dense file past 450)                                                                               |
| `scripts/lib/play-house.ts` (202)            | one call at the end of `playHouse`                                                                                                                                                                                                                                                                                                                            | the rest                                                                                                 | worms +2                                                                                                                       |

`tappedDoor` (`door-tap.ts`) is reused unchanged. The widened circle
`doorHitArea` builds (`ellipse(middle, r / cos(π / ROUND_STEPS))`) is needed
by `window-reach.ts` too: worms adds it to `tap-reach.ts` as `reachCircle`,
and the fold (or `runs`, if it edits `doorHitArea`) points `door-reach.ts` at
it.

## Play and probe

The probe (`scripts/lib/mushroom-probe.ts`) exposes:

- `topAt` returning `window:<id>:<index>` where the house's Graphics takes a
  tap on a window, `door:<id>` on the door as today.
- `windows(id)`: each window's tap middle on screen and its reach in CSS px,
  and the cap's drawn area left to the mushroom (its share of `hit.cap`
  outside every window's reach), so call 2's departure is measured.
- `worm(id)`: `{ tappedAt, from, to, trips, phase: 'out' | 'crawl' | 'in' |
'peek' | null, head: Point | null, girth }` — the head on screen, the
  girth as drawn in CSS px.

**The scenario** (`play-worms.ts`, after `playHouse` has filled the front
cap's row and put a door on each mushroom): tap the front cap's outermost
window — expect `topAt` = `window:…`, no wobble (`tappedAt` of the mushroom
unchanged), `selected` unchanged, `worm.phase` `out` within a frame; keep
frames at 0.1, 0.6, 1.2, 1.8 s and at `phase` `null`; expect `to` the other
end of the row and the head's last point at that window's middle. Tap again
mid-crawl: `to` unchanged. Then select the back mushroom, put in one window,
tap it: `phase` `peek`, a frame at 0.6 s, `null` by 1.6 s. Print each
screen's window reach and the mushroom's remaining cap share; fail when the
worm's girth is under `WORM_GIRTH_LEAST` or a window tap reaches the
mushroom.
