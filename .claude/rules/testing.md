---
description: Which tests `pnpm test` runs, and how a test for a CLI script is written — the real script against a throwaway tree
paths:
  - '**/*.test.ts'
  - '**/*.test-kit.ts'
---

# Running the tests

**`pnpm test` runs only what the branch reached**: each changed `*.test.ts`, the
tests importing each changed kit (below), and the `<stem>.test.ts` beside each
other changed file (`scripts/test-changed.sh`). Arguments replace that selection
— `pnpm test path/to/x.test.ts`. The whole suite is `pnpm test:all`, which vet
runs — the mushroom meadow's half-hour tests left out unless `VET_MEADOW=1`
asks; don't start it by hand. A test the branch reaches only through an import —
a change to `src/kernel/shared/` breaking a test elsewhere — is not selected;
name it, or leave it to vet.

# Splitting a test file

**A test file stays under ~450 lines too**, CLAUDE.md's rule of thumb for
production files, and splits along its `describe` blocks into
`<subject>-<aspect>.test.ts` files beside it. What two or more of them share —
fixtures, a stand-up, an assertion of their own — goes in
`<subject>.test-kit.ts` beside them, imported relatively.

**A kit is test code, never a test**: no runner picks up `*.test-kit.ts`, and
the checkers read it as a test (`TEST_CODE` in `eslint/masd-graph.ts`) —
`boundaries` lets it take a lower slice's `index.test-only.ts`, and lets only
the test code of its own slice or segment import it.

# Testing a CLI

`scripts/type-overlap-check.test.ts` is the pattern to copy: it materializes a
throwaway source tree under the OS temp directory, runs the real script against
it with `cwd` set there, and asserts on exit code and report text. What is under
test is the artifact `pnpm type-overlap` runs, with no seam opened in production
code for the test's benefit.

The fixtures are written at runtime because a committed fixture would be a `.ts`
file the repo's own gate then scans.
