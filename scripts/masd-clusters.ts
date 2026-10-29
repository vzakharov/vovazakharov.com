#!/usr/bin/env node

/**
 * Clusters inside a slice or a sub-slice that would make a sub-slice of their
 * own, run from the repository root:
 *
 *   pnpm masd:clusters
 *
 * A report, never a gate: it exits 0 whatever it prints. A candidate is a
 * file's downward closure — the file and everything it reaches inside its
 * slice or sub-slice — so the sub-slice it becomes never imports back into
 * what stays. Kept when:
 *
 * - its root is no door: a closure rooted at a file the unit is entered by is
 *   the unit itself;
 * - its root sits in the unit itself, not in one of its sub-slices, which are
 *   reported as units of their own;
 * - it holds at least two files and at most 80% of the unit;
 * - it is not just whole segments or sub-slices, where the tree has already
 *   cut;
 * - splitting it off raises the modularity of the unit's own graph. The app's
 *   graph is the wrong one here: past a few hundred edges, modularity's
 *   resolution limit lets no split inside a slice pay for its one door.
 *
 * Per unit it prints the best candidate and each next best that overlaps none
 * already printed. Reads `src/` and `sites/*\/app/` under the working directory.
 */

import path from 'node:path';

import { appFiles } from './lib/import-graph.ts';
import {
  cutGain,
  edgesWithin,
  importsOf,
  sliceOf,
  unitsOf,
} from './lib/slice-graph.ts';

const LARGEST_SHARE = 0.8;

type Cluster = { root: string; members: readonly string[]; gain: number };

/** The folder right below `unit` a file sits in, or the file itself at its root. */
const partOf = (file: string, unit: string): string => {
  const [first = '', ...rest] = path.relative(unit, file).split(path.sep);
  return rest.length > 0 ? path.join(unit, first) : file;
};

function unitClusters(
  unit: string,
  members: readonly string[],
  imports: ReadonlyMap<string, ReadonlySet<string>>,
  roots: readonly string[],
): Cluster[] {
  const inUnit = new Set(members);
  const below = (file: string) =>
    [...(imports.get(file) ?? [])].filter((target) => inUnit.has(target));
  const edges = edgesWithin(members, imports);
  if (edges.length === 0) return [];
  const doors = new Set(
    [...imports]
      .filter(([from]) => !inUnit.has(from))
      .flatMap(([, targets]) => [...targets])
      .filter((target) => inUnit.has(target)),
  );

  const parts = Map.groupBy(members, (file) => partOf(file, unit));
  const seen = new Set<string>();
  const candidates: Cluster[] = [];
  for (const root of roots) {
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
        (parts.get(partOf(file, unit)) ?? []).every((peer) =>
          closure.has(peer),
        ),
      )
    ) {
      continue;
    }
    seen.add(key);
    candidates.push({ root, members: sorted, gain: cutGain(closure, edges) });
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

/** Each slice and sub-slice, with every shipped file under it. */
function units(files: readonly string[]): Map<string, string[]> {
  const found = new Map<string, string[]>();
  for (const file of files) {
    const slice = sliceOf(file);
    if (slice === undefined) continue;
    for (const unit of unitsOf(file, slice)) {
      found.set(unit, [...(found.get(unit) ?? []), file]);
    }
  }
  return found;
}

function report(): string {
  const files = appFiles();
  const imports = importsOf(files);
  const all = units(files);
  const lines: string[] = [];
  let flagged = 0;
  for (const [unit, members] of [...all].toSorted(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const roots = members.filter((file) => {
      const slice = sliceOf(file) ?? '';
      return unitsOf(file, slice).at(-1) === unit;
    });
    const clusters = unitClusters(unit, members, imports, roots);
    if (clusters.length === 0) continue;
    flagged++;
    lines.push(`${unit} (${members.length} files)`);
    for (const { root, members: cluster, gain } of clusters) {
      lines.push(
        `  ${path.relative(unit, root)}: ${cluster.length} files, ΔQ ${gain.toPrecision(2)}`,
        ...cluster.map((file) => `    ${path.relative(unit, file)}`),
      );
    }
  }
  lines.push(`${flagged} of ${all.size} slices and sub-slices hold a cluster.`);
  return `${lines.join('\n')}\n`;
}

process.stdout.write(report());
