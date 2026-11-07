"""Hands a PR's human posts to the cost ledger, which counts the operator's
review words into the exporting session's row.

The counting and the pending file are `.claude/costs/review_words.py`'s; this
side decides only which posts are a person's. It runs as a process rather than
an import because both trees name their packages `lib`.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any, Iterable, Optional

from gh_export.authorship import split_agent_footer

RECORDER = Path(__file__).resolve().parents[2] / ".claude" / "costs" / "review_words.py"


def human_posts(*posts: Iterable[dict[str, Any]]) -> dict[str, str]:
    """Node id → body of every post with prose and no agent footer: review
    bodies, review-thread comments and conversation comments alike."""
    found: dict[str, str] = {}
    for group in posts:
        for post in group:
            body = post.get("body") or ""
            by_agent, _ = split_agent_footer(body)
            if body.strip() and not by_agent and post.get("node_id"):
                found[post["node_id"]] = body
    return found


def record_review_words(posts: dict[str, str]) -> Optional[str]:
    """Why the posts went unrecorded, or None. Nothing is recorded outside a
    Claude Code session, or in a repository without the ledger."""
    session = os.environ.get("CLAUDE_CODE_SESSION_ID")
    if not session or not RECORDER.exists() or not posts:
        return None
    done = subprocess.run(
        [sys.executable, str(RECORDER), "--session", session],
        input=json.dumps(posts),
        capture_output=True,
        text=True,
        check=False,
    )
    if done.returncode != 0:
        output = done.stderr.strip() or done.stdout.strip()
        return f"{RECORDER} exited {done.returncode}: {output}"
    return None
