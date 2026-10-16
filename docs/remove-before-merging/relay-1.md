# Relay 1 — preload the next track (PR #165)

## Standing constraints

None stated by the operator beyond the repo's own rules.

## The conversation

1. **Operator:** «давай предзагружать следующую песню, чтобы было seamless проигрывание»
   **Agent:** Routed via `/task` → planned (fork between approaches). Wrote a draft plan recommending **two decks** (two `Audio` elements, standby preloads the next track, swap inside `ended`), preload armed 30 s before the end; asked: 1) decks vs. warm the HTTP cache with one element; 2) when to preload (30 s before end vs. immediately). Opened draft PR #165.
2. **Operator:** «> за 30 секунд до конца — почему не сразу? например чтобы быстрое переключение в первые секунды ("не хочу эту песню") происходило тоже моментально (ну, при условии что следующая вообще успела подгрузиться) > заранее прогреть HTTP-кэш, оставив один элемент — ты этот вариант не описал так подробно как первый»
   **Agent:** Agreed; revised the plan to arm at the playing deck's `canplaythrough` (so the preload doesn't starve the current track's start). Described the cache option in detail: removes download time but leaves element reset/decoder start (~50–300 ms), GitHub's `max-age=300` forces revalidation, Safari likely bypasses the page cache. Still recommended decks.
3. **Operator:** «> как только текущий скачался достаточно, чтобы доиграть (по событию canplaythrough) — имеется в виду когда весь первый трек закачался?»
   **Agent:** No — `canplaythrough` is the browser's estimate that download outpaces playback; usually seconds in; on a too-slow connection it may never fire, and then nothing preloads (correct: a preload would starve playback). Fixed the plan's wording.
4. **Operator:** «> GitHub отдаёт файлы с max-age=300 — а это поменять клиент не может кстати?»
   **Agent:** Not for `<audio>`; `fetch` `force-cache` only covers its own request; a Service Worker could but is a whole subsystem with Range slicing. Irrelevant to decks, which hold their own buffer.
5. **Operator:** «а, точно, ну да, поехали тогда, по варианту "две деки", с загрузкой сразу»
   **Agent:** Ran `/go`: flipped the plan (go-ahead quoted in 7d93c1a), implemented, verified in headless Chromium, ran `/polish`, completed the plan, refreshed the PR body and squash proposal.
6. **Operator:** «отлично, давай мерджить»
   **Agent:** Read it as `/finalize and merge`. Swapped staged copies (none) and found the polish floor's diff since the last `polish:` commit is docs/cost-row only. Then hit the 300k context pause line before the vet run, so relayed.

## Intent

Seamless song-to-song playback on the music player, including instant skips early in a song. Ruled out: cache-warming with one element (shorter gap, not none), Web Audio (memory), Service Worker.

## Decisions

- **Two decks** (`src/pages/music/lib/decks.ts`, a plain factory, not a hook — a hook would need the player's listeners, which call `useEffectEvent` functions that may not be passed to another hook).
- **Arming** at the active deck's `canplaythrough` (also re-checked when the upcoming source changes); a standby holding a file no longer due is cleared (`removeAttribute('src'); load()`).
- **Swap at `ended`** inside the handler (`decks.cue` + `decks.play`), then the reducer steps; the source effect cues too for a manual skip onto the preloaded track.
- **Refusal fallback**: a `NotAllowedError` on a deck that never played while the other has → the file moves onto the deck that has played.
- **Radio**: `useStation` gains `upNext()`; `handOver` passes `inPlace` to `tuneTo` when the active deck already holds the next slot's song, so no owed seek breaks the join (drift > 1 s still seeks).
- **Arm effect order**: the arming effect in `use-audio-player.ts` runs after the source effect, or it would re-point the standby the source effect is about to cue.

## Errors and dead ends

- CDP `Fetch.fulfillRequest` with a full 200 body stalls playback at ~3.4 s (no Range); fixed by `Fetch.continueRequest` to a local Range-capable server (`tmp/preview/tones.mjs`). `tmp/` is not on the successor's container.

## State

- Branch `claude/preload-next-track-3zzzh4`, draft PR https://github.com/vzakharov/vovazakharov.com/pull/165, base `main`. Head pushed: 0d1e0c6 (cost row) on top of cd0665e.
- Plan: `docs/plans/preload-next-track.completed.md`.
- Squash proposal: `docs/remove-before-merging/squash-message.md`, posted as comment 6208542417; PR title `feat(vova): preload the next track for seamless playback`.
- Nothing runs on PRs (only `deploy.yml`); vet not yet run on this branch. No subscriptions or check-ins.
- Estimate: this session 7.5 h senior developer + 2 h middle qa (reasons as in the ledger). Remainder handed on: `--part 0.5 senior developer "land prep: the vet run, the base merge and the attestation that a merge to main deploys on"`.

## Pointers

- Code: `src/pages/music/lib/decks.ts`, `use-audio-player.ts`, `use-station.ts`, `player-state.ts` (+ `player-state.test.ts`, `upcomingTrack`).
- Measured: `ended`→`playing` 26–27 ms with decks vs 58–60 ms single element (local files, headless Chromium).
- Predecessor transcript: https://claude.ai/code/session_011ppWSmHfPMGBBWtwrMDZMg

## Next step

The operator's latest request, «отлично, давай мерджить», is `/finalize and merge`: run it from the top (staged swap, polish, vet, base merge, sweeps, ready, squash reconcile, check-merge, attest, merge if the run was uneventful).
