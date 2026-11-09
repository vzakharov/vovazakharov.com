#!/bin/bash
# Fail on a literal path in a rule's `paths:` that names no file in the tree.
#
# Claude Code loads a rule when a session reads a file its `paths:` match, and
# a path matching nothing is skipped without a word — so a renamed file turns
# its rule off silently. A literal path (no `*`, `?`, `[` or `{`) is checked to
# exist; a glob is not, since one matching nothing today (`.claude/staged/**`)
# can be correct. A tombstone (`*retired.md`) names its gone file on purpose,
# and is skipped. A file a list ought to name and does not is past this check:
# that is the call of whoever writes the list.

set -uo pipefail

cd "$(dirname "$0")/.." || exit 1

failures=0
while IFS= read -r rule; do
  case "$rule" in *retired.md) continue ;; esac
  while IFS= read -r path; do
    case "$path" in *[\*\?\[\{]*) continue ;; esac
    [ -e "$path" ] && continue
    printf '  ✗ %s: paths names %s, which does not exist\n' "$rule" "$path" >&2
    failures=$((failures + 1))
  done < <(
    awk '
      NR == 1 && /^---$/ { front = 1; next }
      front && /^---$/ { exit }
      front && /^paths:/ { list = 1; next }
      front && list && /^ +- / {
        sub(/^ +- +/, ""); gsub(/^["\x27]|["\x27] *$/, ""); print; next
      }
      front && list && !/^ / { list = 0 }
    ' "$rule"
  )
done < <(git ls-files -- '.claude/rules/*.md')

if [ "$failures" -eq 0 ]; then
  echo "check-rule-paths: OK"
  exit 0
fi
echo "check-rule-paths: $failures path(s) naming no file" >&2
exit 1
