// node inspect.mjs <model> [steps] — prints each piece in axis coordinates
// (t along the diagonal from (0,0), h perpendicular toward (1,0)).
import { run, snapshot } from "./engine.mjs";
const mod = await import(`./models/${process.argv[2]}.mjs`);
const n = Number(process.argv[3] ?? mod.steps.length);
const snap = snapshot(run(mod.steps, n));
const r = Math.SQRT1_2;
const th = ([x, y, z]) => [((x + y) * r).toFixed(3), ((x - y) * r).toFixed(3), z.toFixed(3)].join(",");
for (const p of snap.pieces.sort((a, b) => a.z - b.z))
  console.log(`#${p.id} z${p.z} L${p.layer} ${p.front ? "front" : "back "} [${p.tags}]  ${p.world.map(th).join("  ")}`);
