# Handle bite 11 — groups

Three Opus agents over one tree, split so no two edit the same module:

- **pan** — T120 (keys add up), T124 (hard ends), T125 (lag by the slop, never the first step), T122 (24 px slop, glide only on post-crossing velocity), T127's `isMoving` and `tick` bullets. Owns `model/pan.ts`, `model/pan.test.ts`, `keyboard.ts` if T120 needs it.
- **taps** — T121 (a press that pans never taps; lift or 150 ms rest taps; the dip on press). Owns a new pure `model/press.ts` with its test, `pan-input.ts`, the tap routing in `meadow-scene.ts`, the dip's drawing, `scripts/lib/play-pan.ts`.
- **room** — T123 (head-share floor over the opening crop and a world end), T127's other bullets (split `mushroom-room.ts`, `FLOWER_SPOTS.portrait`, `bite-11/flowers.md`'s wording). Owns `mushroom-room.ts` and what it splits into, `mushroom-patch.test.ts`, `flower-layout.ts`, `docs/remove-before-merging/bite-11/flowers.md`.

T126 (phoneL pan room, portrait ends) is decided in the plan as an accepted cost; the orchestrator replies.
