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

**Verdict: no** (operator, 2026-11-12, «ну ок, ладно, убедил»). The port kept
floor 28 pixel-identical, but cost +82 KB gzipped on `/cube` for the runtime
that writes the WGSL, turned vector maths into `.mul().sub()` chains, named the
generated functions `item_1…`, and needed babel-loader under Turbopack. Of the
trial only the frame-rate meter (F) stays here; the port lives on in
`claude/cube-typegpu-trial` at 3cdb5134 until that branch is deleted.

Next for shaders out of strings: `.wgsl` files with WESL imports, the assembled
source of every floor pinned byte-for-byte before and after — trialled on floors
12 and 46 in `claude/cube-wesl-trial` (`pnpm shaders:codegen`,
`shaders-pin.test.ts`), the rest of the 80 files to follow. The pin test is
scaffolding for the move: once every file is over and `pnpm shaders:cube` plus
a look on preview agree, it is deleted (operator, 2026-11-12). With it:
`themeMaterial`'s per-floor `switch` as data, salts derived rather than
hand-picked, and `pnpm shaders:cube` in vet.

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
  (`kit/lib/core.ts`) would do: `dwelling/lib/dwelling.wgsl`, `14-laundry.ts`,
  `17-garage.ts` (two places), `15-nursery.ts`, `19-drawing.ts` (two
  places). `spaced` is the one-dimensional case of `repeated`. `pnpm
shaders:cube` after.
- `luma` still has a copy in `edge/lib/pattern.ts`, beside the kit's
  `kit/lib/luma.wgsl`; it goes when edge moves to `.wgsl`.
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
(`kit/lib/light.wgsl`), a limit left from the ceiling-only mirror, while the
reflection pass can mirror any plane. Let any polished face mirror, lamp
fallback for floors only. Cost: wall reflections fade at the screen edge, and
frames get slower — hence after item 1.

## 5. Next up after this review: price a room by travel time

Operator, 2026-11-12: «фиксируем идею поменять цену, мне кажется стОит
(разумеется она должна остаться "психологической")». Replaces `priceOf(n)`
(`max(1e7/8^(n-2), 4.99)`, `sale.ts`) with `$1M / (t − t0 + 1)^q + $5`, then
the shop's nines as `one-5` on the cube board states them. `t` is the time
for a player who knows the way: the mean arrival at the floor plus the room's
shortest-path steps from its landing at `RUN_SPEED`. `t0` is floor 2's landing.
q = 1.40 makes floors 2…9 total $10M. The board's `graf-price-time` sticky
holds the reasoning, and the calculator is at
https://claude.ai/artifact/LXqmTnBBegpvnTQmM4sGGm. Its sources are
`tmp/room-prices/` on the session's container and are not kept.

- No room costs over $1M (the landing of floor 2 is $1,000,005, which the shop
  rounding turns into $999,999). Every room fits Stripe's $999,999.99 cap, so
  the bitcoin route in `one-6` falls away.
- The arrival time is the per-floor mean from the fit, a constant. Exact arrival
  would need the holes above, which nothing holds.
- A room's price gives away its distance from the landing, and so where the
  landing is. That landing sits under the hole of the floor above. The page may
  show the price to someone standing on the floor, but no public price list by
  coordinates may exist, and one payment link per floor no longer fits.
  Checkout has to take the walked path (`space-url`) as proof and price the room
  from it.
