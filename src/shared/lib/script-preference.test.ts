import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runInNewContext } from 'node:vm';

import {
  defaultScript,
  type Script,
  SCRIPT_ATTRIBUTE,
  SCRIPT_PREFERENCE_SCRIPT,
} from './script-preference';

/** What the head script marks `<html>` as, given what is stored and the browser's languages. */
function marked(stored: Script | null, languages: string[]): Script {
  const attributes = new Map<string, string>();

  runInNewContext(SCRIPT_PREFERENCE_SCRIPT, {
    localStorage: { getItem: () => stored },
    navigator: { languages },
    document: {
      documentElement: {
        setAttribute: (name: string, value: string) => {
          attributes.set(name, value);
        },
      },
    },
  });

  return attributes.get(SCRIPT_ATTRIBUTE) === 'original' ? 'original' : 'latin';
}

describe('defaultScript', () => {
  it('starts a reader whose browser reads Russian in the original', () => {
    assert.equal(defaultScript(['en-US', 'ru-RU']), 'original');
    assert.equal(defaultScript(['RU']), 'original');
  });

  it('starts everyone else in Latin', () => {
    assert.equal(defaultScript(['en-US', 'de']), 'latin');
    assert.equal(defaultScript([]), 'latin');
  });
});

describe('SCRIPT_PREFERENCE_SCRIPT', () => {
  it('agrees with defaultScript where nothing is stored', () => {
    for (const languages of [['en-US', 'ru-RU'], ['en-US'], []]) {
      assert.equal(marked(null, languages), defaultScript(languages));
    }
  });

  it('lets the stored choice win over the browser', () => {
    assert.equal(marked('latin', ['ru']), 'latin');
    assert.equal(marked('original', ['en']), 'original');
  });
});
