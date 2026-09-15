# Standing up latestageagentic.com — what ran, and what is left

The procedure is `@.claude/skills/stand-up-site/SKILL.md`, which outlives this
branch. This file is the record of running it for this one domain.

## One step left, and it is yours

**Merge with a subject that publishes** — `feat:` or `feat(lsa):` — since the
gate skips the build for anything else. Nothing downstream waits on it: the site
is already up.

## What ran

- `vzakharov/latestageagentic.com` exists, public, holding its README and the
  `gh-pages` branch the publish pushes. An ed25519 deploy key is installed on it
  with write access, its private half in this repository's
  `LSA_PAGES_DEPLOY_KEY`.
- The site went up **ahead of the merge**, from this branch: a manual run with
  the **site** picker set to `lsa`, so `publish-lsa` ran and the
  `vovazakharov.com` jobs were skipped rather than deploying that site from an
  unmerged tree.
- Of the skill's two Pages calls only the second was needed — pushing `gh-pages`
  enabled Pages by itself, `CNAME` and all — so the `POST` answered `409` and
  `https_enforced` was the only thing left to set.
- `https://latestageagentic.com` answers 200 over an approved certificate, `www`
  and plain HTTP both 301 onto it, the served HTML carries this site's own title,
  description, card image and copy, and `vovazakharov.com` still serves its own.

## What changed at the registrar

Porkbun, by hand, and the only part of this that a rollback would have to undo.
**Deleted** two rows, both of them the parking page — an `ALIAS` on
`latestageagentic.com` and a `CNAME` on `*.latestageagentic.com`, both pointing
at `uixie.porkbun.com`. **Added** the nine the skill's table names: four `A` and
four `AAAA` on the apex, and `www` as a `CNAME` to `vzakharov.github.io`. The
`MX` rows, the `v=spf1` `TXT` and the two `_acme-challenge` `TXT` rows were left
alone.
