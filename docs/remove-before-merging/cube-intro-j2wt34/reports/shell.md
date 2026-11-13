# Shell — state of the package

Branch `claude/cube-intro-shell`. Newest first.

## 2026-11-13 12:25Z

### Half-done: the bands' finish (first in line)

The grey bands read as construction grey because the new sky lights them about
five times brighter than at 315051b5; `GREY` in
`src/cube/pages/cube/lib/shell-material.ts` never changed.

**The file as committed is a throwaway and fails `pnpm typecheck` on purpose.**
`GREY` is a table of three variants picked by the `NEXT_PUBLIC_BANDS`
environment variable (`a`, `b`, `c`; `b` when unset):

- `a` — today's finish darkened to the old depth (albedo and mirror × 0.23);
- `b` — deep graphite satin: albedo a fifth of today's, mirror 0.11 at blur 3.2
  (a soft sky sheen), no sun flecks;
- `c` — today's, for reference.

To finish: look at the frames, tune `b`, replace the table with the one chosen
`GREY` (delete the `BANDS` line, the `fleck` switch and, if `b` wins, the whole
"Flecks in the grey" block), run the gates, commit, and send the three-up sheet
to the board session with eye, clock (`PLAY_INSTANT`, the shoot's default) and
commit. The operator picks.

Shoot, one variant at a time, never editing sources while it runs:

```
NEXT_PUBLIC_BANDS=b pnpm -s outside:cube --eyes ladder-foot --out "$PWD/tmp/shell/bands/b"
NEXT_PUBLIC_BANDS=b pnpm -s outside:cube --at -15.203,2.0962,15.203 --yaw -45 --pitch 4 --name approved --out "$PWD/tmp/shell/bands/b"
```

References: `frames/lead/1113-0930-ladder-foot.webp` (315051b5, dark and brown)
against `frames/lead/1113-1200-ladder-foot.webp` (49186bc5, flat grey).

### Half-done: what stands in floor 1's beam throws a shadow

Built and pushed at 726d4863: `slabShade` and `Sunlit.boxes` in
`src/cube/entities/theme/kit/lib/sun.ts`, `crossesBeam` in
`src/cube/shared/outside/beam.ts`, `RECEPTION_BEAM_BOXES` (the bench) in
`entities/theme/workplace/config/01-reception.ts`, pinned by
`src/cube/pages/cube/lib/reception-beam-boxes.test.ts`.

Owed:

1. **The bench shades itself.** A point inside a box is shaded by that box, so
   the seat goes dark and the wall shows one solid block (`tmp/shell/boxes/after`
   against `before`, local only). Fix in `slabShade`: a point that starts
   inside the slab (`max3(near) <= 0`) is not shaded by it.
2. Move the pin test from `standingBoxes` to pill's
   `sunBlockers(setting, decor, most): Box[]` (`@/cube/features/decor`, shell
   frame already, plants left out, beam-filtered, largest first) and tell the
   lead.
3. Reshoot `in-beam`, `entering`, `door-shelf`, `shelf-door`
   (`pnpm -s outside:cube --eyes in-beam,entering --out …`, two eyes a run),
   commit before/after `.webp` to `frames/shell/` with a README line each.

### Owed after those

- The indoor frames in `frames/shell/` (`room-doorway`, `shelf-door`,
  `door-shelf`, `in-beam`, `doorway-down`) predate the quarter turn of the room
  and want reshooting.
- A full gate run on the merged tree: `pnpm typecheck`, `pnpm shaders:cube`,
  `pnpm lint:files <dirs>`, `pnpm test <files>`, `pnpm type-overlap`,
  `pnpm check:masd`, `pnpm masd:clusters`, `pnpm check:cycles`,
  `pnpm exec prettier --check`.

### Done and merged by the lead (through 726d4863)

- The player's body throws no shadow anywhere; `bodyShadow` and its tests are
  deleted (operator's ruling — it does not come back).
- No pink or brown on the shell: the oil film is a faint cool sheen, and
  mirrored sand is cooled in the black as in the grey (`graze.webp`, approved).
- Plastic has a highlight: it mirrors the ceiling panels and, on floor 1, the
  doorway's sky (`plastic-*-before-after.webp`).
- `RECEPTION_SHRUBS` holds after the room's quarter turn.
