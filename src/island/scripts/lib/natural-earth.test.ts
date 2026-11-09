import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { layerPolygons } from './natural-earth';

const square = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 0],
];

const collection = (...geometries: unknown[]) => ({
  type: 'FeatureCollection',
  features: geometries.map((geometry) => ({
    type: 'Feature',
    properties: {},
    geometry,
  })),
});

describe('layerPolygons', () => {
  it('flattens Polygons and MultiPolygons to one list', () => {
    const polygons = layerPolygons(
      collection(
        { type: 'Polygon', coordinates: [square] },
        { type: 'MultiPolygon', coordinates: [[square], [square, square]] },
      ),
    );
    assert.equal(polygons.length, 3);
    assert.equal(polygons[2]?.length, 2);
  });

  it('keeps longitude and latitude and drops a third ordinate', () => {
    const [polygon] = layerPolygons(
      collection({
        type: 'Polygon',
        coordinates: [square.map(([x = 0, y = 0]) => [x, y, 99])],
      }),
    );
    assert.deepEqual(polygon?.[0]?.[1], [1, 0]);
  });

  it('rejects an open ring, a line and an out-of-range position', () => {
    const open = [...square.slice(0, 3), [0, 1]];
    assert.throws(() =>
      layerPolygons(collection({ type: 'Polygon', coordinates: [open] })),
    );
    assert.throws(() =>
      layerPolygons(collection({ type: 'LineString', coordinates: square })),
    );
    const far = square.map(([x = 0, y = 0]) => [x + 200, y]);
    assert.throws(() =>
      layerPolygons(collection({ type: 'Polygon', coordinates: [far] })),
    );
  });
});
