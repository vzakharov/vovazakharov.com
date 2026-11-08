#!/usr/bin/env python3
"""Record the words of a person's posts that this session read.

Usage:
  python3 .claude/costs/post_words.py [--kind review|thread] [--session <id>] < posts.json

`posts.json` maps each post's id to its Markdown body: `review` (the default)
for the human posts of a PR `scripts/export-github-item.py` exports, keyed by
GitHub node id; `thread` for a board's comment-thread file, a person's comments
keyed by comment id. Each is counted without its quoted lines and fenced
blocks, and the counts go to `tmp/costs/<kind>-words/<id>.json`, which the row
folds into `reviewPosts` or `threadPosts` and `operatorWords` when the turn
ends. The session defaults to `CLAUDE_CODE_SESSION_ID`.

Stdlib only — Python 3.9+.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import get_args

from lib.rows import PostKind, add_pending_words
from lib.shape import ShapeError
from lib.words import post_words


def main() -> int:
    parser = argparse.ArgumentParser(description=(__doc__ or "").split("\n\n")[0])
    parser.add_argument("--kind", choices=get_args(PostKind), default="review")
    parser.add_argument("--session", default=os.environ.get("CLAUDE_CODE_SESSION_ID"))
    args = parser.parse_args()
    if not args.session:
        raise SystemExit("post_words: no --session and CLAUDE_CODE_SESSION_ID is unset")
    bodies = json.load(sys.stdin)
    if not isinstance(bodies, dict) or not all(isinstance(v, str) for v in bodies.values()):
        raise ShapeError("stdin: not a map of post ids to bodies")
    counts = {post: post_words(body) for post, body in bodies.items()}
    add_pending_words(args.kind, args.session, {post: n for post, n in counts.items() if n > 0})
    return 0


if __name__ == "__main__":
    sys.exit(main())
