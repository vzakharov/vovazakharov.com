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

Slice 5a, the catalogue's model out of the page: vet clean, every site built.
Slice 5 is eaten bottom-up in three bites — this one, the player with music's
app layer, then the pages — since as one it was some 110 files, a 580-line
stylesheet every layer shares, and a dozen layer calls.

- **`music/shared/catalogue` holds the model** every music page and script reads
  — songs, albums, artists, their files, texts, pictures and addresses, their
  tests beside them — the precedent being kernel's `shared/content`: it is
  build-time data access, and as `song`, `album` and `artist` entities each
  would need `@x` imports of the others. `pages/music/lib` keeps the player's
  state and hooks, the page metadata, the feed and the route's parse.
- **Two cuts made the set close**: a track's shape (`PlayerTrack`, `Billing`,
  `Streamed`) is `track.ts`, since `songs.ts` builds it, leaving the reducer in
  `player-state.ts`; `SONG_AUTHOR` and `CreditedName` are `author.ts`, so a test
  takes them without zod.
- **The barrel follows the runtime graph**, not the `server-only` marker alone:
  `index.node-safe.ts` holds only modules whose runtime imports reach no
  `server-only`, filesystem or zod, each spelling `.ts`; everything else is
  `index.ts`'s. Inside the segment modules import each other by leaf.
- **Music's scripts enter through the barrels**, `music:scaffold` now running
  under `react-server` as `music:masters` does, and leave the grandfathered
  block — all but `list-untold-songs`, which reads `catalogue-names.ts` under
  bare Node, a module no barrel a client component imports may hold.
- **A page reads each thing once** (review on #205): `catalogue-entries.ts`'s
  `artistInfo`, `albumInfo`, `catalogueAlbum` and `songInfo` give everything a
  page shows of one in a language, and the per-fact readers they are built from
  left the barrel.

Slice 5b, the player and music's app layer: vet clean, vova built, the bar
looked at playing.

- **`music/features/player`** holds the provider, the bar and the controls pages
  place (`TrackButton`, `SongPlayButton`, `AlbumPlayButton`, `LaunchButtons`),
  the state and its hooks under `model/`; its rules are `player.module.scss`,
  cut from `music.module.scss` on the seam, the `fill` mixin both use in
  `shared/styles`, whose `index.scss` is the segment's public API, as Steiger
  asks; a sheet `@use`s it by that name, since knip follows no directory.
- **What the bar and the pages both draw is music's `shared/`**: `Spelling` and
  `BillingLinks` in `shared/ui`, `duration.ts` in `shared/lib`.
- **music's app layer** mounts the player (`MusicLayout`), maps an address to a
  page (`MusicRoute`) and parses the route (`music-route-params.ts`); the page
  prop types stay the pages', whose barrel exports the five pages and their
  metadata. vova's router and sitemap enter it.

Collections into blog (review on #169): typecheck, lint, Steiger, `check:masd`,
knip, the tests and every render's `--check` clean; bible, lsa and vova built.
kernel imports nothing of blog's.

- **`blog/shared/content`** is the old `kernel/shared/content`. What names no
  collection stayed kernel's: `PUBLIC_DIR` and `GENERATED_DIR`
  (`shared/config/public-dir.ts`, node-safe barrel only),
  `shared/lib/content-hash.ts`, `WithOptionalOgImageSize` in `shared/seo`'s
  `og-card.ts`, `Routed` in `shared/typings`.
- **kernel's factories take what names a collection from outside**: `sitemap` a
  thunk of pages beside `/`, `constructMetadata` the feeds to advertise, and
  `constructRootMetadata` the same for `/`. blog's app layer holds the
  collection `sitemap`, `collectionFeed` and a `rootMetadata` advertising the
  site's feeds, which every blog site's layouts and vova's `global-not-found`
  take; `blog/shared/seo` holds a `constructMetadata` supplying the feeds and
  `constructArticleMetadata`, which every page under blog calls. mushrooms calls
  kernel's, so `/mushrooms` advertises no feed; lsa, serving no collection,
  keeps kernel's sitemap and root metadata.
- **Scripts**: kernel's `site-tree.ts` (`REPO_ROOT`, `RENDERED_SITE`,
  `filesUnder`) and blog's `content-tree.ts` (the collection roots and
  `contentFiles`); `read-collection`, `heading-title`, `public-markdown`,
  `check-prose-quotes` and `render-mermaid` are blog's. kernel's `og-job` keeps
  the mechanism and the site card, exporting `svgCard`; blog's `og-job.ts` adds
  the chart cards and the content tree's manifest roots in
  `renderDocumentOgCards`, which every printing site calls, and `entryCards`
  makes maya's and basilisk's card per entry. `ManifestRoots.manifestDirs` is
  required. blog's scripts enter `shared/content` through its node-safe barrel,
  which holds the registry and the mermaid paths, so kernel's three entries in
  the grandfathered block went and none of blog's joined it.

Slice 5c, music's pages: typecheck, lint, Steiger, `check:masd`, knip and the
music tests clean, vova built, the index, an artist, an album, a song (desktop
and phone) and the radio screenshotted pixel-identical to the elephant's.

- **One slice per page**: `pages/music` keeps the index (the name stays, and
  with it `masd.md`'s `shared/catalogue` trap); `pages/artist`, `pages/album`,
  `pages/song` and `pages/radio` each hold their page, props type and metadata,
  the song page its lyrics, credits, facts and video, the radio its dial.
- **What pages share sits by what it is** (review on #214): `entities/cover`,
  `entities/hook` and `entities/song` (the explicit badge) show one noun each;
  `widgets/catalogue-header`, `catalogue-grid`, `music-nav`, `song-list` and
  `story` compose; `music/shared/ui` keeps only what knows no music — fact
  lines, the noted span, the WIP mark, the title gloss. `HookLine` reads
  `hookRuns` through the catalogue's node-safe barrel, the radio's client card
  entering its slice. `music/shared/seo` holds `catalogueMetadata` and
  `listenTitle`, `songDownloads` joined `shared/catalogue`, and `SONG_FEED`
  music's `app/lib`. `masd.md` states the noun test for `shared/ui` and the
  node-safe barrel as a client's entry.
- **`music.module.scss` is gone**, cut along its components; the square of art
  the covers and tiles both draw is the `art` mixin in `shared/styles`.

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

- **6b's untying is done** (62e41dc): every production import the layout would
  turn sideways or upward now targets a file the layers allow — the cast shadow
  in `ink.ts`, `Aloft` in `pinhole.ts`, `Drawn` in `placement.ts`,
  `WithGraphics` in `shapes.ts`, `Chorded` in `repaint-queue.ts`, the cap's
  seats in a new `shelter-seats.ts`, the footfalls in `walking.ts` — with no
  behaviour change. The operator asked for 6b on this same PR: «я не вижу смысла
  приземлять этот слайс отдельно от следующего -- разбиения "грибов" -- так как
  именно он покажет, правильны ли были наши теоретизирования».

- **The dry-run cut was built and then rejected** (e7a4c9a, after 4763c65
  renamed the three exports a barrel would have held twice): typecheck, knip,
  Steiger bar the tests, `check:masd`, vova's build and all 2273 meadow tests
  passed on it. The operator rejected it as a domain cut: «червяк -- внутри
  entity "гриб", при этом в pages/mushroom/ui/scene есть … house-worm.ts, а
  между ними -- "meadow", которое как название фичи звучит непонятно». **The
  finding for 6a**: a cut drawn from the import graph reproduces how the code is
  stitched — `draw-house` paints the mice and the worm, `worm.ts` imports
  `house.ts` — so modularity found mushroom, house, mice and worm one module,
  true of the code and false of the nouns. Modularity tests whether a cut holds;
  the nouns draw it.
- **Rules the operator set for the re-cut**: base entities never import one
  another, and where two meet is a feature named for what happens («цветок
  вырастает, когда нажимаем на травку» = фича); super-entities are an idea for
  later, tried only once feature grouping stops sufficing. Nothing goes into
  `shared` to quiet a checker: «нужно было его совать прямо туда где его
  используют … а иначе что это за лайфхак такой» — so `firefly`, `flower-genes`
  and `shelter-seats` leave `shared/world`, and `shared` keeps what is about
  nothing in particular. The play runs wait for `/finalize` («не надо гонять
  игру на каждом пуке»); whether the suite is worth keeping whole is the
  operator's open thought.

**Spike findings the rest builds on**: Steiger run per app root counts only that
root's references, wrong in both directions, and run on the parent of several
roots it finds no FSD root at all (Steiger 0.6.0); it skips gitignored paths, so
a spike goes in the scratchpad, run from the repo root so its config resolves.
Measured over the tree, boundary-vs-internal import edges cannot tell a module
from a grab bag — a well-layered slice imports downward, so its edges leave it.
The game's dry-run slice tree, every file assigned and nothing moved, is
`docs/remove-before-merging/masd/one-page-measure/mushrooms-tree.md`, with the
13 edges it would break.

## Rest of the bite

**6b, re-cut by nouns.** The dry-run cut is reverted (7fb1f33). The operator's
answers:

1. **The house is part of the mushroom** («1 ок»). The worm and the mice are
   base entities taking windows and doors as parameters; «червяк выглядывает из
   окна» and «мыши бегают между дверями» are features.
2. **Features are cut by what happens, and two that would import each other are
   one**: «если вдруг фичам надобиться импортить друг друга, то их суём в одну
   фичу … собственно это и есть критерий "код общий"», 6a's modularity checking
   what each holds.
3. **The whole is built from its parts, above them.** A part declares the slice
   of state it reads as a structural `With…` type over entity types and is
   generic in the rest (`sown<M extends WithMushrooms & Spored>(meadow: M): M`),
   so nothing below imports `Meadow`. A noun's own data and life go to its
   entity (the sprout, `Planted`, the house to the mushroom); an encounter goes
   to a feature declaring its slice; `Meadow`, the `Action` union and `reduce`
   go with the scene to `widgets/meadow`, provided it passes as a module (the
   operator: «если наш виджет пройдёт критерий модульности -- почему нет»), the
   page keeping the React shell.

The order: the target tree is written, `nouns-tree.md` beside
`mushrooms-tree.md` (5e0f1cd), and the operator took its five calls as
recommended («звучит хорошо, давай попробуем»); untie the code in place; then
move along that tree with the tools in `layout-tools.md`. The 27 tests' question
below is re-asked once the tree stands, since their set changes with it.

**Laid out file by file (`nouns.ts` in `layout-tools.md`), the tree breaks 220
imports, not the handful its untyings list.** Over half go into four hubs the
tree left in the widget: `MeadowLayout` (`layout.ts`, read by 25 files),
`MeadowSound` (`sound.ts`), `MeadowSeen` (`planter.ts`), and `Meadow`, `Planted`
and `Action` (`game.ts`). The rest go into the layout engine every feature uses:
`clump-layout`, `flower-layout`, `flower-plots`, `bed-place`, `anchored-stand`,
`cap-cover`, `flower-cover`, `mushroom-shown`. The operator's answer: answer 3
holds for all four hubs, each part declaring the narrow type it reads («звучит
логично, будем смотреть по реализации»), and the engine goes down by nouns: a
mushroom's place to `entities/mushroom`, the flowers' to `entities/flower` with
the bee's planted flowers a parameter, a point on the bed to `shared/world`.
Call 3 (the map in the widget) is re-asked once the engine has left the widget.
«делай, по результатам будем смотреть»: build through, and bring the result for
review rather than stopping on each call.

- **Untied**: the worm and the mouse lose the house (601300f) — `worm.ts` is the
  body and its clock, `worm-way.ts` (`worm-peeks`) the window, the way over the
  cap and the windows' swing; `mouse-head.ts` the mouse's head size;
  `paintHouse` takes its tenants as painters, which `house-view` composes, so
  `house-view` joins the widget.
- **Re-laid in `nouns.ts`** (no code): `placement`, `crowding`, `door-sight`,
  `clump-shade`, `cap-cover`, `clump-layout` and `shelter-seats` to the
  mushroom; `flower-sight`, `flower-layout`, `flower-plots`, `flower-cover` and
  `anchored-stand` to the flower; `gait-spot` and the whole of `keep-meadow` to
  the widget (the kept record is the whole meadow's); and `insects-perch`,
  `insects-shelter` and `bee-pollinates` merged into one `features/insects-fly`,
  since they import one another (answer 2).
- **`MeadowLayout` flipped** (680a999 and the commit after it): the narrow types
  live with their owners — `Sunned`, `Horizoned`, `NearHilled`, `HillsSunned`,
  `SunWashed` and `SunControls` in `sun-layout` (which takes the buttons and
  places the widget hands it), `InsectScaled`/`InsectSized`/
  `InsectCamera`/`LEAST_SPANS` in a new `insect-size`, `Placement` and
  `ClumpGround` in `clump-layout`, `Clouded` in `panorama`, `Bedded` in
  `flower-layout`; `MeadowLayout` is their intersection. Each of its 22 readers
  declares `<File>Layout`, the field types it reads plus its callees'. `Stand`
  and its parts are generic in the layout (`Stand<L>`), a reader bounding `L` by
  its own alias; the widget, tests and scripts spell `Stand<MeadowLayout>`. The
  second commit is **typecheck-red, 10 errors**: `anchored-stand`'s per-layout
  cache (typed without `L`), `dusk-view` painting the fireflies (a composition —
  the widget's), `lawn` 129, `mushroom-room` reading the pickers (`Controls`:
  flip like `SunControls`), its `Found` and the `Stand<MeadowLayout>` it passes,
  `tending.test.ts` naming `Tending` bare. 171 imports break; the hubs left are
  `Meadow`/`Planted`/`Action` (`game.ts`), `MeadowSound`, `MeadowSeen`, the
  engine (`bed-place`, `repaint-queue`, `mushroom-shown`, `sky-layout`), and the
  insect entity's reach into `features/insects-fly` (`flight` and its types:
  split `Perch`/`Leg`/`Place` down, the choosing up).
- **Typecheck green again, the three hubs flipped** (4fa0647, 182bc06, 63df99a,
  841d1f8; 171 broken imports to 138). The anchored stand caches only what
  anchoring changes (`Reseeded`) and rebuilds its layout over the caller's, so
  `Stand<L>` needs no cast; the sight's stores key on the mushrooms' ground
  (`perGround`), which `anchoredGround` keeps one object per anchor. A new
  mushroom keeps off `everyButton`, which the layout lays. `model/planted.ts`
  (mushroom) holds `Planted`, the sprout, `Spore`, `WithMushrooms`,
  `WithSpores`, `Grown`, `WithSelected`, `Deselect`; sowing, sprouting and
  furnishing are generic over their slice. `WithPulled` is the flower's,
  `Tended` lives in `flower-sight`, `sameFoot` in `ground`, `Timed` in `motion`.
  Each `Action` variant is declared by its dispatcher: `TurnLight` (dusk),
  `StartRain` (weather), and the picker's `Planting`, `PickColour`,
  `PlantShape`, `HoldFlower` in `model/flower-planting.ts` (flower). Every
  `MeadowSound` reader declares the voice it calls (`Wriggling`, `MouseVoice`,
  `Popping`, `Growing`, `DuskVoiced`, `RainSound`, `Glinting`, `Waking`,
  `Keyed`); the planter's ports are generic in `model/acting.ts`. Re-laid:
  `dusk` and `weather` to `shared/world` (the world's clock, read by windows,
  fireflies and flowers alike), `dusk-view` to the widget; `Lights` to
  `windows-lit`, `DUSK_WASH_DEEPEST` to `palette-dusk`.
- **The engine down, the insect split** (7d13a4f to 21447f2; 138 broken imports
  to 79). `bed-place`, `repaint-queue`, `backdrop-depths` and `shelter-seats`
  are the world's (`Stood` in `ground`, `Drawn` and `LaidAhead` in `bed-place`).
  `Shown<House>` is the mushroom's, its house a parameter: the bed passes
  `HouseView` and moves the house after `moveMushroom`, `mouse-runs` reads
  `{ doored, mouse }`; `Body` lives in `mushroom-shown`, `Puffing` in
  `mushroom-selection`. `insect-size` is the insect's. `model/perch.ts` (insect)
  holds the perch and leg vocabulary, `perchName`, `isSamePerch`, `ShelterSeat`;
  `flight.ts` keeps the choosing and `shownOf` and goes up to
  `features/insects-fly`, with no re-exports. `pollen.ts` split three ways:
  `pollen-load` (insect), `planted-flowers` (flower: `Sown`, `Plot`,
  `slotTaken`, `plantedId`), the sowing (feature). `Seat`/`Nectared` live in
  `insect-seat`, `Flier` in `flier.ts`. `flowerLight` is the flower's
  (`flower-light.ts`), `lightAt` in `model/light`, so the mushroom reads nothing
  of the flower. `paint-backdrop` is the widget's.
- **The flower's fork, decided** (the operator: «хорошо, давай»). The flower and
  the mushroom meet in two ways only: each takes up ground (a foot nothing else
  stands on) and each hides what stands behind it (an outline and a depth,
  `mostShaded` being the same read precomputed); a new mushroom keeps off the
  flowers the same way, so the meeting is mutual. So:
  - **the planting decisions go up**, each to its feature with both entities in
    reach: the child's (`takesFlower`, `roomIn`) to `plant-flower`, the bee's
    (`roomFor`) to `insects-fly`, the mushroom's already in `grow-mushroom`;
  - **the shared geometry goes down** to `shared/world` as an occupant
    (`Occupant = { feet; cover }`, the name the build's to settle): "visible
    past what stands in front" and "ground taken", which the insects' perching,
    the bee's and the child's planting and the visit's opening layout all read.
    The mushroom and the flower each turn themselves into occupants (their
    entities' functions); whoever composes the stand hands the list in, so the
    flower imports nothing of the mushroom and both stay nouns of their own.
    Re-anchoring the stand likely goes up with the planting to the features that
    need it; the code decides.
  - Rejected: one entity slice for both (loses the nouns), FSD's `@x` (extends
    MASD's barrels and checkers), an encounter feature (`Stand`'s four reading
    features would merge into it), the mushrooms' functions threaded through the
    flower's (about 30 files).
- **The fork, built** (7d0e5ba to 2a3c6d1; 74 broken imports to 52, none left from
  the flower to the mushroom or the insect). `shared/world` gains
  `anchored-ground` (`MushroomGround`, `ClumpGround`, `anchoredGround`,
  `groundIn`), `occupant` (`Occupant = { foot; cover }`, `Occupying<Thing>`,
  `Occupied<Thing>` — `WithMushrooms` is `Occupied<Planted>` — `ShownCover`,
  `inSightPast`, `ClumpShade`, `mostShaded`), `seat-reach` (`HeadReach`,
  `Lifting`, `Sitter`), and `crowding` and `groundOf`. The mushroom turns itself
  into occupants in `mushroom-cover` (`occupantsOn`, `coversShown`;
  `flower-cover` renamed). `Stand<L, Thing>` carries `occupying`, and every
  flower function taking a stand is generic in `Thing`: a closure bound to the
  stand's own mushrooms was tried and dropped, since `risen` swaps the mushrooms
  and the occupancy would not follow. The sight takes a `Sitter`; the insect
  supplies it (`flower-lift`: `flowerLift`, `liftOn`; `widest-spans`:
  `WIDEST_SPAN`, `widestSpanOn`, `butterflyOn`, one sitter per insect size so
  the sight's stores hold). Up: `flower-room` (`takesFlower`, `roomIn`) in
  plant-flower, `bee-room` (`roomFor`) in insects-fly,
  `GrowingStand`/`growingStandOf` (the stand with its spores) in grow-mushroom.
  `anchoredStand` no longer filters the mushrooms to `STAND_REACH` — a generic
  cache of the filtered list needs a cast — so its readers see all of them and
  the ground lays out only those it shows; meadow tests at `/finalize` check
  that nothing judged changed. `Tended` is the widget's (`game.ts`). Typecheck
  green, eslint clean but `boundaries/*`.
- **Left to untie** (52, by `layout.ts`): the firefly (10 edges: it circles
  caps, tufts and flowers — likely its view up to a feature, `fireflies-circle`
  per `nouns-tree.md`); the lawn/sky knot (`brow`, `grass`, `paint-land`,
  `mottles` read the sky's tones and skyline one way now that `paint-backdrop`
  is the widget's — likely they join the sky as one landscape noun, `grain`'s
  `Band` with them), `rain-view`'s read of `Backdrop`; `tufts` up (a
  composition); `mouse-run-clock` → `house` (`DoorPlace`, `onStem`);
  `flower-closing` read by `draw-flower` and `flower-seat`; `grow-mushroom` ↔
  `sow-spores`; `mushroom-patch`; `perch-hosts` → the beds; `shared/ui`'s
  `hit-areas` and `bake-picture`; `shared/world`'s `plane-place` (insect
  frames), `meadow-camera` and `ground-grid` (mushroom genes and opening feet).
  Then `layout.ts` to zero, the move, the 27 tests, `check:masd`. The scripts
  are in `layout-tools.md`; `retarget.ts` takes `FROM=<file>` where a name is
  declared twice. Mechanical relocations with the home named in the brief can go
  to a cheaper subagent in a worktree, reviewed before they land (the operator's
  ask); the calls stay in the session.

The rest of this section is the dry-run cut's record, kept for the barrels,
tests and checks, which carry over. The layout's source is `mushrooms-tree.md`
with these overrides, decided while untying: `flier-rest` and `furnishing` join
`features/meadow` (their one consumer); `flower-genes` (which insects and
mushrooms both read), `shelter-seats` and `firefly` (a one-file slice would be
flagged) join `shared/world`. **The map stays in the page**: `map-view` computes
its flowers with the scene's own layout engine (`flowersOf`, `Stand`, `sizeOn`,
`DoorSeating`), so a `widgets/map` needs those injected rather than moved down —
a change of the map's API, left for later. The tools (`layout-tools.md` in this
bite's directory, three scripts to copy into `tmp/modularity/`) print the
layout's broken imports (none now), each file's slice, importers and imports,
and which files reach Phaser.

- **Two barrels where a slice mixes Phaser with pure modules**: `index.ts` holds
  everything, `index.node-safe.ts` only what reaches no Phaser at runtime — the
  game's tests run under Node, where importing Phaser throws, so an importer
  whose names are all node-safe enters by that barrel. Phaser reach per slice:
  the page 40 of 128, insect 4 of 27, mushroom 7 of 25, flower 1 of 5,
  `shared/ui` 1 of 8; meadow, `shared/world` and `shared/lib` none. `masd.md`'s
  node-safe line names this axis beside the bundler one; this barrel spells no
  extensions, since nothing under bare Node reads it.
- **27 tests import above their module's layer** — most build the page's
  `meadowLayout` over `VIEWPORTS` to test a lower module on real screens
  (`phaser.ts` lists them). Recommended: such a test moves up beside the page,
  named for what it checks, since it tests the composition; ask the operator
  before moving them, the alternative being fixtures moved down.
- **Then the move**: `git mv` per slice (`model/` and `ui/` segments, the
  scene's files into `ui/`), imports rewritten — relative inside a slice, the
  barrel across slices, `@/mushrooms/shared/lib/<file>` per sub-library — and
  barrels exporting what other slices use. `scripts/vet-test.sh`'s `MEADOW` and
  `test:meadow` in `package.json` widen to `src/mushrooms/`; `README.md`,
  `.claude/rules/styling.md` and the mushrooms scripts' deep imports follow the
  paths (the scripts stay grandfathered, entering through public APIs in 7).
- **Checks**: typecheck, lint (boundaries), `pnpm lint:fsd`, `check:masd` (the
  meadow and the entities must pass, the meadow by modularity alone), knip, the
  quick tests, then `pnpm test:meadow` and `pnpm play:mushrooms`, and vova built
  and the game looked at.

## Rest of the elephant

- **Later, sub-entities** (the operator: «очень уж чешется вариант с
  "подсущностями" (надо только имя получше подобрать: абстракции? зародыши?
  кирпичики/parts?), но наверное не сейчас уже»): a facet several entities share
  — the occupant is the first — as a named kind of slice of its own rather than
  a file in `shared/world`.
- **Later, the converse of 6a** (the operator: «как бы нам определять, когда в
  одном слайсе скопилось что-то (кластер?), что заслуживает вынесения в модуль?
  но отложим»): when a cluster inside one slice earns a slice of its own.

In this order: the scripts move before music and the game are restructured, so
those slices carry their own tools along.

- **7. The grandfathered script imports, retired.** basilisk's, kernel's,
  shell's and vova's scripts enter their layers through public APIs — a
  `index.node-safe.ts` where a script runs without a bundler — and the
  `boundaries/dependencies` block in `eslint.config.ts` goes, with whatever
  slices 5 and 6 left in it — `list-untold-songs` among them, whose
  `catalogue-names.ts` reads the filesystem under bare Node. With it every
  script runs under `tsx` (the operator's «давай» on #169): each
  `node <file>.ts` entry in `package.json` becomes `tsx <file>.ts`, its files
  take the `@/` alias, and `eslint/bare-node.ts`, its `vova/no-relative-escape`
  exemption and `masd.md`'s bare-Node import rule go. `personas/tools/` stays as
  it is, being Майя's.

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
- **Not extracted:** a `masd` package or a Steiger plugin. A plugin's rule sees
  one root, which is the problem; a package earns nothing a script and one data
  file do not already give.
