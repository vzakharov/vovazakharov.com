# Bite 9 — what the fold into the plan carries

- **tap** (76c14ae8): `ui/scene/mushroom-tap.ts` — a mushroom's tap area is
  exactly what is drawn until its head is drawn narrower than `FINGER_ACROSS`
  (60.8 px); then it also holds a `TAP_RADIUS` circle round the head's middle,
  which never takes a tap from another mushroom's drawn body, the nearest
  padded centre winning where no drawn part holds the tap. Flowers already
  had the floor (`tapReach(headR * 1.2)`). Open: `mushroom-genes.test.ts`'s
  63 px narrowest-cap test samples 2000 seeds without the lean (40 000 with it
  find 61.9 px); the pad switches on at once, not gradually; a padded mushroom
  in front of a flower's head could take its tap (nothing today is that
  small).
- **ground** (379346ef, 016e2a99): `model/ground.ts` — `Ground {x, z}` in
  clump units, `Camera`, `project`, `depthScale`, `hazeAt`, `COMMON_FRAME`,
  `inFrame`, `fitCamera(screen, lens)` (the lens carries reach, edge margin
  and floor, which live in ui code); `clump-layout.ts` one ground table and
  `standOn(camera, foot, size, splay)`; `layout.ts` `FOREST_FEET`,
  `ZOOM_FLOOR`, `meadowCamera`, `MeadowLayout.camera`. The clump porcini's
  shifts moved back (front `{0.12, 0.12}`, back `{-0.03, 0.24}`) so phoneL's
  cover is 23.1% (was 26%), back doors ≥ 80.7%, back caps ≥ 51.7%. Landscape
  clump about half its old size (tabL 361 → 171 px), accepted. A per-drawn-cap
  zoom floor (142.6 px) was tried and dropped for the tap pad: its work is
  in 1da10538's `ground.patch`.
