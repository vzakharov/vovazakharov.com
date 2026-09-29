import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FLOWER_COLOURS, flowerGenes } from './flower-genes';
import { FLOWER_SHAPES, shapeSeeds } from './flower-sounds';
import { type Action, firstMeadow, type Meadow, reduce } from './game';
import { mulberry32 } from './random';

const TUFT = { x: 0.4, z: 1.3, size: 0.28 };
const OTHER_TUFT = { x: -0.6, z: 0.8, size: 0.28 };
const seeds = shapeSeeds(mulberry32(7), 'blue');
const [roundOne, , pointedOne] = FLOWER_SHAPES;

function run(actions: readonly Action[], from = firstMeadow(mulberry32(1))) {
  let state: Meadow = from;
  for (const action of actions) state = reduce(state, action);
  return state;
}

describe('the flower picker', () => {
  it('opens on a tuft waiting for a colour, the other pickers closed and nothing selected', () => {
    const meadow = run([
      { kind: 'select', id: 'mushroom-1' },
      { kind: 'pick' },
      { kind: 'tuft', foot: TUFT },
    ]);
    assert.deepEqual(meadow.planting, { foot: TUFT, chosen: undefined });
    assert.equal(meadow.picking, false);
    assert.equal(meadow.selected, undefined);
  });

  it('plants the picked colour and shape on the tapped tuft, from the seed it showed, and closes', () => {
    const meadow = run([
      { kind: 'tuft', foot: TUFT },
      { kind: 'colour', colour: 'blue', seeds },
      { kind: 'plant', shape: pointedOne },
    ]);
    assert.equal(meadow.planting, undefined);
    assert.deepEqual(meadow.planted, [
      { id: 'planted-1', seed: seeds[2], foot: TUFT },
    ]);
  });

  it('closes without planting on a tap anywhere else, another tuft included', () => {
    const open: Action[] = [
      { kind: 'tuft', foot: TUFT },
      { kind: 'colour', colour: 'blue', seeds },
    ];
    for (const away of [
      { kind: 'tuft', foot: OTHER_TUFT },
      { kind: 'deselect' },
      { kind: 'select', id: 'mushroom-1' },
      { kind: 'pick' },
      { kind: 'house' },
    ] as const satisfies readonly Action[]) {
      const meadow = run([...open, away]);
      assert.equal(meadow.planting, undefined, away.kind);
      assert.deepEqual(meadow.planted, [], away.kind);
    }
  });

  it('plants nothing before a colour, and takes no colour while closed', () => {
    const early = run([
      { kind: 'tuft', foot: TUFT },
      { kind: 'plant', shape: roundOne },
    ]);
    assert.deepEqual(early.planted, []);
    assert.deepEqual(early.planting, { foot: TUFT, chosen: undefined });
    const closed = firstMeadow(mulberry32(1));
    assert.equal(
      reduce(closed, { kind: 'colour', colour: 'pink', seeds }),
      closed,
    );
  });

  it('keeps every flower planted before, the bees’ ids running on after the child’s', () => {
    const twice = run([
      { kind: 'tuft', foot: TUFT },
      { kind: 'colour', colour: 'blue', seeds },
      { kind: 'plant', shape: roundOne },
      { kind: 'tuft', foot: OTHER_TUFT },
      { kind: 'colour', colour: 'blue', seeds },
      { kind: 'plant', shape: roundOne },
    ]);
    assert.deepEqual(
      twice.planted.map(({ id }) => id),
      ['planted-1', 'planted-2'],
    );
  });
});

describe('shapeSeeds', () => {
  it('grows each colour in every shape, in FLOWER_SHAPES order', () => {
    const random = mulberry32(3);
    for (const colour of FLOWER_COLOURS) {
      const grown = shapeSeeds(random, colour).map((seed) =>
        flowerGenes({ seed }),
      );
      assert.deepEqual(
        grown.map(({ colour: each, petal, rings }) => ({
          colour: each,
          petal,
          rings,
        })),
        FLOWER_SHAPES.map((shape) => ({ colour, ...shape })),
      );
    }
  });

  it('draws fresh seeds each time, so no two plantings share a hue', () => {
    const random = mulberry32(5);
    const nudges = Array.from(
      { length: 8 },
      () => flowerGenes({ seed: shapeSeeds(random, 'pink')[0] ?? 0 }).hueNudge,
    );
    assert.equal(new Set(nudges).size, nudges.length);
  });
});
