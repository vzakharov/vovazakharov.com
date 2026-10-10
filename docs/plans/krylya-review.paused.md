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

- After relay 3: voice markup — `voice` frontmatter, `<!-- voice: … -->`
  stanza markers, `SINGERS` registry with gender, build checks, all eleven
  songs marked (18473a3); rule lines (28cf2ec); listen and listen-single
  reflections follow the split (f6c08de). The author's corrections in chat:
  «баснописца», not «борзописца» (11e80d1); Тёма only called just-because the
  best, the carelessness is the author's word (bc2b22e); «Рофля», not
  «Рокали» (2073fc1); our-punk-rock ends on Майя's growled «бууууудь»
  (de12e07); sorry sings «нам было хорошо» in every chorus, the reflection's
  «там» reading gone (2b0b948); our-punk-rock's «это будет ор / хардкор»,
  not «торт» (0dd4fe3). Item 1's ambiguous readings, taken at stanza level: hello's
  «1st half» = stanza 1 Майя, stanza 2 Кирилл; our-punk-rock's «Йоу, йоу» is
  Кирилл's, with the rap.

- After relay 4, the author's second review: voice notes are free text for
  reference only, no frontmatter field, registry or checks (1e80ee8); After
  Us's blurb in the present tense, Our Story's older-voice note starting at
  «Мороз по коже», «трендс» and «булли» unexplained (7c87b24); the story fold
  after about six lines (5caf7bb). Item 3 answered: «как сейчас нормально,
  единственное, обрезка должна быть намного раньше». За/обложкой's own
  text at `artists/za-oblozhkoy.md`, the album keeping its last paragraph
  (f7ae6e7); spectrograms on a 40 Hz–10 kHz log scale over a waveform
  coloured by the dominant note (feebcac, 6c9797c); a song's `video` opens
  from an outlined «Смотреть видео» beside «Слушать», pausing the song, and
  Space no longer resumes it under the dialog (1d98e65); voice notes as
  Prettier sets them (a536e49). All six threads of the second review
  answered.

- After relay 5: timed `.vtt` captions per video (5b248a8). After relay 6,
  the author's third review: После нас's blurb, the album and за/обложкой
  texts, the single's coda and Майя's added paragraph on it (d7f040c); the
  reflection check in `songs.md` (2c3128b); the waveform coloured by bass
  note below and the note above it (22c0d3d); vet green (3f234208);
  polished; PR body and squash proposal refreshed. All eight threads
  answered.

- After relay 7, the author's fourth round (T08, T09, both answered on
  GitHub): hello's line 3 is «Здравствуй, в тишине вместо слов» (d5915e9);
  a video opened while its song plays starts at the song's position plus
  frontmatter `video.offsetSeconds`, measured by
  `scripts/song-intake/video-offset.py`, and the player yields the media
  session while the video dialog is open — the tab-switch bug, a browser
  play action reaching the song's toggle handler (047f962, 40748fb1);
  transcripts kept in `docs/music/transcripts/` (bc93c64); polished
  (eae89b7). Not verified in a browser: this container's Chromium has no
  H.264 and its headless player never started on a click; the author was
  asked to check in Arc.

## Left

- **Next: `docs/remove-before-merging/chromagram-proposal.md`** — two
  chromagram strips (treble over bass, rows labelled by pitch class, one
  sequential hue) in place of the note-coloured waveform in
  `scripts/song-intake/spectrogram.py`, a plain loudness envelope kept under
  the spectrogram. The author's ask (in chat, «посмотри … предложение
  заменить раскраску волны»); judged sound — rows by position remove the
  adjacent-hue misreadings. Then re-render every spectrogram under
  `apps/vova/public/music/assets/spectrograms/`, update the docstring and
  `scripts/song-intake/CLAUDE.md` § "Reflection", and check Майя's
  reflections for anything read off the waveform's colours.
- The author's answer on where the pre-master mp3s go (T09): a
  `vovas-music` repo (recommended), a release on this repo, or LFS. Until
  then they stay in `docs/remove-before-merging/`.
- PR body and squash proposal: refresh for this round's changes (`/pr`).
- Optional DRY call: `album-page.tsx` and `artist-page.tsx` end on the same
  `ReadMore`/`ProseContent` block; left until a third page wants it.
- `/finalize` (the PR conflicts with `main`).

Items 1–3, as they were asked:

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
   second time he did not follow. Put a third time, plainly, with a fresh
   390px screenshot (the export served from `apps/vova/out`, CDP at 390px);
   waiting on his answer.

Done since: all 49 threads answered on GitHub; the five-percent entry
(6ee85b9); `/polish` (334e980, c8f9f02). Site-root links on pages
generally went to an unrelated session
(https://claude.ai/code/session_01MroQ2txxiAST1qxK9YhSCe), which retires
this branch's `siteRootPath` once it lands. Майя's reflections on all
eleven songs, rewritten after the author's «я хочу видеть отклик изнутри
Майи о песнях» to be about the songs alone; the rule now says so without
naming what it leaves out (d7fc9aa).
