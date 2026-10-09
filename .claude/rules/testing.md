---
description: Which tests `pnpm test` runs, and how a test for a CLI script is written — the real script against a throwaway tree
paths:
  - '**/*.test.ts'
---

# Running the tests

**`pnpm test` runs only what the branch reached**: each changed `*.test.ts`,
and the `<stem>.test.ts` beside each changed file (`scripts/test-changed.sh`).
Arguments replace that selection — `pnpm test path/to/x.test.ts`. The whole
suite is `pnpm test:all`, which vet runs; don't start it by hand, as the
mushroom meadow's tests alone take over half an hour, and vet leaves them out
unless `VET_MEADOW=1` asks. A test the branch reaches only through an import —
a change to `src/shared/` breaking a test elsewhere — is not selected; name it,
or leave it to vet.

# Testing a CLI

`scripts/type-overlap-check.test.ts` is the pattern to copy: it materializes a
throwaway source tree under the OS temp directory, runs the real script against
it with `cwd` set there, and asserts on exit code and report text. What is under
test is the artifact `pnpm type-overlap` runs, with no seam opened in production
code for the test's benefit.

The fixtures are written at runtime because a committed fixture would be a
`.ts` file the repo's own gate then scans.
