#!/usr/bin/env bash
# What the branch has changed, for the vet entries that run only when it reaches
# them (scripts/vet-songs.sh).
#
# This file is meant to be SOURCED, not executed — it defines functions and does
# not set shell options.

merge_base_with_default() {
  for ref in refs/remotes/origin/HEAD refs/remotes/origin/main refs/remotes/origin/master; do
    git rev-parse --verify --quiet "$ref" >/dev/null || continue
    git merge-base HEAD "$ref" 2>/dev/null && return 0
  done
  return 1
}

# Every path changed since the merge base, one per line — committed, uncommitted
# and untracked alike, since vet judges the tree as it stands. Fails with no base
# to diff against, which a caller reads as "run everything".
changed_files() {
  local base
  base="$(merge_base_with_default)" || return 1
  git diff --name-only "$base" && git ls-files --others --exclude-standard
}
