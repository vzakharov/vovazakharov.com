# Seeing and driving what the run built

Opened when a bite's result has something to see or drive — a screen, a canvas, a sound, an API a client calls — and at a bite's end when the Artifact is republished. `SKILL.md` § "Rules that hold on every turn of a run" says a bite is done only once its result is seen; this file is how.

## Weigh the check against the build

- **A check costs less than the work it guards, or it shrinks.** A screenshot looked at by eye stays; a multi-step scripted scenario earns its place only for what a person cannot see — a page error, a budget, a regression — because a harness can come to cost more time and tokens than the code it checks.
- **A red that is the work's is fixed; a red that is the harness's own goes on the operator's list** (`operator.md` § "The dashboard") instead of into another round of harness work. A harness fix is the exception and argues for itself. Every checking agent is briefed with this split.
- **When the checks start finding the checks, stop the chase.** Count, per check, how many of its recent rounds found the work and how many found the script. Rounds lost to the script are attempts under `SKILL.md`'s failure rule (§ "Rules that hold on every turn of a run"): once it parks them, the remaining reds are recorded as known for the review and the operator's list, and the bite moves on to its next item.

## The drive script

For a web route, `@.claude/skills/preview/SKILL.md` boots the app and captures it, where the repo has it; build on it. Anything it cannot reach needs a drive script: a browser script for a sequence of inputs, a canvas or a runtime value; a client script for an API, calling it as its clients do — signed in as each role, against seeded data — and asserting each status, shape and what each role may see; a command run for a CLI. The rules below are written for a screen and hold for the others wherever they have a clock, a configuration or a captured output.

- **The drive script is committed, written with the first bite that needs it, and extended by each bite with its own controls.** A recipe rewritten from relay summaries each session once let a build with every input dead pass vet.
- **Step the clock and capture between steps; never time a screenshot.** A capture under a software renderer can take a second, so a shot "90 ms after a tap" shows the state a second later. The work ships a dev-only hook that pauses its loop and steps it, rather than a line each session adds and reverts. Anything on a clock of its own, such as an animation library's wall-clock tweens, is out of step in stepped captures: drive it from the stepped clock, or don't judge it from them.
- **Split the build from the run, as two calls, and render only what gets captured.** Each call then stays inside the tool's ten-minute ceiling; under a software renderer the drawing, not the logic, is the cost, so a step that draws only its last frame cuts a run several-fold.
- **Seed randomness in the script**, so a capture before a fix and one after it differ only by the fix.
- **Drive every control, read the state it leaves, and fail the run on any page error.** A change to what an input means re-tests every input, and the last run follows the bite's last source commit: a fix committed after the last captures once shipped every tap throwing, with vet green.
- **Read runtime state beside each capture, as drawn rather than as modelled.** A value read through the page — a drawn size, an audio context's state, a scale — confirms what the image only suggests, and the drawn value can miss a floor the model holds at rest. Check pixels through the page's own state, not by decoding the image.
- **"Drawn" is not "seen".** A check that a user must find something asserts it is reachable — the test the input routing makes — not that a visibility flag is set; a covered thing is drawn and invisible.
- **One configuration per call, run one after another, never side by side when anything is timed.** Parallel browsers on a shared machine fail a timing check falsely, and every configuration in one call outruns the tool's ceiling.
- **A check of motion takes its starting conditions from the range the configuration has**, not from the middle: a narrow screen leaves less room to accelerate, and a check that assumes the middle goes red against correct behavior.
- **A script that teleports the clock, the view or an entity breaks its per-frame records there.** Move it only as a real input would wherever its measures are read.
- **Output a person perceives by another sense is checked by rendering it.** Render sound offline and measure what a real device carries — energy above ~300 Hz for a phone speaker, loudness relative to the other sounds; spec-level tests pass on a sound nobody can hear.

## Captures

- **One recapture per bite by default.** Captures catch what reads fine in code: proportions, contrast, pale on pale.
- **Every look at a capture is side by side with what it is judged against** — the reference drawing, the mock, the previous bite's capture. A fault against the reference goes unremarked until the two sit together.
- **Before replying or relaying, the orchestrator opens each group's after-capture and two per bite, one per main configuration, however green the reports.** Agents report on what they were asked about, faults sit at the seams between briefs, and a test asserting a share of something visible passes on a visible fault.
- **The checking agent reads its own captures and logs a moving thing's track**, which catches motion a still misses; the orchestrator opens two of its captures before writing the report's line for a person.
- **A report from the operator's own machine gets a configuration of that size**, since stock configurations are devices. A cache fix is proved by a count of drawn against freshly computed, which a capture pair then illustrates.

## Performance

- **Report counts, not milliseconds** — draw calls, queries, bytes, renders. Counts are exact on a shared machine and name the piece; timings swing by half between runs.
- **The run prints a budget line per configuration and does not fail on it.** A spec's cost column ("static, free") is a claim to measure, and a red that stops a run for machine load costs more than it catches.
- **Log the load average beside every timing.** A median near its budget at load above 2 is unsettled, not red.
- **A budget red is run against a baseline build of an old commit, then alone with no other agent up, then profiled on a frame with no work, before it is filed as load or as the work's.** "The machine" is a measurement, not a verdict: a red once filed as load held when run alone, and the profile put it in the renderer.

## A check's report

- **Every report lists each stretch it stopped checking.** "I stopped drawing to get green" is an open lead: the orchestrator records it and briefs its trace.
- **Reds are tallied per kind by default**, so several causes under one class separate; without the tally, each fix lands a real cause while the count barely moves.

## The Artifact

When the work can stand as one page — a component, a game, a standalone tool — the operator uses it through one Artifact URL (`operator.md` § "The dashboard").

- **One self-contained HTML page, built into `tmp/` by a committed script.** The work's own code is bundled inline with `</script` escaped, heavy dependencies load from a CDN the Artifact tool allows rather than being inlined into every republish, and dev-only hooks are compiled out. Publish with the Artifact tool, passing the same `url` every time, so the link never changes.
- **Republishing never loads the bundle into the orchestrator.** Reading the page back hands its head over inline, tens of thousands of tokens for a bundled page; hand the publish to the agent that built it, or read every line but the bundle line.
- **A fresh session's first republish is refused until the live copy is read.** Publish with `url` and let the refusal save it; diff its lines minus the bundle line against the new build, where only the publish wrapper differs; `Read` its head with the Read tool — a shell diff does not count as the read — and publish again. Expect up to two refusals.
