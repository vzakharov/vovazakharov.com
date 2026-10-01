# Bite 3 — More mushrooms, and a forest

What bite 3 built, as `## Eaten so far` in `docs/plans/mushroom-game-syama.*.md` indexes it.

3. **More mushrooms, and a forest.** A `+` and a `−` sit on the right, as
   Syama drew them, each a fly agaric with its sign; `+` opens the picker
   across the top, four big buttons each holding a mushroom with that cap,
   coming up one after another, and a pick grows a fresh-seeded mushroom out
   of the ground with a puff and a bloop. A tap selects a mushroom (a soft
   glow behind its cap and a ring of light round its foot); `−` sinks it
   back; a tap on the bare meadow lets go. The meadow holds six: the clump
   and a forest round it, the back row smaller and hazed toward the sky.
   What the next bites build on:
   - `model/game.ts`: the `Meadow` state and `reduce` over `pick`, `grow`
     (its seed carried by the action), `select`, `deselect` and `remove`;
     the scene changes the state only through `dispatch` and reconciles the
     screen with what comes back. `MUSHROOM_SLOTS` is the cap, and each
     mushroom keeps its `slot` for life, so nothing else moves when one
     comes or goes. A grown mushroom is selected, so bite 4's house goes on
     it without another tap. The clump can be thinned like any other pair.
   - `layout.ts`: one `Placement` per slot (`haze` included); the forest's
     slots per orientation, each facing the middle and held under
     `sizeToFit`, which the clump shares. Flowers stand clear of every
     slot's foot, taken or not, placed against the meadow as it would stand
     with no edge margin, so neither a growth nor a resize moves one. The
     controls' circles (`mute`, `plus`, `minus`, `picker`) are placed here
     and tested for reach and overlap.
   - `motion.ts` gains `emerge`, `sink` and `phaseOf`. `mushroom-bed.ts`
     owns the mushrooms on screen (grow, sink and destroy, the tap, the
     glow); `controls.ts` owns every button (press-in by `wobble`, dimmed
     when it would do nothing); `hud.ts` draws the pictograms through
     `drawMushroom` over fixed upright genes; `hit-areas.ts` holds the hit
     tests. The scene orchestrates, the flowers and the backdrop still its
     own.
   - A mushroom's tap area is exactly what is drawn — cap, gills and stem,
     unpadded — built in `model/mushroom-outline.ts`, which the painter reads
     too; the front-most drawn part takes the tap, held by a clump sweep in
     `layout.test.ts`. `setInteractive` takes a non-geometry hit area only in
     its config form: Phaser reads any other plain object as a config.
   - Every slot's size is floored so its narrowest cap is `2 × TAP_RADIUS`
     wide; the controls and the sun (`sky-layout.ts`) stand clear of every
     slot's tap area; no cap is more than a quarter hidden, nor a stem more than half,
     by the nearer mushrooms' caps, gills and stems together
     (`MOST_HIDDEN`). Each is swept on every screen, phone landscape
     included.
   - `−` with nothing selected sinks the newest mushroom; a control that
     cannot act shakes its head (`shake`) with a "nuh-uh". The picker unfolds
     from `+` and folds back into it on the clock; `remove` and a flower tap
     close it, a flower tap counting as a tap on the meadow. The selected
     mushroom carries a traced outline that follows it (`beckon`); buttons
     are opaque discs.
   - `pnpm play:mushrooms` builds a probe export (`NEXT_PUBLIC_MUSHROOM_PROBE`
     hands the game to the page), plays every control on four screens over
     the DevTools protocol, stepping the sleeping loop, and fails on any page
     error or wrong effect; frames land in `tmp/play/`. Every bite's last
     frames come from it, after its last source commit.
