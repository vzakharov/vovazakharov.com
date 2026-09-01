#!/usr/bin/env tsx
/**
 * Cross-file duplicate type-member detector.
 *
 * Flags `type` aliases across the repo that declare the same members (same name
 * AND same type text) and should instead share a common base type. Comparison
 * is purely syntactic: two members are "the same" when their normalized
 * signature text (name + optional/readonly modifiers + type annotation,
 * whitespace-collapsed) is identical.
 *
 * Overlap is measured PAIRWISE: for every unordered pair of type aliases we
 * intersect their member sets, and report the pair when the intersection is at
 * least THRESHOLD members. This asks "how much do *these two* share" and is
 * indifferent to whether a shared member also appears in some third, unrelated
 * type.
 *
 * Only a type's OWN members count: the named constituents of an intersection
 * (`A & { … }`) are treated as inherited, so extracting a base and having both
 * types `& Base` is exactly what makes a finding disappear.
 *
 * The floor is 1: *any* member two types both declare is a finding, so every
 * shared member has a single home. Nothing is grandfathered — a run is either
 * clean or names the pair to fix.
 *
 * Only `type` aliases are scanned; `interface` is banned repo-wide by
 * `@typescript-eslint/consistent-type-definitions`, which is what makes that
 * scope complete rather than a blind spot.
 *
 * Why the floor is 1, the naming families, and how to work a finding:
 * scripts/type-overlap-check.README.md.
 *
 * Usage:
 *   pnpm type-overlap                      # threshold from THRESHOLD_DEFAULT (1)
 *   TYPE_OVERLAP_MIN=3 pnpm type-overlap   # override min shared members per pair
 *
 * Exit code is non-zero when any pair meets the threshold.
 */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import type { NamedRecord, WithFilePath } from '@/lib/typings';

// Run from the repo root (via `pnpm type-overlap` or `tsx scripts/...`), so
// cwd is the project root. We avoid `import.meta.dirname` because tsx loads
// these scripts as CommonJS, where that property is undefined.
const ROOT = process.cwd();

// The scan covers the whole repo minus the directories below, so a new source
// directory is in scope the day it appears rather than the day someone
// remembers to list it. Dot-directories are skipped wholesale (`.git`, `.next`,
// `.claude`), as are build output, dependencies, assets and scratch.
const SKIP_DIRS = new Set([
  'node_modules',
  'out',
  'build',
  'coverage',
  'public',
  'tmp',
]);

// Minimum shared members for a pair to be significant. 1 is the enforced floor:
// any member two types both declare belongs in a shared base. Raise it per-run
// with TYPE_OVERLAP_MIN to triage the worst offenders first.
const THRESHOLD_DEFAULT = 1;
const thresholdOverride = process.env['TYPE_OVERLAP_MIN'];
const THRESHOLD = Number(thresholdOverride ?? THRESHOLD_DEFAULT);
if (!Number.isInteger(THRESHOLD) || THRESHOLD < 1) {
  throw new Error(
    `TYPE_OVERLAP_MIN must be a positive integer, got: ${thresholdOverride}`,
  );
}

/** Normalized own-member signatures. */
type WithMembers = { members: string[] };

// --- Collect type aliases ---
type TypeDecl =
  // `id` is the decl locator `rel/path.ts#TypeName` (with a `#n` suffix on name
  // collisions); `name` is the type's own name
  NamedRecord &
    // repo-relative, e.g. components/card.tsx
    WithFilePath &
    WithMembers;

const decls: TypeDecl[] = [];
const usedIds = new Set<string>();

function normalizeMember(text: string): string {
  // getText() includes the trailing `;`/`,` separator — strip it so it doesn't
  // affect identity (and so `;` vs `,` styles match) and re-added at render.
  return text
    .replaceAll(/\s+/g, ' ')
    .replace(/\s*[,;]\s*$/, '')
    .trim();
}

function ownMembers(typeNode: ts.TypeNode, sf: ts.SourceFile): string[] {
  const out: string[] = [];
  const collect = (members: ts.NodeArray<ts.TypeElement>): void => {
    for (const m of members) {
      // Only property signatures (name: type). Methods, index/call signatures
      // are out of scope for this repo's params-object types.
      if (ts.isPropertySignature(m)) out.push(normalizeMember(m.getText(sf)));
    }
  };
  if (ts.isTypeLiteralNode(typeNode)) {
    collect(typeNode.members);
  } else if (ts.isIntersectionTypeNode(typeNode)) {
    // Object-literal constituents are own members; named refs are inherited.
    for (const c of typeNode.types)
      if (ts.isTypeLiteralNode(c)) collect(c.members);
  }
  return out;
}

function walk(node: ts.Node, sf: ts.SourceFile, rel: string): void {
  if (ts.isTypeAliasDeclaration(node)) {
    const members = ownMembers(node.type, sf);
    if (members.length > 0) {
      const name = node.name.text;
      let id = `${rel}#${name}`;
      for (let n = 2; usedIds.has(id); n++) id = `${rel}#${name}#${n}`;
      usedIds.add(id);
      decls.push({ id, name, filePath: rel, members });
    }
  }
  ts.forEachChild(node, (child) => {
    walk(child, sf, rel);
  });
}

function scan(dir: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
      scan(full);
      continue;
    }
    if (!/\.tsx?$/.test(entry.name)) continue;
    if (entry.name.endsWith('.d.ts')) continue;
    if (/\.test\.tsx?$/.test(entry.name)) continue;
    const rel = path.relative(ROOT, full);
    const text = readFileSync(full, 'utf8');
    const sf = ts.createSourceFile(
      full,
      text,
      ts.ScriptTarget.Latest,
      /* setParentNodes */ true,
      entry.name.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    walk(sf, sf, rel);
  }
}
scan(ROOT);

// --- Pairwise member-set intersection ---
type Overlap = { a: TypeDecl; b: TypeDecl; shared: string[] };
const overlaps: Overlap[] = [];
for (const [i, a] of decls.entries()) {
  const aSet = new Set(a.members);
  for (const b of decls.slice(i + 1)) {
    const shared = [...new Set(b.members)].filter((m) => aSet.has(m));
    if (shared.length >= THRESHOLD) overlaps.push({ a, b, shared });
  }
}

// --- Report ---
if (overlaps.length === 0) {
  process.stdout.write(
    `type-overlap: no overlapping type-pairs found (threshold=${THRESHOLD}).\n`,
  );
  process.exit(0);
}

const typesInvolved = new Set<string>();
for (const o of overlaps) {
  typesInvolved.add(o.a.id);
  typesInvolved.add(o.b.id);
}

// --- Collapse pairs into shared-shape groups ---
// The scan is pairwise, so a set of N types that all share the same members is
// emitted as N-choose-2 separate pairs echoing one shared shape. Group those
// pairs by their (identical) shared member set: every type in a group contains
// that set, so one base extraction — `type Foo = Base & { …own… }` on each
// listed type — clears the whole group at once. A type that shares different
// sets with different partners appears in more than one group (it needs each
// base); that is correct, not double-counting.
type Group = WithMembers & { types: Map<string, TypeDecl> };
const groups = new Map<string, Group>();
for (const o of overlaps) {
  const members = o.shared.toSorted((a, b) => a.localeCompare(b));
  const key = members.join('\n');
  let g = groups.get(key);
  if (!g) {
    g = { members, types: new Map() };
    groups.set(key, g);
  }
  g.types.set(o.a.id, o.a);
  g.types.set(o.b.id, o.b);
}

const groupList = [...groups.values()].toSorted(
  (x, y) =>
    y.members.length - x.members.length ||
    y.types.size - x.types.size ||
    x.members.join('\n').localeCompare(y.members.join('\n')),
);

const groupLines = groupList.flatMap((g, i) => {
  const types = [...g.types.values()].toSorted(
    (a, b) =>
      a.filePath.localeCompare(b.filePath) || a.name.localeCompare(b.name),
  );
  return [
    `${i + 1}. ${g.members.length} shared members across ${types.length} types:`,
    ...g.members.map((m) => `     ${m};`),
    '   in:',
    ...types.map((t) => `     ${t.filePath}  ${t.name}`),
    '',
  ];
});

const lines = [
  `== Overlapping type shapes (threshold=${THRESHOLD}) ==`,
  '',
  ...groupLines,
  `${groupList.length} shared-shape group(s) covering ${overlaps.length} overlapping type-pair(s) across ${typesInvolved.size} type(s) (threshold=${THRESHOLD}).`,
  '',
  '== How to fix ==',
  'For each group above:',
  '  1. Extract the shared members as a base type, then have each listed type',
  '     reuse it via intersection (`type Foo = SomeBase & { …own members… }`).',
  '  2. Home the base at its most upstream consumer — the module both types',
  '     already import, or the file that declares both. Only reach for the',
  '     repo-wide catalog in lib/typings.ts when no such module exists or the',
  '     base is genuinely cross-cutting.',
  '  3. Do not give the base its own single-type module — a file that exists only',
  '     to hold one type is churn.',
  '  4. Name it from what the members MEAN, not their count — see the naming',
  '     families in scripts/type-overlap-check.README.md.',
];

process.stdout.write(`${lines.join('\n')}\n`);
process.exit(1);
