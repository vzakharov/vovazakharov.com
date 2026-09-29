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
