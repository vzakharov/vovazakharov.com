import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { outwardNormals, weightedOutline } from '../ui/scene/ink';
import { meadowLayout } from '../ui/scene/layout';
import { VIEWPORTS, VISITS } from '../ui/scene/viewports';
import { ellipse, placedAt, type Point, ROUND_STEPS } from './geometry';
import { LIGHT_STEP, litCrest, litTurn } from './insect-light';
import { wrap } from './insect-motion';
import { type Light, sunLight, turnedLight } from './light';
import { between, mulberry32 } from './random';

const ORIGIN = { x: 0, y: 0 };
const angleOf = ({ x, y }: Point) => Math.atan2(y, x);
const apart = (a: Point, b: Point) => Math.abs(wrap(angleOf(a) - angleOf(b)));

/** The sun on each screen the meadow is made for. */
const SUNS: ReadonlyArray<[string, Light]> = VIEWPORTS.map(
  ([name, width, height]) => [
    name,
    sunLight(meadowLayout(width, height, VISITS[0] ?? 0)),
  ],
);

/**
 * A body turning frame by frame through `turns` the way the view poses it,
 * its lit parts painted afresh only as `litTurn` says: the turn each frame is
 * shown at, and the light its parts were painted in, in its own frame.
 */
function posed(
  sun: Light,
  turns: readonly number[],
): Array<{ turn: number; own: Point; relit: boolean }> {
  let painted = 0;
  return turns.map((turn) => {
    const next = litTurn(painted, turn);
    const relit = next !== painted;
    painted = next;
    return { turn, own: turnedLight(sun, painted).toward, relit };
  });
}

/** A flight's turns: a seeded walk turning up to `most` a frame, the fastest a fly's body turns, and a few snaps. */
function flightTurns(seed: number, frames: number, most: number): number[] {
  const random = mulberry32(seed);
  let turn = between(random, -Math.PI, Math.PI);
  let rate = 0;
  return Array.from({ length: frames }, (_, frame) => {
    rate = Math.max(-most, Math.min(most, rate + between(random, -0.05, 0.05)));
    turn = wrap(turn + (frame % 97 === 96 ? between(random, -3, 3) : rate));
    return turn;
  });
}

/** Every heading round the circle, a step of a degree. */
const HEADINGS = Array.from(
  { length: 360 },
  (_, index) => (index / 180) * Math.PI - Math.PI,
);

describe('an insect in the sun, whatever its heading', () => {
  for (const [screen, sun] of SUNS) {
    it(`shows its shine toward the sun on screen, within the light's step, on ${screen}`, () => {
      for (const seed of [1, 2, 3]) {
        for (const { turn, own } of posed(sun, [
          ...HEADINGS,
          ...flightTurns(seed, 2000, 0.6),
        ])) {
          const shine = placedAt(ORIGIN, turn, litCrest(own, [1, 1], 0.5));
          assert.ok(
            apart(shine, sun.toward) <= LIGHT_STEP + 1e-9,
            `turned ${turn.toFixed(2)}: shine ${apart(shine, sun.toward).toFixed(2)} rad off the sun`,
          );
          // A bee's long abdomen still shines on the sun's side.
          const long = placedAt(ORIGIN, turn, litCrest(own, [0.6, 1], 0.5));
          assert.ok(long.x * sun.toward.x + long.y * sun.toward.y > 0);
        }
      }
    });

    it(`inks its edge heaviest turned from the sun on screen on ${screen}`, () => {
      const outline = ellipse(ORIGIN, 10);
      const normals = outwardNormals(outline);
      const shade = { x: -sun.toward.x, y: -sun.toward.y };
      for (const { turn, own } of posed(sun, flightTurns(4, 1000, 0.6))) {
        const inked = weightedOutline(outline, 1, own);
        const widths = inked.map((point, index) =>
          Math.hypot(
            point.x - (outline[index]?.x ?? 0),
            point.y - (outline[index]?.y ?? 0),
          ),
        );
        const heaviest = widths.indexOf(Math.max(...widths));
        const normal = normals[heaviest] ?? ORIGIN;
        assert.ok(
          apart(placedAt(ORIGIN, turn, normal), shade) <=
            LIGHT_STEP + Math.PI / ROUND_STEPS + 1e-9,
          `turned ${turn.toFixed(2)}`,
        );
      }
    });

    it(`lights two bees facing in on opposite rims of a flower from the same side on ${screen}`, () => {
      const [left, right] = [Math.PI / 2, -Math.PI / 2].map((facing) => {
        const last = posed(sun, [0, facing]).at(-1);
        assert.ok(last);
        return placedAt(ORIGIN, last.turn, litCrest(last.own, [1, 1], 1));
      });
      assert.ok(left && right);
      assert.ok(apart(left, right) <= 2 * LIGHT_STEP);
      assert.ok(Math.sign(left.x) === Math.sign(sun.toward.x));
      assert.ok(Math.sign(right.x) === Math.sign(sun.toward.x));
    });
  }

  it('paints its light afresh once a step, not every frame it turns', () => {
    const sun = SUNS[0]?.[1];
    assert.ok(sun);
    // Round once over two seconds, a little every frame.
    const turns = Array.from({ length: 120 }, (_, frame) =>
      wrap(((frame + 1) / 120) * Math.PI * 2),
    );
    const relights = posed(sun, turns).filter(({ relit }) => relit).length;
    assert.ok(
      relights <= Math.ceil((Math.PI * 2) / LIGHT_STEP),
      `${String(relights)} relights`,
    );
    assert.ok(relights >= Math.floor((Math.PI * 2) / LIGHT_STEP) - 1);
  });
});
