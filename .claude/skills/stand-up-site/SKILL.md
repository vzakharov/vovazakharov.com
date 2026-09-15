---
description: 'Stand a site up on its own custom domain, from a repository that already serves one: the receiving repository and its deploy key, the DNS the operator adds, the publish that proves it works before the merge, and settling GitHub Pages afterwards. Invoke as `/stand-up-site <domain>`. Use when a second site joins the repo, or when a site moves to a new domain.'
---

End state: `https://<domain>` serves the new site over an approved certificate,
`www` and plain HTTP redirect onto it, and every site already published from
this repository still serves its own content.

**A repository gets one Pages site.** The first site published from here takes
it; every one after that is built here and pushed to a **receiving repository**
that holds no source and runs no workflow, whose Pages is set to deploy from a
branch — so the push _is_ the deploy. That is the arrangement this skill stands
up, and the reason it needs a credential and a second repository at all.

What only the operator can do is **own the domain and write its DNS**. No token
this repository holds reaches a registrar, so those steps are handed over rather
than run, and the site is dark until they land whatever CI reports.

The code half — the app directory, its `next.config.ts`, the site's entry in the
shared config — is ordinary work on the branch and is not this skill's; CLAUDE.md
§ "Repository layout" and § "Deployment" own it. This skill starts where the
build already produces the site and ends where the domain serves it.

## Step 1 — The receiving repository and its key

```bash
gh repo create <owner>/<domain> --public -d '<one line saying what it serves>'
```

**Public is not a preference.** Pages on a private repository is a paid-plan
feature, so a private receiving repository fails at publish time rather than at
creation.

The workflow's `GITHUB_TOKEN` is scoped to this repository, so pushing to
another one needs a credential of its own — a deploy key, whose private half
never leaves the secret it is written into:

```bash
ssh-keygen -t ed25519 -N '' -C '<domain> pages deploy' -f tmp/deploy-key
gh repo deploy-key add tmp/deploy-key.pub --repo <owner>/<domain> \
  --title 'pages deploy from <source repo>' --allow-write
gh secret set <SITE>_PAGES_DEPLOY_KEY --repo <owner>/<source repo> < tmp/deploy-key
rm tmp/deploy-key tmp/deploy-key.pub
```

Print nothing and keep nothing: once the private half is in the secret, rotation
is the only way back, and the publish script's own header carries that contract
(`scripts/publish-lsa.sh` is the one that exists).

Give the receiving repository a README saying what it is and where its content
comes from. It is the only thing a person landing on a source-less repository
has to read.

## Step 2 — Hand the DNS over

The operator does this at their registrar. GitHub's Pages addresses are the same
for every site, so the table is the same every time:

| Type  | Host  | Value                                                                                   |
| ----- | ----- | --------------------------------------------------------------------------------------- |
| A     | `@`   | `185.199.108.153` `185.199.109.153` `185.199.110.153` `185.199.111.153`                 |
| AAAA  | `@`   | `2606:50c0:8000::153` `2606:50c0:8001::153` `2606:50c0:8002::153` `2606:50c0:8003::153` |
| CNAME | `www` | `<owner>.github.io`                                                                     |

One record per value — four A rows and four AAAA rows, not one row holding four
addresses. Which repository answers is decided by the `CNAME` file inside each
published branch, which is why that file is part of the build.

**Read the zone before writing the instructions, and say which existing records
conflict.** The two that bite are a registrar's parking page: an `ALIAS` or
`ANAME` on the apex, which is the slot the A records need, and a wildcard
`CNAME`, which answers for `www` as well and would send it to the parking page.
Mail (`MX`, `v=spf1` `TXT`) and the registrar's own `_acme-challenge` rows never
enter a web request — say so explicitly, so the operator deletes two records
rather than clearing the zone.

Verify from here before going further. **There is no `dig` or `nslookup` in the
container**, and `dig +short` missing returns empty rather than failing, which
reads exactly like "DNS not set":

```bash
python3 - <<'PY'
import socket
for host in ('<domain>', 'www.<domain>'):
    print(host, sorted({a[4][0] for a in socket.getaddrinfo(host, None)}))
PY
```

The apex should answer with all eight GitHub addresses.

## Step 3 — Publish before the merge

The operator will want the site checked before it lands, and a manual run is the
only way to get it there — but a dispatch from an unmerged branch publishes
whatever it is told to publish, including sites whose pages this branch also
changes.

**So the run has to name one site.** The gate reads a scope off the commit
subject on a push and off the **site** picker on a manual run (CLAUDE.md
§ "Deployment"); naming one site is what keeps an unmerged tree from republishing
the others.

```bash
gh workflow run deploy.yml --ref <branch> -f site=<site>
gh run watch "$(gh run list --workflow=deploy.yml --branch=<branch> \
  --limit 1 --json databaseId --jq '.[0].databaseId')"
```

Confirm in the run's own job list that the other sites' jobs were **skipped**,
not merely green. That is the assertion — the picker held — and it is the one
thing a failed reading of it costs a live site.

## Step 4 — Settle Pages on the receiving repository

**The push usually does this by itself.** GitHub takes a pushed `gh-pages` as the
source, reads the domain off `CNAME` and has the certificate approved before
anything asks, so the first call below answers `409 already enabled` and only the
second is needed. Run both anyway: the first is there for a receiving repository
that does not self-enable, and a 409 is an answer rather than a failure.

```bash
gh api -X POST repos/<owner>/<domain>/pages \
  -f 'source[branch]=gh-pages' -f 'source[path]=/'      # 409 when self-enabled
gh api -X PUT repos/<owner>/<domain>/pages -F https_enforced=true
```

Read the config back when either surprises you — `source.branch`, `cname` and
`https_certificate` say which of the two states you are in.

## Step 5 — Verify what is served

Against the live URL, never against the source: the build that produced the page
is the thing under test, so reading the tree only confirms the input.

- `https://<domain>` answers 200, `https://www.<domain>` and `http://<domain>`
  both 301 onto it.
- The served HTML carries **this** site's title, description and card image —
  the failure a shared `src/` makes possible is one site publishing under the
  other's domain, and it looks like a working site.
- The body copy reaches its last line, and anything the branch changed about how
  it renders is there in the markup.
- Assets and the 404 page answer — `.nojekyll` missing strips Next's `_next/`
  directory, and the page comes up unstyled rather than broken.
- **Every site already published from here still serves its own content.**

## Traps

- **A 404 on the new domain is `CNAME` not reaching the branch**, or DNS that has
  not propagated. The publish script asserts on `CNAME` and `.nojekyll` before
  pushing, so propagation is the likelier of the two.
- **The new domain serving an existing site** means the apex records point
  somewhere else entirely — that is DNS, not the build.
- **The picker exists on the branch that added it, not on the base.** GitHub's
  run-workflow form reads its input list off the default branch, so a site the
  form cannot offer falls back to the default and publishes everything. Dispatch
  from the CLI, where `-f site=` is passed whatever the form knows.
