#!/usr/bin/env python3
"""Runs the spectrogram's measurements over synthetic signals, so no fixture is committed.

Run by path (`python3 scripts/song-intake/test_song_facts.py`), as `scripts/vet.sh` does.
"""

import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))

from audio import SR, aligned, stft_magnitude
from drums import LANES, drum_hits
from harmony import beat_chords, folded, fold_loop, song_key
from pitch import NOTE_BAND_HZ, fold_fifths, peak_chroma, tuning_cents
from rhythm import beat_times, downbeats, onset_envelope, tempo_bpm
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

    def bass_roots(self, chords):
        """Per chord, the class a bass playing its root and fifth, the fifth
        the louder, folds to — midi roots, two seconds each."""
        x = np.concatenate([tone(root, 2, level=0.15) + tone(root + 7, 2) for root in chords])
        magnitude, freqs, _ = stft_magnitude(x, NFFT, HOP)
        chroma, _ = peak_chroma(magnitude, freqs, (NOTE_BAND_HZ[0], 254), (2, 3))
        folded = fold_fifths(chroma).reshape(len(chroma), -1, 12).sum(axis=1)
        per_chord = np.array_split(folded, len(chords))
        return [int(part.sum(axis=0).argmax()) for part in per_chord]

    def test_fifths_fold_onto_roots(self):
        # Butterfly as Вова counts it, in A minor: Am C F E, a root and a louder
        # fifth each, which unfolded read as two alternating notes.
        self.assertEqual(self.bass_roots([45, 48, 41, 40]), [9, 0, 5, 4])
        # Candle: F G Em Am.
        self.assertEqual(self.bass_roots([41, 43, 40, 45]), [5, 7, 4, 9])

    def test_a_lone_fifth_stays(self):
        chroma = np.zeros((1, 24))
        chroma[0, 7] = 1.0
        chroma[0, 0] = 0.1
        self.assertEqual(fold_fifths(chroma)[0, 7], 1.0)

    def test_the_stronger_pair_wins_a_chain(self):
        # C, G and D at once: G is C's fifth and D's root; C–G is louder.
        chroma = np.zeros((1, 12))
        chroma[0, [0, 7, 2]] = [1.0, 1.0, 0.5]
        self.assertEqual(fold_fifths(chroma)[0, [0, 7, 2]].tolist(), [2.0, 0.0, 0.5])

    def test_triads(self):
        for notes, chord in (((48, 52, 55), (0, "")), ((45, 48, 52), (9, "m"))):
            x = sum(tone(m, 2) for m in notes)
            magnitude, freqs, step = stft_magnitude(x, NFFT, HOP)
            chroma, loudest = peak_chroma(magnitude, freqs, NOTE_BAND_HZ, (2, 6))
            self.assertEqual(beat_chords(chroma, loudest, step, np.array([0.0, 1.0]), 2), [chord, chord])


class Bars(unittest.TestCase):
    beats = np.arange(64) * 0.5
    whole = [0, 32]
    no_snare = (np.zeros(0), np.zeros(0))

    def chords(self, every, offset):
        """A chord per beat, changing every `every` beats from beat offset on."""
        return [(((i - offset) // every) % 2, "") for i in range(len(self.beats))]

    def snares(self, times):
        return np.asarray(times, float), np.ones(len(times))

    def test_changes_mark_the_bar(self):
        bars = downbeats(self.beats, self.chords(4, 1), self.no_snare, self.whole)
        np.testing.assert_array_equal(bars, self.beats[1::4])

    def test_each_section_places_its_own(self):
        chords = self.chords(4, 1)[:32] + self.chords(4, 0)[32:]
        bars = downbeats(self.beats, chords, self.no_snare, [0, 16, 32])
        np.testing.assert_array_equal(bars, np.concatenate([self.beats[1:32:4], self.beats[32::4]]))

    def test_half_bar_changes_show_none(self):
        self.assertEqual(len(downbeats(self.beats, self.chords(2, 1), self.no_snare, self.whole)), 0)

    def test_no_chords_show_none(self):
        self.assertEqual(len(downbeats(self.beats, [None] * len(self.beats), self.no_snare, self.whole)), 0)

    def test_a_snare_a_bar_overrules_the_chords(self):
        # sorry's third section: the tracker on the off-beat, the bass in a
        # half beat early, the snare half a bar after the true first beat.
        first = self.beats[1::4] + 0.25
        bars = downbeats(self.beats, self.chords(4, 2), self.snares(first + 1), self.whole)
        np.testing.assert_array_equal(bars, first[first < 32])

    def test_the_backbeat_leaves_the_bar_to_the_chords(self):
        backbeat = self.beats[(np.arange(64) % 4) % 2 == 0]
        bars = downbeats(self.beats, self.chords(4, 1), self.snares(backbeat), self.whole)
        np.testing.assert_array_equal(bars, self.beats[1::4])


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
            bars=np.arange(0, 40, 2.0),
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
            "bars drawn on the section zooms numbered 1 — only where the snare or the chord changes settle where one"
            " starts, so a section without them still has bars; the whole song's picture draws none",
            "sections — number, start–end, tempo, loudness, chords with runs merged and a repeating loop folded"
            " (N: no chord, the accompaniment too quiet to name one):",
            "1  0:00–0:40  120 BPM  −13 dB  Gm E♭ F ×2",
            "2  0:40–1:35  124 BPM  −10 dB  N Gm",
        ])


class Drums(unittest.TestCase):
    """Synthetic strikes on a stem as demucs leaves it: the kit, and bleed far under it."""

    rng = np.random.default_rng(1)
    strikes = np.arange(0.5, 3.5, 0.5)

    def decaying(self, f, seconds, decay):
        """A sine at f, a function of time, dying away over decay seconds."""
        t = np.arange(int(SR * seconds)) / SR
        return np.sin(2 * np.pi * np.cumsum(f(t)) / SR) * np.exp(-t / decay)

    def noise(self, seconds, decay, band_hz=(0, SR)):
        """A white-noise burst dying away over decay seconds, inside band_hz."""
        n = int(SR * seconds)
        spectrum = np.fft.rfft(self.rng.standard_normal(n))
        freqs = np.fft.rfftfreq(n, 1 / SR)
        spectrum[(freqs < band_hz[0]) | (freqs > band_hz[1])] = 0
        return np.fft.irfft(spectrum, n) * np.exp(-np.arange(n) / SR / decay)

    def kick(self):
        return self.decaying(lambda t: 50 + 70 * np.exp(-t / 0.03), 0.4, 0.15)

    def struck(self, x, sound, times):
        """x with sound added at each of times, cut at x's end."""
        for t in times:
            i = int(t * SR)
            x[i:i + len(sound)] += sound[: len(x) - i].astype(x.dtype)
        return x

    def stem(self, hit, level=0.5, seconds=4):
        """hit struck at every one of strikes over bleed 50 dB under it."""
        x = 0.5 * 10 ** (-50 / 20) * self.rng.standard_normal(int(SR * seconds))
        return self.struck(x, level * hit, self.strikes).astype(np.float32)

    def lit(self, x):
        """Each lane's brightness summed over the hits within 0.1 s of a strike, and the hits elsewhere."""
        times, lit = drum_hits(x, x)
        near = np.min(np.abs(times[:, None] - self.strikes[None]), axis=1) < 0.1
        return lit[near].sum(axis=0), int((~near).sum())

    def assert_lights(self, lane, hit):
        lit, stray = self.lit(self.stem(hit))
        self.assertEqual(LANES[int(np.argmax(lit))], lane, dict(zip(LANES, lit.round(2))))
        self.assertEqual(stray, 0)

    def test_kick(self):
        self.assert_lights("kick", self.kick())

    def test_tom(self):
        # A membrane's first modes, at 1.59 and 2.14 times its fundamental.
        modes = ((1, 1), (1.59, 0.5), (2.14, 0.4))
        self.assert_lights("toms", sum(a * self.decaying(lambda t, m=m: np.full_like(t, 160 * m), 0.4, 0.15) for m, a in modes))

    def snare(self):
        return self.noise(0.3, 0.05, (150, SR)) + 0.25 * self.decaying(lambda t: np.full_like(t, 200), 0.3, 0.08)

    def test_snare(self):
        self.assert_lights("snare", self.snare())

    def test_snare_on_a_kick(self):
        # Its top bands fit the snare and the crash alike, so which lights
        # beside the kick is the fit's call; that something does is the test.
        kick = self.kick()
        kick[: int(SR * 0.3)] += 0.3 * self.snare()
        lit, stray = self.lit(self.stem(kick))
        self.assertGreater(lit[LANES.index("kick")], 0)
        self.assertGreater(np.count_nonzero(lit), 1, dict(zip(LANES, lit.round(2))))
        self.assertEqual(stray, 0)

    def test_no_kit_far_under_the_mix(self):
        # What demucs leaves in the drums stem of a song with no drums.
        x = self.stem(self.kick())
        times, _ = drum_hits(x, 10 ** (40 / 20) * x)
        self.assertEqual(len(times), 0)

    def test_hi_hat(self):
        self.assert_lights("cymbals", self.noise(0.1, 0.03, (6000, SR)))

    def test_one_mark_per_strike(self):
        x = self.stem(self.kick())
        times, lit = drum_hits(x, x)
        self.assertEqual(len(times), len(self.strikes))
        self.assertLess(np.abs(times - self.strikes).max(), 0.03)

    def test_bleed_is_no_hit(self):
        # The same kick 35 dB under the stem's loud hits, between them.
        x = self.struck(self.stem(self.kick()), self.kick() * 0.5 * 10 ** (-35 / 20), self.strikes + 0.25)
        lit, stray = self.lit(x)
        self.assertEqual(stray, 0)

    def test_riser_is_no_hit(self):
        # Noise swelling at 500 Hz–1 kHz, which demucs files as drums and no kit piece sounds like.
        swell = self.noise(0.2, 1, (500, 1000)) * np.linspace(0, 1, int(SR * 0.2))
        x = self.struck(self.stem(self.kick()), 0.3 * swell, self.strikes + 0.25)
        lit, stray = self.lit(x)
        self.assertEqual(stray, 0)

    def test_alignment(self):
        # The drums alone in the first half and the tone alone in the second,
        # each stem silent where the other plays, so only their sum finds the lag.
        kit, note = self.stem(self.kick(), seconds=10), tone(57, 10, level=0.1)
        kit[len(kit) // 2:] = 0
        note[: len(note) // 2] = 0
        late = [np.concatenate([np.zeros(552, np.float32), s[:-552]]) for s in (kit, note)]
        for stem, shifted in zip((kit, note), aligned(late, kit + note)):
            self.assertTrue(np.allclose(shifted[552:-552], stem[552:-552]))


if __name__ == "__main__":
    unittest.main()
