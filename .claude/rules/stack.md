---
description: What scripts/vet.sh runs and why each check is in it, and the four sites a toolchain change has to wire
paths:
  - scripts/vet.sh
  - .github/workflows/vet.yml
  - .github/actions/setup-toolchain/**
  - scripts/run-parallel.sh
  - .claude/hooks/install-deps.sh
  - package.json
---

# The stack and the vet run

```bash
pnpm build            # every site's next build — the whole-app end-to-end check
pnpm styles:codegen   # rewrites the generated Sass partials; fails if it had to
pnpm typecheck                  # tsc --noEmit                  ┐
pnpm lint:check                 # not `pnpm lint`               │
pnpm format:check               # prettier --check ., md wrap too │
pnpm lint:css                   # stylelint, check-only         │
pnpm lint:fsd                   # steiger per app root          │
pnpm check:masd                 # the app graph, slices across apps │
pnpm masd:clusters              # no slice hiding a sub-slice   │
pnpm check:cycles               # madge: no import cycle in src/ │
pnpm type-overlap               # scripts/type-overlap-check.ts │
pnpm knip                       # unused files, exports, deps   │
pnpm check:mantine-styles       # rendered classes vs. imports  │
pnpm check:i18n-payload         # no page ships next-intl       │ concurrent
pnpm check:typography           # quotes and dashes per medium  │
src/music/scripts/vet-songs.sh  # song checks, when a song moved │
pnpm content:og <site> --check # social cards, hashes only, a site each │
pnpm content:drawings maya --check # each drawing's per-language copy │
pnpm music:masters check              # song masters' tags, hashes only │
pnpm content:pdf vova --cv-pages --from-out # CV page ceiling  │
scripts/vet-test.sh             # pnpm test:all, meadow on request │
python3 src/kernel/scripts/lib/test_hearing.py # transcribe.py's word merge │
python3 src/music/scripts/song-intake/test_song_facts.py # spectrogram facts │
python3 scripts/five-percent-verdicts/{test_tally,tally}.py # verdicts │
scripts/check-squash-message.sh # squash proposal size          │
scripts/check-skill-catalog.sh  # skill @-references            │
scripts/check-markdown-tables.sh # no tables, while markdown.md is │
scripts/staged.sh check         # staged always-loaded copies   │
wc -l delegation-model-capabilities.md # /go's notes, ≤100 lines │
scripts/check-claude-md-size.sh # CLAUDE.md + imports size cap  │
python3 .claude/costs/test_*.py # cost ledger, one run per file │
python3 .claude/costs/check_estimates.py # every session estimated │
python3 .claude/context-budget/test_context_budget.py         # │
python3 .claude/cold-cache/test_cold_cache.py                 # │
python3 .claude/keepalive/test_keepalive.py                   # │
python3 .claude/hooks/test_*.py # session hooks, one run per file ┘
```

**`scripts/vet.sh` runs that list split across GitHub's runners**: the phases
`vet.sh`'s header names, every job starting at once, bar the checks that read
the branch against its merge base or the cost ledger, which run on this machine
— a runner has neither without a full-history checkout, which costs more than
they take, and each passes quietly without it. It vets the **pushed** head and
refuses a tree that differs from it. Against the whole list run in one container
it halves the wall clock.

Nineteen things about that list are deliberate:

- **`pnpm build` is the only check that covers the app itself.** The suite
  reaches no page (CLAUDE.md § "Testing"), so the static-export build is what
  catches a broken page, route or import. It is what CI runs on `main` too — bar
  the PDF render each lane does after it, the one step of a deploy no local
  check stands in for. It is **four** builds, one job per site and none cached,
  and the vova build is the run's critical path: the export checks wait on it
  and every other job finishes first.
- **Never call `pnpm lint` from vet.** That script is `lint:check --fix`, and a
  fix it picks is a judgment about source someone wrote — vet is not the place
  to have that made silently. `pnpm lint:check` is the checking form, and
  `pnpm lint:css` is stylelint's. The codegen is the exception below, and it is
  one because a generated file has no judgment in it: exactly one content is
  correct. `lint:files`, which `lint:check` and vet's lint shards both call, is
  the one place ESLint's heap ceiling is set, at a fixed 3072 MB appended to the
  `NODE_OPTIONS` the environment already sets rather than replacing it: Node's
  default scales with the machine's memory, so without it one tree passes on a
  laptop and runs out of heap in a cloud container. A tree that outgrows the
  ceiling fails alike everywhere — the cue to find what grew, not to raise the
  number.
- **No build shares a tree with a type check or ESLint.** A build regenerates
  its app's `.next/types/`, which `tsconfig.json` includes, so a type check
  overlapping it reads a route-type module half-written; and `next typegen`,
  which writes the same types in under a second, emits a `cache-life.d.ts` the
  build then deletes under a running check. The `lint` and `typecheck` phases
  run typegen on runners no build touches, which is the one place it is safe.
- **The codegen runs alone, before the concurrent checks**, because it _writes_
  files that `lint:css`, `format:check` and `knip` glob. The rest touch nothing
  each other reads, so `scripts/run-parallel.sh` fans them out. A check added
  there has to be independent of whatever it runs beside.
- **Only failures are printed.** `run-parallel.sh` buffers each check under
  `tmp/run-parallel/` and replays just the ones that failed, prefixed by label
  and ending in the path to the verbatim log; the build does the same through
  `tmp/vet-build.log`. Every check still runs when an earlier one fails. The
  runner also flags a tree that was clean before the run and is dirty after — an
  autofix step that rewrote files and still exited 0.
- **`pnpm lint:css` is stylelint over `.css`/`.scss` only.** It is what holds
  the styling cascade to `.claude/rules/styling.md` — the layered-Mantine import
  means no rule in the tree needs `!important`, so `declaration-no-important`
  rejects one outright, and reaching for it is the signal that a value belongs
  in a CSS module rather than on a call site. Reading only stylesheets, it
  overlaps the rest safely.
- **`pnpm type-overlap` fails on any member two named types both declare**
  (floor 1) **and on any combination of bases two of them both spell** (floor
  2), with nothing grandfathered. Since nothing runs on pull requests, the vet
  run is the only place it fires — so a branch is first held to it at
  `/finalize`. It reads source text only, which is why it overlaps the others
  safely. Working a finding, the naming families for a base, and the gate's
  known blind spots: `scripts/type-overlap-check.README.md`.
- **`pnpm knip` fails on an unused file, export, type or dependency** — what
  `tsc`'s `noUnusedLocals` sees within a module, held between modules. `knip.ts`
  names how the repo is entered, and its header says how to answer a false
  finding. An `export` read only by its own file is a finding too: drop the
  `export`. It reads source and `package.json` only, which is why it overlaps
  the others safely.
- **`pnpm check:mantine-styles` is what makes the per-component Mantine imports
  safe to keep.** `src/shell/app/ui/theme-provider.tsx` names Mantine's three
  core stylesheets and one per component in use rather than the aggregate
  `styles.layer.css`, which is worth ~25 kB gzipped and costs a list that has to
  track the components. Omitting a sheet is silent — the component compiles,
  builds and renders unstyled — so the check compares the `m_*` classes in each
  site's built HTML against the rules in that site's built CSS, and reports the
  unused direction too. It reads only what the build already finished writing
  under `sites/*/out/`, which is what lets it overlap the rest; that is also its
  blind spot, a component rendered only after an interaction never reaching a
  static export. `.claude/rules/styling.md` is the home of the convention it
  holds.
- **`pnpm check:i18n-payload` keeps next-intl's client runtime off every page**,
  reading each built page under `sites/*/out/` as the check above does — so it
  overlaps the rest for the same reason, and `.claude/rules/i18n.md` holds the
  ban and why.
- **`pnpm check:typography` reads prose the way the page does**: it parses each
  document under `sites/*/public/` with the content pipeline's own remark
  plugins and flags a `"`, `'` or `--` only in a text node, so one in
  frontmatter, code or raw HTML — syntax, not punctuation — never trips it. A
  regex over the file could not tell the two apart. A draft's `text` fence it
  holds to its channel: typeset like a page, or, on LinkedIn, typed as a
  keyboard types. It reads only Markdown, which is why it overlaps the rest
  safely; `.claude/rules/content.md` § "Dashes" and § "Punctuation around
  quotes" and `writing/CLAUDE.md` § "Voice" are the rules it holds.
- **The song checks run only when the branch changes a song or the checks
  themselves**, a song's verdict being its own file's.
  `src/music/scripts/vet-songs.sh` gates `pnpm check:masked-words` — the same
  text nodes, through the same `src/blog/scripts/lib/public-markdown.ts`, for a
  word masked with asterisks — `pnpm check:song-titles`, and
  `pnpm check:stanza-repeats` on the branch's diff, which
  `src/kernel/scripts/lib/changed-files.sh` reads. It runs `pnpm music:untold`
  there as well, which regenerates `docs/music/untold-songs.md` and, like the
  codegen below, fails when it had to write. The typography check reads every
  site's prose, so it stays ungated.
- **`pnpm styles:codegen` repairs the generated Sass partials rather than
  reporting on them.** Two scales are needed on both sides of a boundary neither
  language can read across: the breakpoints (TypeScript for Mantine's responsive
  props, Sass literals for media queries, which cannot read a custom property)
  and the colour tokens (a TypeScript union for `cssColor()`, a Sass mixin for
  the declarations). `styles/_breakpoints.scss` and `styles/_tokens.scss` are
  generated from `src/shell/app/styles/breakpoints.ts` and
  `src/shell/shared/ui/css-color.ts`, so the Sass halves are derived rather than
  remembered. There is deliberately no check-only mode: vet runs the generator,
  and `vet.sh` fails when the tree changed under it — so drift is fixed and
  reported in one pass, `git diff` is the report, and a re-run is green. A
  partial it leaves untouched is written to not at all, which is what keeps the
  write off the fan-out's files.
- **The Open Graph check hashes files and nothing else**, so it needs no browser
  and overlaps the rest safely: `content:og <site> --check` compares each social
  card's source — a chart's authored SVG, the SVG a site's mark is drawn as, or
  the page the CV card is generated from — against `og-renders.json`, and fails
  rather than render, that being a committed, run-by-hand step
  (`.claude/rules/content.md` carries why). It is one entry per site rather than
  one script running both: a passed `--check` lands at the end of the command
  line, so a combined `a && b` would leave the first site rendering for real
  inside a vet run. `pnpm music:masters check` is the same kind of check over
  the song masters' names and tags, against
  `sites/vova/public/music/tag-renders.json`, and is what refuses a merge while
  a song's files are untagged or tagged from inputs that changed since.
  **Publishing the PDFs stays out of vet**: each lane prints that site's PDFs
  fresh after its own build, so the manifest a check would hash against lives in
  that lane's cache rather than in the tree.
- **`content:pdf vova --cv-pages` is the one check that runs a browser**, and
  only when the CV changed. It prints every CV edition from the export the build
  just wrote into the OS temp directory and fails one past `CV_PAGE_CEILING`,
  because a CV that grows a page shows nowhere else before the deploy prints it.
  `src/vova/scripts/render-pdf.ts`'s header says how an unchanged CV skips the
  print.
- **The suite is Node's own runner, loaded through `tsx`** — every `.test.ts` in
  the tree, no framework installed and none needed. It covers the scripts' own
  libraries and the pure functions under `src/`; CLAUDE.md § "Testing" says what
  belongs in it next. **Vet runs it whole through `scripts/vet-test.sh`
  (`pnpm test:all`), which drops the mushroom meadow's tests unless
  `VET_MEADOW=1` asks for them** — they take over half an hour, the rest
  seconds, and the game changes rarely — so a branch that works on the game runs
  them by asking, or alone through `pnpm test:meadow`. Asked, the bare vet run
  passes it on as `vet.yml`'s `meadow` input, which shards those tests across
  runners. The game's plays (`pnpm play:mushrooms`, every screen in groups,
  hours in one container) sit commented out there while they are cut down,
  `vet.sh`'s `probe` and `play` phases running them by hand. `pnpm test` is the
  run by hand, over only the tests the branch reached
  (`.claude/rules/testing.md`). Three Python suites sit beside it:
  `src/kernel/scripts/lib/test_hearing.py`, for
  `src/kernel/scripts/transcribe.py`'s pure half, which reads only its fixtures;
  `src/music/scripts/song-intake/test_song_facts.py`, for the spectrogram's
  measurements on synthetic signals, which needs numpy on the system Python; and
  `scripts/five-percent-verdicts/test_tally.py`, whose entry also runs
  `tally.py --check` over the committed verdicts, since a malformed row would
  otherwise surface only when the next article is written from them.
- **The last eleven read the agent infrastructure itself and write nothing
  another check reads, which is why they overlap the rest safely.**
  `scripts/check-skill-catalog.sh` asserts that every `@`-reference into
  `.claude/` resolves — the skill pointers and CLAUDE.md's own imports alike —
  and that every section citation into CLAUDE.md names a heading that exists;
  the failures it catches are silent, so leaving it to be run by hand puts it
  back on memory, which is where it was when it went unrun.
  `scripts/check-markdown-tables.sh` holds agent-facing Markdown to
  `.claude/rules/markdown.md`, and runs only while that rule exists.
  `scripts/staged.sh check` holds `.claude/staged/` to
  `.claude/rules/staging.md`, the delegation notes check holds `/go`'s
  `delegation-model-capabilities.md` to its keeping rule's cap, so a summary
  rewritten every session cannot drift into a log,
  `scripts/check-claude-md-size.sh` caps what `CLAUDE.md` and its imports cost
  every turn, measured as the branch will land them, the cost ledger's, context
  budget's, cold-cache guard's and keepalive's tests run the code under
  `.claude/costs/`, `.claude/context-budget/`, `.claude/cold-cache/` and
  `.claude/keepalive/` against temporary transcripts and repositories of their
  own, and `.claude/hooks/`'s feed its hooks payloads on stdin.
  `check_estimates.py` fails a branch carrying a session with no human-hour
  estimate, `.claude/costs/CLAUDE.md` § "Human-hour estimates" saying why the
  gate sits here.
- **What makes a check a member is that it measures this repo's own code**,
  which is the test for the whole list — `scripts/gh_export/` is vendored byte
  for byte and edited only at the source, so its suite runs there.
  `.claude/skills/update-muthur/divergence.md` carries that call, under
  `scripts/check-muthur.sh` and `scripts/test_*.py`.
- **`scripts/check-squash-message.sh` holds the squash proposal to the size caps
  `.claude/skills/squash-message/SKILL.md` states**, which is why it is the one
  check here that reads neither source nor build output — POSIX `sh` plus `git`
  over one markdown file, passing quietly on a branch that has no proposal. It
  overlaps the rest safely because nothing else touches
  `docs/remove-before-merging/`. What it catches that the skill's own Step 3
  cannot is a proposal edited by hand, or outgrown by a later base merge, after
  it was authored; the script's header carries the caps and how it finds a
  proposal `/finalize` has already swept.

## The four sites a toolchain change wires

A new runtime, a bumped pin, a new system dependency or a package-manager swap
is unfinished until all four agree:

1. `scripts/vet.sh` runs the checks above under the new toolchain. Where a check
   too slow for it goes is CLAUDE.md § "Vetting".
2. `.claude/hooks/install-deps.sh` installs the dependencies, so a resumed
   remote session tracks the current lockfile. It only re-syncs against the
   lockfile once the toolchain is there.
3. **CI**: `.github/actions/setup-toolchain` pins pnpm and Node for every
   workflow, and `.github/workflows/vet.yml` adds what only vet needs — Python
   with numpy, a git identity for the tests that commit. A runner starts bare,
   so a system dependency the container happens to carry is one that the vet run
   lacks.
4. **The environment setup script** installs and pins the toolchain for remote
   sessions. No API, MCP tool or in-repo file stands behind it, so no agent can
   change it: **say in your report what the operator must add there**, or the
   next session runs under a version nobody chose. The one case that detects
   itself is `gh` missing from `PATH`, which `.claude/hooks/gh-shim.sh` reports
   into the session context.
