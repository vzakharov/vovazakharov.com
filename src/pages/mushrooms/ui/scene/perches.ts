import { type Perch, perchName, SIDES, type Sight } from '../../model/flight';
import type { Point } from '../../model/geometry';
import type { Flier } from '../../model/insects';
import type { Stand } from './flower-sight';
import type { Aloft } from './insect-frame';
import {
  perchAloft,
  type Perched,
  perchedOn,
  type PerchHosts,
  tapThrough,
} from './perch-hosts';
import {
  airAlofts,
  airSpots,
  type FootRows,
  footRows,
  perchDistance,
  perchSight,
} from './perch-sight';
import type { View } from './view';

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
  /** Each spot in the open air as a fixed point in the world, by id, as last seen. */
  private alofts: ReadonlyMap<string, Aloft> = new Map();
  /** Every perch `sight` places, by its name (`perchName`). */
  private named = new Map<string, Perch>();
  /** The beds the perches stand on, as the scene holds them now. */
  private readonly beds: () => Pick<PerchHosts, 'bed' | 'flowers'>;

  constructor(beds: () => Pick<PerchHosts, 'bed' | 'flowers'>) {
    this.beds = beds;
  }

  /** Sees the perches afresh on `stand`; the rows they stand over (`footRows`). */
  see(stand: Stand): FootRows {
    const { layout, mushrooms } = stand;
    this.sight = perchSight(stand);
    this.air = new Map(airSpots(layout).map(({ id, x, y }) => [id, { x, y }]));
    this.alofts = airAlofts(layout);
    const { flowers, beeFlowers = [], air } = this.sight;
    const perches: Perch[] = [
      ...mushrooms.map(({ id }) => ({ kind: 'cap', id }) as const),
      ...[...flowers, ...beeFlowers].map(
        (id) => ({ kind: 'flower', id }) as const,
      ),
      ...air.map((id) => ({ kind: 'air', id }) as const),
      ...SIDES.map((side) => ({ kind: 'away', side }) as const),
    ];
    this.named = new Map(perches.map((perch) => [perchName(perch), perch]));
    return footRows(stand);
  }

  /**
   * What the insects see of the perches as last seen, each place's distance
   * measured from `view`'s eye (`perchDistance`); a place past the screen's
   * side, which moves with the screen, keeps the opening eye's.
   */
  sightFrom(view: View): Sight {
    const { places } = this.sight;
    if (!places) return this.sight;
    const hosts = this.hosts();
    const measured = Object.entries(places).map(([name, place]) => {
      const perch = this.named.get(name);
      const at = perch && perchAloft(hosts, view, perch);
      return [
        name,
        at ? { ...place, fromEye: perchDistance(view, at) } : place,
      ] as const;
    });
    return { ...this.sight, places: Object.fromEntries(measured) };
  }

  /** Where `perch` stands this frame (`perchedOn`). */
  readonly at = (perch: Perch, insect: Flier): Perched | undefined =>
    perchedOn(this.hosts(), perch, insect);

  /** Passes a tap through an insect at rest on to `under` (`tapThrough`). */
  tapThrough(under: Perch | undefined): void {
    tapThrough(this.hosts(), under);
  }

  private hosts(): PerchHosts {
    const { air, alofts } = this;
    return { ...this.beds(), air, alofts };
  }
}
