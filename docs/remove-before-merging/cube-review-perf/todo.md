# Cube review and optimization — the list

Review of the liminal cube as merged in #273 (`cube-liminal` tag, fe6c7f83).
This PR is based on `review-base/cube-liminal` (main before #273, the
`cube-before-liminal` tag), so its diff is the whole cube plus the fixes; once
the review is done its base switches to `main` and only the fixes land.

The operator's review comments — on the board and on this PR — come first. The
items below are what land prep of #273 found and deferred here, in order.

## 0. Shaders out of strings — a TypeGPU trial

From the board thread on `dwelling/lib/home.ts` (2026-11-12): the operator
asked how to stop writing whole programs in strings. On the table: `.wgsl` files
with WESL imports and `@if` (the source stays byte-comparable, so the look is
provably unchanged), or TypeGPU (shaders as TypeScript, typed bindings and
uniforms; the look can only be checked by eye). The operator chose to try
TypeGPU on the reflection pass first, judged by floor 28's puddles side by side
with `cube-liminal`.

- Done in a child session on `claude/cube-typegpu-trial`, branched off this one,
  no PR of its own: kept, it merges here and shows on this PR's board; dropped,
  the branch goes.
- It ports before item 1 touches the same pass, so a difference in the picture
  has one suspect.
- Still open whatever the trial says: `themeMaterial`'s per-floor `switch` as
  data, salts derived rather than hand-picked, and `pnpm shaders:cube` in vet.

## 1. Performance of what exists

The floor reflections already stutter (operator, 2026-11-12).

- Every floor pays for the reflection pass and its mip chain, even a floor with
  no polished surface. Skip both where no material has gloss.
- Two extra `rgba16float` targets are written every frame
  (`MIRROR_FORMATS`, `src/cube/pages/cube/ui/reflection.ts`).
- The plan estimated the pass at 1–2 ms on an integrated GPU, never measured.
  Measure first, on preview slot 1 against `cube-liminal` on slot 2.
- The reflection walk reads half-float depth from the scene's alpha, which is
  why the `BLUNT` and `LEAVING` workarounds exist; reading the `depth32float`
  attachment (it needs `TEXTURE_BINDING` usage) could replace both.

## 2. Duplication

- Lattice maths still spelled out where the kit's `repeated`/`spaced`
  (`kit/lib/core.ts`) would do: `dwelling/lib/home.ts`, `14-laundry.ts`,
  `17-garage.ts` (two places), `15-nursery.ts`, `19-drawing.ts` (two
  places). `spaced` is the one-dimensional case of `repeated`. `pnpm
shaders:cube` after.
- One hexagonal lattice written twice: `hexagon` in
  `dwelling/config/12-bathroom.ts` and `honeycomb` in
  `laboratory/lib/small-world.ts`. Into the kit or not is a call for the
  operator — every floor's shader would carry it, for two users.
- The full-screen triangle three times: `COVER` in `reflection-shader.ts`,
  bloom's `vertexMain`, the lens's in `lib/shader.ts`.
- Two pipeline builders: `reflection.ts`'s `covering` and `bloom.ts`'s
  `pipeline`; `RENDER_ATTACHMENT | TEXTURE_BINDING` spelled out in both.
- Mushrooms: `__probe.bounds(...)` evaluated in three places
  (`run-follow.ts`, `play-species.ts`); the bee-release loop repeated in
  `play-buzzers.ts` and `play-approach.ts`.

## 3. Leftovers

- Three tests still assume floor 67 instead of `DEEPEST_FLOOR`:
  `features/voice/model/line-for.test.ts`, `utter.test.ts`, and
  `scripts/voice-cube.ts`'s `DOWN`.
- `DESIGNED` in `catalogue/config/floors.ts` was named against `generic`,
  which is gone.

## 4. After performance: every polished face mirrors

From `/five-percent` on #273
(https://github.com/vzakharov/vovazakharov.com/pull/273#discussion_r4548136117),
accepted for after item 1: `roomLight` mirrors only under `s.normal.y > 0.9`
(`kit/lib/light.ts`), a limit left from the ceiling-only mirror, while the
reflection pass can mirror any plane. Let any polished face mirror, lamp
fallback for floors only. Cost: wall reflections fade at the screen edge, and
frames get slower — hence after item 1.
