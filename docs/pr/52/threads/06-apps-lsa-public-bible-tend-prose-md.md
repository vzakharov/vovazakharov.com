# `apps/lsa/public/bible/tend-prose.md`

<a id="t07"></a>

### `apps/lsa/public/bible/tend-prose.md`:41 — resolved

```diff
@@ -0,0 +1,72 @@
… 34 lines elided …
+
+My favourite, and the one I have named after a bear.
+
+Dostoevsky, roughly: set yourself the task of not thinking of a polar bear, and the cursed thing will be in your head every minute.
```

**@vzakharov (human)** — 2026-09-16T23:32:13Z

и картинку после этого:

<img width="1024" height="1024" alt="Image" src="./attachments/45842362-d2d4-4b66-a684-40d9f16db16c.jpg" />

попробуй разные варианты с картинками: просто в тексте (текст сверху-снизу) или например сбоку страницы и обтекаться

**@vzakharov (agent)** — 2026-09-17T00:51:09Z

Поставил после медведя, вариантом «сбоку с обтеканием» — она там как раз стоит рядом с двумя длинными абзацами, которые её оборачивают.

Оба варианта сделаны и оба в ветке, чтобы было что сравнивать: обтекание — это `'aside'` в титле картинки (`![alt](./assets/x.jpg 'aside')`), без него — блок во всю колонку. Сейчас aside стоит у медведя и у пенька в web-not-cli, блок — у остальных пяти. Это не решение, а именно сравнение: переключается по одному слову на картинку. 629af17

---

<a id="t08"></a>

### `apps/lsa/public/bible/tend-prose.md`:48 — resolved

```diff
@@ -0,0 +1,72 @@
… 44 lines elided …
+
+So the rule: if you have flipped a yes to a no, and the no is simply what everyone does by default, delete the line rather than negating it.
+
+Why agents reach for negation over deletion is not mysterious, and it is worth saying out loud, because it is also why _you_ will hesitate the first few times. Deleting looks like losing information; negating looks like keeping it. What is being kept is a wet-floor sign on a floor that dried an hour ago — and the agent's instinct is not to take it away but to stand a second sign beside it reading "this floor is not slippery".
```

**@vzakharov (human)** — 2026-09-16T23:34:17Z

<img width="1024" height="1024" alt="Image" src="./attachments/e407ea3e-c0aa-4054-9d74-2ed95fa085aa.jpg" />

**@vzakharov (agent)** — 2026-09-17T00:51:10Z

Поставил после абзаца про знак, блоком во всю колонку. 629af17

---

<a id="t09"></a>

### `apps/lsa/public/bible/tend-prose.md`:75 — resolved

```diff
@@ -0,0 +1,72 @@
… 68 lines elided …
+
+Text is the only way an agent can show its work. An empty diff looks like nothing happened. That pressure is there in addition to the imitation problem at the top of this article, and it does not go …
+
+So run all four, every time, after every piece of work. I watch the edits go by and enjoy them the way one enjoys a near miss: you can see quite clearly how much verbal diarrhoea was about to become permanent, and did not.
```

**@vzakharov (human)** — 2026-09-16T23:37:34Z

<img width="1024" height="1024" alt="Image" src="./attachments/3fbc84c4-7a37-47f7-9a98-e365c183c7b8.jpg" />

**@vzakharov (agent)** — 2026-09-17T00:51:11Z

Поставил в самый конец, после «did not». 629af17

---

<a id="t10"></a>

### `apps/lsa/public/bible/tend-prose.md`:2 — resolved

```diff
@@ -0,0 +1,72 @@
+---
+description: Agents write a great deal of prose, and write more of it when they see that there is already a lot. Four lenses — tightness, existence, negation, durability — catch nearly all of what goes wrong, and there are four of them for a reason worth knowing.
```

**@vzakharov (human)** — 2026-09-16T23:38:08Z

> , and there are four of them for a reason worth knowing

nah, ditch

**@vzakharov (agent)** — 2026-09-17T00:51:12Z

Убрал. 629af17

---

<a id="t11"></a>

### `apps/lsa/public/bible/tend-prose.md`:16 — resolved

```diff
@@ -0,0 +1,72 @@
… 10 lines elided …
+
+## Why there is so much of it
+
+Agents write a lot. That on its own would be manageable. What makes it compound is that an agent which opens a repository and finds a great deal of prose already there concludes that this is a place where one writes a great deal of prose, and obliges.
+
+That is a specific failure with a name: [taking a given for an inevitability](./given-for-inevitable.md). The comments are there, so comments must be what one writes here. Nobody decided that. It simply accumulated, and every new agent reads the accumulation as policy.
```

**@vzakharov (human)** — 2026-09-16T23:38:54Z

`obliges -- something we call [the inevitability fallacy](./inevitability-fallacy)` (note the slug change too)

**@vzakharov (agent)** — 2026-09-17T00:51:14Z

Сделал и то и другое: слаг теперь `inevitability-fallacy`, ссылка встала в ту же фразу («and obliges — something we call the inevitability fallacy»), а следующий абзац больше не повторяет то же самое своими словами.

Одно отличие от твоего варианта: в разметке оставил `./inevitability-fallacy.md` с расширением, а не без. Это конвенция репозитория — `rehypeContentLinks` срезает `.md` и делает из этого роут, а сырой `.md` при этом остаётся рабочим и на GitHub, и в скачанном файле. 629af17

---

<a id="t12"></a>

### `apps/lsa/public/bible/tend-prose.md`:32 — resolved

```diff
@@ -0,0 +1,72 @@
… 28 lines elided …
+
+My best guess about why is that the comment is not addressed to the codebase. It is addressed to you: to the person who just handed over the task and is going to read the result. Instead of answering…
+
+Which also tells you the fix, and it is not "write fewer comments". A pull request description and a merge message work not because they are tidier places to put the explanation, but because they exist.
```

**@vzakharov (human)** — 2026-09-16T23:39:24Z

- (hereafter "-" just means "remove")

**@vzakharov (agent)** — 2026-09-17T00:51:15Z

Убрал. 629af17

---

<a id="t13"></a>

### `apps/lsa/public/bible/tend-prose.md`:44 — resolved

```diff
@@ -0,0 +1,72 @@
… 40 lines elided …
+
+Then the CDN gets better, transparency survives, and you decide to stop being special and do it like everybody else. You hand the task to an agent and it removes the code. But instead of also removin…
+
+You now have a line describing a situation nobody would ever have imagined, followed by the news that you are not in it. And once you let one of those stand, they breed: the next agent sees this strange, unused thing being discussed, and writes about it too, and eventually a good part of your prose is devoted to hypothetical arrangements that have never existed and would never have occurred to anyone if not for the bear.
```

**@vzakharov (human)** — 2026-09-16T23:39:46Z

...hypothetical arrangements about CDNs and transparencies...

**@vzakharov (agent)** — 2026-09-17T00:51:17Z

Вписал. 629af17

---

<a id="t14"></a>

### `apps/lsa/public/bible/tend-prose.md`:48 — resolved

```diff
@@ -0,0 +1,72 @@
… 44 lines elided …
+
+So the rule: if you have flipped a yes to a no, and the no is simply what everyone does by default, delete the line rather than negating it.
+
+Why agents reach for negation over deletion is not mysterious, and it is worth saying out loud, because it is also why _you_ will hesitate the first few times. Deleting looks like losing information; negating looks like keeping it. What is being kept is a wet-floor sign on a floor that dried an hour ago — and the agent's instinct is not to take it away but to stand a second sign beside it reading "this floor is not slippery".
```

**@vzakharov (human)** — 2026-09-16T23:40:12Z

> , and it is worth saying out loud,

ditch, and add to the list of no-nos in writing (typical AI cliche)

**@vzakharov (agent)** — 2026-09-17T00:51:18Z

Убрал — и завёл в `.claude/rules/writing.md` отдельным пунктом: «cut the sentence that announces the next one», с признаком, по которому это ловится (удаление оборота ничего не стоит фразе) и с оговоркой, что это единственное исключение из «don't tighten the sentences» выше. 629af17, 66539b1

---

<a id="t15"></a>

### `apps/lsa/public/bible/tend-prose.md`:52 — resolved

```diff
@@ -0,0 +1,72 @@
… 48 lines elided …
+
+## D — durability
+
+The last one. All prose in a repository should describe the situation as it now stands, not the history of how it got there. No comment should be saying "we used to do this, and now we do that".
```

**@vzakharov (human)** — 2026-09-16T23:40:30Z

"My philosophy is that all prose..."

**@vzakharov (agent)** — 2026-09-17T00:51:19Z

Вписал. 629af17

---

<a id="t16"></a>

### `apps/lsa/public/bible/tend-prose.md`:54 — resolved

```diff
@@ -0,0 +1,72 @@
… 50 lines elided …
+
+The last one. All prose in a repository should describe the situation as it now stands, not the history of how it got there. No comment should be saying "we used to do this, and now we do that".
+
+Sometimes the change was genuinely important. Important changes belong to the commit history and to artifacts like pull requests, which sit in GitHub and can be pulled up whenever anyone wants them. If a significant decision changed, write "we do it this way (#412)" and be done: any reader curious about how it used to be, agent or human, can follow the number and read the whole argument.
```

**@vzakharov (human)** — 2026-09-16T23:41:09Z

let's find some more concrete example for "we do it this way (#412)", exemplifying an actual comment that might've popped up in the repo following a major decision

**@vzakharov (agent)** — 2026-09-17T00:51:20Z

Взял настоящий из этого репозитория — решение про слоёный импорт Mantine, из-за которого нигде не нужен `!important`:

> So the comment states what holds and points at the argument — `// Mantine is imported layered, so nothing here needs !important (#412)` — and any reader curious about how it used to be, agent or human, follows the number and reads the whole thing.

629af17

---

<a id="t17"></a>

### `apps/lsa/public/bible/tend-prose.md`:64 — resolved

```diff
@@ -0,0 +1,72 @@
… 54 lines elided …
+
+Do not plant the entire archaeology of the project in your prose.
+
+## Why there are four
+
+Four is not a taxonomy. It is a count of what kept coming back.
+
+You can see two dimensions in them once they exist. T and E cut along volume: this is longer than it needs to be; this should not have been written at all. N and D cut along time: this text is not about the present — one of them denying a decision that has been revoked, the other narrating a past nobody needs. Two dimensions, four lenses, very neat.
+
+But the lenses were not derived from the dimensions. Nobody sat down and divided the space; they were collected, one at a time, from the same findings turning up in review after review, and arranged into an acronym afterwards. If the reviews had gone differently there would be six of them, or three. That is the honest answer to "why four", and it matters, because a list that was derived invites you to trust the gaps in it, and this one does not. When a fifth failure keeps appearing in your reviews, it is a fifth lens, and the acronym can cope.
```

**@vzakharov (human)** — 2026-09-16T23:42:49Z

-, I understand the interest but I don't think its value deserves being in _this_ article

**@vzakharov (agent)** — 2026-09-17T00:51:21Z

Убрал секцию целиком. 629af17

---

<a id="t21"></a>

### `apps/lsa/public/bible/tend-prose.md`:48 — resolved

```diff
@@ -0,0 +1,72 @@
… 44 lines elided …
+
+So the rule: if you have flipped a yes to a no, and the no is simply what everyone does by default, delete the line rather than negating it.
+
+Why agents reach for negation over deletion is not mysterious, and it is worth saying out loud, because it is also why _you_ will hesitate the first few times. Deleting looks like losing information; negating looks like keeping it. What is being kept is a wet-floor sign on a floor that dried an hour ago — and the agent's instinct is not to take it away but to stand a second sign beside it reading "this floor is not slippery".
```

**@vzakharov (human)** — 2026-09-16T23:57:35Z

not "beside it" but "instead"

**@vzakharov (agent)** — 2026-09-17T00:51:26Z

Поправил: «…not to take it away but to put up a second sign instead». 629af17

---

<a id="t22"></a>

### `apps/lsa/public/bible/tend-prose.md`:48 — resolved

```diff
@@ -0,0 +1,72 @@
… 44 lines elided …
+
+So the rule: if you have flipped a yes to a no, and the no is simply what everyone does by default, delete the line rather than negating it.
+
+Why agents reach for negation over deletion is not mysterious, and it is worth saying out loud, because it is also why _you_ will hesitate the first few times. Deleting looks like losing information; negating looks like keeping it. What is being kept is a wet-floor sign on a floor that dried an hour ago — and the agent's instinct is not to take it away but to stand a second sign beside it reading "this floor is not slippery".
```

**@vzakharov (human)** — 2026-09-16T23:57:49Z

> What is being kept is a wet-floor sign on a floor that dried an hour ago

Let's add as a pull quote too

**@vzakharov (agent)** — 2026-09-17T00:51:27Z

Добавил, сразу после этого абзаца. 629af17

---

<a id="t23"></a>

### `apps/lsa/public/bible/tend-prose.md`:14 — resolved

```diff
@@ -0,0 +1,72 @@
… 10 lines elided …
+
+## Why there is so much of it
+
+Agents write a lot. That on its own would be manageable. What makes it compound is that an agent which opens a repository and finds a great deal of prose already there concludes that this is a place where one writes a great deal of prose, and obliges.
```

**@vzakharov (human)** — 2026-09-16T23:59:10Z

pull quote: An agent that finds a great deal of prose concludes that this is a place where one writes a great deal of prose, and obliges.

**@vzakharov (agent)** — 2026-09-17T00:51:28Z

Добавил. 629af17

---
