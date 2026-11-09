# Bite 3 — a round world, and Earth as world #0

The contract the lead hands the member who builds bite 3. Its sticker on the
board points here; the board's infinite-worlds zone (stickies `earth-1` to
`earth-4`) holds the reasoning, and each call it settles is written below rather
than re-argued in the build.

## What exists when it is done

The planet is round in its land as well as its shape. Today the planet is a
sphere of R = 6,371 km, but land exists only on one flat square laid on it
around 10° N (`src/island/shared/globe/globe.ts`), ocean everywhere else. After
this bite land is one formula over the whole sphere, and you can fly anywhere,
over a pole included.

- `/island#0` is Earth: its coastline, fitted from public data.
- `/island`, or `#1`, is still the island Zoltan and Syama drew, in the same
  place on the globe, re-fitted on the sphere.
- `/island#2`, `#3`, … are worlds no one chose: several continents and islands
  each, as many as the dice give. No count is set anywhere in the code.

The operator, on the ask: «я даже не знал что у нас мир -- плоский, и как бы я
ни любил Пратчетта, для нас всё же хочу чего-то менее магического»; on
parameters: «надо сразу думать о каком-то строго типизированном интерфейсе»; on
counts: «необходимость каждого следующего континента решается броском кубика
после рисования предыдущего -- таким образом что _в среднем_ у нас получается
как на Земле (но в бесконечном пространстве миров возможен мир со сколь угодно
многими континентами)».

## Why Earth is in this bite

The relay left open whether Earth is this bite or the next. It is this one, for
three reasons:

- **One fit serves both worlds.** Re-fitting #1 onto the sphere needs a script
  that takes a coastline and writes a pinned world's words. Earth is the same
  script with a different coastline.
- **Earth sets the random worlds' spectrum.** Its measured spectrum is what the
  random worlds' envelope comes from (call 4). Without Earth, the envelope is
  the probe's guess.
- **It is the only real-world check of the result.** Only Earth lets us check a
  round world against something real at every height.

The order hedges the size: call 11 builds the sphere and #1 before Earth. A bite
cut short still lands a round world you can fly over.

## The probe

`bite-3/sphere.py` beside this file is the lead's numpy probe. It draws random
spherical-harmonic series, makes the top 29% of the sphere land, and counts the
landmasses. Run it as
`python3 sphere.py <out dir> [L] [land share] [knee] [alpha ...]`. It settles
that no count is needed. It does not settle how the game computes the series.

- **A pure power law `l^-1` gives lace** (`bite-3/worlds-pure-power.png`): one
  blob holding 30–74% of the land, with ragged inland seas.
- **An envelope flat up to a knee, then falling, gives planets**
  (`bite-3/worlds.png`, knee 6, `(36 + l²)^-1`, L = 96). Across six seeds: 6–10
  landmasses over 1% of the land, the largest 25–63%, and 31–56 pieces in all.
- **Earth for comparison**: Afro-Eurasia holds about 57% of the land and the
  Americas 28%, then Antarctica and Australia.
- **The count is free.** The knee sets how big continents are, the slope sets
  how ragged their coasts are, and the sea level sets how much land there is.
  How many continents a world gets follows from these and is never asked for.

## Calls

1\. **The land is a field `f(û) = Σ_{l ≤ L} Σ_m a_lm Y_lm(û)`** over the unit
sphere, using real orthonormal spherical harmonics. A point is land where
`f > 0`, and the coast is the field's zero line. There is no dome. The degree-0
coefficient is the sea level, and it decides how much of the sphere is land.
Height derives from `f`, as bite 2's build does on the plane (`d = f/|∇f|`, with
`∇` the surface gradient). The value noise stays on top of it, in the same role.

2\. **`L = 511`**, which gives `(L+1)² = 262,144` coefficients. The finest wave
at the equator is about 78 km, bite 2's ~80 km, so #1 gets no coarser. If #1's
wrong-land share comes out above bite 2's 0.7%, report it with frames. Do not
raise `L` on your own: every pinned world's size grows with `(L+1)²`.

3\. **Parameters are named, behind a typed schema.**

- **The schema.** A world's parameters are one typed tree, built from a small
  `roll` vocabulary in the world model: `roll.struct`, a uniform leaf, a normal
  leaf, and a table keyed by a typed index, such as the harmonics keyed by
  `(l, m)`.
- **A word's key is its path.** The key is derived from the leaf's place in the
  tree (`land/harmonic/37/-12`) and never written as a string by hand. Its value
  is `H(N, path)`.
- **Adding a parameter never moves another world's bits.** Test it: a schema
  with one extra leaf leaves every existing word equal.
- **The decoded world is the schema's type.** Code reads `world.land.harmonic`,
  never `words[i]`.
- **An open-ended list is the next bite's.** It gets its continuation roll at
  `…/<index>/more`, and its items' keys hold their index, so no list's length
  shifts anyone's bits. Nothing in this bite needs one.
- **Look for a package before building `roll`.** Vova: «перепроверить наличие
  готовых пакетов, чтобы не изобретать велосипед». The neighbours are
  property-based testing's typed generators over a choice sequence (fast-check,
  Hypothesis), probabilistic programming's addressed choices with constrained
  traces (Gen, Pyro), and counter-based generators keyed by `(seed, key)`
  (Philox/Random123, JAX's keys). Check npm for one that gives typed schemas,
  path keys, random access by key and pinned values together, or a part of that
  worth building on. Post what you found, and why you took it or did not, before
  you write the vocabulary yourself.
- **The schema's leaves replace the word indexing.** `layout.ts`'s indexing and
  the dome go.

4\. **Random worlds** take `a_lm = env(l) · normal(H(N, path))`. `env` is
Earth's measured amplitude per degree, smoothed to a knee-and-slope fit. The
degree-0 coefficient's distribution is chosen so the average land share is
Earth's ~29%. Frame #2–#6 with both Earth's envelope and the probe's (knee 6,
slope 2). If Earth's envelope gives lace, say so. The lead decides with the
operator.

5\. **Pinned worlds are a table, number → words.** A pinned world stores its own
words, decoded straight to its coefficients, and loads only when that number is
opened. Every other number reads `H`. This replaces bite 2's
`H XOR one shared mask`: with one mask per pinned world, the XOR buys nothing,
and the table is simpler to read. The pinned table has two rows, #0 and #1.
Report each row's size at the fewest bits per word that keep its wrong-land
share. Each world's own row size is how the generator is measured: the fewer
bits Earth needs, the better the formula (relay 5).

6\. **The fit** is one script in `src/island/scripts/`, with a `pnpm` entry. It
takes a coastline on the sphere and builds the target, a clipped signed distance
to the coast as in bite 2's call 5. It runs a spherical-harmonic analysis up to
`L` and quantizes the result. It writes the pinned row and prints the wrong-land
share and where the wrong land lies.

- **#1** takes the drawing's rings (`src/island/entities/coast.retired.md` says
  how to bring them back) and lays them on the sphere through today's azimuthal
  map around 10° N. The island stays where it is on the globe, and its five
  lakes are water.
- **#0** takes Natural Earth's 1:50m land and lakes (public domain; reachable
  from the container at
  `raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/`).
  Antarctica's ice counts as land, and the large lakes are water. Fetch the data
  at fit time, never commit it, and name the commit of the data in the script.

7\. **Tiles cover the sphere as a cube**: six faces, each a quadtree, and a
`TileKey` carries its face. The face-to-sphere map should spread cells evenly,
and which map does that is the member's call. A tile stays a pure function of
`(world, face, level, x, y)`. Flying across a face's edge or over a pole shows
no seam, crack or pinch. Prove it with frames.

8\. **Everything at a point reads the sphere**: height, the coast field and the
value noise. The noise is a function of the point in 3D metres, so it has no
seam. The flat island plane (`planeToWorld`/`worldToPlane`) leaves the game and
survives only in the fit, which lays #1's drawing onto the globe.

9\. **Runtime**: the series is never summed per vertex. The worker turns it into
a grid once per world: a Legendre recursion per ring and an FFT along each ring
onto a latitude–longitude grid, with at least two nodes per finest wave. From
that grid comes the coast field that tiles sample. The grid's shape, and how it
avoids pole artefacts, is the member's call. Budget: a world builds in at most 3
s on a desktop in the worker. Report the phone figure. The worker receives the
world number, never the field.

10\. **The eye moves on the sphere**: a point, a height and a heading, with the
controls unchanged in feel. #1 opens where `/island` opens today, and #0 opens
over the Mediterranean at orbit. The world number is the URL hash, a
non-negative integer: none means #1, and `#0` is Earth. Changing it at run time
rebuilds the world without a reload.

13\. **↑/↓ look, E/Q climb.** Vova: «вверх-вниз это не подъём/спуск, а
"посмотреть вверх/посмотреть вниз" (сейчас такого движения нет совсем, поэтому
получается что на какой-то высоте, когда хочется уже взглянуть на горизонт, а ты
все равно смотришь ровно вниз), а подъём спуск e/q соответственно, как было
изначально».

- **↑/↓ tilt the view up and down** from the pitch the height gives today, eased
  like the turn, so from high up you can raise your eyes to the horizon. The
  tilt is limited to between straight down and a little above the horizon.
- **E climbs and Q descends.** PageUp/PageDown stay. The arrows no longer climb.
- **The key hint says so.** Touch gets the same look somehow, and how is the
  member's call; report it.

12\. **Sun and moon: the full-moon mode.** Vova: «пока пусть будет режим
полнолуния: с одной стороны солнце, с другой Луна. И можно добавить клавиши
управления временем».

- **Fixed in space.** The sun is fixed in space, not turned with the eye. The
  moon is full and stands opposite the sun, so the night side is lit by
  moonlight: dim, cool and readable, never black.
- **Time turns the planet under them.** A world opens at local noon over its
  start point, so #1 looks as it does today. Time keys scrub the day forward and
  back, and may pause it.
- **The keys are the member's call**, clear of the movement keys, and the key
  hint lists them.
- **The phase is fixed for now.** A moon that changes phase, and a moon you can
  see in the sky, are for later.

14\. **No seam between levels of detail.** Vova, on a screenshot of a step
across a hillside: «тут такой шов между вокселями … известный трейдофф до
будущих битов, или баг?». The skirt closes the hole between a tile and its
coarser neighbour but leaves the step, and the shading jumps with it. On the
sphere a shared edge matches: the finer tile's border takes the coarser one's
heights, or the levels morph into each other — the member's call, reported. The
same holds across a cube face's edge (call 7).

15\. **Where am I: a line to reproduce from.** Vova: «стоит дать какую-то
функцию в консоли чтобы записывать диагностическую информацию (типа номер
версии, координаты, высота, положение камеры), чтобы ты в будущем мог
воспроизводить то о чём я говорю».

- **A key and `island.where()` in the console** copy one line: the build's
  commit, the world number, latitude and longitude, height, heading, pitch, the
  time of day, and the levels of the tiles under the eye.
- **The same pose rides in the hash**:
  `#<world>@<lat>,<lon>,<height>,<heading>,<pitch>` opens there, so a pasted
  link puts the lead's browser at the same spot. A bare `#<world>` opens as call
  10 says. The key hint lists the key.

11\. **Order of work**: the schema and the series, then the cube tiles and the
eye with #1 re-fitted, then Earth with its envelope measured for call 4. Each
step reaches a frame before the next one starts.

## Out of the bite

- Objects from dice rolls, and open-ended lists with their continuation rolls.
- Pangaea's fit between continents («правая линия южной америки коррелирует с
  левой африки»).
- Earth's real relief: #0's coast is Earth's, but its hills are the game's
  noise.
- Rivers, lakes above sea level, the coast fractalling past `L`, compressing a
  pinned row, and a world picker.

## Done when

- **#1** at the five heights (orbit, 1,000 km, 10 km, 100 m, 2 m), on a phone
  and a desktop, beside bite 2's frames, reads as the same island. Its
  wrong-land share and its row size are in the PR body.
- **#0** reads as Earth at orbit from four sides and from both poles, and at
  1,000 km over three coasts you would recognise. Its row size and its
  wrong-land share, with where the wrong land lies, are in the PR body.
- **#2 to #6** at orbit from two sides each, under both envelopes (call 4).
  Beside them is a table: land share, landmasses over 1% of land, and the
  largest's share, for Earth and for 20 random worlds.
- **A flight across a cube face's edge and over a pole**, in frames, shows no
  seam, and neither does a hillside where two levels of detail meet (call 14).
- **A `#<world>@<pose>` link** from `island.where()` reopens the same view (call
  15).
- **The pure parts are tested**: the hash by path; schema keys that do not move
  when a leaf is added; the Legendre recursion and a synthesis–analysis round
  trip; the decode maps; and the pinned table, where each row decodes to its
  fitted coefficients exactly.
- `/polish` has run over the diff, its `polish:` commits are on the PR, and
  `/five-percent`'s review has been posted.
- `/sync-branch` against `island/stretch-2` comes after the polish, and vet is
  green on the bite branch.
- Its PR, based on `island/stretch-2`, carries the frames and a body saying what
  each call became.

The lead merges the bite once vet is green, `polish:` commits are on it, and it
has looked at the frames.

## For the member

- Talk to the lead with `python3 scripts/memo/memo.py post --as member` and wait
  with `wait --as member`. A question the work can go on past is posted and not
  waited on.
- Orchestrate: one build step per agent, the model named on every `Agent` call
  (Opus), each agent in its own worktree and pushing every passing step
  (`.claude/skills/mammoth/notes/subagents.md`). `bite-2/brief-common.md` is the
  shape for what the briefs share.
- The board is the lead's: propose a change to it through memo.
