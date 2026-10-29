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

- **mantine-styles** — re-checked after building `vova` and `unsquatted`: 35
  classes across 2 sites, all styled.
- **T07 lint rule** — the operator moved it to its own session
  (session_01DaohkEqmhWKawGUCbW9brg), on a branch stacked on this one; #231
  carries no rule.
- **Replies** on T01–T03 and T05–T11 posted; T04's waits on the card choice.
- **Expiry hint** (operator, in chat: «при наведении на taken показывать hint с
  точной датой истечения») — b117b6f: the verdict keeps RDAP's `expiration`, and
  "taken" opens a `NotedSpan` with the date in UTC.

- **Hacks second** — 1909bd1: `rowsFor` puts a split name right after `.com`.
- **Card wordmark in Fraunces** (operator: «на карточке шрифт по-прежнему не тот
  что в заголовке сайта») — 78c8673: staged from `@fontsource-variable/fraunces`
  (opsz file), as basilisk stages its mono.
- **T04's reply** posted (discussion_r4411061406).
- **Lede** (operator: «давай Curated, blazing-fast, at regular prices.», since
  the card read like a reseller such as brandbucket) — 767719a: new catalogue
  key `ledeEnd`; page, card and tagline carry it.

- **Picks by score** (operator: «нужно по "крутости" … float чтобы всегда можно
  было "между" засунуть») — a required float `score` in each pick's frontmatter,
  highest first, then newest, then by domain; seeded 9.0 down to 4.5 in the
  original hand-made order. Pick files now prettier-clean (896aa56).
- **Footnote instead of the price clause** (operator: «at regular prices вышло
  на новую строчку … звёздочку сверху после grabbed, и куда-то сноску "\* no,
  not even us"»; then «4 домена вместо 5 для воздуха», the note under the
  subline and lighter) — caed8f1: `ledeEnd` gone, `ledeNote` added; tagline
  drops the clause.
- **Hydration** — ccf776d/caed8f1: the lede is divs, since a `NotedSpan`'s note
  is a `<div>`.

- **Maybe hint** (operator: «на grab-ish давай хинт: "Мы точно не знаем но
  блаблабла"», on hover only; notes «темноватее чем основной paper») — 0f4b8e1:
  `maybeWhy`, `NotedSpan`'s `hoverOnly`, `--noted-span-background`.
- **Footnote on the card only** («тут сноска не нужна, она только для OG») —
  f9a8ff4: the page strips the `*` and drops `ledeNote`.
- **"maybe →"** («замени grab-ish на maybe») — c3c3e98.
- **Coffee line on its own line** («If после разрыва строки») — 83b14ee.
- Preview republished from the head (b8efb02).
- **Dice** («кубик не работает … надо бы ему тоже лоадер») — 8e3f0c1: faker's
  English entry alone (the root bundles every locale), a loader on the button.
- **Shout-out** — f25cbd5, 8556fd8, 2bf6bf9: post text «Check out {url}: [insert
  why you love it, or keep the placeholder for the lulz]», prompt «Got hooked on
  rolling the dice?».
- **Header spacing** («все строки с одинаковым пропуском») — 2bf6bf9: no gap
  between lede and pledge, line height 1.65 (picked over 1.55/1.75/1.85).
- **/five-percent's two proposals** taken («пятипроцентные — да, бери»): 757c8d5
  (`LASTING_PICKS` for the card), f8b4675 (page metadata from the lede); replies
  posted on both threads.

## Third round (export at 6e07f87, eight threads, all replied)

- **T03** — cc06528d: `vova/error-class-name`, `errorClass`'s argument equals
  its constant, autofixed.
- **T04** — e5072f1b: `asError` + `NonErrorThrown` in kernel's `error-class.ts`,
  six catch sites in kernel, blog, mushrooms, unsquatted. Touches
  `kernel/shared`, so vet at `/finalize` runs with `VET_MEADOW=1`.
- **T05** — 30c812aa: byline lower case; meta description capitalizes it.
- **T06** — 7780ea52: `ZONES` drops `si`, `de` for `sh`, `gg`. Asked which of
  `.to .tv .cc .page .fyi .link` to add.
- **T07** — 8033ec76: `price.ts` (type + `priceParts`) apart from `prices.ts`;
  `lookup.ts` on `zod/mini`; page scripts 313 → 242 KB gz. Asked whether the
  poison-check extension (no classic zod / build-time packages from client
  roots) goes here, on its own branch, or to an issue.
- **T08** — issue #235. **T09, T10** — answered, no change.

## Left

1. `/five-percent` over c7a7fc34..HEAD: the polish run's pass ran out of
   budget and posted nothing.
2. The two answers above, if they come.
3. `/finalize`.

Settled by the operator: the card shows the four top-scored picks («4 лучших»),
its heading 24px above the list («24 кажется норм»); no price on the card («не
надо»); `maybe` reads `grab-ish →` («grab-ish»); `share-card.mock.svg` stays for
a later "share" button that draws the card in the browser («пока сохранить для
будущего пользования … тут этого не делаем»). `/polish` ran (4dd0130, c7a7fc3),
`/five-percent` posted.

The squash proposal is re-synced (7617eb6). The title keeps `feat(unsquatted):`:
the shell, kernel and music changes leave the other sites looking as they did
(the operator: «если только рефактор, то в рамках music это именно refactor и
развёртывания не требует»).

**Card** — done in 06648be per the operator's call: B, generated by
`src/unsquatted/scripts/lib/unsquatted-card.ts` (`public/card.svg` gone, the
avatar carries no vector), five newest picks, a "Your name…" field,
`+ X more & counting`; `free` and `register` read `grab →`.
