import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { clipped, type Frame } from './clip';

const FRAME: Frame = { low: [0, 0], high: [10, 10] };

describe('clipped', () => {
  it('keeps a stroke that is inside as it is', () => {
    assert.deepEqual(
      clipped(
        [
          [
            [1, 1],
            [5, 9],
            [9, 2],
          ],
        ],
        FRAME,
      ),
      [
        [
          [1, 1],
          [5, 9],
          [9, 2],
        ],
      ],
    );
  });

  it('drops a stroke that misses the frame', () => {
    assert.deepEqual(
      clipped(
        [
          [
            [-5, 12],
            [15, 12],
          ],
          [
            [11, -3],
            [14, 4],
          ],
        ],
        FRAME,
      ),
      [],
    );
  });

  it('ends a stroke at the edge it leaves by', () => {
    assert.deepEqual(
      clipped(
        [
          [
            [5, 5],
            [15, 5],
          ],
        ],
        FRAME,
      ),
      [
        [
          [5, 5],
          [10, 5],
        ],
      ],
    );
  });

  it('starts a new stroke where one comes back in', () => {
    assert.deepEqual(
      clipped(
        [
          [
            [2, 8],
            [2, 14],
            [6, 14],
            [6, 8],
          ],
        ],
        FRAME,
      ),
      [
        [
          [2, 8],
          [2, 10],
        ],
        [
          [6, 10],
          [6, 8],
        ],
      ],
    );
  });

  it('keeps the middle of a segment that crosses the whole frame', () => {
    assert.deepEqual(
      clipped(
        [
          [
            [-10, 5],
            [20, 5],
          ],
        ],
        FRAME,
      ),
      [
        [
          [0, 5],
          [10, 5],
        ],
      ],
    );
  });
});
