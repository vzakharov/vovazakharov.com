"""The order a row's keys are written in, where a class states one."""

from __future__ import annotations

import unittest
from dataclasses import fields

from lib.estimate_model import Estimate, Part
from lib.shape import to_json


class AnEstimatesKeys(unittest.TestCase):
    def test_open_on_its_subject_under_its_time(self) -> None:
        estimate = Estimate("a", [Part(1, "senior", "developer", "why")], subject_line="fix: a thing")
        self.assertEqual(list(to_json(estimate)), ["at", "subjectLine", "parts", "comment"])

    def test_name_every_field(self) -> None:
        self.assertEqual(sorted(Estimate.KEY_ORDER), sorted(f.name for f in fields(Estimate)))


if __name__ == "__main__":
    unittest.main()
