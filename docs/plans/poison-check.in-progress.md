# Poison check — the barrels' runtime axes, held transitively

The fourth item of `docs/masd.md` § "Open directions". `boundaries` judges one
import at a time, so a chain of individually legal imports can still carry a
module into a runtime that cannot hold it. Two such chains matter here:

- **client** — a `'use client'` file (under `src/` or `sites/*/app/`) reaching a
  module that opens with `import 'server-only'`, or an `index.no-browser.ts`
  barrel;
- **script** — a file under `src/*/scripts/` or root `scripts/` that runs
  without the `react-server` condition, reaching a `server-only` module, which
  throws on import there.

The model is `playgramai/playgramapp`'s `scripts/poison-check.ts` with its
`scripts/lib/poison-graph.ts`: a breadth-first walk from each root to the
nearest poisoned file, type-only edges dropped, violations collapsed onto the
last hop before the poison (the culprit) with the shortest chain kept as the
example. That walk, the blame dedup and the report port nearly verbatim. What
does not port is where the graph and the roots come from.

## The graph: our own resolver, not madge

The model reads madge's JSON. This repo already resolves every import of `src/`
and the routers in `scripts/masd-check.ts` (`resolveImport`, `sourceFile`, the
`@/` alias, relative paths, `index.ts` fallback). Recommendation: **extract that
into a shared `scripts/lib/import-graph.ts` and build the poison graph on it**,
rather than adding madge:

- no new dependency, and no second resolver that could disagree with the one
  `check:masd` counts references by;
- the poison check needs to tell type-only imports apart anyway, so it parses
  each file with `ts.createSourceFile` rather than `ts.preProcessFile`; with the
  AST in hand, madge's graph would only be a second parse to cross-reference
  (the model's `resolveSpecifier` exists solely to map its own specifiers back
  onto madge's keys);
- madge's resolver needs `tsconfig.json` per site to follow the alias, which is
  per site here (`sites/*/tsconfig.json`).

The alternative is a faithful port with madge as a devDependency. It lands close
— only the edge source differs — so this is an amendment if you'd rather have
it, not a rewrite.

## Roots and exemptions

- **client roots** — every `.ts`/`.tsx` under `src/` and `sites/*/app/` whose
  directive prologue holds `'use client'` (27 files today). No `'use server'`
  boundary: static export has no server actions, so that half of the model
  drops.
- **script roots** — every `.ts` under `src/*/scripts/` and root `scripts/`,
  tests included (the test runner has no `react-server` condition either —
  `src/blog/scripts/lib/read-collection.ts` and
  `src/basilisk/scripts/lib/docket.ts` are written around exactly that), **minus
  the entries run under `--conditions=react-server`**. Those entries are read
  off `package.json`'s scripts — every `tsx --conditions=react-server <path>`,
  with `site-task.sh`'s `{site}` placeholder expanded as a glob over `src/*/` —
  so the exemption follows the invocation rather than a list kept beside it. A
  library under a scripts directory that only an exempt entry imports is still a
  root, which would misfire; so only **entries** are roots — script files no
  other script file imports, plus every test — and a library is reached from
  them.
- **poison** — a module whose leading statements include `import 'server-only'`;
  for client roots also any `index.no-browser.ts`. A leaf behind a `no-browser`
  barrel, reached by a relative import inside its own slice, is not marked: the
  barrel's name is its only guard (`.claude/rules/masd.md`), and a client file
  inside the same slice reaching the leaf directly is a slice-local call
  `boundaries` already sees.
- **edges** — value imports, `export … from`, and dynamic `import()`; an import
  or re-export that is type-only in every declaration of its specifier is
  dropped, as in the model.

## Files

- `scripts/lib/import-graph.ts` — the file walk and resolver lifted out of
  `masd-check.ts`, plus `importEdges(file)` returning each resolved specifier
  with whether it is type-only. `masd-check.ts` switches to it, its behaviour
  unchanged (its `masd-check.test.ts` holds that).
- `scripts/poison-check.ts` — the walk, the marker scan, the roots and the
  `react-server` exemptions off `package.json`, one line per culprit on stderr
  in `check:masd`'s manner, exit 1 on any. _Built as one file rather than a
  `poison-graph.ts` library beside a CLI: at ~220 lines the split bought only a
  second test file restating what the CLI's tests already pin._
- `scripts/poison-check.test.ts` — runs the CLI against a materialized tree, as
  `scripts/masd-check.test.ts` does (`.claude/rules/testing.md`): shortest
  chain, the no-browser barrel, dynamic import and export-from followed,
  type-only dropped, the prologue-only directive, grouping by culprit, a script
  entry through its library, the exempt entry, its test still flagged, root
  `scripts/`.
- `package.json` — `"check:poison": "tsx scripts/poison-check.ts"`.
- `scripts/vet.sh` — `poison='pnpm check:poison'` in `source_checks`; it reads
  source only, so it overlaps the fan-out like `check:masd`.
- `.claude/rules/stack.md` — its roster line beside `check:masd`.
- `.claude/rules/masd.md` — "Three checkers" becomes four, the new one named
  with what it holds; the `index.no-browser.ts` and `server-only` bullets point
  at it where they now say the name is the only guard.
- `docs/masd.md` — the checker table gains its row; the Open directions item
  goes, and the section's "Four things" becomes three.

No staged copies: none of these load on every turn.

## Out of scope

- **The `node-safe` axis's other half** — a script reaching CSS, JSX or an asset
  import. Same walk, a different poison set; worth a line in Open directions if
  you want it, not built here.
- **Tests under `src/` outside `scripts/`.** They also run without
  `react-server`, but the task names the scripts directories as the roots; they
  fail on their own run anyway, which vet does. Adding them is one glob.

## DRY notes

- **Shared:** the resolver and file walk, moved from `masd-check.ts` into
  `scripts/lib/import-graph.ts` and used by both checks — the extraction is the
  point of not adding madge.
- **Reused:** `TEST_FILE` from `eslint/masd-graph.ts` to recognize tests, as
  `masd-check.ts` does.
- **Not shared:** the parse. `masd-check` keeps `ts.preProcessFile` (cheap, and
  a type-only import is still a reference for significance); the poison check
  needs the AST's type-only flags. Making one pay for the other's parse buys
  nothing.
- **Duplicated deliberately:** none expected beyond the model's code, which is
  ported, not imported.
