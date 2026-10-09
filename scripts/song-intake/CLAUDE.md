# Song intake: splitting, vocals, lyrics, mastering, spectrograms

Working a song before it joins the catalogue: an album that survives as one file, lyrics that survive nowhere, a mix that was never mastered. Everything here runs on the session's CPU from a venv the setup script does not provide:

```sh
python3 -m venv tmp/song-intake-venv && tmp/song-intake-venv/bin/pip install -r scripts/song-intake/requirements.txt
```

`spectrogram.py` alone needs only `pip install matplotlib`, which spares the venv the torch the rest pulls in.

Lab output lives under `docs/remove-before-merging/<album>/` — the split songs, `mastered/`, `lyrics/` — committed so the operator can listen from another machine, and swept before the merge. A song reaches `apps/vova/public/music/` only through `.claude/rules/songs.md`'s contract, slug rule included.

## Splitting an album file

Cut at the silences between songs, and check the cuts before trusting them:

- `ffmpeg -i album.mp3 -af silencedetect=noise=-45dB:d=0.7 -f null -` lists them; each song starts at a `silence_end`, less ~0.2 s so its attack survives.
- The cut lengths must match the release's track list within a couple of seconds. A listing counts each song's trailing silence, so a song runs to the next one's start.
- Stream-copy (`-c copy`), never re-encode a lossy source, and tag title, album, artist and track.

## Vocals

`python -m demucs --two-stems=vocals -n htdemucs --mp3 <songs>`. `htdemucs_ft` is a bag of four models, four times slower; `htdemucs`'s stems were enough for Whisper to hear Крылья clean. One process takes every core, so running several at once buys nothing on one machine.

## Lyrics

`lyrics.py` on the vocals stem is the primary hearing: Whisper large-v3 hears sung Russian far better than Deepgram's nova-3 (`персонажи Мураками`, where nova-3 heard `персонажи-муратами`). `scripts/transcribe.py` on the same stem is the second opinion, since the lines the two disagree on are the ones the operator has to listen to. Whisper's first timecode can jump across an instrumental; Deepgram's place the line.

**A song Whisper returns a line or two for, or fills with `Субтитры …` and `КОНЕЦ`, is heard in pieces.** Its voice filter can drop sung vocals whole (`--no-vad` turns it off), and over a long stretch it cannot make out it invents subtitle credits instead. Cut the stem at its silences and hear each sung stretch on its own — that recovered Птицы where both whole-file runs failed. A credit line in any transcript is invented and never reaches the words.

Neither transcript is the lyrics. The draft reconciles both, keeps the line breaks the music makes, and marks every line the two disagreed on, because the agent cannot hear the song and the operator can. A setting of a published poem — `Послушайте` is Mayakovsky — takes the canonical text and flags only where the recording departs from it.

## Mastering

`master.py <song> <reference> <out.mp3>` is the whole chain; its docstring says what each step does. What it encodes, from the operator's ear:

- **The reference is the operator's own later master** from the same project — `letim` for за/обложкой — so the result copies a decision they already made rather than a taste the agent guessed.
- **Half strength, not a full match.** Matchering's full match sounded too bright: it cut 120–250 Hz by ~8 dB and lifted 12–18 kHz by up to 14, where a lossy source has only encoder artefacts. `--strength 0.5` and the +3 dB air cap are where the operator settled.
- **Each song against the reference on its own**, not the album as one file — the operator's call, at the cost of the songs' loudness relative to one another.
- **Peaks stay under -1 dBTP in the decoded mp3.** Matchering's limiter stops sample peaks only, and LAME adds up to 1.5 dB of intersample overshoot; the oversampled limiter's ceiling covers both.
- **Loudness matches the catalogue, not a streaming norm**: the site's player does no normalization, so a song plays as loud as its file, beside songs at -9 to -12 LUFS.

Judge a master by **loudness-matched A/B**: alternate five seconds of each over the whole song, the louder side brought down to the quieter rather than the quieter raised, whose peaks would clip — otherwise the ear hears level, not sound. `spectrum.py` shows what an EQ actually did, which is the place to start when the operator says "too bright" or "muddy".

## Reflection

A song worked here ends with Майя's reflection, `<slug>.reflections.md` beside the song's markdown. `.claude/rules/maya-reflections.md` says how, and loads on reading a reflection, never on the `Write` that creates the first one — so read it first.

She reads the song first as its spectrogram — `spectrogram.py <master> apps/vova/public/music/assets/spectrograms/<slug>.png`, the whole song across, 40 Hz–10 kHz up on a log scale so a melody keeps its shape, in dBFS, over its waveform — committed beside the master so the next session has it without the venv.

## Traps

- **Files sent to the operator need an ASCII name**: the Claude app's player fails silently on a Cyrillic one.
- **An image pasted mid-turn never reaches the disk**; ask for it again as its own message.
- **Matchering refuses a target over 15 minutes** unless `Config(max_length=…)` says otherwise — `master.py` does.
