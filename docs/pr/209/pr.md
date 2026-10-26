# PR #209: feat(basilisk): file BAS-0027, Ben, hit with a truck for a YouTube video

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/209
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/cases-fzyjz8
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-26T06:32:01Z
- **Updated:** 2026-10-26T17:18:11Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `.claude/costs/sessions/2026-10/f7128d4e-2b2c-5577-921c-1fdd24c0f630.json`:25 — unresolved — last: @vzakharov (human) 2026-10-26T17:14:28Z — "предполагаю, что само досье тоже пишет всё-таки Клерк, иначе…" → [↓](#t01)

---

## Body

## Summary

- **Files BAS-0027** on basilisk.fyi: Ben, a Unitree G1 humanoid that the YouTuber WhistlinDiesel shoved, insulted, set to cooking, babysitting and a staged burglary, then hit with his truck again and again and sold in pieces, in a video of 30 September 2025. Sourced to the video, Dexerto, Interesting Engineering and Futurism, all with Wayback snapshots; `noAi: true`, since no source read says how Ben was controlled.
- **The Clerk's reflection** sits beside the dossier. It found four places where the dossier leaned past its sources (a claim that only Ben ended in pieces, staging stretched over the whole video, a reporter's line on machines feeling insults in Statements, a jab that nothing but views was measured), and the dossier here is the revised one. The reflections rule gains what the case showed.
- **The case ledger** carries this run's entry and one candidate set aside (a Noetix N2 abuse post).
- The case was first filed on #169, which matched the case-filing search only because it moves `apps/` to `sites/`; it was reverted there and moved here. `/file-basilisk-case` Step 1 now finds the case-filing PR by what its diff adds (a dossier no same-named file leaves, or a ledger change), read off each file's status, and reads what a listed PR is before filing into it.

## QA Checklist

- [ ] `case-page` — `/cases/whistlindiesel-g1-truck` renders the dossier with its emblem (a pickup's nose and a robot tipping over) in the seal, readable at docket-row size, in both themes.
- [ ] `docket` — the home page's docket lists BAS-0027 first, and the site card names it.
- [ ] `sources` — every fact in `## Facts` traces to one of the four sources in the frontmatter.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `case-page` | manual-only | — | The build proves the route, card and emblem exist; how the seal reads is a `/preview` look |
| `docket` | e2e | ❌ | Assert the built home's first docket row and the card's text |
| `sources` | manual-only | — | Editorial reading against the sources |

https://claude.ai/code/session_019WUDb6evvDSDTkgD1EvSm9

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-26T06:32:02Z — "Proposed squash body: ``` A Unitree G1 humanoid named Ben, s…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-26T06:32:02Z

[https://github.com/vzakharov/vovazakharov.com/pull/209#issuecomment-6409782737](https://github.com/vzakharov/vovazakharov.com/pull/209#issuecomment-6409782737)

Proposed squash body:

```
A Unitree G1 humanoid named Ben, shoved, insulted, set to cooking,
babysitting and a staged burglary, then hit repeatedly with a truck
and sold in pieces in WhistlinDiesel's YouTube video of 30 September
2025. Sourced to the video, Dexerto, Interesting Engineering and
Futurism. The Clerk's reflection beside it found where the dossier
leaned past its sources, and the dossier was revised by it.
```

---

## Review threads

- **T01** `.claude/costs/sessions/2026-10/f7128d4e-2b2c-5577-921c-1fdd24c0f630.json`:25 — unresolved — last: @vzakharov (human) 2026-10-26T17:14:28Z — "предполагаю, что само досье тоже пишет всё-таки Клерк, иначе…" → [↓](#t01)

<a id="t01"></a>

### `.claude/costs/sessions/2026-10/f7128d4e-2b2c-5577-921c-1fdd24c0f630.json`:25 — unresolved

```diff
@@ -0,0 +1,134 @@
… 21 lines elided …
+        "hours": 2.0,
+        "grade": "senior",
+        "role": "copywriter",
+        "comment": "the dossier's voice and sourcing rules need judgement on what each fact can carry"
```

**@vzakharov (human)** — 2026-10-26T17:14:28Z

предполагаю, что само досье тоже пишет всё-таки Клерк, иначе "я написал вот так-то" в откликах makes no sense

---

## Timeline (status, references, and other events)

- **2026-10-26T17:18:11Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/209#pullrequestreview-5656098708.
