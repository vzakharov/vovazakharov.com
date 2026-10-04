/**
 * The measuring half of `play-walk.ts`: a walk, a turn and the things drawn
 * along it read frame by frame, and checked against the cruise, the ease,
 * the bob, the footsteps and the brow's cover.
 */

import { z } from 'zod';

import { wrap } from '../../src/pages/mushrooms/model/geometry.ts';
import { KEY_EASE, TURN_CRUISE } from '../../src/pages/mushrooms/model/pan.ts';
import {
  forwardOf,
  sidewaysOf,
  STEP_LENGTH,
  STRIDE_CRUISE,
  STRIDE_FLING_FASTEST,
} from '../../src/pages/mushrooms/model/stride.ts';
import { SHOWN_LEAST } from '../../src/pages/mushrooms/ui/scene/view.ts';
import { Eye, type Point } from './mushroom-probe-answers.ts';
import type { Arrow, Expect, Strafe } from './mushroom-probe-drive.ts';

export const FPS = 60;
/** How far over a cruise a frame's pace may run, for the float left over. */
export const OVER = 1.02;

/**
 * How much more than the sliver a sunk thing is hidden at (`SHOWN_LEAST` of
 * its drawn height) may show over the brow, in CSS px, on the frame it
 * starts or stops being drawn without reading as a pop: a frame's sink, and
 * the play's reading of a top a little off the drawn one.
 */
const SLIVER_SLACK = 2;

/**
 * The eye, and how high on the screen each mushroom and flower drawn reaches,
 * how tall it is drawn and where across it stands, in CSS px, `null` where
 * it is not drawn: what a pop is read from. A flower's top is its head's.
 */
export const WALKING = `({
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
export const Walking = Eye.extend({
  tops: z.record(
    z.string(),
    z.object({ top: z.number(), height: z.number(), x: z.number() }).nullable(),
  ),
});

export type Seen = z.infer<typeof Eye>;

/** The heading's change from `from` to `to`, the short way round. */
export function turned(from: number, to: number): number {
  return wrap(to - from);
}

/**
 * A walk frame by frame, `seen`, from where it stood at `from`: never past
 * `STRIDE_CRUISE`, eased in where a key starts it. A drag's first `down`
 * frames are the finger's, the eye walking after it in steps, never past the
 * cruise either; from the lift on it runs never past `STRIDE_FLING_FASTEST`
 * and only ever slows, as its fling does, its first frame after the lift
 * carrying the lift's own. The bob within `[−bob, 0]`, down while it walks
 * and 0 once it rests, and a footstep per `STEP_LENGTH` walked, ±1.
 */
export function checkWalk(
  from: Seen,
  seen: readonly Seen[],
  bob: number,
  by: Arrow | Strafe | 'drag',
  expect: Expect,
  note: (line: string) => void,
  down = 0,
): void {
  const last = seen.at(-1);
  if (!last) return;
  const paces = seen.map((now, index) => {
    const was = seen[index - 1] ?? from;
    return Math.hypot(now.x - was.x, now.y - was.y) * FPS;
  });
  const pressed = by === 'drag' ? paces.slice(0, down) : paces;
  const lifted = paces.slice(down + 1);
  const fastest = Math.max(...pressed);
  expect(
    fastest <= STRIDE_CRUISE * OVER,
    `${by}: walked at ${fastest.toFixed(3)} units/s${by === 'drag' ? ' while the finger was down' : ''}, past the cruise ${String(STRIDE_CRUISE)}`,
  );
  if (by === 'drag') {
    const flung = Math.max(...lifted);
    expect(
      flung <= STRIDE_FLING_FASTEST * OVER,
      `${by}: walked at ${flung.toFixed(3)} units/s after the lift, past the fling ${String(STRIDE_FLING_FASTEST)}`,
    );
    const rose = lifted.findIndex(
      (pace, index) =>
        index > 0 && pace > (lifted[index - 1] ?? 0) * OVER + 1e-6,
    );
    expect(
      rose === -1,
      `${by}: sped up ${String(rose + 1)} frames after the lift, on its fling`,
    );
  } else {
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

/** How long `↓` is held walking back, in seconds. */
export const BACK_HELD = 12;
/** How far off its cruise's reckoning, in units, the walk back may land. */
const BACK_SLACK = 0.05;

/** How far the eye went from `from` to `to` along `heading`, in plane units. */
export function goneAlong(
  from: z.infer<typeof Point>,
  to: z.infer<typeof Point>,
  heading: number,
): number {
  const way = forwardOf(heading);
  return (to.x - from.x) * way.x + (to.y - from.y) * way.y;
}

/**
 * `↓` held `BACK_HELD` s from `from`, `seen` frame by frame to rest: straight
 * back, short at the let-go by the half of `KEY_EASE` the ease in costs and
 * full at rest, the glide out giving it back, `BACK_SLACK` either way.
 */
export function checkBack(
  from: Seen,
  seen: readonly Seen[],
  expect: Expect,
  note: (line: string) => void,
): void {
  const backOf = (to: Seen) => goneAlong(from, to, from.heading + Math.PI);
  const [letGo, rest] = [seen[FPS * BACK_HELD - 1], seen.at(-1)];
  if (!letGo || !rest) return;
  const eased = KEY_EASE / 2;
  const reckoned = [
    ['at the let-go', backOf(letGo), STRIDE_CRUISE * (BACK_HELD - eased)],
    ['at rest', backOf(rest), STRIDE_CRUISE * BACK_HELD],
  ] as const;
  for (const [when, went, want] of reckoned) {
    expect(
      Math.abs(went - want) <= BACK_SLACK,
      `↓ held ${String(BACK_HELD)} s walked back ${went.toFixed(3)} units ${when}, not ${want.toFixed(3)} ±${String(BACK_SLACK)}`,
    );
  }
  const off = Math.abs(goneAlong(from, rest, sidewaysOf(from.heading)));
  expect(
    off <= BACK_SLACK,
    `↓ held ${String(BACK_HELD)} s strayed ${off.toFixed(3)} units off straight back`,
  );
  note(
    `↓ held ${String(BACK_HELD)} s walked back ${reckoned.map(([when, went, want]) => `${went.toFixed(3)} ${when} (reckoned ${want.toFixed(3)})`).join(', ')}`,
  );
}

/** A turn on a held key frame by frame: one way only, never past `TURN_CRUISE`, eased in and out. */
export function checkTurn(
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
 * Nothing pops while the eye walks: whatever starts or stops being drawn
 * between two frames reached, on the frame it was drawn, no higher than the
 * screen's foot, stood a drawn height past a side (`SIDE_OVERHANG`), or showed
 * over `cover`, the brow's row at its x (`browRow`), no more than the sliver
 * the game hides it at (`SLIVER_SLACK`).
 */
export function checkPops(
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
      if (drawn.x < -drawn.height || drawn.x > now.width + drawn.height) {
        return [];
      }
      const drawnOn = before === null ? now : was;
      // The tops are on the screen, which the bob scrolls; the brow is not.
      const shows = cover(drawn.x) - drawnOn.bob - drawn.top;
      return [
        {
          line: `${id} ${before === null ? 'appeared' : 'vanished'} reaching ${drawn.top.toFixed(0)} px at x ${drawn.x.toFixed(0)}, ${shows.toFixed(1)} of its ${drawn.height.toFixed(1)} px over the cover`,
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
