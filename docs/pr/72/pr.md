# PR #72: refactor: render article bodies as a hast tree, not an HTML string

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/72
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/content-tree-render-nc7z48
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-19T09:45:02Z
- **Updated:** 2026-09-19T12:14:33Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- `ArticleBody` injected the pipeline's output with `dangerouslySetInnerHTML`, which put a hard ceiling on the content pipeline: a string cannot hold a React element, so **no part of an article could ever be a client island** — no copy button on a code fence, no lightbox, no zoomable diagram. The pipeline now stops one step earlier (`run` rather than `process`, with no compiler) and hands its hast tree to React through `hast-util-to-jsx-runtime` under a component map. Everything ahead of that step is unchanged: same plugins, same order, same pass collecting the title, outline and reading estimate.
- **`rehype-media-embeds` is the map's first user.** It built a `<video>`, its fallback and the print-only note by hand in 139 lines; it now emits one marker element carrying the URL and label, and `ContentVideo` draws all three. The marker tag name is one exported constant, so the plugin and the map agree by import rather than by matching strings.
- **The rendered markup is unchanged where it matters.** The longest article renders 2,172 tags before and after with identical classes, hrefs, ids, alt text and Shiki inline styles; the differences are React's escaping (`'` → `&#x27;`), its self-closing void elements (`<hr>` → `<hr/>`) and its boolean attributes (`controls` → `controls=""`). A second article diffs to zero. All six document PDFs across both sites re-render **byte-identical**, so only the two manifests move.
- **The payload cost came in above the plan's budget** — see the note below, which is the one thing here worth a decision rather than a read.

## The payload number, measured

The plan budgeted **~1.2 kB gzip** on the largest article and asked for that to be checked against a real build rather than the estimate. Built both ways on this branch:

| | before | after | delta |
| --- | --- | --- | --- |
| `case-studies/playgram.html`, gzip | 68,243 | 72,587 | **+4,344 (+6.4%)** |
| …its inlined RSC flight, gzip | 36,948 | 40,948 | +4,000 |
| …its body markup, gzip | 28,013 | 28,217 | +204 |
| both sites, all `.html` + `.txt`, gzip | 1,072,505 | 1,105,881 | +33,376 (+3.1%) |

**The miss is in the compression rate, not the byte count.** The plan predicted the body's raw growth almost exactly (+28.5 kB forecast, +30.2 kB measured) but assumed those added bytes would compress at ~4%; they compress at ~15%. The growth lands on the flight payload — 92% of it — because that is where the body-as-a-string became a body-as-a-tree, and a tree's extra bytes are repetitive but not free.

Worst relative case is `bible/web-not-cli.html` at +21%; pages with no article body move by ±4 bytes. Nothing here blocks the change, but "close to noise on the wire" is weaker than the plan claimed, so it is the operator's call rather than mine.

## One open decision: `jsx-a11y/media-has-caption`

Moving the video from hast into JSX made it visible to ESLint for the first time, and the rule fires: `<video>` wants a `<track kind="captions">`. **The branch currently carries this one lint error** — CLAUDE.md forbids adding a suppression without an explicit go-ahead, so it is left standing rather than silenced.

The demo video has exactly one track and it is video — no audio at all, so there is nothing to caption and WCAG 1.2.2 does not apply. Two honest routes:

1. **A point-of-use suppression** with that rationale. Keeps today's rendering exactly as it is, which is what the parity above rests on. _Recommended._
2. **`muted` on the player**, which the rule accepts as an exemption. Needs no suppression, but changes what a reader sees — the player gains a muted-speaker state — so it is a product decision, not a lint fix.

## QA Checklist

Mechanical checks already run on this branch are noted in the table; the items below are still the reviewer's to walk, since none of them settles "does it look right".

- [ ] `article-render` — open `/case-studies/playgram` in both themes and confirm prose, code fences, images, aside images, pull quotes, tables and Mermaid diagrams look as they do in production
- [ ] `code-theme` — toggle light/dark on a page with a code fence and confirm Shiki's colours still switch
- [ ] `toc-anchors` — click entries in the table of contents and confirm each scrolls to its heading
- [ ] `video-embed` — open `/case-studies/playgram`, confirm the player works, then print-preview it and confirm the "See video at …" note stands in its place
- [ ] `raw-html` — confirm the raw `<img>` and `<br>` playgram authors still render
- [ ] `payload` — decide whether +4.4 kB gzip on the largest article is acceptable, per the table above
- [ ] `caption-rule` — pick route 1 or 2 above so the branch can pass lint

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `article-render` | manual-only | — | Only a human eye settles "looks right"; the tag skeleton is verified identical (2,172 tags) |
| `code-theme` | e2e | ❌ | Assert both `--shiki-light` and `--shiki-dark` survive on a token span; 370 are present in the build |
| `toc-anchors` | e2e | ❌ | Walk every in-page `href="#…"` and assert the id exists — 79/79 resolve across 6 article pages today |
| `video-embed` | e2e | ❌ | Assert the player element and the print-only note both exist; both verified present in the built HTML |
| `raw-html` | integration | ❌ | A build over a fixture document authoring raw HTML is the whole test; playgram already is one |
| `payload` | unit | ❌ | A size budget over `out/` would catch a regression no other check sees — and would have caught this one |
| `caption-rule` | — | — | A decision, not a test |

`pnpm build` is this repo's stand-in for app tests (CLAUDE.md § "Testing"), so every ❌ above is a genuine gap rather than a missing run. `payload` is the one worth filing: the budget it would enforce is exactly the number this PR overshot.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01M6LpSXTe8GPv4xxFAF18wL

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-19T09:45:38Z — "Proposed squash title/body: ``` refactor: render article bod…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-19T09:45:38Z

[https://github.com/vzakharov/vovazakharov.com/pull/72#issuecomment-5740843008](https://github.com/vzakharov/vovazakharov.com/pull/72#issuecomment-5740843008)

Proposed squash title/body:

```
refactor: render article bodies as a hast tree, not an HTML string (pr #72)
```

```
The content pipeline could only ever emit markup, because an article
reached the page as an HTML string injected with
dangerouslySetInnerHTML. A string cannot hold a React element, so no
part of a document could be a client island — a copy button on a code
fence, a lightbox on an image, a diagram worth zooming were all out of
reach however the pipeline was extended.

The pipeline now stops one step earlier and hands its hast tree to
React through hast-util-to-jsx-runtime, under a component map.
Everything ahead of that step is unchanged: the same plugins in the
same order, and the same pass collecting the title, the outline and
the reading estimate. rehype-media-embeds is the map's first user —
it emits a marker node, and a ContentVideo component draws the player
and its print-only note in place of the markup the plugin used to
build by hand.

Rendering a tree rather than a string costs 4.3 kB gzip on the longest
article and 3.1% across both sites, measured by building each way
rather than modelling it. The added bytes land almost entirely in the
inlined RSC flight copy, where they compress at about 15% rather than
the 4% an estimate from the body alone predicted; GitHub Pages serves
gzip and not brotli, so that is the figure that ships. Every document
PDF re-renders byte-identical, the pipeline being part of what
render-pdf.ts hashes into their manifests, so only the manifests move.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `.claude/rules/content.md`:20 — unresolved — last: @vzakharov (human) 2026-09-19T11:57:31Z — "> rather than stringifying it медведь" → [↓](#t01)
- **T02** `.claude/rules/content.md`:111 — unresolved — last: @vzakharov (human) 2026-09-19T11:59:30Z — "поясни, что это и зачем" → [↓](#t02)
- **T03** `.claude/rules/content.md`:112 — unresolved — last: @vzakharov (human) 2026-09-19T11:59:51Z — "и это тоже" → [↓](#t03)
- **T04** `src/shared/content/plugins/rehype-media-embeds.ts`:64 — unresolved — last: @vzakharov (human) 2026-09-19T12:09:40Z — "хм, что-то мне не оч идея придумывать собственные теги, а по…" → [↓](#t04)
- **T05** `src/shared/content/markers.ts`:5 — unresolved — last: @vzakharov (human) 2026-09-19T12:11:34Z — "в дополнение к прошлому комменту, также бы избавило вот от э…" → [↓](#t05)
- **T06** `src/shared/content/plugins/rehype-media-embeds.ts`:1 — unresolved — last: @vzakharov (human) 2026-09-19T12:14:08Z — "раз мы уже здесь, посмотри, а DRY ли между собой все наши ра…" → [↓](#t06)

<a id="t01"></a>

### `.claude/rules/content.md`:20 — unresolved

```diff
@@ -17,7 +17,7 @@ paths:
… 1 line elided …
 # Content
 
-Long-form writing lives as markdown under a site's `public/<collection>/` — `apps/vova/public/case-studies/` and `apps/lsa/public/bible/` — and `next build` compiles it to HTML once per deploy. The p…
+Long-form writing lives as markdown under a site's `public/<collection>/` — `apps/vova/public/case-studies/` and `apps/lsa/public/bible/` — and `next build` renders it once per deploy. The pipeline stops at the hast tree and hands it to React through `hast-util-to-jsx-runtime`, rather than stringifying it; `ArticleBody` is where that happens. The paths below are written from the app directory, which is where every build and every render script is entered.
```

**@vzakharov (human)** — 2026-09-19T11:57:31Z

>  rather than stringifying it

медведь

---

<a id="t02"></a>

### `.claude/rules/content.md`:111 — unresolved

```diff
@@ -107,7 +107,9 @@ The exceptions are `shared/content/content-hash.ts`, `mermaid-renders.ts` and `c
… 2 lines elided …
 - **A broken image reference fails the build.** Dimensions are read out of the file's own header, so a `src` that resolves to nothing throws rather than shipping.
-- **Raw HTML in a document passes through unsanitized.** First-party content only — reviewed in the same PR as the code. Nothing on this site is user-submitted; if that ever changes, this is the line…
+- **Raw HTML in a document passes through unsanitized.** `rehypeRaw` parses it into real elements, so an author's markup reaches the page as itself. First-party content only — reviewed in the same PR…
+- **A marker tag nothing maps renders as an empty custom element, and the build still exits 0.** A plugin emitting one of `markers.ts`'s tag names needs the matching entry in `CONTENT_COMPONENTS` (`article-body.tsx`); without it the tag reaches the page with its content gone.
```

**@vzakharov (human)** — 2026-09-19T11:59:30Z

поясни, что это и зачем

---

<a id="t03"></a>

### `.claude/rules/content.md`:112 — unresolved

```diff
@@ -107,7 +107,9 @@ The exceptions are `shared/content/content-hash.ts`, `mermaid-renders.ts` and `c
… 3 lines elided …
-- **Raw HTML in a document passes through unsanitized.** First-party content only — reviewed in the same PR as the code. Nothing on this site is user-submitted; if that ever changes, this is the line…
+- **Raw HTML in a document passes through unsanitized.** `rehypeRaw` parses it into real elements, so an author's markup reaches the page as itself. First-party content only — reviewed in the same PR…
+- **A marker tag nothing maps renders as an empty custom element, and the build still exits 0.** A plugin emitting one of `markers.ts`'s tag names needs the matching entry in `CONTENT_COMPONENTS` (`a…
+- **The component a marker renders lives in `pages/documents/ui/`.** `shared/content` is `server-only` by construction, so a client island could never live there — the marker names are the pipeline's, the components page composition.
```

**@vzakharov (human)** — 2026-09-19T11:59:51Z

и это тоже

---

<a id="t04"></a>

### `src/shared/content/plugins/rehype-media-embeds.ts`:64 — unresolved

```diff
@@ -43,96 +42,28 @@ function soleElementChild(node: Element): Element | undefined {
… 94 lines elided …
-      videoElement(href, hastText(link).trim()),
-      printedVideoNote(href),
-    );
+    parent.children.splice(index, 1, {
+      type: 'element',
+      tagName: CONTENT_VIDEO,
+      properties: { src: href, label: hastText(link).trim() },
+      children: [],
+    });
```

**@vzakharov (human)** — 2026-09-19T12:09:40Z

хм, что-то мне не оч идея придумывать собственные теги, а почему просто не использовать тег `<video` здесь? другой набор аттрибутов, или что? кажется, идиоматически-концептуально это было бы то что надо

---

<a id="t05"></a>

### `src/shared/content/markers.ts`:5 — unresolved

```diff
@@ -0,0 +1,7 @@
… 1 line elided …
+
+/**
+ * Tag names a plugin emits for a component to render. They make the tree
+ * invalid HTML, which is safe only because nothing stringifies it.
```

**@vzakharov (human)** — 2026-09-19T12:11:34Z

в дополнение к прошлому комменту, также бы избавило вот от этого "safe only because", от которого глаз немного дёргается

---

<a id="t06"></a>

### `src/shared/content/plugins/rehype-media-embeds.ts`:1 — unresolved

**@vzakharov (human)** — 2026-09-19T12:14:08Z

раз мы уже здесь, посмотри, а DRY ли между собой все наши разные плагины? что-то я кажется вижу там повторяющиеся куски, которые больше похожи на внутреннюю механику, чем реализацию логики. возможно ошибаюсь.

---

## Timeline (status, references, and other events)

- **2026-09-19T11:25:20Z** @vzakharov cross-referenced this pull request from [#74 Every article page ships its body twice: 57% of the HTML is the inlined RSC flight copy](https://github.com/vzakharov/vovazakharov.com/issues/74).
- **2026-09-19T11:54:28Z** @vzakharov renamed from «docs: plan rendering article bodies as a hast tree, not an HTML string» to «refactor: render article bodies as a hast tree, not an HTML string».
- **2026-09-19T12:14:32Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/72#pullrequestreview-5255654095.
