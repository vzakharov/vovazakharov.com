# Relay 3 — Multi-App Sliced Design

## 1. Standing constraints

- From relay 1, kept: «давай, пока обсуждаем, ничего не пересобирать, а просто обсуждать» — when the operator opens a design discussion, discuss; do not rewrite the plan meanwhile.

## 2. The conversation

No operator message in this session. It was started by relay 2's `/relay take`, whose Next step was resuming the paused plan at step 2 under the go-ahead «окей, давай переписывай и сразу приступай (наверное в новой сессии). пасибо!». The agent claimed the plan, did step 2, and paused at the context-budget warning (~200k tokens, most of it rule files loaded by reads across the moved tree).

## 3. Intent

Unchanged: land MASD's core (#171) on `main` as PR #169, the rest as later PRs; the plan file survives the merge as `docs/masd.md`.

## 4. Decisions

- **The move's mapping** — `tmp/masd-move/move.mjs` (gitignored, gone with the container) held it; the plan's step 2 list is the source, with these choices of its own: `MUSIC_ROUTE` became `src/kernel/shared/content/music-route.ts`, exported from kernel's content barrel and dropped from music's catalogue barrel; `basilisk-frontmatter.ts` sits at `src/basilisk/shared/content/` (no barrel there yet — step 3 adds one); `src/README.md` and `src/masd.json` stayed put.
- **The alias stays `@/*` → `src/*`**, so imports read `@/kernel/shared/...`, `@/music/pages/music`.
- **Shell's root layout composes kernel's** (`src/shell/app/ui/root-layout.tsx`, its barrel also re-exporting kernel's `rootMetadata`); all four routers mount shell's. An app layer importing its ancestor's app layer is what the plan's DRY note asks for, though "strictly lower layer" forbids it on its face: step 7 has to let the app layer through.
- **Step 3's proposed shape** for the blog→basilisk import (in the plan's Progress): `articleRoute(collection, slots?)` takes a `Collection<F>` and slots from the router; `ArticleSlots` moves to a blog shared segment; `basilisk/entities/case` exports `CASE_SLOTS`; basilisk's router passes both. Not yet built.

## 5. Errors and dead ends

- The Bash hook refuses `cat`/`sed -n`/`printf >` on files; `BATCH_EDIT=1` in front of a command lets a deliberate shell edit through.
- A `Read` of a file in a covered tree loads its rules (`fsd.md`, `content.md`, `songs.md` are long) — read sparingly; grep where a line number is all that is needed.

## 6. State

- Branch `claude/multi-app-sliced-design-7bn3oq`; PR https://github.com/vzakharov/vovazakharov.com/pull/169 (draft, base `main`, was MERGEABLE/CLEAN at attach).
- Head f2f7090 (plan paused) over 6543211 (reference rewrite), nine per-app `git mv` commits before it. `tsc --noEmit` clean at 6543211; no build or vet run yet.
- Plan: `docs/plans/multi-app-sliced-design.paused.md`, Progress saying steps 1–2 done, 3–11 left, and two forbidden imports the plan's steps did not foresee.
- Estimate: this session 2 h senior developer. Remainder handed on: `--part 13 senior developer "Inverting the schema registry, splitting root layouts under static export, generating boundaries from the graph and writing a cross-app significance check is senior work: each step can break all four builds."`
- Nothing running, no subscription or check-in.

## 7. Pointers

- The plan — the model, the steps, Progress with what is left and the open call.
- `docs/remove-before-merging/relay-1.md` (design conversation), `relay-2.md`.
- `src/masd.json`, `eslint/masd-graph.ts`.
- This session's transcript: https://claude.ai/code/session_012wAjdw6azSeaP9rWfjaHke

## 8. Next step

Resume the paused plan with `/go` from its Step 1 (the `*.paused.md` case), at step 3. The go-ahead: «окей, давай переписывай и сразу приступай (наверное в новой сессии). пасибо!». The `story.tsx` question (music extending `blog` too, or the piece it uses moving to kernel) is the operator's call: ask it and keep going on everything it does not block.
