/**
 * The board's tooling. The repo holds the truth, a YAML file per board and one
 * per zone in the directory of the same name beside it, with the images
 * (`lib/board-files.ts` says which item lives where); the published artifact
 * adds live edits in its `db`, which `sync` folds back into those files.
 *
 *   board build <board.yaml> [<out>]           page into <out> (default tmp/board/<name>)
 *   board sync <board.yaml> <rows> [<assets>]  db rows → the board's files
 *   board refile <board.yaml>                  each item into the file it belongs in
 *   board snapshot <out> <png>                 the built page, fitted, as a PNG
 *
 * `build` writes `index.html` for the Artifact tool, which wraps it in a
 * document skeleton, and `local.html`, the same page already wrapped, for a
 * browser opening it from disk. `sync` reads `<rows>/items/<id>.json` as the
 * `ArtifactData` tool's `list` with `out_dir` writes them; an uploaded image's
 * row names its asset, which must already sit in `<assets>` as `<asset id>.*`
 * (the Artifact tool's `read` with `path` fetches it).
 */
import { build as esbuild } from 'esbuild';
import { execFileSync } from 'node:child_process';
import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { compileAsync } from 'sass';
import { z } from 'zod';

import { type Item, newerThan, parseDbRow } from '@/board/entities/item';

import { decodeTitle } from './lib/board-file.ts';
import {
  boardDir,
  type BoardFiles,
  decodeBoardFiles,
  writeBoardFiles,
} from './lib/board-files.ts';

import { findScreenshotChromium } from '@/kernel/scripts/lib/chromium';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

const STYLESHEET = path.join(import.meta.dirname, '../app/styles/board.scss');
/** The page's entry, bundled from `src/` so the `@/` alias resolves. */
const ENTRY = `import { startBoard } from '@/board/pages/board';\nawait startBoard();\n`;
const FONTS =
  'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Caveat:wght@500;700&family=Shantell+Sans:wght@400;600&family=Fraunces:opsz,wght@9..144,600&display=swap';

/** A directory's entries, none where it does not exist. */
const entries = async (dir: string): Promise<string[]> =>
  readdir(dir).catch((error: unknown) => {
    if (z.object({ code: z.literal('ENOENT') }).safeParse(error).success)
      return [];
    throw error;
  });

async function jsonFiles(dir: string): Promise<string[]> {
  const names = await entries(dir);
  return names.filter((name) => name.endsWith('.json')).toSorted();
}

/** The board's hand-drawn SVG icons, shipped beside the page as `icons/<name>.svg`. */
const ICONS = 'icons';

const isZoneFile = (name: string): boolean => name.endsWith('.yaml');

/** The board's own file, then its zones' in name order. */
async function readBoardFiles(board: string): Promise<BoardFiles> {
  const zones = (await entries(boardDir(board)))
    .filter((name) => isZoneFile(name))
    .toSorted()
    .map((name) => path.join(boardDir(board), name));
  const paths = [board, ...zones];
  const texts = await Promise.all(
    paths.map(async (file) => readFile(file, 'utf8')),
  );
  return new Map(paths.map((file, at) => [file, texts[at] ?? '']));
}

const readItems = async (board: string): Promise<Item[]> =>
  decodeBoardFiles(board, await readBoardFiles(board));

/** Image files sit beside the zone files; `icons/` is a directory of its own. */
const imagesOf = async (board: string): Promise<string[]> =>
  (await entries(boardDir(board))).filter(
    (name) => !isZoneFile(name) && name !== ICONS,
  );

const iconsOf = async (board: string): Promise<string[]> =>
  entries(path.join(boardDir(board), ICONS));

/** `</` inside inline script or JSON would close its tag early. */
const inline = (text: string): string => text.replaceAll('</', String.raw`<\/`);

async function bundle(): Promise<string> {
  const result = await esbuild({
    stdin: {
      contents: ENTRY,
      resolveDir: REPO_ROOT,
      loader: 'ts',
      sourcefile: 'board-entry.ts',
    },
    tsconfig: path.join(REPO_ROOT, 'tsconfig.json'),
    bundle: true,
    write: false,
    format: 'esm',
    target: 'es2022',
    minify: true,
    logLevel: 'warning',
  });
  const [script] = result.outputFiles;
  if (script === undefined) throw new Error('esbuild produced no output');
  return script.text;
}

const TOOLBAR = `
<div id="toolbar">
  <div class="group">
    <button id="tool-fit" type="button" title="Show everything">Fit</button>
    <button id="tool-out" type="button" title="Zoom out">−</button>
    <button id="tool-in" type="button" title="Zoom in">+</button>
  </div>
  <div class="group edit-only">
    <button id="tool-sticky" type="button" title="Add a sticky (or double-click the board)">Sticky</button>
    <button id="tool-text" type="button" title="Add a heading">Text</button>
    <button id="tool-zone" type="button" title="Add a zone">Zone</button>
    <button id="tool-line" type="button" title="Join two items: click one, then the other">Line</button>
    <button id="tool-image" type="button" title="Add an image (or paste one)">Image</button>
    <button id="tool-delete" type="button" title="Delete the selected item">Delete</button>
  </div>
  <div id="colors" class="group edit-only" hidden></div>
  <span id="status" role="status"></span>
  <input id="image-file" type="file" accept="image/*" hidden>
</div>`;

/** Text safe inside an element; the title is the only author text the page writes outside its JSON. */
const escaped = (text: string): string =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');

function page(
  title: string,
  items: readonly Item[],
  script: string,
  css: string,
): string {
  return `<title>${escaped(title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>${css}</style>
<div id="stage">
  <div id="camera">
    <svg id="lines" aria-hidden="true"></svg>
    <div id="world"></div>
  </div>
</div>
${TOOLBAR}
<script type="application/json" id="board-data">${inline(JSON.stringify(items))}</script>
<script type="module">${inline(script)}</script>
`;
}

/**
 * The page script's ceiling, items and styles left out so a board may grow.
 * One named `import { z }` reaching the page bundles every zod locale (see the
 * item model), and nothing else would notice.
 */
const SCRIPT_BUDGET_KB = 120;

const wrapped = (body: string): string =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>${body}</body></html>\n`;

async function buildBoard(board: string, out: string): Promise<void> {
  const [title, items, script, css] = await Promise.all([
    readFile(board, 'utf8').then((text) => decodeTitle(text)),
    readItems(board),
    bundle(),
    compileAsync(STYLESHEET, { style: 'compressed' }).then(
      (sheet) => sheet.css,
    ),
  ]);
  const kb = Math.round(Buffer.byteLength(script) / 1024);
  if (kb > SCRIPT_BUDGET_KB)
    throw new Error(
      `the page's script is ${kb} KB, over its ${SCRIPT_BUDGET_KB} KB budget: look for a dependency the bundle took whole`,
    );
  const html = page(title, items, script, css);
  await mkdir(path.join(out, 'images'), { recursive: true });
  await writeFile(path.join(out, 'index.html'), html);
  await writeFile(path.join(out, 'local.html'), wrapped(html));
  const images = await imagesOf(board);
  await Promise.all(
    images.map(async (name) =>
      copyFile(
        path.join(boardDir(board), name),
        path.join(out, 'images', name),
      ),
    ),
  );
  const icons = await iconsOf(board);
  if (icons.length > 0) await mkdir(path.join(out, ICONS), { recursive: true });
  await Promise.all(
    icons.map(async (name) =>
      copyFile(
        path.join(boardDir(board), ICONS, name),
        path.join(out, ICONS, name),
      ),
    ),
  );
  process.stdout.write(
    `wrote ${path.relative(REPO_ROOT, out)}/index.html (${items.length} items, ${Math.round(html.length / 1024)} KB, ${images.length} images, ${icons.length} icons)\n`,
  );
}

const BLOB = /^\/_blob\/([\da-f]{32})$/;

/** An uploaded image's row, pointed at its copy among the board's images. */
async function localiseImage(
  item: Item,
  board: string,
  assets: string | undefined,
): Promise<Item> {
  if (item.kind !== 'image') return item;
  const asset = BLOB.exec(item.src)?.[1];
  if (asset === undefined) return item;
  const found =
    assets === undefined
      ? undefined
      : (await readdir(assets)).find((name) => name.startsWith(`${asset}.`));
  if (found === undefined || assets === undefined)
    throw new Error(
      `image ${item.id} is asset ${asset}: fetch it into <assets> as ${asset}.<ext> first`,
    );
  await mkdir(boardDir(board), { recursive: true });
  await copyFile(path.join(assets, found), path.join(boardDir(board), found));
  return { ...item, src: `images/${found}` };
}

/** A row file as the `ArtifactData` tool writes it: the body, or the body under `data`. */
const RowFile = z.union([
  z
    .object({ data: z.record(z.string(), z.unknown()) })
    .transform((row) => row.data),
  z.record(z.string(), z.unknown()),
]);

/**
 * Each file `writeBoardFiles` changed, formatted as the repo's prettier config
 * says. Every text is formatted and every directory made before the first
 * write, so a failure leaves no file half-split.
 */
async function writeBack(written: BoardFiles): Promise<void> {
  const formatted = await Promise.all(
    [...written].map(async ([file, text]) => {
      const options = { ...(await resolveConfig(file)), filepath: file };
      await mkdir(path.dirname(file), { recursive: true });
      return [file, await format(text, options)] as const;
    }),
  );
  await Promise.all(
    formatted.map(async ([file, text]) => writeFile(file, text, 'utf8')),
  );
}

/** Every item re-derived into its file; how the board is first split, and kept so. */
async function refile(board: string): Promise<void> {
  const files = await readBoardFiles(board);
  const written = writeBoardFiles(board, files, []);
  await writeBack(written);
  process.stdout.write(
    `${written.size} files rewritten: ${[...written.keys()].map((file) => path.relative(REPO_ROOT, file)).join(', ') || 'none'}\n`,
  );
}

async function sync(
  board: string,
  rowsDir: string,
  assets: string | undefined,
): Promise<void> {
  const dir = path.join(rowsDir, 'items');
  const rows = await Promise.all(
    (await jsonFiles(dir)).map(async (file) =>
      parseDbRow(
        path.basename(file, '.json'),
        RowFile.parse(JSON.parse(await readFile(path.join(dir, file), 'utf8'))),
      ),
    ),
  );
  const files = await readBoardFiles(board);
  const changed = newerThan(decodeBoardFiles(board, files), rows);
  const localised = await Promise.all(
    changed.map(async (item) => localiseImage(item, board, assets)),
  );
  await writeBack(writeBoardFiles(board, files, localised));
  process.stdout.write(
    `${rows.length} rows, ${changed.length} newer than the repo: ${changed.map((item) => item.id).join(', ') || 'none'}\n`,
  );
}

/** The page fitted to every item, with no toolbar (`#snapshot`), at 2× for a crisp case-study image. */
function snapshot(out: string, png: string): void {
  const url = pathToFileURL(path.resolve(out, 'local.html'));
  url.hash = 'snapshot';
  execFileSync(findScreenshotChromium(), [
    '--headless',
    '--no-sandbox',
    '--hide-scrollbars',
    '--force-device-scale-factor=2',
    '--window-size=1600,1000',
    '--virtual-time-budget=10000',
    `--screenshot=${png}`,
    url.href,
  ]);
  process.stdout.write(`wrote ${png}\n`);
}

const [command, first, second, third] = process.argv.slice(2);
const at = (arg: string | undefined, what: string): string => {
  if (arg === undefined)
    throw new Error(`missing ${what}; see the usage atop board.ts`);
  return path.resolve(arg);
};

switch (command ?? '') {
  case 'build': {
    const board = at(first, '<board>');
    await buildBoard(
      board,
      second === undefined
        ? path.join(REPO_ROOT, 'tmp/board', path.basename(board, '.yaml'))
        : path.resolve(second),
    );
    break;
  }
  case 'sync': {
    await sync(
      at(first, '<board>'),
      at(second, '<rows>'),
      third === undefined ? undefined : path.resolve(third),
    );
    break;
  }
  case 'refile': {
    await refile(at(first, '<board>'));
    break;
  }
  case 'snapshot': {
    snapshot(at(first, '<out>'), at(second, '<png>'));
    break;
  }
  default: {
    throw new Error(
      `unknown command ${String(command)}; see the usage atop board.ts`,
    );
  }
}
