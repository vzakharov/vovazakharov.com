#!/usr/bin/env python3
"""Runs the spectrogram's measurements over synthetic signals, so no fixture is committed.

Run by path (`python3 scripts/song-intake/test_song_facts.py`), as `scripts/vet.sh` does.
"""

import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))

from audio import SR, stft_magnitude
from harmony import beat_chords, folded, fold_loop, song_key
from pitch import NOTE_BAND_HZ, peak_chroma, tuning_cents
from rhythm import beat_times, onset_envelope, tempo_bpm
from song_facts import Facts, Section, sidecar

NFFT, HOP = 8192, 2048


def tone(midi, seconds, cents=0.0, level=0.3):
    """A note with its first three harmonics, falling off, cents off A440's grid."""
    t = np.arange(int(SR * seconds)) / SR
    f = 440 * 2 ** ((midi - 69) / 12 + cents / 1200)
    return sum(level / k * np.sin(2 * np.pi * k * f * t) for k in (1, 2, 3)).astype(np.float32)


def clicks(times, seconds):
    """A noise burst at each time, as a hi-hat or a kick's attack is."""
    x = np.zeros(int(SR * seconds), np.float32)
    burst = np.random.default_rng(0).standard_normal(200).astype(np.float32) * np.hanning(200)
    for t in times:
        i = int(t * SR)
        x[i:i + 200] += burst[: len(x) - i]
    return x


def beats_of(x):
    envelope, step = onset_envelope(x)
    bpm = tempo_bpm(envelope, step)
    return bpm, beat_times(envelope, step, bpm)


def pitch_classes(x):
    magnitude, freqs, _ = stft_magnitude(x, NFFT, HOP)
    chroma, _ = peak_chroma(magnitude, freqs, NOTE_BAND_HZ, (2, 6))
    return chroma.reshape(len(chroma), -1, 12).sum(axis=(0, 1))


class Tuning(unittest.TestCase):
    def test_sharp(self):
        magnitude, freqs, _ = stft_magnitude(tone(69, 5, cents=30), NFFT, HOP)
        self.assertAlmostEqual(tuning_cents(magnitude, freqs), 30, delta=3)

    def test_nearly_a_semitone_flat_wraps(self):
        magnitude, freqs, _ = stft_magnitude(tone(69, 5, cents=-49), NFFT, HOP)
        self.assertAlmostEqual(tuning_cents(magnitude, freqs), -49, delta=3)

    def test_quarter_tone_off_lands_in_one_class(self):
        x = tone(67, 5, cents=45)
        magnitude, freqs, _ = stft_magnitude(x, NFFT, HOP)
        cents = tuning_cents(magnitude, freqs)
        chroma, _ = peak_chroma(magnitude, freqs, NOTE_BAND_HZ, (2, 6), cents)
        classes = chroma.reshape(len(chroma), -1, 12).sum(axis=(0, 1))
        self.assertGreater(classes[7] / classes.sum(), 0.6)


class Tempo(unittest.TestCase):
    def assert_tracks(self, times, beats):
        self.assertEqual(len(beats), len(times))
        self.assertLess(np.abs(np.asarray(times) - beats).max(), 0.05)

    def test_steady(self):
        for bpm in (100, 140):
            times = np.arange(0.1, 30, 60 / bpm)
            found, beats = beats_of(clicks(times, 30))
            self.assertAlmostEqual(found, bpm, delta=1)
            self.assert_tracks(times, beats)

    def test_offset(self):
        times = np.arange(0.2, 30, 0.6)
        self.assert_tracks(times, beats_of(clicks(times, 30))[1])

    def test_drift(self):
        # A fixed grid at the mean tempo is a quarter-beat off by either end.
        gaps = 60 / np.linspace(90, 100, 60)
        times = 0.2 + np.concatenate([[0], np.cumsum(gaps[:-1])])
        self.assert_tracks(times, beats_of(clicks(times, times[-1] + 1))[1])


class Harmony(unittest.TestCase):
    def test_g_minor_scale(self):
        scale = np.concatenate([tone(m, 0.5) for m in (55, 57, 58, 60, 62, 63, 65, 67, 62, 58, 55)])
        _, tonic, mode = song_key(pitch_classes(scale))[0]
        self.assertEqual((tonic, mode), (7, "minor"))

    def test_harmonics_vote_for_their_note(self):
        # A bright C3: its third and fifth harmonics as loud as the note, a G and an E.
        t = np.arange(SR * 4) / SR
        f = 440 * 2 ** ((48 - 69) / 12)
        x = sum(0.2 * np.sin(2 * np.pi * k * f * t) for k in (1, 2, 3, 4, 5)).astype(np.float32)
        magnitude, freqs, _ = stft_magnitude(x, NFFT, HOP)
        chroma, _ = peak_chroma(magnitude, freqs, NOTE_BAND_HZ, (2, 6), fundamentals=True)
        classes = chroma.reshape(len(chroma), -1, 12).sum(axis=(0, 1))
        self.assertGreater(classes[0], 2 * (classes[7] + classes[4]))

    def test_triads(self):
        for notes, chord in (((48, 52, 55), (0, "")), ((45, 48, 52), (9, "m"))):
            x = sum(tone(m, 2) for m in notes)
            magnitude, freqs, step = stft_magnitude(x, NFFT, HOP)
            chroma, loudest = peak_chroma(magnitude, freqs, NOTE_BAND_HZ, (2, 6))
            self.assertEqual(beat_chords(chroma, loudest, step, np.array([0.0, 1.0]), 2), [chord, chord])


class Loops(unittest.TestCase):
    def test_whole_passes(self):
        self.assertEqual(fold_loop(list("abcdabcdabcd")), ([], list("abcd"), 3, []))

    def test_partial_last_pass(self):
        self.assertEqual(fold_loop(list("abcabcab")), ([], list("abc"), 2, list("ab")))

    def test_stray_head(self):
        self.assertEqual(folded(list("xabab")), "x + a b ×2")

    def test_no_period(self):
        self.assertEqual(fold_loop(list("abcd")), ([], list("abcd"), 1, []))


class Sidecar(unittest.TestCase):
    def test_lines(self):
        gm, eb, f = (7, "m"), (3, ""), (5, "")
        facts = Facts(
            duration=95, tuning=-3.2,
            keys=[(0.81, 7, "minor"), (0.73, 10, "major")],
            beats=np.arange(0, 95, 0.5),
            sections=[
                Section(0, 40, 120.0, -13.2, [gm, eb, f, gm, eb, f]),
                Section(40, 95, 124.4, -10.0, [None, gm]),
            ],
        )
        self.assertEqual(sidecar("birds.mp3", facts).splitlines(), [
            "birds.mp3 — 1:35",
            "tempo 120–124 BPM, median 120",
            "key G minor (r 0.81; next B♭ major, 0.73)",
            "tuning A = 440 Hz −3 ¢",
            "sections — start–end, tempo, loudness, chords with runs merged and a repeating loop folded:",
            "0:00–0:40  120 BPM  −13 dB  Gm E♭ F ×2",
            "0:40–1:35  124 BPM  −10 dB  N Gm",
        ])


if __name__ == "__main__":
    unittest.main()
