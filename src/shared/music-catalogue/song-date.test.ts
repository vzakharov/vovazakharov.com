import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import matter from 'gray-matter';

import { songDateSchema } from './song-date';

/** The value as a song file's frontmatter hands it over, YAML's typing included. */
function parseFrontmatterDate(value: string) {
  const { data } = matter(`---\ndate: ${value}\n---\n`);

  return songDateSchema.safeParse(data['date']);
}

describe('songDateSchema', () => {
  it('reads a month as its first day, UTC', () => {
    const parsed = parseFrontmatterDate('2024-01');

    assert.ok(parsed.success);
    assert.equal(parsed.data.toISOString(), '2024-01-01T00:00:00.000Z');
  });

  it('keeps a full date as YAML read it', () => {
    const parsed = parseFrontmatterDate('2023-12-15');

    assert.ok(parsed.success);
    assert.equal(parsed.data.toISOString(), '2023-12-15T00:00:00.000Z');
  });

  it('reads a quoted full date the same as an unquoted one', () => {
    const parsed = parseFrontmatterDate("'2023-12-15'");

    assert.ok(parsed.success);
    assert.equal(parsed.data.toISOString(), '2023-12-15T00:00:00.000Z');
  });

  it('refuses a bare year rather than reading it as milliseconds', () => {
    assert.equal(parseFrontmatterDate('2024').success, false);
  });

  it('refuses a month or day the calendar lacks', () => {
    assert.equal(parseFrontmatterDate('2024-13').success, false);
    assert.equal(parseFrontmatterDate("'2024-02-30'").success, false);
  });

  it('refuses any other shape of text', () => {
    assert.equal(parseFrontmatterDate('January 2024').success, false);
    assert.equal(parseFrontmatterDate('2024-1').success, false);
  });
});
