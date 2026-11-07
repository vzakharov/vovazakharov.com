#!/usr/bin/env python3
"""Record the words of a person's posts on a pull request this session read.

Usage:
  python3 .claude/costs/review_words.py [--session <id>] < posts.json

`posts.json` maps each post's GitHub node id to its Markdown body, as
`scripts/export-github-item.py` passes the human posts of a PR it exports. Each
is counted without its quoted lines and fenced blocks, and the counts go to
`tmp/costs/review-words/<id>.json`, which the row folds into `reviewPosts` and
`operatorWords.review` when the turn ends. The session defaults to
`CLAUDE_CODE_SESSION_ID`.

Stdlib only — Python 3.9+.
"""

from __future__ import annotations

import argparse
import json
import os
import sys

from lib.rows import add_pending_review_words
from lib.shape import ShapeError
from lib.words import review_words


def main() -> int:
    parser = argparse.ArgumentParser(description=(__doc__ or "").split("\n\n")[0])
    parser.add_argument("--session", default=os.environ.get("CLAUDE_CODE_SESSION_ID"))
    args = parser.parse_args()
    if not args.session:
        raise SystemExit("review_words: no --session and CLAUDE_CODE_SESSION_ID is unset")
    bodies = json.load(sys.stdin)
    if not isinstance(bodies, dict) or not all(isinstance(v, str) for v in bodies.values()):
        raise ShapeError("stdin: not a map of post ids to bodies")
    counts = {post: review_words(body) for post, body in bodies.items()}
    add_pending_review_words(args.session, {post: n for post, n in counts.items() if n > 0})
    return 0


if __name__ == "__main__":
    sys.exit(main())
