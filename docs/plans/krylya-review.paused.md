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

- Resumed after relay 2: album text as edited prose (596d9ec);
  type-overlap (e2b19d5); a mask the recording carries, `masked` in
  frontmatter (88debab); `pnpm test` changed-only, `test:all` the suite
  (cce02bd; CLAUDE.md's line staged, 75b18ba); Здравствуй
  video (3cfd231) — Listen follows to the song only with the follow switch
  on, «да, если стоит флаг слежения», which is today's behavior; preview
  pass: `CoverHead`, the opened story's focus ring (8db815a); a video
  embedded from a link plays from its site-root path, not production
  (ca8663b).

## Left

1. **Open question to the author**: on a phone the story fold of after-us
   lands across its video, a dark rectangle fading above «…». Recommended:
   don't fold a story whose fold would cut a video; the alternative is a
   poster frame. Both touch the shared prose styles.

Done since: all 49 threads answered on GitHub; the five-percent entry
(6ee85b9); `/polish` (334e980, c8f9f02). Site-root links on pages
generally went to an unrelated session
(https://claude.ai/code/session_01MroQ2txxiAST1qxK9YhSCe), which retires
this branch's `siteRootPath` once it lands. Майя's reflections on all
eleven songs, rewritten after the author's «я хочу видеть отклик изнутри
Майи о песнях» to be about the songs alone; the rule now says so without
naming what it leaves out (d7fc9aa).
