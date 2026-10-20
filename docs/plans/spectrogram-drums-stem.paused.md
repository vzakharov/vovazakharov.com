# Read the drum row off a demucs drums stem

## The task

Vova's review of PR #138 on 2026-10-20 (`docs/pr/138/pr.md`, R01 and T01–T04):

- **T01** — keep each song's whole PNG and `.txt` in `spectrograms/<slug>/` with its zooms. **Done** (6a9e82b).
- **T02–T04** — the drum row is mostly noise. Ground truth from his ear:
  - **birds** (Птицы): the first percussion is a closed hi-hat at 1:21; everything the row marks before it is noise.
  - **hello** (Здравствуй): drums start in section 5 (1:19) with a kick; a light snare at 1:23; no cymbals anywhere in the song (from 1:36 a noise that could pass for a cymbal is fine to mark), but the row shows many cymbals at the start of section 5.
  - **intertwined** (Переплетение): the kick starts in section 3 (0:48), with one decaying crash at its start, then a kick at one steady rate and no other drums until 1:17, where everything stops again.
- **R01** — "why don't we install librosa in the sessions that need it and use it?" Answered on the PR (see the reply); librosa transcribes no drums, so it is not the fix here.

## What is established (measured this session)

- **Calibrating the mix-based row cannot work.** On birds, `drums.py`'s per-2 s hit counts and brightness are statistically the same over 1:00–1:20 as over 1:20–1:40: a picked guitar's attack rises in the bands the way a hit does.
- **A demucs drums stem settles when drums play, on all three songs.** `python -m demucs --two-stems=drums -n htdemucs -o tmp/stems <master>` (the `scripts/song-intake/requirements.txt` venv, ~1.2 GB; ~3.5 min a song on 4 cores). Per-second RMS of the stem: birds −55 dB (the floor) until 1:20, −30 the second after; hello −43 until 1:19, −16 from 1:20; intertwined −34…−40 before 0:48, −14 from 0:48 to 1:17, then −28…−36 (a noise riser demucs files as drums, up to the crash at 1:28).
- **The stem is offset from the master** and must be aligned in code, by cross-correlation against the mix: 552 samples at 22 050 Hz with demucs's WAV output (demucs ignores the mp3 decoder delay ffmpeg removes), 1105 with `--mp3`. Use the WAV.
- **On the stem, onsets are found** by log-spectral flux (positive part, summed over bins) peaking over ±3 frames and above 1.5× its mean over ±0.5 s. Each onset's level relative to the stem's 95th-percentile frame level separates hits from bleed: intertwined's kicks −2…+3 dB, its pre-0:48 bleed −29…−43; hello's kick +2.8, snare −8.3, bleed −38…−63; birds' closed hat −18.7, its bleed −38…−52. The riser in intertwined sits at −12…−22 — **level alone does not separate it from birds' hat**.
- **The old rise-based unmix fails on a clean stem**: between hits the stem is silent, so every band of every hit rises 30–60 dB; intertwined's kick-only section lit kick, snare, toms and cymbals, several marks per kick.
- **Spectral shapes of isolated hits on the stems**, band level in dB at the onset relative to the hit's loudest band, bands 30, 60, 120, 250, 500, 1k, 2.5k, 5k, 8k Hz:
  - kick, no click (hello 1:20.22): −21 0 −4 −20 −35 −47 −56 −58 −60
  - kick with click (intertwined 0:50.81): −6 0 −10 −23 −20 −17 −21 −22 −26
  - light snare (hello 1:23.24): −37 −35 −26 −12 −5 0 −3 0 0
  - snare or clap (birds 1:21.22): −25 −21 −17 −14 −19 0 −2 −1 −4
  - closed hat (birds 1:20.02): −45 −33 −29 −35 −37 −35 −32 −4 0
  - the riser (intertwined 1:22.29): −38 −38 −33 −29 −5 0 −12 −23 −44 — peaked at 500 Hz–1 kHz and falling steeply above 2.5 kHz, which no kit piece's shape matches.

## What is left

1. **Rewrite `drums.py` to read the stem**: align it to the master; find onsets as above; per onset, unmix the power it adds over the frames before (linear power, not dB rises) onto per-piece band shapes taken from the measurements above — two kicks, toms, snare, clap, closed hat, crash/ride — by NNLS. Reject an onset whose fit leaves much of its power unexplained (the riser) or that sits more than ~25 dB under the stem's loud hits (bleed). A lane is as bright as its piece's level against that lane's own loud hits; one mark per onset, never one per frame. The kick-with-click shape is what keeps a kick's click out of the snare lane, so intertwined's section 3 reads kick only.
2. **`spectrogram.py --drums <stem>`**; without it the drum row is left out and the run says so, since a mix-based row is noise. Test the onset picking, the alignment and the unmix on synthetic strikes in `test_song_facts.py`, replacing the mix-based drum tests.
3. **Check against the ground truth above** before re-rendering anything: birds silent to 1:20 and a hat first; hello a kick at 1:19–1:20, a snare at 1:23, no cymbal lane at the start of section 5; intertwined one kick per beat 0:48–1:17 and nothing after until 1:28.
4. **Separate all eleven masters and re-render** each with `--drums` into `spectrograms/<slug>/<slug>.png`, every PNG under 350 KB. Update the docstrings (`drums.py`, `spectrogram.py`'s drum paragraph), `scripts/song-intake/CLAUDE.md` (the demucs step and `--drums`) and `.claude/rules/maya-reflections.md` (how to make the stem).
5. **Reply on T02–T04** in Russian with the bare commit SHA, never resolving a thread; then `/go` Step 3 (`/polish`) and Step 4 (`/pr`).
