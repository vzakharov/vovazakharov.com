# PR #9: feat: hydrate issue #4 into the Playgram case study, Part I

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/9
- **Author:** @vzakharov
- **Base ← Head:** main ← claude/playgram-case-study-part-1-9mxhgs
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-08-21T00:55:19Z
- **Updated:** 2026-08-27T13:10:15Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **Turns the brief in #4 into three finished documents** under a new `content/` root: the full case study (~9,100 words of prose), plus genuine rewrites at ~1,900 and ~420 words rather than truncations. No page, no PDF, no route — the issue defers those.
- **Every bracketed placeholder is filled from the Playgram repo's actual history**, not estimated: 1,537 commits, 1,063 merged PRs, 3,487 split files, 362 enabled lint rules (28 hand-written), 8,123 internal imports with zero boundary violations, the real `type-overlap` ratchet sequence, all 33 skills, and a live workflow excerpt from the Bubble split.
- **Six of the brief's claims did not survive checking**, and the articles carry the corrected version of each. Most consequential: the export is documented as **~25 MB**, not 11 MB — that figure is identical across all 87 revisions of the file recording it, and the raw JSON is gitignored so it cannot be measured. Also: the docs-only stretch was four days rather than two weeks; the GCP detour ran Railway → Cloud Run → Railway rather than starting on GCP; the framework was never deliberated; the four-provider model panel is accurate only from 14 March; and Zeroqode's "#1 plugin provider" is unsupportable from any neutral source.
- **Adds a hand-written SVG chart** generated from a committed CSV, so the chart and the prose cannot disagree. It carries the finding the brief asked to have confirmed — the method change is a four-week seam, not a spot, and the number that actually proves the parallelism is that churn per commit stays flat at ~400 lines while commits/day rise 63%.
- **Files three follow-up article issues** (#6, #7, #8) so the deferred depth has a home instead of bloating Part I.

Two deviations worth the reviewer's attention: the full version is ~50% over the planned ~6,000 words, and the tightening pass established that this is substance rather than padding (it recovered 68 words), so getting to 6,000 means cutting researched sections — a scope call left open. And every external citation was replaced after verification; the commonly-cited Bubble case studies (Comet, Dividend Finance) trace only to agency marketing and are not used.

## QA Checklist

- [ ] `render-full` — open `content/case-studies/playgram-bubble-to-nextjs-part-1.md` on GitHub and confirm the Mermaid import-graph diagram, the SVG chart, and the screen-recording embed all render
- [ ] `chart-themes` — view the rendered chart with GitHub set to light and then to dark; the line, annotations and milestone labels must be legible in both, with nothing clipped at the right edge or the baseline
- [ ] `handoff-img` — the `/plan` handoff screenshot loads and its copyable `/implement` command is readable at article width
- [ ] `cross-links` — the three cuts' relative links to each other resolve on GitHub (full ↔ mini ↔ micro)
- [ ] `verdicts` — nine verdicts present: split 10/10, decision docs 6.5/10, FSD 8.5/10, linting 10/10, planning 6/10, cloud VMs 10/10, skills 8/10, plan+implement 9/10, context hygiene 9/10 — each with its justification in your voice
- [ ] `callouts` — each of the eight `>` callouts stands on its own when skimmed, without the paragraph that set it up
- [ ] `facts` — spot-check the six corrections against your own memory, especially the ~25 MB export size, which is the one the repo cannot settle either way
- [ ] `disclosure` — confirm no workspace names, customer names, private-repo links, bare `#NNNN` references or commit SHAs appear in any of the three documents
- [ ] `part-two-boundary` — confirm Part II's territory stays in Part II throughout, including in the two shorter cuts

| Item                | Automatable | Covered? | Notes                                                                                                                                        |
| ------------------- | ----------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `render-full`       | manual-only | —        | GitHub's Markdown pipeline decides whether Mermaid, an SVG `img` and a bare attachment URL render; only looking tells you                    |
| `chart-themes`      | manual-only | —        | The SVG's `prefers-color-scheme` block was verified in headless Chromium in both schemes, but legibility at article width is a judgment call |
| `handoff-img`       | manual-only | —        | Whether a 2306×1754 screenshot stays readable when scaled into a column is visual                                                            |
| `cross-links`       | integration | ❌       | A link-checker over `content/**/*.md` would catch relative-path drift; none exists yet                                                       |
| `verdicts`          | manual-only | —        | The scores are yours; only you can confirm the justifications read as your reasoning                                                         |
| `callouts`          | manual-only | —        | Self-containment when skimmed is exactly the thing a test cannot assert                                                                      |
| `facts`             | manual-only | —        | The 11 MB vs ~25 MB question is unresolvable from the repo — it needs your recollection                                                      |
| `disclosure`        | unit        | ❌       | Grep-shaped and worth automating if `content/` grows: deny-list of workspace names, `Playgramai/`, bare `#\d+`, 7–40 char hex                |
| `part-two-boundary` | manual-only | —        | Requires judgment about what counts as crossing the line                                                                                     |

Note on the table: this branch adds Markdown and static assets only, so there is nothing here for the existing `pnpm build` to type-check beyond confirming the export still succeeds. `Covered?` is left unknown per the docs-only rule rather than implying tests that don't apply.

Closes #4

https://claude.ai/code/session_01WW73aYEna7HFtXTkAJHYJr

---

## Comments

### Comment by @vzakharov on 2026-08-21T00:56:00Z

[https://github.com/vzakharov/vovazakharov.com/pull/9#issuecomment-5363878249](https://github.com/vzakharov/vovazakharov.com/pull/9#issuecomment-5363878249)

Proposed squash title/body:

```
feat: #4 write the Playgram case study, Part I (pr #9)
```

```
Issue #4 is a 5,300-word brief in note form — Vova's own prose,
structure and verdicts, with roughly twenty bracketed placeholders
marking where an agent was to go find the real numbers, excerpts and
diagrams. This hydrates it into three finished documents under a new
`content/` root, kept separate from `docs/` because `docs/` is agent
and process material that finalize sweeps off the trunk while this is
publishable site content: the full case study plus rewrites at roughly
a fifth and a twentieth of its length, and a chart generated from a
committed CSV so the figures and the prose cannot drift apart. The
issue defers the page and the PDF, so nothing here renders a route.

Filling the placeholders from the Playgram repo's history contradicted
six of the brief's claims, and the documents carry the corrected
version of each. The export is documented as ~25 MB rather than 11 MB,
identically across every revision of the file that records it, and the
raw JSON is gitignored so neither figure can be measured now. The
docs-only stretch at the start was four days, not two weeks — the app
was bootstrapped on day 5 and the first feature code landed on day 7,
which is a stronger claim than the original because it is checkable.
The GCP episode ran Railway to Cloud Run and back inside 72 hours
rather than starting on GCP. The framework was never deliberated;
"Next.js rebuild" is in the first commit message and no decision doc
weighs an alternative. The four-provider model panel describes the
process only from 14 March. And Zeroqode's "#1 plugin provider" is
unsupportable from any neutral source, so their own wording stands in
its place. Every external citation was verified by fetching it; the
usual Bubble success stories were dropped because their platform
attribution traces only to agency marketing.

The research also settled the one thing the brief explicitly asked to
have confirmed, and settled it against the brief: the point where the
working method changed is a four-week seam rather than a spot. Three
independent signals agree on where it sits, and the evidence for
parallelism turns out to be that churn per commit stays flat at ~400
lines while commits per day rise 63% — same-sized units of work, more
of them at once. Three follow-up issues (#6, #7, #8) take the skill
library, the type-overlap ratchet and the export-splitting technique,
so the deferred depth has somewhere to go instead of enlarging Part I.

Closes #4

Co-authored-by: Claude <noreply@anthropic.com>
```

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### Comment by @vzakharov on 2026-08-24T22:36:30Z

[https://github.com/vzakharov/vovazakharov.com/pull/9#issuecomment-5402424242](https://github.com/vzakharov/vovazakharov.com/pull/9#issuecomment-5402424242)

Review round addressed — all thirteen comments have replies on their own threads. Three things that go beyond them and are worth your attention before the next pass.

**The chart's headline claim was wrong, and the recount rescued it.** The old note said "churn per commit stays flat at ~400 lines while commits per day go up 63%". The 63% turned out to be April compared with June — two cherry-picked months. Measured properly either side of the seam, and counting only code (see below), it's **367 changed lines before and 330 after, while units per day go 6.1 → 8.9**. Same shape as your original claim, smaller magnitude, and now reproducible.

Two of the three supporting signals were also misdescribed. The `Co-Authored-By: Claude` trailer never stops — it runs to the last commit. What stops is the _local CLI's model-named form_ (`Claude Opus 4.6`, `Claude Sonnet 4.6`, `Claude Opus 4.7 (1M context)`), 393 commits through March and April; the cloud's bare `Claude` form takes over in May and runs to 806. That's a cleaner signal than the one it replaced. And the seam starts on **24 April**, when pull requests first appear at all — the `(pr #…)` squash marker the old note keyed on is a month-late lagging indicator.

**The chart is rebuilt as two panels** on a shared timeline: cumulative units of work, and units landed per week. Both exclude `docs:` commits per your call — the decision-doc fortnight put two 97-commit weeks at the head of the series and flattened everything after it. The weekly bars carry dashed release ticks, so the four-week run at the ceiling reads against the 4.1.0 cutover it was racing toward. Your three readings of it all hold, and the third has a signature in the commit mix: fixes are 39% of everything landing in the run-up to 4.1.0, then refactors go 11% → 17% afterwards. That arc is now a paragraph under the chart.

**Two claims I could not source, flagged rather than quietly asserted.** That the other three are the original Bubble developers is inferable from the `@zeroqode.com` addresses plus the project's nature, but nothing in the repo says it — the article states it on your authority. And the "~25 MB" export figure is identical across all 87 revisions of the file recording it, so it was copied forward rather than re-measured; I can't account for where it came from, only that 11.6 MB is what you say it is and the 13.6 MB split output is consistent with that.

One repo-hygiene note unrelated to the review: `scripts/lib/__pycache__/github.cpython-311.pyc` is checked in, so running the export script dirties the tree every time. I left it alone — say the word and I'll untrack it.

`./scripts/vet.sh` is green. It wasn't before this round: `format:check` had never passed on the content tree, so there's a whitespace-only prettier commit in here too.

---

_Generated by [Claude Code](https://claude.ai/code)_

---

## Review threads

### Review by @vzakharov — COMMENTED

_2026-08-24T22:08:35Z_

This is a first round of review, concerning just up to (not including) the "What" part of the case study, but it doesn't mean you should keep everything else untouched. Most of the comments touch the bigger picture too -- so pls treat it as more than just proofreading and editing a word or sentence here and there.

Also, where things require some additional exploration/research, in which you're mostly only interested in a summarizable end result of (as opposed to the research itself), it's better to launch a subagent than waste your own context.

### Review by @vzakharov — COMMENTED

_2026-08-27T13:10:14Z_

Reviewed up until "## The strutwork", but pls consider the requests, where they generalize, as applying to further text as well. Also cf. the "human edits" commit to see what kind of stuff I'm removing and rephrasing.

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:12

```diff
@@ -0,0 +1,696 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                          |                                                                        |
+| ------------------------ | ---------------------------------------------------------------------- |
+| **Assignment**           | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase |
+| **Span**                 | 6 March – 20 August 2026 · 168 days                                     |
+| **The "code" I started from** | a ~25 MB minified JSON — the Bubble app export                     |
+| **Shipped**              | 1,537 commits to `main` · 1,063 merged pull requests · 244,000 lines of TypeScript |
+| **Cold load**            | multi-second → sub-second                                              |
+| **Releases**             | 4 majors, 3 workspace cutovers, zero rollbacks                          |
```

**@vzakharov** — 2026-08-24T21:44:40Z

I'd actually mention the total # of releases made; each had some substantial bulk of work in it, so it in itself is an indication of how fast the development continued in an agent-driven *code*base

**@vzakharov** — 2026-08-24T22:35:56Z

Added, and the number is better than I expected: **48 versioned releases plus 18 hotfixes** in the window — a production deploy every 2.4 days. Both figures are in the numbers strip now (`4705d69`). Worth knowing there are no GitHub Release objects at all; releases are annotated tags cut by CI, and hotfixes deploy untagged by convention, so the 66 total comes from `docs/release-notes/` rather than the Releases page.

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:8

```diff
@@ -0,0 +1,696 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                          |                                                                        |
+| ------------------------ | ---------------------------------------------------------------------- |
+| **Assignment**           | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase |
+| **Span**                 | 6 March – 20 August 2026 · 168 days                                     |
```

**@vzakharov** — 2026-08-24T21:49:33Z

Let's stop at 4.4.3, August 10 -- the last release consisting predominantly of "my" PRs; after that I was only code-reviewing and release-managing; by the way, this in itself can also be presented as a deliverable: the remaining team managed to continue work on the repo even after I largely left the project. Actually those people are the original bubble devs for the app with close to zero experience with code -- which comes to show just how convenient the built infrastructure was for them. This is load-bearing: it was always supposed that other people will continue working on the project, so the fact that even people with little coding experience can conveniently continue working on it (and those aren't just trifle "center div" PRs) comes to show things weren't in vain. Of course, we do not want to phrase all of it in a way that puts them in a bad light -- they are actual great devs who managed to build a monster of an app using no code at all -- it's to strictly note the experience with code-based tools.

(Of course, when we have the commit graph showing my involvement frames, it will be seen that the rate of commits dropped after I left, and it's good for the ultimate "hire me" cta, but we don't want to be braggy about it or smth.)

**@vzakharov** — 2026-08-24T22:35:57Z

Done — the window is now 6 March – 10 August, 158 days, and everything is recounted against it. The handover is a new closing section before "To be continued", plus a line in the timeline table.

The evidence is stronger than the framing you suggested. In the eleven days after 4.4.3, **38 of the 42 merged PRs were the other three's**; your four were two sets of release notes, a CI permissions fix and an agent-tooling change — no product code. And every one of those 38 came through the plan → implement → DRY → tighten-docs → finalize pipeline, with 84% carrying a live agent session link.

On the "close to zero coding experience" point, the repo does support it: two of the three opened their GitHub accounts during this project, one on day one, and neither has any public code before it. The third's only prior code is a term of introductory Java exercises from 2020. I wrote the section to lead with what they shipped (the 77-file metering change, the data recovery that proved the naive fix would have destroyed a thousand deliberately-deleted files, the spreadsheet reader that cut a 2.4s stall to 76ms) and to say plainly that not-having-worked-in-a-repo is not the same as being junior.

One thing I could not source: that they are the original Bubble devs. That is inferable from the `@zeroqode.com` addresses plus the project's nature, but nothing in the repo states it — so the article asserts it on your authority, not on evidence. Say the word if you want it softened.

On the rate drop: I kept it to one sentence and hedged it, because eleven days is genuinely too short a window to carry a claim.

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:9

```diff
@@ -0,0 +1,696 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                          |                                                                        |
+| ------------------------ | ---------------------------------------------------------------------- |
+| **Assignment**           | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase |
+| **Span**                 | 6 March – 20 August 2026 · 168 days                                     |
+| **The "code" I started from** | a ~25 MB minified JSON — the Bubble app export                     |
```

**@vzakharov** — 2026-08-24T21:50:54Z

No, the JSON is literally 11.6 MB; the references to the otherwise in the code must be either generalizations or misguided. The fact that it "expanded" post-splitting is explainable because the split code includes imports etc., and because it has line breaks while the original export doesn't.

**@vzakharov** — 2026-08-24T22:35:59Z

Corrected to 11.6 MB in all three cuts (`9ca60b7`). The full version was also self-contradicting — it said 25 MB in two places and 11 MB in a third.

Your explanation checks out against the repo, incidentally: the split output is 13.6 MB against the 11.6 MB single-line original, which is about the expansion you'd expect from imports and line breaks. Where "~25 MB" came from I still cannot account for; it is identical across all 87 revisions of the file recording it, so it was copied forward rather than re-measured.

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:10

```diff
@@ -0,0 +1,696 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                          |                                                                        |
+| ------------------------ | ---------------------------------------------------------------------- |
+| **Assignment**           | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase |
+| **Span**                 | 6 March – 20 August 2026 · 168 days                                     |
+| **The "code" I started from** | a ~25 MB minified JSON — the Bubble app export                     |
+| **Shipped**              | 1,537 commits to `main` · 1,063 merged pull requests · 244,000 lines of TypeScript |
```

**@vzakharov** — 2026-08-24T21:51:12Z

make sure to re-count given the above mentioned time frame

**@vzakharov** — 2026-08-24T22:36:00Z

Recounted (`4705d69`). Against 6 March – 10 August: **1,395 units of work on `main`, 1,029 merged PRs, ~250,000 lines of TypeScript** (about 120,000 of that tests). Previously 1,537 / 1,063 / 244,000 over the longer window.

Two notes on method. "Units of work" is first-parent, per your point that every commit to `main` is a complete unit — total commits reachable is 1,503, the difference being real merge commits from the release and hotfix lanes. And the TypeScript count went _up_ while the window shrank because the old figure was measured differently; nothing generated or vendored is in the tree to exclude.

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:13

```diff
@@ -0,0 +1,696 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                          |                                                                        |
+| ------------------------ | ---------------------------------------------------------------------- |
+| **Assignment**           | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase |
+| **Span**                 | 6 March – 20 August 2026 · 168 days                                     |
+| **The "code" I started from** | a ~25 MB minified JSON — the Bubble app export                     |
+| **Shipped**              | 1,537 commits to `main` · 1,063 merged pull requests · 244,000 lines of TypeScript |
+| **Cold load**            | multi-second → sub-second                                              |
+| **Releases**             | 4 majors, 3 workspace cutovers, zero rollbacks                          |
+| **Team**                 | me, and somewhere between ten and twenty-five Claude Code agents at a time |
```

**@vzakharov** — 2026-08-24T21:53:31Z

not just that; there were three actual other people working on the repo (but they were employing the agents too, and in the same agentic infrastructure we talk about below)

**@vzakharov** — 2026-08-24T22:36:01Z

Added. The numbers strip now reads "four people, and ten to twenty-five Claude Code agents at a time", and the handover section says who the other three are and that they were running the same infrastructure — 130 of their 145 merged PRs across the whole history are on `claude/*` or `issue/*` branches, i.e. driven by the skills described in the article rather than around them.

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:29

```diff
@@ -0,0 +1,696 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                          |                                                                        |
+| ------------------------ | ---------------------------------------------------------------------- |
+| **Assignment**           | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase |
+| **Span**                 | 6 March – 20 August 2026 · 168 days                                     |
+| **The "code" I started from** | a ~25 MB minified JSON — the Bubble app export                     |
+| **Shipped**              | 1,537 commits to `main` · 1,063 merged pull requests · 244,000 lines of TypeScript |
+| **Cold load**            | multi-second → sub-second                                              |
+| **Releases**             | 4 majors, 3 workspace cutovers, zero rollbacks                          |
+| **Team**                 | me, and somewhere between ten and twenty-five Claude Code agents at a time |
+
+_Disclaimer: the disclosures in this case study were approved by Playgram management, i.e. no NDA breach._
+
+---
+
+After I started writing this case study, I realized that even the [brief](https://github.com/vzakharov/vovazakharov.com/issues/4) I'd give Claude to hydrate turned out to be 5,300 words long — and even then, after I'd finished it I understood that I'd only scratched the surface of everything I wanted to tell. So, (a) sorry it's so long, (b) check out the [mini version](./playgram-bubble-to-nextjs-part-1.mini.md) and the [micro version](./playgram-bubble-to-nextjs-part-1.micro.md), and (c) I'll post more detailed insights on some or all of the aspects later.
+
+## Intro
+
+In case you didn't know, Bubble is a no-code app builder.
+
+When you think of such tools, you'd think that people would just use it to make simple things — a directory site, an internal CRUD tool, a booking form, the kind of marketplace MVP you build to find out whether anyone wants it.
+
+But you'd be surprised how far people can actually take it.
+
+[Ohana](https://bubble.io/blog/ohana/) is a subletting marketplace built on Bubble from day one; its hosts have earned $16.2 million through it, and [Stripe's own customer page](https://stripe.com/customers/ohana) — the payment processor's numbers, not the founders' — forecasts $60 million in annual payment volume for 2026. [SuiteOp](https://bubble.io/blog/suiteop/) runs hospitality operations for over a hundred organizations and up to 30,000 daily guest users, on a $3 million seed round [independently reported](https://hoteltechnologynews.com/2025/04/suiteop-raises-3-million-to-scale-its-hospitality-operations-platform-for-small-to-mid-sized-lodging-operators/) in the trade press. [Formula Bot](https://bubble.io/blog/formula-bot/) is a one-person company that reached a million users, built by a non-programmer over a paternity leave.
```

**@vzakharov** — 2026-08-24T21:54:55Z

Condense into smth like "...can actually take it -- from [subletting marketplaces](...) to [hospitality ...](...), from ... to ...".

**@vzakharov** — 2026-08-24T22:36:02Z

Condensed to a single sentence in your shape — "from a subletting marketplace … to a hospitality operations platform … to a one-person company …" (`9ca60b7`). I dropped the SuiteOp seed-round citation entirely; it was the least load-bearing and the most upstage-y of the three.

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:45

```diff
@@ -0,0 +1,696 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                          |                                                                        |
+| ------------------------ | ---------------------------------------------------------------------- |
+| **Assignment**           | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase |
+| **Span**                 | 6 March – 20 August 2026 · 168 days                                     |
+| **The "code" I started from** | a ~25 MB minified JSON — the Bubble app export                     |
+| **Shipped**              | 1,537 commits to `main` · 1,063 merged pull requests · 244,000 lines of TypeScript |
+| **Cold load**            | multi-second → sub-second                                              |
+| **Releases**             | 4 majors, 3 workspace cutovers, zero rollbacks                          |
+| **Team**                 | me, and somewhere between ten and twenty-five Claude Code agents at a time |
+
+_Disclaimer: the disclosures in this case study were approved by Playgram management, i.e. no NDA breach._
+
+---
+
+After I started writing this case study, I realized that even the [brief](https://github.com/vzakharov/vovazakharov.com/issues/4) I'd give Claude to hydrate turned out to be 5,300 words long — and even then, after I'd finished it I understood that I'd only scratched the surface of everything I wanted to tell. So, (a) sorry it's so long, (b) check out the [mini version](./playgram-bubble-to-nextjs-part-1.mini.md) and the [micro version](./playgram-bubble-to-nextjs-part-1.micro.md), and (c) I'll post more detailed insights on some or all of the aspects later.
+
+## Intro
+
+In case you didn't know, Bubble is a no-code app builder.
+
+When you think of such tools, you'd think that people would just use it to make simple things — a directory site, an internal CRUD tool, a booking form, the kind of marketplace MVP you build to find out whether anyone wants it.
+
+But you'd be surprised how far people can actually take it.
+
+[Ohana](https://bubble.io/blog/ohana/) is a subletting marketplace built on Bubble from day one; its hosts have earned $16.2 million through it, and [Stripe's own customer page](https://stripe.com/customers/ohana) — the payment processor's numbers, not the founders' — forecasts $60 million in annual payment volume for 2026. [SuiteOp](https://bubble.io/blog/suiteop/) runs hospitality operations for over a hundred organizations and up to 30,000 daily guest users, on a $3 million seed round [independently reported](https://hoteltechnologynews.com/2025/04/suiteop-raises-3-million-to-scale-its-hospitality-operations-platform-for-small-to-mid-sized-lodging-operators/) in the trade press. [Formula Bot](https://bubble.io/blog/formula-bot/) is a one-person company that reached a million users, built by a non-programmer over a paternity leave.
+
+None of those are toys. A lot of software you've used was probably drawn rather than typed.
+
+In our case, we're talking about Playgram, an app that managed to put together a chat interface giving access to multiple providers and models, realtime team/project chat UIs, libraries of generated images & files, memory & knowledge management, voice input, and tons of other small "nifties" — all brought to life with no code at all:
+
+https://github.com/user-attachments/assets/16e67cd5-5727-419b-be2b-ffaa2541a44c
+
+(This is a screen recording already after migration to code, but you get the idea.)
+
+So why would then they want to switch to code if it was all so great?
+
+## Why
+
+**1 — Performance.** However hard you try, when you put abstraction over abstraction over abstraction to make an app work in a "draw a couple of interconnected boxes, and it just works" fashion, you're bound to hurt the performance.
+
+To be fair to Bubble, they don't hide it. Their [own performance guide](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling) explains that the platform "sends the code for all the elements (visible and invisible)" before it draws anything, that "the number of elements is a bigger factor than the type of elements", that "a nested repeating group has a multiplicative effect on the number of elements", and — my favourite — that "plugins have their code included on each page load regardless if it's used". It's a document about clawing performance back by removing things.
```

**@vzakharov** — 2026-08-24T21:57:38Z

"hurt the performance. The platform — quoting its own [performance guide](...) — sends ..., degrades proportionally to ... and ships the code of every plugin you install — whether it’s installed or not — on ..."

And we don't need to know what kind of a document it is, I feel like you keep veering off into writing about the stuff you/other agents found while researching, lowkey forgetting it's meant to be supporting evidence, not the protagonist (let's call it "upstaging" so I can refer to it easier below). No offense!

**@vzakharov** — 2026-08-24T22:36:03Z

Rewritten to your phrasing, folded into the same paragraph as the bold lead-in (`9ca60b7`). "To be fair to Bubble, they don't hide it" and "It's a document about clawing performance back by removing things" are both gone.

I took the upstaging note as a general instruction, not a local one, and swept the whole document for it rather than just this stretch — see the reply on the review itself for the list.

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:47

```diff
@@ -0,0 +1,696 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                          |                                                                        |
+| ------------------------ | ---------------------------------------------------------------------- |
+| **Assignment**           | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase |
+| **Span**                 | 6 March – 20 August 2026 · 168 days                                     |
+| **The "code" I started from** | a ~25 MB minified JSON — the Bubble app export                     |
+| **Shipped**              | 1,537 commits to `main` · 1,063 merged pull requests · 244,000 lines of TypeScript |
+| **Cold load**            | multi-second → sub-second                                              |
+| **Releases**             | 4 majors, 3 workspace cutovers, zero rollbacks                          |
+| **Team**                 | me, and somewhere between ten and twenty-five Claude Code agents at a time |
+
+_Disclaimer: the disclosures in this case study were approved by Playgram management, i.e. no NDA breach._
+
+---
+
+After I started writing this case study, I realized that even the [brief](https://github.com/vzakharov/vovazakharov.com/issues/4) I'd give Claude to hydrate turned out to be 5,300 words long — and even then, after I'd finished it I understood that I'd only scratched the surface of everything I wanted to tell. So, (a) sorry it's so long, (b) check out the [mini version](./playgram-bubble-to-nextjs-part-1.mini.md) and the [micro version](./playgram-bubble-to-nextjs-part-1.micro.md), and (c) I'll post more detailed insights on some or all of the aspects later.
+
+## Intro
+
+In case you didn't know, Bubble is a no-code app builder.
+
+When you think of such tools, you'd think that people would just use it to make simple things — a directory site, an internal CRUD tool, a booking form, the kind of marketplace MVP you build to find out whether anyone wants it.
+
+But you'd be surprised how far people can actually take it.
+
+[Ohana](https://bubble.io/blog/ohana/) is a subletting marketplace built on Bubble from day one; its hosts have earned $16.2 million through it, and [Stripe's own customer page](https://stripe.com/customers/ohana) — the payment processor's numbers, not the founders' — forecasts $60 million in annual payment volume for 2026. [SuiteOp](https://bubble.io/blog/suiteop/) runs hospitality operations for over a hundred organizations and up to 30,000 daily guest users, on a $3 million seed round [independently reported](https://hoteltechnologynews.com/2025/04/suiteop-raises-3-million-to-scale-its-hospitality-operations-platform-for-small-to-mid-sized-lodging-operators/) in the trade press. [Formula Bot](https://bubble.io/blog/formula-bot/) is a one-person company that reached a million users, built by a non-programmer over a paternity leave.
+
+None of those are toys. A lot of software you've used was probably drawn rather than typed.
+
+In our case, we're talking about Playgram, an app that managed to put together a chat interface giving access to multiple providers and models, realtime team/project chat UIs, libraries of generated images & files, memory & knowledge management, voice input, and tons of other small "nifties" — all brought to life with no code at all:
+
+https://github.com/user-attachments/assets/16e67cd5-5727-419b-be2b-ffaa2541a44c
+
+(This is a screen recording already after migration to code, but you get the idea.)
+
+So why would then they want to switch to code if it was all so great?
+
+## Why
+
+**1 — Performance.** However hard you try, when you put abstraction over abstraction over abstraction to make an app work in a "draw a couple of interconnected boxes, and it just works" fashion, you're bound to hurt the performance.
+
+To be fair to Bubble, they don't hide it. Their [own performance guide](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling) explains that the platform "sends the code for all the elements (visible and invisible)" before it draws anything, that "the number of elements is a bigger factor than the type of elements", that "a nested repeating group has a multiplicative effect on the number of elements", and — my favourite — that "plugins have their code included on each page load regardless if it's used". It's a document about clawing performance back by removing things.
+
+But the part you can't claw back is the floor. A Bubble page ships three render-blocking platform bundles before your app exists, and developers measuring [an almost-empty page](https://forum.bubble.io/t/seeking-advice-on-slow-page-loads-in-bubble-applications/327360) — one text heading, nothing else — report a Lighthouse Speed Index of 1.5–1.7 seconds. The most quoted reply in that thread, to someone asking whether others had hit the same wall on minimal pages, is four words: _"Yes, every single user."_
```

**@vzakharov** — 2026-08-24T21:59:49Z

"A group of developers [measured](...) and found out ..."

No need to mention "the most quoted reply" (upstaging)

**@vzakharov** — 2026-08-24T22:36:04Z

Done — "a group of developers [measured] an almost-empty page … and found a Lighthouse Speed Index of 1.5–1.7 seconds". The most-quoted-reply sentence is cut (`9ca60b7`).

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:51

```diff
@@ -0,0 +1,696 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                          |                                                                        |
+| ------------------------ | ---------------------------------------------------------------------- |
+| **Assignment**           | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase |
+| **Span**                 | 6 March – 20 August 2026 · 168 days                                     |
+| **The "code" I started from** | a ~25 MB minified JSON — the Bubble app export                     |
+| **Shipped**              | 1,537 commits to `main` · 1,063 merged pull requests · 244,000 lines of TypeScript |
+| **Cold load**            | multi-second → sub-second                                              |
+| **Releases**             | 4 majors, 3 workspace cutovers, zero rollbacks                          |
+| **Team**                 | me, and somewhere between ten and twenty-five Claude Code agents at a time |
+
+_Disclaimer: the disclosures in this case study were approved by Playgram management, i.e. no NDA breach._
+
+---
+
+After I started writing this case study, I realized that even the [brief](https://github.com/vzakharov/vovazakharov.com/issues/4) I'd give Claude to hydrate turned out to be 5,300 words long — and even then, after I'd finished it I understood that I'd only scratched the surface of everything I wanted to tell. So, (a) sorry it's so long, (b) check out the [mini version](./playgram-bubble-to-nextjs-part-1.mini.md) and the [micro version](./playgram-bubble-to-nextjs-part-1.micro.md), and (c) I'll post more detailed insights on some or all of the aspects later.
+
+## Intro
+
+In case you didn't know, Bubble is a no-code app builder.
+
+When you think of such tools, you'd think that people would just use it to make simple things — a directory site, an internal CRUD tool, a booking form, the kind of marketplace MVP you build to find out whether anyone wants it.
+
+But you'd be surprised how far people can actually take it.
+
+[Ohana](https://bubble.io/blog/ohana/) is a subletting marketplace built on Bubble from day one; its hosts have earned $16.2 million through it, and [Stripe's own customer page](https://stripe.com/customers/ohana) — the payment processor's numbers, not the founders' — forecasts $60 million in annual payment volume for 2026. [SuiteOp](https://bubble.io/blog/suiteop/) runs hospitality operations for over a hundred organizations and up to 30,000 daily guest users, on a $3 million seed round [independently reported](https://hoteltechnologynews.com/2025/04/suiteop-raises-3-million-to-scale-its-hospitality-operations-platform-for-small-to-mid-sized-lodging-operators/) in the trade press. [Formula Bot](https://bubble.io/blog/formula-bot/) is a one-person company that reached a million users, built by a non-programmer over a paternity leave.
+
+None of those are toys. A lot of software you've used was probably drawn rather than typed.
+
+In our case, we're talking about Playgram, an app that managed to put together a chat interface giving access to multiple providers and models, realtime team/project chat UIs, libraries of generated images & files, memory & knowledge management, voice input, and tons of other small "nifties" — all brought to life with no code at all:
+
+https://github.com/user-attachments/assets/16e67cd5-5727-419b-be2b-ffaa2541a44c
+
+(This is a screen recording already after migration to code, but you get the idea.)
+
+So why would then they want to switch to code if it was all so great?
+
+## Why
+
+**1 — Performance.** However hard you try, when you put abstraction over abstraction over abstraction to make an app work in a "draw a couple of interconnected boxes, and it just works" fashion, you're bound to hurt the performance.
+
+To be fair to Bubble, they don't hide it. Their [own performance guide](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling) explains that the platform "sends the code for all the elements (visible and invisible)" before it draws anything, that "the number of elements is a bigger factor than the type of elements", that "a nested repeating group has a multiplicative effect on the number of elements", and — my favourite — that "plugins have their code included on each page load regardless if it's used". It's a document about clawing performance back by removing things.
+
+But the part you can't claw back is the floor. A Bubble page ships three render-blocking platform bundles before your app exists, and developers measuring [an almost-empty page](https://forum.bubble.io/t/seeking-advice-on-slow-page-loads-in-bubble-applications/327360) — one text heading, nothing else — report a Lighthouse Speed Index of 1.5–1.7 seconds. The most quoted reply in that thread, to someone asking whether others had hit the same wall on minimal pages, is four words: _"Yes, every single user."_
+
+To spoil the ending: moving Playgram to Next changed cold load times from multi-second to sub-second; something which is _instantly_ tangible for a user, even if "wait a couple secs at first load" doesn't sound like such a big thing.
+
+**2 — Bumping into Bubble's edges.** Every platform has edges. This one is named after the thing that pops when you reach them.
```

**@vzakharov** — 2026-08-24T22:00:16Z

"Bumping into the bubble's edges", and remove the part after the bold

**@vzakharov** — 2026-08-24T22:36:06Z

Both done: renamed to "Bumping into the bubble's edges", and the "Every platform has edges / named after the thing that pops" tail is gone. The bold lead-in now runs straight into the paragraph that followed it, matching the pattern of points 1 and 3 (`9ca60b7`).

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:53

```diff
@@ -0,0 +1,696 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                          |                                                                        |
+| ------------------------ | ---------------------------------------------------------------------- |
+| **Assignment**           | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase |
+| **Span**                 | 6 March – 20 August 2026 · 168 days                                     |
+| **The "code" I started from** | a ~25 MB minified JSON — the Bubble app export                     |
+| **Shipped**              | 1,537 commits to `main` · 1,063 merged pull requests · 244,000 lines of TypeScript |
+| **Cold load**            | multi-second → sub-second                                              |
+| **Releases**             | 4 majors, 3 workspace cutovers, zero rollbacks                          |
+| **Team**                 | me, and somewhere between ten and twenty-five Claude Code agents at a time |
+
+_Disclaimer: the disclosures in this case study were approved by Playgram management, i.e. no NDA breach._
+
+---
+
+After I started writing this case study, I realized that even the [brief](https://github.com/vzakharov/vovazakharov.com/issues/4) I'd give Claude to hydrate turned out to be 5,300 words long — and even then, after I'd finished it I understood that I'd only scratched the surface of everything I wanted to tell. So, (a) sorry it's so long, (b) check out the [mini version](./playgram-bubble-to-nextjs-part-1.mini.md) and the [micro version](./playgram-bubble-to-nextjs-part-1.micro.md), and (c) I'll post more detailed insights on some or all of the aspects later.
+
+## Intro
+
+In case you didn't know, Bubble is a no-code app builder.
+
+When you think of such tools, you'd think that people would just use it to make simple things — a directory site, an internal CRUD tool, a booking form, the kind of marketplace MVP you build to find out whether anyone wants it.
+
+But you'd be surprised how far people can actually take it.
+
+[Ohana](https://bubble.io/blog/ohana/) is a subletting marketplace built on Bubble from day one; its hosts have earned $16.2 million through it, and [Stripe's own customer page](https://stripe.com/customers/ohana) — the payment processor's numbers, not the founders' — forecasts $60 million in annual payment volume for 2026. [SuiteOp](https://bubble.io/blog/suiteop/) runs hospitality operations for over a hundred organizations and up to 30,000 daily guest users, on a $3 million seed round [independently reported](https://hoteltechnologynews.com/2025/04/suiteop-raises-3-million-to-scale-its-hospitality-operations-platform-for-small-to-mid-sized-lodging-operators/) in the trade press. [Formula Bot](https://bubble.io/blog/formula-bot/) is a one-person company that reached a million users, built by a non-programmer over a paternity leave.
+
+None of those are toys. A lot of software you've used was probably drawn rather than typed.
+
+In our case, we're talking about Playgram, an app that managed to put together a chat interface giving access to multiple providers and models, realtime team/project chat UIs, libraries of generated images & files, memory & knowledge management, voice input, and tons of other small "nifties" — all brought to life with no code at all:
+
+https://github.com/user-attachments/assets/16e67cd5-5727-419b-be2b-ffaa2541a44c
+
+(This is a screen recording already after migration to code, but you get the idea.)
+
+So why would then they want to switch to code if it was all so great?
+
+## Why
+
+**1 — Performance.** However hard you try, when you put abstraction over abstraction over abstraction to make an app work in a "draw a couple of interconnected boxes, and it just works" fashion, you're bound to hurt the performance.
+
+To be fair to Bubble, they don't hide it. Their [own performance guide](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling) explains that the platform "sends the code for all the elements (visible and invisible)" before it draws anything, that "the number of elements is a bigger factor than the type of elements", that "a nested repeating group has a multiplicative effect on the number of elements", and — my favourite — that "plugins have their code included on each page load regardless if it's used". It's a document about clawing performance back by removing things.
+
+But the part you can't claw back is the floor. A Bubble page ships three render-blocking platform bundles before your app exists, and developers measuring [an almost-empty page](https://forum.bubble.io/t/seeking-advice-on-slow-page-loads-in-bubble-applications/327360) — one text heading, nothing else — report a Lighthouse Speed Index of 1.5–1.7 seconds. The most quoted reply in that thread, to someone asking whether others had hit the same wall on minimal pages, is four words: _"Yes, every single user."_
+
+To spoil the ending: moving Playgram to Next changed cold load times from multi-second to sub-second; something which is _instantly_ tangible for a user, even if "wait a couple secs at first load" doesn't sound like such a big thing.
+
+**2 — Bumping into Bubble's edges.** Every platform has edges. This one is named after the thing that pops when you reach them.
+
+All too many Bubble developers have faced the same thing again and again as their apps grow: they meet the system's limits and end up installing (and sometimes purchasing) third-party plugins, running vanilla JS in the browser, or even writing their own reactivity frameworks to make up for what Bubble can not provide. You don't have to take my word for how common that is — Bubble published [its own ranking of the top community plugins](https://bubble.io/blog/top-community-plugins-templates-2023/), and the number one plugin, with over 538,000 lifetime downloads, is Toolbox: a plugin whose purpose is to let you run custom JavaScript. The most popular thing anyone ever built for the no-code platform is a way out of it. Two of the five top templates that year were entire homegrown application frameworks built on top of Bubble, for the same reason one layer up.
```

**@vzakharov** — 2026-08-24T22:01:55Z

"You don't have to take my word", let's avoid salesspeak. Just "Quite illustratively, the number one Bubble plugin, with ..., is [one that allows](...) running custom JavaScript.

**@vzakharov** — 2026-08-24T22:36:07Z

Done, in your words — "Quite illustratively, the number one Bubble plugin, with over 538,000 lifetime downloads, is one that allows running custom JavaScript" (`9ca60b7`). I kept "the most popular thing anyone ever built for the platform is a way out of it", since that reads as the argument rather than as sales copy — cut it if you disagree.

One knock-on: dropping the Toolbox name here left "Remember Toolbox?" further down with no antecedent, so the step-zero discovery now reintroduces it as "the run-custom-JavaScript plugin from a few paragraphs up".

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:55

```diff
@@ -0,0 +1,696 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                          |                                                                        |
+| ------------------------ | ---------------------------------------------------------------------- |
+| **Assignment**           | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase |
+| **Span**                 | 6 March – 20 August 2026 · 168 days                                     |
+| **The "code" I started from** | a ~25 MB minified JSON — the Bubble app export                     |
+| **Shipped**              | 1,537 commits to `main` · 1,063 merged pull requests · 244,000 lines of TypeScript |
+| **Cold load**            | multi-second → sub-second                                              |
+| **Releases**             | 4 majors, 3 workspace cutovers, zero rollbacks                          |
+| **Team**                 | me, and somewhere between ten and twenty-five Claude Code agents at a time |
+
+_Disclaimer: the disclosures in this case study were approved by Playgram management, i.e. no NDA breach._
+
+---
+
+After I started writing this case study, I realized that even the [brief](https://github.com/vzakharov/vovazakharov.com/issues/4) I'd give Claude to hydrate turned out to be 5,300 words long — and even then, after I'd finished it I understood that I'd only scratched the surface of everything I wanted to tell. So, (a) sorry it's so long, (b) check out the [mini version](./playgram-bubble-to-nextjs-part-1.mini.md) and the [micro version](./playgram-bubble-to-nextjs-part-1.micro.md), and (c) I'll post more detailed insights on some or all of the aspects later.
+
+## Intro
+
+In case you didn't know, Bubble is a no-code app builder.
+
+When you think of such tools, you'd think that people would just use it to make simple things — a directory site, an internal CRUD tool, a booking form, the kind of marketplace MVP you build to find out whether anyone wants it.
+
+But you'd be surprised how far people can actually take it.
+
+[Ohana](https://bubble.io/blog/ohana/) is a subletting marketplace built on Bubble from day one; its hosts have earned $16.2 million through it, and [Stripe's own customer page](https://stripe.com/customers/ohana) — the payment processor's numbers, not the founders' — forecasts $60 million in annual payment volume for 2026. [SuiteOp](https://bubble.io/blog/suiteop/) runs hospitality operations for over a hundred organizations and up to 30,000 daily guest users, on a $3 million seed round [independently reported](https://hoteltechnologynews.com/2025/04/suiteop-raises-3-million-to-scale-its-hospitality-operations-platform-for-small-to-mid-sized-lodging-operators/) in the trade press. [Formula Bot](https://bubble.io/blog/formula-bot/) is a one-person company that reached a million users, built by a non-programmer over a paternity leave.
+
+None of those are toys. A lot of software you've used was probably drawn rather than typed.
+
+In our case, we're talking about Playgram, an app that managed to put together a chat interface giving access to multiple providers and models, realtime team/project chat UIs, libraries of generated images & files, memory & knowledge management, voice input, and tons of other small "nifties" — all brought to life with no code at all:
+
+https://github.com/user-attachments/assets/16e67cd5-5727-419b-be2b-ffaa2541a44c
+
+(This is a screen recording already after migration to code, but you get the idea.)
+
+So why would then they want to switch to code if it was all so great?
+
+## Why
+
+**1 — Performance.** However hard you try, when you put abstraction over abstraction over abstraction to make an app work in a "draw a couple of interconnected boxes, and it just works" fashion, you're bound to hurt the performance.
+
+To be fair to Bubble, they don't hide it. Their [own performance guide](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling) explains that the platform "sends the code for all the elements (visible and invisible)" before it draws anything, that "the number of elements is a bigger factor than the type of elements", that "a nested repeating group has a multiplicative effect on the number of elements", and — my favourite — that "plugins have their code included on each page load regardless if it's used". It's a document about clawing performance back by removing things.
+
+But the part you can't claw back is the floor. A Bubble page ships three render-blocking platform bundles before your app exists, and developers measuring [an almost-empty page](https://forum.bubble.io/t/seeking-advice-on-slow-page-loads-in-bubble-applications/327360) — one text heading, nothing else — report a Lighthouse Speed Index of 1.5–1.7 seconds. The most quoted reply in that thread, to someone asking whether others had hit the same wall on minimal pages, is four words: _"Yes, every single user."_
+
+To spoil the ending: moving Playgram to Next changed cold load times from multi-second to sub-second; something which is _instantly_ tangible for a user, even if "wait a couple secs at first load" doesn't sound like such a big thing.
+
+**2 — Bumping into Bubble's edges.** Every platform has edges. This one is named after the thing that pops when you reach them.
+
+All too many Bubble developers have faced the same thing again and again as their apps grow: they meet the system's limits and end up installing (and sometimes purchasing) third-party plugins, running vanilla JS in the browser, or even writing their own reactivity frameworks to make up for what Bubble can not provide. You don't have to take my word for how common that is — Bubble published [its own ranking of the top community plugins](https://bubble.io/blog/top-community-plugins-templates-2023/), and the number one plugin, with over 538,000 lifetime downloads, is Toolbox: a plugin whose purpose is to let you run custom JavaScript. The most popular thing anyone ever built for the no-code platform is a way out of it. Two of the five top templates that year were entire homegrown application frameworks built on top of Bubble, for the same reason one layer up.
+
+In the case of Playgram, by the way, the makers are Zeroqode, who describe themselves as "one of the largest developers for Bubble.io space" and list 800+ plugins by their own count — and two of the five most-installed community plugins in Bubble's 2023 round-up are theirs. And they still felt like they were lacking. When the people who supply everyone else's escape hatches start wanting out, that tells you something.
```

**@vzakharov** — 2026-08-24T22:03:05Z

no need for the "describe themselves" reservations; just "Zeroqode, with a ballpark of 800 plugins shipped, of which two were among the five most-installed community plugins for Bubble in 2003"

**@vzakharov** — 2026-08-24T22:36:08Z

Done, in your words (with 2023 rather than 2003) — "Zeroqode, with a ballpark of 800 plugins shipped, two of which were among the five most-installed community plugins for Bubble in 2023". The "describe themselves" hedging and the unsupportable "#1 plugin provider" framing are both gone (`9ca60b7`).

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:52

```diff
@@ -0,0 +1,696 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                          |                                                                        |
+| ------------------------ | ---------------------------------------------------------------------- |
+| **Assignment**           | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase |
+| **Span**                 | 6 March – 20 August 2026 · 168 days                                     |
+| **The "code" I started from** | a ~25 MB minified JSON — the Bubble app export                     |
+| **Shipped**              | 1,537 commits to `main` · 1,063 merged pull requests · 244,000 lines of TypeScript |
+| **Cold load**            | multi-second → sub-second                                              |
+| **Releases**             | 4 majors, 3 workspace cutovers, zero rollbacks                          |
+| **Team**                 | me, and somewhere between ten and twenty-five Claude Code agents at a time |
+
+_Disclaimer: the disclosures in this case study were approved by Playgram management, i.e. no NDA breach._
+
+---
+
+After I started writing this case study, I realized that even the [brief](https://github.com/vzakharov/vovazakharov.com/issues/4) I'd give Claude to hydrate turned out to be 5,300 words long — and even then, after I'd finished it I understood that I'd only scratched the surface of everything I wanted to tell. So, (a) sorry it's so long, (b) check out the [mini version](./playgram-bubble-to-nextjs-part-1.mini.md) and the [micro version](./playgram-bubble-to-nextjs-part-1.micro.md), and (c) I'll post more detailed insights on some or all of the aspects later.
+
+## Intro
+
+In case you didn't know, Bubble is a no-code app builder.
+
+When you think of such tools, you'd think that people would just use it to make simple things — a directory site, an internal CRUD tool, a booking form, the kind of marketplace MVP you build to find out whether anyone wants it.
+
+But you'd be surprised how far people can actually take it.
+
+[Ohana](https://bubble.io/blog/ohana/) is a subletting marketplace built on Bubble from day one; its hosts have earned $16.2 million through it, and [Stripe's own customer page](https://stripe.com/customers/ohana) — the payment processor's numbers, not the founders' — forecasts $60 million in annual payment volume for 2026. [SuiteOp](https://bubble.io/blog/suiteop/) runs hospitality operations for over a hundred organizations and up to 30,000 daily guest users, on a $3 million seed round [independently reported](https://hoteltechnologynews.com/2025/04/suiteop-raises-3-million-to-scale-its-hospitality-operations-platform-for-small-to-mid-sized-lodging-operators/) in the trade press. [Formula Bot](https://bubble.io/blog/formula-bot/) is a one-person company that reached a million users, built by a non-programmer over a paternity leave.
+
+None of those are toys. A lot of software you've used was probably drawn rather than typed.
+
+In our case, we're talking about Playgram, an app that managed to put together a chat interface giving access to multiple providers and models, realtime team/project chat UIs, libraries of generated images & files, memory & knowledge management, voice input, and tons of other small "nifties" — all brought to life with no code at all:
+
+https://github.com/user-attachments/assets/16e67cd5-5727-419b-be2b-ffaa2541a44c
+
+(This is a screen recording already after migration to code, but you get the idea.)
+
+So why would then they want to switch to code if it was all so great?
+
+## Why
+
+**1 — Performance.** However hard you try, when you put abstraction over abstraction over abstraction to make an app work in a "draw a couple of interconnected boxes, and it just works" fashion, you're bound to hurt the performance.
+
+To be fair to Bubble, they don't hide it. Their [own performance guide](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling) explains that the platform "sends the code for all the elements (visible and invisible)" before it draws anything, that "the number of elements is a bigger factor than the type of elements", that "a nested repeating group has a multiplicative effect on the number of elements", and — my favourite — that "plugins have their code included on each page load regardless if it's used". It's a document about clawing performance back by removing things.
+
+But the part you can't claw back is the floor. A Bubble page ships three render-blocking platform bundles before your app exists, and developers measuring [an almost-empty page](https://forum.bubble.io/t/seeking-advice-on-slow-page-loads-in-bubble-applications/327360) — one text heading, nothing else — report a Lighthouse Speed Index of 1.5–1.7 seconds. The most quoted reply in that thread, to someone asking whether others had hit the same wall on minimal pages, is four words: _"Yes, every single user."_
+
+To spoil the ending: moving Playgram to Next changed cold load times from multi-second to sub-second; something which is _instantly_ tangible for a user, even if "wait a couple secs at first load" doesn't sound like such a big thing.
+
+**2 — Bumping into Bubble's edges.** Every platform has edges. This one is named after the thing that pops when you reach them.
+
+All too many Bubble developers have faced the same thing again and again as their apps grow: they meet the system's limits and end up installing (and sometimes purchasing) third-party plugins, running vanilla JS in the browser, or even writing their own reactivity frameworks to make up for what Bubble can not provide. You don't have to take my word for how common that is — Bubble published [its own ranking of the top community plugins](https://bubble.io/blog/top-community-plugins-templates-2023/), and the number one plugin, with over 538,000 lifetime downloads, is Toolbox: a plugin whose purpose is to let you run custom JavaScript. The most popular thing anyone ever built for the no-code platform is a way out of it. Two of the five top templates that year were entire homegrown application frameworks built on top of Bubble, for the same reason one layer up.
+
+In the case of Playgram, by the way, the makers are Zeroqode, who describe themselves as "one of the largest developers for Bubble.io space" and list 800+ plugins by their own count — and two of the five most-installed community plugins in Bubble's 2023 round-up are theirs. And they still felt like they were lacking. When the people who supply everyone else's escape hatches start wanting out, that tells you something.
+
+**3 — Missing out on all the AI agents stuff.** Although Bubble has been making inroads into using AI for its builders, needless to say its capabilities are far behind what modern tools like Claude Code, Cursor, or Codex provide. The team was feeling like they were missing out on being able to deliver more features in smaller time frames.
```

**@vzakharov** — 2026-08-24T22:05:27Z

"more features in smaller time frames" is another cool thing to wrap for the initial summary and elsewhere: three actual things that come to mind is how fast we delivered the entire billing featurework (things that turn in-app credits from "something we advertise in the landing page" to "something we actually count and based on which we quota the users), the entire access control thing (member groups, limiting model availabilities per group & individually, setting credit quotas per group & individually) -- good luck shipping it that fast with no code.

**@vzakharov** — 2026-08-24T22:36:09Z

Both are in, with dates from the repo (`4705d69`) — under "Why" point 3, and echoed in the numbers-strip lead and both shorter cuts.

**Billing: 15 days** from first commit to shipping in 4.4.0. What landed: every model call, embedding, transcription and provider-run tool priced into a usage ledger across a 15-value stage enum wired into 16 call sites, decremented live, enforced server-side at send time, carried over at renewal, capped per member — 12 migrations. The contrast writes itself: Bubble's own release notes mention credits exactly twice, both cosmetic.

**Access control: 6 days** to server-authoritative enforcement in 4.3.5, **13** to the admin UI and picker gating in 4.4.0. 4 tables, 2 enums, 6 authorization-gated server actions.

One correction to the brief: **per-group credit quotas were never built.** The decision doc defers them explicitly and cites that as the reason for the one-member-one-group rule. What shipped is a workspace-wide per-member cap plus a per-individual override, surfaced on the Access control tab — so the article says "model availability per group and per individual; credit quotas per member and per individual", not per group.

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:59

```diff
@@ -0,0 +1,696 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                          |                                                                        |
+| ------------------------ | ---------------------------------------------------------------------- |
+| **Assignment**           | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase |
+| **Span**                 | 6 March – 20 August 2026 · 168 days                                     |
+| **The "code" I started from** | a ~25 MB minified JSON — the Bubble app export                     |
+| **Shipped**              | 1,537 commits to `main` · 1,063 merged pull requests · 244,000 lines of TypeScript |
+| **Cold load**            | multi-second → sub-second                                              |
+| **Releases**             | 4 majors, 3 workspace cutovers, zero rollbacks                          |
+| **Team**                 | me, and somewhere between ten and twenty-five Claude Code agents at a time |
+
+_Disclaimer: the disclosures in this case study were approved by Playgram management, i.e. no NDA breach._
+
+---
+
+After I started writing this case study, I realized that even the [brief](https://github.com/vzakharov/vovazakharov.com/issues/4) I'd give Claude to hydrate turned out to be 5,300 words long — and even then, after I'd finished it I understood that I'd only scratched the surface of everything I wanted to tell. So, (a) sorry it's so long, (b) check out the [mini version](./playgram-bubble-to-nextjs-part-1.mini.md) and the [micro version](./playgram-bubble-to-nextjs-part-1.micro.md), and (c) I'll post more detailed insights on some or all of the aspects later.
+
+## Intro
+
+In case you didn't know, Bubble is a no-code app builder.
+
+When you think of such tools, you'd think that people would just use it to make simple things — a directory site, an internal CRUD tool, a booking form, the kind of marketplace MVP you build to find out whether anyone wants it.
+
+But you'd be surprised how far people can actually take it.
+
+[Ohana](https://bubble.io/blog/ohana/) is a subletting marketplace built on Bubble from day one; its hosts have earned $16.2 million through it, and [Stripe's own customer page](https://stripe.com/customers/ohana) — the payment processor's numbers, not the founders' — forecasts $60 million in annual payment volume for 2026. [SuiteOp](https://bubble.io/blog/suiteop/) runs hospitality operations for over a hundred organizations and up to 30,000 daily guest users, on a $3 million seed round [independently reported](https://hoteltechnologynews.com/2025/04/suiteop-raises-3-million-to-scale-its-hospitality-operations-platform-for-small-to-mid-sized-lodging-operators/) in the trade press. [Formula Bot](https://bubble.io/blog/formula-bot/) is a one-person company that reached a million users, built by a non-programmer over a paternity leave.
+
+None of those are toys. A lot of software you've used was probably drawn rather than typed.
+
+In our case, we're talking about Playgram, an app that managed to put together a chat interface giving access to multiple providers and models, realtime team/project chat UIs, libraries of generated images & files, memory & knowledge management, voice input, and tons of other small "nifties" — all brought to life with no code at all:
+
+https://github.com/user-attachments/assets/16e67cd5-5727-419b-be2b-ffaa2541a44c
+
+(This is a screen recording already after migration to code, but you get the idea.)
+
+So why would then they want to switch to code if it was all so great?
+
+## Why
+
+**1 — Performance.** However hard you try, when you put abstraction over abstraction over abstraction to make an app work in a "draw a couple of interconnected boxes, and it just works" fashion, you're bound to hurt the performance.
+
+To be fair to Bubble, they don't hide it. Their [own performance guide](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling) explains that the platform "sends the code for all the elements (visible and invisible)" before it draws anything, that "the number of elements is a bigger factor than the type of elements", that "a nested repeating group has a multiplicative effect on the number of elements", and — my favourite — that "plugins have their code included on each page load regardless if it's used". It's a document about clawing performance back by removing things.
+
+But the part you can't claw back is the floor. A Bubble page ships three render-blocking platform bundles before your app exists, and developers measuring [an almost-empty page](https://forum.bubble.io/t/seeking-advice-on-slow-page-loads-in-bubble-applications/327360) — one text heading, nothing else — report a Lighthouse Speed Index of 1.5–1.7 seconds. The most quoted reply in that thread, to someone asking whether others had hit the same wall on minimal pages, is four words: _"Yes, every single user."_
+
+To spoil the ending: moving Playgram to Next changed cold load times from multi-second to sub-second; something which is _instantly_ tangible for a user, even if "wait a couple secs at first load" doesn't sound like such a big thing.
+
+**2 — Bumping into Bubble's edges.** Every platform has edges. This one is named after the thing that pops when you reach them.
+
+All too many Bubble developers have faced the same thing again and again as their apps grow: they meet the system's limits and end up installing (and sometimes purchasing) third-party plugins, running vanilla JS in the browser, or even writing their own reactivity frameworks to make up for what Bubble can not provide. You don't have to take my word for how common that is — Bubble published [its own ranking of the top community plugins](https://bubble.io/blog/top-community-plugins-templates-2023/), and the number one plugin, with over 538,000 lifetime downloads, is Toolbox: a plugin whose purpose is to let you run custom JavaScript. The most popular thing anyone ever built for the no-code platform is a way out of it. Two of the five top templates that year were entire homegrown application frameworks built on top of Bubble, for the same reason one layer up.
+
+In the case of Playgram, by the way, the makers are Zeroqode, who describe themselves as "one of the largest developers for Bubble.io space" and list 800+ plugins by their own count — and two of the five most-installed community plugins in Bubble's 2023 round-up are theirs. And they still felt like they were lacking. When the people who supply everyone else's escape hatches start wanting out, that tells you something.
+
+**3 — Missing out on all the AI agents stuff.** Although Bubble has been making inroads into using AI for its builders, needless to say its capabilities are far behind what modern tools like Claude Code, Cursor, or Codex provide. The team was feeling like they were missing out on being able to deliver more features in smaller time frames.
+
+That last one is the interesting one, and it's most of what this case study is actually about. They didn't just want code. They wanted the thing that code makes possible.
```

**@vzakharov** — 2026-08-24T22:05:57Z

Yeah, that's another angle leaning into the "we also shipped it for the devs who built Bubble in the first place to be able to build it faster"

**@vzakharov** — 2026-08-24T22:36:11Z

Added in two places (`4705d69`). Point 3 in "Why" now closes on it — the people who'd live in the codebase were the same people who had drawn the app, so making _them_ faster was the actual assignment — and it explicitly promises the answer at the end. The handover section is that answer, so the piece now has a setup and a payoff rather than an unremarked observation.

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:57

```diff
@@ -40,31 +39,34 @@ So why would then they want to switch to code if it was all so great?

 ## Why

-**1 — Performance.** However hard you try, when you put abstraction over abstraction over abstraction to make an app work in a "draw a couple of interconnected boxes, and it just works" fashion, you're bound to hurt the performance.
-
-To be fair to Bubble, they don't hide it. Their [own performance guide](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling) explains that the platform "sends the code for all the elements (visible and invisible)" before it draws anything, that "the number of elements is a bigger factor than the type of elements", that "a nested repeating group has a multiplicative effect on the number of elements", and — my favourite — that "plugins have their code included on each page load regardless if it's used". It's a document about clawing performance back by removing things.
+**1 — Performance.** However hard you try, when you put abstraction over abstraction over abstraction to make an app work in a "draw a couple of interconnected boxes, and it just works" fashion, you're bound to hurt the performance. The platform — quoting its [own performance guide](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling) — sends "the code for all the elements (visible and invisible)" before it draws anything, degrades multiplicatively with every nested repeating group, and ships the code of every plugin you install on every page load, whether you use it or not.

-But the part you can't claw back is the floor. A Bubble page ships three render-blocking platform bundles before your app exists, and developers measuring [an almost-empty page](https://forum.bubble.io/t/seeking-advice-on-slow-page-loads-in-bubble-applications/327360) — one text heading, nothing else — report a Lighthouse Speed Index of 1.5–1.7 seconds. The most quoted reply in that thread, to someone asking whether others had hit the same wall on minimal pages, is four words: _"Yes, every single user."_
+But the part you can't claw back is the floor. A Bubble page ships three render-blocking platform bundles before your app exists; a group of developers [measured](https://forum.bubble.io/t/seeking-advice-on-slow-page-loads-in-bubble-applications/327360) an almost-empty page — one text heading, nothing else — and found a Lighthouse Speed Index of 1.5–1.7 seconds.

 To spoil the ending: moving Playgram to Next changed cold load times from multi-second to sub-second; something which is _instantly_ tangible for a user, even if "wait a couple secs at first load" doesn't sound like such a big thing.

-**2 — Bumping into Bubble's edges.** Every platform has edges. This one is named after the thing that pops when you reach them.
+**2 — Bumping into the bubble's edges.** All too many Bubble developers have faced the same thing again and again as their apps grow: they meet the system's limits and end up installing (and sometimes purchasing) third-party plugins, running vanilla JS in the browser, or even writing their own reactivity frameworks to make up for what Bubble can not provide. Quite illustratively, the number one Bubble plugin, with over 538,000 lifetime downloads, is [one that allows](https://bubble.io/blog/top-community-plugins-templates-2023/) running custom JavaScript. The most popular thing anyone ever built for the platform is a way out of it — and two of the five top templates that year were entire homegrown application frameworks built on top of Bubble, for the same reason one layer up.

-All too many Bubble developers have faced the same thing again and again as their apps grow: they meet the system's limits and end up installing (and sometimes purchasing) third-party plugins, running vanilla JS in the browser, or even writing their own reactivity frameworks to make up for what Bubble can not provide. You don't have to take my word for how common that is — Bubble published [its own ranking of the top community plugins](https://bubble.io/blog/top-community-plugins-templates-2023/), and the number one plugin, with over 538,000 lifetime downloads, is Toolbox: a plugin whose purpose is to let you run custom JavaScript. The most popular thing anyone ever built for the no-code platform is a way out of it. Two of the five top templates that year were entire homegrown application frameworks built on top of Bubble, for the same reason one layer up.
-
-In the case of Playgram, by the way, the makers are Zeroqode, who describe themselves as "one of the largest developers for Bubble.io space" and list 800+ plugins by their own count — and two of the five most-installed community plugins in Bubble's 2023 round-up are theirs. And they still felt like they were lacking. When the people who supply everyone else's escape hatches start wanting out, that tells you something.
+In the case of Playgram, by the way, the makers are Zeroqode, with a ballpark of 800 plugins shipped, two of which were among the five most-installed community plugins for Bubble in 2023. And they still felt like they were lacking. When the people who supply everyone else's escape hatches start wanting out, that tells you something.

 **3 — Missing out on all the AI agents stuff.** Although Bubble has been making inroads into using AI for its builders, needless to say its capabilities are far behind what modern tools like Claude Code, Cursor, or Codex provide. The team was feeling like they were missing out on being able to deliver more features in smaller time frames.

-That last one is the interesting one, and it's most of what this case study is actually about. They didn't just want code. They wanted the thing that code makes possible.
+That third one is the interesting one, and it's most of what this case study is about. It's also the one that turned out to be measurable. Two examples from the far end of the project, both of them things the product had wanted for a long time:
+
+- **Billing that actually bills.** In Bubble, credits were a line of marketing copy on a pricing card; the app's own release notes mention them twice and both times cosmetically. Fifteen days after the first commit on it, credits were a metered quantity — every model call, embedding, transcription and provider-run tool priced into a usage ledger across fifteen distinct cost stages, decremented live, enforced server-side at send time, carried over at renewal and capped per member.
+- **Access control.** Member groups with a per-group allow or deny list over the model catalogue, and a per-member override on top of that. Server-authoritative enforcement was live six days after the first commit on it; the admin UI and the model-picker gating, thirteen days.
```

**@vzakharov** — 2026-08-27T12:34:06Z

> Server-authoritative enforcement was live six days after the first commit on it; the admin UI and the model-picker gating, thirteen days.

no need to detail the archaeology; just say how long the entire feature took.

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:58

```diff
@@ -40,31 +39,34 @@ So why would then they want to switch to code if it was all so great?

 ## Why

-**1 — Performance.** However hard you try, when you put abstraction over abstraction over abstraction to make an app work in a "draw a couple of interconnected boxes, and it just works" fashion, you're bound to hurt the performance.
-
-To be fair to Bubble, they don't hide it. Their [own performance guide](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling) explains that the platform "sends the code for all the elements (visible and invisible)" before it draws anything, that "the number of elements is a bigger factor than the type of elements", that "a nested repeating group has a multiplicative effect on the number of elements", and — my favourite — that "plugins have their code included on each page load regardless if it's used". It's a document about clawing performance back by removing things.
+**1 — Performance.** However hard you try, when you put abstraction over abstraction over abstraction to make an app work in a "draw a couple of interconnected boxes, and it just works" fashion, you're bound to hurt the performance. The platform — quoting its [own performance guide](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling) — sends "the code for all the elements (visible and invisible)" before it draws anything, degrades multiplicatively with every nested repeating group, and ships the code of every plugin you install on every page load, whether you use it or not.

-But the part you can't claw back is the floor. A Bubble page ships three render-blocking platform bundles before your app exists, and developers measuring [an almost-empty page](https://forum.bubble.io/t/seeking-advice-on-slow-page-loads-in-bubble-applications/327360) — one text heading, nothing else — report a Lighthouse Speed Index of 1.5–1.7 seconds. The most quoted reply in that thread, to someone asking whether others had hit the same wall on minimal pages, is four words: _"Yes, every single user."_
+But the part you can't claw back is the floor. A Bubble page ships three render-blocking platform bundles before your app exists; a group of developers [measured](https://forum.bubble.io/t/seeking-advice-on-slow-page-loads-in-bubble-applications/327360) an almost-empty page — one text heading, nothing else — and found a Lighthouse Speed Index of 1.5–1.7 seconds.

 To spoil the ending: moving Playgram to Next changed cold load times from multi-second to sub-second; something which is _instantly_ tangible for a user, even if "wait a couple secs at first load" doesn't sound like such a big thing.

-**2 — Bumping into Bubble's edges.** Every platform has edges. This one is named after the thing that pops when you reach them.
+**2 — Bumping into the bubble's edges.** All too many Bubble developers have faced the same thing again and again as their apps grow: they meet the system's limits and end up installing (and sometimes purchasing) third-party plugins, running vanilla JS in the browser, or even writing their own reactivity frameworks to make up for what Bubble can not provide. Quite illustratively, the number one Bubble plugin, with over 538,000 lifetime downloads, is [one that allows](https://bubble.io/blog/top-community-plugins-templates-2023/) running custom JavaScript. The most popular thing anyone ever built for the platform is a way out of it — and two of the five top templates that year were entire homegrown application frameworks built on top of Bubble, for the same reason one layer up.

-All too many Bubble developers have faced the same thing again and again as their apps grow: they meet the system's limits and end up installing (and sometimes purchasing) third-party plugins, running vanilla JS in the browser, or even writing their own reactivity frameworks to make up for what Bubble can not provide. You don't have to take my word for how common that is — Bubble published [its own ranking of the top community plugins](https://bubble.io/blog/top-community-plugins-templates-2023/), and the number one plugin, with over 538,000 lifetime downloads, is Toolbox: a plugin whose purpose is to let you run custom JavaScript. The most popular thing anyone ever built for the no-code platform is a way out of it. Two of the five top templates that year were entire homegrown application frameworks built on top of Bubble, for the same reason one layer up.
-
-In the case of Playgram, by the way, the makers are Zeroqode, who describe themselves as "one of the largest developers for Bubble.io space" and list 800+ plugins by their own count — and two of the five most-installed community plugins in Bubble's 2023 round-up are theirs. And they still felt like they were lacking. When the people who supply everyone else's escape hatches start wanting out, that tells you something.
+In the case of Playgram, by the way, the makers are Zeroqode, with a ballpark of 800 plugins shipped, two of which were among the five most-installed community plugins for Bubble in 2023. And they still felt like they were lacking. When the people who supply everyone else's escape hatches start wanting out, that tells you something.

 **3 — Missing out on all the AI agents stuff.** Although Bubble has been making inroads into using AI for its builders, needless to say its capabilities are far behind what modern tools like Claude Code, Cursor, or Codex provide. The team was feeling like they were missing out on being able to deliver more features in smaller time frames.

-That last one is the interesting one, and it's most of what this case study is actually about. They didn't just want code. They wanted the thing that code makes possible.
+That third one is the interesting one, and it's most of what this case study is about. It's also the one that turned out to be measurable. Two examples from the far end of the project, both of them things the product had wanted for a long time:
+
+- **Billing that actually bills.** In Bubble, credits were a line of marketing copy on a pricing card; the app's own release notes mention them twice and both times cosmetically. Fifteen days after the first commit on it, credits were a metered quantity — every model call, embedding, transcription and provider-run tool priced into a usage ledger across fifteen distinct cost stages, decremented live, enforced server-side at send time, carried over at renewal and capped per member.
+- **Access control.** Member groups with a per-group allow or deny list over the model catalogue, and a per-member override on top of that. Server-authoritative enforcement was live six days after the first commit on it; the admin UI and the model-picker gating, thirteen days.
+
```

**@vzakharov** — 2026-08-27T12:34:19Z

let's put a third here for completeness; I suggest the C2Oe feature, which was actually a want of one of our university users

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:92

```diff
@@ -74,29 +76,39 @@ To give some perspective on why this was a pretty challenging endeavor:

 Below you'll find how we tackled each of these challenges; how we discovered new ones I would've never envisioned, and what mistakes we made along the way (so you don't have to).

-## The four months, in numbers
+## The rebuild, in numbers

 Before the grit, the shape of the thing.

-![Cumulative commits to main across the rebuild: 6.8 commits/day through the March–April grind, 11.1/day from late May onward, with the 2-month deadline and the four release milestones marked](./assets/playgram-commit-cumsum.svg)
+![Two charts sharing a timeline from 6 March to 21 August 2026. Cumulative units of work on main rises from about six a day to about nine across a four-week seam in late April and May; weekly units of work go from the forties to the eighties across the same seam, then fall by two thirds after the 4.4.3 handover](./assets/playgram-commit-cumsum.svg)
+
+| Date       | Day | What happened                                                                  |
+| ---------- | --- | ------------------------------------------------------------------------------ |
+| **6 Mar**  | 1   | First commit. Not code — a splitting script and a pile of research.            |
+| **10 Mar** | 5   | The Next.js app gets bootstrapped. `layout.tsx`, `page.tsx`, and nothing else. |
+| **12 Mar** | 7   | First feature code: auth screens, styled to match the Bubble original.         |
+| **19 Mar** | 14  | A message goes to an LLM and a response comes back. The product loop works.    |
+| **24 Apr** | 50  | The first pull requests. Until now everything went straight to `main`.         |
+| **6 May**  | 62  | **The original deadline.** Nothing in production.                              |
+| **21 May** | 77  | `4.0.0` — first production build.                                              |
+| **26 May** | 82  | The last local sessions. From here it's cloud agents and PR squashes.          |
```

**@vzakharov** — 2026-08-27T12:35:30Z

pls re-explore and come back to me on that 50-82 region thing; I don't remember ever switching back to local sessions after I started working in the cloud; why would I? if you judge based on agent co-authorship, there could be a different reason for it. E.g., I remember in my first web PRs there was no instruction to add a coauthorship line at all, so some squash commits came to main as if they had no coauthor.

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:89

```diff
@@ -74,29 +76,39 @@ To give some perspective on why this was a pretty challenging endeavor:

 Below you'll find how we tackled each of these challenges; how we discovered new ones I would've never envisioned, and what mistakes we made along the way (so you don't have to).

-## The four months, in numbers
+## The rebuild, in numbers

 Before the grit, the shape of the thing.

-![Cumulative commits to main across the rebuild: 6.8 commits/day through the March–April grind, 11.1/day from late May onward, with the 2-month deadline and the four release milestones marked](./assets/playgram-commit-cumsum.svg)
+![Two charts sharing a timeline from 6 March to 21 August 2026. Cumulative units of work on main rises from about six a day to about nine across a four-week seam in late April and May; weekly units of work go from the forties to the eighties across the same seam, then fall by two thirds after the 4.4.3 handover](./assets/playgram-commit-cumsum.svg)
+
+| Date       | Day | What happened                                                                  |
+| ---------- | --- | ------------------------------------------------------------------------------ |
+| **6 Mar**  | 1   | First commit. Not code — a splitting script and a pile of research.            |
+| **10 Mar** | 5   | The Next.js app gets bootstrapped. `layout.tsx`, `page.tsx`, and nothing else. |
+| **12 Mar** | 7   | First feature code: auth screens, styled to match the Bubble original.         |
+| **19 Mar** | 14  | A message goes to an LLM and a response comes back. The product loop works.    |
+| **24 Apr** | 50  | The first pull requests. Until now everything went straight to `main`.         |
```

**@vzakharov** — 2026-08-27T12:35:51Z

"the first pull requests" is vague; "switching to in-cloud development" is more like it

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:109

```diff
@@ -74,29 +76,39 @@ To give some perspective on why this was a pretty challenging endeavor:

 Below you'll find how we tackled each of these challenges; how we discovered new ones I would've never envisioned, and what mistakes we made along the way (so you don't have to).

-## The four months, in numbers
+## The rebuild, in numbers

 Before the grit, the shape of the thing.

-![Cumulative commits to main across the rebuild: 6.8 commits/day through the March–April grind, 11.1/day from late May onward, with the 2-month deadline and the four release milestones marked](./assets/playgram-commit-cumsum.svg)
+![Two charts sharing a timeline from 6 March to 21 August 2026. Cumulative units of work on main rises from about six a day to about nine across a four-week seam in late April and May; weekly units of work go from the forties to the eighties across the same seam, then fall by two thirds after the 4.4.3 handover](./assets/playgram-commit-cumsum.svg)
+
+| Date       | Day | What happened                                                                  |
+| ---------- | --- | ------------------------------------------------------------------------------ |
+| **6 Mar**  | 1   | First commit. Not code — a splitting script and a pile of research.            |
+| **10 Mar** | 5   | The Next.js app gets bootstrapped. `layout.tsx`, `page.tsx`, and nothing else. |
+| **12 Mar** | 7   | First feature code: auth screens, styled to match the Bubble original.         |
+| **19 Mar** | 14  | A message goes to an LLM and a response comes back. The product loop works.    |
+| **24 Apr** | 50  | The first pull requests. Until now everything went straight to `main`.         |
+| **6 May**  | 62  | **The original deadline.** Nothing in production.                              |
+| **21 May** | 77  | `4.0.0` — first production build.                                              |
+| **26 May** | 82  | The last local sessions. From here it's cloud agents and PR squashes.          |
+| **24 Jun** | 111 | `4.1.0` — first workspace actually running on the rewrite.                     |
+| **3 Jul**  | 120 | `4.2.0` — the big cutover.                                                     |
+| **11 Jul** | 128 | `4.3.0` — all workspaces on the rewrite. Bubble is off.                        |
+| **31 Jul** | 148 | `4.4.0` — workspace credits and model access control.                          |
+| **10 Aug** | 158 | `4.4.3` — the last release that's mostly mine. Handover.                       |
+
+A note on that chart. When I sketched this article I claimed you could _precisely_ see the spot where my working method changed. It isn't a spot; it's a seam about four weeks wide, running from the last week of April to the last week of May. Three signals agree on where it sits:

-| Date            | Day | What happened                                                          |
-| --------------- | --- | ---------------------------------------------------------------------- |
-| **6 Mar**       | 1   | First commit. Not code — a splitting script and a pile of research.     |
-| **10 Mar**      | 5   | The Next.js app gets bootstrapped. `layout.tsx`, `page.tsx`, and nothing else. |
-| **12 Mar**      | 7   | First feature code: auth screens, styled to match the Bubble original.  |
-| **19 Mar**      | 14  | A message goes to an LLM and a response comes back. The product loop works. |
-| **6 May**       | 62  | **The original deadline.** Nothing in production.                       |
-| **21 May**      | 76  | `4.0.0` — first production build.                                       |
-| **26 May**      | 81  | Everything moves to PR-based flow and cloud agents. The slope changes.  |
-| **24 Jun**      | 110 | `4.1.0` — first workspace actually running on the rewrite.              |
-| **3 Jul**       | 119 | `4.2.0` — the big cutover.                                              |
-| **11 Jul**      | 127 | `4.3.0` — all workspaces on the rewrite. Bubble is off.                 |
-| **7 Aug**       | 154 | Last day of my full-time assignment.                                    |
+- **The local CLI's signature stops.** Claude Code stamps a model-named `Co-Authored-By` trailer — `Claude Opus 4.6`, `Claude Sonnet 4.6`, `Claude Opus 4.7 (1M context)` — on commits made from my laptop. It's on 393 commits through March and April, twice more in May, and never again.
+- **The cloud's signature starts.** The bare `Co-Authored-By: Claude` form, which is what the web sessions write, appears for the first time in May and is on 806 commits from there to the end.
+- **Pull requests start existing.** Before 24 April there are none — the work went straight to `main`. From that week on everything arrives as a branch, and by late May the `(pr #…)` squash marker is running at about eighty a week.

-A note on that chart. When I sketched this article I claimed you could _precisely_ see the spot where my mindset changed. You can't, quite — it's a seam about four weeks wide, not a spot. But three independent signals agree on where it is. The commit rate steps from 6.8/day across the March–April grind to 11.1/day from late May. The `Co-Authored-By: Claude` trailer — the local CLI's default signature — is on 404 commits through March and April, and then simply stops. And the `(pr #…)` squash marker appears on 26 May and immediately runs at about eighty a week.
+The number that actually proves the point is a boring one: **the median unit of work stays about the same size — 367 changed lines before the seam, 330 after — while units per day go from 6.1 to 8.9.** Same-sized pieces, forty-odd percent more of them at a time. That's the fingerprint of parallel streams rather than bigger batches, which is exactly what "I went from three agents to twenty" should look like in a graph.

-The number that actually proves the point, though, is a boring one: **churn per commit stays flat at around 400 lines while commits per day go up 63%.** Same-sized units of work, just more of them at a time. That's the fingerprint of parallel streams, not of bigger batches — which is exactly what "I went from three agents to twenty" should look like in a graph, and it's a much better piece of evidence than the curve bending.
+The bottom panel has a shape worth walking through, because it's the project's whole arc in one row of bars. Output steps up in the first week of May, when I moved to the web sessions. It then runs at its ceiling — four straight weeks in the eighties — right up to `4.1.0` on 24 June, and that stretch is a visible race: bug fixes are 39% of everything landing in it. The week after `4.1.0` it halves, and never returns to the ceiling. That isn't a slump. It's the point where rebuilding Bubble-as-it-was stopped being the job: refactors go from 11% to 17% of the work, release management becomes a line item, and what's left is new features, bug fixes and chores at a pace a normal team would recognise.
```

**@vzakharov** — 2026-08-27T12:39:31Z

> That isn't a slump. It's

Pls, no need for "it's-not-this-it's-that"'s, unless absolutely necessary, these are very AI-write (I removed this in my own following edit, but keeping the comment here for a sweep).

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:111

```diff
@@ -74,29 +76,39 @@ To give some perspective on why this was a pretty challenging endeavor:

 Below you'll find how we tackled each of these challenges; how we discovered new ones I would've never envisioned, and what mistakes we made along the way (so you don't have to).

-## The four months, in numbers
+## The rebuild, in numbers

 Before the grit, the shape of the thing.

-![Cumulative commits to main across the rebuild: 6.8 commits/day through the March–April grind, 11.1/day from late May onward, with the 2-month deadline and the four release milestones marked](./assets/playgram-commit-cumsum.svg)
+![Two charts sharing a timeline from 6 March to 21 August 2026. Cumulative units of work on main rises from about six a day to about nine across a four-week seam in late April and May; weekly units of work go from the forties to the eighties across the same seam, then fall by two thirds after the 4.4.3 handover](./assets/playgram-commit-cumsum.svg)
+
+| Date       | Day | What happened                                                                  |
+| ---------- | --- | ------------------------------------------------------------------------------ |
+| **6 Mar**  | 1   | First commit. Not code — a splitting script and a pile of research.            |
+| **10 Mar** | 5   | The Next.js app gets bootstrapped. `layout.tsx`, `page.tsx`, and nothing else. |
+| **12 Mar** | 7   | First feature code: auth screens, styled to match the Bubble original.         |
+| **19 Mar** | 14  | A message goes to an LLM and a response comes back. The product loop works.    |
+| **24 Apr** | 50  | The first pull requests. Until now everything went straight to `main`.         |
+| **6 May**  | 62  | **The original deadline.** Nothing in production.                              |
+| **21 May** | 77  | `4.0.0` — first production build.                                              |
+| **26 May** | 82  | The last local sessions. From here it's cloud agents and PR squashes.          |
+| **24 Jun** | 111 | `4.1.0` — first workspace actually running on the rewrite.                     |
+| **3 Jul**  | 120 | `4.2.0` — the big cutover.                                                     |
+| **11 Jul** | 128 | `4.3.0` — all workspaces on the rewrite. Bubble is off.                        |
+| **31 Jul** | 148 | `4.4.0` — workspace credits and model access control.                          |
+| **10 Aug** | 158 | `4.4.3` — the last release that's mostly mine. Handover.                       |
+
+A note on that chart. When I sketched this article I claimed you could _precisely_ see the spot where my working method changed. It isn't a spot; it's a seam about four weeks wide, running from the last week of April to the last week of May. Three signals agree on where it sits:

-| Date            | Day | What happened                                                          |
-| --------------- | --- | ---------------------------------------------------------------------- |
-| **6 Mar**       | 1   | First commit. Not code — a splitting script and a pile of research.     |
-| **10 Mar**      | 5   | The Next.js app gets bootstrapped. `layout.tsx`, `page.tsx`, and nothing else. |
-| **12 Mar**      | 7   | First feature code: auth screens, styled to match the Bubble original.  |
-| **19 Mar**      | 14  | A message goes to an LLM and a response comes back. The product loop works. |
-| **6 May**       | 62  | **The original deadline.** Nothing in production.                       |
-| **21 May**      | 76  | `4.0.0` — first production build.                                       |
-| **26 May**      | 81  | Everything moves to PR-based flow and cloud agents. The slope changes.  |
-| **24 Jun**      | 110 | `4.1.0` — first workspace actually running on the rewrite.              |
-| **3 Jul**       | 119 | `4.2.0` — the big cutover.                                              |
-| **11 Jul**      | 127 | `4.3.0` — all workspaces on the rewrite. Bubble is off.                 |
-| **7 Aug**       | 154 | Last day of my full-time assignment.                                    |
+- **The local CLI's signature stops.** Claude Code stamps a model-named `Co-Authored-By` trailer — `Claude Opus 4.6`, `Claude Sonnet 4.6`, `Claude Opus 4.7 (1M context)` — on commits made from my laptop. It's on 393 commits through March and April, twice more in May, and never again.
+- **The cloud's signature starts.** The bare `Co-Authored-By: Claude` form, which is what the web sessions write, appears for the first time in May and is on 806 commits from there to the end.
+- **Pull requests start existing.** Before 24 April there are none — the work went straight to `main`. From that week on everything arrives as a branch, and by late May the `(pr #…)` squash marker is running at about eighty a week.

-A note on that chart. When I sketched this article I claimed you could _precisely_ see the spot where my mindset changed. You can't, quite — it's a seam about four weeks wide, not a spot. But three independent signals agree on where it is. The commit rate steps from 6.8/day across the March–April grind to 11.1/day from late May. The `Co-Authored-By: Claude` trailer — the local CLI's default signature — is on 404 commits through March and April, and then simply stops. And the `(pr #…)` squash marker appears on 26 May and immediately runs at about eighty a week.
+The number that actually proves the point is a boring one: **the median unit of work stays about the same size — 367 changed lines before the seam, 330 after — while units per day go from 6.1 to 8.9.** Same-sized pieces, forty-odd percent more of them at a time. That's the fingerprint of parallel streams rather than bigger batches, which is exactly what "I went from three agents to twenty" should look like in a graph.

-The number that actually proves the point, though, is a boring one: **churn per commit stays flat at around 400 lines while commits per day go up 63%.** Same-sized units of work, just more of them at a time. That's the fingerprint of parallel streams, not of bigger batches — which is exactly what "I went from three agents to twenty" should look like in a graph, and it's a much better piece of evidence than the curve bending.
+The bottom panel has a shape worth walking through, because it's the project's whole arc in one row of bars. Output steps up in the first week of May, when I moved to the web sessions. It then runs at its ceiling — four straight weeks in the eighties — right up to `4.1.0` on 24 June, and that stretch is a visible race: bug fixes are 39% of everything landing in it. The week after `4.1.0` it halves, and never returns to the ceiling. That isn't a slump. It's the point where rebuilding Bubble-as-it-was stopped being the job: refactors go from 11% to 17% of the work, release management becomes a line item, and what's left is new features, bug fixes and chores at a pace a normal team would recognise.
+
+(Both panels count code only. Documentation commits are excluded, because the opening fortnight produced enough of them to bury everything else on the chart — the decision-docs section below explains what they all were.)
```

**@vzakharov** — 2026-08-27T12:40:31Z

put it as a small note (just "excluding docs"), no need for would-happen's

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:105

```diff
@@ -0,0 +1,722 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                               |                                                                                          |
+| ----------------------------- | ---------------------------------------------------------------------------------------- |
+| **Assignment**                | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase             |
+| **Span**                      | 6 March – 10 August 2026 · 158 days                                                      |
+| **The "code" I started from** | an 11.6 MB minified JSON — the Bubble app export                                         |
+| **Shipped**                   | 1,395 units of work on `main` · 1,029 merged pull requests · 250,000 lines of TypeScript |
+| **Cold load**                 | multi-second → sub-second                                                                |
+| **Released**                  | 48 versioned releases plus 18 hotfixes — a production deploy every 2.4 days              |
+| **Cutovers**                  | 3 workspaces, zero rollbacks                                                             |
+| **Team**                      | four people, and ten to twenty-five Claude Code agents at a time                         |
+
+_Disclaimer: the disclosures in this case study were approved by Playgram management, i.e. no NDA breach._
+
+---
+
+After I started writing this case study, I realized that even the [brief](https://github.com/vzakharov/vovazakharov.com/issues/4) I'd give Claude to hydrate turned out to be 5,300 words long — and even then, after I'd finished it I understood that I'd only scratched the surface of everything I wanted to tell. So, (a) sorry it's so long, (b) check out the [mini version](./playgram-bubble-to-nextjs-part-1.mini.md) and the [micro version](./playgram-bubble-to-nextjs-part-1.micro.md), and (c) I'll post more detailed insights on some or all of the aspects later.
+
+## Intro
+
+In case you didn't know, Bubble is a no-code app builder.
+
+When you think of such tools, you'd think that people would just use it to make simple things — a directory site, an internal CRUD tool, a booking form, the kind of marketplace MVP you build to find out whether anyone wants it.
+
+But you'd be surprised how far people can actually take it — from a [subletting marketplace](https://bubble.io/blog/ohana/) whose hosts have earned $16.2 million and which [Stripe projects](https://stripe.com/customers/ohana) will process $60 million this year, to a [hospitality operations platform](https://bubble.io/blog/suiteop/) running a hundred-plus organizations and up to 30,000 daily guest users, to a [one-person company](https://bubble.io/blog/formula-bot/) that reached a million users, built by a non-programmer over a paternity leave.
+
+None of those are toys. A lot of software you've used was probably drawn rather than typed.
+
+In our case, we're talking about Playgram, an app that managed to put together a chat interface giving access to multiple providers and models, realtime team/project chat UIs, libraries of generated images & files, memory & knowledge management, voice input, and tons of other small "nifties" — all brought to life with no code at all:
+
+https://github.com/user-attachments/assets/16e67cd5-5727-419b-be2b-ffaa2541a44c
+
+(This is a screen recording already after migration to code, but you get the idea.)
+
+So why would then they want to switch to code if it was all so great?
+
+## Why
+
+**1 — Performance.** However hard you try, when you put abstraction over abstraction over abstraction to make an app work in a "draw a couple of interconnected boxes, and it just works" fashion, you're bound to hurt the performance. The platform — quoting its [own performance guide](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling) — sends "the code for all the elements (visible and invisible)" before it draws anything, degrades multiplicatively with every nested repeating group, and ships the code of every plugin you install on every page load, whether you use it or not.
+
+But the part you can't claw back is the floor. A Bubble page ships three render-blocking platform bundles before your app exists; a group of developers [measured](https://forum.bubble.io/t/seeking-advice-on-slow-page-loads-in-bubble-applications/327360) an almost-empty page — one text heading, nothing else — and found a Lighthouse Speed Index of 1.5–1.7 seconds.
+
+To spoil the ending: moving Playgram to Next changed cold load times from multi-second to sub-second; something which is _instantly_ tangible for a user, even if "wait a couple secs at first load" doesn't sound like such a big thing.
+
+**2 — Bumping into the bubble's edges.** All too many Bubble developers have faced the same thing again and again as their apps grow: they meet the system's limits and end up installing (and sometimes purchasing) third-party plugins, running vanilla JS in the browser, or even writing their own reactivity frameworks to make up for what Bubble can not provide. Quite illustratively, the number one Bubble plugin, with over 538,000 lifetime downloads, is [one that allows](https://bubble.io/blog/top-community-plugins-templates-2023/) running custom JavaScript. The most popular thing anyone ever built for the platform is a way out of it — and two of the five top templates that year were entire homegrown application frameworks built on top of Bubble, for the same reason one layer up.
+
+In the case of Playgram, by the way, the makers are Zeroqode, with a ballpark of 800 plugins shipped, two of which were among the five most-installed community plugins for Bubble in 2023. And they still felt like they were lacking. When the people who supply everyone else's escape hatches start wanting out, that tells you something.
+
+**3 — Missing out on all the AI agents stuff.** Although Bubble has been making inroads into using AI for its builders, needless to say its capabilities are far behind what modern tools like Claude Code, Cursor, or Codex provide. The team was feeling like they were missing out on being able to deliver more features in smaller time frames.
+
+That third one is the interesting one, and it's most of what this case study is about. It's also the one that turned out to be measurable. Two examples from the far end of the project, both of them things the product had wanted for a long time:
+
+- **Billing that actually bills.** In Bubble, credits were a line of marketing copy on a pricing card; the app's own release notes mention them twice and both times cosmetically. Fifteen days after the first commit on it, credits were a metered quantity — every model call, embedding, transcription and provider-run tool priced into a usage ledger across fifteen distinct cost stages, decremented live, enforced server-side at send time, carried over at renewal and capped per member.
+- **Access control.** Member groups with a per-group allow or deny list over the model catalogue, and a per-member override on top of that. Server-authoritative enforcement was live six days after the first commit on it; the admin UI and the model-picker gating, thirteen days.
+
+Good luck shipping either of those on that clock by drawing boxes.
+
+And there's a second-order version of the point that I didn't fully appreciate until the end. The people who'd be living in this codebase weren't some future team of hired engineers — they were the same people who had drawn the app in the first place. Making _them_ faster was the actual assignment. Whether that worked is a question this piece can answer, and I'll come back to it at the end.
+
+## What
+
+So that's what Levon and his team came up to me with. They wanted a fully functional code-based rewrite of an already working app shipped in 1.5–2 months (a timeline I agreed to but didn't ultimately meet).
+
+To give some perspective on why this was a pretty challenging endeavor:
+
+**1 — A Bubble app export** — the "code" in "no code", and the thing you're going to feed to an agent while rebuilding — **is a multi-megabyte JSON.** In the case of Playgram, it weighed 11.6 megabytes, minified, on one line. Suffice to say, VS Code crashes when you try to open a JSON that big. Good luck feeding that to an agent. The instruction that ended up in the repo's own guide for agents is blunter than anything I'd have written for a human: **"Do not read directly** — all the info you might need is in the split files."
+
+**2 — This was a live app in the beginning of its lifecycle.** The team was meant to keep shipping new features, improving prompts, and catching bugs while a code rewrite was being built in parallel. The target kept moving, on purpose, and correctly so — you don't freeze a product for four months to please your contractor.
+
+**3 — The team invested quite a lot into design,** so they were adamant the rewrite had to be not just functionally equivalent, but a _pixel-perfect_ match visually, too.
+
+**4 — Like most Bubble apps, the app kept its data in Bubble's proprietary DB format,** with no way of easy data migration to a new platform, whatever that would ultimately be. That one is a story of its own, and it's Part II's.
+
+Below you'll find how we tackled each of these challenges; how we discovered new ones I would've never envisioned, and what mistakes we made along the way (so you don't have to).
+
+## The rebuild, in numbers
+
+Before the grit, the shape of the thing.
+
+![Two charts sharing a timeline from 6 March to 21 August 2026. Cumulative units of work on main rises from about six a day to about nine across a four-week seam in late April and May; weekly units of work go from the forties to the eighties across the same seam, then fall by two thirds after the 4.4.3 handover](./assets/playgram-commit-cumsum.svg)
+
+| Date       | Day | What happened                                                                  |
+| ---------- | --- | ------------------------------------------------------------------------------ |
+| **6 Mar**  | 1   | First commit. Not code — a splitting script and a pile of research.            |
+| **10 Mar** | 5   | The Next.js app gets bootstrapped. `layout.tsx`, `page.tsx`, and nothing else. |
+| **12 Mar** | 7   | First feature code: auth screens, styled to match the Bubble original.         |
+| **19 Mar** | 14  | A message goes to an LLM and a response comes back. The product loop works.    |
+| **24 Apr** | 50  | The first pull requests. Until now everything went straight to `main`.         |
+| **6 May**  | 62  | **The original deadline.** Nothing in production.                              |
+| **21 May** | 77  | `4.0.0` — first production build.                                              |
+| **26 May** | 82  | The last local sessions. From here it's cloud agents and PR squashes.          |
+| **24 Jun** | 111 | `4.1.0` — first workspace actually running on the rewrite.                     |
+| **3 Jul**  | 120 | `4.2.0` — the big cutover.                                                     |
+| **11 Jul** | 128 | `4.3.0` — all workspaces on the rewrite. Bubble is off.                        |
+| **31 Jul** | 148 | `4.4.0` — workspace credits and model access control.                          |
+| **10 Aug** | 158 | `4.4.3` — the last release that's mostly mine. Handover.                       |
+
+A note on that chart. When I sketched this article I claimed you could _precisely_ see the spot where my working method changed. It isn't a spot; it's a seam about four weeks wide, running from the last week of April to the last week of May. Three signals agree on where it sits:
+
+- **The local CLI's signature stops.** Claude Code stamps a model-named `Co-Authored-By` trailer — `Claude Opus 4.6`, `Claude Sonnet 4.6`, `Claude Opus 4.7 (1M context)` — on commits made from my laptop. It's on 393 commits through March and April, twice more in May, and never again.
+- **The cloud's signature starts.** The bare `Co-Authored-By: Claude` form, which is what the web sessions write, appears for the first time in May and is on 806 commits from there to the end.
+- **Pull requests start existing.** Before 24 April there are none — the work went straight to `main`. From that week on everything arrives as a branch, and by late May the `(pr #…)` squash marker is running at about eighty a week.
+
+The number that actually proves the point is a boring one: **the median unit of work stays about the same size — 367 changed lines before the seam, 330 after — while units per day go from 6.1 to 8.9.** Same-sized pieces, forty-odd percent more of them at a time. That's the fingerprint of parallel streams rather than bigger batches, which is exactly what "I went from three agents to twenty" should look like in a graph.
```

**@vzakharov** — 2026-08-27T12:46:48Z

No one needs this archeaology, this reads like something you (the agent) would be explaining to me (the operator) within the Claude session, so it's understandable you might end up adding it here; but pls remember the difference: This is targeting readers who are interested in how the app was rebuilt, not how we discerned PRs vs commits based on signatures.

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:190

````diff
@@ -0,0 +1,722 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                               |                                                                                          |
+| ----------------------------- | ---------------------------------------------------------------------------------------- |
+| **Assignment**                | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase             |
+| **Span**                      | 6 March – 10 August 2026 · 158 days                                                      |
+| **The "code" I started from** | an 11.6 MB minified JSON — the Bubble app export                                         |
+| **Shipped**                   | 1,395 units of work on `main` · 1,029 merged pull requests · 250,000 lines of TypeScript |
+| **Cold load**                 | multi-second → sub-second                                                                |
+| **Released**                  | 48 versioned releases plus 18 hotfixes — a production deploy every 2.4 days              |
+| **Cutovers**                  | 3 workspaces, zero rollbacks                                                             |
+| **Team**                      | four people, and ten to twenty-five Claude Code agents at a time                         |
+
+_Disclaimer: the disclosures in this case study were approved by Playgram management, i.e. no NDA breach._
+
+---
+
+After I started writing this case study, I realized that even the [brief](https://github.com/vzakharov/vovazakharov.com/issues/4) I'd give Claude to hydrate turned out to be 5,300 words long — and even then, after I'd finished it I understood that I'd only scratched the surface of everything I wanted to tell. So, (a) sorry it's so long, (b) check out the [mini version](./playgram-bubble-to-nextjs-part-1.mini.md) and the [micro version](./playgram-bubble-to-nextjs-part-1.micro.md), and (c) I'll post more detailed insights on some or all of the aspects later.
+
+## Intro
+
+In case you didn't know, Bubble is a no-code app builder.
+
+When you think of such tools, you'd think that people would just use it to make simple things — a directory site, an internal CRUD tool, a booking form, the kind of marketplace MVP you build to find out whether anyone wants it.
+
+But you'd be surprised how far people can actually take it — from a [subletting marketplace](https://bubble.io/blog/ohana/) whose hosts have earned $16.2 million and which [Stripe projects](https://stripe.com/customers/ohana) will process $60 million this year, to a [hospitality operations platform](https://bubble.io/blog/suiteop/) running a hundred-plus organizations and up to 30,000 daily guest users, to a [one-person company](https://bubble.io/blog/formula-bot/) that reached a million users, built by a non-programmer over a paternity leave.
+
+None of those are toys. A lot of software you've used was probably drawn rather than typed.
+
+In our case, we're talking about Playgram, an app that managed to put together a chat interface giving access to multiple providers and models, realtime team/project chat UIs, libraries of generated images & files, memory & knowledge management, voice input, and tons of other small "nifties" — all brought to life with no code at all:
+
+https://github.com/user-attachments/assets/16e67cd5-5727-419b-be2b-ffaa2541a44c
+
+(This is a screen recording already after migration to code, but you get the idea.)
+
+So why would then they want to switch to code if it was all so great?
+
+## Why
+
+**1 — Performance.** However hard you try, when you put abstraction over abstraction over abstraction to make an app work in a "draw a couple of interconnected boxes, and it just works" fashion, you're bound to hurt the performance. The platform — quoting its [own performance guide](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling) — sends "the code for all the elements (visible and invisible)" before it draws anything, degrades multiplicatively with every nested repeating group, and ships the code of every plugin you install on every page load, whether you use it or not.
+
+But the part you can't claw back is the floor. A Bubble page ships three render-blocking platform bundles before your app exists; a group of developers [measured](https://forum.bubble.io/t/seeking-advice-on-slow-page-loads-in-bubble-applications/327360) an almost-empty page — one text heading, nothing else — and found a Lighthouse Speed Index of 1.5–1.7 seconds.
+
+To spoil the ending: moving Playgram to Next changed cold load times from multi-second to sub-second; something which is _instantly_ tangible for a user, even if "wait a couple secs at first load" doesn't sound like such a big thing.
+
+**2 — Bumping into the bubble's edges.** All too many Bubble developers have faced the same thing again and again as their apps grow: they meet the system's limits and end up installing (and sometimes purchasing) third-party plugins, running vanilla JS in the browser, or even writing their own reactivity frameworks to make up for what Bubble can not provide. Quite illustratively, the number one Bubble plugin, with over 538,000 lifetime downloads, is [one that allows](https://bubble.io/blog/top-community-plugins-templates-2023/) running custom JavaScript. The most popular thing anyone ever built for the platform is a way out of it — and two of the five top templates that year were entire homegrown application frameworks built on top of Bubble, for the same reason one layer up.
+
+In the case of Playgram, by the way, the makers are Zeroqode, with a ballpark of 800 plugins shipped, two of which were among the five most-installed community plugins for Bubble in 2023. And they still felt like they were lacking. When the people who supply everyone else's escape hatches start wanting out, that tells you something.
+
+**3 — Missing out on all the AI agents stuff.** Although Bubble has been making inroads into using AI for its builders, needless to say its capabilities are far behind what modern tools like Claude Code, Cursor, or Codex provide. The team was feeling like they were missing out on being able to deliver more features in smaller time frames.
+
+That third one is the interesting one, and it's most of what this case study is about. It's also the one that turned out to be measurable. Two examples from the far end of the project, both of them things the product had wanted for a long time:
+
+- **Billing that actually bills.** In Bubble, credits were a line of marketing copy on a pricing card; the app's own release notes mention them twice and both times cosmetically. Fifteen days after the first commit on it, credits were a metered quantity — every model call, embedding, transcription and provider-run tool priced into a usage ledger across fifteen distinct cost stages, decremented live, enforced server-side at send time, carried over at renewal and capped per member.
+- **Access control.** Member groups with a per-group allow or deny list over the model catalogue, and a per-member override on top of that. Server-authoritative enforcement was live six days after the first commit on it; the admin UI and the model-picker gating, thirteen days.
+
+Good luck shipping either of those on that clock by drawing boxes.
+
+And there's a second-order version of the point that I didn't fully appreciate until the end. The people who'd be living in this codebase weren't some future team of hired engineers — they were the same people who had drawn the app in the first place. Making _them_ faster was the actual assignment. Whether that worked is a question this piece can answer, and I'll come back to it at the end.
+
+## What
+
+So that's what Levon and his team came up to me with. They wanted a fully functional code-based rewrite of an already working app shipped in 1.5–2 months (a timeline I agreed to but didn't ultimately meet).
+
+To give some perspective on why this was a pretty challenging endeavor:
+
+**1 — A Bubble app export** — the "code" in "no code", and the thing you're going to feed to an agent while rebuilding — **is a multi-megabyte JSON.** In the case of Playgram, it weighed 11.6 megabytes, minified, on one line. Suffice to say, VS Code crashes when you try to open a JSON that big. Good luck feeding that to an agent. The instruction that ended up in the repo's own guide for agents is blunter than anything I'd have written for a human: **"Do not read directly** — all the info you might need is in the split files."
+
+**2 — This was a live app in the beginning of its lifecycle.** The team was meant to keep shipping new features, improving prompts, and catching bugs while a code rewrite was being built in parallel. The target kept moving, on purpose, and correctly so — you don't freeze a product for four months to please your contractor.
+
+**3 — The team invested quite a lot into design,** so they were adamant the rewrite had to be not just functionally equivalent, but a _pixel-perfect_ match visually, too.
+
+**4 — Like most Bubble apps, the app kept its data in Bubble's proprietary DB format,** with no way of easy data migration to a new platform, whatever that would ultimately be. That one is a story of its own, and it's Part II's.
+
+Below you'll find how we tackled each of these challenges; how we discovered new ones I would've never envisioned, and what mistakes we made along the way (so you don't have to).
+
+## The rebuild, in numbers
+
+Before the grit, the shape of the thing.
+
+![Two charts sharing a timeline from 6 March to 21 August 2026. Cumulative units of work on main rises from about six a day to about nine across a four-week seam in late April and May; weekly units of work go from the forties to the eighties across the same seam, then fall by two thirds after the 4.4.3 handover](./assets/playgram-commit-cumsum.svg)
+
+| Date       | Day | What happened                                                                  |
+| ---------- | --- | ------------------------------------------------------------------------------ |
+| **6 Mar**  | 1   | First commit. Not code — a splitting script and a pile of research.            |
+| **10 Mar** | 5   | The Next.js app gets bootstrapped. `layout.tsx`, `page.tsx`, and nothing else. |
+| **12 Mar** | 7   | First feature code: auth screens, styled to match the Bubble original.         |
+| **19 Mar** | 14  | A message goes to an LLM and a response comes back. The product loop works.    |
+| **24 Apr** | 50  | The first pull requests. Until now everything went straight to `main`.         |
+| **6 May**  | 62  | **The original deadline.** Nothing in production.                              |
+| **21 May** | 77  | `4.0.0` — first production build.                                              |
+| **26 May** | 82  | The last local sessions. From here it's cloud agents and PR squashes.          |
+| **24 Jun** | 111 | `4.1.0` — first workspace actually running on the rewrite.                     |
+| **3 Jul**  | 120 | `4.2.0` — the big cutover.                                                     |
+| **11 Jul** | 128 | `4.3.0` — all workspaces on the rewrite. Bubble is off.                        |
+| **31 Jul** | 148 | `4.4.0` — workspace credits and model access control.                          |
+| **10 Aug** | 158 | `4.4.3` — the last release that's mostly mine. Handover.                       |
+
+A note on that chart. When I sketched this article I claimed you could _precisely_ see the spot where my working method changed. It isn't a spot; it's a seam about four weeks wide, running from the last week of April to the last week of May. Three signals agree on where it sits:
+
+- **The local CLI's signature stops.** Claude Code stamps a model-named `Co-Authored-By` trailer — `Claude Opus 4.6`, `Claude Sonnet 4.6`, `Claude Opus 4.7 (1M context)` — on commits made from my laptop. It's on 393 commits through March and April, twice more in May, and never again.
+- **The cloud's signature starts.** The bare `Co-Authored-By: Claude` form, which is what the web sessions write, appears for the first time in May and is on 806 commits from there to the end.
+- **Pull requests start existing.** Before 24 April there are none — the work went straight to `main`. From that week on everything arrives as a branch, and by late May the `(pr #…)` squash marker is running at about eighty a week.
+
+The number that actually proves the point is a boring one: **the median unit of work stays about the same size — 367 changed lines before the seam, 330 after — while units per day go from 6.1 to 8.9.** Same-sized pieces, forty-odd percent more of them at a time. That's the fingerprint of parallel streams rather than bigger batches, which is exactly what "I went from three agents to twenty" should look like in a graph.
+
+The bottom panel has a shape worth walking through, because it's the project's whole arc in one row of bars. Output steps up in the first week of May, when I moved to the web sessions. It then runs at its ceiling — four straight weeks in the eighties — right up to `4.1.0` on 24 June, and that stretch is a visible race: bug fixes are 39% of everything landing in it. The week after `4.1.0` it halves, and never returns to the ceiling. That isn't a slump. It's the point where rebuilding Bubble-as-it-was stopped being the job: refactors go from 11% to 17% of the work, release management becomes a line item, and what's left is new features, bug fixes and chores at a pace a normal team would recognise.
+
+(Both panels count code only. Documentation commits are excluded, because the opening fortnight produced enough of them to bury everything else on the chart — the decision-docs section below explains what they all were.)
+
+A word on what a "commit" means here, because it's load-bearing for that chart. A commit is not just "a piece of code shipped to GitHub." Before switching to a PR-based approach (more on that below), every commit to `main` was a finished set of work on a specific, well-defined scope. So, basically, you can say it _was_ a PR, just not formed as such. After the switch, every commit on `main` is a squash from a PR branch — so, throughout this codebase's evolution, the "conceptual" meaning of a commit on `main` hasn't changed.
+
+---
+
+# Part one: setting the table
+
+Everything in this half happened before the code could scale. It's the least glamorous four weeks of the project and the reason the other fourteen worked.
+
+## The split
+
+As I already said, the JSON that is an exported Bubble app is an 11.6 MB file, minified, so not even the most context-rich agent would be able to eat it at once. That's why the first step I took was to write a script that splits it into pieces.
+
+But "splitting" isn't as straightforward as it seems.
+
+**1 — You can't just grab subobjects, cut them by some ceiling size, and expect an agent to handle it.** For context, our _ultimate_ split turned out to be **3,487 files** — far more than what an agent can comfortably navigate. Slicing by size gets you 3,487 files named after nothing, and an agent that must read all of them to find one.
+
+**2 — Even if you DO manage to split it once** — remember, the app changes; so every week, once you re-export the Bubble app and try to have the agent "look at the diff", you'd get a chaotic mess that would be impossible to make sense of. A split that isn't stable across re-exports is a split you can only use once.
+
+**What we did right:** the agent researched the common data structures within the JSON programmatically, figuring out what a usual "workflow" is, how its constituent "actions" look, which keys store the "names" of all those entities, etc. As a result, it was able to split it into something that _almost_ looks like code (or, at least, enough so for an AI agent — not a human, mind you — to be able to figure it out).
+
+Here's the click handler on the chat composer's send button. The splitter gave it a directory of its own and wrote one file per step, so `actions/index.js` is the workflow's body, in order, as ES module imports:
+
+```js
+// bubble/playgram_split/pages/index/workflows/buttonclicked_btnaw0/actions/index.js
+import { _1488796042609x768734193128308700_aag } from './_1488796042609x768734193128308700_aag.js';
+import { setfocustoelement } from './setfocustoelement.js';
+import { setcustomstate } from './setcustomstate.js';
+import { resetgroup } from './resetgroup.js';
+import { schedule_trigger_stream_existing_chat_after_0_seconds } from './schedule_trigger_stream_existing_chat_after_0_seconds/index.js';
+import { displaylistdata } from './displaylistdata.js';
+import { setcustomstate_1 } from './setcustomstate_1.js';
+import { schedulecustom } from './schedulecustom.js';
+
+export const actions = {
+  0: _1488796042609x768734193128308700_aag,
+  1: setfocustoelement,
+  2: setcustomstate,
+  3: resetgroup,
+  4: schedule_trigger_stream_existing_chat_after_0_seconds,
+  5: displaylistdata,
+  6: setcustomstate_1,
+  7: schedulecustom,
+};
+```
+
+Read that as a function body and you're reading it correctly. The directory name carries the trigger, the numbered map is Bubble's own step order, every step is a file you can open — and step 4's filename is not a slug of an ID but the label a human typed into the Bubble editor, recovered from the export's `name` field: _"Schedule trigger_stream_existing_chat after 0 seconds"_.
+
+And there's one lovely bit of self-incrimination in there. Step 0 is the only step with an unreadable name, because it's the only step Bubble keys purely by plugin ID — `1488796042609x768734193128308700`. That ID belongs to Toolbox, the run-custom-JavaScript plugin from a few paragraphs up. Step zero of sending a chat message in our no-code app was a `Run javascript` action.
+
+Elements got the same treatment. A whole reusable component, 27 lines, untrimmed — its own properties, then the two imports that bind it to its children and to its handlers:
+
+```js
+// bubble/playgram_split/element_definitions/dropdown_admin_analytics/index.js
+import { elements } from './elements/index.js';
+import { workflows } from './workflows/index.js';
+
+export const Dropdown_admin_analytics = {
+  elements: elements,
+  workflows: workflows,
+  properties: {
+    height: 200,
+    width: 200,
+    group_type: 'option.date_period__os_',
+    background_style: 'none',
+    max_width_px: 80,
+    default_width: 200,
+    max_height_px: 36,
+    min_height_px: 36,
+    wf_folder_list: { bTqIt0: 'Project', bTqIu0: 'User Settings' },
+    element_version: 5,
+    container_layout: 'column',
+    custom_element_platform: 'web',
+  },
+  type: 'CustomDefinition',
+  id: 'bTrBV1',
+  name: 'Dropdown admin analytics',
+};
+```
+
+The directory tree does the rest of the work, because it reproduces the UI containment hierarchy verbatim. `workspace_settings/elements/popup_delete_member/elements/group_buttons/` is, quite literally, where the Cancel and Delete buttons live. `memory_knowledge/.../group_container_voice_recorder/elements/button_save_recording.js` is the save button on the voice recorder. An agent asked to find the delete-member confirmation does not search; it navigates.
+
+Two details in there that I'd steal for any future version of this. The first is that the export's own opaque-ID map gets rewritten as a lookup table, so any ID an agent stumbles on resolves to a path:
````

**@vzakharov** — 2026-08-27T12:53:22Z

Again, all of this from here up until "And on problem 2" reads like smth you're writing for the operator or yourself; it's too under-the-hood. We wanted to demonstrate how we approach the split, and we did, the rest is implementation detail.

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:264

````diff
@@ -0,0 +1,722 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                               |                                                                                          |
+| ----------------------------- | ---------------------------------------------------------------------------------------- |
+| **Assignment**                | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase             |
+| **Span**                      | 6 March – 10 August 2026 · 158 days                                                      |
+| **The "code" I started from** | an 11.6 MB minified JSON — the Bubble app export                                         |
+| **Shipped**                   | 1,395 units of work on `main` · 1,029 merged pull requests · 250,000 lines of TypeScript |
+| **Cold load**                 | multi-second → sub-second                                                                |
+| **Released**                  | 48 versioned releases plus 18 hotfixes — a production deploy every 2.4 days              |
+| **Cutovers**                  | 3 workspaces, zero rollbacks                                                             |
+| **Team**                      | four people, and ten to twenty-five Claude Code agents at a time                         |
+
+_Disclaimer: the disclosures in this case study were approved by Playgram management, i.e. no NDA breach._
+
+---
+
+After I started writing this case study, I realized that even the [brief](https://github.com/vzakharov/vovazakharov.com/issues/4) I'd give Claude to hydrate turned out to be 5,300 words long — and even then, after I'd finished it I understood that I'd only scratched the surface of everything I wanted to tell. So, (a) sorry it's so long, (b) check out the [mini version](./playgram-bubble-to-nextjs-part-1.mini.md) and the [micro version](./playgram-bubble-to-nextjs-part-1.micro.md), and (c) I'll post more detailed insights on some or all of the aspects later.
+
+## Intro
+
+In case you didn't know, Bubble is a no-code app builder.
+
+When you think of such tools, you'd think that people would just use it to make simple things — a directory site, an internal CRUD tool, a booking form, the kind of marketplace MVP you build to find out whether anyone wants it.
+
+But you'd be surprised how far people can actually take it — from a [subletting marketplace](https://bubble.io/blog/ohana/) whose hosts have earned $16.2 million and which [Stripe projects](https://stripe.com/customers/ohana) will process $60 million this year, to a [hospitality operations platform](https://bubble.io/blog/suiteop/) running a hundred-plus organizations and up to 30,000 daily guest users, to a [one-person company](https://bubble.io/blog/formula-bot/) that reached a million users, built by a non-programmer over a paternity leave.
+
+None of those are toys. A lot of software you've used was probably drawn rather than typed.
+
+In our case, we're talking about Playgram, an app that managed to put together a chat interface giving access to multiple providers and models, realtime team/project chat UIs, libraries of generated images & files, memory & knowledge management, voice input, and tons of other small "nifties" — all brought to life with no code at all:
+
+https://github.com/user-attachments/assets/16e67cd5-5727-419b-be2b-ffaa2541a44c
+
+(This is a screen recording already after migration to code, but you get the idea.)
+
+So why would then they want to switch to code if it was all so great?
+
+## Why
+
+**1 — Performance.** However hard you try, when you put abstraction over abstraction over abstraction to make an app work in a "draw a couple of interconnected boxes, and it just works" fashion, you're bound to hurt the performance. The platform — quoting its [own performance guide](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling) — sends "the code for all the elements (visible and invisible)" before it draws anything, degrades multiplicatively with every nested repeating group, and ships the code of every plugin you install on every page load, whether you use it or not.
+
+But the part you can't claw back is the floor. A Bubble page ships three render-blocking platform bundles before your app exists; a group of developers [measured](https://forum.bubble.io/t/seeking-advice-on-slow-page-loads-in-bubble-applications/327360) an almost-empty page — one text heading, nothing else — and found a Lighthouse Speed Index of 1.5–1.7 seconds.
+
+To spoil the ending: moving Playgram to Next changed cold load times from multi-second to sub-second; something which is _instantly_ tangible for a user, even if "wait a couple secs at first load" doesn't sound like such a big thing.
+
+**2 — Bumping into the bubble's edges.** All too many Bubble developers have faced the same thing again and again as their apps grow: they meet the system's limits and end up installing (and sometimes purchasing) third-party plugins, running vanilla JS in the browser, or even writing their own reactivity frameworks to make up for what Bubble can not provide. Quite illustratively, the number one Bubble plugin, with over 538,000 lifetime downloads, is [one that allows](https://bubble.io/blog/top-community-plugins-templates-2023/) running custom JavaScript. The most popular thing anyone ever built for the platform is a way out of it — and two of the five top templates that year were entire homegrown application frameworks built on top of Bubble, for the same reason one layer up.
+
+In the case of Playgram, by the way, the makers are Zeroqode, with a ballpark of 800 plugins shipped, two of which were among the five most-installed community plugins for Bubble in 2023. And they still felt like they were lacking. When the people who supply everyone else's escape hatches start wanting out, that tells you something.
+
+**3 — Missing out on all the AI agents stuff.** Although Bubble has been making inroads into using AI for its builders, needless to say its capabilities are far behind what modern tools like Claude Code, Cursor, or Codex provide. The team was feeling like they were missing out on being able to deliver more features in smaller time frames.
+
+That third one is the interesting one, and it's most of what this case study is about. It's also the one that turned out to be measurable. Two examples from the far end of the project, both of them things the product had wanted for a long time:
+
+- **Billing that actually bills.** In Bubble, credits were a line of marketing copy on a pricing card; the app's own release notes mention them twice and both times cosmetically. Fifteen days after the first commit on it, credits were a metered quantity — every model call, embedding, transcription and provider-run tool priced into a usage ledger across fifteen distinct cost stages, decremented live, enforced server-side at send time, carried over at renewal and capped per member.
+- **Access control.** Member groups with a per-group allow or deny list over the model catalogue, and a per-member override on top of that. Server-authoritative enforcement was live six days after the first commit on it; the admin UI and the model-picker gating, thirteen days.
+
+Good luck shipping either of those on that clock by drawing boxes.
+
+And there's a second-order version of the point that I didn't fully appreciate until the end. The people who'd be living in this codebase weren't some future team of hired engineers — they were the same people who had drawn the app in the first place. Making _them_ faster was the actual assignment. Whether that worked is a question this piece can answer, and I'll come back to it at the end.
+
+## What
+
+So that's what Levon and his team came up to me with. They wanted a fully functional code-based rewrite of an already working app shipped in 1.5–2 months (a timeline I agreed to but didn't ultimately meet).
+
+To give some perspective on why this was a pretty challenging endeavor:
+
+**1 — A Bubble app export** — the "code" in "no code", and the thing you're going to feed to an agent while rebuilding — **is a multi-megabyte JSON.** In the case of Playgram, it weighed 11.6 megabytes, minified, on one line. Suffice to say, VS Code crashes when you try to open a JSON that big. Good luck feeding that to an agent. The instruction that ended up in the repo's own guide for agents is blunter than anything I'd have written for a human: **"Do not read directly** — all the info you might need is in the split files."
+
+**2 — This was a live app in the beginning of its lifecycle.** The team was meant to keep shipping new features, improving prompts, and catching bugs while a code rewrite was being built in parallel. The target kept moving, on purpose, and correctly so — you don't freeze a product for four months to please your contractor.
+
+**3 — The team invested quite a lot into design,** so they were adamant the rewrite had to be not just functionally equivalent, but a _pixel-perfect_ match visually, too.
+
+**4 — Like most Bubble apps, the app kept its data in Bubble's proprietary DB format,** with no way of easy data migration to a new platform, whatever that would ultimately be. That one is a story of its own, and it's Part II's.
+
+Below you'll find how we tackled each of these challenges; how we discovered new ones I would've never envisioned, and what mistakes we made along the way (so you don't have to).
+
+## The rebuild, in numbers
+
+Before the grit, the shape of the thing.
+
+![Two charts sharing a timeline from 6 March to 21 August 2026. Cumulative units of work on main rises from about six a day to about nine across a four-week seam in late April and May; weekly units of work go from the forties to the eighties across the same seam, then fall by two thirds after the 4.4.3 handover](./assets/playgram-commit-cumsum.svg)
+
+| Date       | Day | What happened                                                                  |
+| ---------- | --- | ------------------------------------------------------------------------------ |
+| **6 Mar**  | 1   | First commit. Not code — a splitting script and a pile of research.            |
+| **10 Mar** | 5   | The Next.js app gets bootstrapped. `layout.tsx`, `page.tsx`, and nothing else. |
+| **12 Mar** | 7   | First feature code: auth screens, styled to match the Bubble original.         |
+| **19 Mar** | 14  | A message goes to an LLM and a response comes back. The product loop works.    |
+| **24 Apr** | 50  | The first pull requests. Until now everything went straight to `main`.         |
+| **6 May**  | 62  | **The original deadline.** Nothing in production.                              |
+| **21 May** | 77  | `4.0.0` — first production build.                                              |
+| **26 May** | 82  | The last local sessions. From here it's cloud agents and PR squashes.          |
+| **24 Jun** | 111 | `4.1.0` — first workspace actually running on the rewrite.                     |
+| **3 Jul**  | 120 | `4.2.0` — the big cutover.                                                     |
+| **11 Jul** | 128 | `4.3.0` — all workspaces on the rewrite. Bubble is off.                        |
+| **31 Jul** | 148 | `4.4.0` — workspace credits and model access control.                          |
+| **10 Aug** | 158 | `4.4.3` — the last release that's mostly mine. Handover.                       |
+
+A note on that chart. When I sketched this article I claimed you could _precisely_ see the spot where my working method changed. It isn't a spot; it's a seam about four weeks wide, running from the last week of April to the last week of May. Three signals agree on where it sits:
+
+- **The local CLI's signature stops.** Claude Code stamps a model-named `Co-Authored-By` trailer — `Claude Opus 4.6`, `Claude Sonnet 4.6`, `Claude Opus 4.7 (1M context)` — on commits made from my laptop. It's on 393 commits through March and April, twice more in May, and never again.
+- **The cloud's signature starts.** The bare `Co-Authored-By: Claude` form, which is what the web sessions write, appears for the first time in May and is on 806 commits from there to the end.
+- **Pull requests start existing.** Before 24 April there are none — the work went straight to `main`. From that week on everything arrives as a branch, and by late May the `(pr #…)` squash marker is running at about eighty a week.
+
+The number that actually proves the point is a boring one: **the median unit of work stays about the same size — 367 changed lines before the seam, 330 after — while units per day go from 6.1 to 8.9.** Same-sized pieces, forty-odd percent more of them at a time. That's the fingerprint of parallel streams rather than bigger batches, which is exactly what "I went from three agents to twenty" should look like in a graph.
+
+The bottom panel has a shape worth walking through, because it's the project's whole arc in one row of bars. Output steps up in the first week of May, when I moved to the web sessions. It then runs at its ceiling — four straight weeks in the eighties — right up to `4.1.0` on 24 June, and that stretch is a visible race: bug fixes are 39% of everything landing in it. The week after `4.1.0` it halves, and never returns to the ceiling. That isn't a slump. It's the point where rebuilding Bubble-as-it-was stopped being the job: refactors go from 11% to 17% of the work, release management becomes a line item, and what's left is new features, bug fixes and chores at a pace a normal team would recognise.
+
+(Both panels count code only. Documentation commits are excluded, because the opening fortnight produced enough of them to bury everything else on the chart — the decision-docs section below explains what they all were.)
+
+A word on what a "commit" means here, because it's load-bearing for that chart. A commit is not just "a piece of code shipped to GitHub." Before switching to a PR-based approach (more on that below), every commit to `main` was a finished set of work on a specific, well-defined scope. So, basically, you can say it _was_ a PR, just not formed as such. After the switch, every commit on `main` is a squash from a PR branch — so, throughout this codebase's evolution, the "conceptual" meaning of a commit on `main` hasn't changed.
+
+---
+
+# Part one: setting the table
+
+Everything in this half happened before the code could scale. It's the least glamorous four weeks of the project and the reason the other fourteen worked.
+
+## The split
+
+As I already said, the JSON that is an exported Bubble app is an 11.6 MB file, minified, so not even the most context-rich agent would be able to eat it at once. That's why the first step I took was to write a script that splits it into pieces.
+
+But "splitting" isn't as straightforward as it seems.
+
+**1 — You can't just grab subobjects, cut them by some ceiling size, and expect an agent to handle it.** For context, our _ultimate_ split turned out to be **3,487 files** — far more than what an agent can comfortably navigate. Slicing by size gets you 3,487 files named after nothing, and an agent that must read all of them to find one.
+
+**2 — Even if you DO manage to split it once** — remember, the app changes; so every week, once you re-export the Bubble app and try to have the agent "look at the diff", you'd get a chaotic mess that would be impossible to make sense of. A split that isn't stable across re-exports is a split you can only use once.
+
+**What we did right:** the agent researched the common data structures within the JSON programmatically, figuring out what a usual "workflow" is, how its constituent "actions" look, which keys store the "names" of all those entities, etc. As a result, it was able to split it into something that _almost_ looks like code (or, at least, enough so for an AI agent — not a human, mind you — to be able to figure it out).
+
+Here's the click handler on the chat composer's send button. The splitter gave it a directory of its own and wrote one file per step, so `actions/index.js` is the workflow's body, in order, as ES module imports:
+
+```js
+// bubble/playgram_split/pages/index/workflows/buttonclicked_btnaw0/actions/index.js
+import { _1488796042609x768734193128308700_aag } from './_1488796042609x768734193128308700_aag.js';
+import { setfocustoelement } from './setfocustoelement.js';
+import { setcustomstate } from './setcustomstate.js';
+import { resetgroup } from './resetgroup.js';
+import { schedule_trigger_stream_existing_chat_after_0_seconds } from './schedule_trigger_stream_existing_chat_after_0_seconds/index.js';
+import { displaylistdata } from './displaylistdata.js';
+import { setcustomstate_1 } from './setcustomstate_1.js';
+import { schedulecustom } from './schedulecustom.js';
+
+export const actions = {
+  0: _1488796042609x768734193128308700_aag,
+  1: setfocustoelement,
+  2: setcustomstate,
+  3: resetgroup,
+  4: schedule_trigger_stream_existing_chat_after_0_seconds,
+  5: displaylistdata,
+  6: setcustomstate_1,
+  7: schedulecustom,
+};
+```
+
+Read that as a function body and you're reading it correctly. The directory name carries the trigger, the numbered map is Bubble's own step order, every step is a file you can open — and step 4's filename is not a slug of an ID but the label a human typed into the Bubble editor, recovered from the export's `name` field: _"Schedule trigger_stream_existing_chat after 0 seconds"_.
+
+And there's one lovely bit of self-incrimination in there. Step 0 is the only step with an unreadable name, because it's the only step Bubble keys purely by plugin ID — `1488796042609x768734193128308700`. That ID belongs to Toolbox, the run-custom-JavaScript plugin from a few paragraphs up. Step zero of sending a chat message in our no-code app was a `Run javascript` action.
+
+Elements got the same treatment. A whole reusable component, 27 lines, untrimmed — its own properties, then the two imports that bind it to its children and to its handlers:
+
+```js
+// bubble/playgram_split/element_definitions/dropdown_admin_analytics/index.js
+import { elements } from './elements/index.js';
+import { workflows } from './workflows/index.js';
+
+export const Dropdown_admin_analytics = {
+  elements: elements,
+  workflows: workflows,
+  properties: {
+    height: 200,
+    width: 200,
+    group_type: 'option.date_period__os_',
+    background_style: 'none',
+    max_width_px: 80,
+    default_width: 200,
+    max_height_px: 36,
+    min_height_px: 36,
+    wf_folder_list: { bTqIt0: 'Project', bTqIu0: 'User Settings' },
+    element_version: 5,
+    container_layout: 'column',
+    custom_element_platform: 'web',
+  },
+  type: 'CustomDefinition',
+  id: 'bTrBV1',
+  name: 'Dropdown admin analytics',
+};
+```
+
+The directory tree does the rest of the work, because it reproduces the UI containment hierarchy verbatim. `workspace_settings/elements/popup_delete_member/elements/group_buttons/` is, quite literally, where the Cancel and Delete buttons live. `memory_knowledge/.../group_container_voice_recorder/elements/button_save_recording.js` is the save button on the voice recorder. An agent asked to find the delete-member confirmation does not search; it navigates.
+
+Two details in there that I'd steal for any future version of this. The first is that the export's own opaque-ID map gets rewritten as a lookup table, so any ID an agent stumbles on resolves to a path:
+
+```js
+export const id_to_path_aal_to_btduh1 = {
+  bTaDh: '%p3.bTUzR0.%wf.bTYJM.actions.0',
+  bTaEG: '%ed.bTMNU.%wf.bTaEL',
+  bTavl: '%ed.bTaul.%el.bTavh.%el.bTavx.%el.bTavy',
+  // ...
+```
+
+The second is what happens when a Bubble element tree nests deeper than a filesystem enjoys. Anything past a 300-character path gets diverted into a `contd/` directory under a name built from the initials of each path segment, with the real location restored as the file's first line:
+
+```js
+// Original path: element_definitions/memory_knowledge/elements/group_main_column_container/elements/group_main_container/elements/group_add_new_memory/elements/group_input_add_memory_content/elements/group_container_input_voice/elements/group_container_voice_recorder/elements/group_dictate_use_button/elements/group_micro_use_button
+export const group_micro_use_button = {
+```
+
+491 of the 3,487 files live in `contd/`. That's a hack, and it's the right hack.
+
+### How it actually works, since that's the transferable part
+
+The script is 1,036 lines of dependency-free Python. Two things in it are the reason the output reads like code rather than like sliced JSON.
+
+**It duck-types on shape, because there's nothing else to go on.** Bubble's export carries no type tags at the collection level, so the splitter sniffs every dict against a handful of predicates and routes it to a specialised writer. Each predicate is a majority vote, which is precisely what makes it survive a format nobody documented:
+
+```python
+def is_workflows_dict(d):
+    """True if the dict looks like a Bubble workflows collection."""
+    if not isinstance(d, dict):
+        return False
+    vals = [v for v in d.values() if v is not None]
+    if not vals:
+        return False
+    hits = sum(
+        1 for v in vals
+        if isinstance(v, dict) and 'type' in v and 'actions' in v
+    )
+    return hits / len(vals) >= 0.7
+```
+
+Seventy percent. Not all. Ask a schema-first parser to handle a real Bubble export and it dies on the first irregularity; a voting heuristic shrugs and carries on.
+
+**It recovers human names through a precedence chain,** which is the single highest-leverage function in the file:
+
+```python
+def workflow_item_name(key, v):
+    """Best human-readable name for a single workflow item."""
+    if not isinstance(v, dict):
+        return key
+    event_name = (v.get('properties') or {}).get('event_name') or ''
+    if event_name:
+        return event_name
+    name = v.get('name') or ''
+    if name:
+        return name
+    wf_name = (v.get('properties') or {}).get('wf_name') or ''
+    if wf_name:
+        return wf_name
+    wtype = v.get('type') or ''
+    return f'{wtype}_{key}' if wtype else key
+```
+
+That last line is why an unnamed handler lands as `buttonclicked_bthdj.js` and not `bthdj.js`. Even the fallback tries to say something.
+
+And on problem 2 — the weekly re-export — the answer turned out to be five separate deliberate choices, none of which is obvious until a diff has burned you:
+
+1. **Names come from content, never from position.** A workflow keeps its filename when a step is inserted above it; a new element doesn't renumber its siblings.
+2. **Everything is emitted in a deterministic order.** Numeric collections sort numerically, chunk contents sort case-insensitively. Nothing depends on dict-iteration luck.
+3. **Chunks are named by their range, not by an index** — `id_to_path_btlgb_to_btnwa0.js`. Insert an entry and you perturb two boundary names, instead of shifting an `_1 … _18` sequence and rewriting every file in it.
+4. **Long strings get hoisted out to `.txt` siblings** whose filenames derive from their JSON path. This one is entirely about prompts: an LLM prompt embedded in JSON is a single line of `\n` escapes, so every edit to it diffs as one enormous changed line. Pulled out to a text file, it diffs like prose. 256 of them.
+5. **One key per line,** so a changed property is a one-line diff.
+
+The commit history of that script is the lesson in miniature. Seven refinements landed on the first day, and every one after the initial version is either a new structure-recogniser or a diff-legibility fix. At the first commit the split was 1,183 files and 15.3 MB. After the refinements: 3,137 files and 13.6 MB. **The total size barely moved; the file count tripled.** Same information, cut into three times as many navigable pieces.
+
+Best of all, now every button, input group, workflow, etc., was tied to a specific file in the "split" — if the Bubble app ever changed, it would more likely than not be represented in diffs in relevant files.
````

**@vzakharov** — 2026-08-27T12:55:59Z

I feel like we're going a bit too deep here too -- I'd limit ourselves to a prose paragraph with plain-word enumartions rather than a list with code references, and end with "Once everything was done, every button, ..."

I'd also let the "lesson in miniature" part go.

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:287

````diff
@@ -0,0 +1,722 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                               |                                                                                          |
+| ----------------------------- | ---------------------------------------------------------------------------------------- |
+| **Assignment**                | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase             |
+| **Span**                      | 6 March – 10 August 2026 · 158 days                                                      |
+| **The "code" I started from** | an 11.6 MB minified JSON — the Bubble app export                                         |
+| **Shipped**                   | 1,395 units of work on `main` · 1,029 merged pull requests · 250,000 lines of TypeScript |
+| **Cold load**                 | multi-second → sub-second                                                                |
+| **Released**                  | 48 versioned releases plus 18 hotfixes — a production deploy every 2.4 days              |
+| **Cutovers**                  | 3 workspaces, zero rollbacks                                                             |
+| **Team**                      | four people, and ten to twenty-five Claude Code agents at a time                         |
+
+_Disclaimer: the disclosures in this case study were approved by Playgram management, i.e. no NDA breach._
+
+---
+
+After I started writing this case study, I realized that even the [brief](https://github.com/vzakharov/vovazakharov.com/issues/4) I'd give Claude to hydrate turned out to be 5,300 words long — and even then, after I'd finished it I understood that I'd only scratched the surface of everything I wanted to tell. So, (a) sorry it's so long, (b) check out the [mini version](./playgram-bubble-to-nextjs-part-1.mini.md) and the [micro version](./playgram-bubble-to-nextjs-part-1.micro.md), and (c) I'll post more detailed insights on some or all of the aspects later.
+
+## Intro
+
+In case you didn't know, Bubble is a no-code app builder.
+
+When you think of such tools, you'd think that people would just use it to make simple things — a directory site, an internal CRUD tool, a booking form, the kind of marketplace MVP you build to find out whether anyone wants it.
+
+But you'd be surprised how far people can actually take it — from a [subletting marketplace](https://bubble.io/blog/ohana/) whose hosts have earned $16.2 million and which [Stripe projects](https://stripe.com/customers/ohana) will process $60 million this year, to a [hospitality operations platform](https://bubble.io/blog/suiteop/) running a hundred-plus organizations and up to 30,000 daily guest users, to a [one-person company](https://bubble.io/blog/formula-bot/) that reached a million users, built by a non-programmer over a paternity leave.
+
+None of those are toys. A lot of software you've used was probably drawn rather than typed.
+
+In our case, we're talking about Playgram, an app that managed to put together a chat interface giving access to multiple providers and models, realtime team/project chat UIs, libraries of generated images & files, memory & knowledge management, voice input, and tons of other small "nifties" — all brought to life with no code at all:
+
+https://github.com/user-attachments/assets/16e67cd5-5727-419b-be2b-ffaa2541a44c
+
+(This is a screen recording already after migration to code, but you get the idea.)
+
+So why would then they want to switch to code if it was all so great?
+
+## Why
+
+**1 — Performance.** However hard you try, when you put abstraction over abstraction over abstraction to make an app work in a "draw a couple of interconnected boxes, and it just works" fashion, you're bound to hurt the performance. The platform — quoting its [own performance guide](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling) — sends "the code for all the elements (visible and invisible)" before it draws anything, degrades multiplicatively with every nested repeating group, and ships the code of every plugin you install on every page load, whether you use it or not.
+
+But the part you can't claw back is the floor. A Bubble page ships three render-blocking platform bundles before your app exists; a group of developers [measured](https://forum.bubble.io/t/seeking-advice-on-slow-page-loads-in-bubble-applications/327360) an almost-empty page — one text heading, nothing else — and found a Lighthouse Speed Index of 1.5–1.7 seconds.
+
+To spoil the ending: moving Playgram to Next changed cold load times from multi-second to sub-second; something which is _instantly_ tangible for a user, even if "wait a couple secs at first load" doesn't sound like such a big thing.
+
+**2 — Bumping into the bubble's edges.** All too many Bubble developers have faced the same thing again and again as their apps grow: they meet the system's limits and end up installing (and sometimes purchasing) third-party plugins, running vanilla JS in the browser, or even writing their own reactivity frameworks to make up for what Bubble can not provide. Quite illustratively, the number one Bubble plugin, with over 538,000 lifetime downloads, is [one that allows](https://bubble.io/blog/top-community-plugins-templates-2023/) running custom JavaScript. The most popular thing anyone ever built for the platform is a way out of it — and two of the five top templates that year were entire homegrown application frameworks built on top of Bubble, for the same reason one layer up.
+
+In the case of Playgram, by the way, the makers are Zeroqode, with a ballpark of 800 plugins shipped, two of which were among the five most-installed community plugins for Bubble in 2023. And they still felt like they were lacking. When the people who supply everyone else's escape hatches start wanting out, that tells you something.
+
+**3 — Missing out on all the AI agents stuff.** Although Bubble has been making inroads into using AI for its builders, needless to say its capabilities are far behind what modern tools like Claude Code, Cursor, or Codex provide. The team was feeling like they were missing out on being able to deliver more features in smaller time frames.
+
+That third one is the interesting one, and it's most of what this case study is about. It's also the one that turned out to be measurable. Two examples from the far end of the project, both of them things the product had wanted for a long time:
+
+- **Billing that actually bills.** In Bubble, credits were a line of marketing copy on a pricing card; the app's own release notes mention them twice and both times cosmetically. Fifteen days after the first commit on it, credits were a metered quantity — every model call, embedding, transcription and provider-run tool priced into a usage ledger across fifteen distinct cost stages, decremented live, enforced server-side at send time, carried over at renewal and capped per member.
+- **Access control.** Member groups with a per-group allow or deny list over the model catalogue, and a per-member override on top of that. Server-authoritative enforcement was live six days after the first commit on it; the admin UI and the model-picker gating, thirteen days.
+
+Good luck shipping either of those on that clock by drawing boxes.
+
+And there's a second-order version of the point that I didn't fully appreciate until the end. The people who'd be living in this codebase weren't some future team of hired engineers — they were the same people who had drawn the app in the first place. Making _them_ faster was the actual assignment. Whether that worked is a question this piece can answer, and I'll come back to it at the end.
+
+## What
+
+So that's what Levon and his team came up to me with. They wanted a fully functional code-based rewrite of an already working app shipped in 1.5–2 months (a timeline I agreed to but didn't ultimately meet).
+
+To give some perspective on why this was a pretty challenging endeavor:
+
+**1 — A Bubble app export** — the "code" in "no code", and the thing you're going to feed to an agent while rebuilding — **is a multi-megabyte JSON.** In the case of Playgram, it weighed 11.6 megabytes, minified, on one line. Suffice to say, VS Code crashes when you try to open a JSON that big. Good luck feeding that to an agent. The instruction that ended up in the repo's own guide for agents is blunter than anything I'd have written for a human: **"Do not read directly** — all the info you might need is in the split files."
+
+**2 — This was a live app in the beginning of its lifecycle.** The team was meant to keep shipping new features, improving prompts, and catching bugs while a code rewrite was being built in parallel. The target kept moving, on purpose, and correctly so — you don't freeze a product for four months to please your contractor.
+
+**3 — The team invested quite a lot into design,** so they were adamant the rewrite had to be not just functionally equivalent, but a _pixel-perfect_ match visually, too.
+
+**4 — Like most Bubble apps, the app kept its data in Bubble's proprietary DB format,** with no way of easy data migration to a new platform, whatever that would ultimately be. That one is a story of its own, and it's Part II's.
+
+Below you'll find how we tackled each of these challenges; how we discovered new ones I would've never envisioned, and what mistakes we made along the way (so you don't have to).
+
+## The rebuild, in numbers
+
+Before the grit, the shape of the thing.
+
+![Two charts sharing a timeline from 6 March to 21 August 2026. Cumulative units of work on main rises from about six a day to about nine across a four-week seam in late April and May; weekly units of work go from the forties to the eighties across the same seam, then fall by two thirds after the 4.4.3 handover](./assets/playgram-commit-cumsum.svg)
+
+| Date       | Day | What happened                                                                  |
+| ---------- | --- | ------------------------------------------------------------------------------ |
+| **6 Mar**  | 1   | First commit. Not code — a splitting script and a pile of research.            |
+| **10 Mar** | 5   | The Next.js app gets bootstrapped. `layout.tsx`, `page.tsx`, and nothing else. |
+| **12 Mar** | 7   | First feature code: auth screens, styled to match the Bubble original.         |
+| **19 Mar** | 14  | A message goes to an LLM and a response comes back. The product loop works.    |
+| **24 Apr** | 50  | The first pull requests. Until now everything went straight to `main`.         |
+| **6 May**  | 62  | **The original deadline.** Nothing in production.                              |
+| **21 May** | 77  | `4.0.0` — first production build.                                              |
+| **26 May** | 82  | The last local sessions. From here it's cloud agents and PR squashes.          |
+| **24 Jun** | 111 | `4.1.0` — first workspace actually running on the rewrite.                     |
+| **3 Jul**  | 120 | `4.2.0` — the big cutover.                                                     |
+| **11 Jul** | 128 | `4.3.0` — all workspaces on the rewrite. Bubble is off.                        |
+| **31 Jul** | 148 | `4.4.0` — workspace credits and model access control.                          |
+| **10 Aug** | 158 | `4.4.3` — the last release that's mostly mine. Handover.                       |
+
+A note on that chart. When I sketched this article I claimed you could _precisely_ see the spot where my working method changed. It isn't a spot; it's a seam about four weeks wide, running from the last week of April to the last week of May. Three signals agree on where it sits:
+
+- **The local CLI's signature stops.** Claude Code stamps a model-named `Co-Authored-By` trailer — `Claude Opus 4.6`, `Claude Sonnet 4.6`, `Claude Opus 4.7 (1M context)` — on commits made from my laptop. It's on 393 commits through March and April, twice more in May, and never again.
+- **The cloud's signature starts.** The bare `Co-Authored-By: Claude` form, which is what the web sessions write, appears for the first time in May and is on 806 commits from there to the end.
+- **Pull requests start existing.** Before 24 April there are none — the work went straight to `main`. From that week on everything arrives as a branch, and by late May the `(pr #…)` squash marker is running at about eighty a week.
+
+The number that actually proves the point is a boring one: **the median unit of work stays about the same size — 367 changed lines before the seam, 330 after — while units per day go from 6.1 to 8.9.** Same-sized pieces, forty-odd percent more of them at a time. That's the fingerprint of parallel streams rather than bigger batches, which is exactly what "I went from three agents to twenty" should look like in a graph.
+
+The bottom panel has a shape worth walking through, because it's the project's whole arc in one row of bars. Output steps up in the first week of May, when I moved to the web sessions. It then runs at its ceiling — four straight weeks in the eighties — right up to `4.1.0` on 24 June, and that stretch is a visible race: bug fixes are 39% of everything landing in it. The week after `4.1.0` it halves, and never returns to the ceiling. That isn't a slump. It's the point where rebuilding Bubble-as-it-was stopped being the job: refactors go from 11% to 17% of the work, release management becomes a line item, and what's left is new features, bug fixes and chores at a pace a normal team would recognise.
+
+(Both panels count code only. Documentation commits are excluded, because the opening fortnight produced enough of them to bury everything else on the chart — the decision-docs section below explains what they all were.)
+
+A word on what a "commit" means here, because it's load-bearing for that chart. A commit is not just "a piece of code shipped to GitHub." Before switching to a PR-based approach (more on that below), every commit to `main` was a finished set of work on a specific, well-defined scope. So, basically, you can say it _was_ a PR, just not formed as such. After the switch, every commit on `main` is a squash from a PR branch — so, throughout this codebase's evolution, the "conceptual" meaning of a commit on `main` hasn't changed.
+
+---
+
+# Part one: setting the table
+
+Everything in this half happened before the code could scale. It's the least glamorous four weeks of the project and the reason the other fourteen worked.
+
+## The split
+
+As I already said, the JSON that is an exported Bubble app is an 11.6 MB file, minified, so not even the most context-rich agent would be able to eat it at once. That's why the first step I took was to write a script that splits it into pieces.
+
+But "splitting" isn't as straightforward as it seems.
+
+**1 — You can't just grab subobjects, cut them by some ceiling size, and expect an agent to handle it.** For context, our _ultimate_ split turned out to be **3,487 files** — far more than what an agent can comfortably navigate. Slicing by size gets you 3,487 files named after nothing, and an agent that must read all of them to find one.
+
+**2 — Even if you DO manage to split it once** — remember, the app changes; so every week, once you re-export the Bubble app and try to have the agent "look at the diff", you'd get a chaotic mess that would be impossible to make sense of. A split that isn't stable across re-exports is a split you can only use once.
+
+**What we did right:** the agent researched the common data structures within the JSON programmatically, figuring out what a usual "workflow" is, how its constituent "actions" look, which keys store the "names" of all those entities, etc. As a result, it was able to split it into something that _almost_ looks like code (or, at least, enough so for an AI agent — not a human, mind you — to be able to figure it out).
+
+Here's the click handler on the chat composer's send button. The splitter gave it a directory of its own and wrote one file per step, so `actions/index.js` is the workflow's body, in order, as ES module imports:
+
+```js
+// bubble/playgram_split/pages/index/workflows/buttonclicked_btnaw0/actions/index.js
+import { _1488796042609x768734193128308700_aag } from './_1488796042609x768734193128308700_aag.js';
+import { setfocustoelement } from './setfocustoelement.js';
+import { setcustomstate } from './setcustomstate.js';
+import { resetgroup } from './resetgroup.js';
+import { schedule_trigger_stream_existing_chat_after_0_seconds } from './schedule_trigger_stream_existing_chat_after_0_seconds/index.js';
+import { displaylistdata } from './displaylistdata.js';
+import { setcustomstate_1 } from './setcustomstate_1.js';
+import { schedulecustom } from './schedulecustom.js';
+
+export const actions = {
+  0: _1488796042609x768734193128308700_aag,
+  1: setfocustoelement,
+  2: setcustomstate,
+  3: resetgroup,
+  4: schedule_trigger_stream_existing_chat_after_0_seconds,
+  5: displaylistdata,
+  6: setcustomstate_1,
+  7: schedulecustom,
+};
+```
+
+Read that as a function body and you're reading it correctly. The directory name carries the trigger, the numbered map is Bubble's own step order, every step is a file you can open — and step 4's filename is not a slug of an ID but the label a human typed into the Bubble editor, recovered from the export's `name` field: _"Schedule trigger_stream_existing_chat after 0 seconds"_.
+
+And there's one lovely bit of self-incrimination in there. Step 0 is the only step with an unreadable name, because it's the only step Bubble keys purely by plugin ID — `1488796042609x768734193128308700`. That ID belongs to Toolbox, the run-custom-JavaScript plugin from a few paragraphs up. Step zero of sending a chat message in our no-code app was a `Run javascript` action.
+
+Elements got the same treatment. A whole reusable component, 27 lines, untrimmed — its own properties, then the two imports that bind it to its children and to its handlers:
+
+```js
+// bubble/playgram_split/element_definitions/dropdown_admin_analytics/index.js
+import { elements } from './elements/index.js';
+import { workflows } from './workflows/index.js';
+
+export const Dropdown_admin_analytics = {
+  elements: elements,
+  workflows: workflows,
+  properties: {
+    height: 200,
+    width: 200,
+    group_type: 'option.date_period__os_',
+    background_style: 'none',
+    max_width_px: 80,
+    default_width: 200,
+    max_height_px: 36,
+    min_height_px: 36,
+    wf_folder_list: { bTqIt0: 'Project', bTqIu0: 'User Settings' },
+    element_version: 5,
+    container_layout: 'column',
+    custom_element_platform: 'web',
+  },
+  type: 'CustomDefinition',
+  id: 'bTrBV1',
+  name: 'Dropdown admin analytics',
+};
+```
+
+The directory tree does the rest of the work, because it reproduces the UI containment hierarchy verbatim. `workspace_settings/elements/popup_delete_member/elements/group_buttons/` is, quite literally, where the Cancel and Delete buttons live. `memory_knowledge/.../group_container_voice_recorder/elements/button_save_recording.js` is the save button on the voice recorder. An agent asked to find the delete-member confirmation does not search; it navigates.
+
+Two details in there that I'd steal for any future version of this. The first is that the export's own opaque-ID map gets rewritten as a lookup table, so any ID an agent stumbles on resolves to a path:
+
+```js
+export const id_to_path_aal_to_btduh1 = {
+  bTaDh: '%p3.bTUzR0.%wf.bTYJM.actions.0',
+  bTaEG: '%ed.bTMNU.%wf.bTaEL',
+  bTavl: '%ed.bTaul.%el.bTavh.%el.bTavx.%el.bTavy',
+  // ...
+```
+
+The second is what happens when a Bubble element tree nests deeper than a filesystem enjoys. Anything past a 300-character path gets diverted into a `contd/` directory under a name built from the initials of each path segment, with the real location restored as the file's first line:
+
+```js
+// Original path: element_definitions/memory_knowledge/elements/group_main_column_container/elements/group_main_container/elements/group_add_new_memory/elements/group_input_add_memory_content/elements/group_container_input_voice/elements/group_container_voice_recorder/elements/group_dictate_use_button/elements/group_micro_use_button
+export const group_micro_use_button = {
+```
+
+491 of the 3,487 files live in `contd/`. That's a hack, and it's the right hack.
+
+### How it actually works, since that's the transferable part
+
+The script is 1,036 lines of dependency-free Python. Two things in it are the reason the output reads like code rather than like sliced JSON.
+
+**It duck-types on shape, because there's nothing else to go on.** Bubble's export carries no type tags at the collection level, so the splitter sniffs every dict against a handful of predicates and routes it to a specialised writer. Each predicate is a majority vote, which is precisely what makes it survive a format nobody documented:
+
+```python
+def is_workflows_dict(d):
+    """True if the dict looks like a Bubble workflows collection."""
+    if not isinstance(d, dict):
+        return False
+    vals = [v for v in d.values() if v is not None]
+    if not vals:
+        return False
+    hits = sum(
+        1 for v in vals
+        if isinstance(v, dict) and 'type' in v and 'actions' in v
+    )
+    return hits / len(vals) >= 0.7
+```
+
+Seventy percent. Not all. Ask a schema-first parser to handle a real Bubble export and it dies on the first irregularity; a voting heuristic shrugs and carries on.
+
+**It recovers human names through a precedence chain,** which is the single highest-leverage function in the file:
+
+```python
+def workflow_item_name(key, v):
+    """Best human-readable name for a single workflow item."""
+    if not isinstance(v, dict):
+        return key
+    event_name = (v.get('properties') or {}).get('event_name') or ''
+    if event_name:
+        return event_name
+    name = v.get('name') or ''
+    if name:
+        return name
+    wf_name = (v.get('properties') or {}).get('wf_name') or ''
+    if wf_name:
+        return wf_name
+    wtype = v.get('type') or ''
+    return f'{wtype}_{key}' if wtype else key
+```
+
+That last line is why an unnamed handler lands as `buttonclicked_bthdj.js` and not `bthdj.js`. Even the fallback tries to say something.
+
+And on problem 2 — the weekly re-export — the answer turned out to be five separate deliberate choices, none of which is obvious until a diff has burned you:
+
+1. **Names come from content, never from position.** A workflow keeps its filename when a step is inserted above it; a new element doesn't renumber its siblings.
+2. **Everything is emitted in a deterministic order.** Numeric collections sort numerically, chunk contents sort case-insensitively. Nothing depends on dict-iteration luck.
+3. **Chunks are named by their range, not by an index** — `id_to_path_btlgb_to_btnwa0.js`. Insert an entry and you perturb two boundary names, instead of shifting an `_1 … _18` sequence and rewriting every file in it.
+4. **Long strings get hoisted out to `.txt` siblings** whose filenames derive from their JSON path. This one is entirely about prompts: an LLM prompt embedded in JSON is a single line of `\n` escapes, so every edit to it diffs as one enormous changed line. Pulled out to a text file, it diffs like prose. 256 of them.
+5. **One key per line,** so a changed property is a one-line diff.
+
+The commit history of that script is the lesson in miniature. Seven refinements landed on the first day, and every one after the initial version is either a new structure-recogniser or a diff-legibility fix. At the first commit the split was 1,183 files and 15.3 MB. After the refinements: 3,137 files and 13.6 MB. **The total size barely moved; the file count tripled.** Same information, cut into three times as many navigable pieces.
+
+Best of all, now every button, input group, workflow, etc., was tied to a specific file in the "split" — if the Bubble app ever changed, it would more likely than not be represented in diffs in relevant files.
+
+There was a lot of trial and error along the way, but overall I would say it was one of the most successful parts of the project, and something that definitely is a know-how to keep for further projects.
+
+**Verdict: 10/10 would use again.**
+
+Now that an agent had the app's intricacies more or less figured out, it was time to start... coding? No, doc'ing!
+
+## The decision docs
+
+The first four days of the assignment produced about 23,000 lines of documentation and zero lines of application code. The Next.js app didn't exist until day 5; the first feature code — those auth screens — landed on day 7. And the decision work kept running for the rest of the fortnight alongside the first real code.
+
+What were we deciding? Things like:
+
+1. Which hosting to use
+2. Which DB platform
+3. Whether row-level security was a safety net or a maintenance tax
+4. Which UI component library
+
+Code-wise, the project was greenfield — although the app itself wasn't — so every road was open. (One road was never actually open, and I should be honest about it: **the framework was never really in question.** "Next.js rebuild" is in the very first commit message of the repo. There's no decision doc weighing Remix or SvelteKit, because there was no such deliberation. Hosting and database, on the other hand, were wide open, and we spent real effort there.)
````

**@vzakharov** — 2026-08-27T12:58:06Z

Again, you're phrasing it in an operator-facing way. What we want to write is smth like "(The only one that wasn't was basing it all on Next.js -- [an explanation being along the lines of wanting to have the most maintainable codebase, whoever comes on the project later, human or agent]"

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:291

````diff
@@ -0,0 +1,722 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                               |                                                                                          |
+| ----------------------------- | ---------------------------------------------------------------------------------------- |
+| **Assignment**                | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase             |
+| **Span**                      | 6 March – 10 August 2026 · 158 days                                                      |
+| **The "code" I started from** | an 11.6 MB minified JSON — the Bubble app export                                         |
+| **Shipped**                   | 1,395 units of work on `main` · 1,029 merged pull requests · 250,000 lines of TypeScript |
+| **Cold load**                 | multi-second → sub-second                                                                |
+| **Released**                  | 48 versioned releases plus 18 hotfixes — a production deploy every 2.4 days              |
+| **Cutovers**                  | 3 workspaces, zero rollbacks                                                             |
+| **Team**                      | four people, and ten to twenty-five Claude Code agents at a time                         |
+
+_Disclaimer: the disclosures in this case study were approved by Playgram management, i.e. no NDA breach._
+
+---
+
+After I started writing this case study, I realized that even the [brief](https://github.com/vzakharov/vovazakharov.com/issues/4) I'd give Claude to hydrate turned out to be 5,300 words long — and even then, after I'd finished it I understood that I'd only scratched the surface of everything I wanted to tell. So, (a) sorry it's so long, (b) check out the [mini version](./playgram-bubble-to-nextjs-part-1.mini.md) and the [micro version](./playgram-bubble-to-nextjs-part-1.micro.md), and (c) I'll post more detailed insights on some or all of the aspects later.
+
+## Intro
+
+In case you didn't know, Bubble is a no-code app builder.
+
+When you think of such tools, you'd think that people would just use it to make simple things — a directory site, an internal CRUD tool, a booking form, the kind of marketplace MVP you build to find out whether anyone wants it.
+
+But you'd be surprised how far people can actually take it — from a [subletting marketplace](https://bubble.io/blog/ohana/) whose hosts have earned $16.2 million and which [Stripe projects](https://stripe.com/customers/ohana) will process $60 million this year, to a [hospitality operations platform](https://bubble.io/blog/suiteop/) running a hundred-plus organizations and up to 30,000 daily guest users, to a [one-person company](https://bubble.io/blog/formula-bot/) that reached a million users, built by a non-programmer over a paternity leave.
+
+None of those are toys. A lot of software you've used was probably drawn rather than typed.
+
+In our case, we're talking about Playgram, an app that managed to put together a chat interface giving access to multiple providers and models, realtime team/project chat UIs, libraries of generated images & files, memory & knowledge management, voice input, and tons of other small "nifties" — all brought to life with no code at all:
+
+https://github.com/user-attachments/assets/16e67cd5-5727-419b-be2b-ffaa2541a44c
+
+(This is a screen recording already after migration to code, but you get the idea.)
+
+So why would then they want to switch to code if it was all so great?
+
+## Why
+
+**1 — Performance.** However hard you try, when you put abstraction over abstraction over abstraction to make an app work in a "draw a couple of interconnected boxes, and it just works" fashion, you're bound to hurt the performance. The platform — quoting its [own performance guide](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling) — sends "the code for all the elements (visible and invisible)" before it draws anything, degrades multiplicatively with every nested repeating group, and ships the code of every plugin you install on every page load, whether you use it or not.
+
+But the part you can't claw back is the floor. A Bubble page ships three render-blocking platform bundles before your app exists; a group of developers [measured](https://forum.bubble.io/t/seeking-advice-on-slow-page-loads-in-bubble-applications/327360) an almost-empty page — one text heading, nothing else — and found a Lighthouse Speed Index of 1.5–1.7 seconds.
+
+To spoil the ending: moving Playgram to Next changed cold load times from multi-second to sub-second; something which is _instantly_ tangible for a user, even if "wait a couple secs at first load" doesn't sound like such a big thing.
+
+**2 — Bumping into the bubble's edges.** All too many Bubble developers have faced the same thing again and again as their apps grow: they meet the system's limits and end up installing (and sometimes purchasing) third-party plugins, running vanilla JS in the browser, or even writing their own reactivity frameworks to make up for what Bubble can not provide. Quite illustratively, the number one Bubble plugin, with over 538,000 lifetime downloads, is [one that allows](https://bubble.io/blog/top-community-plugins-templates-2023/) running custom JavaScript. The most popular thing anyone ever built for the platform is a way out of it — and two of the five top templates that year were entire homegrown application frameworks built on top of Bubble, for the same reason one layer up.
+
+In the case of Playgram, by the way, the makers are Zeroqode, with a ballpark of 800 plugins shipped, two of which were among the five most-installed community plugins for Bubble in 2023. And they still felt like they were lacking. When the people who supply everyone else's escape hatches start wanting out, that tells you something.
+
+**3 — Missing out on all the AI agents stuff.** Although Bubble has been making inroads into using AI for its builders, needless to say its capabilities are far behind what modern tools like Claude Code, Cursor, or Codex provide. The team was feeling like they were missing out on being able to deliver more features in smaller time frames.
+
+That third one is the interesting one, and it's most of what this case study is about. It's also the one that turned out to be measurable. Two examples from the far end of the project, both of them things the product had wanted for a long time:
+
+- **Billing that actually bills.** In Bubble, credits were a line of marketing copy on a pricing card; the app's own release notes mention them twice and both times cosmetically. Fifteen days after the first commit on it, credits were a metered quantity — every model call, embedding, transcription and provider-run tool priced into a usage ledger across fifteen distinct cost stages, decremented live, enforced server-side at send time, carried over at renewal and capped per member.
+- **Access control.** Member groups with a per-group allow or deny list over the model catalogue, and a per-member override on top of that. Server-authoritative enforcement was live six days after the first commit on it; the admin UI and the model-picker gating, thirteen days.
+
+Good luck shipping either of those on that clock by drawing boxes.
+
+And there's a second-order version of the point that I didn't fully appreciate until the end. The people who'd be living in this codebase weren't some future team of hired engineers — they were the same people who had drawn the app in the first place. Making _them_ faster was the actual assignment. Whether that worked is a question this piece can answer, and I'll come back to it at the end.
+
+## What
+
+So that's what Levon and his team came up to me with. They wanted a fully functional code-based rewrite of an already working app shipped in 1.5–2 months (a timeline I agreed to but didn't ultimately meet).
+
+To give some perspective on why this was a pretty challenging endeavor:
+
+**1 — A Bubble app export** — the "code" in "no code", and the thing you're going to feed to an agent while rebuilding — **is a multi-megabyte JSON.** In the case of Playgram, it weighed 11.6 megabytes, minified, on one line. Suffice to say, VS Code crashes when you try to open a JSON that big. Good luck feeding that to an agent. The instruction that ended up in the repo's own guide for agents is blunter than anything I'd have written for a human: **"Do not read directly** — all the info you might need is in the split files."
+
+**2 — This was a live app in the beginning of its lifecycle.** The team was meant to keep shipping new features, improving prompts, and catching bugs while a code rewrite was being built in parallel. The target kept moving, on purpose, and correctly so — you don't freeze a product for four months to please your contractor.
+
+**3 — The team invested quite a lot into design,** so they were adamant the rewrite had to be not just functionally equivalent, but a _pixel-perfect_ match visually, too.
+
+**4 — Like most Bubble apps, the app kept its data in Bubble's proprietary DB format,** with no way of easy data migration to a new platform, whatever that would ultimately be. That one is a story of its own, and it's Part II's.
+
+Below you'll find how we tackled each of these challenges; how we discovered new ones I would've never envisioned, and what mistakes we made along the way (so you don't have to).
+
+## The rebuild, in numbers
+
+Before the grit, the shape of the thing.
+
+![Two charts sharing a timeline from 6 March to 21 August 2026. Cumulative units of work on main rises from about six a day to about nine across a four-week seam in late April and May; weekly units of work go from the forties to the eighties across the same seam, then fall by two thirds after the 4.4.3 handover](./assets/playgram-commit-cumsum.svg)
+
+| Date       | Day | What happened                                                                  |
+| ---------- | --- | ------------------------------------------------------------------------------ |
+| **6 Mar**  | 1   | First commit. Not code — a splitting script and a pile of research.            |
+| **10 Mar** | 5   | The Next.js app gets bootstrapped. `layout.tsx`, `page.tsx`, and nothing else. |
+| **12 Mar** | 7   | First feature code: auth screens, styled to match the Bubble original.         |
+| **19 Mar** | 14  | A message goes to an LLM and a response comes back. The product loop works.    |
+| **24 Apr** | 50  | The first pull requests. Until now everything went straight to `main`.         |
+| **6 May**  | 62  | **The original deadline.** Nothing in production.                              |
+| **21 May** | 77  | `4.0.0` — first production build.                                              |
+| **26 May** | 82  | The last local sessions. From here it's cloud agents and PR squashes.          |
+| **24 Jun** | 111 | `4.1.0` — first workspace actually running on the rewrite.                     |
+| **3 Jul**  | 120 | `4.2.0` — the big cutover.                                                     |
+| **11 Jul** | 128 | `4.3.0` — all workspaces on the rewrite. Bubble is off.                        |
+| **31 Jul** | 148 | `4.4.0` — workspace credits and model access control.                          |
+| **10 Aug** | 158 | `4.4.3` — the last release that's mostly mine. Handover.                       |
+
+A note on that chart. When I sketched this article I claimed you could _precisely_ see the spot where my working method changed. It isn't a spot; it's a seam about four weeks wide, running from the last week of April to the last week of May. Three signals agree on where it sits:
+
+- **The local CLI's signature stops.** Claude Code stamps a model-named `Co-Authored-By` trailer — `Claude Opus 4.6`, `Claude Sonnet 4.6`, `Claude Opus 4.7 (1M context)` — on commits made from my laptop. It's on 393 commits through March and April, twice more in May, and never again.
+- **The cloud's signature starts.** The bare `Co-Authored-By: Claude` form, which is what the web sessions write, appears for the first time in May and is on 806 commits from there to the end.
+- **Pull requests start existing.** Before 24 April there are none — the work went straight to `main`. From that week on everything arrives as a branch, and by late May the `(pr #…)` squash marker is running at about eighty a week.
+
+The number that actually proves the point is a boring one: **the median unit of work stays about the same size — 367 changed lines before the seam, 330 after — while units per day go from 6.1 to 8.9.** Same-sized pieces, forty-odd percent more of them at a time. That's the fingerprint of parallel streams rather than bigger batches, which is exactly what "I went from three agents to twenty" should look like in a graph.
+
+The bottom panel has a shape worth walking through, because it's the project's whole arc in one row of bars. Output steps up in the first week of May, when I moved to the web sessions. It then runs at its ceiling — four straight weeks in the eighties — right up to `4.1.0` on 24 June, and that stretch is a visible race: bug fixes are 39% of everything landing in it. The week after `4.1.0` it halves, and never returns to the ceiling. That isn't a slump. It's the point where rebuilding Bubble-as-it-was stopped being the job: refactors go from 11% to 17% of the work, release management becomes a line item, and what's left is new features, bug fixes and chores at a pace a normal team would recognise.
+
+(Both panels count code only. Documentation commits are excluded, because the opening fortnight produced enough of them to bury everything else on the chart — the decision-docs section below explains what they all were.)
+
+A word on what a "commit" means here, because it's load-bearing for that chart. A commit is not just "a piece of code shipped to GitHub." Before switching to a PR-based approach (more on that below), every commit to `main` was a finished set of work on a specific, well-defined scope. So, basically, you can say it _was_ a PR, just not formed as such. After the switch, every commit on `main` is a squash from a PR branch — so, throughout this codebase's evolution, the "conceptual" meaning of a commit on `main` hasn't changed.
+
+---
+
+# Part one: setting the table
+
+Everything in this half happened before the code could scale. It's the least glamorous four weeks of the project and the reason the other fourteen worked.
+
+## The split
+
+As I already said, the JSON that is an exported Bubble app is an 11.6 MB file, minified, so not even the most context-rich agent would be able to eat it at once. That's why the first step I took was to write a script that splits it into pieces.
+
+But "splitting" isn't as straightforward as it seems.
+
+**1 — You can't just grab subobjects, cut them by some ceiling size, and expect an agent to handle it.** For context, our _ultimate_ split turned out to be **3,487 files** — far more than what an agent can comfortably navigate. Slicing by size gets you 3,487 files named after nothing, and an agent that must read all of them to find one.
+
+**2 — Even if you DO manage to split it once** — remember, the app changes; so every week, once you re-export the Bubble app and try to have the agent "look at the diff", you'd get a chaotic mess that would be impossible to make sense of. A split that isn't stable across re-exports is a split you can only use once.
+
+**What we did right:** the agent researched the common data structures within the JSON programmatically, figuring out what a usual "workflow" is, how its constituent "actions" look, which keys store the "names" of all those entities, etc. As a result, it was able to split it into something that _almost_ looks like code (or, at least, enough so for an AI agent — not a human, mind you — to be able to figure it out).
+
+Here's the click handler on the chat composer's send button. The splitter gave it a directory of its own and wrote one file per step, so `actions/index.js` is the workflow's body, in order, as ES module imports:
+
+```js
+// bubble/playgram_split/pages/index/workflows/buttonclicked_btnaw0/actions/index.js
+import { _1488796042609x768734193128308700_aag } from './_1488796042609x768734193128308700_aag.js';
+import { setfocustoelement } from './setfocustoelement.js';
+import { setcustomstate } from './setcustomstate.js';
+import { resetgroup } from './resetgroup.js';
+import { schedule_trigger_stream_existing_chat_after_0_seconds } from './schedule_trigger_stream_existing_chat_after_0_seconds/index.js';
+import { displaylistdata } from './displaylistdata.js';
+import { setcustomstate_1 } from './setcustomstate_1.js';
+import { schedulecustom } from './schedulecustom.js';
+
+export const actions = {
+  0: _1488796042609x768734193128308700_aag,
+  1: setfocustoelement,
+  2: setcustomstate,
+  3: resetgroup,
+  4: schedule_trigger_stream_existing_chat_after_0_seconds,
+  5: displaylistdata,
+  6: setcustomstate_1,
+  7: schedulecustom,
+};
+```
+
+Read that as a function body and you're reading it correctly. The directory name carries the trigger, the numbered map is Bubble's own step order, every step is a file you can open — and step 4's filename is not a slug of an ID but the label a human typed into the Bubble editor, recovered from the export's `name` field: _"Schedule trigger_stream_existing_chat after 0 seconds"_.
+
+And there's one lovely bit of self-incrimination in there. Step 0 is the only step with an unreadable name, because it's the only step Bubble keys purely by plugin ID — `1488796042609x768734193128308700`. That ID belongs to Toolbox, the run-custom-JavaScript plugin from a few paragraphs up. Step zero of sending a chat message in our no-code app was a `Run javascript` action.
+
+Elements got the same treatment. A whole reusable component, 27 lines, untrimmed — its own properties, then the two imports that bind it to its children and to its handlers:
+
+```js
+// bubble/playgram_split/element_definitions/dropdown_admin_analytics/index.js
+import { elements } from './elements/index.js';
+import { workflows } from './workflows/index.js';
+
+export const Dropdown_admin_analytics = {
+  elements: elements,
+  workflows: workflows,
+  properties: {
+    height: 200,
+    width: 200,
+    group_type: 'option.date_period__os_',
+    background_style: 'none',
+    max_width_px: 80,
+    default_width: 200,
+    max_height_px: 36,
+    min_height_px: 36,
+    wf_folder_list: { bTqIt0: 'Project', bTqIu0: 'User Settings' },
+    element_version: 5,
+    container_layout: 'column',
+    custom_element_platform: 'web',
+  },
+  type: 'CustomDefinition',
+  id: 'bTrBV1',
+  name: 'Dropdown admin analytics',
+};
+```
+
+The directory tree does the rest of the work, because it reproduces the UI containment hierarchy verbatim. `workspace_settings/elements/popup_delete_member/elements/group_buttons/` is, quite literally, where the Cancel and Delete buttons live. `memory_knowledge/.../group_container_voice_recorder/elements/button_save_recording.js` is the save button on the voice recorder. An agent asked to find the delete-member confirmation does not search; it navigates.
+
+Two details in there that I'd steal for any future version of this. The first is that the export's own opaque-ID map gets rewritten as a lookup table, so any ID an agent stumbles on resolves to a path:
+
+```js
+export const id_to_path_aal_to_btduh1 = {
+  bTaDh: '%p3.bTUzR0.%wf.bTYJM.actions.0',
+  bTaEG: '%ed.bTMNU.%wf.bTaEL',
+  bTavl: '%ed.bTaul.%el.bTavh.%el.bTavx.%el.bTavy',
+  // ...
+```
+
+The second is what happens when a Bubble element tree nests deeper than a filesystem enjoys. Anything past a 300-character path gets diverted into a `contd/` directory under a name built from the initials of each path segment, with the real location restored as the file's first line:
+
+```js
+// Original path: element_definitions/memory_knowledge/elements/group_main_column_container/elements/group_main_container/elements/group_add_new_memory/elements/group_input_add_memory_content/elements/group_container_input_voice/elements/group_container_voice_recorder/elements/group_dictate_use_button/elements/group_micro_use_button
+export const group_micro_use_button = {
+```
+
+491 of the 3,487 files live in `contd/`. That's a hack, and it's the right hack.
+
+### How it actually works, since that's the transferable part
+
+The script is 1,036 lines of dependency-free Python. Two things in it are the reason the output reads like code rather than like sliced JSON.
+
+**It duck-types on shape, because there's nothing else to go on.** Bubble's export carries no type tags at the collection level, so the splitter sniffs every dict against a handful of predicates and routes it to a specialised writer. Each predicate is a majority vote, which is precisely what makes it survive a format nobody documented:
+
+```python
+def is_workflows_dict(d):
+    """True if the dict looks like a Bubble workflows collection."""
+    if not isinstance(d, dict):
+        return False
+    vals = [v for v in d.values() if v is not None]
+    if not vals:
+        return False
+    hits = sum(
+        1 for v in vals
+        if isinstance(v, dict) and 'type' in v and 'actions' in v
+    )
+    return hits / len(vals) >= 0.7
+```
+
+Seventy percent. Not all. Ask a schema-first parser to handle a real Bubble export and it dies on the first irregularity; a voting heuristic shrugs and carries on.
+
+**It recovers human names through a precedence chain,** which is the single highest-leverage function in the file:
+
+```python
+def workflow_item_name(key, v):
+    """Best human-readable name for a single workflow item."""
+    if not isinstance(v, dict):
+        return key
+    event_name = (v.get('properties') or {}).get('event_name') or ''
+    if event_name:
+        return event_name
+    name = v.get('name') or ''
+    if name:
+        return name
+    wf_name = (v.get('properties') or {}).get('wf_name') or ''
+    if wf_name:
+        return wf_name
+    wtype = v.get('type') or ''
+    return f'{wtype}_{key}' if wtype else key
+```
+
+That last line is why an unnamed handler lands as `buttonclicked_bthdj.js` and not `bthdj.js`. Even the fallback tries to say something.
+
+And on problem 2 — the weekly re-export — the answer turned out to be five separate deliberate choices, none of which is obvious until a diff has burned you:
+
+1. **Names come from content, never from position.** A workflow keeps its filename when a step is inserted above it; a new element doesn't renumber its siblings.
+2. **Everything is emitted in a deterministic order.** Numeric collections sort numerically, chunk contents sort case-insensitively. Nothing depends on dict-iteration luck.
+3. **Chunks are named by their range, not by an index** — `id_to_path_btlgb_to_btnwa0.js`. Insert an entry and you perturb two boundary names, instead of shifting an `_1 … _18` sequence and rewriting every file in it.
+4. **Long strings get hoisted out to `.txt` siblings** whose filenames derive from their JSON path. This one is entirely about prompts: an LLM prompt embedded in JSON is a single line of `\n` escapes, so every edit to it diffs as one enormous changed line. Pulled out to a text file, it diffs like prose. 256 of them.
+5. **One key per line,** so a changed property is a one-line diff.
+
+The commit history of that script is the lesson in miniature. Seven refinements landed on the first day, and every one after the initial version is either a new structure-recogniser or a diff-legibility fix. At the first commit the split was 1,183 files and 15.3 MB. After the refinements: 3,137 files and 13.6 MB. **The total size barely moved; the file count tripled.** Same information, cut into three times as many navigable pieces.
+
+Best of all, now every button, input group, workflow, etc., was tied to a specific file in the "split" — if the Bubble app ever changed, it would more likely than not be represented in diffs in relevant files.
+
+There was a lot of trial and error along the way, but overall I would say it was one of the most successful parts of the project, and something that definitely is a know-how to keep for further projects.
+
+**Verdict: 10/10 would use again.**
+
+Now that an agent had the app's intricacies more or less figured out, it was time to start... coding? No, doc'ing!
+
+## The decision docs
+
+The first four days of the assignment produced about 23,000 lines of documentation and zero lines of application code. The Next.js app didn't exist until day 5; the first feature code — those auth screens — landed on day 7. And the decision work kept running for the rest of the fortnight alongside the first real code.
+
+What were we deciding? Things like:
+
+1. Which hosting to use
+2. Which DB platform
+3. Whether row-level security was a safety net or a maintenance tax
+4. Which UI component library
+
+Code-wise, the project was greenfield — although the app itself wasn't — so every road was open. (One road was never actually open, and I should be honest about it: **the framework was never really in question.** "Next.js rebuild" is in the very first commit message of the repo. There's no decision doc weighing Remix or SvelteKit, because there was no such deliberation. Hosting and database, on the other hand, were wide open, and we spent real effort there.)
+
+Even stuff like which Node version to use, or which package manager, was subjected to scrutiny. The package-manager doc is my favourite of the small ones, because its reasoning is entirely about the thing that makes this project unusual: we picked pnpm because its strict symlinked `node_modules` blocks phantom dependencies, and phantom dependencies matter more in a codebase that is mostly written by agents — an agent will happily import a package that only happens to be present transitively, and be right, until the day it isn't.
+
+The decision process was insanely intricate: four different models from different providers each made its own research, then a fifth synthesized their inputs and provided it for us humans to decide on. And there's one detail in that process I'm still a bit proud of, which is what happens between the two steps:
````

**@vzakharov** — 2026-08-27T12:59:41Z

I'm not actually that much proud of it -- and I also see you having been adding "my" feelings and thoughts here and up to this point, which is, again, understandable, what with this doc coming from "me", but sometimes it looks off (I will remove that part in my edit, keeping here just as a context)

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:335

````diff
@@ -0,0 +1,722 @@
+# From Bubble to Next.js in 4 months: the Playgram case study
+
+**Part I of II.**
+
+|                               |                                                                                          |
+| ----------------------------- | ---------------------------------------------------------------------------------------- |
+| **Assignment**                | rebuild a live, feature-rich no-code app as a production Next.js 16 codebase             |
+| **Span**                      | 6 March – 10 August 2026 · 158 days                                                      |
+| **The "code" I started from** | an 11.6 MB minified JSON — the Bubble app export                                         |
+| **Shipped**                   | 1,395 units of work on `main` · 1,029 merged pull requests · 250,000 lines of TypeScript |
+| **Cold load**                 | multi-second → sub-second                                                                |
+| **Released**                  | 48 versioned releases plus 18 hotfixes — a production deploy every 2.4 days              |
+| **Cutovers**                  | 3 workspaces, zero rollbacks                                                             |
+| **Team**                      | four people, and ten to twenty-five Claude Code agents at a time                         |
+
+_Disclaimer: the disclosures in this case study were approved by Playgram management, i.e. no NDA breach._
+
+---
+
+After I started writing this case study, I realized that even the [brief](https://github.com/vzakharov/vovazakharov.com/issues/4) I'd give Claude to hydrate turned out to be 5,300 words long — and even then, after I'd finished it I understood that I'd only scratched the surface of everything I wanted to tell. So, (a) sorry it's so long, (b) check out the [mini version](./playgram-bubble-to-nextjs-part-1.mini.md) and the [micro version](./playgram-bubble-to-nextjs-part-1.micro.md), and (c) I'll post more detailed insights on some or all of the aspects later.
+
+## Intro
+
+In case you didn't know, Bubble is a no-code app builder.
+
+When you think of such tools, you'd think that people would just use it to make simple things — a directory site, an internal CRUD tool, a booking form, the kind of marketplace MVP you build to find out whether anyone wants it.
+
+But you'd be surprised how far people can actually take it — from a [subletting marketplace](https://bubble.io/blog/ohana/) whose hosts have earned $16.2 million and which [Stripe projects](https://stripe.com/customers/ohana) will process $60 million this year, to a [hospitality operations platform](https://bubble.io/blog/suiteop/) running a hundred-plus organizations and up to 30,000 daily guest users, to a [one-person company](https://bubble.io/blog/formula-bot/) that reached a million users, built by a non-programmer over a paternity leave.
+
+None of those are toys. A lot of software you've used was probably drawn rather than typed.
+
+In our case, we're talking about Playgram, an app that managed to put together a chat interface giving access to multiple providers and models, realtime team/project chat UIs, libraries of generated images & files, memory & knowledge management, voice input, and tons of other small "nifties" — all brought to life with no code at all:
+
+https://github.com/user-attachments/assets/16e67cd5-5727-419b-be2b-ffaa2541a44c
+
+(This is a screen recording already after migration to code, but you get the idea.)
+
+So why would then they want to switch to code if it was all so great?
+
+## Why
+
+**1 — Performance.** However hard you try, when you put abstraction over abstraction over abstraction to make an app work in a "draw a couple of interconnected boxes, and it just works" fashion, you're bound to hurt the performance. The platform — quoting its [own performance guide](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling) — sends "the code for all the elements (visible and invisible)" before it draws anything, degrades multiplicatively with every nested repeating group, and ships the code of every plugin you install on every page load, whether you use it or not.
+
+But the part you can't claw back is the floor. A Bubble page ships three render-blocking platform bundles before your app exists; a group of developers [measured](https://forum.bubble.io/t/seeking-advice-on-slow-page-loads-in-bubble-applications/327360) an almost-empty page — one text heading, nothing else — and found a Lighthouse Speed Index of 1.5–1.7 seconds.
+
+To spoil the ending: moving Playgram to Next changed cold load times from multi-second to sub-second; something which is _instantly_ tangible for a user, even if "wait a couple secs at first load" doesn't sound like such a big thing.
+
+**2 — Bumping into the bubble's edges.** All too many Bubble developers have faced the same thing again and again as their apps grow: they meet the system's limits and end up installing (and sometimes purchasing) third-party plugins, running vanilla JS in the browser, or even writing their own reactivity frameworks to make up for what Bubble can not provide. Quite illustratively, the number one Bubble plugin, with over 538,000 lifetime downloads, is [one that allows](https://bubble.io/blog/top-community-plugins-templates-2023/) running custom JavaScript. The most popular thing anyone ever built for the platform is a way out of it — and two of the five top templates that year were entire homegrown application frameworks built on top of Bubble, for the same reason one layer up.
+
+In the case of Playgram, by the way, the makers are Zeroqode, with a ballpark of 800 plugins shipped, two of which were among the five most-installed community plugins for Bubble in 2023. And they still felt like they were lacking. When the people who supply everyone else's escape hatches start wanting out, that tells you something.
+
+**3 — Missing out on all the AI agents stuff.** Although Bubble has been making inroads into using AI for its builders, needless to say its capabilities are far behind what modern tools like Claude Code, Cursor, or Codex provide. The team was feeling like they were missing out on being able to deliver more features in smaller time frames.
+
+That third one is the interesting one, and it's most of what this case study is about. It's also the one that turned out to be measurable. Two examples from the far end of the project, both of them things the product had wanted for a long time:
+
+- **Billing that actually bills.** In Bubble, credits were a line of marketing copy on a pricing card; the app's own release notes mention them twice and both times cosmetically. Fifteen days after the first commit on it, credits were a metered quantity — every model call, embedding, transcription and provider-run tool priced into a usage ledger across fifteen distinct cost stages, decremented live, enforced server-side at send time, carried over at renewal and capped per member.
+- **Access control.** Member groups with a per-group allow or deny list over the model catalogue, and a per-member override on top of that. Server-authoritative enforcement was live six days after the first commit on it; the admin UI and the model-picker gating, thirteen days.
+
+Good luck shipping either of those on that clock by drawing boxes.
+
+And there's a second-order version of the point that I didn't fully appreciate until the end. The people who'd be living in this codebase weren't some future team of hired engineers — they were the same people who had drawn the app in the first place. Making _them_ faster was the actual assignment. Whether that worked is a question this piece can answer, and I'll come back to it at the end.
+
+## What
+
+So that's what Levon and his team came up to me with. They wanted a fully functional code-based rewrite of an already working app shipped in 1.5–2 months (a timeline I agreed to but didn't ultimately meet).
+
+To give some perspective on why this was a pretty challenging endeavor:
+
+**1 — A Bubble app export** — the "code" in "no code", and the thing you're going to feed to an agent while rebuilding — **is a multi-megabyte JSON.** In the case of Playgram, it weighed 11.6 megabytes, minified, on one line. Suffice to say, VS Code crashes when you try to open a JSON that big. Good luck feeding that to an agent. The instruction that ended up in the repo's own guide for agents is blunter than anything I'd have written for a human: **"Do not read directly** — all the info you might need is in the split files."
+
+**2 — This was a live app in the beginning of its lifecycle.** The team was meant to keep shipping new features, improving prompts, and catching bugs while a code rewrite was being built in parallel. The target kept moving, on purpose, and correctly so — you don't freeze a product for four months to please your contractor.
+
+**3 — The team invested quite a lot into design,** so they were adamant the rewrite had to be not just functionally equivalent, but a _pixel-perfect_ match visually, too.
+
+**4 — Like most Bubble apps, the app kept its data in Bubble's proprietary DB format,** with no way of easy data migration to a new platform, whatever that would ultimately be. That one is a story of its own, and it's Part II's.
+
+Below you'll find how we tackled each of these challenges; how we discovered new ones I would've never envisioned, and what mistakes we made along the way (so you don't have to).
+
+## The rebuild, in numbers
+
+Before the grit, the shape of the thing.
+
+![Two charts sharing a timeline from 6 March to 21 August 2026. Cumulative units of work on main rises from about six a day to about nine across a four-week seam in late April and May; weekly units of work go from the forties to the eighties across the same seam, then fall by two thirds after the 4.4.3 handover](./assets/playgram-commit-cumsum.svg)
+
+| Date       | Day | What happened                                                                  |
+| ---------- | --- | ------------------------------------------------------------------------------ |
+| **6 Mar**  | 1   | First commit. Not code — a splitting script and a pile of research.            |
+| **10 Mar** | 5   | The Next.js app gets bootstrapped. `layout.tsx`, `page.tsx`, and nothing else. |
+| **12 Mar** | 7   | First feature code: auth screens, styled to match the Bubble original.         |
+| **19 Mar** | 14  | A message goes to an LLM and a response comes back. The product loop works.    |
+| **24 Apr** | 50  | The first pull requests. Until now everything went straight to `main`.         |
+| **6 May**  | 62  | **The original deadline.** Nothing in production.                              |
+| **21 May** | 77  | `4.0.0` — first production build.                                              |
+| **26 May** | 82  | The last local sessions. From here it's cloud agents and PR squashes.          |
+| **24 Jun** | 111 | `4.1.0` — first workspace actually running on the rewrite.                     |
+| **3 Jul**  | 120 | `4.2.0` — the big cutover.                                                     |
+| **11 Jul** | 128 | `4.3.0` — all workspaces on the rewrite. Bubble is off.                        |
+| **31 Jul** | 148 | `4.4.0` — workspace credits and model access control.                          |
+| **10 Aug** | 158 | `4.4.3` — the last release that's mostly mine. Handover.                       |
+
+A note on that chart. When I sketched this article I claimed you could _precisely_ see the spot where my working method changed. It isn't a spot; it's a seam about four weeks wide, running from the last week of April to the last week of May. Three signals agree on where it sits:
+
+- **The local CLI's signature stops.** Claude Code stamps a model-named `Co-Authored-By` trailer — `Claude Opus 4.6`, `Claude Sonnet 4.6`, `Claude Opus 4.7 (1M context)` — on commits made from my laptop. It's on 393 commits through March and April, twice more in May, and never again.
+- **The cloud's signature starts.** The bare `Co-Authored-By: Claude` form, which is what the web sessions write, appears for the first time in May and is on 806 commits from there to the end.
+- **Pull requests start existing.** Before 24 April there are none — the work went straight to `main`. From that week on everything arrives as a branch, and by late May the `(pr #…)` squash marker is running at about eighty a week.
+
+The number that actually proves the point is a boring one: **the median unit of work stays about the same size — 367 changed lines before the seam, 330 after — while units per day go from 6.1 to 8.9.** Same-sized pieces, forty-odd percent more of them at a time. That's the fingerprint of parallel streams rather than bigger batches, which is exactly what "I went from three agents to twenty" should look like in a graph.
+
+The bottom panel has a shape worth walking through, because it's the project's whole arc in one row of bars. Output steps up in the first week of May, when I moved to the web sessions. It then runs at its ceiling — four straight weeks in the eighties — right up to `4.1.0` on 24 June, and that stretch is a visible race: bug fixes are 39% of everything landing in it. The week after `4.1.0` it halves, and never returns to the ceiling. That isn't a slump. It's the point where rebuilding Bubble-as-it-was stopped being the job: refactors go from 11% to 17% of the work, release management becomes a line item, and what's left is new features, bug fixes and chores at a pace a normal team would recognise.
+
+(Both panels count code only. Documentation commits are excluded, because the opening fortnight produced enough of them to bury everything else on the chart — the decision-docs section below explains what they all were.)
+
+A word on what a "commit" means here, because it's load-bearing for that chart. A commit is not just "a piece of code shipped to GitHub." Before switching to a PR-based approach (more on that below), every commit to `main` was a finished set of work on a specific, well-defined scope. So, basically, you can say it _was_ a PR, just not formed as such. After the switch, every commit on `main` is a squash from a PR branch — so, throughout this codebase's evolution, the "conceptual" meaning of a commit on `main` hasn't changed.
+
+---
+
+# Part one: setting the table
+
+Everything in this half happened before the code could scale. It's the least glamorous four weeks of the project and the reason the other fourteen worked.
+
+## The split
+
+As I already said, the JSON that is an exported Bubble app is an 11.6 MB file, minified, so not even the most context-rich agent would be able to eat it at once. That's why the first step I took was to write a script that splits it into pieces.
+
+But "splitting" isn't as straightforward as it seems.
+
+**1 — You can't just grab subobjects, cut them by some ceiling size, and expect an agent to handle it.** For context, our _ultimate_ split turned out to be **3,487 files** — far more than what an agent can comfortably navigate. Slicing by size gets you 3,487 files named after nothing, and an agent that must read all of them to find one.
+
+**2 — Even if you DO manage to split it once** — remember, the app changes; so every week, once you re-export the Bubble app and try to have the agent "look at the diff", you'd get a chaotic mess that would be impossible to make sense of. A split that isn't stable across re-exports is a split you can only use once.
+
+**What we did right:** the agent researched the common data structures within the JSON programmatically, figuring out what a usual "workflow" is, how its constituent "actions" look, which keys store the "names" of all those entities, etc. As a result, it was able to split it into something that _almost_ looks like code (or, at least, enough so for an AI agent — not a human, mind you — to be able to figure it out).
+
+Here's the click handler on the chat composer's send button. The splitter gave it a directory of its own and wrote one file per step, so `actions/index.js` is the workflow's body, in order, as ES module imports:
+
+```js
+// bubble/playgram_split/pages/index/workflows/buttonclicked_btnaw0/actions/index.js
+import { _1488796042609x768734193128308700_aag } from './_1488796042609x768734193128308700_aag.js';
+import { setfocustoelement } from './setfocustoelement.js';
+import { setcustomstate } from './setcustomstate.js';
+import { resetgroup } from './resetgroup.js';
+import { schedule_trigger_stream_existing_chat_after_0_seconds } from './schedule_trigger_stream_existing_chat_after_0_seconds/index.js';
+import { displaylistdata } from './displaylistdata.js';
+import { setcustomstate_1 } from './setcustomstate_1.js';
+import { schedulecustom } from './schedulecustom.js';
+
+export const actions = {
+  0: _1488796042609x768734193128308700_aag,
+  1: setfocustoelement,
+  2: setcustomstate,
+  3: resetgroup,
+  4: schedule_trigger_stream_existing_chat_after_0_seconds,
+  5: displaylistdata,
+  6: setcustomstate_1,
+  7: schedulecustom,
+};
+```
+
+Read that as a function body and you're reading it correctly. The directory name carries the trigger, the numbered map is Bubble's own step order, every step is a file you can open — and step 4's filename is not a slug of an ID but the label a human typed into the Bubble editor, recovered from the export's `name` field: _"Schedule trigger_stream_existing_chat after 0 seconds"_.
+
+And there's one lovely bit of self-incrimination in there. Step 0 is the only step with an unreadable name, because it's the only step Bubble keys purely by plugin ID — `1488796042609x768734193128308700`. That ID belongs to Toolbox, the run-custom-JavaScript plugin from a few paragraphs up. Step zero of sending a chat message in our no-code app was a `Run javascript` action.
+
+Elements got the same treatment. A whole reusable component, 27 lines, untrimmed — its own properties, then the two imports that bind it to its children and to its handlers:
+
+```js
+// bubble/playgram_split/element_definitions/dropdown_admin_analytics/index.js
+import { elements } from './elements/index.js';
+import { workflows } from './workflows/index.js';
+
+export const Dropdown_admin_analytics = {
+  elements: elements,
+  workflows: workflows,
+  properties: {
+    height: 200,
+    width: 200,
+    group_type: 'option.date_period__os_',
+    background_style: 'none',
+    max_width_px: 80,
+    default_width: 200,
+    max_height_px: 36,
+    min_height_px: 36,
+    wf_folder_list: { bTqIt0: 'Project', bTqIu0: 'User Settings' },
+    element_version: 5,
+    container_layout: 'column',
+    custom_element_platform: 'web',
+  },
+  type: 'CustomDefinition',
+  id: 'bTrBV1',
+  name: 'Dropdown admin analytics',
+};
+```
+
+The directory tree does the rest of the work, because it reproduces the UI containment hierarchy verbatim. `workspace_settings/elements/popup_delete_member/elements/group_buttons/` is, quite literally, where the Cancel and Delete buttons live. `memory_knowledge/.../group_container_voice_recorder/elements/button_save_recording.js` is the save button on the voice recorder. An agent asked to find the delete-member confirmation does not search; it navigates.
+
+Two details in there that I'd steal for any future version of this. The first is that the export's own opaque-ID map gets rewritten as a lookup table, so any ID an agent stumbles on resolves to a path:
+
+```js
+export const id_to_path_aal_to_btduh1 = {
+  bTaDh: '%p3.bTUzR0.%wf.bTYJM.actions.0',
+  bTaEG: '%ed.bTMNU.%wf.bTaEL',
+  bTavl: '%ed.bTaul.%el.bTavh.%el.bTavx.%el.bTavy',
+  // ...
+```
+
+The second is what happens when a Bubble element tree nests deeper than a filesystem enjoys. Anything past a 300-character path gets diverted into a `contd/` directory under a name built from the initials of each path segment, with the real location restored as the file's first line:
+
+```js
+// Original path: element_definitions/memory_knowledge/elements/group_main_column_container/elements/group_main_container/elements/group_add_new_memory/elements/group_input_add_memory_content/elements/group_container_input_voice/elements/group_container_voice_recorder/elements/group_dictate_use_button/elements/group_micro_use_button
+export const group_micro_use_button = {
+```
+
+491 of the 3,487 files live in `contd/`. That's a hack, and it's the right hack.
+
+### How it actually works, since that's the transferable part
+
+The script is 1,036 lines of dependency-free Python. Two things in it are the reason the output reads like code rather than like sliced JSON.
+
+**It duck-types on shape, because there's nothing else to go on.** Bubble's export carries no type tags at the collection level, so the splitter sniffs every dict against a handful of predicates and routes it to a specialised writer. Each predicate is a majority vote, which is precisely what makes it survive a format nobody documented:
+
+```python
+def is_workflows_dict(d):
+    """True if the dict looks like a Bubble workflows collection."""
+    if not isinstance(d, dict):
+        return False
+    vals = [v for v in d.values() if v is not None]
+    if not vals:
+        return False
+    hits = sum(
+        1 for v in vals
+        if isinstance(v, dict) and 'type' in v and 'actions' in v
+    )
+    return hits / len(vals) >= 0.7
+```
+
+Seventy percent. Not all. Ask a schema-first parser to handle a real Bubble export and it dies on the first irregularity; a voting heuristic shrugs and carries on.
+
+**It recovers human names through a precedence chain,** which is the single highest-leverage function in the file:
+
+```python
+def workflow_item_name(key, v):
+    """Best human-readable name for a single workflow item."""
+    if not isinstance(v, dict):
+        return key
+    event_name = (v.get('properties') or {}).get('event_name') or ''
+    if event_name:
+        return event_name
+    name = v.get('name') or ''
+    if name:
+        return name
+    wf_name = (v.get('properties') or {}).get('wf_name') or ''
+    if wf_name:
+        return wf_name
+    wtype = v.get('type') or ''
+    return f'{wtype}_{key}' if wtype else key
+```
+
+That last line is why an unnamed handler lands as `buttonclicked_bthdj.js` and not `bthdj.js`. Even the fallback tries to say something.
+
+And on problem 2 — the weekly re-export — the answer turned out to be five separate deliberate choices, none of which is obvious until a diff has burned you:
+
+1. **Names come from content, never from position.** A workflow keeps its filename when a step is inserted above it; a new element doesn't renumber its siblings.
+2. **Everything is emitted in a deterministic order.** Numeric collections sort numerically, chunk contents sort case-insensitively. Nothing depends on dict-iteration luck.
+3. **Chunks are named by their range, not by an index** — `id_to_path_btlgb_to_btnwa0.js`. Insert an entry and you perturb two boundary names, instead of shifting an `_1 … _18` sequence and rewriting every file in it.
+4. **Long strings get hoisted out to `.txt` siblings** whose filenames derive from their JSON path. This one is entirely about prompts: an LLM prompt embedded in JSON is a single line of `\n` escapes, so every edit to it diffs as one enormous changed line. Pulled out to a text file, it diffs like prose. 256 of them.
+5. **One key per line,** so a changed property is a one-line diff.
+
+The commit history of that script is the lesson in miniature. Seven refinements landed on the first day, and every one after the initial version is either a new structure-recogniser or a diff-legibility fix. At the first commit the split was 1,183 files and 15.3 MB. After the refinements: 3,137 files and 13.6 MB. **The total size barely moved; the file count tripled.** Same information, cut into three times as many navigable pieces.
+
+Best of all, now every button, input group, workflow, etc., was tied to a specific file in the "split" — if the Bubble app ever changed, it would more likely than not be represented in diffs in relevant files.
+
+There was a lot of trial and error along the way, but overall I would say it was one of the most successful parts of the project, and something that definitely is a know-how to keep for further projects.
+
+**Verdict: 10/10 would use again.**
+
+Now that an agent had the app's intricacies more or less figured out, it was time to start... coding? No, doc'ing!
+
+## The decision docs
+
+The first four days of the assignment produced about 23,000 lines of documentation and zero lines of application code. The Next.js app didn't exist until day 5; the first feature code — those auth screens — landed on day 7. And the decision work kept running for the rest of the fortnight alongside the first real code.
+
+What were we deciding? Things like:
+
+1. Which hosting to use
+2. Which DB platform
+3. Whether row-level security was a safety net or a maintenance tax
+4. Which UI component library
+
+Code-wise, the project was greenfield — although the app itself wasn't — so every road was open. (One road was never actually open, and I should be honest about it: **the framework was never really in question.** "Next.js rebuild" is in the very first commit message of the repo. There's no decision doc weighing Remix or SvelteKit, because there was no such deliberation. Hosting and database, on the other hand, were wide open, and we spent real effort there.)
+
+Even stuff like which Node version to use, or which package manager, was subjected to scrutiny. The package-manager doc is my favourite of the small ones, because its reasoning is entirely about the thing that makes this project unusual: we picked pnpm because its strict symlinked `node_modules` blocks phantom dependencies, and phantom dependencies matter more in a codebase that is mostly written by agents — an agent will happily import a package that only happens to be present transitively, and be right, until the day it isn't.
+
+The decision process was insanely intricate: four different models from different providers each made its own research, then a fifth synthesized their inputs and provided it for us humans to decide on. And there's one detail in that process I'm still a bit proud of, which is what happens between the two steps:
+
+> **Bias removal.** After Step 1, analysis files are renamed from `_<model>` to `_1/_2/_3/_4` before Claude Code sees them. This prevents anchoring on a model's reputation when evaluating arguments.
+
+Each model wrote its analysis into its own file, unaware of the others (parallel worktrees — each agent genuinely can't see its siblings). Then, by hand, I stripped the model names off the filenames before the synthesizer ever read them. The synthesizing skill is instructed to recap what each analysis argued _without revealing which model wrote which_. It's a small thing that took ten seconds per decision, and it meant nobody — me included — got to decide that the argument was good because Opus made it.
+
+Here's what that produced for the database question:
+
+```markdown
+# Database Decision Documents: Comparison
+
+_Four independently generated analyses of the same question: what should the
+primary relational stack be for Playgram's Next.js rebuild?_
+
+## Recommendations at a Glance
+
+| Doc   | Recommended Stack                  | DB Host                    | ORM     | Auth          |
+| ----- | ---------------------------------- | -------------------------- | ------- | ------------- |
+| **1** | Drizzle + Neon + Better Auth       | Neon                       | Drizzle | Better Auth   |
+| **2** | Drizzle + Railway PG + Better Auth | Railway                    | Drizzle | Better Auth   |
+| **3** | Supabase + Drizzle                 | Supabase                   | Drizzle | Supabase Auth |
+| **4** | Drizzle + Postgres + Better Auth   | Flexible (Railway default) | Drizzle | Better Auth   |
+
+**Universal agreement:** Drizzle ORM. All four docs independently chose it over
+Prisma and the Supabase client.
+
+**Split decisions:** DB hosting (Neon vs Railway vs Supabase) and auth
+(Better Auth vs Supabase Auth).
+
+## Where They Disagree
+
+| Question                                 | Doc 1                        | Doc 2                                      | Doc 3                                             | Doc 4                                 |
+| ---------------------------------------- | ---------------------------- | ------------------------------------------ | ------------------------------------------------- | ------------------------------------- |
+| **Is RLS valuable here?**                | No — BFF makes it redundant  | No — second auth layer, maintenance burden | Yes — strong multi-tenant DB guardrail            | No — app-side authorization preferred |
+| **Is Supabase Auth worth the coupling?** | No                           | No                                         | Yes — mature, low-risk, handles OAuth/email flows | No                                    |
+| **Is Neon worth an extra vendor?**       | Yes — branching justifies it | Not yet — revisit later                    | No — Supabase covers DB hosting                   | Defer — pick host after stack         |
+```
+
+Look at the Doc 3 column. Doc 3 was the lone dissenter — one against three — on both "is RLS valuable" and "is Supabase Auth worth the coupling."
+
+Doc 3 won both. We ship Supabase Auth and we ship RLS as a fail-closed safety net. And the decision doc says out loud why the arithmetic lost:
+
+> **Supabase was chosen despite a lower weighted score.** Neon led the scoring on raw capability […] The matrix simply had no row for the factor that decided it, auth co-location.
+
+Frankly? I think the whole thing was to a considerable degree overthinking and — I hate to admit that — avoiding (future) responsibility. "But five agents told it would be fine!" sounds like a good argument until it isn't.
+
+> _on outsourcing a decision to a panel of models_
+>
+> **"But five agents told it would be fine!" sounds like a good argument until it isn't.**
+
+A note aside, I think here lies the most important thing to keep in mind when coding with agents: whoever writes the code or a document, it's _you_ who gets kicked if things go wrong, and rightfully so.
+
+> **Whoever writes the code or a document, it's _you_ who gets kicked if things go wrong, and rightfully so.**
+
+Two more things I'd correct in my own memory of this phase.
+
+The first is that the decision docs were never a two-week artifact. There are 26 of them today and only 12 were written in that first fortnight; the rest are dated June, July, August. The policy that settled in:
+
+> Decisions are generally made at the point where they're needed, not speculatively upfront. The testing framework decision, for example, was taken when the first production code shipped — not before.
+
+Which is right, and is also a gentle rebuke to the fortnight: the docs written at the point of need are the good ones.
+
+The second is that two of those early decisions are now on the record as wrong. `database.md` argued that per-PR database branching was low-value with a single developer; `database-branching.md` reverses it four months later, because with a dozen agents opening migration PRs in parallel, it turned out to be worth quite a lot. That's the honest score for a two-week upfront decision pass: durable on tooling, wrong on at least two operational calls.
+
+**Verdict: 6.5/10;** next time I'd probably spend much less time on obvious things. (Obvious counter-argument: next time I will have the setup that worked the first time, so I would likely not need so much decision-making at all.)
+
+### The decisions we actually made
+
+| Thing              | Choice                                          | Because                                                                                                                            |
````

**@vzakharov** — 2026-08-27T13:07:11Z

let's ditch the because column -- some explanations look cherry-picked, and at this point it's easier to just ditch them

---

## Timeline (status, references, and other events)

- **2026-08-21T00:56:02Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/2579928b0b3318e5e9aaf18b6ceaefa8cf1397e8.
- **2026-08-21T01:12:14Z** @vzakharov — _head_ref_force_pushed_
- **2026-08-24T22:08:35Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/9#pullrequestreview-5012831662.
- **2026-08-27T13:10:14Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/9#pullrequestreview-5040798670.
