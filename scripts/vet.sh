#!/bin/bash
# Vet: the fast checks the agent runs before pushing review-ready work.
#
# See CLAUDE.md → Vetting for the contract and for why this list is what it is.
set -euo pipefail

cd "$(dirname "$0")/.."

logs=$(mktemp -d)
trap 'rm -rf "$logs"' EXIT

failed=()
names=()
pids=()

start() {
  local name=$1
  shift
  "$@" >"$logs/$name.log" 2>&1 &
  names+=("$name")
  pids+=("$!")
}

# Runs alone, and first. `next build` regenerates `.next/types/`, which
# tsconfig.json includes, so overlapping it with the type check makes tsc read a
# route-type module the build has not finished writing — an intermittent
# TS2307 on an import that is fine by the time anyone looks. Going first also
# means the type check reads current generated types rather than a stale set.
#
# It also stands in for a test suite, and is what deploy.yml runs, so a green
# build here means a green deploy.
pnpm build >"$logs/build.log" 2>&1 || failed+=(build)

# None of these four writes anything another one reads, so they overlap freely.
start typecheck pnpm typecheck
# Not `pnpm lint` — it carries --fix, and vetting must not mutate the tree.
start eslint pnpm exec eslint .
start format pnpm format:check
start fsd pnpm lint:fsd

for i in "${!names[@]}"; do
  wait "${pids[$i]}" || failed+=("${names[$i]}")
done

# Replay serially — concurrent writes would interleave into unreadable noise.
for name in build "${names[@]}"; do
  printf '\n===== %s =====\n' "$name"
  cat "$logs/$name.log"
done

if ((${#failed[@]})); then
  printf '\nvet FAILED: %s\n' "${failed[*]}" >&2
  exit 1
fi

printf '\nvet OK\n'
