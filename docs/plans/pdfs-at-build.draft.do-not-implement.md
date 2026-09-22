> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Page PDFs become build artifacts

Every printable page's PDF is committed today. A change to anything in
`PRINT_SOURCES` re-flags all of them, so a footer tweak is a full re-render, a
binary diff the size of the collection, and one "Viewed" click per file. At ten
documents that is an accepted cost; at a few hundred it is what stops the
collection growing.

**The move: CI renders the PDFs into `out/` after `next build`, and the
repository stops carrying them.** The render script keeps producing what it
produces — the same Chromium printing the same print stylesheet — and gains only
a choice of which server it prints from.

**Printing from the export is also a correctness fix, not only a speed one.**
`withDevServer`'s own docstring records the gap: a dev server prints what the
export prints _only while nothing hydrates visible text_, so a subtree moved
across the client boundary prints decoration the export never draws, and no
check in the tree can see it. Today the recommended remedy is to print one page
off a static host by hand and compare. After this change every shipped PDF comes
off the real export, and the caveat retires.

## What this is not

Ruled out in discussion, recorded so they are not reopened:

- **A `window.print()` button instead of a file.** Removes the problem entirely,
  but the `.pdf` URL goes with it — no link to send, nothing for a crawler.
- **Splitting the policy** (CV committed, documents built). One policy for every
  printable is the decision.
- **Rendering in the background when `pnpm dev` starts.** Fresh for the session
  that did not come to change print, stale for the one that did.
- **A dev-only proxy in front of `next dev`** printing `*.pdf` on demand. Right
  timing, but a process and ~100 lines of dev-only code for a case the manual
  cycle covers.
- **Rendering before the build, from a dev server, in CI.** The deploy would pay
  for the app twice, boot a dev server to serve pages the build already emitted,
  and keep the hydration caveat above.

## The shape of the tree this lands in

Three sites — `vova`, `lsa`, `bible` — of which **two have printables**:
`content:pdf:vova` (case studies plus the CV, per framing and language) and
`content:pdf:bible` (the Bible's articles, at that site's `public/` root). `lsa`
is a hub with none, and `runRenderJob` never starts a browser or a server when
nothing is stale, so a site with no printables costs an exit.

The deploy has two publishing lanes: `build-vova` → `deploy-vova` for this
repository's own Pages site, and a matrix `publish` job running
`scripts/publish-site.sh <site>` over the receivers, which force-push
`apps/<site>/out`. **Both lanes need the render**, and the matrix one has to stay
site-agnostic.

## Steps

### 1. One print origin, three shapes, and a parallel print loop

`printAll` spawns its own `next dev` and prints sequentially with
`execFileSync`. Both have to change: CI needs to print from the static export,
and a collection of any size needs more than one page in flight.

Replace `withDevServer` with one function that yields an origin, in three shapes:

| Shape            | Caller                             | Behaviour                                         |
| ---------------- | ---------------------------------- | ------------------------------------------------- |
| default          | `pnpm content:pdf:<site>` by hand  | spawn `next dev` on a free port, as today         |
| `--origin <url>` | a server the operator already runs | print from it, spawn nothing                      |
| `--from-out`     | CI, after `next build`             | serve `apps/<site>/out` statically on a free port |

`served()`, `awaitServer()` and the process-group teardown are shared by all
three; only "how does a server come to exist" differs.

The static server is ~40 lines in `scripts/lib/`, no new dependency. It needs
the export's own URL shape: `trailingSlash` is unset in `siteNextConfig`, so
`/case-studies/playgram` is `out/case-studies/playgram.html`. Resolve a request
as the literal file, then `<path>.html`, then `<path>/index.html`, else 404.

Print with bounded concurrency — `execFile` rather than `execFileSync`, workers
off `os.availableParallelism()` capped small (4). Each print is an independent
Chromium; the cap exists because they compete for the one server and the machine.

**`--origin` also fixes the local collision.** A second `next dev` in the same
app directory cannot start — Next 16 holds `apps/<site>/.next/dev/lock` — so
today `pnpm content:pdf:vova` fails outright while `pnpm dev:vova` is up.

### 2. Stop committing the PDFs

- `git rm --cached` the ten `*.pdf` files and every `pdf-renders.json`.
- `.gitignore`:

  ```
  # Page PDFs are build artifacts — CI renders them into out/ after the build,
  # and `pnpm content:pdf:<site>` renders them locally when you want to look at
  # one. .claude/rules/content.md carries the whole contract.
  apps/*/public/**/*.pdf
  apps/*/public/**/pdf-renders.json
  # An authored PDF — something a document links to — lives under assets/ like
  # every other asset, and is not a render.
  !apps/*/public/**/assets/**/*.pdf
  ```

  `**` matches zero directories as well as many, which is what covers the
  Bible's PDFs at its `public/` root alongside vova's nested ones.

The manifest becomes cache bookkeeping rather than a committed record, which is
why it is ignored alongside what it describes.

### 3. Mark the renders that stay committed as generated

The `.gitattributes` line discussed as "do it anyway" was aimed at the PDFs;
after step 2 they are not in the diff at all. **The same treatment still earns
its place for the renders that remain committed** — the Open Graph PNGs, the
mermaid SVGs and their manifests, equally generated and equally unreadable as a
diff:

```
*.og.png                              linguist-generated=true
*-renders.json                        linguist-generated=true
apps/*/public/generated/mermaid/*.svg linguist-generated=true
```

GitHub collapses these in the PR diff and drops them from the "Viewed" count.

### 4. CI renders after the build, in both lanes

The four steps between a build and its upload are identical in `build-vova` and
in the matrix `publish` job, so they go in a composite action
(`.github/actions/render-pdfs/action.yml`) taking the site id. Not because eight
lines of YAML are expensive to duplicate, but because the two copies carry cache
keys that must agree, and a drift between them would be silent.

The action invokes `scripts/in-site.sh <site> tsx scripts/render-pdf.ts
--from-out` rather than a `content:pdf:<site>` package script, so one call covers
every site including the ones with no printables — `lsa` today, and whatever
joins next.

1. **Restore** the PDF cache into `apps/<site>/public/` — `actions/cache/restore`
   with a key carrying the hash of that site's print sources, and a `restore-keys`
   prefix so a miss falls back to the most recent prior cache rather than to
   nothing.
2. **Render** with `--from-out`. `runRenderJob` compares the restored manifests
   against current sources and prints only what drifted — which is what makes the
   prefix fallback the point of the cache rather than a nicety.
3. **Copy** `*.pdf` from `public/` into `out/` at the same relative paths.
   `pdf-renders.json` stays behind: it is bookkeeping, not a published file.
4. **Save** the cache under the exact key.

The order is worth stating where the steps live: the restore is **after**
`next build`, because the build regenerates `out/`, and because a manifest
sitting in `public/` before the build would be copied into `out/` and served.

In the `publish` lane all of this precedes `publish-site.sh`, which reads
`apps/<site>/out` and force-pushes whatever it finds.

### 5. Drop the PDF checks from vet

`pdf-vova` and `pdf-bible` leave the `run-parallel.sh` fan-out — nothing can be
stale when nothing is stored — taking it from sixteen checks to fourteen. The
comment above it loses its PDF paragraph and its count.

### 6. Documentation

- **`.claude/rules/content.md`** — the tree diagram (the `.pdf` line stops being
  "committed"); the trap "a print-affecting change needs `pnpm content:pdf:<site>`
  re-run and the PDFs committed" becomes the new contract; and two facts the
  operator now needs: the `.pdf` link is unconditional, so in a tree where nobody
  ran the render it answers 404, and the render cannot run while that site's
  `pnpm dev` holds the lock.
- **`CLAUDE.md`** — § Vetting (the two check lines and the counts), § Deployment
  (the deploy now prints).
- **`scripts/render-pdf.ts`** — its header still says "never by `next build`, so
  CI installs no browser", which this change reverses; and `withDevServer`'s
  hydration caveat, which `--from-out` retires for everything CI ships.

## Open questions

Each carries a recommendation, and **the plan above is written as if the
recommendation were taken** — so silence is a valid answer and implementation is
not blocked.

**1. What happens when a print fails mid-deploy?**

- **(a) Fail that lane. — recommended.** A missing PDF behind a link the HTML
  always emits is a 404 for readers, and CLAUDE.md's "never silently swallow
  errors" points the same way. A failed lane leaves the previous deploy served,
  and `fail-fast: false` on the matrix already keeps one receiver's failure off
  the others.
- (b) Warn and publish without that file.
- (c) Retry each failed page once, then fail.

**2. A ceiling on the render, so a runaway cannot burn the deploy?**

- **(a) A timeout on the render step (20 minutes), alongside the existing
  per-print `PRINT_TIMEOUT_MS`. — recommended.** With a cold cache the full set
  has to fit the deploy budget on its own; a ceiling turns "somewhere along the
  way this got slow" into a failure someone reads.
- (b) No ceiling beyond the per-print timeout.

**3. Is there a way to look at a PDF before merge?**

- **(a) Each lane uploads its rendered PDFs as a workflow artifact. —
  recommended.** Four lines, and it makes a `workflow_dispatch` on an unmerged
  branch produce a downloadable zip — which is already how a single site is
  published early.
- (b) Nothing new: run `pnpm content:pdf:<site>` locally, which is what you would
  do anyway to look at one.

## Risks

- **Chromium on the runner.** `findChromium()` looks for `/usr/bin/chromium`,
  `/usr/bin/chromium-browser`, `/usr/bin/google-chrome`. The `ubuntu-latest`
  image ships Chrome, but this becomes load-bearing for every deploy, so the
  implementation verifies it in a real run and adds an explicit install if it
  does not resolve. A pinned install is the more honest choice for a renderer
  whose output ships.
- **`out/` locally no longer matches the deploy.** `pnpm build` copies whatever
  PDFs happen to sit in `public/`, so a local export is complete only if you
  rendered first. Nothing depends on it; one line in the rules file.
- **Cold cache.** The Actions cache is evicted after a week of disuse, so a full
  render lands on some deploy sooner or later. That is question 2, not a separate
  risk.

## DRY notes

- **`render-manifest.ts` is reused as is.** Staleness, pruning and manifest
  writing do not change; only who consumes the manifest does. The Open Graph and
  mermaid jobs are untouched, which is the test that the abstraction held.
- **The three print origins are one function, not three.** They share the wait
  loop, the free-port pick and the teardown. Splitting them across files would
  scatter one concern; duplicating them would put three copies of the
  process-group kill in the tree.
- **The CI steps are a composite action**, and it calls `in-site.sh` rather than
  a per-site package script — one call site covers three sites and the next one,
  instead of a `case` in YAML that has to learn each site's script name.
- **The static file server is new and deliberately not shared.** Nothing else
  here serves `out/`. During implementation, check whether `/preview`'s
  dev-server boot duplicates `withDevServer` — if it does that is a real
  extraction, but it is pre-existing duplication and only in scope if it is a few
  lines.
- **No shared abstraction over "render job in CI".** The Open Graph and mermaid
  renders stay committed and hand-run; one pipeline over all three would make two
  of them pay for a problem only the PDFs have.
