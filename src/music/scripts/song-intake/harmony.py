"""A song's harmony: its key, a chord per beat, and the loops they repeat."""

import numpy as np

from audio import QUIET, steady_path
from pitch import fold_fifths

# Krumhansl and Kessler's probe-tone ratings, C as the tonic.
KEY_PROFILES = {
    "major": np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]),
    "minor": np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]),
}
# Major and minor triads only: a seventh reads as its triad, which is all a
# chroma can honestly resolve.
TRIAD_NAMES = [(root, quality) for quality in ("", "m") for root in range(12)]
TRIADS = np.array([
    np.isin(np.arange(12), [root, (root + (4 if quality == "" else 3)) % 12, (root + 7) % 12])
    for root, quality in TRIAD_NAMES
], float) / np.sqrt(3)
# Tuned on Птицы, whose bass line G → E♭ → F is known: at these weights its
# loops come out whole, where a beat-by-beat cosine scatters them.
BASS_ROOT_WEIGHT = 1.0
CHORD_CHANGE_COST = 1.0
SHARP_NAMES = ("C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B")
FLAT_NAMES = ("C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B")
# F, B♭, E♭, A♭, D♭, G♭ major: the keys whose signature is flats.
FLAT_MAJORS = {5, 10, 3, 8, 1, 6}


def song_key(pitch_classes):
    """The 24 keys by Pearson r against the Krumhansl–Kessler profiles, best
    first, as [(r, tonic pitch class, "major" | "minor")]."""
    return sorted(
        ((float(np.corrcoef(pitch_classes, np.roll(profile, tonic))[0, 1]), tonic, mode)
         for mode, profile in KEY_PROFILES.items() for tonic in range(12)),
        reverse=True,
    )


def beat_chords(chroma, loudest, step, beats, end):
    """A triad per beat, beat to next beat (the last to end), as (root, "" | "m"),
    or None where the band stays under QUIET.

    chroma is `peak_chroma`'s over C2–C7. Each beat scores every triad by the
    cosine between its template and the beat's 12-class chroma, plus
    BASS_ROOT_WEIGHT times the share of the bass octaves, C2–B3, its root
    holds: a melody note held over a chord pulls the cosine toward a
    neighbour, and the bass, which plays the root, pulls it back. The bass's
    fifths are folded onto their roots first (`fold_fifths`), or a bass
    sounding root and fifth votes half for the chord a fifth up. The path
    through the beats maximizes the scores less CHORD_CHANGE_COST per change
    (Viterbi), so a beat the voice pulls astray does not break a held chord.
    """
    by_octave = chroma.reshape(len(chroma), -1, 12)
    bass_octaves = fold_fifths(by_octave[:, :2].reshape(len(chroma), -1)).reshape(len(chroma), 2, 12)
    roots = np.array([root for root, _ in TRIAD_NAMES])
    frame = np.round(np.concatenate([beats, [end]]) / step).astype(int)
    scores, quiet = [], []
    for a, b in zip(frame[:-1], frame[1:]):
        b = max(b, a + 1)
        whole = by_octave[a:b].sum(axis=(0, 1))
        bass = bass_octaves[a:b].sum(axis=(0, 1))
        quiet.append(loudest[a:b].max(initial=0) < QUIET or not whole.any())
        fit = TRIADS @ (whole / max(np.linalg.norm(whole), 1e-12))
        scores.append(fit + BASS_ROOT_WEIGHT * bass[roots] / max(bass.sum(), 1e-12))
    if not scores:
        return []
    path = steady_path(scores, CHORD_CHANGE_COST)
    return [None if q else TRIAD_NAMES[c] for c, q in zip(path, quiet)]


def runs(sequence):
    """The sequence with each run of equal neighbours merged into one."""
    return [c for i, c in enumerate(sequence) if i == 0 or c != sequence[i - 1]]


def fold_loop(sequence):
    """The sequence as a loop played over and over: (head, loop, times, tail).

    The loop is the stretch repeating at least twice that covers the most of
    the sequence, the earliest and then the shortest on a tie; head is what
    comes before it, tail what follows its last whole pass, a partial one
    included. A sequence that never repeats is all loop, once.
    """
    best, covered = ([], sequence, 1, []), 0
    for start in range(len(sequence)):
        for period in range(1, (len(sequence) - start) // 2 + 1):
            end = start + period
            while end < len(sequence) and sequence[end] == sequence[end - period]:
                end += 1
            times = (end - start) // period
            if times >= 2 and end - start > covered:
                stop = start + times * period
                best, covered = (sequence[:start], sequence[start:start + period], times, sequence[stop:]), end - start
    return best


def folded(sequence):
    """`fold_loop` as text: 'B♭ + Gm E♭ F ×3 + Gm'."""
    head, loop, times, tail = fold_loop(sequence)
    parts = [" ".join(head), " ".join(loop) + (f" ×{times}" if times > 1 else ""), " ".join(tail)]
    return " + ".join(p for p in parts if p)

def note_names(tonic, mode):
    """Pitch-class names spelled as the key's signature spells them: flats in
    a flat key, sharps otherwise."""
    major = tonic if mode == "major" else (tonic + 3) % 12
    return FLAT_NAMES if major in FLAT_MAJORS else SHARP_NAMES
