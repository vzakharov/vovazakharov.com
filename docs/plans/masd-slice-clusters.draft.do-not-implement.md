> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# The converse of significance by modularity: clusters that earn a slice

The third item of `docs/masd.md` § "Open directions" (the operator: «как бы нам
определять, когда в одном слайсе скопилось что-то (кластер?), что заслуживает
вынесения в модуль?»). `check:masd` tests whether a slice holds up as a module
in its app's file-import graph. This plan adds the opposite test: whether a
slice holds two modules.

## The measure: the same null model, run in the other direction

Split slice `X` into halves `S` and `T`. Under Newman's modularity, the split
changes `Q` by

    ΔQ = 2·a_S·a_T − e_ST

where `e_ST` is the share of the app's edges that run between the halves and `a`
is the share of edge ends on each half. `2·a_S·a_T` is how many cross edges a
degree-preserving rewiring would place between the halves. **The split earns its
keep when the halves are joined by fewer edges than chance would join them.**
This is the same null model `modular()` already uses, so there is still nothing
to tune. (Derived from `e_X − a_X²` with `e_X = e_S + e_T + e_ST` and
`a_X = a_S + a_T`. The spike checks this against the matrix form.)

Two conditions keep that from firing on noise, and neither adds a number:

- **Both halves must be modules by `check:masd`'s own test** (`e − a² > 0`). A
  single file has `e = 0`, so it never qualifies. Without this condition, every
  file reached only through the barrel registers as a "cluster" with ΔQ ≈ 10⁻⁵.
- **Barrels are contracted out of the slice's graph.** A slice's `index*.ts` is
  the door into the slice, not part of its structure. As a node it is a hub that
  pulls the bisection along the barrel axis: with barrels kept,
  `lsa/pages/lsa-home` splits into "index + route | page + i18n", and
  `basilisk/entities/case` splits into `index.ts` against `index.node-safe.ts`.
  An edge from outside through a barrel still counts toward the file it reaches.
  The barrel just takes no side.

The graph is the slice's own app, with tests and scripts left out, exactly as
for `modular()`.

**Search:** greedy bisection. For each file in the slice, start with that file
alone in `S`, then flip files one at a time while ΔQ rises (Kernighan–Lin
style), and keep the best result. The search is deterministic and runs in O(n³)
per slice. The largest slice has 47 files, so it finishes in milliseconds. A
slice holding three clusters reports its best split. The next run, after that
split, finds the remaining one.

## What it finds in the tree today

Spike in `tmp/cluster-spike/spike.ts`, barrels contracted, both halves required
to be modules:

| Slice                          | ΔQ     | Cut                                                                                                                                    | Cross edges       |
| ------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `vova/pages/cv`                | 0.080  | the CV sheet (`cv-sheet`, `cv-section`, `experience-card`, `cv-offer*`, `cv-stack`, …) vs. URLs, variants, route params, locale picker | 9 one way, 1 back |
| `basilisk/entities/case`       | 0.047  | the seal (`case-seal`, `case-slots`, `no-ai-note`) vs. the brief, grade and filing order                                               | 1, one way        |
| `maya/pages/whisper`           | 0.013  | the hush (`hush`, `listening-post`, `whisper-typewriter`) vs. route, metadata, page, lexicon                                           | 1, one way        |
| `blog/pages/documents`         | 0.006  | the collection index page vs. the article page                                                                                         | 0                 |
| `blog/entities/document`       | 0.004  | cards and byline vs. the rendered body                                                                                                 | 0                 |
| `mushrooms/entities/landscape` | 0.0007 | the moon and the voices vs. the rest of the landscape                                                                                  | 0                 |

Most of these read as nouns: a CV sheet, a case's seal, an index page beside an
article page, a document's listing beside its body. That fits the rule this
measure has to respect, `docs/masd.md` § "Cutting a domain into slices": **nouns
draw a cut, and modularity tests whether it holds.** A cut drawn from the graph
alone was rejected once already («червяк -- внутри entity "гриб"…»), so the
measure **nominates** a cut and a person names it or rejects it.

## Approach

1. **`scripts/masd-graph-files.ts`**: the file walk, import resolution, `locate`
   and the per-app edge list move out of `masd-check.ts` unchanged, so both
   scripts build one graph (see § "DRY notes").
2. **`scripts/masd-clusters.ts`, run as `pnpm masd:clusters [<slice>…]`**: for
   each sliced-layer slice (pages included, since a page holding two pages is
   the clearest case), or for the slices named, print the best split that passes
   both conditions:

   ```
   src/vova/pages/cv: two modules, ΔQ 0.080
     ui/cv-sheet.tsx, ui/cv-section.tsx, … (12 files)
     lib/cv-urls.ts, lib/cv-variants.ts, … (7 files)
     10 edges across: 9 from the second into the first; back: lib/cv-urls.ts ← ui/cv-page.tsx
   ```

   The direction line matters. A slice extracted from another may not import
   back up, so the back edges name the files a split would have to move. The
   script exits 0 whatever it finds: it is a report, not a gate (fork 1).

3. **`/five-percent` reads it**: for each slice the diff touches, it runs
   `pnpm masd:clusters <slice>`. A reported split goes in as a candidate for one
   of its (at most three) alternatives, graded optional. This is the step where
   a person sees the nomination at the moment the slice is changing, which is
   when a cut is cheapest.
4. **Tests**: `scripts/masd-clusters.test.ts`, built on `masd-check.test.ts`'s
   throwaway-tree pattern:
   - two disconnected two-file cliques in one slice are reported;
   - one clique is not;
   - a clique plus a barrel-only singleton is not, because a singleton is no
     module;
   - two cliques joined only through `index.ts` are reported, because barrels
     are contracted;
   - back edges are named.

   `masd-check.test.ts` stays green, which shows the extraction in step 1
   changed nothing.

5. **Docs**:
   - `docs/masd.md` § "Significance by modularity" gains a paragraph covering
     the converse: the formula, the two conditions, nominate-not-gate, and the
     table above as the state of the tree when the report landed.
   - The item comes off § "Open directions" ("Four things" becomes "Three").
   - `.claude/rules/masd.md` § "No insignificant slices" gains one pointer
     sentence.

**Out of scope: acting on the findings.** Splitting `vova/pages/cv` or
`blog/pages/documents` is a domain call per slice, and each is a task of its own
if the operator wants it (fork 2).

## Forks

1. **Report or gate?** Recommended: **(a) a report** that `/five-percent` reads,
   as above. (b) A failing check in `check:masd` would force every graph-drawn
   cut, which is exactly what § "Cutting a domain into slices" rejects. It would
   also need an allowlist for the cuts a person declines, which is a suppression
   list under another name. (c) A report with no consumer would go unrun.
2. **The findings themselves.** Recommended: **(a) none in this PR.** The tool
   lands, and the table goes into `masd.md`. (b) Act on the strongest
   (`vova/pages/cv` → a CV-sheet widget or entity, `blog/pages/documents` →
   index and article as two page slices) in the same PR. That turns a
   measurement PR into a restructuring one and doubles review.
3. **Barrels.** Recommended: **(a) contracted**, as above. (b) Kept as nodes:
   simpler, but the spike shows splits along the barrel axis that name no noun.

## DRY notes

- **Shared:** the import graph. `masd-check.ts` today builds its file walk,
  `resolveImport`, `sourceFile`, `locate`/`appOf` and per-app `Edge[]` inline.
  These move to `scripts/masd-graph-files.ts`, and both scripts import it. A
  second copy would drift on the next resolution fix (a new barrel name, a new
  extension).
- **Shared:** the modularity term. `modular()`'s `e − a²` becomes a
  `modularityTerm(files, edges)` that both scripts call. `masd-check` keeps the
  `> 0` comparison; `masd-clusters` uses it for each half.
- **Reused:** `SLICED_LAYERS`, `TEST_FILE` and `PUBLIC_API` (barrel names, for
  contraction) from `eslint/masd-graph.ts`. No new list of barrel names.
- **Not extracted:** the bisection search. It has one caller, and a
  community-detection library would buy Louvain and Leiden, which answer "the
  best partition of the whole app" rather than "does this slice hold two".
- **Not merged into `check:masd`:** one script with a report mode was
  considered. The two have different exit contracts (gate vs. report), and vet
  would then run the bisection for nothing.
