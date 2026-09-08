# Repositioning: hands-on CTO for AI-native delivery

Two changes ride together, because the second is what makes the first land:

1. **A second CV variant** — the existing developer CV stays at its URL; a fractional-hands-on-CTO framing gets its own, sharing everything that is the same fact stated once.
2. **The home page becomes dev-first** — writing and music move to their own pages, linked from the footer under _See also_; the dev section becomes the pitch it currently isn't.

## Part A — Is there demand? (research, no code)

**Short answer: yes, but not for the word "CTO" on its own.** The market pays for
a bundle — production evidence of running non-deterministic systems under
governance — and "CTO" is one of several frames that bundle is sold under. The
frame that matches this evidence is _fractional/hands-on technical leadership for
a company whose delivery capacity is agents rather than headcount_.

### What the data supports

| Signal                                                                                                                                                                                                                       | Source                                                                                                                              | Read                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Fractional hiring demand +149% YoY (Q1 25 → Q1 26); 5× monthly postings since early 2024; engineering = 17% of roles; avg engineering rate **$229/hr**                                                                        | [Fractional Work Report 2026](https://www.fractionaljobs.io/the-fractional-work-report)                                             | The _engagement shape_ exists and is priced well above dev contracting.          |
| **24%** of clients explicitly request AI-native skills; **38%** say AI expertise helped win work; 36% of buyers are early-stage VC-backed                                                                                     | same                                                                                                                                | The buyer described in the prompt ("founder with an idea") is the modal one.      |
| **94%** won clients via network referral; **72%** got their first client through a personal contact                                                                                                                           | same                                                                                                                                | **The site is not the acquisition channel.** It converts, it doesn't hunt.        |
| Fractional CTO bands: $4–10k/mo advisory (10–15 h), $10–25k/mo active (20–40 h), $20–40k interim; hourly $150–500                                                                                                             | [A.Team](https://www.a.team/talent/guides/fractional-cto-rates), [kompella.io](https://kompella.io/thinking/why-fractional-cto-2026) | Pricing to aim at; the top band is explicitly "direct production AI experience". |
| "The fractional CTO conversation and the AI agent conversation have merged into one"; a 2026 fractional CTO is expected to _own_ AI strategy, not comment on it                                                               | [TNW](https://thenextweb.com/news/fractional-cto-ai-reshapes-business), [jetrockets](https://jetrockets.com/blog/fractional-cto-and-ai-agents-the-2026-startup-leadership-model) | The two things Vova has are the two things this role now bundles.                 |
| Agentic-AI engineering is a seller's market at $185–320k base; the title is ~2 years old and few have shipped an agent that survives production                                                                               | [KORE1 survey](https://www.kore1.com/agentic-ai-hiring-2026/)                                                                       | Scarcity is in _shipped-and-survived_, which the case study documents.            |
| Only **21%** of enterprises have mature agentic governance; **74%** expect meaningful agent use by 2027 (Deloitte, via KORE1)                                                                                                 | same                                                                                                                                | The sellable artifact is guardrails, not enthusiasm.                             |
| AI platform leader specs ask for: an orchestration layer owning retries/validation/sequencing, eval harnesses for non-deterministic output, audit trails, minimum-privilege tool access, golden-path templates, cost attribution | [Augment Code 2026 job spec](https://www.augmentcode.com/guides/ai-platform-engineering-leader-job-spec)                             | The dev-side analogues map 1:1 — see the translation table below.                |

### Counter-evidence, held honestly

- **Most of the pro-fractional-CTO literature is content marketing by the platforms that place fractional CTOs.** The primary-ish numbers (the Fractional Jobs report, the KORE1 survey, Deloitte's governance figure) are the ones this plan leans on; "adoption tripled" and "replacing full-time leadership" are vendor copy and are discounted.
- **The role is where people are burning out.** Unrealistic AI expectations are the leading cause of CTO/VPE jobs going bad in 2026 — founders expecting an "AI-native" transformation plus 20–50% cost cuts, and what the piece calls founder "AI psychosis" ([Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/the-great-engineering-leader-career-break)). Positioning into this without scoping the engagement buys that problem.
- **A self-declared CTO with no line management is a credibility risk** in the lane the prompt already excludes (big company, Kafka/Kubernetes). Nothing found suggests it is a risk with the seed-stage founder — but it is why this plan claims the title on the **offer**, never retroactively on a past **title**.
- **"Managing a team of dev agents" is not yet a phrase buyers search for.** It is a differentiator inside a conversation, not a keyword to be found by. The searched-for words are _fractional CTO_, _AI-native_, _agent orchestration_, _AI transformation_.

### The two buyers, and why one noun can't serve both

1. **Founder with an idea and no technical lead.** Buys judgment plus delivery. "Hands-on CTO" is exactly right, and per the report this is the modal buyer.
2. **Company that already has engineers and wants them on agent rails.** Already has a CTO; a second one reads as a threat. Here the purchase is a named, finite engagement that ends in runbooks — which is what the report says the median AI project now wants.

Both are served by the same evidence and the same person, and **not** by the same noun. Resolution: the CTO CV leads with buyer 1, and buyer 2's work is one of its named engagements rather than a second identity.

### The translation table (this is the actual asset)

The Playgram work already produced the artifacts the 2026 leadership specs ask
for, in dev form. The CTO CV should say so in these terms.

| What the specs ask for                           | What exists                                                                                                                                   |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Orchestration layer, not per-agent improvisation | plan → implement → review → finalize, each stage its own session with a reviewable artifact between them                                       |
| Guardrails on non-deterministic output           | linter-enforced feature-sliced architecture that a crowd of concurrent agents cannot drift                                                     |
| Eval/regression gate before release              | the vet suite as the single pre-push gate; nine concurrent checks, the build as the end-to-end                                                 |
| Audit trail                                      | 1,395 commits on main, 48 releases, 18 hotfixes — a deploy every 2.4 days, all of it reviewable                                                |
| **Developer platform and enablement**            | **the platform was built _for_ handover: three engineers use it in production today, and carry it to new repos through `agent-project-boilerplate`** |
| **Technical leadership of humans**               | **reviewed three engineers' work and mentored them on the infrastructure and on conceptual code/architecture calls**                            |
| Delivery at scale                                | 250,000 lines of production TypeScript in 158 days, none hand-written, up to 20 agents at once                                                 |
| Cost/latency awareness                           | the "economical paradigm" already claimed on the CV, plus sub-second cold loads down from multi-second                                          |

The two bolded rows were, in the first draft of this plan, listed as gaps. They
are not: the operator reviewed and mentored three engineers on the platform, and
platform-for-other-engineers was a stated goal of the work — evidenced by
adoption after handover and by the extraction into a reusable boilerplate that
propagated to other projects **without him**. That last fact is the strongest
single claim available, because a platform that outlives its author's involvement
is the definition of enablement, and almost nobody who pitches this can show one.

**What genuinely remains outside the claim:** compliance-grade governance
(SOC 2-style audit posture, minimum-privilege runtime enforcement, procurement
review) and formal line management (hiring, headcount, performance authority).
That is what keeps the claim at "hands-on CTO for a founder or a small
engineering team" rather than "VP AI Engineering at a Series B" — and both
omissions are load-bearing for the honest-boundary sentence in B3.

## Part B — What changes

Guiding constraints, unchanged from the first draft:

- **Evidence before title.** Every added claim is one the case study or the repo already backs.
- **The experience section stays factually titled.** Playgram was "Developer" and remains "Developer" in both CV variants. Retitling history is the one move that would make the whole thing read as inflation.
- **Don't lose the hands-on noun.** The pitch is _hands-on_; the developer identity is the CTO claim's evidence, which is exactly why both CVs exist rather than one replacing the other.
- **The site converts; it does not hunt.** 94% of this work is won by referral, so the reader is someone who already has the name and is checking whether it holds up. Proof and an engagement shape, not a funnel.
- **Both locales, always.** `en.json` and `ru.json` move key for key.

### B1. Two CV variants, one implementation

The developer CV keeps its framing, unchanged in substance; the CTO variant —
titled _Fractional hands-on CTO for AI-native delivery_ — becomes what `/cv`
serves by default, with a visible switch between the two on the page itself.

**Routing.** A `[variant]` dynamic segment — `app/[locale]/cv/[variant]/page.tsx`
with `generateStaticParams` over locales × `['cto', 'dev']` — alongside the
existing `app/[locale]/cv/page.tsx`, which renders the default:

| URL                    | Renders                                                       |
| ---------------------- | ------------------------------------------------------------- |
| `/{locale}/cv`         | CTO — the default, **rendered in place**: no redirect or URL rewrite to the `/cto` form, since the canonical address is the one that should serve content directly and every redirect under static export is a client-side hop. The existing `/cv` → `/{defaultLocale}/cv` locale hop is unchanged |
| `/{locale}/cv/cto`     | CTO — the same page under a URL that says which one it is      |
| `/{locale}/cv/dev`     | the developer variant                                         |
| `/cv`, `/cv/{variant}` | locale-less redirects, mirroring today's `app/cv/page.tsx`     |

`/cv` and `/cv/cto` rendering identically is the one thing this costs, and it is
worth pricing rather than waving off: two URLs with the same content split link
equity, and a search engine picks its own canonical when we don't. The fix is one
field and belongs in this change — `constructMetadata` has no `alternates`
support today, so add it and have `/cv/cto` declare `/cv` canonical. With that,
the self-describing URL is free, and the earlier objection to the dynamic segment
does not survive it.

**The toggle.** A light dev/cto switch in the CV header, beside the locale
picker. It is deliberately visible: it does not hide that two roles are being
pitched, and on a site whose whole voice advantage is not sounding like vendor
copy, a second framing discovered rather than shown is the version that reads
badly. Mechanics: the two controls must compose — switching locale preserves the
variant, switching variant preserves the locale — and `locale-picker.tsx`'s
`pathname === '/cv'` guard becomes a check over the CV route family. Both are
small in-page controls with one consumer, so the switch sits beside the picker in
`pages/cv/ui/`, and the CTO side of it always links `/cv` so the active state
maps to one URL.

**Where the variant lives.** `cv-page.tsx` and `cv-metadata.ts` both need the
same variant-resolved messages, so the resolution gets exactly one home — a
`cvMessages(locale, variant)` in `src/pages/cv/lib/`. The message catalogues
carry the CTO variant as an **override subtree** (`cv.variants.cto`) holding only
the sections that differ; `cvMessages` merges it over `cv` one level deep per
section, so a key the variant doesn't restate cannot drift from the base. The
page then renders through the existing `t('…')` calls untouched.

**What differs, and what is one fact stated once:**

| Section                                          | CTO variant                                                                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `metadata.description` / `ogSuffix`              | **differs** — this is the text in search results and link previews, and it carries the searched-for words (fractional CTO, AI-native) |
| `header.tagline`                                 | **differs** — _Fractional hands-on CTO for AI-native delivery_                                                                       |
| `profile`                                        | **differs** — see B2                                                                                                                 |
| `whatIOffer`                                     | **differs** — see B3                                                                                                                 |
| `experience`, `techStack`, `education`, `contact`, `footer`, `printButton`, `website` | **shared, identical.** Same facts, and re-stating them per variant is how two CVs start contradicting each other |

`techStack` staying shared is worth a note rather than a decision: its
"Django/FastAPI _if_…, Next.js API _if_…, NestJS _if_…" shape is already
build-vs-buy reasoning rather than a skills list, so it reads as CTO material
unchanged. It is the one section that needed nothing.

Rejected: hiding the pairing — no cross-link, each variant sent by hand into its
own conversation. It made the reader guess which document they had, and a second
framing found rather than offered is the one that looks evasive.

**Details to get right during implementation:** the developer CV moves from `/cv`
to `/cv/dev`, so `/cv` changes meaning rather than location — anything already
pointing at it now lands on the CTO framing, which is the intent; the CTO variant
reuses `/cv_card.png` as its OG image until there is a reason for its own.

### B2. Profile — proof first, boundary named

The developer variant keeps today's opening (physics-and-math brain, then the
"don't buy or sell buzzwords / a level or two deeper / intuition for what models
can and cannot do" clause, then the range paragraph). It is good as it stands.

The CTO variant restructures:

1. **Opens on the headline numbers** — 158 days, 250k lines of production TypeScript none of it hand-written, up to 20 agents at once, a deploy every 2.4 days — so proof lands before any adjective does.
2. **Second sentence carries handover**, which is the differentiator no rate card can argue with: the platform is in use by the engineers who took it over, and travels to new projects as a boilerplate.
3. **Keeps the buzzwords clause verbatim.** It is the best-differentiated prose on the site, and in this frame it reads as judgment rather than temperament.
4. **Ends on the honest boundary** — founder-and-small-team scale; no compliance-grade governance, no headcount authority. It costs nothing with buyer 1 and prevents the conversation that burns people out.

Drive-by, both variants: `en.json` says **since 2020**, `ru.json` says **с 2019
года**. 2020 is correct (operator-confirmed) — fix the Russian.

### B3. `whatIOffer` — engagements, not capabilities

The developer variant keeps its three capability bullets. The CTO variant
replaces them with four **named engagements**:

| Engagement                      | Substance                                                                                                                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Idea → production**           | today's "MVP in 1–2 months", retimed to what the case study actually demonstrates                                                                                                                              |
| **Your team on agent rails**    | the point of the repositioning: architecture held by linters, the staged pipeline, the vet gate — set up, then handed over as checked-in procedure rather than advice. **Its precedent is a completed handover** |
| **Rescue and diagnosis**        | today's items 2 and 3 merged: the vibe-coded mess and the agent that doesn't do what was expected are one purchase                                                                                             |
| **Standing technical judgment** | the advisory band — framework and platform selection, build-vs-buy, what the models can't do                                                                                                                   |

Plus, in the CTO variant only, a subsection for the **engineering system**
(linter-held architecture, staged pipeline, the vet gate, CI/CD, deploy cadence)
— the competencies that grew from dark forest to strength and that the site does
not currently claim at all. `workingStyle` survives nearly verbatim in both; in
the CTO variant "you can leave me unattended" describes how the engagement runs
rather than how an employee behaves. The case study is linked from inside
`whatIOffer` as well, so the proof is reachable from the claim.

**Markup consequence:** `cv-page.tsx` hardcodes three capability items and three
subsections. Both become data-driven, following the pattern `techStack` already
uses in the same file — read off `useMessages()` and mapped — so a variant with a
different number of engagements needs no component change.

### B4. Home page — dev-first, four cards, one thesis

**Hero stays.** The four-noun subtitle and "Helping our future overlords walk
since 2020" are the personal-site voice, and the _See also_ footer is what makes
the writing/music nouns resolve. The pitch belongs in the dev section, not the
hero.

**The in-page nav goes.** It currently points at `#music`, `#writing` and
`#contact`; two of those sections are leaving, and a nav for one remaining anchor
is noise on a page this short.

**Dev section intro** replaces "I'm currently looking for new challenges, so have
a look at my CV if you're looking for new people" — employee framing that
undercuts the whole repositioning — with an offer-shaped two-liner in the
existing voice (the "stuff that works, stuff that doesn't" line stays).

**Featured projects: four cards, and the case study is one of them.** The separate
"Case studies" block folds into the grid.

| Card                          | Copy direction                                                                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Playgram.ai**               | one sentence on the rebuild, plus **Read the case study →**                                                                                                |
| **agent-project-boilerplate** | the platform extracted from that work, now carried onto other projects by the engineers who took it over — the enablement claim, as a link anyone can open  |
| **jukebox-webui** (84★)       | Suno before Suno: running OpenAI's music model in Colab when there was no product to use instead                                                            |
| **almostmagic** (65★)         | structured generation before it was a feature — typed output from one call, years before every SDK shipped it                                              |

Under the grid, **one line for the same-pattern-earlier projects** — `write`
(LLM-agnostic text processor), `mindy` (group AI chat), `ideality-nuxt` (no-code
AI widgets) — each linked, none carded. That names all three and gives the grid
its thesis (_saw it before the big player made it a standard_) at the cost of one
line instead of three more cards, which was the right call about overkill.

The case-study link resolves through `documentRoute('case-studies', 'playgram')`
— the same helper `app/[locale]/cv/page.tsx` already uses — so home stops
rendering the collection to derive one title. Since that makes two consumers of
the featured-case-study id, the constant moves out of the route module into
`shared/content`. A small "All case studies, including the shorter cuts →" line
stays under the grid so the mini/nano cuts don't become unreachable.

**Professional Work → Recent Work**, with Playgram added at the top (the rebuild,
the handover, the three engineers mentored, the boilerplate now on other
projects), DDB/randddb and Orcool kept, **Voicemod removed** as irrelevant to the
current pitch, and a **Read full CV →** line beneath.

Every CV link on the site — the offer intro and _Read full CV_ alike — points at
`/cv`, which serves the CTO framing and carries the switch to the developer one.
One link, one place to change, and no page has to decide which framing its reader
came for.

Drive-by: the CV calls `almostmagic` a "Python package", the home page a
TypeScript wrapper. The repo is TypeScript — fix the CV.

### B5. Writing and music become their own pages

- New page slices `src/pages/writing/` and `src/pages/music/`, taking `writing-section.tsx` + `article-card.tsx` and `music-section.tsx` respectively.
- New routes `app/writing/page.tsx` and `app/music/page.tsx`, one-line re-exports with metadata from a `lib/*-metadata.ts` per slice — the pattern `pages/case-studies` already uses. Both are unlocalized, matching home (only the CV is localized today).
- **`section.tsx` moves to `shared/ui`, not to `widgets/`.** Three page slices need it and FSD allows only downward imports, so it has to move somewhere below `pages/` — and the `widgets/` layer is for composites assembled from features and entities, which `Section` is not: it takes an id and children and renders a heading. Nothing in it composes a page or carries domain meaning, which is the definition of a `shared/ui` primitive. Opening `widgets/` for a layout shell would also be the layer-invention that `.claude/rules/fsd.md` prices as costing more than it saves; the layer earns its keep the day a block with real content is reused across pages (a contact block on all three, say), and that day is not this change. On a standalone page the `/{id}` heading may want to be the `h1`; decide while looking at it in `/preview`.
- `ProjectCard` stays inside `pages/home` and `ArticleCard` travels with writing — each has one consumer, which is what "no insignificant slices" asks for.
- **Footer:** a _See also_ line linking `/writing` and `/music`, and **"Built with Next.js" is removed** — it tells the reader nothing. The copyright line stays.
- **Sitemap:** `staticRoutes` in `src/app/lib/sitemap.ts` is hand-listed; add `/writing`, `/music` and `/{locale}/cv/dev`. `/{locale}/cv/cto` stays out of it — a sitemap listing both twins asks the crawler to resolve a duplicate we already resolved. It is **built and served** either way: `generateStaticParams` emits it, it renders the CTO CV, and `alternates.canonical` is what points search at `/cv`. Unadvertised, not absent — the address exists to be sent to a person by hand, it is simply never where the site takes anyone.

### B6. What this plan deliberately does not do

- **No marketing landing page.** The second CV is a CV, not a `/hire-me`. The dev section plus the CTO CV is the whole funnel, deliberately.
- **No rates on the site.** Engagement _shapes_ without prices: the published bands are wide ($150–500/hr) and a public number anchors the wrong end. Rates belong in the conversation the referral opens.
- **No "AI transformation" vocabulary.** The site's voice advantage is that it doesn't sound like the vendor copy this research waded through.
- **No retitled history**, in either variant.

### B7. Order of work

1. `en.json` — the `cv.variants.cto` subtree (metadata, header, profile, whatIOffer + engineering system). This is where the thinking happens; everything else follows.
2. `cvMessages(locale, variant)` in `src/pages/cv/lib/`, wired through `cv-metadata.ts` and `cv-page.tsx`; make `whatIOffer` data-driven; add the variant switch beside the locale picker and widen the picker's route guard.
3. Routes: `app/[locale]/cv/[variant]/page.tsx` and its locale-less redirect; `alternates.canonical` in `constructMetadata`, set on the CTO variant's `/cv/cto` form.
4. `ru.json` — same keys, translated in the established RU voice, not transliterated.
5. `section.tsx` → `shared/ui`; extract `pages/writing` and `pages/music` slices with their routes and metadata; sitemap entries.
6. Home: nav removed, intro rewritten, four-card grid with the same-pattern line, Recent Work, footer _See also_ minus "Built with Next.js".
7. `/preview`: home, `/writing`, `/music`, `/{en,ru}/cv`, `/{en,ru}/cv/dev` — both themes, plus the print view of both CV variants, which is a real output here. Exercise the two switches together: locale then variant, and the reverse.
8. Check whether the CV participates in `content:og` / `content:pdf` hashing before assuming the new route needs no render; then vet and `/finalize`.

Squash prefix: **`feat:`** — this changes the built site and should deploy.

## DRY notes

- **The CTO CV is an override subtree, not a second catalogue.** This is the whole reason two CVs are affordable: only the four differing sections exist twice per locale (~40 lines), while experience, tech stack, education and contact exist once. The first draft of this plan argued against dual CVs on exactly this maintenance ground; the merge-over-base design is what answers that objection rather than overriding it. A variant that starts restating shared keys is the signal the design has been abandoned.
- **One place knows the CV's URL shape.** The variant switch, the locale picker's route guard, the sitemap and the redirect all need it, and four hand-spelled copies of `/{locale}/cv/{variant}` is how a fifth one gets it wrong. A `cvRoute(locale, variant)` on the `pages/cv` public API serves all of them — the sitemap included, since the app layer sits above pages and may import it.
- **One resolution point for variant messages.** `cv-metadata.ts` and `cv-page.tsx` both need variant-resolved messages, so `cvMessages(locale, variant)` is the single home; neither caller merges anything itself.
- **`whatIOffer` reuses the `techStack` pattern in the same file** — messages read off `useMessages()` and mapped — rather than a new component. Its label+text items are the shape `cv-bullets.tsx` already renders for experience entries; reuse it rather than adding a sibling.
- **`section.tsx` moving to `shared/ui` is forced by FSD, not by taste.** Three page slices need it and sideways imports are banned. It genuinely belongs there: nothing in it composes a page.
- **`FEATURED_CASE_STUDY` moves to `shared/content`** once home and the CV both link the same document by id. Two consumers is the threshold; before this change there was one.
- **The Playgram numbers appear in both the CTO profile and the shared experience entry.** Deliberate duplication of _values_: the profile carries two or three headline figures in prose, the experience entry the full itemized list. Extracting them would mean interpolating numbers into i18n messages, fighting next-intl's message model for no reader benefit. If a third consumer appears (an OG card carrying the numbers), that is the moment to hoist them.
- **Home's offer line is not shared with the CV's engagement list.** They say related things at different altitudes; unifying them would force the home page into CV register.
- **Locale parity is the invariant most worth checking mechanically**, and the variant subtree raises the stakes — a key present in `en.json`'s override and missing from `ru.json`'s silently falls back to the developer wording. Nothing enforces this today. Out of scope here, but a `node --test` comparing the two catalogues' key sets is exactly the "pure function of its input" case the testing section asks for, and this change is the reason to write it.

## Open questions

**None.** Every fork raised across the two planning rounds is resolved and folded
into the plan above; nothing here waits on an answer.

The rejections worth not rediscovering: a separate `/cto` landing page (B6 — the
CV is the page); two independent CV catalogues (B1 — the override subtree is what
made two variants affordable at all); rates on the site (B6); a `/{locale}/cto`
URL outside the CV tree (reads as a landing page); and the no-cross-link version
of the two variants (B1 — evasive). The `/writing` and `/music` pages keep the
`/{id}` slash-heading style as their `h1`: it is the site's existing visual
signature and costs nothing.
