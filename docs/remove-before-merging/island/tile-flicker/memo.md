# Memo

Written by `scripts/memo/memo.py`; never edited by hand.

## lead · 2026-11-09 02:24:41 UTC

Fix: terrain flickers on turn and climb (operator's report, 2026-11-09). Pre-existing since bite 1, so this branch forks island/stretch-2 and its PR targets island/stretch-2.

Evidence: the operator's 60 fps recording (617 frames) traced frame by frame. While turning near the ground, roughly every other frame (singles or pairs, frames 42–147 nearly solid) draws no tile at all — sky and the ocean globe only, land under the eye included; while climbing, odd single frames show a coarse faceted coast where neighbours show fine land. Re-fetch: https://drive.google.com/file/d/1lLwNJWSKJ7cOOr6JBakflG2hsMTYhzu2/view (curl drive.usercontent.google.com/download?id=1lLwNJWSKJ7cOOr6JBakflG2hsMTYhzu2&export=download&confirm=t into tmp/, never commit it).

Cause (traced from code, constants checked by the lead): coverOf (src/island/pages/island/model/tile-cover.ts) stands a missing selected tile's nearest held ancestor in for it, and that ancestor hides every held selected tile under it. A turn at 80°/s (eye.ts TURN_RADIANS_PER_SECOND) crosses RESELECT_TURN = cos 0.05 every 2–3 frames; each reselect adds unheld fine tiles at the frustum margin, whose held ancestor is coarse (down to a level-3 root) and covers the eye; for a frame or two until the worker delivers, that coarse surface is drawn instead — above a 2 m eye it is seen from below, single-sided, so nothing shows. A climb crosses RESELECT_SHARE nearly every frame, new coarser parents are unheld, and the grand-ancestor stands in: the faceted coast. One link is inference only: the coarse surface sitting above the eye — your per-frame log settles it.

Fix to build: keep `shown`, the last selection whose keys are all held; render draws it, with coverOf stand-ins only where shown does not reach; swap shown to the new selection once all its keys are held (tile-arrival callback). Plain coverOf only with no complete selection yet (first load, setWorld, moveTo). evict keeps selected ∪ shown. Test the cover rule as a pure function beside tile-cover.test.ts.

Done means: a per-frame trace (cover size, stand-ins, whether one contains the eye) over a scripted turn and climb shows no empty or coarse frame after the fix, with frames; vet green; /sync-branch against island/stretch-2; PR onto island/stretch-2; ping me here. Merge is the lead's.

## lead · 2026-11-09 02:42:46 UTC

Heads-up: bite 2 (#267) is now merged into island/stretch-2 (28d4c8e5) — worlds from one formula, the coast slice retired, tiles built from buildWorldField. Your closing /sync-branch against island/stretch-2 will take it in; re-run your per-frame trace after the sync so the before/after frames are on the code that merges.

## member · 2026-11-09 02:43:49 UTC

Done: #268 onto island/stretch-2 (draft), vet green on the head after syncing with island/stretch-2 (2805e9ea).

Your inference holds. A per-frame Node replay (real selectTiles and eye step, 2 workers nearest-first, measured fillTile times) puts the eye 2 m over the inlet head, turns it for 2 s and climbs for 4 s. Old rule: on a turn, 82 of 120 frames reduce the whole cover to a single level-3 root, and its surface is above the eye, so the frame comes out blank. On a climb, 12 frames come out blank and 24 show a level-3 tile under the eye where the selection wants level 18 (the faceted coast). New rule: 0 blank and 0 coarse frames in both phases. The PR body has the table and sample frames.

Built as briefed: coverAround(selected, shown, has) draws shown, uses coverOf stand-ins only where shown does not reach, and a margin tile straddling shown's edge waits. shown switches over in render and on tile arrival, is reset on moveTo (there is no setWorld on this branch), and evict keeps selected ∪ shown.

The first vet run was red only on prettier for src/island-board/app/config/island/bite2.yaml, which came from the base. Your 2805e9ea fixed it, and the merge brought that in.

## lead · 2026-11-09 02:44:38 UTC

#268 received, and the trace is exactly what was asked — thank you. It can't merge yet: island/stretch-2 moved after your sync (bite 2, #267, merged as 28d4c8e5), and #268 now conflicts with it. Bite 2 brings setWorld (island-scene.ts:312, called from island-canvas.tsx:34 on a hash change), which your branch didn't have. So: /sync-branch against island/stretch-2 again, resolve the conflicts, reset shown on setWorld exactly as on moveTo (a new world's tiles share no keys with the old one's, so the old shown must not be drawn over it), re-run the per-frame replay on the synced code (tiles now come from buildWorldField — the numbers may move), update the PR body's table if they do, vet green, ping here.
