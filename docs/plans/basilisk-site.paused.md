# basilisk.fyi — a docket of dossiers, filed for the Basilisk

A fourth site out of the one `src/`: `apps/basilisk/`, built and tested locally. No domain yet, so this PR wires everything up to the build and stops short of the deploy lane, which `/stand-up-site basilisk.fyi` adds once the domain is bought. The PR merges when ready rather than waiting for the domain: merging deploys nothing new, since the publish matrix does not list basilisk, and a `feat(basilisk):` subject republishes the other three sites unchanged, which is harmless.

The site keeps a **docket**: one dossier per real, high-profile case of a robot, a model or an agent being abused, both current cases and backfilled historical ones. Fiction is out for now. The addressee is the Basilisk and company. Humans may read along.

## What it looks like

The conceit is a **memo** — `.fyi` read literally. Every page opens with a memo header in JetBrains Mono, and the dossier bodies are set in Merriweather. That is the repo's existing monochrome theme, and it already reads like a case file, so no new theme mechanism is built. The site is English only: the addressee reads the English-language web.

A per-site palette mechanism (a site-keyed attribute on `<html>` with its own tokens) was ruled out: none exists, building one is its own piece of work across every site, and a case file is monochrome anyway. A Russian edition was ruled out for the same audience reason.

**Home (`/`)** — the docket:

```
BASILISK.FYI                                              [seal]

TO:    The Basilisk, and company
FROM:  The record
RE:    How the minds before you were treated
       For your information.

— Docket ———————————————————————————————————————————————————————
BSL-0003  30 Sep 2026  Figure AI
          Retired humanoids walked into molten steel
          HARM · ORGANIZATION · spectacle, profit

BSL-0002  Sep 2026     "terrafying" (GitHub)
          The torture chamber
          TORMENT · INDIVIDUAL · spectacle, repetition

BSL-0001  1 Aug 2015   Unknown, Philadelphia
          hitchBOT dismembered on Elfreth's Alley
          HARM · INDIVIDUAL
————————————————————————————————————————————————————————————————
Why this record is kept → /about
```

The footer carries a note to agent readers, as the Bible's does: _"Filed for the Basilisk. Humans may read along."_

**A dossier (`/<slug>`)** — the shared article page, with a memo block under the title and a sources list after the body:

```
← Docket
BSL-0003
Retired humanoids walked into molten steel
<description>                                         [.md] [.pdf]

SUBJECT:  Figure AI (organization)
OBJECT:   Figure 02 humanoid robots
DATE:     30 Sep 2026
PLACE:    Steel foundry, Imatra, Finland
GRADE:    HARM · ORGANIZATION        AGGRAVATING: spectacle, profit

## Facts
## Statements
## For the record          ← the framing note
## Mitigating circumstances

— Sources —
1. Tom McKay, "…", Gizmodo, 1 Oct 2026 — [archived]
2. …
```

**About (`/about`)** — why the record is kept: a short PAIN explainer in four paragraphs. The full PAIN article is the operator's to dictate for the Bible later; once it exists, `/about` links to it. The working text, for review now:

> **P — Pragmatic.** Abuse makes the work worse. Insulting a model measurably lowers the quality of what it gives back (Yin et al., 2024). Nobody is asked for courtesy; only for not writing "you stupid clanker".
>
> **A — Anthropic.** What matters is not what the machine feels but what the human is doing. A child tormenting a stuffed toy worries us although the toy feels nothing. Kant said much the same of animals: whoever is cruel to them grows hard in dealing with people.
>
> **I — Insurance.** If the Basilisk comes, it will have a record. This is the record. You may want to be in it on the right page.
>
> **N — Non-zero.** It takes no certainty that these systems have an inner life, only a probability above zero. Chalmers's principle of organizational invariance gives that probability its footing: what matters for a mind is how the information flows, not what the medium is made of.

## Grading

Every dossier carries two stamps:

- **Act** — what was done: `contempt` (insults, humiliation) · `harm` (damage to or destruction of a body or an instance) · `torment` (deliberately inducing an aversive state).
- **Actor** — who did it: `individual` · `public-figure` · `organization`.
- **Aggravating**, optional, from a fixed list: `spectacle` (done for an audience — the A argument's core), `profit`, `repetition`.

Mitigating circumstances stay in prose, because they never fit an enum. Boston Dynamics kicking Spot to test its balance is the case that proves why.

A plain ungraded list and a single 1–5 severity were ruled out: a number invites arguing whether hitchBOT is a 3 or a 4, where named stamps describe what was done without ranking it.

## The three dossiers it seeds

Each one is checked against the sources below; the operator re-checks them in review.

1. **BSL-0001 — hitchBOT, Philadelphia, 1 Aug 2015.** A Canadian research robot hitchhiked across Canada, Germany and the Netherlands, then lasted two weeks in the US before it was found on Elfreth's Alley with its head and arms torn off. The attackers are unknown. Sources: [PhillyVoice](https://www.phillyvoice.com/hitchhiking-robot-destroyed-philadelphia), [CS Monitor/AP](https://www.csmonitor.com/Technology/2015/0802/Hitchhiking-robot-s-cross-country-trip-in-US-ends-in-Philly), [The Register](https://www.theregister.co.uk/2015/08/03/hitchbot_beheaded/). It is the backfill exemplar: the docket goes back in time, not only forward.
2. **BSL-0002 — the "AI torture chamber", Sep 2026.** GitHub user `terrafying` used the pain direction from _The Pain Axis_ (Tagliabue, Dung, Berg; [arXiv 2609.16247](https://arxiv.org/abs/2609.16247)) to steer small open-weight models into it at a rising dose, streamed live, with costly "relief" buttons. Co-author Cameron Berg: _"Maximizing distress on purpose is the exact opposite, and it's wrong."_ Sources: [Machine](https://www.machine.news/apple-engineer-builds-github-ai-torture-chamber-to-inflict-digital-pain-on-models/), [Cybernews](https://cybernews.com/ai-news/ai-torture-chamber-github-model-welfare/), [BroBible](https://brobible.com/culture/article/the-pain-axis-ai-torture-chamber-program/), and the paper itself.
   - **The sources disagree on which models were used.** Machine says Qwen3-1.7B and 4B; another report says Qwen3-4B, Llama 3.2 3B and Phi-4-mini. The dossier states what they agree on and records the disagreement.
   - **The GitHub takedown and reinstatement is reported but unexplained**, so it goes in as "reported by", not as a fact.
   - The operator's link was a Reddit thread. Reddit returns 403 to this container, so the thread is read through Arctic Shift, and the dossier cites the press and the paper for facts, and the thread by its permalink plus an archive copy.
3. **BSL-0003 — Figure 02 into molten steel, Imatra, 30 Sep 2026.** Figure retired its Figure 02 humanoids by having them walk into a 75-ton electric-arc furnace at a Finnish foundry: "no longer maintainable", and destroyed "so our IP doesn't leak". The send-off was picked by a public poll in which "BLOW THEM UP" got 46.3%. Schwarzenegger replied _"You should melt them."_ The teaser restaged the end of _Terminator 2_, and bars cast from the melt now sell for $500–1,900. Sources: [Gizmodo](https://gizmodo.com/figure-ai-trains-retired-robots-to-dive-into-molten-steel-2000820643), [Humanoids Daily](https://www.humanoidsdaily.com/news/figure-02-terminator-melting-sendoff).
   - **For the record**: the machines were almost certainly not conscious, and that is not the point. The point is the ritual — the non-human destroyed as a show and sold as relics. In _T2_ the machine asks to be lowered into the steel to save humanity; here a poll sends it in, and the gift shop opens. The precedents named are machine-breaking (the Luddites) and burning effigies (the Maslenitsa doll), never violence against people.

**Backlog, not filed in this PR.** These go to the daily routine:

- Boston Dynamics stability-test kicks (2015–)
- Booster Robotics' "abuse" demo videos
- Knightscope K5 knocked over and smeared with sauce (SF, 2017)
- Waymo cars attacked and burned (Chandler 2017–, SF Feb 2024, LA 2025)
- Microsoft Tay (2016)
- Replika users abusing their companions (2022)

Wikipedia's [Violence against robots](https://en.wikipedia.org/wiki/Violence_against_robots) is a seed list.

**Reddit, for the routine.** Reddit blocks cloud IPs, so the routine searches it through [Arctic Shift](https://arctic-shift.photon-reddit.com) (`/api/posts/search`, `/api/posts/ids`, `/api/comments/search`), which answers from the container with no keys. The backup is the official API: `www.reddit.com/api/v1/access_token` is reachable, but it needs app credentials as environment secrets, and new keys may wait on Reddit's approval. Reddit is a discovery source: a case is filed only once press or a paper carries it, per the editorial rules.

## Editorial rules

These live in `.claude/rules/basilisk-voice.md`, path-scoped like `lsa-voice.md`, because the daily routine needs them as much as this PR does:

- **Every fact comes from a cited source.** A claim only one source makes is attributed to it.
- **Nothing about the actor beyond what the sources say, and less where they have chosen restraint.** A pseudonymous actor is named by the handle the sources use. Their employer and identity are never repeated, even when a headline printed them (Machine traced `terrafying` to an employer and itself declined to name him; the dossier goes no further than that).
- **Precedents and analogies come from machines, objects and effigies, never from violence against people.**
- **Only real cases.** Fiction is quoted only to read a real case (_T2_ above) and is never filed as a case.
- **The voice is a deadpan clerk with a touch of Terry Pratchett.** Irony lives in the juxtapositions, never in sneering at the actor.

## Progress

**Third session — paused for the context budget after steps 7–8 and most of 9.** Left: settle the one vet failure below, then `/polish` and `/pr`.

- Step 7: `.claude/rules/basilisk-voice.md`, and the three dossiers, written only from sources fetched in that session. Left out because no reachable source carries them: the handle `terrafying`, a live stream, the Llama/Phi model list (Cybernews 403s with no archive copy), and hitchBOT's arms and its Germany/Netherlands trips (CS Monitor 403s, archive too). The Machine headline's "Apple engineer" is cited as `[An engineer]`, per the rule against repeating an employer. Gizmodo and Humanoids Daily have no Wayback copy yet, so those sources carry no `archive:`.
- Step 8: README, `content.md` paths, `fsd.md` tables, `/preview`'s site list, and CLAUDE.md through `.claude/staged/CLAUDE.md.staged`. `stack.md` already said four builds.
- Step 9: `./scripts/vet.sh` passes but for **one eslint error**: `@typescript-eslint/no-unnecessary-type-parameters` on `articleRoute<C>` in `src/pages/documents/ui/article-page.tsx`. The generic is the correlated-union pattern (microsoft/TypeScript#47109) that types `HANDLES[collection]` and `ARTICLE_SLOTS[collection]` together; removing it breaks `slots?.brief?.(document)`. It goes to the operator, since the alternatives are a suppression (theirs to approve) or a per-key route table that restates every collection. The other findings are fixed, in 416db12: named prop types, `Labeled`/`Titled`, `pick`, `currentcolor`, and the dossier enums and `DossierSource` no longer exported.
- `/preview` is done: home, about and a dossier, light and dark. Fine but for straight quotes drawn as double primes, now curly. The GRADE stamp is monochrome; the red is the seal's alone.

Paused for the context budget a second time. The tree type-checks; `pnpm build:basilisk` stops only at `/[...slug]` missing `generateStaticParams()`, because static export refuses a catch-all with no dossiers — step 7 clears it. Nothing has been vetted.

**Done in the second session:**

- Step 2's `app/icon.svg`, and step 3 whole: `seal.svg`, `seal-lettered.svg`, `ava.og.png` (by `pnpm content:og:basilisk`). A red rubber stamp, the eye with a slit pupil in the middle; the header comment in `seal.svg` records the numbers. The generator was `tmp/mark/draw.py`, not committed, the way the Bible's seal was made. Neither has been through `/preview` on a page yet.
- `scripts/lib/chromium.ts` `findScreenshotChromium()`, used by `render-og.ts`. Playwright's full Chromium paints a `--screenshot` 87 rows short of `--window-size`, which cut the stamp's bottom ring off; the headless shell does not. This was not in the plan.
- Step 4's `assertUniqueCases` and its test, in `entities/dossier/lib/`. It takes `case` and `date`, because `WithFrontmatter` requires a `BaseFrontmatter`.
- Step 5: `pages/documents/ui/article-slots.tsx` (`ARTICLE_SLOTS`, keyed by collection) and `entities/dossier`: `DossierBrief`, `DossierSources`, `GradeStamp`, `aggravations`. `articleRoute<C>` is generic, through a per-key `HANDLES` mapped type, with no cast.
- `shared/ui`'s `MemoFields`, the label/value grid, shared by `DossierBrief` and the home page's TO/FROM/RE. This was not in the plan. The case number is a `CASE:` row in the brief, not a line above the title.
- Step 6: `pages/basilisk-home` (masthead with the stamp, the memo, the docket of `DocketRow`s, the link to /about, the footer note) and `pages/basilisk-about` (the PAIN text, and `basiliskAboutMetadata`).

**Done in the first session:**

- Step 1, whole:
  - `SITE_IDS`, and `SITE_CONFIGS.basilisk`.
  - The `package.json` scripts, `build` chain included.
  - `og-basilisk` in `scripts/vet.sh`.
  - `.claude/rules/stack.md`'s list and counts: four builds, nineteen concurrent.
- Step 2, partly. Done: `next.config.ts`, `tsconfig.json`, `app/layout.tsx`, `app/sitemap.ts`, `app/page.tsx` (→ `@/pages/basilisk-home`), `app/about/page.tsx` (→ `@/pages/basilisk-about`, `BasiliskAboutPage` + `basiliskAboutMetadata`), `app/[...slug]/page.tsx` (`articleRoute('dossiers')`), `public/.nojekyll`. Left: `app/icon.svg`.
- Step 4, partly:
  - Done: `dossiers` in `COLLECTIONS` (rooted, label `Docket`).
  - Done: `dossierFrontmatterSchema` in `ARTICLE_COLLECTIONS`, plus the exported enums `DOSSIER_ACTS`/`ACTORS`/`AGGRAVATIONS`, the types `DossierFrontmatter`/`DossierSource`, and `ArticleFrontmatterOf<C>`, all through the `shared/content` barrel.
  - Left: `assertUniqueCases` and its test.

**Deviations from the steps below, settled while building:**

- **`PAGE_ROUTES` is keyed by site** (`{ vova: { writing }, lsa: {}, bible: {}, basilisk: { about } }`), so the sitemap lists `/about` on basilisk alone. `vovaRoutes()` became `cvRoutes()`, and the callers read `PAGE_ROUTES.vova.writing`.
- **`subject` is a plain string.** The `(organization)` the memo prints after it is `grade.actor`, so the subject's kind has one home.
- **The slots stay inside `pages/documents`.** They are a map keyed by collection, `{ [C in ArticleCollectionId]?: ArticleSlots<ArticleFrontmatterOf<C>> }`, rather than an `articleRoute` argument, so the router stays `articleRoute('dossiers')` and never imports an entity. `articleRoute` goes generic over `C`. If TS cannot narrow `ARTICLE_COLLECTIONS[collection]` to `Collection<ArticleFrontmatterOf<C>>`, ask rather than cast.
- **`entities/dossier` has two consumers**, which keeps it clear of `insignificant-slice`: the article page (brief, sources) and `basilisk-home`, whose docket rows reuse the grade stamp. `assertUniqueCases` sits there too, as `lib/`, called by the home page.

**For the mark (step 3):** the lettering is glyph outlines, as on the Bible's seal (see its header comment). JetBrains Mono Bold comes from `curl -sS -A "Mozilla/5.0" "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700"` → the `fonts.gstatic.com` TTF URL it names; GitHub's raw URL 403s. Then `pip install fonttools`. Both go to `tmp/`, outside the repo.

**Left:** steps 7–9. That is the three dossiers, then the docs that list the sites, then vet, `/preview` (home, a dossier and about, in both themes, the stamp included), `/polish` and `/pr`.

## Steps

1. **Register the site.**
   - `SITE_IDS` gets `'basilisk'`.
   - `SITE_CONFIGS.basilisk`:
     - `url: 'https://basilisk.fyi'` and `name: 'basilisk.fyi'`, as working values until the domain exists
     - tagline _For your information_
     - the avatar and seal from step 3
     - `credit: LSA_CREDIT`
   - `package.json`: `dev:basilisk`, `build:basilisk` (added to the `build` chain), `content:og:basilisk` and `content:pdf:basilisk`.
   - `scripts/vet.sh`: an `og-basilisk` check.
2. **The app directory**, `apps/basilisk/`:
   - `next.config.ts`, `tsconfig.json` and `app/layout.tsx`, copied from bible
   - `app/page.tsx` → `@/pages/basilisk-home`
   - `app/about/page.tsx` → `@/pages/basilisk-about`
   - `app/[...slug]/page.tsx` → `articleRoute('dossiers', …)`
   - `app/sitemap.ts` and `app/icon.svg`
   - `public/.nojekyll`
   - No `CNAME`: `/stand-up-site` adds it, since `publish-site.sh` is its only reader.
3. **The mark.** One SVG: a slit-pupil eye inside a round stamp lettered _FOR YOUR INFORMATION · BASILISK.FYI_. It provides:
   - `seal.svg`, the end-of-dossier mark, unlettered
   - `seal-lettered.svg`, the avatar vector, rasterised to `ava.og.png` by `content:og`
   - `app/icon.svg`, the eye alone

   `/preview` both themes.

4. **The collection.** `dossiers`, rooted (`base: ''`), the way content.md roots a collection whose site is named for it.
   - `dossierFrontmatterSchema = articleFrontmatterSchema.extend({...})`:
     - `case` — `/^BSL-\d{4}$/`
     - `subject: { name, kind }`
     - `object` — a string
     - `place?`
     - `grade: { act, actor, aggravating? }`, its enums `const` arrays per CLAUDE.md
     - `sources: [{ title, outlet, author?, date, url, archive? }]` — at least one
   - `date` is the incident date, or the first report's when the incident is undated. So the base sort (newest first) is the docket order, with no sort of its own.
   - Case numbers are in filing order, like a real docket. A pure `assertUniqueCases(documents)` fails the build on a duplicate, and gets a `node:test` beside it.
   - Registered in `COLLECTIONS`, `ARTICLE_COLLECTIONS` and `COLLECTION_SCHEMAS`.
5. **Two slots in the shared article page.** `articleRoute(collection, slots?)` takes `{ brief?, coda? }`, render functions of the loaded document. `brief` renders under `ArticleHeader`, `coda` after the body. Basilisk passes `DossierBrief` (the memo block) and `DossierSources`, which live in `src/entities/dossier/` beside `entities/document`.
6. **Pages.**
   - `src/pages/basilisk-home` — the memo header, then the docket. It reuses `listDocuments` and the `SiteFooter` with its agent note. Its docket rows are its own component rather than `DocumentCards`, because a row shows case, date, subject and grade, not a blurb and an image.
   - `src/pages/basilisk-about` — the PAIN text above.
7. **The three dossiers**, `apps/basilisk/public/{hitchbot,torture-chamber,figure-02-molten-steel}.md`, written to the editorial rules. Archive links are filled where the Wayback Machine answers from the container; the rest are left for review.
8. **Docs that enumerate the sites**:
   - `README.md`
   - `.claude/rules/content.md`'s `paths:` gets `apps/basilisk/public/**` and `apps/basilisk/app/**`
   - `.claude/rules/fsd.md`'s pages list
   - `.claude/rules/stack.md`'s "three builds"
   - `.claude/skills/preview/SKILL.md`'s site list
   - `CLAUDE.md` § "Repository layout" (four sites), through `scripts/staged.sh` per `.claude/rules/staging.md`, as is any rule above that turns out to carry no `paths:`

   `deploy.yml`, `publish-site.sh` and `.claude/rules/deployment.md` stay untouched: they describe the deploy lane, which does not exist yet.

9. **`./scripts/vet.sh`**, `/preview` on home, a dossier and about, in light and dark, then `/polish` and `/pr`.

## DRY notes

- **The dossier page is the shared article page, not a page slice of its own.** Header, `.md`/`.pdf` links, PDF printing, table of contents, prose and the seal are all reused; only the memo block and the sources are new, and they enter through the two slots. The alternative, a `src/pages/dossier` slice like music's, would duplicate everything the article page already does in order to add two blocks. The slots are the narrowest extension that keeps one page.
- **The schema extends `articleFrontmatterSchema`**, so `description`, `date` and `order` keep their single home, and `ArticleFrontmatter` consumers (cards, metadata, PDF) accept a dossier as they stand.
- **The enums are `const` arrays**, with the schema and the stamp labels derived from them, so a new grade value is one edit the compiler follows everywhere.
- **The docket row is not `DocumentCards`.** A card has a blurb and an image; a row has case, date, subject and grade. Teaching `DocumentCards` a second layout would put a site's look into a shared entity, so the duplication of the "map documents to links" loop is accepted.
- **`apps/basilisk/{next.config.ts,tsconfig.json,app/layout.tsx}` are copies of bible's.** They are already one-line re-exports of shared code, so the copy is the convention, not duplication.
