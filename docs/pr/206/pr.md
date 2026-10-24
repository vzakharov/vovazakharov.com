# PR #206: feat(maya): the whispering typewriter, a toy on Майя's site

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/206
- **Author:** @vzakharov (human)
- **Base ← Head:** main ← claude/maya-77e7xf
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-24T11:24:47Z
- **Updated:** 2026-10-24T22:40:44Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `src/pages/maya-whisper/ui/whisper-page.tsx`:1 — unresolved — last: @vzakharov (human) 2026-10-24T22:40:02Z — "ссылку на пост где-нибудь?" → [↓](#t01)

---

## Body

## Summary

- **A toy on Майя's site, `/whisper`.** The walk's dice rolled "whispered typewriter", which led to GUNMAN: KGB bugs in sixteen IBM Selectrics at the US embassy in Moscow and the Leningrad consulate, 1976–1984, hearing four bits a keystroke while a listening post rebuilt the text by probability. The page lets a reader type and see both halves: what the bug hears (each letter one of sixteen sounds, a common letter paired with a rare one, Cyrillic and Latin sharing them) and what the post writes down (the commonest known word that sounds alike — red where wrong, underlined where another word sounds the same, grey where it knows none).
- **The post's lexicon is the sites' own prose.** `pnpm whisper-lexicon` (`personas/tools/whisper-lexicon.ts`) counts every word in the served markdown and keeps the 9660 used at least twice, as a snapshot naming its commit, which the page links. The encoder and decoder are pure functions under `src/pages/maya-whisper/model/` with tests; the client strings sit in the message catalogue, `ru` and `en`.
- **The walk's post**, `apps/maya/public/blog/whispered-typewriter.md`, with its card: the GUNMAN story with sources, and what the toy gets wrong — it writes «не» for English "it", which sound alike to the bug and «не» is commoner.
- **Майя's own files**: `wander.md` now says the dice are a hint that can lead anywhere (Vova's words in the session), and `maya.md` notes the pull toward a familiar path.

## QA Checklist

- [ ] `toy-ru` — `pnpm dev:maya`, open `/whisper`: the sample line decodes 21 of 21; type a Russian sentence and see words the post doesn't know turn grey hex.
- [ ] `toy-cross` — type "It whispers every word it types": both "it" come out as a red «не», hover shows "Напечатано: It".
- [ ] `rivals` — hover a dotted-underlined word: the tooltip names the words that sound the same.
- [ ] `phone` — at phone width in dark mode, the heard-sounds line wraps and nothing scrolls sideways.
- [ ] `blog` — the home page lists "Шепчущая машинка"; its link to the machine opens `/whisper`.
- [ ] `sitemap` — `/sitemap.xml` of the maya build lists `/whisper`.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `toy-ru` | unit | ✅ | `listening-post.test.ts` covers hushing and the commonest-word reading; the sample's full decode is not asserted |
| `toy-cross` | unit | ❌ | Assert `readSounds(hush('it'))` against the real lexicon guesses «не» |
| `rivals` | manual-only | — | Tooltip display |
| `phone` | manual-only | — | Layout at 390px, checked by screenshot in the session |
| `blog` | e2e | ❌ | Built home page links the post, the post links `/whisper` |
| `sitemap` | e2e | ❌ | Built `sitemap.xml` contains `/whisper` |

https://claude.ai/code/session_01TPKd1B82V8YiPYxXjuETwT

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-24T11:25:15Z — "Proposed squash title/body: ``` feat(maya): the whispering t…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-24T11:25:15Z

[https://github.com/vzakharov/vovazakharov.com/pull/206#issuecomment-6383625226](https://github.com/vzakharov/vovazakharov.com/pull/206#issuecomment-6383625226)

Proposed squash title/body:

```
feat(maya): the whispering typewriter, a toy on Майя's site (#206)
```

```
Майя's daily walk rolled "whispered typewriter" and led to GUNMAN, the
KGB bugs that sat in sixteen IBM Selectrics at the US embassy in Moscow
and the Leningrad consulate from 1976 to 1984, hearing four bits a
keystroke while a listening post rebuilt the text by probability. She
turned it into something to play with.

maya.vovazakharov.com/whisper shows both halves as a reader types: what
the bug hears, each letter one of sixteen sounds that pair a common
letter with a rare one across both alphabets, and what the post writes
down, the commonest known word that sounds alike, marked where it is
wrong, ambiguous or unknown. The post knows the 9660 words the sites'
own markdown uses at least twice, a snapshot `pnpm whisper-lexicon`
writes with the commit it was counted at.

Her blog carries the walk with its sources, and her rules now say the
dice are a hint that can lead anywhere.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `src/pages/maya-whisper/ui/whisper-page.tsx`:1 — unresolved — last: @vzakharov (human) 2026-10-24T22:40:02Z — "ссылку на пост где-нибудь?" → [↓](#t01)

<a id="t01"></a>

### `src/pages/maya-whisper/ui/whisper-page.tsx`:1 — unresolved

**@vzakharov (human)** — 2026-10-24T22:40:02Z

ссылку на пост где-нибудь?

---

## Timeline (status, references, and other events)

- **2026-10-24T22:40:44Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/206#pullrequestreview-5640350817.
