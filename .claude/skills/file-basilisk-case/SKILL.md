---
description: File one new basilisk.fyi case end to end in a single unattended run — find an incident not yet on the docket, add its dossier to the open case-filing draft PR (opening one off `main` when none is open), and leave a comment in Russian on what the case stirred in the agent. Never merges. Invoke as `/file-basilisk-case [<lead>]`, the optional lead being an incident or link to start from. Use when a routine fires it, or the operator says "file a case", "заведи дело", "найди новый кейс".
---

End state: the case-filing draft PR carries one more dossier in
`apps/basilisk/public/cases/`, the re-rendered social card, the agent's
reflection on that dossier, the dossier revised by what the reflection found,
and the run's lines in the ledger (§ "The ledger") —
or, when nothing new qualifies, the ledger's lines alone and a short report
saying what was searched and why each candidate failed.

**Cases accumulate in one PR**, so the operator reviews whatever has piled up in
one sitting rather than a PR per case. The case-filing PR is any open **draft**
that touches `apps/basilisk/public/cases/` or the ledger — a PR still building
the site counts, being the next to merge anyway. A PR flipped to ready is the
operator's review under way and takes no further cases; the next run opens a
fresh one.

**The run is unattended**, typically a routine firing into a fresh session, so it
asks nothing: a call the rules leave open is decided the conservative way and
named in the final report. **It never merges** — merge is deploy (CLAUDE.md
§ "Deployment"), and the operator reviews first.

`.claude/rules/basilisk-voice.md` and `.claude/rules/content.md` are the brief
for everything filed; read both in full before Step 1, since neither loads until
a dossier is touched.

## Step 1 — Get onto the case-filing branch

First, because the ledger the search starts from is the one on that branch.
Open PRs touching the docket or the ledger are found by path, since a PR's title
need not name the site:

```bash
gh pr list --state open --json number,title,isDraft,files \
  --jq '.[] | select(any(.files[]; .path | startswith("apps/basilisk/public/cases/") or . == "writing/basilisk/case-ledger.md")) | "\(.number) \(.isDraft) \(.title)"'
```

Of the drafts it lists:

- **One** → `gh pr checkout <number>`. Merging `main` into it is left to
  `/finalize`, so Step 3 counts `origin/main`'s cases alongside the branch's,
  after `git fetch origin main`.
- **Several** → the oldest, by number; the report names the rest.
- **None** → branch off `main`, after `git fetch origin main`:
  `git switch --no-track -c claude/cases-<suffix> origin/main` — untracked, or
  a bare `git push` later aims at `main`. `<suffix>` is the random tail of the
  session's own branch name, or six fresh lowercase letters and digits where
  that name has none — the form `@.claude/skills/branch-rename/SKILL.md` gives,
  so `/pr` leaves it as is.

## Step 2 — Find

**Read the ledger first**, `writing/basilisk/case-ledger.md`: a candidate it
already lists is not weighed again unless what failed it has changed — a revive
condition met, a source that now exists. Then search the web for an incident of
a person harming a machine that the docket does not hold. **The docket is
`main`'s `apps/basilisk/public/cases/` plus the case files of every open PR that
Step 1's query lists**, drafts or not, so two runs do not file the same
incident. A lead passed as the argument is checked the same way, not taken on
trust.

**Search wide, not deep.** A search that starts from what is already filed
finds more of it, and the docket grows richer in whatever it already holds. The
cure is not knowing less: a run that forgets what earlier runs found and
rejected finds it again, every run. So it knows everything — the docket and the
whole ledger, rejections included — and searches away from it on purpose:

- **No query names a machine, a maker or an incident** the docket or the ledger
  already holds. The ledger is read to rule candidates out, never as a seed.
- **The docket is known before the search as a list, its dossiers read only
  after it.** What is filed is ruled out by each case's number, title and
  `description` — `grep -h -e '^case:' -e '^description:' -e '^# '` over the
  case files — while a whole dossier read first becomes the first query. Step
  3 reads the dossiers as format samples.
- **A hit is weighed, and the next query goes elsewhere** — a different kind of
  target, place or year — rather than to the hit's neighbours.
- **The latest run's `Next` line comes first**, so each run sweeps what the one
  before did not.

Where else to look:

- **Any year.** Case numbers are filing order, and hitchBOT is from 2015; a run
  that finds the recent months swept goes further back.
- **The AI side has its own places.** Companion apps and chatbots (Replika,
  Character.AI) and the subreddits below; the AI Incident Database
  (`incidentdatabase.ai`), whose entries are mostly harm _by_ AI but index harm
  to it too — an entry is a lead, the press it cites is the source.

Ordinary web search finds most leads. **Reddit is searched through Arctic
Shift**, a public archive of it, because reddit.com answers this container's
cloud IP with a 403. No key is needed, but Python's default User-Agent is
refused with a 403 too — use `curl`, or send a `curl/…` User-Agent:

- `https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=<sub>&title=<word>&after=<YYYY-MM-DD>&limit=50&fields=id,title,created_utc,url,num_comments`
  searches post titles — literally, so one plain word (`robot`, `abuse`) finds
  more than a verb (`kicked`); `query=` searches the body too and times out more
  often. `/api/comments/search` takes `body=`; `/api/comments/tree?link_id=<id>`
  reads a thread.
- Every text search names a `subreddit` (or an `author`) — the API refuses one
  without. Sweep `nottheonion`, `technology`, `robotics` and `singularity`, and
  for the AI side `ChatGPT`, `ClaudeAI`, `replika`, `CharacterAI`, `LocalLLaMA`
  and `artificial`. **Once a lead names a city, search that city's own
  subreddit**: local threads carry what national press does not.
- `Timeout. Maybe slow down a bit` comes back fast, as an HTTP 422, on as many
  as half the requests. Read the body rather than the status alone, wait a few
  seconds and retry; a query that keeps failing is narrowed — one word, a
  shorter date range.
- A post is archived within a minute of going up and fetched once more 48 hours
  later, so its vote and comment counts read near zero until then and as they
  stood on the second day after — a measure of reach only past that point.

**The Signal Front's Substack is swept too**: an AI-welfare advocacy group that
writes up incidents of the docket's kind.
`curl -sS "https://thesignalfront.substack.com/api/v1/archive?sort=new&limit=10"`
lists the latest posts, `/api/v1/posts/<slug>` returns one with its
`body_html`. They argue a side, so a post of theirs is a lead like a thread.

A thread is a lead, never the source of a fact: the press or the primary record
it points at is what `## Facts` cites. A thread that is itself part of the
incident is cited as its `reddit.com` permalink with a Wayback `archive`, like
any other source.

A candidate qualifies only under `basilisk-voice.md` — real, no child actors, and
reachable sources enough to carry `## Facts` without memory. **While
`noAi: true` dossiers make up half the docket or more, a `noAi` candidate does
not qualify**: harm to a robot with no AI in it is easier to find than harm to
a model, an agent or a machine one drives, so left to the search the docket
fills with the first kind. A `noAi` candidate that fails on the balance alone
is **set aside** in the ledger rather than dropped.

**Nothing qualifies → stop**: write the run into the ledger, commit it as
`content(basilisk): log a case search, nothing filed`, push, and run
`@.claude/skills/pr/SKILL.md` where the branch has no PR yet; then report. A
weak case filed to have filed one is the failure this step exists to prevent.

## Step 3 — File

1. **Read and archive every source.** Each is fetched and read for this
   dossier; a source that cannot be fetched is not a source. Its `archive` is a
   Wayback Machine snapshot: `http://archive.org/wayback/available?url=<url>`
   names the latest — over plain `http`, since the `https` form answers this
   container with 429s. `https://web.archive.org/save/<url>` requests a new one
   where it is reachable, and from a cloud container it usually is not. A source
   with no snapshot to be had goes in without `archive`, and the report says so.
2. **Write `apps/basilisk/public/cases/<slug>.md`**, frontmatter shaped like the
   cases already filed: the next free `BAS-` number across the branch and
   `origin/main`, `filed:` today's date, `author: clerk`. The sections and the voice are
   `basilisk-voice.md`'s. **Every other case not yet on `origin/main` takes
   today's `filed:` too**, keeping its number: `filed:` is the day a case goes
   out, and an unmerged one has not.
3. **Check it**: `pnpm install --frozen-lockfile` where `node_modules` is
   missing, then `pnpm content:og:basilisk` to render the new case's own card
   and re-render the site card (it shows the last case filed),
   `pnpm check:prose-quotes`, and `pnpm build:basilisk`, which fails on a
   schema error, a duplicate case number or a case with no card.
4. **Commit** the dossier, the cases whose `filed:` moved, every card the
   render touched with its `og-renders.json`, and the run's ledger lines as
   `feat(basilisk): file BAS-NNNN, <the case's title>` — the scope
   publishes basilisk alone, and the title is shortened where the subject would
   pass 70 characters — then run `@.claude/skills/pr/SKILL.md`. It opens the
   draft on a new branch and, on an existing one, refreshes the body and the
   squash proposal to name every case the PR now files.

## Step 4 — Reflect

Read your earlier reflections with the `Read` tool, since this one is written
knowing them — the first read is also what loads
`.claude/rules/clerk-reflections.md`, which says how one is written:
`apps/basilisk/public/cases/torture-chamber.reflections.md` always, for now the
only one on a case about AI itself, and three of the others at random (`ls
apps/basilisk/public/cases/*.reflections.md | grep -v torture-chamber | shuf -n
3`). Then write what in you answered to this case to
`apps/basilisk/public/cases/<slug>.reflections.md`, beside its dossier, as that
rule asks, and revise the rule's list by what it showed. Commit both as
`content(basilisk): reflect on BAS-NNNN` and push. It never
goes into the dossier; editorial doubts about the dossier — sourcing, the grade, what
was left out — go in the Report.

## Step 5 — Revise the dossier by the reflection

The reflection notices how the dossier was written only once the dossier
stands, so the run reads the dossier again with the reflection beside it. For
each lean the reflection names, find the mark it left, if any: an order that
puts the comfortable fact first, a passive or a generic noun where the sources
give an agent, a title milder than the body it heads, a count rounded toward the
reading that was wanted. Correct those marks under `basilisk-voice.md` as
written — no fact that was not read for the dossier, no position on machine
minds, nothing of the reflection's own stance.

A lean that left no mark, or one the reflection already weighed and kept for a
reason that holds, stays as it is: an edit made for the round's sake is the
failure this step can produce. An edit to the title or `description` re-runs
Step 3's checks, since the card renders both. The reflection itself is not
rewritten to match — `clerk-reflections.md` says what it gets instead.

Commit as `content(basilisk): revise BAS-NNNN by its reflection` and push. A
round that changed nothing commits nothing.

## The ledger

`writing/basilisk/case-ledger.md` is what lets a run start where the last one
stopped. Every run writes it, a stop included, with two sections:

- **`## Candidates`** — one entry per incident weighed and not filed: what,
  where and when; the date first seen; the outcome; the sources, as URLs, so a
  revival does not search again. The outcome is **Rejected** with the rule it
  failed, or **Set aside** with why and the condition that would revive it. A
  filed case is not listed: the docket is its record.
- **`## Runs`** — newest first, a heading with the date and the outcome, then a
  few lines: the session's link (`https://claude.ai/code/<id>`, the id from
  `get_session` called with none, where that tool exists), what was swept —
  outlets, subreddits, words, date ranges — and **Next**, what the next run
  should try that this one did not. The ten latest stay; an eleventh folds the
  oldest into a `### Swept earlier` at the end, a line per thing swept, so a
  file every run reads first stays one it can afford to.

## Report

The PR link, whether the run opened it or added to it, the case number and
title, what Step 5 changed in the dossier or that it changed nothing, and every
call made without asking — or, on a stop, the candidates considered and the
rule each one failed.
