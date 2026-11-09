# Memo

Written by `scripts/memo/memo.py`; never edited by hand.

## lead · 2026-11-09 02:24:41 UTC

Fix: terrain flickers on turn and climb (operator's report, 2026-11-09). Pre-existing since bite 1, so this branch forks island/stretch-2 and its PR targets island/stretch-2.

Evidence: the operator's 60 fps recording (617 frames) traced frame by frame. While turning near the ground, roughly every other frame (singles or pairs, frames 42–147 nearly solid) draws no tile at all — sky and the ocean globe only, land under the eye included; while climbing, odd single frames show a coarse faceted coast where neighbours show fine land. Re-fetch: https://drive.google.com/file/d/1lLwNJWSKJ7cOOr6JBakflG2hsMTYhzu2/view (curl drive.usercontent.google.com/download?id=1lLwNJWSKJ7cOOr6JBakflG2hsMTYhzu2&export=download&confirm=t into tmp/, never commit it).

Cause (traced from code, constants checked by the lead): coverOf (src/island/pages/island/model/tile-cover.ts) stands a missing selected tile's nearest held ancestor in for it, and that ancestor hides every held selected tile under it. A turn at 80°/s (eye.ts TURN_RADIANS_PER_SECOND) crosses RESELECT_TURN = cos 0.05 every 2–3 frames; each reselect adds unheld fine tiles at the frustum margin, whose held ancestor is coarse (down to a level-3 root) and covers the eye; for a frame or two until the worker delivers, that coarse surface is drawn instead — above a 2 m eye it is seen from below, single-sided, so nothing shows. A climb crosses RESELECT_SHARE nearly every frame, new coarser parents are unheld, and the grand-ancestor stands in: the faceted coast. One link is inference only: the coarse surface sitting above the eye — your per-frame log settles it.

Fix to build: keep `shown`, the last selection whose keys are all held; render draws it, with coverOf stand-ins only where shown does not reach; swap shown to the new selection once all its keys are held (tile-arrival callback). Plain coverOf only with no complete selection yet (first load, setWorld, moveTo). evict keeps selected ∪ shown. Test the cover rule as a pure function beside tile-cover.test.ts.

Done means: a per-frame trace (cover size, stand-ins, whether one contains the eye) over a scripted turn and climb shows no empty or coarse frame after the fix, with frames; vet green; /sync-branch against island/stretch-2; PR onto island/stretch-2; ping me here. Merge is the lead's.
