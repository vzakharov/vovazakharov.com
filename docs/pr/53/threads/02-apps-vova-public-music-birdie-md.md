# `apps/vova/public/music/birdie.md`

<a id="t02"></a>

### `apps/vova/public/music/birdie.md`:1 — unresolved

**@vzakharov (human)** — 2026-09-17T12:12:26Z

Общий комментарии -- эти страницы должны быть i18n-ble. Как это именно делать -- вопрос открытый, можно делать один файл (во фронтматтере соответственно где применимо будут отдельно ключи для en и ru, например description; сам боди сначала на одном потом на другом после какого-то стандартного токена), либо отдельными файлами (но тогда не хочется чтобы было WET для тех полей которые агностичны к языку).

Лирику можно выносить отдельным блоком (или файлом, во втором подходе), при этом если лирика на другом языке чем локаль, она должна идти табличкой для параллельного чтения на двух языках (но не построчно, а построфно).

Давай обсудим как это сделать прежде чем вносить какие-либо правки, которые зависели бы от реализации.

---

<a id="t03"></a>

### `apps/vova/public/music/birdie.md`:7 — unresolved

```diff
@@ -0,0 +1,50 @@
… 3 lines elided …
+date: 2026-04-04
+status: done
+language: ru
+# project: one of GENERATED, Полуживые, Downtemple
```

**@vzakharov (human)** — 2026-09-17T12:13:23Z

это другой проект, "Грёбаный бал", t.me/fknball. Оттуда кстати можно почерпывать какие-то инсайты о песнях, когда готовишь драфт (но для этой особо много нет).

---

<a id="t04"></a>

### `apps/vova/public/music/birdie.md`:9 — unresolved

```diff
@@ -0,0 +1,50 @@
… 5 lines elided …
+language: ru
+# project: one of GENERATED, Полуживые, Downtemple
+repo: birdie
+audio: https://raw.githubusercontent.com/vovas-music/birdie/main/%F0%9F%85%B4%20%D0%9F%D1%82%D0%B8%D1%87%D0%BA%D0%B0.flac
```

**@vzakharov (human)** — 2026-09-17T12:13:58Z

думаешь, не стоит вендорить (я правильное слово использую? в смысле, загружать в нашу репу и держать здесь)?

---

<a id="t05"></a>

### `apps/vova/public/music/birdie.md`:22 — unresolved

```diff
@@ -0,0 +1,50 @@
… 9 lines elided …
+seconds: 207
+---
+
+<!-- Draft: written from what the repository holds and what the recogniser heard,
+     not from the author. Correct or replace it. The lyrics are machine-transcribed
+     and unverified — Deepgram's nova-3 proposes the words, the author decides which
+     of them were actually sung. -->
+
+Explicit, and the only one in the batch that got a video: `Птичка.mp4` sits in
+the repository beside the master, cut from AI-generated clips in `Media/` and a
+screen recording. The song itself is a district memory — fights, football,
+gopstop, all of it losing its hold the moment she goes past — told by someone who
+is still not over it and knows exactly how that sounds.
```

**@vzakharov (human)** — 2026-09-17T12:17:44Z

Пишу историю (для русского дословно save for errors, formatting, paragraphs, etc., для английского переводишь):

Золтан нашёл на айфоне будильник с названием «Птичка», очень бодрый и не по-будильничски самобытный. Мне сразу захотелось чтобы он переливался в мощненький такой дэткор с прелюдией «А сейчас вылетит птичка». Что, собственно, и сделалось. Слова родились вслед за названием и общей энергетикой, к личной жизни отношения не имеют (увы, ни я никому, ни мне никто в детстве особо морду не бил). Кажется, там немного навеяно творчеством «Серёги» про «Выходила Маня замуж», «Загубили Лялю» и т. п.

Фан факт: единственная песня, которую я не могу из-за эксплицитов ставить Сяме, хотя ему она очень нравится :( Обещаю себе когда-то сделать версию с запикиванием.

---

<a id="t06"></a>

### `apps/vova/public/music/birdie.md`:24 — unresolved

```diff
@@ -0,0 +1,81 @@
… 20 lines elided …
+gopstop, all of it losing its hold the moment she goes past — told by someone who
+is still not over it and knows exactly how that sounds.
+
+## Lyrics
```

**@vzakharov (human)** — 2026-09-17T12:22:15Z

Тексты правлю вручную отдельными коммитами, бегло посмотри не залезли ли где-то глюки

---

<a id="t27"></a>

### `apps/vova/public/music/birdie.md`:1 — unresolved

**@vzakharov (human)** — 2026-09-17T12:58:44Z

ещё просьба: по всем моим "историям" и текстам, дать не просто отчёт о том что сделано-переделано, но и свой внутренний отклик (типа /afterword, но не в файлах а в тредах)

---
