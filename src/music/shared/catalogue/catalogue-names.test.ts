import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';

import { readCatalogueNames } from './catalogue-names.ts';

const musicDir = fs.mkdtempSync(path.join(os.tmpdir(), 'catalogue-names-'));

after(() => {
  fs.rmSync(musicDir, { recursive: true });
});

function write(file: string, content: string): void {
  fs.mkdirSync(path.dirname(path.join(musicDir, file)), { recursive: true });
  fs.writeFileSync(path.join(musicDir, file), content);
}

describe('readCatalogueNames', () => {
  it('reads an album beside its reflection as one album', () => {
    write('albums/nostalgia.md', '---\ntitle: Ностальгия\n---\n');
    write('albums/nostalgia.maya.reflections.md', 'Отклик.\n');
    write('artists/poluzhivye.md', "---\nname: 'Полуживые'\n---\n");

    assert.deepEqual(readCatalogueNames(musicDir).albums, ['nostalgia']);
  });
});
