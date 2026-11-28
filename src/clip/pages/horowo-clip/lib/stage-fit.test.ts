import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { fitStage, readMode } from './stage-fit';

describe('fitStage', () => {
  it('fills a 16:9 viewport exactly', () => {
    assert.deepEqual(fitStage(1920, 1080), {
      corner: { x: 0, y: 0 },
      scale: 1.5,
    });
  });

  it('letterboxes a tall viewport top and bottom', () => {
    assert.deepEqual(fitStage(640, 1000), {
      corner: { x: 0, y: (1000 - 360) / 2 },
      scale: 0.5,
    });
  });

  it('pillarboxes a wide viewport left and right', () => {
    assert.deepEqual(fitStage(3000, 720), {
      corner: { x: (3000 - 1280) / 2, y: 0 },
      scale: 1,
    });
  });
});

describe('readMode', () => {
  it('plays by default', () => {
    assert.deepEqual(readMode(''), { kind: 'play' });
  });

  it('holds a still at ?t=', () => {
    assert.deepEqual(readMode('?t=12.3'), { kind: 'still', t: 12.3 });
  });

  it('plays when ?t= is not a number', () => {
    assert.deepEqual(readMode('?t=soon'), { kind: 'play' });
  });

  it('waits on the film script at ?film, whatever else is asked', () => {
    assert.deepEqual(readMode('?film&t=3'), { kind: 'film' });
  });
});
