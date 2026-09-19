> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# The Bible moves to agentic.bible, and Late Stage Agentic becomes a hub

The Bible is an article collection on a domain that is not named after it, and
there is now a domain that is: `agentic.bible`. So it becomes the repository's
**third site**, standing up exactly as `lsa` did — an `apps/bible/` directory
building from the same `src/`, force-pushed to a receiving repository whose
Pages serves the domain. What that leaves behind on `latestageagentic.com` is a
front page with nothing under it, so the same change gives it the three things
the project actually offers: the Bible, MUTHUR, and courses that do not exist
yet.

Two sites become three, and the site that keeps its name stops being a
publication and starts being an index.

## The shape, before the steps

**Route.** On `agentic.bible` the collection is served at the **site root** —
`agentic.bible/tend-prose`, not `agentic.bible/bible/tend-prose`. The domain
already says which collection this is; saying it twice is the whole reason not
to. The collection's home page _is_ its index.

**Mark.** A terracotta wax seal, lettered `AGENTIC BIBLE` where it stands for
the site and blank where it stands for itself — at the foot of every article,
in place of an amen.

**Site name.** `The Agentic Bible`, tagline `Articles on agentic coding that
take a position and show the grounds under it.` — the sentence
`COLLECTION_INTROS.bible.description` carries today, promoted to the site's own
because the site is now the collection.

**The Bible gets a home page, not a re-dressed index.** `agentic.bible/` opens
on copy written to introduce a site — the collection's existing intro is the
seed of it and not the whole, because it argues for how the articles are
written before saying what the place is. The article list sits under that copy,
rendered by the same cards the case-studies index uses.

**What stays on LSA.** The header, the opening argument (`AboutSection`), and
the footer. What was the `Writing` section becomes a three-card grid.

**No redirects.** The Bible shipped on 2026-09-17, hours before this plan, so
`latestageagentic.com/bible/*` has had no time to circulate. Those URLs 404
after the move, and that is accepted rather than papered over with meta-refresh
stubs no reader will meet.

## What was settled, and what it ruled out

**Rooted routes.** `/bible/<slug>` and `/articles/<slug>` were the alternatives;
both keep the collection's directory and the render walk's structural invariant,
and neither is the URL the domain was bought for. Routing the page at
`/tend-prose` while the markdown stays at `/bible/tend-prose.md` was never an
option — `.claude/rules/content.md`'s file-is-route-plus-extension rule is
load-bearing, and `public/` serves a file at the path it sits at.

**One PR, not two.** The deploy plumbing is Phase 1 here rather than a `ci:` PR
merged ahead of it, the content being ready to move today. What that costs is
named in Phase 6: GitHub reads a `workflow_dispatch` input list off the
**default branch**, so `-f site=bible` is rejected until `main` knows the option
exists, and the pre-merge publish therefore dispatches `site=both` — which the
branch's own gate expands to all three sites.

**The opening argument stays on latestageagentic.com**, above the three cards.
Unanswered rather than argued, so the recommendation stood: cards with no
argument over them are a link farm.

## Phase 1 — Teach the deploy a third receiving site

A repository gets one Pages site, so `vova` keeps it and every other site is
force-pushed to a receiver. That makes two receivers, which is where the
one-off script stops being one.

- **`scripts/publish-lsa.sh` → `scripts/publish-site.sh <site>`.** A `case` maps
  the site id to its receiving repository; everything else — the `CNAME` and
  `.nojekyll` assertions, the throwaway repo in `out/`, the force-push — is
  unchanged. The key is read from a **fixed** `PAGES_DEPLOY_KEY`, and the
  workflow maps the per-site secret into it, so the script never learns a secret
  name. The header's rotation recipe is reworded per site. No tombstone: the
  file is renamed and its content survives, so the citations in `CLAUDE.md` and
  `.claude/skills/stand-up-site/SKILL.md` are repointed rather than resolved
  through a marker.
- **`.github/workflows/deploy.yml`.** The `gate` job's `select_site` learns
  `bible`; alongside the `vova` boolean it emits `receivers` — a JSON array of
  the non-Pages sites this run publishes. The two publish jobs collapse into one
  matrix job over `fromJSON(needs.gate.outputs.receivers)`, guarded by
  `if: needs.gate.outputs.receivers != '[]'`. The matrix is built from an output
  rather than filtered by a job-level `if` because `matrix` is not in scope in
  job-level `if` — it expands after the condition is read.
- **The `site` picker** gains `bible`, usable from the run after this branch
  merges — see Phase 6 for what the pre-merge dispatch names instead.

## Phase 2 — The third site

**`src/shared/config/site-ids.ts`** — `SITE_IDS` gains `'bible'`.

**`src/shared/config/site-config.ts`** — a `bible` entry: `url`
`https://agentic.bible`, `downloadPrefix` `bible`, the name and tagline above,
the shared `AVATAR` and `PUBLISHER`.

**`src/shared/content/collections.ts`** — the `bible` collection's `site`
becomes `'bible'` and its `base` becomes `''`. A rooted base breaks the three
path functions that interpolate it (`/${base}/${name}` yields `//name`), so they
route through one joiner:

```ts
/** A site-root path inside a collection — the empty base of a rooted collection dropping out. */
function collectionPath(id: CollectionId, ...segments: string[]): string {
  return `/${[COLLECTIONS[id].base, ...segments].filter(Boolean).join('/')}`;
}
```

`collectionRoute`, `collectionAssetUrl` and `documentRoute` become one line each
over it. `collectionDir` needs no change — `path.join(PUBLIC_DIR, '')` is
`PUBLIC_DIR`.

**`scripts/lib/content-tree.ts`** — `filesUnder` skips `generated/` at a
content root. With a rooted collection `CONTENT_DIRS` is the site's whole
`public/`, so the file's stated invariant — that the walk cannot hand a script
its own output — has to be maintained rather than structural. The comment says
so, in those words.

**`apps/bible/`**, built from `apps/lsa/` as the pattern:

```
apps/bible/
  next.config.ts          siteNextConfig('bible', import.meta.dirname)
  tsconfig.json           copy of apps/lsa/tsconfig.json
  app/layout.tsx          the shared root layout
  app/sitemap.ts          force-static + the shared sitemap
  app/page.tsx            BibleHomePage — Phase 3
  app/icon.svg            the blank seal, as the favicon — Phase 3
  app/[...slug]/page.tsx  articleRoute('bible')
  public/CNAME            agentic.bible
  public/.nojekyll
  public/seal*.svg        the mark, both cuts — Phase 3
  public/ava.og.png       the social card, rasterised from it — Phase 3
  public/*.md             git mv from apps/lsa/public/bible/
  public/assets/          git mv from apps/lsa/public/bible/assets/
  public/pdf-renders.json git mv
```

**`apps/lsa/app/bible/` is deleted**, and with it LSA's last collection:
`collectionsForSite('lsa')` returns `[]`, its sitemap is `/` alone.

**The article cards come out of the index page.** `collection-index-page.tsx`
holds the list markup — the alternating image layout, the meta line, the
variant links — and the Bible's home page renders the same list under different
copy. It moves to `src/pages/documents/ui/document-cards.tsx`, taking the
rendered documents; the case-studies index keeps its heading and intro above it
and loses nothing. `collectionIndexRoute` stays as the case-studies index, which
is now its only caller — its `<Title order={1}>{collectionRoute(collection)}</Title>`
heading reads `/case-studies`, which is what it always rendered there.

**`package.json`** — `dev:bible` and `build:bible` entries, `build` runs three;
`content:pdf:lsa` is replaced by `content:pdf:bible`, LSA having nothing left to
print.

**`scripts/vet.sh`** — the `pdf-lsa` line becomes `pdf-bible`.

## Phase 3 — The Bible's home page and its mark

**The home page is `src/pages/bible-home/`**, a slice of its own beside
`lsa-home` rather than a flag on the collection index: what differs is the copy
above the list, which is the page's whole substance. It renders the site header
(`SiteAvatar`, the site name, the tagline), the opener copy, then
`DocumentCards` over `renderPrimaryDocuments('bible')`, then the footer carrying
the address to agent readers.

**The opener copy is written for a site, not for a collection.** What
`COLLECTION_INTROS.bible.intro` says today argues for _how_ the articles are
written before saying _what the place is_ — correct as an index's intro,
back-to-front as a first paragraph. The order inverts: what this is, then the
position, then the name. A draft to edit rather than a specification:

> Everything here is written while the work is being done — by one person and
> one agent, both of whom keep being wrong in ways worth writing down.
>
> Every article takes a position. Not one of several worth weighing: the
> position, stated flat out, with whatever is under it shown. The alternative is
> what a language model writes when nobody stops it — every approach has its
> pros and its cons, weigh them against your context, best of luck.
>
> Hence the name, which is a joke, and which is doing actual work. Calling it
> the Bible is what keeps a categorical article from reading as a manifesto:
> nothing here ends in amen, and an article that turns out to be wrong gets
> rewritten rather than defended.

`COLLECTION_INTROS.bible` is deleted with the index route it fed, its
`description` having become the site's tagline and its `intro` this copy.

**The mark is a wax seal, in two cuts** — lettered `AGENTIC BIBLE` around a
twelve-spoke star, and the same seal blank. Both are **one re-trace of the
generated image**: 39 KB lettered, 32 KB blank, letterforms and wax edge the
render's own. They exist and match; Phase 3 owes the code around them.

An off-the-shelf trace of the same image is eight megabytes and visibly
grainier than its source, because it followed the JPEG's noise at full
precision — and it carries no layer the letters could be dropped from, which
is the other half of what this mark has to do. Five semantic layers, each
traced with `potrace` and stacked lightest first:

| Layer   | Mask                                                       |
| ------- | ---------------------------------------------------------- |
| body    | the silhouette, flood-filled in from the near-white border |
| gloss   | the wax lip's shine, above the 90th luminance percentile   |
| lip     | below the 34th percentile, outer 26% of the radius only    |
| relief  | the star and the struck ring                               |
| letters | high luminance, low saturation, inside the silhouette      |

Four things in that are load-bearing, each of them a defect first:

- **The relief is cut at the histogram's valley, not at a percentile.** The
  star's petals vary slightly in tone, so a fixed percentile runs through some
  of them and the trace eats half the star; Otsu's threshold sits below all of
  them. It is read from the face alone — inside 62% of the radius — so the
  lip's own shadow cannot pull the valley outwards.
- **The bands are read off a smoothed copy** (median 5, Gaussian 0.9), which is
  what separates a posterised band from speckle.
- **The letters are dilated out of every wax layer** before cutting — 11px for
  the bands, 33px for the gloss, whose halo reaches further. Their anti-aliased
  rims are bright and dark in turn, so a layer that keeps them prints their
  ghost on the blank cut; excluding them is the whole mechanism by which the
  blank cut is the lettered one minus its last path.
- **The lip band is gated by radius.** The same luminance recurs as a gloss
  patch across the face, which is a gradient in the source and a hard-edged
  smudge traced.

Suppression and smoothing are what ruined the first attempt at this: chasing a
small file, `-t 700 -O 0.9` bit the star's petals into fragments and lumped the
wax edge. The settings that hold the shape are `-t 20` for the silhouette,
`-t 120` for the bands, `-t 8` for the letters, at `-a 1.2 -O 0.2 -u 10`. Forty
kilobytes is the right size for this; eighteen was the wrong target.

| File                                  | Cut      | Where it renders                   |
| ------------------------------------- | -------- | ---------------------------------- |
| `apps/bible/public/seal.svg`          | blank    | the foot of every article          |
| `apps/bible/public/seal-lettered.svg` | lettered | the home page header               |
| `apps/bible/public/ava.og.png`        | lettered | the social card only, from the SVG |
| `apps/bible/app/icon.svg`             | blank    | the favicon                        |
| `apps/bible/app/apple-icon.png`       | blank    | the iOS home screen, 180×180       |

**Only the social card is a raster**, and for the reason `.claude/rules/content.md`
already states: no major consumer renders an SVG `og:image`. So it is the
existing pattern exactly — an authored `.svg` beside a committed `.og.png` that
`pnpm content:og` rasterises and `--check` guards — rather than a new one. Every
on-page use is the vector, letters included, because the trace made them paths:
there is no web font for an SVG behind an `<img>` to fail to load.

**The blank seal closes an article in place of an amen.** It follows the last
paragraph's final punctuation, inline at `1.9em` with `vertical-align: -0.55em`
— the end-mark a magazine sets after its closing sentence. The size is measured
rather than chosen: below about `1.5em` the star closes up and the mark reads as
a bullet. Three consequences:

- **It is a rehype plugin**, `src/shared/content/plugins/rehype-end-mark.ts`,
  because inline means inside the compiled HTML: it appends the `<img>` to the
  document's last element when that element is a paragraph, and to a paragraph
  of its own when it is a list, a table or a fence. Appending it in
  `article-body.tsx` instead would only ever reach its own line.
- **It prints**, which is the best thing about it: a wax seal at the foot of the
  PDF. So the plugin joins `DOCUMENT_SOURCES` in `scripts/render-pdf.ts`, or
  every document's PDF goes stale behind a change the manifest cannot see.
- **The seal is the site's, not the collection's**, so it hangs off
  `SiteConfig` as an optional `seal` beside `avatar` — `vova` declares none and
  the case studies close as they always have. Both fields are one named type
  (`SiteImage`, a path and its intrinsic size); two anonymous copies of
  `{ path, width, height }` is exactly what `pnpm type-overlap`'s floor 1 fails.

The two cuts were drawn and looked at in this session — on both themes, at
favicon sizes, and inline at the foot of a paragraph — so what Phase 3 owes is
the code around them, not the decision.

## Phase 4 — The LSA front page

Three cards under the opening argument, replacing the `Writing` section:

| Card                  | Links to                              |
| --------------------- | ------------------------------------- |
| The Bible             | `https://agentic.bible`               |
| MUTHUR                | `https://github.com/vzakharov/muthur` |
| Courses — coming soon | nothing                               |

- **`SummaryCard`'s `href` becomes optional**, and `CardLink` renders only when
  it is set — the shape `ProjectCard` already has for the same reason. That is
  what lets the third card be a card rather than a dead link.
- **The "coming soon" state** is a muted eyebrow line above the title, not prose
  inside the description: a reader scanning three cards should see which one is
  not clickable before reading any of them.
- `renderPrimaryDocuments` and `collectionRoute` leave
  `src/pages/lsa-home/ui/lsa-home-page.tsx`; the card copy is written in the
  file, the collection no longer being on this site to read it from.
- **`SiteFooter` moves to `src/shared/ui/`**, taking the site-specific note as
  children — see DRY notes. The address to agent readers travels with the
  articles to `agentic.bible`; LSA's footer keeps the copyright line alone.

## Phase 5 — Documents, PDFs and prose

- **Re-render the Bible's PDFs** (`pnpm content:pdf:bible`) and commit them. The
  printed footer carries the document's own URL and the site's name, both of
  which changed; `--check` fails the vet run until it is done.
- **`.claude/rules/content.md`** — the `paths:` glob `apps/*/public/bible/**`
  becomes `apps/bible/public/**`, and the prose naming `apps/lsa/public/bible/`
  is repointed. The `content:pdf` paragraph says three sites.
- **`CLAUDE.md`** — § "Repository layout" (three app directories, the Bible's
  new home), § "Deployment" (one Pages site and two receivers, the scope table
  gaining `feat(bible):`, `publish-site.sh`), § "Vetting" (three builds, and
  what that costs).
- **`README.md`** — the two-site layout becomes three.
- **`writing/late-stage-agentic/plan.md`** — the paragraph settling the name
  points at `latestageagentic.com/bible`; it points at `agentic.bible`, and says
  the site is now the collection's own.
- **`.claude/skills/stand-up-site/SKILL.md`** — `scripts/publish-lsa.sh` is no
  longer "the one that exists".

## Phase 6 — Standing the domain up

`@.claude/skills/stand-up-site/SKILL.md` owns this; what follows is what this
task hands it.

**The agent runs:**

1. `gh repo create vzakharov/agentic.bible --public` with a README saying what
   it serves and where the content comes from.
2. An ed25519 deploy key on that repository, its private half into
   `BIBLE_PAGES_DEPLOY_KEY` on this one. Nothing printed, nothing kept.
3. `gh workflow run deploy.yml --ref <branch> -f site=both`. **`both`, not
   `bible`**: GitHub validates a dispatch input against the form on the
   **default branch**, which does not know `bible` until this branch merges,
   while the workflow that _runs_ is the branch's — whose gate expands `both`
   into all three sites. So the run publishes the two live sites from the
   unmerged branch as well, which is the cost of proving the new one before the
   merge. Acceptable because the branch is what is about to merge; if you would
   rather not, skip this step and the site first serves on the merge.
4. Pages settled on the receiver (`source[branch]=gh-pages`, `https_enforced`),
   then verification against the live URL — the served HTML carrying **this**
   site's title and card, `www` and plain HTTP redirecting onto it, and both
   existing sites still serving their own content.

**You run** (no token here reaches a registrar — the site is dark until these
land, whatever CI reports):

| Type  | Host  | Value                                                                                   |
| ----- | ----- | --------------------------------------------------------------------------------------- |
| A     | `@`   | `185.199.108.153` `185.199.109.153` `185.199.110.153` `185.199.111.153`                 |
| AAAA  | `@`   | `2606:50c0:8000::153` `2606:50c0:8001::153` `2606:50c0:8002::153` `2606:50c0:8003::153` |
| CNAME | `www` | `vzakharov.github.io`                                                                   |

One record per value. The two that bite are a registrar's parking page: an
`ALIAS`/`ANAME` on the apex, which is the slot the A records need, and a
wildcard `CNAME`, which would answer for `www` too. Mail and `_acme-challenge`
rows never enter a web request — leave them.

The agent reads the zone and names the conflicts before you touch it.

## DRY notes

**Genuinely shared, and extracted here:**

- **The publish script.** Two receiving sites, one force-push-to-a-branch
  procedure with a per-site receiver. Sixty lines duplicated is the case the
  rule exists for, so `publish-lsa.sh` generalizes rather than spawning a
  sibling. The deploy key stays out of the map — the workflow maps the per-site
  secret into a fixed variable name, so adding a site touches the workflow and
  the `case`, never the key handling.
- **The publish job.** Same argument one layer up: one matrix job over the
  gate's `receivers` output, not one job per receiver.
- **The collection path joiner.** Three functions interpolate `base` into a
  path, and a rooted collection breaks all three identically. One joiner is the
  fix; three `filter(Boolean)` calls would be the duplication.
- **`SiteFooter`.** Two page footers today (`home`, `lsa-home`), each `Divider`
  - note + copyright with only the note differing; a third makes the pattern.
    The note goes in as children, which is what keeps the per-site prose per-site.
- **`DocumentCards`.** The article list — the alternating image layout, the meta
  line, the variant links — is forty lines of JSX that the case-studies index and
  the Bible's home page both render, differing only in the copy above it. It
  comes out of `collection-index-page.tsx` rather than being copied into the new
  slice, which is the alternative and the reason the extraction is in the plan
  rather than discovered in review.

**Duplicated on purpose:**

- **`apps/bible/`'s router files.** Each is a one-line re-export binding a route
  to a collection, and the binding is the file's whole content —
  `@.claude/rules/content.md` already names a router per page as what a new
  collection costs. A factory over them would abstract three lines into
  something with more moving parts than the thing it replaced.
- **`tsconfig.json` and `next.config.ts` per app.** Both are already as thin as
  the tools allow: the config is one call into `siteNextConfig`, and the
  tsconfig extends the root one. Next resolves both by convention at a fixed
  path, so there is nothing to hoist.
- **`ProjectCard` and `SummaryCard` stay separate.** After `href` goes optional
  they share Card + optional CardLink + title + description — but `ProjectCard`
  interleaves its extras _between_ those parts (stars beside the title, the
  case-study link between title and description), so composing it out of
  `SummaryCard` would mean passing slots for every gap. They share `Card`,
  `CardLink` and `Summarized` already, which is where the reuse belongs.
- **The card copy on the LSA front page.** Three cards' worth of prose written
  in the page, not read from a registry. Two of the three point off-site at
  things this repo does not own, and a registry of three hand-written entries
  with one consumer is a lookup, not an abstraction.
- **`bible-home` is its own slice, not a flag on the collection index.** The two
  pages share the card list, which is why `DocumentCards` comes out; what is left
  in each is the copy above it, and a `rooted?` branch through one component
  would be two pages wearing one file. `lsa-home` is already the precedent.

**Deliberately _not_ deduplicated yet:** the site header (`SiteAvatar` + name)
now opens both `lsa-home` and `bible-home`. Two occurrences of four lines of
JSX, differing in what follows them — revisit when a third appears, which is the
same bar `SiteFooter` clears here and this does not.

## Verification

`./scripts/vet.sh` covers the mechanical half: three builds, the PDF hashes, the
FSD boundaries, the type-overlap floors. What it cannot see:

- The Bible's articles render at `agentic.bible/<slug>` with their assets, their
  cross-links resolving between articles, and their `.md`/`.pdf` siblings
  reachable at the route plus an extension.
- The Bible's home page reads as an opener: the mark, the copy, the article
  list, in that order and at that weight.
- The seal closes an article at the right size and on the right line — inline
  after the final punctuation, and on its own line where the article ends in a
  list or a table. On screen, in print, and against both themes.
- The LSA front page's three cards, the third one visibly not a link.
- Both existing sites unchanged where the branch did not mean to touch them.

`/preview` is how the first three are looked at rather than inferred; Phase 6's
step 4 is how they are checked against what is actually served.

## Out of scope

- **Redirects for `latestageagentic.com/bible/*`** — see above; the URLs are
  hours old.
- **A card composed per article.** The lettered seal is the site's card image
  through `SITE_CONFIG.avatar`, which is what every page unfurls as; a card
  drawn per document is separate work. What Phase 3 does add is the seal's own
  SVG→PNG rasterisation, which is `content:og`'s existing job — and, with it,
  an optional `vector` on `SiteImage`: the page header takes the SVG and the
  card takes the PNG, so one field cannot serve both.
- **The courses themselves.** The third card says coming soon, and that is the
  whole of what this change knows about them.
- **Where the project lives on GitHub** — `writing/late-stage-agentic/plan.md`
  leaves open whether an organisation eventually holds `muthur` and the rest.
  This change adds a receiving repository under the existing account and settles
  nothing about that.
