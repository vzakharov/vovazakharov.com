import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OUR_WORLD } from '@/island/entities/terrain';

import { formatPlace, parsePlace, PLACES, type Pose } from './place-hash';

describe('parsePlace', () => {
  it('opens the number a bare hash names', () => {
    assert.deepEqual(parsePlace('#2'), { world: '2' });
    assert.deepEqual(parsePlace('#0'), { world: '0' });
    assert.deepEqual(parsePlace('#12345678901234567890'), {
      world: '12345678901234567890',
    });
    assert.deepEqual(parsePlace('7'), { world: '7' });
  });

  it('opens ours for no hash or an invalid world', () => {
    for (const hash of [
      '',
      '#',
      '#00',
      '#07',
      '#-3',
      '#2.5',
      '#abc',
      '# 2',
      '#@10,0,500,0,0',
      '#x@10,0,500,0,0',
    ]) {
      assert.deepEqual(parsePlace(hash), { world: OUR_WORLD }, hash);
    }
  });

  it('reads a pose, with and without the hour', () => {
    assert.deepEqual(parsePlace('#0@38.12345,-15.5,1200.5,270,-12.5'), {
      world: '0',
      pose: {
        lat: 38.123_45,
        lon: -15.5,
        height: 1200.5,
        heading: 270,
        pitch: -12.5,
      },
    });
    assert.deepEqual(parsePlace('#1@10,0,500,0,+3,6.25').pose?.hours, 6.25);
  });

  it('drops a malformed pose and keeps the world', () => {
    for (const pose of [
      '',
      '10,0,500,0',
      '10,0,500,0,0,1,2',
      '91,0,500,0,0',
      '10,181,500,0,0',
      '10,0,0,0,0',
      '10,0,-5,0,0',
      '10,0,500,0,0,24',
      '10,0,500,0,0,-1',
      '10,0,500,north,0',
      '10,0,500,0,1e3',
      '10,0,500,0,0x10',
      '10,0,500,,0',
      '10, 0,500,0,0',
      `10,0,${'9'.repeat(400)},0,0`,
    ]) {
      assert.deepEqual(parsePlace(`#3@${pose}`), { world: '3' }, pose);
    }
  });
});

describe('formatPlace', () => {
  it('writes a bare world bare', () => {
    assert.equal(formatPlace({ world: '1' }), '#1');
  });

  it('round-trips to the printed precision', () => {
    const poses: Pose[] = [
      {
        lat: 10.123_456_789,
        lon: -0.000_001,
        height: 1234.5678,
        heading: 359.96,
        pitch: -0.04,
      },
      {
        lat: -89.999_999,
        lon: 179.999_999,
        height: 2,
        heading: 0,
        pitch: 12.34,
        hours: 23.9999,
      },
      {
        lat: 38,
        lon: 15,
        height: 20_000_000,
        heading: 90.05,
        pitch: 0,
        hours: 0,
      },
    ];
    for (const pose of poses) {
      const hash = formatPlace({ world: '0', pose });
      const back = parsePlace(hash);
      assert.equal(formatPlace(back), hash, hash);
      const read = back.pose;
      assert.ok(read !== undefined, hash);
      for (const field of ['lat', 'lon', 'height', 'pitch'] as const) {
        const half = 0.5 * 10 ** -PLACES[field];
        assert.ok(Math.abs(read[field] - pose[field]) <= half + 1e-9, field);
      }
    }
  });

  it('never writes a negative zero', () => {
    const hash = formatPlace({
      world: '1',
      pose: {
        lat: -0.000_001,
        lon: -0,
        height: 10,
        heading: -0.01,
        pitch: -0.01,
      },
    });
    assert.equal(hash, '#1@0.00000,0.00000,10.0,0.0,0.0');
  });

  it('writes an hour that rounds to the day’s end as its start', () => {
    const hash = formatPlace({
      world: '1',
      pose: {
        lat: 0,
        lon: 0,
        height: 10,
        heading: 0,
        pitch: 0,
        hours: 23.999_99,
      },
    });
    assert.equal(parsePlace(hash).pose?.hours, 0);
  });
});
