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
- A done and merged (873652c1, head fcf2cbdc; 196 world-model tests green;
  session archived). API: `portalAt`, `portalsOf`,
  `portalTarget(rolled, portal, toward, epochMs)`, `PORTALS`. A's calls left to
  B: landing room by `toward`, turning the player between east and south walls,
  making a portal wall a door to `isDoor`. Its permutation draws 128 bits (floor
  66's halves are 65), so numbers differ from the artifact's.
- B told to merge this branch and build on A's API directly, the stub dropped.
- Vova on the lens-with-air call (15 Nov): «это классно, да. посмотреть на
  глючный этаж обычными глазами, а потом "вглючиться" в него -- то что надо»;
  asked for a picture of floors 19 and 60 seen from 6 — in progress (a
  background agent shooting real frames into `tmp/portal-mock/`, editing sources
  temporarily: commit only named paths until it reports). On 60 looking like
  plain grey rooms from 6: «и в этом соль. как будут готовы кадры -- их нужно,
  сравнительно, на доску» — the frames go on the board side by side.
- Vova (15 Nov): «давай, в плане tutorial-изинга, сделаем вывеску "this door is
  special" со стрелкой на первой портальной двери». The first portal door is
  floor 6's one portal (K_6 = 1), the first anyone meets on the way down.
  Package C, a child of its own, in parallel with B
  (session_01DaohkF9EgJ1vbFMMUUY4bS, branch `claude/cube-portals-sign`). Then:
  «определение "это первая портальная дверь в игре" сделать программно лучше» —
  derived as `PORTALS.first`'s portal 0, never floor 6 by hand; sent to C.
- Vova on a lock after crossing so you cannot step straight back: «сейчас
  конечно не надо, но на подумать» — on the board as `p-go-lock`, not built.
- C done and merged (8ae95e85, head fac5e517; session archived), then narrowed
  to portal number 0 (d84141e9). A board on both faces of the first portal's
  wall, `hintsSeen` in world/model/hint.ts, drawn in
  pages/cube/ui/hint-board.ts; `pnpm hint:cube` shoots it. Left for after B
  merges: the far room's FOR SALE sign covers the board while the portal wall is
  a plain wall; B's `isDoor` counting portals should move it — check the
  far-side frames then. Board v113.
- C's late `firstPortal` (named function, test) merged over the lead's inline
  filter (ab1afb06).
- B reported (head d6659a08) on the stub, never having merged A: door, far view
  in this floor's air, minute swap, crossing, URL (`fell` byte in the address,
  pushState, Back via popstate). Frames on the board (v113→v114, zone
  `z-portal-door`). Sent back to merge this branch, swap the stub for A's model,
  rename the reference model to `.js.txt` (it breaks eslint), reshoot door and
  sign frames with the real network, check the far-side sale sign.
- Vova on the sign (15 Nov): «давай "SOME DOORS ARE SPECIAL", и поменьше надпись
  таки» — sent to B with the integration (≈0.8 × 0.4 m board).
- Next: B's report — merge, look at frames, board, preview; then `vet.sh`.
