# Relay 1 — unsquatted: a naming runbook, a hundred picks, a drawn ten

## Standing constraints

None stated in this session beyond the repo's own. Carried from the first unsquatted session (vzakharov/life relay-3): «не, для домейнеров точно не хочу ничего» — nothing on the site may serve domain investors; the site never registers or resells names.

## The conversation

1. **Operator:** «давай найдём ещё 90 интересных имён для unsquatted, чтобы было 100. вопрос: ты помнишь, как в прошлый раз собирал, или никаких следов не осталось? там были всякие нюансы вроде того чтобы "не зацикливаться на одной теме" итп / потом сделаем так: показывается сразу 10, и сразу где up for grabs кнопочка рандомизации (можно опять же в виде кубика). специально без пагинации, чтобы было интересно. первоначальный набор -- тоже рандомизирован. при этом в рамках уже рандомизированного набора показываются в порядке убывания крутости»
   - Agent: searched for traces — the repo held only the ten pick files; PR #231 and the first site session (session_01DaohkCDzM8gKuuzTbFgMfD) pointed to `vzakharov/life`, branch `claude/unsquatted-domains-8crv0t`, `docs/remove-before-merging/relay-3.md` + `unsquatted/{ledger.jsonl,check.py,candidates-run*.tsv}`: the breadth («вширь») method, a 121-name ledger.
2. **Operator (mid-turn):** «рутины нет, это я и так скажу»
   - Agent: stopped looking for a routine.
3. **Operator (mid-turn):** «можно её вот сейчас и создать (не рутину а ранбук, рутину я буду запускать через "запусти ранбук")»
   - Agent: folded a runbook into the task. Routed rung 1 → `/task`: plan, then go (Step 3 judged no gate needed); renamed the branch, wrote and published the plan (PR #242), flipped it, built the runbook + `pnpm names`, ran two naming runs (90 picks), built the drawn-ten list, checked it in a dev server, then paused the plan at the context-budget warning and relayed (this file). (verbatim in Last agent turn)

## Intent

unsquatted.com grows from 10 to 100 free `.com` names, found the way the first ten were (breadth across axes, a ledger of everything checked), with the method written as a runbook the operator triggers by saying «запусти ранбук» (a routine will later run that phrase). The list shows a random ten, sorted by score within the draw, with a dice beside "Up for grabs" to draw another ten; no pagination, deliberately.

## Decisions

- **Runbook home: `src/unsquatted/scripts/RUNBOOK.md`**, beside `names.ts` and `ledger.jsonl` — app tooling, not served (beat `sites/unsquatted/public/`, which is crawlable, and a skill, whose description loads every turn).
- **`pnpm names` reuses the page's `checkDomain`** through a new `verdict/index.node-safe.ts`, re-exported from `pages/home/index.server-only.ts` with `PICKED_DOMAINS` and `rollName` (beat porting the life repo's `check.py`).
- **Ledger holds rejections only** (`taken`/`taste`); a pick's record is its file. Taken entries carry `since` (registration year — the page's verdict gives a year, not a date).
- **Hold rule** (operator, PR #231 T02): a listed name found taken gets `shownUntil: today + 14 days`; its file stays.
- **The draw is browser-only**: `useSyncExternalStore` with an empty server snapshot, so the static HTML has no list (no swap flash) and only ten rows run RDAP lookups. A redraw excludes the names on screen while ≥10 others remain.
- **Sequential lookups via a recursive `inTurn`**, since lint forbids both `await` in a loop and `Array#reduce`; command dispatch via a map + type guard (the switch tripped two conflicting rules).
- **At most two picks per axis** in this 90-name batch.

## Errors and dead ends

- `pkill -f 'next dev'` and `pgrep -f … | kill` killed the agent's own shell (exit 144) because the pattern matched its command line; the dev server is gone now (checked with `ps`).
- A first ledger write failed schema (`registered` expected a date, verdict gives a year) — the test row was not written; switched to `since`.

## State

- Branch `claude/unsquatted-hundred-picks-555goo` (renamed from `claude/laughing-fermat-555goo` before the first commit), head 8224dbea pushed.
- PR https://github.com/vzakharov/vovazakharov.com/pull/242, draft; its body and the squash proposal (comment + `docs/remove-before-merging/unsquatted-hundred-picks-555goo/squash-message.md`) were written from the plan and are still a forecast.
- Plan: `docs/plans/unsquatted-hundred-picks.paused.md`, its `## State` lists done and left.
- Nothing running: no subscription, no scheduled check-in. Vet not run (that's `/finalize`).
- Estimate: this session 3 h senior copywriter + 2 h middle analyst + 2.5 h middle developer + 1 h senior prompter. Remainder handed on: `--part 1 middle developer "the quality passes over a three-part diff and a PR body rewritten against what shipped"`.

## Pointers

- `src/unsquatted/scripts/RUNBOOK.md`, `names.ts`, `lib/ledger.ts` (+test), `ledger.jsonl` (402 rows).
- `src/unsquatted/pages/home/page/ui/pick-deck.tsx`, `page/lib/draw.ts` (+test), `page/model/picks.ts` (`score` now shown, `PICKED_DOMAINS`).
- Life-repo trial files: `gh api "repos/vzakharov/life/contents/docs/remove-before-merging/<path>?ref=claude/unsquatted-domains-8crv0t" -H 'Accept: application/vnd.github.raw'`.
- This session's transcript: https://claude.ai/code/session_01DaohkB3kf6vg5HXMRJRhw4

## Next step

Resume the paused plan: `/go` from Step 1 on `docs/plans/unsquatted-hundred-picks.paused.md` — run `/polish` over the branch, flip the plan to `*.completed.md`, then `/pr` (refresh PR #242's body and the squash proposal against the real diff). Then report to the operator.
