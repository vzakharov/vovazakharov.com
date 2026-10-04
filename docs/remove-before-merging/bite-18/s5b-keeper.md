# S5b — the keeper wired (hand-over)

Calls 4 (the `hashchange` reload), 5 (writes); spec § 2 calls 5, 12.

## Done

- `ui/scene/meadow-keeping.ts` (new): `keptRecord(seeded, meadow, now,
start)` → `{version, seed, meadow: settled(meadow, now), eye, gait}`;
  `meadowKeeping(opening, scened, eye, now, page?)` → `{ keep, poll, bind }`.
  `keep`/`poll` build the record off the scene's meadow and `EyeInput`
  (`now()` seconds × 1000, the timebase the meadow's stamps are in) and do
  nothing with no keeper, no meadow or no fitted eye. `bind` adds the
  `visibilitychange` (hidden → `keep`) and `hashchange` (→
  `location.reload()`) listeners only when a keeper is set, and returns what
  removes them. Test beside it, the page and the keeper faked.
- `ui/scene/meadow-scene.ts` (440 → 446, grant 448): `keeping` field built in
  the constructor; `dispatch` keeps after a changing non-`tick` action;
  `update` polls after the tick dispatch.
- `ui/scene/meadow-listeners.ts`: a `keeping` piece whose `bind()` joins the
  stops let go on the scene's shutdown.
- `ui/scene/visit-play.ts`: `Meadowed` exported, so the keeping's `Held` is
  `Meadowed & Eyed` (`pnpm type-overlap`).

## Play run (tabL, `keep`)

Green. `keep-before` and `keep-after` show the same meadow at dusk from the
same place (four mushrooms, the window, the fireflies perched); `keep-new`
is a fresh daylight meadow with the opening clump. `meadow` was not run (its
butterfly line is another agent's).

## Left

Nothing for S5b.

## Decided

- An action the reducer leaves unchanged writes nothing (it returns before
  the keep, with the tick's no-op).
- The poll builds a record every second while the tab is open, whether or
  not anything changed (fliers' stays shrink anyway); call 5 bounds the rate,
  not the change.
- The hash edit reloads without a last write: everything is already kept
  (spec call 12), and a write started there would be cut by the reload.
