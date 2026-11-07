import type { CanDispose } from '@/kernel/shared/typings';

import type { Intent, Vec2 } from '../model/eye';
import { groundPerScreen } from '../model/pose';

/** What the scene holds while the controls are bound. */
export type EyeControls =
  // `dispose` unbinds every listener and gives the element its touch action back.
  CanDispose & {
    /**
     * The intent since the last read: the keys held now, and the wheel, pinch
     * and drag that arrived meanwhile, which the read then clears. One read a
     * frame.
     */
    readonly read: () => Intent;
  };

/** Doublings of height per CSS pixel the wheel turns: a 100 px notch is half one. */
const WHEEL_DOUBLINGS_PER_PIXEL = 1 / 200;

/** CSS pixels in a wheel line, for wheels that count in lines. */
const LINE_PIXELS = 16;

/** Held keys by `KeyboardEvent.code`, so WASD holds on every layout. */
const STEERS: Readonly<Record<string, Vec2>> = {
  ArrowUp: [0, 1],
  ArrowDown: [0, -1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  KeyW: [0, 1],
  KeyS: [0, -1],
  KeyA: [-1, 0],
  KeyD: [1, 0],
};

const CLIMBS: Readonly<Record<string, number>> = {
  PageUp: 1,
  KeyE: 1,
  PageDown: -1,
  KeyQ: -1,
};

const clampUnit = (value: number) => Math.min(1, Math.max(-1, value));

/**
 * Binds the eye's controls: the wheel, a pinch and one-finger drag on
 * `element`, keys on its window. Spreading two fingers or scrolling up falls;
 * a drag moves the ground with the finger, so the eye moves the other way, as
 * far as the ground under the finger went at the eye's height, through the
 * field of view `poseOf` gives a screen of the element's shape.
 */
export function bindEyeControls(element: HTMLElement): EyeControls {
  const view = element.ownerDocument.defaultView ?? globalThis;
  const held = new Set<string>();
  /** Each finger down by pointer id, at its place on the screen in CSS px. */
  const pointers = new Map<number, Vec2>();
  let shift: Vec2 = [0, 0];
  let doublings = 0;

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
    if (!(event.code in STEERS) && !(event.code in CLIMBS)) return;
    event.preventDefault();
    held.add(event.code);
  };
  const onKeyUp = (event: KeyboardEvent) => {
    held.delete(event.code);
  };
  const onBlur = () => {
    held.clear();
    pointers.clear();
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
    if (pointers.size >= 2) return;
    element.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
  };
  const onPointerMove = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return;
    const before = centre();
    const apart = spread();
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
    const after = centre();
    follow(after[0] - before[0], after[1] - before[1]);
    const now = spread();
    if (apart > 0 && now > 0) doublings += Math.log2(apart / now);
  };
  const onPointerUp = (event: PointerEvent) => {
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
  // Not passive: the wheel would otherwise scroll or zoom the page.
  element.addEventListener('wheel', onWheel, { signal, passive: false });
  const touchAction = element.style.touchAction;
  element.style.touchAction = 'none';

  return {
    read: () => {
      let right = 0;
      let up = 0;
      let climb = 0;
      for (const code of held) {
        const steer = STEERS[code];
        if (steer) {
          right += steer[0];
          up += steer[1];
        }
        climb += CLIMBS[code] ?? 0;
      }
      const intent: Intent = {
        steer: [clampUnit(right), clampUnit(up)],
        climb: clampUnit(climb),
        shift,
        doublings,
      };
      shift = [0, 0];
      doublings = 0;
      return intent;
    },
    dispose: () => {
      bound.abort();
      element.style.touchAction = touchAction;
    },
  };
}
