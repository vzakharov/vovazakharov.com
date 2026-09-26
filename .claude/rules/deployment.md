---
description: How a merge to main publishes each site — the two doors the sites leave by, the subject gate, the hand-run, the PDF print and DNS
paths:
  - .github/workflows/**
  - .github/actions/**
  - scripts/publish-site.sh
  - apps/*/public/CNAME
---

# Deployment

**The sites leave by two different doors, because a repository gets one Pages site.** `vovazakharov.com` holds this repository's own, deployed from `apps/vova/out` by `actions/deploy-pages`. Every other site is built here and force-pushed by `scripts/publish-site.sh <site>` to the `gh-pages` branch of a receiving repository — `vzakharov/latestageagentic.com`, `vzakharov/agentic.bible` — which holds no source and runs no workflow: its Pages is set to deploy from a branch, so the push _is_ the deploy. That push needs a credential `GITHUB_TOKEN` cannot give — a deploy key per receiver, whose contract the script's own header carries. The workflow maps each receiver's secret into the one fixed variable the script reads, so a new site is a `case` arm and a matrix entry, never a change to how the key is handled.

**Only a squash subject of a publishing type publishes, and its scope picks the site.** Which types those are is the `publishing` variable in the workflow's `gate` job — the one place the set is stated, beside the reason each type is in it. The gate reads the pushed commits' subject lines and skips the build for every other type in CLAUDE.md § "Git conventions", so a merge of one lands on `main` without spending a deploy. Three things follow:

- **A merge carrying no publishing type that does change the built site is deployed by hand** — run the workflow from the Actions tab (`workflow_dispatch` bypasses the gate). A `chore:` dependency bump that alters output is the usual case. A manual run has no subject to read a scope off, so it takes a **site** field instead — `all`, or a list of site ids, defaulting to `all`; naming one is what lets an unmerged branch publish that site alone, and an id the field does not know fails the run rather than falling through to every site.
- **The gate matches subjects only**, in either scoped or breaking form (`feat(cv):`, `fix!:`), and deploys when _any_ commit in the push qualifies — so a `feat:` never gets stranded behind a `docs:` commit pushed alongside it.
- **A scope that names a site publishes that site alone** — `feat(vova):`, `feat(lsa):`, `feat(bible):`. Every other scope, and an unscoped subject, publishes all of them: a change to the shared `src/` is every site's change, so that is the safe default and naming a site is the narrowing.

**Each lane prints that site's page PDFs into its export before publishing**, through the `.github/actions/render-pdfs` composite action both of them call. A page's `.pdf` link is derived from its route and emitted whether or not the file exists, so the file has to be there by the time the export is served — and nothing in the repository carries it, the PDFs being build artifacts (`.claude/rules/content.md` carries the contract). A failed print fails its lane, which leaves the previous deploy served rather than a link that 404s.

**Each custom domain's DNS lives outside the repository**, and without it the site is dark whatever CI reports — but it is reachable from here where the registrar has an API, and Porkbun, which holds these domains, has one. Two preconditions gate it, keys and a per-domain toggle, and absent either the records are the operator's to write; `.claude/skills/stand-up-site/SKILL.md` § "Step 2" carries both routes and what each takes. `scripts/publish-site.sh` and each site's own `CNAME` stay the whole of what this repository can say about where it is served.
