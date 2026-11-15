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

- (none yet)

## State

- Board v110 published with the `p-go-*` row (commit 268b0a72).
- Built: nothing in `src/cube` yet.
- Next: package A — the model port (child session), then package B — the door
  view and the crossing, on A's API.
