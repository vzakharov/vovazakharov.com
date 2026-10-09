#!/bin/bash
# Vet's test entry: `pnpm test`'s suite, less the mushroom meadow's unless
# VET_MEADOW=1 asks for them.
#
# The meadow's tests simulate the game across every screen it fits — minutes a
# file, over half an hour together — where everything else takes seconds, and
# the game changes rarely. So they run on request, when the game is the work:
# `VET_MEADOW=1 ./scripts/vet.sh`, or `pnpm test:meadow` alone. `pnpm test`
# stays the whole suite, for a run by hand.
set -uo pipefail

cd "$(dirname "$0")/.."

MEADOW='src/pages/mushrooms/'

if [ "${VET_MEADOW:-}" = 1 ]; then
  exec pnpm test
fi

mapfile -t files < <(
  {
    git ls-files '*.test.ts'
    git ls-files --others --exclude-standard '*.test.ts'
  } | grep -v "^$MEADOW"
)
printf 'vet-test: the meadow'\''s tests are skipped; VET_MEADOW=1 runs them.\n'
exec node --import tsx --test "${files[@]}"
