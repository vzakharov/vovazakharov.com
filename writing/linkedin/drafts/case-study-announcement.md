---
source: whole document
shape: announcement
status: draft
blocked-on: claude/content-url-suffixes-j2qjau
---

# Case study announcement

Attaches `playgram.pdf`. No link in the body — the file is right there. No
sign-off line.

Everything but the three phrases below is the operator's own. This is the voice
specimen the writing rules calibrate against, so it does not get tightened,
rebalanced or improved.

603 characters, against the 1,000 ceiling; the fold at ~200 falls on the
sentence break, so the JSON lands above it.

```text
So from March to August this year I was doing quite a fun thing -- well, fun if you're the weird kind who loves dabbling with parsings, abstractions and 11.6-megabyte JSONs that live on a single line. Once done, I thought, why not write a case study about it. I only went halfway and it's already a 40-minute read 🙈 Not really thinking anyone would seriously read it all -- but maybe skim through? There's some interesting stuff on a lint rule whose failure mode was an authentication hole, two type shapes that both compiled while logging zeroes for months, and managing a team of 15+ agents at a time.
```

## The three phrases

Each names something concrete rather than a category:

- **"parsings, abstractions and …"** — the app's entire source was an 11.6 MB
  Bubble export, minified onto one line. VS Code crashes trying to open it.
- **first skim bait** — `safe-action-required`, the hand-written lint rule whose
  failure mode is a live authentication hole, because Next turns every export
  from a `'use server'` file into an endpoint the browser can call.
- **second skim bait** — `tokenCounts: { input, output }` sitting beside DB
  columns named `inputTokens`/`outputTokens`. Both type-checked; every usage log
  recorded zero, found by accident months later.

An announcement calibrates the personal register only, and says nothing about
the teaching register the other eighteen posts live in. Post #3, the
type-overlap gate, is the natural second calibration draft once the first round
of rules exists.
