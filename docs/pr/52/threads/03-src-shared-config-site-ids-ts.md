# `src/shared/config/site-ids.ts`

<a id="t04"></a>

### `src/shared/config/site-ids.ts`:34 — unresolved

```diff
@@ -0,0 +1,35 @@
… 22 lines elided …
+ * chunk — the ~90 kB `shared/i18n` keeps behind its server-only barrel.
+ */
+export function resolveSiteId(): SiteId {
+  const site = SITE_IDS.find((id) => id === process.env.NEXT_PUBLIC_SITE);
+
+  if (site === undefined) {
+    throw new Error(
+      `NEXT_PUBLIC_SITE must be one of ${SITE_IDS.join(', ')}, not ${String(process.env.NEXT_PUBLIC_SITE)}`,
+    );
+  }
+
+  return site;
```

**@vzakharov (human)** — 2026-09-16T23:22:35Z

z.enum & parse?

---
