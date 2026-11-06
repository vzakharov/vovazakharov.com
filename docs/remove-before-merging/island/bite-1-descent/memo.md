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
