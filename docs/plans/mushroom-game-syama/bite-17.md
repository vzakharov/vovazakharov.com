# Bite 17 — dusk

Item 17 of the plan, the last bite: «The dark scheme is dusk: the sky, dimmer
hills, windows glowing, fireflies waking, mice coming out of their doors,
butterflies folded on the caps and flowers closed for the night.» The line
dates from the first plan, when the page was going to wear the site's
colour tokens; decisions.md's ecology already promises it («at dusk the mice
come out and the fireflies wake»). Paths are under `src/pages/mushrooms/`.

## Calls — how dusk comes

1\. **Dusk is model state, as rain is.** `model/dusk.ts`: `Meadow.dusk`
holds which way the light is going (`toward: 'dusk' | 'day'`), when it
started and the level it started from; `duskness(dusk, now)` is 0 at full
day and 1 at full dusk, eased over `DUSK_MS` (4 s) from where it stood, so a
turn reversed midway goes back from there rather than jumping. A `dusk`
action in `reduce` turns it. Every dusk rule reads `duskness` (or
`dusky(dusk, now)`, past half); nothing else stores the time of day.
Beat: a clock that runs a day by itself, which the child would wait through
and could not undo.

2\. **The child turns it with a tap on the sun, and back with a tap on the
moon.** The sun sinks a little toward the hills as it fades, and a moon —
a pale disc with a crescent shadow in its own rosette halo, Syama's ink —
rises where it stood. Shown, never taught: like a cloud's tap bringing rain.
The sun's tap reach is its drawn disc and halo, at least `TAP_RADIUS`.
Beat: the scheme alone (item 17's letter), which a six-year-old never
switches, so dusk would never come; a button, which Syama's drawing does not
have.

3\. **The dark scheme opens at dusk.** The scene reads the page's resolved
scheme once at start — `data-mantine-color-scheme` on `<html>`, else
`prefers-color-scheme` (the Artifact has no Mantine) — and a dark one opens
the meadow at full dusk (`duskness` 1 from the first frame, no fade). Not
followed live: the switch is the site's, the game's own is the sun.

4\. **The moon stands at the sun's azimuth**, so every shade keeps its side,
the map's compass keeps its place (the map draws a moon at dusk) and
`sunLight` stays the one light; the moon's light is the sun's, dimmer.

## Calls — the look

5\. **Dusk is a second set of backdrop colours, cross-faded.** `palette-dusk.ts`
holds `DUSK`, the backdrop section's dusk twin (a deep indigo top, a rose-amber
band at the hills, dimmer violet-green hills and ground, cloud colours lit
from below), and `palette.ts` exports it beside `PALETTE`. The baked
backdrop bakes both once a paint; the dusk bake lies over the day's at
`duskness` alpha, so the turn costs no repaint mid-fade. A dozen static
stars in the dusk sky's upper band, ringed as the sun's rosette is.

6\. **A dusk wash over the meadow**, `PALETTE.duskWash` (a deep blue-violet)
at up to `DUSK_WASH_DEEPEST` 0.38, laid like the rain's wash and under the
same layers; the two stack, so a shower at dusk is darker still. The sun
and its glow fade by `duskness` as `sunShown` fades them under rain; no
rainbow comes after a shower that ends at dusk.

7\. **What glows is drawn above the wash**: the moon, the lit windows and the
fireflies, so the wash dims the meadow and never its lights.

8\. **Windows glow.** At dusk every house's windows light a warm amber
(`PALETTE.windowLit`) with a soft halo, from the window stations
`draw-house.ts` paints, in a layer above the wash, faded in by `duskness`
one house after another (a seeded delay of up to 1.5 s each), so the
village lights up rather than switching on.

## Calls — what lives at dusk

9\. **Flowers close for the night** as they close for rain: the bed's closing
is the greater of the rain's and dusk's, through `flower-closing.ts`; a
closed flower still plays. Bees plant no flower at dusk.

10\. **No flier takes off of its own accord at dusk.** One in the air settles
on its next perch and stays; a butterfly picks a cap and sits with its
wings folded shut (`model/flight-habits.ts`, by `dusky`). A tap still sends
one off, and it settles again. One released at dusk flies in and settles.
Morning lets them go as before. Beat: sending them away, which loses
something, and the meadow never does.

11\. **Mice come out of their doors.** At dusk, with two houses' doors in
sight of each other, a mouse runs between them on its own every 6–12 s
(seeded), by `mouse-run.ts`'s runs, as a `tick` rule in the reducer; a
house with no mouse to spare peeks instead. Day keeps runs tap-only.

12\. **Fireflies wake.** `model/firefly.ts` and `firefly-view.ts`: up to
twelve fireflies, each a small dark body with a glowing tail, circling a
mushroom or a flower near the eye on a slow seeded orbit (a ring, the
mandala's), the tail's glow pulsing on its own phase. They wake one by one
over the first ~3 s of dusk and go out at morning. A tap on one flares its
glow and sends it a little higher before it settles back to its ring. They
are not an `INSECT_KINDS` entry: they never perch, no button releases them,
and the flier machinery (perches, limits, leaving) is the buttons'. Beat:
a fourth `INSECT_KINDS` entry, which drags a creature that only circles
through perches, limits and the flight-habit suite.

13\. **Crickets.** A soft synthesized cricket chorus (`dusk-voice.ts`), two or
three voices chirping on their own seeded rhythm, faded in by `duskness`
and asleep on a hidden tab, as the rain's hiss is. Morning brings a short
bird phrase.

14\. **`meadow-scene.ts` (427 lines) only holds a `DuskView`**, as it holds
`RainView`: `dusk-view.ts` drives the cross-fade, the wash, the moon, the
windows' and fireflies' layers and the voice each frame.

## Packages and waves

Three packages, each an Opus agent in its own worktree landing one squash
commit (`brief-common.md` under `docs/remove-before-merging/bite-17/`):

- **A — the light** (calls 1–7, 14): `model/dusk.ts` and its tests, the
  `dusk` action, the sun and moon taps, the scheme read, `palette-dusk.ts`,
  the second bake and its fade, the wash, the moon, `dusk-view.ts`, the map's
  moon, a probe hook (`__probe.dusk()`: level, toward; `__probe.sunAt()`),
  and a `dusk` play: tap the sun, shoot day, mid-fade and dusk, tap the
  moon, shoot morning, on tabL and phoneP.
- **B — the village** (calls 8–11), after A lands: lit windows, flowers
  closing, fliers settling, mice running; the dusk play extended to shoot
  them.
- **C — fireflies and crickets** (calls 12–13), after A lands, beside B.

## Built so far

- **Call 1, the model** (3225fce3): `model/dusk.ts` (`Dusk`, `DUSK_MS`,
  `FULL_DAY`, `FULL_DUSK`, `duskness`, `dusky`, `turned`), `Meadow.dusk`
  opening at `FULL_DAY`, the `dusk` action. A turn reversed midway takes
  its share of `DUSK_MS`, so the light moves at one pace; the action
  changes only `dusk`; a dark page gets `FULL_DUSK` from the scene.
- **Package A, the light** (calls 2–7, 14), in five slices: dusk tones
  and the dusk sky and ground baked (41188392); the moon and the map's
  compass at dusk (7b266fa4); cloud twins, hills and brow toned live behind
  one `backdrop.relight(level)` (015fb30d); `DuskView` — the sun's tap, the
  moon, the wash, stars fading round the moon (97ac3620); the probe, the
  `dusk` and `dark` plays, clouds masking the moon (d8f6f3a0). Departures:
  the stars are their own graphics, not baked, faded near the moon; clouds
  pass in front of the moon by masks, the moon staying above the wash.
  Artifact v26.
- **Package B so far**: lit windows, house by house, looked at and tuned
  (8cf326c8, 73d8c647); flowers close at dusk, bees plant none, the `dusk`
  turn shuts the flower picker as rain does (73d8c647).
- **Package C so far**: the sun gone by mid-turn and the moon rising after
  it, no double rosette (`sunUp`/`moonUp`); twelve fireflies waking by
  `duskness`, flared by a tap (9ea434ac).
- **Off the bite, from the operator**: the porcini's cap fill flickered
  (~10 Hz, since bite 8) — its margin's crescent crossed itself at the
  corners and re-triangulated per frame. `crescent` (now pure in
  `crescent.ts`) cuts any loop in its inner edge (d74b08c8,
  `porcini-margin.test.ts`).

- **Calls 10–13 done**: fliers settle at dusk, wings folded (203beb8 — the
  play harness's wrappers dropped the dusk argument); fireflies ring their
  hosts (9d615e1); crickets, day birds hushed, a morning phrase (4de9bb6);
  mice run between in-sight doors every 6–12 s (d11c830, `night-runs.ts`).
- **From the operator on v26's dusk, done**: grass rooted under the brow
  (0e7aa3d); the map dimmed and shaded to the dusk ground (7c5a3f3,
  0afbbfd); the moon a round full moon with a sleeping face in its seas,
  a ringed and beaded halo (11b4383); the moon's face wins a tap over a
  nearby cloud's box (c3cee8c, a real bug); the horizon band's tufts walk
  with the meadow and all grass dims at dusk (a43165e); a ground drag walks
  in steps again, flight kept as `Walk.gait` (ae1d5fc — ccfff90d had lifted
  the cruise cap).
- **Dusk's cost** (`perf.md`): every dusk piece was a Graphics
  re-tessellated per frame. Fireflies in two blend-moded batches from baked
  textures (3c1adf4), window glow and stars from textures (6fefab9), the
  moon baked with clouds erased from it, day clouds hidden at full dusk
  (3101c0d): 36 → ~10 draw calls. The operator: «перформанс ощутимо лучше».

## Left

In this order, each an Opus agent briefed on one step:

1. **`pnpm type-overlap` is red** on `line-course.ts` / `stride.ts` /
   `walk.ts` / `map-view.ts` (Line/Chase/Walk/Drawn), from ae1d5fc and
   0afbbfd.
2. **The walk play** (`scripts/lib/play-walk.ts`) still checks flight's
   ground-under-the-finger; recheck for steps (`st.md` § Left), run, look.
3. **Mice at the operator's**: «мышка пока так и не перебегает между
   грибами» — he played after d11c830 landed; our play saw a run. Asked
   him (no answer yet) whether he played the Artifact (v26, no mice) or a
   local build, and how many houses with doors and mice. Find the cause
   (a probe over `night-runs.ts`'s conditions on a furnished meadow).
4. **The steps/flight toggle** right of the map button, smaller than the
   insect buttons, showing footsteps or a flight symbol; flight lifting the
   eye a little, seeing farther with more haze (`st.md`: `EYE_HEIGHT` per
   gait is its own design step).
5. **Fireflies**: `__probe.fireflies()`, a flare shot in the `dusk` play, a
   flare sound.
6. **The grass band's cost** (`g2.md`: dusk play median 12.7 → 15.7 ms —
   check only the cells the band crosses).
7. The review, polish (`mouse-runs.ts` is 462 lines), vet, frames, the
   Artifact; retire bite 16's frames.

Off the bite, from the operator: the map's ✕ («крестик на карте
по-прежнему выглядит странно», then «дело в самом кружке. попробовать без
него б») stands bare on the open map (2aa143d2, 9722c620); `M` opens and
closes the map (2aa143d2). The play run's red "a tap on the bare meadow
kept a selection" is the harness's — the operator checked by hand
(«проверил, всё норм»): the play's check is fixed or cut, not the game.
