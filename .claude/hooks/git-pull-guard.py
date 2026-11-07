#!/usr/bin/env python3
"""`PreToolUse` hook on `Bash`: deny any command that runs `git pull`.

A pull fetches and then merges `FETCH_HEAD`, and any other fetch in the same
checkout — a background poller's, a sibling session's — rewrites that file in
between, so the merge can bring in a branch nobody named. Fetching a named ref
and merging `origin/<branch>` names what lands.

`DANGEROUSLY_GIT_PULL=1` among the leading assignments of the very simple
command that runs the pull lets it through: the exemption is visible in each
command that takes it, where an exported variable would cover every pull after
it.

Fails open on a command `shlex` cannot split or an unreadable payload, saying so
on stderr, since the guard cannot tell what such a command runs.
"""

from __future__ import annotations

import json
import sys
from typing import Optional, Sequence

from shell_words import ASSIGNMENT, WRAPPERS, program, simple_commands, tokens, unwrap

HATCH = "DANGEROUSLY_GIT_PULL=1"
SHELLS = {"bash", "sh", "zsh", "dash"}

# Options of `git` itself that take the following word as their argument.
GIT_ARGUMENT_OPTIONS = {
    "-C",
    "-c",
    "--git-dir",
    "--work-tree",
    "--namespace",
    "--config-env",
    "--super-prefix",
}
# Options of `git pull` that take the following word as their argument.
PULL_ARGUMENT_OPTIONS = {
    "-s",
    "--strategy",
    "-X",
    "--strategy-option",
    "--depth",
    "--deepen",
    "--shallow-since",
    "--shallow-exclude",
    "-j",
    "--jobs",
    "--upload-pack",
    "-o",
    "--server-option",
    "--negotiation-tip",
}


class Pull:
    """A `git pull` a command runs: its remote, branch and mode as given."""

    def __init__(self, args: list[str]) -> None:
        self.ff_only = "--ff-only" in args
        self.rebase = any(a in ("-r", "--rebase") or a.startswith("--rebase=") for a in args)
        if "--no-rebase" in args:
            self.rebase = False
        operands: list[str] = []
        skip = False
        for arg in args:
            if skip:
                skip = False
            elif arg in PULL_ARGUMENT_OPTIONS:
                skip = True
            elif not arg.startswith("-"):
                operands.append(arg)
        self.remote = operands[0] if operands else None
        branch = operands[1].lstrip("+").split(":", 1)[0] if len(operands) > 1 else None
        self.branch = branch.removeprefix("refs/heads/") if branch else None


def git_subcommand(args: list[str]) -> Optional[tuple[str, list[str]]]:
    """The subcommand a `git` invocation runs and its arguments, past git's own
    options, or None when it names none."""
    i = 0
    while i < len(args) and args[i].startswith("-"):
        i += 2 if args[i] in GIT_ARGUMENT_OPTIONS else 1
    return (args[i], args[i + 1 :]) if i < len(args) else None


def pull_in(words: list[str], inherited: Sequence[str] = ()) -> Optional[Pull]:
    """The `git pull` one simple command runs without the hatch, or None.
    `inherited` holds the assignments of the commands wrapping this one."""
    seen = list(inherited)
    while True:
        run = program(words)
        if run is None:
            return None
        seen.extend(w for w in words[: len(words) - len(run[1]) - 1] if ASSIGNMENT.match(w))
        name, args = run
        if name in WRAPPERS:
            seen.extend(a for a in args if ASSIGNMENT.match(a))
            words = unwrap(name, args)
            continue
        if name in SHELLS and "-c" in args[:-1]:
            return pull_in_command(args[args.index("-c") + 1], seen)
        if name != "git":
            return None
        sub = git_subcommand(args)
        if sub is None or sub[0] != "pull" or HATCH in seen:
            return None
        return Pull(sub[1])


def pull_in_command(command: str, inherited: Sequence[str] = ()) -> Optional[Pull]:
    """The first `git pull` a command line runs without the hatch, or None.
    Raises `ValueError` when the line cannot be split."""
    for simple in simple_commands(tokens(command)):
        found = pull_in(simple.words, inherited)
        if found:
            return found
    return None


def reason(pull: Pull) -> str:
    remote = pull.remote or "origin"
    branch = pull.branch or "<branch>"
    ref = f"{remote}/{branch}"
    if pull.rebase:
        integrate = f"git rebase {ref}"
    elif pull.ff_only:
        integrate = f"git merge --ff-only {ref}"
    else:
        integrate = f"git merge {ref}"
    named = (
        ""
        if pull.branch
        else " Name the branch you mean — the current one is `git branch --show-current`."
    )
    return (
        "`git pull` is blocked in this repo. A pull merges FETCH_HEAD, and any other "
        "fetch in this checkout — a background poller's, a sibling session's — may "
        "have rewritten it since, so the merge can bring in a branch nobody named. "
        f"Fetch the ref and merge it by name instead: `git fetch {remote} {branch} && "
        f"{integrate}`.{named} If a pull is genuinely what this case needs, put "
        f"`{HATCH}` in front of the command (`{HATCH} git pull …`) and it goes through."
    )


def say(message: str) -> None:
    print(f"git-pull-guard: {message}", file=sys.stderr)


def main() -> int:
    try:
        payload = json.loads(sys.stdin.read())
        command = payload["tool_input"]["command"]
    except (ValueError, KeyError, TypeError):
        say("unreadable payload; command allowed.")
        return 0
    if payload.get("tool_name") != "Bash" or not isinstance(command, str):
        return 0
    try:
        pull = pull_in_command(command)
    except ValueError as error:
        say(f"cannot split the command ({error}); command allowed.")
        return 0
    if pull is None:
        return 0
    json.dump(
        {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": reason(pull),
            }
        },
        sys.stdout,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
