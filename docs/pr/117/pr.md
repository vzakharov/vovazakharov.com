# PR #117: refactor: make the way home the site footer's default note

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/117
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/dry-site-footer
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-07T08:53:40Z
- **Updated:** 2026-10-07T09:14:43Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 1

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `src/pages/basilisk-home/ui/basilisk-home-page.tsx`:117 — unresolved — last: @vzakharov (human) 2026-10-07T09:14:59Z — "более понятно назвать проп?" → [↓](#t01)

---

## Body

## Summary

- `<SiteFooter><BackToHome /></SiteFooter>` repeated on five inner pages, twice with the locale threaded through by hand. The way home is now `SiteFooter`'s default note, with an optional `locale` and a shared `ui.backToHome` label, so an inner page writes `<SiteFooter />`. `BackToHome`, left with no other caller, folds into the footer.
- Home pages keep their own notes; a `home` prop marks the site root so the LSA home, which has no note, doesn't link to itself.
- The footer stays page-composed rather than moving into a layout: a layout hears nothing from its page under a static export, `/music`'s layout sits above the locale, and a layout-rendered footer would leave the article page's wider column.
- Ride-along: `/plan`'s handoff offers a go-ahead in the planning session beside a fresh one, since the context budget hook relays a session that runs long.

## QA Checklist

- [ ] `article-footer` — an article page (e.g. `/case-studies/…`) ends with "← Home" and the byline, as before
- [ ] `music-ru` — `/music` in `ru` shows "← На главную" and the RSS link; a song page shows the localized label
- [ ] `homes` — the vova, Bible and basilisk homes keep their own notes; the LSA home shows no "← Home"
- [ ] `build` — every site builds

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `article-footer` | yes (Playwright) | no | `/preview` |
| `music-ru` | yes (Playwright) | no | `/preview` |
| `homes` | yes (Playwright) | no | `/preview` |
| `build` | yes | `vet.sh` | |

https://claude.ai/code/session_01GB6XLQcjnDLD71HTRidQ1Q

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-07T08:53:53Z — "Proposed squash title/body: ``` refactor: make the way home…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-07T08:53:53Z

[https://github.com/vzakharov/vovazakharov.com/pull/117#issuecomment-6034469526](https://github.com/vzakharov/vovazakharov.com/pull/117#issuecomment-6034469526)

Proposed squash title/body:

```
refactor: make the way home the site footer's default note (pr #117)
```

```
Five inner pages ended with the same <SiteFooter><BackToHome />
</SiteFooter>, two of them threading the locale through by hand to
localize the label.

SiteFooter now renders the way home when a page hands it no note, and
takes an optional locale to say it in; the label moves from
music.backToHome to the shared ui.backToHome key, and BackToHome folds
into the footer. Home pages keep their own notes and pass `home`, so
the LSA home, which has none, does not link to itself.

The plan handoff offers a go-ahead in the planning session beside a
fresh one, since the context budget hook relays a session that runs
long.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `src/pages/basilisk-home/ui/basilisk-home-page.tsx`:117 — unresolved — last: @vzakharov (human) 2026-10-07T09:14:59Z — "более понятно назвать проп?" → [↓](#t01)

<a id="t01"></a>

### `src/pages/basilisk-home/ui/basilisk-home-page.tsx`:117 — unresolved

```diff
@@ -114,7 +114,7 @@ export async function BasiliskHomePage() {
… 1 line elided …
         </Stack>
 
-        <SiteFooter feed={findFeed(SITE_ID, 'basilisk-cases').route}>
+        <SiteFooter home feed={findFeed(SITE_ID, 'basilisk-cases').route}>
```

**@vzakharov (human)** — 2026-10-07T09:14:59Z

более понятно назвать проп?

---

## Timeline (status, references, and other events)

- **2026-10-07T09:06:54Z** @vzakharov renamed from «docs: plan a DRY site footer» to «refactor: make the way home the site footer's default note».
- **2026-10-07T09:15:46Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/117#pullrequestreview-5440164056.
