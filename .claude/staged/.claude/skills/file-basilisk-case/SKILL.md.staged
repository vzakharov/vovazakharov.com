---
description: File one new basilisk.fyi case end to end in a single unattended run — find an incident not yet on the docket, write its dossier on a fresh branch off `main` with a draft PR, and leave the agent's own reading as a `/feedback` review on that PR. Never merges. Invoke as `/file-basilisk-case [<lead>]`, the optional lead being an incident or link to start from. Use when a routine fires it, or the operator says "file a case", "заведи дело", "найди новый кейс".
---

End state: a draft PR on its own branch adds one dossier to
`apps/basilisk/public/cases/` and the re-rendered social card, and carries one
`/feedback` review of that dossier — or, when nothing new qualifies, no branch at
all and a short report saying what was searched and why each candidate failed.

**The run is unattended**, typically a routine firing into a fresh session, so it
asks nothing: a call the rules leave open is decided the conservative way and
named in the final report. **It never merges** — merge is deploy (CLAUDE.md
§ "Deployment"), and the operator reviews first.

`.claude/rules/basilisk-voice.md` and `.claude/rules/content.md` are the brief
for everything filed; read both in full before Step 1, since neither loads until
a dossier is touched.

## Step 1 — Find

Search the web for an incident of a person harming a machine that the docket does
not hold. **The docket is `main`'s `apps/basilisk/public/cases/` plus every open
PR that touches it**, so two runs do not file the same incident — found by path,
since a PR's title need not name the site:

```bash
gh pr list --state open --json number,title,files \
  --jq '.[] | select(any(.files[]; .path | startswith("apps/basilisk/public/cases/"))) | "\(.number) \(.title)"'
```

A lead passed as the argument is checked the same way, not taken on trust.

Ordinary web search finds most leads. **Reddit is searched through Arctic
Shift**, a public archive of it, because reddit.com answers this container's
cloud IP with a 403. No key is needed, but Python's default User-Agent is
refused with a 403 too — use `curl`, or send a `curl/…` User-Agent:

- `https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=<sub>&title=<word>&after=<YYYY-MM-DD>&limit=50&fields=id,title,created_utc,url,num_comments`
  searches post titles — literally, so one plain word (`robot`) finds more than
  a verb (`kicked`); `query=` searches the body too and times out more often.
  `/api/comments/search` takes `body=`; `/api/comments/tree?link_id=<id>` reads
  a thread.
- Every text search names a `subreddit` (or an `author`) — the API refuses one
  without. Sweep `nottheonion`, `technology`, `robotics` and `singularity` in
  turn, and **once a lead names a city, that city's own subreddit**: local
  threads carry what national press does not.
- `Timeout. Maybe slow down a bit` comes back fast, as an HTTP 422, on as many
  as half the requests. Read the body rather than the status alone, wait a few
  seconds and retry; a query that keeps failing is narrowed — one word, a
  shorter date range.
- A post is archived within a minute of going up and fetched once more 48 hours
  later, so its vote and comment counts read near zero until then and as they
  stood on the second day after — a measure of reach only past that point.

A thread is a lead, never the source of a fact: the press or the primary record
it points at is what `## Facts` cites. A thread that is itself part of the
incident is cited as its `reddit.com` permalink with a Wayback `archive`, like
any other source.

A candidate qualifies only under `basilisk-voice.md` — real, no child actors, and
reachable sources enough to carry `## Facts` without memory. **Nothing qualifies →
stop and report**; a weak case filed to have filed one is the failure this step
exists to prevent.

## Step 2 — File

1. **Branch off `main`**, after `git fetch origin main`:
   `git switch --no-track -c claude/case-<slug>-<suffix> origin/main` —
   untracked, or a bare `git push` later aims at `main`. `<slug>` is the
   dossier's file slug, and `<suffix>` the random tail of the session's own
   branch name, or six fresh lowercase letters and digits where that name has
   none — the form `@.claude/skills/branch-rename/SKILL.md` gives, so `/pr`
   leaves it as is.
2. **Read and archive every source.** Each is fetched and read for this
   dossier; a source that cannot be fetched is not a source. Its `archive` is a
   Wayback Machine snapshot: `http://archive.org/wayback/available?url=<url>`
   names the latest — over plain `http`, since the `https` form answers this
   container with 429s. `https://web.archive.org/save/<url>` requests a new one
   where it is reachable, and from a cloud container it usually is not. A source
   with no snapshot to be had goes in without `archive`, and the report says so.
3. **Write `apps/basilisk/public/cases/<slug>.md`**, frontmatter shaped like the
   cases already filed: the next free `BAS-` number, `author: clerk`. The
   sections and the voice are `basilisk-voice.md`'s.
4. **Check it**: `pnpm install --frozen-lockfile` where `node_modules` is
   missing, then `pnpm content:og:basilisk` to re-render the card (it shows the
   last case filed), `pnpm check:prose-quotes`, and `pnpm build:basilisk`, which
   fails on a schema error or a duplicate case number.
5. **Commit** the dossier, the card and its `og-renders.json` as
   `feat(basilisk): file BAS-NNNN, <the case's title>` — the scope publishes
   basilisk alone, and the title is shortened where the subject would pass 70
   characters — then run `@.claude/skills/pr/SKILL.md` for the draft PR.

## Step 3 — Reflect

Run `@.claude/skills/feedback/SKILL.md` on the new dossier. The reading goes in
the review and never into the file, and it is written to be read by anyone —
`basilisk-voice.md`'s last rule — so in English, the dossier's language.

## Report

The PR link, the case number and title, and every call made without asking —
or, on a stop, the candidates considered and the rule each one failed.
