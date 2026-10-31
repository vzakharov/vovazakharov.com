#!/bin/bash
# `pnpm test:all`, and vet's test entry: every `*.test.ts` in the tree, less the
# mushroom meadow's unless VET_MEADOW=1 asks for them.
#
# The meadow's tests simulate the game across every screen it fits — minutes a
# file, over half an hour together — where everything else takes seconds, and
# the game changes rarely. So they run on request, when the game is the work:
# `VET_MEADOW=1 ./scripts/vet.sh`, or `pnpm test:meadow` alone — this script's
# `meadow` mode, sharded by `MEADOW_SHARD` (`<k>/<n>`) when set. `pnpm test` is
# the run by hand, over only what the branch reached (scripts/test-changed.sh).
#
# The list comes from git rather than a glob so an agent's scratch worktree or
# an ignored directory never joins the run.
set -uo pipefail

cd "$(dirname "$0")/.."

# The game's layers; its scripts' own tests are quick and stay in.
MEADOW='^src/mushrooms/(shared|entities|features|widgets|pages)/'

case "${1:-}" in
  '') if [ "${VET_MEADOW:-}" = 1 ]; then pick=(cat); else pick=(grep -Ev "$MEADOW"); fi ;;
  meadow) pick=(grep -E "$MEADOW") ;;
  *)
    printf 'usage: scripts/vet-test.sh [meadow]\n' >&2
    exit 2
    ;;
esac

mapfile -t files < <(
  {
    git ls-files '*.test.ts'
    git ls-files --others --exclude-standard '*.test.ts'
  } | "${pick[@]}"
)
if [ -z "${1:-}" ] && [ "${VET_MEADOW:-}" != 1 ]; then
  printf 'vet-test: the meadow'\''s tests are skipped; VET_MEADOW=1 runs them.\n'
fi
# node reads `--test-shard` only ahead of the files.
exec node --import tsx --test ${MEADOW_SHARD:+--test-shard="$MEADOW_SHARD"} "${files[@]}"
