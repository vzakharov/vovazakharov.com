/**
 * The staleness bookkeeping every committed-render script shares: read the
 * manifest beside each render, hash what the render is derived from, produce
 * what drifted, prune what no longer has a source, and — under `--check` —
 * report all of that without writing.
 *
 * Staleness goes through a recorded hash rather than a byte comparison because
 * a re-render is not reproducible: PNG encoding and PDF output both vary across
 * Chromium versions, so an unchanged source would look changed on another
 * machine.
 *
 * Producing the renders is the caller's, handed every stale entry at once so
 * one browser or one dev server covers the batch — and awaited, so the prune
 * and the manifest write see what the render actually produced.
 *
 * Bare Node runs the scripts that use this, relying on its type stripping, so
 * this file stays free of syntax the stripper cannot erase and every relative
 * import carries its `.ts` extension.
 */

/* eslint-disable no-console -- stdout is the calling script's interface:
   progress, the `--check` staleness report and the prune log are what a human
   runs it for. The rule stays `error` in the app, where a stray log ships to a
   user. */

import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { contentFiles, REPO_ROOT } from './content-tree.ts';

/** One render, and the hash of everything it is derived from. */
export type Renderable = {
  /** Absolute path of the file the render produces. */
  outputPath: string;
  sourceHash: string;
};

/**
 * How a job's renders are recognized on disk. The bookkeeping below reads only
 * this much of a job, which is what lets it stay blind to the entry type the
 * caller actually renders.
 */
type ManifestLayout = {
  /** The manifest's file name, written into each directory that holds a render. */
  manifestName: string;
  /** Whether a file already in a render directory is one this job produces. */
  isOutput: (fileName: string) => boolean;
};

export type RenderJob<T extends Renderable> = ManifestLayout & {
  /** Names the unit in the log line, e.g. `'Open Graph card'`. */
  label: string;
  /** Every render the sources now ask for. */
  entries: T[];
  render: (stale: T[]) => void | Promise<void>;
};

/** Output file name → the hash of the source it was rendered from. */
const manifestSchema = z.record(z.string(), z.string());

function readManifest(manifestPath: string): Record<string, string> {
  if (!fs.existsSync(manifestPath)) return {};

  return manifestSchema.parse(
    JSON.parse(fs.readFileSync(manifestPath, 'utf8')),
    { error: () => `Malformed render manifest: ${manifestPath}` },
  );
}

function manifestPathFor(layout: ManifestLayout, outputPath: string): string {
  return path.join(path.dirname(outputPath), layout.manifestName);
}

function isStale(layout: ManifestLayout, entry: Renderable): boolean {
  const recorded = readManifest(manifestPathFor(layout, entry.outputPath))[
    path.basename(entry.outputPath)
  ];

  return !fs.existsSync(entry.outputPath) || recorded !== entry.sourceHash;
}

/**
 * Walked rather than derived from the entries, so removing the last render in a
 * directory still surfaces the manifest it leaves behind.
 */
function manifestFiles(layout: ManifestLayout): string[] {
  return contentFiles((name) => name === layout.manifestName);
}

/** The renders — recorded or on disk — that no source asks for any more. */
function orphans(layout: ManifestLayout, entries: Renderable[]): string[] {
  const wanted = new Set(entries.map((entry) => entry.outputPath));
  const directories = new Set([
    ...entries.map((entry) => path.dirname(entry.outputPath)),
    ...manifestFiles(layout).map((file) => path.dirname(file)),
  ]);

  return [
    ...new Set(
      [...directories].flatMap((dir) =>
        [
          ...Object.keys(readManifest(path.join(dir, layout.manifestName))),
          ...fs.readdirSync(dir).filter((name) => layout.isOutput(name)),
        ].map((name) => path.join(dir, name)),
      ),
    ),
  ].filter((outputPath) => !wanted.has(outputPath));
}

/**
 * Rewrites each manifest to exactly the renders its directory now holds, and
 * removes the one a directory no longer needs.
 */
function writeManifests(layout: ManifestLayout, entries: Renderable[]): void {
  const grouped = new Map<string, Renderable[]>();

  for (const entry of entries) {
    const manifestPath = manifestPathFor(layout, entry.outputPath);
    grouped.set(manifestPath, [...(grouped.get(manifestPath) ?? []), entry]);
  }

  for (const manifestPath of manifestFiles(layout)) {
    if (!grouped.has(manifestPath)) fs.rmSync(manifestPath);
  }

  for (const [manifestPath, group] of grouped) {
    const recorded = group
      .map((entry): [string, string] => [
        path.basename(entry.outputPath),
        entry.sourceHash,
      ])
      .toSorted(([a], [b]) => a.localeCompare(b));

    fs.writeFileSync(
      manifestPath,
      `${JSON.stringify(Object.fromEntries(recorded), undefined, 2)}\n`,
    );
  }
}

/** `--check` reports staleness and exits non-zero; without it, the drift is repaired. */
export async function runRenderJob<T extends Renderable>(
  job: RenderJob<T>,
  checkOnly: boolean,
): Promise<void> {
  const stale = job.entries.filter((entry) => isStale(job, entry));
  const gone = orphans(job, job.entries);

  console.log(
    `${job.entries.length} ${job.label}(s) in the content tree, ` +
      `${stale.length} to render, ${gone.length} stale render(s) to prune.`,
  );

  if (checkOnly) {
    for (const entry of stale)
      console.log(`  stale:   ${path.relative(REPO_ROOT, entry.outputPath)}`);
    for (const outputPath of gone)
      console.log(`  orphan:  ${path.relative(REPO_ROOT, outputPath)}`);
    process.exitCode = stale.length > 0 || gone.length > 0 ? 1 : 0;
    return;
  }

  if (stale.length > 0) await job.render(stale);

  for (const outputPath of gone) {
    if (fs.existsSync(outputPath)) fs.rmSync(outputPath);
    console.log(`  pruned ${path.relative(REPO_ROOT, outputPath)}`);
  }

  writeManifests(job, job.entries);
}
