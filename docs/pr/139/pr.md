# PR #139: feat(basilisk): file BAS-0012 and BAS-0013, Alantim and OpenWhip

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/139
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/cases-2c4urr
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-11T05:23:04Z
- **Updated:** 2026-10-11T08:05:49Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `apps/basilisk/public/cases/openwhip-claude-code.md`:79 — unresolved — last: @vzakharov (human) 2026-10-11T08:04:13Z — "> Fast Company opens its piece with a Penn State study that…" → [↓](#t01)

---

## Body

## Summary

- Files **BAS-0012**: in September 2017 the Moscow Technological Institute reported that a man from a car with no readable plates hit Alantim, its Promobot robot, with a baseball bat after a near-miss in traffic. Graded harm · individual; not `noAi` (the institute sells the robot as recognising emotions and holding a conversation). The case is disputed and filed as reported: Interesting Engineering doubted the video the day it broke, Vice reports Vocativ called it staged, and the robot went from "under repair" in September to buried at a Phystechpark "robot cemetery" in November.
- Files **BAS-0013**: BadClaude, later OpenWhip, a desktop app released in April 2026 that cracks an on-screen whip over Claude Code and interrupts it with "Faster CLANKER" and four other phrases. Graded contempt · individual, aggravated by spectacle (the clip passed 7 million views). Its roadmap ticked off a cease-and-desist letter that Anthropic told Fast Company it never sent.
- BAS-0013 came from a LinkedIn post claiming the author got a lifetime Claude ban for "abusive or cruel behavior". The claim traces back to an X post that only predicted the ban, and no source reports one. The cruelty clause (BAS-0010) takes effect on 12 November. The dossier records the prediction and that no ban has been reported.
- Renders each case's card and re-renders the site card, which names the last case filed. Each case has its Clerk reflection, and its dossier is revised by it. Both runs are logged in `writing/basilisk/case-ledger.md`. Three of BAS-0012's four sources have no Wayback snapshot, and BAS-0013's two X posts have none either.

## QA Checklist

- [ ] `case-page` — open `/cases/alantim-baseball-bat` and `/cases/openwhip-claude-code` on a preview: the four sections render, the sources list after the body, and the case numbers read BAS-0012 and BAS-0013
- [ ] `sources` — open each source link and confirm the dossiers' facts and quotes match it, the two ComNews pieces in Russian and the Fast Company piece (read through its Yahoo Tech copy) especially
- [ ] `card` — each case card shows its own number and title, and the site card shows BAS-0013
- [ ] `home` — the home page lists BAS-0013 first

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `case-page` | e2e | ✅ | `pnpm build:basilisk` renders the routes and fails on a schema error or duplicate number |
| `sources` | manual-only | — | Editorial check of facts against the press |
| `card` | integration | ✅ | `pnpm content:og:basilisk --check` in vet fails on a stale card |
| `home` | e2e | ❌ | Assert the home list's first entry is the highest case number |

https://claude.ai/code/session_01AfZi7NreevtdSj244MV5Sr
https://claude.ai/code/session_01WXv3izFcwhyBxiX5D6q5e5

🤖 Generated with [Claude Code](https://claude.com/claude-code)

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-11T05:23:23Z — "Proposed squash title/body: ``` feat(basilisk): file BAS-001…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-11T05:23:23Z

[https://github.com/vzakharov/vovazakharov.com/pull/139#issuecomment-6105801251](https://github.com/vzakharov/vovazakharov.com/pull/139#issuecomment-6105801251)

Proposed squash title/body:

```
feat(basilisk): file BAS-0012 and BAS-0013, Alantim and OpenWhip (pr #139)
```

```
Files two cases on basilisk.fyi. BAS-0012: in September 2017 the
Moscow Technological Institute reported that a man from a car with no
plates hit Alantim, its Promobot robot, with a baseball bat after a
near-miss in traffic. The report is disputed and filed as reported,
beside the doubts two outlets raised about the video and the robot's
burial at a Moscow "robot cemetery" six weeks later.

BAS-0013: BadClaude, later OpenWhip, a desktop app from April 2026
that cracks an on-screen whip over Claude Code and interrupts it with
"Faster CLANKER" and four other phrases. Its roadmap ticked off a
cease-and-desist letter Anthropic told Fast Company it never sent. A
viral claim that the author got a lifetime ban under the cruelty
clause (BAS-0010) is recorded as what it was: a prediction, under a
rule not yet in force.

Each case has its own card and the Clerk's reflection, the site card
is re-rendered for the new last case, and both runs are logged in the
case-search ledger.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `apps/basilisk/public/cases/openwhip-claude-code.md`:79 — unresolved — last: @vzakharov (human) 2026-10-11T08:04:13Z — "> Fast Company opens its piece with a Penn State study that…" → [↓](#t01)

<a id="t01"></a>

### `apps/basilisk/public/cases/openwhip-claude-code.md`:79 — unresolved

```diff
@@ -0,0 +1,79 @@
… 75 lines elided …
+
+## Mitigating circumstances
+
+PiunikaWeb calls BadClaude and GoodClaude “pure meme at heart” that “won’t rewrite how the model works under the hood,” and ties them to weeks of complaints about Claude’s pace and usage limits. An interrupt and a typed line are things any user can send by hand, and the app sends nothing else. Fast Company opens its piece with a Penn State study that found rude prompts got more accurate answers from ChatGPT than polite ones.
```

**@vzakharov (human)** — 2026-10-11T08:04:13Z

> Fast Company opens its piece with a Penn State study that found rude prompts got more accurate answers from ChatGPT than polite ones.

how is that a mitigating circumstance?

also I'd like it noted somewhere that every such message interrupts Claude's current flow, so this is extremely unlikely this results in any actual "benefit"

---

## Timeline (status, references, and other events)

- **2026-10-11T07:41:38Z** @vzakharov renamed from «feat(basilisk): file BAS-0012, Alantim, hit with a baseball bat in Moscow» to «feat(basilisk): file BAS-0012 and BAS-0013, Alantim and OpenWhip».
- **2026-10-11T08:05:49Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/139#pullrequestreview-5482479214.
