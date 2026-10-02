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

## Left

- Step 2, the scene: lay `dartAt × dartWay` over the flight in
  `insect-view.ts` while `isShying`, the way computed at the tap; shy voices
  per kind in `insect-voices.ts`, played in place of the take-off voice on a
  catch in the air.

## Decided

- A new leg, not a burst on the current one: a leg cut short mid-air is
  already drawn from where the flier was (`reconcile`), carrying its speed,
  and the new perch reads as "it went elsewhere, scared".
- A dart never goes down (the ground rule) and turns the body none, as hops
  do, so the turn-rate bound is untouched; its step is under a third of a size
  per frame on the shortest leg any kind flies.
- A hover at a spot in the air counts as caught in the air.
