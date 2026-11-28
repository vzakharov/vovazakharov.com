import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SCREEN, tapeLines } from './lines';

const still = { frame: 3, wear: 0.3, bar: null, slip: 0, jitter: 0 };

function assertCovers(lines: ReturnType<typeof tapeLines>): void {
  let y = 0;
  for (const line of lines) {
    assert.equal(line.y, y);
    assert.ok(line.height > 0);
    assert.ok(
      line.sourceRow >= 0 &&
        line.sourceRow + line.height <= SCREEN.height + 1e-9,
    );
    y += line.height;
  }
  assert.equal(y, SCREEN.height);
}

describe('tapeLines', () => {
  it('covers the picture top to bottom with no gap', () => {
    assertCovers(tapeLines(still));
    assertCovers(
      tapeLines({
        ...still,
        bar: { y: 300, height: 60, strength: 1 },
        slip: 0.37,
        jitter: 1,
      }),
    );
  });

  it('plays each strip from its own row while the picture holds', () => {
    for (const line of tapeLines(still)) assert.equal(line.sourceRow, line.y);
  });

  it('wraps a rolling picture around its own edge', () => {
    const lines = tapeLines({ ...still, slip: 0.25 });
    assert.equal(lines[0]?.sourceRow, 180);
    assert.ok(lines.some((line) => line.sourceRow === 0 && line.y > 0));
  });

  it('tears the lines inside the tracking bar far past the rest', () => {
    const lines = tapeLines({
      ...still,
      bar: { y: 360, height: 60, strength: 1 },
    });
    const inBar = lines.filter((line) => Math.abs(line.y - 360) < 10);
    const away = lines.filter((line) => line.y < 200);
    const widest = (set: typeof lines) =>
      Math.max(...set.map((line) => Math.abs(line.dx)));
    assert.ok(widest(inBar) > widest(away) * 4);
  });

  it('is the same for the same frame', () => {
    assert.deepEqual(tapeLines(still), tapeLines(still));
  });
});
