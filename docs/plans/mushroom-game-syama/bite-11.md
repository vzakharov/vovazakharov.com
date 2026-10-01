# Bite 11 — A wider meadow, panned

What bite 11 built, as `## Eaten so far` in `docs/plans/mushroom-game-syama.*.md` indexes it.

11. The meadow is a world `WORLD_ACROSS` (5.764) ground units across,
    twice a sideways tablet's screen, and the screen a crop onto it ("если
    мы сделаем более широкое поле, то можно делать не ресайз а просто кроп,
    а там уже ребёнок сам будет водить влево-вправо"). It supersedes item
    10's 14-flower cap, the turn's refit and `layout.ts`'s `perchedOn`. What the next
    bites build on:
    - `model/pan.ts` is the crop's pure state: a 24 CSS px slop, 1:1
      follow, a glide timed by the events' own timestamps, hard ends, and a
      resize keeping the ground point at the screen's centre. A held `←` or
      `→` turns the meadow like a shooter's keyboard turn, only slower —
      eased in, a steady cruise in screen widths a second, eased out on
      release — never in steps («курсорами -- как-то дёрганно. Должен быть
      плавный, умеренно медленный поворот»). Decided at bite 11's review
      (5373085053):
      - **A press is a tap only if it never becomes a pan.** On the press
        the thing under the finger answers only with what can be taken
        back — it dips, and springs back if the finger pans. Everything
        that cannot be taken back (selection, sound, spores, a picker, a
        planting, a deselect) waits for the lift inside the slop, or for
        150 ms of the finger resting inside it, whichever comes first; a
        press that crosses the slop first never taps. Beat tapping on the
        press and undoing on a pan, since a sound or a puff cannot be
        undone. The operator asked whether every answer then comes late
        («получается, каждая реакция при нажатии на что-то будет
        "запоздалой"?»): only the part that cannot be undone, and a
        child's tap (100–200 ms) lifts before the 150 ms mostly do.
      - **The slop is a child's drift**, 24 px (the review measured taps
        drifting 11–24 px), not 10: a wobbly tap still taps. Past it the
        ground lags the finger by the slop, never by the first step's
        size, and a release glides only on the velocity measured after
        the crossing.
      - **Hard ends, not a rubber band.** A drag stops at a world end and
        drops the finger's overshoot, so reversing moves the crop at once.
      - **Keys and fingers add up.** Both arrows held cancel to a stand
        without dropping either; letting one go turns the other way, and a
        finger pressed and lifted while a key is held leaves the key
        turning. `pan-input.ts`'s `Crop` is the one screen↔world
        home. The layout is computed once per screen size for the whole
        world and `cameras.main.scrollX` is the crop, so a pan never makes a
        new `MeadowLayout`. The zoom is the screen's, capped to show the
        opening clump; a turn changes the zoom and the crop, never the
        ground.
    - Fixed on the screen: the sky, the sun, its wash, the clouds, every
      control and picker. The far and near hills scroll at 0.3 and 0.6
      (`parallax.ts`); everything else moves with the ground. Five baked
      layers, none past 2048 columns. The far hills part under the sun
      along the whole stretch the pan brings under it, the range pressed
      down by a smooth envelope rather than cut level, so it rolls on
      below the disc with no plateau or shoulder (`skyline.ts`).
    - One world across every screen, in ground units, so a turn keeps
      every mushroom's ground; the cost is accepted (bite 11's review,
      thread 7). A phone held sideways shows ~81% of the world at once and
      pans only ~200 px, since it already sees nearly the whole meadow;
      widening the world for it would thin the portrait worlds further.
      Those span 4.3–4.45 screens, and away from the clump a child finds
      flowers to play and tufts to plant, with room where `+` grows a
      mushroom inside the crop: the empty stretches are the forest's room
      to grow.
    - Twelve mushrooms over the world, at least six on the opening crop in
      every visit. `roomFor(stand, seed, crop?)` grows `+` wholly inside
      the crop, clear of the controls where they stand; a cap or a tuft a
      pan slides under a control is the control's to tap there. The wash
      keeps off every foot any crop brings under the sun (`nearestTheSun`),
      82 px on a phone held sideways.
    - A flower grows wherever one has room; the bare tufts are
      `TUFTS_PER_1000PX` 6 over the world. The seeded bed is fourteen,
      `FLOWER_SPOTS.landscape` once per half, each half sounding C D E G A,
      a kick and a hat. The seam grass spans the world (`layerSpan`).
    - Sight and the air grid span the world, tested against its edges by
      the wingspan and not recomputed on a pan; butterflies' `slowest` is 4,
      so a leg across the world flies no faster than one across a tablet's
      screen. A released insect enters from the screen edge nearer its first
      perch and takes that perch in view (`model/flight-in.ts`,
      `onscreenOf`); every later leg roams the world.
    - Every grown mushroom's tap lands — none missed at the head's middle,
      at least 75% of the head's taps, the rest taken by a mushroom drawn
      in front (worst 76.5% over all 2000 tablet forests, where a sampled
      80% had missed the tail); a fingertip bound would fail every head
      flatter than a fingertip is round.
      `fliers.test.ts` takes ~354 s and runs alone under a 590 s timeout.
    - The play run converts through the crop (`__probe.toScreen`,
      `toWorld`), drags with its frame clock as each touch's timestamp, and
      checks in `scripts/lib/play-pan.ts` that a held key turns the crop smoothly, a drag
      from bare ground pans and taps nothing, a 6 px press taps, and a turn
      keeps every mushroom's ground; one screen per call, ~8.5 min each.
