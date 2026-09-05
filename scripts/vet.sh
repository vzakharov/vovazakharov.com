#!/bin/bash
# Vet: the fast checks the agent runs before pushing review-ready work.
#
# See CLAUDE.md → Vetting for the contract and for why this list is what it is.
set -uo pipefail

cd "$(dirname "$0")/.."

status=0

# Runs alone, and first. `next build` regenerates `.next/types/`, which
# tsconfig.json includes, so overlapping it with the type check makes tsc read a
# route-type module the build has not finished writing — an intermittent TS2307
# on an import that is fine by the time anyone looks. Going first also means the
# type check reads current generated types rather than a stale set.
#
# It is also the only check that covers the app itself — the suite below reaches
# one script so far — and is what deploy.yml runs, so a green build here means a
# green deploy.
#
# Kept out of the fan-out below rather than run as a batch of its own, because
# run-parallel.sh wipes its log directory at startup — a build log written there
# would be gone by the time the second batch finished citing it.
mkdir -p tmp
if ! pnpm build >tmp/vet-build.log 2>&1; then
  sed 's/^/[build] /' tmp/vet-build.log
  printf '[build] full log: tmp/vet-build.log\n'
  status=1
fi

# The one check that repairs what it finds, and it reports by failing: the
# generator exits non-zero exactly when it had to write, so a stale partial is
# both fixed and named in one pass and `git diff` is the report. A generated
# file has one correct content, so the rewrite is never the judgment call that
# keeps `eslint --fix` out of vet.
#
# It runs alone for the mirror image of the build's reason: it *writes* two
# `.scss` files that the fan-out's stylelint and Prettier glob, and would hand
# one of them over truncated.
if ! pnpm styles:codegen >tmp/vet-styles.log 2>&1; then
  sed 's/^/[styles] /' tmp/vet-styles.log
  printf '[styles] full log: tmp/vet-styles.log\n'
  status=1
fi

# None of these nine writes anything another one reads, so they overlap freely.
# Not `pnpm lint` — it carries --fix, and the fan-out must not mutate the tree;
# `lint:css` is the check-only stylelint form, for the same reason.
# type-overlap reads source text only — no generated types, nothing another
# check writes; the test run adds only writes into the OS temp directory, and
# the two `--check` render passes only hash files, needing no browser.
scripts/run-parallel.sh \
  typecheck='pnpm typecheck' \
  eslint='pnpm exec eslint .' \
  format='pnpm format:check' \
  stylelint='pnpm lint:css' \
  fsd='pnpm lint:fsd' \
  type-overlap='pnpm type-overlap' \
  og='pnpm content:og --check' \
  pdf='pnpm content:pdf --check' \
  test='pnpm test' || status=1

if ((status)); then
  printf '\nvet FAILED\n' >&2
  exit 1
fi

printf '\nvet OK\n'
