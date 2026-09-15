> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Spinning the late-stage-agentic project into its own repo

`writing/late-stage-agentic/plan.md` has always said the project moves out once
there is enough of it; PR #43 is the point where there is. This plan is the
per-run half of that move. `@.claude/skills/spinoff/SKILL.md` owns the
procedure and is not restated here — what a run of it cannot derive on its own
is the triage's output, the answers to its Step 1 questions, and **the two
places the skill turns out not to reach**, which are what this branch ships
back into it.

## Decisions

|                       |                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Target**            | `vzakharov/latestageagentic.com`, public                                                                                        |
| **Stack**             | the same one — Next.js static export to Pages, Mantine, next-intl. So Step 2's fork resolves to _organization travels as files_ |
| **When**              | after PR #43 has merged, off `main`                                                                                             |
| **The dictation set** | travels as a copy and **stays here too**; nothing about it is removed from this repo                                            |
| **The material**      | leaves. `writing/late-stage-agentic/` is the project, and the project is what moves                                             |

Ruled out along the way: an organisation of its own now, rather than a repo
under `vzakharov` — the org question stays open in `plan.md`, and a transfer
later breaks no clone, watermark or lineage entry, so deciding it here would
only be a guess. Private-until-launch, which the repo's visibility does not buy:
the guard that keeps drafts out of `public/` is about what the site serves.
Moving the dictation set out entirely, and moving it up into
`vzakharov/muthur` — see § "What the two copies cost" below.

The wiki's name blocks nothing: nothing in the seed is named after it.

## When to run, and what the skill says about it

**The skill does not prescribe this.** Step 1 says "read the caller at HEAD" and
never asks what HEAD is; the only place the caller's branch state appears at all
is Step 4's substep 3, which reuses the caller's slug and hash where it is on a
session branch — a naming rule for the target's branch, not a judgment about
whether to wait. So a run today, off `claude/late-stage-agentic-phnz8v`, is
procedurally fine.

It is still wrong here, for a reason particular to this run: the material is on
a branch mid-review with findings still open — the afterword's данность block,
whether `p1` reads better as prose, where the column ends and the wiki begins —
and content copied before those land has every outcome applied twice, in two
repos, by hand. Waiting costs one merge.

That is the first thing the skill learns from this run, and the first of the two
amendments below: the caller's branch state is not the question, **whether the
material travelling through the product hatch is settled is**.

The seed step is supposed to run in the session that holds the context for why
the new repo exists, and this session will not survive the wait. **This file is
that context**, which is what a plan on disk is for.

## Sequencing

1. PR #43 merges. **Its branch is not deleted** — `docs/remove-before-merging/`
   is swept at finalize and the branch is the only thing keeping the recordings
   behind a published piece reachable.
2. A session picks this plan up with `/go claude/spinoff-phnz8v` and runs
   `/spinoff vzakharov/latestageagentic.com` from a tree at `main`. Everything
   it writes lands in the target.
3. The same session, on this branch, does the caller-side half below. That is
   the only work that lands here, and it is why this branch exists rather than
   the plan riding #43 — where `/finalize`'s `git rm -r docs/plans/` would
   delete it at exactly the moment it becomes needed.

## Triage

Stacks match, so organization travels as files. Every path below is sorted into
**copy** (reviewed here, travels unchanged → the target's `main`) or **rewrite**
(written for a repo nobody has looked at → PR #1), which is the line Step 4
lands them on.

### Agent infrastructure — travels unconditionally

| Path                                                                                                                                                                                                                                                                                                            |           | Why                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/` — the loop: `branch-rename`, `check-merge`, `dry`, `finalize`, `from-branch`, `go`, `handle`, `issue`, `override-gh`, `plainly`, `plan`, `pr`, `preview`, `qa-checklist`, `spinoff`, `squash-message`, `sync-branch`, `tend-prose`, `update-muthur`, `watch-ci`                               | copy      | stack-neutral, and `preview` is Next-bound but the stacks match. `plainly/operators.md` travels whole — same operator, nothing to re-derive                                       |
| `.claude/skills/` — the dictation set: `dictation`, `afterword`, `dictation-to-post`, `subtitles`                                                                                                                                                                                                               | copy      | the target's core tooling. Already written generically — `writing/<project>/dictations/`, a language parameter rather than a Russian heading — so nothing in them names this repo |
| `.claude/settings.json`, `.claude/hooks/plan-mode-notice.sh`, `.claude/hooks/session-images.sh`                                                                                                                                                                                                                 | copy      |                                                                                                                                                                                   |
| `.claude/hooks/session-start.sh`                                                                                                                                                                                                                                                                                | **split** | the `gh` proxy shim is loop and travels intact; `pnpm install --frozen-lockfile` is stack-bound and rides PR #1 with the manifest it reads                                        |
| `.claude/rules/README.md`                                                                                                                                                                                                                                                                                       | copy      | the mechanism                                                                                                                                                                     |
| `scripts/`: `check-merge.sh`, `check-skill-catalog.sh`, `check-squash-message.sh`, `ci-watch-tick.sh`, `export-github-item.py`, `extract-session-images.py`, `gh_export/`, `lib/gh-repo.sh`, `lib/github.py`, `lib/media.py`, `lib/watch-tick-common.sh`, `pr-body.py`, `run-parallel.sh`, `test_authorship.py` | copy      | the scripts the loop's own skills call                                                                                                                                            |
| `scripts/transcribe.py`                                                                                                                                                                                                                                                                                         | copy      | the deterministic half of `/dictation`; `lib/media.py` is already travelling above                                                                                                |

### Stack scaffolding — organization, rewritten for the target

| Path                                                                                                                                                                           | Note                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CLAUDE.md`                                                                                                                                                                    | § "About this project", "Repository layout", "Vetting", "Working with skills" are written for the target. § "Language" is **re-decided, not inherited** — this one serves an English site with a Russian channel beside it, which is not the caller's answer by default                                      |
| `README.md`                                                                                                                                                                    | the caller's is the site's own and answers a different question                                                                                                                                                                                                                                              |
| `scripts/vet.sh`                                                                                                                                                               | the real one, rewritten for the target's roster. See the `main` floor below for the stub that precedes it                                                                                                                                                                                                    |
| `package.json`                                                                                                                                                                 | the **declaration** is rewritten — the content-pipeline and CV dependencies drop; `pnpm-lock.yaml` is **regenerated, not copied**, and the deliberate constraints (the pinned `next`, `react`, `eslint-config-next`, `@steiger/toolkit`) carry across by hand, which is the part a regenerate loses silently |
| `eslint.config.ts`, `eslint/`, `stylelint.config.mjs`, `steiger.config.mjs`, `tsconfig.json`, `next.config.ts`, `css.d.ts`                                                     | the lint discipline and the module-resolution aliases, which are part of the boundary system                                                                                                                                                                                                                 |
| `styles/`, `scripts/generate-styles.ts`, `scripts/lib/chromium.ts`                                                                                                             | design tokens travel as a system; the brand values inside them are the operator's                                                                                                                                                                                                                            |
| `src/` skeleton, root `app/`, `pages/` shadow                                                                                                                                  | the skeleton travels **empty**, the app shell as a reduction — the routing and layout mechanism, not the pages inside it                                                                                                                                                                                     |
| `.claude/rules/fsd.md`                                                                                                                                                         | architecture intact; its slice inventory (`switch-theme`, `home`, `cv`, `case-studies`) is the caller's                                                                                                                                                                                                      |
| `.claude/rules/content.md`                                                                                                                                                     | re-scoped to the target's collections. **The sharpest call in the run**: the rule reads as product-scoped, but a wiki is almost entirely this pipeline, so the mechanism is the most valuable single thing travelling                                                                                        |
| `.claude/rules/writing.md`                                                                                                                                                     | the form and voice rules carry; the backlog pointer at `writing/linkedin/plan.md` and the `source` frontmatter key do not                                                                                                                                                                                    |
| `.github/workflows/deploy.yml`                                                                                                                                                 | **the footgun.** The publish mechanism and the `feat:`/`fix:` subject gate travel; the domain does not. This repo has no `CNAME` — Pages holds the domain in repo settings — so nothing file-shaped carries it across, and pointing the target at `latestageagentic.com` is a by-hand step in the report     |
| `.prettierignore`, `.gitattributes`, `.gitignore`, `.vscode/`, `.prettierrc.json`                                                                                              | editor config; `.prettierignore` names product paths, hence a rewrite                                                                                                                                                                                                                                        |
| `scripts/type-overlap-check.{ts,test.ts,README.md}`, `render-og.ts`, `render-pdf.ts`, `render-mermaid.ts`, `lib/content-tree.ts`, `lib/og-render.ts`, `lib/render-manifest.ts` | stack gates and asset tooling. They arrive **with the stack in PR #1**, not on `main`: a TS gate on a tree with no `package.json` certifies nothing, and `main`'s `vet.sh` must name no stack-specific check. `lib/cv-card.ts` is product and stays                                                          |
| `.claude/rules/eslint.md`, `.claude/rules/styling.md`                                                                                                                          | **copies** — the severity policy and the Mantine layering name no product. The only near-miss is `eslint.md`'s `src/shared/typings`, which is architecture                                                                                                                                                   |

### Product — stays

`src/**` contents, `public/case-studies/`, `public/cv/`, `public/logos/`,
`public/generated/`, `public/ava.png`, `.claude/rules/logos.md`,
`scripts/lib/cv-card.ts`, `scripts/check-notes-length.sh`, `writing/linkedin/`,
`writing/notes/`, `docs/`.

**Through the hatch, onto the target's session branch and never its `main`:**
`writing/late-stage-agentic/**` — the two dictations, the two drafts, the plan —
and the recordings under `docs/remove-before-merging/`. This is the thing the
whole move is for, so it is named in the invocation rather than waited for. It
is also the only thing that **leaves**: everything else travelling is a copy,
which is what the skill does and all it does.

`writing/notes/the-five-percent.md` stays: it is this repo's record of its own
reviews, not content. The target accumulates its own from its first review.

`public/.nojekyll` travels with the deploy mechanism — GitHub Pages strips
`_next/` without it, which is a silent, total failure.

## The watermark

Field-by-field contract:
`@.claude/skills/update-muthur/SKILL.md` § "The watermark". The three values
this run has to get right, each silent when wrong:

- **`repo`** — `vzakharov/muthur`, the root. Never this repo: a sibling of a
  sibling would make a sync walk the ancestry.
- **`lastSyncedSha`** — `a3ec24ec8dc1d3e77338592365da8b7a854d9360`, this repo's
  own, because the files are copied out of a tree synced to exactly that point.
  `lastSyncedAt` likewise: `2026-09-11`.
- **`lineage`** — this repo has no `lineage` array, so the target's is the
  one-entry `["vzakharov/vovazakharov.com"]`. Not a root entry derived from the
  sha, which would claim a birth point nobody recorded.

`adopted` derives from this repo's list restricted to what actually travelled.
**The list was verified against the tree while writing this plan and every path
in it still exists**, so the usual stale-path trap does not apply this run —
re-verify anyway if `main` has moved since. The entries that need editing rather
than dropping: the `CLAUDE.md` note (its § "Language" clause becomes the
target's own decision), and `scripts/vet.sh` (rewritten again, for a roster that
is not this one).

The target's sync skill keeps the name `update-muthur` and the filename
`watermark.json` — the root's names, which are this repo's too, so it travels as
a copy. This tree's copy carries no stub markers to clear.

## The `main` floor, and the one thing that must be written from scratch

`main` gets the copies in one commit, and then must pass `bash
scripts/check-skill-catalog.sh` and `bash scripts/vet.sh` **exiting 0 while
naming no stack-specific check**.

This repo cannot supply that `vet.sh`. Its own is real — `pnpm build`, the
concurrent thirteen — and its `CLAUDE.md` explicitly declined the source's
stackless-vet rule, so there is no stub anywhere in this tree to copy. **A stub
has to be written for the target's `main`**: the loop's own checks only —
`check-skill-catalog.sh`, `check-squash-message.sh`, `test_authorship.py` by
path from `scripts/` — and nothing that reads a `package.json`. Copying this
repo's `vet.sh` onto the target's `main` is the named failure: it reds from the
moment it is seeded and every PR against it opens red.

Two closure knots to expect rather than discover:

- `check-skill-catalog.sh` fails on a dangling `@.claude/skills/…` reference,
  and `/dictation` references all three of `afterword`, `subtitles` and
  `dictation-to-post`. The four travel as a set.
- The sync skill and its watermark land together on `main` or `main` fails its
  own gate: the watermark **is** that skill's hydration.

## What lands on this branch

`/spinoff`'s second invariant makes this repo read-only for the whole run, so
none of this can be inside it. Two things, in this order:

### 1. The amendments the run owes the skill

This is what the PR is, read from this side. Two are visible before the run and
are the ones it is committed to; anything else it surfaces joins them.

- **Nothing in the skill says when to run it relative to the material.** Step 1
  reads the caller at HEAD and never asks what HEAD holds, and the hatch carries
  content that may be mid-review — which is this run's actual constraint and the
  reason it waits for #43. The amendment belongs in § "Step 2 — Triage" beside
  the hatch, where the content is already being named: what travels through it
  is settled content, and an unmerged review is the tell that it is not.
- **The stub `vet.sh` an adopter cannot supply.** Step 4's third consequence
  states the rule — `main`'s `vet.sh` is the stub, and the stub exits 0 — and
  names the failure of copying the real one, but a caller whose own `vet.sh` is
  real has nothing to put there and the skill does not say what to write. It
  should: the loop's own checks, nothing that reads a package manifest. This
  repo is the first caller to hit it, and the next one hits it identically.

Where an amendment is a repo-level rule rather than a procedure, it goes to
`CLAUDE.md` instead and the skill points at it — one home, one pointer.

### 2. The material leaves

`git rm -r writing/late-stage-agentic/`, and one tombstone for the whole
retirement per CLAUDE.md § "Writing things down":
`writing/late-stage-agentic/retired.md`, carrying the last commit that held the
tree, the `git show <sha>:<path>` recipe, and the pointer to where the material
now lives. One tombstone, not one per file.

`CLAUDE.md` § "Repository layout" loses the late-stage half of its `writing/`
cell; `.claude/rules/writing.md` keeps what holds for `writing/linkedin/`. **The
four dictation skills, `scripts/transcribe.py` and their catalogue entries all
stay** — they are tooling, not material, and a recording made here later has
them waiting.

The five-percent file keeps its late-stage entries. They are learnings about how
the agent works, which is this repo's subject, not the project's.

**Deleting `claude/late-stage-agentic-phnz8v` at any point destroys the
recordings.** The tombstone says so.

Then `scripts/check-skill-catalog.sh` and `./scripts/vet.sh` green.

## DRY notes

**The whole operation is a deliberate duplication, and the sharing mechanism is
the watermark rather than a package.** Two repos will carry the same two dozen
skill files. Extracting them into a dependency is the reflex and it is wrong
here: Claude Code loads skills from the tree it opens, so there is no runtime
that could resolve a package, and a shared one would couple two projects' agent
loops so that a change wanted in one lands in the other unreviewed. The copy
plus `/update-muthur`'s triage is what keeps the divergence deliberate and
per-path. `/spinoff` § "The watermark points at the root" already accepts this
cost; this plan does not reopen it.

**What the two copies cost.** The dictation set staying on both sides is the one
duplication with no reconciliation path at all: both repos' watermarks point at
`vzakharov/muthur`, which does not carry these four skills, so `/update-muthur`
never reaches them in either direction and a fix made in one is a fix made in
one. That is accepted rather than solved — the skill's own "once you've raised
your kids, it's their own life to grow", applied to a set of skills instead of a
tree. Moving them out entirely was the single-home answer and costs the ability
to dictate anything here again; moving them up into `vzakharov/muthur` would
give them a real home and make the template carry content production, which is
not what it ships. Revisit if the two copies actually diverge in a way that
matters.

**What is genuinely re-derived rather than shared**: `vet.sh`, `CLAUDE.md`,
`.claude/rules/content.md`, `.claude/rules/writing.md` and `fsd.md`. Each states
a constraint that holds in both repos and an inventory that holds in one, so the
constraint is re-expressed against the target's tree rather than copied and
patched. Copying and patching is what produces a file describing a repository
that does not exist, which is the failure the caller's own `adopted` notes keep
flagging.

**No new abstraction is introduced by this plan**, in either repo.
