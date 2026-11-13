# The board package's first brief, 2026-11-12

As sent to the first session on `claude/cube-intro-board`. Where it disagrees with `../contract.md` or with a later brief, the later one holds.

You are the board coordinator of a larger build, and the board is your whole job. This is an autonomous run under the repo's `/carte-blanche` mode (`.claude/skills/carte-blanche/SKILL.md` — read it first, then `docs/plans/cube-intro.in-progress.md`, the lead's plan, for what is being built). The opening-prompt routing in CLAUDE.md does not apply to you: you are already routed, there is no plan to write and no question to put to the operator. Ask the operator nothing, open no PR, never touch `main`, never push to any branch but your own `claude/cube-intro-board`. I am the lead: session `session_01DaohkEr63nSs6fbnbbEpGd`, branch `claude/cube-intro-j2wt34`. You report to me with `mcp__claude-code-remote__send_message` (load it with ToolSearch if it is not in your tool list) and then end your turn; my later messages wake you with the next "add this".

## What the board is

The cube game (`src/cube`, served at /cube) has a design board: YAML under `src/cube-board/app/config/` (`cube.yaml` plus every `*.yaml` in `cube/`, images beside them as `.webp`), built by `pnpm board build src/cube-board/app/config/cube.yaml` into `tmp/board/cube/` and published with the Artifact tool to an existing claude.ai artifact, "Cube board", which the first cube run left at https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3 (confirm with `Artifact` `list`; it must be read with `Artifact` `read` before any publish). `docs/remove-before-merging/cube-intro-j2wt34/facts-island-board.md` § "Part B" on the lead's branch is a fact sheet on the engine: item schema, how an item's file is derived from its geometry, build/sync/refile, and what makes two branches' edits conflict. Read it before touching YAML; where it says "not read", read the code yourself (`src/board/scripts/board.ts`, `scripts/lib/board-file.ts`, `board-files.ts`, `entities/item/model/item.ts`). The first run used the board as a timelapse: a zone of numbered frames, each with a caption, failed attempts included, the operator's verdicts quoted (`cube/beauty.yaml`).

## Why a coordinator exists

Another agent is working on the same game on branch `claude/cube-review-perf` (draft PR #275, a review and speed-up of the cube) and is adding to the same board: four `content:` commits so far (f1fec36d, 825da932, 7136ff81, 8cd2fed3), and presumably publishing the artifact from its branch. Its sessions: `session_01DaohkCiN9dqvTbQitKLW6y` ("Cube review performance") and `session_01DaohkFooQx3YpuSjFHqR59` ("(2) Cube review performance", the newer one — find which is live with `get_session` / `list_events`). The operator's instruction to me, verbatim:

> над кубиком сейчас работает другой агент по рефакторингу (см. #275), и он занял борду. Заведи отдельную подсессию, единственной целью которой будет координировать работу с тем и черипикать борду с той ветки так, чтобы у нас потом получился линейный таймлапс в результате. То есть ты ей будешь передавать типа "добавь вот это и это", а администрирование механику будет обеспечивать она.

So: one line of board history across the two branches, and a published board that only ever grows — never a publish from one branch that drops the other's items. The mechanics are yours to design and run. What I would start from, for you to improve: every board change, theirs or ours, is a commit that touches only `src/cube-board`; you cherry-pick theirs onto `claude/cube-intro-board` in the order they landed (dropping the `.claude/costs/` row each of their commits carries), put ours on top, and publish only from a tree that holds both; you agree with the other session, by `send_message`, who publishes when and how each side learns of the other's new commits (it is a peer with its own task and operator instructions: propose, do not order, keep your messages short and self-contained, and adapt if it declines). Never push to their branch; if they want our board commits, they take them from yours.

## What you put on the board for this run

A new zone for the intro, in a new file with new image files so it cannot conflict textually with their appends, placed clear of every existing and their newly added zone (the fact sheet lists their geometry). Author stamp `agent:cube-intro`. Items in English, the operator's own words quoted in Russian where they are the point. First contents:

- The premise, as stickies, from the brief in the plan: you wake on a tiny sand island, the cube hangs in the air — 5×5×5 m, black with grey bands each half the remaining height — a doorway in the top band with an ordinary ladder leaning to it; a look under the cube shows nothing holds it; up the ladder into floor 1's room, lit by the low sun through the doorway; the lever becomes a pill on a shelf ("Press Y to drink, N to put down" the first time).
- The three staging decisions from the plan's "Design decisions" (the doorway faces the sun and the player wakes between them; the cube hovers about 1 m so its shadow lies apart and the sand under it is lit; eternal golden hour).
- A pointer to the island board's inspiration item (`web-ocean`: "Inspiration: Noniv/web-ocean — what a browser can do with sea and sky. Nothing copied.") and the operator's line that this island will one day be in the same ocean as the island game's world.
- An empty, titled row for timelapse frames, which I will feed you.

Frames and later additions reach you through git: I commit images under `docs/remove-before-merging/cube-intro-j2wt34/frames/` on my branch and send you a message naming the files and their captions; you `git fetch origin claude/cube-intro-j2wt34`, take the files (convert to `.webp`, sized like the existing frames), add the items, build, publish, push. I merge your branch into mine from time to time, so keep it to board-only commits that merge cleanly.

## First task, and what ends it

1. Read the above. 2. Reach the other branch's live session and agree the protocol. 3. Build the intro zone, cherry-pick their four commits under it, build, publish. 4. Send me one message: the protocol agreed (or what they said), your branch head, the artifact URL and that the publish held both sides' items, and anything you need from me. If the other session does not answer within a reasonable wait, do steps 3–4 on the protocol you proposed and say so. Then end your turn.

House rules that bite here: commit subjects use the repo's prefixes (`content:` for board items); files are read and edited with Read/Edit/Write, not cat/sed; dev artifacts go under gitignored `tmp/`; push every step that passes.
