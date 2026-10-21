# Relay 6 — Multi-App Sliced Design

## 1. Standing constraints

- From relay 1, kept: «давай, пока обсуждаем, ничего не пересобирать, а просто обсуждать» — when the operator opens a design discussion, discuss; do not rewrite the plan meanwhile.

## 2. The conversation

No operator message in this session. It was started by relay 5's `/relay take`, resumed the paused plan at step 7 under the go-ahead «окей, давай переписывай и сразу приступай (наверное в новой сессии). пасибо!», did steps 7–9, and paused at the context-budget warning (~200k tokens). Its first reply re-flagged the open `story.tsx` question (still unanswered, see § 6) and said it does not block.

## 3. Intent

Unchanged: land MASD's core (#171) on `main` as PR #169, the rest as later PRs; the plan file survives the merge as `docs/masd.md`.

## 4. Decisions

- **Boundaries config lives in `eslint/masd-boundaries.ts`**, generated from the graph; `eslint.config.ts` imports it, so `FSD_LAYERS`/`PUBLIC_API`/`SHARED_LIB_ENTRY` left the config.
- **Element patterns are folder patterns with `partialMatch: true`** (`src/*/<layer>/*`, `apps/*/app`), beating `src/(*)/<layer>/(*)/**`: in boundaries v7 a `(*)` group captures twice (so the second name got the first value), and a trailing `/**` without groups makes the whole file the element root, which breaks `fileInternalPath`.
- **The segmented layers (`app`, `shared`) overlay their ancestors' as one unit**, files reaching each other directly — shell's layout composes kernel's, music's/basilisk's shared builds on kernel's shared by leaf modules (needed under bare Node). Sliced layers go strictly down into own app or ancestors, through the public API. A router (`apps/*/app`) may enter any app's public API and any `shared/lib` file.
- **`lint:fsd` is `scripts/lint-fsd.ts`**, one Steiger run per app from the graph; `fsd/insignificant-slice` off in `steiger.config.mjs`; `no-ui-in-app` exempted on `./src/*/app/ui/**` (shell's and vova's app layers hold root layouts too).
- **`scripts/masd-check.ts`** (`pnpm check:masd`, in `vet.sh`): graph checks plus Steiger's insignificant-slice across the composition. A reference from a router or an app layer, if it is the only one, raises nothing (Steiger's own app-layer exemption); from `shared`, "only one reference on layer"; from a slice, "consider merging". Imports parsed with `ts.preProcessFile`; `@/` and relative specifiers resolved by path. Tested as a CLI on temp trees.

## 5. Errors and dead ends

- The Bash hook refuses `cat`/`sed`/`head`/`printf >` on files; `BATCH_EDIT=1` in front lets a deliberate command through.
- The two capture-pattern failures in § 4, each found by running eslint (all 113 imports refused, then everything refused).

## 6. State

- Branch `claude/multi-app-sliced-design-7bn3oq`; PR https://github.com/vzakharov/vovazakharov.com/pull/169 (draft, base `main`, MERGEABLE/CLEAN).
- Head 7576c9c (plan paused) over aca91f5 (step 9), 62241f0 (step 8), 43df71b (step 7). tsc clean, knip clean, `pnpm lint:fsd` and `pnpm check:masd` clean, `eslint src apps eslint` clean but for one error: `src/music/pages/music/ui/story.tsx` importing `@/blog/entities/document`. No vet run.
- Plan: `docs/plans/multi-app-sliced-design.paused.md`; Progress says steps 1–9 done, 10–11 left.
- **Open, the operator's call**: `story.tsx` uses `ProseContent` (the hast→React renderer, `.claude/rules/content.md`) from blog. (а) `music: ["shell", "blog"]` in `src/masd.json` — the several-parents case; or (б) move what it uses down to kernel. The agent leans (б). It is the last lint error, so vet (step 11) needs it decided.
- Estimate: this session 5.5 h senior developer. Remainder handed on: `--part 2 senior developer "Rewriting the FSD rule as the MASD model, with a tombstone and every citation repointed, needs the judgement of the one who knows the checkers." --part 1 middle qa "Four sites to look at on preview, the game on its own layout among them."`
- Nothing running, no subscription or check-in.

## 7. Pointers

- The plan — the model, the steps, Progress.
- `docs/remove-before-merging/relay-1.md` (design conversation) through `relay-5.md`.
- `eslint/masd-boundaries.ts`, `scripts/lint-fsd.ts`, `scripts/masd-check.ts` (+ `.test.ts`), `steiger.config.mjs`; these and `eslint/masd-graph.ts` cite `.claude/rules/masd.md`, which step 10 creates from `.claude/rules/fsd.md`.
- This session's transcript: https://claude.ai/code/session_01DN1TF7qWv1JM4E9zuHKccz

## 8. Next step

Resume the paused plan with `/go` from its Step 1 (the `*.paused.md` case), at step 10. The go-ahead: «окей, давай переписывай и сразу приступай (наверное в новой сессии). пасибо!». Check for an answer to the `story.tsx` question first; with none, step 10 does not depend on it — ask again and keep going, but step 11's vet needs it settled.
