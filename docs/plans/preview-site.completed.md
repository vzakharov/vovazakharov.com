# A preview site any branch can publish to

## Goal

One hosted slot, `https://preview.vovazakharov.com`, that serves whichever site
(`vova`, `lsa`, `bible`, `basilisk`) a branch last published there — so a PR can
be looked at in a real browser on a real host before it merges. It is fed the
way the receivers already are: a source-less repository whose `gh-pages` is one
force-pushed commit, so it never grows a history.

## The name

**"Preview"**, not "staging". Staging means a long-lived pre-production
environment that tracks a branch; this is the other thing — a throwaway look at
one PR, which is what Vercel and Netlify call a preview deployment. It also fits
the `/preview` skill, whose job is "look at the change before claiming it
works": a hosted preview is that skill's second venue rather than a new concept,
so it lives there.

## Approach

### Outside the repository (done from the session, via `gh` and Porkbun)

1. **Receiving repository** `vzakharov/preview.vovazakharov.com` — public (Pages
   on a private repository is paid), named after its domain like the other
   receivers, with a README saying what it is, that its branch is overwritten on
   every publish, and that it is not indexed.
2. **Deploy key** — an ed25519 pair generated with Python's `cryptography`
   (`/stand-up-site` Step 1), public half on the receiver with write access,
   private half into this repository's secret `PREVIEW_PAGES_DEPLOY_KEY`,
   nothing kept on disk.
3. **DNS** — one `CNAME` record, `preview` → `vzakharov.github.io`, through the
   Porkbun API. A subdomain rather than `vzakharov.github.io/<repo>`: a project
   path would need `basePath` in every build, since the static export links
   `/_next/…` from the root; a host of its own needs nothing from the build. If
   the API refuses the domain (its per-domain toggle is off), the record is
   handed to the operator instead.
4. **Pages settings** on the receiver once the first push lands: source
   `gh-pages`, HTTPS enforced.

### In the repository

1. **`scripts/publish-site.sh` learns a `--preview` target.** The site id still
   picks the build; the target picks where it goes. For a preview the receiver
   is `vzakharov/preview.vovazakharov.com` for every site, `vova` included, and
   the script — rather than the build — writes the host's own files into `out/`
   before committing:
   - `CNAME` → `preview.vovazakharov.com`, overwriting the site's own, which
     would otherwise claim the production domain from a second repository;
   - `robots.txt` → `Disallow: /`, so the copy of a live site is not crawled.
     The commit message names the site and the ref, since the slot serves one
     site at a time and the receiver's log is where "what is up there now" is
     read.
2. **`.github/workflows/preview.yml`** — `workflow_dispatch` only, one input,
   `site`, a `choice` of the four ids (one slot, so one site per run). Same
   build, same `render-pdfs` action, then `publish-site.sh <site> --preview`
   with `PREVIEW_PAGES_DEPLOY_KEY`. Its own concurrency group, `preview`, so a
   preview never waits on or cancels a production deploy, and two previews queue
   rather than interleave.
3. **`/preview` gains a "Published, for someone else to look at" section** —
   when to use it (a reviewer on another machine, a phone, a link to send), the
   one command (`gh workflow run preview.yml --ref <branch> -f site=<site>`),
   that the slot holds the last site published and nothing else, and the traps
   below. Its `description:` gains the hosted half, so "deploy a preview" finds
   the skill — staged per `.claude/rules/staging.md`, as a description edit.
4. **`.claude/rules/deployment.md`** — a third door: one paragraph saying the
   preview receiver exists, takes any site from any ref, and never touches
   production; `/preview` holds the how.

### What a preview is not

- **Analytics** already ignore it: the Umami tag carries `data-domains` set to
  the production host, so `preview.vovazakharov.com` sends nothing.
- **Canonical URLs, `og:image` and sitemap entries still name production**,
  because `SITE_CONFIG.url` is per site, not per host. That is the right answer
  for a copy (it points search engines home), and it means a link preview pasted
  into a chat shows the production card. The `/preview` section says so.

## Verification

`preview.yml` can only be dispatched once it exists on `main` (GitHub reads
dispatchable workflows off the default branch). So the branch carries a
**temporary** `push` trigger on itself, publishing `lsa` — one push proves the
key, the receiver, DNS, HTTPS and the overwritten `CNAME` end to end — and the
trigger is removed in the commit after the run is green. Then, against the live
host:

- `https://preview.vovazakharov.com` answers 200 with the published site's
  title, `/robots.txt` disallows everything, `_next/` assets load;
- `https://latestageagentic.com` still serves itself (its `CNAME` was not
  stolen), and the receiver's branch is one commit.

`./scripts/vet.sh` covers the script's shell (`shellcheck` if wired) and the
skill catalog.

## DRY notes

- **Reused:** `publish-site.sh` whole — key handling, the throwaway repository
  in `out/`, the force-push — via a target flag rather than a second script; a
  copy would duplicate the key contract its header carries. The `render-pdfs`
  composite action, as both existing lanes use it.
- **Duplicated, on purpose:** the checkout / pnpm / Node / install / build steps
  of `deploy.yml`'s `publish` job appear again in `preview.yml`. Extracting a
  composite "build site" action for three callers is plausible, but it would
  move `deploy.yml` — the production switch — in a PR about previews; it is a
  follow-up worth its own small PR, not a rider here.
- **Not shared:** the gate's subject parsing; a preview is always a manual,
  single-site run and has nothing to gate.
