import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { earFlights } from '@/clip/entities/bunny';

import { BURST_LIFE, burstPieces, PIECES } from './burst';

const [flight] = earFlights({
  area: { width: 1280, height: 300 },
  seed: 4,
  liftOff: 0,
});

describe('burstPieces', () => {
  assert.ok(flight);
  const { bursts, apex } = flight;
  const spread = (t: number): number =>
    Math.max(
      ...burstPieces(flight, t, 1).map(({ x }) => Math.abs(x - apex[0])),
    );

  it('shows nothing before the burst or after its life', () => {
    assert.equal(burstPieces(flight, bursts - 0.01, 1).length, 0);
    assert.equal(burstPieces(flight, bursts + BURST_LIFE, 1).length, 0);
  });

  it('starts as one point where the ear topped out', () => {
    const pieces = burstPieces(flight, bursts, 1);
    assert.equal(pieces.length, PIECES);
    for (const { x, y } of pieces) {
      assert.ok(Math.abs(x - apex[0]) < 1e-9 && Math.abs(y - apex[1]) < 1e-9);
    }
  });

  it('throws its pieces out, the air slowing them', () => {
    const [a, b, c] = [
      spread(bursts + 0.2),
      spread(bursts + 0.4),
      spread(bursts + 0.6),
    ];
    assert.ok(a < b && b < c);
    assert.ok(c - b < b - a);
  });

  it('fades out before it ends', () => {
    const late = burstPieces(flight, bursts + BURST_LIFE - 0.1, 1);
    for (const { solidity = 1 } of late) assert.ok(solidity < 0.2);
  });

  it('is fixed by its seed', () => {
    assert.deepEqual(
      burstPieces(flight, bursts + 0.5, 1),
      burstPieces(flight, bursts + 0.5, 1),
    );
    assert.notDeepEqual(
      burstPieces(flight, bursts + 0.5, 1),
      burstPieces(flight, bursts + 0.5, 2),
    );
  });
});
