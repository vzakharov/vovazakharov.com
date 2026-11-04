import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isReleased, publishingDay } from './embargo.ts';

describe('isReleased', () => {
  const day = '2026-11-10';

  it('releases a document dated on the day', () => {
    assert.equal(isReleased(new Date('2026-11-10'), day), true);
  });

  it('releases one dated before it', () => {
    assert.equal(isReleased(new Date('2026-11-09'), day), true);
  });

  it('holds one dated after it', () => {
    assert.equal(isReleased(new Date('2026-11-11'), day), false);
  });
});

describe('publishingDay', () => {
  it('takes CONTENT_AS_OF where set', () => {
    assert.equal(publishingDay({ CONTENT_AS_OF: '2026-11-30' }), '2026-11-30');
  });

  it('falls back to the UTC day', () => {
    assert.equal(publishingDay({}), new Date().toISOString().slice(0, 10));
  });

  it('throws on a value that is not a day', () => {
    assert.throws(() => publishingDay({ CONTENT_AS_OF: 'tomorrow' }));
  });
});
