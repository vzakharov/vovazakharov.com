#!/usr/bin/env python3
"""Stop hook: a turn that ran a relay ends only once the session's artifact
watches are stopped.

A watch outlives the session's cache: a parked session still watching a board
is woken by the next comment sent to Claude and answers it from a cold cache,
at several times the price of the live session that should have answered.
`.claude/skills/relay/SKILL.md` § "Step 4" stops them; this hook holds it. A
watch is stopped only by a tool call (`ArtifactComments` `watch`,
`on: false`), so a hook can refuse the stop but cannot stop the watch itself.

A relay is a run of `scripts/relay-last-reply.py`, Step 2's script, which
nothing else runs. The transcript cannot see every watch: a first publish arms
one under a url only its result names. So a session that armed one must list
its watches with a bare `watch` call after arming the last — the listing is the
server's own account — and no url it armed may stand unstopped. A session that
never touched an artifact passes.

`stop_hook_active` lets the second stop through, so a listing that shows
nothing left cannot loop. Fails open — an unreadable payload or transcript is
stderr and exit 0.
"""

from __future__ import annotations

import json
import re
import sys
from typing import Iterable, List, Set, Tuple

ARTIFACT_ID = re.compile(r"claude\.ai/(?:code/)?artifact/([A-Za-z0-9_-]+)")
RELAY_SCRIPT = "relay-last-reply.py"


def say(message: str) -> None:
    print(f"relay-watch-gate: {message}", file=sys.stderr)


def records(lines: Iterable[str]) -> List[dict]:
    parsed = []
    for line in lines:
        try:
            record = json.loads(line)
        except ValueError:
            continue
        if isinstance(record, dict):
            parsed.append(record)
    return parsed


def tool_uses(parsed: List[dict]) -> Iterable[dict]:
    for record in parsed:
        content = (record.get("message") or {}).get("content")
        if isinstance(content, list):
            for block in content:
                if isinstance(block, dict) and block.get("type") == "tool_use":
                    yield block


def artifact_id(url: object) -> str:
    match = ARTIFACT_ID.search(url) if isinstance(url, str) else None
    return match.group(1) if match else ""


def standing(parsed: List[dict]) -> Tuple[bool, Set[str]]:
    """Whether the session owes its relay a stop — it ran the relay, armed a
    watch before it and none after, and has not listed its watches since
    arming the last — and the artifact ids still watched, as of the last call
    naming each. A watch armed after the relay is an operator's return to a
    parked session, which is live again."""
    relayed = armed_after_relay = owes_listing = False
    watched: Set[str] = set()
    for use in tool_uses(parsed):
        name = use.get("name")
        given = use.get("input") or {}
        if name == "Bash" and RELAY_SCRIPT in str(given.get("command", "")):
            relayed, armed_after_relay = True, False
            continue
        ident = artifact_id(given.get("url"))
        action = given.get("action", "publish")
        arms = False
        if name == "ArtifactComments" and action == "watch":
            if not ident:
                owes_listing = False
            elif given.get("on") is False:
                watched.discard(ident)
            else:
                arms = True
                watched.add(ident)
        elif name == "Artifact" and action == "publish" and not given.get("asset"):
            arms = True
            if ident:
                watched.add(ident)
        if arms:
            owes_listing = True
            armed_after_relay = relayed
    owes = relayed and not armed_after_relay and (owes_listing or bool(watched))
    return owes, watched


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
            owes, watched = standing(records(transcript))
    except OSError as error:
        say(f"cannot read the transcript ({error}); not checked.")
        return 0
    if not owes:
        return 0
    still = ", ".join(f"https://claude.ai/artifact/{ident}" for ident in sorted(watched))
    reason = (
        "This turn ran a relay, and the session may still watch an artifact: the next "
        "publish or comment sent to Claude would wake it on a cold cache. List the "
        "watches with a bare `ArtifactComments` `watch` call and stop each with `on: false`"
        + (f" — still watched here: {still}" if still else "")
        + ". Name what was stopped in the summary's State, so a session its operator "
        "comes back to watches it again."
    )
    json.dump({"decision": "block", "reason": reason}, sys.stdout)
    return 0


if __name__ == "__main__":
    sys.exit(main())
