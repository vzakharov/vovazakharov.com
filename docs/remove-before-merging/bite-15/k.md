# K — strafe keys (call 34): hand-over

## Done

- `ui/scene/keyboard.ts`: `z`/`c` (`KeyZ`/`KeyC`) are `strafe` move keys,
  `.`/`/` (`Period`/`Slash`) step the octave, `x` is unbound. Every move key is
  one entry of `MOVES` and lets go on its own release (`letGoMove`, one key,
  replacing `letGoMoves`); Shift is no longer read (`Pressed` drops
  `shiftKey`), so the Shift hand-over in `listenForKeys` is gone. The key
  types keep their shape, so `instrument-input.ts`'s and `eye-input.ts`'s
  dispatch is unchanged; only their comments name the new keys.
- `model/walk.test.ts`: a strafe key and a turning arrow held together, 2 s,
  frame by frame: every frame's step is square to the heading of that frame
  and leftward, the heading turns > 0.1 rad, the eye moves > 2 units and the
  side pace is the cruise. It passes with `model/` untouched: the pan
  (`walk.pan`) and the strafe (`walk.stride.held`) are separate holds that
  `tickWalk` ticks in turn.
- Plays: `play-walk.ts` holds `KeyC` where it held Shift+`→`;
  `mushroom-probe.ts` gains `STRAFES`/`Strafe` (`KeyC: 67`) beside `LETTERS`
  (the note letters, which `play-keys.ts` maps to sounds) and drops the `key`
  call's `shift`, which no play presses any more (`play-mushrooms.ts` with it).

## Left for others

- `model/walk.ts:385`, package D's: `holdStrafe`'s doc still says "Shift with
  `←` or `→` went down"; it should say `z` or `c`.
