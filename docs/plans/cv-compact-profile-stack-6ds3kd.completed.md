# CV: one compact intro card, a profile page behind it, and a dry stack

Taken whole — one session, one PR.

## What changes for the reader

1. **Profile + What I Offer become one horizontal card** at the top of the CV (both framings, both languages, screen and print):
   - **left column** — a two-to-three-sentence summary (new copy, distilled from the current profile; the `cto` one keeps the headline numbers in bold);
   - **right column** — the offer as a short label list: the framing's head offer block, the same list the social card already shows (`cto`: the five engagement labels; `dev`: the three core capabilities);
   - **a footer row** — "Full profile and offer →" to the new page, plus, on `cto`, the case-study link that today sits at the bottom of What I Offer.
   - Below `sm` the two columns stack. In print the link prints as its address, so the PDF still leads somewhere.
2. **A new page per framing and language holds the long text**: `/cv/<variant>/<locale>/profile` — today's Profile paragraphs and every What I Offer block, verbatim, under the CV's header, with a link back to the sheet. Same shell and styles as the CV; no PDF of its own.
3. **Tech Stack goes dry and fuller**: no more "– if you want to stay on the safe side…" commentary, just groups of proper nouns, one line each, laid out as a label/value grid in one card. Proposed groups, sourced from the Playgram app (`playgramai/playgramapp` `package.json`, README § "External Services", CI workflows) and `vzakharov/muthur`:

   | Group | Items |
   | --- | --- |
   | Languages | TypeScript, Python, SQL |
   | Frontend | Next.js (App Router), React, Mantine, TanStack Query, Zustand, Tiptap; Vue / Nuxt |
   | Backend & data | Next.js server actions / BFF, NestJS, Django, FastAPI; PostgreSQL (Supabase), Drizzle ORM, Weaviate |
   | AI | Vercel AI SDK, OpenAI / Anthropic / Gemini APIs, LiteLLM, Deepgram, Replicate; Gradio, Google Colab |
   | Infrastructure | Railway, Docker, Cloudflare Workers, GitHub Actions, GitHub Pages, Bunny CDN, Stripe, PostHog |
   | Quality | Vitest, Playwright, MSW, ESLint (custom rules), Steiger (FSD), knip, Prettier, Stylelint |
   | Agentic engineering | Claude Code (skills, hooks, path-scoped rules), muthur — my open-source agent infrastructure, synced across projects |

   The Playgram experience entry's stack line (`TECH_STACKS.playgram`, also on the home card) gains the parts it is missing: `Next.js 16, Supabase + Drizzle, Weaviate, LiteLLM, Railway, feature-sliced design`.

## Steps

1. **Routing.** Extend `CV_ADDRESS_SEGMENTS` (`src/pages/cv/lib/cv-urls.ts`) with a third position, `CV_PAGES = ['profile']`, so `cvPath('cto', 'en', 'profile')` is a valid `CvAddress` and the existing catch-all parses it. `cvSegmentParams` adds `[variant, locale, 'profile']` for every pair — the full address only, no short aliases. `cvAddressDefaults` returns the page too; `apps/vova/app/cv/[[...variantAndLocale]]/page.tsx` renders `CvProfilePage` or `CvPage` off it, and `generateCvMetadata` titles the profile page "Profile — CV" with the framing's card. Sitemap (`src/app/lib/sitemap.ts`) lists the new addresses.
2. **Copy.** In `en.json` and `ru.json`: add `cv.profile.summary` (base = `dev`) and `cv.variants.cto.profile.summary`, plus `cv.profile.more` ("Full profile and offer") and a `cv.profile.back` label for the new page. `techStack` becomes `{ title, groups: { <key>: { title } } }` — titles only; items move to code (step 4).
3. **Card.** New `src/pages/cv/ui/cv-intro-card.tsx`: one `Card`, a two-column `SimpleGrid` (`base: 1, sm: 2`) with summary left and offer labels right, footer links. `cv-sheet.tsx` swaps its Profile and What I Offer sections for it.
4. **Stack.** `src/pages/cv/lib/cv-stack.ts` holds `TECH_STACK_GROUPS` as a `const` record of group key → items (locale-independent proper nouns, the same reasoning `TECH_STACKS` gives), keyed so the messages' group titles are checked against it. A `CvStackCard` renders the grid; `cv-sheet.tsx` uses it. The `– text` items and the `CvBullets` call for them go.
5. **Profile page.** New `src/pages/cv/ui/cv-profile-page.tsx` (+ sheet if it splits naturally): header, the moved Profile and What I Offer sections exactly as `cv-sheet.tsx` renders them today, back link. Exported from `src/pages/cv/index.ts`.
6. **Check** with `/preview` in both themes, both framings, and the print stylesheet; `pnpm content:pdf:vova` to confirm the sheet's print shrinks and the profile page is not picked up; vet.

## DRY notes

- **The offer list on the card is the social card's list.** `scripts/lib/cv-card.ts` already picks `OFFER_BLOCKS[variant][0]` and maps items to labels; that becomes `offerHeadline(messages, variant)` in `src/pages/cv/lib/cv-offer.ts`, used by both the script and the intro card, so the card on the page and the card on social cannot drift.
- **The home page's engagement list** keeps reading `cv.whatIOffer.blocks.engagements.items` — the keys stay, so nothing changes there.
- **Profile page reuses** `CvSection`, `CvSubsection`, `CvOfferBlock`, `CaseStudyLink`, `cvMessages` and `cv.module.scss` unchanged; the sections move out of `cv-sheet.tsx` into it rather than being copied.
- **Header duplication.** Both pages show name + tagline. If the profile page wants the same block, extract `CvHeader` from `cv-sheet.tsx`; if it only wants the name as a back link, inline it — decided while building, by what the page actually renders.
- **Stack items not in messages**: duplicated across `en`/`ru` they could only disagree; `TECH_STACKS` already sets that precedent.

## Out of scope, worth a line in the report

- The home page's "agent-project-boilerplate" card links to a repo that now redirects to `vzakharov/muthur`; renaming that card is a separate one-liner.
