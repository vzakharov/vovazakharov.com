# The mushroom game cut by nouns — the target tree

For the operator's look before any code moves. Base entities never import one another. Where two meet is a feature named for what happens, and two features that would import each other are one. The whole meadow (its state, its turn and its scene) sits above them in `widgets/meadow`, provided 6a's modularity passes it. `shared` holds what is about nothing in particular. Each slice lists its file families, not every file; the file-level layout is generated once this tree stands.

## The tree

```
src/mushrooms/
├── shared/
│   ├── lib/      geometry, random, motion, colour, crescent, light, tap-reach,
│   │             cruise, glide, line-course — helpers knowing no creature
│   ├── world/    the eye in the meadow: ground, camera, pinhole, pan, view,
│   │             view-inverse, eye-crop, eye-height, stride, walk, walking,
│   │             anchor, meadow-camera, viewports
│   └── ui/       palette*, ink, shapes, haze-tone, hit-areas, synth,
│                 part-loudness, baking, bake-picture — paint and sound primitives
├── entities/
│   ├── mushroom/ genes, profile, pose, outlines, house (windows, door), its
│   │             painters (dome, trumpet, house without tenants), tints, light,
│   │             tap and reach of cap, door and window, window glow, sprout
│   │             (`Sprout`, `Planted`), icon genes
│   ├── worm/     its body and clock along a given way, its painter
│   ├── mouse/    its course and clock between two given doors, its painter
│   ├── insect/   genes and outlines of each kind, flight and its habits, paths,
│   │             steering, dart, motion, painters, look, shadow, voices, tap
│   ├── flower/   genes, sounds and notes, painter, tints, its light, ring
│   ├── firefly/  its glow and ring round a given host, its view, tap
│   ├── sky/      the day and the weather (dusk, rain), sun, moon, stars, clouds,
│   │             panorama, skyline, the backdrop's painters and voices
│   └── lawn/     the grass the child plants on: lawn cells, tufts, mottles,
│                 grain, brow, far band
├── features/
│   ├── plant-flower/      «цветок вырастает от тапа по травке»: tuft tap,
│   │                      tending, planting, the flower picker
│   ├── sow-spores/        a tap sows a mushroom's spores and rain sprouts them:
│   │                      sprouting, spore seats, sight, bed, drift
│   ├── grow-mushroom/     a mushroom grows where there is room: mushroom room,
│   │                      placement, crowding, standing weighed
│   ├── furnish-house/     a window or a door goes into a mushroom: furnishing,
│   │                      door sight and seats
│   ├── worm-peeks/        a tap on a window calls the worm out: the way over the
│   │                      cap between windows, house-worm, tenants painted in
│   ├── mice-run/          mice run between doors, by day and at dusk: run rules,
│   │                      night runs, mouse door, runner shown, run front
│   ├── insects-perch/     insects land on flowers and caps: perch room, perch
│   │                      sight, hosts, crowding, flower seat, air spots
│   ├── bee-pollinates/    a bee carries pollen and plants flowers: pollen, flower
│   │                      sight for planting
│   ├── insects-shelter/   rain sends insects under caps, night onto perches:
│   │                      shelter, shelter seats and cover, roost
│   ├── flowers-close/     flowers close in rain and at dusk
│   ├── fireflies-circle/  fireflies circle mushrooms and flowers at dusk: hosts
│   ├── play-flowers/      the flowers as an instrument: instrument, voices, keys,
│   │                      keyed flowers, chord fingers, flower touch and hold
│   ├── walk-meadow/       the eye walked by finger and key: eye input, keyboard
│   │                      walking, gait button and icon, footsteps
│   └── keep-meadow/       a meadow kept and opened again: keeping, kept record,
│                          fliers at rest, meadow number, the store, scene keeping
├── widgets/
│   └── meadow/   `Meadow`, the `Action` union and `reduce`; the scene, its
│                 layout and beds, arrivals, planter, controls, pickers, HUD,
│                 sky layout, sound, the map
└── pages/
    └── mushrooms/  the page, the canvas, metadata
```

## Calls in it, each a recommendation

1. **The sky and the lawn are entities, not `shared`.** The day and the weather are about something. Flowers, insects, mushrooms and fireflies all read them, so each of those readings becomes a feature (`flowers-close`, `insects-shelter`, `sow-spores`, `fireflies-circle`).
2. **The eye's geometry is `shared/world`, walking it is a feature.** The camera and the view are read by every painter and know no creature. Moving the eye by finger and key is a user-facing capability.
3. **The map stays inside `widgets/meadow`.** It draws with the meadow's own layout engine, so as a widget of its own it would have to import a sibling widget. It leaves when the layout engine leaves for a lower layer, which is a later step.
4. **The controls, pickers and HUD stay in the widget.** They compose every feature's buttons. A feature per picker would split one row of buttons across slices that place themselves against each other.
5. **The fireflies are an entity.** Their glow and their ring are their own; only _which_ host they circle meets the mushrooms and flowers.

## What must be untied first, in place

- **The worm and the mouse lose the house.** `worm.ts` and `mouse-run-clock.ts` import `house.ts` for windows and doors. They take those as parameters, and `draw-house` stops painting tenants, which `worm-peeks` and `mice-run` lay over it.
- **The meadow's state is built from its parts** (the plan's answer 3). Every function on `Meadow` becomes generic in the slice it reads, `Planted` and the sprout go to the mushroom, and `Meadow`, `Action` and `reduce` go up.
- **`flower-genes` goes back to the flower.** `pollen` and `mushroom-light` read it today, and those readings move into `bee-pollinates` and the flower's own light.
- **`repaint-queue` stops knowing the mushroom's profile.** It takes it as a parameter.
- **`Timed`, the insects' clock, is everyone's clock.** It is defined in `flight.ts` and read by the weather and the sprouting, so it moves to `shared/lib`.

Each untying is a change of a module's API with no change of behaviour, held by the meadow's tests.

## Open after this

- **The 27 tests above their layer**: re-counted on this tree.
- **Each feature's significance**: `check:masd` passes or merges them. Two features importing each other are one.
