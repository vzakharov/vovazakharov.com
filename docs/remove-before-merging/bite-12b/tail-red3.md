# Package tail-red3 — hand-over note

## Done

- **Red 3, `play-insects.ts:343` "no butterfly ever rested on a cap to be
  tapped through" on tabL — the harness's.** The play lives in the `meadow`
  play (`play-meadow.ts` calls `playInsects`). Its `waitForCapRest` looked
  `MOST_LOOKS` × `LOOK` = 1200 frames = 20 s. Measured at 2ce1862 over 90 s
  from that wait's start (4 butterflies, 2 grown caps, 14 flowers in sight):
  22 legs, 8 of them to a cap; flights 5.0–30.3 s, median ~13 s; the first
  cap rest seen at 20.3 s (butterfly-2 on mushroom-4), then 42.8 s and
  57.8 s. In the red run that same butterfly landed on its cap 14 ms after
  the window shut. So the game does seat butterflies on caps; the window
  was shorter than one leg.
- Fix: the cap-rest wait looks every `CAP_LOOK` = 45 frames (a minute over
  `MOST_LOOKS`, inside `REST_LOOK` = 123, so no rest is stepped over); the
  wait for a rest on one given selected cap looks every `REST_LOOK`
  (~164 s) to stay longer than the any-cap wait. `play-species.ts` uses the
  same default wait, so it gets the minute too.
- Re-run, tabL `meadow`: red 3 green — "tapped through the cap's middle",
  b6-resting (a butterfly on the selected cap) and b7-takeoff all reached.
- Frame: `frames/bite-12b/tabL-butterfly-resting-on-selected-cap.png`.
- `to-check.md` § "Хвост 12b, бабочки на шляпках": whether the wait for a
  butterfly on a cap, and a 30 s leg across a wide screen, feel too long.

## Left

- Still red on tabL `meadow`, not this package's and not looked into:
  "butterfly-1 (butterfly) faced 0.39 rad off the way it flew at 24733 ms,
  past its leg's first 150 ms" — the butterfly sent `away` (left), turn
  −1.07, from the flier watch. Red on every one of my three runs, same
  numbers (deterministic).
