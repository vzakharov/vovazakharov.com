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
- **A bite's spec is one agent per theme or package from the start, each
  writing its own file and ending with its collision list.** Bite 12b's one
  spec agent filled at 194k having only mapped the store, the rim and the
  opening-eye rules; two successors by theme (`spec-insects.md`; cost, lawn,
  light and the cut) each finished at ~185k. Bite 14 briefed one per package
  (shelter, sprouting), each writing calls, recommendations, its steps cut
  to one agent each and the files it shares with the other package; both
  finished in 9–12 minutes at ~186–190k, the orchestrator took nearly every
  recommendation into one `bite-14.md` (21 calls), and the collision lists
  made the build waves trivial to plan. Settling each call in the calls file
  before the next brief keeps every later brief a pointer. The skill briefs
  the map, each subsystem or package and the measured cost as separate spec
  agents, and asks each for its collision list with the others.
- **A migration step goes as additive-then-patch.** Bite 12b's step 0
  landed its converters as a green commit, then the switch as a `.patch`
  when its context ran out with the fixtures red; a second agent briefed
  "apply, fix the fixtures, never change an assertion" landed it at 149k
  after one nudge at 127k. A shape change that makes two type names equal
  trips `pnpm type-overlap`, and the agent stops on it as a naming call:
  the orchestrator settles it in one rename (`Footing`).
- **Parallel groups are followed by a fix round, and the fix round owns the
  final gates.** Bite 7's two groups each reported their own work right,
  and the orchestrator's frames still found three defects at the seams
  between them. Each group's gate report also showed the other's half-made
  state (`type-overlap` failing in A's files, `tsc` in B's test), clean once
  both landed. The skill should budget the round by default, briefed from
  the orchestrator's own frames.

## Handling a review

- **The review is fresh-eyed subagents in the bite's tail, not two
  sessions; a big bite gets three by area, told to post early.** By bite 12
  the branch had cost $904 over 47 sessions, about four per bite, the review
  and `/handle` sessions each paying ~100k of baseline and a relay toward
  the depth cap, while the reviews' catches (bite 3's dead taps, bite 4's
  hidden door, bite 7's lavender ring) came from fresh eyes on frames, and
  bite 12's from the operator's play and a play agent beside the build. The
  operator agreed to fold the review into the tail: reviewer agents briefed
  with the diff, the plan's decisions and the frames, nothing of the build.
  Bite 12's diff (162 files, ~16k lines) went to three by area from one
  committed `review-brief.md` — the reading list, "post before you are long
  into it", the marker line, never fix; two posted within five minutes at
  155–181k, three findings each. Each finding's call, with the alternative
  it beat, goes into one committed calls file before any fix brief: bite
  12b's nine threads ran from one (now
  `docs/plans/mushroom-game-syama/bite-12b/review.md`) as six parallel
  one-step agents on disjoint file lists. The skill keeps a review session
  only for a structural bite.
- **A play → trace → decide chain converges one class per agent.** The
  leg-timing reds went 88 → 43 → 0 → 4 → 2 over four agents (a fix, a
  play, a watch allowance, a trace), each report naming the next class
  with numbers; every call went into `leg-timing.md` before the next brief.
  A residue the size of the bound's own slack is accepted in writing, not
  traced.
- **The export's authorship label reads the loop's own review as
  answered.** Every loop review is an agent's, so bite 1's nine threads came
  out `@vzakharov (agent)`, which `/handle` treats as its own reply. The
  skill should mark a loop review with a marker line `/handle` reads as
  guidance whatever the label.
- **A review's fixes can be a bite of their own.** Bite 4's eight findings,
  three needing geometric sweeps, split across relays carried by a
  `handle-bite<n>/progress.md` holding the design decided and the
  measurements.
- **A review's design calls are decided on paper before the brief, and the
  proof can reopen them.** A choice written into the plan's decisions and
  committed first gives the agent a rule to build to, and the reply
  something to point at. Bite 9's "each screen at its own width" broke
  door-in-sight in most phone meadows; "one viewing angle" then starved a
  sideways phone's sky; the third call let the minimum size give way — each
  written with the numbers that forced it. So each agent is briefed to stop
  and report, options measured, at the first rule it cannot keep: on 12b's
  T139 both measured fixes broke a standing decision (the count changing by
  screen), which only the orchestrator could weigh, and the call went into
  `decisions.md` instead of code. A call made from a report's numbers can
  still miss the cause: 12b's gill band got "a chord floor of its own", the
  agent measured that no floor held the bound under full detail (the error
  sat in where angle samples fall), kept full detail and said so. Accepting
  a measured departure in the log beats re-briefing the call.
- **A report's trade-off lines are the orchestrator's to decide, not to
  forward or footnote.** Bite 5's exclusive perches landed to the letter,
  and the report said, as "for you to decide", that on a small phone 89% of
  visits now lost a butterfly, breaking "the meadow only gets fuller"; the
  perch group met every number by stretching a far flight (a fly crawling
  11 s into a phone). Bite 9's reports ended with trade-offs (the small
  phone filling to six in 69% of visits, the bees' floor in a full forest);
  bite 10's tufts agent capped tufts to the flowers left and so hid the
  full-meadow refusal the plan promised — a change only the orchestrator
  could weigh, since each group sees only its own files. The skill should:
  - brief every constraint-tightening fix with the invariants it must not
    break, named from the plan's decisions, and have the agent sweep those;
  - have every agent report each place it departs from a design line;
  - read "for you to decide" and "for a person looking at the screen" lines
    as a six-year-old would, re-briefing the defects (the same read caught
    the suite growing to 330 s);
  - decide each against the plan's tests and write the call, with the
    alternative it beat, into the plan before the next brief cites it.

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
- **A brief's numbers carry their unit, checked against the code.** The
  orchestrator wrote a dash cap as "≈6 world units"; the model reads
  places in butterfly sizes, and the agent found the mix-up, built the
  cap in the right unit and reported it (and that the cap should be per
  screen, a second call). A number taken from a hand-over note is the same
  risk: bite 12's dash bound came from `dash-cap.md`'s 60 sizes/s, a cap
  pace had since removed, and the play failed both dashing kinds on it.
  The orchestrator reads the function's units before it writes a number
  into a decision, and a bound goes into a brief as "derive it from
  `<file>`", not as a figure.
- **An agent lands one step, maybe two, whatever the brief lists; building
  a scene, looking at its frames, writing a play, running it and tracing a
  red are each an agent of their own.** Every round measured the same
  thing. Bite 6's perch brief held six threads, too many; bite 11's package
  agents reached 160–220k after two or three steps of five; bite 12's
  eleven build agents briefed with two or three steps reached ~170k in
  12–20 minutes having landed one; three of three "build, then play once"
  agents ran out after the unit tests; the `veer` play filled its writer
  (185k) before one browser run, where a second agent briefed "apply the
  patch, lint, commit, then run one screen" finished at 124k. Every bite-14
  scene agent briefed "build it, then look at frames" ran out before or
  during the look (S2 took none; P2b shot frames but could not see its spore
  dots), while its seven one-step build agents ran three waves in ~1 hour
  (S1 ∥ P1; P2 ∥ S2; P2b ∥ S3 ∥ S4), each finishing at 166–184k. Bite 17
  held it again: one-step A slices all landed, while B (four calls) and C
  (a fix plus two calls) each landed one or two and ran out; in its tail six
  one-step agents (types, a play, a cause, a probe, a perf cut, a split) all
  landed, while three of three briefed "build, then run the play and look"
  (the gait button, the risen eye, the far band) ran out before the look and
  were each finished by a successor from the note. Bite 12b's
  six one-step review agents landed five inside 5–35 minutes at 110–160k;
  the sixth (A2, a re-tend sliced through `Tending`) filled at 170k having
  only designed it, pushed the design as a `.patch` plus note, and its
  successor was briefed "the note is your design, build it". Agents that
  read four or five hand-over notes before starting filled fastest. So the
  skill briefs one step — one build step plus its tests — with a second
  only "if context allows", names the step that ends the brief, commits a
  written play before any build, gives the play and the look at a scene's
  frames each a second agent over the pushed build, and gives a red needing
  a trace its own agent. Each successor finished from the hand-over note in
  one go, so that note is the next brief's spine.

- **A brief names the size of every long run it asks for.** Bite 14's P3b
  was told to sweep all 2000 visits with and without showers; a full sweep
  takes about an hour against the 10-minute foreground cap, so it ran the
  sweep detached (`nohup … xargs -P 3`), against the house rule, and sat
  in short waits for an hour at a flat 135k — invisible to the usage
  check-in, which reads only tool calls. `--visits 200` (~9 min) answered
  R1. The skill's brief caps a sweep or play at what fits one foreground
  call, and names the full run as the orchestrator's, if anyone's.

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
  free up.** Bite 5 ran two parallel groups, then the perch threads that
  needed both, then one re-brief for what the perch round exposed, posting
  replies in two batches. Bite 7's mushroom group launched the moment the
  ink group finished, while two others still ran. The dependency is of the
  result, not only of the files: bite 8's clump group ran after the shapes
  group because the clump's floors measure the drawn caps, and its flower
  group could run early only because its brief said to build every guard
  as a function of the layout, never a constant tuned to today's clump. The
  wave planner asks of each pair "does one measure what the other draws?"
  and briefs the earlier one that way. **A wave is per package, not a
  barrier**: bite 15 launched W2 the moment W1 landed, while R2 still ran,
  and R3 on R2's report while W2 ran — the two scene agents shared
  `house-view.ts` by named functions and merged clean. Its orchestrator
  reached the 200k notice after two specs and five build reports, as bite
  14's had, so a two-package bite still relays after its second wave.
- **A migration does not parallelise, and a half-landed one blocks the
  whole tree.** Bite 9's flowers and placement agents each needed the
  other's uncommitted renames to type-check, and both paused with patches
  that only worked stacked: two groups run at once only when each builds on
  the other's _committed_ API. A step that breaks a shared type lands first
  and alone: bite 11's flowers step 2 sat uncommitted at 137k with the
  other agents' typechecks red on it, and a nudge did not bite; bite 12's
  P2c paused with its hills both as a patch and in the tree, red for P3b
  and P1c until the next agent, told first to "confirm the tree equals the
  patch, land it within ~50k", cleared it in one commit. When a pause
  leaves a patch in the tree, that package relaunches first.
- **A refactor is cut into steps that each type-check, run one agent at a
  time.** All four of bite 9's parallel agents on the ground refactor
  reached 186–254k with three of them having nothing on origin; a nudge at
  165k did not help, because a half-migrated tree has nothing that passes
  to commit. Bite 9's rest then ran as three agents in sequence, each with a
  step list in dependency order (the old API kept as a shim until the last
  step), a first commit due within ~60k, a self-pause at ~170k, and the test
  file a later step rewrites named off limits until then. All three
  finished inside ~195k with 3–8 commits on origin each.
- **Additive packages, then one switch-over, needs the switch pre-mapped.**
  Bite 12's insect-plane ran step 0, the veer, A, B and pace as additive
  packages (new paths beside the live ones, five agents in ~1 hour, each
  110–190k, never sharing a file), which kept every tree green; but the
  switch-over agent spent its whole 178k reading six hand-over notes and the
  view code and built nothing. The skill should give the switch a mapping
  agent first — call sites, the files outside the list that read the old
  shape (here a play probe), the design calls — and brief the build from
  that map alone, one step.
- **Each agent works in its own scratchpad worktree; the shared checkout
  is the orchestrator's.** Bite 12 ran five agents so with no collision:
  each pulled with `--no-rebase` before its push, the merges resolved
  themselves but for one import line in `flight.ts`, which the agent
  settled, and the Stop hook flagged only the orchestrator's own cost row.
  In a shared tree a sibling's half-written module fails `tsc` and can make
  the page throw on load, and `git stash`, `checkout -- <path>` and
  `restore` sweep up siblings' edits — bite 11's first flowers agent
  stashed for a test baseline, the pop conflicted, and the owners rewrote
  by hand — so where a tree is shared the common brief bans all three from
  the start. A production build fails in a worktree inside the repo
  (Turbopack symlinks, Google Fonts) and works from one in the scratchpad
  after `pnpm install --offline`, with no symlinked `node_modules`.
- **The play run goes beside the source work, not after it, once its
  probe builds from a commit.** Bite 12's rest ran a `scripts/`-only play
  agent alongside each `src/` wave, its probe built in its own worktree at
  HEAD: the walk frames found the far-hill flower before P4 was built on
  it, and the reports caught a game fault (a portrait phone's `+` refusing
  after one mushroom). One step per agent and a ~10-minute check-in held
  every agent under ~190k with commits on origin; six packages ran in ~1¾
  hours.
- **A helper two parallel packages need is the orchestrator's, landed
  before the wave.** Bite 12b's orchestrator wrote the snap (`anchor.ts`)
  in ~15k before launching four agents, and all four built on it. The
  anchoring of a whole layout it left to "whoever needs it first, the other
  reuses": I1 wrote `anchored-stand.ts`, S2 looked on origin before I1 had
  pushed, found nothing and wrote `anchoredGround`, and the branch carries
  two anchoring paths for the next wave to fold. "Reuse it if it's there"
  is a race; the skill names one owner, or lands the helper itself.
- **A one-step agent nudged at ~120–145k with nothing on origin lands a
  commit within ~25k.** Bite 12b's first waves ran R1+R2, R3, S1, S2, L1,
  L2, P1, I1 (85–166k, 7–33 minutes each), and the three nudged so all
  committed; bite 14's check-in, armed per wave, caught P2 at 144k with
  nothing pushed, and one nudge landed a commit within ~20k. The
  orchestrator's own context, not the agents', bounds the session
  ([pickup-and-relay.md](pickup-and-relay.md) § "The context budget"); a
  relay mid-wave would orphan the running agents, so the orchestrator waits
  the wave out and relays after it, and sizes a wave so its reports fit its
  own room left.
- **A test that can fail fails the run it lands in.** The play run's
  stricter turn watch landed before the flight fix and turned
  `pnpm play:mushrooms` red across two sessions. The handling order should
  land a watch and its fix in the same wave, or say in the pause note that
  red is expected.
- **A sibling's red goes to its owner while the owner still runs.** Bite
  12b's F ran the slow shared `fliers.test.ts`, found three reds, and traced
  them by reverting one file to B's commit while B still ran; the
  orchestrator forwarded them with `SendMessage`, and B settled them before
  reporting — one check had measured the very spacing B replaced, one was
  two-sample noise. The skill routes such a red to its owner at once, and
  the owner asks "is this test measuring what I replaced?" before loosening
  anything.
- **Lines of one shared file, granted by name and by net count, merge
  clean.** Bite 13 ran two or three agents at once on `meadow-scene.ts` and
  `rain-view.ts`, each brief naming the lines that were its own (the beds'
  `update` arguments; the drops' build-and-drive lines against the wetness
  getter and the rainbow's); four pulls auto-merged and the one textual
  conflict the agent settled keeping both sides. Bite 14's calls granted net
  lines on the three shared files near the 450 cap (`game.ts` +8,
  `mushroom-bed.ts` +8/+12, `meadow-scene.ts` +3); every agent stayed inside
  its grant and every merge was clean. The skill writes both grants into
  the calls for a file two packages touch, the count wherever it is near
  the cap.
- **Two parallel steps that both spell types collide in `type-overlap`
  at landing, not in their worktrees.** Bite 18's S1 (the kept record's
  types) and S3 (the walk's start) ran side by side on disjoint files; S3
  landed `WalkStart = WithGait & Eyed` first, and S1's `Kept` spelled the
  same combination, which the gate rejects. S1 settled it in a second
  commit by building on `WalkStart`. The spec had already flagged a
  second race (S2's schema in S1's types file), which the orchestrator
  avoided by running S2 after S1. The wave planner asks of each parallel
  pair "does either declare a type the other might also spell?" and
  sequences them, or names one owner of the shared base.
- **A pure package bite runs one-step agents at ~100–145k each, and a
  spec at ~190k.** Bite 18 (saving: one package, no look) ran a spec
  agent, then S1 ∥ S3 ∥ S6 (the play written first), S2, S4, plus a
  trace of an old play red, all landing inside 5–15 minutes, none
  running out; the orchestrator still crossed its 200k line before the
  scene wiring, because its baseline and the spec read cost ~110k before
  any build. A relayed orchestrator should expect a bite of six steps to
  take two sessions, and relay after the wave that holds the scene.
- **Own a type's builders, not only its files.** Bite 12b's I4 blocked
  because `Host` is built in `capTop` (mushroom bed) and `seat` (flower
  bed), each another package's file that wave. Handing the next I agent
  "only the host builders" in both beds while P edited the same flower bed's
  paint and follow merged with one conflicted import line. The skill should
  list, per package, the functions that build the types it changes, and
  grant those by name when they sit in a file someone else holds.

## A subagent's context

- **A subagent cannot see its own context: the hook tells it at 170k, and
  the orchestrator's timer is the backstop.** Asked for its usage, one
  answered 115k while its transcript held 220k; agents reach ~230k in about
  twenty-five minutes, often before their first commit (four of bite 8's
  five), and bite 10's ended at 188–244k past their brief's ~170k line. At
  the operator's ask («им нельзя говорить чтобы применяли ту же эвристику…
  вместо того чтобы проверять каждые эндцать минут?») the context-budget
  `PostToolUse` hook gives a subagent its own notice at 170k — commit what
  passes, bring the note current, report, leave the plan file alone
  (`.claude/context-budget/CLAUDE.md`) — reading
  `<transcript_path minus .jsonl>/subagents/agent-<agent_id>.jsonl`; on its
  first live run (bite 12, `insect-arrive`) the agent finished step 2 and
  reported at 184k with no nudge. The timer stays for an agent stuck in one
  long command, which makes no tool call to fire on: the skill arms a
  `send_later` check-in with each spawn or wave — ~10–12 minutes for a build
  or play agent, rarely needed for a reader (bite 11's finished at 124k in
  9 minutes) — that reads the branch's new commits and the usage off the
  transcript without reading any content:
  `jq -c 'select(.message.usage) | .message.usage | (.input_tokens + (.cache_read_input_tokens//0) + (.cache_creation_input_tokens//0))' <output_file> | tail -1`
  (or `tac | grep -m1` for the last `cache_read_input_tokens`). A nudge
  near 170k ("wrap up within ~25k, commit the frames") landed a commit or a
  patch every time; past ~200k the orchestrator pauses the agent from
  outside and starts a fresh one on the same brief from its hand-over note.
- **A package in code nobody has read this session costs one agent of
  reading before one of building.** Bite 12b's L package took four agents
  (three built a step each and read the rest); bite 16's map agent spent all
  170k reading and landed only a fact sheet — where the sun's azimuth lives,
  each painter's arguments, the seam to hang on — and its successor, briefed
  "read the note first, open only what it names, first commit within ~50k",
  landed all three steps. Bite 17's light package, briefed as eight calls
  over the backdrop, the bakes, the scene and the play, landed only its
  model at 183k, the rest a patch and a design. The skill should plan that pair: a reader that
  writes the fact sheet and the next step's design, then builders briefed
  "build it" with the sections to open and nothing wider.
- **A numeric bar in an orchestrator's call names what it protects.** The
  call "a bee's ring lands within half a tuft of today's" cost an agent its
  whole context proving no geometry met it, and the bar guarded nothing a
  child sees — a ring is laid fresh each visit. Before a call carries a
  tolerance, the skill should state the visible thing it keeps; one with no
  such thing is not written.
- **A fix brief holds one finding with a play run, or a few without.**
  Bite 14's two review-fix agents were each handed three findings, one of
  them a behaviour change with its play check; both hit 170k having landed
  the first and designed the rest, and two successors finished from the
  notes. A finding that changes behaviour and needs a play run (measure,
  build, test, play two screens, look) is a brief of its own; nits and
  wording batch together.

## Pauses, restarts and the Stop hook

- **A pause is a hand-over, and never a reset.** Bite 6's handling hit the
  weekly quota mid-wave: a `SendMessage` asking each agent to commit what
  passes and write a pause note stopped them cleanly, and "continue" the
  next morning resumed each with its transcript intact — nothing promises
  the container outlives the night, so the note is the part that counts.
  Work that does not yet type-check is committed as a `git apply`-able
  `.patch` beside the note, keeping the branch green. Bite 8's group L,
  paused at ~220k and blocked from resetting the tree, asked the
  orchestrator to; a fresh agent continued from the dirty tree with the
  patch as backup instead. The pause instruction says "leave the tree as it
  is and commit the patch beside it", never "reset".
- **A paused tree is dropped or kept only once proven equal to its
  patch**: `git diff` against the committed patch (the sorted `+` and `-`
  lines identical), then `git apply -R` or a commit of the tree as source.
  The permission classifier refused a `reset --hard`; the proof made it
  unnecessary.
- **A container restart takes the running agents and their
  notifications, not their pushed work.** Bite 8's handling lost the
  notifications of four finished agents, commits on `origin`, transcripts
  in the session's `tasks/` directory; their reports came back with
  `jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="text") | .text' <output> | tail -c 5000`.
  Bite 10 lost live agents to two restarts: the group that had committed
  step by step survived whole, the one that had committed nothing was re-run
  from scratch; from then every brief pushed each passing step and the
  orchestrator wrote each report's decisions to a committed file
  (`bite10/half-a.md`) as it arrived. A restart spares the agent's
  `send_later` check-in, whose prompt says to re-launch from the note when
  the agent is gone. On every restart notice the orchestrator reads
  `origin`'s log and the hand-over notes before re-dispatching anything,
  since a dead agent may have finished.
- **The Stop hook's git check fires on a subagent's work in progress.** A
  turn that ends while an agent works leaves its edits uncommitted in the
  orchestrator's tree. The answer is `git status`, a push of anything the
  main session owns, and a stop; committing the agent's half-done files
  would collide with its own commit. The skill should say so, so the hook
  does not read as an order.
- **A usage limit or a restart kills subagents mid-edit, and
  `SendMessage` revives them whole.** At bite 12's depth 6 the weekly limit
  stopped both running agents with edits uncommitted in their worktrees;
  once the operator raised the quota, a `SendMessage` to each agent id,
  saying where it stopped and that its worktree was intact, resumed it from
  its own transcript and both finished. At 12b's tail a restart stopped one
  with its fix uncommitted, and a `SendMessage` naming the worktree and its
  dirty files had it write its note and patch at once. So the orchestrator
  keeps each agent's id until its report lands, lists `git worktree list`
  and each tree's `status` before deciding anything, and never removes a
  dead agent's worktree before trying to resume it.
- **A wrap-up and its cancel can cross**: the agent had already stopped.
  Settle with the operator before stopping an agent, not after.

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
  source. Bite 12's fly-catch red after pace, briefed this way, ran the
  baseline, found the measure sound and the guessed cause backwards
  (darting only on long legs made it worse), and was fixed by lowering two
  cruises the plan called "set by play". A guess in a report is a
  hypothesis for the next brief, not its instruction.
- **A fix that holds in tests but not in play is a cause one layer out.**
  The looking-back release passed its unit tests twice and stayed invisible
  in play; the third round traced it to insects flying in the opening
  eye's layout, which the lens and walking had made wrong. Brief a play
  check with every fix to what the child sees, and on a second miss send a
  research agent for the layer below rather than a third fix.
- **A container restart kills a background agent and its uncommitted
  work, and nothing reports it.** Bite 16's first `/dry` agent died with
  five files edited in its worktree and no commit; the session only woke
  on the operator's «что это всё остановилось?». The worktree survived:
  `git -C <wt> add -A && commit && push` rescued it as a `wip` commit, and
  a successor briefed to review that commit first finished in ~115k. The
  skill should, on any resume, list `git worktree list` and remote `wt/*`
  refs before anything else, and the brief should push a `wip` commit
  every few files, not only at a passing step.
- **The operator's play turns the tail into a package wave, and calls
  recorded first survive the relay.** Four asks came mid-tail (the door's
  search order, the map's bare paper, a garish close cross, windows that
  never opened); each went into `bite-<n>.md` as a numbered call quoting
  the operator before its agent launched, and two agents on disjoint files
  ran at once. One of them ran out at 170k on three calls; its successor
  finished from the note. Size a package at about two calls with a play
  run, not three.
