# Relay 1 — island/review-1

## Standing constraints

From `docs/plans/world-game-zoltan-syama.paused.md` § "Standing constraints"
(the lead's plan; read it whole), the ones that bind this member:

- No `git pull`, ever — integrate with
  `git fetch origin <b> && git merge origin/<b>`. A hook now refuses `pull`.
- Only the lead publishes or edits the board artifact
  (https://claude.ai/artifact/5ya2F3bA8kwrmLhEyAib3P). Change the board's code
  and source format freely, never publish; propose content changes with
  `python3 scripts/memo/memo.py post --as member --branch island/review-1 "<text>"`.
- The private repo the memo tooling is ported from is never named.
- Everything on the board is in English.
- From the launch prompt: open the PR onto
  `claude/world-game-zoltan-syama-hodowq`, not main (done: #258); reply on #255
  in Russian per CLAUDE.md § "GitHub comments"; never resolve a thread; run on
  Opus throughout; when done or blocked, post a memo — the lead waits on it.

## The conversation

1. Launch (`/from-branch island/review-1 — handle the operator's code review on
#255 …`): handle threads T01–T10, T12–T20 of #255 on this sub-branch; R02 and
   T11 are the lead's; plan T01/T12/T13/T15 before building.
   → Handled T02–T10, T14, T18–T20 directly (via three subagents for
   T09, T19/T20, T02/T03), wrote the plan
   `docs/plans/island-review-1.draft.do-not-implement.md` for T01, T12, T13,
   T15, T16, T17, opened draft PR #258, replied on every thread. The lead later
   handed over R02 by memo (cut cycle instead of an epic branch): recorded in
   `.claude/skills/mammoth/notes/gates.md` and the lead's plan constraints,
   answered on #255.
2. Operator: «Разрешаю подключить репозиторий vzakharov/life (add_repo, только
   чтение), чтобы взять оттуда правила против слопа для кейса island.md»
   → Attached and cloned it to /home/user/life; the applicable rule
   (`.claude/rules/outreach-writing.md`: polish and native idiom read as a
   machine) took two more flourishes out of `island.md` (cf3fd6ec).
3. Operator: «так... я начал отвечать, потом подумал что стоит остановиться,
   потому что ты там всё говоришь про какой-то "план", и я не понимаю, о чём
   ты»
   → Explained: "the plan" is the one file describing the board's move into an
   app, written before building because the move is large; summarised its five
   points (MASD app `src/board/`; one YAML at `docs/boards/island.yaml` with the
   `box` key; `main.ts` split, SCSS, tests beside modules; the 400-line test,
   repo-wide with a shrink-only allowlist recommended; published board keeps
   syncing because YAML is the file codec only). Nothing built yet.
4. Operator: «а, да, ок, приступай» — the go-ahead for that plan.
   → This relay: the session was past its context budget, so it hands the
   build to a fresh session (verbatim in Last agent turn).

## Intent

All of #255's review handled on this sub-branch without holding up the lead.
What is left is building the board-as-app plan, which the operator has now
approved.

## Decisions

- **The board's source is `docs/boards/island.yaml`**, outside `docs/plans/`,
  which `/finalize` sweeps. The plan's item shape follows the operator's T13
  sample (`id`, `type`, `updated: [time, author]`, `text`) with `box` for
  geometry and colour (a flow sequence, since an unbracketed list parses as one
  string) and `ends` for lines. Beat: type-as-key (`sticky: call-5`), shorter
  but further from what the operator wrote.
- **YAML is the file codec only**: the page bakes decoded items as today, and
  the artifact's db rows keep their shape, so the published board's `sync`
  works across the move.
- **400-line test**: lines, confirmed by the operator via the lead. Scope
  recommended repo-wide with today's 51 offenders frozen in a shrink-only
  allowlist (each entry may not grow); the operator has not answered, and
  silence was stated to mean this option (reply on T16).
- **Plane types live in `src/scene/shared/lib/plane.ts`** (T19): their users
  are mushrooms and the board, whose only other common ancestor is kernel. The
  board app may depend on `scene` for them.
- **Re-exports only in barrels** (T20), plus an exemption for routers
  `sites/*/app/**` because Next reads route exports by name — asked the
  operator to confirm, no answer yet.
- **Review words** (T02/T03): `operatorWords: {chat, review}` plus
  `reviewPosts: {node id: words}`, recorded at PR export through a pending file
  `tmp/costs/review-words/<sid>.json`; `contribution.py` unions posts across
  sessions. "Human" means no Claude Code footer.
- **`estimate.py set --subject`** is required; the subject rides on the
  estimate (`estimate.subjectLine`).
- **Cut cycle** (R02): the mammoth reaches main through `island/cut-N`
  branches, finalized and squashed; main merged back.

## Errors and dead ends

- An `isolation: "worktree"` subagent got a worktree off `main`, not this
  branch; its commits were cherry-picked. Recorded in the mammoth notes: make
  the worktree yourself with `git worktree add tmp/<name> -b <b> HEAD`.
- The clone was shallow, so `git merge-base origin/main HEAD` failed and the
  cost Stop hook could not price a turn; `git fetch --deepen=300 origin main
island/review-1` fixed it. A fresh container may need the same.
- `memo.py` writes `memo.md` in a shape `pnpm format:check` rejects; told the
  lead.

## State

- Branch `island/review-1`, PR #258 (draft) onto
  `claude/world-game-zoltan-syama-hodowq`. Last pushed: see `git log -1`.
- Plan: `docs/plans/island-review-1.draft.do-not-implement.md` — still a draft;
  the go-ahead is quoted under Next step, and `/go` flips it.
- `./scripts/vet.sh` not yet run on this branch. Local typecheck, lint and
  `pnpm test:all` (669) and the costs/hook Python suites were green.
- Estimate revised to this session's part: 7 h senior developer (eighteen
  review threads across tooling), 1 h senior architect (the plan), 1 h senior
  editor (the case study). The board build is the successor's to estimate.
- This session's board watch is stopped before the successor starts.

## Pointers

- `docs/plans/island-review-1.draft.do-not-implement.md` — the approved plan.
- `docs/pr/255/pr.md` — the review (`python3 scripts/export-github-item.py 255`
  re-takes it).
- `scripts/board/` — the code being moved; `docs/plans/world-game-zoltan-syama/board/`
  — the 65 item JSONs and images being converted.
- `src/mushrooms/scripts/build-mushroom-artifact.ts` — how a script bundles
  `src/` through esbuild with the repo tsconfig.
- `knip.ts`, `src/masd.json`, `.claude/rules/masd.md` — the checkers the new app
  must satisfy (`pnpm knip` already fails on `scripts/board/page/*` today).
- This session: https://claude.ai/code/session_01DaohkBPPsH9jFCtdTa4Qb9

## Next step

Build the plan. The operator's go-ahead, given in this session in answer to the
plan's summary: «а, да, ок, приступай». `/go` flips the plan quoting it, then
implements, runs `/polish`, and hands to `/pr`. Afterwards reply on #255's
T01, T12, T13, T15, T16, T17 with the commit SHAs, and post a memo to the lead
saying the board's source moved and the next publish builds from
`docs/boards/island.yaml`.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Когда я пишу «план», я имею в виду один файл, который я написал вместо того, чтобы сразу переделывать доску. Твои треды T01, T12, T13, T15, T16 и T17 вместе — это переезд всей доски, а такую работу в этом репо сначала описывают и показывают тебе, а потом уже делают. «План» — неудачное слово: у острова планом и так называют доску, отсюда и путаница.

Файл лежит в PR #258: `docs/plans/island-review-1.draft.do-not-implement.md`. По сути там пять пунктов:

1. **Доска становится аппом `src/board/` по MASD.** Модель карточек, страница и стили раскладываются по слоям, сборка артефакта остаётся скриптом.
2. **Весь исходник доски — один YAML,** `docs/boards/island.yaml`, вне `docs/plans/`, чтобы финальный мердж его не стёр. Карточка выглядит как в твоём примере, а ключ для координат называется `box`: `box: [1512, -573, 244, blue]`.
3. **`main.ts` режется на шесть файлов,** `style.css` превращается в `board.scss`, тесты едут рядом со своими модулями.
4. **Тест «не больше 400 строк на файл».** Предлагаю проверять весь репо, а 51 уже длинный файл держать в списке исключений, который может только сокращаться.
5. **Уже опубликованная доска продолжит синкаться.** YAML — только формат файла, строки базы артефакта не меняются.

Ничего из этого ещё не сделано: жду твоего «да» или правок. Всё остальное из ревью уже в ветке.
```
