import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FLOWER_SHAPES, type FlowerSound } from '../../model/flower-sounds';
import {
  type Action,
  firstMeadow,
  type Planting,
  reduce,
} from '../../model/game';
import { mulberry32 } from '../../model/random';
import type { PlayedKey } from './keyboard';
import {
  type FlowerInView,
  keyedFlowers,
  keyPlanting,
  playKey,
  sowingTuft,
} from './keyed-flowers';

const IN_VIEW: FlowerInView[] = [
  { id: 'c', sound: { kind: 'note', pitchClass: 0 } },
  { id: 'e', sound: { kind: 'note', pitchClass: 4 } },
  { id: 'other c', sound: { kind: 'note', pitchClass: 0 } },
  { id: 'kick', sound: { kind: 'drum', drum: 'kick' } },
];

describe('the flowers a key plays through', () => {
  it('are the flowers in view with the key’s pitch class, every one of them', () => {
    assert.deepEqual(
      keyedFlowers({ kind: 'note', pitchClass: 0 }, IN_VIEW).map(
        ({ id }) => id,
      ),
      ['c', 'other c'],
    );
  });

  it('are the flowers in view with the key’s drum', () => {
    assert.deepEqual(
      keyedFlowers({ kind: 'drum', drum: 'kick' }, IN_VIEW).map(({ id }) => id),
      ['kick'],
    );
  });

  it('are none for a sound no flower in view makes', () => {
    assert.deepEqual(
      keyedFlowers({ kind: 'note', pitchClass: 7 }, IN_VIEW),
      [],
    );
    assert.deepEqual(keyedFlowers({ kind: 'drum', drum: 'hat' }, IN_VIEW), []);
    assert.deepEqual(keyedFlowers({ kind: 'note', pitchClass: 0 }, []), []);
  });
});

/**
 * The keys `played` played through `inView`, the flower picker open while
 * `picking`, the grass taking no sown flower while `full`: what the
 * instrument sounded, which flowers answered, which sounds the picker
 * planted and which the grass grew, each grown one in view from then on.
 */
function played(
  keys: readonly PlayedKey[],
  inView: readonly FlowerInView[],
  picking = false,
  full = false,
) {
  const sounded: PlayedKey[] = [];
  const answered: string[][] = [];
  const planted: FlowerSound[] = [];
  const sown: FlowerInView[] = [];
  let woken = 0;
  const instrument = {
    wake: () => {
      woken++;
    },
    key: (action: PlayedKey) => {
      sounded.push(action);
      return action.kind === 'octave' ? undefined : action;
    },
  };
  const keyed = {
    inView: () => [...inView, ...sown],
    answer: (flowers: readonly FlowerInView[]) => {
      answered.push(flowers.map(({ id }) => id));
    },
    plant: (sound: FlowerSound) => {
      if (picking) planted.push(sound);
      return picking;
    },
    sow: (sound: FlowerSound) => {
      if (!full) sown.push({ id: `sown-${String(sown.length + 1)}`, sound });
    },
  };
  for (const key of keys) playKey(instrument, keyed, key);
  return { sounded, answered, planted, woken, sown };
}

describe('a played key', () => {
  it('sounds through the flowers in view that make its sound, which answer it, and grows none', () => {
    const { sounded, answered, sown } = played(
      [{ kind: 'note', pitchClass: 0 }],
      IN_VIEW,
    );
    assert.deepEqual(sounded, [{ kind: 'note', pitchClass: 0 }]);
    assert.deepEqual(answered, [['c', 'other c']]);
    assert.deepEqual(sown, []);
  });

  it('with no such flower in view, sounds and grows the flower that makes it', () => {
    const { sounded, answered, woken, sown } = played(
      [
        { kind: 'note', pitchClass: 11 },
        { kind: 'drum', drum: 'snare' },
      ],
      IN_VIEW,
    );
    assert.deepEqual(sounded, [
      { kind: 'note', pitchClass: 11 },
      { kind: 'drum', drum: 'snare' },
    ]);
    assert.deepEqual(answered, []);
    assert.deepEqual(
      sown.map(({ sound }) => sound),
      [
        { kind: 'note', pitchClass: 11 },
        { kind: 'drum', drum: 'snare' },
      ],
    );
    assert.equal(woken, 2);
  });

  it('on an empty view grows a meadow of a melody, each note once, a repeat playing the one grown', () => {
    const F = { kind: 'note', pitchClass: 5 } as const;
    const B = { kind: 'note', pitchClass: 11 } as const;
    const { sounded, answered, sown } = played([F, B, F, F], []);
    assert.deepEqual(sounded, [F, B, F, F]);
    assert.deepEqual(
      sown.map(({ id }) => id),
      ['sown-1', 'sown-2'],
    );
    assert.deepEqual(answered, [['sown-1'], ['sown-1']]);
  });

  it('with no free tuft in view, still sounds, and nothing answers', () => {
    const { sounded, answered, sown } = played(
      [{ kind: 'note', pitchClass: 11 }],
      [],
      false,
      true,
    );
    assert.deepEqual(sounded, [{ kind: 'note', pitchClass: 11 }]);
    assert.deepEqual(answered, []);
    assert.deepEqual(sown, []);
  });

  it('plays a flower in view of its pitch class at any octave, growing none', () => {
    const { answered, sown } = played(
      [
        { kind: 'octave', step: 1 },
        { kind: 'note', pitchClass: 4 },
      ],
      IN_VIEW,
    );
    assert.deepEqual(answered, [['e']]);
    assert.deepEqual(sown, []);
  });

  it('shifts the octave whatever is in view', () => {
    const { sounded, answered } = played([{ kind: 'octave', step: 1 }], []);
    assert.deepEqual(sounded, [{ kind: 'octave', step: 1 }]);
    assert.deepEqual(answered, []);
  });
});

describe('a played key with the flower picker open', () => {
  it('plants its flower, in view of a matching one or not, and plays through none', () => {
    const { sounded, answered, planted, woken, sown } = played(
      [
        { kind: 'note', pitchClass: 0 },
        { kind: 'drum', drum: 'snare' },
      ],
      IN_VIEW,
      true,
    );
    assert.deepEqual(planted, [
      { kind: 'note', pitchClass: 0 },
      { kind: 'drum', drum: 'snare' },
    ]);
    assert.deepEqual(sounded, [], 'the planting sounds it, not the key');
    assert.deepEqual(answered, []);
    assert.deepEqual(sown, [], 'the picker plants, not the grass');
    assert.equal(woken, 2);
  });

  it('still only shifts the octave on an octave key', () => {
    const { sounded, planted } = played(
      [{ kind: 'octave', step: -1 }],
      IN_VIEW,
      true,
    );
    assert.deepEqual(sounded, [{ kind: 'octave', step: -1 }]);
    assert.deepEqual(planted, []);
  });
});

const FOOT = { x: 0.3, z: 0.5, size: 1 };
const F_SHARP: FlowerSound = { kind: 'note', pitchClass: 6 };
/** Pink's four shapes, standing in for the seeds a colour pick draws. */
const PINK_SEEDS = [101, 102, 103, 104];
const seedsOf = () => PINK_SEEDS;

/** The meadow after the picker opened by `opening`, then the key's actions. */
function keyedFrom(opening: Action, colour?: Action) {
  let meadow = reduce(firstMeadow(mulberry32(1)), opening);
  if (colour) meadow = reduce(meadow, colour);
  const actions = keyPlanting(meadow.planting, F_SHARP, seedsOf);
  assert.ok(actions);
  for (const action of actions) meadow = reduce(meadow, action);
  return meadow;
}

describe('the meadow a key asks of the flower picker', () => {
  const tuft: Planting = { foot: FOOT, chosen: undefined, flower: undefined };

  it('asks nothing with the picker shut, the key playing through the flowers in view', () => {
    assert.equal(keyPlanting(undefined, F_SHARP, seedsOf), undefined);
  });

  it('at the colour stage, picks the key’s colour and then its shape', () => {
    assert.deepEqual(keyPlanting(tuft, F_SHARP, seedsOf), [
      { kind: 'colour', colour: 'pink', seeds: PINK_SEEDS },
      { kind: 'plant', shape: FLOWER_SHAPES[2] },
    ]);
  });

  it('at the shape stage of the key’s colour, plants among the shapes shown, drawing no seeds', () => {
    const shown = [201, 202, 203, 204];
    const shaping: Planting = {
      ...tuft,
      chosen: { colour: 'pink', seeds: shown },
    };
    const actions = keyPlanting(shaping, F_SHARP, () => {
      throw new Error('drew seeds the shape row already shows');
    });
    assert.deepEqual(actions, [{ kind: 'plant', shape: FLOWER_SHAPES[2] }]);
  });

  it('at the shape stage of another colour, picks the key’s colour afresh', () => {
    const shaping: Planting = {
      ...tuft,
      chosen: { colour: 'blue', seeds: [1, 2, 3, 4] },
    };
    assert.deepEqual(keyPlanting(shaping, F_SHARP, seedsOf)?.[0], {
      kind: 'colour',
      colour: 'pink',
      seeds: PINK_SEEDS,
    });
  });

  it('plants the shown seed on the tuft, and the picker shuts as after a pick', () => {
    const shown = [201, 202, 203, 204];
    const meadow = keyedFrom(
      { kind: 'tuft', foot: FOOT },
      { kind: 'colour', colour: 'pink', seeds: shown },
    );
    assert.equal(meadow.planting, undefined);
    assert.deepEqual(meadow.planted, [
      { id: 'planted-1', seed: 203, foot: FOOT },
    ]);
  });

  it('replaces the flower the picker is open on, as a pick does', () => {
    const meadow = keyedFrom({ kind: 'flower', id: 'flower-3', foot: FOOT });
    assert.equal(meadow.planting, undefined);
    assert.deepEqual(meadow.pulled, ['flower-3']);
    assert.deepEqual(
      meadow.planted.map(({ seed }) => seed),
      [PINK_SEEDS[2]],
    );
  });
});

type Tuft = { name: string };
const TUFTS: readonly Tuft[] = ['a', 'b', 'c', 'd', 'e'].map((name) => ({
  name,
}));
const free = ({ name }: Tuft) => name !== 'b' && name !== 'd';

/** Eight tufts drawn for sowing off a stream seeded `seed`. */
function draws(seed: number) {
  const random = mulberry32(seed);
  return Array.from({ length: 8 }, () => sowingTuft(random, TUFTS, free));
}

describe('the tuft a key’s flower grows on', () => {
  it('is a free one of those in view', () => {
    const random = mulberry32(7);
    for (let draw = 0; draw < 40; draw++) {
      const tuft = sowingTuft(random, TUFTS, free);
      assert.ok(tuft !== undefined && free(tuft), `drew ${String(tuft?.name)}`);
    }
  });

  it('is the same on a replay of the same stream', () => {
    assert.deepEqual(draws(3), draws(3));
  });

  it('is none where no tuft in view is free, or none is in view', () => {
    const random = mulberry32(1);
    assert.equal(
      sowingTuft(random, TUFTS, () => false),
      undefined,
    );
    assert.equal(sowingTuft(random, TUFTS.slice(0, 0), free), undefined);
  });
});

describe('the meadow a key sows', () => {
  it('has the flower planted on the tuft, the pickers and the selection as they were', () => {
    const before = reduce(firstMeadow(mulberry32(1)), { kind: 'pick' });
    const meadow = reduce(before, { kind: 'sow', seed: 42, foot: FOOT });
    assert.deepEqual(meadow.planted, [
      { id: 'planted-1', seed: 42, foot: FOOT },
    ]);
    assert.equal(meadow.picking, before.picking);
    assert.equal(meadow.selected, before.selected);
    assert.equal(meadow.planting, undefined);
  });
});
