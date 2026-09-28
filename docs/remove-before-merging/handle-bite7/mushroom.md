# Group E (mushroom): T66, T67, T68

All three threads are fixed and committed. Every mushroom test passes (544),
and `tsc` and eslint are clean on the group's files. Nothing is left as a
patch.

- **T66**, b4cedec: the cap's light is the ordered list `capLight` in
  `mushroom-light.ts`. The shade, the rim light and the shine go down first
  and the spots after them. Measured before: the shine overlapped a spot on
  about 70% of 3,000 spotted caps. After: the shine shows over a spot on 0 of
  them. The test fails with the old order.
- **T67**, 8e76bb6: `stemOutline(genes, turn)` levels and rounds the foot
  against the mushroom's turn. The tap area, `door-sight` and `layout.test`
  pass the same turn. The shadow's geometry is the pure `castShadow`, which
  `paintShadow` in shapes.ts paints. `mushroomShadow` centres a contact under
  the foot, 1.3 times as wide as the foot stands and 0.32 of its width tall.
  Measured before: the foot rose 18 to 25 px across on tabL. After: it is
  under 1 px out of level at every splay, and both corners sit inside the
  contact.
- **T68**, 52e3079: `mushroomLights` gives each mushroom its own light,
  pointing from its cap's middle at the sun and turned into its frame with
  light.ts `turnedLight`, plus a ground light for its shadow. `flowerLight`
  does the same from a flower's head. The side shade scales by
  `sideways(toward)`, which is 0 straight overhead and full from 0.6 across.
  The tests cover every screen in `viewports.ts`.

Frames are in `docs/remove-before-merging/frames/bite-7/handle/`: the tabL
stem foot, the tabL lit cap close-up, and the phoneS and phoneL clumps, each
before and after.

## Left

- Draft the GitHub replies from the commit bodies.
- The contact shadow reads only faintly on the lit grass (alpha 0.3). It may
  want more alpha, or a grass-tuft line over the foot.
- The play run fails its 16 ms frame budget on tabL (18.2 ms median). That
  failure is not in this group's files.
