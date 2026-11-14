/**
 * One `.wgsl` file read as a WESL module: its `import` statements, the source
 * that ships, the names it declares and the names it uses. The reading is
 * lexical — enough to link and to check imports, not a WGSL parser; the GPU
 * compile (`pnpm shaders:cube`) is what checks the rest.
 */

/** One `import` statement's target: a module path and the items taken from it. */
export type Import = {
  /** Path components after `package` or the run of `super`s. */
  path: readonly string[];
  /** How many `super`s lead it; `undefined` for a `package::` path. */
  supers: number | undefined;
  items: readonly string[];
  line: number;
};

/** Names declared at module scope. */
export type Declaring = { declares: ReadonlySet<string> };

export type Module = Declaring & {
  imports: readonly Import[];
  /** What ships: the file minus its head comment and its imports, trimmed. */
  shipped: string;
  /** Names used, each with whether it is ever called. */
  uses: ReadonlyMap<string, { called: boolean }>;
};

const IMPORT = /^import\s+([\w:]+?)(?:::{([^}]*)})?\s*;\s*$/;
const IDENTIFIER = /^[A-Z_a-z]\w*$/;

function parseImport(text: string, line: number): Import {
  const [, head, list] = IMPORT.exec(text) ?? [];
  if (head === undefined) {
    throw new Error(`line ${String(line)}: cannot read ${text}`);
  }
  const parts = head.split('::');
  const items =
    list === undefined
      ? parts.splice(-1)
      : list
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
  const supers = parts.findIndex((part) => part !== 'super');
  const isPackage = parts[0] === 'package';
  if (!isPackage && supers < 1) {
    throw new Error(
      `line ${String(line)}: an import starts with package:: or super::`,
    );
  }
  const path = parts.slice(isPackage ? 1 : supers);
  for (const name of [...path, ...items]) {
    if (!IDENTIFIER.test(name)) {
      throw new Error(`line ${String(line)}: ${name} is not a WESL name`);
    }
  }
  if (path.length === 0 || items.length === 0) {
    throw new Error(`line ${String(line)}: ${text} names no module or item`);
  }
  return { path, supers: isPackage ? undefined : supers, items, line };
}

const DECLARATION = /^(?:fn|struct|const|override|alias)\s+(\w+)/;
/** A module-scope variable, its binding attributes before it on its line. */
const PRIVATE = /^(?:@\w+(?:\([^)]*\))?\s+)*var(?:<[^>]*>)?\s+(\w+)/;

const withoutComments = (source: string): string =>
  source.replaceAll(/\/\/.*$/gm, '');

/** Names bound inside functions and structs: parameters, fields, lets and vars. */
function boundNames(code: string): Set<string> {
  const bound = new Set<string>();
  for (const [, list = ''] of code.matchAll(/\bfn\s+\w+\s*\(([^)]*)\)/g)) {
    for (const [, name = ''] of list.matchAll(/(\w+)\s*:/g)) bound.add(name);
  }
  for (const [, fields = ''] of code.matchAll(/\bstruct\s+\w+\s*{([^}]*)}/g)) {
    for (const [, name = ''] of fields.matchAll(/(\w+)\s*:/g)) bound.add(name);
  }
  for (const [, name = ''] of code.matchAll(/\b(?:let|var)\s+(\w+)/g)) {
    bound.add(name);
  }
  return bound;
}

function usedNames(code: string): Map<string, { called: boolean }> {
  const uses = new Map<string, { called: boolean }>();
  for (const match of code.matchAll(/\b[A-Z_a-z]\w*/g)) {
    const before = code[match.index - 1];
    if (before === '.') continue;
    const after = code.slice(match.index + match[0].length).trimStart();
    const called = after.startsWith('(');
    const known = uses.get(match[0]);
    uses.set(match[0], { called: called || (known?.called ?? false) });
  }
  return uses;
}

export function parseModule(source: string): Module {
  const lines = source.split('\n');
  const imports: Import[] = [];
  let start = 0;
  for (const [index, raw] of lines.entries()) {
    const text = raw.trim();
    const isHead =
      text === '' || (text.startsWith('//') && !text.startsWith('///'));
    if (text.startsWith('import ')) {
      imports.push(parseImport(text, index + 1));
    } else if (!isHead) {
      break;
    }
    start = index + 1;
  }
  const body = lines.slice(start).join('\n').trim();
  const code = withoutComments(body);
  const declares = new Set<string>();
  for (const line of code.split('\n')) {
    const name = DECLARATION.exec(line)?.[1] ?? PRIVATE.exec(line)?.[1];
    if (name !== undefined) declares.add(name);
  }
  const bound = boundNames(code);
  const uses = usedNames(code);
  for (const [name, { called }] of uses) {
    if (declares.has(name) || (bound.has(name) && !called)) uses.delete(name);
  }
  return { imports, shipped: body, declares, uses };
}

/** The names `listing` declares at module scope, for a piece written in TS. */
export const declaredIn = (listing: string): ReadonlySet<string> =>
  parseModule(listing).declares;
