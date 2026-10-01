# ip-C3 — step 2 of package C: tests for the drawn seat

## Done

- `src/pages/mushrooms/ui/scene/flower-sight.test.ts` (new): `flowerLiftAt`
  against `flowerLift` and its own inputs only. At one shared zoom it is the
  layout lift times that zoom. At two zooms it is the layout lift of the head
  scaled by `host / insect`, times `insect`. A butterfly and a fly sit above
  the head's middle and a bee below it. A butterfly moves with the drawn
  centre. A fly ignores the flower's zoom. A bee keeps its rim gap and face
  floor at the insect's zoom. Where the two zooms differ, the lift differs
  from the layout lift at the flower's zoom.

## Blocked: `seat`'s and `capTop`'s `drawn`

`FlowerBed.seat` and `MushroomBed.capTop` are methods on classes in modules
that import `phaser` at the top. Phaser touches `window`, `Image` and a 2D
canvas context when it loads. Node has none of these, and the repo has no
jsdom or canvas. `pnpm test` runs without `--experimental-test-module-mocks`,
so `mock.module` is not available either. No test in the repo imports
either bed. The options:

1. **Pull the drawn-seat arithmetic into pure functions** that the beds
   call: the flower's `drawn` from `(laid.place, turn, head, spot, stands,
reach, size, kind)`, and the cap's from `(laid, rotation, scale, stands,
seat)`. Put them in `bed-place.ts`, or in a new `bed-seat.ts`, and test
   them there. This is a small production change (about 30 lines moved),
   and it is the only option that tests the real code. It needs the
   orchestrator's yes, because the brief allows production edits only for
   a bug.
2. **Fake a browser in the test** (globals for `window`, `document`,
   `Image` and a canvas context good enough for Phaser's device checks),
   then fill a bed's private `shown` map with `Object.create`. I measured
   this one: it took 3 rounds of stubs and still failed inside Phaser's
   canvas feature checks. It is fragile, and it reaches into private fields.
3. **Test the composition only through its pure parts**: `flowerLiftAt`
   (done) and `onHost`/`placedAt` (covered in `bed-place.test.ts`). This is
   what stands today.

When I read both methods against the contract, I found no bug. `seat`'s
`drawn` equals `onHost` of the laid seat whenever `stands.zoom` equals
`CLUMP_DISTANCE / stands.ahead`, because `flowerLiftAt` is homogeneous (the
test above pins this down). `capTop`'s `drawn` is `onHost` of a point laid
at `seat · scale / zoom`, which is the cap point as the graphics draws it.
It has no insect part, so the two zooms cannot pull it apart. The known
≤ 1.2% gap between `seat`'s insect zoom (bend at the foot) and
`seatedZoom` (bend at the seat) is ip-C1's finding, left as built.

## Left

- `seat`/`capTop` `drawn` tests, waiting on the choice above.
