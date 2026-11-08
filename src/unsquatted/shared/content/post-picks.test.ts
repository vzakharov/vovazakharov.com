import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { postPickProblems } from './post-picks';

describe('postPickProblems', () => {
  const listed = new Map([['singles-day', ['letmeal.one', 'monachal.com']]]);

  it('is empty when a post and its picks agree', () => {
    assert.deepEqual(
      postPickProblems(listed, [
        { domain: 'monachal.com', post: 'singles-day' },
        { domain: 'letmeal.one', post: 'singles-day' },
      ]),
      [],
    );
  });

  it('names a listed domain no pick of the post', () => {
    assert.deepEqual(
      postPickProblems(listed, [
        { domain: 'letmeal.one', post: 'singles-day' },
      ]),
      ['singles-day lists monachal.com, which is no pick of it'],
    );
  });

  it('names a pick its post does not list, and one for no post', () => {
    assert.deepEqual(
      postPickProblems(new Map([['singles-day', []]]), [
        { domain: 'cartforone.com', post: 'singles-day' },
        { domain: 'blackink.day', post: 'black-friday' },
      ]),
      [
        'cartforone.com is picked for singles-day, which does not list it',
        'blackink.day is picked for black-friday, which is no post',
      ],
    );
  });
});
