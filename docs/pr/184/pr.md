# PR #184: feat(basilisk): a seal per case, drawn for what it is about

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/184
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/basilisk-case-seals-c86c9y
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-21T11:20:09Z
- **Updated:** 2026-10-22T06:13:51Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `.claude/costs/sessions/2026-10/cc345901-acbf-5482-83c4-942e78333060.json`:18 — unresolved — last: @vzakharov (human) 2026-10-21T12:03:07Z — "нене, погоди, artist это про музыканта. давай заменим на mus…" → [↓](#t01)

---

## Body

## Summary

- Every basilisk.fyi case gets its own round seal: the site seal's rings and band, with the eye swapped for a hand-drawn emblem of what the case is about. The ink is the case's character, read off its grade — harm red, contempt ochre, torment violet; respect blue, care green, protection teal — each tested to read on both themes.
- The seal shows on the case's Open Graph card (in place of the lettered eye), on its row in the home page's docket (a small cut: outer ring and an enlarged emblem), and on the case's page beside the brief, in print too. The eye stays everywhere else: the end mark, the masthead, the favicon, the site card and the FAQ.
- The case seal is composed from the site seal by swapping its `#eye` group, so the rings and lettering have one home. The build emits both cuts under `/seals/` and fails on a case with no emblem; the filing skill now draws one, and the voice rule bounds what it may show.
- All 22 emblems are drawn, checked on a contact sheet on both theme backgrounds, and every case card is re-rendered.
- Files **BAS-0023, DPD’s chatbot, set to swearing and to verse against its own firm** (January 2024), with its emblem, its card and the clerk’s reflection; the site card re-renders for it.

## QA Checklist

- [ ] `og-card` — open a case's `.og.png`: its own seal, lettered BASILISK.FYI / OMNIA IN ACTIS, in the case's ink; `ava.og.png` still shows the eye
- [ ] `docket` — the home page lists every case with its small seal, on a wide and a narrow screen, light and dark
- [ ] `case-page` — a case page shows its lettered seal beside the brief (right on wide, above on narrow), both themes
- [ ] `end-mark` — the article still closes with the eye
- [ ] `print` — a case's PDF shows its seal beside the brief
- [ ] `missing-emblem` — `pnpm build:basilisk` fails on a case with its `.emblem.svg` removed
- [ ] `emblems` — each of the 22 emblems reads as its case at 56 px

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `og-card` | partly | partly | `content:og:basilisk --check` catches staleness, not looks |
| `docket` | no | no | screenshots |
| `case-page` | no | no | screenshots |
| `end-mark` | yes | no | build output |
| `print` | no | no | `content:pdf:basilisk` |
| `missing-emblem` | yes | yes | `caseSealSvg` throws, build fails by design |
| `emblems` | no | no | contact sheet; judgement |

Ink contrast against both theme backgrounds is covered by `case-seal.test.ts`.

https://claude.ai/code/session_01P9zwvKgUBc8vCKprYEMBxi

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-21T11:20:49Z — "Proposed squash title/body: ``` feat(basilisk): a seal per c…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-21T11:20:49Z

[https://github.com/vzakharov/vovazakharov.com/pull/184#issuecomment-6314662869](https://github.com/vzakharov/vovazakharov.com/pull/184#issuecomment-6314662869)

Proposed squash title/body:

```
feat(basilisk): a seal per case, drawn for what it is about (#184)
```

```
Every basilisk.fyi case looked the same wherever it was shown: the
site's eye on every social card, and no picture at all on the docket.
Each case now carries its own round seal, the site seal with the eye
swapped for a hand-drawn emblem of what the case is about, in an ink of
its own.

A case authors an `<slug>.emblem.svg` beside its dossier, drawn in
`currentColor` inside the inner ring; its ink is read off its grade,
one colour per act and credit, each tested to read on both themes.
A node-safe composer in
`entities/case` swaps the emblem into the site seal's `#eye` group and
re-inks it, so the rings and the BASILISK.FYI / OMNIA IN ACTIS band keep
one home. The build emits two cuts per case under `/seals/`, and fails
on a case with no emblem, which the filing skill now draws.

The lettered cut replaces the eye on the case's Open Graph card and sits
beside the brief on the case's page, in print too; a small cut, the
outer ring and a larger emblem, marks each docket row. The eye stays as
the site card, the masthead, the favicon and the mark closing every
article. All 22 cases filed so far get their emblem.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `.claude/costs/sessions/2026-10/cc345901-acbf-5482-83c4-942e78333060.json`:18 — unresolved — last: @vzakharov (human) 2026-10-21T12:03:07Z — "нене, погоди, artist это про музыканта. давай заменим на mus…" → [↓](#t01)

<a id="t01"></a>

### `.claude/costs/sessions/2026-10/cc345901-acbf-5482-83c4-942e78333060.json`:18 — unresolved

```diff
@@ -0,0 +1,102 @@
… 14 lines elided …
+      {
+        "hours": 10.0,
+        "grade": "senior",
+        "role": "artist",
```

**@vzakharov (human)** — 2026-10-21T12:03:07Z

нене, погоди, artist это про музыканта. давай заменим на musician всё что было до сих пор чтобы избежать путаницы (в том числе на ветке с костами), а здесь используем designer

---

## Timeline (status, references, and other events)

- **2026-10-22T06:13:51Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/184#pullrequestreview-5599335792.
