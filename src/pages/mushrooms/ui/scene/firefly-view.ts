import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';
import type { WithId } from '@/shared/typings';

import {
  awake,
  circling,
  fireflies,
  type FireflyGenes,
  flare,
  hostFor,
  tailGlow,
} from '../../model/firefly';
import { lerpPoint, type Point } from '../../model/geometry';
import { CLUMP_DISTANCE } from '../../model/ground';
import { smooth, type TapTimed } from '../../model/motion';
import { capSeat } from '../../model/mushroom-pose';
import type { Seeded } from '../../model/random';
import { tappedFirefly } from './firefly-tap';
import type { CircleFigure } from './hit-areas';
import type { MeadowLayout } from './layout';
import { PALETTE } from './palette';
import type { PerchHosts, Seat } from './perch-hosts';
import type { Scened } from './planter';
import type { MeadowSound } from './sound';
import { TAP_RADIUS } from './tap-reach';
import { tuftUnder } from './tufts';

/** How many of the nearest hosts the fireflies spread over. */
const NEAREST = 6;
/** How long a firefly takes to fly over to a new host, in seconds. */
const GLIDE = 1.2;
/** How much bigger a flaring firefly's halo grows. */
const FLARE_SWELL = 0.7;
/** How much nearer, and so bigger, a firefly reads on the front of its ring than at its middle. */
const RING_DEPTH = 0.12;
/** A firefly's body length and width, its tail's light and its halo's rings, each radius with its alpha, in the insects' unit. */
const BODY = { length: 0.3, width: 0.14 } as const;
const TAIL = 0.07;
/** The tail's light at the pulse's ebb, against its halo's: the light itself never dims far. */
const TAIL_EBB = 0.6;
const HALO = [
  [0.55, 0.1],
  [0.36, 0.16],
  [0.2, 0.32],
] as const;
/** How many texels a baked shape spends on each device pixel at a firefly's own size, so a near or flaring one stays crisp. */
const OVERSAMPLE = 2;
/** The baked shapes, each drawn about its texture's middle. */
const BAKED = {
  halo: 'firefly-halo',
  body: 'firefly-body',
  tail: 'firefly-tail',
} as const;
type Part = keyof typeof BAKED;

/** What the fireflies circle — the meadow's mushrooms, and the beds that draw them and the flowers — and the visit's seed the dozen grow from. */
export type FireflyGround = Pick<Scened, 'meadow'> &
  Seeded & {
    beds: () => Pick<PerchHosts, 'bed' | 'flowers'>;
  };

type Shown = CircleFigure &
  TapTimed & {
    genes: FireflyGenes;
    /** The halo, added over what lies under it, apart from the body so every halo draws in one batch. */
    glow: Phaser.GameObjects.Container;
    halo: Phaser.GameObjects.Image;
    body: Phaser.GameObjects.Image;
    tail: Phaser.GameObjects.Image;
    /** The host it circles, as `hostKey` names it, while awake. */
    host?: string;
    /** Where it was drawn as it left its last host, and when, so it glides to the next. */
    left?: Point & { at: number };
    /** Where it was drawn last frame, and how far its tap's flare had it (`flare`'s glow). */
    drawn?: Point;
    flaring: number;
  };

/** A host and where it stands this frame. */
type Hosted = WithId & { seat: Seat };

/**
 * The fireflies of dusk, drawn at `DuskView.glowDepth` over the wash: each
 * circles a mushroom or a flower near the eye (`model/firefly.ts`), keeps it
 * while it stays on the screen and glides to another when it goes; a tap
 * flares one and lifts it before it settles back to its ring. Each is two
 * containers moved together, its halo's and its body's, and every halo is
 * made before every body, so the dozen draw in two batches rather than one
 * per firefly. Every shape is a texture baked in `paint`.
 */
export class FireflyView {
  private readonly scene: Phaser.Scene;
  private readonly shown: Shown[];
  private readonly ground: FireflyGround;
  private readonly now: () => number;
  private readonly voice: Pick<MeadowSound, 'glint'>;
  private unit = 0;
  /** The screen's width, in CSS px, a flare's chime is panned across. */
  private width = 0;
  /** The texels the shapes were baked at for each CSS pixel. */
  private texel = 1;

  constructor(
    scene: Phaser.Scene,
    depth: number,
    now: () => number,
    ground: FireflyGround,
    voice: Pick<MeadowSound, 'glint'>,
  ) {
    this.now = now;
    this.voice = voice;
    this.ground = ground;
    this.scene = scene;
    const glows = fireflies(ground.seed).map((genes) => {
      const halo = scene.add.image(0, 0, '__WHITE');
      // Each container holds a blend mode of its own, so the dozen share one
      // drawing context: a container without one starts a new context, and
      // with it a batch, whenever its child's mode or the one it is handed
      // differs from normal.
      const glow = scene.add
        .container(0, 0, [halo])
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(depth)
        .setVisible(false);
      return { genes, glow, halo };
    });
    this.shown = glows.map(({ genes, glow, halo }, index) => {
      const body = scene.add.image(0, 0, '__WHITE');
      const tail = scene.add.image(0, 0, '__WHITE');
      const hit = new Phaser.Geom.Circle(0, 0, TAP_RADIUS);
      const container = scene.add
        .container(0, 0, [body, tail])
        .setBlendMode(Phaser.BlendModes.NORMAL)
        .setDepth(depth)
        .setVisible(false)
        .setInteractive(
          hit,
          (area: Phaser.Geom.Circle, x: number, y: number) =>
            Phaser.Geom.Circle.Contains(area, x, y) &&
            this.tapped(container, x, y) === String(index),
        );
      const parts = { genes, container, glow, halo, body, tail, hit };
      const shown: Shown = { ...parts, tappedAt: -Infinity, flaring: 0 };
      // A firefly is not the meadow: its tap leaves the selection as it is.
      container.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        shown.tappedAt = this.now();
        const across = this.width > 0 ? container.x / this.width : 0.5;
        this.voice.glint(Math.min(1, Math.max(-1, 2 * across - 1)));
      });
      return shown;
    });
  }

  /**
   * Which firefly a tap at `x`, `y` in `container`'s frame goes to, by its
   * place in the dozen (`tappedFirefly`): only where nothing else on the
   * scene answers it (`othersAnswer`) and no bare tuft holds it.
   */
  private tapped(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
  ): string | undefined {
    const finger = container
      .getWorldTransformMatrix()
      .transformPoint(x, y, { x: 0, y: 0 });
    const targets = this.shown.flatMap(({ container: each, hit }, index) =>
      each.visible
        ? [
            {
              ...pick(each, 'x', 'y'),
              id: String(index),
              r: hit.radius * each.scaleX,
            },
          ]
        : [],
    );
    const dozen = new Set(this.shown.map(({ container: each }) => each));
    return tappedFirefly(
      finger,
      targets,
      () =>
        othersAnswer(this.scene, finger, dozen) ||
        tuftUnder(this.scene, finger),
    );
  }

  /** Bakes every firefly's shapes at the insects' size on `layout`. */
  paint(layout: MeadowLayout): void {
    const unit = layout.insectSize;
    this.unit = unit;
    this.width = layout.width;
    // The camera's zoom is the device pixel ratio, which the layout's CSS
    // pixels are drawn at.
    const texel = this.scene.cameras.main.zoom * OVERSAMPLE;
    const { body: dark, tail: light, halo: glow } = PALETTE.firefly;
    const [length, width] = [BODY.length * unit, BODY.width * unit];
    // The tail is the body's back third, which the light sits in.
    const back = -length * 0.3;
    const head = width * 0.38;
    const [outer] = HALO[0];
    this.bake('halo', outer * unit, outer * unit, texel, (graphics) => {
      for (const [r, alpha] of HALO) {
        graphics.fillStyle(glow, alpha).fillCircle(0, 0, r * unit);
      }
    });
    this.bake('body', length / 2 + head, width / 2, texel, (graphics) => {
      graphics
        .fillStyle(dark, 1)
        .fillEllipse(0, 0, length, width)
        .fillCircle(length * 0.5, 0, head);
    });
    this.bake('tail', TAIL * unit, width * 0.4, texel, (graphics) => {
      graphics
        .fillStyle(light, 1)
        .fillEllipse(0, 0, TAIL * 2 * unit, width * 0.8);
    });
    for (const { halo, body, tail } of this.shown) {
      // About the tail, so a flare swells it there.
      halo.setTexture(BAKED.halo).setPosition(back, 0);
      body.setTexture(BAKED.body).setScale(1 / texel);
      tail
        .setTexture(BAKED.tail)
        .setScale(1 / texel)
        .setPosition(back, 0);
    }
    this.texel = texel;
  }

  /**
   * Bakes `part` as `draw` paints it about the origin, in CSS pixels,
   * reaching `across` and `down` either way, at `texel` texels a pixel.
   */
  private bake(
    part: Part,
    across: number,
    down: number,
    texel: number,
    draw: (graphics: Phaser.GameObjects.Graphics) => void,
  ): void {
    const { textures, make } = this.scene;
    const key = BAKED[part];
    if (textures.exists(key)) textures.remove(key);
    // A texel of room each side, for the edge's antialiasing.
    const span = (reach: number) =>
      Math.max(2, Math.ceil(2 * reach * texel) + 2);
    const [wide, tall] = [span(across), span(down)];
    const graphics = make.graphics({}, false);
    graphics.translateCanvas(wide / 2, tall / 2).scaleCanvas(texel, texel);
    draw(graphics);
    graphics.generateTexture(key, wide, tall).destroy();
  }

  /** Sets every firefly for the frame `level` of the way to dusk, at the scene's clock. */
  update(level: number): void {
    const t = this.now();
    let hosts: Hosted[] | undefined;
    const taken = new Map<string, number>();
    for (const { host } of this.shown) {
      if (host !== undefined) taken.set(host, (taken.get(host) ?? 0) + 1);
    }
    for (const shown of this.shown) {
      const woke = awake(shown.genes, level);
      if (woke <= 0) {
        hide(shown);
        shown.host = undefined;
        shown.left = undefined;
        shown.drawn = undefined;
        continue;
      }
      let seat = shown.host === undefined ? undefined : this.seatOf(shown.host);
      if (!seat) {
        hosts ??= this.hosts();
        const lost = shown.host;
        if (lost !== undefined) taken.set(lost, (taken.get(lost) ?? 1) - 1);
        const ids = hosts.map(({ id }) => id);
        shown.host = hostFor(ids, taken, NEAREST);
        if (shown.host !== undefined) {
          taken.set(shown.host, (taken.get(shown.host) ?? 0) + 1);
        }
        seat = hosts.find(({ id }) => id === shown.host)?.seat;
        if (shown.drawn) shown.left = { ...shown.drawn, at: t };
      }
      this.draw(shown, seat, woke, t);
    }
  }

  /** Draws `shown` round `seat` at `t`, `woke` of the way lit. */
  private draw(
    shown: Shown,
    seat: Seat | undefined,
    woke: number,
    t: number,
  ): void {
    const { container, glow, halo, tail, genes, hit, left, tappedAt } = shown;
    if (!seat) {
      hide(shown);
      shown.drawn = undefined;
      return;
    }
    const own = CLUMP_DISTANCE / seat.on.stands.ahead;
    const size = this.unit * own;
    const ring = circling(genes, t);
    const flared = flare(t - tappedAt);
    const scale = own * (1 + RING_DEPTH * ring.front);
    let at = {
      x: seat.drawn.x + ring.x * size,
      y: seat.drawn.y + (ring.y - flared.lift) * size,
    };
    if (left) {
      const way = (t - left.at) / GLIDE;
      const eased = smooth(way);
      at = lerpPoint(left, at, eased);
      if (way >= 1) shown.left = undefined;
    }
    shown.drawn = at;
    shown.flaring = flared.glow;
    const lit = Math.min(1, tailGlow(genes, t) + flared.glow);
    for (const part of [container, glow]) {
      part
        .setVisible(true)
        .setPosition(at.x, at.y)
        .setScale(scale)
        .setRotation(ring.heading)
        .setAlpha(woke);
    }
    halo.setAlpha(lit).setScale((1 + FLARE_SWELL * flared.glow) / this.texel);
    tail.setAlpha(TAIL_EBB + (1 - TAIL_EBB) * lit);
    hit.radius = TAP_RADIUS / scale;
  }

  /** Where the host `key` names stands this frame, while it is drawn on the screen. */
  private seatOf(key: string): Seat | undefined {
    const { bed, flowers } = this.ground.beds();
    const colon = key.indexOf(':');
    const id = key.slice(colon + 1);
    const seat =
      key.slice(0, colon) === 'cap'
        ? bed?.seat(id, (genes) => capSeat(genes, 0))
        : flowers?.seat(id, 0, 'butterfly');
    return seat?.on.stands.drawn === true ? seat : undefined;
  }

  /** Every mushroom and every flower in view a firefly may circle, as they stand this frame, nearest first. */
  private hosts(): Hosted[] {
    const { flowers } = this.ground.beds();
    const keys = [
      ...(this.ground.meadow()?.mushrooms ?? []).map(({ id }) => `cap:${id}`),
      ...(flowers?.inView() ?? []).map(({ id }) => `flower:${id}`),
    ];
    const distance = ({ seat }: Hosted) => seat.on.stands.distance;
    return keys
      .flatMap((id) => {
        const seat = this.seatOf(id);
        return seat ? [{ id, seat }] : [];
      })
      .toSorted((a, b) => distance(a) - distance(b));
  }
}

function hide({ container, glow }: Shown): void {
  container.setVisible(false);
  glow.setVisible(false);
}

/**
 * Whether any interactive object on `scene` but `skip`'s, shown and enabled,
 * holds `world` in its hit area, as Phaser's own hit test finds it: through
 * each object's scroll factor and parents, its display origin, and its own
 * hit callback.
 */
function othersAnswer(
  scene: Phaser.Scene,
  world: Point,
  skip: ReadonlySet<Phaser.GameObjects.GameObject>,
): boolean {
  const { manager } = scene.input;
  const { scrollX, scrollY } = scene.cameras.main;
  const local = new Phaser.Math.Vector2();
  const holds = (object: Placed): boolean => {
    if (object.input?.enabled !== true) return false;
    object
      .getWorldTransformMatrix()
      .applyInverse(
        world.x + scrollX * object.scrollFactorX - scrollX,
        world.y + scrollY * object.scrollFactorY - scrollY,
        local,
      );
    return manager.pointWithinHitArea(object, local.x, local.y);
  };
  const probe = (list: readonly Phaser.GameObjects.GameObject[]): boolean =>
    list.some((object) => {
      if (skip.has(object) || !placed(object) || !object.visible) return false;
      if (holds(object)) return true;
      return (
        object instanceof Phaser.GameObjects.Container && probe(object.list)
      );
    });
  return probe(scene.children.list);
}

/** A game object placed on the screen, as Phaser's hit test reads it. */
type Placed = Phaser.GameObjects.GameObject &
  Phaser.GameObjects.Components.Transform &
  Phaser.GameObjects.Components.ScrollFactor &
  Phaser.GameObjects.Components.Visible;

function placed(object: Phaser.GameObjects.GameObject): object is Placed {
  return (
    'getWorldTransformMatrix' in object &&
    'scrollFactorX' in object &&
    'visible' in object
  );
}
