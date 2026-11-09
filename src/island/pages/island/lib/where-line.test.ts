import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parsePlace } from './place-hash';
import { whereFields, whereLine } from './where-line';

const PAGE = 'https://vovazakharov.com/island';

describe('whereLine', () => {
  it('spells the build, the link, the pose, the hour and the tiles', () => {
    const line = whereLine({
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
      solarHours: 16.5,
      tiles: { under: [17, 16, 17], drawn: [12, 17, 14, 16] },
    });
    assert.equal(
      line,
      'island 2b0e6d7d https://vovazakharov.com/island#1@10.12346,-3.50000,1234.6,45.0,12.0,3.250' +
        ' · world 1 · lat 10.12346° lon -3.50000° · height 1234.6 m · heading 45.0°' +
        ' · pitch +12.0° (look) · 16:30 sun time (t 3.250 h) · tiles 16/17 (12–17)',
    );
  });

  it('carries a link that reopens the same place', () => {
    const place = parsePlace('#0@38.00000,15.00000,500.0,270.0,-8.5,22.125');
    const line = whereLine({
      commit: 'dev',
      page: PAGE,
      place,
      solarHours: 0,
      tiles: { under: [], drawn: [] },
    });
    const link = line.split(' ')[2] ?? '';
    assert.deepEqual(parsePlace(new URL(link).hash), place);
    assert.ok(line.endsWith('00:00 sun time (t 22.125 h) · tiles none drawn'));
  });
});

describe('whereFields', () => {
  it('are the where-line’s fields, a row each', () => {
    const where = {
      commit: 'dev',
      page: PAGE,
      place: parsePlace('#0@38.00000,15.00000,500.0,270.0,-8.5'),
      solarHours: 9.5,
      tiles: { under: [3], drawn: [3, 4] },
    };
    const fields = whereFields(where);
    assert.equal(fields.join(' · '), whereLine(where));
    assert.equal(fields.length, 8);
    assert.ok(fields.every((field) => !field.includes(' · ')));
  });
});
