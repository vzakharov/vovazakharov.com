#!/usr/bin/env python3
"""Remind a session to watch and open the board a plan on its branch names.

A plan run as a board (`.claude/skills/mammoth/notes/`) starts with
`**The plan is the board**: <artifact url>`, and every session that picks the
plan up owes the board two calls: `ArtifactComments` `watch`, so a publish or a
comment sent to Claude wakes it, and `Artifact` `open`, the only call that puts
the board in the session's artifact list where the operator finds it. Both were
forgotten pickup after pickup while they lived only in the plan's prose, so this
hook reads the session's transcript on every prompt and names whichever is
still missing, until both are there. A `publish` to the board's url counts as
an open.

Once both calls are made, the notice turns into the publish rule: the board is
republished whenever something interesting or significant turns up, in the game
or in the conversation about it, and the notice says how many operator messages
have passed since this session last published — the board was otherwise
forgotten in the heat of the work.

Only the lead owes the board anything. A member's branch forks from the lead's
and carries the plan with it, but it also carries its memo channel —
`memo.md` in the branch's own working directory (`scripts/memo/memo.py`) — and
on such a branch the hook stays silent, so no member is woken by the board.

Fails open — an unreadable payload or transcript is stderr and exit 0.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Dict, Iterable, List, Set, Tuple

from session_state import project_root

BOARD = re.compile(r"\*\*The plan is the board\*\*:\s*(https://claude\.ai/artifact/[A-Za-z0-9_-]+)")
ARTIFACT_ID = re.compile(r"claude\.ai/(?:code/)?artifact/([A-Za-z0-9_-]+)")


def say(message: str) -> None:
    print(f"board-notice: {message}", file=sys.stderr)


def boards(root: Path) -> List[str]:
    """The board urls the branch's plans declare, one per plan, in name order."""
    found = []
    for plan in sorted((root / "docs" / "plans").glob("*.md")):
        try:
            match = BOARD.search(plan.read_text(encoding="utf-8"))
        except OSError as error:
            say(f"cannot read {plan} ({error}).")
            continue
        if match and match.group(1) not in found:
            found.append(match.group(1))
    return found


def is_member(root: Path) -> bool:
    """Whether the checked-out branch is a member's: its working directory holds a memo channel."""
    try:
        where = subprocess.run(
            [str(root / "scripts" / "working-dir.sh")],
            cwd=root,
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()
    except (OSError, subprocess.CalledProcessError) as error:
        say(f"no working directory ({error}); taken for the lead's branch.")
        return False
    return (root / where / "memo.md").is_file()


def artifact_id(url: object) -> str:
    match = ARTIFACT_ID.search(url) if isinstance(url, str) else None
    return match.group(1) if match else ""


PROMPT = object()


def events(lines: Iterable[str]) -> Iterable[object]:
    """Each tool use, as its block, and each operator prompt, as `PROMPT`, in
    transcript order. A prompt is a record the harness marks as a human's
    (`origin.kind`), which leaves out task notifications and hook feedback."""
    for line in lines:
        try:
            record = json.loads(line)
        except ValueError:
            continue
        if not isinstance(record, dict):
            continue
        origin = record.get("origin")
        if isinstance(origin, dict) and origin.get("kind") == "human":
            yield PROMPT
            continue
        content = (record.get("message") or {}).get("content")
        if isinstance(content, list):
            for block in content:
                if isinstance(block, dict) and block.get("type") == "tool_use":
                    yield block


Done = Tuple[Set[str], Set[str], Set[str], Dict[str, int]]


def done(lines: Iterable[str]) -> Done:
    """The artifact ids this transcript watches, as of its last watch call for
    each; the ids whose last watch call stopped it — the session handed the
    plan on, so it owes that board nothing more; the ids it has opened or
    published to; and, per id it has published to, the operator prompts since
    the last publish."""
    watched: Set[str] = set()
    released: Set[str] = set()
    opened: Set[str] = set()
    since: Dict[str, int] = {}
    for event in events(lines):
        if event is PROMPT:
            for ident in since:
                since[ident] += 1
            continue
        assert isinstance(event, dict)
        given = event.get("input") or {}
        ident = artifact_id(given.get("url"))
        if not ident:
            continue
        action = given.get("action", "publish")
        if event.get("name") == "ArtifactComments" and action == "watch":
            stopped = given.get("on") is False
            (released.add if stopped else released.discard)(ident)
            (watched.discard if stopped else watched.add)(ident)
        elif event.get("name") == "Artifact" and action in ("open", "publish"):
            opened.add(ident)
            if action == "publish":
                since[ident] = 0
    return watched, released, opened, since


def reminder(url: str, since: Dict[str, int]) -> str:
    count = since.get(artifact_id(url))
    when = (
        "This session has not published it yet"
        if count is None
        else f"This session last published it {count} operator message{'' if count == 1 else 's'} ago"
    )
    return (
        f"The board ({url}): publish it whenever something interesting or significant "
        "turns up, in the game or in the conversation about it — the plan's standing "
        f"constraints. {when}; if anything since is worth pinning, pin it this turn."
    )


def notice(urls: List[str], watched: Set[str], released: Set[str], opened: Set[str], since: Dict[str, int]) -> str:
    owed = []
    for url in urls:
        ident = artifact_id(url)
        if ident in released:
            continue
        calls = []
        if ident not in watched:
            calls.append(f"`ArtifactComments` `watch` with url {url}")
        if ident not in opened:
            calls.append(f"`Artifact` `open` with url {url}")
        owed.extend(calls)
    if not owed:
        return " ".join(reminder(url, since) for url in urls if artifact_id(url) not in released)
    return (
        "A plan on this branch is run as a board, and this session has not yet made "
        + ("these calls" if len(owed) > 1 else "this call")
        + " on it: "
        + "; ".join(owed)
        + ". Make them now, before the turn's work: the watch is what wakes the "
        "session on a publish or a comment sent to Claude, and the open is what "
        "puts the board in the session's artifact list for the operator. A "
        "session handing the plan on stops its watch (`on: false`) first."
    )


def main() -> int:
    try:
        payload = json.loads(sys.stdin.read())
    except ValueError:
        say("unreadable payload; no board notice.")
        return 0
    if not isinstance(payload, dict):
        return 0
    root = project_root(payload)
    if root is None:
        return 0
    urls = boards(root)
    if not urls or is_member(root):
        return 0
    try:
        with open(payload.get("transcript_path") or "", encoding="utf-8") as transcript:
            watched, released, opened, since = done(transcript)
    except OSError as error:
        say(f"cannot read the transcript ({error}); no board notice.")
        return 0
    text = notice(urls, watched, released, opened, since)
    if text:
        json.dump(
            {"hookSpecificOutput": {"hookEventName": payload["hook_event_name"], "additionalContext": text}},
            sys.stdout,
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
