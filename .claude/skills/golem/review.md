# The review

Opened at the review step of a bite's tail (`bite-end.md` places it), and again while its findings are fixed.

## Who reviews

- **The review is subagents in the tail, briefed with the diff, the plan's decisions and the screenshots — nothing of the build.** Fresh eyes catch what the builders settled, and a review session of its own pays a whole session's orientation for the same catch.
- **Two run in parallel: a user and a reader.** Each finds what the other cannot, and two reaching one cause independently is the confidence signal. A diff too big for one reader gets one reader per area.
  - **The user drives the built thing the way its users would** — screenshots first when it has a UI, then the flows, calls or commands its users actually run, then the sweeps below — and reads the code second, as the pointer to causes. Findings are in the result, not the diff: code that reads cleanly still ships what only looking shows. It may drive with its own step-by-step script for traces the committed drive script has no step for (`look.md` § "The drive script"); the committed script stays the tail's gate. Its brief lists the steps no reader can take — a request as another role or tenant, a device turned after a refused action, a resize, a reload, a dropped connection — since those find what no test was written for.
  - **The reader reads**: the plan against the code, tests that cannot fail, the finding classes below, and the log of what only humans catch (`writing/notes/the-five-percent.md`, where the repo keeps one) as the list of what agents miss.
- **Neither fixes, and only the user commits** — screenshots and sweep scripts. A reviewer that fixes reviews its own fix.
- **The human-catch log is frozen for the run**: reviewers read it and the review never appends to it, because the log counts only what humans caught and every review in a run is an agent's.

## Before the brief

**Copy `templates/review-brief.md` to `docs/plans/<slug>/briefs/bite-<nn>-review.md`, fill its slots, and commit it**, so a reviewer restarted after a container loss gets the same brief. The slots are where these go:

- **The orchestrator reads the bite's committed screenshots first and briefs what it sees as sweep targets.** Minutes of looking name what the agents then turn into numbers and causes.
- **The builders' known weaknesses and hints go in as sweep questions**, beside an open "what does a user actually meet" pass. Handing over what is known to be weak is cheaper than rediscovering it, and a hint is a hypothesis: the open pass keeps the sweep from being confined to it.
- **Work touching storage, timing or the platform carries the real platform's failure modes** — a record reopened mid-write, two tabs or two clients, a dropped connection, a store failing after it opened, a write that loops forever, a backgrounded app losing its storage — and the reviewer may argue against the spec. A spec weighs the model, not the device; when a finding beats a call, the orchestrator amends the call in the bite's file.
- **Each invariant's domain is stated.** Agents otherwise inherit a wider one from old sweeps and shrink the work to fit a domain the rule never protected.
- **Every behavioural claim in the bite's comments and plan entry is listed as a sweep target**, and an "on purpose" comment is asked what it trades away. A claim reads as fact until it is measured, and a comment calling a defect a choice gets read as settled.

## Sweeps

- **Every rule is swept over the states a user actually reaches** — after each kind of action, at full, after a resize or a reconnect — not the one a test helper builds. A rule that holds on the fresh state fails on the states users spend their time in.
- **A property is measured over many inputs by a committed script, never eyeballed from one result.** One screenshot gives an impression; a rate over thousands of inputs gives a number the fix can be checked against.
- **A small discrete input set is swept exhaustively once; the test samples it, and each number says which it came from.** A minimum read off a sample is not the minimum.
- **Measure a feature's rate under its guards, not only that it can happen**, and keep rate floors in a committed sweep. A guard that passes every check can still leave the feature happening almost never.
- **A sweep that sets a value prints the value the code actually used.** A clamp or a floor silently replaces the probe, and the probe rules out the wrong cause.
- **A sweep kept as a test is broken on purpose once**, to prove it tests something.
- **Ask of each bound whether the code makes it vacuous** — a check sitting above a cap, a fixture that cannot fail, a function that returns zero past the span its bound starts at. A bound true by construction tests nothing.

## Finding classes

Apply the classes the work has; each example is one kind of work among several.

- **Every read and write of a record checks who is asking, on the server**, and a test fails when the check is removed. A rule the client alone enforces is not enforced.
- **Every query in a shared store is scoped to the caller's tenant** — joins, counts, search, caches, background jobs and exports included — swept with two tenants' fixtures, asserting nothing of one reaches the other.
- **A migration runs forward on real-shaped data, has a written way back, and leaves the deployed code working while it runs** (`orchestrate.md` § "Waves by file": additive, then the switch).
- **An API's contract is what its existing clients send and read**: a renamed field, a narrowed type, a new required parameter or a changed status breaks them. Check against the published schema or the clients' own calls, not the server's tests.
- **Whatever a user must reach is checked as reachable** — a tap target against the size floor and everything that can overlap it, a control nearer layers cover, an action behind a permission the role never has.
- **Anything laid now to become something later is judged as the later thing**, against every rule; a feature switch gets a sweep before its screenshots are trusted. Pending state shipped as-is meets the rules it will break only when it switches.
- **Wrapping and boundary quantities are checked at their seam** — an angle, clock time across midnight or a time-zone change, the last page, a counter at its limit.
- **A floor holds at the narrowest state the thing reaches** — an animated pose, the smallest viewport, the longest translated label — derived from the constants and read back as drawn.
- **An absolute constant in a proportional layout breaks its resize contract**: ask which quantities are exactly proportional before keying stable placement off them.
- **A fix moving a shared constant sweeps the neighbouring properties at the old and new values**, and adds a bound for each it trades against. Nobody tested what the constant also held.
- **Grep every reader of each field a bite starts writing differently**; the fix gives the new meaning its own field. The old readers keep the old meaning.
- **A rate red is traced to the frame of reference each side measures in before it is called noise**, and an accepted residue is re-asked whenever one of those frames changes.

## Findings

- **Every finding ends with an `Ask:` naming a checkable property**, so its fix has a test to be written first.
- **Reviewers write each finding to their findings file, `docs/plans/<slug>/review/bite-<nn>-<role>.md`, the moment it is measured**, and report rather than post: one that runs out of context has still delivered.
- **A subagent's report is a lead, not a citation.** The orchestrator opens each cited line and reference before posting, since agents anchor past a file's end and overstate what a reference shows. Ask agents for numbers and screenshot names; anchor from a single file's numbered listing, because two files through one listing number as one.
- **A cause outside the diff anchors on the changed line that states its contract**, the causal line quoted in the comment; check every anchor against `git diff -U0 <base>..HEAD`'s hunks. A review comment cannot anchor on an unchanged line.
- **Findings both reviewers reach post as confirmed; one reviewer's finding without a measurement posts as a hunch.**
- **The review posts in one call**: build the review JSON (`commit_id`, `event: COMMENT`, `comments[]` with `line`/`start_line` and `side: RIGHT`) in a script, then `gh api -X POST repos/<o>/<r>/pulls/<n>/reviews --input <file>`. A failed post is atomic, so find a bad anchor by posting each comment alone as a pending review and deleting it.
- **The review is posted carrying the loop-review marker `scripts/gh_export/authorship.py` reads** — a line holding only `<!-- loop-review -->` in the review's body — so the export labels its threads `(agent review)`, and any `/handle` reading it takes them as guidance rather than as the run's own replies.

## Calls, then fixes

- **Each finding's call, with the alternative it beat, is committed to `docs/plans/<slug>/review/bite-<nn>-calls.md` before any fix is briefed** (`orchestrate.md` § "Settling the calls"). Fix agents then build to a rule and reply by pointing at it.
- **A failing check is a claim about the work, tested before it is fixed**: is the work wrong, or the check? A check defect fixed as a work defect breaks what was right.
- **Each fix is its own commit and its own reply, its test written first.** A thread answered by one commit untangles itself.
- **Fix agents post their replies last; the orchestrator posts any left** from the report's comment ids and SHAs, which costs one call where a fresh agent costs a whole baseline.
- **The review body's judgment calls are answered in one top-level comment** listing each call, the decision and its commit; inline threads get their own replies.
- **A fix set too large for the session spans relays**, carried by a progress file holding the decided design and the measurements, so the successor builds rather than re-deciding.
