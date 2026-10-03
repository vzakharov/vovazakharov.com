/**
 * A frame-by-frame record of every insect as drawn, installed in the page
 * `play-veer.ts` plays, and what the play reads off it. Like
 * `flier-watch.ts`, it wraps the insect view's `update`, so every frame
 * stepped is recorded, drawn or not, and reaches into the scene's fields by
 * name. A record is taken (`__veer.take()`) and cleared as the play goes.
 */

import { z } from 'zod';

import { wrap } from '../../src/pages/mushrooms/model/geometry.ts';
import { INSECT_KINDS } from '../../src/pages/mushrooms/model/insect-genes.ts';
import { LANDING } from '../../src/pages/mushrooms/model/insect-motion.ts';
import { TURN_CRUISE } from '../../src/pages/mushrooms/model/pan.ts';
import { SEAT_FADE } from '../../src/pages/mushrooms/ui/scene/insect-frame.ts';

export const FPS = 60;
/** The most a frame's heading moves under a held turn, with margin for the turn's own jolt. */
const TURN_STEP = (1.5 * TURN_CRUISE) / FPS;

/** Installs `window.__veer`, fed by the insect view every frame. */
export const VEER = `(() => {
  const scene = window.__game.scene.scenes[0];
  const view = scene.insects;
  const fly = view.update.bind(view);
  const veer = { samples: [], frame: 0 };
  const seatKinds = ['cap', 'flower'];
  view.update = (t, perchAt) => {
    fly(t, perchAt);
    veer.frame += 1;
    const now = t * 1000;
    const { eye } = view.view();
    for (const flier of scene.meadow.insects) {
      const shown = view.shown.get(flier.id);
      if (!shown) continue;
      const { leg } = flier;
      const { container, drawn } = shown;
      const place = seatKinds.includes(leg.to.kind) ? perchAt(leg.to, flier) : undefined;
      const seat = place && 'on' in place ? place : undefined;
      veer.samples.push({
        frame: veer.frame,
        now,
        heading: eye.heading,
        eyeX: eye.x,
        eyeY: eye.y,
        id: flier.id,
        kind: flier.kind,
        legs: flier.legs,
        from: leg.from.kind,
        to: leg.to.kind,
        departs: leg.departs,
        arrives: leg.arrives,
        visible: container.visible,
        x: container.x,
        y: container.y,
        zoom: container.scaleX,
        span: shown.span * container.scaleX,
        flown: shown.flown,
        lifted: shown.steering.setOff?.turns.lifted ?? null,
        distance: Math.hypot(drawn.x - eye.x, drawn.y - eye.y),
        out: shown.out !== undefined,
        seat: seat
          ? {
              zoom: seat.on.stands.zoom,
              distance: seat.on.stands.distance,
              drawn: seat.on.stands.drawn,
              x: seat.drawn.x,
              y: seat.drawn.y,
            }
          : null,
      });
    }
  };
  veer.take = () => {
    const taken = veer.samples;
    veer.samples = [];
    return taken;
  };
  window.__veer = veer;
})()`;

const Kind = z.enum(INSECT_KINDS);
export const Sample = z.object({
  frame: z.number(),
  now: z.number(),
  heading: z.number(),
  /** Where the eye stood on the plane, in the clump's size. */
  eyeX: z.number(),
  eyeY: z.number(),
  id: z.string(),
  kind: Kind,
  legs: z.number(),
  from: z.string(),
  to: z.string(),
  departs: z.number(),
  arrives: z.number(),
  visible: z.boolean(),
  /** Where it was drawn last, in CSS px: stale while hidden. */
  x: z.number(),
  y: z.number(),
  /** Its drawn scale, jolt and landing squash included: its zoom over its size at the clump. */
  zoom: z.number(),
  span: z.number(),
  flown: z.number(),
  /** How far round from its heading it sat as its leg set off, in radians (`Turns.lifted`): `null` before its leg's first steered frame. */
  lifted: z.number().nullable(),
  /** How far its drawn point stands from the eye on the plane, in the clump's size. */
  distance: z.number(),
  /** Whether it is flying out of view past the side, hidden by design. */
  out: z.boolean(),
  /** The seat its leg ends on, as its host draws it this frame. */
  seat: z
    .object({
      zoom: z.number(),
      distance: z.number(),
      drawn: z.boolean(),
      x: z.number(),
      y: z.number(),
    })
    .nullable(),
});
export type Sample = z.infer<typeof Sample>;
export const Samples = z.array(Sample);

const SEATS = new Set(['cap', 'flower']);

/** Whether `sample` sits on its seat, its landing done. */
export function sitting(sample: Sample): boolean {
  return SEATS.has(sample.to) && sample.now >= sample.arrives + LANDING;
}

/** Whether `sample` falls within its leg's flight: departed, not yet arrived. */
export function inFlight({ now, departs, arrives }: Sample): boolean {
  return now >= departs && now < arrives;
}

/** Whether `sample` flies the stretch by a seat its veer fades out over. */
export function fading(sample: Sample): boolean {
  return (
    inFlight(sample) &&
    ((SEATS.has(sample.to) && sample.flown >= 1 - SEAT_FADE) ||
      (SEATS.has(sample.from) && sample.flown <= SEAT_FADE))
  );
}

/** `samples` by insect and leg, each in frame order. */
export function byLeg(samples: readonly Sample[]): Map<string, Sample[]> {
  const legs = new Map<string, Sample[]>();
  for (const sample of samples) {
    const key = `${sample.id}#${String(sample.legs)}`;
    legs.set(key, [...(legs.get(key) ?? []), sample]);
  }
  return legs;
}

/** `samples` by insect, each in frame order. */
export function byInsect(samples: readonly Sample[]): Map<string, Sample[]> {
  const insects = new Map<string, Sample[]>();
  for (const sample of samples) {
    insects.set(sample.id, [...(insects.get(sample.id) ?? []), sample]);
  }
  return insects;
}

/** A run of frames an insect was hidden: the index of its first, how many, and how it stood at the frame before. */
export type Hidden = {
  first: number;
  frames: number;
  before: Sample | undefined;
  out: boolean;
};

/** Every run of hidden frames in `seen`, one insect's frames in order. */
export function hiddenRuns(seen: readonly Sample[]): Hidden[] {
  const runs: Hidden[] = [];
  for (const [index, sample] of seen.entries()) {
    if (sample.visible) continue;
    const { out } = sample;
    const last = runs.at(-1);
    const previous = seen[index - 1];
    if (last && previous && !previous.visible) {
      last.frames += 1;
      last.out ||= out;
      continue;
    }
    runs.push({ first: index, frames: 1, before: previous, out });
  }
  return runs;
}

/**
 * Why the drawn move from `was` to `at` is not the insect's own: the eye
 * turned more than a held turn turns it in a frame, since a heading set
 * outright (the play's `face`) slides every insect across the screen at
 * once; or the eye walked, which shifts every insect drawn by the eye's own
 * motion. `undefined` where the eye stood or only turned as a held key does.
 */
function eyeMoved(was: Sample, at: Sample): 'turned' | 'walked' | undefined {
  if (Math.abs(wrap(at.heading - was.heading)) > TURN_STEP) {
    return 'turned';
  }
  return at.eyeX === was.eyeX && at.eyeY === was.eyeY ? undefined : 'walked';
}

/** Each pair of frames on which an insect is drawn on the same leg, and how the eye moved between them. */
function drawnPairs(seen: readonly Sample[]) {
  return seen.slice(1).flatMap((at, index) => {
    const was = seen[index];
    if (was?.visible !== true || !at.visible || was.legs !== at.legs) return [];
    return [{ was, at, eye: eyeMoved(was, at) }];
  });
}

/**
 * A frame's drawn step, in CSS px, for an insect drawn on both frames of the
 * same leg with the eye standing or turning no more than a held turn does
 * (`eyeMoved`), and how long the frame took, in ms: a frame the browser ran
 * late moves it as far as the time it spans. A held turn slides everything
 * drawn across by `arc` px to the radian it turns (`pinhole.ts`'s `viewOf`),
 * so that slide is taken out and the step is the insect's own.
 */
export function steps(
  seen: readonly Sample[],
  arc: number,
): Array<{ step: number; at: Sample; time: number }> {
  return drawnPairs(seen).flatMap(({ was, at, eye }) =>
    eye
      ? []
      : [
          {
            step: Math.hypot(
              at.x - was.x + arc * wrap(at.heading - was.heading),
              at.y - was.y,
            ),
            at,
            time: at.now - was.now,
          },
        ],
  );
}

/** How many of `seen`'s drawn frames `steps` leaves out because the eye walked. */
export function walkedSteps(seen: readonly Sample[]): number {
  return drawnPairs(seen).filter(({ eye }) => eye === 'walked').length;
}

/** The item in `items` with the largest `of`, `undefined` for none. */
export function most<T>(
  items: readonly T[],
  of: (item: T) => number,
): T | undefined {
  let best: T | undefined;
  for (const item of items) {
    if (best === undefined || of(item) > of(best)) best = item;
  }
  return best;
}
