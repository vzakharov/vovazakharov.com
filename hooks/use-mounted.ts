import { useSyncExternalStore } from 'react';

function unsubscribe(): void {
  // The snapshot is constant, so there is no subscription to tear down.
}

const subscribe = () => unsubscribe;
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` through the server render and the hydrating render, `true` afterwards
 * — the guard theme-dependent UI needs so its markup matches on both sides.
 */
export function useMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
