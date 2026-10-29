#!/usr/bin/env tsx

/**
 * Writes each drawing in every language: a translated collection's
 * `assets/<name>.svg` is a template (`./lib/drawing-captions.ts`), and
 * `<name>.<locale>.svg` is it filled with the `captions` that language's post
 * lists for it and signed with the site's domain — so a drawing's geometry has
 * one copy, and its words one per language.
 *
 *   pnpm content:drawings maya            # write what changed
 *   pnpm content:drawings maya --check    # report what is stale, write nothing
 *
 * Fails on a template some language's post does not caption, a `captions`
 * entry naming no template, and the key mismatches `fillDrawing` throws on.
 */

/* eslint-disable no-console -- stdout is this script's interface: the
   drawings it wrote, or the `--check` staleness report. */

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { type Locale, LOCALES } from '@/kernel/shared/i18n/index.node-safe';
import { withCause } from '@/kernel/shared/lib/error-class';

import {
  collectionDir,
  collectionsForSite,
  isDocumentFile,
  isTranslated,
  splitLocale,
} from '@/blog/shared/content/index.node-safe';

import {
  type Captions,
  fillDrawing,
  isDrawingTemplate,
  signDrawing,
} from './lib/drawing-captions.ts';

import { filesUnder, RENDERED_SITE } from '@/kernel/scripts/lib/site-tree';

const CHECK = process.argv.includes('--check');

/** The site's domain, signed on every drawing: its `CNAME`, run from the app directory. */
const DOMAIN = fs.readFileSync(path.join('public', 'CNAME'), 'utf8').trim();

const CAPTIONS = z.object({
  captions: z
    .record(
      z.string(),
      z.record(z.string(), z.string()) satisfies z.ZodType<Captions>,
    )
    .default({}),
});

/** A post's `captions`: each template, relative to the post, and its wordings by key. */
function captionsOf(file: string): Record<string, Captions> {
  const parsed = CAPTIONS.safeParse(matter(fs.readFileSync(file, 'utf8')).data);

  if (!parsed.success) {
    throw new Error(
      `${file}: \`captions\` maps each drawing template to {key: wording}.`,
      { cause: parsed.error },
    );
  }

  return parsed.data.captions;
}

function localeOf(post: string): Locale {
  const { locale } = splitLocale(path.basename(post, '.md'));

  if (locale === undefined) {
    throw new Error(`${post} names no language: <slug>.<locale>.md.`);
  }

  return locale;
}

const relative = (file: string) => path.relative(process.cwd(), file);

const stale: string[] = [];

for (const id of collectionsForSite(RENDERED_SITE)) {
  if (!isTranslated(id)) continue;

  const dir = collectionDir(id);
  const files = filesUnder(dir);
  const templates = files.filter(
    (file) =>
      file.endsWith('.svg') && isDrawingTemplate(fs.readFileSync(file, 'utf8')),
  );
  const captioned = new Map(templates.map((file) => [file, new Set<Locale>()]));

  for (const post of files.filter(
    (file) => path.dirname(file) === dir && isDocumentFile(path.basename(file)),
  )) {
    const locale = localeOf(post);

    for (const [drawing, captions] of Object.entries(captionsOf(post))) {
      const template = path.resolve(dir, drawing);
      const locales = captioned.get(template);

      if (locales === undefined) {
        throw new Error(
          `${relative(post)}: ${drawing} is not a drawing template, an SVG with {{key}} placeholders.`,
        );
      }

      locales.add(locale);

      let drawn: string;

      try {
        drawn = signDrawing(
          fillDrawing(fs.readFileSync(template, 'utf8'), captions),
          DOMAIN,
        );
      } catch (error) {
        throw new Error(`${relative(post)}, ${drawing}`, withCause(error));
      }

      const output = template.replace(/\.svg$/, `.${locale}.svg`);

      if (fs.existsSync(output) && fs.readFileSync(output, 'utf8') === drawn) {
        continue;
      }

      stale.push(relative(output));
      if (!CHECK) fs.writeFileSync(output, drawn);
    }
  }

  for (const [template, locales] of captioned) {
    const uncaptioned = LOCALES.filter((locale) => !locales.has(locale));

    if (uncaptioned.length > 0) {
      throw new Error(
        `No ${uncaptioned.join(' or ')} post captions ${relative(template)}.`,
      );
    }
  }
}

if (CHECK && stale.length > 0) {
  console.error(
    `Stale drawings — run \`pnpm content:drawings <site>\`:\n${stale.join('\n')}`,
  );
  process.exit(1);
}

for (const file of stale) console.log(`wrote ${file}`);
