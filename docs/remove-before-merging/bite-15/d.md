# D — a strafe by drag moves smoothly (call 35)

## The measure

A pure simulation over `pressAt`/`moveTo`/`liftAt`/`tickWalk`/`eyeAt` at
60 fps on tabL (1180×820): a finger pressed on the ground at 0.4 of the
width, 0.8 of the height, moving right at a constant speed, its events either
on the frames, at 60 Hz within ±3 ms of the frame boundaries (so a frame gets
none or two now and then), or at 125 Hz (a mouse). Per frame it reads the
eye's step, and from `stride.walked` the bob (`walking.ts`'s formula, 0.4 %
of the height) and the footsteps (one per `STEP_LENGTH`). "Jerk" is the mean
frame-to-frame change of the eye's step over the mean step; a stutter is a
frame stepping under half or over 1.5× the mean. The script is
`<scratchpad>/strafe-jerk.mts`, run as `ROOT=<checkout> node --import tsx`.

| commit              | case                  |   eye u/s |      jerk | footsteps/s | bob's most per frame |
| ------------------- | --------------------- | --------: | --------: | ----------: | -------------------: |
| any                 | `→` strafe key        |      1.60 |     0.000 |         2.0 |              0.34 px |
| 7d0b6871^, 7d0b6871 | 300 px/s, on frames   |      1.46 |     0.014 |         1.8 |              0.38 px |
| 7d0b6871^, 7d0b6871 | 600 px/s, on frames   |      1.45 |     0.019 |         1.4 |              0.38 px |
| ccfff90d^           | 300 / 600 px/s        | 1.46/1.45 |    ≤0.019 |     1.8/1.4 |              0.38 px |
| ccfff90d, today     | 300 px/s, on frames   |      4.01 |     0.002 |     **4.5** |          **0.89 px** |
| ccfff90d, today     | 600 px/s, on frames   |      8.38 |     0.006 |    **10.0** |          **1.75 px** |
| ccfff90d, today     | 300 px/s, ±3 ms       |      3.95 | **0.708** |         4.5 |          **3.28 px** |
| ccfff90d, today     | 600 px/s, 125 Hz      |      8.32 |     0.075 |        10.0 |              1.72 px |
| ccfff90d^ … today   | fling after 1200 px/s |      3.48 |     0.051 |   3.3 → 5.0 |       1.22 → 1.38 px |

7d0b6871 (call 37) changes nothing while the finger is down — its rows match
its parent's; it only stopped the lifted chase (fling row 0.21 u/s, no
footsteps, until eae780e2's fling). **ccfff90d (call 44) brought the jerk
in**: the eye stands wherever each finger sample puts it, and `chaseTo`
counts the whole of that move into `walked`, which paces the bob and the
footsteps. So:

1. **The bob and the footsteps run at the finger's speed.** A 300 px/s
   strafe moves the eye 2.5× a held key's cruise and a 600 px/s one 5×; the
   meadow bobs its 3.3 px 4.5 and 10 times a second (a held key: 2), and
   the footsteps patter as fast. The bob's own move per frame is 2.6–5× a
   key's. This is the shake a key strafe never has.
2. **`walked` moves only on a frame that got a finger sample**, so where the
   samples drift against the frames (none in one frame, two in the next) the
   gait (`gaitOf`, the frame's walked over its time) drops to 0 and back, and
   the bob snaps the full 3.3 px between frames (±3 ms rows).
3. The eye's own steps follow the samples 1:1 (jerk 0.002 on frames, 0.075
   for a 125 Hz mouse, 0.708 where samples straddle frames) — exactly as a
   sky turn's crop does (`pan.ts` `move`), which call 44 asks the ground to
   match; it is not changed here.

## Done

- **The fix, `stride.ts`.** `chaseTo` no longer adds the finger's move to
  `walked`; it owes it to the feet (`Chase.unstepped`, at most
  `UNSTEPPED_MOST`, a tenth of a second at the cruise), and `tick` steps
  them frame by frame (`following`) at the finger's blended pace, no faster
  than `STRIDE_CRUISE`. A fling's feet (`gliding`) are capped at the cruise
  likewise. The eye's place is still the finger's sample (calls 43, 44); the
  lift, the keys and a press are untouched (call 37: a key still yields the
  chase, a finger at rest still leaves the eye standing, a moving one still
  flings).
- **After** (same measure): every drag row and the fling bob at most
  0.34 px a frame, as the `→` key does, with 1.4–1.8 footsteps a second
  (key: 2.0), whatever the samples' timing. The eye's own step jerk is
  unchanged (row 3 above).
- **Tests.** `walk.test.ts` "bobs the meadow on a steady drag as a held key
  does…": a 300 px/s ground drag sampled 2 ms either side of the frames —
  every frame's `walked` step is > 0 and ≤ the cruise's; fails on today's
  code. `stride.test.ts`: a 30 u/s drag's feet walk `STRIDE_CRUISE · 0.2`,
  and a fling's first frame steps no faster than a key.
- `walk.ts` `holdStrafe`'s doc names `z`/`c` (package K's keys).

## Left

- Not changed: the eye's per-frame step follows the finger's samples 1:1,
  as a sky turn's crop does; where samples straddle frames it stutters
  (jerk 0.71). Smoothing it would lag the ground behind the finger, against
  call 44. Worth a look on the operator's device if the strafe still feels
  rough after this.
