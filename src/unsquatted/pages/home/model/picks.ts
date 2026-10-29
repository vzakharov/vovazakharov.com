import 'server-only';

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { PUBLIC_DIR } from '@/kernel/shared/config/index.node-safe';
import { errorClass } from '@/kernel/shared/lib/error-class';

const PickFileError = errorClass('PickFileError');

/** One file a name, `public/picks/<domain>.md`, at the route its article will take. */
const PICKS_DIR = path.join(PUBLIC_DIR, 'picks');

const DOMAIN = /^[\da-z-]+\.[a-z]+$/;

/** What a row shows of a name. */
const shownSchema = z.object({
  category: z.string().min(1),
  blurb: z.string().min(1),
});

/**
 * The naming routine writes these, so they are parsed rather than trusted: a
 * malformed one fails the build, not the page. `score` orders the list, highest
 * first: a point on a scale rather than a rank, so a name slots in between two
 * others without renumbering either. `shownUntil` is set by the routine once
 * the name is taken, and past it the file stays in the repository but leaves
 * the list. YAML reads an unquoted date as a `Date`.
 */
const pickSchema = shownSchema.extend({
  score: z.number().finite(),
  added: z.coerce.date(),
  shownUntil: z.coerce.date().optional(),
});

export type ShownName = z.infer<typeof shownSchema> & { domain: string };

function readPick(fileName: string) {
  const domain = fileName.replace(/\.md$/, '');

  if (!DOMAIN.test(domain)) {
    throw new PickFileError(`picks/${fileName} is not named <domain>.md`);
  }

  try {
    const { data } = matter(
      fs.readFileSync(path.join(PICKS_DIR, fileName), 'utf8'),
    );

    return { domain, ...pickSchema.parse(data) };
  } catch (error) {
    throw new PickFileError(`picks/${fileName} does not parse`, {
      cause: error instanceof Error ? error : new Error(String(error)),
    });
  }
}

const day = (date: Date) => date.toISOString().slice(0, 10);

/** Every pick file: best first, then newest, then by domain. */
const SORTED = fs
  .readdirSync(PICKS_DIR)
  .filter((fileName) => fileName.endsWith('.md'))
  .map((fileName) => readPick(fileName))
  .toSorted(
    (a, b) =>
      b.score - a.score ||
      b.added.getTime() - a.added.getTime() ||
      a.domain.localeCompare(b.domain),
  );

const shown = ({ domain, category, blurb }: ShownName): ShownName => ({
  domain,
  category,
  blurb,
});

/** The names still shown at build. */
export const PICKS: readonly ShownName[] = SORTED.filter(
  ({ shownUntil }) =>
    shownUntil === undefined || day(shownUntil) >= day(new Date()),
).map(shown);

/** The names with no `shownUntil`: a list the calendar cannot change. */
export const LASTING_PICKS: readonly ShownName[] = SORTED.filter(
  ({ shownUntil }) => shownUntil === undefined,
).map(shown);
