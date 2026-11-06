# Relay 1 — island bite 1, the thinnest descent

## Standing constraints

- The island's own plan, `docs/plans/world-game-zoltan-syama.in-progress.md`,
  is the lead's, claimed by the lead's session: this bite never edits it, and
  its standing constraints hold here (among them: the private repo the memo
  tooling is ported from is never named anywhere; only the lead edits or
  publishes the board artifact — members propose through memo).
- This session is the **member** of the lead/member pair: talk to the lead with
  `python3 scripts/memo/memo.py post --as member "<text>"` (`show` reads the
  thread, `wait --as member` waits); a question the work can go on past is
  posted and not waited on (`docs/plans/world-game-zoltan-syama/bite-1.md` §
  "For the member").
- Orchestrate: one build step per `Agent`, `model: opus`,
  `isolation: "worktree"`, each pushing every passing step straight to
  `island/bite-1-descent`; the common brief is
  `docs/remove-before-merging/island/bite-1-descent/brief-common.md`.

## The conversation

1. **Operator:** `/go island/bite-1-descent`
   - **Agent:** attached (session opened on the branch), flipped
     `island-bite-1.draft.do-not-implement.md` → `.in-progress.md` quoting the
     go-ahead, wrote § "This bite" (interfaces + steps S0 → wave 1 → S5 → F →
     tail) and the common brief, posted to the lead, launched S0. Then, across
     turns woken by agent reports and check-ins (no further operator messages),
     ran S0, wave 1 (S1/S1b coast, S2 height, S3 tiles, S4 eye, P play script),
     S5 scene, F first play run, and fix rounds R1, R2a, R2b, R3a; each
     report's calls went into the plan's § "Calls made in the build". At the
     context-budget warning (~295k) it waited out the two running agents, then
     paused the plan and relayed. (verbatim in Last agent turn)

## Intent

`/island` on vovazakharov.com opens on the island Zoltan and Syama drew, seen
from orbit, and the eye falls continuously to 2 m; plain-looking at every
height. The contract is `docs/plans/world-game-zoltan-syama/bite-1.md`; out of
the bite: clouds, bird, walker, fractal coast, rivers/lakes, forests, sea
glitter, towns.

## Decisions

All in the plan, `docs/plans/island-bite-1.paused.md` § "This bite" →
"Interfaces every step builds to" and § "Calls made in the build". The ones a
successor would otherwise re-litigate:

- **The tracer finds the sea, not the land** (a global saturation threshold
  can't separate pale pencil from the photo's tinted paper); rings need coloured
  pixels ≥ 2 px clear of ink, which drops every word. Narrow lagoons (below
  Рабу) close as land rather than splitting Апатин/Стамбулица off.
- **`Coast` is outer rings only**; the lake by Цитадель is land until the lakes
  bite.
- **The sea is a surface per tile** (height-0 grid beside each land grid), a
  coarse globe at R − 1 500 m outside the 16 384 km tile square;
  **`logarithmicDepthBuffer`** (reversed depth needs an extension headless WebGL
  lacks). Floating origin: meshes placed at `centre − eye` in float64.
- **Coast tiles split two levels finer** (`selectTiles(at, { coast })`), beating
  split ratio 0.5 everywhere (580 tiles at 100 m) and one level finer (too few
  coast tiles changed).
- **Portrait fov**: horizontal never under 50°, and drag reads the same fov
  (`poseOf(eye, aspect)`, `groundPerScreen(aspect)`).
- **Relief**: explicit octave table 400 km → 6 m, hill band full size even at
  the coast, `heightAt(…, finest)` so each tile takes only the octaves its grid
  holds.
- **Underwater ground fades sand → sea colour by −20 m**, so a skirt winning a
  depth tie draws as sea, not a sand speck.
- Height is measured over an **eased floor** (no bob), the sea counts as ground 0.
- `masd-disable` markers were never added (no operator yes asked); the "no
  references" reds cleared when the scene imported the slices.

## Errors and dead ends

- S1's first tracer (global saturation threshold) split the main body and kept
  words as land — replaced by the sea flood.
- S1, S5, S1b and F each hit their context limit before finishing; each left a
  note in `notes/<step>.md` that the next agent finished from.
- The base branch's vova build (case-study WebP) and `type-overlap` reds were
  the lead's; it fixed them on the base and this branch merged them.
- Option (a) split ratio 0.5 everywhere: over 500 tiles, still stepped.

## State

- **Branch:** `island/bite-1-descent`, head 63c9a5f2a (pushed), plus this
  summary's commit.
- **PR:** #256, draft, base `claude/world-game-zoltan-syama-hodowq` (the
  island's own branch, PR #255); its body is still the lead's placeholder.
- **Plan:** `docs/plans/island-bite-1.paused.md`, its § "Rest of the bite"
  listing what is left.
- **Running:** nothing — no agents, no worktrees, no scheduled check-ins left
  pending. The memo thread's last note is the lead's 19:37 review of the first
  frames.
- **Estimate:** this session 12 h senior technical-artist + 30 h senior
  graphics-programmer + 8 h senior gameplay-programmer + 10 h middle developer +
  5 h senior producer + 3 h middle qa. Remainder handed on: 10 h senior
  graphics-programmer ("slope light, the tile-level seams and view culling are
  rendering work"), 2 h senior technical-artist ("inland ground kept above sea
  level is a terrain-shape call"), 2 h middle developer ("moving the play
  script's shared helpers into scene's lib is routine"), 1 h senior producer
  ("briefing the last round and the tail"), 1 h middle qa ("the final ten
  frames against the drawing").

## Pointers

- `docs/plans/world-game-zoltan-syama/bite-1.md` — the contract.
- `docs/plans/island-bite-1.paused.md` — the plan: interfaces, calls, what is
  done and left.
- `docs/remove-before-merging/island/bite-1-descent/brief-common.md` — the
  agents' shared brief.
- `docs/remove-before-merging/island/bite-1-descent/notes/*.md` — each step's
  hand-over (APIs, numbers); `notes/f.md` and `notes/r2a.md` say how a play run
  is done here (scratchpad copy, `pnpm install --offline`, build,
  `pnpm play:island --no-build`).
- `docs/remove-before-merging/island/bite-1-descent/frames/` — the ten current
  frames (desktop/phone × orbit, 1000km, 10km, 100m, 2m) and
  `coast-overlay.png`.
- `.claude/skills/mammoth/notes/subagents.md` — how the orchestration is run.
- Code: `src/island/` — `shared/globe`, `shared/play`, `entities/coast`,
  `entities/terrain`, `features/eye`, `pages/island`, `scripts/`.
- This session's transcript: https://claude.ai/code/session_01DaohkDTq595n9RkxwUJ8bc

## Next step

Resume the paused plan (`/go` from Step 1 on `docs/plans/island-bite-1.paused.md`):
its § "Rest of the bite" in order — R3b slope light and lifted exposure (the
lead's second relief call), then the frame defects it lists, the shared play
code, and the tail (`/polish`, `VET_MEADOW=1 ./scripts/vet.sh`, PR #256's body
with the frames, frames to the lead through memo).

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Вова, на острове появились холмы. Со 100 м до горизонта тянутся холмы, а впереди поднимается гряда. С двух метров горизонт стал холмистым, впереди открывается долина, линейки больше нет. С 10 км рельеф пока читается только по цветным пятнам высот. Камера там смотрит почти отвесно вниз, а свет плоский, так что холмы выступят, когда появятся тени по склонам.

- **Почему было плоско.** Старый шум слишком быстро слабел к мелким масштабам: холм шириной 5 км выходил высотой около 30 м, а 500-метровый около 2 м.
- **Что поменялось.** Теперь холмы шириной от 25 км до 400 м во всю силу, даже у берега, вершины округлые, долины мелкие. Самые мелкие неровности, до 6 м, теряют высоту ровно вдвое при каждом уменьшении масштаба вдвое, поэтому нигде нет обрывов.
- **Разброс высоты** в окне 10 км вырос с 12–23 м до 62–116 м, в окне 200 м с 1–2,6 м до 7–17 м. Половина суши теперь выше 575 м (было 375), максимум 2 100 м.
- **Береговая линия** осталась на месте: мелкий шум по-прежнему гаснет у кромки.
- **Мелкие неровности на крупных плитках.** На них неровности мельче шага сетки давали рябь, поэтому каждая плитка теперь берёт только те складки, которые её сетка может удержать.

На суше вдали от берега есть редкие впадины ниже уровня моря: около 0,05% точек, до −70 м. На экране они выйдут маленькими «прудами» цвета моря. Это пойдёт в список следующей сессии.

Жду последнего агента второго раунда: остались ступеньки на берегу. После него ставлю план на паузу и передаю ветку.
```
