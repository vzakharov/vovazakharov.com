# Plan: Playgram resume entry + case study

**Status:** ready to implement. Written to be executed from a cold session with no prior context.
**Branch:** `claude/playgramapp-resume-case-study-exozpz`

## 0. What this is

Five months of work on `Playgramai/playgramapp` (private) is currently suspended for lack of
funding, with Vova staying on part-time for ongoing issues. The work is worth putting on the
record.

**What Playgram is** (from the repo README — confirm details against the dossier):
a multi-model AI chat platform for teams, serving `app.playgram.ai`. Team workspaces with
project-level roles and invitations, chat across many LLM providers through a single LiteLLM
proxy, file handling, vector search and persistent memory over Weaviate, deep-research runs,
an editable canvas with PDF export, voice input, and Stripe billing.

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
metric you pick (dossier §7.5, which computes six of them). Publish a specific figure with its
denominator rather than a qualitative "almost all" — the specificity is what makes it credible,
and every row below is checkable against the git history.

**Attribution note, confirmed with Vova:** the 37 commits authored by
`Claude <noreply@anthropic.com>` and the 3 by `Cursor Agent` are **his** — agent runs he
directed where the harness wrote itself into the author field instead of the co-author trailer.
They are ad-hoc misattribution, not third-party contributions, and the figures below already
fold them in.

| Metric                                 | Vova's share               |
| -------------------------------------- | -------------------------- |
| Commits authored (of 1,509)            | **92.38%** (1,394)         |
| Lines added, excluding generated files | 91.75% (602,064 / 656,196) |
| Net lines added−removed                | 87.95% (287,719 / 327,122) |
| PRs authored (of 1,222)                | 89.69% (1,096)             |
| Merged PRs authored (of 1,035)         | 89.18% (923)               |
| Other humans' merged PRs he merged     | **111 of 112**             |

Net lines is the least flattering row and worth understanding rather than dropping: the
agent-authored commits were net **deletions** (−705 and −1,630), so folding them in lowers the
net share slightly while raising the commit share. The stable fact underneath, unchanged by any
attribution choice: **the other three engineers account for ~12% of net lines** (+39,403).

Two things the dossier corrects, both of which should be stated rather than smoothed over:

1. **The other three engineers did real work** — 115 commits, 112 merged PRs, +39,403 net
   lines (12% of net), including DB migrations and the subscription surface. Not cosmetics.
   They also joined earlier than remembered: May 1–11, so they were present for three of the
   five months, not the final one or two.
2. **Essentially all of it was AI-assisted, by everyone.** Confirmed with Vova: a missing
   `Co-authored-by` trailer does not mean a commit was hand-written — it means the trailer was
   dropped, or a different tool was used. So do **not** publish the trailer rates (84.6% for
   Vova, 85.2% for the others) as if they measured AI involvement; they measure tooling
   discipline. The dossier says as much for Vova's own commits — 185 carry no trailer at all,
   discipline was weakest in April–May, and 84.6% is "a floor, not a measurement". The
   defensible claim is qualitative: the agent-assisted workflow was the team's, not one
   person's, and no one on the project was working any other way.

Which points at the _actual_ distinctive claim, and it is a better one than the percentage:
**what is uniquely his is the machine the whole team shipped through** — all 33 skills, the
116 revisions of `CLAUDE.md`, the 27 project-local ESLint rules, and the `vet` gate. Everyone
on the project was agent-assisted; one person built the harness that made that safe. Lead with
that, support it with ~92% authorship, and let the review record (111 of 112 non-Vova PRs
merged by him, and no PR in the repo ever reviewed by anyone else) carry the rest. See §6.

## 1. Decisions already locked

Do not re-litigate these; they came from the project owner.

| Question                       | Decision                                                                                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Disclosure                     | **Full.** The founder has approved naming Playgram, describing the architecture, and publishing individual code snippets. Not the whole codebase.        |
| Artifacts                      | Dossier (committed to this repo, but no page renders it) + CV entry + case study page.                                                                   |
| Standalone agentic-infra essay | **Out of scope for now.** The meta-lessons go into the case study as a section (§4, part D). A Substack version can be spun out later from that section. |
| i18n                           | CV entry: **both `en` and `ru`**. Case study: **English only**, consistent with `app/HomePage.tsx`, which is not localized.                              |

## 2. Prerequisite: the dossier

**Do not write either artifact from memory.** Five months after the fact, memory produces
adjectives ("scalable AI platform") where the reader needs specifics. The input to all
writing below is a facts dossier mined from the `playgramapp` git history: named timeline
phases with dates and SHAs, weekly commit/diff cadence, the full evolution of the
`CLAUDE.md` / `.claude/rules/` instruction files, merged-PR decision record, schema history,
exact per-contributor attribution numbers, and 4–8 vetted code snippets.

Three places in that repo are worth reading directly, beyond whatever the dossier summarises:
`docs/DECISIONS_SUMMARY.md` (the master index of architecture decisions), `eslint/` (the
project-local custom lint rules — conventions made machine-checkable), and the `retired.md`
tombstones in `bubble/` and `legacy-data/` (what the Bubble cutover actually entailed).

### It is already here

```
docs/playgram-dossier.md      # 1,910 lines, tracked and pushed
```

It lives in `docs/`, deliberately **not** in `docs/plans/`: `/implement` globs `docs/plans/*.md`
and expects to find exactly one file there, so a reference document sitting alongside the plan
would read as a second plan and stall the session with "which one?".

Mined by a session rooted at `playgramapp` (this repo's sessions cannot reach that repo —
`add_repo` refuses cross-owner adds and `gh` 403s), then carried across by hand. It is
committed rather than gitignored: internal here means **no public page renders it**, not kept
out of git, and keeping it in-repo means every number on the CV and the case study stays
traceable to its source.

**Read it before writing anything.** It is the only source for facts about a repo the writing
session cannot open. Its §10 lists publication risks — check it before quoting code.

### The facts that anchor everything

| Fact                    | Value                                                                |
| ----------------------- | -------------------------------------------------------------------- |
| First commit            | `5461cd56`, **2026-03-06**                                           |
| Last commit on `main`   | `4cd68a75`, **2026-08-11**                                           |
| Span                    | 158 days (~22.6 weeks), 1,509 commits on `main`                      |
| First production deploy | `0bf12dec9`, **2026-05-21** — release 4.0.0                          |
| Bubble fully retired    | `17862eb9c`, **2026-07-11** — release 4.3.0, all workspaces over     |
| Application code        | ~269,864 LOC; tests 118,318 LOC across 687 files                     |
| Migrations              | 115                                                                  |
| PRs / issues            | 1,222 PRs (1,035 merged), 1,214 issues                               |
| Agent infrastructure    | 33 skills, 10 rule files, 116 `CLAUDE.md` revisions, 27 ESLint rules |

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
- **`period`** — real dates from the dossier, and say plainly that the project is suspended
  for funding with ongoing part-time involvement. Flat statement, no spin; everyone in this
  industry knows what running out of runway means, and hedging it reads worse than owning it.
- **`description`** — a multi-model AI chat platform for teams, and the fact that it is a
  completed rebuild off Bubble.io. Lead with the rebuild; it is the rarer thing.
- **`items`** — 4–6 bullets, each carrying a **specific** fact from the dossier (a number, a
  named subsystem, a real architectural decision). No bullet may survive that would still be
  true of a generic AI side project. Two are close to writing themselves: the completed
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

English-only, so it does **not** go under `app/[locale]/`. Mirror the plain-route pattern:

```
app/case/playgram/page.tsx        # metadata via constructMetadata() + default export
app/case/playgram/CaseStudy.tsx   # the content itself
```

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

**B. Timeline.** The named phases from dossier §3 with real dates, organised around the
migration: what shipped before the cutover, what the cutover itself required, what came after.
Narrate the _shape_ of the five months, not a commit log. Fold in the schema evolution (dossier
§6) — migrations are the cleanest available proxy for how the domain model was actually
understood over time, and a Bubble-to-Postgres remodel makes that unusually legible.

The cutover deserves specifics: how the switch was sequenced, what was done about live data,
and what "Bubble is retired but frozen as an archive" meant in practice. Migrations that
complete are rarer than migrations that are announced, and this one completed.

**C. Decisions, including the wrong ones.** From dossier §5. Prioritise **reversals** — things
built and then replaced, directions abandoned. A case study with no reversals reads as
marketing; the reversals are what make a skeptical reader trust the rest. For each: what was
chosen, what it cost, what replaced it, what the tell was that it needed replacing.

Candidates already visible in the README, worth expanding from `docs/decisions/` (the repo
keeps a `DECISIONS_SUMMARY.md` master index, which is the place to start):

The dossier's §5 found nine, ranked by cost. The three that carry the section:

- **R-1: the Cloud Run detour (5 months).** Railway → Cloud Run → parked on unconfirmed $25k
  credits → deleted. The lesson is in the deletion commit (`ed19d7d06`): a _parked_ decision
  keeps costing you, because other decisions start citing it. Unwinding it meant unwinding
  rationale that had justified unrelated present-day choices by Cloud Run's properties. This is
  the best story in the repo — a wrong turn whose real cost was bookkeeping, not compute.
- **R-3: deleting per-PR CI (`6c1adca44`).** Actions spend ran ~$190/mo against a 2,000-minute
  free allowance, with the per-PR test lane at 69% of it — re-running a suite the agent can run
  locally for free. What makes it a decision rather than a cost cut is what it refused: it
  reproduced the old lane's change-picking rather than degrading to a 9-minute whole-repo run
  "a check people skip", then found the old lane had been silently under-selecting (editing the
  RTL setup selected 170 of 526 tests) and set `forceRerunTriggers` explicitly so the
  replacement is _better_ than what it replaced. Cost stated honestly: a PR now carries no
  verdict, so verification became a written attestation backstopped by a release gate.
- **R-2: `/flow`, built and deleted (~2 months).** A bespoke DAG project-management system with
  per-agent-persona team files, a coordination branch, sync scripts, two skills — abandoned for
  plain GitHub Issues. One artifact survived because it earned it (`/propose-issue`). The
  honest read: an agent-driven codebase makes it cheap to build elaborate process machinery,
  which is exactly why it needs deleting when it doesn't pay.

Also available, and worth a line each rather than a section: **RLS on every table with zero
policies** (deny-by-default, enforced by a custom `playgram/enforce-rls` lint rule, and the
_second_ migration in the repo); **`server-only` taint by import chain** with `poison-check`
walking the madge graph; **the five-suffix barrel system** encoding access level rather than
visibility; **R-4's chat-list rewrite**, which eliminated glitches "as classes rather than
patches" and was staged behind an invariant ledger.

**D. Running an agent-driven codebase — the meta section.** The most broadly interesting part,
and the part nobody else can write. Source: dossier §4 — the version history of `CLAUDE.md` and
`.claude/rules/`. Every diff to those files is a lesson with a timestamp and, usually, a
visible incident in the surrounding commits. Structure each as **rule added → the problem that
caused it**, which is concrete where "lessons learned" lists are vague.

The strongest thesis available here, and the README already evidences it: **the guardrails are
machine-checked, not written down as prose for the agent to remember.** `pnpm vet` chains
typegen, typecheck, format, lint, FSD structure (Steiger), knip, circular-dependency checks,
`poison-check`, `security-diff`, and tests; there are **project-local custom ESLint rules** in
`eslint/`; `db:chain-check` verifies the migration journal chain; tests are split into buckets
by what credentials they need (default / integration / external / e2e) so the no-env bucket
runs anywhere. Convention that can fail a command does not depend on the agent recalling it.
Draw the contrast explicitly with rules that stayed prose, and how those fared.

Also worth covering:

- The `/plan` → `/implement` split and what separating them solved (see §7 — those skills are
  being reproduced in this repo, so the case study and the local skills should agree).
- The **tombstone practice**: retired work is not deleted but left as `retired.md` with an
  archive SHA (`bubble/`, `legacy-data/`, `MIGRATION_PLAN.retired.md`). In an agent-driven
  codebase, where the agent's only context is what the repo says, "why is this gone" is a
  question the repo has to answer by itself.
- **Git attribution stops meaning what it used to mean**, and this repo is a good exhibit.
  Across five months the same work got recorded three different ways: agent as `Co-authored-by`
  trailer, agent as the commit _author_ (37 Claude, 3 Cursor), and no trailer at all (185
  commits). None of those distinguishes "a human typed this" from "an agent typed this under
  direction" — the trailer records which tool ran and whether its convention survived, nothing
  more. The dossier's own §7 tables are built on that signal and inherit its limits.

  The honest conclusion is the interesting one: **in an agent-driven codebase the commit record
  can no longer answer "who wrote this"**, and the useful question shifts to who specified it,
  who reviewed it, and who owns it when it breaks. Say that plainly rather than reporting
  co-authorship percentages as if they were measurements — and note that this is a problem the
  whole industry is about to have, not a quirk of one repo's discipline.

- What did **not** work — abandoned rules, over-engineered scaffolding, guidance the agent kept
  ignoring. The failures are the credible part, and the dossier's instruction-file history will
  show which rules were added and later removed.

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

1. **Publish a specific figure with its denominator**, from dossier §7.5, folding in the
   misattributed agent commits: _"authored ~92% of commits and ~92% of lines (1,394 of 1,509
   commits; 1,096 of 1,222 PRs), and personally reviewed and merged every pull request the
   three other engineers landed but one."_ Do not round up to "almost all" or "essentially
   everything" — the specific number is what makes it credible.
2. **Name the teammates by what they actually built.** From §7.2, which has it precisely:
   - **Mina Rotari** — onboarding, auth, chat UI, icon assets. 51 commits from 2026-05-11.
   - **Semyon "Sam" Golovachev** — the deepest of the three: model catalog, usage analytics,
     member groups, and **DB migrations** (`src/shared/db`, `_journal.json`). 35 commits.
   - **Julia Suhovici** — the **billing and subscription surface**, project management, a
     backfill script. 29 commits.

   That is more credit than a closing "thanks to the team", and it is also what makes the
   ~90% checkable rather than boastful. Do not attach individual percentages to named people;
   describe scope of ownership instead.

3. **Use they/them throughout for all three.** Their pronouns are not documented anywhere in
   the dossier, and a name is not evidence. Do not infer.
4. **Say that the whole team was agent-assisted, without quoting trailer rates.** Presenting
   Vova as the agent-driven one and the others as conventional engineers would be a distortion.
   But state it qualitatively: trailer presence tracks which tool was used and whether its
   trailer survived, not whether a human typed the code, so any percentage built on it is a
   floor and reads as a precision the data does not have.
5. **Claim the harness, not the typing.** What is uniquely his: 33 skills, 116 revisions of
   `CLAUDE.md`, 27 project-local ESLint rules, the `vet` gate, and the review record — 111 of
   112 non-Vova merged PRs merged by him, and **no PR in the repo was ever reviewed by anyone
   else**. That last fact cuts both ways and is worth stating plainly: it is a real load-bearing
   contribution and also a single point of failure.
6. **State the 156 closed-unmerged PRs** (14.2% of his own) somewhere. Abandoned attempts left
   visible in the record are evidence the process was real rather than curated.
7. **Check with the three of them before publishing their names.** The founder cleared the
   project; individuals clearing their own names is separate. Flag it for Vova rather than
   deciding it during implementation.

## 7. Port the `/plan` and `/implement` skills

`playgramapp` has `/plan` and `/implement` skills that the owner wants reproduced in this
repo "to the extent that makes sense locally". They are also subject matter for §4 part D.

**Done.** `.claude/skills/plan/SKILL.md` and `.claude/skills/implement/SKILL.md` are adapted
from the originals, whose verbatim text is in dossier §0.3–0.4. Each file ends with a "Local
deviations" section recording what was changed and why.

What carried over intact — and this is the interesting finding — is that the originals are not
really about planning. They are a **workaround for a broken UI**: in web sessions the plan-mode
approval and `AskUserQuestion` prompts get re-emitted after idle, stacking duplicates and
silently dropping answers to superseded prompts. So plans became files and questions became
numbered prose. Everything else — the `.draft.do-not-implement.md` → `.in-progress.md` →
`.completed.md` lifecycle, the go-ahead-token gate, the handoff block, the canary for a handoff
pasted into the wrong session — is scaffolding built around that one constraint.

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

Then confirm:

- [ ] `/case/playgram` renders in light **and** dark mode; no element defined only in one theme.
- [ ] No horizontal scroll on the page body at 375px width; wide blocks scroll internally.
- [ ] `/en/cv` and `/ru/cv` both render — `ru.json` structurally matches `en.json`.
- [ ] The `/cv` print view is clean: no orphaned "read more" links, no broken page breaks.
- [ ] The case study is reachable from the homepage and from the CV.
- [ ] No code excerpt on
      the page contains a secret, credential, endpoint, or anything resembling user data.
- [ ] Every number on either artifact traces to a dossier line. Anything that doesn't gets cut.

## 9. Out of scope

- Publishing the standalone agentic-infrastructure essay (drafted later from §4 part D).
- Russian translation of the case study page.
- Any change to the `playgramapp` repository itself.
- Backfilling the other CV entries, however tempting once the Playgram entry is sharper next
  to them. `project1` in particular is a different engagement and is not ours to touch here.
