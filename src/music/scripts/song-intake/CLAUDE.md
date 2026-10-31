# Song intake: splitting, vocals, lyrics, mastering, spectrograms

Working a song before it joins the catalogue: an album that survives as one
file, lyrics that survive nowhere, a mix that was never mastered. Everything
here runs on the session's CPU from a venv the setup script does not provide:

```sh
python3 -m venv tmp/song-intake-venv && tmp/song-intake-venv/bin/pip install -r src/music/scripts/song-intake/requirements.txt
```

Lab output lives under `docs/remove-before-merging/<album>/` — the split songs,
`mastered/`, `lyrics/` — committed so the operator can listen from another
machine, and swept before the merge. The transcripts are the exception, kept in
`docs/music/transcripts/`: a caption track or a disputed line sends a later
session back to what the recognisers heard, and no session can hear it again
without the stems. `transcribe.py` writes into the swept tree unless that
directory is both its `--out-dir` and its `--json-dir`. The source a master was
made from outlives the sweep as an asset of this repo's `music-sources` release
(`gh release download music-sources -p '<name>'`), ASCII-named
`<album>-<NN>-<slug>.<ext>`, the release notes listing what is there:
`gh release upload music-sources <file>` adds one, `--clobber` replaces it. A
song reaches `sites/vova/public/music/songs/` only through
`.claude/rules/songs.md`'s contract, slug rule included.

## Splitting an album file

Cut at the silences between songs, and check the cuts before trusting them:

- `ffmpeg -i album.mp3 -af silencedetect=noise=-45dB:d=0.7 -f null -` lists
  them; each song starts at a `silence_end`, less ~0.2 s so its attack survives.
- The cut lengths must match the release's track list within a couple of
  seconds. A listing counts each song's trailing silence, so a song runs to the
  next one's start.
- Stream-copy (`-c copy`), never re-encode a lossy source, and tag title, album,
  artist and track.

## Vocals

`python -m demucs --two-stems=vocals -n htdemucs --mp3 <songs>`. `htdemucs_ft`
is a bag of four models, four times slower; `htdemucs`'s stems were enough for
Whisper to hear Крылья clean. One process takes every core, so running several
at once buys nothing on one machine.

## Lyrics

<<<<<<< HEAD:scripts/song-intake/CLAUDE.md
`scripts/transcribe.py` on the vocals stem, Whisper large-v3 first — it hears
sung Russian best of everything measured — and GigaAM-v3 as the second opinion,
since the lines the two disagree on are the ones the operator has to listen to:

```sh
tmp/song-intake-venv/bin/python scripts/transcribe.py <slug>.mp3 --language ru \
  --model whisper-large-v3 --vad 0.1 --second-opinion \
  --out-dir docs/music/transcripts --json-dir docs/music/transcripts
=======
`lyrics.py` on the vocals stem is the primary hearing: Whisper large-v3 hears
sung Russian far better than Deepgram's nova-3 (`персонажи Мураками`, where
nova-3 heard `персонажи-муратами`). `src/kernel/scripts/transcribe.py` on the
same stem is the second opinion, since the lines the two disagree on are the
ones the operator has to listen to — so `transcribe.py` merges Whisper's hearing
into its transcript:

```sh
tmp/song-intake-venv/bin/python src/music/scripts/song-intake/lyrics.py <slug>.mp3 \
  --json-dir docs/music/transcripts > docs/music/transcripts/<slug>.whisper.md
python3 src/kernel/scripts/transcribe.py <slug>.mp3 --language ru \
  --out-dir docs/music/transcripts --json-dir docs/music/transcripts \
  --second-opinion-from docs/music/transcripts/<slug>.whisper.json.gz
>>>>>>> origin/main:src/music/scripts/song-intake/CLAUDE.md
```

The older transcripts there merge nova-3 with Whisper (`.deepgram.json.gz`,
`.whisper.md`); `--second-opinion-from` merges a new hearing with one of them.

**A song Whisper returns a line or two for, or fills with `Субтитры …` and
`КОНЕЦ`, is heard in pieces.** Its voice filter can drop sung vocals whole
(`--vad 0` turns it off), and over a long stretch it cannot make out it invents
subtitle credits instead. Cut the stem at its silences and hear each sung
stretch on its own — that recovered Птицы where both whole-file runs failed. A
credit line in any transcript is invented and never reaches the words.

**A stem with bleed has no silences to cut at**: `silencedetect` finds none
where the instruments leak through. A loudness envelope in 2-second windows does
— the sung stretches stand 10 dB or so above the bleed. A stretch that stays
unheard in pieces too (a growl, heavy effects, a whisper) is asked about, never
filled in from the poem.

Neither transcript is the lyrics. The draft reconciles both, keeps the line
breaks the music makes, and marks every line the two disagreed on, because the
agent cannot hear the song and the operator can.

**A setting of a published poem** — `Послушайте` is Mayakovsky, «Ностальгия» is
Tarkovsky — starts from the poem as the operator pastes it, never one the agent
recalls, and is made to read as sung:

- **The transcripts give the shape**: a refrain sung where the poem has it once,
  a line or stanza the song drops, lines moved or added. Where both recognisers
  agree on the shape, the draft takes it; where they disagree or hear nothing,
  it keeps the poem's text and asks.
- **The poem gives the words.** A recogniser's word is a mishearing until both
  agree on it against the poem, and even then it is asked rather than taken.
- **The paste's layout is the website's, not the poem's**: a ladder broken over
  several lines, an indented half-line, a word split at a line end are joined
  into the line the music sings; a source link goes. Spelling follows `songs.md`
  — ё restored, en dashes and hyphens as em dashes.
- **Questions go out numbered**, each with the timecode and what each recogniser
  heard, and an `<!-- ask N -->` line above the stanza in the draft, which the
  page drops. The draft holds the agent's best reading meanwhile, so the answers
  change lines rather than unblock the work.
- **The crib comes with the words**, line for line, per `songs.md` § "Body", its
  footnotes only where a name or idiom means nothing in English.

Drafts live in `docs/remove-before-merging/<album>/lyrics/<slug>.md`, one per
song, until the scaffolded song file takes them.

## Captions

A song's video carries its printed words as timed tracks: `transcribe.py` on the
video itself, then
<<<<<<< HEAD:scripts/song-intake/CLAUDE.md
`captions.py <song.md> <hearing.json.gz> apps/vova/public/music/assets/<slug>`,
=======
`captions.py <song.md> <deepgram.json.gz> sites/vova/public/music/assets/<slug>`,
>>>>>>> origin/main:src/music/scripts/song-intake/CLAUDE.md
a `.vtt` per lyrics column. Its docstring says why the video and not the master,
and where to find the start of a line it reports `unheard`, which `--at` pins.
The pins are in the commit that writes the track.
`video-offset.py <master> <video>` measures the frontmatter's
`video.offsetSeconds`.

## Mastering

`master.py <song> <reference> <out.mp3>` is the whole chain; its docstring says
what each step does. What it encodes, from the operator's ear:

- **The reference is the operator's own later master** from the same project —
  `letim` for за/обложкой — so the result copies a decision they already made
  rather than a taste the agent guessed.
- **Half strength, not a full match.** Matchering's full match sounded too
  bright: it cut 120–250 Hz by ~8 dB and lifted 12–18 kHz by up to 14, where a
  lossy source has only encoder artefacts. `--strength 0.5` and the +3 dB air
  cap are where the operator settled.
- **Each song against the reference on its own**, not the album as one file —
  the operator's call, at the cost of the songs' loudness relative to one
  another.
- **Peaks stay under -1 dBTP in the decoded mp3.** Matchering's limiter stops
  sample peaks only, and LAME adds up to 1.5 dB of intersample overshoot; the
  oversampled limiter's ceiling covers both.
- **Loudness matches the catalogue, not a streaming norm**: the site's player
  does no normalization, so a song plays as loud as its file, beside songs at -9
  to -12 LUFS.

Judge a master by **loudness-matched A/B**: alternate five seconds of each over
the whole song, the louder side brought down to the quieter rather than the
quieter raised, whose peaks would clip — otherwise the ear hears level, not
sound. `spectrum.py` shows what an EQ actually did, which is the place to start
when the operator says "too bright" or "muddy".

**Picking the reference is a blind A/B/C.** The three catalogue masters most
like the song's mix (`spectrum.py`, loudness, crest factor) each master it, and
`blind-abc.py build --mix` alternates the three in that A/B's windows, in one
random order the operator hears as "first, second, third", each round opening on
the unmastered mix. All four are brought down to the quietest — in practice the
mix — because a louder master always sounds better, and the ear is choosing the
sound. The candidate masters go to the `music-sources` release as one tar until
the verdict, since a container's `tmp/` dies with it. The commit carries the
order's sha256, and the key file base64-encoded beside the blind file, so a
session in another container can reveal it (`base64 -d` to a file under `tmp/`,
then `blind-abc.py reveal`) — the operator is told not to decode it before
answering. A key lost anyway means a rebuild with a new order, never a reveal
from memory.

**The operator listens on the site, not to the 5-second file.**
`blind-abc.py split <key> <dir> --mix <source>` writes the same four as whole
files, `mix.mp3`, `1.mp3`, `2.mp3`, `3.mp3`, in the key's order, so one seal
covers both. The vova site's unlinked `/music/mastering-blind-test`
(`src/music/pages/blind-test/`) plays all four at once and switches by gain, so
a switch never restarts the song; it fetches them from the branch through
raw.githubusercontent, whose CORS header Web Audio needs. The key's paths are
relative to this directory, so `split` runs from here.

## A song's repository

**A song plays from a public repository of its own under the `vovas-music`
organization**, named in the frontmatter's `repo:`, whose `main` serves every
file the site links at its root, under the names `pnpm music:masters tag` gives
them. It holds what the master was made from and how: the mix
(`<slug>_mix.mp3`), the master — and, where that master is a FLAC, its MP3 copy,
which the songs feeds, downloads and player serve, `<stem>.master.mp3`
(`ffmpeg -i <stem>.flac -map 0:a -c:a libmp3lame -b:a 320k`), which
`music:scaffold` reads, and the MP4 rewrap the tag run makes of it, which the
player plays for a reader asking for lossless — the video where there is one,
`mastering/` — `master.py`, `spectrum.py` and `requirements.txt` copied from
here — and a README naming each file, the command that made the master and its
reference, linked at a commit rather than copied when another repository there
holds it. `vovas-music/birds` is the pattern.

- **Every read and write of these repositories goes through
  `pnpm music:masters`** (`src/music/scripts/masters.ts`, its header the usage),
  never a bare `git push` or `gh api`: the session's git proxy refuses a push to
  any repository the session was not started on, and one script is what an
  operator's permission can name. A commit with a file past the API's size limit
  (between 39 and 46 MB) is pushed by a GitHub Actions run in the repository
  itself (`src/music/scripts/lib/music-relay.ts`), so the organization's
  repositories keep Actions enabled.
- **A change to a song's audio is made in its repository**: a new master
  replaces the old one there (`pnpm music:masters put`), and the README's
  command with it. This repo changes only what the frontmatter reads off it —
  `seconds` when its length moves — and the tag run then names, tags and sizes
  it.
- **A new song gets its repository before its page**, named by `songs.md`'s slug
  rule: `pnpm music:masters create <slug> --description <d>`, the files above
  with `pnpm music:masters put`, then `pnpm music:scaffold <slug>`, which reads
  `<stem>.flac` and `<stem>.master.mp3`, and last
  `pnpm music:masters tag <slug>`, which adds the master and its copy under the
  names a listener saves them as, tagged, and a FLAC master's MP4 rewrap, and
  points the frontmatter there. Songs that share a project's session may share
  one repository, as `machines` does.
- **Neither the tree nor a release hosts a master the site plays.** A vendored
  mp3 grows the repo with every take, and a release download redirects to a
  storage URL signed for 30 minutes, which a player still seeking after that is
  refused.

## Reflection

A song worked here ends with Майя's reflection, `<slug>.maya.reflections.md`
beside the song's markdown. `personas/maya/reflections.md` says how; read it
first, and the rules that point her home load with it.

She reads the song first as its spectrogram —
`spectrogram.py <master> sites/vova/public/music/assets/spectrograms/<slug>/<slug>.png tmp/stems/htdemucs/<slug>`,
the whole song across, pitch up, its section boundaries dashed, over its
loudness, a chromagram strip each for the melody, the harmony and the bass,
coloured by octave, and the drums, the docstring saying how to read it —
committed beside the master so the next session has it without the venv. So are
the `<slug>.txt` sidecar the same run writes beside it, the tempo, key, tuning
and chords as numbers, and the section zooms `<n>.png`, all in the song's one
folder; re-render them together, so they never describe different versions of
the song. The strips and the drums are read off the master's four stems, cut
first with `python -m demucs -n htdemucs -o tmp/stems <masters>` (~2 min a song
on 4 cores) and too big to commit. A vocal with no pitch to follow, a growl or a
shout, is noise, and the melody strip stays grey under it.

## Traps

- **Files sent to the operator need an ASCII name**: the Claude app's player
  fails silently on a Cyrillic one.
- **An image pasted mid-turn never reaches the disk**; ask for it again as its
  own message.
- **Matchering refuses a target over 15 minutes** unless `Config(max_length=…)`
  says otherwise — `master.py` does.
