/**
 * What `play-mushrooms.ts` installs in the page it plays, and the schemas its
 * answers are parsed with. The page-side sources are strings evaluated there,
 * so they reach into the scene's own fields, and a rename in the scene breaks
 * them only at play time. The answers' schemas derive from the model's own
 * arrays, so the caller runs under tsx, which resolves the model's imports.
 */

import { z } from 'zod';

import {
  type Perch as ModelPerch,
  type PerchKind,
  SIDES,
} from '../../src/pages/mushrooms/model/flight.ts';
import { INSECT_KINDS } from '../../src/pages/mushrooms/model/insect-genes.ts';
import { MUSHROOM_SPECIES } from '../../src/pages/mushrooms/model/mushroom-genes.ts';

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
  /**
   * A world point where the screen shows it now, and back, through the
   * scene's crop: what stands on the ground is placed in the world, and a
   * finger lands on the screen.
   */
  const toScreen = ({ x, y }) => scene.crop.toScreen({ x, y });
  const toWorld = ({ x, y }) => scene.crop.toWorld({ x, y });
  /** The middle of \`points\`, in \`graphics\`' frame, on screen. */
  const onScreen = (graphics, points) => {
    const x = points.reduce((sum, point) => sum + point.x, 0) / points.length;
    const y = points.reduce((sum, point) => sum + point.y, 0) / points.length;
    return toScreen(graphics.getWorldTransformMatrix().transformPoint(x, y, {}));
  };
  /**
   * What a tap at a point on screen reaches, by the scene's own hit test and
   * its topmost-only rule, the top insect handing it to the one whose body is
   * nearest (\`reached\`): \`insect:<id>\`, \`door:<id>\`, \`mushroom:<id>\`,
   * \`other\`, or \`null\` for the bare meadow. With \`drawn\` set, the tap
   * stays with the insect drawn on top.
   */
  const topAt = ({ x, y, drawn = false }) => {
    const pointer = { x: scene.scale.transformX(x), y: scene.scale.transformY(y) };
    const [top] = scene.input.sortGameObjects(
      [...scene.input.hitTestPointer(pointer)],
      pointer,
    );
    if (!top) return null;
    for (const [id, shown] of scene.insects.shown) {
      if (top !== shown.container) continue;
      return 'insect:' + (drawn ? id : (scene.insects.reached(toWorld({ x, y })) ?? id));
    }
    for (const [id, shown] of scene.bed.shown) {
      if (top === shown.house.graphics) return 'door:' + id;
      if (top === shown.graphics) return 'mushroom:' + id;
    }
    return 'other';
  };
  /**
   * Of a grid over \`points\`' box, in \`graphics\`' frame, the point on
   * screen nearest their middle whose tap reaches one of \`labels\`
   * (\`topAt\`): where the thing shows, however much of it stands behind
   * something else. \`null\` where none does.
   */
  const reaching = (graphics, points, labels) => {
    const middle = onScreen(graphics, points);
    const xs = points.map(({ x }) => x);
    const ys = points.map(({ y }) => y);
    const [left, right] = [Math.min(...xs), Math.max(...xs)];
    const [top, bottom] = [Math.min(...ys), Math.max(...ys)];
    const matrix = graphics.getWorldTransformMatrix();
    const grid = [];
    for (let i = 0; i <= 16; i++) {
      for (let j = 0; j <= 16; j++) {
        grid.push(
          toScreen(
            matrix.transformPoint(
              left + ((right - left) * i) / 16,
              top + ((bottom - top) * j) / 16,
              {},
            ),
          ),
        );
      }
    }
    const away = ({ x, y }) => Math.hypot(x - middle.x, y - middle.y);
    const [nearest] = grid
      .filter((point) => labels.includes(topAt(point)))
      .sort((a, b) => away(a) - away(b));
    return nearest ?? null;
  };
  window.__probe = {
    scene,
    toScreen,
    toWorld,
    /** The crop's left edge, in world px, and the world's and the screen's widths. */
    crop: () => ({
      left: scene.crop.left(),
      world: scene.layout.camera.world,
      width: scene.layout.camera.width,
      unit: scene.layout.camera.unit,
    }),
    state: () => ({
      picking: scene.meadow.picking,
      furnishing: scene.meadow.furnishing,
      houses: scene.meadow.mushrooms.map(({ house }) => ({
        windows: [...house.windows],
        door: house.door,
      })),
      selected: scene.meadow.selected ?? null,
      mushrooms: scene.meadow.mushrooms.map(({ id }) => id),
      species: scene.meadow.mushrooms.map(({ species }) => species),
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
      releases: {
        butterfly: centre(scene.layout.releases.butterfly),
        fly: centre(scene.layout.releases.fly),
        bee: centre(scene.layout.releases.bee),
      },
    }),
    /** The meadow's insects, oldest first, each with its current leg and whether the crop shows it. */
    insects: () =>
      scene.meadow.insects.map(({ id, kind, legs, leg }) => {
        const shown = scene.insects.shown.get(id);
        return {
          id,
          kind,
          legs,
          ...leg,
          inSight: shown !== undefined && scene.crop.shows(shown.container.x),
        };
      }),
    /**
     * An insect on screen: where it is drawn, where its perch stood last
     * frame, and when it was last tapped; \`null\` once it is gone.
     */
    insect: (id) => {
      const shown = scene.insects.shown.get(id);
      if (!shown) return null;
      return {
        ...toScreen(shown.container),
        at: toScreen(shown.at),
        end: shown.end ? toScreen(shown.end) : null,
        span: shown.span * shown.container.scaleX,
        tappedAt: finite(shown.tappedAt),
      };
    },
    /** The middle of a mushroom's cap as its hit area has it, on screen, whatever stands over it. */
    capMiddle: (id) => {
      const shown = scene.bed.shown.get(id);
      return onScreen(shown.graphics, shown.hit.cap);
    },
    /** A mushroom's box on screen round its cap, gills and stem as its hit area has them. */
    bounds: (id) => {
      const { graphics, hit } = scene.bed.shown.get(id);
      const matrix = graphics.getWorldTransformMatrix();
      const points = [...hit.cap, ...hit.gills, ...hit.stem].map(({ x, y }) =>
        toScreen(matrix.transformPoint(x, y, {})),
      );
      const xs = points.map(({ x }) => x);
      const ys = points.map(({ y }) => y);
      const [x, y] = [Math.min(...xs), Math.min(...ys)];
      return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
    },
    /**
     * Where a tap selects a mushroom, as near its cap's middle as its cap
     * shows (\`reaching\`). With \`through\` set, where no tap reaches the
     * cap itself, where one reaches an insect perched on it, which passes
     * the tap on to the cap (\`tapInsect\`): a butterfly can cover a small
     * cap whole.
     */
    mushroom: (id, through = false) => {
      const shown = scene.bed.shown.get(id);
      const own = reaching(shown.graphics, shown.hit.cap, ['mushroom:' + id]);
      if (own !== null || !through) return own;
      const perched = scene.meadow.insects
        .filter(({ leg }) => leg.to.kind === 'cap' && leg.to.id === id)
        .map((insect) => 'insect:' + insect.id);
      return reaching(shown.graphics, shown.hit.cap, perched);
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
    /** The nearest shown flower's head on screen, the one least likely to be covered. */
    flower: () => {
      const shown = [...scene.flowers.shown.entries()]
        .filter(([, flower]) => flower.container.visible)
        .map(([id, flower]) => {
          const at = flower.head.getWorldTransformMatrix();
          return { id, depth: flower.container.depth, x: at.tx, y: at.ty };
        })
        .filter(({ x }) => scene.crop.shows(x))
        .sort((a, b) => b.depth - a.depth)[0];
      if (!shown) return null;
      const { id, x, y } = shown;
      return { id, ...toScreen({ x, y }) };
    },
    /** When a flower was last tapped, \`null\` if never: JSON has no -Infinity. */
    flowerTappedAt: (id) => {
      const { tappedAt } = scene.flowers.shown.get(id);
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
  /** Each mushroom's species, in the meadow's order. */
  species: z.array(z.enum(MUSHROOM_SPECIES)),
  muted: z.boolean(),
  clock: z.number(),
});
export const Point = z.object({ x: z.number(), y: z.number() });
/** A box on screen, in CSS px. */
export const Box = Point.extend({ width: z.number(), height: z.number() });
/** One schema per kind of perch, each parsing to the model's perch of that kind. */
const PERCHES = {
  flower: z.object({ kind: z.literal('flower'), id: z.string() }),
  cap: z.object({ kind: z.literal('cap'), id: z.string() }),
  air: z.object({ kind: z.literal('air'), id: z.string() }),
  away: z.object({ kind: z.literal('away'), side: z.enum(SIDES) }),
} satisfies {
  [Kind in PerchKind]: z.ZodType<Extract<ModelPerch, { kind: Kind }>>;
};
const Perch = z.discriminatedUnion('kind', [
  PERCHES.flower,
  PERCHES.cap,
  PERCHES.air,
  PERCHES.away,
]);
export const Insects = z.array(
  z.object({
    id: z.string(),
    kind: z.enum(INSECT_KINDS),
    legs: z.number(),
    from: Perch,
    to: Perch,
    departs: z.number(),
    arrives: z.number(),
    leaves: z.number(),
    /** Whether the crop shows it, where a finger can reach it. */
    inSight: z.boolean(),
  }),
);
export const ShownInsect = Point.extend({
  at: Point,
  end: Point.nullable(),
  /** How far its open wings span as drawn this frame, in CSS px. */
  span: z.number(),
  tappedAt: z.number().nullable(),
}).nullable();
export const Controls = z.object({
  plus: Point,
  minus: Point,
  mute: Point,
  picker: z.array(Point),
  house: Point,
  housePicker: z.array(Point),
  releases: z.record(z.enum(INSECT_KINDS), Point),
});
/** `__probe.crop()`: the crop's left edge and the widths it is taken across, in CSS px, and the clump's size. */
export const Crop = z.object({
  left: z.number(),
  world: z.number(),
  width: z.number(),
  unit: z.number(),
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
  /**
   * `frames` frames stepped and none drawn, `expression` read after each and
   * parsed by `schema`: how something moves frame by frame.
   */
  trace: <Parsed>(
    frames: number,
    expression: string,
    schema: z.ZodType<Parsed>,
  ) => Promise<Parsed[]>;
  /** The JS time of every frame `step` has drawn, in ms. */
  rendered: readonly number[];
  tap: (point: z.infer<typeof Point>) => Promise<void>;
  /**
   * One finger pressed at `from`, moved to `to` over `frames` frames, one
   * move a frame, and lifted: a pan, or a tap where it moves less than the
   * slop. Every touch carries the frames' clock, as a real finger's does.
   */
  drag: (
    from: z.infer<typeof Point>,
    to: z.infer<typeof Point>,
    frames: number,
  ) => Promise<void>;
  /**
   * A key going down or up, by its DOM `key`, as `ArrowLeft`; a `repeat` is
   * the browser's own repeat of a held key's press.
   */
  key: (
    key: 'ArrowLeft' | 'ArrowRight',
    type: 'keyDown' | 'keyUp',
    repeat?: boolean,
  ) => Promise<void>;
  /** The screen turned: its width and height swapped. */
  turn: () => Promise<void>;
  /** A frame of the whole screen, or of `clip` alone. */
  shoot: (step: string, clip?: z.infer<typeof Box>) => Promise<void>;
};

export type Expect = (holds: boolean, message: string) => void;

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
