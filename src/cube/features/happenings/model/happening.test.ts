import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { clockAt } from '@/cube/shared/lib/clock';

import { happening, secondsAt } from './happening';
import {
  assertInRoom,
  BEGAN,
  MIXED,
  settingOf,
  SHUT,
} from './happenings.test-kit';
import {
  HAPPENING_KINDS,
  type HappeningKind,
  KIND_NAMES,
  type Pace,
  PACES,
  scareShare,
} from './kinds';
import { playing } from './schedule';
import { NOTHING } from './staging';

const ROOMS = 400;

/**
 * Every act of `pace` that begins in `ROOMS` rooms of floor `n` over `beats`
 * beats, found by looking in more often than the shortest act lasts.
 */
function begun(pace: Pace, n: number, beats: number): HappeningKind[] {
  const { every } = PACES[pace];
  const shortest = Math.min(
    ...KIND_NAMES.filter((kind) => HAPPENING_KINDS[kind].pace === pace).map(
      (kind) => HAPPENING_KINDS[kind].lastsFor[0],
    ),
  );
  const step = shortest / 2;
  const kinds: HappeningKind[] = [];
  for (let room = 0; room < ROOMS; room += 1) {
    const setting = settingOf(1000 * n + room);
    let last = Number.NaN;
    for (let now = BEGAN; now < BEGAN + beats * every; now += step) {
      const plan = playing(setting, n, pace, now);
      if (plan !== null && plan.sinceEpoch !== last) {
        last = plan.sinceEpoch;
        kinds.push(plan.kind);
      }
    }
  }
  return kinds;
}

/** Whether `count` hits out of `tries` is within four deviations of `chance`. */
const near = (count: number, tries: number, chance: number): boolean =>
  Math.abs(count - tries * chance) <
  4 * Math.sqrt(tries * chance * (1 - chance));

describe('happening', () => {
  it('gives two visitors of a room one thing at one moment', () => {
    for (let room = 0; room < 200; room += 1) {
      for (let tick = 0; tick < 200; tick += 1) {
        const ms = (BEGAN + tick * 7.3) * 1000;
        const one = happening(settingOf(room), 12, clockAt(ms));
        const other = happening(settingOf(room), 12, clockAt(ms));
        assert.deepEqual(one, other);
      }
    }
  });

  it('answers the same whatever it was asked before', () => {
    const setting = settingOf(77);
    const asked = (seconds: number) =>
      happening(setting, 5, clockAt((BEGAN + seconds) * 1000));
    const forward = Array.from({ length: 300 }, (_, tick) => asked(tick * 11));
    const backward = Array.from({ length: 300 }, (_, tick) =>
      asked((299 - tick) * 11),
    ).toReversed();
    assert.deepEqual(forward, backward);
  });

  it('counts the clock’s hour and seconds as one instant', () => {
    assert.equal(secondsAt({ hour: 2, seconds: 30.5 }), 7230.5);
    assert.deepEqual(
      happening(settingOf(5), 3, { hour: 472_222, seconds: 3599.5 }),
      happening(settingOf(5), 3, clockAt((472_222 * 3600 + 3599.5) * 1000)),
    );
  });

  it('nearly always answers with the one shared nothing', () => {
    let nothing = 0;
    const asked = 20_000;
    for (let room = 0; room < asked; room += 1) {
      const answer = happening(settingOf(room), 9, clockAt(BEGAN * 1000));
      if (answer === NOTHING) nothing += 1;
      else assert.ok(answer.quads.length + answer.sounds.length > 0);
    }
    assert.ok(nothing > 0.9 * asked, `${nothing} of ${asked} were nothing`);
    assert.ok(nothing < asked);
  });

  it('keeps whatever it shows inside the room it was asked about', () => {
    let shown = 0;
    for (let room = 0; room < 3000; room += 1) {
      const setting = settingOf(room, room % 2 === 0 ? MIXED : SHUT);
      for (let tick = 0; tick < 6; tick += 1) {
        const { quads } = happening(
          setting,
          1 + (room % 66),
          clockAt((BEGAN + tick * 97) * 1000),
        );
        assertInRoom(setting, quads, `room ${room}`);
        shown += quads.length;
      }
    }
    assert.ok(shown > 0);
  });

  it('answers differently for a room’s walls, not only its word', () => {
    const kinds = (closed: typeof MIXED) =>
      begunIn(settingOf(4242, closed)).join(',');
    assert.notEqual(kinds(MIXED), kinds([false, false, false, false]));
  });
});

/** The kinds of brief act that begin in one room of floor 50 over a day. */
function begunIn(setting: ReturnType<typeof settingOf>): HappeningKind[] {
  const kinds: HappeningKind[] = [];
  let last = Number.NaN;
  for (let now = BEGAN; now < BEGAN + 86_400; now += 2.5) {
    const plan = playing(setting, 50, 'brief', now);
    if (plan !== null && plan.sinceEpoch !== last) {
      last = plan.sinceEpoch;
      kinds.push(plan.kind);
    }
  }
  return kinds;
}

describe('the rate', () => {
  const BEATS = { brief: 200, lingering: 60 } as const;
  const top = begun('brief', 1, BEATS.brief);
  const deep = begun('brief', 60, BEATS.brief);
  const lingering = begun('lingering', 20, BEATS.lingering);

  it('is the chance each pace claims for a beat', () => {
    for (const [acts, pace] of [
      [top, 'brief'],
      [deep, 'brief'],
      [lingering, 'lingering'],
    ] as const) {
      const tries = ROOMS * BEATS[pace];
      assert.ok(
        near(acts.length, tries, PACES[pace].chance),
        `${acts.length} ${pace} acts in ${tries} beats`,
      );
    }
  });

  it('shows something within sight every minute or two', () => {
    const inSight = 6;
    const { every, chance } = PACES.brief;
    const apart = every / chance / inSight;
    assert.ok(apart > 60 && apart < 120, `${apart} s apart`);
  });

  it('makes of them the share of scares each floor claims', () => {
    for (const [acts, n] of [
      [top, 1],
      [deep, 60],
    ] as const) {
      const scares = acts.filter((kind) => HAPPENING_KINDS[kind].scare).length;
      assert.ok(
        near(scares, acts.length, scareShare(n)),
        `${scares} scares in ${acts.length} acts on floor ${n}`,
      );
    }
    assert.ok(scareShare(1) > 0.08 && scareShare(1) < 0.16);
    assert.ok(scareShare(66) > 0.3 && scareShare(66) < 0.45);
  });

  it('plays every kind somewhere', () => {
    const played = new Set([...top, ...deep, ...lingering]);
    assert.deepEqual(
      KIND_NAMES.filter((kind) => !played.has(kind)),
      [],
    );
  });

  it('keeps the corner whole above floor 30', () => {
    assert.ok(!top.includes('corner'));
    assert.ok(deep.includes('corner'));
  });

  it('lets an act run its whole length inside its beat', () => {
    for (const pace of ['brief', 'lingering'] as const) {
      const setting = settingOf(31_337);
      const { every } = PACES[pace];
      let seen = 0;
      for (let now = BEGAN; now < BEGAN + 4000 * every; now += every / 4) {
        const plan = playing(setting, 40, pace, now);
        if (plan === null) continue;
        seen += 1;
        assert.ok(
          now >= plan.sinceEpoch && now < plan.sinceEpoch + plan.lastsFor,
        );
        assert.ok(plan.lastsFor <= every);
      }
      assert.ok(seen > 0);
    }
  });
});
