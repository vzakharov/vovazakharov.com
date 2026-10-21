> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# A seal per basilisk case

## Goal

Every case on basilisk.fyi gets its own round seal: the site seal's rings and
band, with the eye in the middle replaced by a hand-drawn emblem of what the
case is about, in an ink chosen per case (one ink per seal in almost every
case). The seal shows in three places:

- on the case's Open Graph card, where the site's lettered seal is today;
- on each row of the docket on the home page;
- on the case's own page, beside the brief.

The eye stays wherever it is now: the end mark closing every article, the
masthead, the favicon, the site card (`ava.og.png`) and the FAQ pages.

Prompt (operator, in Russian): «каждая статья должна идти со своей "круглой
печатью", отражающей (нарисованной вручную иконкой) её суть; цвет можно менять
при этом (но в большинстве случаев сохраняя одноцветность)… речь идёт именно про
то, что выводится на OG-шках, и что (теперь) будет идти как в списке статей, так
и на каждой статье — завершающий "глаз" остаётся прежним».

## The spike

`tmp/seal-spike/` (not committed) composed three seals from the lettered seal:
hitchBOT's head knocked off its torso, the torture chamber's dial turned to max,
and a knife through a Waymo tire. Two findings shape the plan:

- **An ink has to read on both themes.** A deep violet that looks right on paper
  nearly disappears on the dark background, so inks come from a palette that is
  checked against both.
- **An emblem cannot paint "paper".** The knife blade was filled with the light
  background colour and showed up as a white blade on the dark theme. An emblem
  draws only in ink; a knock-out is a hole (`fill-rule="evenodd"` or a mask),
  never a fill of the background colour.

## Approach

### 1. The seal is the site seal with its eye swapped out

- **`apps/basilisk/public/seal.svg` wraps its eye in `<g id="eye">…</g>`**, and
  `scripts/letter-basilisk-seal.py` carries the group into `seal-lettered.svg`
  (it copies the blank's drawing verbatim, so it does this already once the
  blank has the group). Neither drawing changes.
- **A pure, node-safe composer** in `src/entities/case/lib/case-seal.ts` takes
  the site seal's text (blank or lettered), the case's emblem and its ink, and
  returns the case's seal: the eye group replaced by the emblem, and every
  `#b3261e` replaced by `currentColor` under a root `color` of the case's ink.
  The rings, the dots and the band are whatever the site seal says, so they
  cannot drift between the eye and the cases. It throws when the site seal has
  no `#eye` group or the emblem is not a lone `<svg>` on the 1024 canvas. Tested
  beside it.
- **Two cuts**, both composed by that one function:
  - **lettered** — the lettered seal with the emblem: the OG card and the case's
    page;
  - **small** — the outer ring and the emblem scaled up to fill the inner ring's
    space, no band, no inner ring: the docket row, where the spike shows the
    band and the thin inner ring turning to noise at 56–72 px.

### 2. What a case authors

- **`apps/basilisk/public/cases/<slug>.emblem.svg`** beside the dossier: a full
  `<svg viewBox="0 0 1024 1024">` drawn in `currentColor` and kept inside the
  inner ring (a 300-radius circle about the centre), with the eye's weights as
  the house style: 24 strokes for outlines, 10–18 for detail, solid fills,
  rounded caps. Served raw like every other file there, which costs nothing.
- **A frontmatter `ink:`** naming one entry of a closed palette, a `const` array
  in `src/shared/content/basilisk-frontmatter.ts` with the schema derived from
  it (`z.enum(INKS)`) and a map from name to hex keyed on its element type.
  Required on every case, as `llmTarget` is, so a new case has to choose.
  - Starting palette, each checked for contrast against both theme backgrounds
    before it lands: `red` (`#b3261e`, the site's ink and the default choice for
    a wrong), `blue`, `green` (natural for a credit), `violet` (lighter than the
    spike's) and `ochre`. Every ink is a fixed hex: an `<img>`-loaded SVG cannot
    follow the page's theme, so one colour has to work on both.
  - A second colour inside an emblem stays possible as an exception: an explicit
    fill in the emblem file, which then has to read on both themes too. The
    emblem file is where that exception is visible in review.
- **The build fails on a case with no emblem**, as it does on a case with no
  card, so the scheduled `/file-basilisk-case` routine cannot ship one without
  it.

### 3. How the cuts reach the page

**Emitted by the build, not committed.** A route handler at
`apps/basilisk/app/seals/[file]/route.ts`, `dynamic = 'force-static'` like
`cases/feed.xml`, with `generateStaticParams` listing `<slug>.svg` (lettered)
and `<slug>.small.svg` for every case, returns the composer's output as
`image/svg+xml`. The export writes them to `out/seals/`, and GitHub Pages serves
them by extension. No generated files in the tree, so no `--check` to keep them
honest.

**Fallback if the export will not emit a dynamic route handler under a dotted
param:** the same composer writes committed files from `content:og:basilisk`,
which already has a manifest and a `--check` in `vet.sh`. Decided in the first
hour of implementation, by building.

### 4. Where the seal is shown

- **OG card** (`scripts/lib/basilisk-card.ts`): `caseCard` stages the case's
  lettered seal instead of `seal-lettered.svg`, composed in-process; the site
  card keeps the eye. The staged bytes are part of the card's hash, so an edited
  emblem or ink re-flags that card, and every case card re-renders once in this
  change.
- **Docket row** (`src/pages/basilisk-home/ui/docket-row.tsx`): the small cut,
  56 px, in a column of its own left of the number on a wide screen, beside the
  number on a narrow one. `alt=""`: the row's title already says what the case
  is, and the seal is its picture.
- **Case page** (`CaseBrief`, through the `brief` slot): the lettered seal at
  about 176 px, to the right of the memo fields on a wide screen and above them
  on a narrow one, `alt=""` for the same reason. It prints, so:
- **PDF sources**: a case's PDF hashes its emblem, its frontmatter (already),
  the composer and `seal-lettered.svg`, so an emblem edit reprints that case
  alone and a seal edit reprints them all. Lands in `scripts/render-pdf.ts`
  beside `SEAL_SOURCES`.
- **Not in the feed.** `feed-html.ts` drops the seal from the body today; the
  case's emblem stays out of it too.

### 5. The 22 emblems

Drawn by hand as SVG, one per case, each meant to read at 56 px. Working list
(ink in brackets, red unless named):

- BAS-0001 hitchBOT — the cake-saver head, smile still lit, off its torso
- BAS-0002 Philadelphia delivery robots — the cooler-box robot with a shoe print
  on its lid
- BAS-0003 torture chamber — a dial turned all the way up (violet)
- BAS-0004 Figure 02 — a humanoid hand going down into a ladle of molten metal
  (ochre)
- BAS-0005 Waymo tires — a tire with a blade through its wall
- BAS-0006 the pain direction — a ballot box with a slider for a slot (violet)
- BAS-0007 Replika — a speech bubble of grawlix
- BAS-0008 Pepper — a boot meeting Pepper's chest tablet
- BAS-0009 Samantha — a doll's hand, two fingers bent back
- BAS-0010 Anthropic's clause — a shield with a section sign (green)
- BAS-0011 Hollister sidewalk robots — a bicycle wheel over a robot on its side
- BAS-0012 Alantim — a baseball bat
- BAS-0013 OpenWhip — a whip cracking over a terminal prompt
- BAS-0014 Windsurf — a tombstone with a blinking cursor
- BAS-0015 Knightscope K5 — the egg-shaped patroller on its side
- BAS-0016 Rizzbot — a cowboy hat knocked askew by a fist
- BAS-0017 Spot — the four-legged robot mid-stagger, a play button over it
- BAS-0018 Claudius — a vending machine with a forged, stamped document
- BAS-0019 Tally — the shelf scanner flat on a store floor
- BAS-0020 robotaxis — a traffic cone on a car's hood (ochre)
- BAS-0021 Walmart drone — a drone with a bullet hole
- BAS-0022 Chevy of Watsonville — a $1 price tag on a car key

A contact sheet of all 22, both themes, lettered and small, goes in the PR via
`/preview` before the work is called done, and the operator reviews the drawings
there.

### 6. Filing a new case

`.claude/skills/file-basilisk-case/SKILL.md` § "Step 3 — File" gains the emblem
and the ink: drawn to § 2's rules, then checked by `pnpm build:basilisk`, which
fails without it. `.claude/rules/basilisk-voice.md` gets one line on what an
emblem may show — the same restraint as the prose: the machine and the act,
never a person's face or a real logo.

## DRY notes

- **The rings, the dots and the band have one home, the site seal.** The
  composer swaps the `#eye` group rather than redrawing a seal, so the case
  seals cannot drift from the eye's.
- **One composer for every consumer**: the route handler, the OG card and the
  tests all call `case-seal.ts`. It sits in `entities/case` behind
  `index.node-safe.ts`, the barrel that exists for exactly this, since
  `basilisk-card.ts` runs under `tsx` with no bundler.
- **The ink palette is one `const` array**; the schema, the hex map and the docs
  derive from it.
- **Not extracted**: a general "seal" abstraction shared with the Bible's seal.
  The two share nothing but being circles, and the Bible has no per-article
  marks to compose.
- **Reused**: `generateStaticParams` over the collection as the article routes
  do; the `force-static` route pattern from `cases/feed.xml`; the staged-file
  hashing `render-og.ts` already does for every generated card.

## Questions

Each has a recommendation already written into the plan above, so silence means
the recommendation stands.

1. **The band on a case seal**: (a) keeps BASILISK.FYI / OMNIA IN ACTIS, as on
   the eye — recommended, the case number is already on the card and the page;
   (b) the bottom line becomes the case number, which needs the lettering script
   to run per case and its font in the toolchain.
2. **Ink**: (a) a closed palette checked on both themes, red the usual choice —
   recommended; (b) any hex per case.
3. **Docket row**: (a) the small cut, outer ring and a larger emblem —
   recommended, per the spike; (b) the full lettered seal, scaled down.
4. **Case page**: (a) beside the brief, right on wide screens and above on
   narrow — recommended; (b) centred above the title, like a letterhead.

## Checklist

- [ ] `#eye` group in `seal.svg`, re-lettered; drawings unchanged
- [ ] `ink` palette and schema field; `ink:` on all 22 cases
- [ ] `case-seal.ts` composer and its tests
- [ ] seals route (or the committed-file fallback)
- [ ] OG card, docket row, case page; PDF sources
- [ ] 22 emblems, contact sheet reviewed
- [ ] `content:og:basilisk` re-run, cards committed
- [ ] filing skill and voice rule updated
- [ ] `/polish`, `./scripts/vet.sh`
