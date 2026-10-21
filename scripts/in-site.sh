#!/bin/sh
# Runs a command as one of the sites: from that site's directory under `sites/`,
# with `NEXT_PUBLIC_SITE` set to the same id. The directory is what `PUBLIC_DIR`
# and every build resolve against; the variable is what `shared/config` reads,
# and the render scripts are its only consumer here — a `next` command gets it
# from `siteNextConfig` whatever the environment says.
#
#   scripts/in-site.sh <site> <command> [args...]
#   scripts/in-site.sh basilisk tsx src/basilisk/scripts/render-pdf.ts --check
#
# An argument beginning `scripts/` or `src/` is resolved against the repository
# root rather than the site directory, so a caller writes the path it would
# write from the root instead of counting the `../..` back out of
# `sites/<site>`.
#
# The repository's `node_modules/.bin` goes on `PATH`: the site directories are
# not packages of their own, so nothing there resolves `tsx` or `next` for a
# caller that is not already a `package.json` script.
set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

site=${1:?usage: in-site.sh <site> <command> [args...]}
shift

if [ ! -d "$root/sites/$site" ]; then
  echo "in-site.sh: no such site '$site' — sites/$site does not exist" >&2
  exit 1
fi

# Rotate argv, rewriting the script paths on the way past.
for _ in "$@"; do
  arg=$1
  shift
  case $arg in
  scripts/* | src/*) set -- "$@" "$root/$arg" ;;
  *) set -- "$@" "$arg" ;;
  esac
done

cd "$root/sites/$site"
PATH="$root/node_modules/.bin:$PATH"
export PATH
NEXT_PUBLIC_SITE=$site exec "$@"
