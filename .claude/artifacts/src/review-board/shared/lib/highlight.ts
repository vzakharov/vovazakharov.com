import type { HLJSApi, Language as Grammar } from "highlight.js";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import diff from "highlight.js/lib/languages/diff";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import go from "highlight.js/lib/languages/go";
import ini from "highlight.js/lib/languages/ini";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import makefile from "highlight.js/lib/languages/makefile";
import markdown from "highlight.js/lib/languages/markdown";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import scss from "highlight.js/lib/languages/scss";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

/** WGSL, with WESL's `import` paths; highlight.js ships no grammar for either. */
function wgsl({
  C_LINE_COMMENT_MODE,
  C_BLOCK_COMMENT_MODE,
}: HLJSApi): Grammar {
  return {
    name: "WGSL",
    keywords: {
      keyword:
        "alias break case const const_assert continue continuing default diagnostic discard else enable fn for if import let loop override package requires return struct super switch var while",
      type: "array atomic bool f16 f32 i32 ptr sampler sampler_comparison u32",
      literal: "false true",
    },
    contains: [
      C_LINE_COMMENT_MODE,
      C_BLOCK_COMMENT_MODE,
      { scope: "meta", match: /@\w+/ },
      {
        scope: "type",
        match: /\b(?:vec[234][fhiu]?|mat[234]x[234][fh]?|texture_\w+)\b/,
      },
      {
        scope: "number",
        match:
          /\b(?:0[xX][\da-fA-F]+|\d+\.\d*(?:[eE][+-]?\d+)?|\d+(?:[eE][+-]?\d+)?)[fhiu]?\b|\B\.\d+(?:[eE][+-]?\d+)?[fh]?\b/,
      },
      {
        match: [/\b(?:fn|struct)/, /\s+/, /[A-Za-z_]\w*/],
        scope: { 1: "keyword", 3: "title.function" },
      },
    ],
  };
}

const LANGUAGES = {
  bash,
  css,
  diff,
  dockerfile,
  go,
  ini,
  javascript,
  json,
  makefile,
  markdown,
  python,
  rust,
  scss,
  sql,
  typescript,
  wgsl,
  xml,
  yaml,
} as const;

export type Language = keyof typeof LANGUAGES;

for (const [name, grammar] of Object.entries(LANGUAGES))
  hljs.registerLanguage(name, grammar);

const BY_EXTENSION: Readonly<Record<string, Language>> = {
  bash: "bash",
  cfg: "ini",
  cjs: "javascript",
  css: "css",
  cts: "typescript",
  diff: "diff",
  go: "go",
  htm: "xml",
  html: "xml",
  ini: "ini",
  js: "javascript",
  json: "json",
  jsonc: "json",
  jsx: "javascript",
  md: "markdown",
  mjs: "javascript",
  mts: "typescript",
  patch: "diff",
  py: "python",
  rs: "rust",
  scss: "scss",
  sh: "bash",
  sql: "sql",
  svg: "xml",
  toml: "ini",
  ts: "typescript",
  tsx: "typescript",
  wesl: "wgsl",
  wgsl: "wgsl",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  zsh: "bash",
};

const BY_NAME: Readonly<Record<string, Language>> = {
  Dockerfile: "dockerfile",
  GNUmakefile: "makefile",
  Makefile: "makefile",
};

/** The grammar a path's name implies, or null for a file shown as plain text. */
export function languageOf(path: string): Language | null {
  const name = path.slice(path.lastIndexOf("/") + 1);
  const byName = BY_NAME[name];
  if (byName !== undefined) return byName;
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return null;
  return BY_EXTENSION[name.slice(dot + 1).toLowerCase()] ?? null;
}

/** A run of text and the innermost highlight.js scope class it sits in, null outside any. */
export interface Token {
  text: string;
  scope: string | null;
}

export type HighlightedLine = readonly Token[];

const ENTITIES: Readonly<Record<string, string>> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#x27": "'",
};

// highlight.js's HTML output is only scope spans and escaped text.
const MARKUP = /<span class="([^"]*)">|<\/span>|&([^;]{1,8});|[^<&]+/y;

/** Turns highlight.js HTML into lines of tokens, carrying the open scopes across each newline. */
export function parseHighlighted(html: string): HighlightedLine[] {
  const lines: Token[][] = [[]];
  const scopes: string[] = [];
  const push = (text: string): void => {
    const parts = text.split("\n");
    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part === "") return;
      const line = lines[lines.length - 1];
      if (line === undefined) throw new Error("highlighted output lost a line");
      const scope = scopes.at(-1) ?? null;
      const last = line.at(-1);
      // Neighbouring runs of one scope merge, so each becomes one DOM node.
      if (last?.scope === scope) last.text += part;
      else line.push({ text: part, scope });
    });
  };
  MARKUP.lastIndex = 0;
  while (MARKUP.lastIndex < html.length) {
    const at = MARKUP.lastIndex;
    const match = MARKUP.exec(html);
    if (match === null)
      throw new Error(`unexpected highlighter markup at ${at}`);
    const [whole, open, entity] = match;
    if (open !== undefined) scopes.push(open);
    else if (whole === "</span>") {
      if (scopes.pop() === undefined)
        throw new Error(`unbalanced highlighter markup at ${at}`);
    } else if (entity !== undefined) {
      const char = ENTITIES[entity];
      if (char === undefined)
        throw new Error(`unknown entity &${entity}; in highlighter output`);
      push(char);
    } else push(whole);
  }
  if (scopes.length > 0) throw new Error("highlighter left a scope open");
  return lines;
}

/** The text's lines as tokens, line n at index n − 1, each line its text with the newline dropped. */
export function highlightLines(
  text: string,
  language: Language,
): HighlightedLine[] {
  const { value } = hljs.highlight(text, { language, ignoreIllegals: true });
  return parseHighlighted(value);
}
