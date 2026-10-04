/**
 * Walking, `play-mushrooms.ts`'s run on a fresh meadow: `↑` held walks the
 * eye toward the clump and `↓` held 12 s walks it back `STRIDE_CRUISE` a
 * second, eased in and out, the field having no edge to stop it, the camera
 * bobbing only while it walks and a footstep per step; `→` held turns it one
 * way, never past `TURN_CRUISE`, all the way round, the sun leaving the screen
 * and coming back, and `←` held as long turns it back onto every bed object
 * as it stood; a sideways drag from the sky turns it with the azimuth under
 * the finger and a drag down the screen walks it in steps, never past the
 * cruise while the finger is down and flung on past the lift, a quick swipe
 * from the horizon only a few steps, none tapping anything, nor a drag with
 * a mushroom selected or the flower picker open on a tuft; a sideways drag
 * from bare ground, the same way, and `c` held, never past the cruise, walk
 * it square to its heading, never turning it; and the screen turned keeps the eye where it stood and looking where it
 * looked. Frames of the opening, the walk, the walk back, a quarter and a
 * half turn and the strafes land as `walk-*.png`.
 */

import { z } from 'zod';

import { GLIDE_TAU } from '../../src/pages/mushrooms/model/glide.ts';
import { SLOP, TURN_CRUISE } from '../../src/pages/mushrooms/model/pan.ts';
import {
  pinholeOf,
  planeSeen,
} from '../../src/pages/mushrooms/model/pinhole.ts';
import {
  sidewaysOf,
  STRIDE_FLING_FASTEST,
} from '../../src/pages/mushrooms/model/stride.ts';
import { cloudAt } from '../../src/pages/mushrooms/ui/scene/rain-sky.ts';
import { browRow } from '../../src/pages/mushrooms/ui/scene/view.ts';
import {
  Camera,
  type Controls,
  Eye,
  Point,
  Sun,
} from './mushroom-probe-answers.ts';
import type { Arrow, Expect, Page } from './mushroom-probe-drive.ts';
import { BARE_START, playHeldDrags, TAPS } from './play-taps.ts';
import {
  BACK_HELD,
  checkBack,
  checkPops,
  checkTurn,
  checkWalk,
  FPS,
  goneAlong,
  type Seen,
  turned,
  WALKING,
  Walking,
} from './play-walk-checks.ts';
import { playHorizonSwipe } from './play-walk-swipe.ts';

/** Frames enough for a held key's ease and a glide to come to rest. */
const SETTLE_FRAMES = 150;
/** How near, in CSS px, a bed object back where it stood counts as there. */
const SAME_PX = 0.5;
/** The bob's depth as a share of the screen's height (`walking.ts`). */
const BOB_SHARE = 0.004;
/** Moves a drag's finger makes, a frame each, from its press to its lift. */
const DRAG_MOVES = 12;

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

/**
 * The points in the sky with nothing drawn over them, near the middle, in
 * the order a drag would try them, and the clouds as a tap finds them.
 */
const SKY = `(() => {
  const { layout, rain } = __probe.scene;
  const points = [];
  for (let row = 1; row <= 6; row++) {
    for (let column = 0; column <= 8; column++) {
      const point = {
        x: layout.width * (0.4 + (0.3 * ((column * 5) % 9)) / 8),
        y: layout.camera.groundTop * (row / 8),
      };
      if (__probe.topAt(point) === null) points.push(point);
    }
  }
  return { points, clouds: rain.placed().map((cloud) => cloud ?? null) };
})()`;
const Sky = z.object({
  points: z.array(Point),
  clouds: z.array(Point.extend({ r: z.number() }).nullable()),
});

/**
 * A point in the sky a drag can start from: nothing drawn over it and no
 * cloud, whose tap would start a shower; `undefined` where none is.
 */
async function skyStart(
  page: Page,
): Promise<z.infer<typeof Point> | undefined> {
  const { points, clouds } = await page.evaluate(SKY, Sky);
  const placed = clouds.map((cloud) => cloud ?? undefined);
  return points.find((point) => cloudAt(point, placed) === undefined);
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
  controls: z.infer<typeof Controls>,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const eye = async () => page.evaluate('__probe.eye()', Eye);
  const taps = async () => page.evaluate(TAPS, z.string());
  /** `key` held `frames` frames and let go, then left to settle: the eye frame by frame throughout. */
  const hold = async (key: Arrow, frames: number) => {
    await page.key(key, 'keyDown');
    const held = await page.trace(frames, WALKING, Walking);
    await page.key(key, 'keyUp');
    const after = await page.trace(SETTLE_FRAMES, WALKING, Walking);
    return [...held, ...after];
  };
  const shoot = async (name: string) => {
    await page.step(1);
    await page.shoot(`walk-${name}`);
  };

  const opening = await eye();
  const bob = BOB_SHARE * opening.height;
  const camera = await page.evaluate('__probe.scene.layout.camera', Camera);
  const cover = (x: number) => browRow(camera, x);
  await shoot('opening');
  const tapsBefore = await taps();

  // Toward the clump, then back.
  await page.key('ArrowUp', 'keyDown');
  const ahead = await page.trace(Math.round(FPS * 1.2), WALKING, Walking);
  await shoot('forward');
  ahead.push(
    await page.evaluate(WALKING, Walking),
    ...(await page.trace(Math.round(FPS * 1.3), WALKING, Walking)),
  );
  await page.key('ArrowUp', 'keyUp');
  ahead.push(...(await page.trace(SETTLE_FRAMES, WALKING, Walking)));
  await shoot('near');
  checkWalk(opening, ahead, bob, 'ArrowUp', expect, note);
  checkPops(ahead, cover, 'ArrowUp', expect, note);
  // Strafed near the clump.
  await playStrafes(page, camera, bob, expect, note);
  const strafed = await eye();
  const back = await hold('ArrowDown', FPS * BACK_HELD);
  const rested = back.at(-1) ?? opening;
  checkPops(back, cover, 'ArrowDown', expect, note);
  await shoot('back');
  checkWalk(strafed, back, bob, 'ArrowDown', expect, note);
  checkBack(strafed, back, expect, note);

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
  checkTurn(
    [rested.heading, ...round.map(([heading]) => heading)],
    expect,
    note,
  );
  // The turn runs a little past a full one, which on a narrow view can carry
  // the sun off again: it has only to come back once.
  const sunGone = round.findIndex(([, sun]) => sun === null);
  const sunBack = round.findIndex(
    ([, sun], index) => index > sunGone && sun !== null,
  );
  expect(
    sunFrom !== null && sunGone !== -1 && sunBack !== -1,
    `a full turn on → did not carry the sun off the screen and back (opening ${String(sunFrom)}, gone at frame ${String(sunGone)}, back at ${String(sunBack)})`,
  );
  note(
    `the sun left the screen at frame ${String(sunGone)} of the turn and came back at ${String(sunBack)}`,
  );
  await hold('ArrowLeft', full);
  const returned = moved(beds, await page.evaluate(BEDS, Beds));
  expect(
    returned <= SAME_PX,
    `→ then ← held as long left a bed object ${returned.toFixed(2)} px from where it stood`,
  );

  // A sideways drag from the sky turns the eye with the azimuth under the
  // finger, and steps nowhere.
  const lens = pinholeOf(camera);
  const azimuth = (x: number) => (x - lens.x) / lens.arc;
  const start = await skyStart(page);
  if (start === undefined) {
    note('no bare sky to drag from: the drags are not played');
  } else {
    const before = await eye();
    const to = { ...start, x: start.x - 0.3 * before.width };
    await page.drag(start, to, DRAG_MOVES);
    const lifted = await eye();
    const want = azimuth(start.x) - azimuth(to.x);
    const got = turned(before.heading, lifted.heading);
    const slack = azimuth(lens.x + SLOP) * 1.5;
    expect(
      Math.abs(got - want) <= slack,
      `a sideways drag from the sky turned the eye ${got.toFixed(4)} rad, not the ${want.toFixed(4)} that keeps the azimuth under the finger`,
    );
    expect(
      lifted.x === before.x && lifted.y === before.y,
      `a sideways drag from the sky stepped the eye from (${before.x.toFixed(3)}, ${before.y.toFixed(3)}) to (${lifted.x.toFixed(3)}, ${lifted.y.toFixed(3)})`,
    );
    await page.step(SETTLE_FRAMES);
    note(
      `a sideways drag from the sky turned ${got.toFixed(3)} rad at the lift (${want.toFixed(3)} keeps the azimuth), ${turned(before.heading, (await eye()).heading).toFixed(3)} after its glide`,
    );

    // A drag down the screen pulls the ground toward the eye: it walks.
    const from = await page.evaluate(BARE_START, Point.nullable());
    if (from !== null) {
      const down = {
        ...from,
        y: Math.min(before.height - 4, from.y + 0.25 * before.height),
      };
      const pressed = await eye();
      const held = await page.dragTraced(
        from,
        down,
        DRAG_MOVES,
        '__probe.eye()',
        Eye,
      );
      const chase = await page.trace(SETTLE_FRAMES, '__probe.eye()', Eye);
      checkWalk(
        pressed,
        [...held, ...chase],
        bob,
        'drag',
        expect,
        note,
        DRAG_MOVES,
      );
      expect(
        turned(pressed.heading, chase.at(-1)?.heading ?? 0) === 0,
        'a drag down the screen turned the eye',
      );
    }
    await playHorizonSwipe(page, expect, note);
  }
  expect(
    (await taps()) === tapsBefore,
    'walking, turning and strafing tapped something',
  );
  await playHeldDrags(page, controls, expect, note);

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
 * A strafe: a swipe leftward from bare ground, 150 px or to the screen's
 * edge, whichever is nearer, since a finger past the edge goes unread — the
 * eye walking after the finger and flung on from its lift — then
 * `c` held 1.5 s; each walks the eye square to a heading it never
 * turns. The swipe is shot at its lift and at rest, the key mid-way.
 */
async function playStrafes(
  page: Page,
  camera: z.infer<typeof Camera>,
  bob: number,
  expect: Expect,
  note: (line: string) => void,
): Promise<void> {
  const eye = async () => page.evaluate('__probe.eye()', Eye);
  /** `seen` from `from`: square to the heading, which holds, and walked `by`'s way. */
  const checkSquare = (from: Seen, seen: readonly Seen[], by: string) => {
    const last = seen.at(-1) ?? from;
    const along = goneAlong(from, last, from.heading);
    const side = goneAlong(from, last, sidewaysOf(from.heading));
    const turnedMost = Math.max(
      ...seen.map(({ heading }) => Math.abs(turned(from.heading, heading))),
    );
    expect(
      turnedMost < 1e-9,
      `${by}: strafing turned the eye ${turnedMost.toFixed(6)} rad`,
    );
    expect(
      side > 0 && Math.abs(along) <= 0.02 * side,
      `${by}: walked ${side.toFixed(3)} rightward and ${along.toFixed(3)} on, not square to the heading`,
    );
    return side;
  };

  const start = await page.evaluate(BARE_START, Point.nullable());
  if (start === null) {
    note('no bare ground to drag from: the strafing drag is not played');
  } else {
    const lens = pinholeOf(camera);
    const azimuth = (x: number) => (x - lens.x) / lens.arc;
    const swipe = Math.min(150, start.x - 1);
    const to = { ...start, x: start.x - swipe };
    const pressed = await eye();
    /** How far straight ahead the ground under the finger at `from` stands. */
    const aheadOf = (from: number) => {
      const under = planeSeen(camera, pressed, { ...start, x: from });
      if (!under)
        throw new Error(
          `no ground under (${String(from)}, ${String(start.y)})`,
        );
      return goneAlong(pressed, under, pressed.heading);
    };
    const frames = DRAG_MOVES;
    const down = await page.dragTraced(start, to, frames, '__probe.eye()', Eye);
    await page.step(1);
    await page.shoot('walk-strafe-drag-lift');
    const chase = await page.trace(FPS * 4, '__probe.eye()', Eye);
    await page.step(1);
    await page.shoot('walk-strafe-drag-rest');
    checkWalk(pressed, [...down, ...chase], bob, 'drag', expect, note, frames);
    const went = checkSquare(
      pressed,
      [...down, ...chase],
      'a drag from the ground',
    );
    const sideAt = (seen: Seen) =>
      goneAlong(pressed, seen, sidewaysOf(pressed.heading));
    const lifted = down.at(-1) ?? pressed;
    const atLift = sideAt(lifted);
    // The lift flings the eye on from the finger's last frame, the lock
    // measuring the ground from where it crossed the slop, no faster than the
    // fling's most.
    const ahead = aheadOf(start.x - SLOP);
    const finger =
      ahead *
      (Math.tan(azimuth(to.x + swipe / frames)) - Math.tan(azimuth(to.x))) *
      FPS;
    const carry = Math.min(STRIDE_FLING_FASTEST, finger) * GLIDE_TAU;
    const flung = went - atLift;
    expect(
      flung >= carry * 0.8 && flung <= carry * 1.02,
      `a quick swipe from the ground flung the eye on ${flung.toFixed(3)}, not the ${(carry * 0.8).toFixed(3)}..${carry.toFixed(3)} its ${finger.toFixed(2)} units/s carries`,
    );
    const caught = chase.findIndex((seen) => sideAt(seen) >= 0.9 * went);
    expect(
      caught / FPS <= 1,
      `a quick swipe from the ground took ${(caught / FPS).toFixed(2)} s to glide nine tenths of its way`,
    );
    note(
      `a ${swipe.toFixed(0)} px swipe from the ground (y ${start.y.toFixed(0)}, ${ahead.toFixed(2)} ahead, the finger at ${finger.toFixed(2)} units/s) strafed ${went.toFixed(3)}: ${atLift.toFixed(3)} by the lift, ${flung.toFixed(3)} flung, nine tenths ${(caught / FPS).toFixed(2)} s after it`,
    );
  }

  const keyed = await eye();
  await page.key('KeyC', 'keyDown');
  const held = await page.trace(Math.round(FPS * 0.75), WALKING, Walking);
  await page.step(1);
  await page.shoot('walk-strafe-key');
  held.push(
    await page.evaluate(WALKING, Walking),
    ...(await page.trace(Math.round(FPS * 0.75), WALKING, Walking)),
  );
  await page.key('KeyC', 'keyUp');
  held.push(...(await page.trace(SETTLE_FRAMES, WALKING, Walking)));
  checkWalk(keyed, held, bob, 'KeyC', expect, note);
  checkSquare(keyed, held, 'c');
}
