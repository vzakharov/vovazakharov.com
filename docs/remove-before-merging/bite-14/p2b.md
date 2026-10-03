# Bite 14 — P2b hand-over: sprouting's scene, the rest

## Done

- `ui/scene/mushroom-shown.ts`: `Shown` keeps `Pick<Planted, 'foot' |
'lean' | 'sprout'>` (`SHOWN_OF`, so it and `Planted` share no hand-spelled
  base); `plantedAt` is the spores' landing, `(sprout.at + SPORE_FALL_MS) /
1000`, for a sprout.
- `ui/scene/mushroom-bed.ts` (427 → 429): `update` multiplies
  `sproutScale(sprout, t * 1000)` into `grown` and hides body and shadow
  while it is 0; `reconcile` hands every newborn to `driftSpores`;
  `inSight(id)` is `footShown`; `tap`'s crown is `crownOf`.
- `ui/scene/spore-drift.ts` (call 19): `driftSpores(scene, voice, born,
shown, depth)` — a newborn without `sprout` puffs and plays grow where it
  stands (the bed's old branch, moved here); per parent, a puff from its
  crown and `DOTS` 4 spore dots per sprout on staggered arcs crown → foot
  over `SPORE_FALL_MS`, both ends read every frame, then a small puff and
  grow at the foot. `crownOf(genes)` is shared with the bed's `tap`.
- `ui/scene/spores.ts`: `drawnAt(body, point)` out of `puffFrom`, used by
  the drift too.
- `ui/scene/meadow-scene.ts` (446 → 448): the tick carries
  `shed: shedNow(scened, bed, time)`.

## Decided here

- The newborn puff + grow moved out of the bed into `driftSpores`, so the
  bed's reconcile has one call for both kinds of newborn and the bed stays
  at +2 lines rather than ~+15.
- `driftSpores` takes the bed's `shown` map rather than a lookup closure
  (shorter call, same contract).

## Looked at (tabL, phoneP; seeded meadow, cloud tapped, stepped past the stop)

- The shed works: 3 sprouts of `mushroom-1` at the stop, hidden for 0.7 s,
  then popping up (scale 0 → 0.4 with the emerge overshoot), ~1.4× larger
  20 s later. The parent's crown puff shows.
- **The falling dots were not seen in any frame** — unverified, not known
  broken. Phaser's tweens run on `Date.now()` (TweenManager.getDelta, with
  lag-skip), not on the stepped game clock, so the probe's frames show
  tween-driven things (every puff, the drift) out of step with the game.
  Patching `Date.now` onto the stepped clock in a scratch driver opened
  the puff on time but still showed no separate dots at +24 frames.
  Next: in the page, list `scene.children` Arcs at depth 1e5 at +12/+24
  frames (position, visible, radius) to see whether `fall`'s dots exist and
  where; check `tween.getValue()` in `onUpdate` is not `null`.
- Call 21's risk is visible: on tabL two of the three sprouts stand behind
  the parents' caps (feet at css (679,585) and (553,584), the caps there),
  peeking out above them at +120; one stands clear at (425,734).

## Left

- Settle the dots as above; then P3's design (spec-sprouting § 4 step 3)
  is not written here. For P3: drive tweens on the stepped clock or the
  drift cannot be judged from frames.
