# b3-b7c-look — the browser look at B7c (call 15)

Looked at 36a52a32 (`wt/b3-b7c`), the vova static export, headless Chromium over
CDP (swiftshader), 1440×900. Driver: `b3-b7c-look/look.ts.txt` (a copy of the
throwaway script `tmp/look/look.ts`; run as
`pnpm exec tsx tmp/look/look.ts <1|2|3|4|tp>` against `sites/vova/out`). Stopped
at the context budget: items 3 and 4 are not looked at yet.

## 1. `P` on `/island` — pass

- Hash on open `''`, still `''` 12 s later; after `P`:
  `#1@10.00000,0.00000,20000000.0,0.0,0.0,0.000`, `history.length` unchanged
  (2).
- Confirmation: "Where you are is copied, and its link is in the address bar",
  top centre, gone 2.4 s later (`b3-b7c-look/1-after-P.png`).
- Clipboard (permission granted) held the where-line:
  `island 36a52a32 http://localhost:37761/island#1@10.00000,0.00000,20000000.0,0.0,0.0,0.000 · world 1 · lat 10.00000° lon 0.00000° · height 20000000.0 m · heading 0.0° · pitch +0.0° (look) · 16:39 sun time (t 0.000 h) · tiles 2 (2–2)`
  — reads sensibly; 16:39 matches the B7c note's hour 0 over #1.
- Capture caveat, not a page defect: with the live loop under swiftshader a
  `Page.captureScreenshot` takes 3.5–4.7 s, past the 1.8 s confirmation, so most
  captures miss it. The frame is taken under `?play` with the page's 1800 ms
  `setTimeout` held open by the harness. A probe with the loop live caught it
  once, painted over the canvas as intended.

## 5. Hint row — pass

`1-opening-hint.png`: the last key row is `P` "copy where you are". (The touch
column shows beside the keys because headless reports `hover: none`.)

## 2. The hash reopens the view — pass on the pose, frame pair unexplained

- A: `?play`, `moveTo` the inlet head at 30 km, `turnTo(-2.2)`, `setTime(2.5)`;
  `island.where()` → `#1@21.19493,4.88850,30000.0,233.9,0.0,2.500`. B: that hash
  in a fresh tab. Both where-lines identical: lat 21.19493 lon 4.88850, height
  30000.0 m, heading 233.9°, pitch +0.0°, 19:28 sun time, t 2.500, tiles 11
  (6–11). Geometry identical in `2-side-by-side.png`; brightness differs (mean
  RGB 47/72/59 against 16/25/23).
- B's darkness is right for 19:28 sun time: a separate probe at the same place
  gives the identical frame (mean 15.6/25.1/23.2) from `setTime(2.5)` and from a
  `,2.500` hash, and the day frame back from either with `setTime(0)`. Why A
  came out brighter after `moveTo`+`turnTo`+`setTime` is not settled — suspected
  a stale capture, not shown.
- A hand-written pose with pitch and hour,
  `#1@10.20000,0.30000,800.0,45.0,-12.0,3.250`, reads back exactly (pitch −12.0°
  kept, 19:55 sun time) and its reopen is pixel-identical
  (`2-crafted-side-by-side.png`, diff max 0). Its tile field is
  `tiles – (7–17)`: no drawn tile under the eye there.

## 3. Noon and midnight — not done

From `heavensAt`, #1's opening (10° N 0° E) has noon at t ≈ 19.355 (sun 80° up)
and midnight at t ≈ 7.355 (−80°). Script item 3 shoots both at orbit and 1,000
km; not run.

## 4. `hashchange` to another world with a pose — not done

Read of the code: `setWorld` keeps the old `groundAt` until the new field lands,
so `placeAt` → `eyeOfPose` sets `floor` from the old world's ground; `step` then
eases `floor` to the new surface over `FLOOR_SECONDS` (0.6 s) and lifts the eye
to `surface + MIN_HEIGHT − floor` meanwhile, so live, the eye can sit under the
new ground only until the field lands plus a frame, then pops up and eases back
to the pose's height. Script item 4 (switch `#1@spot,2 m` → `#0@spot,2 m` at
seven high Earth spots, height traced per step) measures it; not run.
