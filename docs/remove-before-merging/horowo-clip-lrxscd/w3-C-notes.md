# Package C — the chorus (wave 3): notes for whoever carries it on

Branch `claude/horowo-clip-w3-c-lrxscd`. The brief is `wave-3.md` § C.

## Built

- **`src/clip/pages/horowo-clip/ui/shots-chorus.ts`** is the chorus shot list (43.572–60.749):
  - `lyricBreak` runs from the start of the chorus to `BURST`, the kick nearest «счастья» (≈44.83).
  - `meadowBurst` holds for three half-time pulses.
  - After that, the rotation cuts on every pulse following `ROTATION`: M is the meadow, W the ward wall, A the aerobics show, I the next entry of `STORYLINES`. `STORYLINES` is the pool the lead appends to (rocket ears, spoon bunny).
  - The ward's four W runs gouge «ХОРОШО» a quarter further each, and the last one finishes it.
- **`@/clip/widgets/meadow-party`** holds the meadow (`meadowParty`, `meadowBurst`, `FRAMINGS`) and the lettering in `ui/lyric-break.ts`:
  - **`lyricBreak`** (a full shot): black, with «НЕ» / «НЕ СДОХНУТЬ» / «НЕ СДОХНУТЬ БЫ» stacked, each word landing on its onset in words.ts. «от» is never shown. The words are written in an unsteady hand that goes over each letter again out of register (`scrawl`), because the operator asked for «комично-ужасный», not just comic. The three lines make a plus, so on «бы» the hospital's solid red cross (the one on its roof in the ending) lights behind them, catching like a tube sign (on, off, on, dip, on over 0.15 s), and the words turn to ink on it, holding to the meadow cut. Every word is set at 0.6 width (`CONDENSED`), so the cross is square, its arms as thick for their length as the hospital's (operator: «"сдохнуть" можно более узким шрифтом, чтобы крест получился квадратным»). The operator first suggested «похожа форма на аптечный крест, давай обыграем», then pointed at the hospital's cross.
  - **`echoLines`** (letters only, no ground): «хорошо-шо-шо» stacked in the same hand. The lines are «ХОРОШО», then «ХОРО»+«ШО» with ШО larger, then «ХОРО»+«ШО» larger still. The lettering has no lower case, so the case contrast is drawn as size. The lines appear at words.ts's 42.56 / 43.04 / 43.32, each shadowed in ink to read over a picture.
- **`@/clip/widgets/channels`**: `aerobics(nearness)` is the morning-exercise show (`ui/aerobics.ts`). Its backing line freezes and stares from nearness 0.55–0.68. The chorus plays it at nearness 0.5→0.75.
- Palette entries: `PARTY_PALETTE.lyric` and `.cross`; `CHANNELS_PALETTE.aerobics.band` and `.count`.

## How the lead wires `echoLines`

`echoLines` is a pure `Drawing` that reads only `pen.playhead`. Lay it over the verse's last picture from **42.56 to the end of the verse (43.572)**: inside that span it draws whatever has been sung so far. Silence the sung-line overlay there. Import it from `@/clip/widgets/meadow-party`.

## Next

- The rocket-ears and spoon-bunny storylines join `STORYLINES` when their packages land.
- Stills: `docs/remove-before-merging/frames/w3-C-*.jpg`.
- knip's `POSTROLL` finding (score/song.ts) isn't from this package.
