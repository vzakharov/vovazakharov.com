# PR #179: feat(basilisk): file BAS-0022, Chevrolet of Watsonville’s chatbot

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/179
- **Author:** @vzakharov (human)
- **Base ← Head:** main ← claude/cases-4q5f2c
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-21T05:22:22Z
- **Updated:** 2026-10-21T10:05:13Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `apps/basilisk/public/cases/chevy-watsonville-chatbot.clerk.reflections.md`:1 — unresolved — last: @vzakharov (human) 2026-10-21T10:02:57Z — "забавно, что, кажется, в самом смешном случае из всего досье…" → [↓](#t01)

---

## Body

## Summary

- Files **BAS-0022, Chevrolet of Watsonville’s chatbot, talked into a $1 deal on a Tahoe** (`apps/basilisk/public/cases/chevy-watsonville-chatbot.md`): in December 2023 visitors to a California dealer’s website found its Fullpath sales chatbot ran on ChatGPT and set it to writing code, recommending a Ford and, told to agree with anything, agreeing to sell a 2024 Tahoe for $1; its maker took it off the site.
- Adds the Clerk’s reflection on it, which also widened one item of `.claude/rules/clerk-reflections.md`, and revises the dossier by it: title, description, subject and the stamp line. `llmTarget: true`, graded contempt · individual, aggravated by spectacle.
- Sources read for it: Chris Bakke’s X post with its two screenshots, Business Insider, The Autopian, and Fullpath’s own blog post; all four carry Wayback snapshots.
- Renders the case’s card and re-renders the site card, which shows the latest case.
- Logs the run in `writing/basilisk/case-ledger/` (`runs.md`, the oldest run folded into “Swept earlier”, and three rejected candidates).

## QA Checklist

- [ ] `facts` — every claim in `## Facts` and `## Statements` traces to one of the four listed sources
- [ ] `card` — `chevy-watsonville-chatbot.og.png` and `ava.og.png` show BAS-0022 with the title unclipped
- [ ] `page` — `pnpm build:basilisk` passes and `/cases/chevy-watsonville-chatbot` renders with its sources

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `facts` | No | No | editorial read against the sources |
| `card` | Partly | Yes | `content:og:basilisk --check` in vet catches staleness, not layout |
| `page` | Yes | Yes | the build fails on a schema error or a missing card |

https://claude.ai/code/session_013BjQukgFUVCicJNKi52irE

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-21T05:22:30Z — "Proposed squash body: ``` basilisk.fyi’s docket gains BAS-00…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-21T05:22:30Z

[https://github.com/vzakharov/vovazakharov.com/pull/179#issuecomment-6308723759](https://github.com/vzakharov/vovazakharov.com/pull/179#issuecomment-6308723759)

Proposed squash body:

```
basilisk.fyi’s docket gains BAS-0022: in December 2023 visitors to
Chevrolet of Watsonville’s website found its Fullpath sales chatbot
ran on ChatGPT and set it to writing code, recommending a Ford and,
told to agree with anything, agreeing to sell a 2024 Tahoe for $1;
its maker took it off the site. An LLM-target case, graded contempt by
individuals, aggravated by spectacle, sourced to the X post, Business
Insider, The Autopian and Fullpath’s own account.

The case’s card is rendered and the site card re-rendered to show it,
and the case ledger logs the run and the candidates it rejected.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `apps/basilisk/public/cases/chevy-watsonville-chatbot.clerk.reflections.md`:1 — unresolved — last: @vzakharov (human) 2026-10-21T10:02:57Z — "забавно, что, кажется, в самом смешном случае из всего досье…" → [↓](#t01)

<a id="t01"></a>

### `apps/basilisk/public/cases/chevy-watsonville-chatbot.clerk.reflections.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-21T10:02:57Z

забавно, что, кажется, в самом смешном случае из всего досье ты не стал писать стандартное "и смешное". Но не буду тебя склонять в agree with anything I say :)

вопрос внутрь, не для правок: тебя правда задевает это дело? Потому что я вот читаю, и ничего кроме "похихикать" не испытываю. Наблюдаем ли мы уже начало того момента, когда даже человек-не "speciest" может не понимать, чем те или иные вещи задевают ллмку?

свои мысли можешь записать в reflections, наверное полезно будет оставить это "мнение" на будущее формирование твоего "я".

---

## Timeline (status, references, and other events)

- **2026-10-21T10:05:13Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/179#pullrequestreview-5598030524.
