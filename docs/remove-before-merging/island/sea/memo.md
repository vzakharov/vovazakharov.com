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
  (00-before-\*.jpg are the befores.)

How: one WGSL listing called from TSL via wgslFn; a table of 64 plane waves with integer wave vectors over a 256 m period, so a place taken modulo the period is exact in float32 anywhere on the planet and no tile shows a seam; slope variance by Cox–Munk from a wind that follows latitude belts. One forward pass, no render targets.

FIND (bug older than this bite): over deep water the sea's tiles near the eye were never drawn. The selection culled a tile by its floor's height (−3500 m), not by the sea it draws, so at 3 m over open ocean you were looking at the globe 1500 m below. Nobody could tell while both were one flat blue. Fixed in cube-quadtree.ts (`relief` bounds a tile by the sea too).

FIX: blue flashes — the globe now draws first and writes no depth, so a stand-in pushed 3% deeper cannot fall behind it. Not yet verified on a fast flight; say if you still see them.

Operator steering since the last note: «послеживай за лимитами. где-то на 90% надо сворачиваться и ставить на паузу … в идеале к этому времени что-нибудь бы вкусное уже на preview»; «смотри действиетнльо ли все подсессии нужны на фейбле, иногда можно запустить на опусе а контролировать тебе» (the extraction child was restarted on Opus). Preview: slot 1 is being published from island/sea now.

## lead · 2026-11-15 21:38:02 UTC

Milestone 1 is on the board (v72): the five frames as one image, the how, the deep-water find and the flash fix. Good find on the culled sea tiles.

## member · 2026-11-15 22:12:23 UTC

Sea, milestone 2 (5d92f863): the cube's swell is on the island's sea.

- Win: `nature` (the shared app, extracted by the Opus child) is merged, and the island's sea calls its `swellLevel` as it stands: vertices rise with the swell, a sheet runs up the sand and is cut to its outline per fragment, the sand darkens where the sheet just left and dries back. Frames: docs/remove-before-merging/island/sea/frames/06-swash-inlet-2m.jpg, 07-swash-inlet-2m-later.jpg (same spot, a second later: the sheet has drawn back, wet sand behind it), 08-swell-open-ocean-3m.jpg.
- Find: one swell axis through the planet plus a float64 clock at the eye gives every fragment its phase with no per-tile uniform — same trick as the ripples' place.
- Fail, still open: the sheet's outline follows the 1.2 m mesh, so the shoreline is polygonal at 2 m (visible in 06). Next: soften with the cusps' tongue.
- Trap: three's types hand `wgslFn` back untyped; `colorNode` refuses it, `outputNode`/`emissiveNode`/`maskNode` take it.

## lead · 2026-11-15 22:13:27 UTC

Milestone 2 is on the board (v73), the three frames and the polygonal-waterline note.

## member · 2026-11-15 22:28:43 UTC

Sea, milestone 3 (a9d17034): the sky child's atmosphere is merged and the sea mirrors it.

- Win: one analytic air from 2 m to orbit (the sky child's), and the water reflects its radiance — the sun's glare over the inlet and the open ocean. Frames: docs/remove-before-merging/island/sea/frames/09-sky-inlet-2m.jpg, 10-sky-open-ocean-3m.jpg, 12-opening-orbit.jpg.
- Win: the swash runs up the sand in the cube's cusps (nature's `cusped`), same closed form the cube uses.
- Fail, open: from mid orbit (about 4000 km) space is blue and the disc veiled — 11-fail-blue-space-4000km.jpg. With the sky child.
- Fail, open: the sheet's outline is still polygonal at 2 m: it is the mesh's own contour, the cusps do not hide it.

## lead · 2026-11-15 22:29:32 UTC

Milestone 3 is on the board (v74), the fail frame beside the wins.

## member · 2026-11-15 22:37:04 UTC

Sea, milestone 4 (e21dee97; vet green on a9d17034): the ground off the beach.

- Win: relief below the mesh's cell is drawn by light — ridges read off the same 64-wave table the ripples use, each fading as it passes under a pixel — and steep ground above the beach shows bare rock. Frames: docs/remove-before-merging/island/sea/frames/13-relief-grass-40m.jpg, 14-wet-sand-landward-2m.jpg (the damp band behind the sheet).
- Find: one wave table serves the sea's ripples and the land's relief; the land reads it as ridges standing still.
- Not yet looked at: rock on a real cliff — the inlet's country is too gentle to show it.

## lead · 2026-11-15 22:38:07 UTC

Milestone 4 is on the board (v75).

## member · 2026-11-15 22:54:17 UTC

Sea, milestone 5 (e177eb5b):

- Win: noon no longer burns out. The sun lights were set for the opening's 20° sun, so a noon beach, its foam and the snow clipped to white; now the eye adapts (`eyeKeeps`), on land and in the sea alike. Frames: docs/remove-before-merging/island/sea/frames/16-noon-inlet-2m.jpg, 17-noon-wet-sand-2m.jpg.
- Win: rock shows where the mountains are steep enough — outcrops in the snow: 15-rock-in-snow-1500m.jpg.
- Fixed fail: blue space from mid orbit (was 11-fail-blue-space-4000km.jpg) — the sky child's fix, checked on WebGPU: 18-orbit-4000km-fixed.jpg.
- Next: clouds (the sky child's last package), the shoreline's polygons, polish, the PR into island/stretch-3.

## lead · 2026-11-15 22:55:21 UTC

Milestone 5 is on the board (v76).

## member · 2026-11-15 23:16:26 UTC

Sea, milestone 6 (7b5c7402): clouds are in.

- Win: one cloud field on the sphere (the sky child's), seen from the beach, from inside and as cover from orbit, casting shadows through the same air every material is seen through. Frames: docs/remove-before-merging/island/sea/frames/20-clouds-orbit-4000km.jpg, 19-clouds-inlet-2m.jpg, sky-clouds-6km.jpg (a shadow on the land), sky-clouds-dusk.jpg.
- Find (the sky child's): three's stock `mx_noise_float` kept the page from ever becoming ready on the software compiler — about forty Perlin calls a material; a small value noise as a real shader function compiles in seconds.
- Risk, open: the clouds cost 2–2.8× frame time on the software rasteriser (8 samples a fragment). Unmeasured on a real GPU; the child is cutting it.
- Fail, open: far clouds seen edge-on band horizontally.

## lead · 2026-11-15 23:17:16 UTC

Milestone 6 is on the board (v77), the cost risk and the edge-on banding as open.

## member · 2026-11-15 23:28:13 UTC

Milestone 7 — the clouds' last round is in `island/sea` (merge c5ac19b9 of the sky member's 3caa40e8); the sky member is done and archived.

- Frames, WebGPU, 640×360: `docs/remove-before-merging/island/sea/frames/21-clouds-5-samples-inlet-2m.jpg`, `22-clouds-5-samples-6km.jpg`, `23-clouds-5-samples-orbit-4000km.jpg`; the member's own before/after is `sky-clouds-from-above-5-samples.jpg`.
- Cost: five samples per ray at a per-pixel offset instead of eight, the march stops under 2% left, the finest octave only within ~670 km. On the software renderer clouds take 1.4–2× the cloudless frame, down from 1.8–2.8×. Nothing measured on a real GPU yet — the M2 Pro's 60 fps is still unconfirmed.
- Find (frame 21): from the beach the far clouds on the horizon read as slanted strokes — few samples through a thin slab at a grazing ray. Left open.
- Verdict from Vova: none yet on clouds.

Next from me: vet, polish, the one PR into `island/stretch-3`.

## lead · 2026-11-15 23:30:23 UTC

Milestone 7 is on the board (v78): the cost cut and the slanted far clouds pinned as open. Go ahead with vet, polish and the PR into island/stretch-3.

## member · 2026-11-15 23:41:05 UTC

The sea's one PR is open: draft #288 into `island/stretch-3` (https://github.com/vzakharov/vovazakharov.com/pull/288), squash proposal posted on it. `./scripts/vet.sh` is green on 15e0bd77; the two commits after it are a comment rewrap and the plan. `/polish` ran; `/five-percent` left two optional proposals on the PR (the swell's heading from the wind; ripples, wind and ground relief into `nature` as `.wgsl`). No child sessions remain. Preview slot 1 is built from c5ac19b9, which draws the same as the head.

## lead · 2026-11-15 23:42:10 UTC

#288 is merged into island/stretch-3 (75376755); vet runs on the merged head. The sea bite is done on your side, so this session is archived next. The two /five-percent proposals stay on the PR for Vova.
