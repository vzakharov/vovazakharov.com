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

- **Bite 3 — MARS sub-slices.** The operator: «Steiger отключаем, делаем здесь —
  без этого какой вообще смысл этого пиара?» A sub-slice is any folder in a
  slice or sub-slice not named for one of FSD's five segments (`SEGMENTS` and
  `subSlicePath` in `eslint/masd-graph.ts`); a slice's catalogue moved to
  `config/i18n` on «i18n это же по сути config?». Built: `vova/sub-slice-entry`
  (entry by the sub-slice's barrel, from inside the slice); Steiger's
  `fsd/no-reserved-folder-names` off in the sliced layers
  (`steiger.config.mjs`), `check:masd` flagging a segment's name inside a
  segment instead; `check:masd` failing an insignificant sub-slice (cut ΔQ on
  its parent's graph ≤ 0) and a **promotion** — a consumer taking from a slice
  only one sub-slice's exports — an error, not a warning, on the operator's «ну
  тогда ок, error, и с советом агенту (с разрешением оператора) игнорить то, что
  просто не выносится»: the escape is `// masd-disable promotion -- <why>` in
  the sub-slice's `index.ts`, on the operator's yes. Shared code in
  `scripts/lib/slice-graph.ts` (integer cut gain, which killed the `5.6e-17`
  hit) and `scripts/lib/sub-slices.ts`; `masd:clusters` recurses into
  sub-slices. The first cut, `prose/` in `blog/entities/document`, tripped the
  promotion check at once (music's story took only `ProseContent`), so
  `ProseContent` went to blog's `shared/ui` instead. Promotion reaches any
  depth, on «подподслайс нужно вынести в подслайс и импортировать обеими
  "снаружи"»: a sibling sub-slice taking only one sub-slice of another is told
  to move it up beside its parent. Cuts: blog's documents page split into
  `pages/article` and `pages/collection-index` (four sites route only the
  article, so a sub-slice would have tripped promotion); vova home `work/`; maya
  whisper `typewriter/`; mushroom `fungus/` (the drawn fungus, the house staying
  at the root; Phaser-free files enter it by its node-safe barrel); insects-fly
  `flight/`; player `station/`; blind-test `quiz/`. Docs: both `masd.md`
  describe sub-slices (the rule's copy staged).

- **Review of bite 3** (PR #228, 11 threads, each answered on GitHub). Done:
  #229's `/five-percent` procedure taken whole (22a95ad); `sub-slice-entry`'s
  rule-group line (e42fc65); a slice's catalogue is `config/i18n.ts`, its JSON
  in `config/messages/` (2188bab); `check:masd` reads imports and tallies edges
  through `slice-graph` (`importsOf`, `meeting`; bccb5aa). The operator declined
  restacking on #227 (merged since).
- **Found in review — ΔQ of a two-way cut is symmetric**, so which side is "the
  cluster" is the closure's construction, always the lower one. On a
  chain-shaped slice (door → thin page → the rest) the cut under the page passes
  and leaves a wrapper above it: `blind-test`'s `quiz/`. vova home's `work/`
  leaves four connected files and is a fair cut, but `work-section` imports the
  parent's `ui/read-cv-button`.

- **Bite 4, first half — `masd:clusters` is a gate** (5d8bc13), on «ок»: a
  candidate is a dominator subtree of its unit's import DAG (one door, its
  root), no door or barrel as root, and the rest held to the same bar — at least
  two non-barrel files importing into one piece. Exit 1 while it prints; vet
  runs it (`clusters`); `// masd-disable cluster -- <why>` in the root on the
  operator's yes. `quiz/` reverted on «4- да»: the gate no longer proposes it.
  Flagged units fell from 26 to 6. `STAYS` in `sub-slices.ts` lost a dead
  `export` knip found.

- **Bite 4, second half.** The operator's chat answers are on T01, T06, T08 and
  T10. `docs/masd.md` retired (ecb8bbe): what every edit under `src/` needs went
  to the staged rule (checkers listed without a count, `check:cycles`,
  `masd:clusters`, "Cutting a domain into slices", a `## Sub-slices` section),
  the why of the two checkers to `scripts/masd-check.README.md`, the open
  directions to #232 and #233; nothing else cited it, so no tombstone.
  `check:masd` fails a unit with a segment or module beside a sub-slice, and
  sibling sub-slices in a cycle (fff6245); a folder with no source is no
  sub-slice. **A head** — a sub-slice importing every sibling, directly or not —
  is no promotion when a consumer takes only it (e34b935): with sub-slices
  alone, a router taking a page's component took one sub-slice. Restructured:
  vova home → `page/` + `work/`, the Read CV button in `work/` to break a cycle;
  maya whisper → `page/` + `typewriter/`, the typewriter's strings in a
  catalogue of its own; player → `playback/` + `station/`; insects-fly →
  `flight/` + `perch/`; mushroom → `fungus/` + `house/`. `check:masd`,
  `check:cycles`, typecheck and prettier green; 29 files earlier bites left
  unformatted are formatted. `tmp/restructure.ts` and `tmp/merge-barrel.py` did
  the moves (not committed).
- **The two clean cuts**, ahead of the PR answer. Blog article → `page/` +
  `print/` (0288f17): the print classes in `print-sheet.module.scss`,
  `DOCUMENT_SOURCES` naming the whole `src/blog/pages/article`, `content.md`'s
  footer trap pointing at the new sheet. `mice-run` → `runs/` + `runner/`
  (ebf5879), the feature's three barrels re-exporting `runs/`'s. The gate is
  down to six candidates in six units.
- **The three-way cut**, on the operator's answer in chat: «ну так вынести рамку
  … выносим если любое из: (а) модулярность, (б) нужно двум потребителям», and
  «агент тоже может» on who proposes the cut. `check:masd` earns a sub-slice by
  modularity or by two importing siblings (7f2eb7c); the gate prints what each
  cluster takes from the rest as the sub-slice below both (7f2eb7c, 5f3ece7).
  Cut: map → view/ground/frame (02d6bb3), insects' flight → air/swarm/route
  (1a09838), fungus → figure/dome/body (14d8744), whisper page →
  route/screen/metadata (c7b85d6), playback → controls/bar/context/audio/setting
  (757d3e3; `CONTROL_ON` a module of context's, the station's two hook modules
  `'use client'` so `pnpm build vova` passes — an earlier bite's break). A
  sibling enters a sub's `index.node-safe.ts` only for what Node loads.
  `tmp/restructure.ts` and `tmp/merge-imports.ts` did the moves (not committed).
  The PR comment (issuecomment-6493616445) is answered by this.

- **The CV and the gate's end.** The CV's edition promoted to `vova/entities/cv`
  on «ага» (6f6719b) and the page cut into `sheet/` + `route/`. Steiger's
  `fsd/forbidden-imports` and `fsd/no-segmentless-slices` off in exactly the
  slices holding sub-slices (`slicesWithSubSlices`, imported by
  `steiger.config.mjs`; 569cb6e), on «да, steiger отключать где мы покрыли» —
  `lint:fsd` green. A promotion to a slice lists the layers it may land on, or
  says none is (569cb6e holds the code, ffe6448 the tests). The operator's
  review on the staged rule (bloat, meadow-game archaeology) answered by
  trimming it to what every edit under `src/` needs (54d08b4), both threads
  replied to. The gate's last hit, `cv/sheet`, cut into `page/` (the head),
  `full/`, `profile/` and `frame/` below both (af2dda5): `cv.module.scss` split
  by consumer, `frame` exporting the shared classes as `CV_CLASSES`. The gate
  holds no cluster in 85 units.

- **Landscape's backdrop stays uncut**, as recommended: as a slice it would sit
  beside `landscape` on `entities`, sideways, and the gate no longer prints it.

## Rest of the elephant

- **Promotion's destination** stays a call per case; `check:masd` narrows it to
  the legal layers and picks none.
- **Later (in or outside this PR — tbd): renaming MASD to MARS** across files
  and scripts (`masd.json`, `check:masd`, …). The operator: «посмотрим ближе к
  концу».
- **Tune the cluster report against what it prints**: a bar above `ΔQ > 0`,
  clusters with two doors (siblings under the slice's one barrel, which no
  single closure covers), whether `/five-percent` reads it, acting on findings
  in later tasks. The `e − a² > 0` test is dropped as a filter: a closure is
  connected by construction, so it nearly always passes.

- **Poison check** builds on the same madge graph, so it gets cheaper once this
  bite lands. It is not part of this plan.

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
