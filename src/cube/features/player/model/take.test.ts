import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pillOn } from '@/cube/entities/world';

import { play } from './play';
import { allOpen, beside, FRAME, frames, holed, use } from './play.test-kit';
import { type Cue, isStanding, type Player, takenOf } from './player';
import { type Input, STILL } from './step';
import { canTake, isAsking, PILL_REACH } from './take';

const [PILL_U, , PILL_V] = pillOn(holed.shelf).centre;

/** A whole body on floor 1 where `beside` stands on floor 3. */
const first = (): Player => beside({ n: 1, x: 0n, y: 0n });

const yes: Input = { ...STILL, answer: 'yes' };
const no: Input = { ...STILL, answer: 'no' };

const cuesOf = (played: readonly Player[]): Array<Cue['cue']> =>
  played.flatMap(({ cues }) => cues.map(({ cue }) => cue));

/** Floor 1's pill taken and held, up to the first frame that asks about it. */
const asked = (): Player[] => frames(first(), use, STILL, isAsking);

/** Whether `player` is through with its pill, one way or the other. */
const isThrough = ({ act }: Player): boolean => act?.act !== 'taking';

const last = (played: readonly Player[]): Player => {
  const player = played.at(-1);
  assert.ok(player);
  return player;
};

describe('canTake', () => {
  it('takes an arm’s length and a gaze turned the pill’s way', () => {
    const { pose } = beside();
    assert.ok(canTake(pose, holed.shelf));
    assert.ok(canTake({ ...pose, elevation: -1.2 }, holed.shelf));
    assert.ok(canTake({ ...pose, yaw: Math.PI - 1 }, holed.shelf));
    assert.ok(!canTake({ ...pose, yaw: Math.PI - 1.2 }, holed.shelf));
    assert.ok(!canTake({ ...pose, yaw: 0 }, holed.shelf));
    const edge = PILL_U + PILL_REACH;
    assert.ok(canTake({ ...pose, u: edge - 0.001, v: PILL_V }, holed.shelf));
    assert.ok(!canTake({ ...pose, u: edge + 0.001, v: PILL_V }, holed.shelf));
  });

  it('is beyond a small body', () => {
    assert.ok(!canTake({ ...beside().pose, scale: 0.5 }, holed.shelf));
  });
});

describe('play, taking the pill', () => {
  it('leaves a body out of reach, or looking away, walking', () => {
    for (const over of [{ u: 0.6 }, { yaw: 0 }]) {
      const next = play(beside(over), use, FRAME, allOpen, holed);
      assert.ok(isStanding(next));
      assert.equal(takenOf(next), null);
    }
  });

  it('roots the body and aims its gaze at the pill while the hand reaches', () => {
    const start = beside({ yaw: Math.PI - 0.6 });
    const reaching = frames(
      start,
      use,
      { ...STILL, walk: 1, yawBy: 0.3 },
      (player) => takenOf(player) !== null,
    );
    const held = last(reaching);
    assert.equal(held.pose.u, start.pose.u);
    assert.equal(held.pose.v, start.pose.v);
    assert.ok(Math.abs(held.pose.yaw - Math.PI) < 0.02, 'at the pill');
    assert.ok(held.pose.elevation < -0.5, 'down at the shelf');
    assert.deepEqual(takenOf(held), { room: { n: 3, x: 1n, y: 2n } });
    assert.ok(reaching.length > 20, 'a reach takes its time');
  });

  it('swallows unasked below floor 1', () => {
    const played = frames(beside(), use, STILL, ({ act }) => act === null);
    assert.ok(!played.some((player) => isAsking(player)));
    assert.deepEqual(cuesOf(played).slice(0, 3), ['pill', 'swallow', 'shrink']);
    assert.equal(last(played).pose.scale, 0.5);
  });

  it('holds floor 1’s pill before the eyes until it is answered', () => {
    const held = last(asked());
    assert.deepEqual(takenOf(held), { room: { n: 1, x: 0n, y: 0n } });
    let player = held;
    for (let frame = 0; frame < 600; frame += 1) {
      player = play(
        player,
        { ...STILL, use: true, walk: 1 },
        FRAME,
        allOpen,
        holed,
      );
      assert.ok(isAsking(player));
      assert.equal(player.pose.u, held.pose.u);
      assert.equal(player.pose.scale, 1);
    }
    assert.deepEqual(cuesOf(asked()), ['pill']);
  });

  it('takes no answer before the pill is up', () => {
    const waited = asked();
    let player = first();
    for (const [index, late] of waited.entries()) {
      const hasty = index < waited.length - 1 ? yes : STILL;
      player = play(player, index === 0 ? use : hasty, FRAME, allOpen, holed);
      assert.deepEqual(player, late);
    }
  });

  it('swallows on yes and shrinks as on any floor', () => {
    const played = frames(last(asked()), yes, STILL, ({ act }) => act === null);
    assert.deepEqual(cuesOf(played).slice(0, 2), ['swallow', 'shrink']);
    assert.equal(last(played).pose.scale, 0.5);
    const gulped = played.find(({ act }) => act?.act === 'shrinking');
    assert.ok(gulped);
    assert.deepEqual(takenOf(gulped), { room: { n: 1, x: 0n, y: 0n } });
  });

  it('puts it back on no, the body as it stood, and asks again the next time', () => {
    const start = first();
    const played = frames(last(asked()), no, STILL, isStanding);
    const back = last(played);
    assert.deepEqual(cuesOf(played), ['pill']);
    assert.equal(takenOf(back), null);
    assert.deepEqual(back.pose, start.pose);
    const again = frames(back, use, STILL, isAsking);
    assert.equal(again.length, asked().length);
    assert.deepEqual(takenOf(last(again)), takenOf(last(asked())));
  });

  it('moves the gaze smoothly from the reach to the shrink or the put-down', () => {
    const both = [
      [first(), ...asked(), ...frames(last(asked()), yes, STILL, isThrough)],
      [first(), ...asked(), ...frames(last(asked()), no, STILL, isThrough)],
    ];
    for (const played of both) {
      for (const [index, { pose }] of played.entries()) {
        const before = played[index - 1]?.pose;
        if (before === undefined) continue;
        assert.ok(Math.abs(pose.yaw - before.yaw) < 0.08);
        assert.ok(Math.abs(pose.elevation - before.elevation) < 0.08);
      }
    }
  });
});
