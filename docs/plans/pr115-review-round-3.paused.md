# PR #115 review round 3 — Vova's review of 2026-10-09 (paused)

Task as asked: Vova, in the session: «оставил код ревью на ветке. как закончишь можно будет браться за изменение слагов, думаю, отсюда уже больших правок не будет, гит поймёт что переехало. Общий принцип, берём английское название или перевод, но если слишком длинно, то сокращаем». And, mid-turn: «так, а ещё у нас на станицах песен нет картинок, пусть будут (от альбома или от самой песни, смотря что есть в наличии)».

The export is `docs/pr/115/pr.md`, committed at the `docs: #115 refresh the PR export` commit before 9da6bce; each `T<NN>` below is its anchor `#t<nn>`, where Vova's words live verbatim.

## Done

- Content threads T02, T04, T06–T10, T12–T17 — 9da6bce, each replied to on GitHub. Ellipsis after first-line titles applied to `tvoya-l-vina` and `s74` only; the reply on T15 promises the rest go with the title vet below.
- `renderDocument` memo keyed on the body too — a dev server kept a song's first render after its file changed (Vova saw Ghost of Yesterday's Russian story empty) — 9da6bce.
- T21: `src/shared/song` → `src/shared/music-catalogue`, imports and rule prose (the staged `fsd.md` copy included) — be3e156, replied.
- Song pictures + T03 + T20 — 50ae97a, T03 and T20 replied. `src/pages/music/lib/pictures.ts` holds `songPicture` (own cover in `SONG_COVERS`, else the album's), `releasePicture`, `artistPicture` (newest release with a cover, else newest billing song with one) and `pictureCard` (the `ogImage`/`ogImageSize` pair for `constructMetadata`). `single-covers.ts` and `assets/artists/` are gone; the old Trending Today picture was Ok Loser's single cover, now `covers/ok-loser.jpg`. The song page shows the cover beside the title from `sm` up, above it on a phone (`.songHead`/`.songCover` in `music.module.scss`) — previewed in both themes and at 500px.

## Left — in this order

3. **T05 + T11 — title language and the gloss vet.** Vova's rule (T11): `titleLanguage` sits at the top of the frontmatter (beside `title`) whenever a) the title's language differs from the song's, b) the song has several languages, c) the song is instrumental. The vet (T05): a title not in English carries an English `translation`, and a `transliteration` where its script is not Latin; an English title carries a Russian `translation`. A locale with its own string title satisfies it. Write it as a script check (`scripts/check-song-titles.ts`, `pnpm check:song-titles`), also failing on a `titleLanguage` missing in cases b/c, on one equal to the only language sung, and on one not right under `title`. Then fill every song it flags (caprice first — T05's own example), and sweep the remaining first-line titles for the ellipsis (T15). Reply on T05 and T11.
   - Shape worked out before the pause: run under bare `node` like `check-masked-words.ts`, reading `apps/vova/public/music/*.md` (top level only) relative to `process.cwd()`, frontmatter via `gray-matter` parsed with a small zod schema of just `title`, `titleLanguage`, `language` (string or list), `en.title`, `ru.title` — not the song schema, which is `server-only`. Key order from the parsed object's keys gives the "right under `title`" test. The effective title language is `titleLanguage ?? language[0]` (none for instrumental, which case c already flags).
   - Case a) is partly mechanical: a title with no letter of its language's script (`ru`/`tt` Cyrillic, `ar` Arabic, `el` Greek, `zh` Han, the rest Latin) wants a `titleLanguage`. Flag it.
   - The Latin test is `title-gloss.ts`'s `LATIN`; it imports only types, so exporting a small predicate from it and importing `../src/pages/music/lib/title-gloss.ts` works under bare Node (`scripts/lib/public-markdown.ts` reaches a `src/` leaf the same way).
   - End-to-end test beside it, as `check-masked-words.test.ts` does: fixtures in a temp tree, assert exit code and report.
   - Today only `in-the-end.md` (`en`) and `agios-o-skopos.md` (`el`) carry `titleLanguage`.
4. **T18 + T19 — song checks only when a song changed.** Gate `check:masked-words` and the new `check:song-titles` in `vet.sh` on the branch's diff touching `apps/vova/public/music/*.md` (or the check scripts / the song schema). Factor `merge_base_with_default` and the changed-files read out of `scripts/vet-test.sh` into a sourced `scripts/lib/` helper both use. Masked-words scans every site's Markdown today: narrow it to the music collection, since Vova counts it a song check, and say so in the reply. T19: `check:prose-quotes` and anything else covering the rest of the prose stay ungated. Update `.claude/rules/stack.md`'s list and `vet.sh`'s comment.
5. **Replies** on T05, T11, T18, T19, each with its SHA.
6. **Slugs**, once the above is pushed (Vova: «берём английское название или перевод, но если слишком длинно, то сокращаем»): rename each `apps/vova/public/music/<slug>.md` with `git mv` (history follows), and every reference to the slug — `SONG_COVERS` in `pictures.ts` and the cover files, `albums.ts`-adjacent track data, the `songs` reserved slug, notes linking songs, the PR body's QA rows. Propose the full old→new table to Vova before moving if any name is a judgement call; the long ones especially.
7. `/polish`, then `/pr` (refresh the body: song pictures, artist pictures, the vet, the namespace).

## Decisions

- The ellipsis rule (T15) covers a title cut from the first line too: `s74` is «Ты не терзайся…».
- Last Christmas is «Прошлым Рождеством», and its lyrics «Прошлым… / Этим Рождеством» for symmetry.
- Ignite's album gloss follows the song: «Зажигаем».
