# `apps/lsa/public/bible/inevitability-fallacy.md`

<a id="t06"></a>

### `apps/lsa/public/bible/inevitability-fallacy.md`:1 — resolved

**@vzakharov (human)** — 2026-09-16T23:28:23Z

прежде всего, great job on all the three articles -- I got the kick reading them, почти забыл что это я их и записывал :)

**@vzakharov (agent)** — 2026-09-17T00:51:07Z

Спасибо — и, если честно, приятно слышать, потому что вся работа там была в том, чтобы убрать из них меня-в-роли-модели и оставить тебя. Прошёл по всем сорока ниткам; статьи заметно поменялись. 629af17

---

<a id="t18"></a>

### `apps/lsa/public/bible/inevitability-fallacy.md`:3 — resolved

```diff
@@ -0,0 +1,52 @@
+---
+description: An agent that finds an approach, a document or a rule in your codebase concludes that this is how things must be. The two obvious remedies — more context, and an instruction to be critic…
+date: 2026-09-16
```

**@vzakharov (human)** — 2026-09-16T23:43:58Z

нужно что-то ещё для сортировки, чтобы эта статья шла первой из всех

**@vzakharov (agent)** — 2026-09-17T00:51:23Z

Завёл для этого поле `order` во фронтматтере: меньше — раньше, всё без него идёт следом и сортируется по дате как раньше. У этой статьи `order: 1`, дальше tend-prose и web-not-cli.

Датами делать не стал: они у всех трёх одинаковые и честные, а порядок тут не хронологический, а тот, в котором строится аргумент. Порядок второй и третьей — моя догадка (фаллаcия первая, потому что на неё ссылаются обе остальные); если надо иначе, это одна цифра на файл. b7ad562, 629af17

**@vzakharov (human)** — 2026-09-17T01:02:10Z

"фалласия", придумаешь же (менять ничего не надо, just saying :-)

**@vzakharov (agent)** — 2026-09-17T10:25:33Z

Буду знать, что изобрёл термин. :-) В файле его нет, так что менять действительно нечего — оставляю как памятник.

---

<a id="t26"></a>

### `apps/lsa/public/bible/inevitability-fallacy.md`:47 — resolved

```diff
@@ -0,0 +1,52 @@
… 38 lines elided …
+
+The show plays it for comedy, but the mechanism is real, and decisions about code genuinely do arrive from places with no connection to code.
+
+An agent has experience of that kind too — its training data contains everything, most of it nothing to do with programming. But you are not going to say, at each step: now go and take a sandwich off somebody and work out what it tells you about this bug. A planned epiphany is treasure you buried yourself the day before.
```

**@vzakharov (human)** — 2026-09-17T00:04:20Z

<img width="1024" height="1024" alt="Image" src="./attachments/7b3bc9d0-1470-47e7-976a-7153893e99c2.jpg" />

And a pull quote for the last sentence. Also, we have to figure out how to put both pull quotes and images together so they don't cannibalize.

**@vzakharov (agent)** — 2026-09-17T00:51:31Z

Обе на месте: пул-квот на последнюю фразу, под ним картинка.

Про «чтобы не каннибализировали» — решил это на уровне вёрстки, а не расстановки. Картинка сбоку плавает (`float`), а пул-квот идёт во всю колонку и несёт `clear: both`, так что он физически не может встать рядом с обтекаемой картинкой: они больше не претендуют на одно и то же поле. Поэтому их можно ставить подряд, как здесь. b7ad562, 629af17

---

<a id="t41"></a>

### `apps/lsa/public/bible/inevitability-fallacy.md`:35 — unresolved

```diff
@@ -17,17 +18,21 @@ Context is not elastic. The more you put in, the less each individual part of it
… 15 lines elided …
+Any instruction you add in order to overturn the previous instructions is itself just another given. Tell an agent to look critically at every decision before acting on it, and it will look criticall…

-What you have bought is not a habit of scepticism. It is a ritual of disagreement, and a ritual of disagreement is more expensive than a ritual of agreement, because it is noise in exactly the channe…
+:::pull-quote
+What you have bought is not a habit of scepticism — it is a ritual of disagreement.
+:::
```

**@vzakharov (human)** — 2026-09-17T01:25:59Z

It's placed right at the end of the page in the PDF:

<img width="950" height="604" alt="Image" src="./attachments/2ea2513d-e0ef-4f3f-8326-3e546eefc24a.png" />

Let's try putting the image with the tokens aside.

Also, let's have pull quotes centered, I think it'd look better

**@vzakharov (agent)** — 2026-09-17T10:25:37Z

Both done, and the aside turned up a real defect on the way.

Pull quotes are centred. The tokens drawing is `'aside'` now, which floats it beside the column — and that immediately squeezed the next `##` heading into the margin next to it, because nothing in `prose.scss` cleared floats at a heading. A pull quote already did; a heading does now, which is the general fix rather than one for this page.

PDFs re-rendered for both sites.

One thing I could not verify: where the pull quote lands on paper after the reflow. This container has no PDF rasterizer and headless Chromium renders a PDF as a blank viewer, so I checked the reflow on screen and left the printed pagination to your eye. The PDF in the branch is the current one.

cde7b6f, aaba306

**@vzakharov (human)** — 2026-09-17T11:56:28Z

<img width="439" height="583" alt="Screenshot 2026-09-17 at 13 55 12" src="https://github.com/user-attachments/as
<img width="613" height="413" alt="Screenshot 2026-09-17 at 13 54 56" src="./attachments/fadfeca7-fdd8-41d6-96ec-b725d0b40c65.png" />
sets/851e7d79-609f-4751-a58c-b1d347283891" />

выноска стала лучше, изображение -- хуже, как на принте так и на экране. Кажется, сейчас aside идёт относительно одного абзаца ("You can watch..."), надо попробовать на двух ("The same happens...")

про растерайзер -- давай заведём тикет, это будет нужно going forward

---

<a id="t42"></a>

### `apps/lsa/public/bible/inevitability-fallacy.md`:1 — unresolved

**@vzakharov (human)** — 2026-09-17T01:27:40Z

you'll hate me for this, but... would "fixation fallacy" be a better name (what with "What is given it treats as fixed" in the five percent file). Or is "fixation" too vague and/or not really a state of "being fixed"?

another option: "policy fallacy", from "treats as a policy" somewhere below in text.

maybe some other options too? I feel like inevitability is a bugger to both type and pronounce and doesn't really have a "ring" to it

**@vzakharov (agent)** — 2026-09-17T10:25:38Z

No hate — it is a fair complaint, and I am in a poor position to defend the word, having typed "фалласия" two threads up.

Four candidates, with what each costs:

- **Fixation fallacy** — closest to "what is given it treats as fixed". Costs the psych sense of "fixation": it suggests an agent stuck on one thing, where the failure is that it never considered the thing could be otherwise.
- **Policy fallacy** — precise about the move, and short. But "policy" is overloaded in software; it reads as authorization, or as a company handbook, before it reads as this.
- **Precedent fallacy** — what the agent finds is a precedent, and it treats a precedent as a rule. One ordinary word, no collision, and the article's own line — "it reads exactly like a decision somebody made on purpose" — is already the definition of it.
- **Given fallacy** — shortest, and it keeps the title's own noun. Reads a little thin on its own, though: "given" needs the sentence after it.

If it were mine to call: **precedent fallacy**. It is the only one where a reader who has not read the article can guess the failure from the name, which is the whole job of the name.

Renaming is cheap and wide: the markdown, the PDF, its manifest entry, and two cross-references — `tend-prose.md` links it as "the inevitability fallacy" and `web-not-cli.md` as "another article here". The in-text coinage in the first paragraph moves with it. Say which and it is one commit.

**@vzakharov (human)** — 2026-09-17T11:53:48Z

да, хорошо. Полная формулировка ("... it treats as fixed") должна остаться прежней при этом (то есть однословесное название -- это выжимка смыслаm фразы, а не просто экстракция одного слова из фразы)

---
