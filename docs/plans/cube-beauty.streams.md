# Make the cube beautiful — the parallel streams

The lead session (`session_01DaohkEZGmfg7XD5wRftBnA`, branch
`claude/cube-liminal-332pmv`) hands each part of
`docs/plans/cube-beauty.in-progress.md` to a session of its own. Read that file
first: it holds the operator's ask and the architecture. This one holds the
rules every stream shares and each stream's contract.

## Rules for every stream

- **Base and branch.** Work on your own branch, cut from
  `claude/cube-liminal-332pmv`; commit and push as you go; never push to any
  other branch, never open a PR, never run `/finalize`, never publish a preview.
  The lead merges.
- **Stay in your directories.** Each stream lists what it owns. Everything else
  is read-only — above all `src/cube/pages/**`, `src/cube/entities/world` and
  the theme `kit/` — unless your stream says otherwise. What you need changed
  there goes in your final message, and the lead does it.
- **Same place, same time, same sight.** Nothing calls `Math.random`, `Date.now`
  or `performance.now`. Chance comes from dice (`@/dice/shared/roll`:
  `rollWith`, `roll.*`, `pathHash`; `traits.ts` in `entities/world/model` is a
  short example) seeded by the room's `grain` or the floor. Time comes in as a
  `Clock` (`@/cube/shared/lib/clock`: the hour since the epoch and the seconds
  into it), the same for every viewer.
- **No interactivity beyond walking.** Nothing reacts to where the visitor is or
  looks.
- **Nothing from outside.** No network, no assets, no new dependencies, no
  external services; textures, sounds and letters are computed.
- **Language.** English in the product; other languages welcome; Russian only as
  a rare easter egg.
- **The repo's law is the operator's hard line**: MASD
  (`.claude/rules/masd.md`), lint with no suppression comments, no file over 400
  lines, derived types, tests beside the modules (`node:test`), comments that
  state the lasting contract. A new slice the page does not read yet carries
  `// masd-disable insignificant -- the cube page reads it once the lead merges this stream`
  in its `index.ts`; the operator has allowed that marker for exactly this case,
  and no other marker.
- **Before the final message**, all green: `pnpm typecheck`, `pnpm lint`,
  `pnpm lint:fsd`, `pnpm check:masd`, `pnpm masd:clusters`, `pnpm check:cycles`,
  `pnpm check:poison`, `pnpm type-overlap`, `pnpm format:check`, `pnpm test`.
  The overlap gate compares member names repo-wide: a member that only shares a
  name with another app's type gets a more exact name.
- **Units.** A room's own frame: its side is 1 (five metres), x east, y up, z
  south from the north-west corner of its floor; the ceiling is at
  `CEILING_HEIGHT` (0.46, `@/cube/shared/lib/room-shape`), a closed side's wall
  face stands `WALL_HALF` (0.012, `@/cube/entities/world`) in from the room's
  edge, the visitor's eye is at `EYE_HEIGHT` (0.32). Geometry is `Quad`s
  (`face`, `box`, `facet` from `@/cube/entities/world`), each made of a
  `Surface` (`@/cube/shared/lib/surface`) and an optional `paint` (`0xRRGGBB`);
  `kit/lib/stuff.ts` says how each surface is shaded.
- **The final message** goes to the lead with
  `mcp__claude-code-remote__send_message` (session
  `session_01DaohkEZGmfg7XD5wRftBnA`), under 200 words: your branch, what the
  slice exports, what the lead must wire or change, what is unfinished. Then
  stop; the lead may write back with fixes.

## Sound — `src/cube/features/sound/`

Everything heard but speech, synthesized. The sample maths is pure and tested in
node (finite, within ±1, the length asked for, the same for the same seed,
different between footings); a thin Web Audio layer plays it.

```ts
createSoundscape(): Soundscape; // browser only
type Soundscape = CanDispose & {
  unlock(): void; // from a user gesture: makes and resumes the AudioContext
  setPlace(sound: Sound, scale: number): void; // the floor's theme.sound
  cue(cue: SoundCue): void;
  play(samples: Float32Array, sampleRate: number, how?: Played): void;
};
```

- `SoundCue`: a step (its strength, the floor's `Footing`), a jump, a landing
  (its speed), the lever, a breath (its effort), a grunt of effort, the shrink
  itself (a few seconds of something uneasy), and cues a room makes on its own:
  a ring, a knock, a thud, steps going away — each with where it is in the room
  and how loud.
- The room tone runs on its own: the lamps' hum at `sound.hum` hertz with its
  harmonics and ballast buzz, air at `sound.air`, both through a reverb whose
  tail lasts `sound.echo` seconds (an impulse response computed from noise); a
  change of place crossfades over a second.
- `pace(walked, moved)`: pure, turns distance walked into the steps that landed,
  so the page only reports movement.
- `play` takes the voice stream's samples; `Played` is its gain, pan and how
  much reverb.

## Voice — `src/cube/features/voice/`

A formant speech synthesizer and what it says. Ideas may come from formant
synths in general (a glottal pulse with jitter and shimmer into four or five
resonators, noise through filters for fricatives, bursts for plosives, formant
targets interpolated between phones, a pitch contour); nothing is fetched. The
operator: "if it is too hard, don't sweat it" — "wtf" and "here we go again"
being recognisable matters most.

```ts
lineFor(moment: Moment, n: number, grain: number): Line; // text and phones
utter(line: Line, voice: Voice, sampleRate: number): Float32Array;
voiceOf(who: 'visitor' | 'somewhere', n: number): Voice;
```

- `Moment`: the first shrink ("wtf"), the second ("here we go again"), later
  shrinks (a rolled variant, wearier each time), a landing, a mutter when
  nothing happens, and things said from somewhere else in the building — a
  "hello?", a numbers station, a laugh, a lullaby's two bars.
- The language decays with the floor: plain English to floor 8; then vowels
  drift and words bend; from the twenties, invented words with a phonotactics
  rolled per floor, so a floor has its own language; from the fifties, not a
  human voice at all. `Line.text` is what a subtitle would show.
- A small phone set, a hand-written lexicon for the scripted lines, a
  letter-to-sound fallback. Pure, tested like the sound stream's maths.

## Lettering and posters — `src/cube/shared/lettering/`, `src/cube/entities/poster/`

- **Lettering**: a stroke font. `strokes(text, script)` gives polylines in em
  units; `measure` its width; `scriptOf(n)` the floor's script — Latin to floor
  8, then each letter is, with rising chance, a glyph of an alphabet invented
  for that floor (a stroke grammar rolled through dice: stems, bowls, hooks,
  dots; the same letter is the same glyph all over a floor), wholly invented by
  the forties, and past 53 the strokes themselves drift apart. Capitals, digits,
  common punctuation, four arrows. A `ui/` function paints strokes on a
  `CanvasRenderingContext2D`.
- **Poster**: after each descent the visitor finds, not in their face, a poster
  showing life-size the thing they are now the size of. On floor `n` the visitor
  is 1.6 m × 2^-(n-1) tall. `subjectOf(n)` names the thing (a ladder from a
  child and a cat through a mouse, a bee, an ant, a mite, a red blood cell, a
  bacterium, a virus, a ribosome, a protein, DNA, a molecule, an atom, a
  nucleus, a proton, a quark, to a question mark — at least thirty drawings as
  strokes, the floors between captioned honestly) and `posterOf(n)` the whole
  poster as a list of things to draw: paper, a quiet title, the drawing at the
  scale that makes it life-size in the visitor's frame (real size × 2^(n-1) / 5
  room sides; cropped to a detail when the thing is bigger than the poster), a
  ruler, a caption in the floor's script. A `ui/` function paints it on a
  canvas; at most 0.36 × 0.3 room sides. Where it hangs is the lead's.

## Descent — `src/cube/features/player/`

The operator's words, replacing the old pull-and-fall-through: the lever "just
shrinks you", standing "a little aside from the hatch — so that, if you really
want, you can even run about the upper floor small. And when you walk up to the
hatch you simply jump, with no pulling-up or lowering-down". The first time "you
may look at your hands and around and say wtf; the second, here we go again;
you'll get creative".

- `Input.clip` (the typed `idclip`, which stands the body on the floor below at
  once) stays as it is, whatever else the descent becomes.
- Owns `src/cube/features/player/**`, `src/cube/scripts/play-cube.ts` (its pull
  shots), and may touch `entities/world/model/{lever,hole}.ts` and the call of
  `play` in `pages/cube/ui/cube-canvas.tsx` where the change forces it.
- Pulling the lever shrinks the body where it stands to half its size over a
  couple of seconds. On floor 1 the gaze is taken for a moment: down to the
  hands, which come up and turn over, then around; later floors are shorter and
  rolled. Small, the body walks the floor it is on as before, at its own size.
  Walking onto the hole — which only a shrunk body fits — it hops, falls to the
  floor below and lands with a dip; `descend` then makes it a full-size body of
  the floor below, as now.
- `Player` gains what the page needs: `handsOf(player): Quad[]`, the hands as
  quads of `skin` and `fabric` in the frame of the pose's room, empty when out
  of sight; and `cues`, what happened this frame for the sound and the voice (a
  step and its strength, the lever, the shrink starting, a jump, a landing and
  its speed, and a moment to speak: the first shrink, a later one, a landing).
  The lead draws the hands and plays the cues.
- The address in the URL keeps working for a share or a refresh.
- `play` stays pure and tested: each transition, and that a full-size body
  cannot fall.

## Decor — `src/cube/features/decor/`

`furnish(setting: Setting, decor: readonly Furnishing[]): Quad[]` — what stands
in a room, in the room's frame, rolled from `setting.grain`. Every `Thing` of
`@/cube/shared/lib/thing` is built, each from a few boxes at its real size (a
chair's seat at 0.09), `perRoom` of each on average.

- Things stand against closed walls and in corners. A strip 0.25 deep along
  every open side stays clear, so do 0.15 around the hole and the lever
  (`leverOf`), and the middle third of every closed wall between 0.18 and 0.42
  up, where signs and posters hang. Things do not overlap. Wall things sit 0.002
  off the wall's face, which is `WALL_HALF` in from the room's edge.
- At most 60 quads a thing and 250 a room.
- Tested: every thing builds, stays inside the room, keeps the clear zones, is
  the same for the same setting.
- This stream may add its one call to `build()` in
  `src/cube/pages/cube/ui/cube-scene.ts` — the near rooms' things, stood with
  `inPlace` — so it can look at its work with `pnpm gallery:cube`.

## Happenings — `src/cube/features/happenings/`

What goes on in a room by itself, as a pure function of the room and the clock:
`happening(setting, n, clock)` gives the quads of that instant in the room's
frame and the sounds it makes (kind, place, loudness). The page asks every near
room every frame, so the common answer — nothing — is one cheap roll and one
shared empty value.

- Rare enough to be doubted: something within sight every minute or two of
  walking, a real scare every ten. Never aimed at the visitor: it is where and
  when it is, for whoever is there.
- At least fourteen kinds, from the mundane to the wrong, drifting with depth: a
  figure at the far wall facing away, gone at the next look; a ball rolling
  through; a balloon at the ceiling; paper sliding in a draught; a door opening
  a hand's width; a shadow with nothing casting it; something tall unfolding
  from the ceiling; a cat; chairs all turned to one point; a hand withdrawing
  behind a pillar; a mannequin in a new pose each minute; a phone ringing in an
  empty room; deep down, the room's own corner coming loose.
- Figures are boxes (`box`, `face`), moved by the clock alone. Tested: the same
  room and instant give the same thing; quads stay in the room; the rate is what
  it claims.

## Theme bands — `src/cube/entities/theme/<band>/`

Five streams, one band each: **workplace** floors 4–8 (1–3 are the lead's
examples in the same directory — read them, leave them), **dwelling** 9–20,
**leisure** 21–35, **laboratory** 36–52, **edge** 53–67. Each floor is a file
`config/NN-name.ts` exporting a `FloorTheme`, listed in the band's
`config/<band>.ts`.

- Liminal spaces as the inspiration, not a copy of the Backrooms: places built
  for people with nobody in them, slightly wrong. Every floor its own place —
  its own walls, floor, ceiling and trim, lamps, air, share of dark rooms,
  sound, decor (things from `THINGS`) and name.
  - _workplace_: a stairwell landing, a parking level, a mall's service
    corridor, a server floor, a conference hotel.
  - _dwelling_: homes remembered slightly wrong — a hall with too many doors, a
    grandmother's wallpaper, a child's room at night, a tiled bathroom as big as
    a house, a wood-panelled den, an attic, a laundry.
  - _leisure_: places to wait and to play — an indoor pool, an arcade, soft
    play, a mall atrium, a cinema's corridor, a supermarket at 3 am, an airport
    gate, an underpass, a playground under a painted sky.
  - _laboratory_: the visitor is now smaller than a cell — clean rooms and wet
    labs first, then rooms made of what the small world is made of: agar,
    membranes, lattices, a circuit board as a city, the light of a microscope
    slide, an electron micrograph's grey.
  - _edge_: less and less to build a room from — wireframe, a test card, the
    missing-texture checker, dither, flat fields, static; floor 66 is a warm
    gag, 67 the last room there is.
- The frame may break style: two to four floors a band write their own
  `themeLight` or `themeLens` rather than `ordinary` — ink outlines from the
  depth in `sceneAt().a`, halftone, a CRT, a thermal camera, a blueprint,
  one-bit dither, watercolour.
- Read `kit/lib/*.ts` and floors 1–3 before writing. A helper the band shares
  goes in the band's own `lib/`; a wish for the common kit goes in the final
  message. `pillar` is at least 0.015, which hides the walls' edges.
- Look at every floor: `pnpm shaders:cube` compiles them all in seconds, and
  `pnpm gallery:cube --floors 9,10,11` shoots frames to `tmp/cube-gallery/` —
  read the images, and iterate until no surface is flat or blown out and each
  floor is unmistakably its own. Keep a pixel's cost modest: `fbm` to five
  octaves, a few dozen noise taps.
