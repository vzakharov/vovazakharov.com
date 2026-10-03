# D-scripts — /dry over bite 16's tail under `scripts/`

Scope: `git diff aca95c51..origin/claude/mushroom-game-syama-lbirv7 -- scripts`
(packages F, E, G's play/probe changes and the probe split 0f1fa4e).

## Done (one squash commit on the shared branch)

- `press(page, key)` — a key struck, down and up with no frame between —
  moved from `play-keys.ts` into `mushroom-probe-drive.ts`, its key type
  derived from `Page['key']`; `play-keys.ts` and `play-map.ts`'s Escape use it.
- `play-worms.ts`: the closing check reads the trace's last sample through the
  `after` it already took rather than a second `trace.at(-1)`.
- `mushroom-probe-reads.ts`: `flowerTappedAt` goes through the instruments'
  `finite`, which it spelled out inline.

Checks: prettier, eslint, typecheck, knip, type-overlap clean;
`pnpm play:mushrooms --screens tabL --plays meadow,keys,map` played.

## Left, not applied

- `const DOOR = FURNISHINGS.indexOf('door')` in `play-house.ts`, `play-runs.ts`,
  `play-map.ts` — predates the range; a shared home is a separate task.
- `play-worms.ts`'s `farOpen` (step until a condition, capped) and
  `play-runs.ts`'s watch loop share a shape but not a contract; no helper.
