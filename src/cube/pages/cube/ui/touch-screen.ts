import { useSyncExternalStore } from 'react';

/** A screen worked by fingers alone: nothing hovers, the pointer is coarse. */
const TOUCH_SCREEN = '(hover: none) and (pointer: coarse)';

const subscribe = (onChange: () => void) => {
  const query = matchMedia(TOUCH_SCREEN);
  query.addEventListener('change', onChange);
  return () => {
    query.removeEventListener('change', onChange);
  };
};

/**
 * Whether the page is on a touch screen: false in the static HTML and through
 * hydration, so neither mismatches, and the device's answer from then on.
 */
export const useTouchScreen = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => matchMedia(TOUCH_SCREEN).matches,
    () => false,
  );
