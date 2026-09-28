# Bite 8, scene agent — paused (second agent)

Last commits: 1c737e1 (porcini, chanterelle), 514c621 (spore wait in the
play). Everything is committed; all 580 mushroom tests pass, tsc and eslint
are clean. `pnpm type-overlap` also fails at 4651e94, in files this part did
not touch (`baking.ts`, `grain.ts`, `backdrop-tones.ts`, ...).

## The orchestrator's five items

1. **Porcini stocky**: done in the genes (below). The HUD's `ICON_CLUB` is
   gone. It was not looked at after the last change.
2. **Chanterelle**: (a) nearly upright; (b) `mouthEdges`
   (`model/chanterelle-outline.ts`) opens the funnel's mouth over the lip.
   `paint-trumpet.ts` `paintMouth` fills and shades it, and `lipLight` puts
   the dip light and shine on its far wall, with the near rim shading into it;
   (c) flesh `0xffa21a`, ridges paler `0xffc65e`, and `heldHaze` in
   `mushroom-tints.ts` gives it 0.55 of the haze. Tested; each new test was
   broken on purpose once and failed.
3. **Windows**: one window on the funnel face under the front rim
   (`faceAt`, `slotLevel`, `FEWEST_WINDOWS = { dome: 3, trumpet: 1 }` in
   `model/house.ts`). The face is a narrow V, so three full panes never fit.
   Nothing has been shot since this change.
4. **Spores**: Phaser tweens run on the wall clock (34 ms at most per frame),
   so `play-species.ts` `sporesGone` draws 36 frames 34 ms apart before the
   meadow and house shots. Not yet seen working.
5. **Left**: porcini contact shadow, the play run on all five screens, the
   frames, the side-by-side look. The phoneS frames in `frames/bite-8/` are
   stale. The last phoneS run (median 12.5 ms) came before the chanterelle
   reshape and the windows, so none of its frames were committed.

## Model changes

- porcini: stemWidth 0.26–0.30 (was 0.18–0.23), footBulge 1.3–1.55,
  stemHeight 0.68–0.80, capHeight 0.30–0.36, domePower 0.55–0.85, lean
  0.05–0.10 (magnitude; `facing` picks the sign).
- chanterelle: stemHeight 0.56–0.70, stemBend ±0.06, lean ±0.04, capWidth
  0.78–0.90, capHeight 0.25–0.29, domePower 0.85–1.05, lip 0.12–0.15,
  waveAmp 0.018–0.030.
- `house.ts` `DOOR_MOST = 0.175`: the widest a door grows.
- The pose test now says each gene keeps a size its range allows.

## Sweep numbers that moved

- Least back cap in view: porcini 47.9 → 61.1%; chanterelle 51.2 → 45.1% on
  the small phone. The floor is 45%, so there is no room left.
- Clump doorway in sight: still 80.7% everywhere (floor 80).
- Nearest the edge: fly agaric unchanged.

## What still reads wrong (last frames)

- The porcini's bulge is low and reads subtly. A barrel profile (widest in
  the lower third) would read fatter, but the clump's door sight has no slack.
- The chanterelle's stem was still long and thin in those frames. The
  reshape since then has not been looked at.
