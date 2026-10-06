# Relay summary

Relayed from https://claude.ai/code/session_0188wc5zFNmazhw35BEHgjWD, paused for
its context budget (auto-relay is on for vzakharov). That session itself took
over from https://claude.ai/code/session_01Fwef2akzwYW8SYCHZq1KRE, whose summary
is this file's previous version in git (`git log -p -- docs/remove-before-merging/relay.md`).

## 1. Standing constraints

- `/file-basilisk-case` never merges (merge is deploy).
- CLAUDE.md § "GitHub comments": reply to every review comment with one sentence
  plus the bare SHA; never resolve threads; the five-percent entry goes through
  a subagent.

## 2. The conversation

1. `/relay take claude/cases-oh02o8` → attached; ran `/task` on the relayed ask
   (ledger of searches; robotaxi counts as "no AI"; demote BAS-0005). Wrote and
   completed `docs/plans/cases-oh02o8.completed.md`: ledger
   `writing/basilisk/case-ledger.md`, a target-based balance rule, BAS-0005
   moved to `writing/basilisk/set-aside/`.
2. «оставил несколько комментов» → four threads. Operator reversed: BAS-0005
   fits the balance, keep the `noAi` rule («иначе мы слишком усложняем процесс
   принятия решений»); 6 of 8 ledger candidates were Waymo — search goes deep
   from what exists, not wide («ищи новые дела НЕ там, где смотрела предыдущие,
   иначе у нас будет неизбежный rich get richer»); asked to explain a line of
   the reflection, and to keep reflections only in the file. Agent restored
   BAS-0005 and the noAi rule, dropped set-aside/, added "search wide" rules,
   removed the review-comment posting from the skill (423f4b9), replied in all
   threads, five-percent entries via subagent (dc7b192).
3. «оставил комментарии» → agent answered only one (five-percent: «идея судить
   по "кто был таргет" была тоже моя»; fixed 8679928) and wrongly said it was
   the only one.
4. «это не единственный комментарий» → agent found five more (it had filtered
   on `created_at > 09:00`). Handled some; see State.
5. Mid-turn: «ты можешь связаться с сессией
   https://claude.ai/code/session_01QWCAV4AATcgfmXQDhTkk5m и сказать ей, как
   пропустил комментарии?» → the send_message call was stopped by a safety
   classifier (a fragment may have arrived). Then «тогда дай пжст code-block-ом
   сообщение для неё. она занимается тем что проверяет почему агенты теряют
   ревью)» → agent gave the message in a code block in chat. Done.
6. Mid-turn, on the agent's reasoning for dropping the card's date ("нового
   поля во фронтматтере, которое нужно только карточке"): «я бы не сказал что
   только карточке». Not yet answered — see Next step.

## 3. Intent

The case-filing flow on PR #104: BAS-0005 (Waymo) filed; a ledger the run reads
first and writes always; a search that goes wide, not deeper into what is filed;
reflections colocated with the cases they reflect on.

## 4. Decisions

- Balance rule: `noAi` count, as before this branch (the target-based rule was
  the operator's idea, then reversed by him; not the agent's bump).
- Ledger lists unfiled candidates only (Rejected / Set aside with revive
  condition); filed cases live on the docket. Runs: ten latest kept.
- Search: no query names what the docket or ledger holds; the docket is known
  before the search as a number/title/description list; dossiers read in full
  only while filing; after a hit, the next query goes elsewhere.
- The reflection lives only in its file.
- `prompter` role (0.9) ported alone from muthur; the rest of the muthur sync is
  a separate `/update-muthur` session, offered and not yet taken.

## 5. Errors and dead ends

- Missed five review comments: filtering review comments by `created_at`
  (time written into the pending review), not by the review's `submitted_at`.
  Use `python3 scripts/export-github-item.py 104` or the reviews list.
- The set-aside directory and target-based rule: built, then reverted.

## 6. State

- Branch `claude/cases-oh02o8`, draft PR
  https://github.com/vzakharov/vovazakharov.com/pull/104, base `main`.
- Plans: `docs/plans/cases-oh02o8.completed.md`, and
  **`docs/plans/cases-oh02o8-review.paused.md`** — the open review round, with
  Done/Left. Head after this relay's commit.
- No PR subscription, no check-ins. `./scripts/vet.sh` not yet run on the branch.
- Estimate: this session 2 h middle developer + 1.5 h senior prompter; the
  remainder handed on ≈ 1.5 h middle developer (colocation, loader filter,
  card date) + 0.5 h senior prompter (skill/rule paths).

## 7. Pointers

- `docs/plans/cases-oh02o8-review.paused.md` — what is left, with comment ids.
- `.claude/skills/file-basilisk-case/SKILL.md`, `writing/basilisk/case-ledger.md`.
- `docs/remove-before-merging/research-log-2026-10-05.md` — the routine run's log.
- `scripts/lib/basilisk-card.ts`, `scripts/lib/last-filed-case.ts`,
  `src/shared/content/{collections,documents}.ts`.
- Transcript: https://claude.ai/code/session_0188wc5zFNmazhw35BEHgjWD

## 8. Next step

Resume `docs/plans/cases-oh02o8-review.paused.md`. First answer the operator's
«я бы не сказал что только карточке» about a filing date: agree, propose a
frontmatter field for it (name, where the site shows it, back-fill from git) and
ask before building it. Then the Left list: GitHub replies, reflection
colocation, five-percent hand-off, PR body and squash refresh, `/polish`.
