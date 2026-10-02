/**
 * Walking, `play-mushrooms.ts`'s run on a fresh meadow: `↑` held walks the
 * eye toward the clump and `↓` back to the glade's rim, eased in and out,
 * the camera bobbing only while it walks and a footstep per step; `→` held
 * turns it one way, never past `TURN_CRUISE`, all the way round, the sun
 * leaving the screen and coming back, and `←` held as long turns it back
 * onto every bed object as it stood; a sideways drag from bare ground turns
 * it with the ground under the finger and a drag down the screen walks it,
 * never faster than `STRIDE_CRUISE`, neither tapping anything, nor a drag
 * with a mushroom selected or the flower picker open on a tuft; a sideways
 * drag from the sky, and `→` held under Shift, walk it square to its heading,
 * never turning it and never past the cruise; and the screen turned keeps the
 * eye where it stood and looking where it looked. Frames of the opening, the
 * walk, the rim, a quarter and a half turn and the strafes land as
 * `walk-*.png`.
 */

import { z } from 'zod';

import { pinholeOf } from '../../src/pages/mushrooms/model/ground.ts';
import { SLOP, TURN_CRUISE } from '../../src/pages/mushrooms/model/pan.ts';
import {
  forwardOf,
  GLADE,
  RIM_KEEP,
  sidewaysOf,
  STEP_LENGTH,
  STRIDE_CRUISE,
} from '../../src/pages/mushrooms/model/stride.ts';
import { distanceOfRow } from '../../src/pages/mushrooms/model/walk.ts';
import {
  browRow,
  SHOWN_LEAST,
} from '../../src/pages/mushrooms/ui/scene/view.ts';
import {
  type Arrow,
  Camera,
  type Controls,
  type Expect,
  Eye,
  type Page,
  Point,
  Sun,
} from './mushroom-probe.ts';
import { BARE_START, playHeldDrags, TAPS } from './play-taps.ts';

const FPS = 60;
/** Frames enough for a held key's ease and a glide to come to rest. */
const SETTLE_FRAMES = 150;
/** How far over a cruise a frame's pace may run, for the float left over. */
const OVER = 1.02;
/** How near, in CSS px, a bed object back where it stood counts as there. */
const SAME_PX = 0.5;
/** The bob's depth as a share of the screen's height (`walking.ts`). */
const BOB_SHARE = 0.004;

/**
 * How much more than the sliver a sunk thing is hidden at (`SHOWN_LEAST` of
 * its drawn height) may show over the brow, in CSS px, on the
 * frame it starts or stops being drawn without that reading as a pop: a
 * frame's sink, and the play's reading of a top a little off the drawn one.
 */
const SLIVER_SLACK = 2;

/**
 * The eye, and how high on the screen each mushroom and flower drawn reaches,
 * how tall it is drawn and where across it stands, in CSS px, \`null\` where
 * it is not drawn: what a pop is read from. A flower's top is its head's, as laid out above its foot
 * and scaled with it.
 */
const WALKING = `({
  ...__probe.eye(),
  tops: Object.fromEntries([
    ...[...__probe.scene.bed.shown].map(([id, { graphics }]) => {
      if (!graphics.visible) return ['mushroom:' + id, null];
      const { x, y, width, height } = __probe.bounds(id);
      return ['mushroom:' + id, { top: y, height, x: x + width / 2 }];
    }),
    ...[...__probe.scene.flowers.shown].map(([id, shown]) => {
      const { container, headR, headY } = shown;
      if (!container.visible) return ['flower:' + id, null];
      const height = (headR - headY) * container.scaleY;
      const { x, y: top } = __probe.toScreen({ x: container.x, y: container.y - height });
      return ['flower:' + id, { top, height, x }];
    }),
  ]),
})`;
const Walking = Eye.extend({
  tops: z.record(
    z.string(),
    z.object({ top: z.number(), height: z.number(), x: z.number() }).nullable(),
  ),
});

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

/** A point in the sky with nothing drawn over it, near the middle; `null` where none is. */
const SKY_START = `(() => {
  const { layout } = __probe.scene;
  for (let row = 1; row <= 6; row++) {
    for (let column = 0; column <= 8; column++) {
      const point = {
        x: layout.width * (0.4 + (0.3 * ((column * 5) % 9)) / 8),
        y: layout.camera.groundTop * (row / 8),
      };
      if (__probe.topAt(point) === null) return point;
    }
  }
  return null;
})()`;

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

  // Toward the clump, then back to the rim.
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
  // Strafed near the middle, where the rim leaves room on either side.
  await playStrafes(page, camera, bob, expect, note);
  const strafed = await eye();
  const back = await hold('ArrowDown', FPS * 12);
  const rim = back.at(-1) ?? opening;
  checkPops(back, cover, 'ArrowDown', expect, note);
  await shoot('rim');
  checkWalk(strafed, back, bob, 'ArrowDown', expect, note);
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

  // A sideways drag from bare ground turns the eye with the ground under
  // the finger, and steps nowhere.
  const lens = pinholeOf(camera);
  const azimuth = (x: number) => (x - lens.x) / lens.arc;
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
    const slack = azimuth(lens.x + SLOP) * 1.5;
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
      // Twice the settle: a drag from the ground's top row walks over 4 units, past 2.5 s at cruise.
      const chase = await page.trace(2 * SETTLE_FRAMES, '__probe.eye()', Eye);
      checkWalk(pressed, chase, bob, 'drag', expect, note);
      expect(
        turned(pressed.heading, chase.at(-1)?.heading ?? 0) === 0,
        'a drag down the screen turned the eye',
      );
    }
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
 * A strafe: a 150 px swipe leftward from the sky, its far ground — the seam's,
 * `distanceOfRow` of `groundTop` ahead — following the finger, then `→` held
 * 1.5 s under Shift; each walks the eye square to a heading it never turns.
 * The swipe is shot at its lift and at rest, the key mid-way.
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
    const [dx, dy] = [last.x - from.x, last.y - from.y];
    const ahead = forwardOf(from.heading);
    const across = forwardOf(sidewaysOf(from.heading));
    const along = dx * ahead.x + dy * ahead.y;
    const side = dx * across.x + dy * across.y;
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

  const start = await page.evaluate(SKY_START, Point.nullable());
  if (start === null) {
    note('no bare sky to drag from: the strafing drag is not played');
  } else {
    const lens = pinholeOf(camera);
    const azimuth = (x: number) => (x - lens.x) / lens.arc;
    const reference = distanceOfRow(camera, camera.groundTop);
    const to = { ...start, x: start.x - 150 };
    /** How far the eye goes for the far ground under `from` to come to `to`'s x. */
    const aimFrom = (from: number) =>
      reference * (Math.tan(azimuth(from)) - Math.tan(azimuth(to.x)));
    const pressed = await eye();
    const frames = 12;
    await page.drag(start, to, frames);
    await page.step(1);
    await page.shoot('walk-strafe-drag-lift');
    const chase = await page.trace(FPS * 4, '__probe.eye()', Eye);
    await page.step(1);
    await page.shoot('walk-strafe-drag-rest');
    checkWalk(pressed, chase, bob, 'drag', expect, note);
    const went = checkSquare(pressed, chase, 'a drag from the sky');
    // The lock takes the far ground from where the finger crossed the slop,
    // within a frame's move past it.
    const [least, most] = [
      aimFrom(start.x - SLOP - 150 / frames),
      aimFrom(start.x),
    ];
    expect(
      went >= least * 0.98 && went <= most * 1.02,
      `a drag from the sky strafed ${went.toFixed(3)}, not the ${least.toFixed(3)}..${most.toFixed(3)} that brings the far ground under the finger`,
    );
    const across = forwardOf(sidewaysOf(pressed.heading));
    const sideAt = ({ x, y }: Seen) =>
      (x - pressed.x) * across.x + (y - pressed.y) * across.y;
    const atLift = sideAt(chase[0] ?? pressed);
    const caught = chase.findIndex((seen) => sideAt(seen) >= 0.9 * went);
    note(
      `a 150 px swipe from the sky (y ${start.y.toFixed(0)}, the far ground ${reference.toFixed(2)} ahead) strafed ${went.toFixed(3)}: ${atLift.toFixed(3)} by the lift, nine tenths ${(caught / FPS).toFixed(2)} s after it`,
    );
  }

  const keyed = await eye();
  await page.key('ArrowRight', 'keyDown', { shift: true });
  const held = await page.trace(Math.round(FPS * 0.75), WALKING, Walking);
  await page.step(1);
  await page.shoot('walk-strafe-key');
  held.push(
    await page.evaluate(WALKING, Walking),
    ...(await page.trace(Math.round(FPS * 0.75), WALKING, Walking)),
  );
  await page.key('ArrowRight', 'keyUp', { shift: true });
  held.push(...(await page.trace(SETTLE_FRAMES, WALKING, Walking)));
  checkWalk(keyed, held, bob, 'Shift+ArrowRight', expect, note);
  checkSquare(keyed, held, 'Shift+→');
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
  by: Arrow | 'drag' | `Shift+${Arrow}`,
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

/**
 * Nothing pops while the eye walks: whatever stops or starts being drawn
 * between two frames, on the frame it was drawn, reached no higher than the
 * screen's foot, or showed over `cover`, the brow's row at its x
 * (`browRow`) under which the ground covers a thing sunk past it, no more
 * than the sliver the game hides it at (`SLIVER_SLACK`).
 */
function checkPops(
  seen: ReadonlyArray<z.infer<typeof Walking>>,
  cover: (x: number) => number,
  by: Arrow,
  expect: Expect,
  note: (line: string) => void,
): void {
  const changes = seen.slice(1).flatMap((now, index) => {
    const was = seen[index];
    if (!was) return [];
    return Object.keys({ ...was.tops, ...now.tops }).flatMap((id) => {
      const [before, after] = [was.tops[id] ?? null, now.tops[id] ?? null];
      const drawn = before ?? after;
      if ((before === null) === (after === null) || !drawn) return [];
      if (drawn.top >= now.height) return [];
      const drawnOn = before === null ? now : was;
      // The tops are on the screen, which the bob scrolls; the brow is not.
      const shows = cover(drawn.x) - drawnOn.bob - drawn.top;
      return [
        {
          line: `${id} ${before === null ? 'appeared' : 'vanished'} reaching ${drawn.top.toFixed(0)} px, ${shows.toFixed(1)} of its ${drawn.height.toFixed(1)} px over the cover`,
          shows,
          popped: shows > SHOWN_LEAST * drawn.height + SLIVER_SLACK,
        },
      ];
    });
  });
  const covered = changes.filter(({ popped }) => !popped);
  const popped = changes.filter(({ popped: is }) => is);
  if (covered.length > 0) {
    note(
      `${by}: ${String(covered.length)} things came and went under the ground's cover, showing at most ${Math.max(...covered.map(({ shows }) => shows)).toFixed(1)} px over it`,
    );
  }
  expect(
    popped.length === 0,
    `${by}: things popped on screen: ${popped
      .slice(0, 6)
      .map(({ line }) => line)
      .join('; ')}`,
  );
}
