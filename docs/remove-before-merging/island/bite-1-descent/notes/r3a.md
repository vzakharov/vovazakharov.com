# R3a — relief in the height function

Done: `height.ts` octave plan, `height.test.ts` relief test. Left: play run and
frames.

- 17 octaves, 400 km → 6 m, amplitudes (m): regional 600, 380, 260, 200
  (400–50 km, scaled to 0.25 near the coast as before); hill band 240, 220,
  190, 150, 110, 75, 45 (25 km–390 m, full size everywhere, `humped`: bent onto
  [−0.23, 1] so valleys are shallow and flat-bottomed); fine 20, 10, 5, 2.5,
  1.25, 0.6 (195 m–6 m). Per-octave coastline fade unchanged.
- Real coast, seed 1: land p50 575 m, p90 1 101 m, p99 1 501 m, max 2 100 m.
  Std over a 10 km window 62–116 m, over 200 m 7–17 m, over 4 m 0.05–0.5 m.
  0.53–0.59 µs/sample.
- Surprise: an odd reshaping (`n·(a + b|n|)`) cannot skew noise; symmetric
  hill-band troughs sank ~1% of the land past 30 km inland under the sea. The
  parabola keeps it to 15–31 points of 50 943 (baseline 0–8), lows −60…−73 m.
