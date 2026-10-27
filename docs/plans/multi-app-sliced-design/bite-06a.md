# Slice 6a — significance by modularity (#216)

Slice 6a, significance by modularity: `check:masd` and its tests clean, the real
tree passing.

- **A one-reference slice is significant when it is a module**: its term of
  Newman's modularity, `e − a²`, is positive — `e` the share of its app's
  file-import edges with both ends in it, `a` the share of edge ends on it, so
  `a²` is what a rewiring keeping every file's degree would put inside. Nothing
  is tuned; the null model is the bar (the operator, of the API-width third it
  replaced: «а почему треть, а не четверть»). Two consumers or more stay
  significant by definition, since a block two slices share drops a layer; none
  is flagged.
- **The graph is the slice's own app alone**, tests and scripts out (the
  operator: «если мы написали приложение, мы не можем чисто формально знать, кто
  им будет пользоваться, и разбивать на модули исходя из того, кто и как им
  будет потом пользоваться, странно»). The rejected alternative, the app with
  its descendants, agreed on every real slice and every slice of the game's
  dry-run tree, but admitted ten random scene files, its unrelated edges
  lowering every slice's bar; the measurement is `modularity-two-graphs.md`
  beside the dry-run tree. On that tree the map scores ×13 its chance, flower
  and meadow ×8, insect ×5, mushroom ×4.5; a one-file slice 0.
- **`PUBLIC_API` lives in `masd-graph.ts`**, read by the boundaries config and
  by `check:masd`, which runs under bare Node and cannot load the config.
- **Where the game's page sits stays open** (operator: «пока не трогаем»).
