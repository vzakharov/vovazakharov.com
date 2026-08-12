#!/bin/bash
# Vet: the fast checks the agent runs before pushing review-ready work.
#
# See CLAUDE.md → Vetting for the contract and for why this list is what it is.
set -euo pipefail

cd "$(dirname "$0")/.."

logs=$(mktemp -d)
trap 'rm -rf "$logs"' EXIT

names=()
pids=()

# Each check runs concurrently with its output captured, so the four cannot
# interleave into unreadable noise and a failure never hides the other three.
start() {
  local name=$1
  shift
  "$@" >"$logs/$name.log" 2>&1 &
  names+=("$name")
  pids+=("$!")
}

start typecheck pnpm typecheck
# Not `pnpm lint` — it carries --fix, and vetting must not mutate the tree.
start eslint pnpm exec eslint .
start format pnpm format:check
# Stands in for a test suite; also what deploy.yml runs, so green vet = green deploy.
start build pnpm build

failed=()
for i in "${!names[@]}"; do
  wait "${pids[$i]}" || failed+=("${names[$i]}")
done

for i in "${!names[@]}"; do
  printf '\n===== %s =====\n' "${names[$i]}"
  cat "$logs/${names[$i]}.log"
done

if ((${#failed[@]})); then
  printf '\nvet FAILED: %s\n' "${failed[*]}" >&2
  exit 1
fi

printf '\nvet OK\n'
