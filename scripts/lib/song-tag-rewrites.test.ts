import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { renameMentions, rewriteSongDocument } from './song-tag-rewrites.ts';

const BOOM = 'https://raw.githubusercontent.com/vovas-music/boom/main';
const FLAC = `${BOOM}/boom.flac`;
const MP3 = `${BOOM}/boom.master.mp3`;
const NEW_FLAC = `${BOOM}/GENERATED%20-%20Boom!.flac`;
const NEW_MP3 = `${BOOM}/GENERATED%20-%20Boom!.mp3`;

const DOCUMENT = `---
audio: ${FLAC}
seconds: 212
mp3:
  url: ${MP3}
  bytes: 8476294
explicit: false
---
`;

describe('rewriteSongDocument', () => {
  it('points each file at its new URL and states the tagged size', () => {
    assert.equal(
      rewriteSongDocument(
        DOCUMENT,
        [
          { oldUrl: FLAC, newUrl: NEW_FLAC },
          { oldUrl: MP3, newUrl: NEW_MP3 },
        ],
        8_501_234,
      ),
      `---
audio: ${NEW_FLAC}
seconds: 212
mp3:
  url: ${NEW_MP3}
  bytes: 8501234
explicit: false
---
`,
    );
  });

  it('finds the size of an MP3 master, which has no url under mp3', () => {
    const master = `audio: ${MP3}\nmp3:\n  bytes: 2274152\nexplicit: false\n`;

    assert.equal(
      rewriteSongDocument(
        master,
        [{ oldUrl: MP3, newUrl: NEW_MP3 }],
        2_300_000,
      ),
      `audio: ${NEW_MP3}\nmp3:\n  bytes: 2300000\nexplicit: false\n`,
    );
  });

  it('throws on a URL the document does not state', () => {
    assert.throws(
      () =>
        rewriteSongDocument(DOCUMENT, [{ oldUrl: NEW_MP3, newUrl: MP3 }], 1),
      /No frontmatter line states/,
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
