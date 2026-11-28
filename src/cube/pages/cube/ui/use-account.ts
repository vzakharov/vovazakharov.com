import { useEffect, useRef, useSyncExternalStore } from 'react';

import {
  boot,
  give,
  type Held,
  heldNow,
  NOBODY,
  subscribe,
} from '@/cube/features/account';

import { installConsole } from './page-console';

/** What `cube.giveCubes()` gives when asked for no count. */
const GIFT = 1000;

const nobody = (): Held => NOBODY;

/**
 * The player's account on this page, and the console's `cube.giveCubes(n)`
 * and `cube.account()`, each calling `open` to show it. The static HTML and
 * hydration see nobody; the account boots in this hook's effect, which so runs
 * before the walk's effect reads the fragment a login link may carry.
 */
export function useAccount(open: () => void): Held {
  const held = useSyncExternalStore(subscribe, heldNow, nobody);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  });

  useEffect(() => {
    boot();
    const installed = installConsole({
      giveCubes: (count: unknown = GIFT) => {
        const balance = give(count);
        openRef.current();
        return balance ?? 'The cubes wait for you: make an account or log in.';
      },
      account: () => {
        openRef.current();
      },
    });
    return () => {
      installed.dispose();
    };
  }, []);

  return held;
}
