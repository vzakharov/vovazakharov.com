#!/usr/bin/env python3
"""`PreToolUse` hook on `add_repo`: allow it without a prompt when the
repository belongs to an owner in `OWNERS`, and stay silent otherwise.

A `permissions.allow` rule on an MCP tool matches its name only, so it would
allow every repository; this hook is how the allowance narrows to one owner.
Silence is not a denial: any other call goes through the ordinary permission
flow.
"""

from __future__ import annotations

import json
import sys

TOOL = "mcp__claude-code-remote__add_repo"
OWNERS = {"vovas-music"}


def allowed(payload: object) -> bool:
    if not isinstance(payload, dict) or payload.get("tool_name") != TOOL:
        return False
    tool_input = payload.get("tool_input")
    if not isinstance(tool_input, dict):
        return False
    owner = tool_input.get("owner")
    # GitHub logins are case-insensitive.
    return isinstance(owner, str) and owner.lower() in OWNERS


def main() -> int:
    try:
        payload = json.loads(sys.stdin.read())
    except ValueError:
        return 0
    if allowed(payload):
        json.dump(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "allow",
                    "permissionDecisionReason": "add_repo is pre-approved for this owner"
                    " in .claude/hooks/allow-add-repo.py.",
                }
            },
            sys.stdout,
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
