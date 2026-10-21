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

**Spike findings the rest builds on**: Steiger run per app root counts only that
root's references, wrong in both directions, and run on the parent of several
roots it finds no FSD root at all (Steiger 0.6.0); it skips gitignored paths, so
a spike goes in the scratchpad, run from the repo root so its config resolves.

## Rest of the bite

Slice 3, app scripts in their apps, on `masd/app-scripts` (base: the elephant's
branch).

**Built**, in 9f44f45 and c63e8f4 on the branch (`git log` from 6043dfc): every
file below `git mv`d to its owner, relative imports rewritten, repo-root anchors
deepened (`content-tree`, `print-origin`, `generate-styles`,
`check-mantine-styles`, `check-i18n-payload`, both mushroom scripts),
`letter-basilisk-seal.py` with its own `die` and `SEAL_DIR`, `in-site.sh`'s
`src/*` arm, `vet.sh`, `vet-songs.sh`, and every `package.json` entry —
`content:og:<site>` / `content:pdf:<site>` already name
`src/<site>/scripts/render-{og,pdf}.ts`, which do not exist yet. Nothing has
been run: no lint, typecheck or vet since the move.

**Left, in order:**

1. **The split.** `render-og.ts` sits at `src/kernel/scripts/lib/og-job.ts` and
   `render-pdf.ts` at `src/blog/scripts/lib/print-job.ts`, both still the whole
   scripts importing basilisk, vova and music. Cut them to:
   - kernel `og-job.ts`: chart cards, the avatar-vector site card,
     `renderOgCards(...bundles)` over
     `{ siteCards?, cards?, manifestDirs?, outputNames? }` bundles (a
     `siteCards` replaces the default); `svgCard` and `generatedCard` to
     `og-render.ts`.
   - `src/music/scripts/lib/music-cards.ts`: the collages and their bands, as a
     bundle (`PUBLIC_DIR`, the podcast cover's name).
   - `src/vova/scripts/render-og.ts`: CV cards plus music's bundle;
     `src/basilisk/scripts/render-og.ts`: the generated site card and case cards
     off one `readDocket()`; `src/bible/scripts/render-og.ts`: the core alone.
   - **PDF core in blog, not kernel** (a deviation from the decision below, to
     report): printing documents is blog's, and `PRINT_SOURCES` names shell's
     files. `print-job.ts` keeps everything but the CV, exporting
     `renderPdfs({ documentSources?, printables?, manifestDirs?, onRendered? })`
     plus `printAll`, `sourceFiles`, `PRINT_SOURCES` and `Printable`; vova's
     entry carries the CV printables, `--cv-pages` and the ceiling
     (`pdf-pages.ts` is vova's, `same-render.ts` blog's); basilisk's passes
     `src/basilisk/entities/case` as a document source, which moves it out of
     every other site's hash (one reprint each, from the deploy's cache);
     bible's is the core alone. lsa has no entry, so the render-pdfs action
     (`.github/actions/render-pdfs/action.yml:43`) runs
     `src/<site>/scripts/render-pdf.ts` when it exists and exits otherwise.
2. **The checkers**: the `script` element in `eslint/masd-boundaries.ts`,
   `knip.ts`'s entry, `check:masd` leaving `<app>/scripts` out of its counts —
   then `pnpm exec eslint --fix` on the moved files (import sort) and a
   typecheck.
3. **The references** listed under "Breaks" below, plus
   `.claude/rules/masd.md`'s `index.node-safe.ts` line ("what resolves under
   `scripts/`"), `stack.md`'s `scripts/vet-songs.sh` row and `content.md`'s
   `scripts/render-*.ts` and `lib/*-card.ts` paths; `rg` for each old path. Then
   `content:og:basilisk` re-renders: the lettered seal's comment changed.
4. Full `./scripts/vet.sh`, then `/polish` and `/pr`. `src/<app>/scripts/` (and
   `scripts/lib/` under it) sits beside the app's layers: an unknown folder at
   an app root is no layer to Steiger (checked on `src/basilisk`). Root
   `scripts/` keeps the repo's and the agent's tooling.

**Owners**, from a survey of all 145 files (re-run it to check a call):

- **mushrooms** (45): `build-mushroom-artifact`, `play-mushrooms`,
  `sweep-mushrooms`, `veer-away`; in `lib/` `cdp` (only `play-mushrooms` uses
  it), `flier-watch`, `frame-budget`, `painted-cap`, `mushroom-probe*`,
  `play-*`, `veer-*`.
- **music** (37): `check-masked-words`, `check-song-titles`,
  `check-stanza-repeats`, `list-untold-songs`, `masters`, `scaffold-song`,
  `vet-songs.sh`, `song-intake/` whole; in `lib/` `flac-stream-info`, `music-*`,
  `scaffold-repository`, `song-tag*`, `song-tagging`, `stanza-repeats`.
- **basilisk** (8): `letter-basilisk-seal.py`, `pick-reflections`; `lib/`
  `basilisk-card`, `docket`, `read-docket`, `reflection-pick`.
- **vova**: `lib/cv-card`, and `render-pdf` with `lib/pdf-pages` and
  `lib/same-render` — see the split below.
- **shell**: `generate-styles`, `check-mantine-styles`.
- **kernel**: `check-i18n-payload`, `check-prose-quotes`, `render-mermaid`;
  `lib/` `argv`, `chromium`, `content-tree`, `og-render`, `print-origin`,
  `public-markdown`, `render-manifest`, `changed-files.sh` — each used by two or
  more apps, none importing above kernel.
- Tests travel with their module.

**Decisions, each a recommendation the operator may overturn:**

- **`render-og` and `render-pdf` split like the sitemap**: a kernel core, and
  each site's leaf app holding its own entry with its cards — vova's CV and
  music collage, basilisk's case cards, bible on the core alone. `render-og`
  imports basilisk's, vova's and music's code at once, which no app inherits
  together; `render-pdf` imports `@/vova/pages/cv/lib/*` yet prints bible's and
  basilisk's PDFs. `content:og:<site>` / `content:pdf:<site>` and
  `.github/actions/render-pdfs/action.yml:43` point at the site's entry.
- **A script enters its own app past the public API, its ancestors only through
  one.** Scripts make ~99 deep imports (the game's into
  `pages/mushrooms/{model,ui/scene}`, music's into `pages/music/lib`) against
  ~18 through a barrel; forcing barrels now churns slices 5 and 6 are about to
  restructure. This narrows the plan's "through their public APIs" to ancestors.
- **A script is not a consumer for significance**: `check:masd` leaves
  `<app>/scripts` out of its reference counts, as Steiger never saw scripts at
  all. Check what that flags (`basilisk/entities/case` relied on
  `basilisk-card`) before landing.
- **App scripts never reach root `scripts/`**: `changed-files.sh` goes to kernel
  (root's `test-changed.sh` sources it there), and `letter-basilisk-seal.py`
  inlines `lib.cli`'s `die`.

**Breaks to fix alongside the move:**

- `eslint/masd-boundaries.ts`: a `script` element (`src/*/scripts`, capturing
  the app) with policies per the decision above; `no-unknown-files` fails every
  moved file until then.
- `scripts/in-site.sh:35` rewrites only `scripts/*` arguments to repo-root
  paths; it needs a `src/*` arm.
- Repo-root depth: `REPO_ROOT` in `lib/content-tree.ts` (used by eight scripts),
  `lib/print-origin.ts`, `generate-styles`, `check-mantine-styles`,
  `check-i18n-payload`, `build-mushroom-artifact` (also its `./src/...` entry
  string), `play-mushrooms`, `vet-songs.sh` (its `cd`, its `source` and its
  `INPUTS` regex), `letter-basilisk-seal.py`'s `SEAL_DIR`.
- `knip.ts` entry `src/*/scripts/*.ts`; `.prettierrc.json`'s `scripts/**/*.md`
  override already has `src/**/*.md` covering `song-intake/CLAUDE.md`.
- References: 19 `package.json` entries; `scripts/vet.sh:83` (`vet-songs.sh`);
  rule `paths:` globs in `content.md`, `songs.md`, `i18n.md` and bodies there
  and in `stack.md`; `subtitles/SKILL.md:70`,
  `megabeast/notes/play-run-and-frames.md:27-28`; comments in `knip.ts`,
  `tsconfig.json` and a dozen `src/` files — `rg 'scripts/(lib/)?<name>'` finds
  them.

## Rest of the elephant

In this order: the scripts move before music and the game are restructured, so
those slices carry their own tools along.

- **4. Inverted message catalogue.** `kernel/shared/i18n` still holds every
  app's strings, so a kernel module knows all of its consumers — the inversion
  slice 1 did for schemas, left undone for messages. Each app owns its namespace
  of the catalogue, a site loads those of the apps it mounts, and
  `scripts/check-i18n-payload.ts` follows.
- **5. Music as an app.** `music-route.tsx`, which decides whether a URL shows
  an album, an artist, a song or the radio, becomes music's app layer, and those
  four become real pages under `music/pages/`. Which entities they share is
  decided by ordinary FSD once the pages exist. #82 and #86 touch music routing
  and are left as they are.
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
  its wiring into `scripts/masd-check.ts`, and then the game restructured.

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
- **Not extracted:** a `masd` package or a Steiger plugin. A plugin's rule sees
  one root, which is the problem; a package earns nothing a script and one data
  file do not already give.
