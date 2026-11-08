#!/usr/bin/env python3
"""Fail when a session the branch carries has no human-hour estimate, or a row
short of what the ledger writes.

Those sessions are the rows under `sessions/` the branch adds against its merge
base with the default branch, the rows it changes where the session went on
responding, the `cost-ledger` rows filed under the branch's name, and the
running session (`CLAUDE_CODE_SESSION_ID`), whose estimate
counts from its pending file under `tmp/` by `estimate.py show`'s rule. A row
the trunk already carries is left alone, since many predate estimates.

Short means a key the current writer writes that the row lacks, or a null in a
field `unfilled` names, which an older writer could leave empty.
`estimate.py set --session` rewrites a row in the current shape, so the fix for
both is that one command.

Stdlib only — Python 3.9+.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from typing import Dict, List, Optional, Tuple

from lib.estimate_model import Estimate, latest, shadow_notes
from lib.ledger_branch import BRANCH, RATES_PATH, REMOTE_REF, LedgerError, fetch, latest_row, ledger_rates, rows_at
from lib.rows import ROOT, SESSIONS, SessionCost, parse_session_cost, read_pending_estimate, union
from lib.shape import ShapeError, unwritten

PROG = "check-estimates"
DEFAULT_BRANCHES = ("refs/remotes/origin/HEAD", "refs/remotes/origin/main", "refs/remotes/origin/master")
# A row and the JSON it was read from, which alone shows the keys it lacks.
Read = Tuple[SessionCost, str]


def git(*args: str) -> str:
    return subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True, text=True, check=True).stdout


def merge_base() -> Optional[Tuple[str, str]]:
    """The default branch's ref and the merge base with it: the bound
    `scripts/check-squash-message.sh` draws, for its reason — a row reachable
    from the base belongs to another branch."""
    for ref in DEFAULT_BRANCHES:
        try:
            git("rev-parse", "--verify", "--quiet", ref)
            return ref, git("merge-base", "HEAD", ref).strip()
        except subprocess.CalledProcessError:
            continue
    return None


def branch_rows(base: str) -> List[Read]:
    """A changed row whose `lastResponseAt` stayed put is the report rewriting a
    retired shape, not a session that spent on this branch."""
    rows = []
    listed = git("diff", "--name-status", "--no-renames", base, "--", str(SESSIONS.relative_to(ROOT)))
    for line in listed.splitlines():
        status, path = line.split("\t", 1)
        if status not in ("A", "M") or not path.endswith(".json"):
            continue
        text = (ROOT / path).read_text(encoding="utf-8")
        row = parse_session_cost(text, path)
        if status == "M":
            before = parse_session_cost(git("show", f"{base}:{path}"), f"{base}:{path}")
            if before.last_response_at == row.last_response_at:
                continue
        rows.append((row, text))
    return rows


def ledger_rows(branch: str) -> List[Read]:
    """A finalized branch's rows are on the ledger alone."""
    if not branch:
        return []
    rows = ((parse_session_cost(text, f"{BRANCH}:{path}"), text) for path, text in rows_at(REMOTE_REF))
    return [(row, text) for row, text in rows if row.branch == branch]


def unfilled(row: SessionCost, text: str) -> List[str]:
    """What an estimated row is short of: an `operatorWords` of zero words is
    filled, one left null is not."""
    assert row.estimate is not None
    nulls = {
        "estimate.subjectLine": row.estimate.subject_line,
        "operatorWords": row.operator_words,
        "branchLines": row.branch_lines,
    }
    keys = [*unwritten(row, json.loads(text)), *(key for key, value in nulls.items() if value is None)]
    return list(dict.fromkeys(keys))


def running_estimate(session_id: str) -> Optional[Estimate]:
    row = latest_row(session_id)
    return latest(row.estimate if row is not None else None, read_pending_estimate(session_id))


def fix_for(session_id: str, running: Optional[str]) -> str:
    named = "" if session_id == running else f" --session {session_id}"
    return (
        'python3 .claude/costs/estimate.py set --subject "<type>: <what the session did>"'
        f' --part <hours> <grade> <role> "<why>" [--part ...]{named}'
    )


def main() -> int:
    running = os.environ.get("CLAUDE_CODE_SESSION_ID")
    base = merge_base()
    if (ROOT / RATES_PATH).is_file():
        print(
            f"{PROG}: {RATES_PATH} is in the tree, where nothing reads it; the table lives on {BRANCH}."
            f" Carry it there with `python3 .claude/costs/ledger.py backfill`, then `git rm {RATES_PATH}`.",
            file=sys.stderr,
        )
        return 1
    try:
        # Fetched and read on every run, so a broken or stale table shows here
        # rather than at the next estimate.
        fetch()
        rates = ledger_rates(REMOTE_REF)
        for note in shadow_notes(rates, "this repository"):
            print(f"{PROG}: {note}", file=sys.stderr)
        carried = union(
            [*(branch_rows(base[1]) if base is not None else []), *ledger_rows(git("branch", "--show-current").strip())],
            lambda read: read[0],
        )
        missing = {row.session_id: row.opening_prompt for row, _ in carried if row.estimate is None}
        short: Dict[str, List[str]] = {
            row.session_id: unfilled(row, text) for row, text in carried if row.estimate is not None
        }
        missing.pop(running, None)
        short.pop(running, None)
        if running is not None:
            estimate = running_estimate(running)
            if estimate is None:
                missing[running] = "this session"
            elif estimate.subject_line is None:
                short[running] = ["estimate.subjectLine"]
        short = {session_id: keys for session_id, keys in short.items() if keys}
    except (ShapeError, ValueError, LedgerError) as error:
        print(f"{PROG}: {error}", file=sys.stderr)
        return 1

    if short:
        print(f"{PROG}: {len(short)} session(s) on this branch have a row short of what the ledger writes.", file=sys.stderr)
        for session_id, keys in short.items():
            print(f"{PROG}:   {session_id} lacks {', '.join(keys)}:", file=sys.stderr)
            print(f"{PROG}:     {fix_for(session_id, running)}", file=sys.stderr)
        print(
            f"{PROG}: `set` rewrites the row in the current shape; give it the parts `estimate.py show --session`"
            " prints, and a subject where it has none.",
            file=sys.stderr,
        )
    if missing:
        print(f"{PROG}: {len(missing)} session(s) on this branch have no human-hour estimate.", file=sys.stderr)
        for session_id, what in missing.items():
            print(f"{PROG}:   {session_id} ({(what or 'no opening prompt')[:80]!r}):", file=sys.stderr)
            print(f"{PROG}:     {fix_for(session_id, running)}", file=sys.stderr)
        fixed = "".join(f"; {role} at {added.grade} only" for role, added in rates.added.items())
        print(
            f"{PROG}: Each part is the hours one role at one grade would spend on the task, and why"
            f" (roles: {', '.join(rates.roles)}; grades: {', '.join(rates.grades)}{fixed}).",
            file=sys.stderr,
        )
        if base is not None:
            ref, sha = base
            print(
                f"{PROG}: The branch was read against {ref.removeprefix('refs/remotes/')} at {sha[:7]}; where that"
                " ref is stale, the trunk's own rows count as this branch's — `git fetch origin` and rerun.",
                file=sys.stderr,
            )
    if missing or short:
        return 1

    counted = len({row.session_id for row, _ in carried} | ({running} if running else set()))
    note = "" if base is not None else " (no base to read the branch against: the running session only)"
    print(f"{PROG}: ok — {counted} session(s) on this branch, each with an estimate{note}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
