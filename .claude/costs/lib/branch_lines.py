"""The branch's net lines per file extension against its merge base with the
default branch — what a row records so the ledger's history of it charts how
the code grew."""

from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Dict, Optional

BASE = "origin/main"
# Every session adds to the rows, which would swamp the lines anyone wrote.
NOT_WRITTEN = ":(exclude).claude/costs/sessions"


def extension_of(path: str) -> str:
    """`.ts`, `.md`, …; a dotfile or a file with no dot is grouped by its name.
    A rename's `a => b` and `dir/{a => b}/x` name the new side."""
    if " => " in path:
        if "{" in path:
            head, rest = path.split("{", 1)
            inner, tail = rest.split("}", 1)
            path = (head + inner.split(" => ")[-1] + tail).replace("//", "/")
        else:
            path = path.split(" => ")[-1]
    base = path.rsplit("/", 1)[-1]
    dot = base.rfind(".")
    return base[dot:] if dot > 0 else base


def fold_numstat(numstat: str) -> Dict[str, int]:
    lines: Dict[str, int] = {}
    for row in numstat.splitlines():
        fields = row.split("\t")
        if len(fields) != 3:
            continue
        added, deleted, path = fields
        # A binary file is `-` in both counts and carries no lines.
        net = (0 if added == "-" else int(added)) - (0 if deleted == "-" else int(deleted))
        ext = extension_of(path)
        lines[ext] = lines.get(ext, 0) + net
    return lines


def _git(root: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(["git", *args], cwd=root, capture_output=True, text=True)


def branch_lines(root: Path) -> Optional[Dict[str, int]]:
    """None where the checkout has no `origin/main` to measure from — a clone
    without that remote, a repository whose default is named otherwise. Any
    other git failure raises."""
    if _git(root, "rev-parse", "--verify", "--quiet", BASE).returncode != 0:
        return None
    base = _git(root, "merge-base", BASE, "HEAD")
    if base.returncode != 0:
        raise RuntimeError(f"git merge-base {BASE} HEAD: {base.stderr.strip()}")
    diff = _git(root, "diff", "--numstat", base.stdout.strip(), "HEAD", "--", ".", NOT_WRITTEN)
    if diff.returncode != 0:
        raise RuntimeError(f"git diff --numstat: {diff.stderr.strip()}")
    return fold_numstat(diff.stdout)
