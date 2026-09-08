> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# Repositioning: from "developer" to hands-on CTO for agent-run engineering

## Part A — Is there demand? (research, no code)

**Short answer: yes, but not for the word "CTO" on its own.** The market pays for
a bundle — production evidence of running non-deterministic systems under
governance — and "CTO" is one of several frames that bundle is sold under. The
frame that matches this evidence is *fractional/hands-on technical leadership for
a company whose delivery capacity is agents rather than headcount*.

### What the data supports

| Signal                                                                                                                                                            | Source                                                                                                                     | Read                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Fractional hiring demand +149% YoY (Q1 25 → Q1 26); 5× monthly postings since early 2024; engineering = 17% of roles; avg engineering rate **$229/hr**            | [Fractional Work Report 2026](https://www.fractionaljobs.io/the-fractional-work-report)                                    | The *engagement shape* exists and is priced well above dev contracting.     |
| **24%** of clients explicitly request AI-native skills; **38%** say AI expertise helped win work; 36% of buyers are early-stage VC-backed                          | same                                                                                                                       | The buyer described in the prompt ("founder with an idea") is the modal one. |
| **94%** won clients via network referral; **72%** got their first client through a personal contact                                                                | same                                                                                                                       | **The site is not the acquisition channel.** It converts, it doesn't hunt.   |
| Fractional CTO bands: $4–10k/mo advisory (10–15 h), $10–25k/mo active (20–40 h), $20–40k interim; hourly $150–500                                                  | [A.Team](https://www.a.team/talent/guides/fractional-cto-rates), [kompella.io](https://kompella.io/thinking/why-fractional-cto-2026) | Pricing to aim at; the top band is explicitly "direct production AI experience". |
| "The fractional CTO conversation and the AI agent conversation have merged into one"; a 2026 fractional CTO is expected to *own* AI strategy, not comment on it    | [TNW](https://thenextweb.com/news/fractional-cto-ai-reshapes-business), [jetrockets](https://jetrockets.com/blog/fractional-cto-and-ai-agents-the-2026-startup-leadership-model) | The two things Vova has are the two things this role now bundles.            |
| Agentic-AI engineering is a seller's market at $185–320k base; the title is ~2 years old and few have shipped an agent that survives production                    | [KORE1 survey](https://www.kore1.com/agentic-ai-hiring-2026/)                                                              | Scarcity is in *shipped-and-survived*, which is exactly what the case study documents. |
| Only **21%** of enterprises have mature agentic governance; **74%** expect meaningful agent use by 2027 (Deloitte, via KORE1)                                      | same                                                                                                                       | The sellable artifact is guardrails, not enthusiasm.                        |
| AI platform leader specs ask for: orchestration layer owning retries/validation/sequencing, eval harnesses for non-deterministic output, audit trails, minimum-privilege tool access, golden-path templates, cost attribution | [Augment Code 2026 job spec](https://www.augmentcode.com/guides/ai-platform-engineering-leader-job-spec)                    | Vova's dev-side analogues map 1:1 — see the translation table below.        |

### Counter-evidence, held honestly

- **Most of the pro-fractional-CTO literature is content marketing by the platforms that place fractional CTOs.** The primary-ish numbers (the Fractional Jobs report, the KORE1 survey, Deloitte's governance figure) are the ones this plan leans on; the "adoption tripled" and "replacing full-time leadership" claims are vendor copy and are discounted.
- **The role is where people are burning out.** Unrealistic AI expectations are the leading cause of CTO/VPE jobs going bad in 2026 — founders expecting an "AI-native" transformation plus 20–50% cost cuts, and what the piece calls founder "AI psychosis" ([Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/the-great-engineering-leader-career-break)). Positioning into this without scoping the engagement buys that problem.
- **A self-declared CTO with no human reports is a credibility risk** in the lane the prompt already excludes (big company, Kafka/Kubernetes). Nothing found suggests it is a risk with the seed-stage founder — but it is the reason this plan claims the title on the **offer**, never retroactively on past **titles**.
- **"Managing a team of dev agents" is not yet a phrase buyers search for.** It is a differentiator inside a conversation, not a keyword to be found by. The searched-for words are *fractional CTO*, *AI-native*, *agent orchestration*, *AI transformation*.

### The two buyers, and why one title can't serve both

1. **Founder with an idea and no technical lead.** Buys judgment plus delivery. "Hands-on CTO" / "technical co-founder for hire" is exactly right, and this is the segment the prompt describes. Modal buyer per the report.
2. **Company that already has engineers and wants them on agent rails.** Already has a CTO; "CTO" reads as a threat or a mismatch. Here the sellable thing is a named, finite engagement — *put the team on agent rails and leave the runbooks behind* — which is what the report says the median AI project now wants.

Both are served by the same evidence and the same person. They are **not** served by the same noun. The plan's resolution: lead with the CTO frame (buyer 1), and make buyer 2's engagement one of the named offers rather than a second identity.

### The translation table (this is the actual asset)

The reason this repositioning is defensible rather than aspirational: the Playgram
work already produced the artifacts the 2026 leadership specs ask for, in dev
form. The CV should say so in these terms.

| What the specs ask for                              | What exists                                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Orchestration layer, not per-agent improvisation    | plan → implement → review → finalize, each stage its own session with a reviewable artifact between them |
| Guardrails on non-deterministic output              | linter-enforced feature-sliced architecture that a crowd of concurrent agents cannot drift               |
| Eval/regression gate before release                 | the vet suite as the single pre-push gate; nine concurrent checks, build as the end-to-end               |
| Audit trail                                         | 1,395 commits on main, 48 releases, 18 hotfixes — a deploy every 2.4 days, all of it reviewable          |
| Platform enablement / golden paths                  | skills as executable procedure: the workflow is checked into the repo, not in someone's head             |
| Delivery at scale                                   | 250,000 lines of production TypeScript in 158 days, none hand-written, up to 20 agents at once           |
| Cost/latency awareness                              | the "economical paradigm" already claimed on the CV, plus sub-second cold loads down from multi-second   |

The gap to name honestly: **no human reports, no enterprise governance/compliance
work, no multi-tenant platform for other engineers.** That is what keeps the claim
to "hands-on CTO for a small company or a founder" rather than "VP AI Engineering
at a Series B".

## Part B — What changes on the site

Guiding constraints:

- **Evidence before title.** Every claim added is one the case study or the repo already backs. The title reframes the evidence; it never substitutes for it.
- **The experience section stays factually titled.** Playgram was "Developer" and remains "Developer". Retitling history is the one move that would make the whole thing read as inflation.
- **Don't lose the hands-on noun.** "Developer" is what makes the CTO claim credible here; the pitch is *hands-on*, and dropping the word costs more than the title gains.
- **The site converts; it does not hunt.** Referral is 94% of how this work is won, so the target reader is someone who already got the name from a person or a post and is now checking whether it holds up. That reader wants proof and an engagement shape, not a funnel.
- **Both locales, always.** `en.json` and `ru.json` move together, key for key.

### B1. CV header and metadata — the frame

- `cv.header.tagline`: from *"Developer – AI, full-stack, and the bits in-between"* to a hands-on-CTO line that keeps the dev noun, e.g. **"Hands-on CTO — engineering where the engineers are agents"** with the dev depth carried by the profile immediately below.
- `cv.metadata.description`: currently *"Full-stack developer with deep AI/ML expertise since 2020…"*. Rewrite to carry the frame plus the searched-for words (*fractional/hands-on CTO, agent orchestration, AI-native delivery*), since this is the text that lands in search results and link previews.
- `cv.metadata.ogSuffix`: keep a line with personality; the current one still fits.
- Drive-by: `en.json` says **since 2020**, `ru.json` says **с 2019 года**. One of them is wrong; fix both to the same year while in the file.

### B2. CV profile — proof in the first paragraph

Today `profile.paragraph1` opens on temperament ("physics-and-math brain") and
`paragraph2` on range. The strongest thing on the page — 158 days, 250k lines, 20
agents, a deploy every 2.4 days — is buried in the experience section. Restructure:

1. **New opening sentence carrying the headline numbers**, so the proof lands before any adjective does.
2. Keep the "don't buy or sell buzzwords / a level or two deeper / intuition for what models can and cannot do" clause — it is the best-differentiated prose on the page and it now reads as leadership rather than temperament.
3. Keep paragraph 2 (systems from scratch, ad giants, startups, open source) as the range claim.
4. Add one sentence naming the boundary honestly (small company / founder-scale, not enterprise platform). It costs nothing with buyer 1 and prevents the wrong conversation with the wrong buyer.

### B3. `whatIOffer` — engagements, not capabilities

The current three bullets read as freelance dev tasks ("bring your idea to an
MVP", "clean the vibe-coded mess", "explain why your agent doesn't work"). They
are good and they stay in substance, but they get regrouped as **named
engagements** with a shape, because that is what the fractional buyer purchases:

| Engagement                       | Substance                                                                                                                              |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Idea → production**            | Existing item 1, retimed to what the case study actually demonstrates rather than the generic "1–2 months".                             |
| **Your team on agent rails**     | New, and the whole point of the repositioning: the architecture-held-by-linters + plan/implement/review/finalize + vet-gate setup, left behind as runbooks and checked-in procedure rather than as advice. Buyer 2's offer, sized as a finite engagement. |
| **Rescue and diagnosis**         | Existing items 2 and 3 merged — the vibe-coded mess and the agent that doesn't do what was expected are one purchase.                   |
| **Standing technical judgment**  | The advisory band: framework and platform selection, build-vs-buy, what the models can't do — the thing the prompt names as newly-grown expertise. |

Then:

- **Rename the `aiExpertise` subsection's neighbour**: add a subsection for the *engineering system* — the linter-held architecture, the staged pipeline, the vet gate, CI/CD and the deploy cadence — because those are precisely the competencies the prompt says grew from dark forest to strength, and nothing on the site currently claims them.
- **Keep `workingStyle` almost verbatim.** "Low-maintenance, treat any job as its own brainchild" survives the reframe intact and is doing real work; the one edit is that "leave unattended" now describes how the *engagement* runs, not how an employee behaves.
- Link the case study from inside `whatIOffer`, not only from the experience entry — the proof should be reachable from the claim.

### B4. Home page dev-section — stop asking for a job

`src/pages/home/ui/dev-section.tsx` currently says *"I'm currently looking for
new challenges, so have a look at my CV if you're looking for new people."* That
is employee framing and it undercuts the CTO frame harder than any tagline fixes
it. Replace with an offer-shaped two-liner: what I run, who it is for, and the
CV/case-study links. Keep the existing voice ("stuff that works, stuff that
doesn't") — the personality is an asset and the home page is deliberately
multi-facet (dev / music / writing).

The hero subtitle (*"Developer, AI tinkerer, word shaker, generative metalhead"*)
**stays**. It is the personal-site voice, not the pitch; the pitch lives in the
dev section and the CV.

### B5. What this plan deliberately does not do

- **No separate `/cto` page.** A second landing page splits the story, needs its own traffic, and duplicates the CV's content. The CV, reframed, is the page.
- **No dual CV tracks** (`/cv` dev vs `/cv` CTO). Two variants means two things to keep in sync in two locales, and the dev depth is the CTO claim's evidence — separating them weakens both.
- **No rates on the site.** Engagement *shapes* without prices: the bands are wide ($150–500/hr) and a public number anchors the wrong end. Rates belong in the conversation the referral opens.
- **No new "AI transformation" vocabulary.** The site's whole voice advantage is that it doesn't sound like the vendor copy this research waded through.

### B6. Order of work

1. `en.json` — metadata, header, profile, `whatIOffer` restructure (this is where the thinking happens; everything else follows).
2. `ru.json` — same keys, translated, not transliterated. The RU voice is already established; match it.
3. `cv-page.tsx` — whatever structural change the `whatIOffer` regroup needs (subsection count changes; the current markup hardcodes three items and three subsections).
4. `dev-section.tsx` — the intro rewrite.
5. Regenerate the CV PDF/OG artifacts if the CV renders into them (`pnpm content:pdf`, `pnpm content:og`) — the case-study renders are hash-gated, so check whether the CV page participates before assuming it doesn't.
6. `/preview` both locales, both themes, and the print view — the CV's print path is a real output here, not a nicety.
7. Vet, then `/finalize`.

Squash prefix: **`feat:`** — this changes the built site and should deploy.

## DRY notes

- **The Playgram numbers now appear in two places** — `cv.profile` (new, as proof) and `cv.experience.playgram.items` (existing, as detail). This is deliberate duplication of *values*, not of code: the profile carries two or three headline figures in prose, the experience entry carries the full itemized list. Extracting them into a shared constant would mean either interpolating numbers into i18n strings (fighting next-intl's message model for no reader benefit) or inventing a metrics module for a static CV. Not worth it at this size — but if a third consumer appears (a `/cto` page, an OG card carrying the numbers), that is the moment to hoist them.
- **The engagement list is not shared with the home page.** Home gets a two-line intro in its own voice; the CV gets the structured list. They say related things at different altitudes, and unifying them would force the home page into CV register.
- **No new component.** The `whatIOffer` regroup reuses `CvSection`/`CvSubsection` and `cv-bullets.tsx` exactly as they are; if the engagement list wants a label+text shape, `cv-bullets.tsx` already renders that pattern for the experience entries — reuse it rather than adding a sibling.
- **The `since 20XX` year is stated once per locale** in `metadata.description` and again in `profile.paragraph1`. The drive-by fix above makes them consistent; it does **not** extract them, because a year in prose is prose.
- **Locale parity is the one invariant worth checking mechanically** — `en.json` and `ru.json` must stay key-identical. Nothing enforces that today. Out of scope for this change, but worth noting as a candidate check for the vet suite (a small `node --test` over the two catalogues would fit "anything whose behavior is a pure function of its input" exactly).

## Open questions

Each carries a recommendation, and the plan above is written with the
recommended option already in force — so silence resolves them.

1. **The title on the CV.** (a) *"Hands-on CTO — engineering where the engineers are agents"* — recommended: claims the frame, keeps the hands-on noun, and the em-dash clause is the differentiator. (b) *"Fractional CTO & AI-native delivery"* — more searchable, more vendor-sounding. (c) Keep "Developer" as the noun and put the CTO claim in the profile only — safest, and probably too safe to change any reader's mind.
2. **Employment framing.** (a) Engagement-shaped offer, while staying open to a full-time CTO/lead role — recommended, since the two audiences read the same page. (b) Engagements only — cleaner pitch, closes the full-time door. (c) Keep the current "looking for new challenges" employee framing — contradicts the whole plan.
3. **Which buyer leads.** (a) Founder-without-a-tech-lead first, team-adoption second — recommended, and it matches where the buyers actually are (36% early-stage VC-backed). (b) Reverse. (c) Give them equal weight — reads as unfocused.
4. **The honest-boundary sentence** ("founder-scale, not enterprise platform"). (a) Include it — recommended: it is the most credible sentence on the page and it filters the conversations that burn people out. (b) Leave it out and let the evidence imply the scale.
5. **The `whatIOffer` engagement count.** (a) Four, as tabled above — recommended. (b) Three, folding "standing technical judgment" into the rescue engagement — shorter, but drops the advisory band, which is the highest-margin and lowest-effort shape in the rate data.
