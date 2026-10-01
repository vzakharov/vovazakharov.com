# Bite 12 — type-overlap-lens

Done: `pnpm type-overlap` is clean. Type-only, one file
(`ui/scene/insect-shown.ts`); no runtime change. `pnpm typecheck` passes;
`insect-away.test.ts` and `insect-tap.test.ts` pass (`insect-shown.ts` has no
test of its own).

- `at` / `row`: the insect `Shown` now intersects `OverRow` from
  `insect-away.ts`, which it already imported. It is the same thing the base
  names: a point in the world and the ground row it stands over.
- `departs`: `Shown` takes `Pick<Span, 'departs'>` from `model/flight.ts`,
  not a new base. `freshShown` already seeds it with `pick(leg, 'departs')`,
  so it really is derived from `Span` (README § "Derived forms are
  invisible"). `flight.ts` is untouched.

The doc comments the bases took over now sit as inline comments on the
intersection.

Left: nothing.
