# PR #73: refactor: a zod-free enum parse, and the apparatus it un-builds

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/73
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/zod-free-enum-parse-hkyus9
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-19T09:48:18Z
- **Updated:** 2026-09-19T12:25:06Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **Three of the five zod uses parsed nothing** — each checked one string against a closed list of literals (`SITE_IDS`, `routing.locales`, `CV_VARIANTS`). A `oneOf`/`isOneOf` helper under `shared/lib` does the same check with a type predicate, deriving the union from the `const` array rather than declaring a second shape.
- **What the dependency cost was architecture, not bytes.** ~90 kB gzipped in any chunk touching zod meant fencing the module that did the check, and `resolveSiteId` being unreachable from a client component is why `shared/config` split three ways, why `SITE_ID` was `server-only`, and — through that — why `InternalLink` stopped deriving paper's copy of its own href and started being handed one. With the weight gone the fences have nothing to hold back: `locale-schema.ts` and `shared/i18n/index.server-only.ts` are deleted, `site.env.unsafe.ts` is `site-env.ts`, and `index.server-only.ts` survives holding `BUILD_YEAR` alone — the one thing there that is server-only for a reason zod never supplied.
- **That un-builds the printed-link apparatus, 8be92aa included.** `InternalLink` derives `printed = printedUrl(href)` again, so `printed`, `noPrintedCopy`, `linkTo`, `printedSite` and the `PerMedium`/`WithPrinted`/`NoPrintedCopy`/`LinkedPerMedium`/`EitherOr` family all go. The seven call sites that stated a medium sit inside `print-hidden` containers, which is what actually keeps them off paper — the fact was being spelled twice, once in CSS and once in props.
- **The ~90 kB saving does not exist, and that is worth saying plainly.** The fences worked: zod was absent from every client chunk before this change and is absent after. Measured gzip, before → after — vova JS 227,016 → 227,175 (+159 B), HTML 268,895 → 269,970 (+1,075 B); lsa JS 211,176 → 212,139 (+963 B), HTML 79,956 → 80,274 (+318 B). The JS grows because `resolved-site.ts` is now in the client graph; the HTML grows because the printed span renders for every link instead of only the ones handed a paper copy. So this buys a smaller API and one fewer dependency edge at a cost of roughly a kilobyte per site, not a saving.
- **Two departures from the plan as written.** `shared/seo` keeps its `index.server-only.ts` split: `pages/cv/lib/cv-urls.ts` reads `OG_CARD_SUFFIX` from `@/shared/seo` and a client component imports that module, so the second barrel is what keeps `constructMetadata` out of the graph following it there — a reason of its own, not zod's. And `shared/i18n` gained no `parseLocale`/`isLocale` wrapper: `localeSchema` had exactly one consumer, which now spells `oneOf(routing.locales, …)` itself, so a wrapper would have had a single call site.

## QA Checklist

- [ ] `bundle-tradeoff` — the numbers above are the call to make: ~1 kB per site in exchange for deleting `linkTo`, two type families, two barrels and two modules. If that trade is wrong, the branch is wrong.
- [ ] `seo-fence` — `shared/seo` keeping its split is right, and the reason given (a client component reaching `@/shared/seo` through `cv-urls.ts`) is the real one.
- [ ] `no-locale-wrapper` — `cv-route-params.ts` calling `oneOf(routing.locales, …)` directly beats a `parseLocale` in `shared/i18n` with one caller.
- [ ] `site-id-client` — `SITE_ID` and `SITE_CONFIG` being readable from a client component is acceptable. The fence was zod's weight, not a design rule, but it did incidentally stop site-specific branching leaking into client code.
- [ ] `printed-links` — open the CV and a Bible article in both themes and check no printed half shows on screen, and that the chip nav, back-links and the case-study link still read right. The build proves the pages render, not that they look right.
- [ ] `pdf-identical` — every PDF re-rendered byte-identical; only the manifest hashes moved. Confirmed by running `pnpm content:pdf:vova` and `pnpm content:pdf:lsa` and reading `git status`.
- [ ] `cv-routes` — `/cv`, `/cv/cto`, `/cv/dev`, `/cv/cto/en`, `/cv/cto/ru` and the `dev` pair all build; a bad segment fails `next build` with a message naming what came in.
- [ ] `checks` — `pnpm build` (both sites), `pnpm typecheck`, `pnpm exec eslint .`, `pnpm format:check`, `pnpm lint:fsd`, `pnpm type-overlap`, `pnpm test` all green in-session; the full `./scripts/vet.sh` run belongs to land prep.

| Item | Automatable | Covered? | Notes |
| --- | --- | --- | --- |
| `bundle-tradeoff` | No | — | The judgement this PR exists to get |
| `seo-fence` | No | — | Design call; the layer checkers pass either way |
| `no-locale-wrapper` | No | — | Departure from the plan's step 3 |
| `site-id-client` | No | — | The plan's open question 2, resolved as recommended |
| `printed-links` | Partly | No | Needs `/preview`; the build only proves the pages render |
| `pdf-identical` | Yes | Yes | `pnpm content:pdf:<site> --check` in `vet.sh` |
| `cv-routes` | Yes | Yes | `generateStaticParams` enumerates them; `pnpm build` renders each |
| `checks` | Yes | Yes | `./scripts/vet.sh` |

https://claude.ai/code/session_01PY9kc5BjYLVRsi5NKgXmJw

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-19T09:49:03Z — "Proposed squash title/body: ``` refactor: a zod-free enum pa…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-19T09:49:03Z

[https://github.com/vzakharov/vovazakharov.com/pull/73#issuecomment-5740858268](https://github.com/vzakharov/vovazakharov.com/pull/73#issuecomment-5740858268)

Proposed squash title/body:

```
refactor: a zod-free enum parse, and the apparatus it un-builds (pr #73)
```

```
Three of the five zod uses in the tree parsed nothing: each checked one
string against a closed list of literals. What the dependency cost was
not bytes but architecture -- zod is ~90 kB gzipped in any chunk that
touches it, so the check was fenced behind `server-only`, and
`resolveSiteId` being unreachable from a client component is why
`shared/config` split three ways, why `SITE_ID` was server-only, and,
through that, why `InternalLink` was handed paper's copy of its own
href rather than deriving it.

`oneOf` and `isOneOf` under `shared/lib` do the check with a type
predicate, deriving the union from the `const` array the ids already
live in. With the weight gone the fences have nothing to hold back:
`shared/i18n`'s schema module and its server-only barrel are deleted,
the `.unsafe.` suffix goes with the warning it carried, the CV
catch-all hand-writes its tuple parse, and `shared/config`'s
server-only barrel is down to `BUILD_YEAR` -- the one export there
fenced for a reason zod never supplied, the module otherwise running
again at hydration and printing the reader's year for the build's.

That un-builds what the fence was propping up. `InternalLink` derives
paper's copy from the same `href` again, so the `printed` and
`noPrintedCopy` props go, and with them `linkTo` and the `PerMedium`,
`WithPrinted`, `NoPrintedCopy`, `LinkedPerMedium` and `EitherOr` types.
A link that reaches no paper is one inside a `print-hidden` container,
which is what kept it off paper all along; the fact had been spelled
twice, once in CSS and once in props.

Measured rather than assumed, the ~90 kB is not a saving: the fences
worked, so zod was absent from every client chunk before this and is
absent after. Both sites grow by about a kilobyte gzipped, the client
graph gaining the resolved site config and the HTML gaining a printed
span per link that used to decline one. What this buys is the smaller
API, not the bytes.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `src/shared/lib/one-of.ts`:24 — unresolved — last: @vzakharov (human) 2026-09-19T12:17:35Z — "надо завести отдельный подкласс Error и ввести линтерное пра…" → [↓](#t01)
- **T02** `src/shared/lib/one-of.ts`:1 — unresolved — last: @vzakharov (human) 2026-09-19T12:17:46Z — "почему не в lib/collections.ts?" → [↓](#t02)
- **T03** `apps/vova/app/cv/[[...variantAndLocale]]/page.tsx`:20 — unresolved — last: @vzakharov (human) 2026-09-19T12:19:21Z — "зачем вводить константу, которая используется только один ра…" → [↓](#t03)
- **T04** `src/shared/lib/one-of.ts`:19 — unresolved — last: @vzakharov (human) 2026-09-19T12:20:57Z — "не нужно усложнять этим аргументом, сообщение об ошибке буде…" → [↓](#t04)
- **T05** `src/pages/cv/lib/cv-route-params.ts`:27 — unresolved — last: @vzakharov (human) 2026-09-19T12:23:03Z — "может тоже вынести в абстрактный чекер, гарантированно возвр…" → [↓](#t05)

<a id="t01"></a>

### `src/shared/lib/one-of.ts`:24 — unresolved

```diff
@@ -0,0 +1,28 @@
… 18 lines elided …
+  subject: string,
+): T[number] {
+  if (!isOneOf(values)(value)) {
+    throw new Error(
+      `${subject} must be one of ${values.join(', ')}, not ${String(value)}`,
+    );
```

**@vzakharov (human)** — 2026-09-19T12:17:35Z

надо завести отдельный подкласс Error и ввести линтерное правило запрещающее throw-ить голые Error; если нарушителей будет много (можно прикинуть заранее до написания), завести отдельный тикет

---

<a id="t02"></a>

### `src/shared/lib/one-of.ts`:1 — unresolved

**@vzakharov (human)** — 2026-09-19T12:17:46Z

почему не в lib/collections.ts?

---

<a id="t03"></a>

### `apps/vova/app/cv/[[...variantAndLocale]]/page.tsx`:20 — unresolved

```diff
@@ -17,14 +17,12 @@ export function generateStaticParams() {
… 2 lines elided …
 export async function generateMetadata({ params }: Props) {
-  const { variantAndLocale } = cvSegmentsSchema.parse(await params);
-  const { variant, locale } = cvAddressDefaults(variantAndLocale);
+  const address = parseCvSegments(await params);
```

**@vzakharov (human)** — 2026-09-19T12:19:21Z

зачем вводить константу, которая используется только один раз?

---

<a id="t04"></a>

### `src/shared/lib/one-of.ts`:19 — unresolved

```diff
@@ -0,0 +1,28 @@
… 15 lines elided …
+export function oneOf<const T extends readonly string[]>(
+  values: T,
+  value: unknown,
+  subject: string,
```

**@vzakharov (human)** — 2026-09-19T12:20:57Z

не нужно усложнять этим аргументом, сообщение об ошибке будет понятно и без него (из-за перечисления допустимых значений)

---

<a id="t05"></a>

### `src/pages/cv/lib/cv-route-params.ts`:27 — unresolved

```diff
@@ -1,33 +1,39 @@
… 35 lines elided …
+export function parseCvSegments({
+  variantAndLocale = [],
+}: WithOptionalCvSegments): CvAddress {
+  const [variant, locale, ...rest] = variantAndLocale;
+
+  if (rest.length > 0) {
+    throw new Error(
+      `The CV route takes a variant and a locale at most, not /${variantAndLocale.join('/')}`,
+    );
+  }
```

**@vzakharov (human)** — 2026-09-19T12:23:03Z

может тоже вынести в абстрактный чекер, гарантированно возвращающий тупл заданной длины? или слишком сложно в тс?

---

## Timeline (status, references, and other events)

- **2026-09-19T12:10:08Z** @vzakharov renamed from «docs: plan a zod-free enum parse, and what it un-builds» to «refactor: a zod-free enum parse, and the apparatus it un-builds».
- **2026-09-19T12:25:06Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/73#pullrequestreview-5255697392.
