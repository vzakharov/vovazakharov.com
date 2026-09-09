#!/bin/sh
# Hold every notes file under `writing/notes/` to the line ceiling its own "How
# this file is kept" states, and fail when one is over. The ceiling was prose in
# the file it governs, which is invisible to the append that breaks it — nothing
# reads a paragraph on its way to adding a section.
#
# Failing is the whole point, and failing is all it does: which of the squeezes
# the file itself names applies is a judgement, so nothing here trims.
#
# Usage:
#   scripts/check-notes-length.sh [<path>...]
#
# With no argument every `writing/notes/*.md` is measured; naming paths measures
# those instead. An empty directory passes — the notes tree retires with the
# posts it feeds.
#
# POSIX `/bin/sh`, like `check-squash-message.sh` beside it: `scripts/vet.sh` is
# the one entrypoint every adopter must have, so a check it calls adds no
# interpreter to the floor.
#
# Exit codes:
#   0  - every file is within the ceiling, or there are none to measure.
#   1  - a file is over, or bad arguments.

set -eu

PROG="check-notes-length"

MAX_LINES=400

NOTES_DIR="writing/notes"

NL='
'

usage() {
  cat >&2 <<EOF
usage: scripts/check-notes-length.sh [<path>...]

  Measures each notes file against the $MAX_LINES-line ceiling.
  With no argument, measures every $NOTES_DIR/*.md.
EOF
  exit 1
}

case "${1:-}" in
  -h | --help) usage ;;
esac

if REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null); then
  cd "$REPO_ROOT"
fi

if [ "$#" -gt 0 ]; then
  set -- "$@"
else
  # The glob stays unexpanded when it matches nothing, so the loop below has to
  # skip a path that is not a file rather than trusting the expansion.
  set -- "$NOTES_DIR"/*.md
fi

failures=""
measured=0

for file in "$@"; do
  [ -f "$file" ] || continue
  measured=$((measured + 1))
  lines=$(wc -l <"$file")
  # `wc -l` counts newlines, so an unterminated last line reads one short —
  # noise against a ceiling this size.
  if [ "$lines" -gt "$MAX_LINES" ]; then
    failures="${failures}${NL}  $file: $lines lines, ceiling $MAX_LINES — over by $((lines - MAX_LINES))"
  fi
done

if [ -n "$failures" ]; then
  printf '%s: FAIL —%s\n' "$PROG" "$failures" >&2
  printf '%s: squeeze it, do not grow it — the file says how, under "How this file is kept".\n' "$PROG" >&2
  exit 1
fi

if [ "$measured" -eq 0 ]; then
  printf '%s: no notes files to measure.\n' "$PROG"
  exit 0
fi

printf '%s: ok — %s file(s) within %s lines.\n' "$PROG" "$measured" "$MAX_LINES"
