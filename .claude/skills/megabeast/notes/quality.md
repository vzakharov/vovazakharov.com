# Quality levers

## Design, before the code

- **Spike the engine's risky seam before writing the plan's bite.** Reading
  Phaser 4's `ScaleManager` showed that `Scale.RESIZE` sizes the canvas in
  CSS pixels and ignores `devicePixelRatio`, which would blur every retina
  tablet — the primary device. An hour of research before bite 1 surfaced
  nothing like this; ten minutes in `node_modules` did. The skill should
  point bite 1 at the dependency's source for its core seam (sizing, input,
  lifecycle) before any drawing code is written.
- **Drive motion from the clock, not from tweens, when resize must not
  interrupt it.** Bite 1 promised that "tweens survive a rotation"; bite 2
  found the cleaner contract was no long-lived tweens at all — every idle
  loop and tap reaction a pure function of time in the model, set by the
  scene's `update` each frame. That made motion testable under `node:test`
  and the resize question disappear. The skill should steer a game's plan
  toward that shape up front.
- **A per-frame action wants a reducer that returns the same object when
  nothing changed.** Bite 5 dispatches `tick` every frame; `tick` and
  `startle` hand back the input `Meadow` untouched when no leg turned over,
  and the scene skips reconciling on reference equality. A brief for any
  clock-driven action asks for that property and a test of it.
- **A call whose bar is unmeasured carries its fallback, written.** Bite
  14's call to judge a sprout's placement at its start size (0.4) as well
  found room in 0 of 20 visits at ~3.5 s per search, against 20/20 at
  ~30 ms without; the call named the fallback, so the agent dropped back to
  it without a re-brief and saved a round. Without one the agent stops and
  reports ([subagents.md](subagents.md), "decided on paper").

## Review practice

- **A review's findings are on the page, not in the diff.** Bite 1's code
  read cleanly: every real finding (faceted rims, the shade's cut, the
  ruler-straight ground seam, the clipped sun) came from the frames, and
  then the code said why. Reviews shoot frames first and read the code
  second, the code pointing at causes.
- **A review runs two agents at once: one plays and sweeps, one reads.**
  From bite 5 the review briefed a frame-and-sweep agent (build, play run,
  scripted child sequences, 2000-seed sweeps, frames committed) and a
  read-only code agent (the five-percent list, plan against code, tests that
  cannot fail) in parallel on one tree, only the first allowed to commit.
  Each finds what the other cannot: the reader the wing snap on a mid-air
  re-route, dead door taps, vacuous tests and the chord finger from Phaser's
  pointer pool; the player the ±π spin, pair breaches, hidden flowers and
  inaudible drums. Two reaching one cause independently is the confidence
  signal (bite 8's `standing(0, 0)` and `capWidth * 0.8`; bite 10's stale
  tufts), so agreed findings post as confirmed, and one agent's finding
  without a measurement posts as a hunch. The orchestrator checks each cited
  line, looks at frames and posts in one call, staying under ~60k. A
  structural bite's 116-file diff split the reader in two by theme (bite
  12b: the field; the insects and the harness), three agents in parallel at
  ~170k each against an asked ~120k, all reporting rather than posting; the
  brief asked each finding for its changed anchor line and an `Ask:`, so
  the post was one script. The player's best finding (a turned phone
  stranding 17 of 22 mushrooms) came from a step no reader could take, a
  screen turn after `+` refused: the player's brief lists the turn.
- **A subagent's report is a lead, not a citation.** Bite 4's review agent
  anchored two causes past the end of their files (`draw-mouse.ts:249` in a
  112-line file) and claimed the drawing's windows were "nearer 1/5 of the
  cap", which one look at the reference didn't support. The orchestrator
  opens each cited line and the reference before posting, and asks agents
  for numbers and frame names, not file:line. It anchors from a single
  file's `cat -n`: two files through one listing number as one, and a
  comment at the second file's line 270 fails with "Line could not be
  resolved".
- **A review posts in one call:** the review JSON (`commit_id`,
  `event: COMMENT`, `comments[]` with `line`/`start_line`, `side: RIGHT`)
  built in a script, then
  `gh api -X POST repos/<o>/<r>/pulls/<n>/reviews --input <file>`. Anchoring
  on the head works when the bite's last commit is a few back, as long as
  the lines are unchanged. A failed post is atomic, so a bad anchor is found
  by posting each comment alone as a pending review and deleting it.
- **A cause outside the diff anchors on the changed line that states its
  contract.** Bite 11's worst finding (every pan taps its start) lives in
  an unchanged `POINTER_DOWN` line, which a review comment cannot anchor
  on; the new `pan-input.ts` doc comment that says "a press still taps
  whatever it lands on" could, with the causal line quoted in the text.
  Check each anchor against `git diff -U0 <base>..HEAD -- <file>`'s hunks
  before building the JSON.
- **A player agent may drive the build with its own frame-stepping CDP
  script instead of the play recipe.** Bite 11's did (seeded, one frame at
  a time) and got wobbly-tap and key-release traces the recipe has no step
  for; the recipe stays the tail's green/red gate.
- **Every comment carries an `Ask:` with a checkable property, and every fix
  is its own commit and reply.** Bite 2's comments each ended with a
  concrete ask and a check ("every flower shorter than the nearest stem",
  "`|wobble| < 1%` past the duration"); the handler wrote those tests first
  and mutation-checked them, and its six threads went in five commits, each
  reply naming its SHA and the test that holds it, with nothing to untangle.
- **A play-run failure is a claim about the game, tested before it is
  fixed.** Bite 9's run reported an untappable mushroom, a gapped selection
  band and a butterfly that never came to the chanterelle; all three were
  check defects (a cap under a resting butterfly missed, the ink's reach
  underestimated, a wait shorter than the odds), and the sweep that
  disproved the first found two real tap losses nobody had reported. The
  handling brief asks "is the game wrong or is the check?" before any fix.

- **A fix agent's GitHub replies are the orchestrator's when it runs
  out.** Bite 15's worm fixes landed three commits and stopped at the 170k
  hook before replying; posting three one-line replies cost the
  orchestrator a single call, where a second agent would have paid a full
  baseline. The skill briefs replies last and lets the orchestrator post
  any left, from the report's comment ids and SHAs.

- **Brief the reviewer with the real device's failure modes, and let it
  argue against the spec.** Bite 18's (saving) reviewer was handed a list —
  a record reopened mid-flight, two tabs, a dropped connection, a store
  failing after open, a poll writing forever — and came back with eight
  findings, four blocking, two of which overturned spec calls (call 5's
  "one refused write stops keeping", call 12's "last writer wins"): iPad
  Safari keeps old tabs and drops IndexedDB after backgrounding, so both
  lost a child's work. The spec agent had weighed the model, not the
  device. For any bite touching storage, timing or the platform, the
  skill's spec brief should carry the same list, and the orchestrator
  amends the call in the bite file when a finding beats it. Fixing all
  eight took five one-step agents in parallel off one shared addendum
  (`fix-common.md` in the scratchpad: own threads, neighbours' files,
  landing, reply); the one that stopped with measured options (a zod
  `undefined` in a schema snapshot) was resumed with `SendMessage` and a
  pick, cheaper than a fresh agent.

## Sweeps and the tests they become

- **A test "fixed" because its fixture no longer arises is a regression
  report.** Bite 12's drawn-only taps quietly stopped the forest growing
  behind the clump; the haze test went red ("nothing cleared") because no
  hazy mushroom grew any more, and its agent rightly made it plant its own
  — with "every mushroom stands 7.8–9.8 ahead" as a side remark. Two other
  reds and a phone-growth table had the same cause. The orchestrator
  caught it only by asking why the fixture vanished. The skill should
  brief: when a test is repaired by supplying what the game used to
  produce, report the vanished behaviour as a finding of its own.
- **A probe of a parameter has to bypass that parameter's clamp.** "Same
  result with both patches at 0.1 px" ruled the patch out, wrongly: the
  8 px floor lifted 0.1 back to 8. The next agent found the cause in the
  patch after all. A sweep that sets a value should print the value the
  code actually used.
- **Measure a property over many seeds as a committed script; don't eyeball
  one frame.** "The front cap nearly touches the edge" was a note from one
  frame; a 30-line `tsx` script running 2000 visit seeds through the real
  model and layout made it "5.5% of phone visits", a number the fix can be
  checked against. A new kind of thing competes for the layout, and the
  sweep measures the loser: a forest's feet starved the flowers (2.4 per
  visit on a tablet, 0.6 upright, against a floor of 4.5), and a ten-line
  script printing flowers and slot sizes per screen made slot placement
  three quick iterations. Sweeps live as scripts beside the play recipe.
- **A sweep kept as a test is broken on purpose once.** The 2000-seed edge
  sweep became `layout.test.ts`; removing the size bound failed it on three
  of five screens, which is how the handler knew it tests something.
- **A small discrete input set is swept exhaustively; the test samples it,
  and each number says which it came from.** Bite 8's clump test drew one
  species pair per visit and the plan wrote its minimums (80.7% door, 45.1%
  cap) as "no slack"; the review swept all 16 pairs over the same seeds and
  found 65.9% and 29.5%. The full sweep took ~7 minutes, so `layout.test`
  runs 125 visits a pair (~67 s) and a script proved the margin once. The
  template iterates species, slots and screens exhaustively, randomises only
  the continuous genes, and fails on any combination left unmeasured rather
  than printing `NaN`.
- **Sweep the states a child reaches, not the one a test helper builds.**
  Bite 10's "every tuft shown takes a flower until the cap" held in 14000
  plantings on a fresh meadow and failed for up to 45% of tufts after `+`:
  the tufts were computed in `paint`, which runs on a resize, and every test
  built the opening clump only; the turn test had the same shape (forest
  only, while the opening clump lost 1 flower in 3.5). Every rule runs over
  opening, after `+`, after bee plantings, full forest and after a turn.
- **State each invariant's domain in the brief.** Bite 9's agents inherited
  "every screen" from old sweeps and checked each mushroom pick against all
  six screens both ways, shrinking the frame to the overlap of every device
  until a meadow stopped at 4.8 of six. The rule protects one child's meadow
  across a turn, and a meadow never leaves its browser, so this screen and
  its turn are the whole domain.
- **Measure a feature's rate under its guards, not only that it can
  happen.** Planting "clear on this screen and on the turned one" cut the
  room about 4×, to under one slot per meadow; bite 6's play run passed on
  all five screens while a tablet planted one flower per meadow and never
  another, and bees beside butterflies roamed 85–99% of their flights. The
  skill keeps a committed sweep with rate floors, one per ecological rule,
  run in the bite's tail next to the play run.
- **Every behavioural claim in a comment is a sweep target, and an "on
  purpose" comment is asked what it trades away.** "So two on one perch sit
  apart" read as fact; the sweep measured 74–98% overlap when two share.
  Bite 9's forest mushrooms were one size at every depth because `sizeOn`
  divides by the very `scaleAt` that `project` multiplies by; the comment
  called it a choice ("the back rows as big as the front ones"), every test
  compared the forest only with the clump, and the agents read it as
  settled. The review brief lists every such claim in the bite's comments
  and plan entry, and measures each.
- **A bound the code makes true by construction tests nothing.** The play
  run's 0.2 rad-a-frame turn check sat just above the view's 10.8 rad/s cap,
  so it measured the cap; tests fed `crowded: []` or always-open flowers;
  `|wobble(t)| < 1% for t ≥ WOBBLE_DURATION` holds once the function returns
  0 past the span, where the version that tests something checks the last
  50 ms before the cutoff. The review brief asks of each bound whether the
  code makes it vacuous.

## Finding classes

- **Every tap target against the size floor and against everything on
  screen.** Bite 3's control test held every button apart from every other
  and missed `−` on a forest cap in 61% of phone-landscape visits, and a
  forest shrinking to 50 px caps on a phone — the tap-size rule enforced
  only where a target happened to be a circle.
- **Occlusion, for a layered scene.** Each object's own tests held (every
  door inside its stem) while the scene hid the back door behind the front
  stem. Whenever a bite adds something tappable, the sweep measures what
  fraction of it nearer things cover.
- **Pending state is judged as it will stand.** Bite 14's spores counted
  in the room check's spacing and caps but not in its cover, door and patch
  rules, so each of six spores round a cap passed alone and the six buried
  each other once the rain grew them (clump caps 91 % hidden, bound 25 %).
  The 50-visit sweep caught it the round the switch landed; the one-visit
  play frame looked clean. Anything laid now to become something later is
  judged as the later thing, against every rule — and a feature switch
  gets a sweep run before its frames are trusted.
- **Angles.** Every rotation defect in bite 5 sat at the ±π seam: a linear
  blend, a clamp of a wrapped heading. The play script checks "no rotation
  step above ~0.2 rad between frames" for everything that turns — with the
  bound set clear of any cap in the code (above).
- **A size floor on an animated thing holds at its narrowest pose.** The
  mouse's 28 px floor held at rest and read 27.4 px in the play run, because
  a tapped mushroom is always selected, and a selected one breathes and
  beckons. Every floor is phrased at the narrowest pose the motion model
  allows, derived from the motion constants, and read back as drawn.
- **A pixel constant breaks a proportional layout's resize contract.**
  `EDGE_MARGIN` made bounded sizes not scale with the screen, so flowers
  placed against them moved on a resize; the fix placed the dependents
  against the layout computed with the margin at 0. The layout checklist
  asks which quantities are exactly proportional before anything keys
  stable placement off them.
- **A retuned shared constant trades against what nobody tested.** Bite 4's
  door fix moved the portrait clump's feet so the back door showed, and hid
  up to 96% of the back cap behind the front one, every test green because
  the only cap-over-cap bound skipped the clump pair. A handler that moves a
  layout constant sweeps the neighbouring properties (every nearer/farther
  pair, every tap target, every floor) at the old and new values, and adds a
  bound for each one the change trades against.
- **A proportions change meets layout floors with no slack.** Every bite-8
  attempt at a stouter porcini or a shorter chanterelle failed the clump's
  door-sight and back-cap floors (80.7% against 80%), so the species read
  less like themselves than asked. The plan for a proportions bite budgets
  the layout change alongside the genes, or says up front which floor may
  move.
- **"Identical by construction" is a claim about one projection, not the
  frame.** Bite 12's half depth kept `viewOf = project` exact, and the
  orchestrator promised the operator a pixel-identical opening; the brow,
  a circle of plane distance, dipped hard at the sides and 10–36% of the
  pixels moved. Before promising an unchanged picture, list every quantity
  the frame draws from (here plane distance as well as screen position) and
  check each, or say "a probe will show it" instead. A geometry call goes
  through a frame probe (a patch plus HEAD-vs-probe pairs) before a build
  agent is briefed: the second probe settled in ten minutes what the first
  build spent half an hour finding.
- **When the checks start finding the checks, stop the chase.** At bite
  12's depth 6 the veer play's red rows took four rounds: one found a real
  game defect (away legs timed and drawn between different points), two
  were the play's own errors (a bound copied from a measurement, a count a
  bee's sowing broke), and each fix surfaced the next row. The operator
  asked whether anyone had spiralled. The skill should count, per play,
  how many of its last rounds found the game versus the script; once the
  script wins twice, record the remaining reds as known for the review and
  the operator's play, and move to the bite's next item.
- **A field given a new meaning keeps its old readers.** Bite 13's fold
  wrote a closed bud's foot radius into `headR`, right for the one reader
  it was meant for (perching) and wrong for four others — the held
  flower's ring shrank to a dot in the rain, and the tap zone over a cap
  with it. The build's own frames never held a flower in the rain; a
  reviewer grepping the field's readers found it. A review greps every
  reader of each field a bite starts writing differently, and the fix gives
  the new meaning a field of its own.
- **A number copied from a call's prose is a hunch in the code.** Call 1
  said a cloud spreads "`CLOUD_SPREAD` (4) radii"; the puffs reach 2.4–2.8,
  so blue sky beside a cloud started the rain and the drops' densest band
  was 60% too wide. Measured against the drawn pixels, the number became a
  derivation from the puff table. A call states its numbers as "derive it
  from `<file>`".
- **One quantity measured in two frames is a class, not a leg.** Bite 12's
  review play showed one bee 1.71× fast after a snap turn; the trace found
  the model framing each perch alone (clamped at the margin) while the view
  framed a leg's two ends together — 31 of 49 bee legs off, 0.3–29×. The
  same tail found the veer watch reading the held turn's 9.3 px slide as a
  flier's step, which was `leg-timing.md` § 7's "accepted" 2%. So a speed red is traced to
  _which frame each side measures in_, model, view and watch, before it is
  called noise or a residue; an "accepted residue" is re-asked whenever the
  frame of anything it measured changes.
- **The operator at the keyboard finds what no play measures.** In bite 17
  he found, in one sitting: 20 fps at dusk on a real Mac (every play
  passed its 26 ms budget headless), a swipe flying ~50 m since bite 14
  (no play checked distance per swipe), a band of tufts pinned under the
  horizon (a test asserted it), the moon's tap lost to a cloud's tap box.
  So the skill should publish the Artifact mid-bite whenever a visible
  batch lands, not only at the bite's end, and each operator note becomes
  a one-step agent at once, in parallel with the bite's own steps: seven
  ran side by side here with only squash conflicts in the shared play file.
- **A perf report is counts, not milliseconds.** On a machine shared by
  agents, frame times swung 20–32 ms; draw calls, vertices and framebuffer
  binds per frame (a bench play reading the renderer) are exact and name
  the piece. Phaser 4 trap: a container without its own blend mode breaks
  the batch for every non-normal child.
