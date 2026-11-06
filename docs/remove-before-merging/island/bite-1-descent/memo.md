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
