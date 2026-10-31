#!/bin/sh
# One `package.json` entry for every site, its caller naming the site:
#
#   "content:og": "scripts/site-task.sh 'tsx src/{site}/scripts/render-og.ts'"
#   pnpm content:og vova --check
#
# pnpm appends the caller's arguments after the entry's own, so the entry's
# command is one quoted word and the site is the first argument after it.
# `{site}` in the command is that id, the remaining arguments follow the
# command, and `in-site.sh` runs it from that site's directory.
#
# `--every` lets the caller leave the site out, which runs the command for each
# site under `sites/` in turn, stopping at the first failure: `pnpm build` is
# every site's build, `pnpm build vova` one.
#
# The command is split on spaces and never globbed, so it holds no quoting.
set -eu

here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

every=false
if [ "${1-}" = --every ]; then
  every=true
  shift
fi

usage="usage: site-task.sh [--every] '<command>' <site> [args...]"
command=${1:?$usage}
shift

run() {
  site=$1
  shift
  set -f
  # Unquoted on purpose: the split is what turns the template into words.
  "$here/in-site.sh" "$site" $(printf '%s\n' "$command" | sed "s/{site}/$site/g") "$@"
  set +f
}

if [ "$#" -gt 0 ]; then
  run "$@"
elif $every; then
  for dir in "$here"/../sites/*/; do
    run "$(basename "$dir")"
  done
else
  echo "site-task.sh: name a site — $usage" >&2
  exit 1
fi
