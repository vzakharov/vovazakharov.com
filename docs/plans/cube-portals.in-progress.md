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

Not yet answered; the defaults below are what is being built.

1. View through an open portal door — default: the far room at your size, as you
   will stand in it once through (a window into it), not the true-scale
   dollhouse of `p-look-scale`.
2. Crossing — default: instant at the threshold, the URL switching to the far
   floor and room; no size slide.
3. Way back — default: nothing extra. The spoke you step out of leads back to
   its hub; the browser's Back is the other way.
4. Branch — default: this branch and PR #283, its squash subject becoming the
   game's `feat` once portals ship.

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
