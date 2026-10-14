---
description: Review u/vzakharov's Reddit comments of the last few days in one unattended run — how the settled ones did and why, replies waiting for an answer, the readers Reddit sent to the sites and muthur, and which comment wants to become an article, an idea or a case — written as a dated digest beside a living playbook it revises. Comments only, never posts, and it never posts anything. Invoke as `/reddit-digest`. Use when its daily routine fires it, or the operator says "reddit digest", "разбери мои комменты", "что там на реддите".
---

End state: the digest draft PR carries `writing/reddit/digests/<today>.md` and
whatever the run revised in `writing/reddit/playbook.md`, and the report says
the one thing worth doing today.

**The run is unattended**, typically its routine firing into a fresh session, so
it asks nothing: a call left open is made the conservative way and named in the
report. **It advises and never acts on Reddit** — reddit.com answers this
container with a 403, and the voice is the operator's. It files nothing
elsewhere either: a case, an article or an idea is proposed in the digest, for
the operator to start. **It never merges.**

**The digest is English** (CLAUDE.md § "Language": the operator reads it to
decide something), the operator's and others' comments quoted in their own
language; the report is Russian. `.claude/rules/content.md` § "Punctuation
around quotes" holds for both files.

## Step 1 — Get onto the digest branch

The digest PR is any open **draft** that touches `writing/reddit/`, found by
path, since its title need not say so:

```bash
gh pr list --state open --json number,isDraft,files \
  --jq '.[] | select(.isDraft and any(.files[]; .path | startswith("writing/reddit/"))) | .number'
```

- **One** → `gh pr checkout <number>`.
- **Several** → the oldest, by number; the report names the rest.
- **None** → `git fetch origin main` and
  `git switch --no-track -c claude/reddit-<suffix> origin/main`, `<suffix>` the
  random tail of the session's own branch name, or six fresh lowercase letters
  and digits where it has none.

## Step 2 — Read, then fetch

Read `writing/reddit/playbook.md` in full first: the digest judges against it,
and Step 4 revises it. Then the latest digest under `writing/reddit/digests/`,
for what it advised and what it said to watch.

Then `pnpm reddit:digest > tmp/reddit-digest.json` — a few minutes, most of it
Arctic Shift's rate limit — and read the JSON. `scripts/reddit-digest.ts`'s
header says what each part is. Two things it leaves to judgement:

- **Only comments in AI subs are judged** — subs about models, agents and the
  tools around them. The rest get one line in the digest, a count, since the
  playbook's evidence is the AI subs' and nothing in them is the work's.
- **`settled: false` in `settled` means Arctic Shift has not re-fetched it
  yet**: its score is the first minute's. Such a comment is listed, not judged,
  and the next digest picks it up.

A fetch that fails is the run's failure: report it, with the error, and commit
nothing. A digest written from half the data reads as a whole one.

## Step 3 — Write the digest

`writing/reddit/digests/<YYYY-MM-DD>.md`, today's UTC date, headed
`# Reddit digest — <date>`, then these sections in this order, each left out
when it has nothing:

1. **Today** — one line: the single most useful thing to do, usually the reply
   most worth answering or the ammo most likely to be needed.
2. **Settled** — each judged comment as one bullet: score, the sub, lag after
   the post (`4 min`, `6 h`), nesting, the post's title and comment count, a
   link, then a verdict against the playbook naming the rule it confirms or
   breaks. Strongest first. Replies under the operator's own post
   (`post.ownPost`) are one bullet per post — count, score range, the outliers
   quoted — since the playbook judges them as a thread, not one by one.
3. **Waiting on you** — each unanswered reply in an AI sub: who, its score, a
   link, the reply quoted short, and the angle an answer could take. A reply
   that asks nothing — a joke, a thanks, an insult — is left out, and the count
   left out says so in one line. The list covers every thread the window's
   comments sit in, so a reply days older than the window can surface; its age
   goes in the bullet.
4. **Readers** — per site, the Reddit visits per day and the entry pages, each
   with the link comments the JSON pairs with it; muthur's Reddit referrers and
   daily views. One line of reading: which link comment, if any, a day's spike
   follows.
5. **Close the loop** — proposals only: a comment that earned votes → a
   candidate agentic.bible article or a `writing/late-stage-agentic/ideas/`
   paragraph; one that sank on substance → the article that would argue it
   properly; an incident seen in a thread → a `/file-basilisk-case` lead with
   its link. Check the sites' existing pages first, so a proposal is never
   something already published.
6. **Ammo changes** — a pain the window's threads raised that § "Ammo" lacks, or
   an entry whose page or line the window showed wrong.

**Angles and facts, never a ready comment.** The ammo's sample line is the
furthest the run goes toward words for the operator to post.

## Step 4 — Revise the playbook

A rule the window confirms gains nothing — one data point in agreement is not
news. A rule the window contradicts with a clear case, or a pattern seen again
that no rule names, is rewritten in place with its evidence, and § "Revisions"
gains one line at the top: the date, what changed, the evidence. **The rule is
what changes**, never only the log: a run reads the rules, and a log line
contradicting a rule it does not touch is a playbook that says two things.

§ "Open hypotheses" is checked each run: one whose settling condition is met
becomes a rule or is struck, with its Revisions line. § "Revisions" keeps its
ten latest lines; older ones fold, a month to a line.

## Step 5 — Commit, push, report

Commit both files as `content(reddit): digest <date>` — `content` publishes
nothing (CLAUDE.md § "Deployment") — and push. Where the branch has no PR, run
`@.claude/skills/pr/SKILL.md`.

The report is Russian and short, since the routine's push notification carries
it: the digest's **Today** line first, then a line each for the counts (judged,
waiting, Reddit visits yesterday) and the playbook's revisions, then the
digest's path and the PR link.
