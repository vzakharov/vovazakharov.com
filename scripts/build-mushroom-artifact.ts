/**
 * Builds Syama's mushroom game as one self-contained HTML page, to publish as
 * an Artifact the operator plays without installing anything. The scene is
 * bundled inline; Phaser comes from jsDelivr at the version the lockfile
 * resolves, since an Artifact may load scripts from that CDN and inlining
 * Phaser would put ~1.2 MB of engine into every republish.
 *
 * Usage: pnpm artifact:mushrooms [<out.html>]  (default tmp/mushroom-artifact/index.html)
 */
import { build, type Plugin } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

import { PALETTE } from '../src/pages/mushrooms/ui/scene/palette';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.resolve(
  ROOT,
  process.argv[2] ?? 'tmp/mushroom-artifact/index.html',
);

const { version: PHASER_VERSION } = z
  .object({ version: z.string() })
  .parse(
    JSON.parse(
      await readFile(
        path.resolve(ROOT, 'node_modules/phaser/package.json'),
        'utf8',
      ),
    ),
  );

/** `import * as Phaser from 'phaser'` reads the global the CDN script defines. */
const phaserFromGlobal: Plugin = {
  name: 'phaser-from-global',
  setup(context) {
    context.onResolve({ filter: /^phaser$/ }, () => ({
      path: 'phaser',
      namespace: 'phaser-global',
    }));
    context.onLoad({ filter: /.*/, namespace: 'phaser-global' }, () => ({
      contents: 'module.exports = globalThis.Phaser;',
      loader: 'js',
    }));
  },
};

// Phaser boots in its constructor only once the document is interactive, and
// \`startGame\` sizes the canvas straight after, so the game starts no sooner
// — as the site's page, mounting after hydration, always does.
const ENTRY = `
import { startGame } from './src/pages/mushrooms/ui/scene/start-game';
document.addEventListener('DOMContentLoaded', () => {
  const host = document.getElementById('meadow');
  if (!host) throw new Error('no #meadow host');
  startGame(host);
});
`;

const bundle = await build({
  stdin: {
    contents: ENTRY,
    resolveDir: ROOT,
    loader: 'ts',
    sourcefile: 'artifact-entry.ts',
  },
  bundle: true,
  write: false,
  format: 'iife',
  target: 'es2022',
  minify: true,
  tsconfig: path.resolve(ROOT, 'tsconfig.json'),
  define: { 'process.env.NEXT_PUBLIC_MUSHROOM_PROBE': 'undefined' },
  plugins: [phaserFromGlobal],
  logLevel: 'warning',
});
// The page behind the canvas is the game's own sky, not a second colour.
const SKY = `#${PALETTE.skyTop.toString(16).padStart(6, '0')}`;

const [script] = bundle.outputFiles;
if (!script) throw new Error('esbuild produced no output');

// `</script` inside the bundle would end the inline tag early.
const inline = script.text.replaceAll('</script', String.raw`<\/script`);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<title>Syama's Mushroom Meadow</title>
<style>
  :root { --sky: ${SKY}; }
  html, body { margin: 0; height: 100%; background: var(--sky); overflow: hidden; }
  #meadow { position: fixed; inset: 0; height: 100dvh; overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none; }
  #meadow canvas { display: block; }
</style>
</head>
<body>
<div id="meadow"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@${PHASER_VERSION}/dist/phaser.min.js"></script>
<script>${inline}</script>
</body>
</html>
`;

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, html);
process.stdout.write(
  `wrote ${OUT} (${Math.round(html.length / 1024)} KB, phaser@${PHASER_VERSION})` +
    '\n',
);
