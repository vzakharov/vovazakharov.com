# Handle bite 10 — groups

Three Opus agents over one tree, split so no two edit the same module:

- **tufts** — T108 (blocking: tufts go stale after `+` and bee plantings), T113 (tuft size, look, density, reach, picker marks its tuft), T117 (`plant` holds the cap, plan claims, pickers shut on `release`/`startle`/mute, a tuft tap with a picker open opens that tuft). Owns `tufts.ts`, the grass/tuft code in `meadow-scene.ts`, `model/game.ts`, their tests.
- **instrument** — T109 (a finger Phaser's pointer1 holds is never a chord finger), T110 (`chordTap` blooms and sounds, nothing else), T111 (drums audible on a phone speaker), T112 (hiss band edge ≤ 8 kHz, drum loudness vs a note), T116 (`PENDING_VOICES` pinned). Owns `chord-fingers.ts`, `flower-bed.ts`'s `chordTap`, `instrument-voices.ts`, `sound.ts`, their tests.
- **layout** — T114 (turn test: opening clump, worst decile, the child's flowers never leave sight), T115 (patch sweep seeds, share under 44 px bounded), T118 (the picker state that puts shapes 2.3 px apart on 280×600; shape row set apart; tabL flowers bunching), T119 (split `scripts/play-mushrooms.ts`). Owns `flower-plots.test.ts`, `mushroom-patch.test.ts`, `layout.test.ts`, `picker-rows.ts`, `scripts/play-mushrooms.ts`.

Where a fix needs a file another group owns, the agent says so in its report instead of editing it.
