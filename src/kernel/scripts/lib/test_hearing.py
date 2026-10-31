#!/usr/bin/env python3
"""Runs `lib/hearing.py` over hand-built responses.

Run by path (`python3 scripts/lib/test_hearing.py`), as `scripts/vet.sh` does.
"""

from __future__ import annotations

import math
import sys
import unittest
from pathlib import Path
from typing import Any, Optional

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from lib.hearing import (
    doubts,
    from_segments,
    mark,
    marked,
    merged,
    paragraphs,
    words_from_tokens,
)

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

    def test_a_repeated_chorus_pairs_with_its_own_time(self) -> None:
        chorus = ("Где", "же", "ты?")
        first = response(
            [[(w, 10.0 + k) for k, w in enumerate(chorus)]],
            [[("Раз.", 20.0)]],
            [[(w, 30.0 + k) for k, w in enumerate(chorus)]],
        )
        second = response(
            [[(w, 10.0 + k) for k, w in enumerate(chorus)]],
            [[("Два.", 20.0)]],
            [[(w, 30.0 + k) for k, w in enumerate(chorus)]],
        )
        self.assertEqual(
            merged(first, second),
            [(10.0, "Где же ты?"), (20.0, "[-Раз.-]{+Два.+}"), (30.0, "Где же ты?")],
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


def segment(start: float, *words: Spoken) -> dict[str, Any]:
    """A faster-whisper segment: words carry their leading space and a
    probability."""
    return {
        "start": start,
        "end": words[-1][1] + 0.4 if words else start,
        "text": "".join(f" {w[0]}" for w in words),
        "words": [
            {"word": f" {text}", "start": at, "end": at + 0.4, "probability": 0.9}
            for text, at in words
        ],
    }


class FromSegments(unittest.TestCase):
    def test_a_segment_starts_at_its_first_word(self) -> None:
        r = from_segments([segment(0.0, ("Всё", 20.0), ("кончается,", 20.5))], 60.0, "w")
        line = paragraphs(r)[0][0]
        self.assertEqual(line["start"], 20.0)
        self.assertEqual([w["word"] for w in line["words"]], ["всё", "кончается"])
        self.assertEqual(r["metadata"], {"duration": 60.0, "model": "w"})

    def test_bare_punctuation_and_empty_segments_drop(self) -> None:
        r = from_segments([segment(0.0, ("Да", 1.0), ("…", 1.5)), segment(5.0)], 9.0, "w")
        self.assertEqual(len(r["results"]["channels"][0]["alternatives"][0]["words"]), 1)
        self.assertEqual(len(paragraphs(r)[0]), 1)

    def test_nothing_heard_is_no_speech(self) -> None:
        self.assertEqual(paragraphs(from_segments([], 9.0, "w")), [])

    def test_a_long_segment_is_cut_into_its_sentences(self) -> None:
        r = from_segments(
            [segment(0.0, ("Так.", 1.0), ("Вчера", 2.0), ("болела?", 2.5), ("Да", 4.0))],
            9.0,
            "w",
        )
        self.assertEqual(
            [(s["start"], s["text"]) for s in paragraphs(r)[0]],
            [(1.0, "Так."), (2.0, "Вчера болела?"), (4.0, "Да")],
        )

    def test_it_merges_with_a_deepgram_response(self) -> None:
        first = response([[("Где", 58.0), ("же", 58.3), ("ты,", 58.6), ("двойник?", 59.0)]])
        second = from_segments(
            [segment(57.0, ("Где", 58.1), ("же", 58.4), ("ты,", 58.7), ("двойник", 59.1))],
            240.0,
            "w",
        )
        self.assertEqual(merged(first, second), [(58.0, "Где же ты, двойник?")])


class WordsFromTokens(unittest.TestCase):
    def test_a_word_opens_on_a_space_and_ends_where_the_next_starts(self) -> None:
        found = words_from_tokens([" при", "вет", ",", " мир"], [1.0, 1.2, 1.4, 2.0], None, 2.5)
        self.assertEqual(
            [(w["word"], w["start"], w["end"]) for w in found],
            [("привет,", 1.0, 2.0), ("мир", 2.0, 2.5)],
        )

    def test_sentencepiece_marks_open_a_word_too(self) -> None:
        found = words_from_tokens(["▁Hal", "lo", "▁Welt"], [0.0, 0.1, 0.5], None, 1.0)
        self.assertEqual([w["word"] for w in found], ["Hallo", "Welt"])

    def test_a_word_is_as_sure_as_its_least_sure_token(self) -> None:
        found = words_from_tokens(
            [" при", "вет"], [0.0, 0.2], [math.log(0.9), math.log(0.3)], 1.0
        )
        self.assertAlmostEqual(found[0]["probability"], 0.3)

    def test_no_logprobs_leaves_the_line_unmarked(self) -> None:
        r = from_segments(
            [{"text": "", "words": words_from_tokens([" да"], [0.0], None, 1.0)}], 1.0, "g"
        )
        self.assertEqual(marked(paragraphs(r)[0][0], 0.95), "да")


if __name__ == "__main__":
    unittest.main()
