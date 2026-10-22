# A song's analysis as data, beside its pictures

## Why

`spectrogram.py` measures a song off its four demucs stems and then throws most
of what it measured away into pixels. The `<slug>.txt` sidecar keeps the summary
— tempo, key, tuning, per section its span, tempo, loudness and folded chords —
but the time series behind the picture exist only as colours in the PNG: the
three chroma strips, each pitch class's octave, the drum hits, the beats and
bars, the chord per beat, the loudness envelope. A later visualization — on the
site, or a different rendering for Майя — would have to re-run demucs (~2 min a
song, stems too big to commit) to get them back.

So the same run writes `<slug>.json` beside `<slug>.png` and `<slug>.txt`: every
structured value the picture is drawn from, except the spectrogram's own dB map
(question 1).

## What the file holds

One JSON object, compact (no indentation), times in seconds rounded to the
millisecond:

- `version: 1` — bumped when a field changes meaning, so a consumer can refuse a
  file it does not understand.
- `song`, `duration`, `tuning` (cents off A440), `tempo` (the median BPM the
  title shows), `keys` — the three best as `{tonic, mode, r}`, tonic spelled —
  and `noteNames`, the twelve pitch-class names the key spells, C first.
- `beats` — every beat's time; `bars` — the downbeats `rhythm.downbeats` kept
  (empty in a section it could not tell).
- `chords` — one per beat, parallel to `beats`: the spelled name (`"Gm"`), or
  `"N"` for no chord, the chord-annotation convention the sidecar already uses.
- `sections` — per section `{start, end, bpm, db, chords, folded}`: `chords` the
  runs-merged list, `folded` the string the sidecar prints.
- `drums` —
  `{lanes: ["kick","toms","snare","cymbals"], hits: [[t, kick, toms, snare, cymbals], …]}`,
  each lane's brightness 0–1 to two decimals, as `drum_hits` returns it; empty
  for a drumless stem.
- `frames` — the time series, at a fixed `rate` of 5 frames a second rather than
  the picture's pixel columns, so the data does not depend on the image's width.
  The chroma is smoothed over 0.6 s (`NOTE_WINDOW_S`), so 5 fps loses nothing it
  holds:
  - `level` — `{peak, rms}` per frame, dBFS to one decimal;
  - `melody`, `harmony`, `bass` — each `{stem, octaves, shares, octave}`:
    `shares` as 12 rows (C first) of integers 0–100, a pitch class's percent of
    its strip, zero where the stem is quiet; `octave` as 12 rows of the octave
    number carrying it, exactly what `chroma_shares` returns.

Size: 45 KB for a 0:55 song to 239 KB for a 4:47 one (the strips' rows
dominate), against ~1.5 MB the folder's PNGs already take — the eleven together
1.5 MB in `apps/vova/public/`.

**It stays under `public/`, beside the pictures**, served at
`/music/assets/spectrograms/<slug>/<slug>.json` like them: a visualization on
the site fetches it at that address, and `scripts/song-intake/CLAUDE.md`'s
"re-render them together" keeps holding with one more file in the folder.

## Steps

1. **`song_data.py`** (new, numpy only, beside `song_facts.py`): moves `STRIPS`
   and `envelope` here from `spectrogram.py`, adds
   `strip_shares(samples, magnitude, freqs, step, duration, columns, band_hz, octaves, tuning)`
   — the `chroma_shares` call plus the quiet mask now inline in `render` — and
   `song_data(name, facts, drums, tracks)` building the object above.
2. **`harmony.chord_name(chord, names)`** — the `spell` closure inside
   `sidecar`, lifted so the sidecar and the JSON spell a chord one way.
3. **`spectrogram.py`**: `render` calls `strip_shares` and imports `STRIPS` and
   `envelope` from `song_data`; `main` writes `<slug>.json` with the sidecar on
   a whole-song run (a `--from/--to` zoom writes neither, as today). The module
   docstring names the file in the paragraph that names the sidecar.
4. **Tests** in `test_song_facts.py` (the one file vet runs): `song_data` over a
   synthetic song — a chord loop with clicks, as the existing tests build —
   round-trips through `json.dumps`, its `frames` length is `duration × rate`,
   `chords` is parallel to `beats`, and a strip's shares sum to ~100 where it
   sounds and 0 where it is silent.
5. **`scripts/song-intake/CLAUDE.md` § "Reflection"** names the JSON among the
   files committed beside the master and re-rendered together.
6. **Re-render all eleven** foldered songs — after-us, birds, hello,
   intertwined, just-because, listen, listen-single, our-punk-rock, our-story,
   sorry, world-as-it-is — from their masters in `vovas-music`, through demucs,
   so PNG, sidecar, zooms and JSON describe one run. demucs's random shift means
   the PNGs change by a few pixels; the sidecars should not change materially,
   and any that does is reported rather than committed silently. The nine flat
   `<slug>.png` files from before the stems pipeline are left as they are — out
   of scope.
7. `./scripts/vet.sh`, then `/polish` and `/pr` as `/go` runs them.

## DRY notes

- **Shared, extracted:** the strip computation (`chroma_shares` + quiet mask) is
  today inline in `render`; the JSON needs the same numbers at a different
  column count, so it becomes `strip_shares`, called by both. The chord spelling
  moves out of `sidecar` into `harmony.chord_name` for the same reason.
  `envelope` and `STRIPS` move to the numpy-only module so the JSON is built and
  tested without matplotlib, as `song_facts.py` already is.
- **Reused as is:** `measure`'s `Facts` (beats, bars, sections, keys, tuning),
  `drum_hits`' output, `folded`, `note_names`, `beats_bpm`, `mmss` — the JSON
  serializes these, it does not recompute them.
- **Not shared, on purpose:** the strips are computed twice per run — once at
  the picture's 1400 columns, once at 5 fps. Feeding the picture from the 5 fps
  series would tie the drawing to the data's rate and change every PNG for no
  reader-visible gain; the second pass costs a second or two.
- **No TypeScript schema yet.** The first consumer on the site will want a zod
  schema for this file (CLAUDE.md "Validate at boundaries"); writing it now
  would document a shape nobody reads. `version` is what that schema will key
  on.

## Questions

1. **The spectrogram's own dB map** — the biggest thing still only in the PNG.
   - **a (recommended)** leave it out: at semitone rows and 5 fps it is ~400 KB
     more per song, more than everything else together, and a visualization of
     the spectrum itself is the one that wants the audio anyway;
   - **b** include it at 12 rows per octave, 40 Hz–10 kHz, 5 fps, quantized to
     the picture's 2.5 dB steps.
2. **Format**
   - **a (recommended)** plain compact JSON: `fetch().json()` on the site,
     `json.load` in Python, readable in a GitHub preview;
   - **b** gzipped JSON (`.json.gz`), ~5× smaller but binary in git and needing
     `DecompressionStream` in the browser.
