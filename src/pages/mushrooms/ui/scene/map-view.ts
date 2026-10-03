import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { flowerGenes, flowerHead } from '../../model/flower-genes';
import type { Box, Point } from '../../model/geometry';
import {
  type Camera,
  D_SEE,
  type Eye,
  type Eyed,
  OPENING_EYE,
} from '../../model/ground';
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
import { flowersOf } from './flower-plots';
import type { Stand } from './flower-sight';
import { iconLighting } from './hud';
import type { Lighting } from './ink';
import type { MushroomBed } from './mushroom-bed';
import { PALETTE } from './palette';
import { azimuthAt } from './panorama';
import { fillShape, strokeShape } from './shapes';
import { BUTTON_INSET } from './tap-reach';

/**
 * What the map is drawn from as it opens: the meadow as it stands, the eye,
 * the screen's pixel ratio, the seed its ground grows from, and where the
 * meadow seated each door.
 */
export type MapSnapshot = Eyed &
  AtRatio &
  Seeded & { stand: Stand; doors: Pick<MushroomBed, 'seatedDoor'> };

/** How long the map takes to unfold out of its button, and to fold back, in seconds. */
const UNFOLD = 0.3;
/** How far in from the sheet's edge the meadow is framed, in CSS px: room for the sun at the top. */
const MARGIN = 26;
const CORNER = 14;
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
const SUN_RADIUS = 7;
const SUN_RAYS = 8;
const CHILD_RADIUS = 5;
const ARROW = 16;
/** The wedge on the grass: a pale veil, edged in faint indigo. */
const WEDGE_ALPHA = 0.32;
const WEDGE_EDGE_ALPHA = 0.55;
/** How many rays the wedge's arc is sampled at. */
const WEDGE_RAYS = 48;

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
  private pen: Phaser.GameObjects.Graphics | undefined;
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
    this.pen = scene.make.graphics({}, false);
    this.sheet = scene.add
      .container(0, 0, [this.pen])
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
    const { isOpen, pen, sheet, catcher } = this;
    if (!isOpen || !shot || !pen || !sheet || !catcher) return;
    const { width, height, map } = shot.stand.layout;
    sheet.setPosition(map.x, map.y);
    pen.clear().setPosition(-map.x, -map.y);
    this.drawn = drawMap(pen, shot);
    // Afresh, so the catch takes the screen's size as it is now.
    catcher.removeInteractive().setSize(width, height).setInteractive();
  }

  /** Unfolds the sheet out of the button, or folds it back, scale and alpha both. */
  update(t: number): void {
    const shown = this.isOpen
      ? emerge(((t - this.openedAt) * EMERGE_DURATION) / UNFOLD)
      : sink(((t - this.closedAt) * SINK_DURATION) / UNFOLD);
    this.sheet
      ?.setVisible(shown > 0)
      .setScale(shown)
      .setAlpha(Math.min(1, shown));
  }
}

function drawMap(pen: Phaser.GameObjects.Graphics, shot: MapSnapshot): Drawn {
  const { stand, eye, ratio, seed, doors } = shot;
  const { width, height, camera, sun } = stand.layout;
  const hairline = 1 / ratio;
  const sheet = {
    left: BUTTON_INSET,
    top: BUTTON_INSET,
    width: width - 2 * BUTTON_INSET,
    height: height - 2 * BUTTON_INSET,
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
  pen
    .fillStyle(PALETTE.paper)
    .fillRoundedRect(sheet.left, sheet.top, sheet.width, sheet.height, CORNER);
  drawMapGround(pen, frame, ground, seed);
  pen
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
  drawSun(pen, { ...pick(middle, 'x'), y: sheet.top + MARGIN / 2 + 2 });
  drawView(pen, frame, eye, camera, ground);
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
  drawChild(pen, frame, eye);
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

/** The map's compass: a little sun at the top edge's middle, up being its azimuth. */
function drawSun(pen: Phaser.GameObjects.Graphics, { x, y }: Point): void {
  pen.lineStyle(2, PALETTE.sunRay);
  for (let ray = 0; ray < SUN_RAYS; ray++) {
    const angle = (ray / SUN_RAYS) * Math.PI * 2;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    pen.lineBetween(
      x + dx * SUN_RADIUS * 1.35,
      y + dy * SUN_RADIUS * 1.35,
      x + dx * SUN_RADIUS * 1.85,
      y + dy * SUN_RADIUS * 1.85,
    );
  }
  pen
    .fillStyle(PALETTE.sun)
    .fillCircle(x, y, SUN_RADIUS)
    .lineStyle(1.5, PALETTE.ink)
    .strokeCircle(x, y, SUN_RADIUS);
}

/** How far a ray from `start` on one axis, moving `step` a px along it, runs to `low` or `high`. */
const toEdge = (start: number, step: number, low: number, high: number) =>
  step > 0 ? (high - start) / step : step < 0 ? (low - start) / step : Infinity;

/**
 * The pale wedge of what the child sees: the view's half-angle either side of
 * his heading, `D_SEE` deep, cut off at `paper`. The eye stands inside it, so
 * the fan is star-shaped from there and cutting each ray clips it exactly.
 */
function drawView(
  pen: Phaser.GameObjects.Graphics,
  frame: MapFrame,
  eye: Eye,
  camera: Camera,
  paper: Box,
): void {
  const at = onMap(frame, eye);
  const half = (azimuthAt(camera, camera.width) - azimuthAt(camera, 0)) / 2;
  const angle = (heading: number) => {
    const along = headingOnMap(frame, heading);
    return Math.atan2(along.y, along.x);
  };
  const from = angle(eye.heading - half);
  const to = angle(eye.heading + half);
  const sweep = (to - from + 2 * Math.PI) % (2 * Math.PI);
  const deep = D_SEE * frame.scale;
  const rim = Array.from({ length: WEDGE_RAYS + 1 }, (_, i) => {
    const a = from + (sweep * i) / WEDGE_RAYS;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const reach = Math.min(
      deep,
      toEdge(at.x, dx, paper.left, paper.right),
      toEdge(at.y, dy, paper.top, paper.bottom),
    );
    return { x: at.x + dx * reach, y: at.y + dy * reach };
  });
  const wedge = [at, ...rim];
  fillShape(pen.fillStyle(PALETTE.hud, WEDGE_ALPHA), wedge);
  strokeShape(pen.lineStyle(1.5, PALETTE.inkCool, WEDGE_EDGE_ALPHA), wedge);
}

/** The child: an indigo dot where he stands, an arrow on his heading. */
function drawChild(
  pen: Phaser.GameObjects.Graphics,
  frame: MapFrame,
  { heading, ...eye }: Eye,
): void {
  const at = onMap(frame, eye);
  const along = headingOnMap(frame, heading);
  const tip = { x: at.x + along.x * ARROW, y: at.y + along.y * ARROW };
  const barb = (side: number) => ({
    x: tip.x - along.x * 6 + side * along.y * 4,
    y: tip.y - along.y * 6 - side * along.x * 4,
  });
  const left = barb(1);
  const right = barb(-1);
  pen
    .lineStyle(2.5, PALETTE.inkCool)
    .lineBetween(at.x, at.y, tip.x, tip.y)
    .fillStyle(PALETTE.inkCool)
    .fillTriangle(tip.x, tip.y, left.x, left.y, right.x, right.y)
    .fillCircle(at.x, at.y, CHILD_RADIUS)
    .lineStyle(1.5, PALETTE.hud)
    .strokeCircle(at.x, at.y, CHILD_RADIUS);
}
