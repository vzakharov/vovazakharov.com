import type * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import { type Dusk, duskness } from '../../model/dusk';
import type { Action, Meadow } from '../../model/game';
import type { Circle, Point } from '../../model/geometry';
import type { Layered } from '../../model/ground';
import {
  cloudOverMoon,
  darkScheme,
  moonAt,
  moonUp,
  onTheSun,
  sunOnScreen,
  sunSunk,
} from './dusk-sky';
import { type FireflyGround, FireflyView } from './firefly-view';
import type { MeadowLayout } from './layout';
import { MoonView } from './moon-view';
import type { Backdrop } from './paint-backdrop';
import { PALETTE } from './palette';
import type { MeadowSound } from './sound';

/** The dusk wash's alpha at full dusk. */
export const DUSK_WASH_DEEPEST = 0.38;

/** The meadow's dusk as the houses' windows light by it, and the depth over the dusk wash they are drawn at. */
export type Lights = Pick<Meadow, 'dusk'> & Layered;

/**
 * What the turning light asks of the meadow's sound: a sinking slide toward
 * dusk, a rising one toward day, the dusk's own sound each frame, and a
 * firefly's chime as it flares.
 */
type DuskSound = Pick<MeadowSound, 'sink' | 'grow' | 'dusk' | 'glint'>;

/**
 * The light over the meadow: the backdrop relit (`relight`), the dusk wash
 * over everything under the HUD, the sun sinking and fading and the moon
 * rising in its place as it turns, the tap on either that turns it, and the
 * fireflies that wake at dusk (`FireflyView`).
 * Every level is set each frame from the meadow's `dusk` and the clock, so a
 * repaint never interrupts a turn. The sun's and its glow's alpha are the
 * rain view's, which reads `level`.
 */
export class DuskView {
  /**
   * Over the dusk wash and under the rain's drops: where everything that
   * glows at dusk is drawn — the moon, the lit windows, the fireflies — so
   * the wash dims the meadow and never its lights.
   */
  readonly glowDepth: number;
  /** How far toward dusk the meadow shows this frame (`duskness`), 0 to 1. */
  level = 0;
  /** The meadow's dusk as of this frame, and the depth the houses' lit windows are drawn at. */
  lights: Lights | undefined;
  private readonly wash: Phaser.GameObjects.Rectangle;
  /** The moon, with the clouds drifting past in front of it as they do the sun, though it stands over the wash. */
  private readonly moon: MoonView;
  private readonly camera: Phaser.Cameras.Scene2D.Camera;
  /** The scene's clock, in seconds. */
  private readonly now: () => number;
  private readonly dispatch: (action: Action) => void;
  private readonly sound: DuskSound;
  private readonly fireflies: FireflyView;
  private layout: MeadowLayout | undefined;
  private backdrop: Backdrop | undefined;
  /** Where each of the sun's columns was baked, before it sinks. */
  private sunRows: number[] = [];
  /** Which way the light was going at the last frame. */
  private toward: Dusk['toward'] = 'day';

  /** The wash lies at the rain's depth, two under `hudDepth`, so the two stack. */
  constructor(
    scene: Phaser.Scene,
    hudDepth: number,
    now: () => number,
    dispatch: (action: Action) => void,
    sound: DuskSound,
    ground: FireflyGround,
  ) {
    this.now = now;
    this.dispatch = dispatch;
    this.sound = sound;
    this.glowDepth = hudDepth - 1.5;
    this.camera = scene.cameras.main;
    this.wash = scene.add
      .rectangle(0, 0, 1, 1, PALETTE.duskWash)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(hudDepth - 2)
      .setAlpha(0);
    this.moon = new MoonView(scene, this.glowDepth);
    this.fireflies = new FireflyView(scene, this.glowDepth, now, ground, sound);
  }

  /** Lays the wash over `layout`'s screen, draws the moon at the sun's size and the fireflies at the insects', and takes the sun `backdrop` baked. */
  paint(layout: MeadowLayout, backdrop: Backdrop): void {
    this.layout = layout;
    this.backdrop = backdrop;
    this.wash.setSize(layout.width, layout.height);
    this.fireflies.paint(layout);
    this.sunRows = backdrop.sun.columns.map(({ y }) => y);
    this.moon.paint(layout.sun.r, this.camera.zoomX);
  }

  /** Sets the light for the frame at the scene's clock, as the meadow's `dusk` turns it. */
  update(dusk: Dusk | undefined): void {
    if (!dusk) return;
    this.toward = dusk.toward;
    const level = duskness(dusk, this.now() * 1000);
    this.level = level;
    this.lights = { dusk, depth: this.glowDepth };
    this.sound.dusk(level);
    const { backdrop, layout, wash, moon, sunRows, fireflies } = this;
    if (!backdrop || !layout) return;
    fireflies.update(level);
    backdrop.relight(level);
    wash.setAlpha(DUSK_WASH_DEEPEST * level).setVisible(level > 0);
    const { r } = layout.sun;
    for (const [index, column] of backdrop.sun.columns.entries()) {
      column.y = (sunRows[index] ?? column.y) + sunSunk(r, level);
    }
    for (const column of backdrop.wash.columns) column.setAlpha(1 - level);
    const sun = this.sunAt();
    const risen = sun && moonAt(sun, level);
    if (risen) {
      moon.show(risen, moonUp(level), cloudsOver(backdrop, layout, risen));
    }
  }

  /**
   * Turns the light if a tap at the camera's world point `{ x, y }` lands on
   * the sun, or the moon in its place, `within` its disc or its rays
   * (`onTheSun`); whether it did. The sun stands on the screen, which the
   * camera's `bob` scrolls the world past.
   */
  tap({ x, y }: Point, bob: number, within: 'disc' | 'rays'): boolean {
    const sun = this.sunAt();
    if (!sun || !onTheSun(sun, { x, y: y - bob }, within)) return false;
    this.dispatch({ kind: 'dusk', now: this.now() * 1000 });
    if (this.toward === 'day') this.sound.sink();
    else this.sound.grow();
    return true;
  }

  /** The sun's place on the screen as the view now shows it, before it sinks: where the moon stands risen and a tap turns the light. */
  sunAt(): Circle | undefined {
    const { layout, backdrop } = this;
    return layout && backdrop && sunOnScreen(backdrop.view, layout.sun);
  }
}

/**
 * The clouds on the screen that reach `moon` (`cloudOverMoon`), each as the
 * graphics showing it whole: the day's cloud until full dusk, which hides
 * it under its opaque dusk twin, then the twin.
 */
function cloudsOver(
  { clouds, duskClouds, level }: Backdrop,
  layout: MeadowLayout,
  moon: Circle,
): Phaser.GameObjects.Graphics[] {
  return clouds.flatMap((day, index) => {
    const cloud = layout.clouds[index];
    const twin = duskClouds[index];
    const shown = level < 1 ? day : twin;
    if (!day.visible || !cloud || !shown) return [];
    const { x } = day;
    return cloudOverMoon({ x, ...pick(cloud, 'y', 'r') }, moon) ? [shown] : [];
  });
}

/** Whether the page opens dark (`darkScheme`), read once as the meadow opens. */
export function schemeIsDark(): boolean {
  return darkScheme(
    document.documentElement.dataset['mantineColorScheme'],
    globalThis.matchMedia('(prefers-color-scheme: dark)').matches,
  );
}
