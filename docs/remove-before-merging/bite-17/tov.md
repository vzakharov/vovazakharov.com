# tov — `pnpm type-overlap` back to green

Done, one step, no behaviour change (types only).

The three groups from ae1d5fc and 0afbbfd, each extracted to a base named by
meaning and homed at the most upstream module the declarers already import:

| Group            | Base                             | Home                   | Consumers                                          |
| ---------------- | -------------------------------- | ---------------------- | -------------------------------------------------- |
| `origin` + `aim` | `Aimed = { origin: Point; aim }` | `model/line-course.ts` | `Line` there; `Chase` (`model/stride.ts`)          |
| `ahead: Point`   | `Facing = { ahead: Point }`      | `model/geometry.ts`    | `Line` (`line-course.ts`); `Drawn` (`map-view.ts`) |
| `gait: Gait`     | `WithGait = { gait: Gait }`      | `model/stride.ts`      | `Chase` there; `Walk` (`model/walk.ts`)            |

- `Line` in `line-course.ts` is now `Aimed & Facing`, no own members.
- `walk.ts` imports `WithGait` instead of `Gait`, which it no longer names.
- `Facing` sits in `geometry.ts` beside `WithMiddle`: `map-view.ts` does not
  import `line-course.ts`, and `geometry.ts` is the one module both import.

Checks: `pnpm type-overlap` clean, `pnpm typecheck`, `pnpm knip`, eslint and
prettier on the five files, and `geometry`, `stride` and `walk` tests green
(`line-course` and `map-view` have no test file).

Nothing left.
