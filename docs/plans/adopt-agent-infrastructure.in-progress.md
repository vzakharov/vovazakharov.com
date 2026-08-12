# Adopt the agent infrastructure from `agent-project-boilerplate`

Bring the agent infrastructure from
[`vzakharov/agent-project-boilerplate`](https://github.com/vzakharov/agent-project-boilerplate)
into this repo, following that repo's `ADOPTING.md` § "Adopt into an existing
repo" and its `docs/catalog.md` group criteria.

- **Source SHA cloned for this work:** `1f6ee79f1bfd75eb8329f031591a7eb5e81cc705`
- **Clone location (throwaway):** session scratchpad, never committed.

## Repo profile that drives the group decisions

Established by inspection (`ADOPTING.md` Step 2), not by asking:

| Probe | Finding |
| --- | --- |
| Remote | `github.com/vzakharov/vovazakharov.com`, public, `main`, squash-merge enabled |
| Tooling | `python3` 3.11, `jq`, `gh` all present |
| CI | `.github/workflows/deploy.yml` — GitHub Pages, triggered on **push to `main`** and `workflow_dispatch`. **Nothing runs on PRs.** |
| Issues | zero issues ever opened (the one `/issues` hit is PR #1) |
| Releases/tags | none |
| Existing agent config | `.claude/settings.json` + `.claude/hooks/session-start.sh` (from PR #1) |
| `CLAUDE.md` | absent |
| Stack | Next.js 16 static export (`output: 'export'`), React 19, Tailwind 4, next-intl (`en`/`ru`), next-themes; pnpm. **No test suite.** |

**G4 is already in this repo and needs no decision.** PR #1 landed a
`session-start.sh` that already installs the `gh` proxy shim *and* already
hydrates the dependency-install step the boilerplate ships as a stub. So the
`HTTPS_PROXY` tradeoff `ADOPTING.md` Step 3 asks an adopter to weigh is settled
here by pre-existing checked-in repo config rather than by a fresh choice made
during adoption. Verified live this session: `gh` resolves to
`/root/.local/bin/gh` (the shim) and the GraphQL-flavored `gh pr list -R
vzakharov/vovazakharov.com` succeeds instead of 403-ing — which is
`ADOPTING.md` § Verify check 4.

## Group decisions

| Group | Decision | Why |
| --- | --- | --- |
| G0 — sync path | **adopt** | Keeps future upstream changes reachable; without it this is a dead snapshot. |
| G1 — prose & principles | **adopt** | No dependencies, no stack assumptions. `CLAUDE.md` is a donor to merge, and none exists here yet. |
| G2 — PR loop | **adopt** | GitHub, squash-merge on, `gh` working. `scripts/vet.sh` is a required rewrite. |
| G3 — issue & backlog | **decline** | No issue has ever been opened here. Recorded with a present-tense reason so `/sync-upstream` re-offers it if that changes. |
| G4 — remote-session plumbing | **already present** | See above. Adopt `/override-gh` (needed as closure by G0), plus one `settings.json` refinement. |
| G5 — CI & landing | **adopt** | CI is GitHub Actions and reachable via `gh`. The deploy lane on `main` is a real run worth watching post-merge, which `/watch-ci` explicitly covers. |
| G6 — stack stubs | **hydrate `/preview` only**, delete the other six | Criterion is "take a row only if you will hydrate it now". |

## Step 1 — Copy the `adopt` set verbatim

From the clone into this repo, preserving paths.

**G0** — `.claude/skills/sync-upstream/SKILL.md`

**G1** — `.claude/rules/README.md`, `.claude/skills/dry/`,
`.claude/skills/tighten-docs/`, `scripts/check-skill-catalog.sh`

**G2** — `.claude/skills/` × `plan`, `implement`, `pr`, `finalize`,
`from-branch`, `branch-rename`, `squash-message`, `qa-checklist`, `check-merge`,
`sync-branch`; plus `scripts/check-merge.sh`, `scripts/pr-body.py`

**G4** — `.claude/skills/override-gh/`

**G5** — `.claude/skills/watch-ci/`, `scripts/ci-watch-tick.sh`,
`scripts/lib/watch-tick-common.sh`

**G6** — `.claude/skills/preview/` (copied, then hydrated in Step 4)

`chmod +x` every copied `scripts/*.sh`.

### Closure check for this exact set

Every `@`-reference in the copied set resolves within it, **except one**:
`finalize/SKILL.md` cites `@.claude/skills/issue/SKILL.md` in its
working-artifact sweep, and `/issue` is declined. Step 5 strips that citation.
`/override-gh` is copied even though G4 needs no adoption here, because
`/sync-upstream` (G0) references it — the counter-intuitive closure case the
catalog calls out.

## Step 2 — Rewrite `scripts/vet.sh` for this stack

The shipped stub exits `1` by design. This repo has no test suite, so the
static-export build is the only check that catches a broken page or route — and
it is exactly what CI runs on `main`, so a green vet means a green deploy:

```bash
pnpm typecheck        # tsc --noEmit
pnpm exec eslint .    # not `pnpm lint` — that is `eslint . --fix`, which mutates
pnpm format:check     # prettier --check .
pnpm build            # next build; the only end-to-end check available
```

`set -euo pipefail`, and `cd` to the repo root so the script works from any
directory.

Two supporting details:

- **Add `"typecheck": "tsc --noEmit"` to `package.json`.** The repo has no
  type-check script today; vet needs one, and a named script is more useful than
  burying `tsc` in the shell file.
- **Do not call `pnpm lint` from vet.** It carries `--fix`, so it would rewrite
  the working tree during what is supposed to be a read-only check.

## Step 3 — Write `CLAUDE.md` as a merge, not a copy

No `CLAUDE.md` exists here, so "merge" means taking the donor whole and
replacing its stubs with this project's reality rather than leaving them:

- **About this project** — replace the stub: a personal site/CV for Vova
  Zakharov, Next.js static export deployed to GitHub Pages.
- **Repository layout** — replace the stub with the real tree: `app/` (App
  Router, incl. `[locale]/cv`), `components/`, `hooks/`, `i18n/` (next-intl
  routing/request), `lib/`, `messages/` (`en.json`, `ru.json`), `public/`,
  `scripts/`, `.claude/`.
- **Vetting** — replace the "action required" stub with the implemented command
  set from Step 2, and keep the durable contract prose.
- **Testing** — state plainly that there is **no test suite yet** and that
  `pnpm build` currently stands in for one, keeping the donor's universal
  guidance for when tests arrive. Do not leave the stub's placeholder text.
- **Working with skills** — list only the skills actually present after Step 1.
  Drop `/issue`, `/propose-issue`, `/audit-github-backlog`, and **delete the
  "Stubs awaiting hydration" subsection entirely** — after Step 4 this repo has
  no stubs, and the check script fails on any that remain.
- Keep unchanged: Key principles, Plan mode & questions in web sessions,
  Docstrings, Derive types from source of truth, GitHub comments, Git
  conventions, Keeping docs in sync, Adding or renaming a skill.
- Add a short **Deployment** note: merge to `main` → `deploy.yml` → GitHub
  Pages; there is no separate release step.

## Step 4 — Hydrate `/preview`

This is the one G6 row worth taking: the repo *is* a visual surface, and the
procedure below was **spiked and verified this session** rather than written
speculatively.

Mechanism, all of it already available with **no new dependencies**:

- **Dev server** — `pnpm dev --port <port>`, then poll `curl -sf` until it
  answers (ready in ~4s locally).
- **Browser** — Chromium ships with the remote session at
  `/opt/pw-browsers/chromium` (verified 141.0.7390.37). Fall back to a system
  `chromium`/`google-chrome` when that path is absent, so the skill works on a
  laptop too. No Playwright dependency: the CLI's own
  `--screenshot` is enough, which keeps this out of `package.json`.
- **Capture** — `--headless=new --no-sandbox --disable-gpu --hide-scrollbars
  --virtual-time-budget=6000 --window-size=<W>,<H> --screenshot=<out> <url>`.
- **Dark mode** — add **`--force-dark-mode` alone**. Verified: with it,
  next-themes resolves system → dark and `<html>` gets `class="dark"`; without
  it, `class="light"`. **Do not add
  `--enable-features=WebContentsForceDark`** — that is Chrome's auto-inverter,
  which fabricates a dark rendering the project's own CSS never produces. The
  skill must say this: it is the trap that makes a dark preview a lie.
- **Trust check before reporting a themed capture** — `--dump-dom | grep -o
  '<html[^>]*>'` and confirm the expected class. A theme that silently failed to
  apply otherwise reads as a design finding.
- **Routes** — `/` (home), `/en/cv`, `/ru/cv`. `/cv` only redirects to `/en/cv`,
  so it is not worth capturing.
- **Widths** — capture at **500px or wider**; 768 (tablet) and 1280 (desktop) are
  honored exactly. Both locales matter, because `ru` copy is longer and wraps
  differently.
- **Artifacts** — `tmp/preview/` (gitignored per Step 6), or
  `docs/remove-before-merging/` when they must ride the branch for review.

**`--window-size` has a 500px floor, and below it the capture lies.** The skill
must state this with the number. Measured this session by reading `innerWidth`
inside headless Chromium 141:

| `--window-size` | resulting `innerWidth` |
| --- | --- |
| `360,800` | **500** |
| `390,844` | **500** |
| `500,844` | 500 |
| `768,1024` | 768 |
| `1280,900` | 1280 |

Any requested width under 500 is silently laid out at 500 CSS px and the
screenshot is then cropped to the width asked for — so content that fits at 500
gets sliced mid-word and reads as horizontal overflow. That is exactly what a
390px capture of `/en/cv` and `/ru/cv` produced during this spike, and it is **not
a real defect**: the operator's own browser at 360px reflows correctly. Neither
workaround survives contact — `--force-device-scale-factor=2` leaves `innerWidth`
at the requested window width (780 stays 780, at `dpr=2`), and `--headless=old`,
which had no such clamp, is removed in Chrome 141.

So: **never report a sub-500 capture as a layout finding.** Reviewing true mobile
layout needs real viewport emulation (Playwright's `viewport`/`colorScheme`),
which this plan does not add for a case the project has not needed yet. Recording
this is most of the value of hydrating the skill — the failure mode it prevents is
an agent confidently reporting a bug that does not exist.

Then **delete the STUB banner and drop `STUB` from the frontmatter
description** — the check script asserts those two markers agree, and an
unhydrated stub in a tree with no `docs/catalog.md` is a hard failure.

## Step 5 — Delete the declined stubs and strip the one dangling citation

Do not copy: `.claude/skills/` × `issue`, `propose-issue`,
`audit-github-backlog`, `release`, `hotfix`, `log-review`, `readonly-probe`,
`renumber-migration`, `test-on-gh`; and `scripts/export-github-issue.py`.

Then edit `finalize/SKILL.md` step 3 to drop the `@.claude/skills/issue/SKILL.md`
reference while keeping the sweep behavior it describes — `docs/issue/` and
`docs/pr/` trees still get swept; only the citation of the skill that creates
them goes. (`/finalize`'s other conditional reach, `/watch-ci`, stays: G5 is
adopted.)

## Step 6 — Merge the small config files

- **`.gitignore`** — append the boilerplate's `tmp/` entry with its comment. This
  is load-bearing: `CLAUDE.md`'s "dev artifacts go under `tmp/`" principle and
  `/preview`'s artifact rule both assume that path is ignored. Keep every
  existing entry.
- **`.claude/settings.json`** — keep the existing hook wiring and add
  `"matcher": "startup|resume"` to the `SessionStart` entry, matching the
  boilerplate. Without it the hook also fires on `clear` and `compact`, which
  reinstalls the shim and re-runs `pnpm install` for no reason. Skip the
  boilerplate's empty `"permissions": {"allow": []}` block — it grants nothing.
- **`.claude/hooks/session-start.sh`** — **leave as is.** This repo's copy is
  already ahead of the boilerplate's: same shim, plus the dependency install the
  boilerplate leaves as a `TODO`. Copying the donor over it would be a
  regression.

## Step 7 — Rewrite `upstream.json` for this repo

Never inherit the clone's copy — it points at `Playgramai/playgramapp`, a repo
this session cannot read, with a foreign `lastSyncedSha`.

```json
{
  "repo": "vzakharov/agent-project-boilerplate",
  "lastSyncedSha": "1f6ee79f1bfd75eb8329f031591a7eb5e81cc705",
  "lastSyncedAt": "2026-08-12",
  "adopted": [...],
  "declined": { ... }
}
```

`declined` reasons are written as **present-tense conditions**, so a later
`/sync-upstream` re-offers a group whose condition has flipped instead of staying
quiet forever:

| Declined | Reason recorded |
| --- | --- |
| `issue/`, `propose-issue/`, `audit-github-backlog/`, `export-github-issue.py` | no issue has ever been opened here; work arrives as direct prompts — revisit if work starts being tracked as GitHub issues |
| `release/` | merging to `main` deploys automatically; there is no versioned release to cut |
| `hotfix/` | no promotion path to bypass — `main` deploys straight to Pages |
| `log-review/` | static site on GitHub Pages; there are no deployed logs to read |
| `readonly-probe/` | no production datastore |
| `renumber-migration/` | no migrations |
| `test-on-gh/` | no test suite, so no CI-only bucket to dispatch — revisit when tests exist |

## Step 8 — Verify

`ADOPTING.md` § Verify, in order:

1. `bash scripts/check-skill-catalog.sh` exits `0` — assertion 1 proves no
   copied skill lost a reference, assertion 4 proves no stub stowed away.
2. `bash scripts/vet.sh` exits `0` on the untouched tree, proving Step 2 is
   wired to real commands rather than passing vacuously.
3. Confirm the copied skills appear in the session's skill list (a skill in the
   wrong directory is invisible, not broken).
4. `upstream.json` names the boilerplate with a SHA that resolves there.
5. G4's assertion — `gh pr list -R vzakharov/vovazakharov.com` succeeds. Already
   verified this session; re-confirm after the settings change.
6. The environment setup script text is in the **report**, not the tree.

## What cannot be done from here

The **environment setup script** lives in Claude Code's per-environment settings
(session composer → environment picker → Cloud → the environment's gear icon)
and has no in-repo file, API or MCP tool behind it. It is where
`apt-get install -y gh` belongs: without `gh` on `PATH`, `session-start.sh`
prints `gh not found on PATH; skipping gh proxy shim` and continues, so the shim
silently never installs and every `gh`-dependent skill fails later, far from the
cause.

The deliverable is therefore **paste-ready text in the final report**, adapted to
this repo's pins (Node 20 per `deploy.yml`, `pnpm` 10.32.0 per the lockfile's
resolution), plus a plain statement that this is the one step the operator must
apply by hand.

## DRY notes

- **Copy verbatim; do not paraphrase.** Every `adopt`-disposition file is taken
  byte-for-byte from the clone. Rewording a skill locally would fork it from
  upstream and make `/sync-upstream` diffs unreadable — the whole point of
  recording `lastSyncedSha` is that future syncs are small diffs against
  unmodified files. The only edits to copied files are the two the catalog
  mandates: `finalize`'s dangling `/issue` citation (Step 5) and `/preview`'s
  hydration (Step 4).
- **`CLAUDE.md` is the one intentional divergence**, and it is a merge by
  design — the donor's stubs are placeholders whose whole purpose is to be
  replaced per project. Its skills list duplicates names that also live in each
  skill's frontmatter; that duplication is upstream's design (one always-loaded
  index, one per-skill description) and this plan keeps it rather than inventing
  a local generator for a nine-line list.
- **No new shared abstraction for `/preview`'s browser invocation.** The Chromium
  flag set appears once, inside the one skill that captures screenshots.
  Extracting it into a `scripts/` helper would add a file with a single caller
  and put the flags one indirection away from the prose explaining *why*
  `--force-dark-mode` is right and `WebContentsForceDark` is wrong — that
  rationale has to sit next to the flags to survive.
- **`vet.sh` calls `package.json` scripts rather than restating tool
  invocations.** `pnpm typecheck` and `pnpm format:check` keep the command
  definitions in one place. The two exceptions are deliberate: `pnpm exec eslint
  .` because the existing `lint` script mutates via `--fix`, and `pnpm build`
  because it is already a single canonical script.
- **No new hook or shim.** G4's mechanism already exists here and is ahead of
  upstream's; Step 6 explicitly preserves it instead of copying a donor that
  would drop the dependency-install step.
