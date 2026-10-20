#!/bin/sh
# Prints the branch's own working directory under `docs/remove-before-merging/`:
# a subfolder named by the branch's last path segment
# (`masd/sites-by-domain` → `docs/remove-before-merging/sites-by-domain`).
#
# A bite branches off an elephant's branch and inherits its working files, so a
# fixed path would make the bite overwrite the elephant's squash draft and sweep
# its relays; a folder per branch keeps each one's files its own.
# `@.claude/skills/finalize/SKILL.md` says what a bite's finalize sweeps.
#
#   scripts/working-dir.sh            # the path, created on demand by callers
#   scripts/working-dir.sh <branch>   # the path for another branch
set -eu

branch=${1:-$(git branch --show-current)}
[ -n "$branch" ] || {
  echo "working-dir.sh: detached HEAD — name the branch" >&2
  exit 1
}
printf 'docs/remove-before-merging/%s\n' "${branch##*/}"
