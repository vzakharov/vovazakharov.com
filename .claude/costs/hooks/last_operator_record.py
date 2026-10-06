#!/usr/bin/env python3
"""Print the id of the last record in a transcript the operator may have
written, or nothing when there is none.

Usage:
  python3 .claude/costs/hooks/last_operator_record.py <transcript>

`stop-session-cost.sh` compares it with the id it recorded when it last
committed a row, and skips the commit only when the two match. A record counts
when it is one of:

- a prompt or a queued mid-turn message the operator wrote: `origin.kind` or
  `attachment.origin.kind` is `human`;
- a prompt that says nothing about its origin — a build that does not write
  `origin`, or a record shape this does not know;
- a line that does not parse.

The last two count because a skip the hook cannot justify is a row that may
never land, where a commit too many costs only a commit. A record's id is its
`uuid`, else its line number. Stdlib only — Python 3.9+.
"""

from __future__ import annotations

import json
import sys
from typing import Any, Optional


def origin_kind(holder: Any) -> Optional[str]:
    origin = holder.get("origin") if isinstance(holder, dict) else None
    kind = origin.get("kind") if isinstance(origin, dict) else None
    return kind if isinstance(kind, str) else None


def is_tool_result(record: dict) -> bool:
    if record.get("toolUseResult") is not None:
        return True
    message = record.get("message")
    content = message.get("content") if isinstance(message, dict) else None
    return isinstance(content, list) and any(
        isinstance(block, dict) and block.get("type") == "tool_result" for block in content
    )


def may_be_operator(record: Any) -> bool:
    if not isinstance(record, dict):
        return True
    if "human" in (origin_kind(record), origin_kind(record.get("attachment"))):
        return True
    return (
        record.get("type") == "user"
        and origin_kind(record) is None
        and not record.get("isMeta")
        and not is_tool_result(record)
    )


def last_operator_record(text: str) -> str:
    last = ""
    for number, line in enumerate(text.split("\n"), start=1):
        if line.strip() == "":
            continue
        try:
            record: Any = json.loads(line)
        except json.JSONDecodeError:
            record = None
        if may_be_operator(record):
            uuid = record.get("uuid") if isinstance(record, dict) else None
            last = uuid if isinstance(uuid, str) and uuid else f"line:{number}"
    return last


if __name__ == "__main__":
    with open(sys.argv[1], encoding="utf-8") as transcript:
        print(last_operator_record(transcript.read()))
