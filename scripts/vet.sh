#!/bin/bash
# Vet: the fast checks the agent runs on review-ready work before it merges.
#
# See `.claude/rules/stack.md` for the contract and for why this list is what it
# is.
#
# Bare, it runs every phase below on the pushed head: `local` here, and each of
# the rest in a job of its own of `.github/workflows/vet.yml`.
#
#   scripts/vet.sh build <site>   one site's build
#   scripts/vet.sh lint <k>/<n>   ESLint over the k-th of n shards of the files
#   scripts/vet.sh typecheck      the type check
#   scripts/vet.sh source         the codegen and the checks no build feeds
#   scripts/vet.sh built          the checks that read the exports on disk
#   scripts/vet.sh local          the checks that read the branch's history
#
# `local` stays on the machine that has the history: a runner's checkout would
# need all of it, and each check passes quietly against a base it cannot see.
#
# The phases that read route types but no export — `lint` and `typecheck` — write
# them with `next typegen` instead of waiting on a build. Typegen's types are
# the build's plus a `cache-life.d.ts`; it is safe only in a tree no build is
# writing at the same time (`.claude/rules/stack.md`), which no phase runs.
set -uo pipefail

cd "$(dirname "$0")/.."

usage() {
  printf 'usage: scripts/vet.sh [build <site> | lint <k>/<n> | typecheck | source | built | local]\n' >&2
  exit 2
}

verdict() {
  if (($1)); then
    printf '\nvet FAILED\n' >&2
    exit 1
  fi
  printf '\nvet OK\n'
  exit 0
}

# Runs a step with its output in `tmp/vet-<label>.log`, replayed only when it
# fails.
logged() {
  local label="$1" log="tmp/vet-$1.log"
  shift
  if ! "$@" >"$log" 2>&1; then
    sed "s/^/[$label] /" "$log"
    printf '[%s] full log: %s\n' "$label" "$log"
    status=1
    return 1
  fi
}

# The bare run: dispatches `.github/workflows/vet.yml` on the current branch,
# runs the `local` phase while it runs, and waits for it, printing a failed
# run's job logs. The run vets the branch as GitHub has it, so a tree that
# differs from the pushed head is refused rather than vetted by proxy.
dispatched() {
  local branch head pushed before run url status=0
  branch=$(git branch --show-current)
  head=$(git rev-parse HEAD)
  pushed=$(git ls-remote origin "refs/heads/$branch" | cut -f1)
  if [ -n "$(git status --porcelain)" ] || [ "$pushed" != "$head" ]; then
    printf 'vet: commit and push %s first — the run vets the pushed head\n' "$branch" >&2
    exit 2
  fi

  # `gh workflow run` names the run it started only in newer releases, so the
  # run is found as the one on this head that was not there before the dispatch.
  runs() {
    gh run list --workflow vet.yml --branch "$branch" --event workflow_dispatch \
      --limit 20 --json databaseId,headSha --jq ".[] | select(.headSha == \"$head\") | .databaseId"
  }
  before=$(runs) || exit 1
  gh workflow run vet.yml --ref "$branch" >/dev/null || exit 1

  scripts/vet.sh local || status=1

  for _ in $(seq 60); do
    run=$(runs | grep -vxF -e "$before" -e '' | head -n1) && [ -n "$run" ] && break
    sleep 2
  done
  if [ -z "$run" ]; then
    printf 'vet: the dispatched run on %s never appeared\n' "$head" >&2
    exit 1
  fi

  url="https://github.com/$(gh repo view --json nameWithOwner --jq .nameWithOwner)/actions/runs/$run"
  printf 'vet: waiting on %s\n' "$url"
  if ! gh run watch "$run" --exit-status --interval 15 >/dev/null; then
    gh run view "$run" --log-failed
    printf 'vet: run failed — %s\n' "$url" >&2
    status=1
  fi

  verdict "$status"
}

[ "$#" -gt 0 ] || dispatched

phase="$1"
case "$phase" in
  typecheck | source | built | local) [ "$#" -eq 1 ] || usage ;;
  build | lint) [ "$#" -eq 2 ] || usage ;;
  *) usage ;;
esac

status=0
mkdir -p tmp

# Each file goes to one shard by its place in the sorted list, so the shards
# together are every file ESLint would reach from `.`, whatever it then ignores.
# Every shard still builds the whole TypeScript program, which is what the
# type-aware rules read: a shard saves rule time, not program time.
lint_shard() {
  local k="${1%/*}" n="${1#*/}"
  [[ "$k" =~ ^[0-9]+$ && "$n" =~ ^[0-9]+$ ]] && ((k >= 1 && k <= n)) || usage
  local files
  mapfile -t files < <(
    {
      git ls-files
      git ls-files --others --exclude-standard
    } | grep -E '\.(js|jsx|mjs|cjs|ts|tsx|mts|cts)$' | sort -u |
      awk -v k="$k" -v n="$n" '(NR - 1) % n == k - 1'
  )
  pnpm -s lint:files "${files[@]}" || status=1
}

# The build is the only check that covers the app itself — the suite reaches one
# script so far — and what deploy.yml runs, bar the PDF render each lane does
# after it, which nothing here stands in for.
case "$phase" in
  build) logged build pnpm "build:$2" ;;
  lint) logged typegen pnpm typegen && lint_shard "$2" ;;
  typecheck) logged typegen pnpm typegen && { pnpm -s typecheck || status=1; } ;;
esac
if [[ "$phase" == build || "$phase" == lint || "$phase" == typecheck ]]; then
  ((status)) && exit 1
  exit 0
fi

# The check that repairs what it finds, and reports by failing: the generator
# exits non-zero exactly when it had to write, so a stale file is both fixed
# and named in one pass and `git diff` is the report. A generated file has one
# correct content, so the rewrite is never the judgment call that keeps
# `eslint --fix` out of vet.
#
# It runs alone because it *writes* files that the fan-out's stylelint, Prettier
# and knip glob, and would hand one of them over truncated. `built` and `local`
# leave it to `source`, whose run it is fixing and failing either way.
if [[ "$phase" != built && "$phase" != local ]]; then
  logged styles pnpm styles:codegen
fi

# None of these writes anything another one reads, so they overlap freely.
# The Open Graph check is one entry per site, not one script running both: pnpm
# appends a passed `--check` to the end of the command line, so a combined
# `a && b` would leave the first site rendering for real inside a vet run.
# The one PDF entry holds the CV to its page ceiling: it prints from the export
# into the OS temp directory, and records a pass under
# `tmp/` that nothing else reads. Publishing the PDFs stays each lane's job,
# since the manifest deciding what to reprint lives in that lane's cache.
# Not `pnpm lint` — it carries --fix, and the fan-out must not mutate the tree;
# `lint:check` and `lint:css` are the check-only forms, for the same reason.
# type-overlap and knip read source text only — no generated types, nothing
# another check writes, and knip writes nothing without --fix, which vet never
# passes; the test run adds only writes into the OS temp directory, and
# the `--check` render passes and the song-tag check only hash files, needing
# no browser, and the cost ledger's, context budget's, cold-cache guard's and keepalive's tests write only into
# their own temporary directories. The squash check reads the proposal under
# docs/remove-before-merging/ (or its own history) and the notes check counts
# lines under writing/notes/, neither of which anything else here touches.
# The Mantine and i18n-payload checks only read the exports under `apps/*/out/`,
# which nothing here writes to. The
# prose-quotes check and the song checks only read the Markdown under
# `apps/*/public/`.
# The last eight read the agent infrastructure itself and nothing else here
# touches it.
# The checks that read a build's exports.
built_checks=(
  mantine-styles='pnpm check:mantine-styles'
  i18n-payload='pnpm check:i18n-payload'
  cv-pages='pnpm content:pdf:vova --cv-pages --from-out'
)
# The checks that read the branch against its merge base, or the cost ledger.
local_checks=(
  songs='scripts/vet-songs.sh'
  squash='scripts/check-squash-message.sh'
  claude-md-size='scripts/check-claude-md-size.sh'
  estimates='python3 .claude/costs/check_estimates.py'
)
source_checks=(
  format='pnpm format:check'
  stylelint='pnpm lint:css'
  fsd='pnpm lint:fsd'
  type-overlap='pnpm type-overlap'
  knip='pnpm knip'
  prose-quotes='pnpm check:prose-quotes'
  og-vova='pnpm content:og:vova --check'
  og-bible='pnpm content:og:bible --check'
  og-basilisk='pnpm content:og:basilisk --check'
  music-masters='pnpm music:masters check'
  test='scripts/vet-test.sh'
  hearing='python3 scripts/lib/test_hearing.py'
  song-facts='python3 scripts/song-intake/test_song_facts.py'
  notes='scripts/check-notes-length.sh'
  skills='scripts/check-skill-catalog.sh'
  tables='[ ! -f .claude/rules/markdown.md ] || scripts/check-markdown-tables.sh'
  staged='scripts/staged.sh check'
  costs='for t in .claude/costs/test_*.py; do python3 "$t" || exit 1; done'
  context-budget='python3 .claude/context-budget/test_context_budget.py'
  cold-cache='python3 .claude/cold-cache/test_cold_cache.py'
  keepalive='python3 .claude/keepalive/test_keepalive.py'
  hooks='for t in .claude/hooks/test_*.py; do python3 "$t" || exit 1; done'
)
checks="${phase}_checks[@]"
scripts/run-parallel.sh "${!checks}" || status=1

verdict "$status"
