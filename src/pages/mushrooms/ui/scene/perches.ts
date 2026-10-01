import type { Perch, Sight } from '../../model/flight';
import type { Point } from '../../model/geometry';
import type { Flier } from '../../model/insects';
import type { Stand } from './flower-sight';
import type { Perched } from './insect-view';
import { perchedOn, type PerchHosts, tapThrough } from './perch-hosts';
import { airSpots, type FootRows, footRows, perchSight } from './perch-sight';

/**
 * The scene's perches as the screen and the mushrooms stand now: what the
 * insects see of them, and where each stands this frame on the beds the
 * scene holds or in the open air.
 */
export class Perches {
  /** What the insects see of the perches, as last seen. */
  sight: Sight = { flowers: [], air: [], crowded: [], room: [] };
  /** Where each spot in the open air stands, by id, as last seen. */
  private air = new Map<string, Point>();
  /** The beds the perches stand on, as the scene holds them now. */
  private readonly beds: () => Pick<PerchHosts, 'bed' | 'flowers'>;

  constructor(beds: () => Pick<PerchHosts, 'bed' | 'flowers'>) {
    this.beds = beds;
  }

  /** Sees the perches afresh on `stand`; the rows they stand over (`footRows`). */
  see(stand: Stand): FootRows {
    this.sight = perchSight(stand);
    this.air = new Map(
      airSpots(stand.layout).map(({ id, x, y }) => [id, { x, y }]),
    );
    return footRows(stand);
  }

  /** Where `perch` stands this frame (`perchedOn`). */
  readonly at = (perch: Perch, insect: Flier): Perched | undefined =>
    perchedOn(this.hosts(), perch, insect);

  /** Passes a tap through an insect at rest on to `under` (`tapThrough`). */
  tapThrough(under: Perch | undefined): void {
    tapThrough(this.hosts(), under);
  }

  private hosts(): PerchHosts {
    const { air } = this;
    return { ...this.beds(), air };
  }
}
