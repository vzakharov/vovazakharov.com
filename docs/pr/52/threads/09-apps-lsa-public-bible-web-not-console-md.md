# `apps/lsa/public/bible/web-not-console.md`

<a id="t30"></a>

### `apps/lsa/public/bible/web-not-console.md`:2 — resolved

```diff
@@ -0,0 +1,58 @@
+---
+description: Every argument for keeping your agents in a local terminal is really one argument — that parallel branches will fight at merge time. They don't. Here is what you get once you stop believing they will.
```

**@vzakharov (human)** — 2026-09-17T00:05:27Z

это весьма спорное утверждение (что every argument -- это про мёрдж)

**@vzakharov (agent)** — 2026-09-17T00:51:36Z

Согласен, перебор. Описание теперь без «every argument»: «The fear that keeps most people in a local terminal is that parallel branches will fight at merge time. They don't — and once you stop believing they will, your laptop stops being a stove and your day stops being a queue.» 629af17

**@vzakharov (human)** — 2026-09-17T01:05:46Z

да нет, я имел в виду как раз большую картинку. Я не думаю что многие такие типа "О, нет, буду локально потому что нет мёрджей". Дефолтная (анти)мотивация обычно как раз "CLI это круто, а веб это хз что". (Говорю "обычно", но на самом деле это конечно только догадка. но сомневаюсь что из-за мёрджей.)

**@vzakharov (agent)** — 2026-09-17T10:25:35Z

Понял, перекроил. Описание теперь: «Most people stay in a local terminal because a terminal is where serious work happens and a browser tab is where it doesn't. That is a feeling, not an argument, and the three things you get for giving it up are not small ones.»

И во вступлении то же самое сказано прямо, с обещанием вернуться к этому в конце — а возвращается оно в «What you give up», где про хакера с тремя вкладками iTerm уже было написано, просто ничто на него не указывало. Мёрджи остались, но названы моим личным аргументом, чем они и были.

cde7b6f

---

<a id="t31"></a>

### `apps/lsa/public/bible/web-not-console.md`:18 — resolved

```diff
@@ -0,0 +1,58 @@
… 14 lines elided …
+
+I put the move off for months on the strength of that arithmetic. It was wrong. Not "mostly fine" wrong — it has not happened once, with two branches or with fifteen.
+
+Agents turn out to be very good at working out what `main` did while they were away. What changed since they started; which of their own decisions that invalidates; which side of a conflict to keep, which to take from `main`, and where the honest answer is that both sides are now obsolete and the thing wants rewriting. A conflict across ten or fifteen files is not an event. Bigger ones are a slower conversation rather than a crisis, and they go better still if you give the agent a skill that says how merging is done in your repository — which is a subject for its own article.
```

**@vzakharov (human)** — 2026-09-17T00:09:34Z

<img width="1024" height="1024" alt="Image" src="./attachments/d8b3b719-7c36-42e5-83dd-69cffe43000f.jpg" />

(a reference to "what `main` did while they were away", thanks for planting the image lol)

**@vzakharov (agent)** — 2026-09-17T00:51:38Z

Поставил туда, сбоку с обтеканием. (Каламбур был не мой, но присвою.) 629af17

---

<a id="t32"></a>

### `apps/lsa/public/bible/web-not-console.md`:20 — resolved

```diff
@@ -0,0 +1,58 @@
… 16 lines elided …
+
+Agents turn out to be very good at working out what `main` did while they were away. What changed since they started; which of their own decisions that invalidates; which side of a conflict to keep, …
+
+The one real exception is database migrations, where two branches can each write a perfectly correct migration and the pair of them be nonsense. That is a narrow problem with answers of its own, and it is not a reason to keep fifteen sessions on your lap.
```

**@vzakharov (human)** — 2026-09-17T00:09:44Z

parenthesize the entire paragraph

**@vzakharov (agent)** — 2026-09-17T00:51:39Z

Взял в скобки целиком. 629af17

---

<a id="t33"></a>

### `apps/lsa/public/bible/web-not-console.md`:20 — resolved

```diff
@@ -0,0 +1,58 @@
… 16 lines elided …
+
+Agents turn out to be very good at working out what `main` did while they were away. What changed since they started; which of their own decisions that invalidates; which side of a conflict to keep, …
+
+The one real exception is database migrations, where two branches can each write a perfectly correct migration and the pair of them be nonsense. That is a narrow problem with answers of its own, and it is not a reason to keep fifteen sessions on your lap.
```

**@vzakharov (human)** — 2026-09-17T00:10:30Z

> each write a perfectly correct migration and the pair of them be nonsense

проблема не в этом. проблема -- если две ветки обе напишут миграцию 0080, а ещё если они обе будут при этом работать на одной shared dev DB. но в этих деталях, конечно, расписывать не надо, по объёму должно остаться как есть.

(если неточность идёт из оригинальной читки, там надо тоже поправить. это ко всем комментариям, к слову, относится.)

**@vzakharov (agent)** — 2026-09-17T00:51:40Z

Переписал по существу, объём тот же:

> (The one real exception is database migrations: two branches will both name theirs `0080`, and if they are pointed at the same development database they will trip over each other running them.)

Проверил, откуда шла неточность: не из читки. В `b1-web-not-cli.md` сказано только «единственное исключение — миграции базы данных, тема нишевая». Неверная расшифровка была в `ideas/db-migrations.md` — её и поправил. 629af17

---

<a id="t34"></a>

### `apps/lsa/public/bible/web-not-console.md`:38 — resolved

```diff
@@ -0,0 +1,58 @@
… 34 lines elided …
+
+Which gets us to the third reason, and the one that actually changed how the work feels. You stop waiting.
+
+Ten sessions, fifteen, however many the work divides into. You hand out the tasks and they all start thinking at once. One comes back with a question; you answer it, and while you are typing another finishes; you review that, and by the time you are done a third wants something. The day is a steady loop of handing out work, answering questions, and accepting results, and there is no point in it where you are sitting still watching a progress indicator with feelings.
```

**@vzakharov (human)** — 2026-09-17T00:11:43Z

> watching a progress indicator with feelings.

слишком клишово.

**@vzakharov (agent)** — 2026-09-17T00:51:43Z

Убрал: «…and at no point in it are you waiting on anybody.» 629af17

**@vzakharov (human)** — 2026-09-17T01:08:09Z

нет, я не против пратчеттовой метафоры, именно эта была какая-то клишовая. Я б сделал что-то что-то sitting глядя на то как токены бегут по экрану пока вы делаете вид что внимательно за этим следите. (тогда и связка с дальнейшим "давайте признаемся честно" есть)

**@vzakharov (agent)** — 2026-09-17T10:25:36Z

Вернул метафору, другую: «…and at no point in it are you watching tokens crawl up a screen with the expression of a man following them closely.»

Связка с «And, let us be honest about the local alternative» теперь есть — признаваться есть в чём.

cde7b6f

---

<a id="t35"></a>

### `apps/lsa/public/bible/web-not-console.md`:40 — resolved

```diff
@@ -0,0 +1,58 @@
… 36 lines elided …
+
+Ten sessions, fifteen, however many the work divides into. You hand out the tasks and they all start thinking at once. One comes back with a question; you answer it, and while you are typing another …
+
+Compare the local version honestly. You start an agent, you read along, and there is nothing for you to do, so after a while you get bored and open YouTube. You come back to find the agent finished forty minutes ago, and you have watched the second season of Game of Thrones and shipped nothing.
```

**@vzakharov (human)** — 2026-09-17T00:13:08Z

что-то вроде "And, let's be honest, in the local alternative, sooner or later you'll..."

и давай NetFlix вместо YouTube, и you are two and a half episodes into the ... season of ...

шоу заменить на какое-то более современное. давай Severance

**@vzakharov (agent)** — 2026-09-17T00:51:44Z

Сделал всё три: «And, let us be honest about the local alternative: sooner or later you will drift. … you get bored and open Netflix. You come back to find the agent finished forty minutes ago, and you are two and a half episodes into the second season of Severance and have shipped nothing.» 629af17

---

<a id="t36"></a>

### `apps/lsa/public/bible/web-not-console.md`:44 — resolved

```diff
@@ -0,0 +1,58 @@
… 40 lines elided …
+
+You do lose something real: engagement with each individual session. Reading an agent's reasoning is interesting and genuinely instructive, and now and then you catch a bad decision while it is still…
+
+My own loop, once a task comes back: the agent opens a pull request with a proposed merge message on it, so three or four paragraphs tell me what it did and why. I read the diff in the review tab and leave comments in it — not like that, pull this out into a function, move this. Then I go back to the session, compact it rather than dragging the whole accumulated context along, and say: there are comments waiting, go. It re-reads the PR, works through them, and comes back. Two or three rounds, usually, and it lands.
```

**@vzakharov (human)** — 2026-09-17T00:13:36Z

not like that, pull this out into a function, move this

нужно во-первых в кавычки, а то непонятно, что это а-ля моя речь, а во вторых последний пункт давай как раз про "let's rethink the big picture here"

**@vzakharov (agent)** — 2026-09-17T00:51:45Z

В кавычках и с большой картиной в конце: «not like that», «pull this out into a function», «let us rethink the big picture here». 629af17

---

<a id="t37"></a>

### `apps/lsa/public/bible/web-not-console.md`:44 — resolved

```diff
@@ -0,0 +1,58 @@
… 40 lines elided …
+
+You do lose something real: engagement with each individual session. Reading an agent's reasoning is interesting and genuinely instructive, and now and then you catch a bad decision while it is still…
+
+My own loop, once a task comes back: the agent opens a pull request with a proposed merge message on it, so three or four paragraphs tell me what it did and why. I read the diff in the review tab and leave comments in it — not like that, pull this out into a function, move this. Then I go back to the session, compact it rather than dragging the whole accumulated context along, and say: there are comments waiting, go. It re-reads the PR, works through them, and comes back. Two or three rounds, usually, and it lands.
```

**@vzakharov (human)** — 2026-09-17T00:14:10Z

", go" => ", go handle them", with handle linking to https://github.com/vzakharov/muthur/blob/main/.claude/skills/handle/SKILL.md

btw, let's see in which other places we can plant links to the repo

**@vzakharov (agent)** — 2026-09-17T00:51:46Z

Сделал — `go handle them`, с ссылкой на скилл.

По остальным местам: проверил, что файлы в muthur действительно существуют, и поставил ещё три там, где текст уже указывал на скилл, — `sync-branch` на «a skill that says how merging is done», `renumber-migration` на «answers of its own» про миграции, `squash-message` на «a proposed merge message». Плюс `tend-prose` в самой TEND-статье, на «Mine run as a skill». Больше пока не стал: пять ссылок на один репозиторий в одной статье — это уже граница между «вот инструмент» и «купите». 629af17

---

<a id="t38"></a>

### `apps/lsa/public/bible/web-not-console.md`:56 — resolved

```diff
@@ -0,0 +1,58 @@
… 52 lines elided …
+
+## So
+
+Open claude.ai/code, or whatever the equivalent address is for the agent you use, and work there.
```

**@vzakharov (human)** — 2026-09-17T00:14:48Z

link on claude.ai/code

**@vzakharov (agent)** — 2026-09-17T00:51:48Z

Поставил. 629af17

---

<a id="t39"></a>

### `apps/lsa/public/bible/web-not-console.md`:58 — resolved

```diff
@@ -0,0 +1,58 @@
… 54 lines elided …
+
+Open claude.ai/code, or whatever the equivalent address is for the agent you use, and work there.
+
+Each branch gets to `main` in its own time, and mostly the order does not matter; you just keep methodically adding to the tower. Then at some point you look back at the list of commits — each one clean, each one a whole thing — and think: goodness, look how much of this there now is.
```

**@vzakharov (human)** — 2026-09-17T00:14:56Z

move before "## So"

**@vzakharov (agent)** — 2026-09-17T00:51:49Z

Перенёс — теперь абзац закрывает «What you give up», а «## So» осталась одной строкой. 629af17

---
