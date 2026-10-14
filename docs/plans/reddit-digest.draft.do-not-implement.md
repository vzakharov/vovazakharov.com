> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Reddit digest — a daily routine over u/vzakharov's comments

A routine fires every morning into a fresh session, runs `/reddit-digest`, and
leaves a digest of the day before: how the operator's settled comments did,
which replies wait for an answer, how many readers Reddit sent to each site and
to muthur, and which comment wants to become an article, an idea or a case. What
it learns goes into a playbook the run reads first and revises last, so the
advice is the record's rather than the session's memory.

Comments only: posts cost an order of magnitude more to prepare and mostly stay
at zero on r/ClaudeCode. The routine advises; it never posts — reddit.com
answers the container with a 403, and the voice is the operator's.

## What gets built

1. **`writing/reddit/playbook.md` — the living document.** Seeded from this
   session's analysis (246 comments in other people's threads since 2026-06-07,
   joined to their parent posts; Umami and muthur's GitHub traffic for the
   clicks). Sections:
   - **What earns votes** — the first hour, short deflation, the expert flick
     with a number, the sub's own irritation in a thread that voices it.
   - **What sinks** — preference wars opened first, arguments deep in a thread,
     correcting someone's personal story, a link in a comment.
   - **What brings readers** — a link earns no votes but clicks: the thread
     where someone just suffered what the page cures (`/web-not-cli` under the
     Cursor `rmdir C:\` thread), and profile traffic after a post that lands.
   - **Ammo** — one entry per recurring pain in the subs: the page that answers
     it (muthur file, agentic.bible article, basilisk.fyi case), the fact or
     number to lead with, a one-line example.
   - **Open hypotheses** — what the record does not settle yet, each with what
     would settle it.
   - **Revisions** — newest first, one line per run that changed a rule, with
     the evidence; the ten latest kept, older ones folded into one line each.

   Every rule states its evidence — counts, dates, links — so a run can weigh
   new data against it. A run that sees a rule contradicted rewrites the rule,
   not just the log.

2. **`writing/reddit/digests/<YYYY-MM-DD>.md`** — one per run, English
   (CLAUDE.md § "Language": a doc the operator reads to decide something):
   - **Settled** — comments 48–72 h old, whose votes Arctic Shift has
     re-fetched; each with score, lag after the post, depth, the thread, and a
     one-line verdict against the playbook.
   - **Waiting on you** — replies to the operator's comments of the last 48 h
     that the operator has not answered.
   - **Readers** — yesterday's Reddit-referred visits per site and entry page
     (Umami), muthur's Reddit referrers and views (GitHub traffic), attributed
     to the day's link comments by date and landing page.
   - **Close the loop** — a comment that earned votes → a candidate
     agentic.bible article or `writing/late-stage-agentic/ideas/` paragraph; one
     that sank on substance → an article that argues it; an incident seen in the
     threads → a `/file-basilisk-case` lead. Proposals only; the run files
     nothing.
   - **Ammo changes** — pains seen in the window that the playbook lacks.

3. **`scripts/reddit-digest.ts`** (`pnpm reddit:digest`) — the deterministic
   half, printing JSON: the operator's comments in the settled window with their
   parent posts, unanswered replies, Umami's Reddit-referred sessions per site
   and entry page per day, muthur's traffic. It logs into Umami itself from
   `UMAMI_AGENT_PASSWORD` and never prints the token; every response is parsed
   with zod; Arctic Shift's fast 422 `Timeout` is retried with backoff.
   **`scripts/lib/reddit-digest.ts`** holds the pure part — lag, depth, link
   detection, unanswered-reply detection, attribution of clicks to link comments
   — and **`scripts/lib/reddit-digest.test.ts`** covers it.

4. **`.claude/skills/reddit-digest/SKILL.md`** — the unattended run:
   1. Get onto the digest branch: the open draft PR touching `writing/reddit/`,
      or a fresh `claude/reddit-<suffix>` off `main` — the same shape as
      `/file-basilisk-case` Step 1.
   2. Read the playbook, then run `pnpm reddit:digest`.
   3. Write the digest; revise the playbook where the evidence says so.
   4. Commit as `content(reddit): digest <date>` (`content` does not publish),
      push, `/pr` where the branch has none.
   5. Report in Russian, short — it is what the routine's push notification
      carries: the one thing worth doing today, then the rest.

   It never merges and asks nothing.

5. **Arctic Shift notes** — the API's home stays `/file-basilisk-case` § "Step 2
   — Find"; it gains what this work found: `author=` works on both endpoints,
   and a comment's score reads near zero until the second fetch.

6. **`writing/CLAUDE.md`** — the layout gains `reddit/`, which, like
   `basilisk/`, is no channel and holds no drafts.

7. **The routine** — `create_trigger`, a fresh session per fire in this
   environment, daily at 03:47 UTC (the operator's comments start around 04
   UTC), prompt `/reddit-digest`, push notification on.

8. **Dogfood** — run `/reddit-digest` in this session once the skill is in. Its
   digest and playbook revisions land on this branch, which is by then the open
   draft touching `writing/reddit/`, so later runs add to the same PR until it
   merges.

## Decisions made without the operator (each one a recommendation in force)

- **The digest lives in the repo**, on an accumulating draft PR, rather than in
  Gmail or Notion: the playbook and the digests sit beside the drafts and
  articles they feed, and a run can read what it advised before.
- **Angles and facts, not ready comments.** Ammo carries one example line per
  pain; a digest names the angle. The threads already ask "are you a bot?".
- **03:47 UTC, daily.** Moves with one `update_trigger`.
- **No hourly watcher yet.** The first hour is the window that earns votes, and
  a daily run cannot catch it; whether the ammo makes the operator fast enough
  is the playbook's first open hypothesis.

## DRY notes

- **Arctic Shift's API is documented once**, in `/file-basilisk-case` Step 2;
  `/reddit-digest` points there and the script encodes the calls. Moving the
  notes to a neutral file would mean restaging the root `CLAUDE.md`, which
  points at that section, for no reader who gains from it.
- **"Find the accumulating draft PR by path"** repeats `/file-basilisk-case`
  Step 1's shape with a different path. Extracting a helper for two callers,
  each one `gh pr list` with a different filter, would hide a three-line query
  behind a script both skills then have to explain; duplicated on purpose.
- **Umami login** repeats the five lines in `/stand-up-site` Step 5, in
  TypeScript rather than shell. The skill's snippet is documentation for a
  one-off; the script is the code. Not shared.
- **The pure functions get their own lib file** because the test runner loads
  them without the network half; nothing in `scripts/lib/` already does Reddit
  or Umami.

## Checks

- `pnpm test scripts/lib/reddit-digest.test.ts`.
- `pnpm reddit:digest` against the live APIs, its JSON read by eye.
- The dogfood run's digest, read by the operator.
- `./scripts/vet.sh` at `/finalize`.
