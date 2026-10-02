# The play run and frames

- **The play run's cost can outgrow the build, and then the operator's own
  hands replace it.** By bite 12 the play agents, the five-screen run and
  their fixes to the harness cost more time and tokens than the game code
  they checked, and the operator stopped them («эти прогоны занимают больше
  времени (и токенов) чем собственно написание игры»): each package now
  ends at its unit tests and adds what a person should look at to a
  standing `to-check.md`, carried across sessions and checked whenever he
  gets to it. The skill should weigh the run against the build it guards
  from the start, and offer the hand checklist as the default once a
  playable Artifact exists, keeping the scripted run for regressions a
  person cannot see (a page error, a frame budget). The line he drew is
  the scenario, not the looking: a screenshot checked by eye stays, a
  scripted multi-step play does not («что-то оставить можно — типа там,
  сделать скриншот, посмотреть на глаз — но не трёхэтажные сценарии»).

## The play script

- **Looking at a canvas page needs its own recipe, committed as a script,
  written with the page.** `pnpm play:mushrooms`
  (`scripts/play-mushrooms.ts`, `scripts/lib/cdp.ts`) builds a probe
  export, serves it, drives Chromium over the DevTools protocol with Node's
  own `WebSocket` — no Playwright, as `/preview` keeps none — steps the
  sleeping loop, taps every control on every screen, checks the state after
  each tap and fails on any page error. Every session before it rewrote the
  recipe from a relay summary, and the one bug that shipped (every tap
  dead) passed vet. The skill should have bite 1 write the play script with
  the page and every bite extend it with its own controls.
- **Step the simulation; never time a screenshot.** One screenshot of the
  canvas takes ~1 s under swiftshader, so a shot "90 ms after a tap" shows
  the scene a second later, and bite 2's review nearly reported the bloom as
  broken. What works: expose the game (`window.__game`), `loop.sleep()`,
  drive `step(t, 1000 / 60)` on a clock the script advances, and shoot
  between steps. The game should ship a dev-only hook for it rather than a
  line each session adds and reverts.
- **Render only what it shoots, and split the build from the run.** With
  the house the run took ~8 minutes, near the tool's ten-minute ceiling,
  most of it the probe build: `NEXT_PUBLIC_MUSHROOM_PROBE=1 pnpm build:vova`
  and then `pnpm play:mushrooms --no-build` as two foreground calls keep each
  well inside. Bite 5's scene agent had each probe `step` draw only its last
  frame, and the run fell to ~2.5 minutes: under a software renderer the
  drawing, not the simulation, was the cost.
- **Seed `Math.random` in the recipe.** An init script that swaps it for a
  seeded generator fixes the visit seed, so a frame before a fix and one
  after it show the same meadow and differ only by the fix.
- **Tap, not only look, and after the last source commit.** A frame agent's
  first run found five visual issues; its reshoot, once selection gave taps
  a consequence, found the real bug — the back clump mushroom answered taps
  only at its left edge, under the front one's bounding box. Bite 3 then
  shipped with no tap working at all: its fix came after the last frames,
  passed a hit-area object Phaser reads as a config, and every tap threw —
  vet green, PR body describing a working selection; only the review's
  frame agent, collecting `pageerror`, saw it. The recipe should drive every
  control and read the resulting state (`scene.meadow`), a bite that changes
  what a tap means re-tests every tap area, the last frame run follows the
  bite's last source commit, and any page error fails it.
- **Read the runtime state beside each shot — drawn sizes, not model
  state.** `voice.context.state` through `page.evaluate` (`running` →
  `suspended` → `running`) confirmed the mute fix in the same run as the
  frames; reading `head.scaleX` showed a tap had landed; the mouse's drawn
  size read 27.4 px against a 28 px floor the model held at rest
  ([quality.md](quality.md), "narrowest pose"). The container has no Pillow,
  so a pixel check reads the page's own state through the probe, not the
  image.
- **Sound is reviewed by rendering it.** An `OfflineAudioContext` render in
  the probe build's Chromium, then an FFT, showed four drums with ~0% energy
  above 300 Hz (silent on a phone speaker) and a hat 26 dB under a note,
  where every spec-level test passed. The script should render each sound
  the way it shoots each screen, and the review brief ask for level above
  ~300 Hz and relative loudness per sound.
- **The run reports a render-frame budget.** Bite 7's spec marked every
  backdrop layer "(d) Static, painted once per resize: free", but a Phaser
  `Graphics` replays and re-tessellates its whole command list every render:
  2.3× bite 6's draw commands, a rendered frame from 13 to 31 ms, the play
  run from minutes to ~20 — and nobody asked why until the review, whose
  reader found the cause in Phaser's renderer and whose player confirmed it
  by hiding layers and timing frames. The play run should report a
  render-frame median per screen and fail past a budget, so a look bite's
  cost shows in its own tail. A spec's cost column is a claim to measure.

## Frames

- **Frames catch what code reads past, so one reshoot per bite is the
  default.** Bite 2's flower heads too small for their stems and a spore
  puff pale on pale both read fine in code and were obvious in the first
  frame.
- **Put the reference next to the frame.** The stems were too short against
  Syama's drawing, and no review comment said so until the frame sat beside
  `syama-drawing.webp`. Every look at a frame is side by side with what it is
  judged against.
- **The operator looks in between bites through committed frames.** They
  asked for them in `docs/remove-before-merging/` rather than `tmp/`, the
  ones worth showing picked at each bite's end. The bite's tail includes
  "pick and commit the frames" beside `/polish`.
- **The orchestrator looks at frames itself, however green the reports.**
  Agents report on what they were asked about; the orchestrator's own look
  catches what sits between briefs. Bite 5's drink met every number while
  its proboscis unrolled upward, away from the flower, plain only in the
  close crop. Bite 6's frames agent reported the sun as "matches the 80% the
  fix aims for" while the frame showed it cut by a straight line in open sky
  — a test asserting a share of something visible passes on a visible
  fault, and the fix's test asserted the shape instead (no flat run in the
  hill line). Bite 7's ink group met its contrast bar by giving dark fills a
  lighter blue edge, which another group's frame showed as a lavender ring
  round the bee's head; its two parallel groups both reported "not gloomy,
  reads at a glance" and were both right, and two frames still showed a
  ruler-straight ground seam, a grey-teal smear by the sun and flat stems,
  each at a seam between the groups. So the skill should:
  - put every group's after-frame, and two frames per bite (one per
    orientation), in front of the orchestrator before replies or relay;
  - open every review with the orchestrator reading the bite's committed
    frames and briefing what it sees as sweep targets before the agents
    start. Bite 7's review named the shine over a spot and a slanted plank
    foot in minutes (then measured at 73–83% of caps and 18–25 px); bite
    8's saw six things, and the agents turned five into numbers and causes
    and ranked the sixth as a hunch.
  - **treat a fault an agent attributes to another package as the
    orchestrator's to dispatch, then and there.** Bite 11's play agent
    reported the far hill cut into a flat-topped cliff beside the sun on
    phoneP as "package 4's bake, not mine" — true, and package 4's agent
    was long gone, so nobody owned it until the orchestrator opened the
    frame and briefed a fix before `/polish`. A report's "not mine" list is
    a work queue, not a disclaimer.
- **The play run is one screen per call.** Bite 11's run took ~8.5 min a
  screen once the probe converted through the crop, so all five in one
  call pass the tool's 10-minute ceiling; brief it per screen from the
  start. Run the screens one after another, never side by side: the frame
  budget is a median frame time, and parallel Chromium on four cores fails
  it falsely.
- **A play check's room comes from the screen, not from the middle.** The
  held-arrow check expected full cruise from the opening crop, but a
  sideways phone pans ~200 px and the key's ease-in needs ~105 px ahead, so
  phoneL went red against a game braking correctly (fixed in
  `play-pan-keys.ts` by starting from the far end). A check of motion
  should derive its starting point from the range the screen has.
- **Republishing the Artifact from a fresh session needs a read of the
  live version first.** The publish is refused until the live source has
  been read with the Read tool; a shell diff does not count. Its shell
  differs from the build only by the publish wrapper and the old bundle, so
  reading lines 1–17 and 19 onward settles it.
- **The operator's own play finds what the play run's frames miss, and
  its fixes get measured before they are built.** Bite 12's operator,
  playing mid-bite, saw sinking read as burying, a far flower riding up
  and down through a straight brow as he turned, and a flat slab across
  the hills at a few headings — none flagged by green plays. The fix
  agent's first step was a trace, and it found the plan's description of
  the code wrong (the sink keyed on depth along the heading, the option
  the plan had recorded as beaten). Brief a fix from a play report as
  "measure the cause, stop if it differs", and sweep headings in small
  steps (720) for anything that shows "at some turns but not others".
- **A play's own shortcuts show up in its measures.** Bite 12's `veer` play
  set the heading in one frame (`face()`) and counted every insect drawn
  across it as a 90 px jump; all 17 "jumps" on tabL were that or the
  fly's designed dash. A trace at node level, with the eye moved only as
  a held key moves it, cleared the game in one agent. A play that
  teleports the eye, the clock or a creature breaks its per-frame records
  there.
