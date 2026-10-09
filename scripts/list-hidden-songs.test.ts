/**
 * End-to-end tests for the hidden-songs list: the real script, run with `cwd`
 * at a throwaway tree under the OS temp directory, asserted on exit code and
 * the list it writes.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

const SCRIPT = path.resolve(import.meta.dirname, 'list-hidden-songs.ts');

function tree(songs: Record<string, string>) {
  const root = mkdtempSync(path.join(tmpdir(), 'hidden-songs-'));
  const dir = path.join(root, 'apps/vova/public/music');
  mkdirSync(dir, { recursive: true });
  for (const [slug, text] of Object.entries(songs))
    writeFileSync(path.join(dir, `${slug}.md`), text);
  return root;
}

function run(root: string) {
  const { status, stdout } = spawnSync(process.execPath, [SCRIPT], {
    cwd: root,
    encoding: 'utf8',
  });
  const list = readFileSync(
    path.join(root, 'docs/music/hidden-songs.md'),
    'utf8',
  );
  return { status, stdout, list };
}

function song(frontmatter: string, body = '') {
  return `---\n${frontmatter}\nen:\n  description: 'TBD'\nru:\n  description: 'TBD'\n---\n${body}`;
}

const STORY = `<!-- lang:en -->\n\nTold.\n\n<!-- lang:ru -->\n\nРассказано.\n`;

describe('list-hidden-songs', () => {
  it('writes the list, fails, and passes once it is current', () => {
    const root = tree({
      a: song("title: 'A'\nhidden: true\nproject: ['Полуживые']"),
    });
    const first = run(root);
    assert.equal(first.status, 1);
    assert.match(first.stdout, /rewrote docs\/music\/hidden-songs\.md/);

    const second = run(root);
    assert.equal(second.status, 0);
    assert.equal(second.list, first.list);
  });

  it('groups by artist, then album before singles, in track order', () => {
    const { list } = run(
      tree({
        single: song("title: 'Single'\nhidden: true\nproject: ['Полуживые']"),
        two: song(
          "title: 'Two'\nhidden: true\nproject: ['Полуживые']\nalbum: hamlet\ntrack: 2",
        ),
        one: song(
          "title: 'One'\nhidden: true\nproject: ['Полуживые']\nalbum: hamlet\ntrack: 1",
        ),
        shown: song("title: 'Shown'\nproject: ['GENERATED']"),
      }),
    );
    const order = ['## Полуживые', '### hamlet', 'One', 'Two', '### Singles'];
    const at = order.map((text) => list.indexOf(text));
    assert.ok(
      at.every((index, i) => index > (at[i - 1] ?? -1)),
      list,
    );
    assert.ok(!list.includes('Shown'), list);
    assert.ok(!list.includes('## GENERATED'), list);
  });

  it('names what a song lacks, by locale only when one locale has it', () => {
    const { list } = run(
      tree({
        bare: song("title: 'Bare'\nhidden: true\nproject: ['Полуживые']"),
        half: song(
          "title: 'Half'\nhidden: true\nproject: ['Полуживые']",
          '<!-- lang:en -->\n\nTold.\n\n<!-- lang:ru -->\n\n<!-- a note -->\n',
        ),
        ready: `---\ntitle: 'Ready'\nhidden: true\nproject: ['Полуживые']\nen:\n  description: 'Yes.'\nru:\n  description: 'Да.'\n---\n${STORY}`,
      }),
    );
    for (const line of [
      '- [Bare](../../apps/vova/public/music/bare.md) — description, story',
      '- [Half](../../apps/vova/public/music/half.md) — description, ru story',
      '- [Ready](../../apps/vova/public/music/ready.md) — ready',
    ])
      assert.ok(list.includes(line), list);
  });
});
