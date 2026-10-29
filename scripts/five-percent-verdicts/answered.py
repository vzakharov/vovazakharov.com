#!/usr/bin/env python3
"""Fails when a PR has a `/five-percent` proposal the operator answered and its branch has no row for.

A proposal is a review comment opening on `PROPOSAL_MARKER`; it is answered once a reply in its
thread carries no agent footer, which is the only thing telling the operator from the agent
under one login (`scripts/gh_export/authorship.py`), or relays a session answer under
`SESSION_LEAD_IN`. An unanswered proposal needs no row
(`.claude/skills/five-percent/verdicts.md`), so it is never reported.

Usage: `python3 scripts/five-percent-verdicts/answered.py <pr> [--repo OWNER/REPO]`, the
branch read from the PR's head ref. `/finalize` runs it; vet cannot, since it needs the PR.
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

# Run by path, this file puts its own directory on `sys.path[0]`, which reaches `tally`; the
# GitHub plumbing it shares with `export-github-item.py` resolves from `scripts/`.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from gh_export.api import api_get, api_paginated
from gh_export.authorship import split_agent_footer
from lib.github import AllRoutesFailed, detect_origin_repo, die, format_route_statuses, gh_token
from tally import LEAF, VERDICTS_DIR, Malformed, parse_leaf, positive_int

PROPOSAL_MARKER = "<!-- five-percent proposal"
# An answer the operator gave in the session chat reaches the thread in an agent-signed post
# that opens on CLAUDE.md § "GitHub comments"' lead-in, so the lead-in marks it as theirs.
SESSION_LEAD_IN = re.compile(r"""\A[\s«"“„']*(?:In the session|В сессии)\s*:""", re.IGNORECASE)


class BadPayload(ValueError):
    pass


@dataclass(frozen=True)
class ReviewComment:
    id: int
    in_reply_to_id: int | None
    body: str
    html_url: str


def parse_review_comments(payload: Any) -> list[ReviewComment]:
    """GitHub's `pulls/<n>/comments` list, held to the four fields read here."""
    if not isinstance(payload, list):
        raise BadPayload("review comments: expected a JSON array")
    comments = []
    for i, raw in enumerate(payload):
        where = f"review comments[{i}]"
        if not isinstance(raw, dict):
            raise BadPayload(f"{where}: expected an object")
        reply_to = raw.get("in_reply_to_id")
        if not positive_int(raw.get("id")) or not (reply_to is None or positive_int(reply_to)):
            raise BadPayload(f"{where}: id and in_reply_to_id must be comment ids")
        if not isinstance(raw.get("body"), str) or not isinstance(raw.get("html_url"), str):
            raise BadPayload(f"{where}: body and html_url must be strings")
        comments.append(ReviewComment(raw["id"], reply_to, raw["body"], raw["html_url"]))
    return comments


def parse_head_ref(payload: Any) -> str:
    head = payload.get("head") if isinstance(payload, dict) else None
    ref = head.get("ref") if isinstance(head, dict) else None
    if not isinstance(ref, str) or not ref:
        raise BadPayload("pull request: head.ref must be a branch name")
    return ref


def _operator_answer(comment: ReviewComment) -> bool:
    """Posted by a human, or relaying what the operator said in the session."""
    by_agent, _ = split_agent_footer(comment.body)
    return not by_agent or bool(SESSION_LEAD_IN.match(comment.body))


def answered_proposals(comments: list[ReviewComment]) -> list[ReviewComment]:
    """Proposals whose thread holds an operator answer."""
    human_replied_to = {
        c.in_reply_to_id
        for c in comments
        if c.in_reply_to_id is not None and _operator_answer(c)
    }
    return [
        c
        for c in comments
        if c.in_reply_to_id is None and c.body.startswith(PROPOSAL_MARKER) and c.id in human_replied_to
    ]


def unrecorded(comments: list[ReviewComment], recorded: set[int]) -> list[ReviewComment]:
    return [c for c in answered_proposals(comments) if c.id not in recorded]


def recorded_ids(root: Path, branch: str) -> set[int]:
    """Comment ids in the branch's ledger; a branch without one has recorded nothing."""
    path = root / branch / LEAF
    return {row["comment"] for row in parse_leaf(path, branch)} if path.exists() else set()


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("pr", type=int, help="the pull request's number")
    parser.add_argument("--repo", help="OWNER/REPO, defaulting to origin's")
    parser.add_argument("--root", type=Path, default=VERDICTS_DIR, help=argparse.SUPPRESS)
    args = parser.parse_args(argv)
    repo = args.repo or detect_origin_repo() or die("five-percent-verdicts: pass --repo OWNER/REPO.")
    token = gh_token()
    try:
        branch = parse_head_ref(api_get(f"repos/{repo}/pulls/{args.pr}", token))
        comments = parse_review_comments(api_paginated(f"repos/{repo}/pulls/{args.pr}/comments", token))
        recorded = recorded_ids(args.root, branch)
    except AllRoutesFailed as error:
        die(f"five-percent-verdicts: GitHub failed on every route:\n{format_route_statuses(error.failures)}")
    except (BadPayload, Malformed) as error:
        die(f"five-percent-verdicts: {error}")
    missing = unrecorded(comments, recorded)
    if missing:
        ledger = os.path.relpath(args.root / branch / LEAF)
        print(
            f"five-percent-verdicts: {len(missing)} answered proposal(s) on #{args.pr} with no row in {ledger}:",
            file=sys.stderr,
        )
        for c in missing:
            print(f"  {c.id} — {c.html_url}", file=sys.stderr)
        print("Record each per .claude/skills/five-percent/verdicts.md.", file=sys.stderr)
        return 1
    answered = len(answered_proposals(comments))
    print(f"five-percent-verdicts: ok — {answered} answered proposal(s) on #{args.pr}, each with a row.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
