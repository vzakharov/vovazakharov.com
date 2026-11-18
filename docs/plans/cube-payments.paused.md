# Cube: prices in кубики, and a console mint that logs you in

The operator's ask: «давай строить, пока 1- поменьше таблички про покупку, и со
значком "кубики" (надо его придумать) вместо долларов 2- команда в консоли "дать
кубиков", должна при этом показывать и всё что касается логина и пр.»

"Пока" means no backend yet. Everything below runs in the browser: the identity
is real (a key pair whose id is what a server will later know you by), but the
balance and the rooms bought are kept in this browser's storage, so they are as
much a demo as today's per-page purchase. The Worker, the Durable Object and the
data branches from `relay-2.md` § "Decisions" come later.

## 1. The кубики mark

An isometric cube — a hexagon with three inner edges meeting at its centre —
with one pip on its top face, so it reads as both a block and a die (кубик is
both in Russian). It is defined once, as polylines in em units, in
`src/cube/pages/cube/lib/cubes-mark.ts`:

- the sign boards ink it with the same nib as the lettering, in front of the
  number (`board-canvas.ts`'s `ink` already takes polylines);
- the DOM — the offer dialog and the balance badge — draws the same polylines as
  an inline SVG (`ui/cubes-mark.tsx`), stroked in `currentColor`.

Drawn by a procedure, not an image, so `src/cube/CLAUDE.md`'s "Nothing authored"
holds.

## 2. Prices in кубики

- `sale.ts`: `priceOf` returns кубики. One кубик stands for a dollar, so
  `FLOOR_TWO_PRICE` stays 10,000,000 and `LOWEST_PRICE` becomes 5.
- `figures.ts`: `formatPrice` (dollars, shop nines) gives way to `formatCubes`:
  a whole count to three significant figures with thousands separators —
  10,000,000 / 1,250,000 / 156,000 / 19,500 / 2,440 / 305 / 38 / 5. Game
  currency reads as round numbers, not as a price tag. Tests in
  `figures.test.ts` and `sale.test.ts` follow.
- The sign's second line is the mark and the count; the dialog's "Price:" and
  "Bought for" lines likewise.

## 3. Smaller signs

`SIGN` in `sale.ts` goes from 1.5 × 0.75 m to 1 × 0.5 m on floor 1 (the board
texture stays 2:1, so the lettering does not change). Its middle stays 1.5 m up.

## 4. Identity

`src/cube/features/account/` (a new feature slice: the wallet changes state the
page reads):

- **The secret is a 12-word phrase** (BIP-39, 128 bits, `@scure/bip39`). The
  Ed25519 private key is the first 32 bytes of the phrase's BIP-39 seed; **the
  id is the public key**, base64url (`@noble/curves`). Nothing secret leaves the
  browser, and the id is what the server will check signatures against later.
  Randomness comes from `crypto.getRandomValues`: a key is not the world, so
  `src/cube/CLAUDE.md`'s "every random number is rolled" does not reach it.
- **A key file keeps it** (the operator's call after seeing four ways at once:
  «дофига всего, никто это читать не станет»). Making an account downloads
  `cube-key-<id prefix>.txt` holding a note, the login link
  `…/cube#login=<phrase>` and the words. On arrival by the link the page takes
  the phrase from the fragment, strips it with `replaceState` before `startOf`
  reads the fragment as an address (no base64url address contains `=`), and logs
  in. A browser that keeps anything remembers whoever is logged in until Log out
  — no toggle. No QR, per the operator.
- **Logging in without the link**: the dialog, logged out, is "Make a new
  account" and one zone that picks or takes a dropped key file. No id field (the
  id derives from the words) and no paste field (the file's link logs in by
  itself).
- Lost phrase = lost rooms («фича»).

## 5. Wallet and purchases

- `localStorage["cube.wallet.<id>"]` holds the balance and the rooms bought,
  parsed with a zod schema on read (it is untyped data from outside the
  program).
- The Buy button spends the room's price. Short of кубики, or logged out, it is
  disabled and the dialog says how to get some. The demo line changes to say
  кубики are free for now and kept only in this browser.
- `holdingsRef` in `cube-canvas.tsx` is loaded from the wallet on login and
  cleared on logout.
- **A balance badge** (mark + count) sits in the top-right corner while logged
  in, under the frame-rate meter; clicking it opens the account dialog.

## 6. The console

The page's `cube` global today is the drowsy eye's knobs, installed by
`installConsole` in `drowsy-settings.ts`. It becomes a shared object both
contribute to:

- `cube.giveCubes(n = 1000)` — logged out, it opens the account dialog (new
  account or log in) and credits `n` once an identity exists; logged in, it
  credits at once and shows the dialog with the new balance. Returns the
  balance.
- `cube.account()` — opens the dialog.

This mint exists in production code for now, because nothing it gives is worth
anything: the кубики and rooms live only in one browser. When the Worker
arrives, the mint moves to the test entry file as `relay-2.md` decided.

## Copy

`config/messages/en.json`: the currency is "cubes" in English copy (the page has
no Russian), with the mark doing most of the work.

## DRY notes

- **The mark's geometry is one module**, consumed by the canvas (as polylines
  through the existing `ink`) and by the SVG component. Two drawings would
  drift.
- **`installConsole` generalises** rather than a second global: it merges a
  record of members into `globalThis.cube` and removes only its own on dispose,
  so the drowsy knobs and the account commands share it. Its existing test is
  extended.
- **Storage access** follows `stored-pace.ts`'s try/catch shape (storage may be
  refused). Not extracted into a helper: two call sites with different keys and
  value types, and the wallet needs schema parsing the pace does not.
- **`formatPrice` is replaced, not kept beside `formatCubes`**: nothing would
  call it.
- **The dialog reuses `SaleOffer`'s Mantine setup** (provider, imported sheets
  in `ui/mantine-sheets.ts`); the account dialog lives next to it in
  `pages/cube/ui/`. The account's state is a module store in
  `features/account/model/account.ts`, read through `useSyncExternalStore`.
- **One parser reads every login text**: `pastedPhrase` finds a login link
  anywhere in a text, so the key file and the link go through it alike.

## Progress

Done and pushed (through caeaae0b), on preview slot 1: everything above. Left:
`/go` Step 3 (`/polish`: `/dry`, `/tend-prose`, `/five-percent` on PR 291), the
flip to `.completed.md`, Step 4 (`/pr` refresh of PR 291's body), and
`/squash-message update-only`. Then the operator's «как доделаешь, возьми и
примени пжст /explain-diff с vzakharov/pl-hub».

## Verification

- `pnpm test` over `figures`, `sale`, `drowsy-settings` and the account model
  (phrase → id is deterministic; the wallet schema rejects junk; the login
  fragment is recognised and stripped).
- `/preview` of `/cube`: a sign up close (mark, size), the offer dialog, the
  badge, the account dialog in both states, and `cube.giveCubes()` run from the
  console.
