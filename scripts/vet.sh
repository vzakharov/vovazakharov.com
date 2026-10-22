#!/bin/bash
# Vet: the fast checks the agent runs before pushing review-ready work.
#
# See `.claude/rules/stack.md` for the contract and for why this list is what it
# is.
#
# Bare, it runs everything. The phases split the same run across machines —
# `.github/workflows/vet.yml` runs each in a job of its own — and together they
# cover exactly what the bare run does:
#
#   scripts/vet.sh build <site>   one site's build
#   scripts/vet.sh lint <k>/<n>   ESLint over the k-th of n shards of the files
#   scripts/vet.sh typecheck      the type check
#   scripts/vet.sh source         the codegen and the checks no build feeds
#   scripts/vet.sh built          the checks that read the exports on disk
#
# The phases that read route types but no export — `lint` and `typecheck` — write
# them with `next typegen` instead of waiting on a build. Typegen's types are
# the build's plus a `cache-life.d.ts`; it is safe only in a tree no build is
# writing at the same time (`.claude/rules/stack.md`), which is why the bare
# run never uses it.
set -uo pipefail

cd "$(dirname "$0")/.."

usage() {
  printf 'usage: scripts/vet.sh [build <site> | lint <k>/<n> | typecheck | source | built]\n' >&2
  exit 2
}

phase="${1:-all}"
case "$phase" in
  all | typecheck | source | built) [ "$#" -le 1 ] || usage ;;
  build | lint) [ "$#" -eq 2 ] || usage ;;
  *) usage ;;
esac

status=0
mkdir -p tmp

# Runs alone, and first. `next build` regenerates `.next/types/`, which
# tsconfig.json includes, so overlapping it with the type check makes tsc read a
# route-type module the build has not finished writing — an intermittent TS2307
# on an import that is fine by the time anyone looks. Going first also means the
# type check reads current generated types rather than a stale set.
#
# It is also the only check that covers the app itself — the suite below reaches
# one script so far — and is what deploy.yml runs, bar the PDF render each lane
# does after it, which nothing here stands in for.
#
# Kept out of the fan-out below rather than run as a batch of its own, because
# run-parallel.sh wipes its log directory at startup — a build log written there
# would be gone by the time the second batch finished citing it.
build() {
  if ! pnpm "$1" >tmp/vet-build.log 2>&1; then
    sed 's/^/[build] /' tmp/vet-build.log
    printf '[build] full log: tmp/vet-build.log\n'
    status=1
  fi
}

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

typegen() {
  if ! pnpm typegen >tmp/vet-typegen.log 2>&1; then
    sed 's/^/[typegen] /' tmp/vet-typegen.log
    printf '[typegen] full log: tmp/vet-typegen.log\n'
    status=1
    return 1
  fi
}

case "$phase" in
  build) build "build:$2" ;;
  lint) typegen && lint_shard "$2" ;;
  typecheck) typegen && { pnpm -s typecheck || status=1; } ;;
esac
if [[ "$phase" == build || "$phase" == lint || "$phase" == typecheck ]]; then
  ((status)) && exit 1
  exit 0
fi

[ "$phase" != all ] || build build

# The check that repairs what it finds, and reports by failing: the generator
# exits non-zero exactly when it had to write, so a stale file is both fixed
# and named in one pass and `git diff` is the report. A generated file has one
# correct content, so the rewrite is never the judgment call that keeps
# `eslint --fix` out of vet.
#
# It runs alone for the mirror image of the build's reason: it *writes* files
# that the fan-out's stylelint, Prettier and type check glob, and would hand
# one of them over truncated. `built` leaves it to `source`, whose run it is
# fixing and failing either way.
if [ "$phase" != built ] && ! pnpm styles:codegen >tmp/vet-styles.log 2>&1; then
  sed 's/^/[styles] /' tmp/vet-styles.log
  printf '[styles] full log: tmp/vet-styles.log\n'
  status=1
fi

# None of these writes anything another one reads, so they overlap freely.
# The Open Graph check is one entry per site, not one script running both: pnpm
# appends a passed `--check` to the end of the command line, so a combined
# `a && b` would leave the first site rendering for real inside a vet run.
# The one PDF entry holds the CV to its page ceiling: it prints from the export
# the build above wrote into the OS temp directory, and records a pass under
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
# The Mantine and i18n-payload checks only read what the build above already
# finished writing under `apps/*/out/`, which nothing here writes to. The
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
source_checks=(
  format='pnpm format:check'
  stylelint='pnpm lint:css'
  fsd='pnpm lint:fsd'
  type-overlap='pnpm type-overlap'
  knip='pnpm knip'
  prose-quotes='pnpm check:prose-quotes'
  songs='scripts/vet-songs.sh'
  og-vova='pnpm content:og:vova --check'
  og-bible='pnpm content:og:bible --check'
  og-basilisk='pnpm content:og:basilisk --check'
  music-masters='pnpm music:masters check'
  test='scripts/vet-test.sh'
  hearing='python3 scripts/lib/test_hearing.py'
  song-facts='python3 scripts/song-intake/test_song_facts.py'
  squash='scripts/check-squash-message.sh'
  notes='scripts/check-notes-length.sh'
  skills='scripts/check-skill-catalog.sh'
  tables='[ ! -f .claude/rules/markdown.md ] || scripts/check-markdown-tables.sh'
  staged='scripts/staged.sh check'
  claude-md-size='scripts/check-claude-md-size.sh'
  costs='for t in .claude/costs/test_*.py; do python3 "$t" || exit 1; done'
  estimates='python3 .claude/costs/check_estimates.py'
  context-budget='python3 .claude/context-budget/test_context_budget.py'
  cold-cache='python3 .claude/cold-cache/test_cold_cache.py'
  keepalive='python3 .claude/keepalive/test_keepalive.py'
  hooks='for t in .claude/hooks/test_*.py; do python3 "$t" || exit 1; done'
)
case "$phase" in
  # ESLint and the type check read the route types too; the phases leave them
  # to phases of their own.
  all) checks=("${built_checks[@]}" "${source_checks[@]}" typecheck='pnpm typecheck' eslint='pnpm lint:check') ;;
  built) checks=("${built_checks[@]}") ;;
  source) checks=("${source_checks[@]}") ;;
esac
scripts/run-parallel.sh "${checks[@]}" || status=1

if ((status)); then
  printf '\nvet FAILED\n' >&2
  exit 1
fi

printf '\nvet OK\n'
