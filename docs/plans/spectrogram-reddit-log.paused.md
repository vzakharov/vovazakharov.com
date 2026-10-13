# Build the spectrogram's "worth building" list

## Progress

Paused for the context budget after step 1.

- **Done — step 1** (cd420f5): `scripts/song-intake/song_facts.py` holds the analysis; `stft_magnitude(x, nfft, hop)` and `peak_chroma` are split out as planned. Птицы renders byte-identical to the pre-split script. A venv with matplotlib is at `tmp/spec-venv` (gitignored, so a new container rebuilds it: `python3 -m venv tmp/spec-venv && tmp/spec-venv/bin/pip install matplotlib`).
- **Left — steps 2–8**, as written below. `peak_chroma` does not take `tuning` yet; step 2 adds it.

Four of the five ideas `docs/remove-before-merging/spectrogram-reddit.md` § "Worth building" ranks, in `scripts/song-intake/spectrogram.py`: the tuning fix, tempo, a text sidecar of exact values and a zoomed render. Then every committed spectrogram is re-rendered and gets its sidecar, and the sidecar's numbers are checked against librosa before anyone reads them.

The order is load-bearing: tuning changes which row a note lands in, so it lands before anything reads the chroma for a key or a chord; tempo's beats are what the chords are counted in; and the check runs last, on the sidecars it judges.

Taken whole, in this PR: it is one script and its outputs, and the session's context budget relays it on if it runs long. The PR's type moves from `content:` to `feat(vova):`, since the re-rendered PNGs and the new sidecars are served.

**The blind test is dropped.** It earned its place when the picture was the only channel and a cold reading was how the hue encoding was caught misleading. With the sidecar, the facts a reader would be tested on — key, tempo, sections, chords — are printed as numbers, so a picture-only test would measure a channel nobody has to rely on for them. What can still mislead is a wrong number stated with confidence, which is step 8's check.

## Steps

### 1. Split the analysis out of the drawing

`spectrogram.py` is 385 lines, and this adds about 250 of analysis, so the analysis moves to `scripts/song-intake/song_facts.py`, numpy only, so it is testable without matplotlib: `decode`, `stft_magnitude`, `chroma_shares`, `unit_rows`, `section_times`, `frame_columns`, `mmss`, and their constants. `spectrogram.py` keeps the drawing and the CLI. A pure move, committed alone, so the later diffs read as changes.

Two generalizations ride the move, each because a later step needs a second caller:

- `stft_magnitude(x, nfft, hop)` takes its window and hop, which the drawing derives from `NFFT` and `WIDTH_PX` as today; tempo needs a 1024-sample window at a 512 hop, since the 0.37 s window smears every onset.
- `chroma_shares` is split at its seam: `peak_chroma(magnitude, freqs, band_hz, octaves, tuning)` returns the per-frame peak weights, unsmoothed, and `chroma_shares` columns and smooths them as now. The key and the chords read the per-frame weights, which `NOTE_WINDOW_S`'s 0.6 s smoothing would blur across a chord change.

### 2. Tuning

polvalente's catch: a song tuned a quarter-tone off splits every note across two neighbouring rows, which reads as a chord.

- `tuning_cents(magnitude, freqs)`: every spectral peak from 200 Hz to `NOTE_BAND_HZ[1]`, refined by parabolic interpolation over its three bins (a 2.7 Hz bin is 23 cents at 200 Hz, 5 at 1 kHz), its deviation from the nearest A440 semitone in cents, and the magnitude-weighted **circular** mean of those deviations, so −49 and +49 average to ±50 rather than 0.
- `peak_chroma` takes `tuning` and shifts the semitone grid by it before rounding, so the strips, the sections' chroma, the key and the chords all bin on the song's own grid.
- The title names it when it is more than 15 cents off: `A = 440 Hz +27 ¢`. The sidecar always does.

### 3. Tempo and beats

- `onset_envelope(x)`: half-wave-rectified spectral flux of the log magnitude, from the short STFT above, 23 ms per frame.
- `tempo_bpm(envelope, step)`: its autocorrelation over 60–200 BPM, weighted by a log-normal prior centred on 120 BPM, one octave wide — librosa's answer to half- and double-tempo errors — with the winning lag refined by parabolic interpolation.
- `beat_times(envelope, step, bpm)`: Ellis's dynamic programming, librosa's own beat tracker — each beat placed on a strong onset at roughly one period from the last, the global tempo only the prior, so the beats follow a tempo that drifts. A Suno song does drift, which rules out a fixed grid: its phase would slide off the beat within a minute.
- The tempo a reader sees is read off the beats, not the autocorrelation: the median inter-beat interval. The title gains it, as a range when the sections' own tempos spread more than 3% — `birds.mp3 — 4:46 · 74–79 BPM` — and a single number otherwise.

### 4. The sidecar

`spectrogram.py <song> <out.png>` also writes `<out>.txt` — `birds.txt` beside `birds.png` — the numbers the picture can only approximate, a dozen lines:

```
birds.mp3 — 4:46
tempo 74–79 BPM, median 76
key G minor (r 0.80; next B♭ major, 0.62)
tuning A = 440 Hz +3 ¢
sections — start–end, tempo, loudness, chords a beat each, a repeating loop folded:
0:00–0:41  74 BPM  −27 dB  Gm E♭ F ×3
0:41–1:25  77 BPM  −18 dB  Gm E♭ F Gm E♭ Dm
…
```

- **Key**: Krumhansl–Kessler profiles, all 24 rotations, correlated against the whole song's `peak_chroma` summed over `NOTE_BAND_HZ` — what `chromagram-proposal.md`'s check used (`git show origin/claude/spectrogram-reddit-feedback:docs/remove-before-merging/chromagram-proposal.md`), so its 0.80 for Птицы is a first test of this one.
- **Tempo per section**: the median inter-beat interval of the beats inside it, so a drift shows where it happens.
- **Loudness**: each section's RMS in dBFS, from the samples. Not LUFS: the question is which section is louder, and K-weighting does not change the order.
- **Chords**: each beat's `peak_chroma`, matched against the 24 major and minor triads by cosine, `N` under `QUIET_DB`; a chord held for one beat between two of the same is absorbed into them; runs merged; the sequence within a section folded to its shortest repeating period (`fold_loop`), so a four-chord loop played eight times is one line. Triads only: a seventh reads as its triad, which is the honest resolution of a chroma.
- The sections are `section_times`' boundaries, the same dashed lines, plus the song's ends.

`.txt` and not `.md`: nothing under `assets/` is a route, so the extension collides with nothing, and a `.md` would be walked by the prose checks for no reason.

### 5. Zoom

`--from m:ss --to m:ss` renders that stretch at the full width. The whole song is still decoded and analysed — sections, tempo, tuning and key need all of it — and the drawing takes the slice: its own STFT (the hop adapts, as now), envelope and strips, with the time axis in song time. The title says `birds.mp3 — 2:52–3:57 of 4:46 · 76 BPM`. A zoomed run writes no sidecar, which describes the song.

**Beats are drawn only in a zoom**, as faint lines down the chroma strips, and only when they fall at least 6 px apart; the whole-song view stays without them, where 120 BPM over four minutes is a 3 px grey wash. No bar lines: there is no downbeat estimate to put them on, and a guessed one is worse than none.

The CLI moves to `argparse` for the two flags.

### 6. Tests

`scripts/song-intake/test_song_facts.py`, `unittest` like `scripts/lib/test_hearing.py`, on synthetic signals so no fixture is committed:

- a 440 Hz sine 30 cents sharp → `tuning_cents` within 3 of +30; a 49-cent-flat one → ≈ −49, not +51 (the wrap);
- a click train at 100 BPM, and at 140 → within 1 BPM, and not half or double;
- the beats on a click train offset by 0.2 s, and on one accelerating from 90 to 100 BPM, each beat within 50 ms of its click to the end — the drift a fixed grid loses;
- a G-minor scale's chroma → G minor; a C-major triad's chroma → `C`, an A-minor's → `Am`;
- `fold_loop`: a four-chord loop ×3, ×3 with a partial last pass, and a sequence with no period;
- the sidecar's lines from fixed facts.

Wired into `scripts/vet.sh` beside `hearing`, and into `.claude/rules/stack.md`'s list and its "the one Python suite" sentence — an always-loaded file, so edited through `scripts/staged.sh stage`. The suite needs numpy on the system Python, which this container has (2.5.3); if the environment's setup script is not what put it there, the report says the operator must add it.

### 7. Re-render and write down

- Every `apps/vova/public/music/assets/spectrograms/*.png` (eleven) re-rendered from its master in `apps/vova/public/music/assets/<slug>.mp3`, each with its `.txt` beside it; every PNG still under 350 KB.
- `spectrogram.py`'s docstring: tuning, tempo in the title, the sidecar, the zoom.
- `scripts/song-intake/CLAUDE.md` § "Reflection": the sidecar is committed beside the PNG.
- `.claude/rules/maya-reflections.md` (path-scoped, edited in place, in its Russian): Майя reads the sidecar after the picture, not before, so the picture is still what she hears the song through and the numbers check her.

### 8. Check the sidecars against librosa

Last, on what step 7 committed. The synthetic tests prove the methods on clean signals; a real mix — drums over the bass, a voice over the chords — is where a key comes out as its relative major or a tempo as half itself, and a sidecar states either as flatly as the truth.

- In a throwaway venv under `tmp/`, librosa computes each song's key (`chroma_cqt`, the same Krumhansl profiles), tempo (`beat_track`) and a chord per beat (the same triad templates on its chroma), and a script compares them with the eleven sidecars.
- **Results** go to `docs/remove-before-merging/sidecar-check.md`: per song, where the two agree and where they do not. Птицы's G minor at 0.80 is the one known answer.
- A disagreement goes to Vova, who knows his songs' keys, rather than to whichever method sounds more authoritative; one that his answer shows is the script's is fixed here, and the sidecar re-rendered.

## Out of scope

- Everything under "Maybe later": melody contour, stems into the strips, CLAP, CQT.
- Ok-Motor-3984's playback test — the reader writes the music back out and a listener judges it. It wants a synthesis step and Vova's ear per song.

## DRY notes

- **Reused, not reimplemented:** `chroma_shares`' peak picking (now `peak_chroma`) feeds the strips, the sections, the key and the chords — one chroma, so the sidecar's key and the strip's bright rows cannot disagree for a reason of method. `stft_magnitude` serves both window sizes. `section_times`' boundaries are the sidecar's sections, so the text's sections are exactly the dashed lines. `mmss` formats every time in the title and the sidecar.
- **Shared module, not copy:** `song_facts.py` is imported by `spectrogram.py` and the test; nothing else in `scripts/song-intake/` computes these, so it has no other caller to serve yet.
- **Not extracted:** the zoom's slice-and-offset stays inline in `main` — one caller, and a helper would only rename two subtractions. The sidecar's formatting is one function next to the facts it formats rather than a template, since it has one shape.
- **Not shared with librosa:** the cross-check imports librosa only in the throwaway venv, as a referee; the script stays numpy-only, as its docstring promises, so the PNGs render without torch.
