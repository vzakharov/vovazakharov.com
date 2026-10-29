/**
 * `check:masd`'s checks on sub-slices — folders in a slice not named for a
 * segment (`subSlicePath` in `eslint/masd-graph.ts`). Every path is relative to
 * the working directory.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import {
  PUBLIC_API,
  SEGMENTS,
  SLICED_LAYERS,
} from '../../eslint/masd-graph.ts';
import { resolveImport, sourceFile, subdirectories } from './import-graph.ts';
import {
  cutGain,
  edgesWithin,
  importsOf,
  isTest,
  sliceOf,
  subSlicesOf,
} from './slice-graph.ts';

/** The comment a sub-slice's `index.ts` carries to stay put, by the operator's leave. */
export const STAYS = /\/\/ masd-disable promotion -- \S/;

const within = (file: string, directory: string): boolean =>
  file.startsWith(directory + path.sep);

/**
 * A segment's name below a segment, which Steiger's `no-reserved-folder-names`
 * would catch were it not off in the sliced layers for the sub-slices' sake.
 */
function nestedSegments(apps: readonly string[]): string[] {
  return apps.flatMap((app) =>
    SLICED_LAYERS.flatMap((layer) => {
      const directory = path.join('src', app, layer);
      if (!existsSync(directory)) return [];
      return subdirectories(directory).flatMap((slice) =>
        readdirSync(path.join(directory, slice), {
          recursive: true,
          withFileTypes: true,
        })
          .filter((entry) => entry.isDirectory())
          .flatMap((entry) => {
            const folder = path.join(entry.parentPath, entry.name);
            const dirs = path
              .relative(path.join(directory, slice), folder)
              .split(path.sep);
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
    }),
  );
}

/** Sub-slices whose cut does not raise the modularity of their parent's graph. */
function insignificant(
  slices: ReadonlyMap<string, readonly string[]>,
  imports: ReadonlyMap<string, ReadonlySet<string>>,
): string[] {
  return [...slices].flatMap(([slice, members]) => {
    const parents = new Map<string, string>();
    for (const file of members) {
      const chain = [slice, ...subSlicesOf(file, slice)];
      for (const [index, sub] of chain.entries()) {
        if (index > 0) parents.set(sub, chain[index - 1] ?? slice);
      }
    }
    return [...parents].flatMap(([sub, parent]) => {
      const family = members.filter((file) => within(file, parent));
      const part = new Set(family.filter((file) => within(file, sub)));
      return cutGain(part, edgesWithin(family, imports)) > 0
        ? []
        : [
            `${sub}: This sub-slice does not raise the modularity of its parent's imports. Consider folding it into "${parent}".`,
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
 * Consumers that take from a slice only what one of its sub-slices exports: that
 * sub-slice is a slice of its own, held in the wrong place.
 */
function promotions(files: readonly string[]): string[] {
  // A slice barrel's every export name, as the sub-slice it comes from.
  const origins = new Map<string, Map<string, string | undefined>>();
  const originsOf = (barrel: string, slice: string) => {
    const known = origins.get(barrel);
    if (known !== undefined) return known;
    const named = new Map<string, string | undefined>();
    for (const [loaded, names] of takes(barrel)) {
      const [sub] = subSlicesOf(loaded, slice);
      for (const name of names) named.set(name, sub);
    }
    origins.set(barrel, named);
    return named;
  };

  const taken = new Map<string, Set<string | undefined>>();
  for (const file of files) {
    const consumer = consumerOf(file);
    if (consumer === undefined) continue;
    for (const [loaded, names] of takes(file)) {
      const slice = sliceOf(loaded);
      if (
        slice === undefined ||
        slice === consumer ||
        path.dirname(loaded) !== slice ||
        !PUBLIC_API.includes(path.basename(loaded))
      ) {
        continue;
      }
      const named = originsOf(loaded, slice);
      const key = `${consumer}\n${slice}`;
      const subs = taken.get(key) ?? new Set();
      for (const name of names) subs.add(named.get(name));
      taken.set(key, subs);
    }
  }

  return [...taken].flatMap(([key, subs]) => {
    const [consumer = '', slice = ''] = key.split('\n');
    const [sub, ...others] = subs;
    if (sub === undefined || others.length > 0) return [];
    const barrel = path.join(sub, 'index.ts');
    if (existsSync(barrel) && STAYS.test(readFileSync(barrel, 'utf8'))) {
      return [];
    }
    return [
      `${consumer} takes from ${slice} only its sub-slice "${path.basename(sub)}": promote it to a slice of its own that both can import. Where the import rules leave it nowhere to go, ask the operator, and on their yes put "// masd-disable promotion -- <why it cannot move>" in ${barrel}.`,
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
  return [
    ...nestedSegments(apps),
    ...insignificant(slices, imports),
    ...promotions(files),
  ];
}
