import { type Perch, perchName, type Sight } from '../../model/flight';
import type { Aloft } from '../../model/flight-frame';
import { type Eye, OPENING_EYE, unanchored } from '../../model/ground';
import type { Flier } from '../../model/insects';
import { airAloftOf, airAlofts } from './air-spots';
import { anchoredStand } from './anchored-stand';
import type { Stand } from './flower-sight';
import { type Away, awayPlaces } from './insect-away';
import type { MeadowLayout } from './layout';
import {
  type Perched,
  perchedOn,
  type PerchHosts,
  tapThrough,
} from './perch-hosts';
import { footRows, perchSight } from './perch-sight';
import { aloftOfLayout, placeOfAloft } from './plane-place';
import type { View } from './view';

/** How far the eye walks, in the clump's size, before the perches are judged afresh: coarser than the rules' anchor (`anchorOf`), a fresh sight costing a frame's worth. */
const PERCH_STEP = 2;
/** How far, in radians, the eye turns before the perches are judged afresh. */
const PERCH_TURN = 0.3;

/** The anchor the perches are judged from (`see`): `eye` snapped to `PERCH_STEP` and `PERCH_TURN`; an anchor is its own. */
export function perchAnchorOf({ x, y, heading }: Eye): Eye {
  return {
    x: snapped(x, PERCH_STEP),
    y: snapped(y, PERCH_STEP),
    heading: snapped(heading, PERCH_TURN),
  };
}

function snapped(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/**
 * The scene's perches as the screen and the mushrooms stand now: what the
 * insects see of them, and where each stands this frame on the beds the
 * scene holds or in the open air.
 */
export class Perches {
  /** What the insects see of the perches, as last seen. */
  sight: Sight = { flowers: [], air: [], crowded: [], room: [] };
  /** Each spot in the open air offered as last seen as a fixed point in the world, by id. */
  private alofts: ReadonlyMap<string, Aloft> = new Map();
  /** Every perch `sight` places but the away spots, as the fixed point in the world it is laid out at, by its name (`perchName`). */
  private placed: ReadonlyMap<string, Aloft> = new Map();
  /** The layout the perches were last seen on. */
  private layout: MeadowLayout | undefined;
  /** The beds the perches stand on, as the scene holds them now. */
  private readonly beds: () => Pick<PerchHosts, 'bed' | 'flowers'>;

  constructor(beds: () => Pick<PerchHosts, 'bed' | 'flowers'>) {
    this.beds = beds;
  }

  /**
   * Sees the perches afresh on `stand` as judged from `anchor`
   * (`anchoredStand`), every place on a bed taken back to the plane
   * (`unanchored`), and the air's as the plane holds it (`airAlofts`).
   */
  see(stand: Stand, anchor: Eye = OPENING_EYE): void {
    const judged = anchoredStand(stand, anchor);
    const { layout } = judged;
    this.sight = perchSight(judged);
    this.layout = layout;
    this.alofts = airAlofts(layout, anchor);
    const { places = {} } = this.sight;
    const unit = layout.insectSize;
    // `perchSight`'s layout run backwards, each place over its foot's row:
    // a perch on a bed is a cap or a flower, each with a row, so the air's
    // hundreds of places are never walked.
    const onBeds = [...footRows(judged)].flatMap(([name, row]) => {
      const place = places[name];
      if (!place) return [];
      const point = { x: place.x * unit, y: place.y * unit };
      const laid = aloftOfLayout(layout.camera, point, row);
      return [[name, { ...laid, ...unanchored(anchor, laid) }] as const];
    });
    const inAir = [...this.alofts].map(
      ([id, aloft]) => [perchName({ kind: 'air', id }), aloft] as const,
    );
    this.placed = new Map([...onBeds, ...inAir]);
  }

  /**
   * What the insects see of the perches as last seen, every place where
   * `view`'s eye's frame stands it (`placeOfAloft`), with the away spots past
   * the screen's sides where `view` draws an insect leaving (`awayPlaces`),
   * each insect `drawn` where it was last drawn, by id, framed the same, and
   * each insect's own away spots as it stands away (`aways`), by id.
   */
  sightFrom(
    view: View,
    drawn: ReadonlyMap<string, Aloft> = new Map(),
    aways: ReadonlyMap<string, Away> = new Map(),
  ): Sight {
    const { layout, sight, placed } = this;
    if (!sight.places || !layout) return sight;
    const unit = layout.insectSize;
    const framed = (alofts: ReadonlyMap<string, Aloft>) =>
      Object.fromEntries(
        [...alofts].map(([key, aloft]) => [
          key,
          placeOfAloft(view, unit, aloft),
        ]),
      );
    return {
      ...sight,
      places: { ...framed(placed), ...awayPlaces(layout, view) },
      drawn: framed(drawn),
      aways: Object.fromEntries(
        [...aways].map(([id, away]) => [id, awayPlaces(layout, view, away)]),
      ),
    };
  }

  /** Where `perch` stands this frame (`perchedOn`). */
  readonly at = (perch: Perch, insect: Flier): Perched | undefined =>
    perchedOn(this.hosts(perch), perch, insect);

  /** Passes a tap through an insect at rest on to `under` (`tapThrough`). */
  tapThrough(under: Perch | undefined): void {
    tapThrough(this.hosts(), under);
  }

  /**
   * The beds, and the air offered as last seen; for a spot in the air
   * `perch` names that is no longer offered, that spot alone (`airAloftOf`),
   * so an insect still holding a spot the eye has walked away from hovers
   * where it was.
   */
  private hosts(perch?: Perch): PerchHosts {
    const { alofts, layout } = this;
    const held =
      perch?.kind === 'air' && layout && !alofts.has(perch.id)
        ? airAloftOf(layout, perch.id)
        : undefined;
    return {
      ...this.beds(),
      alofts:
        held && perch?.kind === 'air' ? new Map([[perch.id, held]]) : alofts,
    };
  }
}
