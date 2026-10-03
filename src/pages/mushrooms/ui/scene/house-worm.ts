import type { Point } from '../../model/geometry';
import { windowSlots } from '../../model/house';
import type { Looking, TapTimed } from '../../model/motion';
import type { MushroomGenes } from '../../model/mushroom-genes';
import { toCanvas } from '../../model/mushroom-outline';
import { capFrame } from '../../model/mushroom-pose';
import {
  pathLength,
  peekPath,
  type TripPhase,
  wormBody,
  wormPath,
  wormPeek,
  type WormPose,
  wormTarget,
  wormTrip,
} from '../../model/worm';
import { type ShownWorm, wormGirth } from './draw-worm';
import type { MeadowSound } from './sound';

/**
 * A worm's trip, fixed at the tap that called it out of window `source`: to
 * window `target` along `path`, `travel` long, or a peek with none; `girth`
 * thick, in the mushroom's units; last tapped on its way at `wriggledAt`.
 */
type Trip = TapTimed & {
  source: number;
  target: number | undefined;
  path: Point[];
  travel: number;
  girth: number;
  wriggledAt: number;
};
/** Where the worm is on its trip or peek, and which way a peeking one looks. */
export type WormOut = WormPose & Looking & { phase: TripPhase | 'peek' };

/**
 * A house's one worm: out of a tapped window to another of its windows, or
 * peeking out of a lone one, as a pure function of the time since the tap
 * (`model/worm.ts`). Tapped while it is out, it wriggles on its way.
 */
export class HouseWorm {
  /** The last trip or peek; `undefined` before the first tap. */
  trip: Trip | undefined;
  /** How many trips it has made, which way from the middle window the next goes (`wormTarget`). */
  trips = 0;
  private readonly voice: MeadowSound;
  private readonly phase: number;
  /** The cap it was last painted on, which a trip's way is laid on, and whether it showed there. */
  private drawn: { genes: MushroomGenes; size: number } | undefined;
  private showed = false;
  /** Its head's middle and its girth as last painted, in its house's graphics' pixels, as the probe reads them: `undefined` while it is in, the head while it is behind a pane. */
  painted: { head: Point | undefined; girth: number } | undefined;

  constructor(voice: MeadowSound, phase: number) {
    this.voice = voice;
    this.phase = phase;
  }

  /** A tap at `t` on window `from` of the `count` put in, on the cap it was last painted on. */
  tap(t: number, from: number, count: number): void {
    if (this.trip && this.at(t)) {
      this.trip.wriggledAt = t;
      this.voice.wriggle(0.5);
      return;
    }
    if (!this.drawn) throw new Error('A window tapped before it was painted');
    const { genes, size } = this.drawn;
    const slots = windowSlots(genes);
    const slot = (index: number) => {
      const found = slots[index];
      if (!found) throw new Error(`No slot for window ${String(index)}`);
      return found;
    };
    const to = wormTarget(slots, count, from, this.trips);
    const girth = wormGirth(size);
    const path =
      to === undefined
        ? peekPath(genes, slot(from), girth)
        : wormPath(genes, slot(from), slot(to), girth);
    if (to !== undefined) this.trips += 1;
    this.trip = {
      tappedAt: t,
      source: from,
      target: to,
      path,
      travel: pathLength(path),
      girth,
      wriggledAt: -Infinity,
    };
    this.voice.wriggle();
  }

  /** Where the worm is at `t`: `undefined` while it is in. */
  at(t: number): WormOut | undefined {
    if (!this.trip) return undefined;
    const elapsed = t - this.trip.tappedAt;
    if (this.trip.target !== undefined) {
      const pose = wormTrip(elapsed, this.trip.travel);
      return pose && { ...pose, look: 0 };
    }
    const peek = wormPeek(elapsed, this.trip.travel, this.phase);
    return peek && { ...peek, phase: 'peek' };
  }

  /** Whether its house has it to paint at `t`: out, or out at the last paint and to be wiped. */
  stirring(t: number): boolean {
    return this.showed || this.at(t) !== undefined;
  }

  /** The worm as `paintHouse` paints it at `t` on a cap of `genes` drawn `size` px to its unit; `undefined` while it is in. */
  shown(t: number, genes: MushroomGenes, size: number): ShownWorm | undefined {
    this.drawn = { genes, size };
    const pose = this.at(t);
    const { trip } = this;
    this.showed = pose !== undefined;
    this.painted = undefined;
    if (!pose || !trip) return undefined;
    const { look } = pose;
    const body = wormBody(trip.path, pose, trip.girth, t - trip.wriggledAt);
    const place = (point: Point) => toCanvas(size)(capFrame(genes)(point));
    this.painted = {
      head: body.head && place(body.head),
      girth: trip.girth * size,
    };
    return { ...body, look };
  }
}
