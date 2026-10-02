import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { framedOf } from '../../model/flight-frame';
import { CLUMP_DISTANCE, OPENING_EYE, project } from '../../model/ground';
import { OPENING_FEET } from '../../model/placement';
import { bedPlace, onHost } from './bed-place';
import { drawnInsect, type LegFlight } from './insect-drawn';
import { aloftAt, eyeFrameOf } from './insect-frame';
import { drawnFlier, drawnSitter } from './insect-seat';
import { meadowCamera } from './meadow-camera';
import { tapReach } from './tap-reach';
import { viewAt } from './view';

const view = viewAt(meadowCamera(1180, 820), OPENING_EYE);

/** A flight at `x, y` on the screen, at the clump's depth, in a frame centred on the eye's heading. */
function flightAt(x: number, y: number): LegFlight {
  const frameAt = view.eye.heading;
  const { forward, ...at } = framedOf(
    eyeFrameOf(view),
    frameAt,
    aloftAt(view, { x, y }, CLUMP_DISTANCE),
  );
  return {
    frameAt,
    at,
    forward,
    zoom: CLUMP_DISTANCE / forward,
    offset: { x: 0, y: 0 },
    sunk: 0,
    flown: 0.5,
    ends: {},
    sitting: false,
    presence: 1,
    above: 7,
    span: 40,
  };
}

describe('drawnInsect', () => {
  it('draws a flier where it veers to, its shadow laid, a finger’s reach round it', () => {
    const flight = flightAt(600, 300);
    const drawn = drawnInsect(view, flight);
    const veered = drawnFlier(
      view,
      aloftAt(view, { x: 600, y: 300 }, CLUMP_DISTANCE),
      0.5,
      {},
    );
    const middle = veered.sinking?.drawn;
    assert.ok(drawn.posed && middle);
    assert.ok(
      Math.hypot(
        drawn.posed.middle.x - middle.x,
        drawn.posed.middle.y - middle.y,
      ) < 1e-6,
    );
    assert.equal(drawn.posed.depth, 7);
    const { zoom } = drawn.posed.middle;
    assert.equal(drawn.posed.hit, tapReach((40 * zoom) / 2) / zoom);
    assert.ok(drawn.shadow);
  });

  it('hides a flier past the screen’s edge, still giving where it was veered to', () => {
    const drawn = drawnInsect(view, flightAt(-400, 300));
    assert.equal(drawn.posed, undefined);
    assert.ok(Number.isFinite(drawn.aloft.x));
  });

  it('draws a sitter where its host draws its seat, sunk by its bob, its nectar unzoomed about it', () => {
    const foot = OPENING_FEET[0];
    const { x, y } = project(view, foot);
    const on = { laidFoot: { x, y }, stands: bedPlace(view, foot) };
    const laid = { x, y: y - 60 };
    const nectar = { x: x + 10, y: y - 55 };
    const seat = { ...laid, on, drawn: onHost(on, laid), nectar };
    const flight = { ...flightAt(600, 300), seat, sitting: true, sunk: 2 };
    const drawn = drawnInsect(view, flight);
    const sat = drawnSitter(view, seat, { x: 0, y: 2 });
    assert.ok(drawn.posed && sat);
    assert.deepEqual(drawn.posed.middle, sat);
    const there = onHost(on, nectar);
    assert.ok(drawn.posed.nectar);
    assert.ok(
      Math.abs(drawn.posed.nectar.x - (sat.x + (there.x - sat.x) / sat.zoom)) <
        1e-9,
    );
  });
});
