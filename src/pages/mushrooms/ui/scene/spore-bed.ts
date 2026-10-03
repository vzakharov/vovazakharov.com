import type * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import type { Point } from '../../model/geometry';
import type { Spore } from '../../model/sprouting';
import { standAt, type Standing, UNPLACED, viewedOrLaid } from './bed-place';
import { type Laid, laidOf } from './clump-layout';
import { mix } from './colour';
import type { MeadowLayout } from './layout';
import type { Shown } from './mushroom-shown';
import { PALETTE } from './palette';
import { hazeAhead } from './repaint-queue';
import type { MeadowSound } from './sound';
import { crownOf, fall } from './spore-drift';
import { drawnAt, puffSpores } from './spores';
import { TAP_RADIUS } from './tap-reach';
import type { View } from './view';

/** A resting spore's radius, of the size a mushroom standing on its foot is laid out at. */
const DOT = 0.05;
/** The least radius a spore is drawn at, in px, so a far one still shows. */
const LEAST_DOT = 1.2;
/** How far a picked-up spore's puff opens, of its radius. */
const PICK_PUFF = 4;

/** A spore as the bed draws it: landed once its fall from the parent ends. */
type Dot = Standing & {
  circle: Phaser.GameObjects.Arc;
  spore: Spore;
  laid: Laid;
  landed: boolean;
};

/**
 * The meadow's spores on the ground, reconciled with the state by id: a new
 * one falls from its parent's crown and rests at its foot as a tiny dot,
 * sorted a shadow's step nearer than its row and hazed as a mushroom there
 * is; one gone is destroyed. The dots take no tap of their own: the meadow's
 * bare-ground tap asks `pickUp`, so a mushroom's outline wins over a dot.
 */
export class SporeBed {
  private readonly dots = new Map<string, Dot>();
  private view: View | undefined;
  private readonly scene: Phaser.Scene;
  private readonly voice: MeadowSound;
  /** The depth a falling spore and a pick-up's puff are drawn at, over everything. */
  private readonly flying: number;
  /** How much nearer than its row a resting dot sorts. */
  private readonly nearer: number;

  constructor(
    scene: Phaser.Scene,
    voice: MeadowSound,
    flying: number,
    nearer: number,
  ) {
    this.scene = scene;
    this.voice = voice;
    this.flying = flying;
    this.nearer = nearer;
  }

  /**
   * Shows `spores` laid out on `layout`, a new one falling from its parent
   * among `shown` unless the meadow is `opening` or the parent is not shown.
   */
  reconcile(
    spores: readonly Spore[],
    shown: ReadonlyMap<string, Shown>,
    layout: MeadowLayout,
    opening: boolean,
  ): void {
    const ids = new Set(spores.map(({ id }) => id));
    for (const [id, dot] of this.dots) {
      if (ids.has(id)) continue;
      dot.circle.destroy();
      this.dots.delete(id);
    }
    for (const spore of spores) {
      const laid = laidOf(layout.camera, spore);
      const dot = this.dots.get(spore.id);
      if (dot) this.stand(Object.assign(dot, { laid }));
      else this.add(spore, laid, shown, opening);
    }
  }

  /** Stands every dot where `view` sees its foot, hazed there. */
  follow(view: View): void {
    this.view = view;
    for (const dot of this.dots.values()) this.stand(dot);
  }

  /**
   * Picks up the nearest resting dot within `TAP_RADIUS` of `at`, on screen,
   * with a tiny puff and a soft pop, and names its spore; `undefined` where
   * no dot is in reach.
   */
  pickUp(at: Point): string | undefined {
    let nearest: Dot | undefined;
    let best = TAP_RADIUS;
    for (const dot of this.dots.values()) {
      const { x, y, drawn } = dot.stands;
      const apart = Math.hypot(x - at.x, y - at.y);
      if (!dot.landed || !drawn || apart > best) continue;
      [nearest, best] = [dot, apart];
    }
    if (!nearest) return undefined;
    const { circle, spore } = nearest;
    const r = circle.radius * PICK_PUFF;
    puffSpores(
      this.scene,
      () => ({ ...pick(circle, 'x', 'y'), r }),
      this.flying,
    );
    this.voice.pop();
    circle.destroy();
    this.dots.delete(spore.id);
    return spore.id;
  }

  private add(
    spore: Spore,
    laid: Laid,
    shown: ReadonlyMap<string, Shown>,
    opening: boolean,
  ): void {
    const parent = opening ? undefined : shown.get(spore.parent);
    const circle = this.scene.add.circle(0, 0, 1, PALETTE.spore);
    const dot = { circle, spore, laid, stands: UNPLACED, landed: !parent };
    this.dots.set(spore.id, dot);
    this.stand(dot);
    if (!parent) return;
    const crown = crownOf(parent.genes);
    fall(
      this.scene,
      () => drawnAt(parent, crown),
      () => pick(circle, 'x', 'y'),
      circle.radius,
      this.flying,
      spore.seed,
      () => {
        dot.landed = true;
        this.stand(dot);
      },
    );
  }

  /** Stands `dot` where the view, or else the layout, puts its foot, sized and hazed there. */
  private stand(dot: Dot): void {
    const { laid, spore, circle, landed } = dot;
    const r = laid.size * DOT;
    const place = viewedOrLaid(
      this.view,
      spore.foot,
      laid,
      r * 2,
      laid.opening,
    );
    dot.stands = place;
    standAt(circle, place, this.nearer);
    const haze =
      this.view && place.drawn ? hazeAhead(this.view, place) : laid.haze;
    circle
      .setRadius(Math.max(LEAST_DOT, r * place.zoom))
      .setFillStyle(mix(PALETTE.spore, PALETTE.air, haze))
      // An inked rim, as a falling spore has, so the pale dot reads on the grass.
      .setStrokeStyle(1, PALETTE.ink, 0.45 * (1 - haze))
      .setVisible(place.drawn && landed);
  }
}
