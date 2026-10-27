# Standing decisions

## The model

**Composition, not dependency: an app that extends `blog` _is_ `blog`.** Its FSD
tree is its ancestors' layers overlaid, plus its own. So:

- An import may target **the same app or an ancestor**, and only a **strictly
  lower layer** — or, inside the same app, its own slice. The same layer across
  apps is a sideways import, forbidden exactly as between two slices of one app;
  so is any import between apps neither of which is the other's ancestor.
- Entry across apps is through the **slice's public API**, as today. There is no
  app-level barrel: path-based checkers would lose the layer axis behind it, and
  one barrel per app cannot hold the `server-only` / `node-safe` split.
- **An app may have several parents.** Nothing uses that today, and it is
  allowed because "this one is both a blog and a game" is a plausible next app.
  A diamond is harmless — inheriting is only the right to import, nothing
  overrides anything — and two ancestors may hold slices of the same name, the
  importer renaming one where its context needs it.
- An app with no ancestors is plain FSD, so every FSD project is a one-app MASD
  project.

**The graph is data**, `src/masd.json`, each app listing its parents:

```json
{
  "kernel": [],
  "shell": ["kernel"],
  "blog": ["shell"],
  "music": ["blog"],
  "lsa": ["shell"],
  "bible": ["blog"],
  "basilisk": ["blog"],
  "maya": ["blog"],
  "mushrooms": ["kernel"],
  "vova": ["blog", "music", "mushrooms"]
}
```

**A parent is declared above its child, and that is the acyclicity check**: a
cycle needs some app whose parent comes after it, which the order forbids, so
one pass from the top settles it. The order guarantees acyclicity, not
permission — `lsa` sits below `music` and still may not import it. JS keeps the
insertion order of non-numeric string keys, so the loader reads the order off
the parsed object, and fails naming both apps when a parent comes late.

**An abstract app is earned the way a slice is**: an app with exactly one child
and nothing of its own mounted by a router is insignificant. Today `kernel` (2
children), `shell` (2) and `blog` (5) pass; a `game` between `kernel` and
`mushrooms` waits for a second game.

**A router only says what is shown at which URL.** `sites/<domain>/app/` maps
addresses to apps — on vovazakharov.com, `/` and `/cv` to vova, `/music/...` to
music, `/mushrooms` to mushrooms — and decides nothing else. **A site's sitemap
is its leaf app's**, which inherits every app the site mounts: vova is
vovazakharov.com, so its parents are blog, music and mushrooms, and its app
layer gathers the CV's and the music catalogue's routes; the router re-exports
it.

## Spike findings

Steiger run per app root counts only that root's references, wrong in both
directions, and run on the parent of several roots it finds no FSD root at all
(Steiger 0.6.0); it skips gitignored paths, so a spike goes in the scratchpad,
run from the repo root so its config resolves. Measured over the tree,
boundary-vs-internal import edges cannot tell a module from a grab bag — a
well-layered slice imports downward, so its edges leave it.

## Cutting the game (6b)

- **Nouns draw a cut; modularity tests whether it holds.** A cut drawn from the
  import graph (e7a4c9a, reverted in 7fb1f33) passed every checker and was
  rejected as a domain cut: «червяк -- внутри entity "гриб", при этом в
  pages/mushroom/ui/scene есть … house-worm.ts». It reproduced how the code is
  stitched — `draw-house` painted the mice and the worm — so it found the
  mushroom, the house, the mice and the worm one module, true of the code and
  false of the nouns. Its tree is `mushrooms-tree.md` in
  `docs/remove-before-merging/masd/one-page-measure/`, the noun tree that
  replaced it `nouns-tree.md` beside it.
- **Base entities never import one another; where two meet is a feature named
  for what happens** («цветок вырастает, когда нажимаем на травку» = фича). Two
  features that would import each other are one: «если вдруг фичам надобиться
  импортить друг друга, то их суём в одну фичу … собственно это и есть критерий
  "код общий"». Sub-entities wait until feature grouping stops sufficing.
- **The house is part of the mushroom.** The worm and the mice are entities
  taking windows and doors as parameters; «червяк выглядывает из окна» and «мыши
  бегают между дверями» are features.
- **The whole is built from its parts, above them.** A part declares the slice
  of state it reads as a structural `With…` type over entity types and is
  generic in the rest (`sown<M extends WithMushrooms & Spored>(meadow: M): M`),
  so nothing below the page imports `Meadow`. A noun's own data and life go to
  its entity, an encounter to a feature declaring its slice.
- **Nothing goes into `shared` to quiet a checker**: «нужно было его совать
  прямо туда где его используют … а иначе что это за лайфхак такой». `shared`
  keeps what is about nothing in particular.
- **A slice whose one consumer would hold nothing else is that consumer.** The
  meadow passed 6a's bar as a widget, but the page then held only its React
  shell: «какой смысл ему быть в widget-е, который используется только в одном
  месте, и ничто кроме которого в этом единственном месте, где он используется,
  не используется» — so it is the page's.
- **The map is a widget because it reads a feature** (`GrowingStand`); reading
  none, it would be a feature: «вот карту как раз сделать виджетом или, если она
  не грузит фич, собственно фичей».
- **A test that checks a lower module on the screens the page lays out sits in
  the page** («не в виджет, а в страницу»), and reads what no barrel hands on
  through the slice's `index.test-only.ts`, which only a test may take («сделать
  специальный баррель для тестов»). Rejected: letting tests reach internals (the
  checkers would stop saying what a test reads), and widening the public APIs
  with names nothing in production reads.
- **The play runs wait for `/finalize`** («не надо гонять игру на каждом пуке»).
