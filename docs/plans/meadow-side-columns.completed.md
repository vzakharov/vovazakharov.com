# The meadow's buttons in two columns down the sides

## The task, as Vova asked it

> а что если кнопки насекомых всегда располагать на той же высоте (но с другой стороны) что и кнопки грибов? Их как раз тоже три, так что будет симметрия. И тогда будет разделение строго-игровые кнопки vs кнопки представления (карта/шаги), ну и дополнительным кнопкам грибов/ноток будет куда располагаться на любых высотах

> [on a phone held sideways, 643×426] Я бы сделал, чтобы кнопки и насекомых, и грибов располагались как и предлагаю по сторонам, в столбик, при этом возможно стали чуть меньше, и располагались уже не над горизонтом, а прямо начиная с низа экрана. Критерий, когда располагать "не над горизонтом" -- если иначе над ними не остаётся места для размещения "кнопок вида". Не сажать туда цветы-грибы ок -- в такой ориентации горизонтального места и так достаточно […] эти правила ("не ставь туда, ставь сюда") писались […] когда у нас вообще не предполагалось ни поворотов, ни движения -- то есть их критичность со временем значительно упала. Но пока не мешают, можно оставить.

Planless, on PR #103's branch (the session's working branch). #103's own fix (the gait button beside the insects' line) is mostly superseded by this; the PR gets retitled and its body refreshed at `/pr`.

## Decisions taken

- **Both columns share one height**: butterfly/fly/bee down the left at the `+`/`−`/house centres. The insects stay at `TAP_RADIUS`; `+`, `−`, house at `GROW_R`.
- **Placement order** (`placeColumns` in `sky-layout.ts`): in the sky at `PLUS_HEIGHT`, lowered under the rows while the last button's centre stays above `groundTop` (the old code's tolerance); else at the screen's foot; each tried at `COLUMN_SIZES` roomy (`GROW_R`, `GROW_GAP`) then tight (`TAP_RADIUS`, `GROW_GAP / 2`) — "чуть меньше". Last resort (only 600×280 among the swept screens): the insects' column beside the map button instead of under it, the rows refit between the columns via `rowsFrom`, yielders yield where met.
- **The gait button's first spot is reserved in `placeControls`** (`gait` = right of the map button, not the map button), so the rows, the sun and the cross keep off it; `gaitSpot` excludes that placeholder from its obstacles.
- **Rows go to the top band past the gait spot** (`besideView`): a top row that meets the gait spot moves; a dropped row moves up only where it is as large there (keeps portrait phones' dropped rows; lifts the 5-row on 643×426).
- **Pickers are completed before the columns** (`completed` with standing `[map, gait]`), so the columns keep off a stacked rest.
- `COLUMN_REACH` → `PICK_REACH`: it now bounds only the pickers' rest and the cross; the left column is no longer held above 0.7 of the sky (Vova: rules may go where they get in the way).
- `inTopRow` extracted from `rowsFrom` in `picker-rows.ts` and exported.
- Result: no swept screen yields any more (`layout.test.ts` now asserts `yielding` empty); `gait-spot.test.ts` dropped 320×360 from `CROWDED_SKIES`, whose sky now has a free spot.

## Done

- `sky-layout.ts`, `picker-rows.ts`, `gait-spot.ts` as above; `pnpm tsc` clean; the controls' sweeps in `layout.test.ts` and `gait-spot.test.ts` pass.

## Left

Done since the relay: the sun keeps off the cross's spot where the sky has room (`placeSun`'s `spared`), which fixed "the sun on every screen size" (300×700) and "the meadow's light" (the small phone's sun is back in the middle); `besideLines` lost its dead spot; `sunAt`'s docstring still reads true; previews of the phones taken.

1. **Waiting on Вова: what stands under a column on the meadow.** Three sweeps fail, each a column standing at the screen's foot over something the world places regardless of the screen: "the seeded flowers" (heads under `house`/`minus` on every visit on 844×390 and 568×320, two thirds on 320×568), "a meadow grown toward six" (the fly over the opening clump on 320×568) and "a grown forest's taps" (568×320, a column over a mushroom grown on the other orientation). The bed and the clump are world-fixed so a turn moves nothing; hiding a seeded flower per screen would make it, and every bee flower ringed round it, blink on a turn. Recommended: let a ground column stand over the meadow as a pan already brings things under it, and hold those sweeps to the controls in the sky.
2. Then the whole of `layout.test.ts` (the mushroom-count sweeps per screen are slow; run it alone).
3. `/go` Step 3 (`/polish`) and Step 4 (`/pr`: retitle #103 to what the branch now ships, refresh its body and QA checklist).

`tmp/gap.ts` (gitignored, may be gone) printed every screen's columns, gait, sun and first picker; rebuild it from `meadowLayout(w, h, 1)` if useful.
