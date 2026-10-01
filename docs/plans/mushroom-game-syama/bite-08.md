# Bite 8 — Real mushrooms

What bite 8 built, as `## Eaten so far` in `docs/plans/mushroom-game-syama.*.md` indexes it.

8. **Real mushrooms.** The cap picker's four buttons are four species, each
   a real mushroom a child knows: the fly agaric as before, red with white
   spots; the porcini, a brown bun cap on a short barrel of a pale stem over
   a heavier contact shadow; the chanterelle, an upright egg-yolk-orange
   trumpet, its mouth open over a rim waving in lobes and its ridges running
   down the stem; the russula, a flat cap dished at its middle, in red, rose,
   violet, ochre or green on a white stem. Only the look changed: flies still
   favour the fly agaric (the one `spotted` cap), and the meadow still opens
   with two of them. What the next bites build on:
   - `model/mushroom-genes.ts`: `MUSHROOM_SPECIES`, `Species`,
     `Mushroom.species`; `MushroomGenes` a union on `species`, one gene
     table per species drawn in one order so a seed's stream stays aligned
     (`ChanterelleGenes` with `lip`, `hollow`, `flare`, the rim's wave,
     `lobes`, `ridges`; a russula's `hollow` and `tone` from
     `RUSSULA_TONES`). `HEAD_KIND` gives each species its head's shape, dome
     or trumpet: what is drawn, lit and housed by shape asks it
     (`hasTrumpet` narrowing to the trumpet's genes, `DomeGenes` derived
     from it), what is a species' own colour or genes asks the species.
   - The clump stands each species' foot by its own shift (`CLUMP_SHIFT`,
     `ui/scene/clump-layout.ts`); over 500 visits' opening clumps on
     every screen the suite holds that the back cap stays ≥ 45% in view and the back
     doorway ≥ 80% in sight, and the porcini reads stout by a short barrel of
     a stem (visible stem ~0.58 of its cap, the fly agaric's ~0.8). The
     opening clump of two fly agarics stands as before.
   - `model/mushroom-profile.ts` (each species' stem width, `capSurface`,
     `capBase`, the russula's dish, the chanterelle's `rimWave` in `lobes`
     whole crests, `frontSag`, `funnelHeight`, `funnelEdge`),
     `mushroom-outline.ts` (`headOutlines`, `capOutlines`, `tapArea` — the
     chanterelle's lip, funnel and stem are its cap, gills and stem —
     `inkWidth`, and `gillLines`: a porcini's sponge and a russula's gills
     hang as a band under the dome, drawn up round the stem) and
     `chanterelle-outline.ts` (`trumpetOutlines`, `ridgeLines`, `mouthEdges`,
     `MOUTH_LINE`). The painter stays inside the layout's bound
     (`speciesReach`, `maxReach`), swept per species over the drawn, turned
     cap. Butterflies sit on `capSeat`, on the real surface.
   - `doorStations(genes, turn)` follows the levelled, turned stem as drawn,
     each door sized by its own stem (at most `DOOR_MOST`); a chanterelle
     takes one window, on its funnel face, the others three or five. A door
     refuses a tap only to a nearer door whose tap area also holds it
     (`tappedDoor`, `ui/scene/door-tap.ts`).
   - Painting: `mushroom-paint.ts` (the stem and cap light every species
     shares), `paint-dome.ts` (fly agaric, porcini, russula) and
     `paint-trumpet.ts` (the chanterelle, both inks before either fill);
     `mushroom-tints.ts` the fills, the colours in `palette-creatures.ts`:
     a chanterelle's every fill at hue 20–30°, the porcini browns, shaded
     and hazed, held out of the weak-edge band a sweep of `inkFor` finds
     (0.021–0.050 today). A chanterelle takes 0.55 of the haze (`heldHaze`)
     so a far one stays orange; `HEAVY_FOOT` darkens a foot at least 0.37
     of its cap across; a house's frames take a pale edge on a dark cap.
     `icon-genes.ts` holds the pictograms' genes and size, Phaser-free, the
     picker's chanterelle the meadow's trumpet, its mouth fill at most about
     half the lip's depth.
   - The selection's ground ring is as wide as the foot (`footWidth` at the
     drawn turn), meeting the band at its corners; `strokeShape` closes each
     outline itself, and the play run checks the band for gaps
     (`scripts/lib/play-band.ts`).
   - Flowers live in `ui/scene/flower-layout.ts`, placed against the union
     of both meadows' feet (the margined, floored forest and the unmargined
     one); a seeded flower stands clear of every control's drawn circle and
     at most half hidden by the clump the visit opens with
     (`clump-shade.ts`), on the screen it opens on and on it turned, and is
     kept only where both have room, the flowers per visit that survive
     reported; later sizes map it by proportion. Bees keep clear of the feet
     standing now and of every species' place in free slots
     (`claimedPlaces`).
   - The layout's 2000-visit sweeps and the house's tests run every species
     in every slot. The play run grows each species from the picker and
     shoots it (`scripts/lib/play-species.ts`). Median frames 16–19 ms. Its
     review (5344789171, T74–T92) is handled.
