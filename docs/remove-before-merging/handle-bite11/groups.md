# Handle bite 11 — groups

Opus agents split so no two edit the same module:

- **pan** — T120 (keys add up), T124 (hard ends), T125 (lag by the slop, never the first step), T122 (24 px slop, glide only on post-crossing velocity), T127's `isMoving` and `tick` bullets. Owns `model/pan.ts`, `model/pan.test.ts`, `keyboard.ts` if T120 needs it.
- **room** — T123 (head-share floor over the opening crop and a world end), T127's other bullets (split `mushroom-room.ts`, `FLOWER_SPOTS.portrait`, `bite-11/flowers.md`'s wording). Owns `mushroom-room.ts` and what it splits into, `mushroom-patch.test.ts`, `flower-layout.ts`, `docs/remove-before-merging/bite-11/flowers.md`.

T121 (taps on the press) and T126 (phoneL pan room, portrait ends) are decided in the plan as accepted costs, T121 by the operator after playing the build; the orchestrator replies. Two agents over one tree.
