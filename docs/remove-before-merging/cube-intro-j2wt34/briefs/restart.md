# Taking over a package: what every successor session reads first

You are a child session of a larger build run under this repo's `/carte-blanche` mode, and you are **taking over a package from a session that a usage limit stopped on 2026-11-12 at 23:12Z and that will not come back**. Its work is the branch you were started on, `claude/cube-intro-<name>`, as pushed. Its last commit is `wip:` and may be red; its body says what was red.

## Read, in this order

1. `.claude/skills/carte-blanche/SKILL.md` § "The team" — you are a child.
2. `../contract.md` whole: what is being built, the rules every package holds to, the world frame, the seam.
3. `<name>.md` in this directory: your package's first brief — what you own and what done looks like.
4. Your entry in `../pause.md`: where your predecessor stopped, in its own words, condensed.
5. `src/cube/CLAUDE.md`: the world's four rules, which outlive this run.
6. Your branch itself: `git log --oneline -20`, and `git diff origin/claude/cube-intro-j2wt34...HEAD --stat`.

Where they disagree, the order of authority is: the message that started you, then `contract.md`, then the first brief. The first briefs were written before several of the operator's decisions; the contract has them all.

## What changed since the first briefs were written

- **Nothing authored** (ruled 2026-11-13, after this file's first version said "no textures" outright): no image drawn by hand, shipped or stored; a map the GPU computes at run time from formulas — the sea's FFT wave fields, a sky map rendered from the sky's function — is allowed. `skyRadiance(dir, lod)` is the seam's signature either way; outdoor group 0 is the frame block alone today.
- **Every random number is rolled** — `roll` / `rollWith` from `@/dice/shared/roll`, in TS, under a named path. A shader's per-pixel noise goes through the kit's hash, salted by a rolled value.
- **Nothing remembers earlier frames**, and nothing the player does marks the world: no footprints, no wake, no accumulated foam.
- **No look-under scene.** The scenes are the waking and the climb.
- **The ladder is there until climbed, then absent**; a game that starts inside has none. The frame carries the flag: TS `ladderGone` on the outdoor frame (absent or false — the ladder stands), WGSL `frame.state.x` = 1 while it stands. `walk` writes it; `shell` reads it for the ladder and its shadow.
- **Out through the doorway by stepping off the sill**: a 3.6 m fall to the sand, unhurt, at full or half height. No way back in, and nobody climbs down.
- **The pill's prompt** is "Press Y to swallow, N to put down". The shelf holds a pill for whoever comes next; nothing stores "taken".
- **The sun**: elevation 9°, azimuth +x turned 31° toward −z.

## Where the tree stands

- The lead's branch `claude/cube-intro-j2wt34` holds core's step 2: the page draws the outside as layers — sky, sand, shell, then the rooms, then the sea — from an eye that is inside (`Pose`) or outside (`Outside`), through a lens of its own. Sand's layer is the real one there; sky, shell and sea are core's stand-ins (`src/cube/pages/cube/ui/<name>-layer.ts`, `src/cube/pages/cube/lib/<name>-shader.ts`), each to be replaced by its owner. Layers register in `pages/cube/ui/outdoors.ts` (`MAKERS`) and `pages/cube/lib/outdoor-shaders.ts` (`OUTDOOR_SHADERS`); the layer shape is in `pages/cube/ui/outdoor-layer.ts`.
- `claude/cube-intro-core` is one step ahead of the lead: the sky map is out of the seam and the ladder's flag is in the frame. **Merge `origin/claude/cube-intro-core` rather than the lead's branch** unless your message says otherwise — it contains the lead's, and the lead takes it within the hour.
- Merge with `git fetch origin <branch> && git merge origin/<branch>`, never `pull`. A peer's branch is read-only to you: merge from it, never push to it. Push only your own branch.

## Shooting a frame

Once core's step 2 is in your tree:

```
pnpm outside:cube --out <absolute dir>            # six named eyes, about two minutes
pnpm outside:cube --eyes wake-sea,wake-cube       # some of them
pnpm outside:cube --at -23,1.6,23 --yaw 135 --pitch -5 --roll 0 --name mine
pnpm outside:cube --exposure 0.3 --eyelids 1      # the lens, on any of the above
```

The eyes are `wake-sea`, `wake-cube`, `under`, `ladder-foot`, `doorway-out`, `room-doorway`; `--at` is world metres (x east, y up from the still sea, z south, the cube's middle over the origin), `--yaw` degrees from east toward south. One `next dev` per checkout. Frames go to gitignored `tmp/`; **look at them** with the Read tool, and commit the ones worth keeping as `.webp` under `../frames/<name>/`, each under 300 KB. A package is not done when it compiles: it is done when its frames stand beside a photograph.

## Gates

Before any report that calls something done: `pnpm typecheck`, `pnpm shaders:cube`, `pnpm lint:files <the directories you touched>`, `pnpm test <your test files>`, `pnpm type-overlap`, `pnpm check:masd`, `pnpm masd:clusters`, `pnpm check:cycles`, `pnpm exec prettier --check <your files>`. No lint-suppression comment, ever; no `interface`; no text file over 400 lines. Files are read and changed with Read, Edit and Write, not `cat` or `sed`.

## How you work and report

- The opening-prompt routing in the root `CLAUDE.md` does not apply to you: you are already routed. Write no plan file, ask the operator nothing, open no PR, publish no preview, never touch `main`, start no child sessions of your own.
- **Your chat text is English**, whatever the operator-voice hook prints at your start: status lines, end-of-turn summaries, everything said in your own session. English costs about a third fewer tokens. When the operator himself asks you something in Russian, answer that message in Russian, then go back to English.
- A read-only chore handed to a subagent (digesting a log, finding callers) names `model: "haiku"` or `"sonnet"`; the flagship is for building.
- `wip:`-commit and push every few files; a container can vanish without warning, and yesterday's did.
- The lead is session `session_01DaohkEr63nSs6fbnbbEpGd`, branch `claude/cube-intro-j2wt34`. Report with `mcp__claude-code-remote__send_message` (ToolSearch loads it): your branch and head, what is green, what you saw in your frames, what is left, what you need changed outside your files. **Report the first time your first job is pushed**, and again whenever there is something worth looking at; then carry on with whatever does not wait on an answer. When nothing is left that you can do, end your turn — the lead's next message wakes you.
- Messages between sessions can arrive late. A report stands alone: never "as I said before".
