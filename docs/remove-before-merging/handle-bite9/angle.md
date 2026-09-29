# Handle bite 9 — angle group (one viewing angle; T101, T102, T97)

Done. `angle.patch` is applied and can go.

- **a177993** — the patch (one angle, `UP_PER_Z` 0.481; the floor gives way
  on a short screen), the `seen` test on every VIEWPORTS screen, its turn and
  412×915 both ways, and meadow-rules asserting door in sight, cap in view,
  off the controls and a finger wide after a turn. Five tests in four files
  fail on the floor giving way, left for T98: mushroom-genes (narrowest cap a
  finger's target), mushroom-tap (every mushroom already a finger across),
  mushroom-outline (russula dip, lobes an ink line), insect-layout (butterfly
  narrower than any cap, phone held sideways).
- **4c5c874** — the wash is laid out on the layout (`MeadowLayout.wash`),
  short of every used mushroom's foot, so a turned meadow keeps every rule,
  the wash included.
- **3e49b0b** — T102: a turn keeps every flower in sight that was (phone,
  small phone); `LEAST_IN_A_FOREST` removed (median 7 planted everywhere).
  Butterfly `slowest` stays 2: at 1.3 desktop catch falls to 0.61.

Open, for T98: a meadow grown on the phone held sideways and turned upright
refits to a 37 px unit while insects stay at their 60 px floor, so 1 flower
in 7 leaves sight there (median kept 0.86), by the screen edges and controls,
not by cover.
