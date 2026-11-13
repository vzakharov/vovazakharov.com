# The beam and the pill: three ways, to be compared in frames

Written by the lead on 2026-11-13 ~10:25Z for **shell** (who shoots) and **pill** (who supplies the facts). It replaces the lead's earlier ruling "the sun stays, pill moves the shelf", which is **withdrawn**.

## What the operator said

On the sunbeam through floor 1's doorway, which today runs along the floor's diagonal, stands on the west wall and ends on the pill's shelf:

> я бы поигрался с направлением луча. если он будет освещать ровно таблетку и спуск вниз, это слишком быстрый reveal, а так человек секунд эндцать будет ходить вообще не в понятках

("I would play with the beam's direction. If it lights exactly the pill and the way down, that is too fast a reveal; otherwise a person walks around for some seconds not understanding anything.")

And then, on how:

> итого у нас три пути: (а) переместить полку и/или дыру (если процедурность позволяет), (б) повернуть солнце, (в) повернуть куб. какой из них правильный сходу не скажу, надо смотреть и сравнивать

("So we have three ways: (a) move the shelf and/or the hole (if the procedure allows), (b) turn the sun, (c) turn the cube. Which is right I cannot say offhand — it has to be looked at and compared.")

He also asked: is the shelf's placement not procedural, and is the hole in the floor in the beam too?

## Shell: the comparison is yours

Before the `bodyShadow`; after the wood ladder if that is already in flight. Merge the lead first (b4058398 or later: core's gaze-based adaptation, `frame.body`, sea's real ocean).

One sheet per option, **the same eyes in each**, so they can be laid side by side on the board:

- **Inside**, entering through the doorway — the walker's first view, and one turned toward the shelf and the hole — at `--indoors 0`, `0.5` and settled. Does the beam land on the pill's shelf, on the hole in the floor, on neither?
- **Outside**, from the waking spot toward the cube and from the ladder's foot — because (b) and (c) change the outside: where the sun sits beside the cube, which face is lit, where the doorway and the ladder face, the cube's shadow on the sand.

The options:

- **now** — as it stands.
- **(a)** the shelf and the hole outside the beam's footprint. Ask pill how they are placed; stage them where a rule "rolled among the places outside the footprint" would put them. Nothing is placed by hand in the end: if (a) wins, it becomes a rule on the roll.
- **(b)** the sun's azimuth turned so the beam through the east doorway misses them — two angles; the elevation stays 9°.
- **(c)** the cube turned about its vertical axis, or the doorway on another face — two variants.

Throwaway overrides only (a flag or a scratch commit). **Nothing is committed to the shared constants** (`SUN_DIR`, `CUBE_AT`, the doorway's face) — only the frames, under `../frames/shell/beam/`, named by option.

For each option, note what else it breaks or costs: sea's glitter path, sand's shadow of the cube, walk's approach to the ladder, sound's lee at the ladder's foot, the reveal from the waking spot.

Report to the lead with the frames' paths and your own recommendation. The lead sends them to the board for the operator; the choice is his.

## Pill: the facts, and nothing built

The direction "floor 1 rolls the shelf and the hole outside the beam" is withdrawn — do not build it. Send shell, the operator (in your own session) and the lead:

- how the shelf's and the hole's places on floor 1 are decided today — rolled from the seed (under which path), fixed, or derived from one another; and whose files they are;
- where they are for the seed the frame scripts use;
- whatever shell needs to stage the shelf elsewhere for its option (a) frames — a throwaway override, not a commit to your model.

Then carry on with your own list.
