import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';

import { errorClass, withCause } from '@/kernel/shared/lib/error-class';

import type { WithDomain } from '../../checker';
import { usesSentence } from '../lib/uses';

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
 * What a row shows of a name besides its blurb, and `score`, which orders the
 * rows, highest first: a point on a scale rather than a rank, so a name slots
 * in between two others without renumbering either.
 */
const shownSchema = z.object({
  category: z.string().min(1),
  score: z.number().finite(),
});

/** A use as its article would follow it: no article, no full stop. */
const useSchema = z
  .string()
  .min(1)
  .regex(/^(?!(?:a|an|the) )[^.]+$/i, 'a use is written bare: "ink maker"');

/**
 * The naming runbook (`src/unsquatted/scripts/RUNBOOK.md`) writes these, so
 * they are parsed rather than trusted: a malformed one fails the build, not the
 * page, and strictly, so a misspelt `shownUntil` is an error rather than a name
 * that never leaves. `shownUntil` is set by the runbook once the name is taken,
 * and past it the entry stays in the catalogue but leaves the list. The blurb
 * is `tagline` and then `uses` as one sentence, so every blurb keeps one shape.
 */
const pickSchema = z
  .strictObject({
    ...shownSchema.shape,
    tagline: z.string().regex(/^\S.*[!.?]$/, 'a tagline is a full sentence'),
    uses: z.array(useSchema).min(1).max(3),
    form: z.enum(FORMS),
    /**
     * The trick a name is built on, as a mask over the domain, so names on one
     * trick share it: for a hack, `*` and the tail its zone spells the word's
     * end with (`*st.one` for `touchst.one` and `lodest.one` alike, `*.red`
     * for every `…red`).
     */
    pattern: z
      .string()
      .regex(/^\*[\da-z-]*\.[a-z]+$/)
      .optional(),
    added: z.coerce.date(),
    shownUntil: z.coerce.date().optional(),
  })
  .refine(
    ({ form, pattern }) => form !== 'hack' || pattern !== undefined,
    'a hack states its pattern',
  );

/** `yaml` rejects a key given twice, so a domain is listed once. */
const catalogueSchema = z.record(z.string().regex(DOMAIN), pickSchema);

export type ShownName = z.infer<typeof shownSchema> &
  WithDomain & { blurb: string };

function readCatalogue() {
  const picks = (() => {
    try {
      return Object.entries(
        catalogueSchema.parse(parse(fs.readFileSync(CATALOGUE_PATH, 'utf8'))),
      ).map(([domain, pick]) => ({ domain, ...pick }));
    } catch (error) {
      throw new CatalogueError('picks.yaml does not parse', withCause(error));
    }
  })();
  const astray = picks.find(
    ({ domain, pattern }) =>
      pattern !== undefined && !domain.endsWith(pattern.slice(1)),
  );

  if (astray !== undefined) {
    throw new CatalogueError(`${astray.domain}: its pattern does not match it`);
  }

  return picks;
}

const day = (date: Date) => date.toISOString().slice(0, 10);

/** Every pick: best first, then newest, then by domain. */
const SORTED = readCatalogue().toSorted(
  (a, b) =>
    b.score - a.score ||
    b.added.getTime() - a.added.getTime() ||
    a.domain.localeCompare(b.domain),
);

type Pick = (typeof SORTED)[number];

const shown = ({
  domain,
  category,
  tagline,
  uses,
  score,
}: Pick): ShownName => ({
  domain,
  category,
  blurb: `${tagline} ${usesSentence(uses)}`,
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

const LASTING = SORTED.filter(({ shownUntil }) => shownUntil === undefined);

/** The names with no `shownUntil`: a list the calendar cannot change. */
export const LASTING_PICKS: readonly ShownName[] = LASTING.map((pick) =>
  shown(pick),
);

/**
 * The best `count` of `LASTING_PICKS`, no two on one pattern, for a showcase
 * too short to carry the same trick twice.
 */
export const variedPicks = (count: number): readonly ShownName[] =>
  LASTING.filter(
    ({ pattern }, index) =>
      pattern === undefined ||
      LASTING.findIndex((other) => other.pattern === pattern) === index,
  )
    .slice(0, count)
    .map((pick) => shown(pick));
