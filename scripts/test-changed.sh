#!/bin/bash
# `pnpm test`: the tests the branch has reached — each changed `*.test.ts`, and
# the `<stem>.test.ts` beside each changed file when there is one. Arguments
# replace that selection and go to the runner as they are
# (`pnpm test scripts/lib/docket.test.ts`).
#
# The whole suite is `pnpm test:all`, which is vet's; the mushroom meadow's
# tests alone take over half an hour, so a run by hand reaching them only when
# the branch did is the default.
#
# Runs in the repository holding the working directory, so a test can point it
# at a throwaway one.
set -uo pipefail

RUNNER=(node --import tsx --test)

if [ "$#" -gt 0 ]; then
  exec "${RUNNER[@]}" "$@"
fi

# shellcheck source=scripts/lib/changed-files.sh
source "$(dirname "$0")/lib/changed-files.sh"

cd "$(git rev-parse --show-toplevel)" || exit 1

if ! changed="$(changed_files)"; then
  printf 'test-changed: no merge base with the default branch to diff against; `pnpm test:all` runs the whole suite.\n' >&2
  exit 1
fi

mapfile -t files < <(
  while IFS= read -r path; do
    [ -n "$path" ] || continue
    case "${path##*/}" in
      *.test.ts) candidate="$path" ;;
      ?*.*) candidate="${path%.*}.test.ts" ;;
      *) continue ;;
    esac
    [ -f "$candidate" ] && printf '%s\n' "$candidate"
  done <<<"$changed" | sort -u
)

if [ "${#files[@]}" -eq 0 ]; then
  printf 'test-changed: the branch reaches no test; `pnpm test:all` runs the whole suite.\n'
  exit 0
fi

printf 'test-changed: %d file(s) the branch reaches; `pnpm test:all` runs the whole suite.\n' "${#files[@]}"
printf '  %s\n' "${files[@]}"
exec "${RUNNER[@]}" "${files[@]}"
