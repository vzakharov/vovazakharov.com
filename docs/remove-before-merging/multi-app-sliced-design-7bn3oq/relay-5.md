# Relay 5 — Multi-App Sliced Design

## 1. Standing constraints

- From relay 1, kept: «давай, пока обсуждаем, ничего не пересобирать, а просто обсуждать» — when the operator opens a design discussion, discuss; do not rewrite the plan meanwhile.

## 2. The conversation

No operator message in this session. It was started by relay 4's `/relay take`, resuming the paused plan at step 4 under the go-ahead «окей, давай переписывай и сразу приступай (наверное в новой сессии). пасибо!». The agent claimed the plan, put the `story.tsx` question to the operator in its first reply (below, unanswered), did steps 4–6, and paused at the context-budget warning (~200k tokens).

The question as put, in Russian: `src/music/pages/music/ui/story.tsx` imports `ProseContent` from `@/blog/entities/document`, while music's parent is `shell`. (а) music extends both `blog` and `shell` — the several-parents case the model allows and nothing uses yet; or (б) what `story.tsx` uses moves down to kernel. The agent leaned (б) where it is a markdown-body renderer, and it is: `ProseContent` is the hast→React renderer with `CONTENT_COMPONENTS` (`.claude/rules/content.md`).

## 3. Intent

Unchanged: land MASD's core (#171) on `main` as PR #169, the rest as later PRs; the plan file survives the merge as `docs/masd.md`.

## 4. Decisions

- **`sitemap(mountedRoutes)` is a factory** (`src/kernel/app/lib/sitemap.ts`), each site's `apps/<site>/app/sitemap.ts` doing `export default sitemap([...])`: Next calls a sitemap's default export with arguments of its own, so a plain function with an optional parameter would have read them as routes. vova's router passes `PAGE_ROUTES`, `cvRoutes()` (new, in `src/vova/pages/cv/lib/cv-urls.ts`) and `musicCatalogueRoutes()`.
- **`FeedSource`** (kernel `shared/content/feeds.ts`) is what `collectionFeed(collection, locale, source?)` takes; music exports `SONG_FEED`, beating a `collection === 'music'` branch in kernel.
- **Two root layouts on vova** per the plan, verified on a `build:vova` export rather than replaced by a nested `(shell)` layout under one root (which would avoid the full reload between groups but lose the toggle on 404). `global-not-found.tsx` re-exports a new vova app layer, `src/vova/app/ui/`; `experimental.globalNotFound` is set for all sites in `apps/site-next-config.ts`.
- **The `dark` play in `scripts/play-mushrooms.ts` is kept, inverted** — a dark page must open the meadow in full day — rather than deleted, so the new contract has a check.

## 5. Errors and dead ends

- The Bash hook refuses `cat`/`sed`/`head`/`tail` on files and heredoc writes; `BATCH_EDIT=1` in front lets a deliberate command through.
- `eslint --fix` sorts `@/kernel/app` after `@/music/pages` and `@/vova/pages` in routers — the layer sort reads `app` as the top layer. Expected, kept.
- `git stash`/`pop` around a check unstaged the step-5 renames; `git add -A` restored them. Avoid stashing.

## 6. State

- Branch `claude/multi-app-sliced-design-7bn3oq`; PR https://github.com/vzakharov/vovazakharov.com/pull/169 (draft, base `main`, MERGEABLE/CLEAN).
- Head: this summary's commit over fc2e1fe (plan paused) over 4368da0 (step 6), 996c7f0 (step 5), 025e0e8 (step 4). `tsc --noEmit` clean for all four sites; `build:vova` exported cleanly at step 5; no vet run.
- Plan: `docs/plans/multi-app-sliced-design.paused.md`; Progress says steps 1–6 done, 7–11 left, plus the lint state step 7 inherits and the open `story.tsx` question.
- Estimate: this session 2.5 h senior developer. Remainder handed on: `--part 8.5 senior developer "Generating boundaries policies from the app graph and writing a cross-app slice-significance check is senior work: each can break lint across four sites."`
- Nothing running, no subscription or check-in.

## 7. Pointers

- The plan — the model, the steps, Progress.
- `docs/remove-before-merging/relay-1.md` (design conversation) through `relay-4.md`.
- `src/masd.json`, `eslint/masd-graph.ts`, `eslint/rule-groups/import-sort.ts`, `eslint.config.ts` (step 7's target).
- This session's transcript: https://claude.ai/code/session_01K1r6LpiXD1dhVHHp6Cpnjf

## 8. Next step

Resume the paused plan with `/go` from its Step 1 (the `*.paused.md` case), at step 7. The go-ahead: «окей, давай переписывай и сразу приступай (наверное в новой сессии). пасибо!». The `story.tsx` question was asked and not yet answered: check for an answer, and if none, keep going on everything it does not block — it decides one edge of step 7's graph (`music: ["shell", "blog"]` or not). Read sparingly: grep for line numbers rather than `Read` a file in a rule-covered tree.
