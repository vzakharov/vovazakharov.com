import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { aimOf, parseShot, parseSize, shotSpecs } from './shoot-args';

describe('shoot-args', () => {
  it('parses a shot with every optional value', () => {
    assert.deepEqual(parseShot('a-1:44,10,560,90,15,3.5'), {
      name: 'a-1',
      lat: 44,
      lon: 10,
      height: 560,
      heading: 90,
      look: 15,
      hours: 3.5,
    });
  });

  it('leaves the optional values out when not given', () => {
    assert.deepEqual(parseShot('a:-1,2,3'), {
      name: 'a',
      lat: -1,
      lon: 2,
      height: 3,
    });
  });

  it('rejects a malformed shot', () => {
    assert.throws(() => parseShot('44,10,560'));
    assert.throws(() => parseShot('a:44,10'));
    assert.throws(() => parseShot('a:44,x,5'));
    assert.throws(() => parseShot('a:1,2,3,4,5,6,7'));
  });

  it('converts degrees to radians', () => {
    const { heading, look } = aimOf(parseShot('a:0,0,1,180,90'));
    assert.equal(heading, Math.PI);
    assert.equal(look, Math.PI / 2);
  });

  it('parses a size and collects repeated shots', () => {
    assert.deepEqual(parseSize('1600x1000'), { width: 1600, height: 1000 });
    assert.throws(() => parseSize('1600'));
    assert.deepEqual(
      shotSpecs(['--shot', 'a:1,2,3', '--x', '--shot', 'b:1,2,3']),
      ['a:1,2,3', 'b:1,2,3'],
    );
  });
});
