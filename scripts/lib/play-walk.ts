/**
 * Walking, `play-mushrooms.ts`'s run on a fresh meadow: `↑` held walks the
 * eye toward the clump and `↓` back to the glade's rim, eased in and out,
 * the camera bobbing only while it walks and a footstep per step; `→` held
 * turns it one way, never past `TURN_CRUISE`, all the way round, the sun
 * leaving the screen and coming back, and `←` held as long turns it back
 * onto every bed object as it stood; a sideways drag from bare ground turns
 * it with the ground under the finger and a drag down the screen walks it,
 * never faster than `STRIDE_CRUISE`, neither tapping anything; and the
 * screen turned keeps the eye where it stood and looking where it looked.
 * Frames of the opening, the walk, the rim, a quarter and a half turn land
 * as `walk-*.png`.
 */

import { z } from 'zod';

import { CLUMP_DISTANCE } from '../../src/pages/mushrooms/model/ground.ts';
import { SLOP, TURN_CRUISE } from '../../src/pages/mushrooms/model/pan.ts';
import {
  GLADE,
  RIM_KEEP,
  STEP_LENGTH,
  STRIDE_CRUISE,
} from '../../src/pages/mushrooms/model/stride.ts';
import {
  type Arrow,
  type Controls,
  type Expect,
  Eye,
  type Page,
  Point,
  Sun,
} from './mushroom-probe.ts';
import { BARE_START, TAPS } from './play-taps.ts';

const FPS = 60;
/** Frames enough for a held key's ease and a glide to come to rest. */
const SETTLE_FRAMES = 150;
/** How far over a cruise a frame's pace may run, for the float left over. */
const OVER = 1.02;
/** How near, in CSS px, a bed object back where it stood counts as there. */
const SAME_PX = 0.5;
/** The bob's depth as a share of the screen's height (`walking.ts`). */
const BOB_SHARE = 0.004;

type Seen = z.infer<typeof Eye>;

/** Every bed object drawn, mushrooms and flowers, where it stands on the screen. */
const BEDS = `(() => {
  const scene = __probe.scene;
  const placed = (object) => {
    const at = object.getWorldTransformMatrix();
    return __probe.toScreen({ x: at.tx, y: at.ty });
  };
  return Object.fromEntries([
    ...[...scene.bed.shown]
      .filter(([, { graphics }]) => graphics.visible)
      .map(([id, { graphics }]) => ['mushroom:' + id, placed(graphics)]),
    ...[...scene.flowers.shown]
      .filter(([, { container }]) => container.visible)
      .map(([id, { container }]) => ['flower:' + id, placed(container)]),
  ]);
})()`;
const Beds = z.record(z.string(), Point);

/** The heading's change from `from` to `to`, the short way round. */
function turned(from: number, to: number): number {
  const turn = to - from;
  return turn - 2 * Math.PI * Math.round(turn / (2 * Math.PI));
}

/** How far the eye stands from the glade's middle. */
function fromMiddle({ x, y }: Seen): number {
  return Math.hypot(x - GLADE.x, y - GLADE.y);
}

/** The farthest any bed object in `before` or `after` stands from itself in the other, in CSS px; a missing one counts as infinitely far. */
function moved(
  before: z.infer<typeof Beds>,
  after: z.infer<typeof Beds>,
): number {
  const ids = new Set([...Object.keys(before), ...Object.keys(after)]);
  return Math.max(
    0,
    ...[...ids].map((id) => {
      const [a, b] = [before[id], after[id]];
      return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : Infinity;
    }),
  );
}

export async function playWalk(
  page: Page,
  _controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const eye = async () => page.evaluate('__probe.eye()', Eye);
  const taps = async () => page.evaluate(TAPS, z.string());
  /** `key` held `frames` frames and let go, then left to settle: the eye frame by frame throughout. */
  const hold = async (key: Arrow, frames: number) => {
    await page.key(key, 'keyDown');
    const held = await page.trace(frames, '__probe.eye()', Eye);
    await page.key(key, 'keyUp');
    const after = await page.trace(SETTLE_FRAMES, '__probe.eye()', Eye);
    return [...held, ...after];
  };
  const shoot = async (name: string) => {
    await page.step(1);
    await page.shoot(`walk-${name}`);
  };

  const opening = await eye();
  const bob = BOB_SHARE * opening.height;
  await shoot('opening');
  const tapsBefore = await taps();

  // Toward the clump, then back to the rim.
  await page.key('ArrowUp', 'keyDown');
  const ahead = await page.trace(Math.round(FPS * 1.2), '__probe.eye()', Eye);
  await shoot('forward');
  ahead.push(
    await eye(),
    ...(await page.trace(Math.round(FPS * 1.3), '__probe.eye()', Eye)),
  );
  await page.key('ArrowUp', 'keyUp');
  ahead.push(...(await page.trace(SETTLE_FRAMES, '__probe.eye()', Eye)));
  await shoot('near');
  checkWalk(opening, ahead, bob, 'ArrowUp', expect, note);
  const back = await hold('ArrowDown', FPS * 12);
  const rim = back.at(-1) ?? opening;
  await shoot('rim');
  checkWalk(ahead.at(-1) ?? opening, back, bob, 'ArrowDown', expect, note);
  expect(
    fromMiddle(rim) > GLADE.r - RIM_KEEP - 0.05 &&
      fromMiddle(rim) <= GLADE.r - RIM_KEEP + 1e-6,
    `↓ held 12 s rested ${fromMiddle(rim).toFixed(3)} from the glade's middle, not at its rim ${String(GLADE.r - RIM_KEEP)}`,
  );

  // All the way round on `→`, shooting a quarter and a half turn, then
  // back on `←` held as long.
  const beds = await page.evaluate(BEDS, Beds);
  const sunAt = async () => page.evaluate('__probe.sun()', Sun);
  const sunFrom = await sunAt();
  const full = Math.ceil(((2 * Math.PI) / TURN_CRUISE) * FPS) + 30;
  const quarter = Math.round((Math.PI / 2 / TURN_CRUISE) * FPS);
  const TURNING = '[__probe.eye().heading, __probe.sun()]';
  const Turning = z.tuple([z.number(), Sun]);
  /** `frames` frames of the turn traced, then one drawn and shot as `name`. */
  const turnOn = async (frames: number, name: string) => [
    ...(await page.trace(frames - 1, TURNING, Turning)),
    await shoot(name).then(async () => page.evaluate(TURNING, Turning)),
  ];
  await page.key('ArrowRight', 'keyDown');
  const round = [
    ...(await turnOn(quarter, 'quarter')),
    ...(await turnOn(quarter, 'half')),
    ...(await page.trace(full - 2 * quarter, TURNING, Turning)),
  ];
  await page.key('ArrowRight', 'keyUp');
  round.push(...(await page.trace(SETTLE_FRAMES, TURNING, Turning)));
  checkTurn([rim.heading, ...round.map(([heading]) => heading)], expect, note);
  const sunGone = round.findIndex(([, sun]) => sun === null);
  const sunBack = round.findLastIndex(([, sun]) => sun === null);
  expect(
    sunFrom !== null &&
      sunGone !== -1 &&
      sunBack < round.length - 1 &&
      round.at(-1)?.[1] !== null,
    `a full turn on → did not carry the sun off the screen and back (opening ${String(sunFrom)}, gone at frame ${String(sunGone)}, last gone ${String(sunBack)})`,
  );
  await hold('ArrowLeft', full);
  const returned = moved(beds, await page.evaluate(BEDS, Beds));
  expect(
    returned <= SAME_PX,
    `→ then ← held as long left a bed object ${returned.toFixed(2)} px from where it stood`,
  );

  // A sideways drag from bare ground turns the eye with the ground under
  // the finger, and steps nowhere.
  const lens = await page.evaluate(
    '__probe.scene.layout.camera',
    z.object({ width: z.number(), unit: z.number() }),
  );
  const focal = lens.unit * CLUMP_DISTANCE;
  const azimuth = (x: number) => Math.atan((x - lens.width / 2) / focal);
  const start = await page.evaluate(BARE_START, Point.nullable());
  if (start === null) {
    note('no bare ground to drag from: the drags are not played');
  } else {
    const before = await eye();
    const to = { ...start, x: start.x - 0.3 * before.width };
    await page.drag(start, to, 12);
    const lifted = await eye();
    const want = azimuth(start.x) - azimuth(to.x);
    const got = turned(before.heading, lifted.heading);
    const slack = azimuth(lens.width / 2 + SLOP) * 1.5;
    expect(
      Math.abs(got - want) <= slack,
      `a sideways drag turned the eye ${got.toFixed(4)} rad, not the ${want.toFixed(4)} that keeps the ground under the finger`,
    );
    expect(
      lifted.x === before.x && lifted.y === before.y,
      `a sideways drag stepped the eye from (${before.x.toFixed(3)}, ${before.y.toFixed(3)}) to (${lifted.x.toFixed(3)}, ${lifted.y.toFixed(3)})`,
    );
    await page.step(SETTLE_FRAMES);
    note(
      `a sideways drag turned ${got.toFixed(3)} rad at the lift (${want.toFixed(3)} keeps the ground), ${turned(before.heading, (await eye()).heading).toFixed(3)} after its glide`,
    );

    // A drag down the screen pulls the ground toward the eye: it walks.
    const from = await page.evaluate(BARE_START, Point.nullable());
    if (from !== null) {
      const down = {
        ...from,
        y: Math.min(before.height - 4, from.y + 0.25 * before.height),
      };
      const pressed = await eye();
      await page.drag(from, down, 12);
      const chase = await page.trace(SETTLE_FRAMES, '__probe.eye()', Eye);
      checkWalk(pressed, chase, bob, 'drag', expect, note);
      expect(
        turned(pressed.heading, chase.at(-1)?.heading ?? 0) === 0,
        'a drag down the screen turned the eye',
      );
    }
  }
  expect((await taps()) === tapsBefore, 'walking and turning tapped something');

  // The screen turned: the eye stands where it stood, looking where it looked.
  const unturned = await eye();
  await page.turn();
  await page.step(2);
  const reTurned = await eye();
  expect(
    Math.abs(turned(unturned.heading, reTurned.heading)) < 1e-9 &&
      Math.hypot(unturned.x - reTurned.x, unturned.y - reTurned.y) < 1e-9,
    `the screen turned moved the eye from (${unturned.x.toFixed(3)}, ${unturned.y.toFixed(3)}, ${unturned.heading.toFixed(4)}) to (${reTurned.x.toFixed(3)}, ${reTurned.y.toFixed(3)}, ${reTurned.heading.toFixed(4)})`,
  );
  await shoot('turned-screen');
  await page.turn();
  await page.step(2);
}

/**
 * A walk frame by frame, `seen`, from where it stood at `from`: never past
 * `STRIDE_CRUISE` (a drag's frames before `seen` are not traced), eased in
 * where a key starts it, the bob within `[−bob, 0]`, down while it walks and
 * 0 once it rests, and a footstep per `STEP_LENGTH` walked, ±1.
 */
function checkWalk(
  from: Seen,
  seen: readonly Seen[],
  bob: number,
  by: Arrow | 'drag',
  expect: Expect,
  note: (line: string) => void,
): void {
  const last = seen.at(-1);
  if (!last) return;
  const paces = seen.map((now, index) => {
    const was = seen[index - 1] ?? from;
    return Math.hypot(now.x - was.x, now.y - was.y) * FPS;
  });
  const fastest = Math.max(...(by === 'drag' ? paces.slice(1) : paces));
  expect(
    fastest <= STRIDE_CRUISE * OVER,
    `${by}: walked at ${fastest.toFixed(3)} units/s, past the cruise ${String(STRIDE_CRUISE)}`,
  );
  if (by !== 'drag') {
    expect(
      (paces[0] ?? 0) < STRIDE_CRUISE * 0.5,
      `${by}: set off at ${(paces[0] ?? 0).toFixed(3)} units/s, not eased in`,
    );
  }
  const bobs = seen.map(({ bob: at }) => at);
  expect(
    bobs.every((at) => at <= 1e-9 && at >= -bob - 1e-9),
    `${by}: the bob ran ${Math.min(...bobs).toFixed(2)}..${Math.max(...bobs).toFixed(2)} px, outside [${(-bob).toFixed(2)}, 0]`,
  );
  expect(
    bobs.some((at) => at < -0.1),
    `${by}: the camera never bobbed while walking`,
  );
  expect(
    last.bob === 0,
    `${by}: the camera rests at ${String(last.bob)} px, not 0`,
  );
  const walked = last.walked - from.walked;
  const steps = last.steps - from.steps;
  expect(
    Math.abs(steps - walked / STEP_LENGTH) <= 1,
    `${by}: ${String(steps)} footsteps over ${walked.toFixed(2)} units walked, not one per ${String(STEP_LENGTH)}`,
  );
  note(
    `${by}: walked ${walked.toFixed(2)} units at most ${fastest.toFixed(2)} units/s in ${String(steps)} footsteps, the bob down to ${Math.min(...bobs).toFixed(2)} px; the eye at (${last.x.toFixed(2)}, ${last.y.toFixed(2)})`,
  );
}

/** A turn on a held key frame by frame: one way only, never past `TURN_CRUISE`, eased in and out. */
function checkTurn(
  headings: readonly number[],
  expect: Expect,
  note: (line: string) => void,
): void {
  const paces = headings
    .slice(1)
    .map((now, index) => turned(headings[index] ?? now, now) * FPS);
  const fastest = Math.max(...paces);
  const total = paces.reduce((sum, pace) => sum + pace / FPS, 0);
  expect(
    paces.every((pace) => pace >= 0),
    `→ held turned back ${Math.min(...paces).toFixed(4)} rad/s on a frame`,
  );
  expect(
    fastest <= TURN_CRUISE * OVER,
    `→ held turned ${fastest.toFixed(4)} rad/s, past the cruise ${String(TURN_CRUISE)}`,
  );
  expect(
    (paces[0] ?? 0) < TURN_CRUISE * 0.5 &&
      (paces.findLast((pace) => pace > 0) ?? 0) < TURN_CRUISE * 0.5,
    `→ held set off at ${(paces[0] ?? 0).toFixed(3)} rad/s or stopped from ${(paces.findLast((pace) => pace > 0) ?? 0).toFixed(3)}, not eased`,
  );
  expect(
    total >= 2 * Math.PI,
    `→ held ${String(headings.length)} frames turned ${total.toFixed(3)} rad, short of a full turn`,
  );
  note(
    `→ held: turned ${total.toFixed(3)} rad at most ${fastest.toFixed(3)} rad/s`,
  );
}
