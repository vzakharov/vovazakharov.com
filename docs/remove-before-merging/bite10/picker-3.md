# Bite 10, picker layout (group `picker-3`)

## Done

- ebf8249 controls test sweeps every picker stage (caps, house, colours,
  shapes) on VIEWPORTS + 280×600 + `TURNED_SMALL` (568×320, 600×280):
  r ≥ TAP_RADIUS, on screen, apart within the stage, `PICK_CLEAR` (6.4 px,
  the gap a picker's own buttons keep) off every button still shown
  (`shownOverPickers`). Fixes: phoneL rows narrowed off the house; small
  phone dropped row clears the cornered house; 568×320 / 600×280 rows
  finger-sized in the top row, insects + house give way
  (`Controls.yielding` is now a list). Split: `tap-reach.ts`,
  `picker-rows.ts`. `SUN_SMALLEST` 0.2 -> 0.1.

- Played phoneL (probe build): pass; tuft colours/shapes, species and
  house frames looked at, every picker clear of the house.

## Left

- 568×320 is not a play-script screen, so its look is unshot.

## Decisions

- Short sky: picker opens in the top row over the insects and the house,
  which hide while it is open (alt: a row under the top row — lies over
  the caps, breaks "mushrooms off the controls" and flowers-in-sight on
  a turned small phone).
- Picker-to-control gap = PICK_CLEAR (alt: 0, touching; GROW_GAP/2 = 8,
  which pushes phoneL's house row off the top).

## Defects seen, not fixed

- Squat windows ~320–360 px both ways (no phone): a picker row meets `−`;
  no room for the row anywhere at a finger's size.
