# PR #102: fix(basilisk): callout link inherits the paragraph's size in print

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/102
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/callout-print-font-size-urflmp
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-04T22:42:15Z
- **Updated:** 2026-10-05T05:54:55Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- In the PDF of a basilisk case filed with `noAi: true`, the "More on why a robot with no AI in it is still filed" callout printed its link 1.2× larger than the words around it.
- The cause: the link is a Mantine `Anchor`, which is `Text` underneath and sets its own `font-size` (the `md` scale, 16px). On screen that matches the prose; in print the paragraph drops to 10pt and the link stayed at 16px.
- The fix is `inherit` on that `InternalLink`, the same prop every other inline `InternalLink` in the tree already carries.
- Checked against a headless-Chromium print of `/cases/figure-02-molten-steel`: before, the link's glyph box was ~27.2pt tall against ~22.7pt for "More on"; after, both are ~22.7pt.

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
- [ ] `screen` — Open the same case on screen in both themes and confirm the callout looks unchanged.

| Item     | Automatable | Covered? | Notes                                                       |
| -------- | ----------- | -------- | ----------------------------------------------------------- |
| `pdf`    | manual-only | —        | A rendered-PDF check; the suite covers no component or page |
| `screen` | manual-only | —        | Visual check; the suite covers no component or page         |

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_011VHnWbxDZ5b551sCJMEHUN

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-04T22:42:43Z — "Proposed squash title/body: ``` fix(basilisk): callout link…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-04T22:42:43Z

[https://github.com/vzakharov/vovazakharov.com/pull/102#issuecomment-5985254676](https://github.com/vzakharov/vovazakharov.com/pull/102#issuecomment-5985254676)

Proposed squash title/body:

```
fix(basilisk): callout link keeps the paragraph's size in print (pr #102)
```

```
The PDF of every case filed with `noAi: true` printed the link in its
"More on why a robot with no AI in it is still filed" callout 1.2x
larger than the words around it.

The link is a Mantine Anchor, which is Text underneath and sets its own
font-size from the `md` scale. On screen that matches the prose; in
print the paragraph drops to 10pt while the link stayed at 16px. The
callout's link now takes `inherit`, as every other inline InternalLink
in the tree already does.

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

- **T01** `docs/remove-before-merging/squash-message.md`:16 — unresolved — last: @vzakharov (human) 2026-10-05T05:54:46Z — "хм, так если every other inline InternalLink already does, м…" → [↓](#t01)

<a id="t01"></a>

### `docs/remove-before-merging/squash-message.md`:16 — unresolved

```diff
@@ -0,0 +1,30 @@
… 11 lines elided …
+The link is a Mantine Anchor, which is Text underneath and sets its own
+font-size from the `md` scale. On screen that matches the prose; in
+print the paragraph drops to 10pt while the link stayed at 16px. The
+callout's link now takes `inherit`, as every other inline InternalLink
+in the tree already does.
```

**@vzakharov (human)** — 2026-10-05T05:54:46Z

хм, так если every other inline InternalLink already does, может это зафиксировать внутри InternalLink? Или бывают случаи когда это не нужно?

---

## Timeline (status, references, and other events)

- **2026-10-05T05:54:55Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/102#pullrequestreview-5410427121.
