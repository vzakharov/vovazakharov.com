import type { CanDispose } from '@/kernel/shared/typings';

import { type Intent, shortest, type Vec2 } from '../model/eye';
import { groundPerScreen } from '../model/pose';

/** What the scene holds while the controls are bound. */
export type EyeControls =
  // `dispose` unbinds every listener and gives the element its touch action back.
  CanDispose & {
    /**
     * The intent since the last read: the keys held now, and the wheel, pinch,
     * drags and twist that arrived meanwhile, which the read then clears. One
     * read a frame.
     */
    readonly read: () => Intent;
  };

/** Doublings of height per CSS pixel the wheel turns: a 100 px notch is half one. */
const WHEEL_DOUBLINGS_PER_PIXEL = 1 / 200;

/** CSS pixels in a wheel line, for wheels that count in lines. */
const LINE_PIXELS = 16;

/** Radians a right-button drag across the element's whole width turns. */
const TURN_PER_WIDTH = Math.PI;

/** `MouseEvent.button` of the right button. */
const RIGHT_BUTTON = 2;

/** Held keys by `KeyboardEvent.code`, so WASD holds on every layout. */
const STEERS: Readonly<Record<string, Vec2>> = {
  KeyW: [0, 1],
  KeyS: [0, -1],
  KeyA: [-1, 0],
  KeyD: [1, 0],
};

const TURNS: Readonly<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowRight: 1,
};

const CLIMBS: Readonly<Record<string, number>> = {
  ArrowUp: 1,
  PageUp: 1,
  KeyE: 1,
  ArrowDown: -1,
  PageDown: -1,
  KeyQ: -1,
};

const BOUND = [STEERS, TURNS, CLIMBS];

/** The right button turns, so it opens no menu over the scene. */
const onContextMenu = (event: Event) => {
  event.preventDefault();
};

const clampUnit = (value: number) => Math.min(1, Math.max(-1, value));

/**
 * Binds the eye's controls: the wheel, drags, a pinch and a twist on
 * `element`, keys on its window. Spreading two fingers or scrolling up falls;
 * a drag moves the ground with the finger, so the eye moves the other way, as
 * far as the ground under the finger went at the eye's height, through the
 * field of view `poseOf` gives a screen of the element's shape. Two fingers
 * twisting turn the ground with them; a right-button drag turns the heading
 * the way it goes, as the arrow keys do.
 */
export function bindEyeControls(element: HTMLElement): EyeControls {
  const view = element.ownerDocument.defaultView ?? globalThis;
  const held = new Set<string>();
  /** Each finger down by pointer id, at its place on the screen in CSS px. */
  const pointers = new Map<number, Vec2>();
  /** The mouse pointer turning with its right button, at its last x in CSS px. */
  let turner: { id: number; x: number } | null = null;
  let shift: Vec2 = [0, 0];
  let doublings = 0;
  let twist = 0;

  /** Screen heights the finger moved, as the eye's own move in heights. */
  const follow = (dx: number, dy: number) => {
    const height = Math.max(1, element.clientHeight);
    const span = groundPerScreen(element.clientWidth / height) / height;
    shift = [shift[0] - dx * span, shift[1] + dy * span];
  };

  /** How far apart two fingers are; zero with fewer down. */
  const spread = () => {
    const [a, b] = [...pointers.values()];
    return a && b ? Math.hypot(a[0] - b[0], a[1] - b[1]) : 0;
  };

  /**
   * Which way the first finger lies from the second, clockwise on the screen
   * since its y runs down; null with fewer down.
   */
  const bearing = () => {
    const [a, b] = [...pointers.values()];
    return a && b ? Math.atan2(a[1] - b[1], a[0] - b[0]) : null;
  };

  /** The fingers' mean place on the screen, CSS px. */
  const centre = (): Vec2 => {
    const all = [...pointers.values()];
    const n = Math.max(1, all.length);
    return [
      all.reduce((s, p) => s + p[0], 0) / n,
      all.reduce((s, p) => s + p[1], 0) / n,
    ];
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (!BOUND.some((keys) => event.code in keys)) return;
    event.preventDefault();
    held.add(event.code);
  };
  const onKeyUp = (event: KeyboardEvent) => {
    held.delete(event.code);
  };
  const onBlur = () => {
    held.clear();
    pointers.clear();
    turner = null;
  };

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    const pixels =
      event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? event.deltaY * LINE_PIXELS
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? event.deltaY * element.clientHeight
          : event.deltaY;
    doublings += pixels * WHEEL_DOUBLINGS_PER_PIXEL;
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button === RIGHT_BUTTON) {
      element.setPointerCapture(event.pointerId);
      turner = { id: event.pointerId, x: event.clientX };
      return;
    }
    if (pointers.size >= 2) return;
    element.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
  };
  const onPointerMove = (event: PointerEvent) => {
    if (turner?.id === event.pointerId) {
      twist +=
        ((event.clientX - turner.x) * TURN_PER_WIDTH) /
        Math.max(1, element.clientWidth);
      turner = { id: event.pointerId, x: event.clientX };
      return;
    }
    if (!pointers.has(event.pointerId)) return;
    const before = centre();
    const apart = spread();
    const facing = bearing();
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
    const after = centre();
    follow(after[0] - before[0], after[1] - before[1]);
    const now = spread();
    if (apart > 0 && now > 0) doublings += Math.log2(apart / now);
    const faced = bearing();
    // The ground turns clockwise with the fingers, so the heading turns back.
    if (facing !== null && faced !== null) twist -= shortest(faced - facing);
  };
  const onPointerUp = (event: PointerEvent) => {
    if (turner?.id === event.pointerId) turner = null;
    pointers.delete(event.pointerId);
  };

  const bound = new AbortController();
  const { signal } = bound;
  view.addEventListener('keydown', onKeyDown, { signal });
  view.addEventListener('keyup', onKeyUp, { signal });
  view.addEventListener('blur', onBlur, { signal });
  element.addEventListener('pointerdown', onPointerDown, { signal });
  element.addEventListener('pointermove', onPointerMove, { signal });
  element.addEventListener('pointerup', onPointerUp, { signal });
  element.addEventListener('pointercancel', onPointerUp, { signal });
  element.addEventListener('contextmenu', onContextMenu, { signal });
  // Not passive: the wheel would otherwise scroll or zoom the page.
  element.addEventListener('wheel', onWheel, { signal, passive: false });
  const touchAction = element.style.touchAction;
  element.style.touchAction = 'none';

  return {
    read: () => {
      let right = 0;
      let up = 0;
      let climb = 0;
      let turn = 0;
      for (const code of held) {
        const steer = STEERS[code];
        if (steer) {
          right += steer[0];
          up += steer[1];
        }
        climb += CLIMBS[code] ?? 0;
        turn += TURNS[code] ?? 0;
      }
      const intent: Intent = {
        steer: [clampUnit(right), clampUnit(up)],
        climb: clampUnit(climb),
        turn: clampUnit(turn),
        shift,
        doublings,
        twist,
      };
      shift = [0, 0];
      doublings = 0;
      twist = 0;
      return intent;
    },
    dispose: () => {
      bound.abort();
      element.style.touchAction = touchAction;
    },
  };
}
