COMMON BRIEF (every agent on bite 10's review)

Repo /home/user/vovazakharov.com, branch claude/mushroom-game-syama-lbirv7 (PR #57), shared working tree. Read CLAUDE.md first; it is binding.

You are reviewing bite 10 of Syama's mushroom game (src/pages/mushrooms/): the commits 11f3f09..2be0028 (`git diff 11f3f09..2be0028`, `git log 11f3f09..2be0028`). What the bite claims to have built is item 10 of `## Eaten so far` in docs/plans/mushroom-game-syama.paused.md; `## Decisions the whole game carries` and the earlier items are the game as it stood, not up for re-argument. Per-group notes the bite's agents left: docs/remove-before-merging/bite10/*.md. The player is six, on a phone or tablet; the bar is a casual mobile game that is beautiful and comfortable for his hands.

Review as the operator would. writing/notes/the-five-percent.md is the reading list (read it, never edit it): the frame taken as given, an account standing in for running it, reasoning written into the artifact, the copy edited instead of the fact, the render checked against intent rather than the page. A claim in a comment, a test name or the plan is a hypothesis to measure, not a fact.

Leads to check (hypotheses, not findings): the insect floors trade ~1 flower in 6–7 losing a butterfly's wing room after a turn; the tap patch floor is 24 px while a finger is ~64; "every tuft shown takes a flower until the cap"; on a short sky an open picker takes the top row and hides the buttons it covers; a shape press is silent; three play-run failures were ruled check defects rather than game defects (bite10/play-fails.md) — were they?

Rules of work:

- Do not post on GitHub. Do not touch the plan, writing/, .claude/, or any source under src/, apps/, scripts/ — the handling session fixes; you find. Scratch goes under tmp/review-bite10/ (gitignored; never put a *.test.ts under tmp/, the test glob reaches it — name scratch scripts *.sweep.ts or *.mjs).
- Never `git reset --hard`, never `git checkout -- .`. Only the player agent commits, and only under docs/remove-before-merging/frames/bite-10-review/ (`git add` that path only; `git pull --no-rebase` then push if rejected; merge, never rebase or force). Commit trailer lines:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01HM2qHVGwnatghVymXpHe9x
- If you judge you are past ~170k context, stop and report what you have.
- Tests: `node --import tsx --test <file>` one file at a time. Mutation-check a test you suspect of being vacuous by editing a copy of the module under tmp/ or via `git stash`-free means (a `git worktree add ../wt-review 2be0028` outside the repo is fine); never leave the tree dirty.
- Every finding: what a child (or the operator) would see or what breaks, the cause, a number where a number exists (measured over many seeds, not one frame), and an `Ask:` line with a checkable property the fix can be tested against. Rank findings most-severe first. Say plainly when a lead turned out fine.
- Report in under 700 words.
