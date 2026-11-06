# Origami: paper that springs back — a volumetric basilisk

## Goal

The basilisk from #251 (`src/origami/entities/design/model/basilisk.ts`) should
read as a model folded by hand: a body with volume, paper that bends, layers
that do not lie perfectly pressed — not a knife-flat cut-out.

## Why it is flat today

Every piece in `FoldState` is a rigid planar polygon, and every fold either lays
a flap flat (180°) or swings a rigid flap about a line. So the fold in half at
step 9 leaves both halves of the body touching, the head-on view is a single
sheet edge, and nothing between creases can curve. Hand-folded paper does three
things the engine does not:

1. **Creases spring back.** Let go of a strip folded in half and its halves open
   into a V; the body gets a cross-section.
2. **Paper bends between creases.** The open body narrows smoothly into the
   closed neck and tail.
3. **Layers stay apart.** Stacked flaps lift a little at their free edges.

**A rigid fix does not exist for this model.** The tail's sideways bends are
creases perpendicular to the spine, crossing it on both halves: a degree-4
vertex with four 90° sectors. Such a vertex folds along one pair of collinear
creases only while the other pair is flat or fully closed, so the body cannot
open at the spine while the tail stays bent — real paper gets there by bending,
which is item 2. That is why the plan models bending rather than opening the
spine rigidly.

## Approach — relax the folded state as a bar-and-hinge model

The standard model of real paper in origami simulation (Schenk & Guest 2011;
Ghassaei et al., _Origami Simulator_, 2018): the sheet is a triangle mesh whose
edges are stiff bars, whose crease edges are hinges with a target fold angle,
and whose non-crease interior edges are soft hinges wanting to stay flat. The
engine keeps folding exactly as now; a new stage takes the folded state as the
starting geometry, lowers each crease's target angle by how much paper springs
back, and lets the mesh settle.

### 1. Each fold records the creases it made

`fold()` appends to `state.log` the hinge segments it bent, in **paper**
coordinates (`hinges(state, line, moved)` mapped through each piece's inverse
placement). Later splits only cut those segments into collinear pieces, so any
crease edge of the final state is matched to its step by containment. `Step`
gains `hold?: number` — the fraction of its fold angle the paper keeps when let
go (1 = pressed sharp). A default per kind lives in `paper.ts` beside the paper
presets, since springback is a property of the paper: flat folds 0.96, reverse
folds 0.98, shaping folds 1 (their angle is already the one the folder chose).

### 2. `shared/fold/mesh.ts` — the folded state as one welded mesh

- Vertices are welded by **paper coordinate**: adjacent pieces share an edge in
  paper space, so a point of the sheet is one vertex however many pieces meet
  there. A vertex lying on another piece's edge (a T-junction left by a fold
  that split only some layers) splits that edge first.
- Each piece is triangulated and subdivided to a maximum edge length (≈ 1/40 of
  the sheet), so facets can curve.
- Initial positions come from `snapshot`'s world coordinates, layer lift
  included, so stacked layers start apart by the paper's thickness.
- Every edge is classed: sheet boundary, crease (with its step, its M/V
  assignment from `creasePattern`'s rule, and its current dihedral angle), or
  facet.

### 3. `shared/fold/relax.ts` — the solver

- Explicit damped dynamics (as _Origami Simulator_), on the CPU over
  `Float64Array`s, deterministic: axial bars at their paper lengths (stiff),
  crease hinges toward `hold × current angle`, facet hinges toward flat (soft —
  this ratio is what makes paper bend rather than crease).
- **Contact**: a vertex–triangle repulsion within the paper's thickness between
  parts not joined in the mesh, found through a spatial hash. Opening the body
  widens the pocket the neck's inside reverse fold sits in, so without contact
  layers would pass through each other at the joint.
- Stops when kinetic energy falls below a threshold, or fails loudly after an
  iteration cap — a model that does not settle is an error, not a picture.
- Returns vertex positions; `snapshot` gains the relaxed mesh beside the rigid
  pieces (`Snapshot.mesh`), and the physics report (which measures the flat
  folding and is unchanged) gains one line: iterations to settle, the worst bar
  strain, and any interpenetration left — the latter an error that fails the
  run.

### 4. The renderer draws the mesh

`render-page.ts` draws `Snapshot.mesh` instead of per-piece fans: normals
smoothed across facet hinges and split along creases, so bends shade softly and
creases stay crisp; outlines along creases and the sheet's edge only, not along
every cut the engine made. Materials and the fibre texture stay. `pnpm origami`
relaxes every snapshot it renders, `--seq` included; `--rigid` draws the pressed
state as today, for debugging the fold engine itself.

### 5. The basilisk takes the new paper

- The fold in half gets `hold: 0.8` — the halves open about 35°, a body lightly
  let go of.
- The narrowing folds keep the default, so their flaps lift slightly off the
  body, as kami does.
- Neck, head and tail folds unchanged; the silhouette stays the one #251
  designed.
- Tuned by rendering, against photos of hand-folded strip serpents; the final
  values are what the views sheet shows best, recorded in the design with a line
  on why.

### Tests (`node:test`, beside each module)

- `mesh`: a square folded in half welds to one vertex per paper point, with
  exactly one crease line, assignment V; a T-junction splits.
- `relax`: one valley fold with `hold: 0.5` settles to a 90° dihedral ±1°; bar
  lengths stay within 0.5% of paper; the same input gives byte-identical output.
- `basilisk`: relaxes without interpenetration, and its body's cross-section at
  mid-length is open (the halves' spacing at the top edge above a threshold).

### Verification

`pnpm origami basilisk` views sheet before and after, posted on the PR;
`./scripts/vet.sh` green.

## Out of scope

- The step-by-step player (#252) — it reads `Snapshot.mesh` when it lands;
  whether it relaxes in the browser or reads precomputed meshes is its call.
- New anatomy (a crest, an open jaw): a design change of its own, see
  question 3.
- Gravity and resting on the ground: paper this light barely sags; the renderer
  already sets the model on the floor.

## DRY notes

- **Reused**: `geometry.ts` and `space.ts` vector and matrix helpers; `hinges`
  and `adjacency` from `state.ts` for crease segments; `creasePattern`'s M/V
  rule — extracted from its loop into an exported `assign(a, b)` so `mesh.ts`
  and `creasePattern` share one rule rather than two copies; `snapshot`'s layer
  lift for initial positions; the renderer's materials and texture.
- **New and not shared**: the mesh and the solver. No library fits — three.js
  has no physics, and rigid-body engines (`cannon-es`, `ammo.js`) simulate
  solids, not hinged sheets; _Origami Simulator_ is the model being ported, not
  code to import (it is a GPU shader app).
- `hold` defaults sit in `paper.ts` rather than in each design, since they
  describe paper, not a model; a design overrides per step.

## Size

One PR, taken whole: four new or changed modules in `shared/fold`, the renderer
and the design, each well under 450 lines.
