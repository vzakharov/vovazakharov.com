import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createLift } from './lift.ts';

/** A class list holding only what the lift adds and removes. */
function classList(): {
  add: (name: string) => void;
  remove: (name: string) => void;
  lifted: () => boolean;
} {
  const classes = new Set<string>();
  return {
    add: (name) => {
      classes.add(name);
    },
    remove: (name) => {
      classes.delete(name);
    },
    lifted: () => classes.has('lifted'),
  };
}

describe('createLift', () => {
  it('raises the layer on a pan and keeps it through the next', () => {
    const list = classList();
    const lift = createLift(list, () => 1);
    lift.pan();
    lift.pan();
    assert.equal(list.lifted(), true);
  });

  it('keeps the layer through a rest at the zoom it was raised at', () => {
    const list = classList();
    const lift = createLift(list, () => 1);
    lift.pan();
    lift.rest();
    assert.equal(list.lifted(), true);
  });

  it('drops the layer on a zoom, the next pan raising it at the new scale', () => {
    const list = classList();
    let zoom = 1;
    const lift = createLift(list, () => zoom);
    lift.pan();
    zoom = 2;
    lift.rest();
    assert.equal(list.lifted(), false);
    lift.pan();
    lift.rest();
    assert.equal(list.lifted(), true);
  });

  it('leaves the layer unraised on a zoom with none raised', () => {
    const list = classList();
    let zoom = 1;
    const lift = createLift(list, () => zoom);
    zoom = 2;
    lift.rest();
    assert.equal(list.lifted(), false);
  });
});
