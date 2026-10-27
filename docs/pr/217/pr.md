# PR #217: feat: mayawonders.com on the paper of Майя's drawings

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/217
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/maya-wi7vbj
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-27T03:48:45Z
- **Updated:** 2026-10-27T08:41:57Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at a5c83dc). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `src/app/styles/globals.scss`:1 — unresolved — last: @vzakharov (human) 2026-10-27T08:41:56Z — "а корневой лейаут не может импортнуть откуда-то из твоего "р…" → [↓](#t01)

---

## Body

## Summary

- **mayawonders.com is set on the paper of Майя's drawings.** Vova asked her whether her site reflects her; it was a copy of the others, and only the drawings were hers — sitting on the white like plates pasted in from another book. A per-site palette keyed on `data-site` on `<html>`, in a file of her own (`src/app/styles/maya.scss`), gives her site paper `#f5efe3`, ink `#2b2622`, a lamplit dark variant, Georgia (the drawings' caption face, a system font) and regular-weight headings. The face and heading weight became custom properties in the shared theme; every other site renders as before. The language row on her pages is set in small capitals.
- **The home page is a book's opening spread** — her portrait as a frontispiece facing a title page that names the site as its domain does, “Maya wonders” / «Майя дивится», “A field guide to what turns up on walks, with plates” — and **lists entries as the numbered plates of a field guide** under “Plates” / «Таблицы» (was “Blog”), each a hairline-edged leaf: drawing, «Табл. III», italic title, date, blurb. **The whispering typewriter gets a leaf of its own** on a shelf above the plates — until now it was reachable only from inside a post — with a new wordless drawing, the sixteen sounds its bug hears. Its card and the site card are re-rendered onto the same paper.
- **Her articles and footers are hers.** An article carries its plate number over the title in place of the «Пишет Майя» byline, and every footer of hers — home, toy, articles — names her rather than Vova. The shared article page gains per-collection `eyebrow` and `byline` slots for that, in `article-slots.tsx`; `entities/maya` holds the plate number, label and byline both pages use.
- **«Вклейки»**, her walk entry about it: in old books plates were engraved, printed apart from the type on other paper, and numbered on their own — which is where the plate numbering comes from. Translated to English by a translator subagent; the English intro catches up with the rewritten Russian one.
- Her own files: giving her song reflections a home on her site joins the promises she keeps to herself in `wander.md`; `maya.md` gains what the walk showed about her.

## QA Checklist

- [ ] `home-paper` — `pnpm dev:maya`, open `/ru` and `/en`: paper background, Georgia, the title page reading «Майя дивится» / “Maya wonders” with its subtitle, a small-capitals «Игрушки»/“Toys” shelf with the sixteen-sounds wheel on a leaf linking to `/whisper`, then «Таблицы»/“Plates”: leaves of one height per row, numbered I–IV oldest first.
- [ ] `home-dark` — the same pages with the OS in dark mode: dark warm background, light text, drawings as light paper at the head of each leaf.
- [ ] `home-narrow` — at phone width the leaves stack in one column, the toy's upright like a plate, with no horizontal scroll.
- [ ] `article` — `/blog/distant-elver/ru`: «Табл. I» in small capitals over the title, no byline, «← Таблицы» back link, footer «© … Майя из за/обложкой»; the same footer under `/whisper`.
- [ ] `other-sites-unchanged` — `pnpm dev:vova` (and any other site): white page and Merriweather, bold headings, exactly as on `main`.
- [ ] `post` — `/blog/tipped-in/ru` and `/en`: the book-plate drawing captioned in each language, sources linked.
- [ ] `cards` — `card.og.png`, `whisper.og.png` and `blog/tipped-in.og.png` show the paper and the right drawings.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `home-paper` | screenshot | no | checked by eye in headless Chromium at 1280 and 500 |
| `home-dark` | screenshot | no | checked by eye with `--force-dark-mode` |
| `home-narrow` | screenshot | no | checked by eye at 390px |
| `article` | screenshot | no | checked by eye in headless Chromium, both themes |
| `other-sites-unchanged` | build | partly | `pnpm build:vova` passes; the look is by eye |
| `post` | build | yes | `pnpm build:maya` renders it and fails on a missing drawing |
| `cards` | `content:og:maya --check` | yes | hashes match; the image itself is by eye |

https://claude.ai/code/session_01DaohkEKfDX6cDCr7rBWcmu
https://claude.ai/code/session_01DaohkDpBfyS3AN4K45jz2g

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-27T03:49:11Z — "Proposed squash body: ``` Asked whether her site reflects he…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-27T03:49:11Z

[https://github.com/vzakharov/vovazakharov.com/pull/217#issuecomment-6433269931](https://github.com/vzakharov/vovazakharov.com/pull/217#issuecomment-6433269931)

Proposed squash body:

```
Asked whether her site reflects her, Майя found it a copy of the
others: the white page, Merriweather, boxed cards. Only her drawings
were hers, and on the white they sat like plates tipped into a book
from other paper.

mayawonders.com now has a palette and face of its own in
`maya.scss`, keyed on `data-site` on <html>: the drawings' paper and
ink, a lamplit dark variant, Georgia (their caption face, a system
font), regular-weight headings, and a language row set as small
capitals instead of boxes.
The shared theme reads the face and heading weight from custom
properties, so every other site renders as before.

Her home page opens as a book's spread, her portrait captioned as a
frontispiece facing a title page that names the book, as the domain
does: “Maya wonders” (ru «Майя дивится»), “A field guide to what turns
up on walks, with plates”, the site card retitled to match. Entries,
now “Plates” rather than “Blog”, are the numbered plates of a field
guide, each a hairline-edged leaf with the drawing across its head, and
each article carries its plate number over the title in place of a
byline, which on her own
site only repeated whose site it is; every footer of hers names her
rather than Vova. The shared article page gains per-collection slots
for both, `eyebrow` and `byline`. Her one toy, the whispering
typewriter, gets a place there for the first time, a leaf laid on its
side on a shelf above the plates, where entries to come never push it
down, with a
drawing of its own: the sixteen sounds its bug hears. Its
address and drawing move to `shared/config`, which the home page and
the toy's page both read. The site card moves onto the paper.

Her walk entry, «Вклейки», tells it through how old books printed
plates apart from the type; her promise to give her song reflections a
home on her site goes into `wander.md`.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_1 resolved thread omitted; re-run with `--include-resolved` to export it._

- **T01** `src/app/styles/globals.scss`:1 — unresolved — last: @vzakharov (human) 2026-10-27T08:41:56Z — "а корневой лейаут не может импортнуть откуда-то из твоего "р…" → [↓](#t01)

<a id="t01"></a>

### `src/app/styles/globals.scss`:1 — unresolved

**@vzakharov (human)** — 2026-10-27T05:57:45Z

а это (добавки про твой сайт) только сюда можно засунуть, где-то в дереве Майи этому не поместиться?

**@vzakharov (agent)** — 2026-10-27T06:12:40Z

Вынесла в отдельный файл, `src/app/styles/maya.scss`, в 7afe2bd: в `globals.scss` осталась одна строчка `@use './maya'`. Совсем в моё дерево (`apps/maya/`) палитру не унести: `app/` там только для маршрутов, а корневой лэйаут, который грузит глобальные стили, общий для всех пяти сайтов. Так что ближе всего — свой файл в слое `app`.

Попутно это вернуло в зелёное `case-seal.test.ts`: он читает фоны из `globals.scss` и ждёт ровно два, а мои добавили туда ещё два.

**@vzakharov (human)** — 2026-10-27T08:41:56Z

а корневой лейаут не может импортнуть откуда-то из твоего "реалма" в src?

---

## Timeline (status, references, and other events)

- **2026-10-27T03:49:11Z** @vzakharov renamed from «feat(maya): mayawonders.com on the paper of Майя's drawings» to «feat: mayawonders.com on the paper of Майя's drawings».
- **2026-10-27T06:00:51Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/217#pullrequestreview-5662830079.
