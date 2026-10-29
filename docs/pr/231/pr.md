# PR #231: feat(unsquatted): unsquatted.com, free domain names and a checker

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/231
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/unsquatted-site
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-29T08:36:23Z
- **Updated:** 2026-10-29T09:22:29Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 11

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `src/unsquatted/pages/home/i18n/messages/en.json`:18 — unresolved — last: @vzakharov (human) 2026-10-29T09:06:31Z — "ага 👍" → [↓](#t01)
- **T02** `src/unsquatted/pages/home/ui/pick-row.tsx`:20 — unresolved — last: @vzakharov (human) 2026-10-29T09:20:26Z — "верно; нужно держать какое-то время -- смотреть, когда имя п…" → [↓](#t02)
- **T03** `docs/remove-before-merging/unsquatted-site/squash-message.md`:19 — unresolved — last: @vzakharov (human) 2026-10-29T09:01:16Z — "а у Майи тоже no-op? Она там тоже кастомизировала как-то" → [↓](#t03)
- **T04** `sites/unsquatted/public/card.og.png`:1 — unresolved — last: @vzakharov (human) 2026-10-29T09:03:38Z — "как-то странно выглядит лого сверху; + копию надо править ко…" → [↓](#t04)
- **T05** `src/unsquatted/pages/home/lib/dice.ts`:18 — unresolved — last: @vzakharov (human) 2026-10-29T09:07:58Z — "WET" → [↓](#t05)
- **T06** `src/unsquatted/pages/home/lib/lookup.ts`:27 — unresolved — last: @vzakharov (human) 2026-10-29T09:09:14Z — "мы можем подгрузить весь список зон поддерживаемых поркбаном…" → [↓](#t06)
- **T07** `src/unsquatted/pages/home/lib/prices.ts`:71 — unresolved — last: @vzakharov (human) 2026-10-29T09:10:47Z — "фетчеры давай оборачивать чтобы сами рейзили (ошибка -- обяз…" → [↓](#t07)
- **T08** `src/unsquatted/pages/home/model/picks.json`:1 — unresolved — last: @vzakharov (human) 2026-10-29T09:13:07Z — "давай держать их в public/picks/<...>.md, с фронтматтером ка…" → [↓](#t08)
- **T09** `src/unsquatted/pages/home/ui/checker-state.tsx`:161 — unresolved — last: @vzakharov (human) 2026-10-29T09:14:44Z — "это можно обернуть ы `someWrapper(CheckerContext, new SomeEr…" → [↓](#t09)
- **T10** `src/unsquatted/pages/home/ui/hint.tsx`:1 — unresolved — last: @vzakharov (human) 2026-10-29T09:17:14Z — "у нас это больше нигде не применяется? в том же music, на ge…" → [↓](#t10)
- **T11** `src/unsquatted/pages/home/ui/verdict-label.tsx`:79 — unresolved — last: @vzakharov (human) 2026-10-29T09:21:43Z — "а как же COPY?" → [↓](#t11)

---

## Body

## Summary

- **A sixth site, `unsquatted` (unsquatted.com), on shell.** It has one page with two parts. The first is a curated list of good domain names that are still free. A naming routine grows the list through `pages/home/model/picks.json`, and each listed name is looked up again on load. The second is a domainr-like checker that asks each registry's RDAP straight from the visitor's browser, with DNS-over-HTTPS as a hint where RDAP refuses browsers. There is no server, which is where "Curated and blazing fast" comes from.
- **The checker's behaviour:**
  - Lookups run as you type, with a debounce. There is also a Check button with a loader, and dice that roll a faker adjective+noun (faker loads on the first roll).
  - A typed zone is listed first, and so is a domain hack (`fuckapp` → `fuck.app`).
  - Twelve zones are shown, three rows of them with the rest behind "more tlds ↓".
  - The query lives in the URL hash, and each change is a history step.
  - Free rows show Porkbun's price, which is read at build time; a pricing failure fails the build.
  - A taken name shows "up for grabs in N" only when it is in RDAP `pending delete`.
  - Easter eggs: typing `unsquatted.com` answers "seriously?", and the card right after it gets an aside.
- **Shell grows three hooks, each a no-op for the other sites:** an `accent` colour token, a `--radius-default` custom property, and a `fontVariables` slot on the root layout. `Tooltip` and `Loader` sheets are imported and added to the styles check's interaction list, because a static export never renders them.
- **Wiring:** a receiver repo (vzakharov/unsquatted.com) in deploy, vet, preview and `publish-site.sh`, plus an Umami site and an OG card. The README and `docs/masd.md` site lists include the new site. The site is already live: it was deployed by dispatching `deploy.yml` from this branch.

## QA Checklist

- [ ] `list` — Open https://unsquatted.com: the curated names render, each re-checked on load, and a taken one loses its Register link
- [ ] `type` — Type a word: the zone grid fills with available / could be free / taken verdicts once typing pauses, and Check spins (dimmed) while lookups run
- [ ] `typed-zone` — Type `foo.dev` and `fuckapp`: the typed domain, and the `fuck.app` hack, lead the grid
- [ ] `more-tlds` — Only three rows show; "more tlds ↓" reveals the rest
- [ ] `price` — Available rows show a quiet "$N, then $M/yr" or "$N/yr" under them
- [ ] `hash` — The address gains `#name`; reload keeps it, a shared link looks it up, and back/forward walk through earlier names
- [ ] `dice` — The dice fills the field with a hyphen-free word pair without scrolling the page
- [ ] `pick-click` — Clicking a listed name puts it in the field, looks it up and scrolls to the top
- [ ] `egg` — `unsquatted` answers "seriously?" on .com, with the neighbouring card's aside
- [ ] `tooltips` — The "blazing fast" and "buy us a coffee" hints show their tooltips on hover
- [ ] `narrow` — At phone width the dice and Check wrap to their own row and the cards fall to fewer columns
- [ ] `other-sites` — Another site's preview (e.g. vovazakharov) looks unchanged: accent, radius and fonts fall back to its own

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `list` | manual-only | — | Live RDAP answers from third-party registries |
| `type` | manual-only | — | Verdict logic is covered by `lookup.test.ts` (`rdapVerdict`, `dohVerdict`); the live debounce and loader need a browser against live registries |
| `typed-zone` | unit | ✅ | `lookup.test.ts` — `typedZone`, `domainHacks`, `rowsFor` |
| `more-tlds` | manual-only | — | Layout of the grid and the toggle |
| `price` | unit | ✅ | `prices.test.ts` — `parsePricing`, `priceParts`; the live Porkbun fetch runs at build |
| `hash` | e2e | ❌ | Drive the built page: type, reload, assert the field and the hash; go back, assert the previous name |
| `dice` | manual-only | — | Random output, and the absence of scroll is visual |
| `pick-click` | e2e | ❌ | Click a listed name, assert the field value and `scrollY === 0` |
| `egg` | unit | ❌ | The choice lives in `verdict-label.tsx`, a component; extracting it to a pure function would put it in the suite |
| `tooltips` | manual-only | — | Interaction-only rendering; the styles check guards the sheet import |
| `narrow` | manual-only | — | Visual layout at narrow widths |
| `other-sites` | manual-only | — | Visual regression across sites |

https://claude.ai/code/session_01DaohkCuXcusv7weZ4aSLQq

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-29T08:36:47Z — "Proposed squash body: ``` A sixth site, unsquatted.com: a fr…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-29T08:36:47Z

[https://github.com/vzakharov/vovazakharov.com/pull/231#issuecomment-6491948832](https://github.com/vzakharov/vovazakharov.com/pull/231#issuecomment-6491948832)

Proposed squash body:

```
A sixth site, unsquatted.com: a free, curated feed of good domain names
nobody has registered yet, and a checker for your own. Nothing on it is
for sale and there are no affiliate links. It has no server: the
visitor's browser asks each registry's RDAP itself, with DNS-over-HTTPS
as a hint where a registry's RDAP refuses browsers.

The checker looks a name up as it is typed, with a Check button and a
dice that rolls a faker word pair. A typed zone or a domain hack
(fuckapp -> fuck.app) leads the grid of twelve zones, three rows of them
shown. The query rides in the URL hash, one history step per name. Free
rows show Porkbun's price, read at build, so a pricing failure fails the
build. A taken name says when it is up for grabs only in RDAP's pending
delete, since before that the owner can still renew. The listed names
are re-checked on load and grow through pages/home/model/picks.json.

Shell gains three hooks that are no-ops for the other sites: an accent
colour token, a --radius-default property and a fontVariables slot on
the root layout. Tooltip and Loader join the styles check's interaction
list, because a static export never renders them. The site is wired as
a receiver (vzakharov/unsquatted.com) in deploy, vet, preview and
publish-site.sh, with its Umami site and Open Graph card.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

<a id="r01"></a>

### R01 — Review by @vzakharov (agent) — COMMENTED

_2026-10-29T08:38:41Z_

[https://github.com/vzakharov/vovazakharov.com/pull/231#pullrequestreview-5694901035](https://github.com/vzakharov/vovazakharov.com/pull/231#pullrequestreview-5694901035)

**/five-percent**: 2 proposals, 1 critical.

<!-- five-percent: 41f8f91faf70dfc281d0346b51c72a45a2e31379 -->

- **T01** `src/unsquatted/pages/home/i18n/messages/en.json`:18 — unresolved — last: @vzakharov (human) 2026-10-29T09:06:31Z — "ага 👍" → [↓](#t01)
- **T02** `src/unsquatted/pages/home/ui/pick-row.tsx`:20 — unresolved — last: @vzakharov (human) 2026-10-29T09:20:26Z — "верно; нужно держать какое-то время -- смотреть, когда имя п…" → [↓](#t02)
- **T03** `docs/remove-before-merging/unsquatted-site/squash-message.md`:19 — unresolved — last: @vzakharov (human) 2026-10-29T09:01:16Z — "а у Майи тоже no-op? Она там тоже кастомизировала как-то" → [↓](#t03)
- **T04** `sites/unsquatted/public/card.og.png`:1 — unresolved — last: @vzakharov (human) 2026-10-29T09:03:38Z — "как-то странно выглядит лого сверху; + копию надо править ко…" → [↓](#t04)
- **T05** `src/unsquatted/pages/home/lib/dice.ts`:18 — unresolved — last: @vzakharov (human) 2026-10-29T09:07:58Z — "WET" → [↓](#t05)
- **T06** `src/unsquatted/pages/home/lib/lookup.ts`:27 — unresolved — last: @vzakharov (human) 2026-10-29T09:09:14Z — "мы можем подгрузить весь список зон поддерживаемых поркбаном…" → [↓](#t06)
- **T07** `src/unsquatted/pages/home/lib/prices.ts`:71 — unresolved — last: @vzakharov (human) 2026-10-29T09:10:47Z — "фетчеры давай оборачивать чтобы сами рейзили (ошибка -- обяз…" → [↓](#t07)
- **T08** `src/unsquatted/pages/home/model/picks.json`:1 — unresolved — last: @vzakharov (human) 2026-10-29T09:13:07Z — "давай держать их в public/picks/<...>.md, с фронтматтером ка…" → [↓](#t08)
- **T09** `src/unsquatted/pages/home/ui/checker-state.tsx`:161 — unresolved — last: @vzakharov (human) 2026-10-29T09:14:44Z — "это можно обернуть ы `someWrapper(CheckerContext, new SomeEr…" → [↓](#t09)
- **T10** `src/unsquatted/pages/home/ui/hint.tsx`:1 — unresolved — last: @vzakharov (human) 2026-10-29T09:17:14Z — "у нас это больше нигде не применяется? в том же music, на ge…" → [↓](#t10)
- **T11** `src/unsquatted/pages/home/ui/verdict-label.tsx`:79 — unresolved — last: @vzakharov (human) 2026-10-29T09:21:43Z — "а как же COPY?" → [↓](#t11)

<a id="t01"></a>

### `src/unsquatted/pages/home/i18n/messages/en.json`:18 — unresolved

```diff
@@ -0,0 +1,23 @@
… 14 lines elided …
+  "moreZones": "more tlds ↓",
+  "fewerZones": "fewer tlds ↑",
+  "listHeading": "Up for grabs",
+  "register": "Register ~$11 →",
```

**@vzakharov (agent)** — 2026-10-29T08:38:30Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · critical

The site states a .com's price three times, and they don't agree. The checker shows Porkbun's real price, read at build ($11/yr for .com today). A listed name's link says "Register ~$11" because it's typed into the copy here. And the description that search results and link previews show says "Register one for about $10" (`tagline` in `src/kernel/shared/config/site-config.ts`).

Use the one price the build already fetches everywhere. A listed name's link would read its own zone's price from that list, the way the checker's rows do, and the description would drop the number ("Register one before someone else does").

It costs passing the price list down to the list as well as to the checker. A guessed number also stops being one now that the naming routine can add names outside .com: as things stand, a .ai pick would say "~$11" when Porkbun charges $83.

**@vzakharov (human)** — 2026-10-29T09:06:31Z

ага 👍

---

<a id="t02"></a>

### `src/unsquatted/pages/home/ui/pick-row.tsx`:20 — unresolved

```diff
@@ -0,0 +1,46 @@
… 16 lines elided …
+ * to a registrar to find out.
+ */
+export function PickRow({ domain, category, blurb, copy }: PickRowProps) {
+  const taken = useVerdict(domain)?.state === 'taken';
```

**@vzakharov (agent)** — 2026-10-29T08:38:35Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · optional

The change assumes a listed name that someone registers stays on the list, dimmed and labelled "taken". Nothing ever removes it, because the naming routine only adds names. So, over time, the "Up for grabs" list fills up with names that are no longer up for grabs, and they're likely the best ones, since those get registered first.

Drop the taken names before anyone sees them. The build already goes out for prices, so it could look each listed name up too and leave out the ones that are registered. The check on page load stays, to catch a name registered since the last deploy, and it could hide that row instead of dimming it.

The cost is a second network dependency at build time (the registries' lookup service, on top of Porkbun). A name taken between deploys would still flash on screen until the check on load hides it. And the site stops showing that its picks do get registered, which the dimmed rows could be read as showing on purpose.

**@vzakharov (human)** — 2026-10-29T09:20:26Z

верно; нужно держать какое-то время -- смотреть, когда имя последний раз было свободно и держать после этого пару недель. при каждом запуске рутины (до этого мы ещё не дошли) на именах, которые больше не доступны, ставить дату "держать до...". Так как мы переходим на .md, архивные (не показываемые) пункты НЕ удаляются из репы, просто не показываются.

also: черипикни обновления пятипроцентника из #229 , плюс обозначь что комментарий должен идти на том языке, на котором шло общение в сессии

---

<a id="t03"></a>

### `docs/remove-before-merging/unsquatted-site/squash-message.md`:19 — unresolved

```diff
@@ -0,0 +1,31 @@
… 15 lines elided …
+delete, since before that the owner can still renew. The listed names
+are re-checked on load and grow through pages/home/model/picks.json.
+
+Shell gains three hooks that are no-ops for the other sites: an accent
```

**@vzakharov (human)** — 2026-10-29T09:01:16Z

а у Майи тоже no-op? Она там тоже кастомизировала как-то

---

<a id="t04"></a>

### `sites/unsquatted/public/card.og.png`:1 — unresolved

**@vzakharov (human)** — 2026-10-29T09:03:38Z

как-то странно выглядит лого сверху; + копию надо править когда правим хиро (например про $10 мы уже там не говорим)

---

<a id="t05"></a>

### `src/unsquatted/pages/home/lib/dice.ts`:18 — unresolved

```diff
@@ -0,0 +1,20 @@
… 14 lines elided …
+  const { faker } = await import('@faker-js/faker');
+
+  return cleanLabel(
+    `${letters(faker.word.adjective({ length: LENGTH }))}${letters(faker.word.noun({ length: LENGTH }))}`,
```

**@vzakharov (human)** — 2026-10-29T09:07:58Z

WET

---

<a id="t06"></a>

### `src/unsquatted/pages/home/lib/lookup.ts`:27 — unresolved

```diff
@@ -0,0 +1,229 @@
… 23 lines elided …
+export type WithDomain = { domain: string };
+
+/** The zones every name is checked in, in the order they are shown. */
+export const ZONES = [
```

**@vzakharov (human)** — 2026-10-29T09:09:14Z

мы можем подгрузить весь список зон поддерживаемых поркбаном? но некоторые из них, всякие gTLD, "использовать" только если промпт юзера их включает в конце или в начале (например, agenticbible → agentic.bible, designtips → tips.design)?

---

<a id="t07"></a>

### `src/unsquatted/pages/home/lib/prices.ts`:71 — unresolved

```diff
@@ -0,0 +1,72 @@
… 61 lines elided …
+
+/** Fetched at build; a failure fails the build rather than drop the prices. */
+export async function fetchPrices(): Promise<Prices> {
+  const response = await fetch(PRICING_URL, { method: 'POST' });
+
+  if (!response.ok) {
+    throw new Error(`Porkbun pricing answered ${response.status}`);
+  }
+
+  return parsePricing(await response.json());
```

**@vzakharov (human)** — 2026-10-29T09:10:47Z

фетчеры давай оборачивать чтобы сами рейзили (ошибка -- обязательный второй параметр)

+давай линтерное правило, запрещающее голый Error (разве у нас такого не было?)

---

<a id="t08"></a>

### `src/unsquatted/pages/home/model/picks.json`:1 — unresolved

**@vzakharov (human)** — 2026-10-29T09:13:07Z

давай держать их в public/picks/<...>.md, с фронтматтером как сейчас. Если есть body, они считаются статьёй, и она рендерится на /picks/..., как остальные статьи в блоге. В статьях (в перспективе) будет типа идеи что можно сделать, мокап, кнопка "закажите у нас, нарисуем за 2 бакса" и так далее (пока статей нет, так что функционал статей можно пока не писать)

---

<a id="t09"></a>

### `src/unsquatted/pages/home/ui/checker-state.tsx`:161 — unresolved

```diff
@@ -0,0 +1,161 @@
… 149 lines elided …
+  );
+}
+
+export function useChecker(): CheckerState {
+  const state = use(CheckerContext);
+
+  if (state === undefined) {
+    throw new Error('useChecker is called outside a CheckerProvider');
+  }
+
+  return state;
+}
```

**@vzakharov (human)** — 2026-10-29T09:14:44Z

это можно обернуть ы `someWrapper(CheckerContext, new SomeError(CheckerProvider))`? Или тут реактовые штуки начинают мешать?

---

<a id="t10"></a>

### `src/unsquatted/pages/home/ui/hint.tsx`:1 — unresolved

**@vzakharov (human)** — 2026-10-29T09:17:14Z

у нас это больше нигде не применяется? в том же music, на genius-подсказках?

---

<a id="t11"></a>

### `src/unsquatted/pages/home/ui/verdict-label.tsx`:79 — unresolved

```diff
@@ -0,0 +1,96 @@
… 69 lines elided …
+  price,
+}: VerdictLabelProps) {
+  const state: State = verdict?.state ?? 'pending';
+  const text = {
+    pending: 'checking…',
+    free: 'available →',
+    maybe: 'may be available →',
+    taken: takenText(domain, verdict),
+    unknown: 'no answer',
+  }[state];
```

**@vzakharov (human)** — 2026-10-29T09:21:43Z

а как же COPY?

---

## Timeline (status, references, and other events)

- **2026-10-29T08:36:53Z** @vzakharov renamed from «feat(unsquatted): unsquatted.com — free domain names and an in-browser checker» to «feat(unsquatted): unsquatted.com, free domain names and a checker».
- **2026-10-29T08:38:41Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/231#pullrequestreview-5694901035.
- **2026-10-29T09:22:28Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/231#pullrequestreview-5695156817.
