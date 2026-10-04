import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  FLIGHT_HABITS,
  flightAway,
  perchName,
  type Place,
  type Places,
} from './flight';
import { legTo } from './flight-timing';
import { CLUMP_DISTANCE } from './ground';
import { mulberry32 } from './random';

const fly = 'fly' as const;
const { cruising } = FLIGHT_HABITS[fly];
const across = (x: number): Place => ({ x, y: 0, fromEye: CLUMP_DISTANCE });
const [from, to] = [
  { kind: 'cap', id: 'mushroom-1' } as const,
  { kind: 'cap', id: 'mushroom-2' } as const,
];
/** A fly's leg between two caps 100 sizes apart, flown over a second. */
const leg = {
  ...legTo(mulberry32(1), FLIGHT_HABITS[fly], { from, to }, { now: 0 }),
  departs: 0,
  arrives: 1000,
};
/** Both away spots 5 sizes short of the leg's start. */
const places = {
  [perchName(from)]: across(0),
  [perchName(to)]: across(100),
  'away left': across(-5),
  'away right': across(-5),
};
const insect = { id: 'fly-1', seed: 3, kind: fly, leg, legs: 1 };

/** How long `flightAway` takes `insect` out from `now`, the scene having drawn it at `drawn`, by id, and its away spots at `aways`. */
function awayFlown(
  now: number,
  drawn?: Readonly<Record<string, Place>>,
  aways?: Readonly<Record<string, Places>>,
) {
  const away = flightAway(insect, now, {
    places,
    ...(drawn && { drawn }),
    ...(aways && { aways }),
  });
  return away.leg.arrives - away.leg.departs;
}

/** Whether `flown` ms is `apart` sizes at the fly's cruise, within 1%. */
function atCruise(flown: number, apart: number): void {
  const cruise = (1000 * apart) / cruising;
  assert.ok(
    Math.abs(flown - cruise) < cruise * 0.01,
    `took ${String(flown)} ms, its ${String(apart)} sizes at cruise ${String(cruise)}`,
  );
}

describe('a leg set off mid-flight', () => {
  it('is timed from where the scene drew the insect, given its place', () => {
    atCruise(awayFlown(100, { 'fly-1': across(90) }), 95);
  });

  it('falls back to its share of the time flown, given no place for it', () => {
    atCruise(awayFlown(100, { 'fly-2': across(90) }), 15);
    atCruise(awayFlown(100), 15);
  });

  it('is timed from its perch once it has landed, wherever it was drawn', () => {
    atCruise(awayFlown(1500, { 'fly-1': across(90) }), 105);
  });

  it('is timed from where it was drawn once landed on a perch the sight no longer places', () => {
    const { [perchName(to)]: _, ...turnedOff } = places;
    const away = flightAway(insect, 1500, {
      places: turnedOff,
      drawn: { 'fly-1': across(60) },
    });
    atCruise(away.leg.arrives - away.leg.departs, 65);
  });
});

describe('a leg to away', () => {
  /** Both away spots 20 sizes past the leg's end. */
  const farther = { 'away left': across(120), 'away right': across(120) };

  it('is timed to where the scene draws that insect leaving, given its spots', () => {
    atCruise(awayFlown(1500, undefined, { 'fly-1': farther }), 20);
  });

  it("is timed to the sight's away spots, given none for that insect", () => {
    atCruise(awayFlown(1500, undefined, { 'fly-2': farther }), 105);
  });
});
