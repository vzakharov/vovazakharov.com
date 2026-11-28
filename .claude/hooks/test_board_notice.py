#!/usr/bin/env python3
"""Drives `board-notice.py` as the harness does — a payload on stdin, a notice
or silence on stdout — over a scratch project and transcript.

Run by path (`python3 .claude/hooks/test_board_notice.py`), as `scripts/vet.sh`
does.
"""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from typing import Any, Dict, List

HOOK = Path(__file__).resolve().parent / "board-notice.py"
WORKING_DIR = Path(__file__).resolve().parents[2] / "scripts" / "working-dir.sh"
URL = "https://claude.ai/artifact/abc123"
ORG = "0a1b2c3d-0000-4000-8000-000000000001"
OTHER_ORG = "0a1b2c3d-0000-4000-8000-000000000002"
STRANGER = "0a1b2c3d-0000-4000-8000-000000000003"
OTHER_URL = "https://claude.ai/artifact/def456"


def key(organization: str) -> str:
    return hashlib.sha256(organization.encode()).hexdigest()[:12]


BOARD = f"**The plan is the board**, a copy per account:\n\n- `{key(ORG)}`: {URL}\n- `{key(OTHER_ORG)}`: {OTHER_URL}\n\nBuilt from …\n"


def use(name: str, **given: Any) -> str:
    return json.dumps({"message": {"role": "assistant", "content": [{"type": "tool_use", "name": name, "input": given}]}})


def prompt(text: str) -> str:
    return json.dumps({"type": "user", "origin": {"kind": "human"}, "message": {"role": "user", "content": text}})


def result() -> str:
    """A turn the operator did not send: a background task's notification."""
    return json.dumps({"type": "user", "origin": {"kind": "task-notification"}, "message": {"role": "user", "content": "done"}})


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

    def run_hook(self, lines: List[str], organization: str = ORG) -> str:
        self.transcript.write_text("\n".join(lines) + "\n")
        payload: Dict[str, Any] = {
            "hook_event_name": "UserPromptSubmit",
            "cwd": str(self.root),
            "transcript_path": str(self.transcript),
        }
        env = {"CLAUDE_PROJECT_DIR": str(self.root)}
        if organization:
            env["CLAUDE_CODE_ORGANIZATION_UUID"] = organization
        done = subprocess.run(
            [sys.executable, str(HOOK)],
            input=json.dumps(payload),
            capture_output=True,
            text=True,
            check=True,
            env=env,
        )
        return done.stdout

    def test_silent_without_a_board(self) -> None:
        self.plan("# A plan\n")
        self.assertEqual(self.run_hook([]), "")

    def test_names_this_organizations_copy_only(self) -> None:
        self.plan(BOARD)
        self.assertIn(URL, self.run_hook([]))
        self.assertNotIn(OTHER_URL, self.run_hook([]))
        other = self.run_hook([], organization=OTHER_ORG)
        self.assertIn(OTHER_URL, other)
        self.assertNotIn(URL, other)

    def test_asks_for_a_copy_where_the_organization_has_none(self) -> None:
        self.plan(BOARD)
        text = json.loads(self.run_hook([], organization=STRANGER))["hookSpecificOutput"]["additionalContext"]
        self.assertIn(f"- `{key(STRANGER)}`: <artifact url>", text)
        self.assertNotIn(URL, text)

    def test_silent_without_an_organization(self) -> None:
        self.plan(BOARD)
        self.assertEqual(self.run_hook([], organization=""), "")

    def test_reads_an_item_prettier_wrapped(self) -> None:
        self.plan(f"**The plan is the board**, a copy per account:\n\n- `{key(ORG)}`:\n  {URL}\n\nBuilt from …\n")
        self.assertIn(URL, self.run_hook([]))

    def test_the_list_ends_at_the_first_line_after_it(self) -> None:
        self.plan(f"{BOARD}\n- `{key(STRANGER)}`: https://claude.ai/artifact/zzz\n")
        self.assertIn("no line for", self.run_hook([], organization=STRANGER))

    def test_names_both_calls_at_first(self) -> None:
        self.plan(BOARD)
        text = json.loads(self.run_hook([]))["hookSpecificOutput"]["additionalContext"]
        self.assertIn("`watch`", text)
        self.assertIn("`open`", text)

    def test_names_only_what_is_missing(self) -> None:
        self.plan(BOARD)
        out = self.run_hook([use("ArtifactComments", action="watch", url=URL)])
        text = json.loads(out)["hookSpecificOutput"]["additionalContext"]
        self.assertNotIn("`watch`", text)
        self.assertIn("`open`", text)

    def context(self, lines: List[str]) -> str:
        return json.loads(self.run_hook(lines))["hookSpecificOutput"]["additionalContext"]

    def test_once_watched_and_opened_names_the_publish_rule(self) -> None:
        self.plan(BOARD)
        text = self.context([use("ArtifactComments", action="watch", url=URL), use("Artifact", action="open", url=URL)])
        self.assertNotIn("`watch`", text)
        self.assertIn("interesting or significant", text)
        self.assertIn("has not published it yet", text)

    def test_counts_operator_messages_since_the_last_publish(self) -> None:
        self.plan(BOARD)
        lines = [
            prompt("first"),
            use("ArtifactComments", action="watch", url=URL),
            use("Artifact", url=URL, file_path="x.html"),
            result(),
            prompt("second"),
            result(),
            prompt("third"),
        ]
        self.assertIn("2 operator messages ago", self.context(lines))
        lines.append(use("Artifact", url=URL, file_path="x.html"))
        self.assertIn("0 operator messages ago", self.context(lines))

    def test_silent_after_handing_the_board_on(self) -> None:
        self.plan(BOARD)
        lines = [
            use("ArtifactComments", action="watch", url=URL),
            use("Artifact", action="open", url=URL),
            use("ArtifactComments", action="watch", url=URL, on=False),
        ]
        self.assertEqual(self.run_hook(lines), "")

    def test_an_operator_back_after_a_park_watches_again(self) -> None:
        self.plan(BOARD)
        lines = [
            use("ArtifactComments", action="watch", url=URL),
            use("Artifact", action="open", url=URL),
            use("ArtifactComments", action="watch", url=URL, on=False),
            result(),
        ]
        self.assertEqual(self.run_hook(lines), "")
        lines.append(prompt("back"))
        text = json.loads(self.run_hook(lines))["hookSpecificOutput"]["additionalContext"]
        self.assertIn("`watch`", text)
        self.assertNotIn("`open`", text)

    def test_silent_after_a_successor_starts_whoever_writes(self) -> None:
        self.plan(BOARD)
        lines = [
            use("ArtifactComments", action="watch", url=URL),
            use("Artifact", action="open", url=URL),
            use("ArtifactComments", action="watch", url=URL, on=False),
            use("mcp__claude-code-remote__create_session", prompt="/relay take b"),
            prompt("what did you send it?"),
        ]
        self.assertEqual(self.run_hook(lines), "")

    def test_silent_on_a_members_branch(self) -> None:
        self.plan(BOARD)
        scripts = self.root / "scripts"
        scripts.mkdir()
        shutil.copy(WORKING_DIR, scripts / "working-dir.sh")
        subprocess.run(["git", "init", "-q", "-b", "island/bite-2"], cwd=self.root, check=True)
        self.assertIn("`watch`", self.run_hook([]))
        channel = self.root / "docs" / "remove-before-merging" / "island" / "bite-2"
        channel.mkdir(parents=True)
        (channel / "memo.md").write_text("## lead · 2026-11-07 06:00:00 UTC\n\nA brief.\n")
        self.assertEqual(self.run_hook([]), "")

    def test_a_rewatch_after_a_stop_counts(self) -> None:
        self.plan(BOARD)
        lines = [
            use("ArtifactComments", action="watch", url=URL, on=False),
            use("ArtifactComments", action="watch", url=URL),
        ]
        text = json.loads(self.run_hook(lines))["hookSpecificOutput"]["additionalContext"]
        self.assertNotIn("`watch`", text)
        self.assertIn("`open`", text)


if __name__ == "__main__":
    unittest.main()
