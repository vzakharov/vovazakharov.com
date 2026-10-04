# S5a — the opening (hand-over)

Calls 1, 6, 7, 10, 11; spec § 2 calls 11, 13, § 3 Step 5 (the opening half).

## Done

- `ui/scene/start-game.ts`: `startGame(parent, onError = reportError)` —
  `openKept(location, history, await openStore())`, then `run(parent,
opening)` builds the `Phaser.Game` with `scene: [new MeadowScene(opening)]`
  unless `stop()` came first. `__game` (probe) is now set once the opening
  resolves, not synchronously.
- `ui/meadow-canvas.tsx` passes `fail` (the same `setFailure` the import
  failure takes) as `onError`.
- `ui/scene/meadow-opening.ts`: `meadowOpening({seed, kept}, dusk)` →
  `{ meadow, openers, flowers }` (fresh meadow at `dusk` or
  `reopened(kept.meadow)`; openers and flowers always off the seed). Test
  beside it.
- `ui/scene/meadow-scene.ts` (443 → 440): `private readonly opening:
Opening` field, set in the constructor; `planter`/`arrivals` built there
  off `opening.streams`; every world stream off `opening.seed`; `create`
  reconciles mushrooms, flowers (`opening` flag) and insects once at rest;
  `paint` fits the eye with `this.eye.fit(layout.camera, this.opening.kept)`.
- `ui/scene/eye-input.ts`: `fit(camera, start?: WalkStart)`.
- `ui/scene/flower-bed.ts` (450 → 446): `reconcile(…, opening = false)`:
  grown (`plantedAt = -Infinity`), no bloom, no note.

## Decided

- **No parameter property**: `erasableSyntaxOnly` bans it (spec call 11
  assumed one). The scene has an `opening` field assigned in the
  constructor, and the two fields whose initializers read the streams
  (`planter`, `arrivals`) are built in the constructor after it.
- **The start goes through `EyeInput.fit`, not its constructor**: the eye is
  a field initializer the map's own initializer reads (`this.eye.halt`), so
  moving it into the constructor would drag the map with it, past the
  scene's line grant.
- `startGame`'s `onError` defaults to `reportError`, so the Artifact entry
  (no `onError`) still reports a failed opening as an uncaught error.

## For S5b

- The keeper: `this.opening.keeper` (field `opening`, `meadow-scene.ts`
  constructor). Absent with no store.
- `dispatch` (`private dispatch(action: Action)`): after `this.meadow =
meadow`, a non-`tick` action → `keeper?.keep(record)`.
- `update(time)`: `keeper?.poll(time, () => record)` after the tick dispatch.
- Record: `{ version: KEPT_VERSION, seed: this.opening.seed, meadow:
settled(this.meadow, time), ...eye/gait }` — the eye from `this.eye.eye()`,
  the gait from `this.eye.gait()`.
- `visibilitychange` / `hashchange` listeners: `listenOnMeadow` in
  `create`, or beside it; `hashchange` only when `keeper` is set.
- Lines: `meadow-scene.ts` is at 440, grant 448 (443 + 5).

## Play run (tabL, `meadow`)

Red on one line, twice: "the butterfly sent away is still in the meadow"
(the base, 3ea15a8, is green). The run plays another meadow than the base:
the visit seed is now drawn in `openKept`, after the IndexedDB open awaits,
so the probe's seeded `Math.random` hands it a different draw (one extra
draw before the boot does not bring the base's meadow back: other page code
draws during the await). Nothing in this step touches the insects past
reconciling the opening's empty list once; the line is for whoever traces
the butterfly taps.
