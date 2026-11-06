#!/usr/bin/env python3
"""What a row records of the human side of a session: the words the operator
typed, and the branch's lines per extension. What it protects is the line
between a person's words and everything else a transcript files as `user`.

Run by path (`python3 .claude/costs/test_contribution.py`), as `scripts/vet.sh`
does, which puts this directory on `sys.path` for `lib`.
"""

from __future__ import annotations

import unittest
from dataclasses import replace

from lib.branch_lines import extension_of, fold_numstat
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


if __name__ == "__main__":
    unittest.main()
