# Clusters inside a slice that earn a slice of their own

The third item of `docs/masd.md` § "Open directions" (the operator: «как бы нам
определять, когда в одном слайсе скопилось что-то (кластер?), что заслуживает
вынесения в модуль?»). Taken as an elephant: the import graph is made acyclic
first, and the cluster report is built on it after.

## Eaten so far

Nothing built yet. In discussion, the search changed:

- **A bisection search was the first plan and was dropped.** It ran a
  Kernighan–Lin greedy split per slice, scored by `ΔQ = 2·a_S·a_T − e_ST`. The
  operator asked why we would try every split when the import graph is acyclic:
  «узлы дерева мы разве не можем вычислять как-то более оптимально?»
- **The candidates are the import DAG's dominator subtrees.** File `d` dominates
  `n` when every import path from the slice's doors to `n` passes through `d`.
  Each subtree is a module with one door, and that door becomes its barrel. This
  gives one candidate per file instead of 2ⁿ, built in one topological pass. The
  spike is `tmp/cluster-spike/dominators.ts` (not committed). Its candidates
  include `cv-sheet` and `cv-page` in `vova/pages/cv`, `article-page` in
  `blog/pages/documents`, `work-section` in `vova/pages/home` and `map-view` in
  `mushrooms/widgets/map`.
- **Five slices are cyclic, so they have no DAG.** madge finds 18 cycles in
  `src/`. Seventeen of them sit inside `mushrooms/entities/flower`,
  `mushrooms/entities/insect`, `mushrooms/features/insects-fly`,
  `mushrooms/pages/mushrooms` and `music/features/player`. One sits in
  `shell/shared/ui` (`chip-nav` ↔ `language-return`). The operator: «давай
  первым делом тогда установим мадж, уберём ацикличности, и оттуда уже будем
  смотреть».
- **Bite 1 — `src/` is acyclic, and stays so.** `pnpm check:cycles` (madge,
  type-only imports counted) runs in vet beside `check:masd`, and `docs/masd.md`
  names it as the fourth checker. madge is a package, so `pnpm install` brings
  it to every runner; no toolchain site changed. Every one of the 18 cycles was
  a type or a hook declared in the wrong file, and each went down to a file of
  its own or to its one reader: `Chip` (`chip.ts`), the flower stand
  (`stand.ts`), the insect's base types and the butterfly's genes (`insect.ts`,
  `butterfly-genes.ts`, the outline reading a butterfly as
  `Bodied & FourWinged`), places to `flight-frame.ts` and legs to
  `flight-timing.ts`, the flier's offer (`offered.ts`), `Alofted`,
  `ControlledScreen`, the player's controls (`player-controls.ts`) and its
  context (`player-context.ts`). No merge and no parameter inversion was needed,
  and no break dropped a type.
- **Bite 2 — `pnpm masd:clusters`, a first cut**, on the operator's «давай
  попробуем _как-нибудь_, а после этого может лучше поймём, нужно ли было
  попробовать по-другому». A report, exit 0, whose tests vet runs. Candidates
  are downward closures — a file and all it reaches in its slice, so they never
  import back — rooted at no door, two files up to 80% of the slice, not whole
  segments, scored by ΔQ on the slice's own graph and kept when positive; per
  slice the best and each next one overlapping none. The resolver is #227's
  `scripts/lib/import-graph.ts`, `masd-check.ts` moved onto it as #227 does,
  `walk` left unexported. First output: 27 of 46 slices flagged. Hits that read
  right: the mushroom's painting (×13), the landscape's backdrop (×16), the
  document's prose body, the article page, home's work section, the player's
  model, play-flowers' instrument. Noise: a page's whole UI tree from its main
  component (mushrooms `control-actions` ×14, maya home), and pairs at ΔQ near
  zero.

## Rest of the elephant

- **Tune the cluster report against what it prints**: a bar above `ΔQ > 0`,
  clusters with two doors (siblings under the slice's one barrel, which no
  single closure covers), whether `/five-percent` reads it, acting on findings
  in later tasks. The `e − a² > 0` test is dropped as a filter: a closure is
  connected by construction, so it nearly always passes.

- **Poison check** (`docs/masd.md` § "Open directions", fourth item) builds on
  the same madge graph, so it gets cheaper once this bite lands. It is not part
  of this plan.

## DRY notes

- **Reused:** madge's own cycle finder. Nothing here re-implements one, and
  `check:masd`'s import resolution is not extended to find cycles, because madge
  already resolves the `@/` alias through `tsconfig.json`.
- **Shared, later:** the cluster report reuses `check:masd`'s per-app edge list
  and its modularity term. Both move to one module when the report is built.
  That is not this bite.
- **Cycle breaks** move a shared declaration to one new home rather than
  duplicating it on both sides of the cycle. A cycle broken by copying a type is
  the failure mode.
