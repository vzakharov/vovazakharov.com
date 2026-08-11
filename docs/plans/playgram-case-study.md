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

The distinctive claim, and the reason the case study is worth writing at all: **one person
plus Claude shipped ~99% of the code**, with the remaining ~1% coming from teammates who
joined in the final 1–2 months and whose work Vova reviewed. That is the headline, not a
caveat. See §6 for how to state it without either underselling it or shading the truth.

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

### Getting it

`Playgramai/playgramapp` is **not reachable from a `vovazakharov.com` session** — `add_repo`
refuses cross-owner adds, `gh api repos/Playgramai/playgramapp` returns 403 for this
session's scope, GraphQL is pinned to PR-review operations, and a direct `git clone` hangs.
Mine it from a session rooted at that repo instead (`create_session` with
`source_url: https://github.com/Playgramai/playgramapp`, or open a session there directly).

**Retrieval is manual.** A cloud sibling session cannot hand its output back
programmatically: `get_session` returns status only, there is no `list_events` in this tool
set, and `SendMessage`/`ListAgents` do not reach cloud sessions. So the mining session writes
`DOSSIER.md` in its own container and you copy the text across by hand.

A mining session was already started for this: **`session_017j8eoWqeFP6TSNLK5No17w`**, tagged
`playgram-case-study`. Open it, take `DOSSIER.md`, and paste it in as the file below. If it
never finished, its prompt is worth re-running: it asks for the skills text first (§7), then
product, stack, timeline with weekly cadence, agentic-infra evolution, decision record,
schema history, exact attribution numbers, vetted snippets, hard numbers, and publication risks.

### Where it goes

```
docs/plans/playgram-dossier.md      # committed alongside this plan
```

The dossier is committed — it's internal in the sense that **no public page renders it**, not
in the sense of being kept out of git. Keeping it in-repo means the numbers on the CV and the
case study stay traceable to a source that travels with them.

One thing to actually read before committing it: this repository is public
(`vzakharov/vovazakharov.com`, GitHub Pages), so committing publishes. Skim dossier §10
(publication risks) and §7 (per-contributor statistics) first — the founder has cleared the
project's disclosure, but leaked credentials in git history and teammates' individual commit
numbers are the two things that clearance doesn't automatically cover. Cut or redact anything
in those two categories; everything else goes in as mined.

### Dates

Take the real first- and last-commit dates from the dossier rather than the approximate
"last five months". Also check whether meaningful work predates the repo's first commit — a
discovery or prototyping phase is worth stating if it happened, and is easy to lose when the
dates come from git alone.

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

- **RLS enabled on every table with no policies**, so Postgres denies anything that isn't the
  trusted server connection. A deny-by-default posture rather than a policy surface to get
  wrong — non-obvious, and a good snippet.
- **`import 'server-only'` placed only on the most upstream file**, letting the taint trickle
  down the import chain instead of being re-declared per consumer — with a custom
  `poison-check` script catching accidental client imports before a build.
- **A single LiteLLM proxy** as the one entry point for every provider, instead of per-provider
  SDKs.
- **Feature-Sliced Design + BFF**, with structure enforced by `lint:fsd` rather than by review.
- **The release-commit promotion model** — a `release: X.Y.Z` commit merged to `staging` arms a
  gated nightly rollout.

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

1. **Derive every number from the dossier's git data.** No estimates. If the dossier says
   the real figure is 97% rather than 99%, publish 97%.
2. **Name the teammates by what they actually built**, from their real commit and PR
   history — "X built the Y flow" credits a person far more concretely than a closing
   "thanks to the team", and it is also what makes the 99% claim verifiable rather than
   boastful. Do not attach percentages to individuals in a way that reads as diminishing
   them; describe scope of ownership instead.
3. **Use they/them for anyone whose pronouns aren't documented.** Do not infer pronouns
   from names.
4. **Be precise about the division of labour.** The accurate framing is: Vova directed,
   Claude generated, Vova reviewed every line — and separately, Vova built the harness that
   made that throughput possible. The work being claimed is architecture, specification,
   review, and tooling, not typing. State that, and let the cadence numbers carry the
   argument instead of adjectives.
5. **Don't let the agent story erase the humans, or the humans blur the agent story.** Both
   facts are interesting and neither needs softening.
6. If any teammate is named, they should be fine with being named. Flag this for the owner
   before publishing rather than deciding it in the implementation.

## 7. Port the `/plan` and `/implement` skills

`playgramapp` has `/plan` and `/implement` skills that the owner wants reproduced in this
repo "to the extent that makes sense locally". They are also subject matter for §4 part D.

**Already done, but as an adaptation rather than a port:** `.claude/skills/plan/SKILL.md` and
`.claude/skills/implement/SKILL.md` now exist here. They were written **without access to the
playgramapp originals** — see §2; the verbatim text was not retrievable from a
`vovazakharov.com` session, and cross-session messaging could not reach the mining session
either. What they encode instead is the `/plan` → `/implement` split plus the repo-specific
constraints that were actually verified while writing this plan (public repo, static export,
i18n key parity, theme parity, print view, design language).

Remaining work:

- **Reconcile against the originals.** Read `playgramapp`'s `.claude/skills/` and
  `.claude/commands/`, then diff intent against the two local skills. Pull across anything
  genuinely portable that is missing, and delete anything local that the original teaches is
  wrong. Remove the "not yet reconciled" note in each file's header once done.
- **Adapt, don't transplant.** This repo is a small static Next.js site with no test suite;
  its verification surface is `pnpm lint`, `pnpm format:check`, and `pnpm build`. Rules
  referencing `playgramapp`'s test gates, migrations, monorepo packages, or backend services
  should be dropped or rewritten against those three commands, not carried over dead.
- **Note what was dropped and why.** That list is itself material for the case study's meta
  section: it shows which parts of the harness were project-specific and which were portable.

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
