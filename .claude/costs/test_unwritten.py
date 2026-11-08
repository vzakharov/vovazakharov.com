"""The keys a row lacks against what the current writer writes."""

from __future__ import annotations

import json
import unittest
from dataclasses import replace

from lib.estimate_model import Estimate, Part
from lib.rows import parse_session_cost, row_text
from lib.shape import unwritten
from test_estimate import ROW


def lacking(raw: dict) -> list:
    return unwritten(parse_session_cost(json.dumps(raw)), raw)


class AWrittenRow(unittest.TestCase):
    def test_lacks_nothing(self) -> None:
        self.assertEqual(lacking(json.loads(row_text(ROW))), [])

    def test_keeps_a_free_form_maps_keys_as_data(self) -> None:
        self.assertEqual(lacking(json.loads(row_text(replace(ROW, branch_lines={".ts": 4})))), [])


class AnOlderRow(unittest.TestCase):
    def test_lacks_the_keys_its_writer_predates(self) -> None:
        raw = json.loads(row_text(ROW))
        del raw["threadPosts"]
        raw["operatorWords"] = {"chat": 3, "review": 0}
        self.assertEqual(lacking(raw), ["operatorWords.threads", "threadPosts"])

    def test_is_followed_into_a_list_of_parts(self) -> None:
        estimate = Estimate("a", [Part(1, "senior", "developer", "why")], subject_line="fix: a thing")
        raw = {
            "at": "a",
            "subjectLine": "fix: a thing",
            "parts": [{"hours": 1, "grade": "senior", "role": "developer"}],
            "comment": None,
        }
        self.assertEqual(unwritten(estimate, raw), ["parts[0].comment"])


if __name__ == "__main__":
    unittest.main()
