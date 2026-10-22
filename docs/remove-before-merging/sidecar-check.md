# The sidecars against librosa

librosa 1.0.0 as referee, on the same eleven masters: key from `chroma_cqt` summed over the song against the same Krumhansl–Kessler profiles, tempo from `beat_track`, and a chord per librosa beat from the same triad templates on its chroma, with no smoothing. The script is throwaway (`tmp/sidecar_check.py`, run from the librosa venv); this file is what it found.

## Agreed

- **Key, 8 of 11**: Птицы (G minor, 0.81 against librosa's 0.80 — the one known answer, and both get it), after-us (E♭ minor), intertwined (C minor), just-because (F♯ minor), listen-single (G♭ major), listen (B minor), sorry (E♭ major), world-as-it-is (D major).
- **Tempo, 8 of 11**, within 2 BPM measured off each tool's own beats: Птицы 120.5 / 119.5, after-us 125 / 124, hello 125 / 120 (librosa dropped beats there: 242 to our 300), intertwined 120 / 120, listen 119 / 119, our-punk-rock 110 / 110, our-story 130 / 130, sorry 131 / 129.
- **Chords**: librosa's unsmoothed per-beat reading scatters (Птицы's verse comes out `Gm Cm Am E♭ Cm F`), so it is a check on the harmony, not a rival chart. Counting a beat as agreeing when the two chords share two notes (Gm and B♭, C and Am), the songs land at 55–92%; Птицы at 82%, intertwined at 92%.

## Disagreed — for Vova

Each of these is a question about the song, not about the code: the sidecar is fixed only where the answer shows it wrong.

1. **Здравствуй (hello) — key.** Ours G major (0.74, with G minor at 0.72 right behind); librosa C minor (0.70, G major next at 0.61). Both tools find it ambiguous. Major or minor, and on G or C?
2. **Наш панк-рок (our-punk-rock) — key and chords.** Ours G major (0.66); librosa C minor (0.64), the lead relay 1 flagged. The chords agree on only 17% of beats, 23% counting relatives: distorted power chords carry no third, so a triad reading has nothing to choose major or minor by. What key is it in — and if C minor, the sidecar's chord line for this song is noise and better left off than stated.
3. **Наша история (our-story) — key.** Ours A minor (0.81); librosa D minor (0.62, F major next). A minor or D minor?
4. **Просто так (just-because) — tempo.** Ours 121 BPM; librosa 89. Not a half or double: 121 / 89 is about 4 : 3, which is what a tracker gives when one counts a triplet or shuffle feel and the other the straight pulse. Does it feel like 120, or like 90?
5. **Послушайте (listen-single) — tempo.** Ours 110; librosa 86, the same ratio near 4 : 3 — while the album version, listen, agrees at 119. 110 or 86?
6. **Мир, какой он есть (world-as-it-is) — tempo.** Ours 132; librosa 153. 132 or about 150?

## Vova's answers, and the sidecars after them

Answered on PR #138's review. The fixes are general (267ad6e): the key and the chords discount each note's 3rd and 5th overtones, and the onset flux is averaged per octave so the hi-hat stops outvoting the kick. Every sidecar was re-rendered after them (4f2cb55).

| Song                  | Answer                                | Sidecar now                                                                 |
| --------------------- | ------------------------------------- | --------------------------------------------------------------------------- |
| 1. Здравствуй         | C minor                               | C minor (0.68; G minor 0.63)                                                |
| 2. Наш панк-рок       | C minor                               | C minor (0.56; C major 0.45)                                                |
| 3. Наша история       | D minor                               | D minor (0.71; A minor 0.71 — a thin margin)                                |
| 4. Просто так         | 90 BPM                                | 87–93, median 89                                                            |
| 5. Послушайте (сингл) | 86 BPM                                | 86 (G♭ major 0.78 against minor 0.77 — a thin margin)                       |
| 6. Мир, какой он есть | 110–115, drifting a lot; a piano song | 121 — **still wrong**: every onset envelope tried puts the pulse at 117–121 |

librosa was right on all three keys and on two of the three tempos; world-as-it-is fooled both tools. The other eight songs kept the key and tempo they agreed on.

Three answers are not computations, so they went to Майя's rule (`.claude/rules/maya-reflections.md`) instead of the code:

- **Major or minor over power chords** is judged by the vocal melody's third; a distorted power chord carries none.
- **The chord lines swallow and invent chords in places**, so they are read with caution.
- **Chords are spelled from the key** — E♭ and A♭ in C minor, not D♯ and G♯ — which the code does (878c431).
