# Relay 3 — base caught up, outdoor move set up

Relayed from session_01DaohkEALtDXTdsS9KgnD24 on its context budget, mid-work
(no operator ask to relay). `relay-2.md` holds everything before this session.

## Standing constraints

From the parent session's brief (verbatim, still binding, carried from
relay-2):

- "MASD, the linters and the 400-line limit are not dodged: no re-export or line-squeezing to pass a gate, no lint suppression without the operator's yes."
- "`git pull` is blocked by a hook: fetch, then `merge --ff-only`. Never force-push."
- "A new dependency or build step is a toolchain change: CLAUDE.md § "Vetting" names its four sites. Report what the operator must add to the environment setup script."
- "`./scripts/vet.sh` green before the report."
- Branch `claude/cube-wesl-trial`: "Commit and push only there, under that name, do not rename it."

This session's operator: «вет гоняй фоном, иначе это будет каждый раз кучу
ждать. а так ты залним числом узнаешь если где-то что-то было неправильно» —
run `./scripts/vet.sh` in the background, never block on it. Note its exit
code is masked by any `| tail`/`| grep`: read the log for `vet FAILED`.

## The conversation

1. **Operator:** `/relay take claude/cube-wesl-trial — все 66 этажей в .wgsl, по папке на этаж, vet зелёный, PR #276 в черновике`
   - Agent: attached; the auto-branch delete got `stale info` (never pushed), left as is.
2. **Operator (mid-turn):** «у нас круто уехала база, давай догоняться»
   - Agent: ran `/sync-branch` against the PR base `claude/cube-review-perf` (9 commits ahead, incl. the cube intro #277): raw merge 7d858ecd, resolution b5a8f3a3, regenerated modules 31417ec6.
3. **Operator (mid-turn):** «ну и собственно то что снаружи появилось тоже должно по нашей новой философии раскладываться»
   - Agent: took on moving the outdoor shaders (sea, sky, sand, outside, shell) to `.wgsl`, after the sync.
4. **Operator (mid-turn):** «вет гоняй фоном, иначе это будет каждый раз кучу ждать. а так ты залним числом узнаешь если где-то что-то было неправильно»
   - Agent: vet runs in the background from then on.
5. **Operator (mid-turn):** «как всё доделаешь не забудь мне дать ревью борду»
   - Agent: noted — the review board link goes in the final report.
6. **Operator (mid-turn):** «а пины для наружних штук ты сделал?»
   - Agent: not yet; wrote `outdoor-pin.test.ts` (4f74fed5), hashing the six outdoor roots at 052138ff.
7. **Operator (mid-turn):** «а, а как же там вся графика реализована?»
   - Agent: explained — outdoor WGSL lives as `wgsl('id', \`…\`, needs)`strings in TS files with`${f32(X)}`interpolations, assembled by`assemble()` into seven sources (`pages/cube/lib/outdoor-shaders.ts`), exactly as the floors were before the move; launched five worktree agents (sky, sea, sand, outside, shell).
8. **Operator:** «ну думаю надо, да. и вообще на предмет MASD проверить, не заслуживает ли что-то "понижения" или "повышения" (всё время путаю где какое направление)» — answering the agent's question whether the old pipeline shaders in `pages/cube` (`lib/shader.ts`, `lib/vertex.ts`, `ui/bloom.ts`, `ui/reflection-shader.ts`) move too.
   - Agent: yes to moving them (sixth agent launched); explained promotion (a part becomes its own unit: lib file → segment, sub-folder → slice) vs demotion (a single-consumer slice folds into it, or shared code sinks to a lower layer); MASD pass deferred until the moves land, with proposals brought before anything moves.
9. Agents `outside` and `sea` came back empty (context exhausted) with two findings; the agent stopped the other four, fixed the linker (9f4ff491) and rebuilt the outdoor pin (966f038a), then relayed (verbatim in Last agent turn).

## Intent

Every cube shader in `.wgsl`, linked by the repo's WESL linker under MASD:
the 66 floors (done), now the outdoor pieces (`src/cube/shared/{sea,sky,sand,outside}`,
`shared/lib/sun-disc.ts`, `pages/cube/lib/shell-*`, `entities/theme/kit/lib/sun.ts`'s
static part) and the render pipelines' WGSL in `pages/cube`
(`lib/shader.ts`, `lib/vertex.ts`, `ui/bloom.ts`, `ui/reflection-shader.ts`).
Then a MASD pass over the cube app: what earns promotion or a fold-in —
proposals to the operator before moving anything. Then the review board link.
Still not asked: regrouping floors by shared features (relay-2's "next perch").

## Decisions

- **The hash lives in `shared/shader/hash.wgsl`** (b5a8f3a3): the base moved
  `HASH` to `@/cube/shared/shader` for sky/sea/sand, so the floors' `hash.wgsl`
  went there; `src/cube/CLAUDE.md` names the new path.
- **`render.ts` imports past the importer's slice by `@/`**, relative inside
  it (aliased group first): the factory `wgsl` is now `shared/shader`'s.
- **`AIR` contract kept over the base's `Aired`**: `lens.ts`'s `hazed()` writes
  `AIR`; `Graded` carries no air; `Exposed` lives in `kit/lib/lens.ts`
  (grade is generated). `sun.ts`, `ordinary.ts`, `lens.ts` stay TS (parametric).
- **Floor pin re-pinned to 052138ff** (all 66 pass).
- **Outdoor pin is canonical, not token-for-token** (966f038a): sorted
  module-scope declarations, comments and layout out, so splits and
  reordering pass; `NUMBERED` (set of piece ids) lists TS pieces of
  `const NAME = value;` lines — the pin drops those declarations and writes
  each name back as its value. This beat the first brief's "no names, no
  reordering", which contradicted `.claude/rules/wgsl.md` and would have kept
  almost everything in TS.
- **The lens source is floor 1 under a lens stage** (`firstFloorThrough`), so
  the outdoor pin leaves it to the floor pin.
- Terms: **promotion** — a part gets a unit of its own (lib file → segment,
  sub-folder → slice); **demotion / fold-in** — a single-consumer slice moves
  into its consumer, or shared code sinks to a lower layer.

## Errors and dead ends

- Git's rename/rename merge of `hash.ts` dropped the base's `pointHash`; found
  by the floor pin on floor 1, restored in `hash.wgsl`.
- First vet on 31417ec6 failed on lint only (import order after the hash move,
  `.map(line)` in `render.ts`); fixed in b3a53024.
- Six worktree agents launched with a "pure move, pins unmodified, no names"
  brief: `outside` and `sea` exhausted their context reading and returned only
  plans; the other four were stopped. Their findings, still valid:
  - **Fixed:** the linker missed `@group(0) @binding(0) var<uniform> frame`
    (9f4ff491, with a codegen test).
  - **Open:** `outside/aerial` calls `clearSky`/`airThrough` from `CLEAR_SKY`,
    which `shared/sky/index.ts` does not export — the barrel needs it.
    `OUTDOOR_FRAME`, `SWELL_TRAIN`, `SHORE_CUSPS` are not on the outside barrel
    either; a `.wgsl` that uses their names must import them.
  - **Open:** `sky/sky-shader.ts` and `sand/sand-shader.ts` import
    `'../sea/water-body-wgsl'` relatively — repoint when sea's file renames.
  - `wave-field-wgsl.ts` exports plain strings for compute pipelines, not
    pieces; `outdoor-frame.ts` struct is computed from `FIELDS`; `swell.ts`,
    `shore-cusps.ts`, `island-height.ts` text is computed from rolled data —
    those stay TS (or split off only a static part).
  - The sea agent's per-file plan (sea-light → `.wgsl` as is; water-body with
    a `water-optics.ts` constant piece; lace and waves split off) is in this
    session's transcript, agent report from `a7175b1db2c5cb963`.
- Agents brief lesson: scopes were too wide for one agent's context; give each
  one or two files and the exact rules, not "read the linker".

## State

- Branch `claude/cube-wesl-trial`, head 966f038a pushed; draft PR
  https://github.com/vzakharov/vovazakharov.com/pull/276 into
  `claude/cube-review-perf` (now contains its tip 052138ff; was CONFLICTING
  before this session).
- Vet: failed on 31417ec6 (lint only); rerun on b3a53024 was started in the
  background and had not reported when this session relayed — run vet again
  on the head (it is fast to start; runs on GitHub from the pushed head).
- Agent worktrees under `.claude/worktrees/agent-*` are container-local and
  hold no landed work.
- No plan file (planless). Keepalive stopped.
- Estimate: this session 7.5 senior-hours — 4 h senior graphics-programmer
  (the semantic merge), 2 h senior graphics-programmer (pin + linker fix).
  Remainder handed on: ~18 h senior graphics-programmer (outdoor and pipeline
  WGSL into `.wgsl`, pinned) + 3 h senior architect (the MASD pass).

### Watches

https://claude.ai/artifact/PSHRvqMjUtVGe8v3UcN5gU

## Pointers

- `src/cube/pages/cube/lib/outdoor-pin.test.ts` — the outdoor pin; add each
  new constant piece's id to `NUMBERED`.
- `src/cube/entities/theme/shaders-pin.test.ts` — the floor pin (floor 1 also
  covers the outside lens).
- `src/cube/pages/cube/lib/outdoor-shaders.ts` — the seven outdoor sources.
- `scripts/lib/wesl/` — the linker; `module.ts` (declarations),
  `placement.ts` (MASD placement), `render.ts` (generated modules);
  `scripts/shaders-codegen.test.ts`.
- `.claude/rules/wgsl.md` — when a number takes a name.
- `src/cube/entities/theme/kit/lib/core.ts` — the model TS constant piece.
- `docs/remove-before-merging/review-focus.json` — the review board's focus;
  `/review-board` rebuilds and republishes the board at the URL above.
- Transcript: https://claude.ai/code/session_01DaohkEALtDXTdsS9KgnD24

## Next step

In line with the operator's latest asks — «то что снаружи появилось тоже
должно по нашей новой философии раскладываться», «ну думаю надо, да. и вообще
на предмет MASD проверить, не заслуживает ли что-то "понижения" или
"повышения"», «вет гоняй фоном», «как всё доделаешь не забудь мне дать ревью
борду»:

1. Rerun `./scripts/vet.sh` in the background on the head.
2. Move the outdoor WGSL (`shared/{sea,sky,sand,outside}`, `shared/lib/sun-disc.ts`,
   `pages/cube/lib/shell-*`) into `.wgsl`, holding `outdoor-pin.test.ts` and
   `shaders-pin.test.ts` green; numbers TS also holds go into constant pieces
   listed in `NUMBERED`. Agents, if used, get narrow scopes.
3. Pin, then move, the pipeline WGSL in `pages/cube` (`lib/shader.ts`,
   `lib/vertex.ts`, `ui/bloom.ts`, `ui/reflection-shader.ts`) — a pin like the
   outdoor one first, on the untouched code.
4. MASD pass over the cube app: bring promotion/fold-in proposals to the
   operator before moving anything.
5. `/review-board` and give the operator the link.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Вет на 31417ec6 упал (код выхода 0 соврал: его съел `| tail`). Ищу, на чём.

Упал только lint: `render.ts` передаёт `line` в `.map` напрямую, плюс порядок импортов и экспортов. Чиню.

Первый вет после мерджа упал только на lint: порядок импортов после переезда хеша и колбэк в `.map` в `render.ts`. Остальные джобы прошли. Починил в b3a53024 и запустил вет заново, фоном. Шесть агентов ещё работают. Как вернутся, сливаю их ветки.
```
