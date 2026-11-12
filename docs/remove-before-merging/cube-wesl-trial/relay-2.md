# Relay 2 — the whole move

Notes to self across an autocompact (the operator runs this session under
autocompact: no `/relay`, just keep this file current). Russian with Вова, «ты».

## Asked

- «make wgsl great again»: move every floor and band piece into `.wgsl`.
- Per-floor folders were approved («папка на этаж во всех группах»), then «попробуй
  так и сяк и сделай как считаешь более элегантным и менее энтропийным».
- Next perch, not now: regroup floors by shared features (MASD-driven) instead of
  the fixed bands (workplace/dwelling/leisure/laboratory/edge).

## Done (pushed)

- 5d633a0f — `AIR` is declared by `floorSource` from `theme.air`; `.wgsl` names it
  unimported (like `lamps()`); `ordinary()`/`lit()` lost their air argument;
  `micrograph-air.ts` gone, so the laboratory cluster went away. Pin undoes it
  generically (`aired()`).
- 2614e9ec — edge `pattern`/`screen`, leisure `shapes`, workplace `marks` → `.wgsl`.
- 08de88e2, 13b9554e — all 66 floors are `.wgsl`; floor `.ts` appends `ordinary()`
  / `lit()` via `{ ...X_SHADER, needs: [...X_SHADER.needs, …] }`. Floors 29, 40,
  50, 65 dropped a piece they listed and never called (pin: `UNCALLED`).
- Still TS on purpose: `kit/lib/core.ts` (KINDS, ROOM, FLAGS from TS), `ordinary`,
  `lit` (parametric), `theme.ts`. Splitting core is an open offer, not done.
- Tools: `tmp/wesl-move/port.ts` (converter), `unused.mjs` (drops imports the
  linker reports unused), `dump.ts` (print a floor's source).

- Folder per floor (next commit after 13b9554e): `<band>/<floor>/{index.ts,
config/<floor>.{ts,wgsl,shader.ts}}`, no numbers in names; band pieces are
  sub-slices too (`edge/{pattern,screen,lit}`, `leisure/shape`,
  `workplace/stencil`, `laboratory/small-world`, `dwelling/household`). Numbers
  live only in `catalogue/config/floors.ts` (`BANDS`). Why: home outgrew 400
  lines, its carpet split to `edge/home/lib/carpet.wgsl`, and `masd:clusters`
  wanted a sub-slice — so every floor got one rather than one odd floor.
- Steiger's `inconsistent-naming` forced singular names: grandmother, cut-paper,
  normal-map, sixteen-colour, shape, stencil, small-world (`pluralize` reads
  `specimen` as plural). `household` because `FITTINGS` collided with
  `features/decor` under `vova/no-export-namesake`.
- `Aired` folded into `FloorTheme.air`. Pin undoes the carpet split (`home()`).
- Tools also: `tmp/wesl-move/folders.mjs`, `rename.mjs` (its regex once hit
  `entities/poster`; reverted).

## In flight

- vet on the folder commit, board republish, final report.
