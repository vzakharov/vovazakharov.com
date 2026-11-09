# b3-b7f — call 18 grown: speed, height over sea, the share-link button

Base 9d194a3d (`island/round-world`), branch `wt/b3-b7f`. Contract text from
`island/stretch-2` 91658403. Built and checked; not looked at in a browser (the
frame was skipped at the context budget).

## Done

- **Speed** — `lib/pace.ts` (was `frame-time.ts`): `paced(last, {ms, metres,
  seconds})` smooths the frame time and the speed with the same exponential
  over 500 ms, each frame weighted by its length. The speed is the straight-line
  displacement of the eye's point in space (`pointOf(eye)`, `R + floor +
  height` along `eye.at`) over the seconds the eye stepped (the frame time,
  capped at 0.1 s), in **m/s**; shown `12.5 m/s (45 km/h)`, from 1 km/s up
  `7654.3 km/s`. `scene.frame(dt)` returns the metres moved; `scene.pace()`
  replaces `frameMs()`. A `placeAt` jump is between frames, so never counted.
- **Height over sea** — `seaHeightOf(eye) = floor + height` (eye feature, beside
  `pointOf`, which `poseOf` now uses); the panel's height row reads
  `height 1234.6 m over ground, 1534.0 m over sea`. `Where` = `Placed & …`,
  `placeOfEye` in `lib/eye-pose.ts` builds `Placed`.
- **The button** — `ui/diagnostics-panel.tsx`: "Copy a link to this view"
  copies `shareLink(page, place)` (`lib/where-line.ts`, the same builder the
  panel's first row uses) and writes the hash with `replaceState`. Copied: the
  label reads "Link copied" for 1.8 s. Refused: the label says so and the link
  plus the clipboard's error stay up, selectable, until the next press.
- **Retired** — `ui/where.ts` (`P`, `island.where()`), `whereLine`, the play
  hook's `where` (no caller), the `.where` output and its styles, the `P` hint
  row and `where.*` copy.

## Checks

tsc (vova), eslint, prettier, stylelint on the touched files; 129 tests (island
page lib/ui/config, eye model); check:masd, check:cycles, masd:clusters,
type-overlap, check:poison, knip — green. line-limit red only on
`docs/remove-before-merging/island/round-world/memo.md` (407 lines, not this
branch's). `island-scene.ts` at 399 lines.

## Left

- The browser look: `I`, the rows updating, the speed at rest 0.0 and while
  flying; the button's copied and refused states (a refusal shows on an
  insecure origin).
- `src/island-board/app/config/island/bite3.yaml` still mentions
  `island.where()` in historical text; the board is not this branch's.
