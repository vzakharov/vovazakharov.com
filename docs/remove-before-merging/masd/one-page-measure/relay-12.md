# Relay 12 — PR #216 review round: test kits, test splits, no-export-namesake

## Standing constraints

None stated in this session beyond CLAUDE.md. The muthur sync offer was made; do
not make it again.

## The conversation

1. **Operator:** `/handle masd/one-page-measure`

   **Agent:** Attached to the branch (PR #216, base
   `claude/multi-app-sliced-design-7bn3oq`, draft, mergeable). The export
   verdict was 3 unanswered threads, all the review lane (the paused elephant
   plan has no draft, so no plan lane):
   - T01 (`lawn.ts:38`, «чтобы ошибка с перепутыванием CELL-а не повторилась,
     может, забрендить их?»): replied no brand — arithmetic strips a brand, it
     would have caught one of three misuse sites; distinct names fixed the
     cause.
   - T02 (`door-sight.ts:136`, memory leaks in caches / WeakMaps): replied no
     time-growing leak; only `grown` in `mushroom-genes.ts` grows, by planting,
     and pins the genes-keyed WeakMaps; weak values would defeat the cache.
   - T03 (`tufts.test.ts:1`, «раздуло, надо разделять (посмотри и другие если я
     упустил). если нужен общий харнес … придумать конвенцию для него, которая
     также сможет когда надо грузить .test-only»): built the test-kit convention
     and split all 12 game test files over ~450 lines (three subagents), 254
     tests before and after; replied on the thread. `/polish`, `/pr` refresh,
     squash proposal, five-percent entry followed.
   - Asked mid-turn: «а что если линтером запретить локальные константы с
     одинаковым именем в разных файлах?» — agent proposed a gate on exported
     names with an app-local namesake (8 const hits by its count), as a script
     beside `check:masd`, and asked whether to do it in this PR.

2. **Operator:** «ты чойто на буржуйский перешёл :) да, давай, только почему не
   линт? он не умеет смотреть в другие файлы? но делай в общем как считаешь
   нужным»

   **Agent:** Back to Russian. Built it as an ESLint rule after all —
   type-aware lint gives a rule the whole program. `vova/no-export-namesake`;
   fixed the 15 names it found (dedup to one home where one value, a
   distinguishing name otherwise); replied on T01 with the session's question as
   lead-in.

3. **Operator (mid-turn):** «некоторые тёзки у нас к слову намеренные, всякие
   messages и пр»

   **Agent:** Restored maya's two page catalogues to `messages` and added a
   `CONVENTIONAL` set (`messages` alone) to the rule; asked which other
   deliberate namesakes «и пр» covers — none seen among the hits. Then ran
   `/polish` and paused for the context budget (verbatim in Last agent turn).

## Intent

Get PR #216's review threads answered and the trap behind the `CELL` regression
closed for good: tests held to the same size rule as production, a shared-harness
convention that can load `.test-only` barrels, and a lint guard against
same-named module values one of which is exported. The operator wants the agent
to use judgement («делай в общем как считаешь нужным») and to reply in Russian.

## Decisions

- **Test kit** — `<subject>.test-kit.ts` beside the tests it serves, test code
  but not a test. `TEST_CODE` / `TEST_KIT` / `TEST_FILE` in
  `eslint/masd-graph.ts`. Beat a `*.test.ts`-named helper (the runner would pick
  it up). The fence (only the kit's own slice/segment test code may import it)
  needed `boundaries`' `checkInternals: true`, since the plugin skips
  same-element imports by default; boundaries policies are last-match-wins.
  Documented in `.claude/rules/testing.md`.
- **Split naming** — `<subject>-<aspect>.test.ts`; `tufts`' 280-line describe
  sits in two files under the same describe title.
- **No brand for `CELL`** (T01) and **no change to caches** (T02) — reasoning in
  the thread replies.
- **Lint rule, not a script gate** — operator's question; type-aware lint has
  `parserServices.program`. Scope: module-level variables only (functions with
  differing signatures fail tsc; the operator asked about constants),
  production files per app, private pairs spared, tests and kits out,
  `CONVENTIONAL` names (`messages`) spared per operator.
- **Dedup over rename** where namesakes were one value: `FPS` →
  `mushroom-probe-drive.ts` beside `FRAME_MS`; `BOB_SHARE` → read from
  `shared/world/walking.ts`; `REPO_ROOT` → new `src/kernel/scripts/lib/repo-root.ts`
  (`site-tree.ts` re-exports it), because `site-tree.ts` resolves a site on
  import and `print-origin` / `check-i18n-payload` must not.
- **type-overlap keeps its own test regex** — sharing `TEST_FILE` would tie it to
  the MASD module.

## Errors and dead ends

- First kit fence (`from: { file: { categories: '!test' } }`, then `noneOf`)
  never fired: null categories match nothing, and same-slice imports are not
  checked without `checkInternals`.
- First segment fix missed `shared/world` kits: the allow covered sliced layers
  only (fixed in 8d7cec84 via `sibling()` handling `segmentName`).
- `git add -A <globs>` did not stage deleted originals twice; fixed with
  separate deletion commits (43888135, f93f7411).
- Importing `REPO_ROOT` from `site-tree.ts` crashed bare Node without
  `NEXT_PUBLIC_SITE`; replaced by `repo-root.ts`.
- Renamed maya's `messages` before learning they are deliberate; reverted
  (8c970146).

## State

- Branch `masd/one-page-measure`, PR
  https://github.com/vzakharov/vovazakharov.com/pull/216 (draft, base
  `claude/multi-app-sliced-design-7bn3oq`), everything pushed; head is the
  session-cost commit after `41ac2e76` (polish). Working tree clean.
- Plan: `docs/plans/multi-app-sliced-design.paused.md` (the elephant, untouched
  this session).
- PR body and the squash proposal (comment 6418140145,
  `docs/remove-before-merging/masd/one-page-measure/squash-message.md`) cover
  the kits, splits and the rule.
- No vet run this session (that is `/finalize`'s, with `VET_MEADOW=1` since the
  game changed). Checked locally: full-tree eslint, tsc, knip, check:masd,
  Steiger, type-overlap, the rule's 11 tests, masd-check/type-overlap tests,
  every split piece's tests.
- Nothing running, no PR subscription, no scheduled check-in.
- Estimate: this session holds the whole job — 12 h middle developer ("splitting
  twelve simulation-heavy test files without dropping a case, then fixing
  fifteen namesakes by value, is careful but routine work"), 3 h senior
  architect ("a test-kit fence and a cross-file lint rule each had to fit the
  checkers' notion of test code and the plugin's blind spots"), 1 h senior
  developer ("the cache-leak and branding answers need the cache graph traced,
  not guessed"). No remainder handed on.

## Pointers

- `eslint/rules/no-export-namesake.ts` and its `.test.ts` — the rule.
- `eslint/masd-boundaries.ts` — the kit fence (`checkInternals`, last policies).
- `.claude/rules/testing.md` § "Splitting a test file" — the convention.
- `writing/notes/the-five-percent.md` — this round's entry under "a rule read to
  its letter".
- Predecessor transcript: https://claude.ai/code/session_01DaohkDpWGXCrFemdqPWHSZ

## Next step

Wait for the operator. Open with them, unanswered:

- Whether «и пр» names further deliberate namesakes for the rule's
  `CONVENTIONAL` set.
- The last `/polish` reported, for the operator to decide: repo root still
  computed locally in `src/mushrooms/scripts/play-mushrooms.ts:65` (`ROOT`, a
  tsx script already importing `@/kernel/scripts/lib/`), and in the bare-Node
  `src/shell/scripts/generate-styles.ts:36` and `check-mantine-styles.ts:32`
  (could import `@/kernel/scripts/lib/repo-root.ts` relatively, with extension)
  — not yet done; and `scripts/lint-fsd.ts:22` outside `src/`.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages,
usually unneeded but harmless; the reply proper is usually its last
paragraphs.

```text
Ты прав, сполз на английский — возвращаюсь на русский.

И ты прав насчёт линта. Я ошибся: правило ESLint видит файлы по одному, но у нас линт type-aware, и правилу доступна вся программа TypeScript, со всеми файлами. Тогда правило лучше скрипта: ошибка встаёт прямо на объявлении, в редакторе, без отдельного гейта. Делаю правилом. Сначала смотрю, как устроены наши правила.

Пишу само правило: `vova/no-export-namesake`.

Now the deduplication. `BOB_SHARE`:

Now `FPS`: its home is next to `FRAME_MS` in the page driver.

Now `REPO_ROOT`: both scripts take it from `site-tree.ts`.

Now a test for the rule: a throwaway tree, a TypeScript program over it, and the real `Linter`.

Lint on the changed files is clean, `tsc` is clean. Now the whole tree: lint, `knip`, the affected tests, and checking that bare Node still loads `check-i18n-payload`.

`site-tree.ts` resolves the site when it's imported (line 32), so the comment in `print-origin` had a point. `REPO_ROOT` gets a module of its own that resolves nothing.

All clean. Committing in two steps: renames and deduplication first, then the rule, so each commit leaves the tree green.

Отвечу и в треде про `CELL` — там эта история и началась.

Обновляю squash-предложение и описание PR под новое правило.

Прогоняю `/polish` по новым коммитам.

Сделал правилом линта, как ты предлагал, и ты был прав: ESLint видит соседние файлы. Правилу доступна вся программа TypeScript, которую наш type-aware линт и так строит. Я зря отправлял это в отдельный скрипт.

**Что ловит `vova/no-export-namesake`.** Две модульные переменные с одним именем в разных файлах одного приложения, если хоть одна из них экспортирована. Ошибка встаёт на обе стороны пары. Эту ловушку и устроил `CELL`: импорт связан с объявлением только именем, а константа не из того файла, но того же типа, проходит `tsc`.

**Что правило не трогает:**
- две приватные тёзки, их через импорт не перепутать;
- тесты и киты;
- функции: правило смотрит только на переменные;
- имена из списка конвенций. Пока там один `messages`: каталог зовётся так везде, а чей он — говорит путь импорта.

Каталоги двух страниц Майи я сначала переименовал, после твоего замечания вернул им `messages`. Если «и пр.» — это ещё какие-то намеренные тёзки, назови их, добавлю в список. Среди того, что правило нашло, других намеренных я не увидел.

**Что оно нашло в дереве: 15 имён.** Все исправлены (`0a10e32c`):
- **Одно значение в нескольких местах — теперь у него один дом:**
  - `FPS`, свой в каждом плее, теперь лежит рядом с `FRAME_MS` в `mushroom-probe-drive.ts`.
  - `BOB_SHARE` плей берёт из `walking.ts`.
  - `REPO_ROOT` переехал в новый `kernel/scripts/lib/repo-root.ts`. Сначала я брал его из `site-tree.ts`, но при импорте тот выбирает сайт по `NEXT_PUBLIC_SITE`, и без этой переменной скрипт падает. Поймал запуском под голым Node.
- **Разные значения — приватное названо по тому, чем отличается:** `DOOR_FRAME_MARGIN`, `ICON_HEAD_REACH`, `TAKE_OFF_MS`, `PAGE_POLL_MS` и другие. Самый показательный случай — `MAP_MOTTLES_PER_CELL = 2` у карты против `MOTTLES_PER_CELL = 3` у луга, тот же `CELL` в миниатюре.

На всём дереве линт, `tsc`, `knip`, `check:masd` и тесты правила (11 штук) чистые. Плеи сам не гонял: им нужна сборка, и в `vet.yml` они пока выключены. Их проверяют `tsc` и линт.

Ответил в треде про `CELL`, обновил описание PR и squash-предложение. Сейчас `/polish` проходит по новым коммитам; когда закончит, расскажу, что он поменял.
```
