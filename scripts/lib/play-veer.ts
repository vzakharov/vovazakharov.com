/**
 * Insects on the plane, `play-mushrooms.ts`'s run on a fresh meadow with four
 * mushrooms grown: what a child sees of every insect frame by frame
 * (`veer-watch.ts`). Released facing the clump, each perches at its own size
 * over its distance, in scale with its cap; the eye turned to look back, each
 * kind released with no perch in view flies out by the side, and with a
 * mushroom and a flower grown in view lands drawn, seen on nearly every frame
 * of its flight in, and sits at no smaller a size in the screen's middle than
 * its distance gives; walked into one hovering in the air, it veers off round the eye,
 * never past the nearest mushroom's zoom at its x. A fly's pace and dash,
 * its one-frame flicks and the blinks at the brow as the eye turns are
 * measured and logged, not failed. Frames land as `veer-*.png`.
 */

import { z } from 'zod';

import { pinholeOf } from '../../src/pages/mushrooms/model/ground.ts';
import type { InsectKind } from '../../src/pages/mushrooms/model/insect-genes.ts';
import { TURN_CRUISE } from '../../src/pages/mushrooms/model/pan.ts';
import { azimuthOf } from '../../src/pages/mushrooms/ui/scene/insect-frame.ts';
import {
  Camera,
  type Controls,
  type Expect,
  Eye,
  Insects,
  inTurn,
  type Page,
  Point,
} from './mushroom-probe.ts';
import { buttonsOf, TUFTS } from './play-tufts.ts';
import {
  blinks,
  flicks,
  FPS,
  lookedBack,
  type Note,
  type OnScreen,
  pace,
  satBack,
  sizesAt,
  walkedIn,
  zooms,
} from './veer-report.ts';
import { type Sample, Samples, VEER } from './veer-watch.ts';

/** How many of one kind are released looking back for one to take a perch in view: a fly roams to the air most legs. */
const BACK_TRIES = 6;

/**
 * Something to sit on looking back, grown in view as a child grows it: a
 * mushroom off the `+` and the picker's first cap, and a flower planted on
 * the nearest tuft that takes one, its first colour and first shape — a bee
 * takes no cap.
 */
async function perchesBack(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: Note,
): Promise<void> {
  const [cap] = controls.picker;
  const mushrooms = async () =>
    page.evaluate('__probe.state().mushrooms.length', z.number());
  const grownFrom = await mushrooms();
  await page.tap(controls.plus);
  await page.step(30);
  if (cap) await page.tap(cap);
  await page.step(90);
  expect(
    (await mushrooms()) === grownFrom + 1,
    'looking back, the + and a cap grew no mushroom',
  );
  const planted = async () =>
    page.evaluate('__probe.scene.meadow.planted.length', z.number());
  const open = async () =>
    page.evaluate('__probe.scene.meadow.planting !== undefined', z.boolean());
  const sownFrom = await planted();
  const tufts = (await page.evaluate(TUFTS, z.array(Point))).toReversed();
  const opening = async ([tuft, ...rest]: ReadonlyArray<
    z.infer<typeof Point>
  >): Promise<boolean> => {
    if (!tuft) return false;
    await page.tap(tuft);
    await page.step(30);
    return (await open()) || opening(rest);
  };
  if (!(await opening(tufts.slice(0, 16)))) {
    expect(
      false,
      `looking back, none of ${String(tufts.length)} tufts in view opened the flower picker`,
    );
    return;
  }
  const pickFirst = async (picker: 'colourPicker' | 'shapePicker') => {
    const [button] = await page.evaluate(buttonsOf(picker), z.array(Point));
    if (button) await page.tap(button);
    await page.step(30);
  };
  await pickFirst('colourPicker');
  await pickFirst('shapePicker');
  await page.step(80);
  expect(
    (await planted()) === sownFrom + 1,
    'looking back, the flower picker planted no flower',
  );
  note(
    `looking back: grew a mushroom and planted a flower in view, ${String(await mushrooms())} mushrooms and ${String(await planted())} flowers planted`,
  );
}

export async function playVeer(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: Note,
): Promise<void> {
  const camera = await page.evaluate('__probe.scene.layout.camera', Camera);
  const lens = pinholeOf(camera);
  const { width, height } = await page.evaluate('__probe.eye()', Eye);
  const butterfly = await page.evaluate(
    '__probe.scene.layout.insectSizes.butterfly',
    z.number(),
  );
  await page.evaluate(`${VEER}; true`, z.boolean());
  const seen: Sample[] = [];
  const keep = async () => {
    const taken = await page.evaluate('__veer.take()', Samples);
    seen.push(...taken);
    return taken;
  };
  const insects = async () => page.evaluate('__probe.insects()', Insects);
  const clock = async () =>
    (await page.evaluate('__probe.scene.clock', z.number())) * 1000;
  /** The eye turned to `heading` and at rest there, as a settled turn leaves it. */
  const face = async (heading: number) =>
    page.evaluate(
      `(() => { const eye = __probe.scene.eye; const walk = eye.walk; eye.walk = { ...walk, pan: { ...walk.pan, motion: { kind: 'rest', left: ${String(heading * lens.arc)} } } }; return true; })()`,
      z.boolean(),
    );
  /** `frames` frames stepped in looks of `every`, the record kept. */
  const run = async (frames: number, every = 30) => {
    await inTurn(
      Array.from({ length: Math.ceil(frames / every) }, () => every),
      async (chunk) => {
        await page.step(chunk);
        await keep();
      },
    );
  };
  const onScreen: OnScreen = ({ x, y }) =>
    x >= 0 && x <= width && y >= 0 && y <= height;

  // Something to sit on: four mushrooms, grown from the picker's first four caps.
  await inTurn(controls.picker.slice(0, 4), async (cap) => {
    await page.tap(controls.plus);
    await page.step(30);
    await page.tap(cap);
    await page.step(90);
  });
  await keep();

  // 2. Facing the clump: every kind released, each perched at its size.
  const releases: InsectKind[] = [
    'butterfly',
    'butterfly',
    'fly',
    'butterfly',
    'bee',
    'butterfly',
    'fly',
    'bee',
  ];
  await inTurn([...releases.entries()], async ([index, kind]) => {
    await page.tap(controls.releases[kind]);
    await page.step(20);
    await keep();
    if (index === 2) await page.shoot('veer-opening-fly-in');
  });
  await run(FPS * 7);
  await page.shoot('veer-opening-perched');
  sizesAt('opening', seen, note);

  // 5. The brow blink: the eye turned to look back, on `→` held.
  const turnFrames = Math.round((Math.PI / TURN_CRUISE) * FPS);
  await page.key('ArrowRight', 'keyDown');
  await run(Math.round(turnFrames / 2), 3);
  await page.shoot('veer-turning');
  await run(turnFrames - Math.round(turnFrames / 2), 3);
  await page.key('ArrowRight', 'keyUp');
  await run(90, 3);
  const turned = seen.filter(({ heading }) => heading > 0.05);
  blinks(turned, onScreen, note);
  await face(Math.PI);
  await page.step(2);

  // 1. Looking back: each kind released, drawn in, landed on a drawn perch —
  // first with none in view, so it flies out by the side, then with a
  // mushroom and a flower grown in view as a child grows them.
  const kinds: InsectKind[] = ['butterfly', 'fly', 'bee'];
  /** One `kind` released and watched till it lands; its first perch's kind, or `undefined` for none released. */
  const releaseBack = async (kind: InsectKind, shot: string) => {
    const before = new Set((await insects()).map(({ id }) => id));
    await page.tap(controls.releases[kind]);
    await page.step(2);
    const released = (await insects()).find(({ id }) => !before.has(id));
    if (!released) {
      expect(
        false,
        `looking back, a ${kind} release put no ${kind} in the meadow`,
      );
      return;
    }
    const at = await clock();
    const flight = released.arrives - at;
    const middle = Math.max(2, Math.round((flight * 0.4 * FPS) / 1000));
    await run(middle, middle);
    await page.shoot(`${shot}-in`);
    await run(Math.max(30, Math.round(((flight + 900) * FPS) / 1000) - middle));
    await page.shoot(`${shot}-landed`);
    const leg = seen.filter(
      (sample) => sample.id === released.id && sample.legs === released.legs,
    );
    lookedBack(kind, leg, onScreen, expect, note);
    return released.to.kind;
  };
  await inTurn(kinds, async (kind) => {
    await releaseBack(kind, `veer-back-${kind}-out`);
  });
  await perchesBack(page, controls, expect, note);
  await page.shoot('veer-back-grown');
  await inTurn(kinds, async (kind) => {
    const perched = async (tries: number): Promise<boolean> => {
      if (tries === 0) return false;
      const to = await releaseBack(
        kind,
        `veer-back-${kind}${tries === BACK_TRIES ? '' : `-${String(BACK_TRIES - tries)}`}`,
      );
      return to === 'cap' || to === 'flower' || perched(tries - 1);
    };
    expect(
      await perched(BACK_TRIES),
      `looking back, none of ${String(BACK_TRIES)} ${kind} releases took a perch in view`,
    );
  });
  await run(FPS * 3);
  await page.shoot('veer-back-perched');
  const back = seen.filter(({ heading }) => Math.abs(heading - Math.PI) < 1e-6);
  sizesAt('looking back', back, note);
  satBack(back, onScreen, lens, expect);

  // 3. A walk into a hover: the eye turned to face one in the air, and walked.
  await face(0);
  await page.step(2);
  const hovering = async (looks: number): Promise<string | undefined> => {
    const now = await clock();
    const found = (await insects()).find(
      ({ to, arrives, leaves }) =>
        to.kind === 'air' && now >= arrives && leaves - now > 2500,
    );
    if (found || looks === 0) return found?.id;
    if (looks % 4 === 0) await page.tap(controls.releases.fly);
    await run(30);
    return hovering(looks - 1);
  };
  const target = await hovering(40);
  if (target === undefined) {
    note(
      'no insect ever hovered in the air: the walk into a hover is not played',
    );
  } else {
    const where = await page.evaluate(
      `(() => { const { drawn } = __probe.scene.insects.shown.get(${JSON.stringify(target)}); const { eye } = __probe.scene.insects.view(); return { drawn: { x: drawn.x, y: drawn.y }, eye: { x: eye.x, y: eye.y } }; })()`,
      z.object({ drawn: Point, eye: Point }),
    );
    await face(azimuthOf(where.eye, where.drawn));
    await page.step(2);
    await keep();
    const from = seen.length;
    await page.key('ArrowUp', 'keyDown');
    await inTurn([0, 1, 2, 3, 4, 5, 6, 7], async (index) => {
      await run(20, 20);
      if (index % 2 === 1) await page.shoot(`veer-walk-in-${String(index)}`);
    });
    await page.key('ArrowUp', 'keyUp');
    await run(90);
    walkedIn(target, seen.slice(from), lens, width, expect, note);
  }

  // 5 again, the other way: back round on `←` held, to the clump.
  const backFrom = seen.length;
  await page.key('ArrowLeft', 'keyDown');
  await run(turnFrames, 3);
  await page.key('ArrowLeft', 'keyUp');
  await run(90, 3);
  blinks(seen.slice(backFrom), onScreen, note);

  // 3 and 4 over the whole run: zoom, the fly's pace, flicks.
  zooms(seen, lens, expect, note);
  pace(seen, butterfly, note);
  flicks(seen, width, note);
}
