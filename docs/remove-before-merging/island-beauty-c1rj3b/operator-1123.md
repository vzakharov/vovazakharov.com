# The operator's readings, 23 November, on 0ecae061

What the operator brought back after the first approach closed, for the next one to start from.

## Measure, at 2 m by the shore of world 0

`https://preview.vovazakharov.com/island#0@64.76307,-86.23383,2.0,66.7,7.0,5.700` — sea, trees, land and clouds in one view, though not the sun's path on the water. It is neither of the two places the earlier numbers came from, so it says where the frame goes, not whether the sea's cost cuts paid.

M2 Pro, WebGPU, canvas 2254×1495 device px; mean of 60 frames.

```text
look   without          ms   fps  saved  worst
plain  -              11.9   84      -   17.6
swift  -             108.0    9      -  124.3
fine   -             142.9    7      -  183.4
swift  clouds        107.7    9    0.4  133.2
swift  cloud-shadow   63.1   16   44.9   80.1
swift  air            96.7   10   11.3  115.8
swift  ripples        64.2   16   43.8   80.0
swift  sea-sky       105.4    9    2.6  127.9
swift  trees         106.3    9    1.7  130.2
swift  tufts         108.1    9   -0.1  132.5
fine   clouds        121.5    8   21.4  142.4
fine   cloud-shadow   92.7   11   50.2  108.8
fine   air          134.1    7    8.8  157.9
fine   ripples        88.8   11   54.1  101.3
fine   sea-sky       133.7    7    9.2  161.7
fine   trees         138.5    7    4.4  172.8
fine   tufts         136.3    7    6.6  159.6
```

- **Two per-pixel costs are nearly all of swift's 96 ms over plain**: the clouds' shadow (45 ms) and the ripples (44 ms). The shadow is the cloud field evaluated again on every surface pixel (`clouds.shade` inside `aerial`, `sky-nodes.ts`); the ripples are the band sum on every sea pixel (`seaShade`, `sea-surface.ts`). The sky the ripples mirror is not it: `sea-sky` saves 3 ms.
- **The clouds themselves cost swift nothing and fine 21 ms**, the sixteenth-a-frame march doing its job; the air is 9–11 ms, trees 2–4.
- So the next approach's frame-time list leads with the shadow — a coarse cover map the surface reads, refreshed as the clouds drift, in place of the field per pixel — and the ripples' band count by distance. The list in the plan (air volume, sea globe, trees' triangles) was guessed before this table and comes after.

## Screenshots, swift beside fine

In `frames/`, `operator-1123-*`, each pair the same view in both looks.

- **Fine's detail shows only near**: `peak-2m-*` and `beach-2m-*` are alike at distance and differ in the foreground — the rock face, the bushes' facets, the ripples. The operator's direction: one look that draws fine near and swift far, by distance.
- **Clouds look wrong at every height and kind** (not for this approach): `170km-*` long, even, parallel stripes; `520km-*` polygonal flakes with dark cracks between, fine more angular than swift; the polygons show in the 2 m pairs' skies too.

## Descent from orbit, fine

`gh release download island-timelapse -R vzakharov/vovazakharov.com -p 'descent-2026-11-23-orbit-hud.mp4'` — 19 s, to 2 m on a ridge at 35.92381, -113.46303. Frames from it are `frames/operator-1123-descent-*`.

- **Grey rectangles from about 3 s to 6 s** run along the edges of the finer tiles as they arrive (`06s-skirts`): the relief inside, the coarser ground outside. They look like the tiles' skirts seen from above, lit grey rather than in the ground's colour. Not yet checked in code.
- **No snow from afar** (`07s-no-snow`): brown ground with no snow at all, then snow at 7 s as patches. The likely cause is a coarse tile's heights averaged below the 2200 m snow line (`BAND_HEIGHTS`, `land-colour.ts`) until a finer one loads. Not yet checked in code.
- **Snow in teeth along a ridge at 2 m** (`15s-snow-teeth`): the snow's edge follows the mesh's triangles, from 15 s to the end.
- **Trypophobic clouds** (`05s-clouds`): white sheets with polygonal holes over the land, a cracked deck over the sea.
- **The panel freezes for the first 13 s**: height 20,000 km and 2.8 m/s throughout the dive, then catches up.
- **The mountains are the approach's best result**, in the operator's words: «как сейчас получились горы нравится больше всего из того что сделано за кусок».
