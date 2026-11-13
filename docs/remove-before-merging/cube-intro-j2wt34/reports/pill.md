# Pill's reports to the lead, newest first

## 2026-11-13 ~10:45Z — the facts for the beam comparison (for the lead, shell and the operator)

### How the two places on floor 1 are decided today

- **The hole is rolled once, when the world is planted, and then committed — nobody's code places it.** `plant()` (`src/cube/entities/world/model/plant.ts`) draws a random 64-bit seed and, per floor, a random landing room on the floor below; the hole is the quarter of the room above that landing. The planted world (`src/cube/entities/world/config/world.json`, seed 13628364118019185653, 67 floors) stores only a hash per floor (`world.holes`), and `holeQuarter()` (`model/hole.ts`) finds the quarter whose hash matches. So moving floor 1's hole means planting a different world (a new `world.json`), or a rule in `plant()`'s draw of the kind it already has for floor 2 (`keepsFloorTwo`: redraw until the world keeps a property). The files are the world's (`entities/world`), which no package of this build owns; the pill only reads them.
- **The shelf is derived from the hole, not rolled.** `shelfOf()` (`model/shelf.ts`, the pill's) puts it on the hole quarter's outer east/west wall, level with the hole; if that side is a door, on its north/south wall; if both are, on a post in the corner. Floor 1 is a single room with every side closed, so its shelf is always on the east or west wall beside the hole.
- **Decor repeats the shelf's rule** to keep furniture off it: `shelfSpot()` in `src/cube/features/decor/model/clear.ts`.

### Where they are for the planted world (the one every frame script uses)

Room sides, u east, v south; the room is 5 m.

- **Hole**: south-west quarter, middle at u 0.25, v 0.75, 0.08 across (u 0.21–0.29, v 0.71–0.79).
- **Shelf by the rule**: west wall, u 0, v 0.75, top 1 m up; the pill's middle about 1.01 m up, 8 cm off the wall.
- **Beam's footprint** (doorway on the east wall at v 0.055–0.249, 2.1 m high; `SUN_DIR` [0.847, 0.156, −0.509]): a strip of floor running west-south-west, at u 0.25 covering v 0.505–0.699, and on the west wall a patch v 0.656–0.85 from the floor to 1.18 m.
- **So**: the shelf by the rule and its pill are **inside** the wall patch (v 0.75, 1 m up). The hole lies along the beam's **southern edge**: its north-west corner is in the light (at u 0.21 the strip reaches v 0.723), the rest just outside. In the frame from the doorway the beam runs straight to both.

### What shell needs to stage them elsewhere (throwaway, for option (a) frames)

- **Shelf**: commit 4bd12485 on `claude/cube-intro-pill` is exactly such an override — `shelfOf()` returns a fixed `ENTRY_SHELF` for `room.n === 1` (east wall, u 1, v 0.75, facing west), and `shelfSpot()` in decor follows it. Cherry-pick it onto a scratch branch and change `ENTRY_SHELF.at` / `.facing` to stage any other wall. **It is reverted on the pill's branch** (see below): it was a hand-picked place.
- **Hole**: in a scratch, make `holeQuarter()` return a fixed quarter for `n === 1` (`{ qx: 1, qy: 0 }` is north-east, `{ qx: 1, qy: 1 }` south-east, `{ qx: 0, qy: 0 }` north-west) before the hash lookup. The floor is drawn open there and the shelf follows by its rule. The room below no longer lines up, which a frame of floor 1 does not show.
- **Frames of the override I already have** (page's default lens; in-room `shoot` on my branch takes no lens yet): `frames/pill/entry-*.webp` beside this folder — from the doorway looking west and along the beam (the shelf is behind the walker and in neither), and looking back at the east wall from the room's middle and from the hole (the shelf is a small dark plate in the dim, the pill not readable at that distance).

### Two more facts from the same look

- **Floor 1 is one room** (`roomsAcross(1)` = 1): no inner walls or doors on it, whichever face the doorway is in.
- **The doorway's place along its wall is one constant** — `DOORWAY.from/to` in `src/cube/shared/outside/frame.ts` (shell's). The beam tracer, the wall's panes and the ladder (`ladder.ts` reads the doorway's middle) all follow it. Its **face** is not a constant: `DOORWAY_BOX` is built on the east face.
- **Sun on each face** (cosine to the face's normal): east 0.85, north 0.51, west −0.85, south −0.51 — a doorway in the west or south face gets no sunbeam at all, only skylight.

### The plant in the doorway

Decor's, `src/cube/features/decor/model/clear.ts`: `clearZones()` keeps a walkway clear along an _open_ side only, and floor 1's east side answers "closed" to everything but the eye and the sun, so furniture may stand on the sill. The fix is a clear zone in front of `DOORWAY` on floor 1. No session I know of owns decor; I have been in that file for the shelf and will add the zone unless told it is someone else's.

### State of the pill's branch

- `a4111d04` — the lead's 2d258163 merged in. Typecheck green. One red from the merge, not the pill's: `pnpm test:all` fails `geometry.test.ts:106` ("draws a bought room's floor owned") — a normal is `[0, 0.9999999999999999, 0]` against `[0, 1, 0]` since the vector ops moved to `shared/lib/vec` (`unit3` scales by `1 / hypot`).
- `4bd12485` — the shelf moved by hand to the east wall, made before the notice that withdrew that direction reached me. **Reverted in the commit after this report**, so the model is as it was: the shelf by the hole.
- Owed: the pill sheets on floors 1, 2, 5 and a dark floor, the grip re-shot on shell's 3 cm round rung (`DOOR_LADDER.rung`), `/dry`, `/tend-prose`.
