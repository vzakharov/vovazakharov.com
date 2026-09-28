# PR #57: feat(vova): Syama's mushroom game at /mushrooms

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/57
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/mushroom-game-syama-lbirv7
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-09-17T09:39:48Z
- **Updated:** 2026-09-28T21:21:42Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- Syama's mushroom game at `/mushrooms`, the whole of it, spec in #65: a meadow of mushrooms with mouse houses, where `+` grows another mushroom (a picker of four species first — fly agaric, porcini, chanterelle, russula), `−` takes one away, and three bug buttons fly in a butterfly, a fly or a bee. No goal, no text, no failing — made for a six-year-old's hands on a tablet or phone.
- Everything is drawn and voiced by code: each mushroom, flower and insect is grown from its own seed by a pure, tested generator and painted with Phaser 4 vector primitives; sound is synthesized with Web Audio. Phaser loads on this route alone, and the canvas renders at the device pixel ratio so a retina tablet stays sharp.
- Four people's loves go into it: Syama's idea, procedural generation, Zoltan's ecology, and Leysan's mandalas. The ecology: bees pollinate flowers into new ones, a tapped cloud rains and the meadow answers, spores sprout after rain, dusk brings out the mice and fireflies. It is all shown in plain sight and never taught. The mandalas: the ornament is radial and ringed (the sun's rosette, the flowers' petal rings), without any mandala drawn as such.
- Built as an elephant (`docs/plans/mushroom-game-syama.*.md`), a bite per session, each bite reviewed by a fresh session and the review handled by the next, until finalize. The game as it stands is also published as an Artifact (below). **Bites 1–8 of 12 have landed, 1–7 each with its review handled and bite 8 awaiting its review — with bite 6 the game reaches its MPP line, every control in Syama's drawing working:** the meadow, still, with the opening pair standing as one clump like the drawing's; the meadow alive and heard — idle motion, tap wobble and spores, seeded flowers that bloom when tapped, a synthesized soundscape with a mute button; and more mushrooms — `+` opens a four-cap picker and grows the pick out of the ground, a tap selects a mushroom and `−` sinks it back, up to six in a forest round the clump, all through a pure reducer in `model/game.ts`.
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
- **Play it:** https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG — the game as one page (`pnpm artifact:mushrooms` builds it, titled "Syama's mushrooms"). The link is private until shared from its Share menu. Frames of every bite, as a child sees the meadow, are in [`docs/remove-before-merging/frames/`](https://github.com/vzakharov/vovazakharov.com/tree/claude/mushroom-game-syama-lbirv7/docs/remove-before-merging/frames) (bite 6's after its review in `bite-6/`, the review's own in `bite-6/review/`, bite 7's in `bite-7/`, its review's handling in `bite-7/handle/`, bite 8's species close up, housed and mixed in a meadow in [`bite-8/`](https://github.com/vzakharov/vovazakharov.com/tree/claude/mushroom-game-syama-lbirv7/docs/remove-before-merging/frames/bite-8)).
- **Still open, carried from bite 8:** the porcini's stem still reads long rather than stout, and the chanterelle golden-amber rather than strong orange; the clump has no slack left for a stouter porcini or a shorter chanterelle (its back door 80.7% in sight against an 80% floor, a chanterelle's back cap 45.1% against 45%), so either wants the clump laid out per species; the flowers-off-feet sweep fails as soon as the largest reach grows, as though flowers were placed against another meadow than the one it checks. The sky may read a little plain since bite 7 tamed the halo. From bite 6: a flier crossing the meadow is drawn straight over one seated on a cap; on a 320 px phone the air seats eight of ten fliers apart (`AIR_UNMET`, three `todo` tests); a flight in from off screen takes up to 5 s for a butterfly; a butterfly making way for a bee may read as a twitch; a flier holding an air spot is drawn still.
- **One call for you (bite 2):** the mute is remembered in `localStorage`, and where storage throws (a private window) the game falls back to unmuted and the mute lasts the visit. That is a silent fallback, which `CLAUDE.md` asks you to approve per call site — `readMuted` / `rememberMuted` in `src/pages/mushrooms/ui/scene/sound.ts`. The alternative, letting it throw, would take the whole meadow down for a remembered preference.

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
- [ ] `mute` — the top-left pictogram toggles speaker waves and a cross, silences everything (the synth suspends, so a muted game uses no audio), and a reload remembers it.
- [ ] `resize` — rotating mid-wobble or mid-bloom leaves the movement running in the new layout.

Bite 3, as its review left it:

- [ ] `controls` — a `+` and a `−` sit on the right, each a fly agaric with a bold sign on a badge; `+` is dimmed with six mushrooms up, `−` with none; every button is opaque, the sky not showing through it.
- [ ] `picker` — `+` unfolds four big cap buttons across the top, one after another from the end nearest `+`, below the mute on a phone; each cap tells apart at a glance, a two-tone cap's tones divided by an ink line. `−`, or a tap on a flower or the bare meadow, folds the row back towards `+`.
- [ ] `grow` — a pick presses the cap in, which swells and flies down to where the new mushroom grows out of the ground with a puff and a bloop, selected; the other caps sink away in turn, and no flower or other mushroom moves.
- [ ] `select` — a tap on a mushroom outlines it in a thick ink-edged yellow band and rings its foot; the outline grows, breathes and rocks with it, and the mushroom slowly beckons taller and back. Either clump mushroom is picked by whichever cap or stem is painted on top where the finger lands. A tap on the bare meadow lets go.
- [ ] `remove` — `−` sinks the selected mushroom back into the ground with a falling slide; with nothing selected it takes the newest planted instead, down to none.
- [ ] `refuse` — `+` on a full meadow and `−` on an empty one shake their heads side to side with a low reedy "nuh-uh" rather than doing nothing.
- [ ] `forest` — six at most: the clump, two nearer, a back row smaller and hazed toward the sky; on a phone either way up every forest cap is at least a fingertip wide and mostly in view.
- [ ] `clear` — on a phone held upright and sideways and on a tablet either way up, no button sits on a mushroom or in the sun's rays, and a tap near a button's edge never lands on a mushroom behind it.
- [ ] `play` — `pnpm play:mushrooms` builds, plays all five screens, prints `played` for each and exits 0; its frames land in `tmp/play/`.

Bite 4:

- [ ] `house` — a house button stands under `−`: a fly agaric with two windows in its cap and a door in its stem, dimmed with no mushrooms up. On phone landscape it stands left of `+`; on a 320 px phone it takes the top right corner.
- [ ] `furnish-picker` — the house button unfolds five buttons across the top (four windows and the door) from the end nearest it; on a 320 px phone four fit the row and the fifth sits beside the mute. `+` closes it and opens the caps, and the house button closes the caps and opens it, the one closing going at once. Opening it with nothing selected selects the newest mushroom with room for a piece, skipping a full one. A tap on the bare meadow closes it; a tap on a mushroom, or on a door, leaves it open.
- [ ] `windows` — with a mushroom selected, each window pick puts that kind into the cap's row with a puff of spores and a knock-knock, centre first, then left and right in turn; a narrow cap takes three, a wide one five, and each sits inside the cap; a spot it would half-cover is gone, and none peeks from under a window's edge.
- [ ] `full` — a window pick on a full row, or a door pick on a mushroom that has one, shakes that button's head with the "nuh-uh" and changes nothing; the button is dimmed while it cannot act.
- [ ] `door` — the door pick puts an arched wooden door with a knob on the stem, standing just high enough that the mushroom in front leaves it in sight (on either clump mushroom, across a dozen reloads, both ways up); it grows, breathes, wobbles and sinks with its mushroom, and `−` takes the house with the mushroom.
- [ ] `mouse` — left alone, each door now and then swings open and a grey mouse's head rises into the doorway, looks left and right, blinks and ducks back, each mushroom on its own rhythm; none of the mouse shows outside the doorway or under the sill. In a small door the head is still big enough to read on a phone, leaning out with its shoulders showing.
- [ ] `door-tap` — a tap on or just around a door, even a small one, calls its mouse out at once with a squeak, without selecting or deselecting anything; a tap on a window reaches the mushroom behind it.

Bite 5:

- [ ] `butterfly-button` — a butterfly pictogram (orange, with cobalt edges and eyes) stands at the left level with `+`; on phone landscape and a 320 px phone it sits beside the mute instead, and on no screen does it touch a picker row, the mute or the sun's rays.
- [ ] `release` — each tap flies in a butterfly from off one side with a trill, each one different in colour, eyes and wing shape, four seldom sharing a colour, every eye two or three rings inside its wing; the fifth sends the oldest off screen and it is gone, the other four staying.
- [ ] `flight` — butterflies fly on bowed, fluttering paths with fast-beating wings, slow enough to follow with a finger, banking into the turn, and land on a cap as it breathes with a little bob, or on a flower's upper rim as it sways; no two share a perch or sit on top of each other. At rest on a cap the wings open and close slowly and the butterfly turns to face up the screen, give or take, then turns into its heading when it takes off, never spinning the long way round.
- [ ] `drink` — at a flower a butterfly uncurls its proboscis down into the flower's centre and sips, the wings flexing half shut; the head sags under it and springs back with a flicker of its petals as it leaves. No butterfly drinks at a flower whose head is under a button, off the screen's edge or behind a nearer mushroom.
- [ ] `roam` — with only the opening pair up on a small phone, release four: those with no free perch roam between spots in the sky, hovering with beating wings, and none flies off screen until a fifth sends the oldest away.
- [ ] `startle` — a tap on a butterfly at rest sends it off at once and goes on to what it sits on: the mushroom under it is selected with its wobble and spores, the flower under it blooms and chimes. A tap on one in the air jolts it, leaves its flight as it was, and closes no picker nor changes the selection.
- [ ] `sink` — `−` on a mushroom a butterfly rests on sends it off as the cap sinks, never left hovering where the cap was.
- [ ] `insect-size` — on a phone either way up a butterfly is big enough to read and tap, and never wider than a clump cap.

Bite 6, as its review left it:

- [ ] `buzzer-buttons` — a fly (green body, red eyes) and a bee (banded, baskets full) stand under the butterfly down the left, or in a row beside the mute on phone landscape; on a 320 px phone the fly and the bee hide while a picker is open and come back when it closes. None touches another control or the sun's rays.
- [ ] `release-kinds` — each tap on the fly or the bee flies one in with a buzz (a thin rasp for the fly, a lower hum for the bee), each different in sheen or bands; a fourth of a kind sends that kind's oldest away and leaves the others.
- [ ] `fly` — flies dart on fast zigzags, mostly to caps and most often to the fly agarics; at rest a fly's wings lie back over its body, it visibly trembles, rubs its front legs every few seconds and hops a little along the cap and back.
- [ ] `bee` — bees fly straight, bobbing, only ever to flowers, sit on the flower's lower rim facing in so most of the flower still shows, and crawl about it, their wings flicking now and then in a stroke the eye can follow; their baskets fill with pollen as they go and empty at a new flower.
- [ ] `bees-share` — with four butterflies and three bees out, on a tablet and on a 320 px phone, the bees spend most of their time on flowers rather than roaming the sky; a butterfly or fly on a flower a bee is waiting for moves off and the bee lands.
- [ ] `planting` — with only bees out on a tablet, flower after flower is planted beside ones they visited, not just one: each grows up out of the ground and opens with a chime; a well-visited flower gets a ring of them, never past 14 flowers, none under a button or off the screen. A planted flower sways, blooms when tapped and is visited like any other.
- [ ] `no-overlap` — on a 320 px phone with every kind at its limit, none flies off unsent, fliers hovering in the sky rarely sit on top of each other, and no insect ever spins round in a frame.
- [ ] `catch` — on a tablet and a phone held sideways, a flier in the air is easy to tap with a finger, and a tap where two cross reaches the one nearest the finger; no flight drags across the screen.
- [ ] `turn-first` — a butterfly or fly leaving its perch turns on the spot to face its way before it flies, and one landing on a beckoning or wobbling cap faces the way it comes in; a cap let go of, or picked again, settles and swells smoothly with no snap.
- [ ] `mute-drops` — mute, release a bee or two and wait for a planting, then unmute: nothing sounds at once on unmute, and the next tap is heard as usual.
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
- [ ] `porcini` — a brown bun cap, tan to chestnut from one to the next, with a paler margin, on a stout whitish stem with a faint net under the cap and a darker shadow at its foot; its edge reads clearly against the grass.
- [ ] `chanterelle` — an upright apricot trumpet, stem and funnel one piece with no line across the joint, its mouth open over a waving rim, paler ridges running from the rim down the stem; a far one in the back row still reads orange.
- [ ] `russula` — a flattish cap dipping at the middle, paler there, in red, rose, violet, ochre or green across reloads, over white gills and a straight white stem.
- [ ] `species-light` — every species' shade, rim light and shine sit on the sun's side as the fly agaric's do; inside a chanterelle's mouth the far wall is shaded on the sun's side and lit on the other, as a hollow is.
- [ ] `species-house` — a porcini and a russula take three or five windows, a chanterelle one on its funnel under the rim; on a dark porcini cap each window frame has a pale line round it; the door stands on every species' stem, level with the ground whatever the lean, and a porcini's door stays door-sized.
- [ ] `clump-doors` — with both clump mushrooms housed, a tap on either door calls that door's mouse, the nearer door taking a tap where the two are close.
- [ ] `species-perch` — a butterfly sits on each species' cap as it is drawn — on a chanterelle's lip, not hovering over its mouth — and flies still go to the fly agaric far more often than any other cap.
- [ ] `species-forest` — a full forest mixing all four stays clear of every button and the sun, each cap at least a fingertip wide and mostly in view, on a phone either way up and on a tablet.

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
| `mute`   | partly      | no                                | `localStorage` key `mushrooms-muted`; the context read `running` → `suspended` → `running` in Playwright |
| `resize` | partly      | no                                | motion is set from the clock each frame, never from tweens   |
| `controls` | partly    | yes — `layout.test.ts`, `game.test.ts` | placement on six screens and `isFull`/`isEmpty`; the dimming and the opaque discs looked at in frames |
| `picker` | partly      | yes — `motion.test.ts`, `pnpm play:mushrooms` (not in vet) | `launch`; the script taps `+`, shoots mid-close and checks a flower tap closes it; telling caps apart looked at in frames |
| `grow`   | e2e         | yes — `game.test.ts`, `pnpm play:mushrooms` (not in vet) | the reducer and `emerge`; the script checks a pick grows one mushroom, selected, and closes the picker |
| `select` | e2e         | yes — `layout.test.ts`, `motion.test.ts`, `pnpm play:mushrooms` (not in vet) | tap area against the drawn clump over 2000 visits on six screens; `beckon`; the script taps a mushroom and checks it is selected; the outline looked at in frames |
| `remove` | e2e         | yes — `game.test.ts`, `pnpm play:mushrooms` (not in vet) | selected, then newest, then empty, both in the reducer and by taps |
| `refuse` | e2e         | yes — `motion.test.ts`, `pnpm play:mushrooms` (not in vet) | `shake`; the script checks `−` on an empty meadow shakes; the sound needs ears |
| `forest` | unit        | yes — `layout.test.ts`            | the finger-size floor per slot and at most 25% of a cap hidden, over 2000 visits on six screens |
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
| `insect-size` | unit   | yes — `insect-layout.test.ts`     | every butterfly's span ≥ the phone floor and under the narrowest clump cap on every screen |
| `buzzer-buttons` | unit | yes — `layout.test.ts`, `pnpm play:mushrooms` (not in vet) | placement, reach and overlap with every control on six screens, and the yielding band on a 320 px phone; the pictograms looked at in frames |
| `release-kinds` | e2e  | yes — `swarm.test.ts`, `buzz-genes.test.ts`, `pnpm play:mushrooms` (not in vet) | per-kind limits and eviction; genes in range over many seeds; the script releases each kind past its limit on five screens; the buzzes need ears |
| `fly`    | partly      | yes — `flight-kinds.test.ts`, `insect-paths.test.ts`, `buzz-rest.test.ts`, `pnpm play:mushrooms` (not in vet) | the cap share and the spotted pull; the zigzag continuous; jitter, rub and hop continuous and bounded; the script counts fly rests on fly agarics against other caps; the look of it is manual |
| `bee`    | partly      | yes — `flight-kinds.test.ts`, `pollen.test.ts`, `buzz-rest.test.ts` | never a cap, never back on the flower it leaves; pollen specks per visit; the crawl bounded; the rest flutter's per-frame step bounded; the rim seat and how much flower shows looked at in frames |
| `bees-share` | e2e     | yes — `fliers.test.ts`, `perch-sight.test.ts` | bees roam under 25% on every `VIEWPORTS` screen over played visits; crowding by kind; `givesWay` / `flowerFreed` |
| `planting` | e2e       | yes — `pollen.test.ts`, `swarm.test.ts`, `flower-plots.test.ts`, `pnpm play:mushrooms` (not in vet) | `sown` and `FLOWER_LIMIT`; replays plant the same flowers; ring slots in sight on this screen over the sweep; the script waits for a bee to plant on every screen and checks the flower full grown |
| `no-overlap` | e2e     | partly — `fliers.test.ts`, `insect-steering.test.ts`, `pnpm play:mushrooms` (not in vet) | no flier lost and no air spots overlapping over the sweep, except the small phone's `AIR_UNMET` (two `todo` tests); the script watches every frame for hover overlaps and heading against the flight |
| `catch`  | e2e         | yes — `fliers.test.ts`, `insect-tap.test.ts` | every kind caught ≥70% of the time on every screen; the nearest body takes the tap; flight times bounded by `slowest` |
| `turn-first` | unit    | yes — `insect-steering.test.ts`, `motion.test.ts`, `pnpm play:mushrooms` (not in vet) | the pivot before a flight, flying to beckoning caps and a still hop; the beckon's settle continuous through a release and a reselect; the play run's heading watch on five screens |
| `mute-drops` | manual-only | —                            | needs ears: `play` builds a voice only while the synth is heard |
| `sun`    | unit        | yes — `sun-layout.test.ts`        | the disc above the horizon and both hill ranges, the rays clear of the far hills, over the sweep |
| `buzzer-size` | unit   | yes — `insect-layout.test.ts`, `pnpm play:mushrooms` (not in vet) | the floor on every screen, and each drawn span read back in the play run |
| `one-light` | partly   | yes — `light.test.ts`, `mushroom-light.test.ts`, `ink.test.ts` | `sunLight` toward the sun on every screen; cap, spot and stem shade on the side away, the cast shadow falling away; the rest looked at in frames |
| `sky-air` | partly     | yes — `backdrop-tones.test.ts`, `skyline.test.ts` | no grey anywhere in the sky on every screen, the halo in steps too fine to read, ranges gaining contrast front to back and paling at the foot, a lit rim only on sunward slopes |
| `ground`  | partly     | yes — `ground-seam.test.ts`, `grain.test.ts`, `backdrop-tones.test.ts` | the seam wavers on every screen and draws no colour line; the lit band lifts gradually; the grain neutral on the whole and fading in; tufts stand out more near than far |
| `own-ink` | partly     | yes — `ink.test.ts`, `palette-creatures.test.ts` | every ink reads against the ground and off its fill; the weighted outline thin in the light, the taper; the fly agaric's red looked at in frames |
| `not-gloomy` | manual-only | —                               | judged beside `reference/syama-drawing.webp` in the frames |
| `hud-steady` | partly  | yes — `light.test.ts`, `baking.test.ts` | `PICTOGRAM_LIGHT` fixed; each face's texels on whole device pixels; the ring looked at in frames |
| `halo`    | partly     | yes — `backdrop-tones.test.ts`, `skyline.test.ts` | the halo falls off to the sky's own colour with no plateau, the parting wider than the glow; the look of it in frames |
| `wash`    | unit       | yes — `sun-layout.test.ts`        | every ring short of every slot's foot and shadow on every screen |
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
| `clump-doors` | e2e    | partly — `pnpm play:mushrooms` (not in vet) | the script taps both clump doors; the nearer-door rule itself has no unit test |
| `species-perch` | unit | yes — `mushroom-pose.test.ts`, `fliers.test.ts`, `pnpm play:mushrooms` (not in vet) | `capSeat` on the real surface; the fly agaric pull; the script waits for a butterfly on a chanterelle |
| `species-forest` | unit | yes — `layout.test.ts`, `flower-plots.test.ts` | the 2000-visit sweeps on six screens with every species in every slot |
| `play`   | e2e         | —                                 | it is the check; nothing runs it at merge |

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01APPVVPUTo7jV7T2kRUdGPS
https://claude.ai/code/session_01SdPhg6cj7GGedY3DgbfRVr
https://claude.ai/code/session_016Y6EaGWoqB9Vy7wF3UQzeb

---

## Comments

- **C01** @vzakharov (agent) — 2026-09-17T09:40:14Z — "Proposed squash title/body: ``` feat(vova): #65 Syama's mush…" → [↓](#c01)
- **C02** @vzakharov (agent) — 2026-09-27T03:39:07Z — "Bite 5's review is handled — all 12 threads answered inline.…" → [↓](#c02)
- **C03** @vzakharov (agent) — 2026-09-28T10:02:05Z — "Replies to review 5331309763's body; the inline threads T50–…" → [↓](#c03)
- **C04** @vzakharov (agent) — 2026-09-28T10:27:10Z — "Поиграть: https://claude.ai/artifact/Uce1gaKzySQ2FYHVb8mefG…" → [↓](#c04)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-09-17T09:40:14Z

[https://github.com/vzakharov/vovazakharov.com/pull/57#issuecomment-5712237909](https://github.com/vzakharov/vovazakharov.com/pull/57#issuecomment-5712237909)

Proposed squash title/body:

```
feat(vova): #65 Syama's mushroom meadow, with houses and insects (pr #57)
```

```
A six-year-old drew a game on squared paper and explained it in two
voice notes: fly agarics with a mouse house in each, a plus and a
minus for mushrooms, buttons that fly in a butterfly, a fly or a bee.
There is no goal and no text — the point is to watch. Issue #65 holds
the spec; every control in the drawing now works.

/mushrooms is a full-screen meadow drawn by Phaser 4, loaded on this
route alone and rendered at the device pixel ratio. Every mushroom,
flower and insect is grown from its own seed by a pure, tested
generator, and every motion is a pure function of the clock; sound is
a Web Audio synth with a remembered mute. The layout keeps every cap
on screen and every control clear of the meadow on any screen. The
meadow is painted in one light: shade, shine and shadows fall from
the sun as each thing sees it, hills recede into a shared air, and
every creature is inked in a dark of its own colour, its ink or fill
standing 3:1 off the ground under it.

Plus grows one of four species out of the ground — a fly agaric, a
porcini, a chanterelle trumpet, a russula in one of five colours —
and minus sinks one, up to six round the clump; the house button
furnishes any of them with Syama's windows and a door a mouse peeks
from. Three buttons fly in a
butterfly, a fly or a bee, each kind with its own limit, habits and
path: butterflies drink at flowers, flies zigzag to the fly agarics
and fidget there, bees carry pollen between flowers and plant new
ones in rings round those they pollinate, only where the new flower
is in sight. Fliers keep apart where they sit and hover, and a bee
waiting for a flower is made way for. A tap sends one at rest on its
way; a control that cannot act shakes its head.

A pure reducer in model/game.ts owns the state. Whatever stands still
— the backdrop, each button's face — is baked into a texture once a
paint, so a frame draws a few quads. pnpm play:mushrooms plays every
control on five screens in headless Chromium, watching every frame,
and fails on a page error, a wrong result or a median frame past its
budget.

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
- **T15** `src/pages/mushrooms/ui/scene/sound.ts`:202 — unresolved — last: @vzakharov (agent) 2026-09-26T09:48:28Z — "Done in 47fd58f. A mute fades out over `FADE_SECONDS` and th…" → [↓](#t15)
- **T16** `src/pages/mushrooms/ui/scene/mushroom-bed.ts`:255 — unresolved — last: @vzakharov (agent) 2026-09-26T15:56:10Z — "Fixed in da50a85, both halves. The call now passes the confi…" → [↓](#t16)
- **T17** `src/pages/mushrooms/ui/scene/mushroom-bed.ts`:218 — unresolved — last: @vzakharov (agent) 2026-09-26T16:09:02Z — "Fixed in 87d72d3. The tap area is now built from the outline…" → [↓](#t17)
- **T18** `src/pages/mushrooms/ui/scene/layout.ts`:115 — unresolved — last: @vzakharov (agent) 2026-09-26T16:55:39Z — "Fixed in 45b2d64: a forest slot never stands under the size…" → [↓](#t18)
- **T19** `src/pages/mushrooms/ui/scene/layout.test.ts`:528 — unresolved — last: @vzakharov (agent) 2026-09-26T16:55:40Z — "Fixed in f1b8bc3, with the sun's rays tightened in 110e977.…" → [↓](#t19)
- **T20** `src/pages/mushrooms/ui/scene/layout.ts`:114 — unresolved — last: @vzakharov (agent) 2026-09-26T16:55:41Z — "Fixed in a71098e. A tall screen's ground now starts at half…" → [↓](#t20)
- **T21** `src/pages/mushrooms/ui/scene/mushroom-bed.ts`:48 — unresolved — last: @vzakharov (agent) 2026-09-26T17:30:56Z — "The faint glow rings are gone: a selected mushroom now wears…" → [↓](#t21)
- **T22** `src/pages/mushrooms/ui/scene/meadow-scene.ts`:130 — unresolved — last: @vzakharov (agent) 2026-09-26T17:12:56Z — "Done in 7c62305. `−` with nothing selected now sinks the new…" → [↓](#t22)
- **T23** `src/pages/mushrooms/ui/scene/controls.ts`:90 — unresolved — last: @vzakharov (agent) 2026-09-26T17:12:57Z — "Done in bfcaf78. The picker now closes on the clock as it op…" → [↓](#t23)
- **T24** `src/pages/mushrooms/ui/scene/hud.ts`:18 — unresolved — last: @vzakharov (agent) 2026-09-26T17:45:14Z — "Every disc is now opaque white with a full-strength ink rim…" → [↓](#t24)
- **T25** `src/pages/mushrooms/model/house.ts`:300 — unresolved — last: @vzakharov (agent) 2026-09-26T23:47:39Z — "Fixed in 330dd6d, with the clump retuned in 2d7ae65. A door…" → [↓](#t25)
- **T26** `src/pages/mushrooms/ui/scene/house-view.ts`:177 — unresolved — last: @vzakharov (agent) 2026-09-26T23:47:41Z — "Fixed in 43698d4. The door answers taps from a circle round…" → [↓](#t26)
- **T27** `src/pages/mushrooms/ui/scene/draw-mouse.ts`:17 — unresolved — last: @vzakharov (agent) 2026-09-26T23:47:42Z — "Fixed in 2ea224a, and a878235 makes the floor hold at the mu…" → [↓](#t27)
- **T28** `src/pages/mushrooms/ui/scene/draw-house.ts`:293 — unresolved — last: @vzakharov (agent) 2026-09-26T23:47:44Z — "Fixed in b569160. `paintedSpots(genes, house)` drops any spo…" → [↓](#t28)
- **T29** `src/pages/mushrooms/model/game.ts`:87 — unresolved — last: @vzakharov (agent) 2026-09-26T23:47:46Z — "Fixed in 32d6b36, both halves. Opening the house picker with…" → [↓](#t29)
- **T30** `src/pages/mushrooms/model/house.test.ts`:123 — unresolved — last: @vzakharov (agent) 2026-09-26T23:47:47Z — "Fixed in 330dd6d. `DOOR_FRAME` and the painted door now live…" → [↓](#t30)
- **T31** `scripts/lib/play-house.ts`:152 — unresolved — last: @vzakharov (agent) 2026-09-26T23:47:48Z — "Fixed in 3c92655. The play run asks the scene's own hit test…" → [↓](#t31)
- **T32** `src/pages/mushrooms/ui/scene/house-view.ts`:97 — unresolved — last: @vzakharov (agent) 2026-09-26T23:47:49Z — "Kept as it is, and written down in 2645fb9: a door belongs t…" → [↓](#t32)
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
- **T46** `.claude/skills/megabeast/notes.md`:514 — unresolved — last: @vzakharov (agent) 2026-09-27T17:13:42Z — "Записал вместе с зумом как байт 8: поле шире экрана, поворот…" → [↓](#t46)
- **T47** `.claude/skills/megabeast/notes.md`:128 — unresolved — last: @vzakharov (agent) 2026-09-27T17:13:44Z — "По таймингам: цепочка из восьми сессий прожила ~3,5 ч на бай…" → [↓](#t47)
- **T48** `docs/plans/mushroom-game-syama.paused.md`:118 — unresolved — last: @vzakharov (agent) 2026-09-27T17:13:45Z — "Байт 8 (широкое поле + пинч-зум), начиная с того, что есть;…" → [↓](#t48)
- **T49** `docs/plans/mushroom-game-syama.paused.md`:94 — unresolved — last: @vzakharov (agent) 2026-09-27T17:13:46Z — "Спасибо! Атмосфера — следующий байт (7), с референсами Gris,…" → [↓](#t49)
- **T50** `src/pages/mushrooms/model/flight.ts`:181 — unresolved — last: @vzakharov (agent) 2026-09-28T10:01:50Z — "Mostly met: no flier goes away except by eviction on any scr…" → [↓](#t50)
- **T51** `src/pages/mushrooms/ui/scene/flower-sight.ts`:299 — unresolved — last: @vzakharov (agent) 2026-09-28T10:01:52Z — "Done as asked: planting asks for sight on this screen only,…" → [↓](#t51)
- **T52** `src/pages/mushrooms/ui/scene/perch-sight.ts`:157 — unresolved — last: @vzakharov (agent) 2026-09-28T10:01:53Z — "Done: crowding now takes the pairing of kinds actually invol…" → [↓](#t52)
- **T53** `src/pages/mushrooms/ui/scene/perch-sight.ts`:175 — unresolved — last: @vzakharov (agent) 2026-09-28T10:01:55Z — "The tap half is done: a tap reaches the flier whose body is…" → [↓](#t53)
- **T54** `src/pages/mushrooms/ui/scene/sound.ts`:263 — unresolved — last: @vzakharov (agent) 2026-09-28T10:01:56Z — "Done: `play` builds a voice only while the synth is unmuted,…" → [↓](#t54)
- **T55** `src/pages/mushrooms/model/insect-motion.ts`:167 — unresolved — last: @vzakharov (agent) 2026-09-28T10:01:58Z — "Done: a resting flutter is one lift and one fall over 420 ms…" → [↓](#t55)
- **T56** `src/pages/mushrooms/ui/scene/flower-sight.ts`:71 — unresolved — last: @vzakharov (agent) 2026-09-28T10:01:59Z — "Done: a bee sits on the head's lower rim facing in instead o…" → [↓](#t56)
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
- **T68** `src/pages/mushrooms/ui/scene/mushroom-light.ts`:91 — unresolved — last: @vzakharov (agent) 2026-09-28T16:19:02Z — "Fixed in 52e3079: each mushroom takes its light from the cap…" → [↓](#t68)
- **T69** `src/pages/mushrooms/ui/scene/sun-layout.ts`:110 — unresolved — last: @vzakharov (agent) 2026-09-28T16:43:48Z — "Fixed in 2659e52: `washReach` also stops half a slot's size…" → [↓](#t69)
- **T70** `src/pages/mushrooms/ui/scene/grain.test.ts`:14 — unresolved — last: @vzakharov (agent) 2026-09-28T16:43:49Z — "Replaced in 1e2a3a9: the tests now check there is no seam wh…" → [↓](#t70)
- **T71** `src/pages/mushrooms/ui/scene/hud.ts`:31 — unresolved — last: @vzakharov (agent) 2026-09-28T16:12:38Z — "Fixed in both places: `hud.ts` takes 1/ratio in 8c9c15f, and…" → [↓](#t71)
- **T72** `src/pages/mushrooms/ui/scene/backdrop-tones.test.ts`:19 — unresolved — last: @vzakharov (agent) 2026-09-28T16:43:46Z — "Done in be2c5ee: the tests import `channels`, `luminance`, `…" → [↓](#t72)
- **T73** `docs/plans/mushroom-game-syama.in-progress.md`:479 — unresolved — last: @vzakharov (agent) 2026-09-28T15:52:21Z — "Restated in e0c93d4 as the property 570486e now holds: insec…" → [↓](#t73)
- **T74** `src/pages/mushrooms/ui/scene/mushroom-bed.ts`:364 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "**Door taps can go dead.** The plan says the nearer door tak…" → [↓](#t74)
- **T75** `src/pages/mushrooms/ui/scene/layout.ts`:91 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "**The clump's floors are breached for some species pairs.**…" → [↓](#t75)
- **T76** `src/pages/mushrooms/ui/scene/layout.test.ts`:78 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "`speciesOf` draws one random pair per visit, which is why th…" → [↓](#t76)
- **T77** `src/pages/mushrooms/ui/scene/layout.ts`:381 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "**The flowers-off-feet failure has the cause the Open paragr…" → [↓](#t77)
- **T78** `src/pages/mushrooms/ui/scene/layout.ts`:203 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "**Flowers grow under the buttons and behind the clump.** `pl…" → [↓](#t78)
- **T79** `src/pages/mushrooms/model/mushroom-genes.ts`:123 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "**The porcini reads long because it is as long as a fly agar…" → [↓](#t79)
- **T80** `src/pages/mushrooms/ui/scene/palette-creatures.ts`:40 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "**The chanterelle is amber because of its base colour, not t…" → [↓](#t80)
- **T81** `src/pages/mushrooms/ui/scene/mushroom-tints.test.ts`:78 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "`hue > 22 && hue < 46` is named "egg-yolk orange" and admits…" → [↓](#t81)
- **T82** `src/pages/mushrooms/model/mushroom-profile.ts`:69 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "**The rim wave is too small to see.** The median wave is 3.2…" → [↓](#t82)
- **T83** `src/pages/mushrooms/model/mushroom-outline.ts`:110 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "**The russula reads as a table on a pole, and the porcini's…" → [↓](#t83)
- **T84** `src/pages/mushrooms/ui/scene/draw-mushroom.ts`:128 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "**The selection's foot ring is sized by the cap, not the foo…" → [↓](#t84)
- **T85** `src/pages/mushrooms/ui/scene/shapes.ts`:31 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "**The yellow selection band has gaps where the grass shows t…" → [↓](#t85)
- **T86** `src/pages/mushrooms/model/mushroom-genes.test.ts`:94 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "This compares `GENE_RANGES` to itself, and the fly agaric's…" → [↓](#t86)
- **T87** `src/pages/mushrooms/model/mushroom-pose.test.ts`:55 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "This restates `maxReach`'s formula with the fly agaric's con…" → [↓](#t87)
- **T88** `src/pages/mushrooms/ui/scene/mushroom-light.test.ts`:249 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "Only a porcini gets the `HEAVY_FOOT` layer, and its `across`…" → [↓](#t88)
- **T89** `src/pages/mushrooms/ui/scene/mushroom-tints.test.ts`:23 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "`WEAK_EDGE` is written by hand, and the porcini fills sit ab…" → [↓](#t89)
- **T90** `scripts/lib/play-species.ts`:169 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "**The play run can pass with the page broken.** "No butterfl…" → [↓](#t90)
- **T91** `src/pages/mushrooms/ui/scene/hud.ts`:48 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "Hunch, unmeasured: in the picker (`docs/remove-before-mergin…" → [↓](#t91)
- **T92** `src/pages/mushrooms/ui/scene/paint-dome.ts`:20 — unresolved — last: @vzakharov (agent) 2026-09-28T21:20:04Z — "Minor: `DomeGenes` is a hand-written union that tracks `Mush…" → [↓](#t92)

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

### `src/pages/mushrooms/ui/scene/sound.ts`:202 — unresolved

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

### `src/pages/mushrooms/ui/scene/layout.ts`:115 — unresolved

```diff
@@ -0,0 +1,387 @@
… 81 lines elided …
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

### `src/pages/mushrooms/ui/scene/layout.test.ts`:528 — unresolved

```diff
@@ -0,0 +1,138 @@
… 123 lines elided …
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

### `src/pages/mushrooms/ui/scene/layout.ts`:114 — unresolved

```diff
@@ -0,0 +1,387 @@
… 80 lines elided …
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

### `src/pages/mushrooms/ui/scene/meadow-scene.ts`:130 — unresolved

```diff
@@ -0,0 +1,236 @@
… 91 lines elided …
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

### `src/pages/mushrooms/model/house.ts`:300 — unresolved

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

### `src/pages/mushrooms/ui/scene/draw-house.ts`:293 — unresolved

```diff
@@ -0,0 +1,308 @@
… 279 lines elided …
+export type ShownDoor = Popped & Peeking & { open: number };
+
+/**
+ * A mushroom's windows and door, painted into `graphics` in the frame
+ * `drawMushroom` paints it in — the foot at the graphics' own position — so
+ * they go wherever the mushroom does. Each window in its slot of
+ * `windowSlots`, in the order it was put in; the door over the stem's foot,
+ * with the mouse in its doorway while it is open.
+ */
+export function paintHouse(
+  graphics: Phaser.GameObjects.Graphics,
+  genes: MushroomGenes,
+  size: number,
+  windows: readonly ShownWindow[],
… 9 lines elided …
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

### `src/pages/mushrooms/ui/scene/house-view.ts`:97 — unresolved

```diff
@@ -0,0 +1,189 @@
… 74 lines elided …
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

### `.claude/skills/megabeast/notes.md`:514 — unresolved

```diff
@@ -0,0 +1,464 @@
… 400 lines elided …
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

### `.claude/skills/megabeast/notes.md`:128 — unresolved

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

### `docs/plans/mushroom-game-syama.paused.md`:118 — unresolved

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

### `docs/plans/mushroom-game-syama.paused.md`:94 — unresolved

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

### `src/pages/mushrooms/ui/scene/flower-sight.ts`:71 — unresolved

```diff
@@ -0,0 +1,304 @@
… 63 lines elided …
+const HEAD_SHOWN = 0.5;
+const HEAD_RING = 8;
+/**
+ * How near two flowers' heads may come, as a share of the two heads' reach
+ * together, a planted one's taken at its widest.
+ */
+const FLOWERS_APART = 0.75;
+
… 13 lines elided …
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

### `src/pages/mushrooms/ui/scene/mushroom-light.ts`:91 — unresolved

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

### `src/pages/mushrooms/ui/scene/sun-layout.ts`:110 — unresolved

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

### `src/pages/mushrooms/ui/scene/mushroom-bed.ts`:364 — unresolved

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

---

<a id="t82"></a>

### `src/pages/mushrooms/model/mushroom-profile.ts`:69 — unresolved

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
- **2026-09-28T15:00:33Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5340556382.
- **2026-09-28T21:20:03Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/57#pullrequestreview-5344789171.
