# Relay 2 — Multi-App Sliced Design

## 1. Standing constraints

- From relay 1, kept: «давай, пока обсуждаем, ничего не пересобирать, а просто
  обсуждать» — when the operator opens a design discussion, discuss; do not
  rewrite the plan meanwhile.

## 2. The conversation

This session was started by relay 1's `/relay take`; its Next step was `go`
with the go-ahead «окей, давай переписывай и сразу приступай (наверное в новой
сессии). пасибо!».

1. **Operator** (mid-turn, while step 1 was being written): «сразу мысль --
   извини что вмешиваюсь, оч нравится
   docs/plans/multi-app-sliced-design.in-progress.md, его давай сохраним после
   мерджа где-то в docs, будем к нему возвращаться если вдруг захотим продвигать
   тему вовне (например сделать сайт для самого MASD)»
   **Agent**: recorded it at the top of the plan (`/finalize` moves the plan to
   `docs/masd.md` instead of sweeping it, its Progress section dropped), then
   paused for the context budget and relayed.

## 3. Intent

Unchanged from relay 1: land MASD's core (#171) on `main` as PR #169, the rest
as later PRs. New: the plan file survives the merge as `docs/masd.md`.

## 4. Decisions

- **The plan becomes `docs/masd.md` at `/finalize`** — the operator's ask; it is
  a new top-level doc the operator asked for, so no "don't" argument is owed.
  The Progress section goes; the model, slices and slice-1 spec stay.
- **Issue bodies** are English; child #175 carries the one-page-app problem
  statement, as relay 1 decided.
- **`eslint/masd-graph.ts` API**: `GRAPH_FILE`, `parseGraph`, `loadGraph`,
  `ancestors`, `descendants`, `insignificantApps(graph, mounted)`,
  `directoryMismatches(graph, dirs)`. App names are kebab-case (zod), which
  also guarantees insertion-ordered keys. It imports with `.ts` extensions so
  bare Node can load it; whether jiti accepts `import.meta.dirname` from
  `eslint.config.ts` is not yet verified.

## 5. Errors and dead ends

- `unicorn/better-regex` rejects a regex with `parent parent` in it; reworded.
- The Bash hook refuses `cat`/`sed -n`/`sed -i` on files; use `Read`/`Edit`, or
  rerun the identical command once when the shell is genuinely the right tool.

## 6. State

- Branch `claude/multi-app-sliced-design-7bn3oq`; PR
  https://github.com/vzakharov/vovazakharov.com/pull/169 (draft, base `main`),
  body now `Closes #171`.
- Issues: parent #170; children #171 (core), #172 (sites by domain), #173
  (message catalogue), #174 (music as an app), #175 (one-page app) — all linked
  natively as sub-issues of #170.
- Plan: `docs/plans/multi-app-sliced-design.paused.md`, its Progress section
  saying step 1 is done (0a27055) and steps 2–11 are left.
- Estimate: this session 1 h senior developer. Remainder handed on:
  `--part 15 senior developer "Moving ~400 files across a new graph while inverting the schema registry, splitting root layouts under static export and writing a cross-app significance check is senior work: each step can break all four builds."`

## 7. Pointers

- The plan — the design, slice 1's steps, and Progress with the list of
  non-`src/` files that name `src/<layer>/…` paths.
- `eslint/masd-graph.ts`, `eslint/masd-graph.test.ts`, `src/masd.json`.
- `docs/remove-before-merging/relay-1.md` — the design conversation.
- This session's transcript:
  https://claude.ai/code/session_01KAxY14wGGvNaVa6WJsrnoy

## 8. Next step

Resume the paused plan with `/go` from its Step 1 (the `*.paused.md` case),
starting at step 2, the move. The go-ahead: «окей, давай переписывай и сразу
приступай (наверное в новой сессии). пасибо!»
