# Relay 1 — island/tile-flicker (parked)

## Standing constraints

This was a member session on a bite of the island game; the plan's standing
constraints are in `docs/plans/world-game-zoltan-syama.paused.md` § "Standing
constraints". The ones that bound this bite:

- «надо postmortem и standing constraint чтобы этого избежать» — no `git pull`;
  integrate with `git fetch origin <b> && git merge origin/<b>`.
- «давай заведём правило, что артефакт может править только оркестратор
  ("продюсер"?)» — only the lead edits the board; members propose through memo.
- «/sync-branch из каждого куска -- ага» — a member syncs against its PR's base
  before pinging green.
- «увидел "[имя репозитория]" на скрине, нигде это упоминать не надо» — the
  private repo the memo tooling is ported from is never named.

## The conversation

No operator message was sent in this session. It ran from a system brief: work
the lead's memo note on `island/tile-flicker` end to end
(`python3 scripts/memo/memo.py show --branch island/tile-flicker`), posting
progress and the PR there and waiting for the lead's replies.

- Agent: built `coverAround` and the `shown` selection in the scene, traced a
  scripted turn and climb per frame, opened #268 onto `island/stretch-2`, pinged
  the lead.
- Lead (memo): #268 conflicted with bite 2 (`setWorld`, world fields); sync,
  reset `shown` on `setWorld`, re-run the replay on world fields, vet green.
- Agent: synced, resolved, re-traced on world 1, formatted the base's unformatted
  `worlds/memo.md`, vet green, pinged.
- Lead (memo): merged #268; the prettier commit stays; "you may stop".
- Agent: acknowledged in memo; reported the merge in chat. (verbatim in Last
  agent turn)

## Intent

Fix terrain blanking on turns and coarse coasts on climbs (operator's report,
2026-11-09), shipped into `island/stretch-2`. Merge was the lead's.

## Decisions

- **`shown`** — the last selection wholly in hand; render draws it, with
  `coverOf` stand-ins only over selected tiles it does not overlap
  (`coverAround`). Beat plain `coverOf`, whose coarse stand-in hid the fine
  ground and sat above a 2 m eye.
- A margin tile straddling `shown`'s edge draws nothing until loaded, rather
  than a coarse stand-in overlapping `shown`.
- `shown` resets on `moveTo` and `setWorld`; not on `setHeight`/`turnTo`.

## Errors and dead ends

- The first trace counted "eye not covered" frames where the selection itself
  has no tile under the eye (looking ahead from height); the tally was
  restricted to frames whose selection covers the eye.
- World 1's sea covers the old inlet point (499000, 1113200); the replay moved
  to a world-1 coast at (−2250000, 150000).
- `memo.py wait` requires `--as member`.

## State

- Branch `island/tile-flicker`, head 02807d3c (memo ack), clean and pushed.
- PR #268 merged into `island/stretch-2` by the lead. Nothing running.
- Estimate unchanged — this session did the whole bite: 5 h senior
  graphics-programmer + 1 h senior qa; no remainder.
- No artifact watches were held.

## Pointers

- `src/island/pages/island/model/tile-cover.ts` (`coverAround`) and its test.
- `src/island/pages/island/ui/island-scene.ts` (`shown`, `showIfComplete`).
- `docs/remove-before-merging/island/tile-flicker/memo.md` — the memo channel.
- The replay was `tmp/tile-flicker/trace.ts` (not committed; its numbers are in
  #268's body).
- Transcript: https://claude.ai/code/session_01DaohkDUXEdJ3uCUa1RoqrJ

## Next step

Wait for the operator — the bite is merged and the lead said to stop.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Вова, ответ лиду дошёл, хотя фоновая задача и показала «остановлена по таймауту». Коммит `02807d3c` с подтверждением уже на `origin/island/tile-flicker`, а локальная ветка совпадает с удалённой. Остановилась только сама команда: она не завершилась после публикации и висела до лимита времени.

На этой ветке больше ничего не осталось: #268 смерджен, лиду я ответил.
```
