import type * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import type { Action } from '../../model/game';
import type { Circle, Point } from '../../model/geometry';
import { widthFor, wobble } from '../../model/motion';
import { type Rain, raining } from '../../model/weather';
import type { MeadowLayout } from './layout';
import type { Backdrop } from './paint-backdrop';
import { PALETTE } from './palette';
import { driftedAzimuth } from './panorama';
import {
  cloudAt,
  cloudDarkness,
  cloudLag,
  nextShowers,
  NO_SHOWERS,
  rainbowShown,
  type Showers,
  WASH_DEEPEST,
  wetnessShown,
} from './rain-sky';

/** How the sky stands this frame, as the probe reads it. */
export type SkyShown = { raining: boolean; wetness: number; rainbow: number };

/**
 * The rain over the meadow: the cloud taps that start a shower, each cloud's
 * dark twin crossfaded in, the tapped cloud first, and the slate wash over
 * everything under the HUD. Every level is set each frame from the clock and
 * the meadow's span (`rain-sky.ts`), so a repaint never interrupts a shower.
 * Which cloud was tapped is the scene's alone: the model has no clouds.
 */
export class RainView {
  private readonly wash: Phaser.GameObjects.Rectangle;
  /** The scene's clock, in seconds. */
  private readonly now: () => number;
  private readonly dispatch: (action: Action) => void;
  private layout: MeadowLayout | undefined;
  private backdrop: Backdrop | undefined;
  private showers: Showers = NO_SHOWERS;
  /** The cloud whose tap started the shower, which the others darken after. */
  private lead: number | undefined;
  /** The cloud tapped last, which the drops fall densest under. */
  tapped: number | undefined;
  /** The cloud tapped last, wobbling, and when, in seconds. */
  private wobbling: { index: number; at: number } | undefined;
  /** The sky as the last frame set it. */
  shown: SkyShown = { raining: false, wetness: 0, rainbow: 0 };

  /**
   * The wash lies just under `hudDepth`, over every creature, leaving the
   * one depth between it and the HUD for the drops and their splashes.
   */
  constructor(
    scene: Phaser.Scene,
    hudDepth: number,
    now: () => number,
    dispatch: (action: Action) => void,
  ) {
    this.now = now;
    this.dispatch = dispatch;
    this.wash = scene.add
      .rectangle(0, 0, 1, 1, PALETTE.rainWash)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(hudDepth - 2)
      .setAlpha(0);
  }

  /** Lays the wash over `layout`'s screen and takes the clouds `backdrop` painted on it. */
  paint(layout: MeadowLayout, backdrop: Backdrop): void {
    this.layout = layout;
    this.backdrop = backdrop;
    this.wash.setSize(layout.width, layout.height);
  }

  /** Each cloud where the screen shows it now, or `undefined` while it is off it. */
  placed(): Array<Circle | undefined> {
    const { layout, backdrop } = this;
    if (!layout || !backdrop) return [];
    return backdrop.clouds.map(({ x, visible }, index) => {
      const cloud = layout.clouds[index];
      return cloud && visible ? { x, ...pick(cloud, 'y', 'r') } : undefined;
    });
  }

  /**
   * Starts or restarts the shower if a tap at the camera's world point
   * `{ x, y }` lands on a cloud, which wobbles; whether it did. The clouds
   * stand on the screen, which the camera's `bob` scrolls the world past.
   */
  tap({ x, y }: Point, bob: number): boolean {
    const index = cloudAt({ x, y: y - bob }, this.placed());
    if (index === undefined) return false;
    const t = this.now();
    const ms = t * 1000;
    if (!raining(this.showers.span, ms)) this.lead = index;
    this.tapped = index;
    this.wobble(index, t);
    this.dispatch({ kind: 'rain', now: ms });
    return true;
  }

  /** Sets the sky for the frame at the scene's clock, under the meadow's span `rain`. */
  update(rain: Rain | undefined): void {
    const { backdrop, layout, wash, now } = this;
    if (!backdrop || !layout) return;
    const t = now();
    const ms = t * 1000;
    this.showers = nextShowers(this.showers, rain, ms);
    const { showers, lead } = this;
    const wetness = wetnessShown(showers, ms);
    wash.setAlpha(WASH_DEEPEST * wetness).setVisible(wetness > 0);
    const azimuthOf = (index: number) => {
      const cloud = layout.clouds[index];
      return cloud && driftedAzimuth(cloud, backdrop.drifted);
    };
    const leadAzimuth = lead === undefined ? undefined : azimuthOf(lead);
    for (const [index, twin] of backdrop.rainClouds.entries()) {
      const azimuth = azimuthOf(index);
      if (!twin.visible || azimuth === undefined) continue;
      twin.setAlpha(cloudDarkness(showers, ms, cloudLag(azimuth, leadAzimuth)));
    }
    this.sway(t);
    this.shown = {
      raining: raining(showers.span, ms),
      wetness,
      rainbow: rainbowShown(showers, ms),
    };
  }

  /** How many drops are falling now. */
  dropsInAir(): number {
    return 0;
  }

  private wobble(index: number, t: number): void {
    if (this.wobbling && this.wobbling.index !== index) {
      this.scaleCloud(this.wobbling.index, 0);
    }
    this.wobbling = { index, at: t };
  }

  /** Squashes and stretches the cloud tapped last, and lets it rest once its wobble is over. */
  private sway(t: number): void {
    const { wobbling } = this;
    if (!wobbling) return;
    const stretch = wobble(t - wobbling.at);
    this.scaleCloud(wobbling.index, stretch);
    if (stretch === 0) this.wobbling = undefined;
  }

  private scaleCloud(index: number, stretch: number): void {
    const { backdrop } = this;
    for (const graphics of [
      backdrop?.clouds[index],
      backdrop?.rainClouds[index],
    ]) {
      graphics?.setScale(widthFor(stretch), 1 + stretch);
    }
  }
}
