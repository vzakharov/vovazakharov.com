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
- **Call 5's palette half**, a patch, not source:
  `docs/remove-before-merging/bite-17/a-light-step2.patch` (eslint fails two
  rules on it; `a-light.md` says how to fix them).
- **The rest of package A is designed** in
  `docs/remove-before-merging/bite-17/a-light.md`: the sky and ground get
  dusk bakes, while the hills, brow and clouds — drawn live — take blended
  tones and cloud twins (a departure from "a second bake", call 5);
  `DuskView` exposes `glowDepth` and `level`, the seam B and C draw at; the
  sun's tap sounds `voice.sink()`, the moon's `voice.grow()`, a cloud in
  front of the sun taking the tap first.
- **Off the bite, from the operator**: the porcini's cap fill flickered
  (~10 Hz, since bite 8) — its margin's crescent crossed itself at the
  corners and re-triangulated per frame. `crescent` (now pure in
  `crescent.ts`) cuts any loop in its inner edge (d74b08c8,
  `porcini-margin.test.ts`).

## Left

Package A's rest, from `a-light.md` — its agent ran out of context at its
first step, so brief each agent on one or two of those steps, not the
package; then B and C beside each other; the play run's red "a tap on the
bare meadow kept a selection", seen on the shared branch before the dusk
work; the review, polish, vet, frames, the Artifact.
