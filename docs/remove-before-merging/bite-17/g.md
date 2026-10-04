# Package g — grass over the brow at dusk

Done; landed as one commit on the shared branch.

## Cause

The seam's grass (`seamGrass` in `grass.ts`) was rooted just under the seam
where the ground meets the near hills' foot, about `groundTop`. The brow
(`browRow`) runs at `groundTop` only at the screen's middle and bends lower
toward the edges, and the seam wavers above `groundTop` too, so a share of
those tufts stood above the brow, drawn at depth 0 over the near hill's foot.
By day nothing hid them: they were toned into the day ground (`tuftColours`,
85 % toward `groundAt`), which is close to the near hill's day green, so they
were camouflaged. At dusk the hill is relit live (`relight` → `drawHills` in
dusk tones) while the tufts keep their day tones, so they stood out light green
on the dark hill.

## Fix

`SeamTuft` now holds where it stands (`azimuth`), how far below the brow it is
rooted (`below`, a share of the ground's depth) and its breeze `phase`;
`seamShown` roots each at `browRow(view, x) + depth * below` and sizes and
tones it from that row. Every tuft is on the near side of the brow at any
heading and any duskness, so it never stands on the hills. The random draws
keep their order, so the same seed grows the same grass. `ground-seam.test.ts`
gains "roots every tuft under the brow at its x, on every heading".

## Frames

`tabL` dusk play looked at day, mid and dusk: no tuft above the brow.
`docs/remove-before-merging/frames/bite-17/g-brow-dusk-tabL.png`.

## Noticed, not mine

Every tuft keeps its day tones at dusk (`tuftColours` reads only `DAY`), so the
lawn's grass is brighter than the dusk ground under it.
