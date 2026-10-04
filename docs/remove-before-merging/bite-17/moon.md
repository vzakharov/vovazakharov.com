# moon — a round full moon with a kind face

The operator's redesign: the moon's petal rosette made it look like a second sun,
so the moon is now a plain round disc with a sleepy, smiling face made of its
own seas (the man in the moon, made friendly for Syama). The mandala quality
comes from a halo of soft concentric rings with a ring of outlined beads.

## Done

- `moon-face.ts` (+ test): the face's geometry, pure. Six seas, each a
  two-lobed blob with a deeper core set up and to the left. Two closed eyes
  and a smile, each a crescent bowed downward. Two round cheeks. All are in
  moon radii and all sit inside the disc.
- `paint-moon.ts`: three halo rings in `moonHalo` at alpha 0.1/0.14/0.22,
  reaching 1.78 r. That is under `SUN_RAY_REACH`, so `starClear` and
  `cloudOverMoon` still hold unchanged. A ring of 24 beads at 1.56 r,
  large and small by turns, inked in `inkCool`. Then the disc in `moon`, the
  seas in `moonSea` (rim and core each at 0.3), the cheeks in `moonCheek`, the
  eyes and smile in `moonSea` at 0.8, and the `inkCool` outline. The callers
  (dusk view, map compass) are unchanged because both go through `drawMoon`.
- The crescent shadow is gone: `moon-shadow.ts` and its test are deleted. In
  the palette, `moonShade` became `moonSea` and `moonCheek` was added.
- These still act on the moon's graphics object or the sun's place, so they
  work as before: tap reach (`duskReach`), the cloud masks, the `moonUp` fade.

## Decided

- The halo is concentric soft rings plus a ring of beads, not rays.
- The face has no outlines: features are filled patches only, so they read as
  the moon's own markings. Only the disc and the beads carry ink.
- At the map compass size (r 7) the beads show as a dotted ring and the face
  only as a faint hint (`moon-map.png`).

## Left

Nothing.

## Frames

`docs/remove-before-merging/frames/bite-17/moon-*.png`: `moon-before`
(the petal moon), `moon-tabL`, `moon-tabL-turned`, `moon-phoneP`,
`moon-map` (the compass, ×4).
