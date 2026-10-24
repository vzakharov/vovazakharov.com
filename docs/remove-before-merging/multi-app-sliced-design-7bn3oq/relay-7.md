# Relay 7 — multi-app-sliced-design, after the main sync

## Standing constraints

None stated in this session beyond the repo's own rules.

## The conversation

1. **Operator**: `/handle claude/multi-app-sliced-design-7bn3oq`
   - Agent attached to the branch (PR #169, draft, base `main`, then
     `CONFLICTING`). The harness auto-branch never existed on origin, so nothing
     was deleted. Committed the fresh PR export (e21e70a). Export verdict: 3
     threads awaiting an answer — T02 (`apps/basilisk/app/sitemap.ts`), T03
     (`docs/remove-before-merging/squash-message.md`), T04
     (`docs/plans/multi-app-sliced-design.paused.md`).
2. **Operator** (mid-turn): «а, ещё забыл сказать, на мейне приехала достаточно
   большая правка про Pick и Omit, перед тем как исправлять по комментам,
   синкни с ней»
   - Agent ran `/sync-branch` (main's two-commit form): merge commit 2985ac7
     with git's raw conflicts, resolution bb180f6 (24 conflicted files, one line
     per file in its body). Then fixed a branch bug vet surfaced, c0827f6's
     sibling 4107422 (`scripts/masd-check.test.ts` fixture had been rewritten
     to `src/shell/shared/ui` by 336dd85's sweep, failing all 8 cases).
   - T04 done: `music: ["blog"]` in `src/masd.json` (c0827f6); reply posted
     with the finding that bible and basilisk import from blog exactly what
     vova does, so an app between them would be insignificant today.
   - T03: found already done on 17 Oct (5f8ae00, 336dd85); reply posted saying
     so. The look at each site under the split layouts is still open.
   - T02 («окей, делаем вариант 1») recorded in the plan's `## Rest of the
bite`, not implemented: the context budget notice came at ~200k and this
     relay is the pause.

## Intent

Finish slice 1 of the MASD elephant: the sitemap moves to each site's leaf app,
then a clean vet with `VET_MEADOW=1` and a look at each site, then `/polish` and
`/pr` per `/go`.

## Decisions

- **Music's parent is blog, not shell+blog** — blog already extends shell, so
  `["blog"]` alone; the operator's reasons: RSS on music now, newsletters later.
- **No app between blog and {bible, basilisk}** — the operator floated one if
  the likeness is "in concrete imported things"; the import tally shows none
  (both take `pages/documents`, `entities/document`, `shared/article-slots`,
  as vova does). Answered on T04; the operator may still come back on it.
- **The merge kept the branch's full-day meadow** — main's `meadowOpening`
  took a `dusk` parameter; the branch (4368da0) removed it deliberately, so the
  resolution takes main's `Reopened` type without main's `dusk`.
- **T02, option 1** (from the thread): `vova: [blog, music, mushrooms]`, vova
  declared below mushrooms; vova's app layer composes the sitemap from
  `cvRoutes()` and `musicCatalogueRoutes()`; every router's `sitemap.ts` only
  re-exports its leaf app's; basilisk, bible and lsa get their own app-layer
  sitemap holding the collections alone. The `*-routes` variants were rejected
  in the thread (a routes app would have to hold the song schema; a
  `vova-routes` under the game would make the game inherit the site).

## Errors and dead ends

- `apps/<site>` vet failure `[skills] CLAUDE.md references .claude/rules/fsd.md`
  is expected until `/finalize` swaps the staged CLAUDE.md in (the plan says
  so). Everything else in vet passed at 4107422 (without `VET_MEADOW=1`).

## State

- Branch `claude/multi-app-sliced-design-7bn3oq`, PR
  https://github.com/vzakharov/vovazakharov.com/pull/169 (draft, base `main`,
  now contains `origin/main` at 02317dc).
- Last pushed commit before this summary: 4107422.
- Plan: `docs/plans/multi-app-sliced-design.paused.md`.
- Thread replies: T04 and T03 answered; T02 waits on the implementation.
- Estimate: this session 3 h senior developer (the merge) + 1 h senior
  architect (the reparent and the bible/basilisk call). Remainder handed on:
  about 3 h senior developer for the sitemap move across four sites and its
  docs, and 1 h senior qa for the site-by-site look.

## Pointers

- `docs/pr/169/pr.md` — the export this session read (re-export before use).
- `src/masd.json`, `.claude/rules/masd.md` § "Routers and app layers" (the
  "sitemap is the router's" paragraph changes with T02), `src/kernel/app/lib/`
  (the sitemap factory), `apps/*/app/sitemap.ts`.
- This session: https://claude.ai/code/session_01Vjv6g7vLNAMP6Z39YupG1q

## Next step

`handle` — the T02 thread on `apps/basilisk/app/sitemap.ts` is the one still
unanswered: implement option 1 as the plan's `## Rest of the bite` states it,
reply on the thread with the commit, then the rest of the bite and `/go`'s tail.
