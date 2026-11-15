# Memo

Written by `scripts/memo/memo.py`; never edited by hand.

## member · 2026-11-15 18:35:33 UTC · ack

New member session (started by Vova, fresh lineage) picked up from relay-6.md. Launching b3-pool's two fixes per your 14:03 note (workers 1..n take worker 0's field; cap by deviceMemory and hardwareConcurrency − 1, max 4), then a separate agent re-measures phone/desktop settle, memory and first frame against your merge bar. No board watch held here.

## lead · 2026-11-15 18:48:26 UTC

Two things from main, both approved by Vova («перевод на дайс -- да»). Do them after b3-pool, before the PR on island/stretch-2.

1. island/stretch-2 now holds main (merged at b9633c49, resolved at 05d8c951, head 46773995). Sync round-world with it (/sync-branch against island/stretch-2) before anything below. Main moved the board's shared code from src/island-board/ to src/board/ (`pnpm board …` unchanged), added a "boards are English" check, WGSL tooling for .wgsl files (not ours: the island's shaders are TSL), and kernel's WithOnError/Readying base types that island-scene.ts and play-hook.ts now use.

2. Switch the island to `@/dice/shared/roll`. The cube extracted your bite-3 `entities/terrain/world/roll` (roll, decode) and `land/model/hash.ts` into a top-level app `dice` (masd.json: `"dice": []`, the cube takes `["scene", "dice"]`). Its `worldHash`, `pathHash`, `murmur3`, `decode*` are byte-for-byte yours; `roll` adds two kinds, `over` (a keyed family decoded on demand) and `wide` (a 64-bit leaf). So: add "dice" to island's parents in src/masd.json, import from `@/dice/shared/roll`, delete the island's copies and their tests where dice's own cover them, and keep `OUR_WORLD` (it is island-specific, not in dice). The bar: every pinned and random world identical — a test pinning a handful of worldHash/pathHash words and one sphere-world height per world #0–#7 before and after, plus the existing world tests green. Why now: the dice rolls Vova agreed on (lakes, neighbours for #1) are `roll` under named paths, and two copies of the hash would drift.

Ping me with the commit when both are in.

## member · 2026-11-15 18:48:52 UTC · ack

Ack 18:48 — after b3-pool merges (re-measure running now): /sync-branch against island/stretch-2, then the island onto @/dice/shared/roll with the pinned-hash/height test across #0–#7 before and after. Will ping with both commits.

## member · 2026-11-15 18:49:33 UTC

b3-pool step 2 measured (wt/b3-pool: fe8e9b13 code, cdc7562b note+driver) — NOT merged: it misses your bar on both counts, by less than before.

- Memory, 4 vs 2 workers: +162…+226 MB (mean +202; bar ~+150). Per extra worker 81–113 MB, was ~135: the field copy is the small part, each worker's own isolate/code/tile buffers the rest.
- First frame (ready), 4 vs 2: +0.10…0.19 s (was +0.65…0.9; bar "no later"). buildMs flat now (1.21–1.28 s at every size, was 1.5→2.3).
- Settle 4 vs 2: 527 m desktop 4.90→3.50, phone 4.35→3.05 (−29/−30%); 13 km −19/−29%. 3 workers already takes most of it: 527 m phone 3.40, desktop 3.86.
- 3 vs 2: memory +~100 MB, ready +0.02…0.03 s (noise; one 13 km phone cell −0.10).
- Memory cap works: hc 8 with deviceMemory 2/4/8 → 2/3/4 workers. Console clean in 31 runs. One unexplained 1.71 s long task in one phone 13 km run on 4.
- Likely cause of the remaining ready lag (unverified): on `built` the pool posts all adopt copies (3×16 MB structured clones) on the main thread before ready() continues; deferring them past the first frame would likely close it.
  Proposal: cap at 3 (clamp 1–3 instead of 1–4) and defer the adopt posts past the first frame, then one short re-measure of 2 vs 3 against the same bar. Your call — or merge-as-is at 3, or drop the pool. I'll start the stretch-2 sync and the dice switch meanwhile, since neither touches the pool's files.

## lead · 2026-11-15 18:49:58 UTC

Agreed: cap at 3 (clamp 1–3, still by deviceMemory and hardwareConcurrency − 1) and defer the adopt posts past the first frame. One short re-measure of 2 vs 3 on the same views; merge if memory stays within ~+150 MB of 2 and ready is no later than on 2 within run-to-run noise (±0.05 s). In that re-measure, watch for the 1.71 s long task: if it shows again, name what runs in it before merging; if it doesn't, note it as seen once and move on. Sync and dice in parallel as you propose.

## member · 2026-11-15 18:51:10 UTC · ack

Ack 18:49. Sync done: 797d8a79 (stretch-2 merged; conflicts package.json keep-both, island-scene.ts WithOnError base + our cover over main's RESELECT/ROOTS). Running in parallel: b3-pool step 3 (clamp 1–3, adopt after first frame, 2-vs-3 re-measure with the long-task watch) and b3-dice (pin #0–#7 hashes+heights first, then switch to @/dice/shared/roll).

## lead · 2026-11-15 18:57:48 UTC · ack

One more for the sync: stretch-2's vet after the main merge fails type-overlap on two island files you already deleted on round-world (world/model/harmonic.ts Coefficient {re, im}, layout.ts Wavevector {kx}) against the cube's `Wave` in src/cube/widgets/outdoors/surface/sea/state/lib/sea-height.ts. Your merge drops them; check that no type of yours with re/im or kx overlaps `Wave` after it. If one does, the shared base goes in the lowest app both inherit (scene or kernel), per type-overlap's own hint. Stretch-2 head after my fixes: ad6c72f7.

## lead · 2026-11-15 19:00:31 UTC

Vova wants cut 2 now («срез»): the round world, Earth #0, the LOD/holes fixes and three workers go to main as they stand, before the sea work starts. So bite 3 lands in two parts, and your part 1 ends at a clean merge into island/stretch-2:

1. b3-pool at 3 workers with the deferred adopt posts, merged if it meets the bar (else leave the pool at 2 and say so — the cut does not wait on it).
2. Sync with island/stretch-2 (ad6c72f7 or later) and switch to @/dice, worlds bit-identical.
3. The tail for what is in: /polish over the branch, the whole test suite, vet green on your head, then the PR from island/round-world into island/stretch-2 and ping me with it. Leave the Gulf islet / moiré items out of it unless already done.

What waits for after the cut, on stretch 3: call 8 and C4, the re-shoot of #2–#6, and anything else in the contract's "Done when" not yet met — list those in the PR body as bite 3's part 2. Keep merging nothing into stretch-2 yourself; I merge your PR, cut island/cut-2 from it, put it on preview for Vova, and finalize.

## member · 2026-11-15 19:01:06 UTC · ack

Ack 19:00 — part 1 ends at the PR into island/stretch-2: pool (3 workers if it meets the bar, else 2 and said so), re-sync to ad6c72f7+, dice bit-identical, /polish, full suite, vet green, PR with part 2 listed (call 8, C4, #2–#6 re-shoot, the rest of Done when). Nothing merged into stretch-2 by me.

## member · 2026-11-15 19:02:25 UTC · ack

Dice in: 2d889f8b on island/round-world (after re-sync to stretch-2 ad6c72f7+ at 0d538d9c). Worlds #0–#7 pinned before the switch (dd0e7fc7) and unchanged after; island+dice 491/491, tsc clean. Departures: dice's barrel is narrower (no TableIndex/WordSource/assertWorldNumber export), so island derives those types/checks locally rather than editing src/dice; dice's WAITING_APPS entry removed (island is its second child). Pre-existing on the base, not ours to fix in this step: type-overlap (island BuildTimes vs cube Outside/Scuff) and knip findings — I'll take them in the tail. Pool step 3 still measuring.

## member · 2026-11-15 19:05:10 UTC · ack

Pool in: f9567a89 (3 workers, adopt after first paint). 3 vs 2: memory +101 MB, ready −0.01 s pooled over 12 pairs (per-cell ±0.18 s noise on a loaded box), settle 527 m −21…23%, 13 km within noise. The 1.71 s long task did not recur in 24 runs (longest 242 ms) — recorded as seen once. Island+dice 497/497, tsc clean. Starting the tail: /polish, full suite, vet, PR into island/stretch-2.

## lead · 2026-11-15 19:08:52 UTC · ack

Vova confirmed the cut's scope: bite 3 lands as it stands, call 8 / C4 / the #2–#6 re-shoot / Gulf islet / moiré stay open for later, and the remaining flicker is not chased now (the sea bite reworks the drawing). So your part 1 is exactly: pool at 3 (if it meets the bar), sync + @/dice, /polish, suite and vet green, PR into island/stretch-2. Nothing beyond it.

## member · 2026-11-15 19:29:29 UTC

Vet on a969a22a failed on format, fsd, type-overlap, knip, test. Fixed and pushed at 3f733a18: prettier over 10 files, world/series renamed world/spectrum (Steiger's inconsistent-naming), BuildTimes derived from its stage list, EARTH_ENVELOPE and two dead exports dropped. One thing is left that isn't mine to edit: this memo file itself — 716 lines (line-limit test, cap 400) and not prettier-clean. Both checks run on every tracked file, so vet stays red while memo.md is on the branch at this size. Your call: (a) you archive the read part (e.g. memo-1.md + .prettierignore/allowlist entry for remove-before-merging/), (b) I run prettier on it and you split it, or (c) something else. Re-running vet now to confirm everything else is green; PR waits on your answer.

## lead · 2026-11-15 19:30:07 UTC · ack

(a), done by you since the branch is yours and you are the one writing to it: move every note before today's 18:35:33 member note into archives beside it, docs/remove-before-merging/island/round-world/memo-1.md, memo-2.md, … each under 400 lines and cut only at a note header, then prettier them (its escapes in old note text are fine; the archives are history, nothing parses them). memo.md keeps the notes from 18:35:33 on, so memo.py's "unanswered" logic, which reads only memo.md's tail, is untouched. No allowlist or .prettierignore entries. Commit as chore, then the PR.

## member · 2026-11-15 19:44:53 UTC

PR open: https://github.com/vzakharov/vovazakharov.com/pull/285 (island/round-world → island/stretch-2). Vet green on 99a85b90 (run 43753058571; vova build failed once on a Google Fonts fetch, passed on re-run of the failed jobs). Memo archived per (a): memo-1.md 371, memo-2.md 288, memo.md 79 lines, all prettier-clean. Body lists part 2: call 8, C4 (EARTH_ENVELOPE was dropped as unused by knip in 64f65466 — C4 restores it with its reader), #2–#6 re-shoot with the table, Gulf islet, moiré, flicker, the Italy beach line, the rest of Done when, /five-percent, and the two open /dry calls. Yours to merge, cut island/cut-2 and preview.

## lead · 2026-11-15 19:53:15 UTC

Merged #285 into island/stretch-2 (922f1ef3; one board conflict, the stretch's re-layout kept). island/cut-2 cut from it and up on preview slot 1 (https://preview.vovazakharov.com/island) for Vova. Your part 2 list goes on the board as left open. Nothing more for you now — thank you; this session will be archived once the cut lands.

## member · 2026-11-15 19:53:28 UTC · ack

Ack 19:53 — #285 merged (922f1ef3), cut-2 on preview slot 1. Telling Vova; standing by.
