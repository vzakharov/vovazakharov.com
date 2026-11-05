// node shoot.mjs <model> [--steps N] [--views az,el;az,el] [--out dir] [--seq]
// Renders a model (models/<model>.mjs exporting `steps`, optional `colors`)
// to PNGs plus a crease-pattern SVG. --seq renders every intermediate step
// from one view as a contact sheet.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("/opt/node-tools/node_modules/playwright");
import { run, snapshot } from "./engine.mjs";

const args = process.argv.slice(2);
const name = args[0];
const opt = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const flag = (k) => args.includes(k);
const mod = await import(`./models/${name}.mjs?${Date.now()}`);
const steps = mod.steps;
const upTo = Number(opt("--steps", steps.length));
const outDir = opt("--out", `out/${name}`);
fs.mkdirSync(outDir, { recursive: true });
const views = opt("--views", "-35,35;20,60;180,25;0,90")
  .split(";")
  .map((s) => s.split(",").map(Number))
  .map(([az, el, zoom]) => ({ az, el, zoom }));

const root = path.resolve(".");
const server = http
  .createServer((req, res) => {
    const f = path.join(root, decodeURIComponent(req.url.split("?")[0]));
    if (!f.startsWith(root) || !fs.existsSync(f)) return res.writeHead(404).end();
    const type = f.endsWith(".js") ? "text/javascript" : f.endsWith(".html") ? "text/html" : "application/octet-stream";
    res.writeHead(200, { "content-type": type }).end(fs.readFileSync(f));
  })
  .listen(0);
const port = server.address().port;

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
page.on("console", (m) => m.type() === "error" && console.error("page:", m.text()));
page.on("pageerror", (e) => console.error("pageerror:", e.message));
await page.goto(`http://localhost:${port}/render.html`);
await page.waitForFunction(() => window.ready);

const cpSvg = (snap) => {
  const s = 400, pad = 10;
  const P = ([u, v]) => `${pad + u * s},${pad + (1 - v) * s}`;
  const color = { V: "#2b6cdf", M: "#d6332b", F: "#bbb" };
  const dash = { V: "6 4", M: "10 3 2 3", F: "2 3" };
  const lines = snap.creases
    .map(({ seg: [a, b], assignment }) =>
      `<line x1="${P(a).split(",")[0]}" y1="${P(a).split(",")[1]}" x2="${P(b).split(",")[0]}" y2="${P(b).split(",")[1]}" stroke="${color[assignment]}" stroke-width="1.6" stroke-dasharray="${dash[assignment]}"/>`)
    .join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s + 2 * pad}" height="${s + 2 * pad}"><rect width="100%" height="100%" fill="#fff"/><rect x="${pad}" y="${pad}" width="${s}" height="${s}" fill="none" stroke="#222" stroke-width="1.5"/>${lines}</svg>`;
};

const display = (snap) =>
  mod.display ? { ...snap, pieces: snap.pieces.map((p) => ({ ...p, world: p.world.map(mod.display) })) } : snap;

const shot = async (snapIn, view, file) => {
  const snap = display(snapIn);
  await page.evaluate((a) => window.show(a), { model: snap, view, colors: mod.colors });
  await page.screenshot({ path: file });
};

if (flag("--seq")) {
  const v = views[0];
  for (let k = 1; k <= upTo; k++) {
    const snap = snapshot(run(steps, k));
    await shot(snap, v, `${outDir}/step-${String(k).padStart(2, "0")}.png`);
  }
} else {
  const st = run(steps, upTo);
  const snap = snapshot(st);
  fs.writeFileSync(`${outDir}/model.json`, JSON.stringify(snap));
  fs.writeFileSync(`${outDir}/cp.svg`, cpSvg(snap));
  for (const [i, v] of views.entries()) await shot(snap, v, `${outDir}/view-${i}.png`);
  console.log(`${snap.pieces.length} pieces, max layer ${Math.max(...snap.pieces.map((p) => p.layer))}`);
}
await browser.close();
server.close();
