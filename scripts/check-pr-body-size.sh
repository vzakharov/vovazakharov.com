#!/usr/bin/env bash
# Cap the branch's PR body, with hysteresis: it may grow to CEILING_CHARS, but
# once it has been over that, it passes again only at TARGET_CHARS or under. A
# body that only grows stops being read — every session adds to it and none
# trims — and a single cap would be trimmed back to just under itself, a few
# lines per session; the gap between the two numbers is what makes one trim buy
# room for many additions.
#
# Characters, not lines: an agent may write a paragraph as one line. Counted as
# Unicode code points, carriage returns dropped, so a body edited in GitHub's web
# form measures the same as one posted from a file.
#
# "Has been over" is read off the body's edit history (GraphQL
# `userContentEdits`, each edit holding the whole body as it stood), so there is
# no state to keep. The rule itself is `pr_body_cap` in `lib/pr-body-cap.sh`.
#
# Usage:
#   scripts/check-pr-body-size.sh [<pr-number>]
#
# With no argument it measures the open PR whose head is the current branch, and
# passes when there is none. There is deliberately no env override, for
# `check-squash-message.sh`'s reason: a different idea of the right size changes
# the constants below, in a commit that says why.
#
# Needs `gh` and a reachable GitHub. Either missing fails the check rather than
# skipping it, as `check-merge.sh` does, because the vet run prints only
# failures: a skip would read as a pass.
#
# Exit codes:
#   0  - within the limit, or no open PR for the branch.
#   1  - over the limit, gh missing or failing, or bad arguments.

set -euo pipefail

cd "$(dirname "$0")/.."

PROG="check-pr-body-size"
CEILING_CHARS=32000
TARGET_CHARS=24000

# shellcheck source=scripts/lib/gh-repo.sh
. scripts/lib/gh-repo.sh
# shellcheck source=scripts/lib/pr-body-cap.sh
. scripts/lib/pr-body-cap.sh

die() {
  printf '%s: %s\n' "$PROG" "$1" >&2
  exit 1
}

case "${1:-}" in
  -h | --help | -*) die "usage: scripts/check-pr-body-size.sh [<pr-number>]" ;;
esac
[ "$#" -le 1 ] || die "usage: scripts/check-pr-body-size.sh [<pr-number>]"
number="${1:-}"
[[ -z "$number" || "$number" =~ ^[0-9]+$ ]] || die "not a PR number: $number"

command -v gh >/dev/null 2>&1 || die "gh is not on PATH, so the PR body cannot be measured."

GH_REPO_PROG="$PROG"
gh_resolve_repo # sets NWO
owner="${NWO%%/*}"
name="${NWO#*/}"

# The body's length, as code points with carriage returns dropped.
LENGTH='gsub("\r"; "") | length'

if [ -z "$number" ]; then
  if ! branch=$(git symbolic-ref --quiet --short HEAD); then
    printf '%s: skipped — detached HEAD, no branch to find a PR for\n' "$PROG"
    exit 0
  fi
  # `headRefName` matches a fork's branch of the same name too, so the head's
  # repository is checked as well.
  query='query($owner: String!, $name: String!, $head: String!) {
    repository(owner: $owner, name: $name) {
      pullRequests(headRefName: $head, states: OPEN, first: 10) {
        nodes { number body headRepository { nameWithOwner } }
      }
    }
  }'
  found=$(gh api graphql -f owner="$owner" -f name="$name" -f head="$branch" -f query="$query" \
    --jq "[.data.repository.pullRequests.nodes[] | select(.headRepository.nameWithOwner == \"$NWO\")][0] // empty | \"\\(.number) \\(.body | $LENGTH)\"") ||
    die "gh could not look up the PR for branch '$branch'."
  if [ -z "$found" ]; then
    printf '%s: no open PR for %s — nothing to measure.\n' "$PROG" "$branch"
    exit 0
  fi
  number=${found%% *}
  chars=${found#* }
else
  query='query($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) { pullRequest(number: $number) { body } }
  }'
  chars=$(gh api graphql -f owner="$owner" -f name="$name" -F number="$number" -f query="$query" \
    --jq ".data.repository.pullRequest.body | $LENGTH") ||
    die "gh could not read PR #$number."
fi

# Every past version's length. A revision its author deleted has no text left
# to measure.
query='query($owner: String!, $name: String!, $number: Int!, $endCursor: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      userContentEdits(first: 100, after: $endCursor) {
        pageInfo { hasNextPage endCursor }
        nodes { diff }
      }
    }
  }
}'
history=$(gh api graphql --paginate -f owner="$owner" -f name="$name" -F number="$number" -f query="$query" \
  --jq ".data.repository.pullRequest.userContentEdits.nodes[] | .diff | select(. != null) | $LENGTH") ||
  die "gh could not read the edit history of PR #$number."

verdict=0
result=$(printf '%s\n' "$history" | pr_body_cap "$CEILING_CHARS" "$TARGET_CHARS" "$chars") || verdict=$?
[ "$verdict" -le 1 ] || die "unexpected length data for PR #$number."
read -r limit peak <<<"$result"

if [ "$verdict" -eq 1 ]; then
  printf '%s: PR #%s'"'"'s body is %s chars.\n' "$PROG" "$number" "$chars" >&2
  printf '%s: It has been past the %s ceiling (at most %s), so it passes again only at\n' \
    "$PROG" "$CEILING_CHARS" "$peak" >&2
  printf '%s: %s or under: cut %s more. Cut checked QA steps first, then the detail\n' \
    "$PROG" "$limit" "$((chars - limit))" >&2
  printf '%s: in the summary.\n' "$PROG" >&2
  exit 1
fi

note=""
[ "$limit" -eq "$CEILING_CHARS" ] || note=" (has been past $CEILING_CHARS, at most $peak; back under $TARGET_CHARS)"
printf '%s: ok — PR #%s'"'"'s body is %s/%s chars%s\n' "$PROG" "$number" "$chars" "$CEILING_CHARS" "$note"
