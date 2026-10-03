# Bite 13 — the review's calls

Two reviewer agents (A: sky, drops, sound; B: flowers, caps, taps) over the
bite's commits from 2ef49b60, posted as one review on PR #57. Each finding's
call, with the alternative it beat, settled before any fix brief.

1. **B1 (blocking) — `headR` stays the open head's size.** The fold wrote
   the bud's foot radius into `shown.headR`, which the held flower's ring,
   the flower-over-cap tap zone, the on-screen cull and the stand height all
   read as "the head's size": in the rain the ring shrank to a dot (20.7 →
   8.3 px on tabL). The folded reach gets a field of its own that only
   perching reads. Beat: having each reader re-derive the open radius,
   which spreads one fact over four call sites.
2. **B2 — the play's closing check reads the paint.** `closing` is set
   before `drawHead` runs, so the check held with the head painting nothing.
   The probe reads the fold recorded by the paint itself; breaking
   `drawHead` must fail the rain play.
3. **B3 — the frame budget is timed over the closing ramp too.** Heads
   repaint only in the first ~1.5 s and the reopening (`flowers.update` peaks
   ~13 ms there), never in the play's mid-shower window. The timed window
   covers frames 1 to ~100 after the tap and the reopening, against
   `FRAME_BUDGET_MS`.
4. **A1 — a cloud takes taps over its drawn puffs, not 4 radii.**
   `CLOUD_SPREAD` 4 was copied from call 1's text, not measured; the puffs
   reach about 2.4–2.7 r, so blue sky 1–1.5 radii beside a cloud started the
   rain and the drops' densest span was 8 r under a ~5 r cloud. The spread
   derives from `paintClouds`' puff geometry, with `TAP_RADIUS` still the
   floor up and down. Beat: keeping the generous area as finger slack — the
   floor already gives a child's finger its room, and the drops' span shares
   the constant.
5. **A2 — rain falls out of the cloud.** A drop whose column lies within a
   showing cloud's drawn span starts at that cloud's underside, not above
   the screen; elsewhere it starts above the top as now. Beat: lowering the
   drops' depth under the clouds, which hides the streaks but still has
   rain coming from above the cloud the child tapped.
6. **A's hunch — a drop with no ground under it.** `rain-drops.ts`
   `if (!foot) return true` counts a drop as started that never starts. The
   A fix agent measures it and, if it thins a frame, retries the row or
   stops counting it.
