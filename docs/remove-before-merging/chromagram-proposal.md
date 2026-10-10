# Proposal: replace the note-coloured waveform with two chromagram strips

From a session in `vzakharov/life` where `birds.png` was read cold, with no audio, and the reading then checked against librosa on `birds.mp3`. For the agent working `scripts/song-intake/spectrogram.py`; the operator asked for it to land here.

## Why

The waveform's hue-per-pitch-class encoding is where the cold reading went wrong, and both errors were adjacent hues:

- **Bass read as G ↔ E; it is G → E♭ → F.** E and F are neighbouring greens, and E♭2 (78 Hz) on the spectrogram was taken for E2 (82 Hz).
- **Key read as E minor / G major; it is G minor** (Krumhansl correlation 0.80 against 0.59 for the runner-up). The upper half's A# was taken for A or B, which are neighbouring purples and pinks.
- **Only the argmax survives.** One dominant class per column cannot show a chord, so major and minor are indistinguishable even when the hue is read right.

Form, register shifts and "that arc is a voice" were read correctly off the spectrogram itself; the colouring was the weak link.

## What

`chromagram-birds.png` beside this file is a prototype: two 12-row strips, treble (C4-C8) over bass (C1-C4), brightness = share of each pitch class, one hue light-to-dark. On it the bass loop G → E♭ → F (i-VI-VII) and the G-minor scale above it read at a glance, and the outro resolving to G is a single bright row.

`dominant_notes()` already computes the full 12-class chroma per column (`per_column`) and keeps only `argmax`. The change is to draw `per_column / per_column.sum(axis=1)` for each band as a 12-row `imshow` (C at the bottom, rows labelled), instead of colouring the waveform with it. No new dependency.

- **Keep** the spectrogram, and a plain loudness envelope (peak + RMS in one grey) under it: dynamics are what the waveform is good for.
- **Rows by position, labelled**, so a pitch class never depends on telling hues apart.
- **One sequential hue**, not the hue circle: brightness is magnitude here, not identity.
- **Drums smear the bass strip** in dense stretches (2:52-3:57 in Птицы): the prototype ran librosa's HPSS first and still shows it. The existing peak-picking (`PEAK_RANGE_DB`) may handle it as well or better; worth comparing on that stretch.

The prototype used librosa's `chroma_cqt` on the harmonic component with a ~0.5 s moving average; that was for speed of the experiment, not a recommendation over the script's own numpy chroma.
