import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { posterOf } from '../model/poster';
import { type Brush, paintPoster } from './paint-poster';

/** A brush that writes down what it is asked instead of painting it. */
function recordingBrush(): { brush: Brush; calls: string[] } {
  const calls: string[] = [];
  const points: number[] = [];
  const brush: Brush = {
    lineWidth: 0,
    lineCap: 'butt',
    lineJoin: 'miter',
    strokeStyle: '',
    fillStyle: '',
    fillRect(...box) {
      calls.push(`fill ${box.join(',')}`);
    },
    beginPath() {
      calls.push('begin');
    },
    moveTo(x, y) {
      points.push(x, y);
    },
    lineTo(x, y) {
      points.push(x, y);
    },
    stroke() {
      const within = points.splice(0).every((each) => each >= 0 && each <= 720);
      calls.push(`stroke ${within}`);
    },
  };
  return { brush, calls };
}

describe('paintPoster', () => {
  it('fills the paper, then inks each part within the canvas', () => {
    const { brush, calls } = recordingBrush();
    paintPoster(brush, posterOf(7), 2000);
    assert.deepEqual(calls, [
      'fill 0,0,720,600',
      'begin',
      'stroke true',
      'begin',
      'stroke true',
      'begin',
      'stroke true',
      'begin',
      'stroke true',
    ]);
    assert.equal(typeof brush.fillStyle, 'string');
    assert.equal(typeof brush.strokeStyle, 'string');
    assert.notEqual(brush.fillStyle, brush.strokeStyle);
    assert.ok(brush.lineWidth > 0);
  });

  it('paints a part a pixel for a room side at scale 1', () => {
    const { brush, calls } = recordingBrush();
    paintPoster(
      brush,
      [
        { part: 'paper', sheetWide: 4, sheetTall: 3, tint: [1, 1, 1] },
        {
          part: 'drawing',
          strokes: [
            [
              [0, 0],
              [4, 3],
            ],
          ],
          nibWide: 0.5,
          tint: [0, 0, 0],
        },
      ],
      1,
    );
    assert.deepEqual(calls, ['fill 0,0,4,3', 'begin', 'stroke true']);
    assert.equal(brush.lineWidth, 0.5);
  });
});
