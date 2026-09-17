# `package.json`

<a id="t05"></a>

### `package.json`:23 — resolved

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

**@vzakharov (agent)** — 2026-09-17T00:51:06Z

Сделал: `scripts/in-site.sh <site> <command...>` — один cd, один `NEXT_PUBLIC_SITE`, и через него теперь идут все per-site скрипты, включая `dev:*` и `build:*`.

Заодно он резолвит аргумент, начинающийся на `scripts/`, от корня репозитория, так что в `package.json` больше нет `../../`:

```json
"content:pdf:lsa": "scripts/in-site.sh lsa tsx scripts/render-pdf.ts"
```

4e609c1

---
