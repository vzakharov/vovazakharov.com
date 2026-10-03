import { isAloft, isLeaving, type Perch } from '../../model/flight';
import type { Aloft } from '../../model/flight-frame';
import type { Point } from '../../model/geometry';
import { CLUMP_DISTANCE } from '../../model/ground';
import type { InsectKind } from '../../model/insect-genes';
import type { Flier } from '../../model/insects';
import { capSeat, capUnder } from '../../model/mushroom-pose';
import type { Host } from './bed-place';
import type { FlowerBed } from './flower-bed';
import type { MushroomBed } from './mushroom-bed';
import { dropped, perchSpot, shelterDrop } from './perch-sight';

/**
 * Where an insect sits on a cap or a flower, in world px at the opening eye,
 * and at a flower the head's middle it drinks from; the host it sits on,
 * which draws it, and the seat as the host draws it this frame (`drawn`, CSS
 * px), its parts on the host at the host's zoom and its lift off the host at
 * the sitter's own.
 */
export type Seat = Point & { on: Host; drawn: Point; nectar?: Point };

/** Where an insect sits on a perch: a seat on a host, or a spot in the open air as a fixed point in the world. */
export type Perched = Seat | { aloft: Aloft };

/** Whether `perched` is a seat on a host. */
export function isSeated(perched: Perched): perched is Seat {
  return 'on' in perched;
}

/** Where a perch stands in the world this frame, `undefined` while it has nowhere to be. */
export type PerchAt = (perch: Perch, insect: Flier) => Perched | undefined;

/**
 * What the scene's perches stand on: the mushrooms' caps, the flowers' heads,
 * and each spot in the open air by id, as a fixed point in the world
 * (`airAlofts`); and each insect kind's unit on the layout, which a seat
 * under a cap hangs by.
 */
export type PerchHosts = {
  bed: MushroomBed | undefined;
  flowers: FlowerBed | undefined;
  alofts: ReadonlyMap<string, Aloft>;
  sizes: Readonly<Record<InsectKind, number>> | undefined;
};

/**
 * Where `perch` stands this frame: over a flower's head, as it sways and
 * sags, with the head's middle it drinks from, or on or under a cap, as it
 * breathes, wobbles and sinks, each butterfly on top at a spot of its own
 * along it, and one under it hanging below the underside by its own size at
 * its own zoom (`shelterDrop`); or a spot in the open air.
 */
export function perchedOn(
  { bed, flowers, alofts, sizes }: PerchHosts,
  perch: Perch,
  insect: Flier,
): Perched | undefined {
  const spot = perchSpot(insect);
  switch (perch.kind) {
    case 'cap': {
      return bed?.seat(perch.id, (genes) => capSeat(genes, spot));
    }
    case 'shelter': {
      const under = bed?.seat(perch.id, (genes) => capUnder(genes, perch.seat));
      if (!under || !sizes) return under;
      const drop = (zoom: number) => shelterDrop(sizes, insect.kind, zoom);
      const { drawn, on } = under;
      const own = CLUMP_DISTANCE / on.stands.ahead;
      return { ...dropped(under, drop(1)), drawn: dropped(drawn, drop(own)) };
    }
    case 'flower': {
      return flowers?.seat(perch.id, spot, insect.kind);
    }
    case 'air': {
      const aloft = alofts.get(perch.id);
      return aloft && { aloft };
    }
    case 'away': {
      return undefined;
    }
    default: {
      return perch satisfies never;
    }
  }
}

/** The perch `flier` sits on at `now`, in ms: none while it flies or leaves. */
export function restingOn(
  flier: Flier | undefined,
  now: number,
): Perch | undefined {
  return flier && !isAloft(flier, now) && !isLeaving(flier)
    ? flier.leg.to
    : undefined;
}

/** Passes a tap through an insect at rest on to `under`, the cap it sits on or under, or the flower. */
export function tapThrough(
  { bed, flowers }: PerchHosts,
  under: Perch | undefined,
): void {
  switch (under?.kind) {
    case 'cap':
    case 'shelter': {
      bed?.tap(under.id);
      break;
    }
    case 'flower': {
      flowers?.tap(under.id);
      break;
    }
    case 'air':
    case 'away':
    case undefined: {
      break;
    }
    default: {
      under satisfies never;
    }
  }
}
