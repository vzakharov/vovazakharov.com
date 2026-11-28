import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { distance, heading, type Point, turned } from '@/clip/shared/ink';

import {
  carried,
  fitted,
  fold,
  JOINTS,
  lerpPose,
  type Pose,
  reaching,
  SIDES,
  STANDARD_BUILD,
} from './pose';
import { POSES } from './poses';

const near = (actual: number, expected: number, slack = 1e-6) => {
  assert.ok(
    Math.abs(actual - expected) <= slack,
    `${String(actual)} is not within ${String(slack)} of ${String(expected)}`,
  );
};

const nearPoint = (actual: Point, expected: Point, slack = 1e-6) => {
  near(actual[0], expected[0], slack);
  near(actual[1], expected[1], slack);
};

const armBones = (pose: Pose) =>
  SIDES.flatMap((side) => [
    distance(pose[`shoulder${side}`], pose[`elbow${side}`]),
    distance(pose[`elbow${side}`], pose[`wrist${side}`]),
  ]);

describe('geometry', () => {
  it('turns a point clockwise on screen about a pivot', () => {
    nearPoint(turned([1, 0], [0, 0], 90), [0, 1]);
    nearPoint(turned([3, 2], [2, 2], 180), [1, 2]);
  });

  it('reads a heading in degrees clockwise off straight down', () => {
    near(heading([0, 0], [0, 5]), 0);
    near(Math.abs(heading([0, 0], [5, 0])), 90);
    near(heading([0, 0], [5, 0]), -heading([0, 0], [-5, 0]));
  });
});

describe('lerpPose', () => {
  it('gives each end at 0 and 1 and the midpoint between', () => {
    for (const joint of JOINTS) {
      nearPoint(
        lerpPose(POSES.stand, POSES.cheer, 0)[joint],
        POSES.stand[joint],
      );
      nearPoint(
        lerpPose(POSES.stand, POSES.cheer, 1)[joint],
        POSES.cheer[joint],
      );
    }
    const half = lerpPose(POSES.stand, POSES.cheer, 0.5);
    nearPoint(half.wristL, [
      (POSES.stand.wristL[0] + POSES.cheer.wristL[0]) / 2,
      (POSES.stand.wristL[1] + POSES.cheer.wristL[1]) / 2,
    ]);
  });
});

describe('fold', () => {
  it('lands the end on a target in reach and keeps both bones', () => {
    const { middle, end } = fold([0, 0], [60, 40], 50, 45, [1, 0]);
    nearPoint(end, [60, 40]);
    near(distance([0, 0], middle), 50);
    near(distance(middle, end), 45);
  });

  it('folds to the side it is told to prefer', () => {
    const right = fold([0, 0], [0, 60], 50, 45, [1, 0]).middle;
    const left = fold([0, 0], [0, 60], 50, 45, [-1, 0]).middle;
    assert.ok(right[0] > 0);
    near(left[0], -right[0]);
  });

  it('stretches straight towards a target out of reach', () => {
    const { middle, end } = fold([0, 0], [0, 500], 50, 45, [1, 0]);
    near(end[1], 95, 0.02);
    near(middle[0], 0, 1);
  });
});

describe('reaching', () => {
  it('puts the wrist on its target and keeps the arm its length', () => {
    const target: Point = [POSES.stand.shoulderL[0] - 40, 60];
    const pose = reaching(POSES.stand, { L: target });
    nearPoint(pose.wristL, target);
    for (const [n, bone] of armBones(pose).entries()) {
      near(bone, armBones(POSES.stand)[n] ?? Number.NaN);
    }
  });

  it('leaves the other arm and everything else alone', () => {
    const pose = reaching(POSES.stand, { L: [-80, 60] });
    assert.deepEqual(
      { ...pose, elbowL: 0, wristL: 0 },
      { ...POSES.stand, elbowL: 0, wristL: 0 },
    );
  });

  it('stops the wrist a palm short, along the forearm', () => {
    const target: Point = [POSES.stand.shoulderR[0] + 50, 40];
    const pose = reaching(POSES.stand, { R: target }, 17);
    near(distance(pose.wristR, target), 17, 1.5);
  });
});

describe('carried', () => {
  it('keeps the feet planted and the legs their length', () => {
    const pose = carried(POSES.wide, { sway: 14, dip: 10, lean: 3 });
    for (const side of SIDES) {
      assert.deepEqual(pose[`foot${side}`], POSES.wide[`foot${side}`]);
      near(
        distance(pose[`hip${side}`], pose[`knee${side}`]),
        distance(POSES.wide[`hip${side}`], POSES.wide[`knee${side}`]),
      );
    }
    nearPoint(pose.hipL, [POSES.wide.hipL[0] + 14, POSES.wide.hipL[1] + 10], 4);
  });

  it('is the pose itself when nothing is carried', () => {
    const pose = carried(POSES.stand, {});
    for (const side of SIDES) {
      nearPoint(pose[`knee${side}`], POSES.stand[`knee${side}`], 0.5);
    }
    assert.deepEqual(pose.head, POSES.stand.head);
  });
});

describe('fitted', () => {
  it('returns a pose unchanged on the standard build', () => {
    const pose = fitted(POSES.cheer, STANDARD_BUILD);
    for (const side of SIDES) {
      nearPoint(pose[`wrist${side}`], POSES.cheer[`wrist${side}`]);
      nearPoint(pose[`foot${side}`], POSES.cheer[`foot${side}`]);
    }
  });

  it('scales each limb from the joint it hangs on', () => {
    const build = { ...STANDARD_BUILD, wide: 1.5, arms: 2, legs: 0.5 };
    const pose = fitted(POSES.stand, build);
    near(pose.shoulderL[0], POSES.stand.shoulderL[0] * 1.5);
    near(
      distance(pose.shoulderL, pose.elbowL),
      2 * distance(POSES.stand.shoulderL, POSES.stand.elbowL),
    );
    near(
      distance(pose.kneeR, pose.footR),
      0.5 * distance(POSES.stand.kneeR, POSES.stand.footR),
    );
  });
});
