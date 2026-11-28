# Package V — the verse's bedroom: state

Done: the operator's note 6 is built, the gates are green, and the report has gone to the lead. Head before this file: b6ad61a1.

## Built

`src/clip/widgets/bedroom/` has two sub-slices: `room/` (the set — walls, waking wallpaper, window, bed, TV, sweat; palette) and `verse/` (`scene.ts`, the room under a `Camera` and a `Room` state; `lines.ts`, one drawing per line). Exports from `@/clip/widgets/bedroom`, wired in `shots-verse.ts` in this order: `wakeUp`, `coldSweat`, `wallWakes`, `offTheWall`, `summerWindow`, `reverseAngle`, `troublesRetreat` (to `BEDROOM_CUES.soGood`, 42.32), then `soGood` (42.32 to the chorus). The seven calls stay `channel(n, nearness)`.

Outside the widget: `src/clip/entities/bunny` gained `wallpaperEyes` (new `ui/wallpaper-eyes.ts`) and exports `motifAt`.

## Wiring for the lead

- Spoon bunny's back view: replaces `reverseAngle` in `line(5, …)`.
- «Так хорошо-шо-шо» (42.56–43.64): the lead's lettered stack goes over `soGood`. `soGood` draws no lettering, only the camera stepping in on each «шо»; if it fights the stack, swap it for `troublesRetreat` held to the chorus.
- `BEDROOM_CUES` copies onsets from `words.ts`; point it at package W's lines if they are exported.

## Next

Nothing. Weaker: the sweat drops read as cartoon, not «сочном».
