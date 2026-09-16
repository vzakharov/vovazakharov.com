# `.claude/rules/fsd.md`

<a id="t06"></a>

### `.claude/rules/fsd.md`:38 — unresolved

```diff
@@ -35,7 +35,7 @@ oversight. Layers are optional; **inventing one costs more than leaving it out**
… 1 line elided …
 - **Public API per slice and per shared segment.** Cross-slice imports go through the target's `index.ts`; reaching into its internals is an error from both checkers. Within a slice, use relative imp…
 - **`index.server-only.ts` is the one other legal entry point**, for what a client bundle must not reach; every module behind it opens with `import 'server-only'`, which is what enforces the split th…
-- **`shared/lib` has no root barrel.** It is addressed one sub-library at a time (`@/shared/lib/class-names`), each with its own `index.ts`. It is the holding area, not the destination: a sub-library…
+- **`shared/lib` has no root barrel.** It is addressed one sub-library at a time (`@/shared/lib/class-names`), each a directory with its own `index.ts` — `boundaries/elements` matches `src/shared/lib/(*)/**`, so the directory is what makes a sub-library an element of its own, and a flat `shared/lib/thing.ts` is an import into segment `lib` with no public API to enter by. It is the holding area, not the destination: a sub-library becomes a top-level segment (`shared/content`) once it has several consumers and a purpose identity of its own, and only a helper too small to name one — `class-names` is a single function — stays under `lib`.
```

**@vzakharov (human)** — 2026-09-16T21:58:51Z

что-то я не до конца понимаю, вот у меня shared/lib из playgramai/playgramapp -- там спокойно живут `shared/lib/thing.ts`, и никто на них не жалуется:

<img width="244" height="365" alt="Image" src="./attachments/e3250e7f-5f90-4b35-a782-106d96c556b0.png" />

или ты о другом?

---
