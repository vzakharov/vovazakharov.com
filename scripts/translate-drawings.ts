#!/usr/bin/env node

/**
 * Writes each drawing's translation beside its original: a translated
 * collection's `<name>.<locale>.svg` is drawn once, in its post's original
 * language, and `<name>.svg` is the same drawing with the captions the post's
 * translation lists under `captions` swapped in — so a drawing's geometry has
 * one copy, and its words one per language.
 *
 *   pnpm content:drawings:maya            # write what changed
 *   pnpm content:drawings:maya --check    # report what is stale, write nothing
 *
 * Fails on an original drawing no translation captions, a caption with no
 * translation, and an entry the drawing no longer says. Bare Node runs this
 * file, relying on its type stripping, so every relative import carries its
 * `.ts` extension.
 */

/* eslint-disable no-console -- stdout is this script's interface: the
   drawings it wrote, or the `--check` staleness report. */

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

import { resolveSiteId } from '../src/shared/config/index.node-safe.ts';
import {
  collectionDir,
  COLLECTIONS,
  collectionsForSite,
  isDocumentFile,
} from '../src/shared/content/collections.ts';
import { type Captions, translateDrawing } from './lib/drawing-captions.ts';

const CHECK = process.argv.includes('--check');

/** `<name>.<locale>.svg` — a drawing in its original's language. */
const ORIGINAL = /^(.+)\.[a-z]{2}\.svg$/;

/** A translation's `captions`: each original drawing, relative to the post, and its dictionary. */
function captionsOf(file: string): Record<string, Captions> {
  const { captions = {} } = matter(fs.readFileSync(file, 'utf8')).data as {
    captions?: unknown;
  };
  const isDictionary = (value: unknown): value is Captions =>
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((entry) => typeof entry === 'string');

  if (
    typeof captions !== 'object' ||
    captions === null ||
    !Object.values(captions).every(isDictionary)
  ) {
    throw new Error(
      `${file}: \`captions\` maps each drawing to {original wording: translation}.`,
    );
  }

  return captions as Record<string, Captions>;
}

function filesUnder(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name));
}

const stale: string[] = [];

for (const id of collectionsForSite(resolveSiteId())) {
  if (COLLECTIONS[id].localized !== 'translated') continue;

  const dir = collectionDir(id);
  const files = filesUnder(dir);
  const claimed = new Set<string>();

  for (const translation of files.filter(
    (file) =>
      path.dirname(file) === dir &&
      isDocumentFile(path.basename(file)) &&
      !/\.[a-z]{2}\.md$/.test(file),
  )) {
    for (const [drawing, captions] of Object.entries(captionsOf(translation))) {
      const original = path.resolve(dir, drawing);
      const match = ORIGINAL.exec(original);

      if (match === null || !fs.existsSync(original)) {
        throw new Error(
          `${translation}: ${drawing} is not an original drawing, <name>.<locale>.svg.`,
        );
      }

      claimed.add(original);

      const output = `${match[1]}.svg`;
      let drawn: string;

      try {
        drawn = translateDrawing(fs.readFileSync(original, 'utf8'), captions);
      } catch (error) {
        throw new Error(`${translation}, ${drawing}`, { cause: error });
      }

      if (fs.existsSync(output) && fs.readFileSync(output, 'utf8') === drawn) {
        continue;
      }

      stale.push(path.relative(process.cwd(), output));
      if (!CHECK) fs.writeFileSync(output, drawn);
    }
  }

  const unclaimed = files.filter(
    (file) => ORIGINAL.test(file) && !claimed.has(file),
  );

  if (unclaimed.length > 0) {
    throw new Error(
      `No translation captions ${unclaimed.map((file) => path.relative(process.cwd(), file)).join(', ')}.`,
    );
  }
}

if (CHECK && stale.length > 0) {
  console.error(
    `Stale drawings — run \`pnpm content:drawings:<site>\`:\n${stale.join('\n')}`,
  );
  process.exit(1);
}

for (const file of stale) console.log(`wrote ${file}`);
