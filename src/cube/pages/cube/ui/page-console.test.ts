import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { installConsole } from './page-console';

/** The page's `cube` object, which must exist. */
function cubeObject(): object {
  const cube: unknown = Reflect.get(globalThis, 'cube');
  assert.ok(typeof cube === 'object' && cube !== null);
  return cube;
}

const settings = () => 'settings';
const giveCubes = () => 1000;

describe('installConsole', () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'cube');
  });

  it('puts members on the page’s cube object until disposed', () => {
    const installed = installConsole({ settings });
    assert.equal(Reflect.get(cubeObject(), 'settings'), settings);
    installed.dispose();
    assert.equal(Reflect.has(globalThis, 'cube'), false);
  });

  it('keeps one part’s members when another part disposes its own', () => {
    const knobs = installConsole({ settings });
    const account = installConsole({ giveCubes });
    knobs.dispose();
    assert.equal(Reflect.get(cubeObject(), 'giveCubes'), giveCubes);
    assert.equal(Reflect.has(cubeObject(), 'settings'), false);
    account.dispose();
    assert.equal(Reflect.has(globalThis, 'cube'), false);
  });
});
