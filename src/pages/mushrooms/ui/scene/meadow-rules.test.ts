import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { firstMeadow, type Planted } from '../../model/game';
import {
  boxAround,
  type Circle,
  containsPoint,
  distanceToEdge,
  type Point,
} from '../../model/geometry';
import { MUSHROOM_SPECIES, type Species } from '../../model/mushroom-genes';
import { tapArea, toCanvas } from '../../model/mushroom-outline';
import { openingIndex } from '../../model/placement';
import { mulberry32 } from '../../model/random';
import { capBox, coverOf, MOST_HIDDEN } from './cap-cover';
import { placeIn } from './clump-layout';
import {
  doorInSight,
  IN_SIGHT,
  sightOf,
  type Standing,
  standingAt,
} from './door-sight';
import { type MeadowLayout, meadowLayout } from './layout';
import { EDGE_MARGIN } from './meadow-camera';
import { FINGER_ACROSS, fingerPad } from './mushroom-tap';
import { tapReach } from './sky-layout';
import { SUN_RAY_REACH, WASH_FOOT_CLEAR, washRings } from './sun-layout';
import { VIEWPORTS, VISITS } from './viewports';
import { opened, relaidOn } from './visit-play';

/** A screen's name, as the sweeps know it. */
type Screen = (typeof VIEWPORTS)[number][0];

/**
 * The visits every rule is swept over, every species tried on every foot:
 * a dozen spread over `VISITS`.
 */
const RULED = VISITS.filter((_, index) => index % 160 === 0);

/** Every rule a grown mushroom keeps on the screen it grew on. */
const RULES = [
  'shown',
  'inside the edge margin',
  'out of the wash',
  'cap in view',
  'door in sight',
  'off the controls',
  'a finger wide',
] as const;
type Rule = (typeof RULES)[number];
/**
 * The rules the meadow keeps once turned: every mushroom in view, its cap
 * inside the edge margin. The rest are held on the screen a mushroom grows
 * on only (`roomFor`), and a turn is measured against them.
 */
const TURN_KEPT: ReadonlySet<Rule> = new Set([
  'shown',
  'inside the edge margin',
]);

/** Each species as the newest mushroom, by each rule, as the sweep names them. */
const MEASURES = MUSHROOM_SPECIES.flatMap((species) =>
  RULES.map((rule) => `${species}: ${rule}`),
);

/** Each screen's visits grown, the latest screen's only: its tests run one after another. */
let grown: { screen: string; meadows: Array<[number, Planted[]]> } = {
  screen: '',
  meadows: [],
};
function grownOn(
  name: Screen,
  width: number,
  height: number,
): Array<[number, Planted[]]> {
  if (grown.screen !== name) {
    grown = {
      screen: name,
      meadows: RULED.map((seed) => [
        seed,
        [...opened(seed, width, height, true).mushrooms],
      ]),
    };
  }
  return grown.meadows;
}

/**
 * The meadow as it stood as each of `mushrooms` grew, that one of every
 * species: `roomFor` admits a foot only where all four keep every rule
 * among the mushrooms already standing. The opening clump stands first, as
 * it opened.
 */
function asTheyGrew(mushrooms: readonly Planted[]): Planted[][] {
  const clump = mushrooms.filter(
    ({ foot }) => openingIndex(foot) !== undefined,
  );
  return [
    clump,
    ...mushrooms.flatMap((mushroom, index) =>
      openingIndex(mushroom.foot) === undefined
        ? MUSHROOM_SPECIES.map((species) => [
            ...mushrooms.slice(0, index),
            { ...mushroom, species },
          ])
        : [],
    ),
  ];
}

/** Every control's hit area, open pickers and all, and the sun's rays. */
function keepOff(layout: MeadowLayout): Array<Circle & { name: string }> {
  const { mute, releases, plus, minus, house, picker, housePicker, sun } =
    layout;
  const controls = [
    ...Object.entries({ mute, ...releases, plus, minus, house }).map(
      ([name, circle]) => ({ name, ...circle }),
    ),
    ...picker.map((circle, index) => ({ name: `pick ${index}`, ...circle })),
    ...housePicker.map((circle, index) => ({
      name: `furnish ${index}`,
      ...circle,
    })),
  ];
  return [
    ...controls.map((control) => ({ ...control, r: tapReach(control.r) })),
    { name: 'the sun', ...sun, r: sun.r * SUN_RAY_REACH },
  ];
}

/** Whether `circle` reaches into any of `outlines`. */
const reaches = (outlines: readonly Point[][], circle: Circle) =>
  outlines.some(
    (outline) =>
      containsPoint(outline, circle) ||
      distanceToEdge(outline, circle) < circle.r,
  );

/** A mushroom's tap area where it stands on screen. */
function standingArea({ genes, turn, placed }: Standing): Point[][] {
  return Object.values(tapArea(genes, turn)).map((outline) => placed(outline));
}

/** A rule broken, and how, as a sentence. */
type Fault = { rule: Rule; sentence: string };

/**
 * Every rule `meadow` breaks on `layout`, noting in `measured` each rule read
 * for the newest mushroom's species.
 */
function broken(
  meadow: readonly Planted[],
  layout: MeadowLayout,
  measured = new Set<string>(),
): Fault[] {
  const { width, sun, mushrooms: ground } = layout;
  const newest = meadow.at(-1);
  const note = (species: Species, rule: Rule) => {
    if (newest?.species === species) measured.add(`${species}: ${rule}`);
  };
  const faults: Fault[] = [];
  const fault = (rule: Rule, sentence: string) => {
    faults.push({ rule, sentence });
  };
  const stood = meadow.flatMap((mushroom) => {
    const place = placeIn(ground, mushroom);
    note(mushroom.species, 'shown');
    if (!place) {
      fault('shown', `${mushroom.id} off the screen`);
      return [];
    }
    return [{ mushroom, place, standing: standingAt(place, mushroom) }];
  });
  const wash = washRings(layout).at(-1) ?? 0;
  const controls = keepOff(layout);
  for (const { mushroom, place, standing } of stood) {
    const { id, species } = mushroom;
    const cap = capBox(standing);
    note(species, 'inside the edge margin');
    if (cap.left < EDGE_MARGIN || cap.right > width - EDGE_MARGIN) {
      fault(
        'inside the edge margin',
        `${id}'s ${species} cap past the edge margin`,
      );
    }
    note(species, 'out of the wash');
    if (
      Math.hypot(place.x - sun.x, place.y - sun.y) <
      wash + place.size * WASH_FOOT_CLEAR
    ) {
      fault('out of the wash', `${id}'s foot in the sun's wash`);
    }
    const nearer = stood.filter(
      (other) => other.standing.depth > standing.depth,
    );
    note(species, 'cap in view');
    for (const other of nearer) {
      // The clump's own two caps cross by design, as in the drawing.
      const clump = [mushroom, other.mushroom].every(
        (each) => openingIndex(each.foot) !== undefined,
      );
      const hidden = coverOf(cap, capBox(other.standing));
      if (!clump && hidden > MOST_HIDDEN) {
        fault(
          'cap in view',
          `${other.mushroom.id} hides ${(hidden * 100).toFixed(0)}% of ${id}'s ${species} cap`,
        );
      }
    }
    note(species, 'door in sight');
    const covers = nearer.map((other) => other.standing);
    const station = doorInSight(standing, covers);
    for (const part of ['painted', 'doorway'] as const) {
      const sight = sightOf(standing, station, part, covers);
      if (sight < IN_SIGHT) {
        fault(
          'door in sight',
          `${id}'s ${species} ${part} door ${(sight * 100).toFixed(0)}% in sight`,
        );
      }
    }
    const { genes, turn, placed } = standing;
    const area = tapArea(genes, turn);
    const canvas = toCanvas(place.size);
    const pad = fingerPad({
      cap: area.cap.map((point) => canvas(point)),
      gills: area.gills.map((point) => canvas(point)),
      stem: area.stem.map((point) => canvas(point)),
    });
    const head = boxAround(
      [...area.cap, ...area.gills].map((point) => canvas(point)),
    );
    note(species, 'a finger wide');
    if (Math.max(head.right - head.left, pad ? 2 * pad.r : 0) < FINGER_ACROSS) {
      fault('a finger wide', `${id}'s ${species} narrower than a finger`);
    }
    const [middle] = pad
      ? placed([{ x: pad.x / place.size, y: -pad.y / place.size }])
      : [];
    const outlines = standingArea(standing);
    note(species, 'off the controls');
    for (const { name, ...circle } of controls) {
      const onPad =
        middle !== undefined &&
        pad !== undefined &&
        Math.hypot(middle.x - circle.x, middle.y - circle.y) < pad.r + circle.r;
      if (onPad || reaches(outlines, circle)) {
        fault('off the controls', `${name} over ${id}'s ${species}`);
      }
    }
  }
  return faults;
}

/** Each of `meadow` the sun's rays reach into on `layout`, by id. */
function underSun(meadow: readonly Planted[], layout: MeadowLayout): string[] {
  const { sun, mushrooms: ground } = layout;
  const rays = { ...sun, r: sun.r * SUN_RAY_REACH };
  return meadow.flatMap((mushroom) => {
    const place = placeIn(ground, mushroom);
    if (!place) return [`${mushroom.id} off the screen`];
    const area = standingArea(standingAt(place, mushroom));
    return reaches(area, rays) ? [mushroom.id] : [];
  });
}

/** Which visit, how many standing, and on which screen, for an assertion's message. */
const where = (seed: number, stood: readonly Planted[], layout: MeadowLayout) =>
  `visit ${String(seed)}, ${String(stood.length)} standing, ${String(layout.width)}×${String(layout.height)}`;

describe('a meadow grown toward six', () => {
  for (const [name, width, height] of VIEWPORTS) {
    const screens = () => [
      meadowLayout(width, height, 1),
      meadowLayout(height, width, 1),
    ];

    it(`keeps every rule, whichever species grew on each foot, on a ${name} screen`, () => {
      const measured = new Set<string>();
      for (const [seed, meadow] of grownOn(name, width, height)) {
        const layout = opened(seed, width, height, false).layout;
        for (const stood of asTheyGrew(meadow)) {
          const faults = broken(stood, layout, measured);
          assert.deepEqual(
            faults.map(({ sentence }) => sentence),
            [],
            where(seed, stood, layout),
          );
        }
      }
      assert.deepEqual(
        MEASURES.filter((key) => !measured.has(key)),
        [],
        'left unmeasured',
      );
    });

    it(`keeps every mushroom in view, its cap inside the edge margin, once a meadow grown on a ${name} screen turns`, (t) => {
      const turnBroken = new Map<Rule, number>();
      let meadows = 0;
      for (const [seed, meadow] of grownOn(name, width, height)) {
        const { layout, flowers } = opened(seed, width, height, false);
        const stand = { layout, flowers, mushrooms: meadow, planted: [] };
        const turned = relaidOn(stand, seed, height, width);
        const faults = broken(meadow, turned);
        meadows += 1;
        for (const rule of new Set(faults.map((each) => each.rule))) {
          turnBroken.set(rule, (turnBroken.get(rule) ?? 0) + 1);
        }
        assert.deepEqual(
          faults
            .filter(({ rule }) => TURN_KEPT.has(rule))
            .map(({ sentence }) => sentence),
          [],
          where(seed, meadow, turned),
        );
      }
      t.diagnostic(
        `of ${String(meadows)} meadows turned: ${
          [...turnBroken]
            .map(([rule, count]) => `${rule} broken in ${String(count)}`)
            .join(', ') || 'every rule kept'
        }`,
      );
    });

    it(`keeps the sun's rays off the opening clump, in every visit, on a ${name} screen and on it turned`, () => {
      for (const seed of VISITS) {
        const clump = firstMeadow(mulberry32(seed)).mushrooms;
        for (const layout of screens()) {
          assert.deepEqual(
            underSun(clump, layout),
            [],
            where(seed, clump, layout),
          );
        }
      }
    });
  }
});
