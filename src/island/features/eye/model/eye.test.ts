import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cross,
  dot,
  latLonToUnit,
  northAt,
  R,
  unit,
  unitToLatLon,
  type Vec3,
} from '@/island/shared/globe';

import {
  CLIMB_DOUBLINGS_PER_SECOND,
  type Eye,
  eyeAt,
  type GroundAt,
  headingOf,
  HEIGHTS_PER_SECOND,
  type Intent,
  ISLAND_OPENING,
  MAX_HEIGHT,
  MIN_HEIGHT,
  step,
  STILL,
  TURN_RADIANS_PER_SECOND,
  withHeading,
  withHeight,
} from './eye';
import { shortest } from './turns';

const FRAME = 1 / 60;
const DEGREE = Math.PI / 180;
/** The island's opening place, and east and north there. */
const CENTRE = latLonToUnit(ISLAND_OPENING);
const EAST: Vec3 = [0, 0, -1];
const NORTH = northAt(CENTRE);
const flat: GroundAt = () => 0;
/** Raised ground more than 50 m east of the island's centre. */
const cliff: GroundAt = (p) => (dot(p, EAST) * R > 50 ? 500 : 0);
const sea: GroundAt = () => -3000;

/** `eye` stepped by `intent` for `seconds`, frame by frame, each frame seen. */
function hold(
  eye: Eye,
  intent: Intent,
  seconds: number,
  groundAt = flat,
  seen?: (eye: Eye) => void,
): Eye {
  let now = eye;
  for (let t = 0; t < seconds - 1e-9; t += FRAME) {
    now = step(now, intent, FRAME, groundAt);
    seen?.(now);
  }
  return now;
}

const between = (a: Vec3, b: Vec3) =>
  Math.atan2(Math.hypot(...cross(a, b)), dot(a, b));

/** At the island's opening place, `height` up, facing `heading`. */
const atCentre = (height: number, heading = 0) =>
  eyeAt({ ...ISLAND_OPENING, height, heading }, flat);

const climbing: Intent = { ...STILL, climb: 1 };
const falling: Intent = { ...STILL, climb: -1 };
const forward: Intent = { ...STILL, steer: [0, 1] };

describe('climbing on the sphere', () => {
  it('doubles the height every 1/CLIMB_DOUBLINGS_PER_SECOND seconds while held', () => {
    const settled = hold(atCentre(100), climbing, 1);
    const later = hold(settled, climbing, 1 / CLIMB_DOUBLINGS_PER_SECOND);
    assert.ok(Math.abs(later.height / settled.height - 2) < 0.02);
  });

  it('falls from orbit to the ground in about nine seconds', () => {
    let eye = atCentre(MAX_HEIGHT);
    let seconds = 0;
    while (eye.height > MIN_HEIGHT * 1.01 && seconds < 30) {
      eye = step(eye, falling, FRAME, flat);
      seconds += FRAME;
    }
    assert.ok(seconds > 8 && seconds < 11, `took ${seconds} s`);
  });

  it('stays between MIN_HEIGHT and MAX_HEIGHT', () => {
    const low = hold(atCentre(10), falling, 5);
    assert.equal(low.aim.height, MIN_HEIGHT);
    assert.ok(low.height >= MIN_HEIGHT && low.height < MIN_HEIGHT + 1e-6);
    const high = hold(atCentre(1e6), climbing, 10);
    assert.equal(high.aim.height, MAX_HEIGHT);
    assert.ok(high.height <= MAX_HEIGHT && high.height > MAX_HEIGHT - 1);
  });

  it('jumps to a height at once with withHeight', () => {
    const eye = withHeight(atCentre(1000), 50);
    assert.equal(eye.height, 50);
    assert.equal(step(eye, STILL, FRAME, flat).height, 50);
  });
});

/** Metres crossed in one second of held steering, once settled. */
const pace = (height: number) => {
  const settled = hold(atCentre(height), forward, 1);
  return between(settled.at, hold(settled, forward, 1).at) * R;
};

describe('moving on the sphere', () => {
  it('crosses HEIGHTS_PER_SECOND heights a second, as fast as it is high', () => {
    assert.ok(Math.abs(pace(100) / (100 * HEIGHTS_PER_SECOND) - 1) < 0.01);
    assert.ok(Math.abs(pace(100_000) / pace(10) / 10_000 - 1) < 1e-6);
  });

  it('turns screen-up into the heading, and strafes square to it', () => {
    const east = hold(atCentre(100, Math.PI / 2), forward, 1);
    assert.ok(dot(east.at, EAST) * R > 50);
    assert.ok(Math.abs(dot(east.at, NORTH) * R) < 1e-6);
    const south = hold(
      atCentre(100, Math.PI / 2),
      { ...STILL, steer: [1, 0] },
      1,
    );
    assert.ok(dot(south.at, NORTH) * R < -50);
    assert.ok(Math.abs(dot(south.at, EAST) * R) < 1e-6);
  });

  it('moves a drag of one height by one height', () => {
    const eye = hold(
      step(atCentre(300), { ...STILL, shift: [1, 0] }, FRAME, flat),
      STILL,
      2,
    );
    assert.ok(Math.abs(dot(eye.at, EAST) * R - 300) < 0.01);
  });

  it('crosses the pole on a straight line, screen-up held, from 80° N', () => {
    const start = eyeAt(
      { lat: 80 * DEGREE, lon: 0.3, height: 1_000_000 },
      flat,
    );
    const plane = unit(cross(start.at, start.ahead));
    let nearest = 0;
    const end = hold(start, forward, 5, flat, (eye) => {
      assert.ok(Math.abs(dot(eye.at, plane)) < 1e-9);
      assert.ok(Math.abs(dot(eye.ahead, plane)) < 1e-9);
      // Ahead is the circle's own direction of travel, never turned off it.
      assert.ok(dot(eye.ahead, cross(plane, eye.at)) > 1 - 1e-9);
      nearest = Math.max(nearest, unitToLatLon(eye.at).lat);
    });
    assert.ok(nearest > 89.9 * DEGREE, `got to ${nearest / DEGREE}°`);
    const { lat, lon } = unitToLatLon(end.at);
    assert.ok(lat < 60 * DEGREE);
    assert.ok(Math.abs(Math.abs(lon - 0.3) - Math.PI) < 1e-9);
    assert.ok(Math.abs(Math.abs(headingOf(end)) - Math.PI) < 1e-9);
  });

  it('turns at the pole, then steers along the turned heading', () => {
    const pole = eyeAt({ lat: Math.PI / 2, lon: 0, height: 100_000 }, flat);
    const turned = hold(
      step(pole, { ...STILL, twist: Math.PI / 2 }, FRAME, flat),
      STILL,
      2,
    );
    assert.ok(Math.abs(turned.at[1] - 1) < 1e-12);
    const moved = hold(turned, forward, 1);
    const { lat, lon } = unitToLatLon(moved.at);
    assert.ok(lat < 89.5 * DEGREE);
    // North at the pole is the +X meridian's; a quarter turn clockwise is 90° E.
    assert.ok(Math.abs(lon - Math.PI / 2) < 1e-5, `lon ${lon / DEGREE}°`);
  });
});

describe('turning on the sphere', () => {
  const right: Intent = { ...STILL, turn: 1 };

  /** Radians a held turn key turns the eye in one second at `height`, once settled. */
  const rate = (height: number) => {
    const settled = hold(atCentre(height), right, 1);
    const later = hold(settled, right, 1);
    return shortest(headingOf(later) - headingOf(settled));
  };

  it('turns clockwise at TURN_RADIANS_PER_SECOND, the same at every height', () => {
    assert.ok(Math.abs(rate(100) / TURN_RADIANS_PER_SECOND - 1) < 0.01);
    assert.ok(Math.abs(rate(MAX_HEIGHT) - rate(MIN_HEIGHT)) < 1e-9);
  });

  it('glides through a twist rather than stepping', () => {
    const first = step(atCentre(100), { ...STILL, twist: 1 }, FRAME, flat);
    assert.ok(headingOf(first) > 0 && headingOf(first) < 0.2);
    assert.ok(Math.abs(headingOf(hold(first, STILL, 2)) - 1) < 1e-3);
  });

  it('moves forward along the heading it has turned to', () => {
    const turned = hold(
      step(atCentre(100), { ...STILL, twist: Math.PI }, FRAME, flat),
      STILL,
      2,
    );
    const moved = hold(turned, forward, 1);
    assert.ok(dot(moved.at, NORTH) * R < -50);
    assert.ok(Math.abs(dot(moved.at, EAST) * R) < 1e-3);
  });

  it('turns to a heading at once with withHeading', () => {
    const eye = withHeading(atCentre(100), -1);
    assert.ok(Math.abs(headingOf(eye) + 1) < 1e-12);
    assert.ok(Math.abs(headingOf(step(eye, STILL, FRAME, flat)) + 1) < 1e-12);
  });
});

describe('easing on the sphere', () => {
  it('converges on its aim: place, facing and height', () => {
    const start = eyeAt({ lat: 70 * DEGREE, lon: 2, height: 5000 }, flat);
    const kicked = step(
      start,
      { ...STILL, shift: [3, -2], doublings: 2, twist: 2.5 },
      FRAME,
      flat,
    );
    const settled = hold(kicked, STILL, 4);
    assert.ok(between(settled.at, settled.aim.at) < 1e-12);
    assert.ok(between(settled.ahead, settled.aim.ahead) < 1e-9);
    assert.ok(Math.abs(settled.height / settled.aim.height - 1) < 1e-9);
    assert.ok(Math.abs(settled.height - 20_000) < 1e-6);
    // Moved north-east of 70° N, so its heading from north is the twist
    // plus the meridians' convergence over the move.
    assert.ok(Math.abs(headingOf(settled) - headingOf(start) - 2.5) < 0.01);
    assert.ok(
      Math.abs(between(settled.at, start.at) * R - 5000 * Math.hypot(3, 2)) <
        1e-3,
    );
  });

  it('keeps its point unit and its facing a unit tangent', () => {
    hold(
      atCentre(MAX_HEIGHT),
      { ...STILL, steer: [0.6, 1], turn: 0.4, climb: -0.3 },
      6,
      flat,
      (eye) => {
        assert.ok(Math.abs(Math.hypot(...eye.at) - 1) < 1e-12);
        assert.ok(Math.abs(Math.hypot(...eye.ahead) - 1) < 1e-12);
        assert.ok(Math.abs(dot(eye.at, eye.ahead)) < 1e-12);
      },
    );
  });
});

describe('over the ground on the sphere', () => {
  it('never comes within MIN_HEIGHT of a raised ground', () => {
    hold(atCentre(MIN_HEIGHT, Math.PI / 2), forward, 120, cliff, (eye) => {
      assert.ok(eye.floor + eye.height >= cliff(eye.at) + MIN_HEIGHT - 1e-9);
    });
  });

  it('settles back to its height over the raised ground', () => {
    const atop = hold(
      eyeAt(
        { ...unitToLatLon(unit([CENTRE[0], CENTRE[1], -100 / R])), height: 10 },
        flat,
      ),
      STILL,
      10,
      cliff,
    );
    assert.ok(Math.abs(atop.floor - 500) < 0.01);
    assert.ok(Math.abs(atop.height - 10) < 0.01);
  });

  it('measures height over the sea from its surface', () => {
    assert.equal(eyeAt({ ...ISLAND_OPENING, height: 5 }, sea).floor, 0);
  });

  it('reads the ground at its own point', () => {
    const place = { lat: -33 * DEGREE, lon: 151 * DEGREE };
    const seen: Vec3[] = [];
    eyeAt({ ...place, height: 5 }, (p) => {
      seen.push(p);
      return 0;
    });
    assert.ok(between(seen[0] ?? [0, 0, 0], latLonToUnit(place)) < 1e-15);
  });
});
