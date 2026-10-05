# PR #102: fix: internal links take the surrounding text's size by default

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/102
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/callout-print-font-size-urflmp
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-04T22:42:15Z
- **Updated:** 2026-10-05T06:24:13Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- In the PDF of a basilisk case filed with `noAi: true`, the "More on why a robot with no AI in it is still filed" callout printed its link 1.2× larger than the words around it.
- The cause: the link is a Mantine `Anchor`, which is `Text` underneath and sets its own `font-size` (the `md` scale, 16px). On screen that matches the prose; in print the paragraph drops to 10pt and the link stayed at 16px. Every other inline `InternalLink` already passed `inherit`; this one didn't.
- So `InternalLink` now inherits by default, unless the caller names a `size`: Mantine's `inherit` rule overrides the one `size` drives, and the two "← back" links that ask for `sm` would otherwise lose it. `inherit` is no longer a prop of `InternalLink` at all, so the 18 explicit ones are gone and nothing can set it beside a `size`.
- One visible change on screen: `ChipNav`'s linked chips (a document's Full / Mini / Nano, a page's languages) passed neither prop and rendered at 16px beside the current chip's 14px. They now take the row's `sm`, so the row is one size.
- Checked by computed style in headless Chromium: the callout link prints at 13.33px (10pt), as its paragraph does; on `/case-studies/playgram` the Mini/Nano chips read 14px (16px with `data-inherit` removed, i.e. before), and "← Case studies" keeps its 14px `sm`.

### Ride-along: muthur sync `cea7c20..30300f0`

| Source commit | Verdict | Why |
| --- | --- | --- |
| `30300f0` estimate comment justifies the team, not the work — `.claude/costs/{CLAUDE.md,estimate.py,hooks/estimate-notice.sh,lib/estimate.py}` | take | The four files are verbatim here; ported as 2deeb65 |
| `30300f0` — `.claude/costs/sessions/…json` | skip (not adopted) | `sessions/` is each repo's own and never synced |
| `b38d61b` let auto mode delete a session's own branch on origin — `branch-rename`, `from-branch` | take | Both skills are verbatim here; ported as a2f61fa |
| `b38d61b` — `docs/adopting/web-remote.md` | skip (not adopted) | Declined "never": the source's adopter guide |
| `b38d61b` — `.claude/costs/sessions/…json` | skip (not adopted) | As above |

The watermark moves to `30300f0` in its own last commit.

## QA Checklist

- [ ] `pdf` — Open the PDF of a `noAi: true` case (e.g. `figure-02-molten-steel.pdf`) and confirm the callout's link is the same size as "More on" and the paragraphs around it.
- [ ] `chips` — Open a case study with cuts (e.g. `/case-studies/playgram`) and confirm the Full / Mini / Nano chips are one size; same for the language chips on a song page.
- [ ] `back-links` — On the same case study and on a song page, confirm the "← Case studies" / "← back" link above the title is still the smaller size, not the body's.
- [ ] `inline-links` — Skim the home page, the CV and a basilisk case on screen and confirm inline links (byline, "Read the case study →", footer links, CV name) look unchanged.

| Item           | Automatable | Covered? | Notes                                                       |
| -------------- | ----------- | -------- | ----------------------------------------------------------- |
| `pdf`          | manual-only | —        | A rendered-PDF check; the suite covers no component or page |
| `chips`        | manual-only | —        | Visual check; the suite covers no component or page         |
| `back-links`   | manual-only | —        | Visual check; the suite covers no component or page         |
| `inline-links` | manual-only | —        | Visual check; the suite covers no component or page         |

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01ApW5LhJYDsk3oFsLLXJ2KC

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-04T22:42:43Z — "Proposed squash title/body: ``` fix: internal links take the…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-04T22:42:43Z

[https://github.com/vzakharov/vovazakharov.com/pull/102#issuecomment-5985254676](https://github.com/vzakharov/vovazakharov.com/pull/102#issuecomment-5985254676)

Proposed squash title/body:

```
fix: internal links take the surrounding text's size by default (pr #102)
```

```
The PDF of every case filed with `noAi: true` printed the link in its
"More on why a robot with no AI in it is still filed" callout 1.2x
larger than the words around it: a Mantine Anchor states its own
font-size, print re-keys the paragraph and not the link, and that one
InternalLink was missing the `inherit` every other inline one carried.

InternalLink now inherits unless the caller names a `size`, which
Mantine's inherit rule would otherwise override, and no longer takes
`inherit` as a prop. ChipNav's linked chips, which passed neither, drop
from 16px to the row's 14px and match the current chip beside them.

The agent infrastructure vendored from muthur moved, and two of its
fixes ride along: the human-hour estimate's comment now justifies each
part's role, grade and hours rather than summarising the work, and
/from-branch and /branch-rename delete a session's own branch on origin
in a shape the auto-mode classifier lets through — its own call, name
literal, leased to the SHA proven safe.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_1 resolved thread omitted; re-run with `--include-resolved` to export it._

## Timeline (status, references, and other events)

- **2026-10-05T05:54:55Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/102#pullrequestreview-5410427121.
- **2026-10-05T06:01:35Z** @vzakharov renamed from «fix(basilisk): callout link inherits the paragraph's size in print» to «fix: internal links take the surrounding text's size by default».
