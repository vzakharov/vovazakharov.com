# Multi-App Sliced Design (MASD)

Multi-App Sliced Design extends [Feature-Sliced Design](https://feature-sliced.design/)
from one tree to many. `src/` is a set of apps, each an FSD tree of its own
(`src/<app>/<layer>/<slice>/`), composed along a graph declared as data. Five
sites build from that one `src/`, and each site's `sites/<site>/app/` is a
Next.js router that only says which app is shown at which URL.

This document is the reference for the idea as this repo built it: the model,
the decisions that shaped it and the alternatives they beat, and the checkers
that hold it. The rules an agent follows while editing `src/` live in
[`.claude/rules/masd.md`](../.claude/rules/masd.md), which stays their home;
where this document would restate them, it points there instead.

## The model

**Composition, not dependency: an app that extends `blog` _is_ `blog`.** Its FSD
tree is its ancestors' layers overlaid, plus its own. So:

- An import may target **the same app or an ancestor**, and only a **strictly
  lower layer** — or, inside the same app, its own slice. The same layer across
  apps is a sideways import, forbidden exactly as between two slices of one app;
  so is any import between apps neither of which is the other's ancestor.
- Entry across apps is through the **slice's public API**, as in plain FSD.
  There is no app-level barrel: path-based checkers would lose the layer axis
  behind it, and one barrel per app cannot hold the `server-only` / `node-safe`
  split.
- **An app may have several parents.** `vova` has three, all descending from
  `kernel`, so it closes a diamond. A diamond is harmless — inheriting is only
  the right to import, nothing overrides anything — and two ancestors may hold
  slices of the same name, the importer renaming each where it needs both.
- **An app with no ancestors is plain FSD**, so every FSD project is a one-app
  MASD project.

### The graph is data

`src/masd.json` maps each app to its parents:

```json
{
  "kernel": [],
  "shell": ["kernel"],
  "blog": ["shell"],
  "music": ["blog"],
  "lsa": ["blog"],
  "bible": ["blog"],
  "basilisk": ["blog"],
  "maya": ["blog"],
  "mushrooms": ["kernel"],
  "vova": ["blog", "music", "mushrooms"]
}
```

| App                                | What it is                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `kernel`                           | The bare document every site renders, config, i18n, SEO, the sitemap factory; imports nothing above it |
| `shell`                            | What every site but the game draws on: fonts, Mantine, theme, shared UI, the site footer               |
| `blog`                             | Collections of documents: the content pipeline, document pages, feeds                                  |
| `music`                            | The music catalogue, its player and its pages                                                          |
| `lsa`, `bible`, `basilisk`, `maya` | One site each                                                                                          |
| `mushrooms`                        | The meadow game, on kernel alone                                                                       |
| `vova`                             | vovazakharov.com, which _is_ a blog, the music catalogue and the game                                  |

**A parent is declared above its child, and that is the acyclicity check.** A
cycle needs some app whose parent comes after it, which the order forbids, so
one pass from the top settles it. JavaScript keeps the insertion order of
non-numeric string keys, so the loader reads the order off the parsed object and
fails naming both apps when a parent comes late. The order guarantees
acyclicity, not permission: `lsa` sits below `music` and still may not import
it.

**An abstract app is earned the way a slice is.** An app with exactly one child
and nothing of its own mounted by a router is insignificant. `kernel` (two
children), `shell` (two) and `blog` (five) pass; a `game` app between `kernel`
and `mushrooms` waits for a second game.

### Routers and app layers

**A router only says what is shown at which URL.** On vovazakharov.com, `/` and
`/cv` go to vova, `/music/...` to music, `/mushrooms` to mushrooms, and the
router decides nothing else: its files re-export what they render.

**A site's sitemap is its leaf app's**, because the leaf app inherits every app
the site mounts. vova is vovazakharov.com, so its parents are blog, music and
mushrooms, and its app layer gathers the CV's and the music catalogue's routes
and hands them down to blog's and kernel's sitemap factories. That inversion is
what lets kernel import no app above it: lower apps expose factories and
registries that take what names a collection from outside, and the leaf fills
them in.

**Every app layer lives under `src/`**, not beside the routers, which several
sites would otherwise share. Root layouts compose rather than copy: shell's
wraps kernel's, adding to `<html>` and `<head>`, and a site needing two root
layouts splits its router into route groups — vovazakharov.com's `(shell)` for
every page but the game, `(game)/mushrooms` on kernel's bare layout.

The rest — layers, the four public-API barrels and their runtime axes, where a
shared block drops to, `shared/lib`, scripts, and the Next.js traps — is in
[`.claude/rules/masd.md`](../.claude/rules/masd.md).

## The checkers

Three checkers hold the model, all run by `./scripts/vet.sh`, and all read the
graph through one loader, `eslint/masd-graph.ts`.

| Checker                                                  | Holds                                                                                                     |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `eslint-plugin-boundaries` (`eslint/masd-boundaries.ts`) | Every import, across apps included; its config is generated from the graph                                |
| Steiger (`pnpm lint:fsd`, `scripts/lint-fsd.ts`)         | FSD's own rules, one run per app root, `insignificant-slice` off                                          |
| `pnpm check:masd` (`scripts/masd-check.ts`)              | The graph (order, apps vs. directories, insignificant apps) and slice significance across the composition |

### Why significance needed a checker of its own

Steiger run per app root counts only that root's references, which is wrong in
both directions: a kernel slice used once in kernel and twice in descendants
looks insignificant, and one used by a single descendant looks fine from the
descendant. Run on the parent of several roots, it finds no FSD root at all. The
rule's whole input is one root's reference map and the defect is that input, so
`check:masd` reimplements the rule rather than wrapping it, counting references
across the slice's own app, every descendant and the routers, tests left out.
Its messages are Steiger's word for word, so a reader of either recognises the
other.

### Significance by modularity

Counting consumers alone would keep a one-page app a single slice, since every
lower slice it cuts out has one consumer. So **one consumer is enough for a
slice that is a module**: its term of Newman's modularity, `e − a²`, is
positive, where `e` is the share of its app's file-import edges with both ends
in the slice and `a` the share of edge ends on it, so `a²` is what a rewiring
keeping every file's degree would put inside. Nothing is tuned; the null model
is the bar (the operator, of an API-width threshold of one third it replaced:
«а почему треть, а не четверть»). Two consumers or more are significant by
definition, since a block two slices share drops a layer anyway.

**The graph is the slice's own app alone**, tests and scripts out (the
operator: «если мы написали приложение, мы не можем чисто формально знать, кто
им будет пользоваться, и разбивать на модули исходя из того, кто и как им будет
потом пользоваться, странно»). Counting the app with its descendants agreed on
every real slice, but admitted a slice of ten random scene files, the
descendants' unrelated edges lowering every slice's bar.

A simpler measure was tried first and rejected: boundary-versus-internal import
edges cannot tell a module from a grab bag, because a well-layered slice imports
downward and so its edges leave it.

## Cutting a domain into slices

The meadow game was the stress test: one large page cut into entities, features
and widgets. What it settled holds for any domain.

- **Nouns draw a cut; modularity tests whether it holds.** A cut drawn from the
  import graph passed every checker and was rejected as a domain cut: «червяк --
  внутри entity "гриб", при этом в pages/mushroom/ui/scene есть …
  house-worm.ts». It reproduced how the code was stitched — `draw-house` painted
  the mice and the worm — so it found the mushroom, the house, the mice and the
  worm one module, true of the code and false of the nouns.
- **Base entities never import one another; where two meet is a feature named
  for what happens** («цветок вырастает, когда нажимаем на травку» = фича). Two
  features that would import each other are one: «если вдруг фичам надобиться
  импортить друг друга, то их суём в одну фичу … собственно это и есть критерий
  "код общий"».
- **A part belongs to the noun it is part of.** The house is part of the
  mushroom. The worm and the mice are entities taking windows and doors as
  parameters; «червяк выглядывает из окна» and «мыши бегают между дверями» are
  features.
- **The whole is built from its parts, above them.** A part declares the slice
  of state it reads as a structural `With…` type over entity types and is
  generic in the rest (`sown<M extends WithMushrooms & Spored>(meadow: M): M`),
  so nothing below the page imports `Meadow`. A noun's own data and life go to
  its entity, an encounter to a feature declaring its slice.
- **Nothing goes into `shared` to quiet a checker**: «нужно было его совать
  прямо туда где его используют … а иначе что это за лайфхак такой». `shared`
  keeps what is about nothing in particular.
- **A slice whose one consumer would hold nothing else is that consumer.** The
  meadow passed the modularity bar as a widget, but the page then held only its
  React shell: «какой смысл ему быть в widget-е, который используется только в
  одном месте, и ничто кроме которого в этом единственном месте, где он
  используется, не используется» — so it is the page's.
- **A block that reads a feature is a widget**; reading none, it is a feature:
  «вот карту как раз сделать виджетом или, если она не грузит фич, собственно
  фичей».
- **A test sits where the screens it checks are laid out.** A test checking a
  lower module on the screens a page lays out sits in the page («не в виджет, а
  в страницу»), and reads what no barrel hands on through the slice's
  `index.test-only.ts`, which only a test may take («сделать специальный баррель
  для тестов»). Rejected: letting tests reach internals (the checkers would stop
  saying what a test reads), and widening the public APIs with names nothing in
  production reads.

## DRY notes

- **One graph, four readers.** `eslint/masd-graph.ts` is the only loader of
  `masd.json`; the boundaries config, the import sort, `lint:fsd`'s per-app runs
  and `masd-check.ts` all go through it, so no reader restates an ancestor list
  or an app name. `PUBLIC_API` and the layer lists live there too, because
  `check:masd` runs under bare Node and cannot load the ESLint config; the
  import sort reads `LAYERS` reversed rather than keeping a list of its own.
- **Root layouts compose rather than copy.** shell's layout renders kernel's,
  adding through its `htmlProps` and `head`; the mushrooms layout is kernel's as
  it stands. No layout restates the document.
- **One address registry.** `MUSIC_ROUTE` sits with `COLLECTIONS` and
  `collectionRoute` in blog's `shared/content` instead of a second map of mount
  points; the router's folders and these constants still agree by hand (#86).
- **Higher apps wrap lower factories rather than copying them.** blog's
  `sitemap`, `constructMetadata` and `rootMetadata` each hand kernel's what the
  collections add, so the URL, metadata and card logic stays in one place.
- **One render core per kind.** kernel's `og-job.ts` and blog's `print-job.ts`
  run the whole job; a site's entry passes only what is its own, and
  `ManifestRoots` in `render-manifest.ts` is the one declaration of the roots
  both walk.
- **Cut, not written.** Modules split out of a larger one (`track.ts`,
  `author.ts`) are lifted out and imported back. Neither catalogue barrel
  re-exports the other, or `index.ts` would carry every node-safe name to server
  importers that already have the leaf's own barrel.
- **A part's types live with the part that reads them.** The map declares
  `MapLayout`, `WithMap` and `DoorSeating` and the page imports them, rather
  than the map importing the page's `MeadowLayout`.
- **A script reads the barrel the layers do.** Where a script needed a name, the
  slice's existing `index.node-safe.ts` gained it rather than a scripts-only
  barrel appearing beside it, so a name has one public entry per bundler axis.
- **Not extracted: a `masd` package or a Steiger plugin.** A plugin's rule sees
  one root, which is the problem; a package earns nothing a script and one data
  file do not already give.

## Open directions

Four things the operator set aside to take up, each in a session of its own.

- **The plays cut down.** The game's scripted plays were sharded across vet's
  runners (`VET_MEADOW=1`). The first sharded run (40453462582) played 22 of 30
  groups red, and the same wiring on the game's pre-MASD base (40454592494,
  branch `baseline/6b-game-play`, never merged) the same 22 with the same
  messages, so the failures predate MASD. The operator checked the game by hand,
  found it fine, and had the plays' jobs commented out in `vet.yml`: «пока
  закомменть это, я думаю мы все равно сильно-сильно все эти прогоны резать
  будем, кажется, необходимость в них отпала после того как игру уже написали».
- **Sub-entities** (the operator: «очень уж чешется вариант с "подсущностями"
  (надо только имя получше подобрать: абстракции? зародыши? кирпичики/parts?),
  но наверное не сейчас уже»): a facet several entities share — the occupant is
  the first — as a named kind of slice of its own rather than a file in
  `shared/world`.
- **The converse of significance by modularity** (the operator: «как бы нам
  определять, когда в одном слайсе скопилось что-то (кластер?), что заслуживает
  вынесения в модуль? но отложим»): when a cluster inside one slice earns a
  slice of its own.
- **A poison check** (the operator: «проверку на яд добавим четвёртым Later на
  после мерджа»): `boundaries` judges one import at a time, so nothing holds the
  barrels' runtime axes transitively — a `'use client'` file reaching
  `index.no-browser.ts` or `server-only`, or a script without the
  `react-server` condition reaching `server-only`. `playgramai/playgramapp`'s
  `scripts/poison-check.ts` (madge's graph, `'use client'` and harness roots,
  type-only imports dropped) is the model to port, its roots this repo's
  `src/*/scripts/` and root `scripts/`, wired into `vet`.
