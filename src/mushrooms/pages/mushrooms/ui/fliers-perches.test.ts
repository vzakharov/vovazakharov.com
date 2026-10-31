import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isDeepStrictEqual } from 'node:util';

import { pick } from '@/kernel/shared/lib/collections';

import type { Point } from '@/mushrooms/shared/lib/geometry';
import { raining, viewAt } from '@/mushrooms/shared/world';
import {
  drawnAloft,
  type Flier,
  type Flight,
  perchName,
  type Zoomed,
} from '@/mushrooms/entities/insect/index.node-safe';
import {
  VIEWPORTS,
  VISITS,
} from '@/mushrooms/entities/mushroom/index.node-safe';
import {
  airAlofts,
  blockedFor,
  EVERY_ONE,
  type Held,
  isSeat,
  LINGER_MS,
  lingerOf,
  MOST_OVERLAP,
  perchSight,
  perchSpot,
  seatAt,
} from '@/mushrooms/features/insects-fly/index.node-safe';

import { playingOf, SEEDS, share, spanOn, TICK } from './fliers.test-kit';
import type { MeadowLayout } from './layout';
import { ALL_TEN, type Opened, opened, overlap, play } from './visit-play';

/** Every two of `items`. */
const pairsOf = <Item>(items: readonly Item[]): Array<readonly [Item, Item]> =>
  items.flatMap((item, index) =>
    items.slice(index + 1).map((other) => [item, other] as const),
  );

/**
 * How, at `now`, two of `fliers` sitting share a perch or cover more than
 * `MOST_OVERLAP` of the narrower's wings, each seated as its kind sits there;
 * `undefined` where none do.
 */
function seatedClash(
  stand: Opened,
  fliers: readonly Flier[],
  now: number,
  seats: Map<string, Point | undefined>,
): string | undefined {
  const { layout, planted } = stand;
  const sitting = fliers.flatMap((flier) => {
    const { to, arrives } = flier.leg;
    if (now < arrives || !isSeat(to)) return [];
    const name = perchName(to);
    // A perch stands still once it stands, so a seat is found once.
    const key = `${flier.id} ${name} ${String(planted.length)}`;
    const seat = seats.has(key)
      ? seats.get(key)
      : seatAt(stand, to, perchSpot(flier), flier.kind);
    seats.set(key, seat);
    return seat ? [{ flier, seat, name }] : [];
  });
  for (const [a, b] of pairsOf(sitting)) {
    if (a.name === b.name) return `${a.name} shared at ${String(now)}`;
    const apart = Math.hypot(a.seat.x - b.seat.x, a.seat.y - b.seat.y);
    const covered = overlap(
      spanOn(layout, a.flier),
      spanOn(layout, b.flier),
      apart,
    );
    if (covered > MOST_OVERLAP) {
      return `${a.flier.kind} on ${a.name} and ${b.flier.kind} on ${b.name} at ${String(now)}`;
    }
  }
  return undefined;
}

/** Each layout's spots in the air by id, where its anchor draws each, found once a layout. */
const spotted = new WeakMap<MeadowLayout, Map<string, Zoomed>>();
function spotsOn(layout: MeadowLayout): Map<string, Zoomed> {
  const { anchor } = layout.mushrooms;
  const view = viewAt(layout.camera, anchor);
  const spots =
    spotted.get(layout) ??
    new Map(
      [...airAlofts(layout, anchor)].flatMap(([id, aloft]) => {
        const drawn = drawnAloft(view, aloft);
        return drawn ? [[id, drawn] as const] : [];
      }),
    );
  spotted.set(layout, spots);
  return spots;
}

/**
 * Whether two of `fliers` hold spots in the air (sit there or are heading
 * there) on which their own wings, drawn hovering there, would overlap.
 */
function overlapAloft({ layout }: Opened, fliers: readonly Flier[]): boolean {
  const air = spotsOn(layout);
  const held = fliers.flatMap((flier) => {
    const { to } = flier.leg;
    const spot = to.kind === 'air' ? air.get(to.id) : undefined;
    return spot ? [{ flier, spot }] : [];
  });
  return pairsOf(held).some(([a, b]) => {
    const apart = Math.hypot(a.spot.x - b.spot.x, a.spot.y - b.spot.y);
    const wings =
      spanOn(layout, a.flier) * a.spot.zoom +
      spanOn(layout, b.flier) * b.spot.zoom;
    return apart < wings / 2;
  });
}

/**
 * What all ten fliers of a visit did over `LASTING`: the first time one
 * headed away or two sat crowded (`seatedClash`), if ever, and how many
 * ticks it was played for, and on how many two held spots in the air whose
 * wings overlap (`overlapAloft`).
 */
type Visited = { broken: string | undefined; ticks: number; aloft: number };

/** Each visit played once, however many tests read it. */
const visits = new Map<string, Visited>();

/** All ten fliers of the visit `seed` on a screen `width` by `height`, with a full forest or the opening clump. */
function allTen(
  seed: number,
  width: number,
  height: number,
  forest: boolean,
): Visited {
  const key = [seed, width, height, forest].join(' ');
  const known = visits.get(key);
  if (known) return known;
  const stand = opened(seed, width, height, forest);
  const playing = playingOf(ALL_TEN);
  const visited: Visited = { broken: undefined, ticks: 0, aloft: 0 };
  const seats = new Map<string, Point | undefined>();
  play(stand, seed, playing, ({ meadow, now }) => {
    const standing = { ...stand, ...pick(meadow, 'planted') };
    const leaving = meadow.insects.some(({ leg }) => leg.to.kind === 'away');
    visited.broken ??= leaving
      ? `one leaving at ${String(now)}`
      : seatedClash(standing, meadow.insects, now, seats);
    visited.ticks++;
    if (overlapAloft(standing, meadow.insects)) visited.aloft++;
  });
  visits.set(key, visited);
  return visited;
}

describe('the air', () => {
  for (const [name, width, height] of VIEWPORTS) {
    it(`holds a spot for every insect the meadow can hold, each clear of the others by their kinds' spans, on a ${name} screen`, () => {
      for (const seed of VISITS.slice(0, 50)) {
        const { air, crowded } = perchSight(opened(seed, width, height, false));
        const held: Held[] = [];
        for (const kind of EVERY_ONE) {
          const blocked = blockedFor(kind, held, crowded);
          const id = air.find(
            (each) => !blocked.has(perchName({ kind: 'air', id: each })),
          );
          if (id !== undefined) held.push({ kind, perch: { kind: 'air', id } });
        }
        assert.equal(held.length, EVERY_ONE.length, `visit ${String(seed)}`);
      }
    });
  }
});

describe('all ten fliers of a visit', () => {
  for (const [name, width, height] of VIEWPORTS) {
    for (const forest of [false, true]) {
      const grown = forest ? 'a full forest' : 'the opening clump';
      it(`never leave and never crowd each other's perches, over five minutes on a ${name} screen with ${grown}`, () => {
        for (const seed of SEEDS) {
          const { broken } = allTen(seed, width, height, forest);
          assert.equal(broken, undefined, `visit ${String(seed)}`);
        }
      });

      it(`hold spots in the air apart, over five minutes on a ${name} screen with ${grown}`, () => {
        const count = { ticks: 0, aloft: 0 };
        for (const seed of SEEDS) {
          const { ticks, aloft } = allTen(seed, width, height, forest);
          count.ticks += ticks;
          count.aloft += aloft;
        }
        const aloft = share(count.aloft, count.ticks);
        assert.equal(count.aloft, 0, `overlapping aloft ${String(aloft)}`);
      });
    }
  }
});

/** When a shower's visit taps a cloud, how long the visit is played, and by when after the tap most fliers are under a cap, in ms. */
const RAIN_AT = 10_000;
const SHOWERED = 30_000;
const UNDER_COVER = 4000;
/** The screens a shower is played on: a tablet held sideways and a phone held upright. */
const SHOWER_SCREENS = VIEWPORTS.filter(
  ([name]) => name === 'tablet' || name === 'phone',
);

/** Whether `perch` is one the rain offers: a seat under a cap, or a spot in the air. */
const isShelterOrAir = ({ kind }: Flight['leg']['to']) =>
  kind === 'shelter' || kind === 'air';

/** Whether `flier` is under a cap or heading there. */
const isSheltered = ({ leg }: Flier) => leg.to.kind === 'shelter';

/**
 * What breaks first, if anything, when all ten fliers of the visit `seed`
 * are caught by a shower at `RAIN_AT`: before it, a flight other than the
 * dry visit's; any flier leaving, or two sitting crowded (`seatedClash`);
 * while it falls, one heading anywhere but a shelter or the air, one coming
 * out, or `UNDER_COVER` after the tap under half of the most that shelter
 * together sitting under a cap; once it stops, one coming out on any tick
 * but the first at or after its own linger (`lingerOf`), so they come out
 * one by one, or one still under a cap past the longest.
 */
function showerBreaks(
  seed: number,
  width: number,
  height: number,
  forest: boolean,
): string | undefined {
  const stand = opened(seed, width, height, forest);
  const playing = { ...playingOf(ALL_TEN), lasting: SHOWERED };
  const dry: Array<readonly Flier[]> = [];
  play(stand, seed, { ...playing, lasting: RAIN_AT - TICK }, ({ meadow }) => {
    dry.push(meadow.insects);
  });
  const seats = new Map<string, Point | undefined>();
  const under = { covered: 0, most: 0 };
  let broken: string | undefined;
  play(stand, seed, { ...playing, rains: [RAIN_AT] }, ({ meadow, now }) => {
    const { insects, rain } = meadow;
    const at = String(now);
    const sitting = insects.filter(
      (flier) => isSheltered(flier) && now >= flier.leg.arrives,
    ).length;
    const coming = insects.filter(
      ({ leg }) => leg.from.kind === 'shelter' && leg.departs === now,
    );
    const standing = { ...stand, ...pick(meadow, 'planted') };
    if (now < RAIN_AT && !isDeepStrictEqual(insects, dry[now / TICK])) {
      broken ??= `flown otherwise than dry at ${at}`;
    }
    if (insects.some(({ leg }) => leg.to.kind === 'away')) {
      broken ??= `one leaving at ${at}`;
    }
    broken ??= seatedClash(standing, insects, now, seats);
    if (rain === undefined) return;
    if (raining(rain, now)) {
      const astray = insects.find(({ leg }) => !isShelterOrAir(leg.to));
      if (astray) {
        broken ??= `${astray.id} to ${perchName(astray.leg.to)} at ${at}`;
      }
      if (coming.length > 0) broken ??= `out in the rain at ${at}`;
      under.most = Math.max(under.most, sitting);
      if (now === RAIN_AT + UNDER_COVER) under.covered = sitting;
      return;
    }
    for (const flier of coming) {
      const late = now - rain.stopsAt - lingerOf(flier);
      if (late < 0 || late >= TICK) {
        broken ??= `${flier.id} out ${String(late)} ms off its linger`;
      }
    }
    const past = now - rain.stopsAt > LINGER_MS[1] + TICK;
    if (past && insects.some((flier) => isSheltered(flier))) {
      broken ??= `still under a cap at ${at}`;
    }
  });
  if (2 * under.covered <= under.most) {
    broken ??= `${String(under.covered)} of ${String(under.most)} under cover`;
  }
  return broken;
}

describe('a shower', () => {
  for (const [name, width, height] of SHOWER_SCREENS) {
    for (const forest of [false, true]) {
      const grown = forest ? 'a full forest' : 'the opening clump';
      it(`sends all ten fliers under the caps it can, none crowded, and lets them out one by one, on a ${name} screen with ${grown}`, () => {
        for (const seed of SEEDS) {
          const broken = showerBreaks(seed, width, height, forest);
          assert.equal(broken, undefined, `visit ${String(seed)}`);
        }
      });
    }
  }
});
