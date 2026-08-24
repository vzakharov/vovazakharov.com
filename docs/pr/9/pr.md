# PR #9: feat: hydrate issue #4 into the Playgram case study, Part I

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/9
- **Author:** @vzakharov
- **Base ← Head:** main ← claude/playgram-case-study-part-1-9mxhgs
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-08-21T00:55:19Z
- **Updated:** 2026-08-24T22:08:36Z
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

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `render-full` | manual-only | — | GitHub's Markdown pipeline decides whether Mermaid, an SVG `img` and a bare attachment URL render; only looking tells you |
| `chart-themes` | manual-only | — | The SVG's `prefers-color-scheme` block was verified in headless Chromium in both schemes, but legibility at article width is a judgment call |
| `handoff-img` | manual-only | — | Whether a 2306×1754 screenshot stays readable when scaled into a column is visual |
| `cross-links` | integration | ❌ | A link-checker over `content/**/*.md` would catch relative-path drift; none exists yet |
| `verdicts` | manual-only | — | The scores are yours; only you can confirm the justifications read as your reasoning |
| `callouts` | manual-only | — | Self-containment when skimmed is exactly the thing a test cannot assert |
| `facts` | manual-only | — | The 11 MB vs ~25 MB question is unresolvable from the repo — it needs your recollection |
| `disclosure` | unit | ❌ | Grep-shaped and worth automating if `content/` grows: deny-list of workspace names, `Playgramai/`, bare `#\d+`, 7–40 char hex |
| `part-two-boundary` | manual-only | — | Requires judgment about what counts as crossing the line |

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

## Review threads

### Review by @vzakharov — COMMENTED

_2026-08-24T22:08:35Z_

This is a first round of review, concerning just up to (not including) the "What" part of the case study, but it doesn't mean you should keep everything else untouched. Most of the comments touch the bigger picture too -- so pls treat it as more than just proofreading and editing a word or sentence here and there.

Also, where things require some additional exploration/research, in which you're mostly only interested in a summarizable end result of (as opposed to the research itself), it's better to launch a subagent than waste your own context.

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

---

### `content/case-studies/playgram-bubble-to-nextjs-part-1.md`:57

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

---

## Timeline (status, references, and other events)

- **2026-08-21T00:56:02Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/2579928b0b3318e5e9aaf18b6ceaefa8cf1397e8.
- **2026-08-21T01:12:14Z** @vzakharov — _head_ref_force_pushed_
- **2026-08-24T22:08:35Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/9#pullrequestreview-5012831662.
