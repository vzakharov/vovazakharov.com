# `.claude/rules/content.md`

<a id="t01"></a>

### `.claude/rules/content.md`:73 — unresolved

```diff
@@ -69,6 +69,8 @@ The exceptions are `shared/content/content-hash.ts`, `mermaid-renders.ts` and `c
 
    **There is no `title` field** — the title is the document's leading `# ` heading, which the pipeline lifts out of the body and into the page header. Word count, reading time and the heading outline are derived the same way. Anything derivable is never restated in frontmatter.
 
+   **A song is the exception, and states its `name`.** A song's title is what the player bar shows as `Name — Project` and what the track list sorts, so deriving it would mean parsing prose to render a control. A song body therefore opens without a `# `, and the page puts `name` in the `<h1>` — the same header slot a case study's lifted heading fills, so the two collections read alike and differ only in where the title came from.
+
```

**@vzakharov (human)** — 2026-09-17T12:07:31Z

хм, на самом деле, кажется, засунуть title во frontmatter и вставлять в h1 -- тоже норм решение. (И да, я не против называть это для песни тоже Title, чтобы не было ещё и дихотомии title vs name.)

---
