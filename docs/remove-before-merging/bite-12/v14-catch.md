# v14-catch — a flier caught in the air shies away with its own voice

## Done

- **Step 1, the model** — `startle` on a flier caught in the air
  (`caughtAloft`: flying a leg, or hovering at an air spot, and not leaving)
  takes its next leg from now (`nextFlight`, so to a perch other than the one
  it was heading to) and marks that leg `shied` (the leg's count). The dart
  itself is `model/insect-dart.ts`: `dartAt`, an offset in the insect's sizes
  that rises to its kind's `reach` over its `rise` (a third of the flight at
  the most) and eases back to exactly 0 on arrival, so the leg still lands on
  its perch; `dartWay`, away from the finger, never down, lifting a little.
  One leaving still swallows the tap. Tests: `insect-dart.test.ts`,
  `insects.test.ts`; `game.test.ts`'s startle test now expects a leg from a
  catch in the air.

- **Step 2, the scene** — the tap handler in `insect-view.ts` checks
  `caughtAloft` at the tap: caught in the air, it stores `dartWay` from the
  finger to the insect's drawn middle (`Shown.dartWay`) and plays
  `MeadowSound.shy(kind)`; otherwise the take-off voice as before. Each frame
  of a leg `isShying` lays `dartAt × dartWay` (in the insect's size in its
  frame) over the steered point, before the plane mapping, so the drawn
  point, the hit circle and the next leg's start all carry it. `SHY` voices
  in `insect-voices.ts`: a butterfly's trill tumbling down an octave higher
  and quicker; a fly's high, thin whine sliding up; a bee's buzz pitched up
  and sharpened, sliding up.

## Left

- The play run, for the flier watch's bounds with a catch in the air (the
  play run does not tap fliers in flight today, so it will not exercise the
  dart unless taught to).

## Decided

- A new leg, not a burst on the current one: a leg cut short mid-air is
  already drawn from where the flier was (`reconcile`), carrying its speed,
  and the new perch reads as "it went elsewhere, scared".
- A dart never goes down (the ground rule) and turns the body none, as hops
  do, so the turn-rate bound is untouched; its step is under a third of a size
  per frame on the shortest leg any kind flies.
- A hover at a spot in the air counts as caught in the air.
- A buzz's beat oscillator now slides with the wing's (`glide`), where it
  stayed put before: the take-off buzz's tail beats at its 1.3% detune
  instead of drifting ~10% off.
- `insect-view.ts` stands at 456 lines.
