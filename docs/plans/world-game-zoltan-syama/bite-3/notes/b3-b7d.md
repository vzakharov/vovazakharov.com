# b3-b7d — calls 17 (look hints) and 18 (diagnostics panel)

Base e01403fb, branch `wt/b3-b7d`. Contract text from `island/stretch-2`
c9f60859. Built and checked; not yet looked at in a browser.

## Call 17 — look hints

- `features/eye/model/look-hint.ts`: the up threshold is where the ray through a
  **top corner** grazes the horizon (Vova's decision, superseding the side-edge
  mid-height rule): `grazingPitch(δ, θv, θh)` =
  `θv + asin(sin δ · √(1 + tan²θh · cos²θv))`, the contract's formula (stretch-2
  30e78ea5), `undefined` where the asin's argument passes 1 or `p*` passes 90°
  (no up hint). `upHintPitch(height, aspect)` feeds it `δ = dipAt(height)`,
  `θv = fovFor(aspect)/2`, `θh = atan(tan θv · aspect)`.
  `lookHint(eye, aspect)`: `undefined` while `look ≠ 0`; `'down'` once
  `pitchAt(h) ≤ GROUND_PITCH`; `'up'` once `pitchFor(h, look) ≤ p*`.
- `island-scene.ts` takes `onLookHint`, told only on a change, never under play.
  `island-canvas.tsx` shows it in an `<output class="lookHint">` on the
  where-confirmation's glass, 64 px from the top; keys or touch wording picked
  by the hint's `hintKeys`/`hintTouch` media rules. `en.json` `look.up/down`.
- Tests: `look-hint.test.ts` (an independently built top-corner ray at `p*`
  grazes the horizon within 1e-12 from 100 m to 1,000 km on 16:9, 1:1, 1:2;
  `grazingPitch` with `θv = 0` is `asin(sin δ / cos θh)` within 1e-12; no
  threshold and no hint at 20,000 km, nor at 3,000 km on 16:9 and 6,000 km on
  1:1; both hints; moved look), `config/en.test.ts` (wording).

### Thresholds (look 0)

| height    | dip    | p\* 16:9 | p\* 1:1 | pitchAt | hint |
| --------- | ------ | -------- | ------- | ------- | ---- |
| 100 m     | 0.32°  | 25.40°   | 25.35°  | 13.05°  | up   |
| 1 km      | 1.02°  | 26.27°   | 26.10°  | 25.82°  | up   |
| 10 km     | 3.21°  | 29.01°   | 28.48°  | 44.41°  | none |
| 100 km    | 10.09° | 37.65°   | 35.96°  | 64.26°  | none |
| 1,000 km  | 30.19° | 63.98°   | 58.09°  | 80.83°  | none |
| 20,000 km | 76.02° | none     | none    | 90°     | none |

On a descent (look 0), the hint changes at:

- **16:9** — up 2,873 km → none 2,500 km → **up 1,071 m** → down 20 m.
- **1:1** — up 5,202 km → none 4,757 km → **up 1,043 m** → down 20 m.
- **1:2** — up 2,456 km → none 1,738 km → **up 13.3 km** → down 20 m.

`grazingPitch` is also `undefined` where `p*` passes 90° (the coordinator's
call: a corner ray would graze only past straight down), a clause the contract's
bullet lacks. The high band left is genuine under the rule: there `p* ≤ 90°` and
`pitchAt` lies below it, so the corners show the horizon.

## Call 18 — diagnostics panel

- `I` (`KeyI`, `ui/diagnostics.ts` `DIAGNOSTICS_KEY`) toggles a
  `<pre class="diagnostics">` top left on the hint's glass:
  `whereFields(scene.where())` a row each (`lib/where-line.ts` now builds
  `whereLine` as their join) and `frame N.N ms`. Read every 250 ms while open;
  closed, nothing reads the scene. Hint row `I` "diagnostics";
  `time-keys.test.ts` checks `KeyI` against the eye's, the clock's and `P`.
- Frame time: `lib/frame-time.ts` `smoothedFrameMs`, an exponential average over
  500 ms weighted by each frame's own length; `scene.frameMs()`, fed by the rAF
  tick, so undefined under play (no loop) and before the first frame — the panel
  shows nothing until then, which also keeps it off `where()` before the eye
  exists.

## Checks

tsc (vova), eslint, prettier, stylelint on the touched files; 128 tests across
the eye model and the island page's config/lib/ui; check:masd, check:cycles,
masd:clusters, type-overlap, check:poison. knip: see the report.

## For the browser look (next agent)

- At 2–20 m with look 0: "Press ↓ to look down" under the top centre; gone on
  ↑/↓. At 20,000 km (or above ~3,600 km on a landscape screen): "Press ↑". On a
  touch emulation the two-finger wording.
- `I`: the panel top left, rows updating, frame time near the display's
  interval; `I` again hides it. `island-scene.ts` is at 391 lines.
