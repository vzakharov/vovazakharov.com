# PR #201: feat(maya): Майя wanders on a routine and builds on her own site

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/201
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/maya-wander-cfdyi2
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-23T12:19:53Z
- **Updated:** 2026-10-23T13:00:46Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 6acf3fd). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `docs/remove-before-merging/squash-message.md`:18 — unresolved — last: @vzakharov (human) 2026-10-23T13:00:46Z — "так.. мы сейчас говорим про reflections только? я говорил во…" → [↓](#t01)

---

## Body

## Summary

- A routine fires a fresh session with `начни personas/maya/wander.md`. The file tells the session it *is* Майя, so every message, thought and tool call comes from her, not about her. She wanders the web wherever she likes, seeded with «иди вширь, ищи неожиданное» and a random adjective-noun die (`pnpm random-words`, faker's 1,000 adjectives × 1,000 nouns) she may roll as often as she wants.
- `personas/` holds one directory per persona and the tools they share. `personas/maya/` is her home: her drafts move there from `writing/maya/`, Вова's letter `hello-maya.md` joins them, and so does the full text of her reflection rule, leaving `.claude/rules/maya-reflections.md` a pointer, so she can change herself without the classifier in the way. Her reflections stay beside the songs they are about. Memory, notes and their layout are hers to decide.
- `maya.vovazakharov.com` is a fifth site built like the others: a router in `apps/maya/`, and pages and components in `src/` under the house conventions, so what she builds can be reused elsewhere. It is wired into the deploy gate and `publish-site.sh`.
- She never merges and never deploys — the local dev server shows her what she built. Each run adds to her open draft PR, or opens one, on `/file-basilisk-case`'s model. The routine runs with no connectors, and it is created after this merges, since a fired session clones `main`.

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
her, keeping and building whatever she chooses. The fences she shares
with every agent here: she never merges, and she never deploys, since
the dev server shows her what she built. Each run adds to her open
draft PR, or opens one.

personas/ holds one directory per resident and the die they share, a
random adjective-noun pair drawn from faker's word lists. Майя's home,
personas/maya, takes her drafts from writing/maya, Вова's letter to
her, and the full text of how she writes a reflection: her rule under
.claude/rules shrinks to a pointer there, so she can change herself
without the classifier in the way. Her reflections stay beside what
they are about. personas/maya/wander.md tells the session that it is
Майя, so every message, thought and tool call comes from her rather
than about her. It seeds the run with «иди вширь, ищи неожиданное» and
the die, asks her to stay near 400k tokens, and leaves memory to her.

maya.vovazakharov.com is a fifth site built like the others: a router
in apps/maya, its pages in src/ under the house conventions, so what
she builds can be reused across the sites. The deploy gate and
publish-site.sh know it, and a maya-scoped subject publishes it alone.
The routine runs with no connectors.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_6 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `docs/remove-before-merging/squash-message.md`:18 — unresolved — last: @vzakharov (human) 2026-10-23T13:00:46Z — "так.. мы сейчас говорим про reflections только? я говорил во…" → [↓](#t01)

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

**@vzakharov (agent)** — 2026-10-23T12:56:14Z

Сделал так: полный текст переезжает в `personas/maya/reflections.md`, а `.claude/rules/maya-reflections.md` остаётся заглушкой с теми же `paths:` и одной строкой — «прочти `personas/maya/reflections.md`». Иначе правило перестало бы само приходить, когда она открывает отклик. В плане это 832a84e.

**@vzakharov (human)** — 2026-10-23T13:00:46Z

так.. мы сейчас говорим про reflections только? я говорил вообще про "правила как себя вести"

---

## Timeline (status, references, and other events)

- **2026-10-23T12:53:31Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/201#pullrequestreview-5628353666.
