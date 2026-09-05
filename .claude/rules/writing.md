---
description: Voice and punctuation conventions for the LinkedIn drafts under writing/ — the anti-slop rules, seeded with the two that are already settled
paths:
  - writing/**
---

# Writing

Conventions for the posts under `writing/`. `writing/linkedin/plan.md` carries
the rest of the form — the character ceiling, the five shapes, the sequencing —
and this file carries only what is worth enforcing on every draft.

**This file is seeded, not finished.** The anti-slop rules get written against a
marked-up draft rather than anticipated, so what follows is the two conventions
already settled out loud. Add to it as drafts come back marked up; a rule here
should name the tell it catches, not the aesthetic it prefers.

- **`--`, never `—`.** Written as two hyphens on purpose. Enough readers now
  treat an em dash as a machine's fingerprint that the correct punctuation has
  become the wrong signal. This holds inside the post text itself; the prose
  around it in a draft file is ordinary Markdown and uses whatever punctuation
  reads best.
- **Emoji sparingly, and only self-deprecating.** One 🙈 doing real work is in
  the voice. Emoji as decoration, as bullet markers, or as enthusiasm is not.
  Text emoticons — `;-)` — are in the voice too.

## A draft's post text is copy-exact

The fenced block in a draft is what gets pasted into LinkedIn, so it is one
unwrapped line per paragraph: a hard wrap in the source becomes a line break in
the feed. Keep it in a `text` fence for the same reason — `--`, `#` and `_`
survive unread, and Prettier leaves fenced content alone.
