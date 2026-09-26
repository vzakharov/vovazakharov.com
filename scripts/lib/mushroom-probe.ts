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
  const finite = (at) => (Number.isFinite(at) ? at : null);
  /** The middle of \`points\`, in \`graphics\`' frame, on screen. */
  const onScreen = (graphics, points) => {
    const x = points.reduce((sum, point) => sum + point.x, 0) / points.length;
    const y = points.reduce((sum, point) => sum + point.y, 0) / points.length;
    return graphics.getWorldTransformMatrix().transformPoint(x, y, {});
  };
  window.__probe = {
    scene,
    state: () => ({
      picking: scene.meadow.picking,
      furnishing: scene.meadow.furnishing,
      houses: scene.meadow.mushrooms.map(({ house }) => ({
        windows: [...house.windows],
        door: house.door,
      })),
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
      house: centre(scene.layout.house),
      housePicker: scene.layout.housePicker.map(centre),
    }),
    /** The middle of a mushroom's cap as its hit area has it, on screen. */
    mushroom: (id) => {
      const shown = scene.bed.shown.get(id);
      return onScreen(shown.graphics, shown.hit.cap);
    },
    /** The middle of a mushroom's door as its hit area has it, on screen. */
    door: (id) => {
      const { house } = scene.bed.shown.get(id);
      return onScreen(house.graphics, house.hit);
    },
    /** A mushroom's mouse: when a tap on its door called it, and how far out it is. */
    mouse: (id) => {
      const { house } = scene.bed.shown.get(id);
      return { tappedAt: finite(house.mouse.tappedAt), out: house.out(scene.clock) };
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
    minusRefusedAt: () => finite(scene.controls.minus.refusedAt),
    /** When the house, or the house picker's \`index\`th button, last shook its head. */
    houseRefusedAt: () => finite(scene.controls.house.refusedAt),
    furnishRefusedAt: (index) =>
      finite(scene.controls.housePicker.buttons[index].refusedAt),
  };
})()`;

export const State = z.object({
  picking: z.boolean(),
  furnishing: z.boolean(),
  /** One per mushroom, in the meadow's order. */
  houses: z.array(z.object({ windows: z.array(z.string()), door: z.boolean() })),
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
  house: Point,
  housePicker: z.array(Point),
});
export const Mouse = z.object({
  tappedAt: z.number().nullable(),
  out: z.number(),
});
export const Flower = Point.extend({ id: z.string() }).nullable();

/** The page `play-mushrooms.ts` drives, a frame and a tap at a time. */
export type Page = {
  evaluate: <Parsed>(
    expression: string,
    schema: z.ZodType<Parsed>,
  ) => Promise<Parsed>;
  step: (frames: number) => Promise<void>;
  tap: (point: z.infer<typeof Point>) => Promise<void>;
  shoot: (step: string) => Promise<void>;
};
