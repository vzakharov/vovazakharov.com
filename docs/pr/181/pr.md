# PR #181: feat(vova): the Nostalgia album

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/181
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/nostalgia-album-0ar5hp
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-21T07:34:43Z
- **Updated:** 2026-10-22T05:47:10Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 4

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 1082252). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `apps/vova/public/music/albums/nostalgia.md`:44 — unresolved — last: @vzakharov (human) 2026-10-22T05:41:39Z — "1- has gone -- has gone давай уберём повтор 2- by his старею…" → [↓](#t01)
- **T02** `apps/vova/public/music/artists/poluzhivye.md`:16 — unresolved — last: @vzakharov (human) 2026-10-22T05:42:37Z — "blindfolded -- "the eyes are a mirror of a soul," and whethe…" → [↓](#t02)
- **T03** `apps/vova/public/music/songs/actor.md`:42 — unresolved — last: @vzakharov (human) 2026-10-22T05:44:49Z — "добавить куда-то along the lines of: it was my sister Sasha'…" → [↓](#t03)
- **T04** `apps/vova/public/music/songs/invitation.md`:45 — unresolved — last: @vzakharov (human) 2026-10-22T05:46:04Z — "здесь нужна ссылка, иначе непонятно, о чём речь. Возможно --…" → [↓](#t04)

---

## Body

## Summary

- Adds «Ностальгия», the Полуживые album on Arseny Tarkovsky's poems that was taken down from every platform: `albums/nostalgia.md` with its cover and its story, Vova's own text with a still from the film it is drawn after, and seven song pages (`invitation` running into `summer-gone`, `butterfly-rock`, `actor`, `insomnia`, `candle-tarkovsky`, `winter-in-the-forest`). Each page has the lyrics as sung with an English crib, a history of the poem drawn from sources, and the song's story. «Актёр»'s history places it among the 1958 poems about the love Tarkovsky met in Ashgabat, after Marina Tarkovskaya; «Приглашение»'s «бабочка милого праха» carries a footnote linking to «Бабочка в госпитальном саду», and its last-line footnote says the fuller text is what the printed editions carry. Arseny Tarkovsky joins `people.ts`.
- Dad's «Свеча горела» (Pasternak) rides along as Папа-море's track 9, `candle-burnt`, its story first and the poem's history after. A song resting on someone else's text tells that source's story under `<!-- source:<locale> -->`. A prelude now shows where its markdown puts it: told after the `lang:` story it follows it, on the page and in the feed, under a heading naming its kind (`music.preludeHeadings`: «О первоисточнике», «В мире альбома»); told ahead it leads and the story goes behind the scenes. `storyOrder` in `sections.ts` is the one place both read the order from.
- None of the tracks had a real master. Each was mastered three ways against references from the Ozone-mastered catalogue, and Vova picked one per track blind, on an unlinked page, `/music/mastering-blind-test`, that switches between the mix and masters A/B/C without stopping playback. The page and `scripts/song-intake/blind-abc.py` (sealed keys, loudness-matched splits) stay for the next song's test. `master.py` writes a 24-bit FLAC when the output is `.flac`. `pnpm music:masters` gains `rename` and `serve-main`, which moves a repository's default branch to `main`, the branch every URL the site builds names.
- Every song with a story now has a hook, 28 of them plus the album's, a dozen of them written or trimmed by Vova in review; a hook keeps quotation marks only where it quotes someone's words, across the catalogue. `.claude/rules/songs.md` states that, and makes the hook and a source's history the agent's to write. `docs/music/vovas-music-map.md` places every one of `vovas-music`'s 250 repositories that is not a catalogued song's own, and Whisper and Deepgram transcripts of every vocal stem are in `docs/music/transcripts/`.

The plan is `docs/plans/nostalgia-album.paused.md`; its working files (lyrics drafts, blind files and keys, poem research) sit in `docs/remove-before-merging/` and are swept at `/finalize`.

## QA Checklist

- [ ] `album-page` — `/music/albums/nostalgia` shows the cover, the album story with the film still and a working Папа-река link, and the seven tracks in order, with Приглашение running into Лето прошло
- [ ] `song-pages` — each of the eight new song pages plays its master and shows the Russian lyrics beside the English crib, with the poem's history and the story
- [ ] `prelude-order` — the Nostalgia songs show the poem's history first and the story under «За кадром»; `/music/songs/candle-burnt` shows its story first and the history under «О первоисточнике» (`/en`: "About the source"); the podcast feed's item for each follows the same order
- [ ] `footnotes` — Бабочка's «из Китая» and Приглашение's butterfly and last-line notes open in both columns, the butterfly note's link reaching Бабочка
- [ ] `hooks` — the music index shows a hook under every song that has a story, and a hook wears quotation marks only where it quotes someone (`20`, `candle-burnt`)
- [ ] `downloads` — each new song downloads named and tagged «Полуживые - <title>» (`candle-burnt` under Папа-море)
- [ ] `blind-test` — `/music/mastering-blind-test` switches mix/A/B/C mid-play, keeps verdicts across a reload, and is absent from the sitemap and links
- [ ] `blind-abc` — `blind-abc.py reveal` on a committed key and nonce reproduces the seal in `references.md`
- [ ] `serve-main` — `pnpm music:masters serve-main` on a repository whose default branch is `master` leaves it on `main`

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `album-page` | e2e | ❌ | `pnpm build:vova` renders it; correctness by `/preview` |
| `song-pages` | e2e | ❌ | Same; `scripts/vet-songs.sh` checks the frontmatter |
| `prelude-order` | unit | ✅ | `sections.test.ts` — `localePrelude`'s `follows` and `storyOrder`'s order and headings; the rendered page by `/preview` |
| `footnotes` | e2e | ❌ | A look on the preview |
| `hooks` | e2e | ❌ | A look on the index |
| `downloads` | integration | ✅ | `pnpm music:masters check` in vet |
| `blind-test` | e2e | ❌ | Played headless on the preview |
| `blind-abc` | unit | ❌ | The seal/reveal pair is pure and testable |
| `serve-main` | integration | ❌ | Ran against the three `master` repositories |

https://claude.ai/code/session_015WrX7f6ya7r4PGQSN9kFKL

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-21T07:34:57Z — "Proposed squash body: ``` «Ностальгия», the Полуживые album…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-21T07:34:57Z

[https://github.com/vzakharov/vovazakharov.com/pull/181#issuecomment-6310647347](https://github.com/vzakharov/vovazakharov.com/pull/181#issuecomment-6310647347)

Proposed squash body:

```
«Ностальгия», the Полуживые album on Arseny Tarkovsky's poems, was
taken down from every platform but survived whole in vovas-music. Its
seven tracks join the catalogue under one album page, its story in
Vova's own words, with the lyrics as sung beside English cribs and a
sourced history of each poem beside the song's own story. Dad's
«Свеча горела» rides along into Папа-море as candle-burnt. Each song
keeps the repository its takes were already in, renamed to its slug by
`music:masters rename`; `serve-main` moves a repository still on
`master` to `main`, the branch every URL the site builds names.

A prelude, the history of a source the song rests on (`source:`) or an
album's world (`universe:`), shows where its markdown tells it: ahead
of the story, the story follows behind the scenes; after it, the
prelude follows under a heading naming its kind. storyOrder is the one
place the page and the podcast feed read it from.

None of the takes had a real master. Each track was mastered against
three references from the Ozone-mastered catalogue and picked blind on
an unlinked page, /music/mastering-blind-test, which switches between
the mix and masters A/B/C without stopping playback. blind-abc.py
seals each key before the listening and splits the loudness-matched
audio the page plays; both stay for the next song's test, and
master.py writes a 24-bit FLAC for a .flac output.

Every song with a story now carries a hook, quoted only where it quotes
someone's words, and the songs rule makes the hook, like a source's
history, the agent's to write. docs/music/vovas-music-map.md
places every vovas-music repository that is not a catalogued song's
own: the GarageBand archive, album sessions, uncatalogued songs.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_52 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `apps/vova/public/music/albums/nostalgia.md`:44 — unresolved — last: @vzakharov (human) 2026-10-22T05:41:39Z — "1- has gone -- has gone давай уберём повтор 2- by his старею…" → [↓](#t01)
- **T02** `apps/vova/public/music/artists/poluzhivye.md`:16 — unresolved — last: @vzakharov (human) 2026-10-22T05:42:37Z — "blindfolded -- "the eyes are a mirror of a soul," and whethe…" → [↓](#t02)
- **T03** `apps/vova/public/music/songs/actor.md`:42 — unresolved — last: @vzakharov (human) 2026-10-22T05:44:49Z — "добавить куда-то along the lines of: it was my sister Sasha'…" → [↓](#t03)
- **T04** `apps/vova/public/music/songs/invitation.md`:45 — unresolved — last: @vzakharov (human) 2026-10-22T05:46:04Z — "здесь нужна ссылка, иначе непонятно, о чём речь. Возможно --…" → [↓](#t04)

<a id="t01"></a>

### `apps/vova/public/music/albums/nostalgia.md`:44 — unresolved

```diff
@@ -9,83 +9,38 @@ ru:
… 99 lines elided …
+
+That the title belongs not to the father but to the son started, without my noticing, the very thread between parents and children that later, after Dad’s death, was sewn into [Father River](./father…
+
+Just as “by chance,” the choice of poems for the album and their order added up to a nostalgic story of their own: the packed suitcases and the farewell to childhood in “Invitation to a Journey”; thoughts of what has gone — “as if it had never been” — in “Summer Has Gone”; the carefree “Butterfly,” flown off “to China”; “The Actor,” horrified by his reflection; “Insomnia,” tormenting you as you wait for “creditors,” literal or figurative; “burning out at the feast” in “Candle”; acceptance with a dash of Kolychev’s defiance in “Winter in the Forest.”
```

**@vzakharov (human)** — 2026-10-22T05:41:39Z

1- has gone -- has gone давай уберём повтор
2- by his стареющее reflection (в русском тоже)

---

<a id="t02"></a>

### `apps/vova/public/music/artists/poluzhivye.md`:16 — unresolved

```diff
@@ -10,8 +10,17 @@ The project began as more or less traditional Russian rock set to the poems of
 great poets. Somewhere along the way it also turned to songs set to the poems of
 my dad, who left us too soon. Which, all in all, doesn’t change the idea.
 
+As with za/oblozhkoy, the performers on the covers are blindfolded, right up to
+[Father River](../albums/father-river.md), whose cover is my real dad,
+guaranteed to have a soul. The eyes are the mirror of the soul, and whether AI
+has one, we leave behind the blindfold.
```

**@vzakharov (human)** — 2026-10-22T05:42:37Z

blindfolded -- "the eyes are a mirror of a soul," and whether AI has one we leave concealed -- right up to...

иначе quip про папину душу идёт перед отсылкой к пословице и непонятен

---

<a id="t03"></a>

### `apps/vova/public/music/songs/actor.md`:42 — unresolved

```diff
@@ -21,17 +21,25 @@ ru:
… 23 lines elided …
+
+This was probably the most painstaking selection of “candidates” for a song: the shortlist held 14 versions, which I broke down by their stats, like a character in some RPG. The three finalists left …
+
+Paradoxically, I did _not_ like the version I chose more than the others, but it was, without a doubt, the most distinctive and unexpected — a criterion I later raised to one of the most important. What I didn’t like was mostly the chorus: I wanted something more varied and harmonious there, and the Suno of the day wouldn’t let you try it “another way.” And now I listen and think: of course — what else could possibly have been there?
```

**@vzakharov (human)** — 2026-10-22T05:44:49Z

добавить куда-то along the lines of: it was my sister Sasha's love for the final version -- I showed her the four "finalists" -- that tipped the scales.

---

<a id="t04"></a>

### `apps/vova/public/music/songs/invitation.md`:45 — unresolved

```diff
@@ -24,26 +24,30 @@ ru:
… 24 lines elided …
 
+<!-- lang:ru -->
+
+Забавно: броненосец в брезенте — возможно, тот самый, который был бы на обложке альбома, если бы он стал-таки «Таркосом».
```

**@vzakharov (human)** — 2026-10-22T05:46:04Z

здесь нужна ссылка, иначе непонятно, о чём речь. Возможно -- если механика позволяет -- подсказку а-ля ту что в лирике на "если бы он", с более коротким поясняющим текстом и самой картинкой.

---

## Timeline (status, references, and other events)

- **2026-10-21T15:31:57Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/181#pullrequestreview-5601718535.
- **2026-10-21T16:33:08Z** @vzakharov cross-referenced this pull request from [#186 feat: merge a song's local Whisper hearing into its Deepgram transcript](https://github.com/vzakharov/vovazakharov.com/pull/186).
- **2026-10-21T16:44:51Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/181#pullrequestreview-5602911999.
- **2026-10-22T05:01:56Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/181#pullrequestreview-5609361918.
- **2026-10-22T05:09:40Z** @vzakharov cross-referenced this pull request from [#187 Move the vovas-music/blog posts into a blog on vovazakharov.com](https://github.com/vzakharov/vovazakharov.com/issues/187).
- **2026-10-22T05:47:10Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/181#pullrequestreview-5609734313.
