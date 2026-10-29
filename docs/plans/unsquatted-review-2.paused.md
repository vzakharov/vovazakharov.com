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
- **Prefix hacks by dictionary** (operator, in chat) — dbbb4a7: a leading zone
  splits only where it is a word and the rest runs words together
  (`splitsIntoWords`); the dictionary is `wordlist-english` sizes 10–35 (~38k
  words, ~110 KB gz), lazy-loaded by `lib/use-words.ts` on the first typed name.
  faker's lists were tried first and are too thin (no `bible`, `page`, `love`).
  `MIN_LEADING_ZONE` gone.
- **T10** — d5f9494: `NotedSpan` lifted to `src/shell/shared/ui/`, unsquatted's
  asides use it, `hint.tsx` and Tooltip gone; staged masd.md updated.

- **Steiger** — 18a83fd: `rss` + `feed-html` (and tests) are kernel's
  `shared/feed` segment with an `index.ts`; `shared/lib` is at 14. Staged
  masd.md lists `feed`.
- **T04, first cut** — 4436be5: mark beside the wordmark at cap height; card and
  `tagline` read "Good domain names nobody has grabbed yet. Curated and blazing
  fast." The operator found it still "куце" and asked for variants.

## Left

1. **T04 choice** — four variants in
   `docs/remove-before-merging/unsquatted-site/og-variants/` (A centred, B with
   a picks panel, C dark green, D the checker), shown to the operator; waiting
   on their pick. Copy the chosen SVG over `sites/unsquatted/public/card.svg`,
   `pnpm content:og unsquatted`, look at the PNG, commit; delete the variants
   directory in the same commit.
2. Re-check `pnpm check:mantine-styles` after a build of `vova` and `unsquatted`
   (Tooltip sheet dropped; Popover now renders on unsquatted). Not finished in
   the pausing session.
3. **T07 lint rule** — asked the operator: no rule against bare `new Error(`
   exists (only `no-uncaused-rethrow`); 184 uses in 95 files. (a, recommended)
   rule on repo-wide, old files under one scoped `off` naming a tracking issue;
   (b) migrate all in this PR. Waiting on the answer; build nothing for it yet.
4. **T03** — reply only: Maya passes her foreground as `accent`, which is what
   primary was before (monochrome foreground); radius falls back to shell's 0;
   she passes no fonts — a no-op. Her `site.scss` changed only because the token
   mixin gained a required argument.
5. **Replies on GitHub** to all 11 threads (CLAUDE.md § "GitHub comments", in
   Russian, bare SHAs), none resolved.
6. **Squash proposal**: `docs/remove-before-merging/unsquatted-site/` says
   `pages/home/model/picks.json` — now `public/picks/`; `/squash-message`
   re-syncs it.
7. `/polish`, then `/pr`.
