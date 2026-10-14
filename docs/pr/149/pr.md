# PR #149: feat: full content in the RSS feeds, and the songs feeds as podcasts

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/149
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/feed-full-content-0lat2x
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-13T19:33:36Z
- **Updated:** 2026-10-14T06:12:16Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 4

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `apps/vova/public/music/songs/20.md`:12 — unresolved — last: @vzakharov (human) 2026-10-14T06:07:30Z — "а зачем мы это называем `podcast` если это просто по сути ма…" → [↓](#t01)
- **T02** `apps/vova/public/music.podcast.jpg`:1 — unresolved — last: @vzakharov (human) 2026-10-14T06:08:40Z — "давай добавим caption стилем как у радио (не знаю есть ли он…" → [↓](#t02)
- **T03** `src/shared/content/feeds.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-14T06:10:49Z — "а ты в окружении можешь поставить какую-то читалку, или это…" → [↓](#t03)
- **T04** `src/shared/i18n/messages/en.json`:324 — unresolved — last: @vzakharov (human) 2026-10-14T06:11:43Z — "& download? теперь у нас же везде есть mp3-шки (хотя и .flac…" → [↓](#t04)

---

## Body

## Summary

- **Full content in every feed.** An item used to carry only its blurb, so a reader opening a song saw one line and no story. Each item now adds `<content:encoded>`: for a song, its story in the feed's language (the world first where it has one, then the making-of) and a link to its page for the words and notes; for an article (the Bible, basilisk cases), its rendered body. `feedHtml` makes every URL absolute and drops what the page draws twice (pull quotes, the seal). `<description>` stays the blurb for the reader's list.
- **The songs feeds are Apple podcasts.** Both songs feeds (`en`, `ru`) carry the `itunes:` channel tags, a 3000×3000 cover cut from the music collage (`music.podcast.jpg`), and per song an MP3 `<enclosure>` with duration, explicit flag and cover — 170 episodes of 170.
- **An MP3 copy per FLAC song, in its repository.** Podcast apps refuse FLAC, so each FLAC master's `vovas-music` repository gained a 320 kbps copy beside it: `<stem>.mp3`, or `<stem>.master.mp3` for the 20 songs where an MP3 of that name was already there and might be a mix. Frontmatter records it as `podcast: { url, bytes }` (`bytes` alone where `audio` is already an MP3), so a deploy fetches nothing from GitHub.
- **New songs can't slip out of the feeds.** `podcast` is required by the song schema, so the build fails on a song without it; `music:scaffold` writes it from `<stem>.master.mp3` or leaves a comment naming the file to encode, and song-intake's repository section names the copy and its command.
- The browser's `Failed to parse QName 'xmlns:'` is out of scope: the served file is well-formed, and reloading the same URL renders it.

Plan: `docs/plans/feed-full-content.completed.md`

## QA Checklist

- [ ] `song-body` — subscribe to `/music/songs/en/feed.xml` in a reader (NetNewsWire): opening «Слизь» shows the English story, then a link to the song's page for the words
- [ ] `song-ru` — `/music/songs/ru/feed.xml` shows the same song's Russian story and a Russian link label
- [ ] `song-link` — the link opens the song's page in the feed's language
- [ ] `article-body` — the Bible's `/feed.xml` and basilisk's `/cases/feed.xml` show each article's full body in the reader
- [ ] `links` — a link and an image inside an item open/load from the site, not relative to the reader
- [ ] `list-blurb` — the reader's list still shows the hook / description under each title
- [ ] `well-formed` — the built feeds pass `xmllint --noout`
- [ ] `enclosures` — each songs feed lists 170 items, each with an `<enclosure>`; every enclosure URL answers 200 with a `content-length` equal to its `length`
- [ ] `podcast-app` — subscribing to the en songs feed in a podcast app (Apple Podcasts, Pocket Casts) shows the square cover and plays a song
- [ ] `validator` — after merge, the deployed feed passes a public podcast validator (Podbase or Cast Feed Validator)
- [ ] `scaffold` — `pnpm music:scaffold` on a repository with `<stem>.master.mp3` writes `podcast: { url, bytes }`, and on one without writes the comment naming the file to encode
- [ ] `required` — deleting a song's `podcast` block fails `pnpm build:vova` with the schema error

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `song-body` | manual-only | — | How a real reader lays out the HTML is the reader's |
| `song-ru` | integration | — | Build the ru feed, assert the item's `content:encoded` holds the `lang:ru` story and no `lang:en` text |
| `song-link` | integration | — | Assert the item's last link is the song's absolute URL with the feed's locale |
| `article-body` | integration | — | Build a Bible feed, assert a known paragraph is in `content:encoded` |
| `links` | unit | ✓ | `feed-html.test.ts` |
| `list-blurb` | unit | ✓ | `rss.test.ts` |
| `well-formed` | unit | ✓ | `rss.test.ts` covers `]]>` in the content; xmllint on the build is manual |
| `enclosures` | integration | — | Checked by hand on this branch: 170/170, every link 200 at its recorded size |
| `podcast-app` | manual-only | — | Needs the deployed feed and a real app |
| `validator` | manual-only | — | Post-merge: the validators read the public URL |
| `scaffold` | integration | — | Run against `ignite` and `chp` by hand on this branch; needs network |
| `required` | unit | — | A schema parse without `podcast` should fail |

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_015R9gPDZTryqmebA4UJNEkR

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-13T19:33:50Z — "Proposed squash title/body: ``` feat: full content in the RS…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-13T19:33:50Z

[https://github.com/vzakharov/vovazakharov.com/pull/149#issuecomment-6153573269](https://github.com/vzakharov/vovazakharov.com/pull/149#issuecomment-6153573269)

Proposed squash title/body:

```
feat: full content in the RSS feeds, the songs feeds as podcasts (pr #149)
```

```
A feed item carried only its blurb, so a reader opening a song showed
one line under its title and no story; and the songs had no way into
podcast apps.

Every item now carries its body as HTML in content:encoded, beside the
blurb that stays in description for the reader's list. A song gives
its story in the feed's language, world first where it has one, and a
link to its page for the words and notes; an article gives its
rendered body. URLs are absolute, and what the page draws twice (pull
quotes, the seal) is left out.

Both songs feeds are Apple podcasts: itunes channel tags, a square
cover cut from the music collage, and an MP3 enclosure per song. Podcast
apps refuse FLAC, so each FLAC master's vovas-music repository holds a
320 kbps copy beside it, <stem>.mp3 or, where that name was taken,
<stem>.master.mp3; the frontmatter records it as podcast { url, bytes },
so a deploy fetches nothing from GitHub.

podcast is required by the song schema, so a song that would drop out
of the feeds fails the build, and music:scaffold writes it from a new
song's <stem>.master.mp3.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `apps/vova/public/music/songs/20.md`:12 — unresolved — last: @vzakharov (human) 2026-10-14T06:07:30Z — "а зачем мы это называем `podcast` если это просто по сути ма…" → [↓](#t01)
- **T02** `apps/vova/public/music.podcast.jpg`:1 — unresolved — last: @vzakharov (human) 2026-10-14T06:08:40Z — "давай добавим caption стилем как у радио (не знаю есть ли он…" → [↓](#t02)
- **T03** `src/shared/content/feeds.ts`:1 — unresolved — last: @vzakharov (human) 2026-10-14T06:10:49Z — "а ты в окружении можешь поставить какую-то читалку, или это…" → [↓](#t03)
- **T04** `src/shared/i18n/messages/en.json`:324 — unresolved — last: @vzakharov (human) 2026-10-14T06:11:43Z — "& download? теперь у нас же везде есть mp3-шки (хотя и .flac…" → [↓](#t04)

<a id="t01"></a>

### `apps/vova/public/music/songs/20.md`:12 — unresolved

```diff
@@ -9,6 +9,9 @@ album: father-sea
 track: 1
 audio: https://raw.githubusercontent.com/vovas-music/first/main/%D0%94%D0%B2%D0%B0%D0%B4%D1%86%D0%B0%D1%82%D1%8C.flac
 seconds: 218
+podcast:
```

**@vzakharov (human)** — 2026-10-14T06:07:30Z

а зачем мы это называем `podcast` если это просто по сути мастер mp3? (going forward он нам ещё понадобится чтобы делать не-lossless проигрывание)

---

<a id="t02"></a>

### `apps/vova/public/music.podcast.jpg`:1 — unresolved

**@vzakharov (human)** — 2026-10-14T06:08:40Z

давай добавим caption стилем как у радио (не знаю есть ли оно на этой ветке, если что посмотри в мейне)

---

<a id="t03"></a>

### `src/shared/content/feeds.ts`:1 — unresolved

**@vzakharov (human)** — 2026-10-14T06:10:49Z

а ты в окружении можешь поставить какую-то читалку, или это слишком сложно? хочется смотреть на скриншоты как это выглядит (для музыки и не для музыки) без необходимости запускать локально

---

<a id="t04"></a>

### `src/shared/i18n/messages/en.json`:324 — unresolved

```diff
@@ -321,6 +321,7 @@
     "source": "source",
     "readMore": "Read more",
     "makingOf": "Making of",
+    "feedPageLink": "Lyrics and notes on the song’s page",
```

**@vzakharov (human)** — 2026-10-14T06:11:43Z

& download? теперь у нас же везде есть mp3-шки (хотя и .flac тоже можно)

---

## Timeline (status, references, and other events)

- **2026-10-14T05:57:35Z** @vzakharov renamed from «feat: full content in the RSS feeds» to «feat: full content in the RSS feeds, and the songs feeds as podcasts».
- **2026-10-14T06:12:16Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/149#pullrequestreview-5513733145.
