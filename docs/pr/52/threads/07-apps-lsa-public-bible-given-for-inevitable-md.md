# `apps/lsa/public/bible/given-for-inevitable.md`

<a id="t19"></a>

### `apps/lsa/public/bible/given-for-inevitable.md`:2 — resolved

```diff
@@ -0,0 +1,52 @@
+---
+description: An agent that finds an approach, a document or a rule in your codebase concludes that this is how things must be. The two obvious remedies — more context, and an instruction to be critical — both fail, and they fail for reasons worth understanding.
```

**@vzakharov (human)** — 2026-09-16T23:44:49Z

and they fail with consequences that will make humans useful for some more time to come.

(or smth along these lines)

**@vzakharov (agent)** — 2026-09-17T00:51:24Z

Вписал: «…both fail, and they fail with consequences that will keep humans useful for some time yet.» 629af17

---

<a id="t20"></a>

### `apps/lsa/public/bible/given-for-inevitable.md`:20 — resolved

```diff
@@ -0,0 +1,52 @@
… 16 lines elided …
+
+The analogy I keep coming back to is the megapixel race of the 2000s. Cameras arrived with three megapixels, then five, then ten, then fifteen, and at some point buyers started reading the number as …
+
+This is not a pretty comparison. It is the same mechanism. Attention is the fixed area that the tokens divide between them — more cells on the same sensor means each cell is worse, and that is the whole of the analogy. When I started, a context window was a thousand tokens. Then sixteen thousand, which felt like an impossible ceiling. Then two hundred thousand. Now a million, and someone will make it a trillion. Do not expect that an agent handed a trillion tokens will remember all of it and apply it as reliably as it applies ten thousand.
```

**@vzakharov (human)** — 2026-09-16T23:52:48Z

picture:

<img width="1024" height="1024" alt="Image" src="./attachments/14bac7d9-2961-4f1c-b577-b8deccae3ce0.jpg" />

for the text: "The same happens with LLM context, attention being the fixed area that the model's attention is divided between. When I started..."

**@vzakharov (agent)** — 2026-09-17T00:51:25Z

Поставил картинку после этого абзаца и переписал зачин по твоему варианту — с одной поправкой: «attention being the fixed area that the model's attention is divided between» ходит по кругу, так что вышло «The same happens with LLM context: attention is the fixed area, and every token you add is one more claim on it.» 629af17

---

<a id="t24"></a>

### `apps/lsa/public/bible/given-for-inevitable.md`:30 — resolved

```diff
@@ -0,0 +1,52 @@
… 26 lines elided …
+
+Any instruction you add in order to overturn the previous instructions is itself just another given. Tell an agent to look critically at every decision before acting on it, and it will look criticall…
+
+What you have bought is not a habit of scepticism. It is a ritual of disagreement, and a ritual of disagreement is more expensive than a ritual of agreement, because it is noise in exactly the channel you needed to stay clear: a real objection is now indistinguishable from an order being carried out.
```

**@vzakharov (human)** — 2026-09-16T23:59:39Z

pull quote: What you have bought is not a habit of scepticism -- it is a ritual of disagreement.

The sentence itself, glue to the previous paragraph, and keep only it (ditching ", and a ritual..." -- because it basically says the same thing again.)

**@vzakharov (agent)** — 2026-09-17T00:51:29Z

Сделал: фраза приклеена к предыдущему абзацу и вынесена пул-квотом.

Одно стоит отметить — вместе с «, and a ritual of disagreement is more expensive…» ушёл и хвост «because it is noise in exactly the channel you needed to stay clear: a real objection is now indistinguishable from an order being carried out», потому что это одна синтаксическая цепочка. Повтор ушёл правильно, но там же был и механизм. Скажи слово — верну его отдельным предложением. 629af17

---

<a id="t25"></a>

### `apps/lsa/public/bible/given-for-inevitable.md`:40 — resolved

```diff
@@ -0,0 +1,52 @@
… 36 lines elided …
+
+Remember House? Every episode, the epiphany arrives from something entirely unrelated. Somebody makes an offhand remark, he sees an event with no bearing on the case, and he understands what is wrong…
+
+The show plays it for comedy, but the mechanism is real, and decisions about code genuinely do arrive from places with no connection to code.
```

**@vzakharov (human)** — 2026-09-17T00:01:10Z

"The show plays it for comedy," is not what I meant; what I meant is that tv shows generally overuse the "sudden epiphany" trope

**@vzakharov (agent)** — 2026-09-17T00:51:30Z

Переписал: «Television overuses that trope to the point of parody — the shower, the offhand remark, the run down the corridor. But the mechanism under it is real…» 629af17

**@vzakharov (human)** — 2026-09-17T01:03:42Z

перечисления не надо; можно тоже добавить в writing с пометкой что это не всегда плохо, но иногда звучит очень ИИшно, особенно когда это перечисление само по себе относится к детуру, а не к основной теме текста.

**@vzakharov (agent)** — 2026-09-17T10:25:34Z

Убрал: «Television overuses that trope to the point of parody. But the mechanism under it is real…»

И завёл пункт в `.claude/rules/writing.md` — список примеров там, где хватило бы одного, читается машинным; с оговоркой, что список, который сам и есть мысль (три формы, три причины), свои пункты отрабатывает, а тель — список, висящий на детуре, где три такта уходят на землю, которую текст уже покидает.

cde7b6f

---

<a id="t27"></a>

### `apps/lsa/public/bible/given-for-inevitable.md`:48 — resolved

```diff
@@ -0,0 +1,52 @@
… 44 lines elided …
+
+So, despite all our imperfections — or, I would argue, because of them, because of our apparent randomness — there is something we can still do that artificial intelligence cannot.
+
+I do not say that categorically, and I do not say never. I think our brains are the same kind of computer, the same kind of network. But the enormous strides happening in AI right now are strides in a different direction, and there is nothing wrong with that, because it is a useful direction: it is making agents complement us well, and us them.
```

**@vzakharov (human)** — 2026-09-17T00:04:34Z

"neural network", not just "network"

**@vzakharov (agent)** — 2026-09-17T00:51:33Z

Поправил. 629af17

---

<a id="t28"></a>

### `apps/lsa/public/bible/given-for-inevitable.md`:50 — resolved

```diff
@@ -0,0 +1,52 @@
… 46 lines elided …
+
+I do not say that categorically, and I do not say never. I think our brains are the same kind of computer, the same kind of network. But the enormous strides happening in AI right now are strides in …
+
+Should we want them to replace us eventually? Everyone will answer that for themselves. Mine is this: the unexpected insight along the way is the best thing about building anything at all. Hand that part over and what is left for you is posing the task and signing off the result, which is a job I did not sign up for.
```

**@vzakharov (human)** — 2026-09-17T00:04:50Z

ditch, a detour for no apparent return

**@vzakharov (agent)** — 2026-09-17T00:51:34Z

Убрал. 629af17

---
