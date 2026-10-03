# Decisions the whole game carries

The standing design of `docs/plans/mushroom-game-syama.*.md`, which keeps a pointer here.

- **No text anywhere in the game**, so a child of any age can play; every
  control is a pictogram drawn by code. Hence **no locales**: one route,
  metadata in English like the rest of the site.
- **No sprites, no asset files — everything is drawn and voiced by code.** A
  mushroom or an insect is a pure seeded generator (seed → genes: proportions,
  lean, spots, wing shape, a hue nudge) plus a routine that paints the genes
  with Phaser `Graphics`: outline, flat fill, a highlight, a shade — cartoon
  shading as layered shapes. The seed is the state; the genes are derived.
  Sound is synthesized with Web Audio, no files.
- **Phaser 4**, loaded on this route alone: dynamic import inside a
  `'use client'` component's `useEffect`, the game destroyed on unmount.
  `Scale.NONE` with the host sizing the buffer in device pixels, since
  `Scale.RESIZE` sizes it in CSS pixels and blurs every retina tablet; a
  full-bleed canvas at `100dvh`, `touch-action: none`. No physics engine;
  tweens and particles carry motion.
- **A pure model decides, the scene reconciles.** `model/` holds the state, a
  reducer and the generators, all Phaser-free and under `node:test`; the scene
  diffs states by id and animates the difference. A resize reconciles too: it
  repaints into the objects already on screen, never destroying one, so a
  rotation or a collapsing toolbar leaves every tween running. Randomness enters the model
  only as an injected seeded generator, so every test is deterministic.
- **Made for a six-year-old's hands.** Every target at least ~64 CSS px, one
  finger's taps and one drag — past a radial 24 px slop it locks its axis,
  within 45° of horizontal turning the child on the spot (or strafing, when
  it starts on the hills or the sky) and otherwise stepping along the
  heading, and nothing else drags — no double taps,
  nothing to lose, nothing to read. The one long press (~0.45 s inside the
  slop) is on a flower, which a tap only plays: it opens the picker to
  change or pull that flower, its note sounding at the press as a tap's
  does. Every tap answers within a frame with motion and sound; anything
  tappable in the meadow does something when tapped. Tablet landscape is the
  primary layout, phone portrait the second, desktop the third.
- **The child walks a small round world.** A heading turns through 360° and
  wraps; steps go along it, eased, inside a glade rim the eye slides along
  rather than stopping at. The sun, its wash and the clouds belong to
  headings, so the sun is the compass and none is drawn; the wash lies on
  the sky alone, and the hills are drawn live from one 360° crest, with no
  parallax. The far edge is a horizon: a brow drawn along the projection of
  the `D_SEE` circle round the eye, a thing beyond it sinking under it foot
  first by its distance — so it stays put on the brow as the child turns —
  and paling into haze as it goes.
- **Juice is the product.** Squash and stretch on every arrival, `Back.Out`
  overshoot, a puff of particles on pop-in, idle motion everywhere (grass
  sway, mushroom breathing, drifting clouds, wing beats), depth from layered
  hills and scale. Checked by frames, not by reading code: each bite ends
  with `/preview` screenshots and a scripted tap sequence captured frame by
  frame at tablet and phone sizes.
- **The meadow is a small ecosystem — the twist.** The operator asked for
  one: "не должна быть прямо competitive игра, но какие-то экологические
  штучки должны прослеживаться -- взаимодействия разных сущностей в природе и
  с самой природой". So each creature wants something from the meadow and
  gives something back, and a child sees the cause and its effect without a
  word: bees carry pollen from flower to flower and a new flower opens where
  they have been; butterflies drink from flowers and rest on caps; flies are
  drawn to the fly agarics; rain, from a tapped cloud, closes the flowers,
  sends the insects under the caps and makes the mushrooms swell, and once it
  stops, spores an old mushroom shed sprout into little ones and a rainbow
  comes out; at dusk the mice come out and the fireflies wake. **Shown,
  never taught** ("это не должно быть в виде назойливого научения, всё
  должно быть перед глазами, а не на объяснениях"): no hint, arrow, counter,
  reward or lesson points at a rule — each is simply what happens in plain
  sight, slow enough to be noticed and left to be discovered. Nothing
  starves, dies or is lost — the meadow only ever gets fuller and livelier,
  within the caps the layout sets. These rules are the model's, so they are
  tested like the rest: a `tick` in the reducer, driven by the scene's clock.
- **A mushroom is tapped where it is drawn, on every screen.** The opening
  zoom never falls below the floor at which the narrowest cap the genes
  allow is `2 × TAP_RADIUS` wide, and every screen holds the same twelve
  (`MUSHROOM_SLOTS`, counted round the new foot and round the anchor) in one
  world, rather than fewer on a small one: a count that changed with the
  screen would make a turned phone refuse or overfill. A turned phone may
  show fewer of the twelve than a landscape one laid out — phoneL keeps 5 of
  12 on screen, tabL 6 — and that is accepted: the field turns and walks, so
  a drag brings every one back. [Placing the opening inside the turned
  screen too: phoneL would refuse at 9, the count changing with the screen.]
  A mushroom grows clear of the controls where they stand and of the sun's
  wash.
- **No tap is ever answered with a shrug.** `−` with nothing selected sinks
  the newest mushroom, so `−` always takes something away and a selection
  only chooses which. A control that truly cannot act — `+` on a full meadow,
  `−` on an empty one — shakes its head, side to side, with a low two-note
  "nuh-uh" of its own, instead of the press it gives when it acts. Neither is
  dimmed while it can act.
- **A door belongs to its mushroom; a flower belongs to the meadow.** A flower
  tap is a tap on the meadow too, so it closes an open picker; a door tap
  calls the mouse and leaves an open picker open, as a tap on a mushroom leaves
  the house picker open.
- **A tap on a resting insect goes through it.** The insect flies off and the
  tap carries on to whatever it sits on — a mushroom is selected, a flower
  blooms — so a creature never costs the child the thing under it. An insect
  in flight takes the tap alone. Buttons stay above every insect.
- **An insect perches only clear of the world's edge.** A flower is a perch
  only while its head stands clear of the world's edge by the wingspan, and a
  released insect's first perch is on screen; the scene hands the model the
  flowers that qualify, by id. Two insects never share a perch: a
  leg's next perch skips any another flier sits on or is heading to, and any
  the scene marks as too close to one of those. A flier with no free perch
  roams the open air and tries again, so a butterfly is never lost for want
  of a perch; only the limit, a startle or its own leaving takes one away.
  At a flower a butterfly sits on the head's upper rim and drinks through a
  proboscis curled down into the centre, leaving the flower in sight; a fly
  sits on the centre, and a bee on the head's rim, facing in, so at least
  half of the head stays in sight under it. Two perches crowd each other by
  the wingspans of the kinds actually on them, never the widest for all. The
  air holds at least as many spots as all the kinds' limits together on
  every screen, so a flier leaves only by eviction, a startle or its own
  leaving.
- **Flowers stay put.** A turn, a step, a rotation or a growth never moves a
  flower, so a forest mushroom may stand in front of one. The seeded bed is
  placed once across the world; a child may replace or pull a seeded flower
  as a planted one, and a pulled flower leaves a tuft to plant again.
- **A tap on fliers in the air reaches the one whose body is nearest the
  finger**, not the one drawn on top, so the child gets the one they aimed
  at.
- **Butterflies are a meadow, not siblings.** Base colours are many enough
  that four on screen rarely repeat, each still derived from its seed alone.
  They cruise at about two thirds of bite 5's speed, so a child's finger can
  catch one. A perched butterfly keeps its size and may overhang a small cap:
  its tap goes through (above), and the overhang reads as a butterfly on a
  button mushroom. The fore wings' near-closed quarter of the beat stays —
  it blurs at 6 Hz, and only a still shows sticks.
- **Mandala-inspired ornament** — Leysan's ("не прямо чтобы рисовал
  мандалы, а именно inspired"). Radial symmetry and concentric rings are the
  meadow's ornamental language, and nothing in it is a drawn mandala: the
  sun a rosette of rays in layers; each flower an n-fold ring of petals over
  another, the fold and the rings being genes; the butterflies' wings
  carrying concentric eyes; the spore puff and the rain's splashes opening
  as rings; the flowers the bees plant opening around the ones they came
  from, so a well-visited bed grows round; the fireflies at dusk circling.
- **No module past ~450 lines** (CLAUDE.md § "Key principles"; the operator
  repeated it: "помни чтобы не было слишком больших (>450 строк) модулей").
  The scene is the one that would grow, so painting splits by layer
  (`paint-backdrop.ts`, one `draw-*.ts` per creature) and behaviour by
  creature, the scene class only orchestrating.
- **The `palette*.ts` modules are the one place on the site holding colour
  literals** — `palette.ts` with its two sections, `palette-backdrop.ts` and
  `palette-creatures.ts`. A canvas is out of the CSS tokens' reach;
  `.claude/rules/styling.md` § Colours says so in one sentence scoped to those
  paths.

## DRY notes

The reuse calls the whole game stands on.

- **Metadata reuses `constructMetadata` wholesale**, as the music page does;
  with no locale there is no `hreflang` map to build.
- **The route is one line and the sitemap one key**, `PAGE_ROUTES` already
  feeding `sitemap()`.
- **The game shares nothing below the page with the rest of the site, on
  purpose.** No other page has a canvas, an engine or a generator, so a
  `shared/game` segment or `features/` slice would have one consumer and fail
  Steiger's `insignificant-slice`; `Mushroom` and `Insect` are not
  `entities/` slices for the same reason.
- **Genes and drawing are two modules per creature** — one is tested, the
  other looked at. `random.ts` is shared by every generator, so it is its own
  module.
- **`Seeded = { seed: number }` and `WithId` are the bases** `Mushroom` and
  `Insect` both intersect, so `pnpm type-overlap` holds.
- **Numbers and colours have one home each**: `layout.ts` positions and sizes
  everything, `palette.ts` holds every base hue; a per-instance nudge is a
  gene.
