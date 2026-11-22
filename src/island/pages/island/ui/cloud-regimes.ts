import {
  abs,
  asin,
  atan,
  cos,
  dot,
  exp,
  float,
  If,
  log,
  max,
  mix,
  mod,
  select,
  sin,
  smoothstep,
  sqrt,
  vec3,
} from 'three/tsl';

import {
  HIGHEST_TOP,
  MAP_WAVES,
  STORM_LIVES,
  STORMS_ROUND,
} from '../lib/clouds';
import { cloudLattice, type F, noise, type V } from './cloud-noise';

const DEGREE = Math.PI / 180;

/**
 * What kind of low or deep cloud a place has: the numbers the cells are drawn
 * by. A place's cloud is where `amount` and what the cells add to it pass zero.
 */
type Row = {
  /** Under zero clear but for what the cells lift, over it cloud but for what they cut. */
  readonly amount: F;
  /** How far the meso noise itself moves the amount: clusters and clumps. */
  readonly lumps: F;
  /** How much the meso cells' edges cut out of the cloud: a deck's closed cells. */
  readonly veins: F;
  /** How much they add to it: a cold outbreak's open rings. */
  readonly rings: F;
  /** How far the cumulus scales move the amount. */
  readonly fine: F;
  /** How much of the cloud is laid in streets along the wind. */
  readonly streets: F;
  /** The flat bases' height and the highest tops', metres. */
  readonly base: F;
  readonly ceil: F;
  /** How flat the tops are: 0 heaped by their cover, 1 one level. */
  readonly flat: F;
  /** How much of a full cloud's water a metre of it holds: a front's edge is a veil. */
  readonly dense: F;
};

/** What a ray's weather is: the layer `Row` describes, and the ice over it. */
export type Regime = Row & {
  /** The ice cloud overhead, 0 to 1. */
  readonly ice: F;
  /** How far north the streets and streaks are bent off the parallels, radians. */
  readonly bend: F;
};

const ROW_KEYS = [
  'amount',
  'lumps',
  'veins',
  'rings',
  'fine',
  'streets',
  'base',
  'ceil',
  'flat',
  'dense',
] as const satisfies ReadonlyArray<keyof Row>;

type RowOf = { readonly [Key in keyof Row]: F | number };

/** A bell over `x`, radians, centred `centre` degrees and `sigma` degrees wide. */
const bell = (x: F, centre: number, sigma: number): F => {
  const off = x.sub(centre * DEGREE).div(sigma * DEGREE);
  return exp(off.mul(off).negate());
};

/** A cyclone's reach, radians of the sphere: where its front's tail has thinned to a third. */
const REACH = 0.12;
/** How far a cyclone's hemisphere's ring is turned off the other's, in cyclones. */
const RING_TURN = 0.19;
/** The bearing of a cyclone's cold front one reach out, anticlockwise from east with the pole up. */
const TAIL = -110 * DEGREE;

/** A cyclone's own number for `salt`, 0 to 1, new each `epoch` of its lives. */
const seedOf = (id: F, epoch: F, salt: number): F =>
  cloudLattice(vec3(id, epoch, salt));

/**
 * How much of a spiral band `broad` times the front's width a place `turn`
 * round the spiral is in, the band lying `ahead` radians on from the front;
 * `wide` is the front's own width there.
 */
const bandAt = (turn: F, wide: F, broad: number, ahead: number): F => {
  const half = wide.mul(wide).mul(0.5 * broad * broad);
  const away = cos(turn.sub(ahead)).oneMinus();
  return smoothstep(half.mul(0.05), half, away).oneMinus();
};

type Storm = {
  /** The frontal band and the comma's head. */
  readonly front: F;
  /** The cold air behind the front. */
  readonly cold: F;
  /** The ice shield over and ahead of the front. */
  readonly shield: F;
  /** Streaks along the spiral, -1 to 1. */
  readonly grain: F;
};

/**
 * The cyclones over `spot`: `STORMS_ROUND` of them ring each hemisphere's
 * storm track, each a spiral band wound toward its low the way its hemisphere
 * turns, tightening through a life `storms` counts. `warp` moves the spot off
 * its place, radians east and poleward, so no two are one shape.
 */
function stormsOver(spot: V, storms: F, warp: readonly [F, F]): Storm {
  const hemisphere = select(spot.y.greaterThanEqual(0), float(1), float(-1));
  const width = (2 * Math.PI) / STORMS_ROUND;
  const turned = hemisphere.mul(RING_TURN);
  const along = atan(spot.z.negate(), spot.x).div(width).add(turned).toVar();
  const home = along.floor().toVar();
  const front = float(0).toVar();
  const cold = float(0).toVar();
  const shield = float(0).toVar();
  const grain = float(0).toVar();
  const weighed = float(0).toVar();
  // The cyclones either side reach in over this one's cell.
  for (const cell of [home.sub(1), home, home.add(1)]) {
    const id = mod(cell, STORMS_ROUND).mul(7.3).add(1.1).toVar();
    const lived = cloudLattice(vec3(id, hemisphere.mul(2.9), 0.7))
      .add(storms)
      .toVar();
    const life = lived.fract();
    const epoch = mod(lived.floor(), STORM_LIVES)
      .mul(5.7)
      .add(hemisphere.mul(2.9));
    const lon = cell
      .add(0.5)
      .add(seedOf(id, epoch, 1.3).sub(0.5).mul(0.5))
      .sub(turned)
      .mul(width);
    const lat = seedOf(id, epoch, 2.9)
      .mul(14 * DEGREE)
      .add(42 * DEGREE);
    const across = cos(lat);
    const up = sin(lat).mul(hemisphere);
    const cosLon = cos(lon);
    const sinLon = sin(lon);
    const centre = vec3(across.mul(cosLon), up, across.mul(sinLon).negate());
    const east = vec3(sinLon.negate(), 0, cosLon.negate());
    const north = vec3(up.mul(cosLon).negate(), across, up.mul(sinLon));
    const off = spot.sub(centre);
    const x = dot(off, east).add(warp[0]);
    const y = dot(off, north).mul(hemisphere).add(warp[1]);
    const reach = seedOf(id, epoch, 4.1).mul(0.5).add(0.8).mul(REACH);
    const r = sqrt(x.mul(x).add(y.mul(y)))
      .div(reach)
      .toVar();
    const grown = smoothstep(0, 0.2, life)
      .mul(smoothstep(0.7, 1, life).oneMinus())
      .mul(smoothstep(0.2, 0.5, dot(spot, centre)));
    const wound = life.mul(1.2).add(1);
    const turn = atan(y, x)
      .add(wound.mul(log(max(r, 0.15).div(r.mul(0.8).add(1)))))
      .sub(TAIL)
      .toVar();
    const wide = mix(1.15, 0.2, smoothstep(0.15, 1.6, r)).toVar();
    const within = exp(r.mul(r).div(-2.4 * 2.4))
      .mul(smoothstep(3.2, 4.2, r).oneMinus())
      .mul(grown);
    const banded = bandAt(turn, wide, 1, 0).toVar();
    front.assign(max(front, within.mul(banded)));
    cold.assign(
      max(
        cold,
        smoothstep(0.1, 0.6, sin(turn).negate())
          .mul(exp(r.mul(r).div(-1.8 * 1.8)))
          .mul(smoothstep(0.3, 0.7, r))
          .mul(grown)
          .mul(banded.oneMinus()),
      ),
    );
    const shielded = within.mul(bandAt(turn, wide, 2.5, 0.5)).toVar();
    If(shielded.greaterThan(0.001), () => {
      shield.assign(max(shield, shielded));
      // Where two shields meet, each grain counts by its own shield: no seam between them.
      const weight = shielded.mul(shielded);
      weighed.addAssign(weight);
      grain.addAssign(
        noise(vec3(cos(turn).mul(3.5), sin(turn).mul(3.5), r.mul(0.7).add(id)))
          .mul(smoothstep(0.25, 0.7, r))
          .mul(weight),
      );
    });
  }
  return { front, cold, shield, grain: grain.div(max(weighed, 1e-6)) };
}

/** The weather over `spot`, a unit vector in the field's own turning frame, `storms` lives into its turn. */
export function regimeAt(spot: V, storms: F): Regime {
  const [meander, patch, cluster, ragged] = MAP_WAVES;
  const n0 = noise(spot.mul(meander).add(11.3)).toVar();
  const n1 = noise(spot.zxy.mul(patch).add(3.7)).toVar();
  const n2 = noise(spot.mul(cluster)).toVar();
  const n3 = noise(spot.zxy.mul(ragged)).toVar();
  // The belts wander with the widest noise, so none is a ruled parallel.
  const lat = asin(spot.y.clamp(-1, 1))
    .add(n0.mul(0.12))
    .add(n2.mul(0.03))
    .toVar();
  const absLat = abs(lat).toVar();
  const itcz = bell(lat, 6, 5).toVar();
  const track = bell(absLat, 50, 13).toVar();
  const polar = smoothstep(60 * DEGREE, 74 * DEGREE, absLat);

  // The clear belts' sky, which every other regime is laid over in turn.
  const row = {
    amount: n2.mul(0.15).sub(0.65).toVar(),
    lumps: float(0).toVar(),
    veins: float(0).toVar(),
    rings: float(0).toVar(),
    fine: float(0.9).toVar(),
    streets: float(0).toVar(),
    base: float(1000).toVar(),
    ceil: float(2600).toVar(),
    flat: float(0).toVar(),
    dense: float(1).toVar(),
  } satisfies Row;
  const lay = (over: Partial<RowOf>, weight: F) => {
    const share = weight.toVar();
    const full: RowOf = {
      amount: 0,
      lumps: 0,
      veins: 0,
      rings: 0,
      fine: 0,
      streets: 0,
      base: 1000,
      ceil: 2600,
      flat: 0,
      dense: 1,
      ...over,
    };
    for (const key of ROW_KEYS) {
      row[key].assign(mix(row[key], full[key], share));
    }
    return share;
  };

  // Mid-latitude fair weather: fields of cumulus in patches.
  lay(
    {
      amount: n1.mul(0.35).add(n2.mul(0.25)).add(n3.mul(0.1)).sub(0.15),
      fine: 0.9,
      base: 1100,
      ceil: 3200,
    },
    track,
  );
  // Trade cumulus, clumped into flowers and arcs.
  lay(
    {
      amount: n2.mul(0.3).add(n3.mul(0.22)).sub(0.3),
      lumps: 0.25,
      fine: 0.8,
      base: 650,
      ceil: 2100,
    },
    bell(absLat, 15, 8),
  );
  // Stratocumulus decks in the subtropics and over the polar seas, closed
  // cells within, breaking into open ones along their edges.
  const deck = lay(
    {
      amount: n3.mul(0.15).add(n2.mul(0.1)).add(0.08),
      veins: 1,
      lumps: 0.3,
      fine: 0.75,
      base: 700,
      ceil: 1500,
      flat: 0.3,
    },
    max(
      bell(absLat, 30, 11).mul(smoothstep(0.05, 0.3, n1)),
      polar.mul(smoothstep(-0.35, 0.15, n1.add(n2.mul(0.5)))),
    ),
  );
  row.rings.addAssign(deck.mul(deck.oneMinus()).mul(2));
  // Cloud streets where cold air runs out over the subpolar seas.
  lay(
    { amount: -0.25, streets: 1, fine: 0.3, base: 700, ceil: 1700, flat: 0.3 },
    smoothstep(54 * DEGREE, 60 * DEGREE, absLat)
      .mul(smoothstep(68 * DEGREE, 74 * DEGREE, absLat).oneMinus())
      .mul(smoothstep(0.05, 0.3, n1.negate())),
  );

  const ice = track
    .mul(smoothstep(0, 0.5, n1.mul(0.6).sub(n0.mul(0.5)).add(0.1)))
    .mul(0.6)
    .toVar();
  If(track.greaterThan(0.03), () => {
    const storm = stormsOver(spot, storms, [
      n2.mul(0.03),
      n3.mul(0.02).add(n1.mul(0.02)),
    ]);
    // The cyclones thin out toward the edge of their track, where they are no longer read.
    const tracked = smoothstep(0.03, 0.15, track).toVar();
    const front = storm.front.mul(tracked).toVar();
    const { grain, cold, shield } = storm;
    lay(
      {
        amount: -0.5,
        rings: 0.8,
        lumps: 0.45,
        fine: 0.8,
        base: 800,
        ceil: 2600,
      },
      // The cold air's open cells come in fields, with clear air between them.
      cold.mul(tracked).mul(smoothstep(-0.25, 0.2, n3)),
    );
    lay(
      {
        amount: front
          .mul(0.7)
          .add(grain.mul(0.25))
          .add(n3.mul(0.2))
          .add(n2.mul(0.1))
          .sub(0.05),
        lumps: 0.4,
        fine: 0.3,
        base: 900,
        ceil: front.mul(6000).add(2500),
        flat: 0.6,
        dense: front.mul(front).mul(grain.mul(0.4).add(0.8)),
      },
      smoothstep(0.05, 0.35, front),
    );
    ice.assign(max(ice, shield.mul(tracked).mul(grain.mul(0.5).add(0.6))));
  });

  // Deep convection in clusters along the ITCZ, each under its anvil.
  const convecting = n2.mul(0.7).add(n3.mul(0.3)).add(n1.mul(0.15)).toVar();
  const deep = itcz.mul(smoothstep(-0.05, 0.3, convecting)).toVar();
  lay(
    {
      amount: deep.mul(0.5).sub(0.1),
      lumps: 0.6,
      fine: 0.55,
      base: 700,
      ceil: HIGHEST_TOP - 500,
      flat: 0,
      dense: deep,
    },
    deep,
  );
  ice.assign(max(ice, itcz.mul(smoothstep(-0.25, 0.15, convecting)).mul(0.9)));

  return { ...row, ice, bend: n1.mul(0.02).add(n0.mul(0.04)) };
}
