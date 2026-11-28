#!/usr/bin/env python3
"""Drives `relay-watch-gate.py` as the harness does — a Stop payload on stdin,
a block or silence on stdout — over a scratch transcript.

Run by path (`python3 .claude/hooks/test_relay_watch_gate.py`), as
`scripts/vet.sh` does.
"""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from typing import Any, List

HOOK = Path(__file__).resolve().parent / "relay-watch-gate.py"
URL = "https://claude.ai/artifact/abc123"
RELAY = "python3 scripts/relay-last-reply.py docs/x/relay-2.md"


def use(name: str, **given: Any) -> str:
    return json.dumps({"message": {"role": "assistant", "content": [{"type": "tool_use", "name": name, "input": given}]}})


def turn(text: str = "go on") -> str:
    return json.dumps({"type": "user", "message": {"role": "user", "content": text}})


def tool_result() -> str:
    return json.dumps({"type": "user", "message": {"role": "user", "content": [{"type": "tool_result", "content": "ok"}]}})


class RelayWatchGate(unittest.TestCase):
    def setUp(self) -> None:
        self.dir = tempfile.TemporaryDirectory()
        self.transcript = Path(self.dir.name) / "t.jsonl"

    def tearDown(self) -> None:
        self.dir.cleanup()

    def run_hook(self, lines: List[str], active: bool = False) -> str:
        self.transcript.write_text("\n".join(lines) + "\n")
        payload = {"hook_event_name": "Stop", "transcript_path": str(self.transcript), "stop_hook_active": active}
        done = subprocess.run(
            [sys.executable, str(HOOK)], input=json.dumps(payload), capture_output=True, text=True, check=True
        )
        return done.stdout

    def test_blocks_a_relay_leaving_a_watch_standing(self) -> None:
        lines = [turn(), use("ArtifactComments", action="watch", url=URL), turn("park"), use("Bash", command=RELAY), tool_result()]
        out = json.loads(self.run_hook(lines))
        self.assertEqual(out["decision"], "block")
        self.assertIn(URL, out["reason"])

    def test_passes_once_listed_and_stopped(self) -> None:
        lines = [
            turn(),
            use("ArtifactComments", action="watch", url=URL),
            turn("park"),
            use("ArtifactComments", action="watch"),
            tool_result(),
            use("ArtifactComments", action="watch", url=URL, on=False),
            tool_result(),
            use("Bash", command=RELAY),
        ]
        self.assertEqual(self.run_hook(lines), "")

    def test_stopping_without_a_listing_blocks(self) -> None:
        lines = [
            turn(),
            use("Artifact", file_path="board.html"),
            turn("park"),
            use("ArtifactComments", action="watch", url=URL, on=False),
            use("Bash", command=RELAY),
        ]
        out = json.loads(self.run_hook(lines))
        self.assertEqual(out["decision"], "block")
        self.assertNotIn("still watched here", out["reason"])

    def test_a_listing_before_the_last_arming_does_not_count(self) -> None:
        lines = [turn(), use("ArtifactComments", action="watch"), use("Artifact", file_path="b.html"), turn("park"), use("Bash", command=RELAY)]
        self.assertIn("block", self.run_hook(lines))

    def test_a_watch_armed_after_the_relay_is_a_return(self) -> None:
        lines = [
            turn(),
            use("ArtifactComments", action="watch", url=URL),
            turn("park"),
            use("ArtifactComments", action="watch"),
            use("ArtifactComments", action="watch", url=URL, on=False),
            use("Bash", command=RELAY),
            turn("I'm back"),
            use("ArtifactComments", action="watch", url=URL),
        ]
        self.assertEqual(self.run_hook(lines), "")
        lines += [turn("park again"), use("Bash", command=RELAY)]
        self.assertIn("block", self.run_hook(lines))

    def test_silent_on_a_turn_that_ran_no_relay(self) -> None:
        lines = [turn(), use("ArtifactComments", action="watch", url=URL), turn("more"), use("Bash", command="git status")]
        self.assertEqual(self.run_hook(lines), "")

    def test_silent_for_a_session_that_never_armed_a_watch(self) -> None:
        lines = [turn("park"), use("Bash", command=RELAY)]
        self.assertEqual(self.run_hook(lines), "")

    def test_lets_the_second_stop_through(self) -> None:
        lines = [turn(), use("ArtifactComments", action="watch", url=URL), turn("park"), use("Bash", command=RELAY)]
        self.assertEqual(self.run_hook(lines, active=True), "")


if __name__ == "__main__":
    unittest.main()
