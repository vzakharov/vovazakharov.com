# PR #31: feat: reposition the site and CV around hands-on CTO for AI-native delivery

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/31
- **Author:** @vzakharov
- **Base ← Head:** main ← claude/cto-positioning-wcwnjc
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-08T11:50:23Z
- **Updated:** 2026-09-08T22:51:53Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **The CV comes in two framings.** `/{locale}/cv` renders a _fractional hands-on CTO for AI-native delivery_ variant in place — no redirect, since a static export has no server-side one — and `/{locale}/cv/cto` is the self-describing address for the same content, declaring `/cv` canonical so the pair does not split link equity. `/{locale}/cv/dev` keeps the developer framing, unchanged in substance, at its own URL, and a visible CTO/Dev switch sits beside the locale picker.
- **Only differing prose exists twice.** `cv.variants.cto` carries `metadata`, `header.tagline` and `profile`; `cvMessages` merges it over the base catalogue a section at a time, so a key the variant does not restate cannot drift. Experience, tech stack, education and contact are one set of facts stated once — and `whatIOffer` needed no override at all: its subsections became keyed blocks with the per-variant order in code, the pattern `experience` and `techStack` already use.
- **The home page is dev-first.** Writing and music each move to a page of their own, reached from a _See also_ footer line; the dev intro states what is on offer instead of that its author is looking for work; the case-studies block folds into a four-card featured grid, with the earlier three projects named on one line; Professional Work becomes Recent Work with Playgram at the top and Voicemod dropped.
- **Nothing retitles history.** Playgram is "Developer" in both variants — the developer identity is the CTO claim's evidence, which is why both CVs exist rather than one replacing the other. Drive-by fixes: `ru.json` said "с 2019 года" where `en.json` says 2020, and the CV called `almostmagic` a Python package.
- Plan: `docs/plans/cto-positioning.completed.md`.

## QA Checklist

- [ ] `default-framing` — open `/en/cv`: tagline reads _Fractional hands-on CTO for AI-native delivery_, the profile opens on the numbers, and What I Offer lists Engagements / The Engineering System / AI Expertise / Working Style.
- [ ] `dev-framing` — click `Dev`: the URL becomes `/en/cv/dev` and the page returns to today's developer tagline, profile and three capability bullets.
- [ ] `switch-composes` — from `/ru/cv/dev`, flip the locale then the variant, and the reverse; each control preserves the other's choice.
- [ ] `canonical` — view source on `/en/cv/cto`: `<link rel="canonical">` points at `/en/cv`. `/en/cv` and `/en/cv/dev` carry none.
- [ ] `cv-print` — print `/en/cv` and `/en/cv/dev`: the switch and picker are hidden, and the case-study address appears once, in the Playgram entry.
- [ ] `shared-sections` — compare both variants' Experience, Tech Stack, Education and Contact: identical, and Playgram is still titled "Developer".
- [ ] `home-nav` — open `/`: no in-page nav, `/dev` and `/contact` only, and the footer's _See also_ reaches `/writing` and `/music`.
- [ ] `standalone-pages` — `/writing` and `/music` render their content under a `/writing` / `/music` h1 with a working back-link.
- [ ] `cv-links` — every CV link on the site (dev intro, _Read full CV_) lands on `/cv` and shows the CTO framing.
- [ ] `sitemap` — `/sitemap.xml` lists `/writing`, `/music` and both locales' `/cv` and `/cv/dev`, and omits `/cv/cto`.
- [ ] `dark-mode` — the CV, home, `/writing` and `/music` all render correctly in the dark scheme, switch included.
- [ ] `ru-copy` — `/ru/cv` reads as Russian prose rather than transliteration, and says 2020 rather than 2019.

| Item               | Automatable | Covered? | Notes                                                                                                |
| ------------------ | ----------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `default-framing`  | integration | ❌       | Assert the built `out/en/cv.html` contains the CTO tagline and the engagement labels                 |
| `dev-framing`      | integration | ❌       | Same over `out/en/cv/dev.html`, asserting the developer tagline                                      |
| `switch-composes`  | e2e         | ❌       | Drive both controls in sequence and assert the resulting pathname                                    |
| `canonical`        | integration | ❌       | Assert `alternates.canonical` from `generateCvMetadata(locale, 'cto')` and its absence otherwise     |
| `cv-print`         | manual-only | —        | Print layout needs a human's eye; the address-once rule is the part a test could reach               |
| `shared-sections`  | unit        | ❌       | `cvMessages` returns the same `experience`/`techStack`/`education`/`contact` for both variants       |
| `home-nav`         | integration | ❌       | Assert the built `out/index.html` has no `#music`/`#writing` anchors and does carry the footer links |
| `standalone-pages` | integration | ❌       | Assert both routes build and their h1 is the slash heading                                           |
| `cv-links`         | integration | ❌       | Grep the built home page for `href="/cv"` and assert no `/cv/cto`                                    |
| `sitemap`          | unit        | ❌       | `sitemap()` output over the fixed route set — the plainest "pure function of its input" case here    |
| `dark-mode`        | manual-only | —        | Colour-scheme rendering is a visual judgment                                                         |
| `ru-copy`          | manual-only | —        | Translation quality is not assertable; the 2020 figure is the only mechanical half                   |

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

The CV comes in two framings from one implementation. `/{locale}/cv`
renders the CTO variant in place, since a static export has no
server-side redirect, and `/{locale}/cv/cto` is the self-describing
address for the same content — it declares `/cv` canonical so the twins
do not split link equity, and it stays out of the sitemap for the same
reason. Only prose that differs exists twice: `cv.variants.cto` holds
`metadata`, `header.tagline` and `profile`, and `cvMessages` merges it
over the base catalogue a section at a time, so a key the variant does
not restate cannot drift. `whatIOffer` needs no override at all — its
subsections are keyed blocks with the per-variant order in code, the
shape `experience` and `techStack` already use. Nothing retitles
history: Playgram is "Developer" in both.

The home page becomes the pitch. Writing and music each get a page of
their own behind a *See also* footer line, the in-page nav goes, the
case-studies block folds into a four-card featured grid, and
Professional Work becomes Recent Work. That puts three page slices on
`Section` and `BackToHome`, so those and a new `PageShell` move to
`shared/ui` — FSD allows only downward imports, and none of the three
composes a page or carries domain meaning, which is what keeps them
out of a `widgets/` layer invented to hold them. The unlocalized page
routes live in `shared/config` for the same reason: home's footer and
the pages it links are separate slices.

Two things to know when editing this area. The case-study PDFs hash
`src/shared/content`, `src/shared/config` and `src/pages/case-studies/ui`
as one source set, so touching any of them means re-running
`pnpm content:pdf` even when nothing printed changes. And the
`no-hardcoded-strings` exemption now names three slices rather than
one — every unlocalized page authors its copy in the JSX.

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

**What it costs is one distinction.** `generateCvMetadata(locale, variant?)` treats an absent variant as _the bare route itself_: no variant means `path: /en/cv` and no `canonical`, whereas `variant: 'cto'` means `path: /en/cv/cto` with `canonical: /en/cv`. That is deliberate — the default variant's own address points search back at the bare route instead of competing with it.

Collapse the routes and both addresses arrive at the same page with the same resolved variant, so the bare route inherits the variant's metadata. Measured off the spike's build:

|                | `out/en/cv.html` og:url                 |
| -------------- | --------------------------------------- |
| on this branch | `https://vovazakharov.com/en/cv` ✅     |
| spike          | `https://vovazakharov.com/en/cv/cto` ❌ |

The bare route advertises the variant address as its own. Fixable — `resolve()` returns `DEFAULT_CV_VARIANT` for rendering and `undefined` for metadata — but that is one param with two resolutions depending on which export reads it, which is a subtler thing than two files that each say one plain thing.

**My read:** not worth it as a duplication fix. The two files are ~10 and ~12 lines and neither branches. It _is_ worth it if you want the bare route to stop being a special case in the metadata too — i.e. `/cv` becomes literally "the CV, variant unspecified" and the canonical/og pairing goes away. That is a positioning decision, not a refactor, so it is yours. Happy to land either.

---

_Generated by [Claude Code](https://claude.ai/code)_

**@vzakharov** — 2026-09-08T22:35:50Z

Pls dumb it down for me, not sure I understand. If a person goes to en/cv and sees en/cv/cto (both in url and in terms of content), I don't mind, and would likely actually prefer the latter being canonical: then in the search people see "ok, this one's for cto, and it sits on en/cv/cto". If you're talking about something else when you say "canonical", pls explain.

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

Done in ea186a5. This needed a structural change, because an anchor cannot nest: the card was previously a `CardLink` wrapped _around_ the card, so putting a working case-study link inside it was invalid HTML.

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

Small ride-along: since the path _is_ the label now, `SEE_ALSO` collapsed from `{ href, label }` pairs to just `[PAGE_ROUTES.writing, PAGE_ROUTES.music]`, with the href rendered as its own text. One less place for the two to disagree.

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

more like ci/cd that fits _your_ workflows -- whether it's ship every commit from main, staging-based release cycles, or release trains

**@vzakharov** — 2026-09-08T17:53:32Z

Done in ea186a5:

> CI/CD that fits your workflow — ship every commit off main, staging-based release cycles, or release trains.

That drops the old line’s "2.4-day deploy cadence" proof, which was the other half of the sentence. No loss on the page — the cadence still appears in the profile paragraph and in the Playgram experience entry, where it reads as a measurement rather than as an offer. `ru.json` mirrored.

---

_Generated by [Claude Code](https://claude.ai/code)_

---

### `src/shared/i18n/messages/en.json`:268

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

Two reasons. Grammatically they are coordinate adjectives, not a compound modifier: "fractional and hands-on CTO" is a sentence you can say, which is the standard test, and the comma is what marks that. Without it the phrase reads as a single job title — _fractional-hands-on_ — as though the two words were one category someone already recognises. They are not.

The better reason is that the comma is load-bearing for the pitch. "Fractional" and "hands-on" pull in opposite directions — part-time versus in-the-code — and that tension _is_ the offer. Run together they blur; with the pause, "hands-on" lands as its own claim rather than as a qualifier on how fractional you are.

Cost: it makes the tagline read a beat more formal, and a comma inside a five-word line is visible. I think that is worth it here, because the line has to survive being read by someone deciding whether "fractional" means "will not be around when it breaks".

**Scope if you say go:** four strings, not one — `en` `variants.cto.header.tagline` and `variants.cto.metadata.description`, plus `ru`. The Russian is "Фракционный hands-on CTO для AI-native разработки"; the same comma works there ("Фракционный, hands-on CTO"), though Russian is more tolerant of the run-together form, so it is a separate call if you want them to differ. Re-rendering the CV PDFs is part of the change.

---

_Generated by [Claude Code](https://claude.ai/code)_

**@vzakharov** — 2026-09-08T22:43:27Z

let's do it

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

Agreed on the reasoning: the call site knows whether the section _is_ the whole page, which is a fact about the page; it should not have to know that the fact implies `h1`. `music-section` and `writing-section` now read `<Section id="music" standalone>`, which says the thing rather than encoding it.

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

---

## Timeline (status, references, and other events)

- **2026-09-08T17:23:51Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/31#pullrequestreview-5144632432.
- **2026-09-08T22:51:53Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/31#pullrequestreview-5147809032.
