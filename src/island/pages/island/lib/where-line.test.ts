import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parsePlace } from './place-hash';
import { shareLink, whereFields } from './where-line';

const PAGE = 'https://vovazakharov.com/island';

describe('whereFields', () => {
  it('spell the build, the link, the pose, the hour and the tiles, a row each', () => {
    const fields = whereFields({
      commit: '2b0e6d7d',
      page: PAGE,
      place: {
        world: '1',
        pose: {
          lat: 10.123_456,
          lon: -3.5,
          height: 1234.56,
          heading: 45,
          pitch: 12,
          hours: 3.25,
        },
      },
      seaHeight: 1534.04,
      solarHours: 16.5,
      tiles: { under: [17, 16, 17], drawn: [12, 17, 14, 16] },
    });
    assert.deepEqual(fields, [
      'island 2b0e6d7d https://vovazakharov.com/island#1@10.12346,-3.50000,1234.6,45.0,12.0,3.250',
      'world 1',
      'lat 10.12346° lon -3.50000°',
      'height 1234.6 m over ground, 1534.0 m over sea',
      'heading 45.0°',
      'pitch +12.0° (look)',
      '16:30 sun time (t 3.250 h)',
      'tiles 16/17 (12–17)',
    ]);
  });

  it('end on the hour and no tiles before any is drawn', () => {
    const fields = whereFields({
      commit: 'dev',
      page: PAGE,
      place: parsePlace('#0@38.00000,15.00000,500.0,270.0,-8.5,22.125'),
      seaHeight: 500,
      solarHours: 0,
      tiles: { under: [], drawn: [] },
    });
    assert.deepEqual(fields.slice(-2), [
      '00:00 sun time (t 22.125 h)',
      'tiles none drawn',
    ]);
  });
});

describe('shareLink', () => {
  it('reopens the same place', () => {
    const place = parsePlace('#0@38.00000,15.00000,500.0,270.0,-8.5,22.125');
    const link = shareLink(PAGE, place);
    assert.ok(link.startsWith(`${PAGE}#0@`));
    assert.deepEqual(parsePlace(new URL(link).hash), place);
  });

  it('is a bare world with no pose', () => {
    assert.equal(shareLink(PAGE, { world: '7' }), `${PAGE}#7`);
  });
});
