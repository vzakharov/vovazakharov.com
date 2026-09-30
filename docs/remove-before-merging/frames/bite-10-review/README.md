# Bite 10 review — the player's frames

Shot from a probe build (`NEXT_PUBLIC_MUSHROOM_PROBE=1`) through Playwright,
with `Math.random` seeded to 12345 and the loop stepped by frame. Screens:
phoneP 390×844 @3, phoneL 844×390 @3, phoneS 320×568 @2, phoneSL 568×320 @2,
tabL 1180×820 @2. No page errors on any run.

| Frame | What it shows |
| --- | --- |
| `phoneP-10-forest-tuft-refused.png` | After `+` grows the forest to 6, the bare tuft at (287, 797) shakes and plays nuh-uh while the meadow holds 7 of 14 flowers. 5 of the 12 bare tufts refused like this. |
| `tabL-10-forest-tuft-refused.png` | Same on the tablet: 7 of 56 bare tufts refused below the cap, first at (215, 759). |
| `phoneP-02-colours.png` | The colour stage in the top row. Nothing marks which tuft it opened on, and the tuft is 10–12 px of grass about 700 px lower on screen. |
| `phoneP-03-shapes.png` | The shape stage: four blue flowers, round and pointed, one or two rings. |
| `phoneP-04-grown.png` | The chosen flower grown on its tuft (bottom right, by the yellow one). Its seed matches the button, and it stands on the tuft's foot. |
| `phoneP-05-full.png` | The meadow at 14 flowers. No tuft is left that a tap reaches bare, so the refusal at the cap can't be triggered on this screen. |
| `phoneS-02-colours.png` | Small phone: the colours wrap to two rows, white alone under blue. The fly and bee buttons give way while it is open. |
| `phoneSL-02-colours.png` | Short sky (568×320): the colours take the top row, and butterfly, fly, bee and house are hidden. A tap on the meadow closes the picker and brings them back. |
| `phoneSL-00-open.png` | Short sky at the start: tufts are drawn 2.8–5.9 px, specks rather than something to tap. |
| `phoneS-05-full.png` | Small phone after 5 hand plantings (12 of 14 flowers): the tufts still visible are all inside some flower's tap reach, so none opens the picker. |
| `tabL-05-full.png` | Tablet at 14 flowers: the child's plantings bunch at the front right, and their heads overlap (blue over yellow, pink over yellow). |
| `phoneL-13-shapes-in-forest.png` | Phone held sideways: mute, three insects, four shapes and the house make one unbroken row of ten circles, with `+` greyed at its end. |
| `tabL-06-refused-at-cap.png` | The tuft's shake at the cap (tablet). |

Sweeps behind the findings are in the review report. Their scripts are
`tmp/review-bite10/*.sweep.ts` (gitignored).
