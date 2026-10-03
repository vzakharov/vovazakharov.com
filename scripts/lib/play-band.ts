/**
 * Where the selected mushroom's yellow band leaves the ground showing
 * through. Every outline the band and the ground ring stroke in yellow is
 * read off their own drawing commands, and sampled just outside each point,
 * in a frame drawn with nothing in front of the band but the mushroom and its
 * house: so a sample that is not the band's yellow is a gap in it. The frame
 * is drawn again as it stood before the check hands back.
 */

import { z } from 'zod';

import { inkWidth } from '../../src/pages/mushrooms/model/mushroom-outline.ts';
import { INK_REACH } from '../../src/pages/mushrooms/ui/scene/ink.ts';
import { PALETTE } from '../../src/pages/mushrooms/ui/scene/palette.ts';
import type { Page } from './mushroom-probe-drive.ts';

/**
 * How far past its outline each point's two samples stand, in the band's
 * half-width outside it. A gap is ground at both: the near one alone may land
 * on the mushroom's own ink where the band is at its floor width, the far one
 * alone past a corner's bevelled join.
 */
const OUT = 0.6;
const FAR = 0.85;
/** How far past another outline a sample may still land on its ink, in pixels, besides the ink's own reach (`INK_REACH`): antialiasing. */
const INK_BLUR = 1;
/** How far, per channel, a drawn pixel may stray from the band's yellow. */
const TOLERANCE = 40;

const Gap = z.object({
  outline: z.string(),
  index: z.number(),
  x: z.number(),
  y: z.number(),
  rgb: z.array(z.number()),
});
const Band = z.object({
  /** Each outline's samples taken, and whether its first point's was. */
  outlines: z.array(
    z.object({ outline: z.string(), sampled: z.number(), first: z.boolean() }),
  ),
  gaps: z.array(Gap),
});
export type BandCheck = z.infer<typeof Band>;

/**
 * Page-side: the check on mushroom `id`, which must be the selected one,
 * `clear` being how far past each of its parts' outlines its ink may show.
 */
function source(
  id: string,
  [r, g, b]: readonly number[],
  clear: number,
): string {
  return `(() => {
  const scene = window.__game.scene.scenes[0];
  const { bed } = scene;
  const { outline, footRing } = bed.selection;
  const lit = bed.shown.get(${JSON.stringify(id)});
  // Graphics commands: the ids and argument counts Phaser records them with.
  const ARGS = { 1: 0, 2: 0, 4: 2, 5: 2, 6: 3, 9: 0 };
  /** The paths stroked after a graphics' last line style, the band after its ink edge, and that style's width. */
  const stroked = (graphics) => {
    const commands = graphics.commandBuffer;
    let band = { width: 0, paths: [] };
    for (let i = 0; i < commands.length; ) {
      const command = commands[i];
      if (!(command in ARGS)) throw new Error('a band drawn with command ' + command);
      const at = commands.slice(i + 1, i + 1 + ARGS[command]);
      if (command === 6) band = { width: at[0], paths: [] };
      if (command === 5) band.paths.push([{ x: at[0], y: at[1] }]);
      if (command === 4) band.paths.at(-1).push({ x: at[0], y: at[1] });
      i += 1 + ARGS[command];
    }
    return band;
  };
  const area = (points) =>
    points.reduce((sum, p, i) => {
      const q = points[(i + 1) % points.length];
      return sum + p.x * q.y - q.x * p.y;
    }, 0);
  const inside = (points, { x, y }) => {
    let odd = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const [a, b] = [points[i], points[j]];
      if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) odd = !odd;
    }
    return odd;
  };
  const toSegment = (p, a, b) => {
    const [dx, dy] = [b.x - a.x, b.y - a.y];
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
  };
  const near = (points, p) =>
    Math.min(...points.map((a, i) => toSegment(p, a, points[(i + 1) % points.length])));
  const body = lit.graphics.getWorldTransformMatrix();
  const parts = Object.values(lit.hit);
  const clear = ${String(clear)};
  const samples = [];
  const outlines = [];
  for (const [name, graphics] of [['band', outline], ['ring', footRing.band]]) {
    const { width, paths } = stroked(graphics);
    const matrix = graphics.getWorldTransformMatrix();
    const out = ${String(OUT)} * width / 2;
    const far = ${String(FAR)} * width / 2;
    paths.forEach((path, which) => {
      const points = path.filter((p, i) => i === 0 || Math.hypot(p.x - path[i - 1].x, p.y - path[i - 1].y) > 1e-6);
      if (Math.hypot(points[0].x - points.at(-1).x, points[0].y - points.at(-1).y) <= 1e-6) points.pop();
      const turn = Math.sign(area(points)) || 1;
      const outline = name + ' ' + which;
      let sampled = 0;
      let first = false;
      points.forEach((point, index) => {
        const before = points[(index - 1 + points.length) % points.length];
        const after = points[(index + 1) % points.length];
        const length = Math.hypot(after.x - before.x, after.y - before.y) || 1;
        const at = (reach) => ({
          x: point.x + (turn * (after.y - before.y) * reach) / length,
          y: point.y - (turn * (after.x - before.x) * reach) / length,
        });
        // Its own outline stands \`reach\` off by construction; any other may cover it.
        const open = (reach) => {
          const local = at(reach);
          if (near(points, local) < reach * 0.8) return null;
          const screen = matrix.transformPoint(local.x, local.y, {});
          const own = body.applyInverse(screen.x, screen.y, {});
          const covered = parts.some(
            (part) =>
              !(name === 'band' && part === parts[which]) &&
              (inside(part, own) || near(part, own) < clear),
          );
          return covered ? null : { x: screen.x, y: screen.y };
        };
        const screen = open(out);
        if (!screen) return;
        sampled += 1;
        if (index === 0) first = true;
        samples.push({ outline, index, ...screen, beyond: open(far) });
      });
      outlines.push({ outline, sampled, first });
    });
  }
  const keep = new Set([outline, ...Object.values(footRing),lit.graphics, lit.house.graphics]);
  const hidden = scene.children.list.filter(
    (object) => object.visible && object.depth > lit.shadow.depth && !keep.has(object),
  );
  // The view places each frame what it shows, visible or not (\`bed-place.ts\`),
  // so each hidden object's own \`setVisible\` is held off for the drawn frame.
  for (const object of hidden) {
    object.setVisible(false);
    object.setVisible = () => object;
  }
  window.__game.step(scene.clock * 1000, 0);
  const canvas = window.__game.canvas;
  const copy = document.createElement('canvas');
  [copy.width, copy.height] = [canvas.width, canvas.height];
  const context = copy.getContext('2d', { willReadFrequently: true });
  context.drawImage(canvas, 0, 0);
  for (const object of hidden) {
    delete object.setVisible;
    object.setVisible(true);
  }
  window.__game.step(scene.clock * 1000, 0);
  // From the world, where the scene lays things out, to the canvas's own pixels.
  const camera = scene.cameras.main.matrixCombined;
  /** The drawn pixel at world point \`x\`, \`y\`, and whether it strays from the band's yellow; null off the canvas. */
  const read = ({ x, y }) => {
    const pixel = camera.transformPoint(x, y, {});
    const [px, py] = [Math.round(pixel.x), Math.round(pixel.y)];
    if (px < 0 || py < 0 || px >= copy.width || py >= copy.height) return null;
    const rgb = [...context.getImageData(px, py, 1, 1).data.slice(0, 3)];
    const [r, g, b] = rgb;
    const off = Math.max(Math.abs(r - ${String(r)}), Math.abs(g - ${String(g)}), Math.abs(b - ${String(b)}));
    return { rgb, off: off > ${String(TOLERANCE)} };
  };
  const gaps = samples.flatMap(({ outline, index, x, y, beyond }) => {
    const nearer = read({ x, y });
    if (!nearer?.off) return [];
    const farther = beyond && read(beyond);
    return farther && !farther.off ? [] : [{ outline, index, x, y, rgb: nearer.rgb }];
  });
  return { outlines, gaps };
})()`;
}

/** The band check on the selected mushroom `id`. */
export async function bandGaps(page: Page, id: string): Promise<BandCheck> {
  const yellow = PALETTE.selection;
  const channels = [16, 8, 0].map((shift) => (yellow >> shift) & 0xff);
  const size = await page.evaluate(
    `window.__game.scene.scenes[0].bed.shown.get(${JSON.stringify(id)}).size`,
    z.number(),
  );
  const clear = INK_REACH * inkWidth(size) + INK_BLUR;
  return page.evaluate(source(id, channels, clear), Band);
}
