import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { MIXED, OPEN, settingOf, SHUT } from './happenings.test-kit';
import {
  fitsIn,
  HAPPENING_KINDS,
  KIND_NAMES,
  kindAt,
  lastsOf,
  PACES,
  weightOf,
} from './kinds';

const SHUT_ROOM = settingOf(1, SHUT);
const OPEN_ROOM = settingOf(1, OPEN);

describe('the kinds', () => {
  it('are at least the fourteen asked for', () => {
    assert.ok(KIND_NAMES.length >= 14);
  });

  it('each fit inside a beat of their pace', () => {
    for (const kind of KIND_NAMES) {
      const { pace, lastsFor } = HAPPENING_KINDS[kind];
      assert.ok(lastsFor[0] <= lastsFor[1]);
      assert.ok(lastsFor[1] <= PACES[pace].every);
      assert.equal(lastsOf(kind, 0), lastsFor[0]);
    }
  });

  it('drift from the mundane to the wrong with depth', () => {
    assert.ok(weightOf('ball', 1) > weightOf('ball', 66));
    assert.ok(weightOf('figure', 1) < weightOf('figure', 66));
    assert.equal(weightOf('corner', 29), 0);
    assert.ok(weightOf('corner', 31) > 0);
  });

  it('fit a room by what it has', () => {
    assert.ok(fitsIn('door', SHUT_ROOM) && !fitsIn('door', OPEN_ROOM));
    assert.ok(fitsIn('hand', OPEN_ROOM) && !fitsIn('hand', SHUT_ROOM));
    assert.ok(fitsIn('corner', SHUT_ROOM) && !fitsIn('corner', OPEN_ROOM));
    assert.ok(
      !fitsIn('corner', settingOf(1, [true, false, true, false])),
      'two walls across from each other close no corner',
    );
    assert.ok(KIND_NAMES.every((kind) => fitsIn(kind, settingOf(1, MIXED))));
  });
});

describe('kindAt', () => {
  it('picks only kinds of the pace that fit the room', () => {
    for (let step = 0; step < 200; step += 1) {
      const kind = kindAt('brief', OPEN_ROOM, 50, step / 200);
      assert.ok(kind !== null);
      assert.equal(HAPPENING_KINDS[kind].pace, 'brief');
      assert.ok(fitsIn(kind, OPEN_ROOM));
    }
  });

  it('picks by weight', () => {
    const picks = Array.from({ length: 1000 }, (_, step) =>
      kindAt('lingering', SHUT_ROOM, 1, step / 1000),
    );
    const share = (kind: string) =>
      picks.filter((pick) => pick === kind).length / picks.length;
    assert.ok(Math.abs(share('balloon') - 5 / 8.5) < 0.01);
    assert.ok(Math.abs(share('mannequin') - 1.5 / 8.5) < 0.01);
  });
});
