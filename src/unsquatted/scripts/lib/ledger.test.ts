import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatEntry,
  type LedgerEntry,
  parseCandidates,
  parseLedger,
  unchecked,
} from './ledger.ts';

const TAKEN: LedgerEntry = {
  domain: 'apricity.com',
  axis: 'obscure word',
  verdict: 'taken',
  checked: '2026-10-29',
  since: '2008',
};

describe('ledger', () => {
  it('reads back what it writes', () => {
    const text = formatEntry(TAKEN) + formatEntry({ ...TAKEN, domain: 'b.com' });

    assert.deepEqual(parseLedger(text), [TAKEN, { ...TAKEN, domain: 'b.com' }]);
  });

  it('names the line that does not parse', () => {
    const text = `${formatEntry(TAKEN)}{"domain":"x.com"}\n`;

    assert.throws(() => parseLedger(text), /ledger\.jsonl:2/);
  });

  it('refuses a verdict it does not know', () => {
    assert.throws(() =>
      formatEntry({ ...TAKEN, verdict: 'maybe' as LedgerEntry['verdict'] }),
    );
  });
});

describe('parseCandidates', () => {
  it('reads axis and name, with or without the zone', () => {
    assert.deepEqual(
      parseCandidates('# run 3\nsailing\tLeewardLog\n\nkitchen\tcrumbtray.com\n'),
      [
        { axis: 'sailing', domain: 'leewardlog.com' },
        { axis: 'kitchen', domain: 'crumbtray.com' },
      ],
    );
  });

  it('throws on a line that is not axis and name', () => {
    assert.throws(() => parseCandidates('leewardlog'), /axis<TAB>name/);
    assert.throws(() => parseCandidates('sailing\tleeward log'), /leeward log/);
    assert.throws(() => parseCandidates('sailing\ta\tb'), /a\tb/);
  });
});

describe('unchecked', () => {
  it('drops known names and repeats, keeping the order', () => {
    const candidates = [
      { axis: 'a', domain: 'one.com' },
      { axis: 'b', domain: 'two.com' },
      { axis: 'c', domain: 'one.com' },
      { axis: 'd', domain: 'three.com' },
    ];

    assert.deepEqual(unchecked(candidates, ['two.com']), [
      { axis: 'a', domain: 'one.com' },
      { axis: 'd', domain: 'three.com' },
    ]);
  });
});
