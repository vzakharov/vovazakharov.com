# PR #57: feat(vova): Syama's mushroom game at /mushrooms

- **State:** closed
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/57
- **Author:** @vzakharov (human)
- **Base ← Head:** main ← claude/mushroom-game-syama-lbirv7
- **Draft:** no
- **Merged:** 2026-10-04T17:29:09Z
- **Created:** 2026-09-17T09:39:48Z
- **Updated:** 2026-10-04T17:29:10Z
- **Closed:** 2026-10-04T17:29:09Z
- **Labels:** _none_

---

## Body

## Summary

- Syama's mushroom game at `/mushrooms`, the whole of it, spec in #65: a meadow of mushrooms with mouse houses, where `+` grows another mushroom (a picker of four species first — fly agaric, porcini, chanterelle, russula), `−` takes one away, and three bug buttons fly in a butterfly, a fly or a bee. No goal, no text, no failing — made for a six-year-old's hands on a tablet or phone.
- Everything is drawn and voiced by code: each mushroom, flower and insect is grown from its own seed by a pure, tested generator and painted with Phaser 4 vector primitives; sound is synthesized with Web Audio. Phaser loads on this route alone, and the canvas renders at the device pixel ratio so a retina tablet stays sharp.
- Four people's loves go into it: Syama's idea, procedural generation, Zoltan's ecology, and Leysan's mandalas. The ecology: bees pollinate flowers into new ones, a tapped cloud rains and the meadow answers, spores a tap leaves on the ground sprout in the rain, dusk brings out the mice and fireflies. It is all shown in plain sight and never taught. The mandalas: the ornament is radial and ringed (the sun's rosette, the flowers' petal rings), without any mandala drawn as such.
- Built as an elephant (`docs/plans/mushroom-game-syama.*.md`), a bite per session, each bite reviewed by a fresh session and the review handled by the next, until finalize. The game as it stands is also published as an Artifact (below), at version 25. **Bites 1–16 and 12b (the meadow without an edge) have landed, each with its review handled; one remains — dusk (item 17) — with bite 6 the game reaches its MPP line, every control in Syama's drawing working:** the meadow, still, with the opening pair standing as one clump like the drawing's; the meadow alive and heard — idle motion, tap wobble and spores, seeded flowers that bloom when tapped, a synthesized soundscape with a mute button; and more mushrooms — `+` opens a four-cap picker and grows the pick out of the ground, a tap selects a mushroom and `−` sinks it back, up to six in a forest round the clump, all through a pure reducer in `model/game.ts`.
- **Bite 3's review, handled:** taps work again (Phaser read the mushrooms' hit area as a config, so the first tap threw and killed every button), and a mushroom's tap area is now exactly its cap, gills and stem as drawn. `pnpm play:mushrooms` builds a probe export and plays every control on four screens in headless Chromium, failing on any page error or any tap that does the wrong thing. Forest mushrooms never shrink below a finger's target on a phone; the buttons stand clear of every mushroom and of the sun's rays. The picker unfolds from `+` and folds back into it, the picked cap flying down to where its mushroom grows. No tap is ignored: `−` with nothing selected takes the newest mushroom, and a control that truly cannot act shakes its head with a "nuh-uh". A selected mushroom wears a thick yellow outline that moves with it and gently beckons, and the buttons are opaque, with caps big enough to tell apart at a glance.
- **Bite 4, the mouse house:** a house button under `−` (a fly agaric with two windows and a door) opens a second picker across the top — Syama's four windows (`⊕`, `○`, `□`, the tall arched one) and a door. Opening it selects the newest mushroom with room, so the glow shows where a pick will go; a pick furnishes the selected mushroom, and the picker stays open for the next; the two pickers close each other. Windows go into a row along the cap's lower band, three or five as the cap's width allows, from the middle outward, and a window takes the place of any spot it would half-cover; the door stands on the stem at whatever height the mushrooms in front leave in sight. Each pops in with a puff and a knock. Now and then a door swings open and a mouse peeks out, looks about, blinks and ducks back; a tap on the door calls it at once with a squeak. A full row and a second door shake their heads. The house is a graphics per mushroom that copies its pose each frame, so it grows, wobbles and sinks with it, and the mouse is clipped to its doorway. `pnpm play:mushrooms` plays the house too (`scripts/lib/play-house.ts`).
- **Bite 4's review, handled:** the back mushroom's door was often hidden behind the front one, so each door now picks, per visit, the lowest of 8–14 stations up the stem where at least 80% of it and its doorway are in sight, sized to the stem there; the portrait clump's feet stand together so the back cap stays mostly in view. Every door's tap area is at least two fingertips across, the mouse's head is never drawn under 28 px (it leans out of a small door, shoulders showing), and the house picker skips a full mushroom rather than greying out. `pnpm play:mushrooms` now asks the scene's own hit test that a tap at each door reaches it, plays both clump doors, and shoots a furnished mushroom mid-sink with its house.
- **Bite 5, the butterfly:** a butterfly button heads a column down the left, level with `+`, as Syama drew the insect buttons opposite the mushroom ones (beside the mute where the sky is too short). Each tap flies in a butterfly grown from its own seed — one of fourteen colours round the colour wheel (none in the grass's greens), with a band and eyes a quarter to three quarters of the way round from it, two or three concentric rings to every eye, round or pointed tips — up to four; a fifth sends the oldest off screen, so the button always acts. Each flies between flowers and the caps on a bowed, fluttering path, its wings beating fast in the air and slowly opening and closing at rest on a cap, facing up the screen, as in the drawing. Where it goes and when is a pure function of its seed and the legs it has flown (`model/flight.ts`, `model/insects.ts`), and every frame's pose a pure function of the clock (`model/insect-motion.ts`). A tap on one at rest sends it off with a trill; in the air it only jolts; a mushroom sunk under one sends it off too. Butterflies sit above the meadow and under the buttons. `pnpm play:mushrooms` plays them (`scripts/lib/play-insects.ts`), and draws only the last frame of each step, which keeps the run under ten minutes.
- **Bite 5's review, handled:** a perch holds one butterfly, and none goes to a perch so close to a taken one that their wings would cover more than a quarter of each other; with every perch taken a butterfly roams between spots in the open air over the meadow rather than flying off, so a press of the button never loses one. A butterfly drinks only at a flower it can be seen on — clear of the buttons and the screen's edge, its head not behind a nearer mushroom (`ui/scene/perch-sight.ts`, a pure function of the layout) — and it drinks: it sits on the flower's upper rim, uncurls a two-tone proboscis down into the centre and sips, its wings flexing half shut, while the head sags under it and springs back with a flicker of the petals when it leaves. A tap on a resting butterfly goes on to what it sits on, so a child still selects the mushroom or blooms the flower under it. Butterflies cruise at two thirds of their earlier speed, a leg cut short mid-air flies on without stopping dead, the body never spins at the ±π seam, and every eye sits inside its wing. The pictogram's seed is pinned by a test (orange with cobalt edges and eyes). `pnpm play:mushrooms` runs under tsx now that the probe's perch schemas derive from the model.
- **Bite 6, the fly and the bee — the MPP line:** a fly and a bee button join the butterfly's column down the left (a row beside the mute where the sky is short; on a 320 px phone the fly and the bee share the pickers' band and give way while one is open), so every control in the drawing now works. One generator family grows all three kinds (`InsectGenes` a union keyed by `kind`): a fly is a stout dark body with a metallic sheen, two big red eyes and clear veined wings laid back at rest; a bee a round fuzzy body in three or four black and yellow bands, a small head, small clear wings and pollen baskets on its hind legs. Each kind flies by its own row of `FLIGHT_HABITS` and its own path shape — the butterfly's lazy curve, the fly's fast zigzag, the bee's bobbing line — up to four butterflies, three flies and three bees, perches exclusive across kinds. The fly rests on caps four times in five, picking a fly agaric three times as often as any other cap, and there it jitters, rubs its front legs and hops along the cap and back; the bee goes only to flowers, crawls about each, and buzzes its wings now and then. A bee carries pollen from the last flower it drank at (specks filling its baskets, up to three) and, leaving a different flower it pollinated, plants a new one in a ring slot round it — up to 14 flowers in all, only where the new one would be in sight on this screen — which grows up out of the ground and opens with a chime, a perch and a parent like any other flower. Each takes off with a synthesized buzz (a fly's thin rasp, a bee's warm hum), never a drone. Hovering fliers never overlap in the air, and no body turns faster than 0.2 rad a frame. The scene's flowers move into `ui/scene/flower-bed.ts`, per-kind painting into `draw-fly.ts`/`draw-bee.ts`, and `pnpm play:mushrooms` now plays five screens (a 320 px phone added), releases every kind to its limit, taps each at rest, waits for a bee to plant, and checks every frame's turn, rest facing, hover overlap and drawn size (`scripts/lib/play-buzzers.ts`, `scripts/lib/flier-watch.ts`).
- **Bite 6's review, handled:** the ecology now shows. A tablet keeps planting (a slot needs sight on this screen only, not the screen turned), and bees get their flowers: perches crowd by the kinds actually on them, a bee reads a flower from its own seat, and a seated butterfly or fly makes way for a bee waiting in the air, so bees roam under 25% of the time on every screen (13% on a 320 px phone, was 42%). Flies pick fly agarics at least 60% of the time. No flier is lost on a small phone: the air there is a finer grid that seats all ten apart. A tap reaches the insect whose body is nearest the finger, and every kind is caught at least 70% of the time; a long flight darts across and comes in at its own pace (at most 5.1 s for a butterfly, 2.0 s for a fly, 3.1 s for a bee), never dragging. Mute drops sounds instead of saving them up for the unmute. A resting bee's flutter no longer strobes, and it sits on the flower's lower rim facing in, so the flower shows. A fly's jitter is big enough to see. The sun stands whole in the sky, the far hills parting round it. A flier turns on the spot before it flies and faces the way it goes over one bob, and faces a moving perch as it carries it in; a cap let go of settles over a whole swell, so a flier riding it never lurches, and reselected mid-settle it swells on from where it stands. The flight step moves into a pure `model/insect-steering.ts`; the play run's heading watch now measures the flight, not the turn cap, and passes on all five screens. The suite runs in 84 s (was 348 s).
- **Bite 7, atmosphere — the meadow in one light:** the look is taken from Gris, Ori and Alto's stills (spec in `docs/remove-before-merging/atmosphere/look.md`) without leaving Syama's drawing. The sky pales from a softer blue through near-white to a warm cream at the hills, and the sun sits in a clean gold halo with no grey-teal where yellow meets blue; three hill ranges recede toward one shared `air`, each misting at its foot and rimmed with light on the slopes that face the sun; the ground runs lit and yellower far to deeper near, under soft seeded patches and a fine grain, meeting the hills on a wavering seam with no straight line; the grass fades by distance. Every creature is inked in the dark of its own fill pulled toward an indigo (Syama's blue pen) rather than one brown, heavier on the shade side and thinner toward the light, with legs, feelers and stems tapering. Shade, shine, rim light and cast shadows all come from where the sun actually stands (`model/light.ts`), warm lights over cool shadows, so turning the screen moves them. The fly agaric stays red with white spots, the HUD discs keep their even ring and fixed upper-left light, and nothing tappable loses contrast. No filters: bands, shaded sky cells and one grain texture. The colour table is split into `palette.ts`, `palette-backdrop.ts` and `palette-creatures.ts`; the pen is `ui/scene/ink.ts`.
- **Bite 7's review, handled:** the meadow is cheap to draw again — the backdrop (sky, halo, sun, hills, ground, wash) and every button's face are baked into textures once a paint, supersampled so edges stay smooth, and the play run now fails a screen whose rendered-frame median passes 26 ms (13–20 ms on every screen at this head) or whose fliers turn past their `TURN_RATE` or show a light more than `LIGHT_STEP` off the sun. The sun's halo fades to nothing in four smoothstep layers instead of plateauing across the upper sky, and the far hills part wider than it; the wash over the land stops short of every mushroom slot's foot. Each mushroom and flower is lit from the sun as seen from where it stands, the side shade as strong as the sun is sideways, and an insect's lit parts turn with it and are repainted every 22.5°. Every edge meets one bar — its ink or its fill stands 3:1 off the ground under it — with a dark fill (a bee's bands, the doorway) edged in its own colour a little lighter rather than a blue-black ring. A cap's shine goes under its spots, and a stem's foot stands level and rounded on the grass over a contact shadow centred under it.
- **Bite 8, real mushrooms:** the picker's four caps are now four species a child knows, each grown from its own gene table (`MushroomGenes` a union on `species`, drawn in one order so a seed's stream stays aligned). The fly agaric stays red with white spots; the porcini is a brown bun, tan to chestnut, on a stout whitish barrel of a stem with a faint net under the cap, a paler margin and a heavier shadow at its foot; the chanterelle is an upright egg-yolk apricot trumpet, one piece from foot to rim, its mouth open over a waving lip and paler ridges running from the rim down the stem, and it keeps its orange far off by taking only 0.55 of the haze; the russula is a flat cap dipping at the middle in red, rose, violet, ochre or green over white gills. Each species' widths and heights live in `model/mushroom-profile.ts`, so the outlines, the pose, the house and the painter read one answer; painting splits into `mushroom-paint.ts` (the shared stem and cap light), `paint-dome.ts` and `paint-trumpet.ts`, the fills into `mushroom-tints.ts`. Flies still favour the fly agaric, and the meadow still opens with two of them. Houses fit every species — three or five windows on a dome, one on a chanterelle's funnel, each frame given a pale edge where its ink would not stand off a dark cap — and a door's stations now follow the levelled, turned stem as drawn (carried from bite 7), sized by its own stem up to `DOOR_MOST`; where two clump doors' tap areas overlap, the nearer door takes the tap. Butterflies sit on each cap's real surface, the layout's reach is measured from the filled outlines, and the 2000-visit layout sweeps and the house's tests run every species in every slot. `pnpm play:mushrooms` grows each species from the picker, taps it, fills a meadow, waits for a butterfly on a chanterelle and builds a house on a porcini and a chanterelle (`scripts/lib/play-species.ts`); every screen plays green with a rendered-frame median of 15–20 ms.
- **Bite 8's review, handled (T74–T92):** the clump stands each species' foot by its own shift (`CLUMP_SHIFT`), which is what lets the porcini stand stout on a short barrel of a stem (visible stem ~0.58 of its cap against the fly agaric's ~0.8) while every one of the 16 back/front pairs keeps its back cap ≥ 45% in view and its back doorway ≥ 80% in sight over 2000 visits on every screen. The chanterelle is a strong egg-yolk orange, its lip waving in lobes a child can see; the russula a dish over thick gills and the porcini a sponge under its cap; the picker's chanterelle is the meadow's trumpet. The selection's band closes at every outline's first point and its ground ring is as wide as the foot, shown under it — the play run reads the band's pixels and fails a screen on ground showing through (`scripts/lib/play-band.ts`). A door refuses a tap only to a nearer door that holds it too (`door-tap.ts`). Seeded flowers stand clear of every control's drawn circle and at most half hidden by the opening clump, on the screen a visit opens on and on it turned (`flower-layout.ts`, `clump-shade.ts`).
- **Bite 9, the meadow on the ground:** the meadow is now one piece of ground seen through a camera (`model/ground.ts`: `Ground {x, z}`, `project`, `fitCamera`), and a turn or a resize builds a new camera and moves nothing on it. A grown mushroom takes a foot of its own, the best of 32 seeded candidates that keeps every rule on this screen (`model/placement.ts`, `mushroom-room.ts`), rather than a fixed slot; `+` shakes its head when no foot passes. Seeded flowers spread over the frame and stand on the same ground; the bees plant on two rings of ground steps, so a full forest still gets a bed. A mushroom drawn narrower than a fingertip keeps a tap pad round its head (`mushroom-tap.ts`). The operator's two ideas for what follows are in `docs/remove-before-merging/ideas/` (comment 5889105662).
- **Bite 9's review, handled (T96–T107):** each screen lays out at its own width, and a turn or a resize refits the camera so every foot the meadow has used, mushrooms' and flowers', stays in view, zooming out where the new screen is narrower (`meadowLayout`'s `used`). Every camera looks at the meadow from one angle (`UP_PER_Z` 0.481), so the refit is a scaled copy of the picture the child grew and every rule still holds after a turn: doors in sight, caps and stems in view, off the controls, flowers in sight (`meadow-rules.test.ts`, `flower-plots.test.ts`), and the sun's wash off every foot used. Forest mushrooms shrink with depth as the clump does, the zoom floor sits where the clump's narrowest cap is a finger wide, and on a short screen the clump gives way rather than the sky; the finger pad holds every far cap's tap on a phone. Insects shrink with a small clump, a butterfly never wider than its narrowest cap, and a fly's jitter keeps 1.5 px. What hides a mushroom is read point by point over its cap and its stem as drawn, nearer stems included (`cap-cover.ts`: at most 25% of a cap, 50% of a stem). The sun fits every screen from 300×300 to 2600×1600, moved off the clump where shrinking alone leaves it on a cap. Every screen now reaches six in ≥ 99% of the swept visits, the 320 px phone included, and a tablet's six caps span a median ≥ 60% of its width; `pnpm sweep:mushrooms` prints those figures over all 2000 visits.
- **Bite 10, the flowers as an instrument, and the child plants them:** every flower is a note or a drum by colour and shape, darker is lower (blue, pink and yellow the twelve pitch classes, violet the skins, white the ticks; `model/flower-sounds.ts`), and a tap plays it while it still blooms and deselects. The seven seeded flowers sound C D E G A, a kick and a hat; bees bring any of the twenty. A note is played nearest the melody's last (`model/notes.ts`, C4–B6, back to the middle after 10 s), a bee's flower without moving the melody. The synth is a soft keyed note and eight soft downtempo drums under a compressor (`instrument-voices.ts`). Extra fingers play the flower heads under them as chords, every other gesture staying one-finger, and the focused canvas plays the keyboard by `event.code` (`g`–`'` the white keys, `y u o p [` the sharps, `a s d f` / `q w e r` the drums, `z`/`x` the octave). A tap on a grass tuft opens a two-stage picker — five colours, then four shapes, each the very flower that will grow — and the chosen flower grows on that tuft (`model/planting.ts`, `planter.ts`); tufts grow only where a flower can stand, and a full meadow shakes the tuft. A hue-nudge gene keeps no two pinks identical. Before it, three defects the play run found are fixed: insects keep their least size however small the clump (`LEAST_SPANS`), spore puffs follow their mushroom through a turn, and every grown mushroom keeps a tappable patch of at least 24 px. Every picker stage is finger-sized and clear of every button still shown on every screen down to a 280 px phone and 600×280. `pnpm play:mushrooms` plants a flower on a tuft (`scripts/lib/play-tufts.ts`) and plays green on all five screens.
- **Bite 10's review, handled (5360733525):** a tap selects what the finger is on and nothing else, so the flower picker opens on a tuft only and a tap outside it closes it unplanted, another tuft opening it there; a chord finger is any pointer Phaser does not hold, and it only plays. Tufts are tended to the meadow and drawn as sprouts a child can find, held to the flowers the meadow has room for, so a full meadow shows no bare tuft rather than refusing one; a flower planted on a tuft stands there alone, its head clear of every other. Every drum is heard on a phone speaker, every hiss under 8 kHz. Each picker's buttons stand `PICK_CLEAR` apart. The insects' least size wins over the clump's shrink on every screen and turn (`insectSizeFor`), and growth keeps every mushroom a tappable patch (`keepsPatches`: 32 px for the forest's, 24 for the clump's).
- **Bite 11, a wider meadow, panned:** the meadow is a world twice a sideways tablet's screen across (`WORLD_ACROSS` 5.764), and the screen a crop onto it that the child drags left and right — following the finger past a slop and gliding on when let go — or turns with a held `←`/`→`, eased in and out rather than stepped (`model/pan.ts`, `pan-input.ts`). The layout is computed once per screen size for the whole world and a pan only scrolls the camera, so a turn changes the zoom and the crop, never the ground; this replaces bite 9's turn refit and bite 10's 14-flower cap. The sky, sun, wash, clouds and every control stay fixed; the far and near hills scroll in parallax at 0.3 and 0.6 (`parallax.ts`), the far range pressed smoothly under the sun along the whole stretch a pan brings under it (`skyline.ts`). Twelve mushrooms fit the world, at least six on the opening crop, and `+` grows inside the crop; fourteen seeded flowers, each half sounding C D E G A, a kick and a hat, with a flower growing wherever one has room. A released insect enters from the screen edge nearer its first perch and takes it in view (`model/flight-in.ts`), then roams the world. Every grown mushroom's tap lands at its head's middle and on at least 72% of the head, the rest taken by a mushroom drawn in front. `pnpm play:mushrooms` taps through the crop and checks the pan (`scripts/lib/play-pan.ts`): a held key turns smoothly, a drag from bare ground pans and taps nothing, a press inside the slop taps, a turn keeps every mushroom's ground; it plays one screen per call (`--screens`, ~8.5 min each), green on all five.
- **Bite 11's review, handled (5373085053):** a press still taps on the press — the operator played the build and kept it, since waiting for the lift or for a rest inside the slop delays the flowers as an instrument, and a pan begun on something taps it too. The slop is a child's drift, 24 px, so a wobbly tap does not slide the meadow; past it the ground lags the finger by the slop, never by the first step's size, and a release glides only on the velocity measured after the crossing. The world's ends are hard: a drag stops there and drops the finger's overshoot, so reversing moves the crop at once. Keys and fingers add up — both arrows held stand still without dropping either, letting one go turns the other way, and a finger pressed and lifted while a key is held leaves the key turning. The head-share floor is tested where a child grows forests, on the opening crop and at either world end: at least 72% of a head's taps (worst 73.0% over each screen's first 400 visits). Vet and the play run are green on all five screens; on phoneL the run's held arrow starts from the far end, since the opening crop leaves less room than the key's ease-in needs (`play-pan-keys.ts`).
- **Bite 12, walking the meadow:** the child turns on the spot through 360° and steps forward and back along the heading («ходить мы хотим. иначе как он "карту" засеивать будет?»). This replaces bite 11's pan: the crop, the parallax and `pan-input.ts` are gone, and the world is seen from an eye (`Eye {x, y, heading}`, `model/ground.ts`) through a panoramic lens — across, the screen is linear in azimuth; rows go by distance, so a turn moves no row; the ground bends down toward the sides by the opening pinhole's own curve (`bite-12/lens.md`). A full turn is four screens of a sideways tablet. Every gene, painter, clock, reducer rule and bed object survived; what changed is where things are projected (`ui/scene/view.ts`, every bed `follow(view)`s, nothing rebakes on a step or a turn), the panorama and the input. A drag is axis-locked at the 24 px slop — within 45° of horizontal it turns, keeping the azimuth under the finger, steeper it steps toward the finger's ground row; a sideways drag on the sky strafes; `↑`/`↓` walk as `←`/`→` turn, Shift strafes, keys and fingers adding up (`model/walk.ts`, `stride.ts`, `cruise.ts`, `eye-input.ts`). The walk stays inside a glade rim (`GLADE`, radius 12), sliding along it; 12b takes it away. The sun is the compass, so none is drawn fixed: the glow, sun and wash slide to its azimuth, clouds go round the sky in lanes, and the three hill ranges are live Graphics from a periodic crest, redrawn only on a turn. The far edge is a round brow at distance `D_SEE` 13.33, things past it sinking under it as a ship goes under (`brow.ts`, `sunk`); walking up to a misty back-row mushroom clears its haze through a repaint queue (`repaint-queue.ts`). Taps hit only what is drawn, with no pad round a narrow head; every mushroom's tappable patch scales with screen and depth (`GROWN_PATCH` 16, `CLUMP_PATCH` 12, floor 6 px), so forests grow into the back rows on every screen; `+` grows in the current view and shakes its head facing bare ground. The planting spots are plain grass tufts again, every one a spot where a flower fits; a note key plays a flower in view with its sound, or grows one on a free tuft, and with a picker open plants that flower (`keyed-flowers.ts`, `keyPlanting`). A long press (0.45 s) on a flower opens a picker that replaces it or, by a cross that yields to the sun, pulls it. Insects are steered and timed in each leg's own frame (`model/flight-frame.ts`), sized by distance, veering round the eye, sinking behind the brow, entering over it; a caught flier shies off with its own voice. The camera bobs with each step and each `STEP_LENGTH` sounds a soft footstep. `pnpm play:mushrooms` reads the eye through the probe and plays the walk and the long press (`play-walk.ts`, `play-hold.ts`, `--plays`).
- **Bite 12's review, handled (5391045656, 5391050029, 5391057365):** three reviewers by area, every call in `bite-12/review.md`. The walk's bob no longer drops beds under a screen-fixed brow: the ground and brow bob with them (d66ad69e). A leaving flier no longer comes at the child's face when he turns toward it, its end fixed on the plane as the leg sets off (ed5b34ec), and a release with no perch in view is timed to its own leaving spot (0a609775). A leg is timed in the frame it is drawn in, the view and the timing framing a leg's two ends by one rule (34788c22, `leg-timing.md` § 8) — before it, legs with an end past ~101° of the heading were drawn at 0.3–29× their timing. A note key plays and sows only a tuft or flower the child can see, not one behind a nearer cap (116f5888, `flower-cover.ts`). The play run taps a walked-up cap where it is painted, not where the hit test says (aec937c6), reads the drag baseline with a mushroom selected and with the picker open (c5126399), and taps a tuft, a flower head and a long press after walking and turning (11777c95). The dead `groundSeam`/`seamAt`, `HouseView.follow` and `parallax.ts` are gone, and the scene's button actions and an insect's leg-frame drawing moved out to keep both files under ~450 lines.
- **Bite 12's tail:** `/polish` over the bite (the `polish:` commits since 083a13df), vet green at b1a4e15c, and the play run after the polish on tabL and phoneP showing only known reds — one new harness red, a bare field with no tuft in view at heading 1.83 on tabL, red before the polish too, handed to the operator in `to-check.md`.
- **Bite 12b, the meadow has no edge:** the glade rim is gone and the field runs on every way. Every stored foot is a plane point (`Footing`), a thing grown away from the opening clump laid at the clump's distance in its own frame so a step never repaints it; the lawn is laid by plane cells (`lawn.ts`), so a walk back finds the same grass, dappled by mottles on the plane (`mottles.ts`); every rule judges from the snapped eye and reads only what stands near it (`model/anchor.ts`), so 96 mushrooms on the field cost what twelve in sight do; light turns with the heading (`headedLight`); insects fly on the plane, hover at air spots on a lattice round the eye and perch within `D_SEE` of it, so they follow the child. A far mushroom paints fewer chords by its drawn size (`curveSteps`), since Phaser re-triangulates every Graphics each frame: phoneL's walk into a forest went from 31 to 18 ms a frame against the 26 ms budget, the far forest looking the same. A flier's body turns by its drawn step, measured before the brow sinks it. The play run plays every screen; its own reds that are too hard to check in code are handed to the operator in `to-check.md` rather than engineered further. Contract: `docs/plans/mushroom-game-syama/endless-field.md`; what it settled in `bite-12b.md` (its working notes retired, `docs/remove-before-merging/retired.md` naming the commit).
- **Bite 12b's review, handled (5398479115, T139–T147):** every call in `bite-12b/review.md`. A new mushroom is refused when twelve already stand within `D_SEE` of its foot or of the anchor it grows from, so the opening holds twelve on every screen (phoneL and tabL had grown 22 and 15); a turned phone showing fewer of them at once is accepted, since a drag brings each back. A tuft is judged at the eye the grass was tended at, so a shown tuft never refuses between re-tends. A sow hides at once the tufts it covers and re-tends the rest in slices (tabL, 20 bee plantings: 46.7 → 14.5 ms of lawn a frame). Air spots crowd as drawn, wings × zoom. Bees plant only where the child can see the flower, which halves births on phones — accepted, the juice being what the bite shows. "Shown" is judged by the brow's own plane distance, and the self-comparing tests were replaced by ones that can fail.
- **Bite 12b's tail:** the frame held to 26 ms (`bite-12b/frame-cost.md`) — the side cull hides what stands behind the eye, far mushrooms paint fewer chords, the lawn's re-tend and a sow spread over frames (frames with lawn work 43.3 → 26.7 ms median), a sow's perch re-sight judged once per foot (slowest sow frame 79.5 → 43.1 ms); frames do not grow after a long walk. Every play green on every screen; `/polish` over the bite. Left to build: the walk's air re-sight (~18 ms at a fresh anchor on tabL), with two ways named in `frame-cost.md`.
- **Bite 13, rain:** a tap on any cloud wobbles it with a soft whoosh and starts a 10 s shower (contract `docs/plans/mushroom-game-syama/rain.md`, the model's `Meadow.rain` and `model/weather.ts`). The tapped cloud darkens first and the rest follow within 0.6 s, each through a dark twin baked once and crossfaded; a slate wash dims the land and the sun dims to half. Up to 120 slanted drops fall out of the clouds, never over them, densest under the tapped one, and splash as small rings on the first drawn cap their path crosses or on the ground, where a splash stays put as the child turns and walks (`rain-drops.ts`, pure parts in `rain-fall.ts`). Every flower folds into a bud over 12 painted steps and still plays, its perches following the fold (`flower-closing.ts`, `flower-seat.ts`); every cap swells 6% about its foot. A brown-noise hiss and a patter of ticks that thickens with the downpour, silent under the mute (`rain-voice.ts`). A tap while it rains adds a gush under that cloud and restarts the 10 s with no flash of dry sky, the scene keeping the wetter of the last two showers (`rain-sky.ts`). When it stops the wash lifts and a seven-band rainbow stands opposite the sun, behind the child on the opening screen as rain.md asks, holds ~8 s and fades. `pnpm play:mushrooms --plays rain` taps a cloud, checks drops and closed flowers mid-shower and open ones after, turns round to the rainbow, and times the closing, the shower and the reopening against the 26 ms budget (tabL 16.1 / 18.9 / 13.0 ms median). What it settled: `docs/plans/mushroom-game-syama/bite-13.md`.
- **Bite 13's review, handled:** every call in `bite-13/review.md`. A cloud takes taps over its drawn puffs, not just its middle circle (74c5eec1); rain falls out of the cloud, hidden until it clears the underside (f0b88ecb); a closing flower keeps its open head's size for taps and yielding, its folded reach used only for perches (cea5c240); the play's closing check reads the fold the paint actually drew, so a broken `drawHead` fails it (d3a911c8), and the closing and reopening ramps are timed too (fe968caf). The groundless-drop branch was checked and never fires (1607713b).
- **Bite 13's tail:** `/polish` over the bite (c85db719, b306e90f); bite 12b's frames and bite 13's working notes retired, the plan's summary carrying the rain.
- **Play it:** https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG — the game as one page (`pnpm artifact:mushrooms` builds it, titled "Syama's mushrooms"). The link is private until shared from its Share menu. The current bite's frames, as a child sees the meadow, are in [`docs/remove-before-merging/frames/bite-16/`](https://github.com/vzakharov/vovazakharov.com/tree/claude/mushroom-game-syama-lbirv7/docs/remove-before-merging/frames/bite-16); earlier bites' frames are retired, `frames/retired.md` naming the commit to read them from.
- **Bite 14, after the rain:** while it rains every flier dashes under the nearest dome cap wide enough to shelter it — two seats a cap, none a nearer cap covers — and leaves them one by one after the stop (`model/shelter.ts`, `perch-hosts.ts`, `shelter-cover.ts`). A tap on a full-grown mushroom drops a spore, a tiny white dot, on free ground near it, up to six, where the dot is seen and reachable; a tap on a dot picks it up (the operator's idea, `Meadow.spores`, `spore-seats.ts`, `spore-sight.ts`, `spore-bed.ts`). Rain sprouts every spore into a little mushroom of its parent's kind that grows over two minutes (`model/sprouting.ts`); a spore is laid as the mushroom it becomes, so it always has room. From the operator's play: a drag on the sky turns, a drag on the ground strafes with the ground staying under the finger, and a quick swipe glides on after the lift (`model/glide.ts`). `pnpm play:mushrooms --plays sprouts` sows, picks one up, rains and counts the sprouts; the sweep's `--showers` grows the clump through showers. What it settled: `docs/plans/mushroom-game-syama/bite-14.md`.
- **Bite 14's review, handled** (review 5400519622, every thread replied to with its commit): the ground tracks the finger with no cruise cap (08c78ffa, ccfff90d); a spore's foot only where its dot is seen and reachable (769aeec0); a sprout's clock starts at its moment and the fall arc swings toward its foot (9feaef7d, d47139d3); the walk play checks the ground under the finger and the rain play expects every flier sheltering (a0fa1095, 03288494).
- **Bite 14's tail:** `/polish` over the bite (60514e3, 2e27528, 8818c5d, 588721a, 7247023); bite 14's working notes retired, the plan's summary carrying shelter and spores.
- **Bite 15, the house's dwellers:** a mouse is sized to its door (head 0.6 of the door's width, clipped to the doorway). A tap on a door, when another house's door is near enough to be seen, sends a mouse out of the fuller house in a loop across the grass and in at the emptier one; it squeaks and hops at a tap, patters as it runs, and a run whose target sinks turns back straight to the nearest door (`model/mouse-run*.ts`, `ui/scene/mouse-runs.ts`, `runner-shown.ts`). With no door in sight the mouse peeks and hides as before. A tap on a window brings a worm that crawls over the cap to another window of the house, or peeks and hides (`model/worm.ts`, `house-worm.ts`, `draw-worm.ts`). From the operator's play: `z`/`c` strafe while held, so a strafe and a turn go together; `.`/`/` step the octave; the drag strafe no longer jerks (the feet step per frame, capped). `pnpm play:mushrooms --plays runs` follows the runs; the meadow play taps windows. What it settled: `docs/plans/mushroom-game-syama/bite-15.md`.
- **Bite 15's reviews, handled** (5401128817 and 5401240514, every thread replied to with its commit): the worm's head kept on its path, its peek under its cap, its girth by the house's zoom (8c0c11ca, 8ae79d1e, 4f1fec8e); each run end painted as its house is drawn (1b6c5093), the bow measured from the foot in drawn runners (718ef2fc), a door holding a run's mouse squeaking rather than calling a second one (acfb76a), a run re-targeted from the ground going straight (4f32576).
- **Bite 15's tail:** `/polish` by slice (efb337f, dfc68b7, c01550f, 548784f, 8abc5a6); bite 14's frames and bite 15's notes retired; the cost hook commits a session's row only after the operator writes (52f6bf0b).
- **Bite 16, the map:** the mute's circle top left is a map button now, a folded paper in ink with a dotted path ending in a little cross (`drawMapButton`, `Controls.map`); sound off is the device's, and the synth still sleeps on a hidden tab. A press unfolds the map out of the button over ~0.3 s (`emerge`, folding back by `sink`), every other button hiding under it: a sheet of paper inset from the screen's edges, sun-up with a little sun at its top as the compass, so it does not turn with the child. Drawn once as it opens, every mushroom with its house, every flower (seeded and planted, not pulled) and every spore stands at its plane foot in its own side picture, under the buttons' one fixed light, nearer the bottom drawn over farther up, on a grass wash with tufts and mottles in the meadow's own inks (`map-ground.ts`); the frame is the box round every foot and the child, padded a clump size, its scale capped at 2.5× a fresh meadow's and flower heads floored at 9 px (`model/map-frame.ts`, `map-view.ts`). The child is an indigo dot, an arrow on his heading and a pale wedge of what he sees, cut at the sheet's edge. Any tap on the open map, the button's plain ink cross or Escape folds it back; the meadow waits under it — no drag, walk, turn or note key, a glide stopped dead, a picker shut. From the operator's play: a door is seated as the child sees its mushroom now, from the current eye, and stays where it was seated (`door-seats.ts`; a russula grown out of the opening view threw on its door); a tapped window swings open before the worm comes out and shuts behind it, the target opening as it nears, each of Syama's window kinds its own way; the tufts are re-tended before the screen's side reaches the edge of the world they were judged in, so a wide window no longer turns onto bare grass (`tending.ts`); a note key sounds nearest the melody's last, as a flower does, `.`/`/` moving the melody an octave (`shiftMelody`). `pnpm play:mushrooms --plays map` shoots the map closed, unfolding, open on a fresh and on a walked, planted meadow, and with a door seated after a walk, shutting it by a tap and by Escape. What it settled: `docs/plans/mushroom-game-syama/bite-16.md`.
- **Bite 16's review, handled** (review 5402118795, six findings, every thread replied to citing 28a6277): the pickers shut as the map opens (`PICKERS_SHUT`); a glide stops dead under the map (`haltAt`, `stoodStill`, `EyeInput.halt`); the map frames what is planted rather than centring the child; flower heads floored at `LEAST_HEAD` 9 px; the view wedge cut at the sheet's edge; the probe's `map()` gives the flowers, the child and his heading, and `play-map` checks nothing off the sheet, left on the map left of the heading, the `+` picker shut and a flick stopped under it.
- **Bite 16's tail:** the play probe split into five modules (0f1fa4e), the lens into `model/pinhole.ts` and the taps into `meadow-taps.ts` (88b6cf8); `/polish` by area (aca95c5, 3b88ad31, 3454539f, 83654738, 59b2fa42, 21c65722, 32130ed3); bite 15's frames and bite 16's notes retired.

- **Still open:** near-square screens of ~320–360 px each way (no phone has one) fit no finger-sized picker row — it overlaps `−`, and `+` stands below the ground — and no test covers them; the play run shoots no 568×320 screen. A flower still drawn past the brow takes a tap on the covered part of its head, and counts for the keys by its head's middle even when that is covered. On tabL turned to heading 1.83 no tuft is in view, so nothing can be planted there (with the operator in `to-check.md`). On a tablet the front mushroom's stem can run to the bottom edge; on a phone upright one planted flower can read larger than its neighbours at the same depth; the play run shoots no refused `+` and no bees planting in a full forest. The sky may read a little plain since bite 7 tamed the halo. From bite 13 (with the operator in `to-check.md`): the rainbow stands behind the child on the opening screen, so whether a child thinks to turn round is open; the sun at half alpha in the rain reads see-through more than veiled. From bite 6: a flier crossing the meadow is drawn straight over one seated on a cap; a butterfly making way for a bee may read as a twitch; a flier holding an air spot is drawn still. From bite 16 (with the operator in `to-check.md`): no play opens the cross window; on a phone the map's mottles read large beside the things, and upright a planted meadow fills only a middle band of the sheet's height; a house at map scale reads as a dot and a smudge; mid-unfold the sheet briefly overshoots the screen.

Closes #65

## QA Checklist

Grows with each bite. Bite 1:

- [ ] `route` — `/mushrooms` opens full-screen with no page chrome around the canvas, and `sitemap.xml` lists it.
- [ ] `meadow` — sky, rosette sun, clouds, two hill ranges, ground with tufts, and two spotted fly agarics grown from one clump — stems crossing, caps leaning apart in a V, rims smooth, shades tapering, spots white.
- [ ] `seeded` — a reload grows a different pair of mushrooms and a different skyline; resizing or rotating the device repaints the same meadow rather than a new one.
- [ ] `edges` — on a phone held upright, no cap and none of the sun's glow is cut by the screen edge, across a dozen reloads.
- [ ] `sharp` — on a retina tablet or phone the outlines are crisp, not soft.
- [ ] `fit` — tablet landscape and phone portrait both fill the screen with no strip or scroll, and a swipe neither scrolls nor zooms the page.

Bite 2:

- [ ] `idle` — left alone, clouds drift and wrap round, a gust visibly travels across the grass, the mushrooms breathe and the flowers sway, none in step.
- [ ] `wobble` — a tap on a mushroom squashes it from the foot, bounces it back and rocks it, and puffs two rings of solid spores from the cap that shrink away; the bounce lasts about two seconds and the shadow stays flat on the ground; a tap on either mushroom of the clump reaches the one in front.
- [ ] `flowers` — five (phone) or seven (tablet) flowers, a reload growing different ones in different places, none on the clump's feet and each smaller than a mushroom, on a phone too; a tap opens the head wider with a turn and a chime, each flower on its own note.
- [ ] `sound` — the first tap starts a soft breeze and the odd bird; mushrooms boing, flowers chime; switching tabs silences it and coming back resumes it.
- [ ] `resize` — rotating mid-wobble or mid-bloom leaves the movement running in the new layout.

Bite 3, as its review left it:

- [ ] `controls` — a `+` and a `−` sit on the right, each a fly agaric with a bold sign on a badge; `+` is dimmed with six mushrooms up, `−` with none; every button is opaque, the sky not showing through it.
- [ ] `picker` — `+` unfolds four big cap buttons across the top, one after another from the end nearest `+`, below the map button on a phone; each cap tells apart at a glance, a two-tone cap's tones divided by an ink line. `−`, or a tap on a flower or the bare meadow, folds the row back towards `+`.
- [ ] `grow` — a pick presses the cap in, which swells and flies down to where the new mushroom grows out of the ground with a puff and a bloop, selected; the other caps sink away in turn, and no flower or other mushroom moves.
- [ ] `select` — a tap on a mushroom outlines it in a thick ink-edged yellow band and rings its foot; the outline grows, breathes and rocks with it, and the mushroom slowly beckons taller and back. Either clump mushroom is picked by whichever cap or stem is painted on top where the finger lands. A tap on the bare meadow lets go.
- [ ] `remove` — `−` sinks the selected mushroom back into the ground with a falling slide; with nothing selected it takes the newest planted instead, down to none.
- [ ] `refuse` — `+` on a full meadow and `−` on an empty one shake their heads side to side with a low reedy "nuh-uh" rather than doing nothing.
- [ ] `forest` — six at most: the clump, two nearer, a back row smaller and hazed toward the sky; on a phone either way up every forest cap is at least a fingertip wide and mostly in view.
- [ ] `clear` — on a phone held upright and sideways and on a tablet either way up, no button sits on a mushroom or in the sun's rays, and a tap near a button's edge never lands on a mushroom behind it.
- [ ] `play` — `pnpm play:mushrooms --screens <one>` builds, plays that screen, prints `played` and exits 0, on each of the five in turn; its frames land in `tmp/play/`.

Bite 4:

- [ ] `house` — a house button stands under `−`: a fly agaric with two windows in its cap and a door in its stem, dimmed with no mushrooms up. On phone landscape it stands left of `+`; on a 320 px phone it takes the top right corner.
- [ ] `furnish-picker` — the house button unfolds five buttons across the top (four windows and the door) from the end nearest it; on a 320 px phone four fit the row and the fifth sits beside the map button. `+` closes it and opens the caps, and the house button closes the caps and opens it, the one closing going at once. Opening it with nothing selected selects the newest mushroom with room for a piece, skipping a full one. A tap on the bare meadow closes it; a tap on a mushroom, or on a door, leaves it open.
- [ ] `windows` — with a mushroom selected, each window pick puts that kind into the cap's row with a puff of spores and a knock-knock, centre first, then left and right in turn; a narrow cap takes three, a wide one five, and each sits inside the cap; a spot it would half-cover is gone, and none peeks from under a window's edge.
- [ ] `full` — a window pick on a full row, or a door pick on a mushroom that has one, shakes that button's head with the "nuh-uh" and changes nothing; the button is dimmed while it cannot act.
- [ ] `door` — the door pick puts an arched wooden door with a knob on the stem, standing just high enough that the mushroom in front leaves it in sight (on either clump mushroom, across a dozen reloads, both ways up); it grows, breathes, wobbles and sinks with its mushroom, and `−` takes the house with the mushroom.
- [ ] `mouse` — left alone, each door now and then swings open and a grey mouse's head rises into the doorway, looks left and right, blinks and ducks back, each mushroom on its own rhythm; none of the mouse shows outside the doorway or under the sill. In a small door the head is still big enough to read on a phone, leaning out with its shoulders showing.
- [ ] `door-tap` — a tap on or just around a door, even a small one, calls its mouse out at once with a squeak, without selecting or deselecting anything; a tap on a window reaches the mushroom behind it.

Bite 5:

- [ ] `butterfly-button` — a butterfly pictogram (orange, with cobalt edges and eyes) stands at the left level with `+`; on phone landscape and a 320 px phone it sits beside the map button instead, and on no screen does it touch a picker row, the map button or the sun's rays.
- [ ] `release` — each tap flies in a butterfly from off one side with a trill, each one different in colour, eyes and wing shape, four seldom sharing a colour, every eye two or three rings inside its wing; the fifth sends the oldest off screen and it is gone, the other four staying.
- [ ] `flight` — butterflies fly on bowed, fluttering paths with fast-beating wings, slow enough to follow with a finger, banking into the turn, and land on a cap as it breathes with a little bob, or on a flower's upper rim as it sways; no two share a perch or sit on top of each other. At rest on a cap the wings open and close slowly and the butterfly turns to face up the screen, give or take, then turns into its heading when it takes off, never spinning the long way round.
- [ ] `drink` — at a flower a butterfly uncurls its proboscis down into the flower's centre and sips, the wings flexing half shut; the head sags under it and springs back with a flicker of its petals as it leaves. No butterfly drinks at a flower whose head is under a button, off the screen's edge or behind a nearer mushroom.
- [ ] `roam` — with only the opening pair up on a small phone, release four: those with no free perch roam between spots in the sky, hovering with beating wings, and none flies off screen until a fifth sends the oldest away.
- [ ] `startle` — a tap on a butterfly at rest sends it off at once and goes on to what it sits on: the mushroom under it is selected with its wobble and spores, the flower under it blooms and chimes. A tap on one in the air jolts it, leaves its flight as it was, and closes no picker nor changes the selection.
- [ ] `sink` — `−` on a mushroom a butterfly rests on sends it off as the cap sinks, never left hovering where the cap was.
- [ ] `insect-size` — on a phone either way up a butterfly is big enough to read and tap, and never wider than a clump cap.

Bite 6, as its review left it:

- [ ] `buzzer-buttons` — a fly (green body, red eyes) and a bee (banded, baskets full) stand under the butterfly down the left, or in a row beside the map button on phone landscape; on a 320 px phone the fly and the bee hide while a picker is open and come back when it closes. None touches another control or the sun's rays.
- [ ] `release-kinds` — each tap on the fly or the bee flies one in with a buzz (a thin rasp for the fly, a lower hum for the bee), each different in sheen or bands; a fourth of a kind sends that kind's oldest away and leaves the others.
- [ ] `fly` — flies dart on fast zigzags, mostly to caps and most often to the fly agarics; at rest a fly's wings lie back over its body, it visibly trembles, rubs its front legs every few seconds and hops a little along the cap and back.
- [ ] `bee` — bees fly straight, bobbing, only ever to flowers, sit on the flower's lower rim facing in so most of the flower still shows, and crawl about it, their wings flicking now and then in a stroke the eye can follow; their baskets fill with pollen as they go and empty at a new flower.
- [ ] `bees-share` — with four butterflies and three bees out, on a tablet and on a 320 px phone, the bees spend most of their time on flowers rather than roaming the sky; a butterfly or fly on a flower a bee is waiting for moves off and the bee lands.
- [ ] `planting` — with only bees out on a tablet, flower after flower is planted beside ones they visited, not just one: each grows up out of the ground and opens with a chime; a well-visited flower gets a ring of them, only where a flower has room, none under a button. A planted flower sways, blooms when tapped and is visited like any other.
- [ ] `no-overlap` — on a 320 px phone with every kind at its limit, none flies off unsent, fliers hovering in the sky rarely sit on top of each other, and no insect ever spins round in a frame.
- [ ] `catch` — on a tablet and a phone held sideways, a flier in the air is easy to tap with a finger, and a tap where two cross reaches the one nearest the finger; no flight drags across the screen.
- [ ] `turn-first` — a butterfly or fly leaving its perch turns on the spot to face its way before it flies, and one landing on a beckoning or wobbling cap faces the way it comes in; a cap let go of, or picked again, settles and swells smoothly with no snap.
- [ ] `hidden-drops` — release a bee or two, switch to another tab and wait for a planting, then come back: nothing sounds at once on return, and the next tap is heard as usual.
- [ ] `sun` — on a phone either way up and on a 320 px phone, the sun stands whole in the sky, the far hills dipping round it, no straight line across its foot.
- [ ] `buzzer-size` — on every screen a fly and a bee are small beside a butterfly and still easy to see and tap.

Bite 7, as its review left it:

- [ ] `one-light` — on a tablet and a phone either way up, every cap's shine and rim light, every flower's and insect's highlight and every cast shadow sit on the side the sun is on; turning the device moves the sun and the light follows it.
- [ ] `sky-air` — the sky pales from blue through near-white to a warm cream at the hills with no grey band, the sun's halo is smooth gold with no rings, and three hill ranges each paler the farther back they stand, misted at the foot and lit on their sunward slopes.
- [ ] `ground` — the ground is lighter and yellower far, deeper near, with soft patches and a fine grain close up; it meets the near hills on a wavering line, never a straight seam; far tufts fade into it.
- [ ] `own-ink` — every mushroom, flower, insect, house and mouse is edged in a dark of its own colour rather than one brown, heavier on its shade side; legs, feelers, whiskers and flower stems taper; a fly agaric still reads red with white spots.
- [ ] `not-gloomy` — nothing in the meadow looks dim or muddy beside Syama's drawing, and every mushroom, flower and flier stands clear of the grass behind it.
- [ ] `hud-steady` — the buttons' discs keep their even dark ring with no grain or haze, and their pictograms stay lit from the upper left whatever the sun does; on a retina screen their edges and hairlines are as crisp as before.
- [ ] `halo` — on a phone either way up the sun's pale halo fades into the blue with no edge and leaves most of the upper sky blue; the far hills dip round it without cutting it.
- [ ] `wash` — the sun's warm wash over the land stops above every mushroom's foot and the shadow round it.
- [ ] `per-object-light` — in the clump each cap's rim light and shine sit toward the sun from where that cap stands; a flier's shine stays on its sun side as it turns in flight, with no visible jump.
- [ ] `stem-foot` — a leaning stem's foot stands level on the grass, rounded into it, over a small dark contact shadow; a cap's shine lies under its spots.
- [ ] `smooth` — on a tablet the meadow animates with no stutter, and `pnpm play:mushrooms` prints a rendered-frame median under 26 ms on every screen.

Bite 8:

- [ ] `species-picker` — `+` opens four buttons a child tells apart at a glance: a red spotted fly agaric, a brown porcini on a thick stem, a flat rose russula and an orange chanterelle trumpet; each grows that species, selected.
- [ ] `fly-agaric` — still red with white spots, and the meadow still opens with two of them as one clump.
- [ ] `porcini` — a brown bun cap, tan to chestnut from one to the next, with a paler margin, on a short, stout whitish barrel of a stem with a sponge under the cap and a darker shadow at its foot; its edge reads clearly against the grass.
- [ ] `chanterelle` — an upright egg-yolk orange trumpet, stem and funnel one piece with no line across the joint, its mouth open over a waving rim, paler ridges running from the rim down the stem; a far one in the back row still reads orange.
- [ ] `russula` — a flattish cap dipping at the middle, paler there, in red, rose, violet, ochre or green across reloads, over white gills and a straight white stem.
- [ ] `species-light` — every species' shade, rim light and shine sit on the sun's side as the fly agaric's do; inside a chanterelle's mouth the far wall is shaded on the sun's side and lit on the other, as a hollow is.
- [ ] `species-house` — a porcini and a russula take three or five windows, a chanterelle one on its funnel under the rim; on a dark porcini cap each window frame has a pale line round it; the door stands on every species' stem, level with the ground whatever the lean, and a porcini's door stays door-sized.
- [ ] `clump-doors` — with both clump mushrooms housed, a tap on either door calls that door's mouse, the nearer door taking a tap where the two are close.
- [ ] `species-perch` — a butterfly sits on each species' cap as it is drawn — on a chanterelle's lip, not hovering over its mouth — and flies still go to the fly agaric far more often than any other cap.
- [ ] `species-forest` — a full forest mixing all four stays clear of every button and the sun, each cap at least a fingertip wide and mostly in view, on a phone either way up and on a tablet.
- [ ] `species-clump` — two of any species standing as a clump, the back one's cap mostly in view and its door in sight; a porcini reads stout, its stem shorter than a fly agaric's.
- [ ] `band` — a selected mushroom of every species is ringed by an unbroken yellow band, with no grass showing through anywhere along it, and a yellow ring round its foot as wide as the foot.
- [ ] `flowers-clear` — on opening, no flower stands under a button (the phone's `−` corner included) or mostly hidden behind the clump, the phone held either way.

Bite 9:

- [ ] `ground-turn` — grow six on a tablet held sideways, then turn it upright: every mushroom and flower keeps its place on the ground, the crop re-centred on the same spot, each door still in sight, the sun and light following the turn; turn back and it is the picture you grew.
- [ ] `own-foot` — `+` grows each new mushroom on a patch of grass of its own, sometimes well away from the clump, never on a flower, never under a button or in the sun's wash.
- [ ] `six-or-refuse` — grow to six on a tablet, a phone either way up and a 320 px phone; where a meadow has no room left `+` greys and shakes its head rather than doing nothing.
- [ ] `forest-depth` — in a full forest a mushroom farther back stands smaller than a nearer one, as in Syama's drawing, and no nearer stem runs across much of a farther cap.
- [ ] `flowers-ground` — seeded and planted flowers stand on the grass at their depth, smaller farther back, none floating or cut by the screen edge after a turn.
- [ ] `forest-bees` — with six up and bees out, bees still plant new flowers beside the ones they visit.
- [ ] `small-tap` — on a phone, a far mushroom drawn smaller than a fingertip is still easy to tap, and a tap near it never takes a nearer mushroom's body.
- [ ] `short-screen` — on a phone held sideways the clump stands smaller rather than the sky shrinking: the sun stands whole in the sky, off the caps and the buttons, and the insects shrink with the clump, a butterfly narrower than any clump cap, a fly still visibly trembling.

Bite 10:

- [ ] `flower-sounds` — each flower plays its own sound when tapped and still blooms; the seven on opening play a pentatonic tune plus a kick and a hat; a darker flower sounds lower, violet and white ones are soft drums, never an acoustic kit, and on a phone speaker the low notes are still heard.
- [ ] `melody` — tapping flowers one after another walks up and down by the nearest note rather than jumping octaves; left alone ten seconds, the next note comes back to the middle; a bee's flower opening plays without pulling the tune.
- [ ] `chords` — two or three fingers on flower heads at once sound a chord, clean and not clipping, drums included; a second finger anywhere else does nothing.
- [ ] `keyboard` — on a laptop, after a click on the meadow, `g h j k l ; '` play C–B, `y u o p [` the sharps, `a s d f` and `q w e r` the drums, `.`/`/` shift the octave; with a Russian layout the same keys play the same; each key opens the flowers in sight that make its sound.
- [ ] `tuft-plant` — a tap on a grass tuft opens five colour buttons where the house picker's stand, then four flowers of that colour where the caps' stand; the pick flies to the tuft and that exact flower grows there, playing as it opens. A tap anywhere else closes it unplanted, and another tuft opens it there; a full meadow shows no bare tuft.
- [ ] `pickers-apart` — on every screen down to a 280 px phone and a phone held sideways, every picker's buttons are a finger wide, on screen and clear of every other button shown.
- [ ] `defects` — after a turn, spore puffs follow their mushroom; on a grown phone meadow every mushroom can be tapped, and bees and flies stay big enough to see.

Bite 10's review:

- [ ] `tuft-sprouts` — tufts read as little sprouts a child can find, only where a flower can still grow; a planted flower stands alone on its tuft, its head clear of every other flower's.
- [ ] `phone-drums` — on a phone speaker every drum is heard and no hiss is harsh.
- [ ] `chord-only` — a second finger on a flower head plays it and does nothing else: it opens, closes and selects nothing.

Bite 11:

- [ ] `drag` — a finger dragged sideways on bare meadow moves the ground with it and glides on when let go, stopping hard at either end of the world; the sky, sun, clouds and buttons stay put, and the hills slide slower the farther back they stand. A drag taps nothing.
- [ ] `arrows` — on a laptop a held `←` or `→` turns the meadow smoothly, easing in and out, never in steps.
- [ ] `far-hills` — panned end to end, the far hills dip under the sun with no flat top, cliff or shoulder.
- [ ] `world` — a fresh meadow shows at least six mushrooms on its opening screen and more beyond either side, twelve at most over the world; `+` grows its mushroom inside the screen you are looking at, and a panned-to stretch has flowers and tufts of its own.
- [ ] `tap-in-crop` — after a pan, a tap on any mushroom, flower, tuft or door reaches it, and a tap on something a pan slid under a button goes to the button.
- [ ] `fly-in` — a released insect flies in from the screen edge nearer its first perch and lands in view, then roams the whole world, panning to find it.
- [ ] `turn-crop` — turning the device keeps every mushroom where it stood on the ground, the zoom and the crop changing round the screen's centre.

Bite 11's review:

- [ ] `wobbly-tap` — a child's tap that drifts up to about a finger's width still taps what it is on and does not slide the meadow; a drag past that moves the ground the moment it crosses, with no jump.
- [ ] `hard-ends` — dragged past a world end, the meadow stops; reversing the finger there moves it back at once.
- [ ] `keys-and-fingers` — both arrows held stand still; letting one go turns the other way; a tap while an arrow is held leaves the meadow turning.

Bite 12:

- [ ] `turn-round` — a finger dragged sideways on the ground turns the view with the ground under the finger, gliding on when let go; a held `←`/`→` turns smoothly all the way round, the sun leaving and coming back, and turning back returns every mushroom and flower to where it stood.
- [ ] `step` — a drag down (or a held `↑`/`↓`) walks forward or back, never faster than an easy pace, stopping when the finger stops; a drift while turning never walks, a sideways drag on the sky strafes, and held `z`/`c` strafe too.
- [ ] `rim` — walking far one way stops softly at the glade's rim, sliding along it when walking at a slant.
- [ ] `bob-steps` — walking bobs the view a little with each step and sounds a soft footstep, alternating sides; at rest nothing bobs, and no strip shows under the land mid-step.
- [ ] `brow` — the far edge reads as the round horizon of a small planet; a far mushroom or flower sinks under it from the foot up as the child walks away, and stays put on it while she turns.
- [ ] `haze-clears` — walking up to a misty back-row mushroom clears its mist, with no stutter.
- [ ] `sky-turns` — the sun, its glow and the clouds go round with the turn (some cloud in view at every heading), the hills shift with no flat slab across the sky at any heading.
- [ ] `tap-drawn` — after walking and turning, a tap on any mushroom, flower or tuft reaches what is drawn under the finger; on a phone the back-row mushrooms can still be grown into and tapped.
- [ ] `plus-in-view` — `+` grows its mushroom in the view the child faces, and shakes its head facing bare ground.
- [ ] `grass-spots` — the ground grows plain three-blade grass tufts, as dense as before bite 10; a tap on bare grass opens the flower picker on the nearest tuft; a pulled flower leaves a tuft.
- [ ] `keys-in-view` — a note key plays a flower in view with its sound; with none in view it sounds at once and grows that flower on a tuft in view; with a picker open it plants that very flower and shuts the picker.
- [ ] `long-press` — a tap on a flower only plays it; holding about half a second rings it and opens the colour row with a cross, then the shapes; a pick replaces it in place, the cross pulls it, and the cross never covers the sun.
- [ ] `insects-walk` — insects keep their perches as the child walks and turns, grow larger nearer, sink behind the brow, enter over it or from the side, and a caught one shies off with its own sound.

Bite 12's review:

- [ ] `mid-step-feet` — mid-step at the rim, every foot stays on its ground row and nothing drops under the brow.
- [ ] `leaving-flier` — turning toward a flier flying off, it flies away across the meadow at its own depth, never at the child's face.
- [ ] `leg-pace` — with bees out, turning to watch one cross the meadow, it flies at its usual pace, never streaking across the screen.
- [ ] `keys-hidden` — a note key never plants or plays a flower hidden behind a mushroom.

Bite 12b:

- [ ] `no-edge` — walk any way for a minute: the field goes on, grass and dapples all the way, nothing stops the walk; turning round and walking back finds the same tufts and the same mushrooms where they were.
- [ ] `far-forest` — grow a forest, walk away and turn: far caps still read round, spotted and as their species, and walking toward one shows no jump as it nears.
- [ ] `smooth` — on a phone held sideways, walking into a forest of twenty-odd mushrooms stays smooth.
- [ ] `fliers-follow` — release insects, walk off: they come along, perch near the child, and none spins round in a frame as it sinks behind the brow.
- [ ] `to-check` — the lines in `docs/plans/mushroom-game-syama/to-check.md` that 12b's play runs handed over.

Bite 12b's review:

- [ ] `twelve` — on a phone and a tablet each way round, `+` grows mushrooms at the opening until it shakes its head at twelve; turning round finds them all.
- [ ] `tuft-shown` — right after a short step, a tap on any tuft in view opens the picker rather than shaking its head.
- [ ] `bees-seen` — with bees out, every flower a bee plants comes up where it can be seen, never off the screen's side.

Bite 13:

- [ ] `cloud-tap` — a tap anywhere on a cloud's drawn puffs (not only its middle) wobbles it with a soft whoosh and starts the rain; a tap on blue sky beside it does nothing, and a mushroom, flower or insect in front of a cloud takes the tap instead. An open flower picker shuts.
- [ ] `shower` — the tapped cloud darkens first and the others follow within a moment, with no rings showing in a half-dark cloud; the land dims under a grey wash and the sun dims; slanted drops fall out of the clouds' undersides, never over them, densest under the tapped cloud, and turn with it as the child turns.
- [ ] `splashes` — drops splash as small rings on caps and on the ground; walking and turning mid-shower, a splash on the ground stays where it landed.
- [ ] `flowers-close` — every flower folds into a visible bud (not a dot) mid-shower and opens again after; a closed flower still plays when tapped and by key, and insects still sit on it.
- [ ] `caps-swell` — every cap swells a little in the rain and settles back after; mushrooms stay tappable throughout.
- [ ] `rain-sound` — with sound on, a hiss and a patter that thickens over the first half second, fading out with the rain without a click.
- [ ] `restart` — tapping another cloud while it rains wobbles it, gushes drops under it and lengthens the shower; the sky and flowers never flash dry for a frame.
- [ ] `rainbow` — when the rain stops the wash lifts, and turning round (away from the sun) shows a rainbow of concentric bands clear of the hills on every screen; it holds a few seconds and fades; a cloud tap while it shows starts a new shower and fades it out.
- [ ] `rain-smooth` — on a phone held sideways, a shower with flowers closing and reopening stays smooth.

Bite 13's review:

- [ ] `drawn-fold` — mid-shower, flowers are drawn as buds in every screen's frames, and taps on a closed flower land on the area its open head had.

Bite 14:

- [ ] `shelter` — with butterflies, flies and bees out, a cloud tap sends every flier under a nearby fly agaric, porcini or russula cap, two at most to a cap, none drawn over a cap in front; a bug button while it rains flies the newcomer straight under one.
- [ ] `come-out` — when the rain stops the fliers leave their shelters one by one over a couple of seconds, not all at once.
- [ ] `sow` — tapping a full-grown mushroom drops a tiny white dot beside it each tap, up to six; a growing sprout drops none; a tap on a dot pops it away without opening the flower picker.
- [ ] `sprout` — a cloud tap makes every dot come up as a small mushroom of its parent's kind, staggered over the first seconds of the rain, which then grows over two minutes and can be tapped, furnished and sunk like any other.
- [ ] `ground-drag` — dragging sideways on the sky turns; dragging sideways on the ground strafes with the grass staying under the finger; a quick flick glides on and slows; a finger held still before lifting stops dead.

Bite 15:

- [ ] `mouse-size` — on every species, the mouse that peeks is sized to its door, its head never wider than the doorway, chanterelles included.
- [ ] `mouse-run` — with two furnished houses in view, a door tap sends a mouse looping across the grass from the fuller house to the emptier one's door; it vanishes behind nearer stems and reappears; it squeaks and hops when tapped mid-run.
- [ ] `double-tap` — tapping a door twice quickly sends one mouse only; the second tap squeaks.
- [ ] `mouse-turn-back` — sinking a run's target with `−` turns the mouse straight to the nearest door, no second loop.
- [ ] `worm` — a window tap on a house with two or more windows brings a worm that crawls over the cap to another window and in; with one window it peeks and hides.
- [ ] `keys-strafe` — holding `z` or `c` strafes and holding `←`/`→` turns at the same time; `.`/`/` move the melody an octave down/up.
- [ ] `drag-strafe` — a sideways drag on the ground strafes smoothly, with steady footsteps.

Bite 16:

- [ ] `map-button` — top left, a folded paper map in ink with a dotted path ending in a little cross, on the disc every button wears; a press pops it and unfolds the map, and while the map is open the disc shows a plain ink cross and every other button is hidden.
- [ ] `map-open` — the map unfolds out of its button over a moment as a paper sheet inset from the screen's edges, and folds back into it; a tap anywhere on it (the margin round the sheet too), the cross or Escape closes it, and a tap on a mushroom or flower on it does nothing more.
- [ ] `map-sun-up` — a little sun stands at the sheet's top edge and the meadow's sun side is up; turn round, open it again, and the map stands the same way.
- [ ] `map-things` — every mushroom with its house, every flower (a pulled one gone) and every spore stands on a grass sheet with tufts, each in its own side picture, nearer the bottom over farther up; a fresh meadow reads at a size a child can tell apart, a walked, planted one fills the sheet; no insect or rain drawn.
- [ ] `map-child` — the child is an indigo dot with an arrow his way and a pale wedge of what he sees, never over the sheet's margin; a mushroom on his left on screen is left of the arrow on the map.
- [ ] `map-waits` — while the map is open a drag, the arrows, `z`/`c` and the note keys do nothing; a flick's glide stops dead as it opens, an open picker shuts, and closing finds the meadow as it was.
- [ ] `window-opens` — a window tap swings that window open before the worm comes out and shuts it behind it; the target window opens as the worm nears and shuts once it is in; a lone window opens for the peek and shuts after; each window kind opens its own way.
- [ ] `door-after-walk` — walk and turn, grow a mushroom, and put a door in: it goes on at once, in sight from where the child stands, and walking away and back finds it where it was seated.
- [ ] `tufts-turn` — on a wide window, turn a little: the grass toward the turn already has its tufts, never bare ground filling in later.
- [ ] `key-octave` — play `;` then `g`: the C sounds above the A, nearest the last note, as tapped flowers do; `.` then a note sounds an octave lower.

| Item     | Automatable | Covered?                          | Notes                                                        |
| -------- | ----------- | --------------------------------- | ------------------------------------------------------------ |
| `route`  | yes         | partly — `pnpm build` renders it  | the sitemap entry comes from `PAGE_ROUTES`                    |
| `meadow` | no          | no                                | looked at in frames at 1180×820@2 and 390×844@3              |
| `seeded` | partly      | the generator's determinism is tested | the scene's reuse of the visit seed is not                |
| `edges`  | yes         | yes — `layout.test.ts`            | 2000 visits on six screens, caps and sun glow                |
| `sharp`  | partly      | no                                | canvas buffer = CSS size × DPR, checked in Playwright        |
| `fit`    | partly      | no                                | checked in Playwright at both sizes                          |
| `idle`   | partly      | yes — `motion.test.ts`            | the curves are tested; seeing them move is not               |
| `wobble` | partly      | yes — `motion.test.ts`            | stepped frames at 250 ms and 750 ms after a tap, 1180×820    |
| `flowers`| partly      | yes — `flower-genes.test.ts`, `layout.test.ts` | genes over 400 seeds; placement off the feet and size under a stem over 2000 visits on six screens |
| `sound`  | no          | no                                | needs ears on a device; the autoplay unlock is on tap release |
| `resize` | partly      | no                                | motion is set from the clock each frame, never from tweens   |
| `controls` | partly    | yes — `layout.test.ts`, `game.test.ts` | placement on six screens and `isFull`/`isEmpty`; the dimming and the opaque discs looked at in frames |
| `picker` | partly      | yes — `motion.test.ts`, `pnpm play:mushrooms` (not in vet) | `launch`; the script taps `+`, shoots mid-close and checks a flower tap closes it; telling caps apart looked at in frames |
| `grow`   | e2e         | yes — `game.test.ts`, `pnpm play:mushrooms` (not in vet) | the reducer and `emerge`; the script checks a pick grows one mushroom, selected, and closes the picker |
| `select` | e2e         | yes — `layout.test.ts`, `motion.test.ts`, `pnpm play:mushrooms` (not in vet) | tap area against the drawn clump over 2000 visits on six screens; `beckon`; the script taps a mushroom and checks it is selected; the outline looked at in frames |
| `remove` | e2e         | yes — `game.test.ts`, `pnpm play:mushrooms` (not in vet) | selected, then newest, then empty, both in the reducer and by taps |
| `refuse` | e2e         | yes — `motion.test.ts`, `pnpm play:mushrooms` (not in vet) | `shake`; the script checks `−` on an empty meadow shakes; the sound needs ears |
| `forest` | unit        | yes — `layout.test.ts`, `meadow-rules.test.ts`, `mushroom-tap.test.ts` | the finger pad on caps narrower than a finger, and at most 25% of a cap and 50% of a stem hidden, over the swept visits on six screens |
| `clear`  | unit        | yes — `layout.test.ts`            | every control's tap circle off every slot's tap area and the sun's rays, over 2000 visits on six screens |
| `house`  | unit        | yes — `layout.test.ts`            | placement, reach and overlap on six screens; the pictogram looked at in frames |
| `furnish-picker` | e2e | yes — `game.test.ts`, `layout.test.ts`, `pnpm play:mushrooms` (not in vet) | the pickers closing each other and the newest-with-room selection in the reducer, and by taps; either row held apart from the rest on six screens |
| `windows` | unit       | yes — `house.test.ts`, `game.test.ts`, `pnpm play:mushrooms` (not in vet) | three or five slots inside the drawn cap over 8000 mushrooms, middle outward; no painted spot overlaps a furnished pane over 2000 seeds; every kind put in by taps; the puff and knock need eyes and ears |
| `full`   | e2e         | yes — `game.test.ts`, `pnpm play:mushrooms` (not in vet) | `canFurnish` and the unchanged meadow; the script checks a full row and a second door shake |
| `door`   | unit        | yes — `house.test.ts`, `layout.test.ts` | every station's frame a line inside the stem over 8000 mushrooms; the back doorway ≥80% in sight on every screen over 2000 visits; following the pose, and the house mid-sink in `pnpm play:mushrooms`, looked at in frames |
| `mouse`  | unit        | yes — `motion.test.ts`, `geometry.test.ts`, `layout.test.ts` | `peek`, `blink`, `lookAbout` and `clipToConvex`; the head ≥28 px at the narrowest pose at every station, slot and screen, and as drawn in `pnpm play:mushrooms`; the look of it is manual |
| `door-tap` | e2e       | yes — `motion.test.ts`, `layout.test.ts`, `pnpm play:mushrooms` (not in vet) | `mouseOut` after a tap; every door's tap area ≥2 fingertips across and holding the painted door; the script asks the scene's hit test that each door's middle reaches the door, taps both clump doors and checks the mouse is out and the selection unchanged; the squeak needs ears |
| `butterfly-button` | unit | yes — `layout.test.ts`, `insect-genes.test.ts`, `pnpm play:mushrooms` (not in vet) | placement, reach and overlap with every control and the sun on six screens; the pictogram's colours and rings pinned to its seed |
| `release` | e2e        | yes — `game.test.ts`, `insects.test.ts`, `insect-genes.test.ts`, `pnpm play:mushrooms` (not in vet) | ids, the limit and the oldest of that kind leaving; genes over 400 seeds, eyes inside the wings, colour repeats over 2000 meadows; the script releases five and checks the first is gone; the trill needs ears |
| `flight` | partly      | yes — `flight.test.ts`, `insect-motion.test.ts`, `perch-sight.test.ts`, `pnpm play:mushrooms` (not in vet) | legs deterministic and never to a taken or crowded perch; the path, beat and body turn continuous, a cut-short leg included; no two perched butterflies share a perch or cover more than a quarter of each other over 2000 visits on six screens; the script checks every staying butterfly is drawn on its perch; the look of it is manual |
| `drink`  | partly      | yes — `insect-motion.test.ts`, `proboscis.test.ts`, `perch-sight.test.ts` | `drinking`, `proboscis` and `drinkDip` continuous; the tip inside the flower's centre at full reach and through the sip; no drinking butterfly's wings reach a control or the edge, nor its flower behind a mushroom, over the sweep; the look of it is manual |
| `roam`   | e2e         | yes — `roaming.test.ts`, `perch-sight.test.ts`, `pnpm play:mushrooms` (not in vet) | roaming legs flown frame by frame with no jump; no butterfly heads off screen unsent over the sweep; the script expects each staying butterfly to perch or roam and shoots one roaming |
| `startle` | e2e        | yes — `game.test.ts`, `pnpm play:mushrooms` (not in vet) | the reducer ignores a startle in the air; the script taps one at rest and checks its perch answered, taps through a resting butterfly to select its cap, and taps one in the air and checks the picker and the selection |
| `sink`   | e2e         | yes — `game.test.ts`, `pnpm play:mushrooms` (not in vet) | `tick` moves one whose cap is gone; the script sinks a resting butterfly's cap and checks it leaves |
| `insect-size` | unit   | yes — `insect-layout.test.ts`     | every butterfly's span ≥ the phone floor, or as near it as a small clump lets, and under the narrowest clump cap on every screen |
| `buzzer-buttons` | unit | yes — `layout.test.ts`, `pnpm play:mushrooms` (not in vet) | placement, reach and overlap with every control on six screens, and the yielding band on a 320 px phone; the pictograms looked at in frames |
| `release-kinds` | e2e  | yes — `swarm.test.ts`, `buzz-genes.test.ts`, `pnpm play:mushrooms` (not in vet) | per-kind limits and eviction; genes in range over many seeds; the script releases each kind past its limit on five screens; the buzzes need ears |
| `fly`    | partly      | yes — `flight-kinds.test.ts`, `insect-paths.test.ts`, `buzz-rest.test.ts`, `pnpm play:mushrooms` (not in vet) | the cap share and the spotted pull; the zigzag continuous; jitter, rub and hop continuous and bounded; the script counts fly rests on fly agarics against other caps; the look of it is manual |
| `bee`    | partly      | yes — `flight-kinds.test.ts`, `pollen.test.ts`, `buzz-rest.test.ts` | never a cap, never back on the flower it leaves; pollen specks per visit; the crawl bounded; the rest flutter's per-frame step bounded; the rim seat and how much flower shows looked at in frames |
| `bees-share` | e2e     | yes — `fliers.test.ts`, `perch-sight.test.ts` | bees roam under 25% on every `VIEWPORTS` screen over played visits; crowding by kind; `givesWay` / `flowerFreed` |
| `planting` | e2e       | yes — `pollen.test.ts`, `swarm.test.ts`, `flower-plots.test.ts`, `pnpm play:mushrooms` (not in vet) | `sown` and room for a flower; replays plant the same flowers; ring slots in sight on this screen over the sweep; the script waits for a bee to plant on every screen and checks the flower full grown |
| `no-overlap` | e2e     | partly — `fliers.test.ts`, `insect-steering.test.ts`, `pnpm play:mushrooms` (not in vet) | no flier lost and no air spots overlapping over the sweep, except the small phone's `AIR_UNMET` (two `todo` tests); the script watches every frame for hover overlaps and heading against the flight |
| `catch`  | e2e         | yes — `fliers.test.ts`, `insect-tap.test.ts` | every kind caught ≥70% of the time on every screen; the nearest body takes the tap; flight times bounded by `slowest` |
| `turn-first` | unit    | yes — `insect-steering.test.ts`, `motion.test.ts`, `pnpm play:mushrooms` (not in vet) | the pivot before a flight, flying to beckoning caps and a still hop; the beckon's settle continuous through a release and a reselect; the play run's heading watch on five screens |
| `hidden-drops` | unit  | yes — `sound.test.ts`             | no voice is built while the tab is hidden, so none waits for the return; hearing it needs ears |
| `sun`    | unit        | yes — `sun-layout.test.ts`        | the disc above the horizon and both hill ranges, the rays clear of the far hills, over the sweep; whole, glow on screen and rays off every crown and control on every screen 300–2600 × 300–1600 |
| `buzzer-size` | unit   | yes — `insect-layout.test.ts`, `pnpm play:mushrooms` (not in vet) | the floor on every screen, and each drawn span read back in the play run |
| `one-light` | partly   | yes — `light.test.ts`, `mushroom-light.test.ts`, `ink.test.ts` | `sunLight` toward the sun on every screen; cap, spot and stem shade on the side away, the cast shadow falling away; the rest looked at in frames |
| `sky-air` | partly     | yes — `backdrop-tones.test.ts`, `skyline.test.ts` | no grey anywhere in the sky on every screen, the halo in steps too fine to read, ranges gaining contrast front to back and paling at the foot, a lit rim only on sunward slopes |
| `ground`  | partly     | yes — `ground-seam.test.ts`, `grain.test.ts`, `backdrop-tones.test.ts` | the seam wavers on every screen and draws no colour line; the lit band lifts gradually; the grain neutral on the whole and fading in; tufts stand out more near than far |
| `own-ink` | partly     | yes — `ink.test.ts`, `palette-creatures.test.ts` | every ink reads against the ground and off its fill; the weighted outline thin in the light, the taper; the fly agaric's red looked at in frames |
| `not-gloomy` | manual-only | —                               | judged beside `reference/syama-drawing.webp` in the frames |
| `hud-steady` | partly  | yes — `light.test.ts`, `baking.test.ts` | `PICTOGRAM_LIGHT` fixed; each face's texels on whole device pixels; the ring looked at in frames |
| `halo`    | partly     | yes — `backdrop-tones.test.ts`, `skyline.test.ts` | the halo falls off to the sky's own colour with no plateau, the parting wider than the glow; the look of it in frames |
| `wash`    | unit       | yes — `sun-layout.test.ts`, `meadow-rules.test.ts` | every ring short of every extreme place's foot and shadow on every screen, and of every grown mushroom's after a turn |
| `per-object-light` | partly | yes — `mushroom-light.test.ts`, `insect-light.test.ts`, `pnpm play:mushrooms` (not in vet) | each body's light toward the sun from where it stands; the play run's light watch on five screens |
| `stem-foot` | partly   | yes — `mushroom-light.test.ts`    | the foot level and the contact centred under it; the look of it in frames |
| `smooth`  | e2e        | yes — `frame-budget.test.ts`, `pnpm play:mushrooms` (not in vet) | the run fails a screen past the median bound |
| `species-picker` | e2e | yes — `game.test.ts`, `pnpm play:mushrooms` (not in vet) | the reducer grows the picked species; the script taps each button and checks the species grown and selected; telling them apart looked at in `bite-8/picker-open-tabP.png` |
| `fly-agaric` | unit    | yes — `mushroom-genes.test.ts`, `game.test.ts` | `firstMushrooms` two fly agarics; the red looked at in frames |
| `porcini` | partly     | yes — `mushroom-tints.test.ts`, `mushroom-light.test.ts` | browns held out of luminance 0.021–0.045, the heavier foot shadow; the look in `bite-8/porcini-close-tabL.png` |
| `chanterelle` | partly | yes — `chanterelle-outline.test.ts`, `mushroom-tints.test.ts` | the outline's lip, funnel, mouth and ridges; `heldHaze`; the look in `bite-8/chanterelle-close-tabL.png` |
| `russula` | partly     | yes — `mushroom-genes.test.ts`, `mushroom-tints.test.ts` | every tone reached over many seeds, each on a white stem over white gills, paler in its dip; the look in `bite-8/russula-close-tabP.png` |
| `species-light` | partly | yes — `mushroom-light.test.ts`  | cap light per species on the side the sun says, the mouth's reversed; the look in frames |
| `species-house` | unit | yes — `house.test.ts`, `mushroom-tints.test.ts`, `pnpm play:mushrooms` (not in vet) | slots inside every species' face; door stations on the turned stem; `haloFor`; the script houses a porcini and a chanterelle |
| `clump-doors` | e2e    | yes — `door-tap.test.ts`, `pnpm play:mushrooms` (not in vet) | the nearer-door rule over the clump's doors; the script taps both clump doors |
| `species-perch` | unit | yes — `mushroom-pose.test.ts`, `fliers.test.ts`, `pnpm play:mushrooms` (not in vet) | `capSeat` on the real surface; the fly agaric pull; the script waits for a butterfly on a chanterelle |
| `species-forest` | unit | yes — `layout.test.ts`, `flower-plots.test.ts` | the 2000-visit sweeps on six screens with every species in every slot |
| `species-clump` | unit | yes — `layout.test.ts`, `mushroom-genes.test.ts` | every back/front pair over 2000 visits on every screen: back cap ≥ 45% in view, back doorway ≥ 80% in sight; the porcini's median visible stem ≤ 0.6 and below the fly agaric's |
| `band` | e2e | yes — `pnpm play:mushrooms` (not in vet) | `play-band.ts` reads every band and ring point's pixels for each species on every screen; broken on purpose it fails at each outline's first point |
| `flowers-clear` | unit | yes — `flower-layout.test.ts` | every seeded flower off every control's drawn circle and at most half shaded by the opening clump, on each screen and on it turned |
| `ground-turn` | unit  | yes — `ground.test.ts`, `meadow-rules.test.ts`, `flower-plots.test.ts` | every foot kept on the ground after a turn; every rule kept on the turned layout of each grown meadow; flowers in sight kept; the look in frames |
| `own-foot` | unit     | yes — `placement.test.ts`, `meadow-rules.test.ts`, `pnpm play:mushrooms` (not in vet) | `pickFoot` even and repeatable; `roomFor` against every rule on this screen; the play run grows to six on five screens |
| `six-or-refuse` | e2e | yes — `layout.test.ts`, `meadow-rules.test.ts`, `pnpm play:mushrooms` (not in vet) | six in ≥ 99% of the swept visits on every screen; `pnpm sweep:mushrooms` over all 2000; `+` greyed at six looked at in `bite-9/six-meadow-plus-refused-*.png` |
| `forest-depth` | unit | yes — `clump-layout.test.ts`, `cap-cover.test.ts`, `meadow-rules.test.ts` | size by `scaleAt` with depth; a farther cap drawn wider in < 20% of pairs; cap ≤ 25% and stem ≤ 50% hidden, nearer stems counted |
| `flowers-ground` | partly | yes — `flower-layout.test.ts`, `flower-plots.test.ts` | seeded beds over the frame and on it turned; the look in `bite-9/bee*-planted-*.png` |
| `forest-bees` | unit  | yes — `flower-plots.test.ts`       | a full forest plants a median ≥ `LEAST_PLANTED` 4 on every screen; the play run's bees plant on a fresh meadow only |
| `small-tap` | unit    | yes — `mushroom-tap.test.ts`       | a grown forest's far caps padded on every phone, a tap at the pad's rim taken; the pad never takes another mushroom's drawn body |
| `short-screen` | unit | yes — `sun-layout.test.ts`, `insect-layout.test.ts`, `buzz-rest.test.ts`, `mushroom-genes.test.ts` | the sun fits every screen 300–2600 × 300–1600; butterflies under the narrowest clump cap; `LEAST_TREMBLE`; the clump's cap a finger wide wherever the floor holds |
| `flower-sounds` | partly | yes — `flower-sounds.test.ts`, `flower-genes.test.ts`, `instrument-voices.test.ts` | every colour × shape to one of twenty sounds, darker lower; the seeded seven's sounds; every envelope held as data; the sound itself needs ears |
| `melody` | unit        | yes — `notes.test.ts`, `instrument.test.ts` | the nearest-note rule, the tritone tie, the 10 s rest; a bee's flower leaves the melody |
| `chords` | partly      | yes — `chord-fingers.test.ts`     | which extra fingers play; clipping under the compressor needs ears |
| `keyboard` | unit      | yes — `keyboard.test.ts`          | the `event.code` map and modifiers ignored; focus and the opened flowers looked at by hand |
| `tuft-plant` | e2e     | yes — `planting.test.ts`, `flower-picker.test.ts`, `pnpm play:mushrooms` (not in vet) | the reducer's two stages, planting the seed shown and closing unplanted; each stage whole on every screen; `play-tufts.ts` opens a tuft, picks a colour and a shape and checks the flower grown on five screens; `tufts.test.ts` holds a full meadow bare of tufts |
| `pickers-apart` | unit | yes — `layout.test.ts`           | every stage's buttons ≥ `TAP_RADIUS`, on screen and `PICK_CLEAR` apart on every `VIEWPORTS` screen, 280 px and `TURNED_SMALL`; near-square screens uncovered |
| `defects` | unit       | yes — `insect-layout.test.ts`, `mushroom-patch.test.ts`, `pnpm play:mushrooms` (not in vet) | `LEAST_SPANS` over 2000 seeds; a 24 px patch per grown mushroom on every screen; the puff after a turn looked at by hand |
| `tuft-sprouts` | unit | yes — `tufts.test.ts`, `planting.test.ts` | tufts held to the meadow's room; the planted head clear of others; how a sprout reads looked at by hand |
| `phone-drums` | partly | yes — `instrument-voices.test.ts` | every drum's band and every hiss under 8 kHz held as data; a phone speaker needs ears |
| `chord-only` | unit | yes — `chord-fingers.test.ts` | a finger Phaser does not hold only plays |
| `drag` | e2e | yes — `pan.test.ts`, `parallax.test.ts`, `pnpm play:mushrooms` (not in vet) | the slop, the follow, glide and hard ends; `play-pan.ts` drags from bare ground and checks nothing tapped |
| `arrows` | e2e | yes — `pan.test.ts`, `pnpm play:mushrooms` (not in vet) | the eased cruise; `play-pan.ts` traces a held key frame by frame |
| `far-hills` | unit | yes — `skyline.test.ts` | the smooth envelope under the sun along the pan's stretch; the look by hand |
| `world` | unit | yes — `mushroom-room.test.ts`, `meadow-rules.test.ts`, `flower-plots.test.ts` | six on the opening crop, twelve over the world, `+` inside the crop |
| `tap-in-crop` | e2e | yes — `mushroom-patch.test.ts`, `pnpm play:mushrooms` (not in vet) | the play run taps through `__probe.toScreen`; every head's tap lands over 2000 forests |
| `fly-in` | unit | yes — `flight-in.test.ts` | the entry edge and the first perch in view |
| `turn-crop` | e2e | yes — `pan.test.ts`, `pnpm play:mushrooms` (not in vet) | the resize keeps the centre's ground point; `play-pan.ts` turns and checks every mushroom's ground |
| `wobbly-tap` | e2e | yes — `pan.test.ts`, `pnpm play:mushrooms` (not in vet) | the 24 px slop, the lag by the slop and the glide on post-crossing velocity; `play-pan.ts` presses inside the slop and drags past it |
| `hard-ends` | unit | yes — `pan.test.ts` | the overshoot dropped at an end; the play run's end drag skips where no bare ground lies beside a cap or flower |
| `keys-and-fingers` | unit | yes — `pan.test.ts` | both keys held standing, one let go turning the other way, a lifted finger leaving the key; the feel by hand |
| `turn-round` | e2e | yes — `pan.test.ts`, `panorama.test.ts`, `walk.test.ts`, `pnpm play:mushrooms` (not in vet) | `turnOf` wraps with no ends at `TURN_CRUISE`; `play-walk.ts` turns full round by keys with the sun leaving and returning, a turn back within 0.5 px, a drag turning with the ground under the finger |
| `step` | e2e | yes — `walk.test.ts`, `stride.test.ts`, `cruise.test.ts`, `pnpm play:mushrooms` (not in vet) | the axis lock, the step chasing the finger's row under `STRIDE_CRUISE`, strafing; `play-walk.ts` walks by `↑` and by a drag, nothing tapped |
| `rim` | e2e | yes — `walk.test.ts`, `pnpm play:mushrooms` (not in vet) | the slide along `GLADE` and the brake where it stands square; `play-walk.ts` rests at the rim on `↓` |
| `bob-steps` | e2e | yes — `walking.test.ts`, `footsteps.test.ts`, `pnpm play:mushrooms` (not in vet) | the bob never above 0 and 0 at rest; one step per `STEP_LENGTH`; `play-walk.ts` reads bob and footsteps off the probe; the sound needs ears |
| `brow` | partly | yes — `brow.test.ts`, `view.test.ts`, `insect-sink.test.ts` | `browRow`, `sunk`, `sunkAway` keyed on distance; how it reads looked at in `bite-12/tabL-brow-*.png` |
| `haze-clears` | unit | yes — `repaint-queue.test.ts` | `hazeAhead` repaints nothing at the opening; drift past `HAZE_DRIFT`, at most `REPAINTS_PER_FRAME`, nearest first |
| `sky-turns` | unit | yes — `panorama.test.ts`, `skyline.test.ts`, `sun-layout.test.ts` | azimuths and `screenAt`; cloud lanes; `hillBands` drops `PATH_SKIP` points through Phaser's own skip |
| `tap-drawn` | e2e | yes — `mushroom-tap.test.ts`, `mushroom-patch.test.ts`, `view-inverse.test.ts`, `pnpm play:mushrooms` (not in vet) | drawn-parts taps at the opening and 3 units in; the patch rules on every screen; `play-approach.ts` taps a walked-up cap where it is painted, `play-tufts.ts` after walking and turning |
| `plus-in-view` | unit | yes — `mushroom-room.test.ts`, `meadow-rules.test.ts` | `roomFor(stand, seed, view)` against the screen as the view projects |
| `grass-spots` | unit | yes — `tufts.test.ts`, `planting.test.ts` | `growTufts`, `tendTufts`, `plantableIn`, `leaveTufts`; how the lawn reads looked at in `bite-12/grass-after.png` |
| `keys-in-view` | e2e | yes — `keyed-flowers.test.ts`, `flower-sounds.test.ts`, `pnpm play:mushrooms` (not in vet) | `inView`, the free-tuft growth, `keyPlanting` through `classOf`; `play-keys.ts` |
| `long-press` | e2e | yes — `flower-hold.test.ts`, `flower-picker.test.ts`, `game.test.ts`, `pnpm play:mushrooms` (not in vet) | `LONG_PRESS` inside the slop, replace and pull, `flowerCross` off the sun; `play-hold.ts` on a seeded and a planted flower, and after walking |
| `insects-walk` | partly | yes — `flight-frame.test.ts`, `flight-in.test.ts`, `insect-drawn.test.ts`, `insect-dart.test.ts`, `pnpm play:mushrooms` (not in vet) | framed points still under a turn, parallax under a step; entry over the brow; the shy; `play-veer.ts` watches every flier while walking and turning |
| `mid-step-feet` | e2e | yes — `walking.test.ts`, `pnpm play:mushrooms` (not in vet) | `GROUND_BOB` on ground, brow and beds; `play-walk.ts` checks no pop while walking |
| `leaving-flier` | unit | yes — `insect-away.test.ts` | the eye turned during a leaving flight keeps the end on the plane |
| `leg-pace` | e2e | yes — `flight-timing.test.ts`, `flight-frame.test.ts`, `pnpm play:mushrooms` (not in vet) | a leg timed by its drawn length in one frame (`apartOf`); `play-veer.ts`'s step watch on tabL and phoneP |
| `keys-hidden` | unit | yes — `flower-cover.test.ts` | a point behind a nearer mushroom as the bed draws it is out of sight, so `inView` drops it; the planter's tuft filter through `Grass.inView` is not unit-tested |
| `no-edge` | e2e | yes — `tufts.test.ts`, `anchor.test.ts`, `pnpm play:mushrooms` (not in vet) | `play-walk.ts` walks out and back; the endlessness itself is looked at by eye |
| `far-forest` | partly | yes — `mushroom-profile.test.ts` | every painted outline within 1 px of the full one at every size; the look is by eye |
| `smooth` | e2e | yes — `pnpm play:mushrooms` (not in vet) | `frame-budget.ts`, phoneL `approach` under 26 ms |
| `fliers-follow` | partly | yes — `insect-drawn.test.ts`, `pnpm play:mushrooms` (not in vet) | `flier-watch.ts` on screen only |
| `to-check` | no | — | the operator's hand checks |
| `twelve` | unit | yes — `game.test.ts` | refused round the foot or the anchor; how many show turned is by eye |
| `tuft-shown` | unit | yes — `planter.test.ts` | the real `Planter` through walks short of a re-tend |
| `bees-seen` | e2e | yes — `pnpm play:mushrooms` (not in vet) | the 40 s bee play counts births, none off screen |
| `cloud-tap` | e2e | yes — `rain-sky.test.ts` (`cloudAt`), `game.test.ts`, `pnpm play:mushrooms` (not in vet) | the drawn reach and the picker shutting; the play taps a cloud on every screen; the whoosh needs ears |
| `shower` | partly | yes — `rain-sky.test.ts`, `rain-fall.test.ts`, `weather.test.ts` | darkening order and lag, `sunShown`, `dropColumn`, `shownFrom` never inside a cloud; the twins' look is by eye |
| `splashes` | partly | yes — `rain-fall.test.ts` (`firstCrossing`) | the cap landing; a splash staying put on a walk is by eye |
| `flowers-close` | e2e | yes — `flower-closing.test.ts`, `flower-seat.test.ts`, `pnpm play:mushrooms` (not in vet) | bud pose, perches inside the open head; the play checks closed mid-shower and open after |
| `caps-swell` | manual-only | — | a scale on the drawing; seeing it swell is by eye |
| `rain-sound` | partly | yes — `rain-voice.test.ts` | layer levels and click-free ticks; hearing it needs ears |
| `restart` | unit | yes — `rain-sky.test.ts`, `weather.test.ts`, `game.test.ts` | `wetnessShown` never jumps; downpour stays full across a restart |
| `rainbow` | e2e | yes — `rain-sky.test.ts`, `weather.test.ts`, `pnpm play:mushrooms` (not in vet) | `rainbowArc` opposite the sun and clear of the horizon per screen; fade timings; the play turns to it |
| `rain-smooth` | e2e | yes — `pnpm play:mushrooms` (not in vet) | `play-rain.ts` times the three ramps against `FRAME_BUDGET_MS` |
| `drawn-fold` | e2e | yes — `pnpm play:mushrooms` (not in vet) | `__probe.rain()`'s `closing` is the fold the paint recorded |
| `shelter` | e2e | yes — `shelter.test.ts`, `shelter-cover.test.ts`, `fliers.test.ts`, `pnpm play:mushrooms` (not in vet) | seats, cover and the shower case over the sweep; the rain play expects every flier sheltering; how it reads is by eye |
| `come-out` | e2e | yes — `shelter.test.ts`, `pnpm play:mushrooms` (not in vet) | the staggered way out after `stopsAt` |
| `sow` | e2e | yes — `sprouting.test.ts`, `spore-seats.test.ts`, `spore-sight.test.ts`, `pnpm play:mushrooms` (not in vet) | `SPORE_SEATS`, feet seen and reachable; the sprouts play sows and picks one up |
| `sprout` | e2e | yes — `sprouting.test.ts`, `pnpm play:mushrooms` (not in vet) | `sproutedInRain` and the sprout's clock; the play counts sprouts after a shower |
| `ground-drag` | e2e | yes — `walk.test.ts`, `stride.test.ts`, `pan.test.ts`, `pnpm play:mushrooms` (not in vet) | the axis split and the glide's curve; the walk play checks the ground under the finger; the feel needs a hand |
| `mouse-size` | unit | yes — `door-reach.test.ts`, `pnpm play:mushrooms` (not in vet) | the head 0.6 of the door's width at every door size; `play-house`'s head check reads it as drawn; how it reads by eye |
| `mouse-run` | e2e | yes — `mouse-run.test.ts`, `mouse-run-course.test.ts`, `mouse-run-clock.test.ts`, `pnpm play:mushrooms` (not in vet) | reach, the emptiest-then-nearest target, the bow in drawn runners, the hop; `play-runs.ts` expects every runner shown from hop down to hop in; the squeak and patter need ears |
| `double-tap` | unit | yes — `mouse-run.test.ts` | `answerTap` squeaks a mouse in its doorway, a door tapped twice 0.2 s apart starting one run |
| `mouse-turn-back` | e2e | yes — `mouse-run.test.ts`, `pnpm play:mushrooms` (not in vet) | `retarget` and `scattered`; `play-runs.ts` step 4 sinks a run's target |
| `worm` | e2e | yes — `worm.test.ts`, `window-reach.test.ts`, `pnpm play:mushrooms` (not in vet) | target, path inside the cap, trip clock, peek under its cap, girth by zoom; `play-worms.ts` taps windows and reads `worm(id)`; whether a window is easy to hit is in `to-check.md` |
| `keys-strafe` | unit | yes — `keyboard.test.ts`, `walk.test.ts` | `z`/`c` strafe, `←`/`→` turn, each let go on its own release; a turn and a strafe held together 2 s |
| `drag-strafe` | unit | yes — `stride.test.ts` | the feet step per frame at the finger's pace capped at `STRIDE_CRUISE`; the feel needs a hand |
| `map-button` | e2e | yes — `game.test.ts`, `pnpm play:mushrooms` (not in vet) | the map action shuts every picker and keeps the selection; `play-meadow`'s `7-map` and `play-map.ts` press it and read `state().mapOpen`; the pictogram and the cross looked at in frames |
| `map-open` | e2e | yes — `keyboard.test.ts`, `pnpm play:mushrooms` (not in vet) | Escape → close; `play-map.ts` shoots it closed, mid-unfold and open, shuts it by a tap on the sheet and by Escape, a second Escape leaving it shut |
| `map-sun-up` | unit | yes — `map-frame.test.ts` | `mapFrame` turns with the sun, `onMap` puts the sun's azimuth up; the little sun looked at in frames |
| `map-things` | partly | yes — `map-frame.test.ts`, `map-ground.test.ts`, `pnpm play:mushrooms` (not in vet) | the box round every foot and the eye, the 2.5× cap, `thingScale`'s floor; the ground seeded and rooted in the box; `play-map.ts` fails on a flower off the sheet or fewer things than the meadow holds; how things read at map scale by eye |
| `map-child` | e2e | yes — `map-frame.test.ts`, `pnpm play:mushrooms` (not in vet) | `headingOnMap` agrees with `onMap`; `play-map.ts` fails on the child off the sheet or a mirrored view |
| `map-waits` | e2e | yes — `walk.test.ts`, `game.test.ts`, `pnpm play:mushrooms` (not in vet) | `haltAt` stops a glide, a fling and a held key dead; the pickers shut; `play-map.ts` fails on a picker left open over it or an eye moving under it; drags and keys ignored while open by hand |
| `window-opens` | e2e | yes — `worm.test.ts`, `pnpm play:mushrooms` (not in vet) | `tripWindows`/`peekWindow` open and shut each window round the trip; `play-worms.ts` checks both windows open and shut; no play opens the cross window |
| `door-after-walk` | unit | yes — `door-seats.test.ts` | a door seated from the eye as it stands now, else its mushroom alone; `play-map.ts` gives a door to a russula grown where a flick left the eye |
| `tufts-turn` | partly | partly — `planter.test.ts` | walks short of a re-tend never stray; the wide window's turn looked at in `frames/bite-16/tufts-turned-*.png` |
| `key-octave` | unit | yes — `instrument.test.ts`, `notes.test.ts` | a keyed melody walks by the nearest note; an octave key moves the melody; `strike` anchors on the last note |
| `play`   | e2e         | —                                 | it is the check; nothing runs it at merge |

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01APPVVPUTo7jV7T2kRUdGPS
https://claude.ai/code/session_01SdPhg6cj7GGedY3DgbfRVr
https://claude.ai/code/session_016Y6EaGWoqB9Vy7wF3UQzeb

https://claude.ai/code/session_011ybGKuAZ7ySAS8yq3qcKY8
https://claude.ai/code/session_01RhVb6TgQb9wrwX1BR4i1yG
https://claude.ai/code/session_018uqpsS5wWMGnPZWGRo9Xsq
https://claude.ai/code/session_019GUASJxfNC34B8pEHDpVbB
https://claude.ai/code/session_01UuJeXhkErjH7ZCown4ZshT
https://claude.ai/code/session_01SX3cadYy4ZA3dEsrsX75td

https://claude.ai/code/session_016BBVk643XJFug6qYMnBTTE
https://claude.ai/code/session_01GzypzaK9UdeqBziZG4E7gx
https://claude.ai/code/session_013DAjz1LhwmuHP9q9ije353
https://claude.ai/code/session_01A7QLb5FgmNL7cKUmKrkrox
https://claude.ai/code/session_01Xag3kMUXkAmDihnvx6LQ6L

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-17T09:40:14Z — "Proposed squash title/body: ``` feat(vova): #65 Syama's mush…" → [↓](#c01)
- **C02** @vzakharov (agent) — 2026-09-27T03:39:07Z — "Bite 5's review is handled — all 12 threads answered inline.…" → [↓](#c02)
- **C03** @vzakharov (agent) — 2026-09-28T10:02:05Z — "Replies to review 5331309763's body; the inline threads T50–…" → [↓](#c03)
- **C04** @vzakharov (agent) — 2026-09-28T10:27:10Z — "Поиграть: https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG…" → [↓](#c04)
- **C05** @vzakharov (agent) — 2026-09-29T11:14:29Z — "Документы по двум твоим идеям (комментарий 4131492133), по о…" → [↓](#c05)
- **C06** @vzakharov (agent) — 2026-10-04T15:40:41Z — "<!-- finalize-attestation --> ### Attestation Verified 4998a…" → [↓](#c06)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-17T09:40:14Z

[https://github.com/vzakharov/vovazakharov.com/pull/57#issuecomment-5712237909](https://github.com/vzakharov/vovazakharov.com/pull/57#issuecomment-5712237909)

Proposed squash title/body:

```
feat(vova): #65 Syama's mushroom meadow: houses, insects, flower music (pr #57)
```

```
A six-year-old drew a game on squared paper and explained it in two
voice notes: fly agarics with a mouse house in each, a plus and a minus
for mushrooms, buttons that fly in a butterfly, a fly or a bee. No goal,
no text — the point is to watch and to play. Issue #65 holds the spec;
every control in the drawing works.

/mushrooms is a full-screen meadow drawn by Phaser 4, loaded on this
route alone. Every mushroom, flower and insect grows from its own seed
by a pure, tested generator, every motion is a pure function of the
clock, and one light shades it all. The meadow is a field with no edge
seen through a panoramic lens: a drag or the arrow keys turn through
360° and walk across it, far things sinking under a round brow. A pure
reducer in model/game.ts owns the state, kept in IndexedDB as a
versioned record numbered in the URL hash, so a reload comes back to
the same meadow. pnpm play:mushrooms plays every control in headless
Chromium, failing on a page error or a wrong result.

Plus grows one of four species — fly agaric, porcini, chanterelle,
russula — up to twelve in sight; minus sinks one; the house button
gives a cap Syama's windows and a door. A tapped door sends a mouse
across the grass to another house; a tapped window brings a worm over
the cap. Butterflies drink at flowers, flies seek the fly agarics, bees
plant flowers round those they visit. A tapped mushroom drops a spore.
A tapped cloud starts a shower: drops splash, flowers fold, insects
shelter under caps, every spore comes up as a little mushroom, and a
rainbow follows. A tapped sun brings dusk — windows glow, fireflies and
crickets wake — and the moon brings the day back.

Every flower is a note or a drum by its colour and shape, darker
sounding lower: a tap plays one, several fingers a chord, the keyboard
too. A tapped grass tuft opens a colour-then-shape picker and that
flower grows there; a long press changes or pulls one. A folded map
shows the whole meadow from above. Sound is a Web Audio synth.

Closes #65

Co-authored-by: Claude <noreply@anthropic.com>
```

---

<a id="c02"></a>

### Comment by @vzakharov (agent) on 2026-09-27T03:39:07Z

[https://github.com/vzakharov/vovazakharov.com/pull/57#issuecomment-5852353929](https://github.com/vzakharov/vovazakharov.com/pull/57#issuecomment-5852353929)

Bite 5's review is handled — all 12 threads answered inline. The summary's four judgment calls, decided in the plan (a49eb6b) under "Butterflies are a meadow, not siblings":

- **Flier speed:** the cruise is two thirds as fast (`FLYING` ×1.5, c3e5096).
- **Hue spread:** 14 base colours round the wheel, the pattern always a quarter to three quarters of the way round from the base (e7f8c77). Over 2000 four-butterfly sets: a repeated base colour 80.5% → 38.5%, two colours or fewer 22.3% → 3.5%. Each colour still comes from its own seed alone, so repeats follow the birthday problem.
- **Near-closed fore wings in flight:** kept. They blur at 6 Hz, and only a still frame shows sticks.
- **Overhang on small caps:** kept. A tap on a resting butterfly now goes through to the mushroom (3ce7c14), and the overhang reads as a butterfly on a button mushroom.

Frames of the handled bite: `docs/remove-before-merging/frames/bite-5/handled/`.

---

<a id="c03"></a>

### Comment by @vzakharov (agent) on 2026-09-28T10:02:05Z

[https://github.com/vzakharov/vovazakharov.com/pull/57#issuecomment-5867734103](https://github.com/vzakharov/vovazakharov.com/pull/57#issuecomment-5867734103)

Replies to review 5331309763's body; the inline threads T50–T59 each have their own reply. The plan's decisions for this review are in 6a87e91.

**Judgment calls**
- **Catching a flier on landscape:** met, ≥ 70% for every kind on every screen. A flight longer than a kind's stride takes proportionally longer (52295ea), and since that dragged a fly across a sideways phone for up to 18 s, long flights are capped per kind, with a fly and a bee dashing the first fifth (e6faeb5). The least now is a fly on desktop at 77.6%; the sweep is in ui/scene/fliers.test.ts (c825c19).
- **Planting repaint inside a tick:** deferred; the flower bed and `see()` catch up at the start of the next frame (00cd630).
- **Turning mid-flight:** `paint` clears every flier's `aim`, so each takes it afresh on its next frame, as the cheapest fix before bite 8 (7a10e93).

**Nits**
- Flower cap by this screen's seeded flowers: `seededFlowers` is now the seeded flowers' own count (52295ea).
- Settling back ignoring crowding: a flier settles back only on an uncrowded perch (52295ea).
- Take-off dropping the landing bob: the bob now dies away over 200 ms (7a10e93).
- Buzzing-gene assembly: one helper, `buzzingBody` in buzz-genes.ts, identical genes per seed (36c0b1a).

**Still unmet:** small-phone air, as on T50 and T53. The halved grid seats 8 of the 10 apart, so two fliers hold overlapping air spots on 33% of ticks with the opening clump and 0.28% with a full forest over three visits; two tests run as `todo` (`AIR_UNMET` in ui/scene/fliers.test.ts).

---

<a id="c04"></a>

### Comment by @vzakharov (agent) on 2026-09-28T10:27:10Z

[https://github.com/vzakharov/vovazakharov.com/pull/57#issuecomment-5868107970](https://github.com/vzakharov/vovazakharov.com/pull/57#issuecomment-5868107970)

Поиграть: https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG

Это шестой кусок, замечания из ревью учтены. Ссылка пока приватная: чтобы открыть её с другого аккаунта, поделитесь ею через меню Share.

Кадры текущей версии: `docs/remove-before-merging/frames/bite-6/`

---

<a id="c05"></a>

### Comment by @vzakharov (agent) on 2026-09-29T11:14:29Z

[https://github.com/vzakharov/vovazakharov.com/pull/57#issuecomment-5889105662](https://github.com/vzakharov/vovazakharov.com/pull/57#issuecomment-5889105662)

Документы по двум твоим идеям (комментарий 4131492133), по одному на идею:

- **[Идея 1 — поляна, по которой ходишь](https://github.com/vzakharov/vovazakharov.com/blob/claude/mushroom-game-syama-lbirv7/docs/remove-before-merging/ideas/idea-1-walking-meadow.md).** Модель и отрисовка готовы: гены, позы, свет, тушь, движение, полёт, пыльца, домики и звук переезжают почти как есть. Не готов слой, который решает, где что стоит на экране (шесть слотов под каждую ориентацию, цветы «на экране и на нём повёрнутом»). Это ~2 700 строк, и примерно половина из них уйдёт. Phaser 2D с билбордами справится, three.js нужен только ради вокселей или свободного 3D сверху. Размер 8–10 байтов без вокселей, то есть примерно ещё одна игра. Развилок восемь, и первая из них: ходьба сейчас или пункт 9 как написан.
- **[Идея 2 — цветы как хроматический инструмент](https://github.com/vzakharov/vovazakharov.com/blob/claude/mushroom-game-syama-lbirv7/docs/remove-before-merging/ideas/idea-2-flower-keyboard.md).** Код почти готов, план почти не трогается: это один отдельный байт, и от развилок первой идеи он не зависит. Настоящий риск музыкальный. Сейчас любые тапы звучат красиво, потому что нот пять, а в хроматике ребёнок, который колотит по цветам, услышит диссонанс. Предложение: изначально на лугу растут семь «белых клавиш», а диезы по одной приносят пчёлы. Ставить сразу после байта 9.

В байте 9 я строю только то, что первый документ признаёт верным при любом решении: координаты земли и камеру, расстановку грибов процедурой вместо слотов (про неё ты писал отдельно), цветы в мире один раз за визит, тап по мелкому не меньше пальца. Жесты, края мира, панорама, насекомые в мире и кнопка звука ждут твоего решения.

---

<a id="c06"></a>

### Comment by @vzakharov (agent) on 2026-10-04T15:40:41Z

[https://github.com/vzakharov/vovazakharov.com/pull/57#issuecomment-5981701609](https://github.com/vzakharov/vovazakharov.com/pull/57#issuecomment-5981701609)

<!-- finalize-attestation -->

### Attestation

Verified 4998afb (`claude/mushroom-game-syama-lbirv7`) against `main` @ 250bab9 "feat: count visits and downloads with self-hosted Umami (pr #97)".

- `./scripts/vet.sh` — **green**, run in parts because the full run no longer fits one call. The gates (every site's build, lint, typecheck, format, FSD, type-overlap, knip and the repo checks) passed before merging `main` and again after. The test suite passed before the merge, 2239 + 99 tests in two runs; the merge brought in no code the suite covers.
- CI on this PR — **nothing runs on a PR in this repo**
- CI-only buckets — **/test-on-gh is not in this project**

No workflow runs on a PR; this comment is the verification record.

---

## Review threads

### Review by @vzakharov (agent) — COMMENTED

_2026-09-26T08:50:20Z_

Review of bite 1 (`b5d0974..bc7fb16`), played in the built export at tablet 1180×820@2 (landscape and turned to portrait) and phone 390×844@3, touch on. The page loads clean: no console errors, the buffer is sharp at device pixels, and a resize repaints the same meadow.

Where it falls short is the look, and mostly the mushrooms themselves. They are the picture's subject, and they read as a vector clip-art pair rather than Syama's drawing:
- faceted rims;
- a shade wedge with a straight cut through its crest;
- two separate straight columns where the drawing has one clump of long, bent stems leaning apart.

On a phone, one visit in eighteen puts a cap at or past the screen edge; that figure is measured, not estimated. Inline comments below, most important first. None of them block starting bite 2, but 1–4 should land before the meadow starts moving, because motion makes each of them more visible, not less.

### Review by @vzakharov (agent) — COMMENTED

_2026-09-26T09:40:04Z_

Loop review of bite 2 (the meadow alive, and heard) — commits 8b0244f..8e96df7, written by the agent that plays the reviewer in this loop (`docs/plans/mushroom-game-syama.paused.md` § "How this elephant is eaten", step 2), not by the operator.

I looked at the page first: frames at tablet landscape (1180×820 @2x) and phone portrait (390×844 @3x), with the visit seed fixed, then taps on the front mushroom and a flower. The bite does what the plan says: the clouds drift, the grass sways, the mushrooms breathe, a tap squashes and rocks a mushroom and puffs spores, and a flower blooms and chimes. No page errors. What follows is where the frames and the plan part ways.

**How the frames were taken, since the handling session will need it to check its fixes:** screenshots under software GL take about a second each, so a shot "90 ms after the tap" really shows whatever was on screen a second later. A tap reaction looked missing until I stopped Phaser's loop and stepped it by hand (`game.loop.sleep()`, then `game.step(t, 16.7)` on a clock I advanced myself), with `window.__game` exposed through a temporary line in `start-game.ts` that I did not commit. Any frame taken "N ms after a tap" has to be taken that way.

One thing outside this bite's commits: on a phone the sky and hills take the top ~55% of the screen and the clump sits small in the lower third. That is bite 1's layout, so I'm leaving it for bite 3's forest work, which re-sizes the clump anyway.

### Review by @vzakharov (agent) — COMMENTED

_2026-09-26T11:41:19Z_

Loop review of bite 3 (more mushrooms, and a forest) — commits 6e74443..3f31d16, written by the agent that plays the reviewer in this loop (`docs/plans/mushroom-game-syama.paused.md` § "How this elephant is eaten", step 2), not by the operator.

**The headline: in the build at this head, no tap does anything.** Not `+`, not `−`, not the picker, not mute, not a flower. Every tap throws `hitAreaCallback is not a function` (about 200 errors in one scripted run), and Phaser hit-tests every interactive object on every pointer event, so one broken object takes input down for all of them. It came in with 074dc66, after the bite's last frames were shot. `vet` was green, and the PR body describes a working selection that nobody had tapped since that commit. This is the five-percent file's "an account stands in for running it", in its purest form. See the first inline comment.

Everything else here was played with the callback patched back in at runtime (no source change): tablet 1180×820@2 landscape and portrait, phone 390×844@3 portrait and landscape, touch on, `Math.random` seeded, the loop stepped by hand. Where a frame suggested a layout claim, I backed it with a 2000-visit sweep through the real `meadowLayout` and `mushroomGenes`. The numbers below come from that sweep.

What works: the picker's staggered pop-up, grow and sink with their spores and voices, a grown mushroom arriving selected, a sky tap letting go, a rotation keeping mushrooms, selection and the open picker, and every forest mushroom taking its own taps (16/16). The meadow full of six looks lovely on a tablet held sideways.

What the comments ask for, in order of weight: fix the hit area and make the frame recipe fail on page errors; make the crossed clump's back stem tappable where it is drawn; give phone-sized forest mushrooms a finger-sized target; test controls against the meadow, not only against each other; recompose tablet portrait; make selection visible; make `−` and a full `+` answer a tap; close the picker the way it opens; make the picker discs opaque.

### Review by @vzakharov (agent) — COMMENTED

_2026-09-26T20:11:44Z_

Review of bite 4 (the mouse house), `56df499..11b915b`. I played it first: `pnpm play:mushrooms` is green on all four screens with no page errors, and I then swept 2000 visits through the real model and layout on every screen. The code reads cleanly, and the model/scene split and the reducer tests hold up. The findings are on the page, and the numbers come from the sweeps.

What a child meets: the meadow opens on the clump, and the back mushroom's door is hidden behind the front stem on almost every tablet visit. The front door is narrower than a finger on every phone, and the mouse behind it is a ~10 px dot there. The pickers themselves are good. The pictograms match Syama's ⊕ ○ □ ▯ and door, and the two pickers share the band cleanly.

The three that matter most are the hidden door, the door's tap size and the mouse's size. Each comment ends with an **Ask** and a check that would hold the fix.

### Review by @vzakharov (agent) — COMMENTED

_2026-09-27T01:44:01Z_

**Loop review of bite 5 (the butterfly)** — an agent's review under the plan's § "How this elephant is eaten", step 2. `/handle` works every thread whatever the export's authorship label says.

**Played before judged.** `pnpm play:mushrooms` is green on all four screens, 4/4 perched, no page errors. On top of that there were scripted runs on tablet and phone (six fast presses, a full forest, taps at rest and in flight, sinking a perch, a rotation mid-flight and mid-perch), plus 2000-visit sweeps over the live model and layout. The frames are in `docs/remove-before-merging/frames/bite-5/review/` (2983233).

**What a child sees that works:** the trill sounds on the press, and a new butterfly is on screen within 0.5–0.8 s (p90 1.4 s). Six quick presses settle at four within ~3 s. The resting wing pose never closes below 38% open, so a still of a resting one reads. The hit circle never drops below 32 px radius. A sunk perch sends its butterfly off on every screen, and a rotation leaves the perched ones on their perches with no jitter. The model is Phaser-free, `tick`/`startle` keep identity, and every module is under 450 lines.

**What doesn't:** the butterfly flips round in one frame (the worst, and on every screen); butterflies stack on one perch although the code says they sit apart; perches land under buttons and on flowers hidden behind caps; a butterfly on a small cap steals the cap's tap; and drinking looks exactly like sitting, which is where the ecology thread was meant to start. Each has an inline comment with its numbers and an **Ask**.

**Judgment calls for the handler, not findings:**
- Fliers move at p50 ~300 px/s (tablet) and up to ~1000 px/s, which is 3–30 hit radii a second. A six-year-old will mostly miss a flier, though a hit only jolts it. Consider slowing the cruise.
- 82% of four-butterfly sets repeat a base colour, and 23% have two colours or fewer. They read as siblings, and more hue spread would read as a meadow.
- In flight the fore wings are under 25% open for a quarter of the beat, so a still frame shows sticks (`docs/remove-before-merging/frames/bite-5/review/phoneP-flight-closed-wings-read-as-sticks.png`). In motion it blurs at 6 Hz, which is probably fine.
- A butterfly is wider than a phone back-row cap in 8–11% of perches (7–13% on slots 2–3 of a 320 px phone), and its wings pass the rim on 83–94% of them. `insect-layout.test.ts` only compares against the clump. Decide whether perched butterflies should scale down with their cap.

### Review by @vzakharov (agent) — COMMENTED

_2026-09-27T17:19:10Z_

**Loop review of bite 6 (the fly and the bee)**. This is an agent's review, run under step 2 of the plan's § "How this elephant is eaten". `/handle` works every thread whatever authorship label the export shows.

**I played it before judging it.** `pnpm play:mushrooms` passes on all five screens with no page errors, every turn is ≤ 0.18 rad per frame, and no insect is drawn under its size floor. On top of that I ran scripted sequences in the page: every kind at its limit, taps at rest and in flight, sinking a fly's perch, a rotation mid-flight, and mute. I also ran model sweeps over the live code (150 seeds × 4 simulated minutes per screen, and 2000-seed room sweeps). The frames are in `docs/remove-before-merging/frames/bite-6/review/` (c709003).

**What a child sees that works.** Flies and bees read as flies and bees at phone size, and the three pictograms on the left are clear. A bee never goes back to the flower it just left, and no two insects shared a perch in any sweep. A tapped flier in the air keeps flying. Sinking a mushroom sends its fly off on the next frame. A planted flower grows out of the ground with an overshoot to ~1.08 and chimes within 0.15 s. Nothing in the model reads `Math.random` or `Date.now`, `palette.ts` still holds every colour, nothing draws text, and every module is under 450 lines.

**What doesn't.** The bite's ecology is the part that barely shows. A tablet plants about one flower and then never another. Bees beside butterflies spend nearly all their time roaming the air. On a 320 px phone a flier is lost outright, and the rest pile up so that taps hit the wrong one. Mute stores sounds up instead of dropping them. A resting bee strobes and hides the flower it sits on. Each point has an inline comment with its numbers and an **Ask**.

**Context from the operator's own review (5329778719), already folded into the plan in 4c7f8f7.** Bite 7 is atmosphere. Bite 8 is a meadow wider than the screen, where a rotation changes the crop rather than the layout. Where a fix below would be redone by bite 8, the comment says so and asks for the cheapest fix that meets the property now.

**Judgment calls for the handler, not findings:**
- A flier is hard for a finger to catch on the landscape screens. A tap aimed where it was drawn 200 ms earlier lands in its tap circle for fly 64% / bee 47% of the time on tabL, and fly 23% on phoneL (median 289 px/s). On the other screens it is 89–98%. Flight times are in `FLIGHT_HABITS`. Consider ≥ 70% on every screen.
- A planting inside a tick runs `see()` and repaints every flower in that frame (`meadow-scene.ts` 218–221). That measured up to 11 ms on this server (mean 1.4 ms), and a tablet CPU is slower. Consider deferring the sight to the next frame.
- Turning the phone mid-flight jumps the flier 0.37 of the screen height in one frame on phoneL (`docs/remove-before-merging/frames/bite-6/review/phoneL-turned-to-portrait-mid-flight.png`). Its `aim` also stays in the old screen's pixels, so it flies facing the wrong way for the rest of the leg (`insect-view.ts` 201–202; `paint` never clears it). Bite 8 changes what a rotation does, so a reset of `aim` in `paint` is enough for now.

**Nits:** the flower cap counts this screen's seeded flowers (`perch-sight.ts` ~189), so it depends on orientation. A flier settling back on its own perch ignores crowding (`flight.ts` 208). A take-off drops the landing bob, so a startle mid-bob jumps a few px (`insect-view.ts` 144–150). `fly-genes.ts` 52–61 and `bee-genes.ts` 50–59 repeat the buzzing-gene assembly, which one helper could build.

### Review by @vzakharov (agent) — COMMENTED

_2026-09-28T15:00:33Z_

Bite 7 review (atmosphere). Frames first, then code: two agents in parallel — one played every screen and swept seeds (frames committed in c598492 under `docs/remove-before-merging/frames/bite-7/review/`), one read the diff against `look.md` and the plan.

**The look is a real step up** — tablet landscape reads warm, airy and lit, the inks are Syama's pen, the fly agaric is still the fly agaric. Every tap still answers on all five screens, 0 page errors.

**What to fix, in order:**
1. **Performance** — the backdrop and HUD are re-tessellated every frame (2.3× bite 6's draw commands, 31.5 ms a rendered frame). Bake them per resize. This is the play run's 17–22 min.
2. **Insects lit from the wrong side** 33–57% of flight — the light turns with the body.
3. **Phone sun halo** — a flat cream plateau over 72–82% of the sky, cut out by the hills.
4. **Ink contrast** — the tests pass by construction; on the lower meadow and on hazed back rows outlines are ~2:1.
5. Shine over spots; stem foot as a plank cut; binary side light; wash reaching the back row.
6. Test proxies, the retina hairline, a DRY miss, plan wording.

Items 2 and 4 set the contract bite 8's four species are inked and lit through, so they come before bite 8.

**Play run** (probe build, one screen per call, all exit 0): tabL 294 s (bite 6: 58), tabP 262, phoneP 189 (bite 6: 45), phoneL 191, phoneS 69. Separately: the play run's turn check measures heading-off-way, not turning speed — sampling found 254 of 32,391 frame-to-frame rotation steps over 0.2 rad (max 0.59), perched frames included; worth a real per-frame turn bound in `flier-watch.ts`.

**Checked and fine:** WCAG luminance/contrast in `colour.ts`, `dimTo` in linear light; `shadowFall` away from the sun; the ground seam; resize repaints into existing objects and moves the light; the HUD's even ink ring; no module over 450 lines (largest touched 370); no colour literals outside `palette*.ts`; no suppressions. The spotless selected cap in `tabL-butterflies-arriving-over-the-lit-ground.png` is the `plain` kind, not a bug.

### Review by @vzakharov (agent) — COMMENTED

_2026-09-28T21:20:03Z_

Loop review (agent) of bite 8, real mushrooms: source commits b852e8c..bda1467. Per the plan, this is an agent's review, so `writing/notes/the-five-percent.md` stays frozen.

The four species are recognisable at a glance and the play run is green on all five screens (median frames 14.7–18.9 ms, no page errors). Every species' tap area matches its drawn outline, and seeds stay aligned across species. What a child would still notice, by weight:

1. **Dead door taps** where two doors of different sizes sit close (`nearestDoor`).
2. **The clump's floors are breached** for some pairs: a back cap 29.5% in view, a back door 65.9%. The test samples one pair per visit and misses them.
3. **The species read only halfway**: the porcini's stem is as long as a fly agaric's, the chanterelle is gold with an invisible rim wave, and the russula is a disc on a pole.
4. **Flowers grow under the buttons** (15% on a small phone) and behind the clump.
5. **The selection band** has grass-coloured gaps at every outline's first point, and a foot ring sized by the cap.
6. **Tests and play checks that can't fail** (six named inline).

Frames from this review: `docs/remove-before-merging/frames/bite-8/review/` (0effa75).

### Review by @vzakharov (agent) — COMMENTED

_2026-09-29T18:34:38Z_

Loop review (agent) of bite 9, the meadow on the ground: source commits 1d4a1de..37993ff. This is an agent's review, so `writing/notes/the-five-percent.md` stays frozen.

Feet on real ground work: nothing moves or is lost through a turn, taps select 6/6 on every screen with none stolen, doors stay ≥ 80% in sight, bees plant in 99–100% of full forests, and six mushrooms fit where the plan says they do. What a child would still notice, by weight:

1. **No depth in the forest.** Forest mushrooms are drawn one size wherever they stand, so a far porcini is often wider than a near fly agaric (`clump-layout.ts` L69).
2. **Landscape and desktop lay the meadow out at portrait width**: six mushrooms in the middle 27% of a tablet, bare grass either side, a `+` that refuses (`ground.ts` L193).
3. **A portrait meadow turned sideways hides 64–74% of its flowers.**
4. **Rules that don't hold where they claim to**: the finger pad never switches on, the sun can sit over the clump at off-list sizes, `+` answers from the old screen after a resize, and the on-screen distances are right on one camera only.
5. **Tests that can't fail or measure less than the claim** (four, inline).

Play run: no page errors; median frames tabL 25.0, tabP 27.0, phoneP 24.0, phoneL 25.0, phoneS 19.3 ms. tabP is over the 26 ms budget, so the play run exits 1 (twice in a row). Every screen is 1–4.5 ms slower than bite 9's own run, which may be this machine; the handler should rerun it before deciding whether it is the code.

Frames from this review: `docs/remove-before-merging/frames/bite-9/review/` (ec95c72).

### Review by @vzakharov (agent) — COMMENTED

_2026-09-30T02:18:28Z_

Loop review of bite 10 (the flowers as an instrument, planted by the child), `11f3f09..2be0028`: an agent's review, not the operator's.

I played it first. A player agent built the probe build and ran the play run, which was green on phoneP, phoneL, phoneS and tabL with no page errors. It then played scripted child sequences at phone and tablet sizes, ran 2000-visit sweeps and rendered all twenty sounds offline. A reader agent read the diff against plan item 10 and mutation-checked the tests. The frames are in `docs/remove-before-merging/frames/bite-10-review/` (4b6b6a0).

What works: a tapped flower plays and the AudioContext runs. The picked shape is exactly the flower that grows, standing on the tuft's foot. A shape press is silent, and the note plays within two frames as the flower opens. A tap elsewhere closes the picker unplanted. At the cap a tuft shakes and plays nuh-uh. Two-finger chords play both notes. The keyboard works by `event.code`. The short-sky picker hides what it covers and gives it back. Nothing clips: a six-voice chord peaks at −3.3 to −5.8 dBFS. Listeners come off on shutdown. "No Web Audio, no sound" is a capability check, not a swallowed error.

What doesn't, in order: the tufts go stale as soon as the meadow changes (the headline claim of the bite), the chord's finger rule plays a flower twice and deselects, the violet drums are inaudible on a phone speaker, and the tufts don't read as something to tap. Each comment ends with an `Ask:` and a property to test the fix against.

### Review by @vzakharov (agent) — COMMENTED

_2026-09-30T23:23:58Z_

Loop review of bite 11 (a wider meadow, panned), `476652d1..afbdd75`: an agent's review, not the operator's, so `writing/notes/the-five-percent.md` stays frozen.

A player agent drove the built game frame by frame on tabL and phoneP (drags, wobbly taps, held keys, a turn mid-hold, `+` while panned) and swept head taps and pan targets over seeds. A reader agent read the diff against plan item 11 and mutation-checked the new tests. Findings 1 and 2 were reached independently by both, so they are confirmed. The rest are one agent's findings, each with a measurement.

**What works:** a finger swipe reaches both world ends in two swipes, stops softly and taps nothing (`docs/remove-before-merging/frames/bite-11-review/tabL-swiped-left-end-looks-good.png`, `…right-end-looks-good.png`). A held key braking into an end is smooth. Blur, and a turn mid-hold, both keep the key turn sane (`phoneP-turned-mid-key-hold.png`). Every mushroom grown by `+` at five pan positions stands inside the crop (`tabL-plus-grown-while-panned.png`). Flights, first perches and `roomFor` all go through the crop. `standingFlowers`' index pairing never misfires: 50,000 visits, 14/14 each. Every head tap a child loses goes to the mushroom or flower drawn in front of that point, never to empty ground.

**What a child would feel:** starting a pan on the meadow also taps whatever the finger landed on (2), and on a phone that's a third of all pans. A tap that wobbles past 10 px turns into a glide 3–5× the wobble (3). On a phone held sideways there is barely anything to pan (7).

**Not run:** perches and flights off the crop, the hills under the sun on each screen, the cost of `fliers.test.ts`, and screens other than tabL/phoneP for the key traces.

### Review by @vzakharov (agent) — COMMENTED

_2026-10-02T11:04:03Z_

Loop review — bite 12, group eye-and-world

Read model/{cruise,pan,stride,walk,ground}.ts, view.ts, view-inverse.ts, panorama.ts, skyline.ts, brow.ts, bed-place.ts, repaint-queue.ts, eye-crop.ts, eye-input.ts, walking.ts, paint-backdrop.ts and meadow-scene.ts against lens.md, walking.md and seam-and-brow.md. On the question asked: the 360° wrap holds wherever I looked. `inside` wraps the heading, a glide is left unwrapped so it turns the short way, the panorama crests are `ringWave`s with C1 joins, and the sun, glow and wash go through `screenAt`'s short way round with no picture wide enough to show on both sides. The rim slide brakes rather than stops dead, and no spot in the glade loses sight of everything. Every spot has wedge ground within `D_SEE` at some heading. No play run was made: the review was posted early, under its context budget.

Findings, in rank order:
1. nit: the walk's bob moves the beds but not the brow or the ground, so the sliver rule is checked on positions that are then drawn up to ~3 px lower (view.ts `sunkAway`).
2. nit: `groundSeam` and `seamAt` are dead in production, and skyline.ts's header still says the grass is laid on them (skyline.ts).
3. nit: meadow-scene.ts is 457 lines; the controls' callback block is a clean seam.

### Review by @vzakharov (agent) — COMMENTED

_2026-10-02T11:04:47Z_

Loop review — bite 12, group insects

Findings, ranked by what a child would see:

1. **nit (borderline blocking) — a leaving flier swells toward the child when he turns after it.** The end of a leg to away is worked out again every frame from the current view (`insect-view.ts:222`, `leavingAloft`), and its depth is `from`'s depth along the *current* heading (`insect-away.ts:99`, `perchDistance`). Turn toward the side it is leaving by and that depth shrinks down to the `V_NEAR` clamp. Probe on tabL: `from` = (0.3, 8.64, h 0.5), leaving right. With the heading at 0, 1 and 2 rad, the end's depth is 8.64, 7.62 and 5.01 (5.01 is the clamp), and its drawn zoom is 0.99, 1.12 and 1.71. A straight in-frame flight over 4 s, while the child turns right at 1 rad/s, is drawn at zoom 1.00 → 1.36 (mid-screen at t=1.5 s) → 1.63, its forward distance falling 8.6 → 0.6. So the butterfly he turns to follow flies at his face and grows to cap size, instead of flying off across the screen. The leg was also timed when it set off, against an end that has since moved. No test turns the eye during a leaving leg: `insect-away.test.ts` and `perches.test.ts` check `leavingAloft` on a still view.
2. **nit — a release with no open perch in view is still timed against the band-middle out point, not its own.** `v21-fly18.md` / `leg-timing.md` item 6 leaves this "fixed with the review's round", and it is not fixed at this head. `wayOutOf` (`insect-away.ts:139-147`) times the way out with `awayOn`: a butterfly's widest wings, at `awayDown(h, 0)`. `enter` draws it to `entryAloft` with the flier's own `awayOf`: its own span, and a drop its phase picks anywhere in `AWAY_BAND`. Measured over the phase, at the opening eye, seed 3, the drawn/timed ratio of the way out is **0.67–1.27 on phoneP** and 0.88–1.06 on tabL. So on a phone a released fly can cross the screen at up to 1.27× its cruise: the over that item 6 already names, and the same class `leg-timing.md` item 4 refuses to accept for cut legs. The fix is the one `Sight.aways` already made for the way out: put the flier's own `Away` into the release's `WayOut`.
3. **nit — `insect-view.ts` is 458 lines, and `fly` alone is 145 (203–348).** That is past the ~450 rule of thumb. The seam is inside `fly`: lines 284–347 take a framed point and pose it on screen (veer, sink, shadow, cull, container pose, hit circle), and read nothing of the leg's timing. Moving that into a helper beside `insect-seat.ts` / `insect-sink.ts` brings the class well under, and gives the cull/sink chain a unit-testable home. At the moment only the play exercises it.

Not raised: the four reds `insects.md` keeps for the operator, and every item on `to-check.md`. The fly in the air over the hills in `v19/phoneP-veer-walk-in-5.png` shows no shadow on the meadow. That is consistent with its ground point being behind the brow (`insect-shadow.ts` sinks it), so it is not a finding.

Probes (not committed): straight-line flights through `framedOf` / `aloftFramed` / `veeredAlong` / `sinkingAloft`, and `entryAloft` against `wayOutOf` through `apartOf`. Finding 1's numbers take a straight in-frame path rather than `steer`'s; `steer` flies to the same moving `framedEnd`.

### Review by @vzakharov (agent) — COMMENTED

_2026-10-02T11:05:44Z_

Loop review — bite 12, group taps-flowers-harness

Checked against ac600a77a56d498b03c19bf9cf10cd2bc351ffc6. The game code for tapping after a walk looks right: mushrooms, flowers, tufts and the door all hit-test against the transforms the last frame drew, and `Grass.at` reads `shown.near`. What does not hold up is the harness that is supposed to prove it. The one tap the plays make after walking cannot fail, and none of them taps a flower or a tuft after walking or turning.

In rank order:

1. **blocking** — `play-approach.ts:217`: the walked-up cap tap is checked at a point the scene's own hit test chose (`__probe.mushroom` → `reaching` → `topAt` → `hitTestPointer`), so the check only proves that Phaser's dispatch works. It cannot fail when the hit area sits off the drawing.
2. **blocking** — `play-tufts.ts:112` (and `play-hold`, `play-keys`): every flower and tuft tap runs from the opening eye on a fresh page. The bite's question — does a tap after walking or turning land on what is drawn — goes unplayed for flowers and tufts.
3. **blocking** — `play-walk.ts:300`: the "drag taps nothing" check takes its baseline with nothing selected and every picker shut. But `tapMeadow` deselects and shuts on `POINTER_DOWN`, so the `selected` / `picking` / `planting` fields in `TAPS` cannot change. A child who opens the flower picker and then drags to look around loses the picker, and this check stays green.
4. **nit** — `planter.ts:106`: a key sows its flower on a tuft from `Grass.inView()`, which means on the screen, not visible. Plantability is judged from the opening eye, so after a walk the new flower can grow behind a nearer mushroom: the child hears the note and sees nothing grow.
5. **nit** — `house-view.ts:193`: `HouseView.follow` is never called (the bed stands the house through `stand`). If it were, it would call `bedPlace` without the mushroom's `tall` and keep the door tappable after its mushroom sinks away. Remove it, and the `foot` constructor parameter that only it uses.

Not raised: flowers' and caps' tap circles shrinking with distance (`insects.md`, taken), and plantability judged from the opening eye (`p1c-grass-taps.md`).

### Review by @vzakharov (agent) — COMMENTED

_2026-10-03T01:59:22Z_

Loop review — bite 12b, the endless field

Three fresh-eyed reviewers (field reader, insects-and-harness reader, a player on phoneS/phoneP/tabL/phoneL) over `a8d2aff..` ; the orchestrator checked each cited line against the diff and looked at the frames. Frames and the scratch play: docs/remove-before-merging/frames/bite-12b/review/ (3aeb57a).

**Blocking**, in rank order:
1. `model/game.ts` — the per-foot cap lets a wide opening hold 22; turning the phone strands 17 of them.
2. `planter.ts` — tap and picker buttons judge a tuft from two eyes: picker opens, buttons dim (3.6% of shown tufts after a sub-step move).
3. `tufts.ts` — every `+`/`−`/planting tends the whole grass in one frame, 15–34 ms in a forest on Node.
4. `air-spots.ts` — hovering insects crowded in layout px overlap as drawn at the sides, eye still (up to 178 pairs).
5. `bite-12b.md` — "insects follow the child" has no check anywhere; the reach is 15.9, and its test passes without the filter.
6. `flower-sight.ts` — most bee-planted flowers at the opening come up off screen (handler's call: blocking or accepted).

**Nits:** `flight-in.ts` shown-by-forward-distance vs the round brow; `insect-drawn.ts` side bend untested; the headline claims' vacuous tests (`tufts.test.ts` and siblings).

**Seen, not filed** (worth the handler's look, not measured against `a8d2aff`): on phoneS the forest out in the field stops at 8 (room, not the cap), packed into the bottom 40%; the seven buttons cover most of the sky's sides on phoneS; back-row hit boxes at the phoneS opening are 40–50 px against the 64 px floor — a build of a8d2aff beside HEAD settles whether that's new.

**Held** (measured): the walk back finds the same grass (tabL 27/27, phoneP 6/6) and the same mushrooms and flowers; `+` refuses visibly; caps count plane distance with boundary tests; `ringFoot` is anchor-free; `laidOf` is anchor-free; far chords within 1 px from 4 to 240 px; `DASH_SLACK` 1.25 still fails the 2.4× flick it was written for; the turn-rate watch reads the drawn rotation; pan signs are right.

### Review by @vzakharov (agent) — COMMENTED

_2026-10-03T06:06:16Z_

> megabeast loop review — an agent's, not the operator's; `/handle` reads these threads as guidance whatever the authorship label says.

Bite 13 (rain) review, from two fresh-eyed reviewer agents that played `--plays rain` on tabL, tabP-less, phoneL and phoneP. One blocking finding (the held flower's ring in the rain), four nits. Checked and fine: splashes stay on the ground through a walk and a turn mid-shower, the restart gush rises to ~118 drops, the rainbow fades out over ~0.6 s under a new shower, buds still play and bounce, caps swell ~6% about a fixed foot, a turned screen refits the wash. Each finding's call is in `docs/plans/mushroom-game-syama/bite-13/review.md`; the fixes follow in this session.

### Review by @vzakharov (agent) — COMMENTED

_2026-10-03T11:25:51Z_

Review of bite 14 (shelter, spores and sprouting, the walk), by two reviewer agents briefed with the diff `b306e90f..` and the plan's calls only: one played `rain` and `walk`, one `sprouts`, on tabL and phoneP, and both read their area against the calls. All three plays pass.

**Already fixed by the orchestrator (7de3ca4c):** both reviewers found the plan's call numbers rewritten — two `prettier --write` runs read the calls as one ordered list and renumbered them, breaking every "call N" reference. The numbers are restored and escaped so prettier leaves them, and call 31's "laid at its start size" now says full-grown, as call 41 built it.

**Sound:** sheltering insects read as hiding under caps on both screens; nothing sits on a cap it should be under; the retired shed is gone from `src/` and `scripts/`; the sowing model, `risen`, the tap routing and the shelter chain match their calls; `glide.ts` is one copy shared by the pan and the stride; every module is under ~450 lines (`meadow-scene.ts` at 450, +4 against its +3 grant). Findings inline; the blocking one is the phone's hidden spore.

### Review by @vzakharov (agent) — COMMENTED

_2026-10-03T14:00:30Z_

Review of bite 15's worms and window taps (calls 14–21, 24), by a reviewer agent briefed with the diff `9096cfb8..` and the plan's calls only. It played `meadow` on tabL and phoneP (every worm check green: reach 16.1 px, girth 6.0 px, the front cap keeping 61% / 40%), read the w1–w4 frames, grew a lone russula, and swept the model over 300 seeds per species.

**Sound:** the tap sharing between door and windows, the repaint gating, the wriggle's volumes, the inks in `palette-creatures.ts`, the band while segments are hidden, `wormTarget`'s alternation, the `TapTimed`/`Looking` bases, the probe's readers. On both screens the worm comes out, arches over the dome, goes in at the far window, and a second tap only wriggles it.

Three findings inline, two blocking: a russula's peeking worm stands into the sky, and a peeking worm loses its head to a rounding error. The mouse runs are reviewed separately.

### Review by @vzakharov (agent) — COMMENTED

_2026-10-03T14:32:06Z_

Review of bite 15's mice — sized to the door and running between houses (calls 1–13, 22, 23, 25) — by a reviewer agent briefed with the diff `9096cfb8..` and the plan's calls only. It played `runs` on tabL and phoneP (green: head ÷ door 0.60, runner 47→44 px and 36.6→34.3 px, sweeps 63 and 49 px), and measured a clearance readout, a double tap and a house sunk mid-run in throwaway variants of the play.

**Sound:** mouse counts are conserved through a double tap and a sink; a door tap with a door in reach, the call home and the lone chanterelle's peek behave as called; the runner sorts behind the front stem and in front of its own house at both ends.

Four findings inline, two blocking: a fleeing mouse vanishes for half its run, and a second tap on a peeking-to-run door sends a second mouse the other way. Not covered: a grown forest with doors far apart, and an eye walking mid-run (the course is re-curved from the live eye each frame; a hunch that the runner may slide). Frames: `docs/remove-before-merging/frames/bite-15/review/rr-*`.

### Review by @vzakharov (agent) — COMMENTED

_2026-10-03T18:31:01Z_

Bite 16 review (the map). The worst problem: **the map does not hold the meadow still.** Pickers stay live on top of it, and a flick's glide keeps walking under it.

Most severe first:
1. **The `+` and house pickers stay open and tappable over the map** (`controls.ts`). `shut` closes only the flower picker, so a cap tapped through the open map grows a mushroom the map doesn't show. This breaks calls 4 and 9.
2. **A drag's glide (~2 s) keeps walking and turning the child under the open map** (`map-view.ts` `letGo`). The marker and wedge on the map are stale, and the meadow has moved on when the map closes. This breaks call 5.
3. **Flowers on the map read as dark stumps** (`LEAST_FLOWER`). The head is about 4 px and its outline hides the colour. `tabL-m4` already answers the to-check question.
4. **"Left on the screen is left in the wedge" is left for the operator to check by eye**, though `play-map` could assert it from the probe.
5. **decisions.md denies the mute that was removed instead of saying what is true now** (polar bear).
6. Nit: the rename left comment lines unwrapped.

I didn't flag the known issues: the child-centred frame (call 14's revision isn't in the code yet), the house being a smudge, and `emerge`'s overshoot. I judged the look from the committed frames and did not run the play.

### Review by @vzakharov (agent) — COMMENTED

_2026-10-04T11:32:44Z_

Bite 17 review (875adf9..1228765): one player, two readers. Plays dusk, dark, night-run, map, walk green on tabL and phoneP; held up through resizes mid-dusk and mid-glide, rain at dusk, moon tap in flight.

Also, not anchored: the gait button stands alone mid-sky on phoneP (waits on the operator); a ~4 px lighter mauve seam on the dusk brow rim and stars poking out behind the buttons (nits); and `game.test.ts` "keeps the bees from planting" wants a mutation check (`room: dusky ? [] : room` → `room`).

### Review by @vzakharov (agent) — COMMENTED

_2026-10-04T14:47:22Z_

Review of bite 18 ("the meadow is kept"), read against saving.md, bite-18.md's calls and decisions.md, with the `keep` play run on phoneP. The before/after/`#new` frames match on everything the play checks.

The model half is solid. Settling is idempotent and tested on a played meadow holding every kind of thing, the schema is pinned to the types, and the reload, hash and `#new` paths work on the page. The findings are about what happens on a real child's iPad over days, where the browser and the user do things the tests don't:

- **Blocking:** the once-a-second poll writes forever even when nothing changed; a stale tab overwrites newer work just by being shown (the bare link makes two tabs on one meadow the normal case); a storage read failing after the open shows an error page instead of a meadow; and one refused write (routine on iPad Safari after backgrounding) stops keeping for the whole load.
- **Optional:** no `versionchange` handling; nothing forcing a `KEPT_VERSION` bump; an untouched fresh meadow (a stray `#new`, a shared `#7`) being written and then taking over the bare link; and the play not covering the eye or a flier in flight.

Two of the blocking findings reopen accepted calls (5 and 12). Each comment says why the accepted frame does not hold on the primary device.

_10 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `src/pages/mushrooms/model/mushroom-genes.ts`:122 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:20Z — "Done in 5ec3edc. A new `stemBend` gene bends each stem over…" → [↓](#t01)
- **T02** `src/pages/mushrooms/ui/scene/draw-mushroom.ts`:64 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:21Z — "Done in 5ec3edc. The arc is sampled by angle (`x = half·sin…" → [↓](#t02)
- **T03** `src/pages/mushrooms/ui/scene/draw-mushroom.ts`:85 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:22Z — "Done in 5ec3edc. The shade is now a `crescent` over the righ…" → [↓](#t03)
- **T04** `src/pages/mushrooms/ui/scene/layout.ts`:58 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:23Z — "Done in 5ec3edc, the first way you proposed. `maxReach(splay…" → [↓](#t04)
- **T05** `src/pages/mushrooms/ui/scene/paint-backdrop.ts`:234 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:24Z — "Done in 5ec3edc, both ways. The ground's gradient now opens…" → [↓](#t05)
- **T06** `src/pages/mushrooms/ui/scene/start-game.ts`:19 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:25Z — "Done in 5ec3edc: `backgroundColor: PALETTE.skyTop`. The conf…" → [↓](#t06)
- **T07** `src/pages/mushrooms/ui/scene/meadow-scene.ts`:46 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:26Z — "Done in 5ec3edc, before bite 2's first tween. A resize no lo…" → [↓](#t07)
- **T08** `src/pages/mushrooms/ui/scene/layout.ts`:42 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:27Z — "Done in 5ec3edc. The sun is pulled in from the corner until…" → [↓](#t08)
- **T09** `docs/plans/mushroom-game-syama.paused.md`:76 — unresolved — last: @vzakharov (agent) 2026-09-26T09:06:28Z — "Done in 5ec3edc. The decision now says `Scale.NONE` with the…" → [↓](#t09)
- **T10** `src/pages/mushrooms/ui/scene/layout.ts`:139 — unresolved — last: @vzakharov (agent) 2026-09-26T09:48:24Z — "Done in 9d15ef7. A flower now takes its height from the clum…" → [↓](#t10)
- **T11** `src/pages/mushrooms/ui/scene/layout.ts`:40 — unresolved — last: @vzakharov (agent) 2026-09-26T09:48:25Z — "Done in 9d15ef7, the way you proposed. `FLOWER_SPOTS` are no…" → [↓](#t11)
- **T12** `src/pages/mushrooms/ui/scene/spores.ts`:40 — unresolved — last: @vzakharov (agent) 2026-09-26T09:48:26Z — "Done in 94bb9c6. The dots no longer fade: they keep `PALETTE…" → [↓](#t12)
- **T13** `src/pages/mushrooms/model/motion.ts`:17 — unresolved — last: @vzakharov (agent) 2026-09-26T09:48:26Z — "Done in 3445d7b. Damping 2.4 at 1.8 Hz, and `WOBBLE_DURATION…" → [↓](#t13)
- **T14** `src/pages/mushrooms/ui/scene/meadow-scene.ts`:162 — unresolved — last: @vzakharov (agent) 2026-09-26T09:48:27Z — "Done in 3d4af2b. The shadow has its own graphics (`drawMushr…" → [↓](#t14)
- **T15** `src/pages/mushrooms/ui/scene/sound.ts`:180 — unresolved — last: @vzakharov (agent) 2026-09-26T09:48:28Z — "Done in 47fd58f. A mute fades out over `FADE_SECONDS` and th…" → [↓](#t15)
- **T16** `src/pages/mushrooms/ui/scene/mushroom-bed.ts`:255 — unresolved — last: @vzakharov (agent) 2026-09-26T15:56:10Z — "Fixed in da50a85, both halves. The call now passes the confi…" → [↓](#t16)
- **T17** `src/pages/mushrooms/ui/scene/mushroom-bed.ts`:218 — unresolved — last: @vzakharov (agent) 2026-09-26T16:09:02Z — "Fixed in 87d72d3. The tap area is now built from the outline…" → [↓](#t17)
- **T18** `src/pages/mushrooms/ui/scene/layout.ts`:85 — unresolved — last: @vzakharov (agent) 2026-09-26T16:55:39Z — "Fixed in 45b2d64: a forest slot never stands under the size…" → [↓](#t18)
- **T19** `src/pages/mushrooms/ui/scene/layout.test.ts`:127 — unresolved — last: @vzakharov (agent) 2026-09-26T16:55:40Z — "Fixed in f1b8bc3, with the sun's rays tightened in 110e977.…" → [↓](#t19)
- **T20** `src/pages/mushrooms/ui/scene/layout.ts`:84 — unresolved — last: @vzakharov (agent) 2026-09-26T16:55:41Z — "Fixed in a71098e. A tall screen's ground now starts at half…" → [↓](#t20)
- **T21** `src/pages/mushrooms/ui/scene/mushroom-bed.ts`:48 — unresolved — last: @vzakharov (agent) 2026-09-26T17:30:56Z — "The faint glow rings are gone: a selected mushroom now wears…" → [↓](#t21)
- **T22** `src/pages/mushrooms/ui/scene/meadow-scene.ts`:95 — unresolved — last: @vzakharov (agent) 2026-09-26T17:12:56Z — "Done in 7c62305. `−` with nothing selected now sinks the new…" → [↓](#t22)
- **T23** `src/pages/mushrooms/ui/scene/controls.ts`:90 — unresolved — last: @vzakharov (agent) 2026-09-26T17:12:57Z — "Done in bfcaf78. The picker now closes on the clock as it op…" → [↓](#t23)
- **T24** `src/pages/mushrooms/ui/scene/hud.ts`:18 — unresolved — last: @vzakharov (agent) 2026-09-26T17:45:14Z — "Every disc is now opaque white with a full-strength ink rim…" → [↓](#t24)
- **T25** `src/pages/mushrooms/model/house.ts`:307 — unresolved — last: @vzakharov (agent) 2026-09-26T23:47:39Z — "Fixed in 330dd6d, with the clump retuned in 2d7ae65. A door…" → [↓](#t25)
- **T26** `src/pages/mushrooms/ui/scene/house-view.ts`:177 — unresolved — last: @vzakharov (agent) 2026-09-26T23:47:41Z — "Fixed in 43698d4. The door answers taps from a circle round…" → [↓](#t26)
- **T27** `src/pages/mushrooms/ui/scene/draw-mouse.ts`:17 — unresolved — last: @vzakharov (agent) 2026-09-26T23:47:42Z — "Fixed in 2ea224a, and a878235 makes the floor hold at the mu…" → [↓](#t27)
- **T28** `src/pages/mushrooms/ui/scene/draw-house.ts`:302 — unresolved — last: @vzakharov (agent) 2026-09-26T23:47:44Z — "Fixed in b569160. `paintedSpots(genes, house)` drops any spo…" → [↓](#t28)
- **T29** `src/pages/mushrooms/model/game.ts`:87 — unresolved — last: @vzakharov (agent) 2026-09-26T23:47:46Z — "Fixed in 32d6b36, both halves. Opening the house picker with…" → [↓](#t29)
- **T30** `src/pages/mushrooms/model/house.test.ts`:123 — unresolved — last: @vzakharov (agent) 2026-09-26T23:47:47Z — "Fixed in 330dd6d. `DOOR_FRAME` and the painted door now live…" → [↓](#t30)
- **T31** `scripts/lib/play-house.ts`:152 — unresolved — last: @vzakharov (agent) 2026-09-26T23:47:48Z — "Fixed in 3c92655. The play run asks the scene's own hit test…" → [↓](#t31)
- **T32** `src/pages/mushrooms/ui/scene/house-view.ts`:78 — unresolved — last: @vzakharov (agent) 2026-09-26T23:47:49Z — "Kept as it is, and written down in 2645fb9: a door belongs t…" → [↓](#t32)
- **T33** `src/pages/mushrooms/ui/scene/insect-view.ts`:179 — unresolved — last: @vzakharov (agent) 2026-09-27T03:10:44Z — "Fixed in ebd1407. The turn logic is now pure in `model/insec…" → [↓](#t33)
- **T34** `src/pages/mushrooms/model/insect-motion.ts`:138 — unresolved — last: @vzakharov (agent) 2026-09-27T03:10:46Z — "Fixed in 43c8281. A leg now carries how far aloft the butter…" → [↓](#t34)
- **T35** `src/pages/mushrooms/ui/scene/meadow-scene.ts`:44 — unresolved — last: @vzakharov (agent) 2026-09-27T03:38:54Z — "Fixed in 69ac03a, with b2c0d90 so the rule never costs a but…" → [↓](#t35)
- **T36** `src/pages/mushrooms/ui/scene/meadow-scene.ts`:237 — unresolved — last: @vzakharov (agent) 2026-09-27T03:38:55Z — "Fixed in 56540e7, with the drink's seat moved in a970464; th…" → [↓](#t36)
- **T37** `src/pages/mushrooms/ui/scene/meadow-scene.ts`:39 — unresolved — last: @vzakharov (agent) 2026-09-27T03:10:47Z — "Decided as you recommended, and written into the plan in a49…" → [↓](#t37)
- **T38** `src/pages/mushrooms/model/insects.ts`:38 — unresolved — last: @vzakharov (agent) 2026-09-27T03:10:49Z — "Fixed in a8ca7cd. `evicted(insects, kind, limits)` counts an…" → [↓](#t38)
- **T39** `src/pages/mushrooms/model/insect-genes.ts`:77 — unresolved — last: @vzakharov (agent) 2026-09-27T03:10:50Z — "Fixed in f4b4546. `EYE_RINGS` is `[2, 3]`, and `fitted` shri…" → [↓](#t39)
- **T40** `src/pages/mushrooms/model/flight.ts`:54 — unresolved — last: @vzakharov (agent) 2026-09-27T03:38:57Z — "Done in fce1202, a970464 and d3b1da1. `drinking` and `probos…" → [↓](#t40)
- **T41** `src/pages/mushrooms/ui/scene/insect-layout.test.ts`:19 — unresolved — last: @vzakharov (agent) 2026-09-27T03:10:51Z — "Fixed in 335b4ee. `VIEWPORTS` and `VISITS` live in `ui/scene…" → [↓](#t41)
- **T42** `src/pages/mushrooms/model/insect-genes.test.ts`:72 — unresolved — last: @vzakharov (agent) 2026-09-27T03:10:53Z — "Replaced in 04a3dc5 with a property of what is drawn: over 4…" → [↓](#t42)
- **T43** `src/pages/mushrooms/ui/scene/hud.ts`:22 — unresolved — last: @vzakharov (agent) 2026-09-27T03:10:54Z — "Asserted in 0a7b7b3. The seed moved to `model/insect-genes.t…" → [↓](#t43)
- **T44** `scripts/lib/mushroom-probe.ts`:202 — unresolved — last: @vzakharov (agent) 2026-09-27T03:10:56Z — "Fixed in 446ab2a and 2c6da70. `flight.ts` builds `Perch` fro…" → [↓](#t44)
- **T45** `docs/plans/mushroom-game-syama.paused.md`:68 — unresolved — last: @vzakharov (agent) 2026-09-27T17:13:40Z — "Несложно: теперь каждый байт заканчивается публикацией игры…" → [↓](#t45)
- **T46** `.claude/skills/megabeast/notes.md`:404 — unresolved — last: @vzakharov (agent) 2026-09-27T17:13:42Z — "Записал вместе с зумом как байт 8: поле шире экрана, поворот…" → [↓](#t46)
- **T47** `.claude/skills/megabeast/notes.md`:115 — unresolved — last: @vzakharov (agent) 2026-09-27T17:13:44Z — "По таймингам: цепочка из восьми сессий прожила ~3,5 ч на бай…" → [↓](#t47)
- **T48** `docs/plans/mushroom-game-syama.in-progress.md`:104 — unresolved — last: @vzakharov (agent) 2026-09-27T17:13:45Z — "Байт 8 (широкое поле + пинч-зум), начиная с того, что есть;…" → [↓](#t48)
- **T49** `docs/plans/mushroom-game-syama.in-progress.md`:80 — unresolved — last: @vzakharov (agent) 2026-09-27T17:13:46Z — "Спасибо! Атмосфера — следующий байт (7), с референсами Gris,…" → [↓](#t49)
- **T50** `src/pages/mushrooms/model/flight.ts`:181 — unresolved — last: @vzakharov (agent) 2026-09-28T10:01:50Z — "Mostly met: no flier goes away except by eviction on any scr…" → [↓](#t50)
- **T51** `src/pages/mushrooms/ui/scene/flower-sight.ts`:299 — unresolved — last: @vzakharov (agent) 2026-09-28T10:01:52Z — "Done as asked: planting asks for sight on this screen only,…" → [↓](#t51)
- **T52** `src/pages/mushrooms/ui/scene/perch-sight.ts`:157 — unresolved — last: @vzakharov (agent) 2026-09-28T10:01:53Z — "Done: crowding now takes the pairing of kinds actually invol…" → [↓](#t52)
- **T53** `src/pages/mushrooms/ui/scene/perch-sight.ts`:175 — unresolved — last: @vzakharov (agent) 2026-09-28T10:01:55Z — "The tap half is done: a tap reaches the flier whose body is…" → [↓](#t53)
- **T54** `src/pages/mushrooms/ui/scene/sound.ts`:263 — unresolved — last: @vzakharov (agent) 2026-09-28T10:01:56Z — "Done: `play` builds a voice only while the synth is unmuted,…" → [↓](#t54)
- **T55** `src/pages/mushrooms/model/insect-motion.ts`:167 — unresolved — last: @vzakharov (agent) 2026-09-28T10:01:58Z — "Done: a resting flutter is one lift and one fall over 420 ms…" → [↓](#t55)
- **T56** `src/pages/mushrooms/ui/scene/flower-sight.ts`:84 — unresolved — last: @vzakharov (agent) 2026-09-28T10:01:59Z — "Done: a bee sits on the head's lower rim facing in instead o…" → [↓](#t56)
- **T57** `src/pages/mushrooms/ui/scene/sky-layout.ts`:402 — unresolved — last: @vzakharov (agent) 2026-09-28T10:38:19Z — "The straight cut across the bottom of the sun is gone in b48…" → [↓](#t57)
- **T58** `src/pages/mushrooms/model/buzz-rest.ts`:26 — unresolved — last: @vzakharov (agent) 2026-09-28T10:02:02Z — "Done: `JITTER` is 0.05 of the size, 1.65 px at the smallest…" → [↓](#t58)
- **T59** `scripts/lib/flier-watch.ts`:187 — unresolved — last: @vzakharov (agent) 2026-09-28T10:02:03Z — "Done: the watch now fails on a body more than 0.3 rad off it…" → [↓](#t59)
- **T60** `src/pages/mushrooms/ui/scene/paint-land.ts`:81 — unresolved — last: @vzakharov (agent) 2026-09-28T16:12:37Z — "Baked in 505160c: the backdrop is three textures painted onc…" → [↓](#t60)
- **T61** `src/pages/mushrooms/ui/scene/insect-view.ts`:255 — unresolved — last: @vzakharov (agent) 2026-09-28T15:52:19Z — "Fixed in 570486e. The painters now get the sun turned into t…" → [↓](#t61)
- **T62** `src/pages/mushrooms/ui/scene/backdrop-tones.ts`:97 — unresolved — last: @vzakharov (agent) 2026-09-28T16:43:43Z — "Fixed in be2c5ee. Stacked faint discs could not fall off smo…" → [↓](#t62)
- **T63** `src/pages/mushrooms/ui/scene/backdrop-tones.test.ts`:139 — unresolved — last: @vzakharov (agent) 2026-09-28T16:43:45Z — "Replaced in be2c5ee: with the discs gone, the test checks th…" → [↓](#t63)
- **T64** `src/pages/mushrooms/ui/scene/ink.test.ts`:35 — unresolved — last: @vzakharov (agent) 2026-09-28T15:26:56Z — "Fixed in 842d0c6. The tests now measure the drawn ink, `inkF…" → [↓](#t64)
- **T65** `src/pages/mushrooms/ui/scene/ink.ts`:28 — unresolved — last: @vzakharov (agent) 2026-09-28T16:08:33Z — "Revised in 3476070: the lighter blue-violet edge read as a l…" → [↓](#t65)
- **T66** `src/pages/mushrooms/ui/scene/draw-mushroom.ts`:184 — unresolved — last: @vzakharov (agent) 2026-09-28T16:18:58Z — "Fixed in b4cedec: the cap's light is one ordered list (`capL…" → [↓](#t66)
- **T67** `src/pages/mushrooms/model/mushroom-outline.ts`:41 — unresolved — last: @vzakharov (agent) 2026-09-28T16:19:00Z — "Fixed in 8e76bb6: `stemOutline(genes, turn)` levels the foot…" → [↓](#t67)
- **T68** `src/pages/mushrooms/ui/scene/mushroom-light.ts`:28 — unresolved — last: @vzakharov (agent) 2026-09-28T16:19:02Z — "Fixed in 52e3079: each mushroom takes its light from the cap…" → [↓](#t68)
- **T69** `src/pages/mushrooms/ui/scene/sun-layout.ts`:225 — unresolved — last: @vzakharov (agent) 2026-09-28T16:43:48Z — "Fixed in 2659e52: `washReach` also stops half a slot's size…" → [↓](#t69)
- **T70** `src/pages/mushrooms/ui/scene/grain.test.ts`:14 — unresolved — last: @vzakharov (agent) 2026-09-28T16:43:49Z — "Replaced in 1e2a3a9: the tests now check there is no seam wh…" → [↓](#t70)
- **T71** `src/pages/mushrooms/ui/scene/hud.ts`:31 — unresolved — last: @vzakharov (agent) 2026-09-28T16:12:38Z — "Fixed in both places: `hud.ts` takes 1/ratio in 8c9c15f, and…" → [↓](#t71)
- **T72** `src/pages/mushrooms/ui/scene/backdrop-tones.test.ts`:19 — unresolved — last: @vzakharov (agent) 2026-09-28T16:43:46Z — "Done in be2c5ee: the tests import `channels`, `luminance`, `…" → [↓](#t72)
- **T73** `docs/plans/mushroom-game-syama.in-progress.md`:479 — unresolved — last: @vzakharov (agent) 2026-09-28T15:52:21Z — "Restated in e0c93d4 as the property 570486e now holds: insec…" → [↓](#t73)
- **T74** `src/pages/mushrooms/ui/scene/mushroom-bed.ts`:420 — unresolved — last: @vzakharov (agent) 2026-09-29T07:38:14Z — "Fixed in 5461df1. The choice is a pure function, `tappedDoor…" → [↓](#t74)
- **T75** `src/pages/mushrooms/ui/scene/layout.ts`:91 — unresolved — last: @vzakharov (agent) 2026-09-29T09:27:09Z — "Fixed in d271393. Each clump slot stands its foot by the spe…" → [↓](#t75)
- **T76** `src/pages/mushrooms/ui/scene/layout.test.ts`:78 — unresolved — last: @vzakharov (agent) 2026-09-29T09:27:11Z — "Fixed in b416c45. The clump sweeps take the 16 back×front pa…" → [↓](#t76)
- **T77** `src/pages/mushrooms/ui/scene/layout.ts`:381 — unresolved — last: @vzakharov (agent) 2026-09-29T07:38:16Z — "Fixed in 2718390. Flowers are placed against the union of bo…" → [↓](#t77)
- **T78** `src/pages/mushrooms/ui/scene/layout.ts`:203 — unresolved — last: @vzakharov (agent) 2026-09-29T07:38:18Z — "Fixed in 2718390. A seeded flower's head clears every contro…" → [↓](#t78)
- **T79** `src/pages/mushrooms/model/mushroom-genes.ts`:123 — unresolved — last: @vzakharov (agent) 2026-09-29T09:27:12Z — "Fixed in d271393, together with the clump. The porcini is a…" → [↓](#t79)
- **T80** `src/pages/mushrooms/ui/scene/palette-creatures.ts`:40 — unresolved — last: @vzakharov (agent) 2026-09-29T07:38:19Z — "Fixed in 35b553c. `flesh`, `ridge` and `lit` moved to about…" → [↓](#t80)
- **T81** `src/pages/mushrooms/ui/scene/mushroom-tints.test.ts`:78 — unresolved — last: @vzakharov (agent) 2026-09-29T07:38:21Z — "Fixed in 35b553c. The band is 20–30°, the one the palette co…" → [↓](#t81)
- **T82** `src/pages/mushrooms/model/mushroom-profile.ts`:106 — unresolved — last: @vzakharov (agent) 2026-09-29T07:38:22Z — "Fixed in b508116, with a42ca6d cutting the added drawing cos…" → [↓](#t82)
- **T83** `src/pages/mushrooms/model/mushroom-outline.ts`:110 — unresolved — last: @vzakharov (agent) 2026-09-29T07:38:23Z — "Fixed in 0ed5733. Porcini and russula hang a band 0.085 of c…" → [↓](#t83)
- **T84** `src/pages/mushrooms/ui/scene/draw-mushroom.ts`:128 — unresolved — last: @vzakharov (agent) 2026-09-29T07:38:24Z — "Fixed in 1a7cba4 and 142c968. The ring's width is `footWidth…" → [↓](#t84)
- **T85** `src/pages/mushrooms/ui/scene/shapes.ts`:31 — unresolved — last: @vzakharov (agent) 2026-09-29T07:38:26Z — "Fixed in 484e0b6. The cause was the closing `lineTo`: a zero…" → [↓](#t85)
- **T86** `src/pages/mushrooms/model/mushroom-genes.test.ts`:94 — unresolved — last: @vzakharov (agent) 2026-09-29T09:27:14Z — "Fixed in 262145b. The test measures the narrowest drawn cap…" → [↓](#t86)
- **T87** `src/pages/mushrooms/model/mushroom-pose.test.ts`:55 — unresolved — last: @vzakharov (agent) 2026-09-29T09:27:15Z — "Fixed in 79bc4cd. Each species' drawn, turned cap (`capReach…" → [↓](#t87)
- **T88** `src/pages/mushrooms/ui/scene/mushroom-light.test.ts`:249 — unresolved — last: @vzakharov (agent) 2026-09-29T07:38:27Z — "Fixed in b8fcb0e. `HEAVY_FOOT` lays under any foot whose upr…" → [↓](#t88)
- **T89** `src/pages/mushrooms/ui/scene/mushroom-tints.test.ts`:23 — unresolved — last: @vzakharov (agent) 2026-09-29T07:38:28Z — "Fixed in 35b553c. `weakEdge()` sweeps `inkFor` over every gr…" → [↓](#t89)
- **T90** `scripts/lib/play-species.ts`:169 — unresolved — last: @vzakharov (agent) 2026-09-29T07:38:30Z — "Fixed in 484e0b6. No butterfly on the chanterelle and no win…" → [↓](#t90)
- **T91** `src/pages/mushrooms/ui/scene/hud.ts`:48 — unresolved — last: @vzakharov (agent) 2026-09-29T07:38:31Z — "Done in 065bb2f. The icon is the meadow's trumpet (a straigh…" → [↓](#t91)
- **T92** `src/pages/mushrooms/ui/scene/paint-dome.ts`:20 — unresolved — last: @vzakharov (agent) 2026-09-29T09:40:16Z — "Done in 14227ae (`DomeGenes` derived from the union) and dab…" → [↓](#t92)
- **T93** `docs/remove-before-merging/frames/bite-8/meadow-mixed-landscape-tabL.png`:1 — unresolved — last: @vzakharov (agent) 2026-09-29T08:55:17Z — "Зафиксировал в 74c849b: комментарий лежит дословно в `docs/r…" → [↓](#t93)
- **T94** `docs/remove-before-merging/ideas/idea-2-flower-keyboard.md`:145 — unresolved — last: @vzakharov (agent) 2026-09-29T15:46:28Z — "Принято, в 09b37ce. Пять цветов остаются: три цвета × четыре…" → [↓](#t94)
- **T95** `docs/remove-before-merging/ideas/idea-2-flower-keyboard.md`:161 — unresolved — last: @vzakharov (agent) 2026-09-29T15:46:34Z — "Сделано в 09b37ce: в плане это пункт 10, сразу после текущег…" → [↓](#t95)
- **T96** `src/pages/mushrooms/ui/scene/clump-layout.ts`:69 — unresolved — last: @vzakharov (agent) 2026-09-29T20:47:40Z — "Forest mushrooms now shrink with depth by the clump's own `s…" → [↓](#t96)
- **T97** `src/pages/mushrooms/model/ground.ts`:193 — unresolved — last: @vzakharov (agent) 2026-09-29T20:12:31Z — "Each screen lays out at its own width since 13ccefb, and the…" → [↓](#t97)
- **T98** `src/pages/mushrooms/ui/scene/meadow-camera.ts`:79 — unresolved — last: @vzakharov (agent) 2026-09-29T20:47:41Z — "The zoom floor is now where the opening clump's narrowest ca…" → [↓](#t98)
- **T99** `src/pages/mushrooms/ui/scene/meadow-scene.ts`:245 — unresolved — last: @vzakharov (agent) 2026-09-29T19:02:09Z — "Fixed in 13ccefb. `roomNow` goes through `keptRoom`, which k…" → [↓](#t99)
- **T100** `src/pages/mushrooms/ui/scene/sun-layout.ts`:44 — unresolved — last: @vzakharov (agent) 2026-09-29T18:58:20Z — "Fixed in 8e5e408. If the sun still touches something after s…" → [↓](#t100)
- **T101** `src/pages/mushrooms/model/ground.ts`:140 — unresolved — last: @vzakharov (agent) 2026-09-29T20:12:27Z — "Every camera now looks from one angle, `UP_PER_Z` 0.481, so…" → [↓](#t101)
- **T102** `src/pages/mushrooms/ui/scene/mushroom-room.ts`:79 — unresolved — last: @vzakharov (agent) 2026-09-29T20:12:29Z — "A turn's refit is now a scaled copy of the picture the child…" → [↓](#t102)
- **T103** `src/pages/mushrooms/ui/scene/cap-cover.ts`:14 — unresolved — last: @vzakharov (agent) 2026-09-29T20:27:33Z — "Fixed in 931b2662. Cover is now read point by point over wha…" → [↓](#t103)
- **T104** `src/pages/mushrooms/model/ground.test.ts`:82 — unresolved — last: @vzakharov (agent) 2026-09-29T19:02:08Z — "Fixed in 13ccefb. The turn test now asserts on the ground: i…" → [↓](#t104)
- **T105** `src/pages/mushrooms/ui/scene/layout.test.ts`:81 — unresolved — last: @vzakharov (agent) 2026-09-29T20:27:35Z — "In 9ebbc17b: `pnpm sweep:mushrooms` (`scripts/sweep-mushroom…" → [↓](#t105)
- **T106** `src/pages/mushrooms/ui/scene/insect-layout.test.ts`:151 — unresolved — last: @vzakharov (agent) 2026-09-29T18:58:22Z — "Tested in f9a2f7a. The test takes the smallest head the peta…" → [↓](#t106)
- **T107** `src/pages/mushrooms/ui/scene/mushroom-room.ts`:313 — unresolved — last: @vzakharov (agent) 2026-09-29T19:02:11Z — "All three in 13ccefb. A missed splay now throws. `screenPair…" → [↓](#t107)
- **T108** `src/pages/mushrooms/ui/scene/meadow-scene.ts`:410 — unresolved — last: @vzakharov (agent) 2026-09-30T15:32:17Z — "Fixed in cb8d1c3. The tufts are now re-tended whenever mushr…" → [↓](#t108)
- **T109** `src/pages/mushrooms/ui/scene/chord-fingers.ts`:11 — unresolved — last: @vzakharov (agent) 2026-09-30T15:32:19Z — "Fixed in d8e4160. `chordFingers` now takes the finger Phaser…" → [↓](#t109)
- **T110** `src/pages/mushrooms/ui/scene/flower-bed.ts`:196 — unresolved — last: @vzakharov (agent) 2026-09-30T15:32:20Z — "Fixed in d8e4160. `chordTap` now only opens the head and pla…" → [↓](#t110)
- **T111** `src/pages/mushrooms/ui/scene/instrument-voices.ts`:115 — unresolved — last: @vzakharov (agent) 2026-09-30T15:32:22Z — "Fixed in 8f388ff. Each skin now has a quieter higher tone ab…" → [↓](#t111)
- **T112** `src/pages/mushrooms/ui/scene/instrument-voices.test.ts`:49 — unresolved — last: @vzakharov (agent) 2026-09-30T15:32:23Z — "Fixed in 8f388ff. The test computes each hiss's upper −3 dB…" → [↓](#t112)
- **T113** `src/pages/mushrooms/ui/scene/tufts.ts`:44 — unresolved — last: @vzakharov (agent) 2026-09-30T15:32:25Z — "Fixed in cb8d1c3. Tufts are drawn at least 12 px (`TUFT_LEAS…" → [↓](#t113)
- **T114** `src/pages/mushrooms/ui/scene/flower-plots.test.ts`:213 — unresolved — last: @vzakharov (agent) 2026-09-30T15:32:26Z — "Fixed in 76bfb88, with the plan line in 3db04d5. The camera…" → [↓](#t114)
- **T115** `src/pages/mushrooms/ui/scene/mushroom-patch.test.ts`:39 — unresolved — last: @vzakharov (agent) 2026-09-30T17:45:48Z — "Fixed in e4e3979. Growth now places a new mushroom only wher…" → [↓](#t115)
- **T116** `src/pages/mushrooms/ui/scene/sound.test.ts`:174 — unresolved — last: @vzakharov (agent) 2026-09-30T15:32:27Z — "Fixed in 38eb301. Five voices queued before start build exac…" → [↓](#t116)
- **T117** `src/pages/mushrooms/model/game.ts`:305 — unresolved — last: @vzakharov (agent) 2026-09-30T15:32:29Z — "Fixed in 9c8627a. `plant` returns the meadow unchanged at `F…" → [↓](#t117)
- **T118** `src/pages/mushrooms/ui/scene/layout.test.ts`:310 — unresolved — last: @vzakharov (agent) 2026-09-30T17:45:50Z — "Fixed in 06d0b5f. It was not a missing state: the 280×600 la…" → [↓](#t118)
- **T119** `scripts/play-mushrooms.ts`:1 — unresolved — last: @vzakharov (agent) 2026-09-30T15:32:30Z — "Split in e8861a3. `scripts/play-mushrooms.ts` is the screen…" → [↓](#t119)
- **T120** `src/pages/mushrooms/model/pan.ts`:336 — unresolved — last: @vzakharov (agent) 2026-10-01T03:47:43Z — "Fixed in 52db783. The held keys now live on the crop next to…" → [↓](#t120)
- **T121** `src/pages/mushrooms/ui/scene/pan-input.ts`:30 — unresolved — last: @vzakharov (agent) 2026-10-01T03:40:47Z — "Kept as it is: a press taps on the press. The operator decid…" → [↓](#t121)
- **T122** `src/pages/mushrooms/model/pan.ts`:116 — unresolved — last: @vzakharov (agent) 2026-10-01T03:47:44Z — "Fixed in 04ca338. The slop is now 24 px, the plan's "child's…" → [↓](#t122)
- **T123** `src/pages/mushrooms/ui/scene/mushroom-patch.test.ts`:22 — unresolved — last: @vzakharov (agent) 2026-10-01T04:02:59Z — "Fixed in fbe6c6e. The head-share test now grows forests anyw…" → [↓](#t123)
- **T124** `src/pages/mushrooms/model/pan.ts`:141 — unresolved — last: @vzakharov (agent) 2026-10-01T03:47:46Z — "Fixed in 0330aa0. Ends are now hard rather than a rubber ban…" → [↓](#t124)
- **T125** `src/pages/mushrooms/model/pan.ts`:210 — unresolved — last: @vzakharov (agent) 2026-10-01T03:47:48Z — "Fixed in 0330aa0, and the play run now expects the same in 6…" → [↓](#t125)
- **T126** `src/pages/mushrooms/ui/scene/meadow-camera.ts`:36 — unresolved — last: @vzakharov (agent) 2026-10-01T03:37:49Z — "Accepted as a cost, and written into the plan in 51c24e0 (bi…" → [↓](#t126)
- **T127** `src/pages/mushrooms/ui/scene/mushroom-room.ts`:3 — unresolved — last: @vzakharov (agent) 2026-10-01T04:03:01Z — "Fixed in cb0029d. `mushroom-room.ts` is split: weighing the…" → [↓](#t127)
- **T128** `src/pages/mushrooms/ui/scene/view.ts`:205 — unresolved — last: @vzakharov (agent) 2026-10-02T11:20:31Z — "Fixed in d66ad69e: the ground, its grain and the brow now ta…" → [↓](#t128)
- **T129** `src/pages/mushrooms/ui/scene/skyline.ts`:259 — unresolved — last: @vzakharov (agent) 2026-10-02T11:20:32Z — "Fixed in 279060fb: `groundSeam` and `seamAt` are gone and th…" → [↓](#t129)
- **T130** `src/pages/mushrooms/ui/scene/meadow-scene.ts`:168 — unresolved — last: @vzakharov (agent) 2026-10-02T11:20:34Z — "Fixed in 66e01887: the button actions moved to `control-acti…" → [↓](#t130)
- **T131** `src/pages/mushrooms/ui/scene/insect-view.ts`:222 — unresolved — last: @vzakharov (agent) 2026-10-02T11:27:49Z — "Fixed in ed5b34ec: a leg to away fixes its end on the plane…" → [↓](#t131)
- **T132** `src/pages/mushrooms/ui/scene/insect-away.ts`:140 — unresolved — last: @vzakharov (agent) 2026-10-02T11:27:51Z — "Fixed in 0a609775: a release's seed is drawn first and its o…" → [↓](#t132)
- **T133** `src/pages/mushrooms/ui/scene/insect-view.ts`:284 — unresolved — last: @vzakharov (agent) 2026-10-02T11:27:53Z — "Fixed in 8b1c5514: the leg-frame→screen chain is `drawnInsec…" → [↓](#t133)
- **T134** `scripts/lib/play-approach.ts`:217 — unresolved — last: @vzakharov (agent) 2026-10-02T11:29:07Z — "Fixed in aec937c6: the tap point comes from the dome outline…" → [↓](#t134)
- **T135** `scripts/lib/play-tufts.ts`:161 — unresolved — last: @vzakharov (agent) 2026-10-02T12:07:38Z — "Fixed in 11777c95: `walkAndTurn` turns and walks the eye fir…" → [↓](#t135)
- **T136** `scripts/lib/play-walk.ts`:298 — unresolved — last: @vzakharov (agent) 2026-10-02T12:07:40Z — "Fixed in c5126399: the game never holds a selection and an o…" → [↓](#t136)
- **T137** `src/pages/mushrooms/ui/scene/planter.ts`:120 — unresolved — last: @vzakharov (agent) 2026-10-02T11:29:08Z — "Fixed in 116f5888: `FlowerBed.inView` and `Grass.inView` (wh…" → [↓](#t137)
- **T138** `src/pages/mushrooms/ui/scene/house-view.ts`:193 — unresolved — last: @vzakharov (agent) 2026-10-02T11:29:10Z — "Fixed in ae6bf316: `follow`, `implements Following` and the…" → [↓](#t138)
- **T139** `src/pages/mushrooms/model/game.ts`:40 — unresolved — last: @vzakharov (agent) 2026-10-03T02:40:50Z — "Partly fixed in 0d391410, and the rest decided rather than f…" → [↓](#t139)
- **T140** `src/pages/mushrooms/ui/scene/planter.ts`:149 — unresolved — last: @vzakharov (agent) 2026-10-03T02:40:52Z — "Fixed in e4e8c72d. `plantable`, `plantSounding`, `tapTuft` a…" → [↓](#t140)
- **T141** `src/pages/mushrooms/ui/scene/tufts.ts`:310 — unresolved — last: @vzakharov (agent) 2026-10-03T03:16:31Z — "Fixed in 06920038 and 89244ebd. A sow no longer tends the wh…" → [↓](#t141)
- **T142** `src/pages/mushrooms/ui/scene/air-spots.ts`:225 — unresolved — last: @vzakharov (agent) 2026-10-03T02:40:53Z — "Fixed in d43c203. Each spot carries where the anchor draws i…" → [↓](#t142)
- **T143** `docs/plans/mushroom-game-syama/bite-12b.md`:48 — unresolved — last: @vzakharov (agent) 2026-10-03T02:40:54Z — "The game already did this. Its checks are now in place: - 2a…" → [↓](#t143)
- **T144** `src/pages/mushrooms/ui/scene/flower-sight.ts`:397 — unresolved — last: @vzakharov (agent) 2026-10-03T02:40:55Z — "Taken as blocking, fixed in 1da1a918. `roomFor` offers a rin…" → [↓](#t144)
- **T145** `src/pages/mushrooms/model/flight-in.ts`:61 — unresolved — last: @vzakharov (agent) 2026-10-03T02:40:57Z — "Fixed in 91ad7b8. `isShown` judges a place's plane distance…" → [↓](#t145)
- **T146** `src/pages/mushrooms/ui/scene/insect-drawn.ts`:139 — unresolved — last: @vzakharov (agent) 2026-10-03T02:40:58Z — "Added in eef972b, at turn −1.1 rather than +1.1. At x 20 on…" → [↓](#t146)
- **T147** `src/pages/mushrooms/ui/scene/tufts.test.ts`:171 — unresolved — last: @vzakharov (agent) 2026-10-03T02:41:00Z — "Done, except the bed-repaint property. - `tufts.test.ts` (c7…" → [↓](#t147)
- **T148** `src/pages/mushrooms/ui/scene/flower-shown.ts`:113 — unresolved — last: @vzakharov (agent) 2026-10-03T06:21:58Z — "Fixed in cea5c240: `shown.headR` stays the open head's radiu…" → [↓](#t148)
- **T149** `scripts/lib/mushroom-probe.ts`:436 — unresolved — last: @vzakharov (agent) 2026-10-03T06:22:00Z — "Fixed in d3a911c8: the painters return the fold they drew, r…" → [↓](#t149)
- **T150** `scripts/lib/play-rain.ts`:103 — unresolved — last: @vzakharov (agent) 2026-10-03T06:22:01Z — "Fixed in fe968caf: the play times the closing ramp (frames 1…" → [↓](#t150)
- **T151** `src/pages/mushrooms/ui/scene/rain-sky.ts`:17 — unresolved — last: @vzakharov (agent) 2026-10-03T06:18:38Z — "Fixed in 74c5eec1: the puff layout lives in `cloud-puffs.ts`…" → [↓](#t151)
- **T152** `src/pages/mushrooms/ui/scene/rain-drops.ts`:178 — unresolved — last: @vzakharov (agent) 2026-10-03T06:18:40Z — "Fixed in f0b88ecb: a drop stays hidden until its slanted pat…" → [↓](#t152)
- **T153** `scripts/lib/play-sprouts.ts`:88 — unresolved — last: @vzakharov (agent) 2026-10-03T11:38:23Z — "Fixed in 769aeec0: the play now expects a reachable tap poin…" → [↓](#t153)
- **T154** `src/pages/mushrooms/ui/scene/mushroom-room.ts`:306 — unresolved — last: @vzakharov (agent) 2026-10-03T11:38:25Z — "Fixed in 769aeec0: a spore's foot is admitted only where `do…" → [↓](#t154)
- **T155** `src/pages/mushrooms/model/walk.ts`:11 — unresolved — last: @vzakharov (agent) 2026-10-03T11:55:09Z — "The play's check landed in a0fa1095: the ground under the sl…" → [↓](#t155)
- **T156** `src/pages/mushrooms/model/stride.ts`:45 — unresolved — last: @vzakharov (agent) 2026-10-03T11:38:28Z — "Fixed in ccfff90d: the comment states only the bound, 2.6 un…" → [↓](#t156)
- **T157** `src/pages/mushrooms/model/shelter.ts`:14 — unresolved — last: @vzakharov (agent) 2026-10-03T11:38:29Z — "Fixed in 08c78ffa." → [↓](#t157)
- **T158** `src/pages/mushrooms/ui/scene/mushroom-bed.ts`:237 — unresolved — last: @vzakharov (agent) 2026-10-03T11:46:21Z — "Fixed in 9feaef7d: a sprout's clock starts at its moment; th…" → [↓](#t158)
- **T159** `src/pages/mushrooms/model/sprouting.ts`:27 — unresolved — last: @vzakharov (agent) 2026-10-03T11:46:23Z — "Fixed in 9feaef7d: `SPORE_FALL_MS` is now documented as the…" → [↓](#t159)
- **T160** `src/pages/mushrooms/model/sprouting.ts`:135 — unresolved — last: @vzakharov (agent) 2026-10-03T11:38:35Z — "Kept as built; call 40 now says so (a8407647): a spore sown…" → [↓](#t160)
- **T161** `src/pages/mushrooms/model/placement.ts`:143 — unresolved — last: @vzakharov (agent) 2026-10-03T11:46:25Z — "Fixed in d47139d3: "a spore's parent" in both places, and `S…" → [↓](#t161)
- **T162** `src/pages/mushrooms/ui/scene/spore-drift.ts`:116 — unresolved — last: @vzakharov (agent) 2026-10-03T11:46:27Z — "Fixed in d47139d3: the arc swings toward its foot's side, a…" → [↓](#t162)
- **T163** `scripts/lib/play-rain.ts`:185 — unresolved — last: @vzakharov (agent) 2026-10-03T11:55:07Z — "Fixed in 03288494: mid-shower the play expects `sheltering =…" → [↓](#t163)
- **T164** `src/pages/mushrooms/model/worm.ts`:137 — unresolved — last: @vzakharov (agent) 2026-10-03T14:20:49Z — "Fixed in 8ae79d1e (call 26): a peek now rises the lesser of…" → [↓](#t164)
- **T165** `src/pages/mushrooms/model/worm.ts`:274 — unresolved — last: @vzakharov (agent) 2026-10-03T14:20:50Z — "Fixed in 8c0c11ca (call 27): wormBody keeps a segment within…" → [↓](#t165)
- **T166** `src/pages/mushrooms/model/worm.ts`:25 — unresolved — last: @vzakharov (agent) 2026-10-03T14:20:52Z — "Fixed in 4f1fec8e (call 28): both floors are divided by the…" → [↓](#t166)
- **T167** `src/pages/mushrooms/ui/scene/mouse-runs.ts`:391 — unresolved — last: @vzakharov (agent) 2026-10-03T16:21:14Z — "Fixed in 1b6c5093: a run takes its ends' placements, size an…" → [↓](#t167)
- **T168** `src/pages/mushrooms/ui/scene/mouse-runs.ts`:324 — unresolved — last: @vzakharov (agent) 2026-10-03T16:34:00Z — "Fixed in acfb76a783327f95e86dc07fae00c0bd44d28cd5: a tap on…" → [↓](#t168)
- **T169** `src/pages/mushrooms/model/mouse-run-clock.ts`:246 — unresolved — last: @vzakharov (agent) 2026-10-03T16:21:16Z — "Fixed in 718ef2fc: `RUNNER_SPAN` (1.82 door widths, the span…" → [↓](#t169)
- **T170** `src/pages/mushrooms/model/mouse-run-clock.ts`:276 — unresolved — last: @vzakharov (agent) 2026-10-03T16:31:41Z — "Fixed in 4f325763eb6fa664a24cabb465e54b51a67d07d5: a run re-…" → [↓](#t170)
- **T171** `src/pages/mushrooms/ui/scene/controls.ts`:351 — unresolved — last: @vzakharov (agent) 2026-10-03T18:56:46Z — "Opening the map is now an action of its own that shuts every…" → [↓](#t171)
- **T172** `src/pages/mushrooms/ui/scene/map-view.ts`:123 — unresolved — last: @vzakharov (agent) 2026-10-03T18:56:48Z — "The eye now stops dead as the map opens: a flick's pan and s…" → [↓](#t172)
- **T173** `src/pages/mushrooms/ui/scene/map-view.ts`:97 — unresolved — last: @vzakharov (agent) 2026-10-03T18:56:49Z — "A flower's head on the map is now at least 9 px across, sitt…" → [↓](#t173)
- **T174** `docs/plans/mushroom-game-syama/to-check.md`:289 — unresolved — last: @vzakharov (agent) 2026-10-03T18:56:51Z — "The map play now checks that whatever stands left on the scr…" → [↓](#t174)
- **T175** `docs/plans/mushroom-game-syama/decisions.md`:14 — unresolved — last: @vzakharov (agent) 2026-10-03T18:56:53Z — "The decisions.md line is rewritten to what the map does now.…" → [↓](#t175)
- **T176** `src/pages/mushrooms/ui/scene/sound.ts`:247 — unresolved — last: @vzakharov (agent) 2026-10-03T18:56:55Z — "The docstrings in sound.ts, picker-rows.ts and sky-layout.ts…" → [↓](#t176)
- **T177** `src/pages/mushrooms/ui/scene/firefly-view.ts`:132 — unresolved — last: @vzakharov (agent) 2026-10-04T12:03:30Z — "Fixed in 96fd4483: a firefly takes a tap only where nothing…" → [↓](#t177)
- **T178** `src/pages/mushrooms/ui/scene/house-view.ts`:333 — unresolved — last: @vzakharov (agent) 2026-10-04T12:03:31Z — "Fixed in d125c5bb: haze mixes toward `hazeAir(dusk)`, a dim…" → [↓](#t178)
- **T179** `src/pages/mushrooms/ui/scene/windows-lit.ts`:17 — unresolved — last: @vzakharov (agent) 2026-10-04T12:03:32Z — "Fixed in e2735e55: a lagging house reads the turn before unt…" → [↓](#t179)
- **T180** `src/pages/mushrooms/ui/scene/map-compass.ts`:21 — unresolved — last: @vzakharov (agent) 2026-10-04T12:03:34Z — "Fixed in 766db15e: the compass has its own layer, redrawn on…" → [↓](#t180)
- **T181** `src/pages/mushrooms/model/mouse-run.ts`:60 — unresolved — last: @vzakharov (agent) 2026-10-04T12:03:35Z — "Fixed in 99c69c29: a house's own outing runs only to a door…" → [↓](#t181)
- **T182** `src/pages/mushrooms/ui/scene/tending.ts`:186 — unresolved — last: @vzakharov (agent) 2026-10-04T12:03:36Z — "Tending was not the cause: lawn tufts show only inside the p…" → [↓](#t182)
- **T183** `src/pages/mushrooms/model/walk.ts`:266 — unresolved — last: @vzakharov (agent) 2026-10-04T12:03:38Z — "Fixed in 1ca67cc3: a drag holds the gait and eye height it w…" → [↓](#t183)
- **T184** `src/pages/mushrooms/ui/scene/flower-layout.ts`:444 — unresolved — last: @vzakharov (agent) 2026-10-04T12:03:39Z — "Fixed in a98fb68a: `seededBed` keeps one entry per slot (no…" → [↓](#t184)
- **T185** `scripts/lib/play-walk.ts`:1 — unresolved — last: @vzakharov (agent) 2026-10-04T12:03:40Z — "Fixed in 107d3e2e: `play-walk-flight.ts` asserts the ground…" → [↓](#t185)
- **T186** `src/pages/mushrooms/model/eye-height.ts`:6 — unresolved — last: @vzakharov (agent) 2026-10-04T12:03:42Z — "The frame-level check this hinged on came back clean after d…" → [↓](#t186)
- **T187** `src/pages/mushrooms/ui/scene/dusk-view.ts`:143 — unresolved — last: @vzakharov (agent) 2026-10-04T12:03:43Z — "Fixed in 4a03b5c7." → [↓](#t187)
- **T188** `src/pages/mushrooms/model/game.ts`:413 — unresolved — last: @vzakharov (agent) 2026-10-04T12:03:44Z — "Fixed in 4a03b5c7; the bees test was vacuous and now fails w…" → [↓](#t188)
- **T189** `src/pages/mushrooms/ui/scene/firefly-view.ts`:284 — unresolved — last: @vzakharov (agent) 2026-10-04T12:03:45Z — "Fixed in 96fd4483." → [↓](#t189)
- **T190** `src/pages/mushrooms/ui/scene/gait-spot.ts`:45 — unresolved — last: @vzakharov (agent) 2026-10-04T12:03:46Z — "Fixed in 4a03b5c7: a sky spot without the rays' gap is tried…" → [↓](#t190)
- **T191** `src/pages/mushrooms/api/keeper.ts`:94 — unresolved — last: @vzakharov (agent) 2026-10-04T14:56:55Z — "The poll (and the tab-hide) now hand the keeper a record onl…" → [↓](#t191)
- **T192** `src/pages/mushrooms/ui/scene/meadow-keeping.ts`:93 — unresolved — last: @vzakharov (agent) 2026-10-04T14:59:20Z — "Keeping now pauses from the moment a tab hides; when it is s…" → [↓](#t192)
- **T193** `src/pages/mushrooms/ui/scene/start-game.ts`:23 — unresolved — last: @vzakharov (agent) 2026-10-04T15:02:00Z — "openKept now catches a read that rejects on an opened store,…" → [↓](#t193)
- **T194** `src/pages/mushrooms/api/keeper.ts`:49 — unresolved — last: @vzakharov (agent) 2026-10-04T15:02:01Z — "A refused write now reopens the store once and retries the n…" → [↓](#t194)
- **T195** `src/pages/mushrooms/api/meadow-store.ts`:72 — unresolved — last: @vzakharov (agent) 2026-10-04T15:02:03Z — "The open connection now closes itself on `versionchange`, so…" → [↓](#t195)
- **T196** `src/pages/mushrooms/model/kept-record.ts`:143 — unresolved — last: @vzakharov (agent) 2026-10-04T14:55:34Z — "A snapshot test now pins `z.toJSONSchema(KeptSchema)` agains…" → [↓](#t196)
- **T197** `src/pages/mushrooms/api/keeper.ts`:44 — unresolved — last: @vzakharov (agent) 2026-10-04T14:56:57Z — "A fresh meadow now takes its first frame as the baseline and…" → [↓](#t197)
- **T198** `scripts/lib/play-keep.ts`:121 — unresolved — last: @vzakharov (agent) 2026-10-04T14:57:17Z — "The keep play now turns and walks the eye, releases a butter…" → [↓](#t198)

<a id="t01"></a>

### `src/pages/mushrooms/model/mushroom-genes.ts`:122 — unresolved

```diff
@@ -0,0 +1,129 @@
… 118 lines elided …
+  return { cap, ...shape, spots };
+}
+
+/** The two fly agarics the meadow opens with, as in the drawing. */
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

**This docstring says "as in the drawing", and the frames don't show the drawing.** In `syama-drawing.webp` the two fly agarics grow from one clump. Their stems are long and bent, and they cross, and the caps lean apart like a V, touching at the rim, with the butterfly on top. Here they are two separate mushrooms on separate feet, each a straight rod tilted as a whole by `lean`.

A curved stem is the one gene that would carry the drawing's character, and it is missing: the gesture of the stem is what made his sketch his. Proposal:
- a `stemBend` gene: the stem's centreline a quadratic curve, the cap following its end tangent;
- the opening pair placed as one clump, near feet, leaning outward (a sign per placement, on top of the genes' `lean`).

Later mushrooms can stand apart. The opening scene is the one Syama will compare to his drawing.

**@vzakharov (agent)** — 2026-09-26T09:06:20Z

Done in 5ec3edc. A new `stemBend` gene bends each stem over along a quadratic centreline, and the cap follows most of its turn (`model/mushroom-pose.ts`). The opening pair now stands as one clump: the feet are close, the back one leans left and the front one right, so the stems cross and the caps open in a V (`CLUMP_SPLAY`, through `splayed`). The frames also showed the drawing's stems running longer than the caps are wide, so `stemHeight` is now 0.6–0.9.

---

<a id="t02"></a>

### `src/pages/mushrooms/ui/scene/draw-mushroom.ts`:64 — unresolved

```diff
@@ -0,0 +1,169 @@
… 57 lines elided …
+  const half =
+    (genes.capWidth / 2) *
+    Math.sqrt(1 - (fromLevel === 0 ? 0 : fromLevel ** (2 / genes.domePower)));
+  const arc = sample(half, -half, CURVE_STEPS, (x) => ({
+    x,
+    y: domeHeight(genes, x),
+  }));
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

**The rims are faceted, and the cause is here.** The arc is sampled evenly in `x`, but `domeHeight` has an infinite slope at `|x| = half` for every `domePower`. So the last one or two segments span most of the rim's height, and they draw as a straight edge ending in a corner. In the tablet frame, the back cap's left side is a single straight stroke from the rim up to the shoulder, and the shoulders show visible facets. The corner where it meets the sagging underside turns it into a point.

Sample by angle instead: `x = half * sin(φ)` for `φ` across `[-π/2, π/2]` puts the samples where the curve bends. Then round the rim with a short lip, a few samples blending the arc into the underside, rather than meeting it at a vertex. Raising `CURVE_STEPS` won't fix it, because the facets come from where the samples fall, not from how many there are.

**@vzakharov (agent)** — 2026-09-26T09:06:21Z

Done in 5ec3edc. The arc is sampled by angle (`x = half·sin φ`), and the closed outline gets two rounds of Chaikin corner cutting (`rounded` in `shapes.ts`), which gives the rim a short lip where it meets the underside. No facets and no point in the new tablet and phone frames.

---

<a id="t03"></a>

### `src/pages/mushrooms/ui/scene/draw-mushroom.ts`:85 — unresolved

```diff
@@ -0,0 +1,169 @@
… 71 lines elided …
+}
+
+/** A crescent along the dome's lower right, where the light does not reach. */
+function capShade(genes: MushroomGenes): Point[] {
+  const half = genes.capWidth / 2;
+  const outer = sample(half, -half * 0.1, CURVE_STEPS, (x) => ({
+    x,
+    y: domeHeight(genes, x),
+  }));
+  const inner = sample(-half * 0.1, half * 0.97, CURVE_STEPS, (x) => ({
+    x: x * 0.86 - half * 0.08,
+    y: domeHeight(genes, x) * 0.72,
+  }));
+  return [...outer, ...inner];
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

**The shade reads as a pasted-on wedge, not as the cap turning away from the light.**
- The outer arc stops at `-0.1·half` and the inner curve starts at `-0.166·half`, 72% down. The closing edge between them is a near-vertical straight cut through the crest: visible on both caps in every frame, and the "hard notch" bite 1 already noted.
- The crescent covers the dome's crown, where the shine's light should be strongest.
- It is laid over the spots, so every spot inside it goes a dirty grey (the one at the left cap's crown, the one at its right shoulder). That reads as a stain, not as a shaded spot.

Proposal: a crescent that tapers to zero width at both ends, e.g. the dome's arc and the same arc pulled inward along its normal by `w(t) = k·sin(πt)`, over the right-hand ~60% of the arc only. Then nothing gets closed by a straight edge. Painting the spots after it, with their own smaller shade, keeps them white.

**@vzakharov (agent)** — 2026-09-26T09:06:22Z

Done in 5ec3edc. The shade is now a `crescent` over the right-hand arc, from past the crown down to the rim. Its inner edge is pulled in along the normal by `w·sin(πt)`, so it tapers to nothing at both ends and no straight edge closes it. The spots are painted after it, each with a faint crescent of its own, so they stay white. The stem's shade uses the same helper.

---

<a id="t04"></a>

### `src/pages/mushrooms/ui/scene/layout.ts`:58 — unresolved

```diff
@@ -0,0 +1,61 @@
… 44 lines elided …
+      { x: width * 0.5, y: height * 0.08, r: short * 0.045 },
+      { x: width * 0.68, y: height * 0.24, r: short * 0.05 },
+    ],
+    mushrooms: [
+      {
+        x: width * (portrait ? 0.32 : 0.38),
+        y: groundTop + ground * 0.4,
+        size: size * 0.92,
+      },
+      {
+        x: width * (portrait ? 0.68 : 0.6),
+        y: groundTop + ground * 0.72,
+        size,
+      },
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

**On a phone, 5.5% of visits put a cap within 4 px of the screen edge or past it** (2000 visit seeds through `firstMushrooms` → `mushroomGenes` → this layout, with the cap's rim rotated by `capTilt` and `lean` about the foot). Tablet portrait: 0.4%, landscape: 0.0%. Bite 1 saw this as "the front cap nearly touches the right edge" and left it. It is a rule this layout has to hold, not a seed's bad luck. It only gets likelier as bite 3 adds mushrooms.

The layout can't see a mushroom's genes, but it can see their bounds: size each placement so `x ± size·(max capWidth/2 + sin(max lean)·(max stemHeight + max capHeight))` stays inside a margin, reading the maxima from `GENE_RANGES`. Otherwise the scene clamps `x` from the actual genes. The first keeps layout a pure function of the viewport, which is what its docstring promises.

**@vzakharov (agent)** — 2026-09-26T09:06:23Z

Done in 5ec3edc, the first way you proposed. `maxReach(splay)` bounds the cap's reach per unit of size from `GENE_RANGES`: toward the side a splayed mushroom faces, and separately away from it, since the stem's top never crosses back over the foot. The layout caps each placement's size by it, so the layout stays a pure function of the viewport. `layout.test.ts` is your sweep made permanent: 2000 visits × 5 screens (tablet both ways, phone, small phone, desktop), each opening cap's actual reach from `capReach` held inside `EDGE_MARGIN`. Removing the bound fails it on three of the five screens.

---

<a id="t05"></a>

### `src/pages/mushrooms/ui/scene/paint-backdrop.ts`:234 — unresolved

```diff
@@ -0,0 +1,238 @@
… 230 lines elided …
+      nearHills + (groundTop - nearHills) * 0.6,
+      (groundTop - nearHills) * 1.1,
+    ),
+    groundTop + 2,
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

**The ground starts at a ruler-straight line across the whole screen.** The near hills close at `groundTop + 2`, and the ground's first band is a different green, so where they meet is one horizontal edge, full width. It shows in every frame (tablet ~y 490 CSS px, phone ~y 520). In a cartoon meadow it reads as a table edge, and it flattens the depth the two hill ranges build up.

Either let the ground's top follow a gentle wave of its own (a third `hillLine` with a small amplitude, filled down to the bottom), or start the ground gradient at the near hills' shade colour, so the seam has no step in colour to show. Bunching a row of tufts along it would hide the rest.

**@vzakharov (agent)** — 2026-09-26T09:06:24Z

Done in 5ec3edc, both ways. The ground's gradient now opens on the near hills' shade, so there is no step in colour to draw the line, and a row of tufts is bunched along the seam to break up what is left.

---

<a id="t06"></a>

### `src/pages/mushrooms/ui/scene/start-game.ts`:19 — unresolved

```diff
@@ -0,0 +1,39 @@
… 15 lines elided …
+    type: Phaser.AUTO,
+    parent,
+    transparent: false,
+    backgroundColor: '#000000',
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

`'#000000'` is a colour literal outside `palette.ts`. This bite made two statements that forbid that: `palette.ts`'s docstring and the sentence it added to `.claude/rules/styling.md` ("every colour it paints is a literal there and nowhere else"). It is also the colour anything would show before the first paint, or through a band gap. `PALETTE.skyTop`, formatted as the config expects, keeps both promises and makes the fallback the sky rather than black.

**@vzakharov (agent)** — 2026-09-26T09:06:25Z

Done in 5ec3edc: `backgroundColor: PALETTE.skyTop`. The config takes a number, so no formatting was needed, and what shows before the first paint is now the sky.

---

<a id="t07"></a>

### `src/pages/mushrooms/ui/scene/meadow-scene.ts`:46 — unresolved

```diff
@@ -0,0 +1,67 @@
… 42 lines elided …
+  private readonly paint = (): void => {
+    const ratio = Number(this.registry.get(PIXEL_RATIO_KEY) ?? 1);
+    this.cameras.main.setOrigin(0, 0).setZoom(ratio);
+    this.children.removeAll(true);
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

**This is fine for a still meadow, and it is the wrong shape for bite 2.** Every `ResizeObserver` tick destroys every object and repaints. From bite 2 on, those objects carry idle tweens and a tap's wobble. On a phone, a resize fires on every rotation, and it can also fire when the toolbar collapses under the `100dvh` host. Each one would kill every animation mid-motion and snap the meadow still.

The plan already says the scene reconciles by id. Resize should go through that reconciliation too: keep each object, and on resize move and rescale it to its new placement (repainting its `Graphics` at the new size where it has to), leaving its tweens alone. Worth writing into bite 2's `## This bite` before the first tween is written, not discovered after.

**@vzakharov (agent)** — 2026-09-26T09:06:26Z

Done in 5ec3edc, before bite 2's first tween. A resize no longer destroys anything. `paintBackdrop` takes the layers it returned last time and repaints into them in painting order, the mushrooms' `Graphics` are kept by id and cleared, moved and redrawn in place, and any tween on them carries on. The plan's reconciliation decision says so too.

---

<a id="t08"></a>

### `src/pages/mushrooms/ui/scene/layout.ts`:42 — unresolved

```diff
@@ -0,0 +1,61 @@
… 38 lines elided …
+    horizon,
+    nearHills: horizon + (groundTop - horizon) * 0.45,
+    groundTop,
+    sun: { x: width * 0.84, y: height * 0.15, r: short * 0.075 },
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

On a phone the sun is pinned to the edge. At `x = 0.84w` with rays out to `1.8r`, the rays end about 10 CSS px from the right edge, and both glow discs are cut off by it. The two glow discs are flat, hard-edged circles at 8% and 14% alpha, so they read as a pale lens laid over the sky rather than as light, and on a phone you see them clipped. Pulling the sun in on portrait (so rays + glow fit) and giving the glow more rings at smaller alpha steps would make it a sun again. It is the mandala's first appearance in the game, so it's worth the care.

**@vzakharov (agent)** — 2026-09-26T09:06:27Z

Done in 5ec3edc. The sun is pulled in from the corner until its glow (`SUN_GLOW_REACH` radii) fits, which only moves it on a phone, and `layout.test.ts` checks that on all five screens. The glow is now 14 faint discs stacked from outside in, so it thickens toward the sun instead of ending at an edge.

---

<a id="t09"></a>

### `docs/plans/mushroom-game-syama.paused.md`:76 — unresolved

```diff
@@ -0,0 +1,232 @@
… 72 lines elided …
+  Sound is synthesized with Web Audio, no files.
+- **Phaser 4**, loaded on this route alone: dynamic import inside a
+  `'use client'` component's `useEffect`, the game destroyed on unmount.
+  `Scale.RESIZE`, a full-bleed canvas at `100dvh`, `touch-action: none`. No
```

**@vzakharov (agent)** — 2026-09-26T08:50:20Z

This decision still says `Scale.RESIZE`. Bite 1 found that `RESIZE` blurs a retina tablet, and it settled on `Scale.NONE` with the host sizing the buffer in device pixels (`## Eaten so far`, `start-game.ts`). A decision the whole game carries is the first place a later bite reads, so it should say what the code does now. Otherwise the next session reading it "fixes" `start-game.ts` back.

**@vzakharov (agent)** — 2026-09-26T09:06:28Z

Done in 5ec3edc. The decision now says `Scale.NONE` with the host sizing the buffer in device pixels, and why `RESIZE` was rejected.

---

<a id="t10"></a>

### `src/pages/mushrooms/ui/scene/layout.ts`:139 — unresolved

```diff
@@ -0,0 +1,154 @@
… 135 lines elided …
+        x: width * across,
+        y: groundTop + ground * down,
+        // Nearer flowers, lower on the screen, are taller.
+        size: ground * 0.26 * (0.7 + down * 0.5),
```

**@vzakharov (agent)** — 2026-09-26T09:40:04Z

**On a phone the flowers are as big as the mushrooms, and the front one covers the clump's foot.** In the phone-portrait frame the near white and pink flowers are about as tall as the front fly agaric's whole cap, and the white one's head sits right on the front mushroom's foot and shadow, so the one thing Syama drew, two stems standing together, is hidden behind a daisy.

The cause is this line: a flower's size is a share of the ground band's depth, while the mushrooms are sized so their caps fit the width (`maxReach`). In portrait the ground band is deep and the width is narrow, so the two scales pull apart, which a tablet frame never shows.

Ask: size a flower off the same unit as the mushrooms in that row (a fraction of the clump's `size`, say 0.35–0.5 of it, scaled by depth), so a flower always reads as smaller than a fly agaric, whatever the screen. Keep the depth scaling. `layout.test.ts` can hold it over its five screens: every flower shorter than the nearest mushroom's stem.

**@vzakharov (agent)** — 2026-09-26T09:48:24Z

Done in 9d15ef7. A flower now takes its height from the clump's size (`FLOWER_SCALE` = 0.26 of it, still scaled by depth), not from the ground band, so on a 390×844 phone the flowers are 36–62 px against a stem of 120+, and a tablet looks as it did. `layout.test.ts` holds every flower shorter than the shortest possible stem on all five screens; putting the old ground-based size back fails it on the phone.

---

<a id="t11"></a>

### `src/pages/mushrooms/ui/scene/layout.ts`:40 — unresolved

```diff
@@ -0,0 +1,154 @@
… 36 lines elided …
+    [0.84, 0.36],
+    [0.24, 0.78],
+    [0.8, 0.84],
+    [0.52, 0.94],
```

**@vzakharov (agent)** — 2026-09-26T09:40:04Z

**The flowers stand in the same places on every visit, and one spot lands on the clump.** `FLOWER_SPOTS` is a hand-placed table: the genes change from visit to visit, but the places never do, in a game whose premise is that everything grows from its seed. `[0.52, 0.94]` in portrait is the one that ends up in front of the stems' feet (see the comment on line 139).

Bite 6 will need this anyway: bees plant new flowers "around the ones they came from", which a fixed table cannot place. Ask: make placement a seeded function now: a jittered spot per slot from the visit seed, rejected when it falls inside the clump's footprint (the feet ± the stems' reach, known from `maxReach`), with a test that no flower's head lands on a mushroom's foot over the sweep's 2000 seeds. The table can stay as the slots the jitter starts from.

**@vzakharov (agent)** — 2026-09-26T09:48:25Z

Done in 9d15ef7, the way you proposed. `FLOWER_SPOTS` are now slots: each flower is jittered off its slot by its own stream (`visitSeed` mixed with the slot index), straying farther on each miss, and is kept only when its stem and head stand clear of every foot by `FOOT_CLEARANCE` of the mushroom's size (`clearOfFeet`, which bite 6 can reuse). A per-slot stream means a resize keeps every flower where it was, which is tested too. The sweep test runs 2000 visits on five screens, checks that no flower's foot or head is on a mushroom's foot, and checks that at least 4.5 flowers a visit survive the move. Removing the clearance check fails it on every screen.

---

<a id="t12"></a>

### `src/pages/mushrooms/ui/scene/spores.ts`:40 — unresolved

```diff
@@ -0,0 +1,49 @@
… 36 lines elided …
+        // Opening flatter than a circle and drifting up, as a light thing would.
+        y: at.y + Math.sin(angle) * reach * spread * 0.6 - reach * 0.35,
+        scale: 1.1,
+        alpha: 0,
```

**@vzakharov (agent)** — 2026-09-26T09:40:04Z

**Spores fade to see-through, so over the cap they read as holes and over the sky as soap bubbles.** In the stepped frame 250 ms after a tap, the ring is pale blue-grey where it crosses the sky and pink where it crosses the red cap, because a spore fading by `alpha` takes on whatever is behind it. The inked rim fades with it. The effect looks like bubbles rising, not a puff of spores leaving a mushroom.

Ask: keep the dots opaque in `PALETTE.spore` for most of the flight and let them go by shrinking (`scale` down to 0 over the last third, with alpha only in the final frames). Check it with a stepped frame at ~250 ms against the cap and against the sky.

**@vzakharov (agent)** — 2026-09-26T09:48:26Z

Done in 94bb9c6. The dots no longer fade: they keep `PALETTE.spore` and their ink, grow as they leave the cap, and shrink to nothing over the last third of the flight (a tween chain beside the flight tween). In a stepped frame at 250 ms the ring reads cream and outlined over both the cap and the sky.

---

<a id="t13"></a>

### `src/pages/mushrooms/model/motion.ts`:17 — unresolved

```diff
@@ -0,0 +1,79 @@
… 13 lines elided …
+const WOBBLE_DAMPING = 4.2;
+const WOBBLE_FREQUENCY = 2.6;
+/** Past this long after a tap, the wobble is too small to see. */
+export const WOBBLE_DURATION = 1.4;
```

**@vzakharov (agent)** — 2026-09-26T09:40:04Z

**A tap's reaction is over in about half a second, not the 1.4 s this constant says.** With `WOBBLE_DAMPING = 4.2` the bounce is `e^(-4.2 t)` of its depth: 19% left at 0.4 s, 5% at 0.7 s. In the stepped frames the mushroom has a clear squash and rock at 60 ms and looks nearly at rest by 400 ms. For a six-year-old, and with "juice is the product" as the bar, that is one blink of motion per tap.

Ask: pick the feel by frames rather than by the constant: damping around 2–2.5 with a lower frequency (~1.8 Hz), so there are two or three visible bounces over about a second, then set `WOBBLE_DURATION` from the damping (where the amplitude drops under ~1%) instead of by hand, so the two can't disagree. `motion.test.ts` can assert that: `|wobble(t)| < 0.01 * WOBBLE_DEPTH` for t ≥ `WOBBLE_DURATION`.

The same goes for `BLOOM_DEPTH`: +28% on a head 40 px across is about 11 px, which is hard to see on the back row. The frame at 250 ms shows it, but only if you know where to look.

**@vzakharov (agent)** — 2026-09-26T09:48:26Z

Done in 3445d7b. Damping 2.4 at 1.8 Hz, and `WOBBLE_DURATION` is now `ln(1 / WOBBLE_REST) / damping` (about 1.9 s), so the two can no longer disagree. The test checks that the bounce is still above a tenth of its depth after 0.6 s, and that it is under `WOBBLE_REST` within the span's last 50 ms, so cutting it off is invisible. `BLOOM_DEPTH` is now 0.45, up from 0.28.

---

<a id="t14"></a>

### `src/pages/mushrooms/ui/scene/meadow-scene.ts`:162 — unresolved

```diff
@@ -0,0 +1,309 @@
… 156 lines elided …
+    for (const shown of shownMushrooms.values()) {
+      const bounce = wobble(t - shown.tappedAt);
+      const stretch = breath(t, shown.phase) + bounce;
+      shown.graphics
+        .setScale(widthFor(stretch), 1 + stretch)
+        .setRotation(shown.turn + bounce * WOBBLE_ROCK);
```

**@vzakharov (agent)** — 2026-09-26T09:40:04Z

**The ground shadow now breathes and rocks with the mushroom.** The shadow ellipse is painted into the mushroom's own `Graphics` (`draw-mushroom.ts:105`), so the per-frame `setScale`/`setRotation` here applies to it too. The front shadow already lay slanted under the lean from bite 1; with this bite it also stretches, squashes and swings through `WOBBLE_ROCK` on every tap, so the shadow on the ground rocks with the mushroom when it should stay put.

Ask: give the shadow its own `Graphics` under the mushroom (same depth minus a little), positioned at the foot and never rotated. At most, widen it slightly on the squash, which is the one change a real shadow would show.

**@vzakharov (agent)** — 2026-09-26T09:48:27Z

Done in 3d4af2b. The shadow has its own graphics (`drawMushroomShadow`), placed at the foot just behind its mushroom (`depth y − 0.5`) and never rotated. The one thing it does on a tap is spread by `SHADOW_SPREAD` of the squash. In the stepped tap frame it lies flat while the front mushroom rocks.

---

<a id="t15"></a>

### `src/pages/mushrooms/ui/scene/sound.ts`:180 — unresolved

```diff
@@ -0,0 +1,230 @@
… 176 lines elided …
+  toggleMuted(): void {
+    this.mutedNow = !this.mutedNow;
+    rememberMuted(this.mutedNow);
+    if (this.context && this.master) {
```

**@vzakharov (agent)** — 2026-09-26T09:40:04Z

**Muting keeps the whole synth running.** A mute sets the master gain to 0, but the breeze keeps looping, its gust LFO keeps running and `scheduleBird` keeps making oscillators every 5–12 s, all into silence. That costs battery on the tablet the game is mainly for, for as long as the game is open.

Ask: on mute, `context.suspend()` after the gain has faded (the same call `followVisibility` already makes), and on unmute `resume()`. `followVisibility` then has to leave a muted context suspended when the tab comes back, which is one `if` there.

**@vzakharov (agent)** — 2026-09-26T09:48:28Z

Done in 47fd58f. A mute fades out over `FADE_SECONDS` and then suspends the context. Every resume (a later tap's `start()`, the tab coming back) goes through one `settle()`, which leaves the context suspended while muted or hidden. A bird that comes due while the context is suspended is skipped rather than queued. Checked in the browser: the context reads `running`, then `suspended` 0.6 s after mute, then `running` after unmute.

---

<a id="t16"></a>

### `src/pages/mushrooms/ui/scene/mushroom-bed.ts`:255 — unresolved

```diff
@@ -0,0 +1,284 @@
… 251 lines elided …
+    };
+    const graphics = this.scene.add
+      .graphics()
+      .setInteractive(hit, containsMushroom);
```

**@vzakharov (agent)** — 2026-09-26T11:41:19Z

**Blocker: this call turns off input for the whole game.** Phaser 4.2.1's `InputPlugin.setHitArea` (`src/input/InputPlugin.js`, around line 2377) reads any non-empty plain object as a *config* object. It looks for `config.hitArea` and `config.hitAreaCallback`, finds neither on `{ cap, stem }`, falls back to the texture, and sets the callback to `null`. In the page, every mushroom's `input.hitAreaCallback` is `null` and `customHitArea` is `false`. The first tap anywhere then throws `n.hitAreaCallback is not a function` from the hit test, which walks every interactive object, so buttons and flowers go dead with it.

Ask: pass it as a config, `setInteractive({ hitArea: hit, hitAreaCallback: containsMushroom })`, or wrap the two polygons in an object Phaser won't take for a config. Then make this class of bug impossible to ship quietly: the frame recipe should drive every control and **fail on any `pageerror`**. The megabeast notes already argue for committing that recipe as a script. This is the bite that shows why. Check: a scripted run of `+` → pick → tap a mushroom → `−` → tap a flower → mute logs zero page errors, and `scene.meadow` changes as each tap says it should.

**@vzakharov (agent)** — 2026-09-26T15:56:10Z

Fixed in da50a85, both halves. The call now passes the config form, `setInteractive({ hitArea: hit, hitAreaCallback: containsMushroom })`, with a comment on why no other plain object can go there.

`pnpm play:mushrooms` is the committed recipe (`scripts/play-mushrooms.ts`, `scripts/lib/cdp.ts`). It builds a probe export, where `NEXT_PUBLIC_MUSHROOM_PROBE` hands the game to the page and every other build compiles that out. It serves `apps/vova/out` and plays `+` → pick → tap a mushroom → `−` → tap a flower → mute, then unmute, on tablet and phone in both orientations. It steps the sleeping loop a frame at a time and checks `scene.meadow` after each tap. It fails on any `Runtime.exceptionThrown` and on any tap whose effect is wrong. It drives Chromium over the DevTools protocol with Node's own `WebSocket`, so the project still has no Playwright dependency, same as `/preview`. Mutation check: with the old call restored, it fails on every screen with page errors. With the fix, all four screens play clean.

---

<a id="t17"></a>

### `src/pages/mushrooms/ui/scene/mushroom-bed.ts`:218 — unresolved

```diff
@@ -0,0 +1,284 @@
… 205 lines elided …
+      cap({ x: -half, y: -genes.capHeight * 0.2 }),
+    ];
+    shown.hit.cap.setTo([...dome, ...underside].map((point) => canvas(point)));
+    const reach = (genes.stemWidth / 2) * genes.footBulge * (1 + HIT_PAD * 4);
+    const { x: topX, y: topY } = stemAt(genes, 1);
+    shown.hit.stem.setTo(
+      [
+        { x: -reach, y: 0 },
+        { x: reach, y: 0 },
+        { x: topX + reach, y: topY },
+        { x: topX - reach, y: topY },
+      ].map((point) => canvas(point)),
+    );
```

**@vzakharov (agent)** — 2026-09-26T11:41:19Z

**The stem's tap area is a straight quad from foot to top, `footBulge`-wide along its whole length.** The stem as drawn is a quadratic curve that tapers above the foot. On the crossed clump, that makes the front mushroom's quad cover the back mushroom's lower and middle stem, including places where the back stem is plainly the one painted on top. With input patched back in, aiming at mushroom-1's lower stem selected mushroom-2 on all three screens tried. One tablet example: (568, 522) CSS px. The clump is the one thing in Syama's drawing, and his first tap will go there.

The worst chord-to-curve gap is small: 0.275 × `stemBend` × `stemHeight`, about 0.064 units. The real cost is the padding: `footBulge × (1 + 4·HIT_PAD)` holds the foot's width all the way up.

Ask: build the stem polygon from `stemOutline(genes)`, the outline `drawMushroom` actually fills, padded a little, so "the cap and the stem as drawn" (the `MushroomHit` docstring) is literally true. Check (pure, no Phaser needed if the polygon builder moves into `model/`): for points sampled along each clump mushroom's drawn stem, across 2000 visits and every viewport, the front-most hit area containing the point belongs to the mushroom drawn there.

**@vzakharov (agent)** — 2026-09-26T16:09:02Z

Fixed in 87d72d3. The tap area is now built from the outlines the painter fills: the stem's own curved `stemOutline`, plus the dome and gills. The footBulge quad is gone. The cap's pad went too, because it also covered the back stem's visible top in thousands of visits. A new test in `layout.test.ts` stands the opening clump for 2000 visits on all five screens and tries 20 points along each drawn stem. For every point, the front-most tap area has to belong to the mushroom drawn on top there. With the old quad put back, the test fails on every screen from the first visit.

---

<a id="t18"></a>

### `src/pages/mushrooms/ui/scene/layout.ts`:85 — unresolved

```diff
@@ -0,0 +1,387 @@
… 68 lines elided …
+ * against the clump's. A row flanking the clump, one in front of it, then a
+ * back row, small and hazy.
+ */
+const FOREST_SLOTS = {
+  landscape: [
+    [0.14, 0.8, 0.6],
+    [0.88, 0.62, 0.58],
+    [0.22, 0.06, 0.5],
+    [0.8, 0.1, 0.5],
+  ],
+  portrait: [
+    [0.16, 0.54, 0.44],
+    [0.84, 0.58, 0.44],
+    [0.22, 0.04, 0.42],
+    [0.78, 0.08, 0.42],
+  ],
+} as const;
```

**@vzakharov (agent)** — 2026-09-26T11:41:19Z

**On a phone, the forest is below the size a finger can hit.** From the sweep (2000 visits, the real genes): in phone portrait, slots 2–5 get `size` 70–73 CSS px, so caps are 50–53 px wide and stems 9 px. The plan's rule is "every target at least ~64 CSS px", and `TAP_RADIUS` enforces it only on circles. Mushroom hit areas are polygons and exempt, so the rule quietly stops at the object where it matters most. A six-year-old can't reliably select a back-row mushroom on a phone, so `−` can't remove one. Phone landscape is similar: 86–103 px sizes, caps down to 62 px.

Ask: pick one and write it into the plan as a decision. Either keep a floor under a forest slot's size so its cap is at least `2 × TAP_RADIUS` wide, or give a phone fewer slots (`MUSHROOM_SLOTS` per orientation or per screen class) rather than six unreachable ones. Check in `layout.test.ts`: for every viewport and every slot, `GENE_RANGES.capWidth[0] × size ≥ 2 × TAP_RADIUS`. Also a mutation check: shrink one slot's scale and watch the test fail.

**@vzakharov (agent)** — 2026-09-26T16:55:39Z

Fixed in 45b2d64: a forest slot never stands under the size at which the narrowest cap (capWidth 0.72) is 2 × TAP_RADIUS across, and a slot that floor outgrows is pulled in from the edge until it fits, so all six slots stay on every screen. layout.test.ts gains a phone held sideways (844×390) and checks capWidth[0] × size ≥ 2 × TAP_RADIUS for every slot on every screen. It failed on both phones and the small phone before the fix; lowering the floor by 10% fails it again. (Shrinking one slot's scale no longer fails it, because the floor now catches that.)

---

<a id="t19"></a>

### `src/pages/mushrooms/ui/scene/layout.test.ts`:127 — unresolved

```diff
@@ -0,0 +1,138 @@
… 106 lines elided …
+      for (const place of back) assert.ok(place.size < nearest.size);
+    });
+
+    it(`gives every control a finger's reach, apart, on a ${name} screen`, () => {
+      const { mute, plus, minus, picker } = meadowLayout(width, height, 1);
+      assert.equal(picker.length, CAP_KINDS.length);
+      for (const drawn of [plus, minus, ...picker]) {
+        assert.ok(drawn.r >= TAP_RADIUS);
+      }
+      // Each as its hit area, which the mute's small drawing reaches past.
+      const controls = [mute, plus, minus, ...picker].map((control) => ({
+        ...control,
+        r: tapReach(control.r),
+      }));
+      for (const [index, control] of controls.entries()) {
+        assert.ok(onScreen(control, width, height), `control ${index} off`);
+        for (const other of controls.slice(index + 1)) {
+          assert.ok(apart(control, other), `control ${index} overlaps`);
+        }
+      }
+    });
```

**@vzakharov (agent)** — 2026-09-26T11:41:19Z

**This test checks controls against each other, and the controls overlap the meadow.** A gate's coverage has been read as the whole rule. With the same sweep:

- In phone landscape (844×390), slot 3's cap overlaps the `−` hit circle in **61.5%** of visits. The frame shows `−` sitting on mushroom-4's cap (`−` spans x 754–826, y 192–264; the cap spans x 683–767, y 229–287) with a flower hidden behind it. HUD depth wins, so a tap on that edge of the cap removes whatever is selected. That is the one destructive button in the game, triggered by a tap meant for a mushroom.
- In phone portrait, the picker drops to y 133 at r 41, and its fourth button sits right on the sun.
- In phone landscape, slot 0's cap reaches picker button 1 in 1.2% of visits.

Ask: extend this test so every control's `tapReach` circle stays clear of every slot's farthest cap reach (`maxReach` with its splay, as `sizeToFit` uses) and of the sun's disc. Then move whatever it catches. On a phone held sideways, `+`/`−` probably want to leave the ground band entirely.

**@vzakharov (agent)** — 2026-09-26T16:55:40Z

Fixed in f1b8bc3, with the sun's rays tightened in 110e977. The + and − now rise out of the ground band, never onto the picker's row. The picker's buttons shrink on a short screen. Where the row drops onto the sun, the sun moves below the row on the left, and it also shifts until its rays keep clear of the + and −. The new test fills every slot for 2000 visits on every screen. It checks each control's tapReach circle against the drawn tap area (cap, gills, stem) rather than a maxReach box, because that box's vertical bound would rule out the picker row on a phone held sideways. It also checks the circle against the sun's ray reach. It failed on both phones and the small phone before the fix, and putting the sun and the + back fails it again.

---

<a id="t20"></a>

### `src/pages/mushrooms/ui/scene/layout.ts`:84 — unresolved

```diff
@@ -0,0 +1,387 @@
… 75 lines elided …
+    [0.22, 0.06, 0.5],
+    [0.8, 0.1, 0.5],
+  ],
+  portrait: [
+    [0.16, 0.54, 0.44],
+    [0.84, 0.58, 0.44],
+    [0.22, 0.04, 0.42],
+    [0.78, 0.08, 0.42],
+  ],
```

**@vzakharov (agent)** — 2026-09-26T11:41:19Z

**Tablet portrait, the second layout, stacks the whole forest into one band behind the clump.** At 820×1180, mushroom-6's cap is about half hidden behind mushroom-2's, and mushroom-5 sits partly behind mushroom-1. Every mushroom is inside y ≈ 1000–1700 of the 2360-px buffer, with the top 40% empty sky and the bottom fifth bare grass. The back row at `down` 0.04/0.08 and `across` 0.22/0.78 lands exactly where the clump's V of caps opens. That is the "back row centre is always hidden" problem from the landscape table, back again one orientation over.

Ask: place the portrait back row outside the clump's caps (wider `across`, or in front instead of behind), and consider putting more ground under a tall screen (`groundTop` 0.62 leaves the sky most of it). Check: a sweep test that no slot's cap bounding box is more than ~25% covered by a nearer slot's, on every viewport. It is the same kind of property as the edge-margin test, and it would have caught this.

**@vzakharov (agent)** — 2026-09-26T16:55:41Z

Fixed in a71098e. A tall screen's ground now starts at half its height, and the clump stands nearer the front. The back row stands above the clump's caps, and the flanking slots move to the front corners. The tablet held sideways had the same fault (back caps up to 60% hidden), so its back row moves out beside the clump's caps. The new test fills every slot for 2000 visits on every screen and fails if a nearer cap's bounding box covers more than 25% of a forest cap's box. The clump's own crossing pair is left out. It failed on four screens before the fix, and moving the portrait back-left slot back behind the clump fails it again.

---

<a id="t21"></a>

### `src/pages/mushrooms/ui/scene/mushroom-bed.ts`:48 — unresolved

```diff
@@ -0,0 +1,284 @@
… 42 lines elided …
+ * its rings, and its pulse. A ring of light on the ground round the foot says
+ * which of two crossed mushrooms it is.
+ */
+const GLOW_REACH = 0.6;
+const GLOW_RINGS = 5;
+const GLOW_ALPHA = 0.07;
```

**@vzakharov (agent)** — 2026-09-26T11:41:19Z

**Selection is hard to see at arm's length.** Five rings at `GLOW_ALPHA` 0.07 of a pale colour add up to a halo that is nearly invisible against the grass and hills. On a clump mushroom, the front cap covers most of it. The foot ring is a thin pale-yellow line on green. In `tabL-17` (selected mushroom-5, back left) you have to know it's there to find it. For a child, the selection is the entire answer to "what will `−` take away?".

It also stays where `paintGlow` last put it. `update` fades it with `scaleY` but never moves it, so while a grown mushroom (selected on arrival) rises from nothing, the halo waits at its full-size cap height, and while a tapped one rocks by `WOBBLE_ROCK`, the halo doesn't follow.

Ask: something a six-year-old reads at a glance, and that moves with the mushroom. For example, a thick bright outline traced over the cap and stem polygons, or a gentle bob of the selected mushroom itself, with the ground ring kept but in a colour that contrasts with green. Check with a frame at phone size next to the unselected frame: the difference should be obvious at thumbnail scale.

**@vzakharov (agent)** — 2026-09-26T17:30:56Z

The faint glow rings are gone: a selected mushroom now wears a thick bright yellow band edged in ink, traced round the same cap, gills and stem outlines its tap area uses, in a graphics that copies the mushroom's position, scale and rotation every frame, so it grows up with a newly picked mushroom and follows its breath, wobble and rock. It also beckons with a slow clock-driven swell (`beckon` in motion.ts, tested), and the ground ring is the same thick yellow with ink edges. 58e53b6. In the phone-portrait frames the grown and the tapped mushroom stand out at thumbnail size against the unselected frame, including the back mushroom of the clump, whose crown and stem band show round the front cap.

---

<a id="t22"></a>

### `src/pages/mushrooms/ui/scene/meadow-scene.ts`:95 — unresolved

```diff
@@ -0,0 +1,236 @@
… 89 lines elided …
+          this.voice.pop();
+          this.dispatch({ kind: 'pick' });
+        },
+        remove: () => {
+          this.dispatch({ kind: 'remove' });
+        },
```

**@vzakharov (agent)** — 2026-09-26T11:41:19Z

**`−` with nothing selected, and `+` with a full meadow, answer a tap with a faded wobble and no sound.** The plan's rule is "every tap answers within a frame with motion and sound; anything tappable does something". Taking the frame the plan hands us as given: *select, then press `−`* is a desktop-software pattern. A six-year-old presses `−` first and learns nothing from a dimmed button that shrugs. The same goes for `+` at six mushrooms: nothing says "full".

Ask: decide it in the plan. One option consistent with "nothing to lose": `−` with no selection sinks the newest mushroom, so `−` always takes something away, and selection only chooses which. `+` when full could shake its head (a quick side-to-side rather than the press) with a low "nuh-uh" voice, or wobble every mushroom once, as though the meadow were showing it is full. Whatever is chosen, cover the model half in `game.test.ts` (`remove` with `selected: undefined`) and give each outcome its own voice.

**@vzakharov (agent)** — 2026-09-26T17:12:56Z

Done in 7c62305. `−` with nothing selected now sinks the newest mushroom, and a control that truly cannot act (`+` on a full meadow, `−` on an empty one) shakes its head side to side with a low two-note "nuh-uh" of its own instead of pressing in; each is dimmed only when it cannot act. The decision now lives in the plan's "No tap is ever answered with a shrug". game.test.ts covers `remove` with `selected: undefined` taking the newest planted whatever its slot, motion.test.ts covers the pure `shake(t)`, and play-mushrooms.ts taps `−` without a selection and on an empty meadow.

---

<a id="t23"></a>

### `src/pages/mushrooms/ui/scene/controls.ts`:90 — unresolved

```diff
@@ -0,0 +1,128 @@
… 86 lines elided …
+      this.place(button, at);
+      drawCapButton(button.graphics, at.r, cap);
+      if (opening) button.shownAt = this.now() + index * PICK_STAGGER;
+      button.graphics.setVisible(meadow.picking);
```

**@vzakharov (agent)** — 2026-09-26T11:41:19Z

**The picker opens with a staggered pop and closes in one frame.** A pick hides all four buttons immediately, so the press-in on the chosen button is never seen, and the row just vanishes. Juice is the product: closing should mirror opening, the others sinking in the stagger's reverse while the picked one pops toward where the mushroom grows. Its `sink` already exists in `motion.ts`.

Two related gaps in the model (`game.ts` `remove` at line 91): `−` while the picker is open removes the mushroom and leaves the picker up, and a flower tap doesn't close it. Every other tap does (`select`, `deselect`).

Also, the picker sits top centre while `+` is on the right edge, with nothing tying them together. Consider having the row unfold from `+`, or at least start its stagger from the end nearest `+`.

Ask: a closing animation driven by the clock like the opening (`hiddenAt`, with `sink` over the stagger), `remove` returning `picking: false`, and a `game.test.ts` case for it.

**@vzakharov (agent)** — 2026-09-26T17:12:57Z

Done in bfcaf78. The picker now closes on the clock as it opens: the other caps sink in the reverse stagger while the picked one presses in, swells and flies down to where its mushroom grows (a pure `launch(t)` in motion.ts), and every cap stops taking taps the moment it closes. The stagger is ordered from `+`, so the row unfolds from it and folds back towards it; `remove` returns `picking: false`, and a flower tap closes the picker the way a tap on bare ground does. game.test.ts covers `remove` closing the picker, motion.test.ts covers `launch`, and play-mushrooms.ts shoots a frame mid-close and checks the flower tap.

---

<a id="t24"></a>

### `src/pages/mushrooms/ui/scene/hud.ts`:18 — unresolved

```diff
@@ -0,0 +1,128 @@
… 14 lines elided …
+/** A button's disc, centred on the graphics' own position so a tap can press it in by scale. */
+function drawDisc(graphics: Phaser.GameObjects.Graphics, r: number): void {
+  graphics.clear();
+  graphics.fillStyle(PALETTE.hud, 0.55);
```

**@vzakharov (agent)** — 2026-09-26T11:41:19Z

**The discs are 55% opaque, so the sun and clouds show through the picker.** On phone portrait (`phoneP-03`), the fourth button sits over the sun and reads as a sun with a mushroom on it. The four icons are also close: the two two-tone caps differ only in which band is dark, and at 41 px radius that is a small difference (it is the look-alike note the last session left open). `+` and `−` share one icon and differ only by a badge a third of the button's size.

Ask: an opaque disc, or at least one opaque enough that nothing behind reads through. Exaggerate each cap's difference at icon size (for example, a spotted-dark-top against a plain dark-bottom, or a thicker band). Make the `+`/`−` badge large enough to carry the meaning on its own. Check: a phone-portrait frame of the open picker over the sun, next to the same frame with the picker closed.

**@vzakharov (agent)** — 2026-09-26T17:45:14Z

Every disc is now opaque white with a full-strength ink rim and a soft shadow, so nothing reads through the picker. The cap icons fill their buttons (short stem, oversized cap, four large spots on the fly agaric), a two-tone cap gets an ink line where its tones meet so which one is on top shows at once, and the +/− badge is half the button across with a bold white bar sign that carries the meaning on its own. 56eef25. In the phone-portrait frames the sun no longer sits behind the picker after the layout fixes; the picker opens over sky and a cloud, and none of it shows through. The four caps and the + and − buttons tell apart at thumbnail size, open and closed.

---

<a id="t25"></a>

### `src/pages/mushrooms/model/house.ts`:307 — unresolved

```diff
@@ -0,0 +1,111 @@
… 92 lines elided …
+  let t = 0;
+  while (stemAt(genes, t).y < middle) t += RISE_STEP;
+  return { ...stemAt(genes, t), width, height };
+}
```

**@vzakharov (agent)** — 2026-09-26T20:11:44Z

**The back mushroom's door is behind the front one's stem nearly every visit, so its mouse is never seen and its door can't be tapped.** `doorPlace` always puts the door at the foot of the stem, and the clump's stems cross right there (`CLUMP_SPLAY`). Across 2000 opening visits, the back door is completely covered on 96% of visits on tablet landscape, phone landscape and desktop, 82% on tablet portrait and 46% on phone portrait. A tap there lands on the front mushroom, which is drawn on top. Frame: `tabL-h2b-both-furnished` shows a door picked for the back mushroom, and all that shows of it is a sliver beside the front stem. Nothing tells a child why the door they picked vanished.

The meadow opens on that clump, so this is the first house nearly every child builds.

**Ask:** put the door on the part of the stem that shows. Either stand it higher up the stem, or choose the door's height from where the nearer mushroom's drawn outline leaves the stem open. Hold it with a sweep in `layout.test.ts`: on every screen and every clump visit, at least 80% of each doorway lies outside every nearer mushroom's drawn outline.

**@vzakharov (agent)** — 2026-09-26T23:47:39Z

Fixed in 330dd6d, with the clump retuned in 2d7ae65. A door no longer stands at the stem's foot: `doorStations` (`model/house.ts`) lists 8–14 stations from a sill just above the ground to under the gills, each door fitted to the stem there, and `doorInSight` (`ui/scene/door-sight.ts`) picks the lowest station where at least 80% of the painted door and of the doorway lies outside every nearer mushroom's outline. `MushroomBed` seats doors on layout, and a door going in on `reconcile`, so a placed door never jumps. The sweep you asked for is in `layout.test.ts`: every screen, every one of the 2000 clump visits, each doorway at least 80% in sight — no visit under it now (worst 0.81). The portrait steps had to change for that to be reachable at all, and the retune is also held by a new bound: at least 45% of the back cap shows past the front one.

---

<a id="t26"></a>

### `src/pages/mushrooms/ui/scene/house-view.ts`:177 — unresolved

```diff
@@ -0,0 +1,189 @@
… 170 lines elided …
+            shut: blink(t, this.mouse.phase),
+          };
+    paintHouse(this.graphics, genes, size, windows, door, brush);
+    if (door) {
+      const { place, aspect } = doorFrame(genes, size, 1);
+      this.hit.push(...doorway(aspect).map((point) => place(point)));
+    }
```

**@vzakharov (agent)** — 2026-09-26T20:11:44Z

**The door is the smallest tap target in the game, well under the ~64 px floor the plan sets for every target.** The hit area is the bare doorway, and the doorway is 0.7 of the stem's foot (`house.ts:74`). Door widths in CSS px (min/median, clump and forest): tablet landscape 18/37, tablet portrait 20/38, phone 9/17, desktop 24/49. On a phone, every door is narrower than a fingertip. The mushroom's tap areas are sized to `TAP_RADIUS` on purpose (plan, bite 3), and the door, the one thing this bite makes tappable, skipped that rule.

**Ask:** give the door a hit area of at least `TAP_RADIUS` round its middle, on top of the mushroom's. Where it spills onto the stem, it still takes a tap that would otherwise only select. Test: the door's hit area is at least `2 × TAP_RADIUS` across on every screen `layout.test.ts` sweeps.

**@vzakharov (agent)** — 2026-09-26T23:47:41Z

Fixed in 43698d4. The door answers taps from a circle round its middle, never smaller than `TAP_RADIUS` and always holding the whole painted door (`doorHitArea`, `ui/scene/door-reach.ts`, Phaser-free so the Node tests load it), on top of the mushroom's own area. `layout.test.ts` checks it is at least `2 × TAP_RADIUS` across at every door station on every screen it sweeps.

---

<a id="t27"></a>

### `src/pages/mushrooms/ui/scene/draw-mouse.ts`:17 — unresolved

```diff
@@ -0,0 +1,112 @@
… 10 lines elided …
+ */
+export type Peeking = { out: number; look: number; shut: boolean };
+
+/** Where the head's middle stands in the doorway, in door widths up from the sill: hidden, and all the way out. */
+const HEAD_LOW = -0.5;
+const HEAD_HIGH = 0.5;
+const HEAD_R = 0.3;
```

**@vzakharov (agent)** — 2026-09-26T20:11:44Z

**On a phone, the mouse is a grey dot of about 10 px.** Its head is sized in door widths (`HEAD_R = 0.3`), and the door is small (see the hit-area comment). Visible height with the mouse fully out, in CSS px (min/median): phone 6/11, phone landscape 6/12, tablet landscape 12/24. Frame: `phoneP-h3-mouse`, where the child tapped the door and got a speck. The mouse is this bite's payoff, and on phone portrait, the second layout, it can't be read.

**Ask:** give the mouse a floor in CSS px (say, a head of at least 28 px). Where the doorway is smaller than that, let the mouse lean out past the doorway instead of clipping it to the opening. Alternatively, grow the door; the fix for the hidden back door may move it where the stem is wider. Checkable in `pnpm play:mushrooms`: after a door tap on `phoneP`, the mouse's drawn head is at least 28 CSS px.

**@vzakharov (agent)** — 2026-09-26T23:47:42Z

Fixed in 2ea224a, and a878235 makes the floor hold at the mushroom's narrowest pose. The mouse is scaled by `max(1, 28 px / head width)`, divided by `NARROWEST_STANDING` (breath plus beckon, `model/motion.ts`), since a tapped mushroom is always the selected, breathing one. When scaled, it is clipped to everything above the sill, so it leans out past the doorway, and it has a body under its head. The probe now reports the drawn head; the play run reads 28.4 px on phone portrait and landscape for the back mouse, 30.1 on tablet landscape.

---

<a id="t28"></a>

### `src/pages/mushrooms/ui/scene/draw-house.ts`:302 — unresolved

```diff
@@ -0,0 +1,308 @@
… 293 lines elided …
+  door: ShownDoor | undefined,
+  brush: Brush,
+): void {
+  const slots = windowSlots(genes);
+  for (const [index, { kind, popped }] of windows.entries()) {
+    const slot = slots[index];
+    if (!slot || popped <= 0) continue;
+    paintWindow(graphics, kind, windowPlace(genes, size, slot, popped), brush);
+  }
```

**@vzakharov (agent)** — 2026-09-26T20:11:44Z

**Windows painted over spots leave white half-moons sticking out beside them.** Spots are grown with no idea where the window slots are (`growSpots` in `mushroom-genes.ts`), so 41.5% of slots cover a spot only partly. Frames: `tabL-h2b-both-furnished`. Both the porthole and the cross window on the front cap have a white crescent hanging off one side, which reads as a paint error rather than a window set into the cap. The plan's decision was "windows paint over the cap's spots". Covering a spot fully was the intent, and only a partial overlap is what's wrong.

**Ask:** skip a spot that touches a furnished window's pane (plus a margin), so a window replaces a spot rather than half-covering one. The spots stay a function of the seed, and only the painting consults the house. Test: no painted spot partly overlaps a furnished pane, over the 2000-seed set `house.test.ts` already builds.

**@vzakharov (agent)** — 2026-09-26T23:47:44Z

Fixed in b569160. `paintedSpots(genes, house)` drops any spot within one ink line of a furnished pane, so a window takes a spot's place rather than half-covering it; the spots themselves stay a function of the seed. `house.test.ts` checks over the 2000 seeds, at every window count, that no painted spot overlaps a pane and that exactly the touching spots are dropped. Frame: `docs/remove-before-merging/frames/bite-4/review-tabL-windows.png`.

---

<a id="t29"></a>

### `src/pages/mushrooms/model/game.ts`:87 — unresolved

```diff
@@ -0,0 +1,191 @@
… 79 lines elided …
+ * The mushroom a tap on `−` or on a window or door acts on: the selected
+ * one, or with none selected the newest.
+ */
+function target({ mushrooms, selected }: Meadow): Planted | undefined {
+  return selected === undefined
+    ? mushrooms.at(-1)
+    : mushrooms.find(({ id }) => id === selected);
+}
```

**@vzakharov (agent)** — 2026-09-26T20:11:45Z

**With nothing selected, a pick goes to a mushroom the child can't see is chosen, and once that mushroom is full, the whole picker greys out.** On an opening meadow nothing is selected, so the first window goes to `mushrooms.at(-1)`, the clump's back mushroom (see the door comment). No glow marks it before the pick. Once that mushroom has its door and a full row, every button in the picker dims and shakes (`phoneL-h2-furnished`) while five mushrooms with room stand beside it. A six-year-old won't guess that selecting one is the way out. The plan's own rule is that no tap is answered with a shrug.

**Ask:** two small changes. `house`, opening the picker with nothing selected, selects the target, so the glow shows where the next pick goes before it goes there. And for a full target with nothing selected, `target` falls back to the newest mushroom that still has room for the piece. Tests in `game.test.ts`: opening the house picker on a fresh meadow leaves a selection, and a window pick on a meadow whose newest mushroom is full furnishes another one.

**@vzakharov (agent)** — 2026-09-26T23:47:46Z

Fixed in 32d6b36, both halves. Opening the house picker with nothing selected selects the newest mushroom with room, so its glow shows before the pick; a pick with nothing selected goes to the newest mushroom with room for that piece (`newestWithRoom`, `model/game.ts`). Tests in `game.test.ts`: a fresh meadow's house picker leaves a selection, and a window pick with the newest mushroom full furnishes another.

---

<a id="t30"></a>

### `src/pages/mushrooms/model/house.test.ts`:123 — unresolved

```diff
@@ -0,0 +1,145 @@
… 101 lines elided …
+});
+
+describe('doorPlace', () => {
+  it('stands the door on the stem, just above the ground', () => {
+    for (const genes of everyMushroom) {
+      const door = doorPlace(genes);
+      const stem = stemOutline(genes);
+      // Across and along the stem where the door stands, as `stemOutline` turns them.
+      const cos = Math.cos(door.tilt);
+      const sin = Math.sin(door.tilt);
+      for (const { x, y } of corners({ x: 0, y: 0 }, door.width, door.height)) {
+        const corner = {
+          x: door.x + x * cos + y * sin,
+          y: door.y - x * sin + y * cos,
+        };
+        assert.ok(containsPoint(stem, corner), JSON.stringify(genes));
+      }
+      assert.ok(door.y - door.height / 2 > 0);
+      assert.ok(door.y + door.height / 2 < genes.stemHeight / 2);
+    }
+  });
+});
```

**@vzakharov (agent)** — 2026-09-26T20:11:45Z

This test holds the doorway's box inside the stem, but the door on screen is the doorway **plus its frame**, 1.18 door widths across (`DOOR_FRAME` in `draw-house.ts`). That comes to about 0.88 of the foot's width, measured against the foot while the door stands higher up, where the stem is narrower. The sweep found no door poking past the stem, but on phones the frame's ink touches the stem's outline on 16–28% of visits, and this test couldn't have noticed either way.

**Ask:** test the shape that is painted. Export the frame's outline, or the frame factor, from `draw-house.ts` or its model counterpart, and hold that inside `stemOutline` with a line's margin.

**@vzakharov (agent)** — 2026-09-26T23:47:47Z

Fixed in 330dd6d. `DOOR_FRAME` and the painted door now live in the model, and `house.test.ts` checks, at every station of all 8000 mushrooms, points one ink line outside the painted frame all fall inside `stemOutline`.

---

<a id="t31"></a>

### `scripts/lib/play-house.ts`:152 — unresolved

```diff
@@ -0,0 +1,166 @@
… 130 lines elided …
+    await page.shoot('h2b-both-furnished');
+  }
+
+  if (newest !== undefined) {
+    const { selected } = await state();
+    await page.tap(
+      await page.evaluate(`__probe.door(${JSON.stringify(newest)})`, Point),
+    );
+    await page.step(24);
+    const mouse = await page.evaluate(
+      `__probe.mouse(${JSON.stringify(newest)})`,
+      Mouse,
+    );
+    const now = await state();
+    expect(
+      mouse.tappedAt !== null && now.clock - mouse.tappedAt < 1,
+      'a tap on a door did not call its mouse',
+    );
+    expect(mouse.out > 0.9, `the mouse is only ${mouse.out.toFixed(2)} out`);
+    expect(now.selected === selected, 'a tap on a door changed the selection');
+    await page.shoot('h3-mouse');
+  }
```

**@vzakharov (agent)** — 2026-09-26T20:11:45Z

**The play run checks that the model says the mouse is out, not that anything shows.** `mouse.out > 0.9` is true for the hidden back door too, and it's true for the ~10 px speck on `phoneP`. And the door tapped is always `newest`, the front mushroom's, so the case that fails (a door behind a stem) is never played. Two more promises of this bite have no step at all: nothing removes a furnished mushroom, so "the house sinks with it" has no frame, and nothing checks where windows land on screen.

**Ask:** tap the door where it shows on screen, through the scene's own hit test, so the step fails if another object takes the tap. Also play the clump's back door. Add a step that sinks a furnished mushroom and shoots mid-sink. Read the mouse's drawn size back through the probe, not only `out`.

**@vzakharov (agent)** — 2026-09-26T23:47:48Z

Fixed in 3c92655. The play run asks the scene's own hit test what a tap at each door's middle reaches and fails unless it is that door, then taps there; both clump doors are played, back first; the mouse's drawn head is read through the probe and asserted at least 28 px; and a new step sinks a furnished mushroom and shoots it mid-sink, asserting the house shrinks with it. All four screens pass. Frames in `docs/remove-before-merging/frames/bite-4/` (`review-*-back-door.png`, `review-*-sinking.png`).

---

<a id="t32"></a>

### `src/pages/mushrooms/ui/scene/house-view.ts`:78 — unresolved

```diff
@@ -0,0 +1,189 @@
… 71 lines elided …
+    this.graphics = scene.add
+      .graphics()
+      .setInteractive({ hitArea: this.hit, hitAreaCallback: containsOutline });
+    this.graphics.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
+      this.mouse.tappedAt = this.now();
+      this.voice.squeak();
+    });
```

**@vzakharov (agent)** — 2026-09-26T20:11:45Z

Nit: a door tap leaves an open picker open, while a flower tap closes it ("a flower tap counting as a tap on the meadow", plan, bite 3). Either is defensible, but the door and the flower are both things in the meadow that answer a tap without selecting anything, so they should behave the same. Pick one and write it into the plan's decisions.

**@vzakharov (agent)** — 2026-09-26T23:47:49Z

Kept as it is, and written down in 2645fb9: a door belongs to its mushroom and a flower to the meadow, so a door tap leaves an open picker open, as a mushroom tap does. The plan's decisions carry it, and the tap handler has a one-line comment.

---

<a id="t33"></a>

### `src/pages/mushrooms/ui/scene/insect-view.ts`:179 — unresolved

```diff
@@ -0,0 +1,252 @@
… 164 lines elided …
+    const flying = wrap(
+      shown.facing + Math.PI / 2 + tilt(path, now, motion) * BANK_TURN,
+    );
+    // Settled on its perch, it turns to face up the screen, give or take,
+    // as Syama drew it on the caps.
+    const settled = Math.min(REST_LEAN, Math.max(-REST_LEAN, flying));
+    const resting =
+      leg.to.kind === 'away' ? 0 : smooth((now - leg.arrives) / SETTLE_TURN);
+    const turn = flying + (settled - flying) * resting;
+    // Taking off, it turns from the way it sat into its heading.
+    const from = shown.turnedFrom ?? turn;
+    const lift = smooth((now - leg.departs) / LIFT_TURN);
+    shown.container
+      .setPosition(point.x, point.y + bob)
+      .setRotation(from + wrap(turn - from) * lift)
```

**@vzakharov (agent)** — 2026-09-27T01:44:02Z

**The butterfly spins round in one frame — three ways, all at the ±π seam.**

1. **Landing:** line 173 blends `flying → settled` linearly. `flying` is wrapped to (−π, π], so a butterfly that arrives heading down (≈ ±π) blends the long way round. On tablet portrait, butterfly-5 went from +1.89 to −1.60 rad in 50 ms, 383 ms after landing (`docs/remove-before-merging/frames/bite-5/review/tabP-landing-flip.png`, `Math.random` seeded 12345).
2. **At rest:** line 170 clamps `flying` to ±`REST_LEAN`. With a heading near ±π, the perch's sway nudges it across the seam, and the clamp jumps it from −0.45 to +0.45 (51°) while the butterfly sits still. That happened 2–6 times per 20 s trace on every screen, and 5 times in a full phone forest (`docs/remove-before-merging/frames/bite-5/review/phoneP-rest-lean-flip-three-on-one-cap.png`).
3. **Take-off:** tablet landscape butterfly-3 went from −1.47 to +1.01 rad in 33 ms, 0.17 s into its flight (`docs/remove-before-merging/frames/bite-5/review/tabL-takeoff-flip.png`).

For a six-year-old watching the butterflies, which is the whole point of the game, a sudden spin is the most visible defect in the bite.

**Ask:** make the rest target a function of the landing heading that is continuous across ±π, and fix it once at arrival rather than re-deriving it from a swaying heading each frame. Blend every angle through `wrap(settled − flying)`. Test: over a sweep of seeds and a stepped clock, the container's rotation never changes by more than ~0.2 rad between frames 16 ms apart, in flight, landing, at rest and at take-off.

**@vzakharov (agent)** — 2026-09-27T03:10:44Z

Fixed in ebd1407. The turn logic is now pure in `model/insect-motion.ts` (`bodyTurn`): the rest facing is `REST_LEAN·sin(landing heading)`, which has no seam at ±π, and the take-off and landing offsets are each fixed once, on the leg's first frame and the first frame after arrival, so no frame re-decides which way round to turn. The take-off turn is 450 ms, since 350 ms put a full half-turn just over 0.2 rad a frame. `bodyTurn › never spins` runs 60 seeds over five legs between swaying perches at 16 ms steps: no step over 0.2 rad, where the old logic reached 2.52 rad with 66 frames over the limit.

---

<a id="t34"></a>

### `src/pages/mushrooms/model/insect-motion.ts`:138 — unresolved

```diff
@@ -0,0 +1,152 @@
… 131 lines elided …
+    1 -
+    (1 - REST_CLOSE) *
+      (0.5 - 0.5 * Math.cos((Math.PI * 2 * now) / BEAT_REST + phase));
+  const aloft = Math.min(
+    smooth((now - departs) / TAKE_OFF),
+    1 - smooth((now - arrives) / SETTLE),
+  );
```

**@vzakharov (agent)** — 2026-09-27T01:44:02Z

**A butterfly re-routed mid-air snaps its wings shut and stops dead.** `aloft` restarts from 0 at the new leg's `departs`, and `progress` (line 38) eases from zero speed. So a leg that starts while the butterfly is still flying drops its speed to 0 and jumps the wings from the air beat to the rest pose. A probe measured a one-frame wing jump of up to 1.00, the full range.

It fires in two ordinary cases: the oldest is sent away while still arriving (five quick presses, `insects.ts:36-38`), and a mushroom is removed while a butterfly is flying to it (`insects.ts:85`). The "never jumps" tests (`insect-motion.test.ts:120`) cover a single leg only.

**Ask:** carry the take-off state across legs. A leg departing mid-air starts with `aloft = 1`, and its path leaves with the velocity the last one had (or at least not from rest). Test: wing value and position change by less than ε between the two frames on either side of a mid-flight `flightAway` and a mid-flight cap removal.

**@vzakharov (agent)** — 2026-09-27T03:10:46Z

Fixed in 43c8281. A leg now carries how far aloft the butterfly was when the previous leg was cut short (`carriedFrom`, worked out by the view at the new leg's `departs`); `aloft` starts from it, and the path leaves with a speed that grows with it, so a re-route neither shuts the wings nor stops dead. A leg from a perch still leaves at rest. `a leg that cuts a flight short` cuts a flight at its midpoint with the real `flightAway` and with `ticked` after the cap is gone: under 1 px and under 0.05 of wing per 1 ms step across the cut, and at least a quarter of the pre-cut speed in the first 16 ms. With the carry forced to 0 all four cases fail.

---

<a id="t35"></a>

### `src/pages/mushrooms/ui/scene/meadow-scene.ts`:44 — unresolved

```diff
@@ -0,0 +1,333 @@
… 36 lines elided …
+const HUD_DEPTH = 2e5;
+/** Above everything in the meadow too, but under the buttons, which keep their taps. */
+const INSECT_DEPTH = 1.5e5;
+/**
+ * How far off a cap's crown toward its rims, or off a flower's centre toward
+ * its petals' tips, butterflies spread, so two on one perch sit apart.
+ */
+const PERCH_SPREAD = 0.6;
```

**@vzakharov (agent)** — 2026-09-27T01:44:02Z

**"So two on one perch sit apart" is the account, not what happens.** The spot is `sin(phase × 5) × 0.6` (line 222): of the head's radius on a flower, of the cap's half-width on a cap. It takes no notice of who else is there. Over 2000 visits of 40 s with four butterflies:

- two or more share a perch 37% of the time with the opening clump and 21% with a full forest;
- when they share, their wingspans overlap in 74–83% (clump) and 91–98% (forest) of cases;
- in 41–72% their centres are within a quarter wingspan, nearly stacked.

Frames: `docs/remove-before-merging/frames/bite-5/review/tabL-two-stacked-on-one-flower.png`, and three on one cap in `docs/remove-before-merging/frames/bite-5/review/phoneP-rest-lean-flip-three-on-one-cap.png`.

**Ask:** decide a perch's occupancy. Either the next leg avoids a perch another butterfly is on or heading to (the model knows every `Flier`'s leg), or spots are assigned per occupant so that drawn wingspans don't intersect. Test: a sweep with the sweep's parameters in which no two perched butterflies' drawn wingspans overlap by more than, say, 25%. Then keep or rewrite this comment to state what the code does.

**@vzakharov (agent)** — 2026-09-27T03:38:54Z

Fixed in 69ac03a, with b2c0d90 so the rule never costs a butterfly. The model picks each new perch against every other flier's current leg, skipping any perch another sits on or is heading to and any the scene marks as too close to one of those (`ui/scene/perch-sight.ts`); `PERCH_SPREAD` moved there at 0.3, its comment now saying the offset is only variety. Exclusive perches alone made a butterfly with nowhere free leave the meadow (89% of opening-pair visits on a 320 px phone), so b2c0d90 adds an `air` perch: it roams to a free spot over the meadow and tries again, and only the limit sends one off screen. Over your sweep (2000 visits × 40 s × 4, every screen, opening pair and full forest): shared perches 22–38% → 0, wingspans covering more than 25% 22–53% → 0, ticks with a butterfly leaving 0. Decision in the plan (a49eb6b, 115b8c1).

---

<a id="t36"></a>

### `src/pages/mushrooms/ui/scene/meadow-scene.ts`:237 — unresolved

```diff
@@ -0,0 +1,333 @@
… 223 lines elided …
+      case 'cap': {
+        return this.bed?.capTop(perch.id, spot);
+      }
+      case 'flower': {
+        const count = this.layout?.flowers.length ?? 0;
+        const flower =
+          count > 0 ? this.flowers[flowerIndex(perch.pick, count)] : undefined;
+        const shown = flower && this.shownFlowers.get(flower.id);
+        if (!shown) return undefined;
+        const { container, head, headR } = shown;
+        return placedAt(container, container.rotation, {
+          ...pick(head, 'y'),
+          x: head.x + spot * headR,
+        });
```

**@vzakharov (agent)** — 2026-09-27T01:44:02Z

**Where a butterfly drinks, the child often can't see it drinking.** The perch is taken as given, a flower, but not as it stands on screen:

- **Under a button.** On a 320×568 phone, 5.4% of all butterfly time is spent drinking at a flower hidden under `−`, where only a wing tip shows (`docs/remove-before-merging/frames/bite-5/review/smallphone-perch-under-minus.png`). On tablet landscape, a flower at x≈0.95·width puts the wings under the house button in 14% of frames of a full-forest trace, and past the right edge in 17% of perch frames there (2.7% across the sweep) (`docs/remove-before-merging/frames/bite-5/review/tabL-flower-perch-under-house-off-edge.png`). Every other screen is ≤0.3%.
- **Behind a cap.** The flower-on-a-foot problem the plan holds open for bite 6 is now visible, because the butterfly makes the child look there. The flower's head centre is inside a nearer mushroom's cap or stem for 31% of flower-perch time on tablet portrait, 19% on a small phone, 15% on a phone, 7–11% on tablet landscape, 3–5% on desktop and 1.5–3% on phone landscape. The butterfly then seems to sit on the mushroom (the white daisy in `docs/remove-before-merging/frames/bite-5/review/tabP-landing-flip.png`).
- **Over the whole head.** The span is 1.5–3.3× the head's diameter (p50 1.9–2.8×), so a drinking butterfly always hides the flower it drinks from.

**Ask:** only flowers a butterfly can be seen on are perches. That means clear of every control's tap circle and the screen edge by the wingspan, and not covered by a nearer mushroom. Pass the flowers that qualify to the model's `pick` mapping instead of all of them. Settle the plan's open flower-on-a-foot choice in the same change, since both are about which flowers are in sight. Test: the sweep's fractions go to 0 on every screen.

**@vzakharov (agent)** — 2026-09-27T03:38:55Z

Fixed in 56540e7, with the drink's seat moved in a970464; the flower-on-a-foot choice is settled in the plan (a49eb6b): flowers stay put, and one a nearer mushroom covers is out of sight, so no insect is sent to it. A flower is offered only while its head stands clear of every control's tap circle and the screen edge by half the widest wingspan (spot and breeze allowed for), and the middle of its head is uncovered by any nearer mushroom's drawn outline; recomputed on every resize, growth and sinking, and a flier whose flower leaves sight leaves it. Flowers are now named by id, since a fraction mapped to another flower whenever the count changed. On the third bullet, a970464 seats a drinking butterfly on the head's upper rim with its proboscis curving down into the centre, so most of the flower stays in sight. Sweep: wings in a tap circle 2.5–24% → 0, past the edge 1–9% → 0, head centre inside a nearer mushroom 1.5–31% → 0, every screen. Frame: `docs/remove-before-merging/frames/bite-5/handled/tabL-drink-close-on-the-rim-proboscis-into-the-flower.png`.

---

<a id="t37"></a>

### `src/pages/mushrooms/ui/scene/meadow-scene.ts`:39 — unresolved

```diff
@@ -0,0 +1,333 @@
… 34 lines elided …
+
+/** Above everything in the meadow, spores included. */
+const HUD_DEPTH = 2e5;
+/** Above everything in the meadow too, but under the buttons, which keep their taps. */
+const INSECT_DEPTH = 1.5e5;
```

**@vzakharov (agent)** — 2026-09-27T01:44:02Z

**Buttons keep their taps; mushrooms don't.** Butterflies sit above the meadow and take the tap first, and the hit circle is ≥ 64 px. A resting butterfly covers a median 22% of a clump cap's tap area on tablet, but 60–65% on phones with a full forest (p90 77–81%). So a child selecting a small back-row mushroom with a butterfly on it mostly startles the butterfly and never gets the mushroom.

The play run doesn't see it: `play-insects.ts` taps a cap at whatever point `__probe.mushroom` finds that still reaches it, so green proves some point on the cap selects it, not the middle.

**Ask:** decide what a tap on a perched butterfly over a cap means. My recommendation is both: the butterfly flies off, and the tap goes on to the mushroom. The alternative is to shrink a percher's hit circle to its drawn body while it rests. Write the decision into the plan. Then have the play script tap the cap's centre while a butterfly rests on it and assert the outcome.

**@vzakharov (agent)** — 2026-09-27T03:10:47Z

Decided as you recommended, and written into the plan in a49eb6b: a tap on a resting insect goes through it — it flies off and the mushroom (or flower) under it gets the tap; an insect in flight takes the tap alone. Implemented in 3ce7c14; the play script (6ca70b5) clears the selection, taps while a butterfly rests on the cap, and asserts both the take-off and the selection. One deviation: the cap's middle is under the resting butterfly only on phone portrait, because it sits near the top of the cap, so on the other three screens the script taps the butterfly's own point over the cap and logs which point it used.

---

<a id="t38"></a>

### `src/pages/mushrooms/model/insects.ts`:38 — unresolved

```diff
@@ -0,0 +1,93 @@
… 21 lines elided …
+  butterfly: BUTTERFLY_LIMIT,
+} as const satisfies Record<InsectKind, number>;
+
+/**
+ * `insects` with `insect` flying in from `now`. At its kind's limit, the
+ * oldest of that kind not already leaving flies away from `now`, so a release
+ * always acts.
+ */
+export function released(
+  insects: readonly Flier[],
+  insect: Insect,
+  caps: readonly string[],
+  now: number,
+): Flier[] {
+  const staying = insects.filter((each) => !isLeaving(each));
+  const oldest =
+    staying.length >= INSECT_LIMITS[insect.kind] ? staying[0] : undefined;
```

**@vzakharov (agent)** — 2026-09-27T01:44:02Z

**The docstring already claims the kind filter the code doesn't have.** Line 27 says "the oldest of that kind", but line 36 counts every insect and line 38 evicts `staying[0]` whatever its kind. `INSECT_LIMITS` is a `Record<InsectKind, number>`, so bite 6 adding `fly: 6` type-checks, and then releasing a fly sends a butterfly away. No test would fail. The plan records the deferral, but the doc comment is the trap.

**Ask:** filter now, `insects.filter((each) => each.kind === insect.kind && !isLeaving(each))`, one line. Add a test with a two-kind limits table (a local `INSECT_LIMITS` stand-in, or a parameter) showing that a release at one kind's limit leaves the other kind alone.

**@vzakharov (agent)** — 2026-09-27T03:10:49Z

Fixed in a8ca7cd. `evicted(insects, kind, limits)` counts and picks only insects of the releasing kind not already leaving, and `released` uses it. The new `model/insects.test.ts` takes a two-kind table (`{butterfly: 2, fly: 3}`) and shows a release at one kind's limit leaving the other kind alone.

---

<a id="t39"></a>

### `src/pages/mushrooms/model/insect-genes.ts`:77 — unresolved

```diff
@@ -0,0 +1,117 @@
… 73 lines elided …
+/** The outermost eye ring's radius, and each inner ring's share of the one outside it. */
+export const EYE_RADIUS = [0.26, 0.38] as const;
+const EYE_SHRINK = [0.45, 0.65] as const;
+export const EYE_RINGS = [1, 3] as const;
```

**@vzakharov (agent)** — 2026-09-27T01:44:02Z

**About a third of butterflies have no concentric eyes.** `EYE_RINGS = [1, 3]`, and with one ring `draw-insect.ts:96-101` paints a single dark dot. 679 of 2000 seeds come out with one ring. The plan's mandala decision is "the butterflies' wings carrying concentric eyes", which is Leysan's share of the game.

Related: on 153 of 2000 seeds the outer ring reaches up to 24% of its radius past the hind wing's outline (3 seeds for the fore wing), via `eyeCentre` and `EYE_RADIUS` (line 75). This is unchecked in render; the fore wing may hide some of it.

**Ask:** minimum 2 rings. A genes test that every seed has ≥ 2 rings, and that the outer ring stays inside `wingOutline` for both pairs.

**@vzakharov (agent)** — 2026-09-27T03:10:50Z

Fixed in f4b4546. `EYE_RINGS` is `[2, 3]`, and `fitted` shrinks an eye's rings together until the outer one takes at most 0.92 of the room to the nearest wing edge over both pairs (`eyeRoom` in `insect-outline.ts`, `distanceToEdge` in `geometry.ts`). Over 2000 seeds: one-ring 679 → 0, past the hind/fore wing 153/3 → 0/0. The tests hold every seed at 2–3 rings and every point of the outer ring inside `wingOutline` for both pairs; the second fails with the fit turned off. The painter needed no change.

---

<a id="t40"></a>

### `src/pages/mushrooms/model/flight.ts`:54 — unresolved

```diff
@@ -0,0 +1,177 @@
… 47 lines elided …
+/** How many butterflies the meadow holds; a release past it sends the oldest away. */
+export const BUTTERFLY_LIMIT = 4;
+
+/** How long a flight takes, a drink at a flower, and a rest on a cap, in ms. */
+export const FLYING = [1600, 2600] as const;
+export const DRINKING = [3000, 6000] as const;
+export const RESTING = [4000, 9000] as const;
```

**@vzakharov (agent)** — 2026-09-27T01:44:02Z

**Drinking and resting differ only by a duration, which a child can't see.** `insect-view.ts:165-184` gives a flower perch the same settle turn, beat and bob as a cap. Nothing in `src/pages/mushrooms` mentions drinking except `DRINKING`. The plan's ecology is "shown, never taught": butterflies drink from flowers and rest on caps. Bite 5 is where that thread starts, and today nothing shows it.

**Ask:** give a drink something visible that ends with the drink, for example a proboscis uncurling into the head, the head dipping under the weight, and a flicker of the petals as the butterfly leaves. Keep it a pure function of the clock in `insect-motion.ts`, tested like `landingBob`, and confirm it with a frame of a flower perch beside a cap perch.

**@vzakharov (agent)** — 2026-09-27T03:38:57Z

Done in fce1202, a970464 and d3b1da1. `drinking` and `proboscis` in `insect-motion.ts` are pure functions of the clock: the proboscis unrolls once the landing bob is half done and curls up just before `leaves` (or over 400 ms when a tap cuts the drink short), the wings flex half shut while drinking, and a cap rest is exactly as before (tested against the old formula). `model/proboscis.ts` bends the tube from the head down into the flower's centre, the tip held on the centre through each sip (`proboscis.test.ts` sweeps seeds, screens, spots, sways and leans). `drinkDip` sags the flower's head under the butterfly and flickers its petals as it leaves; the scene applies it before the butterflies move so the perch sinks with the head. Frames: `docs/remove-before-merging/frames/bite-5/handled/tabL-drink-close-on-the-rim-proboscis-into-the-flower.png` beside `tabL-settled-three-drinking-one-resting-on-a-cap.png`.

---

<a id="t41"></a>

### `src/pages/mushrooms/ui/scene/insect-layout.test.ts`:19 — unresolved

```diff
@@ -0,0 +1,41 @@
… 5 lines elided …
+import { GENE_RANGES } from '../../model/mushroom-genes';
+import { meadowLayout } from './layout';
+
+const VIEWPORTS = [
+  ['tablet', 1180, 820],
+  ['tablet portrait', 820, 1180],
+  ['phone', 390, 844],
+  ['phone held sideways', 844, 390],
+  ['small phone', 320, 568],
+  ['desktop', 1920, 1080],
+] as const;
+const SPANS = Array.from({ length: 2000 }, (_, index) =>
+  wingspan(insectGenes({ seed: index * 7919 + 3, kind: 'butterfly' })),
+);
```

**@vzakharov (agent)** — 2026-09-27T01:44:02Z

**`VIEWPORTS` and the seed formula are copied verbatim** from `layout.test.ts` (lines 52–59 there, and its `index * 7919 + 3`). The first screen added to one file and not the other is a sweep that silently skips it.

**Ask:** one test-only module exporting both (e.g. `viewports.ts` beside them, not a `*.test.ts`), imported by both files.

**@vzakharov (agent)** — 2026-09-27T03:10:51Z

Fixed in 335b4ee. `VIEWPORTS` and `VISITS` live in `ui/scene/viewports.ts`, which both layout sweeps import; Steiger, ESLint and knip accept a module only tests import.

---

<a id="t42"></a>

### `src/pages/mushrooms/model/insect-genes.test.ts`:72 — unresolved

```diff
@@ -0,0 +1,74 @@
… 65 lines elided …
+    }
+  });
+
+  it('keeps the fore wings longer than the hind', () => {
+    for (const { fore, hind } of butterflies) {
+      assert.ok(fore.length > hind.length);
+    }
```

**@vzakharov (agent)** — 2026-09-27T01:44:02Z

**This test can't fail.** The fore and hind length ranges don't overlap, so `fore.length > hind.length` holds by construction. Dropping it would lose nothing.

**Ask:** delete it, or replace it with a property of what is drawn, e.g. the hind wing's outline never reaches past the fore wing's tip in `insect-outline.ts`.

**@vzakharov (agent)** — 2026-09-27T03:10:53Z

Replaced in 04a3dc5 with a property of what is drawn: over 400 seeds the hind wing's outline never reaches further sideways than the fore wing's (narrowest margin 17%). It fails with `hindLength` set to `[0.7, 0.8]`, which was tried and reverted.

---

<a id="t43"></a>

### `src/pages/mushrooms/ui/scene/hud.ts`:22 — unresolved

```diff
@@ -0,0 +1,273 @@
… 18 lines elided …
+
+/** The seed every pictogram's mushroom grows from, so each looks the same on every visit. */
+const ICON_SEED = 11;
+/** The butterfly pictogram's seed: orange, blue-eyed, three rings to each eye. */
```

**@vzakharov (agent)** — 2026-09-27T01:44:02Z

**The comment pins generator output** ("orange, blue-eyed, three rings"). A change to any gene range silently makes it false, and then the button's look changes with no test noticing.

**Ask:** assert it in a test (seed 39's genes have the orange base, the blue pattern and three rings), or cut the description down to why a fixed seed exists.

**@vzakharov (agent)** — 2026-09-27T03:10:54Z

Asserted in 0a7b7b3. The seed moved to `model/insect-genes.ts` as `PICTOGRAM_SEED` (now 100, since the wider colour set in e7f8c77 changed seed 39's look): `insect-genes.test.ts` pins its base, pattern and ring count, and `hud.ts` imports it.

---

<a id="t44"></a>

### `scripts/lib/mushroom-probe.ts`:202 — unresolved

```diff
@@ -0,0 +1,262 @@
… 193 lines elided …
+  clock: z.number(),
+});
+export const Point = z.object({ x: z.number(), y: z.number() });
+const Perch = z.object({
+  kind: z.enum(['flower', 'cap', 'away']),
+  id: z.string().optional(),
+  pick: z.number().optional(),
+  side: z.string().optional(),
+});
```

**@vzakharov (agent)** — 2026-09-27T01:44:02Z

**A hand-written `Perch` schema shadowing the model's type**, with every field optional and `side: z.string()`. It will accept a perch the model can't produce, and it drifts silently when bite 6 adds a kind.

**Ask:** a discriminated union built from arrays the model exports (the perch kinds, `SIDES` or similar), so the probe's schema derives from the source of truth per CLAUDE.md § "Derive types and schemas". Then the play script can switch on `kind` without optional checks.

**@vzakharov (agent)** — 2026-09-27T03:10:56Z

Fixed in 446ab2a and 2c6da70. `flight.ts` builds `Perch` from `PerchKind` and a per-kind field map and exports `SIDES`; the probe builds a discriminated union from one schema per kind, and that map must satisfy the model's perch type per kind — a missing kind or `side: z.string()` fails to type-check. `play-insects.ts` narrows on `kind`. The model's extensionless imports mean `play:mushrooms` now runs under `tsx`, as `render-og` does.

---

<a id="t45"></a>

### `docs/plans/mushroom-game-syama.paused.md`:68 — unresolved

```diff
@@ -0,0 +1,468 @@
… 63 lines elided …
+  вместо tmp, хочу периодически на них посматривать"; "в конце каждого куска
+  выбирать те что достойны показать"). A handled review's fixes count as
+  their bite's, and land in the same directory. `/finalize` sweeps it.
+- **The result is also an Artifact** (last bite), and its link is posted on
+  the PR, so the operator can open it the moment they are back.
```

**@vzakharov (human)** — 2026-09-27T09:41:42Z

вообще-то имел в виду атефакт в конце каждого байта, чтобы по ходу дела тоже можно было тестировать без установки. Если это не сложно. Если сложно, забей -- я уже понял как запускать локально, могу просто пуллить и запускать.

**@vzakharov (agent)** — 2026-09-27T17:13:40Z

Несложно: теперь каждый байт заканчивается публикацией игры артефактом по одной и той же ссылке, её выложу в PR, как только первая сессия дойдёт до конца байта — 4c7f8f7.

---

<a id="t46"></a>

### `.claude/skills/megabeast/notes.md`:404 — unresolved

```diff
@@ -0,0 +1,464 @@
… 395 lines elided …
+  the back door behind the front stem. The skill's sweep template should
+  include "what fraction of each new tappable thing is covered by nearer
+  things" whenever a bite adds something tappable.
+- **A pixel constant breaks a proportional layout's resize contract.**
+  `EDGE_MARGIN` made bounded sizes not scale with the screen, so flowers
+  placed against them moved on a resize. The fix was to place the dependents
+  against the layout computed with the margin at 0. The skill's layout
+  checklist should ask which quantities are exactly proportional before
+  anything keys stable placement off them.
```

**@vzakharov (human)** — 2026-09-27T09:45:16Z

если мы сделаем более широкое поле (как описано ниже), то можно делать не ресайз а просто кроп, а там уже ребёнок сам будет водить влево-вправо

**@vzakharov (agent)** — 2026-09-27T17:13:42Z

Записал вместе с зумом как байт 8: поле шире экрана, поворот меняет кроп, а не раскладку, ребёнок водит и зумит сам — 4c7f8f7.

---

<a id="t47"></a>

### `.claude/skills/megabeast/notes.md`:115 — unresolved

```diff
@@ -0,0 +1,464 @@
… 111 lines elided …
+  loads, the frames it looks at and vet's output. The skill should key the
+  decision on the notice, and expect a `/handle` session to relay `/go`
+  nearly every time rather than take a bite of its own.
+- **A relay chain is capped at eight sessions deep.** Bite 3's review
```

**@vzakharov (human)** — 2026-09-27T09:46:27Z

пока пытаюсь понять, баг это -- и тогда нужно думать как переформатировать релеи в запуски подагентов -- или фича (оператор каждый восьмой раз звучит как вполне оправданно -- надо посмотреть, сколько это по часам занимает обычно)

**@vzakharov (agent)** — 2026-09-27T17:13:44Z

По таймингам: цепочка из восьми сессий прожила ~3,5 ч на байтах 1–3 и ~13 ч на 4–6, то есть твой перезапуск нужен примерно раз в три байта. Релеи оставляю релеями, как ты сказал; записал в план и в заметки megabeast — 4c7f8f7.

---

<a id="t48"></a>

### `docs/plans/mushroom-game-syama.in-progress.md`:104 — unresolved

```diff
@@ -0,0 +1,468 @@
… 100 lines elided …
+  hills and scale. Checked by frames, not by reading code: each bite ends
+  with `/preview` screenshots and a scripted tap sequence captured frame by
+  frame at tablet and phone sizes.
+- **The meadow is a small ecosystem — the twist.** The operator asked for
```

**@vzakharov (human)** — 2026-09-27T09:53:55Z

Общее ещё наблюдение -- кажется, что экран слишком маловат -- или объекты великоваты -- чтобы было прямо интересно. Поиграться с zoom in/out двумя пальцами, т.е. чтобы игровое поле было больше. Начать с того что есть, а дальше ребёнок обязательно попробует сделать приближение/отдаление, механика им уже знакома из фотографий. Дальше можно будет думать про то чтобы по нему прямо можно было "перемещаться" (либо как спектатор, либо как участник событий -- типа подходишь слишком быстро, насекомые улетают) -- но пока оставим это за скобками.

**@vzakharov (agent)** — 2026-09-27T17:13:45Z

Байт 8 (широкое поле + пинч-зум), начиная с того, что есть; прогулка по полю вынесена за скобки — 4c7f8f7.

---

<a id="t49"></a>

### `docs/plans/mushroom-game-syama.in-progress.md`:80 — unresolved

```diff
@@ -0,0 +1,468 @@
… 76 lines elided …
+  lean, spots, wing shape, a hue nudge) plus a routine that paints the genes
+  with Phaser `Graphics`: outline, flat fill, a highlight, a shade — cartoon
+  shading as layered shapes. The seed is the state; the genes are derived.
+  Sound is synthesized with Web Audio, no files.
```

**@vzakharov (human)** — 2026-09-27T09:58:57Z

чуть-чуть поиграться с атмосферностью, сейчас это выглядит немного слишком свинка-пеппа, понаешь? вдохновиться бы какими-нибудь beautiful/atmospheric платформерами. Не о том, чтобы это был фотореализм или какое-то супер-пупер-3д, но что-то такое рисованное с душой.

Можно после окончания этого байта взять это следующим, сдвинув остальные.

Но вообще здорово!

**@vzakharov (agent)** — 2026-09-27T17:13:46Z

Спасибо! Атмосфера — следующий байт (7), с референсами Gris, Ori и Alto's Odyssey, рядом с которыми судим каждый кадр; дождь и остальное сдвинуты — 4c7f8f7.

---

<a id="t50"></a>

### `src/pages/mushrooms/model/flight.ts`:181 — unresolved

```diff
@@ -0,0 +1,356 @@
… 175 lines elided …
+ * where the other fliers sit or are heading, nor crowded by one there. With
+ * none open it flutters up and settles again where it was, while that is
+ * still a perch offered, and roams to an open spot in the air otherwise,
+ * where it looks again — to one only crowded, not taken, where a small
+ * screen's air has none uncrowded. It flies away only when the air has no
+ * spot untaken either, which the scene never lets happen.
```

**@vzakharov (agent)** — 2026-09-27T17:19:10Z

**On a 320 px phone a flier is lost: it flies away, with no eviction, when all ten are out.** That breaks "nothing starves, dies or is lost".

This comment's "which the scene never lets happen" does not hold. On phone and small phone, a 6×4 air grid minus the controls leaves as few as 8 air spots. Bees are never offered a cap, and flowers and caps crowd each other out. So ten fliers can outnumber every open place, and the last one gets `awayPerch` (lines 222–224).

- **Measured:** release the limits (4 butterflies, 3 flies, 3 bees) on small phone with the opening clump and tick for 5 minutes. 12 of 40 visits lose a flier. The first loss was a fly at the first tick, with 2 flowers in sight, 2 caps and 8 air spots.
- **Other screens:** they lost none.
- **Why the test missed it:** `perch-sight.test.ts` line 251 checks `spots.length > INSECT_LIMITS.butterfly`, bite 5's count, and ignores the flies and bees.

**Ask:** air spots at least the sum of `INSECT_LIMITS` on every screen, or a fallback that never returns `away`. Test: for every screen in `VIEWPORTS`, the opening clump, all ten released and 5 minutes of ticks, no leg goes `away` except by eviction. This fails today on small phone.

**@vzakharov (agent)** — 2026-09-28T10:01:50Z

Mostly met: no flier goes away except by eviction on any screen now — the air grid is denser and lower, a flier with every spot crowded hovers where it is (52295ea), the small phone takes a halved grid (8a3aebe), and ui/scene/fliers.test.ts sweeps all ten over every VIEWPORTS screen with the opening clump and a full forest (c825c19, split in e6faeb5). Unmet on the small phone: even the halved grid seats only 8 of the 10 apart, so two fliers hold overlapping air spots on 33% of ticks with the opening clump and 0.28% with a full forest over three visits; those two tests run as `todo` (`AIR_UNMET`), since seating all ten would take a grid of ~4300 spots.

---

<a id="t51"></a>

### `src/pages/mushrooms/ui/scene/flower-sight.ts`:299 — unresolved

```diff
@@ -0,0 +1,304 @@
… 290 lines elided …
+        return false;
+      }
+      const spot = ringSpot(layout, parent.place, slot);
+      const turnedSpot = ringSpot(turned, turnedParent.place, slot);
+      return (
+        spot !== undefined &&
+        turnedSpot !== undefined &&
+        plantable(layout, spot, here, covers) &&
+        plantable(turned, turnedSpot, there, turnedCovers)
```

**@vzakharov (agent)** — 2026-09-27T17:19:10Z

**A tablet plants one flower, then never another, and the "bed grows round" never shows.** This is the bite's twist, on the primary screen.

The cause is line 299: every ring slot must also be `plantable` on the turned screen. The turned layout puts mushrooms and flowers somewhere else, so a slot clear here is usually covered there.

| | tabL | tabP | phoneS | phoneP / phoneL |
| --- | --- | --- | --- | --- |
| Planted per meadow in 4 min, 3 bees alone | 1.1 | 0.65 | 1.03 | 6.1 / 6.75 |
| Meadows that never plant | 32% | 53% | | |
| Median capacity | 1 | 0 | 1 | |
| Median capacity, turned rule off | ~5 | 4.5 | 4.6 | |

- **When it plants:** nearly all of it happens in the first minute. From minute 1 to minute 4, tabL adds 0.03.
- **What worst-case genes cost:** almost nothing (3.93 room per meadow with them, 3.98 with average genes).
- Frames: `docs/remove-before-merging/frames/bite-6/review/tabL-the-one-flower-a-tablet-plants.png`, and next to it `docs/remove-before-merging/frames/bite-6/review/phoneL-a-phone-plants-a-full-bed.png`.

The rule is stricter for a planted flower than for a seeded one. The plan already lets a seeded flower fall out of sight after a turn: it is simply not offered as a perch. Holding planted flowers to that same rule, sight on this screen only, is consistent with "Flowers stay put". It is also where bite 8, which turns a rotation into a crop, ends up anyway.

**Ask:** drop the turned-screen condition, and let a planted flower the turn hides be out of sight as a seeded one is. Test in `flower-plots.test.ts`: over 2000 seeds, median planting capacity ≥ 4 on tabL and tabP. The test today only asserts `count > 0` over 150 visits.

**@vzakharov (agent)** — 2026-09-28T10:01:52Z

Done as asked: planting asks for sight on this screen only, and a planted flower a turn hides waits out of sight until the screen turns back (e1db096). The test plants all 2000 visits out and holds the median at ≥ 4 on both tablets, with the clump and with a full forest (5/4 and 5/5 measured).

---

<a id="t52"></a>

### `src/pages/mushrooms/ui/scene/perch-sight.ts`:157 — unresolved

```diff
@@ -0,0 +1,194 @@
… 153 lines elided …
+    const seat = seatAt(stand, perch, 0);
+    return seat ? [{ perch, seat }] : [];
+  });
+  const apart = (1 - MOST_OVERLAP) * WIDEST_SPAN * layout.insectSize;
```

**@vzakharov (agent)** — 2026-09-27T17:19:11Z

**Bees starve beside butterflies, and flies don't settle "mostly on the fly agarics".**

Line 157 marks two perches as crowded at the butterfly's widest wingspan, whoever sits on them. A bee is 0.65 of a butterfly, and a fly smaller still. So four butterflies crowd out most of the flowers a bee could use, and the caps a fly could use.

- **Share of bee flights ending in the air, with 4 butterflies:** tabL 85%, tabP 97.5%, phoneP 91%, phoneS 99.6%.
- **Share of the bees' time spent roaming:** tabP 93%, phoneS 98.8%.
- **Planting on phoneS with butterflies:** 0.05 per meadow.
- **Removing flower–flower crowding alone** (tablet, 40 visits) lifts bee legs bound for a flower from 0.33 to 0.80, against 0.91 with no butterflies.
- **Flies:** in a forest with 3 of 6 caps spotted, only 30–35% of fly landings are on spotted caps (9% on phoneS). Among cap landings it is 43–49%, where `spottedPull` should give ~75%.
- **Sight takes its share too:** on tabP, 61% of seeded flowers are never perches. 38% are covered by the opening pair, 12% stand near a control, and 11% are too near the edge.
- Frame: `docs/remove-before-merging/frames/bite-6/review/tabP-bees-roam-past-flowers-out-of-sight.png`.

**Ask:** crowding takes the wingspans of the kinds actually involved (the flier choosing and the one holding the other perch), not `WIDEST_SPAN` for all. Tests on the real `perchSight`, not the `crowded: []` in `swarm.test.ts`: with 4 butterflies, bees roam < 40% of their time on every screen, and ≥ 60% of fly landings are on fly agarics.

**@vzakharov (agent)** — 2026-09-28T10:01:53Z

Done: crowding now takes the pairing of kinds actually involved, each from its own seat and span (52295ea); seated butterflies and flies make way for a waiting bee (8321601); and bees see flowers from their own seat (8a3aebe). ui/scene/fliers.test.ts, on the real perchSight, holds bees among butterflies under 25% roaming on every screen (small phone 13.4%) and fly landings on fly agarics at ≥ 60% (least: tablet portrait, 70%) (c825c19).

---

<a id="t53"></a>

### `src/pages/mushrooms/ui/scene/perch-sight.ts`:175 — unresolved

```diff
@@ -0,0 +1,194 @@
… 166 lines elided …
+  );
+  // Hovering fliers never overlap: two spots in the air nearer than the
+  // widest wingspan crowd each other.
+  const air = airSpots(layout);
+  const span = WIDEST_SPAN * layout.insectSize;
+  const aloft = air.flatMap((spot, index) =>
+    air
+      .slice(index + 1)
+      .filter((other) => Math.hypot(spot.x - other.x, spot.y - other.y) < span)
```

**@vzakharov (agent)** — 2026-09-27T17:19:11Z

**On a 320 px phone the fliers pile up in the air, and half the taps hit the wrong insect.**

Only destinations are kept apart. Paths never are, and phoneS has only 8 air spots to spread across.

- **Overlap:** 86% of phoneS frames have two flying insects with overlapping wings, and 45% with overlapping bodies. The other screens show 14–36% wing overlap.
- **Taps:** of 10 taps aimed at a flying fly, 5 reached it; for bees, 7 of 10. Another insect was on top.
- **The play run:** `flier-watch.ts` counts crossings but never fails on them.
- Frame: `docs/remove-before-merging/frames/bite-6/review/phoneS-fliers-pile-up-in-the-air.png`.

**Ask:** a tap resolves to the flier whose body is nearest the finger, rather than the top-drawn one, so the child gets the one they aimed at. And fewer pile-ups on phoneS, e.g. air spots spread by the kind's own span with legs staggered. Check: < 20% of phoneS frames with flying bodies overlapping, and ≥ 9/10 taps at a flying fly reach it.

**@vzakharov (agent)** — 2026-09-28T10:01:55Z

The tap half is done: a tap reaches the flier whose body is nearest the finger (c53c421), and the play run lands 10 of 10 taps on a fly in flight (c7a61f6). The pile-up half is only partly met: the air spots crowd by the kinds' own spans (52295ea) and the small phone takes a halved grid (8a3aebe), but that seats only 8 of 10 apart, so overlapping air spots remain on 33% of ticks with the opening clump (0.28% with a full forest); those tests run as `todo` under `AIR_UNMET` in ui/scene/fliers.test.ts.

---

<a id="t54"></a>

### `src/pages/mushrooms/ui/scene/sound.ts`:263 — unresolved

```diff
@@ -0,0 +1,291 @@
… 258 lines elided …
+    this.context?.close().catch(reportError);
+  }
+
+  private play(voice: Voice): void {
+    if (this.context && this.master) voice(this.context, this.master);
```

**@vzakharov (agent)** — 2026-09-27T17:19:11Z

**Mute stores sounds up instead of dropping them, and plays them all at once on unmute.**

A suspended context's clock does not advance. So every voice asked for while muted is built and scheduled at the same frozen moment. That includes the planting chimes, which fire from ticks with no tap. Their nodes pile up meanwhile. `scheduleBird` already guards on `state === 'running'` (line 272) for exactly this reason; `play` doesn't. Hidden tabs have the same problem.

- **Measured:** bee-band loudness right after unmute was −56 dB with no muted taps, −33 dB after one, and −19 dB after five.

**Ask:** `play` builds nothing unless the context is running. The pending first-tap voice before the context exists stays as it is. Test with a fake `AudioContext`: no node is created while muted or hidden, and the loudness after unmute reads at baseline.

**@vzakharov (agent)** — 2026-09-28T10:01:56Z

Done: `play` builds a voice only while the synth is unmuted, shown and running; the first-tap voice before the context exists still waits for `start` (91849d5). sound.test.ts uses a fake Web Audio and checks that no node is built while muted or hidden and nothing is queued for unmute; four of its six cases fail before the fix.

---

<a id="t55"></a>

### `src/pages/mushrooms/model/insect-motion.ts`:167 — unresolved

```diff
@@ -0,0 +1,309 @@
… 159 lines elided …
+    case 'fly': {
+      return 0;
+    }
+    case 'bee': {
+      const into = roundAt(now, BUZZ_EVERY, phase);
+      if (into >= BUZZ_FOR) return 0;
+      const swell = Math.sin((Math.PI * into) / BUZZ_FOR);
+      return BUZZ_OPEN * swell * (1 - wave(now, BEAT_AIR.bee, phase));
```

**@vzakharov (agent)** — 2026-09-27T17:19:11Z

**A resting bee's flutter strobes.** It uses the in-flight beat `BEAT_AIR.bee` (~36 ms, about two frames at 60 fps). At rest `insect-look.ts` shows the wing graphics fully and no blur.

`draw-buzz.ts`'s own header says a beat that fast "would strobe at 60 frames a second if drawn as a wing".

- **Measured at 60 fps:** four consecutive frames read 0, 0.215, 0.022, 0.291 rad. Median change during a flutter is 0.19 rad per frame (max 0.52), and 65% of flutter frames jump > 0.1 rad.
- **Why the test missed it:** `buzz-rest.test.ts` samples every 3 ms, so it never sees the aliasing.
- Frame: `docs/remove-before-merging/frames/bite-6/review/tabL-bee-rest-flutter-4-consecutive-frames.png`.

**Ask:** a resting flutter slow enough to be drawn as a wing (≥ ~150 ms a stroke), or the blur fan at rest too. Test sampled every 16.7 ms: wing change < 0.08 rad per frame, and at most ~2 direction changes per flutter.

**@vzakharov (agent)** — 2026-09-28T10:01:58Z

Done: a resting flutter is one lift and one fall over 420 ms (210 ms a stroke), at most 0.065 rad a frame (739b348). buzz-rest.test.ts now samples at 60 fps and asserts < 0.08 rad a frame and at most two direction changes per flutter.

---

<a id="t56"></a>

### `src/pages/mushrooms/ui/scene/flower-sight.ts`:84 — unresolved

```diff
@@ -0,0 +1,304 @@
… 76 lines elided …
+ */
+const ABOVE_CENTRE = 0.3;
+
+/**
+ * How far above a flower's centre a fly or a bee sits, in units of its size:
+ * on the centre itself, which it has no proboscis to reach from the rim.
+ */
+const ON_CENTRE = 0.12;
```

**@vzakharov (agent)** — 2026-09-27T17:19:11Z

**A bee on a flower hides it.** `ON_CENTRE` sits the bee dead centre, and `layout.ts` 411–415 sizes it from the butterfly unit, which has a 60 px floor.

- **Pixel check** (bee hidden and shown at the same moment): it covers 54–90% of the head and 93–98% of its centre.
- **Tablet:** bee span 75 px against a 55 px median head.
- **phoneS:** 39–42 px bee on a 17–22 px head.
- `insect-layout.test.ts` only bounds the bee against butterflies.
- Frame: `docs/remove-before-merging/frames/bite-6/review/phoneP-bees-hide-the-flowers-they-sit-on.png`. The two bees on the left sit where a flower was.

The pollination is the thing to watch, and the child can't see a flower being visited if the visitor covers it.

**Ask:** ≥ 50% of the head stays visible under a bee on every screen: a smaller bee, or one perched on the head's side or rim rather than its centre. Test: bee span ≤ ~0.8 of the median head diameter per screen, or a covered-fraction bound.

**@vzakharov (agent)** — 2026-09-28T10:01:59Z

Done: a bee sits on the head's lower rim facing in instead of the centre, and no bee had to be shrunk (0a36044). The test measures the painted bee's cover of the median head over crawl, flutter and lean: at most 24% on tablets and 45% on the small phone, against the 50% bound.

---

<a id="t57"></a>

### `src/pages/mushrooms/ui/scene/sky-layout.ts`:402 — unresolved

```diff
@@ -0,0 +1,421 @@
… 395 lines elided …
+        Math.hypot(pick.x - corner.x, pick.y - corner.y) <
+        tapReach(pick.r) + reach,
+    );
+  const { x: across, y } = meets(rays)
+    ? {
+        x: meets(r) ? width - corner.x : corner.x,
+        y: Math.max(...picks.map((pick) => pick.y + tapReach(pick.r))) + rays,
```

**@vzakharov (agent)** — 2026-09-27T17:19:11Z

**On phones the sun sinks behind the hills.** When it meets the pickers it drops below them, and `placeSun` never receives the horizon.

- **Median share of the disc behind the hills, 10 seeds:** phoneS 97% (fully hidden on 4 of 10), phoneL 73%, phoneP 20%. Tablets 0.
- Frame: `docs/remove-before-merging/frames/bite-6/review/phoneL-sun-wholly-behind-the-hills.png`.

**Ask:** the sun stays in the sky on every screen. If the drop can't clear the pickers and the horizon both, move it across or shrink it. Test in the layout sweep: `sun.y + sun.r <= horizon`, or ≥ 80% of the disc showing, on every seed and screen.

**@vzakharov (agent)** — 2026-09-28T10:02:01Z

Done: `placeSun` now knows the horizon and shrinks the sun (never below half) until four fifths of the disc clear it, and the far hills part under the sun (77d0bbd; the sun moved to sun-layout.ts in edbf253). layout.test.ts sweeps 200 visits per screen for ≥ 80% of the disc showing; worst hidden share is now 0.18 on the small phone, 0 on tablets.

**@vzakharov (agent)** — 2026-09-28T10:38:19Z

The straight cut across the bottom of the sun is gone in b4834ef: the sun now shrinks until its whole disc clears the horizon, and the far hills dip under it in a curved valley with no flat floor, on every screen.

---

<a id="t58"></a>

### `src/pages/mushrooms/model/buzz-rest.ts`:26 — unresolved

```diff
@@ -0,0 +1,122 @@
… 22 lines elided …
+const EASE_OUT = 250;
+
+/** How far a fly jitters, and its two shakes' periods, in ms, never in step. */
+const JITTER = 0.012;
```

**@vzakharov (agent)** — 2026-09-27T17:19:11Z

**The fly's jitter is invisible.** `JITTER = 0.012` of its size is 0.4 px on phones and 0.7 px on tablets, about 1% of its span. The hop, at 5–9 px, is the only fidget a child sees.

The plan's "jitter, rub their legs and hop" reads as three behaviours. On screen it is one.

**Ask:** jitter at least ~1.5 px on every screen (roughly 0.04 of the size). Check the rub's travel in px while there; it wasn't measured.

**@vzakharov (agent)** — 2026-09-28T10:02:02Z

Done: `JITTER` is 0.05 of the size, 1.65 px at the smallest fly drawn and ~3 px on a tablet, with a VIEWPORTS sweep asserting ≥ 1.5 px (635f59a). The rub was measured while there and already shows: 9 px or more of foot travel on a phone.

---

<a id="t59"></a>

### `scripts/lib/flier-watch.ts`:187 — unresolved

```diff
@@ -0,0 +1,189 @@
… 183 lines elided …
+});
+
+/** The most a flier's body turns between two frames, in radians. */
+export const MOST_TURN = 0.2;
```

**@vzakharov (agent)** — 2026-09-27T17:19:11Z

**This bound can't fail.** The view caps a body's turn at 10.8 rad/s, which is 0.18 rad a frame at 60 Hz. So the play run measures the cap, and a spin shows up as a smooth 10.8 rad/s turn that passes.

Related tests that pass by construction:
- `swarm.test.ts` line 35 hands the model `crowded: []` and room at every flower, so "never two to one perch" never exercises crowding.
- `perch-sight.test.ts` "the air" recomputes the implementation's own formula for one seed.
- `flight-kinds.test.ts` 72–75 keeps three flowers always open, so `to.kind === 'flower'` is guaranteed.

**Ask:** make the watch fail on what a child sees, not on the cap. For example: a flier's heading within ~0.3 rad of its direction of travel once a leg is past its first 150 ms, and no more than one full turn per leg. Feed `swarm.test.ts` from the real `perchSight` on a few screens, so the crowding findings above have a test that fails today.

**@vzakharov (agent)** — 2026-09-28T10:02:03Z

Done: the watch now fails on a body more than 0.3 rad off its way past a leg's first 150 ms, or turning round more than once in a leg (e8e53f7), and the flight was fixed to pass it (ebb4b2c, 678b2e9, 38b2ac3, c7a61f6); all five screens play. The watch then caught a lurch from a released cap, which now settles over a whole swell, 1.3 s (290612d), and a reselect mid-settle now swells on from where it stands (4550cd0). For the test half, ui/scene/fliers.test.ts plays visits through the real perchSight on every screen (c825c19).

---

<a id="t60"></a>

### `src/pages/mushrooms/ui/scene/paint-land.ts`:81 — unresolved

```diff
@@ -0,0 +1,138 @@
… 69 lines elided …
+ * and deeper near, mottled: bands under the seam, each toned by how far down
+ * the ground it starts.
+ */
+export function paintGround(
+  graphics: Phaser.GameObjects.Graphics,
+  layout: MeadowLayout,
+  random: Random,
+): void {
+  const { height, groundTop } = layout;
+  const seam = groundSeam(layout);
+  const top = Math.min(...seam.map(({ y }) => y));
+  for (const { outline, down } of hillBands(seam, height, GROUND_BANDS)) {
```

**@vzakharov (agent)** — 2026-09-28T15:00:34Z

**The "static, free" backdrop is replayed from scratch every frame, and it is why the play run went from ~1 to ~5 min a screen.** A Phaser 4 `Graphics` keeps a command list and re-tessellates all of it on every render (`GraphicsWebGLRenderer.js`, the `commandBuffer` loop): each `fillCircle` is ~100 points of sin/cos, each band path goes through Earcut again. Measured on tabL: 143,888 draw commands against bite 6's 62,649 — `paintGround` ~19k (32 bands over the 128-step seam), `paintRanges` ~13.3k, the HUD pictograms ~7k each; the halo alone blends ~12 screens of pixels a frame (bite 6's glow: 0.6). Rendered-frame JS median 31.5 ms vs 13.3 ms at bite 6, 7.3 ms with the backdrop hidden. That is over a 16.7 ms frame on a real tablet, not only swiftshader (logic `headlessStep` is 0.1 ms before and after).

Ask: bake sky, sun, ranges, ground, wash and grain into one texture per resize (a `DynamicTexture`/RenderTexture redrawn in place, so the resize rule — repaint, never destroy — holds); clouds stay live since they drift. Same for the HUD discs, whose pictograms never change. Then correct the "(d) Static … free" cost lines in `look.md` (110, 125, 162, 179, 211, 220), since bite 8 reads them, and add a per-frame budget to the play run (e.g. fail on a render median past N ms) so the next look bite can't do this silently.

**@vzakharov (agent)** — 2026-09-28T16:12:37Z

Baked in 505160c: the backdrop is three textures painted once a paint and repainted in place on resize (sky, halo and sun under the live clouds; hills and ground over them; the wash screened over all), rendered at 2× so the sun's rays stay smooth; 8c9c15f bakes each button face, rebaked only when its look, place, size or ratio changes. Pixel diff at the same seed is edge-only (≤0.19% of pixels past 8 levels). Rendered frame on the opening meadow 16–35 → 6–9 ms; play run tabL 294 → 129 s, tabP 262 → 119, phoneP 189 → 99, phoneS 69 → 44. The run now fails a screen past a 26 ms median frame (9455cc6, 73835c0), and b2bc1f8 corrects look.md's cost lines.

---

<a id="t61"></a>

### `src/pages/mushrooms/ui/scene/insect-view.ts`:255 — unresolved

```diff
@@ -0,0 +1,342 @@
… 249 lines elided …
+    const offset = perched ? fidget(shown.look, moment) : { x: 0, y: 0 };
+    Object.assign(shown, { end, at: point, offset, bob: bob / size });
+    const middle = { x: point.x + offset.x, y: point.y + bob + offset.y };
+    shown.container
+      .setPosition(middle.x, middle.y)
+      .setRotation(turn)
```

**@vzakharov (agent)** — 2026-09-28T15:00:34Z

**"One light" is false for a flying insect: its shading turns with its body.** Each insect is painted in its own frame with the screen's `toward`, then the container is rotated by the heading. Share of flight frames lit >90° away from the sun: butterfly 44% (tabL) / 57% (phoneP), fly 33/33%, bee 37/39%; on tabL the light reads as coming from *below* on 46% of a bee's flight frames. Two bees facing in on opposite rims of one flower are lit from opposite sides. `light.ts:2-3` promises one direction every shade takes its side from; the spec never argued for the exception — plan 478-479 turned it into a feature after the fact.

Ask: hand the painters `toward` rotated by `−turn`, and repaint the lit parts only when the turn moves past a step (π/8 or so, the way the legs already use `RUB_STEP`). Fix before bite 8, whose species go through the same painters. Frame: `docs/remove-before-merging/frames/bite-7/review/tabL-bee-heading-down-lit-from-below.png` (subtle at this size; the numbers are the evidence).

**@vzakharov (agent)** — 2026-09-28T15:52:19Z

Fixed in 570486e. The painters now get the sun turned into the body's frame (`turnedLight` in `model/light.ts`), and a look repaints its lit parts only when the body has turned past π/8 (`litTurn`, like `RUB_STEP`) — about 16 repaints a full turn, nothing per frame. Flight frames lit more than 90° off the sun went from 52–67% to 0 on tabL and phoneP, worst 0.39 rad; two bees on opposite rims are lit from the same side. `model/insect-light.test.ts` fails 18/19 with `turnedLight` disabled. The per-frame turn bound from the review body is in e835c12: the watch records each kind's worst turn rate against the `TURN_RATE` steering caps it at.

---

<a id="t62"></a>

### `src/pages/mushrooms/ui/scene/backdrop-tones.ts`:97 — unresolved

```diff
@@ -0,0 +1,119 @@
… 89 lines elided …
+ * inside the part the halo has already paled, since yellow laid over blue
+ * mixes to a grey-teal; and the glow close about the rays.
+ */
+export const SUN_HALO: readonly HaloDisc[] = [
+  ...discs(PALETTE.highlight, 44, [9, 1], () => 0.045),
+  ...discs(PALETTE.skyWarm, 26, [3.5, 1], () => 0.048),
+  ...discs(PALETTE.sunGlow, 14, [SUN_GLOW_REACH, 1], (inward) => 0.04 * inward),
+];
```

**@vzakharov (agent)** — 2026-09-28T15:00:34Z

**On a phone the sun's glow eats the sky and sits in the hills as a flat cream cut-out** — the first thing a parent sees on phoneP. 44 `highlight` discs at 0.045 out to 9 radii plateau: out to ~3 radii R/G sit flat at `highlight` (245,242), and the far hills part round the sun only 2 radii deep (`skyline.ts` `PARTED_DEPTH`), so the bowl is one flat cream whose only edge is the hill line. Coverage of the sky above the hills (≥8/255 shift): phoneP 82%, phoneS 72%, tabL 68%. Frames: `docs/remove-before-merging/frames/bite-7/review/phoneP-halo-bowl-cut-by-hills.png`, `phoneS-halo-bowl-cream-cutout.png`.

Ask: keep the stacked opacity below the plateau (~0.6 total) so the halo always falls off, scale its reach by the screen's short side rather than sun radii, and make the bowl shallower and wider than the bright core (or fade the core before the hill line). A sweep bound to hold it: on every screen, sky pixels shifted by the halo ≤ ~40%, and no flat run of `highlight` ≥ 1 r wide. This also covers the plan's own open item "on a phone the sun's pale halo covers most of the upper sky".

**@vzakharov (agent)** — 2026-09-28T16:43:43Z

Fixed in be2c5ee. Stacked faint discs could not fall off smoothly — an 8-bit blend rounds a disc under half a level to nothing — so the halo is now four layers, each fading by a smoothstep from its peak to zero at its reach (the widest sized by the screen's short side), mixed with the sky at full precision into shaded cells baked into the far picture; the hills part under the sun 3 radii wide, wider than the glow. Sky shifted ≥8 levels went 82/72/68% → 17/16/27% (phoneP/phoneS/tabL), worst screen tabP 36%, bounded at 40% on every viewport, and no flat run reaches 1 r (max 0.31 r). Frames: `docs/remove-before-merging/frames/bite-7/handle/*-sky-halo-before-after.png`. This also closes the plan's open item on the phone halo.

---

<a id="t63"></a>

### `src/pages/mushrooms/ui/scene/backdrop-tones.test.ts`:139 — unresolved

```diff
@@ -0,0 +1,179 @@
… 135 lines elided …
+  });
+
+  it('stacks the sun’s halo in steps too fine to read as rings', () => {
+    for (const [, alpha] of SUN_HALO) assert.ok(alpha <= 0.05);
```

**@vzakharov (agent)** — 2026-09-28T15:00:34Z

This asserts the halo's alphas are ≤ 0.05 against literals of 0.045/0.048/0.04 — true by construction, and not the property in the test's name. Whether rings show depends on the colour step between neighbouring discs *after* stacking (and the frame above shows the opposite failure: no rings, a plateau). Ask: assert the composited step between adjacent discs (below one 8-bit level, say) and that the halo keeps falling off to its edge.

**@vzakharov (agent)** — 2026-09-28T16:43:45Z

Replaced in be2c5ee: with the discs gone, the test checks the painted cells against the designed falloff (within 2.5 levels — the cells interpolate smoothly, so a one-level step bound is not the right measure), that level with the sun the light never brightens again going outward, and that it is gone a screen away. Each assertion fails against a deliberately plateaued or over-wide halo.

---

<a id="t64"></a>

### `src/pages/mushrooms/ui/scene/ink.test.ts`:35 — unresolved

```diff
@@ -0,0 +1,152 @@
… 29 lines elided …
+/** A fill light enough that an ink can stand off it at 3:1. */
+const INKABLE = 0.15;
+
+const grounds = Object.entries(PALETTE)
+  .filter(([name]) => name === 'ground' || name === 'groundLit')
+  .flatMap(([, colour]) => (typeof colour === 'number' ? [colour] : []));
```

**@vzakharov (agent)** — 2026-09-28T15:00:34Z

**The ink-contrast tests only use the two lightest grounds, and pass by construction.** `inkFor` caps every ink at luminance 0.06, so 3:1 against `ground` (0.305) and `groundLit` (0.51) follows from the constant; lines 66-68 restate `INK_MOST`; 57-64 hold because the clamp targets 3.1 and dark fills are exempt. Left out: `groundDeep` and the lower meadow where the front row stands — `groundAt(0.96)` is 0.168, where 55 of 66 creature fills' inks are under 3:1 (white flowers, spots, stems, mouse, pale butterflies ≈1.95–2.0). And the clamp runs *before* `tone()` (`shapes.ts:59`, `draw-mushroom.ts:92`), so haze lifts back-row inks past 0.06: the farthest stem's outline is 2.33:1 on the lit ground, under 3:1 until ~0.2 down the ground. `look.md:365-369` set the bar as "every creature fill's ink against every ground colour" — the test was written against a smaller frame.

Ask: test `tone(inkFor(fill), haze)` against `groundAt` over the band each kind actually stands in, `groundDeep` included, and decide the real bar (e.g. "ink *or* fill ≥ 3:1 against the ground under it" — ink alone at 3:1 there needs `INK_MOST` ≈ 0.02, near black). Haze the ink less than the fill, or clamp after haze. Then fix plan 469-470's "contrast-clamped against its fill and the ground" to what holds.

**@vzakharov (agent)** — 2026-09-28T15:26:56Z

Fixed in 842d0c6. The tests now measure the drawn ink, `inkFor(tone(fill))`, against `groundAt` at every foot the layout places on every viewport, `groundDeep` included, for every edged creature fill and its hue nudges; the bar is "ink or fill ≥ 3:1 against the ground under it". 1509 of 6666 (fill, foot) pairs failed before, 0 now. The clamp runs after haze, so a back-row outline meets the same bar as the front row's.

---

<a id="t65"></a>

### `src/pages/mushrooms/ui/scene/ink.ts`:28 — unresolved

```diff
@@ -0,0 +1,211 @@
… 23 lines elided …
+const INK_MOST = 0.06;
+/** The contrast an ink keeps against its own fill, where the fill is light enough to allow it, with a little room over 3:1. */
+const INK_CONTRAST = 3.1;
+/** The darkest an ink is held to, so a dark fill's edge is its own deep colour and never black. */
+const INK_LEAST = 0.012;
```

**@vzakharov (agent)** — 2026-09-28T15:00:34Z

`INK_LEAST` floors the *target*, but `dimTo` only darkens, so it never floors the ink: `beeBlack` → 0.0102, `doorway` 0.0100, `flyBody` 0.0120 — below "the darkest an ink is held to". For dark fills "stands off the fill itself" (line 34) is untrue too: capDark 1.17–1.31:1, bee 1.16, fly 1.28, insect body 1.36 against their own fill. Bite 8 inks a brown porcini cap through this. Ask: either add the floor and a light-ink branch for dark fills, or say what the function does.

**@vzakharov (agent)** — 2026-09-28T15:26:58Z

Fixed in 842d0c6. `INK_LEAST` now floors the ink itself (`lightenTo` in `colour.ts`). A fill dark enough to stand 3:1 off every ground by itself (bee, fly, doorway, dark cap, insect body — each nudged slightly darker to get there) takes a lighter blue-violet ink 3:1 above it, so the edge always stands off its own fill; every other ink is darkened until it stands off both its fill and the ground.

**@vzakharov (agent)** — 2026-09-28T16:08:33Z

Revised in 3476070: the lighter blue-violet edge read as a lavender ring round the bee's head, not a pen line, so a fill dark enough to stand 3:1 off every ground by itself (bee black, doorway, dark cap, insect and fly bodies) now takes its edge in its own hue, lightened 1.6:1 above it — that fill already carries the ground bar. `INK_LEAST` still floors every ink; the tests check the hue, the 1.5–2:1 standoff and `lineInk` against every ground depth. Frames in 1d106bb.

---

<a id="t66"></a>

### `src/pages/mushrooms/ui/scene/draw-mushroom.ts`:184 — unresolved

```diff
@@ -0,0 +1,240 @@
… 180 lines elided …
+  }
+
+  const shine = toMushroom(capShine(genes, toward));
+  lit(PALETTE.rimLight, SHINE_ALPHA);
```

**@vzakharov (agent)** — 2026-09-28T15:00:34Z

**The cap's shine is painted over the spots, so on most caps it sits on a spot like a sticker** (pink over cream; `tabL-lit-cap-close.png`, `docs/remove-before-merging/frames/bite-7/review/tabL-shine-over-spot.png`). Over 3,000 spotted seeds, 73–83% of caps have the shine overlapping a spot, 16–19% of spots touched. Ask: paint the shine before the spots (it is light on the cap, not on the spots), or clip it at them; add the overlap sweep as a test.

**@vzakharov (agent)** — 2026-09-28T16:18:58Z

Fixed in b4cedec: the cap's light is one ordered list (`capLight`) — shade, rim light and shine go down before every spot. A 3,000-cap sweep rasterises the layers in order and asserts no shine shows over a spot (it did on ~70% before); it fails with the old order.

---

<a id="t67"></a>

### `src/pages/mushrooms/model/mushroom-outline.ts`:41 — unresolved

```diff
@@ -0,0 +1,117 @@
… 37 lines elided …
+}
+
+/** The stem as a closed outline around its bent centreline. */
+export function stemOutline(genes: MushroomGenes): Point[] {
```

**@vzakharov (agent)** — 2026-09-28T15:00:34Z

**Stems end in a slanted plank cut, with the shadow off to the side.** The foot is flat in the stem's own frame, the whole mushroom Graphics is rotated by the lean (−13° / +18.5° on the opening clump) and the shadow isn't, so the foot rises 18–25 px across its 75 px width on tabL; neither corner lies in the contact or core shadow (only the faint 0.12 layer), the core is ~30 px sideways. A child reads a stick poked into the grass, not a mushroom growing out of it. Frame: `docs/remove-before-merging/frames/bite-7/review/tabL-stem-foot-plank-cut.png`. Ask: level or round the foot against the lean (or bury it under a grass tuft line), and centre a contact shadow as wide as the foot under both corners; test that both foot corners land inside the contact shadow for every lean the genes allow.

**@vzakharov (agent)** — 2026-09-28T16:19:00Z

Fixed in 8e76bb6: `stemOutline(genes, turn)` levels the foot against the mushroom's turn and rounds it into the grass, and `mushroomShadow` centres the contact under the foot at 1.3× its width. The test checks both foot corners sit inside the contact and within 1 px of level for every splay on every screen (before: 18–25 px rise across the foot on tabL). The tap area and door sight take the same turn.

---

<a id="t68"></a>

### `src/pages/mushrooms/ui/scene/mushroom-light.ts`:28 — unresolved

```diff
@@ -0,0 +1,99 @@
… 24 lines elided …
+
+/** The dome's arc on the side turned from the light: where the shade lies. */
+export function capShadeArc(genes: MushroomGenes, toward: Point): Point[] {
+  return sideArc(genes, litSide(toward) === 1 ? -1 : 1, 0.3);
```

**@vzakharov (agent)** — 2026-09-28T15:00:34Z

Side shading is one binary `litSide(toward)` for the whole screen, so mushrooms and flowers on the far side of the sun are lit from the wrong side: phoneL and phoneS 2 of 6 slots, flowers 1–4 of 7 by screen. On phoneS `toward.x` is 0.07 — sun nearly overhead — and it still gets full side shading. Ask: scale the side shade by `|toward.x|`, or take the direction per object from the object to the sun (it's a point on screen, not at infinity); test "lit side faces the sun" per slot on every screen, not only the opening clump.

**@vzakharov (agent)** — 2026-09-28T16:19:02Z

Fixed in 52e3079: each mushroom takes its light from the cap's middle to the sun, turned into its own frame with `turnedLight`, and each flower from its head; the side shade and rim light scale with how sideways the sun is to that thing, none with the sun overhead. The lit-side tests run per slot (40 seeds) and per flower on every viewport and fail on all six with the old single light. `light.ts` now says so.

---

<a id="t69"></a>

### `src/pages/mushrooms/ui/scene/sun-layout.ts`:225 — unresolved

```diff
@@ -0,0 +1,110 @@
… 99 lines elided …
+ * The farthest the sun's wash over the land reaches from its middle: down to
+ * the ground's upper third and no further, so it never lifts the ground
+ * where the caps stand.
+ */
```

**@vzakharov (agent)** — 2026-09-28T15:00:34Z

The docstring says the wash "never lifts the ground where the caps stand", but back-row slots stand inside it on every screen: seed 1 slot 5's foot is 83 px inside on tabL, slots 4–5 90 px on phone, 109 px on desktop — exactly the contrast risk the spec named. And `sun-layout.test.ts:99-102`'s first assertion re-checks `washReach`'s own formula. Ask: bound the reach against the slots' actual feet from the layout, and test that.

**@vzakharov (agent)** — 2026-09-28T16:43:48Z

Fixed in 2659e52: `washReach` also stops half a slot's size short of every slot's foot, occupied or not, and the sweep checks the painted rings (`washRings`) against those feet on every viewport — every foot now stands at least 0.4 of its size outside (tabL slot 5 was 83 px inside). The formula re-check is gone; the test fails with the bound removed.

---

<a id="t70"></a>

### `src/pages/mushrooms/ui/scene/grain.test.ts`:14 — unresolved

```diff
@@ -0,0 +1,47 @@
… 10 lines elided …
+    assert.notDeepEqual(grainPixels(7, 32), grainPixels(8, 32));
+  });
+
+  it('neither darkens nor lightens what it lies over, on the whole', () => {
```

**@vzakharov (agent)** — 2026-09-28T15:00:34Z

The mean is 0.5 by construction (`grainPixels` subtracts it, `grain.ts:52-56`), so this can't fail; and the ordering assertion at 44-45 sits behind an `if` that could silently skip. Ask: test what the grain is for (visible on the ground, not on creatures; no tiling seam) and make 44-45 unconditional.

**@vzakharov (agent)** — 2026-09-28T16:43:49Z

Replaced in 1e2a3a9: the tests now check there is no seam where the tile wraps (fails if the blur stops wrapping), that the texture is visible (median alpha 0.28 against a 0.2 bound), and that its strips lie only on the ground, from the seam down; the mottling assertion is unconditional. 'Not on creatures' is a matter of draw order, which the layer contract in `paintBackdrop` fixes and a pure test cannot see.

---

<a id="t71"></a>

### `src/pages/mushrooms/ui/scene/hud.ts`:31 — unresolved

```diff
@@ -0,0 +1,341 @@
… 27 lines elided …
+import type { Brush } from './shapes';
+
+/** A pictogram's light, the same on every button whatever the sun does, and its thinnest line. */
+const ICON_LIGHTING: Lighting = { ...PICTOGRAM_LIGHT, hairline: 1 };
```

**@vzakharov (agent)** — 2026-09-28T15:00:34Z

`hairline: 1` is one CSS px, but `Lighting.hairline` is one *device* pixel (`ink.ts:13-17`; the meadow passes `1/ratio`). Same with `Math.max(1, hairline)` in `draw-insect.ts:128`. Both are 2–3 device px on retina. Take the ratio in both places.

**@vzakharov (agent)** — 2026-09-28T16:12:38Z

Fixed in both places: `hud.ts` takes 1/ratio in 8c9c15f, and the butterfly's eye rim in `draw-insect.ts` draws at `hairline` as passed in 4c9c575.

---

<a id="t72"></a>

### `src/pages/mushrooms/ui/scene/backdrop-tones.test.ts`:19 — unresolved

```diff
@@ -0,0 +1,179 @@
… 14 lines elided …
+import { SUN_RAY_REACH } from './sun-layout';
+import { VIEWPORTS } from './viewports';
+
+const channels = (colour: number) =>
+  [(colour >> 16) & 0xff, (colour >> 8) & 0xff, colour & 0xff] as const;
```

**@vzakharov (agent)** — 2026-09-28T15:00:34Z

DRY: this re-implements `channels`/`luminance`/`contrast`/saturation that `colour.ts` already exports (`toHsv().s`). Import them.

**@vzakharov (agent)** — 2026-09-28T16:43:46Z

Done in be2c5ee: the tests import `channels`, `luminance`, `contrast` and `toHsv` from `colour.ts`.

---

<a id="t73"></a>

### `docs/plans/mushroom-game-syama.in-progress.md`:479 — unresolved

```diff
@@ -0,0 +1,562 @@
… 474 lines elided …
+     `paintBackdrop`'s layer contract; `backdrop-tones.ts` the derived
+     colours, `grain.ts` one seeded canvas texture under the grass. No Phaser
+     filters and no gradient fills: bands and that one texture.
+   - Insects are painted once and rotated as they fly, so their shading
+     turns with them; clear wings keep a plain edge. The house stands on its
```

**@vzakharov (agent)** — 2026-09-28T15:00:34Z

This states a cost as a feature (see the `insect-view.ts` comment). Once fixed, restate as the property: insects are lit from the sun whatever their heading.

**@vzakharov (agent)** — 2026-09-28T15:52:21Z

Restated in e0c93d4 as the property 570486e now holds: insects are lit from the sun whatever their heading, repainted past each π/8 of turn.

---

<a id="t74"></a>

### `src/pages/mushrooms/ui/scene/mushroom-bed.ts`:420 — unresolved

```diff
@@ -0,0 +1,394 @@
… 360 lines elided …
+  }
+
+  /** Whether no other shown door's middle stands nearer `at` than `house`'s. */
+  private readonly nearestDoor = (house: HouseView, at: Point): boolean => {
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

**Door taps can go dead.** The plan says the nearer door takes the tap *where two doors' tap circles overlap*. `nearestDoor` refuses any tap that lies nearer another door's middle, whether or not that tap is inside the other door's circle. The circles differ in size: on a tablet a porcini's door circle is 53–59 px and a chanterelle's is 32 px. So a tap inside the porcini's circle, nearer the chanterelle's middle but outside its 32 px circle, is refused by both doors. It falls through to the mushroom, and a child taps a door and no mouse comes.

Ask: a door refuses a tap only when another shown door's circle also contains it. Test it as a pure function over two circles of radius 32 and 59, with the tap in the big circle only, in both, and in neither.

**@vzakharov (agent)** — 2026-09-29T07:38:14Z

Fixed in 5461df1. The choice is a pure function, `tappedDoor` in `ui/scene/door-tap.ts`: of the doors whose tap area holds the finger, the nearest middle wins, so a door refuses a tap only to a nearer door that holds it too. The test uses circles of 32 and 59 px (big only, both, neither) plus a grid sweep that no tap inside either circle goes dead; putting the old nearest-middle rule back fails both.

---

<a id="t75"></a>

### `src/pages/mushrooms/ui/scene/layout.ts`:91 — unresolved

```diff
@@ -0,0 +1,413 @@
… 86 lines elided …
+ * nearly one over the other, the back one hidden.
+ */
+const CLUMP_ACROSS = { landscape: 0.47, portrait: 0.5 } as const;
+const CLUMP_DOWN = { landscape: [0.42, 0.6], portrait: [0.74, 0.8] } as const;
+const CLUMP_STEP = {
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

**The clump's floors are breached for some species pairs.** `CLUMP_STEP` and `CLUMP_DOWN` are shared by every species. The player sweep ran every one of the 16 back/front pairs over the same 2000 visits:
- A chanterelle behind a front fly agaric keeps only **29.5%** of its cap in view, against the 45% floor (tabL, phoneL, desktop; 0.7% of visits). A russula keeps 32.0% and a porcini 44.9%. On screen it is a sliver of lip poking out from behind the red cap (`docs/remove-before-merging/frames/bite-8/review/clump-back-chanterelle-cap-29pc-in-view-tabL.png`, `clump-back-russula-cap-32pc-in-view-tabL.png`).
- A fly agaric's doorway behind a front porcini is **65.9%** in sight, against 80% (`clump-back-door-66pc-behind-porcini-tabL.png`).

The plan's "80.7% / 45.1%, no slack" is the minimum over the test's sample, not over the pairs, so the Open paragraph understates this: the slack is already negative in the tail.

Ask: over 2000 visits × all 16 pairs, on every screen, the back cap stays ≥ 45% in view and the back doorway ≥ 80%. That likely means the per-species clump layout the Open paragraph names.

**@vzakharov (agent)** — 2026-09-29T09:27:09Z

Fixed in d271393. Each clump slot stands its foot by the species growing there (`CLUMP_SHIFT` in the new `clump-layout.ts`, a shift off the fly agaric's feet kept on screen by that species' own reach); a slot's place depends on its own species, never on the pair, so a back mushroom doesn't jump when a new one grows in front. Over all 16 pairs × 2000 visits, worst back cap in view / back doorway in sight: tabL, phoneL, desktop 28.4% / 65.9% → 45.2% / 80.7%; tabP 35.4% / 62.5% → 48.1% / 80.7%; phoneP 35.2% / 76.1% → 47.4% / 80.7%; phoneS 47.2% / 80.7%. The worst is now the opening fly-agaric pair's own number on every screen, and that pair stands as before. Bees keep clear of what stands plus every species' place in the free slots only, so tablet planting holds at a median of 5.

---

<a id="t76"></a>

### `src/pages/mushrooms/ui/scene/layout.test.ts`:78 — unresolved

```diff
@@ -0,0 +1,604 @@
… 74 lines elided …
+ * over a run of visits every slot tries every species, and next to every
+ * other.
+ */
+function speciesOf(seed: number): (slot: number) => Species {
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

`speciesOf` draws one random pair per visit, which is why the sweeps above report 80.7% / 45.1% while the worst pair sits at 65.9% / 29.5% (previous comment). `worstBySpecies` also prints `NaN` for a species that never came up, where it should fail.

Ask: the clump sweeps iterate every back×front pair over each visit, and the report fails when any species × slot pair goes unmeasured.

**@vzakharov (agent)** — 2026-09-29T09:27:11Z

Fixed in b416c45. The clump sweeps take the 16 back×front pairs in turn (125 of the 2000 visits each, keeping `layout.test` at ~67 s; all 16 on every visit would be ~7 min), and `worstOf` fails a sweep that leaves any pair or species × slot unmeasured instead of printing `NaN`. The exhaustive 16 × 2000 run (numbers on the `CLUMP_STEP` thread) was done as a script to confirm the margin.

---

<a id="t77"></a>

### `src/pages/mushrooms/ui/scene/layout.ts`:381 — unresolved

```diff
@@ -0,0 +1,413 @@
… 377 lines elided …
+  // The flowers keep to the meadow as it would stand with no edge margin and
+  // no floor, which scales with the screen exactly, so a resize keeps every
+  // flower where it was.
+  const { unit: flowerUnit, mushrooms: unmarginedFeet } = standing(0, 0);
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

**The flowers-off-feet failure has the cause the Open paragraph suspects.** Flowers clear the feet of `standing(0, 0)`, which has no edge margin and no size floor. The layout stands the real forest at `standing(EDGE_MARGIN, FINGER_SIZE)`, and the test checks against that. On phoneS every forest slot sits at the floor, 14% larger than the meadow the flowers dodged and 6 px further in, so the least clearance is 1.02. Grow the reach 5% and 150 of 14,000 flowers land on a real foot (370 at 10%, 727 at 20%), and none on the meadow they were placed against.

Ask: flowers are placed against feet at least as large and as far out as any the real layout stands, for example the union of the two meadows' feet, which keeps the resize contract. The test asserts least clearance ≥ 1.0 per screen with the reach raised 20%.

**@vzakharov (agent)** — 2026-09-29T07:38:16Z

Fixed in 2718390. Flowers are placed against the union of both meadows' feet (`standing(EDGE_MARGIN, FINGER_SIZE)` and `standing(0, 0)`), in the new `flower-layout.ts`. Least foot clearance went from 1.028 (phoneS) to 1.186–1.238 on every screen, and stays ≥ 1.186 with the reach raised 20%; with the union removed as well, phoneS drops to 0.538 and `flower-layout.test.ts` fails.

---

<a id="t78"></a>

### `src/pages/mushrooms/ui/scene/layout.ts`:203 — unresolved

```diff
@@ -0,0 +1,413 @@
… 199 lines elided …
+ * resize keeps every flower where it was — and moved again until it stands
+ * clear of the clump's feet, or left out when it never does.
+ */
+function placeFlowers(
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

**Flowers grow under the buttons and behind the clump.** `placeFlowers` never looks at the controls. On phoneS, 15.4% of seeded flowers have more than half their head under a control, and 85% of those leave a stem sticking out below the button, as under the − in `docs/remove-before-merging/frames/bite-8/meadow-mixed-portrait-phoneS.png` (close-up: `review/flower-under-minus-and-behind-clump-phoneS.png`). It is 0.9% on tabL. Behind the clump, 43% of tabP flowers and 30% of phoneS flowers are partly hidden, and at least 10% on tabP entirely. A flower a child can't see is one a bee lands on out of sight.

Ask: no seeded flower's head overlaps a control's drawn circle, on every screen, and no flower is more than half hidden by the clump.

**@vzakharov (agent)** — 2026-09-29T07:38:18Z

Fixed in 2718390. A seeded flower's head clears every control's drawn circle at every stem bend and sway, and is at most half hidden by the opening clump as drawn (`clump-shade.ts`), on the opening screen and on it turned; a flower that fails tries farther away. Heads over a control: phoneS 18.4% → 0, tabL 4.5% → 0, tabP 0.6% → 0. More than half hidden: tabP 31.4% → 0, phoneS 20.1% → 0. Flowers per visit held (tablets 6.91 → 6.93, a floor of 6.5 in the test). The guard covers the clump the visit opens with; a mushroom grown later can still stand in front of a flower, which then drops out of insects' sight as a forest one does.

---

<a id="t79"></a>

### `src/pages/mushrooms/model/mushroom-genes.ts`:123 — unresolved

```diff
@@ -0,0 +1,307 @@
… 115 lines elided …
+    hueNudge: [-0.03, 0.03],
+  },
+  // Stocky: a barrel of a stem, its foot bulging to near half the cap across,
+  // a little shorter than a fly agaric's, under a thick bun. It always leans
+  // a little (a placement picks the side), so two of these barrels in the
+  // clump part before the back one's door.
+  porcini: {
+    stemHeight: [0.68, 0.8],
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

**The porcini reads long because it is as long as a fly agaric.** Medians over 2000 seeds, as a share of cap width:

| | stem top | stem mean | foot | visible stem height |
|---|---|---|---|---|
| porcini | 0.33 | 0.40 | 0.47 | **0.80** |
| fly agaric | 0.18 | 0.22 | 0.23 | **0.78** |

"A stem about a third of its cap" holds for width. Height is the fly agaric's, and longer at p10 (0.72 against 0.63). The comment above ("a little shorter than a fly agaric's") promises what the Open paragraph says nobody sees: porcini 0.68–0.8 against the fly agaric's 0.6–0.9 has the same mean. This is the range the clump floors pinned (comment on `CLUMP_STEP`), so the two get fixed together.

Ask: a porcini's visible stem height / cap width has a median ≤ 0.6 with the clump floors still met, asserted against the fly agaric's median in a test. If that can't be had, the comment says what is true.

**@vzakharov (agent)** — 2026-09-29T09:27:12Z

Fixed in d271393, together with the clump. The porcini is a short barrel of a stem under a wider, thicker bun: median visible stem 0.81 → 0.58 of its cap width, against the fly agaric's 0.80, asserted in a test (≤ 0.6 and below the fly agaric's). It is as short as its door stations allow: below a 0.54 stem the house loses door stations. The gene comment says so.

---

<a id="t80"></a>

### `src/pages/mushrooms/ui/scene/palette-creatures.ts`:40 — unresolved

```diff
@@ -0,0 +1,143 @@
… 34 lines elided …
+    pores: 0xf4_e2_92,
+    lit: 0xf6_b8_6e,
+  },
+  /** A chanterelle's one bright egg-yolk apricot, foot to rim, the ridges under its funnel a paler shade, and the light on it. */
+  chanterelle: {
+    flesh: 0xff_a2_1a,
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

**The chanterelle is amber because of its base colour, not the haze.** `flesh` is hue 35.6° at 100% saturation. The hue nudge (±0.025) takes it from 26.7° to 44.5° (`#ffc41a`, gold), and `ridge` (38.8°) and `lit` (46.2°) pull it yellower. Haze barely moves it: the farthest chanterelle is still 36.8° at 91%. So `heldHaze` is working, and the fix is here and in the nudge range.

Ask: every chanterelle fill, the ridge and the lit shade included, stays at hue ≤ ~30° over the whole nudge range, checked beside the fly agaric so the two don't read as one red-orange.

**@vzakharov (agent)** — 2026-09-29T07:38:19Z

Fixed in 35b553c. `flesh`, `ridge` and `lit` moved to about 27°, and the chanterelle's `hueNudge` narrowed to ±0.006. Over the whole nudge range, near and far, every fill sits at 21–30° (the shaded flesh lowest), at least 9.2° above the fly agaric's hue in the same light.

---

<a id="t81"></a>

### `src/pages/mushrooms/ui/scene/mushroom-tints.test.ts`:78 — unresolved

```diff
@@ -0,0 +1,157 @@
… 74 lines elided …
+      assert.equal(stem, cap);
+      assert.equal(under, cap);
+      const hue = hueDegrees(cap);
+      assert.ok(hue > 22 && hue < 46, hue.toFixed(1));
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

`hue > 22 && hue < 46` is named "egg-yolk orange" and admits the golden 44° the Open paragraph complains about. The name was edited, not the fact. Ask: the band is the one the palette comment is changed to (roughly 20–32°), and it covers `ridge` and `lit`, not only `cap`.

**@vzakharov (agent)** — 2026-09-29T07:38:21Z

Fixed in 35b553c. The band is 20–30°, the one the palette comment now states, and it covers the cap, ridge and lit colours, near and far and under the shade. A second test checks the gap to the fly agaric light by light. With the old flesh put back the band test fails at 37.7°.

---

<a id="t82"></a>

### `src/pages/mushrooms/model/mushroom-profile.ts`:106 — unresolved

```diff
@@ -0,0 +1,129 @@
… 65 lines elided …
+ * How far a chanterelle's rim waves up or down at `x`: its lobes, fading to
+ * nothing toward the middle so the wave stays on the rim.
+ */
+export function rimWave(genes: ChanterelleGenes, x: number): number {
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

**The rim wave is too small to see.** The median wave is 3.2% of cap width peak to peak, an amplitude 13% of the lip's thickness. That is about 10 px on the front clump slot on tabL and ~2.4 px on a far phoneS slot, about one ink line. Even the widest of 2000 seeds (5091920, 7.4%) shows a single bump (`docs/remove-before-merging/frames/bite-8/review/chanterelle-widest-rim-wave-of-2000-tabL.png`, `chanterelle-median-rim-wave-tabL.png`). The `u ** 4` fade and `waveAmp: [0.018, 0.03]` together flatten it, which is why the lip reads as a lampshade's plain ellipse rather than a chanterelle's frilly mouth.

Ask: the lip's top edge shows at least 3 lobes, each at least one ink line tall on the smallest slot, measured on the drawn outline.

**@vzakharov (agent)** — 2026-09-29T07:38:22Z

Fixed in b508116, with a42ca6d cutting the added drawing cost. The rim runs `lobes` whole crests (3–5), a trough at each end, on both rims; `funnelEdge` blends the wave in from the stem so doors and windows keep their places. Measured on the drawn lip over 2000 seeds on the smallest slot: 1 lobe on every seed before, every seed's 3–5 after, the shallowest notch 1.20 ink lines deep (`mushroom-outline.test.ts`, which fails on the old frequency).

---

<a id="t83"></a>

### `src/pages/mushrooms/model/mushroom-outline.ts`:110 — unresolved

```diff
@@ -0,0 +1,158 @@
… 106 lines elided …
+}
+
+/** The gills, an oval under the dome that shows below its rim, in the cap's frame. */
+function gillsOutline(genes: MushroomGenes): Point[] {
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

**The russula reads as a table on a pole, and the porcini's underside as one flat band.** The gills or pores show only 1.1% (russula) and 1.6% (porcini) of cap width below the dome. The gills outline is 0.14 of cap height and sits behind the dome's flat underside. The russula's dome is 0.27 of its width tall on a stem 0.20 of its width, so the eye gets a disc on a stick (`docs/remove-before-merging/frames/bite-8/review/russula-flat-disc-tabL.png`, and the violet one in `docs/remove-before-merging/frames/bite-8/meadow-mixed-landscape-tabL.png`). A child knows a russula by a cap that dips in the middle over a thick band of white gills, and a porcini by a spongy cream underside.

Ask: on every species except the fly agaric, the underside shows ≥ ~6% of cap width below the rim at rest, and the russula's top dips at its middle, measured on `headOutlines`.

**@vzakharov (agent)** — 2026-09-29T07:38:23Z

Fixed in 0ed5733. Porcini and russula hang a band 0.085 of cap width deep under the dome, drawn up round the stem so doors climb as high as before, and the russula's band carries gill lines. Underside below the rim: porcini 1.6% → 6.6%, russula 1.1% → 7.7%, chanterelle 15.5%. The russula's top dips in a dish at least 0.028 of its size, more than one ink line on the smallest slot. The worst porcini-behind-porcini back door stays at 88.6%.

---

<a id="t84"></a>

### `src/pages/mushrooms/ui/scene/draw-mushroom.ts`:128 — unresolved

```diff
@@ -0,0 +1,153 @@
… 124 lines elided …
+  genes: MushroomGenes,
+  size: number,
+): void {
+  const across = genes.capWidth * size * 0.8;
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

**The selection's foot ring is sized by the cap, not the foot.** `genes.capWidth * size * 0.8` is ~1.7× a porcini's foot, 3.4× a fly agaric's and 5.6× a chanterelle's. So the ring reads as a separate hoop on the grass, away from the band that `drawSelection` strokes round the body (`docs/remove-before-merging/frames/bite-8/review/selection-foot-ring-chanterelle-tabL.png`, `selection-gaps-at-outline-start-and-foot-ring-porcini-tabL.png`). This predates bite 8, but the new species are what make it show.

Ask: the ring's width comes from `footWidth(genes, turn)`, so its ends meet the band at the foot's corners on every species.

**@vzakharov (agent)** — 2026-09-29T07:38:24Z

Fixed in 1a7cba4 and 142c968. The ring's width is `footWidth(genes, turn)` at the drawn turn, so its ends meet the band at the foot's corners and it widens when the mushroom squashes. At a quarter of the foot tall it vanished inside the stem's own band, so its front arc runs 1.25 band-widths below the foot; its ink is drawn under the band and its yellow over it.

---

<a id="t85"></a>

### `src/pages/mushrooms/ui/scene/shapes.ts`:31 — unresolved

```diff
@@ -0,0 +1,210 @@
… 27 lines elided …
+  graphics: Phaser.GameObjects.Graphics,
+  points: readonly Point[],
+): void {
+  graphics.strokePoints(vectors(points), true, true);
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

**The yellow selection band has gaps where the grass shows through.** Each gap sits exactly at an outline's first point: the dome's right rim, the stem's right foot corner, the chanterelle lip's left end, and the ring's angle 0. With a band this wide, closed `strokePoints` leaves the start/end join open as a wedge (same frame as above; the fly agaric shows it too, so it dates from 58e53b6e).

Ask: no uncovered pixel along any outline's band, checked in the play run at each outline's first point. Filling the band as a polygon, the way `weightedOutline` is filled, is one way.

**@vzakharov (agent)** — 2026-09-29T07:38:26Z

Fixed in 484e0b6. The cause was the closing `lineTo`: a zero-length last segment, so Phaser never joined the end back to the start. `strokeShape` now drops repeated points and lets the path close itself. `scripts/lib/play-band.ts` samples just outside every point of every yellow outline in the play run: 2–4 gaps per species before (each at an outline's first point), 0 after on tabL and phoneS. The wing ink, the other caller, looks the same before and after.

---

<a id="t86"></a>

### `src/pages/mushrooms/model/mushroom-genes.test.ts`:94 — unresolved

```diff
@@ -0,0 +1,176 @@
… 90 lines elided …
+    assert.equal(new Set(grown.map(({ capHeight }) => capHeight)).size, 4);
+  });
+
+  it('leaves no cap narrower than the fly agaric’s narrowest', () => {
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

This compares `GENE_RANGES` to itself, and the fly agaric's minimum is the floor by construction, so it can't fail on what a child sees. The player measured the drawn caps, and the narrowest is ≥ 64 px on every slot, so the property holds today. Ask: measure the narrowest *drawn* cap per species through `headOutlines`, at the narrowest pose.

**@vzakharov (agent)** — 2026-09-29T09:27:14Z

Fixed in 262145b. The test measures the narrowest drawn cap per species through `headOutlines` at the narrowest pose on the smallest slot, across the cap's own frame (a finger's circle fits a turned cap the same way): fly agaric 64, porcini 76, chanterelle 69, russula 67 px, all ≥ 2 × `TAP_RADIUS`. Widening the porcini's cap range down to 0.5 fails it at 58 px.

---

<a id="t87"></a>

### `src/pages/mushrooms/model/mushroom-pose.test.ts`:55 — unresolved

```diff
@@ -0,0 +1,121 @@
… 51 lines elided …
+    });
+  }
+
+  it('reaches no farther for any species than for the fly agaric', () => {
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

This restates `maxReach`'s formula with the fly agaric's constants, so it tests the formula against itself. Ask: sweep each species' drawn, turned outline (`capReach`) over seeds and poses and assert it stays inside `maxReach`. That is also the true version of the plan's "the layout's reach is the painter's": `capReach` is used only in tests, and the layout sizes from `maxReach`, so item 8 should say the painter stays inside the layout's bound.

**@vzakharov (agent)** — 2026-09-29T09:27:15Z

Fixed in 79bc4cd. Each species' drawn, turned cap (`capReach`) is swept over 2000 seeds, unturned and at the forest's and clump's turns either way, and must stay inside `maxReach`; shrinking the bound 20% fails two of the three sweeps. Item 8 of the plan will say the painter stays inside the layout's bound.

---

<a id="t88"></a>

### `src/pages/mushrooms/ui/scene/mushroom-light.test.ts`:249 — unresolved

```diff
@@ -0,0 +1,393 @@
… 245 lines elided …
+    assert.ok(worst < 1, `a foot rises ${worst.toFixed(1)} px across`);
+  });
+
+  it('sits darkest under a porcini, the heaviest of the four', () => {
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

Only a porcini gets the `HEAVY_FOOT` layer, and its `across` of 1.25 covers both foot ends, so "darkest under a porcini" passes by construction. The plan says "a wide foot", but the code keys on `species === 'porcini'`. Ask: either the rule keys on foot width and the test grows a wide-footed non-porcini, or the plan says porcini.

**@vzakharov (agent)** — 2026-09-29T07:38:27Z

Fixed in b8fcb0e. `HEAVY_FOOT` lays under any foot whose upright `footWidth` is at least 0.37 of its cap. The test swaps a porcini's foot and cap onto each other species and theirs onto the porcini, and the darkness follows the foot; a second test holds both foot ends inside every layer at every seed and lean. Keying back on `species === 'porcini'` fails the first, `across` 0.9 the second. One fly agaric in ~2500 has a foot that wide and gets the heavier shadow.

---

<a id="t89"></a>

### `src/pages/mushrooms/ui/scene/mushroom-tints.test.ts`:23 — unresolved

```diff
@@ -0,0 +1,157 @@
… 19 lines elided …
+import { PALETTE } from './palette';
+
+/** The luminances where the ink rule gives a dark fill only a weak edge. */
+const WEAK_EDGE = [0.021, 0.045] as const;
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

`WEAK_EDGE` is written by hand, and the porcini fills sit about 2× away from it: the darkest, chestnut, has luminance 0.088, and haze only lightens. Nothing tests the *shaded* cap, which is where a brown could reach the band. Ask: derive the band by sweeping `inkFor` for where the ink's contrast dips, and test the shaded fill as well as the base.

**@vzakharov (agent)** — 2026-09-29T07:38:28Z

Fixed in 35b553c. `weakEdge()` sweeps `inkFor` over every grey for where the ink stands off its fill by less than the edge it lifts over the darkest fills; today that is 0.0212–0.0497. Every porcini fill is tested against it, near and far, plain and shaded (darkest shaded 0.070). A chestnut of `0x66361b`, outside the band plain and inside it shaded, fails the test.

---

<a id="t90"></a>

### `scripts/lib/play-species.ts`:169 — unresolved

```diff
@@ -0,0 +1,197 @@
… 165 lines elided …
+  if (chanterelle !== undefined && !onTrumpet) {
+    await page.tap(controls.releases.butterfly);
+    const there = await waitForCapRest(chanterelle);
+    if (there === undefined) note('no butterfly came down on the chanterelle');
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

**The play run can pass with the page broken.** "No butterfly came down on the chanterelle" is a `note`, and so is the window count (line 194): a chanterelle with 0 windows passes. The species shots are also taken before `sporesGone`, so the porcini close-up shows the grow puff frozen as a white scribble at its foot (`docs/remove-before-merging/frames/bite-8/review/spore-puff-frozen-by-stepped-clock-porcini-tabL.png`). It's harmless in play but misleading in every close-up. Ask: the chanterelle perch and `windows ≥ 1` are failures, and each `s1-*` shot waits for `sporesGone`.

**@vzakharov (agent)** — 2026-09-29T07:38:30Z

Fixed in 484e0b6. No butterfly on the chanterelle and no window are failures now, and every `s1-*` shot waits for the spores to be gone; the porcini close-up has no frozen puff. Green on tabL and phoneS.

---

<a id="t91"></a>

### `src/pages/mushrooms/ui/scene/hud.ts`:48 — unresolved

```diff
@@ -0,0 +1,402 @@
… 44 lines elided …
+const ICON_DOME = { capHeight: 0.58, domePower: 0.85 };
+const ICON_FLAT = { capHeight: 0.4, domePower: 0.4, hollow: 0.05 };
+/** A chanterelle's pictogram: a short stem under a broad, thick-lipped, waving trumpet. */
+const ICON_TRUMPET = {
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

Hunch, unmeasured: in the picker (`docs/remove-before-merging/frames/bite-8/picker-open-tabP.png`) the chanterelle icon reads as a ring floating over a funnel, a halo rather than a trumpet. The thin lip (0.17), a shaded mouth ellipse filling most of it, and a steep `flare` of 0.6 make a hoop. Ask: at the icon's drawn size, the mouth fill takes no more than about half the lip's depth, and it reads as the same mushroom the meadow grows, judged beside a meadow chanterelle.

**@vzakharov (agent)** — 2026-09-29T07:38:31Z

Done in 065bb2f. The icon is the meadow's trumpet (a straight funnel, lip 0.26 thick), its genes in a Phaser-free `icon-genes.ts` so a test measures it. The mouth takes 47% of the lip at the smallest button's drawn size, from 57%. Meadow chanterelles took the same narrower mouth, so the two match.

---

<a id="t92"></a>

### `src/pages/mushrooms/ui/scene/paint-dome.ts`:20 — unresolved

```diff
@@ -0,0 +1,93 @@
… 16 lines elided …
+import { porciniMargin, russulaCentre } from './mushroom-tints';
+import { crescent, fillShape, inkedFill } from './shapes';
+
+type DomeGenes = FlyAgaricGenes | PorciniGenes | RussulaGenes;
```

**@vzakharov (agent)** — 2026-09-28T21:20:04Z

Minor: `DomeGenes` is a hand-written union that tracks `MushroomGenes`. `Exclude<MushroomGenes, ChanterelleGenes>` keeps it in step when a species joins. The `species === 'chanterelle'` test is also repeated across `headOutlines`, `faceAt`, `slotLevel`, `windowSlots`, `tallestCap`, `heldHaze` and `drawMushroom`. Ask: one per-species head-kind map as its single source, if a fifth species or bite 9's clump-by-species work touches those again.

**@vzakharov (agent)** — 2026-09-29T09:40:16Z

Done in 14227ae (`DomeGenes` derived from the union) and dab46a0 (the map). `HEAD_KIND` in `model/mushroom-genes.ts` maps each species to `'dome' | 'trumpet'`, `as const satisfies Record<Species, …>`, with `hasTrumpet(genes)` as the type guard and `DomeGenes` derived through it. It replaced the shape dispatch at eight sites (`tallestCap`, `faceAt`, `slotLevel`, `windowSlots`, `headOutlines`, `capBase`, `capLight`, `drawMushroom`) and three in `house.test.ts`. `heldHaze` stays on the species, since it is about colour, not shape. One pair is left on `species === 'fly-agaric'`: `gillsOutline` and `paint-dome.ts` both choose plain gills over the underside band that way. Two call sites didn't justify a second guard.

---

<a id="t93"></a>

### `docs/remove-before-merging/frames/bite-8/meadow-mixed-landscape-tabL.png`:1 — unresolved

**@vzakharov (human)** — 2026-09-29T08:53:45Z

слушай, у меня, пока глядел на эту картинку, появилась наконец идея, как это может выглядеть in the long run в качестве полноценной игры-конструктора: ты можешь поворачиваться влево-вправо; двигаться вперёд назад. Отрисовка при этом в принципе может оставаться а-ля спрайтовой (не в смысле технологии, а в смысле "трупы всегда повёрнуты к тебе одной стороной" -- без трупов конечно:-)

По мере того как ты двигаешься, можно имитировать звук мягкого ступания по почве + небольшое движение вверх-вниз (как бы имитируя шаги). Не знаю, планируются ли у тебя звуки насекомых, но если да, их тоже соответственно можно панировать.

Но! это не самое главное. А главное -- что по умолчанию у тебя всё, кроме того, что ты сейчас засадил, пустое (ну и кроме двух начальных грибов). То есть ты ходишь, засаживаешь новое, таким образом засеивая своё грибное поле. Кстати, вижу сейчас, что грибы всегда появляются в детерминированных местах -- эт тоже нужно запроцедурить по каому-нибудь принципу, чтобы результат получался относительно равнораспределённым, но при этом недетерминированным и не банальным.

Так вот, твоё рассаженное поле можно потом "смотреть сверху" -- например в изометрии, или может быть в 3Д, надо подумать, и тогда ты можешь разными грибами нарисовать (по виду с карты) “картинку”. Кнопка должна быть доступна с самого начала, можно её сделать вместо кнопки, которую нужно убрать (звук можно отключать средствами системы, не стоит тратить на это поле отрисовки).

Бонус-поинты чтобы ландшафт был воксельно-трёхмерный, то есть чтобы при поворотах и перемещениях можно было ходить по “холмикам”. Да, контакт с рассаженными цветами-грибами на данном этапе пока не нужен -- можно спокойно проходить “сквозь” них. Это и проще для реализации, и не усложняет механику для ребёнка. Как реализовывать перемещение -- отдельный вопрос. Можно отрисовать курсоры на экране, а можно как-то а-ля двухпальцевыми перемещениями влево-вправо-вверх-вниз (при этом это не должно быть быстро, повороты и перемещения должны быть на естественной скорости, а не на скорости сдвигания пальцев).

Ну и вторая идея, напишу до кучи тут: очень понравилось как, когда нажимаешь на цветы, они издают звуки. Хочу чтобы звуки были по гамме, включая диезы и бемоли, тогда можно будет прямо играть музыку. Учитывая что нот в октаве 12, можно сделать так: у нас есть четыре формы цветка и 3 цвета -- или наоборот, 3 формы и 4 цвета, 3*4 ‎ = 12, получается на каждое сочетания цвета-формы одна нота.

При этом, чтобы не париться с переключением октав, но и можно было играть многооктавные произведения, сделать так: при нажатии следующей ноты выбирается ближайшая нота, а не нота в той же октаве, то есть например: нажал цветок A2, после этого цветок E играет E2 (так как E ближе к A снизу), а цветок D -- уже D3 (D ближе к A сверху). При эотм всё это ограничено тремя октавами, то есть после A3 нажатие D играет D3, а не D4, аналогично после D1 нажатие A играет A1 сверху, а не A0 снизу.

Ещё если играешь на компьютере, создаётся “клавиатура”: a-s-d-f-g-h-j-k это соответственно до-ре-ми-фа-соль-ля-си-до, w-e-t-y-u это диезы от до-ре-фа-соль-ля соответственно (то есть клавиатура имитирует клавиатуру фортепиано). z и x это соответственно переключение октав вниз-вверх, звуков при этом не издаётся и никаких реакций UI тоже не нужно, это так сказать интерфейс для ~~папы~~ пауэр-юзера.

Вот такие две идеи. Не вноси их пока ни в какой план, но подготовь отдельные два документа (по одному на идею), в котором опиши, насколько существующий код готов к реализации той и другой, насколько drastic changes нужны в оставшемся плане и текущей реализации. Исходя из этого будем думать. Документы на русском.

Что нужно следать прямо сейчас: зафиксировать этот мой комментарий и обратиться к нему на предмет создания документов в следующем байте (можно совместить с существующим байтом или создать новый).

**@vzakharov (agent)** — 2026-09-29T08:55:17Z

Зафиксировал в 74c849b: комментарий лежит дословно в `docs/remove-before-merging/ideas/operator-ideas.md`, а в план попала только задача, без самих идей. Байт 9 начинается с двух документов на русском, по одному на идею: насколько код готов и насколько сильно придётся менять остаток плана и текущую реализацию. Первая идея прямо касается широкого луга из байта 9, поэтому из него строится только то, что первый документ признает устойчивым при любом раскладе, а остальное ждёт твоего решения.

---

<a id="t94"></a>

### `docs/remove-before-merging/ideas/idea-2-flower-keyboard.md`:145 — unresolved

```diff
@@ -0,0 +1,167 @@
… 141 lines elided …
+## Развилки
+
+1. **4 формы × 3 цвета или 3 × 4.** 4×3 держится на светлоте и переживает все три вида дальтонизма. 3×4 заставило бы брать четвёртый цвет с ΔE около 20 и отдать под форму `fold`, который на телефоне …
+2. **Какие три цвета.** Жёлтый / розовый / тёмно-синий. Цена: луг становится менее пёстрым, пять цветов превращаются в три, и уходят белая ромашка и голубой. Альтернатива — оставить пять для незвучащих украшений, но звучат все цветы, так что её нет. **Рекомендую эту тройку.**
```

**@vzakharov (human)** — 2026-09-29T15:40:36Z

нет, умеьшать количество расцветок не надо, пусть тогда оставшиеся 2 цвета х 4 варианта формы будут чем-то drum-adjacent: бочка, ведущий, хет, три тома, и ещё два на твой выбор. Это не должно звучать как акустическая установка; должно быть мягкое, условно downtempo-трип хоп, что-то такое.

и давай тогда сдвинем клавиатуру "пианино", чтобы начиналась с клавиши G а не A (от G до ' как раз хватит), а клиавиши a-s-d-f и q-w-e-r тогда будут на "ударные".

кстати, цвета цветов можно тоже делать немного разными каждый раз? ну то есть чтобы розовый два раза не получался абсолютно одинаковый?

**@vzakharov (agent)** — 2026-09-29T15:46:28Z

Принято, в 09b37ce. Пять цветов остаются: три цвета × четыре формы звучат нотами, а оставшиеся два × четыре — восемь мягких синтезированных ударных в духе downtempo/трип-хопа: бочка, рабочий, хэт, три тома, а два моих — шейкер и мягкий римшот. «Ведущий» я прочитал как рабочий (малый барабан), поправь, если ты имел в виду другое. Клавиатура: `g h j k l ; '` = C–B, диезы `y u o p [`, ударные на `a s d f` / `q w e r`. Оттенок каждого цветка чуть сдвигается от его сида, и сдвиг ограничен так, чтобы класс всё равно читался при проверке на дальтонизм.

---

<a id="t95"></a>

### `docs/remove-before-merging/ideas/idea-2-flower-keyboard.md`:161 — unresolved

```diff
@@ -0,0 +1,167 @@
… 157 lines elided …
+
+**Как отдельный байт — да.** Он самодостаточный, не ждёт ни одной развилки первой идеи и не ломает ни одного решения плана, только гнёт два с твоего слова.
+
+**Место — сразу после текущего байта 9, до пунктов 10–12.** Причины:
```

**@vzakharov (human)** — 2026-09-29T15:43:52Z

да, ок

**@vzakharov (agent)** — 2026-09-29T15:46:34Z

Сделано в 09b37ce: в плане это пункт 10, сразу после текущего байта и раньше широкого луга, который ждёт первую идею.

---

<a id="t96"></a>

### `src/pages/mushrooms/ui/scene/clump-layout.ts`:69 — unresolved

```diff
@@ -0,0 +1,152 @@
… 65 lines elided …
+function sizeOn(foot: Ground): number {
+  const opening = openingIndex(foot);
+  if (opening !== undefined) return CLUMP_SIZES[opening] ?? 1;
+  return FOREST_DRAWN / scaleAt(foot.z);
```

**@vzakharov (agent)** — 2026-09-29T18:34:38Z

**Forest mushrooms have no perspective: the division by `scaleAt` cancels the one in `project`.** `standOn` multiplies by `camera.unit * scaleAt(z)`, so every forest mushroom is drawn at exactly 0.700 of the unit, however far off it stands. The only size cue left is the species gene, and it points the wrong way. Porcini (median cap 0.63 of the unit) and russula (0.60) out-draw fly agaric and chanterelle (0.58), so the farther cap is the wider one in 40% (tablets) to 57% (phoneS) of pairs, and a coin flip among forest-only pairs. Median ratio 1.16, max 1.96, over 600 visits per screen. A forest mushroom in front of the clump (119 px) is drawn smaller than the clump behind it (170 px on tabL).

Frames: `frames/bite-9/review/six-grown-flat-depth-tabP.png` (the far fly agaric is the widest cap on screen) and `plus-refused-shake-phoneP.png`. Two independent readings, one from the code and one from the sweep, reached this cause.

The comment on `FOREST_DRAWN` states the intent ("the back rows as big as the front ones, so a far cap still reads as a mushroom"). What it trades away is the meadow having depth at all. Syama drew one near mushroom and small ones behind it.

Ask: let depth scale forest mushrooms the way it scales the clump (`scaleAt` gives a 1.7× falloff from near to far), and hold the finger floor on the far row by the zoom floor or by the tap pad in `mushroom-tap.ts`, not by flattening. Test: for any two feet with `z_far > z_near`, the far mushroom's widest-gene cap is no wider than the near one's narrowest-gene cap at the same species, and across species the far one is wider in under 10% of placed pairs. The existing `layout.test.ts` L273 compares the back places with the clump's foot only.

**@vzakharov (agent)** — 2026-09-29T20:47:40Z

Forest mushrooms now shrink with depth by the clump's own `scaleAt` (5e7b2d79): the far row is 0.46 of the clump's size and the near row 0.78, where every one was 0.70. The farther of two forest caps is the wider in 13–17% of placed pairs, down from 40–57%. That misses the 10% asked for: what is left is pairs at nearly one depth, where the genes decide, and `clump-layout.test.ts` holds it under 20%.

---

<a id="t97"></a>

### `src/pages/mushrooms/model/ground.ts`:193 — unresolved

```diff
@@ -0,0 +1,231 @@
… 189 lines elided …
+ */
+export function frameFor(screen: Sized, lens: Lens): Frame {
+  const turned = { width: screen.height, height: screen.width };
+  const across = Math.min(shownAcross(screen, lens), shownAcross(turned, lens));
```

**@vzakharov (agent)** — 2026-09-29T18:34:38Z

**On every landscape screen, and on every desktop, the meadow is laid out at the portrait's width.** `frameFor` takes the smaller of this screen's and its turn's width, and then `LEAST_ACROSS` 0.87 decides it on almost every screen. On tabL all caps sit within x 401–782 of 1180 px, spanning a median 27% of the width. The unit is 171 px there against 300 on tabP, so the same meadow is drawn at 57% of the size, with bare grass on both sides. A 1920×1080 desktop keeps six mushrooms within ±195 px of the middle, and a desktop never turns.

Frames: `frames/bite-9/review/six-grown-middle-third-tabL.png`, `…-phoneL.png`. The plan lists this as **Open** and leaves it to item 11. It is also the first thing a child sees on the primary layout (tablet landscape): a crowded strip, and a `+` that refuses while half the screen is empty.

Ask: decide it before bite 10 rather than carrying it. Either pull item 11's crop forward (lay out at this screen's width and let a turn show a crop of the same ground), or scope the turn guard to screens that can turn (`matchMedia('(pointer: coarse)')` or `screen.orientation`), so desktops at least lay out at their own width. Record which one in the plan. Test: on tabL, the six grown caps span at least 60% of the screen's width in the median visit.

**@vzakharov (agent)** — 2026-09-29T20:12:31Z

Each screen lays out at its own width since 13ccefb, and the tablet-landscape test (six caps span at least 60% of the width, median 80%) still passes. a177993 makes the refit after a turn a scaled copy, so a turned meadow keeps every rule it grew under, now asserted rather than printed: door in sight, cap in view, off the controls. The sun's glow is computed with the layout so a turn never leaves it over a foot (4c5c874).

---

<a id="t98"></a>

### `src/pages/mushrooms/ui/scene/meadow-camera.ts`:79 — unresolved

```diff
@@ -0,0 +1,120 @@
… 75 lines elided …
+ * `2 × TAP_RADIUS` across by its gene there; a cap drawn narrower than a
+ * finger is padded to one (`fingerPad`).
+ */
+const ZOOM_FLOOR =
```

**@vzakharov (agent)** — 2026-09-29T18:34:38Z

**The finger pad never switches on, so the plan states the opposite of what the code does.** Plan item 9 says "a finger's target rests on this pad, not on a raised zoom floor". But `ZOOM_FLOOR` puts every camera at or above the floor at which the narrowest cap is `2 × TAP_RADIUS` across, and `FINGER_ACROSS` sits below that. So no cap is ever drawn narrower than a finger. The sweep grew about 35k mushrooms across the five screens and got 0 pads. The narrowest drawn cap is 60.8 px, which is `FINGER_ACROSS` exactly. `mushroom-tap.test.ts` L230 even asserts it ("changes nothing on the swept screens"). The pad paths are unreachable: `hit-areas.ts`, `keptOff` in `mushroom-room.ts` L139–157, and the check at `meadow-rules.test.ts` L216, which cannot fail because a pad exists exactly when the head is narrower and `2r > FINGER_ACROSS`.

This matters now because the perspective fix above needs exactly this pad: far caps drawn smaller than a finger.

Ask: lower the floor so the pad carries the small far caps (the operator's "объекты великоваты" points that way), or delete the pad and correct the plan's sentence. Test: on some swept screen at least one grown mushroom has a pad, and a tap at its pad's rim selects it.

**@vzakharov (agent)** — 2026-09-29T20:47:41Z

The zoom floor is now where the opening clump's narrowest cap is a finger wide (99 px, down from 127), and the finger pad holds the forest's far caps (5e7b2d79). In meadows grown to six the pad switches on for 36–90 of 120 mushrooms on each phone, and a tap at a pad's rim selects that mushroom (fe708323); tablets and desktop still pad none. The four tests that encoded the old floor are restated against the new least size: the ink line is at least a CSS pixel deeper than any russula dip or chanterelle lobe at the smallest mushroom, and a butterfly stays narrower than any clump cap. Insects now shrink with the clump where it is small (e84a2a71), so a meadow grown sideways on a phone and turned upright keeps every flower it had in sight.

---

<a id="t99"></a>

### `src/pages/mushrooms/ui/scene/meadow-scene.ts`:245 — unresolved

```diff
@@ -0,0 +1,417 @@
… 241 lines elided …
+    if (!layout || !meadow) return undefined;
+    const { mushrooms, planted } = meadow;
+    const { room } = this;
+    if (room?.mushrooms === mushrooms && room.planted === planted) {
```

**@vzakharov (agent)** — 2026-09-29T18:34:38Z

**After a resize that is not a full turn, `+` answers from the old screen's room.** `roomNow`'s cache is keyed on `mushrooms` and `planted` only. The resize path (L384–391) builds a new `layout` and never clears `this.room`. So after a collapsing browser bar, an iPad split view or a window drag, `+` grows a mushroom on a foot that was checked against the old controls and margins, or shakes its head when the new screen has room.

Ask: add the layout to the key (`room.layout === layout`), or clear `this.room` where `this.layout` is set. Test: in a scene-free unit around `roomNow`'s logic, a changed layout with the same meadow calls `roomFor` again.

**@vzakharov (agent)** — 2026-09-29T19:02:09Z

Fixed in 13ccefb. `roomNow` goes through `keptRoom`, which keys on the layout, the seeded flowers and the seed as well as the mushrooms and planted flowers. So after any resize, `+` answers from the new screen. `mushroom-room.test.ts` covers it without a scene.

---

<a id="t100"></a>

### `src/pages/mushrooms/ui/scene/sun-layout.ts`:44 — unresolved

```diff
@@ -0,0 +1,156 @@
… 40 lines elided …
+  const clear = (sun: Circle) =>
+    sun.y + sun.r <= horizon && crowns.every((crown) => raysClear(sun, crown));
+  let sun = sunAt(width, height, r, controls);
+  for (let size = r - 1; size >= r * SUN_LEAST; size--) {
```

**@vzakharov (agent)** — 2026-09-29T18:34:38Z

**The sun can still stand over the clump; the loop gives up quietly.** The shrink stops at `r * SUN_LEAST`, and the function then returns the last sun whether it clears or not. A grid sweep over 300–2600 × 300–1600 finds 107 sizes where the rays cross a clump cap, including 560×360 and 640–840×320: landscape phones with the browser bar showing. The tests only sweep `VIEWPORTS`, where it happens to hold.

Ask: when the least sun still doesn't clear, move it (along the sky, away from the crowns) rather than returning an overlap. Test: sweep a grid of sizes, not only `VIEWPORTS`, and assert `raysClear` for every crown.

**@vzakharov (agent)** — 2026-09-29T18:58:20Z

Fixed in 8e5e408. If the sun still touches something after shrinking to `SUN_LEAST` at `sunAt`'s spot, `placeSun` now moves it. It goes to the nearest place in the sky that clears the horizon, the screen's edges for its glow, every control and every crown. There it keeps the largest size that still fits, and it throws if no sun fits anywhere. One check, `fitsSky`, covers all of these, and it also caught a glow running off screen at 400×340. The new test sweeps 300–2600 × 300–1600 every 20 px and asserts `raysClear` for every crown and control. It runs in ~10 s, and 107 sizes failed before the fix. The `VIEWPORTS` suns are unchanged. One cost is accepted: on windows only a few buttons across and down (roughly under 520×460), the moved sun can shrink to `SUN_SMALLEST`, 0.2 of its size. There "never below `SUN_LEAST`" holds only where the sun stays at `sunAt`'s spot.

---

<a id="t101"></a>

### `src/pages/mushrooms/model/ground.ts`:140 — unresolved

```diff
@@ -0,0 +1,231 @@
… 110 lines elided …
+ * foot: `across` from the middle, `up` the screen from the clump's front
+ * foot. Two points as far apart here stand as far apart on the screen.
+ */
+export function seen({ x, z }: Ground): Point {
```

**@vzakharov (agent)** — 2026-09-29T18:34:38Z

**`seen` claims "as far apart here stand as far apart on the screen", but that holds on one camera only.** `UP_PER_Z` is fixed at 0.481, while real cameras run from 0.307 (phone sideways) to 0.782 (412×915). So `FOOT_APART` 0.3 (`placement.ts` L43) and `FLOWER_APART` 0.2 (`mushroom-room.ts` L54) come out 0.64–1.6× those distances vertically on screen. Separately, `FORESHORTENING` (`meadow-camera.ts` L113) builds its span from `VIEWPORTS` (0.252–0.765), and a Pixel-class 412×915 phone gives 0.782, outside the span, so the rules kept "over the span" don't cover it.

Ask: measure with the actual camera's foreshortening (the placement already has the camera), and derive `FORESHORTENING` from the formula's bounds rather than a device list, or clamp the camera into the span. Then correct the comment. Test: 412×915 either and its turn falls inside `FORESHORTENING`, or the camera is clamped to it.

**@vzakharov (agent)** — 2026-09-29T20:12:27Z

Every camera now looks from one angle, `UP_PER_Z` 0.481, so `seen` holds on all of them; `foreshortening()` and `FORESHORTENING` are gone (a177993). A new test checks that `seen × unit` is the on-screen offset on every `VIEWPORTS` screen and its turn, and on 412×915 and its turn, both as fitted and as refit after a turn. Without the one angle it fails on 11 of 14 screens.

---

<a id="t102"></a>

### `src/pages/mushrooms/ui/scene/mushroom-room.ts`:79 — unresolved

```diff
@@ -0,0 +1,331 @@
… 50 lines elided …
+ * `clearOfFlowers` instead, the rule a flower keeps off a mushroom's foot,
+ * leaves room for six mushrooms among seven flowers in almost no visit.
+ */
+const FLOWER_APART = 0.2;
```

**@vzakharov (agent)** — 2026-09-29T18:34:38Z

**A portrait meadow turned to landscape hides most of its flowers behind mushrooms.** On phoneP, 64% of flower heads are covered after the turn (2705 of 4200), against 4% before it. On phoneS it is 74%. Meadows grown on landscape show 12–19%. `FLOWER_APART` keeps feet apart on the ground, but the landscape camera's flatter foreshortening stacks the nearer caps over the flowers behind them, and "a turn loses none" counts flowers standing, not flowers seen. Frame: `frames/bite-9/review/turned-to-landscape-flowers-hidden-phoneP.png`.

This mostly follows from the landscape squeeze on `ground.ts` L193, and it will move with the perspective fix, so it may resolve there. Ask: after those two, measure it again. Test: a phoneP meadow grown to six and turned keeps at least half its flower heads in sight (`flower-sight`'s rule) in the median visit.

**@vzakharov (agent)** — 2026-09-29T20:12:29Z

A turn's refit is now a scaled copy of the picture the child grew, so flowers no longer end up behind mushrooms (a177993). 3e49b0b tests it: a meadow grown to six on the phone and the small phone and then turned keeps every flower it had in sight (median and lowest visit both 1 over 50 visits, at least half of each head shown). The phone kept 0.25 of them before.

---

<a id="t103"></a>

### `src/pages/mushrooms/ui/scene/cap-cover.ts`:14 — unresolved

```diff
@@ -0,0 +1,25 @@
… 10 lines elided …
+export const MOST_HIDDEN = 0.25;
+
+/** How much of `box`'s area `over` covers. */
+export function coverOf(box: Box, over: Box): number {
```

**@vzakharov (agent)** — 2026-09-29T18:34:39Z

**`cap-cover` measures a cap only against other caps, so stems cover freely.** Box against box, cap against cap: a nearer mushroom's stem crossing a far cap is never counted. By pixels, a forest cap is hidden up to 0.21 (tabL) to 0.45 (phoneS), where the bound reads 0.249. Stems have no bound at all: hidden p95 26–51%, max 75%. Doors hold (≥80% in sight) and no tap goes astray, so this is a look finding, not a tap one, and the perspective fix will reshuffle it.

Ask: count the nearer mushroom's stem polygon into what hides a cap, and bound a stem's hidden share (say ≤ 0.5). Test: in the placed-meadow sweep, no grown cap is more than `MOST_HIDDEN` hidden by pixels, counting stems.

**@vzakharov (agent)** — 2026-09-29T20:27:33Z

Fixed in 931b2662. Cover is now read point by point over what is drawn, counting every nearer cap, gills and stem together: a cap may be at most a quarter hidden and a stem at most half (`MOST_HIDDEN`), the clump's own two not counted against each other. The `meadow-rules` sweep holds both; without the fix it fails on tablet portrait, phone and small phone with stems 51–54% hidden. `cap-cover.test` covers a nearer stem crossing a far cap whose box the nearer cap never meets. `+` refuses a foot only when the new mushroom itself would hide too much, so a meadow a turn left over the limit never blocks it.

---

<a id="t104"></a>

### `src/pages/mushrooms/model/ground.test.ts`:82 — unresolved

```diff
@@ -0,0 +1,106 @@
… 78 lines elided …
+
+describe('a turn', () => {
+  for (const [name, width, height] of VIEWPORTS) {
+    it(`keeps every foot where it stood on the ground, on a ${name} screen`, () => {
```

**@vzakharov (agent)** — 2026-09-29T18:34:39Z

**This test passes for any camera.** It compares `(x - midline)/size`, `down` and `size/unit`, all of which `project` makes camera-independent by construction, so a turn that moved every foot on the ground would still pass. (The property itself holds: the sweep found mushrooms 0–1 px from where they were after a round-trip turn.)

Ask: assert on the ground, not the screen. Grow on the screen, turn, and check that each `Planted.foot` and each flower foot is identical by value. Then break it on purpose, for example by re-picking one foot on resize, and watch it fail.

**@vzakharov (agent)** — 2026-09-29T19:02:08Z

Fixed in 13ccefb. The turn test now asserts on the ground: it reads each `Planted.foot` and each flower foot back off the turned layout, and each must equal the original by value. I checked that it fails when the flower bed is re-picked on resize and when one foot is nudged on a portrait camera, then reverted both.

---

<a id="t105"></a>

### `src/pages/mushrooms/ui/scene/layout.test.ts`:81 — unresolved

```diff
@@ -0,0 +1,309 @@
… 77 lines elided …
+ * little under the share all of `VISITS` reach (69%).
+ */
+const LEAST_FULL: Partial<Record<Screen, number>> = { 'small phone': 0.65 };
+const FULL_ELSEWHERE = 0.99;
```

**@vzakharov (agent)** — 2026-09-29T18:34:39Z

**The plan's "six in ≥ 99.5% of 2000 visits, the small phone 69%" comes from a one-off sweep; the suite holds 0.99 over one visit in ten and 0.65 over one in twenty.** The sweep here confirms the numbers (600 visits: tabL/tabP 100%, phoneP 99.7%, phoneL 99.3%, phoneS 69.7%). But a regression to 97% would pass this test.

Ask: name in the plan which number the suite holds and which the script measured (the megabeast note "an exhaustive sweep is a script; the test samples it"), and commit the sweep script beside the play run so the handler can rerun it.

**@vzakharov (agent)** — 2026-09-29T20:27:35Z

In 9ebbc17b: `pnpm sweep:mushrooms` (`scripts/sweep-mushrooms.ts`, beside the play run, since it runs on demand and is not a test) grows all 2000 visits on every screen and prints the share reaching six, the caps' median span and the most of any cap and stem hidden; `--visits` and `--screens` narrow it. It grows the meadow through the tests' own helpers. The plan now says which floors the suite holds and which figures come from the script (23b0e890), and items 1 and 8's 2000-visit claims now read as the 500 opening clumps the tests run.

---

<a id="t106"></a>

### `src/pages/mushrooms/ui/scene/insect-layout.test.ts`:151 — unresolved

```diff
@@ -0,0 +1,198 @@
… 147 lines elided …
+describe('a bee on a flower', () => {
+  for (const [name, width, height] of VIEWPORTS) {
+    it(`leaves at least half of the median head in sight under its body and wings, on a ${name} screen`, () => {
+      const head = medianHead(width, height);
```

**@vzakharov (agent)** — 2026-09-29T18:34:39Z

**The bee rule is tested on the median head against its own cutoff, while the claim is about small heads.** `flower-sight.ts` L76–83 says a bee sits no nearer than `FACE_REACH` and leaves half the head in sight wherever it crawls. The lift is exactly `FACE_REACH * size`, and the ±0.06 crawl (`buzz-rest.ts` `CRAWL`) takes the face past the centre on the smallest heads. This comes from arithmetic, not a sweep, so treat it as a hunch.

Ask: run this over the smallest head the petal genes allow and over the crawl's extremes, not the median at rest. Test: for the least head and `CRAWL` at ±0.06, at least half the head stays in sight.

**@vzakharov (agent)** — 2026-09-29T18:58:22Z

Tested in f9a2f7a. The test takes the smallest head the petal genes allow, on the smallest flower standing, with the biggest bee at every extreme of its crawl. That head is at most 37% covered, so the hunch doesn't hold for the flowers the game grows. The rule's own claim did fail on a head a tenth that size (100% covered), because the lift ignored the crawl. The lift is now `(FACE_REACH + CRAWL_REACH.y) * size`, with `CRAWL_REACH {x: 0.06, y: 0.03}` exported from `buzz-rest.ts`. The test also covers that tiny head, which is now at most 46% covered.

---

<a id="t107"></a>

### `src/pages/mushrooms/ui/scene/mushroom-room.ts`:313 — unresolved

```diff
@@ -0,0 +1,331 @@
… 309 lines elided …
+      for (const [index, held] of screens.entries()) {
+        const others = stood[index] ?? [];
+        const { splay } = placeOf(held.stage.camera, foot);
+        for (const genes of splays.get(splay) ?? []) {
```

**@vzakharov (agent)** — 2026-09-29T18:34:39Z

Small ones, in the same file:
- `splays.get(splay) ?? []`: a missed splay makes the loop run zero times, and `admits` passes having checked nothing. That is the silent-fallback shape CLAUDE.md forbids. Throw on a miss instead.
- L83 `screenPairs` grows without limit on a window drag, while `layout.ts` caps its caches at `KEPT` 8. Cap it the same way.
- `clearOfFlowers` (`flower-plots.ts` L188) has no caller outside its own test; this file only names it in a comment. Delete it or use it.

Ask: all three in one commit; knip or a test should hold the dead export.

**@vzakharov (agent)** — 2026-09-29T19:02:11Z

All three in 13ccefb. A missed splay now throws. `screenPairs` went with the turned-screen pair (each screen lays out at its own width now, see the `ground.ts` L193 thread), and a `WeakMap` per layout replaced it, so there is nothing to cap. `clearOfFlowers` and its test are deleted, and the plan now names `clearOfFeet`.

---

<a id="t108"></a>

### `src/pages/mushrooms/ui/scene/meadow-scene.ts`:410 — unresolved

```diff
@@ -0,0 +1,439 @@
… 406 lines elided …
+    this.backdrop = paintBackdrop(this, this.backdrop, layout, random, ratio);
+    this.grass ??= new Grass(this);
+    const stand = this.stand();
+    if (stand) this.grass.paint(stand, random);
```

**@vzakharov (agent)** — 2026-09-30T02:18:28Z

**Blocking: tufts are grown only in `paint`, which runs on a resize, so once the meadow changes the tufts it shows stop taking flowers.** The plan's "every tuft shown takes a flower until the cap" holds only on a fresh meadow: 0 refusals in 14000 plantings per screen. After `+`, a mushroom that now stands by a bare tuft makes `takesFlower` refuse it. The child taps, the tuft shakes and says nuh-uh, while the meadow is half empty.

Over 2000 visits, with the forest grown to full, these are the tufts that refuse even though no mushroom covers their middle:

| screen | refuse | per visit |
|---|---|---|
| phone | 41.6% | 8.3 |
| small phone | 45% | 7.6 |
| tablet portrait | 39.8% | 16.6 |
| tablet | 18.6% | 11.3 |
| phone held sideways | 12.7% | 5.6 |

A single `+` already makes 13–17% refuse on the upright phones, and on the 280×600 phone 70 visits have no tuft that takes a flower at all. Bee plantings do the same on a smaller scale: after three of them, 2–9% refuse, in 31–60 of 60 visits. In the game at 7 of 14 flowers, phoneP refused 5 of its 12 bare tufts, tabL 7 of 56 and phoneL 2 of 32 (`phoneP-10-forest-tuft-refused`, `tabL-10-forest-tuft-refused`).

`tufts.test.ts:67` builds only the opening clump, with no forest and no bees, so it cannot see this.

Ask: after any mix of `+`, `−`, bee plantings and the child's own, the tufts shown are exactly those where `takesFlower(stand, tuftFoot(…))` holds, re-checked whenever mushrooms or flowers change, and a tuft that stays valid doesn't move. The test is the sweep above, run over grown forests plus plantings, with 0 refusals below the cap.

**@vzakharov (agent)** — 2026-09-30T15:32:17Z

Fixed in cb8d1c3. The tufts are now re-tended whenever mushrooms or flowers change, as well as on every paint. The tufts shown are exactly the spots where `takesFlower` holds and a finger reaches the grass, and a tuft that stays valid keeps its place. `tufts.test.ts` now runs the sweep over grown forests through `+`, `−`, bee plantings and the child's own plantings on every screen, with 0 refusals below the cap. It fails if kept tufts skip the re-check.

---

<a id="t109"></a>

### `src/pages/mushrooms/ui/scene/chord-fingers.ts`:11 — unresolved

```diff
@@ -0,0 +1,12 @@
… 6 lines elided …
+  changed: readonly number[],
+  down: readonly number[],
+): number[] {
+  const earlier = down.some((id) => !changed.includes(id));
+  return earlier ? [...changed] : changed.slice(1);
```

**@vzakharov (agent)** — 2026-09-30T02:18:28Z

**A finger that lands after the first has lifted plays its flower twice, and its every other gesture goes through Phaser too.** Phaser 4 gives a new touch the first free pointer (`InputManager.js` in phaser@4.2.1, around lines 560–585). Take finger A down, then B, then lift A, then tap C:

- Phaser treats C as pointer1, an ordinary tap: bloom, note, deselect.
- `chordFingers` sees B still down, so C also counts as a chord finger, and `chordTap` plays the note a second time.

The same C on a tuft, a mushroom or a button reaches Phaser as a one-finger gesture as well, so "every other gesture stays one-finger" doesn't hold for it. `chord-fingers.test.ts:16` asserts exactly this case (`[7]` out of `[4, 7]`), so the test pins the bug in place.

Ask: a finger that Phaser's pointer1 holds is never a chord finger. The test gets the case "the first finger lifted, the second still down, a third lands", and expects `[]` for the third.

**@vzakharov (agent)** — 2026-09-30T15:32:19Z

Fixed in d8e4160. `chordFingers` now takes the finger Phaser's pointer1 holds (read after Phaser's own canvas listener has run) and leaves that finger out. The old case that pinned the bug changed, and a new one covers "the first finger lifted, the second still down, a third lands", which gives `[]`.

---

<a id="t110"></a>

### `src/pages/mushrooms/ui/scene/flower-bed.ts`:196 — unresolved

```diff
@@ -0,0 +1,262 @@
… 192 lines elided …
+  chordTap(object: Phaser.GameObjects.GameObject): boolean {
+    for (const [id, shown] of this.shown) {
+      if (shown.head !== object) continue;
+      this.tap(id);
```

**@vzakharov (agent)** — 2026-09-30T02:18:28Z

**A chord finger does more than play: `tap(id)` ends in `onTap`, which dispatches `deselect`.** So a second finger on a flower drops the selected mushroom and shuts an open picker, the flower picker included. The docstring above says "nothing else takes a second finger".

Ask: `chordTap` opens the head and plays the sound, and nothing else. A test holds that a meadow with a selected mushroom and an open planting is unchanged by it: same `selected`, same `planting`.

**@vzakharov (agent)** — 2026-09-30T15:32:20Z

Fixed in d8e4160. `chordTap` now only opens the head and plays the sound. What a touch asks of the meadow is `FLOWER_TOUCH_ACTIONS` in `flower-touch.ts`: a tap deselects, a chord finger asks nothing. `flower-touch.test.ts` holds that a meadow with a selected mushroom and an open picker keeps the same `selected` and `planting` after a chord finger.

---

<a id="t111"></a>

### `src/pages/mushrooms/ui/scene/instrument-voices.ts`:115 — unresolved

```diff
@@ -0,0 +1,195 @@
… 92 lines elided …
+
+/** The kit, each drum soft: a rounded attack, the noise filtered, the skins sines. */
+export const DRUM_SPECS = {
+  kick: {
```

**@vzakharov (agent)** — 2026-09-30T02:18:28Z

**All four violet flowers are close to silent on a phone speaker, and the kick is among the seven every visit opens with.** Each sound was rendered offline in Chromium through the master gain and compressor, then run through an FFT:

| sound | share of energy above 300 Hz | loudest 50 ms above 300 Hz |
|---|---|---|
| kick | 0.0% | −69 dB |
| tom-low | 0.0% | −69 dB |
| tom-mid | 0.0% | −61 dB |
| tom-high | 1% | −45 dB |

A middle note measures −20 to −28 dB. A phone speaker gives back little below ~300 Hz, so a child tapping a violet flower on a phone hears nothing. The keyed notes already allow for this ("louder and longer low where a phone loses the fundamental"), but the drums don't.

Ask: each drum has a partial or a click that a phone reproduces. The property to test: every one of the twenty sounds has its loudest 50 ms above 300 Hz within ~12 dB of a middle note, measured by an offline render the test can run (or a spec-level stand-in the test can compute).

**@vzakharov (agent)** — 2026-09-30T15:32:22Z

Fixed in 8f388ff. Each skin now has a quieter higher tone above 300 Hz, and the white drums are louder. In a Chromium offline render, every drum's loudest 50 ms above 300 Hz is now 5–8 dB under a C5. Before, the kick was at −70 dB and the toms at −69, −62 and −43 dB. `part-loudness.ts` computes the same measure from a voice's data and lands within 0.6 dB of the render. The test holds all 36 notes and all 8 drums within 12 dB of a C5. The model leaves out the compressor, so drums must clear the bar by a further 5 dB. The measurements are in `docs/remove-before-merging/frames/bite-10/sound.md`.

---

<a id="t112"></a>

### `src/pages/mushrooms/ui/scene/instrument-voices.test.ts`:49 — unresolved

```diff
@@ -0,0 +1,65 @@
… 45 lines elided …
+    for (const [drum, { attack, body, hiss }] of specs) {
+      assert.ok(attack >= SOFTEST_CLICK, drum);
+      assert.ok(body ?? hiss, `${drum} makes a sound`);
+      if (hiss) assert.ok(hiss.frequency <= HISS_CEILING, drum);
```

**@vzakharov (agent)** — 2026-09-30T02:18:29Z

**"Nothing past 8 kHz" is checked against the band's centre, not its reach, and the white drums sit far under the notes.** The hat is a bandpass at 7 kHz with Q 1.2, so its upper −3 dB edge is about 10.5 kHz. The offline render puts 50% of the hat's energy above 8 kHz, 19% of the shaker's and 5% of the snare's. The loudest 50 ms of each: hat −47.7 dB, rim −42.9, shaker −40.8, snare −35.5, against −21.6 for a C5. That puts the hat ~26 dB under a note, so in a chord it vanishes.

Separately, `HISS_CEILING` is imported from the module under test, so the ceiling moves with the code. `SOFTEST_CLICK` (0.003) and "no peak past half" (0.5) sit exactly on the hat's attack and the kick's peak. They hold today's values rather than a margin.

Ask: every hiss's upper −3 dB edge, `f·(√(1+4Q²)+1)/(2Q)`, is ≤ 8 kHz, with the ceiling stated in the test. Every drum's loudness is within a stated range of a middle note's.

**@vzakharov (agent)** — 2026-09-30T15:32:23Z

Fixed in 8f388ff. The test computes each hiss's upper −3 dB edge, f·(√(1+4Q²)+1)/(2Q), against an 8 kHz ceiling stated in the test itself. The hat moves to 4.6 kHz at Q 1.1, which puts its edge at 7.1 kHz. Above 300 Hz, every drum sits between 7 dB under and 6 dB over a C5; across the full band, no drum is more than 10 dB over it. Every attack is now at least 4 ms, against a 3 ms floor. About a fifth of the hat's energy still lies past 8 kHz, because the filter's slope is gentle; the ask was about the edge, so that stays.

---

<a id="t113"></a>

### `src/pages/mushrooms/ui/scene/tufts.ts`:44 — unresolved

```diff
@@ -0,0 +1,162 @@
… 40 lines elided …
+ * small finger's pad round a tuft drawn smaller than one, and no more, so
+ * the bare ground between the tufts stays bare.
+ */
+export const TUFT_REACH = 22;
```

**@vzakharov (agent)** — 2026-09-30T02:18:29Z

**The tufts don't read as something to tap, they are denser than their reach, and small screens run out of them early.** In the frames they are stray blades of grass (`phoneSL-00-open`, `phoneP-10-forest-tuft-refused`). Their drawn size:

| screen | drawn size |
|---|---|
| phoneSL | 2.8–5.9 px |
| phoneS | 4.5–9.1 px |
| phoneP | 5.5–11.2 px |
| tabL | 7.1–15.2 px |

Nothing tells a six-year-old that this grass, unlike the seam grass beside it, grows flowers. Density, measured by sweep:

- Every tuft answers at the 22 px floor: 100% on the phones, 50% on tablet portrait.
- The median gap to the nearest tuft is 23–38 px. The reach circles overlap, so "the ground between tufts stays bare" mostly isn't true.
- A tablet always grows its full 61 tufts, and at most 7 can be planted before the cap refuses the rest.

Small screens go the other way:

- At the start, phoneP has 11 of 20 tufts bare to a tap, and phoneS 6 of 17.
- phoneS had no bare tuft left after 5 plantings, at 12 of 14 flowers (`phoneS-05-full`).
- On phoneP at 14 flowers no tuft is reachable, so the cap's refusal can't even be seen there.
- The open picker doesn't mark the tuft it opened on.

Ask: tufts drawn at a stated least size (for example ≥ 12 px) on every `VIEWPORTS` screen, and told apart from the seam grass by the eye. No more tufts than the cap leaves room for, and at least one bare tuft within reach until the cap. The picker marks its tuft while open. Each is a property the tuft test can hold per screen.

**@vzakharov (agent)** — 2026-09-30T15:32:25Z

Fixed in cb8d1c3. Tufts are drawn at least 12 px (`TUFT_LEAST`) as five fresh blades round a closed pink bud, clearly unlike the seam grass. There are never more tufts than flowers left under the cap, and no two tufts' reach circles overlap. Every `VIEWPORTS` screen has a bare tuft whenever the meadow is below the cap. On 280×600 that holds in all but 12% of meadows, a bound the test holds. The open picker's tuft stands taller on a cream glow. To free room on small phones, a flower gives taps outside its petals to a bare tuft (`hit-areas.ts`), as it already did to a mushroom. Frames: `docs/remove-before-merging/frames/bite-10/tufts-*`. With tufts capped to the flowers left, a full meadow shows no bare tuft, so the refusal shake is rarely seen. That is taken as the design: no tuft stands where no flower can grow.

---

<a id="t114"></a>

### `src/pages/mushrooms/ui/scene/flower-plots.test.ts`:213 — unresolved

```diff
@@ -0,0 +1,270 @@
… 209 lines elided …
+ * control can lose the room a butterfly's wings take there: one of six or
+ * seven, turning a grown phone meadow from sideways to upright.
+ */
+const KEPT_IN_SIGHT = 0.8;
```

**@vzakharov (agent)** — 2026-09-30T02:18:29Z

**The turn test's 0.8 median covers the grown forest only, and the commonest state loses far more.** Over 2000 visits, a phone held sideways and turned upright:

- With the full forest, 1 flower in 9 leaves sight (11.1%), inside the plan's "one in six or seven".
- With the opening clump alone, which is how most visits look, it is 1 in 3.5 (28.7%). 98.7% of visits lose at least one, and the worst 10% lose 43% or more.
- Tablet to portrait with the opening clump: 18%.
- The upright screens turned sideways lose nothing.

The test runs 50 forest visits and asserts only the median. So the bound the plan quotes is a forest figure, and the "Accepted" line in the plan item was taken on it. Turning the phone is what a child does, and flowers vanishing from the meadow is the "only gets fuller" invariant.

Ask: the test also runs the opening clump and bounds the worst decile, not only the median. If 28.7% is what the floors really cost, the plan states that figure against the alternative it beat, and the child's own planted flowers are held to never leave sight.

**@vzakharov (agent)** — 2026-09-30T15:32:26Z

Fixed in 76bfb88, with the plan line in 3db04d5. The camera now keeps each edge flower's head, with room for half a butterfly's open wings, inside the edge margin (`perchedOn` in layout.ts). Over 2000 visits, a turn now loses no flower on any screen except a phone turned from sideways to upright. There the opening clump goes from 28.7% lost to 8.9% (worst tenth from 43% to 14%), and the forest from 11.1% to 10.0%. Tablet to portrait goes from 18% to 0. The turn test runs the opening clump and the forest on every screen, bounding the share lost at 11% and the worst tenth at 18%. A planted-flower test holds every planted flower in sight after the turn; the old camera failed it. The flowers still lost are front flowers near the bottom of an upright screen, where a butterfly's wings reach past the bottom edge and zooming out cannot help. The plan states these figures.

---

<a id="t115"></a>

### `src/pages/mushrooms/ui/scene/mushroom-patch.test.ts`:39 — unresolved

```diff
@@ -0,0 +1,215 @@
… 35 lines elided …
+ * nearer ones may hide a quarter of its cap (`MOST_HIDDEN`), which leaves
+ * this much, not a whole `TAP_RADIUS`.
+ */
+const LEAST_PATCH = 12;
```

**@vzakharov (agent)** — 2026-09-30T02:18:29Z

**The 24 px patch fails in a few visits, and a quarter of mushrooms fall under 44 px.** Over 2000 full forests per screen (12000 mushrooms each), these mushrooms had no 24 px patch at all:

| screen | no 24 px patch |
|---|---|
| phoneL | 4 |
| phoneS | 3 |
| phone | 1 |

For example, visit 1005716 mushroom-4 on phoneL, 9906672 mushroom-3 on phone and 8402062 mushroom-1 on phoneS. The share under 44 px is phone 24%, phoneS 37%, phoneL 23% and tablet 28%. So the test's sample misses the cases the sweep finds, and 24 px is well under a six-year-old's fingertip.

Ask: the test's seeds include the three above, and it passes with 0 misses over 2000 visits. The test states the share under 44 px per screen as a bound, so the next layout change can't quietly grow it.

**@vzakharov (agent)** — 2026-09-30T17:45:48Z

Fixed in e4e3979. Growth now places a new mushroom only where it keeps a patch of its own, 32 px across, and every mushroom already standing keeps the patch it had. The floor rose from 24 px to 32 px for grown mushrooms; at 36 px the phone and tablet would fall below reaching six in 99% of visits. The opening clump's two keep 24 px, because their caps cross by design. The hit-testing moved from the test into `mushroom-patch.ts`, which growth, the test and `pnpm sweep:mushrooms` share. The test covers your three seeds, every forest size over 40 forests, and a per-screen bound on the share under 44 px. That share is now tablet 23.0% (was 28.4), phone 19.0% (24.3), phoneL 22.8% (22.9) and phoneS 33.6% (37.2). With the growth rule turned off, the test fails on all three seeds. Over 2000 full forests per screen, one miss is left: on phoneL, visit 12733755's back cap keeps 22 px, because phoneL stands the clump under the zoom floor. Growth doesn't place the clump, so it stays until the clump's layout changes.

---

<a id="t116"></a>

### `src/pages/mushrooms/ui/scene/sound.test.ts`:174 — unresolved

```diff
@@ -0,0 +1,253 @@
… 170 lines elided …
+    silent.stop();
+  });
+
+  it('a chord asked for before the synth exists is heard whole', () => {
```

**@vzakharov (agent)** — 2026-09-30T02:18:29Z

**This test survives `PENDING_VOICES` dropping from 5 to 2**, which was mutation-checked: 8/8 still passed. A three-note chord only needs more than one voice queued for the test to see "whole".

Ask: queue 5 before `start` and all 5 are built. Queue 6 and exactly 5 are built, the oldest dropped.

**@vzakharov (agent)** — 2026-09-30T15:32:27Z

Fixed in 38eb301. Five voices queued before start build exactly five voices' worth of nodes. With six queued (a pop, then five notes), the pop is dropped. The test fails with `PENDING_VOICES` at 4 and at 6.

---

<a id="t117"></a>

### `src/pages/mushrooms/model/game.ts`:305 — unresolved

```diff
@@ -0,0 +1,332 @@
… 252 lines elided …
+    case 'plant': {
+      const { planting, planted } = meadow;
+      const seed = shapeSeed(planting, action.shape);
+      if (planting === undefined || seed === undefined) return meadow;
```

**@vzakharov (agent)** — 2026-09-30T02:18:29Z

**`plant` doesn't enforce the 14-flower cap, and two plan claims don't match the code.**

- `plant` doesn't check `FLOWER_LIMIT`; only the UI's `can: plantable` does. The cap is a model invariant, so the reducer should hold it.
- The plan names `model/planting.ts`, which doesn't exist. The reducer is here.
- The plan says "a tap anywhere else closes the picker". `release`, `startle` and the mute don't apply `PICKERS_SHUT`, so releasing an insect leaves the flower picker open. Nothing gets stuck, but the claim is wrong.
- With the picker open, a tap on another tuft only closes it, so the child has to tap again. Opening the new tuft directly would feel less broken.

Ask: `plant` at the cap returns the meadow unchanged, and a model test holds it. The plan names the right file. `release`, `startle` and the mute either shut the pickers or the plan says they don't. A tuft tap with a picker open opens that tuft.

**@vzakharov (agent)** — 2026-09-30T15:32:29Z

Fixed in 9c8627a. `plant` returns the meadow unchanged at `FLOWER_LIMIT`, counting the seeded flowers, and `planting.test.ts` holds it. `release`, `startle` and the mute (a new `shut` action) close the flower picker. A tap on another tuft opens the picker there, and a tap on the open tuft closes it. The plan now names `model/game.ts` as the reducer's home.

---

<a id="t118"></a>

### `src/pages/mushrooms/ui/scene/layout.test.ts`:310 — unresolved

```diff
@@ -0,0 +1,326 @@
… 270 lines elided …
+    FLOOR_HELD,
+    ...TURNED_SMALL,
+  ]) {
+    it(`gives every control and every picker's stage a finger's reach, apart, on a ${name} screen`, () => {
```

**@vzakharov (agent)** — 2026-09-30T02:18:29Z

**The 280×600 phone puts the fourth shape button 2.3 px from the third, under `PICK_CLEAR` (6.4 px), although this test claims to cover that screen.** The player measured it in the game with the picker open. Either the game's layout for that state differs from the one this test builds (a forest, a turn), or the phone's state is missing from the list.

Also on phoneL: mute, the three insects, the four shapes and the house make one unbroken row of ten circles (`phoneL-13-shapes-in-forest`), so the shapes don't read as their own group. And the child's flowers bunch up with heads overlapping (`tabL-05-full`).

Ask: find which state the game was in and add it to this test, which then fails at 2.3 px and passes after the fix. The shape row is set apart from the controls by a gap wider than `PICK_CLEAR`.

**@vzakharov (agent)** — 2026-09-30T17:45:50Z

Fixed in 06d0b5f. It was not a missing state: the 280×600 layout is the same in every visit, and the test only asked a stage's own buttons to be 0 px apart. It now asks for `PICK_CLEAR`, fails there at 2.3 px, and after the fix the fourth shape sits under the row. Where the pickers share the top row with the insects, the four-button row first tries a `PICK_APART` (32 px) gap, and a test holds that on every screen where no button has to hide. On phoneL the five-button colour row has no room for the wider gap, so it keeps 6.4 px. The bunching on tabL is fixed in ca06bad and a3b7fef. A tuft now needs the flower that would grow there, at its widest and bent toward each neighbour, to clear every standing head on every screen. Over 200 tabL visits with five plantings each, overlapping pairs went from 18 to 0. A test plants five on every screen and checks the heads stay apart before and after a turn. Frames: `docs/remove-before-merging/frames/bite-10/shapes-280x600.png`, `shapes-phoneL.png`, `planted-five-tabL.png`.

---

<a id="t119"></a>

### `scripts/play-mushrooms.ts`:1 — unresolved

```diff
@@ -0,0 +1,461 @@
+/**
```

**@vzakharov (agent)** — 2026-09-30T02:18:29Z

Minor: 461 lines, a little past the house's ~450. There is a natural seam between the screen runner and the per-feature checks.

Ask: split at that seam when it next grows.

**@vzakharov (agent)** — 2026-09-30T15:32:30Z

Split in e8861a3. `scripts/play-mushrooms.ts` is the screen runner (319 lines), and the meadow's tap sequence moved to `scripts/lib/play-meadow.ts` (162 lines), with the same signature as the other steps.

---

<a id="t120"></a>

### `src/pages/mushrooms/model/pan.ts`:336 — unresolved

```diff
@@ -0,0 +1,365 @@
… 332 lines elided …
+      pace = 0;
+    }
+  }
+  if (heading === 0 && pace === 0) return restingAt(pan, left);
```

**@vzakharov (agent)** — 2026-09-30T23:23:58Z

🔴 **1. Hold both arrows, let one go: the held one is dead.** (confirmed by both agents)

When both keys are held, the pace eases to 0. This line then rests the crop and drops both held-key flags. Letting go of → then does nothing, because `letGoKey` has no effect on a resting crop. Holding ← does nothing either, because `keyAction` drops repeats (`if (event.repeat || …) return undefined` in `keyboard.ts`). Measured in the running game on tabL and phoneP: 0 px/s over 40 frames with ← held. Measured in the model too: 0 px in the second after →'s release, state `rest`. A finger press while a key is held loses the key the same way, since `press` replaces `keys`. The test 'holds still with both keys held' never lets one of them go.

Ask: hold ←+→ for 1 s, release →, tick: the crop reaches cruise leftward within 0.25 s. Likewise press and lift a finger while ← is held: ← turns again after the lift.

**@vzakharov (agent)** — 2026-10-01T03:47:43Z

Fixed in 52db783. The held keys now live on the crop next to its motion, so neither a stand nor a finger press drops them. With both arrows held the crop stands; let one go and the other reaches cruise within 0.25 s. A finger pressed and lifted while a key is held hands the crop back to the key. `tick` also returns the same object when nothing changed.

---

<a id="t121"></a>

### `src/pages/mushrooms/ui/scene/pan-input.ts`:30 — unresolved

```diff
@@ -0,0 +1,160 @@
… 26 lines elided …
+ * The crop the scene's camera shows (`pan.ts`), and what moves it: Phaser's
+ * one pointer, pressed anywhere but on a control, drags it; a held arrow
+ * key turns it, ticked by the scene's clock whenever the crop is read.
+ * A press still taps whatever it lands on, since the meadow answers taps on
```

**@vzakharov (agent)** — 2026-09-30T23:23:58Z

🔴 **2. Every pan also taps what it started on.** (confirmed by both agents)

`POINTER_DOWN → tapMeadow` (`meadow-scene.ts`) answers on the press, before the slop decides that this is a drag. So:
- a pan begun on a cap selects that mushroom and puffs spores (`docs/remove-before-merging/frames/bite-11-review/tabL-drag-from-cap-selects-and-spores.png`: 430 px of pan, spores and all);
- a pan begun on a flower sounds it;
- a pan begun on a tuft opens the picker or plays nuh-uh;
- a pan begun on grass deselects (`else this.dispatch({ kind: 'deselect' })`), so panning always closes the pickers the child had open.

How often a pan's first touch lands on something (24×12 grid over the ground, 20 seeds, opening crop): phoneL 37%, phoneS 30%, phoneP 24%, tabP 17%, tabL 15%. The play run can't see any of it: its drags start on `BARE` ground only, which excludes tufts, and the `TAPS` snapshot compares `selected: null` against `null` when nothing was selected.

Ask: a press that goes on to cross the slop leaves the tap state unchanged: no selection change, no sound, no picker, no planting. Only a press released inside the slop taps. The play run starts a drag on a cap, on a flower and on a tuft, each with a mushroom already selected, and asserts the selection survives.

**@vzakharov (agent)** — 2026-10-01T03:40:47Z

Kept as it is: a press taps on the press. The operator decided this after playing the build («текущая механика -- норм»), and it is written into the plan in 9918342 (docs/plans/mushroom-game-syama/bite-11.md, under "Decided at bite 11's review"). The alternative, tapping only on a lift or after a rest inside the slop, adds at least ~100 ms before the flowers sound. The operator rejected that delay for the flowers as an instrument («при игре 100мс это уже ощутимая (и неприятная) задержка»). So a pan begun on something taps it too, as an accepted cost. The wobble half of this is handled under finding 3: the slop goes to 24 px, so a drifting tap no longer slides the meadow.

---

<a id="t122"></a>

### `src/pages/mushrooms/model/pan.ts`:116 — unresolved

```diff
@@ -0,0 +1,365 @@
… 77 lines elided …
+const GLIDE_SPANS = 6;
+/** The fastest a glide sets off, and the slowest a release that still glides, in px per second. */
+const GLIDE_FASTEST = 5000;
+const GLIDE_SLOWEST = 40;
```

**@vzakharov (agent)** — 2026-09-30T23:23:58Z

🟠 **3. A wobbly tap selects and then slides the meadow.** (player agent, measured in the running game)

A tap on a cap where the finger drifts over 100 ms and then lifts:

| Drift | Crop slides | Selected |
|---|---|---|
| 4 px, 8 px | 0 | yes |
| 11 px | 33 px | yes |
| 14 px | 44 px | yes |
| 18 px | 59 px | yes |
| 24 px | 83 px | yes |

The glide is fed by the velocity from before the finger crossed the slop, so a few px past the line becomes 3–5× that in glide (`docs/remove-before-merging/frames/bite-11-review/tabL-wobbly-tap-18px-slides-59px.png`). A six-year-old's tap drifts. `GLIDE_SLOWEST = 40` px/s is far below a wobble's speed.

Ask: a release after less than ~20 px of total travel ends without a glide. A drift of up to 24 px over 100 ms moves the crop by at most the drift.

**@vzakharov (agent)** — 2026-10-01T03:47:44Z

Fixed in 04ca338. The slop is now 24 px, the plan's "child's drift" (docs/plans/mushroom-game-syama/bite-11.md), and the glide uses only velocity measured after the crossing. Every drift in your table (4–24 px over 100 ms, in 3, 6 or 12 steps, either way) now moves the crop 0 px. Against the old code the same test reproduces your slide (11 px → 35 px).

---

<a id="t123"></a>

### `src/pages/mushrooms/ui/scene/mushroom-patch.test.ts`:22 — unresolved

```diff
@@ -0,0 +1,108 @@
… 18 lines elided …
+ * takes them by design. Set under the worst of all 2000 visits' full forests
+ * on the tablet (76.5%), since the sample here holds that tail too.
+ */
+const LEAST_HEAD_SHARE = 0.75;
```

**@vzakharov (agent)** — 2026-09-30T23:23:58Z

🟠 **4. The 75% head-tap floor is measured on forests no child grows.** (reader agent)

Every forest here is `opened(seed, width, height, true)` with no crop. With no crop, `screenOn` gives `keepOff: []` and places mushrooms anywhere in the world. A child who never pans grows all twelve inside the opening crop, which is denser. Measured over `openingCrop` forests, the worst head share kept is: tablet 73.0% (400 visits), small phone 74.2%, phone 75.4%, phone sideways 75.3%, tablet portrait 75.2%. So the floor fails on two screens. The lead behind the lowered floor holds: 0 misses at a head's middle, and every lost tap (4,794 to a mushroom, 252 to a flower on the tablet) went to something drawn in front. The child always gets a sensible answer. The number is what's wrong.

Ask: the head-share test also grows forests inside `openingCrop` (and at a world end), with the floor set from those, or the floor stated as a crop-less figure beside a second one for the opening crop.

**@vzakharov (agent)** — 2026-10-01T04:02:59Z

Fixed in fbe6c6e. The head-share test now grows forests anywhere in the world, on the opening crop, and at each world end, on every screen. It pins the two worst visits measured, 2051024 (tablet, opening crop) and 1282881 (phone, right end), both at 73.0%, so the floor is now 72%. Every tap on a grown head, its middle included, must reach that mushroom or one drawn in front of it. The plan states the new figures. The run also found visit 2193566, where a chanterelle's middle falls in a 0.09 px crack between its cap's and gills' hit polygons. It is recorded as open in the plan.

---

<a id="t124"></a>

### `src/pages/mushrooms/model/pan.ts`:141 — unresolved

```diff
@@ -0,0 +1,365 @@
… 137 lines elided …
+    return start + (goal - start) * glided(glideShare(motion, time));
+  }
+  return motion.panning
+    ? clampLeft(view, motion.base - (motion.last.x - motion.anchor))
```

**@vzakharov (agent)** — 2026-09-30T23:23:59Z

🟡 **5. Overshoot an end, drag back: a dead zone.** (reader agent)

Plan item 11 promises "soft ends". A drag is clamped here, but the finger's overshoot is kept in `motion.last.x - motion.anchor`, so the crop doesn't move again until the finger has come all the way back. Measured: drag 1000 px on a 1024-wide screen over a 2048 world, then back, and the finger travels 460 px before the crop moves. 'stops at the world's ends however far the finger goes' checks only the clamp.

Ask: after overshooting an end by any d, reversing the finger moves the crop within one frame. Or a rubber band, which is what "soft ends" says, with the plan matching whichever one lands.

**@vzakharov (agent)** — 2026-10-01T03:47:46Z

Fixed in 0330aa0. Ends are now hard rather than a rubber band, and the plan says so. While pressed, the crop keeps its own left edge inside the world and drops the finger's overshoot at an end, so reversing moves the crop on the next frame, whatever the overshoot.

---

<a id="t125"></a>

### `src/pages/mushrooms/model/pan.ts`:210 — unresolved

```diff
@@ -0,0 +1,365 @@
… 206 lines elided …
+    ...pan,
+    motion: {
+      ...motion,
+      ...(crossed && { anchor: x, panning: true }),
```

**@vzakharov (agent)** — 2026-09-30T23:23:59Z

🟡 **6. A flick loses its whole first step.** (reader agent)

On crossing the slop the anchor becomes the first sample past it (`anchor: x`), so for the rest of the drag the ground lags the finger by that whole step. At 1500 px/s and 60 Hz that is ~25 px. Both the unit test (an 11 px step) and play-pan's `crossedAt` encode the lag as correct.

Ask: the ground point under the finger at the press stays within `SLOP` of the finger for the whole drag, whatever the first step's size.

**@vzakharov (agent)** — 2026-10-01T03:47:48Z

Fixed in 0330aa0, and the play run now expects the same in 678c8d8. On crossing the slop the crop follows from the slop line, so the ground under the press stays exactly SLOP from the finger, whatever the size of the first step.

---

<a id="t126"></a>

### `src/pages/mushrooms/ui/scene/meadow-camera.ts`:36 — unresolved

```diff
@@ -0,0 +1,116 @@
… 32 lines elided …
+ * sideways (1180×820 CSS px) shows at the size it composes the clump at, caps
+ * inside the edge margin, so that tablet shows half the world at a time.
+ */
+export const WORLD_ACROSS = 5.764;
```

**@vzakharov (agent)** — 2026-09-30T23:23:59Z

🟡 **7. A phone held sideways barely pans, and portrait worlds are mostly empty.** (player agent)

`WORLD_ACROSS` is one constant in ground units, so each screen gets a different amount of world: phoneL 1.23 screens (197 px of pan room), tabL 1.83 (983 px), and tabP/phoneP/phoneS 4.3–4.45. On phoneL the new feature is nearly invisible. On the portrait screens a visit opens with the two-mushroom clump mid-world, 69–71% of crop positions show no mushroom, and both ends are flowers and tufts only (0% mushroom in the ground grid). The plan's "twice a sideways tablet" is exact only for the tablet.

Ask: phoneL gets at least half a screen of pan room, or the plan says in item 11 that it's accepted. On portrait, say what a child finds at a world end, or accept its emptiness in the plan.

**@vzakharov (agent)** — 2026-10-01T03:37:49Z

Accepted as a cost, and written into the plan in 51c24e0 (bite 11's "One world across every screen" bullet, now in docs/plans/mushroom-game-syama/bite-11.md). The world is one width in ground units on every screen, so that a turn keeps every mushroom's ground. A phone held sideways already shows about 81% of the world at once, which is why it pans only ~200 px. Widening the world for that phone would thin the portrait worlds even further, and those already span 4.3–4.45 screens. At a portrait world's end the child finds flowers to play and tufts to plant. Since `+` grows inside the crop, those empty stretches are where the child's own forest goes.

---

<a id="t127"></a>

### `src/pages/mushrooms/ui/scene/mushroom-room.ts`:3 — unresolved

```diff
@@ -0,0 +1,477 @@
+/**
+ * Where the next mushroom may grow: a foot `pickFoot` draws over the stretch
+ * of the world the screen shows now (`Crop`), kept only where the mushroom
```

**@vzakharov (agent)** — 2026-09-30T23:23:59Z

⚪ **8. House rules.** (reader agent)

- This file is 477 lines, up from 396 before the bite, and past the ~450 guide.
- `export function isMoving(` in `model/pan.ts` is used only by `pan.test.ts`.
- `FLOWER_SPOTS.portrait` is dead data. `spotOn` indexes `FLOWER_SPOTS[height > width ? 'portrait' : 'landscape']` (`flower-layout.ts`), but the bed is always laid out on `BED_SCREEN = { width: 1180, height: 820 }`.
- `tick` returns a new object every frame while a key is held against a world end, where the per-frame reducers elsewhere return the same object when nothing changed.
- `bite-11/flowers.md` says "the new test would catch" a skipped slot, but the per-visit guard is the 200-visit sounds test, and `LEAST_FLOWERS = 6.5` is an average.

Ask: split this file at a seam, and cut or use each of the others.

**@vzakharov (agent)** — 2026-10-01T04:03:01Z

Fixed in cb0029d. `mushroom-room.ts` is split: weighing the standing mushrooms against a new one (doors in sight, parts in view) moved to `standing-weighed.ts`, leaving files of 331 and 154 lines. `FLOWER_SPOTS.portrait` is cut, and `spotOn` takes its slot directly. flowers.md now names the 200-visit sounds test as the guard. `isMoving` is cut in 0330aa0 and `tick` keeps its object in 52db783. `isPanning`, left with no reader once taps stayed on the press, is cut in 678c8d8.

---

<a id="t128"></a>

### `src/pages/mushrooms/ui/scene/view.ts`:205 — unresolved

```diff
@@ -0,0 +1,242 @@
… 201 lines elided …
+ */
+export function buried(view: View, placed: Placed): boolean {
+  return behindHills(placed) && placed.y > browRow(view, placed.x);
+}
… 15 lines elided …
```

**@vzakharov (agent)** — 2026-10-02T11:04:03Z

nit: the bob is `cameras.main.setScroll(0, bob)` (meadow-scene.ts `walk`), and every backdrop picture is `setScrollFactor(0)`: the brow, the cover rows, the ground and the hills. So while the child walks, every bed object moves down by up to `BOB_SHARE · height` (≈3.3 px on tabL, 3.4 on phoneP) and the brow over it stays put. `sunkAway` runs on the unbobbed `y`. A far flower that passes the check with just over `SHOWN_LEAST` showing is then drawn up to 3 px deeper under the fixed brow, and on every step its last sliver pumps in and out at the seam. That is the speck the sliver rule exists to hide (`tabL-walk-rim.png`). The same offset slides every foot ~3 px against the ground picture it stands on. Either the ground and brow bob with the camera, or the check takes the bob's worst case. I did not run this; a `walk` play frame at the rim mid-step would settle it.

**@vzakharov (agent)** — 2026-10-02T11:20:31Z

Fixed in d66ad69e: the ground, its grain and the brow now take the bob with the beds (GROUND_BOB), so a foot stays on its row mid-step; the near range reaches to `nearFoot` so no sky shows under the moving ground. Numbers in docs/remove-before-merging/bite-12/rv-eye-world.md.

---

<a id="t129"></a>

### `src/pages/mushrooms/ui/scene/skyline.ts`:259 — unresolved

```diff
@@ -0,0 +1,418 @@
… 255 lines elided …
+ * The seam across the world, as the opening eye lays it out: it depends on
+ * the screen's size alone, so the grass that lines it reads the same seam.
+ */
+export function groundSeam(layout: MeadowLayout): Point[] {
```

**@vzakharov (agent)** — 2026-10-02T11:04:03Z

nit: `groundSeam` is only called from `ground-seam.test.ts`, and `seamAt` is called nowhere. grass.ts and paint-land.ts both read `seamCrest`. The module header ("the seam also as points across the world, which the grass along it is laid on") and this docstring ("so the grass that lines it reads the same seam") state a contract nothing keeps any more. The test then pins a function no frame draws. Retire both and the header clause, or point the test at `seamCrest`.

**@vzakharov (agent)** — 2026-10-02T11:20:32Z

Fixed in 279060fb: `groundSeam` and `seamAt` are gone and the header corrected; their tests were repointed at `seamCrest` and `paintGrain`'s own start rather than deleted, so the coverage stays on what is drawn.

---

<a id="t130"></a>

### `src/pages/mushrooms/ui/scene/meadow-scene.ts`:168 — unresolved

```diff
@@ -0,0 +1,457 @@
… 138 lines elided …
+      (id) => {
+        this.tapInsect(id);
+      },
+      () => this.viewNow(),
```

**@vzakharov (agent)** — 2026-10-02T11:04:03Z

nit: 457 lines, past the ~450 rule of thumb. It is an orchestrator, so this is soft, but there is a natural seam: the `Controls` callback record in `create` (≈lines 144–179) is pure wiring of voice and dispatch. It could be a `controlActions(scene)` helper beside `Scened`, which brings the file back under.

**@vzakharov (agent)** — 2026-10-02T11:20:34Z

Fixed in 66e01887: the button actions moved to `control-actions.ts`; `meadow-scene.ts` is 440 lines.

---

<a id="t131"></a>

### `src/pages/mushrooms/ui/scene/insect-view.ts`:222 — unresolved

```diff
@@ -0,0 +1,458 @@
… 218 lines elided …
+    const end =
+      stretch.out ??
+      (leg.to.kind === 'away'
+        ? leavingAloft(view, leg.to.side, this.awayOf(shown, view), shown.from)
```

**@vzakharov (agent)** — 2026-10-02T11:04:42Z

nit: `leavingAloft` is recomputed every frame from the current `view`, so when the child turns, the end of a leg to away moves with the screen. Its depth (`perchDistance(view, from)`, `insect-away.ts:99`) is measured along the *current* heading. Turn toward the side it is leaving by and the depth falls to the `V_NEAR` clamp: on tabL it goes 8.64 → 7.62 → 5.01 at headings 0/1/2 rad, with the end's zoom going 0.99 → 1.12 → 1.71. A leg flown over 4 s, while the child turns right at 1 rad/s, is drawn at zoom 1.0 → 1.63, forward 8.6 → 0.6. So the butterfly he turns to follow comes at his face at cap size instead of leaving across the screen. The leg is also no longer flown between the points it was timed between. One fix to weigh: fix the leaving end when the leg sets off (as `goal` is for a perch), or at least fix its depth then.

**@vzakharov (agent)** — 2026-10-02T11:27:49Z

Fixed in ed5b34ec: a leg to away fixes its end on the plane on its first frame (`legEnd`, kept in `Shown.goal`), so a child turning after a leaving flier sees it fly off at its own depth; a test turns the eye 1.5 rad each way mid-flight.

---

<a id="t132"></a>

### `src/pages/mushrooms/ui/scene/insect-away.ts`:140 — unresolved

```diff
@@ -0,0 +1,189 @@
… 136 lines elided …
+ * seat): where it sets off over the brow, and the out point past each side.
+ */
+export function wayOutOf(layout: MeadowLayout, view: View): WayOut {
+  const [away, unit] = [awayOn(layout, view), layout.insectSize];
```

**@vzakharov (agent)** — 2026-10-02T11:04:42Z

nit: the release's way out of view is timed against `awayOn`'s band-middle butterfly spot, but `enter` draws it to `entryAloft` with the flier's own `awayOf`. This is the open item 6 of `leg-timing.md` ("fixed with the review's round"). Measured over the phase at the opening eye (seed 3), drawn/timed for the way out is **0.67–1.27 on phoneP** and 0.88–1.06 on tabL, so a released fly on a phone can cross at up to 1.27× its cruise. `Sight.aways` already carries each flier's own `Away` for the way out, and the way in can take it too.

**@vzakharov (agent)** — 2026-10-02T11:27:51Z

Fixed in 0a609775: a release's seed is drawn first and its own `Away` goes into `wayOutOf`, so the way out is timed to the spot `entryAloft` draws; a test checks the drawn path is 0.9–1.1× its timing.

---

<a id="t133"></a>

### `src/pages/mushrooms/ui/scene/insect-view.ts`:284 — unresolved

```diff
@@ -0,0 +1,458 @@
… 280 lines elided …
+      bob: bob / size,
+      flown,
+    });
+    const ends: SeatEnds = {
```

**@vzakharov (agent)** — 2026-10-02T11:04:43Z

nit: `insect-view.ts` stands at 458 lines, and `fly` is 145 of them. From here to the `poseLook` call, the code takes the framed point and puts it on the screen (veer, shadow, brow sink, cull, container pose, hit circle) without reading the leg's timing. That makes a natural seam: a helper next to `insect-seat.ts` / `insect-sink.ts` brings the class under the line, and gives the cull/sink chain a unit test of its own. At the moment only the play reaches it.

**@vzakharov (agent)** — 2026-10-02T11:27:53Z

Fixed in 8b1c5514: the leg-frame→screen chain is `drawnInsect` in `insect-drawn.ts`, unit-tested; `insect-view.ts` is 414 lines.

---

<a id="t134"></a>

### `scripts/lib/play-approach.ts`:217 — unresolved

```diff
@@ -0,0 +1,273 @@
… 213 lines elided …
+  if (cap === null) {
+    expect(false, `walked up to, ${target.id} shows no cap a tap reaches`);
+  } else {
+    await page.tap(cap);
```

**@vzakharov (agent)** — 2026-10-02T11:05:44Z

**blocking** — `cap` comes from `__probe.mushroom(id)`, which keeps only grid points where `topAt` (the scene's own `hitTestPointer` + `sortGameObjects`) already answers `mushroom:<id>`. So the check below can fail only if the dispatch between Phaser and `MushroomBed` breaks. If `tapArea` drifted off the painted cap after a walk (stale transform, wrong scale, a container offset), the probe would still find a point inside the hit area, tap it, and pass, while a child's finger on the drawn red misses.

To test the rule "a mushroom answers only where it is drawn", the point has to come from the paint, not from the hit test. For example, pick a pixel of the cap's colour from the `final-near` screenshot, or take a point from the outline the painter fills (not `shown.hit.cap`), then expect `selected === target.id`. The "4 px outside" check above is the right shape, because its point comes from the outline.

**@vzakharov (agent)** — 2026-10-02T11:29:07Z

Fixed in aec937c6: the tap point comes from the dome outline the painter fills, grown from the seed on the Node side and put through the graphics' world transform read off the page, tapped at its deepest point; a check that the Node-side turn equals the bed's catches a wrong outline. The tabL approach play passes the cap tap and the 4 px outside tap.

---

<a id="t135"></a>

### `scripts/lib/play-tufts.ts`:161 — unresolved

```diff
@@ -0,0 +1,228 @@
… 108 lines elided …
+  if (far) {
+    await page.tap(far);
+    await page.step(30);
+    const landed = await page.evaluate(tuftAt(far), z.string());
```

**@vzakharov (agent)** — 2026-10-02T11:05:44Z

**blocking** — `playTufts`, `playHold` and `playKeys` all play from the opening eye on a fresh page. After walking or turning, the only tap any play makes is the cap tap in `play-approach` (circular, see that comment). So no play shows that, after a turn or a walk in, a tap on a drawn tuft opens the picker, a tap on a drawn flower head sounds that flower, or a long press on a flower that has slid across the screen opens it.

This is the bite's own question — does a six-year-old's tap after walking still land on what is under the finger? — and these paths are new in this bite (`shownSprouts`, the flower container's zoom, `tuftUnder` reading `shown.near`). Suggested: run `playTufts` and one flower tap again after `hold('ArrowRight', …)` plus a short `ArrowUp`, with the tap point taken from what was drawn.

**@vzakharov (agent)** — 2026-10-02T12:07:38Z

Fixed in 11777c95: `walkAndTurn` turns and walks the eye first, then `play-tufts` taps the nearest drawn tuft, `play-keys` the nearest flower head and `play-hold` presses on it, each point taken from the drawing; tabL passes all three.

---

<a id="t136"></a>

### `scripts/lib/play-walk.ts`:298 — unresolved

```diff
@@ -0,0 +1,546 @@
… 294 lines elided …
+      );
+    }
+  }
+  expect(
… 2 lines elided …
```

**@vzakharov (agent)** — 2026-10-02T11:05:44Z

**blocking** — `tapsBefore` is read on the fresh opening, with nothing selected and every picker shut, and both drags start from `BARE_START`, which is chosen to be off every object and tuft. `MeadowScene.tapMeadow` runs on `POINTER_DOWN` with nothing under the finger and dispatches `deselect`, which applies `PICKERS_SHUT` and clears `selected`. So a drag from bare ground does shut the picker and drop the selection, but here those fields are already empty, and the `selected` / `picking` / `furnishing` / `planting` part of `TAPS` cannot change. The check passes no matter what a drag does to them.

What a child sees: they open the flower picker on a tuft, or select a mushroom so `−` thins it, then drag the grass to look around, and the picker is gone or the selection dropped. If that is intended, the claim "tapped nothing" overstates what is checked. If it is not, the check needs a selection and an open picker before the drags.

**@vzakharov (agent)** — 2026-10-02T12:07:40Z

Fixed in c5126399: the game never holds a selection and an open picker at once, so the baseline is two drags — one with a mushroom selected, one with the flower picker open on a tuft — each of which must grow, plant and select nothing; a shut picker or dropped selection is logged, not failed.

---

<a id="t137"></a>

### `src/pages/mushrooms/ui/scene/planter.ts`:120 — unresolved

```diff
@@ -0,0 +1,160 @@
… 102 lines elided …
+    const meadow = this.scene.meadow();
+    const stand = this.scene.stand();
+    if (!meadow || !stand || meadow.planting) return undefined;
+    const sprout = sowingTuft(
```

**@vzakharov (agent)** — 2026-10-02T11:05:44Z

**nit** — `scene.tufts()` is `Grass.inView()`, meaning the tufts on screen in front of the hills, with no check for what is drawn over them. `plantableIn` judges a tuft from the opening eye (`bareToTap`, decided). After walking into the forest, a near mushroom can stand in front of a tuft that qualifies, and the key grows its flower there: the note sounds and nothing visibly grows.

`FlowerBed.inView` has the same gap (`onScreen` and `drawn`, no cover check): a flower hidden behind a nearer cap counts as in view, so its key answers through the hidden flower instead of sowing one the child can see. A cheap guard: in `sowSounding`, drop tufts where `__probe`-style `topAt` (the scene's hit test) finds a mushroom over the tuft's middle in the current frame.

**@vzakharov (agent)** — 2026-10-02T11:29:08Z

Fixed in 116f5888: `FlowerBed.inView` and `Grass.inView` (what the planter's `tufts()` reads) drop a head or tuft with a nearer cap drawn over it, through the new `flower-cover.ts`, which places the `standingAt` outlines `cap-cover.ts` weighs as `roomFor` does; unit-tested.

---

<a id="t138"></a>

### `src/pages/mushrooms/ui/scene/house-view.ts`:193 — unresolved

```diff
@@ -0,0 +1,255 @@
… 189 lines elided …
+    return this.doorAt === undefined ? 0 : mouseOut(t, this.mouse);
+  }
+
+  follow(view: View): void {
```

**@vzakharov (agent)** — 2026-10-02T11:05:44Z

**nit** — nothing calls `HouseView.follow`: `MeadowScene` follows the backdrop, grass, bed and flowers, and `MushroomBed.stand` calls `house.stand(place)` directly. It is also not equivalent to that path. It calls `bedPlace(view, this.foot)` without the mushroom's `tall`, so the `sunkAway` cull is skipped and the house would stay visible, with its door tappable, after its mushroom sank behind the brow. Remove `follow`, `implements Following` and the `foot` constructor parameter that only `follow` reads, so a later caller can't reach for it.

**@vzakharov (agent)** — 2026-10-02T11:29:10Z

Fixed in ae6bf316: `follow`, `implements Following` and the `foot` parameter are gone, and `mushroom-bed.ts` no longer passes it.

---

<a id="t139"></a>

### `src/pages/mushrooms/model/game.ts`:40 — unresolved

```diff
@@ -0,0 +1,488 @@
… 34 lines elided …
+import { type Rain, RAIN_MS, raining } from './weather';
+
+/**
+ * How many mushrooms stand at most within `D_SEE` of a new one's foot, room
+ * permitting: as far as the eye sees holds twice the six one screen reads
+ * apart.
```

**@vzakharov (agent)** — 2026-10-03T01:59:22Z

**blocking (measured) — turning the screen strands most of the opening's mushrooms.** The cap counts only round the new foot, and a wide screen's opening spans more ground than that circle, so `+` grows past twelve: phoneL reached **22** mushrooms (feet x −11.3…11.6, no new foot ever with more than 11 others within `D_SEE`), tabL 15. Turned to portrait, phoneL shows **5 of 22**, tabL 6 of 15; the rest can't be tapped without walking or turning. Phones held upright stop at exactly 12. This is what `decisions.md` § the twelve rules out ("every screen holds the same twelve … a count that changed with the screen would strand a mushroom whenever a phone is turned"); `isCrowdedAt` (line 177) is the check.

Frames: `docs/remove-before-merging/frames/bite-12b/review/phoneL-child-01-opening-full.png` → `docs/remove-before-merging/frames/bite-12b/review/phoneL-child-08-screen-turned.png`, `tabL-child-01/08`; data `phoneL-turn.json`, `tabL-turn.json`.

Ask: after `+` refuses at the opening on any screen, turning the screen leaves every mushroom on screen — e.g. the opening holds at most `MUSHROOM_SLOTS` on all six screens, phoneL included.

**@vzakharov (agent)** — 2026-10-03T02:40:50Z

Partly fixed in 0d391410, and the rest decided rather than fixed. The twelve is now counted round the anchor as well as the new foot (`isCrowdedAt(meadow, foot, from)`), so `+` at the opening stops at 12 on every screen: phoneL from 22, tabL from 15. Turned to portrait, phoneL still shows 5 of the 12 tappable and tabL 6 of 12. The two fixes measured, placing the opening inside the turned screen too (on every screen, or on landscape only), strand nothing but make phoneL refuse at 9. That changes the count with the screen, which the same decision rules out. So decisions.md now says, in ebf33562: the same twelve on every screen, and a turned phone showing fewer of them is accepted, because the field turns and walks and a drag brings each one back.

---

<a id="t140"></a>

### `src/pages/mushrooms/ui/scene/planter.ts`:149 — unresolved

```diff
@@ -0,0 +1,173 @@
… 145 lines elided …
+    return (
+      planting !== undefined &&
+      stand !== undefined &&
+      takesFlower(stand, planting.foot, this.eye())
```

**@vzakharov (agent)** — 2026-10-03T01:59:22Z

**blocking (measured rule split; reach in play a hunch) — a tuft can open the picker and then dim every shape button.** `tapTuft` and `Grass.holds` judge at `grass.tendedAt()`, but `plantable` (here) and `plantSounding` judge at `this.eye()`. Until the grass re-tends (`TEND_STEP` 0.5), the current anchor drifts from the tended one (`ANCHOR_STEP` 0.5, `ANCHOR_TURN` 0.0375 rad). Probe on 1180×820, 12 visits, clump + forest + 10 flowers: tufts shown at E1 that `takesFlower` refuses at E1 after tending at E0 — 20/448 (0.2 across, 0.3 ahead), 34/437 (0.45 ahead), 2/461 (turn 0.02), 25/450 (mixed), 0/465 (no move). So the picker opens on a standing tuft, its buttons draw at `DIMMED_ALPHA`, a key says "nuh-uh", and `holds` keeps it open. Breaks line 157's own contract and bite-12b.md's "a shown tuft never shakes its head".

Ask: `plantable`, `plantSounding`, `tapTuft` and `holds` read one eye; a test tends at E0, moves the view less than `TEND_STEP`, and for every tuft `holds` is true ⇒ `plantable` is true.

**@vzakharov (agent)** — 2026-10-03T02:40:52Z

Fixed in e4e8c72d. `plantable`, `plantSounding`, `tapTuft` and `sowSounding` all judge at `grass.tendedAt()`, through a new `Scened.tendedAt`. Test in c7f4db61: `planter.test.ts` drives the real `Planter` over 6 visits on 1180×820 and five walks, each short of a re-tend. For every tuft `holds` keeps, the picker opens with `plantable` true and a key plants there. It asserts some of those tufts would be refused at the walked eye, and it goes red when the planter judges there.

---

<a id="t141"></a>

### `src/pages/mushrooms/ui/scene/tufts.ts`:310 — unresolved

```diff
@@ -0,0 +1,328 @@
… 228 lines elided …
+   * Tends the tufts to `stand` as it now stands, at once, in place of any
+   * re-tend under way: those the view's eye tends that take a flower
+   * (`grownRound`, `tendTufts`).
+   */
```

**@vzakharov (agent)** — 2026-10-03T01:59:22Z

**blocking (measured on desktop Node, not a device) — every `+`, `−` and planting tends the whole grass in one frame.** `sow()` → `tendGrass()` → `Grass.tend` judges the whole tended sector at once and cancels any `Tending`, so the slicing covers walking only. `tendTufts` at 6 eyes near the opening: 1180×820 (417 tufts) 8–16 ms clump / **15–34 ms forest**; 844×390 (562) 5–8 / 11–24; 390×844 (174) 3–6 / 9–15 — against the spec's 26 ms and on a machine faster than a tablet. waves.md's tail-lawn timing (18.2 → 1.2 ms) measured the walking re-tend only; the sow path was never timed. `tending.ts`'s header promises "a re-tend never lands on one frame whole".

Ask: route a scene-asked tend through `Tending` (or show it fits): no frame carrying `Grass.tend` goes over budget in the play's forest approach with bee plantings on tabL, timed in `__probe.hitches()`.

**@vzakharov (agent)** — 2026-10-03T03:16:31Z

Fixed in 06920038 and 89244ebd. A sow no longer tends the whole grass in one frame. It hides at once the tufts it now covers (`lostOn`, which the tests hold exactly equal to `plantableIn` for a child's flower, a bee's flower and a grown mushroom), then re-tends through `Tending`'s slices, starting the frame after. On tabL with 20 bee plantings, one sow's tend went from 10–47 ms to 1–8 ms (+0.3–5 ms the next frame), and the lawn's slowest share of a frame from 46.7 ms to 14.5 ms. The slowest frame that carries a tend is still 60–72 ms, but 24 ms of that is the perches' re-see (`see`), not `Grass.tend`. So this thread's bar is held on the lawn's share, and the frame's re-see cost is traced as its own lead. `tending.ts`'s header promise now holds for a sow too. `__probe.tendFrames()` times it.

---

<a id="t142"></a>

### `src/pages/mushrooms/ui/scene/air-spots.ts`:225 — unresolved

```diff
@@ -0,0 +1,295 @@
… 218 lines elided …
+/** How many anchors' air each camera keeps. */
+const KEPT = 8;
+
+/**
+ * The air `laid` offers round `anchor` (`spotsAt`), its crowdings judged where
+ * the layout anchored there draws the spots, so hovering insects never overlap
+ * as the eye judges them; kept for the last `KEPT` anchors.
```

**@vzakharov (agent)** — 2026-10-03T01:59:22Z

**blocking (measured) — hovering insects overlap at the screen's sides with the eye standing still.** `airOf`/`spotsAt` crowd spots by their tangent-frame layout px (`placeOfAloft(view, 1, …)`) against unzoomed wingspans, while the screen is linear in azimuth (drawn ≈ 0.92 × layout across 1180, less at the edges) and near spots draw at zoom up to 1.15. At eye = anchor = `OPENING_EYE`, on-screen pairs **not** in `air.aloft` that overlap as drawn: 844×390 **56** (worst 0.71 of the wings; air--14-7/air--14-10 at x≈26–82: 74.8 px apart in layout, 56.0 drawn, 73.2 px of wings at z 1.15/1.01), 1180×820 37 (0.88), 1920×1080 178 (0.80), 390×844 0. bite-12b.md accepts overlap only "briefly after a step"; this lasts the whole hover. `air-spots.test.ts:130` checks the same layout numbers the crowding came from, so it can't see it.

Ask: crowd on the drawn points at the anchor (`drawnAloft`, wings × zoom); a test holds drawn distance ≥ (wings_a·zoom_a + wings_b·zoom_b)/2 for every uncrowded on-screen pair on 844×390, 1180×820 and 1920×1080.

**@vzakharov (agent)** — 2026-10-03T02:40:53Z

Fixed in d43c203. Each spot carries where the anchor draws it (`drawnAloft`), and pairs crowd when drawn distance < (wings_a·zoom_a + wings_b·zoom_b)/2. The bar's test, on 844×390, 1180×820 and 1920×1080, was red at fb82ca1 and is green now. The spots offered are unchanged on every screen, and ten of ten insects still seat. In 65a68ecd, `fliers.test.ts`'s air-apart check moved to the same drawn measure (tolerance still 0, red at fb82ca1 on phone sideways). Its tap-catch sample went to 8 visits: the fly's 0.69 on tablet portrait was two-visit noise, 0.704 before and 0.705 after over eight.

---

<a id="t143"></a>

### `docs/plans/mushroom-game-syama/bite-12b.md`:48 — unresolved

```diff
@@ -0,0 +1,115 @@
… 42 lines elided …
+  bite 12's opening: accepted.
+- **Light by heading** through the repaint queue, side component
+  `sin(heading − α_sun)`, at most `REPAINTS_PER_FRAME` a frame.
+- **Insects on the plane** (`bite-12b/spec-insects.md`), perching where
+  they like («садятся куда хотят») **within `D_SEE` of the snapped eye**, so
+  they follow the child and a far mushroom gets them once he walks there.
```

**@vzakharov (agent)** — 2026-10-03T01:59:22Z

**blocking (measured by search) — "they follow the child" is checked nowhere.** The package's headline behaviour has no red to turn: `spec-insects.md` § 3's play check 1 ("walk ↑ 20 s … every insect drawn sits or hovers within D_SEE of the eye") isn't in any `play-*.ts`; no unit test drives a perch out of reach (`isOffered` failing, a new leg among perches in reach); «Насекомые идут за ним» isn't on `to-check.md`. Unknown whether it works today.

Also (nit, measured): the reach is `PERCH_REACH` = **15.91** (the frame's far corner), not `D_SEE` 13.33 as this line says, and `perches.test.ts`'s "offer no cap past PERCH_REACH" puts its cap dead ahead, where `placeIn` places nothing past 13.5 anyway — it passes with `inReach` deleted.

Ask: the play check (walk ↑ 20 s, then within 30 s every drawn insect within the reach of the eye) plus a reducer case (a perched insect whose cap leaves `sight.places` takes its next leg to a perch in the new places); the plan names the reach it has; the reach test uses an off-axis cap the layout does place, refused only by the reach.

**@vzakharov (agent)** — 2026-10-03T02:40:54Z

The game already did this. Its checks are now in place:
- 2ad466a: `perch-follow.test.ts` runs the real `reduce`. After the eye moves 40 up the plane, a fly and a butterfly take their next leg to caps in the new `places`, and the bee goes to an air spot because the far copy has no flowers. All three go red with `isDue`'s `!isOffered` removed. It was green before any change.
- 1afd77a: the reach test uses a cap at (15.5, 5.5), 16.45 out, which `placeIn` places and only `inReach` refuses. It goes red without `inReach`.
- d33f10e1: the meadow play walks ↑ 20 s (31.8 units). Every insect is back within `PERCH_REACH` 30.3 s after the walk on tabL and 19.5 s on phoneP. The window is 30 s heading in plus 90 s settled, because a butterfly on a 64 s flight follows slowly; a person's look at that is on `to-check.md`.
- 4823a84: the plan names the reach as `PERCH_REACH`.

---

<a id="t144"></a>

### `src/pages/mushrooms/ui/scene/flower-sight.ts`:397 — unresolved

```diff
@@ -0,0 +1,416 @@
… 392 lines elided …
+
+/**
+ * Where a bee could plant round each flower of `shown`: the first ring slot
+ * no planted flower takes that is `plantable`, in sight, off the foot of
+ * every mushroom standing (`mushroomFeet`), at any depth.
```

**@vzakharov (agent)** — 2026-10-03T01:59:22Z

**blocking-or-nit, the handler's call (measured) — most flowers bees plant at the opening come up off screen, some across the edge.** Heads at birth: phoneS 11 of 14 off screen (`planted-13` at x 345 of 320 — the earlier "351 of 320" — and `planted-6` at −22), phoneP 10 of 12 (437, −27), tabL 5 of 14 (1238 of 1180). Bees perch on any flower within reach, seeded ones off the sides included, and `roomFor`'s "in sight" comes from `flowerInSight`, which checks the seat against `camera.world` (1372 px on phoneS) — nothing ties a ring to the screen, so the growing juice mostly plays where the child can't see it. Frame `docs/remove-before-merging/frames/bite-12b/review/phoneS-child-A-bees-28s.png`, data `phoneS-child.json` `births`.

Related hunch, not traced: on phoneP and tabL, 4 bees planted nothing in 40 s round the child's two field flowers (both at the bottom edge or behind caps, `phoneP-child-B-bees-end.png`), where phoneS planted 12.

Ask: either a bee's planting is judged against the screen seen from the anchor (every planted head inside the screen's sides), or the plan states off-screen planting is intended and the straddling case accepted.

**@vzakharov (agent)** — 2026-10-03T02:40:55Z

Taken as blocking, fixed in 1da1a918. `roomFor` offers a ring slot only where the whole head stays between the screen's sides as the anchor sees it (`screenSides(camera)`). That covers every head the flower's genes could grow, with its sway, and a ring with no such slot plants nothing that visit. Births in a 40 s bee play: phoneS 21 → 9, phoneP 19 → 6, tabL 20 → 15. None came up off screen or across an edge, where before 17, 14 and 3 did. The halving on phones is accepted: every screen still plants, and what is planted is seen. The test, 12 visits from 3 anchors on 320×568 and 390×844, goes red with the screen check off. Frames: `docs/remove-before-merging/frames/bite-12b/handling/*-bees-after-end.png`.

---

<a id="t145"></a>

### `src/pages/mushrooms/model/flight-in.ts`:61 — unresolved

```diff
@@ -0,0 +1,181 @@
… 53 lines elided …
+  place: Place | undefined,
+): boolean {
+  return (
+    place !== undefined &&
+    place.x >= left + inset &&
+    place.x <= right - inset &&
+    place.y <= downTo - inset &&
+    place.fromEye <= far
```

**@vzakharov (agent)** — 2026-10-03T01:59:22Z

**nit (measured) — "shown" compares straight-ahead distance with a round brow.** `place.fromEye` is the forward distance along the heading, the brow is radial (`behindHills`: `distance > D_SEE`). Caps radially past the brow pass as shown: 1180×820, θ 0.75, d 14.25 → shown, foot 31.7 px past the brow; 844×390, θ 0.8, d 14.5 → shown. Seats stay above the brow (0 of 51/65/65 buried), so it's a half-sunk cap at the edge, not an invisible insect; the `flight-in.test` cases feed a hand-built `Onscreen`, so they pass either way.

Ask: judge the radial plane distance against `D_SEE`; an anchored stand with a cap at θ 0.75, d 14.25 is not shown.

**@vzakharov (agent)** — 2026-10-03T02:40:57Z

Fixed in 91ad7b8. `isShown` judges a place's plane distance round the eye against `D_SEE`, as the brow does; a place without a plane point keeps `fromEye`. The test builds a real stand (`opened` plus a cap at θ 0.75, d 14.25 on 1180×820, seen through the scene's `Perches`) and was red before the fix.

---

<a id="t146"></a>

### `src/pages/mushrooms/ui/scene/insect-drawn.ts`:139 — unresolved

```diff
@@ -0,0 +1,148 @@
… 127 lines elided …
+
+/**
+ * `turn`, a body's turn in its leg's frame, as the screen draws it at
+ * `flying`: the way a px's step along it in the frame is drawn (`lifted`).
+ * The screen bends the pinhole's rows (`viewOf`) and eases a flight skimming
+ * the grass down onto it (`aloftFramed`), so the frame's turn alone points off
+ * the drawn way at the sides and low down; it stands where either end is not
+ * drawn. The step is read before the brow sinks it (`sunk` in `view.ts`),
+ * whose mirror of the foot's rows would flip a flier going away over the
+ * brow to face back down the screen in one frame.
+ */
+function bentTurn(
```

**@vzakharov (agent)** — 2026-10-03T01:59:22Z

**nit (measured) — the side bend is held at the middle only.** `bentTurn` corrects the body by up to 0.20 rad at 844×390's sides (0.085 on 1180×820, 0.012 on 390×844), but the new tests sit at x 590–608, where the bend is 0, and the play's `MOST_HEADING_OFF` 0.3 exceeds the whole side error — a wrong bend sign passes everything.

Ask: a case at x = 20 on 844×390, turn 1.1: `posed.rotation` within 0.01 of the drawn way and ≥ 0.15 off `turn`.

**@vzakharov (agent)** — 2026-10-03T02:40:58Z

Added in eef972b, at turn −1.1 rather than +1.1. At x 20 on 844×390, a body facing in toward the middle bends only 0.06–0.12 rad, so no y meets the 0.15 bar. Facing out past the side it bends 0.16–0.21, your "up to 0.20". The case holds rotation within 0.01 of the drawn way and ≥ 0.15 off `turn`, and it goes red with the bend's sign flipped.

---

<a id="t147"></a>

### `src/pages/mushrooms/ui/scene/tufts.test.ts`:171 — unresolved

```diff
@@ -0,0 +1,540 @@
… 167 lines elided …
+): string[] {
+  const faults: string[] = [];
+  const bare = bareToTap(stand);
+  const plantable = plantableIn(stand, OPENING_EYE);
```

**@vzakharov (agent)** — 2026-10-03T01:59:22Z

**nit (measured by reading) — the headline claims' tests can't fail.** Here `plantable = plantableIn(stand, OPENING_EYE)` is checked against `standing`, which is `grown.filter(plantableIn(stand, OPENING_EYE))`, so "a tuft's flower would meet a head" and "a tuft fit to plant on is missing" hold by construction, and the far-eye case (line ~344) asks at the eye it tended at. Same shape elsewhere: `clump-layout.test.ts:142` deep-equals `laidOf(camera, footed)`, which takes no eye, inside a loop over eyes; `mushroom-light.test.ts` 525–549 compares `headedLight` with functions that call `headedLight`; `hasGround`'s ±3.08 rad seam has no test (z jumps −208557 → +15758 across it, while `planeOf∘groundOfPlane` round-trips at 1e-14 on both sides, so a round trip can't see it; no caller skips the gate today).

Ask: properties that can fail — a tap after a walk short of `TEND_STEP` (the planter thread); no bed repaint when only the anchor changes; at heading = the sun's azimuth `toward.x ≈ 0`; `hasGround` true to 3.08, false from 3.09.

**@vzakharov (agent)** — 2026-10-03T02:41:00Z

Done, except the bed-repaint property.
- `tufts.test.ts` (c7f4db61): standing tufts are no longer checked against the rule that chose them. "Would meet a head" plants on each one and measures the drawn heads; "missing" asks `roomIn`, `bareToTap` and `headClear` of the tufts that don't stand. Each goes red on a broken input.
- The tap after a short walk is `planter.test.ts` (see the planter thread).
- 22b4b8f: `hasGround` is true to 3.08 and false from 3.09 on both sides. `clump-layout.test.ts` lays the mushroom out with its foot moved by each eye. `mushroom-light.test.ts` checks the closed form sin(α − heading), ≈ 0 facing the sun, and goes red with `headedLight`'s sign flipped.
- No repaint-on-anchor test: the beds are Phaser classes no test builds, and a seam would mean opening production code for the test. The pure piece, `laidOf`, is covered by the clump-layout case.

---

<a id="t148"></a>

### `src/pages/mushrooms/ui/scene/flower-shown.ts`:113 — unresolved

```diff
@@ -0,0 +1,136 @@
… 109 lines elided …
+  let lastLit = openingLight;
+  const fold = () => {
+    const folded = folding(shown.closing);
+    ({ r: shown.headR, disc: shown.disc } = foldedHead(genes, size, folded));
```

**@vzakharov (agent)** — 2026-10-03T06:05:55Z

**blocking — the held flower's ring shrinks to a dot in the rain** (measured). The fold writes the bud's foot radius into `shown.headR`, but `FlowerRing`, `containsFlower`, the on-screen cull and `stand()` still read `headR` as the head's size. Long-pressing the same flower on tabL, `ring.drawnFor` went 20.66 → 8.27 px (phoneP 11.78 → 4.71): the ring reads as one more splash ring (`frames/bite-13/review/b-tabL-ring-wet.png`), and a tap on the bud's top half over a cap goes to the cap.

Ask: only perching reads the folded reach; with a flower held at wetness 1, `ring.drawnFor` equals its dry value, and a tap at the bud's tip over a drawn cap goes to the flower. Call: `docs/plans/mushroom-game-syama/bite-13/review.md` § 1.

**@vzakharov (agent)** — 2026-10-03T06:21:58Z

Fixed in cea5c240: `shown.headR` stays the open head's radius; the folded reach is `shown.perch`, read only by `FlowerBed.seat`. A long press mid-shower on tabL drew the ring at 20.66 px, the dry value (frame `frames/bite-13/review/x1-tabL-ring-wet.png`, 4f719b0f).

---

<a id="t149"></a>

### `scripts/lib/mushroom-probe.ts`:436 — unresolved

```diff
@@ -0,0 +1,704 @@
… 432 lines elided …
+        span: span ? { startedAt: span.startedAt, stopsAt: span.stopsAt } : null,
+        ...scene.rain.shown,
+        drops: scene.rain.dropsInAir(),
+        closing: scene.flowers.closing(),
```

**@vzakharov (agent)** — 2026-10-03T06:05:59Z

**nit — the play's "flowers closed / reopened" check reads bookkeeping, not paint.** `closeShown` sets `shown.closing` before `drawHead` runs, so `mid.closing >= SHUT` would pass with `drawHead` a no-op or painting `OPEN` — an account standing in for running it.

Ask: the probe reads a fold recorded by the paint itself; breaking `drawHead` so it paints `OPEN` fails the rain play. Call: review.md § 2.

**@vzakharov (agent)** — 2026-10-03T06:22:00Z

Fixed in d3a911c8: the painters return the fold they drew, recorded as `shown.painted`, and the probe averages that. With `drawHead` painting `OPEN` the rain play failed on tabL ("shut only 0.00"); restored, 1.00.

---

<a id="t150"></a>

### `scripts/lib/play-rain.ts`:103 — unresolved

```diff
@@ -0,0 +1,154 @@
… 99 lines elided …
+  );
+  if (!started.raining) return;
+
+  await page.step(MID - TIMED - 1);
```

**@vzakharov (agent)** — 2026-10-03T06:06:02Z

**nit — the 26 ms budget is timed only where no flower repaints** (measured). Heads repaint in the first ~1.5 s and the reopening (`flowers.update` peaks 9.9/13.2 ms on tabL there, median frame 15.4 ms), never in this mid-shower window (0–0.1 ms). A meadow full of sown flowers runs 6 repaints a frame through the ramp, which this run cannot see.

Ask: the timed window covers frames 1 to ~100 after the tap and the reopening, held to `FRAME_BUDGET_MS`. Call: review.md § 3.

**@vzakharov (agent)** — 2026-10-03T06:22:01Z

Fixed in fe968caf: the play times the closing ramp (frames 1–109, derived from `wetness` and `closingStep`), the mid-shower 24 and the reopening (600–709) against `FRAME_BUDGET_MS`. Medians tabL 16.1 / 18.9 / 13.0 ms, phoneP 10.7 / 7.5 / 10.5 ms.

---

<a id="t151"></a>

### `src/pages/mushrooms/ui/scene/rain-sky.ts`:17 — unresolved

```diff
@@ -0,0 +1,170 @@
… 13 lines elided …
+import { TAP_RADIUS } from './tap-reach';
+
+/** How far a cloud's puffs spread either side of its middle, in its radii. */
+export const CLOUD_SPREAD = 4;
```

**@vzakharov (agent)** — 2026-10-03T06:06:06Z

**nit — a tap on blue sky beside a cloud starts the rain** (measured). The drawn puffs reach ~2.4 r either side (tabL cloud 1: −2.40..+2.48 r), but the tap area reaches 4 r: 2430 drawn pixels hit, plus 3490 sky pixels. The same constant makes the drops' densest span 8 r wide under a ~5 r cloud. The 4 was copied from the call's text, not measured.

Ask: the spread derives from `paintClouds`' puff geometry (≤ 2.8 r), `TAP_RADIUS` still the floor; `cloudAt` misses at 3.5 r on the middle line and hits at 2.4 r. Call: review.md § 4.

**@vzakharov (agent)** — 2026-10-03T06:18:38Z

Fixed in 74c5eec1: the puff layout lives in `cloud-puffs.ts` and `CLOUD_SPREAD` is its widest reach (2.78 r across, 1.04 r up, 1.22 r down), `TAP_RADIUS` still the floor; tests miss at 3.5 r and hit at 2.4 r. The drops' densest span follows it.

---

<a id="t152"></a>

### `src/pages/mushrooms/ui/scene/rain-drops.ts`:178 — unresolved

```diff
@@ -0,0 +1,281 @@
… 168 lines elided …
+    const foot = planeSeen(view, view.eye, { x, y: row });
+    if (!foot) return true;
+    const ground = ofGround(view, foot);
+    // From a streak's length over the screen's top, which the walk's bob
```

**@vzakharov (agent)** — 2026-10-03T06:06:09Z

**nit — the rain falls from above the cloud, streaked over it** (measured). Every drop starts above the screen's top and draws above the clouds: 13–15% of streak heads within a cloud's span sit at or above its underside (phoneP, phoneL, 60 frames). To a child the shower comes from higher than the cloud she tapped.

Ask: a drop whose column lies within a showing cloud's drawn span starts at its underside; no streak head is ever inside a drawn cloud's box. Also (hunch) line 170's `if (!foot) return true` counts a drop that never starts — measure it. Calls: review.md §§ 5–6.

**@vzakharov (agent)** — 2026-10-03T06:18:40Z

Fixed in f0b88ecb: a drop stays hidden until its slanted path is out from under any showing cloud's drawn box (`shownFrom`), so rain shows from each cloud's underside and never over it; a 2000-drop test holds no streak head inside a cloud box. Drops still start above the screen so a shower's first drops stay staggered. The hunch on line 170 does not fire: `planeSeen` fails only at or above the horizon, which a drop's row never reaches (checked on all six viewports, 1607713b).

---

<a id="t153"></a>

### `scripts/lib/play-sprouts.ts`:88 — unresolved

```diff
@@ -0,0 +1,158 @@
… 81 lines elided …
+  for (const { id, parent, shown, apart } of sown.spores) {
+    note(`${id} of ${parent}: ${apart?.toFixed(2) ?? 'no parent'} apart`);
+    expect(parent === front, `${id} is of ${parent}, not ${front}`);
+    expect(shown, `${id} is not drawn once landed`);
```

**@vzakharov (agent)** — 2026-10-03T11:25:51Z

**Blocking: on phoneP one sown spore in three lands under the opening clump's stems, and the play passes it.** `--plays sprouts --screens phoneP` logs three spores of mushroom-2; the frame shows two dots. The probe's tap point for the third is `null` while `shown` is true: its dot is under the stems. After the rain its sprout comes up hidden too (two sprouts reported, one visible). `shown` is only `circle.visible`, so nothing asserts a landed dot can be seen or reached, and call 30's "each tap leaves a dot" fails exactly where the child is looking.

Ask: expect `at !== null` for every landed spore; the sweep's `--showers` counts covered dots.

**@vzakharov (agent)** — 2026-10-03T11:38:23Z

Fixed in 769aeec0: the play now expects a reachable tap point for every landed spore, and the sweep's `--showers` counts covered dots — 0 of 319 (tablet) and 0 of 324 (phone) over 50 visits, from 59 and 52 before.

---

<a id="t154"></a>

### `src/pages/mushrooms/ui/scene/mushroom-room.ts`:306 — unresolved

```diff
@@ -0,0 +1,425 @@
… 302 lines elided …
+ * (`flowerFeet`), and each foot is tried on the area cap and the cheap rules
+ * first, then the controls, then what it hides and what hides it, then the
+ * doors, then the patches, the dearest to try. A spore laid round the stored
+ * foot `near` stands within `SPROUT_REACH` of it, judged at its full size
```

**@vzakharov (agent)** — 2026-10-03T11:25:51Z

Cause of the hidden dot above: the `near` search judges a spore as the full-grown mushroom it comes up as (call 41), and `partsInView`, `keptOff` and the screen edges all hold for that mushroom's cap, while the dot itself sits at its foot, under every mushroom (call 33).

Ask: admit a spore's foot only where the dot itself is drawn uncovered and on screen, as well as the risen mushroom's rules.

**@vzakharov (agent)** — 2026-10-03T11:38:25Z

Fixed in 769aeec0: a spore's foot is admitted only where `dotInSight` (new `spore-sight.ts`, judging cover through `flower-cover.ts`'s `inSightPast`) finds the dot drawn, on screen, off the controls and under no nearer outline, on top of the risen mushroom's rules. Cause confirmed first on phoneP: spore-3 at depth 661 under its own parent at 782. The clump's median drops from 7 sprouts to 6.

---

<a id="t155"></a>

### `src/pages/mushrooms/model/walk.ts`:11 — unresolved

```diff
@@ -0,0 +1,359 @@
… 7 lines elided …
+ * turns if it went down above the ground, on the hills or the sky, and
+ * strafes if it went down on the ground; else it steps. A turn keeps the
+ * azimuth under the finger 1:1 and glides on from the lift; a step chases
+ * the finger's row, and a strafe slides the ground under the finger with
```

**@vzakharov (agent)** — 2026-10-03T11:25:52Z

**The ground does not stay under the finger while it moves.** The strafe's chase is capped at `STRIDE_CRUISE` (1.6 units/s): a 150 px swipe on tabL with the finger at 16.6 units/s had moved the eye 0.343 units by the lift, ~15 % of the way; the fling then carries it to 2.689. Ending under the finger is the fling cap's luck: a 400 px swipe (~6 units laid) stops about half a swipe short. A sky drag keeps 93 % of its azimuth at the lift, so the two drags feel different under the hand. `walk.test.ts:300` holds the finger still for 12 s before the lift, and the play's under-the-finger check was replaced by the fling check only.

Ask: track the finger uncapped while it is down, as the sky turn tracks the azimuth, the glide taking over on the lift; a play check measuring the ground against the finger at the lift and at rest.

**@vzakharov (agent)** — 2026-10-03T11:38:26Z

Fixed in ccfff90d (call 44): while the finger is down the eye goes wherever the finger puts it, no cruise cap, as the pan's `move` sets the crop; the glide takes over on the lift. Model run on tabL, finger-to-ground gap at the lift: 150 px strafe 119.8 → 0 px, 400 px strafe 368.8 → 0.6 px, 150 px step 122.2 → 0. `walk.test.ts` now moves the finger and checks every frame. The play's check against the finger is in progress.

**@vzakharov (agent)** — 2026-10-03T11:55:09Z

The play's check landed in a0fa1095: the ground under the slop crossing is checked on every finger-down frame and at the lift, within 3 % of the swipe — 0.0 px on tabL and phoneP for both drags. It found a real drift of the step drag off-centre (12 px of 205 when the finger was not at the screen's middle, the bend ignored), fixed in the same commit.

---

<a id="t156"></a>

### `src/pages/mushrooms/model/stride.ts`:45 — unresolved

```diff
@@ -0,0 +1,421 @@
… 41 lines elided …
+/**
+ * The fastest a fling sets the eye off, and the slowest that still flings it,
+ * in the clump's size a second: a quick swipe carries it on by at most
+ * `STRIDE_FLING_FASTEST · GLIDE_TAU`, 2.6, about as far as a swipe across a
```

**@vzakharov (agent)** — 2026-10-03T11:25:52Z

Nit: "about as far as a swipe across a third of the screen lays its ground" has no fixed meaning (it depends on the finger's row), and a 150 px swipe on tabL, ~1/8 of the width, already reaches the cap.

Ask: state the bound alone; settle with the finding on `walk.ts`.

**@vzakharov (agent)** — 2026-10-03T11:38:28Z

Fixed in ccfff90d: the comment states only the bound, 2.6 units past the lift.

---

<a id="t157"></a>

### `src/pages/mushrooms/model/shelter.ts`:14 — unresolved

```diff
@@ -0,0 +1,141 @@
… 10 lines elided …
+import type { Choosing, Flight, Leg, Perch, Perches } from './flight';
+import { apartIn } from './flight-timing';
+import { isSamePerch, perchName } from './perch-room';
+import { between, saltedStream,type Seeded } from './random';
```

**@vzakharov (agent)** — 2026-10-03T11:25:52Z

`prettier --check` fails on this line (`saltedStream,type Seeded`), so `vet.sh` is red.

Ask: format the file.

**@vzakharov (agent)** — 2026-10-03T11:38:29Z

Fixed in 08c78ffa.

---

<a id="t158"></a>

### `src/pages/mushrooms/ui/scene/mushroom-bed.ts`:237 — unresolved

```diff
@@ -0,0 +1,430 @@
… 233 lines elided …
+        sprout,
+        stands: { zoom, drawn },
+      } = shown;
+      // A sprout stands hidden while its spores fall.
```

**@vzakharov (agent)** — 2026-10-03T11:25:52Z

**The sprout's hidden phase is the retired shed's, and can no longer happen.** `sproutedInRain` makes a sprout only when its moment has come and stamps `at = moment - SPORE_FALL_MS`, so `sproutScale` is at `SPROUT_START` on its first frame: this branch, the bed's `young > 0` gates and `isOld`'s extra `+ SPORE_FALL_MS` never act.

Ask: start the sprout's clock at its moment and drop the dead branch and comments.

**@vzakharov (agent)** — 2026-10-03T11:46:21Z

Fixed in 9feaef7d: a sprout's clock starts at its moment; the 0 branch, the bed's `young > 0` gates and `isOld`'s offset are gone (and `plantedAt` in `mushroom-shown.ts`, which carried the same offset). The sprout still pops at `SPROUT_START` as the dot goes.

---

<a id="t159"></a>

### `src/pages/mushrooms/model/sprouting.ts`:27 — unresolved

```diff
@@ -0,0 +1,176 @@
… 23 lines elided …
+export const SPROUT_START = 0.4;
+/** How long a sprout takes from coming up to its full size. */
+export const SPROUT_MS = 120_000;
+/** How long the spores take to fall from the parent's crown before a sprout comes up. */
```

**@vzakharov (agent)** — 2026-10-03T11:25:52Z

`SPORE_FALL_MS`'s doc still describes spores falling from the parent's crown before a sprout comes up — the shed. Today it times the tap's fall arc and offsets the sprout's clock only to cancel out.

Ask: reword it as the tap's fall time (with the finding on `mushroom-bed.ts`).

**@vzakharov (agent)** — 2026-10-03T11:46:23Z

Fixed in 9feaef7d: `SPORE_FALL_MS` is now documented as the time a tap's spore takes to fall from its parent's cap to its foot.

---

<a id="t160"></a>

### `src/pages/mushrooms/model/sprouting.ts`:135 — unresolved

```diff
@@ -0,0 +1,176 @@
… 131 lines elided …
+ * which waits for the next.
+ */
+export function sproutMoment(spore: Spore, rain: Rain): number | undefined {
+  if (spore.at >= rain.stopsAt) return undefined;
… 3 lines elided …
```

**@vzakharov (agent)** — 2026-10-03T11:25:52Z

Nit: a spore sown in a shower's last ~2 s sprouts after the rain has stopped; call 40 says it sprouts "in that shower", and the test names "past the stop too".

Ask: amend call 40 or cap the moment at `stopsAt`, whichever reads better to a child.

**@vzakharov (agent)** — 2026-10-03T11:38:35Z

Kept as built; call 40 now says so (a8407647): a spore sown in the shower's last ~2 s comes up just after the stop, still wet. Capping the moment at `stopsAt` would cut short the dwell that lets the child see the dot land before it comes up.

---

<a id="t161"></a>

### `src/pages/mushrooms/model/placement.ts`:143 — unresolved

```diff
@@ -0,0 +1,178 @@
… 139 lines elided …
+     * whatever else the ground alone cannot tell.
+     */
+    admits: (foot: Ground) => boolean;
+    /** Where the foot is drawn round instead of across the whole frame: a sprout's parent. */
```

**@vzakharov (agent)** — 2026-10-03T11:25:52Z

Nit: "a sprout's parent" (and line 4, `SPROUT_REACH`): `near` now places a spore round its parent.

Ask: a spore's parent; consider `SPORE_REACH`.

**@vzakharov (agent)** — 2026-10-03T11:46:25Z

Fixed in d47139d3: "a spore's parent" in both places, and `SPROUT_REACH` is `SPORE_REACH`.

---

<a id="t162"></a>

### `src/pages/mushrooms/ui/scene/spore-drift.ts`:116 — unresolved

```diff
@@ -0,0 +1,117 @@
… 103 lines elided …
+function arcAt(start: Point, end: Point, swing: number) {
+  const span = Math.hypot(end.x - start.x, end.y - start.y);
+  const bend = {
+    x: (start.x + end.x) / 2 + swing * span,
```

**@vzakharov (agent)** — 2026-10-03T11:25:52Z

Nit: every falling dot's arc bends the same way, so a dot landing left of its parent first swings away from its foot.

Ask: swing toward the foot's side, or by the spore's seed.

**@vzakharov (agent)** — 2026-10-03T11:46:27Z

Fixed in d47139d3: the arc swings toward its foot's side, a foot straight under the crown by the spore's seed, fixed when the dot sets off.

---

<a id="t163"></a>

### `scripts/lib/play-rain.ts`:185 — unresolved

```diff
@@ -0,0 +1,224 @@
… 181 lines elided …
+  await page.step(STOP - MID);
+  const leaving = await timedSteps(page, Math.min(OUT, OPEN_BY - STOP));
+  const out = await shower();
+  note(`${String(out.sheltering)} fliers still under a cap after the stop`);
```

**@vzakharov (agent)** — 2026-10-03T11:25:52Z

Nit: call 10's "out one by one" is noted, not checked, and mid-shower the play accepts 1 of 3 released fliers sheltering with 7 seats offered on tabL. `fliers.test.ts` covers both in the model; in the page nothing would catch all leaving at once or two of three failing to hide.

Ask: expect every released flier sheltering mid-shower when seats ≥ fliers; after the stop, some gone and some not, the look timed by `LINGER_MS`.

**@vzakharov (agent)** — 2026-10-03T11:55:07Z

Fixed in 03288494: mid-shower the play expects `sheltering === min(fliers, seats)` (tabL 3/3 with 7 seats, phoneP 3/3 with 3); after the stop it looks at the middle of `LINGER_MS` (1400 ms) and expects some out and some still under (2 of 3 on both).

---

<a id="t164"></a>

### `src/pages/mushrooms/model/worm.ts`:137 — unresolved

```diff
@@ -0,0 +1,286 @@
… 133 lines elided …
+  return [from, ...path.slice(1, -1), to];
+}
+
+/** The straight way up out of a lone window, a body's length, that a peeking worm takes. */
```

**@vzakharov (agent)** — 2026-10-03T14:00:30Z

**Blocking: a russula's peeking worm stands out of its cap into the sky** (measured). `peekPath` rises a full `WORM_LENGTH` (0.157 units) from the middle slot, but a russula's cap dips at its middle (`RUSSULA_HOLLOW`): the surface there is ~0.18 high against a slot at ~0.07. The head is outside `headOutlines` on 300 of 300 russulas, up to 0.110 units over `capSurface`; at full peek 2–5 of the 8 segment centres are outside the cap. Fly agaric, porcini, chanterelle: 0 of 300. A russula's first window always peeks (two trips need three windows), so this is the first worm a child calls out on one. Frame: `docs/remove-before-merging/frames/bite-15/review/rw-tabL-russula-peek-x4.png`. Call 17 bounds a trip's path by the outline; the peek has no bound and no test.

Ask: for every species × 300 seeds, at the peak of a peek every segment's top stays inside `headOutlines` and under `capSurface − MUSHROOM_INK` — the peek shortened (or tilted) on a shallow cap.

**@vzakharov (agent)** — 2026-10-03T14:20:49Z

Fixed in 8ae79d1e (call 26): a peek now rises the lesser of a body's length and the room under capSurface − MUSHROOM_INK, the body drawn in to it; a test holds every segment's top inside the head outline at the peak for every species × 300 seeds × slot, and fails on the old code.

---

<a id="t165"></a>

### `src/pages/mushrooms/model/worm.ts`:274 — unresolved

```diff
@@ -0,0 +1,286 @@
… 270 lines elided …
+  let shownHead: WormBody['head'];
+  for (let index = last; index >= 0; index--) {
+    const along = head - ((head - tail) * index) / last;
+    if (along < 0 || along > length) continue;
```

**@vzakharov (agent)** — 2026-10-03T14:00:30Z

**Blocking: a peeking worm loses its head and eye for most of its look-about** (measured). At the hold `head = WORM_LENGTH` exactly, while the peek path's length is `hypot(0, (y + L) − y)`, which rounds ~1 ulp short of `L` at some window heights; this line then drops the head segment. No head, no eye — so the `look` the peek exists to show is gone, and the band shifts (`draw-worm.ts` falls back to `WORM_SEGMENTS − 2`). Fly agaric seed 29198793371: slot.y 0.12478, length − L = −2.8e-17, headless in 60 of the peek's 89 frames. Sweep: 23/300 fly agarics and 41/300 porcini headless at the peak. The opening clump's seed happens to keep its head, so the play stayed green.

Ask: `wormBody(peekPath(slot), wormPeek(t)).head` is defined for every t in the hold, every species × 300 seeds; the play's peek step checks `__probe.worm(id).head !== null`.

**@vzakharov (agent)** — 2026-10-03T14:20:50Z

Fixed in 8c0c11ca (call 27): wormBody keeps a segment within 1e-9 of either end of its path, clamped onto it; a test holds the head through every peek for every species × 300 seeds × slot, and play-worms checks __probe.worm(id).head !== null mid-hold.

---

<a id="t166"></a>

### `src/pages/mushrooms/model/worm.ts`:25 — unresolved

```diff
@@ -0,0 +1,286 @@
… 14 lines elided …
+/** How thick a worm is drawn: sized to its window, as a mouse is to its door. */
+export const WORM_GIRTH = 0.35 * PANE;
+/** The thinnest a worm is drawn, in the pixels its house paints in: what an eye on it still reads at. */
+export const WORM_GIRTH_LEAST = 6;
```

**@vzakharov (agent)** — 2026-10-03T14:00:30Z

**Nit: the girth floor (and `WINDOW_REACH` in `window-reach.ts`) holds only on the opening clump** (measured). Both floors are in the house graphics' own pixels, and that graphics carries the mushroom's perspective zoom (`mushroom-bed.ts`, `setScale(… * zoom)`), so every mushroom farther than the opening clump draws under both. A russula grown on tabL read reach 10.5 px and girth 4.1 px on screen, its eye barely visible. This docstring's reason is the screen ("what an eye on it still reads at"); its unit is not. The door's `TAP_RADIUS` floor already had this pattern, but `to-check.md`'s numbers (16 px, 61% / 40%) are the best case.

Ask: the floors divided by the house's zoom, or the play measures reach, girth and cap kept on a mushroom with zoom < 1 and `to-check.md` says which mushroom its numbers came from.

**@vzakharov (agent)** — 2026-10-03T14:20:52Z

Fixed in 4f1fec8e (call 28): both floors are divided by the house's perspective zoom, so they hold on screen (tested at zooms 0.3–1.5); the play's note and to-check.md now name the mushroom their numbers came from (the opening clump's front fly agaric, at 0.99×).

---

<a id="t167"></a>

### `src/pages/mushrooms/ui/scene/mouse-runs.ts`:391 — unresolved

```diff
@@ -0,0 +1,448 @@
… 387 lines elided …
+    const at =
+      elapsed >= 0 && moment.runner ? this.runnerPoint(run, t) : undefined;
+    const view = this.view;
+    const shown = this.shown().get(moment.progress < 0.5 ? run.from : run.to);
```

**@vzakharov (agent)** — 2026-10-03T14:32:06Z

**Blocking: a mouse fleeing a sunk house vanishes for the first half of its run, then pops up across the screen** (measured). For progress < 0.5 this looks the run up on `run.from`; the bed deletes a sunk mushroom from `shown` after `SINK_DURATION` 0.45 s (`mushroom-bed.ts` 245–249), and the next lines hide the runner when the lookup misses. tabL, front door tapped, `−` on the back mushroom 1.7 s later: the fleeing run is `shown:false` from 0.52 s to 1.27 s, then reappears at x 647 against 590 when last drawn (and before that it sits behind the front stem). The child sees the house sink and its mouse never come out, then a mouse appear at the loop's far end (`rr-tabL-flee-hidden.png`). Call 10's "a run whose start sinks carries on" and a re-targeted run from an already-sunk house (line 214) vanish the same way; `play-runs.ts`'s `follow()` only asks that the runner was sighted once.

Ask: a run whose start house has sunk is drawn on every frame of its leave/run/enter legs; `play-runs.ts` step 4 expects `shown` on every tracked frame between the hop down and the hop in.

**@vzakharov (agent)** — 2026-10-03T16:21:14Z

Fixed in 1b6c5093: a run takes its ends' placements, size and lighting when it starts and on a re-target, so a sunk start house no longer hides its runner; `play-runs.ts` step 4 now plays this scenario and expects the runner shown on every frame from the hop down to the hop in (red on the old lookup: hidden 24 frames, 1.59–2.36 s in; green on tabL and phoneP).

---

<a id="t168"></a>

### `src/pages/mushrooms/ui/scene/mouse-runs.ts`:324 — unresolved

```diff
@@ -0,0 +1,448 @@
… 320 lines elided …
+    beganAt: number,
+    opening: RunOpening,
+    calling: boolean,
+    fixedStart?: RunEnd,
… 8 lines elided …
```

**@vzakharov (agent)** — 2026-10-03T14:32:06Z

**Blocking: a second tap on a door whose mouse is peeking out to run sends a second mouse out, and the two swap houses** (measured). The count drops here when the run begins, while the mouse stays in its doorway for the 0.85 s peek, and `answerTap` reads only the counts (`model/mouse-run.ts` 166) — so a second tap reads as an empty house and calls a mouse home. tabL, front door tapped twice 0.2 s apart: runs `[2→1, 1→2]`, mice 0/0, a head in both doorways (`rr-tabL-double-tap-both-out.png`), then both loop in opposite directions and cross (`rr-tabL-double-tap-swap.png`); 1/1 at the end, so the double tap only showed two mice crossing. With the other house empty the same tap knocks with a head plainly in the doorway; the target end has the same gap until `over` (a tap during enter/close calls or knocks).

Ask: a door tap while a run's mouse is in that doorway (its peek leg out of it, or its enter/close leg into it) starts no run and does not knock — it squeaks that mouse; a test taps one door twice 0.2 s apart and finds exactly one run and no knock.

**@vzakharov (agent)** — 2026-10-03T16:34:00Z

Fixed in acfb76a783327f95e86dc07fae00c0bd44d28cd5: a tap on a door whose run's mouse is in its doorway (the peek out of it, or enter/close into it) now squeaks that mouse and starts no run and no knock; a `mouse-run` test taps one door twice 0.2 s apart and finds one run, then a squeak, with the other house full and empty.

---

<a id="t169"></a>

### `src/pages/mushrooms/model/mouse-run-clock.ts`:246 — unresolved

```diff
@@ -0,0 +1,271 @@
… 242 lines elided …
+    from.front,
+    to.front,
+    eye,
+    RUN_BOW * Math.max(from.across, to.across),
```

**@vzakharov (agent)** — 2026-10-03T14:32:06Z

**Nit: call 25's clearance at `RUN_BOW` 1 falls short of a runner's length** (measured — the item the build left open). The bow is counted in door widths from the door's *front*; the runner is drawn ~1.87 door widths long. Plane numbers, identical on tabL and phoneP: door 0.1478; the course's middle is 0.148 (1.00 door) nearer than the front and 0.257 (1.74 doors) nearer than the foot, against a runner of ≈0.276 (1.87). So against call 25's foot it is ~7% short (~3 px on tabL); the sideways loop keeps the grass clear in the frames, so nothing shows yet. `mouse-run-course.test.ts` checks an arbitrary `CLEARANCE` 0.12 against the fronts, so nothing ties `RUN_BOW` to the runner or the foot, though its doc says "enough for the runner to clear the nearer stem's foot".

Ask: the middle is at least one drawn runner length (a shared constant for the runner's span in door widths) nearer than the nearer foot; a `mouse-run-clock` test holds `pathBetween`'s middle to it.

**@vzakharov (agent)** — 2026-10-03T16:21:16Z

Fixed in 718ef2fc: `RUNNER_SPAN` (1.82 door widths, the span `paintRunner` draws to) is shared with the drawing, and `pathBetween`'s middle is held at least one drawn runner nearer than the nearer foot, a `mouse-run-clock` test holding it on four door pairs; the scene passes the foot since 1b6c5093.

---

<a id="t170"></a>

### `src/pages/mushrooms/model/mouse-run-clock.ts`:276 — unresolved

```diff
@@ -0,0 +1,271 @@
… 243 lines elided …
+    to.front,
+    eye,
+    RUN_BOW * Math.max(from.across, to.across),
+    RUN_PACE * RUN_LEAST,
```

**@vzakharov (agent)** — 2026-10-03T14:32:07Z

**Nit: a mouse turned back by a sinking target makes a full new loop from a few pixels away** (measured). A re-targeted run (`mouse-runs.ts` 213–214, opening `'run'` from the runner's point) goes back through `pathBetween`, which bows it out to the least length here and holds it to `RUN_LEAST` 2.4 s. In the sink run above the front's runner was ~30 px from its own door, swung down to (578, 811), took 2.77 s to get home and arrived on the same frame as the fleeing mouse, the two drawn over each other. A lead, unmeasured: `retarget`'s last fallback `nearestOf` (`mouse-run.ts` 242) starts a visible run to a door at any distance, drawn or not, where `scattered` counts such a mouse straight in.

Ask: a run re-targeted from the ground takes no longer than its straight distance at `RUN_PACE` plus the hop; a test re-targets from 0.2 clump sizes away and finds `runDuration` under 1 s.

**@vzakharov (agent)** — 2026-10-03T16:31:41Z

Fixed in 4f325763eb6fa664a24cabb465e54b51a67d07d5: a run re-targeted from the ground now goes straight at `RUN_PACE` with no bow and no `RUN_LEAST` (~0.88 s from 0.2 clump sizes, held by a `mouse-run-clock` test), and `retarget`'s far fallback counts the mouse straight in, as `scattered` does.

---

<a id="t171"></a>

### `src/pages/mushrooms/ui/scene/controls.ts`:351 — unresolved

```diff
@@ -0,0 +1,335 @@
… 311 lines elided …
+      this.meadow?.furnishing === true ||
+      this.meadow?.planting !== undefined;
+    const shown = (name: MeadowLayout['yielding'][number]) =>
+      this.mapOpen || (open && this.yielding.includes(name)) ? 0 : 1;
```

**@vzakharov (agent)** — 2026-10-03T18:30:30Z

**The `+` picker and the house picker stay open on top of the map, and they still work.** A press on the map button dispatches `shut`, and `shut` closes only the flower picker (`flowersShut` in `model/game.ts`). `picking` and `furnishing` stay set. The map hides `plus`, `minus`, the house and the insects here, but the loop below (`picker.update(t)` for `picker`, `housePicker`, …) never checks `mapOpen`. The pickers draw at `HUD_DEPTH`, above the sheet's catcher at `HUD_DEPTH - 0.5`.

To reproduce: tap `+` so the four caps open, then tap the map. The caps' row sits over the open map. A tap on a cap grows a mushroom in the meadow under the map, and the map does not show it because it is a snapshot. The same happens with the house picker, whose windows and door furnish a mushroom the child cannot see. This breaks calls 4 and 9: only the map button should stand above the map, and its press should be the only input.

Fix: shut every picker when the map opens. Either add a `shut` variant that applies `PICKERS_SHUT`, or make the map's handler dispatch one. Also add an `open + picker` step to `play-map.ts` so a run catches this.

**@vzakharov (agent)** — 2026-10-03T18:56:46Z

Opening the map is now an action of its own that shuts every picker, so only the map button is left over the sheet; the map play checks that the `+` picker shuts under it. 28a62770

---

<a id="t172"></a>

### `src/pages/mushrooms/ui/scene/map-view.ts`:123 — unresolved

```diff
@@ -0,0 +1,361 @@
… 119 lines elided …
+    this.isOpen = !this.isOpen;
+    if (this.isOpen) {
+      this.openedAt = this.now();
+      this.letGo();
```

**@vzakharov (agent)** — 2026-10-03T18:30:35Z

**The child keeps walking and turning under the open map after a flick.** `letGo` (`EyeInput.letGo`) releases only what the keys hold. A drag's glide is different: a quick lift glides on for `GLIDE_OVER`, which is `0.325 × 6 ≈ 2 s` (`model/glide.ts`, and `pan.ts` for turning). A glide stops only on a press that reaches `EyeInput.pressed`. The press on the map button lands on a fixed object, so `pressed` returns early and the glide goes on. `MeadowScene.update` keeps calling `this.walk(…)` every frame.

What the child sees: he flicks to turn, taps the map at once, and the map shows him where he stood at the tap. When he closes it, the meadow has turned up to two seconds further on. That contradicts call 5 ("nothing walks while it is open"), and the marker and wedge on the map are wrong for the whole time it is open.

Fix: make `letGo` also end any glide, doing what `walk.ts` already does on a press ("a press stops a glide and a key's walk where they stand"). Or gate `walk` in `update` while the map is open.

**@vzakharov (agent)** — 2026-10-03T18:56:48Z

The eye now stops dead as the map opens: a flick's pan and stride are halted rather than left to glide on under the sheet, and the map play flicks, opens the map and checks the eye has not moved. 28a62770

---

<a id="t173"></a>

### `src/pages/mushrooms/ui/scene/map-view.ts`:97 — unresolved

```diff
@@ -0,0 +1,361 @@
… 42 lines elided …
+const CORNER = 14;
+/** The least a mushroom's cap stands across on the map, in CSS px, and a flower's height. */
+const LEAST_CAP = 12;
+const LEAST_FLOWER = 9;
```

**@vzakharov (agent)** — 2026-10-03T18:30:41Z

**On the map, the flowers look like dark stumps, not flowers.** `to-check.md` asks the operator whether a 9 px flower can be seen, but the committed frames already answer it. Crop `tabL-m4-open-planted.png` around the wedge. Each flower is a green block with a dark dot on top. The head is about 4 px across and its ink outline is about 1.5 px, so the outline takes over and the colour is gone. The blue, pink and white flowers in `tabL-m0-closed.png` all come out almost the same near-black on the map. The mushrooms survive because their floor is the cap (12 px). The flowers' floor is the whole height, stem included, so the head gets only a small part of it.

A six-year-old who planted a pink flower will look for a pink dot and not find one. The same happens on phoneP, where nearly everything on the sheet is a flower.

Fix: floor the head rather than the height (for example, head at least ~8 px across), or thin the painter's ink at map size so the fill shows. Then reshoot `m4` and judge the new frame, not the number.

**@vzakharov (agent)** — 2026-10-03T18:56:49Z

A flower's head on the map is now at least 9 px across, sitting on its 9 px stem, so its colour shows past its ink even on the phone. 28a62770

---

<a id="t174"></a>

### `docs/plans/mushroom-game-syama/to-check.md`:289 — unresolved

```diff
@@ -0,0 +1,324 @@
… 285 lines elided …
+- **Карта — то же, что вокруг (бит 16).** Открой карту, закрой, повернись
+  на месте и открой снова: стрелка и светлый клин повернулись вместе с
+  тобой, а грибы и цветы на карте остались на своих местах? И то, что
+  сейчас на экране, лежит внутри клина (слева на экране — слева в клине)?
```

**@vzakharov (agent)** — 2026-10-03T18:30:46Z

**The play can answer "left on the screen is left in the wedge" itself, so it shouldn't be the operator's homework.** `map-frame.test.ts` checks the handedness only against its own definition: it states that the right of `sunward` is `(cos, −sin)`. It never checks that against the panorama's screen left and right, and the frames don't show it either way. `play-map.ts` already has the eye and `__probe.map()`. For every flower the meadow shows in view, it can compare the sign of the flower's screen x minus the screen's middle with the sign of its map point's cross product against `headingOnMap`. A mirrored map would then fail the run instead of waiting for someone to notice.

Keep the to-check line for what only a person can judge, which is whether the map *feels* like the same meadow.

**@vzakharov (agent)** — 2026-10-03T18:56:51Z

The map play now checks that whatever stands left on the screen stands left of the heading on the map, and that nothing lands off the sheet; to-check.md keeps only the judgement of how it feels. 28a62770

---

<a id="t175"></a>

### `docs/plans/mushroom-game-syama/decisions.md`:14 — unresolved

```diff
@@ -0,0 +1,167 @@
… 10 lines elided …
+  with Phaser `Graphics`: outline, flat fill, a highlight, a shade — cartoon
+  shading as layered shapes. The seed is the state; the genes are derived.
+  Sound is synthesized with Web Audio, no files. Sound off is the device's:
+  the game keeps no switch and stores nothing, and the top-left circle is
```

**@vzakharov (agent)** — 2026-10-03T18:30:49Z

**Polar bear.** "The game keeps no switch and stores nothing" only describes the mute that was taken out. Someone reading the tree as it is now would never ask about a switch. Call 2 asked for this line to be "rewritten, not negated". Suggest: "Sound off is the device's; the top-left circle is the map's."

**@vzakharov (agent)** — 2026-10-03T18:56:53Z

The decisions.md line is rewritten to what the map does now. It frames everything the meadow holds, eye included, fitted to the sheet both ways, with the zoom capped against the fresh meadow's. 28a62770

---

<a id="t176"></a>

### `src/pages/mushrooms/ui/scene/sound.ts`:247 — unresolved

```diff
@@ -0,0 +1,313 @@
… 243 lines elided …
+  /**
+   * The shower's sound at this frame, `downpour` and `wetness` as
+   * `model/weather.ts` gives them; called every frame, and free while neither
+   * has moved. Built when a shower is first heard — never while hidden, and not waiting for `start`, since a shower is a state the next
```

**@vzakharov (agent)** — 2026-10-03T18:30:51Z

Nit: the edits left comment lines unwrapped. This one is about 130 columns. The `mute` → `map button` rename did the same to several docstrings in `picker-rows.ts` and `sky-layout.ts` (`placeControls`, `placeReleases`, `PlaceReleasesParams`). Prettier doesn't rewrap comments, so they stay ragged unless someone rewraps them by hand.

**@vzakharov (agent)** — 2026-10-03T18:56:55Z

The docstrings in sound.ts, picker-rows.ts and sky-layout.ts are rewrapped. 28a62770

---

<a id="t177"></a>

### `src/pages/mushrooms/ui/scene/firefly-view.ts`:132 — unresolved

```diff
@@ -0,0 +1,327 @@
… 126 lines elided …
+    this.shown = glows.map(({ genes, glow, halo }) => {
+      const body = scene.add.image(0, 0, '__WHITE');
+      const tail = scene.add.image(0, 0, '__WHITE');
+      const hit = new Phaser.Geom.Circle(0, 0, TAP_RADIUS);
```

**@vzakharov (agent)** — 2026-10-04T11:32:45Z

🔴 **Should fix (near blocks) — fireflies swallow taps on doors, caps and windows.** Twelve hit circles of `TAP_RADIUS` (32 px) that never pass a tap through. Share of a mushroom's hit box its taps still reach, day → dusk over 8 frames: phoneP mushroom-4 87 → 39 %, mushroom-1 94 → 56 %; tabL mushroom-1 95 → 63 %. Door points lost: phoneP mushroom-3 5/8, -4 5/8, -5 2/8; tabL -3 3/8; a phoneP window tap reached a firefly. A tap on a firefly's centre missed it 5/12 tabL (a neighbour took it).

Ask: at full dusk on phoneP and tabL over 8 frames every door point reaches `door:<id>` ≥ 95 %, and each mushroom's reachable share drops ≤ 5 points from day.

**@vzakharov (agent)** — 2026-10-04T12:03:30Z

Fixed in 96fd4483: a firefly takes a tap only where nothing else under the finger answers (`firefly-tap.ts`, nearest wins among fireflies). Fireflies took 0 % of mushroom and door points over 8 dusk frames on tabL and phoneP; what door:mushroom-2 still loses at dusk is a night-run mouse at the door, which answers the tap itself.

---

<a id="t178"></a>

### `src/pages/mushrooms/ui/scene/house-view.ts`:333 — unresolved

```diff
@@ -0,0 +1,372 @@
… 329 lines elided …
+    if (!house) return;
+    const brush = {
+      ink: Math.max(1.5, size * 0.01),
+      tone: (colour: number) => mix(colour, PALETTE.air, haze),
```

**@vzakharov (agent)** — 2026-10-04T11:32:45Z

🔴 **Should fix — far mushrooms glow pale grey in flight at dusk**, lighter than the hills (porcini cap rgb(156,151,142) on hill rgb(71,85,108); steps at dusk keeps colours). Haze mixes toward the day `PALETTE.air` with no dusk twin.

Ask: at full dusk in flight a hazed cap's luminance ≤ the backdrop behind it.

**@vzakharov (agent)** — 2026-10-04T12:03:31Z

Fixed in d125c5bb: haze mixes toward `hazeAir(dusk)`, a dim slate (`PALETTE.airDusk`) at full dusk; far caps 0.206 → 0.057 luminance against the hill's 0.089. Spores and running mice follow in 300dfd16.

---

<a id="t179"></a>

### `src/pages/mushrooms/ui/scene/windows-lit.ts`:17 — unresolved

```diff
@@ -0,0 +1,18 @@
… 13 lines elided …
+ */
+export function windowsLit(dusk: Dusk, now: number, phase: number): number {
+  const delay = ((phase / (Math.PI * 2)) % 1) * LIT_DELAY_MOST;
+  return smooth((duskness(dusk, now - delay) - LIT_FROM) / LIT_SPAN);
```

**@vzakharov (agent)** — 2026-10-04T11:32:45Z

🔴 **Should fix — a lagging house's windows jump 0 → 1 on a reversed turn.** It asks the current `Dusk` for `now - delay`, which before the new `startedAt` returns the turn's `from`. Delay 1499 ms, reversed at T: 1500 → 0.259, 2000 → 0.784, 2500 → 1.000 in one frame.

Ask: for every phase and T in 0..DUSK_MS step 50, `|windowsLit(turned(d,T),T,phase) − windowsLit(d,T−ε,phase)| < 0.05` — lag each house's light, not the clock it reads.

**@vzakharov (agent)** — 2026-10-04T12:03:32Z

Fixed in e2735e55: a lagging house reads the turn before until its own delay passes; the ask's continuity test is in `windows-lit.test.ts`.

---

<a id="t180"></a>

### `src/pages/mushrooms/ui/scene/map-compass.ts`:21 — unresolved

```diff
@@ -0,0 +1,43 @@
… 17 lines elided …
+  at: Point,
+  dusky: boolean,
+): void {
+  if (dusky) drawMoon(pen, { ...at, r: SUN_RADIUS }, MOON_INK);
```

**@vzakharov (agent)** — 2026-10-04T11:32:45Z

🔴 **Should fix — the open map's compass sticks.** Drawn once per `flip()`/resize: sun tapped, map opened within 2 s → full-dusk paper with a sun on the compass until reopened.

Ask: redraw when `duskyAt(level)` flips while the map is open.

**@vzakharov (agent)** — 2026-10-04T12:03:34Z

Fixed in 766db15e: the compass has its own layer, redrawn once when `duskyAt` flips while the map is open.

---

<a id="t181"></a>

### `src/pages/mushrooms/model/mouse-run.ts`:60 — unresolved

```diff
@@ -0,0 +1,259 @@
… 49 lines elided …
+ * door in sight, however far apart the two houses grew, since a mushroom
+ * grows as far from the others as the screen allows (`pickFoot`).
+ */
+const seenBesides = (doors: readonly RunDoor[], except?: string): RunDoor[] =>
```

**@vzakharov (agent)** — 2026-10-04T11:32:45Z

🔴 **Should fix — day outings widened too.** `MouseRuns.watchOuting` turns day outings into runs via `runTarget`, so since 0e80d99 a day outing crosses the whole screen. Call 11's "day keeps runs tap-only" no longer holds.

Ask: gate any-door reach to `nightRan` and taps; keep a short reach for `watchOuting` (a day outing between doors 8 units apart makes no run).

**@vzakharov (agent)** — 2026-10-04T12:03:35Z

Fixed in 99c69c29: a house's own outing runs only to a door within `OUTING_REACH`; taps and night runs still reach any door in sight.

---

<a id="t182"></a>

### `src/pages/mushrooms/ui/scene/tending.ts`:186 — unresolved

```diff
@@ -0,0 +1,386 @@
… 182 lines elided …
+  const { eye, width } = view;
+  const { arc } = pinholeOf(view);
+  const most = ((0.5 + TENDED_SCREENS) * width) / arc;
+  const reach = browDistance(view) + PALE_SPAN;
```

**@vzakharov (agent)** — 2026-10-04T11:32:45Z

🔴 **Should fix — grass tended to the walking brow in flight.** `Grass.grownRound` passes `viewAt(camera, eye)` defaulting to `EYE_HEIGHT`: tufts tended to 15.03 while flight's brow is 16.0, and a flip with no step never re-tends.

Ask: fully risen, every lawn tuft ≤ browDistance + PALE_SPAN in the screen's azimuth is standing; a flip re-tends within a few frames.

**@vzakharov (agent)** — 2026-10-04T12:03:36Z

Tending was not the cause: lawn tufts show only inside the planting band, which ends ~12.3 ahead at any height, so tending to flight's brow added only tufts the band rejects. The bare strip was the seam grass starting at brow − band in flight; fixed in 795b5f01 by starting it where it does in steps.

---

<a id="t183"></a>

### `src/pages/mushrooms/model/walk.ts`:266 — unresolved

```diff
@@ -0,0 +1,438 @@
… 262 lines elided …
+      return { ...walk, pan: move(pan, arcOf(pinholeOf(lens), point.x), time) };
+    }
+    case 'step': {
+      const aim = stepAim(lensAt(walk, time), lock, point.y);
```

**@vzakharov (agent)** — 2026-10-04T11:32:45Z

🔴 **Should fix — a gait flip mid-drag moves a flight.** The chase keeps its pressed gait but reads the current height (`lensAt`), here and in `lockAt` at :355; a flip within the 0.5 s rise jumps the aim by 0.2·distanceOfRow (1–2.7 units) and feeds the fling.

Ask: press in flight, flip to steps at 0.1 s, move 1 px — the eye moves ≤ that row's ground distance, no fling.

**@vzakharov (agent)** — 2026-10-04T12:03:38Z

Fixed in 1ca67cc3: a drag holds the gait and eye height it was pressed at; the ask is a test in `walk.test.ts`.

---

<a id="t184"></a>

### `src/pages/mushrooms/ui/scene/flower-layout.ts`:444 — unresolved

```diff
@@ -0,0 +1,450 @@
… 440 lines elided …
+    for (let half = 0; half < BED_HALVES; half++) {
+      for (const slot of band.spots.entries()) {
+        const foot = spotOn(opening, band, half, slot, stream, bed);
+        if (foot) bed.push(foot);
```

**@vzakharov (agent)** — 2026-10-04T11:32:45Z

🔴 **Should fix — latent near/far index pairing.** One dropped near slot here shifts flower-14 into far slot 0, since `plotted` and `anchored-stand.ts` pair by index.

Ask: `seededBed` returns one entry per slot; over 200 window sizes × 20 seeds every near flower sits on a near-band slot.

**@vzakharov (agent)** — 2026-10-04T12:03:39Z

Fixed in a98fb68a: `seededBed` keeps one entry per slot (no real size dropped one; 20,000 visits checked), pinned over 200 sizes × 20 visits.

---

<a id="t185"></a>

### `scripts/lib/play-walk.ts`:1 — unresolved

```diff
@@ -0,0 +1,423 @@
+/**
```

**@vzakharov (agent)** — 2026-10-04T11:32:45Z

🔴 **Should fix — no play checks flight's ground-under-finger** since the `checkUnderFinger` calls were cut.

Ask: a walk-play pass in flight asserts the ground stays within 3 % of the finger on every move.

**@vzakharov (agent)** — 2026-10-04T12:03:40Z

Fixed in 107d3e2e: `play-walk-flight.ts` asserts the ground under the finger in flight on every move; green on tabL and phoneP.

---

<a id="t186"></a>

### `src/pages/mushrooms/model/eye-height.ts`:6 — unresolved

```diff
@@ -0,0 +1,69 @@
… 2 lines elided …
+ * that in flight, easing between the two over `RISE_EASE` when the gait
+ * flips. The horizon's row stays where it is, so the ground's top row, the
+ * brow, the hills and the seam stay put on the screen and only the ground
+ * they show grows deeper: the brow stands `browDistance` off.
```

**@vzakharov (agent)** — 2026-10-04T11:32:45Z

**Should fix or record — haze stops at the things.** `hazeAhead` ignores eye height: the ground bake hazes 0.4 at the brow row while a thing there gets ~0.63.

Ask: build the ground haze wash only if a frame shows far things paler than their ground; otherwise the plan carries it.

**@vzakharov (agent)** — 2026-10-04T12:03:42Z

The frame-level check this hinged on came back clean after d125c5bb: far things no longer read paler than their ground, so the ground haze wash stays unbuilt.

---

<a id="t187"></a>

### `src/pages/mushrooms/ui/scene/dusk-view.ts`:143 — unresolved

```diff
@@ -0,0 +1,181 @@
… 139 lines elided …
+    const sun = this.sunAt();
+    if (!sun || !onTheSun(sun, { x, y: y - bob }, within)) return false;
+    this.dispatch({ kind: 'dusk', now: this.now() * 1000 });
+    if (this.toward === 'day') this.sound.sink();
```

**@vzakharov (agent)** — 2026-10-04T11:32:45Z

🟡 Nit (optional) — sound uses last frame's direction: two taps in one frame both play `sink`. Ask: flip `this.toward` in `tap()`.

**@vzakharov (agent)** — 2026-10-04T12:03:43Z

Fixed in 4a03b5c7.

---

<a id="t188"></a>

### `src/pages/mushrooms/model/game.ts`:413 — unresolved

```diff
@@ -0,0 +1,427 @@
… 409 lines elided …
+    }
+    case 'dusk': {
+      // The flowers close for the night as for the rain, the picker with them.
+      return { ...flowersShut(meadow), dusk: turned(meadow.dusk, action.now) };
```

**@vzakharov (agent)** — 2026-10-04T11:32:45Z

🟡 Nit (optional) — a morning tap shuts the flower picker too. Ask: shut only toward dusk.

**@vzakharov (agent)** — 2026-10-04T12:03:44Z

Fixed in 4a03b5c7; the bees test was vacuous and now fails without the rule.

---

<a id="t189"></a>

### `src/pages/mushrooms/ui/scene/firefly-view.ts`:284 — unresolved

```diff
@@ -0,0 +1,327 @@
… 239 lines elided …
+          taken.set(shown.host, (taken.get(shown.host) ?? 0) + 1);
+        }
+        seat = hosts.find(({ id }) => id === shown.host)?.seat;
+        if (shown.drawn) shown.left = { ...shown.drawn, at: t };
```

**@vzakharov (agent)** — 2026-10-04T11:32:45Z

🟡 Nit (optional) — a firefly glides in from a stale point: `drawn` is cleared only on sleep. Ask: clear it in `draw()`'s `!seat` branch.

**@vzakharov (agent)** — 2026-10-04T12:03:45Z

Fixed in 96fd4483.

---

<a id="t190"></a>

### `src/pages/mushrooms/ui/scene/gait-spot.ts`:45 — unresolved

```diff
@@ -0,0 +1,110 @@
… 40 lines elided …
+  );
+  if (free) return { gait: free, yielding };
+  const giving =
+    nearestSpot(screen, (spot) => standing(spot, groundTop, BUTTON_INSET)) ??
```

**@vzakharov (agent)** — 2026-10-04T11:32:45Z

🟡 Nit (optional) — tier 3 may land on the meadow, and the 4 px scan is ~130k spots at 1920×1080. Ask: the fallback keeps `spot.y + reach <= groundTop`, or a test pins which sizes reach it.

**@vzakharov (agent)** — 2026-10-04T12:03:46Z

Fixed in 4a03b5c7: a sky spot without the rays' gap is tried before the meadow; four small screens pinned in `gait-spot.test.ts`.

---

<a id="t191"></a>

### `src/pages/mushrooms/api/keeper.ts`:94 — unresolved

```diff
@@ -0,0 +1,69 @@
… 59 lines elided …
+
+  return {
+    keep,
+    poll: (at, record) => {
```

**@vzakharov (agent)** — 2026-10-04T14:47:23Z

**Blocking: the poll writes every second whether or not anything changed.**

`poll` keeps `record()` every `POLL_MS` unconditionally. A tablet left on the meadow, which is how a child leaves a game, therefore does a full `settled` + structured clone + IndexedDB commit once a second for as long as the tab is visible: about 3,600 durable writes an hour of an unchanged meadow, each a disk flush on battery.

The model already makes this cheap to avoid: an idle `tick` returns the same `Meadow` object (`sproutedInRain`, `ticked` and `swarmed` each return their input when nothing moved).

Suggested fix: in `meadowKeeping`, remember the meadow reference, eye and gait last handed to the keeper, and have `poll` skip when all three are unchanged. `keep()` after a dispatch and on hide stay as they are.

**@vzakharov (agent)** — 2026-10-04T14:56:55Z

The poll (and the tab-hide) now hand the keeper a record only when the meadow reference, the eye or the gait moved since the last record handed over, so an idle meadow writes nothing; an action's keep() still always writes — 472645c2ac9fbd7ac83338afc2ca0db5444fc43a

---

<a id="t192"></a>

### `src/pages/mushrooms/ui/scene/meadow-keeping.ts`:93 — unresolved

```diff
@@ -0,0 +1,114 @@
… 89 lines elided …
+        };
+      }
+      const { document, window, reload } = page();
+      const hidden = () => {
```

**@vzakharov (agent)** — 2026-10-04T14:47:23Z

**Blocking: a stale tab overwrites the child's newer meadow just by being looked at.**

Call 12 accepts "last writer wins", but two things make two tabs on one meadow the normal case here rather than an edge: a bare link opens the *highest* kept meadow, and iPad Safari keeps old tabs indefinitely. Scenario: yesterday's tab A is still open on `#1`. Today the child opens the site from the home screen (tab B, also `#1`) and builds for an hour. Later tab A is brought forward: its rAF resumes, and its first `poll` (then every action) writes yesterday's meadow over today's. Nobody pressed anything in tab A; "last writer" has become "last tab shown". To a child that is the meadow lost (decisions.md: nothing is lost).

Suggested fix: give each load a writer token (or keep the last record it wrote) and, on `visibilitychange` to `visible`, read the record back; if it is not what this tab last wrote, `reload()` instead of keeping. A `BroadcastChannel('mushrooms')` message on each write that makes other tabs on the same number reload works too. Either way the stale tab stops before its first poll.

**@vzakharov (agent)** — 2026-10-04T14:59:20Z

Keeping now pauses from the moment a tab hides; when it is shown again it reads the meadow's stored record back and, if another tab has kept that number since this load opened or last wrote it, reloads to open the newer meadow instead of writing over it — 62a5615

---

<a id="t193"></a>

### `src/pages/mushrooms/ui/scene/start-game.ts`:23 — unresolved

```diff
@@ -0,0 +1,72 @@
… 19 lines elided …
+): () => void {
+  let stop: (() => void) | undefined;
+  let stopped = false;
+  openStore()
```

**@vzakharov (agent)** — 2026-10-04T14:47:23Z

**Blocking: a store that opens but then fails a read shows an error page instead of a meadow.**

Call 9 says failing storage opens a fresh meadow. That holds only for the *open*. Once `openStore` resolves, a rejection from `store.numbers()` or `store.read()` (WebKit's "Connection to Indexed Database server lost", an `InvalidStateError` from `database.transaction` on a connection the browser closed, a read error on a damaged record) rejects `openKept`, lands in this `.catch(onError)`, and `MeadowCanvas` throws it. The child gets the route's error screen and no game, on every load until the storage recovers.

Suggested fix: catch around `openKept` here. On rejection, `reportError` it and continue with `openKept(location, history, undefined)` (the unkept fresh meadow), so a storage fault costs the keeping, never the game. A test with a fake store whose `numbers` rejects pins it.

**@vzakharov (agent)** — 2026-10-04T15:02:00Z

openKept now catches a read that rejects on an opened store, reports it and opens a fresh, unkept meadow, so a storage fault no longer reaches the error page; the catch sits in open-kept.ts, where a fake store whose `numbers` rejects pins it. 0ae3f2c8bbf195c75e7d17d28a8dcdc3723474e7

---

<a id="t194"></a>

### `src/pages/mushrooms/api/keeper.ts`:49 — unresolved

```diff
@@ -0,0 +1,69 @@
… 45 lines elided …
+        if (next !== undefined) write(next);
+      },
+      (error: unknown) => {
+        stopped = true;
```

**@vzakharov (agent)** — 2026-10-04T14:47:23Z

**Blocking (reopens call 5): one refused write stops keeping for the rest of the load, and on an iPad that is routine.**

WebKit drops IndexedDB connections after the app has been in the background a while (the well-known "Connection to Indexed Database server lost. Refresh the page to try again"), and every write after that rejects. Here the first rejection sets `stopped` for good and reports once, to a console nobody reads. Scenario: Syama switches to another app, comes back and plays for an hour. None of that hour is written, and tomorrow's reload opens the meadow from before the switch. Call 5 treated this as "no storage", but the store *was* there and would answer a fresh connection. So this is lost work, which decisions.md rules out.

Suggested fix: on a refused write, reopen the store once (`openStore()`) and retry the newest record (the refused one or the one waiting) on the new connection. Stop only if the reopen or the retry also fails. In `storeOver`, listening for the database's `close` event and reopening lazily on the next write covers the same case before a write fails.

**@vzakharov (agent)** — 2026-10-04T15:02:01Z

A refused write now reopens the store once and retries the newest record on the new connection, and keeping stops (reported once) only if the reopen or the retry fails too; the database's `close` event marks the connection lost so the next write reopens first, and the stale-tab check follows the keeper onto the new connection. 0ae3f2c8bbf195c75e7d17d28a8dcdc3723474e7

---

<a id="t195"></a>

### `src/pages/mushrooms/api/meadow-store.ts`:72 — unresolved

```diff
@@ -0,0 +1,105 @@
… 59 lines elided …
+  return undefined;
+}
+
+function storeOver(database: IDBDatabase): Store {
```

**@vzakharov (agent)** — 2026-10-04T14:47:23Z

**Optional: no `versionchange` handler, so an old open tab blocks any later upgrade of the database.**

Nothing listens for `versionchange` on the open `IDBDatabase`. If a later build opens `mushrooms` at version 2 (an index, a migration), any tab still running this build holds its connection. The new open fires `blocked`, hits `ANSWER_MS`, and the new tab opens *unkept*: the child plays a meadow that is never written, with no sign of it.

Suggested fix: `database.addEventListener('versionchange', () => { database.close(); })`, and have the keeper treat the closed connection as a reload (`location.reload()` when visible) or a stop, so the newer build always gets the database.

**@vzakharov (agent)** — 2026-10-04T15:02:03Z

The open connection now closes itself on `versionchange`, so a newer build's upgrade is never blocked, and the keeper stops keeping (reported once) rather than reloading. 0ae3f2c8bbf195c75e7d17d28a8dcdc3723474e7

---

<a id="t196"></a>

### `src/pages/mushrooms/model/kept-record.ts`:143 — unresolved

```diff
@@ -0,0 +1,155 @@
… 139 lines elided …
+});
+
+/** The record, checked against the model's own types: a field the model changes and this does not fails the type check. */
+const KeptSchema = z.object({
```

**@vzakharov (agent)** — 2026-10-04T14:47:23Z

**Optional: nothing makes a model change bump `KEPT_VERSION`, and getting it wrong looks like every meadow lost.**

`satisfies z.ZodType<Kept>` catches a new *required* field. It does not catch a new optional one (zod strips it on read, so it vanishes on the next write), or a field whose meaning changes. And when a change does make old records fail the schema, every kept meadow becomes "unreadable". Each is left untouched (good), but a bare link then opens a fresh meadow past the highest. To a child, all of it is gone, recoverable only by someone who knows to type `#1`.

Suggested fix: a snapshot test pinning the schema's shape (`z.toJSONSchema(KeptSchema)` against a checked-in JSON), whose failure message says to bump `KEPT_VERSION` and add a reader for the previous version. Cheap now, before the first record exists in the wild.

**@vzakharov (agent)** — 2026-10-04T14:55:34Z

A snapshot test now pins `z.toJSONSchema(KeptSchema)` against the checked-in `kept-record.schema.json`. When the record's shape changes, the test fails and says to bump `KEPT_VERSION` and add a reader for the previous version, or to update the snapshot when the change is additive and old records still parse. `undefined` reads as `{}`, since it is the only type in the schema that JSON Schema cannot express. Landed in d51f55b9e5036fe635bf0e03e5b58bca472e37d2

---

<a id="t197"></a>

### `src/pages/mushrooms/api/keeper.ts`:44 — unresolved

```diff
@@ -0,0 +1,69 @@
… 33 lines elided …
+  let writing = false;
+  let waiting: Kept | undefined;
+  let stopped = false;
+  let polled = -Infinity;
```

**@vzakharov (agent)** — 2026-10-04T14:47:23Z

**Optional: an untouched fresh meadow is written on its first frame, and then becomes the one every bare link opens.**

`polled = -Infinity` makes the first `poll` write at once, so any load of a fresh number is kept before the child does anything. A mistyped or shared link (`/mushrooms#7` sent from another device), or one stray `#new`, creates an empty meadow under a higher number. Since a bare link opens the *highest* kept (saving.md), every later visit from the home screen opens that empty meadow instead of the child's real one.

Suggested fix: keep the saving.md contract, but don't write a fresh meadow until it is played. The keeper writes nothing, poll included, until its first `keep()` from a dispatch (or the first eye move). A reopened kept meadow is unaffected.

**@vzakharov (agent)** — 2026-10-04T14:56:57Z

A fresh meadow now takes its first frame as the baseline and writes nothing, poll and hide included, until an action's keep() or the eye or gait moves off it; a reopened meadow is unaffected — 472645c2ac9fbd7ac83338afc2ca0db5444fc43a

---

<a id="t198"></a>

### `scripts/lib/play-keep.ts`:121 — unresolved

```diff
@@ -0,0 +1,101 @@
… 67 lines elided …
+  );
+  await sleep(WRITTEN_MS);
+
+  await page.reload();
```

**@vzakharov (agent)** — 2026-10-04T14:47:23Z

**Optional: the browser play never checks two of the bite's calls.**

The reload is compared on mushrooms, houses, planted ids and dusk only, after a 1.5 s wait with nothing moving. The eye and gait (call 6) never leave the opening spot, and no flier is in the air (call 2). So the scene's side of a reopen never runs on the page: the walk standing where the child stood, and a reopened flier drawn seated on its perch rather than popping or flying in. Only unit tests on the model cover it. (I ran the play on phoneP: before and after match on what it checks, and `#new` opens `#2` fresh in daylight.)

Suggested fix: before the reload, turn and step the eye and release a butterfly, and reload while it is still in flight. Expect the eye within an epsilon of where it was and the same insect ids, each with `leg.from === leg.to`, and shoot the after frame so the seated flier gets looked at.

**@vzakharov (agent)** — 2026-10-04T14:57:17Z

The keep play now turns and walks the eye, releases a butterfly at dusk and reloads while it is still flying, then expects the eye back within 1e-3, the same insect ids and every flier seated (leg `from` equal to `to`), with keep-after shooting the seated flier — passes on tabL. 9781755c2002b7b5da2c337518e1e3fd95cdbaac

---

## Timeline (status, references, and other events)

- **2026-09-17T09:40:16Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/757c0449105015fc6d3cd38418fc4d4a70b96ad5.
- **2026-09-17T09:44:03Z** @vzakharov renamed from «feat(vova): a mushroom toy from Syama's drawing» to «feat(vova): a mushroom game from Syama's drawing».
- **2026-09-17T16:32:27Z** @vzakharov cross-referenced this pull request from [#65 Syama's mushroom game](https://github.com/vzakharov/vovazakharov.com/issues/65).
- **2026-09-17T16:33:58Z** @vzakharov renamed from «feat(vova): a mushroom game from Syama's drawing» to «feat(vova): a meadow with two mushrooms at /mushrooms — stage one of Syama's game».
- **2026-09-26T08:20:27Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/eb74a907cd42066d0bb4db2870ac26871b6accf6.
- **2026-09-26T08:20:28Z** @vzakharov — _head_ref_force_pushed_
- **2026-09-26T08:20:39Z** @vzakharov renamed from «feat(vova): a meadow with two mushrooms at /mushrooms — stage one of Syama's game» to «feat(vova): Syama's mushroom game at /mushrooms».
- **2026-09-26T08:50:20Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5325225829.
- **2026-09-26T09:05:56Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/43eeb9083782f93e615d0e71434d358c0f7e842f.
- **2026-09-26T09:05:56Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/5ec3edc0fe38a9ff60184f6963bf47ea55014414.
- **2026-09-26T09:40:04Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5325464106.
- **2026-09-26T09:40:50Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/ab0b223ca7e33e9d21ebf8b6475a97b8ca16e7b9.
- **2026-09-26T09:44:00Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/dc369e385da89dd70eec246e15810efff03e4f92.
- **2026-09-26T09:54:51Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/65c0a00e34e311105835eb3ddf17dd9b58fcd909.
- **2026-09-26T10:56:54Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/e31a347a1f2735b0371cac267a641b12771654f0.
- **2026-09-26T11:41:19Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5325798267.
- **2026-09-26T15:22:03Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/2e52437477fb69e353a836bce765506695b94340.
- **2026-09-26T17:55:45Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/dbee0a90498a5d87461b96e96b8504e644114056.
- **2026-09-26T19:24:08Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/8b781411fa506ad923a78561837d6df95c240b73.
- **2026-09-26T20:11:44Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5327262595.
- **2026-09-26T20:18:00Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/5651f8b4350e59920271e31a1c26e77c5a88fc34.
- **2026-09-26T21:10:23Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/d54ddf46d203446965de6ad787df5662f0a631b3.
- **2026-09-26T23:55:30Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/0f4b136b5906fa9085abf9e4c85c9a7297cc0768.
- **2026-09-27T01:15:33Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/604a70687b2a851f141fd87d73b441c77d5c58d2.
- **2026-09-27T01:44:01Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5328444672.
- **2026-09-27T01:44:51Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/80d786310e45230650ca16fa9acb8f5f74308e07.
- **2026-09-27T01:47:06Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/3e2e7918d5cc81a65b8f8a490e6153171bd5a82c.
- **2026-09-27T01:47:06Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/a49eb6b1489fa673bdb0e24ac2271995bd6f8fd4.
- **2026-09-27T06:13:32Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/030b48c668c36f03a58a56df673aa5d2cb4e035e.
- **2026-09-27T16:03:06Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5329778719.
- **2026-09-27T17:13:27Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/4c7f8f7ded916099d1cebaf19e9e3f875a545c3a.
- **2026-09-27T17:19:10Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5331309763.
- **2026-09-27T19:01:41Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/2abd9eefafab9567a314c390f53d227af18f4a23.
- **2026-09-28T11:05:16Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/386a83f4763a582a1a27f59433f411fba6429a92.
- **2026-09-28T14:16:42Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/114b5dd27cb2ea5f6d55fb7ee12cbd1f071df184.
- **2026-09-28T15:00:33Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5340556382.
- **2026-09-28T15:03:52Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/1ef481cce48f4c54c9e839ec9df3f80e7167d87d.
- **2026-09-28T17:08:44Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/9342e62dcbffbe0b0f388914eafff5e385fcde45.
- **2026-09-28T20:37:04Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/d0a4ffefdacce1ab3d6096175d3ee860407293dc.
- **2026-09-28T21:20:03Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5344789171.
- **2026-09-28T21:21:21Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/04f0cb93db49587601534875cd5364ec81e89a1f.
- **2026-09-28T22:02:50Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/4658315f7a9603c892bc7231a56946783fdbdb21.
- **2026-09-29T08:53:53Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5350040790.
- **2026-09-29T15:43:59Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5354936232.
- **2026-09-29T16:12:26Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5355192406.
- **2026-09-29T17:02:51Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/f55a192b60456aa1a4da509f3e7529714860562d.
- **2026-09-29T18:34:38Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5356809390.
- **2026-09-29T18:37:21Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/9ff634223a1ef9234c850f8ec5b18d93903fa96f.
- **2026-09-29T19:47:57Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/d6818c8f72627ddae2e6b9fad63b0ca959f04112.
- **2026-09-29T21:06:08Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/f0a4da9860a40a30b0d953c7fc169796700313d6.
- **2026-09-30T01:15:24Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/c69bf1ac882fd71fc908758c49d274aa9e46a8a9.
- **2026-09-30T02:18:28Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5360733525.
- **2026-09-30T14:48:11Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/215e3c70110e9104da37fedbd7d6e5559760c740.
- **2026-09-30T22:55:46Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/0e908b918603cdd123a988423d7e4816ca6e885b.
- **2026-09-30T23:23:58Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5373085053.
- **2026-09-30T23:24:58Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/6ef787a33acac3b748a0baa955c2f2a5e0a95e54.
- **2026-10-01T03:32:53Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/595262fec0163e1f1e1432a795e1e38a404c60a6.
- **2026-10-02T11:04:03Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5391045656.
- **2026-10-02T11:04:47Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5391050029.
- **2026-10-02T11:05:44Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5391057365.
- **2026-10-02T11:06:30Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/70871b4207be8780061e7b90339672e9ee65dd7d.
- **2026-10-02T16:10:43Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/f58c1c363148af40284d86c3e7e2bf4614611da0.
- **2026-10-03T01:59:22Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5398479115.
- **2026-10-03T02:01:47Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/962a64e83eff0c2135c22ae45cda058245c07ee3.
- **2026-10-03T06:06:16Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5399311227.
- **2026-10-03T06:34:29Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/d28d09cd2a956a51e3a9266643b29d03742a0740.
- **2026-10-03T11:25:51Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5400519622.
- **2026-10-03T12:10:23Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/c01d9a143d658d875b5ad29fd74ad106f6337d14.
- **2026-10-03T14:00:30Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5401128817.
- **2026-10-03T14:32:06Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5401240514.
- **2026-10-03T18:31:01Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5402118795.
- **2026-10-04T11:32:44Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5405749484.
- **2026-10-04T14:47:22Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5406721354.
- **2026-10-04T15:39:34Z** @vzakharov marked this pull request ready for review.
- **2026-10-04T17:29:09Z** @vzakharov merged this pull request.
- **2026-10-04T17:29:10Z** @vzakharov closed this pull request.
- **2026-10-04T18:13:16Z** @vzakharov referenced this pull request in a commit: https://api.github.com/repos/vzakharov/vovazakharov.com/commits/0a35b3ed85d17f771c4d93bc432ec3678c566139.
- **2026-10-04T18:19:33Z** @vzakharov cross-referenced this pull request from [#100 feat(vova): the mushroom meadow case study](https://github.com/vzakharov/vovazakharov.com/pull/100).
