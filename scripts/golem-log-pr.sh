#!/usr/bin/env bash
# The PR half of a `/golem` run's operator log: every thread on the PR whose
# tail is the operator's goes into the log, read off the export a bite's end has
# just refreshed with `scripts/export-github-item.py <pr>`, never re-fetched.
# `.claude/hooks/golem-operator-log.sh` writes the chat half and owns which log
# is live, so its pending chat replies go in first, keeping them ahead of the
# comments taken in after them.
#
# Usage:
#   scripts/golem-log-pr.sh <pr-number>
#
# **A thread** is each review thread, plus the PR's conversation — its comments
# and review bodies, in time order — read as one more. **Its tail** is the run of
# posts after its last agent-authored one, by the export's `(agent)` or
# `(agent review)` label — a loop review is the run's own too; each post in it is
# logged verbatim, quoted, with its link. The run answers on GitHub, so the link
# is where its reply is found. A post the export gives no link of its own (a
# review body) links the PR.
#
# **Re-running is safe**: each entry carries a key — the post's time, its author
# and a hash of its text — and a key already in the log is skipped. An edited
# post is new text, so it is logged again.
#
# No live log is not a run, and exits 0 having written nothing.
#
# Exit codes:
#   0  - logged what was new, or there is no live log.
#   1  - no export to read, bad arguments, or a failed write.

set -euo pipefail

PROG="golem-log-pr"

die() {
  echo "$PROG: $*" >&2
  exit 1
}

[ $# -eq 1 ] && [[ "$1" =~ ^[0-9]+$ ]] || die "usage: scripts/golem-log-pr.sh <pr-number>"
number=$1

root="$(git rev-parse --show-toplevel)"
hook="$root/.claude/hooks/golem-operator-log.sh"

log="$("$hook" path "$root")"
[ -n "$log" ] || exit 0
"$hook" flush "$root"

export_path="$root/docs/pr/$number/pr.md"
[ -f "$export_path" ] ||
  die "no export at docs/pr/$number/pr.md: run scripts/export-github-item.py $number first"

python3 - "$export_path" "$log" "$number" <<'PY'
from __future__ import annotations

import hashlib
import re
import sys
from pathlib import Path

export_path, log_path, number = sys.argv[1], Path(sys.argv[2]), sys.argv[3]
lines = Path(export_path).read_text(encoding="utf-8").split("\n")

# The exporter's own lines (scripts/gh_export/markdown.py, reviews.py).
URL = re.compile(r"^- \*\*URL:\*\* (\S+)$")
COMMENT = re.compile(r"^### Comment by @(\S+) \(([\w ]+)\) on (\S+)$")
REVIEW = re.compile(r"^### Review by @(\S+) \(([\w ]+)\) — \w+$")
REVIEW_TIME = re.compile(r"^_(\S+)_$")
THREAD = re.compile(r"^### (`[^`]*`(?::\d+)?) — [\w ]+$")
THREAD_POST = re.compile(r"^\*\*@(\S+) \(([\w ]+)\)\*\* — (\S+)$")
# scripts/gh_export/authorship.py's labels for a post the run wrote itself.
RUNS_OWN = {"agent", "agent review"}
OWN_LINK = re.compile(r"^\[(https://github\.com/\S+)\]\(\1\)$")
ANCHOR = re.compile(r'^<a id="[ct]\d+"></a>$')
SECTION = re.compile(r"^## (Review threads|Timeline\b)")
OMITTED = re.compile(r"^_\d+ resolved threads? omitted;")
INDEX_ROW = re.compile(r"^- \*\*[CT]\d+\*\* ")


def block_end(i: int) -> bool:
    """A `---` the exporter closes a block with: what follows it is the next
    block, the next section, or the end."""
    if lines[i] != "---":
        return False
    rest = [line for line in lines[i + 1 : i + 3] if line != ""]
    return not rest or bool(ANCHOR.match(rest[0]) or SECTION.match(rest[0]))


pr_url = next((m.group(1) for m in map(URL.match, lines) if m), "")
conversation: list[dict] = []
threads: list[list[dict]] = []
post: dict | None = None


def close() -> None:
    global post
    if post is not None:
        body = "\n".join(post.pop("body")).strip("\n")
        post["body"] = body
        post["link"] = post.get("link") or pr_url
    post = None


def start(**fields) -> dict:
    close()
    return {"body": [], **fields}


for i, line in enumerate(lines):
    if m := COMMENT.match(line):
        post = start(login=m[1], label=m[2], at=m[3], where="comment")
        conversation.append(post)
    elif m := REVIEW.match(line):
        post = start(login=m[1], label=m[2], at="", where="review")
        conversation.append(post)
    elif m := THREAD.match(line):
        close()
        threads.append([])
        where = m[1]
    elif (m := THREAD_POST.match(line)) and threads:
        post = start(login=m[1], label=m[2], at=m[3], where=where)
        threads[-1].append(post)
    elif post is None:
        continue
    elif block_end(i) or SECTION.match(line) or OMITTED.match(line) or INDEX_ROW.match(line):
        close()
    elif post["where"] == "review" and not post["at"] and (t := REVIEW_TIME.match(line)):
        post["at"] = t[1]
    elif not post["body"] and not post.get("link") and (u := OWN_LINK.match(line)):
        post["link"] = u[1]
    elif post["body"] or line:
        post["body"].append(line)
close()

conversation.sort(key=lambda p: p["at"])


def tail(chain: list[dict]) -> list[dict]:
    last_agent = max((n for n, p in enumerate(chain) if p["label"] in RUNS_OWN), default=-1)
    return chain[last_agent + 1 :]


def key(p: dict) -> str:
    digest = hashlib.sha256(p["body"].encode("utf-8")).hexdigest()[:12]
    return f"{p['at']} @{p['login']} {digest}"


# The export's attachment paths are relative to its own directory.
relink = f"../../pr/{number}/attachments/"


def entry(p: dict) -> str:
    body = re.sub(r"(\]\(|src=\")attachments/", rf"\g<1>{relink}", p["body"])
    quoted = "\n".join(f"> {line}" if line else ">" for line in body.split("\n"))
    return (
        f"\n**Operator on the PR** · {p['at']} · [{p['where']}]({p['link']})"
        f" <!-- golem-log-pr: {key(p)} -->\n\n{quoted}\n"
    )


logged = set(re.findall(r"<!-- golem-log-pr: (.+?) -->", log_path.read_text(encoding="utf-8")))
new = [p for chain in [conversation, *threads] for p in tail(chain) if key(p) not in logged]
new.sort(key=lambda p: p["at"])
with log_path.open("a", encoding="utf-8") as log:
    log.write("".join(entry(p) for p in new))
PY
