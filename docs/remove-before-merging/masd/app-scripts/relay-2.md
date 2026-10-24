# Relay 2 — masd/app-scripts (slice 3 of MASD), paused again for the context budget

This session picked up `relay-1.md` and built the mechanical half of slice 3.

## Standing constraints

The muthur sync offer was made; do not make it again.

Carried: «мы на этом пиаре тестируем и потом, _если_ понравится переносим в базу» — loop-infrastructure changes are tried on this elephant first, never pushed to vzakharov/muthur from this work.

## The conversation

1. **Operator** (the relay launch): `/relay take masd/app-scripts — продолжить кусок 3 MASD: перенести скрипты приложений в src/<app>/scripts/ по плану, через go.`
   - Agent resumed the paused plan (go-ahead «давай, и идём дальше» quoted in the claim commit a12b919), confirmed the plan's ownership survey against each script's imports, moved 104 files with a one-off mover (`tmp/move-scripts.mjs`, gitignored, not on the branch), fixed repo-root anchors and callers, crossed the 200k context warning and paused. No operator message since the launch.

## Intent

Unchanged from relay-1: eat MASD bite by bite; a bite lands with a green vet and a squash-merge into the elephant's branch on the operator's ask, no `/finalize`. Now: finish slice 3.

## Decisions

- **PDF core goes in blog, not kernel** — a deviation from the plan's recorded recommendation, to be reported to the operator: printing documents is blog's, and `PRINT_SOURCES` names shell's files. The plan's `## Rest of the bite` item 1 states the whole split design (bundles for OG, `renderPdfs` options for PDF, per-site entries including a one-line bible entry, lsa none, the action skipping a site without an entry).
- **Every printing site gets its own `src/<site>/scripts/render-{og,pdf}.ts`**, bible's on the core alone, rather than bible running a core entry — uniform `package.json` entries and one path rule for the render-pdfs action.
- **`same-render.ts` is blog's** (the core's `printRoute` uses it), `pdf-pages.ts` vova's (only the CV ceiling) — the survey had both under vova.
- **The lettered seal's generated comment names the moved script**, so `sites/basilisk/public/seal-lettered.svg` changed by its comment; `content:og:basilisk` must re-render before `--check` passes.

## Errors and dead ends

- The mover rewrote a specifier inside `build-mushroom-artifact.ts`'s esbuild entry string (resolved against the repo root, not the file); restored to `./src/mushrooms/...` by hand. Any other template-string import the mover touched would show the same `../../../scripts/src` shape — `rg 'scripts/src'` finds them (none left).

## State

- Branch `masd/app-scripts`, base `claude/multi-app-sliced-design-7bn3oq` (elephant's PR #169). No PR for this branch yet.
- Commits this session: the claim a12b919, 9f44f45 (the move), c63e8f4 (paths and callers), then the pause.
- Plan: `docs/plans/multi-app-sliced-design.paused.md`; `## Rest of the bite` lists what is built and four steps left.
- Tree does not lint, typecheck or build cleanly yet: `package.json` names render entries that do not exist; boundaries, knip and references are unfixed.
- Nothing scheduled, nothing subscribed, no CI on PRs.
- Estimate: this session 2 h senior developer (the mechanical half of the move). Handed on: about 4 h senior developer — the render split, the checkers, the references and the vet run.

## Pointers

- `docs/plans/multi-app-sliced-design.paused.md` § "Rest of the bite" — the contract, items 1–4, and the "Breaks" list under it.
- `relay-1.md` beside this file for slice 2's landing and the bite-landing rules.
- `.claude/rules/masd.md`, `.claude/rules/content.md` (render scripts), `.claude/rules/stack.md`.
- Predecessor sessions: this one https://claude.ai/code/session_01NFrbs1GKVj8Nt9W2UmW3dU; before it https://claude.ai/code/session_01N5i52unzhwF3Kzn8Pgm4oE.

## Next step

Continue the operator's «давай, и идём дальше»: resume the paused plan with `/go` and finish slice 3 per `## Rest of the bite` items 1–4, then `/polish` and `/pr` (a draft PR based on `claude/multi-app-sliced-design-7bn3oq`). Report the blog-not-kernel PDF deviation. Land it only when the operator asks to merge.
