import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import type { Room } from '@/cube/entities/world';

import { toolsFor } from '../lib/tools';
import { type Bounds, boundsOf } from './clear';
import { partsOf } from './parts';

const ROOM: Room = { n: 1, x: 0n, y: 0n };
const { block, prism } = toolsFor(ROOM);

/** `bounds` in metres, to the millimetre. */
const metres = ({ least, most }: Bounds): number[] =>
  [...least, ...most].map((value) => Math.round(value * ROOM_METRES * 1000));

describe('partsOf', () => {
  it('finds a block one part, its bounds', () => {
    const quads = block([0, 0, 0], [1.5, 0.04, 0.12], 'wood');
    assert.deepEqual(
      partsOf(quads).map((part) => metres(part)),
      [metres(boundsOf(quads))],
    );
  });

  it('keeps one part with faces left out, as those on the floor are', () => {
    const quads = block([0, 0, 0], [0.05, 0.42, 0.4], 'metal').slice(1);
    assert.equal(partsOf(quads).length, 1);
  });

  it('finds a prism one part', () => {
    assert.equal(partsOf(prism([0, 0, 0], 0.2, 0.5, 'plastic')).length, 1);
  });

  it('parts slats with gaps between them', () => {
    const slats = [0.02, 0.16, 0.3].flatMap((z) =>
      block([0, 0.42, z], [1.5, 0.04, 0.12], 'wood'),
    );
    assert.deepEqual(
      partsOf(slats).map((part) => metres(part)),
      [0.02, 0.16, 0.3].map((z) =>
        metres(boundsOf(block([0, 0.42, z], [1.5, 0.04, 0.12], 'wood'))),
      ),
    );
  });

  it('parts a post from the support it stands on, edge on edge', () => {
    const support = block([0.62, 0, 0.03], [0.05, 0.42, 0.4], 'metal');
    const post = block([0.62, 0.42, 0.03], [0.05, 0.44, 0.04], 'metal');
    assert.deepEqual(
      partsOf([...support, ...post]).map((part) => metres(part)),
      [metres(boundsOf(support)), metres(boundsOf(post))],
    );
  });

  it('parts blocks that lie face to face', () => {
    const left = block([0, 0, 0], [0.1, 0.1, 0.1], 'wood');
    const right = block([0.1, 0, 0], [0.1, 0.1, 0.1], 'wood');
    assert.equal(partsOf([...left, ...right]).length, 2);
  });
});
