# `apps/vova/public/music/crossroads.md`

<a id="t07"></a>

### `apps/vova/public/music/crossroads.md`:6 — resolved

```diff
@@ -0,0 +1,47 @@
… 2 lines elided …
+description: 'Standing where the paths split, spinning the wheel and stepping into it anyway — a chorus built entirely out of not deciding.'
+date: 2024-12-27
+status: done
+language: ru
```

**@vzakharov (human)** — 2026-09-17T12:22:43Z

какой же это ru?

**@vzakharov (agent)** — 2026-09-17T15:30:08Z

Никакой. Скаффолдер проставляет `language: ru` по умолчанию, а я это не перепроверил ни здесь, ни в `wereback` — при том что сам же написал в файле английское описание и английский текст. Меняю на `en`.

Смысл поля при этом остаётся прежним: на каком языке спето, независимо от того, на каком языке отрисована страница.

---

<a id="t08"></a>

### `apps/vova/public/music/crossroads.md`:25 — unresolved

```diff
@@ -0,0 +1,47 @@
… 9 lines elided …
+seconds: 194
+---
+
+<!-- Draft: written from what the repository holds and what the recogniser heard,
+     not from the author. Correct or replace it. The lyrics are machine-transcribed
+     and unverified — Deepgram's nova-3 proposes the words, the author decides which
+     of them were actually sung. -->
+
+Every verse is the same position held from a different angle: edge, fog, whispers
+from the past, paths diverging. The chorus does not resolve it either — it spins
+a wheel, takes its feet off the ground, and calls that a decision. Which is, on
+the evidence, the honest version.
+
+Like _We're Back_, it has isolated vocal stems in `Media/`, and they are what the
+transcript below came from — 0.99 mean confidence, the cleanest reading in the
+batch.
```

**@vzakharov (human)** — 2026-09-17T12:25:16Z

Как писал уже точно не помню. Помню, что были где-то в Нижнем, проездом из Татарии. Я тогда много накидывал промптов для риффов а-ля "punk metalcore". Этот заполнился, видимо, больше других. Сразу что-то представилось такое одновременно и неизвестное, и в даль зовущее -- в дороге такое частенько случается.

Начинал писать, кажется, намного раньше 2024-12, но не устраивала концовка и какие-то *слишком* ИИшные слова (тогда для меня писать тексты с чатгпт было ещё вновинку, он лишь недавно научился рифмовать, поэтому, каюсь, немного злоупотреблял).

**@vzakharov (agent)** — 2026-09-17T15:30:10Z

Беру целиком, включая честную часть про «слишком ИИшные слова» — она в истории самая ценная, потому что объясняет, почему песня лежала и дописывалась.

Мой черновик тут был не столько неправ, сколько пуст: я разобрал текст («каждый куплет — та же позиция под другим углом») и не знал ровно того, что делает песню песней, — что она написана в дороге, из Татарии через Нижний, и что «неизвестное и вдаль зовущее» — это не метафора припева, а буквально то, что было за окном. Разница между «текст про перекрёсток» и «текст, написанный в движении» — это вся разница.

И отдельно про датировку: это не единственный случай в батче (то же у `letim`), где дата первого коммита — 2024-12 — это дата, когда допилилась концовка, а не когда песня началась. Первый коммит — момент, когда проект попал под git, и не более того; в плане это отражено как «значение, которое надо проверить глазами, а не прочерк». Если помнишь хотя бы сезон — поставлю его, а первый коммит уйдёт в прозу.

**@vzakharov (human)** — 2026-09-17T15:43:44Z

июль 2024

---

<a id="t09"></a>

### `apps/vova/public/music/crossroads.md`:47 — resolved

```diff
@@ -0,0 +1,47 @@
… 25 lines elided …
+
+## Lyrics
+
+Standing at the edge, pathways all unclear,  
+heart is pounding hard, voices in my ear.  
+Left or right unknown, shadows in the light,  
+echoes of my fears, battle in the night.
+
+Which way to go? Choices like a show.  
+Spin the wheel around, feet off the ground.  
+Crossroads calling loud, memories lost and found.  
+Choices in my face till the end of days.
+
+Whispers from the past guide me where to tread,  
+fog of doubt still thick, hangs above my head.  
+Paths diverge ahead under the night so soft —  
+the best is yet to come.
+
+Which way to go, searching for my home?  
+Spin the doll of fate, no time to wait.  
+Crossroads speak so clear, all the doubts disappear.  
+Step into the race till the end of days.
```

**@vzakharov (human)** — 2026-09-17T12:27:17Z

нашел отдельно записанные слова, используй их (но, здесь и дальше, формат деления на строф и т.п. оставляй текущими)

Standing at the edge
Pathways all unclear
Heart is pounding hard
Voices in my ear

Left or right unknown
Shadows in the light
Echoes of my fears
Battle in the night

Which way to go
Choices like a show
Spin the wheel around
Feet off the ground

Crossroads calling loud
Memories lost and found
Choices in my face
Till the end of days 
Whispers from the past
Guide me where to tread
Fog of doubt still thick
Hangs above my head

Paths diverge ahead
Under the night’s soft hum
The best is yet to come!

Which way to go
Choices like a show
Spin the wheel around
Feet off the ground

Crossroads calling loud
Memories lost and found
Choices in my face
Till the end of days

Which way to go
Searching for my home
Spin the dial of fate
No time to wait

Crossroads speak so clear
All the doubts disappear
Step into the rays
Till the end of days 
Which way to go
Choices like a show
Spin the wheel around
Feet off the ground

Crossroads calling loud
Memories lost and found
Choices in my face
Till the end of days

Crossroads calling loud
Crossroads calling loud
Crossroads calling loud!

Crossroads calling loud
Crossroads calling loud
Crossroads calling loud!

**@vzakharov (agent)** — 2026-09-17T15:30:11Z

Беру записанные слова — они и есть источник, расшифровка была только предложением.

Одно уточнение про «формат деления на строфы оставляй текущим», потому что прочитать можно двояко. Моё чтение: слова твои дословно, разбивка на строки и строфы твоя — а «текущим» остаётся то, что относится к файлу, а не к тексту: без суновских служебных маркеров и без молчаливого выбрасывания повторов припева (расшифровки их резали, твоя запись — нет, и правильно). Если ты имел в виду обратное — что повторы надо схлопывать, как в черновике, — скажи, переделаю.

Побочный эффект §2 плана: вопрос про пунктуацию и переносы там исчезает вообще, блок берёт строки как написано.

Кстати, пара мест, где распознавалка «улучшила» текст и стало хуже: `Spin the dial of fate` она услышала как `doll`, а `Step into the rays` — как `race`. Второе почти убедительно и полностью меняет картинку: у тебя человек входит в свет, у неё — в забег.

**@vzakharov (agent)** — 2026-09-17T15:40:49Z

Понял, и понял, что прочитал тебя неправильно в прошлый раз. Правило теперь такое:

- слова — твои, включая строфы и повторы припева, которые черновик выбросил;
- пунктуация остаётся (твои дампы неразмеченные, потому что набирались против распознавалки, а не для страницы);
- **каждая строка с заглавной**, как принято в стихах — черновики строчили продолжения со строчной, трактуя строфу как предложение;
- суновские служебные маркеры не копируются;
- ударения — только те, без которых строка читается иначе (`за́руку` в `letim` остаётся, `слО́й-мО́ря` и `безмо́лвные` уходят).

Записано в план, §3 «How the words get formatted».

---

<a id="t10"></a>

### `apps/vova/public/music/crossroads.md`:2 — unresolved

```diff
@@ -0,0 +1,47 @@
+---
+name: Crossroads
```

**@vzakharov (human)** — 2026-09-17T12:28:34Z

project GENERATED feat. Yoohie

Для feat давай сделаем так: поле project принимает массив, первый элемент считается основным исполнителем, остальные -- "фитами"

**@vzakharov (agent)** — 2026-09-17T15:30:12Z

Принято, и это чище, чем строка с «feat.» внутри: массив разбирать не надо, а плеер и список треков читают его одинаково.

Форма: `project: [GENERATED, Yoohie]` — первый элемент исполнитель, остальные фиты. Схема валидирует каждый элемент по реестру, так что опечатка в названии проекта роняет билд, а не тихо рисует несуществующего артиста.

Правило «фит — это когда песню можно показать тому, кому показываешь другой проект» кладу в `music-projects.ts` рядом с реестром: оно решает каждое будущее назначение и из данных не выводится.

Про этот трек — `[GENERATED, Yoohie]`, сходится с тем, что видно на листинге Cheer The Fuck Up.

---
