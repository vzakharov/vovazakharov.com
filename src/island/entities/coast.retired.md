# `entities/coast` — retired

The coast slice traced the operator's drawn map into rings, and `trace:island`
ran the tracer. The rings it last wrote live on as
`src/island/scripts/lib/coast.json`, which `pnpm fit:island` (`fit-sphere.ts`)
fits world 1 to on the sphere, so only tracing a new drawing needs the tracer
back. The flat-plane fit it fed (`fit-world.ts` and its `lib/fit-*.ts`) is gone
for good, its sphere fit having replaced it.

Last commit containing them: 695281ebf90622c2e04798de84192224c4446877.

- `src/island/entities/coast/` — the slice: tracer, lakes, sea strokes, and its
  own copy of the rings, which the live `coast.json` replaces.
- `src/island/scripts/trace-coast.ts` — `pnpm trace:island`.

```sh
# the tracer back, then re-add the package.json script, point its output at
# src/island/scripts/lib/coast.json and drop the slice's own copy:
git checkout 695281ebf90622c2e04798de84192224c4446877 -- src/island/entities/coast src/island/scripts/trace-coast.ts
```
