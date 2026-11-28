import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { barSeconds, beatSeconds, sectionAt, SECTIONS } from './sections';
import { SONG_SECONDS } from './song';

describe('SECTIONS', () => {
  it('runs from the song’s start to its end without a gap', () => {
    assert.equal(SECTIONS[0]?.from, 0);
    assert.equal(SECTIONS.at(-1)?.to, SONG_SECONDS);
    for (const [n, section] of SECTIONS.entries()) {
      assert.ok(section.to > section.from, section.name);
      const next = SECTIONS[n + 1];
      if (next) assert.equal(next.from, section.to, next.name);
    }
  });

  it('opens each section on a bar line of its own grid', () => {
    for (const section of SECTIONS.slice(1)) {
      const bars = (section.from - section.downbeat) / barSeconds(section);
      assert.ok(Math.abs(bars - Math.round(bars)) < 1e-9, section.name);
    }
  });

  it('keeps the 0.128 s tatum from 0:19 to the breakdown', () => {
    for (const section of SECTIONS) {
      if (section.feel === 'intro' || section.feel === 'breakdown') continue;
      const tatums =
        section.feel === 'half' || section.feel === 'quarter' ? 3 : 4;
      const tatum = beatSeconds(section) / tatums;
      assert.ok(Math.abs(tatum - 0.128) < 0.001, section.name);
    }
  });
});

describe('sectionAt', () => {
  it('names the section playing', () => {
    assert.equal(sectionAt(10).name, 'intro');
    assert.equal(sectionAt(50).feel, 'half');
    assert.equal(sectionAt(100).feel, 'breakdown');
  });

  it('takes the first before the song and the last after it', () => {
    assert.equal(sectionAt(-1), SECTIONS[0]);
    assert.equal(sectionAt(SONG_SECONDS + 5), SECTIONS.at(-1));
  });
});
