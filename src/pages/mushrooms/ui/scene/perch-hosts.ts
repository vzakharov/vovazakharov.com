import { isAloft, isLeaving, type Perch } from '../../model/flight';
import type { Point } from '../../model/geometry';
import type { Camera } from '../../model/ground';
import type { Flier } from '../../model/insects';
import type { Host } from './bed-place';
import type { FlowerBed } from './flower-bed';
import type { Aloft } from './insect-frame';
import type { Perched } from './insect-view';
import type { MushroomBed } from './mushroom-bed';
import { aloftOfLayout, perchSpot } from './perch-sight';

/**
 * What the scene's perches stand on: the mushrooms' caps, the flowers' heads,
 * and each spot in the open air by id, where the layout lays it out (`air`)
 * and as a fixed point in the world (`alofts`, `airAlofts`).
 */
export type PerchHosts = {
  bed: MushroomBed | undefined;
  flowers: FlowerBed | undefined;
  air: ReadonlyMap<string, Point>;
  alofts: ReadonlyMap<string, Aloft>;
};

/**
 * Where `perch` stands this frame: over a flower's head, as it sways and
 * sags, with the head's middle it drinks from, or a cap's top, as it
 * breathes, wobbles and sinks, each butterfly at a spot of its own along
 * it; or a spot in the open air.
 */
export function perchedOn(
  { bed, flowers, air }: PerchHosts,
  perch: Perch,
  insect: Flier,
): Perched | undefined {
  const spot = perchSpot(insect);
  switch (perch.kind) {
    case 'cap': {
      return bed?.capTop(perch.id, spot);
    }
    case 'flower': {
      return flowers?.seat(perch.id, spot, insect.kind);
    }
    case 'air': {
      return air.get(perch.id);
    }
    case 'away': {
      return undefined;
    }
    default: {
      return perch satisfies never;
    }
  }
}

/**
 * Where `perch` stands in the world, on `camera`'s screen, to measure its
 * distance from the eye by (`perchDistance`): the foot of the cap or the
 * flower it stands on, or its spot in the air; none past the screen's side,
 * which moves with the screen, nor for a perch with nowhere to be.
 */
export function perchAloft(
  hosts: PerchHosts,
  camera: Camera,
  perch: Perch,
): Aloft | undefined {
  const onFoot = (host: Host | undefined) =>
    host && aloftOfLayout(camera, host.laidFoot, host.laidFoot.y);
  switch (perch.kind) {
    case 'cap': {
      return onFoot(hosts.bed?.capTop(perch.id, 0)?.on);
    }
    case 'flower': {
      return onFoot(hosts.flowers?.seat(perch.id, 0, 'butterfly')?.on);
    }
    case 'air': {
      return hosts.alofts.get(perch.id);
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

/** Passes a tap through an insect at rest on to `under`, the cap or the flower it sits on. */
export function tapThrough(
  { bed, flowers }: PerchHosts,
  under: Perch | undefined,
): void {
  switch (under?.kind) {
    case 'cap': {
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
