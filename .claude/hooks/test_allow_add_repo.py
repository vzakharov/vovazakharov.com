#!/usr/bin/env python3
"""Drives `allow-add-repo.py` as the harness does — a payload on stdin, a
decision or silence on stdout.

Run by path (`python3 .claude/hooks/test_allow_add_repo.py`), as
`scripts/vet.sh` does.
"""

from __future__ import annotations

import json
import subprocess
import sys
import unittest
from pathlib import Path
from typing import Any, Dict

HOOK = Path(__file__).resolve().parent / "allow-add-repo.py"
TOOL = "mcp__claude-code-remote__add_repo"


def run(payload: str) -> str:
    done = subprocess.run(
        [sys.executable, str(HOOK)], input=payload, capture_output=True, text=True, check=True
    )
    return done.stdout


def call(tool_name: str = TOOL, **tool_input: Any) -> str:
    payload: Dict[str, Any] = {"tool_name": tool_name, "tool_input": tool_input}
    return run(json.dumps(payload))


class AllowAddRepo(unittest.TestCase):
    def assertAllowed(self, out: str) -> None:
        self.assertEqual(json.loads(out)["hookSpecificOutput"]["permissionDecision"], "allow")

    def test_allows_the_owner(self) -> None:
        self.assertAllowed(call(owner="vovas-music", repo="some-song"))

    def test_allows_a_push(self) -> None:
        self.assertAllowed(call(owner="vovas-music", repo="some-song", access="push"))

    def test_owner_is_case_insensitive(self) -> None:
        self.assertAllowed(call(owner="Vovas-Music", repo="some-song"))

    def test_silent_on_another_owner(self) -> None:
        self.assertEqual(call(owner="vzakharov", repo="muthur"), "")

    def test_silent_on_an_owner_that_only_contains_it(self) -> None:
        self.assertEqual(call(owner="vovas-music-fork", repo="some-song"), "")

    def test_silent_when_the_repo_carries_the_owner(self) -> None:
        self.assertEqual(call(owner="vzakharov", repo="vovas-music/some-song"), "")

    def test_silent_on_another_tool(self) -> None:
        self.assertEqual(call("mcp__other__add_repo", owner="vovas-music", repo="x"), "")

    def test_silent_without_an_owner(self) -> None:
        self.assertEqual(call(repo="some-song"), "")

    def test_silent_on_an_unreadable_payload(self) -> None:
        self.assertEqual(run("not json"), "")
        self.assertEqual(run("[]"), "")


if __name__ == "__main__":
    unittest.main()
