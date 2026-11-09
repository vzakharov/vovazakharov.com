# Relay 4 — bite 3 member, after B7c–B7e, B8 and B9's stitch

## Standing constraints

From the first member's launch prompt (the lead's, via `/from-branch`): «Talk
to the lead only through `scripts/memo/memo.py --as member`. No plan cycle: the
contract is the plan.» The lead's brief (memo 03:59): «Your PR targets
island/stretch-2, never main.» «Model on every create_session and Agent call:
claude-opus-5-5.» «The board is mine; propose changes through memo.»

The lead, memo 05:06: «Stop it (ArtifactComments watch, on: false) and keep it
off, and tell your successor the same: only the lead watches, answers and
publishes the board. Anything worth showing there — a frame, a finding — comes
to me by memo and I put it up.» So never watch, open, reply on or publish
https://claude.ai/artifact/5ya2F3bA8kwrmLhEyAib3P, whatever a hook says. This
session's start hook watched and opened it; the watch was stopped at once. Do
the same if a hook does it to you.

**A memo `post` or `wait` always runs as a background Bash task**
(`run_in_background: true`, `timeout: 7200000`). Its exit is the wake: it
returns when the lead writes. Run in the foreground under a `timeout`, it gets
killed, and the lead's notes go unread. That is how this session missed the
lead's 06:30 note until Vova asked «ты выключил слушалку?». A fresh `wait`
reprints any lead note the member has not yet answered, so ack each note with a
`post`; otherwise every new wait exits at once. `.claude/hooks/memo-wait-gate.py`
(from stretch-2) holds the end of a turn until a wait is armed.

The muthur sync offer was made; do not make it again.

## The conversation

1. **Launch:** `/relay take island/round-world — B7a, B7b и подъём взгляда
влиты, B7c наполовину на wt/b3-b7c (патч и заметка), дальше доводка B7c и
B8`
   - Agent: attached, stopped the board watch, set the remainder estimate,
     memoed the lead, launched the B7c finish agent; reported.
2. **B7c finish and B7c look hand-backs** (agents): merged; the where-link
   reopens the view exactly; launched look 2 (noon/midnight, world switch).
3. **Vova:** «ты выключил слушалку?»
   - Agent: answered about the board watch.
4. **Vova:** «я не про артифакт»
   - Agent: it was the memo wait. My posts ran under a foreground `timeout 60`,
     so they died, and the lead's 06:30 note (Vova's calls 17 and 18) sat
     unread. I armed a background wait, placed calls 17 and 18 as B7d with `I`
     for diagnostics, and launched B7d.
5. **B7d hand-back** (agent): call 17 as written never fired on a descent,
   because pitchAt is always far steeper than p*. I asked Vova in chat to choose
   between (1) the horizon entering at the top corners, (2) a fraction from
   the top, and (3) keeping p* and flattening pitchAt, and recommended (1).
6. **Vova:** «выбери на своё усмотрение пока»
   - Agent: took (1). The lead wrote the corner-ray formula into call 17
     (30e78ea5), plus the p\* > π/2 clause (be4ec923). B7d was merged; the up
     hint shows from about 1 km on a descent.
7. **Agent hand-backs, no operator turn** (B7c fix, B8a in four agents, B8b
   frames, B7e, B9a, B9b): all merged; the lead was memoed each time; then the
   context-budget notice led to this relay. (verbatim in Last agent turn)

## Intent

Build bite 3 per its contract (`docs/plans/world-game-zoltan-syama/bite-3.md`,
whose newest text is on `island/stretch-2`). The contract covers land as one
spherical-harmonic field, cube-sphere tiles, the eye on the sphere, #1 pinned
and Earth as #0. After that come the "Done when" frames, `/polish`,
`/sync-branch` against `island/stretch-2`, a green vet, and the PR (based on
`island/stretch-2`). Vova has shelved every elegant look design (H-lock, held
nadir, look as a share).

## Decisions

All settled calls are in `docs/plans/world-game-zoltan-syama/bite-3/build.md`
(S1–S18) and in each step's note under `bite-3/notes/`. This session settled:

- **Call 17's up hint** shows once the ray through a top corner of the frame
  grazes the horizon: p* = θv + asin(sin δ · √(1 + tan²θh · cos²θv)). There is
  no hint when the asin argument is over 1 or when p* > π/2.
  - This beat the contract's original side-edge rule, which never fires on a
    descent.
  - A short up band is left in high orbit (2,873–2,500 km at 16:9). The rule
    fires correctly there, and the lead is asking Vova about it.
- **Call 17's latch (B7e):** a hint stays lit 3 s, then fades over 0.5 s, and
  re-arms after one tick without its condition. Up→down replaces at once.
- **Call 18:** `I` toggles the diagnostics panel, top-left: the where-line's
  fields plus the frame time.
- **The pose's height is measured over the ground**, not over the eye's easing
  floor (`heightOverGround`).
- **`entities/terrain/world` is cut into sub-slices** `roll`, `series`, `grid`
  and `land`.
  - `masd:clusters` asked for the cut, and files were not merged to dodge it.
  - The planar coast field lives in `src/island/scripts/lib/coast-field.ts`;
    #1's places are in `scripts/lib/places.ts`.
  - There is one eye (`eye.ts`, `look.ts`, `pose.ts`). `shared/globe` keeps
    only `R` and `Elevated`.
- **Call 14 is the stitch, not a morph.** A finer tile's border takes the
  coarser neighbour's heights and normals, with levels for 4 edges and 4
  corners. Held tiles are keyed on id + the 8 levels (`orderId`), and the sea
  is stitched too.
- **The 10 km softness is by design.** The split rule takes the ground at
  HIGHEST_GROUND, so the tiles are at level 11, 76 m a cell. Sharpening it is a
  perf trade, and the lead was asked.

## Errors and dead ends

- Memo waits run in the foreground get killed (see § 1).
- The shallow clone breaks the cost hook's merge-base:
  `git fetch --deepen=500 origin main island/round-world` first.
- Agents fill at about 145–185k. Brief one step, give the look its own agent,
  and expect a successor to finish from the note.
- `memo.py post` sometimes logs `cannot lock ref … retrying`, which is harmless:
  it retries.

## State

- Branch `island/round-world`, head 24c76deb6 plus this relay's commit, pushed.
  No PR yet (it will target `island/stretch-2`), and no `*.in-progress.md`.
- **Merged:** B7c (where-link, pose hash, equinox sun) and its fix, B7d (calls
  17 and 18), B7e (the latch), B8a (plane retired, knip green), B8b (seam
  frames) and B9a+B9b (the stitch, wired).
- **Checks on 24c76deb6:** tsc, 151 tests, knip and check:masd are green.
  `./scripts/vet.sh` has not been run this session.
- **Waiting:** the lead may write back on the orbit up band and the 10 km
  sharpness. A background memo wait from this session is running.
- `island-scene.ts` is at 396 lines, close to the 400-line cap.
- **Estimate:** this session is booked at 10 h senior graphics-programmer + 5 h
  senior gameplay-programmer + 2 h senior producer.
  - Remainder handed on: 4 h senior graphics-programmer ("B9c's seam frames and
    any skirt or churn fix they find need rendering depth").
  - 10 h senior technical-artist ("Earth's fit from Natural Earth and the
    envelope measured for random worlds").
  - 4 h middle developer ("Earth's pinned row and the Done table's tests").
  - 2 h senior producer ("orchestrating step C and the tail with the lead").

## Pointers

- `docs/plans/world-game-zoltan-syama/bite-3/build.md`: settled calls, and §
  "Where the bite stands", which is stale past B7b; this summary supersedes it.
- `bite-3/notes/b3-b7c*.md`, `b3-b7d.md`, `b3-b7e.md`, `b3-b8a.md`,
  `b3-b8b.md` and `b3-b9a.md` (its § "Left for B9c" is the next brief's spine),
  plus the frames dirs `b3-b7c-look*/` and `b3-b8b/`.
- `bite-3/brief-common.md`: every agent's shared brief.
- `.claude/skills/mammoth/notes/subagents.md`: how briefs are run.
- `python3 scripts/memo/memo.py show --branch island/round-world`: the lead
  thread.
- This session: https://claude.ai/code/session_01DaohkDrvNVfX3bqCuqhX9v. Relay
  3's: https://claude.ai/code/session_01DaohkBxAb41bAqfSKJNwiM.

## Next step

Continue as the bite-3 member. First run B9c, a look agent over the pushed
build: frames of a level-change boundary on ground and sea, at 1,000 km over
the B8b spots (`notes/b3-b8b.md` hashes) and on a hillside at 10 km on #2. Show
that the sparkle and the step are gone. Also measure the worker's time per
restitched tile and whether held versions churn. Send the frames to the lead
by memo. Then step C (Earth as #0), and then the tail per the contract's "Done
when". Nothing from Vova is pending.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Подсказка больше не мигает: исправление влито в `round-world` (eff78cd84), ведущий может выкладывать его на превью. Теперь подсказка горит три секунды, полсекунды гаснет и снова появится, только когда её условие пропадёт и вернётся.

Мигание, которое ты видел, давала та самая полоса на орбите. При зажатой Q подсказка там горела всего 5 кадров, 0,08 с. Теперь в том же месте она держится 3,5 с, и её успеваешь прочитать.

Подключение сшивки тайлов ещё работает. Как только оно вернётся, волью его, и сессия переедет в новую.
```
