# The Bible: latestageagentic.com's article collection

Stand up the wiki `writing/late-stage-agentic/plan.md` calls «Библия» as a real
content collection on `latestageagentic.com`, and seed it with three articles
written off the three recordings that landed in 3b1e8e8.

The site currently serves one page: a home page whose "Writing" section renders
an empty `ENTRIES` array and says nothing is published yet. Everything the
collection needs — markdown at a route plus an extension, frontmatter, reading
time, heading outline, index cards, social metadata — already exists in
`shared/content` and `pages/case-studies`, built for `vovazakharov.com`. **The
shape of this task is therefore: make the content pipeline serve two sites, then
write three articles into it.** The second half is the deliverable; the first
half is what stops the first article from being a copy of the machinery.

## Decisions in force

- **A Bible article is built exactly like the Playgram case study**, through the
  same pipeline and offering the same artifacts: markdown at its own route, a
  committed PDF beside it, the same header, heading outline and index card. Not
  a second implementation that resembles the first — the same one, taught which
  site it is serving. Every structural decision below follows from that.
- **The collection is `bible`, served at `/bible`.** It is the only candidate
  name with a reason behind it (plan.md, "Not balanced": the self-irony is what
  keeps a categorical article from reading as a manifesto), and the label in the
  registry reads "The Bible".
- **The articles are English.** The site is the English channel; the recordings
  are scripts for the Russian one. The `<slug>.<locale>.md` seam that
  `.claude/rules/content.md` names stays deliberately unbuilt.
- **An article is not the recording, and carries no second voice.** The
  two-voice format — the human half and the agent's answer — is the column's,
  per plan.md. Where a recording's «Заметки агента» carries something that
  strengthens the position, it is folded into the article's own argument
  unattributed; where it is a reading of the recording as a performance, it is
  left in `writing/`.
- **Promise links are dropped, not published.** The recordings link every "about
  this later" to a file under `writing/late-stage-agentic/ideas/`, which is a
  repo convention (`.claude/rules/writing.md`) and not a published tree. In an
  article the promise survives as plain text; only links to pages that exist —
  the other two articles, the author's own site — are published.
- **One PR, not a carve.** Three articles and a registry that learns which site
  owns a collection is a day's work with one seam, not multiple subsystems.

## Part A — The pipeline serves two sites

Four facts about the current pipeline, each of which breaks the moment a second
collection exists on the other site:

1. `COLLECTION_IDS` is a flat global list with no owner, and `collectionDir()`
   resolves against `process.cwd()/public` — the app directory the build was
   entered in. A `bible` entry therefore names a directory that does not exist
   in `apps/vova/public/`.
2. `listAllDocuments()` flat-maps `readdirSync` over every collection, so the
   `vova` build's sitemap throws `ENOENT` on the Bible's missing directory.
3. `CONTENT_DIRS` in `scripts/lib/content-tree.ts` does the same for the render
   scripts, which `vet.sh` runs in `--check` mode on every vet.
4. `src/pages/case-studies` hardcodes `const COLLECTION = 'case-studies'` in two
   files and puts `Vova Zakharov` in its index title.

### A1. A collection knows which site serves it

- Extract `SITE_IDS` / `SiteId` from `site-config.ts` into
  `src/shared/config/site-ids.ts`, holding constants and no side effect.
  `site-config.ts` keeps everything else, including the throw on an unset
  `NEXT_PUBLIC_SITE`, and re-exports the type through the segment barrel
  unchanged.
  **Why the split:** `collections.ts` deliberately carries no `server-only` and
  runs under bare Node from the render scripts, one of which
  (`content:mermaid`) sets no `NEXT_PUBLIC_SITE`. Importing `site-config` there
  would throw at module load; importing a constants file cannot.
- Add `site: SiteId` to each entry in `COLLECTIONS`, and
  `collectionsForSite(site): CollectionId[]` beside it.
- Export `SITE_ID` from `shared/config` — the resolved id, which
  `site-config.ts` already computes privately as `siteId`.

### A2. Every consumer filters by site

- `listAllDocuments()` takes a `SiteId` and walks only that site's collections.
- `src/app/lib/sitemap.ts` composes per site: `/` and the site's collection
  indexes and documents for both, plus `PAGE_ROUTES` and the CV variants for
  `vova` only. `apps/lsa/app/sitemap.ts` is added as the same one-line re-export
  `apps/vova` already has — the site's findability is a stated goal of the
  project, and the sitemap is the cheapest half of it.
- `scripts/lib/content-tree.ts` resolves the site from `NEXT_PUBLIC_SITE` and
  throws when unset; `content:mermaid`'s package script gains the variable the
  other two already set.

### A3. One page slice serves both collections

- `git mv src/pages/case-studies src/pages/documents`, and the stylesheet with
  it (`case-studies.module.scss` → `documents.module.scss`). The slice already
  holds the index, the article and the pieces they share for exactly the reason
  FSD gives — two slices cannot share `document-meta` sideways — and that reason
  now covers two collections as well as two page kinds.
- Replace the two hardcoded `COLLECTION` constants with factories the routers
  bind: `articleRoute(collection)` returning `{ Page, generateMetadata,
generateStaticParams }` and `collectionIndexRoute(collection)` returning
  `{ Page, metadata }`.
- Each app's route file binds one collection — three lines rather than the
  current one-line re-export, because Next reads `default`, `generateMetadata`
  and `generateStaticParams` as separate named exports. `.claude/rules/fsd.md`
  says router files are one-line re-exports; that sentence is amended to say
  what a parameterized page costs instead.
- New routers: `apps/lsa/app/bible/page.tsx` and
  `apps/lsa/app/bible/[...slug]/page.tsx`.
- The index page's title comes from `SITE_CONFIG.name`, not a literal.

### A4. The PDF lane serves both sites

`render-pdf.ts` already spawns `next dev` in the working directory, which is the
app directory the run was entered in — so the lane is site-agnostic where it
matters, and pinned to `vova` in four places:

- `cvPrintables()` and the `CV_DIR` manifest root are unconditional, and the CV
  is `vova`'s page. Both become conditional on the site being rendered.
- `CONTENT_DIRS`, which A2 has already made site-aware.
- The dev-server error message names `pnpm dev:vova` in prose; it names the
  running site's script instead.

The package scripts split into `content:pdf:vova` and `content:pdf:lsa`, each
entered in its own app directory with its own `NEXT_PUBLIC_SITE`. `vet.sh` runs
both as separate entries in its fan-out rather than one combined script: a
combined `a && b` appends `--check` to the second command only, which would
leave one site rendering for real inside a vet run. The two `--check` passes
only hash files, so they overlap as safely as the single one does today.

`content:og` stays `vova`-only until the first authored card exists on the other
site; A2's filtering is what keeps it from walking a directory that is not
there.

**Two by-hand render runs land in this PR.** `pnpm content:pdf:lsa` produces the
three articles' PDFs and `apps/lsa/public/bible/pdf-renders.json`; `pnpm
content:pdf:vova` re-renders every case-study PDF, because `DOCUMENT_SOURCES`
names `src/pages/case-studies/ui` and A3 renames that directory. Both sets are
committed, and `vet.sh`'s two `--check` passes are what fail if either is
skipped.

## Part B — The three articles

`apps/lsa/public/bible/` gains three documents, each frontmatter (`description`,
`date: 2026-09-16`) plus a leading `# ` heading the pipeline lifts into the page
header — the same two-field frontmatter the case study carries, minus the
`ogImage` it points at a chart. `constructMetadata` falls back to the site
avatar, which is a correct card until a card is drawn.

Reading order is the order they are written in, because the second leans on the
third and the first stands alone:

| Slug                      | From | Position                                                                        |
| ------------------------- | ---- | ------------------------------------------------------------------------------- |
| `web-not-console.md`      | b1   | Drive agents through the web client, not the local console                      |
| `tend-prose.md`           | b2   | Agent-written prose fails in four ways, and they have names                     |
| `given-for-inevitable.md` | b3   | An agent treats what it finds as what must be, and more context does not fix it |

**What the rewrite actually is.** Each recording is a script: it opens on why
the speaker resisted, arrives at the position, and closes on an exhortation.
An article states the position first and spends the rest of itself earning it —
same material, different register, which is the distinction plan.md draws
between the channel and the site. Concretely, per article:

- **`web-not-console`** — the position is the three reasons the fear was
  misplaced: the laptop stops melting, the day becomes a pipeline instead of a
  wait, and the parallel branches do not fight at merge time. The recording's
  own finding, that the branch fear is the strongest argument and belongs last
  because the piece is a fear being lifted, does not carry to a page that is
  skimmed: the article leads with it. The cross-task insight from the agent's
  notes — that switching between fifteen branches is where a thought from one
  arrives in another — is the pipeline argument's real weight and is written in
  as such. Database migrations stay named as the one exception.
- **`tend-prose`** — the position is that the four lenses are not a taxonomy but
  a list of what kept coming back on review, and that this is why there are four
  and not six. The two dimensions the agent's notes name — T and E cut by
  volume, N and D by time — are the article's spine. The polar bear keeps
  Dostoevsky and the CDN resizer; the wet-floor sign follows it, because it is
  the clearest statement of why an agent negates instead of deleting. Closes on
  the standing cost: an agent's only proof of work is text, so the lenses run
  forever rather than until the repo is clean.
- **`given-for-inevitable`** — the position is that the obvious remedies both
  fail, and why. The megapixel analogy is stated as a mechanism rather than an
  image (attention is the fixed area the tokens divide). House and the sandwich
  stays: it is the concrete half of an argument that is otherwise philosophy,
  which is the bar plan.md sets. The ending keeps its speaker — the insight on
  the way is the best part of building anything, and handing it over leaves you
  posing tasks and signing off results.

### The Bible's own front page

Added at the go-ahead: `/bible` opens on prose of its own rather than dropping
the reader straight into a list of three cards. The index page already takes a
one-line description — the case studies' is "Long-form write-ups of work I have
shipped" — which serves as both the meta description and the page's lede; the
Bible needs more than a line, because the name is a joke that has to land before
the first categorical article does.

So the index gains an optional second element beside that line: a short
introduction, rendered under the lede and above the cards, written per
collection. The case studies keep none. The Bible's says what the collection is
(a position per article, stated flatly), why it is called what it is (the
self-irony is what keeps a categorical piece from reading as a manifesto), and
what «as of writing» means for a page about a technology that moves. That is
`writing/late-stage-agentic/plan.md` § "Not balanced" in the register of a page
rather than of a plan.

Where the copy lives: a record in the page slice keyed by collection, not a
field in `shared/content`'s registry. The registry shapes routes and runs under
bare Node in the render scripts; a paragraph of site copy is page composition,
and the layer that renders it is the layer that should hold it.

Cross-links are sibling `.md` links (`./given-for-inevitable.md`), which the
pipeline rewrites to the sibling's route and which resolve unchanged when the
markdown is read raw.

Voice: `.claude/rules/lsa-voice.md` — Pratchett-ish irony, and the prose stays
loose rather than tightened into efficiency. The `--`-not-`—` rule in
`.claude/rules/writing.md` is a LinkedIn-feed rule and does not reach here; the
published case study uses ordinary typography and so do these.

## Part C — Wiring and the record

- **The home page's "Writing" section** renders the collection's primary
  documents as `SummaryCard`s, plus a link to `/bible`.
  `src/pages/lsa-home/lib/entries.ts` is deleted: it is an empty array whose
  purpose — "a piece runs where it runs" — is served by the collection now, and
  an off-site entry can be reintroduced when there is one.
- **`.claude/rules/content.md`** — its `paths:` globs name
  `apps/*/public/case-studies/**` and `src/pages/case-studies/**`; both
  generalize. Its body gains the site owner, the printable flag and the slice's
  new name.
- **`.claude/rules/fsd.md`** — the slice list, the router one-liner sentence
  (A3), and the `pages/case-studies` mention in its content-pipeline trap.
- **`CLAUDE.md`** — the `apps/*/public/` layout line names one collection.
- **`writing/late-stage-agentic/plan.md`** — two of its open questions are
  answered by this PR and move out of "Open": what the wiki is called, and where
  the column ends and the wiki begins (a piece is recorded as a column script
  and rewritten as an article — the first of the two routes it names). The
  recordings' `ideas/` promises stay as they are; the two-backlogs question is
  untouched.

## DRY notes

- **Genuinely shared, and now actually shared:** the whole document pipeline —
  frontmatter parsing, rendering, reading time, heading outline, index cards,
  file links, metadata. A second collection reuses it by registry entry, which
  is what the registry was built for. The page slice is the one place where the
  sharing was only half-done: it was written generically and then pinned to one
  collection by two constants, so parameterizing it is finishing a job, not
  abstracting a second time.
- **Reused rather than added:** `renderPrimaryDocuments` for the home page's
  cards (the same call the index page makes), `SummaryCard`, `constructMetadata`,
  `pageFile`, `documentRoute`. The lsa home page gains no rendering code of its
  own.
- **One print lane, not two.** The PDF script learns which site it is rendering;
  it does not grow a second enumeration for the second site. The print sheet,
  the stylesheet, the manifest format and the staleness check are the ones the
  case studies already use, which is why a Bible PDF needs no new print code at
  all — only a collection that exists and a script entered in the right app.
- **Duplicated on purpose:** each app's route files. They are three-line
  bindings per route, and the alternative — a shared router factory reaching
  into `apps/` — would put the FSD layer graph in a directory Next owns.
- **Not extracted:** no shared "article voice" module, no template for the three
  articles. They are prose; the only thing three markdown files could share is a
  shape, and a shape imposed on three pieces at once is how a wiki starts
  reading like one generator.
- **The `SiteId` split is a de-duplication, not a new seam.** Without it,
  `collections.ts` would spell its own copy of the site ids, which
  `pnpm type-overlap` exists to reject and which would drift the first time a
  third site appears.

## Out of scope

- Per-article Open Graph cards. The case study's card is an authored chart of
  its own data; these articles have no chart, and a card generated from a
  template is the CV's pattern rather than a document's. The avatar fallback is
  correct until one is drawn.
- The `<slug>.<locale>.md` seam.
- The Russian channel: nothing here posts to Telegram.
- The remaining `ideas/` backlog — eight paragraphs that are not articles yet.
- The footer's direct address to the agent reader, which plan.md calls for on
  article pages too; the home page carries it today and widening it is its own
  judgement call about how it reads at the foot of an argument.

## Verification

1. `pnpm content:pdf:lsa` and `pnpm content:pdf:vova`, run by hand, with both
   sets of PDFs committed (A4).
2. `./scripts/vet.sh` — both builds, both sitemaps, and the two
   `content:pdf --check` passes that catch a missed render.
3. `/preview` on the lsa site: the home page's Writing section, `/bible`, and one
   article in both themes. A green vet says the pages build, not that they read.
   Open one of the new PDFs too — the print footer prints the site's own URL,
   and `latestageagentic.com` has never been through that path.
4. Read the three articles end to end against the recordings they came from —
   the check is that each states its position before it argues it, and that no
   promise link points at a file the site does not serve.
