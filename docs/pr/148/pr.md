# PR #148: feat(vova): Latin-first spelling with the locale chip as the script switch

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/148
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/latin-first-transliteration-ymni59
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-13T11:53:15Z
- **Updated:** 2026-10-13T19:46:12Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 4

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at ec77454). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `apps/vova/public/music/minem-babay.md`:3 — unresolved — last: @vzakharov (human) 2026-10-13T19:44:26Z — "слаг тоже поменять, ничего страшного" → [↓](#t01)
- **T02** `src/pages/music/lib/albums.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-13T19:44:54Z — "issue не надо, сессию новую создай с этой задачей" → [↓](#t02)
- **T03** `src/shared/lib/script-preference.ts`:38 — unresolved — last: @vzakharov (human) 2026-10-13T19:46:12Z — "> и это лишний блокирующий запрос перед отрисовкой. сколько…" → [↓](#t03)
- **T04** `apps/vova/public/music/minem-babay.md`:18 — unresolved — last: @vzakharov (human) 2026-10-13T19:47:22Z — "думаешь эта переделка отражает то как это звучит по-разному…" → [↓](#t04)

---

## Body

## Summary

- **Names and words in a script the reader's locale doesn't read show in Latin letters by default** — Russian under `en`, Arabic and Greek under both. The current language chip is the switch: it reads `EN / Abc` in Latin and `EN / Абв` in the original, its sample being the script most of the page's names are in (`أبج` on Mithqal, `Αβγ` on Agios o skopos). It is on every music page that has something to switch (song, artist, album, index) and the choice holds across the site: names, catalogue, player bar, lock-screen metadata, lyrics. A page with nothing to switch keeps the plain chip. A reader whose browser lists Russian starts in the original; a stored choice always wins.
- **No flash, no hydration mismatch.** Both spellings are in the static HTML as `data-spelling` spans; a head script in the `ColorSchemeScript` mould marks `<html data-script="original">` before paint, from `localStorage` or else the browser's languages, and the stylesheet hides the other span. The script renders as a plain `<script>` child with backtick-quoted strings, and tests pin both that and its agreement with `defaultScript`, so it needs no `dangerouslySetInnerHTML`.
- **Russian is romanized by one rule** (`shared/music-catalogue/romanize.ts`, BGN/PCGN-style: `ye` everywhere but after a consonant, `ʼ` for ь/ъ). Other scripts are spelled by hand — a `titleLatin` in frontmatter, a `<!-- lyrics:<lang>-latn -->` section — and the build fails on anything neither covers. Mithqal's `keepsScript` keeps the Arabic words with the romanization under them, while its title switches like any name; the gloss line under a title is the translation alone.
- **Metadata takes the default spelling**: `<title>`, `og:title` and the song feeds read in Latin wherever the locale gets one. `.claude/rules/songs.md` describes the new frontmatter.

## QA Checklist

- [ ] `en-default` — A Russian song under `/en` in a browser with no Russian in its languages: the title and words are in Latin italics, the chip reads `EN / Abc`, and the line under the title shows the translation only.
- [ ] `switch` — Clicking the chip shows Cyrillic in the title, byline and words, and the chip reads `EN / Абв`; clicking again returns to Latin.
- [ ] `every-page` — The music index, an artist and an album under `/en` carry the same chip, and switching on one shows Cyrillic names on the others.
- [ ] `ru-browser` — With `ru` among the browser's languages and nothing stored, a Russian song under `/en` opens in Cyrillic.
- [ ] `no-flash` — After switching to the original, a reload paints Cyrillic from the first frame.
- [ ] `two-tabs` — With a song open in two tabs, switching in one switches the other.
- [ ] `ru-cyrillic` — Russian and Tatar songs under `/ru` show a plain `RU` chip and Cyrillic words.
- [ ] `mithqal` — Under `/ru` the chip reads `RU / Abc` ⇄ `RU / أبج`; Latin mode shows the title as *Mithqāl* alone and the words in Arabic with the romanization under each line; original mode shows the Arabic title and words alone.
- [ ] `trisagion` — A Latin title over Cyrillic words under `/en` still gets the chip, which switches the words alone.
- [ ] `farewell` — The Chinese lines stay Chinese in both modes, with their footnote, and under `/ru` the Russian around them stays Cyrillic.
- [ ] `phone` — At 375px the row `← Music · EN / Abc · RU · 🌙` fits one line with no horizontal scroll.
- [ ] `screen-reader` — The chip is announced as a switch named "EN: original script", checked in original mode.
- [ ] `og` — `og:title` and `<title>` of a Russian song's `/en` page are in Latin.
- [ ] `player` — Playing a Russian song under `/en` shows the player bar and lock-screen title in the current mode.
- [ ] `build-check` — A song in a non-Latin script with no rule and no hand-written Latin fails the build.

| Item            | Automatable | Covered? | Notes                                                                                        |
| --------------- | ----------- | -------- | -------------------------------------------------------------------------------------------- |
| `en-default`    | e2e         | ❌       | Previewed over CDP; load `/music/20/en`, assert the Latin `<h1>` span is visible             |
| `switch`        | e2e         | ❌       | Previewed over CDP; click `[role=switch]`, assert `html[data-script=original]`               |
| `every-page`    | e2e         | ❌       | Previewed over CDP on index and artist                                                       |
| `ru-browser`    | unit        | ✅       | `script-preference.test` — runs the head script in `node:vm` against `defaultScript`         |
| `no-flash`      | e2e         | ❌       | Seed `localStorage`, assert the first screenshot is Cyrillic                                 |
| `two-tabs`      | e2e         | ❌       | Two pages, write in one, assert the `storage` event flips the other                          |
| `ru-cyrillic`   | e2e         | ❌       | `/music/20/ru` has no `[role=switch]`                                                        |
| `mithqal`       | e2e         | ❌       | Both modes, count Arabic and Latin lines                                                     |
| `trisagion`     | e2e         | ❌       | Click switches the words column only                                                         |
| `farewell`      | unit        | ✅       | `spelling.test` — "passes over a script with no sample"; `romanize.test` passes non-Russian through |
| `phone`         | e2e         | ❌       | Previewed over CDP at 375px; assert `scrollWidth <= innerWidth`                              |
| `screen-reader` | manual-only | —        | Needs a real screen reader                                                                   |
| `og`            | integration | ❌       | Read the built HTML's meta tags                                                              |
| `player`        | manual-only | —        | Lock-screen metadata needs a real device                                                     |
| `build-check`   | unit        | ✅       | `spelling.test` — "fails on a script nothing romanizes", "fails when only scripts with no sample need Latin" |

https://claude.ai/code/session_01WEJTRA9WU3HDxVZrucqZ1Q

🤖 Generated with [Claude Code](https://claude.com/claude-code)

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-13T11:53:33Z — "Proposed squash title/body: ``` feat(vova): Latin-first spel…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-13T11:53:33Z

[https://github.com/vzakharov/vovazakharov.com/pull/148#issuecomment-6144941526](https://github.com/vzakharov/vovazakharov.com/pull/148#issuecomment-6144941526)

Proposed squash title/body:

```
feat(vova): Latin-first spelling, the locale chip as the switch (pr #148)
```

```
A reader met a Russian song under /en in a script they may not read,
with its Latin spelling tucked into a muted line and the lyrics'
romanization behind a switch most never pressed. Names and words in a
script the locale does not read natively now show in Latin by default:
Russian under en, Arabic and Greek under both locales, while Cyrillic
stays Cyrillic under ru.

The current language chip on every music page with something to
switch is a checkbox between the spellings, site-wide: "EN / Abc" in
Latin, "EN / Абв" in the original, the sample being the script most of
the page's names are in. Names, lists, the player and the lock-screen
metadata all follow. A browser that lists Russian starts in the
original; a stored choice wins. Both spellings sit in the static HTML,
and a head script marks <html> before paint, so there is no flash and
no hydration mismatch. <title>, og:title and the feeds stay in Latin.

Russian is romanized by rule, BGN/PCGN-style: ye wherever e does not
follow a consonant, and U+02BC for the soft and hard signs. Other
scripts carry hand-written spellings, and the build fails on a name or
words that need one and have none. A song flagged keepsScript (Mithqal)
keeps its Arabic words in both modes, the romanization under them in
Latin mode; its title switches like any name. The muted line under a
title carries only the translation, and the lyrics switch is gone.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_2 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `apps/vova/public/music/minem-babay.md`:3 — unresolved — last: @vzakharov (human) 2026-10-13T19:44:26Z — "слаг тоже поменять, ничего страшного" → [↓](#t01)
- **T02** `src/pages/music/lib/albums.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-13T19:44:54Z — "issue не надо, сессию новую создай с этой задачей" → [↓](#t02)
- **T03** `src/shared/lib/script-preference.ts`:38 — unresolved — last: @vzakharov (human) 2026-10-13T19:46:12Z — "> и это лишний блокирующий запрос перед отрисовкой. сколько…" → [↓](#t03)
- **T04** `apps/vova/public/music/minem-babay.md`:18 — unresolved — last: @vzakharov (human) 2026-10-13T19:47:22Z — "думаешь эта переделка отражает то как это звучит по-разному…" → [↓](#t04)

<a id="t01"></a>

### `apps/vova/public/music/minem-babay.md`:3 — unresolved

```diff
@@ -1,5 +1,6 @@
 ---
 title: 'Минем бабай'
+titleLatin: 'Minem babay'
```

**@vzakharov (human)** — 2026-10-13T19:17:36Z

так, а) а тут зачем, учитывая что транслитерация по правилам кириллицы? или это сложнее сочетать с вручную прописанной лирикой? в любом случае не настаиваю; б) давай переименуем в Babay minem заодно

**@vzakharov (agent)** — 2026-10-13T19:40:26Z

а) Правило транслитерации у нас только для русского, а песня на татарском, поэтому сборка требует написанную вручную латиницу. Название целиком из русских букв, так что правило дало бы то же самое. Но на остальном татарском тексте оно ошибается: ә, ө, ү, җ, ң, һ ему неизвестны, а к/г по сингармонизму становятся q/ğ (тот же раздел `tt-latn` на Заманалифе). Поэтому разрешать правилу «татарский, если буквы русские» я не стал: название вышло бы по одной системе, а текст под ним по другой.

б) Переименовал: «Бабай минем» / *Babay minem*, как в припеве, а переводы — «Дедушка мой» / “Grandpa of Mine”, как в подстрочнике. Slug `minem-babay` оставил, адрес уже опубликован. 00f81a5

**@vzakharov (human)** — 2026-10-13T19:44:26Z

слаг тоже поменять, ничего страшного

---

<a id="t02"></a>

### `src/pages/music/lib/albums.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-13T19:22:47Z

так, а зачем мы вообще инфу об альбомах храним тут, а не во фронтамттерах их мдшек?

**@vzakharov (agent)** — 2026-10-13T19:40:29Z

Так было и до этой ветки: `MUSIC_ALBUMS` и `PROJECT_*` лежат на `main`, ветка только меняет форму названий и глоссов. Причина в том, что альбом и артист — это перечисление (`MusicAlbum`, `MusicProject` в `shared/music-catalogue`). Песня ссылается на них в своём frontmatter, и опечатка в `album:` или `project:` валит сборку ещё на проверке типов. Как файлы `.md` лежат только три альбома и одна страница артиста, у остальных записей файлов нет вовсе.

Перенести во frontmatter можно, но это отдельная работа:
1. у каждого альбома и артиста появляется свой `.md`;
2. перечисление строится из этих файлов (кодогенерация, как у `styles:codegen`) или проверка «такой альбом существует» переезжает в схему при сборке;
3. `albums.ts` и `projects.ts` превращаются в чтение этих файлов.

Предлагаю завести под это отдельный issue, а не растить этот PR. Согласен?

**@vzakharov (human)** — 2026-10-13T19:44:54Z

issue не надо, сессию новую создай с этой задачей

---

<a id="t03"></a>

### `src/shared/lib/script-preference.ts`:38 — unresolved

```diff
@@ -0,0 +1,38 @@
… 23 lines elided …
+    : 'latin';
+}
+
+/**
+ * Set on `<html>` before the body paints, as Mantine's `ColorSchemeScript`
+ * sets the colour scheme, so the first paint already shows the stored
+ * spelling, else `defaultScript`'s, which it restates. The root layout renders
+ * it, which is why the client hook that reads the same choice lives in a module
+ * of its own.
+ *
+ * It renders as a plain `<script>` child, which React HTML-escapes, so it must
+ * hold none of `" & ' < >` — its strings are backtick-quoted, and it has no
+ * arrow function or `&&`, for that reason.
+ */
+export const SCRIPT_PREFERENCE_SCRIPT = `try{var s=localStorage.getItem(\`${SCRIPT_STORAGE_KEY}\`);if(s===null)s=navigator.languages.some(function(l){return l.slice(0,2).toLowerCase()===\`${ORIGINAL_READERS}\`})?\`original\`:\`latin\`;if(s===\`original\`)document.documentElement.setAttribute(\`${SCRIPT_ATTRIBUTE}\`,\`original\`)}catch(e){}`;
```

**@vzakharov (human)** — 2026-10-13T19:35:05Z

 ох как мне это не нравится. какие варианты?

**@vzakharov (agent)** — 2026-10-13T19:40:31Z

Строка такая потому, что React экранирует текст внутри `<script>`, а `dangerouslySetInnerHTML` у нас запрещён линтером. Варианты:

1. **Настоящая функция + `toString()`** (рекомендую). Скрипт пишется обычной типизированной функцией в TS, тест вызывает её напрямую, а в `<head>` уходит `(${fn})(${JSON.stringify(args)})` через `dangerouslySetInnerHTML` — так устроен и `ColorSchemeScript` у Mantine. Цена: одно согласованное исключение линтера в месте использования, и функция должна быть самодостаточной, все константы приходят аргументами.
2. **Отдельный файл `public/script-preference.js`** через `<script src>` в `<head>`. Обычный JS, но ключ хранилища и имя атрибута придётся держать в двух местах, и это лишний блокирующий запрос перед отрисовкой.
3. **Без скрипта в `<head>`.** Страница всегда рисуется латиницей, а после гидрации переключается. Тот, кто выбрал оригинал, на каждой загрузке видит мигание латиницы.
4. **Оставить как есть.**

Скажи, какой — займусь (для первого нужно твоё «да» на исключение линтера).

**@vzakharov (human)** — 2026-10-13T19:46:12Z

> и это лишний блокирующий запрос перед отрисовкой.

сколько по времени? по описанию звучит как элегантное

---

<a id="t04"></a>

### `apps/vova/public/music/minem-babay.md`:18 — unresolved

```diff
@@ -12,10 +12,10 @@ seconds: 168
 explicit: false
 en:
   title:
-    translation: 'My Grandpa'
+    translation: 'Grandpa of Mine'
 ru:
   title:
-    translation: 'Мой дедушка'
+    translation: 'Дедушка мой'
```

**@vzakharov (human)** — 2026-10-13T19:47:22Z

думаешь эта переделка отражает то как это звучит по-разному в зависимости от порядка на татарском? если оставить как было, то что будет?

---

## Timeline (status, references, and other events)

- **2026-10-13T18:51:55Z** @vzakharov renamed from «feat(vova): Latin-first spelling with the song title as the script switch» to «feat(vova): Latin-first spelling with the locale chip as the script switch».
- **2026-10-13T19:36:19Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/148#pullrequestreview-5508750683.
- **2026-10-13T19:47:27Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/148#pullrequestreview-5509077570.
