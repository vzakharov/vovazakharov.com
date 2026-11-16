P done: `pnpm play:island` (`src/island/scripts/play-island.ts`) and the hook type `IslandPlayHook`, with `PLAY_HOOK = '__island'` and `PLAY_QUERY = 'play'`, in `src/island/shared/play/`.

Flags: `--no-build` (play `sites/vova/out` as it is), `--screens phone,desktop`, `--out <dir>` (default `docs/remove-before-merging/island/bite-1-descent/frames/`). Screens: phone 390×844 @3 with touch, desktop 1440×900 @1. Heights: orbit 20 000 km, 1000km, 10km, 100m, 2m; five 1/60 s `step`s each before the shot.

Left: nothing. Red until S5 installs the hook: both screens fail with "exposes no window.\_\_island 30 s after loading".

Checked against a stub hook pasted into a scratch export: five frames per screen, the median line, and a `console.error` plus a rejected `ready()` both reported and failing the run.

Surprises:

- `cdp.ts`'s `evaluate` takes no `awaitPromise`, so the script settles hook promises by polling a page global; that also puts a deadline on a `setHeight` that never resolves.
- `median` is copied from `src/mushrooms/scripts/lib/frame-budget.ts`, which a sibling app cannot import; it belongs in `scene`'s scripts lib.
- The scratch build needed the `island-map.webp` line removed from `case-studies/island.md`, as S0 found.
