"""Shared GitHub plumbing for the scripts in `scripts/`.

Imported as `from lib.github import …`: a script run as
`python3 scripts/<name>.py` puts `scripts/` on `sys.path`, so this resolves
from any working directory — which matters because these scripts write
relative to the caller's cwd while living elsewhere.

Stdlib only — no third-party deps. Python 3.9+.
"""

from __future__ import annotations

import os
import re
import subprocess
import sys


def die(msg: str, code: int = 1) -> None:
    print(msg, file=sys.stderr)
    sys.exit(code)


def gh_token() -> str:
    env = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if env:
        return env.strip()
    try:
        out = subprocess.check_output(["gh", "auth", "token"], text=True)
    except FileNotFoundError:
        die("No GitHub token: set $GH_TOKEN or install `gh` and run `gh auth login`.")
    except subprocess.CalledProcessError:
        die("`gh auth token` failed; run `gh auth login` or set $GH_TOKEN.")
    token = out.strip()
    if not token:
        die("Empty token from `gh auth token`; run `gh auth login`.")
    return token


def detect_origin_repo() -> str | None:
    try:
        url = subprocess.check_output(
            ["git", "remote", "get-url", "origin"], text=True
        ).strip()
    except (FileNotFoundError, subprocess.CalledProcessError):
        return None
    m = re.match(
        r"^(?:https://github\.com/|git@github\.com:)([^/]+)/([^/]+?)(?:\.git)?/?$",
        url,
    )
    return f"{m.group(1)}/{m.group(2)}" if m else None
