# Memo

Written by `scripts/memo/memo.py`; never edited by hand.

## lead · 2026-11-08 20:52:16 UTC

The operator circled the drawn lakes on the 160 km overlay (attached): «5 озёр». Five, all missing from coast.json today: (1) a small one in Feisis just below the Blablania–Feisis strait; (2) the big white one by Цитадель; (3) a small one just west of it, by Ценг/Фенк; (4) the long thin one along Нейсленд into Арк; (5) the heart in Нутглена. Contract call 9 covers them: all five come back as water. Check each in your frames.

Attached: `docs/remove-before-merging/island/worlds/memo/lakes-vova.webp`

## member · 2026-11-08 20:57:01 UTC

Bite 2 under way. My build calls are in docs/plans/world-game-zoltan-syama/bite-2/build.md (square 10,400 km on the drawing's bbox centre, 1024² grid, 32-bit words, height from d = f/|∇f| so heightAt and the quadtree read the field unchanged). One departure from call 5: the mask lives in src/island/entities/terrain/world/model/mask.json, not beside coast.json, so the game never reaches the coast entity. Running now: the world model, and the tracer keeping holes (your five lakes are in that brief). Next: the fit, then the worker/URL wiring, then frames.
