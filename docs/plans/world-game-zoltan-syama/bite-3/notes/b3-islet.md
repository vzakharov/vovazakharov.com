# b3-islet — the Gulf "islet" in C5's Florida frame

Branch `wt/b3-islet`, base `6ef1fc3d`. Trace only; no code, no row changed.
Drivers: `tmp/islet/{trace,gulf,detached}.ts` (gitignored).

## Verdict

**The islet is the Mississippi delta's birdfoot, real land, cut off from
Louisiana by the fit.** It is not land where Earth has none. C5 placed it at
26.5° N 88.5° W, but it sits at **29.2° N 89.25° W**. Read off the frame against
the coast, the spot's height falls between the Panhandle shore (30.3° N) and
Lake Okeechobee (26.9° N) at about 29.3° N. The rest of Louisiana is off the
frame's left edge, so the cut-off tip looks like a lone island.

**Stage: the fit (row #0).** The mask holds the delta joined to the mainland.
The fit cuts the neck, which is narrower than the finest wave (78 km at L =
511). The tip keeps 4 land nodes of its own.

## Numbers, stage by stage

Grid: 1024 × 2048, which serves as both the measure grid and the runtime's field
grid.

1. **Natural Earth.** There is no land, lake or shelf vertex in 91–86° W,
   24.5–28.5° N. At 26.5° N 88.5° W the mask is sea, 292 km from the coast. The
   delta in the mask is part of North America's landmass (135,645 nodes).
2. **Distance field the fit targets.** At 26.5° N 88.5° W it is −292 km, and the
   fit there is −293.4 km. The 24–29° N, 92–85° W box holds **0 nodes where the
   fit is > 0 over sea**. The sea node farthest from the coast that still comes
   near zero reads −35 km.
3. **Row #0 synthesised.** In 17–31.5° N, 99–79° W it has 4 small landmasses:
   - the delta tip, 29.17° N 89.21° W: 4 nodes, 1,334 km², f ≤ +3.1 km, all of
     them mask land
   - the Keys, 1 node
   - Cuba
   - the Isle of Youth

   The runtime field (`fieldOf` of the same synthesis) shows the same four. At
   29.15° N its distances run −12, **+2**, −15 km. The tip's interior lies
   within ~3 km of its own coast, so it renders as beach-coloured lowland. Its
   coast is linear between nodes 19.6 km apart, which makes it a pentagon.

4. **Relief.** `reliefAt` with every octave at +1 (the worst case) gives:

   | d (km)     |   −1 |   −3 |   −5 |  −8 |  −9 |  −20 |   −290 |
   | ---------- | ---: | ---: | ---: | --: | --: | ---: | -----: |
   | Height (m) | +177 | +217 | +157 |  +8 | −42 | −631 | −2,098 |

   Relief can raise land at most ~8.5 km past the field's coast. It cannot make
   an island 290 km out, and it adds none here.

## Worldwide

- **False islands** are fit landmasses holding no mask land. There are 4, all
  within 13 km of the true coast: 62.8° S 60.5° W (699 km²), 32.9° N 128.9° E,
  37.0° N 25.7° E, 60.5° N 1.2° W. None lies more than 39 km out, which matches
  C2's 0.00% "beyond 39 km".
- **Cut-off pieces** are fit landmasses that are a fragment of a larger true
  one, like the delta. There are **20**. Eighteen are under 5,000 km². Among
  them the Mississippi delta, the Alaska Peninsula's tip, Kintyre, Haiti's
  western peninsula, the Palawan and Lombok areas, the Chiloé and Taitao areas,
  Tierra del Fuego (51,947 km², cut from the mainland at the Strait of Magellan,
  as on Earth), and the Antarctic Peninsula's tip.

## Proposal

None is plain. The tip is real land, and the fit already counts its neck in the
1.29% coast fringe. The local levers all cost more than they buy:

- Widening the neck in the target is the hand-tuned target that `b3-c-map` call
  6 rejected.
- A floor on landmass size in the runtime would erase the tip, which is real
  land (+1,334 km² dropped, raising C2's dropped share). It would also erase the
  other small pieces and the real small islands.

Recommend accepting it and correcting C5's defect 2. It is not wrong land: it is
the Mississippi delta at 29.2° N 89.25° W, detached at L = 511.
