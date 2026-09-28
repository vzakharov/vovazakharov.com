# Bite 7's look, named against its references

What "рисованное с душой" means for the meadow, as changes two agents can make
in parallel. Written against bite 6's frames
(`docs/remove-before-merging/frames/bite-6/`), Syama's drawing
(`src/pages/mushrooms/reference/syama-drawing.webp`) and the references below.

## The references, and what they do that the meadow does not

Fetched into `tmp/refs/` (gitignored, never committed): four Steam stills each
of Gris, Ori and the Blind Forest and Ori and the Will of the Wisps, and
Wikipedia's Alto's Adventure animation (plus a Hollow Knight still, not used). Alto's Odyssey is not
on Steam; Adventure is the same studio and the same look.

- **Alto's Adventure** — flat fills, no ink, and it still reads as deep: five or
  six mountain ranges, each mixed further toward one fog colour, and fog lying
  at the _foot_ of every range rather than on top, so each silhouette pales at
  its base. A big soft sun bloom tints the whole sky around it. Visible grain.
  **The lesson: flat fills are fine; what the meadow lacks is air between them.**
- **Gris** — a few analogous hues per scene, watercolour blotches and paper
  grain everywhere, diagonal light shafts, and a huge pale sun ringed by thin
  concentric circles (the meadow's mandala language, done by a master). Form is
  carried by value, not by lines.
- **Ori** — warm light against cool shadow in every frame (orange on teal), rim
  light on every edge facing the light, glow round every light source, blurred
  dark foreground framing. Too dark for a six-year-old as a whole; its
  _temperature split_ and _rim light_ are what to take.
- **Syama's drawing** — blue ballpoint. The child's own line is a cool,
  uneven, hand-pressed stroke, thicker where the pen pressed.

What the meadow does (frames `tabL-bees-drink-on-the-rims.png`,
`phoneP-bees-drink-on-the-rims.png`): a saturated azure sky; two green hill
ranges that differ only a little in lightness, each with a hard-edged shade band
across its lower 55%; a ground of one green; every creature outlined in the same
brown-black `ink` at one width; shade laid on as one `shadeInk` at 20% alpha,
always on the right, whichever side the sun is on (on a tablet the sun is top
right and the caps' shine is top left — the light contradicts itself). Nothing
is warmer or cooler than anything else, so nothing is lit.

## The five with the biggest payoff

1. Sky warm at the horizon, with a sun bloom that washes over the hills (A1, A2).
2. Aerial perspective: a third range, each range mixed toward the air, mist at
   every range's foot (A3, A4).
3. Ink that takes the colour of what it outlines, heavier on the shade side and
   lighter on the lit side, inner lines thinner (B1, B2).
4. One light, from where the sun actually is: shade, shine, rim light and cast
   shadows all agree with it, warm lights and cool shadows (B3, B4, B6).
5. A ground with depth — lit and yellower far, cooler and deeper near, mottled —
   and grass toned by distance, under a soft grain (A5, A6, A7).

## Step 0 — before the split (one agent, small)

Both groups need three things neither should own. Land these first, in one
commit, then fork:

- **Split `palette.ts` into three modules**, `PALETTE` re-exported unchanged so
  no import site moves:
  - `palette.ts` — the shared section and the merge
    (`export const PALETTE = { ...SHARED, ...BACKDROP, ...CREATURES } as const`).
    Keeps `ink`, `shadeInk`, `highlight`, `skyHorizon`, and gains `air` and
    `inkCool` (below).
  - `palette-backdrop.ts` — group A's: `sky*`, `sun*`, `cloud*`, `farHill*`,
    `nearHill*`, `ground*` except `groundShadow`, `tuft*`, and every entry A adds.
  - `palette-creatures.ts` — group B's: everything else, `groundShadow`
    included (only creatures cast it).

  **Rule edits, same commit:** `.claude/rules/styling.md` line 61, "The one
  exception is `src/pages/mushrooms/ui/scene/palette.ts`, the game's colour
  table" becomes "the `palette*.ts` modules in `src/pages/mushrooms/ui/scene/`,
  the game's colour table"; the plan's decision bullet "`palette.ts` is the one
  file on the site holding colour literals" names the same set; the docstring
  moves to `palette.ts` and says the other two are its sections. The alternative
  — one file, two agents editing different regions — works with care but makes
  every parallel edit a merge hazard; three files cost one sentence of rule.

- **Two shared entries.** `air: 0xd6_ea_e4` — the colour distance takes things
  toward at ground level, a pale green-blue mist, replacing `skyHorizon` as the
  haze target in `draw-mushroom.ts` and `house-view.ts` (B makes that switch).
  `inkCool: 0x26_2a_5c` — a deep indigo: the complement of the warm sun, and the
  blue of Syama's pen.
- **`light.ts`**, pure: `sunLight(layout) → { toward: Point }`, the unit vector
  from the meadow's middle toward the sun (`layout.sun`), and
  `PICTOGRAM_LIGHT`, fixed to the upper left, for the HUD. A `light.test.ts`
  holds that `toward` points right on the tablet layout and left on phone
  portrait (where `placeSun` puts it). A reads it for the sun-side lit crests,
  B for everything that is lit.

## Group A — backdrop

Files: `paint-backdrop.ts` (and whatever it splits into), `skyline.ts`,
`grass.ts`, `sun-layout.ts` if a reach constant moves, a new `grain.ts`,
`palette-backdrop.ts`. Nothing else. `paint-backdrop.ts` is 201 lines and this
list roughly doubles it: split it along the layers — `paint-sky.ts` (sky, sun,
bloom, clouds) and `paint-land.ts` (ranges, mist, ground) — with
`paintBackdrop` keeping the `existing`-reuse contract.

**A1. Sky: a warm horizon under a softer blue.**
(a) Every reference's sky pales toward a warm colour near the light; the
meadow's pales toward a cold near-white. (b) `skyTop` 0x5ab8ee → 0x6c_b4_e6 (a
touch less saturated); `skyHorizon` 0xd4f1ff → 0xfc_ee_d2 (warm cream). Keep
`fillBands` (see "Phaser" below), raise `SKY_BANDS` 48 → 96 so a 1640 px
buffer shows no step, ease 1.6 kept. Add a second, sideways term: each band
mixed up to 25% toward `sunGlow` by `1 − |x − sun.x| / width` — which means
painting the sky in vertical strips as well as bands; cheaper: over the banded
sky, 6 huge discs round the sun (radius 3–9 sun radii) of `skyWarm: 0xff_e8_b8`
at alpha 0.04 each. (c) Pure: the sky's horizon colour is warmer (R − B > 0)
and its top cooler (B − R > 60); HSV value of `skyTop` ≥ 0.85 (not dusk).
Frame: the sky next to the sun is visibly warmer than the sky on the far side.
(d) Baked with the rest of the backdrop once per resize (see "Phaser" below):
a frame pays one textured quad for the sky, halo and sun. Painted live, the
halo's discs alone blended ~12 screens of pixels a frame. Risk: too cream reads
as haze or evening; hold `skyTop` blue and keep the cream to the bottom fifth.

**A2. Sun bloom and a light wash over the land.**
(a) Alto and Gris: the sun's light lands on everything under it; the meadow's
sun glow stops at its own rays. (b) In `paintSun`, `SUN_GLOW_REACH`'s rings
extended by a second set out to ~6 sun radii at alpha 0.025. Then a new
`light` layer painted _after the ground_: 10 discs round the sun, radius 4→14
sun radii, `sunGlow` at alpha 0.03 each, blend mode `SCREEN` — the near hills
and the back of the meadow on the sun's side come out warmer. Optional, only if
the frames want it: 3 light shafts, long thin triangles from the sun downward
across the hills at alpha 0.05 (`fillTriangle`), as in Gris. (c) Frame: the
hill crest under the sun is warmer and lighter than the same range at the far
edge. Pure: the wash never reaches below the ground's upper third
(radius × position bound), so it never lifts the ground where caps stand.
(d) Baked into a texture of its own once per resize and screened as one quad
over the sky, the clouds and the hills. `SCREEN` is a WebGL blend and Phaser's
Canvas renderer maps it too.
Risk: a wash reaching the mushrooms lowers their contrast — bound it as in (c).

**A3. Aerial perspective across three ranges.**
(a) Alto stacks ranges each nearer the fog colour; the meadow's two ranges
differ by ~10% lightness and share one saturation. (b) Add a farthest range
drawn before `farSkyline`: a third `hillLine` whose base sits a little above the
far range's, amplitude ~0.6× — it must pass the same sun parting as the far
range (`skyline.ts`' `PARTED_DEPTH`, which `sun-layout.test.ts` checks), so
build it through the same parting function. Colours, each derived with `mix`,
not new literals where a mix will do:

- farthest: `mix(farHill, air, 0.75)`, a blue-lilac green;
- far (`farHill` 0xa6d8a0 → 0x9f_cc_a6, cooler): lit at 55% toward `air`;
- near (`nearHill` 0x78c45e → 0x80_c2_62): 20% toward `air`;
- ground: 0% at the bottom edge, 12% at the seam.

(c) Pure test over the palette: contrast against `skyHorizon` strictly
increases farthest → far → near → ground front, and saturation strictly
increases the same way. (d) One more polygon, baked per resize. Risk: the parted-sun rule
— a new range that ignores the parting would cover the sun on phone portrait.

**A4. Mist at every range's foot, not a hard shade band.**
(a) Alto's ranges pale at their base, where the fog lies; the meadow's darken
there in one flat band (`HILL_SHADE_FROM = 0.55`), the single most
"Peppa" thing in the frame. (b) Replace `fillHills`' flat shade with a
vertical gradient inside the silhouette: a pure `hillBands(line, floor, bands)`
returning, per band `[y0, y1]`, the polygon of the range clipped to that band
(the skyline clamped to `y0`, closed along `y1`) — a skyline is a height field,
so the clip is a map, no polygon clipping library. 16 bands, colour from the
range's lit colour at the crest to `mix(lit, air, +0.25)` at the foot. Then, on
the sun's side of each crest (slope facing `sunLight().toward`), a thin lit band
2–4 px under the ridge in `mix(lit, sunGlow, 0.35)` — the range's form, as Ori's
rim light gives. `farHillShade`/`nearHillShade` retire, or remain as the foot
colours. (c) Pure: `hillBands` covers the range exactly (areas sum to the
polygon's; no band extends above the skyline); the foot band's colour is
lighter than the crest's. Frame: no horizontal edge crosses a hill. (d) 16
polygons per range instead of 2, baked: they cost the resize, not the frame. Risk: the ground's seam — the
ground must open on the near range's foot colour, as it now opens on
`nearHillShade`, or a line appears across the screen.

**A5. A ground with depth.**
(a) Every reference's floor recedes: lit and hazy far, rich and dark near. The
meadow's ground is one green, eased darker downward. (b) `paintGround`: from the
seam `groundLit: 0x9c_cc_62` (yellow-green, sunlit) through `ground`
(0x5cb046 → 0x58_a8_48) to `groundDeep` (0x46943a → 0x3a_7e_46, cooler) at the
bottom; `GROUND_BANDS` 12 → 32. Over it, seeded mottling: ~24 flattened ellipses
(aspect 0.18–0.25), each `mix(ground, groundLit, 0.3)` or
`mix(ground, groundDeep, 0.3)` at alpha 0.25, scaled by `depthScale(down)` so
back patches are small — they read as the meadow undulating. The bottom 8%
darkens a further 10% toward `groundDeep`, framing the frame without a
vignette. (c) Pure: the patches' generator is a function of `random` (same
source → same patches); no patch darker than `groundDeep`. Frame: the ground
under the flowers at `FLOWER_DOWN[1]` is darker than at `FLOWER_DOWN[0]`, and
yellow flowers still stand out (see risks). (d) Baked per resize. Risk: yellow petals and
the `lemon` butterfly against `groundLit` — which is why `groundLit` lives only
in the band behind the flowers' top row, and the outer ink stays dark (B1).

**A6. Grass toned by distance, blades lit at the tip.**
(a) In Ori and Alto a plant far off is the colour of the air it stands in;
every tuft here is the same two greens at every depth. (b) `paintTufts`: each
tuft's colours mixed toward the ground colour at its own `y` by `(1 −
nearness)` × 0.6, so back tufts nearly vanish into the ground and front ones
stand out; each blade split into two triangles — base `tuftDark`, tip
`mix(tuft, groundLit, 0.4)`. Store the two colours on the `Tuft` at growth, not
per frame. (c) Pure: `growTufts` gives a nearer tuft a colour of higher
contrast against the ground under it than a farther tuft. (d) Per frame: 92
tufts × 6 triangles instead of 3 — trivial, even under swiftshader. Risk: none
to taps; grass sits under every creature.

**A7. Soft seeded grain.**
(a) Gris and Alto have paper and grain on every surface; the meadow's fills are
mathematically clean, which is most of why they read as vector clip-art.
(b) New `grain.ts`: a pure `grainPixels(seed, side)` → `Uint8ClampedArray` of
RGBA noise (a 256² tile, each pixel dark or light, alpha 0–255 from a seeded
generator, lightly blurred 1 px so it reads as tooth, not static); the scene
builds it once with `scene.textures.createCanvas('grain', 256, 256)`, puts the
pixels in with `putImageData`, `refresh()`, and shows it as a `TileSprite`
covering the screen at alpha 0.07, tile scale = pixel ratio × 1.5 so a grain is
~1.5 CSS px on every screen. It sits in the backdrop's layers after the light
wash, so under the grass and every creature — creatures stay crisp (for
readability; Gris grains everything). A second, fainter pass over the sky alone
is optional. `Backdrop` gains `grain`, reused on repaint like the layers.
(c) Pure: same seed → same pixels; mean luminance of the tile ≈ 0.5 (grain
neither darkens nor lightens overall). (d) Eleven strips of one tiled texture
over the baked wash, so one overdraw of the ground a frame; the canvas texture
works in both renderers. Static, so no shimmer. Risk: at 0.07 on a phone it may be
invisible or look like dirt — tune by frames, bound 0.04–0.10.

**A8. Clouds lit from the sun.**
(a) Gris' and Alto's clouds take the sky's colour at their base; the meadow's
are white with a grey-blue underside. (b) `cloudShade` 0xd8eaf6 →
`0xe2_dc_f0` (lilac, the cool side); a third puff pass on the sun's side,
`cloudLit: 0xff_f6_e4`, offset 0.08 r toward the sun; the highest cloud mixed
20% toward `skyTop`. (c) Frame: each cloud's sun side is warmer than its far
side. (d) The backdrop's one live part: one graphics each, re-tessellated every frame
as they drift, three passes of five puffs a cloud. Everything else behind the
grass is baked.

## Group B — creatures and HUD

Files: `draw-mushroom.ts`, `draw-house.ts`, `draw-mouse.ts`, `draw-flower.ts`,
`draw-insect.ts`, `draw-bee.ts`, `draw-fly.ts`, `draw-buzz.ts`, `hud.ts`,
`button.ts`, `spores.ts`, `shapes.ts`, `colour.ts`, a new `ink.ts`, the views
and beds that call the painters (`mushroom-bed.ts`, `flower-bed.ts`,
`insect-view.ts`, `house-view.ts`), `meadow-scene.ts` (to hand the light to
them), `palette-creatures.ts`, and `model/mushroom-outline.ts` if `MUSHROOM_INK`
moves (the house's clearances in `model/house.ts` read it).

**B1. Ink takes the colour of what it outlines.**
(a) Syama's line is blue; where Ori's forms have an edge at all, it is the
dark of the thing itself; the meadow's are one brown-black everywhere. (b) `colour.ts`
gains `darken(colour, by)` (HSV value × (1 − by)). `ink.ts`:
`inkFor(fill) = mix(darken(fill, 0.6), PALETTE.inkCool, 0.35)`, then clamped so
its relative luminance ≤ 0.06. Every `lineStyle(…, PALETTE.ink)` in the
painters takes `inkFor` of the fill it edges: a cap's contour is a deep
crimson-indigo, a stem's a warm grey-violet, a petal's a deep version of the
petal, a butterfly's wing a deep version of the wing. Bee and fly bodies keep
near-black (their fills are dark already). Haze still applies on top
(`tone(inkFor(fill))`). `PALETTE.ink` remains for the selection band's edge,
the HUD disc and the mouse's whiskers. (c) Pure, in `ink.test.ts`: for every
fill in `palette-creatures.ts` (and every genes' hue nudge extreme), `inkFor`
has contrast ≥ 3:1 against `ground`, `groundLit` and its own fill. (d) One
colour per stroke: no cost. Risk: a pale fill (a white daisy, a white butterfly)
gives a pale ink — the luminance clamp is what keeps every silhouette dark.

**B2. Weighted, tapering line.**
(a) A hand line thickens where the pen presses and thins at the ends and toward
the light; Phaser's `strokePoints` is one width all round, which is the
vector-clip-art tell. (b) Two pure helpers in `ink.ts`:

- `weightedOutline(points, base, toward)` — a closed outline pushed outward
  along each vertex's normal by `base × (0.45 + 0.85 × max(0, −n·toward))`, so
  the edge facing the sun is ~0.45× and the edge in shade ~1.3×. Painted in the
  ink colour _before_ the part's fill (an underlay), which needs no polygon
  with a hole: the fill then covers the inner half. Painting order per part
  becomes underlay → fill → shading, which is what the ink drawn after the fill
  looks like today.
- `taperedLine(points, [from, to])` — an open ribbon from width `from` to `to`
  (1.0 → 0.35) for legs, antennae, whiskers, the proboscis and the flower stem's
  ink.

Inner lines — the two-tone cap's band line, the door's planks, the wing veins,
a bee's band edges — at 0.5× the outer width and ink mixed 40% back toward the
fill, so the silhouette reads first. The HUD pictograms call the same painters
with `PICTOGRAM_LIGHT`, so they take the new line too; **the HUD disc's own
ring is excluded**: an even circle is what says "button", and a child should
never read a control as a creature. (c) Pure: for a circle and light from the
right, the outline's width at the right-most vertex is < 0.5 base and at the
left-most > 1.2 base; `taperedLine`'s end widths equal the requested ones.
Frame: the caps' shade-side contour is visibly heavier. (d) Twice the vertices
per outline; insects repaint every frame (wing beats), so per-frame vertex count
roughly doubles for ~10 fliers — fine on a device, the one to watch under
swiftshader's play run. Keep `CURVE_STEPS` where it is. Risk: a thin sun-side
line on a small insect falls under 1 px — floor it at 1 device px.

**B3. One light, from where the sun is.**
(a) Every reference has one light and everything agrees with it; the meadow's
shade is always on the right and its shine on the left, so on the tablet the
caps are lit from the side the sun is not on. (b) `drawMushroom(…, light)` and
the other painters take `toward` from `sunLight(layout)` via the beds;
`shadeArc` mirrors when the sun is left; the shine ellipse moves to the sun side
at `(toward.x × 0.2 capWidth, 0.72 capHeight)`. (c) Pure: for a light from the
right, the shade crescent's centroid lies left of the cap's middle and the shine
right. Frame, both `phoneP` and `tabL`: shine on the sun's side. (d) Free.
Risk: a turn flips the sun's side, and the repaint-on-resize contract already
repaints every mushroom, so it follows.

**B4. Warm lights, cool shadows; rim light on the caps.**
(a) Ori's whole look is orange light on teal shade; the meadow shades by
darkening with a near-black at 20% alpha, which only dirties the red.
(b) `shadeInk` (0x2a1010) is replaced _for creatures_ by
`shadeCool: 0x3a_2c_6a` at alpha 0.26 (the cap, stem, spots, petals) — shadows
bluer, not blacker. A rim light: a crescent of `capLit: 0xff_7a_52` along the
dome's sun-facing edge, width 0.06 capHeight, alpha 0.6, then a finer
`rimLight: 0xff_f0_d0` at 0.4 just inside the contour; the same `rimLight` on
the stem's sun side and on petals facing the sun at alpha 0.3. The shine moves
from pure white to `rimLight` at 0.45. `capRed` 0xe6362b stays (the fly agaric
Syama drew); `capDark` 0x4a141a → 0x5a_18_2e (a touch cooler). Spots stay
`spot`, with the cool shade crescent. (c) Pure: `capLit` warmer than `capRed`
(hue closer to orange), `shadeCool` bluer than `shadeInk`; spots' lit side ≥ 0.9
luminance. Frame: the cap still reads as red with white spots at a glance —
compare with the drawing. (d) Two more crescents per cap; caps repaint on
squash/select, not every frame: free. Risk: rim light too wide turns a red cap
orange; the cap must stay a fly agaric, which the spots and the red body carry.

**B5. Harmonise the creature literals.**
(a) The references keep a few hue families per scene; the meadow's flowers and
butterflies are pure, sweet-shop saturations. (b) In `palette-creatures.ts`,
every `flowers.*` and `butterflies.*` entry lowered ~10% in saturation and
nudged 3–5° toward the sun's yellow (a warm cast over the lit scene), none
lowered in value: e.g. `flowers.pink` 0xff8fc0 → 0xf8_92_b6, `flowers.blue`
0x6cb4ff → 0x74_ae_f0, `butterflies.turquoise` 0x30c4d8 → 0x3e_bec8. `stem`
0xfbf3df and `gills` stay. `hud` 0xffffff → `0xff_fa_f0` (warm white, so the
buttons sit in the palette) with `selection` unchanged. `grow`/`shrink` badges
unchanged: they are signs, not scenery. (c) Pure: every hue still distinct from
its neighbours (the "butterflies are a meadow" rule — no two of the 14 closer
than today's minimum hue gap); every value ≥ today's − 0.03. (d) Literal edits.
Risk: the child's recognition of colours — keep the names true (a pink flower
stays pink).

**B6. Shadows that are cast.**
(a) The references' shadows have a direction and a soft edge; the meadow's are
a flat ellipse centred under each foot. (b) `drawMushroomShadow`, the flower's
and the house's: two ellipses, a soft outer one (1.3× wide, alpha 0.12) and a
core (0.8×, alpha 0.2), both `shadowCool: 0x24_48_40`, offset
`−toward.x × 0.25 capWidth × size` away from the sun; plus a small contact
shadow right at the foot (0.25× wide, alpha 0.3), which grounds the stem.
(c) Pure: the shadow's centre lies on the side away from `toward`. Frame: every
shadow falls the same way. (d) Free. Risk: the shadow ellipse is not a tap
target, so no reach changes; keep it inside the slot so it never crosses a
neighbour's cap.

**B7. The house, the mouse, the insects.** The same B1–B4 applied — `Brush`
gains `light` beside `ink` and `tone`, so `draw-house.ts` and `draw-mouse.ts`
take it through the brush they already get; windows keep their lamplight
(`windowPane` is the one warm light that is not the sun's, dusk's hue). The
butterfly's wing eyes (the mandala rings) get a 1 px `rimLight` ring on the
sun side. The fly's sheen and the bee's fuzz are unchanged.

## Phaser 4 (4.2.1) — what the look may use

- **`Graphics.fillGradientStyle` / `lineGradientStyle`** exist but are
  `@webglOnly`, per-triangle, and "best used only on rectangles and
  triangles"; a polygon's fan gives artefacts, and a Canvas renderer
  (`Phaser.AUTO`'s fallback) drops them. **Use bands** — `fillBands` and A4's
  clipped hill bands — which the backdrop already does and which look the same
  on either renderer.
- **Canvas textures** (`scene.textures.createCanvas`) work on both renderers:
  the one texture the look needs (A7's grain), generated once from a seed — no
  asset file, so within "everything drawn by code".
- **Filters** (`enableFilters()`: Blur, Glow, Bokeh, Vignette, ColorMatrix,
  Shadow, …) are `@webglOnly` and run a render pass per filter per frame. Under
  the play run's swiftshader a full-screen blur or glow is the costliest thing
  the game could add, and none of the above needs one. **Not used.** If a later
  frame genuinely wants a glow (fireflies at dusk, bite 11), a Glow on a small
  object is the case to try, measured.
- **Blend modes**: `SCREEN` for A2's wash; `MULTIPLY` is available if the grain
  wants it; nothing else.
- **A `Graphics` is not a picture.** It keeps its command list and
  re-tessellates all of it on every render — each circle ~100 points, each
  band path through Earcut again — so a shape that does not move costs every
  frame as much as one that does. Whatever stands still is baked into a
  `RenderTexture` once per paint and repainted in place: the backdrop behind
  the clouds and in front of them (`paint-backdrop.ts`), and each button's face
  (`button.ts`). A framebuffer has no multisampling, so a bake draws at twice
  the device resolution and shrinks by half, which smooths edges as the
  canvas's own antialiasing does. The play run fails a screen whose
  rendered-frame median passes `scripts/lib/frame-budget.ts`'s bound.

## The bar: risks, and what holds them

- **Tappable things against the ground.** A red cap and the grass are close in
  luminance (~0.18 vs ~0.33): hue and the dark contour carry the cap. So the
  outer ink's luminance clamp (B1) is load-bearing, and the lit ground
  (`groundLit`, A5) stays in the band behind the flowers' back row. B1's test
  checks every creature fill's ink against every ground colour.
- **Caps readable.** Rim light and shine stay at the edge and in one ellipse;
  spots stay ≥ 0.9 luminance on their lit side; the cap stays `capRed`.
- **Nothing gloomy.** Sky top HSV value ≥ 0.85; shadows cool but at alpha ≤
  0.3; the ground's bottom never darker than `groundDeep`; grain ≤ 0.10; no
  vignette, no dark foreground silhouettes. The references' darkness (Ori,
  Hollow Knight) is exactly what is not taken.
- **The HUD stays a HUD.** Discs keep an even ring in `PALETTE.ink`, no grain,
  no haze; only their pictograms change.

## Calls not settled here

- **A foreground frame** (Ori's and Rayman's dark blurred grass across the
  bottom edge) — the strongest depth cue there is, left out because it would
  sit over flowers down to `FLOWER_DOWN[1] = 0.96` and a child's finger. If
  wanted, a band under 3% of the height, tap-transparent, below the flowers'
  lowest row.
- **Grain over the creatures** — Gris grains everything; left off them for
  crispness. A frame beside Gris decides.
- **The light shafts** (A2, optional) — one frame decides whether they read as
  sunlight or as haze.
