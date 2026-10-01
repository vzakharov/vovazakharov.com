# Bite 12 — `model` package hand-over

## Done

- `model/weather.ts` + `weather.test.ts`: `Rain`, `RAIN_MS`, `raining`,
  `wetness`, `downpour`, `rainbow` (ms, the insects' clock).
- `model/game.ts` + `game.test.ts`: `Meadow.rain` (`undefined` in
  `firstMeadow`), action `{ kind: 'rain' } & Timed` — restarts the time of a
  falling shower keeping its start, else a fresh span; shuts the flower
  picker, nothing else. `tick` unchanged.
- typecheck, type-overlap, knip clean; weather, game, planting, swarm tests
  pass. No other file builds a `Meadow` literal; the probe schema is untouched.

## Decided

- The span's keys are `startedAt` / `stopsAt`, not the plan's `start` / `end`:
  `start` collides in `pnpm type-overlap` with `pan.ts`'s `Gliding.start`, a
  position, so a shared base would be a lying key; the README's rule for a key
  that is ours is to rename it.
- `downpour` stops dead at `stopsAt` (drops already in the air are the scene's
  to finish); `wetness` eases 1.5 s each way; `rainbow` 1.5 s in, 8 s held, 3 s
  out, from `stopsAt`.
- Easing reuses `motion.ts`'s `smooth`; `outAndBack` there is private and off
  this package's files, so `rainbow` spells its rise-hold-fall inline.
- A new shower under a rainbow puts the rainbow out at once (the span is the
  only state); the plan's "fades it out" needs the scene to fade it, or a
  second field in the model.

## Left

- Nothing in this package. The scene wiring is the next agent's.
