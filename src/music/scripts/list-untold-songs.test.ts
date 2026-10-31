/**
 * End-to-end tests for the untold-songs list: the real script, run with `cwd`
 * at a throwaway tree under the OS temp directory, asserted on exit code and
 * the list it writes.
 */

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { runTsxScript } from '@/kernel/scripts/lib/tsx-script';

const SCRIPT = path.resolve(import.meta.dirname, 'list-untold-songs.ts');

/** The albums and artists the songs below may name, one file each. */
const CATALOGUE = {
  'albums/hamlet': '',
  'artists/poluzhivye': "---\nname: 'Полуживые'\n---\n",
  'artists/generated': "---\nname: 'GENERATED'\n---\n",
};

function tree(songs: Record<string, string>) {
  const root = mkdtempSync(path.join(tmpdir(), 'untold-songs-'));
  const music = path.join(root, 'sites/vova/public/music');
  const files = {
    ...CATALOGUE,
    ...Object.fromEntries(
      Object.entries(songs).map(([slug, text]) => [`songs/${slug}`, text]),
    ),
  };
  for (const [name, text] of Object.entries(files)) {
    const file = path.join(music, `${name}.md`);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, text);
  }
  return root;
}

function run(root: string) {
  const { status, stdout } = runTsxScript(SCRIPT, [], { cwd: root });
  const list = readFileSync(
    path.join(root, 'docs/music/untold-songs.md'),
    'utf8',
  );
  return { status, stdout, list };
}

function song(frontmatter: string, body = '') {
  return `---\n${frontmatter}\n---\n${body}`;
}

const HOOKED = "en:\n  hook: 'Yes.'\nru:\n  hook: 'Да.'";

const STORY = `<!-- lang:en -->\n\nTold.\n\n<!-- lang:ru -->\n\nРассказано.\n`;

describe('list-untold-songs', () => {
  it('writes the list, fails, and passes once it is current', () => {
    const root = tree({ a: song("title: 'A'\nproject: ['Полуживые']") });
    const first = run(root);
    assert.equal(first.status, 1);
    assert.match(first.stdout, /rewrote docs\/music\/untold-songs\.md/);

    const second = run(root);
    assert.equal(second.status, 0);
    assert.equal(second.list, first.list);
  });

  it('groups by artist, then album before singles, in track order', () => {
    const { list } = run(
      tree({
        single: song("title: 'Single'\nproject: ['Полуживые']"),
        two: song(
          "title: 'Two'\nproject: ['Полуживые']\nalbum: hamlet\ntrack: 2",
        ),
        one: song(
          "title: 'One'\nproject: ['Полуживые']\nalbum: hamlet\ntrack: 1",
        ),
        told: song(`title: 'Told'\nproject: ['GENERATED']\n${HOOKED}`, STORY),
      }),
    );
    const order = ['## Полуживые', '### hamlet', 'One', 'Two', '### Singles'];
    const at = order.map((text) => list.indexOf(text));
    assert.ok(
      at.every((index, i) => index > (at[i - 1] ?? -1)),
      list,
    );
    assert.ok(!list.includes('Told'), list);
    assert.ok(!list.includes('## GENERATED'), list);
  });

  it('names what a song lacks, by locale only when one locale has it', () => {
    const { list } = run(
      tree({
        bare: song("title: 'Bare'\nproject: ['Полуживые']"),
        half: song(
          "title: 'Half'\nproject: ['Полуживые']",
          '<!-- lang:en -->\n\nTold.\n\n<!-- lang:ru -->\n\n<!-- a note -->\n',
        ),
        preamble: song(
          `title: 'Preamble'\nproject: ['Полуживые']\n${HOOKED}`,
          'Told to everyone.\n',
        ),
        storied: song("title: 'Storied'\nproject: ['Полуживые']", STORY),
      }),
    );
    for (const line of [
      '- [Bare](../../sites/vova/public/music/songs/bare.md) — hook, story',
      '- [Half](../../sites/vova/public/music/songs/half.md) — hook, ru story',
      '- [Storied](../../sites/vova/public/music/songs/storied.md) — hook',
    ])
      assert.ok(list.includes(line), list);
    assert.ok(!list.includes('Preamble'), list);
    assert.match(list, /^3 songs still lack a hook or a story\./m);
  });
});
