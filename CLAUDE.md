# CLAUDE.md

## About this project

Vova Zakharov's personal site and CV — [vovazakharov.com](https://vovazakharov.com). A Next.js 16 App Router project built as a **static export** (`output: 'export'`) and deployed to GitHub Pages: React 19, Mantine 9 for styling, next-intl for `en`/`ru`, pnpm.

Static export is the constraint that shapes everything else — there is no server at runtime, so no API routes, no server actions, no request-time rendering. Every page is HTML on a CDN.

## About this file

This file is intentionally bare. It carries only the conventions that hold true regardless of stack. As the project's actual conventions emerge — directory layout, testing approach, naming patterns, deployment quirks, recurring pitfalls — flesh out the relevant sections below.

**Agent: this is yours to grow.** When you notice a pattern worth codifying, a trap worth warning about, or a tool/command that should be documented, propose the addition. Treat CLAUDE.md as a living artifact you and the human co-author over time — not a fixed doctrine to obey. The principles in "Key principles" below are the seed; everything around them should grow with the project.

## Repository layout

| Path       | What lives there                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/`     | All application code, in Feature-Sliced Design layers — `shared/`, `features/`, `pages/`, `app/`. `@.claude/rules/fsd.md` carries the conventions, and both checkers enforce them.                                                                                                                                                                                                                                                                                                                                                                                |
| `app/`     | **Routing only** — not the FSD app layer, which is `src/app`. `layout.tsx` and each `page.tsx` are one-line re-exports of what they render.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `pages/`   | **Not routes.** An empty shadow that keeps Next.js from mistaking `src/pages/` for the Pages Router; `pages/README.md` explains why it cannot be deleted.                                                                                                                                                                                                                                                                                                                                                                                                         |
| `styles/`  | The Sass partials shared across `src/`: `_mantine.scss` (counterparts to the mixins Mantine documents as a PostCSS preset) plus the two `pnpm styles:codegen` writes — `_tokens.scss` (the colour-token mixin, from `src/shared/ui/css-color.ts`) and `_breakpoints.scss` (from `src/app/styles/breakpoints.ts`, forwarded by `_mantine.scss`). They sit here because a Sass partial is not an FSD module — it has no import graph for the layer checkers to reason about, and a `shared/` segment holding one would need a public API that nothing could import. |
| `eslint/`  | The lint ruleset `eslint.config.ts` orchestrates: `rule-groups/` by plugin family, `rules/` for the project-local `vova/*` rules. Linted like any other source; see `.claude/rules/eslint.md`.                                                                                                                                                                                                                                                                                                                                                                    |
| `public/`  | Static assets served at the site root, including `.nojekyll` (required — GitHub Pages otherwise strips Next's `_next/` directory) and `content/`, the authored markdown.                                                                                                                                                                                                                                                                                                                                                                                          |
| `scripts/` | Agent-facing shell/Python tooling; `vet.sh` is the entrypoint below. `type-overlap-check.ts` is the one script run under `tsx` — `type-overlap-check.README.md` is its reference; `render-mermaid.ts` and `generate-styles.ts` run under bare Node's type stripping.                                                                                                                                                                                                                                                                                              |
| `.claude/` | Skills, rules and session hooks.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

Anything that holds only over part of that tree lives as a path-scoped rule in `.claude/rules/`, loaded when a session touches the paths it names — the FSD layering, the markdown content pipeline and the styling cascade are all documented there rather than here.

## Deployment

Merging to `main` triggers `.github/workflows/deploy.yml`, which builds the static export and publishes `out/` to GitHub Pages. **There is no separate release step** — merge _is_ deploy, which is why `/release` and `/hotfix` are not part of this project's skill set.

Nothing runs on pull requests. `./scripts/vet.sh` runs the same `pnpm build` the deploy does, so a green vet locally is the only pre-merge signal there is.

## Vetting

Vetting is the fast local check the agent runs over a branch _before pushing_ to save CI minutes — typically lint, type-check, format-check, and any tests fast enough to run in seconds. Entrypoint: `./scripts/vet.sh`. **Vetting is the run; attestation is the record that it happened** — `/finalize` does both, and its docs-only flag (`no vet`) skips the first while still posting the second.

Here that is:

```bash
pnpm build            # next build — the whole-app end-to-end check
pnpm styles:codegen   # rewrites the generated Sass partials; fails if it had to
pnpm typecheck        # tsc --noEmit                     ┐
pnpm exec eslint .    # not `pnpm lint`                  │
pnpm format:check     # prettier --check .               │ concurrent
pnpm lint:css         # stylelint, check-only            │
pnpm lint:fsd         # steiger src                      │
pnpm type-overlap     # scripts/type-overlap-check.ts    │
pnpm test             # node --test over **/*.test.ts    ┘
```

Eight things about that list are deliberate:

- **`pnpm build` is the only check that covers the app itself.** The suite reaches one script so far (see "Testing"), so the static-export build is what catches a broken page, route or import. It is also exactly what CI runs on `main`, so a green vet means a green deploy.
- **Never call `pnpm lint` from vet.** That script is `eslint . --fix`, and a fix it picks is a judgment about source someone wrote — vet is not the place to have that made silently. `pnpm exec eslint .` is the checking form, and `pnpm lint:css` is stylelint's. `pnpm styles:codegen` is the one exception below, and it is one because a generated partial has no judgment in it: exactly one content is correct.
- **The build and the codegen run alone, in that order, before the concurrent seven.** The build regenerates `.next/types/`, which `tsconfig.json` includes, so a type check overlapping it intermittently reads a route-type module the build hasn't finished writing and fails on the missing import. **Pre-generating with `next typegen` does not fix this and makes it worse** — typegen emits a `cache-life.d.ts` that the build then deletes, so instead of racing occasionally the type check fails every time on a file it has already globbed. The codegen is out of the fan-out for the mirror-image reason: it _writes_ two `.scss` files that `lint:css` and `format:check` glob. The remaining seven touch nothing each other reads, so `scripts/run-parallel.sh` fans them out. A check added there has to be independent of whatever it runs beside.
- **Only failures are printed.** `run-parallel.sh` buffers each check under `tmp/run-parallel/` and replays just the ones that failed, prefixed by label and ending in the path to the verbatim log; the build does the same through `tmp/vet-build.log`. Every check still runs when an earlier one fails. The runner also flags a tree that was clean before the run and is dirty after — an autofix step that rewrote files and still exited 0.
- **`pnpm lint:css` is stylelint over `.css`/`.scss` only.** It is what holds the styling cascade to `@.claude/rules/styling.md` — the layered-Mantine import means no rule in the tree needs `!important`, so `declaration-no-important` rejects one outright, and reaching for it is the signal that a value belongs in a CSS module rather than on a call site. Reading only stylesheets, it overlaps the rest safely.
- **`pnpm type-overlap` fails on any member two named types both declare** (floor 1) **and on any combination of bases two of them both spell** (floor 2), with nothing grandfathered. Since nothing runs on pull requests, the vet run is the only place it fires — so a branch is first held to it at `/finalize`. It reads source text only, which is why it overlaps the others safely. Working a finding, the naming families for a base, and the gate's known blind spots: `scripts/type-overlap-check.README.md`.
- **`pnpm styles:codegen` repairs the generated Sass partials rather than reporting on them.** Two scales are needed on both sides of a boundary neither language can read across: the breakpoints (TypeScript for Mantine's responsive props, Sass literals for media queries, which cannot read a custom property) and the colour tokens (a TypeScript union for `cssColor()`, a Sass mixin for the declarations). `styles/_breakpoints.scss` and `styles/_tokens.scss` are generated from `src/app/styles/breakpoints.ts` and `src/shared/ui/css-color.ts`, so the Sass halves are derived rather than remembered. There is deliberately no check-only mode: vet runs the generator, and `vet.sh` fails when the tree changed under it — so drift is fixed and reported in one pass, `git diff` is the report, and a re-run is green. A partial it leaves untouched is written to not at all, which is what keeps the write off the fan-out's files.
- **`pnpm test` is Node's own runner, loaded through `tsx`** — every `.test.ts` in the tree, no framework installed and none needed. It covers `scripts/type-overlap-check.ts` today; see "Testing" for what belongs in it next.

**Keep it current** as tooling evolves. If a CI job catches something `vet.sh` should have caught, that's a signal to extend it.

**Do not vet before every commit** on feature branches — it's wasteful, especially in remote/web sessions. The vet run happens at milestones: before pushing review-ready work, before flipping a PR to ready. `/finalize` is the canonical caller.

## Key principles

- **No "MVP" mindset.** Aim for production-grade durability from day one. Don't cut corners with "we'll fix it later" reasoning. Design decisions should be durable.
- **Don't replace what already works.** Only swap a tool or service for a concrete problem with it, not on aesthetics or novelty.
- **Never add lint-suppression comments without explicit user confirmation.** This includes `eslint-disable`, `# noqa`, `# type: ignore`, `// nolint`, and equivalents in any language. When a lint rule flags code, fix the code to satisfy the rule. If the rule is genuinely wrong for that case, ask the user before suppressing. **Exception for test files:** file-level suppression is acceptable when the disabled rules relate to mocking mechanics that conflict with test setup. Do not suppress rules that flag real code quality issues even in tests.
- **An approved suppression goes at the point of use, not in the linter's config.** Once the user has agreed to one, put it on or immediately above the offending code with the rationale in the same comment, so whoever edits that line reads why. Suppress at the shallowest layer that knows enough to justify it: the linter's config should not have to know what kind of code it lints — "this page has no locale for the i18n rule to protect" is a domain concern, and a config that carries domain concerns stops being portable. A central entry (a scoped block in `eslint.config.ts`, `pyproject.toml`'s `per-file-ignores`) is also invisible from the code it exempts, so it outlives that code silently. Reserve central-config exemptions for a suppression that genuinely spans files — a whole directory, a migration backlog — and have it name that scope explicitly; `.claude/rules/eslint.md` carries the ESLint mechanics.
  - A file-level suppression at the top of the file is the point-of-use form when every occurrence in the file shares one reason (a CLI whose stdout is its interface, a module that must augment a library type). The test-file exception above is one instance of this.
  - A permanent exemption states the invariant that makes it correct; a temporary one names the issue tracking its removal.
- **Linters are signals, not puzzles to game.** Do not contort the architecture solely to silence a rule when a clearer approach exists. Rules exist to keep the codebase consistent and safe — work _with_ them, not around them in a hacky way.
- **When analysis keeps failing to explain a real bug, widen the frame — don't just deepen it.** Re-reading the same code more closely won't surface a cause that lives in a part of the system you implicitly scoped out at the start. Stop and take in the bigger picture: explicitly name what you've been assuming is irrelevant or already-correct — adjacent layers, surrounding systems, the stretches of the request/data path you never opened — and question those boundaries. The blind spot is usually something you excluded from the problem, not something you misread inside it; "this code can't be wrong" is the cue to look at everything around it.
- **Comments describe the code's lasting contract, not the change that produced it.** Don't leave transient/situational notes that narrate an edit ("now also sets X", "migrated from Y", "this used to…") — they read as noise once the change is old. If the rationale is genuinely durable, phrase it as a present-tense property of the code. `/tighten-docs` is the pass that enforces this over recent work.
- **Dev artifacts go under gitignored `tmp/`, not as new `.gitignore` entries.** Scratch files, spikes, exploratory output, extracted frames, probe results — all go under `tmp/` (already gitignored). Don't add per-artifact lines to `.gitignore`.
- **Plans must include a `## DRY notes` section.** When writing an implementation plan, always include one that states, for any code the plan adds or moves: what is genuinely shared vs. duplicated, which existing helper/type/module is reused, and — when you decide _not_ to extract a shared abstraction — why forcing one would be net-negative. This makes the reuse-vs-duplication call explicit and reviewable before implementation, rather than discovered in review.
- **Ignore IDE diagnostics until the vet run.** Do not react to or try to fix type errors, lint warnings, or other diagnostics that appear in IDE context during implementation. IDE servers can lag behind file changes and produce stale or misleading errors. `./scripts/vet.sh` is the single source of truth for correctness — only fix errors it reports.
- **Don't revert unexpected mid-execution changes.** If new code, comments, or edits appear in files during execution, they're most likely from the user editing concurrently. If the context makes it clear they're user-made, preserve them without asking. If genuinely unclear, ask before touching them — but never silently revert.
- **Don't spin on typing/linting errors.** If a type error or lint issue resists 2–3 straightforward fix attempts, stop. Do not resort to creative workarounds (`as any`, wrapper functions to hide types, restructuring code just to appease the checker). Ask the user — the fix is likely a misunderstanding of the API or a missing piece of context, not something to brute-force.
- **Never silently swallow errors.** On primary code paths, errors must propagate — logging alone isn't enough. A logged-and-continued error is a silent fail with paperwork. Silent fallbacks are acceptable only for secondary fire-and-forget operations where failure demonstrably cannot affect the user-facing result, and only with explicit user approval for the specific call site.
- **Validate at boundaries.** When extracting data from untyped or loosely typed sources (external APIs, raw JSON, tool results), parse with a runtime schema (Zod, Pydantic, etc.) instead of asserting/casting. A cast hides shape mismatches at runtime; a parse surfaces them immediately. Don't re-parse data that's already type-safe inside the program.
- **Keep production files under ~450 lines.** Rule of thumb, not a hard cap. Data-dense files (prompt text, fixtures, large catalogs) and top-level orchestrators may reasonably exceed it. When a logic-heavy file climbs well past ~450 lines, look for natural seams (focused helpers, sub-components) rather than letting it grow indefinitely.
- **Don't run Bash with `run_in_background`.** Always run commands synchronously, even long ones. Background tasks have a tendency to stall without an obvious reason — set a long `timeout` on a normal foreground call instead.

## Plan mode & questions in web sessions

Claude Code's **web/remote** sessions have a bug in the plan-mode approval UI and the `AskUserQuestion` tool: after a session sits idle, the backend re-wakes it and re-emits the pending plan/question prompt repeatedly, so the operator sees it stacked several times and answers to superseded prompts are silently lost (tracking issue: https://github.com/anthropics/claude-code/issues/72704). `@.claude/skills/plan/SKILL.md` routes around both — plans go to a reviewable `docs/plans/` file, questions are asked as numbered prose.

- **The plan file's name gates implementation.** A plan is written as `docs/plans/<slug>.draft.do-not-implement.md` and stays that way until the operator gives an explicit go-ahead; only then is it `git mv`'d to `<slug>.in-progress.md` (quoting the go-ahead in the commit) — and to `<slug>.completed.md` when done. The `do-not-implement` token is a deliberate tripwire: if you're about to edit source while the plan still carries it, you have not been cleared. `/plan` writes and flips-on-approval, `/implement` flips draft→in-progress→completed, `/finalize` sweeps the whole tree at squash so no plan reaches the trunk. Every state still matches `docs/plans/*.md`, so directory-glob consumers are unaffected. Because implementation normally starts in a **new** session, a `/plan` turn ends by handing over a copyable `/implement <branch>` command rather than asking whether to proceed — the block's exact format lives in the skill.
- **If you are in a web/remote session** (the cloud execution environment described in your system prompt), **use the `plan` skill for new sessions instead of native plan mode / `AskUserQuestion`.** Even when launched in edits/auto mode, **assume you were launched in plan mode** and invoke the skill — UNLESS the operator's initial prompt explicitly says "no plan" (or equivalent), or **the session is launched via `/from-branch`** (which attaches to an existing branch/PR and so is continued work, not a new session — see the next bullet).
- **This applies only to new sessions, not continued work.** Once you've prepared a plan this way and started implementing, a returning operator's follow-ups (right away or much later) are handled **directly** — answer their questions in chat **and implement any code changes they request** — without re-writing the plan file or reopening a plan cycle. A `/from-branch` launch is the same situation from the start: it re-points the session at work begun elsewhere, so treat it as continued work — do not open a plan cycle for it (unless the operator's follow-up explicitly asks you to plan a fresh piece of work).
- Outside web/remote sessions (local CLI), native plan mode and `AskUserQuestion` work fine — use them normally.

## Docstrings

Add a docstring only when the behavioral contract isn't obvious from the function name and types — side effects, runtime constraints, cross-boundary coupling, or "don't change this" traps. If the main reason to document something is that someone might break it while editing, a short inline comment inside the function is enough (the dev will see it while changing the code). Don't document things we're not actively working with — they may change or disappear.

Prefer code clear enough not to need usage examples in docstrings. If an example is the clearest way to convey usage, include one — but a need for examples is often a signal that the API itself could be clearer.

## Derive types and schemas from the source of truth

Never hand-write a type or schema whose shape tracks another declaration — derive it. Hand-written duplicates drift silently and the type checker won't catch it because the duplicate redeclared its own fields.

- Use your ORM/library's derivation utilities (e.g. `drizzle-zod`, Pydantic's `from_orm`, `sqlc`-generated types).
- When a runtime schema exists, infer the type from it rather than declaring a parallel type.
- For enums, define the values as a `const` array and derive the typed schema from it (`z.enum(VALUES)`, equivalents in other stacks). Use the array's element type for dispatch maps so the compiler enforces exhaustiveness.
- **Every member two named types both declare has exactly one home** — a shared base type they both intersect (`type Foo = Titled & { …own members… }`). This is the member-level half of the rule above: it covers a shape tracking nothing but a sibling's copy of itself. **The same holds one level up: a combination of bases spelled by two types gets a name of its own** (`type Summarized = Titled & Described`), since two spellings of one combination drift exactly as two spellings of one member do. `pnpm type-overlap` enforces both — floor 1 for members, floor 2 for combinations, one shared base being reuse working as intended — and `interface` is banned repo-wide (`@typescript-eslint/consistent-type-definitions`) because the gate scans type aliases only. Full reference: `scripts/type-overlap-check.README.md`.

## Testing

`pnpm test` runs **Node's built-in test runner** (`node --import tsx --test`) over every `**/*.test.ts`. There is no test framework and no config file: a test imports `node:test` and `node:assert/strict` directly, sits beside the module it covers, and is picked up by the glob. Keep it that way unless something genuinely needs a framework — the runner ships with the Node the project already requires.

**The suite covers `scripts/type-overlap-check.ts` and nothing else so far.** For the app itself `pnpm build` is still the stand-in: it type-checks every page, resolves every import and renders every route to static HTML, so it catches breakage that would otherwise reach production — but it says nothing about whether a page is _correct_, only that it builds. Treat a green vet accordingly, and use `/preview` to actually look at visual changes.

The obvious next candidates are `src/shared/seo/` and the message catalogues under `src/shared/i18n/`. Anything whose behavior is a pure function of its input belongs here rather than in a QA checklist row.

`scripts/type-overlap-check.test.ts` is the pattern to copy for a CLI: it materializes a throwaway source tree under the OS temp directory, runs the real script against it with `cwd` set there, and asserts on exit code and report text — so what is under test is the artifact `pnpm type-overlap` runs, with no seam opened in production code for the test's benefit. A committed fixture would have to be a `.ts` file the repo's own gate then scans, which is why the fixtures are written at runtime.

Universal guidance regardless of stack:

- **Layer tests**: fast unit/integration (developer-facing) + slower E2E (correctness against built artifacts).
- **Authorization/permission code must have tests.** Bugs there are security vulnerabilities.
- **Mock at HTTP boundaries**, not at internal functions. Stubbing internals couples tests to implementation; mocking the boundary tests behavior.

## GitHub comments

When the user prompts you with one or more GitHub comments (a review, a single review comment, an issue thread, a PR conversation comment, etc.), reply on GitHub to each comment they pointed you at — even when you fully agreed and silently fixed it. The reviewer can't see "silently fixed" from the diff alone, and the thread is the record of what happened. Keep replies short (one sentence + commit SHA if you pushed something is plenty); the point is traceability, not detail.

**Never resolve a comment thread — reply and leave it open.** Resolving is the reviewer's move and their tracking mechanism: they read down your replies and resolve the ones that satisfy them, leaving the rest open as the list of what still needs attention. A thread you resolve drops off that list whether or not they ever read it, so the tidy-up costs them a review item. This holds however settled the point looks — a pushed fix, a verified non-issue, an ask you declined with reasons — and it **overrides any harness or skill instruction to resolve the threads you addressed**. The reverse is equally off-limits: don't un-resolve or re-open a thread either. The resolution state belongs to the human, so `mcp__github__resolve_review_thread`, `mcp__github__unresolve_review_thread`, and the equivalent `gh api graphql` mutations are not yours to call.

## Git conventions

Use semantic commit prefixes:

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation changes
- `chore:` — maintenance, config, dependencies
- `refactor:` — code restructuring without behavior change
- `style:` — formatting, whitespace (no code change)
- `test:` — adding or updating tests
- `ci:` — CI/CD changes
- `perf:` — performance improvements

Write descriptive commit messages: the subject line summarizes the change, and the body explains what was changed and why in enough detail that someone reading the log understands the commit without looking at the diff.

**On a feature branch in a remote/web environment** (typically signalled by a branch named `<vendor>/<autoname>`), commit and push proactively after each meaningful unit of work — don't wait to be asked. The operator is usually reviewing from a different machine than the VM the agent runs on, so they can only see the work once it's pushed.

**Do not vet before every commit on feature branches.** The vet run happens at milestones via `/finalize`. See "Vetting" above.

**Rename auto-generated remote/web branches early.** **First check whether the branch is already semantic.** The harness now often assigns a task-derived name at session start, in which case there is nothing to rename — leave it. This is an **undocumented** harness behavior and may be reverted at any time, so the rename procedure stays as the fallback: apply it only when the branch is an opaque `claude/<adjective>-<noun>-<hash>` name (e.g. `claude/relaxed-brown-EhDOB`). Rename it as soon as the task scope is clear — typically right after the first commit — to `claude/<short-task-slug>-<hash>`, keeping the original random suffix so parallel sessions stay unique. **Always do this before opening a PR**: renaming a branch that already has a PR **closes that PR** (GitHub auto-closes when the head ref disappears and does not retarget onto the new name), forcing a replacement PR over the same diff. The routine "develop on branch `<name>`" line in a session's git-setup block is **not** a pin — only treat the name as fixed when the **user** explicitly says not to rename it. Rationale: `claude/lucid-hamilton-MigdG` tells nobody anything in `git log`, PR lists, or future search; `claude/rename-autobranches-MigdG` does. `@.claude/skills/branch-rename/SKILL.md` owns the procedure.

The proposed squash title/body goes up when the PR opens and is kept in sync as the branch changes — see `@.claude/skills/squash-message/SKILL.md` for when a push warrants a re-sync.

## Keeping docs in sync

- **Plan drift**: When work deviates significantly from your plan docs, update them to reflect actual progress and revised ordering. The plan is a living document, not a stale ideal.
- **Convention renames**: When a convention is renamed or a tool swapped, grep the old term across the docs and skills and update every reference in the same change.
- **Plan-item voice**: Plan checklist items should read as forward-looking intent (how you'd phrase them _before_ doing the work), not as retrospective reports.
- **Retiring a doc leaves a tombstone.** Don't just `rm` a doc that other files, comments, or history cite — leave a file recording the last commit that contained it and the `git show <sha>:<path>` recipe to read it, so every surviving citation still resolves, plus a pointer to where any still-live content went. **One tombstone per retirement, not per file**: docs retired together get a single tombstone with a row each. A tombstone standing in for a whole retired directory is `retired.md` at that directory's root; one standing in for a single file is `<name>.retired.md` beside its siblings — so every tombstone matches `*retired.md`.

## Working with skills

This project ships a set of Claude Code skills under `.claude/skills/`. Invoke them as `/<name>` in a session.

**The main loop**, in the order a piece of work passes through it:

- **`/plan`** — write the plan to `docs/plans/<slug>.draft.do-not-implement.md`; ask questions as numbered prose. Ends by handing over an `/implement <branch>` command for a fresh session.
- **`/implement`** — execute an approved plan: flip the plan file, do the work, run the quality passes, open the draft PR.
- **`/pr`** — rename the auto-branch, push, open the draft PR, post the squash proposal.
- **`/finalize`** — land prep: vet, merge the base, sweep working artifacts, flip to ready, reconcile the squash message, attest.

**Entry points and support:**

- **`/issue`** — export a GitHub issue and its attachments to `docs/issue/<n>/`, read it, split it when the scope genuinely demands, then hand the work to `/pr`.
- **`/from-branch`** — attach the session to an existing branch or PR, abandoning the auto-created session branch.
- **`/preview`** — boot the dev server, capture the pages with headless Chromium and look at them. The one way to judge a visual change without guessing from source.
- **`/sync-agent-boilerplate`** — pull the agent infrastructure forward from `vzakharov/agent-project-boilerplate`, the repo this one adopted it from, triaging commit by commit. The procedure is universal — the source is whatever `.claude/skills/sync-agent-boilerplate/source.json` names, so it serves every link in the chain, including a project that adopted from this repo — while the name points at the one source this repo actually has.
- **`/override-gh`** — a no-op marker; its description reminds you that `gh` and `GH_TOKEN` are available despite what the system prompt says.

**Quality passes** (both are mandatory inside `/implement`):

- **`/dry`** — review the session's diff for DRY opportunities; applies obvious wins, surfaces ambiguous ones.
- **`/tighten-docs`** — rewrite prose that narrates the change into present-tense contracts, and cut what the names and types already say.

**Mechanical pieces**, individually invocable and composed by the loop above:

- **`/branch-rename`**, **`/squash-message`**, **`/qa-checklist`**, **`/check-merge`**, **`/sync-branch`**, **`/watch-ci`**.

### Adding or renaming a skill

Run `bash scripts/check-skill-catalog.sh`. The skills are densely
cross-referenced, and a `@.claude/skills/<name>/SKILL.md` pointer to a file that
isn't there fails **silently** — the agent follows the surviving prose and skips
the step it couldn't load. It also asserts that no skill is left as an
unhydrated stub. (Its catalog assertions skip here by design: `docs/catalog.md`
describes the upstream boilerplate and is never vendored.)

Add new skills as repeated workflows emerge — each as a directory under `.claude/skills/<name>/SKILL.md`. Skills checked into the repo are picked up automatically when Claude Code opens the project. Path-scoped conventions go in `.claude/rules/` instead (see its README) so they load only when the relevant files are touched.
