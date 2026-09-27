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
  /**
   * What a tap at a point on screen reaches, by the scene's own hit test and
   * its topmost-only rule: \`insect:<id>\`, \`door:<id>\`, \`mushroom:<id>\`, \`other\`, or
   * \`null\` for the bare meadow.
   */
  const topAt = ({ x, y }) => {
    const pointer = { x: scene.scale.transformX(x), y: scene.scale.transformY(y) };
    const [top] = scene.input.sortGameObjects(
      [...scene.input.hitTestPointer(pointer)],
      pointer,
    );
    if (!top) return null;
    for (const [id, shown] of scene.insects.shown) {
      if (top === shown.container) return 'insect:' + id;
    }
    for (const [id, shown] of scene.bed.shown) {
      if (top === shown.house.graphics) return 'door:' + id;
      if (top === shown.graphics) return 'mushroom:' + id;
    }
    return 'other';
  };
  /**
   * Of a grid over \`points\`' box, in \`graphics\`' frame, the point on
   * screen nearest their middle whose tap reaches \`label\` (\`topAt\`):
   * where the thing shows, however much of it stands behind something else.
   * \`null\` where none does.
   */
  const reaching = (graphics, points, label) => {
    const middle = onScreen(graphics, points);
    const xs = points.map(({ x }) => x);
    const ys = points.map(({ y }) => y);
    const [left, right] = [Math.min(...xs), Math.max(...xs)];
    const [top, bottom] = [Math.min(...ys), Math.max(...ys)];
    const matrix = graphics.getWorldTransformMatrix();
    const grid = [];
    for (let i = 0; i <= 16; i++) {
      for (let j = 0; j <= 16; j++) {
        const { x, y } = matrix.transformPoint(
          left + ((right - left) * i) / 16,
          top + ((bottom - top) * j) / 16,
          {},
        );
        grid.push({ x, y });
      }
    }
    const away = ({ x, y }) => Math.hypot(x - middle.x, y - middle.y);
    const [nearest] = grid
      .filter((point) => topAt(point) === label)
      .sort((a, b) => away(a) - away(b));
    return nearest ?? null;
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
      butterfly: centre(scene.layout.butterfly),
    }),
    /** The meadow's insects, oldest first, each with its current leg. */
    insects: () =>
      scene.meadow.insects.map(({ id, legs, leg }) => ({ id, legs, ...leg })),
    /**
     * An insect on screen: where it is drawn, where its perch stood last
     * frame, and when it was last tapped; \`null\` once it is gone.
     */
    insect: (id) => {
      const shown = scene.insects.shown.get(id);
      if (!shown) return null;
      return {
        x: shown.container.x,
        y: shown.container.y,
        at: centre(shown.at),
        end: shown.end ? centre(shown.end) : null,
        tappedAt: finite(shown.tappedAt),
      };
    },
    /** Where a tap selects a mushroom, as near its cap's middle as its cap shows (\`reaching\`). */
    mushroom: (id) => {
      const shown = scene.bed.shown.get(id);
      return reaching(shown.graphics, shown.hit.cap, 'mushroom:' + id);
    },
    /** The middle of a mushroom's door as its hit area has it, on screen: \`null\` with no door painted. */
    door: (id) => {
      const { house } = scene.bed.shown.get(id);
      return house.hit.length === 0 ? null : onScreen(house.graphics, house.hit);
    },
    topAt,
    /** A mushroom's depth: the higher, the nearer the front. */
    depth: (id) => scene.bed.shown.get(id).graphics.depth,
    /** A mushroom's height scale and its house's, \`null\` once it has sunk away. */
    pose: (id) => {
      const shown = scene.bed.shown.get(id);
      if (!shown) return null;
      return {
        mushroom: shown.graphics.scaleY,
        house: shown.house.graphics.scaleY,
        shown: shown.house.graphics.visible,
      };
    },
    /** A mushroom's mouse: when a tap on its door called it, how far out it is, and how far across its head is drawn. */
    mouse: (id) => {
      const { house } = scene.bed.shown.get(id);
      return {
        tappedAt: finite(house.mouse.tappedAt),
        out: house.out(scene.clock),
        head: house.drawnHead,
      };
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
  houses: z.array(
    z.object({ windows: z.array(z.string()), door: z.boolean() }),
  ),
  selected: z.string().nullable(),
  mushrooms: z.array(z.string()),
  muted: z.boolean(),
  clock: z.number(),
});
export const Point = z.object({ x: z.number(), y: z.number() });
const Perch = z.object({
  kind: z.enum(['flower', 'cap', 'away']),
  id: z.string().optional(),
  pick: z.number().optional(),
  side: z.string().optional(),
});
export const Insects = z.array(
  z.object({
    id: z.string(),
    legs: z.number(),
    from: Perch,
    to: Perch,
    departs: z.number(),
    arrives: z.number(),
    leaves: z.number(),
  }),
);
export const ShownInsect = Point.extend({
  at: Point,
  end: Point.nullable(),
  tappedAt: z.number().nullable(),
}).nullable();
export const Controls = z.object({
  plus: Point,
  minus: Point,
  mute: Point,
  picker: z.array(Point),
  house: Point,
  housePicker: z.array(Point),
  butterfly: Point,
});
export const Mouse = z.object({
  tappedAt: z.number().nullable(),
  out: z.number(),
  /** In CSS px, as painted at the last frame: 0 with no door. */
  head: z.number(),
});
export const Top = z.string().nullable();
export const Pose = z
  .object({ mushroom: z.number(), house: z.number(), shown: z.boolean() })
  .nullable();
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

/** Runs `each` over `items` one after another, as taps on one page must. */
export async function inTurn<Item>(
  items: readonly Item[],
  each: (item: Item) => Promise<void>,
): Promise<void> {
  const [first, ...rest] = items;
  if (first === undefined) return;
  await each(first);
  return inTurn(rest, each);
}
