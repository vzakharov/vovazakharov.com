# Share as image: show the image before it is shared

## The task

Vova, on preview, after pressing "Share as image" on a desktop (macOS
Safari/Chrome): «share as image появляется где-то сбоку, и я не вижу собственно
что за image». The system share sheet opens anchored off to the side of the page
and shows only a file icon and `unsquatted.foxedpage.com · PNG Image · 84 KB`,
so the sharer never sees the card they are sending.

## Approach (recommended, not yet confirmed by Vova)

"Share as image" opens a Mantine `Modal` holding the drawn card as an `<img>`
(an object URL of the PNG `shareCard` already produces, revoked on close) at the
modal's width, with two buttons under it: **Share…**, shown only where
`navigator.canShare({ files })` is true, calling the existing share path from a
click inside the modal (so the sheet anchors to the dialog and keeps the user
gesture), and **Download**, always. On a phone the same modal, Share first.

- `Modal.layer.css` is already in `src/shell/app/ui/theme-provider.tsx`; check
  `Image`/anything else new with `pnpm check:mantine-styles` and by eye, since a
  modal is not in the static HTML (the `Menu` sheet had the same blind spot).
- Copy for the two buttons and the modal title goes in
  `src/unsquatted/pages/home/checker/config/messages/en.json`.
- Lives in `src/unsquatted/pages/home/corner-tools/` (`ui/` for the modal,
  `lib/share-card.ts` for `shareFile`, which may split into share and download).

## Done

- Nothing yet for this task. The same follow-up's items 1–2 (hover fill on the
  corner tools, "Copied ✓") landed in `776df7d`.

## Left

- Build the modal, `/preview` it in both themes at 1280 and 390, republish to
  preview.vovazakharov.com, `/polish`, refresh PR #241's body (QA row
  `share-image`) and the squash proposal.
