#!/usr/bin/env python3
"""Drives `scripts/attest.sh` in a scratch repository with a pushed branch, a
stand-in `scripts/vet.sh` and a fake `gh` on `PATH` that records what it was
asked to post.

Run by path (`python3 scripts/attest_test.py`), as `scripts/vet.sh` does.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ATTEST = Path(__file__).resolve().parent / "attest.sh"

FAKE_VET = """#!/bin/bash
echo "checks ran"
echo "vet: run https://example.test/runs/42"
exit "${FAKE_VET_STATUS:-0}"
"""

# Answers the calls attest.sh makes; a posted body is copied to $GH_LOG.posted
# and the verb that posted it appended to $GH_LOG.
FAKE_GH = """#!/bin/bash
case "$*" in
  "pr view --json number --jq .number") echo 7 ;;
  "pr view --json baseRefName --jq .baseRefName") echo main ;;
  "repo view --json nameWithOwner --jq .nameWithOwner") echo o/r ;;
  "api repos/o/r/issues/7/comments --paginate"*) echo "${FAKE_COMMENT_ID:-}" ;;
  "api repos/o/r/issues/comments/"*" -X PATCH -F body=@"*)
    cp "${6#body=@}" "$GH_LOG.posted"; echo "patch $2" >>"$GH_LOG" ;;
  "pr comment 7 --body-file "*)
    cp "$5" "$GH_LOG.posted"; echo "post" >>"$GH_LOG" ;;
  *) echo "fake gh: unexpected: $*" >&2; exit 9 ;;
esac
"""


def git(cwd: Path, *args: str) -> str:
    done = subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True, check=True)
    return done.stdout.strip()


class Attest(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.tmp)
        remote = self.tmp / "remote.git"
        self.repo = self.tmp / "repo"
        git(self.tmp, "init", "-q", "--bare", str(remote))
        git(self.tmp, "init", "-q", "-b", "main", str(self.repo))
        for key, value in (("user.name", "t"), ("user.email", "t@t")):
            git(self.repo, "config", key, value)
        git(self.repo, "remote", "add", "origin", str(remote))
        scripts = self.repo / "scripts"
        scripts.mkdir()
        (scripts / "attest.sh").write_text(ATTEST.read_text())
        (scripts / "vet.sh").write_text(FAKE_VET)
        (self.repo / ".gitignore").write_text("tmp/\n")
        for f in ("attest.sh", "vet.sh"):
            (scripts / f).chmod(0o755)
        git(self.repo, "add", ".")
        git(self.repo, "commit", "-qm", "base")
        git(self.repo, "push", "-q", "origin", "main")
        git(self.repo, "checkout", "-qb", "feature")
        git(self.repo, "commit", "-q", "--allow-empty", "-m", "work")
        git(self.repo, "push", "-q", "origin", "feature")

        bin_dir = self.tmp / "bin"
        bin_dir.mkdir()
        (bin_dir / "gh").write_text(FAKE_GH)
        (bin_dir / "gh").chmod(0o755)
        self.log = self.tmp / "gh.log"
        self.env = {
            **os.environ,
            "PATH": f"{bin_dir}:{os.environ['PATH']}",
            "GH_LOG": str(self.log),
        }

    def attest(self, *args: str, **env: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["scripts/attest.sh", *args],
            cwd=self.repo,
            env={**self.env, **env},
            capture_output=True,
            text=True,
        )

    def posted(self) -> str:
        return Path(f"{self.log}.posted").read_text()

    def test_green_run_posts_marker_verdict_and_link(self) -> None:
        done = self.attest()
        self.assertEqual(done.returncode, 0, done.stderr)
        body = self.posted()
        head = git(self.repo, "rev-parse", "HEAD")
        self.assertTrue(body.startswith(f"<!-- finalize-attestation {head} -->"))
        self.assertIn("`scripts/vet.sh all` — **green** (https://example.test/runs/42)", body)
        self.assertIn('`main` @ ', body)
        self.assertNotIn("checks ran", body)
        self.assertEqual(self.log.read_text(), "post\n")

    def test_red_run_is_recorded_and_fails(self) -> None:
        done = self.attest(FAKE_VET_STATUS="1")
        self.assertEqual(done.returncode, 1)
        self.assertIn("**red**", self.posted())

    def test_existing_comment_is_edited_in_place(self) -> None:
        self.attest(FAKE_COMMENT_ID="555")
        self.assertEqual(self.log.read_text(), "patch repos/o/r/issues/comments/555\n")

    def test_no_vet_runs_nothing_and_says_why(self) -> None:
        done = self.attest("--no-vet", "markdown only")
        self.assertEqual(done.returncode, 0, done.stderr)
        body = self.posted()
        self.assertIn("none required", body)
        self.assertIn("markdown only", body)
        self.assertFalse((self.repo / "tmp" / "attest-vet.log").exists())

    def test_note_is_appended(self) -> None:
        note = self.tmp / "note.md"
        note.write_text("- CI-only buckets — **none**\n")
        self.attest("--note", str(note))
        self.assertIn("- CI-only buckets — **none**", self.posted())

    def test_unpushed_head_is_refused(self) -> None:
        git(self.repo, "commit", "-q", "--allow-empty", "-m", "unpushed")
        done = self.attest()
        self.assertEqual(done.returncode, 2)
        self.assertFalse(self.log.exists())


if __name__ == "__main__":
    unittest.main()
