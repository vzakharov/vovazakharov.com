# Subagents and parallel work

## The session is an orchestrator

- **Every session in the loop is an orchestrator from its first turn, `/go`
  as much as `/handle`.** Bite 3 hit the budget notice with the scene still
  unwired, and handed frames, polish plus vet, and the PR refresh to
  subagents to finish; its handling session, past the notice before the
  first fix, briefed one subagent per thread and kept only their reports.
  From bite 4 the shape was the default: the main session wrote
  `## This bite` with every open call decided, then briefed three subagents
  in sequence — the model with its tests, the scene with its frames and
  play steps, the tail — and stayed near 160k (bite 4), ~70k (bite 5) and
  ~40k (bite 6) while the subagents spent ~600k between them. A model/scene
  split works because the model agent's report is a ready API brief for the
  scene agent. The main session keeps what a subagent cannot do well:
  settling the bite's calls before any brief, looking at frames beside the
  drawing ([play-run-and-frames.md](play-run-and-frames.md)), and folding
  the bite into the plan.
- **The scene agent may change the model for an invariant the frames
  expose**, and lists each change in its report so the plan absorbs it.
  Bite 6's did (a bee never settling back on the flower it leaves, or no
  bee ever pollinated), and reported them as decisions.
- **A look bite opens with a research agent that writes a spec, not code.**
  Bite 7 ("atmosphere") had no model to split on. One agent fetched
  reference stills into `tmp/refs/`, read the painting code and Phaser's
  source for what is cheap (gradients and filters turned out WebGL-only and
  a render pass a frame), and wrote a spec whose items each name what the
  references do, the change in the code's terms, a checkable property and a
  cost. It split the items by files into two groups and named a small step 0
  (the shared table split, a pure light module) that had to land first. The
  orchestrator settled the spec's open calls in `## This bite`, ran step 0
  alone, then the two groups in parallel, their file lists disjoint down to
  "the scene is B's; A comes through `paintBackdrop`'s layer contract". The
  skill should make "research → spec → step 0 → parallel groups by file" the
  shape of any bite whose subject is the look rather than behaviour.
- **Parallel groups are followed by a fix round, and the fix round owns the
  final gates.** Bite 7's two groups each reported their own work right,
  and the orchestrator's frames still found three defects at the seams
  between them. Each group's gate report also showed the other's half-made
  state (`type-overlap` failing in A's files, `tsc` in B's test), clean once
  both landed. The skill should budget the round by default, briefed from
  the orchestrator's own frames.

## Handling a review

- **The export's authorship label reads the loop's own review as
  answered.** `/handle` fires its review lane on a thread whose tail is
  `(human)`, but every review in this loop is an agent's, so all nine
  threads of bite 1's review came out `@vzakharov (agent)`, the label
  `/handle` treats as the agent's own reply; the session worked them anyway
  because the plan's loop says to. The skill should make a loop review
  recognisable on its own, for example with a marker line the review
  session writes and `/handle` reads as guidance whatever the label.
- **A review's fixes can be a bite of their own.** Bite 4's review raised
  eight findings, three geometric (occlusion, tap size, mouse size), each
  needing sweeps. The skill should let a handle session split the fixes
  across relays, carried by a
  `docs/remove-before-merging/handle-bite<n>/progress.md` that holds the
  design decided and the measurements.
- **A review's design calls are decided on paper before the brief, and the
  proof can reopen them.** Writing each choice into the plan's decisions
  and committing it first gives the implementing subagent a rule to build
  to, not a question to settle, and the reply can point at it. Bite 9's
  handling decided "each screen at its own width"; the agent's report
  showed a turn then broke door-in-sight in most phone meadows, so the
  orchestrator decided one viewing angle, and the next agent found that
  starves a sideways phone's sky, a third call (the minimum size gives way).
  Each call went into the plan with the numbers that forced it. The skill
  should expect a layout review to take calls in a chain like this, and
  brief each agent to stop and report at the first rule it cannot keep,
  with the options measured, rather than pick one.
- **A report's trade-off lines are the orchestrator's to decide, not to
  forward or footnote.** Bite 5's review asked for exclusive perches and
  flowers only in sight; both landed to the letter, and the report said
  that on a small phone 89% of visits now lost a butterfly, breaking "the
  meadow only gets fuller" — as "for you to decide", not as a failure. The
  perch group met every number by stretching a far flight in proportion to
  its length (a fly crawling 11 s into a phone). Bite 9's reports ended with
  trade-offs (the small phone filling to six in 69% of visits, the bees'
  floor in a full forest). Bite 10's tufts agent capped tufts to the flowers
  left and so hid the full-meadow refusal the plan promised — a design
  change only the orchestrator could weigh, since each group sees only its
  own files. The skill should:
  - brief every constraint-tightening fix with the invariants it must not
    break, named from the plan's decisions, and have the subagent sweep
    those too;
  - have every agent report each place its fix departs from a design line
    in the plan;
  - read "for you to decide" and "for a person looking at the screen" lines
    as a six-year-old would, re-briefing the defects (the same read caught
    the suite growing to 330 s);
  - decide each against the plan's own tests and write the call, with the
    alternative it beat, into the plan before the next brief, so that brief
    cites it instead of re-arguing it.

## Briefs

- **A committed common brief beats restating the rules in each prompt.**
  Bite 7's handling wrote the shared-tree, house-rule, pause and report
  conventions once to
  `docs/remove-before-merging/handle-bite7/brief-common.md`; each group's
  prompt was only its threads, its files, its off-limits list and the
  decisions already made, and six groups ran from it with no collision. The
  skill should write that file from a template at the start of every
  handling session, carrying from the start: commit and push after every
  step that passes, keep a hand-over note current, and "the container can
  restart without warning".
- **A brief's paths are checked with `ls` before it goes out.** Bite 8's
  common brief named the drawing under `docs/remove-before-merging/`; it had
  moved to `src/pages/mushrooms/reference/`, and every agent spent a search
  on it. The skill's template should fill paths from the tree.
- **A brief holds two or three threads.** Bite 6's perch brief held six,
  too many for one context; bite 10's twelve threads ran well on three
  agents at once.

## Waves over files

- **Group threads by the files they touch and run disjoint groups in
  parallel.** Each agent `git add`s only its own paths, waits out an
  `index.lock`, and merges rather than rebases on a rejected push; each
  brief names the other agents' files as off limits, and the plan file is
  the orchestrator's alone. A `flock` on one lock file around anything that
  builds or serves the site let three agents run play runs on one checkout.
  Bite 10's handling put three groups at once on named modules
  (`handle-bite10/groups.md`); no commit swept up another's edit, and the
  one cross-module edit came with a line naming it.
- **Stage the waves by dependency, and start each the moment its inputs
  free up.** Bite 5 ran two parallel groups (small threads; motion), then
  the perch threads that needed both, then one re-brief for what the perch
  round exposed, and posted replies in two batches, the first as soon as
  those fixes were final. Bite 7's mushroom group launched as soon as the
  ink group finished, while two others still ran, since only the ink files
  overlapped. The dependency is of the result, not only of the files: bite
  8's clump group ran after the shapes group because the clump's floors
  measure the drawn caps, and its flower group could run early only because
  its brief said to build every guard as a function of the layout, never a
  constant tuned to today's clump. The skill's wave planner should ask of
  each pair "does one measure what the other draws?" and brief the earlier
  one that way.
- **A migration does not parallelise.** Bite 9's flowers and placement
  agents each needed the other's uncommitted renames to type-check, so
  neither could test, and both paused with patches that only worked
  stacked. Two groups run at once only when each builds on the other's
  _committed_ API. A sibling's half-written module also fails `tsc` at the
  shared HEAD; agents that must build meanwhile do so from a clean
  `git worktree` at a known commit and commit their fixes in the main tree.
- **A refactor is cut into steps that each type-check, run one agent at a
  time.** All four of bite 9's parallel agents on the ground refactor
  reached 186–254k with three of them having nothing on origin; a nudge at
  165k did not help, because a half-migrated tree has nothing that passes
  to commit. Bite 9's rest then ran as three agents in sequence, each with a
  step list in dependency order (the old API kept as a shim until the last
  step), a first commit due within ~60k, a self-pause at ~170k, and the test
  file a later step rewrites named off limits until then. All three
  finished inside ~195k with 3–8 commits on origin each.
- **A test that can fail fails the run it lands in.** The play run's
  stricter turn watch landed before the flight fix and turned
  `pnpm play:mushrooms` red across two sessions. The handling order should
  land a watch and its fix in the same wave, or say in the pause note that
  red is expected.

## A subagent's context

- **A subagent cannot see its own context, so the orchestrator reads it
  off the transcript on a timer.** No budget notice reaches a subagent, and
  asked for its usage one answered 115k while its transcript held 220k.
  `jq -c 'select(.message.usage) | .message.usage | (.input_tokens + (.cache_read_input_tokens//0) + (.cache_creation_input_tokens//0))' <output_file> | tail -1`
  prints the last call's context without reading any content (or
  `tac | grep -m1` for the last `cache_read_input_tokens`). Agents reach
  ~230k in about twenty-five minutes, often before their first commit (four
  of bite 8's five), and bite 10's ended at 188–244k past the ~170k line
  their brief set. So the skill should arm a `send_later` check-in every
  ~15–30 minutes with each spawn, reading the usage and the branch's new
  commits, pause an agent from outside past ~200k, and start a fresh one on
  the same brief from its hand-over note — rather than trusting the agent
  to stop.

## Pauses, restarts and the Stop hook

- **A pause is a hand-over, and never a reset.** Bite 6's handling hit the
  operator's weekly quota mid-wave: a `SendMessage` asking each agent to
  commit what passes and write a pause note stopped them cleanly, and the
  next morning "continue" resumed each with its transcript intact — the
  container outlived the night, but nothing promises that, so the note is
  the part that counts. An agent whose work does not yet type-check commits
  it as a `git apply`-able `.patch` beside its note rather than as source,
  keeping the branch green. Bite 8's group L, paused at ~220k and blocked
  from resetting the tree, asked the orchestrator to do it; it was not
  needed, since a fresh agent continued from the dirty tree with the patch
  as backup. The pause instruction should say "leave the tree as it is and
  commit the patch beside it", never "reset".
- **A paused tree is dropped or kept only once proven equal to its
  patch.** The orchestrator compared `git diff` with the committed patch
  (the sorted `+` and `-` lines identical), then reverse-applied it
  (`git apply -R`) or committed the tree as source. A `reset --hard` was
  refused by the permission classifier, and the proof made it unnecessary.
- **A container restart takes the running agents and their
  notifications, not their pushed work.** Bite 8's handling lost the
  notifications of four agents that had all finished, commits on `origin`,
  transcripts in the session's `tasks/` directory; their reports came back
  with
  `jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="text") | .text' <output> | tail -c 5000`.
  Bite 10 lost live agents to two restarts: the group that had committed
  step by step survived whole, the one that had committed nothing was re-run
  from scratch, and after the first restart every brief pushed each passing
  step and the orchestrator wrote each report's decisions to a committed
  file (`bite10/half-a.md`) as it arrived, so the next death cost nothing. A
  restart kills the agent but not its `send_later` check-in, whose prompt
  should say to re-launch from the note when the agent is gone. On every
  restart notice the orchestrator reads `origin`'s log and the hand-over
  notes before re-dispatching anything, since a dead agent may have
  finished.
- **The Stop hook's git check fires on a subagent's work in progress.** A
  turn that ends while an agent works leaves its edits uncommitted in the
  orchestrator's tree. The answer is `git status`, a push of anything the
  main session owns, and a stop; committing the agent's half-done files
  would collide with its own commit. The skill should say so, so the hook
  does not read as an order.

## The tail

- **A bite's tail is subagent work, split where it fills an agent.** The
  tail is the last refactor, the plan fold and `/polish`, then vet, the
  five-screen play run, the frames, the Artifact build and `/pr`; bite 8's
  took two agents (the first ~225k), and past the 200k line the whole of it
  goes out at once. Frames plus the Artifact, and the review replies, touch
  nothing in common and run side by side. The orchestrator keeps the
  replies where it can, the Artifact publish (its tool is the
  orchestrator's) and the relay.
