import assert from 'node:assert/strict';
import fs from 'node:fs';
import { describe, it } from 'node:test';

import { CASE_INKS, composeCaseSeal, sealInks } from './case-seal.ts';

const SITE_SEAL = `<!-- the eye -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <circle r="466" stroke="#b3261e"/>
  <g id="band">
    <circle r="326" stroke="#b3261e"/>
  </g>
  <g id="eye">
    <path d="M 0 0" fill="#b3261e"/>
  </g>
</svg>
`;

const EMBLEM = `<!-- a bat -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <path d="M 1 1" fill="currentColor"/>
</svg>
`;

const RED = { rim: '#b3261e', emblem: '#b3261e' };

describe('composeCaseSeal', () => {
  it('swaps the eye for the emblem and re-inks the rings', () => {
    const seal = composeCaseSeal(SITE_SEAL, EMBLEM, RED, 'lettered');

    assert.ok(seal.startsWith('<svg color="#b3261e" '));
    assert.ok(seal.includes('<circle r="466" stroke="currentColor"/>'));
    assert.ok(seal.includes('<circle r="326"'));
    assert.ok(seal.includes('<path d="M 1 1" fill="currentColor"/>'));
    assert.ok(!seal.includes('M 0 0'));
    assert.ok(!seal.includes('<!--'));
  });

  it('drops the band from the small cut and enlarges the emblem', () => {
    const seal = composeCaseSeal(SITE_SEAL, EMBLEM, RED, 'small');

    assert.ok(!seal.includes('r="326"'));
    assert.ok(seal.includes('scale(1.4)'));
    assert.ok(seal.includes('<circle r="466"'));
  });

  it('inks a mixed case’s emblem apart from its rings', () => {
    const inks = sealInks({ act: 'harm', credit: 'care', actor: 'individual' });
    const seal = composeCaseSeal(SITE_SEAL, EMBLEM, inks, 'lettered');

    assert.ok(seal.startsWith(`<svg color="${CASE_INKS.harm}" `));
    assert.ok(seal.includes(`<g color="${CASE_INKS.care}">`));
  });

  it('keeps a dollar sign in the drawing as written', () => {
    const emblem = EMBLEM.replace('M 1 1', () => '$& $1');

    assert.ok(
      composeCaseSeal(SITE_SEAL, emblem, RED, 'lettered').includes('$& $1'),
    );
  });

  it('throws on a site seal with no eye to swap', () => {
    assert.throws(
      () =>
        composeCaseSeal(
          SITE_SEAL.replace('id="eye"', 'id="iris"'),
          EMBLEM,
          RED,
          'lettered',
        ),
      /no <g id="eye">/,
    );
  });

  it('throws on an emblem off the seal’s canvas', () => {
    assert.throws(
      () =>
        composeCaseSeal(
          SITE_SEAL,
          EMBLEM.replace('0 0 1024 1024', '0 0 100 100'),
          RED,
          'lettered',
        ),
      /viewBox="0 0 1024 1024"/,
    );
  });
});

/** WCAG relative luminance of a `#rrggbb` or `#rgb` colour. */
function luminance(hex: string): number {
  const digits = hex.slice(1);
  const full = digits.length === 3 ? digits.replaceAll(/(.)/g, '$1$1') : digits;
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((i) => {
    const channel = Number.parseInt(full.slice(i, i + 2), 16) / 255;
    return channel <= 0.040_45
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [dark, light] = [luminance(a), luminance(b)].toSorted((x, y) => x - y);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

/** Each theme's background: the first colour every palette in the global sheet passes. */
const BACKGROUNDS = [
  ...fs
    .readFileSync(
      new URL('../../../../shell/app/styles/globals.scss', import.meta.url),
      'utf8',
    )
    .matchAll(/@include tokens\.colors\(\s*(#[\da-f]{3,6})/gi),
].map(([, background]) => background ?? '');

describe('CASE_INKS', () => {
  it('reads both themes’ backgrounds', () => {
    assert.equal(BACKGROUNDS.length, 2);
  });

  for (const [deed, ink] of Object.entries(CASE_INKS)) {
    it(`holds ${deed}’s ink to 3:1 on every background`, () => {
      for (const background of BACKGROUNDS) {
        assert.ok(
          contrast(ink, background) >= 3,
          `${ink} on ${background}: ${contrast(ink, background).toFixed(2)}`,
        );
      }
    });
  }
});
