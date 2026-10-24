"""Where each word of a known text falls in a recording, read off a CTC model's
per-frame log-probabilities.

Imported as `from lib.ctc import spans`. Numpy only, so the alignment needs no
torch: `ears.place` feeds it GigaAM-v3's frames, and `test_ctc.py` beside it
runs it on hand-built ones.
"""

from __future__ import annotations

from typing import Optional

import numpy as np


def path(log_probs: np.ndarray, targets: list[int], blank: int) -> list[int]:
    """The most likely state per frame of a CTC path spelling `targets` in
    order: state `2k + 1` emits target `k`, an even state is a blank.

    Viterbi over the blank-interleaved targets; a target may follow the one
    before it directly unless the two are equal, which CTC can only tell apart
    by a blank between them. Raises when the frames are too few to spell the
    targets, since a forced path through them would be fiction.
    """
    frames = log_probs.shape[0]
    ext = np.full(2 * len(targets) + 1, blank)
    ext[1::2] = targets
    states = len(ext)
    skip = np.zeros(states, bool)
    skip[3::2] = ext[3::2] != ext[1:-2:2]
    score = np.full(states, -np.inf)
    score[0] = log_probs[0, blank]
    if states > 1:
        score[1] = log_probs[0, ext[1]]
    back = np.zeros((frames, states), np.int8)
    for t in range(1, frames):
        stay = score
        step = np.concatenate(([-np.inf], score[:-1]))
        jump = np.where(skip, np.concatenate(([-np.inf, -np.inf], score[:-2])), -np.inf)
        moves = np.stack([stay, step, jump])
        back[t] = moves.argmax(0)
        score = moves.max(0) + log_probs[t, ext]
    last = states - 1 if states == 1 or score[-1] >= score[-2] else states - 2
    if not np.isfinite(score[last]):
        raise ValueError(f"{frames} frames cannot spell {len(targets)} tokens")
    out = [last]
    for t in range(frames - 1, 0, -1):
        last -= int(back[t, last])
        out.append(last)
    return out[::-1]


def spans(
    log_probs: np.ndarray, words: list[list[int]], blank: int, space: Optional[int] = None
) -> list[tuple[int, int]]:
    """Each word's first and last frame, its tokens forced through the
    recording in order, a `space` token between words where the model has one.

    A word with no tokens — nothing in it the model's vocabulary spells — has
    no frames, and its span is `(-1, -1)`.
    """
    targets: list[int] = []
    owner: list[int] = []
    for k, word in enumerate(words):
        if not word:
            continue
        if targets and space is not None:
            targets.append(space)
            owner.append(-1)
        targets += word
        owner += [k] * len(word)
    found = [(-1, -1)] * len(words)
    if not targets:
        return found
    for frame, state in enumerate(path(log_probs, targets, blank)):
        if state % 2 == 0:
            continue
        k = owner[state // 2]
        if k < 0:
            continue
        first, _ = found[k]
        found[k] = (frame if first < 0 else first, frame)
    return found
