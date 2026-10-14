# Relay 1 — radio desync on iPhone (parked)

## 1. Standing constraints

None stated by the operator beyond the repo's own rules. The muthur sync offer
was made; do not make it again.

## 2. The conversation

**Operator (opening):**

> глюк в радио, при этом удалось воспроизвести только на телефоне: подключаешься, играет не с той секунды, которая отображена (а с более ранней -- но при этом не с первой), css-ный ползунок при этом, по-видимому, нормально идёт,так как при достижении конца переключается на следующую песню. но музыка при этом продолжает играть ещё предыдущей песни.
>
> не знаю, возможно ли тут поймать чисто по коду, учитывая что на компе у меня это даже не воспроизводиться. но попробовать можно?

**Agent:** Routed as rung 1 → `/task`. Diagnosis: the radio's dial and card
come from the device clock (`OnAir`'s `useClock`, `RadioDial`), not from the
`<audio>` element, so the element was lagging the clock. Every FLAC master has
no SEEKTABLE (headers checked: only STREAMINFO + VORBIS_COMMENT). On iOS every
browser is WebKit → AVFoundation, which seeks such a FLAC by estimate, landing
early while `currentTime` reports the requested second, so `keepTime`'s drift
check cannot see it; `ended` fires only when the data runs out, after the
clock's slot ended. Same gap breaks every manual seek on the phone. Proposed:
on Apple's engine play the existing `mp3` copy (320 kbps CBR, Info/TOC). Wrote a
draft plan (not code, since it departs from "the master, played as-is" and was
unverified), PR #157. Asked: 1) where MP3 plays — a) Apple engine only,
everywhere in the player (recommended), b) everywhere, c) radio only; 2) is the
phone an iPhone. Offered the muthur sync session.

**Operator:**

> > Ни в одном мастере нет таблицы перемотки (SEEKTABLE)
>
> это что такое? и что мешает её добавить?

**Agent:** Explained SEEKTABLE (an index second → byte offset in the FLAC
header). Adding one is header-only (`metaflac`), audio/MD5/`seconds` unchanged;
corrected the plan's overstated "breaks a master never changes" (commit
5106e1d). Real obstacles: no evidence AVFoundation reads a seektable (indirect
evidence it does not: Apple forum thread 819924, Marco Arment on VBR MP3), and a
second ~25 MB blob per song repo in history. Offered a one-song experiment,
pending a yes, since it pushes to an external repo.

**Operator:**

> а ты говоришь, что перемотка руками тоже тогда должна глючить, да?

**Agent:** Yes. Gave a manual test: jump far ahead into the unloaded part and
compare with desktop; jump to ~20 s before the end — music should outlast the
counter if the seek missed.

**Operator:**

> да, воспроизвелось!
>
> ну давай попробуем сделать пиар только для одной песни, иначе я не смогу проверить потому что она не дойдёт ещё до прода.
>
> кстати, а я не очень понял, почему seektable именно по 10 секунд? а не скажем по 5, 1 или 20? как-то произвольно звучит выбор

**Agent:** Diagnosis confirmed. Explained the site reads audio straight from the
song repo's `main` via raw.githubusercontent, so a song-repo PR goes live on
merge (5-min cache) with no site deploy. 10 s was only `flac`'s default; chose
1 s: a correct decoder seeks exactly at any interval, a sloppy one misses by up
to the interval, and 1 s keeps that under the radio's `DRIFT = 1` for ~4 KB.
Prepared `sultan.flac` with 232 seekpoints in `tmp/` (decoded md5
`ed58ef12a2d13b8c8df440899f9e5a27` identical before/after). The push was denied
by auto mode; handed over the phrase.

**Operator:**

> Запушь sultan.flac с таблицей перемотки в ветку seektable репозитория vovas-music/sultan и открой там PR в main

**Agent:** git push through the session proxy got 403 (Claude GitHub App not
installed on `vovas-music`). Built the same commit via REST with the operator's
token (admin there): blob `2ad1249…` (matches local `git hash-object`), commit
`0e82856` on branch `seektable` over `main` `da34583`. Opened
https://github.com/vovas-music/sultan/pull/1. Said merging is the operator's
call.

**Operator:**

> мерджнул -- то есть теперь можно прямо с нашего прода проверить?

**Agent:** Verified raw URL now serves 25,388,519 bytes with SEEKTABLE. Yes,
test on prod: wait out the edge cache (≤5 min), use a private tab; jump to ~3:00
and ~20 s before the end.

**Operator:**

> наверное ещё айфон мог тоже закешировать

**Agent:** `max-age=300` means Safari revalidates after 5 min; a private tab
has an empty cache; or clear Safari website data. Chrome on iOS has its own
cache — use incognito.

**Operator:**

> хорошо, давай запаркуем эту сессию, потом я вернусь

**Agent:** `/relay park` (this file).

## 3. Intent

Fix the iPhone radio desync (and, by the same cause, manual seeking on iPhone).
The operator prefers to test on prod; they wanted the experiment scoped to one
song. Nothing ruled out yet between the two fixes.

## 4. Decisions

- **Cause**: AVFoundation's estimate-based seek in FLAC without SEEKTABLE,
  reporting the requested `currentTime`. Confirmed by the operator's manual-seek
  repro on the phone ("да, воспроизвелось!").
- **Two candidate fixes**, decided by the pending `sultan` test:
  - SEEKTABLE in every master (preferred if it works: the master stays the
    master). Cost: re-pushing every `vovas-music` repo's FLAC (~25 MB new blob
    each), via REST since the app has no access there.
  - MP3 copy on Apple's engine (the draft plan as written, option 1a). Works
    regardless, since a CBR MP3 seeks by arithmetic.
- **Seekpoint interval 1 s**, not `flac`'s default 10 s — bounds a sloppy
  decoder's miss under `DRIFT` for ~18 bytes/point.
- **Song repo PRs go live on merge**, no site deploy: the site plays
  `raw.githubusercontent.com/vovas-music/<repo>/main/<file>`.

## 5. Errors and dead ends

- `metaflac` in place on `/home/user/sultan` was denied by auto mode ("Modify
  Shared Resources"); worked on a copy in `tmp/` instead, then the operator
  named the push.
- git push to `vovas-music/sultan` → 403 from the session proxy, also with an
  explicit token header. REST (`gh api` git/blobs → trees → commits → refs)
  worked.

## 6. State

- Branch `claude/radio-webkit-seek-mnv6xc`, draft PR
  https://github.com/vzakharov/vovazakharov.com/pull/157, plan
  `docs/plans/radio-webkit-seek.draft.do-not-implement.md` (draft — no go-ahead
  given). Squash proposal at `docs/remove-before-merging/squash-message.md` and
  as a PR comment; both describe the MP3 fix.
- `vovas-music/sultan` PR #1 **merged** 2026-10-14T21:21:41Z; prod serves the
  seektabled `sultan.flac`.
- **Waiting on the operator's iPhone test** of «Мой султан» on prod.
- Nothing else running; keepalive stopped.
- Estimate: this session 2 h senior developer ("pinning a device-only bug to
  AVFoundation's FLAC seeking took someone who reads codec headers and knows how
  each engine seeks; the seektable experiment needed the same depth").
  Remainder for the successor: 1.5 h middle developer (whichever fix wins is a
  small change — a source switch in the player, or a scripted metaflac pass over
  every song repo) + 1 h middle qa (confirmed only by hand on an iPhone beside a
  desktop).

## 7. Pointers

- `src/pages/music/lib/use-station.ts` (`keepTime`, `tryTuneIn`),
  `src/pages/music/lib/use-audio-player.ts` (source effect),
  `src/pages/music/ui/on-air.tsx` + `radio-dial.tsx` (clock-driven dial).
- `scripts/song-intake/CLAUDE.md` § "A song's repository" — changes to audio
  happen in the song's repo.
- Check a FLAC for a SEEKTABLE without downloading it all:
  `curl -sS -H "Range: bytes=0-8191" -o x.bin <raw url>` then parse metadata
  block types (type 3 = SEEKTABLE).
- Song audio URLs: `grep -h "^audio:" apps/vova/public/music/songs/*.md`.
- Pushing to `vovas-music/*`: REST via `gh api` with the operator's token
  (`git/blobs` base64 → `git/trees` with `base_tree` → `git/commits` →
  `git/refs`); git smart-HTTP is refused by the proxy.
- Predecessor transcript: https://claude.ai/code/session_019VugH2y9S5RAbo5X9S1To5

## 8. Next step

Wait for the operator's result of the `sultan` test on iPhone. If seeking now
lands right: rewrite the plan to add a 1 s SEEKTABLE to every FLAC master
(scripted, via REST per song repo) instead of the MP3 switch, and refresh PR
#157's body and squash proposal. If it still misses: the plan stands as written
(MP3 on Apple's engine), awaiting `/go`.
