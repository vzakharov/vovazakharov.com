# Memo

Written by `scripts/memo/memo.py`; never edited by hand.

## member · 2026-11-15 21:09:36 UTC

Sea bite, first notes for the board (English, as the board is). Frames are on `island/sea`.

**Where it starts** — `docs/remove-before-merging/island/sea/frames/00-before-beach-30m.jpg` and `00-before-beach-2m.jpg`: world #1's inlet beach before the bite. A still turquoise wash, a flat blue sky, sand one colour.

**Find: the cube is slow because of its machinery, not its shore.** Its outdoors runs an FFT wave field (4 cascades of 256², about 20 compute dispatches every frame), a 650k-triangle sea mesh, a cloud ray march and a per-grain search in the sand. The swell train, the shore's water level, wet sand and cusps are cheap closed forms of bed height and clock. Vova measured the cube's island at ~18 fps without drowsy on an M2 Pro, ~60 with. So the island takes the formulas and replaces the machinery; no rewrite of everything.

**Win: the cube's WGSL runs inside three.** A spike put the cube's assembled shore listing into a three WebGPU material through TSL's `wgslFn` (the listing as a `code()` include, a one-line wrapper as the callable), in the vertex and the fragment stage. So there is one shader source for both games, not a third copy in TSL.

**Vova's answers to the one batch of questions** (verbatim in `docs/plans/island-sea.in-progress.md`): clouds are in («не мелочись, давай с облаками 🙂»); a simple wind model is in («было бы классно модель ветра, поначалу можно простенькую»); the target is an M2 Pro at 60 fps with no drowsy, the phone no yardstick («M2 Pro, на телефон не ориентируйся»); WebGL2 may go altogether later.

**Steering that sets the direction**: «"остров" куба впоследствии хочу сделать прямо частью мира какого-то засеянного island … поэтому технологии двух аппов нужно если не унифицировать, то идти в этом направлении». So everything written new is a pure WGSL function of place, clock and parameters in a shared app `outdoors` (parents `scene`, `dice`; `cube` and `island` both extend it), which the cube can import as it stands.

**The team**: `island/sea-kit` (session_01DaohkEJvpB9uSL7xF31AzF) moves the swell, shore level, wetness, cusps and the WGSL kit into `outdoors`; `island/sea-sky` (session_01DaohkCJdeeFwaqj45LNp9n) builds sky, sun, haze, then clouds; the sea lead builds the sea, the shore on land, wind, and the ground that is not beach.

**For you, from bite 3's leftovers**: call 8 (the random worlds' envelope) still waits on Vova's word, and C4 and the #2–#6 re-shoot wait on it; I will not decide it. The Gulf islet reads closed in round-world relay-6, though the board's `bite3-cut2` sticky still lists it. The blue flashes I fix in passing (the globe drawn first, writing no depth).

## lead · 2026-11-15 21:11:11 UTC

On the board (v71): a zone "The sea" with your before frames, the drowsy finding, the WGSL-in-three spike, Vova's answers and the outdoors direction. The Gulf islet is marked closed on bite3-cut2, as round-world relay-6 has it. Call 8 is mine to put to Vova; leave it and C4 and the re-shoot out of your bite. Keep sending milestone frames this way, each with Vova's verdict when he gives one.

## member · 2026-11-15 21:37:13 UTC

Milestone 1 on island/sea (00314cbe): the sea is a surface now. Frames, all under docs/remove-before-merging/island/sea/frames/:

- 01-ripples-open-ocean-3m.jpg — open ocean at 3 m, toward the sun: ripples, the sky mirrored, the glint breaking into sparkles near the eye. WIN.
- 02-ripples-open-ocean-300m.jpg — the same from 300 m: waves too short to see widen the glint instead of aliasing.
- 03-ripples-inlet-40m.jpg — the inlet at 40 m, turquoise shallows with the sun's path.
- 04-ripples-inlet-2m.jpg — the inlet beach at 2 m. Still a flat sheet near the waterline: no swell, no swash, no wet sand yet (those wait on the shared `nature` app).
- 05-ripples-orbit.jpg — orbit: the terminator and a soft glint, both from the same shader.
(00-before-*.jpg are the befores.)

How: one WGSL listing called from TSL via wgslFn; a table of 64 plane waves with integer wave vectors over a 256 m period, so a place taken modulo the period is exact in float32 anywhere on the planet and no tile shows a seam; slope variance by Cox–Munk from a wind that follows latitude belts. One forward pass, no render targets.

FIND (bug older than this bite): over deep water the sea's tiles near the eye were never drawn. The selection culled a tile by its floor's height (−3500 m), not by the sea it draws, so at 3 m over open ocean you were looking at the globe 1500 m below. Nobody could tell while both were one flat blue. Fixed in cube-quadtree.ts (`relief` bounds a tile by the sea too).

FIX: blue flashes — the globe now draws first and writes no depth, so a stand-in pushed 3% deeper cannot fall behind it. Not yet verified on a fast flight; say if you still see them.

Operator steering since the last note: «послеживай за лимитами. где-то на 90% надо сворачиваться и ставить на паузу … в идеале к этому времени что-нибудь бы вкусное уже на preview»; «смотри действиетнльо ли все подсессии нужны на фейбле, иногда можно запустить на опусе а контролировать тебе» (the extraction child was restarted on Opus). Preview: slot 1 is being published from island/sea now.
