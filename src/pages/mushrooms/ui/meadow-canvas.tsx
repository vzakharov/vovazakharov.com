'use client';

import { useEffect, useRef, useState } from 'react';

import classes from './mushrooms.module.scss';

/**
 * The element the game fills. Phaser is imported here, after mount, so it
 * reaches this route's client bundle alone and never the server render. A
 * failed load is rethrown while rendering, so it reaches the error boundary
 * instead of leaving a blank screen.
 */
export function MeadowCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [failure, setFailure] = useState<Error>();

  useEffect(() => {
    const parent = hostRef.current;
    if (!parent) return;
    let stop: (() => void) | undefined;
    let unmounted = false;
    import('./scene/start-game')
      .then(({ startGame }) => {
        if (!unmounted) stop = startGame(parent);
      })
      .catch((error: unknown) => {
        setFailure(error instanceof Error ? error : new Error(String(error)));
      });
    return () => {
      unmounted = true;
      stop?.();
    };
  }, []);

  if (failure) throw failure;
  return <div ref={hostRef} className={classes['meadow']} />;
}
