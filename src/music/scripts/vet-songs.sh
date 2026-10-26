#!/bin/bash
# Vet's song checks — masked words, song titles, repeated stanzas and the list
# of untold songs — run only on a branch that changes a song or what the checks
# run: each verdict is a function of the songs' own files, so a branch that
# touches neither has nothing for them to find. With no base to diff against,
# they run.
#
# The checks over the rest of the prose stay in vet.sh's fan-out, ungated.
set -uo pipefail

cd "$(dirname "$0")/../../.."

# shellcheck source=src/kernel/scripts/lib/changed-files.sh
source src/kernel/scripts/lib/changed-files.sh

INPUTS='^(sites/vova/public/music/songs/[^/]+\.md|src/music/scripts/(check-masked-words|check-song-titles|check-stanza-repeats|list-untold-songs)\.ts|docs/music/untold-songs\.md|src/music/shared/catalogue/sections\.ts|sites/vova/public/music/(albums|artists)/[^/]+\.md|src/music/shared/catalogue/catalogue-names\.ts|src/(blog/scripts/lib/public-markdown\.ts|kernel/scripts/lib/changed-files\.sh)|src/music/scripts/(lib/stanza-repeats\.ts|vet-songs\.sh))$'

if changed="$(changed_files)" && ! grep -qE "$INPUTS" <<<"$changed"; then
  printf 'vet-songs: no song has changed, so the song checks are skipped.\n'
  exit 0
fi

status=0
pnpm -s check:masked-words || status=1
pnpm -s check:song-titles || status=1
pnpm -s check:stanza-repeats || status=1
pnpm -s music:untold || status=1
exit "$status"
