/**
 * Prettier for the `.wgsl` files under `src/`: prettier-plugin-wgsl formats
 * the body, and the WESL head it cannot parse — everything through the last
 * `import …;` line — is kept as written. The shader linker cuts a file at
 * the same line.
 */

import { doc, type Parser, type Plugin, type Printer } from 'prettier';
import wgsl from 'prettier-plugin-wgsl';

const { hardline, join } = doc.builders;

type Wesl = { head: string[]; shader: string };

const LAST_IMPORT = /^import [^\n]*;$/gm;

const parse = (text: string): Wesl => {
  const ends = [...text.matchAll(LAST_IMPORT)].map(
    (found) => found.index + found[0].length,
  );
  const cut = ends.at(-1) ?? 0;
  return {
    head: cut === 0 ? [] : text.slice(0, cut).split('\n'),
    shader: text.slice(cut),
  };
};

const parser: Parser<Wesl> = {
  parse,
  astFormat: 'wesl',
  locStart: () => 0,
  locEnd: () => 0,
};

/** Prettier hands `embed` an untyped path; its node is the one `parse` made. */
const isWesl = (node: unknown): node is Wesl =>
  typeof node === 'object' &&
  node !== null &&
  'head' in node &&
  'shader' in node;

const printer: Printer<Wesl> = {
  print: () => '',
  embed: (path) => {
    const node: unknown = path.node;
    if (!isWesl(node)) return null;
    const { head, shader } = node;
    return async (textToDoc) => {
      const formatted = await textToDoc(shader, { parser: 'wgsl' });
      if (head.length === 0) return [formatted, hardline];
      return [join(hardline, head), hardline, hardline, formatted, hardline];
    };
  },
};

const { parsers: wgslParsers, printers: wgslPrinters } = wgsl;
const wgslParser = wgslParsers?.['wgsl'];
if (wgslParser === undefined) {
  throw new Error('prettier-plugin-wgsl no longer has a wgsl parser');
}

const plugin: Plugin = {
  languages: [{ name: 'WESL', parsers: ['wesl'], extensions: ['.wgsl'] }],
  parsers: { wesl: parser, wgsl: wgslParser },
  printers: { wesl: printer, ...wgslPrinters },
};

export default plugin;
