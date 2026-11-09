# b3-b7c — equinox sun, call 15 where

Base 2b0e6d7d, branch `wt/b3-b7c`, `island/round-world` merged in at 33fe8e7f
(ae41b577's `pitchAt`). Built and checked; not yet looked at in a browser.

## Done (pushed)

- **ce131c95** equinox sun. `heavensAt`: the sun on the equator, hour 0 the
  afternoon hour with the sun 20° up west of the opening's meridian (hour angle
  `acos(sin20°/cos φ)`; nearer a pole than 70° it takes noon). #1 opens at
  10° N 0° E: hour 0 is 16:39 sun time there, 16:17 over #0 (38° N).
- **fcd7d8ed + 99facfe8** the pure half: `lib/place-hash.ts` (zod grammar,
  `parsePlace`/`formatPlace`, lat/lon 5 dp, height/heading/pitch 1 dp, t 3 dp;
  bad world → `OUR_WORLD`, bad pose → dropped, world kept), `lib/where-line.ts`,
  `lib/eye-pose.ts` (`poseOfEye`/`eyeOfPose`, pitch = the eye's `look`),
  `solarHours` in `day.ts`.
- **bfad305a** the wiring: `island-scene.ts` (`pose` param, `placeAt`,
  `where()`), `tile-view.ts` `levels(at)` via `tileHolds` (terrain barrel),
  `ui/where.ts` (`installWhere`: `P` and `globalThis.island.where()`,
  `replaceState` of the hash, clipboard copy reported to `onCopy`),
  `NEXT_PUBLIC_COMMIT` from `sites/vova/next.config.ts` (`git rev-parse
  --short=8 HEAD`), typed in kernel's `env.d.ts`.
- **527e734c** the page: `island-canvas.tsx` opens on `parsePlace(hash)`;
  `hashchange` → `setWorld` and, with a pose, `placeAt`; an `<output>` (class
  `.where`, top centre, the hint's glass) confirms the copy or its failure for
  1.8 s. `en.json`: hint row `P` "copy where you are", `where.copied/failed`
  (no ru file exists for the island). The play hook has `where(): string`.
  `world-hash.ts` and its test are gone (place-hash covers the bare world).

## Checks (527e734c)

tsc (vova and root), eslint, prettier, stylelint on the touched files; 65 tests
across the island page's lib/ui/model; check:masd, check:cycles,
masd:clusters, type-overlap, check:poison, line-limit — all green. knip red as
expected until B8 (nothing new from this step in its list).

## For the browser look (next agent)

- `P` on /island: the hash becomes `#<world>@…,t`, the line is on the
  clipboard, the confirmation shows; paste the link in a new tab → same view
  and lighting.
- A `hashchange` to another world with a pose places the eye before the new
  field lands, so `eyeOfPose` clamps against the old world's ground; worth a
  look that the eye does not end up under the new ground.
