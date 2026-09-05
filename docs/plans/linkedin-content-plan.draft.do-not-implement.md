> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# A LinkedIn content plan mined from the Playgram case study

## The goal, stated plainly

A standing backlog of **small, self-contained LinkedIn posts**, each built on one concrete piece of work, mostly from the Playgram case study and later from whatever else ships. Every post has to leave a practitioner with something they can use on Monday. Nothing is a teaser for the case study; a post that only works as an advertisement for a longer thing is not a post.

Two effects are wanted and **neither is ever named in the text**: that a reader who needs this kind of work done starts wondering who does it, and that the name becomes one people recognise on the subject of running coding agents at scale. Both come from the writing being useful and specific, not from a closing line asking for anything. There is no CTA, no "what's your experience?", no "DM me". The dots stay for the reader to connect.

## What this change delivers

1. **`writing/linkedin/plan.md`** — the content plan: the post inventory, the recurring post shapes, the sequencing, and the rules for how a post relates back to the case study.
2. **`writing/linkedin/drafts/type-overlap.md`** — one full draft post, written to be posted as-is, whose real job is to be argued with so the voice gets pinned down.
3. **A `writing/` row in CLAUDE.md's repository-layout table**, since this introduces a new top-level directory.

**Deliberately not in this change:** the anti-slop writing rules. Those are the *next* step and they have to be written against a draft that exists — writing them first would produce a list of guesses. The plan provisions their home (`.claude/rules/writing.md`, path-scoped to `writing/**`, so they load automatically whenever a draft is touched) and says nothing more about their content.

## Where the files live, and why not somewhere else

**`writing/linkedin/` at the repo root.**

- **Not `public/content/`.** That tree is *published* — everything in it is served raw at `/content/…` and is a site artifact. Unposted LinkedIn drafts crawlable on the site before they run on LinkedIn is the wrong order of operations. If a "notes" collection on the site ever becomes wanted, `shared/content/collections.ts` takes one entry and a post can be promoted into it then; that seam is noted, not built.
- **Not `docs/`.** Every subdirectory `docs/` is currently known to hold — `plans/`, `issue/`, `pr/`, `remove-before-merging/` — is a working artifact that `/finalize` sweeps before merge. Putting a durable asset in that tree is a trap set for a future agent pattern-matching on the neighbours.
- **`writing/` at the root** says what it is, costs one row in the layout table, and generalises when the next channel or the next long-form piece arrives.

Layout:

```
writing/
  linkedin/
    plan.md              # the backlog, the shapes, the sequencing
    drafts/
      <slug>.md          # one file per post
```

Each draft carries frontmatter: `source` (the case-study section it draws its facts from), `shape` (one of the five below), `status` (`draft` | `approved` | `posted`), and `posted` (a date, once it is). The `source` pointer exists so that when a fact in the case study is corrected, the posts that repeat it are findable — see DRY notes.

## The post inventory

Eighteen candidates, each anchored to something specific enough that it could not have been written by someone who wasn't there. Ordered roughly by how well each stands alone, not by publishing order — sequencing is separate, below.

| # | Working title | What it actually teaches | Shape |
|---|---|---|---|
| 1 | Splitting by shape, not by size | An 11.6 MB minified JSON export cut into 3,487 files an agent can *navigate* instead of grep. Names derived from content, never position, so inserting a step doesn't rename its neighbours; long strings hoisted into `.txt` siblings so a prompt diffs as prose instead of one enormous escaped line. The point is the weekly re-export staying legible. | Artifact |
| 2 | The lint rule that closes an auth hole | Next turns every export from a `'use server'` file into an endpoint the browser can call — no route file, no ceremony. `safe-action-required` forces every one through a wrapper that establishes who is asking before the body runs. An agent will cheerfully ignore a paragraph in CLAUDE.md and will never once ship a lint error. | Footgun |
| 3 | Two types, one lie, months of zero analytics | `tokenCounts: { input, output }` sitting beside DB columns named `inputTokens`/`outputTokens`. Both compiled. Every usage log recorded zero. Found by accident months later. Then the second return nobody expects: about a third of reported overlaps are a *key that's lying*, not a missing base. | Footgun |
| 4 | A warning is a rule nobody enforces | 362 rules, every one explicitly `error` or `off`, nothing inherited from a recommended set that a dependency bump can change under you. No rule is ever `warn`, because humans and LLMs alike treat a warning as negotiable and let it accumulate. | Reversal |
| 5 | One session, one thread | The 1M-token context window as the megapixel race — past a point more just means more noise on the matrix. The rule of thumb: past 200k you've strayed. Side thoughts get filed as issues, not appended to the conversation. | Reversal |
| 6 | The litmus test for a plan | If a plan is any good, a session with *none* of the conversation that produced it can implement it. If it can't, the plan was bad — that's a falsifiable test, and it's the reason plans belong in the repo rather than in a dialog box. | Reversal |
| 7 | Parallel agents meet sequential migration numbers | Migration `0099` generated on a branch that hadn't merged `0098`. Forked chain, dropped enum value, nothing failed at deploy for two whole migrations. Now a script walks the snapshots and refuses a broken chain. | Footgun |
| 8 | Rigid boundaries thicken the shared layer on their own | Between first production build and handover `src/` went 98,000 → 223,000 lines, and the layers that grew fastest *in relative terms* were the bottom ones: `shared` and `entities` nearly tripled while the app-specific top layer didn't quite double. Nobody planned that. | Measurement |
| 9 | Five agents told me it would be fine | Four models researching every decision independently, names stripped so the synthesis couldn't be biased, a fifth judging. The lone dissenter won both contested points. And the honest half: a good chunk of it was spreading the blame. Verdict 6.5/10. | Receipt |
| 10 | The plan listed a directory that never existed | The detailed migration plan's own "current state" inventory named an `entities/message` slice that was never in the repo, not once, in its entire history. After a while you're not reading the plan to find out what to do — you're reading it to find out how out of date it is. Verdict 6/10. | Receipt |
| 11 | What parallelism actually measures as | Across the one-day switch into the cloud: median unit of work 375 → 384 changed lines, units per day 6.2 → 8.2. Same-sized pieces, about a third more of them at a time. That's the number, and it is smaller than the marketing. | Measurement |
| 12 | The handover is the deliverable | Seventeen days after the last commit, 49 of 52 merged PRs were the team's — and the team is the Bubble developers who drew the app, two of whom opened their GitHub accounts during the project. What they shipped alone, listed plainly. | Measurement |
| 13 | The most popular Bubble plugin is a way out of Bubble | 538,000 installs for "run custom JavaScript"; two of the top five templates that year were homegrown application frameworks built on top of the platform. And step 0 of sending a chat message in this no-code app was a `Run javascript` action. | Reversal |
| 14 | The merge conflicts I was wrong about | The loudest fear about parallel agents, and after a thousand-plus merged PRs, zero problems — once one skill encoded the footguns. Agents resolve conflicts semantically, not just to a state where the file no longer has markers in it. | Receipt |
| 15 | Thirty-three files that describe how you work | Skills compose into a call graph because each is a file another can point at — `/implement` loads two by reference and hands to a third, which loads three more. And the half that's less fun: it's a second codebase, it drifts exactly like the first, and nothing lints it. | Receipt |
| 16 | Measure files in syntax nodes, not lines | The biggest files in the codebase are LLM prompts — hundreds of lines, as they should be, and structurally a single string. So the size report counts AST nodes, and deliberately never fails the build. A metric that fails is a metric people game. | Artifact |
| 17 | Fail slow, when the reader is an agent | Every check runs to completion even after one has failed, and the summary names all of them. Fail fast and the agent fixes one thing, pushes, and waits four minutes to be told about the next. Received wisdom, inverted for a specific reason. | Reversal |
| 18 | Reviewing the outcome, not the process | From three local agents whose *thinking* I read, to twenty in the cloud reviewed as pull requests. For 95% of cases the agent knows better; the remaining 5% is the entire argument for a knowledgeable human still being in the loop. | Receipt |

**Held in reserve rather than cut:** Part II of the case study is unwritten, and data migration, CI/CD economics, the 139-file navigation refactor, the home-grown XLS reader and the four-hour hang on malformed HTML are all posts. They go into the plan's "not yet" list so the backlog outlives the current case study.

## The five shapes

Naming the shapes matters more than it looks: it is what stops eighteen posts from being eighteen variations of the same paragraph, and it gives the future writing rules something concrete to constrain.

- **Footgun** — a specific bug, why it was invisible, and the thing that catches it now. Ends on the mechanism, never on a moral.
- **Measurement** — a number nobody else has, and what it does and doesn't mean. Must include the deflating half; a measurement post that only flatters is an ad.
- **Reversal** — a received best practice that is wrong in a named context, with the reason it's usually right left standing.
- **Receipt** — an unflattering fact about my own work, scored. This is the shape that does the most work for credibility and it must never be false modesty about something that actually went well.
- **Artifact** — a small piece of real code, config or output, shown and then explained. The reader should be able to steal it.

Rough target mix over any ten posts: 3 footgun, 2 measurement, 2 reversal, 2 receipt, 1 artifact. Receipts are the scarce ingredient — over-use turns into a bit.

## Form

- **1,000–1,600 characters**, roughly 170–280 words. Long enough to carry one idea completely, short enough that the whole thing is read.
- **The first two lines carry it.** LinkedIn folds at roughly 200 characters, so the opening has to state the concrete thing, not promise it. No "I want to share some thoughts on…", no question-as-opener.
- **One idea per post.** If a second idea is good, it is a second post.
- **No emoji, no rocket ships, no single-sentence-per-line staccato**, which is the house style of the genre and reads as the genre rather than as a person.
- **Numbers stay unrounded.** 3,487 files, 11.6 MB, 8,123 imports. The precision is the evidence.
- **English only.** The site is bilingual; this isn't.

## How a post relates to the case study

- **Roughly one in three posts links back**, and never as the payoff — the post has to be complete without the link. A trailing "full write-up here" on a post that already said the thing is fine; a post that withholds its point to earn the click is not.
- **Facts live in the case study; posts restate them.** A post cannot assume the reader has read anything.

## Sequencing

Free-standing, unnumbered. No "Part 3 of 12" — a numbered series makes every post after the first look like homework, and it makes a missed week visible. The `plan.md` carries a suggested opening run rather than a schedule: **1 → 3 → 12 → 5 → 2**, which opens on the strangest artifact (the 11.6 MB JSON), follows with a bug that cost real money, then the handover — the one that most plainly answers "so did it work?" — before settling into the practitioner material.

## The calibration draft: #3, the type-overlap gate

Chosen over the splitter (#1) and the auth rule (#2) because it exercises the widest range of the voice in one post, which is what a calibration draft is for:

- a **concrete bug with a real cost** — two shapes that both compiled while meaning different things, and months of analytics quietly recording zero;
- a **non-obvious second finding** — a third of the reported overlaps turn out to be a key that's lying rather than a base that's missing: two `file`s, one a path and one a `File`; two `owner`s, one a repo and one a workspace;
- a **method worth stealing** — the ratchet. Turning it on at full strength would have failed the build in hundreds of places, so it went three shared fields, then two, then one, over 26 days and 248 cleared groups;
- and a **self-directed objection** — "overengineering, you think?" — answered rather than dodged.

It also gives the anti-slop pass something hard to work on: the honest version of this post is one em-dash away from reading like the thing we're trying to avoid.

The draft must land the opening on the bug itself — the two shapes and the zeroes — not on the tool, and must not end on a lesson-shaped sentence. It closes on the ratchet or the lying keys, whichever the draft reaches more naturally.

## Follow-up, provisioned but not built

`.claude/rules/writing.md`, path-scoped to `writing/**`, holding the negative rules — what not to write, phrase by phrase. It is written **after** the draft comes back marked up, because rules derived from a real correction are worth more than rules derived from anticipating one. The plan names the file and stops.

## DRY notes

- **The case study is the single source of truth for every fact**, and the posts genuinely have to restate those facts rather than reference them — a LinkedIn reader has nothing open. That is duplication by necessity, not by accident, so the mitigation is a pointer rather than an extraction: each draft's `source` frontmatter names the case-study section it draws from, which makes "which posts repeat this number?" a grep instead of a memory. No script, no check — a gate over eighteen prose files would cost more than the drift it prevents.
- **The five shapes are defined once, in `plan.md`.** Drafts reference a shape by name in frontmatter and never restate its definition, so the shapes can be revised in one place.
- **No shared prose scaffolding, deliberately.** The obvious extraction here is a post template — an opener slot, a body slot, a closer slot. It would be net-negative: a template is exactly the mechanism that produces the interchangeable voice this whole exercise exists to avoid, and the five shapes already give as much structure as is safe.
- **Nothing here touches `src/`**, so no FSD, type-overlap or styling surface is involved; `pnpm build` is unaffected. The CLAUDE.md layout row is the only change outside `writing/`.

## Risks worth naming

- **The plan is only as good as the draft.** If the calibration draft comes back as slop, the inventory is still fine — the shapes and the facts survive — but the writing rules become the load-bearing artifact and the backlog waits on them.
- **Eighteen posts is a lot of surface for the case study to carry.** Around post ten the material thins and the backlog needs the Part II work, or new work, to keep going. That is a feature of naming it now rather than discovering it in November.
