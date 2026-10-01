# Bite 12 — walking, the contract

Bite 12's contract as the plan first wrote it, built: walking, the spec's settled calls, and the operator's fixes folded into the packages. Moved verbatim from the plan's `## Rest of the bite`; a hand-over note's "item N" means the plan's old `**Left, in order:**` list, its items kept here with their numbers.

6. **Walking.** The player really walks the meadow: turns on the spot
   through 360° and steps forward and back along the heading — a camera
   with a heading on the flat ground, not the strip's sideways slide, nor
   a ring of the strip joined at its ends, where the player could only
   lean toward what is in front («ходить мы хотим. иначе как он "карту"
   засеивать будет?»). The sun, its wash and the clouds belong to a
   heading, so the sun is the compass and no compass is drawn (the
   operator: a compass was the first thought, then the sun, «солнце у нас
   всегда на месте, что makes no sense»).

   **The contract is `docs/remove-before-merging/bite-12/step-spec.md`
   (2ace9d5), its recommendation taken on every open call** — read it
   whole before briefing. What it settles, in a line each: today's
   projection is already a pinhole written per row (`model/ground.ts`), so
   the true pinhole derived from its constants reproduces the opening
   frame exactly (a unit test and a play check); the walk's state lives in
   the scene as pure state like `pan.ts`, not in `Meadow`; bite 12's
   bounds are a glade disc, centre (0, 8), radius 12, sliding along its
   rim; no collisions — nearer than 2 units is hidden, farther than 13.33
   fades in at the hills' foot; keys turn 0.38 rad/s on every screen, a
   finger turns 1:1 with the glide, a walk is 1.6 units/s eased over
   0.25 s, the pan's cruise maths shared through `model/cruise.ts`; a drag
   locks its axis at the 24 px slop's crossing (within 45° of horizontal
   turns, else steps), a vertical drag chasing the finger no faster than a
   step, with no glide; hills drawn live from a 360° crest, redrawn only
   while turning; the sun its own small bake placed by heading, the wash
   on the sky only, one dip in the hills under the sun, clouds at
   headings; ground bands and grain fixed to the screen, mottles back as
   objects in 12b; haze by distance through a repaint queue capped at two
   a frame; a mushroom answers only where drawn (`fingerPad` goes, by the
   operator's idea-1 ruling); insects keep flying in the opening view's
   frame, drawn through a conversion, the sight rule down to the world
   edge; `+` grows only inside the wedge and on screen; a 3 px bob by
   distance walked and one soft step per 0.8 units, alternating sides.
   Packages: step 0 (pure model and types) alone, then P1 the ground on
   the plane, P2 the panorama, P3 walking in, disjoint by files, P3's
   wiring step after P1's and P2's first. **Bite 12 ends** with a child
   turning all the way round and walking anywhere in the glade, the sun as
   compass, the current meadow standing and tapping as before inside the
   wedge, bare ground behind.

   **Past the seam a thing goes behind the hills, not into a fade.** The
   spec's alpha fade from 12.3 would mist back-row mushrooms at the
   opening (the frame reaches D = 13.24; tablet seed 42 has one at alpha
   0.57), and a fade squeezed into 13.24–13.33 pops. A thing whose foot
   lies beyond `D_SEE` is drawn under the near hills instead, so they
   cover it from the foot up as it recedes, as a crest does; `fade`
   retires.

   **Two fixes from the operator's play, folded into the packages that
   own the files.**
   - **The planting spots are grass again (P1).** Bite 10 drew each bare
     tuft as a sprout round a closed pink bud, and capped them at
     `TUFTS_PER_1000PX` 6, so the ground's grass thinned and the meadow
     went noisy («заменил травинки "недоцветками"… выглядит так себе…
     слишком noisy… травинки были ок, и ок когда их было больше»). A bare
     tuft is drawn as a plain grass tuft, the seam's blades, and the
     ground carries plain tufts again at the density it had before bite
     10, **every one of them a planting spot** («ребёнок должен мочь
     посадить цветок где хочет… сделать каждую травинку потенциальным
     местом для цветка»): a tap nothing else takes lands on the nearest
     tuft in reach, which opens the picker. No tuft stands where no flower
     fits by bite 10's rules — beside a flower, under a cap — and one goes
     when something grows beside it («лучше просто убрать травинки где
     нельзя»), so no tuft ever refuses. The tuft the picker is open on keeps its cream glow;
     a planted flower takes its tuft's place. No bud anywhere.
   - **The keyboard plays only the flowers in front of you (P3).** A note
     or drum key sounds only through a flower in the current view with
     that pitch class or drum, and that flower answers as to a tap; with
     none in view the key is silent («"пианино" с клавиатуры не должно
     играть, если перед тобой нет подходящего цветка»). The note keeps
     the keyboard's octave, and the octave keys stay («передо мной 12
     цветков, по ноту на каждому, я хочу играть и переключать октавы»).
   - **A retap restarts a flower's answer (P1b).** A tap on a flower
     whose bounce is still playing starts it again from the top, as the
     sound already does («если второе нажатие до завершения анимации,
     анимация начинается заново»).
   - **A flower can be changed or removed (P4, after P1b and P3).** A
     tap on a flower only plays it; a long press — held ~0.45 s without
     moving past the slop, the note sounding at the press as a tap's does
     — selects it and opens the picker on it («да, давай так»: a picker
     on every tap would jump from flower to flower through a melody).
     The selected flower is marked by a small ring on the ground where
     its stem enters it, plainer than the mushroom's selection («попроще,
     чем гриб — например кружочком под цветком»). The picker: the colour row
     plus one button with a cross, then the shape row once a colour is
     picked; the pick replaces the flower in place, the cross removes it,
     its tuft coming back («при нажатии на цветок возникают снова кнопки
     цвета… плюс к кнопкам цвета одна кнопка с крестиком»). Seeded
     flowers too, so the model remembers the replaced and removed ones.
     The picker shuts, and the ring with it, on a tap on the meadow, as
     on a tuft; a long press on another flower moves it there.

   The decisions this rewrites — the one-drag pan, "every mushroom is a
   finger's target", the sight rule, bite 11's fixed sun, hill parallax,
   wash rule and hard ends — are rewritten in `decisions.md` at the
   bite's end, as the spec names them.
