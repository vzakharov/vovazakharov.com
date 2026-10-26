import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { framedOf } from '../../model/flight-frame';
import { type Point, wrap } from '../../model/geometry';
import {
  CLUMP_DISTANCE,
  D_SEE,
  gathered,
  groundOfPlane,
  OPENING_EYE,
  project,
} from '../../model/ground';
import { aloftAt } from '../../model/pinhole';
import { OPENING_FEET } from '../../model/placement';
import { bedPlace, onHost } from './bed-place';
import { drawnInsect, type LegFlight } from './insect-drawn';
import { aloftFramed, eyeFrameOf } from './insect-frame';
import { drawnFlier, drawnSitter } from './insect-seat';
import { meadowCamera } from './meadow-camera';
import { tapReach } from './tap-reach';
import { behindHills, type View, viewAt } from './view';

const view = viewAt(meadowCamera(1180, 820), OPENING_EYE);

/** A flight at `x, y` on `on`'s screen, at the clump's depth, in a frame centred on the eye's heading. */
function flightAt(x: number, y: number, on: View = view): LegFlight {
  const frameAt = on.eye.heading;
  const { forward, ...at } = framedOf(
    eyeFrameOf(on),
    frameAt,
    aloftAt(on, { x, y }, CLUMP_DISTANCE),
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
    turn: 0,
    airborne: 1,
  };
}

/** Where `flight` is drawn `along` its frame's px, its turn as given. */
function drawnAlong(flight: LegFlight, along: number) {
  const { turn, at } = flight;
  const moved = {
    ...flight,
    at: { x: at.x + along * Math.sin(turn), y: at.y - along * Math.cos(turn) },
  };
  const middle = drawnInsect(view, moved).posed?.middle;
  assert.ok(middle);
  return middle;
}

/** Where `on` places `flight` `along` its frame's px, before the brow sinks it. */
function placedAlong(flight: LegFlight, along: number, on: View = view) {
  const { turn, at, frameAt, forward, flown, ends } = flight;
  const placed = drawnFlier(
    on,
    aloftFramed(on, frameAt, {
      x: at.x + along * Math.sin(turn),
      y: at.y - along * Math.cos(turn),
      forward,
    }),
    flown,
    ends,
  ).sinking?.placed;
  assert.ok(placed);
  return placed;
}

/** The way from `from` to `to` on the screen, clockwise from up. */
const wayOf = (from: Point, to: Point) =>
  Math.atan2(to.x - from.x, from.y - to.y);

/** The angle between two turns, either way round. */
const apart = (a: number, b: number) => Math.abs(wrap(a - b));

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
    const { x, y } = project(view, groundOfPlane(foot));
    const on = {
      laidFoot: { x, y },
      foot,
      opening: gathered(foot).y,
      stands: bedPlace(view, foot),
    };
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

  it('turns a flier at the screen’s middle as its frame turns it', () => {
    const flight = { ...flightAt(590, 500), turn: -1.1 };
    const posed = drawnInsect(view, flight).posed;
    assert.ok(posed);
    assert.ok(apart(posed.rotation, -1.1) < 0.01);
  });

  it('turns a flier at a wide screen’s side the way a step its way is drawn, bent off its frame’s turn', () => {
    const phoneL = viewAt(meadowCamera(844, 390), OPENING_EYE);
    // Facing out past the side it is at, where phoneL bends the most.
    const flight = { ...flightAt(20, 300, phoneL), turn: -1.1 };
    const posed = drawnInsect(phoneL, flight).posed;
    assert.ok(posed);
    const drawnWay = wayOf(
      placedAlong(flight, -10, phoneL),
      placedAlong(flight, 10, phoneL),
    );
    assert.ok(apart(posed.rotation, drawnWay) < 0.01, String(drawnWay));
    assert.ok(apart(posed.rotation, -1.1) >= 0.15, String(posed.rotation));
  });

  it('points a flier skimming the grass past the brow the way a step its way is placed, not its sinking slide, its seat’s facing kept', () => {
    // Where tabL drew a butterfly leaving on the left: the frame stands it
    // over the grass, which the screen eases it down onto (`aloftFramed`),
    // and its foot is past the brow, which slides it down the screen as it
    // sinks behind it — a slide that is not its way.
    const forward = 13;
    const flight: LegFlight = {
      ...flightAt(590, 500),
      at: { x: 608, y: 449.5 },
      forward,
      zoom: CLUMP_DISTANCE / forward,
      turn: -1.1,
    };
    const posed = drawnInsect(view, flight).posed;
    assert.ok(posed);
    const placedWay = wayOf(placedAlong(flight, -10), placedAlong(flight, 10));
    const slidWay = wayOf(drawnAlong(flight, -10), drawnAlong(flight, 10));
    assert.ok(apart(posed.rotation, placedWay) < 0.01, String(posed.rotation));
    assert.ok(apart(posed.rotation, slidWay) > 0.1, String(slidWay));
    const seated = drawnInsect(view, { ...flight, airborne: 0 }).posed;
    assert.equal(seated?.rotation, -1.1);
  });

  it('turns a flier crossing the brow, as it starts to sink behind it, with no snap', () => {
    // Where phoneL turned a butterfly leaving on the left 0.4 rad in one
    // frame: its foot crossed the brow, which mirrors the foot's rows.
    const frameAt = view.eye.heading;
    const short = D_SEE * 0.99;
    const ahead = {
      x: view.eye.x + Math.sin(frameAt) * short,
      y: view.eye.y + Math.cos(frameAt) * short,
      h: 2.8,
    };
    const { forward, ...at } = framedOf(eyeFrameOf(view), frameAt, ahead);
    const across = (left: number) => {
      const flight: LegFlight = {
        ...flightAt(590, 500),
        at: { ...at, x: at.x - left },
        forward,
        zoom: CLUMP_DISTANCE / forward,
        turn: -1.336,
      };
      const ground = drawnFlier(
        view,
        aloftFramed(view, frameAt, { ...flight.at, forward }),
        0.5,
        {},
      ).sinking?.ground;
      const posed = drawnInsect(view, flight).posed;
      assert.ok(ground && posed);
      const { rotation } = posed;
      return { behind: behindHills(view, ground), rotation };
    };
    const steps = Array.from({ length: 41 }, (_, step) =>
      across(200 + step / 2),
    );
    assert.equal(steps[0]?.behind, false);
    assert.equal(steps.at(-1)?.behind, true);
    const most = Math.max(
      ...steps
        .slice(1)
        .map((step, index) =>
          apart(step.rotation, steps[index]?.rotation ?? step.rotation),
        ),
    );
    assert.ok(most < 0.005, String(most));
  });
});
