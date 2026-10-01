/**
 * The walk into the forest, `play-mushrooms.ts`'s run on a fresh meadow: the
 * forest grown from `+` as a child grows it; the eye turned onto its haziest
 * back-row mushroom and walked up to it on `↑` until it is drawn `CLOSE`
 * times its opening size, by when its painted haze has dropped; a tap on its
 * drawn cap selects it, and one `OUTSIDE` px outside its outline, where the
 * finger pad was, does not; then the eye turned there, at the closest
 * approach. Every frame of the walk and the turn is drawn and timed, and
 * their median kept to the frame budget (`lib/frame-budget.ts`): the fill
 * rate's worst case, caps covering the screen.
 */

import { z } from 'zod';

import { CLUMP_DISTANCE } from '../../src/pages/mushrooms/model/ground.ts';
import { TURN_CRUISE } from '../../src/pages/mushrooms/model/pan.ts';
import { HAZE_DRIFT } from '../../src/pages/mushrooms/ui/scene/repaint-queue.ts';
import { TAP_RADIUS } from '../../src/pages/mushrooms/ui/scene/tap-reach.ts';
import type { Sized } from '../../src/shared/typings/index.ts';
import { median, overBudget } from './frame-budget.ts';
import {
  type Arrow,
  type Controls,
  type Expect,
  inTurn,
  type Page,
  Point,
  State,
} from './mushroom-probe.ts';

const FPS = 60;
/** How many times its opening size the walked-up mushroom is drawn at the least. */
const CLOSE = 1.5;
/** How far outside the walked-up mushroom's outline, in CSS px, a tap must not take it. */
const OUTSIDE = 4;
/** How many mushrooms the forest is grown by, the slots past the clump's two. */
const GROWN = 10;
/** How near the screen's middle, as a share of its width, the eye is turned onto its mushroom. */
const AIMED = 0.04;
/** The most `↑` frames the walk up may take before it is called short. */
const MOST_WALK = FPS * 12;
/** Frames enough for a held key's ease to come to rest. */
const SETTLE = 120;

/** Every mushroom drawn: how many times its opening size, its painted haze, where on the screen its foot stands, and its depth. */
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
  const screen = await page.evaluate(
    '({ width: __probe.scene.layout.width, height: __probe.scene.layout.height, unit: __probe.scene.layout.camera.unit })',
    z.object({ width: z.number(), height: z.number(), unit: z.number() }),
  );
  const focal = screen.unit * CLUMP_DISTANCE;

  // The forest, grown from `+` and the picker's buttons in turn.
  await inTurn([...Array.from({ length: GROWN }).keys()], async (index) => {
    await page.tap(controls.plus);
    await page.step(30);
    const button = controls.picker[index % controls.picker.length];
    if (button) await page.tap(button);
    await page.step(90);
  });
  const grown = await state();
  note(`the forest stands ${String(grown.mushrooms.length)} mushrooms`);

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
      Math.round(
        ((Math.atan(Math.abs(offset) / focal) / TURN_CRUISE) * FPS) / 2,
      ),
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
  await page.key('ArrowUp', 'keyDown');
  const walkUp = async (frames: number): Promise<Stand | undefined> => {
    await page.step(1);
    const now = await standOf(target.id);
    if (!now || now.zoom >= CLOSE || frames >= MOST_WALK) return now;
    return walkUp(frames + 1);
  };
  const reached = await walkUp(0);
  await page.key('ArrowUp', 'keyUp');
  await inTurn([...Array.from({ length: SETTLE }).keys()], async () =>
    page.step(1),
  );
  const close = await standOf(target.id);
  const eye = await page.evaluate(
    '__probe.eye()',
    z.object({ x: z.number(), y: z.number() }),
  );
  expect(
    close !== undefined && close.zoom >= CLOSE,
    `↑ walked up to ${target.id} until it was drawn ${String(reached?.zoom.toFixed(2))} times its opening size, short of ${String(CLOSE)} (the eye at ${eye.x.toFixed(2)}, ${eye.y.toFixed(2)})`,
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
  const cap = await page.evaluate(
    `__probe.mushroom(${JSON.stringify(target.id)})`,
    Point.nullable(),
  );
  if (cap === null) {
    expect(false, `walked up to, ${target.id} shows no cap a tap reaches`);
  } else {
    await page.tap(cap);
    await page.step(2);
    expect(
      (await state()).selected === target.id,
      `a tap on ${target.id}'s drawn cap at (${cap.x.toFixed(0)}, ${cap.y.toFixed(0)}) reached ${String(await reachedThere(cap))}, not it`,
    );
    await page.step(40);
    await page.shoot('final-tap');
  }

  // Turned there, at the closest approach, one way and back.
  await inTurn(['ArrowRight', 'ArrowLeft'] as const, async (key) => {
    await page.key(key, 'keyDown');
    await inTurn([...Array.from({ length: FPS * 2 }).keys()], async () =>
      page.step(1),
    );
    if (key === 'ArrowRight') await page.shoot('final-close-turn');
    await page.key(key, 'keyUp');
    await inTurn([...Array.from({ length: FPS }).keys()], async () =>
      page.step(1),
    );
  });
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
