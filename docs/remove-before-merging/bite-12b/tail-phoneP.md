# Package tail-phoneP — hand-over note

Step 5 of `tail-screens.md`, the phoneP screen: every play, one per call, on a
probe build of 54a1643c.

## Plays

| Play     | Result | Time       | Notes                                                                                               |
| -------- | ------ | ---------- | --------------------------------------------------------------------------------------------------- |
| opening  | green  | 13 s       | cap perch held 0.00 px over 34 turn frames                                                          |
| meadow   | green  | 1 min 34 s | 4/4 butterflies perched, 10/10 fly taps; 0 frames facing off; JS median 14.8 ms                     |
| walk     | green  | 34 s       | ↓ held 12 s walked back 19.000 (reckoned 19.000); 9 things under the cover, at most 14.4 px over it |
| approach | green  | 3 min 57 s | frame JS median 16.5 ms over 915; slowest frames 2.0–7.3 s (see below)                              |
| planting | green  | 14 s       | 1 flower planted; bees drank 6, pollinating 3                                                       |
| species  | green  | 2 min 22 s | all 6 tapped; a butterfly rested on a porcini; JS median 19.4 ms                                    |
| tufts    | green  | 11 s       | turned 0.559 rad, walked 0.80                                                                       |
| hold     | green  | 51 s       | 1 tuft came back where flower-5 stood                                                               |
| keys     | green  | 24 s       | 4-note melody grew 4; `l`/`h` plant and replace                                                     |
| veer     | green  | 2 min 6 s  | every looking-back release played; 11 sitters at ratio 1.00; 0 one-frame steps over bound           |

## Reds

None. No play went red on phoneP, so nothing in code or in `to-check.md`
changed. The butterfly-facing red tail-face traces did not show: meadow
counted 0 of 3464 butterfly flight frames facing over 0.3 rad off.

## Not red, worth a look

- **approach's slowest frames:** the same shape as on tabP. With a lawn call
  4552 ms (151 frames, median 16.5); with a perch re-sight 2050 ms (25,
  median 20.7); with neither 7323 ms (741, median 16.4). Every class has one
  and the medians are fine, so it reads as the container stalling (the run
  took 3 min 57 s) rather than the game. Not traced.
- **veer, ground to grow on:** headings 0.00 and 0.26 show room but 0 tufts;
  every other heading shows 7–31. Green, and those headings face the
  opening's forest and flowers, which likely cover the ground. Not traced.
- **veer, longest fly leg:** cap→air 5.65 s at 0.0 sizes/s, drawn 0%: a fly
  held in place out of view for a whole leg. Green; not traced.

## Frames

In `docs/remove-before-merging/frames/bite-12b/`:
`phoneP-veer-back-perched.png` (looking back on the narrow screen: a
butterfly on a leaning cap at the left, a near butterfly over the grass drawn
banked, one butterfly cut by the right side over the flowers),
`phoneP-approach-forest.png` (the forest at the horizon, a far grey cap
behind), `phoneP-species-butterfly-on-porcini.png`.

## Left

- Nothing on phoneP.
