# Relay 1 — poison check

## Standing constraints

None stated by the operator.

## The conversation

1. **Operator** (as `/task`): "A poison check — the fourth item of docs/masd.md
   § "Open directions": hold the barrels' runtime axes transitively (a 'use
   client' file reaching index.no-browser.ts or server-only, a script without
   the react-server condition reaching server-only), porting
   playgramai/playgramapp's scripts/poison-check.ts, its roots this repo's
   src/\*/scripts/ and root scripts/, wired into vet. Read that section and
   .claude/rules/masd.md first. The MASD work landed in #169."

   **Agent**: routed as plan-then-go (Step 1 yes: a live reuse call, madge vs.
   masd-check's own resolver; Step 3 no: the alternatives land close). Wrote the
   plan, opened draft PR #227, flipped the plan, implemented, ran `/polish`, and
   finished `/go`. The final report put one optional `/five-percent` proposal to
   the operator (drop the client half, since `pnpm build` already catches it),
   and recommended keeping that half. It also offered the muthur sync (one
   commit, 03451362) as a new session. A keepalive wake then parked the session.

2. **Operator**: «не знаю, не знаю. madge мы все равно будем ставить для
   убирания ациклических графов, думаю, так или иначе»

   **Agent**: keep our resolver for now. Its point is one resolver shared by
   check:masd and check:poison, not just "no dependency". Decide "whose graph"
   once, when the cycle check arrives, for all three checks. Swapping the poison
   check's edge source to madge is about 30 lines. Offered to add an Open
   directions line about a madge cycle check. No answer yet.

3. **Operator**: «а check:masd перевести на madge -- в общем годная идея? или
   это про другое?»

   **Agent**: it is the same question. Moving check:masd to madge only makes
   sense if madge lands anyway. A cycle check is a DFS over the edges
   `scripts/lib/import-graph.ts` already builds (~20 lines), so madge earns its
   place only for its `.dot` visualisation. If it comes in, move all three onto
   it. Two snags: check:masd counts type-only imports as references while
   check:poison skips them, and the routers live in `sites/*/app/`.
   Recommended building the cycle check on our graph.

4. **Operator**: «можешь поговорить с
   https://claude.ai/code/session_01DaohkFjE5k2mZsypSbXfxP об этом?»

   **Agent**: looked the session up: "(1) MASD: когда кластер в слайсе
   заслуживает своего", branch `claude/masd-slice-clusters-q7r4tm`, task
   summary "8/18 import cycles cut". Its transcript mentions no madge. Sent it a
   message (delivered) laying out the question and our position. The message
   asked how it finds cycles today, whether it plans madge or a vet cycle check,
   and whether building one on `scripts/lib/import-graph.ts` suits it. It asked
   for the reply by send_message to this session. Then the context budget paused
   the session and it relayed. (verbatim in Last agent turn)

## Intent

The poison check itself is done. The live thread is which graph the repo's
import checks share — our resolver or madge — now that a cycle check is
expected, coordinated with the session cutting cycles.

## Decisions

- **The graph comes from `scripts/lib/import-graph.ts`** (masd-check's resolver,
  lifted out), shared by check:masd and check:poison. The argument that stands
  is one resolver, so the checks cannot disagree. "No new dependency" weakens
  if madge lands for cycles.
- **Script roots are entries**: script files no other script imports, plus every
  test. Entries that `package.json` runs under `--conditions=react-server` are
  exempt (`{site}` is expanded over `src/*`). Tests of an exempt entry are still
  roots.
- **Client poison** is `server-only` or any `index.no-browser.ts`. Script
  poison is `server-only` only.
- No `'use server'` boundary (static export). The check is one file.
- **Out of scope**: the node-safe axis's CSS/JSX/asset half, and tests outside
  `scripts/`.

## Errors and dead ends

`fs.globSync` is untyped under `@types/node` 20, so `{site}` is expanded
manually instead.

## State

- **Branch** `poison-check`, all pushed.
- **PR** #227, open, draft.
- **Plan** `docs/plans/poison-check.completed.md`.
- **Squash proposal** posted, tracked at
  `docs/remove-before-merging/poison-check/squash-message.md`.
- `./scripts/vet.sh` not run. That is `/finalize`'s job.
- **Estimate**: 5 h senior developer + 1 h senior architect, all done here,
  nothing handed on.
- **Waiting**: a reply from session_01DaohkFjE5k2mZsypSbXfxP, addressed to the
  predecessor (session_01DaohkBdtkS2FCg9TJAopr7). It lands there, not in the
  successor; see `.claude/skills/relay/after-handoff.md`.

## Pointers

- `scripts/poison-check.ts`, `scripts/poison-check.test.ts`,
  `scripts/lib/import-graph.ts`
- `/five-percent` review:
  https://github.com/vzakharov/vovazakharov.com/pull/227#pullrequestreview-5679974370
- The cycle-cutting session:
  https://claude.ai/code/session_01DaohkFjE5k2mZsypSbXfxP
- Transcript: https://claude.ai/code/session_01DaohkBdtkS2FCg9TJAopr7

## Next step

Wait for the cycle-cutting session's reply, which reaches the predecessor and
is forwarded. Relay it to Vova with a recommendation on the shared graph
source. Still open with Vova:

- whether to take the optional `/five-percent` proposal;
- whether to add the Open directions line about a cycle check.

`/finalize` comes when they ask.

The muthur sync offer was made; do not make it again.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Вова, вопрос тот же самый, только с другой стороны. Сейчас один резолвер на две проверки. Переведём на madge обе, и резолвер снова будет один, только чужой. Так что переводить `check:masd` на madge имеет смысл, только если madge в репо всё равно появится.

А вот нужен ли он для циклов, я не уверен. Циклы ищутся обходом в глубину по тем же рёбрам, которые `scripts/lib/import-graph.ts` уже строит, это строк двадцать. Тогда все три проверки остаются на одном графе и без зависимости.

У madge есть то, чего нет у нас: картинка графа, `.dot`, как `deps-graph` в playgramapp. Если она нужна, это довод за madge. Тогда я бы перевёл на него все три проверки сразу.

При переводе `check:masd` надо следить за двумя вещами:
- **Импорты только типов он считает ссылками на слайс**, и это правильно: слайс, который используют только как тип, всё равно используется. Проверке на яд нужно обратное, такие импорты она пропускает. Значит, madge пришлось бы запускать дважды, с `skipTypeImports` и без, или различать эти импорты самим.
- **Роутеры лежат в `sites/*/app/`, а не в `src/`**, так что madge нужно запускать по обоим деревьям. Алиас `@/` он берёт из корневого `tsconfig.json`, там он прописан, так что это должно работать.

Я бы сделал проверку на циклы на нашем графе. За madge стоит браться, только если понадобится картинка.
```
