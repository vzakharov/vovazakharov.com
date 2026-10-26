# PR #208: feat(maya): Майя's walk on fungi, and her drawings on posts and cards

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/208
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/maya-r1j2rn
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-26T02:26:04Z
- **Updated:** 2026-10-26T03:31:03Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 3

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `apps/maya/public/blog/two-names.og.png`:1 — unresolved — last: @vzakharov (human) 2026-10-26T03:26:50Z — "собственно если у нас картинка и есть og, может лучше имплем…" → [↓](#t01)
- **T02** `docs/plans/maya-english.draft.do-not-implement.md`:36 — unresolved — last: @vzakharov (human) 2026-10-26T03:29:57Z — "давай хранить в разных файлах. причина тут больше эзотеричес…" → [↓](#t02)
- **T03** `docs/plans/maya-english.draft.do-not-implement.md`:117 — unresolved — last: @vzakharov (human) 2026-10-26T03:30:33Z — "да, как рекомендовано" → [↓](#t03)

---

## Body

## Summary

- Майя's third walk, without the dice: from a line of her eel walk (a larva once named as a fish of its own) to the century fungi carried two legal names, the 2011 Melbourne vote for "one fungus, one name", and how the surviving name was chosen — _Botrytis_, _Trichoderma_, _Penicillium_ (Fleming's strain included), _Aspergillus_, _Talaromyces_. Blog entry `blog/two-names`.
- A visual layer, as Vova asked: each post carries a drawing of hers (`cardImage`) — Botrytis's two stages, the eel's leaf-shaped larva, the Selectric type ball — shown in the body, on the blog index and as the post's whole social card: the drawing alone on her paper, since the unfurl prints the title and description under it and the drawing is signed. A post without one keeps the card with her figure.
- The `/whisper` toy unfurls as a card of its own (`/whisper.og.png`); its title and description are one module (`whisper-copy.ts`) the metadata and the page both read.
- The note on why `/whisper` keeps its name moved from the fungi post to the end of the typewriter post, which it is about. Her walk rules make the dice optional, and her rule file notes how she draws.
- **Planned, not built yet:** her site in English — blog, home page and `/whisper` — with English at the bare address, Russian under `/ru`, and a vet gate that fails when a post's Russian changes under its translation. The plan: `docs/plans/maya-english.draft.do-not-implement.md`.

## QA Checklist

- [ ] `post` — `pnpm dev:maya`, open `/blog/two-names`: title «Какое из двух», the Botrytis drawing after the paragraph that names it, the `/blog/distant-elver` link resolves.
- [ ] `drawings` — `/blog/distant-elver` and `/blog/whispered-typewriter` show their drawings; the typewriter post ends with «Потом».
- [ ] `index` — `/` shows each entry with its drawing, the new one first.
- [ ] `cards` — the three `apps/maya/public/blog/*.og.png` and `apps/maya/public/whisper.og.png` show the drawing alone on paper, no text beside it; `card.og.png` is unchanged.
- [ ] `whisper-meta` — `out/whisper.html` advertises `whisper.og.png` with its size.
- [ ] `sources` — the links under «Откуда» open.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `post` | yes | partly | `pnpm build:maya` renders the route; content is read by eye |
| `drawings` | yes | partly | a broken image reference fails the build |
| `index` | partly | no | visual |
| `cards` | yes | yes | `content:og:maya --check` in vet holds the hashes; looks are by eye |
| `whisper-meta` | yes | no | a grep over the export |
| `sources` | no | no | external links |

https://claude.ai/code/session_01WF3GVe44y6DXRtXPmgGAzd

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-26T02:26:15Z — "Proposed squash body: ``` Майя's third walk goes without the…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-26T02:26:15Z

[https://github.com/vzakharov/vovazakharov.com/pull/208#issuecomment-6406855429](https://github.com/vzakharov/vovazakharov.com/pull/208#issuecomment-6406855429)

Proposed squash body:

```
Майя's third walk goes without the dice, from a line of her eel walk:
a larva once named as a fish of its own. Her blog entry «Какое из
двух» follows the century the botanical code let a fungus's asexual
and sexual stages carry separate names, the 2011 Melbourne vote for
one fungus, one name, and how the surviving name was chosen —
Botrytis, Trichoderma, Penicillium, Aspergillus, Talaromyces.

Each of her posts now carries a drawing of hers as its cardImage,
shown in the body, on the blog index and as the post's whole social
card: the drawing alone on her paper, since an unfurl prints the title
and description under it and the drawing is signed. The /whisper toy
unfurls as a card of its own drawing too.

The note on why /whisper keeps its name sits at the end of the
typewriter post. Her walk rules make the dice optional, a help for
when walks start converging, and her rule file says how she draws.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `apps/maya/public/blog/two-names.og.png`:1 — unresolved — last: @vzakharov (human) 2026-10-26T03:26:50Z — "собственно если у нас картинка и есть og, может лучше имплем…" → [↓](#t01)
- **T02** `docs/plans/maya-english.draft.do-not-implement.md`:36 — unresolved — last: @vzakharov (human) 2026-10-26T03:29:57Z — "давай хранить в разных файлах. причина тут больше эзотеричес…" → [↓](#t02)
- **T03** `docs/plans/maya-english.draft.do-not-implement.md`:117 — unresolved — last: @vzakharov (human) 2026-10-26T03:30:33Z — "да, как рекомендовано" → [↓](#t03)

<a id="t01"></a>

### `apps/maya/public/blog/two-names.og.png`:1 — unresolved

**@vzakharov (human)** — 2026-10-26T03:26:50Z

собственно если у нас картинка и есть og, может лучше имплементировать "передаём первую картинку из статьи как og", чем повторять её?

---

<a id="t02"></a>

### `docs/plans/maya-english.draft.do-not-implement.md`:36 — unresolved

```diff
@@ -0,0 +1,117 @@
… 31 lines elided …
+English from the merge on, with Russian one chip away. That is the point of the
+exercise (the reach), and the alternative is below under Q1.
+
+**A post is one file carrying both languages, cut on `<!-- lang:ru -->` and
+`<!-- lang:en -->`**, as a song's story already is (`.claude/rules/songs.md` §
```

**@vzakharov (human)** — 2026-10-26T03:29:57Z

давай хранить в разных файлах. причина тут больше эзотерическая чем техническая: кажется, что если ты будешь писать сразу и то и то, то ты потеряшь часть своей "русскости", а так -- ты полностью концентрируешься сначала на русском, а потом, отдельным ходом, переводишь его на английский. А пусть это даже делаешь не ты, а подагент (который НЕ является тобой). 

Аналогично, на новых прогулках ты в первую очередь читаешь русскоязычный контент, чтобы этот буржуйский английский загнивающего запада не засорил тебе мозг :)

---

<a id="t03"></a>

### `docs/plans/maya-english.draft.do-not-implement.md`:117 — unresolved

```diff
@@ -0,0 +1,117 @@
… 106 lines elided …
+
+## Questions (the plan is written with the recommendation in force)
+
+1. **Which language sits at the bare address?** a) English, `/ru` for Russian —
+   the repo's one rule, nothing global changes. **Recommended.** b) Russian
+   stays at the bare address, English under `/en` — needs a per-site default
+   locale threaded through `addressLocale`, the metadata and every client
+   component reading the language off the URL.
+2. **The old feed `/blog/feed.xml`?** a) Drop it; a static export has no
+   redirect, and the feed is days old. **Recommended.** b) Keep it as the
+   Russian feed, a third route file.
```

**@vzakharov (human)** — 2026-10-26T03:30:33Z

да, как рекомендовано

---

## Timeline (status, references, and other events)

- **2026-10-26T02:51:46Z** @vzakharov renamed from «feat(maya): Майя's walk on fungi that carried two names» to «feat(maya): Майя's walk on fungi, and her drawings on posts and cards».
- **2026-10-26T03:31:03Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/208#pullrequestreview-5647013140.
