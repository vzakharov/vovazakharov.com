# Multi-App Sliced Design (MASD)

`src/` stops being one FSD tree and becomes a set of apps, each an FSD tree of
its own, composed along a declared graph. The model and every standing decision
are `multi-app-sliced-design/decisions.md`; each bite's contract is a file
beside it, indexed under "Eaten so far".

**This file outlives the merge.** The operator asked for it to be kept under
`docs/` as the reference for taking MASD outside the repo (a site of its own,
say): «его давай сохраним после мерджа где-то в docs, будем к нему возвращаться
если вдруг захотим продвигать тему вовне». So `/finalize` moves it to
`docs/masd.md` rather than sweeping it, with `decisions.md` folded in and the
elephant's own sections dropped.

## Eaten so far

`src/` is ten apps along `src/masd.json` — kernel, shell, blog, music, lsa,
bible, basilisk, maya, mushrooms, vova — each an FSD tree with its own
`scripts/`, message catalogue and registries; kernel imports nothing above it,
and every site's `sites/<site>/app/` is a router only. Every script runs under
`tsx` and enters every layer through a public API, none exempted. Three checkers
hold the model: `boundaries` generated from the graph, Steiger once per app, and
`check:masd` (the graph, and significance counted across the composition, a
one-consumer slice passing when it is a module). Music is cut into its model
(`shared/catalogue`), the player feature, a page per page and the entities and
widgets those share; the game into its nouns, its tests and plays sharded across
vet's runners on request (`VET_MEADOW=1`).

- `bite-01.md` — the MASD core: the graph, the tree in nine apps, the registries
  inverted, two root layouts, the checkers, `masd.md`.
- `bite-01b.md` — collections into blog, kernel's factories taking what names a
  collection from outside (review on #169).
- `bite-02.md` — sites out of `apps/`, into `sites/<site>/`.
- `bite-03.md` — each app's tooling in `src/<app>/scripts/`, `render-og` and
  `render-pdf` split like the sitemap.
- `bite-04.md` — each app owns its message catalogue.
- `bite-05a.md` — music's catalogue model out of the page.
- `bite-05b.md` — the player and music's app layer.
- `bite-05c.md` — music's pages, one slice each (#214).
- `bite-06a.md` — significance by modularity (#216).
- `bite-06b.md` — the game cut by its nouns (#216).
- `bite-07.md` — every script under tsx, through public APIs.

## Rest of the elephant

- **Later, the plays cut down.** The first sharded run (40453462582) played 22
  of 30 groups red, and 6b's base with the same wiring (40454592494, branch
  `baseline/6b-game-play`, never merged) the same 22 with the same messages, so
  they predate MASD; the operator checked the game by hand, found it fine, and
  had the plays' jobs commented out in `vet.yml`: «пока закомменть это, я думаю
  мы все равно сильно-сильно все эти прогоны резать будем, кажется,
  необходимость в них отпала после того как игру уже написали».

- **Later, sub-entities** (the operator: «очень уж чешется вариант с
  "подсущностями" (надо только имя получше подобрать: абстракции? зародыши?
  кирпичики/parts?), но наверное не сейчас уже»): a facet several entities share
  — the occupant is the first — as a named kind of slice of its own rather than
  a file in `shared/world`.
- **Later, the converse of 6a** (the operator: «как бы нам определять, когда в
  одном слайсе скопилось что-то (кластер?), что заслуживает вынесения в модуль?
  но отложим»): when a cluster inside one slice earns a slice of its own.

## How this elephant is eaten

PR #169 is the whole of MASD: it closes #170 and #171, and lands every bite on
`main` in one merge. This loop is being dogfooded here, and moves to muthur if
it holds up.

- **Slice 1 is built on the elephant's branch,
  `claude/multi-app-sliced-design-7bn3oq`.** Every later bite is a PR of its own
  based on that branch, so its commits and review threads stay off #169.
- **A bite starts only once every review thread on the previous bite's PR is
  resolved.** `/handle` attaches to one branch, so a bite opened over unresolved
  threads leaves them with no session to answer them.
- **A bite's PR carries its own edits to this file**: it folds itself into
  "Eaten so far" and takes itself out of "Rest of the elephant".
- **`compare/fsd-vs-masd` follows every change to `.claude/rules/masd.md`.** The
  branch is `main` plus commits that each replace `.claude/rules/fsd.md`'s text
  with `masd.md`'s as it then stood, so GitHub shows the change against the
  retired `fsd.md` as one file's diff. A commit that edits `masd.md` is followed
  by one there, never force-pushed over.

## DRY notes

- **One graph, four readers.** `eslint/masd-graph.ts` is the only loader of
  `masd.json`; the boundaries config, the import sort, `lint:fsd`'s per-app runs
  and `masd-check.ts` all go through it, so no reader restates an ancestor list
  or an app name.
- **The sliced layers are one constant**, `SLICED_LAYERS` in `masd-graph.ts`,
  which `masd-boundaries.ts` and `masd-check.ts` both read. The import sort
  keeps its own list of all six, lowest first, because it is the one reader that
  needs `app` and `shared` among them and the opposite order.
- **The significance check reimplements, not wraps, Steiger's rule**, because
  the rule's whole input is one root's reference map and the defect is that
  input. Its messages are kept word for word so a reader of either recognises
  the other.
- **Root layouts compose rather than copy.** shell's layout renders kernel's,
  adding to `<html>` and `<head>` through its `htmlProps` and `head`; the
  mushrooms layout is kernel's as it stands. No layout restates the document.
- **One address registry.** `MUSIC_ROUTE` sits with `COLLECTIONS` and
  `collectionRoute` in blog's `shared/content` instead of a second map of mount
  points; the router's folders and these constants still agree by hand, which
  #86 is about.
- **blog wraps kernel's factories rather than copying them.** Its `sitemap`,
  `constructMetadata` and `rootMetadata` each hand kernel's what the collections
  add, so the URL, metadata and card logic stays in one place.
- **One render core per kind.** kernel's `og-job.ts` and blog's `print-job.ts`
  run the whole job; a site's entry passes only what is its own, and
  `ManifestRoots` in `render-manifest.ts` is the one declaration of the roots
  both walk.
- **Cut, not written.** `track.ts` and `author.ts` are lifted out of the modules
  that held them, which import them back. Neither catalogue barrel re-exports
  the other: `index.ts` would otherwise carry every node-safe name to server
  importers that have the leaf's own barrel already.
- **A part's types live with the part that reads them.** The map declares
  `MapLayout`, `WithMap` and `DoorSeating` and the page imports them, rather
  than the map importing the page's `MeadowLayout`; the combination it reads of
  the sun is landscape's `SunnedScreen`, not spelled again.
- **A script reads the barrel the layers do.** Where a script needed a name, the
  slice's existing `index.node-safe.ts` gained it rather than a scripts-only
  barrel being added beside it, so a name has one public entry per bundler axis.
- **Not extracted:** a `masd` package or a Steiger plugin. A plugin's rule sees
  one root, which is the problem; a package earns nothing a script and one data
  file do not already give.
