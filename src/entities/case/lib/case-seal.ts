import fs from 'node:fs';
import path from 'node:path';

import type { CaseFrontmatter } from '@/shared/content';

type Grade = CaseFrontmatter['grade'];

type Deed = NonNullable<Grade['act']> | NonNullable<Grade['credit']>;

/**
 * A case's character, as the ink its seal is stamped in. A seal is an `<img>`,
 * which cannot follow the page's theme, so each ink is one colour that reads on
 * both backgrounds — `case-seal.test.ts` holds it to that.
 */
export const CASE_INKS = {
  harm: '#b3261e',
  contempt: '#a0670a',
  torment: '#8445bf',
  respect: '#2f62c4',
  care: '#2e7d32',
  protection: '#1f7f86',
} as const satisfies Record<Deed, string>;

export const SEAL_CUTS = ['lettered', 'small'] as const;

export type SealCut = (typeof SEAL_CUTS)[number];

/** The site seal each cut is composed on, under the site's `public/`. */
const SITE_SEALS: Record<SealCut, string> = {
  lettered: 'seal-lettered.svg',
  small: 'seal.svg',
};

/** The site seal's own ink, which a case's seal re-inks. */
const SITE_INK = '#b3261e';

/** How far the small cut enlarges the emblem, into the room its dropped band leaves. */
const SMALL_SCALE = 1.4;

type SealInks = { rim: string; emblem: string };

/** One ink, or a mixed case's two: the rings in its act's, the emblem in its credit's. */
export function sealInks({ act, credit }: Grade): SealInks {
  const rim = act ?? credit;
  const emblem = credit ?? act;

  if (rim === undefined || emblem === undefined) {
    throw new Error('A grade carries an act, a credit or both.');
  }

  return { rim: CASE_INKS[rim], emblem: CASE_INKS[emblem] };
}

function groupPattern(id: string): RegExp {
  return new RegExp(`<g id="${id}">[\\s\\S]*?</g>`);
}

/** Throws rather than returning the seal unchanged, which would be the eye. */
function replaceGroup(svg: string, id: string, replacement: string): string {
  const pattern = groupPattern(id);

  if (!pattern.test(svg)) {
    throw new Error(`The site seal has no <g id="${id}"> to replace.`);
  }

  // A function, so a `$` in the drawing is not read as a replacement pattern.
  return svg.replace(pattern, () => replacement);
}

/** The emblem's drawing, without the `<svg>` around it. */
function emblemDrawing(emblem: string): string {
  const match =
    /^\s*(?:<!--[\s\S]*?-->\s*)*<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/.exec(
      emblem,
    );

  if (match === null || !match[1]?.includes('viewBox="0 0 1024 1024"')) {
    throw new Error(
      'An emblem is one <svg viewBox="0 0 1024 1024">, the seal’s own canvas.',
    );
  }

  return match[2] ?? '';
}

/**
 * The case's seal: the site seal with its eye swapped for the emblem, re-inked.
 * The small cut drops the band and enlarges the emblem, which is what still
 * reads at the size a docket row shows it.
 */
export function composeCaseSeal(
  siteSeal: string,
  emblem: string,
  { rim, emblem: emblemInk }: SealInks,
  cut: SealCut,
): string {
  const drawing = siteSeal
    .slice(siteSeal.indexOf('<svg'))
    .replaceAll(SITE_INK, 'currentColor')
    .replace('<svg ', `<svg color="${rim}" `);
  const scale =
    cut === 'small'
      ? ` transform="translate(512 512) scale(${SMALL_SCALE}) translate(-512 -512)"`
      : '';
  const sealed = replaceGroup(
    drawing,
    'eye',
    `<g color="${emblemInk}"${scale}>${emblemDrawing(emblem)}</g>`,
  );

  return cut === 'small' ? replaceGroup(sealed, 'band', '') : sealed;
}

/** Where a case's emblem is authored: beside its dossier, at its route plus a suffix. */
function emblemFile(route: string): string {
  return `${route}.emblem.svg`;
}

/** The file name a cut is served under, in `/seals/`. */
export function caseSealFile(slug: string, cut: SealCut): string {
  return cut === 'small' ? `${slug}.small.svg` : `${slug}.svg`;
}

export function caseSealPath(slug: string, cut: SealCut): string {
  return `/seals/${caseSealFile(slug, cut)}`;
}

/** A case's seal, read off its files under `publicDir`; throws on a case with no emblem. */
export function caseSealSvg(
  publicDir: string,
  { route, grade }: { route: string; grade: Grade },
  cut: SealCut,
): string {
  const emblemPath = path.join(publicDir, emblemFile(route));

  if (!fs.existsSync(emblemPath)) {
    throw new Error(
      `No emblem for the case at ${route}: every case draws one, at ${emblemPath}.`,
    );
  }

  return composeCaseSeal(
    fs.readFileSync(path.join(publicDir, SITE_SEALS[cut]), 'utf8'),
    fs.readFileSync(emblemPath, 'utf8'),
    sealInks(grade),
    cut,
  );
}
