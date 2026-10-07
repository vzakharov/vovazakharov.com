#!/bin/bash
# Vet's test entry: `pnpm test`'s suite, less the mushroom meadow's on a branch
# that changes nothing those tests run.
#
# The meadow's tests simulate the game across every screen it fits — minutes a
# file, over half an hour together — where everything else takes seconds. A
# test's verdict is a function of the code it runs, so the meadow's run when the
# branch touches its slice (fixtures included, read at runtime from beside the
# tests), any module its tests import from outside it, or the dependency
# manifests. The imports are read off an esbuild bundle of the tests rather than
# listed here, so a new one is covered the day it is written. With no base to
# diff against, everything runs.
#
# `pnpm test` stays the whole suite, for a run by hand.
set -uo pipefail

cd "$(dirname "$0")/.."

MEADOW='src/pages/mushrooms/'

merge_base_with_default() {
  for ref in refs/remotes/origin/HEAD refs/remotes/origin/main refs/remotes/origin/master; do
    git rev-parse --verify --quiet "$ref" >/dev/null || continue
    git merge-base HEAD "$ref" 2>/dev/null && return 0
  done
  return 1
}

# Every repo file the meadow's tests import, the slice's own included.
meadow_inputs() {
  mapfile -t tests < <(git ls-files "$MEADOW**/*.test.ts")
  pnpm exec esbuild "${tests[@]}" --bundle --platform=node --format=esm \
    --packages=external --log-level=error \
    --outdir=tmp/vet-test/bundle --metafile=tmp/vet-test/meta.json &&
    node -e 'for (const f of Object.keys(require(process.argv[1]).inputs)) console.log(f)' \
      "$PWD/tmp/vet-test/meta.json"
}

# Committed, uncommitted and untracked alike: vet judges the tree as it stands.
touches_meadow() {
  local base changed inputs
  base="$(merge_base_with_default)" || return 0
  changed="$(git diff --name-only "$base" && git ls-files --others --exclude-standard)"
  grep -q "^$MEADOW" <<<"$changed" && return 0
  mkdir -p tmp/vet-test
  inputs="$(meadow_inputs)" || return 0
  grep -qxF -e package.json -e pnpm-lock.yaml -e "$inputs" <<<"$changed"
}

if touches_meadow; then
  exec pnpm test
fi

mapfile -t files < <(
  {
    git ls-files '*.test.ts'
    git ls-files --others --exclude-standard '*.test.ts'
  } | grep -v "^$MEADOW"
)
printf 'vet-test: nothing the meadow'\''s tests run has changed, so they are skipped.\n'
exec node --import tsx --test "${files[@]}"
