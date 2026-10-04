# Bite 17 review — reader 1 (dusk, light, creatures)

Diff 875adf9..1228765; anchors checked against `git diff -U0`. Sound:
duskness/turned reversal math, `nightRan` purity and streams, roost/wake
order, firefly genes, tap/tick clock, hidden-tab crickets, rain+dusk
stacking, resize mid-dusk, file sizes (meadow-scene 441, paint-backdrop 420,
map-view 420, mouse-runs 407).

1. **Should fix — a lagging house's windows jump 0 → 1 on a reversed turn.**
   `ui/scene/windows-lit.ts:17` asks the current `Dusk` for `now - delay`,
   which before the new `startedAt` returns the turn's `from`. House delay
   1499 ms, reversed at T: 1500 → 0.259, 2000 → 0.784, 2500 → 1.000 in one
   frame. Ask: for every phase and T in 0..DUSK_MS step 50,
   `|windowsLit(turned(d,T),T,phase) − windowsLit(d,T−ε,phase)| < 0.05`
   (fix: lag each house's light, not the clock it reads).
2. **Should fix — day runs widened too.** `model/mouse-run.ts:48-54`
   (`seenBesides`): `MouseRuns.watchOuting` (mouse-runs.ts:234-247) turns
   day outings into runs via `runTarget`, so since 0e80d99 a day outing
   crosses the whole screen (sped to 6 s). bite-17.md call 11 "Day keeps
   runs tap-only" was already untrue. Ask: gate any-door reach to
   `nightRan` and keep a reach for `watchOuting` (a day outing between
   doors 8 units apart makes no run), or record the departure and fix call
   11. (Orchestrator: the operator liked night runs and asked nothing about
   day ones; a door tap by day reaching any house was his complaint's fix —
   keep taps wide, gate the day *outings*.)
3. **Should fix — the open map's compass sticks.** `ui/scene/map-compass.ts:21`
   `if (dusky) drawMoon(...)`, fed once per `flip()`/resize
   (map-view.ts:178-195): sun tapped, map opened within 2 s → full-dusk
   paper with a sun on the compass until reopened. Ask: redraw when
   `duskyAt(level)` flips while open.
4. **Should fix — bite-17.md § Left stale**: items 1–6 landed (0f7f38f;
   fe68aa8; 0e80d99, 593a4b6; 68bafe1, 92319da, 712c69f; 690191a; 2878342),
   1228765 unrecorded, mouse-runs.ts now 407. Ask: Left holds item 7 only;
   Built so far names each.
5. **Nit — sound uses last frame's direction.** `dusk-view.ts:143`: two taps
   in one frame both play `sink`. Ask: flip `this.toward` in `tap()`.
6. **Nit — a morning tap shuts the flower picker too.** `model/game.ts:413`.
   Ask: shut only toward dusk, or say both in call 9.
7. **Nit — a firefly glides in from a stale point.** `firefly-view.ts:243`:
   `drawn` cleared only on sleep. Ask: clear it in `draw()`'s `!seat` branch.

Not finished: mutation check of game.test.ts "keeps the bees from planting"
— replace `room: dusky ? [] : room` (game.ts:199) with `room,` and run
`node --import tsx --test --test-name-pattern="keeps the bees"
src/pages/mushrooms/model/game.test.ts`; still green means the test cannot
fail on its rule (should fix).
