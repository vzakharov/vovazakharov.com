# Bite 12 — Walking the meadow

What bite 12 built, as `## Eaten so far` in `docs/plans/mushroom-game-syama.*.md` indexes it.

12. The child walks the meadow: turns on the spot through 360° and steps
    forward and back along the heading («ходить мы хотим. иначе как он
    "карту" засеивать будет?»). A real heading on a flat plane beat a
    strip stepped by a per-row zoom (no turning round, nothing to sow past
    the strip) and a ring of the strip joined at its ends (every world-px
    consumer wrapping, and a step still only a zoom). Under it every gene,
    painter, motion clock, reducer rule and bed object survived; what
    changed is where things are projected, the panorama and the input.
    Paths are under `src/pages/mushrooms/`. What the next bites build on:
    - **The eye and the pinhole.** `model/ground.ts`'s row projection was
      already a pinhole written per row, so the true pinhole derived from
      its constants (`EYE_HEIGHT` 4.154, `CLUMP_DISTANCE` 8.64, focal
      `unit·CLUMP_DISTANCE`) reproduces the opening frame exactly: an
      `Eye {x, y, heading}` on the plane, `OPENING_EYE` at the origin
      facing `+y`, `planeOf` taking a layout `Ground {x, z}` to the plane
      (`z` is a warped distance), `pinholeOf` and `viewOf`. A unit test
      holds `viewOf(OPENING_EYE)` to `project` less the opening left within
      1e-9 on every screen. Stored positions are still layout `Ground`,
      laid out once per screen for the opening eye; only the drawing is
      per frame.
    - **The view.** `ui/scene/view.ts` is the per-frame `View` and what
      each bed does with it: `ofGround`/`ofLayout` give a `Placed` (screen
      point, `zoom` = opening distance over distance now, `ahead` along the
      heading, `distance` on the plane), `cull` hides what is nearer than
      `V_NEAR` 2 (a test holds every species' tallest head below the
      screen's foot there, so the cull never pops), `onScreen`, and the
      horizon below. Every bed `follow(view)`s (`Following`) before its
      clock `update`: `bed-place.ts`'s `bedPlace` sets position, scale by
      `zoom`, depth by screen row (a turn reorders rows) and visibility.
      The camera never scrolls across; nothing rebakes on a step or a turn.
      `view-inverse.ts` maps a screen point back to the plane, layout px or
      `Ground`; `eye-crop.ts`'s `layoutShown` and `layoutAtRow` serve the
      consumers still in layout px.
    - **The walk is the scene's pure state, not the `Meadow`'s**, since it
      changes every frame and the reconcile-skip keys on the `Meadow`'s
      identity; the map (item 15) reads it from the scene. `model/pan.ts`
      became a heading crop (`turnOf`: no ends, wraps once round,
      `TURN_CRUISE` 0.38 rad/s on every screen — the tablet's bite-11 turn;
      kept in screen widths a phone held upright would take 60 s round).
      `model/stride.ts` is the step axis: `STRIDE_CRUISE` 1.6 units/s eased
      over `KEY_EASE` 0.25 s, `STEP_LENGTH` 0.8, both through one braking
      integrator, `model/cruise.ts`. `model/walk.ts` is the drag and keys
      machine over both; `ui/scene/eye-input.ts`'s `EyeInput` its Phaser
      shell and the one screen↔eye home. `pan.test.ts` held unchanged.
    - **The glade rim.** Bite 12's bounds are a disc, `GLADE` centre (0, 8)
      radius 12, holding the whole opening frame with 4 units to step back
      from the opening. At the rim the walk slides along the arc at its
      full pace and brakes to rest where the rim stands square to it; the
      room ahead counts the slide, since the bare ray would brake every
      slanting walk dead at first contact. Beaten: bounds shaped like the
      opening wedge (its corners trap a child mid-turn) and none (a walk
      off into bare ground). No collisions: the child walks through
      everything, since every mushroom is shorter than the eye. 12b takes
      the rim away.
    - **The drag is axis-locked.** The slop is radial, 24 px; inside it a
      press taps on the press, as bite 11 ruled. At the slop's crossing a
      drag within 45° of horizontal turns and anything steeper steps, the
      lock holding to the lift, so a child's drift while turning never
      walks her (beaten: both axes at once, like a dragged photo; the cost
      is a lift to switch). A turn keeps the azimuth under the finger,
      exact in angle (the x fed to `pan.ts` warped to `F·atan`), with
      pan's glide on release. A step chases the finger's ground row,
      measured from the crossing, never faster than `STRIDE_CRUISE`, and
      stops on arriving: a step has no glide. `↑`/`↓` walk as `←`/`→` turn,
      eased in and out, keys and fingers adding up; a press stops both.
    - **The sun is the compass**, so none is drawn (the operator: «солнце
      у нас всегда на месте, что makes no sense»). `panorama.ts` holds the
      azimuths: `azimuthAt`, `screenAt(view, α)`, `wrapAngle`. The glow,
      the sun and the wash are each a small baked `Turning` picture slid
      to the sun's azimuth, hidden out of view; the wash lies on the sky
      only, bounded from every eye by the farthest foot's clearance
      (stricter than the spec's `groundTop − sun.y`; the land's upper third
      lost its glow). Clouds go round the sky in lanes, each opening cloud
      leading `ceil(2π / view span)`, so every heading at every time shows
      at least three; their drift is angular. The opening frame's sun and
      three clouds stand where they stood.
    - **The hills are live.** A 360° baked panorama is 44–86 MB of texels
      and lazy strips rebaked ~100 ms twice a second while turning, so the
      three ranges are Graphics drawn from a periodic crest (`ringWave`,
      matching the old crests over the opening screen), redrawn only when
      the heading changes — about 0.5 ms of JS a frame. One bowl parts the
      far hills at the sun's azimuth. Rotation has no parallax and a step
      moves nothing at infinity, so the hills scroll at nothing. A band
      whose crest ends within Phaser's 1 px path skip of its corner filled
      a flat slab across the sky at some headings; `hillBands` drops such
      points (`PATH_SKIP`, tested through Phaser's own skip). The ground is
      screen-fixed rows and grain, valid from any eye; the mottles went,
      to come back as objects in 12b.
    - **The round brow, and the sink by distance.** The far edge reads as
      the horizon of a small round planet («выглядит как будто они просто
      прячутся в землю» was the reading with no edge drawn): a brow drawn
      along `browRow`, the screen row of the `D_SEE` (13.33) circle round
      the eye — highest at the screen's middle, lower toward its sides —
      with a crest and clumped blades round the panorama (`brow.ts`),
      redrawn only on a turn. A thing past `D_SEE` by its distance on the
      plane is drawn sunk below the brow at its own x by as much as its
      foot would stand above it (`sunk`), between the near hills and the
      ground picture, which covers it from the foot up as a ship goes
      under; under `SHOWN_LEAST` 0.2 of its height showing it is not drawn
      (`sunkAway`), and an insect is hidden once `buried`. Keyed on
      distance, a far thing stays put on the curve as the child turns.
      Beaten: an alpha fade from 12.3 (it misted the opening's back rows,
      and squeezed into 13.24–13.33 it popped), going behind the near
      hills (their lowest crest is a flower tall at the seam, so things
      vanished whole), and a straight brow keyed on the depth along the
      heading (a far flower rode up and down through it as the child
      turned). At the opening a thing laid past the circle near a screen's
      side starts partly sunk — on 5 visits one on phoneL, one on desktop.
    - **Haze by distance, through a repaint queue.** Walking up to a misty
      back-row mushroom clears it («подойдёт»). `repaint-queue.ts`:
      `hazeAhead` is the opening's haze for the ground row that far ahead,
      so the opening repaints nothing, plus `browPale` (up to `BROW_PALE`
      0.2 over 1.2 past `D_SEE`) as a thing nears the brow; a mushroom whose
      haze drifts `HAZE_DRIFT` 0.04 from what it was painted at is queued,
      at most `REPAINTS_PER_FRAME` 2 a frame, nearest first. Flowers carry
      no haze and pale by alpha. Light stays as painted at the opening;
      12b lights by heading through the same queue. Beaten: frozen haze (a
      foggy mushroom at arm's length) and a per-frame repaint (twenty
      mushrooms eat the frame).
    - **Taps only where drawn.** The finger pad round a narrow head is gone
      by the operator's idea-1 ruling: the front-most mushroom whose drawn
      parts hold the finger takes the tap (`mushroom-tap.ts`), and a
      flower's tap circle scales with `zoom`. Tested at the opening eye and
      one stepped 3 units in. `ZOOM_FLOOR` stays, fitting the opening
      clump.
    - **The patch rules.** With the pad gone a far cap could not hold a
      fixed patch, so phones grew no forest and four screens grew
      nothing behind the clump. Every mushroom's own tappable patch is now
      `GROWN_PATCH` 16 px, or `CLUMP_PATCH` 12 for the opening clump, at a
      tablet held sideways' camera unit, shrunk in proportion to a smaller
      screen's unit (never grown on a bigger one) and with depth
      (`× min(1, scaleAt(z))`), floored at `LEAST_PATCH` 6
      (`mushroom-patch.ts`), judged at the opening eye. The forest again
      grows into the misty back rows on every screen. Beaten: 8 px
      everywhere (tablet forests crowd for no gain), no growth on phones
      (breaks "the meadow only gets fuller"), a floor of 8 (the sideways
      phone's scaled patch is 7.6–4.9 px, so its back rows stayed shut), 5
      (the farthest cap's patch gets hard for a finger), and relaxing the
      tests that state the rule.
    - **`+` in the current view.** `roomFor(stand, seed, view)` keeps the
      meadow's rules at the opening eye and judges the screen's as the view
      projects: the cap box on screen, the foot neither culled nor past the
      brow, the controls and the sun's rays off the drawn outline,
      candidates drawn over what the view shows (`layoutShown`). Facing
      bare ground, `+` shakes its head.
    - **The planting spots are grass again.** Bite 10's sprout-and-bud
      tufts thinned and cluttered the ground («слишком noisy… травинки были
      ок, и ок когда их было больше»). The ground grows a lawn of plain
      three-blade tufts at the pre-bite-10 density (`TUFTS_PER_1000PX` 52),
      grown once per layout (`growTufts`) and filtered by what stands
      (`tendTufts`), **every one a planting spot** («сделать каждую
      травинку потенциальным местом для цветка»): a tuft where no flower
      fits is not drawn (`plantableIn`, judged at the opening eye), so none
      ever refuses, and a tap nothing else takes lands on the nearest one
      in reach. `shownSprouts` projects them each frame and their taps hit
      what was drawn; the seam's blades go round 360° by azimuth
      (`seamGrass`). A pulled flower leaves a tuft where it stood
      (`leaveTufts`), since every planting spot is a tuft (beaten: bare
      grass, hiding where the child can plant again).
    - **The keyboard plays only the flowers in view**
      (`keyed-flowers.ts`, `FlowerBed.inView`, `playTheMeadow`): a note or
      drum key sounds through a flower on the screen with that pitch class
      or drum, which answers as to a tap, and with none it is silent
      («"пианино" с клавиатуры не должно играть, если перед тобой нет
      подходящего цветка»). The octave keys stay. A sunk flower is out of
      view.
    - **A retap restarts** a flower's bounce from the top, as its sound
      already did.
    - **A flower can be changed or pulled.** A tap only plays it; a long
      press — `LONG_PRESS` 0.45 s inside the slop, its note sounding at the
      press (`flower-hold.ts`, `EyeInput`'s `heldStill`) — opens the picker
      on it (beaten: a picker on every tap, jumping from flower to flower
      through a melody). A plain ellipse on the ground where its stem
      enters marks it (`flower-ring.ts`, `PALETTE.heldFlower`, plainer than
      a mushroom's selection). The picker is the colour row plus a cross,
      then the shapes; the pick replaces the flower in place as a fresh
      planted id with the old one in `Meadow.pulled`, seeded flowers
      included, and the cross pulls it (`{ kind: 'flower' }`,
      `{ kind: 'pull' }`, `Planting.flower`). A press on the held flower
      keeps the picker as it stands; a press through a resting insect is a
      long press too, and startling an insect leaves a picker open on a
      flower alone; a pulled parent keeps its bees' flowers. **The cross
      yields to the sun**: it takes the first spot beside the colour row
      that keeps off the sun's disc and rays (`flowerCross`, `beside`),
      since moving the sun for it moved the sun on every screen at all
      times for a button shown only while picking. The model keeps nothing
      across a page reload, so "remembered" means across a relayout.
    - **Insects through an adapter.** They still fly every leg in the
      opening eye's layout px (`insect-view.ts`) and are drawn through
      `ofLayout` at a foot row — a perch's foot, a leg's two mixed by
      distance along it, the clump's row in the air — at their size,
      culled at `V_NEAR`. The sight rule is down to the world-edge test
      (`perch-sight.ts`); the cover by nearer mushrooms stays only as a
      planting rule (`flower-sight.ts`). A release enters past the screen
      edge nearer its first perch at that perch's row when one is on screen
      (`onscreenOf`), else from the strip's nearer end. Accepted for 12: a
      leg whose end is behind the eye is hidden for that stretch, and a
      release facing away flies in unseen. 12b flies them on the plane.
    - **Bob and footsteps.** The camera's `scrollY` bobs
      `−0.004·height·gait·|sin(π·s/STEP_LENGTH)|` by distance walked
      (`walking.ts`; `gait` is the pace over cruise, so it is 0 at rest
      wherever the walk stopped), never above 0, so no strip under the
      land shows; controls do not bob. Each `STEP_LENGTH` walked sounds one
      soft step (`footsteps.ts`): 60 ms of the breeze's brown noise through
      a 600 Hz low-pass, alternating sides at `FOOT_PAN` ±0.3,
      `MeadowSound.step` through `play`, so silent under the mute and
      dropped before the synth exists. Rendered ~10 dB under a C5
      (`STEP_PEAK` 1.5 is the dial, for the operator's ear).
    - **The scene stays under ~450 lines** by `arrivals.ts` (what `+` grows
      and the insect buttons release), `perches.ts` (the perches as the
      screen stands) and, out of `insect-view.ts`, `insect-away.ts` and
      `insect-shown.ts`.
    - **The plays.** The probe reads the eye: `__probe.eye()` (place,
      heading, walked, bob, footsteps), `sun()`, `toScreen`/`toWorld` by
      the bob alone. `scripts/lib/play-walk.ts` replaces the pan plays: `↑`
      eased and under cruise, bob in range and 0 at rest, footsteps equal
      to the distance walked over 0.8 ±1, `↓` rests at the rim, a full turn
      by keys one way within `TURN_CRUISE` with the sun leaving and coming
      back, a turn back returning every bed object within 0.5 px, a
      sideways drag turning with the ground under the finger and stepping
      nowhere, a drag down walking under cruise, nothing tapped, a screen
      turn keeping heading and place, and no pop while walking (a vanish
      under the brow's cover is not one). `scripts/lib/play-hold.ts`
      plays the long press, the cross and its tuft on a seeded and a
      planted flower. `--plays` picks plays, each on its own fresh meadow.
    - **Left in the tree.** `parallax.ts` lives on only for
      `skyline.ts`'s `groundSeam`, which only `ground-seam.test.ts` reads;
      `nearestTheSun` (`sun-layout.ts`) only for `meadow-rules.test.ts`;
      `visit-play.ts`'s `openingCrop` returns the opening `View`;
      `rebloom` (`model/motion.ts`) is dead in production. A flower still
      drawn past the brow takes a tap on the covered part of its head, and
      counts for the keys by its head's middle even when that is covered.
