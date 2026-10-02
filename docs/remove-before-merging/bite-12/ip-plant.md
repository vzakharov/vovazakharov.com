# ip-plant — veer: the flower planted looking back

## Cause: the script's count, not the game

`perchesBack` judged the planting by `meadow.planted.length === sownFrom + 1`.
`meadow.planted` holds the bees' flowers as well as the child's, and the bees
released earlier in the play are still flying and sowing. Traced on tabL
(heading 1.83), logging after each tap:

| after the tap | buttons (CSS px)          | screen   | open  | chosen | planted |
| ------------- | ------------------------- | -------- | ----- | ------ | ------- |
| colour 0      | (342,64) … (838,64), five | 1180×820 | true  | true   | 15      |
| shape 0       | (404,64) … (776,64), four | 1180×820 | false | false  | **17**  |

The colour opened the shapes and the shape planted and closed the picker;
`planted` grew by two, one the child's and one a bee's, so the `+ 1` check
failed. The lead does not hold: the picker's buttons stand at fixed screen
homes (`flowerPicker(layout)` — the house's row and the caps' row across the
top), not laid out from the tuft; the tuft is only where they unfold from and
fold back into. Nothing in `controls.ts` changed, and shape 0 versus
`play-tufts.ts`'s shape 2 does not matter.

Fix (`scripts/lib/play-veer.ts`): count the child's flowers alone — a
`planted` entry with no `parent` (`isBeeSown`'s test, inlined in the page
expression).

## Runs (probe build of this branch, one screen per call)

| check                     | tabL                           | phoneP                                                                   |
| ------------------------- | ------------------------------ | ------------------------------------------------------------------------ |
| landing heading           | 1.83                           | 4.97                                                                     |
| looking back, grown       | 1 mushroom, 1 flower: **pass** | 1 mushroom, 1 flower: **pass**                                           |
| other failures (not mine) | fly / bee dash bound           | dash bound; fly 6/6 to the air (ip-Cplay4); frame median 27.3 ms over 26 |

Frames: `frames/bite-12/insect-plane/tabL-back-1.83-planted-flower.png`
(flower beside the grown mushroom at the far left),
`phoneP-back-4.97-planted-flower.png` (far right).

## Noted, not changed

`play-tufts.ts` makes the same `planted === before.planted + 1` check (with
the newest flower's seed besides). It passes in its own play, but a bee sowing
within its 80 frames would fail it the same way; not checked whether any bee
flies there.
