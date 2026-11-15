# Portals in the cube — carte-blanche run

The lead's memory for this run (`/carte-blanche`). Not an approval gate.

## Standing rules (verbatim)

- «ты делаешь, что хочешь, создаёшь каких хочешь подагентов и подсессии, они НЕ
  создают свои пиары, но полируют свои ветки, потом ты их забираешь»
- «в мейн не мерджишь, превью более чем достаточно»
- «не передавай! никаких релеев, есть автокомпакт»
- Everything in `.claude/skills/carte-blanche/SKILL.md` § "What stands without
  being said".

## The ask (verbatim, 15 Nov)

> да, короче, идея с "честной сетью" подкупает (название тоже внушает доверие:-)
>
> давай делать, пока что 1- цикл минута 2- без лифтов, просто открываешь, за
> дверью видишь другой этаж как он есть после выхода; когда этажи меняются,
> меняется и то что видишь.
>
> в какие-то предыдущие разы там была какая-то тема с air-на-этаж -- пока не
> паримся, берём air того этажа откуда уходим. возможно это будет один из наших
> глитчей-которые-фичи

## Answers to the batch of questions

Asked: 1 view (far room at your size, a window into it), 2 crossing (instant at
the threshold), 3 way back (nothing extra), 4 branch (this one, PR #283).
Answered 15 Nov, verbatim:

> 1- нет, вид в масштабе комнаты, прямо как будто за дверью просто продолжается
> лабиринт (но с другой темой)
>
> 2- мгновенно, меняется только воздух
>
> 3- ага
>
> 4- ага

Read as: behind the door the maze simply goes on — the far floor's rooms at this
room's scale, in the far floor's theme, so the far floor's own scale never
shows; on crossing nothing jumps but the air, which was this floor's in the view
and becomes the far floor's once through.

## Design decisions

- The model is the doors artifact's `portal-model.js` (published files of
  https://claude.ai/artifact/Gf2FbMjCKfXwD8jHSgw8nw), ported as a pure module of
  `src/cube/entities/world/model/` with node tests: sites = partitions of level
  ≥ 2, the portal on a wall of its own (never passage or doorway); keyed Feistel
  permutation; K_n = round(rooms/960); hub share by the fair rule under the
  mirror law; spoke j → hub j mod A_n; hub target rolled per minute epoch
  (`floor(time / 60 000)`). The `line` and `fewest` rules and the `uniform` law
  stay in the artifact only.
- Board row `p-go-*` (portals.yaml) records the decided first build.
- **"Air" is everything a floor looks through, its lens included.** In code a
  theme's look splits in two: per surface (`themeMaterial`, `themeLight`) and
  per frame (`AIR` and the haze's visibility, plus `themeLens`, a full-screen
  pass over the scene). Floor 19's wobbling crayon outlines and floor 60's depth
  greys live in `themeLens`. One frame takes one lens, so the far floor's
  surfaces are drawn in its own theme and the whole frame goes through the lens
  of the floor you stand on; crossing swaps air and lens together. Beat: a lens
  per region of the screen, masked at the door — two full-screen passes, and
  edge-detecting lenses (19's) read neighbouring pixels, so the seam bleeds.
  Vova asked (15 Nov) «"галлюциногенность" это свойства воздуха или темы?»; this
  is the lead's answer, open to his steer.

## Team

- **A — model port**: session_01DaohkBZhj2tHGiYqnTQK1v, branch
  `claude/cube-portals-model`, flagship. Pure module in
  `src/cube/entities/world/model/` with node tests, exported through the world
  slice's `index.ts`; reports its API by `send_message`.
- **B — door view and crossing**: session_01DaohkBaqwW3EMrLSiAmuSU, branch
  `claude/cube-portals-door`, flagship. Builds against a stub of A's shape in
  one file (`(floor, room, wall) → portal | none`,
  `(portal, epochMs) → { floor, room, wall }`), so integration is a one-file
  swap; commits frames under `docs/remove-before-merging/frames/cube-portal-*`.
  Started in parallel with A rather than after it: the view and crossing need
  only a target, not the network that picks it.

## State

- Board v110 published with the `p-go-*` row (commit 268b0a72).
- In flight: A and B (15 Nov, 19:18 / 19:20 UTC).
- Next: as each reports — merge its branch here, look at the frames, put them on
  the board; then swap B's stub for A's export, preview, board.
