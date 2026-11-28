import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { channelText, counterText } from './osd';

describe('counterText', () => {
  it('reads hours, minutes and seconds, whole seconds only', () => {
    assert.equal(counterText(0), '0:00:00');
    assert.equal(counterText(7.9), '0:00:07');
    assert.equal(counterText(119.7), '0:01:59');
    assert.equal(counterText(3725), '1:02:05');
  });

  it('holds at zero before the tape starts', () => {
    assert.equal(counterText(-3), '0:00:00');
  });
});

describe('channelText', () => {
  it('pads the number to two digits', () => {
    assert.equal(channelText(7), 'CH 07');
    assert.equal(channelText(12), 'CH 12');
  });
});
