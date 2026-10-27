# The mushroom game as a slice tree — a dry run

Every file of `src/mushrooms/pages/mushrooms/` (tests left out) assigned to a slice, nothing moved. `m:` is `model/`, `s:` is `ui/scene/`. Consumers are the other slices importing one; `shared` is segmented, so it has none to count.

```
src/mushrooms/
├── shared/
│   ├── lib/  (20 files)
│   │     m:cruise m:geometry m:glide m:light m:line-course m:meadow-number
│   │     m:motion m:random s:backdrop-depths s:baking s:chord-fingers
│   │     s:cloud-puffs s:colour s:crescent s:door-tap s:insect-tap s:moon-face
│   │     s:run-front s:tap-reach s:twin-fade
│   ├── world/  (16 files)
│   │     m:anchor m:crowding m:dusk m:eye-height m:ground-grid m:ground m:pan
│   │     m:pinhole m:placement m:stride m:walk m:weather s:eye-crop
│   │     s:view-inverse s:view s:walking
│   ├── ui/  (8 files)
│   │     s:haze-tone s:ink s:palette-backdrop s:palette-creatures
│   │     s:palette-dusk s:palette s:repaint-queue s:shapes
├── entities/
│   ├── firefly/  (1 files)   ← 1 pages/mushrooms
│   │     m:firefly
│   ├── mushroom/  (26 files)   ← 2 features/meadow, pages/mushrooms
│   │     m:chanterelle-outline m:furnishing m:house m:mouse-run-clock
│   │     m:mouse-run-course m:mouse-run m:mushroom-genes m:mushroom-outline
│   │     m:mushroom-pose m:mushroom-profile m:night-runs m:worm s:door-reach
│   │     s:draw-house s:draw-mouse s:draw-mushroom s:draw-worm s:icon-genes
│   │     s:mushroom-light s:mushroom-paint s:mushroom-tap s:mushroom-tints
│   │     s:paint-dome s:paint-trumpet s:porcini-margin s:window-reach
│   ├── insect/  (28 files)   ← 2 features/meadow, pages/mushrooms
│   │     m:bee-genes m:bee-outline m:buzz-genes m:buzz-rest m:flier-rest
│   │     m:flight-frame m:flight-habits m:flight-in m:flight-timing m:flight
│   │     m:fly-genes m:insect-dart m:insect-genes m:insect-light
│   │     m:insect-motion m:insect-outline m:insect-paths m:insect-steering
│   │     m:insects m:perch-room m:pollen m:proboscis m:roost m:shelter
│   │     s:draw-bee s:draw-buzz s:draw-fly s:draw-insect
│   ├── flower/  (6 files)   ← 2 features/meadow, pages/mushrooms
│   │     m:flower-genes m:flower-sounds m:notes s:draw-flower s:flower-closing
│   │     s:flower-tints
├── features/
│   ├── meadow/  (8 files)   ← 1 pages/mushrooms
│   │     api/fake-store api/keeper api/meadow-store api/open-kept m:game
│   │     m:keeping m:kept-record m:sprouting
├── pages/
│   ├── mushrooms/  (129 files)   ← 0
│   │     index lib/mushrooms-metadata m:map-frame ui/meadow-canvas
│   │     ui/mushrooms-page ui/mushrooms s:air-spots s:anchored-stand
│   │     s:arrivals s:backdrop-tones s:bake-picture s:bed-place s:brow
│   │     s:button s:cap-cover s:clump-layout s:clump-shade s:control-actions
│   │     s:controls s:door-seats s:door-sight s:draw-map-ground s:dusk-sky
│   │     s:dusk-stars s:dusk-view s:dusk-voice s:eye-input s:far-band
│   │     s:firefly-tap s:firefly-view s:flower-bed s:flower-cover
│   │     s:flower-hold s:flower-icons s:flower-layout s:flower-plots
│   │     s:flower-ring s:flower-seat s:flower-shown s:flower-sight
│   │     s:flower-touch s:footsteps s:gait-icon s:gait-spot s:grain s:grass
│   │     s:hit-areas s:house-view s:house-worm s:hud s:insect-away
│   │     s:insect-drawn s:insect-frame s:insect-look s:insect-seat
│   │     s:insect-shadow s:insect-shown s:insect-sink s:insect-view
│   │     s:insect-voices s:instrument-input s:instrument-voices s:instrument
│   │     s:keyboard s:keyed-flowers s:lawn s:layout s:map-child s:map-compass
│   │     s:map-ground s:map-view s:meadow-camera s:meadow-keeping
│   │     s:meadow-listeners s:meadow-opening s:meadow-scene s:meadow-taps
│   │     s:moon-view s:mottles s:mouse-door s:mouse-runs s:mushroom-bed
│   │     s:mushroom-frame s:mushroom-patch s:mushroom-room
│   │     s:mushroom-selection s:mushroom-shown s:paint-backdrop s:paint-land
│   │     s:paint-moon s:paint-sky s:panorama s:part-loudness s:perch-crowding
│   │     s:perch-hosts s:perch-sight s:perches s:picker-rows s:picker
│   │     s:plane-place s:planter s:rain-drops s:rain-fall s:rain-sky
│   │     s:rain-view s:rain-voice s:runner-shown s:shelter-cover s:sky-layout
│   │     s:skyline s:sound s:spore-bed s:spore-drift s:spore-seats
│   │     s:spore-sight s:spores s:standing-weighed s:star-images s:start-game
│   │     s:sun-layout s:synth s:tending s:tuft-tap s:tufts s:viewports
│   │     s:visit-play s:widest-spans s:window-glow s:windows-lit
```

## Edges this tree would break (13)

Each is a type or a value living in a file of the wrong slice.

```
entities/insect -> features/meadow  (m:flier-rest -> m:kept-record)
entities/mushroom -> features/meadow  (m:furnishing -> m:game)
entities/mushroom -> entities/insect  (m:mushroom-outline -> m:shelter)
shared/world -> entities/insect  (m:pinhole -> m:flight-frame)
entities/insect -> entities/flower  (m:pollen -> m:flower-genes)
entities/flower -> pages/mushrooms  (s:flower-closing -> s:bed-place)
shared/ui -> pages/mushrooms  (s:ink -> s:backdrop-tones)
entities/mushroom -> entities/flower  (s:mushroom-light -> m:flower-genes)
entities/mushroom -> pages/mushrooms  (s:mushroom-paint -> s:hit-areas)
entities/mushroom -> pages/mushrooms  (s:mushroom-paint -> s:layout)
shared/ui -> entities/mushroom  (s:repaint-queue -> m:mushroom-profile)
shared/ui -> entities/mushroom  (s:shapes -> s:mushroom-light)
shared/world -> pages/mushrooms  (s:walking -> s:footsteps)
```
