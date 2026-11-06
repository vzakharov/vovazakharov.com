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
- **A hump: holds that vary along a crease** (`prototype/dilo3-*.txt`,
  `feel-dilo-hump.png`; `two3.ts` env `SPINE=` / `RADIAL=` / `OVR=`, variants
  one per line in `v.txt`, `best3.sh` reproduces): the spine and both base
  diagonals pressed shut within ~0.2 of the sheet's centre — where the head
  crease crosses them — blending out to spine 0.5, sides 0.8; head hold 0.4. The
  whole dinosaur at 0 crossings, **3.02%**, back-to-belly gap 1.5–1.8× the
  spine-0.7 run: from three-quarter a rounded hump, the head up on a neck.
  Physically: the base creases pinched sharp around the neck, loose elsewhere.
  **No fold step makes this** — a crease takes one hold from the last fold
  covering it, and a fold along the spine drags the whole half-model — so using
  it in a design means adding per-crease hold profiles to the engine. Reverse,
  slanted or shaping heads strain 9–23%. The next hot spot is the flap crease
  ends at the tail. Parallel renders hang: `run3.sh` renders serially.
- **Engine limits met**: a fold seeded on some layers still drags every layer
  joined to them along the pleats (no forked tail); a single-layer fold works
  only on the outermost layer (`bottom: 1`).

## Locks: what every model so far lacks (relay 10)

The operator: «всем нашим попыткам up until now не хватает чтобы что-то
цеплялось за что-то. Пока это просто лист бумаги, сложенный в определённой
последовательности. Оригами создаёт опоры, конструкции, склейки без клея».

Why the engine cannot make one today:

- **No tuck.** `flatFold` puts a valley's flap on top of the whole stack and a
  mountain's under it; only reverse folds land between layers. No step folds a
  flap into a pocket.
- **Every crease is told its own angle** (`hold`), so no part ever has to hold
  another up; and contact only keeps a vertex on its side of a triangle, with no
  friction, so layers slide freely.

In real paper the shape is an equilibrium — creases spring open, locks stop them
— and a lock is also how paper closes a loop, the volume § "Rejected: v1 is not
origami" says rigid folds cannot close.

**A lock holds, with friction** (`prototype/lock-*`, copied to `tmp/tg/lock/`
without `.txt`; `lock-go.sh` runs it, env `FRICTION`, `SHEAR`, `BOND`, `TRACK`):

- `lock-fold.ts`: `direction: 'tuck', into: { at, below: k }` — a rigid flat
  fold restacking the flap between two stationary layers at `at`, under the top
  `k`; logged as `valley` for the mesh. It throws when a layer between the flap
  and its own paper covers the crease.
- `lock-contact.ts`: stick-slip Coulomb friction per contact pair — an anchor on
  first touch, a tangential spring capped at `FRICTION` × the normal force,
  dragged on slip, released on separation.
- The test (`lock-ring-{tuck,plain}.*`): a two-layer strip (book fold, hold 1)
  closed into a loop by two folds at hold 0.2, one end tucked into the other's
  pocket. Without friction the tucked end slides out. With friction 0.5 the
  plain fold springs open (ends 0.204 → 0.888 apart) and the tucked one stays a
  ring (0.196) — but at 31 crossings and 4.25%, settled early with pairs still
  slipping.
- **Why it is not clean, and not friction's fault** (glue gives 41 crossings): a
  start lift reaching one mesh edge (`lock-mesh.ts`, `START_REACH=1`) takes the
  start crossings from 3 to 0; the 30 left are the pocket mouth and the tucked
  tip passing edge through edge, which contact cannot see (it keeps vertices off
  triangles only), and the tucked flap's crease nested ~1 gap inside the
  pocket's on the same line, which the one-edge crease wedge cannot resolve. The
  strain follows the bend-to-stretch ratio: 4.26% at `FACET` 0.7, 2.44% at 0.2.
  Next: contact points along edges; nested creases on one line counted as
  touching, separately.
- Friction makes the relax path-dependent: the result depends on the order of
  folding, tucking and letting go, so a model is relaxed step by step along its
  sequence rather than once from a final pose.
- **Edge contact clears the edge crossings** (`lock-contact.ts`,
  `EDGE_POINTS=3 EDGE_SET=outline`): quarter points on outline edges, pushed off
  triangles like vertices, their force shared to the edge's ends. Real crossings
  30 → 1 (a 4.2-gap nested graze just past the cut), 21 nested-crease contacts
  counted apart (`NESTED=4` gaps, same paper line); still closed (0.196), the
  plain control still open (0.888). Edge points on creases too reach 0 real but
  double the nested ones and never settle. Strain 4.84% (3.52% at `FACET` 0.35)
  sits on the pocket's free end where its crease pins it while the tucked flap
  wedges the pocket open. Porting: ~85 lines of edge contact and ~50 of nested
  check, a module of its own beside `contact.ts`; tests listed in the
  prototype's report (edge-point weights, a segment passing between a triangle's
  vertices, collinear crease keys, 3 vs 5 gaps).
- **No lock has helped a head yet, and the start is why** (`prototype/head/`,
  each steps file with a `-plain` twin; `mk.py` writes both, `count.py` counts
  layers at a point to pick `below`). A tuck reaches its pocket only from the
  fully pressed state — from `POSE=n` a flap at hold 0.2–0.3 never folds far
  enough — and the pressed start of anything past ~4 layers, or with several
  creases at one point, begins at 100–280 crossings the relax never clears: the
  face-maw, the waterbomb base, a paper cup. Locking the face-maw's back corners
  was refused (the deep corner fold drags every joined layer into a 4–5-layer
  flap). Locks hold only on low-layer strips: a tapered ring keeps its ends
  0.19–0.24 apart against ~0.88 plain, but a tube with a snout reads as a loaf
  (`head/tube1.png`). A fold through all layers locks by itself, so its plain
  twin stays closed too.
- **Next: relax along the sequence** — fold a step, relax, fold the next from
  the relaxed shape, tuck, let go — instead of one relax from a pressed or
  part-unfolded pose. It is what friction's path-dependence asks for anyway (the
  operator: «получается, нам целую динамику тут нужно просчитывать»), and the
  only route by which a lock reaches the bases that already read as heads.
- **Sequential relax, first pass** (`prototype/seq/`; `sim.ts` is `relax.ts`
  keeping its state across phases, `phase(goals, ramp, …)`; `seq.ts` folds from
  the flat sheet, per step k setting each hinge's goal to its angle in state k
  via `poseOf` and `foldAngle`, switching contact to state k's stack, ramping
  and settling, then letting all creases spring to their holds; contact can
  `restack`, `RELEASE` an out-of-reach pair's side, and `suspend` a flap-to-lid
  pair): the plain ring steps through at 0 crossings every step and opens to
  0.888, as the one-shot. **The tuck jams**: with friction 0.5 the flap sticks
  halfway into the pocket (79 crossings, `seq/ring-tuck-s3-jam.png`); with
  friction 0 it is clean but stops 32° short and the ring opens. Next, in order:
  friction per phase — 0 during a tuck step (the hand lifting the lid), on once
  let go (`contact.ts` lines ~331 and ~414 read `FRICTION` as a constant); then
  the waterbomb base step by step (`seq/go.sh base3 …` with `DIAG=1 LAGS=1`, its
  first line prints the one-shot's ~216 to beat; the risk is the inside reverse
  fold at a vertex the book crease holds flat); then the face-maw with a tuck.
  Port size so far: ~200 lines of simulator, ~40 of `poseOf`, ~30 of contact
  changes; ~5–8 s per step on 800 vertices.
- **Sequential relax, second pass** (`prototype/seq/` updated; runs need
  `FRICTION=0.5 EDGE_POINTS=3 EDGE_SET=outline`):
  - **Fold the way a hand does, or it jams**: no friction while a step folds
    (`STEP_FRICTION=0`; 0.5 gives 49–62 crossings on the base), and a reverse
    fold taken by unfolding the previous state partway, collapsing to the same
    share of the new one and pressing (`WAY=1`, f 0.35–0.5): ramping each crease
    alone turns the reverse fold while the spine stays pressed, which rigid
    paper cannot (step 2: 47° lag, 8%). `OPEN=f` alone is fragile.
  - **Bases come clean**: `base3` 0 crossings every step, let-go 0.73%
    (`seq/base3-stepped.png`); the face-maw's base (steps 1–3) 0 crossings where
    its pressed start has 479. (`base3`'s own pressed start is clean too; the
    ~216 belonged to another model.)
  - **The face-maw breaks at step 5**: the top corner valley stops at −87° of
    −180° — its folding top layer runs into a layer of the other half near the
    top edge (around paper (0.58, 1)) — while its mirror, step 4, is fine; from
    there crossings grow to 483 (`seq/maw5.steps.json` reproduces).
  - **The ring's tuck still fails**: straight, it "holds" only by passing
    through its lid (81–86 crossings; once 2 at `STEP_IT=24000`, unstable);
    likely because the flap's book crease lies on the pocket's own line and
    contact pushes only along normals, never sideways out of a U. A crease
    skewed 1.15° (`seq/ring-tuck-skew.steps.json`) clears every crossing but
    stops 16° short and opens; `LIDOPEN=0.6` the same. Every phase runs to the
    8000-iteration cap with facets bending, so lags understate.
  - Port estimate now: ~200 simulator, ~40 `poseOf`, ~40 contact, ~30 the
    reverse-fold path, ~40 tuck suspend/seat/lid — plus whatever fixes step 5
    and the ring tuck, which is unknown and decides whether porting pays.
- **Ring tuck, relay 11 round 1** — the jam is not the book crease on the
  pocket's line. The flap never folds during the tuck phase: with the lid
  suspended it stalls near upright, and the seat (ramped in one iteration, every
  flap–lid pair live) swings it down through the lid — the 82–86 crossings are
  the flap's tip edges and the lid's free end. Upstream, step 2's pocket tip
  settles 0.02 open (≈45 gaps, a real equilibrium, not the iteration cap). Tried
  and dropped: sideways push out of a U (`SIDE`, stretches rather than closes),
  a hand's pressure (`PRESS`: 0.0005 clean but the tuck stops 21° short and the
  ring opens, 0.002 crumples), long-reach side sorting in the seat
  (`SEAT_REACH`, 290–440 crossings), holding the pocket's lip up (`LIP`, same
  jam).
- **Ring tuck, relay 11 round 2** (`prototype/seq-tuck/`, the round's
  `seq.ts`/`sim.ts`/`contact.ts` with every knob default-off) — no contact holds
  the flap up; the solver does. The model floats free, so the flap's swing turns
  the whole base ~50°, the weak pocket crease lags and flips open, and its tips
  land square on the flap's underside — a T-strut normal-only contact can put no
  torque through (`ring-tuck-whip-strut.png`, `prog-baseline.txt`). Held still
  (`TABLE=k`, a spring pinning what the step leaves still), the flap only crawls
  (127–152° in up to 30k iterations, dt collapsing): FIRE's global velocity
  reset against heavy vertex masses. A real bug fixed on the way: edge points
  with one end on lid and floor never suspended (`SKIP_ANY=1`, tuck-phase
  crossings 82 → 0), not the jam's cause. Every variant opens the ring (0.854).
  Untried: per-vertex velocity reset or lighter contact mass during a tuck,
  driving the flap rigidly to its pose, then a ramped seat; the nested crease
  wedge at x=0.3 (floor crease vertices ~0.76 gap deep into both neighbours)
  likely sets step 2's open pocket tip.
- **Face-maw step 5, relay 11 — fixed by a hand** (`prototype/seq-hand/`). Not
  the step data, the stack sides or the final-state mesh: a fold driven only by
  its crease torque pushes back on the crease's own root, and step 5's root sits
  one mesh edge from the book-fold corner, so it shoves o4 into o1 (its own
  paper edge, reversed) from a 13° bend. Step 4 fails the same way when the base
  is pressed harder; which one breaks depends on the free-edge gap the `OPEN`
  share leaves. `HAND=k`: an outside spring pulls each vertex wholly on the flap
  toward a rigid turn about the crease (axis fitted through its vertices, sense
  from facing), at the ramp's share — the crease root takes no reaction. maw5 at
  `HAND=50 OPEN=0.5 RAMP_STEP=6000 STEP_IT=12000`: 0 crossings every step, lag ≤
  5°, let-go 0.97%; base3 and the plain ring stay clean. The full face-maw is
  clean through step 7, then 63 crossings at step 8 (a mountain on
  (0.25,0.45)–(0.45,0.25)), ~100 through 12, 500+ at 13–14 — undiagnosed;
  suspect the single axis fitted across every flap layer. Port ~60 lines.
  Pinning the staying paper, or its crease too, does not fix it; a slower ramp
  alone is worse. The same hand is round 2's untried "drive the flap rigidly"
  for the ring tuck.
- **The lock holds, with the hand** (relay 11, `prototype/seq-hand/`
  `ring-tuck-hand.png`): `hand()` taking a tuck as a valley turn into the
  pocket, at `HAND=50 RAMP_STEP=6000 STEP_IT=12000` (default ramp 2000 still
  cuts the lid, ~99). Tucked ring 0 crossings every step, let-go 1, end gap
  0.154 (of 0.160 pressed); the plain twin opens to 0.855; at friction 0 it
  still holds (0.083), so the lock is geometric. Flap layers o3/o4 sit between
  pocket floor o2 and lid o5, every pair on its side. The one crossing and the
  5.0% worst bar (next 3.5%, 2%) sit at the nested corner where the flap's y=0.5
  fold lies inside the pocket's — the x=0.3 wedge note's corner. Not needed:
  TABLE, PIN, SKIP_ANY, `SEAT_RAMP`; `LIDOPEN` cannot work here (the lid is
  joined to the floor along y=0.5). base3 and maw5 stay clean under the same
  settings. Port: the ~60-line hand plus ~5 lines for tucks; the face-maw's
  steps 8+ are now the open engine problem.

## Port design (relay 11)

Into `src/origami/shared/fold/`, each file under 450 lines, in three slices,
each its own commits with tests.

**Hidden defaults the prototype carries** (all winning runs used them):

- Contact mass factor `1 + SHEAR` = 2 in the sequential simulator (sim.ts sets
  it whenever `FRICTION` is set at all); the one-shot relax keeps 1.
- `RELEASE` on in the sequential relax (an out-of-reach pair forgets its side
  and its friction anchor); off in the one-shot, or its output changes.
- `NESTED=4`: an edge grazing within 4 gaps of a triangle on the same paper
  crease line is nested, not a crossing — a `crossings` option defaulting to 0.
- mesh.ts needs only `export function foldAngle` (`OUT_POW`, `START_REACH` are
  inert at defaults); fold.ts only the tuck
  (`direction?: FoldDirection | 'tuck'`, `into`, `tuck()` in `flatFold`, logged
  as `valley`).

**Sequential defaults**: friction 0.5 after the steps, 0 while a step or tuck
folds; 3 edge points per outline edge, weight `1 - k/4`, skipping a triangle
either end is a corner of, suspended when either end is; hand k=50 for 6000
iterations, angle `step.angle ?? 180`, sense +1 tuck/valley, −1 mountain; ramp
6000, step cap 12000, tolerance 1e-4; a tuck suspends the lid (vertices wholly
on stationary pieces above the flap's top, against flap triangles, and back) — a
pair whose stacked side disagrees with where it is is skipped and keeps no side
— then seats over 1 iteration, cap 8000; let-go ramp 2000, cap 40000, tolerance
1e-5 after restacking to the final mesh. Reverse folds (WAY): with the previous
stack ramp creases to 0.5 × the previous angles, restack and run at 0.5 × the
new ones, press to full. A phase hitting its cap is reported, not thrown.

**Slices**:

1. Contact: split the 581-line prototype into `contact.ts`
   (`contact(mesh, gap, stiffness, { edgePoints, friction, release })`, restack,
   suspend, rubAt), a projection/grid helper, `edge-points.ts`, `friction.ts`,
   `crossings.ts` (Möller–Trumbore, crease-line keys, nested option); the tuck
   in fold.ts (a non-flat tuck throws). Unit tests: edge-point weights, a
   segment between a triangle's vertices, collinear crease keys, 3 vs 5 gaps.
2. `simulator.ts` (sim.ts without TRACE/pin, ~220 lines; a starting angle set
   for unwrapping), with `relax.ts` re-expressed as one phase of it —
   bit-identical positions before and after. The one-shot unwraps toward
   `h.start`; the sequential start must not (`unwrap(0, π)` jumps 2π).
3. `pose.ts` (`poseOf`), `hand.ts` (pure: `fitAxis` by power iteration seeded
   last−first, `turnSense = sign(dot(cross(d, flap), up)) · sense`, Rodrigues,
   the guide builder), `sequence.ts` (`relaxSequence(steps, paper, options?)` →
   a relaxation plus per-phase `{ iterations, settled }`; `Iterated` a base both
   share, for `pnpm type-overlap`); `mesh()` takes an optional edge length so
   the integration test (ring tuck closed < 0.25, plain open > 0.6, fixtures
   copied from `lock-ring-{tuck,plain}.steps.json`) runs coarse — full
   resolution takes 36 s. Prototype reference at full mesh: tuck 0/0/0, let-go 1
   crossing, 5.01%, end gap 0.153.

Checks per slice: `pnpm test`, `pnpm typecheck`, `pnpm lint:files <files>`,
`pnpm check:masd`, `pnpm masd:clusters`, `pnpm type-overlap`, `pnpm knip`. No
page imports relax.ts (only `physics.test.ts`), so `pnpm build` output should
not change.

## Left

0. **Answered (relay 10)**: «пока я б не назвал это дилофозавром, но идти в
   направлении "какого-то" монстра, пожалуй, уже, стоит. Может, это будет голова
   Василиска? А как уж он будет выглядеть, как дилофозавр, Хищник, или что-то
   среднее или совсем другое -- сгибы покажут)». So: keep folding by feel, now
   toward a monster's head — the Basilisk's, which closes the loop on the
   branch's first ask — with its look left to the folds: frill, jaws, mandibles,
   whatever reads. The engine work (per-crease holds, items 3–4) waits until a
   head is found, since what it needs depends on which folds the head uses.
   Since the operator's locks remark, the head is folded with the lock prototype
   (`tmp/tg/lock/`), and tuck + friction + edge contact join that engine work
   once a head shows which of them it needs.

   **Where it paused (relay 10, context budget)**: the lock engine needs the
   sequential relax, which folds bases clean but not yet a tuck or the
   face-maw's step 5. Recommended next, capped at two prototype rounds: (a) the
   ring tuck — set the tucked flap's crease back inside the pocket's (a start
   offset, or sideways contact out of a U-crease), and settle phases past the
   iteration cap; (b) the face-maw's step 5 jam (which layer of the other half
   it meets, and whether the mesh built from the final state is why). If both
   clear, port into `src/` and fold the head with a lock; if not, put the choice
   to the operator — keep at the engine, or build the head from holds alone (the
   face-maw, which reads head-on) and leave locks for later.

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
