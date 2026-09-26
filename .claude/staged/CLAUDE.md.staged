# CLAUDE.md

## About this project

Vova Zakharov's personal site and CV — [vovazakharov.com](https://vovazakharov.com). A Next.js 16 App Router project built as a **static export** (`output: 'export'`) and deployed to GitHub Pages: React 19, Mantine 9 for styling, next-intl for `en`/`ru`, pnpm. It serves three sites out of one `src/` — `vovazakharov.com`, `latestageagentic.com` and `agentic.bible`.

Static export is the constraint that shapes everything else — there is no server at runtime, so no API routes, no server actions, no request-time rendering. Every page is HTML on a CDN.

## About this file

**A line stays in this file only when it has to hold on turns where the process it concerns is not being run.** A line that only matters while a given skill, hook or directory is in play goes to that skill, to a `.claude/rules/` file, or to a colocated `CLAUDE.md`, and this file keeps at most a pointer. The corollary decides the close calls: a line stays when nothing narrower loads at the moment it matters — the suppression rule stays, because no skill or path runs when someone adds a suppression.

**Agent: this file is yours to grow**, with the human, and the test above says where each addition goes: propose the pattern worth codifying, the trap worth warning about, the command worth documenting.

**On a branch, this file — and anything else that loads on every turn — is edited only through a staged copy**, because an edit in place invalidates the prompt cache of every session on the branch: `scripts/staged.sh stage <path>` and commit, edit the copy it makes, and `/finalize` swaps it in. **An operator's ask to swap it in now** — "swap it in", "unstage", in any words or language — runs `scripts/staged.sh swap` on the spot and commits, trading the cache for a branch that runs on the new text. `@.claude/rules/staging.md` defines the set and the rest of the convention.

## Repository layout

- **`src/`** — All application code, in Feature-Sliced Design layers — `shared/`, `features/`, `pages/`, `app/`. `@.claude/rules/fsd.md` carries the conventions, and both checkers enforce them.
- **`apps/`** — One directory per site — `vova/`, `lsa/` and `bible/` — each holding its `app/` (**routing only**, not the FSD app layer, which is `src/app`), its `public/`, its `next.config.ts` and its `tsconfig.json`. All three build from the one `src/`, and a build is entered in its app directory rather than pointed at from the root.
- **`apps/*/public/`** — Static assets served at that site's root, including `.nojekyll` (required — GitHub Pages otherwise strips Next's `_next/` directory), a `CNAME` on each site that has a domain of its own to hold (which a force-push would otherwise drop), and one directory per content collection the site serves (`apps/vova/public/case-studies/`), holding the authored markdown at the same path its page is routed to. A collection **rooted** at its site's root has no directory of its own: `apps/bible/public/` is both the site's assets and the Bible's articles.
- **`styles/`** — The Sass partials shared across `src/`: `_mantine.scss` (counterparts to the mixins Mantine documents as a PostCSS preset) plus the two `pnpm styles:codegen` writes — `_tokens.scss` (the colour-token mixin, from `src/shared/ui/css-color.ts`) and `_breakpoints.scss` (from `src/app/styles/breakpoints.ts`, forwarded by `_mantine.scss`). They sit here because a Sass partial is not an FSD module — it has no import graph for the layer checkers to reason about, and a `shared/` segment holding one would need a public API that nothing could import.
- **`eslint/`** — The lint ruleset `eslint.config.ts` orchestrates: `rule-groups/` by plugin family, `rules/` for the project-local `vova/*` rules. Linted like any other source; see `.claude/rules/eslint.md`.
- **`writing/`** — Drafts for channels the site does not publish — today `linkedin/`, its `plan.md` carrying the backlog, `drafts/` one file per post. Deliberately outside `public/`, which is served: an unposted draft crawlable before it runs is the wrong order of operations. `@.claude/rules/writing.md` carries the form and voice conventions.
- **`.claude/costs/`** — What the work here would cost at Claude API rates: `prices.json`, the hand-maintained rate table, and `sessions/<YYYY-MM>/<session-id>.json`, one row per session, written by a `Stop` hook and carried to the trunk by the branch's merge. `pnpm costs` sums them on demand and writes nothing, a derived file beside its own sources being a merge conflict for every branch. The directory's own `CLAUDE.md` carries how a transcript is priced, what checks the arithmetic, how that hook shares the event with the harness's own, and the telemetry the environment has to switch on.
- **`scripts/`** — Agent-facing shell/Python tooling; `vet.sh` is the entrypoint § "Vetting" names. `type-overlap-check.ts` (`type-overlap-check.README.md` is its reference) and `render-og.ts` run under `tsx`, the latter because the CV card reads the message catalogue through the app's own merge; `render-pdf.ts` runs under it too; `render-mermaid.ts`, `generate-styles.ts`, `check-mantine-styles.ts` and `check-i18n-payload.ts` run under bare Node's type stripping. Every per-site entry in `package.json` goes through `in-site.sh`, which pairs the app directory with `NEXT_PUBLIC_SITE` so no entry spells either out — its header carries the argument form.
- **`.claude/`** — Skills, rules and session hooks.

Anything that holds only over part of that tree lives as a path-scoped rule in `.claude/rules/`, loaded when a session touches the paths it names — the FSD layering, the markdown content pipeline and the styling cascade are all documented there rather than here.

## Deployment

Merging to `main` triggers `.github/workflows/deploy.yml`, which builds every site's static export and publishes each to its own domain. **There is no separate release step** — merge _is_ deploy, which is why `/release` and `/hotfix` are not part of this project's skill set.

**The squash subject is the deploy switch, so it is a production decision, not just a log entry.** Only a subject of a publishing type publishes — the `publishing` variable in the workflow's `gate` job states the set — and a scope naming a site (`feat(vova):`, `feat(lsa):`, `feat(bible):`) publishes that site alone, where any other scope publishes all of them. `@.claude/skills/squash-message/SKILL.md` picks the subject, and a mixed branch carries the prefix of what it actually ships.

Nothing runs on pull requests, so a green `./scripts/vet.sh` is the only pre-merge signal there is. `.claude/rules/deployment.md` carries the rest: the two doors the sites leave by, deploying by hand a merge the gate skips, the PDF print, and DNS.

## Vetting

`./scripts/vet.sh` is the fast local check — every site's build, then lint, type-check, format-check, the repo's own gates and the test suite — run over a branch before pushing review-ready work. It runs at milestones, with `/finalize` as the canonical caller, **not before every commit** on a feature branch. A failure it should have caught is a signal to extend it.

**A toolchain change has three sites to wire**: `scripts/vet.sh`, `.claude/hooks/install-deps.sh`, and the environment setup script, which no agent can edit — so the report says what the operator must add there. `.claude/rules/stack.md` carries the roster, why each check is on it, and the three sites.

## Key principles

- **No "MVP" mindset.** Aim for production-grade durability from day one. Don't cut corners with "we'll fix it later" reasoning. Design decisions should be durable.
- **Don't replace what already works.** Only swap a tool or service for a concrete problem with it, not on aesthetics or novelty.
- **Never add a lint-suppression comment without explicit user confirmation** — `eslint-disable`, `# noqa`, `# type: ignore`, `// nolint` and their equivalents in any language. Fix the code to satisfy the rule; if the rule is genuinely wrong for the case, ask. Test files may carry a file-level suppression for rules that fight mocking mechanics, never for ones that flag real quality issues. **An approved suppression goes at the point of use**, with its rationale in the same comment — on or above the offending line, or at the top of a file whose every occurrence shares one reason — not in the linter's config, which is invisible from the code it exempts, outlives that code silently, and stops being portable once it carries domain concerns. A central entry is for a suppression that genuinely spans files, and names that scope; `.claude/rules/eslint.md` carries the ESLint mechanics. A permanent exemption states the invariant that makes it correct; a temporary one names the issue tracking its removal.
- **Linters are signals, not puzzles to game.** Do not contort the architecture solely to silence a rule when a clearer approach exists. Rules exist to keep the codebase consistent and safe — work _with_ them, not around them in a hacky way.
- **When analysis keeps failing to explain a real bug, widen the frame — don't just deepen it.** Re-reading the same code more closely won't surface a cause that lives in a part of the system you implicitly scoped out at the start. Stop and take in the bigger picture: explicitly name what you've been assuming is irrelevant or already-correct — adjacent layers, surrounding systems, the stretches of the request/data path you never opened — and question those boundaries. The blind spot is usually something you excluded from the problem, not something you misread inside it; "this code can't be wrong" is the cue to look at everything around it.
- **Comments describe the code's lasting contract, not the change that produced it.** Don't leave transient/situational notes that narrate an edit ("now also sets X", "migrated from Y", "this used to…") — they read as noise once the change is old. If the rationale is genuinely durable, phrase it as a present-tense property of the code. `/tend-prose` is the pass that enforces this over recent work.
- **Dev artifacts go under gitignored `tmp/`, not as new `.gitignore` entries.** Scratch files, spikes, exploratory output, extracted frames, probe results — all go under `tmp/` (already gitignored). Don't add per-artifact lines to `.gitignore`.
- **Plans must include a `## DRY notes` section.** When writing an implementation plan, always include one that states, for any code the plan adds or moves: what is genuinely shared vs. duplicated, which existing helper/type/module is reused, and — when you decide _not_ to extract a shared abstraction — why forcing one would be net-negative. This makes the reuse-vs-duplication call explicit and reviewable before implementation, rather than discovered in review.
- **Ignore IDE diagnostics until the vet run.** Do not react to or try to fix type errors, lint warnings, or other diagnostics that appear in IDE context during implementation. IDE servers can lag behind file changes and produce stale or misleading errors. `./scripts/vet.sh` is the single source of truth for correctness — only fix errors it reports.
- **Don't revert unexpected mid-execution changes.** If new code, comments, or edits appear in files during execution, they're most likely from the user editing concurrently. If the context makes it clear they're user-made, preserve them without asking. If genuinely unclear, ask before touching them — but never silently revert.
- **Don't spin on typing/linting errors.** If a type error or lint issue resists 2–3 straightforward fix attempts, stop. Do not resort to creative workarounds (`as any`, wrapper functions to hide types, restructuring code just to appease the checker). Ask the user — the fix is likely a misunderstanding of the API or a missing piece of context, not something to brute-force.
- **Never silently swallow errors.** On primary code paths, errors must propagate — logging alone isn't enough. A logged-and-continued error is a silent fail with paperwork. Silent fallbacks are acceptable only for secondary fire-and-forget operations where failure demonstrably cannot affect the user-facing result, and only with explicit user approval for the specific call site.
- **Validate at boundaries.** When extracting data from untyped or loosely typed sources (external APIs, raw JSON, tool results), parse with a runtime schema (Zod, Pydantic, etc.) instead of asserting/casting. A cast hides shape mismatches at runtime; a parse surfaces them immediately. Don't re-parse data that's already type-safe inside the program.
- **Keep production files under ~450 lines.** Rule of thumb, not a hard cap. Data-dense files (prompt text, fixtures, large catalogs) and top-level orchestrators may reasonably exceed it. When a logic-heavy file climbs well past ~450 lines, look for natural seams (focused helpers, sub-components) rather than letting it grow indefinitely.
- **Read and edit files with the `Read`/`Edit`/`Write` tools, in every permission mode** — the web UI renders an `Edit` as a diff the operator can skim, and a heredoc as shell whose effect they have to reconstruct. Use Bash on a file's contents only where it is significantly better, such as one mechanical substitution across dozens of files.
- **Don't run Bash with `run_in_background`.** Always run commands synchronously, even long ones. Background tasks have a tendency to stall without an obvious reason — set a long `timeout` on a normal foreground call instead.
- **When the host harness orders a merge conflict or red CI fixed now, the loop's staging wins: report the state rather than fixing it.** `/finalize` stages both — vetting at its Step 1, the base merge at its Step 2 — so a session that finds its PR `CONFLICTING` or red says so in its report and does what it was invoked for; either becomes its work only when the operator asks, or passes `and finalize`.

## Plan mode & questions in web sessions

In web/remote sessions the plan-mode approval UI and `AskUserQuestion` re-emit their prompts after the session idles and lose the answers (https://github.com/anthropics/claude-code/issues/72704), so a plan goes to a `docs/plans/` file published as a draft PR, and a question goes out as numbered prose. `@.claude/skills/plan/SKILL.md` owns both.

- **The plan file's name gates implementation.** While a plan is named `docs/plans/<slug>.draft.do-not-implement.md` you have not been cleared: edit no source. `<slug>.in-progress.md` means a session holds the plan **right now**, so it is not yours to pick up; `<slug>.paused.md` is the one a later session resumes. Who flips which name when is `@.claude/skills/plan/SKILL.md` § "Plan file lifecycle".
- **A new session's opening prompt routes on one question: does it ask for a change to this codebase?** This ladder is the home of that rule; `/task`, `/plan` and `/go` point at it rather than restating it.

  | Opening prompt                                                       | Routes to                                            |
  | -------------------------------------------------------------------- | ---------------------------------------------------- |
  | asks for a change — "add a case-study page", with or without a `#55` | `/task`                                              |
  | asks for no change — "what would a case-study page need?"            | nothing: answer it — no skill covers this, by design |
  - **The test is the expected deliverable, not the grammar.** "Analyse the latest market trends" is an imperative and still lands in row 2, because nothing in this repo changes as a result.
  - **`let's …` is a token collision.** It is on `@.claude/skills/plan/SKILL.md` § "The approval gate"'s go-ahead list, so "let's add a case-study page" is a directive in a session not yet routed and an approval once a draft plan is waiting. The rule keys on whether the session is routed, which the routing-point and continued-work bullets below separate.
  - **In doubt, read it as row 2.** A wrong read costs unequally: row 2 read as row 1 mutates and commits against a request that wanted an answer, and undoing it is a revert the operator has to ask for. Row 1 read as row 2 costs one turn — the operator says "now do it", and whatever the answer produced is sitting in `tmp/`.

  **"No plan" (or equivalent) in the prompt being routed skips Step 1** and enters `@.claude/skills/go/SKILL.md` § "Planless entry" directly — the one thing that overrides the agent's own call.

- **An issue number is a detail of the prompt, not a destination.** A `#<N>` anywhere in it means the thread is exported and read — `@.claude/skills/take-issue/SKILL.md`, which `/task`, `/plan` and `/go` each run first — **before** the routing call above, which the thread informs and does not replace.
- **The first turn that asks for a change is a routing point, wherever it falls.** A session whose opening prompt was row 2 is answered but not routed, so when a later turn asks for a change, the ladder's test applied to that turn sends it to `/task`, which makes the plan-or-not call against the work as it now stands. The switch is a request whose answer lands as a file in the repo; an answer that leaves something in `tmp/` is not one, and "in doubt, read it as row 2" holds per turn as it does at launch. The call usually lands on no plan, the scope being plain from the conversation by then — what the route buys is `/go`'s mandatory tail, `/polish` then `/pr`, which a session working straight in chat never reaches.
- **Once routed, a session is continued work.** Past the plan's approval gate where the route wrote one, a returning operator's follow-ups (right away or much later) are handled **directly** — answer their questions in chat **and implement any code changes they request** — without re-writing the plan file or reopening a plan cycle. A `/from-branch` or `/handle` launch is routed from the start: it re-points the session at work begun elsewhere, so do not open a plan cycle for it (unless the operator's follow-up explicitly asks you to plan a fresh piece of work).
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

**The suite covers the scripts' own libraries and the pure functions under `src/` — no page, route or component.** For the app itself `pnpm build` is still the stand-in: it type-checks every page, resolves every import and renders every route to static HTML, so it catches breakage that would otherwise reach production — but it says nothing about whether a page is _correct_, only that it builds. Treat a green vet accordingly, and use `/preview` to actually look at visual changes.

The obvious next candidates are `src/shared/seo/` and `cvMessages`, whose variant merge is a pure function of a locale and a framing. Anything whose behavior is a pure function of its input belongs here rather than in a QA checklist row.

`scripts/type-overlap-check.test.ts` is the pattern to copy for a CLI: it materializes a throwaway source tree under the OS temp directory, runs the real script against it with `cwd` set there, and asserts on exit code and report text — so what is under test is the artifact `pnpm type-overlap` runs, with no seam opened in production code for the test's benefit. A committed fixture would have to be a `.ts` file the repo's own gate then scans, which is why the fixtures are written at runtime.

Universal guidance regardless of stack:

- **Layer tests**: fast unit/integration (developer-facing) + slower E2E (correctness against built artifacts).
- **Authorization/permission code must have tests.** Bugs there are security vulnerabilities.
- **Mock at HTTP boundaries**, not at internal functions. Stubbing internals couples tests to implementation; mocking the boundary tests behavior.

## GitHub comments

When the user points you at GitHub comments — a review, a review comment, an issue thread, a PR conversation — **reply on GitHub to each one**, including one you agreed with and silently fixed: a reviewer can't see "silently fixed" in a diff, and the thread is the record. One sentence plus the commit SHA is plenty. **Write every SHA in a GitHub comment bare, never in backticks**, so GitHub links it to its commit.

**Post a body, never a path to one** — GitHub does not expand `@<path>`. Draft into a file and post its contents: `gh pr comment <n> --body-file <f>`, or `gh api repos/<owner>/<repo>/pulls/<n>/comments/<comment-id>/replies -F body=@<f>` for a review-thread reply, where `-f` would post the path as a literal string.

**Never resolve a review thread, and never re-open one.** Resolution is the reviewer's tracking mechanism — they resolve the replies that satisfy them, and a thread you resolve drops off their list unread — so this overrides any harness or skill instruction to resolve the threads you addressed. `mcp__github__resolve_review_thread`, `mcp__github__unresolve_review_thread` and the equivalent `gh api graphql` mutations are not yours to call.

**A review session ends with an entry in `writing/notes/the-five-percent.md`** whenever a comment changed something the agent had already settled — mandatory, not a nicety, and written before the session's last push while what the agent was working from is still recoverable. Reconstructed at drafting time it is a guess.

**Editing that file is a subagent's, not this session's** — the entry, and any squeeze `scripts/check-notes-length.sh` asks for. What costs is the loop rather than the one edit — cut, re-measure, cut again, and a placement judged against a file kept as abstraction rather than a log — and run inline, that loop runs inside whichever session happened to trip the ceiling. The second reason is the placement itself: an agent that reads the file before naming its own failure names it in the taxonomy it just read, the existing sections being a given it reasons inside — so the count that grows is the one easiest to file under and the measurement is the thing corrupted. So hand over the learning in the session's own words, written before anything is opened — what the agent had settled, what the comment changed — and take back one line saying where it landed, once the check passes. Nothing else goes in the prompt: that file's own "How this file is kept" is the brief. In doubt hand it over anyway, since ruling that a comment was not a bump is the subagent's call too.

**This is temporary by construction.** The collection exists to make one post draftable (`writing/linkedin/plan.md`, row 18); when that post runs, the file and this paragraph retire together. It is not a standing ritual, and it does not generalise into note-taking about reviews at large.

## Git conventions

Use semantic commit prefixes:

- `feat:` — new feature
- `fix:` — bug fix
- `content:` — written material the site does not yet serve: a draft, a channel plan, the conventions for writing them. The moment a piece goes live it arrives as the page that serves it, `.md` and `.pdf` variants included, and that is a `feat:`
- `docs:` — documentation changes
- `chore:` — maintenance, config, dependencies
- `refactor:` — code restructuring without behavior change
- `style:` — formatting, whitespace (no code change)
- `test:` — adding or updating tests
- `ci:` — CI/CD changes
- `perf:` — performance improvements
- `polish:` — a `/polish` run's own edits, a branch-local type `@.claude/skills/polish/SKILL.md` owns

**This list is local and extensible**, not the conventional-commits spec. `content:` was added because the closest standard prefix (`feat:`) misdescribed what the change was. When a change genuinely doesn't fit any row above, proposing a new row is a legitimate move — better than filing it under the nearest wrong one — provided the addition names a kind of change that recurs, and joins the gate's `publishing` set in the same change when a merge of it alters what the sites serve or how they get served (§ "Deployment").

Write descriptive commit messages: the subject line summarizes the change, and the body explains what was changed and why in enough detail that someone reading the log understands the commit without looking at the diff.

**On a feature branch in a remote/web environment** (typically signalled by a branch named `<vendor>/<autoname>`), commit and push proactively after each meaningful unit of work — don't wait to be asked. The operator is usually reviewing from a different machine than the VM the agent runs on, so they can only see the work once it's pushed.

**An opaque auto-branch (`claude/<adjective>-<noun>-<hash>`) is renamed before the first commit, and never once a PR exists** — renaming a PR's head closes the PR. `@.claude/skills/branch-rename/SKILL.md` owns when and how.

## Writing things down

The default is not to write it. Prose costs context on every session that loads it, and it goes stale invisibly — a constraint survives a refactor, a description of how the constraint works does not. Three questions, in this order:

1. **Should it exist at all?** Keep it only when all three hold: it is a **constraint or an accepted cost** rather than a description of how the code works; it is **not recoverable** from the code and its docstrings (or recovering it means holding more modules in your head at once than anyone does, where a paragraph gets there faster); and **getting it wrong breaks something** you can name. A line in this file also has to pass § "About this file"'s test.
2. **Is it durable?** Phrase it as a present-tense property of the code, never as the change that produced it. ("Key principles" above carries this.)
3. **Is it as short as it can be?** Only the non-obvious contract, at the length that contract takes.

**Never create a new top-level doc without asking the user**, and argue the "don't" side when you ask. A top-level doc is the one home nothing scopes, so every later session pays for it — and a decision plus the alternatives it beat already lives in the PR or issue thread that made it, which any of the scoped homes can cite by number.

`@.claude/skills/tend-prose/SKILL.md` is the long version and the only home for its rules — where a line goes, the tells for each defect, what to do with a finding. Load it for a borderline call or a deliberate pass, not on every doc touch.

**When a convention changes, every place that states it changes with it.** Repoint the citations rather than leaving one home right and the others quietly wrong — and if you find the same constraint stated in two places, that is the finding: one of them is the home and the other is a pointer.

**When a convention goes away, stop stating it — don't negate it in place.** A sentence that survives only to deny the thing it used to describe ("copy is not a catalogue") reads as a constraint but answers a question no reader of the current tree would ask: the polar bear. Cut it; `/tend-prose negation` is the pass that finds them, and "polar bear here" on a PR comment asks for it by name.

**Retiring a doc leaves a tombstone**, so every surviving citation still resolves: a file recording the last commit that contained it, the `git show <sha>:<path>` recipe to read it, and where any still-live content went. One tombstone per retirement, with a row per file: `retired.md` at the root of a retired directory, `<name>.retired.md` beside a retired file's siblings — so every tombstone matches `*retired.md`.

**Plans are the exception, being transient**: keep them current as the work deviates, with checklist items in forward-looking voice.

## Language

**Human-facing prose is English** — `README.md`, the docs a person reads to decide something, commit subjects and bodies, PR titles and bodies, and the plans and issue exports published for review. (The site's own `en`/`ru` content is a product decision, not this one: `src/shared/i18n/` owns it.)

Two further groups don't vary by project, so read them off here rather than asking:

- **Agent-facing — English.** `CLAUDE.md`, `.claude/skills/**`, `.claude/rules/**`, and code: comments, docstrings, identifiers. Agents follow English instructions most reliably, and other scripts spend several times the tokens saying the same thing on every load.
- **Conversation — the language it was asked in.** Session replies, issue and PR comments, review replies: each answers in the language of the message it answers.

## Explaining things to people

How to write for a person is long enough to have its own file, so it is imported
from `.claude/voice/` rather than stated here — in force from every session's
first reply. `operators/` beside it holds one file per person, saying how that
person in particular wants to be talked to.

`/plainly` is the on-demand procedure: bare, it re-explains an answer that did
not land; with a question, it answers plainly from the start. Invoking it is
optional — the rule itself governs every reply regardless.

<!-- A real import, not a pointer, so it is unbackticked: the import parser
     skips code spans, and backticking it would silently stop it loading. Every
     other @-reference in this file is backticked because it is a pointer the
     agent opens on demand.

     `operators/` beside it is deliberately not imported. A session applies one
     person's entry, so importing the directory spends context on everyone
     else's, every session — `.claude/hooks/operator-voice.sh` resolves the
     operator at startup and prints that one entry instead. -->

@.claude/voice/voice.md

## Working with skills

Skills live under `.claude/skills/` and run as `/<name>`. The main loop, in the order work passes through it:

- **`/task`** — makes the plan-or-not call, and runs what it picked.
- **`/plan`** — writes the plan to `docs/plans/`, publishes it as a draft PR, and hands over a `/go <branch>` command.
- **`/go`** — the go-ahead: does the work, runs the quality passes, fills in the PR.
- **`/finalize`** — land prep: vet, merge the base, sweep working artifacts, flip to ready, attest; on `and merge`, merges when the run left nothing to decide.
