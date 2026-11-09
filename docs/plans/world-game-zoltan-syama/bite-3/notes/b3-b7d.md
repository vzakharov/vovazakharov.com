# b3-b7d — calls 17 (look hints) and 18 (diagnostics panel)

Base e01403fb, branch `wt/b3-b7d`. Contract text from `island/stretch-2`
c9f60859. Built and checked; not yet looked at in a browser.

## Call 17 — look hints

- `features/eye/model/look-hint.ts`: `upHintPitch(height, aspect)` =
  `asin(sin δ / cos(φ/2))`, `δ = dipAt(height)`, `φ` the horizontal field from
  `fovFor(aspect)` (now exported from `pose.ts`); `π/2` where
  `sin δ ≥ cos(φ/2)` (the side edges' mid-height rays miss the planet at every
  pitch, so the horizon there is below the middle whatever the pitch).
  `lookHint(eye, aspect)`: `undefined` while `look ≠ 0`; `'down'` once
  `pitchAt(h) ≤ GROUND_PITCH`; `'up'` once `pitchFor(h, look) ≤ p*`.
- `island-scene.ts` takes `onLookHint`, told only on a change, never under play.
  `island-canvas.tsx` shows it in an `<output class="lookHint">` on the
  where-confirmation's glass, 64 px from the top; keys or touch wording picked
  by the hint's `hintKeys`/`hintTouch` media rules. `en.json` `look.up/down`.
- Tests: `look-hint.test.ts` (the side-edge ray at `p*` grazes the horizon
  within 1e-12 at 100 m, 10 km, 1,000 km on 16:9 and 1:2; π/2 at 20,000 km;
  both hints; moved look), `config/en.test.ts` (wording).

### Thresholds (look 0)

| height | dip | p* 16:9 | p* 1:1 and portrait | pitchAt | hint |
| --- | --- | --- | --- | --- | --- |
| 100 m | 0.321° | 0.417° | 0.354° | 13.05° | none |
| 10 km | 3.208° | 4.169° | 3.540° | 44.41° | none |
| 1,000 km | 30.19° | 40.79° | 33.71° | 80.83° | none |
| 20,000 km | 76.02° | 90° | 90° | 90° | up |

"Down" shows at and below 20 m (`GROUND_PITCH_BELOW`). **"Up" shows only from
3,591 km (16:9) or 8,700 km (square or portrait) upward**: `pitchAt` stays
10–40° over `p*` at every lower height, so on a descent the horizon at the side
edges never reaches mid-frame and the up hint never shows below orbit. Built to
the contract as written; whether that is what Vova's «как только вид на
горизонт заполнял бы по краям половину вертикали» means is the lead's call.
