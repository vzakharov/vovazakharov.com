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

## Left

1. **Barrel body**: 3–4 parallel creases along the spine, each partly folded,
   instead of one 90° ridge — parallel, so they never cross.
2. **Segments**: flat pleats across the back (pairs of flat folds through all
   layers), before the opening shaping folds.
3. **Eight stubby legs**: flaps at the halves' lower edges, each folded within
   its own half.
4. **Head**: a flat flap at one end.
5. Render after each of these and show the operator; tune by eye.
6. Then the design as `src/origami/entities/design/model/tardigrade.ts` beside
   the basilisk, registered in `designs.ts`, with a test like `basilisk.test.ts`
   (physics report clean); `pnpm origami tardigrade` views; `/polish`, `/pr`
   (#253's title and body still describe the basilisk and the solver — rewrite
   them).

## DRY notes

- Reuses the fold engine (`run`, shaping folds, tag selection), `snapshot` and
  the renderer unchanged; the design is data in its own file, as the basilisk
  is.
- The tent's `display` math is the design's own (each design has one); not
  shared until a second design stands on an open spine.
