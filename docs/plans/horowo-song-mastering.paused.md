# «Хорошо» (`horowo`): publish, blind-test its masters, play from a pasted link

Four asks from the opening prompt:

1. Publish the new Грёбаный бал song from `vovas-music/horowo`, slug `horowo` as
   the repository has it — the operator's override of `songs.md`'s
   translate-the-title rule. The words start from the Suno prompt the operator
   attached and are corrected to what the recording actually sings.
2. Compare the operator's own `horowo_master.flac` against three Matchering
   masters, blind.
3. A song link pasted into a messenger should play the song where the messenger
   can.
4. The new song is a single (`album: null`) for now. The reshuffle of Грёбаный
   бал's albums comes later, from the operator, and is out of scope.

## 1. The song

**Repository.** `vovas-music/horowo` holds `horowo_mix.flac`,
`horowo_master.flac`, the Reaper project and its render stats. It still needs
what `song-intake/CLAUDE.md` § "A song's repository" lists, each added with
`pnpm music:masters put horowo`:

- `horowo_master.master.mp3`, the 320k MP3 copy;
- `mastering/` with `master.py`, `spectrum.py` and `requirements.txt`;
- a README naming each file. It records that the operator made the master in
  Reaper, and that a Matchering one replaces it if the blind test picks one (§
  2).

**Words.** The steps:

- Run Demucs `htdemucs` on the master to get a vocal stem.
- Run `transcribe.py` on the stem: Whisper large-v3 with GigaAM-v3 as the second
  opinion, into `docs/music/transcripts/`.
- Reconcile both hearings against the Suno prompt. The prompt gives the words
  and the transcripts give the shape (repeats, dropped or moved lines), the same
  way a published poem is treated.
- The growled verse and the breakdown are the likely gaps, so they get the
  loudness-envelope piecewise pass from § "Lyrics" before anything is asked.

Each line where the recording and the prompt disagree goes to the operator as a
numbered question, with the timecode, what each recogniser heard and an
`<!-- ask N -->` line in the file. The file holds the best reading meanwhile.
Formatting follows `songs.md`:

- Suno's `[…]` directions go.
- «шо» stays, because it is the author's spelling, not a phonetic respelling.
- The drawn-out «Хорошооооо» becomes «Хорошо».
- Stanza repeats are written with `x2`.
- The English crib comes with the words.

**Page.** `pnpm music:scaffold horowo`, then `pnpm music:masters tag horowo`.
The frontmatter:

- `title: Хорошо`
- `project: [Грёбаный бал]`
- `album: null`
- `language: ru`
- `explicit: true` (from «сука»)
- `date: 2026-11-02`, the repository's first commit

The story is the author's alone, so the page publishes without one and without a
hook. Both arrive when he gives the story.

**Reflection and spectrogram.** `spectrogram.py` on the master and its four
stems, committed under `assets/spectrograms/horowo/`, then Майя's
`horowo.maya.reflections.md`, per `personas/maya/reflections.md`.

## 2. The blind test, four masters

**Candidates.** The three references are the catalogue masters closest to
`horowo_mix` by `spectrum.py`, loudness and crest factor. Грёбаный бал's own
masters are checked first, because the song-intake rule prefers the project's
own later masters. `master.py <mix> <ref> <out> --strength 0.5` makes one master
per reference. The operator's `horowo_master` is the fourth.

**`blind-abc.py` takes any number of masters.** It currently hard-codes three
positional arguments (`a b c`). `build` changes to
`build <out> <key> <master>... [--mix]`, and everything downstream already
iterates over `order`. The docstring's "three-way" becomes "N-way".

**Page.** `src/music/pages/blind-test/model/blind-test.ts`:

- `VARIANTS` and `variantUrls` derive from a per-test count, not a fixed
  `['mix','1','2','3']`. A test then states how many masters it plays, and the
  player renders that many buttons.
- `NOSTALGIA` is replaced by `HOROWO`. Its audio comes from this branch's
  `docs/remove-before-merging/horowo/blind/` over raw.githubusercontent, as the
  nostalgia test's audio did.

The candidate tar goes to the `music-sources` release. The commit carries the
order's sha256 and the key, base64-encoded, so a session in another container
can run `reveal`. The operator listens at `/music/mastering-blind-test` on the
preview site and answers "first / second / third / fourth". The winner then
replaces the master in the repository with `put`, `tag` is re-run, and `seconds`
is updated if the length changed.

## 3. Playing from a pasted link

Each messenger plays different things, and that decides what is worth building:

- **iMessage** has honoured `og:audio` since iOS 13 and shows a play button on
  the card.
- **Telegram** reads `og:type` and reports a page of type `music.song` as an
  audio preview. It embeds a player inline only for a server-side allowlist of
  domains, and its Instant View templates, the other route to an inline
  `<audio>`, take approval Telegram has not been granting. Only a direct link to
  the file plays inline in Telegram.
- **X and Slack** player cards need an iframe player page and per-domain
  approval. That page is a feature of its own and is not planned here.

Every song page will therefore declare what it is in Open Graph's music
vocabulary, which every consumer reads and iMessage plays:

- `og:type: music.song`
- `og:audio` set to the song's MP3, the raw.githubusercontent URL the feeds
  already use, which serves `content-type: audio/mpeg` with CORS.
  `og:audio:secure_url` and `og:audio:type: audio/mpeg` go with it.
- `music:duration` from `seconds`.
- `music:album` linking the album page, when there is one.
- `music:musician` linking each billed artist's page.

Next's `Metadata.openGraph` types all of these (`type: 'music.song'`, `audio`,
`duration`, `albums`, `musicians`). Blog's `constructMetadata` gains one
optional `song` input that maps onto them, and `generateSongMetadata` passes it.

**What the operator gets in Telegram:** the card is marked as audio but most
likely does not play inline. The song's own `.mp3` link from its page (the
download link) does play inline there. The PR says so plainly rather than
promising a Telegram player.

## Progress

- **Done:** § 3's unfurl tags, in 6ca102d. Kernel's `constructMetadata` takes an
  optional `song` input (`audio`, `seconds`, `albums`, `musicians`), and
  `generateSongMetadata` passes it. These passed `tsc`, eslint and prettier on
  the two files. Nothing was built, because a song with `album: null` has no
  album path yet.
- **Learned:** raw.githubusercontent serves the FLAC and the MP4 rewrap as
  `application/octet-stream` with `nosniff`, and only the MP3 as `audio/mpeg`.
  So `og:audio` is the MP3, and a FLAC cannot stand in for it, because GitHub's
  headers are not ours to set.
- **Left, in order:**
  - § 1, starting from the mix and master downloaded with `music:masters get`.
    The venv and the downloads lived in this container's `tmp/` and have to be
    re-made.
  - § 2 in full.
  - Майя's reflection.
  - The QA unfurl check: build vova and grep `og:audio` in
    `out/music/songs/<slug>.html`.

## DRY notes

- **Unfurl tags.** These are built once, in blog's `constructMetadata` behind an
  optional input, and not as a second metadata builder for songs. `og:audio`'s
  URL comes from the same derivation the feeds and downloads use
  (`song-files.ts`), not from a new URL shape.
- **Blind test.** The existing `blind-abc.py` is generalised and no four-way
  copy is made. Its `matched`, `encode` and `split` already loop over `order`.
  The page's variant list derives from the count, so a five-way test later costs
  nothing.
- **Song intake.** Everything runs through the existing scripts (`master.py`,
  `transcribe.py`, `spectrogram.py`, `music:masters`, `music:scaffold`). No new
  script is written.

## Questions (each has a default the plan already uses)

1. The title: **a) «Хорошо» (default)**, b) «Хорошо!», or c) _Horowo_ as the
   stylised name, with «Хорошо» as the Russian name.
2. The billing and credits: **a) Грёбаный бал alone, words and music yours
   (default)**, or b) someone featured or credited — name them.
3. A story for the page, as a dictation or as text: **a) publish without one and
   add it later (default)**, or b) you send one now.
