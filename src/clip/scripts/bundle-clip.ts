/**
 * Bundles the clip's player into one self-contained page: `index.html` with the
 * player inline, and the song beside it as `horowo.mp3`, which the page plays
 * by that relative name. Click or Space plays, the strip at the foot seeks, and
 * `?t=<seconds>` holds a still, as on the site.
 *
 *   pnpm bundle:clip                     # into tmp/clip/artifact/
 *   pnpm bundle:clip --out tmp/clip/v2   # elsewhere
 */

import { build as esbuild } from 'esbuild';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { INK_PALETTE } from '@/clip/shared/ink';

import { CLIP_TMP, songFile } from './lib/song-file';

import { flag } from '@/kernel/scripts/lib/argv';
import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

const OUT = path.resolve(
  REPO_ROOT,
  flag('out') ?? path.join(CLIP_TMP, 'artifact'),
);
const SONG = 'horowo.mp3';

/** The page's entry, bundled from `src/` so the `@/` alias resolves. */
const ENTRY = `import { mountStandalone } from '@/clip/pages/horowo-clip/index.node-safe';\nmountStandalone(${JSON.stringify(SONG)});\n`;

/** The page's whole stylesheet: the canvas over the viewport, as the site's stage module sets it. */
const STYLE = `html,body{margin:0;height:100%;overflow:hidden;background:${INK_PALETTE.ink}}canvas{position:fixed;inset:0;display:block;width:100%;height:100dvh;cursor:pointer;touch-action:none;user-select:none}`;

/** `</` inside an inline script would close its tag early. */
const inline = (text: string): string => text.replaceAll('</', String.raw`<\/`);

async function bundle(): Promise<string> {
  const result = await esbuild({
    stdin: {
      contents: ENTRY,
      resolveDir: REPO_ROOT,
      loader: 'ts',
      sourcefile: 'clip-entry.ts',
    },
    tsconfig: path.join(REPO_ROOT, 'tsconfig.json'),
    bundle: true,
    write: false,
    format: 'iife',
    target: 'es2022',
    minify: true,
    logLevel: 'warning',
  });
  const [script] = result.outputFiles;
  if (script === undefined) throw new Error('esbuild produced no output');
  return script.text;
}

const page = (script: string): string =>
  `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Хорошо!</title>
<style>${STYLE}</style>
</head>
<body>
<script>${inline(script)}</script>
</body>
</html>
`;

const [script, song] = await Promise.all([bundle(), songFile()]);
await mkdir(OUT, { recursive: true });
await Promise.all([
  writeFile(path.join(OUT, 'index.html'), page(script), 'utf8'),
  copyFile(song, path.join(OUT, SONG)),
]);
process.stdout.write(`${path.relative(REPO_ROOT, OUT)}\n`);
