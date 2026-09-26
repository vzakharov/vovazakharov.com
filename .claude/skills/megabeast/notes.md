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
  grows the plan, not the bite.

## Friction found

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
  fails.
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
  the chain stopped and waited on the operator. At two or three sessions a bite, ten bites cannot run as one
  chain. The skill should count the depth (each relay summary can carry it)
  and plan for it: fold review handling into the next bite's session, take
  more than one bite per session where context allows, or, as the last hop
  before the cap, hand over one line for the operator to paste into a fresh
  session. Where Routines are available, a fresh-session Routine may start a
  new lineage; that is worth trying before depth 7.
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
  threads to one), run one after another on the shared tree, never in
  parallel on one index.
- **A review's open design calls are decided before the brief.** Two
  threads asked the handler to choose. Writing each choice into the plan's
  decisions and committing that first gave the implementing subagent a rule
  to build to, not a question to settle, and the reply could point at it.
- **The Stop hook's git check fires on a subagent's work in progress.**
  Subagents run in the background, so a turn that ends while one works
  leaves its edits uncommitted. The answer is `git status`, a push of
  anything the main session owns, and a stop — committing the subagent's
  half-done files would collide with its own commit.

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
- **Looking at a canvas page needs its own recipe, and now has one.**
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
  default from the start, not as a rescue.
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
- **A pixel constant breaks a proportional layout's resize contract.**
  `EDGE_MARGIN` made bounded sizes not scale with the screen, so flowers
  placed against them moved on a resize. The fix was to place the dependents
  against the layout computed with the margin at 0. The skill's layout
  checklist should ask which quantities are exactly proportional before
  anything keys stable placement off them.
