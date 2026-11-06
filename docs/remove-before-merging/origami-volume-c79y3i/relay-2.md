# Relay 2 — origami volume: solver works on a simple fold, basilisk not yet

## 1. Standing constraints

None stated by the operator.

## 2. The conversation

- **Operator:** `/go claude/origami-volume-c79y3i`
  - **Agent:** attached to the branch (PR #253, draft, base `main`, CLEAN/MERGEABLE; the auto-branch `claude/relaxed-mendel-vglcvl` was never pushed, so nothing to delete), flipped the plan draft → in-progress quoting the go-ahead (the three open questions went unanswered, so the recommendations stand), set the estimate, and implemented the plan's §1–§3: crease records and `hold`, the welded mesh, hinge angle/gradient, contact and a FIRE solver. A square folded in half with `hold: 0.5` settles to 90.0° on every crease edge. The basilisk does not settle yet (its start mesh already crosses itself). Paused for the context budget and relayed in the same turn. (`scripts/relay-last-reply.py` found no earlier turn to append: the whole session was this one turn, whose chat lines were short progress notes in Russian.)

## 3. Intent

Make the basilisk (`src/origami/entities/design/model/basilisk.ts`, from #251) look like hand-folded paper with volume, per the plan — recommendations 1a (bar-and-hinge relaxation), 2a (body open ~35°), 3a (no crest/open jaw).

## 4. Decisions

- **`hold` defaults are per paper preset**, per fold kind (`flat`/`reverse`/`shaping`), in `paper.ts` (`holdOf`): springback is a property of the paper; kami keeps the plan's 0.96/0.98/1, copier paper is springier, tissue-foil holds more.
- **Mesh edge 1/25 of the sheet, not the plan's 1/40**: 1/40 made the simple fold take ~110 s; 1/25 takes ~5 s. The basilisk's narrowest pieces are 0.033 wide, so 1/25 still meshes them.
- **FIRE with each vertex's mass = its Gershgorin stiffness bound** (dt = 1.8 everywhere), a per-step move cap of half the paper's thickness (no layer tunnels), and **hinge goals ramped** from the pressed angle to the resting one over 2000 steps: without the ramp, both halves of a fold swung open around the crease while their far ends stayed pressed together (a teardrop) for ~18k steps.
- **`FACET = CREASE = 0.7`**: with facets at 0.2 the paper was so floppy convergence crawled; whether 0.7 still lets the basilisk bend is for the tuning step.
- **Contact is a penalty with side memory**: a pair's side is fixed when first seen (unknown if it starts touching, then left to the crossing check), so a vertex that slips through is pushed back.
- **Crease angle sign**: valley positive from the paper's front; a flat crease takes ±π from `assign` (extracted from `creasePattern`). Confirmed only by the 90° settle so far.

## 5. Errors and dead ends

- **Explicit dynamics with unit masses** stalled; **facet stiffness 0.2** crawled; **no ramp** produced the teardrop — all above.
- **tsx wraps inner arrow functions in `__name`**: a closure inside `dihedral` cost 3.4 s of a 9 s run. Keep the hot loop closure-free.
- **The basilisk**: mesh 884 vertices, 1653 triangles, 2423 hinges (524 creases) built in 65 ms, but `crossings(m, start)` = 751 before any step, and the solver then jammed (forces ~1, spine stuck at ~π, 46k steps). Cause not found yet; suspects in the plan's Progress section.

## 6. State

- Branch `claude/origami-volume-c79y3i`, last pushed f11f6b8f (plus this summary's commit), draft PR https://github.com/vzakharov/vovazakharov.com/pull/253.
- Plan: `docs/plans/origami-volume.paused.md`, with a `## Progress` section recording what is done and left.
- Existing origami tests pass (12); `tsc` clean on origami; no new tests yet; vet not run.
- No CI, no PR subscription, no scheduled check-in.
- Estimate: this session 6 h senior developer ("meshing a folded state, the hinge gradient and a FIRE solver with contact, debugged until a fold settles to its angle, is numerical code a senior writes"). Remainder: 6 h senior developer ("finding why the basilisk's pressed mesh crosses itself, the renderer for bent paper and the tests are numerical and graphics code a senior must read") + 3 h senior designer ("judging when relaxed paper reads as hand-folded origami, and tuning per-crease springback against reference photos, is a designer's eye").
- The muthur sync offer was made; do not make it again.

## 7. Pointers

- `docs/plans/origami-volume.paused.md` — the plan and its Progress section (what's left, in order).
- `src/origami/shared/fold/` — `mesh.ts` (weld, rim, `startOf`, `foldAngle`, `holdAt`), `triangulate.ts`, `hinge.ts`, `contact.ts`, `relax.ts`, `paper.ts`, `fold.ts`.
- Spike scripts were in gitignored `tmp/origami-spike/` and are gone; the plan describes what they did.
- `docs/remove-before-merging/origami-volume-c79y3i/relay-1.md` — the planning session.
- This session: https://claude.ai/code/session_01DaohkFaG5aoDYkBPBKDma9

## 8. Next step

Resume the paused plan (`/go` Step 1's `*.paused.md` case), starting with why the basilisk's start mesh crosses itself.
