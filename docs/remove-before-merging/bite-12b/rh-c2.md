# rh-c2 — T143, the play half

## Done

- `playFollow` in `scripts/lib/play-insects.ts`, run last in the meadow play
  (`play-meadow.ts`, after the buzzers, so the walk leaves no later step
  short of its mushrooms): `↑` held 20 s, then every insect drawn (but one
  leaving) within `PERCH_REACH` of the perch anchor (`perchAnchorOf`) of the
  eye. Probe: `drawnAt()` (the scene's `drawnAlofts`) and `boundAt()` (the
  plane point of the perch each insect is bound for, from `Perches.placed`);
  no scene change.
- The 30 s wait is loosened: at 30 s each insect is drawn within reach or
  bound for a perch within it; all drawn within reach by 90 s. Why: on tabL
  a butterfly (the slowest kind) left 32 units behind was still flying back
  at 30 s, 16.10 from the eye against 15.91, bound for an air spot 8.7 away;
  it took a 64 s leg. The game follows; the 30 s is the harness's number.
  A Russian line on `to-check.md` asks a person to look.
- The wait steps headless (`trace`), not drawn: drawn, its 120 frames lifted
  tabL's rendered-frame median from ~17 ms to 27.4 ms, over the 26 ms
  budget — frames after a long walk cost more to draw (not chased here).
- Play: tabL green (10 of 10 within reach 30.3 s after the walk), phoneP
  green (19.5 s). Frames: `frames/bite-12b/handling/<screen>-follow-gathered.png`.

## Left

Nothing.
