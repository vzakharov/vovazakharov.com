import { type Perch, perchName, SIDES, type Sight } from '../../model/flight';
import type { Flier } from '../../model/insects';
import type { Stand } from './flower-sight';
import { awayPlaces } from './insect-away';
import type { Aloft } from './insect-frame';
import type { MeadowLayout } from './layout';
import {
  perchAloft,
  type Perched,
  perchedOn,
  type PerchHosts,
  tapThrough,
} from './perch-hosts';
import { airAlofts, perchSight } from './perch-sight';
import { perchDistance } from './plane-place';
import type { View } from './view';

/**
 * The scene's perches as the screen and the mushrooms stand now: what the
 * insects see of them, and where each stands this frame on the beds the
 * scene holds or in the open air.
 */
export class Perches {
  /** What the insects see of the perches, as last seen. */
  sight: Sight = { flowers: [], air: [], crowded: [], room: [] };
  /** Each spot in the open air as a fixed point in the world, by id, as last seen. */
  private alofts: ReadonlyMap<string, Aloft> = new Map();
  /** Every perch `sight` places, by its name (`perchName`). */
  private named = new Map<string, Perch>();
  /** The layout the perches were last seen on. */
  private layout: MeadowLayout | undefined;
  /** The beds the perches stand on, as the scene holds them now. */
  private readonly beds: () => Pick<PerchHosts, 'bed' | 'flowers'>;

  constructor(beds: () => Pick<PerchHosts, 'bed' | 'flowers'>) {
    this.beds = beds;
  }

  /** Sees the perches afresh on `stand`. */
  see(stand: Stand): void {
    const { layout, mushrooms } = stand;
    this.sight = perchSight(stand);
    this.layout = layout;
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
  }

  /**
   * What the insects see of the perches as last seen, each place's distance
   * measured from `view`'s eye (`perchDistance`), and the away spots past the
   * screen's sides where `view` draws an insect leaving (`awayPlaces`).
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
    const away = this.layout ? awayPlaces(this.layout, view) : {};
    return {
      ...this.sight,
      places: { ...Object.fromEntries(measured), ...away },
    };
  }

  /** Where `perch` stands this frame (`perchedOn`). */
  readonly at = (perch: Perch, insect: Flier): Perched | undefined =>
    perchedOn(this.hosts(), perch, insect);

  /** Passes a tap through an insect at rest on to `under` (`tapThrough`). */
  tapThrough(under: Perch | undefined): void {
    tapThrough(this.hosts(), under);
  }

  private hosts(): PerchHosts {
    const { alofts } = this;
    return { ...this.beds(), alofts };
  }
}
