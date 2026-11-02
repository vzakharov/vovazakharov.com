# Relay 14 — lookup cut by noun, issue #239 filed, isPublicApi shared; parked

## Standing constraints

None stated.

The muthur sync offer was made; do not make it again.

## The conversation

1. **Operator** (launch): `/relay take claude/masd-slice-clusters-q7r4tm — lookup.ts в unsquatted режется по смыслу на page/ и verdict/, дальше polish и pr; вопрос о механическом критерии ждёт ответа`
   - Agent: cut `lookup.ts` by noun (0ac3f39), `/polish` via subagent
     (dbe3fc6: `meeting` un-exported, knip), `/pr` refresh of the unsquatted
     line in the PR body; squash proposal left as is (it names no unsquatted
     detail).
2. **Operator** (mid-turn): `а verdict, ещё раз, почему у нас стал кластером? потому что он состоит из двух файлов, один из которых импортит другой?`
   - Agent: not two files alone: one door (check-domain reached only via
     use-verdict), ≥2 non-barrel files, and ΔQ > 0 (0.041). On a pair the
     first two hold almost always, so the modularity term does the work.
     Listed two open questions: the declaration criterion and `isBarrel`.
3. **Forwarded from the predecessor** (verified against its transcript, web
   client): `про кластеры на уровне символов -- давай строить отдельно, когда закончим это; давай создавать issue (передай новой сессии)`
   - Agent: filed https://github.com/vzakharov/vovazakharov.com/issues/239,
     to be built after #228.
4. **Operator**: `1- это же к новому issue, какое отношение это тут имеет?` / `2- да, мне казалось я в прошлой сессии на это отвечал`
   - Agent: (verbatim in Last agent turn)

## Intent

Land PR #228 (sub-slices under `check:masd`, the `masd:clusters` gate, an
acyclic `src/`). The declaration-level criterion is out of it, in #239.

## Decisions

- unsquatted home is `page/` + `verdict/`: name → domains in
  `page/lib/rows.ts`, registry answer → verdict in `verdict/lib/verdict.ts`
  (types `Verdict`, `Release` exported from `verdict/index.ts`); `lookup/`
  gone. Tests split the same way.
- `isPublicApi` in `eslint/masd-graph.ts` beside `isTest`, used by
  `masd-clusters.ts`, `sub-slices/tree.ts`, `sub-slices/promotion.ts`
  (e26cd3c) — the operator's «да» to the shared-`isBarrel` question.

## Errors and dead ends

None.

## State

- Branch `claude/masd-slice-clusters-q7r4tm`, draft PR
  https://github.com/vzakharov/vovazakharov.com/pull/228, `MERGEABLE CLEAN`,
  head e26cd3c plus this relay commit.
- Plan `docs/plans/masd-slice-clusters.paused.md`.
- Full vet last green on e909d97; since then only local checks (gates, tests,
  eslint, tsc, unsquatted build, knip). e26cd3c has had no `/polish`.
- Nothing running: no CI, subscription or check-in.
- Estimate: 1.5 h senior developer, all done here; no remainder.

## Pointers

- `src/unsquatted/pages/home/{page/lib/rows.ts,verdict/lib/verdict.ts}`,
  `eslint/masd-graph.ts`, `scripts/masd-clusters.ts`,
  `scripts/lib/sub-slices/`.
- This session's transcript:
  https://claude.ai/code/session_01DaohkETcCiBHgzbxWXgDWt
- Earlier summaries: `relay-13.md`, `relay-12.md`.

## Next step

Wait for the operator. Nothing is open on #228; `/finalize` (which runs
polish and the full vet) when they ask.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Понял: «да» про `isBarrel` — делаю. Ищу третью проверку барреля.

Adding `isPublicApi` beside `isTest` and routing all four call sites through it.

1. Да, к #228 это отношения не имеет. Список с этим пунктом я написал до того, как дошло твоё пересланное сообщение. Когда оно пришло, я завёл #239, так что вопрос закрыт.

2. В записях прошлых сессий ответа не нашлось: в relay-12 и relay-13 пункт числился открытым. Так что этот ответ просто потерялся при передаче. Принял твоё «да» и сделал: в `eslint/masd-graph.ts` теперь есть общий `isPublicApi` рядом с `isTest`. Через него идут `masd-clusters`, проверка дерева под-слайсов и проверка промоушена, вместо трёх разных способов спросить одно и то же (e26cd3c). Чисто прошли тесты `masd-check` и `masd-clusters` (36/36), `masd:clusters`, `check:masd`, knip, eslint и tsc.

По #228 открытых вопросов больше нет. Дальше `/finalize`, когда скажешь: он заодно прогонит полный vet и polish по последним коммитам.
```
