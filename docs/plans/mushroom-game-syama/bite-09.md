# Bite 9 — The operator's two ideas weighed, and the meadow on the ground

What bite 9 built, as `## Eaten so far` in `docs/plans/mushroom-game-syama.*.md` indexes it.

9. **The operator's two ideas weighed, and the meadow on the ground.** A
   grown mushroom takes a foot of its own on the ground, picked where it
   fits, and the seeded flowers stand on that ground too. The two Russian documents are in
   `docs/remove-before-merging/ideas/` (`idea-1-walking-meadow.md`,
   `idea-2-flower-keyboard.md`), posted on the PR (comment 5889105662),
   waiting for the operator's call. What the next bites build on:
   - `model/ground.ts`: `Ground {x, z}` in the clump's units, `Camera`,
     `project` (screen position, scale, haze, depth), `depthScale`, `hazeAt`,
     `frameFor`, `fitCamera(screen, lens, shown)` — the lens carries the
     reach, edge margin and floor that live in ui code. A rotation or
     resize builds a new camera and moves nothing on the ground.
   - `clump-layout.ts` stands the opening clump on one ground table
     (`standOn(camera, foot, size, splay)`); `layout.ts` exposes
     `ZOOM_FLOOR`, `meadowCamera`, `MeadowLayout.camera`. Landscape screens
     show the clump about half its old size with meadow round it (tabL 361 →
     171 px), accepted: one world while there is no pan, and in line with
     "объекты великоваты".
   - `ui/scene/mushroom-tap.ts`: a mushroom's tap area is what is drawn
     until its head is drawn narrower than `FINGER_ACROSS` (60.8 px); then
     it also holds a `TAP_RADIUS` circle round the head's middle, which never
     takes a tap from another mushroom's drawn body. A finger's target rests
     on this pad, not on a raised zoom floor.
   - **The rules hold on the screen a mushroom grows on.** `frameFor` is
     this screen's own, and the camera fits it; a turn or a resize refits
     the camera over every foot the meadow has used (`meadowLayout`'s `used`, the scene's `usedIn`), each cap inside the
     edge margin and each flower's head in view, zooming out past the zoom
     floor where the new screen is narrower (a phone turned upright from
     landscape). Every camera looks from one angle, `UP_PER_Z` 0.481, so a
     turn's refit is a scaled copy of the picture the child grew and every
     rule it grew under still holds after it — door in sight, cap and stem
     cover, off the controls, flowers in sight — asserted in
     `meadow-rules.test.ts` and `flower-layout.test.ts`. On a short screen
     the mushrooms' least size gives way, not the sky.
   - `model/placement.ts`: `pickFoot` takes the best of `ROUNDS` (32)
     candidate feet by the new mushroom's seed; `Planted.foot`, and the
     `grow` action carries it. `ui/scene/mushroom-room.ts` `roomFor` checks
     a foot on this screen, `cap-cover.ts` how much of a cap and of a stem the nearer mushrooms
     hide, and
     `+` shakes its head when no foot passes; `keptRoom` finds the room
     again once the layout, the mushrooms or the plantings change. The
     meadow holds up to six as far as there is room. The suite holds six
     in at least 99% of every tenth visit (every twentieth on the small
     phone), and on a tablet held sideways a median span of the six caps
     of at least 60% of the width (`layout.test.ts`);
     `pnpm sweep:mushrooms` grows all 2000 visits on every screen and prints the
     share reaching six, the caps' median span and the most of any cap and
     stem hidden, which is where any figure for the whole of the visits
     comes from. Feet keep a 0.2 foot distance from flowers rather than the
     rule a flower keeps off a foot (`clearOfFeet`), which rejected ~13×
     more feet than every other rule together. Forest mushrooms shrink
     with depth by the clump's `scaleAt`, and the zoom floor is where the
     clump's narrowest cap is a finger wide (99 px); `mushroom-tap.ts`'s
     finger pad holds the far caps' taps, switching on for a third to three
     quarters of a phone's grown forest. Insects keep their least size
     however small the clump (bite 10). On
     a 280 px phone upright a widest-gene cap on the frame's near corners
     stands past the edge margin, accepted and named in `ground.test.ts`.
   - Seeded flowers (`seededBed`, `flowersOn`, `flowerFeet`) spread over
     the frame of the screen the visit opens on, and the refit keeps every
     one in view. A bee sits no nearer a flower's middle than `FACE_REACH`. The bees' slots are two rings in ground
     steps, the second of twelve at 2.3 of the parent's size, so a full
     forest plants a median of 5–7, and `LEAST_PLANTED` 4 holds on every
     screen, the small phone included. A butterfly takes up to twice
     its flight time (`slowest` 2) so a desktop's wide meadow still lets a
     finger catch it 7 times in 10.
   - `placeSun` shrinks the sun until its rays clear each opening mushroom's
     reach — 24 → 16 px, on the small phone sideways only.
   - Shared bases `Layered`, `Framed`, `Screened`; `Camera.midline`. The
     mushroom suite runs 51 files in ~270 s, none over 60 s, one file at a
     time (all of them in one `node --test` call exceeds the tool limit);
     `layout.test.ts` and `meadow-rules.test.ts` sweep placed meadows on
     the screen and its turn. The play run checks a full forest's planting
     by counting free bee slots, not by watching bees plant.
   - The first idea is still the operator's to place; their calls on it so
     far are that document's «Что ты решил» (review 5355192406: one-finger
     drag, hidden cursor keys, a turn as a crop, flat ground, a schematic
     map, insects perching where they like).
   - **Review 5356809390's calls**, decided before the fixes:
     - **Each screen lays out at its own width.** The common frame of
       this screen and its turn is dropped: `+` checks a foot on this
       screen only, and a turn or resize refits the camera so every foot
       already used (mushrooms and flowers) stays in view, zooming out
       where the new screen is narrower. Nothing moves on the ground.
       This beat scoping the turn guard to coarse pointers, which leaves
       tablet landscape — the primary layout — crowded, and beat pulling
       item 11's crop forward, which without a pan hides what a turn
       crops away. Item 11 turns the refit into a crop once there is a
       pan.
     - **Forest mushrooms shrink with depth** as the clump does
       (`scaleAt`), and the zoom floor comes down so `mushroom-tap.ts`'s
       finger pad is what holds a far cap's tap. The pad stays.
     - **Every camera looks at the meadow from one angle**: the
       foreshortening is the meadow's, not the screen's, and a screen
       picks only the unit and how much ground it shows. A turn's refit is
       then a scaled copy of the picture the child grew on, so what
       overlaps (doors in sight, hidden caps, flowers under caps) is what
       it was before the turn. `seen` is true on every camera, and
       `FORESHORTENING` narrows to that one value. This beat measuring
       each rule with each camera's own foreshortening: the own-width
       refit let a turn break door-in-sight in 9 of 13 swept phone
       meadows and hide 71% of the flowers.
     - **The angle is `UP_PER_Z` 0.481, and on a short screen the
       mushrooms' minimum size gives way, not the sky.** At that angle a
       phone held sideways (844×390) needs 63% of its height for ground
       at the 127 px minimum, which starves the sky: the sun shrinks to
       radius 8 and no sun fits at ~300 px tall. Letting the minimum go
       (81 px there, 4.6 units across) keeps sky, buttons and sun as
       they were, and it is the direction T98's lower zoom floor and
       "объекты великоваты" already point. The four tests that encode
       the old minimum (smallest cap a finger wide, outline detail an
       ink line, butterfly narrower than any cap, the finger-pad sweep)
       are rewritten with T98: the finger pad holds the tap, and the
       ink and butterfly floors are restated against the new least
       size. This beat keeping the minimum (starved sky, a throwing
       layout on short screens) and a second angle for short screens
       (reopens the one-angle call).
   - Review 5356809390 (T96–T107) is handled, every thread answered.
