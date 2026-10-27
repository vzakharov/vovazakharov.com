import type { Rule } from 'eslint';
import type * as ESTree from 'estree';
import path from 'node:path';
import ts from 'typescript';

import { TEST_FILE } from '../masd-graph';
import { hasTypeServices } from './type-services';

// An import binds by name, so an app holding two module-level values of one name
// leaves a rewrite that rebinds imports by name — a move between slices — free
// to point the exported one's importers at its namesake, and a wrong constant of
// the right type passes the type checker. Two private namesakes are never
// imported, so only a pair one of which is exported is flagged. The program is
// what lets one file see its app's others; tests and kits are left out, being
// imported by no production file.

/**
 * Names a convention gives every holder of one kind of module, so they are
 * namesakes on purpose: an i18n catalogue's loader is `messages` wherever it
 * sits, and its import path says whose (`.claude/rules/i18n.md`).
 */
const CONVENTIONAL = new Set(['messages']);

/** A module-level value: its name, its file, and whether the file exports it. */
type Declared = { name: string; file: string; exported: boolean };

/** Every production file's module-level values, by app, then by name. */
type AppIndex = Map<string, Map<string, Declared[]>>;

function exportedLocals(source: ts.SourceFile): Set<string> {
  const names = new Set<string>();
  for (const statement of source.statements) {
    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier === undefined &&
      statement.exportClause !== undefined &&
      ts.isNamedExports(statement.exportClause)
    ) {
      for (const element of statement.exportClause.elements) {
        names.add((element.propertyName ?? element.name).text);
      }
    }
    if (
      ts.isExportAssignment(statement) &&
      ts.isIdentifier(statement.expression)
    ) {
      names.add(statement.expression.text);
    }
  }
  return names;
}

const isExported = (statement: ts.Statement): boolean =>
  ts.canHaveModifiers(statement) &&
  (ts.getModifiers(statement) ?? []).some(
    ({ kind }) => kind === ts.SyntaxKind.ExportKeyword,
  );

function declaredIn(source: ts.SourceFile, file: string): Declared[] {
  const exports = exportedLocals(source);
  const declared: Declared[] = [];
  const add = (name: string, statement: ts.Statement) => {
    declared.push({
      name,
      file,
      exported: isExported(statement) || exports.has(name),
    });
  };
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const { name } of statement.declarationList.declarations) {
      if (ts.isIdentifier(name) && !CONVENTIONAL.has(name.text)) {
        add(name.text, statement);
      }
    }
  }
  return declared;
}

/** The app a file under `src/` belongs to, unless it is test code or outside it. */
function appOf(src: string, file: string): string | undefined {
  const fromSrc = path.relative(src, file);
  if (fromSrc.startsWith('..') || path.isAbsolute(fromSrc)) return undefined;
  if (TEST_FILE.test(file) || file.endsWith('.d.ts')) return undefined;
  const [app, rest] = fromSrc.split(path.sep);
  return rest === undefined ? undefined : app;
}

const indexes = new WeakMap<ts.Program, AppIndex>();

function indexOf(program: ts.Program, src: string): AppIndex {
  const known = indexes.get(program);
  if (known !== undefined) return known;
  const index: AppIndex = new Map();
  for (const source of program.getSourceFiles()) {
    const file = path.resolve(source.fileName);
    const app = appOf(src, file);
    if (app === undefined) continue;
    const byName = index.get(app) ?? new Map<string, Declared[]>();
    index.set(app, byName);
    for (const declared of declaredIn(source, file)) {
      byName.set(declared.name, [
        ...(byName.get(declared.name) ?? []),
        declared,
      ]);
    }
  }
  indexes.set(program, index);
  return index;
}

/** The identifiers a module-level statement declares a variable under. */
function declaredIds(statement: ESTree.Node): ESTree.Identifier[] {
  if (statement.type === 'ExportNamedDeclaration' && statement.declaration) {
    return declaredIds(statement.declaration);
  }
  return statement.type === 'VariableDeclaration'
    ? statement.declarations.flatMap(({ id }) =>
        id.type === 'Identifier' ? [id] : [],
      )
    : [];
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow a module-level value sharing its name with another in the same app when either is exported (type-aware)',
    },
    schema: [],
    messages: {
      namesake:
        '`{{name}}` is also declared at module level in `{{other}}`, and one of the two is exported: an import of `{{name}}` can be bound to the wrong one with no type error. Name each for what sets it apart.',
    },
  },

  create(context) {
    const services: unknown = context.sourceCode.parserServices;
    if (!hasTypeServices(services)) return {};
    const src = path.join(context.cwd, 'src');
    const file = path.resolve(context.filename);
    const app = appOf(src, file);
    if (app === undefined) return {};

    return {
      Program(program) {
        const byName = indexOf(services.program, src).get(app);
        for (const statement of program.body) {
          for (const id of declaredIds(statement)) {
            const all = byName?.get(id.name) ?? [];
            const others = all.filter((declared) => declared.file !== file);
            if (others.length === 0 || !all.some(({ exported }) => exported)) {
              continue;
            }
            const { name } = id;
            context.report({
              node: id,
              messageId: 'namesake',
              data: {
                name,
                other: others
                  .map((declared) => path.relative(context.cwd, declared.file))
                  .join('`, `'),
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
