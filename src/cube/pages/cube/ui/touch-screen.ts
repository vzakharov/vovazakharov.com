import { useSyncExternalStore } from 'react';

/**
 * Whether the page is worked by fingers: what the last input was — a touch
 * says yes, a mouse press or a key no — and, before any, whether a coarse
 * pointer is at hand. Media queries alone misread some phones, which report
 * a hover they lack.
 */
let fingered: boolean | null = null;
const listeners = new Set<() => void>();

const set = (next: boolean) => {
  if (fingered === next) return;
  fingered = next;
  for (const listener of listeners) listener();
};

const onPointer = ({ pointerType }: PointerEvent) => {
  if (pointerType === 'touch') set(true);
  else if (pointerType === 'mouse') set(false);
};
const onKey = () => {
  set(false);
};

const subscribe = (onChange: () => void) => {
  if (listeners.size === 0) {
    globalThis.addEventListener('pointerdown', onPointer, { capture: true });
    globalThis.addEventListener('keydown', onKey, { capture: true });
  }
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
    if (listeners.size > 0) return;
    globalThis.removeEventListener('pointerdown', onPointer, { capture: true });
    globalThis.removeEventListener('keydown', onKey, { capture: true });
  };
};

const snapshot = (): boolean =>
  fingered ?? matchMedia('(any-pointer: coarse)').matches;

/** Whether the page is worked by fingers: false in the static HTML and through hydration. */
export const useTouchScreen = (): boolean =>
  useSyncExternalStore(subscribe, snapshot, () => false);
