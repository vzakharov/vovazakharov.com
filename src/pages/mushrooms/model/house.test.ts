import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { type Circle, containsPoint, outside, type Point } from './geometry';
import {
  DOOR_ASPECT,
  type DoorPlace,
  doorStations,
  EMPTY_HOUSE,
  furnished,
  type House,
  onStem,
  paintedDoor,
  paintedSpots,
  PANE,
  windowSlots,
} from './house';
import {
  MUSHROOM_SPECIES,
  type MushroomGenes,
  mushroomGenes,
  type Species,
} from './mushroom-genes';
import {
  capOutlines,
  headOutlines,
  MUSHROOM_INK,
  stemOutline,
} from './mushroom-outline';
import { splayed } from './mushroom-pose';
import { capBase } from './mushroom-profile';

const SEEDS = Array.from({ length: 2000 }, (_, index) => index * 2_654_435_761);
const everyMushroom = MUSHROOM_SPECIES.flatMap((species) =>
  SEEDS.map((seed) => mushroomGenes({ seed, species })),
);

/** The mean width of `species`' lowest door over `everyMushroom`. */
function meanWidth(species: Species): number {
  const doors = everyMushroom
    .filter((genes) => genes.species === species)
    .map((genes) => stationsOf(genes)[0]?.width ?? 0);
  return doors.reduce((sum, width) => sum + width, 0) / doors.length;
}

/** Each of `everyMushroom`'s door stations, found once for every test that reads them. */
const found = new Map<MushroomGenes, DoorPlace[]>();
function stationsOf(genes: MushroomGenes): DoorPlace[] {
  const stations = found.get(genes) ?? doorStations(genes);
  found.set(genes, stations);
  return stations;
}

/** A box's four corners, `width` by `height` round `middle`. */
function corners({ x, y }: Point, width: number, height = width): Point[] {
  return [-1, 1].flatMap((sx) =>
    [-1, 1].map((sy) => ({
      x: x + (sx * width) / 2,
      y: y + (sy * height) / 2,
    })),
  );
}

describe('windowSlots', () => {
  it('has room for three windows or five, more on a wider cap', () => {
    const counts = new Set<number>();
    for (const genes of everyMushroom) {
      const count = windowSlots(genes).length;
      assert.ok(count === 3 || count === 5, `${count} windows`);
      counts.add(count);
    }
    assert.deepEqual(
      [...counts].toSorted((a, b) => a - b),
      [3, 5],
    );
    const byWidth = everyMushroom.toSorted((a, b) => a.capWidth - b.capWidth);
    const [narrowest] = byWidth;
    const widest = byWidth.at(-1);
    assert.ok(narrowest && widest);
    assert.equal(windowSlots(widest).length, 5);
    assert.equal(windowSlots(narrowest).length, 3);
  });

  it('puts every pane inside the cap as it is drawn', () => {
    for (const genes of everyMushroom) {
      const [dome] = headOutlines(genes);
      for (const slot of windowSlots(genes)) {
        for (const corner of corners(slot, PANE)) {
          assert.ok(
            containsPoint(dome, corner),
            JSON.stringify({ genes, slot }),
          );
        }
      }
    }
  });

  it('keeps the row on a dome’s lower band, and on a chanterelle’s lip', () => {
    for (const genes of everyMushroom) {
      for (const { x, y } of windowSlots(genes)) {
        if (genes.species === 'chanterelle') {
          // Over its front rim, clear of the ridged funnel under it.
          for (const side of [-1, 1]) {
            assert.ok(y - PANE / 2 > capBase(genes, x + (side * PANE) / 2));
          }
          continue;
        }
        assert.ok(y - PANE / 2 > 0);
        assert.ok(y + PANE / 2 < genes.capHeight * 0.6);
      }
    }
  });

  it('leaves at least a pane’s width of cap between two windows', () => {
    for (const genes of everyMushroom) {
      const slots = windowSlots(genes);
      for (const [index, a] of slots.entries()) {
        for (const b of slots.slice(index + 1)) {
          assert.ok(Math.hypot(a.x - b.x, a.y - b.y) - PANE >= PANE - 1e-9);
        }
      }
    }
  });

  it('fills from the middle outward, each pair mirroring the other', () => {
    for (const genes of everyMushroom) {
      const [first, ...rest] = windowSlots(genes);
      assert.ok(first);
      assert.equal(first.x, 0);
      for (let index = 0; index < rest.length; index += 2) {
        const left = rest[index];
        const right = rest[index + 1];
        assert.ok(left && right);
        assert.ok(left.x < 0);
        assert.equal(right.x, -left.x);
        assert.equal(right.y, left.y);
        const inner = rest[index - 1];
        if (inner) assert.ok(right.x > inner.x);
      }
    }
  });
});

/** Every turn a slot stands a mushroom at, its lean and the layout's splay together, at their widest either way. */
const TURNS = [-0.22, 0.22];

describe('doorStations', () => {
  it('stands every door inside its stem as drawn at the turn the mushroom stands at', () => {
    let lowered = 0;
    for (const genes of everyMushroom.filter((_, index) => index % 5 === 0)) {
      for (const splay of TURNS) {
        const { genes: faced, turn } = splayed(genes, splay);
        const stem = stemOutline(faced, turn);
        const [lowest, ...rest] = doorStations(faced, turn);
        assert.ok(lowest, genes.species);
        // The lowest door is the one the levelled foot's slope reaches.
        if (lowest.y > (doorStations(faced)[0]?.y ?? Infinity)) lowered++;
        for (const door of [lowest, ...rest]) {
          const place = onStem(door);
          const line = MUSHROOM_INK / door.width;
          for (const point of outside(paintedDoor(DOOR_ASPECT), line)) {
            if (!containsPoint(stem, place(point)))
              assert.fail(
                JSON.stringify({ ...pick(genes, 'species'), turn, door }),
              );
          }
        }
      }
    }
    assert.ok(lowered > 0);
  });

  it('gives a fat stem a wide door and a slender one a narrow door', () => {
    assert.ok(meanWidth('porcini') > meanWidth('fly-agaric') * 1.2);
    assert.ok(meanWidth('chanterelle') < meanWidth('fly-agaric'));
  });

  it('frames every door a line of ink inside the stem, at every station', () => {
    for (const genes of everyMushroom) {
      const stem = stemOutline(genes);
      for (const door of stationsOf(genes)) {
        const place = onStem(door);
        const line = MUSHROOM_INK / door.width;
        for (const point of outside(paintedDoor(DOOR_ASPECT), line)) {
          if (!containsPoint(stem, place(point)))
            assert.fail(JSON.stringify({ genes, door }));
        }
      }
    }
  });

  it('rises from a sill just above the ground to under the gills', () => {
    for (const genes of everyMushroom) {
      const stations = stationsOf(genes);
      assert.ok(
        stations.length >= 8,
        `${genes.species}: ${stations.length} stations`,
      );
      const [lowest] = stations;
      assert.ok(lowest);
      assert.ok(lowest.y - lowest.height / 2 > 0);
      assert.ok(lowest.y - lowest.height / 2 < 0.035);
      for (const [index, door] of stations.slice(1).entries()) {
        assert.ok(door.y > (stations[index]?.y ?? Infinity));
      }
      const underCap = capOutlines(genes);
      const highest = stations.at(-1);
      assert.ok(highest);
      const place = onStem(highest);
      for (const point of paintedDoor(DOOR_ASPECT)) {
        for (const outline of underCap) {
          if (containsPoint(outline, place(point)))
            assert.fail(JSON.stringify(genes));
        }
      }
    }
  });
});

/** How far a spot's circle stands from the pane in `slot`: below 0 where they overlap. */
function gap(spot: Circle, slot: Point): number {
  const near = (value: number, middle: number) =>
    Math.min(middle + PANE / 2, Math.max(middle - PANE / 2, value));
  return (
    Math.hypot(spot.x - near(spot.x, slot.x), spot.y - near(spot.y, slot.y)) -
    spot.r
  );
}

describe('paintedSpots', () => {
  it('leaves no painted spot partly under a window, and takes only those it touches', () => {
    let dropped = 0;
    for (const genes of everyMushroom) {
      const slots = windowSlots(genes);
      for (let count = 0; count <= slots.length; count++) {
        const house = {
          windows: slots.slice(0, count).map(() => 'cross' as const),
          door: false,
        };
        const panes = slots.slice(0, count);
        const painted = paintedSpots(genes, house);
        for (const spot of genes.spots) {
          const touching = panes.some((slot) => gap(spot, slot) < MUSHROOM_INK);
          if (touching) dropped++;
          assert.equal(
            painted.includes(spot),
            !touching,
            JSON.stringify({ genes, spot, count }),
          );
          if (!painted.includes(spot)) continue;
          for (const slot of panes) assert.ok(gap(spot, slot) > 0);
        }
      }
    }
    // Windows go over spots often enough that the rule has work to do.
    assert.ok(dropped > 0);
  });
});

describe('furnished', () => {
  it('adds windows in the order picked, up to the row’s room', () => {
    let house: House | undefined = EMPTY_HOUSE;
    for (const kind of ['tall', 'cross', 'tall'] as const) {
      assert.ok(house !== undefined);
      house = furnished(house, kind, 3);
    }
    assert.deepEqual(house, {
      windows: ['tall', 'cross', 'tall'],
      door: false,
    });
    assert.equal(furnished(house, 'round', 3), undefined);
    assert.equal(furnished(house, 'door', 3)?.door, true);
  });

  it('puts in one door, and no second', () => {
    const doored = furnished(EMPTY_HOUSE, 'door', 3);
    assert.deepEqual(doored, { windows: [], door: true });
    assert.equal(furnished(doored, 'door', 3), undefined);
  });
});
