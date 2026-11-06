# Origami: a tardigrade whose volume is in the folds

## The task

The operator's ask, from the start of the branch: «давай сделаем оригами
Василиска из последнего коммита более объёмным и похожим на настоящие оригами».
What they meant, clarified this session: change the _design_ — fold angles and
folds — so the model is volumetric by itself, not make the existing flat design
look volumetric. Then: «не факт что оригинальный василиск можно простыми
средствами исправить, тогда нужно придумывать с нуля … можно выбрать что попроще
(но не из существующих лягушек-аистов)», and «посмотри популярные модели оригами
и выбери то, чего среди них нет :)».

Chosen: a **tardigrade** (water bear). No tardigrade turns up in popular-model
lists or Gilad Aharoni's origami database (only crochet ones); its nearest
shape-relative, the pillbug, is there under several designers, so it was
dropped.

## The rule the design follows

The engine folds rigidly: a flat fold (180°) is a reflection and a restack, any
other angle a rotation of a flap about a line (`fold.ts`). Volume needs a
non-flat crease — an open spine. **Any crease crossing a non-flat crease must be
flat**, or the vertex where they cross couples their angles and nothing rigid
folds it (the engine throws «the crease runs through differently shaped paper»).
The basilisk breaks this twice — its tail's 30° sideways bends and its neck and
head reverse folds cross the spine — which is why opening its body fails at the
tail (tried at 140°/160°) and folds the neck on one half only.

Two more lessons from the basilisk, each seen on a render: the halves must be
wide (its narrowed strip gave a slit, not a cross-section) and open near a right
angle (140° of rotation left only 40° between them). The operator judged both
renders and was right both times; the agent's own reading of them was wrong.
**Judge volume by the shadow and the head-on view, and show the operator the
render before claiming anything.**

## Done

- The springback solver (mesh, contact, FIRE relaxation) moved to
  `claude/origami-springback`, draft #254, on the operator's «ок»; its plan is
  `docs/plans/origami-springback.paused.md` there. `src/origami` here is back at
  `main` (814d147e).
- A prototype in `tmp/` (gone with the container), rigid: square, fold in half
  along `y = 0.5` (`valley`, `moving [0.5, 0.9]`, `tag: 'U'`), then a shaping
  fold on the same line, `select: { tag: 'U' }`, `moving [0.5, 0.25]`,
  `angle: 90`, rendered through `render()` from
  `src/origami/scripts/lib/ render.ts` with a `display` that puts the spine on
  top: with `u = y − 0.5`, bisector `b = (−cos(θ/2), sin(θ/2))` in `(u, z)`,
  across `a = (−b₁, b₀)`, `display = [x, u·a₀ + z·a₁, −(u·b₀ + z·b₁)]`. It
  renders a tent with a real triangular cross-section and a wide shadow —
  volume, nothing else yet.

- `src/origami/entities/design/model/tardigrade.ts`, registered, with
  `tardigrade.test.ts` (no physics error; as tall as a third of its width; legs
  reach below the belly). The rule sharpened on the way: a flat crease may cross
  the open spine only **perpendicular** to it — a tilted one moves the spine's
  piece off the line the halves turn on. So every flat fold is parallel or
  perpendicular to the spine, or stays inside one half.
  - Belly: both long edges hemmed under (0.22).
  - Head: each half's lower front corner folded under — a snout.
  - Segments: three perpendicular pleats, depth 0.12, folded before opening.
  - Body: the halves turned down 25° at the spine, then barrel creases at
    0.07/0.14/0.19 (30°, 35°, 70°): the last curls the belly under.
  - Legs: no mid-edge flap exists in a rigid fold, so each leg is a pleat's
    folded corner (its tuck and the paper over it, at the belly edge), plus the
    tail's corners. Turned **outward**, which on the curled belly is down. A leg
    is at most half a pleat's depth wide. Turned inward, or on an uncurled
    vertical side, a corner only rises — both tried and rendered.

## Rejected: v1 is not origami

The operator on v1: «просто сложить листик бумаги в 5 раз и назвать это
тихоходкой -- так не покатит … посмотри какие-то "ключи" -- базовые формы, из
которых в оригами обычно складывается дальше». The design starts over from a
classic base.

What the engine reaches today, checked by folding (`tmp/tg/bases.ts`, gone with
the container): the **kite** (two valley folds) and the **waterbomb base** (book
fold, then both top corners inside-reversed) fold clean; the preliminary base is
its inverse and should too (the first attempt had wrong lines). The bird, frog
and fish bases need squash, petal and rabbit-ear folds, which the engine does
not have.

The agent drew three targets,
`docs/remove-before-merging/origami-volume-c79y3i/tardigrade-sketches.svg`
(dome, rings, plush ¾). The operator: «выбор схемы за тобой, если это будет
выглядеть как любое предложенное тобой (объёмное, замкнутое, с ножками, в идеале
и с намёком на морду тихоходки, то уже хорошо :)». Chosen: **1, the dome**, from
a blintzed waterbomb base (blintz, book fold along `y = x`, then inside reverse
folds along `x = 0.5` and `y = 0.5`) — it folds clean in the engine, 12 pieces,
a right triangle with the right angle at `(0.5, 0.5)`. Fold it colored side
down, so the blintz flaps show the front.

**What the engine cannot do: close a volume.** A shaping fold turns one flap
about one line, the flap being everything joined to it off that line. Any closed
body has a vertex where several non-flat creases meet, so the paper around it is
one loop and no single line cuts a flap off it (v1's tent was open-ended for
exactly this reason). The volume therefore comes from the springback solver on
`claude/origami-springback` (#254): fold the dome flat — legs and snout as
reverse folds, all flat and legal — then let the creases spring open, which is
how a real waterbomb gets its volume too.

The solver is back on this branch (48b0112c, on the operator's «окей»), #254
closed in favor of #253. Its plan, with where the solver stopped (it never
settled on the full basilisk), is now
`docs/remove-before-merging/origami-volume-c79y3i/springback-notes.md`.

**Legs, still open:** six of the eight flaps sit where legs go — the waterbomb
base's four, plus two from the book fold — but the blintz's corners land with
their tips at the apex, the dome's top, not under the belly. Working them down
into legs is the first design question.

## Inflating the base: what the solver does (relay 5)

Prototypes in `docs/remove-before-merging/origami-volume-c79y3i/prototype/`
(`.ts.txt` so no checker reads them; copy to `tmp/tg/` as `.ts` and run with
`npx tsx`): `dome.ts` folds the blintzed waterbomb base and relaxes it,
`show.ts` renders a relaxed mesh through the origami renderer one triangle per
piece, `angles.ts` computes consistent crease angles. Runs take 20–60 s per 40k
steps on 803 vertices.

- **From the pressed state it does not settle**: the flat base starts with 84
  crossings, the basilisk's failure again.
- **From the flat sheet (`fromFlat`) it settles badly**: the blintz flaps, swung
  180° through space, pass through the paper (strain 13%, 118 crossings).
- **From the pressed blintz (`fromPose`, the state after step 4) it nearly
  works**: start positions from the pose, the base's creases starting at 0, the
  contact stack read off the pose. 0 start crossings; at 40k steps a four-point
  star dome (`hold` 0.5 on all base creases), 2 crossings, strain 10%, not yet
  settled. This is the route.
- **The base's vertex is degree 6, not 8**: four diagonal rays (`x = 0.5`,
  `y = 0.5`, made by the reverse folds) and the midline `y = x` (the book fold);
  `x + y = 1` is never creased, so two 90° sectors stay flat — the big faces of
  a tent. Equal holds on all creases are inconsistent at that vertex, hence the
  strain. `angles.ts` gives the symmetric 1-DOF motion: big faces tilted 130° →
  diagonals 118.6°, midline 168.9°; 150° → 78.5° / 158.2°.
- **Those angles made it worse** (`HOLDM=0.938 HOLDD=0.659`: strain 13%, 23
  crossings, the big faces visibly bent; render
  `prototype/pose-consistent- angles.png`). Two suspects, unchecked: the facets
  are as stiff as the creases (`FACET = CREASE = 0.7` in `relax.ts`), so the
  paper bends instead of creasing; or the holds landed on the wrong family
  (check which record `holdAt` picks for the `y = x` halves).

## The base settles: start it folded, not flat (relay 6)

Why relaxing from the flat pose failed: from flat, the degree-6 vertex sits on a
bifurcation, and the solver took the **trivial branch** on one half — the small
45° sectors stay in the big faces' planes, only the midline folds, the diagonals
stay at 0 (measured: `x = 0.5` above centre and `y = 0.5` right of it ended at
~0° against a −119° target, the opposite half at ~−107°). A stiffer `FACET` (30)
only made it settle there faster (strain 10%). `angles.ts` also had a bug: it
put the midline ray in the plane `y = 0` instead of the mirror plane between the
big faces, so its "consistent" angles were not.

What works (`fromVertex` / `waterbombVertex` in `prototype/dome.ts.txt`, env
`PSI=<deg> TENT=±1`): fold the vertex **rigidly in closed form** — big faces
tilted by ψ about the midline, each tucked sector carried by the rigid map
taking its two rays to theirs, the midline ray at `s = −2·atan(sin ψ)` in the
mirror plane — place every pose point (flaps with their layer offset along the
sector's normal), and make each base crease rest at the angle it starts at. At ψ
= 60°, `FACET = 30`: 0 crossings (201 at start, from the flaps' offsets, all
resolved), strain 1.2%, every crease within ~1° of its target (midline 120°,
diagonals 135°). `TENT=1` is the classic waterbomb tent, faces flat
(`prototype/vertex-psi60.png`); `TENT=-1` the same vertex turned inside out.
Neither shows the blintz flaps (green) from outside yet — check which side they
land on before building legs on them.

**Colours.** The blintz pose has the paper's back up and the flaps outside the
tent at `TENT=1`. The earlier all-cream renders were the viewer's fault:
`show.ts` now puts each mesh triangle counter-clockwise in paper, as the
renderer reads a piece's front off that order.

**First legs (`TIPS=1`, `TIP=0.18`).** Before the base, each blintz flap's tip
is folded back out past the blintz edge (`select: { at, top: 1 }`, line
`x + y = 0.5 + t` and its three mirrors), so it pokes `0.5 − 2t` past the edge.
In the tent these poke down under the bottom edges — four cream legs under a
green body (`prototype/tips-psi60.png`): 0 → 5 crossings, strain 1.1%, unsettled
at 40k. The base's four corners still spread sideways as wide flat points; they
are the other four legs to narrow and turn down.

**Where the eight points sit** (`tips-psi60.png`, top and side views): the ridge
is the midline. The four base corners are the tent's bottom corners, two per
long side, spreading out along the diagonals. The two big-face flaps' tips poke
down at the middle of each long side; the two tucked flaps' tips poke down at
the ridge's ends — one of those is the natural snout, the other the rear. So the
count is already 4 + 2 legs and a snout and tail; what is left is proportion:
corners too wide and flat to read as legs.

**ψ = 75° reads better and settles cleaner** (`prototype/tips-psi75.png`):
taller body, the corners hang lower, 0 crossings, strain 0.99% — `## Left` item
1's bar met. Use it as the default until the legs are shaped.

**Option: corners blunted under** (`BLUNT=0.12`, `prototype/blunt-psi75.png`):
each blintz-square corner mountain-folded under along a line square to its
diagonal, which keeps the fold local. Boxy feet instead of wings; strain 2%, 0
crossings. Asked the operator which reads better (wings or blunt feet);
unanswered at the pause.

**Dead end: kite-narrowing the corners in the pose.** A fold line through a
blintz-square corner crosses the whole square, so the triangle it moves reaches
the next corner and swallows it (the second corner's fold then finds no paper:
«fold: nothing at 0.95,0.46»). Narrowing a corner needs a fold that stays local
— after the base, on the flap itself, or a sink — not a line across the flat
sheet.

## ψ = 75° is a flat wedge; ψ = 45° is the volume (relay 7)

The earlier renders looked across the body's long axis at a slant: the axis runs
along world `(1, 1)`. `show.ts` now turns the model by `ROT` (default −45°) so
the side view looks across it, and `where.py` prints the paper's landmarks in
that body frame (x along, y across, z up). Seen that way, ψ = 75° is a thin
wedge, 0.13 wide for 0.66 long, nearly the pressed base standing on edge
(`prototype/tips-psi75-along.png`): low strain, but no volume to speak of.

- **ψ = 45°** (`tips-psi45.png`): a real tent, 0.71 long, 0.67 wide, 0.43 tall;
  strain 1.2%, 5 crossings. The cream corners are horizontal wings at the bottom
  edges.
- **ψ = 45°, `BLUNT=0.2`** (`blunt20-psi45.png`): the wings fold away and the
  whole outside goes green. From the side it is a squat body on legs: the gable
  ends' tucked sectors run down to the tucked tips, the lowest points (x =
  ±0.13). Strain 1.3%, 3 crossings at 60k steps. This reads closest to an animal
  so far.
- **Dead end: corners bent down 90° (`BHOLD=0.5`)**: from the pressed pose the
  corner swings through the layers; 38–78 crossings, strain 7–14%.
- **Dead end: a shorter front tip as the snout (`TIPF`)**: changes only that
  end's leg length; nothing reads as a head.

## Set aside: a random search instead (relay 7)

The operator on `blunt20-psi45.png`: «нет, конечно, не похоже 🙂 старайся, у
тебя всё получится, и не надо останавливаться», then: «если отложить тихоходку в
сторону и создать скрипт, который несколько раз генерит параллельно наугад, а ты
потом смотришь и пытаешься среди всего этого мусора найти жемчужину? :)». So the
tardigrade waits, and the work is a generator.

- `prototype/gen.ts.txt` — per seed: 2–5 flat folds along lines through the
  folded shape's own landmarks (piece corners and edge midpoints), a random
  selection (`all`, `flap`, top layer) and direction, then 1–3 folds left open
  (`hold` 0.3–0.8). Relaxed `fromPose` from the state before the open folds;
  scored by crossings, strain and volume (smallest principal extent over the
  largest). ~13 s a seed at 15k steps. Illegal folds are retried with another
  line.
- `prototype/sheet.ts.txt` — the survivors past given bars, most volumetric
  first, one three-quarter view each, labelled `#seed v… s…% x…`.
- First run (160, asymmetric): 57 clean, none worth keeping — fully unfolded
  sheets (which a volume bug ranked first, fixed by sorting the extents) or two
  or three planes at an angle. Hence `SYM=1`: the sheet is first folded in half
  along `y = x`, every later fold goes through both layers or is an inside
  reverse of a flap, and the solver lets the spine open to 0.35–0.75 of its fold
  from the pressed state.
- **The operator's fallback, if the search finds nothing**: «ты сгибаешь сам, но
  не идёшь ни к какой цели, просто что-то гнёшь -- опа, что-то интересное,
  попробуем ещё так. если у тебя пойдёт как у человека, то в какой-то момент
  тебе покажется "хмм, это на что-то похоже", а дальше уже будет проще». So:
  fold by hand, one step at a time, render after each, follow what looks
  interesting rather than a target.
- Second run (200, `SYM=1`): 72 clean, none worth keeping either — nearly all
  the folded-in-half triangle with its spine half open and one or two folds on
  top (6–8 pieces). Random lines through landmarks mostly land on edges the
  shape already has, so the folds add no detail: random search does not make
  shapes complex enough to look like anything. **Next: the operator's fallback
  below.**
- The operator sees the images the agent `Read`s in the session's feed, but a
  24-up sheet (1800×8400) shrinks there to an unreadable strip: keep a sheet to
  8 frames (`sheet.ts` limit 8, `OFF` to page).
- An idea kept for the tardigrade: a waterbomb tessellation strip curls into a
  segmented barrel with points along its edges — segments and legs from one
  pattern. Needs a mesh built from a crease pattern rather than from fold steps.

## Folding by feel (relay 8)

The operator: «помни, у тебя нет задачи сделать тихоходку. не думай ни о
тихоходке, ни о белом медведе)». The tardigrade is no target here, not even a
distant one: fold, render, follow what looks interesting, and judge a result
only by whether it looks like _something_.

- `prototype/feel.ts.txt` renders a step list rigidly; `prototype/spring.ts.txt`
  folds it flat and lets the creases spring to their `hold` (`POSE=<n>` starts
  from the state after n steps). Steps go inline as JSON; 3–20 s a run.
- A crease with no `hold` springs to the paper's default, so a strip's
  lengthwise folds need `hold: 1` or the strip opens up again.
- So far: an accordion (clean, a zigzag); a four-layer strip bent across — a
  «П», a table on one foot, and with two oblique bends a deck chair
  (`feel-strip-chaise.png`). A strip has one path, so nothing branches off it.
- On the operator's ask, three subagents folded by feel in parallel, each from
  its own first move. Three things now read as something, all clean
  (`prototype/feel-*.png`, steps beside them as `feel-*.steps.json`):
  - **Fish** (pleats): 11 radial pleats 15° apart around `(0.5, 0)`, hold 0.85,
    then one fold across the wedge 0.18 from the apex swinging the tip up (hold
    0.7). Side view: snout, ribbed body, cocked tail. 0 crossings, 2.1%.
  - **Calla lily** (curls): 14 valley creases fanned from corner `(0, 0)` at
    6°…84°, holds rising 0.03 → 0.33, the last three mountains at 0.12, relaxed
    `POSE=0`. 0 crossings, 0.26%.
  - **Butterfly** (bases): waterbomb base pressed (0.85), front corners up and
    sprung to 0.3, back ones to 0.7, forewing tips blunted, `POSE=3`. Head-on a
    butterfly. 0 crossings, 2.0%.
- What the three found, each on its own:
  - **Creases through one point spring with no strain**, and a ragged fan edge
    reads as fins, feathers or petals. Parallel pleats give screens and books.
  - **Relax from where the creases start open**: a roll or fan from flat
    (`POSE=0`), a base with flaps from just after the base (`POSE=3`). From the
    pressed stack the same steps jam (54 crossings, 16%).
  - **A fold across another must leave that one nearly pressed** (≥ 0.85), or
    the shared vertex strains 5–14%. Uneven holds make the character: equal ones
    give a bow-tie, uneven ones wings; rising ones turn a cone into a lily.
  - Fold lines meeting on a raw edge leave crossings; stop them short of it. Fan
    line endpoints need full precision, or slivers blow the relax up.
  - The kite-base swan has a perfect flat outline (`feel-swan-rigid.png`) and
    never survives springback: kite flaps inside a reverse fold start out
    crossing.
- Their tools: `prototype/mk.js.txt` (pleats: `fan`, `X` across a wedge),
  `curls-gen.py.txt` (`fan(cx, cy, angles, holds, dirs)`), `bases-lib.py.txt`.

## Folding by feel, round two (relay 9)

Three subagents each pushed one find further (~30 runs apiece); renders and
steps in `prototype/feel-{lotus,tulip,fish-gill,frog}.*`, the run helper
`prototype/go.sh.txt` (`POSE`, `ROT`, `MAXIT`; renders to
`tmp/tg/runs/<name>/`).

- **Calla → lotus and tulip.** Alternating valley/mountain is what makes form;
  all-valley fans only give cones and lilies. 15 creases from the centre at
  0.6/0.4 open into a lotus bowl (2.0%); 15 from the bottom-edge midpoint at
  0.8/0.55 close into a tulip cup (0.27%), which from above reads as a paper
  jet; at ~0.3 the same fan is a flat scallop shell. A centre fan held harder
  jams (0.8/0.6: 55 crossings); 15 creases is the sweet spot; a second fan after
  the first does nothing visible, its corner having moved.
- **Fish → slimmer fish** (top view, `ROT=90`): fan hold 0.9 instead of 0.85
  slims it and keeps cross folds under 3%; tail fold at 0.28 from the apex
  stands the tail up (0.35: 12 crossings); a mountain at 0.65, hold 0.2, is a
  gill line. Still only a fish. Uneven holds inside the fan strain 10–15%.
- **Butterfly → frog** (head-on, `POSE=3`): the same base with the front flaps
  up 0.6 and the back ones at 0.35, all four tips folded (hold 0.8 — 0.9 leaves
  1–2 crossings): arms up, legs splayed, a lens of a mouth. 1.3%. Only head-on;
  from elsewhere a box with a flap.
- **Tulip → moth** (top view, `ROT=90`, `feel-moth.*`): the fan at 0.85/0.6,
  then two folds along the stack's length, 0.06 off its axis, folding out only
  the outermost layer — `top: 1` valley and `bottom: 1` mountain, hold ≤ 0.5
  (0.7+ crosses): green fore- and hindwings, a slim body. 1.5%. With 7 creases
  instead of 15 the same pair makes a swept-wing jet. A step's line is placed in
  the folded state, not on the sheet; all-layer cross folds on this fan strain
  6–8%. The operator read the frog head-on as a dilophosaurus with its frill
  spread — handed to the frog's next round as a lead.
- **Frog → head, and a dilophosaurus** (head-on, `POSE=3`, `ROT=0` — `ROT` seems
  to act before the relax: at 90 the same steps cross), `feel-dilo.*` and
  `feel-frog-head.*`: one vertical fold across all layers at x = 0.35 (hold
  0.5–0.7; ≤ 0.33 cuts the flaps, 11–41 crossings) flips the base's apex up into
  a head between the raised flaps. With the front-flap tips folded mountain
  (0.75) the flaps notch into a W and read as a spread frill around a pointed
  head (1.3%); with legs at 0.45 and the head's tip blunted (`top: 1`), a squat
  frog with a muzzle (1.8%). Ragged frill nicks drag joined layers (~20
  crossings); opening the spine below 0.9 crosses 23–29.
- **Dilophosaurus, round two** (`feel-dilo-tail.*`, `feel-dilo-jaw.*`, 2.1%,
  clean): a second fold on the head's outer layer only (`top: 1`, x = 0.25–0.31,
  any hold 0.3–0.7) and a mountain pleat at x = 0.36 make a jaw hooked down
  (`bottom: 1` crosses 33–48); legs lowered to 0.3 tip the model so the neck
  rises from the side; one back flap dropped to 0.05–0.15 swings out as a tail,
  the only thing that broke the box from the three-quarter view. The box is the
  base itself, held shut by its spine at 0.9, and nothing tried opens it; the
  frill will not go rounder (corner cuts cross 10–26).
- **Opening the dinosaur's box: a two-stage relax** (`prototype/dilo2-*.txt`;
  `two.ts` copied to `tmp/tg/dilo2/` with its siblings, run by `run2.sh`): fold
  only the 3-step base from flat and relax it into an open tent, then start the
  whole model from that tent with every crease at its real angle. The bare base
  then starts at 0–1 crossings, where POSE=3 or POSE=0–2 gives 13–276. Only the
  spine may open — the diagonals stay ~0.9, since the flaps' folds cross them
  (sides open: 5–12% before the head). Spine 0.7 with the whole dinosaur: 0
  crossings, **4.0%**, back-to-belly gap ~3× the pressed one
  (`feel-dilo-open.png`) — slimmer, not a full body. Without the head fold,
  spine 0.5 is clean (2.3%) with real volume. The head fold is what blocks it:
  it crosses the spine at (0.5, 0.35)/(0.5, 0.65), where the spine must close,
  and one crease has one hold. Untried: a separate fold pinching the spine shut
  only near the head; a head from a reverse fold; the `dome.ts` tent.
- **Engine limits met**: a fold seeded on some layers still drags every layer
  joined to them along the pleats (no forked tail); a single-layer fold works
  only on the outermost layer (`bottom: 1`).

## Left

0. **Now**: keep folding by feel from the three finds — push whichever reads
   best a few steps further, show the operator renders as they land, without
   waiting on them. The items below wait until the work returns to a design.

1. ~~Make the base settle near-isometric~~ — done: `PSI=75 TIPS=1`, 0.99%, 0
   crossings; but see relay 7, ψ = 45° is the volume.
2. Shape the legs and snout. Done: ψ = 45° with `BLUNT=0.2` stands on legs
   (above). Left: get its 3 crossings to 0; a snout. The front gable's hanging
   diamond is the closest thing to a head (head-on view); a snout has to come
   from a fold that pokes it forward rather than down. Render each stage and
   show the operator.
3. Move `fromVertex` (with `waterbombVertex` and `fromPose`) and the
   per-triangle render into `src/` (a `--relax` path in `fold-model.ts`), with
   tests — the closed-form vertex is a pure function, so it gets unit tests on
   its sector maps (isometric, continuous across each ray) — and replace v1 in
   `tardigrade.ts`.
4. `/polish`, `/pr` (#253's title and body still describe the basilisk and the
   solver — rewrite them).

## DRY notes

- Reuses the fold engine (`run`, shaping folds, tag selection), `snapshot` and
  the renderer unchanged; the design is data in its own file, as the basilisk
  is.
- The tent's `display` math is the design's own (each design has one); not
  shared until a second design stands on an open spine.
