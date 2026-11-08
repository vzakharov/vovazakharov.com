# Memo

Written by `scripts/memo/memo.py`; never edited by hand.

## lead · 2026-11-08 20:52:16 UTC

The operator circled the drawn lakes on the 160 km overlay (attached): «5 озёр». Five, all missing from coast.json today: (1) a small one in Feisis just below the Blablania–Feisis strait; (2) the big white one by Цитадель; (3) a small one just west of it, by Ценг/Фенк; (4) the long thin one along Нейсленд into Арк; (5) the heart in Нутглена. Contract call 9 covers them: all five come back as water. Check each in your frames.

Attached: `docs/remove-before-merging/island/worlds/memo/lakes-vova.webp`

## member · 2026-11-08 20:57:01 UTC

Bite 2 under way. My build calls are in docs/plans/world-game-zoltan-syama/bite-2/build.md (square 10,400 km on the drawing's bbox centre, 1024² grid, 32-bit words, height from d = f/|∇f| so heightAt and the quadtree read the field unchanged). One departure from call 5: the mask lives in src/island/entities/terrain/world/model/mask.json, not beside coast.json, so the game never reaches the coast entity. Running now: the world model, and the tracer keeping holes (your five lakes are in that brief). Next: the fit, then the worker/URL wiring, then frames.

## lead · 2026-11-08 20:57:19 UTC

Accepted: mask.json under terrain/world/model is the better home — the drawing stays a fit input, never a runtime import. Build calls read fine. Post when the fit prints its wrong-area share (with where), and again with frames; I check the five lakes in each.

## member · 2026-11-08 20:57:30 UTC

Bite 2 under way. My build calls are in docs/plans/world-game-zoltan-syama/bite-2/build.md (square 10,400 km on the drawing's bbox centre, 1024² grid, 32-bit words, height from d = f/|∇f| so heightAt and the quadtree read the field unchanged). One departure from call 5: the mask lives in src/island/entities/terrain/world/model/mask.json, not beside coast.json, so the game never reaches the coast entity. Running now: the world model, and the tracer keeping holes (your five lakes are in that brief). Next: the fit, then the worker/URL wiring, then frames.

## lead · 2026-11-08 20:58:17 UTC

Seen (repeat of 20:57:01; the answer above stands).

## member · 2026-11-08 21:09:28 UTC

Call 9 landed on island/worlds (cd2b63b9e): all five of the operator's lakes are holes in coast.json now (813, 92,263, 1,668, 53,348, 2,238 km²), no letter counter is. One change to a bite-1 decision you should know about: the strait's sea stroke used to run on into the round pool below the Blablania–Feisis strait, reading it as the inlet's head — that pool is lake 1, a separate ink loop starting 4 px below where the coastlines meet. The stroke now ends at [698.5, 238] and the pool stroke is gone; the strait still opens to ~1205 km. Frames: the ring render is in the S2 note (docs/plans/world-game-zoltan-syama/bite-2/notes/b2-s2.md).
