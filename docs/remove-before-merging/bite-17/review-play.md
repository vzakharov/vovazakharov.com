# Bite 17 review — player

875adf9..1228765. Plays dusk, dark, night-run, map, walk green on tabL and
phoneP (median 15.3 / 13.4 ms). Two review-only child plays (not committed):
a session (3 doored houses, sun, resize mid-dusk, every firefly, a window,
a door, flight + drag + resize mid-glide, map in flight at dusk, rain at
dusk, moon tap in flight) and a firefly-coverage sweep. Held up: dusk level
through a resize, flight through a resize (eye 4.98), map at dusk in flight,
rain closes flowers with no rainbow, moon tap in flight, fireflies 4 → 12,
no page errors. Frames kept: `../frames/bite-17/review/`.

1. **Should fix (near blocks) — fireflies swallow taps on doors, caps,
   windows.** Share of a mushroom's hit box its taps still reach, day →
   dusk (8 frames): phoneP mushroom-4 87 → 39 %, mushroom-1 94 → 56 %; tabL
   mushroom-1 95 → 63 %. A door's tap point lost to a firefly: phoneP
   mushroom-3 5/8, -4 5/8, -5 2/8; tabL -3 3/8. phoneP mushroom-5's window
   tap reached a firefly (`review/phoneP-s-window-tapped.png`). A tap on a
   firefly's centre missed it 5/12 tabL, 2/7 phoneP (a neighbour took it).
   Lead: `firefly-view.ts`, each of 12 hit circles `TAP_RADIUS` (32 px) and
   never passing the tap through. Ask: at full dusk on phoneP and tabL over
   8 frames every door point reaches `door:<id>` ≥ 95 %, each mushroom's
   reachable share drops ≤ 5 points from day (fireflies under houses/caps,
   or a reach near the drawn glow).
2. **Should fix — far mushrooms glow pale grey in flight at dusk**, lighter
   than the hills (`review/phoneP-s-flight-dusk-glide.png`,
   `review/tabL-s-flight-dusk-glide.png`; porcini cap rgb(156,151,142) on
   hill rgb(71,85,108); steps at dusk keeps colours,
   `review/phoneP-s-dusk-back.png`). Lead: haze mixes toward day
   `PALETTE.air`, no dusk twin (`house-view.ts:333`, `draw-mushroom.ts`,
   `mushroom-paint`). Ask: at full dusk in flight a hazed cap's luminance
   ≤ the backdrop behind it.
3. **Should fix or operator rules — gait button alone mid-sky on phoneP**
   at (178,214) vs map (46,46); tabL (110,46). Lead: `gait-spot.ts`
   `nearestSpot`. Ask: centre within ~2× (tapReach(map.r) +
   tapReach(GAIT_R)) of the map's on every screen, or the operator accepts
   it. (Orchestrator: told the operator; no ruling yet.)
4. **Nit — dusk brow rim** a ~4 px lighter mauve seam
   (`review/tabL-dusk-dusk.png`, y 470–520 CSS). Lead: `paint-land.ts` rim
   tone. Ask: rim luminance between the ground above and below.
5. **Nit — dusk stars poke out behind the map and gait buttons** (re-shoot
   tabL dusk-mid). Lead: `paint-sky.ts`/`star-images.ts`. Ask: no star
   centre within tapReach of a standing button.

Not findings: mid-fade sky banding (contact-sheet scaling); phoneP map's
small clumps (also in steps). Unjudged: a door tap at dusk started a run
from another house into it.

Best frames for the operator (`review/`): tabL-dusk-dusk,
tabL-dusk-butterfly-close, tabL-s-fireflies-tapped, phoneP-s-rain-dusk,
tabL-dusk-mice-close; plus `../tabL-g-flight.png`, `../fe-flight.png`.
