#!/bin/bash
# Vet on GitHub's runners: dispatches `.github/workflows/vet.yml` on the current
# branch, runs `scripts/vet.sh local` — the checks that read history, which stay
# on this machine — while it runs, and waits for it. Together they are the bare
# `scripts/vet.sh`, split; the exit is non-zero when either half fails, and a
# failed run's job logs are printed.
#
# The run vets the branch as GitHub has it, so a tree that differs from the
# pushed head is refused rather than vetted by proxy.
set -uo pipefail

cd "$(dirname "$0")/.."

branch=$(git branch --show-current)
head=$(git rev-parse HEAD)
pushed=$(git ls-remote origin "refs/heads/$branch" | cut -f1)
if [ -n "$(git status --porcelain)" ] || [ "$pushed" != "$head" ]; then
  printf 'vet-ci: commit and push %s first — the run vets the pushed head\n' "$branch" >&2
  exit 2
fi

# `gh workflow run` names the run it started only in newer releases, so the run
# is found as the one on this head that was not there before the dispatch.
runs() {
  gh run list --workflow vet.yml --branch "$branch" --event workflow_dispatch \
    --limit 20 --json databaseId,headSha --jq ".[] | select(.headSha == \"$head\") | .databaseId"
}
before=$(runs) || exit 1
gh workflow run vet.yml --ref "$branch" >/dev/null || exit 1

status=0
scripts/vet.sh local || status=1

run=
for _ in $(seq 60); do
  run=$(runs | grep -vxF -e "$before" -e '' | head -n1) && [ -n "$run" ] && break
  sleep 2
done
if [ -z "$run" ]; then
  printf 'vet-ci: the dispatched run on %s never appeared\n' "$head" >&2
  exit 1
fi

url="https://github.com/$(gh repo view --json nameWithOwner --jq .nameWithOwner)/actions/runs/$run"
printf 'vet-ci: waiting on %s\n' "$url"
if ! gh run watch "$run" --exit-status --interval 15 >/dev/null; then
  gh run view "$run" --log-failed
  printf 'vet-ci: run failed — %s\n' "$url" >&2
  status=1
fi

if ((status)); then
  printf '\nvet FAILED\n' >&2
  exit 1
fi
printf '\nvet OK\n'
