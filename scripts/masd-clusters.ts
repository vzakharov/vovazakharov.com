#!/usr/bin/env node

/**
 * Clusters inside a slice that would make a slice of their own, run from the
 * repository root:
 *
 *   pnpm masd:clusters
 *
 * A report, never a gate: it exits 0 whatever it prints. A candidate is a
 * file's downward closure — the file and everything it reaches inside its
 * slice — so the extracted slice never imports back into what stays. Kept when:
 *
 * - its root is no door: a closure rooted at a file the slice is entered by is
 *   the slice itself;
 * - it holds at least two files and at most 80% of the slice;
 * - it is not just whole segments, where FSD has already cut;
 * - splitting it off raises the modularity of the slice's own graph. The app's
 *   graph is the wrong one here: past a few hundred edges, modularity's
 *   resolution limit lets no split inside a slice pay for its one door.
 *
 * Per slice it prints the best candidate and each next best that overlaps none
 * already printed. Reads `src/` and `sites/*\/app/` under the working directory.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import { SLICED_LAYERS, TEST_API, TEST_FILE } from '../eslint/masd-graph.ts';
import { appFiles, resolveImport, sourceFile } from './lib/import-graph.ts';

const SLICED = new Set<string>(SLICED_LAYERS);
const LARGEST_SHARE = 0.8;

// Test code, its own entry into a slice included, is no part of the slice's shape.
const isTest = (file: string): boolean =>
  TEST_FILE.test(file) || path.basename(file) === TEST_API;

/** `<app>/<layer>/<slice>` of a shipped file in a sliced layer. */
function sliceOf(file: string): string | undefined {
  const parts = file.split(path.sep);
  if (parts[0] !== 'src' || parts.length < 5 || isTest(file)) {
    return undefined;
  }
  const [, app, layer = '', slice] = parts;
  return SLICED.has(layer) ? `${app}/${layer}/${slice}` : undefined;
}

/** The segment directory a file sits in, or the file itself at the slice's root. */
const segmentOf = (file: string): string => {
  const parts = file.split(path.sep);
  return parts.length > 5 ? parts.slice(0, 5).join(path.sep) : file;
};

type Cluster = { root: string; members: readonly string[]; gain: number };

/** Every file each shipped file imports, tests left out on both ends. */
function importsOf(files: readonly string[]): Map<string, Set<string>> {
  const imports = new Map<string, Set<string>>();
  for (const file of files) {
    if (isTest(file)) continue;
    const { importedFiles } = ts.preProcessFile(
      readFileSync(file, 'utf8'),
      true,
      true,
    );
    const targets = new Set<string>();
    for (const { fileName } of importedFiles) {
      const resolved = resolveImport(file, fileName);
      if (resolved === undefined) continue;
      const imported = sourceFile(resolved);
      if (imported !== undefined && imported !== file && !isTest(imported)) {
        targets.add(imported);
      }
    }
    imports.set(file, targets);
  }
  return imports;
}

/**
 * `ΔQ` of cutting `part` off the rest of the slice, on the slice's own graph:
 * the edges the cut crosses are lost, and the product of the two sides' degree
 * shares is what a degree-keeping rewiring would have put across it.
 */
function gain(
  part: ReadonlySet<string>,
  edges: ReadonlyArray<readonly [string, string]>,
): number {
  let crossing = 0;
  let ends = 0;
  for (const [from, to] of edges) {
    const inside = Number(part.has(from)) + Number(part.has(to));
    if (inside === 1) crossing++;
    ends += inside;
  }
  const m = edges.length;
  const share = ends / (2 * m);
  return -crossing / m + 2 * share * (1 - share);
}

function sliceClusters(
  members: readonly string[],
  imports: ReadonlyMap<string, ReadonlySet<string>>,
  doors: ReadonlySet<string>,
): Cluster[] {
  const inSlice = new Set(members);
  const below = (file: string) =>
    [...(imports.get(file) ?? [])].filter((target) => inSlice.has(target));
  const edges = members.flatMap((from) =>
    below(from).map((to) => [from, to] as const),
  );
  if (edges.length === 0) return [];

  const segments = Map.groupBy(members, segmentOf);
  const seen = new Set<string>();
  const candidates: Cluster[] = [];
  for (const root of members) {
    if (doors.has(root)) continue;
    const closure = new Set<string>();
    const stack = [root];
    for (let file = stack.pop(); file !== undefined; file = stack.pop()) {
      if (closure.has(file)) continue;
      closure.add(file);
      stack.push(...below(file));
    }
    const sorted = [...closure].toSorted();
    const key = sorted.join('\n');
    if (
      closure.size < 2 ||
      closure.size > LARGEST_SHARE * members.length ||
      seen.has(key) ||
      [...closure].every((file) =>
        (segments.get(segmentOf(file)) ?? []).every((peer) =>
          closure.has(peer),
        ),
      )
    ) {
      continue;
    }
    seen.add(key);
    candidates.push({ root, members: sorted, gain: gain(closure, edges) });
  }

  const taken = new Set<string>();
  return candidates
    .filter((candidate) => candidate.gain > 0)
    .toSorted((a, b) => b.gain - a.gain)
    .filter((candidate) => {
      if (candidate.members.some((file) => taken.has(file))) return false;
      for (const file of candidate.members) taken.add(file);
      return true;
    });
}

function report(): string {
  const files = appFiles();
  const imports = importsOf(files);
  const slices = Map.groupBy(
    files.filter((file) => sliceOf(file) !== undefined),
    (file) => sliceOf(file) ?? '',
  );
  const lines: string[] = [];
  let flagged = 0;
  for (const [slice, members] of [...slices].toSorted(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const doors = new Set(
      [...imports]
        .filter(([from]) => sliceOf(from) !== slice)
        .flatMap(([, targets]) => [...targets])
        .filter((target) => sliceOf(target) === slice),
    );
    const clusters = sliceClusters(members, imports, doors);
    if (clusters.length === 0) continue;
    flagged++;
    lines.push(`src/${slice} (${members.length} files)`);
    const within = path.join('src', slice) + path.sep;
    for (const { root, members: cluster, gain: dq } of clusters) {
      lines.push(
        `  ${path.relative(within, root)}: ${cluster.length} files, ΔQ ${dq.toPrecision(2)}`,
        ...cluster.map((file) => `    ${path.relative(within, file)}`),
      );
    }
  }
  lines.push(`${flagged} of ${slices.size} slices hold a cluster.`);
  return `${lines.join('\n')}\n`;
}

process.stdout.write(report());
