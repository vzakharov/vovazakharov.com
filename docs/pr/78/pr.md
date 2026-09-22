# PR #78: refactor: render page PDFs in CI instead of committing them

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/78
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/pdfs-at-build-r35sqr
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-22T12:16:57Z
- **Updated:** 2026-09-22T17:16:40Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **Review cost and history weight scaled with the collection.** Anything in `PRINT_SOURCES` re-flags every printable, so a footer change was a full re-render, a binary diff per document, and one "Viewed" click each. Ten documents absorbed it; a few hundred would not. The ten PDFs and their four manifests now leave the index, and `.gitignore` keeps them out — with an exception for an authored PDF under `assets/`, which is content rather than a render and would otherwise go missing from the deploy silently.
- **Each publishing lane prints after its own `next build`**, through one composite action (`.github/actions/render-pdfs`) both call, over a cache whose prefix fallback restores whatever that site printed last. The restored manifests are what decide the reprint, so the cache key never has to name the print sources a second time. A failed print fails its lane, the render step carries a twenty-minute ceiling, and each lane uploads what it printed as a workflow artifact.
- **Which server a print comes off is now a choice** — its own `next dev`, one already running (`--origin`), or the static export (`--from-out`) — and pages print four at a time instead of one. `--origin` settles a collision that had no answer before: Next holds the app's `.next/dev/lock`, so a render could not run at all while `pnpm dev:<site>` was up.
- **Printing from the export is also a correctness fix.** `withDevServer` recorded that a dev server prints what the export prints only while nothing hydrates visible text; `--from-out` retires that caveat for everything the deploy ships. Vet loses its two `--check` entries, nothing that is not stored being able to go stale.

The plan's three open questions went unanswered, so the recommendations it was written against stand; they are the third bullet's last sentence.

## QA Checklist

- [x] `render-origins` — all three shapes run: no flag spawns a dev server (22s), `--origin` prints from a `next dev` already holding the lock, `--from-out` prints from a built export (4.8s for vova's seven pages).
- [x] `export-parity` — all ten PDFs printed off `out/` compare equal to their committed predecessors under `sameRender`, byte length included. No page on either site hydrates visible text today.
- [x] `ci-order` — full dry run per site with the PDFs deleted first: build emits no PDFs into `out/`, the render writes them into `public/`, the copy step lands seven and three at their served paths.
- [x] `ignored` — `git check-ignore --no-index` matches every PDF and manifest on both sites, and passes over `assets/**/*.pdf`.
- [x] `empty-site` — `lsa`, which prints nothing, costs an exit: no browser, no server, no `out/` needed.
- [x] `ci-cold-cache` — a `workflow_dispatch` on this branch naming `bible` renders its three inside the budget, and `findChromium()` resolves against whatever the runner ships. Run 35758385625: three printed in 11 s, cache saved, all three served 200 `application/pdf` from `agentic.bible`. A `lsa` dispatch before it (run 35758218494) took the zero-file path: no browser, nothing copied, cache save and upload skipped.
- [x] `ci-warm-cache` — the same dispatch run a second time reprints nothing, the restored manifests saying so. Run 35758634792, on a later commit so the restore went through the `pdf-bible-` prefix rather than an exact key: "3 page PDF(s) asked for, 0 to render", 0.5 s.
- [ ] `dev-404` — in a tree where nobody rendered, a `.pdf` link answers 404 rather than something worse.

| Item             | Automatable | Covered?                       | Notes                                                                             |
| ---------------- | ----------- | ------------------------------ | --------------------------------------------------------------------------------- |
| `render-origins` | yes         | no — would be a new test       | The lock collision is reproducible and worth one.                                 |
| `export-parity`  | partly      | no                             | Byte compare via `sameRender`; needs a browser, so not vet's.                     |
| `ci-order`       | only in CI  | no                             | Run by hand here against the real tree.                                           |
| `ignored`        | yes         | partly — vet's clean-tree flag | `run-parallel.sh` already reports a tree dirtied by a run.                         |
| `empty-site`     | yes         | no                             | One assertion on exit code; cheap.                                                |
| `ci-cold-cache`  | only in CI  | yes — dispatched               | Runnable before merge: dispatch on this branch. Chromium on the runner is load-bearing now. |
| `ci-warm-cache`  | only in CI  | yes — dispatched               | The second dispatch. Branch caches don't reach `main`, so the first post-merge deploy is cold regardless. |
| `dev-404`        | yes         | no                             | The link is derived from the route and never checks the file — read, not run yet. |

https://claude.ai/code/session_01F8kvcAWsgDqWWiRbWRQQwz

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-22T12:17:49Z — "Proposed squash title/body: ``` refactor: render page PDFs i…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-22T12:17:49Z

[https://github.com/vzakharov/vovazakharov.com/pull/78#issuecomment-5776331910](https://github.com/vzakharov/vovazakharov.com/pull/78#issuecomment-5776331910)

Proposed squash title/body:

```
refactor: render page PDFs in CI instead of committing them (pr #78)
```

```
Committed PDFs tied review cost and history weight to the size of the
collection: everything in PRINT_SOURCES re-flags every printable, so a
change to the printed footer rewrote every file, filled the diff with
binaries, and cost a "Viewed" click each. Ten PDFs and four manifests
leave the index; the renders with no build-time step to move to — the
Open Graph cards, the mermaid SVGs — carry linguist-generated instead,
for the same collapse in a diff.

The render now runs in each publishing lane after that site's next
build, printing from the static export into out/, and the repository
carries neither the PDFs nor their manifests. Which server a print
comes off is the script's to choose — its own dev server, one already
running, or the export — so a render no longer collides with a dev
server holding .next/dev/lock, and pages print concurrently rather than
one at a time. Both lanes render through one composite action over a
cache that falls back to the most recent prior render, so only what
drifted is reprinted.

Printing from the export also closes the gap withDevServer recorded: a
dev server prints what the export prints only while nothing hydrates
visible text. A failed print fails its lane, leaving the previous
deploy served rather than a link that 404s, and each lane uploads what
it printed for anyone wanting to look before merge. Vet loses its two
--check entries, nothing being able to go stale that is not stored, and
a .pdf link answers 404 in a tree where pnpm content:pdf:<site> has not
run.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `.github/actions/render-pdfs/action.yml`:1 — unresolved — last: @vzakharov (human) 2026-09-22T17:16:04Z — "вроде всё ок, спасибо. а можно, чтобы артефакты выдавались н…" → [↓](#t01)
- **T02** `.github/actions/render-pdfs/action.yml`:1 — resolved — last: @vzakharov (agent) 2026-09-22T13:59:37Z — "Да, на двух уровнях. **Внутри сайта** — `PRINT_WORKERS = Mat…" → [↓](#t02)
- **T03** `scripts/render-pdf.ts`:16 — unresolved — last: @vzakharov (human) 2026-09-22T17:16:40Z — "точно, заведи в muthur, а этот закрой. я там ещё один коммен…" → [↓](#t03)
- **T04** `.gitattributes`:4 — resolved — last: @vzakharov (agent) 2026-09-22T13:59:41Z — "Справедливо — фраза определяла набор через тот, который из д…" → [↓](#t04)

<a id="t01"></a>

### `.github/actions/render-pdfs/action.yml`:1 — unresolved

**@vzakharov (human)** — 2026-09-22T13:16:16Z

как мы можем проверить, что оно всё работает, до мёрджа?

**@vzakharov (agent)** — 2026-09-22T13:59:35Z

Через `workflow_dispatch` на этой ветке. Он обходит гейт и берёт поле `site`, а версия воркфлоу и композитного экшена берётся с той ветки, на которой запускаешь, — то есть прогоняется ровно этот диф. Цена: выбранный сайт при этом реально публикуется.

Лестница от безопасного к показательному:

1. **`site=lsa`** — у него нет ни одной печатаемой страницы, так что браузер не стартует вообще. Проверяет проводку: `in-site.sh` с новым `PATH`, `timeout 20m`, шаг копирования с нулём файлов и оба `if: count != '0'`. Публикация при этом побайтово та же, что сейчас.
2. **`site=bible`** — три PDF. Вот это и есть проверка того, что `findChromium()` находит браузер на раннере, плюс холодный кэш и реальное время печати. Второй запуск подряд проверяет тёплый кэш: манифесты вернутся из кэша, ничего не перепечатается.
3. **`site=vova`** — семь PDF, самый большой набор, но публикует основной сайт.

Публикация на шагах 1–2 содержательно нулевая: QA-пункт `export-parity` уже показал, что все десять PDF, напечатанных из экспорта, побайтово равны закоммиченным (после нормализации `sameRender`). То есть приёмник получит ту же самую страницу.

Одна оговорка, которую дожать нельзя: **кэш Actions скоупится по ветке**. Ветка читает свой кэш и кэш дефолтной, но `main` кэш фиче-ветки не видит. Так что тёплый кэш мы здесь докажем для ветки, а первый деплой после мёрджа всё равно будет холодным — один раз, на полный набор.

Скажи, и я запущу 1 и 2 — сам не стал, потому что шаг 2 делает force-push в `vzakharov/agentic.bible`.

**@vzakharov (human)** — 2026-09-22T16:57:20Z

давай

**@vzakharov (agent)** — 2026-09-22T17:08:48Z

Прогнал, все три зелёные.

1. **`lsa`**, run 35758218494: «0 page PDF(s) asked for, 0 to render». Браузер не стартовал, копировать было нечего, сохранение кэша и загрузка артефакта пропущены по `count == 0`. Публикация прошла.
2. **`bible` на холодном кэше**, run 35758385625: кэша нет ни по ключу, ни по префиксу. `findChromium()` нашёл браузер на раннере, три PDF напечатались за 11 с, кэш сохранён, артефакт выложен. Все три отдаются живьём с `agentic.bible`: 200, `application/pdf`, размеры совпадают с тем, что лежит на `gh-pages`.
3. **`bible` на тёплом кэше**, run 35758634792. Запустил уже на следующем коммите (99aac3e), а не на том же SHA, чтобы кэш восстановился через префикс `pdf-bible-`, как будет на настоящем следующем деплое, а не точным попаданием в ключ. Вышло «3 page PDF(s) asked for, 0 to render», рендер за 0,5 с.

`vova` не трогал: он публикует основной сайт, и о нём речи не было. Чекбоксы `ci-cold-cache` и `ci-warm-cache` в теле PR отмечены. Оговорка про первый деплой после мёрджа в силе: `main` кэш ветки не видит, так что там один раз будет холодно.

**@vzakharov (human)** — 2026-09-22T17:16:04Z

вроде всё ок, спасибо. а можно, чтобы артефакты выдавались не зипом, а прямо списком пдфок? или это не от нас зависит?

<img width="676" height="205" alt="Screenshot 2026-09-22 at 19 15 53" src="./attachments/eaf47034-989a-4455-be09-8ddcb5037cd9.png" />

---

<a id="t02"></a>

### `.github/actions/render-pdfs/action.yml`:1 — resolved

**@vzakharov (human)** — 2026-09-22T13:17:13Z

и второй вопрос -- мы параллелим рендер?

**@vzakharov (agent)** — 2026-09-22T13:59:37Z

Да, на двух уровнях.

**Внутри сайта** — `PRINT_WORKERS = Math.min(4, os.availableParallelism())` воркеров разбирают общую очередь (`drain` в `render-pdf.ts`), так что медленная страница тормозит только себя, а не хвост за собой. Семь страниц vova печатаются за 4.8 с из экспорта; по одной было бы около двадцати двух за штуку.

**Между сайтами** — тоже, но не этим кодом: `build-vova` и матрица `publish` — разные джобы, а внутри `publish` матрица разводит `lsa` и `bible` по разным раннерам с `fail-fast: false`. Так что все три лейны печатают параллельно и без моего участия.

Не параллельны только `next build` и рендер внутри одной лейны — рендеру нужен готовый `out/`.

---

<a id="t03"></a>

### `scripts/render-pdf.ts`:16 — unresolved

```diff
@@ -1,28 +1,31 @@
… 9 lines elided …
- * A static export has no request-time renderer, so the alternative to a
- * committed file is no PDF at all. It is each page's existing print stylesheet
- * that is printed, not a layout of its own.
+ * A static export has no request-time renderer, so the alternative to a file
+ * produced ahead of the request is no PDF at all. It is each page's existing
+ * print stylesheet that is printed, not a layout of its own.
  *
- * Run by hand when a printable or anything shaping its printed form changes —
- * never by `next build`, so CI installs no browser. `--check` keeps that
- * honest: it hashes each PDF's whole source set against the manifest, needing
- * no browser, which is why `vet.sh` can run it beside every other check.
+ * **The PDFs are build artifacts, not committed files.** The deploy runs this
+ * after `next build` with `--from-out` and copies what it produces into `out/`,
+ * so the `.pdf` link a page always emits answers 404 in a tree where this has
+ * not run — `.claude/rules/content.md` carries the whole contract.
```

**@vzakharov (human)** — 2026-09-22T13:21:39Z

на всякий случай перепроверь на медведей едё раз (здесь и аналогичную прозу)

**@vzakharov (agent)** — 2026-09-22T13:59:39Z

Медведей нашёл трёх, все — про то, чем PDF больше не являются. db03fae.

- Здесь: «**The PDFs are build artifacts, not committed files.**» → без хвоста. Читатель нынешнего дерева не собирался их коммитить.
- `.claude/rules/content.md`: «Nothing is committed and nothing is vetted:» — два отрицания подряд вместо механики. Теперь: лейна печатает после своей сборки поверх кэша прошлого прогона, и хэши — единственный судья.
- `CLAUDE.md` и `vet.sh` в один голос: «nothing that is not stored can go stale». Двойное отрицание, да ещё и в двух местах. Теперь обе говорят, где живёт манифест, против которого чек сравнивал бы, — в кэше лейны, а не в дереве.

Три формулировки оставил, хотя они отрицательные, — они отвечают на вопрос, который дерево задаёт само:

- «**There is no PDF entry**» в списке vet. `--check` у скрипта никуда не делся, и рядом стоят два OG-чека, так что «а где PDF-чек?» — живой вопрос, а не воспоминание.
- «An authored PDF … is not a render» в `.gitignore` — это ровно тот признак, который кодирует строка с `!`.
- «The manifests stay behind: they are the render's bookkeeping, not published files» в экшене — объясняет, почему шаг копирования фильтрует по `*.pdf`.

**@vzakharov (human)** — 2026-09-22T16:59:54Z

давай-ка заведём issue который к проверке медведей добавляет греп по всем "не-подобным" словам в диффе (nothing, neither, not, none, etc.) -- в трёх найденных выше (и пропущенных изначально) "медведях" их не было.

**@vzakharov (agent)** — 2026-09-22T17:05:12Z

Завёл: #80.

Одна поправка, и она работает на тебя: как раз в этих трёх такие слова **были**, во всех — «not committed files», «Nothing is committed and nothing is vetted», «nothing that is not stored». Пропустил я их не поэтому. У линзы два признака, и ищется грепом только первый — подлежащее из списка удалённых имён. Эта ветка убрала не имя, а свойство: PDF, манифесты и скрипт на месте, просто больше не коммитятся. Список вышел пустой, греп ничего не нашёл, а второй признак держится на внимании при чтении. Твой греп даёт поиск ровно этому второму признаку. На диффе этой ветки он даёт 52 кандидата на 486 добавленных строк, и все три медведя среди них.

В issue есть ещё два пункта. Скилл вендорный из `vzakharov/muthur`, так что правка по-хорошему делается там и приезжает сюда через `/update-muthur`. И шум в основном от кода (`--no-sandbox`, тексты ошибок), поэтому грепать стоит только комментарии и markdown.

**@vzakharov (human)** — 2026-09-22T17:16:40Z

точно, заведи в muthur, а этот закрой. я там ещё один коммент оставил, учти его в новом

---

<a id="t04"></a>

### `.gitattributes`:4 — resolved

```diff
@@ -1,2 +1,11 @@
 # Auto detect text files and perform LF normalization
 * text=auto
+
+# The renders that stay committed, marked so GitHub collapses them in a pull
```

**@vzakharov (human)** — 2026-09-22T13:52:16Z

что за рендеры которые stay committed?

**@vzakharov (agent)** — 2026-09-22T13:59:41Z

Справедливо — фраза определяла набор через тот, который из дерева уже не виден, и не называла ни одного участника. Теперь называет: карточки Open Graph, диаграммы mermaid и манифесты, хэширующие исходники карточек. db03fae

По факту это `*.og.png` (четыре штуки), `og-renders.json` (три) и `apps/*/public/generated/mermaid/*.svg`. Шаблон `*-renders.json` оставил общим, а не `og-renders.json`: `pdf-renders.json` теперь игнорится, так что сегодня он ловит только OG, но следующий манифест подберёт сам.

---

## Timeline (status, references, and other events)

- **2026-09-22T12:52:15Z** @vzakharov renamed from «docs: plan moving page PDFs from committed to built artifacts» to «refactor: render page PDFs in CI instead of committing them».
- **2026-09-22T13:52:22Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/78#pullrequestreview-5278582621.
- **2026-09-22T17:04:59Z** @vzakharov cross-referenced this pull request from [#80 tend-prose negation: grep the added lines for negators, not only for removed nouns](https://github.com/vzakharov/vovazakharov.com/issues/80).
