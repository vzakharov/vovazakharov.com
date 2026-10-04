import * as Phaser from 'phaser';

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
import type { Point } from '../../model/geometry';
import { CLUMP_DISTANCE } from '../../model/ground';
import { smooth, type TapTimed } from '../../model/motion';
import { capSeat } from '../../model/mushroom-pose';
import type { Seeded } from '../../model/random';
import { type CircleFigure, containsCircle } from './hit-areas';
import type { MeadowLayout } from './layout';
import { PALETTE } from './palette';
import type { PerchHosts, Seat } from './perch-hosts';
import type { Scened } from './planter';
import { TAP_RADIUS } from './tap-reach';

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

/** What the fireflies circle — the meadow's mushrooms, and the beds that draw them and the flowers — and the visit's seed the dozen grow from. */
export type FireflyGround = Pick<Scened, 'meadow'> &
  Seeded & {
    beds: () => Pick<PerchHosts, 'bed' | 'flowers'>;
  };

type Shown = CircleFigure &
  TapTimed & {
    genes: FireflyGenes;
    halo: Phaser.GameObjects.Graphics;
    body: Phaser.GameObjects.Graphics;
    tail: Phaser.GameObjects.Graphics;
    /** The host it circles, as `hostKey` names it, while awake. */
    host?: string;
    /** Where it was drawn as it left its last host, and when, so it glides to the next. */
    left?: Point & { at: number };
    /** Where it was drawn last frame. */
    drawn?: Point;
  };

/** A host and where it stands this frame. */
type Hosted = WithId & { seat: Seat };

/**
 * The fireflies of dusk, drawn at `DuskView.glowDepth` over the wash: each
 * circles a mushroom or a flower near the eye (`model/firefly.ts`), keeps it
 * while it stays on the screen and glides to another when it goes; a tap
 * flares one and lifts it before it settles back to its ring.
 */
export class FireflyView {
  private readonly shown: Shown[];
  private readonly ground: FireflyGround;
  private readonly now: () => number;
  private unit = 0;

  constructor(
    scene: Phaser.Scene,
    depth: number,
    now: () => number,
    ground: FireflyGround,
  ) {
    this.now = now;
    this.ground = ground;
    this.shown = fireflies(ground.seed).map((genes) => {
      const halo = scene.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
      const body = scene.add.graphics();
      const tail = scene.add.graphics();
      const hit = new Phaser.Geom.Circle(0, 0, TAP_RADIUS);
      const container = scene.add
        .container(0, 0, [halo, body, tail])
        .setDepth(depth)
        .setVisible(false)
        .setInteractive(hit, containsCircle);
      const parts = { genes, container, halo, body, tail, hit };
      const shown: Shown = { ...parts, tappedAt: -Infinity };
      // A firefly is not the meadow: its tap leaves the selection as it is.
      container.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        shown.tappedAt = this.now();
      });
      return shown;
    });
  }

  /** Draws every firefly at the insects' size on `layout`. */
  paint(layout: MeadowLayout): void {
    const unit = layout.insectSize;
    this.unit = unit;
    const { body: dark, tail: light, halo: glow } = PALETTE.firefly;
    const [length, width] = [BODY.length * unit, BODY.width * unit];
    // The tail is the body's back third, which the light sits in.
    const back = -length * 0.3;
    for (const { halo, body, tail } of this.shown) {
      // About the tail, so a flare swells it there.
      halo.clear().setPosition(back, 0);
      for (const [r, alpha] of HALO) {
        halo.fillStyle(glow, alpha).fillCircle(0, 0, r * unit);
      }
      body
        .clear()
        .fillStyle(dark, 1)
        .fillEllipse(0, 0, length, width)
        .fillCircle(length * 0.5, 0, width * 0.38);
      tail
        .clear()
        .fillStyle(light, 1)
        .fillEllipse(back, 0, TAIL * 2 * unit, width * 0.8);
    }
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
        shown.container.setVisible(false);
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
    const { container, halo, tail, genes, hit, left, tappedAt } = shown;
    if (!seat) {
      container.setVisible(false);
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
      at = {
        x: left.x + (at.x - left.x) * eased,
        y: left.y + (at.y - left.y) * eased,
      };
      if (way >= 1) shown.left = undefined;
    }
    shown.drawn = at;
    const glow = Math.min(1, tailGlow(genes, t) + flared.glow);
    container
      .setVisible(true)
      .setPosition(at.x, at.y)
      .setScale(scale)
      .setRotation(ring.heading)
      .setAlpha(woke);
    halo.setAlpha(glow).setScale(1 + FLARE_SWELL * flared.glow);
    tail.setAlpha(TAIL_EBB + (1 - TAIL_EBB) * glow);
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
