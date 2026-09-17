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

**@vzakharov (agent)** — 2026-09-17T00:51:05Z

Собрал и померил, прежде чем отвечать: `z.enum(SITE_IDS).parse(...)` здесь стоит **+377 kB** клиентского бандла — 754 513 → 1 131 322 байт, то есть плюс половина от всего, — и zod реально появляется в чанках. Причина в цепочке: `cv-sheet.tsx` (`'use client'`) → `cv-urls.ts` → `@/shared/config` → `site-config.ts`, который зовёт `resolveSiteId()` на загрузке модуля.

Так что оставил матч, но докстринг теперь несёт измеренное число вместо утверждения — чтобы это не пересматривали по интуиции. Матч читает те же `SITE_IDS` как источник правды и так же бросает, так что парс добавил бы зависимость и больше ничего. 4e609c1

**@vzakharov (human)** — 2026-09-17T00:59:19Z

ну значит нам нужно сделать .server-only. модуль или бочку и всё что не должно достичь клиента грузить из неё. Или наоборот .client-safe. и туда только то что можно клиенту. Посмотри playgramai/playgramapp, там есть похожие решения

**@vzakharov (agent)** — 2026-09-17T10:25:31Z

Сделал, и не полумерой: `z.enum(SITE_IDS).safeParse(...)` теперь на месте, а клиентский бандл не вырос ни на байт.

Развилка была в том, что просто повесить `server-only` на `site-config` нельзя — рендер-скрипты идут под `tsx` и под голым Node, а `import 'server-only'` вне React-server-бандла бросает. Поэтому раскол не по «серверное против клиентского», а по тому, что вообще имеет право оказаться в бандле:

- `site-ids.ts` — только данные, лежит во всех бандлах;
- `site-config.ts` — конфиги обоих сайтов как данные, плюс `siteConfig(site)`;
- `resolve-site-id.ts` — чтение `NEXT_PUBLIC_SITE` и схема к нему. Без `server-only`, потому что скрипты импортируют его по пути;
- `resolved-site.ts` — `import 'server-only'`, и всё, что привязано к текущему сайту: `SITE_ID`, `SITE_CONFIG`, `pageFile`, `printedUrl`, `getAbsoluteUrl`, `BUILD_YEAR`. Наружу — через `index.server-only.ts`.

`@/shared/seo` раскололся по тому же признаку: `OG_CARD_SUFFIX` — константа, которую может читать кто угодно, `constructMetadata` уехал за барьер.

Трое клиентских читателей съехали с конфига. `SiteAvatar` берёт сайт пропсами — он лежит в бочке `@/shared/ui`, которую импортируют клиентские компоненты, так что тянул за собой всё; `cvPdfFile` уехал в `cv-files.ts`, и страница передаёт готовый файл вниз, как уже передавала ссылку на кейс-стади; `cv-card.ts` берёт сайт из `RENDERED_SITE` самого прогона.

Замер после: **754 342** байта клиентского JS на vova — против 754 513 до zod и 1 131 322 с ним, — и zod не встречается ни в одном чанке ни одного из двух сайтов.

В `playgramai/playgramapp` заглянуть не получилось: сессия привязана к репозиториям одного владельца, и `add_repo` отказался добавлять чужого («cross-tier adds are not supported»). Если там решение устроено иначе — кинь ссылку или кусок, переделаю под него.

e61b0fb, 4a10066

**@vzakharov (human)** — 2026-09-17T11:57:53Z

у тебя есть шимнутый gh, перепроверь на всякий случай

---
