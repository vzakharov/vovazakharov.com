# gt — the steps/flight toggle

Branch `wt/gt`. Lands as one squash commit on the shared branch.

## Done

- `ui/scene/gait-icon.ts`: `drawGaitButton(graphics, r, gait)` — the disc,
  two bare footprints (`steps`) or a raised wing (`flight`).
- `eye-input.ts`: `gait()`, `flipGait()`; `controls.ts`/`control-actions.ts`:
  the `gait` button, flipped, popped, repainted, hidden under the open map
  and, where it yields, under an open picker.
- Placement (`gait-spot.ts`, called from `layout.ts` after the sun and the
  cross): the controls are placed with the gait standing on the map button,
  so nothing reacts to it; `gaitSpot` then takes the first free spot of:
  right of the map (reaches touching), under it, nearest free on a 4 px grid
  through the map's centre. Free = sky, clear of every standing button, the
  pickers' stages (`PICK_CLEAR`; `PICK_APART` for the four-button rows in
  its band), the sun's rays + `BUTTON_INSET`. A sky with no free spot (tiny
  windows only, none of `VIEWPORTS`) has it give way to an open picker
  (`yielding` gains `'gait'`), the last resort anywhere on the screen
  clear of the rays. Every other placement, sun and cross included, is
  byte-identical to the pre-gait layout on an 858-screen sweep.
- `GAITS` const in `model/stride.ts`; the probe's schema and `play-map.ts`
  derive from it.

- Play run (tabL, phoneP): footprints read; the wing was enlarged and its
  feather notches deepened. Frames in `docs/remove-before-merging/frames/bite-17/`.

## Left

- Nothing in this package. Open question for the orchestrator: on a phone
  held upright the nearest free spot is mid-sky beside the sun (178,214);
  the top row right of the bee (350,46) is also free but farther.
