#!/bin/sh
# Runs a command as one of the sites: from that app's directory under `apps/`,
# with `NEXT_PUBLIC_SITE` set to the same id. Those two go together everywhere —
# the working directory is what `PUBLIC_DIR` and every build resolve against,
# the variable is what picks the config and the collections — and spelling them
# out per script is how they drift apart.
#
#   scripts/in-site.sh <site> <command> [args...]
#   scripts/in-site.sh lsa tsx scripts/render-pdf.ts --check
#
# An argument beginning `scripts/` is resolved against the repository root
# rather than the app directory, so a caller writes the path it would write from
# the root instead of counting the `../..` back out of `apps/<site>`.
set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

site=${1:?usage: in-site.sh <site> <command> [args...]}
shift

if [ ! -d "$root/apps/$site" ]; then
  echo "in-site.sh: no such site '$site' — apps/$site does not exist" >&2
  exit 1
fi

# Rotate argv, rewriting the script paths on the way past.
for _ in "$@"; do
  arg=$1
  shift
  case $arg in
  scripts/*) set -- "$@" "$root/$arg" ;;
  *) set -- "$@" "$arg" ;;
  esac
done

cd "$root/apps/$site"
NEXT_PUBLIC_SITE=$site exec "$@"
