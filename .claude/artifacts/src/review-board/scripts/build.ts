import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { boardTitle } from "#src/review-board/shared/review-data/index.ts";
import { collect, writeImages } from "./collect.ts";
import { IMAGE_DIR, oversizeImages } from "./images.ts";
import { renderPage } from "./page.ts";
import { scss } from "./scss.ts";

const MB = 1024 * 1024;
const MAX_PAGE_BYTES = 8 * MB;
/** What one publish may carry beside the page: 255 files and 64 MB, the page's room kept. */
const BATCH_FILES = 250;
const BATCH_BYTES = 56 * MB;
const BATCH_NAME = /^images-\d+\.json$/;
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
    plugins: [scss],
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

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const outDir = resolve(
  process.argv[2] ?? join(repoRoot, "tmp", "review-board"),
);

const [data, assets] = [collect({ cwd: process.cwd() }), await bundle()];
const page = renderPage({
  title: boardTitle(data.branch, data.pr),
  data,
  ...assets,
});

mkdirSync(outDir, { recursive: true });
const indexPath = join(outDir, "index.html");
const localPath = join(outDir, "local.html");
writeFileSync(indexPath, page.fragment);
writeFileSync(localPath, page.document);
// A previous build's images and batches would otherwise ride this publish.
rmSync(join(outDir, IMAGE_DIR), { recursive: true, force: true });
for (const name of readdirSync(outDir)) {
  if (BATCH_NAME.test(name)) rmSync(join(outDir, name));
}
writeImages(process.cwd(), data.images, outDir);

const imageSizes = new Map(
  data.files.flatMap((file) => {
    const head = file.revisions.at(-1);
    return head?.blob != null && head.blob in data.images
      ? [[file.path, head.size ?? 0] as const]
      : [];
  }),
);
for (const line of oversizeImages(imageSizes)) {
  console.error(line);
  process.exitCode = 1;
}

/**
 * The images in publishes the Artifact tool takes: each batch a `files` list
 * relative to `outDir`, at most `BATCH_FILES` files and `BATCH_BYTES`.
 */
const batches: { path: string }[][] = [];
let batchBytes = 0;
for (const path of [...new Set(Object.values(data.images))].toSorted()) {
  const bytes = statSync(join(outDir, path)).size;
  const last = batches.at(-1);
  if (
    last === undefined ||
    last.length >= BATCH_FILES ||
    batchBytes + bytes > BATCH_BYTES
  ) {
    batches.push([{ path }]);
    batchBytes = bytes;
  } else {
    last.push({ path });
    batchBytes += bytes;
  }
}
const batchPaths = batches.map((batch, index) => {
  const path = join(outDir, `images-${String(index + 1)}.json`);
  writeFileSync(path, `${JSON.stringify(batch)}\n`);
  return path;
});

const bytes = Buffer.byteLength(page.fragment);
const size = `${(bytes / MB).toFixed(2)} MB`;
console.log(`${indexPath}\n${localPath}\npage size: ${size}`);
console.log(
  `images: ${String(Object.keys(data.images).length)}, in ${String(batches.length)} publish batch(es)`,
);
for (const path of batchPaths) console.log(path);
if (bytes > MAX_PAGE_BYTES) {
  console.error(
    `the page is ${size}, over the ${MAX_PAGE_BYTES / MB} MB budget`,
  );
  process.exitCode = 1;
}
