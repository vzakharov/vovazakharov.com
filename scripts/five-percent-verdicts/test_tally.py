#!/usr/bin/env python3
"""Runs the verdict ledger's parse and tally over temporary trees, so no fixture is committed.

Run by path (`python3 scripts/five-percent-verdicts/test_tally.py`), as `scripts/vet.sh` does.
"""

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from tally import Malformed, load, tally


def row(comment, verdict=1, about="a proposal", why="taken as proposed"):
    return {"comment": comment, "about": about, "verdict": verdict, "why": why}


class LedgerTest(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)

    def tearDown(self):
        self._tmp.cleanup()

    def write(self, branch, data):
        path = self.root / branch / "verdicts.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data) if not isinstance(data, str) else data, encoding="utf-8")

    def test_a_slashed_branch_is_its_nested_path(self):
        self.write("claude/five-percent-qryluk", {"pr": 212, "verdicts": [row(1)]})
        [only] = load(self.root)
        self.assertEqual(only["branch"], "claude/five-percent-qryluk")
        self.assertEqual(only["pr"], 212)

    def test_tally_sums_all_and_by_branch(self):
        self.write("a", {"pr": 1, "verdicts": [row(1, 0), row(2, 1)]})
        self.write("b", {"pr": 2, "verdicts": [row(3, 0.75)]})
        totals = tally(load(self.root))
        self.assertEqual(totals["all"], {"count": 3, "mean": 0.583})
        self.assertEqual(totals["byBranch"]["a"], {"count": 2, "mean": 0.5})

    def test_an_empty_tree_tallies_to_nothing(self):
        self.assertEqual(tally(load(self.root))["all"], {"count": 0, "mean": None})

    def test_malformed_rows_fail(self):
        cases = {
            "verdict above 1": {"pr": 1, "verdicts": [row(1, verdict=1.5)]},
            "verdict as a bool": {"pr": 1, "verdicts": [row(1, verdict=True)]},
            "about past 80": {"pr": 1, "verdicts": [row(1, about="x" * 81)]},
            "why past 280": {"pr": 1, "verdicts": [row(1, why="x" * 281)]},
            "why blank": {"pr": 1, "verdicts": [row(1, why=" ")]},
            "missing why": {"pr": 1, "verdicts": [{k: v for k, v in row(1).items() if k != "why"}]},
            "extra key": {"pr": 1, "verdicts": [{**row(1), "lens": "echo"}]},
            "missing pr": {"verdicts": [row(1)]},
            "not JSON": "{",
        }
        for name, data in cases.items():
            with self.subTest(name):
                self.write("x", data)
                with self.assertRaises(Malformed):
                    load(self.root)

    def test_one_comment_on_two_branches_fails(self):
        self.write("a", {"pr": 1, "verdicts": [row(7)]})
        self.write("b", {"pr": 2, "verdicts": [row(7)]})
        with self.assertRaisesRegex(Malformed, "comment 7"):
            load(self.root)


if __name__ == "__main__":
    unittest.main()
