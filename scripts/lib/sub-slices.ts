/**
 * `check:masd`'s checks on sub-slices — folders in a slice not named for a
 * segment (`subSlicePath` in `eslint/masd-graph.ts`). Every path is relative to
 * the working directory.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import {
  isTest,
  LAYERS,
  PUBLIC_API,
  SEGMENTS,
  SLICED_LAYERS,
} from '../../eslint/masd-graph.ts';
import {
  resolveImport,
  SOURCE,
  sourceFile,
  subdirectories,
} from './import-graph.ts';
import {
  cutGain,
  edgesWithin,
  importsOf,
  sliceOf,
  subSlicesOf,
  unitsOf,
} from './slice-graph.ts';

/** The comment a sub-slice's `index.ts` carries to stay put, by the operator's leave. */
const STAYS = /\/\/ masd-disable promotion -- \S/;

const within = (file: string, directory: string): boolean =>
  file.startsWith(directory + path.sep);

/** The paths of the slices in `apps`' sliced layers. */
const slicesIn = (apps: readonly string[]): string[] =>
  apps.flatMap((app) =>
    SLICED_LAYERS.flatMap((layer) => {
      const directory = path.join('src', app, layer);
      return existsSync(directory)
        ? subdirectories(directory).map((slice) => path.join(directory, slice))
        : [];
    }),
  );

/** The sub-slices directly in `unit`, as paths. */
function childSubSlices(unit: string): string[] {
  return (
    readdirSync(unit, { withFileTypes: true })
      // A folder holding no source, such as one of images, is no sub-slice.
      .filter(
        (entry) =>
          entry.isDirectory() &&
          !SEGMENTS.includes(entry.name) &&
          readdirSync(path.join(unit, entry.name), { recursive: true }).some(
            (file) => SOURCE.test(String(file)),
          ),
      )
      .map((entry) => path.join(unit, entry.name))
  );
}

/** The slices in `apps` cut into sub-slices. */
export const slicesWithSubSlices = (apps: readonly string[]): string[] =>
  slicesIn(apps).filter((slice) => childSubSlices(slice).length > 0);

/**
 * A segment's name below a segment, which Steiger's `no-reserved-folder-names`
 * would catch were it not off in the sliced layers for the sub-slices' sake.
 */
function nestedSegments(apps: readonly string[]): string[] {
  return slicesIn(apps).flatMap((slice) =>
    readdirSync(slice, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) => {
        const folder = path.join(entry.parentPath, entry.name);
        const dirs = path.relative(slice, folder).split(path.sep);
        const segment = dirs.findIndex((dir) => SEGMENTS.includes(dir));
        return segment !== -1 &&
          segment < dirs.length - 1 &&
          SEGMENTS.includes(entry.name)
          ? [
              `${folder}: "${entry.name}" names a segment, inside segment "${dirs[segment]}"; a folder in a segment takes a name of its own`,
            ]
          : [];
      }),
  );
}

/**
 * What sits at the root of a slice or sub-slice holding a sub-slice, other than
 * its sub-slices, its barrels and its tests: such a unit is cut all the way, so
 * the rest of it is a sub-slice of its own, named for its noun.
 */
function mixed(apps: readonly string[]): string[] {
  const inUnit = (unit: string): string[] => {
    const subs = childSubSlices(unit);
    const below = subs.flatMap((sub) => inUnit(sub));
    if (subs.length === 0) return below;
    const loose = readdirSync(unit, { withFileTypes: true })
      .filter((entry) =>
        entry.isDirectory()
          ? SEGMENTS.includes(entry.name)
          : !PUBLIC_API.includes(entry.name) &&
            !isTest(path.join(unit, entry.name)),
      )
      .map((entry) => `"${entry.name}"`);
    return loose.length === 0
      ? below
      : [
          `${unit}: ${loose.join(', ')} beside its sub-slices; a unit holding a sub-slice holds only sub-slices and barrels, so move the rest into a sub-slice named for its noun`,
          ...below,
        ];
  };
  return slicesIn(apps).flatMap((slice) => inUnit(slice));
}

/** Each child sub-slice of a unit, and the siblings it imports. */
type Siblings = Map<string, Set<string>>;

/** Per unit holding sub-slices, its children and their imports of one another. */
function siblingGraphs(
  slices: ReadonlyMap<string, readonly string[]>,
  imports: ReadonlyMap<string, ReadonlySet<string>>,
): Map<string, Siblings> {
  const graphs = new Map<string, Siblings>();
  const graphOf = (parent: string): Siblings => {
    const graph = graphs.get(parent) ?? new Map<string, Set<string>>();
    graphs.set(parent, graph);
    return graph;
  };
  for (const [slice, members] of slices) {
    for (const from of members) {
      const chain = unitsOf(from, slice);
      for (const [index, child] of chain.entries()) {
        const parent = chain[index - 1];
        if (parent !== undefined && !graphOf(parent).has(child)) {
          graphOf(parent).set(child, new Set());
        }
      }
      for (const to of imports.get(from) ?? []) {
        if (sliceOf(to) !== slice) continue;
        const other = unitsOf(to, slice);
        const fork = chain.findIndex((unit, index) => other[index] !== unit);
        const [child, sibling, parent] = [
          chain[fork],
          other[fork],
          chain[fork - 1],
        ];
        if (child === undefined || sibling === undefined) continue;
        if (parent === undefined) continue;
        graphOf(parent).get(child)?.add(sibling);
      }
    }
  }
  return graphs;
}

/** Every sibling `from` reaches by importing, itself only through a cycle. */
function reaches(graph: Siblings, from: string): Set<string> {
  const seen = new Set<string>();
  const stack = [...(graph.get(from) ?? [])];
  for (let node = stack.pop(); node !== undefined; node = stack.pop()) {
    if (seen.has(node)) continue;
    seen.add(node);
    stack.push(...(graph.get(node) ?? []));
  }
  return seen;
}

/**
 * Sibling sub-slices importing one another in a cycle. Each enters the other by
 * its barrel, which madge sees as a file like any other, so files can form a
 * DAG while the sub-slices holding them go round.
 */
const siblingCycles = (graphs: ReadonlyMap<string, Siblings>): string[] =>
  [...graphs].flatMap(([parent, graph]) =>
    cycles(graph).map(
      (cycle) =>
        `${parent}: its sub-slices ${cycle.map((sub) => `"${path.basename(sub)}"`).join(', ')} import one another in a cycle; siblings import in one direction only, so move what they share into a sub-slice of its own or merge them`,
    ),
  );

/** The strongly connected components of more than one node, each sorted. */
function cycles(graph: Siblings): string[][] {
  const reach = new Map(
    [...graph.keys()].map((node) => [node, reaches(graph, node)]),
  );
  const found = new Map<string, string[]>();
  for (const [node, reached] of reach) {
    const component = [...reached]
      .filter((other) => reach.get(other)?.has(node) === true)
      .toSorted();
    if (component.length > 1) found.set(component.join('\n'), component);
  }
  return [...found.values()];
}

/**
 * Sub-slices earned neither way: their cut does not raise the modularity of
 * their parent's graph, and fewer than two siblings import them. The second is
 * what keeps a piece two siblings share below both of them, and only while both
 * still do.
 */
function insignificant(
  slices: ReadonlyMap<string, readonly string[]>,
  imports: ReadonlyMap<string, ReadonlySet<string>>,
  graphs: ReadonlyMap<string, Siblings>,
): string[] {
  const shared = (sub: string, parent: string): boolean =>
    [...(graphs.get(parent) ?? [])].filter(([, targets]) => targets.has(sub))
      .length >= 2;
  return [...slices].flatMap(([slice, members]) => {
    const parents = new Map<string, string>();
    for (const file of members) {
      const chain = unitsOf(file, slice);
      for (const [index, sub] of chain.entries()) {
        if (index > 0) parents.set(sub, chain[index - 1] ?? slice);
      }
    }
    return [...parents].flatMap(([sub, parent]) => {
      const family = members.filter((file) => within(file, parent));
      const part = new Set(family.filter((file) => within(file, sub)));
      return cutGain(part, edgesWithin(family, imports)) > 0 ||
        shared(sub, parent)
        ? []
        : [
            `${sub}: This sub-slice neither raises the modularity of its parent's imports nor is imported by two of its siblings. Consider folding it into "${parent}".`,
          ];
    });
  });
}

/** The names a statement takes from its module, `*` standing for all of them. */
function namesTaken(statement: ts.Statement): string[] {
  if (ts.isImportDeclaration(statement)) {
    const clause = statement.importClause;
    if (clause === undefined) return ['*'];
    const bindings = clause.namedBindings;
    return [
      ...(clause.name === undefined ? [] : ['default']),
      ...(bindings === undefined
        ? []
        : ts.isNamespaceImport(bindings)
          ? ['*']
          : bindings.elements.map(
              (element) => (element.propertyName ?? element.name).text,
            )),
    ];
  }
  if (ts.isExportDeclaration(statement)) {
    const clause = statement.exportClause;
    return clause !== undefined && ts.isNamedExports(clause)
      ? clause.elements.map(
          (element) => (element.propertyName ?? element.name).text,
        )
      : ['*'];
  }
  return [];
}

/** Each import or re-export of `file`, as the file it loads and the names it takes. */
function takes(file: string): Array<[string, string[]]> {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
  );
  return source.statements.flatMap((statement) => {
    const specifier =
      ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)
        ? statement.moduleSpecifier
        : undefined;
    if (specifier === undefined || !ts.isStringLiteral(specifier)) return [];
    const resolved = resolveImport(file, specifier.text);
    const loaded = resolved === undefined ? undefined : sourceFile(resolved);
    return loaded === undefined
      ? []
      : [[loaded, namesTaken(statement)] as [string, string[]]];
  });
}

/** Where a shipped file consumes from: its slice, its segmented layer or its router. */
function consumerOf(file: string): string | undefined {
  const parts = file.split(path.sep);
  if (parts[0] === 'sites') return parts.slice(0, 3).join(path.sep);
  if (parts[2] === 'scripts' || isTest(file)) return undefined;
  return sliceOf(file) ?? parts.slice(0, 3).join(path.sep);
}

/**
 * Where `file` takes the barrel `loaded` from, when that barrel is a slice's or
 * a sub-slice's entered from outside it: for a slice, `consumerOf`; for a
 * sub-slice, the place in its parent the file sits in — a sibling sub-slice, or
 * the parent's own segments. `target` is the slice or sub-slice and `parent`
 * the one that holds it, `undefined` for a slice.
 */
function enteredFrom(
  file: string,
  loaded: string,
): { consumer: string; target: string; parent?: string } | undefined {
  const slice = sliceOf(loaded);
  const target = path.dirname(loaded);
  if (slice === undefined || !PUBLIC_API.includes(path.basename(loaded))) {
    return undefined;
  }
  if (target === slice) {
    const consumer = consumerOf(file);
    return consumer === undefined || consumer === slice
      ? undefined
      : { consumer, target };
  }
  const chain = unitsOf(loaded, slice);
  if (chain.at(-1) !== target || sliceOf(file) !== slice) return undefined;
  if (within(file, target)) return undefined;
  const parent = chain.at(-2) ?? slice;
  const consumer =
    subSlicesOf(file, slice).find((sub) => path.dirname(sub) === parent) ??
    parent;
  return { consumer, target, parent };
}

/** A file's FSD layer, for a file in one; routers, scripts and the like have none. */
function layerOf(file: string): string | undefined {
  const [root, , layer = ''] = file.split(path.sep);
  return root === 'src' && LAYERS.includes(layer) ? layer : undefined;
}

/** A layer's height, highest first. */
const rank = (layer: string): number => LAYERS.indexOf(layer);

/** Whether a layer may be imported by `importer`'s, `shared` by `shared` included. */
const below = (importer: string) => (layer: string) =>
  rank(layer) > rank(importer) || (layer === 'shared' && importer === 'shared');

/** Whether a layer may import `imported`'s, which `shared` anything may. */
const above = (imported: string) => (layer: string) =>
  imported === 'shared' || rank(layer) < rank(imported);

/**
 * The layers a sub-slice of `slice` promoted to a slice of its own may land
 * on, in its app: strictly below each layer importing it — `takers` through
 * the slice's barrels, its siblings directly — and strictly above each sliced
 * layer it imports, `shared` taking from `shared` as segments do. Which of them
 * fits is a call on what the piece is, so this only narrows it.
 */
function destinations(
  sub: string,
  slice: string,
  takers: ReadonlySet<string>,
  imports: ReadonlyMap<string, ReadonlySet<string>>,
): string[] {
  const bars = [...takers].flatMap((file) => {
    const layer = layerOf(file);
    return layer === undefined ? [] : [below(layer)];
  });
  const isBarrel = (file: string): boolean =>
    path.dirname(file) === slice && PUBLIC_API.includes(path.basename(file));
  for (const [from, targets] of imports) {
    const inside = within(from, sub);
    if (!inside && isBarrel(from)) continue;
    for (const to of targets) {
      if (within(to, sub) === inside) continue;
      const other = layerOf(inside ? to : from);
      if (other !== undefined) bars.push((inside ? above : below)(other));
    }
  }
  return [...SLICED_LAYERS, 'shared'].filter((layer) =>
    bars.every((fits) => fits(layer)),
  );
}

/**
 * Consumers that take from a slice or a sub-slice only what one of its
 * sub-slices exports: that sub-slice belongs one level out, where both can
 * import it — a slice of its own, on a layer `destinations` lists, or a
 * sub-slice beside the one it sits in. One that imports every sibling,
 * directly or not, is the unit's head, and a consumer of the head needs the
 * whole unit.
 */
function promotions(
  files: readonly string[],
  imports: ReadonlyMap<string, ReadonlySet<string>>,
  graphs: ReadonlyMap<string, Siblings>,
): string[] {
  const isHead = (sub: string, unit: string): boolean => {
    const graph = graphs.get(unit);
    if (graph === undefined) return false;
    const reached = reaches(graph, sub);
    return [...graph.keys()].every(
      (sibling) => sibling === sub || reached.has(sibling),
    );
  };

  // A barrel's every export name, as the sub-slice of `target` it comes from.
  const origins = new Map<string, Map<string, string | undefined>>();
  const originsOf = (barrel: string, target: string) => {
    const known = origins.get(barrel);
    if (known !== undefined) return known;
    const named = new Map<string, string | undefined>();
    for (const [loaded, names] of takes(barrel)) {
      const [sub] = subSlicesOf(loaded, target);
      for (const name of names) named.set(name, sub);
    }
    origins.set(barrel, named);
    return named;
  };

  const taken = new Map<
    string,
    { subs: Set<string | undefined>; parent?: string }
  >();
  // Each sub-slice, as the files taking its exports through a barrel.
  const takers = new Map<string, Set<string>>();
  for (const file of files) {
    if (isTest(file)) continue;
    for (const [loaded, names] of takes(file)) {
      const entry = enteredFrom(file, loaded);
      if (entry === undefined) continue;
      const { consumer, target, parent } = entry;
      const named = originsOf(loaded, target);
      const key = `${consumer}\n${target}`;
      const record = taken.get(key) ?? { subs: new Set(), parent };
      for (const name of names) {
        const sub = named.get(name);
        record.subs.add(sub);
        if (sub !== undefined) {
          takers.set(sub, (takers.get(sub) ?? new Set()).add(file));
        }
      }
      taken.set(key, record);
    }
  }

  return [...taken].flatMap(([key, { subs, parent }]) => {
    const [consumer = '', target = ''] = key.split('\n');
    const [sub, ...others] = subs;
    if (sub === undefined || others.length > 0 || isHead(sub, target)) {
      return [];
    }
    const barrel = path.join(sub, 'index.ts');
    if (existsSync(barrel) && STAYS.test(readFileSync(barrel, 'utf8'))) {
      return [];
    }
    const layers =
      parent === undefined
        ? destinations(sub, target, takers.get(sub) ?? new Set(), imports)
        : [];
    const remedy =
      parent === undefined
        ? layers.length === 0
          ? 'promote it to a slice of its own that both can import, though no layer of its app lies below what imports it and above what it imports'
          : `promote it to a slice of its own that both can import, on ${layers.map((layer) => `"${layer}"`).join(' or ')} — whichever names what it is`
        : `move it up into ${parent}, beside "${path.basename(target)}", so both import it from there`;
    return [
      `${consumer} takes from ${target} only its sub-slice "${path.basename(sub)}": ${remedy}. Where the import rules leave it nowhere to go, ask the operator, and on their yes put "// masd-disable promotion -- <why it cannot move>" in ${barrel}.`,
    ];
  });
}

/** Every problem with the sub-slices of `files`, the apps' source files. */
export function subSliceProblems(
  apps: readonly string[],
  files: readonly string[],
): string[] {
  const imports = importsOf(files);
  const slices = Map.groupBy(
    files.filter((file) => sliceOf(file) !== undefined),
    (file) => sliceOf(file) ?? '',
  );
  const graphs = siblingGraphs(slices, imports);
  return [
    ...nestedSegments(apps),
    ...mixed(apps),
    ...siblingCycles(graphs),
    ...insignificant(slices, imports, graphs),
    ...promotions(files, imports, graphs),
  ];
}
