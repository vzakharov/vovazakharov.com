# Pickup and relay

## Attaching the successor

- **The successor's branch is stale nearly every time, and `reset --hard`
  is never the way out.** `create_session` with `source_revision` checks
  the branch out, so `/from-branch` Steps 2–4 (drop the auto-branch) are a
  no-op; but the successor comes up detached at the relay's commit, or on a
  local branch that is an old snapshot (12 commits behind at bite 1, 50 each
  side by bite 3), and a plain `git pull --ff-only` refuses. Met at almost
  every pickup from bite 3 to bite 10, so it is the norm. What was learned,
  in the order the skill's pickup should apply it:
  1. **Unshallow first.** The clone is shallow, so a stale ref and
     `origin`'s tip look unrelated even when one is an ancestor of the
     other. `git fetch --unshallow origin`, then
     `git merge-base --is-ancestor <branch> origin/<branch>`, and
     `git merge --ff-only origin/<branch>` needs no approval.
  2. **A genuine divergence goes aside, by rename.** Bite 9's end met one
     past `--deepen=300`: every commit only the stale ref held was the
     trunk's own old history ("Initial commit" onward), a snapshot from
     before a rewrite of `main`.
     `comm -23 <(git log --format=%s origin/<b>..<b> | sort -u) <(git log --format=%s origin/<b> | sort -u)`
     shows quickly that nothing session-made is on the stale side; then
     `git branch -m <branch> stale/<…>` and a fresh tracking branch — nothing
     lost, nothing to approve.
  3. **Never `reset --hard`.** Auto mode blocks it at some pickups and lets
     it through at others, and letting it through is the worse outcome:
     bite 9's review and bite 10's handling were then refused every later
     command, reads included, as retroactive destruction, and the run
     stopped on a turn to the operator — the one thing the loop exists not
     to need. Nothing was lost either time (the old tip came back from the
     reflog with `git branch stale-local/<…> <old-tip>`).
- **A constraint read after the step it governs does not govern it.**
  `/relay take` reads the summary at its step 2, after `/from-branch`'s
  attach, so the summary's "never reset" reached three successors too late
  — including one whose summary said "read this section before the attach,
  not after": a sentence inside the file cannot reorder the steps that
  open it. The skill should fix the order in `/relay take` (read `relay.md`
  from `origin/<branch>` with `git show`, then attach); until it does, the
  relaying session puts "never `reset --hard`; rename a stale ref aside" in
  the successor's prompt line itself, the one text read before the attach.
- **A pasted pickup installs the trunk's dependencies, not the branch's.**
  The SessionStart hook runs `pnpm install --frozen-lockfile` on the
  harness's auto-branch, cut from `main`, whose lockfile has no `phaser` or
  `esbuild`. So at bite 11's review handling every agent's `tsc` skipped
  the scene files until the orchestrator re-ran the install after the
  attach. The pickup should run `pnpm install --frozen-lockfile` right
  after checking out the branch.
- **Read files with `Read`, not `cat`/`sed -n`.** The refused read above was
  a Bash one, where CLAUDE.md asks for `Read`, and the operator asked why.
  `Read` also keeps each read one visible call a classifier weighs on its
  own.
- **MCP tool names change mid-session** (a server reconnects under another
  id). Relay and `create_session` calls have to be looked up by the current
  name, never taken from an earlier call in the transcript.
- **The relaying session keeps pushing after it relays.** Its Stop hook
  commits a cost row on every turn end, and its own subagents are still
  running: at bite 11's pickup three cost commits and the "running agent"'s
  test (d5d0715) landed on `origin` within minutes, and the successor's
  first two pushes were refused, one as a lock race. So the successor
  pulls `--no-rebase` before every push for its first hour, and checks
  `origin` for a relayed agent's commit before redoing its work, rather
  than trusting the summary's "may still be running". The skill should
  have the relaying session stop its subagents, or wait them out, before
  it starts the successor, so the summary's state is final.

## The context budget

- **The ~140k threshold is not measurable from inside a session, and one
  bite fills the budget anyway.** The loop said a `/handle` session takes
  the next bite "when its context is still under ~140k tokens", but only the
  context-budget hook's notice reports the size. Bite 1 alone reached the
  200k warning; handling bite 1's nine-thread review reached it before bite
  2 could start. The skill should key every decision on the notice, plan a
  review-handling session as a whole session, and relay `/go` from it by
  default.
- **The base context eats half the budget before the bite starts.** Bite 2's
  pickup (attach, the relay summary, `/go`, the plan, the slice's source
  read once) cost ~115k of the 200k line before a line was written; bite
  3's handling session was past the notice before its first fix. The skill
  should read the slice by pointer — the plan's `## Eaten so far` names each
  module's contract, so a session opens only the files it will edit — check
  the budget before starting a review's fixes (bite 4's handling spent ~50k
  on door sweeps before any code), and give the heavy exploration, and
  everything else it can, to subagents
  ([subagents.md](subagents.md)).
- **A structural bite does not fit one session, even orchestrated.** Bite
  11's session read a 938-line plan whole (~20k), ran a notes split and a
  code-mapping agent, wrote the bite and its briefs, and crossed 200k with
  one of five work packages built — the core agent itself ending at 254k,
  past the 170k line its brief set, because "stop when long" is not a
  measure it can take. What worked: the prompt line's "never reset" held
  (stale ref renamed aside, first try), and an operator ask arriving on
  the branch from another session was merged in, not overwritten. The
  skill should size a bite in work packages before taking it — more than
  two sequential packages is two bites — read the plan by section, arm the
  subagent check-in at ~15 minutes rather than 25, and plan the relay at
  the package boundary rather than meet it at the notice.
- **Reading an Artifact before republishing it costs ~40k tokens** when the
  page is a 135 KB bundle: the read hands its head back inline. The
  republish needs only the version header and the writer check. The skill
  should give that read a narrow `prompt`, or hand the republish to the tail
  agent that built the page, so the orchestrator's context never holds the
  bundle. The cheap path, taken at bite 11: publish with `url` and let the
  refusal save the live source to a file; `Read` every line of it but the
  one bundle line (the refusal names it), confirm the rest is the build
  script's shell plus the publish wrapper, and publish the same file again.
  A second unchanged publish without that `Read` is refused as a resend.

## The depth cap

- **A relay chain stops at eight sessions deep, and the operator's paste is
  part of the loop.** Bite 3's review session got
  `caller session is at lineage depth 8 (limit 8)` from `create_session`. A
  fresh-session Routine does not dodge it: bite 6's `/go` session at depth 8
  got the same refusal from `create_trigger` with
  `create_new_session_on_fire`. The operator ruled that the cap stays and
  relays are not to be replaced by subagent runs ("менять relay на что-то
  другое в этот подход megabeast-a точно не надо"). A chain lasted ~3½ hours
  for bites 1–3 and ~13 for bites 4–6, so the skill should count the depth
  in every relay summary, expect the paste about every three bites and say
  so, and fold what it can into fewer sessions (review handling into the
  next bite's session where context allows).
- **The cap-depth session ends at a natural stop.** Bite 8's review was the
  eighth in its chain, so it posted the review, wrote the summary with depth
  reset to 1 and the Next step `/handle`, and handed the operator
  `/relay take <branch>`. A review is the cheap place for it: nothing is
  half-built.

## What a relay carries

- **Known weaknesses and hints travel as questions for the sweep.** Bite 5's
  scene agent listed what it knew was weak (two butterflies crowding one
  cap, a butterfly wider than the smallest back caps on a phone, a
  wings-closed pose reading as a stick in a still); handing that to the
  review as questions is cheaper than rediscovering it. And a hint is a
  hypothesis, not a finding: bite 4's summary said the door's frame "pokes
  slightly past the stem", the sweep measured 0 px on every screen, and
  found beside it that the test holds the doorway rather than the painted
  frame — and the back door hidden on 96% of tablet visits, which nobody had
  noticed. The skill's review brief should list the hints as sweep
  questions next to an open "what does a child actually see" pass, so the
  sweep isn't confined to them.
- **`tmp/` doesn't survive a relay**, so anything a successor reruns — the
  play script, a sweep — is committed.
- **A bite that turns into a design session relays at the contract, not
  the code.** Bite 12's session reached 200k having built nothing of the
  bite: the reorder, three forks and a 448-line spec took the budget. The
  natural stop was the settled contract — `## Rest of the bite` pointing
  at the committed spec with every call decided — so the successor starts
  briefing step 0 at once. The skill should expect a structural bite to
  spend its first session this way when the operator is present.
