# PR #69: feat: the Bible on agentic.bible, and Late Stage Agentic as its hub

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/69
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/agentic-bible-bw6dre
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-17T18:56:30Z
- **Updated:** 2026-09-19T14:01:13Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **The Bible is the repository's third site, rooted at its own domain.** `apps/bible/` builds from the same `src/` and is force-pushed to a receiving repository whose Pages serves `agentic.bible`. An article is `agentic.bible/tend-prose`, not `agentic.bible/bible/tend-prose` — the domain already says which collection this is. A rooted collection has an empty `base`, so the three path functions that interpolate it now reach through one joiner, and its directory is the site's whole `public/`, so the render walk's guarantee that it cannot hand a script its own output becomes an explicit skip of `generated/`.
- **latestageagentic.com becomes the index the project needed anyway.** With its only collection gone, the front page keeps its header and opening argument, and `Writing` becomes three cards: the Bible, MUTHUR, and agentic coding courses marked coming soon. `SummaryCard`'s `href` goes optional so the third is a card rather than a dead link, and takes an eyebrow so a reader scanning three sees which one is not clickable before reading any of them.
- **The mark is a wax seal in two cuts, and the blank one closes every article in place of an amen.** One drawing — the lettered cut is the blank one plus a final letters path, which is what lets the home page's hover fade the lettering off rather than cross into a different image. The end mark is a rehype plugin, not markup in the article component: inline means inside the compiled HTML. It prints, so the seal joins every document's PDF source set.
- **`widgets/` earns its first two slices.** A block two page slices share cannot sit in either of them, and `shared/ui` is the barrel client components import — so `DocumentCards` (which needs `linkTo`) and `SiteFooter` (which needs `BUILD_YEAR`) sit on the one layer above `shared` and below `pages`. The byline they share needs neither and stays in `shared/ui`.
- **One publish job over every receiving site.** Two receivers is where `publish-lsa.sh` stops being a one-off: it becomes `publish-site.sh <site>`, reading a fixed `PAGES_DEPLOY_KEY` the workflow maps each receiver's own secret into, and the two publish jobs collapse onto a `receivers` matrix the gate emits.

**The seal was redrawn rather than recovered.** The planning session's traced SVGs lived in its `tmp/`, which died with its container, so this branch draws the seal from the geometry the plan's own history carries — harmonics, offsets, ring and spokes — and sets `AGENTIC BIBLE` in Merriweather, the site's own face, emitted as outlines because an SVG behind an `<img>` cannot reach a web font. Both files carry that geometry in their header, so the shape is re-derivable rather than frozen in a path nobody can read.

**`apple-icon.png` is not in the branch.** The plan listed it, but it would be a committed raster with no `--check` behind it, and neither existing site has one. `app/icon.svg` (the blank cut) is what ships.

**Phase 6 is done — `agentic.bible` is live.** The receiving repository has its README and its `ed25519` deploy key, with the private half in `BIBLE_PAGES_DEPLOY_KEY` here. The DNS is written over Porkbun's API: four `A` rows, four `AAAA` rows and a `www` `CNAME`, displacing one apex `ALIAS` to the parking page and leaving the wildcard, which an exact `www` outranks. The pre-merge publish ran as `site=both`; Pages had self-enabled on the pushed `gh-pages`, so only `https_enforced` was needed and the certificate reads `approved`.

**`deploy-vova` failed on that run, and that is the guard rail rather than a break.** The `github-pages` environment admits the default branch alone, so the site served from this repository's own Pages cannot deploy from a branch whatever the picker names — which caps a pre-merge publish's blast radius to the receivers. In practice that means **latestageagentic.com is already serving its hub front page**, ahead of the merge, and vovazakharov.com is untouched. `@.claude/skills/stand-up-site/SKILL.md` § "Step 3" now carries this, so the next run does not read that failure as CI to chase.

## QA Checklist

- [ ] `bible-routes` — `agentic.bible/tend-prose`, `/precedent-fallacy` and `/web-not-cli` each render with their assets, their cross-links resolving between articles, and their `.md`/`.pdf` siblings reachable at the route plus an extension
- [ ] `bible-home` — the home page reads as an opener: the seal, the copy, the article list, in that order and at that weight
- [ ] `seal-hover` — holding the home page's seal for three unbroken seconds fades the `AGENTIC BIBLE` ring away and sets the caption beside the wax; a pointer that leaves earlier never starts it, and nothing happens on touch
- [ ] `end-mark` — the seal closes an article inline after the final punctuation, and on a line of its own where the article ends in a picture (`tend-prose`); on screen, in print, and against both themes
- [ ] `lsa-hub` — the three cards under the opening argument, the third visibly not a link
- [ ] `vova-untouched` — vovazakharov.com serves what it did; its footer is the shared one now
- [ ] `dns` — `agentic.bible` and `www.agentic.bible` both resolve to GitHub's Pages addresses, and the zone's `NS` and wildcard rows came through untouched
- [ ] `sites-own-content` — each of the three domains serves its own title, description and card, which is the failure a shared `src/` makes possible

**Everything above is checkable in a browser now, not only locally** — `agentic.bible` and `latestageagentic.com` are both serving this branch.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `bible-routes` | Partly | Yes | All three articles, their `.md`/`.pdf` siblings, the seal, the card and a 404 answered from the live site; the sitemap carries the rooted routes |
| `bible-home` | No | No | Editorial — looked at in this session on both themes |
| `seal-hover` | Partly | No | Needs a driven pointer and a 3s wait; verified once over CDP in this session |
| `end-mark` | Partly | Partly | The plugin's placement is deterministic and the PDFs are hash-checked; how it sits on the line is not |
| `lsa-hub` | Partly | Partly | The three cards' links and the coming-soon eyebrow are in the served HTML, with no stale `/bible/` hrefs; weight and layout are editorial |
| `vova-untouched` | Yes | Yes | Not merely unchanged — never redeployed: the environment rule blocked `deploy-vova` on a branch ref |
| `dns` | Partly | Yes | Written and read back over Porkbun's API in this session; a resolver check is the whole of it |
| `sites-own-content` | Partly | Yes | Title, description and `og:image` read off all three live domains; none carries another's |

https://claude.ai/code/session_01BUGrCNoZ7V6EoR7jUuUZGG
https://claude.ai/code/session_0134HKDezVfYQL6DsjYEpwiG

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-17T18:57:06Z — "Proposed squash title/body: ``` feat: the Bible on agentic.b…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-17T18:57:06Z

[https://github.com/vzakharov/vovazakharov.com/pull/69#issuecomment-5719654569](https://github.com/vzakharov/vovazakharov.com/pull/69#issuecomment-5719654569)

Proposed squash title/body:

```
feat: the Bible on agentic.bible, and Late Stage Agentic as its hub (pr #69)
```

```
The Bible was an article collection served from a domain named for
something else. `agentic.bible` is named for it, so the collection
becomes the repository's third site — `apps/bible/` building from the
same `src/`, force-pushed to a receiving repository whose Pages serves
the domain, exactly as `lsa` leaves by that door. Two receivers is where
the one-off publish script stops being one: it takes a site id, reads a
fixed deploy-key variable the workflow maps each receiver's own secret
into, and the publish jobs collapse onto a matrix the gate emits. The
domain's own records are writable from here too, Porkbun having an API
the agent drives where its keys reach the domain.

It is rooted at the site root: an article is `agentic.bible/tend-prose`,
the domain already saying which collection this is. A rooted collection
has an empty `base`, which the three path functions that interpolate it
now reach through one joiner, and its directory is the site's whole
`public/` — so the render walk's guarantee that it cannot hand a script
its own output becomes an explicit skip of `generated/` rather than a
property of where the directories sit. Its home page is a slice of its
own, written to say what the place is before it argues how the articles
are written; the card list it shares with the collection index moves to
a first `widgets/` slice, that being the one layer where a block two
page slices render may also read the resolved site.

The mark is a wax seal in two cuts, lettered for the site and blank for
itself — one drawing, the lettered cut being the blank one plus a final
letters path, which is what lets the home page fade the lettering off
under a held pointer rather than cross into a different image. The blank
cut closes every article in place of an amen: a rehype plugin rather
than markup in the article component, because inline means inside the
compiled HTML. It prints, so the seal joins every document's PDF source
set.

What that leaves behind on latestageagentic.com is a front page with no
collection under it, so it becomes the index the project needed anyway:
the opening argument, then three cards — the Bible, MUTHUR, and agentic
coding courses that do not exist yet. `SummaryCard` takes an optional
`href` so the third is a card rather than a dead link, and the footer's
address to agent readers travels to the site that holds the articles.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `.claude/rules/fsd.md`:40 — unresolved — last: @vzakharov (human) 2026-09-19T12:49:16Z — "археология?" → [↓](#t01)
- **T02** `.github/workflows/deploy.yml`:11 — unresolved — last: @vzakharov (human) 2026-09-19T13:08:39Z — ""both" → "all" -- хотя кажется стоится сделать возможным и п…" → [↓](#t02)
- **T03** `apps/bible/tsconfig.json`:10 — unresolved — last: @vzakharov (human) 2026-09-19T13:15:23Z — "поясни пжст что это значит" → [↓](#t03)
- **T04** `scripts/render-og.ts`:189 — unresolved — last: @vzakharov (human) 2026-09-19T13:17:28Z — "чем отличается `.vector` от `.path`?" → [↓](#t04)
- **T05** `src/app/lib/sitemap.ts`:37 — unresolved — last: @vzakharov (human) 2026-09-19T13:18:50Z — "оставь только перую часть до `,`, остальное и так следует" → [↓](#t05)
- **T06** `src/app/styles/prose.scss`:460 — unresolved — last: @vzakharov (human) 2026-09-19T13:19:18Z — "давай её лучше делать на новой строчке, посередине, в тексте…" → [↓](#t06)
- **T07** `src/pages/bible-home/ui/bible-home-page.tsx`:41 — unresolved — last: @vzakharov (human) 2026-09-19T13:25:49Z — "подредактируй (сорри за haphazard форматирование, скопипасти…" → [↓](#t07)
- **T08** `src/pages/bible-home/ui/seal-mark.tsx`:14 — unresolved — last: @vzakharov (human) 2026-09-19T13:26:54Z — "Currently: centered, line broken before "this.": <img width=…" → [↓](#t08)
- **T09** `src/pages/lsa-home/ui/lsa-home-page.tsx`:46 — unresolved — last: @vzakharov (human) 2026-09-19T13:33:59Z — "Здесь слишком много теперь с учётом того что собственно стат…" → [↓](#t09)
- **T10** `src/pages/lsa-home/ui/lsa-home-page.tsx`:50 — unresolved — last: @vzakharov (human) 2026-09-19T13:36:43Z — "давай их расположим в три колонки, по крайней мере на достат…" → [↓](#t10)
- **T11** `src/pages/lsa-home/ui/lsa-home-page.tsx`:30 — unresolved — last: @vzakharov (human) 2026-09-19T13:50:55Z — "давай создадим тикет добавить эту страницу, основной текст н…" → [↓](#t11)
- **T12** `src/shared/config/site-config.ts`:102 — unresolved — last: @vzakharov (human) 2026-09-19T13:52:46Z — "seal это то что в конце текстов или то что на заглавной стра…" → [↓](#t12)
- **T13** `src/shared/content/collections.ts`:81 — unresolved — last: @vzakharov (human) 2026-09-19T13:55:03Z — "правильно ли называть это по текущему содержимому ("здесь ле…" → [↓](#t13)
- **T14** `src/shared/ui/document-meta.tsx`:1 — unresolved — last: @vzakharov (human) 2026-09-19T13:57:43Z — "так, вот тут надо хорошенько задуматься. document это у нас…" → [↓](#t14)

<a id="t01"></a>

### `.claude/rules/fsd.md`:40 — unresolved

```diff
@@ -22,21 +22,30 @@ Lowest (most generic) first — an import may only point downward:
… 13 lines elided …
+are optional; **inventing one costs more than leaving it out** (see
+"insignificant slices" below).
+
+**What earned `widgets/` is the pair that reads the resolved site.** A block two
+page slices both render cannot sit in either of them — slices may not reach each
+other sideways — and `shared/ui` is the barrel client components import, so
+anything in it that touched `@/shared/config/index.server-only` would put the
+resolved configuration in the browser. `DocumentCards` needs `linkTo` and
+`SiteFooter` needs `BUILD_YEAR`, so both belong on the one layer that is above
+`shared` and below `pages`. A block needing none of that stays in `shared/ui`,
+which is where `SummaryCard` and the document byline are.
```

**@vzakharov (human)** — 2026-09-19T12:49:16Z

археология?

---

<a id="t02"></a>

### `.github/workflows/deploy.yml`:11 — unresolved

```diff
@@ -8,7 +8,7 @@ on:
… 1 line elided …
         description: Which site this run publishes
         type: choice
-        options: [both, vova, lsa]
+        options: [both, vova, lsa, bible]
```

**@vzakharov (human)** — 2026-09-19T13:08:39Z

"both" → "all" -- хотя кажется стоится сделать возможным и перечисление тоже now that there are three

---

<a id="t03"></a>

### `apps/bible/tsconfig.json`:10 — unresolved

```diff
@@ -0,0 +1,21 @@
… 4 lines elided …
+      "@/*": ["../../src/*"]
+    }
+  },
+  // The reach back into the repository root is for the ambient declarations —
+  // stylesheet modules, the next-intl catalogue — which nothing imports, so a
+  // check that only follows this directory's imports never sees them.
```

**@vzakharov (human)** — 2026-09-19T13:15:23Z

поясни пжст что это значит

---

<a id="t04"></a>

### `scripts/render-og.ts`:189 — unresolved

```diff
@@ -134,26 +146,49 @@ function svgPage(svgName: string): string {
… 51 lines elided …
+    ? []
+    : [
+        svgCard(
+          path.join(PUBLIC_DIR, avatar.vector),
+          path.join(PUBLIC_DIR, avatar.path),
```

**@vzakharov (human)** — 2026-09-19T13:17:28Z

чем отличается `.vector` от `.path`?

---

<a id="t05"></a>

### `src/app/lib/sitemap.ts`:37 — unresolved

```diff
@@ -32,10 +32,15 @@ function vovaRoutes(): string[] {
  * a new document appears here without touching this file.
  */
 export function sitemap(): MetadataRoute.Sitemap {
+  // Deduplicated because a rooted collection's index *is* the home page, and
+  // a crawler asked twice for one URL is a crawler asked to resolve a
+  // duplicate the canonical link already resolved.
```

**@vzakharov (human)** — 2026-09-19T13:18:50Z

оставь только перую часть до `,`, остальное и так следует

---

<a id="t06"></a>

### `src/app/styles/prose.scss`:460 — unresolved

```diff
@@ -453,3 +453,21 @@
… 4 lines elided …
+// The size is measured rather than chosen: below about 1.5em the star closes
+// up and the mark reads as a bullet. `max-height` is restated because the base
+// rule's is in `rem`, which an `em` size cannot outrank by cascade alone.
+.content-end-mark {
```

**@vzakharov (human)** — 2026-09-19T13:19:18Z

давай её лучше делать на новой строчке, посередине, в тексте немного таки коряво выглядит.

---

<a id="t07"></a>

### `src/pages/bible-home/ui/bible-home-page.tsx`:41 — unresolved

```diff
@@ -0,0 +1,72 @@
… 37 lines elided …
+        <Section id="about">
+          <Stack gap={24} align="flex-start">
+            <Text size="lg" lh={1.625}>
+              Everything here is written while the work is being done — by one
```

**@vzakharov (human)** — 2026-09-19T13:25:49Z

подредактируй (сорри за haphazard форматирование, скопипастил с кода; последнюю переделку поправь если читается криво -- но не раздувай):

              Everything here is written while the work is being done — by one
              person and one(-ish) agent, both of whom keep being wrong in ways worth
              writing down.

              Every article takes a position, stated flat out, with whatever is under it shown.
              The alternative — every approach has its pros and its cons, weigh them against
              your context, best of luck — is what you can get by prompting chatgpt on your own.

              Hence the name, which is of course a joke, but which also isn’t. Our seal goes for the amen. [the seal]

---

<a id="t08"></a>

### `src/pages/bible-home/ui/seal-mark.tsx`:14 — unresolved

```diff
@@ -0,0 +1,53 @@
… 10 lines elided …
+ * defect `/tend-prose`'s negation lens hunts, which plants the thing it denies
+ * by denying it — so that lens leaves this one standing.
+ */
+const CAPTION = 'Please don’t see an anus in this. Ah. Too late.';
```

**@vzakharov (human)** — 2026-09-19T13:26:54Z

Currently: centered, line broken before "this.":

<img width="371" height="183" alt="Image" src="./attachments/5cff14af-9aef-4696-bfb8-2bb6ca51b309.png" />

Preferred: left-aligned, breaks after "this."

---

<a id="t09"></a>

### `src/pages/lsa-home/ui/lsa-home-page.tsx`:46 — unresolved

```diff
@@ -44,46 +45,17 @@ export async function LsaHomePage() {
 
         <AboutSection />
```

**@vzakharov (human)** — 2026-09-19T13:33:59Z

Здесь слишком много теперь с учётом того что собственно статьи теперь на новом сайте, должно быть что-то вроде

Мы -- кодинговое агентство (pardon the pun), просветители и agentic infrastructure shippers, которые верят, что adoption агентских flows-ов опережает понимание их. Мы хотим немного вразуметь этот процесс, ну или по крайней мере сделать так, чтобы our future overlords пощадили нас, потому что мы пытались.

---

<a id="t10"></a>

### `src/pages/lsa-home/ui/lsa-home-page.tsx`:50 — unresolved

```diff
@@ -44,46 +45,17 @@ export async function LsaHomePage() {
… 4 lines elided …
-          <Title order={2}>Writing</Title>
+        <Section id="work">
+          <Title order={2}>Where it goes</Title>
           <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
```

**@vzakharov (human)** — 2026-09-19T13:36:43Z

давай их расположим в три колонки, по крайней мере на достаточно больших экранах

---

<a id="t11"></a>

### `src/pages/lsa-home/ui/lsa-home-page.tsx`:30 — unresolved

```diff
@@ -1,38 +1,39 @@
… 57 lines elided …
+  {
+    title: 'Agentic coding courses',
+    description:
+      'The same material as the articles, in the order you would actually learn it, with the work to do between the parts.',
```

**@vzakharov (human)** — 2026-09-19T13:50:55Z

давай создадим тикет добавить эту страницу, основной текст начитываю, нужно ужать для формата, подходящего под hero здесь:

[Курс которого нет.m4a.zip](./attachments/m4a.zip)

потом два отзыва (переведи, конечно):

[Sam Golovachev](https://www.linkedin.com/in/saam-g/)

<img width="800" height="800" alt="Image" src="./attachments/dbc4c6a6-eccc-4c1b-a7a8-959183f5ed28.png" />

> Вова открыл мне глаза на то, как во многом я ошибался, и показал мне путь в Светлое Агентское Будущее.
>
> Если хочешь, я могу переписать это в ещё более напыщенном стиле.

[Julia Suhovici](https://www.linkedin.com/in/iuliasuhovici/)

<img width="800" height="800" alt="Image" src="./attachments/d18c1cc7-90db-4313-9b9a-e4b27171c275.png" />

> Вова? Какой ещё Вова?

А под ними -- единая подпись "Ладно, ладно, отзывы ненастоящие. Но люди -- да, дайте им время написать собственноручно, что они думают"

---

<a id="t12"></a>

### `src/shared/config/site-config.ts`:102 — unresolved

```diff
@@ -81,6 +99,7 @@ const SITE_CONFIGS = {
     tagline:
       'Fractional CTO for teams that don’t want to YOLO into the agent era.',
     avatar: AVATAR,
+    seal: undefined,
```

**@vzakharov (human)** — 2026-09-19T13:52:46Z

seal это то что в конце текстов или то что на заглавной странице типа лого?

думаю, нужно ли вводить обязательность ключа, учитывая что он подразумевается только на одном сайте.

и ещё, поясни, почему это должно прямо в конфиге жить? (это вопрос, не просьба поменять пока)

---

<a id="t13"></a>

### `src/shared/content/collections.ts`:81 — unresolved

```diff
@@ -70,18 +72,34 @@ export type DocumentRef = WithCollectionId & Slugged;
… 6 lines elided …
+ * site's whole `public/`, so that separation is maintained rather than
+ * structural.
+ */
+export const GENERATED_DIR = 'generated';
```

**@vzakharov (human)** — 2026-09-19T13:55:03Z

правильно ли называть это по текущему содержимому ("здесь лежит то-то"), а не по смыслу ("здесь лежит то, что мы не хотим авто-преобразовывать в пдфки") (если я правильно понимаю замысел)?

Что если мы что-то ещё туда захотим класть, что *не* является автосгенерированным?

Или может я неправильно понимаю о чём это?

---

<a id="t14"></a>

### `src/shared/ui/document-meta.tsx`:1 — unresolved

**@vzakharov (human)** — 2026-09-19T13:57:43Z

так, вот тут надо хорошенько задуматься. document это у нас shared или таки entity? потому что звучит подозрительно похоже на последнее.

если это про import directions итп, то расскажи сначала мне, прежде чем править.

---

## Timeline (status, references, and other events)

- **2026-09-19T10:16:18Z** @vzakharov renamed from «docs: plan the Bible's move to agentic.bible» to «feat: the Bible on agentic.bible, and Late Stage Agentic as its hub».
- **2026-09-19T12:45:12Z** @vzakharov — _deployed_
- **2026-09-19T14:01:13Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/69#pullrequestreview-5255777705.
