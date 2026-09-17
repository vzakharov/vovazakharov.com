# `package.json`

<a id="t05"></a>

### `package.json`:23 — unresolved

```diff
@@ -17,9 +17,10 @@
… 1 line elided …
     "format": "prettier --write .",
     "format:check": "prettier --check .",
-    "content:mermaid": "cd apps/vova && node ../../scripts/render-mermaid.ts",
+    "content:mermaid": "cd apps/vova && NEXT_PUBLIC_SITE=vova node ../../scripts/render-mermaid.ts",
     "content:og": "cd apps/vova && NEXT_PUBLIC_SITE=vova tsx ../../scripts/render-og.ts",
-    "content:pdf": "cd apps/vova && NEXT_PUBLIC_SITE=vova tsx ../../scripts/render-pdf.ts",
+    "content:pdf:vova": "cd apps/vova && NEXT_PUBLIC_SITE=vova tsx ../../scripts/render-pdf.ts",
+    "content:pdf:lsa": "cd apps/lsa && NEXT_PUBLIC_SITE=lsa tsx ../../scripts/render-pdf.ts",
```

**@vzakharov (human)** — 2026-09-16T23:24:24Z

let's create a helper script for "use this website" that does the cd & NEXT_PUBLIC_SITE assignment

---
