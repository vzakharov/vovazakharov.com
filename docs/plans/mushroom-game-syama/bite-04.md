# Bite 4 — The mouse house

What bite 4 built, as `## Eaten so far` in `docs/plans/mushroom-game-syama.*.md` indexes it.

4. **The mouse house.** A house button under `−` (a fly agaric with two
   windows and a door) opens a picker of Syama's window row — `⊕`, `○`, `□`,
   the tall `▯` — and the door, sharing the top band with the cap picker; a
   pick furnishes the selected mushroom, or the newest, and the picker stays
   open for the next. Windows sit in a row along the cap's lower band, each
   taking the place of any spot it touches; the door stands at the lowest
   station on the stem that the mushrooms in front leave in sight
   (`door-sight.ts`), and now and then it swings open and a mouse looks out,
   blinks and ducks back. A tap on a door calls the mouse at once with a
   squeak. What the next bites build on:
   - `model/house.ts`: `WINDOW_KINDS`, `FURNISHINGS`, `House`, `PANE`,
     `windowSlots` (three or five, never four, so a full row balances;
     centre first, then mirrored pairs, in the cap frame) and `doorStations`
     (the mushroom frame). `house` lives on `Planted` in `game.ts`, which
     gains `house` (toggles the picker, `Meadow.furnishing`) and `furnish`;
     `canFurnish` is the can-act check. The pickers close each other, and one
     opening hides the other at once rather than folding it.
   - `motion.ts` gains `peek`, `peekAfterTap`, `mouseOut` (the one the scene
     reads), `lookAbout` and `blink`; `geometry.ts` gains `clipToConvex`,
     which clips the mouse to its doorway.
   - `button.ts` (a button's press and shake) and `picker.ts` (unfold and
     fold on the clock) serve both pickers; `house-view.ts` keeps a graphics
     per mushroom that copies its pose every frame, so the house follows
     every breath, wobble, emergence and sinking; `draw-house.ts` and
     `draw-mouse.ts` paint. `sound.ts` gains `knock` and `squeak`.
   - Placement per screen: five in a row under the sky on tablets, desktop
     and phone portrait; on phone landscape the house button stands left of
     `+`; on a 320 px phone four in the row and the fifth beside the mute,
     the house button top right. `layout.test.ts` sweeps them all.
   - `scripts/lib/play-house.ts` plays the house: every kind, a full row and
     a second door shaking with no change, a door tap bringing the mouse out
     without changing the selection, the pickers closing each other. A full
     run takes ~8 minutes: build once, then `--no-build`.
