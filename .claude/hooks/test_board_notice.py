#!/usr/bin/env python3
"""Drives `board-notice.py` as the harness does — a payload on stdin, a notice
or silence on stdout — over a scratch project and transcript.

Run by path (`python3 .claude/hooks/test_board_notice.py`), as `scripts/vet.sh`
does.
"""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from typing import Any, Dict, List

HOOK = Path(__file__).resolve().parent / "board-notice.py"
URL = "https://claude.ai/artifact/abc123"


def use(name: str, **given: Any) -> str:
    return json.dumps({"message": {"content": [{"type": "tool_use", "name": name, "input": given}]}})


class BoardNotice(unittest.TestCase):
    def setUp(self) -> None:
        self.dir = tempfile.TemporaryDirectory()
        self.root = Path(self.dir.name)
        (self.root / "docs" / "plans").mkdir(parents=True)
        self.transcript = self.root / "t.jsonl"

    def tearDown(self) -> None:
        self.dir.cleanup()

    def plan(self, text: str) -> None:
        (self.root / "docs" / "plans" / "p.paused.md").write_text(text)

    def run_hook(self, lines: List[str]) -> str:
        self.transcript.write_text("\n".join(lines) + "\n")
        payload: Dict[str, Any] = {
            "hook_event_name": "UserPromptSubmit",
            "cwd": str(self.root),
            "transcript_path": str(self.transcript),
        }
        done = subprocess.run(
            [sys.executable, str(HOOK)],
            input=json.dumps(payload),
            capture_output=True,
            text=True,
            check=True,
            env={"CLAUDE_PROJECT_DIR": str(self.root)},
        )
        return done.stdout

    def test_silent_without_a_board(self) -> None:
        self.plan("# A plan\n")
        self.assertEqual(self.run_hook([]), "")

    def test_names_both_calls_at_first(self) -> None:
        self.plan(f"**The plan is the board**: {URL},\nbuilt from …\n")
        text = json.loads(self.run_hook([]))["hookSpecificOutput"]["additionalContext"]
        self.assertIn("`watch`", text)
        self.assertIn("`open`", text)

    def test_names_only_what_is_missing(self) -> None:
        self.plan(f"**The plan is the board**: {URL}\n")
        out = self.run_hook([use("ArtifactComments", action="watch", url=URL)])
        text = json.loads(out)["hookSpecificOutput"]["additionalContext"]
        self.assertNotIn("`watch`", text)
        self.assertIn("`open`", text)

    def test_silent_once_watched_and_published(self) -> None:
        self.plan(f"**The plan is the board**: {URL}\n")
        lines = [use("ArtifactComments", action="watch", url=URL), use("Artifact", url=URL, file_path="x.html")]
        self.assertEqual(self.run_hook(lines), "")

    def test_a_stopped_watch_is_owed_again(self) -> None:
        self.plan(f"**The plan is the board**: {URL}\n")
        lines = [
            use("ArtifactComments", action="watch", url=URL),
            use("Artifact", action="open", url=URL),
            use("ArtifactComments", action="watch", url=URL, on=False),
        ]
        self.assertIn("`watch`", self.run_hook(lines))


if __name__ == "__main__":
    unittest.main()
