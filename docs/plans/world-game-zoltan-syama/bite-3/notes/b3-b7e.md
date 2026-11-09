# b3-b7e — call 17: a look hint stays up three seconds

Base c8a3f163, branch `wt/b3-b7e`. Contract bullet from `island/stretch-2`
e2b50cc3. Built and checked; not yet looked at in a browser.

## Why it flickered

On a held Q from orbit (16:9, 60 fps, flat ground) the raw `lookHint` is:

| hint | for     | heights              |
| ---- | ------- | -------------------- |
| none | 1.25 s  | 20,000 km → 2,930 km |
| up   | 0.083 s | 2,850 km → 2,540 km  |
| none | 4.48 s  | 2,460 km → 1,072 m   |
| up   | 2.28 s  | 1,042 m → 20.5 m     |
| down | —       | 19.9 m → 2 m, held   |

The first "up" is the flash Vova missed: 5 frames. 1:1 gives 0.05 s, 1:2 0.2 s;
30 and 144 fps the same within a frame.

**No flap at a threshold**: under a held climb the height falls monotonically
(the eased height converges on its aim without overshoot), so each threshold is
crossed once; hovering at 19 m and 21 m while steering over 30 m hills keeps one
hint for 20 s, the height counting from the eased floor. So no debounce for
"lapsed": one tick without the condition re-arms it. (`tmp/b3-b7e/measure.ts`,
not committed, made these numbers.)

## What landed

- `features/eye/model/look-hint-latch.ts`: pure `latchHint(latch, earned, now)`
  → `{ earned, showing }`. A hint shows on a tick that earns it after one that
  earned anything else, stays `LOOK_HINT_LIT_SECONDS` (3) lit plus
  `LOOK_HINT_FADE_SECONDS` (0.5) fading, whatever its condition does meanwhile,
  then goes. `showing` is a fresh object per showing.
- **Up → down**: the other hint replaces one still up at once, with its own full
  span (a different instruction; "↑" at 20 m would be stale advice). A lapse to
  none does not cut a hint short — that is what keeps the 0.08 s flash readable
  — so a hint the player has just obeyed stays out its span.
- `island-scene.ts` feeds it the seconds its frames have stepped (paused with
  rAF in a hidden tab, so an unseen hint keeps its time) and tells `onLookHint`
  the showing on change.
- `island-canvas.tsx` renders the showing in a `<span>` keyed by `since` inside
  the unchanged `<output aria-live>`, the glass moved onto the span (Sass
  `glass` mixin shared with `.where`) so it fades with the text; CSS
  `look-hint-fade` keyframes, delay and duration set inline from the two
  constants; `prefers-reduced-motion` cuts instead of fading.
- On the descent above: up at 2,850 km for 3.5 s; up again at ~1 km; down at 20
  m replacing it after 2.3 s, then 3.5 s.

## Checks

`look-hint-latch.test.ts` (held, one showing, lapse at once, lapse and return,
single-tick lapse, up→down, held descent from orbit); 142 tests over the eye
model and the island page; tsc (vova), eslint, prettier, stylelint; check:masd,
check:cycles, masd:clusters, type-overlap, check:poison, knip (exit 0;
`LookHint` dropped from the eye's barrel, now read only inside it).
