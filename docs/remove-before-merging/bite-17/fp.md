# fp — near/far slot pairing (review-read2 item 3)

**Done.** `seededBed` returns a `Bed` — one entry per slot, `undefined`
where a slot found no spot — so the seeded flower at an index always pairs
with its own slot in `plotted` and `anchored-stand`'s `seededAt`, both of
which already skip an `undefined` place. `MeadowLayout.flowers` is typed
`Bed` (`layout.ts`, a type-only touch outside the package's files), and three
tests that read `layout.flowers` (`flower-layout`, `ink`, `mushroom-light`)
skip the holes.

**Does any real visit drop a slot today?** No. The bed is laid out on a fixed
`BED_SCREEN` (1180×820, no controls), so the window size never enters it;
only the visit seed and the opening clump do. 20 000 visits as the scene
opens them each kept all 22 slots. The fix is latent-only: every opening is
byte-identical.

**Tests.** `seededBed` under a world-wide control over the near band keeps 22
entries, each one standing in its own band (fails on the old drop-the-slot
code); over 200 random window sizes × 20 visits every seeded flower stands in
its own slot's band, with and without one near slot blanked, and blanked
stands judged from a walked anchor pair every flower with its own foot.

**Left.** Nothing. `ink.test.ts`'s "cannot carry the ground off its ink"
(`2e2a1e`) fails on the shared branch already, unrelated to this package.
