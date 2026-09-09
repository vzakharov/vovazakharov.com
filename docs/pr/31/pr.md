# PR #31: feat: reposition the site and CV around hands-on CTO for AI-native delivery

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/31
- **Author:** @vzakharov
- **Base ← Head:** main ← claude/cto-positioning-wcwnjc
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-08T11:50:23Z
- **Updated:** 2026-09-09T01:07:31Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **The CV comes in two framings.** `/{locale}/cv` renders a *fractional hands-on CTO for AI-native delivery* variant in place — no redirect, since a static export has no server-side one — and `/{locale}/cv/cto` is the self-describing address for the same content, declaring `/cv` canonical so the pair does not split link equity. `/{locale}/cv/dev` keeps the developer framing, unchanged in substance, at its own URL, and a visible CTO/Dev switch sits beside the locale picker.
- **Only differing prose exists twice.** `cv.variants.cto` carries `metadata`, `header.tagline` and `profile`; `cvMessages` merges it over the base catalogue a section at a time, so a key the variant does not restate cannot drift. Experience, tech stack, education and contact are one set of facts stated once — and `whatIOffer` needed no override at all: its subsections became keyed blocks with the per-variant order in code, the pattern `experience` and `techStack` already use.
- **The home page is dev-first.** Writing and music each move to a page of their own, reached from a *See also* footer line; the dev intro states what is on offer instead of that its author is looking for work; the case-studies block folds into a four-card featured grid, with the earlier three projects named on one line; Professional Work becomes Recent Work with Playgram at the top and Voicemod dropped.
- **Nothing retitles history.** Playgram is "Developer" in both variants — the developer identity is the CTO claim's evidence, which is why both CVs exist rather than one replacing the other. Drive-by fixes: `ru.json` said "с 2019 года" where `en.json` says 2020, and the CV called `almostmagic` a Python package.
- Plan: `docs/plans/cto-positioning.completed.md`.

## QA Checklist

- [ ] `default-framing` — open `/en/cv`: tagline reads *Fractional hands-on CTO for AI-native delivery*, the profile opens on the numbers, and What I Offer lists Engagements / The Engineering System / AI Expertise / Working Style.
- [ ] `dev-framing` — click `Dev`: the URL becomes `/en/cv/dev` and the page returns to today's developer tagline, profile and three capability bullets.
- [ ] `switch-composes` — from `/ru/cv/dev`, flip the locale then the variant, and the reverse; each control preserves the other's choice.
- [ ] `canonical` — view source on `/en/cv/cto`: `<link rel="canonical">` points at `/en/cv`. `/en/cv` and `/en/cv/dev` carry none.
- [ ] `cv-print` — print `/en/cv` and `/en/cv/dev`: the switch and picker are hidden, and the case-study address appears once, in the Playgram entry.
- [ ] `shared-sections` — compare both variants' Experience, Tech Stack, Education and Contact: identical, and Playgram is still titled "Developer".
- [ ] `home-nav` — open `/`: no in-page nav, `/dev` and `/contact` only, and the footer's *See also* reaches `/writing` and `/music`.
- [ ] `standalone-pages` — `/writing` and `/music` render their content under a `/writing` / `/music` h1 with a working back-link.
- [ ] `cv-links` — every CV link on the site (dev intro, *Read full CV*) lands on `/cv` and shows the CTO framing.
- [ ] `sitemap` — `/sitemap.xml` lists `/writing`, `/music` and both locales' `/cv` and `/cv/dev`, and omits `/cv/cto`.
- [ ] `dark-mode` — the CV, home, `/writing` and `/music` all render correctly in the dark scheme, switch included.
- [ ] `ru-copy` — `/ru/cv` reads as Russian prose rather than transliteration, and says 2020 rather than 2019.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `default-framing` | integration | ❌ | Assert the built `out/en/cv.html` contains the CTO tagline and the engagement labels |
| `dev-framing` | integration | ❌ | Same over `out/en/cv/dev.html`, asserting the developer tagline |
| `switch-composes` | e2e | ❌ | Drive both controls in sequence and assert the resulting pathname |
| `canonical` | integration | ❌ | Assert `alternates.canonical` from `generateCvMetadata(locale, 'cto')` and its absence otherwise |
| `cv-print` | manual-only | — | Print layout needs a human's eye; the address-once rule is the part a test could reach |
| `shared-sections` | unit | ❌ | `cvMessages` returns the same `experience`/`techStack`/`education`/`contact` for both variants |
| `home-nav` | integration | ❌ | Assert the built `out/index.html` has no `#music`/`#writing` anchors and does carry the footer links |
| `standalone-pages` | integration | ❌ | Assert both routes build and their h1 is the slash heading |
| `cv-links` | integration | ❌ | Grep the built home page for `href="/cv"` and assert no `/cv/cto` |
| `sitemap` | unit | ❌ | `sitemap()` output over the fixed route set — the plainest "pure function of its input" case here |
| `dark-mode` | manual-only | — | Colour-scheme rendering is a visual judgment |
| `ru-copy` | manual-only | — | Translation quality is not assertable; the 2020 figure is the only mechanical half |

`pnpm build` covers "every route builds and renders" for all of the above; none of the rows has a behavioural test yet, and `cvMessages` plus `sitemap()` are the two the testing section would take first.

https://claude.ai/code/session_011DEUCnqZjMP3CJYNz5pEms

---

## Comments

### Comment by @vzakharov on 2026-09-08T11:50:52Z

[https://github.com/vzakharov/vovazakharov.com/pull/31#issuecomment-5584682802](https://github.com/vzakharov/vovazakharov.com/pull/31#issuecomment-5584682802)

Proposed squash title/body:

```
feat: reposition the site and CV around hands-on-CTO delivery (pr #31)
```

```
The site pitched a developer looking for work, while the evidence it
already carried — a live product rebuilt in 158 days, an engineering
platform handed over and still run by the engineers who took it —
supports a different offer. Both halves of the site now make that
offer, and the developer framing stays as the offer's evidence rather
than being replaced by it.

The CV comes in two framings from one implementation. Only prose that
differs exists twice: `cv.variants.cto` holds `metadata`,
`header.tagline` and `profile`, and `cvMessages` merges it over the base
catalogue a section at a time, so a key the variant does not restate
cannot drift. `whatIOffer` needs no override at all — its subsections
are keyed blocks with the per-variant order in code, the shape
`experience` and `techStack` already use. Nothing retitles history:
Playgram is "Developer" in both.

One route answers every CV address. `app/cv/[[...variantAndLocale]]`
resolves `/cv`, `/cv/<variant>` and `/cv/<variant>/<locale>`, each
omitted segment falling back, so the shorter forms render in place and
declare the fully-specified twin canonical — only the twins are in the
sitemap. That leaves no redirect page anywhere on the site, which
matters because a static export cannot serve a real one: `redirect()`
under `output: 'export'` emits a blank page that moves only once JS runs
(#32). next-intl's `createNavigation` goes with the locale prefix,
having no suffix mode to express this shape, so the CV's two controls
build their hrefs from `cvPath` and `shared/i18n` keeps the locale list
and nothing else.

The home page becomes the pitch: writing and music each get a page of
their own behind a *See also* footer line, the in-page nav goes, the
case-studies block folds into a featured project grid, and Professional
Work becomes Work Highlights — ordered by weight, each entry carrying
the organisation's own mark. That puts three page slices on `Section`
and `BackToHome`, so those and a new `PageShell` move to `shared/ui`:
FSD allows only downward imports, and none of the three composes a page
or carries domain meaning, which is what keeps them out of a `widgets/`
layer invented to hold them. The unlocalized page routes sit in
`shared/config` for the same reason, and `TECH_STACKS` beside them is
the one source for every stack line — the same three facts had been
spelled three ways, across the project cards, the highlight cards and
the CV. One string serving both locales is the accepted cost: two
descriptors read in English on the ru CV.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

---

_Generated by [Claude Code](https://claude.ai/code)_


---

## Review threads

### `app/[locale]/cv/[variant]/page.tsx`:1

**@vzakharov** — 2026-09-08T16:51:31Z

why not make variant optional instead of hard-coding the default variant? we discussed this in pre-plan, but apparently I missed the gist (this is for discussion not editing at this point)

**@vzakharov** — 2026-09-08T17:55:23Z

Discussion only, no code change. I spiked it rather than guess, then reverted — here is what it costs.

**It works.** `app/[locale]/cv/[[...variant]]/page.tsx` with `generateStaticParams` returning `{ locale, variant: [] }` alongside `{ locale, variant: [v] }` builds clean under `output: 'export'` and emits exactly the right three files per locale: `out/en/cv.html`, `out/en/cv/cto.html`, `out/en/cv/dev.html`, with the CTO framing served in place at the bare route. So the "two files for one page" objection is real and collapsible — 4 route files down to 2 if the unlocalized side goes the same way.

**What it costs is one distinction.** `generateCvMetadata(locale, variant?)` treats an absent variant as *the bare route itself*: no variant means `path: /en/cv` and no `canonical`, whereas `variant: 'cto'` means `path: /en/cv/cto` with `canonical: /en/cv`. That is deliberate — the default variant's own address points search back at the bare route instead of competing with it.

Collapse the routes and both addresses arrive at the same page with the same resolved variant, so the bare route inherits the variant's metadata. Measured off the spike's build:

| | `out/en/cv.html` og:url |
| --- | --- |
| on this branch | `https://vovazakharov.com/en/cv` ✅ |
| spike | `https://vovazakharov.com/en/cv/cto` ❌ |

The bare route advertises the variant address as its own. Fixable — `resolve()` returns `DEFAULT_CV_VARIANT` for rendering and `undefined` for metadata — but that is one param with two resolutions depending on which export reads it, which is a subtler thing than two files that each say one plain thing.

**My read:** not worth it as a duplication fix. The two files are ~10 and ~12 lines and neither branches. It *is* worth it if you want the bare route to stop being a special case in the metadata too — i.e. `/cv` becomes literally "the CV, variant unspecified" and the canonical/og pairing goes away. That is a positioning decision, not a refactor, so it is yours. Happy to land either.

---
_Generated by [Claude Code](https://claude.ai/code)_

**@vzakharov** — 2026-09-08T22:35:50Z

Pls dumb it down for me, not sure I understand. If a person goes to en/cv and sees en/cv/cto (both in url and in terms of content), I don't mind, and would likely actually prefer the latter being canonical: then in the search people see "ok, this one's for cto, and it sits on en/cv/cto". If you're talking about something else when you say "canonical", pls explain.

**@vzakharov** — 2026-09-08T23:21:30Z

Explanation only, no code change yet.

**What `canonical` is.** One line in a page's `<head>`: `<link rel="canonical" href="…">`. It doesn't redirect anyone and no visitor ever sees it. Its only job is to tell a search engine "when two URLs serve the same content, the real one is this" — so the crawler indexes one of them and shows that one in results.

**What the build actually emits today** (measured off `out/`, this branch):

| page | its `rel="canonical"` | its `og:url` |
| --- | --- | --- |
| `/en/cv` | *none* | `https://vovazakharov.com/en/cv` |
| `/en/cv/cto` | → `https://vovazakharov.com/en/cv` | `https://vovazakharov.com/en/cv/cto` |
| `/en/cv/dev` | *none* | `https://vovazakharov.com/en/cv/dev` |

So right now `/en/cv/cto` says "don't index me, index `/en/cv`", and a searcher sees `vovazakharov.com/en/cv`. `/en/cv/dev` carries no canonical because it isn't a duplicate of anything — it's the only address for the dev CV.

**What you're describing is the reverse, and it's a fine call.** Nothing about it is technically worse; it's a choice about which string a searcher reads. But it's four places, not one, or the flip is half-done:

1. `canonical` on `/{locale}/cv` points at `/{locale}/cv/cto` instead of the current reverse — `generateCvMetadata` in `src/pages/cv/lib/cv-metadata.ts`.
2. `og:url` on `/{locale}/cv` becomes `/{locale}/cv/cto`, which follows from the same line.
3. **The sitemap flips.** It currently lists `/{locale}/cv` and `/{locale}/cv/dev` and deliberately omits `/{locale}/cv/cto` (`src/app/lib/sitemap.ts`, with a comment saying why). Flipping means listing `cto` and omitting the bare route.
4. **The variant switch flips.** `cvVariantPath` in `cv-urls.ts` sends the default variant to the bare route, so clicking "CTO" today puts `/en/cv` in the address bar. You said you want `/en/cv/cto` in the URL too — that's this function.

**And it un-blocks the other thread.** The one cost I measured against collapsing `[variant]` into `[[...variant]]` was that the bare route would inherit `og:url: /en/cv/cto`. If `/en/cv/cto` is the address you want advertised, that stops being a cost and becomes the goal — so the collapse gets free, and 4 route files become 2.

Say go and I'll land both together: `/en/cv/cto` as the canonical, indexed, addressed CV, `/en/cv` kept as a short alias pointing at it.

---
_Generated by [Claude Code](https://claude.ai/code)_

**@vzakharov** — 2026-09-08T23:30:21Z

go :-) you seem to be describing exactly what I want

**@vzakharov** — 2026-09-08T23:52:57Z

Landed in 5b4f244, all four places plus the collapse.

Built output, `out/` on this branch:

| page | `rel="canonical"` | `og:url` |
| --- | --- | --- |
| `/en/cv` | → `/en/cv/cto` | `/en/cv/cto` |
| `/en/cv/cto` | → itself | `/en/cv/cto` |
| `/en/cv/dev` | → itself | `/en/cv/dev` |

The sitemap now lists `/{locale}/cv/cto` and `/{locale}/cv/dev` and omits the bare route, and the switch puts `/en/cv/cto` in the address bar. `/en/cv` still serves the CTO CV in place — it is the short alias, it just no longer claims to be the indexed one.

The rule that fell out is simpler than the conditional I was carrying: **every CV page declares its own variant's address canonical.** The bare route resolves to `cto` before metadata is built, so it inherits that line rather than needing a special case — which is exactly what made the collapse free. `[variant]` → `[[...variant]]` on both sides, so four route files are two, and `generateStaticParams` emits the bare address alongside the two named ones.

One consequence worth naming: `/cv` (unlocalized) now hops to `/en/cv/cto` rather than `/en/cv`. Same reasoning — the address that names the framing is the one to land on. Say the word if you'd rather it kept the short form.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `app/[locale]/cv/[variant]/page.tsx`:11

```diff
@@ -0,0 +1,34 @@
+import { routing, toLocale } from '@/shared/i18n';
+
+import {
+  CV_VARIANTS,
+  CvPage,
+  generateCvMetadata,
+  toCvVariant,
+} from '@/pages/cv';
+
+type Props = {
+  params: Promise<{ locale: string; variant: string }>;
```

**@vzakharov** — 2026-09-08T16:54:04Z

type-overlap doesn't cover this, but consider it covered, no hardcoded types in generic params (otherwise we can't check overlap). Better yet, approach via zod schemas

**@vzakharov** — 2026-09-08T17:55:48Z

Taken as a rule, and applied in ea186a5 — no inline object literals in generic params anywhere in the route layer:

- `WithStringLocale` (`{ locale: string }`) sits in `shared/i18n` beside `toLocale`, which narrows it
- `WithStringVariant` (`{ variant: string }`) sits in `pages/cv/lib/cv-variants` beside `toCvVariant`
- `WithParams<Params>` (`{ params: Promise<Params> }`) in `shared/typings`

So every page's props are now `WithParams<WithStringLocale & WithStringVariant>` and friends, and the members are visible to `pnpm type-overlap` instead of hidden inside a generic argument. The catch-all's `{ slug: string[] }` got the same treatment as a local `WithSlugSegments`. Naming follows the `With<Type><Noun>` collision rule in `scripts/type-overlap-check.README.md` § 3, since `{ variant: CvVariant }` already holds `WithCvVariant`.

The gate found two more things once the shapes were named, both now based: `caseStudyHref?` was declared by both `ExperienceCardProps` and `ProjectCardProps` → `WithOptionalCaseStudyHref` in `shared/typings`; and `Titled & WithChildren` was spelled by both `TitledBlock` (cv) and my new `HighlightCardProps` (home) → `TitledBlock` promoted to `shared/typings`. `pnpm type-overlap` is clean.

**On zod: I did not, and I would argue against it here.** These params are not a boundary in the usual sense — `generateStaticParams` enumerates every value that will ever exist, so an unroutable segment cannot reach the page at runtime; the export simply never emits that file. `toLocale`/`toCvVariant` already are the parse-don't-cast step CLAUDE.md § "Validate at boundaries" asks for, they throw at build rather than at render, and they return the narrowed union the page actually wants. A zod schema would buy the same narrowing, pull a runtime dependency into the route layer that `output: 'export'` throws away anyway, and give back `string` unions we would then have to keep in sync with `CV_VARIANTS`. Where zod earns its keep in this repo is the content frontmatter, which is authored text nobody enumerates.

Happy to be overruled if you want the consistency of one validation idiom repo-wide — say so and I will convert them.

---
_Generated by [Claude Code](https://claude.ai/code)_

**@vzakharov** — 2026-09-08T22:36:55Z

> they throw at build rather than at render,

how and when and what will they throw?

**@vzakharov** — 2026-09-08T23:21:31Z

Explanation only, no code change.

**What.** A plain `Error`, from one of two functions:

- `toLocale` (`src/shared/i18n/routing.ts`) → `Unsupported locale: <value>`
- `toCvVariant` (`src/pages/cv/lib/cv-variants.ts`) → `Unsupported CV variant: <value>`

**When.** They're called from `generateMetadata` and from the page component. Under `output: 'export'` those two functions run **only** inside `next build` — every route is prerendered to a file, once per `generateStaticParams` entry, and nothing on the CDN ever runs them again. So "at build" is literal rather than a figure of speech: there is no later moment at which they *could* throw. A throw during prerender fails `next build` with a non-zero exit, the deploy workflow stops, and nothing publishes.

**What would actually trigger one.** Only `generateStaticParams` and the narrowing function disagreeing. Both read the same constants — `routing.locales` and `CV_VARIANTS` — so an unroutable segment cannot reach the page: the export simply never emits that file. In normal operation the throw is unreachable, and that is the point rather than a weakness. The functions exist to turn the `string` a route param arrives as into `Locale` / `CvVariant`; the throw is what makes that narrowing sound instead of a cast. It fires the day someone adds a segment to one list and forgets the other, which is exactly when you want a red build.

**And the honest limit on what I argued against zod.** Zod would throw at the same moment, for the same reason — timing was never the difference, and I shouldn't have leant on it as though it were. The actual difference is that `CV_VARIANTS` stays the single source of truth and the narrowed union comes back for free, where a schema would restate the values and hand back a `string` union to keep in sync. That argument stands on its own; the build-vs-render framing added nothing to it.

---
_Generated by [Claude Code](https://claude.ai/code)_

**@vzakharov** — 2026-09-08T23:31:39Z

but well your isLocale (which typeguards, and failing which then throws) is exactly handwritten machinery that's implemented with a single zod schema. This doesn't keep `CV_VARIANTS` or `locales` from being the single source of truth because they would be defined first, followed by `z.enum(...)` (or was it `z.literal(...)`)over them. Am I missing smth?

**@vzakharov** — 2026-09-08T23:53:14Z

You're not missing anything — you're right, and I was wrong. Converted in 5b4f244.

`z.enum(CV_VARIANTS)` reads the same const the type reads and infers `'cto' | 'dev'` back, so there is no second list and nothing to keep in sync. That was the last of my three reasons standing, and it doesn't. Both parses are now schemas:

```ts
const variantSegments = z
  .array(z.enum(CV_VARIANTS))
  .max(1)
  .optional()
  .transform((segments) => segments?.[0] ?? DEFAULT_CV_VARIANT);

export const cvVariantParamsSchema = z.object({ variant: variantSegments });

export const cvParamsSchema = cvVariantParamsSchema.extend({
  locale: z.enum(routing.locales),
});
```

so a route is one `cvParamsSchema.parse(await params)` and `isLocale`/`toLocale`/`isCvVariant`/`toCvVariant` are gone.

**One thing neither of us had, and it's the reason this took a detour.** Zod is not free where it lands. First pass I put `localeSchema` in `shared/i18n` beside `routing` — the obvious home. That segment's barrel is what every client component reaches for `Link` and `usePathname`, and Turbopack won't tree-shake a `z.enum(...)` call out of a barrel it can't prove pure. Measured:

| | `out/_next/static/chunks` | zod in a client chunk |
| --- | --- | --- |
| before | 1,039,701 B | no |
| schema in `shared/i18n` | 1,417,062 B | yes — 389 kB raw, 89 kB gzipped, on all six CV pages |
| schema in `pages/cv/lib` | 1,039,570 B | no |

89 kB gzipped shipped to a browser to validate a segment only `next build` ever reads, since `generateStaticParams` enumerates every value under `output: 'export'`. So the schemas live in `pages/cv/lib/cv-route-params.ts` — the CV is the only localized route, and `.claude/rules/fsd.md`'s "no insignificant slices" says a thing with one consumer belongs inside it. The docstring there says so as a don't-move-this, since nothing else would catch the regression. If a second localized route shows up, the locale half moves down and `shared/i18n` needs a barrel-free entry point for it.

That leaves timing and sync as arguments I made that were wrong, and placement as the real constraint I hadn't looked for.

---
_Generated by [Claude Code](https://claude.ai/code)_

**@vzakharov** — 2026-09-09T00:06:57Z

barrels can be different in fsd, e.g. you can have index.server-only.ts and import from there stuff that you don't want to end up on the client. See if it's a better option, or if you still prefer your approach.

**@vzakharov** — 2026-09-09T00:40:43Z

Tested it rather than argued it, and it comes out split: the idea is right about FSD and blocked by this repo. Neither placement is what landed.

**Steiger accepts a second entry point; `boundaries/dependencies` rejects it.** I built exactly what you described — `src/shared/i18n/locale-schema.ts` carrying `import 'server-only'` and the `z.enum`, re-exported from `src/shared/i18n/index.server-only.ts`, imported from `pages/cv/lib`:

```
pnpm lint:fsd  → √ No problems found!
pnpm exec eslint src/shared/i18n src/pages/cv
  → src/pages/cv/lib/cv-route-params.ts:6:30  error
    There is no policy allowing dependencies from elements of type "pages"
    ... to elements of type "shared" and captured values: segmentName="i18n"
```

`eslint.config.ts` defines `const PUBLIC_API = 'index.ts'` — a single literal, used as the `fileInternalPath` in every downward policy. So your option isn't a local move; it's a change to what "public API" means repo-wide, and once `PUBLIC_API` is a list, `index.*.ts` becomes a legal entry point on *every* slice and segment with nothing narrowing it back to the one that wanted it. That's the cost, and it's the part I couldn't have argued from memory.

**Your read on the weak part was right regardless.** The docstring was the weak thing — a note asking the next person not to move a file, which nothing reads on the way to moving it. So I took the enforcement without the barrel: `cv-route-params.ts` now opens with `import 'server-only'`, which makes a client component reaching for these schemas a build error instead of a silent 89 kB, and the docstring shrank to the one fact it still has to carry. It's the pattern every module under `shared/content` already uses, and I should have reached for it the first time instead of writing prose.

**Where they live now is also less of a judgement call than it was**, since 9f1c4c7 collapsed the routes: with `app/[locale]/` gone, the CV is the only place any locale is ever parsed from a URL, so both halves of the schema have exactly one consumer and `.claude/rules/fsd.md`'s "no insignificant slices" points the same way it did before.

If you'd still rather have the schema next to `routing` and are fine widening `PUBLIC_API` to a list, say so — it's a small diff and I'll take the eslint change with it.

---
_Generated by [Claude Code](https://claude.ai/code)_


**@vzakharov** — 2026-09-09T00:56:23Z

If "boundaries don't allow" is the only argument -- let's rewrite the boundaries; check `playgramai/playgramapp` for how it works there (use the shimmed gh, otherwise the harness won't allow you to clone it).

---

### `app/cv/[variant]/page.tsx`:1

**@vzakharov** — 2026-09-08T16:55:32Z

why do we need this hardcode if currently, i.e. on vovazakharov.com/cv, we have an auto-redirect to vovazakharov.com/en/cv? I don't like the idea of boilerplating everything in code

(Explain not edit yet.)

**@vzakharov** — 2026-09-08T17:55:47Z

Explanation, no code change — and the premise is worth correcting first: **there is no auto-redirect.** `vovazakharov.com/cv` → `/en/cv` happens because `app/cv/page.tsx` exists on `main` and calls `redirect(cvRoute(routing.defaultLocale))`. It is the same hardcode, already committed, just older than this branch.

The reason it is hand-written is `output: 'export'`: next-intl does locale redirection in middleware, and a static export has no middleware — nothing runs between the CDN and the file. So every unlocalized entry point needs a file that redirects, and `/cv/cto` needed one for exactly the reason `/cv` already had one. Nothing was added to the pattern; the pattern gained a segment.

That said, your objection lands, and there is a real reduction available: `app/cv/page.tsx` + `app/cv/[variant]/page.tsx` collapse into one `app/cv/[[...variant]]/page.tsx`, same as the localized pair. I spiked the localized half and it builds correctly under static export (details in the thread on `app/[locale]/cv/[variant]/page.tsx`) — and the metadata objection that makes me hesitate there does **not** apply here, since a redirect page's metadata is never the canonical one anyone indexes. So the unlocalized side is the cheaper, safer half of that collapse: 2 files → 1, no distinction lost.

Say go and I will land that in this PR.

---
_Generated by [Claude Code](https://claude.ai/code)_

**@vzakharov** — 2026-09-08T22:39:00Z

what's "spiked"? you mention it second time, I didn't understand it the first time, but by the second time it seems it matters.

also: how do we do "redirect" if it's not supposed to work in a static export at all?

**@vzakharov** — 2026-09-08T23:21:32Z

Two answers, and the second one corrects me.

**"Spiked"** — jargon I should have unpacked the first time. A *spike* is a throwaway implementation written only to find out whether something works: you build it, measure it, and delete it. That's what I did with `[[...variant]]` — wrote it, ran `next build`, read the emitted files, then `git checkout`'d the lot. Nothing from it is on this branch, and nothing from it will be unless you say go. Read it as "I tried it in a scratch copy and threw it away."

**"How do we redirect at all in a static export?"** — better question than I gave it credit for, because the honest answer isn't what my previous comment implied. I said a static export has no middleware (true) and left the impression that `redirect()` therefore does something server-side instead. It doesn't. Here is what `/cv` actually *is*, measured off `out/` on this branch:

- **No HTTP redirect.** GitHub Pages serves `out/cv.html` with a `200`.
- **No `<meta http-equiv="refresh">` either** — I grepped every `.html` in `out/`; there isn't one anywhere.
- What the file contains: an empty body (`<div hidden></div>`) plus, inside the RSC payload, `NEXT_REDIRECT;replace;/en/cv;307`.

So the redirect happens **on the client, after hydration**: browser fetches a blank page, the JS chunks load, the router reads that payload and does a history `replace` to `/en/cv`. The `307` in there is a marker in Next's own payload format, not a status code anybody sends.

It works in a browser, which is why it has never looked broken. What it costs:

- with JS disabled, or for a crawler that doesn't execute JS, `/cv` is a blank page that goes nowhere;
- a visible flash of nothing on a slow connection, since the redirect waits on the bundle;
- `/cv` and `/cv/cto` are indexable blank pages as far as a non-executing crawler is concerned.

That's worth fixing on its own, separately from the file-count question, and it's cheap: a redirect page can render `<meta httpEquiv="refresh" content="0;url=/en/cv" />` itself, which needs no JS and is what a crawler follows. Optionally keep `redirect()` alongside it so a hydrated browser still gets the instant client-side hop.

So, three separable calls, and I'll do whichever you want:

1. **Give the redirect pages a real `meta refresh`.** My recommendation regardless of the rest — it's the actual bug in here.
2. **Collapse `app/cv/page.tsx` + `app/cv/[variant]/page.tsx` into `app/cv/[[...variant]]/page.tsx`.** 2 files → 1, nothing lost, since a redirect page's metadata is never what gets indexed.
3. The localized half of that collapse, which is the canonical question over on the other thread.

---
_Generated by [Claude Code](https://claude.ai/code)_

**@vzakharov** — 2026-09-08T23:35:00Z

if what you said earlier is that the first comment's resolution solves this one two (to option 2, as I understand), then let's do this. If not, let me know.

**@vzakharov** — 2026-09-08T23:53:23Z

Yes, it does — the canonical decision unblocked option 3, and option 2 came along with it. Both landed in 5b4f244.

`app/cv/page.tsx` + `app/cv/[variant]/page.tsx` → `app/cv/[[...variant]]/page.tsx`, and the localized pair collapsed the same way, so the four route files you were looking at are two. `/cv`, `/cv/cto` and `/cv/dev` all still build; the redirect targets are now `/en/cv/cto`, `/en/cv/cto` and `/en/cv/dev`.

**Option 1 — the `meta refresh` — I have not done**, since you named option 2 and I'd rather not widen the PR on my own read. It is still the actual defect in here: those three files are blank pages that only move if the browser runs JS, so a crawler that doesn't sees nothing. Two lines on the redirect page fixes it and it is independent of everything above. Say go and it's in.

---
_Generated by [Claude Code](https://claude.ai/code)_

**@vzakharov** — 2026-09-09T00:08:14Z

hmm, I don't want a blank page on non-js crawlers of course. let's file a follow-up issue; but I want an elegant, durable solution, not hand-writing a meta in every spot

**@vzakharov** — 2026-09-09T00:40:57Z

Filed as #32, and the route collapse in the thread below removed every current instance while I was at it — `app/cv/[[...variantAndLocale]]` serves `/cv`, `/cv/cto` and `/cv/dev` in place, so there is no `redirect()` left anywhere in the tree. `grep -rl NEXT_REDIRECT out/` now hits only Next's own router chunk.

So the issue is written against the trap rather than a live bug, which is the honest framing: `redirect()` type-checks, works when you click it, and nothing in the repo tells you it degrades to a blank page. #32 asks for the durable shape rather than the meta — prefer no redirect at all (the collapse is the pattern), one `staticRedirect` primitive where a moved URL genuinely has to keep resolving, and a lint rule rejecting `redirect()` under `app/**` as the actual enforcement, since the constraint is invisible from the call site.

Not fixed here: it's independent of this PR's scope, and this PR happens to leave nothing to fix.

---
_Generated by [Claude Code](https://claude.ai/code)_


---

### `src/pages/home/ui/dev-section.tsx`:25

```diff
@@ -1,16 +1,33 @@
-import { List, ListItem, SimpleGrid, Stack, Text, Title } from '@mantine/core';
+import {
+  Anchor,
+  List,
+  ListItem,
+  SimpleGrid,
+  Stack,
+  Text,
+  Title,
+} from '@mantine/core';
+
+import {
+  collectionRoute,
+  documentRoute,
+  FEATURED_CASE_STUDY,
+} from '@/shared/content';
+import { Card, InternalLink, Section, Subheading } from '@/shared/ui';
 
-import { collectionRoute, renderPrimaryDocuments } from '@/shared/content';
-import { Card, InternalLink } from '@/shared/ui';
-
-import classes from './dev-section.module.scss';
 import { ProjectCard } from './project-card';
-import { Section, Subheading } from './section';
+import { TechLine } from './tech-line';
+
+const CASE_STUDY_ROUTE = documentRoute('case-studies', FEATURED_CASE_STUDY);
 
-export async function DevSection() {
-  // Titles come from the documents themselves, so a renamed piece cannot drift.
-  const caseStudies = await renderPrimaryDocuments('case-studies');
+/** Projects the grid names rather than cards, each a thing a big player later shipped as a standard. */
+const EARLIER_PROJECTS = [
+  { name: 'write', gloss: 'an LLM-agnostic text processor' },
```

**@vzakharov** — 2026-09-08T17:02:41Z

a BYOK AI-first text processor

**@vzakharov** — 2026-09-08T17:52:38Z

Fixed in ea186a5 — `a BYOK AI-first text processor`.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/pages/home/ui/dev-section.tsx`:26

```diff
@@ -1,16 +1,33 @@
-import { List, ListItem, SimpleGrid, Stack, Text, Title } from '@mantine/core';
+import {
+  Anchor,
+  List,
+  ListItem,
+  SimpleGrid,
+  Stack,
+  Text,
+  Title,
+} from '@mantine/core';
+
+import {
+  collectionRoute,
+  documentRoute,
+  FEATURED_CASE_STUDY,
+} from '@/shared/content';
+import { Card, InternalLink, Section, Subheading } from '@/shared/ui';
 
-import { collectionRoute, renderPrimaryDocuments } from '@/shared/content';
-import { Card, InternalLink } from '@/shared/ui';
-
-import classes from './dev-section.module.scss';
 import { ProjectCard } from './project-card';
-import { Section, Subheading } from './section';
+import { TechLine } from './tech-line';
+
+const CASE_STUDY_ROUTE = documentRoute('case-studies', FEATURED_CASE_STUDY);
 
-export async function DevSection() {
-  // Titles come from the documents themselves, so a renamed piece cannot drift.
-  const caseStudies = await renderPrimaryDocuments('case-studies');
+/** Projects the grid names rather than cards, each a thing a big player later shipped as a standard. */
+const EARLIER_PROJECTS = [
+  { name: 'write', gloss: 'an LLM-agnostic text processor' },
+  { name: 'mindy', gloss: 'group AI chat' },
```

**@vzakharov** — 2026-09-08T17:03:23Z

chatgpt before chatgpt

**@vzakharov** — 2026-09-08T17:52:40Z

Fixed in ea186a5 — `ChatGPT before ChatGPT`.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/pages/home/ui/dev-section.tsx`:45

```diff
@@ -19,114 +36,101 @@ export async function DevSection() {
           that doesn’t, and stuff that’s still a work in progress.
         </Text>
         <Text size="lg" lh={1.625}>
-          I’m currently looking for new challenges, so have a look at my{' '}
+          These days I mostly do it as a hands-on CTO for hire — taking an idea
+          to production, or putting a team that already exists onto agent rails.
+          My{' '}
           <InternalLink href="/cv" inherit>
             CV
           </InternalLink>{' '}
-          if you’re looking for new people.
-        </Text>
-      </Stack>
-
-      <Subheading>Case studies</Subheading>
-
-      <Stack gap={16}>
-        {caseStudies.map(({ document, rendered }) => (
-          <InternalLink
-            key={document.slug}
-            href={document.route}
-            underline="never"
-            c="inherit"
-            display="block"
-            className={classes['caseStudyLink']}
-          >
-            <Card>
-              <Title order={4} mb={8}>
-                {rendered.title}
-              </Title>
-              <Text lh={1.625}>{document.frontmatter.description}</Text>
-            </Card>
-          </InternalLink>
-        ))}
-        <Text size="sm">
-          <InternalLink href={collectionRoute('case-studies')} inherit>
-            All case studies, including the shorter cuts →
-          </InternalLink>
+          has the numbers.
```

**@vzakharov** — 2026-09-08T17:04:04Z

I'd rather have it as a cta button ("Read full CV") under this block

**@vzakharov** — 2026-09-08T17:52:42Z

Done in ea186a5 — the inline CV link is gone and there is a `Read full CV` button under the intro block (`variant="default"`, left-aligned via `align="flex-start"` on the Stack).

One judgement call worth flagging: the Work Highlights list used to end with its own `Read full CV →` text link, and I removed it rather than have the same label twice on one page. Say the word and it comes back — a quiet link after a long list is a reasonable thing to want.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/pages/home/ui/dev-section.tsx`:39

```diff
@@ -19,114 +36,101 @@ export async function DevSection() {
           that doesn’t, and stuff that’s still a work in progress.
         </Text>
         <Text size="lg" lh={1.625}>
-          I’m currently looking for new challenges, so have a look at my{' '}
+          These days I mostly do it as a hands-on CTO for hire — taking an idea
```

**@vzakharov** — 2026-09-08T17:04:34Z

"mostly do it" is misleading. More like "These days I'm looking for a hands-on CTO position..."

**@vzakharov** — 2026-09-08T17:52:41Z

Fixed in ea186a5. Now: "These days I’m looking for a hands-on CTO position — taking an idea to production, or putting a team that already exists onto agent rails." Dropped the "for hire" too, since "looking for a position" already says the availability.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/pages/cv/ui/cv-page.tsx`:1

**@vzakharov** — 2026-09-08T17:07:19Z

riding along: let's dad `vovazakharov.com` to where `vzakharov@gmail.com` sites under the main heading in the cv page

**@vzakharov** — 2026-09-08T17:56:07Z

Done in ea186a5 — the header line under the name is now `vzakharov@gmail.com · vovazakharov.com`, both linked, reading the address off `cv.website` so it stays one source with the print footer.

Ride-along from the DRY pass: the email anchor was already spelled twice (header + contact block) and adding the site address made a second pair, so both became tiny local `EmailLink` / `WebsiteLink` components in `cv-sheet.tsx`. Three call sites collapse onto two components. Screenshot of the header in `docs/remove-before-merging/cv-header.png`.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/pages/home/ui/dev-section.tsx`:61

```diff
@@ -19,114 +36,101 @@ export async function DevSection() {
           that doesn’t, and stuff that’s still a work in progress.
         </Text>
         <Text size="lg" lh={1.625}>
-          I’m currently looking for new challenges, so have a look at my{' '}
+          These days I mostly do it as a hands-on CTO for hire — taking an idea
+          to production, or putting a team that already exists onto agent rails.
+          My{' '}
           <InternalLink href="/cv" inherit>
             CV
           </InternalLink>{' '}
-          if you’re looking for new people.
-        </Text>
-      </Stack>
-
-      <Subheading>Case studies</Subheading>
-
-      <Stack gap={16}>
-        {caseStudies.map(({ document, rendered }) => (
-          <InternalLink
-            key={document.slug}
-            href={document.route}
-            underline="never"
-            c="inherit"
-            display="block"
-            className={classes['caseStudyLink']}
-          >
-            <Card>
-              <Title order={4} mb={8}>
-                {rendered.title}
-              </Title>
-              <Text lh={1.625}>{document.frontmatter.description}</Text>
-            </Card>
-          </InternalLink>
-        ))}
-        <Text size="sm">
-          <InternalLink href={collectionRoute('case-studies')} inherit>
-            All case studies, including the shorter cuts →
-          </InternalLink>
+          has the numbers.
         </Text>
       </Stack>
 
       <Subheading>Featured Projects</Subheading>
 
       <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
+        <ProjectCard
+          title="Playgram.ai"
+          description="A live, feature-rich AI chat product lifted off a no-code builder into a production Next.js codebase in 158 days, and in production for its users the whole way through."
+          techStack="Next.js 16, TypeScript, Claude Code"
+          footer={
+            <Text size="sm" mt={12}>
+              <InternalLink href={CASE_STUDY_ROUTE} inherit>
+                Read the case study →
+              </InternalLink>
+            </Text>
```

**@vzakharov** — 2026-09-08T17:08:13Z

Put the case study right under the title -- same pattern as in the respective experience box

**@vzakharov** — 2026-09-08T17:52:55Z

Done in ea186a5 — the case-study link now renders straight under the title, same position `ExperienceCard` puts it in. It stopped being a `footer` prop and became `caseStudyHref`, matching `ExperienceCard`’s own prop name.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/pages/home/ui/dev-section.tsx`:82

```diff
@@ -19,114 +36,101 @@ export async function DevSection() {
           that doesn’t, and stuff that’s still a work in progress.
         </Text>
         <Text size="lg" lh={1.625}>
-          I’m currently looking for new challenges, so have a look at my{' '}
+          These days I mostly do it as a hands-on CTO for hire — taking an idea
+          to production, or putting a team that already exists onto agent rails.
+          My{' '}
           <InternalLink href="/cv" inherit>
             CV
           </InternalLink>{' '}
-          if you’re looking for new people.
-        </Text>
-      </Stack>
-
-      <Subheading>Case studies</Subheading>
-
-      <Stack gap={16}>
-        {caseStudies.map(({ document, rendered }) => (
-          <InternalLink
-            key={document.slug}
-            href={document.route}
-            underline="never"
-            c="inherit"
-            display="block"
-            className={classes['caseStudyLink']}
-          >
-            <Card>
-              <Title order={4} mb={8}>
-                {rendered.title}
-              </Title>
-              <Text lh={1.625}>{document.frontmatter.description}</Text>
-            </Card>
-          </InternalLink>
-        ))}
-        <Text size="sm">
-          <InternalLink href={collectionRoute('case-studies')} inherit>
-            All case studies, including the shorter cuts →
-          </InternalLink>
+          has the numbers.
         </Text>
       </Stack>
 
       <Subheading>Featured Projects</Subheading>
 
       <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
+        <ProjectCard
```

**@vzakharov** — 2026-09-08T17:08:31Z

let's make the card lead to playgram.ai (making sure "Read the case study" still leads where it tneeds)

**@vzakharov** — 2026-09-08T17:52:56Z

Done in ea186a5. This needed a structural change, because an anchor cannot nest: the card was previously a `CardLink` wrapped *around* the card, so putting a working case-study link inside it was invalid HTML.

`CardLink` is now rendered as the card’s **first child** — an absolutely-positioned overlay filling the card — and the case-study line carries `.aboveCardLink` (`position: relative`), so it paints over the overlay and keeps its own click. Verified by tinting the overlay red in a local render: the whole card washed red except that one line, which is exactly the hit-testing wanted.

So: card → playgram.ai, "Read the case study" → the case study.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/pages/home/ui/dev-section.tsx`:55

```diff
@@ -19,114 +36,101 @@ export async function DevSection() {
           that doesn’t, and stuff that’s still a work in progress.
         </Text>
         <Text size="lg" lh={1.625}>
-          I’m currently looking for new challenges, so have a look at my{' '}
+          These days I mostly do it as a hands-on CTO for hire — taking an idea
+          to production, or putting a team that already exists onto agent rails.
+          My{' '}
           <InternalLink href="/cv" inherit>
             CV
           </InternalLink>{' '}
-          if you’re looking for new people.
-        </Text>
-      </Stack>
-
-      <Subheading>Case studies</Subheading>
-
-      <Stack gap={16}>
-        {caseStudies.map(({ document, rendered }) => (
-          <InternalLink
-            key={document.slug}
-            href={document.route}
-            underline="never"
-            c="inherit"
-            display="block"
-            className={classes['caseStudyLink']}
-          >
-            <Card>
-              <Title order={4} mb={8}>
-                {rendered.title}
-              </Title>
-              <Text lh={1.625}>{document.frontmatter.description}</Text>
-            </Card>
-          </InternalLink>
-        ))}
-        <Text size="sm">
-          <InternalLink href={collectionRoute('case-studies')} inherit>
-            All case studies, including the shorter cuts →
-          </InternalLink>
+          has the numbers.
         </Text>
       </Stack>
 
       <Subheading>Featured Projects</Subheading>
 
       <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
+        <ProjectCard
+          title="Playgram.ai"
+          description="A live, feature-rich AI chat product lifted off a no-code builder into a production Next.js codebase in 158 days, and in production for its users the whole way through."
+          techStack="Next.js 16, TypeScript, Claude Code"
```

**@vzakharov** — 2026-09-08T17:09:18Z

-ts, +supabase +railway +feature-sliced design (to hint at devops capabilities)

**@vzakharov** — 2026-09-08T17:52:57Z

Fixed in ea186a5 — `Next.js 16, Supabase, Railway, feature-sliced design, Claude Code`.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/pages/home/ui/dev-section.tsx`:67

```diff
@@ -19,114 +36,101 @@ export async function DevSection() {
           that doesn’t, and stuff that’s still a work in progress.
         </Text>
         <Text size="lg" lh={1.625}>
-          I’m currently looking for new challenges, so have a look at my{' '}
+          These days I mostly do it as a hands-on CTO for hire — taking an idea
+          to production, or putting a team that already exists onto agent rails.
+          My{' '}
           <InternalLink href="/cv" inherit>
             CV
           </InternalLink>{' '}
-          if you’re looking for new people.
-        </Text>
-      </Stack>
-
-      <Subheading>Case studies</Subheading>
-
-      <Stack gap={16}>
-        {caseStudies.map(({ document, rendered }) => (
-          <InternalLink
-            key={document.slug}
-            href={document.route}
-            underline="never"
-            c="inherit"
-            display="block"
-            className={classes['caseStudyLink']}
-          >
-            <Card>
-              <Title order={4} mb={8}>
-                {rendered.title}
-              </Title>
-              <Text lh={1.625}>{document.frontmatter.description}</Text>
-            </Card>
-          </InternalLink>
-        ))}
-        <Text size="sm">
-          <InternalLink href={collectionRoute('case-studies')} inherit>
-            All case studies, including the shorter cuts →
-          </InternalLink>
+          has the numbers.
         </Text>
       </Stack>
 
       <Subheading>Featured Projects</Subheading>
 
       <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
+        <ProjectCard
+          title="Playgram.ai"
+          description="A live, feature-rich AI chat product lifted off a no-code builder into a production Next.js codebase in 158 days, and in production for its users the whole way through."
+          techStack="Next.js 16, TypeScript, Claude Code"
+          footer={
+            <Text size="sm" mt={12}>
+              <InternalLink href={CASE_STUDY_ROUTE} inherit>
+                Read the case study →
+              </InternalLink>
+            </Text>
+          }
+        />
+
+        <ProjectCard
+          title="agent-project-boilerplate"
+          description="The engineering platform that rebuild ran on, extracted so it travels: the architecture, the staged pipeline and the pre-push gate, now carried onto their own projects by the engineers who took it over."
```

**@vzakharov** — 2026-09-08T17:09:46Z

now carriable over to my or anyone's new projects.

**@vzakharov** — 2026-09-08T17:52:58Z

Fixed in ea186a5 — the description now ends "…ready to carry onto my — or anyone’s — next project." (dropped the old "carried onto their own projects by the engineers who took it over", which said the narrower thing).

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/pages/home/ui/dev-section.tsx`:68

```diff
@@ -19,114 +36,101 @@ export async function DevSection() {
           that doesn’t, and stuff that’s still a work in progress.
         </Text>
         <Text size="lg" lh={1.625}>
-          I’m currently looking for new challenges, so have a look at my{' '}
+          These days I mostly do it as a hands-on CTO for hire — taking an idea
+          to production, or putting a team that already exists onto agent rails.
+          My{' '}
           <InternalLink href="/cv" inherit>
             CV
           </InternalLink>{' '}
-          if you’re looking for new people.
-        </Text>
-      </Stack>
-
-      <Subheading>Case studies</Subheading>
-
-      <Stack gap={16}>
-        {caseStudies.map(({ document, rendered }) => (
-          <InternalLink
-            key={document.slug}
-            href={document.route}
-            underline="never"
-            c="inherit"
-            display="block"
-            className={classes['caseStudyLink']}
-          >
-            <Card>
-              <Title order={4} mb={8}>
-                {rendered.title}
-              </Title>
-              <Text lh={1.625}>{document.frontmatter.description}</Text>
-            </Card>
-          </InternalLink>
-        ))}
-        <Text size="sm">
-          <InternalLink href={collectionRoute('case-studies')} inherit>
-            All case studies, including the shorter cuts →
-          </InternalLink>
+          has the numbers.
         </Text>
       </Stack>
 
       <Subheading>Featured Projects</Subheading>
 
       <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
+        <ProjectCard
+          title="Playgram.ai"
+          description="A live, feature-rich AI chat product lifted off a no-code builder into a production Next.js codebase in 158 days, and in production for its users the whole way through."
+          techStack="Next.js 16, TypeScript, Claude Code"
+          footer={
+            <Text size="sm" mt={12}>
+              <InternalLink href={CASE_STUDY_ROUTE} inherit>
+                Read the case study →
+              </InternalLink>
+            </Text>
+          }
+        />
+
+        <ProjectCard
+          title="agent-project-boilerplate"
+          description="The engineering platform that rebuild ran on, extracted so it travels: the architecture, the staged pipeline and the pre-push gate, now carried onto their own projects by the engineers who took it over."
+          techStack="Claude Code, TypeScript, feature-sliced design"
```

**@vzakharov** — 2026-09-08T17:10:22Z

there's no ts or fsd there, it's a boilerplate. Say smth along the lines of templating/boilerplating, + open source

**@vzakharov** — 2026-09-08T17:53:00Z

Fixed in ea186a5 — `Claude Code, project templating, open source`.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/pages/home/ui/dev-section.tsx`:112

```diff
@@ -19,114 +36,101 @@ export async function DevSection() {
           that doesn’t, and stuff that’s still a work in progress.
         </Text>
         <Text size="lg" lh={1.625}>
-          I’m currently looking for new challenges, so have a look at my{' '}
+          These days I mostly do it as a hands-on CTO for hire — taking an idea
+          to production, or putting a team that already exists onto agent rails.
+          My{' '}
           <InternalLink href="/cv" inherit>
             CV
           </InternalLink>{' '}
-          if you’re looking for new people.
-        </Text>
-      </Stack>
-
-      <Subheading>Case studies</Subheading>
-
-      <Stack gap={16}>
-        {caseStudies.map(({ document, rendered }) => (
-          <InternalLink
-            key={document.slug}
-            href={document.route}
-            underline="never"
-            c="inherit"
-            display="block"
-            className={classes['caseStudyLink']}
-          >
-            <Card>
-              <Title order={4} mb={8}>
-                {rendered.title}
-              </Title>
-              <Text lh={1.625}>{document.frontmatter.description}</Text>
-            </Card>
-          </InternalLink>
-        ))}
-        <Text size="sm">
-          <InternalLink href={collectionRoute('case-studies')} inherit>
-            All case studies, including the shorter cuts →
-          </InternalLink>
+          has the numbers.
         </Text>
       </Stack>
 
       <Subheading>Featured Projects</Subheading>
 
       <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
+        <ProjectCard
+          title="Playgram.ai"
+          description="A live, feature-rich AI chat product lifted off a no-code builder into a production Next.js codebase in 158 days, and in production for its users the whole way through."
+          techStack="Next.js 16, TypeScript, Claude Code"
+          footer={
+            <Text size="sm" mt={12}>
+              <InternalLink href={CASE_STUDY_ROUTE} inherit>
+                Read the case study →
+              </InternalLink>
+            </Text>
+          }
+        />
+
+        <ProjectCard
+          title="agent-project-boilerplate"
+          description="The engineering platform that rebuild ran on, extracted so it travels: the architecture, the staged pipeline and the pre-push gate, now carried onto their own projects by the engineers who took it over."
+          techStack="Claude Code, TypeScript, feature-sliced design"
+          url="https://github.com/vzakharov/agent-project-boilerplate"
+        />
+
         <ProjectCard
           title="jukebox-webui"
           stars={84}
-          description="Google Colab-backed Web UI for OpenAI's Jukebox music generation model. Democratized access to computationally expensive AI music generation with Gradio interface."
+          description="Suno before Suno: running OpenAI's music model in Google Colab back when there was no product to use instead."
           techStack="Python, Gradio, Google Colab"
           url="https://github.com/vzakharov/jukebox-webui"
         />
 
         <ProjectCard
           title="almostmagic"
           stars={65}
-          description="Add AI to your app with one line of code. Lightweight TypeScript wrapper that abstracts prompt engineering complexity with single-function API."
+          description="Structured generation before it was a feature — typed output from a single call, years before every SDK shipped its own version of it."
           techStack="TypeScript, OpenAI API"
           url="https://github.com/losideadores/almostmagic"
         />
-
-        <ProjectCard
-          title="write"
-          description="One of the first text processors with fully configurable LLM provider integration. Way ahead of its time, even if I was the only one using it."
-          techStack="Vue, TypeScript"
-          url="https://github.com/vzakharov/write"
-        />
-
-        <ProjectCard
-          title="mindy"
-          description="Group AI chatbot. ChatGPT before ChatGPT."
-          techStack="Nuxt.js, Vue.js, Vuex"
-          url="https://github.com/vzakharov/mindy"
-        />
-
-        <ProjectCard
-          title="ollum"
-          description="Evolution-inspired LLM framework where models act as both creators AND critics. Seeding → Elo-style evaluation → mutation → crossover for iterative content evolution."
-          techStack="Python, async-first"
-          url="https://github.com/vzakharov/ollum"
-        />
-
-        <ProjectCard
-          title="sympathico"
-          description="Experimental neural networks without traditional weight matrices or backpropagation. Networks as 'colonies of symbolic paths' using evolutionary principles."
-          techStack="Python"
-          url="https://github.com/vzakharov/sympathico"
-        />
-
-        <ProjectCard
-          title="komple"
-          stars={13}
-          description="AI autocomplete for any website. Press Ctrl+Space for suggestions in any text field. Chrome extension with multiple API endpoint support."
-          techStack="JavaScript, Vue.js, BPE encoder"
-          url="https://github.com/vzakharov/komple"
-        />
-
-        <ProjectCard
-          title="ideality-nuxt"
-          description="AI ideation platform allowing creation of no-code widgets for one-click AI generations (copy, ideas, etc.) embeddable on any website. Configurable by users."
-          techStack="Nuxt.js, Vue.js, Bubble backend"
-          url="https://github.com/vzakharov/ideality-nuxt"
-        />
-
-        <ProjectCard
-          title="suno-power-tools"
-          description="Collection of in-browser-console tools for Suno. Includes tree-structure display for visualizing clip relationships, extensions, and inpaintings."
-          techStack="HTML, JavaScript"
-          url="https://github.com/vzakharov/suno-power-tools"
-        />
       </SimpleGrid>
 
-      <Subheading>Professional Work</Subheading>
+      <Stack gap={8}>
+        <Text size="sm" opacity={0.7}>
+          Same pattern, earlier:{' '}
+          {EARLIER_PROJECTS.map(({ name, gloss }, index) => (
+            <span key={name}>
+              {index > 0 && ', '}
+              <Anchor
+                href={`https://github.com/vzakharov/${name}`}
+                target="_blank"
+                rel="noopener noreferrer"
+                inherit
+              >
+                {name}
+              </Anchor>{' '}
+              ({gloss})
+            </span>
+          ))}
+          .
+        </Text>
+        <Text size="sm">
+          <InternalLink href={collectionRoute('case-studies')} inherit>
+            All case studies, including the shorter cuts →
+          </InternalLink>
+        </Text>
```

**@vzakharov** — 2026-09-08T17:11:08Z

No need for this at this point as there's just a single case study

**@vzakharov** — 2026-09-08T17:53:01Z

Removed in ea186a5. That also emptied the `Stack` that wrapped it, so the "Same pattern, earlier:" line is now a plain `Text`.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/pages/home/ui/dev-section.tsx`:115

```diff
@@ -19,114 +36,101 @@ export async function DevSection() {
           that doesn’t, and stuff that’s still a work in progress.
         </Text>
         <Text size="lg" lh={1.625}>
-          I’m currently looking for new challenges, so have a look at my{' '}
+          These days I mostly do it as a hands-on CTO for hire — taking an idea
+          to production, or putting a team that already exists onto agent rails.
+          My{' '}
           <InternalLink href="/cv" inherit>
             CV
           </InternalLink>{' '}
-          if you’re looking for new people.
-        </Text>
-      </Stack>
-
-      <Subheading>Case studies</Subheading>
-
-      <Stack gap={16}>
-        {caseStudies.map(({ document, rendered }) => (
-          <InternalLink
-            key={document.slug}
-            href={document.route}
-            underline="never"
-            c="inherit"
-            display="block"
-            className={classes['caseStudyLink']}
-          >
-            <Card>
-              <Title order={4} mb={8}>
-                {rendered.title}
-              </Title>
-              <Text lh={1.625}>{document.frontmatter.description}</Text>
-            </Card>
-          </InternalLink>
-        ))}
-        <Text size="sm">
-          <InternalLink href={collectionRoute('case-studies')} inherit>
-            All case studies, including the shorter cuts →
-          </InternalLink>
+          has the numbers.
         </Text>
       </Stack>
 
       <Subheading>Featured Projects</Subheading>
 
       <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
+        <ProjectCard
+          title="Playgram.ai"
+          description="A live, feature-rich AI chat product lifted off a no-code builder into a production Next.js codebase in 158 days, and in production for its users the whole way through."
+          techStack="Next.js 16, TypeScript, Claude Code"
+          footer={
+            <Text size="sm" mt={12}>
+              <InternalLink href={CASE_STUDY_ROUTE} inherit>
+                Read the case study →
+              </InternalLink>
+            </Text>
+          }
+        />
+
+        <ProjectCard
+          title="agent-project-boilerplate"
+          description="The engineering platform that rebuild ran on, extracted so it travels: the architecture, the staged pipeline and the pre-push gate, now carried onto their own projects by the engineers who took it over."
+          techStack="Claude Code, TypeScript, feature-sliced design"
+          url="https://github.com/vzakharov/agent-project-boilerplate"
+        />
+
         <ProjectCard
           title="jukebox-webui"
           stars={84}
-          description="Google Colab-backed Web UI for OpenAI's Jukebox music generation model. Democratized access to computationally expensive AI music generation with Gradio interface."
+          description="Suno before Suno: running OpenAI's music model in Google Colab back when there was no product to use instead."
           techStack="Python, Gradio, Google Colab"
           url="https://github.com/vzakharov/jukebox-webui"
         />
 
         <ProjectCard
           title="almostmagic"
           stars={65}
-          description="Add AI to your app with one line of code. Lightweight TypeScript wrapper that abstracts prompt engineering complexity with single-function API."
+          description="Structured generation before it was a feature — typed output from a single call, years before every SDK shipped its own version of it."
           techStack="TypeScript, OpenAI API"
           url="https://github.com/losideadores/almostmagic"
         />
-
-        <ProjectCard
-          title="write"
-          description="One of the first text processors with fully configurable LLM provider integration. Way ahead of its time, even if I was the only one using it."
-          techStack="Vue, TypeScript"
-          url="https://github.com/vzakharov/write"
-        />
-
-        <ProjectCard
-          title="mindy"
-          description="Group AI chatbot. ChatGPT before ChatGPT."
-          techStack="Nuxt.js, Vue.js, Vuex"
-          url="https://github.com/vzakharov/mindy"
-        />
-
-        <ProjectCard
-          title="ollum"
-          description="Evolution-inspired LLM framework where models act as both creators AND critics. Seeding → Elo-style evaluation → mutation → crossover for iterative content evolution."
-          techStack="Python, async-first"
-          url="https://github.com/vzakharov/ollum"
-        />
-
-        <ProjectCard
-          title="sympathico"
-          description="Experimental neural networks without traditional weight matrices or backpropagation. Networks as 'colonies of symbolic paths' using evolutionary principles."
-          techStack="Python"
-          url="https://github.com/vzakharov/sympathico"
-        />
-
-        <ProjectCard
-          title="komple"
-          stars={13}
-          description="AI autocomplete for any website. Press Ctrl+Space for suggestions in any text field. Chrome extension with multiple API endpoint support."
-          techStack="JavaScript, Vue.js, BPE encoder"
-          url="https://github.com/vzakharov/komple"
-        />
-
-        <ProjectCard
-          title="ideality-nuxt"
-          description="AI ideation platform allowing creation of no-code widgets for one-click AI generations (copy, ideas, etc.) embeddable on any website. Configurable by users."
-          techStack="Nuxt.js, Vue.js, Bubble backend"
-          url="https://github.com/vzakharov/ideality-nuxt"
-        />
-
-        <ProjectCard
-          title="suno-power-tools"
-          description="Collection of in-browser-console tools for Suno. Includes tree-structure display for visualizing clip relationships, extensions, and inpaintings."
-          techStack="HTML, JavaScript"
-          url="https://github.com/vzakharov/suno-power-tools"
-        />
       </SimpleGrid>
 
-      <Subheading>Professional Work</Subheading>
+      <Stack gap={8}>
+        <Text size="sm" opacity={0.7}>
+          Same pattern, earlier:{' '}
+          {EARLIER_PROJECTS.map(({ name, gloss }, index) => (
+            <span key={name}>
+              {index > 0 && ', '}
+              <Anchor
+                href={`https://github.com/vzakharov/${name}`}
+                target="_blank"
+                rel="noopener noreferrer"
+                inherit
+              >
+                {name}
+              </Anchor>{' '}
+              ({gloss})
+            </span>
+          ))}
+          .
+        </Text>
+        <Text size="sm">
+          <InternalLink href={collectionRoute('case-studies')} inherit>
+            All case studies, including the shorter cuts →
+          </InternalLink>
+        </Text>
+      </Stack>
+
+      <Subheading>Recent Work</Subheading>
```

**@vzakharov** — 2026-09-08T17:13:02Z

Let's call it work highlights as they're not strictly in chronological order and e.g. misses one experience in-between ddb & orcool

**@vzakharov** — 2026-09-08T17:53:02Z

Renamed to **Work Highlights** in ea186a5.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/pages/home/ui/dev-section.tsx`:135

```diff
@@ -19,114 +36,101 @@ export async function DevSection() {
           that doesn’t, and stuff that’s still a work in progress.
         </Text>
         <Text size="lg" lh={1.625}>
-          I’m currently looking for new challenges, so have a look at my{' '}
+          These days I mostly do it as a hands-on CTO for hire — taking an idea
+          to production, or putting a team that already exists onto agent rails.
+          My{' '}
           <InternalLink href="/cv" inherit>
             CV
           </InternalLink>{' '}
-          if you’re looking for new people.
-        </Text>
-      </Stack>
-
-      <Subheading>Case studies</Subheading>
-
-      <Stack gap={16}>
-        {caseStudies.map(({ document, rendered }) => (
-          <InternalLink
-            key={document.slug}
-            href={document.route}
-            underline="never"
-            c="inherit"
-            display="block"
-            className={classes['caseStudyLink']}
-          >
-            <Card>
-              <Title order={4} mb={8}>
-                {rendered.title}
-              </Title>
-              <Text lh={1.625}>{document.frontmatter.description}</Text>
-            </Card>
-          </InternalLink>
-        ))}
-        <Text size="sm">
-          <InternalLink href={collectionRoute('case-studies')} inherit>
-            All case studies, including the shorter cuts →
-          </InternalLink>
+          has the numbers.
         </Text>
       </Stack>
 
       <Subheading>Featured Projects</Subheading>
 
       <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
+        <ProjectCard
+          title="Playgram.ai"
+          description="A live, feature-rich AI chat product lifted off a no-code builder into a production Next.js codebase in 158 days, and in production for its users the whole way through."
+          techStack="Next.js 16, TypeScript, Claude Code"
+          footer={
+            <Text size="sm" mt={12}>
+              <InternalLink href={CASE_STUDY_ROUTE} inherit>
+                Read the case study →
+              </InternalLink>
+            </Text>
+          }
+        />
+
+        <ProjectCard
+          title="agent-project-boilerplate"
+          description="The engineering platform that rebuild ran on, extracted so it travels: the architecture, the staged pipeline and the pre-push gate, now carried onto their own projects by the engineers who took it over."
+          techStack="Claude Code, TypeScript, feature-sliced design"
+          url="https://github.com/vzakharov/agent-project-boilerplate"
+        />
+
         <ProjectCard
           title="jukebox-webui"
           stars={84}
-          description="Google Colab-backed Web UI for OpenAI's Jukebox music generation model. Democratized access to computationally expensive AI music generation with Gradio interface."
+          description="Suno before Suno: running OpenAI's music model in Google Colab back when there was no product to use instead."
           techStack="Python, Gradio, Google Colab"
           url="https://github.com/vzakharov/jukebox-webui"
         />
 
         <ProjectCard
           title="almostmagic"
           stars={65}
-          description="Add AI to your app with one line of code. Lightweight TypeScript wrapper that abstracts prompt engineering complexity with single-function API."
+          description="Structured generation before it was a feature — typed output from a single call, years before every SDK shipped its own version of it."
           techStack="TypeScript, OpenAI API"
           url="https://github.com/losideadores/almostmagic"
         />
-
-        <ProjectCard
-          title="write"
-          description="One of the first text processors with fully configurable LLM provider integration. Way ahead of its time, even if I was the only one using it."
-          techStack="Vue, TypeScript"
-          url="https://github.com/vzakharov/write"
-        />
-
-        <ProjectCard
-          title="mindy"
-          description="Group AI chatbot. ChatGPT before ChatGPT."
-          techStack="Nuxt.js, Vue.js, Vuex"
-          url="https://github.com/vzakharov/mindy"
-        />
-
-        <ProjectCard
-          title="ollum"
-          description="Evolution-inspired LLM framework where models act as both creators AND critics. Seeding → Elo-style evaluation → mutation → crossover for iterative content evolution."
-          techStack="Python, async-first"
-          url="https://github.com/vzakharov/ollum"
-        />
-
-        <ProjectCard
-          title="sympathico"
-          description="Experimental neural networks without traditional weight matrices or backpropagation. Networks as 'colonies of symbolic paths' using evolutionary principles."
-          techStack="Python"
-          url="https://github.com/vzakharov/sympathico"
-        />
-
-        <ProjectCard
-          title="komple"
-          stars={13}
-          description="AI autocomplete for any website. Press Ctrl+Space for suggestions in any text field. Chrome extension with multiple API endpoint support."
-          techStack="JavaScript, Vue.js, BPE encoder"
-          url="https://github.com/vzakharov/komple"
-        />
-
-        <ProjectCard
-          title="ideality-nuxt"
-          description="AI ideation platform allowing creation of no-code widgets for one-click AI generations (copy, ideas, etc.) embeddable on any website. Configurable by users."
-          techStack="Nuxt.js, Vue.js, Bubble backend"
-          url="https://github.com/vzakharov/ideality-nuxt"
-        />
-
-        <ProjectCard
-          title="suno-power-tools"
-          description="Collection of in-browser-console tools for Suno. Includes tree-structure display for visualizing clip relationships, extensions, and inpaintings."
-          techStack="HTML, JavaScript"
-          url="https://github.com/vzakharov/suno-power-tools"
-        />
       </SimpleGrid>
 
-      <Subheading>Professional Work</Subheading>
+      <Stack gap={8}>
+        <Text size="sm" opacity={0.7}>
+          Same pattern, earlier:{' '}
+          {EARLIER_PROJECTS.map(({ name, gloss }, index) => (
+            <span key={name}>
+              {index > 0 && ', '}
+              <Anchor
+                href={`https://github.com/vzakharov/${name}`}
+                target="_blank"
+                rel="noopener noreferrer"
+                inherit
+              >
+                {name}
+              </Anchor>{' '}
+              ({gloss})
+            </span>
+          ))}
+          .
+        </Text>
+        <Text size="sm">
+          <InternalLink href={collectionRoute('case-studies')} inherit>
+            All case studies, including the shorter cuts →
+          </InternalLink>
+        </Text>
+      </Stack>
+
+      <Subheading>Recent Work</Subheading>
 
       <Stack gap={16}>
```

**@vzakharov** — 2026-09-08T17:13:27Z

let's add an icon with each's favicon/logo to the left of each title, see how it looks

**@vzakharov** — 2026-09-08T17:53:16Z

Done in ea186a5 + the follow-up — each entry now leads with the organisation’s own mark (28px, 6px radius) in a `HighlightCard` helper, so the three cards stop repeating the Card/Title/TechLine scaffold.

You flagged these as slightly mis-aligned, and you were right — the cause was in the source files, not the CSS. Measured ink boxes as fetched: DDB filled its canvas edge-to-edge, Playgram was inset 4.7%, Orcool 10.5% **and** off-centre horizontally (10.5% left pad vs 19.7% right). Rendered at one size that reads as three different sizes on a wobbling axis.

Fixed at the source rather than with per-logo nudges: each file is trimmed to its ink box and re-padded to a centred transparent square at 128×128. Re-measured after: all three now 0/0 top and bottom, symmetric left/right. Logo-centre vs title-centre offset is now 0.5px and 1.25px at 1× — and the residual is measurement noise from parentheses and descenders in the title ink box, so effectively zero.

`public/logos/README.md` carries the rule so the next logo does not reintroduce it.

---
_Generated by [Claude Code](https://claude.ai/code)_

**@vzakharov** — 2026-09-08T22:41:42Z

`.claude/rules` rather than a readme

**@vzakharov** — 2026-09-08T23:21:33Z

Done in 770b7df — `public/logos/README.md` is gone and the convention is `.claude/rules/logos.md`, scoped to `public/logos/**`, so it loads for the session that adds a logo rather than waiting to be found.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/pages/home/ui/home-page.tsx`:68

```diff
@@ -1,105 +1,81 @@
-import {
-  Anchor,
-  Box,
-  Center,
-  Container,
-  Divider,
-  Group,
-  Stack,
-  Text,
-  Title,
-} from '@mantine/core';
+import { Box, Center, Divider, Group, Stack, Text, Title } from '@mantine/core';
 import Image from 'next/image';
 
-import { cssColor, InternalLink } from '@/shared/ui';
+import { BUILD_YEAR, PAGE_ROUTES } from '@/shared/config';
+import { cssColor, InternalLink, PageShell } from '@/shared/ui';
 
 import { ThemeToggle } from '@/features/switch-theme';
 
 import { ContactSection } from './contact-section';
 import { DevSection } from './dev-section';
-import { MusicSection } from './music-section';
-import { WritingSection } from './writing-section';
 
-// A static export evaluates this at build time, so the footer year is the
-// year the site was last deployed.
-const BUILD_YEAR = new Date().getFullYear();
+/** The nouns the hero claims that live on pages of their own. */
+const SEE_ALSO = [
+  { href: PAGE_ROUTES.writing, label: 'writing' },
+  { href: PAGE_ROUTES.music, label: 'music' },
+];
 
 export function HomePage() {
   return (
-    <Box mih="100vh" p={{ base: 32, sm: 80 }} pb={80}>
-      <Container size={896} px={0}>
-        <Stack gap={64}>
-          <Group justify="flex-end">
-            <ThemeToggle />
-          </Group>
+    <PageShell>
+      <Stack gap={64}>
+        <Group justify="flex-end">
+          <ThemeToggle />
+        </Group>
 
-          <Box component="section">
-            <Stack gap={24} ta="center">
-              <Center>
-                <Image
-                  src="/ava.png"
-                  alt="Vova Zakharov"
-                  width={150}
-                  height={150}
-                  style={{ borderRadius: '50%' }}
-                  priority
-                />
-              </Center>
-              <Box>
-                <Title order={1} mb={12}>
-                  Vova Zakharov
-                </Title>
-                <Text
-                  fz={{ base: 20, sm: 24 }}
-                  lh={{ base: '28px', sm: '32px' }}
-                  opacity={0.8}
-                >
-                  Developer, AI tinkerer, word shaker, generative metalhead
-                </Text>
-                <Text mt={16} opacity={0.7}>
-                  Helping our future overlords walk since 2020
-                </Text>
-              </Box>
-            </Stack>
-          </Box>
-
-          <Box component="nav">
-            <Group justify="center" gap={24}>
-              <Text size="lg" component="span">
-                <Anchor href="#dev" underline="hover" inherit>
-                  dev
-                </Anchor>
-                &nbsp;(
-                <InternalLink href="/cv" underline="hover" inherit>
-                  cv
-                </InternalLink>
-                )
+        <Box component="section">
+          <Stack gap={24} ta="center">
+            <Center>
+              <Image
+                src="/ava.png"
+                alt="Vova Zakharov"
+                width={150}
+                height={150}
+                style={{ borderRadius: '50%' }}
+                priority
+              />
+            </Center>
+            <Box>
+              <Title order={1} mb={12}>
+                Vova Zakharov
+              </Title>
+              <Text
+                fz={{ base: 20, sm: 24 }}
+                lh={{ base: '28px', sm: '32px' }}
+                opacity={0.8}
+              >
+                Developer, AI tinkerer, word shaker, generative metalhead
+              </Text>
+              <Text mt={16} opacity={0.7}>
+                Helping our future overlords walk since 2020
               </Text>
-              <Anchor href="#music" size="lg" underline="hover">
-                music
-              </Anchor>
-              <Anchor href="#writing" size="lg" underline="hover">
-                writing
-              </Anchor>
-              <Anchor href="#contact" size="lg" underline="hover">
-                contact
-              </Anchor>
-            </Group>
-          </Box>
+            </Box>
+          </Stack>
+        </Box>
 
-          <DevSection />
-          <MusicSection />
-          <WritingSection />
-          <ContactSection />
+        <DevSection />
+        <ContactSection />
 
-          <Box component="footer" ta="center">
-            <Divider mb={32} color={cssColor('border-hairline')} />
+        <Box component="footer" ta="center">
+          <Divider mb={32} color={cssColor('border-hairline')} />
+          <Stack gap={8}>
+            <Text size="sm" opacity={0.6}>
+              See also:{' '}
+              {SEE_ALSO.map(({ href, label }, index) => (
+                <span key={href}>
+                  {index > 0 && ' · '}
+                  <InternalLink {...{ href }} inherit>
+                    {label}
```

**@vzakharov** — 2026-09-08T17:15:26Z

let's make it `/writing` and `/music` as labels (with the slash)

**@vzakharov** — 2026-09-08T17:53:17Z

Done in ea186a5 — the labels are `/writing` and `/music`.

Small ride-along: since the path *is* the label now, `SEE_ALSO` collapsed from `{ href, label }` pairs to just `[PAGE_ROUTES.writing, PAGE_ROUTES.music]`, with the href rendered as its own text. One less place for the two to disagree.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/pages/home/ui/home-page.tsx`:61

```diff
@@ -1,105 +1,81 @@
-import {
-  Anchor,
-  Box,
-  Center,
-  Container,
-  Divider,
-  Group,
-  Stack,
-  Text,
-  Title,
-} from '@mantine/core';
+import { Box, Center, Divider, Group, Stack, Text, Title } from '@mantine/core';
 import Image from 'next/image';
 
-import { cssColor, InternalLink } from '@/shared/ui';
+import { BUILD_YEAR, PAGE_ROUTES } from '@/shared/config';
+import { cssColor, InternalLink, PageShell } from '@/shared/ui';
 
 import { ThemeToggle } from '@/features/switch-theme';
 
 import { ContactSection } from './contact-section';
 import { DevSection } from './dev-section';
-import { MusicSection } from './music-section';
-import { WritingSection } from './writing-section';
 
-// A static export evaluates this at build time, so the footer year is the
-// year the site was last deployed.
-const BUILD_YEAR = new Date().getFullYear();
+/** The nouns the hero claims that live on pages of their own. */
+const SEE_ALSO = [
+  { href: PAGE_ROUTES.writing, label: 'writing' },
+  { href: PAGE_ROUTES.music, label: 'music' },
+];
 
 export function HomePage() {
   return (
-    <Box mih="100vh" p={{ base: 32, sm: 80 }} pb={80}>
-      <Container size={896} px={0}>
-        <Stack gap={64}>
-          <Group justify="flex-end">
-            <ThemeToggle />
-          </Group>
+    <PageShell>
+      <Stack gap={64}>
+        <Group justify="flex-end">
+          <ThemeToggle />
+        </Group>
 
-          <Box component="section">
-            <Stack gap={24} ta="center">
-              <Center>
-                <Image
-                  src="/ava.png"
-                  alt="Vova Zakharov"
-                  width={150}
-                  height={150}
-                  style={{ borderRadius: '50%' }}
-                  priority
-                />
-              </Center>
-              <Box>
-                <Title order={1} mb={12}>
-                  Vova Zakharov
-                </Title>
-                <Text
-                  fz={{ base: 20, sm: 24 }}
-                  lh={{ base: '28px', sm: '32px' }}
-                  opacity={0.8}
-                >
-                  Developer, AI tinkerer, word shaker, generative metalhead
-                </Text>
-                <Text mt={16} opacity={0.7}>
-                  Helping our future overlords walk since 2020
-                </Text>
-              </Box>
-            </Stack>
-          </Box>
-
-          <Box component="nav">
-            <Group justify="center" gap={24}>
-              <Text size="lg" component="span">
-                <Anchor href="#dev" underline="hover" inherit>
-                  dev
-                </Anchor>
-                &nbsp;(
-                <InternalLink href="/cv" underline="hover" inherit>
-                  cv
-                </InternalLink>
-                )
+        <Box component="section">
+          <Stack gap={24} ta="center">
+            <Center>
+              <Image
+                src="/ava.png"
+                alt="Vova Zakharov"
+                width={150}
+                height={150}
+                style={{ borderRadius: '50%' }}
+                priority
+              />
+            </Center>
+            <Box>
+              <Title order={1} mb={12}>
+                Vova Zakharov
+              </Title>
+              <Text
+                fz={{ base: 20, sm: 24 }}
+                lh={{ base: '28px', sm: '32px' }}
+                opacity={0.8}
+              >
+                Developer, AI tinkerer, word shaker, generative metalhead
+              </Text>
+              <Text mt={16} opacity={0.7}>
+                Helping our future overlords walk since 2020
               </Text>
-              <Anchor href="#music" size="lg" underline="hover">
-                music
-              </Anchor>
-              <Anchor href="#writing" size="lg" underline="hover">
-                writing
-              </Anchor>
-              <Anchor href="#contact" size="lg" underline="hover">
-                contact
-              </Anchor>
-            </Group>
-          </Box>
+            </Box>
+          </Stack>
+        </Box>
 
-          <DevSection />
-          <MusicSection />
-          <WritingSection />
-          <ContactSection />
+        <DevSection />
+        <ContactSection />
 
-          <Box component="footer" ta="center">
-            <Divider mb={32} color={cssColor('border-hairline')} />
+        <Box component="footer" ta="center">
+          <Divider mb={32} color={cssColor('border-hairline')} />
+          <Stack gap={8}>
```

**@vzakharov** — 2026-09-08T17:16:21Z

let's experiment with placement of sections to the left, copyright to the right (justify-between)

**@vzakharov** — 2026-09-08T17:53:18Z

Done in ea186a5 — the footer `Stack` became a `Group justify="space-between"`, so the section links sit left and the copyright right. Dropped the `ta="center"` on the footer and the "See also:" prefix with it: the slashed labels read as nav on their own.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/shared/i18n/messages/en.json`:55

```diff
@@ -18,20 +18,59 @@
     },
     "whatIOffer": {
       "title": "What I Offer",
-      "coreCapabilities": {
-        "title": "Core Capabilities",
-        "item1": "Bring your idea to an MVP/prototype in 1-2 months",
-        "item2": "Clean the mess in the prototype you vibe-coded",
-        "item3": "Explain exactly why your AI agent doesn't work the way you expected, and fix it"
-      },
-      "workingStyle": {
-        "title": "Working Style",
-        "paragraph1": "I'm the kind of developer you can generally leave unattended, as long as the overall vector is clear. I have enough life expertise to figure stuff on my own, enough imagination to fill the missing pieces, and a \"treat any job as if it was your own brainchild\" mentality.",
-        "paragraph2": "In other words: a surprisingly low-maintenance LLM tinkerer with a TypeScript kink, ready to prototype, debug, or sanity-check your AI-infused ambitions."
-      },
-      "aiExpertise": {
-        "title": "AI Expertise",
-        "paragraph": "I tend to stick to a more \"economical\" paradigm of AI usage: smaller prompts, more aware of context limitations, less \"let's feed it all and it'll somehow work!\" My expertise predates the ChatGPT hype cycle, which means I understand not just the APIs, but the underlying patterns and limitations that most \"AI engineers\" are still discovering."
+      "blocks": {
+        "coreCapabilities": {
+          "title": "Core Capabilities",
+          "items": [
+            "Bring your idea to an MVP/prototype in 1-2 months",
+            "Clean the mess in the prototype you vibe-coded",
+            "Explain exactly why your AI agent doesn't work the way you expected, and fix it"
+          ]
+        },
+        "engagements": {
+          "title": "Engagements",
+          "items": [
+            {
+              "label": "Idea → production:",
+              "text": "your idea in the hands of real users in one to two months, built the way it will be maintained rather than as a demo to throw away."
+            },
+            {
+              "label": "Your team on agent rails:",
+              "text": "the architecture, the staged pipeline and the pre-push gate that let a crowd of agents ship without drifting — set up on your codebase, then handed over as checked-in procedure rather than as advice. It has been handed over once already, and the engineers who took it carried it to projects of their own."
+            },
+            {
+              "label": "Rescue and diagnosis:",
+              "text": "the prototype that got vibe-coded into a corner, and the agent that doesn't do what you expected — usually the same purchase."
+            },
+            {
+              "label": "Standing technical judgment:",
+              "text": "framework and platform selection, build-vs-buy, and a straight answer on what the models still cannot do."
+            }
+          ]
+        },
+        "engineeringSystem": {
+          "title": "The Engineering System",
+          "items": [
+            "Feature-sliced architecture held by linters, so a crowd of agents working at once cannot drift the structure.",
+            "A staged pipeline — plan, implement, review, finalize — each stage its own session, with a reviewable artifact between them.",
```

**@vzakharov** — 2026-09-08T17:17:57Z

with reviewable artifacts

**@vzakharov** — 2026-09-08T17:53:30Z

Done in ea186a5 — pluralised: "…each stage its own session, with reviewable artifacts between them." Mirrored in `ru.json` (`с проверяемыми артефактами между ними`).

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/shared/i18n/messages/en.json`:58

```diff
@@ -18,20 +18,59 @@
     },
     "whatIOffer": {
       "title": "What I Offer",
-      "coreCapabilities": {
-        "title": "Core Capabilities",
-        "item1": "Bring your idea to an MVP/prototype in 1-2 months",
-        "item2": "Clean the mess in the prototype you vibe-coded",
-        "item3": "Explain exactly why your AI agent doesn't work the way you expected, and fix it"
-      },
-      "workingStyle": {
-        "title": "Working Style",
-        "paragraph1": "I'm the kind of developer you can generally leave unattended, as long as the overall vector is clear. I have enough life expertise to figure stuff on my own, enough imagination to fill the missing pieces, and a \"treat any job as if it was your own brainchild\" mentality.",
-        "paragraph2": "In other words: a surprisingly low-maintenance LLM tinkerer with a TypeScript kink, ready to prototype, debug, or sanity-check your AI-infused ambitions."
-      },
-      "aiExpertise": {
-        "title": "AI Expertise",
-        "paragraph": "I tend to stick to a more \"economical\" paradigm of AI usage: smaller prompts, more aware of context limitations, less \"let's feed it all and it'll somehow work!\" My expertise predates the ChatGPT hype cycle, which means I understand not just the APIs, but the underlying patterns and limitations that most \"AI engineers\" are still discovering."
+      "blocks": {
+        "coreCapabilities": {
+          "title": "Core Capabilities",
+          "items": [
+            "Bring your idea to an MVP/prototype in 1-2 months",
+            "Clean the mess in the prototype you vibe-coded",
+            "Explain exactly why your AI agent doesn't work the way you expected, and fix it"
+          ]
+        },
+        "engagements": {
+          "title": "Engagements",
+          "items": [
+            {
+              "label": "Idea → production:",
+              "text": "your idea in the hands of real users in one to two months, built the way it will be maintained rather than as a demo to throw away."
+            },
+            {
+              "label": "Your team on agent rails:",
+              "text": "the architecture, the staged pipeline and the pre-push gate that let a crowd of agents ship without drifting — set up on your codebase, then handed over as checked-in procedure rather than as advice. It has been handed over once already, and the engineers who took it carried it to projects of their own."
+            },
+            {
+              "label": "Rescue and diagnosis:",
+              "text": "the prototype that got vibe-coded into a corner, and the agent that doesn't do what you expected — usually the same purchase."
+            },
+            {
+              "label": "Standing technical judgment:",
+              "text": "framework and platform selection, build-vs-buy, and a straight answer on what the models still cannot do."
+            }
+          ]
+        },
+        "engineeringSystem": {
+          "title": "The Engineering System",
+          "items": [
+            "Feature-sliced architecture held by linters, so a crowd of agents working at once cannot drift the structure.",
+            "A staged pipeline — plan, implement, review, finalize — each stage its own session, with a reviewable artifact between them.",
+            "One gate before every push: nine concurrent checks with the production build as the end-to-end.",
+            "CI/CD where merging is deploying, and a 2.4-day deploy cadence to show for it.",
+            "An audit trail by construction: 1,395 commits, 48 releases and 18 hotfixes, every one of them reviewable."
```

**@vzakharov** — 2026-09-08T17:18:20Z

no need, it's not an "offer"

**@vzakharov** — 2026-09-08T17:53:33Z

Agreed, and removed in ea186a5 (both catalogues). The commit tally is a description of work already done, and the block it sat in is "What I Offer" — nothing about it is on sale. It still stands where it belongs: the case study and the Playgram experience entry.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/shared/i18n/messages/en.json`:56

```diff
@@ -18,20 +18,59 @@
     },
     "whatIOffer": {
       "title": "What I Offer",
-      "coreCapabilities": {
-        "title": "Core Capabilities",
-        "item1": "Bring your idea to an MVP/prototype in 1-2 months",
-        "item2": "Clean the mess in the prototype you vibe-coded",
-        "item3": "Explain exactly why your AI agent doesn't work the way you expected, and fix it"
-      },
-      "workingStyle": {
-        "title": "Working Style",
-        "paragraph1": "I'm the kind of developer you can generally leave unattended, as long as the overall vector is clear. I have enough life expertise to figure stuff on my own, enough imagination to fill the missing pieces, and a \"treat any job as if it was your own brainchild\" mentality.",
-        "paragraph2": "In other words: a surprisingly low-maintenance LLM tinkerer with a TypeScript kink, ready to prototype, debug, or sanity-check your AI-infused ambitions."
-      },
-      "aiExpertise": {
-        "title": "AI Expertise",
-        "paragraph": "I tend to stick to a more \"economical\" paradigm of AI usage: smaller prompts, more aware of context limitations, less \"let's feed it all and it'll somehow work!\" My expertise predates the ChatGPT hype cycle, which means I understand not just the APIs, but the underlying patterns and limitations that most \"AI engineers\" are still discovering."
+      "blocks": {
+        "coreCapabilities": {
+          "title": "Core Capabilities",
+          "items": [
+            "Bring your idea to an MVP/prototype in 1-2 months",
+            "Clean the mess in the prototype you vibe-coded",
+            "Explain exactly why your AI agent doesn't work the way you expected, and fix it"
+          ]
+        },
+        "engagements": {
+          "title": "Engagements",
+          "items": [
+            {
+              "label": "Idea → production:",
+              "text": "your idea in the hands of real users in one to two months, built the way it will be maintained rather than as a demo to throw away."
+            },
+            {
+              "label": "Your team on agent rails:",
+              "text": "the architecture, the staged pipeline and the pre-push gate that let a crowd of agents ship without drifting — set up on your codebase, then handed over as checked-in procedure rather than as advice. It has been handed over once already, and the engineers who took it carried it to projects of their own."
+            },
+            {
+              "label": "Rescue and diagnosis:",
+              "text": "the prototype that got vibe-coded into a corner, and the agent that doesn't do what you expected — usually the same purchase."
+            },
+            {
+              "label": "Standing technical judgment:",
+              "text": "framework and platform selection, build-vs-buy, and a straight answer on what the models still cannot do."
+            }
+          ]
+        },
+        "engineeringSystem": {
+          "title": "The Engineering System",
+          "items": [
+            "Feature-sliced architecture held by linters, so a crowd of agents working at once cannot drift the structure.",
+            "A staged pipeline — plan, implement, review, finalize — each stage its own session, with a reviewable artifact between them.",
+            "One gate before every push: nine concurrent checks with the production build as the end-to-end.",
```

**@vzakharov** — 2026-09-08T17:18:58Z

it's not always nine :) need smth along the liens of keeping branch hygiene in-session so agents don't contaminate main with code that breaks it

**@vzakharov** — 2026-09-08T17:53:31Z

Fair — nine is a fact about this repo today, not a promise anyone can make about yours. Reframed in ea186a5 around what the gate is actually for:

> Branch hygiene held in-session: a gate of concurrent checks before every push, the production build among them, so no agent contaminates main with code that breaks it.

Dropped the count, kept the production build as the thing that makes it a real gate. `ru.json` mirrored.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/shared/i18n/messages/en.json`:57

```diff
@@ -18,20 +18,59 @@
     },
     "whatIOffer": {
       "title": "What I Offer",
-      "coreCapabilities": {
-        "title": "Core Capabilities",
-        "item1": "Bring your idea to an MVP/prototype in 1-2 months",
-        "item2": "Clean the mess in the prototype you vibe-coded",
-        "item3": "Explain exactly why your AI agent doesn't work the way you expected, and fix it"
-      },
-      "workingStyle": {
-        "title": "Working Style",
-        "paragraph1": "I'm the kind of developer you can generally leave unattended, as long as the overall vector is clear. I have enough life expertise to figure stuff on my own, enough imagination to fill the missing pieces, and a \"treat any job as if it was your own brainchild\" mentality.",
-        "paragraph2": "In other words: a surprisingly low-maintenance LLM tinkerer with a TypeScript kink, ready to prototype, debug, or sanity-check your AI-infused ambitions."
-      },
-      "aiExpertise": {
-        "title": "AI Expertise",
-        "paragraph": "I tend to stick to a more \"economical\" paradigm of AI usage: smaller prompts, more aware of context limitations, less \"let's feed it all and it'll somehow work!\" My expertise predates the ChatGPT hype cycle, which means I understand not just the APIs, but the underlying patterns and limitations that most \"AI engineers\" are still discovering."
+      "blocks": {
+        "coreCapabilities": {
+          "title": "Core Capabilities",
+          "items": [
+            "Bring your idea to an MVP/prototype in 1-2 months",
+            "Clean the mess in the prototype you vibe-coded",
+            "Explain exactly why your AI agent doesn't work the way you expected, and fix it"
+          ]
+        },
+        "engagements": {
+          "title": "Engagements",
+          "items": [
+            {
+              "label": "Idea → production:",
+              "text": "your idea in the hands of real users in one to two months, built the way it will be maintained rather than as a demo to throw away."
+            },
+            {
+              "label": "Your team on agent rails:",
+              "text": "the architecture, the staged pipeline and the pre-push gate that let a crowd of agents ship without drifting — set up on your codebase, then handed over as checked-in procedure rather than as advice. It has been handed over once already, and the engineers who took it carried it to projects of their own."
+            },
+            {
+              "label": "Rescue and diagnosis:",
+              "text": "the prototype that got vibe-coded into a corner, and the agent that doesn't do what you expected — usually the same purchase."
+            },
+            {
+              "label": "Standing technical judgment:",
+              "text": "framework and platform selection, build-vs-buy, and a straight answer on what the models still cannot do."
+            }
+          ]
+        },
+        "engineeringSystem": {
+          "title": "The Engineering System",
+          "items": [
+            "Feature-sliced architecture held by linters, so a crowd of agents working at once cannot drift the structure.",
+            "A staged pipeline — plan, implement, review, finalize — each stage its own session, with a reviewable artifact between them.",
+            "One gate before every push: nine concurrent checks with the production build as the end-to-end.",
+            "CI/CD where merging is deploying, and a 2.4-day deploy cadence to show for it.",
```

**@vzakharov** — 2026-09-08T17:19:44Z

more like ci/cd that fits *your* workflows -- whether it's ship every commit from main, staging-based release cycles, or release trains

**@vzakharov** — 2026-09-08T17:53:32Z

Done in ea186a5:

> CI/CD that fits your workflow — ship every commit off main, staging-based release cycles, or release trains.

That drops the old line’s "2.4-day deploy cadence" proof, which was the other half of the sentence. No loss on the page — the cadence still appears in the profile paragraph and in the Playgram experience entry, where it reads as a measurement rather than as an offer. `ru.json` mirrored.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/shared/i18n/messages/en.json`:273

```diff
@@ -223,10 +262,30 @@
     "footer": {
       "backLink": "← Back to main page",
       "printFooter": "Full portfolio:"
+    },
+    "variants": {
+      "cto": {
+        "metadata": {
+          "description": "Fractional hands-on CTO for AI-native delivery: agent orchestration, guardrails, and a pipeline that shipped 250,000 lines of production TypeScript in 158 days.",
+          "ogSuffix": "The platform outlived my involvement — the engineers who took it over run it today."
+        },
+        "header": {
+          "tagline": "Fractional hands-on CTO for AI-native delivery"
```

**@vzakharov** — 2026-09-08T17:20:30Z

How about "Fractional, hands-on" with a comma? Don't edit yet, weigh in

**@vzakharov** — 2026-09-08T17:56:09Z

Weighing in, no edit — and I would **take the comma**.

Two reasons. Grammatically they are coordinate adjectives, not a compound modifier: "fractional and hands-on CTO" is a sentence you can say, which is the standard test, and the comma is what marks that. Without it the phrase reads as a single job title — *fractional-hands-on* — as though the two words were one category someone already recognises. They are not.

The better reason is that the comma is load-bearing for the pitch. "Fractional" and "hands-on" pull in opposite directions — part-time versus in-the-code — and that tension *is* the offer. Run together they blur; with the pause, "hands-on" lands as its own claim rather than as a qualifier on how fractional you are.

Cost: it makes the tagline read a beat more formal, and a comma inside a five-word line is visible. I think that is worth it here, because the line has to survive being read by someone deciding whether "fractional" means "will not be around when it breaks".

**Scope if you say go:** four strings, not one — `en` `variants.cto.header.tagline` and `variants.cto.metadata.description`, plus `ru`. The Russian is "Фракционный hands-on CTO для AI-native разработки"; the same comma works there ("Фракционный, hands-on CTO"), though Russian is more tolerant of the run-together form, so it is a separate call if you want them to differ. Re-rendering the CV PDFs is part of the change.

---
_Generated by [Claude Code](https://claude.ai/code)_

**@vzakharov** — 2026-09-08T22:43:27Z

let's do it

**@vzakharov** — 2026-09-08T23:21:34Z

Done in 770b7df — the comma is in all four strings: `variants.cto.header.tagline` and `variants.cto.metadata.description`, in `en` and `ru` alike. Russian reads "Фракционный, hands-on CTO для AI-native разработки"; I kept the two catalogues consistent rather than letting them differ, since nothing in the reasoning is English-specific.

**One correction to my own scoping comment above: there are no CV PDFs to re-render.** I said re-rendering them was part of the change, and that was wrong. The only committed PDFs are the three case-study cuts, and `SHARED_SOURCES` in `scripts/render-pdf.ts` doesn't list `shared/i18n` — so the tagline isn't in their source set at all. The CV prints live from the browser off `print.scss`; nothing about it is a committed artifact.

Separately, and not caused by this: the case-study PDFs *were* stale on this branch, from the earlier commits touching `pages/case-studies/ui`, `shared/config` and `shared/content`. Re-rendered and committed in 560922f, with the printed output verified unchanged.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/shared/ui/section.tsx`:8

```diff
@@ -2,14 +2,18 @@ import { Box, Stack, Title } from '@mantine/core';
 
 import type { WithChildren, WithId } from '@/shared/typings';
 
-type SectionProps = WithId & WithChildren;
+type SectionProps = WithId &
+  WithChildren & {
+    /** `1` where the section is the whole page, so its heading is the document's. */
+    order?: 1 | 2;
```

**@vzakharov** — 2026-09-08T17:22:57Z

why not some boolean prop (default false)?

**@vzakharov** — 2026-09-08T17:56:08Z

Done in ea186a5 — `order?: 1 | 2` is now `standalone?: boolean` (default `false`), with the component doing `<Title order={standalone ? 1 : 2}>`.

Agreed on the reasoning: the call site knows whether the section *is* the whole page, which is a fact about the page; it should not have to know that the fact implies `h1`. `music-section` and `writing-section` now read `<Section id="music" standalone>`, which says the thing rather than encoding it.

---
_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/shared/typings/index.ts`:38

```diff
@@ -30,8 +30,17 @@ export type WithOptionalClassName = { className?: string };
 /** What a wrapper component renders inside itself. */
 export type WithChildren = { children: ReactNode };
 
+/** A heading and whatever renders under it. */
+export type TitledBlock = Titled & WithChildren;
+
+/** The case study a card cross-links. */
+export type WithOptionalCaseStudyHref = { caseStudyHref?: string };
+
```

**@vzakharov** — 2026-09-08T22:49:33Z

not domain-less; if it's a question of import directionality, suggest introducing a case study entity

**@vzakharov** — 2026-09-08T23:21:41Z

Analysis, no code change yet — this one has a wrinkle worth putting to you before I move anything.

**You're right on the premise, and yes, it's import directionality.** `ProjectCardProps` (`pages/home`) and `ExperienceCardProps` (`pages/cv`) both declare `caseStudyHref?`. They're sibling slices on the same layer, so nothing can be shared sideways, and the base has to sit below both. `shared/typings` was the lowest thing that already existed — which is the whole of why it's there, not a claim that "the case study a card cross-links" is domain-less. It plainly isn't.

**I went to cost out the entity and found its main payoff isn't available.** What I expected to collapse was `'playgram'`, which the tree spells three times:

- `FEATURED_CASE_STUDY = 'playgram'` — `shared/content/collections.ts`
- `CASE_STUDY_KEY = 'playgram'` — `pages/cv/ui/case-study-link.tsx`, whose own docstring admits it: *"Its slug is the server's `FEATURED_CASE_STUDY`"*
- `EXPERIENCE_KEYS[0] === 'playgram'` — `pages/cv/ui/experience-card.tsx`

An `entities/case-study` slice can't merge those, because of the wall that created the second one. The entity would need `documentRoute` to build `FEATURED_CASE_STUDY_ROUTE`, that comes from `@/shared/content`, and FSD requires going through its barrel — which re-exports `documents.ts`, which is `import 'server-only'`. So the entity's own public API inherits the taint, and `CaseStudyLink` (a client component, it calls `useMessages`) still can't value-import the slug from it. Same wall, one layer up.

**And I think the duplication is misdiagnosed anyway.** `CASE_STUDY_KEY` isn't really a second copy of the content slug — it's a key into `cv.caseStudies`, which merely happens to be *named* after the slug. The clean fix for that is the pattern already in use one line over: the href is resolved on the server and passed down as a prop, so the label can be too. That's a `pages/cv` change with no layer involved.

Which leaves the entity holding one optional-prop type and a route constant, and that lands squarely on what `.claude/rules/fsd.md` warns about — *"`entities/` and `widgets/` are absent because nothing earns them yet, not as an oversight... inventing one costs more than leaving it out"* — plus the trap line two sections down, *"The content pipeline is `shared/content`, not an entity."* I'd be introducing the repo's first `entities/` layer and rewriting both statements in the same change.

**So my counter-proposal, which I think answers "not domain-less" at the right price:** move `WithOptionalCaseStudyHref` from `shared/typings` into `shared/content`, beside `DocumentRef`, `Slugged` and `Routed` — the segment that already owns case-study nouns and already exports domain-shaped types. It's `export type`, and both call sites already `import type`, so nothing pulls `server-only` and the client subtree is unaffected. `shared/typings` goes back to holding only what genuinely has no domain, which is what its own docstring claims for it.

Three ways to go, and it's your call:

1. **`shared/content`** (my recommendation) — one moved type, no new layer, no rule-doc rewrite.
2. **`entities/case-study`** — I'll build it if you want the noun to have a real home on principle; it just won't collapse the slug, and it needs the two `fsd.md` statements rewritten.
3. **Either of those, plus passing the CV's case-study label down as a prop** — which is the change that actually removes a spelling of `'playgram'`, and is worth doing independently of where the type lives.

---
_Generated by [Claude Code](https://claude.ai/code)_

**@vzakharov** — 2026-09-09T00:09:50Z

neither; let's keep as is for now

---

### `app/cv/[[...variant]]/page.tsx`:1

**@vzakharov** — 2026-09-09T00:13:07Z

again, we're left with this essentially repeating `app/[locale]/cv/[[...variant]]/page.tsx`. 

what if we just do `app/cv/[[...variantAndLocale]]`, resulting in cto/en, dev/en, cto/ru, dev/ru -- all parsed by a single page. Iirc (and I might not), the original argument for locale being the first route segment was "smth smth i18n works this way" -- but at this point I don't see us doing *anything* here using i18n's out-of-the-box means, so we're hand-writing it anyway, and frankly a locale in the end of the route looks better to me than in the beginning

let me know if it has a bigger blast radius than I imagine (one is backward comp -- but ignore it as long as bare /cv/ -- a link I might've actually shared where it matters -- resolves to *something*)

**@vzakharov** — 2026-09-09T00:40:27Z

Landed in 9f1c4c7 — the blast radius is one item bigger than your list, and the item is small.

**Your premise is wrong in one respect, and it doesn't change the answer.** We *were* using next-intl's out-of-the-box means: `createNavigation(routing)` gave `Link`, `usePathname` and `useRouter`, and those were what made the variant switch and the locale picker work. `localePrefix` has `'always' | 'as-needed' | 'never'` and custom *prefixes* — no suffix mode — so a trailing locale can't be expressed through them and they had to go. That turned out to be worth doing on its own: the two controls now build hrefs from `cvPath` and use `next/link`, the locale picker is a real link instead of a post-hydration `router.replace`, and the client bundle drops 35 kB (1,039,570 → 1,004,108 B of chunks). `shared/i18n` keeps the locale list and nothing else.

**What it emits**, measured off `out/`:

| | |
| --- | --- |
| `/cv` | cto, en |
| `/cv/cto`, `/cv/dev` | that framing, en |
| `/cv/cto/en`, `/cv/cto/ru`, `/cv/dev/en`, `/cv/dev/ru` | both named |

7 files where there were 9, from 1 route file where there were 2, and `app/[locale]/` is gone. Each rung advertises itself as its own `og:url` and declares the fully-specified twin canonical, so `/cv` is `og:url=/cv` + `canonical=/cv/cto/en`; the sitemap lists only the four twins. Interaction always moves you to a full address — from `/cv`, the switch goes to `/cv/dev/en` — so the short rungs are entry points rather than a second set of pages.

**The one thing you asked about is fine:** bare `/cv` is a real 72 kB page with the CTO CV in it, not a stub. `/en/cv` and `/ru/cv` 404, as you authorised.

**And a side effect worth naming:** that was the last `redirect()` in the tree, so the site now has *no* JS-only redirect page — the defect from the thread above has no live instance. `grep -rl NEXT_REDIRECT out/` hits only Next's own router chunk. Filed the latent trap as #32.

Two things I did **not** do, both yours to call:

1. **`hreflang`.** The en and ru CVs declare no `alternates.languages`, so nothing tells a crawler they're translations of each other. Pre-existing, and locale-as-suffix makes it more load-bearing than prefix did, since the URL no longer hints at the language. Say go and it's four lines in `generateCvMetadata`.
2. **`<html lang>` is hardcoded `"en"`** in the root layout, so `/cv/cto/ru` serves 13,505 Cyrillic characters under `lang="en"`. Also pre-existing and not made worse by this — only a root layout renders `<html>`, and it sat above `[locale]` too — but it's a real a11y/SEO bug. Happy to file it.

Say the word and I'll revert the whole thing; it's one commit.

---
_Generated by [Claude Code](https://claude.ai/code)_


**@vzakharov** — 2026-09-09T01:00:08Z

let's do 1; for the second one file an issue

---

### `docs/remove-before-merging/squash-message.md`:1

**@vzakharov** — 2026-09-09T00:15:00Z

this is getting hefty; cut the "four things to know" part -- it doesn't belong to a squash message (no one will be accidentally looking into it to figure out how pdfs work), and going forward make sure the message doesn't bloat following our future edits (cut&replace, don't just append) 

**@vzakharov** — 2026-09-09T00:40:58Z

Cut, in b5f4bf2 — the paragraph is gone and the body is four paragraphs.

The same commit re-states the CV paragraph rather than appending to it, which your second point is exactly about: the addressing had been inverted by the round before and the old sentence was still standing ("declares `/cv` canonical" — it's the other way round now), so the body was carrying both the current record and a superseded one.

`WithStringVariant`, which the cut paragraph named, no longer exists either — the schemas replaced it two rounds ago. That's the failure mode you're describing: a body that only ever gains sentences accumulates claims nobody re-checks.

---
_Generated by [Claude Code](https://claude.ai/code)_


---

### `docs/remove-before-merging/squash-message.md`:53

```diff
@@ -25,23 +25,32 @@ subsections are keyed blocks with the per-variant order in code, the
 shape `experience` and `techStack` already use. Nothing retitles
 history: Playgram is "Developer" in both.
 
-The home page becomes the pitch. Writing and music each get a page of
+The home page becomes the pitch: writing and music each get a page of
 their own behind a *See also* footer line, the in-page nav goes, the
-case-studies block folds into a four-card featured grid, and
-Professional Work becomes Recent Work. That puts three page slices on
-`Section` and `BackToHome`, so those and a new `PageShell` move to
-`shared/ui` — FSD allows only downward imports, and none of the three
-composes a page or carries domain meaning, which is what keeps them
-out of a `widgets/` layer invented to hold them. The unlocalized page
-routes live in `shared/config` for the same reason: home's footer and
-the pages it links are separate slices.
-
-Two things to know when editing this area. The case-study PDFs hash
-`src/shared/content`, `src/shared/config` and `src/pages/case-studies/ui`
-as one source set, so touching any of them means re-running
-`pnpm content:pdf` even when nothing printed changes. And the
-`no-hardcoded-strings` exemption now names three slices rather than
-one — every unlocalized page authors its copy in the JSX.
+case-studies block folds into a featured project grid, and Professional
+Work becomes Work Highlights — ordered by weight, each entry carrying
+the organisation's own mark. That puts three page slices on `Section`
+and `BackToHome`, so those and a new `PageShell` move to `shared/ui`:
+FSD allows only downward imports, and none of the three composes a page
+or carries domain meaning, which is what keeps them out of a `widgets/`
+layer invented to hold them. The unlocalized page routes sit in
+`shared/config` for the same reason, and `TECH_STACKS` beside them is
+the one source for every stack line — the same three facts had been
+spelled three ways, across the project cards, the highlight cards and
+the CV. One string serving both locales is the accepted cost: two
+descriptors read in English on the ru CV.
+
+Four things to know when editing here. The case-study PDFs hash
+`src/shared/content`, `src/shared/config` and
+`src/pages/case-studies/ui` as one source set, so touching any of them
+means re-running `pnpm content:pdf` even when nothing printed changes.
+A card that both leads somewhere and holds its own links carries
+`CardLink` as a positioned first child, not an anchor around it —
+anchors cannot nest. Route params get named shapes (`WithStringLocale`,
+`WithStringVariant`, `WithParams`) instead of an object literal inlined
+into a generic, which `pnpm type-overlap` cannot read across. And the
+`no-hardcoded-strings` exemption names three slices rather than one:
+every unlocalized page authors its copy in the JSX.
```

**@vzakharov** — 2026-09-09T00:15:26Z

to add to the above general-file comment, if this needs a rule, let it be a rule

**@vzakharov** — 2026-09-09T00:41:08Z

Made a rule, in b5f4bf2 — two of them, in `.claude/skills/squash-message/SKILL.md` § "Step 3 — Tighten it", since that skill is the home for the body's format and a second home would just drift from it:

- **A trap for whoever edits the area next is not part of the record.** It sits with the existing list of what else stays out of a body. It also names the line that licensed the paragraph you cut — Step 3 used to ask for "anything that would trip someone editing that area later", which is how a maintenance manual ended up in a commit message with the pass thinking it had done its job. That clause is gone, and the rule says where such a constraint goes instead (a `.claude/rules/` file, or a docstring on the thing itself) and the one case where the body does mention it: when the change *is* that the constraint now exists.
- **A re-run rewrites; it never accretes.** Step 2 hands the run a live file, so the cap has to be re-applied to the whole body on every refresh, not just the first. The tell is named: a proposal that grew every time the branch did.

---
_Generated by [Claude Code](https://claude.ai/code)_


**@vzakharov** — 2026-09-09T01:01:31Z

I was referring to making a rule out of what the removed prose used to say; but your added one is okay too lol (but the suggestion stays).

---

### `writing/notes/the-five-percent.md`:119

```diff
@@ -106,7 +106,19 @@ then in the search people see "ok, this one's for cto, and it sits on
 en/cv/cto"_. Flipped, the cost is the goal, and the collapse the agent had
 argued against became free — four route files down to two.
 
-## It writes its reasoning into the artifact (×2)
+**9 September — the prefix as the shape a locale comes in.** Told the two CV
+route files still repeated each other, the agent had collapsed four into two the
+round before and reported that as the answer. What it never asked was whether
+`/{locale}/…` had to be the shape at all: `app/[locale]/` is Next's documented
+convention and next-intl's whole routing story, so it arrived as the given and
+the duplication got reasoned about inside it. The reply moved the segment to the
+end — `/cv/cto/ru` — and one file answers every address. The operator's stated
+reason was wrong in one respect, that nothing here used next-intl's
+out-of-the-box means: `Link`, `usePathname` and `useRouter` were doing real work.
+They were also 35 kB of prefix machinery serving two links, which is what the
+question surfaced and what the agent's own defence of the prefix never reached.
```

**@vzakharov** — 2026-09-09T01:07:05Z

I feel like you've gotten into the habit on overadding to this lol (which in itself is a meta-lesson): you wouldn't have known that moving locale to another segment location would be an answer -- that's not an agent's call to take. Perhaps you could've pitched the idea -- but it's not like you should've went "oh ok, here's a problem, let me break the entire routing structure to fix it", it'd be a worse sin

---

## Timeline (status, references, and other events)

- **2026-09-08T17:23:51Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/31#pullrequestreview-5144632432.
- **2026-09-08T22:51:53Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/31#pullrequestreview-5147809032.
- **2026-09-09T00:16:51Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/31#pullrequestreview-5148340350.
- **2026-09-09T00:32:38Z** @vzakharov cross-referenced this pull request from [#32 Static-export redirects are JS-only blank pages — needs one durable primitive](https://github.com/vzakharov/vovazakharov.com/issues/32).
- **2026-09-09T01:07:31Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/31#pullrequestreview-5148621579.
