import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { firstMeadow, type Planted } from '../../model/game';
import {
  type Circle,
  containsPoint,
  distanceToEdge,
  type Point,
} from '../../model/geometry';
import { OPENING_EYE } from '../../model/ground';
import { MUSHROOM_SPECIES, type Species } from '../../model/mushroom-genes';
import { tapArea } from '../../model/mushroom-outline';
import { openingIndex } from '../../model/placement';
import { mulberry32 } from '../../model/random';
import { aboutFoot } from './bed-place';
import {
  amongAt,
  capBox,
  hiddenOf,
  hidersOf,
  MOST_HIDDEN,
  PARTS,
  partSighted,
} from './cap-cover';
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
import { SUN_RAY_REACH } from './sun-layout';
import { tapReach } from './tap-reach';
import { ofLayout, viewAt } from './view';
import { type Screen, VIEWPORTS, VISITS } from './viewports';
import { opened } from './visit-play';

/**
 * The visits every rule is swept over, every species tried on every foot:
 * a dozen spread over `VISITS`.
 */
const RULED = VISITS.filter((_, index) => index % 160 === 0);

/** Every rule a grown mushroom keeps on the crop it grew on. */
const RULES = [
  'shown',
  'inside the edge margin',
  'cap in view',
  'stem in view',
  'door in sight',
  'off the controls',
] as const;
type Rule = (typeof RULES)[number];

/** Each species as the newest mushroom, by each rule, as the sweep names them. */
const MEASURES = MUSHROOM_SPECIES.flatMap((species) =>
  RULES.map((rule) => `${species}: ${rule}`),
);

/** Each screen's visits grown `+` by `+` on the opening crop, the latest screen's only: its tests run one after another. */
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
        [
          ...opened(seed, width, height, true, (layout) =>
            viewAt(layout.camera, OPENING_EYE),
          ).mushrooms,
        ],
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

/**
 * Where the opening view draws `points`, laid out on a thing whose foot the
 * layout stands at `laidFoot`, in CSS px on the screen: about its drawn foot,
 * as the bed draws it.
 */
function drawnAtOpening(
  layout: MeadowLayout,
  laidFoot: Point,
  points: readonly Point[],
): Point[] {
  const foot = ofLayout(
    viewAt(layout.camera, OPENING_EYE),
    laidFoot,
    laidFoot.y,
  );
  return points.map((point) => aboutFoot(foot, laidFoot, point));
}

/**
 * Every control's hit area, open pickers and all, and the sun's rays, where
 * they stand on the screen.
 */
function keepOff(layout: MeadowLayout): Array<Circle & { name: string }> {
  const { map, releases, plus, minus, house, picker, housePicker, sun } =
    layout;
  const controls = [
    ...Object.entries({ map, ...releases, plus, minus, house }).map(
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

/** A mushroom's tap area where it stands, in the layout's world px. */
function standingArea({ genes, turn, placed }: Standing): Point[][] {
  return Object.values(tapArea(genes, turn)).map((outline) => placed(outline));
}

/** A rule broken, and how, as a sentence. */
type Fault = { rule: Rule; sentence: string };

/**
 * Every rule `meadow` breaks on `layout`'s opening crop, noting in `measured` each rule read
 * for the newest mushroom's species.
 */
function broken(
  meadow: readonly Planted[],
  layout: MeadowLayout,
  measured = new Set<string>(),
): Fault[] {
  const { width, mushrooms: ground } = layout;
  const { world } = ground.camera;
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
    return [{ mushroom, place, ...amongAt(place, mushroom) }];
  });
  const controls = keepOff(layout);
  for (const one of stood) {
    const { mushroom, place, standing } = one;
    const { id, species } = mushroom;
    const cap = capBox(standing);
    const drawnCap = drawnAtOpening(layout, place, [
      { x: cap.left, y: cap.top },
      { x: cap.right, y: cap.bottom },
    ]).map(({ x }) => x);
    note(species, 'inside the edge margin');
    if (
      cap.left < EDGE_MARGIN ||
      cap.right > world - EDGE_MARGIN ||
      drawnCap.some((x) => x < EDGE_MARGIN || x > width - EDGE_MARGIN)
    ) {
      fault(
        'inside the edge margin',
        `${id}'s ${species} cap past the edge margin`,
      );
    }
    const nearer = stood.filter(
      (other) => other.standing.depth > standing.depth,
    );
    const covers = nearer.map((other) => other.standing);
    const hiding = hidersOf(one, stood);
    for (const part of PARTS) {
      const rule = `${part} in view` as const;
      note(species, rule);
      const hidden = hiddenOf(partSighted(standing, part, hiding));
      if (hidden > MOST_HIDDEN[part]) {
        fault(
          rule,
          `${(hidden * 100).toFixed(0)}% of ${id}'s ${species} ${part} hidden`,
        );
      }
    }
    note(species, 'door in sight');
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
    const outlines = standingArea(standing).map((outline) =>
      drawnAtOpening(layout, place, outline),
    );
    note(species, 'off the controls');
    for (const { name, ...circle } of controls) {
      if (reaches(outlines, circle)) {
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
