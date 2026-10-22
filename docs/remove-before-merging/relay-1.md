# Relay 1 — segue songs in shuffle

## Standing constraints

None stated.

## The conversation

1. Operator: «как бы нам быть с такой загагулиной: у нас есть песни segue, да? получается, если допустим человеку нравится то, во что вылевается, но не нравится то, из чего, он при шафле должен всё время слушать первую песню. но если мы сделаем, например, чтобы вторая песня могла "выбираться" и сама собой (без первой), то её относительный вес среди всех песен увеличится вдвое»

   Agent: shuffle is a permutation of segue runs (`shuffleOrder`, `src/pages/music/lib/player-state.ts`), every song once per cycle, so no weights to double. Proposed a per-cycle coin flip that splits the run [A→B] into [A] and [B] with some probability; noted A then ends on a transition and B starts cold; asked for the split ratio and whether to fade A.

2. Operator: «не, такие произвольности я не люблю» / quoting «Удвоение веса тебе не грозит»: «я имею в виду, что если бы могли сделать, что может выбраться A (и дальше по определнию B) или B отдельно»

   Agent: with entries "A→B" and "B alone", plays(A) ≤ plays(B) always, so B-alone forces either B played twice per cycle or A half as often. Offered: (1) B doubled; (2) deterministic alternation of the two cards by cycle parity, A at half weight, radio timetable then needs a two-cycle period in `station.ts`; (3) status quo. Recommended (2), reasoning that the first song is an intro to the second.

3. Operator: «нет, дело не вступлениях -- некоторые песни плавно перетекают одна в другую, при этом они вполне самодостаточные»

   Agent: since both are self-sufficient, A may play alone too, so each cycle is either "together" (one card A→B) or "apart" (cards A and B, each placed independently). Each song still plays once per cycle, so weights and cycle length are unchanged and the radio timetable is untouched. No coin: alternate by cycle parity (radio: cycle number, shared across devices; manual shuffle: parity of the shuffle seed). Asked one question, about sound not code: **does A's ending hold up with nothing after it**, or does an apart A need a short fade-out in the player? Unanswered when the session parked.

## Intent

Let a listener who likes the second song of a segue pair hear it without the first, without changing any song's share of plays and without randomness the operator perceives as arbitrary. Ruled out: a coin flip with a tunable probability; any scheme that changes a song's play share. The songs in a segue pair are each self-sufficient — not intro + song.

## Decisions

- **Segue pair** — catalogue position with frontmatter `segue: true` runs into its release's next track; `seguePositions` collects them, `segueRuns` cuts a queue into runs that play as one.
- **"Together" vs "apart" cycle** — whether a given cycle keeps the run joined or deals its songs as separate cards. Proposed, not yet approved.
- **Alternation by cycle parity** beat a random split (operator dislikes the arbitrariness) and beat the A→B / B-alone two-card scheme (it necessarily skews one song's share).
- The radio's timetable (`stationAt` in `src/pages/music/lib/station.ts`) assumes every cycle lasts the sum of all durations; the proposal keeps that true, which is part of why it beat the alternatives.

## Errors and dead ends

- The coin-flip split: rejected, «такие произвольности я не люблю».
- Reading the first song of a pair as an intro: wrong, «дело не вступлениях».

## State

- Branch `claude/segue-shuffle-s7xcc1` (renamed from `claude/friendly-hawking-s7xcc1`; deleting the old remote ref was refused with a 403, so `origin/claude/friendly-hawking-s7xcc1` lingers at 2bd15bf — no PR on either).
- No PR, no plan file, no code changes. Head is this summary's commit.
- Estimate: 0.75 h senior developer — "weighing a shuffle invariant against the radio's fixed-length timetable takes someone who knows both the sampling math and this player's code". The implementation, once approved, is the successor's to size.

## Pointers

- `src/pages/music/lib/player-state.ts` — `seguePositions`, `segueRuns`, `shuffleOrder`.
- `src/pages/music/lib/station.ts` — `cycleOrder` (seeded by cycle index, with the no-repeat swap across cycle boundaries that calls `runLength`), `stationAt`.
- `src/pages/music/lib/use-audio-player.ts` — `freshShuffle` (seed `Date.now()`).
- `src/pages/music/lib/use-station.ts` — radio wiring.
- `.claude/rules/songs.md` — the `segue` frontmatter contract ("which a shuffle then never parts it from" — changes if the proposal lands).
- Transcript: https://claude.ai/code/session_017p3MoA2AbSGjC6twErpgKb

## Next step

Wait for the operator's answer to the open question: does A's ending hold up alone, or does an apart A need a fade-out? Then the change is a `/task` (it was a rung-2 discussion so far).
