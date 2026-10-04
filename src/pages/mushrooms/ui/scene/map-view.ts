import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { flowerGenes, flowerHead } from '../../model/flower-genes';
import type { Point } from '../../model/geometry';
import { type Eyed, OPENING_EYE } from '../../model/ground';
import { type DoorPlace, doorStations, paintedSpots } from '../../model/house';
import {
  headingOnMap,
  type MapFrame,
  mapFrame,
  onMap,
  thingScale,
} from '../../model/map-frame';
import {
  emerge,
  EMERGE_DURATION,
  sink,
  SINK_DURATION,
} from '../../model/motion';
import { mushroomGenes } from '../../model/mushroom-genes';
import { OPENING_FEET } from '../../model/placement';
import type { Seeded } from '../../model/random';
import type { AtRatio } from './baking';
import { sizeOn } from './clump-layout';
import { paintFlowerHead, paintFlowerStem } from './draw-flower';
import { paintHouse } from './draw-house';
import { drawMapGround } from './draw-map-ground';
import { drawMushroom } from './draw-mushroom';
import { DUSK_WASH_DEEPEST } from './dusk-view';
import { flowersOf } from './flower-plots';
import type { Stand } from './flower-sight';
import { iconLighting } from './hud';
import type { Lighting } from './ink';
import { drawChild, drawView } from './map-child';
import { drawCompass } from './map-compass';
import type { MushroomBed } from './mushroom-bed';
import { PALETTE } from './palette';
import { DUSK } from './palette-dusk';
import { azimuthAt } from './panorama';
import { BUTTON_INSET } from './tap-reach';

/**
 * What the map is drawn from as it opens: the meadow as it stands, the eye,
 * the screen's pixel ratio, the seed its ground grows from, where the
 * meadow seated each door, and whether it is dusk (`dusky`), which puts the
 * moon on the compass.
 */
export type MapSnapshot = Eyed &
  AtRatio &
  Seeded & {
    stand: Stand;
    doors: Pick<MushroomBed, 'seatedDoor'>;
    dusky: boolean;
  };

/**
 * How far the dusk's deep ground lies over the map's paper and ground at full
 * dusk, under the wash: as dark as the dusk meadow's ground, the things on
 * the map left to the wash alone so they stand out on it.
 */
const DUSK_SHADE = 0.56;

/** How long the map takes to unfold out of its button, and to fold back, in seconds. */
const UNFOLD = 0.3;

/**
 * How far the sheet stands unfolded, its scale, `elapsed` seconds after it
 * was opened (`open`) or shut — and, the other way about, the map button's
 * disc, which folds away as the sheet comes out over it and back as it goes.
 */
export function unfolded(open: boolean, elapsed: number): number {
  return open
    ? emerge((elapsed * EMERGE_DURATION) / UNFOLD)
    : sink((elapsed * SINK_DURATION) / UNFOLD);
}
/** How far in from the sheet's edge the meadow is framed, in CSS px: room for the sun at the top. */
const MARGIN = 26;
const CORNER = 14;
/**
 * How far the sheet's edge keeps from the screen's, in CSS px: the buttons'
 * own inset, so it unfolds out to the line the shut map button's disc stands
 * on. Open, that disc is gone and only its bare cross stands over the
 * corner, well inside the edge.
 */
const SHEET_INSET = BUTTON_INSET;
/** The sheet's pale edge line: its width, and how far inside the ink it runs, in CSS px. */
const EDGE = 3;
/**
 * The least a mushroom's cap stands across on the map, in CSS px, a flower's
 * height, and its head across: floored apart, so the head's colour shows
 * past its ink on a stem that stays short.
 */
const LEAST_CAP = 12;
const LEAST_FLOWER = 9;
const LEAST_HEAD = 9;
/** The spore's dot against the clump's size, and its least radius in CSS px. */
const SPORE_RADIUS = 0.06;
const LEAST_SPORE = 2;

/** A thing on the map: where it stands there, and how it is painted at that point. */
type Mark = Point & { paint: () => void };

/**
 * The map as last drawn: its frame, how many things stand on it, every
 * flower where it shows, and the child's dot and the way he faces.
 */
type Drawn = {
  frame: MapFrame;
  things: number;
  flowers: Array<Point & { id: string }>;
  child: Point;
  ahead: Point;
};

/**
 * The map: a sheet of paper over the meadow that unfolds out of the map
 * button and folds back into it, drawn from a snapshot as it opens and again
 * on a resize — nothing walks while it is open. Up is the sun's azimuth; the
 * child is a dot with his heading and his view's wedge. Any tap while it is
 * open runs `tap`, the map button's own handler, so the two close it alike.
 */
export class MapView {
  private isOpen = false;
  private openedAt = -Infinity;
  private closedAt = -Infinity;
  private sheet: Phaser.GameObjects.Container | undefined;
  private layers: Layers | undefined;
  private catcher: Phaser.GameObjects.Zone | undefined;
  private drawn: Drawn | undefined;

  private readonly now: () => number;
  private readonly snapshot: () => MapSnapshot | undefined;
  /** Stops the meadow dead as the map opens over it: held keys, a glide, a fling. */
  private readonly halt: () => void;

  constructor(
    now: () => number,
    snapshot: () => MapSnapshot | undefined,
    halt: () => void,
  ) {
    this.now = now;
    this.snapshot = snapshot;
    this.halt = halt;
  }

  get open(): boolean {
    return this.isOpen;
  }

  /** The map as it was last drawn, `undefined` before it first opens. */
  get last(): Drawn | undefined {
    return this.drawn;
  }

  /** Makes the sheet and the catch for taps over everything at `depth` but the map button. */
  mount(scene: Phaser.Scene, depth: number, tap: () => void): void {
    const make = () => scene.make.graphics({}, false);
    const layers = {
      paper: make(),
      shade: make(),
      pen: make(),
      veil: make(),
      top: make(),
    };
    this.layers = layers;
    this.sheet = scene.add
      .container(0, 0, Object.values(layers))
      .setScrollFactor(0)
      .setDepth(depth)
      .setVisible(false);
    this.catcher = scene.add
      .zone(0, 0, 1, 1)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth);
    this.catcher.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, tap);
    if (this.isOpen) this.redraw();
  }

  flip(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.openedAt = this.now();
      this.halt();
      this.redraw();
    } else {
      this.closedAt = this.now();
      this.catcher?.removeInteractive();
    }
  }

  /** Draws the open map afresh, as the meadow and the screen stand now. */
  redraw(): void {
    const shot = this.snapshot();
    const { isOpen, layers, sheet, catcher } = this;
    if (!isOpen || !shot || !layers || !sheet || !catcher) return;
    const { width, height, map } = shot.stand.layout;
    sheet.setPosition(map.x, map.y);
    for (const layer of Object.values(layers)) {
      layer.clear().setPosition(-map.x, -map.y);
    }
    this.drawn = drawMap(layers, shot);
    // Afresh, so the catch takes the screen's size as it is now.
    catcher.removeInteractive().setSize(width, height).setInteractive();
  }

  /**
   * Unfolds the sheet out of the button, or folds it back, scale and alpha
   * both, and dims it as far as the meadow's `duskness`: its paper and
   * ground toward the dusk's deep ground, and the whole under the dusk wash.
   */
  update(t: number, duskness: number): void {
    this.layers?.shade.setAlpha(DUSK_SHADE * duskness);
    this.layers?.veil.setAlpha(DUSK_WASH_DEEPEST * duskness);
    const shown = unfolded(
      this.isOpen,
      t - (this.isOpen ? this.openedAt : this.closedAt),
    );
    this.sheet
      ?.setVisible(shown > 0)
      .setScale(shown)
      .setAlpha(Math.min(1, shown));
  }
}

/**
 * The map's layers, bottom up: the paper, its ground and the wedge
 * (`paper`); the dusk's deep ground over them (`shade`), as the meadow's
 * ground is baked toward it; the things on the map (`pen`); the dusk wash
 * over the sheet (`veil`); and what stands over the wash as the meadow's
 * lights do (`top`): the compass and the child.
 */
type Layers = Record<
  'paper' | 'shade' | 'pen' | 'veil' | 'top',
  Phaser.GameObjects.Graphics
>;

function drawMap(layers: Layers, shot: MapSnapshot): Drawn {
  const { paper, shade, pen, veil, top } = layers;
  const { stand, eye, ratio, seed, doors, dusky } = shot;
  const { width, height, camera, sun } = stand.layout;
  const hairline = 1 / ratio;
  const sheet = {
    left: SHEET_INSET,
    top: SHEET_INSET,
    width: width - 2 * SHEET_INSET,
    height: height - 2 * SHEET_INSET,
  };
  const middle = { x: width / 2, y: height / 2 };
  const flowers = flowersOf(stand);
  // The meadow a visit opens on: its clump, its seeded flowers, the eye.
  const fresh = [
    OPENING_EYE,
    ...OPENING_FEET,
    ...flowersOf({ ...stand, planted: [], pulled: [] }).map(({ foot }) => foot),
  ];
  const frame = mapFrame(
    azimuthAt(camera, sun.x),
    [
      eye,
      ...stand.mushrooms.map(({ foot }) => foot),
      ...stand.spores.map(({ foot }) => foot),
      ...flowers.map(({ foot }) => foot),
    ],
    fresh,
    {
      middle,
      width: sheet.width - 2 * MARGIN,
      height: sheet.height - 2 * MARGIN,
    },
  );
  // The ground, and the wedge over it, keep inside the paper's pale edge line.
  const inner = EDGE + EDGE / 2;
  const ground = {
    left: sheet.left + inner,
    right: sheet.left + sheet.width - inner,
    top: sheet.top + inner,
    bottom: sheet.top + sheet.height - inner,
    corner: CORNER - inner,
  };
  paper
    .fillStyle(PALETTE.paper)
    .fillRoundedRect(sheet.left, sheet.top, sheet.width, sheet.height, CORNER);
  drawMapGround(paper, frame, ground, seed);
  paper
    .lineStyle(EDGE, PALETTE.paperEdge)
    .strokeRoundedRect(
      sheet.left + EDGE,
      sheet.top + EDGE,
      sheet.width - 2 * EDGE,
      sheet.height - 2 * EDGE,
      CORNER - EDGE,
    )
    .lineStyle(2, PALETTE.ink)
    .strokeRoundedRect(
      sheet.left,
      sheet.top,
      sheet.width,
      sheet.height,
      CORNER,
    );
  // The compass at the top edge's middle.
  const compass = { ...pick(middle, 'x'), y: sheet.top + MARGIN / 2 + 2 };
  for (const [layer, colour] of [
    [shade, DUSK.groundDeep],
    [veil, PALETTE.duskWash],
  ] as const) {
    layer
      .fillStyle(colour)
      .fillRoundedRect(
        sheet.left,
        sheet.top,
        sheet.width,
        sheet.height,
        CORNER,
      );
  }
  drawCompass(top, compass, dusky);
  drawView(paper, frame, eye, camera, ground);
  const lighting = iconLighting(hairline);
  // A thing standing on `foot`, painted by `paint` round the origin, moved to
  // where it shows on the map.
  const markOn = (foot: Point, paint: () => void): Mark => {
    const at = onMap(frame, foot);
    return {
      ...at,
      paint: () => {
        pen.save();
        pen.translateCanvas(at.x, at.y);
        paint();
        pen.restore();
      },
    };
  };
  const marks: Mark[] = [
    ...stand.spores.map(({ foot }) =>
      markOn(foot, () => {
        const r = Math.max(LEAST_SPORE, frame.scale * SPORE_RADIUS);
        pen
          .fillStyle(PALETTE.spore)
          .fillCircle(0, 0, r)
          .lineStyle(1, PALETTE.ink, 0.45)
          .strokeCircle(0, 0, r);
      }),
    ),
    ...flowers.map((flower) =>
      markOn(flower.foot, () => {
        const genes = flowerGenes(flower);
        const size = thingScale(frame, flower.foot.size, LEAST_FLOWER);
        const head = flowerHead(genes, size);
        const headSize = Math.max(size, LEAST_HEAD / (2 * genes.petalLength));
        paintFlowerStem(pen, genes, size, lighting);
        pen.translateCanvas(head.x, head.y);
        paintFlowerHead(pen, genes, headSize, lighting);
      }),
    ),
    ...stand.mushrooms.map((mushroom) =>
      markOn(mushroom.foot, () => {
        const grown = mushroomGenes(mushroom);
        const genes = {
          ...grown,
          spots: paintedSpots(grown, mushroom.house),
        };
        const least = LEAST_CAP / genes.capWidth;
        const size = thingScale(frame, sizeOn(mushroom.foot), least);
        drawMushroom(pen, genes, size, lighting);
        const seat = doors.seatedDoor(mushroom.id);
        paintHome(pen, genes, size, mushroom.house, seat, lighting);
      }),
    ),
  ];
  // Farther up the map first, so the nearer the bottom draws over it.
  for (const mark of marks.toSorted((a, b) => a.y - b.y)) mark.paint();
  drawChild(top, frame, eye);
  return {
    frame,
    things: marks.length,
    flowers: flowers.map(({ id, foot }) => ({ id, ...onMap(frame, foot) })),
    child: onMap(frame, eye),
    ahead: headingOnMap(frame, eye.heading),
  };
}

type Genes = Parameters<typeof paintHouse>[1];

/**
 * A mushroom's windows and door as the map draws it. The meadow seats a door
 * on the stem it splays, which the map does not; its station here is the one
 * at the height of `seat`, or the lowest while the meadow has seated none.
 */
function paintHome(
  pen: Phaser.GameObjects.Graphics,
  genes: Genes,
  size: number,
  house: Parameters<typeof paintedSpots>[1],
  seat: DoorPlace | undefined,
  lighting: Lighting,
): void {
  if (house.windows.length === 0 && !house.door) return;
  const stations = house.door ? doorStations(genes) : [];
  // Stations run up the stem, so with no seat the first is the lowest.
  const off = ({ y }: DoorPlace) => (seat ? Math.abs(y - seat.y) : 0);
  const station = stations.toSorted((a, b) => off(a) - off(b))[0];
  const door = station && {
    station,
    popped: 1,
    out: 0,
    open: 0,
    look: 0,
    shut: false,
  };
  const windows = house.windows.map((kind) => ({ kind, popped: 1 }));
  const brush = {
    ink: Math.max(1, size * 0.02),
    tone: (colour: number) => colour,
    lighting,
  };
  paintHouse(pen, genes, size, windows, door, brush);
}
