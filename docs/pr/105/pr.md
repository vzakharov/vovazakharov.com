# PR #105: fix: every link goes through TextLink and takes its text's size

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/105
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/source-list-font-size-mshhjk
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-05T08:20:36Z
- **Updated:** 2026-10-05T08:52:19Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- An article's **Sources** list set each source's title — and its "archived" link — at 16px, against the 14px of the author, outlet and date around it (16px against 13.3px in print). Same cause as #102: a Mantine `Anchor` states its own `font-size`, and those two raw `Anchor`s lacked the `inherit` fourteen others carried by hand.
- So the trap is closed rather than patched: `InternalLink` becomes **`TextLink`** and serves every link. A site-root `href` still gets its screen and paper halves; an absolute or `mailto:` one renders a single anchor; `newTab` sets the `target`/`rel` pair nine callers spelled out. Size inherits unless a `size` is given, as before.
- `@typescript-eslint/no-restricted-imports` rejects `Anchor` from `@mantine/core` everywhere except `TextLink` and `FileLink` (a site-root file to save, which wants neither `next/link` nor a printed half).
- Measured in headless Chromium — every visible link's font-size against its parent's, screen and print, plus `target`/`rel` — on `/`, `/cv`, `/music/birdie`, `/case-studies/playgram` and two basilisk cases: the report is identical before and after the refactor. The only links off their parent's size are the ones with an explicit `size="sm"` (back links, `.md`/`.pdf`, a song's "source") and the printed footer's address, sized by `.printedFrom *`.

## QA Checklist

- [ ] `sources` — Open a basilisk.fyi case with sources (e.g. `/cases/figure-02-molten-steel`), scroll to **Sources**: each linked title, and "(archived)" on `/cases/torture-chamber`, is the same size as the author, outlet and date beside it — on screen and in print.
- [ ] `new-tab` — On the home page, the GitHub/LinkedIn/X/Substack contacts, the "Same pattern, earlier" projects and Glitchporn open in a new tab; the email link does not.
- [ ] `cv` — On `/cv`, the profile links open in a new tab; the name in the header still goes home; the printed CV shows the site address and profiles at the size of their lines.
- [ ] `music` — On a song page, "source" opens the repository in a new tab; a lyrics note's link (where a song has one) opens in a new tab at the note's size.
- [ ] `printed-footer` — Print any article: the footer's address and © line are the same small monospace as before.
- [ ] `lint` — Add `import { Anchor } from '@mantine/core'` to any page component: `pnpm lint` fails, naming `TextLink`.

| Item             | Automatable | Covered? | Notes                                                                              |
| ---------------- | ----------- | -------- | ---------------------------------------------------------------------------------- |
| `sources`        | e2e         | ❌       | Built page: each `a`'s computed `font-size` equals its parent's, screen and print  |
| `new-tab`        | e2e         | ❌       | Assert `target="_blank"` + `rel` on the external profile links, absent on `mailto:` |
| `cv`             | e2e         | ❌       | Same size and `target` assertions on `/cv`                                         |
| `music`          | e2e         | ❌       | Same `target` assertion on a song page                                             |
| `printed-footer` | manual-only | —        | Visual match of the printed footer against the previous PDF                        |
| `lint`           | integration | ❌       | Lint a fixture importing `Anchor` and assert the restriction fires                 |

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_017YSDz9hH95s2RWyaMG2uuv

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-05T08:20:55Z — "Proposed squash title/body: ``` fix: every link goes through…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-05T08:20:55Z

[https://github.com/vzakharov/vovazakharov.com/pull/105#issuecomment-5990767050](https://github.com/vzakharov/vovazakharov.com/pull/105#issuecomment-5990767050)

Proposed squash title/body:

```
fix: every link goes through TextLink and takes its text's size (pr #105)
```

```
An article's Sources list set each source's linked title, and its
"archived" link, at 16px against the 14px of the author, outlet and
date around it, and against 13.3px in print. A Mantine Anchor states
its own font-size, and every link in running text had to remember
`inherit` by hand; these two were the second in a day that forgot.

InternalLink becomes TextLink and serves every link. It takes the
surrounding size unless given a `size`; a site-root `href` still gets
its screen and paper halves, an absolute or `mailto:` one renders a
single anchor, and `newTab` sets the `target`/`rel` pair.

`@typescript-eslint/no-restricted-imports` rejects `Anchor` from
`@mantine/core` everywhere but the two links built on it, TextLink and
FileLink, so a bare Anchor can no longer reach a page.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `src/shared/ui/text-link.tsx`:29 — unresolved — last: @vzakharov (human) 2026-10-05T08:51:45Z — "а у нас когда-то бывает, чтобы внешние открывались не в newT…" → [↓](#t01)
- **T02** `src/shared/ui/text-link.tsx`:119 — unresolved — last: @vzakharov (human) 2026-10-05T08:52:07Z — "это теперь тут малость не к месту, наверное стоит выделить" → [↓](#t02)

<a id="t01"></a>

### `src/shared/ui/text-link.tsx`:29 — unresolved

```diff
@@ -25,16 +25,21 @@ export type InternalLinkProps = Anchored &
      * don't say where it goes — a printed page can only be followed by hand.
      */
     withAddress?: boolean;
+    /** Opens beside the page rather than over it, without handing it `window.opener`. */
+    newTab?: boolean;
```

**@vzakharov (human)** — 2026-10-05T08:51:45Z

а у нас когда-то бывает, чтобы внешние открывались не в newTab? а внутренние, соответственно, в нём?

---

<a id="t02"></a>

### `src/shared/ui/text-link.tsx`:119 — unresolved

```diff
@@ -97,8 +112,9 @@ export function InternalLink({
… 6 lines elided …
+ * with no printed half: a button is something to press, and paper takes no
+ * press.
  */
 export function InternalButton({
```

**@vzakharov (human)** — 2026-10-05T08:52:07Z

это теперь тут малость не к месту, наверное стоит выделить

---

## Timeline (status, references, and other events)

- **2026-10-05T08:41:13Z** @vzakharov renamed from «fix: source links take the surrounding text's size» to «fix: every link goes through TextLink and takes its text's size».
- **2026-10-05T08:52:19Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/105#pullrequestreview-5412092531.
