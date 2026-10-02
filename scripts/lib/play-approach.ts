/**
 * The walk into the forest, `play-mushrooms.ts`'s run on a fresh meadow: the
 * forest at its densest, grown from `+` as a child grows it until `+`
 * refuses, then again `SOW_APART` s of `↓` back, the two clusters standing
 * as close as the per-area cap lets them, one behind the other; the eye turned onto its haziest
 * back-row mushroom and walked up to it on `↑` until it is drawn `CLOSE`
 * times the size it set off at, by when its painted haze has dropped; a tap on its
 * cap where it is painted (`paintedCap`, never the scene's own hit test)
 * selects it, and one `OUTSIDE` px outside its outline, where the
 * finger pad was, does not; then the eye turned all the way round there, at
 * the closest approach. Every frame of the walk and the turn is drawn and
 * timed, and their median kept to the frame budget (`lib/frame-budget.ts`):
 * the fill rate's worst case, caps covering the screen and every mushroom
 * within sight drawn. The lawn's tending (a whole re-tend, or a sliced one's
 * gather and slices) and the perches' re-sights along them are timed too, and
 * the frames that carry one set beside those that carry none.
 */

import { z } from 'zod';

import {
  boxAround,
  containsPoint,
  distanceToEdge,
} from '../../src/pages/mushrooms/model/geometry.ts';
import { pinholeOf } from '../../src/pages/mushrooms/model/ground.ts';
import {
  MUSHROOM_SPECIES,
  mushroomGenes,
} from '../../src/pages/mushrooms/model/mushroom-genes.ts';
import {
  headOutlines,
  toCanvas,
} from '../../src/pages/mushrooms/model/mushroom-outline.ts';
import {
  capFrame,
  splayed,
} from '../../src/pages/mushrooms/model/mushroom-pose.ts';
import { TURN_CRUISE } from '../../src/pages/mushrooms/model/pan.ts';
import { placeOf } from '../../src/pages/mushrooms/ui/scene/clump-layout.ts';
import { HAZE_DRIFT } from '../../src/pages/mushrooms/ui/scene/repaint-queue.ts';
import { TAP_RADIUS } from '../../src/pages/mushrooms/ui/scene/tap-reach.ts';
import type { Sized } from '../../src/shared/typings/index.ts';
import { median, overBudget } from './frame-budget.ts';
import {
  type Arrow,
  Camera,
  type Controls,
  type Expect,
  Eye,
  Hitches,
  inTurn,
  type Page,
  Point,
  State,
} from './mushroom-probe.ts';

const FPS = 60;
/**
 * How many times the size it set off at the walked-up mushroom is drawn at
 * the least. Not its opening size: one walked up to from behind the opening
 * is drawn below the screen's foot by the time it is half as big again.
 */
const CLOSE = 1.5;
/** How far outside the walked-up mushroom's outline, in CSS px, a tap must not take it. */
const OUTSIDE = 4;
/** How long `↓` is held between the two clusters the forest is grown in, in seconds. */
const SOW_APART = 4;
/** The most `+` taps one cluster is grown by, should `+` never refuse. */
const MOST_GROWN = 30;
/** How near the screen's middle, as a share of its width, the eye is turned onto its mushroom. */
const AIMED = 0.04;
/** The most `↑` frames the walk up may take before it is called short. */
const MOST_WALK = FPS * 12;
/** Frames enough for a held key's ease to come to rest. */
const SETTLE = 120;

/** Every mushroom drawn: how many times its opening size, its painted haze, where on the screen its foot stands, and its depth. */
/** The farthest apart any two mushrooms' feet stand, in plane units. */
const SPREAD_OF = `(() => {
  const feet = __probe.scene.meadow.mushrooms.map(({ foot }) => foot);
  return Math.max(0, ...feet.flatMap((one) =>
    feet.map((other) => Math.hypot(one.x - other.x, one.y - other.y)),
  ));
})()`;

const STANDS = `[...__probe.scene.bed.shown]
  .filter(([, { graphics }]) => graphics.visible)
  .map(([id, { graphics, stands, haze }]) => ({
    id,
    zoom: stands.zoom,
    haze,
    ahead: stands.ahead,
    ...__probe.toScreen(graphics),
  }))`;
const Stands = z.array(
  Point.extend({
    id: z.string(),
    zoom: z.number(),
    haze: z.number(),
    ahead: z.number(),
  }),
);
type Stand = z.infer<typeof Stands>[number];

/**
 * Points `OUTSIDE` px out from `id`'s outline, cap, gills and stem, on
 * screen, each pushed out from the cap's middle, highest first: where the
 * finger pad round a mushroom reached and its drawn body does not.
 */
const outsides = (id: string) => `(() => {
  const { graphics, hit } = __probe.scene.bed.shown.get(${JSON.stringify(id)});
  const matrix = graphics.getWorldTransformMatrix();
  const middle = __probe.capMiddle(${JSON.stringify(id)});
  return [...hit.cap, ...hit.gills, ...hit.stem]
    .map(({ x, y }) => __probe.toScreen(matrix.transformPoint(x, y, {})))
    .map(({ x, y }) => {
      const away = Math.hypot(x - middle.x, y - middle.y) || 1;
      return {
        x: x + ((x - middle.x) / away) * ${String(OUTSIDE)},
        y: y + ((y - middle.y) / away) * ${String(OUTSIDE)},
      };
    })
    .toSorted((a, b) => a.y - b.y);
})()`;

/**
 * What the painter draws `id`'s dome from, as the page holds it: the
 * mushroom's seed, species and foot, the size it is painted at, the turn the
 * bed stood it at, and its graphics' transform onto the screen.
 */
const painting = (id: string) => `(() => {
  const id = ${JSON.stringify(id)};
  const { graphics, size, turn } = __probe.scene.bed.shown.get(id);
  const { seed, species, foot, lean } = __probe.scene.meadow.mushrooms.find(
    (mushroom) => mushroom.id === id,
  );
  const { a, b, c, d, tx, ty } = graphics.getWorldTransformMatrix();
  const { scrollX, scrollY } = __probe.scene.cameras.main;
  return {
    seed,
    species,
    foot: { x: foot.x, y: foot.y },
    lean,
    size,
    turn,
    matrix: { a, b, c, d, tx: tx - scrollX, ty: ty - scrollY },
  };
})()`;
const Painting = z.object({
  seed: z.number(),
  species: z.enum(MUSHROOM_SPECIES),
  foot: z.object({ x: z.number(), y: z.number() }),
  lean: z.union([z.literal(-1), z.literal(1)]),
  size: z.number(),
  turn: z.number(),
  matrix: z.object({
    a: z.number(),
    b: z.number(),
    c: z.number(),
    d: z.number(),
    tx: z.number(),
    ty: z.number(),
  }),
});

/** How many steps across its box the painted dome is searched for its deepest point. */
const DOME_GRID = 16;

/**
 * Where the painter fills `painted`'s dome on the screen, from the outline it
 * fills (`headOutlines` through `capFrame` and `toCanvas`, as
 * `mushroom-paint.ts` maps it) through the graphics' drawn transform: the
 * point of it farthest in from its edge, where a finger aimed at the cap
 * lands. Also the turn its genes stand at, to check against the bed's.
 */
function paintedCap(
  painted: z.infer<typeof Painting>,
  camera: z.infer<typeof Camera>,
): { at: z.infer<typeof Point>; turn: number } {
  const { splay } = placeOf(camera, painted);
  const { genes, turn } = splayed(mushroomGenes(painted), splay);
  const cap = capFrame(genes);
  const canvas = toCanvas(painted.size);
  const { a, b, c, d, tx, ty } = painted.matrix;
  const [dome] = headOutlines(genes);
  const outline = dome
    .map((point) => canvas(cap(point)))
    .map(({ x, y }) => ({ x: a * x + c * y + tx, y: b * x + d * y + ty }));
  const { left, right, top, bottom } = boxAround(outline);
  let at = outline[0] ?? { x: 0, y: 0 };
  let deepest = -Infinity;
  for (let i = 0; i <= DOME_GRID; i++) {
    for (let j = 0; j <= DOME_GRID; j++) {
      const point = {
        x: left + ((right - left) * i) / DOME_GRID,
        y: top + ((bottom - top) * j) / DOME_GRID,
      };
      if (!containsPoint(outline, point)) continue;
      const depth = distanceToEdge(outline, point);
      if (depth > deepest) [at, deepest] = [point, depth];
    }
  }
  return { at, turn };
}

export async function playApproach(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const state = async () => page.evaluate('__probe.state()', State);
  const stands = async () => page.evaluate(STANDS, Stands);
  const standOf = async (id: string) =>
    (await stands()).find((stand) => stand.id === id);
  const screen = await page.evaluate('__probe.scene.layout.camera', Camera);
  const { arc } = pinholeOf(screen);
  // A frame at a time, since `page.step(n)` draws and times only its last,
  // each with the re-tends and re-sights it ran.
  const carried: Carried[] = [];
  const stepOne = async () => {
    await page.step(1);
    const hitches = await page.evaluate('__probe.hitches()', Hitches);
    carried.push({ ...hitches, ms: page.rendered.at(-1) ?? 0 });
  };
  const stepEach = async (frames: number) =>
    inTurn([...Array.from({ length: frames }).keys()], stepOne);

  // The forest, grown from `+` and the picker's buttons in turn until `+`
  // refuses, here and again `SOW_APART` s back, so the walk up goes through
  // the near cluster into the far one.
  const sow = async (tries: number): Promise<void> => {
    if (tries === MOST_GROWN) return;
    await page.tap(controls.plus);
    await page.step(30);
    if (!(await state()).picking) return;
    const cap = controls.picker[tries % controls.picker.length];
    if (cap) await page.tap(cap);
    await page.step(90);
    return sow(tries + 1);
  };
  await sow(0);
  const first = (await state()).mushrooms.length;
  await page.key('ArrowDown', 'keyDown');
  await page.step(FPS * SOW_APART);
  await page.key('ArrowDown', 'keyUp');
  await page.step(SETTLE);
  await sow(0);
  const grown = await state();
  const spread = await page.evaluate(SPREAD_OF, z.number());
  note(
    `the forest stands ${String(grown.mushrooms.length)} mushrooms, ${String(first)} grown at the opening and the rest ${String(SOW_APART)} s of ↓ back, their feet at most ${spread.toFixed(2)} units apart`,
  );

  // Its haziest mushroom on the screen, away from the controls and not the
  // one selected, is the back row the walk goes up to.
  const onScreen = ({ x, y }: z.infer<typeof Point>) =>
    x > 0.15 * screen.width && x < 0.85 * screen.width && y < screen.height;
  const [target] = (await stands())
    .filter((stand) => onScreen(stand) && stand.id !== grown.selected)
    .toSorted((a, b) => b.haze - a.haze);
  if (target === undefined) {
    expect(
      false,
      'the grown forest has no mushroom on the screen to walk up to',
    );
    return;
  }
  await page.step(1);
  await page.shoot('final-forest');

  // Turned onto it, a held key at a time, until it stands at the middle.
  const aim = async (tries: number): Promise<Stand | undefined> => {
    const now = await standOf(target.id);
    if (!now) return undefined;
    const offset = now.x - screen.width / 2;
    if (Math.abs(offset) <= AIMED * screen.width || tries === 0) return now;
    const key: Arrow = offset > 0 ? 'ArrowRight' : 'ArrowLeft';
    const frames = Math.max(
      2,
      Math.round(((Math.abs(offset) / arc / TURN_CRUISE) * FPS) / 2),
    );
    await page.key(key, 'keyDown');
    await page.step(frames);
    await page.key(key, 'keyUp');
    await page.step(SETTLE);
    return aim(tries - 1);
  };
  const aimed = await aim(8);
  if (aimed === undefined) {
    expect(false, `turning onto ${target.id} lost it from the screen`);
    return;
  }

  // Up to it on `↑`, every frame drawn and timed.
  const timed = page.rendered.length;
  const closeAt = CLOSE * aimed.zoom;
  await page.key('ArrowUp', 'keyDown');
  const walkUp = async (frames: number): Promise<Stand | undefined> => {
    await stepOne();
    const now = await standOf(target.id);
    if (!now || now.zoom >= closeAt || frames >= MOST_WALK) return now;
    return walkUp(frames + 1);
  };
  await page.evaluate('__probe.hitches()', Hitches);
  const reached = await walkUp(0);
  await page.key('ArrowUp', 'keyUp');
  await stepEach(SETTLE);
  const close = await standOf(target.id);
  const eye = await page.evaluate('__probe.eye()', Eye);
  expect(
    close !== undefined && close.zoom >= closeAt,
    `↑ walked up to ${target.id} until it was drawn ${String(reached?.zoom.toFixed(2))} times its opening size, short of ${closeAt.toFixed(2)} (the eye at ${eye.x.toFixed(2)}, ${eye.y.toFixed(2)})`,
  );
  if (close === undefined) return;
  expect(
    target.haze - close.haze >= HAZE_DRIFT,
    `walked up to ${target.id} its painted haze went ${target.haze.toFixed(3)} → ${close.haze.toFixed(3)}, not down`,
  );
  note(
    `walked up to ${target.id}: drawn ${target.zoom.toFixed(2)} → ${close.zoom.toFixed(2)} times its opening size, ${target.ahead.toFixed(2)} → ${close.ahead.toFixed(2)} ahead, painted haze ${target.haze.toFixed(3)} → ${close.haze.toFixed(3)}`,
  );
  await page.shoot('final-near');

  // A tap just outside its outline does not take it; one on its cap does.
  const outside = (
    await page.evaluate(outsides(target.id), z.array(Point))
  ).find((point) => reachable(point, controls, screen));
  const reachedThere = async (point: z.infer<typeof Point>) =>
    page.evaluate(
      `__probe.topAt(${JSON.stringify(point)})`,
      z.string().nullable(),
    );
  const free =
    outside !== undefined &&
    [null, `mushroom:${target.id}`].includes(await reachedThere(outside));
  if (outside === undefined || !free) {
    note(
      `no point ${String(OUTSIDE)} px outside ${target.id} is clear of the rest: the outside tap is not played`,
    );
  } else {
    const before = (await state()).selected;
    await page.tap(outside);
    await page.step(2);
    const after = (await state()).selected;
    expect(
      after !== target.id || before === target.id,
      `a tap ${String(OUTSIDE)} px outside ${target.id}'s outline at (${outside.x.toFixed(0)}, ${outside.y.toFixed(0)}) selected it`,
    );
  }
  const painted = await page.evaluate(painting(target.id), Painting);
  const { at: cap, turn } = paintedCap(painted, screen);
  expect(
    Math.abs(turn - painted.turn) < 1e-9,
    `${target.id}'s genes, splayed as its foot stands it, turn ${turn.toFixed(4)}, not the ${painted.turn.toFixed(4)} the bed stood it at: the painted cap is read off the wrong outline`,
  );
  await page.tap(cap);
  await page.step(2);
  expect(
    (await state()).selected === target.id,
    `a tap on ${target.id}'s painted cap at (${cap.x.toFixed(0)}, ${cap.y.toFixed(0)}) reached ${String(await reachedThere(cap))}, not it`,
  );
  await page.step(40);
  await page.shoot('final-tap');

  // Turned all the way round there, at the closest approach.
  const half = Math.round((Math.PI / TURN_CRUISE) * FPS);
  await page.key('ArrowRight', 'keyDown');
  await stepEach(half);
  await page.shoot('final-close-turn');
  await stepEach(half + 30);
  await page.key('ArrowRight', 'keyUp');
  await stepEach(FPS);
  noteHitches(carried, note);
  const frames = page.rendered.slice(timed);
  const slow = overBudget(frames);
  expect(
    slow === undefined,
    `walking into the forest and turning there: ${String(slow)}`,
  );
  note(
    `walking into the forest and turning there: rendered-frame JS median ${median(frames).toFixed(1)} ms over ${String(frames.length)} frames, the slowest ${Math.max(...frames).toFixed(1)}`,
  );
}

/** A frame drawn on the walk or the turn: its JS time, and the re-tends and re-sights it ran, in ms. */
type Carried = z.infer<typeof Hitches> & { ms: number };

/** How many of `values` there are, their median and their slowest, in ms. */
function timings(values: readonly number[]): string {
  return values.length === 0
    ? 'none'
    : `${String(values.length)}, median ${median(values).toFixed(1)} ms, slowest ${Math.max(...values).toFixed(1)}`;
}

/**
 * The hitches `carried` shows: how long each re-tend and re-sight took, and
 * the frames that ran one against those that ran neither, at the median and
 * the slowest. Measured, not judged: the frame budget holds the median.
 */
function noteHitches(
  carried: readonly Carried[],
  note: (line: string) => void,
): void {
  const plain = carried.filter(
    ({ tend, see }) => tend.length + see.length === 0,
  );
  for (const kind of ['tend', 'see'] as const) {
    const on = carried.filter((frame) => frame[kind].length > 0);
    note(
      `${kind === 'tend' ? "the lawn's tending calls (whole re-tends, gathers, slices)" : "the perches' re-sights"} on the walk and the turn: ${timings(on.flatMap((frame) => frame[kind]))}; the frames carrying one ${timings(on.map(({ ms }) => ms))}`,
    );
  }
  note(`the frames carrying neither: ${timings(plain.map(({ ms }) => ms))}`);
}

/** Whether a finger at `point` reaches the meadow: on the screen and off every control's tap reach. */
function reachable(
  point: z.infer<typeof Point>,
  controls: z.infer<typeof Controls>,
  screen: Sized,
): boolean {
  const buttons = [
    controls.plus,
    controls.minus,
    controls.mute,
    controls.house,
    ...Object.values(controls.releases),
  ];
  return (
    point.x >= 0 &&
    point.x <= screen.width &&
    point.y >= 0 &&
    point.y <= screen.height &&
    buttons.every(
      (button) =>
        Math.hypot(button.x - point.x, button.y - point.y) > TAP_RADIUS * 2,
    )
  );
}
