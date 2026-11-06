#!/usr/bin/env python3
"""A two-sided channel on a branch: append a note, then wait for the reply.

Usage:
  python3 scripts/memo/memo.py post --as SIDE [--branch B] [--attach PATH]... TEXT|-
  python3 scripts/memo/memo.py wait --as SIDE [--branch B]...
  python3 scripts/memo/memo.py show [--branch B] [-n N]

The sides are a mammoth's `lead`, the session holding the plan and the PR, and
a `member`, a session building one bite on a branch of its own
(`.claude/skills/mammoth/notes/README.md`). Their channel is `memo.md` in the bite
branch's working directory (`scripts/working-dir.sh`), each note a
`## <side> · <time>` section appended in a commit of its own. Living on the
branch rather than on a session id, it survives either side relaying.

`post` commits the note, pushes it, then waits; `wait` only waits. Either is run
as a background Bash task, so its exit is the wake. Waiting fetches each branch
every `POLL` seconds and exits printing whatever the other side wrote after this
side's last note, on every branch that has some — at once, when that is already
there, so a session opened after the note was written finds it. A note the other
side has not answered yet is therefore printed again by a fresh `wait`. The lead
waits on every open bite with one `wait`, a `--branch` each. `show` prints the
last notes and waits for nothing.

Traps:

- **A checkout on another branch is left alone.** The commit is built with a
  scratch index on top of the branch's tip and pushed by SHA, so the lead posts
  to a bite without checking it out. Where the branch *is* checked out, `HEAD`
  is brought up to `origin/<branch>` first — fast-forward, or a merge when all
  `origin` adds is the channel, which cannot conflict — and the note goes on
  `HEAD`, so `post` also pushes this side's unpushed commits; `HEAD` then moves
  to the new commit, and a `wait` that wakes integrates the same way. A `HEAD`
  that diverged further is left as it is, with a warning, and the note goes on
  `origin`'s tip: integrating that is the session's ordinary `git pull`.
- **A push that loses a race is rebuilt**, up to `RETRIES` times, on the tip the
  other side just pushed: notes only ever append, so rebuilding cannot
  conflict.
- **A line of the note's text shaped like a note header is refused**, since the
  parser would split the note there.
- **Attachments** go to `memo/<basename>` beside the channel in the same commit,
  and the note names them; the reader takes them with
  `git show origin/<branch>:<path>`.
- **Waiting stops short of the Bash tool's two-hour cap** (`LIFETIME`) and says
  so — the channels unchanged — rather than being killed with no word; re-arm
  with `wait`. A fetch that fails `FETCH_FAILURES` times running exits non-zero
  with git's message; a single failure is reported and retried.

Stdlib only — no third-party deps. Python 3.9+.
"""

from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple

ROOT = Path(__file__).resolve().parents[2]
# Beside this file rather than under ROOT, which tests point at a temporary clone.
WORKING_DIR = Path(__file__).resolve().parents[1] / "working-dir.sh"
SIDES = ("lead", "member")
HEADER = re.compile(r"^## (lead|member) · ", re.MULTILINE)
POLL = 20.0
LIFETIME = 7200 - 300
RETRIES = 5
FETCH_FAILURES = 6
TITLE = "# Memo\n\nWritten by `scripts/memo/memo.py`; never edited by hand.\n"


class GitError(Exception):
    pass


def git(*args: str, data: Optional[str] = None, env: Optional[dict] = None) -> str:
    done = subprocess.run(
        ["git", *args], input=data, capture_output=True, text=True, cwd=ROOT, env={**os.environ, **(env or {})}
    )
    if done.returncode != 0:
        raise GitError(f"git {' '.join(args)}: {done.stderr.strip()}")
    return done.stdout.strip()


def ok(*args: str) -> bool:
    return subprocess.run(["git", *args], capture_output=True, cwd=ROOT).returncode == 0


def current_branch() -> Optional[str]:
    try:
        return git("symbolic-ref", "--short", "-q", "HEAD") or None
    except GitError:
        return None


def channel(branch: str) -> str:
    """The channel's path on `branch`, in the working directory
    `scripts/working-dir.sh` names for it.

    >>> channel("claude/island-descent-x1")
    'docs/remove-before-merging/island-descent-x1/memo.md'
    """
    done = subprocess.run([str(WORKING_DIR), branch], capture_output=True, text=True, check=True)
    return f"{done.stdout.strip()}/memo.md"


def attachments(branch: str) -> str:
    return channel(branch).removesuffix(".md")


# --- The channel's text ---------------------------------------------------------


def notes(text: str) -> List[Tuple[str, str]]:
    """The notes in a channel's text, as (side, section) in order.

    >>> notes(TITLE + "\\n## lead · t1\\n\\nask\\n\\n## member · t2\\n\\nanswer\\n")
    [('lead', '## lead · t1\\n\\nask'), ('member', '## member · t2\\n\\nanswer')]
    >>> notes(TITLE)
    []
    """
    starts = list(HEADER.finditer(text))
    return [
        (m.group(1), text[m.start() : starts[i + 1].start() if i + 1 < len(starts) else len(text)].strip())
        for i, m in enumerate(starts)
    ]


def unanswered(text: str, me: str) -> List[str]:
    """What the other side wrote after `me` last did.

    >>> t = TITLE + "\\n## lead · 1\\n\\na\\n\\n## member · 2\\n\\nb\\n\\n## member · 3\\n\\nc\\n"
    >>> [n.split()[-1] for n in unanswered(t, "lead")]
    ['b', 'c']
    >>> unanswered(t, "member")
    []
    """
    found: List[str] = []
    for who, section in notes(text):
        found = [] if who == me else found + [section]
    return found


def note(me: str, body: str, attached: List[str]) -> str:
    """One note, ready to append.

    >>> print(note("lead", "ask", ["docs/x"]).split("\\n", 2)[2], end="")
    ask
    <BLANKLINE>
    Attached: `docs/x`
    """
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    tail = "\n\nAttached: " + ", ".join(f"`{p}`" for p in attached) if attached else ""
    return f"## {me} · {stamp}\n\n{body.strip()}{tail}\n"


# --- Git ------------------------------------------------------------------------


def fetch(branch: str) -> Optional[str]:
    """The tip of `origin/<branch>` after a fetch, None when origin has no such
    branch."""
    ref = f"refs/remotes/origin/{branch}"
    done = subprocess.run(
        ["git", "fetch", "-q", "origin", f"+refs/heads/{branch}:{ref}"], capture_output=True, text=True, cwd=ROOT
    )
    if done.returncode != 0:
        if "couldn't find remote ref" in done.stderr:
            return None
        raise GitError(f"git fetch origin {branch}: {done.stderr.strip()}")
    return git("rev-parse", ref)


def channel_at(branch: str, commit: Optional[str]) -> str:
    if commit is None:
        return TITLE
    try:
        return git("show", f"{commit}:{channel(branch)}") + "\n"
    except GitError:
        return TITLE


def integrate(branch: str, tip: str) -> bool:
    """Bring the checked-out `branch` up to `tip`, where that is safe; whether
    `HEAD` now contains it. See the module's first trap."""
    if current_branch() != branch:
        return False
    if ok("merge-base", "--is-ancestor", tip, "HEAD"):
        return True
    if ok("merge-base", "--is-ancestor", "HEAD", tip):
        git("merge", "--ff-only", "-q", tip)
        return True
    theirs = git("diff", "--name-only", f"HEAD...{tip}").splitlines()
    if all(path == channel(branch) or path.startswith(attachments(branch) + "/") for path in theirs):
        git("merge", "-q", "-m", f"chore: memo notes from origin/{branch}", tip)
        return True
    print(
        f"memo: {branch} has diverged from origin/{branch} beyond the channel; HEAD is left as it is — `git pull` to integrate.",
        file=sys.stderr,
    )
    return False


def base(branch: str, remote: Optional[str]) -> str:
    """The commit a note goes on top of."""
    if current_branch() == branch and (remote is None or integrate(branch, remote)):
        return git("rev-parse", "HEAD")
    if remote is None:
        raise SystemExit(f"memo: origin has no branch {branch}")
    return remote


def commit_note(branch: str, parent: str, text: str, attach: List[Path], me: str) -> str:
    with tempfile.TemporaryDirectory() as scratch:
        env = {"GIT_INDEX_FILE": str(Path(scratch) / "index")}
        git("read-tree", parent, env=env)
        blob = git("hash-object", "-w", "--stdin", data=text)
        git("update-index", "--add", "--cacheinfo", f"100644,{blob},{channel(branch)}", env=env)
        for path in attach:
            blob = git("hash-object", "-w", str(path.resolve()))
            git("update-index", "--add", "--cacheinfo", f"100644,{blob},{attachments(branch)}/{path.name}", env=env)
        tree = git("write-tree", env=env)
    return git("commit-tree", tree, "-p", parent, "-m", f"chore: memo from the {me}")


def post(branch: str, me: str, body: str, attach: List[Path]) -> None:
    if HEADER.search(body):
        raise SystemExit("memo: a line of the note starts like a note header (`## lead · `/`## member · `); reword it")
    for path in attach:
        if not path.is_file():
            raise SystemExit(f"memo: no file {path}")
    for _ in range(RETRIES):
        parent = base(branch, fetch(branch))
        named = [f"{attachments(branch)}/{p.name}" for p in attach]
        text = channel_at(branch, parent).rstrip("\n") + "\n\n" + note(me, body, named)
        commit = commit_note(branch, parent, text, attach, me)
        try:
            git("push", "-q", "origin", f"{commit}:refs/heads/{branch}")
        except GitError as error:
            if "rejected" in str(error) or "fetch first" in str(error) or "non-fast-forward" in str(error):
                continue
            raise
        if current_branch() == branch and ok("merge-base", "--is-ancestor", "HEAD", commit):
            git("merge", "--ff-only", "-q", commit)
        print(f"memo: posted {commit[:7]} to {branch} as the {me}", flush=True)
        return
    raise SystemExit(f"memo: the push lost the race {RETRIES} times; post again")


def news_on(branches: List[str], me: str) -> Dict[str, List[str]]:
    """The other side's unanswered notes, per branch that has any; a fetch
    failure propagates."""
    found: Dict[str, List[str]] = {}
    for branch in branches:
        tip = fetch(branch)
        if tip is None:
            continue
        news = unanswered(channel_at(branch, tip), me)
        if news:
            integrate(branch, tip)
            found[branch] = news
    return found


def wait(branches: List[str], me: str) -> None:
    start, failures = time.time(), 0
    while True:
        try:
            found = news_on(branches, me)
            failures = 0
        except GitError as error:
            failures += 1
            if failures >= FETCH_FAILURES:
                raise
            print(f"memo: {error} — retrying", file=sys.stderr, flush=True)
            found = {}
        if found:
            for branch, news in found.items():
                print(f"memo: {len(news)} new on {branch}\n\n" + "\n\n".join(news) + "\n")
            print(f"Answer with `python3 scripts/memo/memo.py post --as {me} --branch <branch> -` as a background Bash task.")
            return
        if time.time() - start > LIFETIME:
            minutes = int((time.time() - start) // 60)
            again = " ".join(f"--branch {b}" for b in branches)
            print(f"memo: no answer in {minutes} minutes; re-arm with `python3 scripts/memo/memo.py wait --as {me} {again}`.")
            return
        time.sleep(POLL)


def show(branch: str, count: int) -> None:
    found = notes(channel_at(branch, fetch(branch)))
    if not found:
        print(f"memo: no notes on {branch}")
        return
    print("\n\n".join(section for _, section in found[-count:]))
    print(f"\nmemo: {len(found)} notes on {branch}; the last is from the {found[-1][0]}.")


def checked_out() -> str:
    branch = current_branch()
    if branch is None:
        raise SystemExit("memo: no --branch and HEAD is detached")
    return branch


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=(__doc__ or "").split("\n\n")[0])
    commands = parser.add_subparsers(dest="command", required=True)
    post_cmd = commands.add_parser("post")
    post_cmd.add_argument("text", help="the note, or - to read it from stdin")
    post_cmd.add_argument("--attach", action="append", type=Path, default=[])
    post_cmd.add_argument("--branch")
    wait_cmd = commands.add_parser("wait")
    wait_cmd.add_argument("--branch", action="append", default=[], help="repeat to wait on several branches")
    for sub in (post_cmd, wait_cmd):
        sub.add_argument("--as", dest="side", choices=SIDES, required=True)
    show_cmd = commands.add_parser("show")
    show_cmd.add_argument("--branch")
    show_cmd.add_argument("-n", type=int, default=3)
    args = parser.parse_args(argv)

    try:
        if args.command == "show":
            show(args.branch or checked_out(), args.n)
            return 0
        if args.command == "post":
            body = sys.stdin.read() if args.text == "-" else args.text
            if not body.strip():
                raise SystemExit("memo: the note is empty")
            branch = args.branch or checked_out()
            post(branch, args.side, body, args.attach)
            wait([branch], args.side)
        else:
            wait(args.branch or [checked_out()], args.side)
    except GitError as error:
        print(f"memo: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
