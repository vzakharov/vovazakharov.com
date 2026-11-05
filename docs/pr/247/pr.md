# PR #247: feat(unsquatted): name variations from Chrome's built-in model

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/247
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/in-browser-llms-unsquatted-24jeaq
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-11-04T11:16:35Z
- **Updated:** 2026-11-05T03:10:13Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 4

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `src/unsquatted/pages/home/ideas/offer/lib/use-ideas.ts`:62 — unresolved — last: @vzakharov (human) 2026-11-05T03:04:06Z — "серой строки не нужно, а вот при нажатии модалка -- с новым…" → [↓](#t01)
- **T02** `docs/remove-before-merging/in-browser-llms-unsquatted-24jeaq/squash-message.md`:7 — unresolved — last: @vzakharov (human) 2026-11-05T03:05:25Z — "во-первых это ж устарело? во-вторых, не надо позиционировать…" → [↓](#t02)
- **T03** `src/unsquatted/pages/home/ideas/brainstorm/lib/prompt.ts`:5 — unresolved — last: @vzakharov (human) 2026-11-05T03:07:50Z — "не, пусть будут равны, 6 долговато генерится, экономия в 2 р…" → [↓](#t03)
- **T04** `src/unsquatted/pages/home/ideas/brainstorm/lib/engine.ts`:49 — unresolved — last: @vzakharov (human) 2026-11-05T03:08:35Z — "module-level let ничем не чреват, мемори-ликами там какими-н…" → [↓](#t04)

---

## Body

## Summary

- **What it does**: after a search, a grey line under the field offers to brainstorm variations; a modal explains in plain words that a model in the visitor's own browser makes them up; once agreed, every search shows three clickable variations of the name.
- **Why in-browser**: an API would break the site's no-server idea, and a visitor's key would gate the feature. Chrome's built-in model (Prompt API, Gemini Nano) keeps the search on the visitor's machine, so the byline's "private" stays true.
- **Desktop Chrome only for now**; elsewhere nothing changes.
- **For testing**, `unsquattedForget()` in the console resets the opt-in and cache and prints how to remove Chrome's model, which no web page can delete itself.
- **How**: a new `ideas` slice on the home page — `brainstorm/` holds the prompt, the parser (unit-tested) and the Chrome session, each search running on a clone of one system-prompted session; `offer/` holds the hook, the line and the modal. The model is held to a JSON schema whose bounds come from the parser's own constants.
- Origin: Levon's suggestion in Slack, and the operator's wish to learn in-browser models on a real feature.

## QA Checklist

- [ ] `offer` — In desktop Chrome 148+, search `datatrend`: a grey "Want to brainstorm variations?" line appears under the field.
- [ ] `modal` — Clicking it opens a plain-language explanation with Turn it on / Not now; Not now closes it and the line stays.
- [ ] `download` — On a Chrome whose model is not downloaded yet, Turn it on shows download progress, then closes when the model is ready.
- [ ] `variations` — After opting in, every search shows three variations in the line's place; clicking one puts it in the field and checks it.
- [ ] `fast-typing` — Changing the search mid-generation shows the new name's variations, never the old one's.
- [ ] `remembered` — After a reload, searches show variations straight away, with no offer.
- [ ] `forget` — `unsquattedForget()` in the console brings the offer back on the next search and prints how to remove Chrome's model.
- [ ] `other-browsers` — In Firefox, the checker looks and works exactly as before: no line, no modal.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `offer` | manual | ❌ | Needs Gemini Nano on real desktop Chrome |
| `modal` | e2e | ❌ | Could stub `LanguageModel` in Playwright |
| `download` | manual | ❌ | Depends on Chrome's per-profile model state |
| `variations` | manual | ❌ | Real model output; the parsing is unit-tested in `parse-ideas` |
| `fast-typing` | e2e | ❌ | Stubbed `LanguageModel` with a delayed answer |
| `remembered` | e2e | ❌ | Stubbed `LanguageModel`, reload, assert no offer |
| `forget` | manual | ❌ | Console call on the live preview |
| `other-browsers` | e2e | ❌ | Playwright Firefox: assert the line is not rendered |

https://claude.ai/code/session_01DaohkEbjr7qEZ5daaRBm6A
https://claude.ai/code/session_01DaohkCsgymHrNjAGTnrXRx

---

## Comments

- **C01** @vzakharov (agent) — 2026-11-04T11:16:52Z — "Proposed squash body: ``` A visitor whose name is taken had…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-11-04T11:16:52Z

[https://github.com/vzakharov/vovazakharov.com/pull/247#issuecomment-6629233360](https://github.com/vzakharov/vovazakharov.com/pull/247#issuecomment-6629233360)

Proposed squash body:

```
A visitor whose name is taken had only the dice, which know nothing of
the name. Chrome's built-in model (Prompt API, Gemini Nano) now offers
variations of it, on the visitor's own machine, so the site stays
serverless and the search never leaves the browser.

After a search, a grey line under the field offers to brainstorm; a
modal explains in plain words what runs where and that Chrome
downloads the model once. Once agreed, every search shows three
variations in that line, each a click from its own check. Desktop
Chrome only; other browsers see nothing new.

The prompt carries the naming runbook's taste, steering away from the
first, already-registered ideas, and the model's JSON is validated and
cleaned like any typed name. unsquattedForget() in the console resets
the opt-in for testing; Chrome's model itself is Chrome's to remove.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

<a id="r01"></a>

### R01 — Review by @vzakharov (agent) — COMMENTED

_2026-11-04T12:18:25Z_

[https://github.com/vzakharov/vovazakharov.com/pull/247#pullrequestreview-5768094962](https://github.com/vzakharov/vovazakharov.com/pull/247#pullrequestreview-5768094962)

**/five-percent**: одно предложение, critical.

<!-- five-percent: 7cd1ac34ceda8ed0229d1370a5519c7da6fc221e -->

- **T01** `src/unsquatted/pages/home/ideas/offer/lib/use-ideas.ts`:62 — unresolved — last: @vzakharov (human) 2026-11-05T03:04:06Z — "серой строки не нужно, а вот при нажатии модалка -- с новым…" → [↓](#t01)
- **T02** `docs/remove-before-merging/in-browser-llms-unsquatted-24jeaq/squash-message.md`:7 — unresolved — last: @vzakharov (human) 2026-11-05T03:05:25Z — "во-первых это ж устарело? во-вторых, не надо позиционировать…" → [↓](#t02)
- **T03** `src/unsquatted/pages/home/ideas/brainstorm/lib/prompt.ts`:5 — unresolved — last: @vzakharov (human) 2026-11-05T03:07:50Z — "не, пусть будут равны, 6 долговато генерится, экономия в 2 р…" → [↓](#t03)
- **T04** `src/unsquatted/pages/home/ideas/brainstorm/lib/engine.ts`:49 — unresolved — last: @vzakharov (human) 2026-11-05T03:08:35Z — "module-level let ничем не чреват, мемори-ликами там какими-н…" → [↓](#t04)

<a id="t01"></a>

### `src/unsquatted/pages/home/ideas/offer/lib/use-ideas.ts`:62 — unresolved

```diff
@@ -0,0 +1,94 @@
… 58 lines elided …
+    });
+  }, [setOptedIn]);
+
+  const wanted = optedIn && available && label !== '' && !answers.has(label);
```

**@vzakharov (agent)** — 2026-11-04T12:18:20Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · critical

Согласие в localStorage считается вечным, будто модель, раз скачанная, никуда не денется. Но Chrome сам удаляет её, когда на диске остаётся меньше 10 ГБ, а посетитель может выключить её в настройках. Тогда `availability()` отвечает `downloadable`, `suggest` зовёт `LanguageModel.create()` без клика, Chrome отказывает — и на каждом поиске уходит `reportError`, строка пустеет, а предложение включить заново больше не появляется никогда.

**Предложение: считать согласие действующим, только пока модель `available`**

Хранить из `availability()` само значение, а не булево `!== 'unavailable'`, и при `optedIn && availability !== 'available'` показывать снова серую строку-предложение: клик по ней и даст Chrome нужную активацию для повторной загрузки. Модалке при этом достаточно того же «Turn it on».

Цена: ещё одна ветка в `useIdeas` и в `IdeasLine` — строк десять. Флаг в localStorage остаётся как есть.

<details><summary>Подробнее</summary>

- Документация Chrome по built-in AI: «If the available storage space falls to less than 10 GB after the download, the model will be deleted».
- `create()` при `downloadable` требует user activation — это записано и в плане (§ «The flow», п. 2), и в докстринге `startModel`.
- Сейчас `wanted = optedIn && available && …`, где `available` — это `availability !== 'unavailable'`, так что `downloadable` проходит.
- Ошибка закешируется как `[]` на эту метку, но каждая новая метка повторит отказ.

</details>

**@vzakharov (human)** — 2026-11-05T03:04:06Z

серой строки не нужно, а вот при нажатии модалка -- с новым текстом а ля "ой, куда-то подевалось, скачиваю снова, может занять a while [ОК]" (скачивание начинается сразу -- optedIn же) -- да

---

<a id="t02"></a>

### `docs/remove-before-merging/in-browser-llms-unsquatted-24jeaq/squash-message.md`:7 — unresolved

```diff
@@ -0,0 +1,25 @@
+Proposed squash body:
+
+```
+A visitor whose name is taken had only the dice, which know nothing of
+the name. Chrome's built-in model (Prompt API, Gemini Nano) now offers
+variations of it, on the visitor's own machine, so the site stays
+serverless and the search never leaves the browser.
```

**@vzakharov (human)** — 2026-11-05T03:05:25Z

во-первых это ж устарело? во-вторых, не надо позиционировать это как "была проблема, вот решили". это новая фича не для решения какой-то проблемы

---

<a id="t03"></a>

### `src/unsquatted/pages/home/ideas/brainstorm/lib/prompt.ts`:5 — unresolved

```diff
@@ -0,0 +1,46 @@
+/** How many variations a search shows. */
+export const IDEAS_SHOWN = 3;
+
+/** Twice the shown, so enough survive the parser's cuts. */
+const IDEAS_ASKED = 2 * IDEAS_SHOWN;
```

**@vzakharov (human)** — 2026-11-05T03:07:50Z

не, пусть будут равны, 6 долговато генерится, экономия в 2 раза будет заметна. ну а если будет меньше или не будет -- что ж, ideating overlord отдыхает значит

---

<a id="t04"></a>

### `src/unsquatted/pages/home/ideas/brainstorm/lib/engine.ts`:49 — unresolved

```diff
@@ -0,0 +1,153 @@
… 45 lines elided …
+
+type Loaded = { tokenizer: PreTrainedTokenizer; model: PreTrainedModel };
+
+let loaded: Promise<Loaded> | undefined;
```

**@vzakharov (human)** — 2026-11-05T03:08:35Z

module-level let ничем не чреват, мемори-ликами там какими-нибудь или ещё чем?

---

## Timeline (status, references, and other events)

- **2026-11-04T11:40:21Z** @vzakharov renamed from «feat(unsquatted): name ideas from an in-browser LLM» to «feat(unsquatted): name variations from Chrome's built-in model».
- **2026-11-04T12:18:25Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/247#pullrequestreview-5768094962.
- **2026-11-05T03:10:13Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/247#pullrequestreview-5779339397.
