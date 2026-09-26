---
description: What scripts/vet.sh runs and why each check is in it, and the three sites a toolchain change has to wire
paths:
  - scripts/vet.sh
  - scripts/run-parallel.sh
  - .claude/hooks/install-deps.sh
  - package.json
---

# The stack and the vet run

```bash
pnpm build            # every site's next build — the whole-app end-to-end check
pnpm styles:codegen   # rewrites the generated Sass partials; fails if it had to
pnpm typecheck                  # tsc --noEmit                  ┐
pnpm exec eslint .              # not `pnpm lint`               │
pnpm format:check               # prettier --check .            │
pnpm lint:css                   # stylelint, check-only         │
pnpm lint:fsd                   # steiger src                   │
pnpm type-overlap               # scripts/type-overlap-check.ts │
pnpm knip                       # unused files, exports, deps   │
pnpm check:mantine-styles       # rendered classes vs. imports  │
pnpm check:i18n-payload         # no page ships next-intl       │ concurrent
pnpm content:og:vova --check    # social cards, hashes only     │
pnpm content:og:bible --check   # the seal's own card           │
pnpm test                       # node --test over **/*.test.ts │
scripts/check-squash-message.sh # squash proposal size          │
scripts/check-notes-length.sh   # writing/notes/ ceiling        │
scripts/check-skill-catalog.sh  # skill @-references            │
scripts/staged.sh check         # staged always-loaded copies   │
python3 .claude/context-budget/test_context_budget.py         # ┘
```

Sixteen things about that list are deliberate:

- **`pnpm build` is the only check that covers the app itself.** The suite reaches no page (CLAUDE.md § "Testing"), so the static-export build is what catches a broken page, route or import. It is what CI runs on `main` too — bar the PDF render each lane does after it, the one step of a deploy no local check stands in for. It is **three** builds, one per site, run in sequence and none cached — so a change to any one site's text pays for all of them. That is the accepted cost of three sites out of one repository, and the first thing to revisit if the run becomes annoying.
- **Never call `pnpm lint` from vet.** That script is `eslint . --fix`, and a fix it picks is a judgment about source someone wrote — vet is not the place to have that made silently. `pnpm exec eslint .` is the checking form, and `pnpm lint:css` is stylelint's. `pnpm styles:codegen` is the one exception below, and it is one because a generated partial has no judgment in it: exactly one content is correct.
- **The builds and the codegen run alone, in that order, before the concurrent seventeen.** Each build regenerates its app's `.next/types/`, which `tsconfig.json` includes, so a type check overlapping it intermittently reads a route-type module the build hasn't finished writing and fails on the missing import. **Pre-generating with `next typegen` does not fix this and makes it worse** — typegen emits a `cache-life.d.ts` that the build then deletes, so instead of racing occasionally the type check fails every time on a file it has already globbed. The codegen is out of the fan-out for the mirror-image reason: it _writes_ two `.scss` files that `lint:css`, `format:check` and `knip` glob. The remaining seventeen touch nothing each other reads, so `scripts/run-parallel.sh` fans them out. A check added there has to be independent of whatever it runs beside.
- **Only failures are printed.** `run-parallel.sh` buffers each check under `tmp/run-parallel/` and replays just the ones that failed, prefixed by label and ending in the path to the verbatim log; the build does the same through `tmp/vet-build.log`. Every check still runs when an earlier one fails. The runner also flags a tree that was clean before the run and is dirty after — an autofix step that rewrote files and still exited 0.
- **`pnpm lint:css` is stylelint over `.css`/`.scss` only.** It is what holds the styling cascade to `.claude/rules/styling.md` — the layered-Mantine import means no rule in the tree needs `!important`, so `declaration-no-important` rejects one outright, and reaching for it is the signal that a value belongs in a CSS module rather than on a call site. Reading only stylesheets, it overlaps the rest safely.
- **`pnpm type-overlap` fails on any member two named types both declare** (floor 1) **and on any combination of bases two of them both spell** (floor 2), with nothing grandfathered. Since nothing runs on pull requests, the vet run is the only place it fires — so a branch is first held to it at `/finalize`. It reads source text only, which is why it overlaps the others safely. Working a finding, the naming families for a base, and the gate's known blind spots: `scripts/type-overlap-check.README.md`.
- **`pnpm knip` fails on an unused file, export, type or dependency** — what `tsc`'s `noUnusedLocals` sees within a module, held between modules. `knip.ts` names how the repo is entered, and its header says how to answer a false finding. An `export` read only by its own file is a finding too: drop the `export`. It reads source and `package.json` only, which is why it overlaps the others safely.
- **`pnpm check:mantine-styles` is what makes the per-component Mantine imports safe to keep.** `src/app/ui/theme-provider.tsx` names Mantine's three core stylesheets and one per component in use rather than the aggregate `styles.layer.css`, which is worth ~25 kB gzipped and costs a list that has to track the components. Omitting a sheet is silent — the component compiles, builds and renders unstyled — so the check compares the `m_*` classes in each site's built HTML against the rules in that site's built CSS, and reports the unused direction too. It reads only what the build already finished writing under `apps/*/out/`, which is what lets it overlap the rest; that is also its blind spot, a component rendered only after an interaction never reaching a static export. `.claude/rules/styling.md` is the home of the convention it holds.
- **`pnpm check:i18n-payload` keeps next-intl's client runtime off every page**, reading each built page under `apps/*/out/` as the check above does — so it overlaps the rest for the same reason, and `.claude/rules/i18n.md` holds the ban and why.
- **`pnpm styles:codegen` repairs the generated Sass partials rather than reporting on them.** Two scales are needed on both sides of a boundary neither language can read across: the breakpoints (TypeScript for Mantine's responsive props, Sass literals for media queries, which cannot read a custom property) and the colour tokens (a TypeScript union for `cssColor()`, a Sass mixin for the declarations). `styles/_breakpoints.scss` and `styles/_tokens.scss` are generated from `src/app/styles/breakpoints.ts` and `src/shared/ui/css-color.ts`, so the Sass halves are derived rather than remembered. There is deliberately no check-only mode: vet runs the generator, and `vet.sh` fails when the tree changed under it — so drift is fixed and reported in one pass, `git diff` is the report, and a re-run is green. A partial it leaves untouched is written to not at all, which is what keeps the write off the fan-out's files.
- **The Open Graph check hashes files and nothing else**, so it needs no browser and overlaps the rest safely: `content:og:<site> --check` compares each social card's source — a chart's authored SVG, the SVG a site's mark is drawn as, or the page the CV card is generated from — against `og-renders.json`, and fails rather than render, that being a committed, run-by-hand step (`.claude/rules/content.md` carries why). It is one entry per site rather than one script running both: a passed `--check` lands at the end of the command line, so a combined `a && b` would leave the first site rendering for real inside a vet run. **There is no PDF entry**: each lane prints that site's PDFs fresh after its own build, so the manifest a check would hash against lives in that lane's cache rather than in the tree.
- **`pnpm test` is Node's own runner, loaded through `tsx`** — every `.test.ts` in the tree, no framework installed and none needed. It covers the scripts' own libraries and the pure functions under `src/`; CLAUDE.md § "Testing" says what belongs in it next.
- **`scripts/check-notes-length.sh` holds each `writing/notes/` file to the line ceiling its own "How this file is kept" states.** Unlike the codegen above, it reports rather than repairs: which squeeze applies is a judgement, so nothing trims. It exists because the ceiling was prose in the file it governs, and nothing reads a paragraph on its way to appending a section. POSIX `sh` and `wc`, reading only `writing/notes/`, which nothing else here touches.
- **The last three read the agent infrastructure itself and write nothing another check reads, which is why they overlap the rest safely.** `scripts/check-skill-catalog.sh` asserts that every `@`-reference into `.claude/` resolves — the skill pointers and CLAUDE.md's own imports alike — and that every section citation into CLAUDE.md names a heading that exists; the failures it catches are silent, so leaving it to be run by hand puts it back on memory, which is where it was when it went unrun. `scripts/staged.sh check` holds `.claude/staged/` to `.claude/rules/staging.md`, and the context budget's tests run the hook under `.claude/context-budget/` against temporary transcripts of their own.
- **What makes a check a member is that it measures this repo's own code**, which is the test for the whole list — `scripts/gh_export/` is vendored byte for byte and edited only at the source, so its suite runs there. `.claude/skills/update-muthur/watermark.json` carries that call, under `scripts/check-muthur.sh` and `scripts/test_*.py`.
- **`scripts/check-squash-message.sh` holds the squash proposal to the size caps `.claude/skills/squash-message/SKILL.md` states**, which is why it is the one check here that reads neither source nor build output — POSIX `sh` plus `git` over one markdown file, passing quietly on a branch that has no proposal. It overlaps the rest safely because nothing else touches `docs/remove-before-merging/`. What it catches that the skill's own Step 3 cannot is a proposal edited by hand, or outgrown by a later base merge, after it was authored; the script's header carries the caps and how it finds a proposal `/finalize` has already swept.

## The three sites a toolchain change wires

A new runtime, a bumped pin, a new system dependency or a package-manager swap is unfinished until all three agree:

1. `scripts/vet.sh` runs the checks above under the new toolchain.
2. `.claude/hooks/install-deps.sh` installs the dependencies, so a resumed remote session tracks the current lockfile. It only re-syncs against the lockfile once the toolchain is there.
3. **The environment setup script** installs and pins the toolchain for remote sessions. No API, MCP tool or in-repo file stands behind it, so no agent can change it: **say in your report what the operator must add there**, or the next session runs under a version nobody chose. The one case that detects itself is `gh` missing from `PATH`, which `.claude/hooks/gh-shim.sh` reports into the session context.
