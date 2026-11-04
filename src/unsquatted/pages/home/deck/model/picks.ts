import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';

import { errorClass, withCause } from '@/kernel/shared/lib/error-class';

import type { WithDomain } from '../../checker';

const CatalogueError = errorClass('CatalogueError');

/**
 * Every name ever picked, keyed by domain, beside this file. Read off the
 * working directory, which is the site's for a build and for the naming script
 * alike.
 */
const CATALOGUE_PATH = path.join(
  process.cwd(),
  '..',
  '..',
  'src/unsquatted/pages/home/deck/model/picks.yaml',
);

const DOMAIN = /^[\da-z-]+\.[a-z]+$/;

/**
 * The shape a name takes, which a run spreads its picks across as it does
 * axes: two words joined, a phrase that is not, a real word, a word respelt or
 * short of a letter, a word made up, and a name whose zone finishes it.
 */
const FORMS = [
  'compound',
  'phrase',
  'word',
  'respelling',
  'coinage',
  'hack',
] as const;

/**
 * What a row shows of a name, and `score`, which orders the rows, highest
 * first: a point on a scale rather than a rank, so a name slots in between two
 * others without renumbering either.
 */
const shownSchema = z.object({
  category: z.string().min(1),
  blurb: z.string().min(1),
  score: z.number().finite(),
});

/**
 * The naming runbook (`src/unsquatted/scripts/RUNBOOK.md`) writes these, so
 * they are parsed rather than trusted: a malformed one fails the build, not the
 * page, and strictly, so a misspelt `shownUntil` is an error rather than a name
 * that never leaves. `shownUntil` is set by the runbook once the name is taken,
 * and past it the entry stays in the catalogue but leaves the list.
 */
const pickSchema = z.strictObject({
  ...shownSchema.shape,
  form: z.enum(FORMS),
  added: z.coerce.date(),
  shownUntil: z.coerce.date().optional(),
});

/** `yaml` rejects a key given twice, so a domain is listed once. */
const catalogueSchema = z.record(z.string().regex(DOMAIN), pickSchema);

export type ShownName = z.infer<typeof shownSchema> & WithDomain;

function readCatalogue() {
  try {
    return Object.entries(
      catalogueSchema.parse(parse(fs.readFileSync(CATALOGUE_PATH, 'utf8'))),
    ).map(([domain, pick]) => ({ domain, ...pick }));
  } catch (error) {
    throw new CatalogueError('picks.yaml does not parse', withCause(error));
  }
}

const day = (date: Date) => date.toISOString().slice(0, 10);

/** Every pick: best first, then newest, then by domain. */
const SORTED = readCatalogue().toSorted(
  (a, b) =>
    b.score - a.score ||
    b.added.getTime() - a.added.getTime() ||
    a.domain.localeCompare(b.domain),
);

const shown = ({ domain, category, blurb, score }: ShownName): ShownName => ({
  domain,
  category,
  blurb,
  score,
});

/** Every name ever picked, shown or not: what a naming run never re-checks. */
export const PICKED_DOMAINS: readonly string[] = SORTED.map(
  ({ domain }) => domain,
);

/** The names still shown at build. */
export const PICKS: readonly ShownName[] = SORTED.filter(
  ({ shownUntil }) =>
    shownUntil === undefined || day(shownUntil) >= day(new Date()),
).map((pick) => shown(pick));

/** The names with no `shownUntil`: a list the calendar cannot change. */
export const LASTING_PICKS: readonly ShownName[] = SORTED.filter(
  ({ shownUntil }) => shownUntil === undefined,
).map((pick) => shown(pick));
