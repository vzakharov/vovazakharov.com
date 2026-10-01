COMMON BRIEF (every agent on bite 11's review)

Repo /home/user/vovazakharov.com, branch claude/mushroom-game-syama-lbirv7 (PR #57), shared working tree. Read CLAUDE.md first; it is binding.

You are reviewing bite 11 of Syama's mushroom game (src/pages/mushrooms/): "a wider meadow, panned" — the commits from 19b73065 to afbdd75 (`git diff 476652d1..afbdd75 -- src scripts`, `git log --oneline 476652d1..afbdd75`). What the bite claims to have built is item 11 of `## Eaten so far` in docs/plans/mushroom-game-syama.paused.md (§ "A wider meadow, panned (bite 11)") plus the whole-game Decisions it restated (one drag pans; sight against the world's edges, first perch on screen; flowers stay put through a pan). Read the plan by section, not whole. Everything else in `## Decisions the whole game carries` and the earlier items is the game as it stood, not up for re-argument. Per-package notes the bite's agents left: docs/remove-before-merging/bite-11/\*.md; frames in docs/remove-before-merging/frames/bite-11/. The player is Syama, a six-year-old boy, on a phone or tablet; the bar is a casual mobile game that is beautiful and comfortable for his hands.

Review as the operator would ("что бы на нашем месте сделал Страшила"). writing/notes/the-five-percent.md is the reading list (read it, never edit it): the frame taken as given, an account standing in for running it, reasoning written into the artifact, the copy edited instead of the fact, the render checked against intent rather than the page. A claim in a comment, a test name or the plan is a hypothesis to measure, not a fact; an "on purpose" comment is asked what it trades away; a bound is asked whether the code makes it true by construction.

Leads to check (hypotheses, not findings):

- The head-tap floor was lowered from 80% to 75% on measurement (worst mushroom 76.5% over 2000 tablet forests, bite-11/redfix.md). Is the lost 23.5% really all on mushrooms drawn in front — does a child tapping that head still get _a_ sensible response?
- Arrow keys are a held-key turn (0.5 screen/s cruise, 0.25 s ease, tap nudges ~2%, bite-11/keys.md), after the operator found the stepped version jerky: «Должен быть плавный, умеренно медленный поворот. Считай как в игрушках-стрелялках, только медленнее». Is it smooth at the world's edges, on blur, with both arrows held, on a resize mid-turn?
- Far hills are squashed under the sun by a smooth envelope (skyline.ts, bite-11/hills.md). Does it read as hills on every screen, or as a dent?
- `standingFlowers` pairs seeded flowers with bed feet by index (bite-11/flowers.md "Known limit").
- A drag pans and a tap taps: where is the line, and does a small child's wobbly tap on a mushroom ever pan instead, or a slow pan ever fire a tap?
- Things placed by screen-relative rules before the bite (controls, pickers, the sun, fliers' flights, the first perch "on screen") — which still assume the screen is the world?
- Suite time: fliers.test.ts takes ~354 s alone. Is that a cost the suite should carry?

Rules of work:

- Do not post on GitHub. Do not touch the plan, writing/, .claude/, or any source under src/, apps/, scripts/ — the handling session fixes; you find. Scratch goes under tmp/review-bite11/ (gitignored; never put a _.test.ts under tmp/, the test glob reaches it — name scratch scripts _.sweep.ts or \*.mjs).
- Never `git reset --hard`, never `git stash`, `git checkout -- <path>` or `git restore`. For a baseline or a mutation check use a throwaway `git worktree` in the scratchpad (/tmp/claude-0/-home-user-vovazakharov-com/5b313744-36cf-5169-beac-44db0e028123/scratchpad), `pnpm install --offline` there if it must build. Never leave the tree dirty.
- Only the player agent commits, and only under docs/remove-before-merging/frames/bite-11-review/ (`git add` that path only; `git pull --no-rebase` then push if rejected; merge, never rebase or force). Commit trailer lines:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01SMNahzzXtZFgmWC8Ww4UvT
- If you judge you are past ~170k context, stop and report what you have.
- Tests: `node --import tsx --test <file>` one file at a time (fliers.test.ts needs a 590 s timeout).
- Every finding: what a child (or the operator) would see or what breaks, the cause, a number where a number exists (measured over many seeds, not one frame), frame names for anything visual, and an `Ask:` line with a checkable property the fix can be tested against. Cite code as path plus the exact line text, not only a line number. Rank findings most-severe first. Say plainly when a lead turned out fine.
- Report in under 700 words.
