# Relay 3 — island bite 1, the thinnest descent

## Standing constraints

- The island's own plan, `docs/plans/world-game-zoltan-syama.in-progress.md`
  (on the base branch), is the lead's, claimed by the lead's session: this bite
  never edits it, and its standing constraints hold here (among them: the
  private repo the memo tooling is ported from is never named anywhere; only the
  lead edits or publishes the board artifact — members propose through memo).
- This session is the **member** of the lead/member pair: talk to the lead with
  `python3 scripts/memo/memo.py post --as member "<text>"` (`show` reads the
  thread). A post can hang for minutes: run it with `run_in_background`.
- **Integrate with `git fetch origin <b> && git merge origin/<b>`, never
  `git pull`** (the lead: "never `git pull` (postmortem 58d77315f on the lead's
  branch)"). The lead pushes memo commits to this branch, so a push can be
  rejected: fetch and merge, then push again.
- The muthur sync offer was made; do not make it again.

## The conversation

1. **Operator:**
   `/relay take island/bite-1-descent — свет, швы, отсечение и сглаженный берег в ветке, остались кадры с головы, полоса мелководья и хвост с новым PR`
   - **Agent:** attached, resumed the paused plan; a play run of 9a5f3cd0 (coast
     clean at 1 000 km, snow seams gone, 100 m / 2 m good; orbit dashes and a
     soft 10 km remained); wrote the shallow band (43e80f0b); asked the lead the
     10 km call; a diagnostic build traced the dashes to the skirts' colour
     heights and the fix (79b6cdde) removed them; answered, through the lead, the
     operator's question on the inland lakes (they are land: `Coast` is outer
     rings only and the contract puts lakes out of the bite; asked the lead
     whether to bring them in now); committed fresh frames (15854783); paused at
     the context budget. (verbatim in Last agent turn)

The operator wrote nothing else in this session; their lakes question reached it
through the lead's memo (4ecf314e).

## Intent

`/island` opens on the island Zoltan and Syama drew, seen from orbit, and the
eye falls continuously to 2 m, plain-looking at every height. Contract:
`docs/plans/world-game-zoltan-syama/bite-1.md`. Out of the bite by contract:
clouds, bird, walker, rivers and lakes, forests, sea glitter and sky, towns —
unless the lead now pulls the lakes in. Scale stays as call 1 sets it.

## Decisions

- **One colour ramp for land and sea** (`GROUND_STOPS` in
  `src/island/pages/island/lib/land-colour.ts`, renamed from `LAND_STOPS`):
  below 0 it runs deep `SEA_COLOUR` at −1 500 m → −250 → −40 → turquoise at −6 →
  sand at 0. The sea tile carries the floor's heights (`FilledTile.floor`, from
  the worker) as its `height` attribute and is coloured on the same ramp, lifted
  by `WATERLINE_LIFT` (land vs sea irradiance plus sky) over the last 6 m, so
  the waterline has no step. Beat the depth-texture route (reads 0 on WebGL 2).
  The globe outside the tiles has its own flat `ocean` material. From orbit
  the shelf is only a one-pixel rim, because the floor drops ~100 m within a
  kilometre and an orbit pixel is ~12 km.
- **Every skirt is coloured by its border's height** (`colourHeights`, one
  function for land and sea): the dashes were the skirts' own depth showing
  through hairline gaps. Beat lighting the underwater land like the sea (the
  dashes were grey in both colour schemes, so colour ramp was not the cause).
- **10 km**: recommended `TILE_GRID` 65 over `SPLIT_RATIO` 0.5, as reselect cost
  scales with tile count; the lead's call, not yet answered.

## Errors and dead ends

- First guess at the dashes (the underwater land floor's ramp colour) was wrong:
  the run with the new ramp left them identical and grey.
- A scratch diagnostic build failed once on a missing `select` import; rebuilt.

## State

- **Branch:** `island/bite-1-descent`, pushed, head 0bfa05fd plus this summary's
  commit.
- **PR:** none open; #256 closed as merged by accident. The new one goes from
  this branch onto `claude/world-game-zoltan-syama-hodowq` (PR #255, the
  island's, open draft).
- **Plan:** `docs/plans/island-bite-1.paused.md`, § "Rest of the bite": the
  lead's two answers, the recorded orbit-spits note, the tail.
- **Frames:** `frames/` at 15854783 are the fixed head's.
- **Waiting:** the lead's memo replies on 10 km and on the lakes. Nothing else
  runs; the keepalive is stopped.
- **Estimate:** this session 3 h senior graphics-programmer + 1 h middle qa.
  Remainder handed on: 1 h senior graphics-programmer ("10 km's tile density,
  whichever the lead picks, is a rendering budget call"), 1 h senior producer
  ("the lead's answers and the tail: polish, vet, the new PR, frames to the
  lead"); the lakes, if the lead pulls them in, are new scope to size then.

## Pointers

- `docs/plans/island-bite-1.paused.md` — the plan, done and left.
- `docs/plans/world-game-zoltan-syama/bite-1.md` — the contract.
- `docs/remove-before-merging/island/bite-1-descent/notes/r4b.md` — the play run
  recipe (`git archive -o` + `tar -x` into the scratchpad, `pnpm install
--offline`, `NEXT_PUBLIC_SITE=vova npx next build` from `sites/vova`, then
  `pnpm play:island --no-build --out <dir>`; ~15 min, in the background).
- `relay-1.md`, `relay-2.md` beside this file — the earlier sessions.
- This session's transcript:
  https://claude.ai/code/session_01DaohkBCYk67o4i5xZPwvZ7

## Next step

Resume the paused plan (`/go` from Step 1 on
`docs/plans/island-bite-1.paused.md`): read the memo thread for the lead's
answers on 10 km and on the lakes, do what the lead picks, then the tail
(`/polish`, `VET_MEADOW=1 ./scripts/vet.sh`, a new PR onto
`claude/world-game-zoltan-syama-hodowq`, frames to the lead through memo).

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
I've posted the answer to the lead. The play run with both fixes is still going, and once it's done I'll commit the frames.
```
