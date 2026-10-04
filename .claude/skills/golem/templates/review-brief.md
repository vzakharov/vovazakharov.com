<!-- Copied by the orchestrator to docs/plans/<slug>/bite-<nn>-review-brief.md, every <slot> filled, and committed before any reviewer starts. review.md § "Before the brief" says what each slot holds and why. One copy serves every reviewer of the bite; each prompt adds only its role and, for a reader split by area, its area. -->

# Review brief — bite <nn>: <what the bite built>

You review bite <nn> of a `/golem` run with fresh eyes: you know nothing of how it was built, and that is the point. Read `<the run's common brief>` for the shared tree's rules, then `.claude/skills/golem/review.md` § "Sweeps" and § "Finding classes", which you apply.

## What you review

- **The diff**: `git diff <base>..<head>`.
- **The plan's decisions** for this bite: `<bite file>`, `<decisions file>`.
- **The screenshots**: `<paths>`, or "none: the work has no UI".
- **How its users reach it**: `<preview route, command, API, drive script>`.

## Rules

- **Never fix.** Only the user commits, and only screenshots and sweep scripts.
- **Write each finding to `<findings file>` the moment it is measured**, before you are long into the review, so a run out of context has still delivered. Report; the orchestrator posts.
- **Each finding gives**: what a user meets; the measurement, with numbers and screenshot names; the cause, anchored on a line inside the diff's hunks (a cause in unchanged code anchors on the changed line stating its contract, the causal line quoted); and an `Ask:` naming a checkable property. A finding you could not measure says so: it posts as a hunch.
- **You may argue against the spec** where the work's real platform beats it.

## What to sweep

- **What the orchestrator saw in the screenshots**: <targets>
- **The builders' known weaknesses and hints**, as questions — each a hypothesis to measure, not a finding: <questions>
- **Every behavioural claim in the bite's comments and plan entry**, each measured; ask an "on purpose" comment what it trades away: <claims>
- **Each invariant's domain**, and no wider: <invariant — domain>
- **The real platform's failure modes**, where the work touches storage, timing or the platform: <list, or "not applicable">
- **And an open pass**: what does a user actually meet? The list above does not bound the review.

## The user

Drive the built thing the way its users would: the screenshots first when it has a UI, then the flows, calls or commands its users run, then the sweeps; read code only to find causes. You may write your own step-by-step script for traces the committed drive script lacks. Take the steps no reader can: <device turns, resizes, reloads, dropped connections, back navigation — the ones this work meets>.

## The reader

<Area, when the reader is split.> Read the plan against the code, look for tests that cannot fail and bounds the code makes vacuous, apply the finding classes, and read `writing/notes/the-five-percent.md`, where the repo keeps one, as the list of what agents miss. Never append to it.
