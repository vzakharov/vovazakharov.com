import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { z } from 'zod';

import { ALL_TEN, opened, play } from '../ui/scene/visit-play';
import { type Action, type Meadow, reduce } from './game';
import { OPENING_EYE } from './ground';
import { settled } from './keeping';
import { type Kept, KEPT_VERSION, KeptSchema, readKept } from './kept-record';
import { grownOn } from './placement';

const SEED = 5;
/** Past the shower tapped at 6 s, so a spore sown then lies on. */
const SETTLED_AT = 20_000;

/**
 * A visit played 20 s with a shower and all ten fliers, then a house
 * furnished, a spore and a flower sown, settled as of then.
 */
function keptPlayed(): Kept {
  const stand = opened(SEED, 1180, 820, false, undefined, 2);
  const playing = {
    kinds: ALL_TEN,
    gap: 400,
    lasting: SETTLED_AT,
    tick: 100,
    rains: [6000],
  };
  let last: Meadow = stand.meadow;
  play(stand, SEED, playing, ({ meadow }) => {
    last = meadow;
  });
  const id = last.mushrooms[0]?.id ?? '';
  const spore = { ...grownOn(OPENING_EYE, { x: 40, z: 30 }), now: SETTLED_AT };
  const actions: Action[] = [
    { kind: 'house' },
    { kind: 'furnish', piece: 'round' },
    { kind: 'furnish', piece: 'door' },
    { kind: 'select', id, spore },
    { kind: 'sow', seed: 9, foot: { x: 0.5, y: 1.2, size: 0.8 } },
  ];
  for (const action of actions) last = reduce(last, action);
  return {
    version: KEPT_VERSION,
    seed: SEED,
    eye: { x: 0.25, y: -1.5, heading: 0.4 },
    gait: 'flight',
    meadow: settled(last, SETTLED_AT),
  };
}

describe('readKept', () => {
  const kept = keptPlayed();

  it('plays a meadow with every kind of thing a record holds', () => {
    const { meadow } = kept;
    assert.ok(meadow.insects.some((flier) => flier.kind === 'bee'));
    assert.ok(meadow.insects.some((flier) => flier.kind !== 'bee'));
    assert.ok(meadow.spores.length > 0);
    assert.ok(meadow.planted.length > 0);
    assert.ok(meadow.mushrooms.some(({ house }) => house.windows.length > 0));
  });

  it('reads back a settled played meadow as it was written', () => {
    assert.deepEqual(readKept(structuredClone(kept)), kept);
  });

  it('reads back a flower a bee planted', () => {
    const bee = { id: 'planted-9', seed: 3, ring: 1, parent: 'planted-1' };
    const ringed = { ...kept, meadow: { ...kept.meadow, planted: [bee] } };
    assert.deepEqual(readKept(structuredClone(ringed)), ringed);
  });

  it('reads no record of another version', () => {
    assert.equal(readKept({ ...kept, version: 2 }), undefined);
  });

  it('reads no record missing a field', () => {
    const { grown, ...short } = kept.meadow;
    assert.ok(grown > 0);
    assert.equal(readKept({ ...kept, meadow: short }), undefined);
  });

  it('reads no record with a species the game has not', () => {
    const mushrooms = kept.meadow.mushrooms.map((mushroom, index) =>
      index === 0 ? { ...mushroom, species: 'toadstool' } : mushroom,
    );
    const strange = { ...kept, meadow: { ...kept.meadow, mushrooms } };
    assert.equal(readKept(strange), undefined);
  });

  it('reads nothing from what is not a record', () => {
    for (const raw of [undefined, null, 1, 'meadow', []]) {
      assert.equal(readKept(raw), undefined);
    }
  });
});

describe('KeptSchema', () => {
  it('keeps the shape pinned for its version', () => {
    // `undefined` is the schema's only type JSON Schema cannot express; it reads as `{}`.
    const shape = z.toJSONSchema(KeptSchema, { unrepresentable: 'any' });
    const pinned: unknown = JSON.parse(
      readFileSync(new URL('kept-record.schema.json', import.meta.url), 'utf8'),
    );
    assert.deepEqual(
      shape,
      pinned,
      'The kept record changed shape: bump KEPT_VERSION and add a reader for the previous one, ' +
        'or, if the change is additive and old records still parse, update kept-record.schema.json.',
    );
  });
});
