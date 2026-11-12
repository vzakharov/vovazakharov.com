import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEEPEST_FLOOR,
  DROP,
  eyeInFrame,
  HOLE_SIDE,
} from '@/cube/entities/world';

import { BODY_RADIUS } from './body';
import { LAND_AT, LAND_SPEED, LANDING_TIME } from './fall';
import { FIRST_LOOK, type Look, spanOf } from './look';
import {
  arrivedOn,
  type Cue,
  isStanding,
  play,
  type Player,
  pulledOf,
} from './play';
import {
  ahead,
  allOpen,
  beside,
  FRAME,
  frames,
  holed,
  NEAR,
  pull,
  room,
  shrunk,
  small,
} from './play.test-kit';
import { LEVER_REACH, PULL_SWING, SHRINK_TIME, SMALL } from './shrink';
import { EYE_HEIGHT, type Input, STILL } from './step';

const cuesOf = (played: readonly Player[]): Array<Cue['cue']> =>
  played.flatMap(({ cues }) => cues.map(({ cue }) => cue));

const noLook: Look = {
  ...FIRST_LOOK,
  hands: 0,
  glance: 0,
  moment: 'shrink',
  sayAt: 0.4,
};

describe('play, pulling the lever', () => {
  it('shrinks the body to half where it stands, its feet on the slab', () => {
    const played = shrunk();
    const start = beside().pose;
    for (const [index, { pose, act }] of played.entries()) {
      assert.deepEqual([pose.n, pose.x, pose.y], [room.n, room.x, room.y]);
      assert.deepEqual([pose.u, pose.v], [start.u, start.v]);
      assert.ok(Math.abs(pose.eyeAbove - EYE_HEIGHT * pose.scale) < NEAR);
      assert.ok(pose.scale <= (played[index - 1]?.pose.scale ?? 1));
      assert.equal(act === null, index === played.length - 1);
    }
    assert.equal(played.at(-1)?.pose.scale, SMALL);
    const at = played.findIndex(({ pose }) => pose.scale === SMALL);
    assert.ok(Math.abs((at + 1) * FRAME - SHRINK_TIME) < FRAME + NEAR);
  });

  it('roots a shrinking body that tries to walk', () => {
    const start = beside().pose;
    const walked = frames(beside(), pull, ahead, isStanding);
    assert.deepEqual(
      [walked.at(-2)?.pose.u, walked.at(-2)?.pose.v],
      [start.u, start.v],
    );
  });

  it('takes the gaze for the look and hands it back where it was', () => {
    const start = beside().pose;
    const turning: Input = { ...STILL, yawBy: 0.01, elevationBy: 0.01 };
    const played = frames(beside(), pull, turning, isStanding);
    const span = spanOf(FIRST_LOOK);
    const down = Math.min(...played.map(({ pose }) => pose.elevation));
    assert.ok(down < -0.9, 'looks down at its hands');
    const yaws = played.map(({ pose }) => pose.yaw - start.yaw);
    assert.ok(Math.max(...yaws) > 0.5 && Math.min(...yaws) < -0.5);
    const freed = played.at(-1)?.pose;
    assert.ok(freed);
    // The first frame past the look: the resting gaze and that frame's turn.
    assert.ok(Math.abs(freed.yaw - start.yaw - 0.01) < NEAR);
    assert.ok(Math.abs(freed.elevation - start.elevation - 0.01) < NEAR);
    assert.ok(span > SHRINK_TIME);
    assert.ok(Math.abs(played.length * FRAME - span) < FRAME + NEAR);
  });

  it('leaves the gaze free through a shrink with no look', () => {
    const turning: Input = { ...STILL, yawBy: 0.01 };
    const played = frames(beside({ yaw: 1 }), pull, turning, isStanding, {
      ...holed,
      shrinkLook: noLook,
    });
    assert.ok(Math.abs(played.length * FRAME - SHRINK_TIME) < FRAME + NEAR);
    const yaw = played.at(-1)?.pose.yaw ?? 0;
    assert.ok(Math.abs(yaw - 1 - 0.01 * (played.length - 1)) < 1e-6);
  });

  it('pulls from anywhere in reach, hole underfoot or not, and nowhere else', () => {
    const shrinks = (player: Player, here = holed) =>
      !isStanding(play(player, pull, FRAME, allOpen, here));
    assert.ok(shrinks(beside()));
    assert.ok(shrinks(beside({ u: 0.25 })), 'standing on the hole');
    assert.ok(shrinks(beside({ u: LEVER_REACH - 0.01 })));
    assert.ok(!shrinks(beside({ u: LEVER_REACH + 0.01 })));
    assert.equal(isStanding(play(beside(), pull, FRAME, allOpen, null)), true);
    assert.ok(!shrinks(small()), 'a small body pulls nothing');
  });

  it('swings the lever down, and holds it while the body is small', () => {
    assert.equal(pulledOf(beside()), null);
    const played = [...shrunk(), ...frames(small(), STILL, STILL, () => true)];
    for (const [index, player] of played.slice(0, -1).entries()) {
      const pulled = pulledOf(player);
      assert.deepEqual(pulled?.room, room);
      assert.ok(pulled.swung > 0 && pulled.swung <= 1);
      assert.ok(
        pulled.swung >= (pulledOf(played[index - 1] ?? beside())?.swung ?? 0),
      );
      if ((index + 1) * FRAME >= PULL_SWING) assert.equal(pulled.swung, 1);
    }
    assert.equal(pulledOf(played.at(-1) ?? beside())?.swung, 1);
  });

  it('cues the lever and the shrink at once, and the first words at the hands', () => {
    const played = shrunk();
    assert.deepEqual(played[0]?.cues, [{ cue: 'lever' }, { cue: 'shrink' }]);
    assert.deepEqual(cuesOf(played), ['lever', 'shrink', 'say']);
    const said = played.findIndex(({ cues }) =>
      cues.some((cue) => cue.cue === 'say' && cue.moment === 'first-shrink'),
    );
    assert.ok(Math.abs((said + 1) * FRAME - FIRST_LOOK.sayAt) < FRAME + NEAR);
    const later = shrunk(noLook).flatMap(({ cues }) => cues);
    assert.deepEqual(later.at(-1), { cue: 'say', moment: 'shrink' });
  });
});

/** How far east `to` is of `from`, in room sides. */
const went = (from: Player, to: Player) =>
  Number(to.pose.x - from.pose.x) + to.pose.u - from.pose.u;

describe('play, small', () => {
  it('walks the floor at half the pace, half the width and half the height', () => {
    const start = small();
    const one = play(start, ahead, 1, allOpen, null);
    const whole = play(beside({ yaw: 0 }), ahead, 1, allOpen, null);
    assert.ok(
      Math.abs(went(start, one) - went(beside(), whole) * SMALL) < NEAR,
    );
    assert.equal(one.pose.scale, SMALL);
    assert.equal(one.pose.eyeAbove, EYE_HEIGHT * SMALL);
    assert.equal(one.act, null);
  });

  it('steps as often for its size as a whole body, a run louder than a walk', () => {
    const count = (start: Player, input: Input) => {
      let player = start;
      const strengths: number[] = [];
      for (let frame = 0; frame < 120; frame += 1) {
        player = play(player, input, FRAME, allOpen, null);
        for (const cue of player.cues) {
          assert.ok(cue.cue === 'step');
          strengths.push(cue.strength);
        }
      }
      return strengths;
    };
    const run = count(beside({ yaw: 0 }), ahead);
    const smallRun = count(small(), ahead);
    const stroll = count(beside({ yaw: 0 }), { ...ahead, walking: true });
    assert.ok(run.length > 5);
    assert.equal(smallRun.length, run.length);
    assert.ok(stroll.length < run.length && stroll.length > 0);
    assert.ok(run.every((strength) => Math.abs(strength - 1) < 1e-6));
    assert.ok(stroll.every((strength) => strength < 0.5 && strength > 0.3));
    assert.equal(count(beside(), STILL).length, 0);
  });
});

/** A small body walking east from beside the hole until it stands a floor down. */
const descent = (): Player[] =>
  frames(
    small(),
    ahead,
    ahead,
    (player) => player.pose.n === room.n + 1 && isStanding(player),
  );

describe('play, the hole', () => {
  it('lets a whole body walk over it', () => {
    const played = frames(
      beside({ yaw: 0 }),
      { ...ahead, walking: true },
      { ...ahead, walking: true },
      ({ pose }) => pose.u > 0.4,
    );
    assert.ok(played.some(({ pose }) => Math.abs(pose.u - 0.25) < 0.01));
    for (const { pose, act } of played) {
      assert.equal(act, null);
      assert.equal(pose.n, room.n);
      assert.equal(pose.eyeAbove, EYE_HEIGHT);
    }
  });

  it('hops a small body in at the rim, up and over, then down the shaft', () => {
    const played = descent();
    const hop = played.findIndex(({ act }) => act?.act === 'falling');
    const before = played[hop - 1];
    const jumped = played[hop];
    assert.ok(before && jumped);
    assert.equal(before.act, null);
    assert.deepEqual(jumped.cues.at(-1), { cue: 'jump' });
    const rim = 0.25 - HOLE_SIDE / 2;
    assert.ok(jumped.pose.u > rim - BODY_RADIUS * SMALL);
    assert.ok(jumped.pose.u < rim + BODY_RADIUS * SMALL);
    const falling = played.filter(({ act }) => act?.act === 'falling');
    const heights = falling.map(({ pose }) => pose.eyeAbove);
    assert.ok(Math.max(...heights) > EYE_HEIGHT * SMALL + 0.01, 'goes up');
    assert.ok(Math.min(...heights) < EYE_HEIGHT * SMALL - DROP + 0.02, 'down');
    const clear = HOLE_SIDE / 2 - BODY_RADIUS * SMALL + NEAR;
    for (const { pose } of falling) {
      assert.equal(pose.n, room.n);
      if (pose.eyeAbove < EYE_HEIGHT * SMALL) {
        assert.ok(Math.abs(pose.u - 0.25) <= clear, 'inside the shaft');
        assert.ok(Math.abs(pose.v - 0.25) <= clear);
      }
    }
    assert.ok(Math.abs(falling.length * FRAME - LAND_AT) < 2 * FRAME);
  });

  it('lands a whole body of the floor below, straight under the shaft', () => {
    const played = descent();
    const last = played.findLast(({ act }) => act?.act === 'falling');
    const landed = played.find(({ act }) => act?.act === 'landing');
    assert.ok(last && landed);
    assert.deepEqual(
      [landed.pose.n, landed.pose.x, landed.pose.y],
      [room.n + 1, 2n * room.x, 2n * room.y],
    );
    assert.equal(landed.pose.scale, 1);
    assert.equal(landed.pose.eyeAbove, EYE_HEIGHT);
    assert.equal(pulledOf(landed), null);
    assert.deepEqual(landed.cues, [
      { cue: 'landing', speed: LAND_SPEED / SMALL },
      { cue: 'say', moment: 'landing' },
    ]);
    // The eye lands under where it fell, on the same line down.
    const [a, b] = [
      eyeInFrame(room, last.pose).eye,
      eyeInFrame(room, landed.pose).eye,
    ];
    assert.ok(Math.abs(a[0] - b[0]) < 1e-3 && Math.abs(a[2] - b[2]) < 1e-3);
    assert.ok(Math.abs(landed.pose.yaw - last.pose.yaw) < NEAR);
  });

  it('dips on landing and straightens, walking all the while', () => {
    const played = descent();
    const landing = played.filter(({ act }) => act?.act === 'landing');
    const heights = landing.map(({ pose }) => pose.eyeAbove);
    assert.ok(Math.min(...heights) < EYE_HEIGHT * 0.8);
    assert.ok(heights.every((height) => height <= EYE_HEIGHT));
    assert.ok(Math.abs(landing.length * FRAME - LANDING_TIME) < 2 * FRAME);
    const [first, last] = [landing[0], played.at(-1)];
    assert.ok(first && last);
    assert.equal(last.pose.eyeAbove, EYE_HEIGHT);
    assert.equal(last.act, null);
    assert.ok(last.pose.u > first.pose.u, 'walks through the landing');
  });

  it('keeps a small body off a floor with no hole known', () => {
    const played = frames(
      small(),
      ahead,
      ahead,
      ({ pose }) => pose.u > 0.4,
      null,
    );
    assert.ok(
      played.every(({ act, pose }) => act === null && pose.n === room.n),
    );
  });
});

/** A frame asking for floor `floor`. */
const goTo = (floor: number): Input => ({ ...STILL, goTo: floor });

describe('play, going to a floor', () => {
  it('stands the body in the floor’s north-west room, keeping its gaze', () => {
    const start = beside({ yaw: 1, elevation: -0.25 });
    const gone = play(start, goTo(40), FRAME, allOpen, null);
    assert.equal(gone.act, null);
    assert.deepEqual(gone.pose, {
      ...arrivedOn(40),
      yaw: 1,
      elevation: -0.25,
    });
  });

  it('makes a small body whole there, its lever let go', () => {
    const gone = play(small(), goTo(1), FRAME, allOpen, holed);
    assert.equal(gone.pose.n, 1);
    assert.equal(gone.pose.scale, 1);
    assert.equal(gone.pose.eyeAbove, EYE_HEIGHT);
    assert.equal(pulledOf(gone), null);
  });

  it('goes to no floor the cube lacks', () => {
    for (const floor of [0, DEEPEST_FLOOR + 1]) {
      assert.equal(
        play(beside(), goTo(floor), 0, allOpen, null).pose.n,
        room.n,
      );
    }
    assert.equal(
      play(beside(), goTo(DEEPEST_FLOOR), 0, allOpen, null).pose.n,
      DEEPEST_FLOOR,
    );
  });

  it('leaves a shrinking body to its shrink', () => {
    const first = play(beside(), pull, FRAME, allOpen, holed);
    const next = play(first, goTo(9), FRAME, allOpen, holed);
    assert.equal(next.pose.n, room.n);
    assert.equal(next.act?.act, 'shrinking');
  });
});
