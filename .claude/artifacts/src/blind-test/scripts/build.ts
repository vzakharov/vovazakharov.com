/**
 * Builds the blind test for one set of `blind-abc.py split` output:
 *
 *   node src/blind-test/scripts/build.ts <blind-dir> [out-dir]
 *
 * `<blind-dir>` holds `test.json` (the set's title and pieces) and a directory
 * of `mix.mp3`, `1.mp3`… per piece. The out directory gets the page to publish
 * (`index.html`), the same as a document to open off disk (`local.html`, with
 * the audio linked beside it), and `audio-<n>.json`: the `files` map of each
 * publish that carries the audio, its sources relative to the repository root.
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import {
  audioPath,
  parseBlindSet,
  variants,
} from "#src/blind-test/shared/blind-set/index.ts";
import { type AudioFile, batchFiles } from "./batches.ts";
import { renderPage } from "./page.ts";

const BATCH_NAME = /^audio-\d+\.json$/;
const entry = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "app",
  "entrypoint",
  "index.ts",
);

/** The browser bundle and its stylesheet; a `node:` import reaching the page fails here. */
async function bundle(): Promise<{ js: string; css: string }> {
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    outdir: "out",
    format: "iife",
    platform: "browser",
    target: "es2022",
    minify: true,
    legalComments: "none",
  });
  let js = "";
  let css = "";
  for (const file of result.outputFiles) {
    if (file.path.endsWith(".js")) js = file.text;
    else if (file.path.endsWith(".css")) css = file.text;
  }
  if (js === "") throw new Error("esbuild produced no script");
  return { js, css };
}

const blindArg = process.argv[2];
if (blindArg === undefined) {
  throw new Error("usage: build.ts <blind-dir> [out-dir]");
}
const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const blindDir = resolve(blindArg);
const outDir = resolve(process.argv[3] ?? join(repoRoot, "tmp", "blind-test"));

const set = parseBlindSet(
  JSON.parse(readFileSync(join(blindDir, "test.json"), "utf8")),
);
const audio: AudioFile[] = set.pieces.flatMap((piece) =>
  variants(piece).map((variant) => {
    const source = join(blindDir, piece.id, `${variant}.mp3`);
    if (!existsSync(source)) throw new Error(`${source} is missing`);
    return {
      published: audioPath(piece, variant),
      source: relative(repoRoot, source),
      bytes: statSync(source).size,
    };
  }),
);
const batches = batchFiles(audio);
const page = renderPage({ title: set.title, data: set, ...(await bundle()) });

mkdirSync(outDir, { recursive: true });
// A previous build's batches and links would otherwise ride along.
for (const name of readdirSync(outDir)) {
  if (BATCH_NAME.test(name)) rmSync(join(outDir, name));
}
rmSync(join(outDir, "audio"), { recursive: true, force: true });
mkdirSync(join(outDir, "audio"));
for (const piece of set.pieces) {
  symlinkSync(join(blindDir, piece.id), join(outDir, "audio", piece.id));
}
writeFileSync(join(outDir, "index.html"), page.fragment);
writeFileSync(join(outDir, "local.html"), page.document);
const batchPaths = batches.map((batch, index) => {
  const path = join(outDir, `audio-${String(index + 1)}.json`);
  writeFileSync(path, `${JSON.stringify(batch, null, 2)}\n`);
  return path;
});

console.log(join(outDir, "index.html"));
console.log(join(outDir, "local.html"));
console.log(
  `audio: ${String(audio.length)} files, in ${String(batches.length)} publish(es)`,
);
for (const path of batchPaths) console.log(path);
