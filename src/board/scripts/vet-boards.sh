#!/bin/bash
# Vet's board check — no Russian on any board — runs only on a branch that
# changes a board or the check: its verdict is a function of the boards' own
# files. With no base to diff against, it runs.
set -uo pipefail

cd "$(dirname "$0")/../../.."

# shellcheck source=src/kernel/scripts/lib/changed-files.sh
source src/kernel/scripts/lib/changed-files.sh

INPUTS='^(src/[^/]+-board/app/config/.*\.yaml|src/board/scripts/(check-board-language\.ts|lib/cyrillic\.ts|vet-boards\.sh)|src/kernel/scripts/lib/changed-files\.sh)$'

if changed="$(changed_files)" && ! grep -qE "$INPUTS" <<<"$changed"; then
  printf 'vet-boards: no board has changed, so the board check is skipped.\n'
  exit 0
fi

pnpm -s check:board-language
