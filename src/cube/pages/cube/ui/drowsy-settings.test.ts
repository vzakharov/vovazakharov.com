import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { drowsiness, installConsole } from './drowsy-settings';

describe('drowsiness', () => {
  it('starts drowsy, at a ninth of the pixels and full drowsiness', () => {
    assert.deepEqual(drowsiness().settings(), {
      drowsy: true,
      share: 3,
      drowsiness: 1,
      vignette: 0.35,
      slowdown: 1,
    });
  });

  it('takes a valid value and returns every setting', () => {
    const { console: knobs, settings } = drowsiness();
    assert.equal(knobs.setShare(2).share, 2);
    assert.equal(knobs.setDrowsy(true).drowsy, true);
    assert.equal(knobs.setSlowdown(2.5).slowdown, 2.5);
    assert.deepEqual(knobs.settings(), settings());
    assert.equal(settings().share, 2);
  });

  it("throws on a bad value with the schema's words, keeping the old one", () => {
    const { console: knobs, settings } = drowsiness();
    assert.throws(() => knobs.setShare(5), /share/);
    assert.throws(() => knobs.setDrowsiness(1.5), /drowsiness/);
    assert.throws(() => knobs.setDrowsy('yes'), /drowsy/);
    assert.throws(() => knobs.setSlowdown(0.5), /slowdown/);
    assert.throws(() => knobs.setVignette(-1), /vignette/);
    assert.equal(settings().share, 3);
  });
});

describe('installConsole', () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'cube');
  });

  it('puts the knobs on the page until disposed', () => {
    const { console: knobs } = drowsiness();
    const installed = installConsole(knobs);
    assert.equal(Reflect.get(globalThis, 'cube'), knobs);
    installed.dispose();
    assert.equal(Reflect.has(globalThis, 'cube'), false);
  });
});
