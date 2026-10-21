# Relay 1 — a seal per basilisk case

## Standing constraints

None stated beyond the repo's own rules.

## The conversation

1. **Operator:** «а давай разнообразим визуальную составляющую и OG-шки василиска -- каждая статья должна идти со своей "круглой печатью", отражающей (нарисованной вручную иконкой) её суть; цвет можно менять при этом (но в большинстве случаев сохраняя одноцветность)

   речь идёт именно про то, что выводится на OG-шках, и что (теперь) будет идти как в списке статей, так и на каждой статье -- завершающий "глаз" остаётся прежним.»

   **Agent:** Routed via `/task` to a plan (22 hand-drawn emblems cost far more than a page of plan). Renamed the branch, ran a style spike in `tmp/` (three seals; found that a dark violet vanishes on the dark theme and that "paper"-coloured fills turn white there), wrote `docs/plans/basilisk-case-seals.draft.do-not-implement.md`, opened draft PR #184 with a squash proposal. Asked four questions, each with a recommendation: (1) band keeps BASILISK.FYI / OMNIA IN ACTIS, not the case number; (2) a closed ink palette checked on both themes; (3) the docket gets a small cut (outer ring + enlarged emblem); (4) the case page sets the seal beside the brief.

2. **Operator:** «да, хорошо. идея: цветами передавать "характер" кейса?

   можешь начинать»

   **Agent:** Took every recommendation, and read the idea as: the ink is derived from the case's grade, not authored. Flipped the plan (go-ahead quoted: «можешь начинать»), built the composer, route, ink map, and the card/row/page/PDF wiring, drafted three emblems, then paused for the context budget.

## Intent

Every basilisk.fyi case shows its own round seal — the site seal with the eye swapped for a hand-drawn emblem of the case's point — on its OG card, its docket row and its page. The eye stays everywhere it is now: the end mark closing every article, the masthead, the favicon, the site card `ava.og.png`, the FAQ pages. One ink per seal in almost every case.

## Decisions

- **Ink = the case's character, from its grade** (the operator's idea): `harm` red `#b3261e` (the site's ink), `contempt` ochre `#a0670a`, `torment` violet `#8445bf`; `respect` blue `#2f62c4`, `care` green `#2e7d32`, `protection` teal `#1f7f86`. A mixed case (act + credit, none exist yet) is the one two-ink seal: rings in the act's ink, emblem in the credit's. Beat: a frontmatter `ink:` field. Each ink is tested at ≥3:1 against both theme backgrounds, read from `src/app/styles/globals.scss`.
- **The seal is composed from the site seal**, whose `#eye` and `#band` groups are now named in `apps/basilisk/public/seal.svg` (and carried into `seal-lettered.svg` by re-running `scripts/letter-basilisk-seal.py`; the letters came out byte-identical). Beat: redrawing rings per case.
- **Cuts**: `lettered` (OG card, case page) and `small` (docket row: band and inner ring dropped, emblem ×1.4).
- **Served by the build**: `apps/basilisk/app/seals/[file]/route.ts` + `generateStaticParams` emits `/seals/<slug>.svg` and `/seals/<slug>.small.svg`; verified in `out/seals/` (44 files). Beat: committed generated files with a `--check`.
- **The composer lives in `entities/case`** (`lib/case-seal.ts`, exported from both barrels), not in `shared/content`: tests run without the `react-server` condition, so a `server-only` module cannot be tested.
- `alt=""` plus `aria-hidden` on the seal images: the title beside them says what the case is (and `aria-hidden` is how the repo's `no-hardcoded-strings` rule exempts a decorative image).

## Errors and dead ends

- The test for `$` in a drawing first failed because the test itself used `String.replace` with `'$& $1'`; the composer was already safe (replacer function).
- Lint rules hit and fixed: `vova/no-inline-object-param-type`, `vova/no-pick-omit` (so `SealedCase = Routed & WithFrontmatter<CaseFrontmatter>`), `unicorn/prefer-string-raw`, `unicorn/better-regex`.

## State

- Branch `claude/basilisk-case-seals-c86c9y`, head a5d5c93, pushed. Draft PR https://github.com/vzakharov/vovazakharov.com/pull/184 with a squash proposal comment (tracked in `docs/remove-before-merging/squash-message.md`).
- Plan: `docs/plans/basilisk-case-seals.paused.md`, whose "Progress at the pause" section says what is done and left and how to rebuild the contact sheet.
- **`pnpm build:basilisk` fails until all 22 cases have an emblem** — 3 exist (`hitchbot`, `philadelphia-delivery-robots`, `torture-chamber`), not yet reviewed on a sheet.
- Estimate: this session 6 h middle developer ("the composer, the static seal route, the card/row/page/PDF wiring and the ink contrast test are routine slots in an existing pipeline") + 2 h senior artist ("a style spike and three first emblems set the stamp idiom the other 19 follow"). Remainder handed on: 10 h senior artist ("19 bespoke emblems that each carry a case's point and still read at 56 px, in the stamp idiom already set, is illustration judgement") + 1 h middle developer ("re-rendering the cards and updating the filing skill and voice rule are routine") + 1 h middle qa ("both themes, two sizes, card and print each want a look").
- Nothing running; no PR subscription.

## Pointers

- `docs/plans/basilisk-case-seals.paused.md` — the plan, with the working list of all 22 emblem ideas and the drawing rules.
- `src/entities/case/lib/case-seal.ts` — composer, inks, `caseSealSvg`, `caseSealSources`.
- `apps/basilisk/public/cases/<slug>.emblem.svg` — the emblems; the three drafts show the house idiom.
- `scripts/lib/basilisk-card.ts`, `scripts/render-pdf.ts` — card and PDF wiring.
- The lettering font, if `seal.svg` ever needs re-lettering: `curl -sS -A "Mozilla/5.0" "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700"` names the TTF; `pip install --target tmp/fonttools fonttools`.
- Predecessor transcript: https://claude.ai/code/session_01KJSmdtvUUiYeUDkUjSryJS

## Next step

Resume the paused plan with `/go`: rebuild the contact sheet in `tmp/`, review the three drafts on it, draw the other 19 emblems from the plan's list, then `pnpm content:og:basilisk` (commit the re-rendered cards and `og-renders.json`), update `.claude/skills/file-basilisk-case/SKILL.md` § "Step 3 — File" and `.claude/rules/basilisk-voice.md`, `/preview` the home and a case page in both themes, `/polish`, and refresh the PR. Send the operator the contact sheet before calling the drawings done.
