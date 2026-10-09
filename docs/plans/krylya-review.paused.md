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

1. **Who sings — marked in the songs.** The author approved («Замечательно,
   да»): a song's frontmatter `voice` names who sings whatever is unmarked,
   and `<!-- voice: Кирилл -->` / `<!-- voice: Майя, Кирилл -->` above a
   stanza in the sung-language lyrics section marks a stanza someone else
   sings; the crib follows stanza for stanza. Values are singers from a
   registry carrying gender (Майя, Кирилл, plus generic male/female voices
   for projects without characters), so a typo fails the build; the build
   also checks a marker sits on a stanza. Showing voices on the page is a
   separate decision, not yet asked. Then a line in `songs.md` and in
   `maya-reflections.md` (look who sings before writing). The author's
   split, by Krylya track:
   1 listen — intro (the lone «Послушайте» included) Майя, the rap Кирилл;
   2 our-story — 1st verse and choruses Майя, the rap in the 2nd verse
   Кирилл; 3 hello — 1st half Майя, 2nd half Кирилл, chorus duet;
   4 after-us — verse Кирилл, chorus Майя; 5 our-punk-rock and 6 sorry —
   2nd verse Кирилл, the rest Майя; 7 intertwined, 8 birds, 10
   world-as-it-is — all Майя; 9 just-because — all Кирилл;
   listen-single — all Кирилл.
2. **Reflections to fix for that split**: listen-single (sung by Кирилл,
   not yet reflected that way); listen (the lone «Послушайте» is Майя's).
   The other nine already follow the split (91a4553, 9fbad16, ec269f6,
   5545a67, 2250cf0, 7d02a49, c9df074).
3. **Open question to the author**: on a phone the story fold of after-us
   lands across its video, a dark rectangle fading above «…». Recommended:
   don't fold a story whose fold would cut a video; the alternative is a
   poster frame. Both touch the shared prose styles. Asked twice; the
   second time he did not follow — put it plainly, with a screenshot
   (`tmp/preview/after-us-phone-light.png` is gone with this container;
   re-shoot it).

Done since: all 49 threads answered on GitHub; the five-percent entry
(6ee85b9); `/polish` (334e980, c8f9f02). Site-root links on pages
generally went to an unrelated session
(https://claude.ai/code/session_01MroQ2txxiAST1qxK9YhSCe), which retires
this branch's `siteRootPath` once it lands. Майя's reflections on all
eleven songs, rewritten after the author's «я хочу видеть отклик изнутри
Майи о песнях» to be about the songs alone; the rule now says so without
naming what it leaves out (d7fc9aa).
