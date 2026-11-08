import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { cumulativeFlow, extensionOf, renamedTo, toCsv } from './lines.ts';

describe('contribution lines', () => {
  it('names a rename by its new side', () => {
    assert.equal(renamedTo('a.md => b.ts'), 'b.ts');
    assert.equal(renamedTo('src/{old => new}/x.ts'), 'src/new/x.ts');
    assert.equal(renamedTo('src/{ => deep}/x.py'), 'src/deep/x.py');
    assert.equal(renamedTo('plain/file.css'), 'plain/file.css');
  });

  it('groups a file with no extension by its name', () => {
    assert.equal(extensionOf('scripts/vet.sh'), '.sh');
    assert.equal(extensionOf('.nojekyll'), '.nojekyll');
    assert.equal(extensionOf('sites/vova/public/CNAME'), 'CNAME');
  });

  it('accumulates lines per extension, commit by commit', () => {
    const log = [
      '@aaaaaaaaaa 2026-11-06T10:00:00+00:00',
      '',
      '10\t0\tsrc/a.ts',
      '5\t0\tdocs/x.md',
      '-\t-\timg.png',
      '@bbbbbbbbbb 2026-11-06T11:00:00+00:00',
      '',
      '2\t4\tsrc/a.ts',
      '',
    ].join('\n');
    const rows = cumulativeFlow(log);
    assert.deepEqual(
      rows.map((row) => row.lines),
      [
        { '.ts': 10, '.md': 5, '.png': 0 },
        { '.ts': 8, '.md': 5, '.png': 0 },
      ],
    );
    assert.equal(
      toCsv(rows),
      [
        'date,sha,.ts,.md,.png',
        '2026-11-06T10:00:00+00:00,aaaaaaaa,10,5,0',
        '2026-11-06T11:00:00+00:00,bbbbbbbb,8,5,0',
        '',
      ].join('\n'),
    );
  });
});
