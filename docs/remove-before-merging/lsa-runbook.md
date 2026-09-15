# Standing up latestageagentic.com

Everything that has to happen once, outside the code, for the second site to
come up — and who does each part. It lives here because it is all pre-merge or
first-deploy work: the tree sweeps this directory at the squash, and by then
every step below has either run or is moot.

## Done already — the agent's half

None of it is code and all of it is `gh`, so the implementing session ran it
rather than writing it down for someone else:

- `vzakharov/latestageagentic.com` exists, public, holding nothing but the
  README that says what it is. Public because Pages on a private repository is
  a paid-plan feature.
- An ed25519 deploy key is installed on it with write access, its private half
  set as the `LSA_PAGES_DEPLOY_KEY` secret here. `scripts/publish-lsa.sh`'s
  header carries what the key is for and how to rotate it — which is the only
  way back, the private half having never been printed.

## Yours — three steps, and only three

Two at your registrar, because neither has an API this repository can reach,
and the merge, which is yours either way. The receiving repository's own Pages
settings are not among them: its **Source** dropdown is `gh`-settable, and is
the last section below rather than this one.

**1. Own the domain.** `latestageagentic.com` has to be registered to you
somewhere. If it is not, nothing else works.

**2. Point it at GitHub**, against the records Porkbun holds on it today.

**Delete two**, both of them the parking page:

| Type  | Host                     | Value               |
| ----- | ------------------------ | ------------------- |
| ALIAS | `latestageagentic.com`   | `uixie.porkbun.com` |
| CNAME | `*.latestageagentic.com` | `uixie.porkbun.com` |

The ALIAS sits on the apex, which is where GitHub's own addresses go, so the
two cannot both be there. The wildcard goes for its own reason: it answers for
every subdomain, `www` among them, and would send it to the parking page.

**Add nine** — one record per value, so four A rows, four AAAA rows and one
CNAME:

| Type  | Host  | Value                                                                                   |
| ----- | ----- | --------------------------------------------------------------------------------------- |
| A     | `@`   | `185.199.108.153` `185.199.109.153` `185.199.110.153` `185.199.111.153`                 |
| AAAA  | `@`   | `2606:50c0:8000::153` `2606:50c0:8001::153` `2606:50c0:8002::153` `2606:50c0:8003::153` |
| CNAME | `www` | `vzakharov.github.io`                                                                   |

These are GitHub's shared Pages addresses — the same ones `vovazakharov.com`
already resolves to. Which repository answers is decided by the `CNAME` file
inside each published branch, which is why that file is part of the build.

**Edit nothing.** The two `MX` rows and the `v=spf1` `TXT` are mail forwarding
and never enter a web request; the two `_acme-challenge` `TXT` rows are
Porkbun's certificate proof, and GitHub issues its certificate through a
challenge of its own rather than reading those.

**3. Merge with a subject that publishes** — `feat:` or `feat(lsa):` — since
the gate skips the build for anything else, and the first deploy is what the
last step waits on.

## After the first deploy — the agent again

The first publish is what creates `gh-pages`, and Pages cannot be aimed at a
branch that does not exist yet. So, once the workflow has run green:

```bash
gh api -X POST repos/vzakharov/latestageagentic.com/pages \
  -f 'source[branch]=gh-pages' -f 'source[path]=/'

# Once GitHub has issued the certificate for the domain it reads off the
# CNAME file, usually about fifteen minutes later.
gh api -X PUT repos/vzakharov/latestageagentic.com/pages -F https_enforced=true
curl -sI https://latestageagentic.com | head -1        # expect 200
```

**If it serves a 404**, the `CNAME` file did not reach the branch — but the
publish script asserts on that before pushing, so the likelier cause is DNS
that has not propagated. **If it serves `vovazakharov.com`**, the apex records
point somewhere else entirely.
