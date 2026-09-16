# PR #49: fix: #47 print the CV's links absolute, and keep unchanged PDF bytes

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/49
- **Author:** @vzakharov (human)
- **Base ← Head:** main ← claude/cv-pdfs-dev-server-ts0anb
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-16T08:02:07Z
- **Updated:** 2026-09-16T21:59:54Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **The CV's printed links pointed at the machine that rendered them.** All four
  committed CV PDFs carried `http://localhost:41593/` and
  `http://localhost:41593/case-studies/playgram` — the printed link's _text_ was
  absolutized while its _href_ stayed relative, so Chromium resolved it against
  the dev server. Both call sites now take `printedUrl()`, the helper that
  already returns the absolute href alongside the scheme-less text and already
  serves `rehype-media-embeds` and `printed-from`. Every link annotation keeps
  its exact `/Rect`, so the printed page is unchanged and only the targets moved.
- **`InternalLink` renders a link once per medium, and screen routing is
  untouched.** It renders a `print-hidden` anchor on the relative href
  `next/link` needs for a client-side route and a print-only `Anchor` on the
  absolute one paper needs; a call site names the address once and says only
  whether paper also spells it out. Every internal link gets the pair, because
  every one carries that relative href and any page can be printed — an external
  link needs none, being absolute already. `InternalButton` is the one
  exception, a button being something to press. All four PDFs re-render
  byte-identical across the change, and all seven come back `kept`, so no
  printed page moved. `pick()` joins `shared/lib/collections` beside
  `class-names` — `vova/no-redundant-property-copy` names it as the remedy and
  nothing here provided one.
- **A re-render no longer rewrites a PDF for nothing.** `render-pdf.ts` compares
  a fresh render against the committed file with the two things the renderer
  never settles discounted — `/CreationDate` and `/ModDate`, and the names
  Chromium gives a tagged PDF's structure-tree nodes — and keeps the committed
  bytes on a match. Since staleness is decided by hashing sources, any edit under
  `src/shared/config` or `src/shared/ui` re-flags all seven PDFs; the run's
  output is now always safe to commit rather than needing a byte diff read by
  hand to decide whether to keep the old files.
- **`cv.website` is gone from the message catalogue** (`/dry`'s find). Routing
  the case-study line through `printedUrl()` left it with one consumer, and it
  spelled `vovazakharov.com` a third time beside `SITE_CONFIG.url` — three homes
  for one domain, none of which would catch a missed edit.

### On the report that the links work (issue comment)

Seven of the nine link annotations were always fine: email and website on page
1, and GitHub, LinkedIn, X plus the email and website pair in the contact block.
The two broken ones sat where a reader is least likely to test them — the
case-study address on page 2, and the name in the header, drawn
`underline="never"` so it does not read as a link at all. An earlier revision of
this PR explained the report by PDF viewers synthesizing a link from URL-shaped
text. That was a hypothesis, never tested, and it is not needed: the dump of
annotation targets answers the question on its own.

### On the component's name

The fork first shipped as a `PrintableLink` standing beside `InternalLink`,
which reads as though printability were a property some links opt into. Review
asked which links are _not_ printable; none are, so the fork went inside
`InternalLink` and the second component went away. `InternalButton` keeps no
printed half — a button is something to press — and is `print-hidden` now
rather than printing a dead control with a relative href.

### On the structure-tree nodes

The guard shipped here first covered only the clock, which was enough for the CV
— those PDFs carry no structure tree — and left both case-study PDFs churning on
every run. Chromium numbers a tagged PDF's accessibility nodes from a counter
that does not settle between runs: one unchanged page prints `node00000140` on
one render, `node00000141` on the next, and `node00000339` on the first request a
freshly booted dev server compiles. Warming each route before printing it was
tried and does not fix it — two warm renders of one page still disagree. So the
comparison renames each node by the order it first appears, which drops the
counter and keeps every alias. `sameRender` moved to `scripts/lib/` to get a unit
test, the script around it rendering on import.

## QA Checklist

- [ ] `pdf-links` — open `apps/vova/public/cv/cto/en.pdf` and click the name in
      the header and the case-study address. Both reach vovazakharov.com; neither
      stalls on a localhost port.
- [ ] `pdf-text` — the printed case-study line still reads
      `Playgram case study: vovazakharov.com/case-studies/playgram`, and the
      header still shows the name and `vovazakharov.com` with no trailing slash.
- [ ] `screen-cv` — on `/cv/cto/en`, clicking the name in the header routes home
      client-side (no full page load), the footer's "back" link does the same,
      and the case-study link still routes in-app. The name appears once, not
      twice.
- [ ] `ru-cv` — the same two checks on `/cv/cto/ru`, whose catalogue lost the
      same key.
- [ ] `render-idempotence` — touch a comment under `src/shared/ui`, run
      `pnpm content:pdf`, and confirm it logs `kept …` for all seven PDFs and
      leaves `git status` showing only the manifests.
- [ ] `render-change` — make a real printed-page change, run `pnpm content:pdf`,
      and confirm it logs `rendered …` and the PDF actually changes.

| Item                 | Automatable | Covered? | Notes                                                                                                                                       |
| -------------------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `pdf-links`          | integration | ❌       | Assert no `/URI (http://localhost` survives in any committed PDF — a grep over `apps/*/public/**/*.pdf`, cheap enough to sit in `pnpm test` |
| `pdf-text`           | manual-only | —        | The rendered glyphs are in a subsetted font; the annotation `/Rect`s being unchanged is the machine-checkable half and was verified         |
| `screen-cv`          | e2e         | ❌       | Needs a browser against the built export; no e2e layer exists in this repo yet                                                              |
| `ru-cv`              | e2e         | ❌       | Same                                                                                                                                        |
| `render-idempotence` | integration | ✅       | `scripts/lib/same-render.test.ts` covers the comparator over fixture pairs — the clock, the node base, and the changes it must not forgive  |
| `render-change`      | manual-only | —        | Needs a real Chromium render to be meaningful end to end; the comparator's half is the test above                                           |

Fixes #47

https://claude.ai/code/session_01GUk4rjaHxGpH6kH8hDgrpy

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-16T08:02:37Z — "Proposed squash title/body: ``` fix: #47 the CV PDFs' dead l…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-16T08:02:37Z

[https://github.com/vzakharov/vovazakharov.com/pull/49#issuecomment-5694109118](https://github.com/vzakharov/vovazakharov.com/pull/49#issuecomment-5694109118)

Proposed squash title/body:

```
fix: #47 the CV PDFs' dead links, and the churn a re-render left (pr #49)
```

```
All four committed CV PDFs pointed at the machine that printed
them: `http://localhost:41593/` for the name in the header, and
the same port for the case-study address. The printed link's text
was absolutized and its href was not, so Chromium resolved the
href against the dev server the render ran on.

`InternalLink` now renders a link once per medium: a
`print-hidden` anchor on the relative href `next/link` needs for a
client-side route, and a print-only one on `printedUrl()`, which
already returns the absolute href beside its scheme-less display
text. Every internal link gets the pair, since every one carries
that relative href and any page can be printed; an external link
needs none. A call site names the address once and says only
whether paper also spells it out. Every annotation keeps its exact
rectangle and all four files re-render byte-identical, so the
printed page is unchanged and only the targets moved. The
catalogue's `cv.website` goes too — the case-study line was its
second consumer, and it spelled the domain a third time beside
`SITE_CONFIG.url`.

Separately, `render-pdf.ts` keeps the committed bytes when a fresh
render differs from them only in what the renderer never settles:
`/CreationDate` and `/ModDate`, and the names Chromium gives a
tagged PDF's structure-tree nodes, which come off a counter that
moves between runs. Staleness is still decided by hashing sources,
so an edit anywhere under `src/shared/config` or `src/shared/ui`
re-flags all seven PDFs whether or not a printed page moved; the
run's output is now always safe to commit, instead of needing a
byte diff read by hand to decide whether to keep the old files.

Fixes #47

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `src/pages/cv/ui/case-study-link.tsx`:36 — resolved — last: @vzakharov (agent) 2026-09-16T09:06:47Z — "Нет — здесь на экране ничего не поменялось. В этом файле ссы…" → [threads/01-src-pages-cv-ui-case-study-link-tsx.md](threads/01-src-pages-cv-ui-case-study-link-tsx.md#t01)
- **T02** `src/pages/cv/ui/cv-sheet.tsx`:78 — unresolved — last: @vzakharov (agent) 2026-09-16T09:06:48Z — "Здесь — да, и это была настоящая регрессия. Поправил в 14820…" → [threads/02-src-pages-cv-ui-cv-sheet-tsx.md](threads/02-src-pages-cv-ui-cv-sheet-tsx.md#t02)
- **T03** `src/pages/cv/ui/case-study-link.tsx`:35 — resolved — last: @vzakharov (agent) 2026-09-16T09:54:15Z — "Взял дословно из `src/shared/collections/collections.ts` при…" → [threads/01-src-pages-cv-ui-case-study-link-tsx.md](threads/01-src-pages-cv-ui-case-study-link-tsx.md#t03)
- **T04** `src/pages/cv/ui/cv-sheet.tsx`:93 — resolved — last: @vzakharov (agent) 2026-09-16T11:47:27Z — "Понял правильно, и это вариант 2. Сделано в 6c02db8: вилка п…" → [threads/02-src-pages-cv-ui-cv-sheet-tsx.md](threads/02-src-pages-cv-ui-cv-sheet-tsx.md#t04)
- **T05** `src/shared/lib/collections/collections.ts`:1 — unresolved — last: @vzakharov (agent) 2026-09-16T11:47:28Z — "Переименовал — `@/shared/lib/collections`, 6c02db8. Аргумент…" → [threads/03-src-shared-lib-collections-collections-ts.md](threads/03-src-shared-lib-collections-collections-ts.md#t05)
- **T06** `.claude/rules/fsd.md`:38 — unresolved — last: @vzakharov (human) 2026-09-16T21:58:51Z — "что-то я не до конца понимаю, вот у меня shared/lib из playg…" → [threads/04-claude-rules-fsd-md.md](threads/04-claude-rules-fsd-md.md#t06)

## Timeline (status, references, and other events)

- **2026-09-16T08:14:27Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/49#pullrequestreview-5220196829.
- **2026-09-16T09:19:41Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/49#pullrequestreview-5220755618.
- **2026-09-16T11:33:14Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/49#pullrequestreview-5222056982.
- **2026-09-16T21:59:54Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/49#pullrequestreview-5228785877.
