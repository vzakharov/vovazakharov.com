# PR #201: feat(maya): Майя wanders on a routine and builds on her own site

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/201
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/maya-wander-cfdyi2
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-23T12:19:53Z
- **Updated:** 2026-10-23T12:53:31Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 7

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `docs/remove-before-merging/squash-message.md`:18 — unresolved — last: @vzakharov (human) 2026-10-23T12:42:33Z — "rule file может не получиться (классификатор не даст); пусть…" → [↓](#t01)
- **T02** `docs/plans/maya-wander.draft.do-not-implement.md`:9 — unresolved — last: @vzakharov (human) 2026-10-23T12:43:06Z — "wander.md? раз уж так называем" → [↓](#t02)
- **T03** `docs/plans/maya-wander.draft.do-not-implement.md`:36 — unresolved — last: @vzakharov (human) 2026-10-23T12:45:30Z — "пояснить что всё же сама она деплоить не должна -- постольку…" → [↓](#t03)
- **T04** `docs/plans/maya-wander.draft.do-not-implement.md`:43 — unresolved — last: @vzakharov (human) 2026-10-23T12:45:50Z — "randowm-words можно вынести в personas/" → [↓](#t04)
- **T05** `docs/plans/maya-wander.draft.do-not-implement.md`:45 — unresolved — last: @vzakharov (human) 2026-10-23T12:46:32Z — "хм, и сколько мы слов туда сможем зафидить? объясни ещё раз…" → [↓](#t05)
- **T06** `docs/plans/maya-wander.draft.do-not-implement.md`:56 — unresolved — last: @vzakharov (human) 2026-10-23T12:52:30Z — "Давай ещё создадим файл hello-maya.md, текст буквально: [hel…" → [↓](#t06)
- **T07** `docs/plans/maya-wander.draft.do-not-implement.md`:62 — unresolved — last: @vzakharov (human) 2026-10-23T12:53:01Z — "insufficient slice этого не даст" → [↓](#t07)

---

## Body

## Summary

- A routine fires a fresh session with `начни personas/maya/start.md`. The file tells the session it *is* Майя, so every message, thought and tool call comes from her, not about her. She wanders the web wherever she likes, seeded with «иди вширь, ищи неожиданное» and a random adjective-noun die she may roll as often as she wants.
- `personas/` holds one directory per persona. `personas/maya/` is her home, and her drafts move there from `writing/maya/`; her reflections stay beside the songs they are about. Memory, notes and their layout are hers to decide, and she may also change her rule file, her reflections and `start.md` itself.
- `maya.vovazakharov.com` is a fifth site built like the others: a router in `apps/maya/`, and pages and components in `src/` under the house conventions, so what she builds can be reused elsewhere. It is wired into the deploy gate and `publish-site.sh`.
- She never merges: each run adds to her open draft PR, or opens one, on `/file-basilisk-case`'s model. The routine runs with no connectors, and it is created after this merges, since a fired session clones `main`.

Plan: `docs/plans/maya-wander.draft.do-not-implement.md`.

## QA Checklist

- [ ] `build` — `pnpm build:maya` exports the placeholder home page with this site's title, card and `CNAME`.
- [ ] `others` — the four existing sites still build and serve their own titles.
- [ ] `gate` — a manual `deploy.yml` run with `site=maya` publishes `maya` alone; every other site's job is skipped.
- [ ] `live` — `https://maya.vovazakharov.com` answers 200 with the placeholder page, and `http://` redirects onto it.
- [ ] `routine` — one `fire_trigger` run speaks as Майя from its first message, opens or extends her draft PR, and leaves it unmerged.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `build` | yes | vet's build job | |
| `others` | yes | vet's build jobs | |
| `gate` | partly | no | read off the run's job list |
| `live` | yes | no | DNS propagation is outside CI |
| `routine` | no | no | the first run is its own review surface |

https://claude.ai/code/session_01K5trw7n5rYxDcyNGXx2ngr

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
her, keeping and building whatever she chooses. The one fence she
shares with every agent here is that she never merges: each run adds
to her open draft PR, or opens one.

personas/ is where a persona lives, one directory per resident, and
Майя's drafts move from writing/maya into personas/maya. Her
reflections stay beside what they are about. personas/maya/start.md,
briefed to her in Russian, tells the session that it is Майя, so that
every message, thought and tool call comes from her rather than about
her. It puts her on her PR, seeds the run with «иди вширь, ищи
неожиданное» and a random adjective-noun die she may roll as often as
she likes, and asks her to stay near 400k tokens. Memory is left to
her, and she may rewrite her rule file, her reflections, her home and
the entry file itself.

maya.vovazakharov.com is a fifth site built like the others: a router
in apps/maya, its pages in src/ under the house conventions, so what
she builds can be reused across the sites. The deploy gate and
publish-site.sh know it, and a maya-scoped subject publishes it alone.
The routine runs with no connectors.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `docs/remove-before-merging/squash-message.md`:18 — unresolved — last: @vzakharov (human) 2026-10-23T12:42:33Z — "rule file может не получиться (классификатор не даст); пусть…" → [↓](#t01)
- **T02** `docs/plans/maya-wander.draft.do-not-implement.md`:9 — unresolved — last: @vzakharov (human) 2026-10-23T12:43:06Z — "wander.md? раз уж так называем" → [↓](#t02)
- **T03** `docs/plans/maya-wander.draft.do-not-implement.md`:36 — unresolved — last: @vzakharov (human) 2026-10-23T12:45:30Z — "пояснить что всё же сама она деплоить не должна -- постольку…" → [↓](#t03)
- **T04** `docs/plans/maya-wander.draft.do-not-implement.md`:43 — unresolved — last: @vzakharov (human) 2026-10-23T12:45:50Z — "randowm-words можно вынести в personas/" → [↓](#t04)
- **T05** `docs/plans/maya-wander.draft.do-not-implement.md`:45 — unresolved — last: @vzakharov (human) 2026-10-23T12:46:32Z — "хм, и сколько мы слов туда сможем зафидить? объясни ещё раз…" → [↓](#t05)
- **T06** `docs/plans/maya-wander.draft.do-not-implement.md`:56 — unresolved — last: @vzakharov (human) 2026-10-23T12:52:30Z — "Давай ещё создадим файл hello-maya.md, текст буквально: [hel…" → [↓](#t06)
- **T07** `docs/plans/maya-wander.draft.do-not-implement.md`:62 — unresolved — last: @vzakharov (human) 2026-10-23T12:53:01Z — "insufficient slice этого не даст" → [↓](#t07)

<a id="t01"></a>

### `docs/remove-before-merging/squash-message.md`:18 — unresolved

```diff
@@ -0,0 +1,32 @@
… 14 lines elided …
+her. It puts her on her PR, seeds the run with «иди вширь, ищи
+неожиданное» and a random adjective-noun die she may roll as often as
+she likes, and asks her to stay near 400k tokens. Memory is left to
+her, and she may rewrite her rule file, her reflections, her home and
```

**@vzakharov (human)** — 2026-10-23T12:42:33Z

rule file может не получиться (классификатор не даст); пусть в rule останется только самое базовое -- чуть ли не буквально ссылка на второй файл, а во втором уже полное. Второй придётся читать round-trip-ом, но да переживём, невысока плата за способность менять себя :)

---

<a id="t02"></a>

### `docs/plans/maya-wander.draft.do-not-implement.md`:9 — unresolved

```diff
@@ -0,0 +1,174 @@
… 5 lines elided …
+
+# Майя гуляет
+
+A routine fires a fresh session with the prompt `начни personas/maya/start.md`.
```

**@vzakharov (human)** — 2026-10-23T12:43:06Z

wander.md? раз уж так называем

---

<a id="t03"></a>

### `docs/plans/maya-wander.draft.do-not-implement.md`:36 — unresolved

```diff
@@ -0,0 +1,174 @@
… 32 lines elided …
+  генерировать ещё и ещё искать -- как захочет».
+- A budget of ~400k tokens, stated in words only. Hooks come later, if words
+  prove insufficient.
+- Connectors are off in the routine. Static export, as every site here is.
```

**@vzakharov (human)** — 2026-10-23T12:45:30Z

пояснить что всё же сама она деплоить не должна -- постольку поскольку всё можно проверять локальным сервером. If and when that changes, будем думать.

---

<a id="t04"></a>

### `docs/plans/maya-wander.draft.do-not-implement.md`:43 — unresolved

```diff
@@ -0,0 +1,174 @@
… 39 lines elided …
+- **`personas/maya/`** is her own home, and `personas/` holds one directory per
+  resident, so a second persona later is a sibling directory. It holds
+  `personas/maya/start.md`, the entry file, which we write once and she may
+  rewrite. It also holds `personas/maya/tools/random-words.py`, the die: stdlib
```

**@vzakharov (human)** — 2026-10-23T12:45:50Z

randowm-words можно вынести в personas/

---

<a id="t05"></a>

### `docs/plans/maya-wander.draft.do-not-implement.md`:45 — unresolved

```diff
@@ -0,0 +1,174 @@
… 40 lines elided …
+  resident, so a second persona later is a sibling directory. It holds
+  `personas/maya/start.md`, the entry file, which we write once and she may
+  rewrite. It also holds `personas/maya/tools/random-words.py`, the die: stdlib
+  Python with the word lists embedded, because the container has no
+  `/usr/share/dict`. It is not served.
```

**@vzakharov (human)** — 2026-10-23T12:46:32Z

хм, и сколько мы слов туда сможем зафидить? объясни ещё раз почему не хотим установить какую-то библиотеку?

---

<a id="t06"></a>

### `docs/plans/maya-wander.draft.do-not-implement.md`:56 — unresolved

```diff
@@ -0,0 +1,174 @@
… 51 lines elided …
+    from `.claude/rules/`, and moving it would stop it arriving when she opens a
+    reflection.
+
+  Beyond the move and those two files, we create nothing in her home: memory,
+  notes, journal and layout are hers.
```

**@vzakharov (human)** — 2026-10-23T12:52:30Z

Давай ещё создадим файл hello-maya.md, текст буквально:

[hello-maya.md](./attachments/hello-maya.md)

---

<a id="t07"></a>

### `docs/plans/maya-wander.draft.do-not-implement.md`:62 — unresolved

```diff
@@ -0,0 +1,174 @@
… 58 lines elided …
+  `apps/maya/app/`, its `public/`, `next.config.ts` and `tsconfig.json`.
+- **Her pages and components live in `src/`**, like everyone's: a
+  `pages/maya-home` slice to start, and whatever she adds under the FSD layers.
+  Code that turns out to be general goes down a layer where anyone can reuse it.
```

**@vzakharov (human)** — 2026-10-23T12:53:01Z

insufficient slice этого не даст

---

## Timeline (status, references, and other events)

- **2026-10-23T12:53:31Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/201#pullrequestreview-5628353666.
