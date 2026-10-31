#!/usr/bin/env python3
"""How `/five-percent`'s proposals fared, summed over every branch that kept a verdict.

Each branch keeps its own file, `writing/notes/five-percent-verdicts/<branch>/verdicts.json`,
so two branches never edit one file and every one merges clean:

    {"pr": 212, "verdicts": [
      {"comment": 4378724025, "about": "<at most 80 characters>", "verdict": 0.4,
       "why": "<at most 280 characters>"}
    ]}

`.claude/skills/five-percent/verdicts.md` says what each field holds.

Usage: `python3 scripts/five-percent-verdicts/tally.py [--json | --check]`. A malformed file
fails the run, `--check` included, which is what `scripts/vet.sh` runs.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

VERDICTS_DIR = Path(__file__).resolve().parents[2] / "writing/notes/five-percent-verdicts"
LEAF = "verdicts.json"
ABOUT_MAX = 80
WHY_MAX = 280
ROW_KEYS = {"comment", "about", "verdict", "why"}


class Malformed(ValueError):
    pass


def positive_int(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool) and value > 0


def parse_leaf(path: Path, branch: str) -> list[dict[str, Any]]:
    """The file's rows, each tagged with its branch and PR; raises `Malformed` naming the fault."""
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        raise Malformed(f"{path}: not JSON — {error}") from error
    if not isinstance(data, dict) or set(data) != {"pr", "verdicts"}:
        raise Malformed(f'{path}: expected exactly the keys "pr" and "verdicts"')
    if not positive_int(data["pr"]):
        raise Malformed(f"{path}: pr must be a positive integer")
    if not isinstance(data["verdicts"], list):
        raise Malformed(f"{path}: verdicts must be a list")
    rows = []
    for i, row in enumerate(data["verdicts"]):
        where = f"{path}: verdicts[{i}]"
        if not isinstance(row, dict) or set(row) != ROW_KEYS:
            raise Malformed(f"{where}: expected exactly the keys {sorted(ROW_KEYS)}")
        if not positive_int(row["comment"]):
            raise Malformed(f"{where}: comment must be a review-comment id")
        for key, limit in (("about", ABOUT_MAX), ("why", WHY_MAX)):
            text = row[key]
            if not isinstance(text, str) or not text.strip() or len(text) > limit:
                raise Malformed(f"{where}: {key} must be 1–{limit} characters")
        verdict = row["verdict"]
        if isinstance(verdict, bool) or not isinstance(verdict, (int, float)) or not 0 <= verdict <= 1:
            raise Malformed(f"{where}: verdict must be a number from 0 to 1")
        rows.append({**row, "branch": branch, "pr": data["pr"]})
    return rows


def load(root: Path) -> list[dict[str, Any]]:
    """Every row under `root`, a comment id appearing twice being malformed."""
    rows: list[dict[str, Any]] = []
    for path in sorted(root.rglob(LEAF)):
        rows.extend(parse_leaf(path, path.parent.relative_to(root).as_posix()))
    seen: dict[int, str] = {}
    for row in rows:
        if row["comment"] in seen:
            raise Malformed(f"comment {row['comment']} has verdicts on both {seen[row['comment']]} and {row['branch']}")
        seen[row["comment"]] = row["branch"]
    return rows


def _summary(rows: list[dict[str, Any]]) -> dict[str, Any]:
    return {"count": len(rows), "mean": round(sum(r["verdict"] for r in rows) / len(rows), 3)}


def tally(rows: list[dict[str, Any]]) -> dict[str, Any]:
    branches: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        branches.setdefault(row["branch"], []).append(row)
    return {
        "all": _summary(rows) if rows else {"count": 0, "mean": None},
        "byBranch": {name: _summary(group) for name, group in sorted(branches.items())},
    }


def render(totals: dict[str, Any]) -> str:
    if not totals["all"]["count"]:
        return "No verdicts yet."
    lines = [f"All: {totals['all']['count']} proposals, mean verdict {totals['all']['mean']}"]
    lines.append("\nBy branch:")
    lines += [f"  {name}: {s['count']}, mean {s['mean']}" for name, s in totals["byBranch"].items()]
    return "\n".join(lines)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--json", action="store_true", help="print the totals as JSON")
    mode.add_argument("--check", action="store_true", help="validate every file and print one line")
    parser.add_argument("--root", type=Path, default=VERDICTS_DIR, help=argparse.SUPPRESS)
    args = parser.parse_args(argv)
    try:
        rows = load(args.root)
    except Malformed as error:
        print(f"five-percent-verdicts: {error}", file=sys.stderr)
        return 1
    if args.check:
        branches = len({r["branch"] for r in rows})
        print(f"five-percent-verdicts: ok — {len(rows)} verdict(s) across {branches} branch(es).")
    elif args.json:
        print(json.dumps(tally(rows), ensure_ascii=False, indent=2))
    else:
        print(render(tally(rows)))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
