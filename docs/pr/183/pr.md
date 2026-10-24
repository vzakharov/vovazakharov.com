# PR #183: refactor: #170 each app owns its message catalogue

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/183
- **Author:** @vzakharov (human)
- **Base ← Head:** claude/multi-app-sliced-design-7bn3oq ← masd/i18n-catalogue
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-21T10:20:03Z
- **Updated:** 2026-10-24T10:25:47Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `src/music/shared/i18n/index.ts`:8 — unresolved — last: @vzakharov (human) 2026-10-24T10:25:44Z — "думаю, стоит ли называть экспортируемую штуку в каждом аппе…" → [↓](#t01)

---

## Body

## Summary

- **Each app owns its message catalogue.** `kernel/shared/i18n` held every app's strings, so a kernel module knew all of its consumers. Now each app has `src/<app>/shared/i18n/messages/{en,ru}.json` behind a loader built with kernel's `catalogue()`: `shellMessages` (the theme toggle and the footer's home link), `musicMessages` (what was the `music` namespace), `vovaMessages` (the CV, the 404, the CV's variant labels). kernel keeps locales, routing, the request config and `MESSAGE_MARKDOWN`.
- **A page loads only the catalogues of the apps it renders**, by import. `ThemeCorner` reads shell's catalogue instead of `getTranslations('ui')`, so the request config carries no messages and next-intl registers the locale alone — its `Messages` type is one global, which could check a single site's catalogue at most.
- **A feed's description is its source's.** kernel's `feeds.ts` read music's `metaDescription` by name; now `FeedSource.description` supplies it (`SONG_FEED` does), else the site's tagline, and `Feed` carries none.
- **What follows the move**: vova's `render-pdf.ts` hashes vova's catalogue for the CV's PDFs, and the translate-on-the-server advice in `check-i18n-payload.ts`, the next-intl import ban, `no-hardcoded-strings` and `.claude/rules/i18n.md` points at an app's own catalogue.

## QA Checklist

- [ ] `vet` — `./scripts/vet.sh` passes: all four sites build, lint, `check:masd`, `check:i18n-payload`, the og `--check`s
- [ ] `feeds` — the built `music/songs/{en,ru}/feed.xml` channel descriptions are music's `metaDescription` in each language, and every other feed carries its site's tagline, as on the elephant's branch
- [ ] `theme` — the theme toggle's label reads "Toggle theme" on every site
- [ ] `cv` — `/cv/cto/ru` renders in Russian with "Ищете разработчика?" linking to the dev framing, and `/cv/dev/en` with "Looking for a CTO?"
- [ ] `not-found` — the 404 renders its copy in both languages, and an old song path still shows the moved-song notice
- [ ] `music` — a song, an album, an artist and the radio page render their labels in both languages

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `vet` | integration | ✅ | `./scripts/vet.sh`, green on this branch before the polish pass |
| `feeds` | e2e | ❌ | Diff the channel descriptions in `out/**/feed.xml` against the base's build; checked by hand for music and the bible |
| `theme` | e2e | ❌ | Assert the label in a built page's HTML |
| `cv` | e2e | ❌ | Assert the variant link's text in the built CV pages |
| `not-found` | manual-only | — | `/preview`; the moved-song notice runs client-side |
| `music` | manual-only | — | `/preview`; `tsc` already checks every key each page reads |

https://claude.ai/code/session_01WRsNLtYCSTgRH7QQK5agxK

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-21T10:21:06Z — "Proposed squash body: ``` Slice 4 of Multi-App Sliced Design…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-21T10:21:06Z

[https://github.com/vzakharov/vovazakharov.com/pull/183#issuecomment-6313629335](https://github.com/vzakharov/vovazakharov.com/pull/183#issuecomment-6313629335)

Proposed squash body:

```
Slice 4 of Multi-App Sliced Design: kernel/shared/i18n held every app's
strings, so a kernel module knew all of its consumers and kernel's feeds
read music's metaDescription by name. Each app now owns its catalogue
in its own shared/i18n segment - shell its theme toggle and footer
link, music what was the music namespace, vova the CV, the 404 and the
CV's variant labels - behind a loader built with kernel's catalogue(),
whose typing against en fails the check on a key ru lacks.

A page loads only the catalogues of the apps it renders, by import.
ThemeCorner reads shell's catalogue rather than getTranslations, so the
request config carries no messages and next-intl is registered with
the locales alone: its one global Messages type could check a single
site's catalogue at most.

A feed's description is its source's - SONG_FEED supplies music's - and
the site's tagline otherwise, so Feed carries none. The
translate-on-the-server advice in check-i18n-payload, the next-intl
import ban, no-hardcoded-strings and the i18n rule points a translator
at the app's own catalogue.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `src/music/shared/i18n/index.ts`:8 — unresolved — last: @vzakharov (human) 2026-10-24T10:25:44Z — "думаю, стоит ли называть экспортируемую штуку в каждом аппе…" → [↓](#t01)

<a id="t01"></a>

### `src/music/shared/i18n/index.ts`:8 — unresolved

```diff
@@ -0,0 +1,8 @@
… 4 lines elided …
+
+export type MusicMessages = typeof en;
+
+export const musicMessages = catalogue<MusicMessages>({ en, ru });
```

**@vzakharov (human)** — 2026-10-24T10:25:44Z

думаю, стоит ли называть экспортируемую штуку в каждом аппе <...>Messages? по сути, если ты работаешь с ними внутри аппа, это просто "messages", ему не нужно знать что оно "music", там других нет.

А если грузишь где-то, где это важно (например, в vova грузишь и vovaMessages и musicMessages), можно переименовавывать в импорте `as`.

мысли за и против, рекоммендация?

---

## Timeline (status, references, and other events)

- **2026-10-24T10:25:47Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/183#pullrequestreview-5637919971.
