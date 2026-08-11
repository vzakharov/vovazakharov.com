# Plan: Playgram resume entry + case study

**Status:** ready to implement. Written to be executed from a cold session with no prior context.
**Branch:** `claude/playgramapp-resume-case-study-exozpz`

## 0. What this is

Five months of work on `Playgramai/playgramapp` (private) is currently suspended for lack of
funding, with Vova staying on part-time for ongoing issues. The work is worth putting on the
record.

**What Playgram is:** a multi-model AI chat platform for teams, serving `app.playgram.ai`. Team
workspaces with project-level roles and invitations, chat across many LLM providers through a
single LiteLLM proxy, file handling, vector search and persistent memory over Weaviate,
deep-research runs, an editable canvas with PDF export, voice input, and Stripe billing.

**The spine of the story: this is a rebuild.** The app was migrated off Bubble.io onto
Next.js, and the cutover is complete — Bubble is retired and frozen as an archive. A no-code
platform replaced by a production TypeScript codebase in five months, by one person directing
an agent, is a sharper and more unusual claim than "built an AI app", and the case study
should be built around it.

Stack: Next.js App Router (Feature-Sliced Design layering, BFF pattern), TypeScript, Mantine
v8 + SCSS modules, Supabase (Postgres + Auth), Drizzle ORM with `drizzle-zod`, LiteLLM,
Weaviate, Bunny CDN, Stripe, Deepgram, Railway + GitHub Actions, Vitest + Playwright.

Two public artifacts come out of this:

1. **A new CV entry** — added above the existing ones, which stay as they are.
2. **A case study page** on vovazakharov.com — the project timeline _and_ the lessons
   learned, including the meta-lessons about running an agent-driven codebase.

**The authorship numbers.** Vova's share of the codebase is **~88–92%** depending on which
metric you pick. Publish a specific figure with its denominator rather than a qualitative
"almost all" — the specificity is what makes it credible, and every row below is checkable
against the git history.

**As of HEAD `9b8c9a927`, recomputed 2026-08-11** (see §2 — recompute before publishing, and
put the as-of date on the page):

| Metric                                 | Vova's share               |
| -------------------------------------- | -------------------------- |
| Commits authored (of 1,510)            | **92.32%** (1,394)         |
| Lines added, excluding generated files | 91.74% (602,484 / 656,722) |
| Net lines added−removed                | 87.95% (288,071 / 327,525) |
| PRs authored (of 1,222)                | 89.69% (1,096)             |
| Merged PRs authored (of 1,036)         | 89.09% (923)               |
| Other humans' merged PRs he merged     | **112 of 113**             |

**Attribution note, confirmed with Vova:** the 37 commits authored by
`Claude <noreply@anthropic.com>` and the 3 by `Cursor Agent` are **his** — agent runs he
directed where the harness wrote itself into the author field instead of the co-author trailer.
They are ad-hoc misattribution, not third-party contributions, and the figures above fold them
in.

Net lines is the least flattering row and worth understanding rather than dropping: the
agent-authored commits were net **deletions** (−705 and −1,630), so folding them in lowers the
net share slightly while raising the commit share. The stable fact underneath, unchanged by any
attribution choice: **the other three engineers account for ~12% of net lines** (+39,454).

Two things worth stating rather than smoothing over:

1. **The other three engineers did real work** — 116 commits, 113 merged PRs, +39,454 net
   lines (12.05% of net), including DB migrations and the subscription surface. Not cosmetics.
   They also joined earlier than remembered: May 1–11, so they were present for three of the
   five months, not the final one or two.
2. **Essentially all of it was AI-assisted, by everyone.** Confirmed with Vova: a missing
   `Co-authored-by` trailer does not mean a commit was hand-written — it means the trailer was
   dropped, or a different tool was used. So do **not** publish the trailer rates (84.6% for
   Vova, 85.2% for the others) as if they measured AI involvement; they measure tooling
   discipline. 185 of Vova's own commits carry no trailer at all, discipline was weakest in
   April–May, and 84.6% is a floor, not a measurement. The defensible claim is qualitative:
   the agent-assisted workflow was the team's, not one person's, and no one on the project was
   working any other way.

Which points at the _actual_ distinctive claim, and it is a better one than the percentage:
**what is uniquely his is the machine the whole team shipped through** — all 33 skills, the
116 revisions of `CLAUDE.md`, the 27 project-local ESLint rules, and the `vet` gate. Everyone
on the project was agent-assisted; one person built the harness that made that safe. Lead with
that, support it with ~92% authorship, and let the review record carry the rest. See §6.

## 1. Decisions already locked

Do not re-litigate these; they came from the project owner.

| Question                       | Decision                                                                                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Disclosure                     | **Full.** The founder has approved naming Playgram, describing the architecture, and publishing individual code snippets. Not the whole codebase.        |
| Artifacts                      | Dossier (committed to this repo, but no page renders it) + CV entry + case study page.                                                                   |
| Standalone agentic-infra essay | **Out of scope for now.** The meta-lessons go into the case study as a section (§4, part D). A Substack version can be spun out later from that section. |
| i18n                           | CV entry: **both `en` and `ru`**. Case study: **English only**, consistent with `app/HomePage.tsx`, which is not localized.                              |

## 2. Sources: read the actual repo

**This is the part of the plan that changed.** The earlier version was built around a
constraint that no longer exists: the session that wrote it could not reach `playgramapp`, so
it commissioned a dossier from a session rooted there and worked from that summary, unable to
check a single claim. `.claude/hooks/session-start.sh` now installs a `gh` shim that routes the
GitHub CLI around the egress proxy, and `GH_TOKEN` is in the environment. **Clone the repo and
read it.**

```bash
cd "$SCRATCHPAD"   # not into this repo's tree
env -u HTTPS_PROXY -u https_proxy \
  git clone https://x-access-token:${GH_TOKEN}@github.com/Playgramai/playgramapp.git
```

The clone is full, not shallow (~440 MB of `.git`), so every history command works without
`--unshallow`. `gh api graphql` works for PR/issue/review data. Verified working on 2026-08-11.

### The dossier is now an index, not a source

`docs/playgram-dossier.md` (1,910 lines, tracked, in `.prettierignore`) stays useful: it is a
good map of where things are, and its §3 timeline, §5 decision record, §6 schema arcs and §8
snippets are the fastest way to find what to look at. It lives in `docs/`, deliberately **not**
in `docs/plans/`, because `/implement` globs `docs/plans/*.md` and expects one file.

But its status has changed. It was written as the only source for a repo nobody could open;
now it is a five-months-late secondary summary of a repo you have in front of you. **Verify
every figure and every gloss against the clone before it goes on a page.** A verification pass
on 2026-08-11 found the computed numbers overwhelmingly sound and several claims wrong — the
list is below, and it is not exhaustive.

Its §10 (publication risks) is still the right checklist to read before quoting code, and R1
and R2 were both re-verified as real (see §6 note 8).

### Corrections found in verification — do not re-inherit these

1. **The review claim is mis-stated, and the naive query contradicts it.** The dossier says "no
   PR in this repo was ever reviewed by anyone except Vova" and reports 0 non-Vova reviewers.
   A GraphQL sweep of all 1,222 PRs returns **10 PRs carrying a review event from someone other
   than `vzakharov`** — from all three teammates. Every one is the PR's **own author replying
   to Vova's inline comments**: GitHub records a threaded reply as a review event with an empty
   body, minutes to hours after Vova's review, by the author themself. So the substance holds
   but the phrasing does not. Publish: **nobody ever reviewed anyone else's PR except Vova** —
   and when recomputing, exclude review events whose author is the PR author.
2. **The RLS story is the opposite of what it looks like — and it is a better story.** The plan
   used to offer "RLS on every table with zero policies (deny-by-default, enforced by a custom
   `playgram/enforce-rls` rule, and the _second_ migration in the repo)" as a designed decision.
   The code is exactly that. But `docs/decisions/auth-and-tenancy.md` — the doc that owns the
   decision — records **"Decided: Option B — RLS as a safety net"**: per-table policies,
   `SET LOCAL app.current_org_id` inside transactions, a `withOrgContext` wrapper, fail-closed
   on missing context, a seatbelt analogy. There are **zero `CREATE POLICY` statements anywhere
   in the repo**, and `DECISIONS_SUMMARY.md` still indexes the abandoned version. The doc also
   still says `organization_id` and `memberships`, so it predates the `d828289e5` rename
   (2026-03-17) and was never revisited.
   So: the shipped design is sound and consistently documented in `README.md`,
   `docs/codebase-guardrails.md`, `.claude/rules/database.md` and the lint rule — everywhere
   except the decision record. Write the drift, not the design. See §4 part D, which is where
   it now belongs.
3. **`pnpm vet` runs 14 parallel checks, not 13.** Count them in `package.json`: `typecheck`,
   `format:fix`, `lint:fix`, `lint:fsd`, `lint:css:fix`, `poison-check`, `deps`, `ast-metrics`,
   `knip`, `type-overlap`, `db:chain-check`, `license-check`, `security-diff`, `test` — after a
   sequential `typegen`. The dossier says 13 in two places.
4. **`.claude/rules/` holds 9 files, not 10.** The dossier's own §0.2 file tree lists 9; its
   §4.1 and §2.2 say 10. `etl.md` was retired with the ETL (`4e98b4952`), which is where the
   tenth went.
5. **114 migrations, not 115.** There are 115 `.sql` files in `drizzle/` but only 114 journal
   entries (`0000`–`0113`). The 115th is `rollback-cut-12.sql`, a hand-written rollback script,
   not a migration — and it is interesting in its own right (§4 part B).
6. **52 `release:` commits on `main`, not 50.** One subject appears twice: `4.2.2-hotfix-1 let
the sidebar scroll on short viewports (pr #1837)` at both `beeafb025` and `ab8ef967d`, an
   artifact of the staging/production promotion model. 87 tags, of which 50 are SemVer.
7. **`pnpm format:check` is red on `main` for exactly one file — `.vscode/settings.json`.** The
   plan previously claimed `app/HomePage.tsx` failed too. It does not; verified on `main` at
   `cd238bb`. See §8.
8. **Every count drifts.** In the few hours between the dossier's mining and this verification
   pass, `main` gained a commit and the derived figures all moved: 1,509 → 1,510 commits,
   1,035 → 1,036 merged PRs, "111 of 112" → "112 of 113" merges, Julia 29 → 30 commits. The
   project is suspended, not dead. **Recompute at write time and put an as-of date on the
   page.** Do not publish a figure a reader can trivially find stale with no date attached.
9. **Do not publish a user or chat count.** `docs/decisions/data-migration.md` says the
   migration covered "~260 users, ~1,700 chats, ~33.5K usage logs". The committed export at
   `455ed3d` has `Users.csv` at 1,027 lines and `Usage-logs.csv` at 92,961. CSV fields contain
   embedded newlines so line counts are not row counts, and the doc's figures read like an
   early estimate. The two sources disagree and neither is publishable as-is. If scale matters
   to a sentence, parse the CSVs properly or cut the sentence — and note that this is a
   small-but-real production system, so the case study should rest on engineering rigour and
   not imply scale it can't support.

### The facts that anchor everything

Verified 2026-08-11 at HEAD `9b8c9a927`.

| Fact                    | Value                                                               |
| ----------------------- | ------------------------------------------------------------------- |
| First commit            | `5461cd560`, **2026-03-06**                                         |
| Latest commit on `main` | `9b8c9a927`, **2026-08-11**                                         |
| Span                    | 158 days (~22.6 weeks), 1,510 commits on `main`                     |
| First production deploy | `0bf12dec9`, **2026-05-21** — release 4.0.0                         |
| Bubble fully retired    | `17862eb9c`, **2026-07-11** — release 4.3.0, all workspaces over    |
| Application code        | ~269,878 LOC; tests 118,345 LOC across 688 files                    |
| Migrations              | 114 (`0000`–`0113`), plus one hand-written rollback script          |
| PRs / issues            | 1,222 PRs (1,036 merged), 1,214 issues                              |
| Agent infrastructure    | 33 skills, 9 rule files, 116 `CLAUDE.md` revisions, 27 ESLint rules |

Note the dates against memory: the work started **March 2026**, not October 2025, and the
teammates joined **May 1–11**, not in the final month or two.

## 3. Deliverable 1 — the CV entry

This is a **new entry**, not a rewrite. Confirmed with Vova: the existing
`cv.experience.project1` ("Developer – Project Work", October 2025 – Present, an English
learning app for kids) is a **different engagement** and must be left alone. Do not edit it.
It was hand-written in `1b32d3b` (2025-11-19) and moved into the message files by `90fda1c`;
it is authored copy, not a placeholder to be reclaimed.

### Adding an entry is a three-file change

The experience section is not data-driven — each card is a hardcoded JSX block. So:

1. **`messages/en.json`** — add a `cv.experience.playgram` object with the same key shape the
   other entries use: `title`, `period`, `description`, `items` (array of strings), `tech`.
2. **`messages/ru.json`** — the same object, same keys, **same array length**. A key present
   in one file and missing in the other is a build break, not a cosmetic gap.
3. **`app/[locale]/cv/CVPage.tsx`** — add a `<Card>` block reading those keys. Copy the
   `project1` block (`:115-135`) as the template; it already has the right print classes and
   the `t.raw(...).map(...)` pattern for `items`.

**Ordering: Playgram goes first.** The section is reverse-chronological — `project1`
(Oct 2025), `project2` (Orcool, Jun–Aug 2025), `randddb` (2023–2025), `independent`,
`voicemod`. Playgram is the most recent work, so its card goes **above** `project1`.

### What the entry says

- **`title`** — name Playgram and state the actual role.
- **`period`** — real dates, and say plainly that the project is suspended for funding with
  ongoing part-time involvement. Flat statement, no spin; everyone in this industry knows what
  running out of runway means, and hedging it reads worse than owning it.
- **`description`** — a multi-model AI chat platform for teams, and the fact that it is a
  completed rebuild off Bubble.io. Lead with the rebuild; it is the rarer thing.
- **`items`** — 4–6 bullets, each carrying a **specific** verified fact (a number, a named
  subsystem, a real architectural decision). No bullet may survive that would still be true of
  a generic AI side project. Two are close to writing themselves: the completed
  Bubble → Next.js cutover, and the agent-velocity claim backed by the cadence numbers.
- **`tech`** — the real stack, which is long enough that it needs picking rather than listing.
  Next.js App Router / TypeScript / Supabase / Drizzle / LiteLLM / Weaviate / Stripe / Railway
  carries the most signal per character; Mantine, Bunny CDN, Deepgram, Vitest, and Playwright
  can go to the case study instead.

Write these bullets **before** the case study. Six bullets is a hard budget, and the budget
forces the distillation; the case study is then an expansion of a known thesis rather than a
search for one.

`ru.json` must stay structurally identical — same keys, same array lengths. The CV renders
`ru` from the same component, so a missing key is a build-time break, not a cosmetic one.

## 4. Deliverable 2 — the case study page

### Route and files

English-only, so it does **not** go under `app/[locale]/`:

```
app/case/playgram/page.tsx        # metadata via constructMetadata() + default export
app/case/playgram/CaseStudy.tsx   # the content itself
```

There is no exact precedent for a non-localized content route — `app/page.tsx` re-exports
`./HomePage`, and `app/cv/page.tsx` is a redirect to `/en/cv`. Follow the `app/page.tsx` shape:
a thin `page.tsx` holding metadata and re-exporting the component.

- Build metadata with `constructMetadata()` from `lib/metadata.ts` — pass `title`,
  `description`, `path: '/case/playgram'`, `ogType: 'article'`. Do not hand-roll a
  `Metadata` object; the helper handles OG and Twitter cards.
- `output: 'export'` is set in `next.config.ts`, so the page must be fully static: no
  dynamic params, no server-side data fetching, no runtime environment reads.
- A custom OG image is optional. If added, follow the `/cv` precedent (`public/cv_card.png`,
  passed as `ogImage`).

### Design constraints

Match the site, don't invent a new visual language. The site is deliberately austere:
black-and-white only (`--background` / `--foreground` in `app/globals.css`, inverted under
`.dark`), Merriweather serif body, JetBrains Mono for metadata, and bordered `Card`
components (`components/Card.tsx`) with no fills or shadows.

- Reuse `Card` for sections. Do not introduce accent colours, gradients, or shadows.
- Opacity is the only de-emphasis tool in use (`opacity-60`/`70`/`80`) — stay with it.
- Section headers follow the homepage convention: `text-3xl font-bold`, lowercase
  slash-prefixed names where it fits the existing `/dev`, `/music`, `/writing` idiom.
- Code snippets: mono, bordered, `overflow-x-auto` so the page body never scrolls
  horizontally on mobile. The site is mobile-first; verify at 375px.
- **No theme-only colour definitions.** Anything new must read correctly in light _and_
  dark, since the theme toggle has three states (`components/ThemeToggle.tsx`).
- The timeline is the one place a bit of visual structure earns its keep. Keep it CSS —
  borders and spacing, no charting library, nothing added to `package.json`.

### Content outline

Four parts. **A and D are the reasons anyone reads this page**; B and C are the evidence
that makes A and D believable. If time runs short, cut from C, not from D.

**A. The premise (short).** What Playgram is, and the two claims worth reading on: a Bubble
app rebuilt as a production Next.js codebase, and a one-person team doing it at team velocity.
Open with the substance — no "in today's fast-moving AI landscape" throat-clearing.

**B. Timeline.** The seven named phases with real dates, organised around the migration: what
shipped before the cutover, what the cutover itself required, what came after. Narrate the
_shape_ of the five months, not a commit log. Fold in the schema evolution — migrations are the
cleanest available proxy for how the domain model was actually understood over time, and a
Bubble-to-Postgres remodel makes that unusually legible. The single best line the schema gives
you: `0112` clears unattributed legacy usage logs **and restores `NOT NULL`** — the moment the
product stops being a migration.

The cutover deserves specifics, and the repo has better ones than the dossier surfaced. Three
worth building the section on:

- **Passwords.** Bubble's password hashes were proprietary, so users could not be ported.
  `docs/decisions/auth-identity-migration.md`: pre-create every user in Supabase Auth via the
  admin API with **no password supplied**, and set a `requires_password_reset_after_migration`
  column — needed because GoTrue auto-generates a random hash during `admin.createUser`, so
  `encrypted_password` is not a usable marker. Then reset **lazily, on first failed login**,
  with no cutover-day mass email. The accepted cost is stated in the doc: the login form leaks
  the existence of fully-activated accounts, mitigated by rate limiting. That is a migration
  constraint, a non-obvious solution, and an owned tradeoff in one story.
- **Reading the old vectors during the window.** `weaviate-tenant-routing.md`: route each call
  by the _shape_ of the tenant name — a UUID goes to the new cluster, anything else (a Bubble
  id) goes to production, with graceful fallback. No vector copying between clusters, and
  non-prod environments can read live Bubble data for the length of the window.
- **`drizzle/rollback-cut-12.sql`.** The one `.sql` file outside the migration journal: a
  hand-written, commented rollback for a single cutover task (`864523920`), which restores the
  `chats.created_by` FK, backfills it the other way, deletes the two rows from
  `drizzle.__drizzle_migrations` so Drizzle stops believing they're applied, and explains why
  it is safe against soft-deleted members. 22 lines, no secrets, and concrete evidence that
  the cutover was planned as reversible. A good snippet candidate.

**C. Decisions, including the wrong ones.** Prioritise **reversals** — things built and then
replaced, directions abandoned. A case study with no reversals reads as marketing; the
reversals are what make a skeptical reader trust the rest. For each: what was chosen, what it
cost, what replaced it, what the tell was that it needed replacing.

Start from `docs/DECISIONS_SUMMARY.md` (129 lines, a row per decision with rationale, each
linking into `docs/decisions/`, 28 files). **It is the richest unmined thing in the repo** —
the dossier mostly counted it. Read it end to end before writing this section.

Three reversals carry the section:

- **R-1: Cloud Run.** Railway (`8af1cf5fa`, Mar 6) → Cloud Run (`dd648f84e`, Mar 10) → on hold
  (`765cf7e21`, Mar 12: "GCP org policy complexity and unconfirmed $25k credits have paused
  this path") → deleted (`ed19d7d06`, Aug 5). Get the shape right: the decision was **live for
  two days and took five months to finish reversing**. The lesson is in the deletion commit —
  a _parked_ decision keeps costing you, because other decisions start citing it. Unwinding it
  meant unwinding rationale that had justified unrelated present-day choices by Cloud Run's
  properties: postgres.js's persistent-server fit, pnpm's Dockerfile integration, a future
  worker as a second service, Turso's edge advantage, and the reverse-proxy example lists in
  `network.ts` and `no-next-url-clone-redirect.ts`. The best story in the repo — a wrong turn
  whose real cost was bookkeeping, not compute.
- **R-3: deleting per-PR CI (`6c1adca44`, #2329).** Actions spend ran ~$190/mo against a
  2,000-minute free allowance, with the per-PR test lane at 69% of it — re-running a suite the
  agent can run locally for free. `DECISIONS_SUMMARY.md` has the number the commit doesn't:
  **~$190/mo → ~$4/mo.** What makes it a decision rather than a cost cut is what it refused: it
  reproduced the old lane's change-picking rather than degrading to a 9-minute whole-repo run
  "a check people skip", then found the old lane had been silently under-selecting (editing the
  RTL setup selected 170 of 526 tests) and set `forceRerunTriggers` explicitly so the
  replacement is _better_ than what it replaced. Use the decision doc's statement of the cost,
  which is blunter than the commit's: "a broken Stripe webhook or member-role check can reach
  `main` and sit until the nightly — contained by `main` deploying only to `dev` and the
  release gate running everything."
- **R-2: `/flow`, built and deleted (~2 months).** A bespoke DAG project-management system with
  per-agent-persona team files, an orphan coordination branch, sync scripts, two skills —
  abandoned for plain GitHub Issues (`bf56cb022`, #836). One artifact survived because it
  earned it (`/propose-issue`); the `last-flow-docs` tag is the tombstone. The honest read: an
  agent-driven codebase makes it cheap to build elaborate process machinery, which is exactly
  why it needs deleting when it doesn't pay.

Also available, and worth a line each rather than a section — the first three are new, from
`DECISIONS_SUMMARY.md`, and all three are better than a stack list:

- **Historical-attribution columns take no foreign key.** A standing rule with a crisp
  derivation: `usage_logs.project_id` records what was true when the event happened, so an FK
  would assert the referent still exists — forcing a choice between `CASCADE` (destroys billing
  history) and `SET NULL` (erases the attribution) when `deleteProject` hard-deletes. Readers
  bucket the dangling id so breakdowns still sum to the total.
- **Railway's 5-minute request cap, visible in two unrelated features.** It is an acknowledged
  open constraint against 300-second deep-research streams (reconnect strategy deferred), and
  it is _the reason_ voice dictation streams browser↔Deepgram directly over a short-lived
  minted JWT instead of proxying through a server WebSocket. One platform limitation shaping
  two features is a real architecture anecdote.
- **The onboarding-tips cohort, and its named footgun.** A tip runs when its `sinceVersion`
  **is** the registry's derived max and is newer than the reader's stamped `first_seen_version`
  — so someone away across several tipped releases gets the newest walkthrough, not a queue of
  every one they slept through, with no new state. The footgun is written down: removing the
  newest block lowers the derived max and revives the previous walkthrough, so "retire a
  walkthrough by adding the next one, never by removing the current one." (This is also the doc
  that would have caught the dossier's mis-gloss of the `tips` hotfix — worth a footnote.)
- **`server-only` taint by import chain**, with `poison-check` walking the madge graph from
  both `'use client'` files and the Node test harness, exempting type-only imports — "a
  detector rather than a disarmer".
- **The five-suffix barrel system** encoding access level rather than visibility, including
  `index.node-safe.ts` for an axis orthogonal to client/server: `scripts/**` runs under tsx
  with no bundler.
- **R-4's chat-list rewrite** (`1d227b9a6`, #2006), which eliminated glitches "as classes
  rather than patches" and was staged behind an invariant ledger. Two decision docs exist for
  this area, so the first design was documented before it was replaced.
- **Two billing bugs worth a sentence each**, both honest about cost: one dropped `invoice.paid`
  event froze `current_period_end` permanently (#2178), fixed by adding a second narrow writer;
  and creating the Stripe customer at checkout-URL time instead of at payment left a customer
  row for every abandoned checkout — "four in production, one more every ~11 days" (#1906,
  which is the current HEAD commit).

**D. Running an agent-driven codebase — the meta section.** The most broadly interesting part,
and the part nobody else can write. Source: the version history of `CLAUDE.md` (116 revisions)
and `.claude/rules/`. Every diff to those files is a lesson with a timestamp and, usually, a
visible incident in the surrounding commits. Structure each as **rule added → the problem that
caused it**, which is concrete where "lessons learned" lists are vague. The dossier's §4.2
table is a good index of these; read the commit bodies it cites rather than quoting it.

The strongest thesis available: **the guardrails are machine-checked, not written down as prose
for the agent to remember.** `pnpm vet` chains typegen plus 14 parallel checks — typecheck,
format, lint, FSD structure (Steiger), knip, circular-dependency checks, `poison-check`,
`type-overlap`, `db:chain-check`, `license-check`, `security-diff`, and tests; there are 27
project-local ESLint rules in `eslint/`, each with its own rule-tester test; tests are split
into buckets by what credentials they need so the no-env bucket runs anywhere, and gating a
test on env presence is _prohibited_ because a skip would convert the one signal that catches a
misfiled test into a green tick. Convention that can fail a command does not depend on the
agent recalling it.

**And then complicate it, because the repo does.** The RLS finding (§2, correction 2) is a
counterexample sitting inside the same subsystem: `playgram/enforce-rls` mechanically enforces
`.enableRLS()` on every table, and it works — while the decision doc explaining _why_ describes
a per-table-policy design that was never built, and the master index still points at it. So the
honest thesis is sharper than "machine-check your conventions": **a lint rule can hold a
convention in place indefinitely without anyone noticing that the reasoning behind it has been
replaced.** Machine-checked convention and correct documentation are different problems, and
this repo solved one of them. Draw that contrast explicitly — it is the most credible paragraph
available in the section, and it is about the author's own codebase.

Also worth covering:

- The `/plan` → `/implement` split and what separating them solved (see §7 — those skills are
  reproduced in this repo, so the case study and the local skills should agree).
- The **tombstone practice**: retired work is not deleted but left as `retired.md` with an
  archive SHA (`bubble/`, `legacy-data/`, `scripts/etl/`, `MIGRATION_PLAN.retired.md`). In an
  agent-driven codebase, where the agent's only context is what the repo says, "why is this
  gone" is a question the repo has to answer by itself. `19375c2fd` made it a CLAUDE.md rule.
- **The `docs/remove-before-merging/` convention, with the number that makes it land.** Working
  artifacts (squash proposals, preview screenshots, log dumps) live in a directory whose name is
  the instruction, swept by `/finalize` before merge. Across ~1,000 merged PRs, **exactly 4
  files ever reached `main`** — and one of those 4 was a 984,924-byte Railway log dump
  containing customer email addresses (#2234, added `0b46440b9`, removed `e08b3fc8d`). The
  `/finalize` skill now cites its own breach in the step that does the sweeping. A convention
  that holds 99.6% of the time and fails once, expensively, is a more useful data point than
  either "it works" or "it doesn't". _When recomputing this, count on `main` only: across all
  refs these files appear in ~150 commits, which is by design — feature branches are where they
  are supposed to live._
- **Git attribution stops meaning what it used to mean**, and this repo is a good exhibit.
  Across five months the same work got recorded three different ways: agent as `Co-authored-by`
  trailer, agent as the commit _author_ (37 Claude, 3 Cursor), and no trailer at all (185
  commits). None of those distinguishes "a human typed this" from "an agent typed this under
  direction" — the trailer records which tool ran and whether its convention survived, nothing
  more. The trailer strings themselves are a rough log of which model was working when
  (`Claude Sonnet 4.6` in early March, `Opus 4.6`, `Opus 4.6 (1M context)`, `Opus 4.7`, then a
  generic `Claude` from May as the trailer stopped naming the model).

  The honest conclusion is the interesting one: **in an agent-driven codebase the commit record
  can no longer answer "who wrote this"**, and the useful question shifts to who specified it,
  who reviewed it, and who owns it when it breaks. Say that plainly rather than reporting
  co-authorship percentages as if they were measurements — and note that this is a problem the
  whole industry is about to have, not a quirk of one repo's discipline.

  There is a single artifact that makes this concrete better than any statistic: a review
  comment on PR #2019 addressed to a human and an agent in the same breath — "some questions
  are more to @Saam-G than to the agent — don't proceed until you get an answer on those from
  him ;-)". It names a teammate, so it is consent-gated along with everything in §6 note 7.

- What did **not** work — abandoned rules, over-engineered scaffolding, guidance the agent kept
  ignoring. The failures are the credible part. Four CLAUDE.md rules are **corrections of
  earlier rules**, which is the pattern worth naming: the instruction file was treated as a
  debugged artifact, not a style guide.
- **A tension worth holding rather than resolving.** `DECISIONS_SUMMARY.md` opens with a stated
  philosophy: "Decisions are generally made at the point where they're needed, not
  speculatively upfront — the testing framework decision, for example, was taken when the first
  production code shipped, not before." Set that beside `66bbf9156` (2026-03-21), a "Week 2
  employee assessment" synthesizing five independent model assessments of the author's own work,
  which **downgrades its own level assessment from "Staff engineer" to "Strong Senior"** and
  flags over-engineering (46% docs commits, 8.5% feat commits) at exactly the moment the
  philosophy says decisions were being deferred. Both are real; they disagree. A case study
  that shows the disagreement is more convincing than one that picks a side. **Flag this for
  Vova before publishing** — it is a self-assessment that reads as candour in context and as
  damage out of it, and it is his call, not the implementer's.

**Length:** aim for something read in 8–12 minutes. If it gets longer, the meta section is
the part to spin out to Substack later, keeping a summary and a link here.

## 5. Deliverable 3 — entry points

The page is worthless unlinked. Two links, both English-only surfaces:

- `app/HomePage.tsx:149` — the "Professional Work" block under `/dev`. Add Playgram with a
  link to the case study. Match the surrounding card markup rather than adding a new component.
- `app/[locale]/cv/CVPage.tsx` — the **new Playgram card** added in §3. Add a "read the case
  study" link. Because this card renders in both locales, the link label needs a translation
  key in both message files; the _destination_ stays the English page.
- The link must be `print:hidden` or rendered as a bare URL in print — a "read more" link is
  dead text in the PDF export that `/cv` is built to produce.

## 6. Attribution — hard rules

Non-negotiable, and worth getting exactly right; this is the part that can quietly damage
someone if handled carelessly.

1. **Publish a specific figure with its denominator**, recomputed at write time and dated,
   folding in the misattributed agent commits: _"authored ~92% of commits and ~92% of lines
   (1,394 of 1,510 commits; 1,096 of 1,222 PRs), and personally reviewed and merged every pull
   request the three other engineers landed but one."_ Do not round up to "almost all" or
   "essentially everything" — the specific number is what makes it credible.
2. **Name the teammates by what they actually built.**
   - **Mina Rotari** — onboarding, auth, chat UI, icon assets. 51 commits from 2026-05-11.
   - **Semyon "Sam" Golovachev** — the deepest of the three: model catalog, usage analytics,
     member groups, and **DB migrations** (`src/shared/db`, `_journal.json`). 35 commits.
   - **Julia Suhovici** — the **billing and subscription surface**, project management, a
     backfill script. 30 commits.

   That is more credit than a closing "thanks to the team", and it is also what makes the
   ~92% checkable rather than boastful. Do not attach individual percentages to named people;
   describe scope of ownership instead.

3. **Use they/them throughout for all three.** Their pronouns are not documented anywhere in
   the repo, and a name is not evidence. Do not infer.
4. **Say that the whole team was agent-assisted, without quoting trailer rates.** Presenting
   Vova as the agent-driven one and the others as conventional engineers would be a distortion.
   State it qualitatively: trailer presence tracks which tool was used and whether its trailer
   survived, not whether a human typed the code, so any percentage built on it is a floor and
   reads as a precision the data does not have.
5. **Claim the harness, not the typing.** What is uniquely his: 33 skills, 116 revisions of
   `CLAUDE.md`, 27 project-local ESLint rules, the `vet` gate, and the review record — 112 of
   113 non-Vova merged PRs merged by him, and **no PR in the repo was ever reviewed by anyone
   other than its own author and Vova** (see §2, correction 1 — get this phrasing right). That
   last fact cuts both ways and is worth stating plainly: it is a real load-bearing
   contribution and also a single point of failure.

   The review record is also livelier than a merge count suggests, and the livelier version is
   the fairer one: 52 of 126 non-Vova PRs carry a formal review from him (16 `APPROVED`, 2
   `CHANGES_REQUESTED`, the rest `COMMENTED` across ~149 review events), with real threaded
   back-and-forth — #2099 runs a dozen alternating rounds. That is review, not rubber-stamping,
   and it credits the teammates for responding rather than casting them as passive.

6. **State the 156 closed-unmerged PRs** (14.2% of his own) somewhere. Abandoned attempts left
   visible in the record are evidence the process was real rather than curated.
7. **Check with the three of them before publishing their names.** The founder cleared the
   project; individuals clearing their own names is separate. This also covers the PR #2019
   review quote in §4 part D. Flag it for Vova rather than deciding it during implementation.
8. **Two publication risks are real and re-verified — neither blocks this work, but do not
   contradict them.** `docs/remove-before-merging/logs.1785761954545.json` (984,924 bytes of
   Railway production logs, customer emails) is reachable in `main`'s history, and
   `legacy-data/` at `455ed3d` still holds `Users.csv`, `Chats.csv`, `Usage-logs.csv` and the
   rest of the Bubble export — with a recovery recipe written into `legacy-data/retired.md` by
   design. The case study is safe to publish; **the repository cannot be made public without
   rewriting history**, so nothing on the page should invite anyone to ask for the repo. Also
   redact before quoting: `.env.local.example` holds real full-length internal service URLs
   (no secret values), and `release: 4.2.0 RapidDev workspace cutover` names a customer —
   genericize to "first enterprise workspace cutover" unless consent exists.

## 7. Port the `/plan` and `/implement` skills

`playgramapp` has `/plan` and `/implement` skills that the owner wants reproduced in this
repo "to the extent that makes sense locally". They are also subject matter for §4 part D.

**Done.** `.claude/skills/plan/SKILL.md` and `.claude/skills/implement/SKILL.md` are adapted
from the originals. Each file ends with a "Local deviations" section recording what was changed
and why. Now that the repo is clonable, diff them against
`playgramapp/.claude/skills/{plan,implement}/SKILL.md` directly rather than against the
dossier's §0.3–0.4 reproduction.

What carried over intact — and this is the interesting finding — is that the originals are not
really about planning. They are a **workaround for a broken UI**: in web sessions the plan-mode
approval and `AskUserQuestion` prompts get re-emitted after idle, stacking duplicates and
silently dropping answers to superseded prompts (filed upstream as
anthropics/claude-code#72704). So plans became files and questions became numbered prose.
Everything else — the `.draft.do-not-implement.md` → `.in-progress.md` → `.completed.md`
lifecycle, the go-ahead-token gate, the handoff block, the canary for a handoff pasted into the
wrong session — is scaffolding built around that one constraint.

What was dropped, and why it matters for §4 part D: `/from-branch`, `/dry`, `/tighten-docs`,
`/pr`, `/finalize`, `pnpm vet`, the `## DRY notes` requirement, and the rule that plan files
must never reach `main`. That last one **inverts** here — in `playgramapp` the plan is a
transient artifact `/finalize` deletes before the PR; in this repo it is the deliverable. The
portable core turned out to be small: the file-based gate and the question format. The rest was
load-bearing only against that repo's specific machinery.

## 8. Verification

```bash
pnpm install
pnpm lint            # eslint --fix
pnpm format:check    # prettier
pnpm build           # must succeed under output:'export'
```

**`pnpm format:check` is already red on `main` for exactly one file** —
`.vscode/settings.json`. Verified on `main` at `cd238bb` and on this branch. So the gate passes
if the failure list is exactly that one file. (An earlier version of this plan also listed
`app/HomePage.tsx`; it passes, and the mistake is a good argument for re-running a baseline
rather than inheriting one.) Don't reformat `.vscode/settings.json` as a drive-by — it would
bury the real diff. Fixing it is a reasonable separate change and worth doing at some point,
since a permanently-red check trains everyone to ignore it.

`docs/playgram-dossier.md` is in `.prettierignore` on purpose: it is a verbatim mined record
containing nested code fences (a 4-backtick block wrapping 3-backtick blocks) that reflowing
would mangle.

Then confirm:

- [ ] `/case/playgram` renders in light **and** dark mode; no element defined only in one theme.
- [ ] No horizontal scroll on the page body at 375px width; wide blocks scroll internally.
- [ ] `/en/cv` and `/ru/cv` both render — `ru.json` structurally matches `en.json`.
- [ ] The `/cv` print view is clean: no orphaned "read more" links, no broken page breaks.
- [ ] The case study is reachable from the homepage and from the CV.
- [ ] No code excerpt on the page contains a secret, credential, internal endpoint, or anything
      resembling user data. Re-read the dossier's §10 before quoting anything.
- [ ] Every number on either artifact was **recomputed against the clone during this session**,
      not copied from the dossier, and the page carries an as-of date.
- [ ] Every claim about what a change _meant_ was checked against the commit body, the decision
      doc, or the schema — not inferred from a commit subject.

## 9. Out of scope

- Publishing the standalone agentic-infrastructure essay (drafted later from §4 part D).
- Russian translation of the case study page.
- Any change to the `playgramapp` repository itself. (The RLS documentation drift in §2 is a
  real bug in that repo. Note it for Vova; do not fix it from here.)
- Backfilling the other CV entries, however tempting once the Playgram entry is sharper next
  to them. `project1` in particular is a different engagement and is not ours to touch here.
