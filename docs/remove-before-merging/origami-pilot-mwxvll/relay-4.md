# Relay 4 — origami infrastructure, renderer and CLI left

## 1. Standing constraints

None stated by the operator.

## 2. The conversation

This session started from
`/relay take claude/origami-pilot-mwxvll — движок перенесён, план на паузе: остались физика, рендер и CLI`
(relay-3.md holds everything before it). The operator sent no message in this
session.

**Agent (before any operator message):** Attached (HEAD was detached on the
branch tip; no auto-branch to delete), set the inherited estimate, resumed the
paused plan (flip commit quoting «и давай начинать»). Built items 1–2 of the
plan's "Left" (designs, physics, tests — be25e698), then extracted the CDP
page-opening into `openTab` (4da0f943) as the start of item 3. The context
budget warning arrived at ~223k tokens; the renderer and CLI did not fit, so
it paused the plan (146c2a2c) and relayed — all within the session's one
turn, so there is no earlier reply and no Last agent turn section:
`scripts/relay-last-reply.py` reported "no turn before this one wrote any
text".

## 3. Intent

Unchanged from relay-3: origami infrastructure only — «подготовить
инфраструктуру», «чтобы не думать заранее о второстепенных вещах типа сайта и
голоса». The engine must see what ordinary paper cannot do. Nothing the text
sites do not need goes in `kernel`.

## 4. Decisions

- **Physics measures from adjacency, not pieces moved**: a layer is bent where
  a moved piece shares a paper edge on the fold line with a still one. So the
  fold in half bends 1 layer (the kite flaps meet edge to edge on the axis).
  Alternative — counting moved pieces — overcounts raw edges lying on the line.
- **The neck bends 14, not 16** as the plan forecast; still an error over 8.
  The test asserts `bent > REVERSE_LAYERS_ERROR` and the message naming the
  measured count, not a hard 16.
- **Sharpness**: only apexes on the step's own crease count (a tip off it just
  travels with its flap — the tail reverse folds otherwise read 5.6°); a fold
  along a tip's bisector (moved and still wedges cover the same arc) counts the
  tip double, so the fold in half reads 11.25°, not 5.6°.
- **Type-overlap fixes**: `Piece.z` renamed `order` (it clashed with the
  meadow's `Ground.z`); `PaperPiece` base for `Piece`/`PieceSnapshot`;
  `StepReport = Measured & { findings }` (`Omit` is banned by
  `vova/no-pick-omit`); the stack's mm depth is `depth`, not `thickness`
  (clashed with `Paper.thickness`); `Evaluating` base in `cdp.ts` shared by
  `Tab` and the meadow's `Page`.
- **`isUpper(piece, lowerTag)`** in `state.ts` serves both `fold.ts` and
  `physics.ts`.
- **`openTab` keeps the meadow's behaviour exactly** — no `awaitPromise`, the
  full expression in the error — so `play-mushrooms.ts` changes only in where
  the code lives.
- **Tests index with `.at(i)` + `assert.ok`**: tsc (noUncheckedIndexedAccess)
  and the type-aware eslint disagree on `[i]`; `.at` satisfies both.

## 5. Errors and dead ends

- Bash hooks block `sed -n`/`cat >` on files: use `Read`/`Write`; a
  deliberate batch goes through with `BATCH_EDIT=1`.
- Lint bans `Array#reduce` and passing a named function to `.map`.
- `pnpm check:cycles | tail -1` printed nothing once; grep for "circular"
  instead.

## 6. State

- Branch `claude/origami-pilot-mwxvll`, draft PR #251
  (https://github.com/vzakharov/vovazakharov.com/pull/251), base `main`,
  MERGEABLE/CLEAN at attach.
- Last pushed commit 146c2a2c (`docs: pause the origami plan…`), then the
  commit carrying this file.
- Plan: `docs/plans/origami-infrastructure.paused.md`; its `## Progress` holds
  done/left for both sessions.
- Squash proposal still reads as the plan's forecast — refresh at `/pr`.
- No CI dispatched, no PR subscription, no scheduled check-in.
- Estimate: this session revised to 3 h senior developer + 1 h senior analyst.
  Remainder handed on: 2 h senior developer ("the WebGL renderer over CDP and
  a CLI that fails on errors need tooling judgement") + 1 h senior analyst
  ("thresholds still need calibrating against real folds").

## 7. Pointers

- `docs/plans/origami-infrastructure.paused.md` — read `## Progress` first;
  "Left" item 1 spells out the renderer.
- `src/origami/shared/fold/physics.ts`, `src/origami/shared/designs/` — the
  new code.
- `src/scene/scripts/lib/cdp.ts` — `launch`, `openTab`, `Evaluating`.
- `src/mushrooms/scripts/build-mushroom-artifact.ts` — the esbuild call to
  follow.
- `docs/remove-before-merging/origami-pilot-mwxvll/pilot/render.html`,
  `shoot.mjs` — what to port (views default `-35,35;20,60;180,25;0,90`,
  `--seq` renders every step from the first view, crease-pattern SVG).
- `tmp/smoke.ts` is not committed; to see per-step numbers, fold
  `DESIGNS[id]().steps` with `physics(steps, PAPERS['kami-15'])`.
- This session's transcript: https://claude.ai/code/session_01DaohkDdE7LB4EePKSZTS5W
  (predecessors: https://claude.ai/code/session_01DaohkCZTP1Enkk3rNK3vND and
  the ones relay-3.md lists).

## 8. Next step

Resume the paused plan, `docs/plans/origami-infrastructure.paused.md`, from
its `## Progress` § "Left", item 1 (renderer) — the operator's go-ahead was
«и давай начинать». Then `/go`'s Step 3 (`/polish`) and Step 4 (`/pr`
refresh).
