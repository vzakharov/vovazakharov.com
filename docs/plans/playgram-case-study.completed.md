# Plan: Playgram resume entry + case study

**Status:** ready to implement. Written to be executed from a cold session with no prior context.
**Branch:** `claude/playgramapp-resume-case-study-exozpz`

## 0. What this is

Five months of work on `Playgramai/playgramapp` (private) is currently suspended for lack of
funding, with Vova staying on part-time for ongoing issues. The work is worth putting on the
record.

**Playgram** is a multi-model AI chat platform for teams, serving `app.playgram.ai`: team
workspaces with project-level roles and invitations, chat across many LLM providers through a
single LiteLLM proxy, file handling, vector search and persistent memory over Weaviate,
deep-research runs, an editable canvas with PDF export, voice input, and Stripe billing.

**The spine of the story is a rebuild.** The app was migrated off Bubble.io onto Next.js, and
the cutover is complete — Bubble is retired and frozen as an archive. A no-code platform
replaced by a production TypeScript codebase in five months, by one person directing an agent,
is a sharper and rarer claim than "built an AI app", and both artifacts should be built around
it.

Stack: Next.js App Router (Feature-Sliced Design layering, BFF pattern), TypeScript, Mantine
v8 + SCSS modules, Supabase (Postgres + Auth), Drizzle ORM with `drizzle-zod`, LiteLLM,
Weaviate, Bunny CDN, Stripe, Deepgram, Railway + GitHub Actions, Vitest + Playwright.

Two public artifacts come out of this:

1. **A new CV entry** — added above the existing ones, which stay as they are.
2. **A case study page** on vovazakharov.com, telling three things in order: **what we built and
   why, how we built it, and the interesting trouble we hit along the way.**

### The authorship numbers

Vova's share of the codebase is **~88–92%** depending on the metric. Publish a specific figure
with its denominator rather than a qualitative "almost all" — the specificity is what makes it
credible, and every row is checkable against the git history.

Computed at HEAD `9b8c9a927` on 2026-08-11. **Recompute before publishing** (§2) and put the
as-of date on the page.

| Metric                                 | Vova's share               |
| -------------------------------------- | -------------------------- |
| Commits authored (of 1,510)            | **92.32%** (1,394)         |
| Lines added, excluding generated files | 91.74% (602,484 / 656,722) |
| Net lines added−removed                | 87.95% (288,071 / 327,525) |
| PRs authored (of 1,222)                | 89.69% (1,096)             |
| Merged PRs authored (of 1,036)         | 89.09% (923)               |
| Other humans' merged PRs he merged     | **112 of 113**             |

The 37 commits authored by `Claude <noreply@anthropic.com>` and the 3 by `Cursor Agent` are
**his** — agent runs he directed where the harness wrote itself into the author field instead of
the co-author trailer. Confirmed with Vova: ad-hoc misattribution, not third-party
contributions. The figures above fold them in.

Net lines is the least flattering row and worth understanding rather than dropping: the
agent-authored commits were net **deletions** (−705 and −1,630), so folding them in lowers the
net share slightly while raising the commit share. The stable fact underneath, unchanged by any
attribution choice: **the other three engineers account for ~12% of net lines** (+39,454).

Two things to state rather than smooth over:

1. **The other three engineers did real work** — 116 commits, 113 merged PRs, +39,454 net lines
   (12.05% of net), including DB migrations and the subscription surface. Not cosmetics. They
   also joined earlier than remembered: May 1–11, so they were present for three of the five
   months, not the final one or two.
2. **Essentially all of it was AI-assisted, by everyone.** Confirmed with Vova: a missing
   `Co-authored-by` trailer does not mean a commit was hand-written — it means the trailer was
   dropped, or a different tool was used. So do **not** publish the trailer rates (84.6% for
   Vova, 85.2% for the others) as if they measured AI involvement; they measure tooling
   discipline. 185 of Vova's own commits carry no trailer at all, discipline was weakest in
   April–May, and 84.6% is a floor, not a measurement. The defensible claim is qualitative: the
   agent-assisted workflow was the team's, not one person's, and no one on the project was
   working any other way.

Which points at the sharper claim: **what is uniquely his is the machine the whole team shipped
through** — all 33 skills, the 116 revisions of `CLAUDE.md`, the 27 project-local ESLint rules,
and the `vet` gate. Everyone was agent-assisted; one person built the harness that made that
safe. Lead with that, support it with ~92% authorship, and let the review record carry the rest.
See §6.

## 1. Decisions already locked

Do not re-litigate these; they came from the project owner.

| Question                       | Decision                                                                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Disclosure                     | **Full.** The founder has approved naming Playgram, describing the architecture, and publishing individual code snippets. Not the whole codebase.     |
| Artifacts                      | Dossier (committed to this repo, but no page renders it) + CV entry + case study page.                                                                |
| Standalone agentic-infra essay | **Out of scope for now.** The meta-lessons go into the case study as part of §4's part 2. A Substack version can be spun out later from that section. |
| i18n                           | CV entry: **both `en` and `ru`**. Case study: **English only**, consistent with `app/HomePage.tsx`, which is not localized.                           |

## 2. Sources

### Clone the repo and read it

`.claude/hooks/session-start.sh` installs a `gh` shim that routes the GitHub CLI around the
egress proxy, and `GH_TOKEN` is in the environment, so `playgramapp` is directly reachable:

```bash
cd "$SCRATCHPAD"   # not into this repo's tree
env -u HTTPS_PROXY -u https_proxy \
  git clone https://x-access-token:${GH_TOKEN}@github.com/Playgramai/playgramapp.git
```

The clone is full, not shallow (~440 MB of `.git`), so every history command works without
`--unshallow`. `gh api graphql` works for PR, issue and review data. Verified 2026-08-11.

**Three places repay reading directly, beyond anything summarised below:**

- **`docs/DECISIONS_SUMMARY.md`** — 129 lines, one row per architectural decision with its
  rationale, each linking into `docs/decisions/` (28 files). This is the richest document in the
  repo and the primary source for §4's parts 2 and 3. Read it end to end before writing.
- **`eslint/`** — 27 project-local lint rules, each with a rule-tester test: conventions made
  machine-checkable.
- **The `retired.md` tombstones** in `bubble/`, `legacy-data/`, `scripts/etl/` and
  `docs/MIGRATION_PLAN.retired.md` — what the Bubble cutover actually entailed, and what was
  deliberately thrown away afterwards.

### The dossier is an index, not a source

`docs/playgram-dossier.md` (1,910 lines, tracked, in `.prettierignore`) is a map of where things
are. Its §3 timeline, §5 decision record, §6 schema arcs and §8 snippets are the fastest way to
find what to look at, and its §10 is the right publication-risk checklist to read before quoting
any code. It lives in `docs/`, deliberately **not** in `docs/plans/`, because `/implement` globs
`docs/plans/*.md` and expects to find exactly one file there.

It was written by a session mining the repo on behalf of a session that could not open it, so it
is a secondary summary — use it to navigate, then **verify against the clone before anything goes
on a page.** Its computed content (SHAs, dates, commit and line counts, contributor tables, LOC)
reproduces well. Its interpretive content is an LLM's reading of terse commit text, and some of
it is wrong.

### Where the dossier is wrong or will mislead you

Verified 2026-08-11 against a full clone. Not exhaustive.

1. **The sole-reviewer claim is correct, but the obvious query says otherwise.** Third-party
   reviews — a teammate reviewing anyone else's PR, Vova's included — come to **0** across all
   1,222 PRs. Nobody but Vova ever reviewed anything.
   The trap: a GraphQL sweep for review events whose author isn't `vzakharov` returns **52 events
   across 10 PRs** (#1226, #1247, #1685 by minarotari; #1711, #2099, #2322, #2341 by
   JuliaSuhovici; #2019, #2383, #2420 by Saam-G). In every one the "reviewer" **is the PR's own
   author**, and all 52 have empty bodies — GitHub files a threaded reply to one of Vova's inline
   comments as a review event by the replier. Authors answering review, not performing it.
   **Exclude review events whose author equals the PR author**, publish the claim as "sole
   reviewer on every pull request in the repository", and don't hedge it after seeing the raw 10.
2. **Source the RLS write-up from the code, not the decision doc.** The code does what the
   dossier says — RLS enabled on every table with zero policies, enforced by
   `playgram/enforce-rls` — and that is real, deliberate and publishable (§4, part 2). But
   `docs/decisions/auth-and-tenancy.md`, written in March and never revisited (it still says
   `organization_id`, so it predates the `d828289e5` rename), records a _different_ design:
   per-table policies with `SET LOCAL app.current_org_id`. There are zero `CREATE POLICY`
   statements in the repo. `README.md`, `docs/codebase-guardrails.md`,
   `.claude/rules/database.md` and the lint rule's own comment all describe the shipped design
   accurately; the decision doc will walk you into writing up something that was never built.
   The stale doc is a one-sentence note for Vova (§9), not case-study material.
3. **`pnpm vet` runs 14 parallel checks, not 13** — `typecheck`, `format:fix`, `lint:fix`,
   `lint:fsd`, `lint:css:fix`, `poison-check`, `deps`, `ast-metrics`, `knip`, `type-overlap`,
   `db:chain-check`, `license-check`, `security-diff`, `test`, after a sequential `typegen`.
4. **`.claude/rules/` holds 9 files, not 10.** `etl.md` was retired with the ETL (`4e98b4952`).
5. **114 migrations, not 115.** There are 115 `.sql` files in `drizzle/` but only 114 journal
   entries (`0000`–`0113`); the extra file is `rollback-cut-12.sql`, a hand-written rollback
   script, not a migration — and interesting in its own right (§4, part 3).
6. **52 `release:` commits on `main`, not 50.** One subject lands twice — `4.2.2-hotfix-1 let the
sidebar scroll on short viewports (pr #1837)` at both `beeafb025` and `ab8ef967d` — an
   artifact of the staging/production promotion model. 87 tags, 50 of them SemVer.
7. **Every count drifts.** In the hours between the dossier's mining and this verification pass,
   `main` gained a commit and the derived figures moved: 1,509 → 1,510 commits, 1,035 → 1,036
   merged PRs, 111/112 → 112/113 merges, Julia 29 → 30 commits. The project is suspended, not
   dead. **Recompute at write time and date the page.**
8. **Do not publish a user or chat count.** `docs/decisions/data-migration.md` says the migration
   covered "~260 users, ~1,700 chats, ~33.5K usage logs". The committed export at `455ed3d` has
   `Users.csv` at 1,027 lines and `Usage-logs.csv` at 92,961. CSV fields contain embedded
   newlines so line counts aren't row counts, and the doc's figures read like an early estimate.
   The sources disagree and neither is publishable. If scale matters to a sentence, parse the
   CSVs properly or cut the sentence — and note this is a small-but-real production system, so
   rest the case study on engineering rigour rather than implied scale.
9. **Check glosses against primary text.** The dossier read `hotfix: #2239 stop impersonated
sessions from consuming the target's tips` as a billing bug; "tips" are the **onboarding
   tips** from migrations `0090`–`0091` (see `docs/decisions/onboarding-tips.md`). Before
   building a paragraph on what a change _meant_, check the commit body, the decision doc, or the
   schema. A plausible gloss on a five-word commit subject reads fine and is wrong.

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
learning app for kids) is a **different engagement** and must be left alone. Do not edit it. It
was hand-written in `1b32d3b` (2025-11-19) and moved into the message files by `90fda1c`; it is
authored copy, not a placeholder to be reclaimed.

### Adding an entry is a three-file change

The experience section is not data-driven — each card is a hardcoded JSX block. So:

1. **`messages/en.json`** — add a `cv.experience.playgram` object with the same key shape the
   other entries use: `title`, `period`, `description`, `items` (array of strings), `tech`.
2. **`messages/ru.json`** — the same object, same keys, **same array length**. A key present in
   one file and missing in the other is a build break, not a cosmetic gap.
3. **`app/[locale]/cv/CVPage.tsx`** — add a `<Card>` block reading those keys. Copy the
   `project1` block (`:115-135`) as the template; it already has the right print classes and the
   `t.raw(...).map(...)` pattern for `items`.

**Ordering: Playgram goes first.** The section is reverse-chronological — `project1` (Oct 2025),
`project2` (Orcool, Jun–Aug 2025), `randddb` (2023–2025), `independent`, `voicemod`. Playgram is
the most recent work, so its card goes **above** `project1`.

### What the entry says

- **`title`** — name Playgram and state the actual role.
- **`period`** — real dates, and say plainly that the project is suspended for funding with
  ongoing part-time involvement. Flat statement, no spin; everyone in this industry knows what
  running out of runway means, and hedging it reads worse than owning it.
- **`description`** — a multi-model AI chat platform for teams, and the fact that it is a
  completed rebuild off Bubble.io. Lead with the rebuild; it is the rarer thing.
- **`items`** — 4–6 bullets, each carrying a **specific** verified fact: a number, a named
  subsystem, a real architectural decision. No bullet may survive that would still be true of a
  generic AI side project. Two are close to writing themselves: the completed Bubble → Next.js
  cutover, and the agent-velocity claim backed by the cadence numbers.
- **`tech`** — the real stack, long enough that it needs picking rather than listing. Next.js
  App Router / TypeScript / Supabase / Drizzle / LiteLLM / Weaviate / Stripe / Railway carries
  the most signal per character; Mantine, Bunny CDN, Deepgram, Vitest and Playwright can go to
  the case study instead.

Write these bullets **before** the case study. Six bullets is a hard budget, and the budget
forces the distillation; the case study is then an expansion of a known thesis rather than a
search for one.

`ru.json` must stay structurally identical — same keys, same array lengths. The CV renders `ru`
from the same component, so a missing key is a build-time break, not a cosmetic one.

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
  `description`, `path: '/case/playgram'`, `ogType: 'article'`. Do not hand-roll a `Metadata`
  object; the helper handles OG and Twitter cards.
- `output: 'export'` is set in `next.config.ts`, so the page must be fully static: no dynamic
  params, no server-side data fetching, no runtime environment reads.
- A custom OG image is optional. If added, follow the `/cv` precedent (`public/cv_card.png`,
  passed as `ogImage`).

### Design constraints

Match the site, don't invent a new visual language. The site is deliberately austere:
black-and-white only (`--background` / `--foreground` in `app/globals.css`, inverted under
`.dark`), Merriweather serif body, JetBrains Mono for metadata, and bordered `Card` components
(`components/Card.tsx`) with no fills or shadows.

- Reuse `Card` for sections. Do not introduce accent colours, gradients, or shadows.
- Opacity is the only de-emphasis tool in use (`opacity-60`/`70`/`80`) — stay with it.
- Section headers follow the homepage convention: `text-3xl font-bold`, lowercase
  slash-prefixed names where it fits the existing `/dev`, `/music`, `/writing` idiom.
- Code snippets: mono, bordered, `overflow-x-auto` so the page body never scrolls horizontally
  on mobile. The site is mobile-first; verify at 375px.
- **No theme-only colour definitions.** Anything new must read correctly in light _and_ dark,
  since the theme toggle has three states (`components/ThemeToggle.tsx`).
- The timeline is the one place a bit of visual structure earns its keep. Keep it CSS — borders
  and spacing, no charting library, nothing added to `package.json`.

### Content

Three parts, in this order: **what we built and why**, **how we built it**, **the interesting
trouble**. Part 1 earns the reader's attention, part 2 is the substance, part 3 is what makes
part 2 believable. Aim for 8–12 minutes of reading. If it runs long, thin part 2's architecture
list — not part 3.

---

#### Part 1 — What we built, and why

Short. Open with the substance; no "in today's fast-moving AI landscape" throat-clearing.

What Playgram is, and what it was: a working product on Bubble.io with paying workspaces, whose
constraints had become the ceiling. The rebuild had to reach feature parity with a live app that
kept shipping while the replacement was being written — the release names record this, since
4.0.x releases are labelled by which Bubble version they had caught up to ("Bubble parity
catch-up to 3.5.15", "3.5.18 parity"). That is the frame for everything after: not a greenfield
build, a replacement that had to catch a moving target and then take over from it.

Two claims worth reading on, both verifiable: the cutover **completed** (releases 4.1.0 through
4.3.0, workspace by workspace, ending "all workspaces cut over"), and one person did it at team
velocity by building the machine described in part 2.

#### Part 2 — How we built it

Three threads. Interleave or separate them, but the third is the differentiator and should not
be a bolt-on at the end.

**a. The shape of five months.** The seven named phases with real dates, organised around the
migration: what shipped before the cutover, what the cutover required, what came after.
Narrate the shape, not a commit log. Load-bearing dates: first commit 2026-03-06, first
production deploy 2026-05-21 (**76 days**), Bubble fully retired 2026-07-11 (**127 days**).
The cadence is worth one figure, not a table — a median of 67 commits a week, peaking at 93.

Fold in the schema, because 114 migrations are the cleanest available proxy for how the domain
model was actually understood over time, and a Bubble-to-Postgres remodel makes that unusually
legible. Two arcs carry it:

- **Identity moved from the user to the member.** A cluster of migrations relocates name,
  avatar, instructions and context from the account to the membership (`0025`–`0026` backfill
  then drop `user_configs.display_name`; `0033` moves the user context list to members; `0028`
  then `0074` move the avatar). The realisation is a real product insight: in a multi-workspace
  product, those things belong to a person's membership, not their account.
- **For about six weeks the schema knew it had two populations** — `is_migrated_from_legacy`,
  `requires_password_reset_after_migration`, `chats.created_by` made nullable "for legacy" rows
  — and then deliberately stopped. The single best line the schema gives you is `0112`: it
  clears unattributed legacy usage logs **and restores `NOT NULL`**. That is the moment the
  product stops being a migration.

**b. The architecture, and the few choices that were load-bearing.** Not a stack list — pick the
decisions a reader can learn something from. In rough order of interest:

- **RLS on every table with zero policies.** Deny-by-default, and the _second_ migration in the
  repo (`0001`, before any feature). Counterintuitive enough to be worth explaining properly:
  the app queries as the Postgres superuser via Drizzle and so bypasses RLS entirely, which
  means policies aren't the mechanism — enabling RLS with **no** policies is what shuts down
  Supabase's auto-generated PostgREST Data API, since anon and authenticated roles then get zero
  access to public tables. It reads like a misunderstanding of RLS and isn't. Enforced by the
  `playgram/enforce-rls` rule, whose comment is the best short explanation and a good snippet
  candidate. Source it from the code and that comment — see §2, item 2.
- **`server-only` taint by import chain**, with `pnpm poison-check` walking the madge graph from
  both `'use client'` files and the Node test harness, exempting type-only imports — "a detector
  rather than a disarmer".
- **Historical-attribution columns take no foreign key.** A standing rule with a crisp
  derivation: `usage_logs.project_id` records what was true when the event happened, so an FK
  would assert the referent still exists — forcing a choice between `CASCADE` (destroys billing
  history) and `SET NULL` (erases the attribution) when `deleteProject` hard-deletes. Readers
  bucket the dangling id so breakdowns still sum to the total.
- **Railway's 5-minute request cap, visible in two unrelated features.** An acknowledged open
  constraint against 300-second deep-research streams (reconnect strategy deferred), and _the
  reason_ voice dictation streams browser↔Deepgram directly over a short-lived minted JWT
  instead of proxying through a server WebSocket. One platform limitation shaping two features
  is a better architecture anecdote than any stack table.
- **A five-suffix barrel system** encoding access level rather than visibility, including
  `index.node-safe.ts` for an axis orthogonal to client/server: `scripts/**` runs under tsx with
  no bundler, so a barrel becomes unimportable the moment its graph reaches a `.module.scss`.
- **The onboarding-tips cohort, and its named footgun.** A tip runs when its `sinceVersion`
  **is** the registry's derived max and is newer than the reader's stamped `first_seen_version`
  — so someone away across several tipped releases gets the newest walkthrough, not a queue of
  every one they slept through, with no new state. The footgun is written down: removing the
  newest block lowers the derived max and revives the previous walkthrough, so "retire a
  walkthrough by adding the next one, never by removing the current one."

**c. The machine: running an agent-driven codebase.** The most broadly interesting thread, and
the part nobody else can write. Primary source is the version history of `CLAUDE.md` (116
revisions) and `.claude/rules/`; the dossier's §4.2 indexes them, but read the commit bodies it
cites — most carry the incident that provoked the rule. Structure each as **rule added → the
problem that caused it**, which is concrete where "lessons learned" lists are vague.

The thesis: **the guardrails are machine-checked, not written down as prose for the agent to
remember.** `pnpm vet` chains typegen plus 14 parallel checks — typecheck, format, lint, FSD
structure (Steiger), knip, circular dependencies, `poison-check`, `type-overlap`,
`db:chain-check`, `license-check`, `security-diff` and tests. There are 27 project-local ESLint
rules, each with its own rule-tester test. Tests are split into buckets by what credentials they
need so the no-env bucket runs anywhere — and gating a test on env presence is _prohibited_,
because a skip would convert the one signal that catches a misfiled test into a green tick.
Convention that can fail a command doesn't depend on the agent recalling it.

Make the argument from the instruction file's own history, which is where the contrast lives:
four of its rules are **corrections of earlier rules**, not new ones — errors-must-propagate
tightened after "logged and continued" became an escape hatch; the Zod-parse rule bounded after
agents over-corrected into parsing already-typed arguments; the no-background-Bash rule's one
exception removed after a background watch loop made sessions read as busy so operators never
returned. The instruction file was treated as a debugged artifact, not a style guide.

Also in this thread:

- **The `/plan` → `/implement` split.** Worth telling because the honest reason is unglamorous:
  the skills are a **workaround for a broken UI**. In web sessions an idle session re-emits its
  pending plan-mode approval or `AskUserQuestion` prompt, stacking duplicates and silently
  dropping answers to superseded prompts (filed upstream as anthropics/claude-code#72704). So
  plans became files and questions became numbered prose. Everything else — the filename
  lifecycle, the go-ahead gate, the handoff block — is scaffolding around that one constraint.
  The sharpest lesson in the sequence is `b6e9a6310`: ending a plan turn on "want me to
  implement it?" primed the agent to read the operator's next message — a correction — as
  assent, so plan turns now end with a copyable `/implement <branch>` block instead. §7 covers
  the local ports; keep the page and those skills consistent.
- **The tombstone practice.** Retired work isn't deleted but left as `retired.md` with an
  archive SHA (`bubble/`, `legacy-data/`, `scripts/etl/`, `MIGRATION_PLAN.retired.md`), made a
  CLAUDE.md rule in `19375c2fd`. In an agent-driven codebase, where the agent's context is
  whatever the repo says, "why is this gone" is a question the repo has to answer by itself.
- **`docs/remove-before-merging/`, with the number that makes it land.** Working artifacts —
  squash proposals, preview screenshots, log dumps — live in a directory whose name is the
  instruction, swept by `/finalize` before merge. Across ~1,000 merged PRs, **exactly 4 files
  ever reached `main`**, and one of those 4 was a 984,924-byte Railway log dump containing
  customer email addresses (#2234, added `0b46440b9`, removed `e08b3fc8d`). `/finalize` now
  cites its own breach in the step that does the sweeping. A convention that holds 99.6% of the
  time and fails once, expensively, is more useful than either "it works" or "it doesn't".
  _When recomputing, count on `main` only: across all refs these files appear in ~150 commits,
  which is by design — feature branches are where they're supposed to live._

#### Part 3 — The interesting trouble

The reversals and the good bugs. A case study with none of these reads as marketing; this is the
part that makes a skeptical reader trust part 2. For each reversal: what was chosen, what it
cost, what replaced it, and what the tell was that it needed replacing.

**Three reversals carry the section.**

- **Cloud Run.** Railway (`8af1cf5fa`, Mar 6) → Cloud Run (`dd648f84e`, Mar 10) → on hold
  (`765cf7e21`, Mar 12: "GCP org policy complexity and unconfirmed $25k credits have paused this
  path") → deleted (`ed19d7d06`, Aug 5). Get the shape right, because it _is_ the story: the
  decision was **live for two days and took five months to finish reversing.** Unwinding it
  meant unwinding rationale that had justified unrelated present-day choices by Cloud Run's
  properties — postgres.js's persistent-server fit, pnpm's Dockerfile integration, a future
  worker as a second service, Turso's edge advantage, the reverse-proxy example lists in
  `network.ts` and `no-next-url-clone-redirect.ts`. The lesson is in the deletion commit: a
  _parked_ decision keeps costing you, because other decisions start citing it. The best story
  in the repo — a wrong turn whose real cost was bookkeeping, not compute.
- **Deleting per-PR CI** (`6c1adca44`, #2329). Actions spend ran ~$190/mo against a
  2,000-minute free allowance, with the per-PR test lane at 69% of it — re-running a suite the
  agent can run locally for free. `DECISIONS_SUMMARY.md` has the number the commit doesn't:
  **~$190/mo → ~$4/mo.** What makes it a decision rather than a cost cut is what it refused: it
  reproduced the old lane's change-picking rather than degrading to a ~9-minute whole-repo run,
  "a check people skip" — then found the old lane had been silently under-selecting (editing the
  RTL setup selected 170 of 526 tests) and set `forceRerunTriggers` explicitly, so the
  replacement is _better_ than what it replaced, not merely equal. State the cost in the
  decision doc's own blunt terms: "a broken Stripe webhook or member-role check can reach `main`
  and sit until the nightly — contained by `main` deploying only to `dev` and the release gate
  running everything." A PR now carries no verdict at all, so verification became a written
  attestation backstopped by a release gate.
- **`/flow`, built and deleted (~2 months).** A bespoke DAG project-management system with
  per-agent-persona team files, an orphan coordination branch, sync scripts and two skills —
  abandoned for plain GitHub Issues (`bf56cb022`, #836). One artifact survived because it earned
  it (`/propose-issue`); the `last-flow-docs` tag is the tombstone. The honest read: an
  agent-driven codebase makes it cheap to build elaborate process machinery, which is exactly
  why it needs deleting when it doesn't pay.

**The cutover's three good problems.** Migrations that complete are rarer than migrations that
are announced, and this one completed — but the specifics are what make that land:

- **Passwords couldn't come across.** Bubble's hashes were proprietary. So
  (`docs/decisions/auth-identity-migration.md`) every user was pre-created in Supabase Auth via
  the admin API with **no password supplied**, plus a `requires_password_reset_after_migration`
  column — needed because GoTrue auto-generates a random hash during `admin.createUser`, making
  `encrypted_password` useless as a marker. Reset happens **lazily, on first failed login**, with
  no cutover-day mass email. The accepted cost is stated in the doc: the login form leaks the
  existence of fully-activated accounts, mitigated by rate limiting. A migration constraint, a
  non-obvious solution and an owned tradeoff in one story.
- **The old vectors had to stay readable.** `weaviate-tenant-routing.md`: route each call by the
  _shape_ of the tenant name — a UUID goes to the new cluster, anything else (a Bubble id) to
  production, with graceful fallback. No vector copying between clusters, and non-prod
  environments can read live Bubble data for the length of the window.
- **One schema change shipped with its own undo.** `drizzle/rollback-cut-12.sql` is the only
  `.sql` file outside the migration journal: 22 hand-written, commented lines (`864523920`) that
  restore the `chats.created_by` FK, backfill it the other way, delete the two rows from
  `drizzle.__drizzle_migrations` so Drizzle stops believing they're applied, and explain why it's
  safe against soft-deleted members. Small, secret-free, and concrete evidence the cutover was
  planned as reversible. A good snippet.

**Bugs worth a sentence each**, chosen because each one has a mechanism a reader can learn from:

- **`usage_logs` persisted 0 tokens on every insert.** A hand-written `LogUsageParams` had
  `tokenCounts: { input, output }` while the columns are `inputTokens`/`outputTokens`; Drizzle
  silently dropped the mismatched fields. Deriving the type from `typeof usageLogs.$inferInsert`
  surfaced it — and produced the rule that anything whose shape tracks another declaration must
  be derived, now machine-enforced by `pnpm type-overlap` at threshold 1.
- **"Draw a dog" produced empty assistant messages.** AI SDK v6 put OpenAI's `image_generation`
  output in `staticToolResults`, not `result.files`, and the streaming pipeline only checked the
  latter — so generated images were silently dropped. Produced the never-swallow-errors rule,
  later tightened to "a logged-and-continued error is a silent fail with paperwork".
- **One dropped Stripe event froze a renewal permanently.** `invoice.paid` was the only routine
  writer of `current_period_end` after activation (#2178), so a single missed event stuck the
  anchor forever; fixed by adding a second, deliberately narrow writer.
- **A Stripe customer for every abandoned checkout.** Creating it while building the checkout
  URL left a customer-bearing row for visitors who never paid — "four in production, one more
  every ~11 days" (#1906). Moving creation to payment fixed it, with an accepted cost stated: a
  payer who edits their email on Stripe's page defeats reuse-by-email.
- **The chat-list rewrite** (`1d227b9a6`, #2006): multiple independent representations of "what
  chats exist" reconciled by hand, replaced wholesale by TanStack Query + normalization +
  zustand, staged behind an invariant ledger carrying forward every behavior the prior patches
  bought. The framing is the point — it eliminated the reported glitches "as classes rather than
  patches". Two decision docs exist for this area, so the first design was documented before it
  was replaced.

**Close on what the record can't tell you.** Across five months the same work got recorded three
different ways: agent as `Co-authored-by` trailer, agent as the commit _author_ (37 Claude, 3
Cursor), and no trailer at all (185 commits). None of those distinguishes "a human typed this"
from "an agent typed this under direction" — the trailer records which tool ran and whether its
convention survived, nothing more. The trailer strings are a rough log of which model was
working when: `Claude Sonnet 4.6` in early March, then `Opus 4.6`, `Opus 4.6 (1M context)`,
`Opus 4.7`, then a generic `Claude` from May as the trailer stopped naming the model.

So: **in an agent-driven codebase the commit record can no longer answer "who wrote this"**, and
the useful question shifts to who specified it, who reviewed it, and who owns it when it breaks.
Say that plainly rather than reporting co-authorship percentages as if they were measurements —
and note that this is a problem the whole industry is about to have, not a quirk of one repo's
discipline.

One artifact makes it concrete better than any statistic: a review comment on PR #2019 addressed
to a human and an agent in the same breath — _"some questions are more to @Saam-G than to the
agent — don't proceed until you get an answer on those from him ;-)"_. It names a teammate, so
it is consent-gated with everything else in §6 note 7.

**One tension worth holding rather than resolving** — include it if the page has room, because
it's the most self-aware thing available. `DECISIONS_SUMMARY.md` opens by stating a philosophy:
"Decisions are generally made at the point where they're needed, not speculatively upfront — the
testing framework decision, for example, was taken when the first production code shipped, not
before." Set that beside `66bbf9156` (2026-03-21), a "Week 2 employee assessment" synthesizing
five independent model assessments of the author's own work, which **downgrades its own level
assessment from "Staff engineer" to "Strong Senior"** and flags over-engineering (46% docs
commits, 8.5% feat commits) at exactly the moment the philosophy says decisions were being
deferred. Both are real; they disagree. **Flag this for Vova before publishing** — it reads as
candour in context and as damage out of it, and it is his call.

## 5. Deliverable 3 — entry points

The page is worthless unlinked. Two links, both English-only surfaces:

- `app/HomePage.tsx:149` — the "Professional Work" block under `/dev`. Add Playgram with a link
  to the case study. Match the surrounding card markup rather than adding a new component.
- `app/[locale]/cv/CVPage.tsx` — the **new Playgram card** added in §3. Add a "read the case
  study" link. Because this card renders in both locales, the link label needs a translation key
  in both message files; the _destination_ stays the English page.
- The link must be `print:hidden` or rendered as a bare URL in print — a "read more" link is
  dead text in the PDF export that `/cv` is built to produce.

## 6. Attribution — hard rules

Non-negotiable, and worth getting exactly right; this is the part that can quietly damage
someone if handled carelessly.

1. **Publish a specific figure with its denominator**, recomputed at write time and dated:
   _"authored ~92% of commits and ~92% of lines (1,394 of 1,510 commits; 1,096 of 1,222 PRs),
   and personally reviewed and merged every pull request the three other engineers landed but
   one."_ Do not round up to "almost all" or "essentially everything" — the specific number is
   what makes it credible.
2. **Name the teammates by what they actually built.**
   - **Mina Rotari** — onboarding, auth, chat UI, icon assets. 51 commits from 2026-05-11.
   - **Semyon "Sam" Golovachev** — the deepest of the three: model catalog, usage analytics,
     member groups, and **DB migrations** (`src/shared/db`, `_journal.json`). 35 commits.
   - **Julia Suhovici** — the **billing and subscription surface**, project management, a
     backfill script. 30 commits.

   That is more credit than a closing "thanks to the team", and it is also what makes the ~92%
   checkable rather than boastful. Do not attach individual percentages to named people; describe
   scope of ownership instead.

3. **Use they/them throughout for all three.** Their pronouns are not documented anywhere in the
   repo, and a name is not evidence. Do not infer.
4. **Say that the whole team was agent-assisted, without quoting trailer rates.** Presenting Vova
   as the agent-driven one and the others as conventional engineers would be a distortion. State
   it qualitatively: trailer presence tracks which tool was used and whether its trailer
   survived, not whether a human typed the code, so any percentage built on it is a floor and
   reads as a precision the data does not have.
5. **Claim the harness, not the typing.** What is uniquely his: 33 skills, 116 revisions of
   `CLAUDE.md`, 27 project-local ESLint rules, the `vet` gate, and the review record — 112 of 113
   non-Vova merged PRs merged by him, and **he was the sole reviewer on every pull request in the
   repository** (verified; see §2, item 1 for the query caveat). That cuts both ways and is worth
   stating plainly: a real load-bearing contribution, and a single point of failure.

   The reviewing itself was substantive, which is worth showing because "merged 112 of 113" alone
   reads like rubber-stamping: 52 of the 126 non-Vova PRs carry a formal review, and those 52
   hold **167 review events** — 149 `COMMENTED`, 16 `APPROVED`, 2 `CHANGES_REQUESTED` —
   including multi-round threads (#2099 alternates a dozen times). Attribute the reviewing to him
   and the replies to the authors; the teammates reviewed nothing, and the page should not imply
   otherwise.

6. **State the 156 closed-unmerged PRs** (14.2% of his own) somewhere. Abandoned attempts left
   visible in the record are evidence the process was real rather than curated.
7. **Check with the three of them before publishing their names.** The founder cleared the
   project; individuals clearing their own names is separate. This also covers the PR #2019
   review quote in §4. Flag it for Vova rather than deciding it during implementation.
8. **Two publication risks are real — neither blocks this work, but don't contradict them.**
   `docs/remove-before-merging/logs.1785761954545.json` (984,924 bytes of Railway production
   logs, customer emails) is reachable in `main`'s history, and `legacy-data/` at `455ed3d` still
   holds `Users.csv`, `Chats.csv`, `Usage-logs.csv` and the rest of the Bubble export — with a
   recovery recipe written into `legacy-data/retired.md` by design. The case study is safe to
   publish; **the repository cannot be made public without rewriting history**, so nothing on the
   page should invite anyone to ask for the repo. Also redact before quoting: `.env.local.example`
   holds real full-length internal service URLs (no secret values), and `release: 4.2.0 RapidDev
workspace cutover` names a customer — genericize to "first enterprise workspace cutover"
   unless consent exists.

## 7. The `/plan` and `/implement` skills

`playgramapp` has `/plan` and `/implement` skills that the owner wants reproduced here "to the
extent that makes sense locally". They are also subject matter for §4's part 2c.

**Done.** `.claude/skills/plan/SKILL.md` and `.claude/skills/implement/SKILL.md` are adapted from
the originals, and each ends with a "Local deviations" section recording what changed and why.
Diff them against `playgramapp/.claude/skills/{plan,implement}/SKILL.md` directly rather than
against the dossier's reproduction of them.

What was dropped, and why it matters for the case study: `/from-branch`, `/dry`, `/tighten-docs`,
`/pr`, `/finalize`, `pnpm vet`, the `## DRY notes` requirement, and the rule that plan files must
never reach `main`. That last one **inverts** here — in `playgramapp` the plan is a transient
artifact `/finalize` deletes before the PR; in this repo it is the deliverable. The portable core
turned out to be small: the file-based gate and the question format. The rest was load-bearing
only against that repo's specific machinery.

## 8. Verification

```bash
pnpm install
pnpm lint            # eslint --fix
pnpm format:check    # prettier
pnpm build           # must succeed under output:'export'
```

**`pnpm format:check` is red on `main` for exactly one file — `.vscode/settings.json`.** Verified
on `main` at `cd238bb`. The gate passes if the failure list is exactly that file. Don't reformat
it as a drive-by; it would bury the real diff. Fixing it is a reasonable separate change and
worth doing at some point, since a permanently-red check trains everyone to ignore it.

`docs/playgram-dossier.md` is in `.prettierignore` on purpose: it is a verbatim mined record
containing nested code fences (a 4-backtick block wrapping 3-backtick blocks) that reflowing
would mangle.

Then confirm:

- [ ] `/case/playgram` renders in light **and** dark mode; no element defined only in one theme.
- [ ] No horizontal scroll on the page body at 375px width; wide blocks scroll internally.
- [ ] `/en/cv` and `/ru/cv` both render — `ru.json` structurally matches `en.json`.
- [ ] The `/cv` print view is clean: no orphaned "read more" links, no broken page breaks.
- [ ] The case study is reachable from the homepage and from the CV.
- [ ] No code excerpt contains a secret, credential, internal endpoint, or anything resembling
      user data. Re-read the dossier's §10 before quoting anything.
- [ ] Every number was **recomputed against the clone during this session**, not copied from the
      dossier, and the page carries an as-of date.
- [ ] Every claim about what a change _meant_ was checked against the commit body, the decision
      doc, or the schema — not inferred from a commit subject.

## 9. Out of scope

- Publishing the standalone agentic-infrastructure essay (drafted later from §4's part 2c).
- Russian translation of the case study page.
- Any change to the `playgramapp` repository itself.
- **Auditing that repo's documentation.** Verification turned up one stale decision doc (§2,
  item 2). Mention it to Vova in a sentence and move on — this plan exists to produce a CV entry
  and a case study. Verify the claims you intend to publish; don't go hunting for more drift.
- Backfilling the other CV entries, however tempting once the Playgram entry is sharper next to
  them. `project1` in particular is a different engagement and is not ours to touch here.
