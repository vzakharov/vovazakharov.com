#!/bin/bash
# `Stop` hook: on one of Майя's `claude/maya-*` branches, dispatch
# `.github/workflows/maya-preview.yml` for the branch once the turn has pushed
# something her site serves, so preview.mayawonders.com follows her work one run
# per turn.
#
# It shares the event with the cost hook, which may push a row while this runs:
# the dispatch names the branch, not a commit, and a row changes nothing the site
# serves, so either order builds the same site.

. "$(dirname "${BASH_SOURCE[0]}")/lib.sh" || exit 0
read_payload
unsent="Майя's preview was not dispatched"
need_command jq "$unsent"

root="$(project_root)"
[ -n "$root" ] || exit 0
repo() { git -C "$root" "$@"; }

branch="$(repo branch --show-current 2>/dev/null)"
case "$branch" in claude/maya-*) ;; *) exit 0 ;; esac

need_command gh "$unsent"

# Trees the site never reads: what changes only there leaves her preview as it
# was, and is most of what her turns commit — reflections, drafts, cost rows.
unserved=(':!.claude' ':!docs' ':!personas' ':!writing')
site_differs() { ! repo diff --quiet "$1" "$2" -- . "${unserved[@]}" 2>/dev/null; }

# The commit last dispatched for this branch. Without one — a fresh container, a
# resumed branch — the branch is measured against where it left `main`, so a
# branch that touched no served file dispatches nothing.
marker="$root/tmp/maya-preview/${branch//\//_}"
since=''
[ -f "$marker" ] && since="$(repo rev-parse -q --verify "$(cat -- "$marker")^{commit}")"
[ -n "$since" ] || since="$(repo merge-base HEAD origin/main 2>/dev/null)"

head="$(repo rev-parse -q --verify HEAD)" || exit 0
[ -z "$since" ] || site_differs "$since" HEAD || exit 0

# GitHub builds what origin holds, so a served change still unpushed waits for
# the turn that pushes it; the harness's own check is what asks for that push.
site_differs "origin/$branch" HEAD && exit 0

err="$(cd "$root" && gh workflow run maya-preview.yml --ref "$branch" 2>&1)" || {
  # A re-fired `Stop` bails, or the turn never ends; the marker is left alone,
  # so the next turn's stop retries.
  [ "$(field stop_hook_active)" != "true" ] || exit 0
  say "${unsent}: ${err} Fix what that names if it is yours to fix, then just stop; the next turn's stop dispatches it again."
  exit 2
}

mkdir -p -- "$(dirname "$marker")" && printf '%s\n' "$head" >"$marker"
exit 0
