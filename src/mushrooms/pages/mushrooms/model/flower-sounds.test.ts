import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FLOWER_COLOURS, flowerGenes } from './flower-genes';
import {
  classOf,
  DRUMS,
  firstFlowers,
  FLOWER_SHAPES,
  type FlowerSound,
  PITCH_CLASSES,
  SEEDED_SOUNDS,
  seedSounding,
  soundOf,
} from './flower-sounds';
import { mulberry32, nextSeed } from './random';

const named = (sound: FlowerSound) =>
  sound.kind === 'note' ? `note ${String(sound.pitchClass)}` : sound.drum;

/** Every colour's four shapes, lowest first. */
const row = (colour: (typeof FLOWER_COLOURS)[number]) =>
  FLOWER_SHAPES.map((shape) => named(soundOf({ colour, ...shape })));

describe('soundOf', () => {
  it('rises darker to lighter, and by shape within a colour', () => {
    assert.deepEqual(row('blue'), ['note 0', 'note 1', 'note 2', 'note 3']);
    assert.deepEqual(row('pink'), ['note 4', 'note 5', 'note 6', 'note 7']);
    assert.deepEqual(row('yellow'), ['note 8', 'note 9', 'note 10', 'note 11']);
  });

  it('gives violet the skins and white the ticks', () => {
    assert.deepEqual(row('violet'), ['kick', 'tom-low', 'tom-mid', 'tom-high']);
    assert.deepEqual(row('white'), ['snare', 'rim', 'hat', 'shaker']);
  });

  it('names twenty sounds, each once', () => {
    const all = FLOWER_COLOURS.flatMap((colour) => row(colour));
    assert.equal(new Set(all).size, PITCH_CLASSES.length + DRUMS.length);
  });
});

describe('the seeded flowers', () => {
  it('sound the pentatonic from C, then a kick and a hat', () => {
    const flowers = firstFlowers(mulberry32(3), SEEDED_SOUNDS.length);
    assert.deepEqual(
      flowers.map((flower) => named(soundOf(flowerGenes(flower)))),
      ['note 0', 'note 2', 'note 4', 'note 7', 'note 9', 'kick', 'hat'],
    );
  });

  it('do so on every visit, each its own id and seed', () => {
    for (let visit = 0; visit < 200; visit++) {
      const flowers = firstFlowers(mulberry32(visit), 7);
      assert.equal(new Set(flowers.map(({ id }) => id)).size, 7);
      assert.equal(new Set(flowers.map(({ seed }) => seed)).size, 7);
      for (const [index, flower] of flowers.entries()) {
        const want = SEEDED_SOUNDS[index];
        assert.ok(want);
        assert.equal(named(soundOf(flowerGenes(flower))), named(want));
      }
    }
  });

  it('draw one seed each off the visit’s stream, as they always did', () => {
    const random = mulberry32(11);
    firstFlowers(random, 7);
    const after = mulberry32(11);
    for (let index = 0; index < 7; index++) nextSeed(after);
    assert.equal(random(), after());
  });
});

describe('the flowers a bee brings', () => {
  it('sound any of the twenty', () => {
    const random = mulberry32(5);
    const heard = new Set(
      Array.from({ length: 2000 }, () =>
        named(soundOf(flowerGenes({ seed: nextSeed(random) }))),
      ),
    );
    assert.equal(heard.size, 20);
  });
});

describe('classOf', () => {
  it('names the colour and shape of every sound’s flowers', () => {
    for (const colour of FLOWER_COLOURS) {
      for (const shape of FLOWER_SHAPES) {
        const found = classOf(soundOf({ colour, ...shape }));
        assert.equal(found.colour, colour);
        assert.equal(found.shape, shape, 'the very shape the picker offers');
      }
    }
  });
});

describe('seedSounding', () => {
  it('finds a seed for every sound, the same one from the same stream', () => {
    for (const colour of FLOWER_COLOURS) {
      for (const shape of FLOWER_SHAPES) {
        const sound = soundOf({ colour, ...shape });
        const seed = seedSounding(mulberry32(9), sound);
        assert.equal(seed, seedSounding(mulberry32(9), sound));
        assert.equal(named(soundOf(flowerGenes({ seed }))), named(sound));
      }
    }
  });
});
