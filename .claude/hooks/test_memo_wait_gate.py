#!/usr/bin/env python3
"""Drives `memo-wait-gate.py` as the harness does — a Stop payload on stdin, a
block or silence on stdout — over a scratch transcript and project root.

Run by path (`python3 .claude/hooks/test_memo_wait_gate.py`), as
`scripts/vet.sh` does.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from typing import Any, List

HOOK = Path(__file__).resolve().parent / "memo-wait-gate.py"
WORKING_DIR = Path(__file__).resolve().parents[2] / "scripts" / "working-dir.sh"
WAIT = "python3 scripts/memo/memo.py wait --as lead --branch island/bite-2"


def use(name: str, ident: str = "t1", **given: Any) -> str:
    block = {"type": "tool_use", "id": ident, "name": name, "input": given}
    return json.dumps({"message": {"role": "assistant", "content": [block]}})


def started(ident: str, task: str) -> str:
    text = f"Command running in background with ID: {task}. Output is being written to: x."
    block = {"type": "tool_result", "tool_use_id": ident, "content": text}
    return json.dumps({"type": "user", "message": {"role": "user", "content": [block]}})


def notified(task: str) -> str:
    text = f"<task-notification>\n<task-id>{task}</task-id>\n<status>completed</status>\n</task-notification>"
    return json.dumps({"type": "user", "message": {"role": "user", "content": text}})


def prompt(text: str = "go on") -> str:
    return json.dumps({"type": "user", "origin": {"kind": "human"}, "message": {"role": "user", "content": text}})


class MemoWaitGate(unittest.TestCase):
    def setUp(self) -> None:
        self.dir = tempfile.TemporaryDirectory()
        self.root = Path(self.dir.name)
        self.transcript = self.root / "t.jsonl"
        scripts = self.root / "scripts"
        scripts.mkdir()
        shutil.copy(WORKING_DIR, scripts / "working-dir.sh")
        subprocess.run(["git", "init", "-q", "-b", "island/bite-2"], cwd=self.root, check=True)

    def tearDown(self) -> None:
        self.dir.cleanup()

    def run_hook(self, lines: List[str], active: bool = False) -> str:
        self.transcript.write_text("\n".join(lines) + "\n")
        payload = {"hook_event_name": "Stop", "transcript_path": str(self.transcript), "stop_hook_active": active}
        env = {**os.environ, "CLAUDE_PROJECT_DIR": str(self.root)}
        done = subprocess.run(
            [sys.executable, str(HOOK)], input=json.dumps(payload), capture_output=True, text=True, check=True, env=env
        )
        return done.stdout

    def channel(self) -> None:
        where = self.root / "docs" / "remove-before-merging" / "island" / "bite-2"
        where.mkdir(parents=True)
        (where / "memo.md").write_text("## lead · 2026-11-09 05:00:00 UTC\n\nA brief.\n")

    def test_silent_off_any_channel(self) -> None:
        self.assertEqual(self.run_hook([prompt(), use("Bash", command="git status")]), "")

    def test_blocks_a_member_branch_with_no_wait(self) -> None:
        self.channel()
        out = json.loads(self.run_hook([prompt()]))
        self.assertEqual(out["decision"], "block")
        self.assertIn("memo.md", out["reason"])

    def test_passes_with_a_wait_running(self) -> None:
        self.channel()
        lines = [prompt(), use("Bash", "w1", command=WAIT, run_in_background=True), started("w1", "abc")]
        self.assertEqual(self.run_hook(lines), "")

    def test_blocks_a_lead_whose_wait_woke_and_was_not_rearmed(self) -> None:
        lines = [prompt(), use("Bash", "w1", command=WAIT, run_in_background=True), started("w1", "abc"), notified("abc")]
        self.assertIn("block", self.run_hook(lines))
        lines += [use("Bash", "w2", command=WAIT, run_in_background=True), started("w2", "def")]
        self.assertEqual(self.run_hook(lines), "")

    def test_a_stopped_wait_no_longer_counts(self) -> None:
        lines = [prompt(), use("Bash", "w1", command=WAIT, run_in_background=True), started("w1", "abc"), use("TaskStop", task_id="abc")]
        self.assertIn("block", self.run_hook(lines))

    def test_a_foreground_post_joins_without_waiting(self) -> None:
        post = "python3 scripts/memo/memo.py post --as lead --branch b -"
        self.assertIn("block", self.run_hook([prompt(), use("Bash", command=post)]))

    def test_a_relay_hands_the_channel_on_until_the_operator_returns(self) -> None:
        self.channel()
        lines = [prompt("park"), use("Bash", command="python3 scripts/relay-last-reply.py x/relay-2.md")]
        self.assertEqual(self.run_hook(lines), "")
        self.assertIn("block", self.run_hook(lines + [prompt("I'm back")]))

    def test_lets_the_second_stop_through(self) -> None:
        self.channel()
        self.assertEqual(self.run_hook([prompt()], active=True), "")


if __name__ == "__main__":
    unittest.main()
