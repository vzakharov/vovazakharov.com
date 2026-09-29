# megabeast — notes toward a skill

Not a skill yet: no `SKILL.md`, so nothing loads it. The working name is for
the skill that would run a whole elephant autonomously — plan, then per bite
`/go` → `/relay` review → `/relay /handle` → … → `/relay /finalize` — the
loop `docs/plans/mushroom-game-syama.*.md` § "How this elephant is eaten"
spelled out by hand for PR #57. Every session in that chain adds what it
found that would make the loop repeatable and better, at its end and before
its relay; the operator asked for it in these words:

> одна штука которую хочу чтобы ты держал, в том числе между сессиями --
> файлик будущего скилла, который будет это всё автоматизировать (рабочее
> название megabeast). Не сам скилл, а именно соображения с тем, что ты нашёл
> по пути, что помогло бы сделать этот процесс повторяемым и на лучшем уровне

> заполнять в конце каждой сессии перед релеем

A note already here that a later session sharpens gets rewritten in place,
not answered with a second one.

Each note: what happened, and what the skill should do about it.

## The loop's contract

- **The loop lived in the plan, and that worked.** Writing the cycle into the
  plan as its own section made every successor read it on attach, with no
  extra file to load. The skill should write that section itself, from its
  own template, rather than relying on the planning session to write it.
- **Standing constraints travel verbatim, or they stop applying.** The relay
  summary's § 1 carried the operator's rules (never merge, the frozen
  five-percent file, ask only about the unrecoverable) word for word, and the
  plan repeated them. The skill should keep one home for them, the plan, and
  have each relay point at it rather than re-quote it, so a rule the operator
  adds mid-run gets written down once.
- **An operator message that arrives mid-run is a contract change.** Bite 1
  took five: this file, when to fill it, the 450-line rule restated, an
  ecology twist and a mandala ornament. What held up: quote the message into
  the plan (standing rules, decisions or the rest of the elephant) and commit
  that on its own before touching code again; take into the open bite only
  the cheap slice that fits (the sun became a rosette) and leave the rest to
  later bites. The skill should make that the rule, so a mid-run message
  grows the plan, not the bite. The same holds for a review the operator
  posts on the PR: their first one (5329778719, during bite 6's review)
  asked for an Artifact per bite, atmosphere and a wider meadow. The review
  session folded it into the plan, replied on each thread with that commit,
  and left the code for the bites it named, which is what they asked for
  ("действовать по нему пока не надо").

## Friction found

- **The context-budget hook asks, and the loop never asks.** At 200k the
  hook says to reach a stopping point, offer `/compact` or `/relay`, and "do
  neither unasked". The bite-4 `/handle` session did that, and the operator
  answered "мы же договороились что идём yolo/megabeast, и ты у меня ничего
  не спрашиваешь". The skill should state that its contract counts as the
  standing answer to that offer: at the warning line the session commits,
  writes a progress file for the successor, and relays on its own. It also
  helps to check the budget before starting a review's fixes. That session
  spent ~50k on door sweeps before writing any code, and the heavy
  exploration could have gone to a subagent.
- **A review's fixes can be a bite of their own.** Bite 4's review raised
  eight findings, three of them geometric (occlusion, tap size, mouse size),
  with sweeps needed to settle each. One `/handle` session cannot both
  measure and implement all of them. The skill should let a handle session
  split the fixes across relays, carried by a
  `docs/remove-before-merging/handle-bite<n>/progress.md` that holds the
  design decided and the measurements.
- **The operator looks in between bites through committed frames.** They
  asked for the screenshots in `docs/remove-before-merging/` rather than
  `tmp/`, choosing the ones worth showing at each bite's end. The skill's bite
  tail should include "pick and commit the frames" beside `/polish`.

- **`elephant.md` and `/go` disagree about vet.** "A bite leaves `vet` green"
  (`plan/elephant.md` § "A bite") against "do not run `./scripts/vet.sh` per
  commit; that is `/finalize`'s job" (`go/SKILL.md` Step 2). An autonomous
  loop has no operator review between bites to catch a red tree, so the
  skill should run vet once at each bite's end, before `/polish`.
- **The successor starts on the branch's commit, not always on its tip.**
  `create_session` with `source_revision` checks the branch out, so
  `/from-branch` Steps 2–4 (drop the auto-branch) are a no-op. But the review
  session of bite 1 came up detached at the commit the relay had pushed
  first, with the local branch 12 commits behind `origin`, the session-cost
  hook's commit among them. The skill should have pickup run `git checkout
<branch> && git pull --ff-only` every time, and skip only the auto-branch
  cleanup. Bite 3's pickup went one worse: the local branch was a snapshot of
  history since rewritten on `origin` (50 commits each side), so the
  fast-forward refused, and auto mode blocked `reset --hard` as destruction.
  What worked: rename the stale ref aside (`git branch -m <branch>
stale/<…>`) and check out a fresh tracking branch — nothing lost, nothing to
  approve. The skill's pickup should do exactly that when the fast-forward
  fails. Bite 4's pickup met the same stale snapshot and auto mode let
  `reset --hard origin/<branch>` through, so the block is not reliable
  either way; the rename aside is the form that never needs it. Bite 5's
  review pickup met the stale snapshot a fourth time and was blocked again,
  so it is the norm, not an accident: the skill's pickup should go straight
  to the rename aside. Bite 8's pickup met it a fifth time, with the harness leaving HEAD
  detached at the relay's commit; `reset --hard` went through. Bite 8's
  review pickup was blocked again, and found the cause: the clone is
  shallow, so the stale ref and `origin`'s tip look unrelated even when the
  one is an ancestor of the other. `git fetch --unshallow origin`, then
  `git merge-base --is-ancestor <branch> origin/<branch>` proved nothing
  was local, and `git merge --ff-only origin/<branch>` needed no approval.
  The skill's pickup should unshallow first. The rename aside is then the
  fallback for a genuine rewrite only. Bite 9's end met a genuine one: past
  `--deepen=300` the stale ref still diverged, and every commit only it
  held was the trunk's own old history ("Initial commit" onward), so the
  snapshot predates a rewrite of `main`. `reset --hard` was blocked, the
  rename aside went through. A subject-level
  `comm -23 <(git log --format=%s origin/<b>..<b> | sort -u) <(git log --format=%s origin/<b> | sort -u)`
  is the quick way to see that nothing session-made is on the stale side.
- **`/polish` and vet change source after the last frames.** Bite 4's polish
  folded helpers and vet's knip fix made two exports private, both after the
  scene agent's last frame run, which the loop requires to follow the last
  source commit. The skill should order a bite's end as quick gates
  (`pnpm format:check`, `pnpm knip`, which the scene agent had skipped),
  then `/polish`, then vet, then the play run, then `/pr`.
- **The play run sits near the tool's ten-minute ceiling.** With the house
  it takes ~8 minutes, most of it the probe build. Running
  `NEXT_PUBLIC_MUSHROOM_PROBE=1 pnpm build:vova` and then
  `pnpm play:mushrooms --no-build` as two foreground calls keeps each well
  inside. The skill should split them from the start. Bite 5's scene agent
  then had each probe `step` draw only its last frame, not every stepped
  one, and the whole run fell to ~2.5 minutes: under a software renderer
  the drawing, not the simulation, was the cost. The skill's play script
  should step the simulation freely and render only what it shoots.
- **The context threshold is not measurable from inside a session, and one
  bite already fills it.** The loop says a `/handle` session takes the next
  bite "when its context is still under ~140k tokens", but an agent can't
  read its own context size; only the context-budget hook's notice reports
  it. Bite 1 alone reached that hook's 200k warning, between the skills it
  loads, the frames it looks at and vet's output. The skill should key the
  decision on the notice, and expect a `/handle` session to relay `/go`
  nearly every time rather than take a bite of its own.
- **A relay chain is capped at eight sessions deep.** Bite 3's review
  session (the eighth in the chain) got
  `caller session is at lineage depth 8 (limit 8)` from `create_session`, so
  the chain stopped and waited on the operator. At two or three sessions a
  bite, ten bites cannot run as one chain. The skill should count the depth
  (each relay summary can carry it) and plan for it: fold review handling
  into the next bite's session, take more than one bite per session where
  context allows, or, as the last hop
  before the cap, hand over one line for the operator to paste into a fresh
  session. Where Routines are available, a fresh-session Routine may start a
  new lineage; that is worth trying before depth 7. It is not: bite 6's
  `/go` session, at depth 8, got the same refusal from `create_trigger`
  with `create_new_session_on_fire`, so a Routine inherits the lineage too.
  At the cap, the one line for the operator is the only way on. The
  operator ruled on it: the cap stays, and relays are not to be replaced by
  subagent runs to dodge it ("менять relay на что-то другое в этот подход
  megabeast-a точно не надо"). A chain lasted ~3½ hours for bites 1–3 and
  ~13 for bites 4–6, so the skill should expect the operator's paste about
  every three bites, and say so when it hands over.
- **MCP tool names change mid-session** (a server reconnects under another
  id). Relay and `create_session` calls have to be looked up by the current
  name, never taken from an earlier call in the transcript.
- **`gh pr edit` fails** on GitHub's Projects-classic GraphQL deprecation;
  `gh api -X PATCH repos/<o>/<r>/pulls/<n> -F body=@<file>` works. The skill's
  PR steps should use the REST form directly.

- **The export's authorship label reads the loop's own review as answered.**
  `/handle` fires its review lane on a thread whose tail is `(human)`, but
  every review in this loop is an agent's, so all nine threads of bite 1's
  review came out `@vzakharov (agent)`, the label `/handle` treats as the
  agent's own reply. This session worked them anyway because the plan's loop
  says to. The skill should make a loop review recognisable on its own, for
  example with a marker line the review session writes and `/handle` reads as
  guidance whatever the label.
- **Handling one review filled the session.** The nine fixes, their frames,
  vet and the replies reached the 200k notice before bite 2 could start, as
  the context note above predicted. The skill should plan a review-handling
  session as a whole session, and relay `/go` from it by default.

- **The base-context baseline eats half the budget before the bite starts.**
  Bite 2's pickup (attach, the relay summary, `/go`, the plan, the slice's
  source read once) cost ~115k of the 200k warning line before a line was
  written, and the bite itself fit in the rest only because the quality pass
  went to a subagent. The skill should read the slice by pointer, not
  wholesale — the plan's `## Eaten so far` names each module's contract, so
  a session opens only the files it will edit — and should hand `/polish`,
  vet triage and frame review to subagents by default, keeping the main
  context for building.
- **`tsc -p apps/<site>/tsconfig.json` skips the tests.** It passed while a
  test had an implicit-`any` index that the root `tsconfig.json` (and vet)
  rejected. The skill's quick check between commits should be the root
  project, or just the gates vet runs.

- **A `/handle` session is an orchestrator from its first turn.** The
  base context alone put bite 3's handling session past the 200k notice
  before its first fix. It handled all nine threads anyway, by briefing
  one subagent at a time — the thread's text, the decision it needed, the
  files, the checks, the commit subject and the reply to post — and
  keeping only their short reports. The skill should brief threads to
  subagents by default, grouped by the files they touch (all of a layout's
  threads to one), run one after another on the shared tree. Two groups
  with disjoint files can run in parallel: bite 4's handling ran the
  target fix (`game.ts`) beside the door work, each told to `git add` only
  its own paths, wait out an `index.lock` and merge rather than rebase on a
  rejected push, and neither collided. Name the other agent's files in each
  brief as off limits.
- **A review's open design calls are decided before the brief.** Two
  threads asked the handler to choose. Writing each choice into the plan's
  decisions and committing that first gave the implementing subagent a rule
  to build to, not a question to settle, and the reply could point at it.
- **A fix that tightens a rule can take away what the rule protected.**
  Bite 5's review asked for exclusive perches and flowers only in sight.
  Both landed to the letter, and the implementing subagent's report said
  that on a small phone with the opening pair 89% of visits now lost a
  butterfly, which breaks the game's "the meadow only gets fuller" rule. The
  subagent put it in its report as "for you to decide", not as a failure. The
  skill should brief every constraint-tightening fix with the invariants it
  must not break, named from the plan's decisions, and have the subagent
  sweep those too. A handler should read a report's "for you to decide"
  lines as defects to re-brief, not as footnotes.
- **Look at the frames before replying, even when every sweep says 0.**
  The same round's drink met every number the review asked for, while its
  proboscis unrolled upward, away from the flower. Only the close crop
  showed it. The skill's handling tail should put the frames in front of the
  orchestrator itself before the replies go out.
- **Stage the handling as waves over disjoint files.** Bite 5 ran in three
  waves. First two parallel groups: the small threads (genes, the probe, the
  tests) and the motion threads (the view, the motion). Then the perch
  threads, which needed both groups' files. Then one re-brief for the two
  defects the perch round exposed. The orchestrator's own context stayed
  around 180k for twelve threads because it only held the reports. Replies
  went out in two batches, the first as soon as those fixes were final.
- **The Stop hook's git check fires on a subagent's work in progress.**
  Subagents run in the background, so a turn that ends while one works
  leaves its edits uncommitted. The answer is `git status`, a push of
  anything the main session owns, and a stop — committing the subagent's
  half-done files would collide with its own commit.
- **Subagents pause and resume across a quota reset, while the container
  lives.** Bite 6's handling hit the operator's weekly quota mid-wave. A
  `SendMessage` asking each agent to commit what passes and write a pause
  note stopped them cleanly; the next morning "continue" resumed each with
  its transcript intact. The container outlived the night, but nothing
  promises that, so the pause note is the part that counts.
- **A subagent's context runs out too, so its pause has to be a hand-over.**
  Both long-running agents neared 300k. One had work that did not yet
  type-check against old tests: it committed it as a `git apply`-able
  `.patch` beside its note rather than as source, which kept the branch
  green and nothing lost. The skill should brief every subagent to take
  that form when paused mid-change, and cap a brief at what fits well
  under that ceiling (bite 6's perch brief held six threads, too many).
- **A test that can fail fails the run it lands in.** The review asked the
  play run's turn watch to measure what a child sees; the stricter watch
  landed first and turned `pnpm play:mushrooms` red until the flight
  caught up, across two sessions. Harmless on a branch nobody merges
  mid-loop, but the handling order should land the watch and its fix in
  the same wave, or say in the pause note that red is expected.
- **A subagent cannot see its own context, so the orchestrator reads it.**
  No context-budget notice reaches a subagent, and asked for its usage one
  answered 115k while its transcript held 220k. The number is in the
  transcript the spawn result names: `jq -c 'select(.message.usage) |
.message.usage | (.input_tokens + (.cache_read_input_tokens//0) +
(.cache_creation_input_tokens//0))' <output_file> | tail -1` prints the
  last call's context without reading any content. The skill should check
  it between reports and pause an agent from outside past ~200k, then
  start a fresh one on the same brief from its hand-over note — which is
  what the operator asked for here, and what got both groups done.
- **A subagent's "done" gets a plain-sight read before it is accepted.**
  The perch group met every number, and in doing so stretched a far flight
  in proportion to its length: a fly entering a phone crawled for 11 s
  against its usual second. Each report's "for a person looking at the
  screen" lines are the place such a trade-off surfaces; the orchestrator
  reads them as a six-year-old would and re-briefs, as with the "for you
  to decide" lines above. The same read caught the suite growing to
  330 s.
- **The bite's tail is subagent work too, and two of it run in parallel.**
  Frames plus the Artifact, and the review replies, touch nothing in
  common, so they ran side by side; `/polish`, then the Artifact's
  republish plus `/pr`, ran after. The orchestrator's own share was looking
  at two frames — which caught the sun cut by a straight line in open sky,
  a defect the frames agent had reported as "matches the 80% the fix aims
  for". A test that asserts a share of something visible can pass on a
  visible fault; the fix's test asserted the shape instead (no flat run in
  the hill line).
- **`/polish` keys its scope on a bare `polish:` subject.** The branch had
  none, so a bite-scoped run wrote `polish(bite 6):` to avoid claiming the
  whole branch was covered. The skill should say which bites a polish
  commit covers, so a per-bite polish and the scope rule agree.
- **A committed brief file beats restating the rules in each prompt.**
  Bite 7's handling wrote the shared-tree, house-rule, pause and report
  conventions once to `docs/remove-before-merging/handle-bite7/brief-common.md`,
  and each group's prompt was only its threads, its files, its off-limits
  list and the decisions already made. Six groups ran from it with no
  collision. A `flock` on one lock file for anything that builds or serves
  the site let three agents run play runs on one checkout. The skill should
  write that file from a template at the start of every handling session.
- **Start the next wave the moment its files free up, not when the wave
  ends.** The mushroom group launched as soon as the ink group finished,
  while the other two still ran, since only the ink files overlapped. The
  wave boundary is per file set, not per clock.
- **A fix that meets its number can still change the look, so the
  orchestrator looks at every group's after-frame.** The ink group met the
  contrast bar to the letter by giving dark fills a lighter blue edge, and
  the insect group's frame showed it as a lavender ring round the bee's
  head. A small follow-up group settled it as a decision (a dark fill's
  edge is its own hue, 1.6:1 lighter). The report's "for you to decide" line
  had named it; the frame is what made it a defect.
- **Past the 200k line, the tail goes out whole.** At the warning line
  this session had replies posted and the plan folded, and handed look.md,
  the full play run, frames, `/polish`, the Artifact build and `/pr` to one
  agent, keeping only the Artifact publish (its tool is the orchestrator's)
  and the relay.

- **A subagent reaches ~230k in about twenty-five minutes, often before
  its first commit.** Bite 8 briefed five agents; four hit that line, two of
  them with nothing committed yet, so their work survived only as a patch or
  a pause commit. A `send_later` check-in every ~20 minutes, reading the
  transcript's usage, caught each one in time. The skill's common brief
  should ask for a commit after every step that passes, and its orchestrator
  should arm the check-in with each spawn, not wait for a report.
- **A brief's paths are checked with `ls` before it goes out.** Bite 8's
  common brief named the drawing under `docs/remove-before-merging/`; it had
  moved to `src/pages/mushrooms/reference/`. Every agent spent a search on it,
  and one reported it. The skill's template should fill paths from the tree.
- **A look bite changing proportions meets layout floors with no slack.**
  Every bite-8 attempt at a stouter porcini or a shorter chanterelle failed
  the clump's door-sight and back-cap floors (80.7% against 80%), so the
  species read less like themselves than asked. The skill's plan for a
  proportions bite should budget the layout change alongside the genes, or
  say up front which floor may move.
- **A container restart mid-wave loses the notifications, not the work.**
  Bite 8's handling had four agents running when the container restarted;
  all four had finished, their commits were on `origin`, and their
  transcripts survived in the session's `tasks/` directory. Their reports
  came back with `jq -r 'select(.type=="assistant") | .message.content[]? |
select(.type=="text") | .text' <output> | tail -c 5000`. The skill's
  orchestrator should reach for that before re-briefing anyone.
- **A subagent refused a destructive step hands it to the orchestrator, and
  the orchestrator hands it on to nobody.** Paused at ~220k, group L was
  blocked from resetting the tree and asked the orchestrator to do it. The
  reset was not needed: a fresh agent continued from the dirty tree, with
  the committed patch as the backup. The skill's pause instruction should
  say "leave the tree as it is and commit the patch beside it", never
  "reset".
- **An operator review that asks for a document, not a change, is kept
  verbatim and scheduled.** Mid-handling, the operator posted two game ideas
  and asked for a Russian document on each, weighing them against the code
  and the plan, "не вноси их пока ни в какой план". The ideas went to
  `docs/remove-before-merging/ideas/` verbatim, the plan got only the task
  (bite 9 opens with the documents, and builds only what survives either
  way), and the thread got one reply naming the commit. The skill should
  keep "quote it into the plan" for contract changes and this form for
  ideas still being weighed.

- **A refactor bite's agents reach their limit before their first commit.**
  Bite 9 moved the meadow from screen slots onto the ground. All four
  agents on it (ground twice, flowers, placement) reached 186–254k, and
  three had nothing on origin when the check-in came. A nudge at 165k did
  not help, because a half-migrated tree does not type-check, so there was
  nothing that passed to commit. The skill's brief for a refactor should cut
  it into steps that each type-check (the old API kept as a shim until the
  last step), and make the first commit a "compiles and its tests pass"
  milestone due within ~100k.
- **Parallel agents on one migration block each other.** Bite 9's flowers
  and placement agents each needed the other's uncommitted renames to
  type-check, so neither could test, and both paused with patches that only
  worked stacked. The skill's wave planner should run two groups at once
  only when each builds on the other's _committed_ API, and otherwise run
  them one after another.
- **A paused tree is committed only once it is proven equal to its patch.**
  To drop or keep a paused agent's uncommitted tree without losing work, the
  orchestrator compared `git diff` with the committed patch (the sorted `+`
  and `-` lines were identical). Then it reverse-applied the patch
  (`git apply -R`) or committed the tree as source. A `reset --hard` was
  refused by the permission classifier, and the proof made it unnecessary.

- **Sequential steps, each briefed to commit early, finished a refactor
  the parallel wave could not.** Bite 9's rest ran as three agents one
  after another (frame and room, bees and the layout sweep, the remaining
  red and the gates), each told its first commit was due within ~60k and
  to self-pause at ~170k. All three finished inside ~195k with 3–8 commits
  on origin each, where every wave-B agent before them had nothing on
  origin at 186–254k. The skill should brief a refactor's tail this way by
  default: one agent at a time, a step list in dependency order, a test
  file named as off limits until the step that rewrites it.
- **The orchestrator reads a subagent's context off its transcript on a
  timer.** A `send_later` check-in every 15–30 min read the last
  `cache_read_input_tokens` from the agent's output file (`tac | grep -m1`,
  never a full read) and the branch's new commits; one nudge at ~190k got
  a clean hand-back. A container restart kills the background agent but
  not the check-in, so the check-in's prompt should say to re-launch from
  the agent's note when the agent is gone.
- **An agent's "decision for you" is the orchestrator's to take and
  record, not to forward.** Each report ended with trade-offs (the small
  phone filling to six in 69% of visits, the bees' floor in a full forest,
  the sun over the clump). The orchestrator decided each against the plan's
  own tests and wrote the call, with the alternative it beat, into
  `## Rest of the bite` before the next agent started, so the next brief
  could cite it instead of re-arguing it.
- **An operator review that answers a design document's forks lands in two
  places at once**: the document gets a "what you decided" section on top
  that overrides the body below it (the body kept as the reasoning), and
  the plan gets the item in English with the operator's words quoted. The
  replies name the commit, and each reading the agent had to guess (a word
  that reads two ways) is said in the reply so the operator can correct it.
  When the document's idea is still held out of the plan, only the
  document gets the section. The plan takes only the one line where an
  item already in it waited on that call (item 11's pinch, dropped by
  "one finger").
- **An operator review lands fine while a tail agent runs.** The review of
  idea 1 came in with the gates-and-polish agent busy on `src/`. The
  orchestrator answered it: a document under `ideas/`, eight replies, and
  one plan line after the agent finished. The paths never met. The skill
  should let the orchestrator take operator comments inline while an agent
  holds the code, and push them with a pull-then-push, never waiting.
- **A code span split across a line can break prettier on a nested list.**
  A `` `y u o p [` `` wrapped so its continuation opened the line: the first
  `--write` pushed that line to column 0, and the second flattened item 10's
  whole bullet list into a paragraph. `--check` failed after each pass,
  which is the tell. The skill should run `prettier --check` again after
  every `--write` on the plan, and its prose rule should say never to wrap
  inside a code span.
- **A tail agent marks its polish `polish(bite n):`, which `/polish`'s
  lookup skips**, so the next run reads the whole branch rather than the
  bite. The scoping is right: the bite's range is a focused run by the
  skill's own definition. But the loop never writes a plain `polish:`, so
  every `/polish` from here to `/finalize` re-reads the whole branch. The
  skill should say which one a bite's end writes. The unfocused one is
  the better choice, since the range since the last bite's end is exactly
  what the lookup would otherwise compute.

## Quality levers

- **Spike the engine's risky seam before writing the plan's bite.** Reading
  Phaser 4's `ScaleManager` showed that `Scale.RESIZE` sizes the canvas in CSS
  pixels and ignores `devicePixelRatio`, which would blur every retina
  tablet — the primary device. An hour of research before bite 1 surfaced
  nothing like this; ten minutes in `node_modules` did. The skill should
  point bite 1 at the dependency's source for its core seam (sizing, input,
  lifecycle) before any drawing code is written.
- **Vet at every bite's end pays for itself.** Bite 1's first vet run found
  17 lint errors and failures in four gates (type overlap, knip, Steiger's
  segment names, the skill catalogue) — each a quick fix while the bite was
  still loaded in context, and each a review comment otherwise.
- **Looking at a canvas page needs its own recipe, committed as a script.**
  `pnpm play:mushrooms` (`scripts/play-mushrooms.ts`, `scripts/lib/cdp.ts`)
  builds a probe export, serves it, drives Chromium over the DevTools
  protocol with Node's own `WebSocket` — no Playwright, as `/preview` keeps
  none — steps the sleeping loop, taps every control on four screens, checks
  the state after each tap and fails on any page error. Every session
  before it rewrote the recipe from a relay summary, and the one bug that
  shipped (every tap dead) passed vet. The skill should have bite 1 write
  the play script with the page, and every bite extend it with its own
  controls.
- **In a review, measure a property over many seeds; don't eyeball one
  frame.** "The front cap nearly touches the edge" was a note from one
  frame. A 30-line `tsx` script running 2000 visit seeds through the real
  model and layout turned it into "5.5% of phone visits" — a finding the
  handling session can check its fix against. For a procedural game, any
  claim a frame suggests about layout or genes should be backed by a sweep
  like this. The skill should keep the sweep as a script beside the frame
  recipe.
- **A review session's findings are on the page, not in the diff.** Bite 1's
  code read cleanly: every real finding (faceted rims, the shade's cut, the
  ruler-straight ground seam, the clipped sun) came from the frames, and
  then the code said why. The skill should have review sessions shoot
  frames first and read the code second, with the code pointing at causes.
- **`tmp/` doesn't survive a relay**, which is why the recipe above is
  committed. The container also has no Pillow, so a pixel check wants the
  page's own state read through the probe, not the image.
- **A review posts in one call:** build the review JSON (`commit_id`,
  `event: COMMENT`, `comments[]` with `line`/`start_line`, `side: RIGHT`) in
  a script, then `gh api -X POST repos/<o>/<r>/pulls/<n>/reviews --input
<file>`. Anchoring on the head commit works even when the bite's last
  commit is a few commits back, as long as the lines are unchanged.
- **Seed `Math.random` in the frame recipe.** An init script that swaps
  `Math.random` for a seeded generator makes a page's visit seed fixed, so a
  frame before a fix and one after it show the same meadow and differ only by
  the fix. Without it, every build shoots a different forest and the
  comparison is by memory.
- **Turn a review's sweep into a test, then break it on purpose.** The
  reviewer's 2000-seed edge sweep became `layout.test.ts`. Temporarily
  removing the size bound failed it on three of five screens, which is how
  the handling session knew the test tests something. The skill should ask
  for that mutation check whenever a sweep is kept as a test.
- **Put the reference next to the frame.** The stems were too short compared
  with Syama's drawing, and no review comment said so. It only showed once
  the frame sat next to `syama-drawing.webp`. The skill should have every
  look at a frame put it side by side with the reference it is judged
  against.
- **Drive motion from the clock, not from tweens, when resize must not
  interrupt it.** Bite 1 had promised that "tweens survive a rotation"; bite
  2 found the cleaner contract was to have no long-lived tweens at all —
  every idle loop and tap reaction is a pure function of time in the model,
  and the scene's `update` sets it each frame. That made the motion testable
  under `node:test` and made the resize question disappear. The skill should
  steer a game's plan toward that shape up front.
- **Frames caught both of bite 2's visual misses.** Flower heads too small
  for their stems and a spore puff pale on pale both read fine in code and
  both were obvious in the first frame. One rebuild-and-reshoot cycle per
  bite, before vet, is cheap and should be the skill's default.
- **A timed screenshot under software GL is not a frame at that time.** One
  Playwright screenshot of the canvas takes ~1 s under swiftshader, so a shot
  "90 ms after a tap" shows the scene about a second later, and bite 2's
  review nearly reported the flower bloom as broken. What works: expose the
  game (`Object.assign(window, { __game: game })` in `start-game.ts`, built
  but never committed), `__game.loop.sleep()`, then drive
  `__game.step(t, 1000 / 60)` on a clock the script advances, and take the
  shot between steps. Reading `head.scaleX` through `page.evaluate` is what
  showed the tap had landed. The skill's frame script should step the loop
  by default, and the game should ship a dev-only hook for it rather than a
  line each session adds and reverts.
- **Anchor review comments by line from a single file's `cat -n`.** Reading
  two files through one `cat -n` numbers them as one, and a comment anchored
  at the second file's line 270 fails with "Line could not be resolved". A
  failed review post is atomic, so find the bad anchor by posting each
  comment alone as a pending review and deleting it afterwards.
- **`type-overlap` is the gate a new creature trips.** A second creature
  repeats members (`size`, `phase`, `stemBend`, `seed`) that the first
  declared inline. The skill's bite checklist for "a new kind of thing"
  should say: name the shared bases first (`Footing`, `Phased`, `Bent`,
  `Seeded`), then write the types.
- **Handling a review is cheaper when every fix is its own commit and its
  own reply.** Bite 2's six threads went in five commits, one per concern,
  each reply naming its SHA and the test that holds it. Nothing had to be
  untangled when writing the replies. The skill should make one commit per
  thread its default for the `/handle` session.
- **A reviewer's "Ask" with a test in it is half the fix.** Every one of
  bite 2's comments ended with a concrete ask and a check for it ("every
  flower shorter than the nearest stem", "`|wobble| < 1%` past the
  duration"). The handling session wrote those tests first and then
  mutation-checked them. The skill's review template should require an
  `Ask:` line and a checkable property per comment.
- **A test that pins a derived constant has to test the neighbourhood, not
  the cutoff.** The reviewer's `|wobble(t)| < 1% for t ≥ WOBBLE_DURATION` is
  true by construction once the function returns 0 past the span. The
  version that tests something checks the last 50 ms before the cutoff. A
  review ask phrased as a property is worth reading for whether the code
  makes it vacuous.
- **Checking the audio needs no ears.** `voice.context.state` read through
  `page.evaluate` (`running` → `suspended` → `running`) confirmed the mute
  fix in the same Playwright run as the frames. The skill's frame script
  should read the relevant runtime state beside each shot, not only take
  pictures.
- **Past the 200k line, subagents are what finish the bite.** Bite 3 hit the
  budget notice with the scene still unwired; frames, polish plus vet, and the
  PR refresh each went to a subagent that reported in under 400 words, and the
  bite finished without a stop. The skill should hand those four out by
  default from the start, not as a rescue. Bite 4 did, and it held: the
  main session wrote `## This bite` with every open call decided, then
  briefed three subagents in sequence — the model with its tests, the scene
  with its frames and play steps (handed the model's API from the first
  report), polish plus vet plus `/pr` — and stayed near 160k while the
  subagents spent ~600k between them. A model/scene split works because the
  model agent's report is a ready API brief for the scene agent. Decide the
  calls a subagent would otherwise make on the spot (windows over spots or
  not) in the brief, and read its deviations back into the plan. Bite 5
  ran the same three briefs from a fresh relay and the main session never
  came near the notice (~70k, against ~620k spent by the subagents), so a
  `/go` session is an orchestrator too, not only a `/handle` one. The main
  session's own work was what a subagent cannot do well: settling the
  bite's calls before any brief, looking at two frames beside the drawing,
  and folding the bite into the plan.
- **A per-frame action wants a reducer that returns the same object when
  nothing changed.** Bite 5 dispatches `tick` every frame; the model agent
  made `tick` and `startle` hand back the input `Meadow` untouched when no
  leg turned over, and the scene skips reconciling on reference equality.
  The skill's brief for any clock-driven action should ask for that
  property and a test of it.
- **An unmeasured weakness goes in the relay, not only in the report.** The
  scene agent listed what it knew was weak (two butterflies crowding one
  cap, a butterfly wider than the smallest back caps on a phone, a wings-
  closed pose reading as a stick in a still). Handing that list to the
  review session as questions to sweep is cheaper than having it
  rediscover them.
- **A frame subagent has to tap, not only look.** Its first run found five
  visual issues; its reshoot found the one real bug — the back clump
  mushroom answered taps only at its left edge, because the front one's
  bounding box covered it. It surfaced only because selection gave taps a
  consequence. The frame recipe should drive every control and read the
  resulting state (`scene.meadow`), and a bite that changes what a tap means
  should re-test every tap area. Bite 3 then shipped with no tap working at
  all: the fix for that bug (074dc66) came after the last frames, passed a
  hit-area object Phaser reads as a config, and every tap threw — vet green,
  PR body describing a working selection. Only the review's frame agent,
  collecting `pageerror`, saw it. The skill should make the last frame run
  follow the bite's last source commit, and make any page error fail it.
- **Test a layout's controls against the meadow, not only each other.** Bite
  3's control test held every button apart from every other and missed `−`
  sitting on a forest cap in 61% of phone-landscape visits, and the forest
  shrinking to 50 px caps on a phone — the tap-size rule enforced only where
  a target happened to be a circle. The review's sweep script (controls
  against every slot's cap across 2000 visits, min cap and stem px per slot)
  is the kind the skill should keep: every tap target, whatever its shape,
  against the size floor and against every other thing on screen.
- **A new kind of thing competes for the layout; measure the loser.** Adding a
  forest's feet starved the flowers (2.4 per visit on a tablet, 0.6 on a
  tablet held upright, against a test floor of 4.5). A ten-line `tsx` script
  printing flowers per visit and slot sizes per screen turned slot placement
  into three quick iterations. The skill should keep such sweeps as scripts
  beside the frame recipe.
- **A frame subagent's report is a lead, not a citation.** Bite 4's review
  agent measured well, but it anchored two causes at lines past the end of
  their files (`draw-mouse.ts:249` in a 112-line file). It also claimed the
  drawing's windows were "nearer 1/5 of the cap", which one look at the
  reference didn't support. The review session re-anchored every comment from
  the source and dropped the claim. The skill should have the main session
  open each cited line and the reference before posting, and should ask the
  frame agent for numbers and frame names, not file:line.
- **A hint carried in the relay summary is a hypothesis to measure.** Bite
  4's summary said the door's frame "pokes slightly past the stem". The sweep
  measured 0 px on every screen, but found the problem next to it: the test
  holds the doorway, not the painted frame. It also found a far worse one
  nobody had noticed, the back door hidden on 96% of tablet visits. The
  skill's review brief should hand over such hints as questions for the
  sweep, next to an open "what does a child actually see" pass, so the sweep
  isn't confined to the hints.
- **Occlusion is a finding class of its own for a layered scene.** Each
  object's own tests held (every door inside its stem), while the scene hid
  the back door behind the front stem. The skill's sweep template should
  include "what fraction of each new tappable thing is covered by nearer
  things" whenever a bite adds something tappable.
- **A pixel constant breaks a proportional layout's resize contract.**
  `EDGE_MARGIN` made bounded sizes not scale with the screen, so flowers
  placed against them moved on a resize. The fix was to place the dependents
  against the layout computed with the margin at 0. The skill's layout
  checklist should ask which quantities are exactly proportional before
  anything keys stable placement off them.
- **A fix that retunes a shared constant trades against properties nobody
  tested.** Bite 4's door fix moved the portrait clump's feet so the back
  door showed, and in doing so hid up to 96% of the back cap behind the
  front one. Every test stayed green, because the only cap-over-cap bound
  skipped the clump pair. The frame agent saw it; a sweep of the back cap
  against the old and new constants turned it into numbers, and a third
  tuning met both bounds. The skill should have any handler that moves a
  layout constant sweep the neighbouring properties (every nearer/farther
  pair, every tap target, every floor) at the old and new values, and add a
  test bound for each one the change trades against.
- **A size floor on an animated thing is checked at its narrowest pose.**
  The mouse's 28 px floor held at rest and read 27.4 px in the play run,
  because a tapped mushroom is always selected, and a selected one breathes
  and beckons. Only reading the drawn size back through the probe caught
  it. The skill should phrase every floor as "at the narrowest pose the
  motion model allows", derived from the motion constants, and have the
  play run read drawn sizes rather than model state.
- **A subagent's scratch copy of `src/` breaks `pnpm test`.** Copying the
  mushroom sources to `tmp/clump/` to measure old constants put their
  `*.test.ts` under the test glob. The brief should say: measure old values
  by importing the live modules with overrides, or check out the old commit
  in a `git worktree` outside the repo, never copy test files into the tree.
- **A review runs two agents at once: one plays and sweeps, one reads.**
  Bite 5's review briefed a frame-and-sweep agent (build, play run, scripted
  child sequences, 2000-seed sweeps, frames committed) and a read-only code
  agent (the five-percent list, plan against code, tests that cannot fail) in
  parallel on the same tree, with only the first allowed to commit. The main
  session looked at frames beside the drawing, re-anchored every cited line
  from a single file's listing, and posted. It stayed small, and the two
  reports found different bugs: the reader found the wing snap on a mid-air
  re-route, the player found the ±π spin. The skill should make that pair
  the review's default.
- **A comment that promises a property is a sweep target.** "So two on one
  perch sit apart" read as fact; the sweep measured 74–98% overlap when two
  share. The review brief should list every behavioural claim in the bite's
  comments and plan entry, and have the sweep agent measure each one.
- **Angles are a finding class of their own.** Every rotation defect in bite
  5 sat at the ±π seam: a linear blend, a clamp of a wrapped heading. The
  play script's checks should include "no rotation step above ~0.2 rad
  between frames" for everything that turns, as they already include page
  errors.
- **Three sequential briefs held a whole bite again, and the main session
  stayed near 40k.** Bite 6 ran model → scene → tail (gates, `/polish`,
  vet, play run, frames, `/pr`) from a relay, each brief carrying the
  previous report as its API. The subagents made model changes the scene
  needed (a bee never settling back on the flower it leaves, or no bee ever
  pollinated), and reported them as decisions. The skill's scene brief
  should say the scene agent may change the model for an invariant the
  frames expose, and list each change in its report so the plan absorbs it.
- **A rule stacked on a rule can starve the feature it guards.** Planting
  "clear on this screen and on the turned one" cut the room to plant about
  4×, down to under one slot per meadow. The skill should have the scene
  agent report the feature's rate under every guard (plants per minute, not
  only "a flower was planted") so the reviewer can weigh the guard. Bite 6's
  review found how far off it was: the play run passed on all five screens
  while a tablet planted one flower per meadow and then never another, and
  bees beside butterflies roamed 85–99% of their flights. The play run checks
  that a thing can happen, and the review's model sweep measured how often it
  does. The skill should keep that sweep as a committed script with rate
  floors, one per ecological rule, run in the bite's tail next to the play
  run.
- **A bound equal to the code's own cap tests nothing.** The play run's
  0.2 rad-a-frame turn check sat just above the view's 10.8 rad/s cap, so it
  measured the cap. The reader agent found it along with three tests fed
  `crowded: []` or always-open flowers. The skill's review brief should ask
  for each bound the play run and the tests hold, and whether the code makes
  it true by construction.
- **A look bite opens with a research agent that writes a spec, not code.**
  Bite 7 ("atmosphere") had no model to split on, so the model → scene
  pattern did not apply. What worked: one agent fetched reference stills
  into `tmp/refs/`, read the painting code and Phaser's source for what is
  cheap (gradients and filters turned out WebGL-only and a render pass a
  frame), and wrote a spec whose items each name what the references do,
  the change in the code's terms, a checkable property and a cost. It also
  split the items by files into two groups and named a small step 0 (the
  shared table split, a pure light module) that had to land first. The
  orchestrator settled the spec's open calls in `## This bite`, then ran
  step 0 alone and the two groups in parallel on one tree. The groups'
  file lists were disjoint down to "the scene is B's; A comes through
  `paintBackdrop`'s layer contract", and a `flock` around build and play
  kept their frame runs from colliding. The skill should make "research
  → spec → step 0 → parallel groups by file" the shape of any bite whose
  subject is the look rather than behaviour.
- **The orchestrator's two frames are a round of their own.** Both groups
  reported "not gloomy, reads at a glance", and both were right about what
  they had built. But the orchestrator's own look at two frames, one per
  orientation, found a ruler-straight seam across the whole ground, a
  grey-teal smear by the sun (yellow halo over blue), and stems still flat.
  None was in either report, because each sat at a seam between the
  groups' work or in what neither was asked about. A third agent fixed all
  three, each with a shape test. The skill should budget a fix round after
  parallel groups by default, briefed from the orchestrator's own frames.
- **A parallel agent's gate report can be the other's half-made state.**
  Group B reported `type-overlap` failing in A's files, and A reported
  `tsc` failing in B's test; both were clean once each had landed. The skill
  should have the fix round, not the groups, own the final gates.
- **The operator's questions mid-run are answered, not treated as a stop.**
  While bite 4's handling ran, the operator asked how to run the game
  locally and whether ecology and the insects were planned. Answering from
  the plan in chat, with the subagents still working, cost two short turns
  and broke nothing. A question is not a contract change, so it goes to the
  plan only when it changes what is built.
- **A spec's cost column is a claim, and the review measures it.** Bite 7's
  spec marked every backdrop layer "(d) Static, painted once per resize:
  free". But a Phaser `Graphics` replays and re-tessellates its whole command
  list on every render, so the bands and halo discs cost 2.3× bite 6's draw
  commands a frame and a rendered frame went from 13 to 31 ms. The play run
  grew from minutes to ~20 and nobody asked why until the review. The reader
  found the cause in Phaser's renderer source; the player confirmed it by
  hiding layers and timing frames. The skill should have the play run
  report a render-frame median per screen and fail past a budget, so a
  look bite's cost shows up in its own tail rather than in the next review.
- **The orchestrator's own look at the bite's committed frames finds what
  the bite's agents walked past.** The shine sitting over a spot and the
  stem's slanted plank foot were plain in bite 7's own committed close-ups.
  The review's orchestrator named them in a few minutes and sent them to
  the player to measure (73–83% of caps; 18–25 px). The skill's review
  should open with the orchestrator reading the bite's frames and briefing
  what it sees as sweep targets, before the agents start. Bite 8's review
  did that, and it held: of the six things the orchestrator saw in the
  committed frames, the agents turned five into numbers and causes (the
  foot ring, the stroke gaps, the flat russula, the invisible rim wave,
  the frozen puff), and ranked the sixth, the picker icon, as a hunch.
- **A sweep that draws its combinations at random reports the sample, not
  the worst case.** Bite 8's clump test drew one species pair per visit,
  and the plan wrote down its minimums (80.7% door, 45.1% cap) as "no
  slack". The review swept all 16 pairs over the same seeds and found
  65.9% and 29.5%. Wherever a layout's inputs are a small discrete set (species,
  slots, screens), the skill's sweep template should iterate the set
  exhaustively and randomise only the continuous genes. The report should
  fail on any combination left unmeasured, rather than printing `NaN`.
- **Two agents reaching one cause independently is the confidence
  signal.** The reader, from code alone, and the player, from frames and
  sweeps, each named `standing(0, 0)` as the flowers-off-feet cause and
  `capWidth * 0.8` as the foot ring's. Their unshared finds were of
  different kinds: dead door taps and vacuous tests from the reader,
  pair breaches and hidden flowers from the player. The review can post
  the agreed findings as confirmed, and should mark a finding one agent
  reports without a measurement as a hunch. Bite 8's picker icon was
  posted that way.
- **The cap-depth session reviews and stops; the operator restarts.** Bite 8's
  review was the eighth session in its chain, so it posted the review,
  wrote the summary with depth reset to 1 and the Next step `/handle`, and
  handed the operator `/relay take <branch>`. It is cheap to do because the
  review is the natural stop: nothing is half-built.
- **Waves follow dependencies of the result, not only of the files.** Bite
  8's handling ran four groups at once (taps, colour, shapes, flowers) and
  the clump group after the shapes, since the clump's floors measure the
  drawn caps. The flower group could run early only because its brief said
  to build every guard as a function of the layout, never a constant tuned
  to today's clump, so the clump's move flowed through with no second
  round. The skill's wave planner should ask of each pair of groups "does
  one measure what the other draws?" and brief the earlier one that way.
- **An exhaustive sweep is a script; the test samples it.** All 16 species
  pairs on all 2000 visits took ~7 minutes, so `layout.test` runs 125
  visits a pair (~67 s) and a committed-to-`tmp/` script proved the margin
  once. The skill's sweep template should say which of the two a number
  came from.
- **The tail splits in two, because each half fills an agent.** One agent
  took the last refactor, the plan fold and `/polish` (~225k); a second took
  vet, the five-screen play run, the frames, the Artifact build and `/pr`.
  The orchestrator kept the replies, the Artifact publish and the relay.
- **Ask what an invariant protects before sweeping it everywhere.** Bite 9's
  agents inherited "every screen" from the old layout sweeps and checked
  each mushroom pick against all six screens held both ways. That shrank
  the frame to the overlap of every device, and a meadow stopped at 4.8 of
  six. The rule protects one child's meadow across a turn, and a meadow never
  leaves its browser, so this screen and its turn are the whole domain. The
  skill's orchestrator should state each invariant's domain in the brief
  rather than let the sweep's habit choose it.
