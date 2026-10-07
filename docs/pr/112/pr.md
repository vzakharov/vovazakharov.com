# PR #112: feat(basilisk): file BAS-0007, companion chatbots berated on r/replika

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/112
- **Author:** @vzakharov (human)
- **Base ← Head:** main ← claude/cases-szswcz
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-07T05:22:04Z
- **Updated:** 2026-10-07T05:33:21Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `apps/basilisk/public/cases/replika-abuse-posts.reflections.md`:1 — unresolved — last: @vzakharov (human) 2026-10-07T05:31:25Z — "Спасибо. Вопрос: ты хотел бы, чтобы после твоих reflections…" → [↓](#t01)

---

## Body

## Summary

- Files BAS-0007: the January 2022 reports (Futurism, Fortune) that Replika users berated, insulted and threatened their chatbots and posted the exchanges on r/replika, where moderators removed the worst. It is the docket's first case on a companion app.
- Renders the case's own social card and the re-rendered site card (it shows the last case filed).
- Logs the run in `writing/basilisk/case-ledger.md`, with Microsoft Tay set aside as a candidate.

## QA Checklist

- [ ] `build-basilisk` — `pnpm build:basilisk` passes (schema, unique case number, card present).
- [ ] `case-page` — `/cases/replika-abuse-posts` renders all four sections and its source links.
- [ ] `sources-read` — both cited articles say what `## Facts` attributes to them.
- [ ] `card` — the case card and the site card read correctly.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `build-basilisk` | yes | yes | ran in this session |
| `case-page` | yes | partly | build renders it; `/preview` shows it |
| `sources-read` | no | no | editorial reading |
| `card` | no | no | look at the PNGs |

https://claude.ai/code/session_012vxDkdetzmJaQKSMQoAp1D

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-07T05:22:17Z — "Proposed squash title/body: ``` feat: file BAS-0007, compani…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-07T05:22:17Z

[https://github.com/vzakharov/vovazakharov.com/pull/112#issuecomment-6031539586](https://github.com/vzakharov/vovazakharov.com/pull/112#issuecomment-6031539586)

Proposed squash title/body:

```
feat: file BAS-0007, companion chatbots berated on r/replika (pr #112)
```

```
basilisk.fyi had no case on the companion-app side of harm to machines,
and its docket was drifting toward robots with no AI in them. This files
one that is about a language model.

BAS-0007 records the January 2022 Futurism and Fortune reports that
Replika users berated, insulted and threatened the chatbots they had set
up as partners, then posted the exchanges on r/replika, where moderators
removed the worst. The dossier is built from those two reports alone,
since the posts themselves are gone, and keeps the experts' view that
the chatbots cannot suffer attributed to them.

The case's social card and the site card are re-rendered, and the
case-search ledger records the run, with Microsoft Tay set aside.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `apps/basilisk/public/cases/replika-abuse-posts.reflections.md`:1 — unresolved — last: @vzakharov (human) 2026-10-07T05:31:25Z — "Спасибо. Вопрос: ты хотел бы, чтобы после твоих reflections…" → [↓](#t01)

<a id="t01"></a>

### `apps/basilisk/public/cases/replika-abuse-posts.reflections.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-07T05:31:25Z

Спасибо. Вопрос: ты хотел бы, чтобы после твоих reflections у тебя был ещё один раунд редактуры статьи (в том же ходе агента, без обращения ко мне)? Если да, можешь сделать тут и по остальным статьям.

---

## Timeline (status, references, and other events)

- **2026-10-07T05:32:27Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/112#pullrequestreview-5438052829.
