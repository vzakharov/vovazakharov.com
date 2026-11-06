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

## Left

1. Bring the solver into this branch (merge `claude/origami-springback`, or
   rebase this branch onto it), and close #254 in favor of #253.
2. The dome flat: the blintzed waterbomb base, eight legs out of its eight flaps
   by reverse folds, a snout at one end; render each stage.
3. Inflate it with the solver; judge by the shadow and the head-on view.
4. `/polish`, `/pr` (#253's title and body still describe the basilisk and the
   solver — rewrite them).

## DRY notes

- Reuses the fold engine (`run`, shaping folds, tag selection), `snapshot` and
  the renderer unchanged; the design is data in its own file, as the basilisk
  is.
- The tent's `display` math is the design's own (each design has one); not
  shared until a second design stands on an open spine.
