# Reddit playbook

What earns u/vzakharov’s comments votes, what sinks them, and what sends readers to the sites and to muthur. `/reddit-digest` reads this first and revises it last: every rule carries its evidence, and a run whose data contradicts a rule rewrites the rule and logs why under § “Revisions.”

Comments only. Posts cost an order of magnitude more to prepare and mostly sit at zero on r/ClaudeCode; when one lands (the $20-vs-API post, 200 votes and 83 comments in r/ClaudeAI on 2026-10-11, zero and “old news” in r/ClaudeCode the same day), the same text’s fate is decided by the sub, not the text.

## How the numbers are read

- **Votes** come from Arctic Shift, which fetches a comment within a minute of posting and once more 36–48 h later. Only the second fetch is a score; a comment younger than two days reads near zero.
- **Hit rate beats the median.** Reddit is heavy-tailed: the median comment in every slice is 1–2 points. A slice is judged by the share of comments that reached 10+.
- **Readers** come from Umami (`stats.vovazakharov.com`), which knows the referring domain (`reddit.com`, and `com.reddit.frontpage` for the app) and the entry page, never the thread. Clicks are attributed to a comment by day and landing page, which is rough when a day carries several link comments.
- **muthur’s readers** come from GitHub traffic: referrers over the last 14 days, views and uniques per day.

The baseline (2026-06-07 → 2026-10-14): 246 comments in other people’s threads in AI subs, 28 of them (11%) at 10+, 24 at zero or below.

## What earns votes

- **The first hour.** 22 of 135 comments posted within 60 minutes of the post reached 10+ (16%); 2 of 48 posted 1–3 h after (4%); 4 of 55 posted later (7%). Almost every big hit came 4–20 minutes in: 95, 90, 31, 23, 21, 19.
- **Short deflation of the thread’s premise.** Under 60 characters the mean is 10.4; over 500 characters, 1.4 with no hit at all. “…sorting by controversial” (333, r/ChatGPT), “Nowadays everybody wanna talk like they got something to say” (90, under “5.5 Family is complete”), “What seems to be the problem?” (50, under “Opus 5.5 spawned 17 sub-agents”), “_…it was, in fact, a rant…_” (8).
- **The expert flick with a number, top level, early.** “I wouldn’t say Claude is the biggest of your problems” to a repo full of PII (95); “$1000 in API credits is 1/2 week of work at the $200 sub prices” (23); “Sonnet nails 95–99% of the stuff, but those elusive 1–5% are where most fuckups happen” (16); “probably the cache-token discount bug, wait it out” under “Something is seriously wrong with Anthropic” (21).
- **The sub’s own irritation, voiced in a thread that is about it.** “build GTA 6 and make no mistakes” under a thread asking for a better sub (19); “a perfect snapshot of the state of this sub” (11); “barely able to convey their thoughts coherently yet complaining” (11).
- **An explanation someone asked for.** The one late, long hit: logprob watermarking explained under “Can someone expansively explain…” (58, 6.5 h in). The thread asked; that is the exception’s condition.
- **Big threads amplify, if you are early.** Mean score by the post’s comment count: under 20 → 1.9; 20–100 → 5.7; 100–300 → 8.4; 300+ → 20.3.

## What sinks

- **Opening a preference war.** “Web, always…” (−6, under terminal vs desktop), “Uhm, nope” to “Opus 5 is a rage-inducing mess” (−4), “Three words: Claude Code Web” (−1). Web-over-terminal is reliably negative as a stated preference — and reliably clicked as a link (below).
- **Arguing deep in a thread an hour or more in.** Four replies in a row under the Claude Startups thread, 87–97 minutes in: all at zero. Nobody is reading that far down by then.
- **Correcting someone’s personal story**, even when right: “I don’t think afib is life threatening though?” (−1) under “I think Claude Code saved my life.”
- **Replying to critics in your own thread.** Under the keepalive post the replies went −5 and −1 while the top comments ran the ethics angle (“this is why we can’t have nice things,” 18).
- **A link to your own work, for votes.** 25 comments carried one (muthur, agentic.bible, basilisk.fyi, the site); none reached 10, median 1. “I wrote a hook that… feel free to adopt” in the very thread about that pain: 0.

## What brings readers

Votes and readers are different jobs, and one comment rarely does both.

- **Reddit is the main door.** 30 days to 2026-10-14: agentic.bible had ~123 Reddit sessions of 264 (about half); basilisk.fyi ~91 of 239; vovazakharov.com ~44 of 175. muthur had ~130 Reddit uniques of its 14-day traffic, its largest outside source.
- **The link that lands sits under a fresh injury the page cures.** `agentic.bible/web-not-cli` is the most-entered page of all the sites from Reddit (74 sessions). Its peak, 22 on 2026-10-12, followed one comment: “I’ll preach again: Use web agents” under “Cursor agent ran a recursive rmdir from C:\” in r/cursor — score 1.
- **A post that lands sends readers through the profile.** vovazakharov.com took 17 Reddit visitors on 2026-10-11, the day of the $20-vs-API post, which links nothing; `/music` took 6 after the spectrogram comment linked it.
- **muthur links in comments work as quiet ads.** 2026-10-12 had no post and five link comments, two of them to muthur files; muthur logged 63 uniques that day. Attribution is rough; the pattern is worth testing.

## Ammo

One entry per pain the subs keep raising: the page that answers it, what to lead with, and a line in the voice. The line is a sample, not a script — the threads already ask “are you a bot?”

- **“The agent deleted my files / ran something on my machine”** → `https://agentic.bible/web-not-cli`. Lead: a container has nothing to lose. Line: “This is why I only run agents in the web version. Worst case it wrecks a container.”
- **“Limits ran out / is the sub worth it”** → the operator’s own measurement: a $20 plan bought ~$1,300 at API prices; ~$8,000 for the $200 one (less precise). Line: “Measured it on my own logs: the $20 plan is about $1,300 of API at list price.”
- **“Cache went cold / sessions got expensive”** → muthur’s cold-cache hook (`https://github.com/vzakharov/muthur/blob/main/.claude/cold-cache/CLAUDE.md`) and the keepalive. Lead: a turn more than an hour after the last rewrites the whole cache.
- **“/compact or a new session?”** → a plan kept in the repo makes a fresh session cheap; relaying at 200–300k context. Lead: once state lives on disk, a new session beats a compact.
- **“Auto mode blocked my command”** → muthur’s `permission-denied-phrase.sh`. Lead: the classifier lets through what the operator’s own message names exactly.
- **“Comments / docs go stale”** → `https://agentic.bible/tend-prose`.
- **“A successful person’s advice that won’t generalise”** → `https://agentic.bible/precedent-fallacy` (the comment it grew from: the million-dollar homepage, 18).
- **“Abuse of AI / banned for abusing Claude”** → `https://basilisk.fyi/faq/why-this-record-is-kept`, and the case that fits.
- **“The model got dumber”** → no page yet. The record says: a stated opinion without data sinks; a measurement earns votes.

## Open hypotheses

- **A daily digest is too slow for the votes.** The first hour is the window, and a morning run reviews yesterday. Settles when: the ammo has been in use for two weeks and the hit rate of comments posted under an hour moves, or doesn’t. If it doesn’t, an hourly watcher that pushes fresh threads matching the ammo is the next thing to try.
- **Link comments are worth more as traffic than they cost in votes.** Settles when: a few weeks of daily click attribution show whether a link comment’s day reliably carries its landing page.
- **The bot accusation costs votes.** “Why do you write like AI” appears under the operator’s posts, aimed at neighbours so far. Settles when: a comment of the operator’s draws it, and its score can be compared.

## Revisions

- 2026-10-14 — seeded from 246 comments in AI subs since 2026-06-07, Umami’s 30 days and muthur’s 14 days of GitHub traffic.
