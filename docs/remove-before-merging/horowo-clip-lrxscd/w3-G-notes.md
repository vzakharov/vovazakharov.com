# Wave 3, package G — notes

Branch `claude/horowo-clip-w3-g-lrxscd`. Built and pushed; nothing open.

## Built

- **`gigPart(part)`** (`@/clip/widgets/gig`): extreme close-ups — `'guitar neck|pick|headstock|eye'`, `'bass neck|headstock|pick'`, `'vocal jaw|eye|mic'`, `'drums sticks|tom|eye|jaw'`, `'boot'` (the drummer's boot on the kick pedal, beater on `KICKS`). Crops in `gig/parts/ui/parts.ts` `CROPS`.
- **Camera**: `gig/studio/model/camera.ts` `jerk()`, applied by `filmed(pen, cut, draw, {push, tilt, whip, kick, shake})` in `gig/studio/ui/studio.ts`. `gigWide(liftOff?, nearness, mood)` and `gigClose(role, liftOff?, mood)` go through it; `gigInsert` is unchanged.
- **`rocketEars(progress?)`** (`@/clip/widgets/gig`): the ears' story — twitch, ignition, lift-off, climb, fireworks. `progress` (0–1) is where it stands at the cut; it runs on in real time. With no argument it is read off song time through `ALONG` in `gig/rocket-ears/model/ear-story.ts` (double 0→0.44, chorus →0.66, bridge →0.8, breakdown →1). Camera keyframes: `BEATS` there.
- **`earIgnition(pen, audience)`** (`@/clip/features/ear-fireworks`): smoke and sparks at ear roots; `crowd()` draws it whenever `liftOff` is set.
- **`shots-double.ts`**: 23 half-beat cuts; `rocketEars(0.03)`, `(0.22)` mid-section, `(0.3)` for the last six half-beats.

## Wired by the lead

`rocketEars()` in the chorus's `STORYLINES` (twice), the bridge's `HALF_DREAMS`, and `BREAKDOWN_POOL` (three times).

## Known weak spots

- An ad shot covers the double's last ~0.5 s (from ~27.4 s).
- The twitch stage frames the band large, the ears dark spikes before it.
- The climb is busy with smoke.

## Outside the package

`src/clip/entities/bunny/index.ts` exports `EAR_ROOT`.
