import type * as Phaser from 'phaser';

import { type Dusk, duskness } from '../../model/dusk';
import type { Action } from '../../model/game';
import type { Circle, Point } from '../../model/geometry';
import { darkScheme, moonAt, onTheSun, sunOnScreen, sunSunk } from './dusk-sky';
import type { MeadowLayout } from './layout';
import type { Backdrop } from './paint-backdrop';
import { drawMoon } from './paint-moon';
import { PALETTE } from './palette';
import type { MeadowSound } from './sound';
import { focusTwins, shade } from './twin-fade';

/** The dusk wash's alpha at full dusk. */
const DUSK_WASH_DEEPEST = 0.38;
/** The moon's outline, in CSS px. */
const MOON_INK = 1.5;

/** What the turning light asks of the meadow's sound: a sinking slide toward dusk, a rising one toward day. */
type DuskSound = Pick<MeadowSound, 'sink' | 'grow'>;

/**
 * The light over the meadow: the backdrop relit (`relight`), the dusk wash
 * over everything under the HUD, the sun sinking and fading and the moon
 * rising in its place as it turns, and the tap on either that turns it.
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
  private readonly wash: Phaser.GameObjects.Rectangle;
  /** The moon, drawn about its own origin and moved to where it stands. */
  private readonly moon: Phaser.GameObjects.Graphics;
  private readonly camera: Phaser.Cameras.Scene2D.Camera;
  /** The scene's clock, in seconds. */
  private readonly now: () => number;
  private readonly dispatch: (action: Action) => void;
  private readonly sound: DuskSound;
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
    this.moon = scene.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(this.glowDepth)
      .setAlpha(0)
      .enableFilters();
  }

  /** Lays the wash over `layout`'s screen, draws the moon at the sun's size and takes the sun `backdrop` baked. */
  paint(layout: MeadowLayout, backdrop: Backdrop): void {
    this.layout = layout;
    this.backdrop = backdrop;
    this.wash.setSize(layout.width, layout.height);
    this.sunRows = backdrop.sun.columns.map(({ y }) => y);
    const { r } = layout.sun;
    drawMoon(this.moon.clear(), { x: 0, y: 0, r }, MOON_INK);
    focusTwins([this.moon], this.camera);
  }

  /** Sets the light for the frame at the scene's clock, as the meadow's `dusk` turns it. */
  update(dusk: Dusk | undefined): void {
    if (!dusk) return;
    this.toward = dusk.toward;
    const level = duskness(dusk, this.now() * 1000);
    this.level = level;
    const { backdrop, layout, wash, moon, sunRows } = this;
    if (!backdrop || !layout) return;
    backdrop.relight(level);
    wash.setAlpha(DUSK_WASH_DEEPEST * level).setVisible(level > 0);
    const { r } = layout.sun;
    for (const [index, column] of backdrop.sun.columns.entries()) {
      column.y = (sunRows[index] ?? column.y) + sunSunk(r, level);
    }
    for (const column of backdrop.wash.columns) column.setAlpha(1 - level);
    const sun = this.sunAt();
    if (sun) moon.setPosition(sun.x, moonAt(sun, level).y);
    shade(moon, level);
  }

  /**
   * Turns the light if a tap at the camera's world point `{ x, y }` lands on
   * the sun, or the moon in its place; whether it did. The sun stands on the
   * screen, which the camera's `bob` scrolls the world past.
   */
  tap({ x, y }: Point, bob: number): boolean {
    const sun = this.sunAt();
    if (!sun || !onTheSun(sun, { x, y: y - bob })) return false;
    this.dispatch({ kind: 'dusk', now: this.now() * 1000 });
    if (this.toward === 'day') this.sound.sink();
    else this.sound.grow();
    return true;
  }

  /** The sun's place on the screen as the view now shows it, before it sinks. */
  private sunAt(): Circle | undefined {
    const { layout, backdrop } = this;
    return layout && backdrop && sunOnScreen(backdrop.view, layout.sun);
  }
}

/** Whether the page opens dark (`darkScheme`), read once as the meadow opens. */
export function schemeIsDark(): boolean {
  return darkScheme(
    document.documentElement.dataset['mantineColorScheme'],
    globalThis.matchMedia('(prefers-color-scheme: dark)').matches,
  );
}
