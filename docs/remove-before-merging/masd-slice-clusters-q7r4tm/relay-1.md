# Relay 1 — MASD: clusters inside a slice

## Standing constraints

None stated.

## The conversation

1. **Session opened with `/task`**: "The converse of significance by
   modularity — the third item of docs/masd.md § "Open directions" (the
   operator: «как бы нам определять, когда в одном слайсе скопилось что-то
   (кластер?), что заслуживает вынесения в модуль?»): when a cluster inside
   one slice earns a slice of its own. Read that section, docs/masd.md §
   "Significance by modularity" and scripts/masd-check.ts first. The MASD work
   landed in #169."
   - Agent reply: wrote a draft plan and opened draft PR #228. The plan was a
     Kernighan–Lin bisection per slice, scored by
     `ΔQ = 2·a_S·a_T − e_ST > 0`, with both halves required to pass
     `e − a² > 0` and barrels contracted out of the graph. It was proposed as
     a report (`pnpm masd:clusters`) that `/five-percent` reads, not a gate.
     Three forks were put to the operator, each with a recommendation. The
     agent also offered the muthur sync (#243); do not offer it again.

2. **Operator:** «вообще не думал я что это сразу таском создадут, хотел
   обсудить сначала. > Слайс режется на две половины S и T. эм, а откуда мы
   знаем что в какую половину идёт?»
   - Agent reply: we don't know which file goes where; a greedy search tries
     splits and keeps the best by ΔQ. The agent was honest that this is a
     heuristic and that the graph, not a person, draws the cut. It offered an
     alternative: test only cuts that someone has named.

3. **Operator:** «так.. но у нас же ациклический граф импортов (или может
   стать таким с помощью какого-нибудь мадж), зачем нам пробовать "все по
   порядку" -- узлы дерева мы разве не можем вычислять как-то более
   оптимально?»
   - Agent reply: yes. The candidates are the **dominator tree** of the import
     DAG, which gives one candidate per file and is built in one topological
     pass. The spike `tmp/cluster-spike/dominators.ts` found sensible
     candidates. It also raised four caveats: (1) five slices have cycles;
     (2) only clusters with one door are found; (3) a subtree must not import
     the rest of its slice; (4) the `e − a² > 0` test filters almost nothing,
     so ΔQ against the rest of the slice is the real bar.
     (verbatim in Last agent turn)

4. **Operator:** «2,3,4--поясни попроще пжст / 1--давай первым делом тогда
   установим мадж, уберём ацикличности, и оттуда уже будем смотреть»
   - The relay turn answers this. It rewrote the plan as an elephant: madge
     and an acyclic `src/` come first, and the cluster report comes after,
     still under discussion. It flipped the plan to `paused` with this
     message as the go-ahead. It explained 2, 3 and 4 plainly in chat:
     - **(2) One door.** The method only finds a group of files that the
       rest of the slice enters through a single file. A group used from
       two separate places is not found.
     - **(3) No looking back.** The group may not use files left behind in
       its old slice, because a new slice may only import downward.
     - **(4) The old test is too easy.** Almost every group passes "more
       links inside than chance". The real test is whether cutting the
       group off makes the whole picture tidier than leaving it in.

## Intent

The operator wants a principled way to notice when a slice has grown a cluster
that deserves its own slice. They want to **discuss before building**; they
were surprised `/task` produced a plan and PR at once. They proposed basing
the search on the import graph's acyclic structure. First concrete step, their
call: install madge and remove the import cycles, then look again.

## Decisions

- **Bisection search was dropped for dominator subtrees.** Bisection tries
  splits greedily (2ⁿ space, heuristic); the dominator tree uses the DAG and
  gives one candidate per file, each named by its door file. The operator
  prompted this.
- **Acyclicity first.** madge (`pnpm dlx madge@8.0.0 --circular --extensions
ts,tsx --ts-config tsconfig.json src`) finds 18 cycles: 17 in
  `mushrooms/entities/flower`, `mushrooms/entities/insect`,
  `mushrooms/features/insects-fly`, `mushrooms/pages/mushrooms` and
  `music/features/player`, and 1 in `shell/shared/ui` (`chip-nav` ↔
  `language-return`).
- **Type-only imports count** (plan's lean). The tree reads structure, and a
  cycle through types still means two files that can't be split apart. Raise
  it with the operator if a break gets contorted.
- **Report, not gate**, for the eventual cluster check. This is the lean; the
  operator has not confirmed it.
- **Terms.** A **door** is a file of the slice that something outside imports,
  usually a barrel. A **dominator** of `n` is a file every path from a door to
  `n` passes through.

## Errors and dead ends

- With barrels kept as nodes, bisection split along barrel axes (`lsa-home`:
  "index + route | page + i18n"). With them dropped, files reachable only
  through the barrel showed up as ΔQ ≈ 10⁻⁵ singleton "clusters".
- The dominator spike omitted routers as entries, so in `lsa/pages/lsa-home`
  a page file "dominates" `index.ts`. Wire `sites/*/app/` imports in as
  entries when building it properly.
- `madge --config` does not exist. To skip type-only imports, madge reads a
  `.madgerc` from cwd (`detectiveOptions.ts.skipTypeImports`). That was
  untested, since the plan counts types.

## State

- Branch `claude/masd-slice-clusters-q7r4tm`, head `0002f8c`, pushed.
- Draft PR #228, titled "chore: report clusters inside a slice that earn a
  slice of their own". Its title, body and squash proposal still describe the
  bisection report, so refresh them once bite 1 lands (`/pr`,
  `/squash-message`).
- Plan file: `docs/plans/masd-slice-clusters.paused.md`. It has no draft
  banner, and the go-ahead for bite 1 is quoted in commit `0002f8c`.
- No CI, subscription or check-in is running.
- This session's estimate: 2 h senior architect ("choosing the candidate
  search (bisection vs dominator tree) and where a nominate-not-gate signal
  enters review, against the repo's noun-first cutting rules") + 1 h senior
  developer ("two graph spikes over the real import graph that grounded the
  plan").
- Remainder handed on: 7 h senior developer, for breaking 18 import cycles
  in game and player code without behaviour change, plus a madge gate in vet
  and the dominator-tree report.

## Pointers

- `docs/plans/masd-slice-clusters.paused.md`: the plan, with the bite in
  detail.
- `docs/masd.md` § "Significance by modularity" and § "Open directions";
  `scripts/masd-check.ts` (`modular()`, edge building).
- The spikes in `tmp/cluster-spike/` were not committed, so they are gone in
  a new container. The plan describes them. The dominator construction is:
  topological order, then `idom(n) = LCA of n's importers` in the tree built
  so far, from a virtual root wired to the doors.
- Predecessor transcript:
  https://claude.ai/code/session_01DaohkBf5w6imtQ5DWmHThe

## Next step

go

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Да, можем. В плане я искал не там: раз граф импортов ациклический, кандидаты в слайс — это узлы **дерева доминаторов**, и перебирать ничего не нужно.

**Как это работает.** Файл `d` доминирует над файлом `n`, если любой путь импортов от дверей слайса (того, что импортируют снаружи) до `n` проходит через `d`. Всё, что лежит под `d` в этом дереве, достижимо только через `d`. Получается готовый модуль с одной дверью, и `d` и есть его будущий `index.ts`. Для DAG дерево строится за один проход в топологическом порядке: непосредственный доминатор узла равен общему предку всех его импортёров в уже построенном дереве. Кандидатов столько же, сколько файлов, а не 2ⁿ. ΔQ остаётся, но теперь она оценивает готовых кандидатов, а не служит компасом для поиска.

Я прогнал это на дереве (`tmp/cluster-spike/dominators.ts`), и кандидаты получились осмысленные:
- `vova/pages/cv`: `cv-page` доминирует над 13 файлами, а внутри него `cv-sheet` над 6, то есть кандидаты вложены друг в друга, как ты и сказал, узлы дерева;
- `blog/pages/documents`: `article-page` над 5 (заголовок, оглавление, печатный лист), отдельно `collection-index-page` над 2;
- `vova/pages/home`: `work-section` над карточками проектов;
- `mushrooms/widgets/map`: `map-view` над 6.

Кандидата называет его дверь, и это намного ближе к «существительное рисует разрез», чем безымянные половины S и T.

Что пока не сходится:
1. **Граф не везде ациклический.** В пяти слайсах есть циклы импортов: `mushrooms/entities/flower`, `insect`, `features/insects-fly`, `pages/mushrooms`, `music/features/player`. madge циклы находит, но не убирает. Лечится стандартно: каждый цикл схлопывается в один узел (компоненты сильной связности, алгоритм Тарьяна). Это ещё и честно: файлы, импортирующие друг друга по кругу, всё равно нельзя развести по разным слайсам.
2. **Находятся только кластеры с одной дверью.** Кучка, в которую снаружи заходят через два файла (например, карточки и byline документа, оба отдаются через баррель), поддеревом не будет. Возможно, это даже правильно: у слайса одна дверь.
3. **Одной двери входа мало.** Поддерево ещё должно не импортировать остаток слайса, иначе вынесенный слайс импортировал бы вверх. Это проверяется одним проходом по исходящим рёбрам.
4. **Тест «поддерево — модуль» (`e − a² > 0`) почти ничего не отсеивает**, прототип это показал. Порог должен быть ΔQ против остатка слайса, как в плане.

Предлагаю переписать план так: циклы схлопываются, по полученному графу строится дерево доминаторов, у каждого поддерева проверяются исходящие рёбра и ΔQ, а отчёт показывает лучшие непересекающиеся поддеревья с именем двери. Переписать, или сначала договорим, например про пункт 2?
```
