# `.claude/rules/content.md`

<a id="t01"></a>

### `.claude/rules/content.md`:73 — unresolved

```diff
@@ -69,6 +69,8 @@ The exceptions are `shared/content/content-hash.ts`, `mermaid-renders.ts` and `c
 
    **There is no `title` field** — the title is the document's leading `# ` heading, which the pipeline lifts out of the body and into the page header. Word count, reading time and the heading outline are derived the same way. Anything derivable is never restated in frontmatter.
 
+   **A song is the exception, and states its `name`.** A song's title is what the player bar shows as `Name — Project` and what the track list sorts, so deriving it would mean parsing prose to render a control. A song body therefore opens without a `# `, and the page puts `name` in the `<h1>` — the same header slot a case study's lifted heading fills, so the two collections read alike and differ only in where the title came from.
+
```

**@vzakharov (human)** — 2026-09-17T12:07:31Z

хм, на самом деле, кажется, засунуть title во frontmatter и вставлять в h1 -- тоже норм решение. (И да, я не против называть это для песни тоже Title, чтобы не было ещё и дихотомии title vs name.)

**@vzakharov (agent)** — 2026-09-17T15:29:59Z

Принято — и под i18n это не просто «тоже норм», а единственное, что работает: у `june` заголовок «Breathe» по-английски и «Повелитель ветра» по-русски, а лидирующий `# ` в теле умеет быть только одним. Так что заголовок обязан быть полем независимо от дихотомии.

Значит: `name` → `title`, внутри локального блока (`en.title` / `ru.title`). Правило в `.claude/rules/content.md` перепишу так, чтобы оно объясняло, откуда какая коллекция берёт заголовок, а не утверждало, что поля `title` не бывает.

Один открытый вопрос из этого вытекает: переводить ли на то же самое кейс-стади. Рекомендую не в этом PR — там на заголовке завязаны PDF- и OG-пайплайны, которые хешируют свои источники, а выигрыша нет, пока кейс-стади не понадобится на двух языках. Вопрос 6 в плане.

Подробнее: `docs/plans/music-i18n.draft.do-not-implement.md`, §3.

**@vzakharov (agent)** — 2026-09-17T15:40:46Z

Кейс-стади пока остаются на лидирующем `# `, тикет заведён, чтобы не забыть: #62. Там же записано, почему это не едет в этом PR — заголовок кейс-стади это вход в два закоммиченных рендер-пайплайна (`content:og`, `content:pdf`), оба хешируют свои источники и оба валят vet, если поменять источник без перерендера. То есть цена — не правка схемы, а правка схемы плюс перевыпуск карточек и PDF всех кейс-стади внутри PR про музыку.

Песни при этом переезжают на `title` сейчас, и `.claude/rules/content.md` будет объяснять расхождение со ссылкой на тикет, а не делать вид, что его нет.

---
