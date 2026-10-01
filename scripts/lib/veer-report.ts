/**
 * What `play-veer.ts` reads off its record (`veer-watch.ts`): the checks
 * failed through `expect` and the measures logged through `note`.
 */

import type { z } from 'zod';

import {
  bendAt,
  CLUMP_DISTANCE,
  type Pinhole,
} from '../../src/pages/mushrooms/model/ground.ts';
import type { InsectKind } from '../../src/pages/mushrooms/model/insect-genes.ts';
import { D_SEE, V_NEAR } from '../../src/pages/mushrooms/ui/scene/view.ts';
import type { Expect, Point } from './mushroom-probe.ts';
import {
  byInsect,
  byLeg,
  fading,
  hiddenRuns,
  most,
  type Sample,
  sitting,
  steps,
} from './veer-watch.ts';

export const FPS = 60;
/** The least share of its flight in a release looking back is drawn on (`insect-plane.md` R3.1). */
const DRAWN_SHARE = 0.95;
/** The most zoom a flier shows standing by a perch, through the veer's fade (R3.1's accepted ~2.4×). */
const FADE_ZOOM = 2.45;
/** Slack over the nearest mushroom's zoom at its x for jolt and landing squash. */
const ZOOM_SLACK = 1.03;
/** The least a sitter looking back is drawn at over its own size at its distance and x. */
const BACK_SIZE = 0.97;
/** The most frames a hiding counts as a blink rather than a leaving. */
const BLINK_FRAMES = 8;
/** How far from the brow, in the clump's size, a blink counts as the brow's. */
const NEAR_BROW = 2;

type Spot = z.infer<typeof Point>;
export type OnScreen = (point: Spot) => boolean;
export type Note = (line: string) => void;

const fixed = (value: number, digits = 2) => value.toFixed(digits);

/** The last frame of each insect sitting drawn on screen in `samples`. */
function lastSitters(samples: readonly Sample[], onScreen: OnScreen): Sample[] {
  return [...byInsect(samples).values()].flatMap((frames) => {
    const last = frames.findLast(
      (sample) => sitting(sample) && sample.visible && onScreen(sample),
    );
    return last ? [last] : [];
  });
}

/** Each sitter looking back drawn at no less than `BACK_SIZE` of its own size at its distance and x. */
export function satBack(
  samples: readonly Sample[],
  onScreen: OnScreen,
  lens: Pinhole,
  expect: Expect,
): void {
  for (const sample of lastSitters(samples, onScreen)) {
    const own =
      (sample.zoom * sample.distance) / CLUMP_DISTANCE / bendAt(lens, sample.x);
    expect(
      own >= BACK_SIZE,
      `looking back, ${sample.id} sits at ${fixed(sample.zoom)}× at x ${fixed(sample.x, 0)}: ${fixed(own, 3)} of its own size at its distance ${fixed(sample.distance)}`,
    );
  }
}

/** Logs each sitter's drawn zoom, its host's, and the two's ratio. */
export function sizesAt(
  when: string,
  samples: readonly Sample[],
  note: Note,
): void {
  const sitters = lastSitters(samples, () => true).toSorted(
    (a, b) => b.distance - a.distance,
  );
  note(
    `${when}: ${String(sitters.length)} sitters, far to near: ${sitters
      .map(
        (sample) =>
          `${sample.kind} on ${sample.to} at d ${fixed(sample.distance)} x ${fixed(sample.x, 0)}: ${fixed(sample.zoom)}× (host ${fixed(sample.seat?.zoom ?? Number.NaN)}×, ratio ${fixed(sample.zoom / (sample.seat?.zoom ?? Number.NaN))})`,
      )
      .join('; ')}`,
  );
}

/** A release's flight in looking back: drawn on `DRAWN_SHARE` of it, and landed drawn on screen. */
export function lookedBack(
  kind: InsectKind,
  leg: readonly Sample[],
  onScreen: OnScreen,
  expect: Expect,
  note: Note,
): void {
  const [first] = leg;
  if (!first) {
    expect(false, `looking back, the ${kind} released left no frames`);
    return;
  }
  const flight = leg.filter(
    ({ now, departs, arrives }) => now >= departs && now < arrives,
  );
  // `out` holds while a release with no open perch in view flies out by the
  // side, and clears once it is past it: every frame after the last `out`
  // is flown off screen by design.
  const lastOut = flight.findLastIndex(({ out }) => out);
  const inView = lastOut === -1 ? flight : flight.slice(0, lastOut + 1);
  const outFrames = flight.length - inView.length;
  const drawn = inView.filter(({ visible }) => visible).length;
  const share = drawn / Math.max(1, inView.length);
  const runs = hiddenRuns(flight)
    .map(
      ({ first: at, frames, out }) =>
        `${String(frames)} at frame ${String(at)}${out ? ' (out)' : ''}`,
    )
    .join(', ');
  const landed = leg.filter((sample) => sitting(sample));
  const seated = landed.filter(
    (sample) =>
      sample.visible && sample.seat?.drawn === true && onScreen(sample),
  );
  note(
    `looking back, the ${kind} released ${first.from}→${first.to}: drawn on ${String(drawn)} of ${String(inView.length)} flight frames in view, then ${String(outFrames)} flown out of view${lastOut === -1 ? '' : ' (no open perch in view: it left by the side)'}, hidden runs: ${runs || 'none'}; sat drawn on screen ${String(seated.length)} of ${String(landed.length)} frames, zoom at landing ${fixed(landed[0]?.zoom ?? Number.NaN)}×`,
  );
  expect(
    share >= DRAWN_SHARE,
    `looking back, the ${kind} released was drawn on only ${fixed(share * 100, 1)}% of its flight in`,
  );
  if (lastOut === -1 && (first.to === 'cap' || first.to === 'flower')) {
    expect(
      landed.length > 0 && seated.length === landed.length,
      `looking back, the ${kind} released sat drawn on screen on ${String(seated.length)} of ${String(landed.length)} frames`,
    );
  }
}

/** The walk into `target` hovering: its zoom never past the nearest mushroom's at its x, its span never half the screen. */
export function walkedIn(
  target: string,
  samples: readonly Sample[],
  lens: Pinhole,
  width: number,
  expect: Expect,
  note: Note,
): void {
  const own = samples.filter(({ id, visible }) => id === target && visible);
  const biggest = most(own, ({ zoom }) => zoom);
  const nearest = Math.min(...own.map(({ distance }) => distance));
  const widest = Math.max(...own.map(({ span }) => span));
  if (!biggest) {
    note(`the walk into ${target} never drew it`);
    return;
  }
  const bound =
    (CLUMP_DISTANCE / V_NEAR) * bendAt(lens, biggest.x) * ZOOM_SLACK;
  note(
    `walked into ${target} hovering: nearest ${fixed(nearest)} from the eye, zoom at most ${fixed(biggest.zoom)}× at x ${fixed(biggest.x, 0)} (bound ${fixed(bound)}, ${biggest.to} leg, flown ${fixed(biggest.flown)}), widest span ${fixed(widest, 0)} px of ${String(width)}`,
  );
  expect(
    fading(biggest) ? biggest.zoom <= FADE_ZOOM : biggest.zoom <= bound,
    `walking into ${target}, it was drawn at ${fixed(biggest.zoom)}×, past ${fixed(bound)}`,
  );
  expect(
    widest <= width / 2,
    `walking into ${target}, it spanned ${fixed(widest, 0)} px`,
  );
}

/** The most zoom over the run, by a perch's fade and elsewhere, against R3.1's bounds. */
export function zooms(
  samples: readonly Sample[],
  lens: Pinhole,
  expect: Expect,
  note: Note,
): void {
  const flying = samples.filter(
    (sample) =>
      sample.visible &&
      sample.now >= sample.departs &&
      sample.now < sample.arrives,
  );
  const fade = most(
    flying.filter((sample) => fading(sample)),
    ({ zoom }) => zoom,
  );
  const free = most(
    flying.filter((sample) => !fading(sample)),
    ({ zoom, x }) => zoom / bendAt(lens, x),
  );
  const seated = most(
    samples.filter((sample) => sample.visible && sitting(sample)),
    ({ zoom }) => zoom,
  );
  const line = (sample: Sample | undefined) =>
    sample
      ? `${fixed(sample.zoom)}× (${sample.kind} ${sample.id} ${sample.from}→${sample.to}, d ${fixed(sample.distance)}, x ${fixed(sample.x, 0)}, heading ${fixed(sample.heading)})`
      : 'none';
  note(
    `most zoom: by a perch's fade ${line(fade)}; elsewhere in flight ${line(free)}; sitting ${line(seated)}`,
  );
  expect(
    (fade?.zoom ?? 0) <= FADE_ZOOM,
    `a flier by a perch was drawn at ${fixed(fade?.zoom ?? 0)}×`,
  );
  if (free) {
    const bound = (CLUMP_DISTANCE / V_NEAR) * bendAt(lens, free.x) * ZOOM_SLACK;
    expect(
      free.zoom <= bound,
      `a flier was drawn at ${fixed(free.zoom)}× at x ${fixed(free.x, 0)}, past ${fixed(bound)}`,
    );
  }
}

/** Each fly leg flown whole: its pace in butterfly sizes a second as drawn, and how far it had flown a fifth of the way in. */
export function pace(
  samples: readonly Sample[],
  butterfly: number,
  note: Note,
): void {
  const legs = [
    ...byLeg(samples.filter(({ kind }) => kind === 'fly')).values(),
  ].flatMap((leg) => {
    const flight = leg.filter(
      ({ now, departs, arrives }) => now >= departs && now <= arrives,
    );
    const [first] = flight;
    const last = flight.at(-1);
    if (
      !first ||
      !last ||
      first.from === 'away' ||
      first.now - first.departs > 40 ||
      first.arrives - last.now > 40
    ) {
      return [];
    }
    const moves = steps(flight);
    let sizes = 0;
    for (const { step, at } of moves) sizes += step / (butterfly * at.zoom);
    const fastest = Math.max(
      0,
      ...moves.map(({ step, at }) => (step * FPS) / (butterfly * at.zoom)),
    );
    const time = (first.arrives - first.departs) / 1000;
    const fifth = flight.find(
      ({ now }) => now >= first.departs + 0.2 * time * 1000,
    );
    return [
      {
        first,
        time,
        cruise: sizes / time,
        fastest,
        fifth: fifth?.flown ?? Number.NaN,
        drawn: moves.length / flight.length,
      },
    ];
  });
  const sorted = legs.toSorted((a, b) => b.time - a.time);
  note(
    `fly legs flown whole: ${String(legs.length)}; longest first: ${sorted
      .slice(0, 6)
      .map(
        ({ first, time, cruise, fastest, fifth, drawn }) =>
          `${first.from}→${first.to} ${fixed(time)} s at ${fixed(cruise, 1)} sizes/s (fastest frame ${fixed(fastest, 1)}), ${fixed(fifth)} flown a fifth in, drawn ${fixed(drawn * 100, 0)}%`,
      )
      .join('; ')}`,
  );
}

/** One-frame drawn steps past a twentieth of the screen's width, per kind, and the worst. */
export function flicks(
  samples: readonly Sample[],
  width: number,
  note: Note,
): void {
  const over = [...byInsect(samples).values()].flatMap((frames) =>
    steps(frames).filter(({ step }) => step > width / 20),
  );
  const worst = most(over, ({ step }) => step);
  const counts = ['butterfly', 'fly', 'bee']
    .map(
      (kind) =>
        [kind, over.filter(({ at }) => at.kind === kind).length] as const,
    )
    .filter(([, count]) => count > 0)
    .map(([kind, count]) => `${kind} ${String(count)}`)
    .join(', ');
  note(
    `one-frame steps over ${fixed(width / 20, 0)} px: ${counts || 'none'}${worst ? `; worst ${fixed(worst.step, 0)} px, ${worst.at.kind} ${worst.at.id} ${worst.at.from}→${worst.at.to} flown ${fixed(worst.at.flown)} d ${fixed(worst.at.distance)} heading ${fixed(worst.at.heading)}` : ''}`,
  );
}

/** Short hidings of an insect drawn on screen on either side of them, the brow's among them. */
export function blinks(
  samples: readonly Sample[],
  onScreen: OnScreen,
  note: Note,
): void {
  const found = [...byInsect(samples).values()].flatMap((frames) =>
    hiddenRuns(frames).flatMap(({ first, frames: length, before, out }) => {
      const after = frames[first + length];
      if (!before || after?.visible !== true || out || length > BLINK_FRAMES)
        return [];
      if (!onScreen(before) || !onScreen(after)) return [];
      return [{ before, after, length }];
    }),
  );
  const atBrow = found.filter(
    ({ before }) => Math.abs(before.distance - D_SEE) <= NEAR_BROW,
  );
  note(
    `blinks while turning: ${String(found.length)} (${String(atBrow.length)} by the brow, ${fixed(D_SEE)} out)${found
      .slice(0, 6)
      .map(
        ({ before, after, length }) =>
          `; ${before.kind} ${before.id} ${String(length)} frames at heading ${fixed(before.heading)}, d ${fixed(before.distance)}, (${fixed(before.x, 0)}, ${fixed(before.y, 0)}) → (${fixed(after.x, 0)}, ${fixed(after.y, 0)}), ${before.to} leg flown ${fixed(before.flown)}`,
      )
      .join('')}`,
  );
}
