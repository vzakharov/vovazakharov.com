#!/usr/bin/env python3
"""What one branch's work took, people and agents side by side: dollars at API
rates, estimated senior-hours, the operator's words, and the branch's net lines
per extension.

The words are `chat`, typed into a session and summed over the branch's
sessions, and `review`, posted on its PRs and summed over the union of the
sessions' `reviewPosts`, so a post two sessions exported counts once.

Usage:
  python3 .claude/costs/contribution.py [--branch B] [--at TIME] [--json]

The branch defaults to the one checked out. `--at` reads the figures as they
stood at an ISO time, off the last `cost-ledger` commit before it — the figures
a timelapse frame captured then carries. Without it, the ledger's tip and the
tree's display copies, unioned as `report.py` does.

A row written before `operatorWords` was counted reads as null. Where the
ledger at `--at` holds such a row for a session that had already ended, its
current row's words and posts stand in, since a finished session's cannot have
changed since; for one still running then, they are left out and the total says
it is a floor.

Stdlib only — Python 3.9+.
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass, field
from typing import Dict, List, Optional

from lib.estimate_model import Rates, senior_hours
from lib.ledger_branch import BRANCH, REMOTE_REF, fetch, git, ledger_rates, rows_at
from lib.rows import SessionCost, read_row, reshape, tree_rows, union
from lib.words import OperatorWords


@dataclass
class Session:
    url: Optional[str]
    started: Optional[str]
    usd: float
    senior_hours: Optional[float]
    operator_words: Optional[OperatorWords]


@dataclass
class Contribution:
    branch: str
    sessions: List[Session]
    usd: float
    senior_hours: float
    operator_words: OperatorWords
    # True where a session's words were not on record at the moment read.
    words_are_a_floor: bool
    branch_lines: Dict[str, int] = field(default_factory=dict)


def contribution_of(
    branch: str, rows: List[SessionCost], rates: Rates, finished: Optional[Dict[str, SessionCost]] = None
) -> Contribution:
    """The branch's figures over `rows`. `finished` maps a session id to a
    later row of it, whose words and posts stand in where `rows` has none."""
    mine = sorted((row for row in rows if row.branch == branch), key=lambda row: row.first_response_at or "")
    sessions: List[Session] = []
    posts: Dict[str, int] = {}
    floor = False
    for row in mine:
        words, own_posts = row.operator_words, row.review_posts
        later = finished.get(row.session_id) if finished is not None else None
        if words is None and later is not None:
            words, own_posts = later.operator_words, later.review_posts
        floor = floor or words is None
        posts.update(own_posts)
        hours = None if row.estimate is None else senior_hours(row.estimate, rates)
        sessions.append(Session(row.url, row.first_response_at, row.total.cost_usd, hours, words))
    lines = next((row.branch_lines for row in reversed(mine) if row.branch_lines is not None), None)
    return Contribution(
        branch=branch,
        sessions=sessions,
        usd=sum(s.usd for s in sessions),
        senior_hours=sum(s.senior_hours or 0.0 for s in sessions),
        operator_words=OperatorWords(
            chat=sum(s.operator_words.chat for s in sessions if s.operator_words is not None),
            review=sum(posts.values()),
        ),
        words_are_a_floor=floor,
        branch_lines=lines or {},
    )


def finished_by(rows: List[SessionCost], at: str) -> Dict[str, SessionCost]:
    """The rows, with their words on record, of the sessions whose last
    response came before `at`.

    ISO-8601 UTC strings compare in time order, which is all this needs."""
    return {
        row.session_id: row
        for row in rows
        if row.operator_words is not None and row.last_response_at is not None and row.last_response_at <= at
    }


def ledger_side(rev: Optional[str]) -> List[SessionCost]:
    return [] if rev is None else [reshape(text, f"{BRANCH}:{path}")[0] for path, text in rows_at(rev)]


def now_rows(tip: Optional[str]) -> List[SessionCost]:
    return union([*ledger_side(tip), *(read_row(path)[0] for path in tree_rows())], lambda row: row)


def current_branch() -> str:
    branch = git("branch", "--show-current").strip()
    if not branch:
        raise SystemExit("contribution: no --branch and HEAD is detached")
    return branch


def render(c: Contribution, at: Optional[str]) -> str:
    out = [f"{c.branch}{'' if at is None else f' as of {at}'}", ""]
    for s in c.sessions:
        hours = "—" if s.senior_hours is None else f"{s.senior_hours:.2f} h"
        w = s.operator_words
        words = "—" if w is None else f"{w.chat} chat + {w.review} review"
        out.append(f"  {s.started or '?'}  ${s.usd:8.2f}  {hours:>8}  {words:>22} words  {s.url or ''}")
    floor = " (a floor)" if c.words_are_a_floor else ""
    w = c.operator_words
    out += [
        "",
        f"  ${c.usd:.2f} at API rates, {c.senior_hours:.2f} senior-hours estimated, "
        f"{w.chat + w.review} operator words ({w.chat} chat, {w.review} review){floor}",
    ]
    if c.branch_lines:
        out.append("  lines: " + ", ".join(f"{ext} {n}" for ext, n in sorted(c.branch_lines.items(), key=lambda kv: -kv[1])))
    return "\n".join(out)


def main() -> int:
    parser = argparse.ArgumentParser(description=(__doc__ or "").split("\n\n")[0])
    parser.add_argument("--branch")
    parser.add_argument("--at", help="an ISO time, e.g. 2026-11-06T17:58:09Z")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    branch = args.branch or current_branch()
    tip = fetch()
    if args.at is None:
        rows, rates, finished = now_rows(tip), ledger_rates(tip), None
    else:
        then = git("rev-list", "-1", f"--before={args.at}", REMOTE_REF).strip() if tip is not None else ""
        rows, rates = ledger_side(then or None), ledger_rates(then or None)
        finished = finished_by(now_rows(tip), args.at)
    result = contribution_of(branch, rows, rates, finished)
    as_json = {"at": args.at, **asdict(result)}
    print(json.dumps(as_json, indent=2, ensure_ascii=False) if args.json else render(result, args.at))
    return 0


if __name__ == "__main__":
    sys.exit(main())
