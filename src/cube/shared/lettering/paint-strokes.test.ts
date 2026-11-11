import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { paintStrokes, type Pen } from './paint-strokes';

/** A pen that writes down what it is asked instead of inking it. */
function recordingPen(): { pen: Pen; calls: string[] } {
  const calls: string[] = [];
  const pen: Pen = {
    lineWidth: 0,
    lineCap: 'butt',
    lineJoin: 'miter',
    strokeStyle: '',
    beginPath() {
      calls.push('begin');
    },
    moveTo(x, y) {
      calls.push(`move ${x},${y}`);
    },
    lineTo(x, y) {
      calls.push(`line ${x},${y}`);
    },
    stroke() {
      calls.push('stroke');
    },
  };
  return { pen, calls };
}

describe('paintStrokes', () => {
  it('inks every stroke in one path, y turned to run down the canvas', () => {
    const { pen, calls } = recordingPen();
    paintStrokes(
      pen,
      [
        [
          [0, 0],
          [1, 2],
        ],
        [
          [3, 1],
          [4, 1],
          [4, 0],
        ],
      ],
      {
        leftPixel: 10,
        baseline: 100,
        pixelsPerUnit: 20,
        nibPixels: 3,
        inkColour: '#123456',
      },
    );
    assert.deepEqual(calls, [
      'begin',
      'move 10,100',
      'line 30,60',
      'move 70,80',
      'line 90,80',
      'line 90,100',
      'stroke',
    ]);
    assert.equal(pen.lineWidth, 3);
    assert.equal(pen.lineCap, 'round');
    assert.equal(pen.lineJoin, 'round');
    assert.equal(pen.strokeStyle, '#123456');
  });
});
