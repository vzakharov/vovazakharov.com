#!/bin/bash
# Wait until every build job in this run has uploaded its export, so vet.yml's
# `built` job sets itself up beside the builds rather than after them. An
# artifact is listed the moment it uploads, where a job's conclusion can lag by
# minutes, so the wait reads the artifacts, and a build job's conclusion only to
# fail on one that ended without its export.
set -euo pipefail

: "${GITHUB_REPOSITORY:?}" "${GITHUB_RUN_ID:?}" "${GH_TOKEN:?}"
api="repos/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID"

while true; do
  # A failed call is a reason to ask again, not a verdict on the builds.
  if builds=$(gh api "$api/jobs?per_page=100" --jq \
    '.jobs[] | select(.name | startswith("build (")) | "\(.name[7:-1]) \(.conclusion // "running")"') &&
    uploaded=$(gh api "$api/artifacts?per_page=100" --jq '.artifacts[].name'); then
    if [ -z "$builds" ]; then
      printf 'no build job in run %s\n' "$GITHUB_RUN_ID" >&2
      exit 1
    fi
    waiting=0
    while read -r site conclusion; do
      grep -qx "out-$site" <<<"$uploaded" && continue
      case "$conclusion" in
        running | success) waiting=1 ;;
        *)
          printf 'build (%s) ended %s without an export\n' "$site" "$conclusion" >&2
          exit 1
          ;;
      esac
    done <<<"$builds"
    ((waiting)) || exit 0
  fi
  sleep 5
done
