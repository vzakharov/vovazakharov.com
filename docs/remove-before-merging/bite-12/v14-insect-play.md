# v14-insect-play — playing v14-insect-depth and v14-fly

At 8848128 (the branch's HEAD as this ran), tabL only: `meadow` (with the build), then
`--no-build` `veer`. phoneP not run: the orchestrator relayed before it.
There is no `insects` play; `meadow` (which runs the buzzers) and `veer` are the ones that fly
insects. To judge the shadows and the sink I put a temporary dump in the
harness's `shoot` (each insect's shadow, container and drawn `h`) and a
hook in `step` that shot a frame whenever a visible insect had container
alpha < 1 (past the brow). Both were reverted, not committed. No `src/` edits.

## Verdicts

- **Sink behind the brow — works.** `tabL-butterfly-half-behind-brow.png`:
  a butterfly coming in from away rises over the brow with its lower half
  under the brow's ground and grass blades drawn over it, as a flower goes.
  Seven frames caught one sinking (meadow 5, veer 6), never one simply
  vanishing. `tabL-butterfly-pale-past-brow.png`: one leaving past the brow,
  paled by alpha (0.89 → 0.80); the wings read faintly washed, which is
  acceptable. No existing play stops on an insect past the brow, so none
  of the play's own frames show the sink (container alpha 1 in all 70).
- **Round shadows — right in shape, wrong for 29% of fliers.** Where the
  insect flies above the ground the shadow reads well: soft, flat, fainter
  and smaller far off, under the insect (`tabL-shadows-near-far.png`, the
  butterfly by the pink cap). But **insects fly below the ground**: the
  drawn aloft's `h` goes negative mid-leg (down to −1.76 clump sizes). The cause
  is that a leg is mixed in the frame's screen space, and `aloftFramed` gives a
  negative height back. Before the shadows nothing showed it; now the shadow
  lies _above_ its insect (butterfly-5 36 CSS px, bee-12 45 px), or, where
  the insect has dropped off the screen's bottom (butterfly-4, body at y
  874 of 820, `cv` false), alone on the grass with no insect over it
  (`tabL-shadow-under-butterfly-and-orphan.png`, the left ellipse;
  `tabL-shadows-over-underground-insects.png`). Meadow: 15 of 52 visible
  shadows over an insect with `h < 0`; veer: 1 of 20. Not fixed: the cause
  is the flight model (off limits). The options are to keep `h ≥ 0` in the
  flight, or to fade a shadow out as `h` nears 0 in `insect-shadow.ts`.
  The fade hides the symptom and leaves insects flying underground. The
  orchestrator decides.
- **Fly never hangs still — not seen.** No frame caught a fly hovering in
  the air: veer says "no insect ever hovered in the air"; its two `away→air`
  fly legs were watched only up to arrival. No mid-hop frame.
- **Softer dash — in line with the note.** veer: fly dash 34.6 px a frame
  (bound 38.1), 140 one-frame steps over it, most 83.7 at its own size
  (fly-22 cap→away), the known dash-bound class; bee 73 over 25.8, most 30.0.

## The earlier reds (play-final2, tabL meadow)

- butterfly-3 turned **180.91 rad/s** in one frame at 58 767 ms (bound
  10.81) — unchanged, the same ~3 rad flip.
- bee-11 sat **1.69 rad** off facing up at 69 683 ms — unchanged.
- Facing off its flight: butterfly-5's 2.84 rad is gone; the worst now is
  butterfly-1, 0.56 rad off at 25 683 ms; 81 of 4184 butterfly flight
  frames face over 0.3 off (fly 0/432, bee 0/598).
- Still: no butterfly ever rested on a cap; least spans butterfly 38.2 px
  (52), fly 27.3 (30).

## Other reds

- veer's frame budget: **27.5 ms** median over 533 (26), at load 4.6 with
  other worktrees building. play-final2's tabL B was 19.1. The cause is
  unsettled: the shadows add one `Graphics` per insect, or the load does it.
  Re-run when the machine is idle to tell them apart.

## Left

- phoneP (`--no-build --screens phoneP --plays meadow,veer`).
- A fly mid-hop: no play holds a fly in the air past its arrival.
