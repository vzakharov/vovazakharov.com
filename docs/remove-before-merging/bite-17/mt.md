# mt — the moon's tap brought rain instead of morning

## Cause

A game bug, not the harness. A tap on the moon's face started a shower
instead of turning the light back to day. That happened whenever a cloud stood
just beside the moon. `tapMeadow` asked the clouds before the sun and moon, and
`cloudAt` tests a cloud's widest possible puff box plus a finger's reach. That
box runs past the puffs actually drawn, so it covered the moon's bare disc.

In the `dusk` play on tabL, the probe showed cloud 2 at (623, 197) and the moon
at x 711. Right after the tap, `rain.tapped` was 2 and a shower was running,
while the dusk stayed at `level 1, toward dusk`. The `dusk-moon` frame shows
the tap point on the moon's bare face, above and to the right of the cloud's
drawn puffs. The play turned red because the butterfly roost wait (203beb8)
made the play longer, so the clouds drifted to that spot before the moon's tap.
The play aims correctly: `sunAt` is where the full-dusk moon stands.

## Fix

- `dusk-sky.ts` `onTheSun(sun, at, within)`: `'disc'` lands within the
  drawn disc radius `r`. `'rays'` lands within `duskReach`, as before.
- `dusk-view.ts` `tap` passes `within` through.
- `meadow-taps.ts` `tapMeadow`: the sun or moon on its own disc comes first,
  then a cloud, then the sun or moon by its rays. A tap on a cloud that lies
  in front of the disc now turns the light rather than starting rain. This is
  rare, and either response is a fair answer to that tap.
- `dusk-sky.test.ts`: the disc reach is covered.

## Checks

- `dusk` play on tabL and phoneP: both green, the morning shot on both, with
  no harness red at all. Frame budget 20.0 / 23.0 ms median.
- `dusk-sky.test.ts` 25/25, `rain-sky.test.ts` 28/28, typecheck, eslint.

Nothing left.
