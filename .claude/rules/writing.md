---
description: Form, shapes and voice for the posts drafted under writing/ — the per-draft contract every draft is held to, and the anti-slop rules seeded from marked-up drafts
paths:
  - writing/**
---

# Writing

Everything that holds for every draft under `writing/`. `writing/linkedin/plan.md`
is the backlog and the strategy — which posts exist, in what order, and what is
still unsettled — and does not restate any of this.

**The voice rules are seeded, not finished.** They get written against a
marked-up draft rather than anticipated, so what follows is what has actually
come back marked up. A rule here should name the tell it catches, not the
aesthetic it prefers.

## Layout and frontmatter

```
writing/
  notes/
    <slug>.md          # evidence gathered for a post not yet drafted
  <channel>/
    plan.md            # the backlog for that channel
    drafts/
      <slug>.md        # one file per post
```

`notes/` is for a claim that needs specimens rather than argument: the file
collects them as they occur, so the post is written from a record instead of
from memory. A backlog row whose objection is "this needs evidence" points at
its notes file, and the file retires with the post it fed — a notes file is
scaffolding for one draft, not a document the repo keeps.

| Key      | Meaning                                    |
| -------- | ------------------------------------------ |
| `source` | the case-study section its facts come from |
| `shape`  | one of the five below                      |
| `status` | `draft` \| `approved` \| `posted`          |
| `posted` | the date, once it is                       |

`source` exists so "which posts repeat this number?" is a grep rather than a
memory. The case study is the single source of truth for every fact, and a post
restates those facts rather than linking to them — a reader has nothing open.

## Form

- **1,000 characters, hard ceiling.** Long enough for one idea completely; short
  enough to be read whole.
- **The first two lines carry it.** LinkedIn folds at roughly 200 characters, so
  the opening states the concrete thing rather than promising it. No "I want to
  share some thoughts on…", no question-as-opener.
- **One idea per post.** A second good idea is a second post.
- **A few short paragraphs, broken at the turns** — where the post changes what
  it is doing, not every sentence. One block is a wall; one sentence per line is
  the house style of the genre and reads as the genre rather than as a person.
- **Numbers stay unrounded.** 3,487 files, 11.6 MB, 8,123 imports. The precision
  is the evidence.

## The five shapes

Naming the shapes is what stops eighteen posts from being eighteen variations of
one paragraph. They spell **FRAME**, which is the only reason to remember them in
this order. Drafts name a shape in frontmatter and never restate its definition.

- **Footgun** — a specific bug, why it was invisible, and the thing that catches
  it now. Ends on the mechanism, never on a moral.
- **Reversal** — a received best practice that is wrong in a named context, with
  the reason it's usually right left standing.
- **Artifact** — a small piece of real code, config or output, shown and then
  explained. The reader should be able to steal it.
- **Measurement** — a number nobody else has, and what it does and doesn't mean.
  Must include the deflating half; a measurement that only flatters is an ad.
- **Erratum** — a correction to my own record: something I got wrong or oversold,
  scored. It does the most for credibility, and must never be false modesty
  about something that actually went well.

Rough mix over any ten posts: 3 footgun, 2 reversal, 1 artifact, 2 measurement,
2 erratum. Errata are the scarce ingredient — overused they turn into a bit.

An announcement belongs to none of them. A one-off does not need a category
invented for it.

## Voice

- **`--`, never `—`.** Written as two hyphens on purpose. Enough readers now
  treat an em dash as a machine's fingerprint that the correct punctuation has
  become the wrong signal. This holds inside the post text itself; the prose
  around it in a draft file is ordinary Markdown and uses whatever punctuation
  reads best.
- **Emoji sparingly, and only self-deprecating.** One 🙈 doing real work is in
  the voice. Emoji as decoration, as bullet markers, or as enthusiasm is not.
  Text emoticons — `;-)` — are in the voice too.
- **Don't tighten the sentences.** The loose, slightly talked-out version is the
  voice: "Once done, I thought, why not write a case study about it" survives
  edits that would compress it. A draft that reads as efficient reads as edited
  by a machine, which is the thing being avoided.
- **The hook is the operator's call, not the agent's.** Given a choice of what to
  lead with, an agent reaches for the technically impressive detail and a reader
  wants the legible one — a number they can react to, a change in how the work
  felt, an admission. Offer the options; don't pick for them.

## A draft's post text is copy-exact

The fenced block in a draft is what gets pasted into LinkedIn, so it is one
unwrapped line per paragraph: a hard wrap in the source becomes a line break in
the feed. Keep it in a `text` fence for the same reason — `--`, `#` and `_`
survive unread, and Prettier leaves fenced content alone.

Text the operator supplied is verbatim and stays that way. Fill only the marked
blanks; anything else that looks like it wants fixing gets raised, not fixed.
