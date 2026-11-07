#!/usr/bin/env python3
"""What a row records of the human side of a session: the words the operator
typed, and the branch's lines per extension. What it protects is the line
between a person's words and everything else a transcript files as `user`.

Run by path (`python3 .claude/costs/test_contribution.py`), as `scripts/vet.sh`
does, so this directory is on `sys.path` for `lib`.
"""

from __future__ import annotations

import importlib
import json
import subprocess
import sys
import unittest
from dataclasses import replace
from pathlib import Path
from typing import get_args

from contribution import contribution_of, finished_by
from lib.branch_lines import extension_of, fold_numstat
from lib.estimate_model import Estimate, Part, Rates
from lib.identity import operator_words_of
from lib.rows import (
    ROOT,
    PostKind,
    SessionCost,
    add_pending_words,
    fold_posts,
    parse_session_cost,
    pending_words_path,
    read_pending_words,
    reshape,
    row_text,
)
from lib.tally import Tally
from lib.words import OperatorWords, parse_operator_words, post_words

COSTS = Path(__file__).resolve().parent


def _human_posts():
    """`gh_export` resolves only with `scripts/` on the path. Appended, so this
    directory's `lib` still comes before `scripts/lib`."""
    sys.path.append(str(ROOT / "scripts"))
    return importlib.import_module("gh_export.review_words").human_posts


human_posts = _human_posts()

HUMAN = {"kind": "human"}


class ChatWords(unittest.TestCase):
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

    def test_lines_net_out_per_extension_and_binaries_are_left_out(self) -> None:
        numstat = "10\t2\tsrc/a.ts\n3\t0\tsrc/b.ts\n-\t-\timg.png\n-\t-\tmap.webp\n4\t4\tREADME.md\n"
        self.assertEqual(fold_numstat(numstat), {".ts": 11, ".md": 0})


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

    def test_the_fields_survive_a_round_trip(self) -> None:
        row = replace(
            self.ROW,
            operator_words=OperatorWords(42, 5, 3),
            review_posts={"PRRC_1": 5},
            thread_posts={"c_1": 3},
            branch_lines={".ts": 7},
        )
        back = parse_session_cost(row_text(row))
        self.assertEqual(
            (back.operator_words, back.review_posts, back.thread_posts, back.branch_lines),
            (OperatorWords(42, 5, 3), {"PRRC_1": 5}, {"c_1": 3}, {".ts": 7}),
        )

    def test_a_row_written_before_them_parses_as_null(self) -> None:
        back = parse_session_cost(row_text(self.ROW))
        self.assertEqual(
            (back.operator_words, back.review_posts, back.thread_posts, back.branch_lines), (None, {}, {}, None)
        )

    def test_words_written_before_threads_were_counted_read_as_none_in_threads(self) -> None:
        self.assertEqual(parse_operator_words({"chat": 4, "review": 2}, "old"), OperatorWords(4, 2, 0))

    def test_a_bare_word_count_reads_as_chat_and_is_rewritten_split(self) -> None:
        old = json.loads(row_text(self.ROW))
        old["operatorWords"] = 42
        del old["reviewPosts"]
        row, changes = reshape(json.dumps(old), "old")
        self.assertEqual((row.operator_words, row.review_posts), (OperatorWords(42, 0), {}))
        self.assertIn("split operatorWords into chat and review", changes)
        self.assertEqual(json.loads(row_text(row))["operatorWords"], {"chat": 42, "review": 0, "threads": 0})


class ReviewWords(unittest.TestCase):
    def test_quoted_lines_and_fenced_blocks_are_not_the_posters_words(self) -> None:
        body = "> you said this\n> and this\nно я про другое\n```suggestion\nconst x = 1\n```\n  ~~~\nlog\n~~~\nok"
        self.assertEqual(post_words(body), 5)

    def test_an_unclosed_fence_runs_to_the_end(self) -> None:
        self.assertEqual(post_words("one two\n```\nthree four"), 2)

    def test_only_a_persons_posts_with_prose_are_handed_on(self) -> None:
        footer = "\n\n---\n_Generated by [Claude Code](https://claude.ai/code)_"
        reviews = [{"node_id": "PRR_a", "body": "looks off"}, {"node_id": "PRR_b", "body": ""}]
        thread = [{"node_id": "PRRC_c", "body": "fixed in abc" + footer}, {"node_id": "PRRC_d", "body": "а тут?"}]
        conversation = [{"node_id": "IC_e", "body": "done" + footer}]
        self.assertEqual(
            human_posts(conversation, reviews, thread), {"PRR_a": "looks off", "PRRC_d": "а тут?"}
        )


class PendingPostWords(unittest.TestCase):
    SID = "test-post-words-fold"

    def tearDown(self) -> None:
        for kind in get_args(PostKind):
            pending_words_path(kind, self.SID).unlink(missing_ok=True)

    def test_the_stop_write_folds_the_pending_posts_over_the_previous_rows(self) -> None:
        add_pending_words("review", self.SID, {"a": 3, "b": 4})
        add_pending_words("review", self.SID, {"b": 6})
        self.assertEqual(read_pending_words("review", self.SID), {"a": 3, "b": 6})
        cost = replace(RowShape.ROW, operator_words=OperatorWords(10, 0))
        fold_posts(cost, "review", {"old": 2, "a": 1}, read_pending_words("review", self.SID))
        self.assertEqual(cost.review_posts, {"old": 2, "a": 3, "b": 6})
        self.assertEqual(cost.operator_words, OperatorWords(10, 11))

    def test_thread_posts_fold_beside_review_posts_without_touching_them(self) -> None:
        cost = replace(RowShape.ROW, operator_words=OperatorWords(10, 0))
        fold_posts(cost, "review", {"PRR_a": 4})
        fold_posts(cost, "thread", {"c_1": 2}, {"c_1": 5, "c_2": 1})
        self.assertEqual((cost.review_posts, cost.thread_posts), ({"PRR_a": 4}, {"c_1": 5, "c_2": 1}))
        self.assertEqual(cost.operator_words, OperatorWords(10, 4, 6))

    def record(self, kind: str, posts: dict) -> None:
        subprocess.run(
            [sys.executable, str(COSTS / "post_words.py"), "--kind", kind, "--session", self.SID],
            input=json.dumps(posts),
            text=True,
            check=True,
        )

    def test_the_recorder_counts_bodies_into_the_pending_file(self) -> None:
        self.record("review", {"PRRC_x": "> quoted away\nтри слова тут", "IC_y": "```\ncode\n```"})
        self.assertEqual(read_pending_words("review", self.SID), {"PRRC_x": 3})

    def test_a_board_threads_file_is_recorded_as_thread_words(self) -> None:
        self.record("thread", {"c_1": "тут ссылки кликабельные должны быть"})
        self.assertEqual(read_pending_words("thread", self.SID), {"c_1": 5})
        self.assertEqual(read_pending_words("review", self.SID), {})


class BranchSummary(unittest.TestCase):
    RATES = Rates(roles={"developer": 1.0, "copywriter": 0.5}, grades={"senior": 1.0})

    def row(self, sid: str, start: str, end: str, usd: float, words=None, lines=None, branch="b", hours=None, posts=None):
        estimate = None if hours is None else Estimate(at=end, parts=[Part(hours, "senior", "copywriter")])
        posts = posts or {}
        return replace(
            RowShape.ROW,
            session_id=sid,
            branch=branch,
            first_response_at=start,
            last_response_at=end,
            total=Tally(cost_usd=usd),
            operator_words=None if words is None else OperatorWords(words, sum(posts.values())),
            review_posts=posts,
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
        self.assertEqual((got.usd, got.senior_hours, got.operator_words), (3.0, 2.0, OperatorWords(8, 0)))
        self.assertEqual((got.branch_lines, got.words_are_a_floor), ({".ts": 9}, False))

    def test_a_post_two_sessions_exported_counts_once(self) -> None:
        rows = [
            self.row("one", "t1", "t2", 1.0, words=3, posts={"PRR_a": 10, "PRRC_b": 4}),
            self.row("two", "t3", "t4", 1.0, words=2, posts={"PRRC_b": 5, "IC_c": 1}),
        ]
        got = contribution_of("b", rows, self.RATES)
        self.assertEqual(got.operator_words, OperatorWords(chat=5, review=16))

    def test_a_thread_comment_two_sessions_recorded_counts_once(self) -> None:
        rows = [
            replace(self.row("one", "t1", "t2", 1.0, words=3), thread_posts={"c_1": 4, "c_2": 2}),
            replace(self.row("two", "t3", "t4", 1.0, words=2), thread_posts={"c_2": 2, "c_3": 7}),
        ]
        got = contribution_of("b", rows, self.RATES)
        self.assertEqual(got.operator_words, OperatorWords(chat=5, review=0, threads=13))

    def test_a_row_without_words_is_a_floor_unless_a_finished_session_fills_it(self) -> None:
        then = [self.row("done", "t1", "t2", 1.0), self.row("running", "t3", "t4", 1.0)]
        later = [
            self.row("done", "t1", "t2", 1.0, words=7, posts={"PRR_a": 2}),
            self.row("running", "t3", "t9", 2.0, words=4, posts={"PRR_b": 9}),
        ]
        got = contribution_of("b", then, self.RATES, finished_by(later, "t5"))
        self.assertEqual((got.operator_words, got.words_are_a_floor), (OperatorWords(7, 2), True))


if __name__ == "__main__":
    unittest.main()
