#!/usr/bin/env python3
"""What a row records of the human side of a session: the words the operator
typed, and the branch's lines per extension. What it protects is the line
between a person's words and everything else a transcript files as `user`.

Run by path (`python3 .claude/costs/test_contribution.py`), as `scripts/vet.sh`
does, so this directory is on `sys.path` for `lib`.
"""

from __future__ import annotations

import unittest
from dataclasses import replace

from contribution import contribution_of, finished_by
from lib.branch_lines import extension_of, fold_numstat
from lib.estimate_model import Estimate, Part, Rates
from lib.identity import operator_words_of
from lib.rows import SessionCost, parse_session_cost, row_text
from lib.tally import Tally

HUMAN = {"kind": "human"}


class OperatorWords(unittest.TestCase):
    def test_a_typed_prompt_counts(self) -> None:
        record = {"type": "user", "origin": HUMAN, "message": {"content": "давай mammoth, ок?"}}
        self.assertEqual(operator_words_of(record), 3)

    def test_only_the_text_blocks_of_a_prompt_with_an_image_count(self) -> None:
        content = [{"type": "image", "source": {}}, {"type": "text", "text": "fya"}]
        record = {"type": "user", "origin": HUMAN, "message": {"content": content}}
        self.assertEqual(operator_words_of(record), 1)

    def test_a_message_sent_mid_turn_counts(self) -> None:
        attachment = {"type": "queued_command", "origin": HUMAN, "prompt": "и строки кода"}
        self.assertEqual(operator_words_of({"type": "attachment", "attachment": attachment}), 3)

    def test_nothing_without_a_human_origin_counts(self) -> None:
        tool_result = {"type": "user", "message": {"content": [{"type": "tool_result", "content": "x y"}]}}
        injected = {"type": "user", "isMeta": True, "message": {"content": "skill body words"}}
        hand_back = {
            "type": "attachment",
            "attachment": {"type": "queued_command", "origin": {"kind": "peer"}, "prompt": "a b c"},
        }
        for record in (tool_result, injected, hand_back):
            self.assertEqual(operator_words_of(record), 0)


class BranchLines(unittest.TestCase):
    def test_a_rename_is_filed_under_its_new_side(self) -> None:
        self.assertEqual(extension_of("a.md => b.ts"), ".ts")
        self.assertEqual(extension_of("src/{old => new}/x.py"), ".py")
        self.assertEqual(extension_of("sites/vova/public/CNAME"), "CNAME")
        self.assertEqual(extension_of(".nojekyll"), ".nojekyll")

    def test_lines_net_out_per_extension_and_binaries_carry_none(self) -> None:
        numstat = "10\t2\tsrc/a.ts\n3\t0\tsrc/b.ts\n-\t-\timg.png\n4\t4\tREADME.md\n"
        self.assertEqual(fold_numstat(numstat), {".ts": 11, ".png": 0, ".md": 0})


class RowShape(unittest.TestCase):
    ROW = SessionCost(
        session_id="sess",
        branch=None,
        cwd=None,
        opening_prompt=None,
        prs=[],
        url=None,
        operator=None,
        first_response_at=None,
        last_response_at=None,
        prices_as_of="2026-01-01",
        claude_code_total_usd=None,
        total=Tally(),
        own_turns=Tally(),
        subagents=Tally(),
        by_rate={},
        warnings=[],
    )

    def test_both_fields_survive_a_round_trip(self) -> None:
        row = replace(self.ROW, operator_words=42, branch_lines={".ts": 7})
        back = parse_session_cost(row_text(row))
        self.assertEqual((back.operator_words, back.branch_lines), (42, {".ts": 7}))

    def test_a_row_written_before_them_parses_as_null(self) -> None:
        back = parse_session_cost(row_text(self.ROW))
        self.assertEqual((back.operator_words, back.branch_lines), (None, None))


class BranchSummary(unittest.TestCase):
    RATES = Rates(roles={"developer": 1.0, "copywriter": 0.5}, grades={"senior": 1.0})

    def row(self, sid: str, start: str, end: str, usd: float, words=None, lines=None, branch="b", hours=None):
        estimate = None if hours is None else Estimate(at=end, parts=[Part(hours, "senior", "copywriter")])
        return replace(
            RowShape.ROW,
            session_id=sid,
            branch=branch,
            first_response_at=start,
            last_response_at=end,
            total=Tally(cost_usd=usd),
            operator_words=words,
            branch_lines=lines,
            estimate=estimate,
        )

    def test_the_branchs_sessions_sum_in_start_order_and_the_last_lines_stand(self) -> None:
        rows = [
            self.row("two", "2026-01-02", "2026-01-02", 2.0, words=5, lines={".ts": 9}),
            self.row("one", "2026-01-01", "2026-01-01", 1.0, words=3, lines={".ts": 4}, hours=4),
            self.row("other", "2026-01-01", "2026-01-01", 9.0, words=99, branch="c"),
        ]
        got = contribution_of("b", rows, self.RATES)
        self.assertEqual([s.usd for s in got.sessions], [1.0, 2.0])
        self.assertEqual((got.usd, got.senior_hours, got.operator_words), (3.0, 2.0, 8))
        self.assertEqual((got.branch_lines, got.words_are_a_floor), ({".ts": 9}, False))

    def test_a_row_without_words_is_a_floor_unless_a_finished_session_fills_it(self) -> None:
        then = [self.row("done", "t1", "t2", 1.0), self.row("running", "t3", "t4", 1.0)]
        later = [self.row("done", "t1", "t2", 1.0, words=7), self.row("running", "t3", "t9", 2.0, words=4)]
        got = contribution_of("b", then, self.RATES, finished_by(later, "t5"))
        self.assertEqual((got.operator_words, got.words_are_a_floor), (7, True))


if __name__ == "__main__":
    unittest.main()
