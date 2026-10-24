# Multi-App Sliced Design (MASD)

`src/` stops being one FSD tree and becomes a set of apps, each an FSD tree of
its own, composed along a declared graph. The design was settled in the session
that wrote this plan; this file is what it settled and how the work is carved.

**This file outlives the merge.** The operator asked for it to be kept under
`docs/` as the reference for taking MASD outside the repo (a site of its own,
say): «его давай сохраним после мерджа где-то в docs, будем к нему возвращаться
если вдруг захотим продвигать тему вовне». So `/finalize` moves it to
`docs/masd.md` rather than sweeping it, the elephant's own sections dropped.

## How this elephant is eaten

PR #169 is the whole of MASD: it closes #170 and #171, and lands every slice
below on `main` in one merge. The slices are bites of it, not tickets of their
own. This loop is being dogfooded here, and moves to muthur if it holds up.

- **Slice 1 is built on the elephant's branch,
  `claude/multi-app-sliced-design-7bn3oq`.** Every later bite is a PR of its own
  whose base is that branch, so its commits and review threads stay off #169.
- **A bite starts only once every review thread on the previous bite's PR is
  resolved** — slice 1's on #169 itself. `/handle` attaches to one branch, so a
  bite opened over unresolved threads leaves them with no session to answer
  them.
- **A bite's PR carries its own edits to this file**: it folds itself into
  `## Eaten so far` and takes itself out of `## Rest of the elephant`, so the
  elephant's branch holds the current contract once the bite is merged into it.
- **`compare/fsd-vs-masd` follows every change to `.claude/rules/masd.md`.** The
  branch is `main` plus commits that each replace `.claude/rules/fsd.md`'s text
  with `masd.md`'s as it then stood, so GitHub shows the change against the
  retired `fsd.md` as one file's diff and its history as `masd.md`'s. A commit
  that edits `masd.md` is followed by one there, never force-pushed over.

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
children), `shell` (2) and `blog` (4) pass; a `game` between `kernel` and
`mushrooms` waits for a second game.

**A router only says what is shown at which URL.** `sites/<domain>/app/` maps
addresses to apps — on vovazakharov.com, `/` and `/cv` to vova, `/music/...` to
music, `/mushrooms` to mushrooms — and decides nothing else. **A site's sitemap
is its leaf app's**, which inherits every app the site mounts: vova is
vovazakharov.com, so its parents are blog, music and mushrooms, and its app
layer gathers the CV's and the music catalogue's routes; the router re-exports
it.

## Eaten so far

Slice 1, the MASD core: vet clean with `VET_MEADOW=1` but for the staged
CLAUDE.md's `fsd.md` citation, and every site looked at under the split layouts.

- **The graph** — `src/masd.json`, loaded only by `eslint/masd-graph.ts` (the
  schema, the order check, ancestors and descendants, insignificant apps,
  directory mismatches), tested on invented graphs with several parents and a
  diamond.
- **The tree** — the code moved into the nine apps, one `git mv` commit per app.
  kernel holds `shared/{config,content,i18n,lib,seo,typings}`, `MUSIC_ROUTE`
  among content's addresses, and in its app layer the bare document every site
  renders (`<html>`, metadata, analytics) and the sitemap and feed factories.
  shell holds what every site but the game draws on: `shared/ui`, the
  stylesheets and theme provider, a root layout adding the fonts, Mantine,
  `ColorSchemeScript`, the script picker and `ThemeCorner` to kernel's,
  `features/switch-theme` and `widgets/site-footer`. blog holds
  `entities/document` and `pages/documents`, with `ArticleSlots` in
  `shared/article-slots`; basilisk holds `entities/case` (and `CASE_SLOTS`),
  `pages/basilisk-home` and `shared/content`; bible, lsa and vova hold their
  pages, vova an app layer with the `global-not-found` page; music holds
  `pages/music` as it stood and `shared/catalogue`; mushrooms `pages/mushrooms`
  as it stood.
- **The registries** — the schema registry inverted: `articleCollection(id)` in
  kernel, `SONGS` in music's catalogue, `CASES` behind basilisk's
  `shared/content`; addresses stay kernel's. kernel imports no app above it:
  each site's leaf app calls `sitemap(mountedRoutes)` — vova with the CV's and
  music catalogue's routes, the rest with none — and the router re-exports it;
  `collectionFeed(collection, locale, source?)` takes a `FeedSource` (music
  exports `SONG_FEED`).
- **Two root layouts on vovazakharov.com** — `(shell)` for every page but the
  game, `(game)/mushrooms` on kernel's; `experimental.globalNotFound` on every
  site. A fresh meadow opens in full day, whatever the colour scheme, and the
  `dark` play in `scripts/play-mushrooms.ts` asserts it.
- **The checkers** — `eslint/masd-boundaries.ts` generates the boundaries config
  from the graph (folder patterns with `partialMatch`; `app` and `shared`
  overlay their ancestors' as one unit, sliced layers go strictly down);
  `pnpm lint:fsd` runs Steiger once per app with `insignificant-slice` off;
  `pnpm check:masd` (`scripts/masd-check.ts`, in `vet.sh`) checks the graph and
  counts slice references across the composition. Imports sort one group per app
  in graph order, the layers in order within each.
- **The conventions** — `.claude/rules/masd.md`, `fsd.retired.md` as the
  tombstone, citations repointed, CLAUDE.md's layout in its staged copy (the
  live CLAUDE.md cites `fsd.md` until `/finalize` swaps it in, so
  `check-skill-catalog` fails until then).

Slice 2, sites out of `apps/`: vet clean but for the same citation, every site
built.

- **`sites/<site>/`** holds each router, `public/`, Next config and tsconfig,
  with `sites/site-next-config.ts` beside them, so "app" names only an app under
  `src/`.
- **A site keeps its short id** (`vova`, `lsa`, `bible`, `basilisk`) in the
  directory, `NEXT_PUBLIC_SITE`, the squash scope and every `pnpm` entry — a
  domain in each of those spent characters on every command for nothing, so it
  stays where it was, once, in the site's `url`.

Slice 3, app scripts in their apps: vet clean.

- **Each app's tooling is `src/<app>/scripts/`**, beside its layers: 104 files
  moved to their owners (mushrooms 45, music 37, basilisk 8, the rest kernel,
  shell, blog and vova), root `scripts/` keeping the repo's and the agent's.
- **`render-og` and `render-pdf` split like the sitemap.** kernel's `og-job.ts`
  renders chart cards and the site card from its mark and takes `OgBundle`s;
  each printing site has `src/<site>/scripts/render-{og,pdf}.ts` — vova the CV
  and music's collage bundle, basilisk its generated site card and case cards,
  bible the cores alone. The PDF core is blog's `print-job.ts`, not kernel's as
  first recommended: printing documents is blog's and `PRINT_SOURCES` names
  shell's files. basilisk passes its case UI as a document source, which moves
  it out of the other sites' hashes; lsa has no entry and the render-pdfs action
  skips a site without one.
- **The checkers**: a `script` element in `eslint/masd-boundaries.ts` — its own
  app's and its ancestors' scripts directly, every layer, its own app's
  included, through a public API (the operator overturned the recommended
  own-app exception: «ну нет, кажется что это не кошерно… можно пока заигнорить
  эти ошибки значит, но потом отыгнорить и починить»). The 56 script files that
  already reach past one are grandfathered in a scoped `boundaries/dependencies`
  override in `eslint.config.ts`, grouped by app. `shared/content`'s node-safe
  barrel grew the registry's paths and `contentHash`, and i18n's barrel
  `inLocale`; `check:masd` counts no script as a reference (nothing it flagged);
  knip enters `src/*/scripts/*.ts`.

Slice 4, the message catalogue inverted: vet clean, every site built.

- **Each app owns its catalogue** —
  `src/<app>/shared/i18n/messages/{en,ru}.json` behind a loader built with
  kernel's `catalogue()`, whose typing against `en` keeps the two files in sync,
  exported in every app as `messages` (typed `Messages`), an importer needing
  two renaming one: shell's (`toggleTheme`, `backToHome`), music's (what was the
  `music` namespace), vova's (`notFound`, `cv`, `cvVariants`). kernel keeps
  locales, routing, the request config and `MESSAGE_MARKDOWN`.
- **A page loads only the catalogues of the apps it renders**, by import.
  `getTranslations` is gone: the request config carries no messages and
  `next-intl.d.ts` registers the locale alone, next-intl's `Messages` being one
  global type that could check a single site's catalogue at most.
- **A feed's description is its source's** — `FeedSource.description`, which
  `SONG_FEED` supplies, else the site's tagline — so `Feed` carries none and
  kernel names no app's strings.

**Spike findings the rest builds on**: Steiger run per app root counts only that
root's references, wrong in both directions, and run on the parent of several
roots it finds no FSD root at all (Steiger 0.6.0); it skips gitignored paths, so
a spike goes in the scratchpad, run from the repo root so its config resolves.

## This bite

**5a. The catalogue's model out of the page.** Slice 5 as written is some 110
files, a 580-line stylesheet every layer shares, and a dozen layer calls, so it
is eaten bottom-up in three bites; this one moves what the pages and the scripts
both read, and leaves `pages/music` one slice.

- **The model joins `music/shared/catalogue`**: `album-tracks`, `albums`,
  `artists`, `catalogue`, `catalogue-files`, `catalogue-text`, `lyric-inline`,
  `lyric-notes`, `master-url`, `music-urls`, `pictures`, `projects`,
  `release-kind`, `sections`, `song-files`, `song-names`, `song-text`, `songs`,
  `tag-manifest`, `transliteration` and `written-guard`, their tests with them —
  the set `pages/music/lib` holds that imports nothing else of the page. It is
  build-time data access, the precedent being kernel's `shared/content`, which
  `masd.md` already files as a shared segment rather than an entity; splitting
  it into `song`, `album` and `artist` entities would need `@x` imports between
  all three, since an album's tracks are songs and a song's billing its artists.
- **`track.ts` joins it, cut from `player-state.ts`**: the track's shape
  (`PlayerTrack`, `Billing`, `Streamed`, `SpelledLink`, `WithTrack(s)` and their
  helpers) is what `songs.ts` builds, so it goes with the model; the reducer and
  the play order stay with the player.
- **Which barrel**: a `server-only` module exports through `index.ts`, any other
  through `index.node-safe.ts`, its relative imports spelling `.ts`, so a client
  component and a script without the `react-server` condition can take it.
  `pages/music/index.node-safe.ts` goes, `sections` being the catalogue's now.
  Inside the segment, modules import each other by leaf, never through a barrel.
- **Music's scripts enter through those barrels** and leave the grandfathered
  block in `eslint.config.ts`, except where a script reads `catalogue-names.ts`
  (`scaffold-song`, `list-untold-songs`): that module reads the filesystem, so
  it cannot sit behind a barrel client components import, and the two stay
  listed until slice 7 settles it.
- **Citations** of `pages/music/lib/` in rules and docs follow the files.

**DRY notes**: the move adds no code. `track.ts` is the one new module, cut
rather than written, and `player-state.ts` imports it. The two barrels list
overlapping names where a name serves both kinds of consumer, as kernel's
`shared/content` does, rather than one re-exporting the other: `index.ts`
re-exporting the node-safe barrel would hand its whole surface to every server
importer, which is what keeps `index.ts` the majority surface already.

## Rest of the elephant

In this order: the scripts move before music and the game are restructured, so
those slices carry their own tools along.

- **5b. The player and music's app layer.** The player — provider, bar, state,
  hooks and the controls that drive it — becomes a `features/player` slice, and
  `music-route.tsx`, `music-layout.tsx` and `music-route-params.ts` music's app
  layer, which leaves the feature two consumers.
- **5c. Music's pages.** The index, artist, album, song and radio become real
  pages under `music/pages/`, what two of them share dropping to widgets or
  `music/shared/ui` by `masd.md`'s test, and `music.module.scss` split with
  them. #82 and #86 touch music routing and are left as they are.
- **6. What is a page in a one-page app** — a deterministic measure beside
  `insignificant-slice`, then mushrooms restructured under it. The problem:
  mushrooms is a whole game on one URL, some 240 files — scene, creatures, day
  cycle, saves, the UI over the canvas — and FSD names a page by its URL, so it
  is all one `pages/mushrooms` slice. Splitting it the FSD way fails too:
  `entities/creature` or `widgets/meadow` each has exactly one consumer, which
  is what `insignificant-slice` flags, so the rule pushes everything back into a
  grab bag with its own unenforced structure. Any one-page app hits it — Claude
  Code on the web is one page, and nobody would put it in one slice — because a
  reference count cannot tell "used once because it is a detail of its consumer"
  from "used once because the app has one consumer at all". MASD sharpens it: as
  its own app, every slice mushrooms could have is insignificant by
  construction. Candidates to weigh: **boundary vs internal import edges** (a
  slice whose files mostly import each other, reached through a narrow surface,
  is a real module whoever its one consumer is) and **public-API width** (how
  much of a slice its consumers touch, against how much it holds). The
  deliverable is the measure, its threshold argued from this repo's real slices,
  its wiring into `scripts/masd-check.ts`, and then the game restructured —
  mushrooms' scripts entering it through public APIs, their entries leaving the
  grandfathered block.
- **7. The grandfathered script imports, retired.** basilisk's, kernel's,
  shell's and vova's scripts enter their layers through public APIs — a
  `index.node-safe.ts` where a script runs without a bundler — and the
  `boundaries/dependencies` block in `eslint.config.ts` goes, with whatever
  slices 5 and 6 left in it.

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
  `collectionRoute` in kernel instead of a second map of mount points; the
  router's folders and these constants still agree by hand, which #86 is about.
- **One render core per kind.** kernel's `og-job.ts` and blog's `print-job.ts`
  run the whole job; a site's entry passes only what is its own, and
  `ManifestRoots` in `render-manifest.ts` is the one declaration of the roots
  both walk.
- **Not extracted:** a `masd` package or a Steiger plugin. A plugin's rule sees
  one root, which is the problem; a package earns nothing a script and one data
  file do not already give.
