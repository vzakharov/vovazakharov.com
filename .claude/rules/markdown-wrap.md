---
description: Agent-facing and repo-doc Markdown is hard-wrapped at 80 by prettier; content trees and GitHub-bound text are not
paths:
  - '**/CLAUDE.md'
  - '.claude/**/*.md'
  - .prettierignore
  - .prettierrc.json
---

# Markdown wrapping

The Markdown this repo's agents and contributors read raw is hard-wrapped at 80
columns by prettier, so an edit to one clause diffs as one line rather than as
its whole paragraph, and a file's line count reads as its length. The globs are
`.prettierrc.json`'s `proseWrap: always` override; `.claude/hooks/format-md.sh`
runs prettier over each `.md` an agent edits, and `pnpm format:check` in
`scripts/vet.sh` holds every file to it, staged copies included.

**The content trees keep their line breaks as written**: `sites/*/public/` is
served, its raw `.md` variants included, so a reflow there is a site change;
`writing/` holds copy-exact drafts pasted into channels that keep newlines;
`docs/music/` holds transcripts.

**Text bound for a GitHub issue or PR body, or a comment, is never wrapped**,
because GitHub renders its newlines as line breaks. Its homes in the tree —
`docs/pr/`, `docs/issue/`, `docs/remove-before-merging/`, `tmp/` — stay outside
the override, and a new home stays outside it too.
