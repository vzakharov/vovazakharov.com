# Krylya review round (PR #127)

The author's review of 2026-10-09 (49 threads, exported in `docs/pr/127/pr.md`)
plus his follow-ups in chat, worked planless through subagents. Paused for the
context budget.

## Done (pushed)

- Pause no longer restarts a vendored song (9c1da28).
- All eleven Krylya songs: corrections, stories, English translations,
  descriptions, cribs, footnotes, xN, month dates, unhidden (cf05ea7,
  513fa29, 8df1864, plus chat follow-ups e765613 76c09ea 7500893 cb2b2bb
  d28ef5c); После нас video (ef0a865), the single's video (513fa29).
- Album text `apps/vova/public/music/albums/wings.md` (8df1864) rendered on
  the album page (9ad9103, 4c17d4a); cover + Listen with album queues
  (0f82ab2); stories fold behind «…», `.mp3` download link (f166dd7).
- Month dates in the schema (d66649b); transcription port from
  vzakharov/life (3c857ad); `scripts/song-intake/`, spectrograms,
  `check:stanza-repeats`, songs.md rules (commit after 3c857ad; 3516038).

## Left

1. **Album text is too literal** — the author: «описание альбома слишком
   литерально с моих слов». Rework `albums/wings.md` (both locales) into
   edited prose about the album, keeping his facts and voice, rather than a
   cleaned transcript.
2. **Masked-word exemption**: `pnpm check:masked-words` fails on
   our-punk-rock's `про\*\*ли`, which the recording itself bleeps (the
   author: «здесь забикано и в песне, как творческое решение»). Add an
   explicit at-point-of-use exemption to `scripts/check-masked-words.ts`
   with a test, and change songs.md's "A word is written out" bullet.
3. **`pnpm test` runs only what the branch changed by default** — the
   author: «по дефолту только --changed, и с указанием где-то в правилах
   (потому что "грибы" тестируются полчаса)». Design, already researched:
   `scripts/test-changed.sh` (changed `*.test.ts` plus `<stem>.test.ts` beside
   each changed file, via `scripts/lib/changed-files.sh`; explicit args pass
   through; none → say so, exit 0; no merge base → exit 1 naming
   `test:all`); `"test": "scripts/test-changed.sh"`, `"test:all":
   "scripts/vet-test.sh"`; `vet-test.sh`'s `VET_MEADOW=1` branch must call
   node directly instead of `pnpm test`; a CLI test per
   `.claude/rules/testing.md`; update `stack.md`, `testing.md`, the
   `vet-test.sh` header, and CLAUDE.md § "Testing" line 102 through a staged
   copy.
4. **`pnpm type-overlap` fails** on `scripts/lib/stanza-repeats.ts` (`body`,
   `name`, `offset`) and `scripts/lib/public-markdown.ts`.
5. **`pnpm build:vova` and `/preview`**: a long story folded and opened,
   `/music/after-us`'s `.mp3`, the album page; check the fade, the box's
   bottom spacing, the focus ring after opening. DRY: `songHead`/`songCover`
   are song-named but shared with `catalogue-header.tsx`, whose cover
   `Image` duplicates song-page's.
6. **Answered by the author**: the Здравствуй video arrived as
   `docs/remove-before-merging/Здравствуй 720p.mp4` and is vendored as
   `assets/hello.mp4`; Listen on an album page follows to the song's page
   only when the follow switch is on — «да, если стоит флаг слежения»,
   which is today's behavior (check it in item 5's preview).
7. **Reply on GitHub to every one of the 49 threads** (CLAUDE.md § "GitHub
   comments": one sentence + bare SHA, never resolve), and the
   `writing/notes/the-five-percent.md` entry via a subagent for the comments
   that changed a settled call (e.g. the English stress note, Здравствуй's
   line placement, the album text's literalness).
8. Then `/polish` and `/pr` (`/go` Steps 3–4).
