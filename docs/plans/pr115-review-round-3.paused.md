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

- Item 6, titles and checks, all done:
  - The ellipsis and sentence-case sweep, covering T04, T05, T11, T14 and T15, plus `rank`. 21a6781.
  - Comeback's words and crib (T06), with a Fat Mike note Vova asked for in chat; Эребос with its note (T07); Fingers' “for none and for all” (T08); Chikh-Pykh and Lyoli as translation only (T01); “Lyoli [was]” (T12); Inverno's «Зима» (T10). 5c39356 and 25b8b43.
  - The italic flag (T13), the per-locale translation check (T10), transliteration made optional (T01), and `songLyrics` throwing on missing words (T06). a6b3e89. Vova renamed the flag `titleTransliterated` («transliterated наверное? для consistency»); the player's field is `transliterated`, `SongName` in `ui/song-name.tsx` renders it, and `content.md` states it. Mithqāl gained a ru gloss «Вес» and a takbir note in both columns, which Vova asked for in chat.
- Chat asks outside the review: Студентка is credited to Sergey Bakanov for music and words, with the story in Vova's words (verified on Bard-Wiki and a-pesni.org), and its doubled choruses are collapsed to `×2`. 96bac22, 1a03cb4, 0847ca2.

## Left — in this order

6. **Rest of the 2026-10-09 review.**
   - **An open question to Vova** (asked in chat, not yet answered): should Mithqāl's words also be given in Latin transliteration (`ar-Latn`)? The answer put to him: as an aid *beside* the Arabic it is widely accepted, but writing the Quran *instead of* the Arabic is what scholars object to. It would be a new third column, and nothing is built yet.
   - **Replies**: none posted yet for this round. Reply on every thread T01–T30 except T03, in Russian, each with the commit SHA written bare. T02 and T09 need only a note: Inverno is instrumental, `titleLanguage: it`. The T01 reply must say the check was loosened.
   - **Slugs** (T16–T30). Rename each file with `git mv`, plus every reference to it: `SONG_COVERS` in `pictures.ts` and the cover files, track data, notes linking songs, `<slug>-<album>` pages, the PR body's QA rows. Then delete `slugs.md`.
     - The rule (T19): a Russian title is translated to English; any other language keeps its source, transliterated. Re-check `slugs.md`'s non-ru rows against it.
     - The ten live songs move too (T16, «никто это не видел»): `first`→`20`, `june`→`breathe`, `letim`→`lets-fly`, `rak`→`cancer`, `reka-2`→`river-part-two`, `sashas`→`dad`, `wereback`→`we-re-back`. `birdie`, `crossroads` and `slime` stay.
     - Renamed by Vova: `leli`→`lyoli`, `babay`→`minem-babay`, `chp`→`chikh-pykh` (he typed `chik-pykh`; matched to his transliteration "Chikh-Pykh" in T01, so say so), `moroz`→`frost-the-governor`, `mu-icok-new`→`little-peasant` (from «мужичок с ноготок», which he asked for), `poko`→`dead-man` (from «покойник», which he asked for), `s74`→`sonnet-74`, `two-girls-one-fridge`→`2girls1fridge`, `zhadina`→`schadina`.
     - Kept by Vova: `inverno`, `mithqal`, `agios-o-skopos`, `la-scorpionne`, `peta`, `requiem`.
     - Unanswered ❓ rows (`monday`, `monday_doo`) take the proposal.
     - T30: album slugs follow the same rule. They live in `MUSIC_ALBUM_SLUGS` (`shared/music-catalogue/names.ts`), every song's `album`/`alsoOn`, and the cover files.
7. `pnpm type-overlap` fails on `SongPageEntry`/`SongFactsProps` (`album`+`document`, `slug`) and `catalogue`. The failure predates a6b3e89, but it fails `vet`, so fix it with a shared base type before `/finalize`. Then `/polish`, then `/pr` (refresh the body: song pictures, artist pictures, the vet, the namespace).

## Decisions

- The ellipsis rule (T15) covers a title cut from the first line too: `s74` is «Ты не терзайся…».
- Last Christmas is «Прошлым Рождеством», and its lyrics «Прошлым… / Этим Рождеством» for symmetry.
- Ignite's album gloss follows the song: «Зажигаем».
