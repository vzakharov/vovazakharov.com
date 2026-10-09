#!/usr/bin/env python3
"""Runs `lib/hearing.py` over hand-built Deepgram responses.

Run by path (`python3 scripts/lib/test_hearing.py`), as `scripts/vet.sh` does.
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path
from typing import Any, Optional

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from lib.hearing import doubts, mark, marked, merged, paragraphs

# One word as (punctuated text, start second[, confidence]); its end is a
# fraction later, and its bare form is the text lowercased and unpunctuated.
Spoken = tuple


def response(*paras: list[list[Spoken]]) -> dict[str, Any]:
    """A response with these paragraphs of sentences of words."""
    words: list[dict[str, Any]] = []
    shaped = []
    for para in paras:
        sentences = []
        for sentence in para:
            spoken = [_word(*w) for w in sentence]
            words += spoken
            sentences.append(
                {
                    "text": " ".join(w["punctuated_word"] for w in spoken),
                    "start": spoken[0]["start"],
                    "end": spoken[-1]["end"],
                }
            )
        shaped.append({"sentences": sentences})
    alt = {
        "transcript": " ".join(w["punctuated_word"] for w in words),
        "words": words,
        "paragraphs": {"paragraphs": shaped},
    }
    return {"results": {"channels": [{"alternatives": [alt]}]}}


def _word(text: str, start: float, confidence: Optional[float] = 0.99) -> dict:
    out = {
        "word": text.lower().strip(".,!?«»"),
        "punctuated_word": text,
        "start": start,
        "end": start + 0.4,
    }
    if confidence is not None:
        out["confidence"] = confidence
    return out


class Paragraphs(unittest.TestCase):
    def test_words_land_in_the_sentence_said_within(self) -> None:
        r = response(
            [[("Раз", 0.0), ("два.", 0.5)], [("Три", 1.0), ("четыре.", 1.5)]],
            [[("Пять.", 3.0)]],
        )
        found = paragraphs(r)
        self.assertEqual([len(p) for p in found], [2, 1])
        self.assertEqual(
            [[w["punctuated_word"] for w in s["words"]] for p in found for s in p],
            [["Раз", "два."], ["Три", "четыре."], ["Пять."]],
        )

    def test_no_paragraphs_is_one_sentence_of_the_transcript(self) -> None:
        r = response([[("Раз", 0.0), ("два.", 0.5)]])
        del r["results"]["channels"][0]["alternatives"][0]["paragraphs"]
        found = paragraphs(r)
        self.assertEqual(len(found), 1)
        self.assertEqual(found[0][0]["text"], "Раз два.")
        self.assertEqual(len(found[0][0]["words"]), 2)

    def test_no_speech_is_empty(self) -> None:
        r = {"results": {"channels": [{"alternatives": [{"transcript": ""}]}]}}
        self.assertEqual(paragraphs(r), [])


class Marking(unittest.TestCase):
    def test_punctuation_stays_outside_the_doubt(self) -> None:
        self.assertEqual(mark("Кеко,"), "[Кеко?],")
        self.assertEqual(mark("«слово»."), "«[слово?]».")
        self.assertEqual(mark("…"), "…")

    def test_only_words_under_the_floor_are_marked(self) -> None:
        r = response([[("Раз", 0.0, 0.99), ("два,", 0.5, 0.4), ("три.", 1.0, 0.95)]])
        line = paragraphs(r)[0][0]
        self.assertEqual(marked(line, 0.95), "Раз [два?], три.")
        self.assertEqual(marked(line, 0.3), "Раз два, три.")

    def test_a_word_without_confidence_leaves_the_line_plain(self) -> None:
        r = response([[("Раз", 0.0, 0.1), ("два.", 0.5, None)]])
        self.assertEqual(marked(paragraphs(r)[0][0], 0.95), "Раз два.")

    def test_doubts_counts_only_scored_words(self) -> None:
        r = response([[("Раз", 0.0, 0.5), ("два", 0.5, None), ("три.", 1.0, 0.99)]])
        self.assertEqual(doubts(r, 0.95), (2, 1))


class Merged(unittest.TestCase):
    def test_agreement_is_written_once(self) -> None:
        first = response([[("Ёлка", 0.0), ("горит.", 0.5)]])
        second = response([[("елка,", 0.1), ("Горит!", 0.6)]])
        self.assertEqual(merged(first, second), [(0.0, "Ёлка горит.")])

    def test_a_disagreement_shows_both_hearings_in_place(self) -> None:
        first = response([[("Смотришь", 0.0), ("на", 0.5), ("кофе.", 1.0)]])
        second = response([[("Смотришь", 0.0), ("на", 0.5), ("код.", 1.0)]])
        self.assertEqual(
            merged(first, second), [(0.0, "Смотришь на [-кофе.-]{+код.+}")]
        )

    def test_a_stretch_only_the_second_heard_keeps_its_own_timecode(self) -> None:
        first = response([[("Раз.", 0.0)]], [[("Два.", 20.0)]])
        second = response(
            [[("Раз.", 0.0)]], [[("Вот", 9.0), ("это.", 9.5)]], [[("Два.", 20.0)]]
        )
        self.assertEqual(
            merged(first, second),
            [(0.0, "Раз."), (9.0, "{+Вот это.+}"), (20.0, "Два.")],
        )

    def test_one_word_heard_far_apart_is_no_agreement(self) -> None:
        first = response([[("был", 0.0), ("там.", 0.5)]])
        second = response([[("был", 10.0), ("там.", 10.5)]])
        self.assertEqual(
            merged(first, second),
            [(0.0, "[-был там.-]"), (10.0, "{+был там.+}")],
        )

    def test_a_response_merged_with_itself_is_its_sentences(self) -> None:
        r = response(
            [[("Раз", 0.0, 0.2), ("два.", 0.5)], [("Три.", 1.2)]],
            [[("Четыре.", 4.0)]],
        )
        self.assertEqual(
            merged(r, r), [(0.0, "Раз два."), (1.2, "Три."), (4.0, "Четыре.")]
        )

    def test_sentences_starting_in_one_second_share_a_line(self) -> None:
        r = response([[("Да.", 2.0)], [("Нет.", 2.6)]])
        self.assertEqual(merged(r, r), [(2.0, "Да. Нет.")])


if __name__ == "__main__":
    unittest.main()
