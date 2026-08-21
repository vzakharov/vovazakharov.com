# From Bubble to Next.js in 4 months: the Playgram case study (micro)

_Also available: the [full version](./playgram-bubble-to-nextjs-part-1.md) and a [mini version](./playgram-bubble-to-nextjs-part-1.mini.md). Part I of II. Disclosures approved by Playgram management._

---

**The job.** Playgram is a live AI chat product — many models, team chats, file libraries, memory, voice — built entirely in Bubble, a no-code tool. They wanted it as real code in two months, mainly so they could use AI coding agents on it. I took it, and missed the deadline: the first production build was day 76, all workspaces were over by day 127.

**The result.** 168 days. 1,537 commits, 1,063 merged PRs, 244,000 lines of TypeScript. Cold loads from multi-second to sub-second. Four major releases, three workspace cutovers, no rollbacks.

**How.** I wrote almost none of it. At the peak, twenty-plus Claude Code agents ran in parallel in the cloud while I reviewed pull requests. Three things made that possible:

1. **A splitter for the 25 MB Bubble export.** Not chunked by size but reconstructed by shape into 3,487 files that read almost like source, with names recovered from the export's own fields — and, crucially, stable enough that re-exporting the live app weekly produced a legible diff instead of noise.

2. **Guardrails an agent cannot argue with.** Feature-Sliced Design with zero upward or sideways imports across 8,123 of them, enforced by tooling rather than by good intentions. 362 lint rules, 28 hand-written, every one an error because warnings are rules nobody enforces. Agents will happily ignore a convention written in prose and will never once ship a lint error.

3. **One session, one thread.** Bloated context is the biggest killer of agent productivity and of your budget. Every unit of work gets a plan file in the repo, and a plan good enough to implement is a plan good enough to implement in a *fresh* session — which is the test of whether it was any good.

**The number I'd put on a slide.** Churn per commit stayed flat at ~400 lines while commits per day rose 63%. Same-sized units of work, just more of them at once. That's parallelism, measured.

**What I'd do differently.** Less upfront deliberation (four models researching every decision was partly just spreading the blame), and a migration plan with the big picture only — the exhaustively detailed one drifted into a liability within weeks.

Part II: CI/CD, data migration, the things that sound simple and aren't, and why it all seemed ALMOST ready at two months and stayed ALMOST ready for two more.
