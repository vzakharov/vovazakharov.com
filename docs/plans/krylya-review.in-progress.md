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

1. **Reply on GitHub to every one of the 49 threads** (CLAUDE.md § "GitHub
   comments": one sentence + bare SHA, never resolve), and the
   `writing/notes/the-five-percent.md` entry via a subagent for the comments
   that changed a settled call.
2. **For the author**: on a phone the story fold of after-us lands across
   its video, a dark rectangle fading above «…» — not folding when a video
   sits inside the fold, or a poster frame, both touch the shared prose
   styles.
3. Then `/polish` and `/pr` (`/go` Steps 3–4).
