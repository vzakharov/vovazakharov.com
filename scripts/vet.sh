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

# None of these seven writes anything another one reads, so they overlap freely.
# Not `pnpm lint` — it carries --fix, and vetting must not mutate the tree.
# type-overlap reads source text only — no generated types, nothing another
# check writes; the test run adds only writes into the OS temp directory, and
# `content:og --check` only hashes files, needing no browser.
scripts/run-parallel.sh \
  typecheck='pnpm typecheck' \
  eslint='pnpm exec eslint .' \
  format='pnpm format:check' \
  fsd='pnpm lint:fsd' \
  type-overlap='pnpm type-overlap' \
  og='pnpm content:og --check' \
  test='pnpm test' || status=1

if ((status)); then
  printf '\nvet FAILED\n' >&2
  exit 1
fi

printf '\nvet OK\n'
