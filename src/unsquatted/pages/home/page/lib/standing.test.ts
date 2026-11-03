import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Verdict } from '../../verdict';
import { CLOSED_ROWS, domainsOf, standingOf } from './standing';

const TAKEN: Verdict = { state: 'taken', since: undefined };
const FREE: Verdict = { state: 'free' };

const FOX = {
  main: ['fox.com', 'fox.net', 'fox.org'],
  others: ['fox.dev', 'fox.me'],
};

/** Every domain of `domains` answered `verdict`. */
const all = (domains: readonly string[], verdict: Verdict) =>
  domains.map((domain) => [domain, verdict] as const);

describe('domainsOf', () => {
  it('takes the checker’s closed list as main, its splits included', () => {
    const { main, others } = domainsOf(
      'fuckapp',
      ['com', 'app', 'net'],
      undefined,
    );

    assert.equal(main.length, CLOSED_ROWS);
    assert.deepEqual(main.slice(0, 2), ['fuckapp.com', 'fuck.app']);
    assert.ok(!others.some((domain) => main.includes(domain)));
  });
});

describe('standingOf', () => {
  it('is pending with nothing answered', () => {
    assert.deepEqual(standingOf(FOX, new Map()), { state: 'pending' });
  });

  it('shows the first main domain free once those before it are in', () => {
    const verdicts = new Map([
      ['fox.com', TAKEN],
      ['fox.net', FREE],
      ['fox.org', FREE],
    ]);

    assert.deepEqual(standingOf(FOX, verdicts), {
      state: 'free',
      domain: 'fox.net',
    });
  });

  it('waits on an earlier main domain before showing a later free one', () => {
    assert.deepEqual(standingOf(FOX, new Map([['fox.net', FREE]])), {
      state: 'pending',
    });
  });

  it('counts a "maybe" as free', () => {
    assert.deepEqual(
      standingOf(FOX, new Map([['fox.com', { state: 'maybe' }]])),
      { state: 'free', domain: 'fox.com' },
    );
  });

  it('names the free domains past the main ones when those are taken', () => {
    const verdicts = new Map([
      ...all(FOX.main, TAKEN),
      ['fox.dev', TAKEN],
      ['fox.me', FREE],
    ]);

    assert.deepEqual(standingOf(FOX, verdicts), {
      state: 'others',
      free: ['fox.me'],
    });
  });

  it('is pending while the other domains are being looked up', () => {
    assert.deepEqual(standingOf(FOX, new Map(all(FOX.main, TAKEN))), {
      state: 'pending',
    });
  });

  it('is taken when no domain is registrable, a "no answer" included', () => {
    const verdicts = new Map([
      ...all(FOX.main, TAKEN),
      ...all(FOX.others, { state: 'unknown' }),
    ]);

    assert.deepEqual(standingOf(FOX, verdicts), { state: 'taken' });
  });
});
