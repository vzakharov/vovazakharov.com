# Relay 7 — postmortem, the board hook, board v6

## 1. Standing constraints

All in the plan's § "Standing constraints", verbatim. Two were added this
session:

- «надо postmortem и standing constraint чтобы этого избежать» — no `git pull`
  on the island branch or a bite's, `--ff-only` included; integrate with
  `git fetch origin <b> && git merge origin/<b>`. No subagent in the lead's
  checkout while a `memo.py wait` is armed.
- «не дело что раз за разом сессии лида об этом забывают» — about watching and
  opening the board. `.claude/hooks/board-notice.py` now names whichever of
  `ArtifactComments` `watch` / `Artifact` `open` the session still owes, on every
  prompt.

Carried over: the private repo memo.py was ported from is never named; only the
lead edits or publishes the board, and every publish is a timelapse frame with a
figures sidecar; the successor watches the board, and this session stopped its
watch before handing on.

The muthur sync offer was made; do not make it again.

## 2. The conversation

Opened on `/relay take claude/world-game-zoltan-syama-hodowq — бит 0 закрыт и на
паузе для ревью, бит 1 строит исполнитель, первые кадры посмотрены`.

**Agent:** Attached, watched the board, found the fresh-PR agreement had reached
the member (no re-post needed), armed the memo wait, reported the state.

**Operator:** «> который закрылся «смерженным» случайно — надо postmortem и
standing constraint чтобы этого избежать»

**Operator (mid-turn):** «почему я не вижу в списке артифакта, ты подписывался?»

**Agent (mid-turn):** Yes, subscribed; only an `open` lists an artifact in the
session; opened it.

**Operator (mid-turn):** «так... не дело что раз за разом сессии лида об этом
забывают»

**Operator (mid-turn):** «не могу отправить коммент (ну и по сути)» — a
screenshot: a comment on sticker bite1-4, «@Claude а где картинки можно
посмотреть?», failing with "Couldn't send the comment to Claude."

**Agent:** Sent the member's seven frames (20:15) as files; built
`board-notice.py` with tests; wrote the postmortem and the constraint; said the
comment never reached the board (no threads) and asked to retry or write in
chat; offered a `PreToolUse` hook blocking `git pull` repo-wide, the operator's
call (unanswered).

**Operator:** the orbit frame, «чё-то великовато для Конго, не?) смущают ещё
рваные края, ну и общий "не супер-пупер" вид (посмотри ещё раз на океан и
вдохновись) (не обязательно в этом куске естественно)»

**Operator (mid-turn):** «ну эт понятно, но весь прикол доски был в нелинейном
(для меня) общении. Возможно как-то связано с синхронизацией артефакта с репой?
¯\_(ツ)\_/¯»

**Operator (mid-turn):** «ну вот же» — a screenshot of call-1's sticker, "Real
scale: Arc is the DR Congo, the island ~5,000 km across…".

**Agent:** Measured the frame: Arc ≈ 2 M km² (Congo), the island ~8,000 km with
outliers — the call as made; asked: keep the continent or shrink the whole
island to Congo size. Ragged coast sent to the member as this bite's work; the
sea and sky put off to the sea bite. Guessed the comments fail because the board
was last published by a dead session, and republished it from here (v6) to
test. Hit the context line and relayed. (verbatim in Last agent turn)

## 3. Intent

Unchanged: Island eaten as a mammoth, the board is the plan and the operator's
non-linear channel («весь прикол доски был в нелинейном (для меня) общении»).

## 4. Decisions

- **The postmortem's thesis**: a pull merges whatever `FETCH_HEAD` holds, and
  besides memo's (fixed) poll the cost `Stop` hook, `floor.py` and
  `check-merge.sh` still fetch in the checkout; so the guard is the integration
  step, not any one poller. Verified in a scratch repo that
  `merge --ff-only FETCH_HEAD` fast-forwards onto a stray descendant branch, and
  that a stray `cost-ledger` `FETCH_HEAD` fails as unrelated histories.
- **board-notice is `UserPromptSubmit` only**; a relay-take's first prompt
  carries it. A publish to the board's url counts as an open; a later
  `on: false` makes the watch owed again.
- **Scale stays as call 1 sets it** until the operator answers (sticker
  `later-2` on the board).
- **Ragged coast is bite 1** (member's R6: drop specks, simplify, smooth,
  antialias, a shallow-water band); the sea and sky are a later bite (sticker
  `later-1`), sun glint from orbit optional per the operator's words to the
  member: «ну тут я не настолько уверен, конечно, что прямо с орбиты должно
  солнце отсвечивать, я про общее ощущение».

## 5. Errors and dead ends

- **Comments to Claude on the board fail** ("Couldn't send the comment to
  Claude."; `ArtifactComments read` shows no threads at all). This session held a
  registered watch the whole time, so the watch alone is not it. Hypothesis
  under test: routing follows the session that last published; v6 is now
  published from here, and the successor should republish too if comments still
  fail after it takes over. If they fail anyway, it is platform-side.
- The board's live HTML differs from the build by the platform's wrapper only;
  the first publish is refused until the saved live copy is `Read` (one slice is
  enough), then the identical file goes through.

## 6. State

- Branch `claude/world-game-zoltan-syama-hodowq`, PR
  https://github.com/vzakharov/vovazakharov.com/pull/255 (draft, MERGEABLE
  CLEAN at pickup). Head 75b2ba8a7 plus this summary's commit.
- Plan `docs/plans/world-game-zoltan-syama.paused.md`; postmortem
  `docs/plans/world-game-zoltan-syama/postmortem-686f5174.md`.
- Board https://claude.ai/artifact/5ya2F3bA8kwrmLhEyAib3P version 6; timelapse
  frame 0005 (`0005-board-later-bites.png` + `.json`) on `island-timelapse`.
  Watch stopped here before the handoff.
- Bite 1: member session https://claude.ai/code/session_01DaohkDjdL2UcHBHn3eyXfZ
  (relayed once), working R6 (coast) and R7 (dashed tile edges on phone orbit);
  R3b/R4/R5 frames in hand, not yet committed. Last memo: member 20:57 (the
  operator's glint words, R6/R7). No memo wait running.
- Nothing running here: keepalive and waits stopped.
- Estimate: this session 1 h senior developer ("a race in git's FETCH_HEAD
  between sibling processes needs reproducing in a scratch repo and a tested
  guard hook") + 0.5 h senior producer ("routing an operator's look at a frame
  into a member's scope, a later bite and an open question on the board").
  Remainder handed on: 1 h senior producer ("judging a member's final frames
  against the drawing, merging its bite and publishing the preview is the
  producer's gate on a team's first bite").

## 7. Pointers

- `docs/plans/world-game-zoltan-syama.paused.md` — the plan and its constraints.
- `docs/plans/world-game-zoltan-syama/bite-1.md` — bite 1's contract.
- `.claude/hooks/board-notice.py`, `.claude/hooks/test_board_notice.py`.
- `python3 scripts/memo/memo.py show --branch island/bite-1-descent`.
- Frames: `git ls-tree --name-only origin/island/bite-1-descent
docs/remove-before-merging/island/bite-1-descent/frames/`.
- This session: https://claude.ai/code/session_01DaohkET9AgLB7ougEHi1rq; earlier
  ones in `relay-6.md` and before.

## 8. Next step

The lead's waiting turn: watch and open the board (the hook will say so); arm
`memo.py wait --as lead --branch island/bite-1-descent` in the background; read
the board's comments — if the operator's comments now arrive, answer them there
(the operator's «а где картинки можно посмотреть?» first, if it shows up); if
they still fail, republish the board from the successor and say so. Pending to
the operator, both unanswered: the scale question (sticker `later-2`), and
whether to build a repo-wide `PreToolUse` hook blocking `git pull`. When the
member posts done: final frames beside the drawing, vet on the bite's head,
merge it in with fetch + merge, `/preview live`, tick bite 1's stickers in a
board publish with its timelapse frame.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Записываю постмортем и правило в план острова.

Now wire it in and run the tests plus a live run on this session's transcript.

The tests pass. On this session's real transcript the hook stays silent, which is correct since both calls were made, and on an empty transcript it names both. Now I'll wire it into settings.

Next I'll add the constraint about pulls to the plan and update the existing artifact rule.

Вова, картинки я отправил выше: семь кадров исполнителя от 20:15. Сам я пока рассмотрел только 10 км. Там уже видны холмы и тени на склонах, хотя по этим замечаниям он работает до сих пор.

**Почему не отправился коммент.** Он не дошёл совсем: на доске сейчас ни одной ветки комментариев. Подписка с моей стороны стоит, я проверил. Значит, отказ на стороне платформы, и отсюда я его не починю. Попробуй ещё раз. Если опять не уйдёт, пиши сюда, в чат: всё, что ты бы спросил на доске, я и так вижу здесь.

**Чтобы лид не забывал про доску.** Новый хук `.claude/hooks/board-notice.py` на каждом твоём сообщении ищет в плане ссылку на доску. В истории сессии он проверяет, есть ли вызовы `watch` и `open`. Пока какого-то нет, он подсовывает агенту, что именно не сделано. Потеряется правило в прозе плана — хук всё равно напомнит. На моей сессии он молчит, потому что оба вызова сделаны. На пустой сессии называет оба. Пять тестов зелёные.

**Постмортем и правило** лежат в `docs/plans/world-game-zoltan-syama/postmortem-686f5174.md` и в стоящих ограничениях плана. Коротко:
- **Причина.** `git pull` сливает то, что записано в `FETCH_HEAD`, а этот файл переписывает любой fetch в том же checkout. Ожидание записок лидом как раз делало fetch ветки бита. Pull полиш-агента в той же папке смерджил бит вместо своей ветки, и GitHub закрыл #256 как смердженный.
- **Почему одного фикса в `memo.py` мало.** Тот же файл перезаписывают ещё три места: хук учёта стоимости на каждом ходу, `floor.py` и `check-merge.sh`. Даже `pull --ff-only` не спасает. Я проверил на отдельном репозитории: он спокойно перематывает ветку на чужую, если та от неё происходит, а биты все происходят от ветки острова.
- **Правило.** На ветке острова и в битах никакого `pull`, только `git fetch origin <ветка> && git merge origin/<ветка>`. Субагенты не работают в checkout лида, пока идёт ожидание записок. Мердж-коммит с именем чужой ветки не пушится.

Оба коммита запушены (efa0f22a0, 58d77315f).

Хочешь, сделаю и для правила про pull такой же механический сторож, как для доски: PreToolUse-хук, который не даёт агенту вызвать `git pull` и подсказывает fetch + merge? Тогда это правило будет действовать во всём репозитории, а не только на острове, поэтому решать тебе. Пока я жду записку исполнителя.
```
