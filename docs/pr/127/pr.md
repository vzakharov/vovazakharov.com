# PR #127: feat(vova): the Krylya album and the Znaki prepinaniya single

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/127
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/krylya-album-2z13o2
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-09T14:50:17Z
- **Updated:** 2026-10-09T19:27:39Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 7090ea8). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `apps/vova/public/music/after-us.md`:7 — unresolved — last: @vzakharov (human) 2026-10-09T19:25:08Z — "нет, давай мы фронтматтер дальше услажнять не будем, а помет…" → [↓](#t01)

---

## Body

## Summary

- **The lost album «Крылья» and the maxi-single «Знаки препинания» (за/обложкой) are published** — every song unhidden, with the author's corrected words, his stories, English cribs and footnotes, `xN` repeats and month-only dates. Eleven masters are vendored under `music/assets/`, since no `vovas-music` repository holds them; Наша история and Мир, какой он есть sit on the album and appear on the single through `alsoOn`.
- **Pages:** После нас, Послушайте (single) and Здравствуй play their videos. The album page shows its cover, a Listen button that plays the album, and the album's own text as edited prose. Long stories fold behind «…», and a vendored master downloads as `.mp3`.
- **Майя's reflections** on all eleven songs sit beside them as `<slug>.reflections.md` companions, about the songs themselves; the rule for writing them is `.claude/rules/maya-reflections.md`.
- **Tooling the review produced:** `scripts/song-intake/` (mastering, spectra, spectrograms as Майя's stand-in for listening), `pnpm check:stanza-repeats` (eleven catalogue songs fixed by it), `transcribe.py` ported from vzakharov/life with unsure words marked in place, a masked word the recording itself carries stays, named in `masked` frontmatter. `pnpm test` now runs only the tests the branch changed, and `pnpm test:all` the whole suite. A video embedded from a link plays from its site-root path rather than production.
- **One question is open for the author** (`docs/plans/krylya-review.paused.md`): on a phone, the story fold on После нас lands across its video — a dark rectangle fading above «…». Recommended: don't fold a story whose fold would cut a video; the alternative is a poster frame. Both touch the shared prose styles.

## QA Checklist

- [ ] `album-page` — `pnpm dev:vova`, open `/music/all/albums/wings/ru`: the cover, a Listen button that plays the album from track 1, ten tracks, and the album's text below.
- [ ] `single-page` — `/music/all/albums/punctuation-marks/en`: Послушайте (Single Version), Наша история and Мир, какой он есть as tracks 1–3.
- [ ] `videos` — `/music/after-us/ru`, `/music/listen-single/ru`, `/music/hello/ru`: each video plays.
- [ ] `story-fold` — a song with a long story (`/music/after-us/ru`): the story folds behind «…», opens on click with a focus ring; on a phone-width window, note where the fold lands relative to the video (the open question).
- [ ] `mp3-download` — on a Krylya song page, the download link saves an `.mp3`.
- [ ] `playback` — play, pause and resume a Krylya song: pause holds the position rather than restarting.
- [ ] `published` — the Krylya songs appear in the catalogue's song list, each with its description, crib and footnotes.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `album-page` | partly | `pnpm build` renders it | checked in a `/preview` screenshot |
| `single-page` | partly | `pnpm build` renders it | — |
| `videos` | no | — | needs a browser playing media |
| `story-fold` | partly | — | the phone layout is the open question |
| `mp3-download` | partly | `pnpm build` renders the link | — |
| `playback` | no | — | player behavior |
| `published` | yes | the song schema fails the build on missing fields | — |

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01WPzfFZKEZAsJDFxNTMM1c1

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-09T14:50:43Z — "Proposed squash title/body: ``` feat(vova): the Krylya album…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-09T14:50:43Z

[https://github.com/vzakharov/vovazakharov.com/pull/127#issuecomment-6083319484](https://github.com/vzakharov/vovazakharov.com/pull/127#issuecomment-6083319484)

Proposed squash title/body:

```
feat(vova): the Krylya album and the Znaki prepinaniya single (pr #127)
```

```
За/обложкой's first album, «Крылья», survived only as one unmastered
file with no lyrics, and its maxi-single «Знаки препинания» as three
tracks. Both are now published in the music catalogue: eleven songs
mastered against letim at half strength and vendored under
music/assets/, each with the author's corrected words, his story, an
English crib and footnotes, and Майя's reflection beside it.

После нас, the single's Послушайте and Здравствуй play their videos.
The album page shows its cover, plays the album from Listen and
carries the album's own text; long stories fold behind «…», and a
vendored master downloads as .mp3.

The review left tooling behind: scripts/song-intake/ for mastering,
spectra and spectrograms; check:stanza-repeats, which also fixed
eleven older songs; transcribe.py ported from vzakharov/life, marking
unsure words in place; and a masked word the recording itself carries
stays, named in the song's frontmatter. pnpm test runs only the tests
a branch changed, test:all the whole suite, and a video embedded from
a link plays from its site-root path.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_49 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `apps/vova/public/music/after-us.md`:7 — unresolved — last: @vzakharov (human) 2026-10-09T19:25:08Z — "нет, давай мы фронтматтер дальше услажнять не будем, а помет…" → [↓](#t01)

<a id="t01"></a>

### `apps/vova/public/music/after-us.md`:7 — unresolved

```diff
@@ -4,6 +4,7 @@ date: 2023-12
 status: done
 language: ru
 project: ['за/обложкой']
+voice: Кирилл
```

**@vzakharov (human)** — 2026-10-09T19:25:08Z

нет, давай мы фронтматтер дальше услажнять не будем, а пометки про voice по ходу текста останутся просто for reference, без какого-то контроля типов или типа того. По сути сейчас они нужны только для reflections -- и не всегда это будут какие-то конкретные персоны, во многих песнях будет просто male/female/duet/etc. может собственно даже и не про голос быть, а пометки типа "соло", "интро" и так далее (пока таких нет)

---

## Timeline (status, references, and other events)

- **2026-10-09T17:34:41Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/127#pullrequestreview-5472940932.
- **2026-10-09T18:56:43Z** @vzakharov renamed from «feat(vova): the Krylya album and the Znaki prepinaniya single, hidden» to «feat(vova): the Krylya album and the Znaki prepinaniya single».
- **2026-10-09T19:27:39Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/127#pullrequestreview-5474451125.
