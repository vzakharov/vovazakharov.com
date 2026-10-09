# PR #115 review round 3 — Vova's review of 2026-10-09 (paused)

Task as asked: Vova, in the session: «оставил код ревью на ветке. как закончишь можно будет браться за изменение слагов, думаю, отсюда уже больших правок не будет, гит поймёт что переехало. Общий принцип, берём английское название или перевод, но если слишком длинно, то сокращаем». And, mid-turn: «так, а ещё у нас на станицах песен нет картинок, пусть будут (от альбома или от самой песни, смотря что есть в наличии)».

The export is `docs/pr/115/pr.md`, committed at the `docs: #115 refresh the PR export` commit before 9da6bce; each `T<NN>` below is its anchor `#t<nn>`, where Vova's words live verbatim.

## Done

- Content threads T02, T04, T06–T10, T12–T17 — 9da6bce, each replied to on GitHub. Ellipsis after first-line titles applied to `tvoya-l-vina` and `s74` only; the reply on T15 promises the rest go with the title vet below.
- `renderDocument` memo keyed on the body too — a dev server kept a song's first render after its file changed (Vova saw Ghost of Yesterday's Russian story empty) — 9da6bce.

## Left — in this order

1. **T21 — `src/shared/song` → `src/shared/music-catalogue`.** `git mv`, then every `@/shared/song` import, `index.node-safe.ts` users under `scripts/`, and every prose mention (`.claude/rules/content.md`, `knip.ts`/`steiger`/`eslint` configs if they name it, the PR body). Do it first: every later item touches these imports.
2. **Song images (Vova's mid-turn ask) + T03 + T20.** One picture model in `pages/music/lib`:
   - a song's picture: its own single cover (`single-covers.ts`) else its album's (`albumCover`);
   - an artist's picture, programmatically, «как и эпл музик … из последнего альбома»: the cover of the newest release in `artistReleases` that has one (album or single), falling back to the newest song billing the artist (as a feature too) that has a picture — so за/обложкой keeps `chp`. Then delete `apps/vova/public/music/assets/artists/` and `PICTURED_PROJECTS`/`artistImage`'s file list; report any artist that loses its picture.
   - show the song's picture on the song page (header, beside or above the title — `/preview` it in both themes);
   - T20 «а картинки генерим? и на альбомы, и на песни, и на артистов (где есть)? давай генерить»: pass each picture as `ogImage` to `constructMetadata` in `generateSongMetadata`, `generateAlbumMetadata`, `generateArtistMetadata` (`src/shared/seo/construct-metadata.ts` takes `ogImage` and its size — read the 600×600 off the file the way documents do, `image-dimensions.ts`). Reply on T20 saying they are the covers, not rendered cards, unless he wants cards.
3. **T05 + T11 — title language and the gloss vet.** Vova's rule (T11): `titleLanguage` sits at the top of the frontmatter (beside `title`) whenever a) the title's language differs from the song's, b) the song has several languages, c) the song is instrumental. The vet (T05): a title not in English carries an English `translation`, and a `transliteration` where its script is not Latin; an English title carries a Russian `translation`. A locale with its own string title satisfies it. Write it as a script check (`scripts/check-song-titles.ts`, `pnpm check:song-titles`) reusing `title-gloss.ts`'s script test, also failing on a `titleLanguage` missing in cases b/c and on one equal to the only language sung. Then fill every song it flags (caprice first — T05's own example), and sweep the remaining first-line titles for the ellipsis (T15). Reply on T05 and T11.
4. **T18 + T19 — song checks only when a song changed.** Gate `check:masked-words` and the new `check:song-titles` in `vet.sh` on the branch's diff touching `apps/vova/public/music/*.md` (or the check scripts / the song schema). Factor `merge_base_with_default` and the changed-files read out of `scripts/vet-test.sh` into a sourced `scripts/lib/` helper both use. Masked-words scans every site's Markdown today: narrow it to the music collection, since Vova counts it a song check, and say so in the reply. T19: `check:prose-quotes` and anything else covering the rest of the prose stay ungated. Update `.claude/rules/stack.md`'s list and `vet.sh`'s comment.
5. **Replies** on T03, T05, T11, T18, T19, T20, T21, each with its SHA.
6. **Slugs**, once the above is pushed (Vova: «берём английское название или перевод, но если слишком длинно, то сокращаем»): rename each `apps/vova/public/music/<slug>.md` with `git mv` (history follows), and every reference to the slug — `single-covers.ts` and the cover files, `albums.ts`-adjacent track data, the `songs` reserved slug, notes linking songs, the PR body's QA rows. Propose the full old→new table to Vova before moving if any name is a judgement call; the long ones especially.
7. `/polish`, then `/pr` (refresh the body: song pictures, artist pictures, the vet, the namespace).

## Decisions

- The ellipsis rule (T15) covers a title cut from the first line too: `s74` is «Ты не терзайся…».
- Last Christmas is «Прошлым Рождеством», and its lyrics «Прошлым… / Этим Рождеством» for symmetry.
- Ignite's album gloss follows the song: «Зажигаем».
