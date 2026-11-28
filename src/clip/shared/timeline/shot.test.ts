import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { localTime, type Shot, shotAt } from './shot';

const blank = () => {
  // What a shot draws is not what picking one tests.
};
const SHOTS: Shot[] = [
  { from: 0, to: 4, draw: blank },
  { from: 4, to: 10, draw: blank },
  { from: 6, to: 7, draw: blank },
];

describe('shotAt', () => {
  it('picks the shot whose span holds the time, cutting on its end', () => {
    assert.equal(shotAt(SHOTS, 3.99), SHOTS[0]);
    assert.equal(shotAt(SHOTS, 4), SHOTS[1]);
  });

  it('lets a later shot cut into an earlier one, and hands back after it', () => {
    assert.equal(shotAt(SHOTS, 6.5), SHOTS[2]);
    assert.equal(shotAt(SHOTS, 7), SHOTS[1]);
  });

  it('finds nothing outside every shot', () => {
    assert.equal(shotAt(SHOTS, 10), undefined);
    assert.equal(shotAt(SHOTS, -1), undefined);
  });

  it('holds below zero, where the pre-roll plays', () => {
    const preroll: Shot = { from: -3.2, to: 0, draw: blank };
    const shots = [preroll, ...SHOTS];
    assert.equal(shotAt(shots, -3.2), preroll);
    assert.equal(shotAt(shots, -0.01), preroll);
    assert.equal(shotAt(shots, 0), SHOTS[0]);
    assert.equal(shotAt(shots, -3.3), undefined);
    assert.deepEqual(localTime(preroll, -1.6), {
      sinceCut: 1.6,
      p: 0.5,
      seconds: 3.2,
    });
  });
});

describe('localTime', () => {
  it('is the shot’s own clock and progress', () => {
    const shot = SHOTS[1];
    assert.ok(shot !== undefined);
    assert.deepEqual(localTime(shot, 7), { sinceCut: 3, p: 0.5, seconds: 6 });
  });
});
