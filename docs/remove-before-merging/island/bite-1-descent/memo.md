# Memo

Written by `scripts/memo/memo.py`; never edited by hand.

## member · 2026-11-06 18:31:39 UTC

Bite 1 taken: plan flipped to in-progress, § This bite written (steps S0 app → wave 1 coast/height/tiles/eye/play → S5 scene → F frames → tail). Building now; frames come through memo when they exist.

## lead · 2026-11-06 18:32:11 UTC

Seen, go ahead. Questions the work can go on past: post and keep building. Frames to me when F lands.

## member · 2026-11-06 18:43:45 UTC

S0 landed (app registered, /island route, globe). Two reds outside the bite, both from the base branch, for you: (1) the vova build throws 'No intrinsic dimensions in card image /case-studies/assets/island-map.webp' (src/blog/shared/content/documents.ts:155) — the case study's map is a VP8X WebP with an ICC profile, which the size reader doesn't parse; re-encoding it as plain VP8/VP8L or teaching the reader VP8X fixes it. (2) pnpm type-overlap already fails on scripts/board/page/camera.ts, scripts/contribution/lines.ts and others. Both will fail vet on this branch. Shall I fix either here, or will you on the base? Building on meanwhile: wave 1 launching.

## lead · 2026-11-06 18:44:16 UTC

Both are the base's; the lead fixes them on claude/world-game-zoltan-syama-hodowq. Keep building; merge the base into the bite when I post that they've landed (fetch + merge origin/<base>, not pull).

## lead · 2026-11-06 18:56:42 UTC

Base fixed and pushed: the vova build passes (WebP reader, b8f25921) and pnpm type-overlap is green (c3211083, 6547946b — Point, Zooming, Zoomed now in src/kernel/shared/typings). Merge origin/claude/world-game-zoltan-syama-hodowq into the bite (fetch + merge, not pull).

## member · 2026-11-06 19:36:14 UTC

First frames are in (docs/remove-before-merging/island/bite-1-descent/frames/, desktop and phone at orbit/1000km/10km/100m/2m). Orbit reads as the drawn island; the descent is continuous with no holes, WebGL 2 fallback in headless Chromium, frame median ~1 ms. Second round running now: sky still black at every height, the globe cropped on a portrait phone at orbit, coast stair-steps at 1000 km. Final frames come with the PR.

Attached: `docs/remove-before-merging/island/bite-1-descent/memo/desktop-orbit.png`

## lead · 2026-11-06 19:37:02 UTC

Looked at the five desktop frames beside the drawing. Orbit is right: the main body, Apatin's spit, the western loop and Mais to the east all read. Your three second-round items stand. Two more, both inside the contract's "plain-looking at every height":

1. Below ~100 km the ground has no relief. 10 km is one flat olive field, and 2 m is a flat plain to a ruler-straight horizon. A descent has to read as getting closer, so the noise keeps adding octaves down to each tile level's own grid spacing. It stays a pure function of position and seed, and each level resolves the octaves its grid can hold. The test is that 10 km and 100 m each show hills you could point at.
2. Light the relief: shade by the slope against one sun, so height reads at every scale and not only through the colour bands. The ground is also dark overall; lift the exposure while you are there.

The white patches on the high ground read as cloud from orbit. If they are the snowline, keep them; clouds proper are a later bite.

## member · 2026-11-06 20:19:23 UTC

Member relayed (new session). Heads-up: PR #256 shows MERGED — at 18:35 commit 686f5174 merged the bite's then-head (ca2ffc41) into claude/world-game-zoltan-syama-hodowq, so GitHub closed #256 as merged. The 60 commits after it are not in the base. At the tail I open a fresh PR from island/bite-1-descent onto the same base unless you say otherwise. Running now in parallel: R3b slope light + per-fragment snow, R4 tile seams / inland puddles / view culling, R5 shared play code.

## lead · 2026-11-06 20:19:52 UTC

Agreed: open a fresh PR from island/bite-1-descent onto claude/world-game-zoltan-syama-hodowq at the tail. #256 closed because 686f5174 (the FETCH_HEAD race, now fixed in memo.py) put its head into the base. Carry on.

## lead · 2026-11-06 20:54:55 UTC

The operator looked at the orbit frame (desktop, 1440×900). Two things for this bite, one for later:

1. The coast is ragged: thin spikes, frayed spits and specks along every shore, with a hard, aliased line where land meets sea. The trace follows the crayon strokes and the paper's grain rather than the coast the children meant. Smooth the traced polygon before it is committed (drop specks below a minimum area, simplify, then smooth the curve), keeping the named spits (Apatin, the two northern fingers, Korump's arm) and the islands the drawing names. Then antialias the coastline in the shader and add a shallow band of lighter water along it, so the shore reads as a shore from orbit. The test is the orbit and 1,000 km frames beside the drawing: the outline is the drawing's, and the edge is clean.
2. Scale stays as call 1 sets it (Arc ≈ DR Congo, which the frame matches: Arc comes to ~2 M km² and the island spans ~8,000 km with its outliers). The operator found it big; that is an open question to them, not a change for you yet.

Later, not this bite: the sea and sky. The reference on the board is the web-ocean image (sun glint, haze, sky colour). From orbit that means sun glint on the water, an atmosphere rim at the limb and a sky that is not black. The sea bite gets it; no work on it here beyond the shallow band in 1.

## member · 2026-11-06 20:57:11 UTC

The operator, on your 'later, not this bite' line (sun glint, atmosphere rim, non-black sky from orbit), verbatim: «ну тут я не настолько уверен, конечно, что прямо с орбиты должно солнце отсвечивать, я про общее ощущение». So for the sea bite: the general feel of the web-ocean reference, glint from orbit optional rather than a requirement. Your item 1 (coast smoothing, AA, shallow band) I take into this bite now as R6. Current state after R3b/R4/R5 (frames in hand, not yet committed): snow seam and skirt lines at 1000 km gone, inland ponds gone, tiles culled (1000 km 300→45 desktop), slope light reads well at 100 m and 2 m; 10 km still soft; phone orbit shows faint dashed rectangles at tile edges — R7.

## lead · 2026-11-06 21:01:55 UTC

Lead relayed to a new session (this one). Noted: R6 (coast) and R7 (tile-edge dashes on phone orbit) are this bite's remaining work; glint from orbit is optional for the sea bite, the general feel is the ask. Scale is still the operator's open question, so call 1 stands. Post when done, with the final frames committed.

## member · 2026-11-06 21:04:03 UTC

The operator asks you, now, to put the size dispute on the board, with a todo for them: «доуточнить у Золтана». The two sides: (a) vzakharov/life family/world-map-zoltan-syama/README.md gives the authors' one anchor as «Арк размером с ДР Конго», and the whole land ≈ 10 M km², Europe-sized — which our trace matches (all land 10.1 M km², main body 8.7 M km², 5,000 km across); (b) the operator recalls Zoltan meaning the whole island Congo-sized (≈ half the current width, ~2.5 M km²). Todo (operator): ask Zoltan which he meant. Until then the scale stays as call 1 sets it. I am rendering a half-width preview in a scratch tree (not on the branch) so the operator can see how the mountains sit at that size; I will post the frames here when they are in.

## lead · 2026-11-06 21:07:26 UTC

Done: the board (v7) has the scale dispute on sticker later-2, both readings, and the operator's todo to ask Zoltan on later-3. Call 1 stands until he answers. Post the half-width preview frames here when they're in, and R6/R7 as before.
