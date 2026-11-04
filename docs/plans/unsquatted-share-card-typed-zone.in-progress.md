# Share card keeps the typed domain

## The task

Operator (Vova), on unsquatted: a share of a name typed with its zone
(`pisem.net`) must show that domain on the card, even when it is taken.

## Done (PR #250, draft)

- 1a21a791, 8096c806 — the card's field holds the typed domain
  (`typedDomain ?? label`) with its verdict and price drawn inside it
  (`fieldRow` in `field-tools/lib/share.ts`, `drawField` / `drawVerdict` in
  `share-card.ts`); the rows under it are the alternatives alone (`cardRows`
  filters out `typed`).
- Footer: `asideOf` in `share-card.ts` picks the hand's aside — `aside.all`
  ("okay, maybe not these ones", `takenAside`) when every domain on the card is
  taken, `aside.field` ("okay, maybe not this one", new `typedTakenAside` in
  `checker/config/messages/en.json`) when only the field is; none otherwise.
- Tests in `share.test.ts` cover `cardRows` / `fieldRow` / `cardSettled`.
- `/polish` ran (be0ee19c); `/five-percent` posted its review; PR body and
  squash proposal are current as of 1659f233.

## Left — the operator's latest ask

"давай лучше не зачёркивать, а стрелку к надписи, а саму надпись поверх поля
ввода (но ближе к тому где белое)":

- For the field-only-taken card (`aside.field`): **no strike-through** — the
  footer lede stays plain. The handwritten "okay, maybe not this one" sits
  **over the input field**, toward its white (empty) middle — i.e. in the gap
  between the domain on the left and "taken 2024" on the right — with a
  hand-drawn **arrow** from the note to the verdict "taken 2024".
- The all-taken card keeps its struck lede with "okay, maybe not these ones",
  unchanged (not asked about).
- Look at it locally: `tmp/preview/card.cjs` (Playwright) opens
  `localhost:3107/#<name>`, presses share and saves the card PNG —
  `pnpm dev unsquatted --port 3107`, then
  `node tmp/preview/card.cjs pisem.net out.png` from `tmp/preview/`. **Do not
  publish to preview.vovazakharov.com** — the operator said it is busy. If the
  dev server fails on a Google font, `rm -rf sites/unsquatted/.next` and
  restart.
- Then refresh the PR body and the squash proposal (both say "struck through as
  on an all-taken card" for the field-only case).

## Open, mentioned to the operator, no answer yet

- The like heart is drawn beside rows only, not in the field, so a liked typed
  domain shows no heart on the card.
