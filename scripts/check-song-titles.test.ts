/**
 * End-to-end tests for the song-titles gate: the real script, run with `cwd`
 * at a throwaway tree under the OS temp directory, asserted on exit code and
 * report.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

const SCRIPT = path.resolve(import.meta.dirname, 'check-song-titles.ts');

function run(frontmatter: string) {
  const root = mkdtempSync(path.join(tmpdir(), 'song-titles-'));
  const dir = path.join(root, 'apps/vova/public/music');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'song.md'), `---\n${frontmatter}\n---\n`);
  const { status, stdout } = spawnSync(process.execPath, [SCRIPT], {
    cwd: root,
    encoding: 'utf8',
  });
  return { status, stdout };
}

function assertFinding(frontmatter: string, finding: string) {
  const { status, stdout } = run(frontmatter);
  assert.equal(status, 1);
  assert.ok(
    stdout.includes(`apps/vova/public/music/song.md: ${finding}`),
    stdout,
  );
}

const RU_GLOSS = `en:
  title:
    transliteration: 'Dym'
    translation: 'Smoke'`;

describe('check-song-titles', () => {
  for (const [label, frontmatter] of [
    ['a glossed Russian title', `title: 'Дым'\nlanguage: ru\n${RU_GLOSS}`],
    [
      'a Russian title translated only',
      "title: 'Чих-Пых'\nlanguage: ru\nen:\n  title:\n    translation: 'Chikh-Pykh'",
    ],
    [
      'an English title with a Russian translation',
      "title: 'Smoke'\nlanguage: en\nru:\n  title:\n    translation: 'Дым'",
    ],
    [
      'a locale’s own name in place of a gloss',
      "title: 'Breathe'\ntitleLanguage: en\nlanguage: instrumental\nru:\n  title: 'Повелитель ветра'",
    ],
    [
      'a Latin title in another language, translated only',
      "title: 'Inverno'\ntitleLanguage: it\nlanguage: instrumental\nen:\n  title:\n    translation: 'Winter'\nru:\n  title:\n    translation: 'Зима'",
    ],
    [
      'a romanized title in the one language sung',
      "title: 'Mithqāl'\ntitleLanguage: ar\nlanguage: ar\nen:\n  title:\n    translation: 'Weight'\nru:\n  title: 'Мискаль'",
    ],
    [
      'a title with no letters',
      "title: '8849'\ntitleLanguage: en\nlanguage: instrumental",
    ],
  ] satisfies Array<[string, string]>)
    it(`passes ${label}`, () => {
      const { status, stdout } = run(frontmatter);
      assert.equal(stdout, 'song-titles: clean\n');
      assert.equal(status, 0);
    });

  it('fails a non-English title with no English gloss', () => {
    assertFinding(
      "title: 'Дым'\nlanguage: ru",
      '`en.title.translation` is missing',
    );
  });

  it('fails a title in neither locale’s language with no Russian translation', () => {
    assertFinding(
      "title: 'Inverno'\ntitleLanguage: it\nlanguage: instrumental\nen:\n  title:\n    translation: 'Winter'",
      '`ru.title.translation` is missing',
    );
  });

  it('fails an English title with no Russian translation', () => {
    assertFinding(
      "title: 'Smoke'\nlanguage: en",
      '`ru.title.translation` is missing',
    );
  });

  it('fails an instrumental with no titleLanguage', () => {
    assertFinding(
      "title: 'Smoke'\nlanguage: instrumental\nru:\n  title: 'Дым'",
      'an instrumental: say which language the title is in with `titleLanguage`',
    );
  });

  it('fails a song in several languages with no titleLanguage', () => {
    assertFinding(
      "title: 'Smoke'\nlanguage: [en, de]\nru:\n  title: 'Дым'",
      'sung in en, de: say which language the title is in with `titleLanguage`',
    );
  });

  it('fails a title outside the sung language’s script', () => {
    assertFinding(
      "title: 'Smoke'\nlanguage: ru\nru:\n  title: 'Дым'",
      "the title has no letter of ru's script: say which language it is in with `titleLanguage`",
    );
  });

  it('fails a titleLanguage that is the only language sung', () => {
    assertFinding(
      `title: 'Дым'\ntitleLanguage: ru\nlanguage: ru\n${RU_GLOSS}`,
      '`titleLanguage: ru` is the only language sung: drop it',
    );
  });

  it('fails a titleLanguage away from the title', () => {
    assertFinding(
      "title: 'Smoke'\nlanguage: ar\ntitleLanguage: en\nru:\n  title: 'Дым'",
      '`titleLanguage` goes right under `title`',
    );
  });
});
