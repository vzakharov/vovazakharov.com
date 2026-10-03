# Bite 16 — the map

Item 16 of the plan, the last of idea 1
(`docs/remove-before-merging/ideas/idea-1-walking-meadow.md`, its «Что ты
решил» overriding its body): «Вида сверху нет, есть схематическая карта — как
в старых пиксельных ходилках вида сверху: каждый гриб и цветок стоит на своём
месте своей обычной, боковой картинкой, только меньше … остаются карта,
переход к ней и кнопка», and the sound button goes, sound off being the
device's. Bites 9–12b built the ground, the wide world, walking it and its
endlessness; this one lets the child see what he has planted all at once.
Paths are under `src/pages/mushrooms/`.

## Calls — the button

1\. **The mute's circle becomes the map's.** It anchors the layout (the
pickers' rows keep beside it, the phone's insect buttons stand by it), so
the circle stays where it is at the size it is, and everything named for it
is renamed for the map: `WithMute` → `WithMap`, `Controls.mute` → `map`,
the `mute` handler → `map`. Beat: a new circle elsewhere, which re-lays every
screen's controls for nothing.

2\. **The mute goes whole.** `readMuted`, `rememberMuted`, `MUTED_KEY` and the
`mushrooms-muted` key, `toggleMuted`, `muted`, the heard/muted looks and
`drawMuteButton` are deleted — the one silent fallback the game had goes
with them (decisions.md's line on it is rewritten, not negated). `settle()`
and the hidden-tab suspend stay: the synth still sleeps on a hidden tab.

3\. **The button is a folded map in ink**, `drawMapButton` in `hud.ts`: a
paper of three panels folded in a zigzag, a dotted path across it ending in
a little cross, Syama's indigo on the disc every button wears. While the
map is open the button shows a cross on the disc instead — the same
pictogram as the flower picker's cross, so a press visibly closes. Its
press pops, as every button does, and dispatches `shut` (closing the flower
picker, as any tap outside it does).

## Calls — the map

4\. **The map is a panel over the meadow, unfolding from its button.** A
rounded sheet of paper (`PALETTE` gets a `paper` and a `paperEdge`) inset
`BUTTON_INSET` from every screen edge, its frame inked; it grows out of the
button's circle in ~0.3 s by `emerge` (`model/motion.ts`), scale and alpha
both, and folds back into it by `sink`. Only the map button stays above it;
every other button hides while it is open (they would sit over the map).
Beat: a full-screen cut, which loses where it came from; a camera zoom out,
which the panorama's lens cannot do.

5\. **The map is drawn once, as it opens**, from what the meadow holds then —
a snapshot, since nothing walks while it is open. Every mushroom (its house
included, as the bed draws it), every flower — seeded and planted, pulled
ones not — and every spore stands at its plane foot (`Footing`), drawn by
its own painter (`drawMushroom`, `drawFlower`, the spore's dot) at one map
scale, unlit by heading: one fixed light from the map's top, so the map does
not turn with the child. Insects and rain are not drawn. Nearer the map's
bottom draws over farther up, as in a top-down pixel walker.

6\. **The map is fixed to the sun.** Up on the map is the direction of the
sun's azimuth on the plane (`panorama.ts`), with a little sun drawn at the
top edge's middle as the map's compass; the child turns, the map does not.
Beat: heading-up, which spins the map under him with every turn and gives
no fixed picture of the meadow to learn.

7\. **The map frames everything planted, centred on the child.** Its centre
is the eye's plane point; its reach is the farthest foot from it, floored at
`D_SEE` (so a fresh meadow shows the opening clump at a readable size) and
padded by one clump size; the scale fits that reach to the panel's shorter
half-side. Painters draw at `mapScale = clamp(that scale × the thing's size,
…)` with a floor where a mushroom stays recognisable (~12 px cap width) — a
crowded field overlaps rather than vanishes. The pure part is
`model/map-frame.ts` (centre, up, reach, plane→map point, per-thing scale),
under `node:test`.

8\. **The child is a marker with a view wedge**: an indigo dot where he
stands, a short arrow on his heading, and a pale wedge of the view's field
(the view's half-angle across, `D_SEE` deep) — so the map says where he is,
which way he faces and what he sees from there. It reads `EyeInput.eye()`.

9\. **A tap anywhere on the open map closes it**, as its button does; a tap
on a mushroom or flower on it does nothing more. While the map is open the
drag, the keys' walk and turn, and the note keys do nothing — the meadow
waits under it — and the button's press is the only other input. Beat: a
tap on the map walking the child there, which is a bite of its own if the
operator wants it.

10\. **The map is a module of its own**, `map-view.ts` (the panel, its
unfold, its drawing) beside `model/map-frame.ts`; `meadow-scene.ts` (at 450
lines) only holds it and gates the input through it, and anything that
pushes it past ~450 moves into a neighbour rather than growing it.

## Packages and waves

Two packages, one after the other, each an Opus agent in its own worktree
landing one squash commit (`brief-common.md` under
`docs/remove-before-merging/bite-16/`):

- **A — the button** (calls 1–3): the mute out, `drawMapButton`, the
  renames, its press toggling an `open`/`shut` the scene holds (the map
  itself package B's), the probe and play scripts (`play-meadow.ts`,
  `play-approach.ts`, `play-fliers.ts`, `mushroom-probe.ts`) off the mute,
  decisions.md's sound lines.
- **B — the map** (calls 4–10): `model/map-frame.ts` and its tests,
  `map-view.ts`, the input gate, a probe hook (`__probe.map()`: open, the
  frame's centre and reach) and a `map` play shooting it closed, opening and
  open on a fresh meadow and on a walked, planted one, on tabL and phoneP.

## Built
