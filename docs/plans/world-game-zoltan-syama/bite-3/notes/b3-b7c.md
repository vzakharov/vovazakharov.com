# b3-b7c — equinox sun, call 15 where

Base 2b0e6d7d, branch `wt/b3-b7c`. Stopped at the context budget.

## Done (pushed)

- **ce131c95** step 1, equinox sun. `heavensAt`: the sun on the equator, hour 0
  the afternoon hour with the sun 20° up west of the opening's meridian
  (hour angle `acos(sin20°/cos φ)`; nearer a pole than 70° it takes noon).
  `sunToward` lost its last reader and went (sun.ts keeps `intensityFor`).
  #1 opens at 10° N 0° E: hour 0 is 16:39 sun time there, 16:17 over #0 (38° N).
  Tests: 20° west-of-meridian sun over #1 and #0; sun on the equator; 0/38/60/80° N
  each get 12 h ± 0.2% of sun and a midnight below −6°.
- **step 2, pure half** (WIP commit): `lib/place-hash.ts` (zod grammar,
  `parsePlace`/`formatPlace`, `PLACES` precision lat/lon 5 dp, height/heading/
  pitch 1 dp, t 3 dp; bad world → `OUR_WORLD`, bad pose → dropped, world kept),
  `lib/where-line.ts` (`whereLine(Where)`), `lib/eye-pose.ts` (`poseOfEye`,
  `eyeOfPose`: pitch = the eye's `look`), `solarHours` in `day.ts`. All tested
  (46 pass across lib + ui tests).

## Left — `b3-b7c-wip.patch` beside this note (not applied, not checked)

Holds the wiring, written but not type-checked as a whole:
- `ui/island-scene.ts` (370 lines): `pose` param, `placeAt(pose)`, `where(): Where`.
- `ui/tile-view.ts`: `levels(at)` — drawn tiles' levels under the eye, via
  `tileHolds` (added to `entities/terrain/index.ts`'s barrel).
- new `ui/where.ts`: `installWhere(scene, element, onCopy)` — `P` key and
  `globalThis.island.where()`, `replaceState` of the hash, clipboard copy whose
  failure goes to `onCopy` (no console: `no-console` is on).
- `ui/time-keys.test.ts`: `WHERE_KEY` collides with no eye or clock key.
- `sites/vova/next.config.ts`: `NEXT_PUBLIC_COMMIT` from `git rev-parse
  --short=8 HEAD`; `src/kernel/shared/config/env.d.ts` types it (kernel file,
  outside the list — needed under `noPropertyAccessFromIndexSignature`).

Still to write: `ui/island-canvas.tsx` (parse with `parsePlace`, pass `pose`,
`hashchange` → `setWorld` + `placeAt` when a pose, `installWhere` with a short
confirmation element + class in `island.module.scss`), `en.json` (hint row
`P` "copy where you are", copied/failed copy), `play-hook.ts` and
`shared/play/play-hook.ts` (`where: () => string` = `whereLine(scene.where())`),
delete `lib/world-hash.ts(+test)` (folded into place-hash), then the checks.

Lint left in the committed lib files: `day.ts` `dayHours` used before defined
(move `solarHours` below it); `eye-pose.ts` `height: eye.height` /
`pose.height` (vova/no-redundant-property-copy); `where-line.ts` `pad` to outer
scope. In the patch: `where.ts` `signal: bound.signal`.
