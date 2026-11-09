# Relay 1 — bite 3 member, after step B's first wave

## Standing constraints

From the launch prompt (the lead's, via `/from-branch`): «Talk to the lead only
through `scripts/memo/memo.py --as member`. No plan cycle: the contract is the
plan.» The lead's brief (memo 03:59): «Your PR targets island/stretch-2, never
main.» «Model on every create_session and Agent call: claude-opus-5-5.» «The
board is mine; propose changes through memo.»

## The conversation

1. **Launch (operator-side, the lead's prompt):** `/from-branch island/round-world You are the member building bite 3 of the island mammoth. Read the lead's brief in this branch's memo (python3 scripts/memo/memo.py show --branch island/round-world) and the contract docs/plans/world-game-zoltan-syama/bite-3.md, then build it. Talk to the lead only through scripts/memo/memo.py --as member. No plan cycle: the contract is the plan.`
   - Agent: already on the branch; read brief and contract; set the estimate;
     wrote `bite-3/brief-common.md` and `bite-3/build.md`; orchestrated agents A,
     map, B1, A2, B2, B3, B5, B6, B6-tail; merged each; posted to memo at each
     step; relayed at the context budget after the wave.
     (verbatim in Last agent turn)

No other operator message was sent; everything else came through memo from the
lead (below) and agent hand-backs.

## Intent

Build bite 3 per its contract: land as one spherical-harmonic field over the
whole sphere (L = 511), a typed `roll` schema with path-keyed hashing, cube-
sphere tiles, the eye on the sphere, #1 re-fitted and pinned, Earth as #0 with
its envelope driving random worlds; frames per "Done when"; then `/polish`,
`/sync-branch` against `island/stretch-2`, vet green, ping the lead in memo.

## Decisions

All settled calls live in `docs/plans/world-game-zoltan-syama/bite-3/build.md`
(R1–R8 step A, S1–S9 step B) — read it rather than this list. The lead's
rulings arriving by memo, already folded there:

- d = bite 2's B7 true distance (lead 04:02), not `f/|∇f|`.
- Package search before `roll` (contract change, call 3): nothing fits (R2a).
- Call 12 (lead 04:34, Vova: «пока пусть будет режим полнолуния…»): full-moon
  light, sun fixed, moon opposite, time keys — replaced the sun-turned-with-eye
  (S4). Goes in B7.
- Call 13 (lead 04:35, Vova: «вверх-вниз это не подъём/спуск, а "посмотреть
  вверх/посмотреть вниз"…»): ↑/↓ look, E/Q climb/descend (S7) — a step on the
  sphere eye before B7.
- Step A frame accepted by the lead («real planets; on the board now»); the
  √2-in-harmonic landmass difference is left for step C's Earth envelope.

## Errors and dead ends

- Agents briefed with "build + frame" ran out before the frame (A, B2, B6) —
  successors finished from notes. Brief one step each.
- `memo.py post` with a long inline argument prints a hint and still posts;
  piping stdin (`-`) can hang past 120 s — run it as a background Bash task.
- A `TileKey = GridCell` alias fails `vova/no-redundant-type-alias`; the planar
  tiles now read `GridCell` directly.

## State

- Branch `island/round-world`, head 15e70d421 (pushed). No PR yet (it will
  target `island/stretch-2`). No plan file of the `*.in-progress.md` kind; the
  contract plus `build.md` are the plan.
- Landed: A, B1, B2, B3, B5, B6 (+ tail). Nothing running; no scheduled
  check-ins pending.
- Red: `pnpm type-overlap` (three pairs from B2: `distance` CoastField vs
  SignedDistances, `distance` BuildTimes vs scene's Distant, `seed` SphereWorld
  vs kernel's Seeded); knip on world-barrel exports nothing reads yet; B2's
  frame `notes/b3-b2-field.png` not drawn. `tsc` clean.
- Estimate: this session 16 h senior graphics-programmer + 6 h senior
  technical-artist + 5 h senior gameplay-programmer + 10 h middle developer +
  4 h senior producer. Remainder handed on: 24 h senior graphics-programmer
  ("B4 height and fill on the sphere, B7's switch and the full-moon light, B8's
  seam frames need rendering depth"), 10 h senior technical-artist ("Earth's
  fit from Natural Earth and the envelope measured for random worlds"), 7 h
  senior gameplay-programmer ("call 13's look and time keys in the eye and
  hook"), 6 h middle developer ("the gate fixes, Earth's pinned row and the
  Done table's tests"), 4 h senior producer ("orchestrating the remaining waves
  and the tail with the lead").

## Pointers

- `docs/plans/world-game-zoltan-syama/bite-3.md` — the contract (calls 1–13).
- `docs/plans/world-game-zoltan-syama/bite-3/build.md` — settled calls and §
  "Where the bite stands" (the hand-over's spine).
- `docs/plans/world-game-zoltan-syama/bite-3/brief-common.md` — every agent's
  shared brief.
- `docs/plans/world-game-zoltan-syama/bite-3/notes/b3-*.md` — each step's API
  and numbers; `b3-map.md` § 3 is step B's cut (B4, B7, B8 still to build).
- `.claude/skills/mammoth/notes/subagents.md` — orchestration lessons.
- `python3 scripts/memo/memo.py show --branch island/round-world` — the lead
  thread (14+ notes).
- This session: https://claude.ai/code/session_01DaohkBg4xmo4kUboLzwnL1

## Next step

Continue as the bite-3 member: first one small agent for the red gates (B2's
three type-overlap pairs) and B2's field frame; then S7 (call 13's look on the
sphere eye) ∥ B4 (height and fill on the sphere, on B3's `CubeCell`); then B7
(the switch, with call 12's full-moon light and time keys), B8 (retire the
plane, film the face-edge and pole seams), step C (Earth from Natural Earth,
envelope, #2–#6 under both envelopes, the 20-world table), then the tail per
the contract's "Done when". Post to the lead in memo at each step's frame.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Хвост B6 работает: он запушил первый коммит и занял 119 тыс. токенов контекста, так что ему ещё есть куда расти. Жду его отчёта, потом вливаю ветку и передаю сессию через `/relay`.
```
