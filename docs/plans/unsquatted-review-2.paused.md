# PR #231, second review round (11 threads)

The task: work every thread `docs/pr/231/pr.md` lists under "Awaiting an answer"
(the export committed in "docs: #231 refresh the PR export"), reply on GitHub to
each, then `/polish` and `/pr`. No thread is resolved by us.

## Done

- **T02 (also: part)** — #229's `/five-percent` procedure brought over, and its
  comments pinned to the session's language (8d26ea7).
- **T01, T05, T06 (first cut), T07 (wrapper), T09, T11** — 104d75a:
  - T01: a pick's Register link shows its zone's Porkbun price (`PriceHint`,
    exported from `verdict-label.tsx`); "~$11" gone from copy.
  - T05: dice rolls `['adjective', 'noun'].map(…)`.
  - T06: `fetchPrices` reads Porkbun's whole list, cut to IANA root zones
    spelled in letters (539 zones); `domainHacks(label, sold)` splits on any
    sold zone at the end, and at the start for zones of 3+ letters; at most 3
    hacks; a typed sold zone is checkable.
  - T07: `kernel/shared/lib/fetch-ok.ts` (`fetchOk(url, ErrorClass, init)`) and
    `error-class.ts` (`errorClass(name)`); used in unsquatted's fetchers and
    music's `fetching-deck.ts`.
  - T09: `kernel/shared/lib/use-provided.ts`; `useChecker` and `usePlayer` read
    through it.
  - T11: every verdict word in `en.json` (`verdict`, `release`, `units`,
    `neighbour`, `price`); `freesIn` returns a `Release` (count + unit).
- **T08, T02 (hold rule)** — 4dde509: picks are
  `sites/unsquatted/public/picks/<domain>.md` (category, blurb, added, optional
  `shownUntil`); past `shownUntil` a pick leaves the list but its file stays.
- Preview of unsquatted published from 4dde509 (operator's ask).

## Left

1. **Prefix hacks by dictionary** (operator, in chat): a hack with the zone at
   the start only when the zone is a dictionary word and the rest splits into
   dictionary words — `biblelovers` → `lovers.bible`, never `bibleical` →
   `ical.bible`. Replaces `MIN_LEADING_ZONE`. The dictionary must reach the
   browser (hacks are computed as you type): recommended, a common-English word
   list lazy-loaded on first need, as faker is for the dice — a new dependency,
   so the toolchain-wiring rule applies if it is a package. Suffix hacks
   unchanged.
2. **T10** — lift music's `NotedSpan` (`src/music/shared/ui/noted-span.tsx`
   - its scss) to `src/shell/shared/ui/`, use it for unsquatted's two hints,
     delete `hint.tsx` and its `.hint`/`.hintAside` styles, drop `Tooltip` from
     `theme-provider.tsx` and `INTERACTION_SHEETS` in
     `src/shell/scripts/check-mantine-styles.ts`.
3. **T04** — `sites/unsquatted/public/card.svg`: the mark sits alone above the
   wordmark and looks off; set it beside the wordmark at cap height. Copy
   follows the hero: "Good domain names nobody has grabbed yet." / "Curated and
   blazing fast." Same for `tagline` in
   `src/kernel/shared/config/site-config.ts` (drop "$10"). Re-render with
   `pnpm content:og unsquatted`, look at the PNG.
4. **T07 lint rule** — a rule banning bare `new Error(`: 185 in 97 files today.
   Ask the operator: grandfather with a scoped `off` + tracking issue
   (recommended), or migrate everything in this PR.
5. **T03** — reply only: Maya passes her foreground as `accent`, which is what
   primary was before (monochrome foreground); radius falls back to shell's 0;
   she passes no fonts — a no-op. Her `site.scss` changed only because the token
   mixin gained a required argument.
6. **Replies on GitHub** to all 11 threads (CLAUDE.md § "GitHub comments", in
   Russian, bare SHAs), none resolved.
7. **Squash proposal**: `docs/remove-before-merging/unsquatted-site/` says
   `pages/home/model/picks.json` — now `public/picks/`; `/squash-message`
   re-syncs it.
8. `/polish`, then `/pr`.
