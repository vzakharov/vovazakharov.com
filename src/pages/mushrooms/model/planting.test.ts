import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FLOWER_COLOURS, flowerGenes } from './flower-genes';
import { FLOWER_SHAPES, shapeSeeds } from './flower-sounds';
import {
  type Action,
  firstMeadow,
  type Meadow,
  type Planting,
  reduce,
} from './game';
import type { FlowerFoot } from './ground';
import { mulberry32 } from './random';

const TUFT = { x: 0.4, z: 1.3, size: 0.28 };
const OTHER_TUFT = { x: -0.6, z: 0.8, size: 0.28 };
const seeds = shapeSeeds(mulberry32(7), 'blue');
const [roundOne, , pointedOne] = FLOWER_SHAPES;
const SIGHT = { flowers: [], air: [], crowded: [], room: [] };

function run(actions: readonly Action[], from = firstMeadow(mulberry32(1))) {
  let state: Meadow = from;
  for (const action of actions) state = reduce(state, action);
  return state;
}

/** The picker as it opens on the tuft at `foot`, waiting for a colour. */
const onTuft = (foot: FlowerFoot): Planting => ({
  foot,
  chosen: undefined,
  flower: undefined,
});

/** A seeded flower held down, and a flower the child planted before. */
const HELD = { kind: 'flower', id: 'flower-3', foot: OTHER_TUFT } as const;
const MINE = { kind: 'flower', id: 'planted-1', foot: TUFT } as const;

describe('the flower picker', () => {
  it('opens on a tuft waiting for a colour, the other pickers closed and nothing selected', () => {
    const meadow = run([
      { kind: 'select', id: 'mushroom-1' },
      { kind: 'pick' },
      { kind: 'tuft', foot: TUFT },
    ]);
    assert.deepEqual(meadow.planting, onTuft(TUFT));
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

  it('closes without planting on a tap anywhere else, its own tuft, a control or an insect included', () => {
    const open: Action[] = [
      { kind: 'tuft', foot: TUFT },
      { kind: 'colour', colour: 'blue', seeds },
    ];
    for (const away of [
      { kind: 'tuft', foot: { ...TUFT } },
      { kind: 'deselect' },
      { kind: 'select', id: 'mushroom-1' },
      { kind: 'pick' },
      { kind: 'house' },
      { kind: 'shut' },
      { kind: 'release', insect: 'bee', seed: 5, now: 0, ...SIGHT },
      { kind: 'startle', id: 'bee-1', now: 10, ...SIGHT },
    ] as const satisfies readonly Action[]) {
      const meadow = run([...open, away]);
      assert.equal(meadow.planting, undefined, away.kind);
      assert.deepEqual(meadow.planted, [], away.kind);
    }
  });

  it('opens afresh on another tuft tapped while it is open', () => {
    const meadow = run([
      { kind: 'tuft', foot: TUFT },
      { kind: 'colour', colour: 'blue', seeds },
      { kind: 'tuft', foot: OTHER_TUFT },
    ]);
    assert.deepEqual(meadow.planting, onTuft(OTHER_TUFT));
  });

  it('plants however many flowers the meadow holds, the room being the scene’s to judge', () => {
    const planted = Array.from({ length: 40 }, (_, index) => ({
      id: `planted-${String(index + 1)}`,
      seed: index,
      foot: { x: index, z: 1, size: 0.28 },
    }));
    const open = run(
      [
        { kind: 'tuft', foot: TUFT },
        { kind: 'colour', colour: 'blue', seeds },
      ],
      { ...firstMeadow(mulberry32(1)), planted },
    );
    const grown = reduce(open, { kind: 'plant', shape: roundOne });
    assert.equal(grown.planted.length, planted.length + 1);
  });

  it('plants nothing before a colour, and takes no colour while closed', () => {
    const early = run([
      { kind: 'tuft', foot: TUFT },
      { kind: 'plant', shape: roundOne },
    ]);
    assert.deepEqual(early.planted, []);
    assert.deepEqual(early.planting, onTuft(TUFT));
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

describe('the flower picker on a flower held', () => {
  it('opens on the flower waiting for a colour, the other pickers closed and nothing selected', () => {
    const meadow = run([{ kind: 'select', id: 'mushroom-1' }, HELD]);
    assert.deepEqual(meadow.planting, {
      foot: OTHER_TUFT,
      chosen: undefined,
      flower: 'flower-3',
    });
    assert.equal(meadow.selected, undefined);
    assert.deepEqual(meadow.pulled, []);
  });

  it('replaces a seeded flower: it is pulled up, and the pick is planted on its foot', () => {
    const meadow = run([
      HELD,
      { kind: 'colour', colour: 'blue', seeds },
      { kind: 'plant', shape: pointedOne },
    ]);
    assert.equal(meadow.planting, undefined);
    assert.deepEqual(meadow.pulled, ['flower-3']);
    assert.deepEqual(meadow.planted, [
      { id: 'planted-1', seed: seeds[2], foot: OTHER_TUFT },
    ]);
  });

  it('pulls up the flower on the cross, seeded or planted, the ids kept in order, and plants nothing', () => {
    const meadow = run([
      { kind: 'tuft', foot: TUFT },
      { kind: 'colour', colour: 'blue', seeds },
      { kind: 'plant', shape: roundOne },
      MINE,
      { kind: 'pull' },
      HELD,
      { kind: 'colour', colour: 'blue', seeds },
      { kind: 'pull' },
    ]);
    assert.equal(meadow.planting, undefined);
    assert.deepEqual(meadow.pulled, ['planted-1', 'flower-3']);
    assert.equal(meadow.planted.length, 1);
  });

  it('a replacing flower takes a fresh id, so it can be replaced in its turn', () => {
    const meadow = run([
      HELD,
      { kind: 'colour', colour: 'blue', seeds },
      { kind: 'plant', shape: roundOne },
      { ...HELD, id: 'planted-1' },
      { kind: 'colour', colour: 'blue', seeds },
      { kind: 'plant', shape: pointedOne },
    ]);
    assert.deepEqual(meadow.pulled, ['flower-3', 'planted-1']);
    assert.deepEqual(
      meadow.planted.map(({ id }) => id),
      ['planted-1', 'planted-2'],
    );
  });

  it('moves to another flower held, and shuts on a tap on the meadow, changing nothing', () => {
    const moved = run([HELD, { kind: 'colour', colour: 'blue', seeds }, MINE]);
    assert.deepEqual(moved.planting, {
      foot: TUFT,
      chosen: undefined,
      flower: 'planted-1',
    });
    const shut = run([HELD, { kind: 'deselect' }]);
    assert.equal(shut.planting, undefined);
    assert.deepEqual(shut.pulled, []);
  });

  it('takes no cross while open on a tuft or closed', () => {
    const open = run([{ kind: 'tuft', foot: TUFT }]);
    assert.equal(reduce(open, { kind: 'pull' }), open);
    const closed = firstMeadow(mulberry32(1));
    assert.equal(reduce(closed, { kind: 'pull' }), closed);
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
