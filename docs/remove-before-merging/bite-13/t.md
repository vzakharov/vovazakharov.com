# Package T — `pnpm type-overlap` clean

Done, in one commit (see `git log -- docs/remove-before-merging/bite-13/t.md`). Nothing left.

- `area: TapArea` (`DrawnMushroom` / `MushroomTarget`): the same thing, a mushroom's tap area
  in its own frame. Extracted `WithTapArea` in `mushroom-tap.ts` (which `hit-areas.ts`
  already imports); both intersect it.
- `Slot` in `rain-drops.ts`: three different things that only shared a name and type, so
  renamed, not based:
  - `at` → `droppedAt`: when the drop started falling. `KeySown.at` is a sowing moment; and
    `startedAt` was out, since `Rain.startedAt` (ms, game clock) would have made a new overlap.
  - `landed` → `splashedAt`: a time, where `Turns.landed` is an angle.
  - `size` → `nearness`: a dimensionless perspective factor (`FAR_SIZE`..1), where
    `Scaled.size` is a size in px.
- No behaviour change. Checks: gate clean, `pnpm typecheck`, eslint, prettier,
  `mushroom-tap.test.ts` and `mushroom-patch.test.ts` pass; no test reaches `rain-drops.ts`.
