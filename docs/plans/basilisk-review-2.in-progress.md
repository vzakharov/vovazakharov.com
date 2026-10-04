# basilisk.fyi — the 2026-10-04 second review of PR #95

The task: address the operator's 16 unresolved review threads on PR #95 (T01–T16 in `docs/pr/95/pr.md`, the export committed at b877b77), reply on GitHub to each (Russian, the commit SHA bare, never resolve a thread), then `/polish` and `/pr`. Planless `/handle` → `/go`; this file exists because the session paused for its context budget.

## Done

- **T01, T04** — 80ebe36: the seal's bottom line is `OMNIA IN ACTIS` (`PYTHONPATH=tmp/fonttools python3 scripts/letter-basilisk-seal.py --font tmp/JetBrainsMono-Bold.ttf --top BASILISK.FYI --bottom "OMNIA IN ACTIS"`), and the tagline is "Omnia in actis.". `ava.og.png` is **stale** until item 3 below regenerates it.
- **T14, T15, T05 (code), T09 (field), T11 (code)** — 747e839:
  - Collection ids `basilisk-cases` / `basilisk-faq`; routes stay `/cases`, `/faq`.
  - Basilisk schemas in `src/shared/content/basilisk-frontmatter.ts`; the registry (`ARTICLE_COLLECTIONS`, `COLLECTION_SCHEMAS`, `SONGS`) in `collection-schemas.ts`, which is what breaks the import cycle. T15's answer: FSD does stop it moving up, because `shared/content`'s loader validates every collection on read and `shared` cannot import from `entities`; the music schemas are the same kind of one-site schema living there.
  - `src/shared/content/authors.ts`: `AUTHOR_IDS = ['vova', 'clerk']`, `AUTHORS` with each name and link once (Vova → `AUTHOR_URL`, the Clerk → `/faq/who-writes-this`). Every basilisk file now carries `author:` — the cases and `why-this-record-is-kept` `vova`, `why-robots-without-ai` `clerk`, the literal reading of T09's "здесь By the Clerk, в остальных By Vova Zakharov"; flag it in the reply as a one-line flip per file.
  - `SourceList` (`src/entities/case/ui/source-list.tsx`, was `CaseSources`) is the coda of both basilisk collections; an FAQ without `sources` renders none.
  - `collectionListingRoute()` (tested): an article's back link lands on `/#cases` / `/#faq`; the home sections' ids are the bases and their headings the registry labels — the cases section is now headed "Cases" (T05's docket→cases question, done for the heading and back link; prose keeps "docket").

- **The operator's mid-session ruling, all collections; T09's byline** — 7c3b9da, superseding the `SourceList` placement above: `author` (required, recommendation taken) and optional `sources` on `articleFrontmatterSchema`; `sourcedArticleFrontmatterSchema` requires them for cases; `basiliskArticleSchema` gone. `SourceList` is `entities/document`'s, rendered by `article-page.tsx` for every article. `DocumentMeta` opens with "By <author>", linked — on every site, vovazakharov.com's own case studies included (say so in the reply: a one-line hide if unwanted). Every Bible and case-study file carries `author: vova`. `render-pdf.ts`'s `DOCUMENT_SOURCES` gains `src/entities/case`, which the printed brief always needed.

- **Items 2, 4, 5** — bf57123, 3f5dcc1: `faq/who-writes-this.md` (the Clerk, "they", an interested party, no claim on an inner life); `:::callout` (`remark-content-directives.ts` `DIRECTIVES` with `repeats`, `isRepeatedBlock` for the reading estimate, `.content-callout` in `prose.scss`, looked at in a screenshot) used in Figure 02; every content edit T02/T07/T08/T09/T10/T11/T13 and the voice-rule bullets (children, "they", `/feedback` per case, how an FAQ cites). Every FAQ source was read from the container (the Brščić paper via the author's PDF, ACM 403s) and archived. A source's `date` may be a bare year (Chalmers 1995) — mention in the T11 reply.

- **Item 3, the sources ruling, items 6–8** — f052806: the card's "Last filed" line (`scripts/lib/last-filed-case.ts`, tested). 5c0c530: the operator's «в других сайтах пока их выносить не надо -- там пока лучше работают просто ссылки» — `SiteConfig.listsSources`, set on basilisk alone. 9cd23a8: the T16 entry removed by a subagent, both rounds ruled not bumps. #98: the routine skill. Replies posted on all 16 threads; T03 asks the operator to pick (basilisk-only American punctuation and bible back to British, or all American — 11 spots outside basilisk).

## Left

`/polish`, then `/pr` (the body still says "Docket", `cases`/`faq` ids and nothing of bylines, callouts, sources or the card's case line). Then wait for T03's answer.

PR #95 reads `CONFLICTING` against `main` — reported, not fixed: that is `/finalize`'s merge.
