> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Two sites out of one repository

`latestageagentic.com` becomes a second site built from this repository rather
than a repository of its own. Both sites share `src/`; each owns its route tree,
its `public/`, and its site config. This repository's CI builds both and keeps
publishing `vovazakharov.com` to its own GitHub Pages exactly as today; the
second build is pushed to a source-less receiving repository whose Pages serves
it at its own domain.

This supersedes the spinoff plan on `claude/spinoff-phnz8v`: nothing leaves this
repository, so `/spinoff` is not run. It rides this branch, beside the dictation
work PR #43 already carries — the same branch delivers the material and the site
it will be served from, and the squash record covers both once the work lands.

## Decisions

| Question                 | Settled as                                                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layout**               | `apps/vova/` and `apps/lsa/`, each holding `app/`, `public/`, `next.config.ts`, `tsconfig.json`. One root `src/`, one `package.json`, one lockfile. |
| **Workspace**            | None. No `pnpm-workspace.yaml`, no Turborepo — verified unnecessary, see "The shape".                                                               |
| **Receiving repository** | `vzakharov/latestageagentic.com`, public, no source. Pages source is a branch, so it carries no workflow of its own.                                |
| **Publish branch**       | `gh-pages`, force-pushed as a single orphan commit each deploy. `main` there holds a README and the project's issues.                               |
| **Credential**           | An ed25519 deploy key: private half a secret here, public half installed on the receiver with write access.                                         |
| **Deploy gate**          | Reads the conventional-commit scope: `feat(lsa):` publishes LSA only, `feat(vova):` vova only, an unscoped `feat:`/`fix:` publishes both.           |
| **Domain files**         | `apps/lsa/public/CNAME` and `apps/lsa/public/.nojekyll`, so they are in `out/` by construction and survive every force-push.                        |
| **Caching**              | Out of scope. Both builds run in full, every time.                                                                                                  |

Ruled out: **Cloudflare/Netlify for the second site** — it needs no deploy key
and no receiving repository, but it moves the second build to a runner whose
toolchain is pinned somewhere no agent can reach, which is the one class of
change CLAUDE.md § "Vetting" already calls out as costly; one build environment
is worth a key to manage. **Pruning one `out/` per domain from a single build** —
the hrefs baked into the HTML would still carry the other site's prefix.
**A `pnpm` workspace** — it would force every dependency to be declared per app,
duplicating the two lists, for no gain the spike below did not already deliver.

## The shape

```
apps/
  vova/   app/  public/  next.config.ts  tsconfig.json   → vovazakharov.com (Pages, as today)
  lsa/    app/  public/  next.config.ts  tsconfig.json   → latestageagentic.com (pushed)
src/      shared/  features/  app/  pages/               → shared by both
```

**`next build <dir>` needs nothing else in that directory** — verified by a spike
against Next 16.0.3 in this tree. A directory holding only `next.config.ts`,
`app/` and a `tsconfig.json` whose `paths` reach back to the root `src/` builds
clean: `@/shared/config` resolves across roots, `.next/` and `out/` land inside
the app directory, and the repository root stays untouched. So dependency
resolution walks up to the single root `node_modules` and there is nothing for a
workspace to do.

**Both sites' page slices stay in one `src/pages/`.** FSD slices may not import
each other sideways, which is exactly the relationship two sites' pages have, so
the layer holds both without a rule bending. That keeps `steiger src`, the
`boundaries` element patterns (scoped to `src/**`) and the `@/*` alias unchanged —
the whole FSD apparatus is untouched by this change. The apps hold routing only,
as root `app/` does today, and `.claude/rules/fsd.md` § "The app layer is
`src/app`; root `app/` is the router" keeps its meaning with `apps/*/app/`
substituted for the root one.

**Per-site configuration is a build-time constant, not a runtime branch.**
`src/shared/config/site-config.ts` grows a second config and selects between
them on `process.env.NEXT_PUBLIC_SITE`, parsed by a zod enum so an unset or
unknown value fails the build rather than silently serving the wrong site. Each
app pins its own value in its `next.config.ts` (`env: { NEXT_PUBLIC_SITE: 'lsa' }`),
so no invocation can forget it and no call site changes: every consumer keeps
importing `SITE_CONFIG` from `@/shared/config`.

## Stage 1 — split the router out of the root

Mechanical, and provable: `vovazakharov.com` must build to the same output it
does today.

1. `git mv app apps/vova/app` and `git mv public apps/vova/public`.
2. `apps/vova/next.config.ts` — today's root config, plus `env: { NEXT_PUBLIC_SITE: 'vova' }`. The `next-intl` plugin's path to `./src/shared/i18n/request.ts` is resolved from the project directory, so it becomes `../../src/shared/i18n/request.ts` (`.claude/rules/fsd.md` already flags that this path is found by string, not by import).
3. `apps/vova/tsconfig.json` — extends the root one, overrides `paths` to `{"@/*": ["../../src/*"]}`, includes `app/**` and `.next/types/**`.
4. Root `tsconfig.json` — `include` gains `apps/*/.next/types/**/*.ts` so one `tsc --noEmit` still covers both apps' generated route types.
5. Root `next.config.ts` is deleted. Root `pages/` stays exactly where it is: it shadows the Pages Router for the whole repository, and `pages/README.md` explains why.
6. `package.json` scripts: `build` becomes both builds in sequence, with `build:vova` and `build:lsa` beside it; `dev` takes the site as an argument (`dev:vova`, `dev:lsa`).

**The trap in this stage** is `src/shared/content/collections.ts`, whose
`PUBLIC_DIR` is `path.join(process.cwd(), 'public')`. Builds run from the
repository root, so after the move that path points at nothing. It becomes
`path.join(process.cwd(), 'apps', SITE, 'public')` off the same constant the site
config reads — which is also what makes a `cd apps/lsa && next dev` wrong, so the
scripts always run from the root.

`scripts/render-mermaid.ts` (`REPO_ROOT/public/...`), `scripts/render-og.ts`,
`scripts/render-pdf.ts` and `eslint.config.ts`'s `out/**` ignore take the same
prefix. Nothing else in the tree spells `public/` or `out/`.

## Stage 2 — `apps/lsa`

1. `apps/lsa/app/layout.tsx` and `page.tsx`, one-line re-exports like vova's.
2. `apps/lsa/public/.nojekyll` — without it Pages runs the branch through Jekyll, which strips `_next/`.
3. `apps/lsa/public/CNAME` — one line, `latestageagentic.com`.
4. The second entry in `src/shared/config/site-config.ts`: url, name, tagline, social.
5. `src/pages/lsa-home/` — a real index page composed from the shared layer, listing published pieces, of which there are none yet. A real page rather than a placeholder because it is what proves the shared layout, theme, SEO and i18n work under a second site at all.

The site is English-only in content. Nothing about that needs building: locale is
not a route segment here (only the CV carries one), so a second site simply uses
the English catalogue.

## Stage 3 — the deploy pipeline

`.github/workflows/deploy.yml` grows from three jobs to five.

- **`gate`** outputs two booleans instead of one. It already matches `^(feat|fix)(\([^)]+\))?!?:`; it now captures the scope and reads `lsa` and `vova` as site names, anything else — including no scope at all — as both. The job summary names which sites will publish and why, as it does today.
- **`build-vova` → `deploy-vova`** are today's two jobs with `pnpm build:vova` and `./apps/vova/out`, gated on `deploy_vova`.
- **`build-lsa` → `publish-lsa`** build `apps/lsa` and run `scripts/publish-lsa.sh`, gated on `deploy_lsa`.

The publish step is a script rather than inline YAML, so the deploy key is
handled somewhere readable and lintable, and so its header can carry the durable
half of the runbook — what the secret is, what breaks without it, and how to
rotate it — where whoever debugs a red deploy will actually be. It:

1. **Refuses to publish an `out/` missing `CNAME` or `.nojekyll`.** Both failures are silent at the far end — a dropped custom domain and a stripped `_next/` — so the build fails loudly instead.
2. Writes the key from the secret, pins `GIT_SSH_COMMAND` to it, and pre-seeds `known_hosts` with `ssh-keyscan`.
3. `git init` inside `out/`, one commit naming the source SHA, force-push to `gh-pages` on the receiver.

The orphan push is deliberate: the receiver never grows, and rollback does not
need its history, because the source of every byte is a commit here — an older
deploy is re-run by dispatching this workflow from an older ref.

## Provisioning — the agent's half

None of this is code and all of it is `gh`, so the implementing session runs it
rather than writing it down for someone else. It splits around the first deploy,
because Pages cannot be aimed at a branch that does not exist yet.

**Before the merge**, in the session's scratch directory:

```bash
gh repo create vzakharov/latestageagentic.com --public \
  --description "Built site for latestageagentic.com — source lives in vzakharov/vovazakharov.com"

ssh-keygen -t ed25519 -f "$SCRATCH/lsa-pages" -N "" -C "lsa-pages deploy key"

gh repo deploy-key add "$SCRATCH/lsa-pages.pub" \
  --repo vzakharov/latestageagentic.com \
  --title "vovazakharov.com CI" --allow-write

gh secret set LSA_PAGES_DEPLOY_KEY \
  --repo vzakharov/vovazakharov.com < "$SCRATCH/lsa-pages"
```

Public, because Pages on a private repository is a paid-plan feature.
`--allow-write` is the whole of what the key is for; without it the push 403s.
The private half is never printed and dies with the container — and it is never
recovered either, so rotating the key is re-running these four commands.

**After the first deploy**, which is what creates `gh-pages`: point Pages at it,
then force HTTPS once GitHub has issued the certificate for the domain it reads
off the `CNAME` file, usually about fifteen minutes later.

```bash
gh api -X POST repos/vzakharov/latestageagentic.com/pages \
  -f 'source[branch]=gh-pages' -f 'source[path]=/'

gh api -X PUT repos/vzakharov/latestageagentic.com/pages -F https_enforced=true
curl -sI https://latestageagentic.com | head -1        # expect 200
```

**If it serves a 404**, the `CNAME` file did not reach the branch — but the
publish script asserts on that before pushing, so the likelier cause is DNS that
has not propagated. **If it serves `vovazakharov.com`**, the apex records point
somewhere else entirely.

## The runbook — what only you can do

Three steps, and only three: two at your registrar, because neither has an API
this repository can reach, and the merge, which is yours either way. Everything
else the implementing session does for itself.

**1. Own the domain.** `latestageagentic.com` has to be registered to you
somewhere. If it is not, nothing else works.

**2. Point it at GitHub.** Delete any A, AAAA or ALIAS already on the apex, then
add these eight:

| Type  | Name  | Value                                                                                   |
| ----- | ----- | --------------------------------------------------------------------------------------- |
| A     | `@`   | `185.199.108.153` `185.199.109.153` `185.199.110.153` `185.199.111.153`                 |
| AAAA  | `@`   | `2606:50c0:8000::153` `2606:50c0:8001::153` `2606:50c0:8002::153` `2606:50c0:8003::153` |
| CNAME | `www` | `vzakharov.github.io`                                                                   |

These are GitHub's shared Pages addresses — the same ones `vovazakharov.com`
already resolves to. Which repository answers is decided by the `CNAME` file
inside each published branch, which is why that file is part of the build.

**3. Merge with a subject that publishes** — `feat:` or `feat(lsa):` — since the
gate skips the build for anything else, and the first deploy is what the
provisioning above waits on.

## Vetting and prose

`scripts/vet.sh` runs two builds where it ran one, sequentially, before the
fan-out and for the reason already in its header: each writes the `.next/types/`
its own app's type check reads. They are not parallelised and not cached; both
run in full. That is the accepted cost of this plan, and the thing to revisit
first if the run becomes annoying.

Nothing else in the suite changes shape. `steiger src`, the `boundaries` rules
and `pnpm type-overlap` all read `src/`, which does not move.

CLAUDE.md changes in three places: the repository-layout table gains `apps/`
and repoints `app/` and `public/`; § "Deployment" describes two sites, the
scope-reading gate, and the receiver; and § "Vetting"'s closing paragraph about
the one site an agent cannot reach gains a second — the domain's DNS, which no
file here can write and no token here can set, and which the site is dark
without.

## What this plan does not do

- **It does not move any content.** `writing/late-stage-agentic/` stays drafts. Turning them into the pages LSA serves is its own piece of work, once the video is recorded and the drafts are settled.
- **It does not touch the four dictation skills or `scripts/transcribe.py`**, which this branch already carries and which are unaffected by any of it.
- **It does not add caching**, a workspace, or a task runner.

## DRY notes

- **`src/` is genuinely shared, and this plan is what makes that true rather than a claim.** The foundation — `shared/`, `features/`, `src/app/` — is imported by both apps through the same `@/` alias. Nothing is copied.
- **The two site configs are two values of one shape, not two shapes.** They live side by side in `src/shared/config/site-config.ts` under one `SiteConfig` type, so a field added for one site is a type error at the other until it is answered. An alias that resolved `@/shared/config/site` to a different file per app was the alternative; it keeps the configs apart but makes the shape unenforced and the resolution invisible from either file.
- **`apps/*/app/` is duplication, and deliberately.** Each is a handful of one-line re-exports, which is what the App Router's filesystem convention costs; factoring them would mean generating route files, which trades a readable directory for a build step.
- **The publish script is one script, not a step repeated per site**, and it stays that way only as long as there is one pushed site. A second would make it take the receiver and the output directory as arguments; it is not written that way now because a parameter with one caller documents nothing.
- **Nothing is extracted from `deploy.yml` into a composite action.** The two build jobs differ in their gate, their build script and their far end, so the shared part is four setup steps — below the weight of an action's own indirection.

## Open questions

Each carries a recommendation, and the plan above is already written with that
recommendation in force — so silence resolves them and the plan stays
implementable as it stands.

1. **What does the LSA site serve on day one?** (a) A real index page with no
   entries yet — recommended, because it exercises the shared layer end to end
   and a placeholder does not. (b) A single static placeholder. (c) The two
   existing drafts, published as its first articles right away — which needs the
   content pipeline pointed at a new collection and the drafts settled, so it
   makes the whole branch wait on both.
2. **History on the receiving branch?** (a) One orphan commit, force-pushed —
   recommended: the receiver never grows, and every byte is reproducible from a
   commit here. (b) Accumulate real history, for a diff of the rendered HTML per
   deploy and a rollback by revert — at the cost of a few megabytes of hashed
   chunks per deploy, forever.
   Ruled out: a branch and a PR of this plan's own, which is what publishing it
   first reached for. One branch carries as many plans as the work needs, and this
   work is the same work — so the split only bought a second review surface and a
   merge conflict in CLAUDE.md with the branch it would have to follow.
