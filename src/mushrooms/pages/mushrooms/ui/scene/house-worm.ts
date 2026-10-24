import type { Point } from '../../model/geometry';
import { windowSlots } from '../../model/house';
import type { Looking, TapTimed } from '../../model/motion';
import type { MushroomGenes } from '../../model/mushroom-genes';
import { capOnCanvas } from '../../model/mushroom-outline';
import {
  pathLength,
  PEEK_SPAN,
  peekPath,
  peekWindow,
  type TripPhase,
  tripSpan,
  tripWindows,
  WINDOW_SWING,
  wormBody,
  wormClock,
  wormGirth,
  wormPath,
  wormPeek,
  type WormPose,
  wormTarget,
  wormTrip,
} from '../../model/worm';
import { SHUT_WINDOW, type WindowSwing } from './draw-house';
import type { ShownWorm } from './draw-worm';
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
  /** The sides its windows' panes swing to, the tapped one's first (`sidesOf`). */
  sides: [number, number];
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
  /** The trip before it, whose windows may still be shutting. */
  private previous: Trip | undefined;
  /** How many trips it has made, which way from the middle window the next goes (`wormTarget`). */
  trips = 0;
  private readonly voice: MeadowSound;
  private readonly phase: number;
  /** The cap it was last painted on and the zoom that put it on the screen, which a trip's way is laid on, and whether it showed there. */
  private drawn:
    | { genes: MushroomGenes; size: number; zoom: number }
    | undefined;
  private showed = false;
  /** Its head's middle and its girth as last painted, in its house's graphics' pixels, as the probe reads them: `undefined` while it is in, the head while it is behind a pane. */
  painted: { head: Point | undefined; girth: number } | undefined;

  constructor(voice: MeadowSound, phase: number) {
    this.voice = voice;
    this.phase = phase;
  }

  /** A tap at `t` on window `from` of the `count` put in, on the cap it was last painted on. */
  tap(t: number, from: number, count: number): void {
    if (this.trip && this.setOut(t)) {
      this.trip.wriggledAt = t;
      this.voice.wriggle(0.5);
      return;
    }
    if (!this.drawn) throw new Error('A window tapped before it was painted');
    const { genes, size, zoom } = this.drawn;
    const slots = windowSlots(genes);
    const slot = (index: number) => {
      const found = slots[index];
      if (!found) throw new Error(`No slot for window ${String(index)}`);
      return found;
    };
    const to = wormTarget(slots, count, from, this.trips);
    const girth = wormGirth(size, zoom);
    const path =
      to === undefined
        ? peekPath(genes, slot(from), girth)
        : wormPath(genes, slot(from), slot(to), girth);
    if (to !== undefined) this.trips += 1;
    this.previous = this.trip;
    this.trip = {
      tappedAt: t,
      source: from,
      target: to,
      sides: sidesOf(slot(from), to === undefined ? undefined : slot(to)),
      path,
      travel: pathLength(path),
      girth,
      wriggledAt: -Infinity,
    };
    this.voice.wriggle();
  }

  /** Whether the worm called at the last tap has yet to go back in at `t`: its window swinging open, or it out. */
  private setOut(t: number): boolean {
    const trip = this.trip;
    if (!trip) return false;
    const since = t - trip.tappedAt;
    return since >= 0 && (since < WINDOW_SWING || this.at(t) !== undefined);
  }

  /** Where the worm is at `t`: `undefined` while it is in. */
  at(t: number): WormOut | undefined {
    if (!this.trip) return undefined;
    const elapsed = wormClock(t - this.trip.tappedAt);
    if (this.trip.target !== undefined) {
      const pose = wormTrip(elapsed, this.trip.travel);
      return pose && { ...pose, look: 0 };
    }
    const peek = wormPeek(elapsed, this.trip.travel, this.phase);
    return peek && { ...peek, phase: 'peek' };
  }

  /** Whether its house has it to paint at `t`: out or a window of its open, or so at the last paint and to be wiped. */
  stirring(t: number): boolean {
    return this.showed || this.swinging(t);
  }

  /** Window `index` as the worm's trips leave it at `t`: open on their way, shut otherwise. */
  window(t: number, index: number): WindowSwing {
    const [now, before] = [this.trip, this.previous].map((trip) =>
      trip ? windowOf(trip, t, index) : SHUT_WINDOW,
    );
    return before && now && before.open > now.open
      ? before
      : (now ?? SHUT_WINDOW);
  }

  /** Whether the last trip's worm is out or a window of it not yet shut at `t`. */
  private swinging(t: number): boolean {
    const trip = this.trip;
    if (!trip) return false;
    const since = t - trip.tappedAt;
    const span = trip.target === undefined ? PEEK_SPAN : tripSpan(trip.travel);
    return since >= 0 && since < span;
  }

  /** The worm as `paintHouse` paints it at `t` on a cap of `genes` drawn `size` px to its unit, its house's graphics at `zoom`; `undefined` while it is in. */
  shown(
    t: number,
    genes: MushroomGenes,
    size: number,
    zoom: number,
  ): ShownWorm | undefined {
    this.drawn = { genes, size, zoom };
    const pose = this.at(t);
    const { trip } = this;
    this.showed = this.swinging(t);
    this.painted = undefined;
    if (!pose || !trip) return undefined;
    const { look } = pose;
    const body = wormBody(trip.path, pose, trip.girth, t - trip.wriggledAt);
    const place = capOnCanvas(genes, size);
    this.painted = {
      head: body.head && place(body.head),
      girth: trip.girth * size,
    };
    return { ...body, look };
  }
}

/**
 * The sides a trip's windows' panes swing to, the tapped one's first: each
 * away from the way the worm crawls, so neither lies under it; a lone
 * window's to the left.
 */
function sidesOf(from: Point, to: Point | undefined): [number, number] {
  if (!to) return [-1, -1];
  const way = Math.sign(to.x - from.x) || 1;
  return [-way, way];
}

/** Window `index` as `trip` leaves it at `t`. */
function windowOf(trip: Trip, t: number, index: number): WindowSwing {
  const since = t - trip.tappedAt;
  const [fromSide, toSide] = trip.sides;
  if (trip.target === undefined) {
    return index === trip.source
      ? { open: peekWindow(since), swingsTo: fromSide }
      : SHUT_WINDOW;
  }
  const { tapped, reached } = tripWindows(since, trip.travel);
  if (index === trip.source) return { open: tapped, swingsTo: fromSide };
  if (index === trip.target) return { open: reached, swingsTo: toSide };
  return SHUT_WINDOW;
}
