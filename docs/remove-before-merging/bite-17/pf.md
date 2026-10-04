# Bite 17 — package `pf`: the fireflies' dusk cost

**Done.** `perf.md` step 2 item 1, in `firefly-view.ts` only: every halo in one
`ADD` container per firefly, made before every body container (`NORMAL`), the
blend mode set on the containers so the dozen of each share one batch, and the
three shapes baked into canvas textures in `paint`. Numbers and the look check
are in `perf.md` item 1.

Nothing left in this package. Decided: textures at `camera zoom × 2` texels a
CSS pixel (`OVERSAMPLE`), so a near or flaring firefly stays crisp.
