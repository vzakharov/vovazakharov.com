# Item 13 — rain

The rain bite's contract, written ahead of it and moved verbatim out of the plan's `## Rest of the elephant`.

13. **Rain** — the shower itself; what it leaves behind is item 14. Cut
    there because the whole of it is four packages (weather, the shower's
    look and sound, shelter, sprouting), and a bite past two runs into the
    budget notice (`.claude/skills/megabeast/notes/pickup-and-relay.md`).

    **Behaviour.**
    - **A tap on any cloud starts the rain.** The tapped cloud darkens
      first and the others follow within ~0.6 s; the sky and land dim under
      a slate wash; rain falls across the whole screen, densest under the
      tapped cloud, which turns with it as the child does (a cloud stands at
      an azimuth, `panorama.ts`). The weather is the meadow's, not a
      cloud's: one shower at a time, so flowers everywhere close at once, a
      cause a child reads without a word.
    - **It lasts `RAIN_MS` 10 s; a tap on a cloud while it rains restarts
      the 10 s** and gives that cloud a wobble and a gush of drops under
      it, so the tap always answers (decisions: "No tap is ever answered
      with a shrug"). A cloud tap is a tap on the meadow, so it shuts the
      flower picker, as a flower tap does.
    - **Drops** are short slanted streaks across the screen, at most ~120
      at once. Where one lands it splashes as a small ring (decisions:
      mandala ornament): on a cap's top where the drop's column crosses a
      drawn cap, otherwise on the ground at a distance picked from the view.
      Splashes are placed through the view (`ofGround`), so they sit on the
      ground as the child turns and walks.
    - **Sound**: a soft hiss of filtered noise with a patter of tiny ticks,
      fading in over ~1 s and out with the rain; a cloud tap answers with a
      low soft whoosh. Synthesized in `synth.ts`'s manner, silent under the
      mute; level above ~300 Hz checked by rendering (play-run note "Sound
      is reviewed by rendering it").
    - **While it rains** every flower closes — petals folded up toward the
      centre over ~1.5 s, reopening as it stops — and stays playable as an
      instrument; every mushroom's cap swells ~6% and settles back. Both
      are clock functions of the shower, so a resize or a walk never
      interrupts them. Insects carry on through the shower; sheltering is
      item 14.
    - **When it stops** the wash lifts and a rainbow fades in over the sky
      opposite the sun (at `α_sun + π`, so the child turns her back to the
      sun to see it), as concentric bands, holds ~8 s and fades over ~3 s. A
      new tap on a cloud while the rainbow shows starts a new shower and
      fades it out.

    **Model — built (5c9f2e9).** `Meadow` has `rain: Rain | undefined`,
    `{ startedAt, stopsAt }` in the insects' ms clock (not `start`, which
    `pan.ts` holds as a position);
    `{ kind: 'rain' } & Timed` starts it or pushes `stopsAt` to
    `now + RAIN_MS` and shuts the flower picker. `model/weather.ts` gives
    `raining`, `wetness`, `downpour` (drops, on over 0.6 s, off at
    `stopsAt`) and `rainbow` as pure functions of the span and the clock;
    `tick` reads none of it. Left to the scene: the rainbow a new shower
    starts under drops to 0 at once, so its fade-out is the scene's to
    hold; drops in the air finish falling after `stopsAt`.

    **Scene.** A rain bed module (`rain-view.ts` and what it needs beside it)
    owns the cloud hit areas, the darkening, the wash, the drops, the
    splashes and the rainbow; `meadow-scene.ts`, at ~450 lines, only wires
    it. Cloud hit areas are the cloud's circle where the
    view draws it, at least `TAP_RADIUS`, the lowest priority: a control, a
    mushroom, a flower or an insect over a cloud takes the tap. Closing petals in `draw-flower.ts`,
    the swell where the caps are scaled; colours in `palette-backdrop.ts`
    (wash, dark cloud, rainbow bands). The probe exposes the shower
    (`__probe`), and `pnpm play:mushrooms` taps a cloud on every screen,
    steps through the rain and the rainbow, checks `rain` is set, the
    flowers closed mid-shower and open after, and reports the frame
    median against the 26 ms budget with the drops falling.

    **DRY notes.** The weather's clock functions join `motion.ts`'s
    pattern (pure functions of seconds or ms) in their own module, since
    `motion.ts` is per-creature motion and weather is the meadow's. Splash
    rings reuse `spores.ts`'s particle manner where it fits rather than a
    second particle helper. The rain's sound is built from `synth.ts`'s
    primitives; no new audio graph beside `MeadowSound`.
