#!/usr/bin/env python3
"""Runs `lib/ctc.py` over hand-built frames.

Run by path (`python3 src/kernel/scripts/lib/test_ctc.py`), as `scripts/vet.sh` does;
needs numpy on the system Python.
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from lib.ctc import path, spans

BLANK, SPACE = 0, 1


def frames(*hot: int, vocab: int = 5) -> np.ndarray:
    """One frame per token id, that token near-certain and the rest not."""
    out = np.full((len(hot), vocab), np.log(0.01))
    for t, token in enumerate(hot):
        out[t, token] = np.log(0.96)
    return out


class ViterbiPath(unittest.TestCase):
    def test_a_doubled_token_needs_the_blank_between(self) -> None:
        states = path(frames(2, 0, 2), [2, 2], BLANK)
        self.assertEqual(states, [1, 2, 3])

    def test_too_few_frames_is_an_error(self) -> None:
        with self.assertRaises(ValueError):
            path(frames(2), [2, 2], BLANK)


class Spans(unittest.TestCase):
    def test_each_word_spans_the_frames_its_tokens_were_heard_in(self) -> None:
        lp = frames(0, 2, 2, 3, 0, 1, 0, 4, 4, 0)
        self.assertEqual(spans(lp, [[2, 3], [4]], BLANK, SPACE), [(1, 3), (7, 8)])

    def test_a_word_the_vocabulary_cannot_spell_has_no_span(self) -> None:
        lp = frames(2, 1, 4)
        self.assertEqual(spans(lp, [[2], [], [4]], BLANK, SPACE), [(0, 0), (-1, -1), (2, 2)])

    def test_the_forced_path_follows_the_text_not_the_loudest_token(self) -> None:
        # Frame 1 favours 4, but the text says 3 comes first.
        lp = frames(2, 4, 3, 4)
        lp[1, 3] = np.log(0.5)
        self.assertEqual(spans(lp, [[2, 3, 4]], BLANK), [(0, 3)])


if __name__ == "__main__":
    unittest.main()
