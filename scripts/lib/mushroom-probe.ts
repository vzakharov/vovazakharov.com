/**
 * What `play-mushrooms.ts` installs in the page it plays, and the schemas its
 * answers are parsed with. The page-side sources are strings evaluated there,
 * so they reach into the scene's own fields, and a rename in the scene breaks
 * them only at play time. Bare Node runs the caller, so this file stays free of
 * syntax the type stripper cannot erase.
 */

import { z } from 'zod';

/** Swaps `Math.random` for a mulberry32 seeded with `seed` before the page's own code runs. */
export function seededRandom(seed: number): string {
  return `(() => {
  let state = ${String(seed)} >>> 0;
  Math.random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();`;
}

/** Page-side helpers, installed as `window.__probe` once the game is up. */
export const PROBE = `(() => {
  const scene = window.__game.scene.scenes[0];
  const centre = ({ x, y }) => ({ x, y });
  window.__probe = {
    scene,
    state: () => ({
      picking: scene.meadow.picking,
      selected: scene.meadow.selected ?? null,
      mushrooms: scene.meadow.mushrooms.map(({ id }) => id),
      muted: scene.voice.muted,
      clock: scene.clock,
    }),
    controls: () => ({
      plus: centre(scene.layout.plus),
      minus: centre(scene.layout.minus),
      mute: centre(scene.layout.mute),
      picker: scene.layout.picker.map(centre),
    }),
    /** The middle of a mushroom's cap as its hit area has it, on screen. */
    mushroom: (id) => {
      const shown = scene.bed.shown.get(id);
      const points = shown.hit.cap;
      const x = points.reduce((sum, point) => sum + point.x, 0) / points.length;
      const y = points.reduce((sum, point) => sum + point.y, 0) / points.length;
      return shown.graphics.getWorldTransformMatrix().transformPoint(x, y, {});
    },
    /** The nearest shown flower's head, the one least likely to be covered. */
    flower: () => {
      const shown = [...scene.shownFlowers.entries()]
        .filter(([, flower]) => flower.container.visible)
        .sort(([, a], [, b]) => b.container.depth - a.container.depth)[0];
      if (!shown) return null;
      const [id, flower] = shown;
      const at = flower.head.getWorldTransformMatrix();
      return { id, x: at.tx, y: at.ty };
    },
    /** When a flower was last tapped, \`null\` if never: JSON has no -Infinity. */
    flowerTappedAt: (id) => {
      const { tappedAt } = scene.shownFlowers.get(id);
      return Number.isFinite(tappedAt) ? tappedAt : null;
    },
    /** When \`−\` last shook its head, \`null\` if never. */
    minusRefusedAt: () => {
      const { refusedAt } = scene.controls.minus;
      return Number.isFinite(refusedAt) ? refusedAt : null;
    },
  };
})()`;

export const State = z.object({
  picking: z.boolean(),
  selected: z.string().nullable(),
  mushrooms: z.array(z.string()),
  muted: z.boolean(),
  clock: z.number(),
});
export const Point = z.object({ x: z.number(), y: z.number() });
export const Controls = z.object({
  plus: Point,
  minus: Point,
  mute: Point,
  picker: z.array(Point),
});
export const Flower = Point.extend({ id: z.string() }).nullable();
