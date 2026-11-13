# Core's reports to the lead, newest first

## 2026-11-13 ~12:30Z — the state of the package, for whoever picks it up

Branch `claude/cube-intro-core`, head `22733f77` when this was written. Nothing is uncommitted. The lead holds core up to `df448bc2` (in its `6637594a`); the two commits after it are polish and do not change a frame.

### Done

- **The quarter-turn.** The interior sits one quarter counter-clockwise in its shell (`INTERIOR_TURN = 1`, `src/cube/shared/outside/turn.ts`). The shell, its doorway and ladder, the sun and everything outdoors are the world's and did not move; the doorway opens in the room's south wall (`ROOM_DOORWAY`, `shared/outside/frame.ts`, derived through `toRoom`, never written by hand).
- **The turn is derived, and a test holds the rule.** `src/cube/entities/world/model/interior-turn.test.ts` asserts that of the four turns exactly `INTERIOR_TURN` keeps the doorway's beam off the quarter of floor 1 its hole is in, against the planted world. Plant a different world and the test says which turn it wants.
- **Outdoors does not depend on the turn.** An eye outside is built in world coordinates alone (`seenOutside`, `src/cube/pages/cube/lib/camera.ts`); `wake-cube` at turn 0 and turn 1 differs in 0 pixels.
- **The body's shadow is out**, by the lead's ruling of 11:48Z: `body` is gone from the outdoor frame's packing and WGSL (`shared/outside/outdoor-frame.ts`); `Standing` and `OutdoorState` are deleted. Walk dropped its side at `877a26f5` — take walk at or after that with or before core at or after `df448bc2`.
- **The film is untouched**, by the same ruling: exposure 0.3, `daylightFilm` as it is.
- **Every frame is recorded.** `pnpm outside:cube` writes `<name>.shot.json` beside each frame — eye, lens (`null` is the floor's own), clock, viewport, commit — formatted as the repo's prettier leaves it.
- **`/dry` over the turn's diff** — `22733f77`: the two ways of the turn share one turning; `ROOM_DOORWAY`'s type derives from `DOORWAY`.

### Half-done

- **`/tend-prose` over the same diff** (since `3a72bbfc`): the added comment lines are listed and read, no edit made yet. Candidates worth a second look: the long docstring on `INTERIOR_TURN` in `turn.ts`, and "since only the eye and the sun go through it" on `doorwayWall` in `entities/world/model/geometry.ts` (that file is at exactly 400 lines — any edit there must not grow it).

### Owed

- `pnpm check:masd` and `pnpm masd:clusters` have not been re-run since the turn's commit. Green when last run on core: `pnpm typecheck`, `pnpm shaders:cube` (73/73), `pnpm type-overlap`, eslint on `src/cube/shared/outside`, the outside tests (13) and `camera.test.ts` (11).
- Nothing else is owed by core. Not core's: the wall clock's time (pill's, by the lead's routing — one rolled time, floor 1 reading 5:24 from the sun) and the sky about the sun (sky's).

### How to shoot core's frames again

Each frame in `docs/remove-before-merging/cube-intro-j2wt34/frames/core/` with a `.shot.json` beside it re-shoots from that file: check out its `commit`, then

```
pnpm outside:cube --out "$PWD/tmp/shots" --eyes <name>            # the floor's own lens (lens: null)
pnpm outside:cube --out "$PWD/tmp/shots" --eyes entering --indoors 0     # entering-fresh
pnpm outside:cube --out "$PWD/tmp/shots" --eyes entering --indoors 0.5   # entering-halfway
convert tmp/shots/<name>.png -quality 82 <name>.webp
```

`--out` must be absolute. The clock is the script page's stopped one (`PLAY_INSTANT`, 2026-11-01T12:00:00Z), the viewport 1280×800. Under SwiftShader a frame takes about 150 s, so start the shoot in the background and end the turn. The eight recorded frames (`doorway-out`, `room-doorway`, `entering`, `entering-fresh`, `entering-halfway`, `in-beam`, `wake-cube`, `wake-sea`) were shot at `001b3c9b`; the rest of the directory predates the records and the turn, as its README says per frame.

### What the peers were told

- **walk** — the turn's API (`toShell`/`toRoom`, `yawToShell`/`yawToRoom`); the body field is gone.
- **pill** — the doorway's wall, where the beam lands by room quarter at turn 1 (south-east 19%, north-east 6%, north-west 75%), and that `sunShade`/`sunBounce` take shell-frame arguments. Pill keeps decor out of the doorway (`clearZones`, `107f9524`).
- **sound** — `DOOR_IN_ROOM` is deleted on their side; they read `ROOM_DOORWAY`.
- **board** — v89 carries the recorded re-shots as 22 and 31–34, and the after pair as 44 and 45.
