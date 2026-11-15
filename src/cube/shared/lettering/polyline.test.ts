import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { bounds, isLoop, placedAt, type Polyline, smooth } from './polyline';

const SQUARE: Polyline = [
  [0, 0],
  [4, 0],
  [4, 4],
  [0, 4],
  [0, 0],
];

describe('polyline', () => {
  it('keeps both ends of an open line it rounds', () => {
    const corner: Polyline = [
      [0, 0],
      [4, 0],
      [4, 4],
    ];
    const round = smooth(corner);
    assert.deepEqual(round[0], [0, 0]);
    assert.deepEqual(round.at(-1), [4, 4]);
    assert.ok(round.length > corner.length);
    // The corner itself is cut away.
    assert.ok(round.every(([x, y]) => !(x === 4 && y === 0)));
  });

  it('rounds a loop all the way round and closes it', () => {
    const round = smooth(SQUARE);
    assert.ok(isLoop(round));
    // It still touches each side, and no corner of the square is left.
    assert.deepEqual(bounds([round]), [0, 0, 4, 4]);
    assert.ok(
      round.every(([x, y]) => !((x === 0 || x === 4) && (y === 0 || y === 4))),
    );
  });

  it('leaves a line too short to have a corner', () => {
    const line: Polyline = [
      [0, 0],
      [1, 1],
    ];
    assert.equal(smooth(line), line);
  });

  it('scales about the origin, then moves', () => {
    assert.deepEqual(
      placedAt(
        [
          [
            [1, 2],
            [3, 4],
          ],
        ],
        2,
        10,
        -1,
      ),
      [
        [
          [12, 3],
          [16, 7],
        ],
      ],
    );
  });

  it('boxes what it is given, and nothing as zeros', () => {
    assert.deepEqual(bounds([SQUARE, [[-1, 7]]]), [-1, 0, 4, 7]);
    assert.deepEqual(bounds([]), [0, 0, 0, 0]);
  });
});
