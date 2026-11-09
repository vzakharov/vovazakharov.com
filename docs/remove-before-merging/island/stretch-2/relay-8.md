# Relay 8 (stretch 2) — leading bite 3; memo tooling fixed

Picked up relay 7 (`relay-7.md` beside this file). Relayed at ~300k, the lead's
line.

## Standing constraints

The plan's standing constraints (top of
`docs/plans/world-game-zoltan-syama.paused.md`) hold — among them: a lead
relays at 300k and not before, a context-budget notice under it is noted and
the work carries on (Vova: «договорились же что лиды до 300к работают
всегда»). Carried: a board-thread reply is in the comment's language; never
resolve a board or review thread; merge state and CI are reported, not fixed,
outside `/finalize`; only the lead watches, answers and publishes the board. The
muthur sync offer was made; do not make it again.

## The conversation

1. (launch) `/relay take island/stretch-2 — бит 3 строится у участника с пунктами 14 и 15, ветка ревью #269 открыта и ждёт первого handle` — attached, watched/opened the board, flipped the plan, armed a memo wait, restated #269's base question.
2. (Stop-hook feedback: cost pricing failed on `git merge-base`) — shallow clone; deepened it.
3. (memo wakes) — call 12 opening and call 15 hash readings settled in `bite-3.md` (bcaee291).
4. «ревьюер опять подписался на артефакт. я ему уже сказал отписаться, но почему они продолжают это делать» — cause: `board-notice.py` is silent only where `memo.md` exists; `island/review-2` had none. A lead memo created it; reviewer confirmed.
5. «он ещё и не слушал memo. давай может создадим какой-то хук, который не даёт закончить ход, если не включено memo. Единственное, нужно как-то сделать, чтобы он только работалтогда, когда мы решили, что мемо вообще нужно» — built `.claude/hooks/memo-wait-gate.py` (+ test, shared `memo_channel.py`), d3379450.
6. «а ещё, по поводу мемо: я вижу что каждый раз приходится вызывать Read … их нельзя просто выводить в аутпуте бэкграунд-таски когда она заканчивается?» — the harness's notice carries only status; `Monitor` expires every 30 min; recommended keeping Bash waits.
7. «> Если на экране мешает именно строчка с Read / нет, речь была про отдельный round-trip агента. но ок, есть как есть. тебе ревьюер прислал заметку про баг в ack'е?» — fixed: `memo.py post --ack` (b41c8b02); both sessions told to merge the stretch.
8. «мен. договорились же что лиды до 300к работают всегда» (mid-turn, as I relayed at ~210k) — admitted the miss, reclaimed the plan (b1a869a4), rewatched the board, pinned the first sphere frames (board v54, frame 0052, d495a3f6), took the member's equinox-sun option (b) into call 12 (d28b3c61), and call 13's raise (953305e1).
9. «выложи попробовать пжст» — published `island/round-world` to preview slot 1 (https://preview.vovazakharov.com/island); republished after B7c (94dd632).
10. «блин, меня укачивает когда много верчусь, наверное, хорошо сделали :) / по переходу на горизонт: давай пока оставим так, но как только вид на горизонт заполнял бы по краям половину вертикали, показывается подсказка "Press ↑ to look up". (Вопрос как математически рассчитать этот момент). Полное переключение на горизонт -- можно оставить как есть, при этом подсказка "Press ↓ to look down".» (with a screenshot: horizon at the left edge at mid-height, a "50%" marker) + «я бы ещё сделал какую-то кнопку для вывода диагностических данных на экран, чтобы даже по простому скриншоту (или просто мне при игре) можно было бы понять, что где и как» — calls 17 (p\* = asin(sin δ / cos(φ/2))) and 18 written (c9f60859); member builds them as B7d, I for diagnostics.
11. (memo) member: call 17 as written never fires — pitchAt is far steeper than p* at every height; asking Vova among (a) horizon enters the side edges at all, (b) reaches a set fraction from the top, (c) keep p* and flatten pitchAt. Reported to Vova; relayed at 300k. (verbatim in Last agent turn)

## Intent

Bite 3 built without stalls; review never holding up the main track; memo
channels that always have a listener and cannot loop on acks; Vova able to try
the bite on preview and hand over an exact view.

## Decisions

- Call 12: equinox sun; opens at the afternoon hour with the sun 20° up over
  the start, from the west; time paused at open. Taken by the lead on the
  member's recommendation; Vova told and may overrule.
- Call 13: the turn to the horizon a decade higher (18,000 km / 20 m); the
  held-nadir descent and a share-based look are under "Out of the bite".
- Call 15: hash `#<world>@lat,lon,h,heading,pitch[,time]`, pitch as stored.
- Call 17: reading open (above). Call 18: I toggles a top-left panel.
- **ack** — `memo.py post --ack`, a ` · ack` note that never wakes the other
  side. **memo-wait-gate** — a session on a channel cannot end a turn without a
  background memo wait.
- Preview: slot 1 holds `island/round-world`; slot 2 still `island/stretch-2`.
  Republish slot 1 after each visible bite-3 change.

## Errors and dead ends

- Relayed at ~210k on the budget notice, against the plan's 300k rule; undone.
- Call 17's first reading: correct maths, a condition today's camera never
  meets.

## State

- **Branch** `island/stretch-2`, PR #266 (draft, base `main`), head 7ece53b9
  plus this relay's commit. Plan `docs/plans/world-game-zoltan-syama.paused.md`.
- **Member, bite 3**: https://claude.ai/code/session_01DaohkBe2S8jchPRqqwFc9b
  (relayed internally, relay 4) on `island/round-world`, no PR yet. B7a–c
  merged (B7c look at 349174f2: noon/midnight frames in
  `docs/plans/world-game-zoltan-syama/bite-3/notes/b3-b7c-look2/`). A fix agent
  runs on two defects (P during the eye's catch-up copies the floor height;
  play-script shoots one frame late on the sun). B7d (calls 17, 18) built on
  `wt/b3-b7d`, unmerged, waiting on Vova's call-17 reading. Then B8. Last memo
  is the lead's ack (1aab209).
- **Review session**: https://claude.ai/code/session_01DaohkCKMYsFjXamNHjgfHK
  on `island/review-2`, PR #269, waiting for Vova's first `/handle`.
- **Board** v54, frame 0052; watch stopped by this session.
- **Preview** slot 1: `island/round-world` at 94dd632.
- **Estimate** this session: 1.5 h senior producer + 1.5 h middle developer.
  Nothing handed on.

## Pointers

- `docs/plans/world-game-zoltan-syama/bite-3.md` — contract, calls 1–18.
- `docs/plans/world-game-zoltan-syama/review.md` — the review track.
- `.claude/hooks/memo-wait-gate.py`, `scripts/memo/memo.py` (`--ack`).
- Board republish: the plan's "To republish" bullet; timelapse frames go to the
  `island-timelapse` release as `NNNN-slug.png` + `.json`
  (`python3 .claude/costs/contribution.py --at <time> --json`).
- This session: https://claude.ai/code/session_01DaohkCMighcyRoKGu4QHfm

## Next step

Lead bite 3: watch and open the board, arm
`python3 scripts/memo/memo.py wait --as lead --branch island/round-world --branch island/review-2`,
pin the noon and midnight frames (349174f2, `notes/b3-b7c-look2/`) on the board
as v55 with timelapse frame 0053, rewrite call 17 when Vova's reading arrives
(from the member or from Vova), republish preview slot 1 after visible bite-3
changes, and merge the bite's PR once vet is green, `polish:` commits are on it
and the frames hold. Acks go as `--ack`.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Участник собрал B7d, но вливать пока не стал. Подсказка «Press ↑» в том виде, как я её записал, при снижении не появляется ни разу.

Причина такая. Моё условие было: горизонт у краёв кадра опускается до середины кадра. Но пока ты сам не трогаешь стрелки, камера при снижении смотрит гораздо круче вниз. Поэтому горизонт у краёв всё время остаётся в верхней части кадра, вплоть до земли.

| Высота | Наклон камеры сейчас | Нужный порог |
|---|---|---|
| 10 км | 44° | 4° |
| 100 м | 13° | 0,4° |

На твоём скриншоте горизонт стоит на середине, видимо, потому что ты уже поднял взгляд сам. Формула верна для того, как я понял твои слова, а вот само прочтение, похоже, мимо.

Участник спросит тебя в своей сессии, какой вариант нужен:
- **(а)** подсказка появляется, как только горизонт вообще входит в кадр у краёв (в верхних углах);
- **(б)** когда горизонт у краёв опускается до заданной доли от верха, например на четверть;
- **(в)** оставить порог, а саму камеру при снижении наклонять положе, чтобы порог достигался.

С орбиты подсказки не будет при любом варианте. Пункт 18, панель диагностики по I, готов и вольётся вместе с пунктом 17. Как выберешь, перепишу пункт 17.
```
