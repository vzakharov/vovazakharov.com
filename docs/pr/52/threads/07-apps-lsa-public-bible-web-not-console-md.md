# `apps/lsa/public/bible/web-not-console.md`

<a id="t29"></a>

### `apps/lsa/public/bible/web-not-console.md`:1 — unresolved

**@vzakharov (human)** — 2026-09-17T00:05:08Z

web-not-cli for the slug

---

<a id="t30"></a>

### `apps/lsa/public/bible/web-not-console.md`:2 — unresolved

```diff
@@ -0,0 +1,58 @@
+---
+description: Every argument for keeping your agents in a local terminal is really one argument — that parallel branches will fight at merge time. They don't. Here is what you get once you stop believing they will.
```

**@vzakharov (human)** — 2026-09-17T00:05:27Z

это весьма спорное утверждение (что every argument -- это про мёрдж)

---

<a id="t31"></a>

### `apps/lsa/public/bible/web-not-console.md`:18 — unresolved

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

---

<a id="t32"></a>

### `apps/lsa/public/bible/web-not-console.md`:20 — unresolved

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

---

<a id="t33"></a>

### `apps/lsa/public/bible/web-not-console.md`:20 — unresolved

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

---

<a id="t34"></a>

### `apps/lsa/public/bible/web-not-console.md`:38 — unresolved

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

---

<a id="t35"></a>

### `apps/lsa/public/bible/web-not-console.md`:40 — unresolved

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

---

<a id="t36"></a>

### `apps/lsa/public/bible/web-not-console.md`:44 — unresolved

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

---

<a id="t37"></a>

### `apps/lsa/public/bible/web-not-console.md`:44 — unresolved

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

---

<a id="t38"></a>

### `apps/lsa/public/bible/web-not-console.md`:56 — unresolved

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

---

<a id="t39"></a>

### `apps/lsa/public/bible/web-not-console.md`:58 — unresolved

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

---

<a id="t40"></a>

### `apps/lsa/public/bible/web-not-console.md`:26 — unresolved

```diff
@@ -0,0 +1,58 @@
… 22 lines elided …
+
+## Your laptop stops melting
+
+The second reason is, and I mean this fairly literally, thermodynamic.
```

**@vzakharov (human)** — 2026-09-17T00:19:15Z

<img width="1227" height="864" alt="Image" src="./attachments/ff6814d7-6b13-4117-92bf-3940c2583057.jpg" />

---
