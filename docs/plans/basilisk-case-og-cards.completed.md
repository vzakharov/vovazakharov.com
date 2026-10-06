# basilisk.fyi: a social card per case, drawn from its frontmatter

## Goal

A case page on basilisk.fyi (`/cases/<slug>`) unfurls as a card of its own: the case's file — number, title, and a trimmed set of its frontmatter fields — instead of the site card every page shares today (`ava.og.png`: the seal, the home memo, the last case filed). `og:title` and `og:description` are already per-article; the image is what is site-wide.

FAQ pages keep the site card: their frontmatter is a description, an author and a date, which `og:description` already carries, so a card of it would be the title in a box.

## What the card shows

The same layout as the site card — lettered seal on the left, a memo grid beside it, a ruled section with the title under it — so a case unfurls as the same docket the home card belongs to. The memo is the case's, trimmed from the page's `CaseBrief`:

| Field                              | On the card                                          | Why                                                       |
| ---------------------------------- | ---------------------------------------------------- | --------------------------------------------------------- |
| Case                               | yes, in the kicker above the title (`Case BAS-0001`) | the identifier                                            |
| Subject                            | yes                                                  | who did it                                                |
| Object                             | yes                                                  | what it was done to                                       |
| Date                               | yes                                                  | the incident's                                            |
| Place                              | yes, when stated                                     | short, and orients the reader                             |
| Grade                              | yes, as the stamp (`HARM · INDIVIDUAL`)              | the docket's verdict                                      |
| Filed                              | no                                                   | bookkeeping; moves on every unmerged case each filing run |
| Aggravating                        | no                                                   | noise at card size; the page argues it                    |
| sources, author, noAi, description | no                                                   | the page's, or already in `og:description`                |

Values wrap (a subject is a phrase, not a memo line) and clamp at two lines; the title clamps at three, as on the site card.

## Steps

1. **Read case files through the real schema.** `render-og.ts` runs under `tsx --conditions=react-server` (all three `content:og:<site>` entries), which resolves `server-only` to its empty module — the condition saying what a build script is. The basilisk cards then read a case with `gray-matter` + `caseFrontmatterSchema` imported from `@/shared/content/basilisk-frontmatter` directly (never the barrel). Spiked in `tmp/`: parses `hitchbot.md` cleanly.
2. **One case reader for both cards.** `scripts/lib/last-filed-case.ts` becomes `scripts/lib/docket.ts`: `readDocket()` returns every case as `{ slug, frontmatter, title }` (title off the body's `# ` line), and `lastFiledCase()` picks the highest number from that list rather than regex-parsing frontmatter. Its test moves with it.
3. **One card template, two field sets.** `scripts/lib/basilisk-card.ts`'s `cardPage` takes the memo rows and the section (kicker + title) as arguments; the site card passes `MEMO` and the last case, `caseCard(docketEntry)` passes the trimmed rows above. A memo row may wrap — the site card's rows keep `nowrap`, the case card's clamp at two.
4. **Render them.** `render-og.ts` adds one card per case on the basilisk run, written to `public/cases/<slug>.og.png` — the document's route plus an extension, the rule every other file of a document follows — with its manifest `public/cases/og-renders.json`. `CONTENT_DIRS` already covers that directory, so pruning a deleted case's card needs nothing new.
5. **Advertise them.** The collection registry gains a `generatedCards: boolean` per collection (true for `basilisk-cases` only); `documents.ts` resolves a document with no `ogImage` in such a collection to `<route>.og.png`, through the same `resolveImage` path — so a missing card fails the build as any broken image reference does, and `vet.sh`'s `content:og:basilisk --check` flags a stale one.
6. **Render, look, commit.** `pnpm content:og:basilisk`, screenshot-check every card (long subjects: `waymo-tire-slashings`, `the-pain-direction`), commit the PNGs and manifest.
7. **Docs that state the convention.** `.claude/rules/content.md` (the card bullets, and the paragraph saying the render scripts never reach `shared/content` — now: only through `--conditions=react-server`, never the barrel); `.claude/skills/file-basilisk-case/SKILL.md` Step 3–4 (the run renders the new case's card too, and commits every card and manifest it touched).

## DRY notes

- **Shared:** the card template (step 3) — one layout, two callers; the case reader (step 2) — one parse for the site card's "last filed" and every case card; the schema — `caseFrontmatterSchema` itself, not a hand-written subset or field regexes; `resolveImage` / `intrinsicDimensions` for the URL and size.
- **Duplicated, on purpose:** the trimmed field list mirrors `CaseBrief`'s rows (labels, `grade` stamp formatting). `CaseBrief` is a React component under `entities/case` and returns JSX values (`<time>`, `<GradeStamp>`); extracting a JSX-free row list both could share would mean a `shared`-level formatter for a two-caller seam whose second caller deliberately drops two of the eight rows. The stamp's `value.replaceAll('-', ' ').toUpperCase()` is one line; if it is exported from a node-safe spot without dragging the SCSS module along, the card imports it instead — decided when step 3 is written.
- **Not extracted:** a generic "generated card per document" hook for every collection — one collection wants it; `generatedCards` is the registry flag, the card kind stays basilisk's.

## Out of scope

- FAQ cards (above), and any change to `og:title` / `og:description`.
- Localized cards: the collection is English-only.
