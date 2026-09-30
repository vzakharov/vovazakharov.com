---
description: How a test for a CLI script is written — the real script against a throwaway tree
paths:
  - '**/*.test.ts'
---

# Testing a CLI

`scripts/type-overlap-check.test.ts` is the pattern to copy: it materializes a
throwaway source tree under the OS temp directory, runs the real script against
it with `cwd` set there, and asserts on exit code and report text. What is under
test is the artifact `pnpm type-overlap` runs, with no seam opened in production
code for the test's benefit.

The fixtures are written at runtime because a committed fixture would be a
`.ts` file the repo's own gate then scans.
