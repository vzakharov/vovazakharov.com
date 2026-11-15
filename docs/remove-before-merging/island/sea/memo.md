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
