# Relay 1 — making the mushroom meadow cheap for vet

## 1. Standing constraints

None stated. The session only discussed; no code changed and nothing was approved.

## 2. The conversation

**Operator:** «как бы нам сделать чтобы линтер проверял только изменённые в пиаре файлы? а то "грибы" каждый раз убивают кучу времени, даже когда их никто не трогал»

**Agent:** Routed as row 2 (a question). "Грибы" = `src/pages/mushrooms/`, 392 of 744 TS files. Measured: type-aware ESLint spends 81 s on the meadow vs 57 s on everything else; meadow tests are already skipped by `scripts/vet-test.sh` (`VET_MEADOW`). Argued against linting only changed files (and against `eslint --cache`): typed rules make an unchanged file's verdict depend on its imports, and no CI lints, so a miss lands on `main`. Proposed gating the meadow's lint on the diff like `scripts/vet-songs.sh`: lint it only when the branch touches the meadow, its import closure, ESLint config, tsconfig, package.json or the lockfile. Asked: closure hardcoded (1) or computed (2).

**Operator:** «2, НО > shared/lib/collections, shared/typings, shared/config, shared/seo — это достаточно часто используемые/меняемые модули. что именно из них импортят грибы, и можно ли это как-то ещё в отдельное вынести?»

**Agent:** The meadow imports six names: `pick` (`shared/lib/collections`, 61 files), `WithId` and `Sized` (`shared/typings`), and `PAGE_ROUTES`, `SITE_CONFIG`, `constructMetadata` — the last three only in `lib/mushrooms-metadata.ts` (page plumbing). Churn over 3 months: typings 11, config 12, seo 8, collections 2; the meadow itself 3. Proposed: leave `index.ts` and `lib/` ungated so config/seo drop out; for typings, a symbol-level gate (resolve each imported name through barrels to its declaration, check diff hunks against it). Ambient `.d.ts` (`css.d.ts`, `src/shared/config/env.d.ts`, `src/shared/i18n/next-intl.d.ts`) are always triggers — `ui/scene/start-game.ts` reads `process.env`.

**Operator:** «> Поэтому гейт по файлам потащит за собой весь баррель — index.mushrooms-only :)»

**Agent:** Works and is simpler (file-level closure), but opens the closed `PUBLIC_API` list (`eslint.config.ts`, `.claude/rules/fsd.md` § Rules) and names a consumer, so `shared` knows a page. Leaned towards it anyway if named honestly and written into `fsd.md`, plus `no-restricted-imports` keeping the meadow off the full barrel.

**Operator:** «а если index.heavy-only?»

**Agent:** Better — names a class of consumers, not a page. But the suffix grammar of `server-only`/`node-safe` describes contents, so `heavy-only` reads as "only the heavy stuff"; suggested `index.gated.ts`.

**Operator:** «а что бы значило "слайсы за гейтом"?»

**Agent:** Re-explained plainly: code vet lints only when the diff reaches it; offered `index.lint-gated.ts` as a plainer name.

**Operator:** «хм, ну если мы сейчас правильно всё отструктурируем (грибы будут импортить только самое базовое), то нам и отдельная обрезалка тестов в гейте -- которая была по сути воркараундом -- и не понадобится?»

**Agent:** Yes: meadow tests depend on the same closure (they read only `kept-record.schema.json`, inside the meadow), so one diff gate decides lint and tests; `VET_MEADOW` goes. It also fixes today's hole — a branch that changes the game skips its tests unless someone remembers `VET_MEADOW=1`. Cost: a game branch pays 30+ min per vet.

**Operator:** «к слову, кажется: если делать index.heavy-only, то должно быть ещё правило, которое требует, чтобы index.heavy-only импортил ВСЁ из тех файлов, откуда он импортит хоть что-то. Это избежит случая, когда потом в эти файлы будет соваться что-то, что "тяжёлому" не нужно»

**Agent:** Half the guard; the other half: every name the barrel exports must be imported by some gated slice. Together the files behind it hold exactly what the meadow uses. A script beside the gate, not an ESLint rule. `pick` falls outside (shared/lib has no barrel); recommended accepting it.

**Operator:** «и ещё, (а) почему оно вообще такое тяжёлое? нет ли там чего-то а-ля e2e, которое по сути не нужно всегда гонять? (б) мы же можем гипотетически гонять это матрицей через githiub actions -- будет быстрее за счёт параллелизма, а минуты на публичных репах бепслатные»

Mid-turn addendum: «(ты продолжаешь называть это .gated. хотя до этого мы обсудили что вроде гейт у нас как таковой уйдёт)»

**Agent:** On the name: what was going away was `VET_MEADOW`, not the diff gate — but under (b) the gate goes too. (a) Not e2e (that is `pnpm play:mushrooms`, outside the suite): 27 test files sweep `VISITS` (2000 seeds, `ui/scene/viewports.ts`) × `EITHER_WAY` (12 screen orientations). Per-file timing with a 20 s cap: 134 of 147 files total 229 s; 13 exceed 20 s (list in § 5). Shrinking the sample defeats the sweeps' purpose. (b) Recommended: repo is public, Actions minutes free; matrix the 13 heavy files plus one job for the rest; CI on every PR runs meadow lint+tests always; local vet skips the meadow entirely; then none of the barrel/gate structure is needed. Costs: `CLAUDE.md` § "Deployment" and `.claude/rules/deployment.md` say nothing runs on PRs — that changes, `/finalize` must wait for green CI (`/watch-ci` exists); the check must be required in branch protection. Awaiting «делай (б)».

## 3. Intent

Stop the meadow (lint and tests) from costing time on branches that don't touch it, without letting a meadow regression reach `main` unchecked. Ruled out: lint-only-changed-files and `eslint --cache` (unsound with typed rules); shrinking the 2000-seed sweeps.

## 4. Decisions

- **Leading direction: (b), a GitHub Actions matrix on PRs**, which supersedes the diff gate, the `index.heavy-only`/`index.gated` barrel and the two barrel rules. Not yet approved.
- If (b) is rejected, the fallback design is: a computed diff gate (operator chose option 2) deciding both lint and tests for the meadow, a narrow barrel (`index.heavy-only.ts` vs `index.gated.ts` — name undecided) holding `WithId`/`Sized`, the operator's rule (barrel re-exports everything from each file it touches) plus its converse (every barrel export is imported by a gated slice), `pick` accepted as is, `VET_MEADOW` removed.
- Terms: "грибы" / meadow = `src/pages/mushrooms/`; "gate" = a vet check that decides from the branch diff whether to run; "слайс за гейтом" = code vet checks only when the diff reaches it.

## 5. Errors and dead ends

- Measurements (container, 4 cores): ESLint meadow 81 s, rest 57 s; `pnpm typecheck` 15 s; meadow tests per file in `tmp/meadow-timing/out` (gone with the container). Files over 20 s: `model/house`, `ui/scene/{clump-layout,fliers,flower-layout,flower-plots,insect-layout,layout,meadow-rules,mushroom-patch,perch-sight,skyline,sun-layout,tufts}.test.ts`. The heavy files' full durations were never measured — needed to size the matrix.
- The operator flagged a naming slip: the agent kept saying `.gated.` after implying the gate would go.

## 6. State

- Branch `claude/meadow-heavy-checks-zcfy4g` (renamed from `claude/trusting-carson-zcfy4g`; deleting the old remote ref hung up, so it lingers with no PR on it). No PR. Commits are cost rows only, plus this file.
- No plan file, no CI, no subscription, no check-in.
- Estimate (unchanged, covers this session's analysis): 1.5 h senior developer — "deciding whether type-aware lint can be scoped by diff without missing verdicts needs someone who knows how typed rules depend on imports, then measuring where the time goes". Implementation is not yet sized.

## 7. Pointers

- `scripts/vet.sh`, `scripts/vet-test.sh`, `scripts/vet-songs.sh`, `scripts/lib/changed-files.sh` — current vet and gating.
- `.claude/rules/stack.md` — vet contract; `.claude/rules/deployment.md`, `.github/workflows/deploy.yml` — the "nothing on PRs" policy.
- `.claude/rules/fsd.md` § Rules, `eslint.config.ts` `PUBLIC_API` — the closed barrel list.
- `src/pages/mushrooms/CLAUDE.md`, `src/pages/mushrooms/ui/scene/viewports.ts` — why tests are heavy.
- Re-measure heavy files: `node --import tsx --test <file>` per file, timed.
- Transcript: https://claude.ai/code/session_01GTd7VeaUySkryM2XVQzXQQ

## 8. Next step

Wait for the operator: the last question put to them is whether to do (b) («Скажешь «делай (б)» — заведу через `/task`»). On a go-ahead, route through `/task`; measuring the 13 heavy files' full durations first sizes the matrix.
