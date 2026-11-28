#!/usr/bin/env python3
"""Drives `git-pull-guard.py` as the harness does — a payload on stdin, a
denial or silence on stdout.

Run by path (`python3 .claude/hooks/test_git_pull_guard.py`), as
`scripts/vet.sh` does.
"""

from __future__ import annotations

import json
import subprocess
import sys
import unittest
from pathlib import Path

HOOK = Path(__file__).resolve().parent / "git-pull-guard.py"


def run(payload: str) -> str:
    done = subprocess.run(
        [sys.executable, str(HOOK)], input=payload, capture_output=True, text=True, check=True
    )
    return done.stdout


def bash(command: str, tool_name: str = "Bash") -> str:
    return run(json.dumps({"tool_name": tool_name, "tool_input": {"command": command}}))


class GitPullGuard(unittest.TestCase):
    def denial(self, command: str) -> str:
        out = bash(command)
        self.assertTrue(out, f"not denied: {command}")
        decision = json.loads(out)["hookSpecificOutput"]
        self.assertEqual(decision["permissionDecision"], "deny")
        return decision["permissionDecisionReason"]

    def assertDenied(self, *commands: str) -> None:
        for command in commands:
            with self.subTest(command=command):
                self.denial(command)

    def assertAllowed(self, *commands: str) -> None:
        for command in commands:
            with self.subTest(command=command):
                self.assertEqual(bash(command), "")

    def test_denies_a_pull_in_any_form(self) -> None:
        self.assertDenied(
            "git pull",
            "git pull --ff-only origin main",
            "git pull --rebase",
            "git -C /tmp/repo pull",
            "git -c pull.rebase=true pull origin x",
            "git --no-pager pull",
            "/usr/bin/git pull",
        )

    def test_denies_a_pull_inside_a_compound_command(self) -> None:
        self.assertDenied(
            "git status && git pull",
            "git fetch; git pull origin x",
            "(cd sub && git pull)",
            "echo $(git pull)",
            "git status | true || git pull",
            "cd x &&\ngit pull",
            "timeout 30 git pull",
            "env FOO=1 git pull",
            "bash -c 'git status && git pull origin x'",
        )

    def test_allows_pull_as_data(self) -> None:
        self.assertAllowed(
            'git commit -m "stop using git pull"',
            "echo 'git pull'",
            'printf "%s\\n" "git pull --ff-only"',
            "grep -rn 'git pull' .claude/",
            "git log --grep=pull",
            "cat <<'EOF'\ngit pull\nEOF",
        )

    def test_allows_other_commands(self) -> None:
        self.assertAllowed(
            "git fetch origin main && git merge --ff-only origin/main",
            "git pull-request",
            "gh pr view 12",
            "gh pr checkout 12",
            "git push origin HEAD",
            "git-pull",
            "git",
        )

    def test_the_hatch_lets_its_own_command_through(self) -> None:
        self.assertAllowed(
            "DANGEROUSLY_GIT_PULL=1 git pull origin x",
            "git fetch && DANGEROUSLY_GIT_PULL=1 git pull --ff-only",
            "env DANGEROUSLY_GIT_PULL=1 git pull",
            "DANGEROUSLY_GIT_PULL=1 bash -c 'git pull'",
        )

    def test_the_hatch_covers_only_its_own_command(self) -> None:
        self.assertDenied(
            "DANGEROUSLY_GIT_PULL=1 git fetch && git pull",
            "export DANGEROUSLY_GIT_PULL=1; git pull",
            "DANGEROUSLY_GIT_PULL=0 git pull",
        )

    def test_the_reason_names_the_ref_and_the_hatch(self) -> None:
        text = self.denial("git pull --ff-only origin feat/x")
        self.assertIn("git fetch origin feat/x && git merge --ff-only origin/feat/x", text)
        self.assertIn("FETCH_HEAD", text)
        self.assertIn("DANGEROUSLY_GIT_PULL=1", text)

    def test_the_reason_follows_the_mode(self) -> None:
        self.assertIn("git rebase upstream/main", self.denial("git pull --rebase upstream main"))
        self.assertIn("git merge origin/x", self.denial("git pull origin +refs/heads/x:x"))

    def test_the_reason_asks_for_a_branch_when_none_is_given(self) -> None:
        text = self.denial("git pull")
        self.assertIn("git fetch origin <branch> && git merge origin/<branch>", text)
        self.assertIn("git branch --show-current", text)

    def test_silent_on_another_tool(self) -> None:
        self.assertEqual(bash("git pull", tool_name="Read"), "")

    def test_fails_open(self) -> None:
        self.assertEqual(run("not json"), "")
        self.assertEqual(run("[]"), "")
        self.assertEqual(bash("git pull 'unterminated"), "")


if __name__ == "__main__":
    unittest.main()
