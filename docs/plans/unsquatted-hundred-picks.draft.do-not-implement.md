> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# unsquatted: a naming runbook, a hundred picks, and a drawn ten

## Goal

unsquatted.com lists 10 names. Grow it to 100 the way the first ten were found,
write that way down as a runbook the operator launches with "запусти ранбук",
and change the list so it shows a random ten with a dice to draw another ten.

The first ten came from a trial run in `vzakharov/life`, branch
`claude/unsquatted-domains-8crv0t`, `docs/remove-before-merging/relay-3.md` §
Decisions and § "Errors and dead ends": a ledger of every name checked with its
verdict, each run going "вширь" on axes not used before (the Clerk's and Майя's
breadth mechanism), random word pairs when runs converge, and the findings that
only compounds are free and that the names a model thinks of first are already
taken — by other models.

## 1. The runbook and its tooling

- **`src/unsquatted/scripts/RUNBOOK.md`** — the procedure, agent-facing:
  1. Re-check every listed pick; one no longer free gets
     `shownUntil: <today + 14 days>` (the operator's hold rule from PR #231
     T02), its file kept.
  2. List the axes already used (ledger `axis` + pick `category`) and choose new
     ones; brainstorm compounds per axis, skipping the first thing that comes to
     mind; roll random word pairs when a run converges.
  3. Check the candidates (`pnpm names check`).
  4. Pick by taste: no axis or category dominates, at most two picks per axis in
     one run; write `sites/unsquatted/public/picks/<domain>.md` with category,
     blurb, `score` placed against the existing scale, `added`.
  5. Record the free names not picked as taste rejections (`pnpm names reject`),
     so no later run re-checks them.
  6. Commit, regenerate the OG card (`pnpm content:og unsquatted`), vet.
- **`src/unsquatted/scripts/names.ts`**
  (`pnpm names <check|reject|recheck|roll>`): `check` reads `axis<TAB>label`
  lines, skips anything already in the ledger or the picks, looks each up in
  `.com` with the page's own `checkDomain`, appends taken names to the ledger
  and prints the free ones; `reject` appends taste rejections; `recheck` prints
  listed picks no longer free; `roll <n>` prints n word pairs from the page's
  dice. Exits non-zero on any failed lookup, so a partial run is never mistaken
  for a complete one.
- **`src/unsquatted/scripts/ledger.jsonl`** — seeded with the life trial's 111
  rejected names (93 taken, 18 taste). Picked names are not in it: the pick
  files are their record.

## 2. Ninety names

Run the runbook until `sites/unsquatted/public/picks/` holds 100 free `.com`
names across many axes, none of them the life trial's axes' near-duplicates.
Every pick checked free at commit time.

## 3. The drawn ten

- `PICKS` carries `score`; the page hands every shown pick to a client
  `PickDeck`, which draws ten at random and lists them by score, best first.
- The draw lives in a module store read through `useSyncExternalStore`, the
  server snapshot empty: the static HTML holds no picks, and the ten appear on
  hydration — no reshuffle flash, and only the ten drawn rows look themselves up
  (not 100).
- A dice beside the "Up for grabs" heading draws another ten, from names not on
  screen while at least ten remain. No pagination.
- `draw(picks, count, random)` is a pure function with a test.
- The OG card is unchanged in shape (four best lasting picks, "+ N more &
  counting"), re-rendered for the new count.

## DRY notes

- **Lookups:** the script reuses `checkDomain` from the verdict sub-slice
  through a new `index.node-safe.ts` barrel rather than porting the life trial's
  `check.py`, so the routine and the page judge a name the same way.
- **The dice:** the heading's button reuses `DiceIcon` and the checker's
  `TOOL_BUTTON` look; the word-pair roll for the routine is `rollName`, which
  the runbook calls through the script rather than a second word source.
- **Pick domains:** the model exports every pick file's domain (shown or not)
  for the script, so the picks directory's path and filename rule stay in
  `picks.ts` alone.
- **Not shared:** the ledger and the pick files stay two stores on purpose — a
  pick is a page row with copy, a rejection is a line; folding picks into the
  ledger would duplicate what the files hold.
