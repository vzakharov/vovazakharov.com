"""The operator's words: what counts as one, and a row's split of them by where
they were written — typed into the session (`chat`), or posted on a pull request
the session exported (`review`)."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Dict, Optional

from lib.shape import ShapeError, mistyped, read_count, required

WORD = re.compile(r"\w+")
FENCE = re.compile(r"^ {0,3}(`{3,}|~{3,})")
QUOTE = re.compile(r"^ {0,3}>")


def count_words(text: str) -> int:
    return len(WORD.findall(text))


def review_words(markdown: str) -> int:
    """The words a post adds of its own: a quoted line is someone else's, and a
    fenced block — a suggestion included — is code rather than words."""
    words, fence = 0, ""
    for line in markdown.split("\n"):
        opener = FENCE.match(line)
        if fence:
            if opener is not None and opener.group(1)[0] == fence[0] and len(opener.group(1)) >= len(fence):
                fence = ""
            continue
        if opener is not None:
            fence = opener.group(1)
            continue
        if QUOTE.match(line) is None:
            words += count_words(line)
    return words


@dataclass
class OperatorWords:
    chat: int
    review: int


def parse_operator_words(value: Any, where: str) -> Optional[OperatorWords]:
    """A row written before the split carries a bare count, every word of which
    was typed into the session."""
    if value is None:
        return None
    if isinstance(value, int) and not isinstance(value, bool):
        return OperatorWords(chat=value, review=0)
    if not isinstance(value, dict):
        raise mistyped(where, "operatorWords", value, "an object")
    return OperatorWords(
        chat=required(read_count, value, "chat", f"{where} operatorWords"),
        review=required(read_count, value, "review", f"{where} operatorWords"),
    )


def parse_post_words(value: Any, where: str) -> Dict[str, int]:
    """`{post id: words}`, as a row's `reviewPosts` and the pending file both
    hold it."""
    if value is None:
        return {}
    if not isinstance(value, dict) or not all(
        isinstance(key, str) and isinstance(n, int) and not isinstance(n, bool) for key, n in value.items()
    ):
        raise ShapeError(f"{where}: not a map of post ids to word counts")
    return dict(value)
