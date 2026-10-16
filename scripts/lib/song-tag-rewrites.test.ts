import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { renameMentions, rewriteMp3Bytes } from './song-tag-rewrites.ts';

describe('rewriteMp3Bytes', () => {
  it('states the tagged size and leaves the rest as it was', () => {
    assert.equal(
      rewriteMp3Bytes(
        '---\nrepo: boom\nseconds: 212\nmp3Bytes: 8476294\nexplicit: false\n---\n',
        8_501_234,
      ),
      '---\nrepo: boom\nseconds: 212\nmp3Bytes: 8501234\nexplicit: false\n---\n',
    );
  });

  it('throws on a document that states no size', () => {
    assert.throws(
      () => rewriteMp3Bytes('---\nrepo: boom\n---\n', 1),
      /No mp3Bytes/,
    );
  });
});

describe('renameMentions', () => {
  it('renames a file only where a code span holds its name alone', () => {
    assert.equal(
      renameMentions(
        '- `facepalm.flac` — the master.\n- `5_facepalm.flac`\n\n    master.py mix.mp3 facepalm.flac',
        new Map([['facepalm.flac', 'GENERATED - Facepalm.flac']]),
      ),
      '- `GENERATED - Facepalm.flac` — the master.\n- `5_facepalm.flac`\n\n    master.py mix.mp3 facepalm.flac',
    );
  });
});
