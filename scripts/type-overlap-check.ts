#!/usr/bin/env tsx
/**
 * Cross-file duplicate type-shape detector.
 *
 * Two passes over the same set of `type` aliases, both purely syntactic and both
 * measured PAIRWISE — for every unordered pair we intersect the pass's sets and
 * report the pair when the intersection meets that pass's floor:
 *
 * - **Shared members**, floor 1. Two members are "the same" when their
 *   normalized signature text (name + optional/readonly modifiers + type
 *   annotation, whitespace-collapsed) is identical. Only a type's OWN members
 *   count: the named constituents of an intersection (`A & { … }`) are treated
 *   as inherited, so extracting a base and having both types `& Base` is exactly
 *   what makes a finding disappear. *Any* member two types both declare is a
 *   finding, so every shared member has a single home.
 * - **Repeated base combinations**, floor 2. The same named constituents spelled
 *   across two types — `Titled & Described` written twice — is duplication in
 *   the sense a shared member is, one level up, and the member pass cannot see
 *   it because it counts those constituents as inherited. The floor is 2 because
 *   a single shared base is reuse working as intended, and is the end state
 *   every member finding is fixed into.
 *
 * Nothing is grandfathered — a run is either clean or names the pairs to fix.
 *
 * Only `type` aliases are scanned; `interface` is banned repo-wide by
 * `@typescript-eslint/consistent-type-definitions`, which is what makes that
 * scope complete rather than a blind spot.
 *
 * Why the floors are what they are, the naming families, and how to work a
 * finding: scripts/type-overlap-check.README.md.
 *
 * Usage:
 *   pnpm type-overlap                             # floors: members 1, bases 2
 *   TYPE_OVERLAP_MIN=3 pnpm type-overlap          # raise the shared-member floor
 *   TYPE_OVERLAP_BASES_MIN=3 pnpm type-overlap    # raise the shared-base floor
 *
 * Exit code is non-zero when either pass has findings.
 */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import type { WithId } from '@/shared/typings';

// Run from the repo root (via `pnpm type-overlap` or `tsx scripts/...`), so
// cwd is the project root — which is what the scan walks, rather than a path
// derived from this file's own location.
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

// A floor doubles as the default: an env override raises it, never lowers it,
// so a run can triage the worst offenders first but never preview a stricter
// gate than the one vet enforces.
function readThreshold(name: string, floor: number): number {
  const override = process.env[name];
  const value = Number(override ?? floor);
  if (!Number.isInteger(value) || value < floor) {
    throw new Error(`${name} must be an integer >= ${floor}, got: ${override}`);
  }
  return value;
}

const MEMBERS_MIN = readThreshold('TYPE_OVERLAP_MIN', 1);
const BASES_MIN = readThreshold('TYPE_OVERLAP_BASES_MIN', 2);

/** Normalized own-member signatures. */
type WithMembers = { members: string[] };

/** Normalized text of the named constituents of an intersection. */
type WithBases = { bases: string[] };

// --- Collect type aliases ---
type TypeDecl = WithId &
  WithMembers &
  WithBases & {
    // `id` is the decl locator `rel/path.ts#TypeName`, with a `#n` suffix on
    // name collisions; `name` is the type's own name.
    name: string;
    // Repo-relative, e.g. src/shared/ui/card.tsx.
    filePath: string;
  };

const decls: TypeDecl[] = [];
const usedIds = new Set<string>();

function normalize(text: string): string {
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
      if (ts.isPropertySignature(m)) out.push(normalize(m.getText(sf)));
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

function namedConstituents(typeNode: ts.TypeNode, sf: ts.SourceFile): string[] {
  if (!ts.isIntersectionTypeNode(typeNode)) return [];
  // Everything `ownMembers` leaves behind: `Titled`, `Maybe<Foo>`,
  // `Pick<X, 'y'>` are all genuinely part of the combination, so the two halves
  // partition the constituents with no carve-out to keep in sync.
  return typeNode.types
    .filter((c) => !ts.isTypeLiteralNode(c))
    .map((c) => normalize(c.getText(sf)));
}

function walk(node: ts.Node, sf: ts.SourceFile, rel: string): void {
  if (ts.isTypeAliasDeclaration(node)) {
    const members = ownMembers(node.type, sf);
    const bases = namedConstituents(node.type, sf);
    // A pure combination alias (`type Summarized = Titled & Described`) has no
    // own members and still belongs in the base pass — as a participant, so a
    // type respelling the combination is flagged against it and the fix the
    // finding names is "use the alias that already exists".
    if (members.length > 0 || bases.length > 0) {
      const name = node.name.text;
      let id = `${rel}#${name}`;
      for (let n = 2; usedIds.has(id); n++) id = `${rel}#${name}#${n}`;
      usedIds.add(id);
      decls.push({ id, name, filePath: rel, members, bases });
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
      entry.name.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );
    walk(sf, sf, rel);
  }
}
scan(ROOT);

/** The entries a pair was found to have in common — members or bases. */
type WithShared = { shared: string[] };

type Overlap = WithShared & { a: TypeDecl; b: TypeDecl };
type Group = WithShared & { types: Map<string, TypeDecl> };

type Findings = {
  groups: Group[];
  pairs: number;
  typesInvolved: number;
};

// --- Pairwise intersection, collapsed into shared-shape groups ---
// The scan is pairwise, so a set of N types that all share the same entries is
// found as N-choose-2 separate pairs echoing one shape. Group those pairs by
// their (identical) shared set: every type in a group contains that set, so one
// extraction clears the whole group at once. A type that shares different sets
// with different partners appears in more than one group (it needs each base);
// that is correct, not double-counting.
function findOverlaps(
  select: (d: TypeDecl) => string[],
  threshold: number
): Findings {
  const overlaps: Overlap[] = [];
  for (const [i, a] of decls.entries()) {
    const aSet = new Set(select(a));
    for (const b of decls.slice(i + 1)) {
      const shared = [...new Set(select(b))].filter((m) => aSet.has(m));
      if (shared.length >= threshold) overlaps.push({ a, b, shared });
    }
  }

  const groups = new Map<string, Group>();
  const typesInvolved = new Set<string>();
  for (const o of overlaps) {
    typesInvolved.add(o.a.id);
    typesInvolved.add(o.b.id);
    const shared = o.shared.toSorted((x, y) => x.localeCompare(y));
    const key = shared.join('\n');
    let g = groups.get(key);
    if (!g) {
      g = { shared, types: new Map() };
      groups.set(key, g);
    }
    g.types.set(o.a.id, o.a);
    g.types.set(o.b.id, o.b);
  }

  return {
    groups: [...groups.values()].toSorted(
      (x, y) =>
        y.shared.length - x.shared.length ||
        y.types.size - x.types.size ||
        x.shared.join('\n').localeCompare(y.shared.join('\n'))
    ),
    pairs: overlaps.length,
    typesInvolved: typesInvolved.size,
  };
}

// --- Report ---
type SectionStyle = {
  heading: string;
  /** Plural noun for the shared entries, as the group and summary lines read. */
  noun: string;
  /** Renders one group's shared set as report lines. */
  renderShared: (shared: string[]) => string[];
};

function renderSection(
  findings: Findings,
  threshold: number,
  style: SectionStyle
): string[] {
  if (findings.groups.length === 0) return [];

  const groupLines = findings.groups.flatMap((g, i) => {
    const types = [...g.types.values()].toSorted(
      (a, b) =>
        a.filePath.localeCompare(b.filePath) || a.name.localeCompare(b.name)
    );
    return [
      `${i + 1}. ${g.shared.length} shared ${style.noun} across ${types.length} types:`,
      ...style.renderShared(g.shared),
      '   in:',
      ...types.map((t) => `     ${t.filePath}  ${t.name}`),
      '',
    ];
  });

  return [
    `== ${style.heading} (threshold=${threshold}) ==`,
    '',
    ...groupLines,
    `${findings.groups.length} group(s) of shared ${style.noun} covering ${findings.pairs} overlapping type-pair(s) across ${findings.typesInvolved} type(s) (threshold=${threshold}).`,
    '',
  ];
}

const memberFindings = findOverlaps((d) => d.members, MEMBERS_MIN);
const baseFindings = findOverlaps((d) => d.bases, BASES_MIN);

if (memberFindings.groups.length === 0 && baseFindings.groups.length === 0) {
  process.stdout.write(
    `type-overlap: clean — no shared members (min=${MEMBERS_MIN}), no repeated base combinations (min=${BASES_MIN}).\n`
  );
  process.exit(0);
}

// Step 1 is the same move for both kinds, so it takes a sub-bullet per kind —
// emitted only for the kinds that fired. Steps 2–4 are kind-agnostic.
const fixSteps = [
  ...(memberFindings.groups.length > 0
    ? ['       - members → `type Foo = SomeBase & { …own members… }`']
    : []),
  ...(baseFindings.groups.length > 0
    ? [
        '       - bases   → `type SomeBase = A & B`, then `type Foo = SomeBase & { … }`',
      ]
    : []),
];

const lines = [
  ...renderSection(memberFindings, MEMBERS_MIN, {
    heading: 'Overlapping type shapes',
    noun: 'members',
    renderShared: (shared) => shared.map((m) => `     ${m};`),
  }),
  ...renderSection(baseFindings, BASES_MIN, {
    heading: 'Repeated base combinations',
    noun: 'bases',
    renderShared: (shared) => [`     ${shared.join(' & ')}`],
  }),
  '== How to fix ==',
  'For each group above:',
  '  1. Extract the shared shape as a base type, then have each listed type',
  '     reuse it via intersection:',
  ...fixSteps,
  '  2. Home the base at its most upstream consumer — the module both types',
  '     already import, or the file that declares both. Only reach for the',
  '     src/shared/ segment that owns the concept when no such module exists',
  '     or the base is genuinely cross-cutting.',
  '  3. Do not give the base its own single-type module — a file that exists only',
  '     to hold one type is churn.',
  '  4. Name it from what the members MEAN, not their count — see the naming',
  '     families in scripts/type-overlap-check.README.md.',
];

process.stdout.write(`${lines.join('\n')}\n`);
process.exit(1);
