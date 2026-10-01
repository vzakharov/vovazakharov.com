# The loop's contract

- **The loop lived in the plan, and that worked.** Writing the cycle into the
  plan as its own section made every successor read it on attach, with no
  extra file to load. The skill should write that section itself, from its
  own template, rather than relying on the planning session to write it.
- **The plan grows by a bite's worth of decisions per bite, and has to be
  split before it is read whole.** Bites 1–11 plus their reviews' calls took
  `## Eaten so far` to 1001 lines, about 20k tokens on every resume, until
  the operator flagged it («ого его раздуло. надо разбивать»). The split
  became `.claude/skills/plan/elephant.md`'s rule: past 450 lines the
  lifecycle-named file is cut to under 400 (the gap keeps bites from trimming
  a few lines at a time), keeping a fixed-size summary of everything built,
  which each bite rewrites rather than appends to, plus an index, one file per
  bite and one for the standing decisions. The skill should start a long run in that shape from
  bite 1, and should record a structural change like this one as a decision
  in the same commit, not leave it to be asked for.
- **Standing constraints travel verbatim, or they stop applying.** The relay
  summary's § 1 carried the operator's rules (never merge, the frozen
  five-percent file, ask only about the unrecoverable) word for word, and the
  plan repeated them. The skill should keep one home for them, the plan, and
  have each relay point at it rather than re-quote it, so a rule the operator
  adds mid-run gets written down once. Where a rule governs a step that runs
  before the plan is read (the attach), it has to travel in the text read
  first; see [pickup-and-relay.md](pickup-and-relay.md).
- **The model is part of the contract, so it is named, never inherited.**
  The operator's default is Sonnet, and a relay's successor or a subagent
  that inherits could land on it, or on whatever the next restart picks.
  They asked mid-run for Opus throughout. The skill should record the
  run's model in the plan and pass it explicitly to every `create_session`
  and `Agent` call, and a cap-depth hand-off should name it in the line it
  gives the operator.
- **The contract counts as the standing answer to the context-budget
  hook.** At 200k the hook says to reach a stopping point, offer `/compact`
  or `/relay`, and "do neither unasked". The bite-4 `/handle` session did
  that, and the operator answered "мы же договороились что идём
  yolo/megabeast, и ты у меня ничего не спрашиваешь". The skill should state
  that at the warning line the session commits, writes a progress file for
  the successor, and relays on its own.

## Operator input mid-run

- **An operator message that changes what is built is a contract change.**
  Bite 1 took five: this file, when to fill it, the 450-line rule restated,
  an ecology twist and a mandala ornament. What held up: quote the message
  into the plan (standing rules, decisions or the rest of the elephant) and
  commit that on its own before touching code again; take into the open bite
  only the cheap slice that fits (the sun became a rosette) and leave the
  rest to later bites. The skill should make that the rule, so a mid-run
  message grows the plan, not the bite. The same holds for a review the
  operator posts on the PR: their first one (5329778719, during bite 6's
  review) asked for an Artifact per bite, atmosphere and a wider meadow. The
  review session folded it into the plan, replied on each thread with that
  commit, and left the code for the bites it named, which is what they asked
  for ("действовать по нему пока не надо").
- **An operator review that asks for a document, not a change, is kept
  verbatim and scheduled.** Mid-handling, the operator posted two game ideas
  and asked for a Russian document on each, weighing them against the code
  and the plan, "не вноси их пока ни в какой план". The ideas went to
  `docs/remove-before-merging/ideas/` verbatim, the plan got only the task
  (bite 9 opens with the documents, and builds only what survives either
  way), and the thread got one reply naming the commit. The skill should
  keep "quote it into the plan" for contract changes and this form for
  ideas still being weighed.
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
- **A question is answered, not treated as a stop.** While bite 4's
  handling ran, the operator asked how to run the game locally and whether
  ecology and the insects were planned. Answering from the plan in chat,
  with the subagents still working, cost two short turns and broke nothing.
  A question is not a contract change, so it goes to the plan only when it
  changes what is built.
- **Operator input lands while an agent holds the code.** The review of
  idea 1 came in with the gates-and-polish agent busy on `src/`; the
  orchestrator answered it (a document under `ideas/`, eight replies, one
  plan line after the agent finished) and the paths never met. The skill
  should let the orchestrator take operator comments inline, pushing with a
  pull-then-push, never waiting. An ask about files an agent already holds
  goes to that agent: a tuft drawn under a planted flower, seen while the
  last agent worked in `tufts.ts`, went to it through `SendMessage` and came
  back as its own commit.
- **"Pause, I'll take it manually" is a relay with a reset depth.** The
  operator stopped the chain at depth 6 for the night and takes it up by
  hand, which starts a new chain at depth 1. The running agent was told to
  hand over, its dirty tree proven equal to its patch and reverse-applied,
  and the relay summary written while its tests ran. The skill should treat
  it as `/relay` with no `create_session`, the successor line handed to the
  operator.
- **An operator watching mid-handling can settle a review's design call by
  playing, so a call that changes how the game feels waits for them.** Bite
  11's review asked for taps only on a lift. The handling decided a lift or
  a 150 ms rest, and explained to the operator why the delay would rarely
  show. The operator, who has played guitar-pedal emulators, answered that
  even 100 ms is felt on an instrument, then played the build and kept the
  press («текущая механика -- норм»). The agent had already committed that
  group's plan bullets, so they were rewritten; it had not briefed the
  agent, so no code was wasted. The skill should hold back the brief for a
  feel call (latency, motion, sound) while the operator is in the session,
  ask them, and brief the groups that don't depend on it meanwhile.
