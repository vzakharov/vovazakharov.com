# PR #115 review round 3 — Vova's review of 2026-10-09 (paused)

Task as asked: Vova, in the session: «оставил код ревью на ветке. как закончишь можно будет браться за изменение слагов, думаю, отсюда уже больших правок не будет, гит поймёт что переехало. Общий принцип, берём английское название или перевод, но если слишком длинно, то сокращаем». And, mid-turn: «так, а ещё у нас на станицах песен нет картинок, пусть будут (от альбома или от самой песни, смотря что есть в наличии)».

The export is `docs/pr/115/pr.md`, committed at the `docs: #115 refresh the PR export` commit before 9da6bce; each `T<NN>` below is its anchor `#t<nn>`, where Vova's words live verbatim.

## Done

- Content threads T02, T04, T06–T10, T12–T17 — 9da6bce, each replied to on GitHub. Ellipsis after first-line titles applied to `tvoya-l-vina` and `s74` only; the reply on T15 promises the rest go with the title vet below.
- `renderDocument` memo keyed on the body too — a dev server kept a song's first render after its file changed (Vova saw Ghost of Yesterday's Russian story empty) — 9da6bce.
- T21: `src/shared/song` → `src/shared/music-catalogue`, imports and rule prose (the staged `fsd.md` copy included) — be3e156, replied.
- Song pictures + T03 + T20 — 50ae97a, T03 and T20 replied. `src/pages/music/lib/pictures.ts` holds `songPicture` (own cover in `SONG_COVERS`, else the album's), `releasePicture`, `artistPicture` (newest release with a cover, else newest billing song with one) and `pictureCard` (the `ogImage`/`ogImageSize` pair for `constructMetadata`). `single-covers.ts` and `assets/artists/` are gone; the old Trending Today picture was Ok Loser's single cover, now `covers/ok-loser.jpg`. The song page shows the cover beside the title from `sm` up, above it on a phone (`.songHead`/`.songCover` in `music.module.scss`) — previewed in both themes and at 500px.

- Lyoli's story (Vova's words, forwarded in relay 14) — de6227e; feat. Downtemple — e439160.
- T05 + T11: `scripts/check-song-titles.ts` (`pnpm check:song-titles`) and its end-to-end test, every flagged song filled — a2e0e8f. It keeps its own `LATIN` regex rather than importing `title-gloss.ts` from a pages slice for one line. Two exceptions beyond the plan: a title with no letters (`8849`) needs no gloss, and a `titleLanguage` equal to the one language sung is kept when the title is not in that language's script (`Mithqāl`, romanized Arabic). Not yet wired into `vet.sh` — item 4 does that.
- T15 ellipsis sweep — 1fac443; nursery rhymes and whole-line/name titles left alone, the T15 reply asks Vova about them.
- Replies posted on T05, T11 and T15. Guesses put to Vova on T05: Чих-Пых → Sneeze-Puff, Лёли → Leli, Сколько → How Long, Mithqāl → Weight.
- T18 + T19: `scripts/vet-songs.sh` runs both song checks only when the branch touches a song or their inputs; masked-words narrowed to the songs (`songFiles()` in `public-markdown.ts`); the diff read shared through `scripts/lib/changed-files.sh` — 28ec2b0, both replied.
- Grand Finale: a footnote on «From ashes to ashes» naming the burial service and Genesis 3:19, asked in chat — 0ab8644. On Fingers: a footnote on «ни для кого и для всех», Vova's «отсылка к Ницше» (Zarathustra's subtitle) — ddf313f.
- Play-button variants (Vova, in chat: the button looks clumsy beside the cover, a worded one is fine; then «берём вариант с отдельной кнопкой -- не люблю когда кнопки загораживают картинку»): three separate-button layouts, each a patch plus screenshots, in `docs/remove-before-merging/play-variants/` — ddf313f. Overlay variants dropped per Vova. The subagent recommends 1 (a «Слушать»/«Пауза» pill under the title); its patch passed eslint and prettier, tsc and tests unrun. Caveat: the pill widens from Listen to Pause.
- Slug proposal: `docs/remove-before-merging/slugs.md` — dc8ae04, with four questions put to Vova (the ten live songs, the two Every Mondays, the ❓ lines, album slugs).
- Item 5, play button: Vova picked variant 1 (a screenshot of it, «вот этот»); patch applied, tsc and the music tests pass, `play-variants/` deleted. Not re-previewed: the screenshots he picked from are of this patch.
- Crib fixes asked in chat: Fingers «-надцать лет» → "seventeen-odd years on" (Vova: «давай seventeen-odd, это будет правильно») — d6d1c8e; Love's Russian crib in the feminine, «As» → «Пока».

- 5a, Hamlet's Extended Version last (Vova: «extended version должна идти последней») — 3d424af.
- 5b, a page per album placement: `listSongPages()` in `songs.ts`, `songPageSlug`, `songTrack`/`songPicture` taking the release; built and checked (`ophelia-hamlet` shows Hamlet's cover and names it first). `protintro`'s Russian stanzas split to match the English, which had kept `next build` red since 9da6bce.

## Left — in this order

6. **Review of 2026-10-09 09:44** (export `docs/pr/115/pr.md`, threads T01–T30; T03 is already answered). Each item names the thread it answers; reply on every one with the commit.
   - **Titles.**
     - T04, T11, T15: `bezm`, `lebed`, `nazovi` are full titles: drop the `…` from the title and from both glosses.
     - T05: `bronte` is the first line of Brontë's poem "Life", so it gets sentence case with the `…`: `Life, believe, is not a dream…`. The ru side stays as it is.
     - T14: an English first-line title is sentence case, so `mne-nravitsya` becomes `I like it that you are not lovesick for me…`. Sweep every en gloss ending in `…` the same way (`moroz`, `mu-icok-new`, …).
     - T06: `comeback`'s ru translation becomes `Песня-камбэк (Вот вам бэнгер)` — a banger is a great track, not a commercial hit, so his conditional picks «бэнгер». Add his lyrics (thread T06, verbatim, with Suno markers dropped) as `lyrics:en` and a Russian crib with the same stanza count.
     - T07: `erebos`'s ru translation becomes `Эребос`. Put a ru note on its first mention in the ru crib saying the distortion is intentional (in Russian he is Эреб).
     - T08: in `fingers`' en crib, "for no one and for everyone" becomes "for none and for all", the footnote kept.
     - T10: `inverno`'s ru title becomes the gloss `{ translation: 'Зима' }`. T02 and T09 need only a reply: it is instrumental, with `titleLanguage: it`, already right.
     - T01: `chp` en gloss becomes `{ translation: 'Chikh-Pykh' }` and `leli` becomes `{ translation: 'Lyoli' }`. Where the transliteration equals the translation, it is written as the translation only.
     - T12: in `leli`'s en story, “Lyoli is just a masterpiece” becomes “Lyoli [was] just a masterpiece”, verbatim.
     - T13: add a new frontmatter flag `titleTranscribed` (the title is a romanization), which sets the title in italics wherever it shows: the song page h1, `song-list.tsx` (both spots), the artist tile label, and the player bar. Design:
       - `localeText` in `song-text.ts` sets `titleTranscribed: false` where the locale has its own string title.
       - `PlayerTrack` gains a per-locale `titleTranscribed`.
       - The media session title stays plain.
       - `mithqal` gets the flag. `agios-o-skopos`'s title becomes `Ágios o skopós` with the flag; its ru string title «Предназначение» stays, so the ru side shows no italics.
   - **Checks** (`scripts/check-song-titles.ts`):
     - T10: a title not in ru needs a ru `translation`, as one not in en needs an en one. A locale string title still counts.
     - T01: a non-Latin title needs `translation`; `transliteration` becomes optional, since a translation alone may stand for both. Say in the reply that this loosens the check.
     - T06: a non-instrumental song with no `lyrics:<first language>` section fails. Make `songLyrics` in `song-text.ts` throw instead of returning `undefined`. Only `comeback` lacks words today.
     - Update `.claude/rules/content.md` for the italic flag.
   - **Slugs** (T16–T30). Rename each file with `git mv`, plus every reference to it: `SONG_COVERS` in `pictures.ts` and the cover files, track data, notes linking songs, `<slug>-<album>` pages, the PR body's QA rows. Then delete `slugs.md`.
     - The rule (T19): a Russian title is translated to English; any other language keeps its source, transliterated. Re-check `slugs.md`'s non-ru rows against it.
     - The ten live songs move too (T16, «никто это не видел»): `first`→`20`, `june`→`breathe`, `letim`→`lets-fly`, `rak`→`cancer`, `reka-2`→`river-part-two`, `sashas`→`dad`, `wereback`→`we-re-back`. `birdie`, `crossroads` and `slime` stay.
     - Renamed by Vova: `leli`→`lyoli`, `babay`→`minem-babay`, `chp`→`chikh-pykh` (he typed `chik-pykh`; matched to his transliteration "Chikh-Pykh" in T01, so say so), `moroz`→`frost-the-governor`, `mu-icok-new`→`little-peasant` (from «мужичок с ноготок», which he asked for), `poko`→`dead-man` (from «покойник», which he asked for), `s74`→`sonnet-74`, `two-girls-one-fridge`→`2girls1fridge`, `zhadina`→`schadina`.
     - Kept by Vova: `inverno`, `mithqal`, `agios-o-skopos`, `la-scorpionne`, `peta`, `requiem`.
     - Unanswered ❓ rows (`monday`, `monday_doo`) take the proposal.
     - T30: album slugs follow the same rule. They live in `MUSIC_ALBUM_SLUGS` (`shared/music-catalogue/names.ts`), every song's `album`/`alsoOn`, and the cover files.
7. `/polish`, then `/pr` (refresh the body: song pictures, artist pictures, the vet, the namespace).

## Decisions

- The ellipsis rule (T15) covers a title cut from the first line too: `s74` is «Ты не терзайся…».
- Last Christmas is «Прошлым Рождеством», and its lyrics «Прошлым… / Этим Рождеством» for symmetry.
- Ignite's album gloss follows the song: «Зажигаем».
