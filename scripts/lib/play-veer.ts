/**
 * Insects on the plane, `play-mushrooms.ts`'s run on a fresh meadow with four
 * mushrooms grown: what a child sees of every insect frame by frame
 * (`veer-watch.ts`). Released facing the clump, each perches at its own size
 * over its distance, in scale with its cap; the eye turned to look back, each
 * kind released with no perch in view flies out by the side, and, turned
 * as far round as there is room to grow on, with a mushroom and a flower
 * grown in view lands drawn, seen on nearly every frame of its flight in,
 * and sits at no smaller a size in the screen's middle than its distance
 * gives; walked into one hovering in the air, it veers off round the eye,
 * never past the nearest mushroom's zoom at its x; and no one frame steps a
 * dashing kind past its dash curve's fastest frame at its own size, or a
 * butterfly past a twentieth of the screen as drawn. A fly's pace and the
 * blinks at the brow as the eye turns are logged, not failed. Frames land
 * as `veer-*.png`.
 */

import { z } from 'zod';

import { azimuthOf } from '../../src/pages/mushrooms/model/flight-frame.ts';
import { wrap } from '../../src/pages/mushrooms/model/geometry.ts';
import { pinholeOf } from '../../src/pages/mushrooms/model/ground.ts';
import type { InsectKind } from '../../src/pages/mushrooms/model/insect-genes.ts';
import { TURN_CRUISE } from '../../src/pages/mushrooms/model/pan.ts';
import {
  Camera,
  type Controls,
  type Expect,
  Eye,
  grow,
  Insects,
  inTurn,
  type Page,
  Point,
} from './mushroom-probe.ts';
import { buttonsOf, nearestOpening, TUFTS } from './play-tufts.ts';
import {
  blinks,
  flicks,
  lookedBack,
  type Note,
  type OnScreen,
  pace,
  satBack,
  sizesAt,
  walkedIn,
  zooms,
} from './veer-report.ts';
import { FPS, most, type Sample, Samples, VEER } from './veer-watch.ts';

/** The headings round the eye a perch is looked for at, in radians. */
const HEADINGS = Array.from(
  { length: 24 },
  (_, index) => (index * Math.PI) / 12,
);

/** How many of one kind are released looking back for one to take a perch in view: a fly roams to the air most legs. */
const BACK_TRIES = 6;

/**
 * Something to sit on looking back, grown in view as a child grows it: a
 * mushroom off the `+` and the picker's first cap, and a flower planted on
 * the nearest tuft that takes one, its first colour and first shape — a bee
 * takes no cap. How many of the two it grew.
 */
async function perchesBack(
  page: Page,
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: Note,
): Promise<number> {
  const [cap] = controls.picker;
  const mushrooms = async () =>
    page.evaluate('__probe.state().mushrooms.length', z.number());
  const grownFrom = await mushrooms();
  await grow(page, controls, cap);
  const mushroom = (await mushrooms()) === grownFrom + 1 ? 1 : 0;
  expect(mushroom === 1, 'looking back, the + and a cap grew no mushroom');
  // The child's flowers alone: the bees in flight sow theirs meanwhile.
  const planted = async () =>
    page.evaluate(
      `__probe.scene.meadow.planted.filter((sown) => !('parent' in sown)).length`,
      z.number(),
    );
  const sownFrom = await planted();
  const tufts = await page.evaluate(TUFTS, z.array(Point));
  if (!(await nearestOpening(page, tufts))) {
    expect(
      false,
      `looking back, none of ${String(tufts.length)} tufts in view opened the flower picker`,
    );
    return mushroom;
  }
  const pickFirst = async (picker: 'colourPicker' | 'shapePicker') => {
    const [button] = await page.evaluate(buttonsOf(picker), z.array(Point));
    if (button) await page.tap(button);
    await page.step(30);
  };
  await pickFirst('colourPicker');
  await pickFirst('shapePicker');
  await page.step(80);
  const flower = (await planted()) === sownFrom + 1 ? 1 : 0;
  expect(flower === 1, 'looking back, the flower picker planted no flower');
  note(
    `looking back: grew ${String(mushroom)} mushroom and ${String(flower)} flower in view`,
  );
  return mushroom + flower;
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
  /**
   * The eye faced to each of `HEADINGS`, and what a child could grow there.
   * Its snaps are no insect's doing, so the frames it steps are dropped.
   */
  const ground = async () => {
    const found: Array<{ heading: number; roomy: boolean; tufts: number }> = [];
    await keep();
    await inTurn(HEADINGS, async (heading) => {
      await face(heading);
      await page.step(2);
      const at = await page.evaluate(
        `({ roomy: __probe.scene.arrivals.roomy(), tufts: (${TUFTS}).length })`,
        z.object({ roomy: z.boolean(), tufts: z.number() }),
      );
      found.push({ heading, ...at });
    });
    await page.evaluate('__veer.take().length', z.number());
    return found;
  };

  // Something to sit on: four mushrooms, grown from the picker's first four caps.
  await inTurn(controls.picker.slice(0, 4), async (cap) =>
    grow(page, controls, cap),
  );
  await keep();

  // Facing the clump: every kind released, each perched at its size.
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

  // The brow blink: the eye turned to look back, on `→` held.
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

  // Looking back: each kind released, drawn in, landed on a drawn perch —
  // first at π with none in view, so it flies out by the side, then at the
  // heading farthest round with room to grow on (the glade is bare behind
  // the eye), with a mushroom and a flower grown in view.
  const kinds: InsectKind[] = ['butterfly', 'fly', 'bee'];
  /**
   * One `kind` released and watched till it lands: `perched` when it flew in
   * to a perch in view, not out by the side; `crowded` when it took the air
   * while another insect held a flower.
   */
  const releaseBack = async (
    kind: InsectKind,
    shot: string,
  ): Promise<'perched' | 'crowded' | 'missed'> => {
    const before = new Set((await insects()).map(({ id }) => id));
    await page.tap(controls.releases[kind]);
    await page.step(2);
    const meadow = await insects();
    const released = meadow.find(({ id }) => !before.has(id));
    const crowded =
      released?.to.kind === 'air' &&
      meadow.some(({ id, to }) => id !== released.id && to.kind === 'flower');
    if (released?.to.kind === 'air') {
      // Its in-view choice had nothing open: what every other insect held.
      const held = meadow.flatMap(({ id, to }) =>
        id !== released.id && (to.kind === 'cap' || to.kind === 'flower')
          ? [`${id}→${to.id}`]
          : [],
      );
      note(
        `looking back, the ${kind} released took the air; held: ${held.join(', ') || 'nothing'}`,
      );
    }
    if (!released) {
      expect(
        false,
        `looking back, a ${kind} release put no ${kind} in the meadow`,
      );
      return 'missed';
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
    if (
      (released.to.kind === 'cap' || released.to.kind === 'flower') &&
      !leg.some(({ out }) => out)
    )
      return 'perched';
    return crowded ? 'crowded' : 'missed';
  };
  await inTurn(kinds, async (kind) => {
    await releaseBack(kind, `veer-back-${kind}-out`);
  });
  const roomy = (await ground()).filter(({ roomy: room }) => room);
  const landing =
    most(roomy, ({ heading }) => Math.abs(wrap(heading)))?.heading ?? Math.PI;
  note(
    `looking back: landing at heading ${landing.toFixed(2)}, the farthest from 0 the + has room at${roomy.length === 0 ? ' (none had room: π)' : ''}`,
  );
  await face(landing);
  await page.step(2);
  const grown = await perchesBack(page, controls, expect, note);
  await page.shoot('veer-back-grown');
  if (grown > 0) {
    // The fly first: a fussy kind roams the air while no fly agaric is open,
    // and a butterfly resting on the one grown holds it for seconds.
    await inTurn(['fly', 'butterfly', 'bee'] as const, async (kind) => {
      /** Tries that took the air while another insect held a flower. */
      let crowded = 0;
      const perched = async (tries: number): Promise<boolean> => {
        if (tries === 0) return false;
        const landed = await releaseBack(
          kind,
          `veer-back-${kind}${tries === BACK_TRIES ? '' : `-${String(BACK_TRIES - tries)}`}`,
        );
        if (landed === 'crowded') crowded += 1;
        return landed === 'perched' || perched(tries - 1);
      };
      const landed = await perched(BACK_TRIES);
      const line = `looking back, none of ${String(BACK_TRIES)} ${kind} releases took a perch in view`;
      // The bee's one perch in view is the one flower grown, and the meadow's
      // butterflies roaming in hold it past every try: the game's choice, so
      // a bee kept off it by them is noted, not failed.
      if (!landed && kind === 'bee' && crowded === BACK_TRIES)
        note(`${line}: the flower held on every try`);
      else expect(landed, line);
    });
  }
  await run(FPS * 3);
  await page.shoot('veer-back-perched');
  const back = seen.filter(
    ({ heading }) => Math.abs(wrap(heading - landing)) < 1e-6,
  );
  sizesAt('looking back', back, note);
  satBack(back, onScreen, lens, expect);

  // A walk into a hover: the eye turned to face one in the air, and walked.
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
  const target = await hovering(80);
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

  // The brow blink the other way: back round on `←` held, to the clump.
  const backFrom = seen.length;
  await page.key('ArrowLeft', 'keyDown');
  await run(turnFrames, 3);
  await page.key('ArrowLeft', 'keyUp');
  await run(90, 3);
  blinks(seen.slice(backFrom), onScreen, note);

  // Over the whole run: zoom, the fly's pace, flicks.
  zooms(seen, lens, expect, note);
  pace(seen, lens, butterfly, note);
  flicks(seen, lens, width, butterfly, expect, note);

  // Where round the eye a child can grow a perch: the `+` has room and a tuft
  // a tap reaches bare is drawn. Last, its snaps past every measure.
  const swept = await ground();
  note(
    `ground to grow on, by heading: ${swept
      .map(
        ({ heading, roomy: room, tufts }) =>
          `${heading.toFixed(2)} ${room ? 'room' : 'no room'}, ${String(tufts)} tufts`,
      )
      .join('; ')}`,
  );
}
