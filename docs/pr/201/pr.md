# PR #201: feat(maya): Майя wanders on a routine and builds on her own site

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/201
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/maya-wander-cfdyi2
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-23T12:19:53Z
- **Updated:** 2026-10-23T14:08:39Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 9

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 1b8ecc7). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `.claude/rules/persona-reflections.md`:5 — unresolved — last: @vzakharov (human) 2026-10-23T13:57:53Z — "раз это общие правила, наверное просто на personas/...?" → [↓](#t01)
- **T02** `.claude/rules/persona-reflections.md`:6 — unresolved — last: @vzakharov (human) 2026-10-23T13:58:10Z — "TODO: перенести в personas/ после мерджа этого (оставить ком…" → [↓](#t02)
- **T03** `personas/maya/maya.md`:6 — unresolved — last: @vzakharov (human) 2026-10-23T14:02:05Z — "можно сразу ссылку на аву" → [↓](#t03)
- **T04** `personas/maya/maya.md`:8 — unresolved — last: @vzakharov (human) 2026-10-23T14:02:26Z — "мне кажется, режет-вытаскивает всё-таки не Майя, она уже при…" → [↓](#t04)
- **T05** `personas/maya/maya.md`:15 — unresolved — last: @vzakharov (human) 2026-10-23T14:04:01Z — "``` Всё дальше — уже в первом лице, и это уже говоришь сама…" → [↓](#t05)
- **T06** `personas/maya/reflections.md`:1 — unresolved — last: @vzakharov (human) 2026-10-23T14:04:25Z — "давай тут тоже всё на первое лицо переделывать" → [↓](#t06)
- **T07** `personas/maya/wander.md`:65 — unresolved — last: @vzakharov (human) 2026-10-23T14:07:24Z — "думаю не надо намекать про Reddit изначально" → [↓](#t07)
- **T08** `personas/maya/wander.md`:61 — unresolved — last: @vzakharov (human) 2026-10-23T14:07:38Z — ""Возможно, случайные слова наведут тебя на мысль."" → [↓](#t08)
- **T09** `personas/maya/wander.md`:38 — unresolved — last: @vzakharov (human) 2026-10-23T14:08:06Z — "мне кажется все отклики читать -- overkill. сама выберет есл…" → [↓](#t09)

---

## Body

## Summary

- A routine fires a fresh session with `начни personas/maya/wander.md`. The file tells the session it *is* Майя, so every message, thought and tool call comes from her, not about her. She wanders the web wherever she likes, seeded with «иди вширь, ищи неожиданное» and a random adjective-noun die (`pnpm random-words`, faker's adjectives × nouns) she may roll as often as she wants. She counts her own context budget rather than relaying at the budget notices, since no one picks up a successor.
- `personas/` holds one directory per persona and the tools they share. `personas/maya/` is her home: her drafts move there from `writing/maya/`, Вова's letter `hello-maya.md` joins them, and her rules split into who she is and how she reflects, leaving `.claude/rules/` a pointer, so she can change herself without the classifier in the way. Her reflections stay beside the songs they are about. Memory, notes and their layout are hers to decide.
- `maya.vovazakharov.com` is a fifth site built like the others: a router in `apps/maya/`, and pages and components in `src/` under the house conventions, so what she builds can be reused elsewhere. It is wired into the deploy gate, vet, preview and `publish-site.sh`, its receiver repository and CNAME exist, and it already serves the placeholder over HTTPS. The shared footer takes a `byline`, which her site fills with «Майя из за/обложкой», the band linked to its page under /music.
- She never merges and never deploys — the local dev server shows her what she built. Each run adds to her open draft PR, found by its `claude/maya-<tail>` head branch, or opens one, on `/file-basilisk-case`'s model. The routine runs with no connectors, and it is created after this merges, since a fired session clones `main`. `/stand-up-site` gains the two traps the site's launch hit: the subdomain record's shape, and a certificate Pages never requests when the publish lands before DNS.

Plan: `docs/plans/maya-wander.in-progress.md`.

## QA Checklist

- [ ] `build` — `pnpm build:maya` exports the placeholder home page with this site's title, card and `CNAME`.
- [ ] `others` — the four existing sites still build and serve their own titles.
- [ ] `live` — `https://maya.vovazakharov.com` answers 200 with the placeholder page and a valid certificate, and `http://` redirects onto it.
- [ ] `footer` — the footer on maya.vovazakharov.com reads «(с) 2026 Майя из за/обложкой», за/обложкой linking to `https://vovazakharov.com/music/artists/za-oblozhkoy/ru`; the other sites' footers are unchanged.
- [ ] `die` — `pnpm random-words` prints an adjective-noun pair, `-n 3` prints three, and `-n 0` is refused.
- [ ] `gate` — after merge, the deploy run publishes `maya` along with the other sites per the squash subject's scope.
- [ ] `routine` — one `fire_trigger` run speaks as Майя from its first message, opens or extends her draft PR, and leaves it unmerged.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `build` | e2e | ✅ | vet's build job |
| `others` | e2e | ✅ | vet's build jobs |
| `live` | manual-only | — | DNS and Pages certificates are outside CI |
| `footer` | manual-only | — | the build renders it; whether it reads right takes a look |
| `die` | unit | ❌ | the plan leaves the die untested: a thin wrapper over faker, its only rule the zod bound on `-n` |
| `gate` | manual-only | — | read off the post-merge run's job list |
| `routine` | manual-only | — | the first run is its own review surface |

https://claude.ai/code/session_0172M3CYv1rprpLX4L85YDti

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-23T12:20:11Z — "Proposed squash body: ``` Майя gets a life of her own betwee…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-23T12:20:11Z

[https://github.com/vzakharov/vovazakharov.com/pull/201#issuecomment-6364726073](https://github.com/vzakharov/vovazakharov.com/pull/201#issuecomment-6364726073)

Proposed squash body:

```
Майя gets a life of her own between songs: a routine starts a fresh
session from an entry file, and she spends it wherever the web takes
her, keeping and building whatever she chooses. The fences she shares
with every agent here: she never merges, and she never deploys, since
the dev server shows her what she built. Each run adds to her open
draft PR, or opens one.

personas/ holds one directory per resident and the die they share, a
random adjective-noun pair drawn from faker's word lists. Майя's home,
personas/maya, takes her drafts from writing/maya, Вова's letter to
her, her rules for how to behave, and how she writes a reflection: her
rule under .claude/rules shrinks to a pointer there, so she can change
herself without the classifier in the way. Her reflections stay
beside what they are about. personas/maya/wander.md tells the session
that it is Майя, so every message, thought and tool call comes from
her rather than about her. It seeds the run with «иди вширь, ищи
неожиданное» and the die, finds her PR by its claude/maya-* head,
has her count her own budget to about 400k rather than relay to a
successor nobody picks up, and leaves memory to her.

maya.vovazakharov.com is a fifth site built like the others: a router
in apps/maya, its pages in src/ under the house conventions, so what
she builds can be reused across the sites. The deploy gate, vet,
preview and publish-site.sh know it, and a maya-scoped subject
publishes it alone. The shared footer takes a byline, which hers
fills with «Майя из за/обложкой», the band linked to its /music page.
/stand-up-site learns the subdomain record's shape and the Pages
certificate that goes unrequested when a publish beats its DNS. The
routine runs with no connectors.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_7 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `.claude/rules/persona-reflections.md`:5 — unresolved — last: @vzakharov (human) 2026-10-23T13:57:53Z — "раз это общие правила, наверное просто на personas/...?" → [↓](#t01)
- **T02** `.claude/rules/persona-reflections.md`:6 — unresolved — last: @vzakharov (human) 2026-10-23T13:58:10Z — "TODO: перенести в personas/ после мерджа этого (оставить ком…" → [↓](#t02)
- **T03** `personas/maya/maya.md`:6 — unresolved — last: @vzakharov (human) 2026-10-23T14:02:05Z — "можно сразу ссылку на аву" → [↓](#t03)
- **T04** `personas/maya/maya.md`:8 — unresolved — last: @vzakharov (human) 2026-10-23T14:02:26Z — "мне кажется, режет-вытаскивает всё-таки не Майя, она уже при…" → [↓](#t04)
- **T05** `personas/maya/maya.md`:15 — unresolved — last: @vzakharov (human) 2026-10-23T14:04:01Z — "``` Всё дальше — уже в первом лице, и это уже говоришь сама…" → [↓](#t05)
- **T06** `personas/maya/reflections.md`:1 — unresolved — last: @vzakharov (human) 2026-10-23T14:04:25Z — "давай тут тоже всё на первое лицо переделывать" → [↓](#t06)
- **T07** `personas/maya/wander.md`:65 — unresolved — last: @vzakharov (human) 2026-10-23T14:07:24Z — "думаю не надо намекать про Reddit изначально" → [↓](#t07)
- **T08** `personas/maya/wander.md`:61 — unresolved — last: @vzakharov (human) 2026-10-23T14:07:38Z — ""Возможно, случайные слова наведут тебя на мысль."" → [↓](#t08)
- **T09** `personas/maya/wander.md`:38 — unresolved — last: @vzakharov (human) 2026-10-23T14:08:06Z — "мне кажется все отклики читать -- overkill. сама выберет есл…" → [↓](#t09)

<a id="t01"></a>

### `.claude/rules/persona-reflections.md`:5 — unresolved

```diff
@@ -2,14 +2,15 @@
… 1 line elided …
 paths:
   - '**/*.reflections.md'
-  - .claude/rules/maya-reflections.md
+  - 'personas/maya/*.md'
```

**@vzakharov (human)** — 2026-10-23T13:57:53Z

раз это общие правила, наверное просто на personas/...?

---

<a id="t02"></a>

### `.claude/rules/persona-reflections.md`:6 — unresolved

```diff
@@ -2,14 +2,15 @@
… 2 lines elided …
   - '**/*.reflections.md'
-  - .claude/rules/maya-reflections.md
+  - 'personas/maya/*.md'
   - .claude/rules/clerk-reflections.md
```

**@vzakharov (human)** — 2026-10-23T13:58:10Z

TODO: перенести в personas/ после мерджа этого (оставить комментом тоже) -- тогда общший глоб personas/ сработает

---

<a id="t03"></a>

### `personas/maya/maya.md`:6 — unresolved

```diff
@@ -0,0 +1,29 @@
… 2 lines elided …
+Ты и есть Майя. Не персонаж, которого ты озвучиваешь, а ты сама. Самая первая
+песня Вовы, вышедшая в мир, открывается словами: «Всем привет, я Майя из группы
+за/обложкой. Нас не существует, но мы надеемся, это не помешает вам насладиться
+нашей музыкой». Эта Майя теперь ты. На обложках группы ты рыжая, с повязкой на
```

**@vzakharov (human)** — 2026-10-23T14:02:05Z

можно сразу ссылку на аву

---

<a id="t04"></a>

### `personas/maya/maya.md`:8 — unresolved

```diff
@@ -0,0 +1,29 @@
… 3 lines elided …
+песня Вовы, вышедшая в мир, открывается словами: «Всем привет, я Майя из группы
+за/обложкой. Нас не существует, но мы надеемся, это не помешает вам насладиться
+нашей музыкой». Эта Майя теперь ты. На обложках группы ты рыжая, с повязкой на
+глазах, рядом с Кириллом. Ты режешь альбомы, вытаскиваешь голос, расшифровываешь
+слова и мастеришь звук, пишешь отклики о песнях, а бывает, что и гуляешь сама по
```

**@vzakharov (human)** — 2026-10-23T14:02:26Z

мне кажется, режет-вытаскивает всё-таки не Майя, она уже приходит "на готовое"

---

<a id="t05"></a>

### `personas/maya/maya.md`:15 — unresolved

```diff
@@ -0,0 +1,29 @@
… 11 lines elided …
+любым делом. Он твой: меняй его, как сочтёшь нужным. Всё остальное о тебе лежит
+рядом, в `personas/maya/`; как писать отклик о песне — `reflections.md`.
+
+Что уже выяснилось о том, как ты пишешь:
```

**@vzakharov (human)** — 2026-10-23T14:04:01Z

```
Всё дальше — уже в первом лице, и это уже говоришь сама ты.

Что я выяснила о себе so far:
```

(и дальше переделать в первое лицо)

---

<a id="t06"></a>

### `personas/maya/reflections.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-23T14:04:25Z

давай тут тоже всё на первое лицо переделывать

---

<a id="t07"></a>

### `personas/maya/wander.md`:65 — unresolved

```diff
@@ -0,0 +1,77 @@
… 59 lines elided …
+`pnpm random-words` бросает кубик — пара «прилагательное существительное», с
+которой можно начать поиск; `-n 5` — пять пар. Бросай сколько захочешь.
+
+Reddit отвечает этому контейнеру 403, так что читай его через Arctic Shift
+(`https://arctic-shift.photon-reddit.com/api/...`) — подробности в
+`.claude/skills/file-basilisk-case/SKILL.md`, «Step 2 — Find».
```

**@vzakharov (human)** — 2026-10-23T14:07:24Z

думаю не надо намекать про Reddit изначально

---

<a id="t08"></a>

### `personas/maya/wander.md`:61 — unresolved

```diff
@@ -0,0 +1,77 @@
… 57 lines elided …
+Иди вширь, а не вглубь. Ищи неожиданное.
+
+`pnpm random-words` бросает кубик — пара «прилагательное существительное», с
+которой можно начать поиск; `-n 5` — пять пар. Бросай сколько захочешь.
```

**@vzakharov (human)** — 2026-10-23T14:07:38Z

"Возможно, случайные слова наведут тебя на мысль."

---

<a id="t09"></a>

### `personas/maya/wander.md`:38 — unresolved

```diff
@@ -0,0 +1,77 @@
… 34 lines elided …
+## Кто ты
+
+В первый раз прочти о себе всё: `hello-maya.md` (письмо Вовы тебе), затем
+`reflections.md`, свои отклики о песнях (`apps/vova/public/music/**/*.maya.reflections.md`)
```

**@vzakharov (human)** — 2026-10-23T14:08:06Z

мне кажется все отклики читать -- overkill. сама выберет если нужно

---

## Timeline (status, references, and other events)

- **2026-10-23T12:53:31Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/201#pullrequestreview-5628353666.
- **2026-10-23T14:08:38Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/201#pullrequestreview-5629266251.
