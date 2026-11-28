---
description: Marking what a turn added to a board as fresh, and clearing the old marks
paths:
  - 'src/*-board/app/config/**'
---

# The fresh mark on a board

**What a change adds to a board for the operator to see carries `fresh: true`,
and every older `fresh` on that board comes off in the same change.** The
board's New button steps through the marked cards, so a mark left over sends the
operator back to something already seen;
`grep -rl 'fresh: true' src/<name>-board/app/config/` finds them.

**The mark is set by hand, because whether a change is news is a judgement**: a
card moved, re-filed or tidied in passing is not, a card whose verdict changed
is. A line takes the mark too, drawn in its colour, though the button visits
cards only.
