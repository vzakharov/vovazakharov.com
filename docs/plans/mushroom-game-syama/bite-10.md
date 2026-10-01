# Bite 10 — The flowers as an instrument, and the child plants them

What bite 10 built, as `## Eaten so far` in `docs/plans/mushroom-game-syama.*.md` indexes it.

10. **The flowers as an instrument, and the child plants them.** Every
    flower is a note or a drum, a tap plays it, and a tap on a grass tuft
    opens a two-stage picker whose flower grows there. What the next bites
    build on:
    - `model/flower-sounds.ts` maps colour × shape (petal × rings) to one
      of twenty sounds by darker-is-lower, types from const arrays; the
      visit's seven seeded flowers sound C D E G A, a kick and a hat (each
      searches its own stream for a seed of its sound, so every later draw
      of the visit stands), bees' flowers any of the twenty.
      `model/notes.ts` is the nearest-note rule over C4–B6, a tritone's tie
      toward the middle, resting back to the middle octave after 10 s.
    - A hue-nudge gene, drawn last so the other genes stand, keeps every
      petal three times nearer its own colour's hue than any other's; a
      white warms toward cream (`flower-tints.ts`).
    - `instrument-voices.ts` is the synth, every voice its parts as data:
      a soft keyed note (sine, quiet triangle, an octave partial under a
      lowpass, louder and longer low where a phone loses the fundamental)
      and eight soft downtempo drums — sine skins, each with a quieter
      higher mode a phone gives back, filtered noise ticks, every hiss's
      upper −3 dB edge under 8 kHz — through a compressor on master.
      `part-loudness.ts` computes a voice's loudest 50 ms from its parts
      (within 0.6 dB of a Chromium offline render, compressor aside); the
      tests hold every one of the twenty sounds within 12 dB of a C5 above
      300 Hz, and every drum under it
      (`docs/remove-before-merging/frames/bite-10/sound.md`). Up to five
      voices asked for before the synth starts wait for it, a sixth
      dropping the oldest; no Web Audio, no sound, no error.
    - A flower tap plays through the Instrument and still deselects and
      blooms; a re-tap mid-bloom reopens from where the head stands. A
      bee's flower plays from the melody without moving it. Every finger
      but the one Phaser's pointer holds plays only a flower's head under
      it (a touchstart listener using Phaser's hit test), opening and
      sounding it and nothing else — the selection and an open picker
      hold — so every other gesture stays one-finger. The focused canvas plays the keyboard by `event.code`
      (a Russian layout plays the same); a key opens every flower in sight
      of its sound.
    - **Planting.** The reducer in `model/game.ts` (held by
      `model/planting.test.ts`): the meadow remembers the open tuft, then
      the colour and one seed per shape; the child's flowers join the
      bees' in one list under the 14-flower cap, which `plant` holds
      itself, the seeded flowers counted. The bare tufts
      are exactly the spots a flower can be planted now (`tendTufts` in
      `tufts.ts`): each takes a flower (`takesFlower`), is bare to a finger
      (`bareToTap`: off every control, petal and cap — past its petals a
      flower yields to a bare tuft's reach), keeps its reach off every
      other's, and there are never more of them than flowers left under
      the cap. They are tended again whenever the mushrooms or the flowers
      change and on every paint, a tuft still fit staying on its foot; the
      picker shuts if its tuft stops taking a flower. Swept over grown
      forests with `+`, `−`, bee plantings and the child's on every
      `VIEWPORTS` screen, with 0 refusals and a bare tuft whenever the
      meadow is below the cap (on 280×600, all but ≤ 12% of meadows).
      They are drawn at least 12 px (`TUFT_LEAST`) as five fresh blades
      round a closed pink bud, apart from the seam's grass; the tuft the
      picker is open on stands taller on a cream glow. A tuft answers
      22 px round its middle, or its blades if larger; a flower the child
      plants on a tuft stands there alone, the tuft gone. Colours stand where
      the house picker's five buttons do (blue, pink, yellow, violet,
      white), shapes where the species picker's four do, lowest note
      first, each the exact flower that will grow, head enlarged; a shape
      press makes no sound, the flower plays as it opens. A tap anywhere
      else closes the picker unplanted — a control, the mute, an insect and
      its own tuft included — and a tap on another tuft opens it there. A
      full meadow shows no bare tuft; a tuft that somehow refuses shakes
      with the `+` refusal's sound.
    - **The floors won over the shrink.** `insectSizeFor` is
      `max(INSECT_LEAST, INSECT_SCALE × unit)` on every screen and refit,
      `LEAST_SPANS` (52/30/30) in `layout.ts`, asserted over 2000 seeds and
      imported by the play run: a turn's refit zooms a grown phone meadow
      to unit ~37, where the cap rule drew bees ~15 px. The camera shows
      an edge flower's head with half a butterfly's wings inside the edge
      margin (`perchedOn` in `layout.ts`), so no flower leaves sight by a
      side on a turn, and none the bees or the child planted leaves sight
      at all. Accepted: a phone held sideways and turned upright loses
      about one flower in eleven (opening clump 8.9%, forest 10.0% over
      2000 visits; 28.7% and 11.1% before the camera kept the wings), a
      front flower whose perch the thin upright ground brings within a
      wing of the screen's bottom, and a tenth of visits lose 14–17% or
      more; every other screen's turn loses none. The shrink it beat
      drew those bees ~15 px. `flower-plots.test.ts` bounds both
      standings at 11%, the worst tenth at 18%.
    - Spore puffs are containers tied to their mushroom, following it
      through a refit (`puffFrom`).
    - **Every grown mushroom keeps a tappable patch**, which growth keeps
      (`keepsPatches` in `mushroom-patch.ts`): 32 px across for each the
      forest grows, 24 px for the opening clump's two, over all 2000
      visits' full forests on every `VIEWPORTS` screen
      (`pnpm sweep:mushrooms`) but for one phoneL clump whose back cap,
      under the zoom floor, keeps 22 px. A wider floor for the forest
      leaves fewer visits room for six; under a 44 px fingertip stay
      15–34% of a full forest's mushrooms by screen (2.6% on tabP), a
      bound `mushroom-patch.test.ts` holds per screen. Past
      its petals a flower answers only where no mushroom is drawn, and a
      head drawn shallower than `TAP_RADIUS` gets the finger pad too. The
      play run's "unreachable" caps were its probe missing a cap under a
      resting butterfly, which the game passes a tap through.
    - The play run was green on every screen once two checks were fixed,
      not the game: the selection band's outline allowance is the ink's
      real reach (`INK_REACH`), and the wait for a butterfly on the
      chanterelle looks every `REST_LOOK` frames, covering ~160 s.
    - **Every picker stage is finger-sized and apart**, asserted in
      `layout.test.ts` on every `VIEWPORTS` screen, the 280 px phone and
      `TURNED_SMALL` (568×320, 600×280): each button at least `TAP_RADIUS`,
      on screen, and `PICK_CLEAR` (6.4 px) from every button still shown.
      Rows narrow until they clear `+`, `−` and the house; where the sky is
      too short for a row beside the insects, the picker opens in the top
      row and the buttons it covers hide while it is open
      (`Controls.yielding`) — a lower row covered the caps. `SUN_SMALLEST`
      is 0.1. Finger reach lives in `tap-reach.ts`, picker rows in
      `picker-rows.ts`.

### The instrument as decided (bite 10)

Bite 10 was built on `docs/remove-before-merging/ideas/idea-2-flower-keyboard.md`
§ «Что ты решил», which overrides the rest of that file:

- Five flower colours stay. Three colours × four shapes (`petal` ×
  `rings`) are twelve pitch classes, played by the nearest-note rule over
  three octaves; the other two colours × four shapes are eight drums —
  kick, snare, hat, three toms, shaker, rim — soft and synthesized,
  downtempo/trip-hop, never an acoustic kit ("Это не должно звучать как
  акустическая установка").
- Every flower's hue is nudged from its seed, bounded so its class still
  reads by eye ("чтобы розовый два раза не получался абсолютно
  одинаковый"). Colour blindness is not designed for yet ("давай туда
  пока не будем идти, это всегда успеется").
- Seeded flowers are pentatonic, C D E G A, plus a kick and a hat ("пусть
  будет пентатоника"); bees bring the other notes and drums.
- **The child plants flowers too.** A tap on a grass tuft (only there)
  opens a two-stage picker — one of five colours, then one of four shapes,
  no stage over five buttons, no words — and the chosen flower grows on
  that tuft ("не случайный, а именно тот который потом в две стадии
  пикера выберет ребёнок"; "сажать можно не везде, а только там где есть
  травка"). Bees still bring their own.
- **Darker is lower**, one law for notes and drums, never random: blue
  C–D♯, pink E–G, yellow G♯–B; within a colour the shapes rise
  round-one-ring, round-two, pointed-one, pointed-two. Violet is the skins
  (kick, then the toms low to high), white the ticks (snare, rim, hat,
  shaker — pointed for the noisy two). The keyboard's drum rows follow the
  same order: `a s d f` violet, `q w e r` white. The agent's proposal,
  standing unless the operator redraws it.
- Chords: several fingers at once, a compressor on `master` ("нужно, да,
  особенно с учётом барабанов"). One-finger gestures only elsewhere
  (review 5355192406, «давай однопальцевые жесты»).
- Keyboard on the canvas host: `g h j k l ; '` the white keys C–B,
  `y u o p [` the sharps, `a s d f` and `q w e r` the eight drums, `z`/`x`
  the octave.

A tap on a flower plays it and still does whatever a tap on a flower did
before; a tap selects what the finger is on and nothing else, so the
picker opens on a tuft only, and a tap outside an open picker closes it
without planting — except on another tuft, which opens the picker there
(review 5360733525). Planting obeys the forest's existing flower cap and
placement rules. A full meadow shows no bare tuft rather than refusing
one, the agent's call standing until the operator redraws it: tufts are
held to the flowers the cap has left (review 5360733525), so a tuft never
promises a flower that cannot grow, and the child meets one "no" fewer.
