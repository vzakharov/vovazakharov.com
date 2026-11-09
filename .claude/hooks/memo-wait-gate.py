#!/usr/bin/env python3
"""Stop hook: a session on a memo channel ends its turn only with a `wait`
running.

A memo (`scripts/memo/memo.py`) wakes its reader only through a background
`wait` (or a `post`, which waits after posting): a session that ends its turn
without one sits idle while notes pile up on its branch, and its lead learns of
it only when nothing comes back. Sessions forgot to re-arm after a wake, so the
rule lives here rather than in the skill's prose.

A session is on a channel once that was decided for it: its branch's working
directory holds `memo.md` (a member's branch, `memo_channel.py`), or it has run
`memo.py post` or `memo.py wait` itself (a lead). Its wait is running when a
background Bash run of either has started and no task notification or
`TaskStop` has ended it since. A relay since the last operator prompt hands the
channel on, so the turn that relays passes.

`stop_hook_active` lets the second stop through, so a session whose channels
are all closed says so and ends. Fails open — an unreadable payload or
transcript is stderr and exit 0.
"""

from __future__ import annotations

import json
import re
import sys
from typing import Iterable, Set, Tuple

from memo_channel import has_channel
from session_state import project_root

MEMO = re.compile(r"memo\.py\s+(?:post|wait)\b")
STARTED = re.compile(r"running in background with ID: (\w+)")
ENDED = re.compile(r"<task-id>(\w+)</task-id>")
RELAY_SCRIPT = "relay-last-reply.py"


def say(message: str) -> None:
    print(f"memo-wait-gate: {message}", file=sys.stderr)


def text_of(content: object) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "".join(text_of(item.get("content") if isinstance(item, dict) else item) for item in content)
    return ""


def standing(lines: Iterable[str]) -> Tuple[bool, bool, bool]:
    """Whether the transcript joined a channel, whether a memo wait is running
    at its end, and whether it relayed since the last operator prompt."""
    joined = relayed = False
    pending: Set[str] = set()  # tool-use ids of background memo runs awaiting their task id
    running: Set[str] = set()
    for line in lines:
        try:
            record = json.loads(line)
        except ValueError:
            continue
        if not isinstance(record, dict) or record.get("type") == "queue-operation":
            continue
        origin = record.get("origin")
        if isinstance(origin, dict) and origin.get("kind") == "human":
            relayed = False
        content = (record.get("message") or {}).get("content")
        blocks = content if isinstance(content, list) else []
        for block in blocks:
            if not isinstance(block, dict):
                continue
            if block.get("type") == "tool_use":
                given = block.get("input") or {}
                command = str(given.get("command", ""))
                if block.get("name") == "Bash" and MEMO.search(command):
                    joined = True
                    if given.get("run_in_background"):
                        pending.add(str(block.get("id")))
                if block.get("name") == "Bash" and RELAY_SCRIPT in command:
                    relayed = True
                if block.get("name") == "TaskStop":
                    running.discard(str(given.get("task_id") or given.get("shell_id") or ""))
            elif block.get("type") == "tool_result" and block.get("tool_use_id") in pending:
                pending.discard(block.get("tool_use_id"))
                match = STARTED.search(text_of(block.get("content")))
                if match:
                    running.add(match.group(1))
        if isinstance(content, str) and content.lstrip().startswith("<task-notification>"):
            running.difference_update(ENDED.findall(content))
    return joined, bool(running), relayed


def main() -> int:
    try:
        payload = json.loads(sys.stdin.read())
    except ValueError:
        say("unreadable payload; not checked.")
        return 0
    if not isinstance(payload, dict) or payload.get("stop_hook_active"):
        return 0
    try:
        with open(payload.get("transcript_path") or "", encoding="utf-8") as transcript:
            joined, waiting, relayed = standing(transcript)
    except OSError as error:
        say(f"cannot read the transcript ({error}); not checked.")
        return 0
    if waiting or relayed:
        return 0
    root = project_root(payload)
    member = root is not None and has_channel(root, "memo-wait-gate")
    if not (joined or member):
        return 0
    reason = (
        "This session is on a memo channel"
        + (" — its branch holds memo.md —" if member else "")
        + " and no memo wait is running, so a note sent to it would wake nobody. Arm one as a "
        "background Bash task before ending the turn: `python3 scripts/memo/memo.py wait --as "
        "<lead|member> --branch <branch>`, a `--branch` per open channel. If every channel it "
        "was on is closed, say so in the reply and stop again."
    )
    json.dump({"decision": "block", "reason": reason}, sys.stdout)
    return 0


if __name__ == "__main__":
    sys.exit(main())
