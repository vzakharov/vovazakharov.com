import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Verdict } from '../../verdict';
import { mainDomains, otherDomains, standingOf } from './standing';

const TAKEN: Verdict = { state: 'taken', since: undefined };
const FREE: Verdict = { state: 'free' };

/** Every domain of `domains` answered `verdict`. */
const all = (domains: readonly string[], verdict: Verdict) =>
  domains.map((domain) => [domain, verdict] as const);

describe('standingOf', () => {
  it('is pending with nothing answered', () => {
    assert.deepEqual(standingOf('fox', new Map()), { state: 'pending' });
  });

  it('shows the first main domain free once those before it are in', () => {
    const verdicts = new Map([
      ['fox.com', TAKEN],
      ['fox.net', FREE],
      ['fox.org', FREE],
    ]);

    assert.deepEqual(standingOf('fox', verdicts), {
      state: 'free',
      domain: 'fox.net',
    });
  });

  it('waits on an earlier main domain before showing a later free one', () => {
    assert.deepEqual(standingOf('fox', new Map([['fox.net', FREE]])), {
      state: 'pending',
    });
  });

  it('counts a "maybe" as free', () => {
    assert.deepEqual(
      standingOf('fox', new Map([['fox.com', { state: 'maybe' }]])),
      { state: 'free', domain: 'fox.com' },
    );
  });

  it('names the free domains past the main ones when those are taken', () => {
    const [first, ...rest] = otherDomains('fox');
    const verdicts = new Map([
      ...all(mainDomains('fox'), TAKEN),
      ...all(rest, TAKEN),
      [first ?? '', FREE],
    ]);

    assert.deepEqual(standingOf('fox', verdicts), {
      state: 'others',
      free: [first],
    });
  });

  it('is pending while the other domains are being looked up', () => {
    assert.deepEqual(
      standingOf('fox', new Map(all(mainDomains('fox'), TAKEN))),
      { state: 'pending' },
    );
  });

  it('is taken when no domain is registrable, a "no answer" included', () => {
    const verdicts = new Map([
      ...all(mainDomains('fox'), TAKEN),
      ...all(otherDomains('fox'), { state: 'unknown' }),
    ]);

    assert.deepEqual(standingOf('fox', verdicts), { state: 'taken' });
  });
});
