# `entities/coast` — retired

The coast slice traced the operator's drawn map into rings (`model/coast.json`),
and two scripts read it: `trace:island` drew the rings, `fit:island` fitted
world 1's mask words to them. The game reads only the fitted
`src/island/entities/terrain/world/model/mask.json`, and no in-browser "draw
your own world" is planned, so the slice and both scripts went. Re-fitting world
1 to the drawing, or tracing a new one, needs them back.

Last commit containing them: 695281ebf90622c2e04798de84192224c4446877.

- `src/island/entities/coast/` — the slice: tracer, rings, lakes, sea strokes,
  `coast.json`.
- `src/island/scripts/trace-coast.ts` — `pnpm trace:island`.
- `src/island/scripts/fit-world.ts` — `pnpm fit:island`.
- `src/island/scripts/lib/fit-*.ts` — the fit's libraries and their tests.

```sh
git show 695281ebf90622c2e04798de84192224c4446877:src/island/entities/coast/model/coast.json
# all of it back, then re-add the two package.json scripts:
git checkout 695281ebf90622c2e04798de84192224c4446877 -- src/island/entities/coast src/island/scripts/trace-coast.ts src/island/scripts/fit-world.ts 'src/island/scripts/lib/fit-*'
```
