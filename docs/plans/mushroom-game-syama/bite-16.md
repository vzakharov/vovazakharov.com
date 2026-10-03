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

## Calls from the build

11\. **`MapView` replaces `MapSwitch`**; the map is one Graphics in a
Container centred on the button, scaled and faded together, redrawn on
opening and on a resize while open — not baked. Lit by `iconLighting`, the
buttons' fixed light. A spore is a dot 0.06 of a clump size, at least 2 px.

12\. **A tap anywhere closes the open map**, the margin round the sheet
included: a full-screen catch is interactive only while it is open, so no
tap reaches the meadow under it. A key held as it opens is let go
(`EyeInput.letGo`); note keys are dropped while it is open.

13\. **A flower stands on the map at its `foot`, never its `place`** — the
layout's footing put the field's reach at ~2000 clump sizes and shrank the
meadow onto the child's dot (the first play run's one red, 80bd380).

14\. **Call 7 revised: the map frames what is planted, not the child.** As
built, centred on the child, half the sheet stays empty behind him and a
fresh meadow on phoneP is a thin band at 9 px flowers (frames
`phoneP-m2-open-fresh.png`, `tabL-m4-open-planted.png`). The frame is the
box round every foot and the eye, padded one clump size, fitted to the
sheet on both axes, still sun-up, its scale capped at 2.5× the fresh
meadow's so two mushrooms do not fill a tablet. Beat: keeping the child
centred, which the child's own marker and wedge make unnecessary.

15\. **A door is seated among the mushrooms as the eye now stands them,
when the opening view cannot place its house.** The bed sought a door's
seat only in the opening eye's world (`layout.mushrooms`), so a mushroom
grown behind it, past its sides or its far edge — after any walk or turn —
had none, and `furnish` threw (the operator's crash on a russula, after two
doors that seated). `doorSeats` (`door-seats.ts`) tries the opening view,
then the current one, then the mushroom alone, so every grown mushroom has
a seat the moment its door goes in.

16\. **The view wedge stays on the sheet.** `drawView` samples the wedge's
arc and cuts each ray at the paper's inner edge, so a child near the
frame's side draws no wedge over the margin or the meadow.

## From the operator's play — the bite's last package

17\. **A door is seated as the child sees its mushroom now**, from the
current eye alone; call 15's opening view first goes. The operator: «не
понимаю, почему оно ищется _сначала_ с первой точки? первая точка — вроде
никакая не особенная». It isn't: the opening view was the only world
before 12b, and seating from it can hide the door behind a neighbour from
where the child stands when he furnishes. A seated door stays where it was
seated.

18\. **The map's sheet is a meadow seen from above, not bare paper.** «она
и предполагается, что останется с таким никаким фоном?» — no. The paper
keeps its frame; inside, a grass wash with tufts and mottles drawn in the
meadow's own inks, so the things stand on ground, as in an old top-down
pixel walker.

19\. **The open map's close button is the map button's own disc with a
plain ink cross**, not the flower picker's coloured one («кнопка закрытия
выглядит аляписто»), and **Escape closes the map** («закрываться должна по
эскейпу тоже»).

20\. **A window opens for the worm.** Windows were only ever painted shut
(`paintWindow` has no open state), so the worm crawled from a shut window
into a shut one — «логично, конечно, чтобы червячок лез не из закрытого
окна в закрытое». The tapped window swings open before the worm comes out
and shuts behind it; the target opens as the worm nears and shuts once it
is in; a peek opens and shuts its one window. Open is a dark inside behind
the pane swung aside, each of Syama's window kinds in its own way, timed
off the worm's trip clock (`model/worm.ts`), as `open` is for a door.

21\. **The tufts are tended again before the screen's side reaches the
edge of the world the rules judged them in.** The operator: «травинки как
будто стали появляться пучками сразу по много, и как-то не сразу/при
повороте на достаточный угол -- до этого на поляне на их месте просто
пустота». A tuft stands only where a flower planted on it would be in the
world's frame as the anchor lays it out (`flowerInSight`'s `inWorld`), and
that frame is a fixed number of clump sizes wide: a tablet shows half of
it, a wide window most of it. The re-tend waited for half a screen's turn,
so on a wide window the leading side's ground was judged off the world and
stood bare until then. Not recent: the gate is bite 12b's. `strayed` now
also strays at `turnInWorld` (the world's side as the screen lays it out,
`focal · atan`), less `sightSlack`. On a 1900×1000 window, a turn of 0.31
rad: 75 tufts drawn of the 92 a fresh tend draws before, 92 of 92 after
(`frames/bite-16/tufts-turned-*.png`). A step short of `TEND_STEP` still
leaves a few far tufts for the next tend, as it always did.

22\. **A key's note sounds nearest the melody's last, as a flower's does.**
The operator: «играю `;` `g` (ля-до); ожидается: "до" сыграется та, что выше
"ля". на самом деле: играет "до" той же октавы, что и "ля"». The keys played
as a piano's, in the keyboard's octave; now they `strike` as the flowers do,
the keyboard's octave only where the melody has rested, and `.`/`/` move the
melody's last note an octave with the keyboard's (`shiftMelody`), so they
still step the register.

## Built

Each package's hand-over note under `docs/remove-before-merging/bite-16/`
(retired, `docs/remove-before-merging/retired.md`) holds its detail.

- **A** 18e3ad6 — calls 1–3: the mute gone whole from `sound.ts`
  (`settle()` and the hidden-tab suspend kept, its tests turned to the
  hidden tab); `WithMap`, `Controls.map`, the `map` handler;
  `drawMapButton` in `hud.ts`, the flower picker's cross (`drawPullButton`)
  while open; every other button hidden while it is open; the probe's
  `state().mapOpen`, `play-meadow`'s `7-map`; decisions.md's sound lines.
- **B** 49725da — calls 4–12: `model/map-frame.ts` (`mapFrame`, `onMap`,
  `headingOnMap`, `thingScale`) under `node:test`; `map-view.ts`'s
  `MapView`, one Graphics in a Container pivoted on the button, scaled and
  faded by `emerge`/`sink` paced to 0.3 s, redrawn on open and on a paint
  while open, lit by `iconLighting`; a full-screen `Zone`, interactive only
  while open, closing it; `PALETTE.paper`/`paperEdge`; the note keys
  dropped and the held keys let go while open. `meadow-scene.ts` back to
  450 lines by `listenOnMeadow` taking the scene's pieces.
- **C** 80bd380 — `__probe.map()` and `play-map.ts` (`m0`–`m4`: closed,
  unfolding, open fresh, walked and planted, open again) on tabL and
  phoneP; call 13 is its one red, fixed.
- **The review** (5402118795, six findings, each replied to citing
  28a6277, none resolved) and **D** 28a6277 — the pickers shut by a
  `{ kind: 'map' }` action (`PICKERS_SHUT`); a glide stopped dead under the
  map (`haltAt` in `model/walk.ts`, `stoodStill` in `model/stride.ts`,
  `EyeInput.halt`); call 14's frame; flower heads floored at `LEAST_HEAD`
  9 px; the probe's `map()` giving `flowers`, `child`, `ahead`, and
  `play-map` asserting nothing off the sheet, left on the map left of the
  heading, the `+` picker shut and a flick stopped under it; calls 15–16.
  Map on tabL and phoneP, meadow on tabL, green.

- **`/dry`** aca95c5 — `plantNearest` in `play-tufts.ts`, `FlowerAt` in
  the probe, `markOn`/`toEdge`/`EDGE` in `map-view.ts`, `stoodStill` over
  `standingAt`.
- **F** 32f8a533 — call 20: `tripWindows`/`peekWindow`/`wormClock` in
  `model/worm.ts`; `paintWindow` takes an optional open state, each kind
  opening its own way, the dark inside `PALETTE.doorway`, the glass
  swinging away from the worm's way; `Opened` the door's and window's
  shared base. The worm comes out 0.2 s after the tap, once its window is
  open. `play-worms` checks both windows open and shut.
- **E** 710f170a — call 17: `doorSeats` from the current eye, alone as the
  fallback (a furnished target can stand behind the child), and `paint`
  no longer re-seats, a station being in the mushroom's own frame. Call
  18: `map-ground.ts` (pure, tested) and `draw-map-ground.ts`, tufts and
  the lawn's own mottles in cells seeded through `cellSeed`; the wedge a
  warm-white veil with an indigo edge. Call 19: `drawCloseButton` in
  `hud.ts`; `Escape` → `{ kind: 'close' }` in `keyboard.ts`. The map draws
  a door at the station nearest its seat's height. `play-map` shuts by
  Escape and shoots `m5-open-door`; `Blade` in `brow.ts` the brow's and
  the tufts' base. `meadow-scene.ts` 452 lines.
- **G** 11b26dd — calls 21–22: `strayed(view, from, slack)` in `tending.ts`
  strays at `turnInWorld` less `sightSlack(layout)` too; the note keys
  `strike` nearest the melody's last, `shiftMelody` (`model/notes.ts`)
  moving it with `.`/`/`. Frames `tufts-turned-before`/`-after`.

Open: the cross window never opened in a play (the play taps the
outermost window). On a phone the map's mottles read large beside the
things. On phoneP the planted meadow fills the sheet's width but only a
middle band of its height (call 14 as written, on a tall sheet); the house
at map scale reads as a dot and a smudge; `emerge`'s overshoot makes the
sheet briefly larger than the screen mid-unfold — all five in
`to-check.md`.

## Left

The splits are done: the probe into five modules (0f1fa4e), the lens out
of `ground.ts` into `model/pinhole.ts` and the taps out of
`meadow-scene.ts` into `meadow-taps.ts` (88b6cf8). The plan's summary
carries calls 17–22 (b34e647). A second `/dry` over `aca95c51..HEAD` (E, F
and G landed after the first) runs as two agents, `src/` and `scripts/`,
each landing a `polish(dry bite 16 tail …):` commit. Then `/tend-prose`
over `8abc5a6..HEAD`, the bare `polish:` mark; vet; `/pr` refresh; pause;
relay `/go` for item 17, dusk.
