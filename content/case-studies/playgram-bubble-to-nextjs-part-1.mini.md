# From Bubble to Next.js in 4 months: the Playgram case study (mini)

_The [full version](./playgram-bubble-to-nextjs-part-1.md) is about six times this long. There's also a [micro version](./playgram-bubble-to-nextjs-part-1.micro.md) if this is still too much. Part I of II._

_Disclaimer: the disclosures in this case study were approved by Playgram management, i.e. no NDA breach._

---

Playgram is a serious AI chat product — multiple providers and models, realtime team and project chats, image and file libraries, memory and knowledge management, voice input — and it was built entirely in Bubble, a no-code app builder. Between March and August 2026 I rebuilt it as a Next.js 16 codebase. 158 days, 1,395 units of work on `main`, 1,029 merged PRs, 250,000 lines of production TypeScript, 48 versioned releases, and cold load times from multi-second to sub-second.

I did almost none of the typing. At the peak I was running twenty-plus Claude Code agents at once, and that shift — from three local agents I babysat line by line to twenty in the cloud I reviewed like a manager — is the actual subject here.

## Why leave a working no-code app

Three reasons, in the order they mattered.

**Performance has a floor you can't optimise past.** Bubble's own docs explain that the platform ships the code for every element on a page, visible or not, before it draws anything — and that installed plugins load whether you use them or not. Developers measuring a page with a single text heading on it report a Lighthouse Speed Index of 1.5–1.7 seconds. That's the floor, and no amount of app-side tuning reaches under it.

**The platform has edges, and everyone hits them.** The most-downloaded plugin in the entire Bubble marketplace, at 538,000 installs, is one that lets you run raw JavaScript. The most popular thing anyone ever built for the platform is a way out of it. Playgram's makers are Zeroqode, with a ballpark of 800 plugins shipped, and they still felt the walls.

**And the AI tooling wasn't there.** They wanted the thing that having real code makes possible, and they wanted it for themselves — the people who'd live in this codebase were the same people who had drawn the app. Two examples of what that turned into once the code existed: billing went from a line of marketing copy on a pricing card to a metered quantity — every model call, embedding, transcription and provider-run tool priced into a usage ledger across fifteen cost stages, enforced server-side at send time — in fifteen days. Member groups with per-group and per-member model access took six days to server-authoritative enforcement and thirteen to the admin UI.

## What made it hard

The Bubble export — the "code" in "no code", and the thing you feed an agent — is a single minified JSON of 11.6 MB. VS Code won't open it. Meanwhile the app was live and shipping features the whole time, the rewrite had to be pixel-perfect against a design the team had invested heavily in, and the data lived in Bubble's proprietary format with no easy path out. That last one is Part II's story.

## Setting the table

**The split (10/10).** First thing I did was write a Python script that cuts the export into files an agent can navigate. Not by size — by _shape_. The script duck-types every object in the JSON against a set of predicates ("does 70% of this dict look like a workflow?"), then recovers human-readable names from the export's own `name` fields, so a click handler lands at `pages/index/workflows/buttonclicked_btnaw0/` with one file per step, in order, as ES module imports. It reads like a function body because it is one, transcribed.

The final split is 3,487 files. The part that took real thought was making the cut _stable_, so that re-exporting the app every week produced a legible diff instead of noise. Names derive from content, never position. Ordering is deterministic. Chunks are named by their key range rather than an index, so inserting one entry doesn't renumber eighteen files. Long strings — mostly LLM prompts — get hoisted into `.txt` siblings so they diff as prose rather than as one giant line of `\n` escapes. Once it was done, every button, input group and workflow was tied to a specific file, so a change in the Bubble app showed up as a diff in the relevant one.

**The decision docs (6.5/10).** The first four days produced 23,000 lines of documentation and zero lines of application code. The process: four models from different providers each researched a question independently, in parallel worktrees where none could see the others, then a fifth synthesised — with the model names stripped off the files first, so the judging couldn't be biased for or against any of them.

It worked, and it was too much. On the database question the lone dissenter — one model against three — won both contested points, and the decision doc says so out loud: _"Supabase was chosen despite a lower weighted score… The matrix simply had no row for the factor that decided it."_ Which is the lesson. "But five agents told it would be fine!" sounds like a good argument until it isn't.

> **Whoever writes the code or a document, it's _you_ who gets kicked if things go wrong, and rightfully so.**

**The strutwork (FSD 8.5/10, linting 10/10).** Agents place code by nearest-neighbour. Misfile one import and the next agent copies you, and the one after that. Over time, the likelihood of your codebase getting properly screwed up converges to 1.

So: Feature-Sliced Design, strictly enforced. Six layers, 8,123 internal imports, and **zero** that point upward or sideways — because two separate tools refuse to let us. A second-order effect worth pointing out: the bottom, reusable layers grew nearly three times over while the app-specific top layer didn't quite double. Rigid boundaries make the shared layer the path of least resistance.

Then 362 explicitly enabled lint rules, 28 of them hand-written, every one an `error` because "LLMs treat warnings as negotiable". The repo's own guardrails doc says why this is worth the effort better than I can:

> Custom rules catch issues at write time instead of code review time. They're especially effective at constraining AI agents, which will never violate a lint rule but will happily violate a comment-based convention.

That's the whole thing. An agent will cheerfully ignore a paragraph of your CLAUDE.md and will never once ship a lint error.

The most feared guardrail of the lot is a script rather than a lint rule: `type-overlap` fails the build if any two type aliases declare the same member. It cost us a 26-day ratchet — threshold 3, then 2, then back to 4 when we improved the detector, then 3, 2, and finally 1 — across thirteen landings and about 1,300 file changes. Worth it, because of what it was written for: we once had a `tokenCounts: { input, output }` shape sitting beside DB columns named `inputTokens`/`outputTokens`. Both type-checked perfectly. Every usage log we wrote recorded zero. We found it months later, by accident.

**Planning (6/10).** We started with one exhaustive migration plan, file paths and all. It became a liability — every path was a promise the codebase kept breaking for good reasons. Next time: big picture only, details as we go.

## Learning to run twenty agents

I resisted cloud agents. The laptop melting past five parallel sessions is what pushed me, and I expected the web UX to be as clumsy as the first Codex, the merge conflicts to be constant, and the whole thing to feel too hands-off — the agent working _somewhere_ that isn't _right here_.

> **But boy could I be wronger.**

Weeks in I was running 20+ at once, capped only by quota. Merge conflicts turned out to be the most overestimated risk of the lot: after more than a thousand merged PRs, agents resolving them properly — reasoning about what changed on each side, not just producing a file that compiles — has never once burned me. It took one skill to encode the footguns.

And the hands-off part inverted completely. **I turned from a boss who's constantly micromanaging his team into one who reviews the outcome, not the process.** My flow is now almost entirely code review on already-made changes, in GitHub's native interface. _(Cloud VMs: 10/10 — you can't go back to the CLI once you've mastered the zen of the cloud.)_

**Thirty-three skills (8/10).** Every repeatable process became a file in the repo: `/plan`, `/implement`, `/pr`, `/finalize`, `/dry`, `/tighten-docs`, `/sync-branch`, and twenty-six more. They compose by pointing at each other — `/implement` runs `/dry` and `/tighten-docs`, then hands off to `/pr`, which loads three more. About four of the thirty-three are stale. Thirty-three files describing how you work is a real asset and also a second codebase, and nothing lints it.

**Plan and implement (9/10).** `/plan` began as a workaround for a Claude Code bug — the plan-approval dialog doesn't survive a web session going idle, so you get the same prompt stacked four times and answers to the superseded copies vanish. So I wrote a skill that does what plan mode does but writes a tracked file in the repo instead of an ephemeral object. It became the core of a [spinoff boilerplate](https://github.com/vzakharov/agent-project-boilerplate) I now use everywhere. It also let me put things into the flow that plan mode has no opinion about — every plan must carry a "DRY notes" section arguing what's shared vs. duplicated _before_ implementation, rather than discovering it in review.

**Context hygiene (9/10).** This is the one I'd tell you first if we had one minute. The single biggest killer of agent productivity — and of your wallet — is bloated context. The mistake I see constantly is people never ending a conversation: do this, and also that, oh and this unrelated thing. Yes, models take a million tokens now. Past 200k you've strayed, and the agent can no longer _use_ all of it reliably even if it can still recall it.

> _on why a 1M-token context window is not a target_
>
> **More megapixels just meant more noise on the matrix.**

> _the rule_
>
> **One session, one thread.**

Which connects straight back to the plan file. If a plan is any good, it has to be sufficient on its own — no part of the conversation that produced it should matter to the quality of the implementation. That's a litmus test: if it isn't sufficient, the plan is bad. And if it _is_ sufficient, you can implement it in a brand-new session. Which you can't do with built-in plan mode, because there's nothing to start _from_ — but a plan file sitting on the feature branch works perfectly. So `/plan` ends by handing me a copyable `/implement <branch>` command, and the next session picks it up cold.

Four sessions per feature, then: plan it, implement it, address the review, finalize it. Always squash-merged, so `main` reads as one clean commit per unit of work rather than an archaeology of how the agent got there.

## The timeline, honestly

They asked for 1.5–2 months. I agreed and missed it. At the two-month mark there was nothing in production. The first production build was day 77; the first workspace actually running on the rewrite was seven weeks after the original deadline; all workspaces were over by day 128.

The chart of units of work does show where my method changed — as a seam about four weeks wide, from the last week of April to the last week of May. The number I like best is the dull one: **the median unit of work stays about the same size — 367 changed lines before the seam, 330 after — while units per day go from 6.1 to 8.9.** Same-sized pieces, more of them at a time. That's what parallelism looks like from the outside.

## The handover

I shipped `4.4.3` on 10 August and stopped writing code. In the eleven days after, 38 of the 42 pull requests merged to `main` were the rest of the team's; my four were release notes, a CI permissions fix and some agent tooling.

The rest of the team is three people, and they are the Bubble developers who built Playgram in the first place. Two of them created their GitHub accounts during this project, one on its first day; none had a professional software-engineering history before March. They are not junior at anything — they built a product on a no-code platform that most of the industry says can't hold one — they just hadn't worked in a repository before.

What they shipped in those eleven days includes metering for every non-reply cost stage across 77 files, a production data recovery that proved over four dry runs that the naive fix would have resurrected a thousand deliberately-deleted files, and a streaming spreadsheet reader that cut a 2.4-second stall to 76 milliseconds. Every one of those PRs came through the same plan-implement-review pipeline described above, 84% of them carrying a live agent session link. The scaffolding was as much the deliverable as the app.

Part II covers CI/CD and the test-bucket problem, data migration, the things that sound simple and aren't — and why everything seemed ALMOST ready at two months and stayed ALMOST ready for two more. Pareto never fails.
