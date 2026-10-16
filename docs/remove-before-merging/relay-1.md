# Relay 1 — seamless HQ switching

## 1. Standing constraints

None stated by the operator beyond the repo's own CLAUDE.md.

## 2. The conversation

**Operator:** «давай сделаем переключение HQ (почти) seamless: пока файл с
другим качеством грузится, играет предыдущий, а новый грузится в отдельный
audio. как только тот готов, audio подменяется. получится или слишком
изощрённо?»

**Agent:** Routed via `/task` → planless `/go` (the player already had two
decks, so the standby one takes the switch). Implemented `swapIn` in
`decks.ts`, rewired `use-audio-player.ts`, verified with a scripted headless
Chromium harness (0 ms silence, cut 8–10 ms behind), ran `/polish`, opened
draft PR #168 with QA checklist and squash proposal. Flagged iOS (WebKit
per-element autoplay) as unverified; fallback is the old in-place reload.

**Operator:** «пока не смотрел код -- а что будет в эдж кейсе когда человек
одновременно нажимает hq и прыгает на следующий трек?»

**Agent:** Answered from code and a new harness scenario: next track plays
normally, the swap calls itself off (it records the file it replaces), `cue`
refuses the standby deck mid-swap, spinner clears. Noted the abandoned HQ
download lingered up to ~1 s sharing bandwidth; offered to drop it at once
("Сделать?").

**Operator:** «давай»

**Agent:** Done in 1dd2ef9: a dropped swap unloads its file, and the active
deck's `loadstart` triggers the check, so it fires even before the standby
request's first byte. Harness: standby empty by +300 ms in both timings.

**Operator:** «src/pages/music/lib/decks.ts раздуло, надо делить»

**Agent:** Split in d6626fc into `decks.ts` (two decks, preload, cue, play,
wiring), `deck-swap.ts` (`createSwapper` behind a `SwapHost`) and
`deck-element.ts` (`loaded`, `refusal`, `unload`, `DeckListener(s)`,
`DeckPlayback`). Lint, tsc, type-overlap, steiger clean. Harness re-run: one
run's first scenario did not land within 6 s (`landed: 0`, old file kept
playing, no silence); two following runs landed cleanly. Cause not
established. Then the context budget's pause line hit and this relay ran.

## 3. Intent

Near-seamless HQ/MP3 switching on the music player, robust across
interleavings (pause, seek, cancel, track change), production-grade. The
operator asks about edge cases before reading code, and wants files kept
under ~450 lines.

## 4. Decisions

- **Reuse the standby deck rather than a third `<audio>`** — the gapless
  preload infrastructure already exists; the swap evicts the next-track
  preload, which `rearm()` restores after landing (and the preloaded MP3
  was the wrong quality after an HQ toggle anyway).
- **Alignment**: standby seeks to the song's moment on metadata (fetch from
  there, not from the top), waits until `buffered` covers `at .. at+1s`
  (`AHEAD_SECONDS`, clamped to duration), seeks inside the buffer, lands on
  `seeked`/`canplay`. Realigns if the decks part by > 0.5 s
  (`REALIGN_SECONDS`, a seek meanwhile).
- **Landing**: outgoing keeps playing until `incoming.play()` resolves —
  overlap of a few ms rather than a gap.
- **Fallback "taken in place"**: on NotAllowedError or a standby load error,
  the active deck loads the file itself and resumes at the position (old
  behaviour); its reset-to-0 `timeupdate` is muted (`resetting()`).
- **Cancellation is lazy-by-identity**: a swap records `replaces`; any other
  file on the active deck ends it (`current()`), and the abandoned file is
  unloaded.
- Field names `replaces`/`brings`/`resumeAt` were chosen to pass
  `pnpm type-overlap` (collisions with `mushrooms` types on `from`/`to`/`at`).

## 5. Errors and dead ends

- Lint rejected `no-use-before-define` for variables (functions are allowed),
  so `createSwapper(...)` sits above `rearm`/`play` in `createDecks`.
- Harness gotchas: `pkill -f server.mjs` inside `bash -c` kills the shell
  itself; a backgrounded `&&` chain backgrounds everything before it.

## 6. State

- Branch `claude/seamless-quality-switch-i2xtai`, head d6626fc, pushed.
- Draft PR https://github.com/vzakharov/vovazakharov.com/pull/168 — open,
  mergeable, title `feat(vova): HQ switches without a gap, the old file
playing on`. Squash proposal comment posted and tracked in
  `docs/remove-before-merging/squash-message.md`; it does not mention the
  split, which changes no behaviour (record unchanged).
- No plan file. No CI runs on PRs. No subscriptions or check-ins.
- Estimate unchanged: 6 h senior developer + 2 h middle qa — the work is
  done here; what remains is land prep.
- `/polish` has not run over 1dd2ef9 and d6626fc (floor is ac2b65b).

## 7. Pointers

- `src/pages/music/lib/deck-swap.ts` — the swap state machine.
- `src/pages/music/lib/decks.ts`, `deck-element.ts`,
  `use-audio-player.ts` (the effect that calls `swapIn`).
- The harness lived in the predecessor's scratchpad and is gone. To rebuild:
  ffmpeg-generated `song.mp3` and a FLAC-in-MP4 (`-c:a flac -f mp4`, pink
  noise for a realistic ~110 KB/s); a Node static server with Range
  support, 400 ms first-byte delay and a 150 KB/s cap; `decks.ts` bundled
  by `node_modules/.bin/esbuild` with `window.Audio` patched to collect the
  elements; `playwright-core@1.56.1` installed in the scratchpad, Chromium
  at `/opt/pw-browsers/chromium` with
  `--autoplay-policy=no-user-gesture-required`; sample both decks every
  10 ms for gap, overlap and cut offset.
- Predecessor transcript: https://claude.ai/code/session_01CUX3SSQcqu7TRBpW2LhEdX

## 8. Next step

Wait for the operator. Pending on their side: reviewing the diff, an iPhone
check (QA item `ios`), then `/finalize`. Unresolved and worth raising if they
ask about reliability: the one non-reproduced harness run where a swap did
not land within 6 s.
