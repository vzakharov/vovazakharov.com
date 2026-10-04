# Subagents and parallel work

## The session is an orchestrator

- **Every session in the loop is an orchestrator from its first turn, `/go`
  as much as `/handle`.** Bite 3 reached the budget notice with the scene
  unwired and handed the rest to subagents; from bite 4 the main session
  wrote `## This bite` with every open call decided, then briefed the model
  with its tests, the scene with its frames and play steps, and the tail in
  sequence, staying near 160k, ~70k and ~40k (bites 4–6) while the agents
  spent ~600k. A model/scene split works because the model agent's report
  is a ready API brief for the scene agent. The main session keeps what a
  subagent cannot do well: settling the calls before any brief, looking at
  frames beside the drawing
  ([play-run-and-frames.md](play-run-and-frames.md)), and folding the bite
  into the plan.
- **The scene agent may change the model for an invariant the frames
  expose**, and lists each change in its report so the plan absorbs it
  (bite 6: a bee never settling back on the flower it leaves).
- **A look bite opens with a research agent that writes a spec, not code.**
  Bite 7's ("atmosphere") fetched reference stills into `tmp/refs/`, read
  the painting code and Phaser's source for what is cheap (gradients and
  filters turned out WebGL-only, a render pass a frame), and wrote items
  each naming what the references do, the change in the code's terms, a
  checkable property and a cost, split by files into two groups behind a
  small step 0 (the shared table split, a pure light module). The
  orchestrator settled the open calls, ran step 0 alone, then the groups in
  parallel, their file lists disjoint down to "the scene is B's; A comes
  through `paintBackdrop`'s layer contract". The skill makes "research →
  spec → step 0 → parallel groups by file" the shape of any bite whose
  subject is the look rather than behaviour.
- **A bite's spec is one agent per theme or package from the start, each
  writing its own file and ending with its collision list; a spec agent
  costs ~190k.** Bite 12b's single spec agent filled at 194k having mapped
  only the store, the rim and the opening-eye rules; two successors by
  theme each finished at ~185k. Bite 14's two package specs (shelter,
  sprouting) each wrote calls, recommendations, steps cut to one agent each
  and the files shared with the other, finished in 9–12 minutes at
  ~186–190k, and folded into one `bite-14.md` (21 calls) whose collision
  lists made the waves trivial to plan. Settling each call in the calls
  file before the next brief keeps every later brief a pointer. The skill
  briefs the map, each subsystem or package and the measured cost as
  separate spec agents.
- **A pure package bite still takes two orchestrator sessions at six
  steps.** Bite 18 (saving: one package, no look) ran a spec, then
  S1 ∥ S3 ∥ S6 (the play written first), S2, S4 and a trace of an old play
  red, each one-step agent landing in 5–15 minutes at ~100–145k; the
  orchestrator still crossed 200k before the scene wiring, its baseline and
  the spec read costing ~110k before any build. Relay after the wave that
  holds the scene.
- **Parallel groups are followed by a fix round, and the fix round owns the
  final gates.** Bite 7's two groups each reported their own work right,
  and the orchestrator's frames still found three defects at the seams;
  each group's gate report showed the other's half-made state, clean once
  both landed. Budget the round by default, briefed from the
  orchestrator's own frames.

## Handling a review

- **The review is fresh-eyed subagents in the bite's tail, not two
  sessions; a big bite gets three by area, told to post early.** By bite 12
  the branch had cost $904 over 47 sessions, the review and `/handle`
  sessions each paying ~100k of baseline and a relay toward the depth cap,
  while the catches (bite 3's dead taps, bite 4's hidden door, bite 7's
  lavender ring) came from fresh eyes on frames. The operator agreed to
  fold the review into the tail: reviewers briefed with the diff, the
  plan's decisions and the frames, nothing of the build. Bite 12's diff
  (162 files, ~16k lines) went to three by area from one committed
  `review-brief.md` — the reading list, "post before you are long into
  it", the marker line, never fix; two posted within five minutes at
  155–181k. Each finding's call, with the alternative it beat, goes into
  one committed calls file before any fix brief: bite 12b's nine threads
  ran from one (`docs/plans/mushroom-game-syama/bite-12b/review.md`) as six
  parallel one-step agents on disjoint files. A review session stays only
  for a structural bite.
- **The export's authorship label reads the loop's own review as
  answered.** Every loop review is an agent's, so bite 1's threads came out
  `@vzakharov (agent)`, which `/handle` treats as its own reply. Mark a
  loop review with a marker line `/handle` reads as guidance whatever the
  label.
- **A review's fixes can be a bite of their own.** Bite 4's eight findings,
  three needing geometric sweeps, split across relays carried by a
  `handle-bite<n>/progress.md` holding the design decided and the
  measurements.
- **A play → trace → decide chain converges one class per agent.** The
  leg-timing reds went 88 → 43 → 0 → 4 → 2 over four agents (a fix, a
  play, a watch allowance, a trace), each report naming the next class
  with numbers, every call written into `leg-timing.md` before the next
  brief. A residue the size of the bound's own slack is accepted in
  writing, not traced.
- **A review's design calls are decided on paper before the brief, and the
  proof can reopen them.** A choice committed into the plan's decisions
  first gives the agent a rule to build to and the reply something to
  point at. Bite 9's "each screen at its own width" broke door-in-sight in
  most phone meadows, "one viewing angle" starved a sideways phone's sky,
  and the third call let the minimum size give way — each written with the
  numbers that forced it. So each agent stops and reports, options
  measured, at the first rule it cannot keep: on 12b's T139 both measured
  fixes broke a standing decision, which only the orchestrator could
  weigh, and the call went into `decisions.md` instead of code. A call made
  from a report's numbers can still miss the cause: 12b's gill band got "a
  chord floor of its own", the agent measured that no floor held the bound
  (the error sat in where angle samples fall), kept full detail and said
  so. Accepting a measured departure in the log beats re-briefing.
- **A report's trade-off lines are the orchestrator's to decide, not to
  forward or footnote.** Bite 5's report said, as "for you to decide", that
  on a small phone 89% of visits now lost a butterfly, breaking "the meadow
  only gets fuller", and met every number by stretching a fly's crawl to
  11 s; bite 10's tufts agent capped tufts to the flowers left and so hid
  the full-meadow refusal the plan promised — calls only the orchestrator
  can weigh, since each group sees only its own files. The skill should:
  - brief every constraint-tightening fix with the invariants it must not
    break, named from the plan's decisions, and have the agent sweep those;
  - have every agent report each place it departs from a design line;
  - read "for you to decide" and "for a person looking at the screen" lines
    as a six-year-old would, re-briefing the defects (the same read caught
    the suite growing to 330 s);
  - decide each against the plan's tests and write the call, with the
    alternative it beat, into the plan before the next brief cites it.
- **A numeric bar in an orchestrator's call names what it protects.** "A
  bee's ring lands within half a tuft of today's" cost an agent its whole
  context proving no geometry met it, and guarded nothing a child sees — a
  ring is laid fresh each visit. A tolerance with no visible thing to keep
  is not written.

## Briefs

- **A committed common brief beats restating the rules in each prompt.**
  Bite 7's handling wrote the shared-tree, house-rule, pause and report
  conventions once to
  `docs/remove-before-merging/handle-bite7/brief-common.md`; each prompt
  was only its threads, files, off-limits list and the decisions made, and
  six groups ran from it with no collision. The skill writes that file from
  a template at the start of every handling session, carrying: commit and
  push after every step that passes, keep a hand-over note current, and
  "the container can restart without warning".
- **A brief's paths are checked with `ls` before it goes out.** Bite 8's
  named a drawing that had moved to `src/pages/mushrooms/reference/`, and
  every agent spent a search on it. The template fills paths from the tree.
- **A brief's numbers carry their unit, checked against the code.** A dash
  cap written as "≈6 world units" met a model that reads places in
  butterfly sizes; the agent caught it and reported that the cap should be
  per screen. A number from a hand-over note is the same risk: bite 12's
  dash bound came from `dash-cap.md`'s 60 sizes/s, a cap pace had since
  removed, and the play failed both dashing kinds on it. The orchestrator
  reads the function's units before writing a number into a decision, and
  a bound goes into a brief as "derive it from `<file>`", not as a figure.
- **An agent lands one step, maybe two, whatever the brief lists; building
  a scene, looking at its frames, writing a play, running it and tracing a
  red are each an agent of their own.** Every round measured it: bite 6's
  six-thread perch brief was too many; bite 11's package agents reached
  160–220k after two or three steps of five; bite 12's eleven build agents
  briefed with two or three steps reached ~170k having landed one; the
  `veer` play filled its writer (185k) before one browser run, where an
  agent briefed "apply the patch, lint, commit, then run one screen"
  finished at 124k. Every agent briefed "build, then play or look" ran out
  before the look — three of three in bite 12, bite 14's S2 and P2b, bite
  17's gait button, risen eye and far band — while one-step agents landed:
  bite 14's seven in three waves in ~1 hour (S1 ∥ P1; P2 ∥ S2;
  P2b ∥ S3 ∥ S4) at 166–184k, bite 17's A slices and six tail agents
  (types, a play, a cause, a probe, a perf cut, a split), where its B (four
  calls) and C (a fix plus two) landed one or two each. Bite 12b's sixth
  review agent filled at 170k having only designed a re-tend, pushed the
  design as a `.patch` plus note, and its successor was briefed "the note
  is your design, build it". Agents that read four or five hand-over notes
  first filled fastest. So the skill briefs one build step plus its tests,
  a second only "if context allows", names the step that ends the brief,
  commits a written play before any build, gives the play and the look at
  a scene's frames each their own agent over the pushed build, and gives a
  red needing a trace its own agent. Every successor finished from the
  hand-over note in one go, so that note is the next brief's spine.
- **A fix brief holds one finding with a play run, or a few without.**
  Bite 14's two review-fix agents, each handed three findings with one
  behaviour change among them, hit 170k having landed the first; their
  successors finished from the notes. A behaviour fix that needs a play
  run is a brief of its own; nits and wording batch together.
- **A package in code nobody has read this session costs one agent of
  reading before one of building.** Bite 12b's L package took four agents;
  bite 16's map agent spent all 170k reading and landed a fact sheet —
  where the sun's azimuth lives, each painter's arguments, the seam to hang
  on — and its successor, briefed "read the note first, open only what it
  names, first commit within ~50k", landed all three steps. Bite 17's light
  package, briefed as eight calls, landed only its model at 183k. Plan the
  pair: a reader that writes the fact sheet and the next step's design,
  then builders briefed "build it" with the sections to open.
- **A brief names the size of every long run it asks for.** Bite 14's P3b,
  told to sweep all 2000 visits with and without showers (~1 hour against
  the 10-minute foreground cap), ran it detached (`nohup … xargs -P 3`)
  against the house rule and sat in short waits at a flat 135k, invisible
  to the usage check-in, which reads only tool calls; `--visits 200`
  (~9 min) answered R1. A brief caps a sweep or play at one foreground
  call, and names the full run as the orchestrator's, if anyone's.

## Waves over files

- **Group threads by the files they touch and run disjoint groups in
  parallel.** Each agent `git add`s only its own paths, waits out an
  `index.lock`, and merges rather than rebases on a rejected push; each
  brief names the others' files as off limits, and the plan file is the
  orchestrator's alone. A `flock` around anything that builds or serves the
  site let three agents play on one checkout. Bite 10's three groups on
  named modules (`handle-bite10/groups.md`) never swept up another's edit.
- **Each agent works in its own scratchpad worktree; the shared checkout
  is the orchestrator's.** Bite 12's five agents so pulled with
  `--no-rebase` before each push, and the merges resolved themselves but
  for one import line. In a shared tree a sibling's half-written module
  fails `tsc` and can make the page throw, and `git stash`,
  `checkout -- <path>` and `restore` sweep up siblings' edits (bite 11's
  stash for a test baseline conflicted on pop, and the owners rewrote by
  hand), so a shared-tree brief bans all three. A production build fails in
  a worktree inside the repo (Turbopack symlinks, Google Fonts) and works
  in the scratchpad after `pnpm install --offline`, with no symlinked
  `node_modules`.
- **Stage the waves by dependency of the result, and start each the moment
  its inputs free up.** Bite 8's clump group ran after the shapes group
  because the clump's floors measure the drawn caps; its flower group ran
  early only because its brief built every guard as a function of the
  layout, never a constant tuned to today's clump. The planner asks of each
  pair "does one measure what the other draws?". **A wave is per package,
  not a barrier**: bite 15 launched W2 the moment W1 landed while R2 ran,
  and R3 on R2's report while W2 ran, the two scene agents sharing
  `house-view.ts` by named functions. Its orchestrator still reached 200k
  after two specs and five build reports, as bite 14's had, so a
  two-package bite relays after its second wave.
- **Two parallel steps that both spell types collide in `type-overlap` at
  landing, not in their worktrees.** Bite 18's S3 landed
  `WalkStart = WithGait & Eyed` first, S1's `Kept` spelled the same
  combination, and S1 settled it by building on `WalkStart`; the spec's
  flagged race (S2's schema in S1's types file) was avoided by sequencing.
  The planner asks of each pair "does either declare a type the other might
  also spell?" and sequences them, or names one owner of the shared base.
- **Own a type's builders, not only its files.** Bite 12b's I4 blocked
  because `Host` is built in `capTop` and `seat`, each in another package's
  file; granting the next I agent "only the host builders" in both beds
  merged with one conflicted import line. List per package the functions
  that build the types it changes, and grant those by name.
- **Lines of one shared file, granted by name and by net count, merge
  clean.** Bite 13's agents on `meadow-scene.ts` and `rain-view.ts` each had
  their lines named (the beds' `update` arguments; the drops' lines against
  the wetness and rainbow getters); four pulls auto-merged and the one
  conflict kept both sides. Bite 14 granted net lines on three files near
  the 450 cap (`game.ts` +8, `mushroom-bed.ts` +8/+12, `meadow-scene.ts`
  +3), and every agent stayed inside. Write both grants into the calls.
- **A helper two parallel packages need is the orchestrator's, landed
  before the wave.** Bite 12b's orchestrator wrote `anchor.ts` in ~15k and
  all four agents built on it; the layout anchoring it left to "whoever
  needs it first, the other reuses" raced (S2 looked before I1 pushed), and
  the branch carries `anchored-stand.ts` and `anchoredGround`. Name one
  owner, or land the helper first.
- **A migration does not parallelise, and a half-landed one blocks the
  whole tree.** Bite 9's flowers and placement agents each needed the
  other's uncommitted renames and paused with patches that only worked
  stacked: two groups run at once only on each other's _committed_ API. A
  step that breaks a shared type lands first and alone: bite 11's flowers
  step 2 sat uncommitted at 137k with every other typecheck red on it; bite
  12's P2c paused with its hills both as a patch and in the tree, until the
  next agent, told first to "confirm the tree equals the patch, land it
  within ~50k", cleared it in one commit. A package whose pause left a
  patch in the tree relaunches first.
- **A refactor is cut into steps that each type-check, run one agent at a
  time.** Bite 9's four parallel ground-refactor agents reached 186–254k,
  three with nothing on origin, since a half-migrated tree has nothing that
  passes to commit. Its rest ran as three agents in sequence, each with a
  step list in dependency order (the old API kept as a shim to the last
  step), a first commit due within ~60k, a self-pause at ~170k and the
  test file a later step rewrites off limits; all finished inside ~195k
  with 3–8 commits each.
- **A migration step goes as additive-then-patch.** Bite 12b's step 0
  landed its converters as a green commit, then the switch as a `.patch`
  with the fixtures red; an agent briefed "apply, fix the fixtures, never
  change an assertion" landed it at 149k. A shape change that makes two
  type names equal trips `pnpm type-overlap`, and the agent stops on it as
  a naming call the orchestrator settles in one rename (`Footing`).
- **Additive packages, then one switch-over, needs the switch pre-mapped.**
  Bite 12's insect-plane ran five additive packages (new paths beside the
  live ones, 110–190k each, never sharing a file), keeping every tree
  green; the switch-over agent spent its whole 178k reading six notes and
  the view code and built nothing. Give the switch a mapping agent first —
  call sites, the files outside the list that read the old shape (here a
  play probe), the design calls — and brief the build from that map, one
  step.
- **The play run goes beside the source work, not after it, once its probe
  builds from a commit.** Bite 12's rest ran a `scripts/`-only play agent
  alongside each `src/` wave, its probe built in its own worktree at HEAD:
  the walk frames found the far-hill flower before P4 was built on it, and
  caught a portrait phone's `+` refusing after one mushroom. Six packages
  ran in ~1¾ hours, every agent under ~190k.
- **A test that can fail fails the run it lands in.** The play's stricter
  turn watch landed before the flight fix and turned
  `pnpm play:mushrooms` red across two sessions. Land a watch and its fix
  in one wave, or say in the pause note that red is expected.
- **A sibling's red goes to its owner while the owner still runs.** Bite
  12b's F found three reds in the shared `fliers.test.ts` and traced them
  to B's commit while B ran; forwarded with `SendMessage`, B settled them
  before reporting — one check had measured the very spacing B replaced,
  one was two-sample noise. The owner asks "is this test measuring what I
  replaced?" before loosening anything.

## A subagent's context

- **A subagent cannot see its own context: the hook tells it at 170k, and
  the orchestrator's timer is the backstop.** Asked for its usage, one
  answered 115k while its transcript held 220k; agents reach ~230k in about
  twenty-five minutes, often before a first commit. At the operator's ask
  («им нельзя говорить чтобы применяли ту же эвристику… вместо того чтобы
  проверять каждые эндцать минут?») the context-budget `PostToolUse` hook
  gives a subagent its own notice at 170k — commit what passes, bring the
  note current, report, leave the plan file alone
  (`.claude/context-budget/CLAUDE.md`) — reading
  `<transcript_path minus .jsonl>/subagents/agent-<agent_id>.jsonl`; on its
  first live run the agent reported at 184k with no nudge. The timer stays
  for an agent stuck in one long command, which fires no tool call: arm a
  `send_later` check-in with each spawn or wave — ~10–12 minutes for a
  build or play agent, rarely needed for a reader — that reads the
  branch's new commits and the usage off the transcript without reading
  content:
  `jq -c 'select(.message.usage) | .message.usage | (.input_tokens + (.cache_read_input_tokens//0) + (.cache_creation_input_tokens//0))' <output_file> | tail -1`
  (or `tac | grep -m1` for the last `cache_read_input_tokens`).
- **A one-step agent nudged at ~120–145k with nothing on origin lands a
  commit within ~25k**, and a nudge near 170k ("wrap up within ~25k, commit
  the frames") lands a commit or a patch every time (bites 12b, 14); past
  ~200k the orchestrator pauses the agent from outside and starts a fresh
  one on the same brief from its note. The orchestrator's own context
  bounds the session ([pickup-and-relay.md](pickup-and-relay.md) § "The
  context budget"): a relay mid-wave would orphan the running agents, so it
  waits the wave out, relays after it, and sizes a wave so its reports fit
  its own room left.

## Pauses, restarts and the Stop hook

- **A pause is a hand-over, and never a reset.** Bite 6 hit the weekly
  quota mid-wave: a `SendMessage` asking each agent to commit what passes
  and write a pause note stopped them cleanly, and "continue" resumed each
  next morning — but nothing promises the container outlives the night, so
  the note is the part that counts. Work that does not type-check is
  committed as a `git apply`-able `.patch` beside the note. Bite 8's group
  L, paused at ~220k, asked the orchestrator to reset the tree; a fresh
  agent continued from the dirty tree with the patch as backup instead. The
  pause instruction says "leave the tree as it is and commit the patch
  beside it", never "reset". A wrap-up and its cancel can cross — the agent
  had already stopped — so settle with the operator before stopping one.
- **A paused tree is dropped or kept only once proven equal to its
  patch**: `git diff` against the committed patch (the sorted `+` and `-`
  lines identical), then `git apply -R` or a commit of the tree as source.
  The permission classifier refused a `reset --hard`; the proof made it
  unnecessary.
- **A container restart or a usage limit kills running agents and their
  notifications, not their pushed work or their worktrees, and nothing
  reports it.** Bite 8 lost four finished agents' notifications, their
  commits on `origin` and transcripts in the session's `tasks/` directory;
  the reports came back with
  `jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="text") | .text' <output> | tail -c 5000`.
  Bite 10's two restarts spared the group that had committed step by step
  and cost the one that had committed nothing a re-run, so from then every
  brief pushed each passing step and the orchestrator wrote each report's
  decisions to a committed file (`bite10/half-a.md`) as it arrived. Bite
  16's `/dry` agent died with five files edited and no commit, and the
  session woke only on the operator's «что это всё остановилось?»; the
  worktree survived, `git -C <wt> add -A && commit && push` rescued it as a
  `wip` commit, and a successor reviewing that commit first finished in
  ~115k. A dead agent revives whole: at bite 12's depth 6 the weekly limit
  stopped two agents mid-edit, and once the quota was raised a
  `SendMessage` to each id, saying where it stopped and that its worktree
  was intact, resumed both from their transcripts; at 12b's tail a
  `SendMessage` naming a restarted agent's worktree and dirty files had it
  write its note and patch at once. So:
  - every brief pushes each passing step, and a `wip` commit every few
    files;
  - the orchestrator keeps each agent's id until its report lands;
  - on any restart or resume it reads `origin`'s log, remote `wt/*` refs,
    the hand-over notes, `git worktree list` and each tree's `status`
    before re-dispatching anything, since a dead agent may have finished;
  - it never removes a dead agent's worktree before trying to resume it;
  - the `send_later` check-in survives a restart, and its prompt says to
    re-launch from the note when the agent is gone.
- **The Stop hook's git check fires on a subagent's work in progress.** A
  turn that ends while an agent works leaves its edits uncommitted in the
  orchestrator's tree. The answer is `git status`, a push of anything the
  main session owns, and a stop; committing the agent's half-done files
  would collide with its own commit. The skill says so, so the hook does
  not read as an order.

## The tail

- **A bite's tail is subagent work, split where it fills an agent.** The
  tail is the last refactor, the plan fold and `/polish`, then vet, the
  five-screen play run, the frames, the Artifact build and `/pr`; bite 8's
  took two agents (the first ~225k), and past the 200k line the whole of it
  goes out at once. Frames plus the Artifact, and the review replies, touch
  nothing in common and run side by side. The orchestrator keeps the
  replies where it can, the Artifact publish (its tool is the
  orchestrator's) and the relay.
- **A fix round first tests the measure against its rule, at the commit
  before, and only then tunes the code.** Bite 11's room fix found both
  reds were proxies — a fingertip disc too round for flat caps while every
  tap landed, a wash kept off feet it is drawn beneath — and changed no
  source. Bite 12's fly-catch red, briefed this way, found the measure
  sound and the guessed cause backwards (darting only on long legs made it
  worse), and was fixed by lowering two cruises the plan called "set by
  play". A guess in a report is a hypothesis for the next brief, not its
  instruction.
- **A fix that holds in tests but not in play is a cause one layer out.**
  The looking-back release passed its unit tests twice and stayed invisible
  in play; the third round traced it to insects flying in the opening eye's
  layout, which the lens and walking had made wrong. Brief a play check
  with every fix to what the child sees, and on a second miss send a
  research agent for the layer below rather than a third fix.
- **The operator's play turns the tail into a package wave, and calls
  recorded first survive the relay.** Four asks came mid-tail (the door's
  search order, the map's bare paper, a garish close cross, windows that
  never opened); each went into `bite-<n>.md` as a numbered call quoting
  the operator before its agent launched, and two agents on disjoint files
  ran at once. One ran out at 170k on three calls and its successor
  finished from the note: size a package at about two calls with a play
  run, not three.
