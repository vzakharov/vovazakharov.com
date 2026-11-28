# Wave 3, package B — the bridge and the false fade

Status: **done and reported** to the lead (branch `claude/horowo-clip-w3-b-lrxscd`).

## Built

- `wardSinking(sinking)` — `src/clip/widgets/ward/ui/sinking.ts`. The bridge's spine, one shot over the
  whole section (77.66–96.14): a slow zoom onto his face (2.9× at the end), the eyelid sinking, a jerk
  half awake at each return from a look away; the bunny takes a step during each look away
  (`STEPS` in `ui/cast.ts`) and sits down beside him after the last. Then the fade to black and the
  breaths, each brighter, the last lighting the bunny's eyes and opening his.
- `halfDream(drawing, { under, seed })` — `src/clip/shared/timeline/half-dream.ts`: any `Drawing`
  slowed, spun, sheared and drifted inside a wobbling oval; mirrored halves from `under` 0.55.
- `wardHole` (breakdown) and `wardInsert` (chorus) keep their exports and pictures.

## The pool

`HALF_DREAMS` at the top of `src/clip/pages/horowo-clip/ui/shots-bridge.ts`. Insert `n` takes
`HALF_DREAMS[n % length]`; the six looks away are `AWAY` (in beats), each 0.5 beat longer than the
last, `under` = (n + 1) / 6. To bring in a new storyline, replace a slot: rocket ears at slot 2 or 5,
the spoon bunny's back view at slot 6 (deepest, just before the bunny sits).

## Measured on the master

The vocal stem ends at 89.6 s, so the lull's «о о о о о» are read off the master's 400–2500 Hz band:
onsets **94.20, 94.62, 95.01, 95.41, 95.80**, each about 0.3 s with a dropout before the next
(`BREATHS` in `shots-bridge.ts`). The fade runs beat 38.5 → 42.8 of the bridge (92.47 → 94.12).

## Next

Nothing in the brief is left. Open to tune: the first two inserts are gently bent; the bunny's sit
reads as its head lowering, the cot being out of frame by then.
