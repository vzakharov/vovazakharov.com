# Package c — fireflies and crickets: hand-over note

Calls 12–13 of `bite-17.md`, plus a4.md's "Left" (the moon's fade-in). Paths
under `src/pages/mushrooms/`. Stopped at the context ceiling after step 2.

## Done

- **Step 1, the sun hands over to the moon**: `dusk-sky.ts` `sunUp(level)`
  (1 − smooth over the first half) and `moonUp(level)` (smooth over the
  second half), tested never both above 0. `rain-view.ts` fades the sun and
  glow by `sunUp`; `DuskView` shades the moon by `moonUp`; the rainbow still
  fades by `1 − level`. Mid-turn (`frames/bite-17/c-tabL-mid.png`) the sky
  is empty, the stars coming in: clean, though the sun and the moon both
  missing for a moment is a choice a person may want overlapped a little.
- **Step 2, fireflies (call 12), first cut**: `model/firefly.ts` (pure,
  `firefly.test.ts`): `fireflies(seed)` grows the dozen; `circling` (a flat
  ring over the host, with heading and `near`), `tailGlow` (pulse, never
  under 0.3), `awake(genes, level)` (each wakes at the `duskness` of its
  own moment, 1.0–3.4 s into a full turn, so they come one by one and go out
  in reverse at morning), `flare(elapsed)` (glow up and a lift of 1.2
  units, settled by ~1.9 s), `hostFor` (least-circled of the 6 nearest).
  `ui/scene/firefly-view.ts` `FireflyView`, owned by `DuskView` at
  `glowDepth`: container per firefly (additive halo, dark body, yellow-green
  tail), sized `insectSize × CLUMP_DISTANCE / ahead` of its host, hosts from
  `bed.seat(capSeat(…, 0))` and `flowers.seat(id, 0, 'butterfly')`, kept while
  drawn and glided to a new one (1.2 s) when lost; a tap (own hit circle of
  `TAP_RADIUS`) flares it. `PALETTE.firefly` in `palette-creatures.ts`.
  `meadow-scene.ts` passes `DuskView` a `FireflyGround` (`scened` + `beds` +
  the visit seed): 436 lines.
  Frame: `frames/bite-17/c-tabL-fireflies.png`.

## Left

- **Fireflies look wrong in one way**: in the dusk frame they glow nicely
  but float mostly near the brow and in the grass, not round the clump's
  caps or the flowers beside them. Suspects, in order: `stands.distance`
  is not the measure `hostFor` should sort by (try `ahead`), or `inView()`
  / every mushroom in `meadow.mushrooms` offers far hosts whose
  `stands.drawn` is true; or `Seat.drawn` is not in the world coordinates
  the container uses. Check with a probe (below) printing each firefly's
  host and seat.
- **Probe and play**: add `__probe.fireflies()` in
  `scripts/lib/mushroom-probe-reads.ts` (`scene.dusk.fireflies.shown`,
  visible ones: `drawn` minus `cameras.main.scrollY`, and whether
  `clock - tappedAt < 2`) with a zod answer in `mushroom-probe-answers.ts`;
  in `play-dusk.ts` after `dusk-dusk`, assert some are shown, tap one, step
  ~15 frames, shoot `dusk-flare`, assert it flares. Shoot tabL and phoneP.
- **Tap sound** for a flare (a soft glint) — none yet.
- **Step 3, crickets (call 13)**: not started. Design: `ui/scene/dusk-voice.ts`
  a `DuskVoice` as `RainVoice` (`rain-voice.ts`): 2–3 voices, each a sine
  ~4–5 kHz amplitude-gated in bursts of 3–4 pulses (~30 ms each) every
  seeded 0.6–1.4 s, through one gain set to `level × CRICKET_LOUDNESS`;
  `MeadowSound.dusk(level)` builds it on first non-zero level and lets go at
  0, never while hidden (`heard()`), as `shower` does; `DuskView.update`
  calls `sound.dusk(level)` (widen `DuskSound`). Morning's bird phrase: on
  the turn toward day reaching level < 0.3, play `bird` a couple of times;
  the scheduled day birds (`scheduleBird`) should keep quiet while `dusky`.

## Decided

- Hand-over split at half way, no overlap (a4's "Left").
- Fireflies wake by `duskness` thresholds rather than time since the tap,
  so they need no state of their own, reverse at morning, and a dark page
  opens with all of them lit (call 3: no fade).
- Firefly halo uses additive blending; fireflies sit at `glowDepth`,
  above every mushroom, so one circling behind a near cap still shows.
