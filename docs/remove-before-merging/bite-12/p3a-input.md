# p3a-input — hand-over note

Package: bite 12 P3 step 1 — `eye-input` + keys + footstep voice, no scene
wiring.

## Done

1. Step 1 (see `git log -- src/pages/mushrooms/model/walk.ts`):
   - `model/walk.ts` + test — the pure drag/keys machine over `pan.ts`'s
     heading crop and `stride.ts`: radial slop, axis lock at the crossing,
     1:1 azimuth turn with pan's glide, the stride's chase for a vertical
     drag (rows clamped to the seam), `heldStill` for P4's long press,
     `refit` keeping heading and place.
   - `ui/scene/view-inverse.ts` + test — screen → plane / layout px /
     `Ground` (`planeUnder`, `layoutOf`, `layoutUnder`, `groundOfLayout`,
     `groundUnder`).
   - `ui/scene/eye-input.ts` — `EyeInput`, the Phaser shell (`Crop`'s
     successor; `pan-input.ts` stays until the wiring swaps it).
   - `keyboard.ts` — `↑`/`↓` as `StepKey`; `letGoPan` → `letGoMove`.
     `instrument-input.ts`'s `playTheFlowers` ignores step keys while it
     still takes a `Crop`.

2. Step 2:
   - `ui/scene/footsteps.ts` + test — `Foot`, `footfalls(before, after)`
     (the feet landing as `walked` crosses multiples of `STEP_LENGTH`,
     alternating from the left), `FOOT_PAN` (±0.3), the `footstep` voice
     (60 ms of `brownNoise` through a 600 Hz low-pass, peak 1.5).
   - `synth.ts` — `brownNoise` (the breeze's, shared) and `panned` (a
     `StereoPannerNode` in front of the voice's out); `sound.ts` —
     `MeadowSound.step(foot)`, through `play`, so silent under the mute; a
     step before the synth exists is dropped, never queued.
   - `ui/scene/keyed-flowers.ts` + test — `FlowerInView`, `keyedFlowers`,
     `KeyedPlay`, `playKey`; `instrument-input.ts` gains `playTheMeadow`
     (the `EyeInput` + flowers-in-view successor of `playTheFlowers`, which
     stays while the scene passes a `Crop`).

## Footstep level (offline render)

Chromium `OfflineAudioContext`, 48 kHz, through the master gain 0.8 and the
compressor; loudest 50 ms, Hann, dB of power. Six renders of the step
(the noise is random):

| sound            |        full |     >300 Hz |
| ---------------- | ----------: | ----------: |
| C5 (72)          |       −21.5 |       −21.5 |
| kick             |       −18.4 |       −26.7 |
| breeze (no gust) |       −27.5 |       −34.9 |
| step, peak 1.5   | −28.8…−32.4 | −36.9…−42.3 |

So a step sits ~10 dB under a C5 overall, about level with the breeze's
own band, and ~15–20 dB under a C5 above 300 Hz (a phone speaker hears
little of it). It wants a listen; `STEP_PEAK` in `footsteps.ts` is the dial.

## Left

- Nothing in this package. The scene wiring (P3 step 2) calls the API.

## Decided

- The vertical chase's reference row is the slop's crossing (not the press),
  so nothing jumps at the crossing and the settled row lags the lift by the
  slop, as the spec's "minus the slop lag" and pan's 1:1 rule have it.
- The turn feeds `pan.ts` the screen x warped to `F·atan((x−cx)/F)`, so its
  1:1 follow, velocity and glide are exact in angle without touching
  `pan.ts`; at the crossing the pan is handed a press already panning from
  the crossing point.
- A press stops both axes (pan's `press`, the stride's `chaseFrom`); a
  horizontal lock leaves the stride's chase at aim 0, so the eye never moves.
