import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { flowerGenes, flowerHead } from '../../model/flower-genes';
import type { Point } from '../../model/geometry';
import { OPENING_EYE, planeOf, zAt } from '../../model/ground';
import { MUSHROOM_SPECIES, mushroomGenes } from '../../model/mushroom-genes';
import { TAP_PARTS, tapArea, toCanvas } from '../../model/mushroom-outline';
import { splayed } from '../../model/mushroom-pose';
import { pinholeOf } from '../../model/pinhole';
import { bedPlace, depthOf, SIDE_OVERHANG } from './bed-place';
import { placeIn } from './clump-layout';
import { standingFlowers } from './flower-plots';
import { castShadow } from './mushroom-light';
import {
  browRow,
  cull,
  D_SEE,
  ofGround,
  sunk,
  sunkAway,
  type View,
  viewAt,
} from './view';
import { EITHER_WAY } from './viewports';
import { opened } from './visit-play';

/** How near the opening placement stands to the layout's, in CSS px. */
const SAME_PX = 0.5;

const SEEDS = [1, 42];

describe('a bed object at the opening eye', () => {
  for (const [name, width, height] of EITHER_WAY) {
    it(`stands where the layout stands it, less the opening crop's left, on a ${name} screen`, () => {
      for (const seed of SEEDS) {
        const { meadow, layout, flowers } = opened(seed, width, height, true);
        const { camera, mushrooms: ground } = layout;
        const view = viewAt(camera, OPENING_EYE);
        const left = (camera.world - camera.width) / 2;
        const laid: Array<{ what: string; foot: Point; at: Point }> = [
          ...meadow.mushrooms.flatMap((mushroom) => {
            const { id, foot } = mushroom;
            const at = placeIn(ground, mushroom);
            return at ? [{ what: id, foot, at }] : [];
          }),
          ...standingFlowers(layout, flowers, [], meadow.mushrooms, []).map(
            ({ id, foot, place }) => ({ what: id, foot, at: place }),
          ),
        ];
        assert.ok(laid.length > 14, `visit ${String(seed)}: too few laid`);
        for (const { what, foot, at } of laid) {
          const place = bedPlace(view, foot);
          const where = `visit ${String(seed)}: ${what}`;
          // Past the brow, which curves below the ground's top row toward
          // the screen's edges, a thing laid by the screen's side, or off
          // it, sinks under the brow from the opening on.
          if (place.distance > D_SEE) {
            assert.ok(place.behind, where);
            assert.ok(place.y >= browRow(view, place.x) - 1e-6, where);
            continue;
          }
          // The lens shows the layout's ground at the azimuth the opening
          // crop's pinhole sees it at, its row bent as the brow is.
          const { x: middle, y: horizon, focal } = pinholeOf(view);
          const azimuth = Math.atan((at.x - left - middle) / focal);
          const bend = Math.cos(azimuth) * Math.hypot(1, azimuth);
          assert.ok(
            Math.abs(place.x - (middle + focal * azimuth)) < SAME_PX,
            where,
          );
          assert.ok(
            Math.abs(place.y - (horizon + (at.y - horizon) * bend)) < SAME_PX,
            where,
          );
          assert.ok(Math.abs(place.zoom - bend) < 1e-6, where);
          assert.equal(place.depth, place.y, where);
          assert.ok(place.drawn, where);
          assert.equal(place.behind, false, where);
        }
      }
    });
  }
});

describe("a bed object past the ground's top row", () => {
  for (const [name, width, height] of EITHER_WAY) {
    it(`stands its foot below that row, under the ground and over the near hills, the farther behind, its parts in order, on a ${name} screen`, () => {
      const { layout } = opened(1, width, height, false);
      const view = viewAt(layout.camera, OPENING_EYE);
      const near = bedPlace(view, planeOf({ x: 0, z: zAt(0.02) }));
      assert.equal(near.behind, false);
      let farther = Infinity;
      for (const down of [-0.02, -0.3, -0.6, -1]) {
        const place = bedPlace(view, planeOf({ x: 0.4, z: zAt(down) }));
        const where = `down ${String(down)}`;
        assert.ok(place.drawn && place.behind, where);
        assert.ok(place.y > layout.camera.groundTop, where);
        const [shadow, body, house] = [-0.5, 0, 0.1].map((nearer) =>
          depthOf(place, nearer),
        );
        for (const depth of [shadow, body, house]) {
          assert.ok(depth !== undefined && depth > -4 && depth < -3, where);
        }
        assert.ok(
          shadow !== undefined && body !== undefined && house !== undefined,
        );
        assert.ok(shadow < body && body < house, where);
        assert.ok(body < farther, `${where}: sorts before a nearer one`);
        farther = body;
      }
    });

    it(`stops drawing a thing of a given height once it has sunk away, and never one of none given, on a ${name} screen`, () => {
      const { layout } = opened(1, width, height, false);
      const view = viewAt(layout.camera, OPENING_EYE);
      const tall = layout.camera.unit * 0.3;
      assert.ok(bedPlace(view, planeOf({ x: 0, z: zAt(-0.02) }), tall).drawn);
      const far = planeOf({ x: 0, z: zAt(-1) });
      assert.equal(bedPlace(view, far, tall).drawn, false);
      assert.ok(bedPlace(view, far).drawn);
    });
  }
});

/**
 * A mushroom's height and how far it reaches sideways from its foot, its
 * cast shadow's widest included, in canvas px at `size`, as the bed paints it.
 */
function mushroomReach(
  seeded: Parameters<typeof mushroomGenes>[0],
  size: number,
  splay: number,
): { tall: number; reach: number } {
  const { genes, turn } = splayed(mushroomGenes(seeded), splay);
  const canvas = toCanvas(size);
  const area = tapArea(genes, turn);
  const points = TAP_PARTS.flatMap((part) =>
    area[part].map((point) => canvas(point)),
  );
  const shadows = [-1, 1].flatMap((x) =>
    castShadow([genes.capWidth * size * 0.8, size * 0.07], {
      toward: { x, y: 0 },
    }),
  );
  return {
    tall: -Math.min(...points.map(({ y }) => y)),
    reach: Math.max(
      ...points.map(({ x }) => Math.abs(x)),
      ...shadows.map(({ x, across }) => Math.abs(x) + across / 2),
    ),
  };
}

describe('the side overhang', () => {
  it("covers every mushroom's widest reach, its shadow's included, in its height", () => {
    for (const species of MUSHROOM_SPECIES) {
      for (const seed of Array.from({ length: 60 }, (_, index) => index)) {
        for (const splay of [-1, 0, 1]) {
          const { tall, reach } = mushroomReach({ species, seed }, 1, splay);
          assert.ok(reach < SIDE_OVERHANG * tall, `${species} ${String(seed)}`);
        }
      }
    }
  });
});

/** Whether the bed drew a thing before the side cull: near enough and not sunk away. */
function drawnUnculled(view: View, foot: Point, height: number): boolean {
  const placed = ofGround(view, foot);
  const shown = sunk(view, placed);
  return !cull(placed) && !sunkAway(view, shown, height * shown.zoom);
}

describe("a bed object off the screen's sides", () => {
  for (const [name, width, height] of EITHER_WAY) {
    it(`is not drawn behind the eye within sight, on a ${name} screen`, () => {
      const { layout } = opened(1, width, height, false);
      const tall = layout.camera.unit * 0.3;
      const foot = planeOf({ x: 0, z: zAt(0.5) });
      for (const heading of [Math.PI, -Math.PI / 2, Math.PI / 2]) {
        const view = viewAt(layout.camera, { ...OPENING_EYE, heading });
        const place = bedPlace(view, foot, tall);
        const where = `heading ${String(heading)}`;
        assert.ok(place.distance < D_SEE, where);
        assert.ok(drawnUnculled(view, foot, tall), `${where}: drawn unculled`);
        assert.ok(place.x < 0 || place.x > width, where);
        assert.equal(place.drawn, false, where);
      }
    });

    it(`is drawn just past a side by less than its overhang, and not past it, on a ${name} screen`, () => {
      const { layout } = opened(1, width, height, false);
      const tall = layout.camera.unit * 0.3;
      const foot = planeOf({ x: 0, z: zAt(0.5) });
      const at = (heading: number) =>
        bedPlace(
          viewAt(layout.camera, { ...OPENING_EYE, heading }),
          foot,
          tall,
        );
      for (const side of [-1, 1]) {
        for (const share of [0.1, 0.9, 1.1]) {
          // Turns until the foot stands `share` of its overhang past the side.
          const past = (place: ReturnType<typeof at>) =>
            (side > 0 ? place.x - width : -place.x) -
            share * SIDE_OVERHANG * tall * place.zoom;
          const turn = [-1, 1]
            .flatMap((way) =>
              Array.from({ length: 300 }, (_, step) => way * step * 0.01),
            )
            .find((heading) => past(at(heading)) > 0);
          assert.ok(turn !== undefined, 'never past');
          let [lo, hi] = [0, turn];
          for (let step = 0; step < 50; step += 1) {
            const mid = (lo + hi) / 2;
            if (past(at(mid)) * past(at(lo)) > 0) lo = mid;
            else hi = mid;
          }
          const place = at((lo + hi) / 2);
          const where = `side ${String(side)}, ${String(share)} of its overhang`;
          assert.ok(place.x < 0 || place.x > width, where);
          assert.equal(place.drawn, share < 1, where);
        }
      }
    });

    it(`draws at the opening eye every thing reaching onto the screen as before, on a ${name} screen`, () => {
      for (const seed of SEEDS) {
        const { meadow, layout, flowers } = opened(seed, width, height, true);
        const view = viewAt(layout.camera, OPENING_EYE);
        const things = [
          ...meadow.mushrooms.flatMap((mushroom) => {
            const at = placeIn(layout.mushrooms, mushroom);
            if (!at) return [];
            const { id: what, foot } = mushroom;
            const { tall, reach } = mushroomReach(mushroom, at.size, at.splay);
            return [{ what, foot, tall, reach }];
          }),
          ...standingFlowers(layout, flowers, [], meadow.mushrooms, []).map(
            ({ id, foot, place }) => {
              const flower = flowers.find((each) => each.id === id);
              assert.ok(flower);
              const head = flowerHead(flowerGenes(flower), place.size);
              const reach = Math.abs(head.x) + head.r;
              return { what: id, foot, tall: head.r - head.y, reach };
            },
          ),
        ];
        let reaching = 0;
        for (const { what, foot, tall, reach } of things) {
          const place = bedPlace(view, foot, tall);
          const across = reach * place.zoom;
          if (place.x + across < 0 || place.x - across > width) continue;
          reaching += 1;
          const where = `visit ${String(seed)}: ${what}`;
          assert.equal(place.drawn, drawnUnculled(view, foot, tall), where);
        }
        assert.ok(reaching > 5, `visit ${String(seed)}: too few reaching`);
      }
    });
  }
});
