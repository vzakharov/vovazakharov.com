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

**Site name.** `The Agentic Bible`, tagline `Articles on agentic coding that
take a position and show the grounds under it.` — the sentence
`COLLECTION_INTROS.bible.description` carries today, promoted to the site's own
because the site is now the collection.

**What stays on LSA.** The header, the opening argument (`AboutSection`), and
the footer. What was the `Writing` section becomes a three-card grid.

**No redirects.** The Bible shipped on 2026-09-17, hours before this plan, so
`latestageagentic.com/bible/*` has had no time to circulate. Those URLs 404
after the move, and that is accepted rather than papered over with meta-refresh
stubs no reader will meet.

## Open questions

Each carries a recommendation, and the plan below is written with the
recommendation already in force — so an unanswered question means the
recommendation stands, and the work is implementable as written.

1. **The Bible's route shape on `agentic.bible`.**
   **(a) Rooted — `agentic.bible/tend-prose` (recommended).** The memorable
   URL, and the point of the domain. Costs: the collection's directory becomes
   the site's whole `public/`, which breaks the invariant stated in
   `scripts/lib/content-tree.ts` — that a render walk cannot hand a script its
   own output — so that walk gains an explicit skip of `generated/`. And
   `app/[...slug]/page.tsx` sits at the app root, so a future top-level page is
   an explicit route beside a catch-all.
   (b) `agentic.bible/bible/tend-prose` — zero structural change, and it
   stutters.
   (c) `agentic.bible/articles/tend-prose` — keeps the directory and the
   invariant, loses the short URL.

   Note: routing the page at `/tend-prose` while the markdown stays at
   `/bible/tend-prose.md` is **not** an option — `.claude/rules/content.md`'s
   file-is-route-plus-extension rule is load-bearing, and `public/` serves a
   file at the path it sits at.

2. **The opening argument on the LSA front page.**
   **(a) Keep it, with the three cards under it (recommended).** It is the
   site's position and it shipped this week; cards with no argument over them
   are a link farm.
   (b) Cards only — the hub, and nothing else.

3. **The Bible site's avatar.**
   **(a) Copy `apps/lsa/public/ava.png` for now (recommended)** — every site
   commits its own square, and an identical one is a placeholder that ships.
   (b) Wait for an image only you can make, and the site's header is unfinished
   until it lands.

4. **Whether the deploy plumbing lands as its own PR first.**
   **(a) Yes — a small `ci:` PR, merged before this one (recommended).**
   GitHub reads a `workflow_dispatch` input list off the **default branch**, so
   `-f site=bible` is rejected until `main` knows the option exists — which is
   what a pre-merge publish of the new site needs. Landing the workflow first
   buys that, and the plumbing is deploy-neutral until a site uses it.
   (b) One PR, and `agentic.bible` first serves on the merge — no pre-merge
   proof, and a failed publish is fixed by another merge.

## Phase 0 — Teach the deploy a third receiving site (its own PR)

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
- **The `site` picker** gains `bible`, which is the option this phase exists to
  put on `main`.

Squash subject: `ci: one publish path for every receiving site`. Deploy-neutral
by its prefix, which is correct — nothing it touches changes either built site.

## Phase 1 — The third site

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
  app/page.tsx            collectionIndexRoute('bible') — the home page
  app/[...slug]/page.tsx  articleRoute('bible')
  public/CNAME            agentic.bible
  public/.nojekyll
  public/ava.png          copied from apps/lsa/public/
  public/*.md             git mv from apps/lsa/public/bible/
  public/assets/          git mv from apps/lsa/public/bible/assets/
  public/pdf-renders.json git mv
```

**`apps/lsa/app/bible/` is deleted**, and with it LSA's last collection:
`collectionsForSite('lsa')` returns `[]`, its sitemap is `/` alone.

**The index page becomes a home page.** `collection-index-page.tsx` today opens
on `<Title order={1}>{collectionRoute(collection)}</Title>` — `/bible` as its
own heading, which rooted would render as `/`. It takes the site header
instead when the collection is rooted: `SiteAvatar`, the site name, the tagline,
then the intro prose. `BackToHome` at its foot is dropped on the same condition
— it is already home. The case-studies index is unaffected on both counts.

**`package.json`** — `dev:bible` and `build:bible` entries, `build` runs three;
`content:pdf:lsa` is replaced by `content:pdf:bible`, LSA having nothing left to
print.

**`scripts/vet.sh`** — the `pdf-lsa` line becomes `pdf-bible`.

## Phase 2 — The LSA front page

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

## Phase 3 — Documents, PDFs and prose

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

## Phase 4 — Standing the domain up

`@.claude/skills/stand-up-site/SKILL.md` owns this; what follows is what this
task hands it.

**The agent runs:**

1. `gh repo create vzakharov/agentic.bible --public` with a README saying what
   it serves and where the content comes from.
2. An ed25519 deploy key on that repository, its private half into
   `BIBLE_PAGES_DEPLOY_KEY` on this one. Nothing printed, nothing kept.
3. After Phase 0 is on `main`: `gh workflow run deploy.yml --ref <branch> -f
site=bible`, confirming in the run's job list that `vova` and `lsa` were
   **skipped** rather than merely green.
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
  + note + copyright with only the note differing; a third makes the pattern.
  The note goes in as children, which is what keeps the per-site prose per-site.

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

**Deliberately _not_ deduplicated yet:** the site header (`SiteAvatar` + name)
now opens both `lsa-home` and the Bible's index. Two occurrences of four lines
of JSX, differing in what follows them — revisit when a third appears, which is
the same bar `SiteFooter` clears here and this does not.

## Verification

`./scripts/vet.sh` covers the mechanical half: three builds, the PDF hashes, the
FSD boundaries, the type-overlap floors. What it cannot see:

- The Bible's articles render at `agentic.bible/<slug>` with their assets, their
  cross-links resolving between articles, and their `.md`/`.pdf` siblings
  reachable at the route plus an extension.
- The LSA front page's three cards, the third one visibly not a link.
- Both existing sites unchanged where the branch did not mean to touch them.

`/preview` is how the first two are looked at rather than inferred; Phase 4's
step 4 is how they are checked against what is actually served.

## Out of scope

- **Redirects for `latestageagentic.com/bible/*`** — see above; the URLs are
  hours old.
- **The Bible's own Open Graph cards.** `content:og` is `vova`'s today, and the
  articles author none. A card for the new site's home page is a separate piece
  of work.
- **The courses themselves.** The third card says coming soon, and that is the
  whole of what this change knows about them.
- **Where the project lives on GitHub** — `writing/late-stage-agentic/plan.md`
  leaves open whether an organisation eventually holds `muthur` and the rest.
  This change adds a receiving repository under the existing account and settles
  nothing about that.
